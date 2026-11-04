import * as THREE from 'three';

const designs={
  'four-seat-banquette':['sofa',[4.6,1.12,1.1]],
  'stored-shelving':['cabinet',[.85,2.6,.58]],
  'stone-reception':['counter',[4.8,1.15,.9]],
  'folding-louver':['screen',[2.4,1.8,.4]],
  'pampas-trough':['plant',[4.8,1.6,.32]],
  'pierced-ornament':['display-console',[.35,.9,.22]],
  'patterned-vase':['display-console',[.38,.44,.38]],
  'branded-marble':['wall-panel',[5,3.4,.08]],
  'leaning-glass-panel':['wall-panel',[6,2.35,.22]]
};

function stoneMaterial(color,mat){
  const material=mat('#ffffff',.3),size=512,bytes=new Uint8Array(size*size*4);
  const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)),dark=rgb[0]<80;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=Math.abs(x/(size-1)-.5),v=y/(size-1);
    let vein=0;
    for(let i=0;i<9;i++){
      const slope=[-.8,.65,-.35,.95][i%4],line=.04+i*.11+slope*u+.014*Math.sin(u*24+i*2.3);
      const distance=Math.abs(v-line);vein=Math.max(vein,Math.exp(-distance*distance/(dark?.000006:.000012)));
    }
    const grain=Math.sin(x*5.3+y*11.7)*.6,offset=(y*size+x)*4;
    for(let c=0;c<3;c++)bytes[offset+c]=Math.max(0,Math.min(255,rgb[c]+grain+(dark?[135,112,69][c]:-48)*vein));
    bytes[offset+3]=255;
  }
  const texture=new THREE.DataTexture(bytes,size,size,THREE.RGBAFormat);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;
  texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;
  material.map=texture;material.addEventListener('dispose',()=>texture.dispose());return material;
}

