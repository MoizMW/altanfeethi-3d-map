import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateBlock} from '../shared/schema/block-schema.js';
import {server} from './server.mjs';
import * as THREE from 'three';
import {buildArchitecture} from './architecture.js';

test('G9 equals G11 area while the G-zone half remains open at both ends',async()=>{
  const [g9,g11]=await Promise.all(['g9','g11'].map(async key=>JSON.parse(await readFile(new URL(`../blocks/ground/${key}/architecture.json`,import.meta.url)))));
  assert.equal(g9.floorSize[0]*g9.floorSize[1],g11.floorSize[0]*g11.floorSize[1]);
  const shell=buildArchitecture(g9);shell.updateMatrixWorld(true);
  for(const [z,dz]of [[4,-1],[-4,1]])assert.equal(new THREE.Raycaster(new THREE.Vector3(-3.5,1,z),new THREE.Vector3(0,0,dz)).intersectObject(shell,true).length,0);
  assert.ok(new THREE.Raycaster(new THREE.Vector3(-3.5,3.6,4),new THREE.Vector3(0,0,-1)).intersectObject(shell,true).length,'Passage entrance must have a rounded wall surround overhead');
  assert.ok(new THREE.Raycaster(new THREE.Vector3(-6,1,0),new THREE.Vector3(1,0,0)).intersectObject(shell,true).length,'Outer left wall must enclose the passage side');
  assert.equal(g9.circulation.surfaceMaterial,'same-as-seating');assert.equal(g9.walls.find(w=>w.id==='g9-tv-wall').finish,'teal-gold-panels');
  const glass=new THREE.Raycaster(new THREE.Vector3(0,1,-4),new THREE.Vector3(0,0,1)).intersectObject(shell,true);assert.ok(glass.length);
  const entrance=new THREE.Raycaster(new THREE.Vector3(0,1,4),new THREE.Vector3(0,0,-1)).intersectObject(shell,true);assert.ok(entrance.length);assert.ok(entrance[0].point.z<0,'Rounded entrance must remain clear');
});

test('G11 access passages remain clear while side walls and glazing close the shell',async()=>{
  const a=JSON.parse(await readFile(new URL('../blocks/ground/g11/architecture.json',import.meta.url)));
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);
    for(const z of [-2,2]){const ray=new THREE.Raycaster(new THREE.Vector3(-4,.7,z),new THREE.Vector3(1,0,0));const hits=ray.intersectObject(shell,true);assert.ok(hits.length);assert.ok(hits[0].point.x>2.8,'Passage must reach the opposite glass without intersecting an entrance wall');}
    const ray=new THREE.Raycaster(new THREE.Vector3(0,.7,5),new THREE.Vector3(0,0,-1));assert.ok(Math.abs(ray.intersectObject(shell,true)[0].point.z-3.6)<.2);
  }
  const full=buildArchitecture(a,{ceiling:true});full.updateMatrixWorld(true);assert.ok(new THREE.Raycaster(new THREE.Vector3(0,5,0),new THREE.Vector3(0,-1,0)).intersectObject(full,true)[0].point.y>=4.1);
});

const basePath=new URL('../blocks/ground/g9/',import.meta.url);
const [manifest,architecture,objects,evidence]=await Promise.all(['manifest.json','architecture.json','objects.json','evidence.json'].map(async file=>JSON.parse(await readFile(new URL(file,basePath)))));
const block={...manifest,placement:architecture.placement,floorSize:architecture.floorSize,ceilingHeight:architecture.ceilingHeight,architecture,evidence,objects:objects.objects};

test('G9 block composes from four independently owned files',()=>{
  validateBlock(block);assert.equal(block.objects.filter(o=>o.seats.length).length,3);assert.equal(block.objects.flatMap(o=>o.seats).length,4);assert.equal(block.objects.filter(o=>o.externalId==='Table_B1').length,1);
});

test('chair seat ID can change while physical ID remains stable',()=>{
  const copy=structuredClone(block),chair=copy.objects.find(o=>o.type==='armchair'),physicalId=chair.id;chair.seats=['Seat_B17'];chair.size=[1.05,.95,1.02];chair.scale=[1.1,1,1];chair.yaw=45;assert.equal(validateBlock(copy),copy);assert.equal(chair.id,physicalId);
});

