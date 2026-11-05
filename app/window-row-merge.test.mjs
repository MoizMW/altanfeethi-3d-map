import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import {composeLayout} from './layouts.mjs';
import {buildArchitecture} from './architecture.js';
import {buildObject} from './object-builders.js';
import {buildFloors} from './floors.js';
import {buildVerticalCirculation} from './vertical-circulation.js';
const root=new URL('../',import.meta.url);
const read=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const load=async key=>{
 const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(f=>read(`blocks/${key}/${f}.json`)));
 return {block:{...m,architecture:a,placement:a.placement,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e}};
};
const composed=()=>composeLayout(fileURLToPath(root),'first/center-right',load);

test('window row and reception merge with 71 unique saved seats and twenty-two tables',async()=>{
 const {block}=await composed();
 const existing=block.objects.filter(o=>['first/g52-g55','first/g46-g47-g49','first/g50','first/g51','first/g48','first/g45-reception','first/g56'].includes(o.sourceBlock));
 const seats=existing.flatMap(o=>o.seats),tables=existing.filter(o=>o.externalId).map(o=>o.externalId);
 const savedSeats=(await Promise.all(['first/g52-g55','first/g46-g47-g49','first/g50','first/g51','first/g48','first/g45-reception'].map(load))).flatMap(({block})=>block.objects.flatMap(o=>o.seats));
 assert.equal(seats.length,71);assert.equal(new Set(seats).size,71);
 assert.deepEqual(seats.slice().sort(),savedSeats.sort());
 assert.equal(new Set(tables).size,22);assert.equal(tables.length,22);
 assert.equal(block.objects.filter(o=>o.id==='g50-display-column').length,1);
 assert.ok(block.objects.filter(o=>['first/g50','first/g51'].includes(o.sourceBlock)).every(o=>o.position[0]<-5.3));
 assert.ok(block.objects.filter(o=>o.sourceBlock==='first/g46-g47-g49').every(o=>o.position[0]>5.3));
});

test('all six merged source blocks retain saved furniture and accepted relative placements',async()=>{
 const {block}=await composed();
 for(const [key,offset] of [['first/g52-g55',[0,0,0]],['first/g46-g47-g49',[7.8,0,0]],['first/g50',[-7.7,0,-3.85]],['first/g51',[-7.7,0,5.75]],['first/g48',[12.4,0,7.4]],['first/g45-reception',[12.4,0,14.2]]]){
  for(const saved of (await load(key)).block.objects){
   const actual=block.objects.find(o=>o.id===saved.id);assert.ok(actual,saved.id);
   const alignedPanel=saved.id==='g45-branded-backdrop',alignedSign=alignedPanel||/^g45-portrait-[123]$/.test(saved.id);
   assert.deepEqual(actual,{...saved,...(alignedPanel?{size:[4.5,3.4,.08]}:{}),position:saved.position.map((v,i)=>v+(i===0 && alignedSign ? .6 : 0)+offset[i]),sourceBlock:key});
  }
 }
 const window=await composeLayout(fileURLToPath(root),'first/g50-g51',load);
 assert.equal(window.block.objects.flatMap(o=>o.seats).length,16);
 const layout=await read('layouts/first/center-right.json'),pair=await read('layouts/first/g50-g51.json');
 const parts=layout.components.filter(p=>['first/g50','first/g51'].includes(p.block));
 assert.ok(Math.abs(parts[1].position[2]-parts[0].position[2]-pair.components[1].position[2])<1e-9);
});

