import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {validateBlock} from '../shared/schema/block-schema.js';
import {buildArchitecture} from './architecture.js';
import {buildObject} from './object-builders.js';

const json=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(f=>json(`blocks/first/g45/${f}.json`)));

test('G45 reconciles H15/H16 into seven unique chairs and five tables, excluding H45 reception',async()=>{
  validateBlock({...m,architecture:a,placement:a.placement,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e});
  const seats=new Set(),tables=new Set();
  for(const refs of Object.values(e.rois)){
    Object.keys(await json(refs.chairs)).forEach(id=>seats.add(id));
    Object.keys(await json(refs.tables)).forEach(id=>tables.add(id));
  }
  assert.deepEqual(o.objects.flatMap(x=>x.seats).sort(),[...seats].sort());
  assert.deepEqual(o.objects.filter(x=>x.externalId).map(x=>x.externalId).sort(),[...tables].sort());
  assert.equal(seats.size,7);assert.equal(tables.size,5);assert.equal(o.objects.length,14);
  assert.ok(!o.objects.some(x=>['sofa','counter','office-chair'].includes(x.type)));
  assert.deepEqual(e.cameras,['H15','H16']);assert.ok(!e.snapshots.H45);
  assert.equal(e.excludedAssociations[0].camera,'H45');
  const registration=await json('evidence/registration/camera-placements.json');
  for(const anchor of a.placement.anchors){
    const camera=registration.cameras.find(c=>c.id===anchor.camera);
    assert.deepEqual(anchor.pixel,[camera.position.x,camera.position.y]);assert.equal(anchor.heading,camera.heading);
  }
  assert.equal(registration.cameras.find(c=>c.id==='H45').group_id,'g45','Excluding geometry must not rewrite camera metadata');
});

test('G45 facing chair rows and privacy screens preserve the central dark aisle',()=>{
  assert.equal(o.objects.filter(x=>x.type==='armchair'&&x.position[0]<0).length,3);
  assert.equal(o.objects.filter(x=>x.type==='armchair'&&x.position[0]>0).length,4);
  const bounds=o.objects.map(x=>{
    const r=x.yaw*Math.PI/180,w=(Math.abs(Math.cos(r))*x.size[0]+Math.abs(Math.sin(r))*x.size[2])/2;
    const d=(Math.abs(Math.sin(r))*x.size[0]+Math.abs(Math.cos(r))*x.size[2])/2;
    const b={id:x.id,minX:x.position[0]-w,maxX:x.position[0]+w,minZ:x.position[2]-d,maxZ:x.position[2]+d};
    assert.ok(b.minX>-2.55&&b.maxX<2.55&&b.minZ>-3.35&&b.maxZ<3.35);
    assert.ok(b.maxX<-.35||b.minX>.35,`${x.id} blocks the central aisle`);
    if(x.type==='armchair')assert.ok(-x.position[0]*Math.sin(r)>0,'Chairs face inward');
    return b;
  });
  for(let i=0;i<bounds.length;i++)for(let j=i+1;j<bounds.length;j++){
    const x=bounds[i],y=bounds[j];
    assert.ok(x.maxX<=y.minX||y.maxX<=x.minX||x.maxZ<=y.minZ||y.maxZ<=x.minZ,`${x.id} intersects ${y.id}`);
  }
  assert.equal(a.walls.filter(w=>w.variant==='rounded-reeded-divider').length,2);
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(a,{cutaway});shell.updateMatrixWorld(true);
    const hits=new THREE.Raycaster(new THREE.Vector3(0,.7,-3.12),new THREE.Vector3(0,0,1),0,6.3).intersectObject(shell,true).filter(h=>h.object.isMesh);
    assert.equal(hits.length,0);
    shell.traverse(x=>{if(x.geometry)assert.ok([...x.geometry.attributes.position.array].every(Number.isFinite));});
    assert.equal(shell.getObjectsByProperty('name','Rounded brass screen frame').length,2);
  }
  assert.equal(a.circulation.surfaceMaterial,'same-as-seating');assert.equal(a.circulations,undefined);
});

test('G45 leather chairs retain connected shared geometry, brown finish and no fabric pillow',()=>{
  for(const source of o.objects.filter(x=>x.type==='armchair')){
    const model=buildObject(source),chair=model.getObjectByName('Leather privacy lounge chair');
    assert.ok(chair);assert.ok(!chair.getObjectByName('Decorative pillow'));
    const upholstery=chair.getObjectByName('Continuous curved back and low arms').material;
    assert.equal(upholstery.color.getHexString(),source.color.slice(1));assert.equal(upholstery.bumpMap,null);
    assert.equal(upholstery.roughness,.48);
    const bounds=new THREE.Box3().setFromObject(model);assert.ok(Math.abs(bounds.min.y)<1e-5);
    model.traverse(x=>{if(x.geometry)assert.ok([...x.geometry.attributes.position.array].every(Number.isFinite));});
  }
});

test('small G45 fixtures stay within their physical footprint after reference scaling',()=>{
  for(const source of o.objects.filter(x=>['fire-extinguisher','waste-bin'].includes(x.variant))){
    const bounds=new THREE.Box3().setFromObject(buildObject(source)),size=bounds.getSize(new THREE.Vector3());
    assert.ok(size.x<=source.size[0]*1.1&&size.z<=source.size[2]*1.1,'Small fixture must not stretch through a wall');
    assert.ok(bounds.min.z>-3.35&&bounds.max.z<3.35);
    assert.ok(bounds.min.y>=-.01&&bounds.max.y<source.size[1]*1.1);
  }
});
