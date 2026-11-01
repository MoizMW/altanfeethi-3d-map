import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {validateBlock} from '../../../shared/schema/block-schema.js';
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url)));
test('G10 matches current ROI identities and shared object types',async()=>{
  const [m,a,d,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(f=>read(`./${f}.json`)));
  validateBlock({...m,architecture:a,placement:a.placement,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:d.objects});
  assert.equal(d.objects.length,15);
  assert.deepEqual(d.objects.flatMap(o=>o.seats).sort(),Array.from({length:8},(_,i)=>`Seat_B${i+9}`).sort());
  const observed=new Set();
  for(const path of e.roiFiles){const rois=await read('../../../'+path);for(const label of Object.keys(rois)){
    observed.add(label);const matches=d.objects.filter(o=>o.seats.includes(label)||o.externalId===label);
    assert.equal(matches.length,1,label);
    assert.equal((label.startsWith('Seat_')?e.seatMappings:e.tableMappings)[label],matches[0].id);
  }}
  assert.equal(observed.size,10);
  for(const path of [...Object.values(e.snapshots),...Object.values(e.wideSnapshots)])await access(new URL('../../../'+path,import.meta.url));
  for(const o of d.objects)assert.ok(o.cameras.every(c=>e.cameras.includes(c)));
});
