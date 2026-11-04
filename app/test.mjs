import {test} from 'node:test';
import '../blocks/first/g42/validate.test.mjs';
import './lobby-layout.test.mjs';
import {fileURLToPath} from 'node:url';
import './first-floor-layout.test.mjs';
import '../blocks/first/g35/validate.test.mjs';
import '../blocks/first/g36/validate.test.mjs';
import '../blocks/first/g37/validate.test.mjs';
import '../blocks/first/g38/validate.test.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateBlock} from '../shared/schema/block-schema.js';
import {server} from './server.mjs';
import * as THREE from 'three';
import {buildArchitecture} from './architecture.js';
import './g41.test.mjs';
import './private-lounges.test.mjs';

test('Wider arch piers stay straight through the spring and meet a smooth elliptical crown',()=>{
  const a={walls:[{id:'arch',kind:'solid',start:[0,0],end:[8.4,0],height:4.1,thickness:.18}],openings:[{wallId:'arch',offset:4.2,width:7.6,springHeight:1.65,height:3.35}]};
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);
    const hit=(x,y)=>new THREE.Raycaster(new THREE.Vector3(x,y,1),new THREE.Vector3(0,0,-1),0,2).intersectObject(shell,true).length;
    assert.ok(hit(.45,.2),'Lower pier must extend farther into the opening');
    assert.ok(hit(.45,1),'Wider pier must continue upward without a pinched waist');
    assert.equal(hit(.6,1),0,'Clear opening must remain beside the straight pier');
    assert.equal(hit(4.2,.2),0,'Middle of passage must stay clear');
  }
});

