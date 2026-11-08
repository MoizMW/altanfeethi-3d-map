// Convert the authored G10 model to one surface-sampled Gaussian scene.
// This is an approximate geometry-based export, not photogrammetry or trained 3DGS.
import * as THREE from '../app/node_modules/three/build/three.module.js';
import {buildObject} from '../app/object-builders.js';
import {buildArchitecture} from '../app/architecture.js';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),out=new URL('experiments/g10-gaussian/',root);
const sourceFiles=['architecture','objects'];
const raw=await Promise.all(sourceFiles.map(f=>readFile(new URL(`blocks/ground/g10/${f}.json`,root),'utf8')));
const [architecture,objects]=raw.map(JSON.parse);
const scene=new THREE.Group();
scene.add(buildArchitecture(architecture,{cutaway:true,ceiling:false}));
for(const object of objects.objects)scene.add(buildObject(object));
const floor=new THREE.Mesh(new THREE.BoxGeometry(architecture.floorSize[0],.06,architecture.floorSize[1]),new THREE.MeshStandardMaterial({color:'#494646'}));
floor.position.y=-.04;scene.add(floor);scene.updateMatrixWorld(true);
let seed=10;function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const triangles=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
let totalArea=0;
scene.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.visible)return;
  const geometry=mesh.geometry,position=geometry.attributes.position,index=geometry.index;
  if(!position)return;
  const total=index?index.count:position.count;
  for(let i=0;i<total;i+=3){
    const group=geometry.groups.find(g=>i>=g.start&&i<g.start+g.count);
    const material=Array.isArray(mesh.material)?mesh.material[group?.materialIndex||0]:mesh.material;
    if(!material||material.visible===false||material.opacity<.5)continue;
    const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);
    a.fromBufferAttribute(position,ids[0]).applyMatrix4(mesh.matrixWorld);
    b.fromBufferAttribute(position,ids[1]).applyMatrix4(mesh.matrixWorld);
    c.fromBufferAttribute(position,ids[2]).applyMatrix4(mesh.matrixWorld);
    const normal=new THREE.Vector3().crossVectors(b.clone().sub(a),c.clone().sub(a));
    const area=normal.length()*.5;if(area<1e-10)continue;
    normal.normalize();totalArea+=area;
    triangles.push({a:a.clone(),b:b.clone(),c:c.clone(),area,normal,material});
  }
});
const density=330000/totalArea,sigma=Math.sqrt(1/density)*.7;
const records=[],sun=new THREE.Vector3(-.4,1,.6).normalize(),axis=new THREE.Vector3(0,0,1);
for(const t of triangles){
  const expected=t.area*density,n=Math.floor(expected)+(random()<expected%1?1:0);
  const rotation=new THREE.Quaternion().setFromUnitVectors(axis,t.normal);
  const shade=.68+.32*Math.max(0,t.normal.dot(sun));
  const color=(t.material.color||new THREE.Color('#aaaaaa')).clone().multiplyScalar(shade).convertLinearToSRGB();
  for(let i=0;i<n;i++){
    const r=Math.sqrt(random()),s=random();
    const position=t.a.clone().multiplyScalar(1-r).addScaledVector(t.b,r*(1-s)).addScaledVector(t.c,r*s);
    records.push({position,rotation,color});
  }
}
const packed=Buffer.alloc(records.length*32),ply=Buffer.alloc(records.length*68);
const clamp=v=>Math.max(0,Math.min(255,Math.round(v)));
records.forEach(({position,rotation,color},i)=>{
  const xyz=position.toArray(),scales=[sigma,sigma,sigma*.2],rgb=[color.r,color.g,color.b];
  const q=[rotation.w,rotation.x,rotation.y,rotation.z],p=i*32,b=i*68;
  xyz.forEach((v,j)=>{packed.writeFloatLE(v,p+j*4);ply.writeFloatLE(v,b+j*4);});
  scales.forEach((v,j)=>{packed.writeFloatLE(v,p+12+j*4);ply.writeFloatLE(Math.log(v),b+40+j*4);});
  rgb.forEach((v,j)=>{packed[p+24+j]=clamp(v*255);ply.writeFloatLE((v-.5)/.28209479177387814,b+24+j*4);});
  packed[p+27]=250;ply.writeFloatLE(Math.log(250/5),b+36);
  q.forEach((v,j)=>{packed[p+28+j]=clamp(v*128+128);ply.writeFloatLE(v,b+52+j*4);});
});
const names=['x','y','z','nx','ny','nz','f_dc_0','f_dc_1','f_dc_2','opacity','scale_0','scale_1','scale_2','rot_0','rot_1','rot_2','rot_3'];
const header=`ply\nformat binary_little_endian 1.0\ncomment Approximate authored G10 geometry sampled as Gaussians; not photo-fused\nelement vertex ${records.length}\n${names.map(n=>`property float ${n}\n`).join('')}end_header\n`;
await writeFile(new URL('G10.splat',out),packed);
await writeFile(new URL('G10.ply',out),Buffer.concat([Buffer.from(header),ply]));
const manifest=JSON.parse(await readFile(new URL('manifest.json',out)));
manifest.combined={camera:'G10',method:'authored-geometry-surface-sampling',photoFused:false,trainedMultiView3DGS:false,
  splats:records.length,position:[5,4.5,6],target:[0,.7,0],verticalFovDegrees:45,
  sourceFiles:sourceFiles.map((name,i)=>({path:`blocks/ground/g10/${name}.json`,sha256:createHash('sha256').update(raw[i]).digest('hex')})),
  sourceObjects:objects.objects.map(o=>o.id),wallMode:'cutaway',units:'provisional meters from the existing block',
  limitations:['No photographic texture projection or multi-view fusion','Surface color and lighting are approximated from model materials','Room and furniture dimensions remain estimates']};
await writeFile(new URL('manifest.json',out),JSON.stringify(manifest,null,2)+'\n');
console.log(`Saved one G10 block with ${records.length.toLocaleString()} Gaussians from ${objects.objects.length} authored objects.`);
