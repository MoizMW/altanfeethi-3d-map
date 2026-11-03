import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {validateBlock} from '../../../shared/schema/block-schema.js';
import {buildArchitecture} from '../../../app/architecture.js';
import {passportSizes,buildPassportObject} from '../../../app/passport-objects.js';
import {server} from '../../../app/server.mjs';

const THREE=createRequire(new URL('../../../app/package.json',import.meta.url))('three');
const project=new URL('../../../',import.meta.url);
const read=async name=>JSON.parse(await readFile(new URL(name,import.meta.url)));
const [m,a,d,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(n=>read(`./${n}.json`)));
const block={...m,architecture:a,evidence:e,placement:a.placement,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:d.objects};
const mat=(color,roughness=.65,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const mesh=(group,geometry,material,position)=>{const result=new THREE.Mesh(geometry,material);result.position.fromArray(position);group.add(result);return result;};
const box=(group,size,position,material)=>mesh(group,new THREE.BoxGeometry(...size),material,position);
const rod=(group,start,end,radius,material)=>{
  const s=new THREE.Vector3(...start),t=new THREE.Vector3(...end),v=t.clone().sub(s);
  const result=mesh(group,new THREE.CylinderGeometry(radius,radius,v.length(),8),material,s.add(t).multiplyScalar(.5).toArray());
  result.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return result;
};
const build=o=>{
  const group=new THREE.Group();buildPassportObject(group,o,{box,mesh,rod,mat});
  group.position.fromArray(o.position);group.rotation.y=THREE.MathUtils.degToRad(o.yaw);
  group.scale.fromArray(o.size.map((v,i)=>v/passportSizes[o.type][i]*(o.scale?.[i]??1)));return group;
};

test('G13 resolves four provisional officer positions from overlapping reception regions',async()=>{
  validateBlock(block);
  const registration=JSON.parse(await readFile(new URL('evidence/registration/camera-placements.json',project)));
  assert.deepEqual(e.cameras.slice().sort(),registration.cameras.filter(c=>c.group_id==='g13').map(c=>c.id).sort());
  assert.equal(d.objects.filter(o=>o.type==='passport-booth').length,4);
  assert.equal(d.objects.filter(o=>o.type==='office-chair').length,4);
  assert.equal(d.objects.filter(o=>o.type==='display').length,4);
  assert.equal(d.objects.filter(o=>o.type==='passport-gate').length,3);
  assert.deepEqual(d.objects.flatMap(o=>o.seats).sort(),Array.from({length:4},(_,i)=>`Seat_G13_TMP_0${i+1}`));
  for(const camera of e.cameras){
    await access(new URL(e.snapshots[camera],project));await access(new URL(e.wideSnapshots[camera],project));
    const roi=JSON.parse(await readFile(new URL(e.rois[camera].reception,project)));
    assert.deepEqual(Object.keys(roi),['R1']);
    assert.ok(roi.R1.points.every(([x,y])=>x>=0&&x<=1920&&y>=0&&y<=1080));
  }
  for(const object of d.objects)assert.ok(object.cameras.every(c=>e.cameras.includes(c)));
});

test('passport geometry fits its bounds, desk banks own one shared partition, and staff aisle stays open',()=>{
  const scene=buildArchitecture(a),built=new Map();
  for(const object of d.objects.filter(o=>passportSizes[o.type])){
    const group=build(object);group.updateMatrixWorld(true);
    group.traverse(o=>{if(o.geometry)assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));});
    const bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3());
    size.toArray().forEach((v,i)=>assert.ok(v<=object.size[i]+.01,`${object.id}: dimension ${i} exceeds bounds`));
    assert.ok(bounds.min.y>=-.002);scene.add(group);built.set(object.id,group);
  }
  const left=d.objects.find(o=>o.id==='g13-booth-02'),right=d.objects.find(o=>o.id==='g13-booth-01');
  assert.equal(right.omitLeftPartition,true);assert.equal(left.omitRightPartition??false,false);
  assert.equal(built.get(right.id).getObjectByName('Booth partitions').children.filter(o=>o.material.transparent).length,1);
  assert.equal(built.get(left.id).getObjectByName('Booth partitions').children.filter(o=>o.material.transparent).length,2);
  scene.updateMatrixWorld(true);
  const hits=new THREE.Raycaster(new THREE.Vector3(a.floorCenter[0]+a.floorSize[0]/2-.2,.7,-2.4),new THREE.Vector3(-1,0,0)).intersectObject(scene,true);
  assert.ok(hits.length>0);assert.equal(hits[0].object.parent.userData.boundaryId,'g13-end-return','Staff aisle must reach the end wall without obstruction');
  for(const chair of d.objects.filter(o=>o.type==='office-chair'))assert.equal(chair.position[1],.07);
  const invalid=structuredClone(block);invalid.objects.find(o=>o.type==='passport-gate').openFraction=2;
  assert.throws(()=>validateBlock(invalid),/opening/);
});