test('Compact G9 retains seating width and an open through passage',async()=>{
  const [g9,g11]=await Promise.all(['g9','g11'].map(async key=>JSON.parse(await readFile(new URL(`../blocks/ground/${key}/architecture.json`,import.meta.url)))));
  assert.equal(g9.floorSize[1],6);assert.equal(g9.floorSize[0],7.4);assert.ok(Math.abs(g9.circulation.polygon[1][0]-g9.circulation.polygon[0][0]-3.0)<1e-8);
  const shell=buildArchitecture(g9);shell.updateMatrixWorld(true);
  for(const [z,dz]of [[4,-1],[-4,1]])assert.equal(new THREE.Raycaster(new THREE.Vector3(-4.58,1,z),new THREE.Vector3(0,0,dz)).intersectObject(shell,true).length,0);
  assert.ok(new THREE.Raycaster(new THREE.Vector3(-4.58,3.6,4),new THREE.Vector3(0,0,-1)).intersectObject(shell,true).length,'Passage entrance must have a rounded wall surround overhead');
  assert.ok(new THREE.Raycaster(new THREE.Vector3(-6,1,0),new THREE.Vector3(1,0,0)).intersectObject(shell,true).length,'Outer left wall must enclose the passage side');
  assert.equal(g9.circulation.surfaceMaterial,'pale-stone');assert.equal(g9.walls.find(w=>w.id==='g9-tv-wall').finish,'teal-gold-panels');
  const glass=new THREE.Raycaster(new THREE.Vector3(-2,1,-4),new THREE.Vector3(0,0,1)).intersectObject(shell,true);assert.ok(glass.length);
  const entrance=new THREE.Raycaster(new THREE.Vector3(-2,1,4),new THREE.Vector3(0,0,-1)).intersectObject(shell,true);assert.ok(entrance.length);assert.ok(entrance[0].point.z<0,'Rounded entrance must remain clear');
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

test('Retired green lounge-chair finishes are rejected when validating a draft',()=>{
  for(const color of ['#637d79','#3F5C59']){
    const draft=structuredClone(block);draft.objects.find(o=>o.type==='armchair').color=color;
    assert.throws(()=>validateBlock(draft),/finish is retired/);
    draft.objects.find(o=>o.type==='armchair').color='#627d86';
    assert.doesNotThrow(()=>validateBlock(draft));
  }
});

test('G21 and G27 arches preserve the walking route and have an overhead crown',async()=>{
  for(const slug of ['g21','g27']){
    const a=JSON.parse(await readFile(new URL(`../blocks/ground/${slug}/architecture.json`,import.meta.url)));
    assert.equal(a.openings.length,slug==='g21'?1:2);
    for(const cutaway of [true,false]){
      const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);
      for(const opening of a.openings){
        const wall=a.walls.find(w=>w.id===opening.wallId),z=wall.start[1];
        const ray=y=>new THREE.Raycaster(new THREE.Vector3(0,y,z-1),new THREE.Vector3(0,0,1),0,2).intersectObject(shell,true);
        assert.equal(ray(.7).length,0,'Arch must leave the walking route open');
        if(!cutaway)assert.ok(ray(3.7).length,'Partition crown must remain above the opening');
      }
      shell.traverse(n=>{n.geometry?.dispose();n.material?.dispose();});
    }
  }
  const g27=JSON.parse(await readFile(new URL('../blocks/ground/g27/objects.json',import.meta.url)));
  assert.ok(g27.objects.filter(o=>o.type==='armchair').every(o=>o.color==='#3d4a55'));
});

for(const slug of ['g18','g20','g21','g27'])test(`${slug.toUpperCase()} reconciles ROI identities and keeps furniture outside the through path`,async()=>{
  const base=new URL(`../blocks/ground/${slug}/`,import.meta.url);
  const [m,a,o,e]=await Promise.all(['manifest.json','architecture.json','objects.json','evidence.json'].map(async f=>JSON.parse(await readFile(new URL(f,base)))));
  const draft=validateBlock({...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects});
  const observedSeats=new Set(),observedTables=new Set();
  for(const camera of e.cameras)for(const [kind,labels] of [['chairs',observedSeats],['tables',observedTables]]){
    const roi=JSON.parse(await readFile(new URL(`../${e.rois[camera][kind]}`,import.meta.url)));
    for(const label of Object.keys(roi))labels.add(label);
  }
  const temporarySeats=new Set((e.unmappedSeats||[]).map(x=>x.temporarySeatId));
  assert.deepEqual(draft.objects.flatMap(x=>x.seats).filter(s=>!temporarySeats.has(s)).sort(),[...observedSeats].sort());
  const localTables=draft.objects.filter(x=>x.externalId).map(x=>x.externalId);
  const externalTables=[...(e.externalObservations||[]),...(e.deferredObservations||[])].map(x=>x.externalId);
  assert.deepEqual([...localTables,...externalTables].sort(),[...observedTables].sort());
  const context=draft.objects.filter(x=>x.ownershipStatus==='provisional-context-neighbor-unresolved');
  assert.deepEqual(context.map(x=>x.externalId).sort(),[]);
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

for(const slug of ['g21','g27'])test(`${slug.toUpperCase()} records unresolved identities and neighbors while keeping objects inside its crop`,async()=>{
  const [objects,evidence,architecture]=await Promise.all(['objects.json','evidence.json','architecture.json'].map(async file=>JSON.parse(await readFile(new URL(`../blocks/ground/${slug}/${file}`,import.meta.url)))));
  const unmappedSeats=evidence.unmappedSeats||[];
  assert.equal(unmappedSeats.length,slug==='g21'?1:0);
  for(const unmapped of unmappedSeats){
    const chair=objects.objects.find(o=>o.id===unmapped.objectId);
    assert.equal(chair.identityStatus,'temporary-unmapped');
    assert.deepEqual(chair.seats,[unmapped.temporarySeatId]);
    assert.ok(unmapped.cameras.every(camera=>evidence.cameras.includes(camera)));
    for(const camera of evidence.cameras){
      const roi=JSON.parse(await readFile(new URL(`../${evidence.rois[camera].chairs}`,import.meta.url)));
      assert.ok(!roi[unmapped.temporarySeatId],'Temporary names cannot claim supplied ROI identities');
    }
  }
  for(const deferred of evidence.deferredObservations){
    const roi=JSON.parse(await readFile(new URL(`../${deferred.corroboratingRoiFile}`,import.meta.url)));
    assert.ok(roi[deferred.externalId]);
    assert.ok(!objects.objects.some(o=>o.externalId===deferred.externalId),'Background tables remain outside local ownership');
  }
  for(const object of objects.objects){
    const angle=THREE.MathUtils.degToRad(object.yaw),[w,,d]=object.size;
    const extentX=(Math.abs(Math.cos(angle))*w+Math.abs(Math.sin(angle))*d)/2;
    const extentZ=(Math.abs(Math.sin(angle))*w+Math.abs(Math.cos(angle))*d)/2;
    assert.ok(Math.abs(object.position[0])+extentX<=architecture.floorSize[0]/2,`${object.id} crosses the crop's side`);
    assert.ok(Math.abs(object.position[2])+extentZ<=architecture.floorSize[1]/2,`${object.id} crosses the crop's end`);
    if(object.supportObjectId){
      const support=objects.objects.find(o=>o.id===object.supportObjectId);
      assert.ok(support,`${object.id} needs a real support object`);
      assert.equal(object.position[1],support.position[1]+support.size[1]);
    }
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
    assert.deepEqual(data.block.evidence.tableDrawings,['B1']);
    const drawing=await fetch(`${origin}/api/evidence/table-drawing/B1${query}`);
    assert.equal(drawing.status,200);assert.equal(drawing.headers.get('content-type'),'image/png');
    assert.equal((await fetch(`${origin}/api/evidence/table-drawing/G2${query}`)).status,404);
    const g16Drawings=await(await fetch(`${origin}/api/block?block=ground/g16`)).json();
    assert.deepEqual(g16Drawings.block.evidence.tableDrawings,['G1','G2']);
    const combinedDrawings=await(await fetch(`${origin}/api/block?layout=ground/g9-g10`)).json();
    assert.deepEqual(combinedDrawings.block.evidence.tableDrawings,['B1','B4','B5','C1','C2']);
    const stale=await fetch(`${origin}/api/block${query}`,{method:'PUT',body:JSON.stringify({revision:'stale',block})});assert.equal(stale.status,409);
    const jpg=Buffer.from(await(await fetch(`${origin}/api/evidence/camera/B1${query}`)).arrayBuffer());assert.equal(jpg[0],255);assert.equal(jpg[1],216);
    assert.equal((await fetch(`${origin}/shared/schema/block-schema.js`)).status,200);assert.equal((await fetch(`${origin}/server.mjs`)).status,404);assert.equal((await fetch(`${origin}/api/block?block=../../private`)).status,400);
    const g32=await(await fetch(`${origin}/api/block?block=ground/g32`)).json();validateBlock(g32.block);
    assert.ok(listing.blocks.some(b=>b.key==='layout:first/bottom-lobby'));
    const lobby=await(await fetch(`${origin}/api/block?layout=first/bottom-lobby`)).json();validateBlock(lobby.block);
    assert.equal(lobby.block.objects.flatMap(o=>o.seats).length,20);
    for(const camera of ['H9','H18','H19'])assert.equal((await fetch(`${origin}/api/evidence/camera/${camera}?layout=first/bottom-lobby`)).status,200);
    for(const camera of ['H9','H18'])assert.equal((await fetch(`${origin}/api/evidence/camera/${camera}?layout=first/bottom-lobby&wide=1`)).status,200);
    assert.equal((await fetch(`${origin}/api/evidence/camera/H19?layout=first/bottom-lobby&wide=1`)).status,404);
    for(const module of ['lobby-fixtures.js','vertical-circulation.js'])assert.equal((await fetch(`${origin}/${module}`)).status,200);
    assert.equal((await fetch(`${origin}/api/block?layout=first/bottom-lobby`,{method:'PUT',body:'{}'})).status,405);
    assert.ok(listing.blocks.some(b=>b.key==='layout:first/bottom-right'));
    const firstResponse=await fetch(`${origin}/api/block?layout=first/bottom-right`);assert.equal(firstResponse.status,200);
    const first=(await firstResponse.json()).block;validateBlock(first);assert.equal(first.objects.length,21);assert.equal(first.readOnly,true);
    for(let i=1;i<=8;i++)for(const wide of [0,1])assert.equal((await fetch(`${origin}/api/evidence/camera/H${i}?layout=first/bottom-right&wide=${wide}`)).status,200);
    assert.equal((await fetch(`${origin}/api/evidence/map?layout=first/bottom-right`)).status,200);
    assert.equal((await fetch(`${origin}/lounge-tables.js`)).status,200);
    assert.equal((await fetch(`${origin}/api/block?layout=first/bottom-right`,{method:'PUT',body:'{}'})).status,405);
    assert.ok(listing.blocks.some(b=>b.key==='first/g41'));
    const g41=await(await fetch(`${origin}/api/block?block=first/g41`)).json();validateBlock(g41.block);
    assert.equal(g41.block.objects.flatMap(o=>o.seats).length,4);
    for(const id of g41.block.evidence.cameras)for(const wide of [0,1]){
      const photo=await fetch(`${origin}/api/evidence/camera/${id}?block=first/g41&wide=${wide}`);
      assert.equal(photo.status,200);assert.equal(photo.headers.get('content-type'),'image/jpeg');
    }
    assert.equal((await fetch(`${origin}/private-lounge-objects.js`)).status,200);
    for(const group of ['g39','g40']){
      assert.ok(listing.blocks.some(b=>b.key===`first/${group}`));
      const room=await(await fetch(`${origin}/api/block?block=first/${group}`)).json();validateBlock(room.block);
      for(const camera of room.block.evidence.cameras)for(const wide of [0,1])assert.equal((await fetch(`${origin}/api/evidence/camera/${camera}?block=first/${group}&wide=${wide}`)).status,200);
    }
    const privateRow=await(await fetch(`${origin}/api/block?layout=first/private-lounges`)).json();validateBlock(privateRow.block);
    assert.equal(privateRow.block.objects.flatMap(o=>o.seats).length,12);
    assert.equal(privateRow.block.objects.length,20);
    assert.equal((await fetch(`${origin}/api/block?layout=first/private-lounges`,{method:'PUT',body:'{}'})).status,405);
    for(const slug of ['g18','g20','g21','g27','g28','g61','g62']){
      assert.ok(listing.blocks.some(b=>b.key===`ground/${slug}`));
      const data=await(await fetch(`${origin}/api/block?block=ground/${slug}`)).json();validateBlock(data.block);
      for(const id of data.block.evidence.cameras)assert.equal((await fetch(`${origin}/api/evidence/camera/${id}?block=ground/${slug}`)).status,200);
      for(const id of Object.keys(data.block.evidence.wideSnapshots||{}))assert.equal((await fetch(`${origin}/api/evidence/camera/${id}?wide=1&block=ground/${slug}`)).status,200);
    }
    assert.equal(g32.block.objects.filter(o=>o.type==='counter').length,4);
    const staff=g32.block.objects.filter(o=>o.type==='office-chair');assert.equal(staff.length,7);
    staff[0].seats=['Seat_SGS_reviewed_01'];staff[0].yaw=30;staff[0].size=[.7,1.3,.75];validateBlock(g32.block);
    staff[1].seats=staff[0].seats;assert.throws(()=>validateBlock(g32.block),/already belongs/);
    assert.equal((await fetch(`${origin}/reception-objects.js`)).status,200);
    for(const flag of ['saudi','altanfeethi']){
      const asset=await fetch(`${origin}/shared/assets/flags/${flag}.svg`);
      assert.equal(asset.status,200);assert.equal(asset.headers.get('content-type'),'image/svg+xml');
      assert.match(await asset.text(),/<svg/);
    }
    assert.equal((await fetch(`${origin}/shared/assets/flags/saudi-source.svg`)).status,404);
    for(const index of [1,2,3]){
      const portrait=await fetch(`${origin}/shared/assets/portraits/reception-${index}.png`);
      assert.equal(portrait.status,200);assert.equal(portrait.headers.get('content-type'),'image/png');
      assert.deepEqual([...new Uint8Array(await portrait.arrayBuffer()).slice(0,8)],[137,80,78,71,13,10,26,10]);
    }
    assert.equal((await fetch(`${origin}/shared/assets/portraits/README.md`)).status,404);
    for(const id of g32.block.evidence.cameras){const photo=await fetch(`${origin}/api/evidence/camera/${id}?block=ground/g32`);assert.equal(photo.status,200);assert.equal(photo.headers.get('content-type'),'image/jpeg');}
  }finally{await new Promise(resolve=>server.close(resolve));}
});

test('G9/G10/G11 composition keeps source seating and opens onto one shared corridor',async()=>{
  const {composeLayout}=await import('./layouts.mjs');
  const projectRoot=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const {block}=await composeLayout(projectRoot,'ground/g9-g10',load);validateBlock(block);
  assert.equal(block.objects.flatMap(o=>o.seats).length,20);
  const originals=(await Promise.all(['ground/g9','ground/g10','ground/g11'].map(load))).flatMap(({block})=>block.objects);
  for(const o of block.objects){const source=originals.find(v=>v.id===o.id);assert.deepEqual(o.seats,source.seats);assert.deepEqual(o.size,source.size);assert.deepEqual(o.scale,source.scale);}
  assert.equal(block.architecture.walls.filter(w=>w.id==='g9-g10-shared-partition').length,1);
  assert.ok(!block.architecture.walls.some(w=>['g9-passage-outer-wall','g10-side-b5','g10-side-b4','g11-side-c1'].includes(w.id)));
  assert.ok(block.evidence.cameras.includes('Cor1'));assert.equal(block.readOnly,true);
  const partition=block.architecture.walls.find(w=>w.id==='g9-g10-shared-partition');assert.equal(partition.start[0],-5.38);assert.equal(partition.kind,'glass');assert.equal(partition.variant,'patterned-smoked');assert.equal(partition.finish,undefined);
  assert.ok(block.objects.filter(o=>o.sourceBlock==='ground/g10').every(o=>o.position[0]<-5.38));
  assert.equal(block.architecture.floorSections[1].size[1],6);
  assert.deepEqual(block.groups,['g9','g10','g11']);
  assert.equal(block.architecture.walls.filter(w=>w.id==='g10-g11-shared-partition').length,1);
  assert.ok(block.objects.filter(o=>o.sourceBlock==='ground/g11').every(o=>o.position[0]<-11.98));
  const shell=buildArchitecture(block.architecture);shell.updateMatrixWorld(true);
  for(const x of [-.2,-10.33,-7.03,-17.58,-13.58]){const hits=new THREE.Raycaster(new THREE.Vector3(x,.7,4.3),new THREE.Vector3(0,0,-1)).intersectObject(shell,true);assert.ok(hits.length);assert.ok(hits[0].point.z<0,'Lounge entrances must stay clear from common corridor');}
  assert.equal(new THREE.Raycaster(new THREE.Vector3(-20,.7,4.3),new THREE.Vector3(1,0,0)).intersectObject(shell,true).length,0,'Corridor must remain continuous');
});

test('G16 reconciles camera ROI identities while leaving neighboring Table_G5 contextual',async()=>{
  const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/ground/g16/${f}.json`,import.meta.url)))));
  validateBlock({...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects});
  assert.deepEqual(o.objects.flatMap(v=>v.seats).sort(),['Seat_G1','Seat_G2','Seat_G4','Seat_G5','Seat_G6','Seat_G7']);
  for(const camera of e.cameras)for(const kind of ['chairs','tables']){
    const roi=JSON.parse(await readFile(new URL('../'+e.rois[camera][kind],import.meta.url)));
    for(const label of Object.keys(roi)){
      const matches=o.objects.filter(v=>v.seats.includes(label)||v.externalId===label);
      if(e.contextOnlyRois[label])assert.equal(matches.length,0);else assert.equal(matches.length,1,label);
    }
  }
  assert.equal(o.objects.find(v=>v.externalId==='Table_G2').variant,'square-stone');
  const archWall=a.walls.find(w=>w.id==='g16-neighbor-arch-wall');assert.deepEqual(archWall.end,[-3.7,5.2]);
  assert.equal(a.circulation.route.cameraAtEntrance,'G23');
  assert.deepEqual(a.circulation.polygon,[[-3.7,.9],[-.7,.9],[-.7,5.2],[-3.7,5.2]]);
  assert.equal(a.walls.find(w=>w.id==='g16-window-back').variant,undefined);
  assert.equal(a.circulation.connections[0].neighborBoundary,'g9-passage-g-zone');
  for(const cutaway of [false,true]){const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);const hits=new THREE.Raycaster(new THREE.Vector3(-4,.7,-.8),new THREE.Vector3(1,0,0)).intersectObject(shell,true);assert.ok(hits.length);assert.ok(hits[0].point.x>2.4,'Neighbor arch should stay open');}
});

test('G16/G18/G20 joins align widths and preserve both arched walking connections',async()=>{
  const {composeLayout}=await import('./layouts.mjs');
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const {block}=await composeLayout(fileURLToPath(new URL('../',import.meta.url)),'ground/g16-g18',load);
  validateBlock(block);assert.equal(block.objects.flatMap(o=>o.seats).length,34);
  assert.equal(block.architecture.walls.filter(w=>w.id==='g16-neighbor-arch-wall').length,1);
  assert.equal(block.architecture.circulations.length,3);
  const [g16Floor,g18Floor,g20Floor]=block.architecture.floorSections;
  assert.equal(g20Floor.size[0],g18Floor.size[0]);
  assert.equal(g20Floor.center[1],g18Floor.center[1]);
  assert.ok(Math.abs((g20Floor.center[0]+g20Floor.size[1]/2)-(g18Floor.center[0]-g18Floor.size[1]/2))<1e-8);
  assert.equal(block.architecture.walls.filter(w=>w.id==='g18-g20-arch-wall').length,1);
  const newArch=block.architecture.openings.find(o=>o.id==='g18-g20-arch');
  assert.equal(newArch.width,block.architecture.openings.find(o=>o.id==='g16-neighbor-arch').width);
  assert.equal(g16Floor.size[1],g18Floor.size[0]);
  assert.equal(g16Floor.center[1]-g16Floor.size[1]/2,g18Floor.center[1]-g18Floor.size[0]/2);
  assert.equal(g16Floor.center[1]+g16Floor.size[1]/2,g18Floor.center[1]+g18Floor.size[0]/2);
  const arch=block.architecture.walls.find(w=>w.id==='g16-neighbor-arch-wall');assert.deepEqual(arch.start,[-3,-3.2]);assert.deepEqual(arch.end,[-3,5.2]);
  const g18=(await load('ground/g18')).block;
  const chair=g18.objects.find(o=>o.seats.includes('Seat_G10'));
  const floorEnd=g18.architecture.floorCenter[1]-g18.floorSize[1]/2;
  const margin=chair.position[2]-chair.size[2]/2-floorEnd;assert.ok(margin>=.6&&margin<.8,'Floor should stop about one tile after G10');
  assert.ok(Math.abs(-7.2-floorEnd+3)<1e-8,'Trimmed G18 end meets G16 X=-3');
  const originals=(await Promise.all(['ground/g16','ground/g18','ground/g20'].map(load))).flatMap(({block})=>block.objects);
  for(const o of block.objects){const source=originals.find(v=>v.id===o.id);assert.deepEqual(o.seats,source.seats);assert.deepEqual(o.size,source.size);assert.deepEqual(o.scale,source.scale);}
  const shell=buildArchitecture(block.architecture);shell.updateMatrixWorld(true);
  for(const z of [1,1.7,2.2]){const hits=new THREE.Raycaster(new THREE.Vector3(-3.5,.7,z),new THREE.Vector3(1,0,0)).intersectObject(shell,true);assert.ok(hits.length);assert.ok(hits[0].point.x>2,'Join must stay open through the arch');}
  for(const cutaway of [false,true]){const shell=buildArchitecture(block.architecture,{cutaway});shell.updateMatrixWorld(true);const hits=new THREE.Raycaster(new THREE.Vector3(-12,.7,1),new THREE.Vector3(1,0,0)).intersectObject(shell,true);assert.ok(hits.length);assert.ok(hits[0].point.x>2,'White path must pass through both arches');}
  const lintel=buildArchitecture(block.architecture);lintel.updateMatrixWorld(true);assert.ok(new THREE.Raycaster(new THREE.Vector3(-12,3.8,1),new THREE.Vector3(1,0,0)).intersectObject(lintel,true).some(h=>Math.abs(h.point.x+11)<.2),'New arch must have a solid surround overhead');
});

test('B/G floor assembly aligns paired bay lengths and keeps G9 passage open into G16',async()=>{
  const {composeLayout}=await import('./layouts.mjs');
  const root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const layout=JSON.parse(await readFile(new URL('../layouts/ground/b-g-lounges.json',import.meta.url)));
  const {block}=await composeLayout(root,'ground/b-g-lounges',load);validateBlock(block);
  assert.equal(block.objects.filter(o=>!['ground/departure-reception','ground/g32','ground/egate-office-passage'].includes(o.sourceBlock)).flatMap(o=>o.seats).length,238);
  assert.equal(block.objects.flatMap(o=>o.seats).length,249);
  const spans=block.architecture.floorSections.slice(0,6).map(f=>{const r=f.yaw*Math.PI/180,w=Math.abs(Math.cos(r))*f.size[0]+Math.abs(Math.sin(r))*f.size[1];return [f.center[0]-w/2,f.center[0]+w/2];});
  for(const [b,g]of [[0,3],[1,4],[2,5]])for(let i=0;i<2;i++)assert.ok(Math.abs(spans[b][i]-spans[g][i])<1e-8,'Paired floor bay boundaries must align');
  const added=block.architecture.floorSections.slice(6,8);assert.equal(added[0].size[0],added[1].size[0]);assert.equal(added[0].center[0],added[1].center[0]);
  assert.ok(!block.architecture.walls.some(w=>['g2-reception-backing','g11-side-c5'].includes(w.id)));
  assert.equal(block.architecture.walls.filter(w=>w.id==='zone-c-reception-half-glass').length,1);
  for(const part of layout.components){const {block:source}=await load(part.block),r=part.yaw*Math.PI/180;
    for(const seat of source.objects.filter(o=>o.seats.length)){
      const actual=block.objects.find(o=>o.id===seat.id);assert.deepEqual(actual.seats,seat.seats);assert.deepEqual(actual.size,seat.size);assert.deepEqual(actual.scale,seat.scale);assert.equal(actual.yaw,seat.yaw+part.yaw);
      const offset=part.objectOffsets?.[seat.id]||[0,0,0];
      const [x,y,z]=seat.position.map((v,i)=>v+offset[i]),expected=[Math.cos(r)*x+Math.sin(r)*z+part.position[0],y+part.position[1],-Math.sin(r)*x+Math.cos(r)*z+part.position[2]];
      expected.forEach((v,i)=>assert.ok(Math.abs(v-actual.position[i])<1e-8));
    }
  }
  assert.ok(!block.architecture.walls.some(w=>['g18-curtained-glazing','g20-curtained-glazing'].includes(w.id)),'Shared interface glazing must have one owner');
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(block.architecture,{cutaway});shell.updateMatrixWorld(true);
    const receptionRoute=new THREE.Raycaster(new THREE.Vector3(-27.5,.7,2),new THREE.Vector3(0,0,-1),0,12).intersectObject(shell,true);assert.equal(receptionRoute.length,0,'Half-open reception/Zone C connection must stay clear');
    const g20Entry=new THREE.Raycaster(new THREE.Vector3(-20,.7,-7.7),new THREE.Vector3(-1,0,0),0,8).intersectObject(shell,true);assert.equal(g20Entry.length,0,'G20 must connect through G2 arch');
    const passage=new THREE.Raycaster(new THREE.Vector3(-4.58,.7,1),new THREE.Vector3(0,0,-1),0,7).intersectObject(shell,true).filter(h=>h.object.isMesh);assert.equal(passage.length,0,'G9 passage must stay open into G16');
    const route=new THREE.Raycaster(new THREE.Vector3(-3.5,.7,-6.7),new THREE.Vector3(-1,0,0),0,17).intersectObject(shell,true);assert.equal(route.length,0,'G-zone route must pass through both arches');
  }
});

test('G22, G21 and G2 join in owner order with one arch per seam and a continuous route',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const {block}=await composeLayout(root,'ground/b-g-lounges',load);
  const layout=JSON.parse(await readFile(new URL('../layouts/ground/b-g-lounges.json',import.meta.url)));
  const parts=['ground/g22','ground/g21','ground/g2'].map(key=>layout.components.find(p=>p.block===key));
  assert.ok(parts[0].position[0]<parts[1].position[0]&&parts[1].position[0]<parts[2].position[0]);
  for(const part of parts.slice(0,2)){
    const {block:source}=await load(part.block),r=part.yaw*Math.PI/180;
    for(const o of source.objects){
      const actual=block.objects.find(v=>v.id===o.id);
      assert.deepEqual(actual.size,o.size);assert.deepEqual(actual.scale,o.scale);assert.deepEqual(actual.seats,o.seats);
      assert.equal(actual.yaw,o.yaw+part.yaw);
      const offset=part.objectOffsets?.[o.id]||[0,0,0];
      const [x,y,z]=o.position.map((v,i)=>v+offset[i]),expected=[Math.cos(r)*x+Math.sin(r)*z+part.position[0],y,-Math.sin(r)*x+Math.cos(r)*z+part.position[2]];
      actual.position.forEach((value,i)=>assert.ok(Math.abs(value-expected[i])<1e-8,'All source furniture must retain its relative transform'));
    }
  }
  assert.ok(!block.architecture.walls.some(w=>w.id==='g21-arch-wall-positive-z'));
  for(const [x,id] of [[-29.38,'g2-right-arch-wall'],[-36.78,'g22-arch-wall-positive-z']]){
    const owners=block.architecture.walls.filter(w=>Math.abs(w.start[0]-x)<1e-8&&Math.abs(w.end[0]-x)<1e-8&&Math.min(w.start[1],w.end[1])< -7.2&&Math.max(w.start[1],w.end[1])> -7.2);
    assert.deepEqual(owners.map(w=>w.id),[id],'Each shared arch must render once');
  }
  const g22Objects=block.objects.filter(o=>o.sourceBlock==='ground/g22');
  for(const label of ['Seat_G49','Seat_G57']){
    const chair=g22Objects.find(o=>o.seats.includes(label));
    assert.ok(chair.position[0]>-40,'G49/G57 must be beside the G21 join, not the outer end');
  }
  const sections=parts.slice(0,2).map(p=>block.architecture.floorSections[layout.components.indexOf(p)]);
  assert.equal(sections[0].size[0],sections[1].size[0],'G22 and G21 cross-spans must match');
  assert.equal(sections[0].center[1],sections[1].center[1]);
  const {block:g22Source}=await load('ground/g22');
  for(const side of [-1,1]){
    const bank=g22Source.objects.filter(o=>Math.sign(o.position[0])===side);
    const offsets=bank.map(o=>parts[0].objectOffsets[o.id]);
    assert.ok(offsets.every(v=>Math.abs(v[0]+side*.3)<1e-8&&v[1]===0&&v[2]===0),'Each bank must move together without changing internal offsets');
  }
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(block.architecture,{cutaway});shell.updateMatrixWorld(true);
    for(const z of [-8.5,-7.2,-5.9])assert.equal(new THREE.Raycaster(new THREE.Vector3(-46.8,.7,z),new THREE.Vector3(1,0,0),0,25.7).intersectObject(shell,true).length,0,'Walking route must connect G22 through G21 into G2');
    if(!cutaway)for(const x of [-44.18,-36.78,-29.38])assert.ok(new THREE.Raycaster(new THREE.Vector3(x-1,3.8,-7.2),new THREE.Vector3(1,0,0),0,2).intersectObject(shell,true).length,'All new connections have overhead arch surrounds');
    shell.traverse(n=>{n.geometry?.dispose();n.material?.dispose();});
  }
});

test('G12/G14 fills both G21/G22 bays and connects its C19 end to Zone C without duplicate walls',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const layout=JSON.parse(await readFile(new URL('../layouts/ground/b-g-lounges.json',import.meta.url)));
  const {block}=await composeLayout(root,'ground/b-g-lounges',load);
  assert.equal(block.name,'B + C + E + G + I · Lounges and checkpoints');
  const index=layout.components.findIndex(p=>p.block==='ground/g12-g14'),part=layout.components[index];
  const floor=block.architecture.floorSections[index];
  assert.ok(Math.abs(floor.center[0]-floor.size[1]/2+44.18)<1e-8);
  assert.ok(Math.abs(floor.center[0]+floor.size[1]/2+29.38)<1e-8);
  assert.ok(Math.abs(floor.center[1]-floor.size[0]/2+3)<1e-8,'Floor-center override must align the G-row seam');
  assert.ok(Math.abs(floor.center[1]+floor.size[0]/2-5.6)<1e-8,'Outer corridor edge must match the existing front corridor');
  for(const label of ['Seat_C19','Seat_C20'])assert.ok(block.objects.find(o=>o.seats.includes(label)).position[0]>-31,'C19/C20 end must face the Zone C seam');
  const {block:source}=await load(part.block),r=part.yaw*Math.PI/180;
  for(const o of source.objects){
    const actual=block.objects.find(v=>v.id===o.id),offset=part.objectOffsets?.[o.id]||[0,0,0];
    assert.deepEqual(actual.size,o.size);assert.deepEqual(actual.scale,o.scale);assert.deepEqual(actual.seats,o.seats);
    const expectedShift=0;
    assert.equal(offset[2],expectedShift,'End groups move rigidly; the central group stays fixed');
    const [x,y,z]=o.position.map((v,i)=>v+offset[i]);
    const expected=[Math.cos(r)*x+Math.sin(r)*z+part.position[0],y,-Math.sin(r)*x+Math.cos(r)*z+part.position[2]];
    actual.position.forEach((v,i)=>assert.ok(Math.abs(v-expected[i])<1e-8));
  }
  assert.ok(!block.architecture.walls.some(w=>/^g12-g14-glazing-/.test(w.id)||w.id==='zone-c-opposite-pods-glass'));
  const cFront=block.architecture.walls.find(w=>w.id==='g12-g14-corridor-arches');
  const zoneFront=block.architecture.walls.find(w=>w.id==='zone-c-approach-arch-wall');
  for(const p of [cFront.start,cFront.end])assert.ok(Math.abs(p[1]-zoneFront.start[1])<1e-8,'C lounge frontage must align with the Zone C arch line');
  const corridor=block.architecture.circulations.find(c=>c.sourceBlock==='ground/g12-g14');
  const depths=corridor.polygon.map(p=>p[1]);
  assert.ok(Math.abs(Math.min(...depths)-3)<1e-8&&Math.abs(Math.max(...depths)-5.6)<1e-8,'Corridor must retain constant width through the lower-right join');
  for(const o of block.objects.filter(o=>o.sourceBlock==='ground/g12-g14')){
    const r=o.yaw*Math.PI/180,extent=(Math.abs(Math.sin(r))*o.size[0]*o.scale[0]+Math.abs(Math.cos(r))*o.size[2]*o.scale[2])/2;
    assert.ok(o.position[2]+extent<3-.09,`${o.id} must clear the aligned arch wall`);
  }
  for(const id of ['g21-reflective-glazing','g22-reflective-glazing']){
    const wall=block.architecture.walls.find(w=>w.id===id);
    assert.ok(Math.abs(wall.start[1]+3)<1e-8&&Math.abs(wall.end[1]+3)<1e-8,'Existing G-row panes own the aligned shared boundary');
  }
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(block.architecture,{cutaway});shell.updateMatrixWorld(true);
    const cast=(p,d,length)=>new THREE.Raycaster(new THREE.Vector3(...p),new THREE.Vector3(...d),0,length).intersectObject(shell,true);
    assert.equal(cast([-46,.7,4.5],[1,0,0],21).length,0,'Front corridor must connect C lounge to Zone C');
    assert.equal(cast([-25.5,.7,4.5],[0,0,-1],4).length,0,'Existing Zone C approach arch must remain open');
    assert.equal(cast([-36.78,.7,4.5],[0,0,-1],4).length,0,'Central lounge frontage arch must remain open');
    assert.ok(cast([-30.5,.7,0],[1,0,0],2).length,'Decorative C19 end backing stays closed beside Zone C');
    shell.traverse(n=>{n.geometry?.dispose();n.material?.dispose();});
  }
});

test('G27 G69/G63 end joins G22 G56/G62 with matching shell dimensions and one shared arch',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const layout=JSON.parse(await readFile(new URL('../layouts/ground/b-g-lounges.json',import.meta.url)));
  const {block}=await composeLayout(root,'ground/b-g-lounges',load);
  const index=key=>layout.components.findIndex(p=>p.block===key);
  const g27=block.architecture.floorSections[index('ground/g27')],g22=block.architecture.floorSections[index('ground/g22')];
  assert.ok(Math.abs(g27.center[0]+g27.size[1]/2-(g22.center[0]-g22.size[1]/2))<1e-8,'Bay ends must meet without a gap or overlap');
  assert.equal(g27.size[0],g22.size[0]);assert.equal(g27.center[1],g22.center[1]);
  for(const label of ['Seat_G69','Seat_G63'])assert.ok(block.objects.find(o=>o.seats.includes(label)).position[0]>-49,'G69/G63 must be at the G22 end');
  for(const label of ['Seat_G56','Seat_G62'])assert.ok(block.objects.find(o=>o.seats.includes(label)).position[0]<-42.7,'G56/G62 must be at the G27 end');
  assert.ok(!block.architecture.walls.some(w=>w.id==='g27-arch-wall-positive-z'));
  const seam=block.architecture.walls.filter(w=>Math.abs(w.start[0]+44.18)<1e-8&&Math.abs(w.end[0]+44.18)<1e-8&&Math.min(w.start[1],w.end[1])< -7.2&&Math.max(w.start[1],w.end[1])> -7.2);
  assert.deepEqual(seam.map(w=>w.id),['g22-arch-wall-negative-z']);
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(block.architecture,{cutaway});shell.updateMatrixWorld(true);
    for(const z of [-8.5,-7.2,-5.9])assert.equal(new THREE.Raycaster(new THREE.Vector3(-56.4,.7,z),new THREE.Vector3(1,0,0),0,34).intersectObject(shell,true).length,0,'Route must continue from G27 through G22/G21 into G2');
    if(!cutaway)assert.ok(new THREE.Raycaster(new THREE.Vector3(-44.7,3.8,-7.2),new THREE.Vector3(1,0,0),0,1).intersectObject(shell,true).length,'Shared arch must retain its overhead surround');
    shell.traverse(n=>{n.geometry?.dispose();n.material?.dispose();});
  }
});

test('G28 G84/G76 end joins G27 with aligned floors and a clear single arch',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const {block}=await composeLayout(root,'ground/b-g-lounges',load);
  const [g27,g28]=block.architecture.floorSections.slice(11,13);
  assert.ok(Math.abs(g28.center[0]+g28.size[1]/2-(g27.center[0]-g27.size[1]/2))<1e-8);
  assert.equal(g28.size[0],g27.size[0]);assert.equal(g28.center[1],g27.center[1]);
  for(const label of ['Seat_G84','Seat_G76'])assert.ok(block.objects.find(o=>o.seats.includes(label)).position[0]>-58,'Requested seat end must face G27');
  const seam=block.architecture.walls.filter(w=>Math.abs(w.start[0]+53.78)<1e-8&&Math.abs(w.end[0]+53.78)<1e-8&&Math.min(w.start[1],w.end[1])< -7.2&&Math.max(w.start[1],w.end[1])> -7.2);
  assert.deepEqual(seam.map(w=>w.id),['g27-arch-wall-negative-z']);
  const shell=buildArchitecture(block.architecture);shell.updateMatrixWorld(true);
  for(const z of [-8.5,-7.2,-5.9])assert.equal(new THREE.Raycaster(new THREE.Vector3(-64,.7,z),new THREE.Vector3(1,0,0),0,41).intersectObject(shell,true).length,0);
  assert.ok(new THREE.Raycaster(new THREE.Vector3(-54.2,3.8,-7.2),new THREE.Vector3(1,0,0),0,1).intersectObject(shell,true).length);
  shell.traverse(n=>{n.geometry?.dispose();n.material?.dispose();});
});

test('G29 joins the G28 end through one clear arch and uses dark flooring',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const {block}=await composeLayout(root,'ground/b-g-lounges',load);
  const [g28,g29]=block.architecture.floorSections.slice(12,14);
  assert.ok(Math.abs(g29.center[0]+g29.size[0]/2-(g28.center[0]-g28.size[1]/2))<1e-8);
  assert.equal(g29.center[1],g28.center[1]);assert.equal(g29.size[1],g28.size[0]);
  assert.ok(!block.architecture.circulations.some(c=>c.sourceBlock==='ground/g29'));
  assert.ok(!block.architecture.walls.some(w=>w.id==='g28-arch-wall-negative-z'));
  const seam=block.architecture.walls.filter(w=>Math.abs(w.start[0]+61.38)<1e-8&&Math.abs(w.end[0]+61.38)<1e-8);
  assert.deepEqual(seam.map(w=>w.id),['g29-arch-wall-negative-x']);
  const shell=buildArchitecture(block.architecture);shell.updateMatrixWorld(true);
  for(const z of [-8.5,-7.2,-5.9])assert.equal(new THREE.Raycaster(new THREE.Vector3(-61.9,.7,z),new THREE.Vector3(1,0,0),0,2).intersectObject(shell,true).length,0);
  for(const z of [-10.5,-3.9])assert.equal(new THREE.Raycaster(new THREE.Vector3(-61.9,.7,z),new THREE.Vector3(1,0,0),0,2).intersectObject(shell,true).length,0,'Full-width arch must stay clear across the matching bays');
  shell.traverse(n=>{n.geometry?.dispose();n.material?.dispose();});
});

test('Shared G3/G24/G25 fits in front of G9/G10 and keeps the front corridor and dining entrances open',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const layout=JSON.parse(await readFile(new URL('../layouts/ground/b-g-lounges.json',import.meta.url)));
  const {block}=await composeLayout(root,'ground/b-g-lounges',load);
  const part=layout.components.find(p=>p.block==='ground/g3-g24-g25');
  assert.equal(part.yaw,-90);assert.ok(!part.objectOffsets);
  const section=key=>block.architecture.floorSections[layout.components.findIndex(p=>p.block===key)];
  const dining=section('ground/g3-g24-g25'),g9=section('ground/g9'),g10=section('ground/g10');
  assert.ok(Math.abs(dining.center[0]-((g10.center[0]-g10.size[0]/2)+(g9.center[0]+g9.size[0]/2))/2)<1e-8);
  assert.ok(Math.abs(dining.center[0]-dining.size[1]/2-(g10.center[0]-g10.size[0]/2))<1e-8,'Dining left edge must match G10 leftmost wall');
  assert.ok(Math.abs(dining.center[0]+dining.size[1]/2-(g9.center[0]+g9.size[0]/2))<1e-8,'Dining right edge must match G9 rightmost wall');
  assert.ok(Math.abs(dining.center[1]-dining.size[0]/2-(layout.corridor.center[1]+layout.corridor.size[1]/2))<1e-8);
  const {block:source}=await load(part.block);
  for(const inlay of source.architecture.floorInlays)assert.ok(block.architecture.floorInlays.some(i=>i.id===inlay.id));
  for(const cutaway of [false,true]) {
    const shell=buildArchitecture(block.architecture,{cutaway});shell.updateMatrixWorld(true);
    assert.equal(new THREE.Raycaster(new THREE.Vector3(-20,.7,4.3),new THREE.Vector3(1,0,0),0,21).intersectObject(shell,true).length,0,'Existing front corridor must stay continuous');
    for(const x of [-8.43,-3.13])assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,4.3),new THREE.Vector3(0,0,1),0,2.5).intersectObject(shell,true).length,0,'Dining entry must connect across the floor seam');
    assert.equal(new THREE.Raycaster(new THREE.Vector3(-14,.7,20.2),new THREE.Vector3(1,0,0),0,15).intersectObject(shell,true).length,0,'TV-side path must remain clear from I-zone extension to closed north end');
    shell.traverse(n=>{n.geometry?.dispose();n.material?.dispose();});
  }
});

test('G2 reception leaves an open exit approach with E13 as sole primary camera',async()=>{
  const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/ground/g2/${f}.json`,import.meta.url)))));
  validateBlock({...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects});
  assert.deepEqual(e.primaryCameras,['E13']);
  const roi=JSON.parse(await readFile(new URL('../'+e.rois.E13.reception,import.meta.url)));assert.ok(roi.R1.points.length>=3);
  assert.equal(o.objects.filter(v=>v.type==='counter').length,1);
  const chairs=o.objects.filter(v=>v.type==='office-chair');assert.equal(chairs.length,2);assert.ok(chairs.every(v=>v.seats[0].startsWith('Seat_')));assert.equal(new Set(chairs.map(v=>v.seats[0])).size,2);
  assert.ok(o.objects.every(v=>!v.externalId),'Neighboring ROI tables must not be duplicated');
  const desk=o.objects.find(v=>v.type==='counter');assert.ok(desk.position[0]+desk.size[0]/2<.3,'Counter must leave right half open');
  assert.equal(a.sharedBoundaries.find(v=>v.id==='g2-right-lounge-arch').neighbor,'ground/g20');assert.equal(a.sharedBoundaries.find(v=>v.id==='g2-left-lounge-arch').neighbor,'ground/g21');
  assert.ok(Math.abs(a.circulation.polygon[0][1]+a.floorSize[1]/2-2.8)<1e-8,'Reception dark strip matches the G18/G20 seating bank depth');
  const pillars=a.walls.filter(w=>w.id.endsWith('rear-pillar'));assert.equal(pillars.length,2);
  assert.deepEqual(pillars.map(w=>(w.start[0]+w.end[0])/2),[0,4.2]);
  for(const cutaway of [false,true]){const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);assert.equal(new THREE.Raycaster(new THREE.Vector3(2.1,.7,4.5),new THREE.Vector3(0,0,-1),0,9).intersectObject(shell,true).length,0,'Reception-side path to exit stays clear');}
});

