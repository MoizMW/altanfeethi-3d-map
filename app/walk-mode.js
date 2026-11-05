import * as THREE from 'three';

// Eye-height navigation is shared by source rooms, composed floors and the building.
export function createWalkMode({canvas,getCamera,controls,invalidate,onEnter=()=>{},onExit=()=>{}}){
 let active=false,keys=new Set(),drag,last=0,frame,saved;
 const rotation=new THREE.Euler(0,0,0,'YXZ');
 const hud=document.createElement('div');hud.className='walk-hud';hud.hidden=true;
 hud.innerHTML='<strong>Walking · eye height 1.65 m</strong><span>WASD / arrows: walk · Drag: look · Shift: faster · Esc: exit</span><button type="button">Exit walk</button>';
 canvas.parentElement.append(hud);hud.querySelector('button').onclick=exit;
 function tick(now){if(!active)return;const camera=getCamera(),dt=Math.min((now-last)/1000,.05);last=now;
  const forward=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);forward.y=0;forward.normalize();const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0));
  const move=new THREE.Vector3().addScaledVector(forward,Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown'))).addScaledVector(right,Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')));
  if(move.lengthSq()){camera.position.addScaledVector(move.normalize(),dt*(keys.has('shift')?3.5:1.5));invalidate();}
  frame=requestAnimationFrame(tick);
 }
 function enter(position){if(active)exit();onEnter();const camera=getCamera();saved={position:camera.position.clone(),quaternion:camera.quaternion.clone(),target:controls.target.clone(),fov:camera.fov};active=true;keys.clear();controls.enabled=false;camera.fov=65;camera.near=.05;camera.updateProjectionMatrix();camera.position.copy(position);rotation.setFromQuaternion(camera.quaternion,'YXZ');rotation.x=0;rotation.z=0;camera.quaternion.setFromEuler(rotation);hud.hidden=false;document.body.classList.add('walking');last=performance.now();frame=requestAnimationFrame(tick);invalidate();}
 function exit(){if(!active)return;active=false;cancelAnimationFrame(frame);keys.clear();drag=null;const camera=getCamera();camera.position.copy(saved.position);camera.quaternion.copy(saved.quaternion);camera.fov=saved.fov;camera.updateProjectionMatrix();controls.target.copy(saved.target);controls.enabled=true;hud.hidden=true;document.body.classList.remove('walking');onExit();invalidate();}
 document.addEventListener('keydown',e=>{if(!active||e.target.closest('input,textarea,select,[contenteditable=true]'))return;const key=e.key.toLowerCase();if(key==='escape'){exit();e.preventDefault();return;}if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(key)){keys.add(key);e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();drag=null;});document.addEventListener('visibilitychange',()=>keys.clear());
 canvas.addEventListener('pointerdown',e=>{if(active){drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);}});
 canvas.addEventListener('pointermove',e=>{if(!active||!drag)return;rotation.y-=(e.clientX-drag[0])*.003;rotation.x=THREE.MathUtils.clamp(rotation.x-(e.clientY-drag[1])*.003,-1.35,1.35);getCamera().quaternion.setFromEuler(rotation);drag=[e.clientX,e.clientY];invalidate();});
 canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
 return {enter,exit,get active(){return active;}};
}
