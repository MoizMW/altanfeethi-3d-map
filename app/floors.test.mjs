import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {buildFloors} from './floors.js';
import {buildFloorInlays} from './architecture.js';
import {buildPatternedSurfaces} from './vertical-circulation.js';
import {floorFinishForColor,floorFinishes,stoneTextureSpan} from './floor-materials.js';
import {createFloorReflections} from './floor-reflections.js';

test('stone grain keeps a physical metre scale across rotated sections and offset circulation',()=>{
  const block={floorSize:[6,8],architecture:{floorCenter:[11,-7],floorSections:[
    {size:[6,8],center:[11,-7],yaw:90,color:'#424747'},
    {size:[4,3],center:[11,-2],yaw:0,color:'#dedbd1'},
  ],circulations:[{polygon:[[8,-6],[9,-6],[9,-2],[8,-2]]}]}};
  const group=buildFloors(block);group.updateMatrixWorld(true);
  assert.equal(stoneTextureSpan,4.8);
  assert.equal(group.children.length,3);
  group.traverse(mesh=>{
    assert.equal(Boolean(mesh.isLine),false,'No schematic grid strokes');
    if(!mesh.isMesh)return;
    const {position,uv}=mesh.geometry.attributes;
    for(let i=0;i<position.count;i++){
      const point=new THREE.Vector3().fromBufferAttribute(position,i).applyMatrix4(mesh.matrixWorld);
      assert.ok(Math.abs(point.x-uv.getX(i))<1e-5);
      assert.ok(Math.abs(point.z-uv.getY(i))<1e-5);
    }
  });
  assert.equal(group.children[0].material.userData.floorFinish,'dark-stone-floor');
  assert.equal(group.children[1].material.userData.floorFinish,'pale-stone-floor');
});

test('owner dark-floor override and real decorative inlays survive the material replacement',()=>{
  const floor=buildFloors({floorSize:[6,6],architecture:{circulation:{surfaceMaterial:'same-as-seating',polygon:[[0,0],[2,0],[2,2]]}}});
  assert.equal(floor.children.length,1);
  const polygon=[[0,0],[1,0],[1,1],[0,1]];
  const inlays=buildFloorInlays({floorInlays:[{id:'tv-tile-row-1',polygon,color:'#717878'},{id:'diamond-1',polygon,color:'#4a4540'}]});
  assert.deepEqual(inlays.children.map(m=>m.name),['diamond-1']);
  const checker=buildPatternedSurfaces([{center:[4,3],size:[6,2],yaw:90,pattern:'inset-checker',columns:10,rows:4}]);
  assert.equal(checker.children[0].children.length,40);
  assert.ok(checker.children[0].children.every(m=>m.material.userData.floorFinish==='dark-stone-floor'));
});

test('both stone textures are installed and use dielectric polished finishes',async()=>{
  for(const [id,finish] of Object.entries(floorFinishes)){
    const png=await readFile(new URL(`../shared/materials/textures/${id}/basecolor.png`,import.meta.url));
    assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
    assert.ok(png.readUInt32BE(16)>=1024&&png.readUInt32BE(20)>=1024);
    assert.ok(finish.roughness>=.2&&finish.roughness<=.35);
    assert.equal(floorFinishForColor(finish.fallback),id);
  }
});

test('reflection capture clips correctly for both cameras, reuses still frames and restores hidden objects',()=>{
  const scene=new THREE.Scene(),root=buildFloors({floorSize:[6,6]}),helper=new THREE.Object3D();scene.add(root,helper);
  const floorMeshes=[...root.children];
  const ornament=new THREE.Mesh(new THREE.BoxGeometry(.3,1,.2),[new THREE.MeshStandardMaterial(),new THREE.MeshStandardMaterial()]);
  root.add(ornament);
  let renders=0,target=null;
  const renderer={shadowMap:{autoUpdate:true},xr:{enabled:false},getRenderTarget:()=>target,setRenderTarget:t=>{target=t;},render:(_scene,camera)=>{
    renders++;
    assert.ok(floorMeshes.every(m=>!m.visible));assert.equal(helper.visible,false);
    assert.equal(ornament.visible,true,'Multi-material window ornaments remain in the reflection without crashing the render loop');
    const clip=y=>new THREE.Vector4(0,y,0,1).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
    const above=clip(.1),below=clip(-.1);
    assert.ok(above.z>=-above.w,'Real furniture above floor stays inside clip plane');
    assert.ok(below.z < -below.w,'Geometry below floor is clipped');
  }};
  const reflection=createFloorReflections(renderer,scene,root,[helper]);
  for(const camera of [new THREE.OrthographicCamera(-4,4,4,-4,.1,100),new THREE.PerspectiveCamera(40,1,.1,100)]){
    camera.position.set(5,6,7);camera.lookAt(0,0,0);camera.updateMatrixWorld();
    reflection.update(camera);const count=renders;reflection.update(camera);assert.equal(renders,count);
    camera.position.x+=1;camera.lookAt(0,0,0);reflection.update(camera);assert.equal(renders,count+1);
    assert.equal(helper.visible,true);assert.equal(target,null);assert.equal(renderer.shadowMap.autoUpdate,true);
  }
  const count=renders,camera=new THREE.PerspectiveCamera(40,1,.1,100);camera.position.set(5,6,7);camera.lookAt(0,0,0);
  reflection.setEnabled(false);reflection.update(camera);assert.equal(renders,count,'Interaction must not capture the scene');
  reflection.setEnabled(true);reflection.update(camera);assert.equal(renders,count+1,'Settling restores the reflection capture');
  reflection.dispose();
});
