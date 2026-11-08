import * as THREE from 'three';

// buildFloors places the upper slab's underside 0.14 m below its floor datum.
// Leave a further 0.01 m gap so wall caps cannot flicker through that slab.
export const floorCeilingHeight=elevation=>elevation-.15;

// Apply only to the lower floor, never to the inter-floor stair assembly.
// Clone materials because floor finishes can be shared by both floor models.
export function clipBelowUpperFloor(group,elevation){
  const plane=new THREE.Plane(new THREE.Vector3(0,-1,0),floorCeilingHeight(elevation));
  const materials=new Map();
  function clipped(source){
    if(!materials.has(source)){
      const material=source.clone();
      material.onBeforeCompile=source.onBeforeCompile;
      material.customProgramCacheKey=source.customProgramCacheKey;
      material.clippingPlanes=[...(source.clippingPlanes||[]),plane];
      material.clipShadows=true;
      material.needsUpdate=true;
      materials.set(source,material);
    }
    return materials.get(source);
  }
  group.traverse(node=>{
    if(node.isMesh)node.material=Array.isArray(node.material)?node.material.map(clipped):clipped(node.material);
  });
  return plane;
}

// Animated screens remain dynamic after static furniture batching. Respect hidden
// floors and the camera frustum so an idle overview only repaints visible media.
export function hasVisibleAnimatedScreens(screens,camera,{hidden=false,reducedMotion=false}={}){
 if(hidden||reducedMotion||!screens.length)return false;
 camera.updateMatrixWorld();
 const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 return screens.some(screen=>{
  for(let node=screen;node;node=node.parent)if(!node.visible)return false;
  screen.updateWorldMatrix(true,false);return frustum.intersectsObject(screen);
 });
}
