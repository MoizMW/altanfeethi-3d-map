"""Fuse camera-photo depths in the G10 frame with provisional spatial constraints.

No authored furniture meshes are sampled. Model positions calibrate cameras and
depth scale; room planes constrain photographed floor/glazing/mirror regions.
Marching cubes extracts the common signed-distance surface, which is exported
as Gaussians with colors projected from the real source photos.
"""
import json
from pathlib import Path
import cv2
import numpy as np
from scipy.interpolate import RBFInterpolator
from scipy.ndimage import map_coordinates, gaussian_filter
from skimage.measure import marching_cubes
import runpy
export = runpy.run_path(str(Path(__file__).with_name('refine-g10-photos.py')))['export']

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'experiments/g10-gaussian'


def sample(a, uv):
    return map_coordinates(a.astype(np.float32), [uv[..., 1], uv[..., 0]], order=1, mode='nearest')


def region(shape, polygon):
    mask = np.zeros(shape, np.uint8)
    cv2.fillPoly(mask, [np.rint(np.array(polygon) * shape[1] / 1920).astype(np.int32)], 1)
    return mask.astype(bool)


floor_regions = {
    'B6': [[[72, 848], [157, 724], [205, 753], [188, 941]],
           [[610, 463], [645, 474], [641, 564], [601, 555]],
           [[1587, 617], [1712, 629], [1700, 750], [1571, 728]]],
    'B4': [[[402, 846], [602, 831], [640, 1018], [448, 1035]],
           [[731, 432], [780, 424], [802, 483], [748, 521]]],
    'B5': [[[1367, 581], [1510, 613], [1484, 691], [1361, 700]],
           [[1110, 952], [1226, 841], [1341, 820], [1248, 1009]]],
}

# Conservative photographed regions with a known planar boundary. Foreground
# furniture, plants and the divider are deliberately outside these masks.
wall_regions = {
    'B6': [(2, 2.7, [[450, 4], [766, 4], [734, 278], [604, 339], [446, 318]]),
           (2, 2.7, [[1220, 4], [1755, 4], [1710, 228], [1574, 220], [1566, 423], [1277, 381]]),
           (0, -3.3, [[1801, 3], [1919, 3], [1919, 1078], [1790, 1078], [1718, 468]])],
    'B4': [(0, -3.3, [[0, 0], [87, 0], [122, 470], [281, 1079], [0, 1079]])],
    'B5': [(0, 3.3, [[1810, 0], [1919, 0], [1919, 1079], [1702, 1079], [1660, 787]])],
}


