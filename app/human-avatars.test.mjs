import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFile} from 'node:fs/promises';
import {buildObject} from './object-builders.js';
import {placeAvatarOnChair} from './human-avatars.js';
import {validateBlock} from '../shared/schema/block-schema.js';
import {collectObjectLibrary} from '../scripts/build-object-library.mjs';
import {createAssetPlacement} from './editor-ui.js';

test('both cultural avatars build at seated scale with covered attire and remain independent display assets',async()=>{
 const base=new URL('../blocks/ground/g3-g24-g25/',import.meta.url);
 const [manifest,architecture,file]=await Promise.all(['manifest','architecture','objects'].map(async name=>JSON.parse(await readFile(new URL(name+'.json',base)))));
 const block={...manifest,architecture,floorSize:architecture.floorSize,ceilingHeight:architecture.ceilingHeight,objects:file.objects};validateBlock(block);
 const avatars=block.objects.filter(o=>o.type==='human-avatar');assert.equal(avatars.length,3);
 for(const avatar of avatars){
  const chair=block.objects.find(o=>o.id===avatar.seatedOn);assert.deepEqual(avatar.position,chair.position);assert.equal(avatar.yaw,chair.yaw);assert.deepEqual(avatar.seats,[]);assert.equal(chair.pillow,false);
  const model=buildObject({...avatar,position:[0,0,0],yaw:0});model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model);assert.ok(bounds.min.y>=0);assert.ok(bounds.max.y>1.3&&bounds.max.y<1.5);assert.ok(bounds.getSize(new THREE.Vector3()).x<.7);
  assert.ok(model.getObjectByName(avatar.variant==='saudi-abaya-seated'?'Hijab hood':'Black agal'));
  if(avatar.variant==='saudi-thobe-seated'){
   assert.equal(model.getObjectByName('Silver beard curls').count,240);
   assert.ok(model.getObjectByName('Sculpted elderly face'));
   assert.ok(model.getObjectByName('Continuous seated thobe drape'));
   model.traverse(mesh=>{if(mesh.geometry?.attributes.position)assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite),mesh.name);});
  }else assert.equal(model.getObjectByName('Full grey beard'),undefined);
  const moved=placeAvatarOnChair(avatar,{...chair,position:[4,0,5],yaw:90});assert.deepEqual(moved.position,[4,0,5]);assert.notEqual(moved.position,chair.position);
 }
 const before=JSON.stringify(block.objects),library=await collectObjectLibrary();
 for(const asset of library.assets.filter(a=>a.design.type==='human-avatar')){
  const object=createAssetPlacement(block,asset,asset.configurations[0],'avatar-test-'+asset.id);assert.deepEqual(object.seats,[]);assert.equal(object.seatedOn,undefined);validateBlock({...block,objects:[...block.objects,object]});
 }
 assert.equal(JSON.stringify(block.objects),before);
 assert.throws(()=>placeAvatarOnChair(avatars[0],{type:'table'}),/Select a chair/);
 assert.throws(()=>validateBlock({...block,objects:[{...avatars[0],seats:['Seat_DEMO']}]}),/no occupancy/);
});
