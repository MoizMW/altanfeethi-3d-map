// Builders use the existing type reference sizes so resize/selection keep working.
export function buildLobbyFixture(g,o,{box,mesh,rod,mat,referenceSize,THREE}) {
  if(!['waste-bin','fire-extinguisher','sanitizer','lift-doors'].includes(o.variant))return false;
  // Build fixtures in physical units so circular rods stay round after the
  // outer object builder applies its type's nonuniform reference scaling.
  const reference=referenceSize[o.type],[w,h,d]=o.size,assembly=new THREE.Group();
  assembly.scale.fromArray(reference.map((value,i)=>value/o.size[i]));g.add(assembly);g=assembly;
  const body=mat(o.color,.45,.25),metal=mat('#a6acab',.3,.65),black=mat('#242a2b');
  const cylinder=(sx,sy,sz,p,m)=>{const part=mesh(g,new THREE.CylinderGeometry(1,1,1,32),m,p);part.scale.set(sx,sy,sz);return part;};
  if(o.variant==='waste-bin'){
    cylinder(w*.43,h,d*.43,[0,h/2,0],body);
    cylinder(w*.46,h*.08,d*.46,[0,h*.96,0],metal);
    cylinder(w*.37,h*.01,d*.37,[0,h*1.005,0],black);
  }else if(o.variant==='fire-extinguisher'){
    box(g,[w,.035,d],[0,.0175,0],body,.01);
    rod(g,[0,0,-d*.35],[0,h*.85,-d*.35],w*.025,body);
    cylinder(w*.28,h*.64,d*.28,[0,h*.47,0],body);
    box(g,[w*.4,h*.12,d*.08],[0,h*.47,d*.29],mat('#efeee1'),.003);
    box(g,[w*.5,h*.035,d*.25],[0,h*.83,0],black,.003);
    rod(g,[w*.25,h*.8,0],[w*.38,h*.2,0],w*.025,black);
  }else if(o.variant==='sanitizer'){
    box(g,[w,h,d],[0,h/2,0],body,.01);
    box(g,[w*.65,h*.35,.02],[0,h*.55,d/2],black,.003);
    cylinder(w*.15,h*.14,d*.15,[0,h*1.07,0],mat('#d7d9d0'));
  }else{
    for(const sign of [-1,1])box(g,[w/2-.025,h-.08,d*.35],[sign*w/4,h/2,0],body,.004);
    for(const x of [-w/2,w/2])box(g,[.045,h,d],[x,h/2,0],metal,.004);
    box(g,[w,.055,d],[0,h,0],metal,.004);
    box(g,[w*.28,.1,d*.2],[0,h*1.06,0],black,.004);
    box(g,[.07,.17,d*.25],[-w*.62,h*.48,0],metal,.004);
  }
  return true;
}