test('window floors meet both source blocks and center with no overlap, and the end return joins once',async()=>{
 const {block}=await composed(),a=block.architecture;
 const floor=key=>a.floorSections.find(s=>s.sourceBlock===key);
 const center=floor('first/g52-g55'),g50=floor('first/g50'),g51=floor('first/g51');
 for(const row of [g50,g51])assert.ok(Math.abs(row.center[0]+row.size[0]/2-(center.center[0]-center.size[0]/2))<1e-9);
 assert.ok(Math.abs(g50.center[1]+g50.size[1]/2-(g51.center[1]-g51.size[1]/2))<1e-9);
 const approach=a.floorSections.find(s=>s.id==='first-window-row-end-approach');
 assert.ok(Math.abs(g51.center[1]+g51.size[1]/2-(approach.center[1]-approach.size[1]/2))<1e-9);
 assert.ok(Math.abs(approach.center[1]+approach.size[1]/2-11.4)<1e-9);
 const glazing=a.walls.filter(w=>['g50-window-glazing','g51-window-glazing'].includes(w.id));
 assert.equal(glazing.length,2);for(const w of glazing)assert.equal(w.start[0],-10);
 assert.ok(Math.abs(glazing[0].end[1]-glazing[1].start[1])<1e-9);
 const end=a.walls.filter(w=>w.id==='g50-wood-end-return');assert.equal(end.length,1);
 assert.deepEqual(end[0].start,[-10,-10.6]);
 assert.ok(Math.abs(end[0].end[0]+5.3)<1e-9);assert.equal(end[0].end[1],-10.6);
 const centerWall=a.walls.find(w=>w.id==='g52-g55-wood-end-wall');
 assert.ok(Math.hypot(end[0].end[0]-centerWall.start[0],end[0].end[1]-centerWall.start[1])<1e-8);
 const source=(await load('first/g50')).block.architecture.walls.find(w=>w.id==='g50-wood-end-return');
 assert.deepEqual(source.end,[1,-6.65]);
});

test('both long aisles and the common end approach have continuous floor and clear access',async()=>{
 const {block}=await composed(),scene=new THREE.Group(),floor=buildFloors(block);
 scene.add(buildArchitecture(block.architecture));for(const o of block.objects)scene.add(buildObject(o));scene.updateMatrixWorld(true);floor.updateMatrixWorld(true);
 for(const x of [-5.5,5.5])for(const y of [.3,.7,1.2]){
  const ray=new THREE.Raycaster(new THREE.Vector3(x,y,-9.5),new THREE.Vector3(0,0,1),0,20.6);
  assert.equal(ray.intersectObject(scene,true).filter(h=>h.object.isMesh).length,0,`Aisle ${x} at height ${y}`);
 }
 for(const x of [-8,-5.5,0,5.5,9]){
  assert.ok(new THREE.Raycaster(new THREE.Vector3(x,1,11),new THREE.Vector3(0,-1,0)).intersectObject(floor,true).length,'End route has floor');
 }
 for(const z of [-9,0,3,8,10.8])assert.ok(new THREE.Raycaster(new THREE.Vector3(-5.5,1,z),new THREE.Vector3(0,-1,0)).intersectObject(floor,true).length);
});

test('merged evidence includes all six normal and wide window-row views',async()=>{
 const {block}=await composed();
 for(const id of ['H56','H23','H25','H26','H27','H30']){
  assert.ok(block.evidence.cameras.includes(id));
  await access(new URL(block.evidence.snapshots[id],root));await access(new URL(block.evidence.wideSnapshots[id],root));
 }
});

test('reception joins around the shared backing with continuous floor and clear access',async()=>{
 const {block}=await composed(),a=block.architecture;
 assert.ok(!a.walls.some(w=>w.id==='g48-reflective-side'));
 const glass=a.walls.find(w=>w.id==='g48-patterned-glazing'),wall=a.walls.find(w=>w.id==='g45-left-return');
 assert.ok(Math.abs(glass.end[0]-wall.start[0])<1e-8);
 assert.ok(Math.abs(glass.end[1]-wall.start[1])<1e-8);
 const scene=new THREE.Group(),floor=buildFloors(block);
 scene.add(buildArchitecture(a));for(const o of block.objects)scene.add(buildObject(o));scene.updateMatrixWorld(true);floor.updateMatrixWorld(true);
 const route=(await read('layouts/first/center-right.json')).integration.reception.opening.route;
 for(let i=1;i<route.length;i++){
  const [x,z]=route[i-1],[ex,ez]=route[i],direction=new THREE.Vector3(ex-x,0,ez-z),distance=direction.length();
  assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,z),direction.normalize(),0,distance).intersectObject(scene,true).filter(h=>h.object.isMesh).length,0,'Reception entrance must be clear');
  for(let t=0;t<=1;t+=.1)assert.ok(new THREE.Raycaster(new THREE.Vector3(x+(ex-x)*t,1,z+(ez-z)*t),new THREE.Vector3(0,-1,0)).intersectObject(floor,true).length,'Access must have floor');
 }
 for(const id of ['H45','H49','H51'])assert.ok(block.evidence.wideSnapshots[id]);
});

