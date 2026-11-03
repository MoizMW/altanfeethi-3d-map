import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {composeLayout} from './layouts.mjs';
import {buildArchitecture} from './architecture.js';
import {server} from './server.mjs';

const root=new URL('../',import.meta.url).pathname;
const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
const sourceFiles=['ground/g15','ground/g13'].flatMap(key=>['manifest','architecture','objects','evidence'].map(f=>new URL(`../blocks/${key}/${f}.json`,import.meta.url)));
const sourceBytes=()=>Promise.all(sourceFiles.map(file=>readFile(file,'utf8')));

test('G15/G13 preserves every saved object and wall under rigid component placement',async()=>{
  const before=await sourceBytes();
  const layout=JSON.parse(await readFile(new URL('../layouts/ground/g15-g13.json',import.meta.url)));
  const {block}=await composeLayout(root,'ground/g15-g13',load);
  assert.equal(block.readOnly,true);assert.equal(block.objects.length,29);
  assert.equal(new Set(block.objects.map(o=>o.id)).size,29);
  assert.equal(block.objects.flatMap(o=>o.seats).length,6);
  const staff=block.objects.filter(o=>o.sourceBlock==='ground/g13'&&o.type==='office-chair'),gates=block.objects.filter(o=>o.type==='passport-gate');
  assert.equal(staff.length,4);assert.equal(gates.length,3);
  assert.ok(Math.min(...staff.map(o=>o.position[0]))>Math.max(...gates.map(o=>o.position[0])),'G13 staff chairs must be on the right of the gates in top view');
  for(const part of layout.components){
    assert.equal(part.objectOffsets,undefined);assert.equal(part.excludeObjects,undefined);
    const source=(await load(part.block)).block,r=part.yaw*Math.PI/180,c=Math.cos(r),s=Math.sin(r);
    const point=([x,z])=>[c*x+s*z+part.position[0],-s*x+c*z+part.position[2]];
    for(const o of source.objects){
      const expected=structuredClone(o),p=point([o.position[0],o.position[2]]);
      expected.position=[p[0],o.position[1]+part.position[1],p[1]];expected.yaw+=part.yaw;expected.sourceBlock=part.block;
      assert.deepEqual(block.objects.find(v=>v.id===o.id),expected,o.id);
    }
    for(const wall of source.architecture.walls)assert.deepEqual(block.architecture.walls.find(w=>w.id===wall.id),{...wall,start:point(wall.start),end:point(wall.end)},wall.id);
  }
  assert.deepEqual(await sourceBytes(),before);
});

