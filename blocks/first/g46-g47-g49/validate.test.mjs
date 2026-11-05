import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import * as THREE from '../../../app/node_modules/three/build/three.module.js';
import {validateBlock} from '../../../shared/schema/block-schema.js';
import {buildObject} from '../../../app/object-builders.js';
import {buildArchitecture} from '../../../app/architecture.js';
import {buildFloors} from '../../../app/floors.js';
import {composeLayout} from '../../../app/layouts.mjs';
const root=new URL('../../../',import.meta.url);
const read=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const load=async key=>{
  const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(f=>read(`blocks/${key}/${f}.json`)));
  return {block:{...m,architecture:a,placement:a.placement,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e}};
};
const {block}=await load('first/g46-g47-g49'),e=block.evidence,a=block.architecture;

test('right lounges reconcile 16 physical seats and five table identities across all three groups',async()=>{
  validateBlock(block);assert.deepEqual(block.groups,['g46','g47','g49']);
  const seats=block.objects.flatMap(o=>o.seats),tables=block.objects.filter(o=>o.externalId).map(o=>o.externalId);
  assert.deepEqual(seats.slice().sort(),Array.from({length:16},(_,i)=>i+40===63?'Seat_H63p':`Seat_H${i+40}`).sort());
  assert.deepEqual(tables.slice().sort(),[15,16,17,19,20].map(n=>`Table_H${n}`).sort());
  const excluded=new Set(e.excludedObservations.seats.map(o=>o.id));assert.deepEqual([...excluded].sort(),['Seat_H63','Seat_H65']);
  for(const r of Object.values(e.rois)){
    for(const id of Object.keys(await read(r.chairs)))assert.ok(seats.includes(id)||excluded.has(id),id);
    for(const id of Object.keys(await read(r.tables)))assert.ok(tables.includes(id),id);
  }
  assert.equal(block.objects.filter(o=>o.type==='sofa').length,2);
  assert.equal(block.objects.filter(o=>o.variant==='side-shell-chair').length,8);
  assert.equal(block.objects.filter(o=>o.variant==='center-leather-chair').length,4);
  assert.equal(block.objects.filter(o=>o.variant==='nested-stone').length,1);
});

test('right lounge evidence preserves real registration and does not invent H52 ROI or H44 position',async()=>{
  const registration=await read('evidence/registration/camera-placements.json');
  for(const camera of e.cameras)for(const path of [e.snapshots[camera],e.wideSnapshots[camera]])await access(new URL(path,root));
  for(const anchor of a.placement.anchors){const camera=registration.cameras.find(c=>c.id===anchor.camera);assert.deepEqual(anchor.pixel,[camera.position.x,camera.position.y]);assert.equal(anchor.heading,camera.heading);}
  assert.ok(!e.rois.H52);assert.ok(e.primaryCameras.includes('H52'));
  assert.ok(!a.placement.anchors.some(c=>c.camera==='H44'));assert.equal(registration.cameras.find(c=>c.id==='H44').position,null);
  for(const object of block.objects)assert.ok(object.cameras.length&&object.cameras.every(c=>e.cameras.includes(c)),object.id);
});

test('right furniture uses finite geometry with grounded seating and attached divider ornaments',()=>{
  for(const object of block.objects){
    const model=buildObject(object);model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model);
    assert.ok(!bounds.isEmpty()&&[...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite),object.id);
    assert.deepEqual(model.position.toArray(),object.position);
    if(object.variant==='side-wall-light')assert.ok(bounds.min.y>=1.7&&bounds.max.y<=2.9);
    else if(object.type==='tissue-box')assert.ok(bounds.min.y>0,'Tissue box rests on a table');
    else assert.ok(bounds.min.y>=-.04&&bounds.min.y<.1,`${object.id}: must contact floor`);
    if(object.variant==='side-shell-chair')assert.ok(model.getObjectByName('Wrapped barrel back and arms'));
    if(object.variant==='side-curved-divider'){
      assert.ok(model.getObjectByName('Dark ring sculpture on divider'));
      assert.ok(model.getObjectByName('Pale stone divider cap'));
    }
  }
  assert.equal(buildFloors(block).children.filter(m=>m.material.name==='Center lounge woven carpet').length,4);
});

test('center/right composition loads saved furniture rigidly with 48 unique seats and a single floor seam',async()=>{
  const {block:combined}=await composeLayout(fileURLToPath(root),'first/center-right',load);
  const original=combined.objects.filter(o=>['first/g52-g55','first/g46-g47-g49'].includes(o.sourceBlock));
  const seats=original.flatMap(o=>o.seats),tables=original.filter(o=>o.externalId).map(o=>o.externalId);
  assert.deepEqual(seats.slice().sort(),Array.from({length:48},(_,i)=>i+40===63?'Seat_H63p':`Seat_H${i+40}`).sort());
  assert.equal(new Set(tables).size,15);assert.equal(tables.length,15);
  for(const [key,offset] of [['first/g52-g55',0],['first/g46-g47-g49',7.8]]){
    const source=(await load(key)).block;
    for(const saved of source.objects){
      const actual=combined.objects.find(o=>o.id===saved.id);assert.ok(actual,saved.id);
      for(const field of ['yaw','size','scale','seats','color','shellColor','variant','externalId'])assert.deepEqual(actual[field],saved[field]);
      assert.deepEqual(actual.position,[saved.position[0]+offset,saved.position[1],saved.position[2]]);
    }
  }
  const [center,row]=combined.architecture.floorSections;
  assert.equal(row.center[0]-row.size[0]/2,center.center[0]+center.size[0]/2);
  assert.equal(center.center[0]+center.size[0]/2,5.3);
  assert.ok(combined.objects.filter(o=>o.sourceBlock==='first/g46-g47-g49').every(o=>o.position[0]>5.3),'Side furniture must be to the right of the center');
  const backing=combined.architecture.walls.filter(w=>['g46-g47-g49-wood-backing','g46-g47-g49-g46-stone-backing'].includes(w.id));
  assert.equal(backing.length,2);
  for(const w of backing){assert.equal(w.start[0],10.2);assert.equal(w.end[0],10.2);}
  const endReturn=combined.architecture.walls.find(w=>w.id==='g46-g47-g49-wood-end-return');
  assert.deepEqual(endReturn.start,[10.2,-10.6]);assert.deepEqual(endReturn.end,[5.3,-10.6]);
  assert.equal(combined.architecture.walls.filter(w=>w.variant==='reeded-divider'&&w.owner==='first/g52-g55').length,4);
});

test('right and combined scenes retain an open full-length dark aisle and connected floor access',async()=>{
  for(const [sceneBlock,x] of [[block,-2.2],[(await composeLayout(fileURLToPath(root),'first/center-right',load)).block,5.5]]){
    const scene=new THREE.Group();scene.add(buildArchitecture(sceneBlock.architecture));for(const o of sceneBlock.objects)scene.add(buildObject(o));scene.updateMatrixWorld(true);
    for(const y of [.3,.7,1.2]){
      const ray=new THREE.Raycaster(new THREE.Vector3(x,y,-9.5),new THREE.Vector3(0,0,1),0,20.6);
      assert.equal(ray.intersectObject(scene,true).filter(hit=>hit.object.isMesh).length,0,`Clear aisle at ${x}, ${y}`);
    }
    const floor=buildFloors(sceneBlock);floor.updateMatrixWorld(true);
    for(const z of [-9,0,5.7,10.8])assert.ok(new THREE.Raycaster(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0)).intersectObject(floor,true).length,'Aisle must have continuous floor');
  }
});