test('H31 buffet preserves the seating identities and opens into the side lobby',async()=>{
 const {block}=await composed(),source=(await load('first/g56')).block;
 const added=block.objects.filter(o=>o.sourceBlock==='first/g56');
 assert.equal(added.length,6);assert.equal(added.flatMap(o=>o.seats).length,0);
 assert.ok(added.every(o=>!o.externalId),'Empty H31 table ROI must not create table IDs');
 for(const saved of source.objects){
  const actual=added.find(o=>o.id===saved.id);
  const part=(await read('layouts/first/center-right.json')).components.find(c=>c.block==='first/g56');
  const delta=part.objectOffsets?.[saved.id]||[0,0,0];
  saved.position.forEach((v,i)=>assert.ok(Math.abs(actual.position[i]-(v+part.position[i]+delta[i]))<1e-8));
  assert.deepEqual(actual,{...saved,position:actual.position,sourceBlock:'first/g56'});
 }
 const scene=new THREE.Group(),floor=buildFloors(block);scene.add(buildArchitecture(block.architecture));
 for(const o of block.objects)scene.add(buildObject(o));scene.updateMatrixWorld(true);floor.updateMatrixWorld(true);
 const route=(await read('layouts/first/center-right.json')).integration.buffet.lobby.route;
 for(let i=1;i<route.length;i++){
  const [x,z]=route[i-1],[ex,ez]=route[i],dir=new THREE.Vector3(ex-x,0,ez-z),distance=dir.length();
  assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,z),dir.normalize(),0,distance).intersectObject(scene,true).filter(h=>h.object.isMesh).length,0,'Buffet-to-lobby route remains open');
  for(let t=0;t<=1;t+=.1)assert.ok(new THREE.Raycaster(new THREE.Vector3(x+(ex-x)*t,1,z+(ez-z)*t),new THREE.Vector3(0,-1,0)).intersectObject(floor,true).length,'Lobby route has continuous floor');
 }
 assert.ok(block.evidence.cameras.includes('H31'));
 for(const path of [block.evidence.snapshots.H31,block.evidence.wideSnapshots.H31])await access(new URL(path,root));
 for(const o of added){const model=buildObject(o);model.traverse(n=>{if(n.isMesh)assert.ok([...n.geometry.attributes.position.array].every(Number.isFinite));});}
});

test('full first-floor merge keeps the bottom assembly rigid and joins H32 to reception',async()=>{
 const {block}=await composed(),a=block.architecture;
 const previous=await composeLayout(fileURLToPath(root),'first/bottom-lobby',load);
 const seats=block.objects.flatMap(o=>o.seats),tables=block.objects.filter(o=>o.externalId).map(o=>o.externalId);
 assert.equal(seats.length,110);assert.equal(new Set(seats).size,110);
 assert.equal(tables.length,36);assert.equal(new Set(tables).size,36);
 const point=([x,y,z])=>[12.4-z,y,45.25+x];
 for(const saved of previous.block.objects){
  const actual=block.objects.find(o=>o.id===saved.id);assert.ok(actual,saved.id);
  for(const key of ['size','scale','color','seats','externalId','variant'])assert.deepEqual(actual[key],saved[key]);
  point(saved.position).forEach((v,i)=>assert.ok(Math.abs(actual.position[i]-v)<1e-8));
  assert.equal(actual.yaw,saved.yaw-90);
 }
 assert.ok(!a.walls.some(w=>w.id==='g39-sofa-wall'),'Reception owns the shared end wall');
 assert.equal(a.walls.filter(w=>w.id==='g45-back-wall').length,1);
 const roomFloor=a.floorSections.find(f=>f.sourceBlock==='first/g39');
 assert.ok(Math.abs(roomFloor.center[1]-roomFloor.size[0]/2-16.8)<1e-8);
 assert.equal(a.floorSections.some(f=>f.id==='buffet-private-lounge-lobby'),false,'Replace placeholder with the actual private-room corridor');
 const shell=buildArchitecture(a),floor=buildFloors(block),scene=new THREE.Group();scene.add(shell);
 for(const o of block.objects)scene.add(buildObject(o));scene.updateMatrixWorld(true);floor.updateMatrixWorld(true);
 const paths=(await read('layouts/first/center-right.json')).integration.bottomLobbyMerge.routes;
 for(const route of Object.values(paths))for(let i=1;i<route.length;i++){
  const [x,z]=route[i-1],[ex,ez]=route[i],dir=new THREE.Vector3(ex-x,0,ez-z),distance=dir.length();
  assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,z),dir.normalize(),0,distance).intersectObject(scene,true).filter(h=>h.object.isMesh).length,0,'Merged lobby route must stay open');
  for(let t=0;t<=1;t+=.1)assert.ok(new THREE.Raycaster(new THREE.Vector3(x+(ex-x)*t,1,z+(ez-z)*t),new THREE.Vector3(0,-1,0)).intersectObject(floor,true).length,'Route floor must be continuous');
 }
 const [x1,z1,x2,z2]=a.voids[0].bounds;
 for(const t of [.1,.5,.9])for(const u of [.1,.5,.9])assert.equal(new THREE.Raycaster(new THREE.Vector3(x1+(x2-x1)*t,1,z1+(z2-z1)*u),new THREE.Vector3(0,-1,0),0,1.1).intersectObject(floor,true).length,0,'No floor may cover the rotated stair opening');
 const original=buildVerticalCirculation(previous.block.architecture.structures[0]),rotated=buildVerticalCirculation(a.structures[0]);
 original.rotation.y=-Math.PI/2;original.position.set(12.4,0,45.25);
 const originalBounds=new THREE.Box3().setFromObject(original),actualBounds=new THREE.Box3().setFromObject(rotated);
 assert.ok(originalBounds.min.distanceTo(actualBounds.min)<1e-8);assert.ok(originalBounds.max.distanceTo(actualBounds.max)<1e-8);
});

