"""Refine the saved joint photographic reconstruction, without authored geometry.

Retain the joint camera poses. Recover conservative low-confidence surfaces,
check them against other cameras, and resample depth with original-photo color.
This is surface refinement, not photometric 3DGS training or new measured depth.
"""
import argparse
import hashlib
import json
from pathlib import Path

import cv2
import numpy as np
from scipy.ndimage import gaussian_filter, map_coordinates
from scipy.spatial.transform import Rotation

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'experiments/g10-gaussian'


def sample(array, u, v, order=1):
    return map_coordinates(array.astype(np.float32), [v, u], order=order, mode='nearest')


def export(destination, positions, scales, quaternions, colors, alpha):
    n = len(positions)
    q = quaternions[:, [3, 0, 1, 2]]
    packed = np.zeros(n, dtype=[('p', '<f4', 3), ('s', '<f4', 3),
                                ('rgba', 'u1', 4), ('q', 'u1', 4)])
    packed['p'], packed['s'] = positions, scales
    packed['rgba'][:, :3] = np.rint(colors * 255).astype('u1')
    packed['rgba'][:, 3] = np.rint(alpha * 255).astype('u1')
    packed['q'] = np.clip(np.rint(q * 128 + 128), 0, 255).astype('u1')
    destination.with_suffix('.splat').write_bytes(packed.tobytes())
    names = 'x y z nx ny nz f_dc_0 f_dc_1 f_dc_2 opacity scale_0 scale_1 scale_2 rot_0 rot_1 rot_2 rot_3'.split()
    ply = np.zeros((n, 17), dtype='<f4')
    ply[:, :3] = positions
    ply[:, 6:9] = (colors - .5) / .28209479177387814
    ply[:, 9] = np.log(alpha / (1 - alpha))
    ply[:, 10:13] = np.log(scales)
    ply[:, 13:17] = q
    header = ('ply\nformat binary_little_endian 1.0\n'
              'comment Refined joint photographic Gaussian surfaces; not trained 3DGS\n'
              f'element vertex {n}\n' + ''.join(f'property float {s}\n' for s in names) + 'end_header\n')
    destination.with_suffix('.ply').write_bytes(header.encode() + ply.tobytes())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--width', type=int, default=1024)
    parser.add_argument('--output', type=Path, default=OUT / 'G10-photo')
    args = parser.parse_args()
    if not 512 <= args.width <= 1920:
        parser.error('--width must be between 512 and the original photograph width, 1920')
    data = np.load(OUT / 'joint-reconstruction.npz')
    report = json.loads((OUT / 'joint-report.json').read_text())
    cameras = report['cameras']
    poses, focals = data['poses'], data['focals'].ravel()
    height, width = data['points_B6'].shape[:2]
    depths, masks, images = [], [], []
    for i, c in enumerate(cameras):
        path = ROOT / 'evidence/wide capture snapshots' / f'{c}.jpg'
        assert hashlib.sha256(path.read_bytes()).hexdigest() == report['sourceHashes'][c]
        image = cv2.cvtColor(cv2.imread(str(path)), cv2.COLOR_BGR2RGB).astype(np.float32) / 255
        assert image.shape[1] / image.shape[0] == width / height, 'Input crop must match depth map'
        images.append(image)
        local = (data[f'points_{c}'] - poses[i, :3, 3]) @ poses[i, :3, :3]
        depth = local[..., 2].astype(np.float32)
        # Suppress small depth noise without smoothing across large depth changes.
        smooth = cv2.bilateralFilter(depth, 5, float(np.median(depth) * .015), 1.5)
        depths.append(smooth)
        masks.append(data[f'mask_{c}'])

    scale = args.width / width
    h, w = round(height * scale), args.width
    yy, xx = np.mgrid[:h, :w].astype(np.float32)
    u, v = (xx + .5) / scale - .5, (yy + .5) / scale - .5
    transform = np.diag([1, -1, -1, 1]) @ np.linalg.inv(poses[0])
    arrays = [[] for _ in range(5)]
    contributions, recovered = [], []
    for i, c in enumerate(cameras):
        depth = sample(depths[i], u, v)
        nearest = sample(depths[i], u, v, 0)
        # Do not interpolate a curtain of geometry between foreground/background.
        discontinuity = np.abs(depth - nearest) > nearest * .025
        depth[discontinuity] = nearest[discontinuity]
        local = np.stack([(u - width / 2) * depth / focals[i],
                          (v - height / 2) * depth / focals[i], depth], -1)
        world = local @ poses[i, :3, :3].T + poses[i, :3, 3]
        trusted = sample(masks[i], u, v, 0) > .5
        valid = np.isfinite(world).all(-1) & (depth > 0)
        source_color = cv2.resize(images[i], (w, h), interpolation=cv2.INTER_AREA)
        conflicts = np.zeros((h, w), bool)
        support = np.zeros((h, w), np.float32)
        for j in range(len(cameras)):
            if i == j:
                continue
            other = (world - poses[j, :3, 3]) @ poses[j, :3, :3]
            z = np.maximum(other[..., 2], 1e-6)
            pu = other[..., 0] / z * focals[j] + width / 2
            pv = other[..., 1] / z * focals[j] + height / 2
            inside = (other[..., 2] > 0) & (pu >= 1) & (pu < width - 2) & (pv >= 1) & (pv < height - 2)
            observed = sample(depths[j], pu, pv)
            certain = sample(masks[j], pu, pv, 0) > .5
            relative = (z - observed) / observed
            # A surface well in front of another camera's confident observation
            # contradicts free space. Behind that observation it can be occluded.
            conflicts |= inside & certain & (relative < -.05)
            support += inside & (np.abs(relative) < .035)
        valid &= ~conflicts | trusted
        confidence = gaussian_filter(trusted.astype(np.float32), 1.5)
        alpha = np.clip(.72 + .24 * confidence + .02 * support, .72, .98)
        # Recovered geometry is estimated from the saved dense map, not inpainted.
        pts = world @ transform[:3, :3].T + transform[:3, 3]
        # Choose a same-surface one-sided tangent at silhouettes. A centered
        # difference spans foreground and background and leaves a dark outline.
        right = np.roll(pts, -1, axis=1) - pts
        left = pts - np.roll(pts, 1, axis=1)
        down = np.roll(pts, -1, axis=0) - pts
        up = pts - np.roll(pts, 1, axis=0)
        dx = np.where((np.linalg.norm(right, axis=-1) < np.linalg.norm(left, axis=-1))[..., None], right, left)
        dy = np.where((np.linalg.norm(down, axis=-1) < np.linalg.norm(up, axis=-1))[..., None], down, up)
        sx, sy = np.linalg.norm(dx, axis=-1), np.linalg.norm(dy, axis=-1)
        normal = np.cross(dx, -dy)
        norm = np.linalg.norm(normal, axis=-1)
        t = dx / np.maximum(sx[..., None], 1e-9)
        normal /= np.maximum(norm[..., None], 1e-9)
        bt = np.cross(normal, t)
        # Cap footprints near silhouettes instead of extending elongated splats.
        footprint = depth / (focals[i] * scale)
        valid &= (norm > 1e-12) & (sx < footprint * 8) & (sy < footprint * 8)
        valid[[0, -1], :] = False
        valid[:, [0, -1]] = False
        scales = np.stack([np.minimum(sx, footprint * 2.5) * .7,
                           np.minimum(sy, footprint * 2.5) * .7,
                           footprint * .10], -1)
        q = Rotation.from_matrix(np.stack([t, bt, normal], -1)[valid]).as_quat()
        for bucket, values in zip(arrays, [pts[valid], scales[valid], q, source_color[valid], alpha[valid]]):
            bucket.append(values)
        contributions.append(int(valid.sum()))
        recovered.append(int((valid & ~trusted).sum()))
        print(c, 'samples', contributions[-1], 'recovered', recovered[-1], flush=True)

    values = [np.concatenate(a).astype(np.float32) for a in arrays]
    assert all(np.isfinite(a).all() for a in values)
    assert (values[1] > 0).all()
    export(args.output, *values)
    report.update(method='DUSt3R joint reconstruction with edge-preserving depth resampling and cross-camera free-space checks',
                  status='refined-awaiting-visual-validation', splats=len(values[0]),
                  pointsPerCamera=contributions, pointsPerCameraStage='final exported records',
                  recoveredSamplesPerCamera=recovered, colorResolution=[w, h],
                  depthResolution=[width, height], refinementVersion=2,
                  bounds=[values[0].min(0).tolist(), values[0].max(0).tolist()],
                  framingBounds=report.get('framingBounds', report['bounds']),
                  refinementNotes=['Original photographs supply higher-resolution color; no generated textures',
                                   'Joint poses unchanged; interpolated geometry does not add measured depth',
                                   'Low-confidence surfaces retained only without confident free-space conflicts',
                                   'Bilateral depth filtering, one-sided surface tangents and capped footprints reduce stretched edges'],
                  validationNotes=['Awaiting comparison with the previous export'])
    report_path = OUT / 'joint-report.json' if args.output == OUT / 'G10-photo' else args.output.with_suffix('.json')
    report_path.write_text(json.dumps(report, indent=2) + '\n')
    print('Exported', len(values[0]), 'splats', flush=True)


if __name__ == '__main__':
    main()
