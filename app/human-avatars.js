import * as THREE from 'three';

export const avatarSize=[.64,1.45,.92];
// Stylized adult display figures. Local +Z faces forward, matching lounge chairs.
export function buildHumanAvatar(object){
 return object.variant==='saudi-abaya-seated'?buildDetailedWoman(object):buildDetailedMan(object);
}

export function placeAvatarOnChair(avatar,chair){
 if(!['armchair','office-chair'].includes(chair?.type))throw Error('Select a chair for the seated avatar.');
 return {...avatar,position:[...chair.position],yaw:chair.yaw,seatedOn:chair.id};
}

// Reference-inspired elderly man, built as actual shaded 3D surfaces rather than a photo cutout.
function buildDetailedMan(object){
 const g=new THREE.Group();g.name='Detailed seated man';
 const cotton=new THREE.MeshPhysicalMaterial({color:object.color||'#f1eee5',roughness:.78,sheen:.3,sheenColor:new THREE.Color('#ffffff'),sheenRoughness:.8});
 const seam=new THREE.MeshStandardMaterial({color:'#d4d0c6',roughness:.9});
 const skin=new THREE.MeshPhysicalMaterial({color:'#b58662',roughness:.72,clearcoat:.025});
 const skinShade=new THREE.MeshStandardMaterial({color:'#96694e',roughness:.85});
 const charcoal=new THREE.MeshStandardMaterial({color:'#20211f',roughness:.87});
 const grey=new THREE.MeshStandardMaterial({color:'#a6a69f',roughness:1});
 const eyeWhite=new THREE.MeshStandardMaterial({color:'#d8ccba',roughness:.42});
 const brown=new THREE.MeshStandardMaterial({color:'#3c291c',roughness:.45});
 function add(name,geometry,material,p=[0,0,0]){const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(...p);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 function oval(name,p,scale,material=cotton){const m=add(name,new THREE.SphereGeometry(1,32,24),material,p);m.scale.set(...scale);return m;}
 function curve(name,points,r,material=cotton){return add(name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,8,false),material);}
 // Smooth ring surfaces with small fabric ripples. Each row is [height, depth, half-width, half-depth].
 function garment(name,rows,folds=7,amplitude=.0015,bent=false){
  const smooth=new THREE.CatmullRomCurve3(rows.map(r=>new THREE.Vector3(r[2],r[0],r[1]))),depth=new THREE.SplineCurve(rows.map((r,i)=>new THREE.Vector2(i/(rows.length-1),r[3])));
  const vertices=[],indices=[],around=80,along=52;
  for(let j=0;j<=along;j++){
   const t=j/along,center=smooth.getPoint(t),rz=depth.getPoint(t).y;
   const tangent=smooth.getTangent(t),span=Math.hypot(tangent.y,tangent.z)||1;
   const normalY=bent?Math.abs(tangent.z)/span:0,normalZ=bent?Math.abs(tangent.y)/span:1;
   for(let i=0;i<=around;i++){
    const a=i/around*Math.PI*2,wrinkle=amplitude*(Math.sin(a*folds+t*2.6)+.22*Math.sin(a*(folds+3)-t*5));
    vertices.push(Math.cos(a)*(center.x+wrinkle),center.y+Math.sin(a)*(rz+wrinkle)*normalY,center.z+Math.sin(a)*(rz+wrinkle)*normalZ);
    if(i<around&&j<along){const k=j*(around+1)+i;indices.push(k,k+around+1,k+1,k+1,k+around+1,k+around+2);}
   }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return add(name,geometry,cotton);
 }
 // One continuous shell from collar to hem avoids a visible waist/lap join.
 const torso=garment('Continuous seated thobe drape',[[1.14,-.04,.072,.069],[1.09,-.045,.18,.11],[1.02,-.045,.235,.125],[.87,-.035,.235,.154],[.70,-.025,.218,.145],[.59,.04,.21,.105],[.56,.16,.225,.105],[.53,.30,.23,.11],[.46,.43,.23,.14],[.29,.47,.235,.12],[.10,.49,.25,.12]],7,.0012,true);
 torso.material.side=THREE.DoubleSide;
 for(const side of [-1,1]){
  oval('Leather shoe',[side*.106,.046,.555],[.077,.037,.143],charcoal);
  const sleeve=curve('Soft upper sleeve',[[side*.195,1.045,-.045],[side*.24,.94,-.005],[side*.245,.80,.025]],.074);
  sleeve.scale.z=.9;
  curve('Bent forearm sleeve',[[side*.245,.80,.025],[side*.23,.73,.11],[side*.17,.655,.255]],.058);
  curve('Tailored cuff',[[side*.18,.663,.237],[side*.168,.650,.266]],.047);
  curve('Subtle cuff seam',[[side*.195,.671,.251],[side*.17,.688,.265],[side*.143,.667,.275]],.0012,seam);
  oval('Anatomical palm',[side*.151,.642,.294],[.038,.022,.052],skin);
  for(let finger=0;finger<4;finger++){
   const x=side*(.122+finger*.016),z=.322-(finger===3?.012:0);
   curve('Relaxed finger',[[x,.642,z],[x,.633,z+.026],[x,.622,z+.039]],.0075,skin);
   oval('Fingernail',[x,.628,z+.032],[.0045,.0015,.0075],eyeWhite);
  }
  curve('Resting thumb',[[side*.115,.642,.283],[side*.099,.633,.305],[side*.105,.622,.323]],.011,skin);
 }
 // Collar, subtle stitching, front placket, chest pocket and pen.
 garment('Standing thobe collar',[[1.102,-.035,.076,.072],[1.152,-.035,.074,.07]],0,0);
 curve('Front placket',[[0,1.108,.041],[0,1.01,.089],[0,.91,.119],[0,.78,.126]],.004,seam);
 for(const y of [1.075,1.015,.955])oval('Thobe button',[0,y,y>1.05?.066:.105],[.004,.004,.002],eyeWhite);
 curve('Chest pocket stitching',[[.075,.94,.105],[.077,.87,.12],[.14,.87,.107],[.145,.94,.095]],.0016,seam);
 curve('Pocket pen',[[.105,.92,.12],[.107,.98,.10]],.003,new THREE.MeshStandardMaterial({color:'#684234',roughness:.4}));
 // Sculpt the head with a narrower jaw and localized brow/cheek forms.
 const headGeometry=new THREE.SphereGeometry(1,64,48),positions=headGeometry.attributes.position;
 for(let i=0;i<positions.count;i++){
  let x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
  const jaw=1-.16*Math.max(0,-y),front=Math.max(0,z);
  x*=.100*jaw;z*=.088;
  z+=front*.009*Math.exp(-(((y+.10)/.22)**2)); // midface and cheeks
  z-=front*.006*Math.exp(-(((y-.20)/.14)**2)); // eye socket plane
  positions.setXYZ(i,x,y*.128,z);
 }
 headGeometry.computeVertexNormals();add('Sculpted elderly face',headGeometry,skin,[0,1.277,-.016]);
 for(const side of [-1,1]){
  oval('Ear',[side*.096,1.278,-.018],[.014,.026,.012],skin);
  oval('Cheek',[side*.053,1.258,.054],[.031,.028,.018],skin);
  oval('Eye socket',[side*.037,1.306,.062],[.022,.010,.004],skinShade);
  oval('Eye white',[side*.036,1.306,.073],[.016,.007,.005],eyeWhite);
  oval('Brown iris',[side*.035,1.305,.080],[.0055,.006,.0025],brown);
  oval('Pupil',[side*.035,1.305,.083],[.0028,.0038,.0015],charcoal);
  oval('Eye catchlight',[side*.032,1.309,.085],[.0018,.0018,.001],eyeWhite);
  curve('Upper eyelid',[[side*.015,1.308,.077],[side*.036,1.316,.080],[side*.057,1.308,.071]],.0025,skin);
  curve('Lower eyelid',[[side*.017,1.300,.076],[side*.036,1.295,.077],[side*.056,1.301,.069]],.0028,skin);
  curve('Grey eyebrow',[[side*.016,1.330,.072],[side*.036,1.337,.070],[side*.062,1.328,.058]],.005,grey);
  curve('Nasolabial crease',[[side*.025,1.272,.074],[side*.042,1.249,.068],[side*.041,1.231,.063]],.0015,skinShade);
  oval('Nose wing',[side*.016,1.267,.085],[.012,.010,.012],skin);
  oval('Nostril',[side*.014,1.262,.093],[.0038,.002,.003],skinShade);
 }
 oval('Nose bridge',[0,1.289,.077],[.012,.029,.014],skin);
 oval('Nose tip',[0,1.271,.095],[.016,.012,.013],skin);
 curve('Natural lips',[[-.025,1.240,.078],[0,1.237,.084],[.025,1.240,.078]],.0035,skinShade);
 for(const y of [1.35,1.36])curve('Fine forehead crease',[[-.040,y,.052],[0,y+.003,.061],[.040,y,.052]],.0008,skinShade);
 // A continuous groomed beard surface replaces the conspicuous bead-like curls.
 function beardPoint(t,a){
  const width=.091*(1-.77*Math.pow(t,1.5)),depth=.064*Math.sqrt(Math.max(0,1-t*t));
  return new THREE.Vector3(Math.sin(a)*width,1.242-.163*t,.024+.014*t+Math.cos(a)*depth);
 }
 const beardVertices=[],beardColors=[],beardIndices=[],beardRows=40,beardCols=64;
 for(let j=0;j<=beardRows;j++)for(let i=0;i<=beardCols;i++){
  const t=j/beardRows,a=-Math.PI/2+i/beardCols*Math.PI,p=beardPoint(t,a);
  const grain=.00045*Math.sin(a*91+t*25)*Math.sin(t*Math.PI);
  p.z+=grain;beardVertices.push(...p.toArray());
  const c=new THREE.Color().lerpColors(new THREE.Color('#858a85'),new THREE.Color('#c5c8bf'),Math.min(1,t*.85+.15));beardColors.push(c.r,c.g,c.b);
  if(j<beardRows&&i<beardCols){const k=j*(beardCols+1)+i;beardIndices.push(k,k+1,k+beardCols+1,k+1,k+beardCols+2,k+beardCols+1);}
 }
 const beardGeometry=new THREE.BufferGeometry();beardGeometry.setAttribute('position',new THREE.Float32BufferAttribute(beardVertices,3));beardGeometry.setAttribute('color',new THREE.Float32BufferAttribute(beardColors,3));beardGeometry.setIndex(beardIndices);beardGeometry.computeVertexNormals();
 const beardMaterial=grey.clone();beardMaterial.vertexColors=true;beardMaterial.color.set('#ffffff');beardMaterial.side=THREE.DoubleSide;
 add('Groomed silver beard',beardGeometry,beardMaterial);
 const tufts=new THREE.InstancedMesh(new THREE.SphereGeometry(1,12,8),grey,240),matrix=new THREE.Matrix4(),q=new THREE.Quaternion();
 tufts.name='Silver beard curls';
 const strands=[];
 for(let i=0;i<240;i++){
  const t=.08+(i+.5)/240*.87,a=((i*.61803398875)%1-.5)*Math.PI,p=beardPoint(t,a);p.z+=.0007;
  q.setFromAxisAngle(new THREE.Vector3(0,0,1),-a*.12);
  matrix.compose(p,q,new THREE.Vector3(.0016,.0045,.0017));tufts.setMatrixAt(i,matrix);
  tufts.setColorAt(i,new THREE.Color(['#a9aea7','#b8bcb4','#c1c4ba','#aeb3ac'][i%4]));
  const end=beardPoint(Math.min(.995,t+.05),a*.98);end.z+=.001;strands.push(p,end);
 }
 g.add(tufts);
 const fibers=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(strands),new THREE.LineBasicMaterial({color:'#d3d5cc',transparent:true,opacity:.16}));fibers.name='Fine groomed beard fibers';fibers.raycast=()=>{};g.add(fibers);
 for(const side of [-1,1]){
  const moustache=oval('Grey moustache',[side*.022,1.246,.083],[.026,.007,.009],grey);moustache.rotation.z=side*.13;
  oval('Grey sideburn',[side*.087,1.270,.011],[.012,.034,.017],grey);
 }
 // White ghutra is a folded cloth sheet that falls over the shoulders.
 const scarf=cotton.clone();scarf.side=THREE.DoubleSide;scarf.roughness=.92;
 oval('White ghutra crown',[0,1.365,-.035],[.132,.073,.12],scarf);
 for(const side of [-1,1]){
  const vertices=[],indices=[],cols=48,rows=48;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
   const u=i/cols,v=j/rows,ripple=Math.sin(u*13+v*3)*.0035*Math.sin(v*Math.PI);
   const flare=Math.sin(v*Math.PI*.65)*.072;
   const x=side*(.104+flare+Math.sin(u*Math.PI)*.027+ripple),y=1.362-v*(.265+.045*Math.sin(u*Math.PI)+.012*Math.sin(u*5+side)),z=.026-u*.215-v*.025+ripple;

   vertices.push(x,y,z);
   if(i<cols&&j<rows){const k=j*(cols+1)+i;indices.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();add('Folded white ghutra drape',geometry,scarf);
 }
 // Joined back cloth has a rounded bottom, instead of an oval pad under the sheet.
 const backVertices=[],backIndices=[],backCols=48,backRows=36;
 for(let j=0;j<=backRows;j++)for(let i=0;i<=backCols;i++){
  const u=i/backCols,v=j/backRows,x=(u-.5)*.29*(.9+.1*Math.sin(v*Math.PI)),y=1.365-v*(.28+.025*Math.sin(u*Math.PI)),z=-.139-.040*Math.sin(v*Math.PI/2)+.0025*Math.sin(u*17+v*2)*v;
  backVertices.push(x,y,z);
  if(i<backCols&&j<backRows){const k=j*(backCols+1)+i;backIndices.push(k,k+1,k+backCols+1,k+1,k+backCols+2,k+backCols+1);}
 }
 const backGeometry=new THREE.BufferGeometry();backGeometry.setAttribute('position',new THREE.Float32BufferAttribute(backVertices,3));backGeometry.setIndex(backIndices);backGeometry.computeVertexNormals();add('Soft ghutra back drape',backGeometry,scarf);
 for(const y of [1.382,1.395]){const ring=add('Black agal',new THREE.TorusGeometry(.116,.010,12,64),charcoal,[0,y,-.035]);ring.rotation.x=Math.PI/2;ring.scale.z=.92;}
 // Restrained prayer beads, hanging from the resting left hand.
 const beadMaterial=new THREE.MeshStandardMaterial({color:'#4b4240',roughness:.35});
 for(let i=0;i<27;i++){const a=i/27*Math.PI*2;oval('Prayer bead',[-.161+Math.cos(a)*.026,.55+Math.sin(a)*.081,.346],[.004,.005,.004],beadMaterial);}
 curve('Prayer bead tassel',[[-.16,.47,.346],[-.16,.43,.346]],.002,seam);
 return g;
}

function buildDetailedWoman(object){
 const g=new THREE.Group();g.name='Seated woman with niqab';
 const cloth=new THREE.MeshPhysicalMaterial({color:object.color||'#20232a',roughness:.88,sheen:.22,sheenColor:new THREE.Color('#737780'),sheenRoughness:.9,side:THREE.DoubleSide});
 const veil=cloth.clone();veil.color.multiplyScalar(.83);veil.sheen=.12;
 const seam=new THREE.MeshStandardMaterial({color:'#34373e',roughness:.95});
 const skin=new THREE.MeshStandardMaterial({color:'#bc9275',roughness:.82});
 const shoe=new THREE.MeshStandardMaterial({color:'#191b1e',roughness:.56});
 function add(name,geometry,material,p=[0,0,0]){const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(...p);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 function oval(name,p,scale,material=cloth){const m=add(name,new THREE.SphereGeometry(1,32,24),material,p);m.scale.set(...scale);return m;}
 function curve(name,points,r,material=cloth){return add(name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,10,false),material);}
 function drape(name,rows,material=cloth,bent=false){
  const path=new THREE.CatmullRomCurve3(rows.map(r=>new THREE.Vector3(r[2],r[0],r[1]))),depth=new THREE.SplineCurve(rows.map((r,i)=>new THREE.Vector2(i/(rows.length-1),r[3])));
  const vertices=[],indices=[],around=80,along=60;
  for(let j=0;j<=along;j++){
   const t=j/along,p=path.getPoint(t),rz=depth.getPoint(t).y,tangent=path.getTangent(t),span=Math.hypot(tangent.y,tangent.z)||1;
   const ny=bent?Math.abs(tangent.z)/span:0,nz=bent?Math.abs(tangent.y)/span:1;
   for(let i=0;i<=around;i++){
    const a=i/around*Math.PI*2,fold=.0013*(Math.sin(a*7+t*3)+.2*Math.sin(a*11-t*5));
    vertices.push(Math.cos(a)*(p.x+fold),p.y+Math.sin(a)*(rz+fold)*ny,p.z+Math.sin(a)*(rz+fold)*nz);
    if(i<around&&j<along){const k=j*(around+1)+i;indices.push(k,k+1,k+around+1,k+1,k+around+2,k+around+1);}
   }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return add(name,geometry,material);
 }
 drape('Continuous seated abaya',[[1.14,-.045,.073,.072],[1.08,-.045,.155,.10],[1.02,-.045,.205,.12],[.88,-.03,.202,.14],[.71,-.025,.20,.142],[.59,.04,.205,.105],[.56,.16,.22,.102],[.53,.30,.23,.11],[.46,.43,.23,.14],[.29,.47,.235,.12],[.10,.49,.25,.12]],cloth,true);
 for(const side of [-1,1]){
  oval('Closed leather shoe',[side*.102,.046,.55],[.074,.037,.14],shoe);
  curve('Soft abaya upper sleeve',[[side*.172,1.035,-.045],[side*.227,.92,-.005],[side*.237,.79,.025]],.071);
  curve('Soft abaya forearm sleeve',[[side*.237,.79,.025],[side*.22,.72,.12],[side*.165,.65,.26]],.055);
  curve('Abaya cuff',[[side*.175,.658,.24],[side*.161,.646,.269]],.043);
  curve('Subtle sleeve stitching',[[side*.187,.667,.249],[side*.162,.681,.26],[side*.14,.661,.272]],.0011,seam);
  oval('Resting hand',[side*.148,.639,.295],[.037,.021,.052],skin);
  for(let finger=0;finger<4;finger++){
   const x=side*(.119+finger*.016),z=.321-(finger===3?.012:0);
   curve('Relaxed finger',[[x,.64,z],[x,.631,z+.025],[x,.620,z+.038]],.0074,skin);
   oval('Natural fingernail',[x,.626,z+.032],[.004,.0015,.007],new THREE.MeshStandardMaterial({color:'#cda98e',roughness:.7}));
  }
  curve('Relaxed thumb',[[side*.115,.639,.285],[side*.098,.632,.303],[side*.104,.622,.32]],.010,skin);
 }
 // Smooth hood and a falling shoulder cape replace the old padded neck ring.
 oval('Hijab hood',[0,1.274,-.039],[.124,.163,.127],veil);
 drape('Soft hijab shoulder drape',[[1.23,-.055,.089,.08],[1.17,-.05,.104,.09],[1.09,-.04,.165,.12],[1.025,-.035,.222,.139],[.97,-.027,.194,.143]],veil);
 // The only exposed face geometry is this narrow eye band. No nose or mouth
 // geometry is created, preventing uncovered skin from peeking through the veil.
 const bandShape=new THREE.Shape();bandShape.moveTo(-.073,1.299);bandShape.quadraticCurveTo(0,1.293,.073,1.299);bandShape.lineTo(.073,1.317);bandShape.quadraticCurveTo(0,1.323,-.073,1.317);bandShape.closePath();
 add('Niqab eye opening',new THREE.ShapeGeometry(bandShape,24),skin,[0,0,.122]);
 function facePanel(name,top,bottom,widthTop,widthBottom){
  const vertices=[],indices=[],cols=48,rows=32;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
   const v=j/rows,u=i/cols*2-1,width=THREE.MathUtils.lerp(widthTop,widthBottom,v),fold=.0014*Math.sin(u*11+v*3)*Math.sin(v*Math.PI);
   const upper=name==='Niqab brow cover';
   const y=THREE.MathUtils.lerp(top,bottom,v)-(upper?0:.012*v*(1-u*u));
   const z=upper?THREE.MathUtils.lerp(.028,.122,v)+.014*(1-u*u)-.025*u*u+fold:.116+.020*(1-u*u)-.060*u*u+fold-v*.015;
   vertices.push(u*width,y,z);
   if(i<cols&&j<rows){const k=j*(cols+1)+i;indices.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return add(name,geometry,veil);
 }
 facePanel('Niqab face cover',1.297,1.075,.102,.151);
 facePanel('Niqab brow cover',1.407,1.320,.066,.104);
 curve('Niqab upper opening seam',[[-.074,1.320,.125],[0,1.320,.138],[.074,1.320,.125]],.0012,seam);
 curve('Niqab lower opening seam',[[-.074,1.297,.125],[0,1.297,.138],[.074,1.297,.125]],.0012,seam);
 const eyeWhite=new THREE.MeshStandardMaterial({color:'#d6caba',roughness:.6}),iris=new THREE.MeshStandardMaterial({color:'#33291f',roughness:.5});
 for(const side of [-1,1]){
  oval('Eye white',[side*.033,1.308,.126],[.015,.0055,.004],eyeWhite);
  oval('Brown eye',[side*.033,1.308,.130],[.005,.005,.002],iris);
  curve('Soft upper eyelid',[[side*.019,1.309,.129],[side*.033,1.314,.130],[side*.047,1.309,.128]],.0018,skin);
 }
 return g;
}