test('G45 rotates anticlockwise behind the lobby glass and the buffet-width room stays empty and closed',async()=>{
 const {block}=await composed(),a=block.architecture,source=(await load('first/g45')).block;
 const lounge=block.objects.filter(o=>o.sourceBlock==='first/g45');
 assert.equal(lounge.flatMap(o=>o.seats).length,7);assert.equal(lounge.filter(o=>o.externalId).length,5);
 for(const saved of source.objects){
  const actual=lounge.find(o=>o.id===saved.id),[x,y,z]=saved.position;
  const expected=[-1.7-z,y,29.25+x];
  expected.forEach((v,i)=>assert.ok(Math.abs(actual.position[i]-v)<1e-8));
  assert.equal(actual.yaw,saved.yaw-90);
  for(const field of ['size','scale','color','seats','externalId','variant'])assert.deepEqual(actual[field],saved[field]);
 }
 assert.ok(!a.walls.some(w=>w.id==='g45-facing-side-wall'));
 assert.ok(!a.walls.some(w=>w.id==='g45-partition-side-wall'),'Shared room front renders once');
 const side=a.walls.find(w=>w.id==='g45-glazed-entry'),roomSide=a.walls.find(w=>w.id==='empty-buffet-width-room-left');
 for(const p of [side.start,side.end,roomSide.start,roomSide.end])assert.ok(Math.abs(p[0]+5.05)<1e-8);
 assert.ok(Math.abs(Math.min(side.start[1],side.end[1])-Math.max(roomSide.start[1],roomSide.end[1]))<1e-8,'Walls meet with no gap');
 const glass=a.walls.find(w=>w.id==='lobby-left-decorative-screen');
 assert.deepEqual(glass.start,[-5.05,31.8]);assert.deepEqual(glass.end,[1.9,31.8]);
 assert.ok(lounge.every(o=>o.position[2]<glass.start[1]),'G45 furniture is behind the lobby glass');
 const section=a.floorSections.find(f=>f.sourceBlock==='first/g45');
 for(const panel of a.floorSections.filter(f=>f!==section)){
  const turn=Math.abs((panel.yaw||0)%180)===90,w=panel.size[turn?1:0],d=panel.size[turn?0:1];
  const ox=Math.min(panel.center[0]+w/2,1.9)-Math.max(panel.center[0]-w/2,-5.3);
  const oz=Math.min(panel.center[1]+d/2,31.95)-Math.max(panel.center[1]-d/2,26.85);
  assert.ok(ox<1e-7||oz<1e-7,`${panel.id} must not duplicate G45 floor`);
 }
 const room=a.floorSections.find(f=>f.id==='empty-buffet-width-room-floor');
 const buffet=a.floorSections.find(f=>f.id==='g56-private-corridor-side-floor');
 assert.equal(room.size[0],12.4);assert.equal(buffet.size[0],12.4);
 assert.ok(room.size[1]>3.05,'Freed buffet depth enlarges the empty room');
 assert.ok(Math.abs(room.center[1]-room.size[1]/2-22.4)<1e-8);
 assert.ok(!block.objects.some(o=>o.id==='first-small-buffet-room-counter'));
 assert.ok(block.objects.filter(o=>o.type!=='wall-panel').every(o=>!(o.position[0]>-5.2&&o.position[0]<8.6&&o.position[2]>22.4&&o.position[2]<26.85)),'Room has no furniture, food or counter');
 const scene=new THREE.Group(),floor=buildFloors(block);scene.add(buildArchitecture(a));
 for(const o of block.objects)scene.add(buildObject(o));scene.updateMatrixWorld(true);floor.updateMatrixWorld(true);
 const paths=(await read('layouts/first/center-right.json')).integration.privacyLoungeG45.routes;
 for(const route of Object.values(paths))for(let i=1;i<route.length;i++){
  const [x,z]=route[i-1],[ex,ez]=route[i],dir=new THREE.Vector3(ex-x,0,ez-z),distance=dir.length();
  assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,z),dir.normalize(),0,distance).intersectObject(scene,true).filter(h=>h.object.isMesh).length,0,'Approaches remain clear');
  for(let t=0;t<=1;t+=.1)assert.ok(new THREE.Raycaster(new THREE.Vector3(x+(ex-x)*t,1,z+(ez-z)*t),new THREE.Vector3(0,-1,0)).intersectObject(floor,true).length,'Approaches have floor');
 }
 for(const dir of [new THREE.Vector3(1,0,0),new THREE.Vector3(-1,0,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1)])assert.ok(new THREE.Raycaster(new THREE.Vector3(1,.7,25.3),dir,0,10).intersectObject(scene,true).some(h=>h.object.isMesh),'Empty room is enclosed on each side');
});

