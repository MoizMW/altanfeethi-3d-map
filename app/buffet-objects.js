import * as THREE from 'three';

const designs={
 'buffet-tree-island':[4,1.15,2.6],
 'buffet-hot-station':[4.8,1.7,1.2],
 'buffet-coffee-station':[4,1.65,3.2],
 'buffet-display-shelves':[5,3.5,.8],
};
function capsule(w,d){
 const s=new THREE.Shape(),r=d/2,x=w/2-r;
 s.moveTo(-x,-r);s.lineTo(x,-r);s.absarc(x,0,r,-Math.PI/2,Math.PI/2,false);
 s.lineTo(-x,r);s.absarc(-x,0,r,Math.PI/2,Math.PI*1.5,false);return s;
}
function horseshoe(){
 const s=new THREE.Shape();s.moveTo(-2,1.2);s.lineTo(-2,0);s.absarc(0,0,2,Math.PI,2*Math.PI,false);
 s.lineTo(2,1.2);s.lineTo(1.35,1.2);s.lineTo(1.35,0);s.absarc(0,0,1.35,0,-Math.PI,true);s.lineTo(-1.35,1.2);s.closePath();return s;
}
export function buildBuffetObject(parent,o,{box,mesh,rod,mat,referenceSize}){
 const size=designs[o.variant];if(!size)return false;
 const g=new THREE.Group();parent.add(g);
 const stone=mat(o.color||'#c9c5b6',.28),wood=mat('#8c705a',.5),steel=mat('#b8bfbb',.22,.75),dark=mat('#242b2b',.3),ivory=mat('#eee8d7',.3),gold=mat('#b3a06a',.3,.65);
 const light=mat('#fff0bf');light.emissive=new THREE.Color('#ffd37b');light.emissiveIntensity=1.5;
 const extrude=(shape,height,y,material)=>{const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:40});geo.rotateX(-Math.PI/2);return mesh(g,geo,material,[0,y,0]);};
 const tray=(x,z,y,w=.6,d=.4)=>{box(g,[w,.04,d],[x,y,z],steel,.012);box(g,[w-.07,.012,d-.07],[x,y+.025,z],mat('#777d72'),.005);};
 const plates=(x,z,y)=>{for(let i=0;i<5;i++)mesh(g,new THREE.CylinderGeometry(.13,.13,.016,24),ivory,[x,y+i*.018,z]);};
 if(o.variant==='buffet-tree-island'){
  const shape=capsule(4,2.6),hole=new THREE.Path();hole.absarc(0,0,.7,0,2*Math.PI,true);shape.holes.push(hole);
  extrude(capsule(4.25,2.85),.06,.015,ivory);extrude(shape,.085,.1,light);extrude(shape,.82,.2,stone);extrude(shape,.1,1.02,stone);
  for(let i=0;i<9;i++)extrude(shape,.006,.26+i*.078,mat(i%2?'#b8b5aa':'#d5d0c3',.55));
  for(const z of [-.95,.95])for(const x of [-.8,0,.8])tray(x,z,1.13,.7,.36);
  for(const x of [-1.58,1.58])for(const z of [-.35,.35])tray(x,z,1.13,.42,.5);
  plates(-1.3,.65,1.13);plates(1.3,-.65,1.13);
 }else if(o.variant==='buffet-hot-station'){
  const shape=capsule(4.8,1.2);extrude(shape,.08,.08,light);extrude(shape,.88,.16,stone);extrude(shape,.09,1.04,stone);
  for(let i=0;i<8;i++)extrude(shape,.006,.24+i*.09,mat(i%2?'#b9b6aa':'#d4cfc2',.55));
  for(let i=0;i<5;i++){const x=-1.65+i*.82;tray(x,0,1.14,.65,.64);const lid=mesh(g,new THREE.SphereGeometry(1,20,12,0,2*Math.PI,0,Math.PI/2),steel,[x,1.18,0]);lid.scale.set(.31,.13,.28);box(g,[.09,.035,.03],[x,1.33,0],dark,.01);}
  for(const x of [-2,2])rod(g,[x,1.12,-.4],[x,1.65,-.4],.018,gold);
  rod(g,[-2,1.65,-.4],[2,1.65,-.4],.025,gold);
  for(const x of [-1.4,0,1.4]){box(g,[.34,.025,.16],[x,1.6,-.4],dark,.01);box(g,[.3,.012,.13],[x,1.58,-.4],light,.005);}
 }else if(o.variant==='buffet-coffee-station'){
  const shape=horseshoe();extrude(shape,.08,.08,light);extrude(shape,.82,.16,stone);extrude(shape,.24,.98,wood);extrude(shape,.065,1.22,wood);
  for(let i=0;i<8;i++)extrude(shape,.005,.23+i*.085,mat('#b3afa5',.55));
  // Equipment remains inside the horseshoe, with the staff opening at the rear.
  box(g,[.8,.44,.52],[-1.6,1.5,-.6],dark,.035);box(g,[.65,.25,.035],[-1.6,1.48,-.31],steel,.008);
  box(g,[.78,.035,.4],[-1.6,1.3,-.18],steel,.005);
  for(const x of [-1.8,-1.55])rod(g,[x,1.44,-.27],[x,1.36,-.22],.025,steel);
  for(const z of [-.7,-.2]){mesh(g,new THREE.CylinderGeometry(.15,.15,.45,24),steel,[1.65,1.5,z]);mesh(g,new THREE.CylinderGeometry(.17,.17,.035,24),dark,[1.65,1.74,z]);}
  for(let i=0;i<5;i++)for(let j=0;j<3;j++)mesh(g,new THREE.CylinderGeometry(.055,.04,.09,12),ivory,[-.5+i*.18,1.34+j*.08,1.62]);
 }else{
  box(g,[5,.93,.8],[0,.54,0],stone,.015);box(g,[5,.07,.86],[0,1.04,.02],stone,.01);
  for(let i=0;i<26;i++)box(g,[.025,.75,.014],[-2.4+i*.19,.55,.408],wood,.002);
  box(g,[5,2.25,.06],[0,2.22,-.35],wood,.005);
  for(const y of [1.22,2.05,2.85]){box(g,[5,.07,.7],[0,y,-.02],wood,.008);box(g,[4.9,.018,.08],[0,y-.055,-.27],light,.004);}
  for(const y of [1.48,2.3])for(let i=0;i<7;i++){
   const x=-2.1+i*.7;mesh(g,new THREE.SphereGeometry(1,16,12),i%2?ivory:gold,[x,y,-.02]).scale.set(.12,.2,.12);
   mesh(g,new THREE.CylinderGeometry(.045,.06,.13,12),i%2?ivory:gold,[x,y+.2,-.02]);
  }
  for(const x of [-1.4,0,1.4])tray(x,.1,1.09,.8,.42);
 }
 g.scale.fromArray(referenceSize[o.type].map((v,i)=>v/size[i]));return true;
}
