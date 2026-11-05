import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createRenderLoop,renderQuality} from './render-loop.js';
import {buildStaticInstances,createObjectCache} from './static-instances.js';
import {buildObject} from './object-builders.js';
import {buildContactShadows,fitSceneShadows} from './contact-shadows.js';
import {readFile} from 'node:fs/promises';

test('idle map stops scheduling frames and damping restores a settled quality frame',()=>{
  let now=0,changed=false,id=0;const frames=new Map(),timers=new Map(),renders=[];
  const loop=createRenderLoop({clock:()=>now,update:()=>changed,render:r=>renders.push(r),
    request:fn=>{frames.set(++id,fn);return id;},cancel:i=>frames.delete(i),
    defer:(fn,delay)=>{timers.set(++id,{fn,delay});return id;},clear:i=>timers.delete(i)});
  const step=()=>{const [i,fn]=frames.entries().next().value;frames.delete(i);fn();};
  loop.invalidate();step();assert.equal(frames.size,0);assert.equal(timers.size,0);assert.equal(renders.length,1);
  loop.setActive(true);changed=true;now=16;step();assert.equal(renders.at(-1).moving,true);
  changed=false;loop.setActive(false);now=32;step();assert.equal(frames.size,0);assert.equal(timers.size,1);
  now=200;const timer=timers.values().next().value;timer.fn();step();
  assert.equal(renders.at(-1).moving,false);assert.equal(frames.size,0);
  loop.invalidate();loop.dispose();assert.equal(frames.size,0);
});

test('overview and motion avoid reflection passes while a settled close view restores polish',()=>{
  assert.deepEqual(renderQuality({meshCount:6000,pixelRatio:2,moving:true,viewSpan:80}),{pixelRatio:2,reflections:false});
  assert.deepEqual(renderQuality({meshCount:6000,pixelRatio:2,viewSpan:80}),{pixelRatio:2,reflections:false});
  assert.equal(renderQuality({meshCount:600,viewSpan:8,moving:true}).reflections,false);
  assert.equal(renderQuality({meshCount:600,viewSpan:8}).reflections,true);
});

test('static instances preserve transforms, unique child parts, visibility and seat picking',()=>{
  const root=new THREE.Group();root.position.set(1,0,1);const models=[];
  for(let i=0;i<3;i++){
    const model=new THREE.Group();model.userData.objectId=`chair-${i}`;model.position.set(i*2,0,0);model.rotation.y=.3*i;
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(.8,1,.7),new THREE.MeshStandardMaterial({color:'#627d86'}));
    mesh.position.y=.5;model.add(mesh);root.add(model);models.push(model);
  }
  const glass=new THREE.Mesh(new THREE.SphereGeometry(.1),new THREE.MeshStandardMaterial({transparent:true,opacity:.4}));
  models[0].children[0].add(glass);
  const batches=buildStaticInstances(root,models);root.updateMatrixWorld(true);
  assert.equal(batches.stats.savedCalls,2);assert.equal(batches.group.children.length,1);
  assert.equal(glass.layers.isEnabled(0),true);assert.equal(glass.parent.visible,true,'Unique child must remain renderable');
  const instances=batches.group.children[0],matrix=new THREE.Matrix4();
  models.forEach((model,i)=>{
    instances.getMatrixAt(i,matrix);matrix.premultiply(instances.matrixWorld);
    const expected=model.children[0].matrixWorld.elements;
    matrix.elements.forEach((v,j)=>assert.ok(Math.abs(v-expected[j])<1e-6));
  });
  const ray=new THREE.Raycaster(new THREE.Vector3(1,3,1),new THREE.Vector3(0,-1,0));ray.layers.enable(1);
  assert.ok(ray.intersectObject(models[0],true).some(h=>h.object===models[0].children[0]));
  models[0].visible=false;batches.sync();instances.getMatrixAt(0,matrix);assert.equal(matrix.determinant(),0);
  models[0].visible=true;batches.sync();instances.getMatrixAt(0,matrix);assert.ok(matrix.determinant()>0);
});

