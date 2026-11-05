import * as THREE from 'three';

const capturing=new WeakSet();

// Each physical mirror owns one room capture, reused while the viewer moves.
export function attachRoomMirror(mesh) {
  mesh.userData.roomMirror=true;
  let target;
  mesh.onBeforeRender=function(renderer,scene){
    if(target||capturing.has(scene))return;
    target=new THREE.WebGLCubeRenderTarget(256,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
    const camera=new THREE.CubeCamera(.025,100,target),hidden=[];
    this.getWorldPosition(camera.position);
    // Offset beyond the glass so the capture cannot see its backing or the wall.
    camera.position.addScaledVector(new THREE.Vector3(0,1,0).transformDirection(this.matrixWorld),.025);
    scene.traverse(node=>{if(node.visible&&node.userData.roomMirror){hidden.push(node);node.visible=false;}});
    capturing.add(scene);
    const shadowAuto=renderer.shadowMap.autoUpdate,shadowDirty=renderer.shadowMap.needsUpdate;
    try {
      renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=false;
      camera.update(renderer,scene);
      this.material.envMap=target.texture;
      this.material.needsUpdate=true;
    } catch(error) {
      target.dispose();target=undefined;throw error;
    } finally {
      renderer.shadowMap.autoUpdate=shadowAuto;renderer.shadowMap.needsUpdate=shadowDirty;
      capturing.delete(scene);for(const node of hidden)node.visible=true;
    }
  };
  mesh.material.addEventListener('dispose',()=>{target?.dispose();target=undefined;});
  return mesh;
}
