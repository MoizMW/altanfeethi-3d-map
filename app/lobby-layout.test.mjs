import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import {composeLayout} from './layouts.mjs';
import {buildArchitecture} from './architecture.js';
import {buildVerticalCirculation} from './vertical-circulation.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const json=async p=>JSON.parse(await readFile(new URL('../'+p,import.meta.url),'utf8'));
const load=async key=>{const[m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(f=>json(`blocks/${key}/${f}.json`)));return {block:{...m,architecture:a,placement:a.placement,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e}};};
const layout=await json('layouts/first/bottom-lobby.json');

test('lobby combines eight groups once and retains bottom-right furniture and G42 source data',async()=>{
  const {block}=await composeLayout(root,'first/bottom-lobby',load);
  assert.equal(block.objects.length,59);
  const seats=block.objects.flatMap(o=>o.seats);assert.equal(seats.length,32);assert.equal(new Set(seats).size,32);
  const tables=block.objects.filter(o=>o.externalId).map(o=>o.externalId);assert.equal(tables.length,9);assert.equal(new Set(tables).size,9);
  for(const part of layout.components){
    const source=(await load(part.block)).block,angle=part.yaw*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
    for(const saved of source.objects){
      const o=block.objects.find(o=>o.id===saved.id);assert.ok(o);
      for(const key of ['size','scale','color','seats','externalId'])assert.deepEqual(o[key],saved[key]);
      const [x,y,z]=saved.position,expected=[c*x+s*z+part.position[0],y+part.position[1],-s*x+c*z+part.position[2]];
      expected.forEach((v,i)=>assert.ok(Math.abs(o.position[i]-v)<1e-8));
    }
  }
  assert.deepEqual(layout.components.slice(0,4),(await json('layouts/first/bottom-right.json')).components);
  assert.ok(block.evidence.cameras.includes('H9'));assert.ok(block.evidence.wideSnapshots.H9);assert.ok(!block.evidence.wideSnapshots.H19);
  const registration=await json('evidence/registration/camera-placements.json');
  for(const anchor of layout.integration.registrationEvidence.anchors){
    const camera=registration.cameras.find(c=>c.id===anchor.camera);
    assert.deepEqual(anchor.pixel,[camera.position.x,camera.position.y]);assert.equal(anchor.heading,camera.heading);assert.equal(anchor.group_id,camera.group_id);
  }
});

test('private rooms continue behind H15/H16 with a continuous corridor and one shared boundary',async()=>{
  const {block}=await composeLayout(root,'first/bottom-lobby',load),a=block.architecture;
  const privateRow=await json('layouts/first/private-lounges.json');
  for(const source of privateRow.components){
    const part=layout.components.find(c=>c.block===source.block);
    assert.equal(part.yaw,source.yaw);
    assert.deepEqual(part.position,[source.position[0]-19.45,0,0]);
  }
  const sofa=block.objects.find(o=>o.seats.includes('Seat_H16'));
  assert.ok(block.objects.filter(o=>['first/g39','first/g40','first/g41'].includes(o.sourceBlock)).every(o=>o.position[0]<sofa.position[0]));
  const boundary=a.walls.filter(w=>w.start[0]===-17.65&&w.end[0]===-17.65);
  const segments=boundary.map(w=>[Math.min(w.start[1],w.end[1]),Math.max(w.start[1],w.end[1])]).sort((x,y)=>x[0]-y[0]);
  assert.equal(segments.length,2);
  [[-2.25,1.15],[1.15,2.25]].forEach((segment,i)=>segment.forEach((v,j)=>assert.ok(Math.abs(segments[i][j]-v)<1e-8)));
  const shell=buildArchitecture(a);shell.updateMatrixWorld(true);
  const route=layout.integration.privateLounges.access.route;
  for(let i=1;i<route.length;i++){
    const [x,z]=route[i-1],[endX,endZ]=route[i];
    const direction=new THREE.Vector3(endX-x,0,endZ-z),distance=direction.length();
    assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,z),direction.normalize(),0,distance).intersectObject(shell,true).filter(h=>h.object.isMesh).length,0,'Private corridor must join the lobby without a blocking wall');
    for(let t=0;t<=1;t+=.05){
      const px=x+(endX-x)*t,pz=z+(endZ-z)*t;
      assert.ok(a.floorSections.some(f=>!f.yaw&&Math.abs(px-f.center[0])<=f.size[0]/2+1e-8&&Math.abs(pz-f.center[1])<=f.size[1]/2+1e-8),'Route must have continuous floor coverage');
    }
  }
  for(const group of ['g39','g40','g41'])assert.equal(a.walls.find(w=>w.id===`${group}-entrance-screen`).doors[0].kind,'sliding');
  for(const camera of ['H13','H18'])assert.ok(block.evidence.wideSnapshots[camera]);
});

