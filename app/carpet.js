import * as THREE from 'three';
import {setFloorUV} from './floor-materials.js';

export function carpetPolygon({polygon,holes=[],color='#b9b3a3'}) {
  const path=(points,shape)=>{points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();return shape;};
  const shape=path(polygon,new THREE.Shape());
  for(const hole of holes)shape.holes.push(path(hole,new THREE.Path()));
  // Repeatable distressed woven carpet; no stone joints or reflected floor pass.
  const size=256,data=new Uint8Array(size*size*4);
  const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
  const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix,iy),hash(ix+1,iy),sx),THREE.MathUtils.lerp(hash(ix,iy+1),hash(ix+1,iy+1),sx),sy);};
  for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
    const grain=hash(x,y),mottling=.6*noise(x/27,y/27)+.3*noise(x/9,y/9)+.1*noise(x/3,y/3);
    const value=Math.round(200+45*mottling+13*(grain-.5)+((x+y)%2?2:-2));
    const i=(y*size+x)*4;data.set([value,Math.min(255,value+1),Math.max(0,value-3),255],i);
  }
  const texture=new THREE.DataTexture(data,size,size);texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(1/5.6,1/5.6);texture.needsUpdate=true;
  const material=new THREE.MeshStandardMaterial({name:'Center lounge woven carpet',color,map:texture,roughness:1,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),material);mesh.rotation.x=-Math.PI/2;mesh.position.y=-.008;mesh.receiveShadow=true;
  return setFloorUV(mesh);
}
