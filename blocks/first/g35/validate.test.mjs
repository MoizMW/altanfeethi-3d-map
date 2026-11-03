import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import * as THREE from '../../../app/node_modules/three/build/three.module.js';
import {validateBlock} from '../../../shared/schema/block-schema.js';
import {buildNestedStoneTable} from '../../../app/lounge-tables.js';
import {buildArchitecture} from '../../../app/architecture.js';
const root=new URL('../../../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const [manifest,architecture,data,evidence]=await Promise.all(['manifest','architecture','objects','evidence'].map(f=>read(`blocks/first/g35/${f}.json`)));
const block={...manifest,architecture,placement:architecture.placement,floorSize:architecture.floorSize,ceilingHeight:architecture.ceilingHeight,objects:data.objects,evidence};

test('G35 reconciles four seat slots and one table set across both first-floor cameras',async()=>{
  validateBlock(block);assert.equal(block.floor,'first');
  const seats=new Set(),tables=new Set();
  for(const camera of evidence.cameras){
    for(const [kind,labels] of [['chairs',seats],['tables',tables]])for(const label of Object.keys(await read(evidence.rois[camera][kind])))labels.add(label);
    await access(new URL(evidence.snapshots[camera],root));
    await access(new URL(evidence.wideSnapshots[camera],root));
  }
  assert.deepEqual(block.objects.flatMap(o=>o.seats).sort(),[...seats].sort());
  assert.deepEqual([...seats].sort(),['Seat_H1','Seat_H2','Seat_H3','Seat_H4']);
  assert.deepEqual(block.objects.filter(o=>o.externalId).map(o=>o.externalId),[...tables]);
  assert.equal(block.objects.filter(o=>o.type==='sofa').length,1);
  assert.equal(block.objects.filter(o=>o.type==='armchair').length,2);
  const registration=await read('evidence/registration/camera-placements.json');
  for(const anchor of architecture.placement.anchors){const c=registration.cameras.find(c=>c.id===anchor.camera);assert.equal(c.floor,'first');assert.equal(c.group_id,'g35');assert.deepEqual(anchor.pixel,[c.position.x,c.position.y]);assert.equal(anchor.heading,c.heading);}
});

test('G35 furniture clears the escalator-side access and stays inside its crop',()=>{
  const xs=architecture.circulation.polygon.map(p=>p[0]),zs=architecture.circulation.polygon.map(p=>p[1]);
  for(const o of block.objects){
    const yaw=o.yaw*Math.PI/180,[w,,d]=o.size;
    const dx=(Math.abs(Math.cos(yaw))*w+Math.abs(Math.sin(yaw))*d)/2;
    const dz=(Math.abs(Math.sin(yaw))*w+Math.abs(Math.cos(yaw))*d)/2;
    assert.ok(Math.abs(o.position[0])+dx<=2.4,`${o.id} outside width`);
    assert.ok(Math.abs(o.position[2])+dz<=2.8,`${o.id} outside length`);
    const overlaps=o.position[2]+dz>Math.min(...zs)&&o.position[2]-dz<Math.max(...zs);
    if(overlaps)assert.ok(o.position[0]-dx>=Math.max(...xs)||o.position[0]+dx<=Math.min(...xs),`${o.id} blocks access`);
  }
});

test('G35 vertical plan flip keeps the sofa facing the chair pair and records composition intent',()=>{
  const sofa=block.objects.find(o=>o.type==='sofa');
  assert.ok(sofa.position[2]>0);
  assert.equal(sofa.yaw,180);
  for(const chair of block.objects.filter(o=>o.type==='armchair')){assert.ok(chair.position[2]<0);assert.equal(chair.yaw,0);}
  assert.deepEqual(sofa.seats,['Seat_H1','Seat_H2']);
  assert.ok(architecture.walls.find(w=>w.id==='g35-sofa-backing').start[1]>sofa.position[2]);
  assert.match(architecture.placement.orientationReview.compositionIntent,/upper-right/);
});

test('nested stone table creates finite geometry with grounded supports and two stone surfaces',()=>{
  const g=buildNestedStoneTable(new THREE.Group());
  const bounds=new THREE.Box3().setFromObject(g);
  assert.ok(bounds.min.y>=-1e-8);
  assert.ok(bounds.max.y<.75);
  assert.equal(g.children.filter(c=>c.material.color.getHexString()==='e5e1d5').length,2);
  for(const mesh of g.children)assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite));
});

test('wood cladding follows structural cutaways so it cannot hide furniture in low-wall mode',()=>{
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(architecture,{cutaway});
    for(const w of architecture.walls.filter(w=>w.kind==='solid')){
      const wall=shell.children.find(g=>g.userData.boundaryId===w.id);
      const bounds=new THREE.Box3().setFromObject(wall);
      assert.ok(Math.abs(bounds.max.y-(cutaway?1.05:4.1))<.01);
    }
  }
});