test('H88/H89 lobby reaches the swapped G45 entrance without floor gaps or furniture changes',async()=>{
 const {block}=await composed(),a=block.architecture;
 const source=(await load('first/g45')).block.architecture;
 const gate=a.walls.find(w=>w.id==='g45-glazed-entry'),wood=a.walls.find(w=>w.id==='g45-wood-end-wall');
 for(const p of [gate.start,gate.end])assert.ok(Math.abs(p[0]+5.05)<1e-8);
 for(const p of [wood.start,wood.end])assert.ok(Math.abs(p[0]-1.65)<1e-8);
 assert.equal(wood.interiorSide,-1);assert.ok(wood.start[1]>wood.end[1],'Cladding continues to face inside after swap');
 assert.deepEqual(source.walls.find(w=>w.id===gate.id).start,[-2.55,-3.35],'Standalone shell remains unchanged');
 const scene=buildArchitecture(a),floor=buildFloors(block);for(const object of block.objects)scene.add(buildObject(object));
 scene.updateMatrixWorld(true);floor.updateMatrixWorld(true);
 const route=(await read('layouts/first/center-right.json')).integration.privacyLoungeG45.lobbyFromH88H89.route;
 for(let i=1;i<route.length;i++){
  const [x,z]=route[i-1],[ex,ez]=route[i],dir=new THREE.Vector3(ex-x,0,ez-z),distance=dir.length();
  assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,z),dir.normalize(),0,distance).intersectObject(scene,true).filter(h=>h.object.isMesh).length,0,'Lobby is unobstructed');
  for(let t=0;t<=1;t+=.025)assert.ok(new THREE.Raycaster(new THREE.Vector3(x+(ex-x)*t,1,z+(ez-z)*t),new THREE.Vector3(0,-1,0)).intersectObject(floor,true).length,'Lobby floor is continuous');
 }
 const added=a.floorSections.filter(f=>f.id?.startsWith('h88-privacy-lobby-'));
 for(const f of added)for(const other of a.floorSections.filter(o=>o!==f)){
  const bounds=s=>{const turn=Math.abs((s.yaw||0)%180)===90,w=s.size[turn?1:0],d=s.size[turn?0:1];return [s.center[0]-w/2,s.center[1]-d/2,s.center[0]+w/2,s.center[1]+d/2];};
  const b=bounds(f),c=bounds(other);
  assert.ok(Math.min(b[2],c[2])-Math.max(b[0],c[0])<1e-7||Math.min(b[3],c[3])-Math.max(b[1],c[1])<1e-7,'Lobby floor must not overlap existing floor');
 }
});

