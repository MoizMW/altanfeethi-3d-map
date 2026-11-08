"""Run official Pow3R with G10's provisional camera and sparse depth priors.

The priors come from photographed landmarks and the existing layout. They are
estimated constraints, not a measured camera survey. Real photos remain inputs.
"""
import argparse
import gc
import hashlib
import json
import runpy
import sys
from pathlib import Path

import cv2
import numpy as np
import torch

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'experiments/g10-gaussian'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, required=True)
    parser.add_argument('--checkpoint', type=Path, required=True)
    args = parser.parse_args()
    sys.path.insert(0, str(args.repo))
    from pow3r.model.inference import BaseResolver
    from dust3r.utils.image import load_images
    assert torch.cuda.is_available()
    torch.set_num_threads(4)
    torch.manual_seed(10)
    np.random.seed(10)
    helpers = runpy.run_path(str(Path(__file__).with_name('fuse-g10-constrained.py')))
    priors = json.loads((OUT/'camera-priors.json').read_text())
    cameras = ['B6','B4','B5']
    images = load_images([str(ROOT/'evidence/wide capture snapshots'/f'{c}.jpg') for c in cameras], size=512)
    views=[]
    for c, image in zip(cameras, images):
        camera=priors['cameras'][c]
        pose=np.array(camera['pose'],np.float32)
        focal=camera['focal']*512/1920
        h,w=image['img'].shape[-2:]
        k=np.array([[focal,0,w/2],[0,focal,h/2],[0,0,1]],np.float32)
        yy,xx=np.mgrid[:h,:w]
        rays=np.stack([(xx-w/2)/focal,(yy-h/2)/focal,np.ones((h,w))],-1)
        world_rays=rays@pose[:3,:3].T
        sparse=np.zeros((h,w),np.float32)
        for poly in helpers['floor_regions'][c]:
            mask=helpers['region']((h,w),poly)
            distance=-pose[1,3]/np.minimum(world_rays[...,1],-1e-5)
            # Sparse floor samples, rather than a dense synthetic room depthmap.
            mask &= (xx%4==0)&(yy%4==0)&(distance>0)&(distance<15)
            sparse[mask]=distance[mask]
        for observation in camera['observations'].values():
            u,v=np.rint(np.array(observation['pixel'])*w/1920).astype(int)
            distance=((np.array(observation['fittedPosition'])-pose[:3,3])@pose[:3,:3])[2]
            if 1<=u<w-1 and 1<=v<h-1:
                sparse[v-1:v+2,u-1:u+2]=distance
        view=dict(image)
        view['img']=view['img'].cuda()
        view['true_shape']=torch.as_tensor(view['true_shape'],device='cuda')
        views.append((view,torch.tensor(k,device='cuda')[None],torch.tensor(pose,device='cuda')[None],torch.tensor(sparse,device='cuda')[None]))
    print('Loading official Pow3R checkpoint',flush=True)
    ckpt=torch.load(args.checkpoint,map_location='cpu',weights_only=False,mmap=True)
    resolver=BaseResolver((288,512),fix_rays=True)
    resolver.load_from_checkpoint(ckpt)
    del ckpt
    gc.collect()
    resolver=resolver.cuda().eval()
    predictions={c:[] for c in cameras}
    for i,j in [(0,1),(1,0),(0,2),(2,0),(1,2),(2,1)]:
        v1,k1,p1,d1=views[i]
        v2,k2,p2,d2=views[j]
        with torch.inference_mode():
            pred=resolver.inference_with_info(v1,v2,K1=k1,K2=k2,D1=d1,D2=d2,cam1=p1,cam2=p2)
        for index,prediction,pointkey,confkey in [(i,pred[0],'pts3d','conf'),(j,pred[1],'pts3d2','conf2')]:
            depth=prediction[pointkey][0,...,2].float().cpu().numpy()
            confidence=prediction[confkey][0].float().cpu().numpy()
            sparse=views[index][3][0].cpu().numpy()
            mask=(sparse>0)&(depth>0)&np.isfinite(depth)
            scale=float(np.median(sparse[mask]/depth[mask]))
            predictions[cameras[index]].append((depth*scale,confidence))
            print(cameras[i],cameras[j],cameras[index],'metric scale',scale,flush=True)
        del pred
    outputs={}
    for c in cameras:
        depths=np.stack([x[0] for x in predictions[c]])
        confidence=np.stack([x[1] for x in predictions[c]])
        # Median across directed pairs resists a single bad pair prediction.
        depth=np.median(depths,axis=0).astype(np.float32)
        outputs[c]=depth
        outputs[c+'_confidence']=np.median(confidence,axis=0).astype(np.float32)
        outputs[c+'_pairDepthSpread']=np.std(depths,axis=0).astype(np.float32)
        print(c,'metric depth percentiles',np.percentile(depth,[1,50,99]),flush=True)
    np.savez_compressed(OUT/'prior-network-depths.npz',**outputs)
    report={'method':'Official Pow3R, six directed pairs, camera rays/relative poses/sparse landmark and floor depth priors',
            'photographs':cameras,'resolution':[512,288],'checkpoint':args.checkpoint.name,
            'priors':'camera-priors.json','constraintsMeasured':False,'device':torch.cuda.get_device_name(0)}
    with args.checkpoint.open('rb') as f:
        digest=hashlib.sha256()
        for chunk in iter(lambda:f.read(8*1024*1024),b''):
            digest.update(chunk)
        report['checkpointSha256']=digest.hexdigest()
    report['sparsePriorCounts']={c:int((v[3]>0).sum()) for c,v in zip(cameras,views)}
    (OUT/'prior-network-report.json').write_text(json.dumps(report,indent=2)+'\n')


if __name__=='__main__':
    main()
