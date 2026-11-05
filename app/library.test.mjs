import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {collectObjectLibrary, objectDesign} from '../scripts/build-object-library.mjs';
import {buildObject} from './object-builders.js';
import {server} from './server.mjs';
import {buildLoungeSofa, loungeSofaColor, sofaPillowColor} from './lounge-sofa.js';

test('shared sofa has full upholstery, light blue piped pillows and connected feet', () => {
  const sofa = buildLoungeSofa(); sofa.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(sofa), size = bounds.getSize(new THREE.Vector3());
  for (const [actual, expected] of [[size.x, 2.05], [size.y, .88], [size.z, .9], [bounds.min.y, 0]]) assert.ok(Math.abs(actual - expected) < 1e-5);
  assert.equal(sofa.getObjectByName('Upholstered lower frame').material.color.getHexString(), loungeSofaColor.slice(1));
  const pillows = sofa.getObjectByName('Decorative pillow'); assert.equal(pillows.children.length, 2);
  for (const pillow of pillows.children) {
    const face = pillow.getObjectByName('Plain light blue woven fabric');
    assert.equal(face.material.color.getHexString(), sofaPillowColor.slice(1));
    assert.equal(face.material.map, null);
    assert.ok(pillow.getObjectByName('Dark contrast pillow piping'));
  }
  const frame = sofa.getObjectByName('Upholstered lower frame');
  for (const leg of sofa.children.filter(node => node.name.startsWith('Connected sofa foot'))) {
    const tip = leg.localToWorld(new THREE.Vector3(0, .075, 0));
    const probe = new THREE.Raycaster(tip.clone().add(new THREE.Vector3(0, -.05, 0)), new THREE.Vector3(0, 1, 0), 0, .06);
    assert.ok(probe.intersectObject(frame).length > 0, 'Foot must enter the upholstered frame');
  }
  assert.equal(buildLoungeSofa({pillow:false}).getObjectByName('Decorative pillow'), undefined);
});
import {buildCurvedArmchair, loungeChairColor, pillowFabricUV, loungePillowTexturePath} from './curved-armchair.js';

test('curved chair preserves the reference envelope and connects cushions to supports', () => {
  for (const pillow of [true, false]) {
    const chair = buildCurvedArmchair({pillow}); chair.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(chair), size = bounds.getSize(new THREE.Vector3());
    for (const [actual, expected] of [[size.x, .88], [size.y, .9], [size.z, .92], [bounds.min.y, 0]]) assert.ok(Math.abs(actual - expected) < 1e-5);
    assert.equal(Boolean(chair.getObjectByName('Decorative pillow')), pillow);
    const shell = chair.getObjectByName('Continuous curved back and low arms');
    assert.equal(shell.material.color.getHexString(), loungeChairColor.slice(1));
    assert.equal(shell.material.metalness, 0);
    const positions = shell.geometry.attributes.position;
    for (const index of [positions.count - 2, positions.count - 1]) {
      const cap = shell.localToWorld(new THREE.Vector3().fromBufferAttribute(positions, index));
      const outward = new THREE.Vector3(index === positions.count - 2 ? -.15 : .15, -1.15, 1).normalize();
      const ray = new THREE.Raycaster(cap.clone().addScaledVector(outward, .12), outward.clone().negate(), 0, .14);
      assert.ok(ray.intersectObject(shell).some(hit => hit.face.normal.clone().transformDirection(shell.matrixWorld).dot(outward) > .3),
        'Both downturned arm ends must have visible outward-facing upholstery caps');
    }
    const seat = new THREE.Box3().setFromObject(chair.getObjectByName('Shaped upholstered seat cushion'));
    for (const leg of chair.children.filter(node => node.name.startsWith('Tapered timber leg'))) {
      const support = new THREE.Box3().setFromObject(leg);
      assert.ok(support.max.y >= seat.min.y && support.max.y <= seat.max.y, 'Leg must meet the cushion underside');
      const attachment = leg.localToWorld(new THREE.Vector3(0, leg.geometry.parameters.height / 2, 0));
      const probe = new THREE.Raycaster(attachment.clone().add(new THREE.Vector3(0, -.09, 0)), new THREE.Vector3(0, 1, 0), 0, .10);
      assert.ok(probe.intersectObject(chair.getObjectByName('Shaped upholstered seat cushion')).length > 0,
        `${leg.name}: timber attachment must penetrate the actual seat geometry, not just its bounding box`);
    }
    if (pillow) {
      const cushion = new THREE.Box3().setFromObject(chair.getObjectByName('Decorative pillow'));
      assert.ok(cushion.min.y <= seat.max.y + .025 && cushion.min.y > seat.min.y, 'Pillow must rest on the seat');
    }
  }
});