test('geometry sharing never combines parts with different topology or finish',()=>{
  const root=new THREE.Group(),models=[];
  for(let i=0;i<3;i++){
    const model=new THREE.Group(),geo=new THREE.BoxGeometry(1,1,1);
    if(i===2)geo.attributes.position.setX(5,.9);
    const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({roughness:i===1?.8:.2}));model.add(mesh);root.add(model);models.push(model);
  }
  const result=buildStaticInstances(root,models);
  assert.equal(result.stats.batches,0);
  assert.equal(models[0].children[0].geometry,models[1].children[0].geometry);
  assert.notEqual(models[0].children[0].geometry,models[2].children[0].geometry);
  assert.notEqual(models[0].children[0].material,models[1].children[0].material);
});

const chair={id:'chair-1',type:'armchair',size:[.88,.9,.92],position:[0,0,0],yaw:0,color:'#3d4a55',seats:['Seat_1']};
test('object templates share resources while retaining placement, scale and object identity',()=>{
  const build=createObjectCache(buildObject),a=build({...chair,scale:[2,1,1]}),b=build({...chair,id:'chair-2',position:[3,0,4],yaw:90,scale:[1,2,1]});
  assert.deepEqual(b.position.toArray(),[3,0,4]);assert.equal(b.userData.objectId,'chair-2');
  assert.deepEqual(a.scale.toArray(),[2,1,1]);assert.deepEqual(b.scale.toArray(),[1,2,1]);
  assert.equal(a.children[0].children[0].geometry,b.children[0].children[0].geometry);
  assert.notEqual(a.children[0],b.children[0]);
});

test('cached reception counters and branded panels preserve every saved yaw, including 180 and 270 degrees',async()=>{
  const {objects}=JSON.parse(await readFile(new URL('../blocks/ground/departure-reception/objects.json',import.meta.url)));
  const cached=createObjectCache(buildObject);
  for(const id of ['departure-reception-main-counter','departure-reception-teal-backdrop']){
    const source=objects.find(o=>o.id===id);
    for(const yaw of [180,0,90,270,-90,135,360]){
      const pose={...source,yaw,position:[32.62,0,6.7]},expected=buildObject(pose),actual=cached(pose);
      expected.updateMatrixWorld(true);actual.updateMatrixWorld(true);
      const parts=model=>{const result=[];model.traverse(n=>{if(n.isMesh||n.isLine)result.push(n);});return result;};
      const left=parts(expected),right=parts(actual);assert.equal(left.length,right.length);
      left.forEach((part,i)=>part.matrixWorld.elements.forEach((value,j)=>
        assert.ok(Math.abs(value-right[i].matrixWorld.elements[j])<1e-8,`${id}, yaw ${yaw}: every component must keep its saved orientation`)));
    }
  }
});

test('instancing keeps the original detailed furniture geometry and triangle count',()=>{
  const root=new THREE.Group(),cached=createObjectCache(buildObject),models=[cached(chair),cached({...chair,id:'chair-2',position:[2,0,0]})];root.add(...models);
  const before=[];root.traverse(m=>{if(m.isMesh)before.push(m.geometry);});
  const triangles=g=>(g.index?.count||g.attributes.position.count)/3;
  const original=before.reduce((sum,g)=>sum+triangles(g),0);
  buildStaticInstances(root,models);
  let after=0;root.traverse(m=>{if(m.isMesh&&m.layers.isEnabled(0)){
    assert.ok(before.includes(m.geometry),'Render the exact original geometry');
    after+=triangles(m.geometry)*(m.isInstancedMesh?m.count:1);
  }});
  assert.equal(after,original);
});

