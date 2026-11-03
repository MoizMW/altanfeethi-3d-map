import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {validateBlock} from './shared/schema/block-schema.js';
import {receptionSizes, buildReceptionObject} from './reception-objects.js';
import {buildArchitecture} from './architecture.js';
import {buildEggChair,buildShellLoungeChair} from './lounge-objects.js';
import {buildNestedStoneTable} from './lounge-tables.js';
import {buildLobbyFixture} from './lobby-fixtures.js';
const $=id=>document.getElementById(id), status=message=>$('status').textContent=message;
let block, revision, selected, dirty=false, history=[], view='iso', tool='select', dragStart;
const blockKey=new URLSearchParams(location.search).get('block')||'ground/g9';
const layoutKey=new URLSearchParams(location.search).get('layout');
const api=path=>`${path}${path.includes('?')?'&':'?'}${layoutKey?'layout':'block'}=${encodeURIComponent(layoutKey||blockKey)}`;
const viewport=$('viewport'), scene=new THREE.Scene();scene.background=new THREE.Color('#e7e8e4');
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;viewport.prepend(renderer.domElement);
const ortho=new THREE.OrthographicCamera(-4,4,4,-4,.1,100), perspective=new THREE.PerspectiveCamera(40,1,.1,100);let camera=ortho;
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2-.02;controls.minDistance=3;controls.maxDistance=25;
const transform=new TransformControls(camera,renderer.domElement),transformHelper=transform.getHelper();scene.add(transformHelper);transformHelper.visible=false;transform.showY=false;transform.enabled=false;
transform.addEventListener('dragging-changed',e=>{controls.enabled=!e.value;});
scene.add(new THREE.HemisphereLight('#fff7e6','#66706b',2.3));const light=new THREE.DirectionalLight('#fff5df',3.3);light.position.set(3,8,5);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-5,right:5,top:5,bottom:-5});light.shadow.bias=-.0004;scene.add(light);
const root=new THREE.Group();scene.add(root);let objects=new Map(),labelNodes=[];const selection=new THREE.BoxHelper(undefined,'#ad8f50');selection.visible=false;scene.add(selection);
const mat=(color,roughness=.65,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function mesh(group,geometry,material,p){const m=new THREE.Mesh(geometry,material);m.position.set(...p);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function box(g,dim,p,m,r=.04){return mesh(g,new RoundedBoxGeometry(...dim,3,Math.min(r,...dim.map(d=>d/3))),m,p);}
function rod(g,a,b,r,m){const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const s=mesh(g,new THREE.CylinderGeometry(r,r,d.length(),6),m,new THREE.Vector3(...a).addScaledVector(d,.5).toArray());s.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return s;}
const referenceSize={sofa:[2.05,.88,.9],armchair:[.88,.9,.92],table:[1.5,.42,.78],screen:[3.8,2.3,.07],plant:[.5,1.7,.5],...receptionSizes};
const isChair=o=>['armchair','office-chair'].includes(o.type);
const objectLabel=o=>o.seats.length?`${o.type==='sofa'?'Sofa':'Chair'} · ${o.seats.map(s=>s.replace(/^Seat_/, '')).join(' / ')}`:o.type==='table'?`${o.name.split(' · ')[0]}${o.externalId?' · '+o.externalId:''}`:o.name;
function build(o){const g=new THREE.Group(),[w,h,d]=referenceSize[o.type], fabric=mat(o.color),dark=mat('#303b3a',.4),gold=mat('#ab9564',.35,.6);g.userData.objectId=o.id;
 if(buildLobbyFixture(g,o,{box,mesh,rod,mat,referenceSize,THREE})){}
 else if(receptionSizes[o.type])buildReceptionObject(g,o,{box,mesh,rod,mat});
 else if(o.type==='armchair'&&o.variant==='egg-swivel')g.add(buildEggChair(o.color));
 else if(o.type==='armchair'&&o.variant==='shell-lounge')g.add(buildShellLoungeChair(o));
 else if(o.type==='sofa'||o.type==='armchair'){
  const n=o.type==='sofa'?2:1;
  box(g,[w,.22,d],[0,.29,0],fabric,.09);
  box(g,[w,.47,.2],[0,h-.25,-d/2+.09],fabric,.09);
  if(o.variant!=='armless')for(const x of [-w/2+.09,w/2-.09])box(g,[.18,.43,d*.91],[x,.52,0],fabric,.08);
  for(let i=0;i<n;i++){const x=(i-(n-1)/2)*(w-.35)/n;box(g,[(w-.38)/n,.16,d*.71],[x,.47,.08],fabric,.065);if(o.variant!=='armless'){const cushion=box(g,[(w-.4)/n*.78,.39,.14],[x,.73,-d*.19],mat(o.type==='sofa'?'#9fafab':'#889fa3'),.055);cushion.rotation.x=-.17;}}
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
  mesh(g,new THREE.CylinderGeometry(w*.46,w*.32,.5,24),mat('#d7d8cf'),[0,.25,0]);
  for(let i=0;i<11;i++){const a=i*2.4,x=Math.cos(a)*w*.47,z=Math.sin(a)*d*.47,y=.9+(i%4)*.19;rod(g,[0,.4,0],[x,y,z],.013,dark);const leaf=mesh(g,new THREE.SphereGeometry(1,10,8),fabric,[x,y,z]);leaf.scale.set(.13,.35,.065);leaf.rotation.set(.3,a,.6);}
 }
 g.position.fromArray(o.position);g.rotation.y=THREE.MathUtils.degToRad(o.yaw);g.scale.fromArray(o.size.map((v,i)=>v/referenceSize[o.type][i]*(o.scale?.[i]??1)));return g;
}
function floor(){if(block.architecture?.floorSections){const group=new THREE.Group();for(const section of block.architecture.floorSections){const tile=new THREE.Group();box(tile,[section.size[0],.12,section.size[1]],[0,-.08,0],mat(section.color,.35),.01);tile.position.set(section.center[0],0,section.center[1]);tile.rotation.y=THREE.MathUtils.degToRad(section.yaw||0);const pts=[],[w,d]=section.size;for(let x=-w/2+.6;x<w/2;x+=.6)pts.push(new THREE.Vector3(x,-.014,-d/2),new THREE.Vector3(x,-.014,d/2));for(let z=-d/2+.6;z<d/2;z+=.6)pts.push(new THREE.Vector3(-w/2,-.014,z),new THREE.Vector3(w/2,-.014,z));tile.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:'#717878',transparent:true,opacity:.45})));group.add(tile);}for(const circulation of block.architecture.circulations||[]){const shape=new THREE.Shape();circulation.polygon.forEach(([x,z],i)=>{if(i===0)shape.moveTo(x,-z);else shape.lineTo(x,-z);});shape.closePath();const surface=new THREE.Mesh(new THREE.ShapeGeometry(shape),mat('#d7d4c9',.4));surface.rotation.x=-Math.PI/2;surface.position.y=-.012;surface.receiveShadow=true;group.add(surface);}return group;}const g=new THREE.Group(),[w,d]=block.floorSize;box(g,[w,.12,d],[0,-.08,0],mat('#424747',.35),.02);
 const lineMat=new THREE.LineBasicMaterial({color:'#717878',transparent:true,opacity:.45});const pts=[];
 for(let x=-w/2+.6;x<w/2;x+=.6)pts.push(new THREE.Vector3(x,-.014,-d/2),new THREE.Vector3(x,-.014,d/2));
