import * as THREE from 'three';
import {createFloorMaterial,setFloorUV} from './floor-materials.js';
import {carpetPolygon} from './carpet.js';

export function stonePolygon(polygon,color,y=-.012,{joints=true}={}) {
  const shape=new THREE.Shape();
  polygon.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));
  shape.closePath();
  const surface=new THREE.Mesh(new THREE.ShapeGeometry(shape),createFloorMaterial(color,{joints}));
  surface.rotation.x=-Math.PI/2;surface.position.y=y;surface.receiveShadow=true;
  return setFloorUV(surface);
}

export function buildFloors(block) {
  const group=new THREE.Group();group.name='Stone floors';
  const a=block.architecture||{};
  const sections=a.floorSections?.length?a.floorSections:[{size:block.floorSize,center:a.floorCenter||[0,0],color:'#424747'}];
  for(const section of sections) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(section.size[0],.12,section.size[1]),createFloorMaterial(section.color));
    mesh.name=section.id||'Stone floor section';
    mesh.position.set(section.center[0],-.08,section.center[1]);
    mesh.rotation.y=THREE.MathUtils.degToRad(section.yaw||0);
    mesh.receiveShadow=true;group.add(mesh);setFloorUV(mesh);
  }
  for(const c of a.circulations||(a.circulation?[a.circulation]:[])) {
    if(!c.polygon||c.surfaceMaterial==='same-as-seating')continue;
    const surface=c.surfaceMaterial==='carpet'?carpetPolygon(c):stonePolygon(c.polygon,'#d7d4c9');
    surface.name=c.id||'Pale stone circulation';group.add(surface);
  }
  return group;
}
