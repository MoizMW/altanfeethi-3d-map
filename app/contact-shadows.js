import * as THREE from 'three';

// A single inexpensive draw adds soft grounding beneath floor-standing objects.
// This complements the cached directional shadow map and remains visible during orbit.
const supported=new Set(['armchair','sofa','office-chair','table','counter','cabinet','plant','floor-lamp','display-console','privacy-pod','luggage-scale','security-scanner','passport-booth']);
export function buildContactShadows(objects) {
  const sources=objects.filter(o=>supported.has(o.type)&&Math.abs(o.position[1])<.04);
  const material=new THREE.ShaderMaterial({
    name:'Soft contact shadows',transparent:true,depthWrite:false,
    uniforms:{strength:{value:.19}},
    vertexShader:`varying vec2 vContactUv;
      void main(){vContactUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec2 vContactUv;uniform float strength;
      void main(){vec2 p=(vContactUv-.5)*2.0;float r=dot(p,p);
        float alpha=(1.0-smoothstep(.08,1.0,r))*strength;
        if(alpha<.001)discard;gl_FragColor=vec4(.04,.045,.04,alpha);}`,
  });
  const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),material,sources.length);
  mesh.name='Soft floor contact shadows';mesh.userData.floorContactShadow=true;mesh.renderOrder=1;
  const indices=new Map(sources.map((o,i)=>[o.id,i]));
  const position=new THREE.Vector3(),scale=new THREE.Vector3(),matrix=new THREE.Matrix4();
  const rotation=new THREE.Quaternion(),flat=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2);
  const update=(id,pose)=>{
    const index=indices.get(id);if(index===undefined)return;
    position.set(pose.position[0],-.001,pose.position[2]);
    rotation.setFromAxisAngle(new THREE.Vector3(0,1,0),THREE.MathUtils.degToRad(pose.yaw)).multiply(flat);
    scale.set(pose.size[0]*.96*(pose.scale?.[0]??1),pose.size[2]*.96*(pose.scale?.[2]??1),1);
    mesh.setMatrixAt(index,matrix.compose(position,rotation,scale));
    mesh.instanceMatrix.needsUpdate=true;mesh.boundingSphere=null;mesh.boundingBox=null;
  };
  sources.forEach(o=>update(o.id,o));mesh.computeBoundingSphere();
  return {mesh,update};
}

// Place the directional shadow camera above the complete scene, including rooms
// far from the origin. Its position changes; the lighting direction stays the same.
export function fitSceneShadows(light,root) {
  root.updateWorldMatrix(true,true);
  const bounds=new THREE.Box3().setFromObject(root);if(bounds.isEmpty())return;
  const center=bounds.getCenter(new THREE.Vector3()),radius=Math.max(2,bounds.getSize(new THREE.Vector3()).length()/2);
  light.target.position.copy(center);
  light.position.copy(center).addScaledVector(new THREE.Vector3(3,8,5).normalize(),radius*2.5);
  light.updateMatrixWorld();light.target.updateMatrixWorld();
  const camera=light.shadow.camera;camera.position.copy(light.position);camera.lookAt(center);camera.updateMatrixWorld();
  const extent=new THREE.Box3(),point=new THREE.Vector3();
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])
    extent.expandByPoint(point.set(x,y,z).applyMatrix4(camera.matrixWorldInverse));
  const pad=.25;
  Object.assign(camera,{left:extent.min.x-pad,right:extent.max.x+pad,bottom:extent.min.y-pad,top:extent.max.y+pad,
    near:Math.max(.1,-extent.max.z-pad),far:-extent.min.z+pad});
  camera.updateProjectionMatrix();light.shadow.needsUpdate=true;
}
