import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// Opt-in variants reuse existing object types and the shared placement/save contract.
export const privateLoungeSizes={
  'tub-chair':[.88,.9,.92],
  'organic-stone':[1.5,.42,.78],
  'oval-mirror':[.8,1.2,.08],
};

export function buildPrivateLoungeObject(o){
  const group=new THREE.Group();
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.65,...extra});
  const add=(geometry,mat,p=[0,0,0])=>{const mesh=new THREE.Mesh(geometry,mat);mesh.position.fromArray(p);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;};
  const box=(size,p,mat,r=.035)=>add(new RoundedBoxGeometry(...size,3,Math.min(r,...size.map(v=>v/3))),mat,p);
  const fabric=material(o.color),dark=material('#303b3a'),brass=material('#ab9564',{metalness:.6,roughness:.35});
  if(o.type==='armchair'&&o.variant==='tub-chair'){
    box([.81,.2,.79],[0,.31,.015],fabric,.085);
    box([.65,.14,.64],[0,.46,.07],fabric,.065);
    // One padded U-shaped shell connects the rear backrest and both arms.
    const shell=new THREE.Shape();
    shell.absarc(0,0,.43,0,Math.PI,false);
    shell.lineTo(-.32,0);shell.absarc(0,0,.32,Math.PI,0,true);shell.closePath();
    const geometry=new THREE.ExtrudeGeometry(shell,{depth:.43,bevelEnabled:true,bevelThickness:.025,bevelSize:.02,bevelSegments:3,curveSegments:40});
    geometry.rotateX(-Math.PI/2);
    add(geometry,fabric,[0,.41,.025]);
    const cushion=box([.57,.32,.12],[0,.64,-.25],fabric,.055);cushion.rotation.x=-.12;
    for(const x of [-.29,.29])for(const z of [-.28,.29])box([.045,.23,.045],[x,.115,z],dark,.008);
  }else if(o.type==='table'&&o.variant==='organic-stone'){
    const stone=material(o.color,{roughness:.28}),outline=new THREE.Shape();
    outline.moveTo(-.70,-.12);
    outline.bezierCurveTo(-.85,.05,-.61,.32,-.36,.33);
    outline.bezierCurveTo(.05,.43,.73,.31,.72,.04);
    outline.bezierCurveTo(.71,-.28,.40,-.33,.22,-.13);
    outline.bezierCurveTo(.02,.08,-.37,-.26,-.70,-.12);
    const top=new THREE.ExtrudeGeometry(outline,{depth:.055,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2,curveSegments:32});top.rotateX(-Math.PI/2);
    add(top,stone,[0,.39,.02]);
    for(const x of [-.36,.36])add(new THREE.CylinderGeometry(.17,.17,.39,32),brass,[x,.195,-.02]);
    add(new THREE.CylinderGeometry(.235,.235,.05,48),stone,[-.08,.31,.23]);
    add(new THREE.CylinderGeometry(.18,.18,.285,32),brass,[-.08,.1425,.23]);
    if(o.accessories!==false){
      box([.17,.15,.17],[.10,.53,-.10],material('#8a5437'),.012);
      box([.06,.09,.035],[.10,.64,-.10],material('#f1eee3'),.01);
    }
  }else if(o.type==='wall-panel'&&o.variant==='oval-mirror'){
    const surround=add(new THREE.CylinderGeometry(1,1,.055,64),material(o.color),[0,.6,0]);
    surround.rotation.x=Math.PI/2;surround.scale.set(.4,1,.6);
    const mirror=add(new THREE.CylinderGeometry(1,1,.008,64),material('#aebfbd',{metalness:.92,roughness:.13}),[0,.6,.033]);
    mirror.rotation.x=Math.PI/2;mirror.scale.set(.345,1,.535);
  }
  return group;
}
