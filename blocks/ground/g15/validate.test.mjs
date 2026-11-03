import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {validateBlock} from '../../../shared/schema/block-schema.js';
import {buildArchitecture} from '../../../app/architecture.js';
import {securitySizes, buildSecurityObject} from '../../../app/security-objects.js';

const THREE=createRequire(new URL('../../../app/package.json',import.meta.url))('three');
const project=new URL('../../../',import.meta.url);
const read=async name=>JSON.parse(await readFile(new URL(name,import.meta.url)));
const [manifest,architecture,data,evidence]=await Promise.all(['manifest','architecture','objects','evidence'].map(n=>read(`./${n}.json`)));
const block={...manifest,architecture,evidence,placement:architecture.placement,floorSize:architecture.floorSize,
  ceilingHeight:architecture.ceilingHeight,objects:data.objects};
const mat=(color,roughness=.65,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const mesh=(group,geometry,material,position)=>{const m=new THREE.Mesh(geometry,material);m.position.fromArray(position);group.add(m);return m;};
const box=(group,size,position,material)=>mesh(group,new THREE.BoxGeometry(...size),material,position);
const build=object=>{
  const group=new THREE.Group();buildSecurityObject(group,object,{box,mesh,mat});
  group.position.fromArray(object.position);group.rotation.y=THREE.MathUtils.degToRad(object.yaw);
  group.scale.fromArray(object.size.map((v,i)=>v/securitySizes[object.type][i]*(object.scale?.[i]??1)));
  return group;
};

test('G15 follows current checkpoint assignments and keeps legacy seating ROIs separate',async()=>{
  validateBlock(block);
  const registration=JSON.parse(await readFile(new URL('evidence/registration/camera-placements.json',project)));
  assert.deepEqual(evidence.cameras.slice().sort(),registration.cameras.filter(c=>c.group_id==='g15').map(c=>c.id).sort());
  assert.deepEqual(data.objects.filter(o=>o.seats.length).flatMap(o=>o.seats).sort(),['Seat_G15_TMP_01','Seat_G15_TMP_02']);
  assert.equal(data.objects.filter(o=>o.type==='security-scanner').length,2);
  assert.equal(data.objects.filter(o=>o.type==='security-detector').length,2);
  assert.equal(data.objects.filter(o=>o.type==='security-console').length,2);
  assert.ok(!data.objects.some(o=>o.externalId));
  for(const o of data.objects)assert.ok(o.cameras.every(c=>evidence.cameras.includes(c)));
  for(const c of evidence.cameras){await access(new URL(evidence.snapshots[c],project));await access(new URL(evidence.wideSnapshots[c],project));}
  for(const record of Object.values(evidence.rois)){
    const roi=JSON.parse(await readFile(new URL(record.reception,project)));
    assert.deepEqual(Object.keys(roi),['R1']);
    assert.ok(roi.R1.points.every(([x,y])=>x>=0&&x<=1920&&y>=0&&y<=1080));
  }
  assert.equal(evidence.excludedRoiAssociations.paths.length,3);
});

test('security geometry stays within its size contract and both detector lanes remain clear',()=>{
  const scene=buildArchitecture(architecture);
  for(const object of data.objects.filter(o=>securitySizes[o.type])){
    const group=build(object);group.updateMatrixWorld(true);
    group.traverse(o=>{if(o.geometry){assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));}});
    const bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3());
    const envelope=object.size.slice();
    if(object.type==='security-kiosk'){envelope[0]*=object.screenScale??1;envelope[1]*=Math.max(1,object.screenScale??1);}
    const expected=object.yaw===90?[envelope[2],envelope[1],envelope[0]]:envelope;
    size.toArray().forEach((value,i)=>assert.ok(value<=expected[i]+.015,`${object.id}: dimension ${i} exceeds its contract`));
    assert.ok(bounds.min.y>=-.005);
    scene.add(group);
  }
  scene.updateMatrixWorld(true);
  for(const x of [-1.45,1.45]){
    assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,-4.5),new THREE.Vector3(0,0,1)).intersectObject(scene,true).length,0);
  }
});

test('operator screens bend inward with all mounting hardware behind the display faces',()=>{
  for(const source of data.objects.filter(o=>o.type==='security-console')){
    const group=build({...source,position:[0,0,0],yaw:0});
    group.updateMatrixWorld(true);
    for(const x of [-.275,.275]){
      const hits=new THREE.Raycaster(new THREE.Vector3(x,1.4,1),new THREE.Vector3(0,0,-1)).intersectObject(group,true);
      assert.equal(hits[0]?.object.name,'Screen face','Mounting hardware must not cover the screen front');
    }
    for(const name of ['Rear monitor post','Rear monitor crossbar','Rear screen bracket']){
      const parts=[];group.traverse(o=>{if(o.name===name)parts.push(o);});
      assert.ok(parts.length);
      for(const part of parts)assert.ok(new THREE.Box3().setFromObject(part).max.z<0);
    }
  }
});

test('Passport and Customs boxes share one white partition and face the checkpoint through glass',()=>{
  assert.equal(architecture.rooms.length,2);
  const shell=buildArchitecture(architecture);shell.updateMatrixWorld(true);
  const boundaryAt=(origin,direction)=>{
    const hit=new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction)).intersectObject(shell,true)[0];
    assert.ok(hit);
    let owner=hit.object;while(owner&&!owner.userData.boundaryId)owner=owner.parent;
    return architecture.walls.find(w=>w.id===owner?.userData.boundaryId);
  };
  for(const z of [-2.475,2.175]){
    assert.equal(boundaryAt([-6.9,1,z],[1,0,0]).kind,'glass');
    for(const direction of [[-1,0,0],[0,0,-1],[0,0,1]]){
      const wall=boundaryAt([-6.9,1,z],direction);
      assert.equal(wall.kind,'solid');assert.equal(wall.color,'#f0efeb');
    }
  }
  assert.equal(architecture.walls.filter(w=>w.id==='g15-office-partition').length,1);
  const frontages=architecture.walls.filter(w=>w.kind==='glass');
  assert.equal(frontages.length,2,'Each office owns one non-overlapping glass frontage');
  const ordered=frontages.slice().sort((a,b)=>a.start[1]-b.start[1]);
  assert.equal(ordered[0].end[1],ordered[1].start[1]);
});

