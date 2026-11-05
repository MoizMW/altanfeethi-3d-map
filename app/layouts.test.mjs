import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import {composeLayout} from './layouts.mjs';
import {buildArchitecture} from './architecture.js';
import {buildPassportObject,passportSizes} from './passport-objects.js';
import {server} from './server.mjs';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};
const sourceFiles=['ground/g15','ground/g13'].flatMap(key=>['manifest','architecture','objects','evidence'].map(f=>new URL(`../blocks/${key}/${f}.json`,import.meta.url)));
const sourceBytes=()=>Promise.all(sourceFiles.map(file=>readFile(file,'utf8')));

test('G19 construction shell joins G17 and its empty room without furniture or duplicate partitions',async()=>{
  const source=(await load('ground/g19')).block;
  assert.deepEqual(source.objects,[]);
  assert.deepEqual(new Set(source.evidence.cameras),new Set(['F2','F1','E5','E8']));
  assert.deepEqual(source.evidence.wideSnapshots,{});
  for(const key of ['ground/g17-g19','ground/b-g-lounges']){
    const {block}=await composeLayout(root,key,load),a=block.architecture;
    assert.equal(block.objects.filter(o=>o.sourceBlock==='ground/g19').length,0);
    assert.equal(a.structures.filter(s=>s.id==='g19-visible-escalator-rise').length,1);
    assert.ok(!a.walls.some(w=>['g19-g17-side-context','g19-front-room-side-context'].includes(w.id)));
    for(const id of ['g17-sign-wall','g17-front-left-wall','g19-connecting-glass-gate'])assert.equal(a.walls.filter(w=>w.id===id).length,1);
    const floor=a.floorSections.find(f=>f.sourceBlock==='ground/g19');
    assert.ok(Math.abs(floor.center[0]+floor.size[0]/2-(-53.78))<1e-8);
    const gate=a.walls.find(w=>w.id==='g19-connecting-glass-gate');
    assert.ok(Math.abs(gate.start[1]-3)<1e-8&&Math.abs(gate.end[1]-5.6)<1e-8);
    assert.ok(Math.abs(gate.start[0]-(-53.78))<1e-8);
    const path=a.circulations.find(c=>c.id==='g19-pale-crossing-path');
    assert.ok(Math.abs(path.polygon[1][0]-gate.start[0])<1e-8);
    // Solid shared walls end at the glazed passage; no hidden face covers its leaves.
    const solid=buildArchitecture({walls:a.walls.filter(w=>w.kind==='solid')});solid.updateMatrixWorld(true);
    assert.equal(new THREE.Raycaster(new THREE.Vector3(-54.2,1.2,4.3),new THREE.Vector3(1,0,0),0,.8).intersectObject(solid,true).length,0);
  }
});