for(let z=-d/2+.6;z<d/2;z+=.6)pts.push(new THREE.Vector3(-w/2,-.014,z),new THREE.Vector3(w/2,-.014,z));g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),lineMat));const circulation=block.architecture?.circulation;if(circulation?.polygon&&circulation.surfaceMaterial!=='same-as-seating'){const shape=new THREE.Shape();circulation.polygon.forEach(([x,z],i)=>{const cx=x-(block.architecture.floorCenter?.[0]||0),cz=z-(block.architecture.floorCenter?.[1]||0);if(i===0)shape.moveTo(cx,-cz);else shape.lineTo(cx,-cz);});shape.closePath();const surface=new THREE.Mesh(new THREE.ShapeGeometry(shape),mat('#d7d4c9',.4));surface.rotation.x=-Math.PI/2;surface.position.y=-.012;surface.receiveShadow=true;g.add(surface);}if(block.architecture?.floorCenter)g.position.set(block.architecture.floorCenter[0],0,block.architecture.floorCenter[1]);return g;}
function rebuild(){transform.detach();root.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.dispose();}});root.clear();objects.clear();labelNodes.forEach(l=>l.el.remove());labelNodes=[];root.add(floor());refreshArchitecture();
 for(const o of block.objects){const g=build(o);root.add(g);objects.set(o.id,g);o.seats.forEach((s,i)=>{const el=document.createElement('span');el.className='seat-label';el.textContent=s.startsWith('Seat_SGS_TMP_')?`SGS ${s.slice(-2)}*`:s.replace('Seat_','');el.title=s;$('labels-layer').append(el);labelNodes.push({el,g,p:new THREE.Vector3((i-(o.seats.length-1)/2)*.65,1.02,0)});});}
 $('objects').replaceChildren();for(const o of block.objects){const button=document.createElement('button');button.textContent=objectLabel(o);button.dataset.id=o.id;button.onclick=()=>select(o.id);$('objects').append(button);}const next=selected&&objects.has(selected)?selected:block.objects[0]?.id;if(next)select(next);else{selected=null;selection.visible=false;transform.detach();transformHelper.visible=false;$('object-name').textContent='No objects yet';$('object-info').textContent='Add a supported object to objects.json, then reload.';}applyVisibility();}