test('Zone C has two pods, no seat identities, and a clear reception approach',async()=>{
  const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/ground/zone-c-pods/${f}.json`,import.meta.url)))));
  validateBlock({...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects});
  const pods=o.objects.filter(v=>v.type==='privacy-pod');assert.equal(pods.length,2);
  assert.equal(o.objects.flatMap(v=>v.seats).length,0);assert.ok(!o.objects.some(v=>v.externalId));
  assert.deepEqual(e.primaryCameras,['Cor2']);assert.equal(a.sharedBoundaries[0].neighborBoundary,'g2-inward-path');
  for(const pod of pods){const r=pod.yaw*Math.PI/180,extent=(Math.abs(Math.cos(r))*pod.size[0]*pod.scale[0]+Math.abs(Math.sin(r))*pod.size[2]*pod.scale[2])/2;assert.ok(pod.position[0]-extent>=2,'Pods must be over the dark strip');}
  assert.deepEqual(a.circulation.polygon,[[-3.8,-3],[2,-3],[2,3],[-3.8,3]]);
  const panes=a.walls.filter(w=>w.variant==='blue-gold-geometric');assert.equal(panes.length,1);assert.equal(a.walls.find(w=>w.id==='zone-c-behind-pods-glass').variant,'patterned-smoked');const halfPane=a.walls.find(w=>w.id==='zone-c-reception-half-glass');assert.deepEqual(halfPane.start,[0,-3]);assert.equal(halfPane.kind,'glass');assert.equal(halfPane.variant,'patterned-smoked');
  for(const cutaway of [false,true]){const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);assert.equal(new THREE.Raycaster(new THREE.Vector3(-1.5,.7,4),new THREE.Vector3(0,0,-1),0,8).intersectObject(shell,true).length,0,'Route toward arrival reception must remain open');}
});

test('G2 double sliding gate opens the central passage and validates opening range',async()=>{
  const {buildReceptionObject}=await import('./reception-objects.js');
  const [m,a,o]=await Promise.all(['manifest','architecture','objects'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/ground/g2/${f}.json`,import.meta.url)))));
  const gate=o.objects.find(v=>v.id==='g2-automatic-exit-gate');assert.equal(gate.type,'automatic-glass-gate');assert.equal(gate.position[2],3.52);
  const mesh=(group,geometry,material,p)=>{const v=new THREE.Mesh(geometry,material);v.position.set(...p);group.add(v);return v;};
  const helpers={mesh,box:(g,size,p,m)=>mesh(g,new THREE.BoxGeometry(...size),m,p),mat:color=>new THREE.MeshStandardMaterial({color})};
  for(const openFraction of [0,1]){const group=new THREE.Group();buildReceptionObject(group,{...gate,openFraction},helpers);group.updateMatrixWorld(true);const hits=new THREE.Raycaster(new THREE.Vector3(.2,.7,1),new THREE.Vector3(0,0,-1),0,2).intersectObject(group,true);assert.equal(hits.length>0,openFraction===0,'Leaves must clear the passage when open');}
  const draft={...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects};for(const value of [-.1,1.1]){gate.openFraction=value;assert.throws(()=>validateBlock(draft),/Gate opening/);}
});