test('lobby perimeter glazing continues the window row to the privacy-room end and joins a solid return',async()=>{
 const {block}=await composed(),a=block.architecture;
 assert.ok(!a.walls.some(w=>w.id==='g56-window-side'),'No inset glass remains beside buffet counters');
 const glass=a.walls.find(w=>w.id==='window-row-privacy-lobby-glazing'),previous=a.walls.find(w=>w.id==='g51-window-glazing');
 assert.equal(glass.kind,'glass');assert.deepEqual(glass.start,previous.end);
 assert.deepEqual(glass.end,[-10,31.8]);
 const wall=a.walls.find(w=>w.id==='privacy-lobby-glass-to-solid-return');assert.equal(wall.kind,'solid');
 assert.deepEqual(wall.start,glass.end);
 const privacyGlass=a.walls.find(w=>w.id==='lobby-left-decorative-screen');assert.deepEqual(wall.end,privacyGlass.start);
 assert.ok((await load('first/g56')).block.architecture.walls.some(w=>w.id==='g56-window-side'),'Standalone buffet is preserved');
 const shell=buildArchitecture({walls:[glass,wall]});shell.updateMatrixWorld(true);
 for(const z of [10,20,29,31])assert.ok(new THREE.Raycaster(new THREE.Vector3(-9,.7,z),new THREE.Vector3(-1,0,0),0,2).intersectObject(shell,true).length,'Perimeter glass encloses the lobby edge');
 assert.ok(new THREE.Raycaster(new THREE.Vector3(-7,.7,31),new THREE.Vector3(0,0,1),0,2).intersectObject(shell,true).length,'Solid end return meets the perimeter');
});

test('reception backing matches the private row and the narrowed empty room widens its corridor',async()=>{
 const {block}=await composed(),a=block.architecture;
 const wall=a.walls.find(w=>w.id==='g45-back-wall'),panel=block.objects.find(o=>o.id==='g45-branded-backdrop');
 assert.deepEqual(wall.start,[10.15,16.72]);assert.deepEqual(wall.end,[14.65,16.72]);
 assert.equal(panel.size[0],4.5);assert.equal(panel.position[0],12.4);
 assert.ok(Math.abs(panel.position[0]-panel.size[0]/2-wall.start[0])<1e-8);
 assert.ok(Math.abs(panel.position[0]+panel.size[0]/2-wall.end[0])<1e-8);
 const room=a.floorSections.find(f=>f.id==='empty-buffet-width-room-floor'),side=a.walls.find(w=>w.id==='empty-buffet-width-room-right');
 assert.equal(room.size[0],12.4);assert.equal(room.center[0]+room.size[0]/2,7.2);
 assert.deepEqual(side.start,[7.05,22.4]);assert.deepEqual(side.end,[7.05,26.7]);
 assert.ok(Math.abs(10.15-side.start[0]-3.1)<1e-8);
 assert.ok(!a.walls.some(w=>w.id==='empty-room-rear-width-return'));
 const floor=buildFloors(block),scene=buildArchitecture(a);for(const o of block.objects)scene.add(buildObject(o));
 floor.updateMatrixWorld(true);scene.updateMatrixWorld(true);
 assert.equal(new THREE.Raycaster(new THREE.Vector3(8,.7,21.9),new THREE.Vector3(0,0,1),0,5.5).intersectObject(scene,true).filter(h=>h.object.isMesh).length,0,'Widened corridor stays clear');
 for(const z of [22.3,22.5,24,26.7,27])assert.ok(new THREE.Raycaster(new THREE.Vector3(8,1,z),new THREE.Vector3(0,-1,0)).intersectObject(floor,true).length,'Widened corridor has floor');
 const source=(await load('first/g45-reception')).block.objects.find(o=>o.id===panel.id);assert.equal(source.size[0],5,'Standalone reception stays unchanged');
});