function select(id){selected=id;const o=block.objects.find(o=>o.id===id),display=v=>Number(v.toFixed(3));$('object-name').textContent=objectLabel(o);$('object-info').textContent=[o.seats.join(' / ')||o.externalId||'Context object',o.confidence].join(' · ');$('x').value=display(o.position[0]);$('y').value=display(o.position[1]);$('z').value=display(o.position[2]);$('yaw').value=display(o.yaw);['width','height','depth'].forEach((id,i)=>$(id).value=display(o.size[i]));['scale-x','scale-y','scale-z'].forEach((id,i)=>$(id).value=display(o.scale?.[i]??1));$('color').value=o.color;$('seat-field').hidden=!isChair(o);$('seat-id').value=isChair(o)?o.seats[0]:'';$('sofa-seat-field').hidden=o.type!=='sofa';$('sofa-seat-inputs').replaceChildren();if(o.type==='sofa')o.seats.forEach((seat,i)=>{const label=document.createElement('label');label.textContent=`Seat slot ${i+1} · local ${i===0?'left':i===o.seats.length-1?'right':'middle'}`;const input=document.createElement('input');input.type='text';input.value=seat;input.spellcheck=false;input.dataset.seatSlot=i;label.append(input);$('sofa-seat-inputs').append(label);});$('gate-field').hidden=o.type!=='automatic-glass-gate';$('gate-opening').value=Math.round((o.openFraction??0)*100);$('table-field').hidden=o.type!=='table';$('table-id').value=o.type==='table'?(o.externalId||''):'';document.querySelectorAll('[data-id]').forEach(b=>b.classList.toggle('active',b.dataset.id===id));selection.setFromObject(objects.get(id));selection.visible=true;transform.attach(objects.get(id));transformHelper.visible=tool!=='select';}
function refreshArchitecture(){const old=root.getObjectByName('Architecture');if(old){old.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});root.remove(old);}if(block?.architecture)root.add(buildArchitecture({...block.architecture,walls:$('walls').checked?block.architecture.walls:[]},{cutaway:$('wall-cutaway').checked,ceiling:$('ceiling').checked}));}
function applyVisibility(){for(const o of block.objects)if(['screen','wall-panel'].includes(o.type))objects.get(o.id).visible=$('screen').checked;selection.visible=selected?(objects.get(selected)?.visible??false):false;}
function setView(mode){view=mode;camera=mode==='orbit'?perspective:ortho;controls.object=camera;transform.camera=camera;camera.up.set(0,1,0);const size=Math.max(...(block?.floorSize||[4.8,4.8])),factor=Math.max(1,size/5.2);camera.far=Math.max(100,size*10);camera.updateProjectionMatrix();camera.position.set(...(mode==='top'?[0,Math.max(10,size*2),.001]:[6*factor,6*factor,7*factor]));const center=block?.architecture?.floorCenter||[0,0];camera.position.x+=center[0];camera.position.z+=center[1];controls.target.set(center[0],mode==='top'?0:Math.min(1,size*.07),center[1]);controls.maxDistance=Math.max(25,size*5);controls.enableRotate=mode!=='top';camera.zoom=1;controls.update();resize();document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===mode));}
function setTool(mode){if(layoutKey&&mode!=='select')return;tool=mode;transform.enabled=mode!=='select';transformHelper.visible=mode!=='select';if(mode!=='select')transform.setMode(mode);transform.showY=mode!=='translate';transform.showX=mode!=='rotate';transform.showZ=mode!=='rotate';document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===mode));}
function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);perspective.aspect=w/h;perspective.updateProjectionMatrix();let span=3.6;
 if(block&&Math.max(...block.floorSize)>5.2){
  // Fit all eight scene bounds in the current camera axes, including tall panels.
  camera.updateMatrixWorld();const bounds=new THREE.Box3().setFromObject(root);let horizontal=0,vertical=0;
  const target=controls.target.clone().applyMatrix4(camera.matrixWorldInverse);
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
   const p=new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse).sub(target);horizontal=Math.max(horizontal,Math.abs(p.x));vertical=Math.max(vertical,Math.abs(p.y));
  }
  span=Math.max(3.6,vertical,horizontal/(w/h))*1.18;
 }
 ortho.left=-span*w/h;ortho.right=span*w/h;ortho.top=span;ortho.bottom=-span;ortho.updateProjectionMatrix();}
