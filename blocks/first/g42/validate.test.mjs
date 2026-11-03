import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import * as THREE from '../../../app/node_modules/three/build/three.module.js';
import {validateBlock} from '../../../shared/schema/block-schema.js';
import {buildArchitecture} from '../../../app/architecture.js';
import {buildShellLoungeChair} from '../../../app/lounge-objects.js';
const root=new URL('../../../',import.meta.url);
const read=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(f=>read(`blocks/first/g42/${f}.json`)));
const block={...m,architecture:a,placement:a.placement,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e};

test('G42 retains four chairs and two distinct table identities from original first-floor evidence',async()=>{
  validateBlock(block);assert.equal(block.floor,'first');assert.equal(block.objects.length,6);
  const seats=new Set(),tables=new Set(),registration=await read('evidence/registration/camera-placements.json');
  for(const camera of e.cameras){
    for(const [kind,labels] of [['chairs',seats],['tables',tables]])for(const label of Object.keys(await read(e.rois[camera][kind])))labels.add(label);
    await access(new URL(e.snapshots[camera],root));
    const c=registration.cameras.find(c=>c.id===camera),anchor=a.placement.anchors.find(c=>c.camera===camera);
    assert.equal(c.floor,'first');assert.equal(c.group_id,'g42');assert.deepEqual(anchor.pixel,[c.position.x,c.position.y]);assert.equal(anchor.heading,c.heading);
  }
  assert.deepEqual(block.objects.flatMap(o=>o.seats).sort(),[...seats].sort());
  assert.deepEqual([...seats].sort(),['Seat_H17','Seat_H18','Seat_H19','Seat_H20']);
  assert.deepEqual(block.objects.filter(o=>o.externalId).map(o=>o.externalId).sort(),[...tables].sort());
  assert.equal(block.objects.filter(o=>o.type==='armchair').length,4);
  assert.deepEqual(Object.keys(e.wideSnapshots),['H18']);await access(new URL(e.wideSnapshots.H18,root));
});

test('G42 facing pairs surround their tables and leave the cropped access strip clear',()=>{
  for(const [pair,tableId] of [[['Seat_H20','Seat_H19'],'Table_H9'],[['Seat_H18','Seat_H17'],'Table_H8']]){
    const chairs=pair.map(id=>block.objects.find(o=>o.seats.includes(id))),table=block.objects.find(o=>o.externalId===tableId);
    assert.ok(chairs[0].position[2]<table.position[2]);assert.ok(chairs[1].position[2]>table.position[2]);
    assert.equal(chairs[0].yaw,0);assert.equal(chairs[1].yaw,180);
  }
  for(const o of block.objects){
    const angle=o.yaw*Math.PI/180,[w,,d]=o.size;
    const dx=(Math.abs(Math.cos(angle))*w+Math.abs(Math.sin(angle))*d)/2;
    const dz=(Math.abs(Math.sin(angle))*w+Math.abs(Math.cos(angle))*d)/2;
    assert.ok(o.position[0]-dx>=-.65,`${o.id} blocks access`);
    assert.ok(Math.abs(o.position[0])+dx<=1.6);assert.ok(Math.abs(o.position[2])+dz<=4.3);
  }
  const shell=buildArchitecture(a);shell.updateMatrixWorld(true);
  assert.equal(new THREE.Raycaster(new THREE.Vector3(-1,.7,-5),new THREE.Vector3(0,0,1)).intersectObject(shell,true).filter(hit=>hit.object.isMesh).length,0);
});

test('shell lounge variant has finite geometry, grounded supports and separate cushion finish',()=>{
  const chair=buildShellLoungeChair({color:'#eeeadd',shellColor:'#a48246'});
  const bounds=new THREE.Box3().setFromObject(chair);assert.ok(bounds.min.y>=-.01);assert.ok(bounds.max.y<1);
  assert.equal(chair.getObjectByName('Curved upholstered shell').material.color.getHexString(),'a48246');
  assert.equal(chair.getObjectByName('Oval seat cushion').material.color.getHexString(),'eeeadd');
  assert.equal(chair.getObjectByName('Light back cushion').material.color.getHexString(),'eeeadd');
  chair.traverse(mesh=>{if(mesh.isMesh)assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite));});
});