test('G11 resolves repeated camera observations into eight seat slots and two ROI tables',async()=>{
  const base=new URL('../blocks/ground/g11/',import.meta.url);
  const [m,a,o,e]=await Promise.all(['manifest.json','architecture.json','objects.json','evidence.json'].map(async f=>JSON.parse(await readFile(new URL(f,base)))));
  validateBlock({...m,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects});
  assert.equal(o.objects.filter(x=>x.type==='sofa').length,2);assert.equal(o.objects.filter(x=>x.type==='armchair').length,4);
  assert.deepEqual(o.objects.flatMap(x=>x.seats).sort(),Array.from({length:8},(_,i)=>`Seat_C${i+1}`));
  assert.deepEqual(o.objects.filter(x=>x.externalId).map(x=>x.externalId).sort(),['Table_C1','Table_C2']);
  const roiSeats=new Set();for(const c of e.cameras){const roi=JSON.parse(await readFile(new URL(`../${e.rois[c].chairs}`,import.meta.url)));for(const s of Object.keys(roi))roiSeats.add(s);}
  assert.deepEqual([...roiSeats].sort(),o.objects.flatMap(x=>x.seats).sort());
});

test('duplicate IDs, duplicate seats and invalid dimensions are rejected',()=>{
  for(const mutate of [b=>b.objects[1].seats=['Seat_B3'],b=>b.objects[1].id=b.objects[0].id,b=>b.objects[0].position[0]=NaN,b=>b.objects[0].size[0]=-1]){const copy=structuredClone(block);mutate(copy);assert.throws(()=>validateBlock(copy));}
});

for(const slug of ['g18','g20'])test(`${slug.toUpperCase()} reconciles ROI identities and keeps furniture outside the through path`,async()=>{
  const base=new URL(`../blocks/ground/${slug}/`,import.meta.url);
  const [m,a,o,e]=await Promise.all(['manifest.json','architecture.json','objects.json','evidence.json'].map(async f=>JSON.parse(await readFile(new URL(f,base)))));
  const draft=validateBlock({...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects});
  const observedSeats=new Set(),observedTables=new Set();
  for(const camera of e.cameras)for(const [kind,labels] of [['chairs',observedSeats],['tables',observedTables]]){
    const roi=JSON.parse(await readFile(new URL(`../${e.rois[camera][kind]}`,import.meta.url)));
    for(const label of Object.keys(roi))labels.add(label);
  }
  assert.deepEqual(draft.objects.flatMap(x=>x.seats).sort(),[...observedSeats].sort());
  const localTables=draft.objects.filter(x=>x.externalId).map(x=>x.externalId);
  const externalTables=(e.externalObservations||[]).map(x=>x.externalId);
  assert.deepEqual([...localTables,...externalTables].sort(),[...observedTables].sort());
  const context=draft.objects.filter(x=>x.ownershipStatus==='provisional-context-neighbor-unresolved');
  assert.deepEqual(context.map(x=>x.externalId).sort(),slug==='g18'?['Table_G1','Table_G2']:[]);
  const shell=buildArchitecture(a);shell.updateMatrixWorld(true);
  const pathXs=a.circulation.polygon.map(p=>p[0]);
  for(const x of [Math.min(...pathXs)+.05,0,Math.max(...pathXs)-.05]){
    assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,-7),new THREE.Vector3(0,0,1)).intersectObject(shell,true).length,0);
  }
  for(const object of draft.objects){
    const angle=THREE.MathUtils.degToRad(object.yaw),[w,,d]=object.size;
    const extentX=(Math.abs(Math.cos(angle))*w+Math.abs(Math.sin(angle))*d)/2;
    assert.ok(object.position[0]+extentX<=Math.min(...pathXs)||object.position[0]-extentX>=Math.max(...pathXs),`${object.id} obstructs the central path`);
  }
});

