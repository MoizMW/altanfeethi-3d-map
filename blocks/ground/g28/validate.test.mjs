import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import * as THREE from '../../../app/node_modules/three/build/three.module.js';
import {validateBlock} from '../../../shared/schema/block-schema.js';
import {buildArchitecture} from '../../../app/architecture.js';

const root=new URL('../../../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const [manifest,architecture,data,evidence]=await Promise.all(['manifest','architecture','objects','evidence'].map(name=>read(`blocks/ground/g28/${name}.json`)));
const block={...manifest,architecture,placement:architecture.placement,floorSize:architecture.floorSize,ceilingHeight:architecture.ceilingHeight,objects:data.objects,evidence};

test('G28 reconciles all normal-view seat and core table identities exactly once',async()=>{
  validateBlock(block);
  const seats=new Set(),tables=new Set();
  for(const camera of evidence.cameras){
    for(const [kind,labels] of [['chairs',seats],['tables',tables]]){
      const roi=await read(evidence.rois[camera][kind]);
      for(const label of Object.keys(roi))labels.add(label);
    }
    await access(new URL(evidence.snapshots[camera],root));
    await access(new URL(evidence.wideSnapshots[camera],root));
  }
  assert.deepEqual(block.objects.flatMap(o=>o.seats).sort(),[...seats].sort());
  assert.equal(seats.size,13);
  assert.ok(!seats.has('Seat_G80'));
  assert.equal(block.objects.filter(o=>o.type==='sofa').length,2);
  assert.equal(block.objects.filter(o=>o.type==='armchair').length,9);
  const core=block.objects.filter(o=>o.externalId).map(o=>o.externalId);
  assert.deepEqual(core.sort(),['Table_G23','Table_G24','Table_G25','Table_G26']);
  assert.deepEqual([...core,...evidence.excludedObservations.map(o=>o.externalId)].sort(),[...tables].sort());
  for(const o of block.objects)for(const camera of o.cameras)assert.ok(evidence.cameras.includes(camera));
});

test('G28 leaves its walkway clear and keeps the raised plant on its support',()=>{
  const shell=buildArchitecture(architecture);shell.updateMatrixWorld(true);
  for(const x of [-1.35,0,1.35])assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,-5),new THREE.Vector3(0,0,1)).intersectObject(shell,true).length,0);
  for(const o of block.objects){
    const angle=THREE.MathUtils.degToRad(o.yaw);
    const [w,,d]=o.size.map((value,i)=>value*o.scale[i]);
    const dx=(Math.abs(Math.cos(angle))*w+Math.abs(Math.sin(angle))*d)/2;
    const dz=(Math.abs(Math.sin(angle))*w+Math.abs(Math.cos(angle))*d)/2;
    assert.ok(o.position[0]+dx<=-1.4||o.position[0]-dx>=1.4,`${o.id} obstructs the path`);
    assert.ok(Math.abs(o.position[0])+dx<=4.2,`${o.id} exceeds crop width`);
    assert.ok(Math.abs(o.position[2])+dz<=3.8,`${o.id} exceeds crop length`);
    if(o.supportObjectId){
      const support=block.objects.find(s=>s.id===o.supportObjectId);
      assert.ok(support);
      assert.equal(o.position[1],support.position[1]+support.size[1]);
      for(const i of [0,2])assert.ok(Math.abs(o.position[i]-support.position[i])+o.size[i]/2<=support.size[i]/2);
    }
  }
});

test('G28 retains registered map evidence without claiming a global transform',async()=>{
  const registration=await read('evidence/registration/camera-placements.json');
  assert.equal(architecture.placement.status,'not-globally-calibrated');
  for(const anchor of architecture.placement.anchors){
    const camera=registration.cameras.find(c=>c.id===anchor.camera);
    assert.equal(camera.group_id,'g28');
    assert.deepEqual(anchor.pixel,[camera.position.x,camera.position.y]);
    assert.equal(anchor.heading,camera.heading);
  }
});
