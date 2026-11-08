import * as THREE from 'three';
import {hasVisibleAnimatedScreens} from './building-visibility.js';
import {placeAvatarOnChair} from './human-avatars.js';
import {createWalkMode} from './walk-mode.js';
import {buildObject as build, objectReferenceSize, referenceSize} from './object-builders.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import {validateBlock} from './shared/schema/block-schema.js';
import {buildArchitecture,buildFloorInlays} from './architecture.js';
import {buildFloors} from './floors.js';
import {createFloorReflections} from './floor-reflections.js';
import {createRenderProfile} from './render-profile.js';
import {buildContactShadows,fitSceneShadows} from './contact-shadows.js';
import {createRenderLoop,renderQuality} from './render-loop.js';
import {buildStaticInstances,createObjectCache} from './static-instances.js';
import {filterObjects,sourceObjectLink,createAssetPlacement,removeAsset} from './editor-ui.js';
const $=id=>document.getElementById(id), status=message=>{$('status').textContent=message;syncEditorState();};
let block, revision, selected, dirty=false, history=[], view='iso', tool='select', dragStart, saving=false, savedSnapshot=null;
const blockKey=new URLSearchParams(location.search).get('block')||'ground/g9';
const layoutKey=new URLSearchParams(location.search).get('layout');
const api=path=>`${path}${path.includes('?')?'&':'?'}${layoutKey?'layout':'block'}=${encodeURIComponent(layoutKey||blockKey)}`;
const viewport=$('viewport'), scene=new THREE.Scene();scene.background=new THREE.Color('#e7e8e4');
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;viewport.prepend(renderer.domElement);
const renderProfile=createRenderProfile(renderer,new URLSearchParams(location.search).has('profile'));
const ortho=new THREE.OrthographicCamera(-4,4,4,-4,.1,100), perspective=new THREE.PerspectiveCamera(40,1,.1,100);let camera=ortho;
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2-.02;controls.minDistance=3;controls.maxDistance=25;
const transform=new TransformControls(camera,renderer.domElement),transformHelper=transform.getHelper();scene.add(transformHelper);transformHelper.visible=false;transform.showY=true;transform.enabled=false;
transform.addEventListener('dragging-changed',e=>{controls.enabled=!e.value;renderLoop?.setActive(e.value);});
scene.add(new THREE.HemisphereLight('#fff7e6','#66706b',2.3));const light=new THREE.DirectionalLight('#fff5df',3.3);light.position.set(3,8,5);light.castShadow=true;light.shadow.mapSize.setScalar(Math.min(layoutKey?4096:2048,renderer.capabilities.maxTextureSize));Object.assign(light.shadow.camera,{left:-5,right:5,top:5,bottom:-5});light.shadow.bias=-.0004;scene.add(light,light.target);
const root=new THREE.Group();scene.add(root);let objects=new Map(),labelNodes=[],staticFurniture,architectureInstances,contactShadows,meshCount=0,sceneChanged=true;const selection=new THREE.BoxHelper(undefined,'#ad8f50');selection.visible=false;scene.add(selection);
const floorReflections=createFloorReflections(renderer,scene,root,[selection,transformHelper],{size:layoutKey?256:512});
let renderLoop,animatedScreens=[];
function needsDisplayAnimation(){return hasVisibleAnimatedScreens(animatedScreens,camera,{hidden:document.hidden,reducedMotion:window.matchMedia('(prefers-reduced-motion: reduce)').matches});}
function invalidateScene(){sceneChanged=true;floorReflections.invalidate();renderLoop?.invalidate();}
THREE.DefaultLoadingManager.onLoad=invalidateScene;
controls.addEventListener('change',()=>renderLoop?.invalidate());
controls.addEventListener('start',()=>renderLoop?.setActive(true));
controls.addEventListener('end',()=>renderLoop?.setActive(false));
transform.addEventListener('change',()=>renderLoop?.invalidate());
transform.addEventListener('objectChange',()=>{
 const o=block?.objects.find(o=>o.id===selected),g=objects.get(selected);
 if(o&&g)contactShadows?.update(o.id,{position:g.position.toArray(),yaw:THREE.MathUtils.radToDeg(g.rotation.y),size:referenceSize[o.type].map((v,i)=>v*g.scale.getComponent(i))});
 invalidateScene();
});
const labelPoint=new THREE.Vector3();
const isChair=o=>['armchair','office-chair'].includes(o.type);
const objectLabel=o=>o.seats.length?`${o.type==='sofa'?'Sofa':'Chair'} · ${o.seats.map(s=>s.replace(/^Seat_/, '')).join(' / ')}`:o.type==='table'?`${o.name.split(' · ')[0]}${o.externalId?' · '+o.externalId:''}`:o.name;
const readOnly=()=>Boolean(layoutKey||block?.readOnly);
function syncEditorState(){
 if(block&&savedSnapshot!==null)dirty=!readOnly()&&JSON.stringify(block)!==savedSnapshot;
 const locked=readOnly(),state=$('save-state');
 state.textContent=!block?'Loading…':locked?'Combined view':saving?'Saving…':dirty?'Unsaved changes':'Saved';
 state.dataset.state=locked?'readonly':saving?'saving':dirty?'dirty':'saved';
 $('save').disabled=!block||locked||saving||!dirty;
 $('save').textContent=saving?'Saving…':'Save block';
 $('undo').disabled=locked||!history.length;
 $('import').disabled=locked;
 $('object-fields').disabled=locked||!selected;
 $('add-asset').disabled=!block||locked||saving;
 $('delete-asset').disabled=!block||locked||saving||!selected;
 if(block)document.title=(dirty?'• ':'')+block.name+' — Altanfeethi Spatial Twin';
 const object=block?.objects.find(o=>o.id===selected),link=locked?sourceObjectLink(object):null;
 $('source-edit').hidden=!locked||!object;
 $('edit-source').hidden=!link;
 if(link){$('edit-source').href=link;$('source-note').textContent='To change this object, open its source room.';}
 else $('source-note').textContent='This object is part of the combined surroundings.';
}
function renderObjectList(){
 const matches=filterObjects(block.objects,$('object-search').value);
 $('objects').replaceChildren();
 for(const o of matches){
  const button=document.createElement('button');button.type='button';button.textContent=objectLabel(o);button.dataset.id=o.id;
  button.classList.toggle('active',o.id===selected);button.onclick=()=>select(o.id);$('objects').append(button);
 }
 $('object-count').textContent=matches.length+' of '+block.objects.length+' objects';
 $('object-empty').hidden=matches.length>0;
}
function rebuild(){invalidateScene();transform.detach();staticFurniture?.dispose();architectureInstances?.dispose();architectureInstances=null;const resources=new Set();root.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const m of(o.material?(Array.isArray(o.material)?o.material:[o.material]):[]))resources.add(m);});for(const resource of resources)resource.dispose();staticFurniture=null;root.clear();objects.clear();labelNodes.forEach(l=>l.el.remove());labelNodes=[];root.add(buildFloors(block));root.add(buildFloorInlays(block.architecture));refreshArchitecture();
 const buildSceneObject=layoutKey?createObjectCache(build):build;
 for(const o of block.objects){const g=buildSceneObject(o);root.add(g);objects.set(o.id,g);o.seats.forEach((s,i)=>{const el=document.createElement('span');el.className='seat-label';el.textContent=s.startsWith('Seat_SGS_TMP_')?`SGS ${s.slice(-2)}*`:s.replace('Seat_','');el.title=s;$('labels-layer').append(el);labelNodes.push({el,g,p:new THREE.Vector3(...(g.userData.seatLabelPositions?.[i]||[(i-(o.seats.length-1)/2)*.65,1.02,0]))});});}
 animatedScreens=[];root.traverse(node=>{if(node.isMesh&&node.userData.animated)animatedScreens.push(node);});
 if(layoutKey)staticFurniture=buildStaticInstances(root,[...objects.values()]);
 contactShadows=buildContactShadows(block.objects);root.add(contactShadows.mesh);
 root.updateMatrixWorld(true);fitSceneShadows(light,root);meshCount=0;root.traverse(node=>{if(node.isMesh&&node.visible&&node.layers.isEnabled(0))meshCount++;});
 if(layoutKey)root.traverse(node=>{node.matrixAutoUpdate=false;node.matrixWorldAutoUpdate=false;});
 for(const g of objects.values())g.userData.pickBounds=new THREE.Box3().setFromObject(g);
 updateAssetSummary();renderObjectList();const next=selected&&objects.has(selected)?selected:block.objects[0]?.id;if(next)select(next);else{selected=null;selection.visible=false;transform.detach();transformHelper.visible=false;$('object-name').textContent='No objects yet';$('object-info').textContent='Use Add asset to furnish this block.';}applyVisibility();syncEditorState();}
