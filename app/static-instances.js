import * as THREE from 'three';

function sameGeometry(a,b) {
  if(Object.keys(a.attributes).sort().join(',')!==Object.keys(b.attributes).sort().join(','))return false;
  if(JSON.stringify(a.groups)!==JSON.stringify(b.groups)||JSON.stringify(a.drawRange)!==JSON.stringify(b.drawRange))return false;
  const arrays=g=>[g.index,...Object.keys(g.attributes).sort().map(k=>g.attributes[k])];
  const left=arrays(a),right=arrays(b);
  return left.length===right.length&&left.every((attr,i)=>{
    const other=right[i];if(!attr||!other)return attr===other;
    if(attr.itemSize!==other.itemSize||attr.normalized!==other.normalized||attr.array.constructor!==other.array.constructor||attr.array.length!==other.array.length)return false;
    for(let j=0;j<attr.array.length;j++)if(attr.array[j]!==other.array[j])return false;
    return true;
  });
}

// Samples only choose a bucket. Every attribute/index is compared before sharing.
function geometryBucket(g) {
  return [g.index,...Object.keys(g.attributes).sort().map(k=>g.attributes[k])].map(a=>{
    if(!a)return '-';
    const data=a.array,step=Math.max(1,Math.floor(data.length/24)),samples=[];
    for(let i=0;i<data.length;i+=step)samples.push(data[i]);
    return `${a.itemSize}/${data.length}/${samples.join(',')}`;
  }).join('|');
}

function materialKey(material) {
  const omit=new Set(['id','uuid','name','userData','version','_listeners']);
  return JSON.stringify(Object.fromEntries(Object.keys(material).sort().filter(k=>!omit.has(k)).map(k=>{
    const value=material[k];
    return [k,value?.isTexture?value.uuid:value?.toArray?value.toArray():value];
  })));
}

// Read-only combined maps share exact geometry/materials and submit repeated parts once.
// Source objects stay available for original seat IDs, bounds and ray picking.
export function buildStaticInstances(root,models) {
  root.updateMatrixWorld(true);
  const group=new THREE.Group();group.name='Shared static furniture';
  const buckets=new Map(),canonical=new WeakMap(),materials=new Map(),batches=new Map();
  let sourceMeshes=0,instancedMeshes=0;
  for(const model of models)model.traverse(mesh=>{
    if(!mesh.isMesh||mesh.isInstancedMesh||mesh.userData.animated||Array.isArray(mesh.material)||mesh.material.transparent||
      mesh.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender||
      mesh.material.onBeforeCompile!==THREE.Material.prototype.onBeforeCompile||
      mesh.isSkinnedMesh||Object.keys(mesh.geometry.morphAttributes).length||
      Object.values(mesh.geometry.attributes).some(a=>a.isInterleavedBufferAttribute)||mesh.matrixWorld.determinant()<0)return;
    sourceMeshes++;
    let geometry=canonical.get(mesh.geometry);
    if(!geometry){
      const key=geometryBucket(mesh.geometry),bucket=buckets.get(key)||[];
      geometry=bucket.find(g=>sameGeometry(g,mesh.geometry))||mesh.geometry;
      if(geometry===mesh.geometry){bucket.push(geometry);buckets.set(key,bucket);}
      canonical.set(mesh.geometry,geometry);
      if(geometry!==mesh.geometry)mesh.geometry.dispose();
    }
    mesh.geometry=geometry;
    const key=materialKey(mesh.material);
    if(materials.has(key)){if(materials.get(key)!==mesh.material)mesh.material.dispose();mesh.material=materials.get(key);}
    else materials.set(key,mesh.material);
    // Keep batches local so zooming into one room can cull distant furniture.
    const cell=`${Math.floor(mesh.matrixWorld.elements[12]/8)},${Math.floor(mesh.matrixWorld.elements[14]/8)}`;
    const batchKey=`${cell}/${geometry.uuid}/${mesh.material.uuid}/${mesh.castShadow}/${mesh.receiveShadow}/${mesh.renderOrder}`;
    const batch=batches.get(batchKey)||[];batch.push(mesh);batches.set(batchKey,batch);
  });
  const records=[];
  for(const meshes of batches.values()) {
    if(meshes.length<2)continue;
    const first=meshes[0],instances=new THREE.InstancedMesh(first.geometry,first.material,meshes.length);
    instances.name=first.name||'Repeated furniture component';instances.castShadow=first.castShadow;
    instances.receiveShadow=first.receiveShadow;instances.renderOrder=first.renderOrder;
    // A separate picking layer hides only this draw, preserving unique child parts.
    for(const mesh of meshes)mesh.layers.set(1);
    group.add(instances);records.push({instances,meshes});instancedMeshes+=meshes.length;
  }
  const zero=new THREE.Matrix4().makeScale(0,0,0),inverse=root.matrixWorld.clone().invert(),matrix=new THREE.Matrix4();
  const visible=mesh=>{for(let node=mesh;node;node=node.parent)if(!node.visible)return false;return true;};
  const sync=()=>{
    for(const {instances,meshes}of records){
      meshes.forEach((mesh,i)=>instances.setMatrixAt(i,visible(mesh)?matrix.multiplyMatrices(inverse,mesh.matrixWorld):zero));
      instances.instanceMatrix.needsUpdate=true;instances.computeBoundingSphere();
    }
  };
  root.add(group);sync();
  const dispose=()=>{for(const {instances}of records)instances.dispose();};
  return {group,sync,dispose,stats:{sourceMeshes,instancedMeshes,batches:records.length,savedCalls:instancedMeshes-records.length}};
}

export function createObjectCache(build) {
  const templates=new Map();
  return object=>{
    const {id,name,seats,position,yaw,scale,confidence,sourceBlock,externalId,...appearance}=object;
    // Portrait fallback derives its source image from the saved object ID.
    const key=JSON.stringify({...appearance,portraitFallback:id.match(/portrait-([123])$/)?.[1]});
    if(!templates.has(key))templates.set(key,build(object));
    const model=templates.get(key).clone(true);model.userData.objectId=id;
    // Three.js clones transforms/materials, but drops custom render callbacks.
    const sourceNodes=[];templates.get(key).traverse(node=>sourceNodes.push(node));
    let nodeIndex=0;model.traverse(node=>{
      const source=sourceNodes[nodeIndex++];node.onBeforeRender=source.onBeforeRender;node.onAfterRender=source.onAfterRender;
    });
    // clone() reconstructs Euler angles from the quaternion. A 180° Y turn can
    // become X=π/Z=π; replacing Y alone then adds an unintended extra rotation.
    model.position.fromArray(position);model.rotation.set(0,THREE.MathUtils.degToRad(yaw),0);
    const original=templates.get(key);
    if(!original.userData.cacheScale){original.userData.cacheScale=[...(scale||[1,1,1])];}
    // Root scale contains both reference-size scaling and the editable scale override.
    const sourceScale=original.userData.cacheScale;
    model.scale.copy(original.scale).multiply(new THREE.Vector3(...(scale||[1,1,1]))).divide(new THREE.Vector3(...sourceScale));
    return model;
  };
}