test('Elevated wall heads preserve window heights and disappear in cutaway',()=>{
  const a={walls:[{id:'head',kind:'solid',start:[0,0],end:[2,0],height:2.35,elevation:1.75,thickness:.16}]};
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);
    const hit=y=>new THREE.Raycaster(new THREE.Vector3(1,y,1),new THREE.Vector3(0,0,-1),0,2).intersectObject(shell,true).length;
    assert.equal(hit(1.2),0,'A raised wall must not fill the window below');
    assert.equal(hit(2)>0,!cutaway,'Window head is visible only in the full shell');
  }
  for(const elevation of [-1,NaN,Infinity,19]){
    assert.throws(()=>validateBlock({...block,architecture:{walls:[{...a.walls[0],elevation}]}}),/wall elevation/);
  }
});

test('G32 surroundings leave the visitor approach clear in full and cutaway views',async()=>{
  const base=new URL('../blocks/ground/g32/',import.meta.url);
  const [m,a,o,e]=await Promise.all(['manifest.json','architecture.json','objects.json','evidence.json'].map(async f=>JSON.parse(await readFile(new URL(f,base)))));
  validateBlock({...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects});
  assert.equal(o.objects.filter(x=>x.type==='counter').length,4);
  assert.equal(o.objects.filter(x=>x.type==='office-chair').length,7);
  assert.equal(o.objects.filter(x=>x.variant==='checkin-kiosk').length,4);
  for(const c of e.cameras)assert.ok(e.wideSnapshots[c]);
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);
    for(const x of [0,.8,1.8]){
      const ray=new THREE.Raycaster(new THREE.Vector3(x,.7,.65),new THREE.Vector3(0,0,1),0,6);
      assert.equal(ray.intersectObject(shell,true).length,0,'Front approach must remain open');
    }
    const pattern=shell.children.find(g=>g.userData.boundaryId==='g32-saudia-patterned-glass');
    const bounds=new THREE.Box3().setFromObject(pattern);
    const glazing=a.walls.find(w=>w.id==='g32-saudia-patterned-glass');
    assert.ok(bounds.max.y<=(cutaway?1.05:4.1)+.02,'Diagonal strips must stay inside the glazing height');
    assert.ok(bounds.min.z>=Math.min(glazing.start[1],glazing.end[1])-.03&&bounds.max.z<=Math.max(glazing.start[1],glazing.end[1])+.03,'Diagonal strips must stay inside the glazing span');
  }
});

