import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import * as THREE from '../../../app/node_modules/three/build/three.module.js';
import {buildArchitecture} from '../../../app/architecture.js';
import {validateBlock} from '../../../shared/schema/block-schema.js';

const root=new URL('../../../',import.meta.url);
const [manifest,architecture,objects,evidence]=await Promise.all(['manifest','architecture','objects','evidence'].map(async name=>JSON.parse(await readFile(new URL(`${name}.json`,import.meta.url)))));

test('Both groups reconcile every observed identity into one shared editable object',async()=>{
  validateBlock({...manifest,architecture,floorSize:architecture.floorSize,ceilingHeight:architecture.ceilingHeight,objects:objects.objects});
  const registration=JSON.parse(await readFile(new URL('evidence/registration/camera-placements.json',root)));
  assert.deepEqual(evidence.cameras.toSorted(),registration.cameras.filter(c=>manifest.groups.includes(c.group_id)).map(c=>c.id).toSorted());
  for(const [kind,values,mappings] of [
    ['chairs',objects.objects.flatMap(o=>o.seats),evidence.seatMappings],
    ['tables',objects.objects.filter(o=>o.externalId).map(o=>o.externalId),evidence.tableMappings]
  ]){
    const seen=new Set();
    for(const camera of evidence.cameras){
      await access(new URL(evidence.snapshots[camera],root));
      await access(new URL(evidence.wideSnapshots[camera],root));
      const roi=JSON.parse(await readFile(new URL(evidence.rois[camera][kind],root)));
      for(const identity of Object.keys(roi)){
        seen.add(identity);
        const owner=objects.objects.find(o=>o.id===mappings[identity]);
        assert.ok(owner,`${identity} has an owning object`);
        assert.ok(owner.cameras.includes(camera),`${camera} observes ${identity}`);
      }
    }
    assert.deepEqual(values.toSorted(),[...seen].toSorted());
    assert.equal(new Set(values).size,values.length,'An overlapping observation must not duplicate an object');
  }
  assert.equal(objects.objects.flatMap(o=>o.seats).length,21);
  assert.equal(objects.objects.filter(o=>o.type==='sofa').length,4);
  assert.equal(objects.objects.filter(o=>o.type==='armchair').length,13);
  assert.equal(objects.objects.filter(o=>o.externalId==='Table_C23').length,1);
});

test('One common corridor and the interior dark aisle remain clear through all three arches',()=>{
  const aisle=architecture.interiorAisle.polygon,aisleMin=Math.min(...aisle.map(p=>p[0])),aisleMax=Math.max(...aisle.map(p=>p[0]));
  const aisleMinZ=Math.min(...aisle.map(p=>p[1])),aisleMaxZ=Math.max(...aisle.map(p=>p[1]));
  const corridorMin=Math.min(...architecture.circulation.polygon.map(p=>p[0]));
  for(const o of objects.objects){
    const yaw=o.yaw*Math.PI/180;
    const extent=(Math.abs(Math.cos(yaw))*o.size[0]+Math.abs(Math.sin(yaw))*o.size[2])/2;
    const extentZ=(Math.abs(Math.sin(yaw))*o.size[0]+Math.abs(Math.cos(yaw))*o.size[2])/2;
    assert.ok(o.position[0]+extent<corridorMin,`${o.id} blocks the shared corridor`);
    assert.ok(o.position[2]+extentZ<=aisleMinZ||o.position[2]-extentZ>=aisleMaxZ||o.position[0]+extent<=aisleMin||o.position[0]-extent>=aisleMax,`${o.id} blocks the interior aisle`);
  }
  for(const cutaway of [true,false]){
    const shell=buildArchitecture(architecture,{cutaway});shell.updateMatrixWorld(true);
    for(const z of [-4.4,0,4.4]){
      const hits=new THREE.Raycaster(new THREE.Vector3(4.5,.7,z),new THREE.Vector3(-1,0,0)).intersectObject(shell,true);
      assert.ok(hits.length&&hits[0].point.x< -3,'Each corridor arch must reach the opposite glass');
    }
    const hits=new THREE.Raycaster(new THREE.Vector3(4.2,.7,-7),new THREE.Vector3(0,0,1)).intersectObject(shell,true);
    assert.equal(hits.length,0,'Corridor ends remain open');
    shell.traverse(node=>{node.geometry?.dispose();node.material?.dispose();});
  }
});