function protectiveCover(g,w,h,d,mesh){
  const path=[[-d*.53,.04],[-d*.52,h*.88],[-d*.35,h+.035],[d*.08,h+.015],[d*.52,h*.58],[d*.56,.025]];
  const positions=[],indices=[],columns=48;
  for(let row=0;row<path.length;row++)for(let i=0;i<=columns;i++){
    const u=i/columns,[z,y]=path[row],crease=Math.sin(u*Math.PI*34+row*.7)*.012;
    positions.push((u-.5)*w*1.015,Math.max(.018,y+crease),z+crease);
  }
  for(let row=0;row<path.length-1;row++)for(let i=0;i<columns;i++){const a=row*(columns+1)+i,b=a+1,c=a+columns+1;indices.push(a,b,c,b,c+1,c);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const film=mesh(g,geometry,new THREE.MeshPhysicalMaterial({color:'#e5e9e8',transparent:true,opacity:.23,roughness:.2,metalness:0,clearcoat:.8,depthWrite:false,side:THREE.DoubleSide}),[0,0,0]);
  film.name='Loose protective construction film';film.castShadow=false;
}

// New variants share the editor/library size contract; existing designs keep their builders.
export function buildFirstFloorReceptionObject(parent,o,{box,mesh,rod,mat,referenceSize}){
  const design=designs[o.variant];if(!design||design[0]!==o.type)return false;
  const [w,h,d]=design[1],g=new THREE.Group();parent.add(g);
  const body=mat(o.color,.7),wood=mat('#80664c',.55),metal=mat('#454b49',.35,.5),brass=mat('#ad985e',.3,.65);
  if(o.variant==='four-seat-banquette'){
    parent.userData.seatLabelPositions=Array.from({length:4},(_,i)=>[(i-1.5)*(w-.25)/4*referenceSize[o.type][0]/w,1.02,0]);
    box(g,[w,.28,d],[0,.16,0],wood,.035);
    box(g,[w,.68,.14],[0,.69,-d*.43],body,.04);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*(w-.25)/4;
      box(g,[(w-.3)/4,.19,d*.76],[x,.41,.035],body,.07).name=`Banquette seat ${i+1}`;
      const cushion=box(g,[(w-.32)/4,.49,.17],[x,.78,-d*.3],body,.055);cushion.rotation.x=-.1;
    }
    for(const x of [-w/2+.07,w/2-.07])box(g,[.14,.59,d],[x,.34,0],wood,.02);
  }else if(o.variant==='stored-shelving'){
    for(const x of [-w/2+.025,w/2-.025])box(g,[.05,h,d],[x,h/2,0],wood,.006);
    box(g,[w,h,.035],[0,h/2,-d/2+.0175],wood,.005);
    for(let i=0;i<6;i++)box(g,[w,.045,d],[0,.025+i*(h-.05)/5,0],wood,.005);
    for(const x of [-w*.3,w*.3])for(let i=0;i<7;i++){
      const tape=box(g,[.035,.1,.002],[x,.3+i*.32,d/2+.003],mat('#d1bb69'),.001);tape.rotation.z=(i%2?-.3:.25);
    }
  }else if(o.variant==='stone-reception'){
    const stone=stoneMaterial(o.color,mat);
    box(g,[w,.95,.12],[0,.55,d/2-.06],stone,.012).name='Bookmatched stone counter front';
    box(g,[w,.085,d],[0,h-.0425,0],stone,.012);
    for(const x of [-w/2+.055,w/2-.055])box(g,[.11,h-.085,d],[x,(h-.085)/2,0],stone,.008);
    box(g,[w-.2,.055,d-.18],[0,.75,-.04],wood,.008);
    box(g,[w,.055,.035],[0,.07,d/2+.02],brass,.004);
  }else if(o.variant==='folding-louver'){
    const count=5,panelWidth=.5,angle=.3,total=count*panelWidth*Math.cos(angle);
    let x=-total/2,z=0;
    for(let i=0;i<count;i++){
      const a=i%2?-angle:angle,panel=new THREE.Group();panel.position.set(x,.05,z);panel.rotation.y=a;g.add(panel);
      for(const side of [0,panelWidth])box(panel,[.025,h-.05,.035],[side,(h-.05)/2,0],metal,.003);
      for(const y of [.04,h-.08])box(panel,[panelWidth,.025,.035],[panelWidth/2,y,0],metal,.003);
      for(let row=0;row<25;row++){const louver=box(panel,[panelWidth-.035,.025,.04],[panelWidth/2,.1+row*(h-.25)/24,0],body,.002);louver.rotation.x=.3;}
      for(const side of [0,panelWidth])box(panel,[.04,.05,.11],[side,0,0],metal,.003);
      x+=panelWidth*Math.cos(a);z-=panelWidth*Math.sin(a);
    }
  }else if(o.variant==='leaning-glass-panel'){
    const panel=new THREE.Group();g.add(panel);panel.rotation.x=-.06;
    const glass=new THREE.MeshStandardMaterial({color:o.color,transparent:true,opacity:.3,roughness:.45,depthWrite:false,side:THREE.DoubleSide});
    mesh(panel,new THREE.BoxGeometry(w,h,.035),glass,[0,h/2,0]).castShadow=false;
    for(const x of [-w/2,w/2])box(panel,[.025,h,.04],[x,h/2,0],brass,.003);
    for(const y of [.03,h-.02])box(panel,[w,.025,.04],[0,y,0],brass,.003);
    const points=[];for(let x=-w/2+.05;x<w/2;x+=.065)points.push(new THREE.Vector3(x,.04,.02),new THREE.Vector3(x,h-.04,.02));
    panel.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#becbc0',transparent:true,opacity:.5})));
  }else if(o.variant==='pampas-trough'){
    box(g,[w,.35,d],[0,.175,0],wood,.01);
    const plume=mat('#b9a57b',.95);
    for(let i=0;i<18;i++){
      const x=-w*.46+i*w*.92/17,top=1.05+(i%4)*.15;
      rod(g,[x,.34,0],[x+.035,top-.2,0],.007,plume);
      for(let j=0;j<5;j++){
        const leaf=mesh(g,new THREE.SphereGeometry(1,8,8),plume,[x+Math.sin(i+j)*.025,top-.22+j*.055,Math.cos(i)*.025]);leaf.scale.set(.045,.10,.035);
      }
    }
  }else if(o.variant==='pierced-ornament'){
    box(g,[w,.045,d],[0,.0225,0],metal,.005);
    for(const [y,r,turn]of [[.32,.18,-.35],[.65,.20,.3]]){
      const ring=mesh(g,new THREE.TorusGeometry(r,.025,12,48),body,[0,y,0]);ring.scale.x=.62;ring.rotation.y=turn;
    }
    rod(g,[0,.04,0],[0,.16,0],.025,metal);
  }else if(o.variant==='patterned-vase'){
    mesh(g,new THREE.CylinderGeometry(w*.18,w*.18,.025,24),body,[0,.0125,0]);
    const vase=mesh(g,new THREE.SphereGeometry(1,32,24),body,[0,h*.46,0]);vase.scale.set(w*.48,h*.43,d*.48);
    mesh(g,new THREE.CylinderGeometry(w*.12,w*.15,h*.13,24),body,[0,h*.93,0]);
    const ivory=mat('#d5d5ca',.55);
    for(let i=0;i<24;i++){
      const a=i*2.4,y=h*(.2+(i%5)*.13),r=Math.sqrt(Math.max(0,1-((y-h*.46)/(h*.43))**2));
      const fleck=mesh(g,new THREE.SphereGeometry(1,8,8),ivory,[Math.cos(a)*w*.483*r,y,Math.sin(a)*d*.483*r]);fleck.scale.set(.018,.035,.012);fleck.rotation.y=-a;
    }
  }else{
    box(g,[w,h,d],[0,h/2,0],body,.004);
    for(const y of [h*.21,h*.32])box(g,[w,.045,.018],[0,y,d/2+.01],brass,.002);
    if(typeof document!=='undefined'){
      const loader=new THREE.TextureLoader();
      const marble=loader.load('/shared/materials/textures/reception-marble/charcoal-veined.png');marble.colorSpace=THREE.SRGBColorSpace;marble.anisotropy=8;
      const finish=new THREE.MeshStandardMaterial({map:marble,color:'#ffffff',roughness:.32,metalness:.06});
      finish.addEventListener('dispose',()=>marble.dispose());
      mesh(g,new THREE.PlaneGeometry(w,h),finish,[0,h/2,d/2+.002]).name='Charcoal marble reception finish';
      const logo=loader.load('/shared/assets/branding/altanfeethi-reception.svg');logo.colorSpace=THREE.SRGBColorSpace;logo.anisotropy=8;
      const print=new THREE.MeshBasicMaterial({map:logo,transparent:true,depthWrite:false,toneMapped:false});print.addEventListener('dispose',()=>logo.dispose());
      const logoWidth=1.45;
      mesh(g,new THREE.PlaneGeometry(logoWidth,logoWidth*289.62/400),print,[0,1.75,d/2+.014]).name='Official Altanfeethi bilingual logo';
    }
  }
  if(o.constructionCover)protectiveCover(g,w,h,d,mesh);
  g.scale.fromArray(referenceSize[o.type].map((v,i)=>v/design[1][i]));return true;
}