test('Departure reception keeps entry, both e-gate lanes and SGS approach distinct and clear',async()=>{
  const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/ground/departure-reception/${f}.json`,import.meta.url)))));
  validateBlock({...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects});
  const {buildReceptionObject,receptionSizes}=await import('./reception-objects.js');
  const gate=o.objects.find(o=>o.variant==='swing-turnstile');
  const mesh=(g,geometry,material,p)=>{const v=new THREE.Mesh(geometry,material);v.position.set(...p);g.add(v);return v;};
  const helpers={mesh,box:(g,size,p,m)=>mesh(g,new THREE.BoxGeometry(...size),m,p),mat:color=>new THREE.MeshStandardMaterial({color})};
  for(const openFraction of [0,1]){
    const g=new THREE.Group();buildReceptionObject(g,{...gate,openFraction},helpers);
    g.scale.fromArray(gate.size.map((v,i)=>v/receptionSizes[gate.type][i]));g.updateMatrixWorld(true);
    for(const x of [-.825,.825]){
      const hits=new THREE.Raycaster(new THREE.Vector3(x,.6,2),new THREE.Vector3(0,0,-1),0,4).intersectObject(g,true);
      assert.equal(hits.length>0,openFraction===0,'Each lane must clear when swing leaves open');
    }
    const bounds=new THREE.Box3().setFromObject(g);
    assert.ok(bounds.max.z-bounds.min.z<=gate.size[2]+.02,'Rotating leaves must remain within physical gate depth');
  }
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);
    for(const [origin,direction,far] of [
      [[-.8,.7,5.8],[0,0,-1],4],
      [[3.5,.7,-.43],[1,0,0],4.4],
      [[3.5,.7,.93],[1,0,0],4.4],
      [[-2.8,.7,.7],[-1,0,0],3.1]
    ])assert.equal(new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction),0,far).intersectObject(shell,true).length,0,'Entry/gate/SGS routes must not be closed by inferred walls');
  }
  const sideChair=o.objects.find(o=>o.id==='departure-reception-entrance-side-chair');
  assert.equal(sideChair.identityStatus,'owner-confirmed-chair-temporary-id');
  assert.deepEqual(o.objects.flatMap(o=>o.seats),['Seat_DepRec_TMP_01','Seat_DepRec_TMP_02','Seat_DepRec_TMP_03','Seat_DepRec_TMP_04'],'Owner-requested staff chairs retain unique temporary identities');
  const path=a.sgsSideApproach.path,strip=a.sgsSideApproach.staffStrip;
  assert.ok(sideChair.position[2]-sideChair.size[2]/2>=Math.max(...path.polygon.map(p=>p[1])),'Staff chair must stay outside the adjacent SGS route');
  assert.ok(sideChair.position[0]>=Math.min(...strip.polygon.map(p=>p[0]))&&sideChair.position[0]<=Math.max(...strip.polygon.map(p=>p[0])));
  assert.ok(!o.objects.some(o=>o.id.startsWith('g32-')),'Supporting SGS views must not duplicate the existing block');
  assert.ok(e.sideReview.every(side=>side.cameras.every(c=>e.cameras.includes(c))));
  const oldReturn=a.walls.find(w=>w.id==='departure-reception-left-stone-return');
  const leg=a.walls.find(w=>w.id==='departure-reception-main-counter-sgs-l-return');
  assert.equal(leg,undefined,'Owner removed the short front L stub');
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);
    assert.ok(new THREE.Raycaster(new THREE.Vector3(-2.8,.7,2.45),new THREE.Vector3(-1,0,0),0,3.1).intersectObject(shell,true).length,'Side-counter wall must bound the staff strip');
    assert.equal(new THREE.Raycaster(new THREE.Vector3(-4.45,.7,-2),new THREE.Vector3(0,0,1),0,1.5).intersectObject(shell,true).length,0,'Removed stub must leave lower counter front open');
  }
});

test('Reception flags have physical stands, folded cloth and readable reverse UVs',async()=>{
  const {buildReceptionObject,receptionSizes}=await import('./reception-objects.js');
  const {objects}=JSON.parse(await readFile(new URL('../blocks/ground/departure-reception/objects.json',import.meta.url)));
  const mesh=(g,geometry,material,p)=>{const v=new THREE.Mesh(geometry,material);v.position.set(...p);g.add(v);return v;};
  const helpers={mesh,box:(g,s,p,m)=>mesh(g,new THREE.BoxGeometry(...s),m,p),mat:color=>new THREE.MeshStandardMaterial({color}),rod:(g,a,b,r,m)=>{
    const delta=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));
    const v=mesh(g,new THREE.CylinderGeometry(r,r,delta.length(),12),m,new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5).toArray());
    v.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return v;
  }};
  for(const flag of objects.filter(o=>o.variant==='standing-flag')){
    const g=new THREE.Group();buildReceptionObject(g,flag,helpers);g.scale.fromArray(flag.size.map((v,i)=>v/receptionSizes[flag.type][i]));g.updateMatrixWorld(true);
    const front=g.getObjectByName('Flag cloth · front'),back=g.getObjectByName('Flag cloth · reverse');assert.ok(front&&back);
    const p=front.geometry.attributes.position,uv=front.geometry.attributes.uv,reverse=back.geometry.attributes.uv;
    assert.ok(Array.from(p.array).every(Number.isFinite));
    assert.ok(Math.max(...Array.from({length:p.count},(_,i)=>p.getZ(i)))-Math.min(...Array.from({length:p.count},(_,i)=>p.getZ(i)))>.04,'Cloth must have actual folds');
    for(let i=0;i<uv.count;i++)assert.ok(Math.abs(uv.getX(i)+reverse.getX(i)-1)<1e-6,'Reverse artwork must compensate for viewing from behind');
    const bounds=new THREE.Box3().setFromObject(g);assert.ok(Math.abs(bounds.min.y)<1e-6,'Flag base must rest on floor');assert.ok(Math.abs(bounds.max.y-flag.size[1])<1e-6);
  }
});

test('Reception and SGS share single walls behind security and beside the unused counter',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e}};};
  const {block}=await composeLayout(root,'ground/departure-sgs',load);validateBlock(block);
  for(const id of ['g32-kiosk-backing','g32-approach-wall-return'])assert.equal(block.architecture.walls.filter(w=>w.id===id).length,1);
  assert.ok(!block.architecture.walls.some(w=>w.renderRole==='standalone-shared-wall-reference'));
  const original=(await load('ground/g32')).block.objects;
  for(const o of original)assert.equal(block.objects.filter(n=>n.id===o.id).length,1,'Existing SGS object must be loaded exactly once');
  const unused=block.objects.find(o=>o.id==='departure-reception-unused-counter');assert.equal(unused.usageStatus,'currently-unused-owner-confirmed');assert.equal(unused.seats.length,0);
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(block.architecture,{cutaway});shell.updateMatrixWorld(true);
    const hit=(origin,direction,far)=>new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction),0,far).intersectObject(shell,true);
    const back=hit([-5.35,.7,3.93],[-1,0,0],3);assert.ok(back.length);assert.ok(Math.abs(back[0].point.x+7.45)<.1,'SGS wall closes security back');
    for(const dx of [-1,1])assert.ok(hit([-5.85,.7,-2],[dx,0,0],2).length,'Unused counter must lie between SGS and reception walls');
    assert.equal(hit([-3.2,.7,.7],[-1,0,0],6).length,0,'Shared passage must stay open into SGS');
    assert.equal(hit([-5.1,.7,.7],[0,0,-1],1.8).length,0,'Unused-counter bay mouth must stay open');
    assert.ok(hit([-6.4,.7,5.2],[0,0,1],1.2).length,'Entrance-side wall must close the security bay gap');
  }
});

test('Cleared A-zone passage joins reception and stays open through exit and the unmerged G9 edge',async()=>{
  const {composeLayout}=await import('./layouts.mjs');
  const {buildReceptionObject,receptionSizes}=await import('./reception-objects.js');
  const root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{
    const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));
    return {block:{...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e}};
  };
  const source=(await load('ground/egate-office-passage')).block;
  const {block:combined}=await composeLayout(root,'ground/departure-sgs-passage',load);
  const {block:original}=await composeLayout(root,'ground/departure-sgs',load);
  validateBlock(source);validateBlock(combined);
  // Source furniture identities and manual poses survive the extension exactly.
  for(const object of original.objects)assert.deepEqual(combined.objects.find(o=>o.id===object.id),object);
  assert.deepEqual([...new Set(combined.objects.map(o=>o.sourceBlock))].sort(),['ground/departure-reception','ground/egate-office-passage','ground/g32']);
  assert.equal(source.objects.flatMap(o=>o.seats).length,0,'Removed A-zone seating must not return as new occupancy IDs');
  const reception=combined.architecture.circulations.find(c=>c.sourceBlock==='ground/departure-reception');
  const passage=combined.architecture.circulations.find(c=>c.sourceBlock==='ground/egate-office-passage');
  const seam=polygon=>polygon.filter(p=>p[0]===8).sort((a,b)=>a[1]-b[1]);
  assert.deepEqual(seam(reception.polygon),seam(passage.polygon),'Pale floor edges must meet exactly at the e-gate continuation');
  const mesh=(g,geometry,material,p)=>{const m=new THREE.Mesh(geometry,material);m.position.set(...p);g.add(m);return m;};
  const helpers={mesh,box:(g,size,p,m)=>mesh(g,new THREE.BoxGeometry(...size),m,p),mat:color=>new THREE.MeshStandardMaterial({color})};
  const gate=source.objects.find(o=>o.type==='automatic-glass-gate');
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(source.architecture,{cutaway});
    // Include the actual open exit leaves, not just the architectural gap.
    const door=new THREE.Group();buildReceptionObject(door,gate,helpers);
    door.scale.fromArray(gate.size.map((v,i)=>v/receptionSizes[gate.type][i]));door.position.fromArray(gate.position);shell.add(door);shell.updateMatrixWorld(true);
    const hit=(a,b)=>{
      const from=new THREE.Vector3(a[0],.7,a[1]),to=new THREE.Vector3(b[0],.7,b[1]),delta=to.sub(from);
      return new THREE.Raycaster(from,delta.clone().normalize(),0,delta.length()).intersectObject(shell,true);
    };
    const line=source.architecture.circulation.route.centerline;
    for(let i=1;i<line.length;i++)assert.equal(hit(line[i-1],line[i]).length,0,'Straight circulation must not cross a wall');
    for(const z of [.1,1.45,2.6])assert.equal(hit([22.5,z],[23.6,z]).length,0,'G9/G10 endpoint must remain open');
    for(const x of [13.2,14,14.8])assert.equal(hit([x,4],[x,9.5]).length,0,'Open exit leaves must clear the pale approach');
    assert.ok(hit([7,4],[7,9.5]).length,'Setback cafe edge must remain glass frontage');
    assert.equal(hit([.2,-2],[22.8,-2]).length,0,'Cleared former A-zone floor must not contain obsolete room walls');
  }
  for(const camera of ['A1','A3'])assert.ok(source.evidence.cameraPlacementReview.unregisteredCameras.some(c=>c.camera===camera&&c.mount===null&&c.heading===null));
  const egate=combined.objects.find(o=>o.variant==='swing-turnstile');
  assert.equal(source.architecture.circulation.clearWidth,egate.size[0]);
  assert.ok(source.architecture.circulation.route.centerline.every(p=>p[1]===egate.position[2]));
  const room=source.architecture.officeRoom;
  const exitLine=source.architecture.circulation.connections.find(c=>c.id==='egate-office-passage-exit-threshold').start[1];
  assert.ok(Math.abs(room.width-(exitLine-Math.min(...room.footprint.map(p=>p[1]))))<1e-8,'Office width must end at exit line');
  assert.equal(Math.max(...room.footprint.map(p=>p[1])),exitLine);
  const back=source.architecture.walls.find(w=>w.id==='egate-office-passage-office-back');
  assert.equal(back.start[1],exitLine);assert.equal(back.end[1],exitLine);
  for(const section of source.architecture.floorSections)assert.ok(section.center[1]+section.size[1]/2<=exitLine+1e-8,'Floor must not extend beyond exit gate');
});

test('Map L extension preserves the accepted I zone and matches map seating counts with an open G24/G25 connector',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e}};};
  const source=(await load('ground/i-map-extension')).block;validateBlock(source);
  assert.equal(source.objects.filter(o=>o.type==='armchair').length,6);
  assert.equal(source.objects.filter(o=>o.type==='sofa').length,4);
  assert.equal(source.objects.filter(o=>o.type==='table').length,5);
  assert.equal(source.objects.flatMap(o=>o.seats).length,14);
  assert.ok(source.objects.flatMap(o=>o.seats).every(s=>s.startsWith('Seat_IExt_TMP_')));
  const existing=(await composeLayout(root,'ground/i-zone',load)).block;
  const combined=(await composeLayout(root,'ground/i-zone-extension',load)).block;
  for(const o of existing.objects){
    const actual=combined.objects.find(v=>v.id===o.id),expected=structuredClone(o);expected.position[2]+=7.54;
    for(let i=0;i<3;i++)assert.ok(Math.abs(actual.position[i]-expected.position[i])<1e-8);
    assert.deepEqual({...actual,position:expected.position},expected);
  }
  for(const w of existing.architecture.walls){const expected=structuredClone(w);expected.start[1]+=7.54;expected.end[1]+=7.54;const actual=combined.architecture.walls.find(v=>v.id===w.id);for(const key of ['start','end'])for(let i=0;i<2;i++)assert.ok(Math.abs(actual[key][i]-expected[key][i])<1e-8);}
  for(const o of source.objects){const merged=combined.objects.find(v=>v.id===o.id);assert.deepEqual(merged.position,o.position);assert.equal(merged.yaw,o.yaw);assert.deepEqual(merged.size,o.size);}
  assert.ok(!combined.architecture.walls.some(w=>w.id==='i-extension-long-side'));
  const extensionFloor=combined.architecture.floorSections.at(-1);
  assert.ok(Math.abs(extensionFloor.center[1]-extensionFloor.size[1]/2-17.7)<1e-8);
  assert.ok(combined.architecture.floorInlays.some(i=>i.id==='i-extension-l-walk'));
  const join=source.architecture.sharedBoundaries.find(b=>b.id==='i-extension-g24-g25-future-join');
  assert.ok(Math.abs(join.end[0]-join.start[0]-(2.148387-.61659))<1e-8);
  const x=(join.start[0]+join.end[0])/2;
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(source.architecture,{cutaway});shell.updateMatrixWorld(true);
    assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,17.4),new THREE.Vector3(0,0,1),0,1).intersectObject(shell,true).length,0);
    assert.ok(new THREE.Raycaster(new THREE.Vector3(-7.7,.7,22),new THREE.Vector3(1,0,0),0,1).intersectObject(shell,true).length>0);
  }
});

test('G61/G62 reconcile normal ROI identities and share Table_I9 without duplicating it',async()=>{
  for(const key of ['g61','g62']){
    const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/ground/${key}/${f}.json`,import.meta.url)))));
    validateBlock({...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects});
    const observedSeats=new Set(),observedTables=new Set();
    for(const c of e.cameras){
      for(const [kind,target] of [['chairs',observedSeats],['tables',observedTables]]){
        const roi=JSON.parse(await readFile(new URL(`../${e.rois[c][kind]}`,import.meta.url)));
        for(const id of Object.keys(roi))target.add(id);
      }
      assert.ok(e.wideSnapshots[c]);
    }
    assert.deepEqual(new Set(o.objects.flatMap(o=>o.seats)),observedSeats);
    const tables=new Set(o.objects.filter(o=>o.type==='table').map(o=>o.externalId));
    if(key==='g62'){assert.ok(!tables.has('Table_I9'));tables.add(e.externalObservations[0].externalId);}
    assert.deepEqual(tables,observedTables);
    assert.equal(o.objects.filter(o=>o.type==='armchair').length,6);
    assert.equal(a.walls.filter(w=>w.kind==='glass').length,1);
  }
});

