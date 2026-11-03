import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import * as THREE from '../../../app/node_modules/three/build/three.module.js';
import {validateBlock} from '../../../shared/schema/block-schema.js';
import {buildArchitecture} from '../../../app/architecture.js';
import {buildNestedStoneTable} from '../../../app/lounge-tables.js';
const root=new URL('../../../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(f=>read(`blocks/first/g36/${f}.json`)));
const block={...m,architecture:a,placement:a.placement,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e};

test('G36 resolves all original seat/table ROIs once and preserves first-floor camera registration',async()=>{
  validateBlock(block);assert.equal(block.floor,'first');
  const seats=new Set(),tables=new Set(),registration=await read('evidence/registration/camera-placements.json');
  for(const camera of e.cameras){
    for(const [kind,labels] of [['chairs',seats],['tables',tables]])for(const label of Object.keys(await read(e.rois[camera][kind])))labels.add(label);
    await access(new URL(e.snapshots[camera],root));await access(new URL(e.wideSnapshots[camera],root));
    const c=registration.cameras.find(c=>c.id===camera),anchor=a.placement.anchors.find(c=>c.camera===camera);
    assert.equal(c.floor,'first');assert.equal(c.group_id,'g36');assert.deepEqual(anchor.pixel,[c.position.x,c.position.y]);assert.equal(anchor.heading,c.heading);
  }
  assert.deepEqual(block.objects.flatMap(o=>o.seats).sort(),[...seats].sort());
  assert.deepEqual([...seats].sort(),['Seat_H5','Seat_H6','Seat_H7','Seat_H8']);
  assert.deepEqual(block.objects.filter(o=>o.externalId).map(o=>o.externalId),[...tables]);
  assert.equal(block.objects.filter(o=>o.type==='sofa').length,1);assert.equal(block.objects.filter(o=>o.type==='armchair').length,2);
});

test('G36 keeps furniture inside the crop and leaves the balustrade-side access open',()=>{
  for(const o of block.objects){
    const angle=o.yaw*Math.PI/180,[w,,d]=o.size;
    const dx=(Math.abs(Math.cos(angle))*w+Math.abs(Math.sin(angle))*d)/2;
    const dz=(Math.abs(Math.sin(angle))*w+Math.abs(Math.cos(angle))*d)/2;
    assert.ok(Math.abs(o.position[0])+dx<=2.4,`${o.id}: outside width`);
    assert.ok(Math.abs(o.position[2])+dz<=2.8,`${o.id}: outside length`);
    assert.ok(o.position[0]+dx<=1.25,`${o.id}: blocks access`);
  }
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);
    for(const x of [1.3,1.65,2])assert.equal(new THREE.Raycaster(new THREE.Vector3(x,.7,-3),new THREE.Vector3(0,0,1)).intersectObject(shell,true).filter(hit=>hit.object.isMesh).length,0);
    const wood=shell.children.find(g=>g.userData.boundaryId==='g36-long-wood-wall');
    assert.ok(Math.abs(new THREE.Box3().setFromObject(wood).max.y-(cutaway?1.05:4.1))<.01);
  }
});

test('nested table has two stone surfaces, finite geometry and grounded brass supports',()=>{
  const g=buildNestedStoneTable(new THREE.Group()),box=new THREE.Box3().setFromObject(g);
  assert.ok(box.min.y>=-1e-8);assert.ok(box.max.y<.75);
  assert.equal(g.children.filter(c=>c.material.color.getHexString()==='e5e1d5').length,2);
  for(const mesh of g.children)assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite));
});
