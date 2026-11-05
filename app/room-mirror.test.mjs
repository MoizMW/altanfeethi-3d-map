import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildObject} from './object-builders.js';
import {createObjectCache,buildStaticInstances} from './static-instances.js';

test('oval mirrors capture once per placement, avoid recursion and release the capture',()=>{
  const build=createObjectCache(buildObject),scene=new THREE.Scene();
  const object={id:'mirror-1',type:'wall-panel',variant:'oval-mirror',color:'#5a5149',size:[.85,1.2,.08],position:[0,0,0],yaw:0};
  const models=[build(object),build({...object,id:'mirror-2',position:[2,0,0]})];
  scene.add(...models);buildStaticInstances(scene,models);
  const mirrors=[];scene.traverse(node=>{if(node.userData.roomMirror)mirrors.push(node);});
  assert.equal(mirrors.length,2);assert.notEqual(mirrors[0].material,mirrors[1].material);
  assert.equal(mirrors[0].material.color.getHexString(),'ffffff');
  const renderer={shadowMap:{autoUpdate:true,needsUpdate:true}},update=THREE.CubeCamera.prototype.update;
  let captures=0,disposed=0;
  THREE.CubeCamera.prototype.update=function(){
    captures++;assert.ok(mirrors.every(m=>!m.visible));
    assert.equal(renderer.shadowMap.needsUpdate,false);
    this.renderTarget.addEventListener('dispose',()=>disposed++);
    mirrors[1].onBeforeRender(renderer,scene);
  };
  try {
    for(const mirror of mirrors){mirror.onBeforeRender(renderer,scene);mirror.onBeforeRender(renderer,scene);}
    assert.equal(captures,2);assert.ok(mirrors.every(m=>m.visible));
    assert.equal(renderer.shadowMap.autoUpdate,true);assert.equal(renderer.shadowMap.needsUpdate,true);
    assert.notEqual(mirrors[0].material.envMap,mirrors[1].material.envMap);
    for(const mirror of mirrors)mirror.material.dispose();
    assert.equal(disposed,2);
  }finally{THREE.CubeCamera.prototype.update=update;}
});
