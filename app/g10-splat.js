import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {SparkRenderer,SplatMesh} from '@sparkjsdev/spark';

const base='/experiments/g10-gaussian/';
const stage=document.querySelector('#stage'),status=document.querySelector('#status');
const reference=document.querySelector('#reference'),toggle=document.querySelector('#reference-toggle');
let view,manifest,mesh,renderer,scene,camera,controls,depth=false,request=0;

function showReference(){
  const combined=view.camera==='G10',referenceCamera=combined?'B6':view.camera;
  reference.src=`${base}${referenceCamera}-${depth?'depth.png':'source.jpg'}`;
  reference.alt=depth?`Estimated relative depth for ${referenceCamera}`:`Original G10 ${referenceCamera} wide image`;
  document.querySelector('#source-link').href=`/api/evidence/camera/${referenceCamera}?block=ground/g10&wide=1`;
  document.querySelector('#reference-caption').textContent=combined?'B6 photo for comparison · block uses model materials':depth?'Estimated depth · brighter is closer':'Original wide camera image';
  document.querySelector('#camera-name').textContent=referenceCamera;
  document.querySelector('#download').href=`${base}${view.camera}.ply`;
  toggle.textContent=depth?'Show photo':'Show depth';
  toggle.setAttribute('aria-pressed',String(depth));
  toggle.hidden=combined;
}

function reset(){
  camera.position.fromArray(view.position||[0,0,0]);
  controls.target.fromArray(view.target||[0,0,-view.targetDepth]);
  camera.fov=view.verticalFovDegrees;
  camera.updateProjectionMatrix();
  controls.update();
}

async function select(id){
  const token=++request;
  view=id==='G10'?manifest.combined:manifest.views.find(v=>v.camera===id);
  for(const button of document.querySelectorAll('[data-camera]'))button.setAttribute('aria-pressed',String(button.dataset.camera===id));
  status.hidden=false;status.textContent=`Loading ${id} splats…`;
  showReference();reset();
  document.querySelector('#count').textContent='';
  if(mesh){scene.remove(mesh);mesh.dispose();mesh=null;}
  const next=new SplatMesh({url:`${base}${id}.splat`,lod:false});
  try{
    await next.initialized;
    if(token!==request){next.dispose();return;}
    mesh=next;scene.add(mesh);
    document.querySelector('#count').textContent=`${view.splats.toLocaleString()} splats`;
    status.hidden=true;
    history.replaceState(null,'',`?camera=${id}`);
  }catch(error){
    next.dispose();
    if(token===request){status.hidden=false;status.textContent=`Unable to load this view. ${error.message}`;}
  }
}

async function init(){
  const response=await fetch(`${base}manifest.json`);
  if(!response.ok)throw new Error('The generated G10 files are unavailable.');
  manifest=await response.json();
  renderer=new THREE.WebGLRenderer({antialias:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setClearColor(0x131e1a);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  stage.prepend(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Drag to explore the G10 Gaussian splats');
  renderer.domElement.addEventListener('webglcontextlost',event=>{
    event.preventDefault();status.hidden=false;status.textContent='The 3D view was interrupted. Reload this page to resume.';
  });
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(50,1,.01,50);
  scene.add(new SparkRenderer({renderer}));
  controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.08;
  controls.rotateSpeed=.35;controls.panSpeed=.45;
  controls.minDistance=.35;controls.maxDistance=12;
  new ResizeObserver(()=>{
    const {width,height}=stage.getBoundingClientRect();
    renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();
  }).observe(stage);
  renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
  for(const button of document.querySelectorAll('[data-camera]'))button.addEventListener('click',()=>select(button.dataset.camera));
  document.querySelector('#reset').addEventListener('click',reset);
  toggle.addEventListener('click',()=>{depth=!depth;showReference();});
  const id=new URLSearchParams(location.search).get('camera');
  await select(manifest.views.some(v=>v.camera===id)?id:'G10');
}

init().catch(error=>{status.hidden=false;status.textContent=`Unable to open the 3D preview. ${error.message}`;console.error(error);});
