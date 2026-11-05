import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import * as THREE from 'three';
import {composeLayout} from './layouts.mjs';
import {buildArchitecture} from './architecture.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const load=async key=>{
  const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));
  return {block:{...m,architecture:a,placement:a.placement,floorSize:a.floorSize,ceilingHeight:a.ceilingHeight,objects:o.objects,evidence:e}};
};
const layout=JSON.parse(await readFile(new URL('../layouts/first/bottom-right.json',import.meta.url)));

test('first-floor bottom-right row preserves source identities and places G35 rightmost',async()=>{
  const {block}=await composeLayout(root,'first/bottom-right',load);
  assert.equal(block.floor,'first');assert.equal(block.readOnly,true);
  assert.equal(block.objects.filter(item=>item.type!=='tissue-box').length,21);
  const seats=block.objects.flatMap(o=>o.seats);assert.equal(seats.length,16);assert.equal(new Set(seats).size,16);
  const tables=block.objects.filter(o=>o.externalId).map(o=>o.externalId).sort();assert.deepEqual(tables,['Table_H1','Table_H2','Table_H3','Table_H4']);
  const ordered=[...layout.components].sort((a,b)=>a.position[0]-b.position[0]);
  assert.deepEqual(ordered.map(p=>p.block),['first/g38','first/g37','first/g36','first/g35']);
  for(const part of layout.components){
    const source=(await load(part.block)).block;
    const angle=part.yaw*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
    for(const saved of source.objects){
      const combined=block.objects.find(o=>o.id===saved.id);assert.ok(combined);
      for(const field of ['size','scale','seats','color','externalId'])assert.deepEqual(combined[field],saved[field]);
      const [x,y,z]=saved.position;
      const expected=[c*x+s*z+part.position[0],y+part.position[1],-s*x+c*z+part.position[2]];
      expected.forEach((v,i)=>assert.ok(Math.abs(combined.position[i]-v)<1e-8));
      assert.equal(combined.yaw,saved.yaw+part.yaw);assert.equal(combined.sourceBlock,part.block);
    }
  }
});

test('first-floor composition joins floors, retains four rugs and owns every seam once',async()=>{
  const {block}=await composeLayout(root,'first/bottom-right',load),a=block.architecture;
  assert.equal(a.floorSections.length,4);assert.equal(a.circulations.length,4);
  assert.equal(new Set(a.circulations.map(p=>p.sourceBlock)).size,4);
  const spans=a.floorSections.map(f=>({min:f.center[0]-f.size[1]/2,max:f.center[0]+f.size[1]/2})).sort((a,b)=>a.min-b.min);
  for(let i=1;i<spans.length;i++)assert.ok(Math.abs(spans[i-1].max-spans[i].min)<1e-8,'Floors must meet with no gaps/overlap');
  for(const part of layout.components)for(const id of part.excludeWalls)assert.ok(!a.walls.some(w=>w.id===id));
  const screens=a.walls.filter(w=>w.variant==='reeded-divider');assert.equal(screens.length,3);
  assert.deepEqual(screens.map(w=>w.start[0]).sort((a,b)=>a-b),[-12.5,-7.5,-2.5]);
  assert.equal(a.walls.filter(w=>w.id==='first-bottom-right-wood-back').length,1);
  assert.equal(a.walls.filter(w=>w.id==='first-bottom-right-glass-guard').length,1);
  assert.equal(a.walls.length,7);
  assert.ok(a.walls.some(w=>w.id==='g35-sofa-backing'));assert.ok(a.walls.some(w=>w.id==='g38-sofa-wood-wall'));
});

test('all four lounges connect along an unobstructed access strip in full and low-wall views',async()=>{
  const {block}=await composeLayout(root,'first/bottom-right',load);
  for(const cutaway of [false,true]){
    const shell=buildArchitecture(block.architecture,{cutaway});shell.updateMatrixWorld(true);
    for(const z of [1.35,1.65,1.95]){
      const ray=new THREE.Raycaster(new THREE.Vector3(-16.3,.7,z),new THREE.Vector3(1,0,0),0,17.8);
      assert.equal(ray.intersectObject(shell,true).filter(hit=>hit.object.isMesh).length,0);
    }
  }
  for(const o of block.objects){
    const angle=o.yaw*Math.PI/180,[w,,d]=o.size;
    const dx=(Math.abs(Math.cos(angle))*w+Math.abs(Math.sin(angle))*d)/2;
    const dz=(Math.abs(Math.sin(angle))*w+Math.abs(Math.cos(angle))*d)/2;
    if(o.position[0]+dx>-16.3&&o.position[0]-dx<1.5)assert.ok(o.position[2]+dz<=1.25||o.position[2]-dz>=2.05,`${o.id} blocks access`);
  }
});
