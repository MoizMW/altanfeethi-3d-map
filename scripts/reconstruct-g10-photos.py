"""Jointly reconstruct B6/B4/B5 photographs with DUSt3R and export Gaussian surfaces.
Requires an external official DUSt3R checkout and checkpoint; no authored geometry is read.
The resulting Gaussian representation is not photometrically trained 3DGS.
"""
import argparse,sys,json,hashlib,gc
from pathlib import Path
import numpy as np
import torch
from scipy.spatial.transform import Rotation
p=argparse.ArgumentParser();p.add_argument('--dust3r',required=True);p.add_argument('--checkpoint',required=True);args=p.parse_args()
sys.path.insert(0,args.dust3r)
from dust3r.model import AsymmetricCroCo3DStereo
from dust3r.inference import inference
from dust3r.utils.image import load_images
from dust3r.image_pairs import make_pairs
from dust3r.cloud_opt import global_aligner,GlobalAlignerMode
root=Path(__file__).resolve().parents[1];out=root/'experiments/g10-gaussian';cs=['B6','B4','B5']
torch.set_num_threads(6);torch.manual_seed(10)
print('Loading official reconstruction weights',flush=True)
ckpt=torch.load(args.checkpoint,map_location='cpu',weights_only=False,mmap=True)
model=AsymmetricCroCo3DStereo(pos_embed='RoPE100',patch_embed_cls='ManyAR_PatchEmbed',img_size=(512,512),head_type='dpt',output_mode='pts3d',depth_mode=('exp',-float('inf'),float('inf')),conf_mode=('exp',1,float('inf')),enc_embed_dim=1024,enc_depth=24,enc_num_heads=16,dec_embed_dim=768,dec_depth=12,dec_num_heads=12,landscape_only=False)
print(model.load_state_dict(ckpt['model'],strict=True,assign=True),flush=True);del ckpt
model.eval()
paths=[root/'evidence/wide capture snapshots'/f'{c}.jpg' for c in cs]
images=load_images([str(f) for f in paths],size=512)
pairs=make_pairs(images,scene_graph='complete',prefilter=None,symmetrize=True)
output=inference(pairs,model,'cpu',batch_size=1)
del model;gc.collect()
print('Aligning all three views in one coordinate frame',flush=True)
scene=global_aligner(output,device='cpu',mode=GlobalAlignerMode.PointCloudOptimizer)
loss=scene.compute_global_alignment(init='mst',niter=300,schedule='cosine',lr=.01)
scene.clean_pointcloud()
points=[x.detach().numpy() for x in scene.get_pts3d()]
masks=[x.detach().numpy() for x in scene.get_masks()]
poses=scene.get_im_poses().detach().numpy();focals=scene.get_focals().detach().numpy()
np.savez_compressed(out/'joint-reconstruction.npz',poses=poses,focals=focals,**{f'points_{c}':v for c,v in zip(cs,points)},**{f'mask_{c}':v for c,v in zip(cs,masks)})
# Express every prediction in B6's camera frame, with Y up and camera looking -Z.
transform=np.diag([1,-1,-1,1])@np.linalg.inv(poses[0]);rot=transform[:3,:3]
allp=[];alls=[];allq=[];allc=[];counts=[]
for i,(pts,mask) in enumerate(zip(points,masks)):
 pts=pts@rot.T+transform[:3,3]
 dy,dx=np.gradient(pts,axis=(0,1));normal=np.cross(dx,-dy)
 norm=np.linalg.norm(normal,axis=-1,keepdims=True)
 t=dx/np.maximum(np.linalg.norm(dx,axis=-1,keepdims=True),1e-8)
 normal/=np.maximum(norm,1e-8);bt=np.cross(normal,t)
 sx=np.linalg.norm(dx,axis=-1)*.75;sy=np.linalg.norm(dy,axis=-1)*.75
 valid=mask & np.isfinite(pts).all(-1)&(norm[...,0]>1e-10)&(sx>1e-6)&(sy>1e-6)
 # Reject depth discontinuities and very large surface footprints.
 typical=np.median(np.sqrt(sx[valid]*sy[valid]));valid&=(sx<typical*5)&(sy<typical*5)
 valid[:2]=False;valid[-2:]=False;valid[:,:2]=False;valid[:,-2:]=False
 scales=np.stack([sx,sy,np.minimum(sx,sy)*.2],-1)
 allp.append(pts[valid]);alls.append(scales[valid]);allq.append(Rotation.from_matrix(np.stack([t,bt,normal],-1)[valid]).as_quat());allc.append(np.clip(np.asarray(scene.imgs[i])[valid],0,1));counts.append(int(valid.sum()))
positions=np.concatenate(allp);scales=np.concatenate(alls);quats=np.concatenate(allq);colors=np.concatenate(allc)
assert all(n>1000 for n in counts),'At least one camera has insufficient confident geometry'
assert np.isfinite(focals).all() and (focals>0).all(),'Invalid intrinsics'
# Thin overlapping samples in a common voxel grid; all cameras contribute to one file.
voxel=float(np.median(scales[:,:2]))*.6
_,keep=np.unique(np.round(positions/voxel).astype(np.int64),axis=0,return_index=True)
positions,scales,quats,colors=[x[keep] for x in [positions,scales,quats,colors]]
n=len(positions);q=quats[:,[3,0,1,2]]
packed=np.zeros(n,dtype=[('p','<f4',3),('s','<f4',3),('rgba','u1',4),('q','u1',4)])
packed['p']=positions;packed['s']=scales;packed['rgba'][:,:3]=np.rint(colors*255).astype('u1');packed['rgba'][:,3]=245;packed['q']=np.clip(np.rint(q*128+128),0,255).astype('u1')
(out/'G10-photo.splat').write_bytes(packed.tobytes())
names=['x','y','z','nx','ny','nz','f_dc_0','f_dc_1','f_dc_2','opacity','scale_0','scale_1','scale_2','rot_0','rot_1','rot_2','rot_3'];ply=np.zeros((n,17),dtype='<f4');ply[:,:3]=positions;ply[:,6:9]=(colors-.5)/.28209479177387814;ply[:,9]=np.log(245/10);ply[:,10:13]=np.log(scales);ply[:,13:17]=q
header='ply\nformat binary_little_endian 1.0\ncomment Joint DUSt3R photograph reconstruction; unvalidated Gaussian initialization\nelement vertex '+str(n)+'\n'+''.join(f'property float {s}\n' for s in names)+'end_header\n'
(out/'G10-photo.ply').write_bytes(header.encode()+ply.tobytes())
report={'method':'DUSt3R joint image reconstruction followed by Gaussian surface initialization','status':'awaiting-visual-validation','authoredGeometryUsed':False,'photometricallyTrained3DGS':False,'cameras':cs,'sourceHashes':{c:hashlib.sha256(f.read_bytes()).hexdigest() for c,f in zip(cs,paths)},'alignmentLoss':float(loss),'focals':focals.tolist(),'poses':poses.tolist(),'pointsPerCamera':counts,'splats':n,'units':'arbitrary reconstruction scale','target':np.median(positions,axis=0).tolist(),'bounds':[positions.min(0).tolist(),positions.max(0).tolist()]}
(out/'joint-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report),flush=True)
