import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {receptionSizes, buildReceptionObject} from './reception-objects.js';
import {buildBuffetObject} from './buffet-objects.js';
import {buildDiningObject} from './dining-objects.js';
import {buildEggChair,buildShellLoungeChair,buildLeatherPrivacyChair} from './lounge-objects.js';
import {buildCurvedArmchair} from './curved-armchair.js';
import {buildPrivateLoungeObject,privateLoungeSizes} from './private-lounge-objects.js';
import {buildLoungeSofa} from './lounge-sofa.js';
import {buildNestedStoneTable} from './lounge-tables.js';
import {buildLobbyFixture} from './lobby-fixtures.js';
import {buildFirstFloorReceptionObject} from './first-floor-reception.js';
import {buildCenterLounge} from './center-lounge.js';
import {securitySizes, buildSecurityObject} from './security-objects.js';
import {passportSizes, buildPassportObject} from './passport-objects.js';

export const mat=(color,roughness=.65,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function mesh(group,geometry,material,p){const m=new THREE.Mesh(geometry,material);m.position.set(...p);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
export function box(g,dim,p,m,r=.04){return mesh(g,new RoundedBoxGeometry(...dim,3,Math.min(r,...dim.map(d=>d/3))),m,p);}
function rod(g,a,b,r,m){const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const s=mesh(g,new THREE.CylinderGeometry(r,r,d.length(),6),m,new THREE.Vector3(...a).addScaledVector(d,.5).toArray());s.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return s;}
export const referenceSize={sofa:[2.05,.88,.9],armchair:[.88,.9,.92],table:[1.5,.42,.78],screen:[3.8,2.3,.07],plant:[.5,1.7,.5],...receptionSizes,...securitySizes,...passportSizes};
export const objectReferenceSize=o=>privateLoungeSizes[o.variant]||referenceSize[o.type];
export function buildObject(o){const g=new THREE.Group(),nativeSize=objectReferenceSize(o),[w,h,d]=nativeSize, fabric=mat(o.color),dark=mat('#303b3a',.4),gold=mat('#ab9564',.35,.6);g.userData.objectId=o.id;
 if(privateLoungeSizes[o.variant])g.add(buildPrivateLoungeObject(o));
 else if(buildBuffetObject(g,o,{box,mesh,rod,mat,referenceSize})){}
 else if(buildCenterLounge(g,o,{box,mesh,rod,mat,referenceSize})){}
 else if((o.type==='counter'&&o.variant==='food-buffet')||(o.type==='display-console'&&o.variant==='grand-piano'))buildDiningObject(g,o,{box,mesh,rod,mat});
 else if(buildLobbyFixture(g,o,{box,mesh,rod,mat,referenceSize,THREE})){}
 else if(buildFirstFloorReceptionObject(g,o,{box,mesh,rod,mat,referenceSize})){}
 else if(receptionSizes[o.type])buildReceptionObject(g,o,{box,mesh,rod,mat});
 else if(securitySizes[o.type])buildSecurityObject(g,o,{box,mesh,rod,mat});
 else if(passportSizes[o.type])buildPassportObject(g,o,{box,mesh,rod,mat});
 else if(o.type==='armchair'&&o.variant==='egg-swivel')g.add(buildEggChair(o.color));
 else if(o.type==='armchair'&&o.variant==='shell-lounge')g.add(buildShellLoungeChair(o));
 else if(o.type==='armchair'&&o.variant==='leather-privacy')g.add(buildLeatherPrivacyChair(o.color));
 else if(o.type==='armchair'&&(!o.variant||o.variant==='default'))g.add(buildCurvedArmchair(o));
 else if(o.type==='sofa')g.add(buildLoungeSofa(o));
 else if(o.type==='sofa'||o.type==='armchair'){
  const n=o.type==='sofa'?2:1;
  box(g,[w,.22,d],[0,.29,0],fabric,.09);
  box(g,[w,.47,.2],[0,h-.25,-d/2+.09],fabric,.09);
  if(o.variant!=='armless')for(const x of [-w/2+.09,w/2-.09])box(g,[.18,.43,d*.91],[x,.52,0],fabric,.08);
  for(let i=0;i<n;i++){const x=(i-(n-1)/2)*(w-.35)/n;box(g,[(w-.38)/n,.16,d*.71],[x,.47,.08],fabric,.065);if(o.variant!=='armless'){const cushion=box(g,[(w-.4)/n*.78,.39,.14],[x,.73,-d*.19],mat(o.cushionColor||(o.type==='sofa'?'#9fafab':'#889fa3')),.055);cushion.rotation.x=-.17;}}
  for(const x of [-w/2+.14,w/2-.14])for(const z of [-d/2+.15,d/2-.15])box(g,[.045,.18,.045],[x,.09,z],dark,.008);
 }else if(o.type==='table'&&o.variant==='nested-stone'){
  buildNestedStoneTable(g,o);
 }else if(o.type==='table'&&o.variant==='round-pedestal'){
  const top=mesh(g,new THREE.CylinderGeometry(1,1,.065,48),mat(o.color,.28),[0,h,0]);top.scale.set(w/2,1,d/2);
  const support=mesh(g,new THREE.CylinderGeometry(1,1,1,32),gold,[0,h/2,0]);support.scale.set(w*.3,h,d*.3);
  if(o.accessories!==false){box(g,[.17,.15,.17],[0,h+.1075,0],mat('#8a5437'),.012);box(g,[.06,.09,.035],[0,h+.2275,0],mat('#f1eee3'),.01);}
 }else if(o.type==='table'){
  if (
    o.shape === 'square' ||
    o.variant === 'rectangular' ||
    o.variant === 'square-stone'
  ) {
    box(
      g,
      [w, .065, d],
      [0, h, 0],
      mat(o.color, .28),
      o.variant === 'rectangular' ? .012 : .025
    );
  } else {
    const surface = o.variant === 'round-glass'
      ? new THREE.MeshStandardMaterial({
          color: '#bbc9c5',
          transparent: true,
          opacity: .4,
          roughness: .12,
          metalness: .12
        })
      : mat(o.color, .28);

    const top = mesh(g, new THREE.CylinderGeometry(1, 1, .065, 64), surface, [0, h, 0]);
    top.scale.set(w / 2, 1, d / 2);

    if (o.variant === 'round-glass') {
      const rim = mesh(g, new THREE.TorusGeometry(1, .025, 6, 48), gold, [0, h, 0]);
      rim.rotation.x = Math.PI / 2;
      rim.scale.set(w / 2, d / 2, 1);
    }
  }

  for (const x of [-w * .28, w * .28]) {
    for (const z of [-d * .26, d * .26]) {
      box(g, [.035, h, .035], [x, h / 2, z],
        o.variant === 'round-glass' ? gold : dark, .007);
    }
  }
  if(o.accessories!==false){box(g,[.17,.15,.17],[.1,h+.11,0],mat('#8a5437'),.012);box(g,[.06,.09,.035],[.1,h+.2,0],mat('#f1eee3'),.01);}
 }else if(o.type==='screen'&&o.variant==='open-shelving'){
  // A shared divider variant; reference dimensions still use the screen contract.
  const finish=mat(o.color,.6);
  for(const x of [-w*.34,0,w*.34])box(g,[.065,h,d*.72],[x,h/2,0],finish,.008);
  for(let row=0;row<5;row++){
   const y=.12+row*(h-.2)/4;
   box(g,[w,.045,d],[0,y,0],finish,.009);
   if(row>0){const x=(row%2?-.19:.19)*w;const vase=mesh(g,new THREE.SphereGeometry(1,12,10),mat(row%2?'#a08a6c':'#708483'),[x,y+.13,0]);vase.scale.set(.13,.11,d*.3);}
  }
 }else if(o.type==='screen'&&o.variant==='teal-gold-panel'){
  box(g,[w,h,d],[0,h/2,0],mat('#174d57'),.006);
  for(let i=0;i<10;i++){const x=-w/2+i*w/10;for(let j=0;j<5;j++){const y=j*h/5;for(const z of [-d/2-.008,d/2+.008]){rod(g,[x,y,z],[x+w/10,y+h/5,z],.008,gold);rod(g,[x+w/10,y,z],[x,y+h/5,z],.008,gold);}}}
 }else if(o.type==='screen'){
  box(g,[w,.45,.075],[0,.225,0],mat('#1b464a'),.01);
  for(const x of [-w/2,w/2])box(g,[.035,h,.035],[x,h/2,0],gold,.005);
  box(g,[w,.035,.035],[0,h,0],gold,.005);
  const step=w/10;for(let i=0;i<10;i++){const x=-w/2+i*step;for(let j=0;j<4;j++){const y=.45+j*(h-.45)/4,dy=(h-.45)/4;rod(g,[x,y,0],[x+step,y+dy,0],.009,gold);rod(g,[x+step,y,0],[x,y+dy,0],.009,gold);}}
 }else if(o.type==='plant'){
  if(o.variant==='rectangular-planter')box(g,[w,.5,d],[0,.25,0],mat('#d7d8cf'),.025);
  else mesh(g,new THREE.CylinderGeometry(w*.46,w*.32,.5,24),mat('#d7d8cf'),[0,.25,0]);
  for(let i=0;i<11;i++){const a=i*2.4,x=Math.cos(a)*w*.47,z=Math.sin(a)*d*.47,y=.9+(i%4)*.19;rod(g,[0,.4,0],[x,y,z],.013,dark);const leaf=mesh(g,new THREE.SphereGeometry(1,10,8),fabric,[x,y,z]);leaf.scale.set(.13,.35,.065);leaf.rotation.set(.3,a,.6);}
 }
 g.position.fromArray(o.position);g.rotation.y=THREE.MathUtils.degToRad(o.yaw);g.scale.fromArray(o.size.map((v,i)=>v/nativeSize[i]*(o.scale?.[i]??1)));return g;
}
