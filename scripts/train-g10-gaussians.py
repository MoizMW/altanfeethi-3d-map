"""Photometrically optimize one shared G10 Gaussian scene on the local GPU.

Inputs: real B4/B5/B6 wide photos, provisional camera/position priors, dense depths.
Furniture meshes are not sampled. Training-view scores are not novel-view proof.
"""
import argparse
import json
import runpy
import time
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from scipy.spatial.transform import Rotation
from scipy.ndimage import map_coordinates
from gsplat import rasterization

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'experiments/g10-gaussian'
export = runpy.run_path(str(Path(__file__).with_name('refine-g10-photos.py')))['export']


def ssim(x, y):
    x, y = x.permute(0, 3, 1, 2), y.permute(0, 3, 1, 2)
    mean_x, mean_y = F.avg_pool2d(x, 7, 1, 3), F.avg_pool2d(y, 7, 1, 3)
    var_x = F.avg_pool2d(x*x, 7, 1, 3) - mean_x**2
    var_y = F.avg_pool2d(y*y, 7, 1, 3) - mean_y**2
    cov = F.avg_pool2d(x*y, 7, 1, 3) - mean_x*mean_y
    return ((2*mean_x*mean_y+.01**2)*(2*cov+.03**2) /
            ((mean_x**2+mean_y**2+.01**2)*(var_x+var_y+.03**2))).mean()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--steps', type=int, default=4500)
    parser.add_argument('--depths', type=Path, default=OUT/'constrained-depths.npz')
    parser.add_argument('--name', default='G10-trained')
    parser.add_argument('--core', action='store_true', help='Use reviewed seating-area masks and a planar floor prior')
    parser.add_argument('--surface', action='store_true', help='Initialize thin Gaussians along the inferred photo surfaces')
    parser.add_argument('--consistency', action='store_true', help='Reject initial points contradicting another camera\'s visible free space')
    args = parser.parse_args()
    assert torch.cuda.is_available(), 'A working CUDA GPU is required'
    torch.set_num_threads(4)
    torch.manual_seed(10)
    rng = np.random.default_rng(10)
    priors = json.loads((OUT/'camera-priors.json').read_text())
    depth_data = np.load(args.depths)
    cameras = ['B6', 'B4', 'B5']
    positions, colors, normals = [], [], []
    views, intrinsics, targets, masks = [], [], [], []
    h, w = depth_data['B6'].shape
    core_regions = {
        'B6': [[35,1080],[160,705],[325,590],[335,385],[430,320],[575,350],[620,465],
               [766,438],[810,220],[870,150],[1090,150],[1180,430],[1300,460],
               [1365,410],[1515,430],[1575,695],[1685,1080]],
        'B4': [[230,1080],[310,810],[390,610],[420,430],[530,380],[680,410],[752,510],
               [850,490],[880,400],[890,110],[1040,10],[1135,90],[1160,25],[1630,173],
               [1660,290],[1820,270],[1919,540],[1880,1080]],
        'B5': [[0,1080],[0,280],[130,175],[570,0],[780,0],[905,315],[912,435],
               [1030,410],[1090,345],[1260,345],[1345,430],[1360,690],[1380,1080]],
    }
    yy, xx = np.mgrid[:h, :w]
    for c in cameras:
        camera = priors['cameras'][c]
        pose = np.array(camera['pose'])
        focal = camera['focal'] * w / 1920
        depth = depth_data[c]
        local = np.stack([(xx-w/2)*depth/focal, (yy-h/2)*depth/focal, depth], -1)
        world = local @ pose[:3, :3].T + pose[:3, 3]
        source = cv2.cvtColor(cv2.imread(str(ROOT/'evidence/wide capture snapshots'/f'{c}.jpg')), cv2.COLOR_BGR2RGB)
        source = cv2.resize(source, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32)/255
        valid = np.isfinite(world).all(-1) & (np.abs(world[..., 0]) < 3.35) & (np.abs(world[..., 2]) < 2.75)
        valid &= (world[..., 1] > -.08) & (world[..., 1] < 3.3) & (depth > .2)
        # Exclude silhouettes from supervising a different, occluded surface.
        mask = cv2.erode(valid.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
        if args.core:
            mask = np.zeros((h,w), np.uint8)
            cv2.fillPoly(mask, [np.rint(np.array(core_regions[c])*w/1920).astype(np.int32)], 1)
            mask = mask.astype(bool)
            valid &= mask & (np.abs(world[...,0])<2.85) & (np.abs(world[...,2])<2.4) & (world[...,1]<2.7)
            # The planar floor is initialized separately, instead of retaining
            # incompatible floor-depth sheets from the three input cameras.
            valid &= world[...,1]>.12
        positions.append(world[valid])
        colors.append(source[valid])
        dy, dx = np.gradient(world, axis=(0, 1))
        normal = np.cross(dx, dy)
        normal /= np.maximum(np.linalg.norm(normal, axis=-1, keepdims=True), 1e-8)
        normals.append(normal[valid])
        views.append(np.linalg.inv(pose))
        intrinsics.append([[focal, 0, w/2], [0, focal, h/2], [0, 0, 1]])
        targets.append(source)
        masks.append(mask)
    if args.consistency:
        for source_index in range(len(cameras)):
            xyz=positions[source_index]
            conflict=np.zeros(len(xyz),bool)
            for other_index,c in enumerate(cameras):
                if other_index==source_index:
                    continue
                view=views[other_index]
                local=xyz@view[:3,:3].T+view[:3,3]
                uv=local[:,:2]/np.maximum(local[:,2:3],1e-5)*intrinsics[other_index][0][0]+[w/2,h/2]
                coordinates=[uv[:,1],uv[:,0]]
                observed=map_coordinates(depth_data[c],coordinates,order=1,mode='constant',cval=0)
                inside=map_coordinates(masks[other_index].astype(np.uint8),coordinates,order=0,mode='constant',cval=0)>0
                reliable=inside&(observed>.2)&(local[:,2]>.1)
                spread_key=c+'_pairDepthSpread'
                if spread_key in depth_data:
                    spread=map_coordinates(depth_data[spread_key],coordinates,order=1,mode='constant',cval=0)
                    reliable&=spread<.3
                # Behind another surface means occluded, not incorrect. Only
                # points in its predicted visible free space are contradictory.
                conflict|=reliable&(local[:,2]<observed-.22)
            keep=~conflict
            positions[source_index]=xyz[keep]
            colors[source_index]=colors[source_index][keep]
            normals[source_index]=normals[source_index][keep]
            print(cameras[source_index],'free-space filtering',len(xyz),'->',int(keep.sum()),flush=True)
    xyz, rgb, normal = np.concatenate(positions), np.concatenate(colors), np.concatenate(normals)
    if args.core:
        fx,fz=np.meshgrid(np.arange(-2.8,2.81,.025),np.arange(-2.35,2.36,.025))
        floor=np.stack([fx.ravel(),np.zeros(fx.size),fz.ravel()],-1)
        xyz=np.concatenate([xyz,floor])
        # Neutral initial floor color is subsequently fitted to the real photos.
        rgb=np.concatenate([rgb,np.tile([.30,.29,.27],(len(floor),1))])
        normal=np.concatenate([normal,np.tile([0.,1.,0.],(len(floor),1))])
    cells, inverse = np.unique(np.rint(xyz/.022).astype(np.int32), axis=0, return_inverse=True)
    n = len(cells)
    count = np.bincount(inverse)
    xyz = np.stack([np.bincount(inverse, weights=xyz[:, j])/count for j in range(3)], -1)
    rgb = np.stack([np.bincount(inverse, weights=rgb[:, j])/count for j in range(3)], -1)
    normal = np.stack([np.bincount(inverse, weights=normal[:, j])/count for j in range(3)], -1)
    if n > 230000:
        keep = rng.choice(n, 230000, replace=False)
        xyz, rgb, normal = xyz[keep], rgb[keep], normal[keep]
        n = len(xyz)
    device = 'cuda'
    tensor = lambda x: torch.as_tensor(np.asarray(x), dtype=torch.float32, device=device)
    initial = tensor(xyz)
    initial_color = tensor(rgb)
    floor_flags = initial[:,1] < .02 if args.core else torch.zeros(n,device=device,dtype=torch.bool)
    means = torch.nn.Parameter(initial.clone())
    quats = torch.nn.Parameter(tensor(np.tile([1., 0, 0, 0], (n, 1))))
    scales = torch.nn.Parameter(torch.full((n, 3), np.log(.025), device=device))
    if args.surface:
        lengths=np.linalg.norm(normal,axis=-1)
        normal[lengths<1e-6]=[0,1,0]
        normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
        axis=np.cross(np.tile([0.,0.,1.],(n,1)),normal)
        axis_length=np.linalg.norm(axis,axis=-1)
        axis[axis_length<1e-6]=[1,0,0]
        axis/=np.linalg.norm(axis,axis=-1,keepdims=True)
        rotation=Rotation.from_rotvec(axis*np.arccos(normal[:,2].clip(-1,1))[:,None]).as_quat()[:,[3,0,1,2]]
        with torch.no_grad():
            quats.copy_(tensor(rotation))
            scales[:,2]=np.log(.004)
    opacity = torch.nn.Parameter(torch.full((n,), 1.4, device=device))
    color = torch.nn.Parameter(torch.logit(tensor(rgb).clamp(.01, .99)))
    viewmats, ks, images, mask = tensor(views), tensor(intrinsics), tensor(targets), tensor(masks)[..., None]
    opt = torch.optim.Adam([{'params': [means], 'lr': .0012},
                            {'params': [quats], 'lr': .001},
                            {'params': [scales], 'lr': .003},
                            {'params': [opacity], 'lr': .03},
                            {'params': [color], 'lr': .025}], eps=1e-15)
    history, started = [], time.time()

    def render(index):
        return rasterization(means, quats, scales.exp(), opacity.sigmoid(), color.sigmoid(),
                             viewmats[index:index+1], ks[index:index+1], w, h,
                             packed=False, near_plane=.1, far_plane=25,
                             backgrounds=torch.full((1, 3), .08, device=device))[:2]

    def evaluate(tag):
        metrics = {}
        with torch.no_grad():
            for i, c in enumerate(cameras):
                rendered, alpha = render(i)
                error = (((rendered-images[i:i+1])**2)*mask[i:i+1]).sum() / (mask[i].sum()*3)
                metrics[c] = {'maskedTrainingPSNR': float(-10*torch.log10(error)),
                              'meanMaskedAlpha': float((alpha*mask[i:i+1]).sum()/mask[i].sum())}
                image = (rendered[0].clamp(0, 1).cpu().numpy()*255).astype(np.uint8)
                cv2.imwrite(str(OUT/f'{args.name}-{tag}-{c}.jpg'), cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
        return metrics

    before = evaluate('before')
    print('Training', n, 'shared Gaussians', before, flush=True)
    for step in range(args.steps):
        i = step % 3
        rendered, alpha = render(i)
        weight = mask[i:i+1]
        target = images[i:i+1]
        l1 = ((rendered-target).abs()*weight).sum()/(weight.sum()*3)
        # Fill outside-mask pixels with the target for SSIM; they do not drive
        # geometry into photographed neighboring rooms or reflected objects.
        structure = 1-ssim(rendered*weight+target*(1-weight), target)
        coverage = ((1-alpha)*weight).sum()/weight.sum()
        outside = (alpha*(1-weight)).mean() if args.core else 0
        drift = ((means-initial)**2).mean()
        # Small regularizers restrain floating splats and very large ellipsoids.
        loss = (.8*l1 + .2*structure + .03*coverage + .12*outside + .03*drift
                + .002*scales.exp().mean() + .003*((color.sigmoid()-initial_color)**2).mean())
        loss.backward()
        opt.step()
        opt.zero_grad(set_to_none=True)
        with torch.no_grad():
            scales.clamp_(np.log(.004), np.log(.10))
            means[:, 0].clamp_(-3.35, 3.35)
            means[:, 1].clamp_(-.03, 3.3)
            means[:, 2].clamp_(-2.75, 2.75)
            opacity.clamp_(-6, 6)
            if args.core:
                means.copy_(torch.maximum(torch.minimum(means,initial+.20),initial-.20))
                means[floor_flags,1]=0
                scales[floor_flags,1]=np.log(.003)
                quats[floor_flags]=torch.tensor([1.,0,0,0],device=device)
                scales.clamp_(max=np.log(.065))
                lower=torch.logit((initial_color-.16).clamp(.005,.995))
                upper=torch.logit((initial_color+.16).clamp(.005,.995))
                bounded=torch.maximum(torch.minimum(color,upper),lower)
                color[~floor_flags]=bounded[~floor_flags]
                # Avoid elongated ellipsoids that fit one camera by becoming
                # streaks from another. Flat floor splats are a separate prior.
                if args.surface:
                    scales[~floor_flags,2]=scales[~floor_flags,2].clamp(max=np.log(.012))
                else:
                    low=scales.max(dim=-1,keepdim=True).values-np.log(4.)
                    scales[~floor_flags]=torch.maximum(scales,low)[~floor_flags]
        if step % 250 == 0 or step == args.steps-1:
            record = {'step': step, 'loss': float(loss.detach()), 'l1': float(l1.detach()), 'elapsedSeconds': round(time.time()-started, 1)}
            history.append(record)
            print(record, flush=True)
        if step == args.steps*2//3:
            for group in opt.param_groups:
                group['lr'] *= .3
    after = evaluate('after')
    with torch.no_grad():
        keep = opacity.sigmoid() > .12
        p = means[keep].cpu().numpy()
        s = scales[keep].exp().cpu().numpy()
        q = F.normalize(quats[keep], dim=-1).cpu().numpy()[:, [1, 2, 3, 0]]
        c = color[keep].sigmoid().cpu().numpy()
        a = opacity[keep].sigmoid().cpu().numpy()
    export(OUT/args.name, p, s, q, c, a)
    torch.save({'means': means.detach().cpu(), 'scales': scales.detach().cpu(),
                'quats': quats.detach().cpu(), 'opacity': opacity.detach().cpu(),
                'color': color.detach().cpu(), 'viewmats': viewmats.cpu(), 'Ks': ks.cpu()}, OUT/f'{args.name}.pt')
    report = json.loads((OUT/'constrained-report.json').read_text())
    report.update(method='Joint GPU Gaussian optimization from photo depths, estimated cameras and soft layout priors',
                  status='trained-awaiting-novel-view-validation', photometricallyTrained3DGS=True,
                  splats=len(p), refinementVersion=4, trainingSteps=args.steps,
                  gaussianSourceContributions=[len(p) for p in positions],
                  pointsPerCameraStage='pre-fusion initialization; all Gaussians then shared across views',
                  pointsPerCamera=[len(p) for p in positions], trainingBefore=before, trainingAfter=after,
                  trainingHistory=history, trainingDevice=torch.cuda.get_device_name(0),
                  trainingDepthSource=str(args.depths.relative_to(ROOT)),
                  seatingAreaMasks=core_regions if args.core else None, planarFloorPrior=args.core,
                  authoredGeometryUsed=True, authoredFurnitureMeshesSampled=False,
                  authoredPositionPriorsUsed=True, roomPlanePriorsUsed=True,
                  surfaceAlignedInitialization=args.surface,
                  multiViewFreeSpaceFilter=args.consistency,
                  validationNotes=['Training-image metrics are not independent validation of novel views',
                                   'All parameters optimize against all three photos in one shared scene'])
    (OUT/f'{args.name}-report.json').write_text(json.dumps(report, indent=2)+'\n')
    print('Finished', len(p), 'Gaussians:', after, flush=True)


if __name__ == '__main__':
    main()
