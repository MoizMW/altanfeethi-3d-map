import * as THREE from 'three';

// Opt-in center-lounge designs. Existing lounge builders keep their saved appearance.
export function buildCenterLounge(g,o,{box,mesh,rod,mat,referenceSize}) {
  const variants=['center-curved-sofa','center-barrel-chair','center-leather-chair','side-shell-chair','side-curved-divider','side-marble-console','side-media-column','side-wall-light','center-tree-bed','center-light-frame','center-pendant','center-sculpture'];
  if(!variants.includes(o.variant))return false;
  const model=new THREE.Group();g.add(model);
  const fabric=mat(o.color,.92),dark=mat('#303532',.38),brass=mat('#ac9362',.32,.72);
  const add=(geometry,material,p,name)=>{const m=mesh(model,geometry,material,p);if(name)m.name=name;return m;};
  let dimensions;
  if(o.variant==='center-curved-sofa') {
    dimensions=[2.8,.9,1.5];
    const wedge=(inner,outer,start,end,height,y,material,name)=>{
      const shape=new THREE.Shape(),point=(r,a)=>[r*Math.sin(a),-(.96-r*Math.cos(a))];
      shape.moveTo(...point(outer,start));
      for(let i=1;i<=32;i++)shape.lineTo(...point(outer,start+(end-start)*i/32));
      shape.lineTo(...point(inner,end));
      for(let i=31;i>=0;i--)shape.lineTo(...point(inner,start+(end-start)*i/32));
      shape.closePath();
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:3,curveSegments:16});
      geometry.rotateX(-Math.PI/2);return add(geometry,material,[0,y,0],name);
    };
    wedge(.65,1.48,-1.18,1.18,.18,.17,fabric,'Continuous crescent base');
    wedge(1.27,1.48,-1.18,1.18,.49,.36,fabric,'Continuous curved upholstered back');
    for(let i=0;i<3;i++){
      const a=-1.16+i*2.32/3,b=a+2.32/3;
      wedge(.68,1.25,a+.025,b-.025,.14,.37,fabric,`Curved seat cushion ${i+1}`);
      wedge(1.22,1.29,a+.025,b-.025,.38,.49,fabric,`Curved back cushion ${i+1}`);
    }
    for(const sign of [-1,1])wedge(.67,1.46,sign<0?-1.2:1.06,sign<0?-1.06:1.2,.23,.37,fabric,'Padded end arm');
    for(const a of [-1.03,0,1.03])for(const r of [.77,1.32]){
      const [x,z]=[r*Math.sin(a),.96-r*Math.cos(a)];box(model,[.05,.17,.05],[x,.085,z],dark,.009);
    }
  }else if(['center-barrel-chair','center-leather-chair','side-shell-chair'].includes(o.variant)) {
    dimensions=[.94,.96,.96];
    const leather=o.variant==='center-leather-chair',surface=leather?mat(o.color,.48):fabric;
    box(model,[.8,.2,.8],[0,.29,.01],surface,.09);
    box(model,[.68,.16,.69],[0,.43,.055],surface,.075).name='Seat cushion';
    const curve=new THREE.Shape();
    curve.moveTo(-.46,-.31);curve.lineTo(-.46,.16);curve.bezierCurveTo(-.46,.53,.46,.53,.46,.16);curve.lineTo(.46,-.31);
    curve.lineTo(.33,-.31);curve.lineTo(.33,.15);curve.bezierCurveTo(.33,.36,-.33,.36,-.33,.15);curve.lineTo(-.33,-.31);curve.closePath();
    const shell=new THREE.ExtrudeGeometry(curve,{depth:leather?.48:.4,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,curveSegments:28});
    shell.rotateX(Math.PI/2);shell.rotateY(Math.PI);add(shell,o.variant==='side-shell-chair'?mat(o.shellColor||'#ac8350',.57):surface,[0,leather?.9:.83,0],'Wrapped barrel back and arms');
    const cushion=box(model,[.59,.35,.15],[0,.67,-.29],surface,.07);cushion.rotation.x=-.12;
    for(const x of [-.32,.32])for(const z of [-.3,.3])rod(model,[x,.26,z],[x*1.08,.025,z*1.08],.022,dark);
    if(leather) {
      const seam=mat(new THREE.Color(o.color).multiplyScalar(.72),.6);
      for(let i=-2;i<=2;i++)rod(model,[i*.07,.86,-.37],[i*.12,.66,-.32],.003,seam);
    }
  }else if(o.variant==='side-curved-divider') {
    dimensions=[3.8,1.9,.5];
    const outline=new THREE.Shape(),point=(x,offset)=>[x,-(.14*Math.sin(x*1.55)+offset)];
    outline.moveTo(...point(-1.88,-.13));
    for(let i=1;i<=64;i++)outline.lineTo(...point(-1.88+3.76*i/64,-.13));
    for(let i=64;i>=0;i--)outline.lineTo(...point(-1.88+3.76*i/64,.13));outline.closePath();
    const extrude=(depth,y,material,name)=>{const geometry=new THREE.ExtrudeGeometry(outline,{depth,bevelEnabled:true,bevelThickness:.016,bevelSize:.018,bevelSegments:3,curveSegments:24});geometry.rotateX(-Math.PI/2);return add(geometry,material,[0,y,0],name);};
    extrude(1.09,.025,brass,'Curved brass bay divider');
    extrude(.045,1.13,mat('#e3e0d4',.3),'Pale stone divider cap');
    for(let i=0;i<55;i++){
      const x=-1.82+i*3.64/54,z=.14*Math.sin(x*1.55);
      for(const side of [-1,1])rod(model,[x,.08,z+side*.145],[x,1.09,z+side*.145],.0025,mat('#867044',.4,.6));
    }
    const ring=add(new THREE.TorusGeometry(.35,.026,10,64),mat('#414548',.38,.55),[0,1.55,0],'Dark ring sculpture on divider');ring.rotation.y=.18;
    box(model,[.25,.045,.17],[0,1.2,0],dark,.015);
  }else if(o.variant==='side-marble-console') {
    dimensions=[.48,1.1,3.2];
    box(model,[.34,1.02,3.05],[0,.52,0],brass,.13).name='Brass console pedestal';
    box(model,[.48,.055,3.2],[0,1.075,0],mat('#dfdfd7',.23),.2).name='Long rounded marble console top';
    for(const z of [-1.05,.95]){
      const bottle=mat('#bed2ce',.16,.12);bottle.transparent=true;bottle.opacity=.65;
      add(new THREE.CylinderGeometry(.025,.027,.13,12),bottle,[0,1.1675,z],'Water bottle');
      add(new THREE.CylinderGeometry(.015,.015,.025,12),dark,[0,1.245,z]);
    }
  }else if(o.variant==='side-media-column') {
    dimensions=[.95,4.1,.95];
    add(new THREE.CylinderGeometry(.46,.46,4.1,48),mat('#afa99d',.6),[0,2.05,0],'Stone clad structural column');
    for(let i=0;i<32;i++){
      const a=i/32*Math.PI*2;rod(model,[Math.sin(a)*.462,.08,Math.cos(a)*.462],[Math.sin(a)*.462,1.05,Math.cos(a)*.462],.003,brass);
    }
    const screen=new THREE.MeshStandardMaterial({color:'#25458b',roughness:.4,emissive:'#263e7d',emissiveIntensity:.3,side:THREE.DoubleSide});
    add(new THREE.CylinderGeometry(.47,.47,2.3,32,1,true,-Math.PI/2,Math.PI),screen,[0,2.3,0],'Static curved media display');
    // Abstract bands acknowledge the lit display without copying changing advertising content.
    for(let i=0;i<5;i++)add(new THREE.CylinderGeometry(.472,.472,.035,32,1,true,-Math.PI/2,Math.PI),mat(i%2?'#6478b9':'#4264ad',.5),[0,1.5+i*.3,0]);
  }else if(o.variant==='side-wall-light') {
    dimensions=[.12,1.1,.12];
    box(model,[.09,1.1,.09],[0,.55,0],brass,.015);
    const glow=new THREE.MeshStandardMaterial({color:'#f4e0a6',emissive:'#e7c06d',emissiveIntensity:.7,roughness:.45});
    for(const sign of [-1,1]){const fin=box(model,[.065,.5,.04],[0,.55+sign*.27,.06],glow,.015);fin.rotation.z=sign*.28;}
  }else if(o.variant==='center-tree-bed') {
    dimensions=[1.8,3.25,1.8];
    const stone=mat('#b3aa8d',.9),leaf=mat('#496445',.9),leafLight=mat('#6d7c52',.95),bark=mat('#91816a',.96);
    box(model,[1.45,.05,1.45],[0,.015,0],stone,.01).name='Flush gravel tree bed';
    for(let i=0;i<120;i++) {
      const x=Math.sin(i*23.17)*.68,z=Math.sin(i*49.43)*.68;
      const pebble=add(new THREE.IcosahedronGeometry(.027+(i%3)*.007,0),stone,[x,.052,z]);pebble.scale.y=.5;
    }
    for(const sign of [-1,1])rod(model,[sign*.055,.05,0],[sign*.1,2.45,sign*.07],.038,bark);
    const foliage=new THREE.InstancedMesh(new THREE.SphereGeometry(1,5,4),leaf,720);
    foliage.name='Dense small-leaf tree canopy';foliage.castShadow=true;foliage.receiveShadow=true;
    const pose=new THREE.Object3D();let leafIndex=0;
    for(let i=0;i<15;i++) {
      const a=i*2.4,y=1.65+(i%5)*.23,r=.34+(i%3)*.16;
      rod(model,[0,y-.4,0],[Math.cos(a)*r,y,Math.sin(a)*r],.013,bark);
      for(let j=0;j<48;j++){
        const angle=j*2.4+i,spread=.38*Math.sqrt((j+.5)/48);
        pose.position.set(Math.cos(a)*r+Math.cos(angle)*spread,y+.12+Math.sin(j*1.7+i)*.29,Math.sin(a)*r+Math.sin(angle)*spread);
        pose.rotation.set(j*.7,i*.4,j*1.1);pose.scale.set(.035,.078,.014);pose.updateMatrix();
        foliage.setMatrixAt(leafIndex,pose.matrix);foliage.setColorAt(leafIndex,new THREE.Color(i%2?'#41573a':'#627450'));leafIndex++;
      }
    }
    model.add(foliage);
    for(let i=0;i<21;i++) {
      const a=i*2.4,x=Math.cos(a)*.57,z=Math.sin(a)*.57;
      rod(model,[x,.07,z],[x,.32,z],.008,leaf);
      const grass=add(new THREE.SphereGeometry(1,6,5),leaf,[x,.26,z]);grass.scale.set(.045,.22,.065);grass.rotation.z=Math.sin(a)*.45;
    }
  }else if(o.variant==='center-light-frame') {
    dimensions=[.22,3.6,18.8];
    box(model,[.19,.055,.32],[0,.0275,-9.3],brass,.018);
    box(model,[.19,.055,.32],[0,.0275,9.3],brass,.018);
    const points=[new THREE.Vector3(0,.06,-9.3),new THREE.Vector3(0,2.9,-9.3)];
    for(let i=1;i<=16;i++){const a=i/16*Math.PI/2;points.push(new THREE.Vector3(0,2.9+.65*Math.sin(a),-8.65-.65*Math.cos(a)));}
    points.push(new THREE.Vector3(0,3.55,8.65));
    for(let i=1;i<=16;i++){const a=i/16*Math.PI/2;points.push(new THREE.Vector3(0,2.9+.65*Math.cos(a),8.65+.65*Math.sin(a)));}
    points.push(new THREE.Vector3(0,.06,9.3));
    const path=new THREE.CurvePath();for(let i=1;i<points.length;i++)path.add(new THREE.LineCurve3(points[i-1],points[i]));
    add(new THREE.TubeGeometry(path,160,.055,10,false),brass,[0,0,0],'Rounded brass lighting frame');
    for(const z of [-4.7,0,4.7])rod(model,[0,.04,z],[0,3.55,z],.025,brass);
  }else if(o.variant==='center-pendant') {
    dimensions=[.68,3.55,.68];
    rod(model,[0,3.55,0],[0,3.0,0],.018,brass);
    const glow=new THREE.MeshStandardMaterial({color:'#ecdb9f',roughness:.65,emissive:'#e8c269',emissiveIntensity:.3});
    const profile=[new THREE.Vector2(.23,2.45),new THREE.Vector2(.31,2.48),new THREE.Vector2(.33,2.7),new THREE.Vector2(.29,2.9),new THREE.Vector2(.16,3.0)];
    add(new THREE.LatheGeometry(profile,40),glow,[0,0,0],'Pleated warm pendant shade');
    for(let i=0;i<16;i++) {
      const a=i/16*Math.PI*2,pts=profile.map(p=>new THREE.Vector3(Math.cos(a)*(p.x+.004),p.y,Math.sin(a)*(p.x+.004)));
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,.004,4,false),brass,[0,0,0],'Pendant rib');
    }
    add(new THREE.CylinderGeometry(.23,.23,.012,32),glow,[0,2.45,0]);
  }else {
    dimensions=[.42,1.45,.42];
    add(new THREE.CylinderGeometry(.17,.2,.24,24),dark,[0,.12,0],'Sculpture plinth');
    const points=Array.from({length:65},(_,i)=>{const a=i/64*Math.PI*3;return new THREE.Vector3(Math.sin(a)*.16,.28+i/64*1.14,Math.cos(a)*.12);});
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),80,.047,8,false),mat('#627278',.38,.48),[0,0,0],'Abstract twisting sculpture');
  }
  // Work in metres internally, then normalize to the editor's existing type contract.
  model.scale.fromArray(dimensions.map((v,i)=>referenceSize[o.type][i]/v));
  return true;
}
