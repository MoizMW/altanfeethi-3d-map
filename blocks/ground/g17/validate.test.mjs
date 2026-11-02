import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {validateBlock} from '../../../shared/schema/block-schema.js';
import {buildArchitecture} from '../../../app/architecture.js';

const {Raycaster, Vector3} = createRequire(new URL('../../../app/package.json', import.meta.url))('three');
const project = new URL('../../../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url)));
const [manifest, architecture, data, evidence] = await Promise.all(
  ['manifest', 'architecture', 'objects', 'evidence'].map(name => read(`./${name}.json`))
);
const block = {...manifest, architecture, evidence, placement: architecture.placement,
  floorSize: architecture.floorSize, ceilingHeight: architecture.ceilingHeight, objects: data.objects};

test('G17 reconciles all normal-view ROI identities without duplicating furniture', async () => {
  validateBlock(block);
  assert.equal(data.objects.filter(o => o.type === 'sofa').length, 4);
  assert.equal(data.objects.filter(o => o.type === 'armchair').length, 2);
  assert.deepEqual(data.objects.flatMap(o => o.seats).sort(),
    Array.from({length: 10}, (_, i) => `Seat_E${i+2}`).sort());
  const observedSeats = new Set(), observedTables = new Set();
  for (const camera of evidence.cameras) {
    for (const [kind, labels, mappings] of [
      ['chairs', observedSeats, evidence.seatMappings], ['tables', observedTables, evidence.tableMappings]
    ]) {
      const rois = JSON.parse(await readFile(new URL(evidence.rois[camera][kind], project)));
      for (const [label, roi] of Object.entries(rois)) {
        labels.add(label);
        const matches = data.objects.filter(o => o.seats.includes(label) || o.externalId === label);
        assert.equal(matches.length, 1, `${camera}/${label} must resolve once`);
        assert.equal(matches[0].id, mappings[label]);
        assert.ok(matches[0].cameras.includes(camera), `${camera} missing from ${matches[0].id}`);
        assert.ok(roi.left >= 0 && roi.top >= 0 && roi.left+roi.width <= 1920 && roi.top+roi.height <= 1080);
      }
    }
    await access(new URL(evidence.snapshots[camera], project));
    await access(new URL(evidence.wideSnapshots[camera], project));
  }
  assert.deepEqual([...observedSeats].sort(), data.objects.flatMap(o => o.seats).sort());
  assert.deepEqual([...observedTables].sort(), data.objects.filter(o => o.externalId).map(o => o.externalId).sort());
  const round = data.objects.find(o => o.externalId === 'Table_E3');
  assert.equal(round.size[0], round.size[2]);
  assert.equal(round.accessories, false);
  for (const object of data.objects) assert.ok(object.cameras.every(c => evidence.cameras.includes(c)));
});

test('G17 keeps entry and central access clear, with furniture inside the working crop', () => {
  const shell = buildArchitecture(architecture);
  shell.updateMatrixWorld(true);
  for (const x of [-1, 0, 1]) {
    const hits = new Raycaster(new Vector3(x, .7, 4), new Vector3(0, 0, -1)).intersectObject(shell, true);
    assert.ok(hits.length > 0);
    assert.ok(hits[0].point.z < -2.8, 'Entry must remain open to rear glazing');
  }
  const xs = architecture.footprint.map(p => p[0]), zs = architecture.footprint.map(p => p[1]);
  for (const object of data.objects) {
    const angle = object.yaw*Math.PI/180, [width,,depth] = object.size;
    const ex = (Math.abs(Math.cos(angle))*width+Math.abs(Math.sin(angle))*depth)/2;
    const ez = (Math.abs(Math.sin(angle))*width+Math.abs(Math.cos(angle))*depth)/2;
    assert.ok(object.position[0]-ex >= Math.min(...xs) && object.position[0]+ex <= Math.max(...xs), object.id);
    assert.ok(object.position[2]-ez >= Math.min(...zs) && object.position[2]+ez < 2.85, `${object.id} obstructs entry`);
    if (object.position[2]+ez > -1.5) assert.ok(Math.abs(object.position[0])-ex > 1, `${object.id} obstructs central access`);
  }
});
