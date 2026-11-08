// Surface priors for photo-trained Gaussians. Never modifies source furniture.
import * as THREE from '../app/node_modules/three/build/three.module.js';
import {buildObject} from '../app/object-builders.js';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),out=new URL('experiments/g10-gaussian/',root);
const raw=await readFile(new URL('blocks/ground/g10/objects.json',root));
const {objects}=JSON.parse(raw),triangles=[];
let seed=10,areaSum=0;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const groups=objects.map(o=>buildObject(o));
const floor=new THREE.Mesh(new THREE.PlaneGeometry(6.6,5.4),new THREE.MeshStandardMaterial({color:'#55524e'}));
floor.rotation.x=-Math.PI/2;groups.push(floor);
for(const [id,group] of groups.entries()){
 group.updateMatrixWorld(true);
 group.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.visible)return;
  const g=mesh.geometry,p=g.attributes.position,index=g.index;
  for(let i=0;i<(index?index.count:p.count);i+=3){
   const slot=g.groups.find(v=>i>=v.start&&i<v.start+v.count);
   const mat=Array.isArray(mesh.material)?mesh.material[slot?.materialIndex||0]:mesh.material;
   if(!mat||mat.visible===false||mat.opacity<.5)continue;
   const vertices=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld));
   const [a,b,c]=vertices,n=new THREE.Vector3().crossVectors(b.clone().sub(a),c.clone().sub(a));
   const area=n.length()/2;if(area<1e-10)continue;n.normalize();areaSum+=area;
   triangles.push({a,b,c,n,area,id,color:(mat.color||new THREE.Color('#aaaaaa')).clone().convertLinearToSRGB()});
  }
 });
}
const density=350000/areaSum,rows=[];
for(const t of triangles){
 const expected=t.area*density,count=Math.floor(expected)+(random()<expected%1?1:0);
 for(let i=0;i<count;i++){
  const r=Math.sqrt(random()),s=random(),p=t.a.clone().multiplyScalar(1-r).addScaledVector(t.b,r*(1-s)).addScaledVector(t.c,r*s);
  rows.push(...p.toArray(),...t.n.toArray(),t.color.r,t.color.g,t.color.b,t.id);
 }
}
const floats=new Float32Array(rows);
await writeFile(new URL('hybrid-seeds.bin',out),Buffer.from(floats.buffer));
await writeFile(new URL('hybrid-seeds.json',out),JSON.stringify({count:rows.length/10,columns:['x','y','z','nx','ny','nz','r','g','b','objectIndex'],objects:[...objects.map(o=>o.id),'floor'],objectsSha256:createHash('sha256').update(raw).digest('hex'),sigma:Math.sqrt(1/density)*.7,authoredGeometryUsed:true,role:'Structural initialization for subsequent joint photographic optimization'},null,2)+'\n');
console.log('Prepared',rows.length/10,'surface priors');