test('G20 background observations resolve to existing G18 objects and raised plants meet their supports',async()=>{
  const [g18,g20,evidence]=await Promise.all(['g18/objects.json','g20/objects.json','g20/evidence.json'].map(async path=>JSON.parse(await readFile(new URL(`../blocks/ground/${path}`,import.meta.url)))));
  const tableIds=[...g18.objects,...g20.objects].filter(o=>o.externalId).map(o=>o.externalId);
  assert.equal(new Set(tableIds).size,tableIds.length,'Neighboring blocks must not own duplicate ROI tables');
  for(const ref of evidence.externalObservations){
    assert.equal(ref.ownerBlock,'ground/g18');
    assert.equal(g18.objects.find(o=>o.id===ref.objectId)?.externalId,ref.externalId);
    assert.ok(!g20.objects.some(o=>o.externalId===ref.externalId));
    const roi=JSON.parse(await readFile(new URL(`../${ref.roiFile}`,import.meta.url)));
    assert.ok(roi[ref.externalId]);
  }
  for(const plant of g20.objects.filter(o=>o.supportObjectId)){
    const support=g20.objects.find(o=>o.id===plant.supportObjectId);
    assert.ok(support,'Raised plants require a real support object');
    assert.equal(plant.position[1],support.position[1]+support.size[1]);
    assert.ok(Math.abs(plant.position[0]-support.position[0])+plant.size[0]/2<=support.size[0]/2);
    assert.ok(Math.abs(plant.position[2]-support.position[2])+plant.size[2]/2<=support.size[2]/2);
  }
});

test('sofa slots can be renamed and swapped; table identity is optional and unique',()=>{
  const copy=structuredClone(block),sofa=copy.objects.find(o=>o.type==='sofa'),physical=sofa.id;
  sofa.seats=[...sofa.seats].reverse();validateBlock(copy);assert.equal(sofa.id,physical);
  sofa.seats=['Seat_review_left','Seat_review_right'];validateBlock(copy);
  sofa.seats[1]=sofa.seats[0];assert.throws(()=>validateBlock(copy));sofa.seats[1]='Seat_review_right';
  const table=copy.objects.find(o=>o.type==='table');delete table.externalId;validateBlock(copy);
  table.externalId='Table_review';validateBlock(copy);
  copy.objects.push({...structuredClone(table),id:'test-second-table'});assert.throws(()=>validateBlock(copy),/Table ID already/);
  copy.objects.pop();table.externalId='invalid table id';assert.throws(()=>validateBlock(copy),/Table ID must/);
});

test('server lists and serves blocks, evidence, shared schema and stale-write protection',async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const origin=`http://127.0.0.1:${server.address().port}`,query='?block=ground%2Fg9';
    const listing=await(await fetch(`${origin}/api/blocks`)).json();assert.ok(listing.blocks.some(b=>b.key==='ground/g9'));assert.ok(listing.blocks.some(b=>b.key==='ground/g32'));
    const response=await fetch(`${origin}/api/block${query}`);assert.equal(response.status,200);const data=await response.json();assert.deepEqual(data.block.objects,block.objects);
    const stale=await fetch(`${origin}/api/block${query}`,{method:'PUT',body:JSON.stringify({revision:'stale',block})});assert.equal(stale.status,409);
    const jpg=Buffer.from(await(await fetch(`${origin}/api/evidence/camera/B1${query}`)).arrayBuffer());assert.equal(jpg[0],255);assert.equal(jpg[1],216);
    assert.equal((await fetch(`${origin}/shared/schema/block-schema.js`)).status,200);assert.equal((await fetch(`${origin}/server.mjs`)).status,404);assert.equal((await fetch(`${origin}/api/block?block=../../private`)).status,400);
    const g32=await(await fetch(`${origin}/api/block?block=ground/g32`)).json();validateBlock(g32.block);
    for(const slug of ['g18','g20']){
      assert.ok(listing.blocks.some(b=>b.key===`ground/${slug}`));
      const data=await(await fetch(`${origin}/api/block?block=ground/${slug}`)).json();validateBlock(data.block);
      for(const id of data.block.evidence.cameras)assert.equal((await fetch(`${origin}/api/evidence/camera/${id}?block=ground/${slug}`)).status,200);
    }
    assert.equal(g32.block.objects.filter(o=>o.type==='counter').length,4);
    const staff=g32.block.objects.filter(o=>o.type==='office-chair');assert.equal(staff.length,7);
    staff[0].seats=['Seat_SGS_reviewed_01'];staff[0].yaw=30;staff[0].size=[.7,1.3,.75];validateBlock(g32.block);
    staff[1].seats=staff[0].seats;assert.throws(()=>validateBlock(g32.block),/already belongs/);
    assert.equal((await fetch(`${origin}/reception-objects.js`)).status,200);
    for(const id of g32.block.evidence.cameras){const photo=await fetch(`${origin}/api/evidence/camera/${id}?block=ground/g32`);assert.equal(photo.status,200);assert.equal(photo.headers.get('content-type'),'image/jpeg');}
  }finally{await new Promise(resolve=>server.close(resolve));}
});
