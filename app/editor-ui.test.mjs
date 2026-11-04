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