test('Full I zone preserves three bays and keeps window-row, floor seams and aisle clear',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const old=(await composeLayout(root,'ground/g57-g58',load)).block;
  const {block}=await composeLayout(root,'ground/i-zone',load);
  for(const o of old.objects)assert.deepEqual(block.objects.find(v=>v.id===o.id),o);
  assert.equal(block.objects.flatMap(o=>o.seats).length,24);
  assert.equal(block.objects.filter(o=>o.variant==='egg-swivel').length,10);
  assert.equal(block.objects.filter(o=>o.externalId==='Table_I9').length,1);
  assert.equal(block.objects.filter(o=>o.type==='table').length,14);
  assert.equal(block.objects.filter(o=>/^g(?:57|58|59)-sofa-screen-01$/.test(o.id)).length,3);
  const windows=block.architecture.walls.filter(w=>w.kind==='glass');
  assert.deepEqual(windows[0].end,windows[1].start);
  const sections=block.architecture.floorSections;
  const overlap=(a,b)=>Math.min(a.center[0]+a.size[0]/2,b.center[0]+b.size[0]/2)-Math.max(a.center[0]-a.size[0]/2,b.center[0]-b.size[0]/2)>1e-8&&Math.min(a.center[1]+a.size[1]/2,b.center[1]+b.size[1]/2)-Math.max(a.center[1]-a.size[1]/2,b.center[1]-b.size[1]/2)>1e-8;
  for(let i=0;i<sections.length;i++)for(let j=0;j<i;j++)assert.ok(!overlap(sections[i],sections[j]),'Source floor sections must not overlap');
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(block.architecture,{cutaway});shell.updateMatrixWorld(true);
    assert.equal(new THREE.Raycaster(new THREE.Vector3(1.9,.7,-4.5),new THREE.Vector3(0,0,1),0,14.5).intersectObject(shell,true).length,0,'Central aisle must remain open');
  }
  for(const o of block.objects.filter(o=>o.variant==='egg-swivel'))assert.ok(o.position[0]-o.size[2]/2>=2.6,'Window chair backs must leave the aisle clear');
});