test('G19 reversed stair/escalator pair matches the first-floor pattern and clears the core return',async()=>{
  const a=(await load('ground/g19')).block.architecture;
  const profile=a.structures[0],first=JSON.parse(await readFile(new URL('../layouts/first/bottom-lobby.json',import.meta.url))).structures[0];
  assert.equal(profile.kind,'stair-escalator-rise');assert.equal(profile.yaw,0,'Original 180-degree yaw is reversed');
  assert.ok(Math.abs(profile.run/profile.steps-(first.endX-first.startX)/first.steps)<1e-8,'Both floors share the tread pitch');
  assert.ok(Math.abs(profile.rise/profile.steps-first.drop/first.steps)<1e-8,'Both floors share the riser height');
  assert.ok(Math.abs(profile.stairWidth/profile.escalatorWidth-first.stairWidth/first.escalatorWidth)<1e-8,'Keep the first-floor lane proportions');
  const shell=buildArchitecture(a);shell.updateMatrixWorld(true);
  const escalator=shell.children.find(c=>c.userData.structureId==='g19-visible-escalator-rise');assert.ok(escalator);
  const bounds=new THREE.Box3().setFromObject(escalator);
  assert.ok(bounds.min.y>=-.101&&bounds.max.y>profile.rise+.9,'Lower section rises instead of descending under the slab');
  assert.ok(bounds.min.x>=-5.85&&bounds.max.x<5.85&&bounds.min.z>=2.2-1e-8&&bounds.max.z<6.4,'Both lanes stay inside the dark approach');
  assert.equal(escalator.children.filter(m=>m.name==='Shared lower stair and escalator landing').length,1);
  const floorAt=(x,z)=>new THREE.Raycaster(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0),0,3).intersectObject(escalator,true)[0]?.point.y;
  for(const z of [profile.position[2],profile.position[2]+profile.stairZ]){
    const lower=floorAt(profile.position[0]+profile.run*.1,z),upper=floorAt(profile.position[0]+profile.run*.9,z);
    assert.ok(Number.isFinite(lower)&&Number.isFinite(upper)&&upper>lower,'Stairs and escalator both rise in the reversed direction');
  }
  const walls=buildArchitecture({walls:a.walls.filter(w=>w.kind==='solid')});walls.updateMatrixWorld(true);
  assert.equal(new THREE.Raycaster(new THREE.Vector3(-4.2,.65,2.2),new THREE.Vector3(0,0,1),0,2.6).intersectObject(shell,true).length,0,'Pale path to the shared landing approach remains open');
  const core=walls.children.find(c=>c.userData.boundaryId==='g19-core-return');
  assert.equal(new THREE.Box3().setFromObject(core).intersectsBox(bounds),false,'Core return must not cut through the rail or landing');
  escalator.traverse(m=>{if(m.isMesh)for(const value of m.geometry.attributes.position.array)assert.ok(Number.isFinite(value));});
});

test('Source architectural escalators retain their rigid pose when a layout rotates and elevates a block',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'g19-structure-'));
  try{
    await mkdir(join(directory,'layouts','ground'),{recursive:true});
    await writeFile(join(directory,'layouts','ground','rotated.json'),JSON.stringify({format:'altanfeethi-floor-layout',version:1,id:'rotated-g19-test',floor:'ground',name:'Rotated shell',floorSize:[50,50],floorCenter:[0,0],components:[{block:'ground/g19',position:[12,2,-7],yaw:90}],walls:[]}));
    const source=(await load('ground/g19')).block.architecture.structures[0];
    const before=structuredClone(source),{block}=await composeLayout(directory,'ground/rotated',load);
    const mesh=buildArchitecture({structures:[source]}),actual=buildArchitecture({structures:block.architecture.structures});
    mesh.rotation.y=Math.PI/2;mesh.position.set(12,2,-7);mesh.updateMatrixWorld(true);actual.updateMatrixWorld(true);
    const expectedBounds=new THREE.Box3().setFromObject(mesh),actualBounds=new THREE.Box3().setFromObject(actual);
    assert.ok(expectedBounds.min.distanceTo(actualBounds.min)<1e-8&&expectedBounds.max.distanceTo(actualBounds.max)<1e-8);
    assert.deepEqual(source,before);
  }finally{await rm(directory,{recursive:true,force:true});}
});