test('clean pillow fabric maps directly without photographed perspective distortion', () => {
  for (let y = 0; y <= 16; y++) for (let x = 0; x <= 16; x++) {
    const uv = pillowFabricUV(x / 16, y / 16);
    assert.ok(uv.every(value => Number.isFinite(value) && value >= 0 && value <= 1));
    assert.deepEqual(uv, [x / 16, y / 16]);
  }
  assert.deepEqual(pillowFabricUV(0, 0), [0, 0]);
});

test('active pillow fabric is the high resolution generated asset', async () => {
  assert.ok(loungePillowTexturePath.endsWith('/pillow-botanical-clean.png'));
  const png = await readFile(new URL(`..${loungePillowTexturePath}`, import.meta.url));
  assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
  assert.ok(png.readUInt32BE(16) >= 1024 && png.readUInt32BE(20) >= 1024, 'Use the clean generated texture rather than the old cropped screenshot');
});

test('seat has a padded crown and rounded front instead of a flat extruded slab', () => {
  const chair = buildCurvedArmchair({pillow: false}); chair.updateMatrixWorld(true);
  const seat = chair.getObjectByName('Shaped upholstered seat cushion');
  const surface = z => new THREE.Raycaster(new THREE.Vector3(.02, .8, z), new THREE.Vector3(0, -1, 0)).intersectObject(seat)[0];
  const center = surface(.05), front = surface(.43);
  assert.ok(center && front, 'Seat must have an outward-facing top surface');
  assert.ok(center.point.y - front.point.y > .01, 'Upholstery must roll down toward the front');
  assert.ok(chair.getObjectByName('Fine upholstery seam around back and arms'));
});

test('upholstery normals remain continuous across the shell seam and cushion bevels', () => {
  const chair = buildCurvedArmchair();
  for (const name of ['Continuous curved back and low arms', 'Shaped upholstered seat cushion']) {
    const {position, normal} = chair.getObjectByName(name).geometry.attributes;
    const seen = new Map(); let sharedVertices = 0;
    for (let i = 0; i < position.count; i++) {
      const key = [position.getX(i), position.getY(i), position.getZ(i)].map(value => Math.round(value * 1e6)).join('/');
      const direction = new THREE.Vector3().fromBufferAttribute(normal, i);
      assert.ok(Math.abs(direction.length() - 1) < 1e-5, `${name}: normal must be normalized`);
      if (seen.has(key)) {
        assert.ok(direction.distanceTo(seen.get(key)) < 1e-6, `${name}: duplicated positions must not leave a shading seam`);
        sharedVertices++;
      } else seen.set(key, direction);
    }
    assert.ok(sharedVertices > 0, `${name}: expected duplicated seam or bevel vertices`);
  }
});