def prepare_depths():
    raw = np.load(OUT / 'joint-reconstruction.npz')
    priors = json.loads((OUT / 'camera-priors.json').read_text())
    cameras = ['B6', 'B4', 'B5']
    h, w = raw['points_B6'].shape[:2]
    yy, xx = np.mgrid[:h, :w]
    pixel = np.stack([xx, yy], -1).astype(np.float32)
    views = []
    for i, c in enumerate(cameras):
        camera = priors['cameras'][c]
        pose = np.array(camera['pose'])
        focal = camera['focal'] * w / 1920
        old_pose = raw['poses'][i]
        depth = ((raw[f'points_{c}'] - old_pose[:3, 3]) @ old_pose[:3, :3])[..., 2]
        rays = np.stack([(xx - w / 2) / focal, (yy - h / 2) / focal, np.ones_like(xx)], -1)
        world_rays = rays @ pose[:3, :3].T
        floor_depth = -pose[1, 3] / np.minimum(world_rays[..., 1], -1e-5)
        uv, target, weights = [], [], []
        for observation in camera['observations'].values():
            uv.append(np.array(observation['pixel']) * w / 1920)
            target.append(((np.array(observation['fittedPosition']) - pose[:3, 3]) @ pose[:3, :3])[2])
            weights.append(1.)
        floor_mask = np.zeros((h, w), bool)
        for polygon in floor_regions[c]:
            mask = region((h, w), polygon)
            floor_mask |= mask
            y, x = np.where(mask)
            # Sparse floor anchors avoid overwhelming the furniture landmarks.
            for j in np.linspace(0, len(x)-1, 6).astype(int):
                uv.append([x[j], y[j]])
                target.append(floor_depth[y[j], x[j]])
                weights.append(.6)
        uv, target, weights = np.array(uv), np.array(target), np.array(weights)
        observed = sample(depth, uv)
        coef = np.linalg.lstsq(np.stack([observed, np.ones_like(observed)], -1) * weights[:, None], target * weights, rcond=None)[0]
        metric = coef[0] * depth + coef[1]
        correction = RBFInterpolator(uv / w, target - sample(metric, uv),
                                    kernel='thin_plate_spline', smoothing=.015)
        metric += correction(pixel.reshape(-1, 2) / w).reshape(h, w)
        metric[floor_mask] = floor_depth[floor_mask]
        # Replace reflected/through-glass depth with the observed boundary plane.
        for axis, value, polygon in wall_regions[c]:
            mask = region((h, w), polygon)
            intersection = (value - pose[axis, 3]) / (world_rays[..., axis] + 1e-9)
            valid = mask & (intersection > .2) & (intersection < 15)
            metric[valid] = intersection[valid]
        metric = cv2.bilateralFilter(metric.astype(np.float32), 5, .04, 1.5)
        image = cv2.cvtColor(cv2.imread(str(ROOT / 'evidence/wide capture snapshots' / f'{c}.jpg')), cv2.COLOR_BGR2RGB).astype(np.float32) / 255
        views.append(dict(camera=c, pose=pose, focal=focal, depth=metric, image=image))
        print(c, 'depth scale', coef, 'depth range', np.percentile(metric, [1, 50, 99]), flush=True)
    return views, priors


def project(xyz, view):
    local = (xyz - view['pose'][:3, 3]) @ view['pose'][:3, :3]
    z = local[..., 2]
    uv = local[..., :2] / np.maximum(z[..., None], 1e-5) * view['focal'] + [256, 144]
    inside = (z > .1) & (uv[..., 0] > 1) & (uv[..., 0] < 510) & (uv[..., 1] > 1) & (uv[..., 1] < 286)
    return uv, z, inside


