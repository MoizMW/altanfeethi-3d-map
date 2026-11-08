import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {SparkRenderer,SplatMesh} from '@sparkjsdev/spark';
const stage=document.querySelector('#stage'),status=document.querySelector('#status');
async function init(){
 const response=await fetch('/experiments/g10-gaussian/joint-report.json', {cache:'no-store'});if(!response.ok)throw Error('Reconstruction report unavailable');const report=await response.json();
 const renderer=new THREE.WebGLRenderer({antialias:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x131e1a);stage.prepend(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(55,1,.001,1000);scene.add(new SparkRenderer({renderer}));
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.rotateSpeed=.4;
 const bounds=report.framingBounds||report.bounds;
 const center=new THREE.Vector3(...report.target),span=new THREE.Vector3(...bounds[1]).sub(new THREE.Vector3(...bounds[0])).length();controls.maxDistance=span*5;controls.minDistance=span*.02;
 const flip=new THREE.Matrix4().makeScale(1,-1,-1),first=new THREE.Matrix4().set(...report.poses[0].flat());const canonical=report.coordinateFrame==='g10-local'?new THREE.Matrix4():flip.clone().multiply(first.invert());
 function select(id){
  if(id==='overview'){camera.up.set(0,1,0);camera.position.copy(center).add(new THREE.Vector3(span*.65,span*.55,span*.65));controls.target.copy(center);camera.fov=55;}
  else {const i=report.cameras.indexOf(id),pose=new THREE.Matrix4().set(...report.poses[i].flat()),world=canonical.clone().multiply(pose).multiply(flip);camera.position.setFromMatrixPosition(world);camera.up.set(0,1,0).transformDirection(world);const dir=new THREE.Vector3(0,0,-1).transformDirection(world);controls.target.copy(camera.position).addScaledVector(dir,Math.max(span*.15,camera.position.distanceTo(center)));camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(288/(2*report.focals[i][0])));document.querySelector('#reference').src=`/experiments/g10-gaussian/${id}-source.jpg`;document.querySelector('#reference').alt=`G10 ${id} source photo`;document.querySelector('#camera-name').textContent=id;}
  camera.updateProjectionMatrix();controls.update();for(const b of document.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(b.dataset.view===id));
 }
 for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>select(b.dataset.view);document.querySelector('#reset').onclick=()=>select('overview');
 controls.addEventListener('start',()=>{for(const b of document.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(b.dataset.view==='overview'));});
 new ResizeObserver(()=>{renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();}).observe(stage);
 renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
 const splat=new SplatMesh({url:`/experiments/g10-gaussian/G10-photo.splat?v=${report.exportSha256 || report.refinementVersion || 1}`,lod:false});await splat.initialized;scene.add(splat);select(report.coordinateFrame==='g10-local'?'overview':'B6');document.querySelector('#count').textContent=report.splats.toLocaleString();status.hidden=true;
}
init().catch(e=>{status.hidden=false;status.textContent=e.message;console.error(e);});
