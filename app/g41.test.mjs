import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {validateBlock} from '../shared/schema/block-schema.js';
import {buildArchitecture} from './architecture.js';
import {buildPrivateLoungeObject,privateLoungeSizes} from './private-lounge-objects.js';

const json=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(f=>json(`blocks/first/g41/${f}.json`)));

test('G41 reconciles both camera ROI sets into four seats and one physical table set',async()=>{
  validateBlock({...m,architecture:a,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e});
  const seats=new Set(),tables=new Set();
  for(const c of e.cameras){
    Object.keys(await json(e.rois[c].chairs)).forEach(id=>seats.add(id));
    Object.keys(await json(e.rois[c].tables)).forEach(id=>tables.add(id));
    for(const p of [e.snapshots[c],e.wideSnapshots[c]])assert.ok((await readFile(new URL('../'+p,import.meta.url))).length>0);
  }
  assert.deepEqual(o.objects.flatMap(x=>x.seats).sort(),[...seats].sort());
  assert.deepEqual(o.objects.filter(x=>x.externalId).map(x=>x.externalId).sort(),[...tables].sort());
  assert.equal(seats.size,4);assert.equal(tables.size,1);
  assert.equal(o.objects.filter(x=>x.type==='sofa').length,1);
  assert.equal(o.objects.filter(x=>x.type==='armchair').length,2);
  assert.ok(o.objects.filter(x=>x.type==='armchair').every(x=>x.color==='#627d86'));
  const registration=await json('evidence/registration/camera-placements.json');
  for(const anchor of a.placement.anchors){
    const c=registration.cameras.find(c=>c.id===anchor.camera);
    assert.equal(c.group_id,'g41');assert.equal(c.floor,'first');
    assert.deepEqual(anchor.pixel,[c.position.x,c.position.y]);assert.equal(anchor.heading,c.heading);
  }
});

test('G41 retains clear entry and TV-side access in full and cutaway views',()=>{
  for(const cutaway of [false,true]){
    const closed=buildArchitecture(a,{cutaway});closed.updateMatrixWorld(true);
    const ray=new THREE.Raycaster(new THREE.Vector3(1.15,.7,2.7),new THREE.Vector3(0,0,-1),0,4.5);
    assert.ok(ray.intersectObject(closed,true).some(hit=>hit.object.isMesh),'Closed sliding leaf must fill the doorway');
    assert.ok(closed.getObjectByName('Sliding entrance track'));
    assert.ok(closed.getObjectByName('Sliding door pull handle'));
    const opened=structuredClone(a);opened.walls.find(w=>w.id==='g41-entrance-screen').doors[0].openFraction=1;
    const shell=buildArchitecture(opened,{cutaway});shell.updateMatrixWorld(true);
    const hits=ray.intersectObject(shell,true).filter(hit=>hit.object.isMesh);
    assert.equal(hits.length,0,'Open leaf must leave the TV-side access clear');
  }
  const bounds=o.objects.filter(x=>['sofa','armchair','table'].includes(x.type)).map(x=>{
    const r=x.yaw*Math.PI/180,w=(Math.abs(Math.cos(r))*x.size[0]+Math.abs(Math.sin(r))*x.size[2])/2;
    const d=(Math.abs(Math.sin(r))*x.size[0]+Math.abs(Math.cos(r))*x.size[2])/2;
    assert.ok(x.position[0]-w>-1.73&&x.position[0]+w<1.73);
    assert.ok(x.position[2]-d>-2.18&&x.position[2]+d<2.18);
    assert.ok(x.position[0]+w<.78,'Furniture must clear TV-side access');
    return {id:x.id,minX:x.position[0]-w,maxX:x.position[0]+w,minZ:x.position[2]-d,maxZ:x.position[2]+d};
  });
  for(let i=0;i<bounds.length;i++)for(let j=i+1;j<bounds.length;j++){
    const x=bounds[i],y=bounds[j];
    assert.ok(x.maxX<=y.minX||y.maxX<=x.minX||x.maxZ<=y.minZ||y.maxZ<=x.minZ,`${x.id} intersects ${y.id}`);
  }
});

test('private-lounge variants have finite geometry, grounded supports and connected table tops',()=>{
  for(const source of o.objects.filter(x=>privateLoungeSizes[x.variant])){
    const group=buildPrivateLoungeObject(source),bounds=new THREE.Box3().setFromObject(group);
    assert.ok(group.children.length>1);assert.ok(bounds.min.y>=-.03);
    group.traverse(x=>{if(x.isMesh)assert.ok([...x.geometry.attributes.position.array].every(Number.isFinite));});
    const h=privateLoungeSizes[source.variant][1];
    if(source.variant==='oval-mirror')assert.ok(Math.abs(bounds.getSize(new THREE.Vector3()).y-h)<.02);
    else assert.ok(bounds.min.y<.01,'Floor object must touch the floor');
    if(source.type==='table'){
      group.updateMatrixWorld(true);
      for(const [x,z]of [[-.36,-.02],[.36,-.02],[-.08,.23]]){
        const hits=new THREE.Raycaster(new THREE.Vector3(x,.1,z),new THREE.Vector3(0,1,0),0,.4).intersectObject(group,true);
        assert.ok(hits.some(hit=>hit.point.y>.28),'Brass support must meet a stone top');
      }
    }
  }
});
