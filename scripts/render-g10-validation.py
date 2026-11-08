"""Render fixed unseen viewpoints of a trained G10 checkpoint for visual review.

These are diagnostic views, not held-out photographs or measured quality scores.
"""
import argparse
from pathlib import Path
import cv2
import numpy as np
import torch
from gsplat import rasterization

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'experiments/g10-gaussian'

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--name',required=True)
    args=parser.parse_args()
    state=torch.load(OUT/f'{args.name}.pt',weights_only=True)
    state={k:v.cuda() for k,v in state.items()}
    width,height=960,720
    for i,position in enumerate([[7,6,7],[-7,6,7],[0,7,-7],[0,10,.01]]):
        p=np.array(position,dtype=float)
        forward=np.array([0,.8,0])-p
        forward/=np.linalg.norm(forward)
        right=np.cross(forward,[0,1,0]);right/=np.linalg.norm(right)
        down=np.cross(forward,right)
        pose=np.eye(4);pose[:3,:3]=np.stack([right,down,forward],axis=1);pose[:3,3]=p
        view=torch.tensor(np.linalg.inv(pose),device='cuda',dtype=torch.float32)[None]
        intrinsic=torch.tensor([[[850,0,width/2],[0,850,height/2],[0,0,1]]],device='cuda',dtype=torch.float32)
        # Match exported opacity filtering so diagnostics reflect the deliverable.
        keep=state['opacity'].sigmoid()>.12
        with torch.no_grad():
            color,_,_=rasterization(state['means'][keep],state['quats'][keep],state['scales'][keep].exp(),
                state['opacity'][keep].sigmoid(),state['color'][keep].sigmoid(),view,intrinsic,width,height,
                packed=False,backgrounds=torch.tensor([[.075,.12,.1]],device='cuda'))
        pixels=(color[0].clamp(0,1).cpu().numpy()*255).astype(np.uint8)
        path=OUT/f'{args.name}-orbit-{i}.jpg'
        cv2.imwrite(str(path),cv2.cvtColor(pixels,cv2.COLOR_RGB2BGR))
        print(path)

if __name__=='__main__':
    main()
