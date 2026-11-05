import * as THREE from 'three';

// One physical nested set, preserving a single external table identity.
export function buildNestedStoneTable(group,{color='#e5e1d5'}={}) {
  const stone=new THREE.MeshStandardMaterial({color,roughness:.28});
  const brass=new THREE.MeshStandardMaterial({color:'#ab9564',roughness:.35,metalness:.6});
  const add=(geometry,material,x,y,z)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;};
  const roundedTop=(width,depth,radius)=>{
    const x=width/2,z=depth/2,r=radius,outline=new THREE.Shape();
    outline.moveTo(-x+r,-z);outline.lineTo(x-r,-z);
    outline.quadraticCurveTo(x,-z,x,-z+r);outline.lineTo(x,z-r);
    outline.quadraticCurveTo(x,z,x-r,z);outline.lineTo(-x+r,z);
    outline.quadraticCurveTo(-x,z,-x,z-r);outline.lineTo(-x,-z+r);
    outline.quadraticCurveTo(-x,-z,-x+r,-z);
    const geometry=new THREE.ExtrudeGeometry(outline,{depth:.05,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:3,curveSegments:16});
    geometry.rotateX(-Math.PI/2);return geometry;
  };
  add(roundedTop(1.48,.76,.08),stone,0,.42,.12).name='Rounded rectangular stone top';
  for(const x of [-.4,.4])add(new THREE.CylinderGeometry(.19,.19,.42,32),brass,x,.21,.06);
  add(roundedTop(.65,.62,.06),stone,-.30,.32,-.42).name='Lower rounded square stone top';
  add(new THREE.CylinderGeometry(.23,.23,.2925,32),brass,-.30,.14625,-.42);

  return group;
}
