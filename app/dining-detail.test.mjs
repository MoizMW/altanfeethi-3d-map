import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {buildArchitecture} from './architecture.js';
import {buildObject} from './object-builders.js';
const read=async file=>JSON.parse(await readFile(new URL(`../blocks/ground/g3-g24-g25/${file}.json`,import.meta.url)));

test('dining cream breaks remain closed and gold/ivory details respect full and cutaway blue bays',async()=>{
 const architecture=await read('architecture');
 for(const cutaway of [false,true]){
  const shell=buildArchitecture(architecture,{cutaway});shell.updateMatrixWorld(true);
  for(const wall of architecture.walls.filter(w=>w.variant==='opaque-blue-panel')){
   assert.equal(wall.surfacePattern,'white-geometric');
   const group=shell.children.find(g=>g.userData.boundaryId===wall.id);
   assert.ok(group.children.some(m=>m.name==='Gold glass edge'));
   assert.ok(group.children.some(m=>m.name==='Fine white geometric glass etching'));
   assert.ok(!group.children.some(m=>m.name==='Fine curved cladding etching'));
   for(const mesh of group.children){
    const bounds=new THREE.Box3().setFromObject(mesh);
    assert.ok(bounds.max.y<=(cutaway?1.05:wall.height)+.015,'Trim must not float above cutaway');
   }
   for(const section of wall.creamSections){
    const x=wall.start[0]+(section.start+section.end)/2,z=wall.start[1];
    assert.ok(new THREE.Raycaster(new THREE.Vector3(x,.7,z+1),new THREE.Vector3(0,0,-1),0,2).intersectObject(shell,true).length,'Cream finish cannot open the closed wall');
   }
  }
 }
});

test('photo-reviewed dining details build finite editable models without adding occupancy IDs',async()=>{
 const {objects}=await read('objects');
 assert.equal(objects.flatMap(o=>o.seats).length,30);
 for(const object of objects){
  const model=buildObject(object);model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model);
  assert.ok([...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite),object.id);
  assert.equal(model.userData.objectId,object.id);
 }
 const details=objects.filter(o=>o.variant?.startsWith('dining-'));
 assert.ok(details.some(o=>o.variant==='dining-palm'));
 assert.ok(details.some(o=>o.variant==='dining-lantern-stand'));
 assert.ok(details.every(o=>!o.seats.length));
 assert.equal(objects.find(o=>o.id==='g3-g24-g25-art-north').variant,'framed-art','Unidentified royal painting remains unresolved');
});