test('soft grounding shadows use one draw and follow furniture without affecting raised objects',()=>{
  const shadows=buildContactShadows([chair,{...chair,id:'raised',position:[0,.7,0]},{...chair,id:'panel',type:'wall-panel'}]);
  assert.equal(shadows.mesh.count,1);assert.equal(shadows.mesh.material.depthWrite,false);
  const matrix=new THREE.Matrix4();shadows.mesh.getMatrixAt(0,matrix);
  assert.ok(Math.abs(matrix.elements[13]+.001)<1e-6);
  const normal=new THREE.Vector3(0,0,1).transformDirection(matrix);assert.ok(normal.y>.999);
  shadows.update(chair.id,{...chair,position:[3,0,4],yaw:180});shadows.mesh.getMatrixAt(0,matrix);
  assert.equal(matrix.elements[12],3);assert.equal(matrix.elements[14],4);
  assert.equal(shadows.mesh.castShadow,false);
});

test('shadow camera covers reception and distant rooms without changing the lighting direction',()=>{
  const root=new THREE.Group(),light=new THREE.DirectionalLight();
  for(const x of [-30,33,65]){const room=new THREE.Mesh(new THREE.BoxGeometry(6,4,8));room.position.set(x,2,6);root.add(room);}
  fitSceneShadows(light,root);
  const direction=light.position.clone().sub(light.target.position).normalize();
  assert.ok(direction.distanceTo(new THREE.Vector3(3,8,5).normalize())<1e-8);
  const bounds=new THREE.Box3().setFromObject(root),camera=light.shadow.camera;
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const p=new THREE.Vector3(x,y,z).project(camera);
    assert.ok(Math.abs(p.x)<=1&&Math.abs(p.y)<=1&&Math.abs(p.z)<=1,'Entire map must be inside the cached shadow camera');
  }
});


test('visible animated media keeps an idle viewer updating at a bounded rate and stops when hidden',()=>{
  let id=0,animated=true,renders=0;const frames=new Map(),timers=new Map();
  const loop=createRenderLoop({clock:()=>0,update:()=>false,needsAnimation:()=>animated,render:()=>renders++,
    request:fn=>{frames.set(++id,fn);return id;},cancel:i=>frames.delete(i),
    defer:(fn,delay)=>{timers.set(++id,{fn,delay});return id;},clear:i=>timers.delete(i)});
  const frame=()=>{const [i,fn]=frames.entries().next().value;frames.delete(i);fn();};
  const timer=()=>{const [i,t]=timers.entries().next().value;timers.delete(i);t.fn();};
  loop.invalidate();frame();assert.equal(renders,1);assert.equal(frames.size,0);
  assert.equal(timers.size,1);assert.equal(timers.values().next().value.delay,1000/15);
  timer();frame();assert.equal(renders,2);assert.equal(timers.size,1);
  animated=false;timer();frame();assert.equal(timers.size,0);assert.equal(frames.size,0);
  animated=true;loop.invalidate();frame();assert.equal(timers.size,1);
  loop.dispose();assert.equal(timers.size,0);
});

test('cached animated display callbacks survive combined-view cloning and stay out of static batches',()=>{
  let draws=0;const geometry=new THREE.BoxGeometry(1,2,1),material=new THREE.MeshBasicMaterial();
  const cache=createObjectCache(()=>{
    const group=new THREE.Group(),screen=new THREE.Mesh(geometry,material);
    screen.name='Animated screen';screen.userData.animated=true;screen.onBeforeRender=()=>draws++;
    group.add(screen);return group;
  });
  const root=new THREE.Group(),models=[0,1].map(i=>cache({id:`screen-${i}`,name:'Display',type:'wall-panel',variant:'cylindrical-display',position:[i*2,0,0],yaw:0,scale:[1,1,1]}));
  root.add(...models);
  for(const model of models){const screen=model.getObjectByName('Animated screen');assert.equal(screen.userData.animated,true);screen.onBeforeRender();}
  assert.equal(draws,2);
  const batches=buildStaticInstances(root,models);assert.equal(batches.stats.instancedMeshes,0);
  for(const model of models)assert.ok(model.getObjectByName('Animated screen').layers.isEnabled(0));
  batches.dispose();geometry.dispose();material.dispose();
});