test('Digital immigration gate opens while adjoining fixed glass closes the bypass',async()=>{
  const source=(await load('ground/g13')).block;
  const gate=source.objects.find(o=>o.id==='g13-digital-entry-gate');
  const fixed=source.architecture.walls.filter(w=>w.id.startsWith('g13-digital-entry-'));
  const shell=buildArchitecture({walls:fixed});
  const box=(parent,size,position,material)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.fromArray(position);parent.add(m);return m;};
  const helpers={box,mesh:(parent,geometry,material,position)=>{const m=new THREE.Mesh(geometry,material);m.position.fromArray(position);parent.add(m);return m;},mat:color=>new THREE.MeshStandardMaterial({color})};
  const hit=(scene,z)=>new THREE.Raycaster(new THREE.Vector3(6.9,.6,z),new THREE.Vector3(-1,0,0),0,.8).intersectObject(scene,true).length>0;
  const start=gate.position[2]-gate.size[0]/2,end=gate.position[2]+gate.size[0]/2;
  assert.deepEqual(fixed[0].start,[6.5,.625]);assert.ok(Math.abs(fixed[0].end[1]-start)<1e-8);
  assert.ok(Math.abs(fixed[1].start[1]-end)<1e-8);assert.deepEqual(fixed[1].end,[6.5,5.15]);
  for(const openFraction of [0,1]){
    const scene=new THREE.Group(),moving=new THREE.Group();scene.add(shell.clone(true),moving);
    buildPassportObject(moving,{...gate,openFraction},helpers);
    moving.scale.fromArray(gate.size.map((v,i)=>v/passportSizes[gate.type][i]));moving.rotation.y=gate.yaw*Math.PI/180;moving.position.fromArray(gate.position);scene.updateMatrixWorld(true);
    assert.equal(hit(scene,gate.position[2]),openFraction===0,'Only the scanner entry clears when its leaf opens');
    for(const z of [1,2.4,4.8,5.05])assert.ok(hit(scene,z),'Fixed panels stay closed beside the opening');
  }
});

