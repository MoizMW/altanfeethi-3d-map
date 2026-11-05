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
