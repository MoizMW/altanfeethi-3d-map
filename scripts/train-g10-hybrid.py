"""Fit the three real G10 photos to one shape-guided Gaussian scene.

Authored furniture supplies structural priors, explicitly approved by the user.
Visible appearance is initialized from photographs with occlusion checks, then
jointly optimized. Unseen surfaces retain estimated material appearance.
"""
import argparse, hashlib, json, runpy, time
from pathlib import Path
import cv2
import numpy as np
import torch
import torch.nn.functional as F
from scipy.spatial.transform import Rotation
from scipy.spatial import cKDTree
from gsplat import rasterization
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'experiments/g10-gaussian'
helpers=runpy.run_path(str(Path(__file__).with_name('train-g10-gaussians.py')))
export,ssim=helpers['export'],helpers['ssim']

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--steps',type=int,default=5000);p.add_argument('--name',default='G10-hybrid');args=p.parse_args()
 torch.set_num_threads(4);torch.manual_seed(10)
 seedmeta=json.loads((OUT/'hybrid-seeds.json').read_text());priors=json.loads((OUT/'camera-priors.json').read_text())
 data=np.fromfile(OUT/'hybrid-seeds.bin',np.float32).reshape(-1,10)
 xyz,normal,rgb,ids=data[:,:3].copy(),data[:,3:6].copy(),data[:,6:9].copy(),data[:,9].astype(int)
 # Fit each shape to its shared photographed landmarks. This affects only the
 # experiment, never the approved source objects or their physical IDs.
 correspondence={'g10-sofa-01':['sofa-positive'],'g10-sofa-02':['sofa-negative'],
 'g10-chair-01':['chair-positive-near'],'g10-chair-02':['chair-positive-far'],
 'g10-chair-03':['chair-negative-near'],'g10-chair-04':['chair-negative-far'],
 'g10-table-01':['table-positive-near','table-positive-far'],'g10-table-02':['table-negative-near','table-negative-far'],
 'g10-divider-01':['divider-near','divider-far'],'g10-side-table-01':['side-positive'],'g10-side-table-02':['side-negative']}
 observations={k:o for c in priors['cameras'].values() for k,o in c['observations'].items()}
 adjustments={}
 for index,object_id in enumerate(seedmeta['objects']):
  names=correspondence.get(object_id)
  if not names:continue
  before=np.array([observations[k]['priorPosition'] for k in names]);after=np.array([observations[k]['fittedPosition'] for k in names])
  rotation=np.eye(3);scale=1.
  if len(names)==2:
   old=before[1]-before[0];new=after[1]-after[0]
   angle=np.arctan2(new[0],new[2])-np.arctan2(old[0],old[2]);rotation=Rotation.from_euler('y',angle).as_matrix()
   scale=np.linalg.norm(new[[0,2]])/np.linalg.norm(old[[0,2]])
  flags=ids==index;centered=xyz[flags]-before.mean(0)
  centered[:,2]*=scale;xyz[flags]=centered@rotation.T+after.mean(0);normal[flags]=normal[flags]@rotation.T
  adjustments[object_id]={'priorCenter':before.mean(0).tolist(),'fittedCenter':after.mean(0).tolist(),'lengthScale':scale}
 n=len(xyz);t=lambda x:torch.as_tensor(x,device='cuda',dtype=torch.float32)
 initial=t(xyz);floor=torch.tensor(ids==len(seedmeta['objects'])-1,device='cuda')
 axis=np.cross(np.tile([0.,0.,1.],(n,1)),normal);length=np.linalg.norm(axis,axis=-1)
 axis[length<1e-6]=[1,0,0];axis/=np.linalg.norm(axis,axis=-1,keepdims=True)
 quaternion=Rotation.from_rotvec(axis*np.arccos(normal[:,2].clip(-1,1))[:,None]).as_quat()[:,[3,0,1,2]]
 means=torch.nn.Parameter(initial.clone());quats=t(quaternion)
 scales=torch.nn.Parameter(t(np.tile([np.log(seedmeta['sigma']),np.log(seedmeta['sigma']),np.log(.003)],(n,1))))
 opacity=torch.nn.Parameter(torch.full((n,),3.,device='cuda'))
 cameras=['B6','B4','B5'];w,h=768,432;images=[];views=[];intrinsics=[]
 for c in cameras:
  image=cv2.cvtColor(cv2.imread(str(ROOT/'evidence/wide capture snapshots'/f'{c}.jpg')),cv2.COLOR_BGR2RGB)
  images.append(cv2.resize(image,(w,h),interpolation=cv2.INTER_AREA).astype(np.float32)/255)
  camera=priors['cameras'][c];f=camera['focal']*w/1920
  views.append(np.linalg.inv(np.array(camera['pose'])));intrinsics.append([[f,0,w/2],[0,f,h/2],[0,0,1]])
 images,views,ks=t(np.array(images)),t(np.array(views)),t(np.array(intrinsics))
 normals=t(normal);photo_color=t(rgb);best_score=torch.zeros(n,device='cuda');source_index=torch.full((n,),-1,device='cuda',dtype=torch.long);masks=[]
 for i,c in enumerate(cameras):
  with torch.no_grad():
   rendered,alpha,_=rasterization(means,quats,scales.exp(),opacity.sigmoid(),photo_color,views[i:i+1],ks[i:i+1],w,h,render_mode='RGB+ED',packed=False)
   local=initial@views[i,:3,:3].T+views[i,:3,3];uv=local[:,:2]/local[:,2:3]*ks[i,0,0]+t([w/2,h/2])
   grid=(uv/t([w-1,h-1])*2-1).reshape(1,-1,1,2)
   sample=lambda x:F.grid_sample(x.permute(0,3,1,2),grid,align_corners=True).squeeze(0).squeeze(-1).T
   depth=sample(rendered[...,3:4])[:,0];coverage=sample(alpha)[:,0]
   camera_position=t(priors['cameras'][c]['pose'])[:3,3];direction=F.normalize(camera_position-initial,dim=-1)
   facing=(direction*normals).sum(-1).clamp(min=0)
   visible=(local[:,2]>0)&(coverage>.8)&((local[:,2]-depth).abs()<.09)&(uv[:,0]>2)&(uv[:,0]<w-3)&(uv[:,1]>2)&(uv[:,1]<h-3)&(facing>.12)
   score=facing**2/local[:,2].clamp(min=.1)*visible
   choose=score>best_score;photo_color[choose]=sample(images[i:i+1])[choose];best_score[choose]=score[choose];source_index[choose]=i
   mask=cv2.erode((alpha[0,...,0].cpu().numpy()>.92).astype(np.uint8),np.ones((5,5),np.uint8))
   masks.append(mask)
 print('Photo initialization', {c:int((source_index==i).sum()) for i,c in enumerate(cameras)},'unseen',int((source_index<0).sum()),flush=True)
 # Continue photographed material appearance onto unseen areas of the same
 # object. These interpolated colors are explicitly estimates, not observations.
 observed=source_index.cpu().numpy()>=0
 appearance=photo_color.cpu().numpy()
 for object_index in range(len(seedmeta['objects'])):
  visible=np.flatnonzero((ids==object_index)&observed);hidden=np.flatnonzero((ids==object_index)&~observed)
  if not len(visible) or not len(hidden):continue
  feature=np.concatenate([xyz,rgb*3],axis=-1)
  tree=cKDTree(feature[visible]);distance,neighbors=tree.query(feature[hidden],k=min(8,len(visible)))
  if neighbors.ndim==1:neighbors=neighbors[:,None];distance=distance[:,None]
  weight=1/(distance+.05);weight/=weight.sum(axis=1,keepdims=True)
  appearance[hidden]=(appearance[visible[neighbors]]*weight[...,None]).sum(axis=1)
 photo_color=t(appearance)
 anchor_color=photo_color.clone();known=source_index>=0
 color=torch.nn.Parameter(torch.logit(photo_color.clamp(.005,.995)));masks=t(np.array(masks))[...,None]
 opt=torch.optim.Adam([{'params':[means],'lr':.00025},{'params':[scales],'lr':.001},{'params':[opacity],'lr':.002},{'params':[color],'lr':.015}])
 def render(i):return rasterization(means,quats,scales.exp(),opacity.sigmoid(),color.sigmoid(),views[i:i+1],ks[i:i+1],w,h,packed=False,backgrounds=torch.full((1,3),.08,device='cuda'))[:2]
 def evaluate(tag):
  result={}
  with torch.no_grad():
   for i,c in enumerate(cameras):
    r,a=render(i);mse=(((r-images[i:i+1])**2)*masks[i:i+1]).sum()/(masks[i].sum()*3)
    result[c]={'maskedTrainingPSNR':float(-10*torch.log10(mse))}
    cv2.imwrite(str(OUT/f'{args.name}-{tag}-{c}.jpg'),cv2.cvtColor((r[0].clamp(0,1).cpu().numpy()*255).astype('uint8'),cv2.COLOR_RGB2BGR))
  return result
 before=evaluate('before');started=time.time();history=[]
 for step in range(args.steps):
  i=step%3;r,a=render(i);mask=masks[i:i+1];target=images[i:i+1]
  l1=((r-target).abs()*mask).sum()/(mask.sum()*3)
  loss=.8*l1+.2*(1-ssim(r*mask+target*(1-mask),target))+2*((means-initial)**2).mean()+.02*((color.sigmoid()-anchor_color)**2).mean()
  loss.backward();opt.step();opt.zero_grad(set_to_none=True)
  with torch.no_grad():
   means.copy_(initial+(means-initial).clamp(-.025,.025));means[floor]=initial[floor]
   scales[:,:2].clamp_(np.log(seedmeta['sigma']*.85),np.log(.035));scales[:,2]=np.log(.003)
   opacity.clamp_(2.,5.)
   # Preserve plausible color and estimated hidden surfaces rather than allowing
   # view-specific bright fragments to compensate for a shape mismatch.
   lower=torch.logit((anchor_color-.22).clamp(.005,.995));upper=torch.logit((anchor_color+.22).clamp(.005,.995))
   color.copy_(torch.maximum(torch.minimum(color,upper),lower));color[~known]=torch.logit(anchor_color[~known].clamp(.005,.995))
  if step%500==0 or step==args.steps-1:
   record={'step':step,'loss':float(loss.detach()),'seconds':round(time.time()-started,1)};history.append(record);print(record,flush=True)
  if step==args.steps*2//3:
   for group in opt.param_groups:group['lr']*=.25
 after=evaluate('after')
 with torch.no_grad():export(OUT/args.name,means.cpu().numpy(),scales.exp().cpu().numpy(),quats.cpu().numpy()[:,[1,2,3,0]],color.sigmoid().cpu().numpy(),opacity.sigmoid().cpu().numpy())
 torch.save({k:v.detach().cpu() for k,v in dict(means=means,quats=quats,scales=scales,opacity=opacity,color=color,viewmats=views,Ks=ks).items()},OUT/f'{args.name}.pt')
 base=json.loads((OUT/'constrained-report.json').read_text())
 report={k:base[k] for k in ['cameras','sourceHashes','focals','poses','units','coordinateFrame','cameraFitRmsPixels']}
 report.update(method='Shape-guided joint photographic Gaussian training',status='awaiting-novel-view-review',authoredGeometryUsed=True,authoredFurnitureMeshesSampled=True,authoredPositionPriorsUsed=True,photometricallyTrained3DGS=True,splats=n,refinementVersion=5,trainingSteps=args.steps,trainingBefore=before,trainingAfter=after,trainingHistory=history,shapeAdjustments=adjustments,shapeSource=seedmeta,pointsPerCamera=[int((source_index==i).sum()) for i in range(3)],pointsPerCameraStage='visible photo-color initialization; one shared scene jointly trained',unseenSurfaceSplats=int((source_index<0).sum()),bounds=[xyz.min(0).tolist(),xyz.max(0).tolist()],framingBounds=[[-3.3,0,-2.7],[3.3,2.6,2.7]],target=[0,.8,0],trainingResolution=[w,h],trainingDevice=torch.cuda.get_device_name(0),validationNotes=['Furniture shape priors and photo appearance; not an independent photographic scan','Hidden surfaces retain estimated material colors','Training-image metrics do not measure novel-view accuracy'])
 report['exportSha256']=hashlib.sha256((OUT/f'{args.name}.splat').read_bytes()).hexdigest()
 report['hiddenAppearance']='Estimated from nearby photographed material on the same object; fallback to authored material where unobserved'
 (OUT/f'{args.name}-report.json').write_text(json.dumps(report,indent=2)+'\n');print('Exported',n,'shared Gaussians',flush=True)
if __name__=='__main__':main()