def main():
    views, priors = prepare_depths()
    step, trunc = .025, .10
    minimum, maximum = np.array([-3.3, -.05, -2.7]), np.array([3.3, 3.25, 2.7])
    axes = [np.arange(lo, hi + step / 2, step) for lo, hi in zip(minimum, maximum)]
    shape = tuple(map(len, axes))
    volume = np.ones(shape, np.float32)
    observed_volume = np.zeros(shape, bool)
    for start in range(0, shape[0], 8):
        grid = np.stack(np.meshgrid(axes[0][start:start+8], axes[1], axes[2], indexing='ij'), -1)
        flat = grid.reshape(-1, 3)
        numerator, denominator = np.zeros(len(flat)), np.zeros(len(flat))
        near_surface = np.zeros(len(flat), bool)
        for view in views:
            uv, z, valid = project(flat, view)
            sdf = sample(view['depth'], uv) - z
            # Free space is positive; only integrate a short distance behind a
            # measured surface. This is a shared volume, not three photo sheets.
            near_surface |= valid & (np.abs(sdf) < trunc)
            valid &= sdf > -trunc
            weight = valid.astype(np.float32)
            numerator += np.clip(sdf / trunc, -1, 1) * weight
            denominator += weight
        fused = numerator / np.maximum(denominator, 1)
        fused[denominator == 0] = 1
        # Planar floor prior is used only in camera-observed regions.
        floor = (flat[:, 1] < .04) & (denominator > 0)
        fused[floor] = flat[floor, 1] / trunc
        volume[start:start+8] = fused.reshape(grid.shape[:-1])
        observed_volume[start:start+8] = near_surface.reshape(grid.shape[:-1])
    print('Extracting fused surfaces', shape, flush=True)
    vertices, faces, normals, _ = marching_cubes(volume, 0, spacing=(step, step, step),
                                                mask=observed_volume, allow_degenerate=False)
    positions = vertices + minimum
    # Surface extraction normals have consistent local direction; photo color is
    # chosen from the camera that best observes that same depth, avoiding blends
    # between mismatched foreground and background pixels.
    scores, colors = [], []
    for view in views:
        uv, z, valid = project(positions, view)
        discrepancy = np.abs(sample(view['depth'], uv) - z)
        direction = view['pose'][:3, 3] - positions
        distance = np.linalg.norm(direction, axis=-1)
        direction /= distance[:, None]
        facing = np.abs((normals * direction).sum(-1))
        score = np.exp(-discrepancy**2 / (.08**2)) * (.15 + facing) / np.maximum(distance, 1)
        score[~valid | (discrepancy > .20)] = 0
        photo_uv = (uv + .5) * 1920 / 512 - .5
        color = np.stack([sample(view['image'][..., channel], photo_uv) for channel in range(3)], -1)
        scores.append(score)
        colors.append(color)
    scores, colors = np.array(scores), np.array(colors)
    owner = scores.argmax(0)
    valid = scores.max(0) > .008
    color = colors[owner, np.arange(len(positions))]
    positions, normals, color, owner = positions[valid], normals[valid], color[valid], owner[valid]
    from scipy.spatial.transform import Rotation
    helper = np.tile([0., 1, 0], (len(normals), 1))
    helper[np.abs(normals[:, 1]) > .9] = [1, 0, 0]
    tangent = np.cross(helper, normals)
    tangent /= np.linalg.norm(tangent, axis=1)[:, None]
    bitangent = np.cross(normals, tangent)
    quaternion = Rotation.from_matrix(np.stack([tangent, bitangent, normals], -1)).as_quat()
    scales = np.tile([step * .72, step * .72, step * .12], (len(positions), 1))
    export(OUT / 'G10-constrained', positions, scales, quaternion, np.clip(color, 0, 1), np.full(len(positions), .96))
    old = json.loads((OUT / 'joint-report.json').read_text())
    report = dict(old)
    report.update(method='Photo-depth fusion with soft object landmarks, provisional camera calibration and room-plane constraints',
                  status='awaiting-novel-view-review', authoredGeometryUsed=False,
                  authoredPositionPriorsUsed=True, coordinateFrame='g10-local', refinementVersion=3,
                  cameras=[v['camera'] for v in views], poses=[v['pose'].tolist() for v in views],
                  focals=[[v['focal']] for v in views], splats=len(positions),
                  pointsPerCamera=[int((owner == i).sum()) for i in range(3)],
                  pointsPerCameraStage='final surface color owner; geometry fused from all views',
                  target=[0, .9, 0], bounds=[minimum.tolist(), maximum.tolist()],
                  framingBounds=[minimum.tolist(), maximum.tolist()], units='provisional G10 model units',
                  voxelSize=step, depthTruncation=trunc,
                  cameraFitRmsPixels={c: p['rmsPixels'] for c, p in priors['cameras'].items()},
                  validationNotes=['Pending novel-view evaluation; fitted landmarks are not independent validation'],
                  refinementNotes=['Furniture meshes were not sampled or converted',
                                   'Authored object positions are soft priors for camera and depth calibration',
                                   'Floor and selected glass/mirror pixels are constrained to provisional room planes',
                                   'Background beyond the local block envelope is excluded',
                                   'Common-volume surface extraction merges the camera depths before Gaussian export'])
    (OUT / 'constrained-report.json').write_text(json.dumps(report, indent=2) + '\n')
    np.savez_compressed(OUT / 'constrained-depths.npz', **{v['camera']: v['depth'] for v in views})
    print('Fused splats:', len(positions), 'color contributions:', report['pointsPerCamera'], flush=True)


if __name__ == '__main__':
    main()
