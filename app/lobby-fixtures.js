import {createCylindricalDisplay} from './cylindrical-display.js';

// Builders use the existing type reference sizes so resize/selection keep working.
export function buildLobbyFixture(g,o,{box,mesh,rod,mat,referenceSize,THREE}) {
  if((o.type==='wall-panel'&&o.variant==='window-drapery')||(o.type==='display-console'&&o.variant==='window-sculpture')||(o.type==='cabinet'&&o.variant==='window-sill')){
    const [w,h,d]=referenceSize[o.type];
    if(o.variant==='window-drapery'){
      const bays=Math.max(1,Math.round(o.size[0]/2.8)),pitch=w/bays;
      const fabric=new THREE.MeshStandardMaterial({color:o.color,roughness:.95,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide});
      const hem=mat('#d7d4c8',.9),rail=mat('#a6a391',.4,.4);
      for(let bay=0;bay<bays;bay++)for(const sign of [-1,1]){
        const center=-w/2+(bay+.5)*pitch+sign*pitch*.365,width=pitch*.24;
        const points=[],indices=[],columns=40,rows=12;
        for(let row=0;row<=rows;row++)for(let col=0;col<=columns;col++){
          const u=col/columns,v=row/rows;
          points.push(center+(u-.5)*width+Math.sin(v*Math.PI)*width*.025,v*h,Math.sin(u*Math.PI*14)*d*.42+Math.sin(v*Math.PI)*d*.12);
        }
        for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){const a=row*(columns+1)+col,b=a+1,c=a+columns+1;indices.push(a,b,c,b,c+1,c);}
        const cloth=new THREE.BufferGeometry();cloth.setAttribute('position',new THREE.Float32BufferAttribute(points,3));cloth.setIndex(indices);cloth.computeVertexNormals();
        const panel=mesh(g,cloth,fabric,[0,0,0]);panel.name='Gathered sheer curtain';panel.castShadow=false;panel.receiveShadow=false;
        box(g,[width,h*.007,d*.2],[center,h*.012,0],hem,.002).name='Curtain hem';
      }
      box(g,[w,h*.008,d*.4],[0,h,0],rail,.002).name='Window curtain track';
    }else if(o.variant==='window-sill'){
      box(g,[w,h*.86,d],[0,h*.43,0],mat(o.color,.4),.008).name='Stone window sill base';
      box(g,[w,h*.14,d*1.03],[0,h*.93,0],mat('#dfddd1',.3),.008).name='Stone sill cap';
    }else{
      const assembly=new THREE.Group();g.add(assembly);const finish=mat(o.color,.35,.25);
      box(assembly,[.3,.045,.2],[0,.0225,0],finish,.006);
      const silhouette=new THREE.Shape();silhouette.moveTo(0,1.25);
      silhouette.bezierCurveTo(.18,1.1,.2,.45,.08,.10);silhouette.lineTo(-.10,.10);
      silhouette.bezierCurveTo(-.2,.4,-.15,1.12,0,1.25);
      const opening=new THREE.Path();opening.absellipse(0,.62,.055,.29,0,Math.PI*2,true);silhouette.holes.push(opening);
      const geometry=new THREE.ExtrudeGeometry(silhouette,{depth:.035,bevelEnabled:true,bevelSize:.006,bevelThickness:.005,bevelSegments:2,curveSegments:40});
      mesh(assembly,geometry,finish,[0,.045,-.0175]).name='Abstract pierced window sculpture';
      box(assembly,[.055,.11,.05],[0,.09,0],finish,.003);
      assembly.scale.set(w/.32,h/1.3,d/.2);
    }
    return true;
  }
  if((o.type==='screen'&&o.variant==='curved-bronze')||(o.type==='wall-panel'&&o.variant==='cylindrical-display')){
    const [w,h,d]=referenceSize[o.type],assembly=new THREE.Group();g.add(assembly);
    const bronze=mat(o.color,.35,.65),stone=mat('#e5e1d5',.3),black=mat('#242a2b',.4);
    if(o.variant==='curved-bronze'){
      // Author in a physical envelope, then normalize to the shared screen contract.
      const outline=new THREE.Shape();outline.moveTo(-1.45,-.25);
      outline.bezierCurveTo(-1.25,.18,1.25,.18,1.45,-.25);
      outline.lineTo(1.45,-.17);outline.bezierCurveTo(1.2,.26,-1.2,.26,-1.45,-.17);outline.closePath();
      const panel=new THREE.ExtrudeGeometry(outline,{depth:1.03,bevelEnabled:false,curveSegments:48});panel.rotateX(-Math.PI/2);
      mesh(assembly,panel,bronze,[0,0,0]).name='Curved bronze divider';
      const cap=new THREE.ExtrudeGeometry(outline,{depth:.035,bevelEnabled:false,curveSegments:48});cap.rotateX(-Math.PI/2);
      mesh(assembly,cap,stone,[0,1.03,0]).name='Stone divider cap';
      const ring=mesh(assembly,new THREE.TorusGeometry(.275,.018,12,64),black,[0,1.35,-.1125]);ring.name='Divider ring ornament';
      rod(assembly,[0,1.065,-.1125],[0,1.075,-.1125],.025,black);
      assembly.scale.set(w/2.9,h/1.65,d/.5);
    }else{
      const radius=.675,height=4.1,base=.22;
      mesh(assembly,new THREE.CylinderGeometry(radius,radius,base,64),black,[0,base/2,0]).name='Display column plinth';
      const {material,animate}=createCylindricalDisplay();
      const screen=mesh(assembly,new THREE.CylinderGeometry(radius,radius,height-base,96),[material,black,black],[0,(height+base)/2,0]);
      screen.name='Cylindrical display surface';screen.castShadow=false;screen.receiveShadow=false;
      screen.userData.animated=true;
      screen.onBeforeRender=animate;
      for(const y of [1.51,2.8])mesh(assembly,new THREE.TorusGeometry(radius,.012,8,96),black,[0,y,0]).rotation.x=Math.PI/2;
      assembly.scale.set(w/1.35,h/height,d/1.35);
    }
    return true;
  }
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
