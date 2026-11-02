import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {validateBlock} from '../../../shared/schema/block-schema.js';
import * as THREE from '../../../app/node_modules/three/build/three.module.js';
import {buildArchitecture} from '../../../app/architecture.js';

const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url)));
const [manifest,architecture,records,evidence]=await Promise.all(['manifest','architecture','objects','evidence'].map(f=>read(`./${f}.json`)));
const objects=records.objects;

test('G22 represents every observed seat and main table exactly once, preserving the G53 gap',async()=>{
  validateBlock({...manifest,architecture,floorSize:architecture.floorSize,ceilingHeight:architecture.ceilingHeight,objects});
  assert.equal(objects.filter(o=>o.type==='sofa').length,2);
  assert.equal(objects.filter(o=>o.type==='armchair').length,9);
  const observedSeats=new Set(),observedTables=new Set();let chairCount=0,tableCount=0;
  for(const camera of evidence.cameras){
    for(const [kind,set] of [['chairs',observedSeats],['tables',observedTables]]){
      const rois=await read('../../../'+evidence.rois[camera][kind]);
      for(const [label,r] of Object.entries(rois)){
        set.add(label);if(kind==='chairs')chairCount++;else tableCount++;
        assert.ok(r.left>=0&&r.top>=0&&r.left+r.width<=1920&&r.top+r.height<=1080,label);
        const matches=objects.filter(o=>o.seats.includes(label)||o.externalId===label);
        assert.equal(matches.length,1,label);
        assert.equal((kind==='chairs'?evidence.seatMappings:evidence.tableMappings)[label],matches[0].id);
        assert.ok(matches[0].cameras.includes(camera),`${label} missing source ${camera}`);
      }
    }
    for(const path of [evidence.snapshots[camera],evidence.wideSnapshots[camera]])await access(new URL('../../../'+path,import.meta.url));
  }
  assert.equal(chairCount,evidence.roiReview.chairObservations);assert.equal(tableCount,evidence.roiReview.tableObservations);
  assert.equal(observedSeats.size,13);assert.equal(observedTables.size,4);assert.ok(!observedSeats.has('Seat_G53'));
  assert.deepEqual(objects.flatMap(o=>o.seats).sort(),[...observedSeats].sort());
  assert.deepEqual(objects.filter(o=>o.externalId).map(o=>o.externalId).sort(),[...observedTables].sort());
});

test('G22 preserves the through path, bounds and raised-object support contact',()=>{
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(architecture,{cutaway});shell.updateMatrixWorld(true);
    for(const x of [-1.35,0,1.35])assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,-6),new THREE.Vector3(0,0,1)).intersectObject(shell,true).length,0);
    shell.traverse(m=>{m.geometry?.dispose();m.material?.dispose();});
  }
  for(const o of objects){
    const angle=THREE.MathUtils.degToRad(o.yaw),[w,,d]=o.size.map((s,i)=>s*o.scale[i]);
    const dx=(Math.abs(Math.cos(angle))*w+Math.abs(Math.sin(angle))*d)/2;
    const dz=(Math.abs(Math.sin(angle))*w+Math.abs(Math.cos(angle))*d)/2;
    assert.ok(o.position[0]+dx<=-1.4||o.position[0]-dx>=1.4,`${o.id} obstructs path`);
    assert.ok(Math.abs(o.position[0])+dx<=4.5&&Math.abs(o.position[2])+dz<=4.4,`${o.id} outside footprint`);
    assert.ok(o.cameras.every(c=>evidence.cameras.includes(c)));
    if(o.supportObjectId){
      const support=objects.find(s=>s.id===o.supportObjectId);assert.ok(support);
      const top=support.position[1]+support.size[1]+.0325*(support.size[1]/.42);
      assert.ok(Math.abs(o.position[1]-top)<.001,`${o.id} floats above or intersects its support`);
    }
  }
});