test('G57 G58 G59 join behind each sofa with shared screens and continuous aisle',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const {block}=await composeLayout(root,'ground/g57-g58',load);
  assert.deepEqual(block.objects.flatMap(o=>o.seats).sort(),Array.from({length:12},(_,i)=>`Seat_I${i+1}`).sort());
  assert.equal(block.objects.filter(o=>o.id==='g57-sofa-screen-01').length,1);
  assert.equal(block.objects.filter(o=>o.type==='table').length,3);
  assert.equal(block.objects.filter(o=>o.id==='g58-sofa-screen-01').length,1);
  const nextScreen=block.objects.find(o=>o.id==='g58-sofa-screen-01');
  assert.ok(block.objects.find(o=>o.seats.includes('Seat_I5')).position[2]<nextScreen.position[2]);
  for(const seat of ['Seat_I9','Seat_I10'])assert.ok(block.objects.find(o=>o.seats.includes(seat)).position[2]>nextScreen.position[2]);
  const screen=block.objects.find(o=>o.id==='g57-sofa-screen-01');
  const sofa=block.objects.find(o=>o.seats.includes('Seat_I3'));
  for(const seat of ['Seat_I7','Seat_I8'])assert.ok(block.objects.find(o=>o.seats.includes(seat)).position[2]>screen.position[2]);
  assert.ok(sofa.position[2]<screen.position[2]);
  for(let i=1;i<block.architecture.floorSections.length;i++){const [a,b]=block.architecture.floorSections.slice(i-1,i+1);assert.ok(Math.abs(a.center[1]+a.size[1]/2-(b.center[1]-b.size[1]/2))<1e-8);}
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(block.architecture,{cutaway});shell.updateMatrixWorld(true);
    assert.equal(new THREE.Raycaster(new THREE.Vector3(1.9,.7,-2.3),new THREE.Vector3(0,0,1),0,12.4).intersectObject(shell,true).length,0);
  }
  for(const key of ['ground/g57','ground/g58','ground/g59']){
    const source=(await load(key)).block;
    for(const o of source.objects){const merged=block.objects.find(v=>v.id===o.id);assert.deepEqual(merged.size,o.size);assert.deepEqual(merged.seats,o.seats);assert.equal(merged.yaw,o.yaw);assert.ok(Math.abs(merged.position[2]-o.position[2]-(key.endsWith('g59')?8.06:key.endsWith('g58')?4.08:0))<1e-8);}
  }
});