test('G15/G13 retains office floors and doors with a continuous unobstructed joining approach',async()=>{
  const {block}=await composeLayout(root,'ground/g15-g13',load),g15=(await load('ground/g15')).block;
  const layout=JSON.parse(await readFile(new URL('../layouts/ground/g15-g13.json',import.meta.url)));
  assert.equal(block.architecture.floorSections.length,5);
  for(const section of g15.architecture.floorSections)assert.deepEqual(block.architecture.floorSections.find(f=>f.id===section.id),{...section,yaw:0,sourceBlock:'ground/g15'});
  assert.deepEqual(block.architecture.rooms,g15.architecture.rooms.map(room=>({...room,sourceBlock:'ground/g15'})));
  assert.equal(block.architecture.walls.flatMap(w=>w.doors||[]).length,2);
  assert.equal(g15.architecture.proportions.checkpointLength/g15.architecture.proportions.officeRowLength,.8);
  const covers=([x,z])=>block.architecture.floorSections.some(f=>{const r=f.yaw*Math.PI/180,dx=x-f.center[0],dz=z-f.center[1];return Math.abs(Math.cos(r)*dx-Math.sin(r)*dz)<=f.size[0]/2+1e-8&&Math.abs(Math.sin(r)*dx+Math.cos(r)*dz)<=f.size[1]/2+1e-8;});
  assert.equal(covers([-5.01,-7]),true);assert.equal(covers([-4.99,-7]),false,'Do not fill the empty area beside the office extension');
  const checkpoint=block.architecture.floorSections[0],corridor=block.architecture.floorSections.at(-1),passport=block.architecture.floorSections[3];
  assert.ok(Math.abs(checkpoint.center[1]-checkpoint.size[1]/2-(corridor.center[1]+corridor.size[1]/2))<1e-8);
  assert.ok(Math.abs(corridor.center[1]-corridor.size[1]/2-(passport.center[1]+passport.size[0]/2))<1e-8);
  assert.ok(passport.center[1]+passport.size[0]/2<checkpoint.center[1]-checkpoint.size[1]/2,'G13 must join the top of G15');
  const rightEdge=checkpoint.center[0]+checkpoint.size[0]/2;
  assert.ok(Math.abs(passport.center[0]+passport.size[1]/2-rightEdge)<1e-8,'G13 and G15 right floor edges must align');
  assert.ok(Math.abs(corridor.center[0]+corridor.size[0]/2-rightEdge)<1e-8,'Connection must not protrude past the aligned right edge');
  const rightWall=block.architecture.walls.find(w=>w.id==='g15-solid-side'),passportWall=block.architecture.walls.find(w=>w.id==='g13-rear-wall'),join=block.architecture.walls.find(w=>w.id==='g15-g13-right-connection');
  for(const w of [passportWall,join])for(const end of ['start','end'])assert.ok(Math.abs(w[end][0]-rightWall.start[0])<1e-8,'Right walls must form one line');
  assert.ok(Math.abs(join.start[1]-passportWall.end[1])<1e-8);assert.deepEqual(join.end,rightWall.start);
  const shell=buildArchitecture(block.architecture);shell.updateMatrixWorld(true);
  const waypoints=layout.connections[0].approachWaypoints;
  for(let i=1;i<waypoints.length;i++){
    const [a,b]=[waypoints[i-1],waypoints[i]],start=new THREE.Vector3(a[0],.75,a[1]),end=new THREE.Vector3(b[0],.75,b[1]),direction=end.clone().sub(start),distance=direction.length();
    assert.equal(new THREE.Raycaster(start,direction.normalize(),0,distance).intersectObject(shell,true).length,0,'No wall across the joining approach');
    for(let step=0;step<=20;step++){
      const x=a[0]+(b[0]-a[0])*step/20,z=a[1]+(b[1]-a[1])*step/20;
      assert.ok(covers([x,z]),'Approach floor must stay continuous');
      for(const o of block.objects){const r=o.yaw*Math.PI/180,dx=x-o.position[0],dz=z-o.position[2];assert.ok(Math.abs(Math.cos(r)*dx-Math.sin(r)*dz)>o.size[0]*o.scale[0]/2+.25||Math.abs(Math.sin(r)*dx+Math.cos(r)*dz)>o.size[2]*o.scale[2]/2+.25,`Approach clearance beside ${o.id}`);}
    }
  }
});

test('G15/G13 API lists the layout, serves all evidence and rejects source saves',async()=>{
  const before=await sourceBytes();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`,query='?layout=ground/g15-g13';
  try{
    const listing=await (await fetch(`${origin}/api/blocks`)).json();assert.ok(listing.blocks.some(b=>b.key==='layout:ground/g15-g13'));
    const response=await fetch(`${origin}/api/block${query}`);assert.equal(response.status,200);
    const {block}=await response.json();assert.equal(block.objects.length,29);assert.equal(block.architecture.floorSections.length,5);assert.equal(block.readOnly,true);
    assert.deepEqual(new Set(block.evidence.cameras),new Set(['C8','C15','C16','C13','C17','C18','C21']));
    for(const id of block.evidence.cameras)for(const wide of [false,true]){const photo=await fetch(`${origin}/api/evidence/camera/${id}${query}${wide?'&wide=1':''}`);assert.equal(photo.status,200);assert.equal(photo.headers.get('content-type'),'image/jpeg');await photo.arrayBuffer();}
    assert.equal((await fetch(`${origin}/api/block${query}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({block})})).status,405);
    assert.deepEqual(await sourceBytes(),before);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
