import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterObjects,sourceObjectLink} from './editor-ui.js';
import {buildObject,objectReferenceSize} from './object-builders.js';

test('object search combines words, seat and table IDs, and source room without changing source data',()=>{
  const objects=[
    {id:'chair-1',name:'Blue lounge chair',type:'armchair',seats:['Seat_H25'],sourceBlock:'first/g40'},
    {id:'table-1',name:'Stone coffee table',type:'table',seats:[],externalId:'Table_H6',sourceBlock:'first/g40'},
    {id:'chair-2',name:'Blue lounge chair',type:'armchair',seats:['Seat_H21'],sourceBlock:'first/g41'},
  ];
  const before=JSON.stringify(objects);
  assert.deepEqual(filterObjects(objects,' h25 '),[objects[0]]);
  assert.deepEqual(filterObjects(objects,'STONE H6 G40'),[objects[1]]);
  assert.equal(filterObjects(objects,'blue g40').length,1);
  assert.equal(filterObjects(objects,'no match').length,0);
  assert.deepEqual(filterObjects(objects,'   '),objects);
  assert.equal(JSON.stringify(objects),before);
});

test('source-room links select the same object and exclude shared-layout context',()=>{
  const object={id:'g40-chair-25',sourceBlock:'first/g40'},url=new URL(sourceObjectLink(object),'http://localhost');
  assert.equal(url.searchParams.get('block'),'first/g40');assert.equal(url.searchParams.get('object'),object.id);
  for(const sourceBlock of ['layout:first/private-lounges','../private','https://example.com',undefined])assert.equal(sourceObjectLink({...object,sourceBlock}),null);
});

test('custom-object transform normalization preserves authored scale',()=>{
  const mirror={id:'test-mirror',name:'Mirror',type:'wall-panel',variant:'oval-mirror',position:[0,0,0],size:[.85,1.2,.08],scale:[1.2,.9,1.1],yaw:0,color:'#5a5149',seats:[],cameras:[]};
  const model=buildObject(mirror),reference=objectReferenceSize(mirror);
  const restored=model.scale.toArray().map((value,i)=>value/(mirror.size[i]/reference[i]));
  restored.forEach((value,i)=>assert.ok(Math.abs(value-mirror.scale[i])<1e-8));
});

test('all library configurations create valid independent placements with fresh local IDs',async()=>{
  const {collectObjectLibrary}=await import('../scripts/build-object-library.mjs');
  const {createAssetPlacement,removeAsset}=await import('./editor-ui.js');
  const {validateBlock}=await import('../shared/schema/block-schema.js');
  const library=await collectObjectLibrary();
  const block={format:'altanfeethi-spatial-block',version:1,id:'test-room',floor:'ground',floorSize:[10,10],ceilingHeight:4,architecture:{floorCenter:[2,3]},objects:[]};
  for(const asset of library.assets)for(const config of asset.configurations){
    const before=JSON.stringify(config),token=String(block.objects.length).padStart(16,'0');
    const object=createAssetPlacement(block,asset,config,token);
    assert.deepEqual(object.position,[2,object.type==='tv'?Math.max(0,Math.min(1.4,(block.ceilingHeight??4.1)-object.size[1]*(object.scale?.[1]??1)-.15)):0,3]);assert.deepEqual(object.cameras,[]);
    assert.ok(object.id.startsWith('test-room-'));assert.equal(object.externalId,undefined);
    assert.equal(object.sourceBlock,undefined);assert.equal(JSON.stringify(config),before);
    block.objects.push(object);validateBlock(block);
  }
  const object=block.objects[0],before=JSON.stringify(block),next=removeAsset(block,object.id);
  assert.equal(next.objects.length,block.objects.length-1);assert.equal(JSON.stringify(block),before);
  assert.throws(()=>removeAsset(block,'missing'),/Select an asset/);
  assert.throws(()=>removeAsset({...block,readOnly:true},object.id),/source room/);
  assert.throws(()=>createAssetPlacement({...block,readOnly:true},library.assets[0],library.assets[0].configurations[0],'new'),/source room/);
  assert.throws(()=>createAssetPlacement(block,library.assets[0],library.assets[0].configurations[0],'0000000000000000'),/already exists/);
});

 test('new TVs start raised and fit beneath the room ceiling',async()=>{
  const {createAssetPlacement}=await import('./editor-ui.js');
  const config={preview:{type:'tv',size:[1.55,.9,.08],scale:[1,1,1]}};
  const block={id:'test-room',objects:[],ceilingHeight:2.2,architecture:{floorCenter:[2,3]}};
  const tv=createAssetPlacement(block,{name:'TV'},config,'tv');
  assert.ok(tv.position[1]>0);assert.ok(tv.position[1]+tv.size[1]<block.ceilingHeight);
  assert.deepEqual([tv.position[0],tv.position[2]],[2,3]);
 });