test('G15/G13 preserves every saved object and wall under rigid component placement',async()=>{
  const before=await sourceBytes();
  const layout=JSON.parse(await readFile(new URL('../layouts/ground/g15-g13.json',import.meta.url)));
  const {block}=await composeLayout(root,'ground/g15-g13',load);
  assert.equal(block.readOnly,true);assert.equal(block.objects.length,31);
  assert.equal(new Set(block.objects.map(o=>o.id)).size,31);
  assert.equal(block.objects.flatMap(o=>o.seats).length,6);
  const staff=block.objects.filter(o=>o.sourceBlock==='ground/g13'&&o.type==='office-chair'),gates=block.objects.filter(o=>o.type==='passport-gate'&&o.id!=='g13-digital-entry-gate');
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
  assert.equal(block.architecture.walls.filter(w=>w.owner==='ground/g15').flatMap(w=>w.doors||[]).length,2);
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
    const {block}=await response.json();assert.equal(block.objects.length,31);assert.equal(block.architecture.floorSections.length,5);assert.equal(block.readOnly,true);
    assert.deepEqual(new Set(block.evidence.cameras),new Set(['C8','C15','C16','C13','C17','C18','C21','C10']));
    for(const id of block.evidence.cameras)for(const wide of [false,true]){const photo=await fetch(`${origin}/api/evidence/camera/${id}${query}${wide?'&wide=1':''}`);assert.equal(photo.status,200);assert.equal(photo.headers.get('content-type'),'image/jpeg');await photo.arrayBuffer();}
    assert.equal((await fetch(`${origin}/api/block${query}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({block})})).status,405);
    assert.deepEqual(await sourceBytes(),before);
  }finally{await new Promise(resolve=>server.close(resolve));}
});

test('G63 faces the C-lounge corridor and joins the immigration/checkpoint partition once',async()=>{
  const {block}=await composeLayout(root,'ground/b-g-lounges',load);
  const source=(await load('ground/g63')).block;
  const merged=block.objects.filter(o=>o.sourceBlock==='ground/g63');
  assert.equal(merged.length,source.objects.length);
  assert.deepEqual(merged.flatMap(o=>o.seats),source.objects.flatMap(o=>o.seats));
  const arch=block.architecture.walls.find(w=>w.id==='g63-entrance-arch');
  for(const p of [arch.start,arch.end])assert.ok(Math.abs(p[1]-5.6)<1e-8);
  assert.ok(Math.abs(Math.max(arch.start[0],arch.end[0])+29.18)<1e-8);
  assert.ok(!block.architecture.walls.some(w=>['g63-left-wall','g63-left-cladding'].includes(w.id)));
  assert.equal(block.architecture.walls.filter(w=>w.id==='g15-solid-side').length,1);
  for(const section of block.architecture.floorSections.filter(f=>f.sourceBlock==='ground/g63')){
    assert.ok(section.center[0]+section.size[0]/2<=-29.38+1e-8,'G15 owns the adjoining floor margin');
  }
  const shell=buildArchitecture({walls:[arch],openings:block.architecture.openings.filter(o=>o.wallId===arch.id)});
  shell.updateMatrixWorld(true);
  assert.equal(new THREE.Raycaster(new THREE.Vector3(-32.88,.7,4.3),new THREE.Vector3(0,0,1),0,2).intersectObject(shell,true).length,0);
});

test('G9 G10 and G11 each have one clear centered access arch in source and main views',async()=>{
  const main=(await composeLayout(root,'ground/b-g-lounges',load)).block;
  for(const key of ['g9','g10','g11']){
    const source=(await load(`ground/${key}`)).block;
    assert.equal(source.architecture.openings.length,1);
    for(const a of [source.architecture,main.architecture]){
      const openings=a.openings.filter(o=>o.id.startsWith(key+'-'));
      assert.equal(openings.length,1);
      const opening=openings[0],wall=a.walls.find(w=>w.id===opening.wallId);
      const dx=wall.end[0]-wall.start[0],dz=wall.end[1]-wall.start[1],length=Math.hypot(dx,dz);
      assert.ok(Math.abs(opening.offset-length/2)<1e-8);
      const normal=new THREE.Vector3(-dz/length,0,dx/length);
      const origin=new THREE.Vector3((wall.start[0]+wall.end[0])/2,.7,(wall.start[1]+wall.end[1])/2).add(normal);
      const shell=buildArchitecture({walls:[wall],openings});shell.updateMatrixWorld(true);
      assert.equal(new THREE.Raycaster(origin,normal.clone().negate(),0,2).intersectObject(shell,true).length,0,'No central pier should obstruct the single entrance');
    }
  }
});

test('Two compact I lounges fill the remaining half frontage after G63 with eight distinct seats',async()=>{
  const layout=JSON.parse(await readFile(new URL('../layouts/ground/b-g-lounges.json',import.meta.url)));
  const main=(await composeLayout(root,'ground/b-g-lounges',load)).block;
  const parts=['ground/g60','ground/i33-lounge'].map(key=>layout.components.find(p=>p.block===key));
  const sources=await Promise.all(parts.map(async p=>(await load(p.block)).block));
  const reference=(await load('ground/g12-g14')).block;
  assert.equal(sources.reduce((n,b)=>n+b.floorSize[1],0),reference.floorSize[1]/2);
  for(let i=0;i<2;i++){
    const source=sources[i],part=parts[i],objects=main.objects.filter(o=>o.sourceBlock===part.block);
    assert.equal(source.objects.filter(o=>o.type==='armchair').length,2);
    assert.equal(source.objects.filter(o=>o.type==='sofa').length,1);
    assert.equal(objects.flatMap(o=>o.seats).length,4);
    assert.deepEqual(objects.flatMap(o=>o.seats),source.objects.flatMap(o=>o.seats));
    assert.equal(objects.length,source.objects.length);
    assert.ok(Math.abs(part.position[2]-source.floorSize[0]/2-5.6)<1e-8);
    assert.ok(!main.architecture.walls.some(w=>w.id===source.slug+'-side-positive-z'));
  }
  assert.ok(Math.abs(parts[0].position[0]-parts[1].position[0]-3.7)<1e-8);
  const g60=sources[0],observed=new Set();
  for(const camera of g60.evidence.cameras){const r=JSON.parse(await readFile(new URL('../'+g60.evidence.rois[camera].chairs,import.meta.url)));Object.keys(r).forEach(id=>observed.add(id));}
  assert.deepEqual([...observed].sort(),g60.objects.flatMap(o=>o.seats).sort());
  assert.ok(sources[1].objects.flatMap(o=>o.seats).every(s=>s.startsWith('Seat_I33_TMP_')));
});

test('Small I lounges use supported sliding frosted entries and a cream shared wall with a grey window',async()=>{
  for(const key of ['g60','i33-lounge']){
    const source=(await load('ground/'+key)).block,a=source.architecture;
    const entry=a.walls.find(w=>w.id===key+'-entry-glass');
    assert.equal(entry.variant,'frosted-cream');assert.equal(entry.kind,'glass');
    assert.equal(entry.doors.length,1);assert.equal(entry.doors[0].width+2*entry.pillarWidth,source.floorSize[1]);assert.equal(entry.automaticSliding,true);
    assert.ok(!a.walls.some(w=>/entry-(left-return|right-return|header)$/.test(w.id)));
    const black=a.walls.find(w=>w.variant==='cream-grey-window');assert.ok(black);assert.equal(black.kind,'solid');assert.ok(black.window.width<source.floorSize[0]);
    const sofa=source.objects.find(o=>o.type==='sofa');
    assert.ok(black.start[1]*sofa.position[2]<0,'Grey window must be opposite the saved sofa');
    const shell=buildArchitecture(a);
    for(const wall of [entry,black]){
      const group=shell.children.find(g=>g.userData.boundaryId===wall.id);
      const surfaces=[];group.traverse(n=>{if(n.isMesh)surfaces.push(n.material);});
      assert.ok(surfaces.length);assert.ok(surfaces.every(m=>!m.transparent&&m.opacity===1));
      if(wall===entry){
        assert.ok(surfaces.some(m=>m.roughness===.85),'Cream glass must have a frosted finish');
        assert.equal(group.children.filter(n=>n.name==='Door support pillar').length,2);
        assert.ok(group.getObjectByName('Fixed frosted panel'));assert.ok(group.getObjectByName('Sliding frosted panel'));
        assert.ok(group.getObjectByName('Automatic door button'));assert.ok(group.getObjectByName('Subtle blue button ring'));
        assert.ok(!group.getObjectByName('Door pull handle'));
      }else{
        const pane=group.getObjectByName('Opaque grey window');assert.ok(pane);assert.equal(pane.geometry.parameters.width,1.9);
        assert.equal(pane.material.color.getHexString(),'73797b');
      }
    }
  }
  const main=(await composeLayout(root,'ground/b-g-lounges',load)).block;
  assert.equal(main.architecture.walls.filter(w=>w.variant==='cream-grey-window').length,1);
  assert.equal(main.architecture.walls.filter(w=>w.variant==='frosted-cream').length,2);
});

test('I-zone patterned backing owns the dining seam without a plain overlapping wall or end gap',async()=>{
  const main=(await composeLayout(root,'ground/b-g-lounges',load)).block;
  assert.ok(!main.architecture.walls.some(w=>w.id==='g3-g24-g25-screen-wall'));
  const source=(await load('ground/g3-g24-g25')).block;
  assert.ok(source.architecture.walls.some(w=>w.id==='g3-g24-g25-screen-wall'),'Standalone dining shell remains enclosed');
  const ids=['g59-paneled-wall','g58-paneled-wall','g57-paneled-wall','g61-corner-side-wall'];
  const walls=ids.map(id=>main.architecture.walls.find(w=>w.id===id));
  const spans=walls.map(w=>{
    assert.equal(w.finish,'i-zone-stone-panels');
    assert.ok(Math.abs(w.start[1]-21.2)<1e-8&&Math.abs(w.end[1]-21.2)<1e-8);
    return [Math.min(w.start[0],w.end[0]),Math.max(w.start[0],w.end[0])];
  }).sort((a,b)=>a[0]-b[0]);
  assert.ok(Math.abs(spans[0][0]+13.38)<1e-8);
  for(let i=1;i<spans.length;i++)assert.ok(Math.abs(spans[i][0]-spans[i-1][1])<1e-8,'Patterned wall segments must meet without overlaps or gaps');
  assert.ok(spans.at(-1)[1]>=1.42);
});
