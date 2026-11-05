import * as THREE from 'three';
import {floorReflection} from './floor-materials.js';

// A single shared horizontal capture, bounded to 512px. Supports both editor cameras.
// Floor materials sample a softened mip level, never a sharp mirror or baked photograph.
export function createFloorReflections(renderer,scene,root,helpers=[],{size=512}={}) {
  const target=new THREE.WebGLRenderTarget(size,size,{
    type:THREE.HalfFloatType, minFilter:THREE.LinearMipmapLinearFilter,generateMipmaps:true,
  });
  floorReflection.map.value=target.texture;
  const bias=new THREE.Matrix4().set(.5,0,0,.5, 0,.5,0,.5, 0,0,.5,.5, 0,0,0,1);
  let mirror,dirty=true,enabled=true,lastCamera,lastState='';
  const invalidate=()=>{dirty=true;};
  THREE.DefaultLoadingManager.onLoad=invalidate;
  return {
    invalidate,
    setEnabled(value){
      if(value&&!enabled)dirty=true;
      enabled=value;if(!enabled)floorReflection.ready.value=0;
    },
    update(camera) {
      if(!enabled)return false;
      camera.updateMatrixWorld();
      const state=[...camera.matrixWorld.elements,...camera.projectionMatrix.elements].join(',');
      if(!dirty&&lastCamera===camera&&lastState===state)return;
      if(!root.children.length)return;
      if(!mirror||lastCamera!==camera)mirror=camera.clone();
      dirty=false;lastCamera=camera;lastState=state;
      const planeY=-.012,normal=new THREE.Vector3(0,1,0);
      const position=camera.getWorldPosition(new THREE.Vector3());
      const aim=position.clone().add(camera.getWorldDirection(new THREE.Vector3()));
      position.y=2*planeY-position.y;aim.y=2*planeY-aim.y;
      mirror.position.copy(position);mirror.up.copy(camera.up).reflect(normal);mirror.lookAt(aim);
      mirror.updateMatrixWorld();mirror.projectionMatrix.copy(camera.projectionMatrix);
      floorReflection.matrix.value.copy(bias).multiply(mirror.projectionMatrix).multiply(mirror.matrixWorldInverse);
      // General oblique near-plane clipping: valid for perspective AND orthographic projections.
      const plane=new THREE.Plane(normal,-planeY).applyMatrix4(mirror.matrixWorldInverse);
      const clip=new THREE.Vector4(plane.normal.x,plane.normal.y,plane.normal.z,plane.constant);
      const q=new THREE.Vector4(Math.sign(clip.x),Math.sign(clip.y),1,1).applyMatrix4(mirror.projectionMatrix.clone().invert());
      clip.multiplyScalar(2/clip.dot(q));
      const p=mirror.projectionMatrix.elements;
      p[2]=clip.x-p[3];p[6]=clip.y-p[7];p[10]=clip.z-p[11];p[14]=clip.w-p[15];
      mirror.projectionMatrixInverse.copy(mirror.projectionMatrix).invert();
      const hidden=[];
      root.traverse(node=>{
        const materials=Array.isArray(node.material)?node.material:[node.material];
        if(node.visible&&(materials.some(m=>m?.userData?.floorFinish)||node.userData.floorContactShadow)){hidden.push(node);node.visible=false;}
      });
      for(const node of helpers)if(node.visible){hidden.push(node);node.visible=false;}
      const previous=renderer.getRenderTarget(),shadowAuto=renderer.shadowMap.autoUpdate,xr=renderer.xr.enabled;
      try {
        renderer.xr.enabled=false;renderer.shadowMap.autoUpdate=false;
        renderer.setRenderTarget(target);renderer.render(scene,mirror);
        floorReflection.ready.value=1;
      } finally {
        renderer.setRenderTarget(previous);renderer.shadowMap.autoUpdate=shadowAuto;renderer.xr.enabled=xr;
        for(const node of hidden)node.visible=true;
      }
      return true;
    },
    dispose(){target.dispose();floorReflection.map.value=null;floorReflection.ready.value=0;},
  };
}