test('library accounts for every saved placement once and preserves distinct configurations', async () => {
  const library = await collectObjectLibrary();
  assert.equal(library.totals.placements, library.blocks.reduce((n, block) => n + block.count, 0));
  const seen = new Set();
  for (const asset of library.assets) {
    assert.equal(asset.count, asset.configurations.reduce((n, config) => n + config.usages.length, 0));
    for (const config of asset.configurations) {
      assert.deepEqual(objectDesign(config.preview), asset.design);
      for (const usage of config.usages) {
        const key = `${usage.block}/${usage.objectId}`;
        assert.ok(!seen.has(key), `Duplicate placement: ${key}`); seen.add(key);
      }
    }
  }
  for (const block of library.blocks) {
    const source = JSON.parse(await readFile(new URL(`../blocks/${block.key}/objects.json`, import.meta.url)));
    for (const object of source.objects) assert.ok(seen.has(`${block.key}/${object.id}`));
  }
  assert.equal(seen.size, library.totals.placements);
  assert.ok(library.assets.find(asset => asset.design.type === 'armchair' && asset.design.variant === 'default').configurations.length > 1);
  const portraits = library.assets.find(asset => asset.design.variant === 'reception-portrait');
  assert.deepEqual([...new Set(portraits.configurations.map(config => config.appearance.portraitIndex))].sort(), ['1', '2', '3']);
  for (const config of portraits.configurations) assert.ok(config.preview.id.endsWith(`portrait-${config.appearance.portraitIndex}`));
});

test('design identity ignores placements and colors but separates construction and mount variants', () => {
  const source = {type: 'armchair', color: '#627d86', id: 'a', position: [0, 0, 0], yaw: 0};
  assert.deepEqual(objectDesign(source), objectDesign({...source, id: 'b', color: '#eeeeee', position: [10, 0, 5], yaw: 90}));
  assert.deepEqual(objectDesign({...source, shape: 'square'}), objectDesign({...source, variant: 'default', shape: 'square'}));
  assert.notDeepEqual(objectDesign(source), objectDesign({...source, variant: 'shell-lounge'}));
  assert.notDeepEqual(objectDesign({type: 'display', mount: 'wall'}), objectDesign({type: 'display', mount: 'desk'}));
});

test('every saved configuration builds nonempty finite geometry through the shared renderer', async () => {
  const library = await collectObjectLibrary();
  for (const asset of library.assets) for (const config of asset.configurations) {
    const before = JSON.stringify(config.preview), model = buildObject(config.preview);
    assert.equal(JSON.stringify(config.preview), before, `${asset.name}: builder changed source data`);
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    assert.ok(!bounds.isEmpty(), `${asset.name}: empty model`);
    assert.ok([...bounds.min, ...bounds.max].every(Number.isFinite), `${asset.name}: invalid bounds`);
    model.traverse(node => {
      if (node.geometry) {
        assert.ok([...node.geometry.attributes.position.array].every(Number.isFinite), `${asset.name}: invalid vertices`);
        node.geometry.dispose();
      }
      for (const material of node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : []) material.dispose();
    });
  }
});

test('saved inventory matches current source blocks', async () => {
  const saved = JSON.parse(await readFile(new URL('../shared/assets/library/inventory.json', import.meta.url)));
  assert.deepEqual(saved, await collectObjectLibrary());
});

test('server serves the live library and preview dependencies without exposing private source files', async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(`${origin}/api/object-library`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), await collectObjectLibrary());
    for (const path of ['library.html', 'library.js', 'library.css', 'object-builders.js', 'curved-armchair.js', 'lounge-sofa.js', 'floors.js', 'floor-materials.js', 'floor-reflections.js', 'render-profile.js', 'render-loop.js', 'static-instances.js', 'contact-shadows.js', 'shared/assets/branding/reception-wall.svg', 'shared/materials/textures/dark-stone-floor/basecolor.png', 'shared/materials/textures/pale-stone-floor/basecolor.png', 'shared/materials/textures/lounge-pillow/pillow-botanical-clean.png', 'shared/assets/library/inventory.json']) {
      assert.equal((await fetch(`${origin}/${path}`)).status, 200, path);
    }
    for (const path of ['scripts/build-object-library.mjs', 'shared/assets/library/README.md', 'server.mjs']) {
      assert.equal((await fetch(`${origin}/${path}`)).status, 404, path);
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
});