test('office doors have distinct leaves and two-sided handles, with no fixed pane across the doorway',()=>{
  const shell=buildArchitecture(architecture);shell.updateMatrixWorld(true);
  const customs=architecture.rooms.find(r=>r.id==='g15-customs-office');
  const checkpoint=architecture.walls.find(w=>w.id==='g15-solid-side');
  const offices=architecture.rooms.flatMap(r=>r.footprint);
  const officeStart=Math.min(...offices.map(p=>p[1]));
  const officeEnd=Math.max(...offices.map(p=>p[1]));
  const officeLength=officeEnd-officeStart;
  assert.ok(Math.abs((checkpoint.end[1]-checkpoint.start[1])/officeLength-.8)<1e-9,
    'Checkpoint must be 80% of the combined office-row length');
  assert.ok(officeStart<checkpoint.start[1],'The office row must extend toward the top (-Z)');
  assert.equal(officeEnd,checkpoint.end[1],'Bottom (+Z) ends must align');
  assert.equal(architecture.walls.find(w=>w.id==='g15-glass-side').start[1],officeStart);
  assert.equal(architecture.walls.find(w=>w.id==='g15-office-rear').start[1],officeStart);
  for(const id of ['g15-office-rear','g15-customs-glass-front']){
    assert.equal(architecture.walls.find(w=>w.id===id).end[1],officeEnd);
  }
  assert.equal(architecture.walls.find(w=>w.id==='g15-office-customs-end').start[1],officeEnd);
  const floor=architecture.floorSections.find(s=>s.id==='g15-customs-office-floor');
  assert.equal(floor.center[1]+floor.size[1]/2,officeEnd);
  const checkpointFloor=architecture.floorSections.find(s=>s.id==='g15-checkpoint-floor');
  const officeFloors=architecture.floorSections.filter(s=>s.id.includes('-office-floor'));
  assert.ok(Math.abs(checkpointFloor.size[1]/officeFloors.reduce((sum,s)=>sum+s.size[1],0)-.8)<1e-9);
  assert.ok(Math.abs(checkpointFloor.center[1]-checkpointFloor.size[1]/2-checkpoint.start[1])<1e-9);
  assert.equal(Math.max(...customs.footprint.map(p=>p[0]))-Math.min(...customs.footprint.map(p=>p[0])),6);
  for(const wall of architecture.walls.filter(w=>w.doors?.length)){
    const boundary=shell.children.find(g=>g.userData.boundaryId===wall.id);
    const leaf=boundary.children.find(g=>g.userData.doorId===wall.doors[0].id);
    assert.ok(leaf);
    assert.equal(leaf.children.filter(o=>o.name==='Door pull handle').length,2);
    assert.ok(leaf.children.find(o=>o.material.transparent).material.opacity>=.75);
    const z=wall.start[1]+wall.doors[0].offset;
    const hits=new THREE.Raycaster(new THREE.Vector3(-4,1,z),new THREE.Vector3(-1,0,0)).intersectObject(boundary,true);
    assert.ok(hits.length);assert.ok(hits.every(hit=>hit.object.parent===leaf),'Only the door leaf may occupy its opening');
  }
  const invalid=structuredClone(block);
  const front=invalid.architecture.walls.find(w=>w.doors?.length);
  front.doors.push({...front.doors[0],id:'overlapping-door'});
  assert.throws(()=>validateBlock(invalid),/glass door/);
});

test('office floors reach the glass at the extended end and meet the checkpoint without a gap',()=>{
  const checkpointFloor=architecture.floorSections.find(s=>s.id==='g15-checkpoint-floor');
  const glassX=architecture.walls.find(w=>w.id==='g15-glass-side').start[0];
  assert.ok(Math.abs(checkpointFloor.center[0]-checkpointFloor.size[0]/2-glassX)<1e-9);
  for(const floor of architecture.floorSections.filter(s=>s.id.includes('-office-floor'))){
    assert.equal(floor.center[0]+floor.size[0]/2,glassX,'Floor must reach the glass even beyond the checkpoint footprint');
  }
});

test('enlarging the kiosk display preserves its base and stand geometry and placement',()=>{
  const object=data.objects.find(o=>o.id==='g15-central-kiosk');
  const standard=build({...object,screenScale:1}),enlarged=build(object);
  for(const name of ['Kiosk base','Kiosk stand']){
    const a=new THREE.Box3().setFromObject(standard.getObjectByName(name));
    const b=new THREE.Box3().setFromObject(enlarged.getObjectByName(name));
    assert.deepEqual(a.min.toArray(),b.min.toArray());assert.deepEqual(a.max.toArray(),b.max.toArray());
  }
  const before=new THREE.Box3().setFromObject(standard.getObjectByName('Kiosk display')).getSize(new THREE.Vector3());
  const after=new THREE.Box3().setFromObject(enlarged.getObjectByName('Kiosk display')).getSize(new THREE.Vector3());
  assert.ok(after.x>before.x&&after.y>before.y,'Only the display should grow');
  assert.deepEqual(enlarged.position.toArray(),standard.position.toArray());
  assert.deepEqual(enlarged.quaternion.toArray(),standard.quaternion.toArray());
});