function select(id){renderLoop?.invalidate();selected=id;const o=block.objects.find(o=>o.id===id),display=v=>Number(v.toFixed(3));$('object-name').textContent=objectLabel(o);$('object-info').textContent=[o.seats.join(' / ')||o.externalId||'Context object',o.confidence].join(' · ');$('x').value=display(o.position[0]);$('y').value=display(o.position[1]);$('z').value=display(o.position[2]);$('yaw').value=display(o.yaw);['width','height','depth'].forEach((id,i)=>$(id).value=display(o.size[i]));['scale-x','scale-y','scale-z'].forEach((id,i)=>$(id).value=display(o.scale?.[i]??1));$('color').value=o.color;$('seat-field').hidden=!isChair(o);$('seat-id').value=isChair(o)?o.seats[0]:'';$('sofa-seat-field').hidden=o.type!=='sofa';$('sofa-seat-inputs').replaceChildren();if(o.type==='sofa')o.seats.forEach((seat,i)=>{const label=document.createElement('label');label.textContent=`Seat slot ${i+1} · local ${i===0?'left':i===o.seats.length-1?'right':'middle'}`;const input=document.createElement('input');input.type='text';input.value=seat;input.spellcheck=false;input.dataset.seatSlot=i;label.append(input);$('sofa-seat-inputs').append(label);});$('gate-field').hidden=!['automatic-glass-gate','passport-gate'].includes(o.type);$('gate-opening').value=Math.round((o.openFraction??0)*100);$('table-field').hidden=o.type!=='table';$('table-id').value=o.type==='table'?(o.externalId||''):'';document.querySelectorAll('[data-id]').forEach(b=>b.classList.toggle('active',b.dataset.id===id));selection.setFromObject(objects.get(id));selection.visible=true;transform.attach(objects.get(id));transformHelper.visible=tool!=='select';syncEditorState();}
function refreshArchitecture(){
 invalidateScene();architectureInstances?.dispose();architectureInstances=null;
 const old=root.getObjectByName('Architecture');
 if(old){const resources=new Set();old.traverse(o=>{if(o.geometry)resources.add(o.geometry);if(o.material)resources.add(o.material);});for(const resource of resources)resource.dispose();root.remove(old);}
 if(block?.architecture){
  const architecture=buildArchitecture({...block.architecture,walls:$('walls').checked?block.architecture.walls:[]},{cutaway:$('wall-cutaway').checked,ceiling:$('ceiling').checked});root.add(architecture);
  if(layoutKey){architectureInstances=buildStaticInstances(architecture,[...architecture.children]);
   architecture.updateMatrixWorld(true);architecture.traverse(node=>{node.matrixAutoUpdate=false;node.matrixWorldAutoUpdate=false;});
  }
 }
 fitSceneShadows(light,root);
}
function applyVisibility(){invalidateScene();for(const o of block.objects){if(['screen','wall-panel','security-barrier'].includes(o.type))objects.get(o.id).visible=$('screen').checked;if(o.type==='passport-booth')objects.get(o.id).getObjectByName('Booth partitions').visible=$('screen').checked;if(o.variant==='side-wall-light')objects.get(o.id).visible=$('walls').checked&&!$('wall-cutaway').checked;}staticFurniture?.sync();selection.visible=selected?(objects.get(selected)?.visible??false):false;}
const walking=createWalkMode({canvas:renderer.domElement,getCamera:()=>camera,controls,invalidate:()=>renderLoop?.invalidate(),onEnter:()=>{camera=perspective;controls.object=camera;transform.camera=camera;transform.detach();transformHelper.visible=false;selection.visible=false;$('wall-cutaway').checked=false;refreshArchitecture();},onExit:()=>{if(selected&&objects.has(selected))select(selected);}});
function startWalking(event){
 if(!block||walking.active)return;
 const center=block.architecture?.floorCenter||[0,0],point=new THREE.Vector3(center[0],1.65,center[1]);
 if(event){const rect=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),new THREE.Vector3());if(hit){point.copy(hit);point.y=1.65;}}
 walking.enter(point);status('Walking · WASD or arrows to move · Drag to look · Esc to exit');
}
$('walk').onclick=()=>walking.active?walking.exit():startWalking();
renderer.domElement.addEventListener('dblclick',startWalking);
function setView(mode){walking.exit();renderLoop?.invalidate();view=mode;camera=mode==='orbit'?perspective:ortho;controls.object=camera;transform.camera=camera;camera.up.set(0,1,0);const size=Math.max(...(block?.floorSize||[4.8,4.8])),factor=Math.max(1,size/5.2);camera.far=Math.max(100,size*10);camera.updateProjectionMatrix();const offset=block?.viewer?.cameraOffset||[6,6,7];camera.position.set(...(mode==='top'?[0,Math.max(10,size*2),.001]:offset.map(value=>value*factor)));const center=block?.architecture?.floorCenter||[0,0];camera.position.x+=center[0];camera.position.z+=center[1];controls.target.set(center[0],mode==='top'?0:Math.min(1,size*.07),center[1]);controls.maxDistance=Math.max(25,size*5);controls.enableRotate=mode!=='top';camera.zoom=1;controls.update();resize();document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===mode));}
function focusSelected(){
 const object=block.objects.find(o=>o.id===selected);if(!object)return;
 const bounds=new THREE.Box3().setFromObject(objects.get(selected)),center=bounds.getCenter(new THREE.Vector3());center.y=Math.max(1,center.y);
 const angle=THREE.MathUtils.degToRad(object.yaw),offset=new THREE.Vector3(.9,5.5,8).applyAxisAngle(new THREE.Vector3(0,1,0),angle);
 controls.target.copy(center);camera.position.copy(center).add(offset);camera.lookAt(center);controls.update();
 if(camera.isOrthographicCamera){const span=Math.max(4.8,bounds.getSize(new THREE.Vector3()).length()*.8),aspect=viewport.clientWidth/viewport.clientHeight;
  camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.zoom=1;camera.updateProjectionMatrix();
 }
 renderLoop.invalidate();
}
function setTool(mode){renderLoop?.invalidate();if(readOnly()&&mode!=='select')return;tool=mode;transform.enabled=mode!=='select';transformHelper.visible=mode!=='select';if(mode!=='select')transform.setMode(mode);transform.showY=true;transform.showX=mode!=='rotate';transform.showZ=mode!=='rotate';document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===mode));}
function resize(){renderLoop?.invalidate();const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);perspective.aspect=w/h;perspective.updateProjectionMatrix();let span=3.6;
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
new ResizeObserver(entries=>document.documentElement.style.setProperty('--editor-header-height',entries[0].target.getBoundingClientRect().height+'px')).observe(document.querySelector('header'));
const ray=new THREE.Raycaster();ray.layers.enable(1);let down;
renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(walking.active||!block||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);for(const hit of ray.intersectObjects([...objects.values()].filter(g=>g.visible&&(!layoutKey||ray.ray.intersectsBox(g.userData.pickBounds))),true)){let o=hit.object;while(o&&!o.userData.objectId)o=o.parent;if(o){select(o.userData.objectId);break;}}});
const checkpoint=()=>{history.push(structuredClone(block));if(history.length>50)history.shift();dirty=true;status('Unsaved changes');};
transform.addEventListener('mouseDown',()=>{if(block&&selected)dragStart=structuredClone(block);});
transform.addEventListener('mouseUp',()=>{if(!dragStart||!selected)return;const o=block.objects.find(o=>o.id===selected),g=objects.get(selected);if(!o||!g){dragStart=null;return;}const previous=dragStart;dragStart=null;
 const before=JSON.stringify(o);o.position=g.position.toArray();o.yaw=THREE.MathUtils.radToDeg(g.rotation.y);o.scale=g.scale.toArray().map((v,i)=>v/(o.size[i]/objectReferenceSize(o)[i]));
 try{validateBlock(block);if(JSON.stringify(o)!==before){history.push(previous);if(history.length>50)history.shift();dirty=true;status('Unsaved changes');}else select(selected);}catch(e){block=previous;rebuild();status(e.message);return;}select(selected);
});
$('apply').onclick=()=>{try{const next=structuredClone(block),o=next.objects.find(o=>o.id===selected);const ids=['x','y','z','yaw','width','height','depth','scale-x','scale-y','scale-z'];if(ids.some(id=>$(id).value.trim()===''))throw Error('Fill all numeric fields.');o.position=['x','y','z'].map(id=>Number($(id).value));o.yaw=Number($('yaw').value);o.size=['width','height','depth'].map(id=>Number($(id).value));o.scale=['scale-x','scale-y','scale-z'].map(id=>Number($(id).value));o.color=$('color').value;if(['automatic-glass-gate','passport-gate'].includes(o.type)){if($('gate-opening').value.trim()==='')throw Error('Enter the gate opening percentage.');o.openFraction=Number($('gate-opening').value)/100;}if(isChair(o))o.seats=[$('seat-id').value.trim()];if(o.type==='sofa')o.seats=[...$('sofa-seat-inputs').querySelectorAll('input')].map(input=>input.value.trim());if(o.type==='table'){const tableId=$('table-id').value.trim();if(tableId)o.externalId=tableId;else delete o.externalId;}validateBlock(next);checkpoint();block=next;rebuild();}catch(e){status(e.message);}};
let assetLibrary;
function updateAssetSummary(){
 const seats=block.objects.reduce((count,o)=>count+o.seats.length,0);
 $('block-summary').textContent=`${block.objects.length} assets · ${seats} seats`;
}
function assetChoice(){return assetLibrary?.assets.find(asset=>asset.id===$('asset-design').value);}
function showAssetConfigurations(){
 const asset=assetChoice();$('asset-config').replaceChildren();
 for(const [i,config] of (asset?.configurations||[]).entries()){
  const option=document.createElement('option');option.value=config.id;
  option.textContent=`${i+1} · ${config.appearance.color} · ${config.appearance.size.map((v,j)=>+(v*(config.appearance.scale?.[j]??1)).toFixed(2)).join(' × ')} m`;
  $('asset-config').append(option);
 }
 $('place-asset').disabled=!asset;
 $('asset-details').textContent=asset?`${asset.category} · New seating receives temporary seat IDs you can edit.`:'No matching designs.';
}
function filterAssetDesigns(){
 const previous=$('asset-design').value,query=$('asset-search').value.toLowerCase().trim();$('asset-design').replaceChildren();
 for(const asset of assetLibrary.assets.filter(asset=>(asset.name+' '+asset.category).toLowerCase().includes(query))){
  const option=document.createElement('option');option.value=asset.id;option.textContent=asset.name;$('asset-design').append(option);
 }
 if([...$('asset-design').options].some(option=>option.value===previous))$('asset-design').value=previous;
 showAssetConfigurations();
}
$('add-asset').onclick=async()=>{
 if(!block||readOnly()||saving)return;
 try{
  if(!assetLibrary){status('Loading asset library…');const response=await fetch('/api/object-library');if(!response.ok)throw Error('Unable to load assets. Try again.');assetLibrary=await response.json();}
  if(readOnly())return;
  $('asset-search').value='';filterAssetDesigns();$('asset-dialog').showModal();$('asset-search').focus();status('Choose an asset from the shared library');
 }catch(error){status(error.message);}
};
$('asset-search').oninput=filterAssetDesigns;$('asset-design').onchange=showAssetConfigurations;
$('place-asset').onclick=()=>{
 if(!block||readOnly()||saving)return;
 try{
  const asset=assetChoice(),config=asset?.configurations.find(config=>config.id===$('asset-config').value);if(!config)throw Error('Choose an asset first.');
  let object=createAssetPlacement(block,asset,config,crypto.randomUUID().replaceAll('-','').slice(0,16));
  const chair=block.objects.find(item=>item.id===selected);if(object.type==='human-avatar'&&['armchair','office-chair'].includes(chair?.type)){if(block.objects.some(item=>item.type==='human-avatar'&&item.seatedOn===chair.id))throw Error('This chair already has a display avatar. Select another chair.');object=placeAvatarOnChair(object,chair);}
  const next={...block,objects:[...block.objects.map(item=>object.seatedOn===item.id?{...item,pillow:false}:item),object]};validateBlock(next);checkpoint();block=next;selected=object.id;$('object-search').value='';
  rebuild();setTool('translate');$('asset-dialog').close();status('Asset added · Drag to position, then Save block');
 }catch(error){status(error.message);$('asset-details').textContent=error.message;}
};
$('delete-asset').onclick=()=>{
 if(!block||readOnly()||saving||!selected)return;
 try{const next=removeAsset(block,selected);validateBlock(next);checkpoint();block=next;selected=null;rebuild();status('Asset deleted · Undo to restore, or Save block');}catch(error){status(error.message);}
};
$('undo').onclick=()=>{if(history.length){block=history.pop();dirty=true;rebuild();status(dirty?'Undone · unsaved changes':'Undone · back to saved state');}};
$('save').onclick=async()=>{
 if(!block||readOnly()||saving||!dirty)return;
 saving=true;status('Saving changes…');
 try{
  validateBlock(block);const submitted=JSON.stringify(block);
  const r=await fetch(api('/api/block'),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,block:JSON.parse(submitted)})});
  const result=await r.json();if(!r.ok)throw Error(result.error);
  revision=result.revision;savedSnapshot=submitted;dirty=JSON.stringify(block)!==submitted;
  status(dirty?'Saved · newer edits are still unsaved.':'All changes saved');
 }catch(e){status(e.message);}
 finally{saving=false;syncEditorState();}
};
$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(block,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`${(layoutKey||blockKey).replace('/','-')}-block.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onclick=()=>$('file').click();$('file').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;const next=validateBlock(JSON.parse(await f.text()));checkpoint();block=next;rebuild();status('Imported draft · Save block to write to disk');}catch(e){status(e.message);}e.target.value='';};
function showPhoto(id,wide=false){$('photo').hidden=false;$('photo').src=api(`/api/evidence/camera/${encodeURIComponent(id)}${wide?'?wide=1':''}`);$('photo').alt=`${id} camera reference`;$('photo-link').href=$('photo').src;$('photo-note').textContent=`${id} · ${wide?'wide architecture capture · detection ROIs do not apply':'detection view'} · ${block.name}`;}
function showTableDrawing(id){$('photo').hidden=false;$('photo').src=api(`/api/evidence/table-drawing/${encodeURIComponent(id)}`);$('photo').alt=`${id} table drawing for chair-name verification`;$('photo-link').href=$('photo').src;$('photo-note').textContent=`${id} · Table drawing · Chair-name reference`;}
function configureBlockUI(){document.title=`${block.name} — Altanfeethi Spatial Twin`;$('block-code').textContent=(block.displayCode||block.groups?.join(' / ')||block.id).toUpperCase();$('block-name').textContent=block.name.replace(/^.*?·\s*/, '');$('block-badge').textContent=`${block.floor.toUpperCase()} FLOOR · ZONE ${block.zone||'—'}`;const count=type=>block.objects.filter(o=>o.type===type).length,word=(n,singular)=>`${n} ${singular}${n===1?'':'s'}`,seats=block.objects.flatMap(o=>o.seats).length;$('block-summary').textContent=`${word(count('armchair'),'armchair')} · ${word(count('sofa'),'sofa')} · ${word(seats,'seat')} · ${word(count('table'),'table')}`;if(count('privacy-pod'))$('block-summary').textContent=`${word(count('privacy-pod'),'pod')} · Walking area`;if(count('counter'))$('block-summary').textContent=`${word(count('counter'),'counter')} · ${word(count('office-chair'),'staff chair')} · ${word(count('display'),'display')}`;if(count('passport-booth'))$('block-summary').textContent=`${word(count('passport-booth'),'officer booth')} · ${word(count('passport-gate'),'passenger gate')} · ${word(count('office-chair'),'staff chair')}`;if(count('security-scanner'))$('block-summary').textContent=`${word(count('security-scanner'),'baggage scanner')} · ${word(count('security-detector'),'detector')} · ${word(count('office-chair'),'staff chair')}`;if(layoutKey)$('block-summary').textContent=[word(seats,'seat'),word(count('sofa'),'sofa'),word(count('armchair'),'armchair'),word(count('table'),'table'),...(count('privacy-pod')?[word(count('privacy-pod'),'pod')]:[]),...(block.objects.some(o=>o.type==='counter'&&!(o.variant?.startsWith('buffet-')||o.variant==='food-buffet'))?[word(block.objects.filter(o=>o.type==='counter'&&!(o.variant?.startsWith('buffet-')||o.variant==='food-buffet')).length,'reception counter')]:[]),...(block.objects.some(o=>o.type==='counter'&&(o.variant?.startsWith('buffet-')||o.variant==='food-buffet'))?[word(block.objects.filter(o=>o.type==='counter'&&(o.variant?.startsWith('buffet-')||o.variant==='food-buffet')).length,'buffet counter')]:[])].join(' · ');if(layoutKey&&count('security-scanner')&&count('passport-booth'))$('block-summary').textContent=`${word(count('security-scanner'),'baggage scanner')} · ${word(count('passport-booth'),'officer booth')} · ${word(count('passport-gate'),'passenger gate')}`;$('handoff-notes').textContent=block.evidence.notes.slice(0,2).join(' ');const extent=Math.max(...block.floorSize);Object.assign(light.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent});light.shadow.camera.updateProjectionMatrix();$('evidence-tabs').replaceChildren();for(const id of block.evidence.cameras){const button=document.createElement('button');button.textContent=id;button.onclick=()=>showPhoto(id);$('evidence-tabs').append(button);if(block.evidence.wideSnapshots?.[id]){const wideButton=document.createElement('button');wideButton.textContent=`${id} wide`;wideButton.onclick=()=>showPhoto(id,true);$('evidence-tabs').append(wideButton);}}for(const id of block.evidence.tableDrawings||[]){const button=document.createElement('button');button.textContent=`${id} drawing`;button.onclick=()=>showTableDrawing(id);$('evidence-tabs').append(button);}if(block.evidence.cameras[0])showPhoto(block.evidence.cameras[0]);else if(block.evidence.tableDrawings?.length)showTableDrawing(block.evidence.tableDrawings[0]);else{$('photo').hidden=true;$('photo-note').textContent='No reference images listed.';}$('map-link').href=api('/api/evidence/map');}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));document.addEventListener('keydown',e=>{
 const modifier=e.ctrlKey||e.metaKey,key=e.key.toLowerCase();
 if(modifier&&key==='s'){e.preventDefault();if(!$('save').disabled)$('save').click();return;}
 if(document.activeElement?.closest('input,textarea,select,[contenteditable=true]'))return;
 if(modifier&&key==='z'){if(!e.shiftKey){e.preventDefault();if(!$('undo').disabled)$('undo').click();}return;}
 if(e.key==='Home'){e.preventDefault();if(block)setView(view);return;}
 if(e.key==='/'&&!modifier){e.preventDefault();$('object-search').focus();return;}
 if(modifier||e.altKey)return;
 const mode={w:'translate',e:'rotate',r:'scale',q:'select'}[key];if(mode)setTool(mode);
});$('screen').onchange=applyVisibility;$('labels').onchange=()=>renderLoop?.invalidate();
$('object-search').addEventListener('input',()=>{if(block)renderObjectList();});
$('object-search').addEventListener('keydown',e=>{if(e.key==='Escape'){$('object-search').value='';if(block)renderObjectList();}});
$('reset-view').onclick=()=>{if(block)setView(view);};
for(const id of ['walls','wall-cutaway','ceiling'])$(id).onchange=()=>{refreshArchitecture();applyVisibility();resize();};
$('block-picker').onchange=()=>{if(dirty&&!confirm('There are unsaved edits. Switch blocks and discard them?')){$('block-picker').value=layoutKey?'layout:'+layoutKey:blockKey;return;}dirty=false;const value=$('block-picker').value;location.href=value.startsWith('layout:')?`/?layout=${encodeURIComponent(value.slice(7))}`:`/?block=${encodeURIComponent(value)}`;};
async function loadBlockPicker(){try{const response=await fetch('/api/blocks');if(!response.ok)return;const {blocks}=await response.json();for(const item of blocks){const option=document.createElement('option');option.value=item.key;option.textContent=item.name;$('block-picker').append(option);}$('block-picker').value=layoutKey?'layout:'+layoutKey:blockKey;}catch{/* Direct block URLs remain usable. */}}
loadBlockPicker();
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
function updateLabels() {
 const show=$('labels').checked,occupied=new Set(),width=viewport.clientWidth,height=viewport.clientHeight;
 const ordered=selected?[...labelNodes.filter(l=>l.g.userData.objectId===selected),...labelNodes.filter(l=>l.g.userData.objectId!==selected)]:labelNodes;
 for(const l of ordered){
  let visible=false,x=0,y=0;
  if(show){const p=labelPoint.copy(l.p).applyMatrix4(l.g.matrixWorld).project(camera);x=(p.x*.5+.5)*width;y=(-p.y*.5+.5)*height;
   if(p.z>-1&&p.z<1&&x>=0&&x<width&&y>=0&&y<height){
    const cell=`${Math.floor(x/58)},${Math.floor(y/26)}`;
    if(!layoutKey||!occupied.has(cell)){visible=true;occupied.add(cell);}
   }
  }
  if(l.shown!==visible){l.el.style.display=visible?'block':'none';l.shown=visible;}
  if(visible){const left=`${Math.round(x)}px`,top=`${Math.round(y)}px`;
   if(l.left!==left){l.el.style.left=left;l.left=left;}if(l.top!==top){l.el.style.top=top;l.top=top;}
  }
 }
}
renderLoop=createRenderLoop({update:()=>walking.active?false:controls.update(),needsAnimation:needsDisplayAnimation,render:({moving})=>{
 if(!block||document.hidden)return;
 renderProfile.begin();
 const span=camera.isOrthographicCamera?(camera.right-camera.left)/camera.zoom:camera.position.distanceTo(controls.target)*2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
 const quality=renderQuality({meshCount,pixelRatio:devicePixelRatio,moving,viewSpan:span});
 if(renderer.getPixelRatio()!==quality.pixelRatio){renderer.setPixelRatio(quality.pixelRatio);renderer.setSize(viewport.clientWidth,viewport.clientHeight);}

 if(!layoutKey)root.updateMatrixWorld();updateLabels();
 if(sceneChanged&&(!moving||!light.shadow.map)){renderer.shadowMap.needsUpdate=true;sceneChanged=false;}
 floorReflections.setEnabled(quality.reflections);
 const reflected=quality.reflections&&floorReflections.update(camera);
 renderer.render(scene,camera);
 renderProfile.end({pixelRatio:quality.pixelRatio,moving,reflectionPasses:reflected?1:0,meshCount,instancing:staticFurniture?.stats,architectureInstancing:architectureInstances?.stats});
}});
// A restored/background tab and a newly loaded texture need one fresh frame.
document.addEventListener('visibilitychange',()=>renderLoop.invalidate());

try{const r=await fetch(api('/api/block'));if(!r.ok)throw Error((await r.json().catch(()=>null))?.error||'Unable to load block. Start the editor server.');const data=await r.json();block=validateBlock(data.block);revision=data.revision;savedSnapshot=JSON.stringify(block);configureBlockUI();rebuild();setView('iso');const linkedObject=new URLSearchParams(location.search).get('object');if(block.objects.some(o=>o.id===linkedObject)){select(linkedObject);if(new URLSearchParams(location.search).get('focus')==='1')focusSelected();}status(layoutKey?'Combined layout · edit furniture in its source block · dimensions estimated':'Draft loaded · estimated dimensions');if(layoutKey){for(const id of ['save','apply','import','undo'])$(id).disabled=true;document.querySelectorAll('[data-tool]').forEach(b=>{if(b.dataset.tool!=='select')b.disabled=true;});}}catch(e){status(e.message);}
