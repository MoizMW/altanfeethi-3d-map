import * as THREE from 'three';

export const avatarSize=[.64,1.45,.92];
// Stylized adult display figures. Local +Z faces forward, matching lounge chairs.
export function buildHumanAvatar(object){
 const group=new THREE.Group();group.name='Seated cultural avatar';
 const female=object.variant==='saudi-abaya-seated';
 if(!female)return buildDetailedMan(object);
 const cloth=new THREE.MeshStandardMaterial({color:object.color||(female?'#20232a':'#f1eee5'),roughness:.88});
 const fold=new THREE.MeshStandardMaterial({color:female?'#363941':'#d9d5ca',roughness:.9});
 const skin=new THREE.MeshStandardMaterial({color:'#bc8d6b',roughness:.82});
 const dark=new THREE.MeshStandardMaterial({color:'#252624',roughness:.64});
 function ellipsoid(name,p,size,material=cloth){const m=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),material);m.name=name;m.position.set(...p);m.scale.set(...size);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
 function tube(name,a,b,r,material=cloth,r2=r){const delta=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r,delta.length(),20),material);m.name=name;m.position.copy(new THREE.Vector3(...a).addScaledVector(delta,.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
 // A continuous modest garment covers the torso, lap and bent legs.
 ellipsoid(female?'Abaya bodice':'Thobe bodice',[0,.86,-.035],[.22,.32,.145]);
 ellipsoid('Draped seated lap',[0,.55,.19],[.235,.12,.30]);
 const skirt=tube('Full length draped garment',[0,.09,.40],[0,.55,.40],.245,cloth,.215);skirt.scale.z=.57;
 for(const x of [-.17,-.085,0,.085,.17])tube('Subtle garment fold',[x,.13,.53],[x*.85,.49,.54],.0025,fold);
 for(const side of [-1,1]){
  ellipsoid('Closed shoe',[side*.105,.055,.55],[.078,.047,.15],dark);
  tube('Upper sleeve',[side*.19,1.04,-.015],[side*.235,.78,.035],.064,cloth,.06);
  tube('Forearm sleeve',[side*.235,.78,.035],[side*.15,.65,.27],.056,cloth,.045);
  ellipsoid('Resting hand',[side*.135,.65,.31],[.052,.027,.078],skin);
 }
 tube('Covered neckline',[0,1.07,-.035],[0,1.19,-.035],.075);
 if(female){
  ellipsoid('Hijab hood',[0,1.27,-.04],[.133,.166,.13]);
  ellipsoid('Hijab shoulder drape',[0,1.075,-.045],[.232,.16,.16]);
  ellipsoid('Face framed by hijab',[0,1.285,.072],[.081,.103,.039],skin);
  for(const side of [-1,1])tube('Hijab face edge',[side*.076,1.35,.092],[side*.083,1.18,.087],.012);
 }
 const faceZ=female?.111:.084;
 for(const x of [-.031,.031])ellipsoid('Eye',[x,1.30,faceZ],[.009,.006,.003],dark);
 ellipsoid('Nose',[0,1.267,faceZ+.008],[.013,.021,.015],skin);
 tube('Neutral mouth',[-.021,1.235,faceZ],[.021,1.235,faceZ],.0025,new THREE.MeshStandardMaterial({color:'#8d5d49',roughness:.9}));
 return group;
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
 function garment(name,rows,folds=16,amplitude=.004){
  const smooth=new THREE.CatmullRomCurve3(rows.map(r=>new THREE.Vector3(r[2],r[0],r[1]))),depth=new THREE.SplineCurve(rows.map((r,i)=>new THREE.Vector2(i/(rows.length-1),r[3])));
  const vertices=[],indices=[],around=80,along=52;
  for(let j=0;j<=along;j++){
   const t=j/along,center=smooth.getPoint(t),rz=depth.getPoint(t).y;
   for(let i=0;i<=around;i++){
    const a=i/around*Math.PI*2,wrinkle=amplitude*(Math.sin(a*folds+t*6)+.35*Math.sin(a*folds*2-t*13));
    vertices.push(Math.cos(a)*(center.x+wrinkle),center.y+wrinkle*.25,center.z+Math.sin(a)*(rz+wrinkle));
    if(i<around&&j<along){const k=j*(around+1)+i;indices.push(k,k+around+1,k+1,k+1,k+around+1,k+around+2);}
   }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return add(name,geometry,cotton);
 }
 const torso=garment('Tailored thobe with fabric folds',[[.55,.00,.20,.13],[.70,-.025,.218,.158],[.87,-.035,.235,.154],[1.02,-.045,.235,.125],[1.09,-.045,.18,.11],[1.14,-.04,.072,.069]],18,.0035);
 torso.material.side=THREE.DoubleSide;
 // One unbroken skirt surface follows the seated lap, knees and hanging hem.
 garment('Continuous seated thobe drape',[[.64,.025,.20,.15],[.60,.14,.224,.235],[.55,.27,.235,.235],[.47,.40,.245,.17],[.32,.45,.237,.145],[.15,.47,.255,.14],[.085,.48,.25,.135]],22,.0055);
 for(const side of [-1,1]){
  oval('Leather shoe',[side*.106,.046,.555],[.077,.037,.143],charcoal);
  const sleeve=curve('Soft upper sleeve',[[side*.195,1.045,-.045],[side*.24,.94,-.005],[side*.245,.80,.025]],.074);
  sleeve.scale.z=.9;
  curve('Bent forearm sleeve',[[side*.245,.80,.025],[side*.23,.73,.11],[side*.17,.655,.255]],.058);
  curve('Tailored cuff',[[side*.18,.663,.237],[side*.168,.650,.266]],.047);
  for(let f=0;f<3;f++)curve('Sleeve compression fold',[[side*.22,.77+f*.023,.065],[side*.264,.76+f*.023,.096],[side*.25,.75+f*.023,.12]],.0018,seam);
  oval('Anatomical palm',[side*.151,.642,.294],[.041,.024,.057],skin);
  for(let finger=0;finger<4;finger++){
   const x=side*(.12+finger*.018),z=.327-(finger===3?.014:0);
   curve('Relaxed finger',[[x,.647,z],[x,.635,z+.028],[x,.620,z+.044]],.0085,skin);
   oval('Fingernail',[x,.626,z+.039],[.005,.002,.009],eyeWhite);
  }
  curve('Resting thumb',[[side*.115,.642,.283],[side*.099,.633,.305],[side*.105,.622,.323]],.011,skin);
 }
 // Collar, subtle stitching, front placket, chest pocket and pen.
 garment('Standing thobe collar',[[1.102,-.035,.076,.072],[1.152,-.035,.074,.07]],48,.0005);
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
  oval('Ear',[side*.096,1.278,-.018],[.017,.030,.013],skin);
  oval('Cheek',[side*.053,1.258,.054],[.035,.031,.025],skin);
  oval('Eye socket',[side*.037,1.306,.062],[.025,.012,.007],skinShade);
  oval('Eye white',[side*.036,1.306,.073],[.016,.007,.005],eyeWhite);
  oval('Brown iris',[side*.035,1.305,.080],[.0055,.006,.0025],brown);
  oval('Pupil',[side*.035,1.305,.083],[.0028,.0038,.0015],charcoal);
  oval('Eye catchlight',[side*.032,1.309,.085],[.0018,.0018,.001],eyeWhite);
  curve('Upper eyelid',[[side*.015,1.308,.077],[side*.036,1.316,.080],[side*.057,1.308,.071]],.0035,skin);
  curve('Lower eyelid',[[side*.017,1.300,.076],[side*.036,1.295,.077],[side*.056,1.301,.069]],.0028,skin);
  curve('Grey eyebrow',[[side*.016,1.330,.072],[side*.036,1.337,.070],[side*.062,1.328,.058]],.005,grey);
  curve('Nasolabial crease',[[side*.025,1.272,.074],[side*.042,1.249,.068],[side*.041,1.231,.063]],.0015,skinShade);
  oval('Nose wing',[side*.016,1.267,.085],[.012,.010,.012],skin);
  oval('Nostril',[side*.014,1.262,.093],[.005,.0028,.004],skinShade);
 }
 oval('Nose bridge',[0,1.289,.077],[.014,.032,.018],skin);
 oval('Nose tip',[0,1.271,.095],[.018,.014,.017],skin);
 curve('Natural lips',[[-.025,1.240,.078],[0,1.237,.084],[.025,1.240,.078]],.0035,skinShade);
 for(const y of [1.35,1.36])curve('Fine forehead crease',[[-.040,y,.052],[0,y+.003,.061],[.040,y,.052]],.0008,skinShade);
 // Layered silver beard: a shaped base, varied tufts and fine directional strands.
 oval('Full grey beard',[0,1.171,.034],[.096,.102,.073],grey);
 const tufts=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),grey,240),matrix=new THREE.Matrix4(),q=new THREE.Quaternion();
 tufts.name='Silver beard curls';
 for(let i=0;i<240;i++){
  const t=(i+.5)/240,a=i*2.399963,sy=Math.sqrt(1-t*t),x=Math.cos(a)*.091*sy,y=1.215-t*.135,z=.046+Math.abs(Math.sin(a))*.062*sy;
  matrix.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(.006+(i%3)*.001,.011+(i%5)*.0015,.006));tufts.setMatrixAt(i,matrix);
  tufts.setColorAt(i,new THREE.Color(['#cccac2','#90938e','#b2b4ab','#e0ded5'][i%4]));
 }
 tufts.castShadow=true;g.add(tufts);
 for(const side of [-1,1]){
  const moustache=oval('Grey moustache',[side*.023,1.247,.085],[.028,.010,.012],grey);moustache.rotation.z=side*.16;
  oval('Grey sideburn',[side*.086,1.268,.014],[.019,.044,.026],grey);
 }
 // White ghutra is a folded cloth sheet that falls over the shoulders.
 const scarf=cotton.clone();scarf.side=THREE.DoubleSide;scarf.roughness=.92;
 oval('White ghutra crown',[0,1.365,-.035],[.132,.073,.12],scarf);
 for(const side of [-1,1]){
  const vertices=[],indices=[],cols=32,rows=36;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
   const u=i/cols,v=j/rows,ripple=Math.sin(u*28+v*5)*.006*Math.sin(v*Math.PI);
   const x=side*(.105+v*.10+Math.sin(u*Math.PI)*.028+ripple),y=1.362-v*(.30+.035*Math.sin(u*4+side)),z=.038-u*.235-v*.045+ripple;
   vertices.push(x,y,z);
   if(i<cols&&j<rows){const k=j*(cols+1)+i;indices.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();add('Folded white ghutra drape',geometry,scarf);
 }
 oval('Ghutra back fall',[0,1.19,-.150],[.153,.18,.026],scarf);
 for(const y of [1.382,1.395]){const ring=add('Black agal',new THREE.TorusGeometry(.116,.010,12,64),charcoal,[0,y,-.035]);ring.rotation.x=Math.PI/2;ring.scale.z=.92;}
 // Restrained prayer beads, hanging from the resting left hand.
 const beadMaterial=new THREE.MeshStandardMaterial({color:'#4b4240',roughness:.35});
 for(let i=0;i<27;i++){const a=i/27*Math.PI*2;oval('Prayer bead',[-.161+Math.cos(a)*.026,.55+Math.sin(a)*.081,.346],[.004,.005,.004],beadMaterial);}
 curve('Prayer bead tassel',[[-.16,.47,.346],[-.16,.43,.346]],.002,seam);
 return g;
}
