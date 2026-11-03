import * as THREE from 'three';

// One physical nested set, preserving a single external table identity.
export function buildNestedStoneTable(group,{color='#e5e1d5',accessories=true}={}) {
  const stone=new THREE.MeshStandardMaterial({color,roughness:.28});
  const brass=new THREE.MeshStandardMaterial({color:'#ab9564',roughness:.35,metalness:.6});
  const add=(geometry,material,x,y,z)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;};
  const outline=new THREE.Shape();
  outline.moveTo(-.68,-.2);
  outline.bezierCurveTo(-.9,-.12,-.7,.38,-.37,.43);
  outline.bezierCurveTo(.03,.58,.7,.45,.71,.12);
  outline.bezierCurveTo(.76,-.28,.42,-.42,.24,-.2);
  outline.bezierCurveTo(.03,.04,-.3,-.26,-.68,-.2);
  const top=new THREE.ExtrudeGeometry(outline,{depth:.055,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2,curveSegments:24});
  top.rotateX(-Math.PI/2);
  add(top,stone,0,.42,.12);
  for(const x of [-.4,.4])add(new THREE.CylinderGeometry(.19,.19,.42,32),brass,x,.21,.06);
  add(new THREE.CylinderGeometry(.35,.35,.055,48),stone,-.08,.32,-.42);
  add(new THREE.CylinderGeometry(.23,.23,.2925,32),brass,-.08,.14625,-.42);
  if(accessories){
    add(new THREE.BoxGeometry(.17,.15,.17),new THREE.MeshStandardMaterial({color:'#8a5437'}),.1,.55,.2);
    add(new THREE.BoxGeometry(.06,.09,.035),new THREE.MeshStandardMaterial({color:'#f1eee3'}),.1,.65,.2);
  }
  return group;
}
