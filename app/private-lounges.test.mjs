import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import {validateBlock} from '../shared/schema/block-schema.js';
import {composeLayout} from './layouts.mjs';
import {buildArchitecture} from './architecture.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const json=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
const load=async key=>{
  const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(f=>json(`blocks/${key}/${f}.json`)));
  return {block:{...m,architecture:a,placement:a.placement,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e}};
};
const layout=await json('layouts/first/private-lounges.json');

test('G39 and G40 reconcile available and historical ROIs without linking the missing H10 image',async()=>{
  for(const group of ['g39','g40']){
    const {block}=await load('first/'+group);validateBlock(block);
    const seats=new Set(),tables=new Set();
    for(const refs of Object.values({...block.evidence.rois,...block.evidence.historicalRois})){
      Object.keys(await json(refs.chairs)).forEach(id=>seats.add(id));
      Object.keys(await json(refs.tables)).forEach(id=>tables.add(id));
    }
    assert.deepEqual(block.objects.flatMap(o=>o.seats).sort(),[...seats].sort());
    assert.deepEqual(block.objects.filter(o=>o.externalId).map(o=>o.externalId).sort(),[...tables].sort());
    assert.equal(seats.size,4);assert.equal(tables.size,1);
    assert.equal(block.objects.filter(o=>o.type==='sofa').length,1);
    assert.equal(block.objects.filter(o=>o.type==='armchair').length,2);
    for(const camera of block.evidence.cameras){
      await access(new URL('../'+block.evidence.snapshots[camera],import.meta.url));
      await access(new URL('../'+block.evidence.wideSnapshots[camera],import.meta.url));
    }
  }
  const g39=(await load('first/g39')).block;
  assert.ok(!g39.evidence.cameras.includes('H10'));
  assert.ok(!g39.evidence.snapshots.H10);
  assert.ok(g39.evidence.historicalRois.H10);
  assert.ok(!g39.objects.some(o=>o.variant==='oval-mirror'),'Unseen rear mirror must remain unresolved');
});

test('private-room row follows map order and preserves every source object under rigid placement',async()=>{
  const {block}=await composeLayout(root,'first/private-lounges',load);validateBlock(block);
  assert.equal(block.objects.filter(item=>item.type!=='tissue-box').length,20);assert.equal(block.readOnly,true);
  const seats=block.objects.flatMap(o=>o.seats),tables=block.objects.filter(o=>o.externalId).map(o=>o.externalId);
  assert.equal(seats.length,12);assert.equal(new Set(seats).size,12);
  assert.deepEqual(tables.sort(),['Table_H5','Table_H6','Table_H7']);
  assert.deepEqual(layout.components.map(c=>c.block),['first/g39','first/g40','first/g41']);
  const registration=await json('evidence/registration/camera-placements.json');
  let previousPixel=-Infinity,previousWorld=-Infinity;
  for(const part of layout.components){
    assert.ok(part.position[0]>previousWorld);previousWorld=part.position[0];
    const anchor=layout.integration.mapOrder.pixelAnchors.find(a=>a.block===part.block);
    const camera=registration.cameras.find(c=>c.id===anchor.camera);
    assert.deepEqual(anchor.pixel,[camera.position.x,camera.position.y]);
    assert.ok(anchor.pixel[0]>previousPixel);previousPixel=anchor.pixel[0];
    const source=(await load(part.block)).block;
    for(const o of source.objects){
      const transformed=block.objects.find(x=>x.id===o.id),{sourceBlock,...saved}=transformed;
      assert.equal(sourceBlock,part.block);
      const expected=structuredClone(o),angle=part.yaw*Math.PI/180,[x,y,z]=o.position;
      expected.position=[Math.cos(angle)*x+Math.sin(angle)*z+part.position[0],y+part.position[1],-Math.sin(angle)*x+Math.cos(angle)*z+part.position[2]];
      expected.yaw+=part.yaw;
      assert.deepEqual(saved,expected);
    }
  }
  assert.equal(block.architecture.walls.length,10);
  for(const seam of layout.integration.sharedBoundaries){
    assert.equal(block.architecture.walls.filter(w=>w.id===seam.wallId).length,1);
    assert.ok(seam.replaces.every(id=>!block.architecture.walls.some(w=>w.id===id)));
  }
});

test('shared corridor connects all three sliding entrances without cutting private-room partitions',async()=>{
  const {block}=await composeLayout(root,'first/private-lounges',load);
  for(const cutaway of [false,true]){
    const open=structuredClone(block.architecture);
    for(const wall of open.walls)for(const door of wall.doors||[])door.openFraction=1;
    const shell=buildArchitecture(open,{cutaway});shell.updateMatrixWorld(true);
    const hits=(p,d,far)=>new THREE.Raycaster(new THREE.Vector3(...p),new THREE.Vector3(...d),0,far).intersectObject(shell,true).filter(h=>h.object.isMesh);
    assert.equal(hits([-8.9,.7,3.1],[1,0,0],10.5).length,0,'Corridor must connect all room fronts');
    for(const part of layout.components)assert.equal(hits([part.position[0]+1.15,.7,3.1],[0,0,-1],5.1).length,0,'Open door must reach the interior TV-side access');
    for(const x of [-5.4,-1.8])assert.ok(hits([x-.3,.7,0],[1,0,0],.6).length>0,'Private rooms retain a solid dividing wall');
  }
  const floor=block.architecture.floorSections;
  const roomFloors=floor.filter(f=>f.sourceBlock).sort((a,b)=>a.center[0]-b.center[0]);
  for(let i=1;i<roomFloors.length;i++)assert.ok(Math.abs(roomFloors[i-1].center[0]+roomFloors[i-1].size[0]/2-(roomFloors[i].center[0]-roomFloors[i].size[0]/2))<1e-8);
  const corridor=floor.find(f=>f.id==='private-row-front-corridor');
  assert.ok(Math.abs(corridor.center[1]-corridor.size[1]/2-(roomFloors[0].center[1]+roomFloors[0].size[1]/2))<1e-8);
});
