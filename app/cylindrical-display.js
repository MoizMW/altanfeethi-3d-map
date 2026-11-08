import * as THREE from 'three';

export const campaignAtlasPath='/shared/materials/textures/window-display/campaign-atlas.png';

// Stills establish two campaign scenes; their playback timing is an approximation.
export function campaignFrame(seconds,reducedMotion=false){
  const phase=reducedMotion?0:((seconds%16)+16)%16;
  const ease=value=>value*value*(3-2*value);
  const blend=phase<6.5?0:phase<8?ease((phase-6.5)/1.5):phase<14.5?1:1-ease((phase-14.5)/1.5);
  return {blend,drift:reducedMotion?0:Math.sin(seconds*.18)*.012};
}

export function createCylindricalDisplay(){
  const material=new THREE.MeshBasicMaterial({color:'#ffffff',toneMapped:false});
  if(typeof document==='undefined'){material.color.set('#344a83');return {material,animate:()=>{}};}
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;
  const ctx=canvas.getContext('2d');
  if(!ctx){material.color.set('#344a83');return {material,animate:()=>{}};}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=THREE.RepeatWrapping;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
  material.map=texture;
  let image,disposed=false,lastFrame=-Infinity,start;
  const reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
  const draw=seconds=>{
    const {blend,drift}=campaignFrame(seconds,reducedMotion);
    ctx.globalAlpha=1;ctx.fillStyle='#344a83';ctx.fillRect(0,0,1024,1024);
    // Repeat the portrait creative around both halves of the cylinder.
    for(const x of [0,512]){
      ctx.save();ctx.beginPath();ctx.rect(x,0,512,1024);ctx.clip();
      if(image){
        const width=image.width/2,pad=18,shift=drift*1024;
        for(const [frame,alpha] of [[0,1],[1,blend]]){
          ctx.globalAlpha=alpha;
          ctx.drawImage(image,frame*width,0,width,image.height,x-pad+shift,-pad,512+pad*2,1024+pad*2);
        }
      }
      ctx.globalAlpha=1-blend;ctx.direction='rtl';ctx.textAlign='center';
      ctx.shadowColor='rgba(16,20,65,.45)';ctx.shadowBlur=3;
      ctx.font='500 48px sans-serif';ctx.fillStyle='#f5a3d9';ctx.fillText('خطوة بسيطة',x+256,740,460);
      ctx.fillStyle='#ffffff';ctx.fillText('لحياة أفضل',x+256,812,460);
      ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.fillStyle='#15151d';ctx.fillRect(x,960,512,64);
      ctx.direction='ltr';ctx.font='600 23px sans-serif';ctx.fillStyle='#ffffff';ctx.fillText('al arabia',x+256,1000);
      ctx.restore();
    }
    texture.needsUpdate=true;
  };
  draw(0);
  texture.userData.ready=new Promise(resolve=>{
    new THREE.ImageLoader().load(campaignAtlasPath,loaded=>{
      if(!disposed){image=loaded;draw(0);}resolve();
    },undefined,()=>resolve());
  });
  material.addEventListener('dispose',()=>{disposed=true;image=null;texture.dispose();});
  return {material,animate:()=>{
    if(disposed||!image)return;
    const now=performance.now()/1000;start??=now;
    if((reducedMotion&&lastFrame!==-Infinity)||now-lastFrame<1/15)return;
    lastFrame=now;draw(now-start);
  }};
}
