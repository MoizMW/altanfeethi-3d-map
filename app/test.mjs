import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateBlock} from '../shared/schema/block-schema.js';
import {server} from './server.mjs';

const basePath=new URL('../blocks/ground/g9/',import.meta.url);
const [manifest,architecture,objects,evidence]=await Promise.all(['manifest.json','architecture.json','objects.json','evidence.json'].map(async file=>JSON.parse(await readFile(new URL(file,basePath)))));
const block={...manifest,placement:architecture.placement,floorSize:architecture.floorSize,ceilingHeight:architecture.ceilingHeight,architecture,evidence,objects:objects.objects};

test('G9 block composes from four independently owned files',()=>{
  validateBlock(block);assert.equal(block.objects.filter(o=>o.seats.length).length,3);assert.equal(block.objects.flatMap(o=>o.seats).length,4);assert.equal(block.objects.filter(o=>o.externalId==='Table_B1').length,1);
});

test('chair seat ID can change while physical ID remains stable',()=>{
  const copy=structuredClone(block),chair=copy.objects.find(o=>o.type==='armchair'),physicalId=chair.id;chair.seats=['Seat_B17'];chair.size=[1.05,.95,1.02];chair.scale=[1.1,1,1];chair.yaw=45;assert.equal(validateBlock(copy),copy);assert.equal(chair.id,physicalId);
});

test('duplicate IDs, duplicate seats and invalid dimensions are rejected',()=>{
  for(const mutate of [b=>b.objects[1].seats=['Seat_B3'],b=>b.objects[1].id=b.objects[0].id,b=>b.objects[0].position[0]=NaN,b=>b.objects[0].size[0]=-1]){const copy=structuredClone(block);mutate(copy);assert.throws(()=>validateBlock(copy));}
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
    assert.equal(g32.block.objects.filter(o=>o.type==='counter').length,4);
    const staff=g32.block.objects.filter(o=>o.type==='office-chair');assert.equal(staff.length,7);
    staff[0].seats=['Seat_SGS_reviewed_01'];staff[0].yaw=30;staff[0].size=[.7,1.3,.75];validateBlock(g32.block);
    staff[1].seats=staff[0].seats;assert.throws(()=>validateBlock(g32.block),/already belongs/);
    assert.equal((await fetch(`${origin}/reception-objects.js`)).status,200);
    for(const id of g32.block.evidence.cameras){const photo=await fetch(`${origin}/api/evidence/camera/${id}?block=ground/g32`);assert.equal(photo.status,200);assert.equal(photo.headers.get('content-type'),'image/jpeg');}
  }finally{await new Promise(resolve=>server.close(resolve));}
});
