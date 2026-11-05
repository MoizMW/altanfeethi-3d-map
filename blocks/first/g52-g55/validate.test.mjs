import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import * as THREE from '../../../app/node_modules/three/build/three.module.js';
import {validateBlock} from '../../../shared/schema/block-schema.js';
import {buildObject} from '../../../app/object-builders.js';
import {buildArchitecture} from '../../../app/architecture.js';
import {buildFloors} from '../../../app/floors.js';
const root=new URL('../../../',import.meta.url);
const read=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(f=>read(`blocks/first/g52-g55/${f}.json`)));
const block={...m,architecture:a,placement:a.placement,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e};

test('center lounge reconciles all four groups into 32 unique seats and ten tables',async()=>{
  validateBlock(block);assert.deepEqual(m.groups,['g52','g53','g54','g55']);
  const seats=block.objects.flatMap(o=>o.seats),tables=block.objects.filter(o=>o.externalId).map(o=>o.externalId);
  assert.deepEqual(seats.slice().sort(),Array.from({length:32},(_,i)=>i+56===63?'Seat_H63p':`Seat_H${i+56}`).sort());
  assert.equal(new Set(seats).size,32);
  assert.deepEqual(tables.slice().sort(),[22,23,24,26,27,28,29,31,32,33].map(n=>`Table_H${n}`).sort());
  const excluded=new Set(e.excludedObservations.seats.map(o=>o.id)),excludedTables=new Set(e.excludedObservations.tables.map(o=>o.id));
  for(const r of Object.values(e.rois)){
    for(const id of Object.keys(await read(r.chairs))){
      // Keep the saved editable ID; historical camera ROIs still use Seat_H63.
      const savedId=id==='Seat_H63'?'Seat_H63p':id;
      assert.equal(seats.includes(savedId)?1:excluded.has(id)?1:0,1,`Unreconciled ${id}`);
    }
    for(const id of Object.keys(await read(r.tables)))assert.equal(tables.includes(id)?1:excludedTables.has(id)?1:0,1,`Unreconciled ${id}`);
  }
  assert.equal(block.objects.filter(o=>o.type==='sofa').length,4);
  assert.equal(block.objects.filter(o=>o.variant==='center-barrel-chair').length,12);
  assert.equal(block.objects.filter(o=>o.variant==='center-leather-chair').length,8);
  assert.ok([...excluded].every(id=>!seats.includes(id)));
});

test('center evidence keeps normal/wide paths valid and never invents H44 placement',async()=>{
  const registration=await read('evidence/registration/camera-placements.json');
  for(const c of e.cameras)for(const f of [e.snapshots[c],e.wideSnapshots[c]])await access(new URL(f,root));
  for(const anchor of a.placement.anchors){const camera=registration.cameras.find(c=>c.id===anchor.camera);assert.deepEqual(anchor.pixel,[camera.position.x,camera.position.y]);assert.equal(anchor.heading,camera.heading);}
  assert.ok(!a.placement.anchors.some(c=>c.camera==='H44'));
  assert.equal(registration.cameras.find(c=>c.id==='H44').status,'unplaced');
  assert.deepEqual(e.sourceImageSizes.H44,[3840,2160]);
  for(const object of o.objects)assert.ok(object.cameras.length&&object.cameras.every(c=>e.cameras.includes(c)),object.id);
});

test('center floor has genuine carpet cutouts, open side walks and cross-room routes',()=>{
  const floor=buildFloors(block),carpet=floor.children.find(c=>c.name==='g52-g55-distressed-carpet');
  floor.updateMatrixWorld(true);assert.equal(carpet.material.name,'Center lounge woven carpet');assert.equal(carpet.material.roughness,1);
  for(const z of [-4.7,4.7]){
    assert.equal(new THREE.Raycaster(new THREE.Vector3(0,1,z),new THREE.Vector3(0,-1,0)).intersectObject(carpet).length,0,'Tree bed must cut through carpet');
    assert.ok(new THREE.Raycaster(new THREE.Vector3(1.1,1,z),new THREE.Vector3(0,-1,0)).intersectObject(carpet).length);
  }
  const scene=new THREE.Group();scene.add(buildArchitecture(a));for(const object of block.objects)scene.add(buildObject(object));scene.updateMatrixWorld(true);
  const clear=(origin,direction,distance)=>assert.equal(new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction),0,distance).intersectObject(scene,true).filter(hit=>hit.object.isMesh).length,0);
  for(const x of [-5,5])clear([x,.7,-10.2],[0,0,1],21.5);
  for(const z of [-2.4,2.4])clear([-5,.7,z],[1,0,0],10);
  clear([0,.7,-9.5],[0,0,1],4);clear([0,.7,6],[0,0,1],5.4);
});

test('center furniture builds finite supported geometry with correct edit transforms',()=>{
  for(const object of block.objects){
    const built=buildObject(object);built.updateMatrixWorld(true);
    assert.deepEqual(built.position.toArray(),object.position);assert.equal(built.rotation.y,THREE.MathUtils.degToRad(object.yaw));
    const bounds=new THREE.Box3().setFromObject(built);assert.ok(!bounds.isEmpty(),object.id);
    assert.ok([...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite),object.id);
    if(object.variant==='center-pendant')assert.ok(bounds.min.y>2.4&&bounds.max.y<=3.56,'Pendant hangs from the frame above walking height');
    else if(object.type==='tissue-box')assert.ok(bounds.min.y>0,'Tissue box rests on a table');
    else assert.ok(bounds.min.y>=-.04&&bounds.min.y<.1,`${object.id}: supported on floor`);
    if(object.type==='armchair')assert.ok(built.getObjectByName('Wrapped barrel back and arms'));
    if(object.type==='sofa')for(let i=1;i<=3;i++)assert.ok(built.getObjectByName(`Curved seat cushion ${i}`));
  }
});