test('Departure assembly joins the combined G9/G10 walk without duplicate shared walls or furniture',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const {block}=await composeLayout(root,'ground/b-g-lounges',load);
  const {block:departure}=await composeLayout(root,'ground/departure-sgs-passage',load);
  for(const o of departure.objects){
    const actual=block.objects.filter(a=>a.id===o.id);assert.equal(actual.length,1);
    assert.deepEqual(actual[0].size,o.size);assert.deepEqual(actual[0].seats,o.seats);assert.deepEqual(actual[0].scale,o.scale);
    [32.62-o.position[0],o.position[1],5.75-o.position[2]].forEach((v,i)=>assert.ok(Math.abs(actual[0].position[i]-v)<1e-8));
    assert.equal(actual[0].yaw,o.yaw+180);
  }
  assert.ok(!block.architecture.walls.some(w=>w.id==='egate-office-passage-b-dining-wall-reference'));
  assert.ok(!block.architecture.walls.some(w=>w.id==='egate-office-passage-office-g9-shared-reference'));
  assert.equal(block.architecture.walls.filter(w=>w.id==='g9-tv-wall').length,1);
  const room=(await load('ground/egate-office-passage')).block.architecture.officeRoom;
  const g9Wall=block.architecture.walls.find(w=>w.id==='g9-tv-wall');
  assert.equal(room.length,6.7);
  assert.ok(Math.abs(room.mergedWorldBounds.x[0]-g9Wall.start[0])<1e-8,'Short office must meet G9 with no gap');
  assert.equal(room.width,6.35);
  assert.ok(!block.architecture.walls.some(w=>w.id==='egate-office-passage-office-far-side'));
  const exit=block.objects.find(o=>o.id==='egate-office-passage-exit-sliding-doors');
  assert.ok(Math.abs(exit.position[0]-10.62)<1e-8&&Math.abs(exit.position[2]+3.35)<1e-8,'Exit stays attached to shifted departure assembly');
  assert.ok(Math.abs(room.mergedWorldBounds.x[1]-(exit.position[0]-exit.size[0]/2))<1e-8,'Office length must terminate at saved exit jamb');
  for(const id of ['g3-g24-g25-north-blue-left','g32-kiosk-backing','g32-approach-wall-return'])assert.equal(block.architecture.walls.filter(w=>w.id===id).length,1);
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(block.architecture,{cutaway});shell.updateMatrixWorld(true);
    for(const z of [3.2,4.3,5.4])assert.equal(new THREE.Raycaster(new THREE.Vector3(28,.7,z),new THREE.Vector3(-1,0,0),0,40).intersectObject(shell,true).filter(h=>h.object.isMesh).length,0,'Straight departure route must continue into G9/G10 front corridor');
    assert.ok(new THREE.Raycaster(new THREE.Vector3(2.5,.7,8),new THREE.Vector3(-1,0,0),0,2).intersectObject(shell,true).length,'Dining side must retain its shared backing');
  }
});

test('Main lounge joins I extension to the B13 end passage behind B44',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const main=(await composeLayout(root,'ground/b-g-lounges',load)).block;
  const source=(await composeLayout(root,'ground/i-zone-extension',load)).block;
  for(const o of source.objects){
    const merged=main.objects.find(v=>v.id===o.id);
    assert.ok(Math.abs(merged.position[0]-(4.32-o.position[2]))<1e-8);
    assert.ok(Math.abs(merged.position[2]-(22.7+o.position[0]))<1e-8);
    assert.equal(merged.yaw,o.yaw-90);assert.deepEqual(merged.size,o.size);assert.deepEqual(merged.seats,o.seats);
  }
  assert.equal(new Set(main.objects.flatMap(o=>o.seats)).size,main.objects.flatMap(o=>o.seats).length);
  assert.ok(!main.architecture.walls.some(w=>w.id==='i-extension-return-inner'||w.id==='i-extension-return-inner-after-opening'));
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(main.architecture,{cutaway});shell.updateMatrixWorld(true);
    for(const z of [18.95,19.95,20.95])assert.equal(new THREE.Raycaster(new THREE.Vector3(-13.8,.7,z),new THREE.Vector3(1,0,0),0,.85).intersectObject(shell,true).length,0,'B13 connection must remain clear across both shells');
  }
});


test('Dining north side is closed while I-zone end passage stays open',async()=>{
  const a=JSON.parse(await readFile(new URL('../blocks/ground/g3-g24-g25/architecture.json',import.meta.url)));
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);
    for(const x of [1.3,9.3])assert.ok(new THREE.Raycaster(new THREE.Vector3(x,.7,-8),new THREE.Vector3(0,0,1),0,1.2).intersectObject(shell,true).length,'North openings must be closed');
    assert.equal(new THREE.Raycaster(new THREE.Vector3(9.3,.7,8),new THREE.Vector3(0,0,-1),0,1.2).intersectObject(shell,true).length,0,'I-zone opening must stay clear');
  }
});


test('G15/G13 rotates anticlockwise with cabins below I extension',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
  const main=(await composeLayout(root,'ground/b-g-lounges',load)).block;
  const source=(await composeLayout(root,'ground/g15-g13',load)).block;
  for(const o of source.objects){
    const merged=main.objects.find(v=>v.id===o.id);assert.ok(merged);
    assert.ok(Math.abs(merged.position[0]-(-24.18-o.position[0]))<1e-8);
    assert.ok(Math.abs(merged.position[2]-(10.1-o.position[2]))<1e-8);
    assert.equal(merged.yaw,o.yaw+180);assert.deepEqual(merged.size,o.size);assert.deepEqual(merged.seats,o.seats);
  }
  assert.ok(!main.architecture.walls.some(w=>w.id==='g15-office-rear'),'Duplicate white office wall must not cover dining blue cladding');
  const shared=main.architecture.walls.find(w=>w.id==='g3-g24-g25-south-blue-left');assert.equal(shared.variant,'opaque-blue-panel');assert.equal(shared.color,'#245968');
  const rooms=main.architecture.rooms.filter(r=>r.sourceBlock==='ground/g15');assert.equal(rooms.length,2);
  assert.ok(Math.abs(Math.min(...rooms.flatMap(r=>r.footprint.map(p=>p[1])))-5.6)<1e-8);
  const ext=main.architecture.floorSections.find(f=>f.sourceBlock==='ground/i-map-extension');
  assert.ok(Math.abs(Math.max(...rooms.flatMap(r=>r.footprint.map(p=>p[1])))-15.1)<1e-8);
  assert.ok(Math.abs(Math.max(...rooms.flatMap(r=>r.footprint.map(p=>p[0])))+13.38)<1e-8);
  const frontage=main.architecture.floorSections.filter(f=>f.sourceBlock==='ground/g15');
  const xs=frontage.flatMap(f=>[f.center[0]-f.size[0]/2,f.center[0]+f.size[0]/2]);
  assert.ok(Math.abs(Math.min(...xs)+29.38)<1e-8&&Math.abs(Math.max(...xs)+13.38)<1e-8,'Full G15 frontage must equal G11 plus Zone C pods');
  const oldSections=main.architecture.floorSections.filter(f=>!['ground/g15','ground/g13'].includes(f.sourceBlock)&&f.id!=='g15-g13-connection-floor');
  const bounds=f=>{const a=f.yaw*Math.PI/180,w=Math.abs(Math.cos(a))*f.size[0]+Math.abs(Math.sin(a))*f.size[1],d=Math.abs(Math.sin(a))*f.size[0]+Math.abs(Math.cos(a))*f.size[1];return [f.center[0]-w/2,f.center[0]+w/2,f.center[1]-d/2,f.center[1]+d/2];};
  for(const f of main.architecture.floorSections.filter(f=>['ground/g15','ground/g13'].includes(f.sourceBlock)||f.id==='g15-g13-connection-floor'))for(const other of oldSections){const a=bounds(f),b=bounds(other);assert.ok(Math.min(a[1],b[1])-Math.max(a[0],b[0])<1e-8||Math.min(a[3],b[3])-Math.max(a[2],b[2])<1e-8,'New checkpoint floors must not overlap existing lounge floors');}
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(main.architecture,{cutaway});shell.updateMatrixWorld(true);
    const hits=(x,y)=>new THREE.Raycaster(new THREE.Vector3(x,y,5.3),new THREE.Vector3(0,0,1),0,.6).intersectObject(shell,true).length;
    for(const x of [-26,-24,-22])assert.equal(hits(x,.7),0,'Central lobby arch stays open');
    for(const x of [-28.6,-19.8])assert.ok(hits(x,.7),'Short glass returns close only the sides');
    if(!cutaway)assert.ok(hits(-24.18,3.9),'Arch crown remains above the open passage');
  }
});


test('G13 source owns C10 end floor wall and frosted gate in both previews',async()=>{
  const {composeLayout}=await import('./layouts.mjs'),root=fileURLToPath(new URL('../',import.meta.url));
  const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e}};};
  const source=(await load('ground/g13')).block;validateBlock(source);assert.deepEqual(source.floorSize,[11.7,9.05]);
  assert.ok(source.evidence.cameras.includes('C10'));assert.ok(source.evidence.wideSnapshots.C10);
  const gate=source.architecture.walls.find(w=>w.id==='g13-c10-frosted-entry');assert.equal(gate.variant,'frosted-diagonal');assert.ok(Math.abs(gate.end[1]-gate.start[1]-3.85)<1e-8);
  for(const key of ['ground/g15-g13','ground/b-g-lounges']){
    const {block}=await composeLayout(root,key,load);
    assert.equal(block.architecture.walls.filter(w=>w.id===gate.id).length,1);
    assert.ok(!block.architecture.walls.some(w=>w.id==='g13-i-extension-end-glass'));
    assert.ok(!block.architecture.floorSections.some(f=>f.id==='g13-i-extension-gap-floor'));
    const wall=block.architecture.walls.find(w=>w.id==='g13-end-return'),glass=block.architecture.walls.find(w=>w.id===gate.id);
    assert.deepEqual(wall.end,glass.start);assert.ok(block.evidence.cameras.includes('C10'));
  }
});