test('floor panels follow the corrected stair opening and retain the left landing',async()=>{
  const {block}=await composeLayout(root,'first/bottom-lobby',load),a=block.architecture;
  const [minX,minZ,maxX,maxZ]=a.voids[0].bounds;
  for(const t of [.02,.25,.5,.75,.98])for(const u of [.02,.5,.98]){
    const x=minX+(maxX-minX)*t,z=minZ+(maxZ-minZ)*u;
    assert.ok(!a.floorSections.some(f=>{
      const angle=-(f.yaw||0)*Math.PI/180,dx=x-f.center[0],dz=z-f.center[1];
      const lx=Math.cos(angle)*dx+Math.sin(angle)*dz,lz=-Math.sin(angle)*dx+Math.cos(angle)*dz;
      return Math.abs(lx)<f.size[0]/2-1e-6&&Math.abs(lz)<f.size[1]/2-1e-6;
    }),'No first-floor slab may cover the void');
  }
  const shell=buildArchitecture(a);shell.updateMatrixWorld(true);
  for(const x of [-15.1]){
    const hits=new THREE.Raycaster(new THREE.Vector3(x,.7,1.65),new THREE.Vector3(0,0,1),0,9.65).intersectObject(shell,true).filter(h=>h.object.isMesh);
    assert.equal(hits.length,0,'Landing route must remain open');
  }
  assert.equal(a.circulations.length,8);assert.ok(a.floorSections.some(f=>f.pattern==='inset-checker'));
  for(const o of block.objects.filter(o=>o.sourceBlock==='layout:first/bottom-lobby')){
    assert.ok(a.floorSections.some(f=>{
      const angle=-(f.yaw||0)*Math.PI/180,dx=o.position[0]-f.center[0],dz=o.position[2]-f.center[1];
      return Math.abs(Math.cos(angle)*dx+Math.sin(angle)*dz)<=f.size[0]/2&&Math.abs(-Math.sin(angle)*dx+Math.cos(angle)*dz)<=f.size[1]/2;
    }),`${o.id} must stand on a floor panel`);
  }
  const voidBox=a.voids[0].bounds;
  assert.ok(block.objects.filter(o=>o.sourceBlock==='first/g42').every(o=>o.position[2]>voidBox[3]));
  for(const x of [-15.1])for(const o of block.objects){
    const angle=o.yaw*Math.PI/180,[w,,d]=o.size;
    const dx=(Math.abs(Math.cos(angle))*w+Math.abs(Math.sin(angle))*d)/2;
    const dz=(Math.abs(Math.sin(angle))*w+Math.abs(Math.cos(angle))*d)/2;
    if(o.position[2]+dz>1.65&&o.position[2]-dz<11.3)assert.ok(x<o.position[0]-dx-.1||x>o.position[0]+dx+.1,`${o.id} blocks a landing route`);
  }
});

test('stairs align G37 to G35 and the inferred passage is closed',async()=>{
  const stair=layout.structures[0];
  assert.equal(stair.startX,layout.components.find(c=>c.block==='first/g37').position[0]);
  const g35=layout.components.find(c=>c.block==='first/g35');
  assert.ok(stair.endX>g35.position[0]-2.5&&stair.endX<g35.position[0]+2.8);
  assert.deepEqual(layout.voids[0].bounds,[stair.startX,2.4,stair.endX,8.6]);
  assert.deepEqual(layout.integration.routes.map(r=>r.id),['left-landing-loop']);
  const {block}=await composeLayout(root,'first/bottom-lobby',load);
  assert.ok(!block.architecture.walls.some(w=>w.id==='lobby-closed-stair-end-wall'));
  const wall=block.architecture.walls.find(w=>w.id==='lobby-h2-outer-wall-extension');
  assert.equal(wall.kind,'solid');assert.equal(wall.height,4.1);
  assert.equal(wall.start[0]-wall.thickness/2,stair.endX);
  assert.equal(wall.end[0],wall.start[0]);
  const shell=buildArchitecture(block.architecture);shell.updateMatrixWorld(true);
  // Former cross-passage beside the first two bays is guarded continuously.
  const passage=new THREE.Raycaster(new THREE.Vector3(-4.65,.7,1.65),new THREE.Vector3(0,0,1),0,1).intersectObject(shell,true);
  assert.ok(passage.some(h=>h.object.isMesh));
  // The end has one exterior wall, with no inset wall or strip separating it.
  for(const z of [3,5,8])for(const y of [.7,2]){
    const hits=new THREE.Raycaster(new THREE.Vector3(-.5,y,z),new THREE.Vector3(1,0,0),0,4).intersectObject(shell,true);
    assert.ok(hits.some(h=>h.object.isMesh),'Stairwell end must be closed');
    assert.ok(hits.filter(h=>h.object.isMesh).every(h=>h.distance>3),'No inner wall may remain');
  }
});

test('stair/escalator geometry descends below the first-floor plane with finite meshes',()=>{
  const structure=layout.structures[0],group=buildVerticalCirculation(structure),box=new THREE.Box3().setFromObject(group);
  assert.ok(box.min.y<-3.7);assert.ok(box.max.y>0);
  group.traverse(o=>{if(o.isMesh)assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));});
  assert.equal(structure.status,'schematic-unmeasured');assert.equal(structure.sources.includes('H9'),true);
});
