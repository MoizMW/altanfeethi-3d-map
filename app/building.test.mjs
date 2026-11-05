import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {composeBuilding,transformPoint} from './building.mjs';
import {buildArchitecture} from './architecture.js';
import * as THREE from 'three';
import {server} from './server.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const load=async key=>{const [m,a,o,e]=await Promise.all(['manifest','architecture','objects','evidence'].map(async f=>JSON.parse(await readFile(new URL(`../blocks/${key}/${f}.json`,import.meta.url)))));return {block:{...m,architecture:a,floorSize:a.floorSize,objects:o.objects,evidence:e}};};

test('Building aligns at one ground landing and keeps a single continuous flight',async()=>{
 const data=await composeBuilding(root,load),c=data.connector;
 const foot=transformPoint([c.endX,c.escalatorZ],c.yaw,c.position);
 assert.ok(Math.hypot(foot[0]-data.alignment.groundAnchor[0],foot[1]-data.alignment.groundAnchor[2])<1e-8);
 assert.equal(c.position[1]-c.drop,0);
 assert.equal(data.floors[0].block.architecture.structures.length,0);
 assert.equal(data.floors[1].block.architecture.structures.length,0);
 const stair=buildArchitecture({structures:[c]});stair.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(stair);
 assert.ok(bounds.max.x<-53.78,'Flight does not pass through the G17/front-room shared wall');
 assert.ok(bounds.min.x>-65.48&&bounds.max.z<9.8);
 const returnWall=data.floors[0].block.architecture.walls.find(w=>w.id==='g19-core-return');
 const wall=buildArchitecture({walls:[returnWall]});wall.updateMatrixWorld(true);
 const wallBounds=new THREE.Box3().setFromObject(wall);
 stair.traverse(mesh=>{if(mesh.isMesh)assert.equal(new THREE.Box3().setFromObject(mesh).intersectsBox(wallBounds),false,'No flight mesh intersects the core return');});
 const bridge=data.floors[1].block.architecture.floorSections.find(s=>s.id==='building-upper-landing-bridge');
 assert.ok(bridge.size.every(v=>v>0));
 const localLanding=transformPoint([c.startX,c.escalatorZ],c.yaw,c.position);
 const first=data.floors[1],center=transformPoint(bridge.center,first.yaw,first.position);
 assert.ok(Math.abs(localLanding[0]-center[0])<bridge.size[0]/2+.01,'Bridge reaches the top of the shared flight');
});

test('Building loads saved furniture without rewriting source floor files or scaling poses',async()=>{
 const files=['layouts/ground/b-g-lounges.json','layouts/first/center-right.json','blocks/ground/g19/architecture.json'];
 const before=await Promise.all(files.map(f=>readFile(new URL('../'+f,import.meta.url),'utf8')));
 const data=await composeBuilding(root,load);
 const seats=data.floors.flatMap(f=>f.block.objects.flatMap(o=>o.seats));assert.equal(new Set(seats).size,seats.length);
 assert.equal(data.floors[1].yaw,-90);
 assert.deepEqual(await Promise.all(files.map(f=>readFile(new URL('../'+f,import.meta.url),'utf8'))),before);
 for(const floor of data.floors)assert.equal(floor.block.readOnly,true);
});

test('Dashboard API and static assets load and the building endpoint is read-only',async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{const url=`http://127.0.0.1:${server.address().port}`;
 for(const path of ['/building.html','/building.js','/building.css','/api/building']){const r=await fetch(url+path);assert.equal(r.status,200);if(path==='/api/building')assert.equal((await r.json()).floors.length,2);else await r.text();}
 assert.equal((await fetch(url+'/api/building',{method:'POST'})).status,405);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