test('G13 follows the owner right-to-left sequence with a display beside the double bank',()=>{
  const x=id=>d.objects.find(o=>o.id===id).position[0];
  assert.ok(x('g13-passenger-gate-03')>x('g13-booth-01'));
  assert.ok(x('g13-booth-01')>x('g13-booth-02'));
  assert.ok(x('g13-booth-02')>x('g13-passenger-gate-01'));
  assert.ok(x('g13-passenger-gate-01')>x('g13-booth-03'));
  assert.ok(x('g13-booth-03')>x('g13-passenger-gate-02'));
  assert.ok(x('g13-passenger-gate-02')>x('g13-booth-04'));
  const fixed=a.walls.find(w=>w.id==='g13-right-fixed-glass');
  assert.ok(fixed.start[0]>x('g13-passenger-gate-03'));
  const screen=d.objects.find(o=>o.id==='g13-information-totem');
  assert.ok(screen.position[0]>x('g13-booth-01'));
  assert.equal(screen.position[2],d.objects.find(o=>o.id==='g13-booth-01').position[2]);
  assert.deepEqual(screen.associatedBoothBank,['g13-booth-01','g13-booth-02']);
});

test('first two gates have one glass leaf and only the last gate has two',()=>{
  const gates=d.objects.filter(o=>o.type==='passport-gate').sort((a,b)=>b.position[0]-a.position[0]);
  assert.deepEqual(gates.map(o=>o.leafCount),[1,1,2]);
  const actual=gates.map(o=>{let count=0;build(o).traverse(part=>{if(part.name==='Swing gate glass')count++;});return count;});
  assert.deepEqual(actual,[1,1,2]);
  const posts=gates.map(o=>{let count=0;build(o).traverse(part=>{if(part.name==='Gate hinge post')count++;});return count;});
  assert.deepEqual(posts,[1,1,2],'Single gates must not have an extra standalone post');
  for(const gate of gates.filter(o=>o.leafCount===1)){
    const model=build(gate);model.updateMatrixWorld(true);
    assert.ok(model.getObjectByName('Single gate top rail'));
    const post=new THREE.Vector3();model.getObjectByName('Gate hinge post').getWorldPosition(post);
    if(gate.id==='g13-passenger-gate-03')assert.ok(post.x<gate.position[0],'Outer hinge belongs next to the double booth');
    else assert.ok(post.x>gate.position[0],'Middle hinge belongs next to the double booth');
  }
  const invalid=structuredClone(block);invalid.objects.find(o=>o.type==='passport-gate').leafCount=3;
  assert.throws(()=>validateBlock(invalid),/glass leaves/);
});

test('single gate openings are half-width and meet adjoining booths without leftover gaps',()=>{
  const get=id=>d.objects.find(o=>o.id===id);
  const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} must match ${expected}`);
  const left=o=>o.position[0]-o.size[0]/2,right=o=>o.position[0]+o.size[0]/2;
  const middle=get('g13-passenger-gate-01'),outer=get('g13-passenger-gate-03'),double=get('g13-passenger-gate-02');
  for(const single of [middle,outer]){
    close(single.size[0]*2,double.size[0]);
    const model=build(single);model.updateMatrixWorld(true);
    const postWidth=new THREE.Box3().setFromObject(model.getObjectByName('Gate hinge post')).getSize(new THREE.Vector3()).x;
    close(postWidth,.11);
  }
  close(right(middle),left(get('g13-booth-02')));close(left(middle),right(get('g13-booth-03')));
  close(left(outer),right(get('g13-booth-01')));
  close(right(outer),a.walls.find(w=>w.id==='g13-right-fixed-glass').start[0]);
  close(right(double),left(get('g13-booth-03')));close(left(double),right(get('g13-booth-04')));
});

test('G13 API lists the block, serves all evidence and builder, and saves without altering G15',async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const files=['manifest.json','architecture.json','objects.json','evidence.json'];
  const g15=await Promise.all(files.map(file=>readFile(new URL(`../g15/${file}`,import.meta.url),'utf8')));
  try{
    const origin=`http://127.0.0.1:${server.address().port}`;
    const listing=await(await fetch(origin+'/api/blocks')).json();assert.ok(listing.blocks.some(b=>b.key==='ground/g13'));
    const loaded=await(await fetch(origin+'/api/block?block=ground/g13')).json();validateBlock(loaded.block);
    assert.equal((await fetch(origin+'/passport-objects.js')).status,200);
    for(const camera of e.cameras)for(const wide of [false,true])assert.equal((await fetch(`${origin}/api/evidence/camera/${camera}?block=ground/g13${wide?'&wide=1':''}`)).status,200);
    const saved=await fetch(origin+'/api/block?block=ground/g13',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:loaded.revision,block:loaded.block})});
    assert.equal(saved.status,200);
    const reloaded=await(await fetch(origin+'/api/block?block=ground/g13')).json();assert.deepEqual(reloaded.block.objects,loaded.block.objects);
    assert.deepEqual(await Promise.all(files.map(file=>readFile(new URL(`../g15/${file}`,import.meta.url),'utf8'))),g15);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
