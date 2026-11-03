import * as THREE from 'three';

// Schematic descent from the authored first-floor plane; not a surveyed elevation.
export function buildVerticalCirculation(data) {
  const group=new THREE.Group();group.name=data.id;group.userData.structureId=data.id;
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.6,...extra});
  const stone=material('#c6c4b6'),metal=material('#9ca8a8',{metalness:.65,roughness:.3}),rubber=material('#222b2c'),yellow=material('#c8b438');
  const glass=material('#a7bfc3',{transparent:true,opacity:.24,depthWrite:false,side:THREE.DoubleSide});
  const add=(geometry,mat,x,y,z)=>{const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=!mat.transparent;m.receiveShadow=true;group.add(m);return m;};
  const box=(size,p,mat)=>add(new THREE.BoxGeometry(...size),mat,...p);
  const rod=(a,b,r,mat)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);const m=add(new THREE.CylinderGeometry(r,r,v.length(),10),mat,...start.add(end).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());};
  const {startX,endX,drop,stairZ,stairWidth,escalatorZ,escalatorWidth}=data;
  const steps=data.steps||26,run=(endX-startX)/steps,rise=drop/steps;
  for(let i=0;i<steps;i++){
    const x=startX+(i+.5)*run,y=-i*rise;
    box([run+.005,.09,stairWidth],[x,y-.045,stairZ],stone);
    box([.018,.012,stairWidth],[startX+i*run,y+.006,stairZ],material('#9a998c'));
    box([run+.005,.08,escalatorWidth],[x,y-.04,escalatorZ],metal);
    box([.018,.012,escalatorWidth],[startX+i*run,y+.006,escalatorZ],yellow);
    for(let rib=1;rib<9;rib++)box([run,.004,.008],[x,y+.004,escalatorZ-escalatorWidth/2+rib*escalatorWidth/9],rubber);
  }
  for(const [center,width]of [[stairZ,stairWidth],[escalatorZ,escalatorWidth]])for(const side of [-1,1]){
    const z=center+side*width/2;
    const panel=box([Math.hypot(endX-startX,drop),.85,.025],[(startX+endX)/2,.5-drop/2,z],glass);panel.rotation.z=-Math.atan2(drop,endX-startX);
    rod([startX,1,z],[endX,1-drop,z],.035,center===escalatorZ?rubber:metal);
    rod([startX,.09,z],[endX,.09-drop,z],.035,metal);
  }
  box([1.1,.1,escalatorWidth+.24],[startX-.55,-.05,escalatorZ],metal);
  const lowerLandingLength=data.lowerLandingLength??1.2;
  if(lowerLandingLength>0)box([lowerLandingLength,.12,stairWidth+escalatorWidth+.7],[endX+lowerLandingLength/2,-drop-.06,(stairZ+escalatorZ)/2],stone);
  return group;
}

export function buildPatternedSurfaces(sections=[]) {
  const group=new THREE.Group();group.name='Floor inlay details';
  const dark=new THREE.MeshStandardMaterial({color:'#343938',roughness:.35});
  for(const s of sections.filter(s=>s.pattern==='inset-checker')){
    const detail=new THREE.Group();detail.position.set(s.center[0],-.008,s.center[1]);detail.rotation.y=(s.yaw||0)*Math.PI/180;
    const [w,d]=s.size,nx=s.columns||12,nz=s.rows||4;
    for(let x=0;x<nx;x++)for(let z=0;z<nz;z++){
      const tile=new THREE.Mesh(new THREE.BoxGeometry(Math.min(.3,w/nx*.45),.008,Math.min(.3,d/nz*.45)),dark);
      tile.position.set(-w/2+(x+.5)*w/nx,0,-d/2+(z+.5)*d/nz);tile.receiveShadow=true;detail.add(tile);
    }
    group.add(detail);
  }
  return group;
}