new ResizeObserver(resize).observe(viewport);
const ray=new THREE.Raycaster();let down;
renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(!block||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);for(const hit of ray.intersectObjects([...objects.values()].filter(g=>g.visible),true)){let o=hit.object;while(o&&!o.userData.objectId)o=o.parent;if(o){select(o.userData.objectId);break;}}});
const checkpoint=()=>{history.push(structuredClone(block));if(history.length>50)history.shift();dirty=true;status('Unsaved changes');};
transform.addEventListener('mouseDown',()=>{if(block&&selected)dragStart=structuredClone(block);});
transform.addEventListener('mouseUp',()=>{if(!dragStart||!selected)return;const o=block.objects.find(o=>o.id===selected),g=objects.get(selected);if(!o||!g){dragStart=null;return;}const previous=dragStart;dragStart=null;
 const before=JSON.stringify(o);o.position=g.position.toArray();o.yaw=THREE.MathUtils.radToDeg(g.rotation.y);o.scale=g.scale.toArray().map((v,i)=>v/(o.size[i]/referenceSize[o.type][i]));
 try{validateBlock(block);if(JSON.stringify(o)!==before){history.push(previous);if(history.length>50)history.shift();dirty=true;status('Unsaved changes');}else select(selected);}catch(e){block=previous;rebuild();status(e.message);return;}select(selected);
});
$('apply').onclick=()=>{try{const next=structuredClone(block),o=next.objects.find(o=>o.id===selected);const ids=['x','y','z','yaw','width','height','depth','scale-x','scale-y','scale-z'];if(ids.some(id=>$(id).value.trim()===''))throw Error('Fill all numeric fields.');o.position=['x','y','z'].map(id=>Number($(id).value));o.yaw=Number($('yaw').value);o.size=['width','height','depth'].map(id=>Number($(id).value));o.scale=['scale-x','scale-y','scale-z'].map(id=>Number($(id).value));o.color=$('color').value;if(o.type==='automatic-glass-gate'){if($('gate-opening').value.trim()==='')throw Error('Enter the gate opening percentage.');o.openFraction=Number($('gate-opening').value)/100;}if(isChair(o))o.seats=[$('seat-id').value.trim()];if(o.type==='sofa')o.seats=[...$('sofa-seat-inputs').querySelectorAll('input')].map(input=>input.value.trim());if(o.type==='table'){const tableId=$('table-id').value.trim();if(tableId)o.externalId=tableId;else delete o.externalId;}validateBlock(next);checkpoint();block=next;rebuild();}catch(e){status(e.message);}};
$('undo').onclick=()=>{if(history.length){block=history.pop();dirty=true;rebuild();status('Undone · unsaved');}};
$('save').onclick=async()=>{const button=$('save');button.disabled=true;try{validateBlock(block);const submitted=JSON.stringify(block);const r=await fetch(api('/api/block'),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,block:JSON.parse(submitted)})});const result=await r.json();if(!r.ok)throw Error(result.error);revision=result.revision;dirty=JSON.stringify(block)!==submitted;status(dirty?'Saved prior state; newer edits are still unsaved.':'Saved objects.json · backup retained');}catch(e){status(e.message);}finally{button.disabled=false;}};
$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(block,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`${blockKey.replace('/','-')}-block.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onclick=()=>$('file').click();$('file').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;const next=validateBlock(JSON.parse(await f.text()));checkpoint();block=next;rebuild();status('Imported draft · Save block to write to disk');}catch(e){status(e.message);}e.target.value='';};
function showPhoto(id,wide=false){$('photo').src=api(`/api/evidence/camera/${encodeURIComponent(id)}${wide?'?wide=1':''}`);$('photo').alt=`${id} camera reference`;$('photo-link').href=$('photo').src;$('photo-note').textContent=`${id} · ${wide?'wide architecture capture · detection ROIs do not apply':'detection view'} · ${block.name}`;}
function configureBlockUI(){document.title=`${block.name} — Altanfeethi Spatial Twin`;$('block-code').textContent=(block.displayCode||block.groups?.join(' / ')||block.id).toUpperCase();$('block-name').textContent=block.name.replace(/^.*?·\s*/, '');$('block-badge').textContent=`${block.floor.toUpperCase()} FLOOR · ZONE ${block.zone||'—'}`;const count=type=>block.objects.filter(o=>o.type===type).length,word=(n,singular)=>`${n} ${singular}${n===1?'':'s'}`,seats=block.objects.flatMap(o=>o.seats).length;$('block-summary').textContent=`${word(count('armchair'),'armchair')} · ${word(count('sofa'),'sofa')} · ${word(seats,'seat')} · ${word(count('table'),'table')}`;if(count('privacy-pod'))$('block-summary').textContent=`${word(count('privacy-pod'),'pod')} · Walking area`;if(count('counter'))$('block-summary').textContent=`${word(count('counter'),'counter')} · ${word(count('office-chair'),'staff chair')} · ${word(count('display'),'display')}`;if(layoutKey)$('block-summary').textContent=[word(seats,'seat'),word(count('sofa'),'sofa'),word(count('armchair'),'armchair'),word(count('table'),'table'),...(count('privacy-pod')?[word(count('privacy-pod'),'pod')]:[]),...(count('counter')?[word(count('counter'),'reception counter')]:[])].join(' · ');$('handoff-notes').textContent=block.evidence.notes.slice(0,2).join(' ');const extent=Math.max(...block.floorSize);Object.assign(light.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent});light.shadow.camera.updateProjectionMatrix();$('evidence-tabs').replaceChildren();for(const id of block.evidence.cameras){const button=document.createElement('button');button.textContent=id;button.onclick=()=>showPhoto(id);$('evidence-tabs').append(button);if(block.evidence.wideSnapshots?.[id]){const wideButton=document.createElement('button');wideButton.textContent=`${id} wide`;wideButton.onclick=()=>showPhoto(id,true);$('evidence-tabs').append(wideButton);}}if(block.evidence.cameras[0])showPhoto(block.evidence.cameras[0]);else{$('photo').hidden=true;$('photo-note').textContent='No camera evidence listed.';}$('map-link').href=api('/api/evidence/map');}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;const key={w:'translate',e:'rotate',r:'scale',q:'select'}[e.key.toLowerCase()];if(key)setTool(key);});$('screen').onchange=applyVisibility;
for(const id of ['walls','wall-cutaway','ceiling'])$(id).onchange=()=>{refreshArchitecture();resize();};
$('block-picker').onchange=()=>{if(dirty&&!confirm('There are unsaved edits. Switch blocks and discard them?')){$('block-picker').value=layoutKey?'layout:'+layoutKey:blockKey;return;}dirty=false;const value=$('block-picker').value;location.href=value.startsWith('layout:')?`/?layout=${encodeURIComponent(value.slice(7))}`:`/?block=${encodeURIComponent(value)}`;};
async function loadBlockPicker(){try{const response=await fetch('/api/blocks');if(!response.ok)return;const {blocks}=await response.json();for(const item of blocks){const option=document.createElement('option');option.value=item.key;option.textContent=item.name;$('block-picker').append(option);}$('block-picker').value=layoutKey?'layout:'+layoutKey:blockKey;}catch{/* Direct block URLs remain usable. */}}
loadBlockPicker();
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
renderer.setAnimationLoop(()=>{controls.update();root.updateMatrixWorld();for(const l of labelNodes){const p=l.g.localToWorld(l.p.clone()).project(camera);l.el.style.display=$('labels').checked&&p.z<1&&p.z>-1?'block':'none';l.el.style.left=`${(p.x*.5+.5)*viewport.clientWidth}px`;l.el.style.top=`${(-p.y*.5+.5)*viewport.clientHeight}px`;}renderer.render(scene,camera);});
try{const r=await fetch(api('/api/block'));if(!r.ok)throw Error((await r.json().catch(()=>null))?.error||'Unable to load block. Start the editor server.');const data=await r.json();block=validateBlock(data.block);revision=data.revision;configureBlockUI();rebuild();setView('iso');status(layoutKey?'Combined layout · edit furniture in its source block · dimensions estimated':'Draft loaded · estimated dimensions');if(layoutKey){for(const id of ['save','apply','import','undo'])$(id).disabled=true;document.querySelectorAll('[data-tool]').forEach(b=>{if(b.dataset.tool!=='select')b.disabled=true;});}}catch(e){status(e.message);}
