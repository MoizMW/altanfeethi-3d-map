import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {buildCurvedArmchair} from './curved-armchair.js';

// Same connected chair/support contract, with the observed G45 leather finish.
export function buildLeatherPrivacyChair(color='#4c4140'){
  const group=buildCurvedArmchair({color,pillow:false});
  group.name='Leather privacy lounge chair';
  const leather=new THREE.MeshPhysicalMaterial({color,roughness:.48,metalness:0,sheen:0,clearcoat:.06,clearcoatRoughness:.65});
  const replaced=new Set();
  group.traverse(node=>{if(node.isMesh&&node.material?.isMeshPhysicalMaterial){replaced.add(node.material);node.material=leather;}});
  for(const material of replaced)material.dispose();
  return group;
}

// Reuse the curved shell and star base with separate upholstery and shell finishes.
export function buildShellLoungeChair({color='#eeeadd',shellColor='#a48246'}={}) {
  const group=buildEggChair(shellColor);
  const cushion=group.getObjectByName('Oval seat cushion');
  cushion.material=new THREE.MeshStandardMaterial({color,roughness:.85});
  const back=new THREE.Mesh(new RoundedBoxGeometry(.5,.36,.12,3,.045),cushion.material);
  back.name='Light back cushion';back.position.set(0,.65,-.235);back.rotation.x=-.12;
  back.castShadow=true;back.receiveShadow=true;group.add(back);
  return group;
}

// Normalized to the existing armchair reference size: .88 x .9 x .92 m, facing +Z.
export function buildEggChair(color) {
  const group = new THREE.Group();
  const leather = new THREE.MeshStandardMaterial({color, roughness: .43, metalness: .04});
  const metal = new THREE.MeshStandardMaterial({color: '#484a43', roughness: .3, metalness: .7});
  const seamColor = new THREE.Color(color).multiplyScalar(.78);
  const seam = new THREE.MeshStandardMaterial({color: seamColor, roughness: .55});
  const add = (geometry, material, position = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.fromArray(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  const smoothstep = value => {
    const t = THREE.MathUtils.clamp(value, 0, 1);
    return t*t*(3-2*t);
  };
  const point = (u, v, offset) => {
    const angle = u*2.25;
    const top = .86+.04*Math.cos(angle)-.34*smoothstep((Math.abs(u)-.45)/.55);
    const radiusX = .30+.11*v+.035*Math.sin(Math.PI*v)+offset;
    const radiusZ = .29+.07*v+offset;
    return new THREE.Vector3(
      Math.sin(angle)*radiusX,
      .25+(top-.25)*v,
      -Math.cos(angle)*radiusZ+.04-.07*v
    );
  };

  // A closed, padded shell wraps continuously from the back into both arms.
  const columns = 64, rows = 32, stride = columns+1, sideSize = stride*(rows+1);
  const positions = [], indices = [];
  for (const offset of [.023, -.023]) {
    for (let row=0; row<=rows; row++) for (let col=0; col<=columns; col++) {
      positions.push(...point(col/columns*2-1, row/rows, offset).toArray());
    }
  }
  for (let side=0; side<2; side++) {
    const start = side*sideSize;
    for (let row=0; row<rows; row++) for (let col=0; col<columns; col++) {
      const a=start+row*stride+col, b=a+1, c=a+stride, d=c+1;
      if (side===0) indices.push(a,c,b,b,c,d);
      else indices.push(a,b,c,b,d,c);
    }
  }
  const edge = [];
  for (let col=0; col<=columns; col++) edge.push(col);
  for (let row=1; row<=rows; row++) edge.push(row*stride+columns);
  for (let col=columns-1; col>=0; col--) edge.push(rows*stride+col);
  for (let row=rows-1; row>0; row--) edge.push(row*stride);
  for (let i=0; i<edge.length; i++) {
    const a=edge[i], b=edge[(i+1)%edge.length];
    indices.push(a,b,a+sideSize,b,b+sideSize,a+sideSize);
  }
  const shell = new THREE.BufferGeometry();
  shell.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  shell.setIndex(indices);
  shell.computeVertexNormals();
  add(shell, leather).name = 'Curved upholstered shell';

  const ellipsoid = (name, position, size) => {
    const mesh = add(new THREE.SphereGeometry(1, 48, 24), leather, position);
    mesh.name = name;
    mesh.scale.fromArray(size);
    return mesh;
  };
  ellipsoid('Rounded seat bowl', [0, .275, .045], [.35, .12, .36]);
  ellipsoid('Oval seat cushion', [0, .365, .075], [.29, .065, .285]);

  const lip = Array.from({length: 81}, (_, i) => point(i/80*2-1, 1, .024));
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lip), 100, .004, 6, false), seam);
  const cushionSeam = Array.from({length: 81}, (_, i) => {
    const angle=i/80*Math.PI*2;
    return new THREE.Vector3(Math.cos(angle)*.288, .37, .075+Math.sin(angle)*.283);
  });
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cushionSeam, true), 96, .003, 6, true), seam);

  add(new THREE.CylinderGeometry(.027, .035, .21, 20), metal, [0, .16, 0]);
  for (let i=0; i<4; i++) {
    const angle=Math.PI/4+i*Math.PI/2;
    const start=new THREE.Vector3(0, .10, 0);
    const end=new THREE.Vector3(Math.cos(angle)*.38, .025, Math.sin(angle)*.38);
    const direction=end.clone().sub(start);
    const leg=add(new THREE.CylinderGeometry(.018, .023, direction.length(), 12), metal,
      start.clone().add(end).multiplyScalar(.5).toArray());
    leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  }
  return group;
}
