import * as THREE from 'three';
import {buildVerticalCirculation,buildPatternedSurfaces} from './vertical-circulation.js';

const iZoneWallTextures=new Map();
const bookmatchedMarbleTextures=new Map();
function bookmatchedMarbleTexture(length,height){
  const key=`${length}:${height}`;
  if(bookmatchedMarbleTextures.has(key))return bookmatchedMarbleTextures.get(key);
  const size=512,bytes=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    // Mirror one stone field across both axes to approximate the observed diamond bookmatch.
    const u=Math.abs(x/(size-1)-.5),v=Math.abs(y/(size-1)-.5);
    const distance=u+v*.8+.014*Math.sin(u*32+v*17)+.008*Math.sin(u*71-v*24);
    const band=Math.sin(distance*61+Math.sin(distance*21)*1.8);
    const vein=Math.pow(Math.max(0,Math.sin(distance*123)),14);
    const shade=band*12-vein*34+Math.sin((u+v)*260)*3;
    const offset=(y*size+x)*4;
    for(let c=0;c<3;c++)bytes[offset+c]=Math.round([219,219,211][c]+shade);
    bytes[offset+3]=255;
  }
  const texture=new THREE.DataTexture(bytes,size,size,THREE.RGBAFormat);
  texture.colorSpace=THREE.SRGBColorSpace;texture.repeat.set(1/length,1/height);
  texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps=true;texture.anisotropy=8;texture.needsUpdate=true;
  bookmatchedMarbleTextures.set(key,texture);return texture;
}
const officeSignTextures=new Map();
function officeSignTexture(sign){
  if(typeof document==='undefined')return null;
  const key=JSON.stringify(sign);if(officeSignTextures.has(key))return officeSignTextures.get(key);
  const canvas=document.createElement('canvas');canvas.width=520;canvas.height=640;
  const ctx=canvas.getContext('2d');ctx.fillStyle=sign.color;ctx.fillRect(0,0,520,640);
  ctx.strokeStyle=sign.textColor;ctx.fillStyle=sign.textColor;ctx.lineWidth=7;
  ctx.strokeRect(20,20,480,600);
  if(sign.icon==='passport'){
    ctx.strokeRect(160,105,200,245);ctx.beginPath();ctx.moveTo(182,105);ctx.lineTo(182,350);ctx.stroke();
    ctx.beginPath();ctx.arc(270,205,62,0,Math.PI*2);ctx.moveTo(208,205);ctx.lineTo(332,205);ctx.moveTo(270,143);ctx.lineTo(270,267);ctx.stroke();
    ctx.beginPath();ctx.ellipse(270,205,28,62,0,0,Math.PI*2);ctx.stroke();
    ctx.fillRect(225,300,90,7);
  }else{
    ctx.strokeRect(135,165,250,170);ctx.strokeRect(220,120,80,45);
    for(const x of [180,340]){ctx.beginPath();ctx.moveTo(x,165);ctx.lineTo(x,335);ctx.stroke();}
    ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(220,245);ctx.lineTo(250,275);ctx.lineTo(305,215);ctx.stroke();
  }
  ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(85,395);ctx.lineTo(435,395);ctx.stroke();
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 51px sans-serif';
  const words=sign.text.toUpperCase().split(' ');ctx.fillText(words[0],260,465,450);ctx.font='500 43px sans-serif';ctx.fillText(words.slice(1).join(' '),260,535,450);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
  officeSignTextures.set(key,texture);return texture;
}
function iZoneWallTexture(color,wood){
  const key=`${color}:${wood}`;
  if(iZoneWallTextures.has(key))return iZoneWallTextures.get(key);
  // A physical-scale procedural finish: long vertical fibers, with no baked lighting.
  const width=256,height=256,bytes=new Uint8Array(width*height*4);
  const base=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
  const noise=(x,y)=>{const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v);};
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const drift=2*Math.sin(y/height*Math.PI*2),fiber=noise(Math.floor(x+drift),0)-.5;
    const streak=Math.sin(x*.23+Math.sin(y/height*Math.PI*2)*.6);
    const variation=fiber*(wood?19:14)+streak*(wood?5:6)+(noise(x,y)-.5)*3;
    const offset=(y*width+x)*4;
    for(let c=0;c<3;c++)bytes[offset+c]=Math.max(0,Math.min(255,base[c]+variation));
    bytes[offset+3]=255;
  }
  const texture=new THREE.DataTexture(bytes,width,height,THREE.RGBAFormat);
  texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(1/1.2,1/2.4);texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps=true;texture.anisotropy=8;texture.needsUpdate=true;
  iZoneWallTextures.set(key,texture);return texture;
}

export function buildArchitecture(data,{cutaway=false,ceiling=false}={}) {
  const root=new THREE.Group();root.name='Architecture';
  for(const structure of data.structures||[])root.add(buildVerticalCirculation(structure));
  root.add(buildPatternedSurfaces(data.floorSections));
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.65,...extra});
  const add=(g,geometry,m,x,y,z)=>{const o=new THREE.Mesh(geometry,m);o.position.set(x,y,z);o.castShadow=!m.transparent;o.receiveShadow=true;g.add(o);return o;};
  for(const wall of data.walls||[]){
    const elevation=wall.elevation??0;
    if(cutaway&&elevation>=1.05)continue;
    const [ax,az]=wall.start,[bx,bz]=wall.end,length=Math.hypot(bx-ax,bz-az),height=cutaway?Math.min(1.05-elevation,wall.height):wall.height;
    const group=new THREE.Group();group.position.set(ax,elevation,az);group.rotation.y=-Math.atan2(bz-az,bx-ax);group.userData.boundaryId=wall.id;root.add(group);
    if(wall.variant==='cream-grey-window'){
      const window=wall.window,left=(length-window.width)/2,right=left+window.width;
      const cream=material(wall.color||'#dedbd2');
      for(const [width,h,x,y] of [[left,height,left/2,height/2],[left,height,(right+length)/2,height/2],[window.width,Math.min(window.sill,height),length/2,Math.min(window.sill,height)/2]])
        if(h>0)add(group,new THREE.BoxGeometry(width,h,wall.thickness),cream,x,y,0);
      const top=window.sill+window.height;
      if(height>top)add(group,new THREE.BoxGeometry(window.width,height-top,wall.thickness),cream,length/2,(top+height)/2,0);
      if(height>window.sill){
        const h=Math.min(window.height,height-window.sill),y=window.sill+h/2;
        const pane=add(group,new THREE.BoxGeometry(window.width,h,.035),material('#73797b',{roughness:.28,metalness:.16}),length/2,y,0);pane.name='Opaque grey window';
        const frame=material('#454b4c',{roughness:.3,metalness:.35});
        for(const x of [left,right])add(group,new THREE.BoxGeometry(.035,h,.07),frame,x,y,0);
        for(const level of [window.sill,top])if(level<=height)add(group,new THREE.BoxGeometry(window.width+.035,.035,.07),frame,length/2,level,0);
      }
      for(const side of [-1,1])for(const y of [1.35,2.7])if(y<height){
        const z=side*(wall.thickness/2+.002),seam=material('#8e8a7d');
        if(y>window.sill&&y<top){for(const x of [left/2,(right+length)/2])add(group,new THREE.BoxGeometry(left,.009,.003),seam,x,y,z);}
        else add(group,new THREE.BoxGeometry(length,.009,.003),seam,length/2,y,z);
      }
      continue;
    }
    if(wall.variant==='opaque-blue-panel') {
      const finish=material(wall.color||'#245968',{roughness:.18,metalness:.28});
      add(group,new THREE.BoxGeometry(length,height,wall.thickness),finish,length/2,height/2,0);
      const seam=material('#486d73',{roughness:.25,metalness:.45});
      for(let x=0;x<=length+.001;x+=length/Math.ceil(length/1.2))add(group,new THREE.BoxGeometry(.012,height,.008),seam,x,height/2,wall.thickness/2+.004);
      continue;
    }
    if (wall.kind === 'glass') {
      if(wall.variant==='frosted-cream'&&wall.automaticSliding){
        const pillar=wall.pillarWidth,door=wall.doors[0],half=door.width/2;
        const cream=material('#dedbd2'),glass=material(wall.color,{roughness:.85}),dark=material('#454b4b',{roughness:.35,metalness:.3});
        for(const x of [pillar/2,length-pillar/2]){
          const pier=add(group,new THREE.BoxGeometry(pillar,height,.22),cream,x,height/2,0);pier.name='Door support pillar';
        }
        const fraction=THREE.MathUtils.clamp(wall.openFraction??0,0,1);
        for(let i=0;i<2;i++){
          const panel=new THREE.Group();panel.name=i?'Sliding frosted panel':'Fixed frosted panel';
          panel.position.set(pillar+half*(i+.5)-(i?half*fraction:0),0,i?.026:-.026);group.add(panel);
          add(panel,new THREE.BoxGeometry(half-.035,height-.05,.025),glass,0,height/2,0);
          for(const x of [-half/2,half/2])add(panel,new THREE.BoxGeometry(.025,height,.045),dark,x,height/2,0);
        }
        add(group,new THREE.BoxGeometry(door.width,.06,.1),dark,length/2,height-.03,0).name='Sliding door track';
        if(height>=1.3)for(const side of [-1,1]){
          const z=side*.125;
          const button=add(group,new THREE.CylinderGeometry(.052,.052,.014,32),material('#323739',{roughness:.65}),length-pillar/2,1.2,z);button.rotation.x=Math.PI/2;button.name='Automatic door button';
          const ring=add(group,new THREE.TorusGeometry(.064,.006,8,40),material('#286ea3',{emissive:'#17416b',emissiveIntensity:.3,roughness:.45}),length-pillar/2,1.2,z+side*.011);ring.name='Subtle blue button ring';
        }
        continue;
      }
      if(wall.variant==='opaque-black-glass'){
        add(group,new THREE.BoxGeometry(length,height,wall.thickness),material(wall.color||'#171b1d',{roughness:.13,metalness:.28}),length/2,height/2,0);
        const joint=material('#353b3b',{roughness:.22,metalness:.4});
        for(const side of [-1,1])for(let x=length/3;x<length-.01;x+=length/3)add(group,new THREE.BoxGeometry(.008,height,.004),joint,x,height/2,side*(wall.thickness/2+.002));
        continue;
      }
      if(wall.variant==='reeded-divider'){
        if(wall.doors?.some(door=>door.kind==='sliding')){
          const metal=material('#a69b80',{metalness:.45,roughness:.4});
          const reeded=material('#a8a999',{transparent:true,opacity:.32,roughness:.4,depthWrite:false,side:THREE.DoubleSide});
          const pane=(target,width,h,x)=>{
            if(width<.001||h<.001)return;
            add(target,new THREE.BoxGeometry(width,h,wall.thickness),reeded,x,h/2,0);
            for(const edge of [-1,1])add(target,new THREE.BoxGeometry(.035,h,.05),metal,x+edge*width/2,h/2,0);
            for(const y of [.035,h-.0175])add(target,new THREE.BoxGeometry(width,.035,.05),metal,x,y,0);
            const lines=[];
            for(let at=.04;at<width;at+=.055)for(const z of [-wall.thickness/2-.002,wall.thickness/2+.002])lines.push(new THREE.Vector3(x-width/2+at,.06,z),new THREE.Vector3(x-width/2+at,h-.03,z));
            target.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lines),new THREE.LineBasicMaterial({color:'#8b8975',transparent:true,opacity:.65})));
          };
          let cursor=0;
          for(const door of wall.doors.slice().sort((a,b)=>a.offset-b.offset)){
            const left=door.offset-door.width/2,right=door.offset+door.width/2,h=Math.min(height,door.height);
            pane(group,left-cursor,height,(cursor+left)/2);
            const leaf=new THREE.Group();leaf.name='Sliding reeded glass door';leaf.userData.doorId=door.id;
            leaf.position.set(door.offset+(door.slideDirection??-1)*door.width*(door.openFraction??0),0,wall.thickness+.025);group.add(leaf);
            pane(leaf,door.width,h,0);
            if(height>door.height){const transom=new THREE.Group();transom.position.y=door.height;group.add(transom);pane(transom,door.width,height-door.height,door.offset);}
            const handleY=Math.min(door.handleHeight??1.1,h-.2),handleLength=door.handleLength??.32;
            if(handleY>handleLength/2)for(const side of [-1,1]){
              const handle=add(leaf,new THREE.BoxGeometry(.025,handleLength,.035),metal,-(door.slideDirection??-1)*door.width*.36,handleY,side*(wall.thickness/2+.055));handle.name='Sliding door pull handle';
              for(const y of [handleY-handleLength/2,handleY+handleLength/2])add(leaf,new THREE.BoxGeometry(.025,.025,.055),metal,handle.position.x,y,side*(wall.thickness/2+.0275));
            }
            const travel=door.width*(door.slideDirection??-1),trackStart=Math.min(left,left+travel),trackEnd=Math.max(right,right+travel);
            const track=add(group,new THREE.BoxGeometry(trackEnd-trackStart+.06,.075,.11),metal,(trackStart+trackEnd)/2,h+.0375,wall.thickness+.025);track.name='Sliding entrance track';
            cursor=right;
          }
          pane(group,length-cursor,height,(length+cursor)/2);
          continue;
        }
        add(group,new THREE.BoxGeometry(length,height,wall.thickness),material('#a8a999',{transparent:true,opacity:.32,roughness:.4,depthWrite:false,side:THREE.DoubleSide}),length/2,height/2,0);
        const metal=material('#a69b80',{metalness:.45,roughness:.4});
        for(const x of [0,length])add(group,new THREE.BoxGeometry(.035,height,.05),metal,x,height/2,0);
        for(const y of [.06,height])add(group,new THREE.BoxGeometry(length,.035,.05),metal,length/2,y,0);
        const lines=[];for(let x=.04;x<length;x+=.055)for(const z of [-wall.thickness/2-.002,wall.thickness/2+.002])lines.push(new THREE.Vector3(x,.06,z),new THREE.Vector3(x,height-.03,z));
        group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lines),new THREE.LineBasicMaterial({color:'#8b8975',transparent:true,opacity:.65})));
        continue;
      }
      if(wall.variant==='frosted-diagonal'){
        add(group,new THREE.BoxGeometry(length,height,wall.thickness),material(wall.color||'#b5c9bc',{
          transparent:true,opacity:.48,roughness:.4,depthWrite:false,side:THREE.DoubleSide
        }),length/2,height/2,0);
        const frame=material('#737e75',{metalness:.55,roughness:.35});
        for(let x=0;x<=length+.001;x+=length/Math.ceil(length/1.15))add(group,new THREE.BoxGeometry(.025,height,.045),frame,x,height/2,0);
        for(const y of [.035,height-.025])add(group,new THREE.BoxGeometry(length,.035,.05),frame,length/2,y,0);
        // Clipped diagonal inlays approximate the fixed glazing, not stored loose trim.
        for(let start=-height;start<length;start+=.62){
          const x1=Math.max(.03,start),x2=Math.min(length-.03,start+height-.06);
          if(x2<=x1)continue;
          const y1=x1-start+.03,y2=x2-start+.03,span=Math.hypot(x2-x1,y2-y1);
          for(const side of [-1,1]){
            const stripe=add(group,new THREE.BoxGeometry(span,.018,.004),material('#a99158',{metalness:.65,roughness:.3}),(x1+x2)/2,(y1+y2)/2,side*(wall.thickness/2+.003));
            stripe.rotation.z=Math.PI/4;
          }
        }
        continue;
      }
      if (wall.variant === 'blue-gold-geometric') {
        add(group, new THREE.BoxGeometry(length, height, wall.thickness),
          material(wall.color || '#245968', {
            transparent: true, opacity: .3, roughness: .2, metalness: .12,
            depthWrite: false, side: THREE.DoubleSide
          }), length / 2, height / 2, 0);

        const brass = material('#b69957', { metalness: .7, roughness: .3 });
        for (const x of [0, length]) {
          add(group, new THREE.BoxGeometry(.035, height, .05), brass, x, height / 2, 0);
        }
        for (const y of [.12, height]) {
          add(group, new THREE.BoxGeometry(length, .035, .05), brass, length / 2, y, 0);
        }
        add(group, new THREE.BoxGeometry(length, .1, .065),
          material('#3c4847'), length / 2, .05, 0);

        const points = [];
        const segment = (a, b) => {
          let low = 0, high = 1;
          const dx = b[0] - a[0], dy = b[1] - a[1];

          for (const [v, d, min, max] of [
            [a[0], dx, .025, length - .025],
            [a[1], dy, .14, height - .025]
          ]) {
            if (Math.abs(d) < 1e-9) {
              if (v < min || v > max) return;
            } else {
              const t1 = (min - v) / d, t2 = (max - v) / d;
              low = Math.max(low, Math.min(t1, t2));
              high = Math.min(high, Math.max(t1, t2));
            }
          }

          if (low > high) return;
          for (const side of [-1, 1]) {
            for (const t of [low, high]) {
              points.push(new THREE.Vector3(
                a[0] + t * dx, a[1] + t * dy,
                side * (wall.thickness / 2 + .003)
              ));
            }
          }
        };

        for (let row = 0; row < Math.ceil(height / .8) + 1; row++) {
          for (let col = -1; col < Math.ceil(length / .85) + 1; col++) {
            const cx = .425 + col * .85 + (row % 2) * .425;
            const cy = .43 + row * .8;
            const ring = Array.from({ length: 24 }, (_, i) => {
              const angle = i * Math.PI / 12;
              const r = i % 2 ? .11 : .31;
              return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
            });

            for (let i = 0; i < 24; i++) segment(ring[i], ring[(i + 1) % 24]);
            for (let i = 0; i < 12; i++) {
              const angle = i * Math.PI / 6;
              segment(
                [cx + Math.cos(angle) * .13, cy + Math.sin(angle) * .13],
                ring[i * 2]
              );
            }

            segment([cx, cy], [cx + .85, cy]);
            segment([cx, cy], [cx + .425, cy + .8]);
            segment([cx, cy], [cx - .425, cy + .8]);
          }
        }

        group.add(new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({
            color: '#c5a964', transparent: true, opacity: .65, depthWrite: false
          })
        ));
        continue;
      }

      if (wall.variant === 'curtained') {
        add(group, new THREE.BoxGeometry(length, height, wall.thickness),
          material('#9dbfc3', {
            transparent: true, opacity: .2, depthWrite: false,
            side: THREE.DoubleSide
          }), length / 2, height / 2, 0);

        const fabric = material('#e9ece5', {
          transparent: true, opacity: .7, roughness: .95,
          side: THREE.DoubleSide
        });
        const n = Math.ceil(length / .12), side = wall.interiorSide || 1;

        for (let i = 0; i < n; i++) {
          add(group, new THREE.BoxGeometry(
            length / n + .005, Math.max(.1, height - .12), .025
          ), fabric, (i + .5) * length / n, height / 2 + .02,
          side * (.09 + (i % 2) * .045));
        }

        add(group, new THREE.BoxGeometry(length, .04, .05),
          material('#a69b80', { metalness: .4 }), length / 2, height - .02, side * .09);
        continue;
      }

      if (wall.variant === 'patterned-smoked') {
        add(group, new THREE.BoxGeometry(length, height, wall.thickness),
          material(wall.color || '#74807c', {
            transparent: true, opacity: .42, roughness: .18,
            metalness: .12, depthWrite: false, side: THREE.DoubleSide
          }), length / 2, height / 2, 0);

        const brass = material('#a58b57', { metalness: .65, roughness: .3 });
        for (const x of [0, length]) {
          add(group, new THREE.BoxGeometry(.035, height, .045), brass, x, height / 2, 0);
        }
        for (const y of [.14, height]) {
          add(group, new THREE.BoxGeometry(length, .035, .045), brass, length / 2, y, 0);
        }
        add(group, new THREE.BoxGeometry(length, .12, .085),
          material('#3f4541'), length / 2, .06, 0);

        const bottom = .65, top = Math.min(1.4, height - .04);
        if (top > bottom) {
          add(group, new THREE.BoxGeometry(length, top - bottom, .004),
            material('#b0b8b3', {
              transparent: true, opacity: .23, depthWrite: false
            }), length / 2, (top + bottom) / 2, 0);

          const points = [];
          const segment = (a, b) => {
            const dx = b[0] - a[0], dy = b[1] - a[1];
            let low = 0, high = 1;

            for (const [start, delta, min, max] of [
              [a[0], dx, 0, length],
              [a[1], dy, bottom, top]
            ]) {
              if (Math.abs(delta) < 1e-9) {
                if (start < min || start > max) return;
              } else {
                const t1 = (min - start) / delta, t2 = (max - start) / delta;
                low = Math.max(low, Math.min(t1, t2));
                high = Math.min(high, Math.max(t1, t2));
              }
            }

            if (low <= high) {
              for (const t of [low, high]) {
                points.push(new THREE.Vector3(
                  a[0] + dx * t, a[1] + dy * t, wall.thickness / 2 + .003
                ));
              }
            }
          };

          for (let x = -.7; x < length + .7; x += 1.05) {
            for (let i = 0; i < 4; i++) {
              const y = .83 + i * .075, peak = [x + .52, y + .48];
              segment([x, y], peak);
              segment(peak, [x + 1.04, y]);
              segment([x, 1.55 - i * .075], [x + .52, 1.07 - i * .075]);
              segment([x + .52, 1.07 - i * .075], [x + 1.04, 1.55 - i * .075]);
            }
          }

          group.add(new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({
              color: '#c3cbc4', transparent: true, opacity: .8, depthWrite: false
            })
          ));
        }
        continue;
      }

      // Segment door frontages so a fixed pane never covers the door leaf.
      if(wall.doors?.length){
        const frosted=wall.variant==='frosted-cream';
        const glass=material(wall.color||'#9dbfc3',{transparent:!frosted,opacity:frosted?1:(wall.opacity??.22),
          depthWrite:frosted,roughness:frosted?.85:.65,side:THREE.DoubleSide});
        const frame=material(wall.frameColor||'#717a78',{metalness:.45,roughness:.4});
        const pane=(width,h,x,y,target=group)=>{
          if(width>.001&&h>.001)add(target,new THREE.BoxGeometry(width,h,wall.thickness),glass,x,y,0);
        };
        const doors=wall.doors.slice().sort((a,b)=>a.offset-b.offset);
        let cursor=0;
        for(const door of doors){
          const left=door.offset-door.width/2,right=door.offset+door.width/2;
          pane(left-cursor,height,(cursor+left)/2,height/2);
          if(height>door.height)pane(door.width,height-door.height,door.offset,(height+door.height)/2);
          const leaf=new THREE.Group();leaf.name='Glass door';leaf.userData.doorId=door.id;
          leaf.position.x=door.offset;group.add(leaf);
          const leafHeight=Math.min(height,door.height)-.04;
          pane(door.width-.055,leafHeight,0,.04+leafHeight/2,leaf);
          if(door.sign&&door.sign.elevation+door.sign.height/2<=height){
            const sign=door.sign,texture=officeSignTexture(sign);
            const plaque=new THREE.Group();plaque.name=sign.text;plaque.userData.officeSign=sign;
            leaf.add(plaque);
            add(plaque,new THREE.BoxGeometry(sign.width,sign.height,.025),material(sign.color),0,sign.elevation,0);
            // Readable on both sides of the door, with no mirrored lettering.
            for(const side of [-1,1]){
              const face=add(plaque,new THREE.PlaneGeometry(sign.width,sign.height),new THREE.MeshBasicMaterial({map:texture,color:texture?'#ffffff':sign.color}),0,sign.elevation,side*(wall.thickness/2+.016));
              face.rotation.y=side<0?Math.PI:0;
            }
          }
          for(const x of [left,right])add(group,new THREE.BoxGeometry(.035,height,.075),frame,x,height/2,0);
          if(door.height<=height)add(group,new THREE.BoxGeometry(door.width,.045,.075),frame,door.offset,door.height,0);
          const handleCenter=door.handleHeight??1.2,handleLength=door.handleLength??.85;
          const bottom=Math.max(.05,handleCenter-handleLength/2),top=Math.min(height-.02,handleCenter+handleLength/2);
          if(top>bottom){
            const handle=material(door.handleColor||'#202b2a',{roughness:.35,metalness:.5});
            const x=door.width/2-.13;
            for(const side of [-1,1]){
              const z=side*(wall.thickness/2+.055);
              const bar=add(leaf,new THREE.CylinderGeometry(.013,.013,top-bottom,16),handle,x,(top+bottom)/2,z);
              bar.name='Door pull handle';
              for(const y of [bottom+.035,top-.035]){
                if(y<bottom||y>top)continue;
                const mount=add(leaf,new THREE.CylinderGeometry(.009,.009,.055,12),handle,x,y,side*(wall.thickness/2+.0275));
                mount.rotation.x=Math.PI/2;
              }
            }
          }
          cursor=right;
        }
        pane(length-cursor,height,(cursor+length)/2,height/2);
        for(const x of [0,length])add(group,new THREE.BoxGeometry(.05,height,.08),frame,x,height/2,0);
        // No sill crosses a doorway; the top rail stays at the visible cut height.
        add(group,new THREE.BoxGeometry(length,.06,.08),frame,length/2,height,0);
        continue;
      }

      // Standard glass fallback, including G17's wall-specific finish settings.
      add(group, new THREE.BoxGeometry(length, height, wall.thickness),
        material(wall.color || '#9dbfc3', {
          transparent: true,
          opacity: wall.opacity ?? .22,
          depthWrite: false,
          side: THREE.DoubleSide
        }), length / 2, height / 2, 0);

      const frame = material(wall.frameColor || '#717a78', {
        metalness: .45, roughness: .4
      });

      const frameXs=wall.frameSpacing>0?Array.from({length:Math.ceil(length/wall.frameSpacing)+1},(_,i)=>Math.min(i*wall.frameSpacing,length)):[0,length/2,length];
      for (const x of frameXs) {
        add(group, new THREE.BoxGeometry(.05, height, .08), frame, x, height / 2, 0);
      }
      for (const y of [.08, height]) {
        add(group, new THREE.BoxGeometry(length, .06, .08), frame, length / 2, y, 0);
      }

      const splitHeight = wall.height * (wall.horizontalSplit ?? 0);
      if (splitHeight > 0 && splitHeight < height) {
        add(group, new THREE.BoxGeometry(length, .08, Math.max(.08, wall.thickness + .02)),
          frame, length / 2, splitHeight, 0);
      }

      if (wall.privacyBand !== false) {
        add(group, new THREE.BoxGeometry(length, .42, .015),
          material('#cadbd8', {
            transparent: true, opacity: .4, depthWrite: false
          }), length / 2, Math.min(.85, height / 2), -.05);
      }
      continue;
    }
    const openings=(data.openings||[]).filter(o=>o.wallId===wall.id).sort((a,b)=>a.offset-b.offset);
    // The wall contour follows the arch; no wall plane crosses the opening.
    const shape=new THREE.Shape();shape.moveTo(0,0);
    // Carry the wider piers through the spring and ellipse so the arch has one continuous profile.
    const pierInset=o=>Math.min(.12,o.width*.05);
    for(const o of openings){const radius=o.width/2-pierInset(o),left=o.offset-radius,right=o.offset+radius;shape.lineTo(left,0);shape.lineTo(left,Math.min(o.springHeight,height));
      if(o.height>=height&&cutaway)shape.lineTo(right,height);
      else shape.absellipse(o.offset,o.springHeight,radius,o.height-o.springHeight,Math.PI,0,true,0);
      shape.lineTo(right,0);
    }
    shape.lineTo(length,0);shape.lineTo(length,height);shape.lineTo(0,height);shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:wall.thickness,bevelEnabled:false,curveSegments:24});geometry.translate(0,0,-wall.thickness/2);
    const iZoneFinish=['i-zone-stone-panels','i-zone-wood-panels'].includes(wall.finish);
    const wood=wall.finish==='i-zone-wood-panels';
    const wallMaterial=wall.finish==='bookmatched-marble'
      ?material('#ffffff',{map:bookmatchedMarbleTexture(length,wall.height),roughness:.3})
      :iZoneFinish?material('#ffffff',{map:iZoneWallTexture(wall.color||'#d8d3c7',wood),roughness:wood?.48:.72}):material(wall.color||'#e2dfd5');
    add(group,geometry,wallMaterial,0,0,0);
    if(iZoneFinish){
      const joint=material(wood?'#604938':'#55594f',{roughness:.85});
      for(const side of [-1,1]){
        const z=side*(wall.thickness/2+.0015),pitch=wood?2.2:1.15;
        for(let x=pitch;x<length-.05;x+=pitch)add(group,new THREE.BoxGeometry(wood?.006:.009,height,.003),joint,x,height/2,z);
        for(const y of (wood?[1.6,3.2]:[1.15,1.8,2.95]))if(y<height-.025)add(group,new THREE.BoxGeometry(length,wood?.006:.009,.003),joint,length/2,y,z);
      }
    }
    if(wall.finish&&!iZoneFinish){
      // Side-wall relief is component detail; structural endpoints stay stable.
      for(const interiorSide of wall.finishSides||[wall.interiorSide]){
      const wallFace={...wall,interiorSide};
      const z=wallFace.interiorSide*(wall.thickness/2+.025),brass=material('#ab9564',{metalness:.6,roughness:.35});
      if(wall.finish==='cream-panel-joints'){
        const seam=material('#8e8a7d',{roughness:.8});
        for(const y of [1.35,2.7])if(y<height-.02)add(group,new THREE.BoxGeometry(length,.009,.003),seam,length/2,y,wallFace.interiorSide*(wall.thickness/2+.002));
      }else if(wall.finish==='warm-wood'){
        add(group,new THREE.BoxGeometry(length,height-.12,.025),material(wall.color||'#856746'),length/2,height/2+.06,z);
        for(let x=.48;x<length;x+=.48)add(group,new THREE.BoxGeometry(.008,height-.12,.006),material('#67513d'),x,height/2+.06,z+interiorSide*.018);
      }else if(wall.finish==='dark-reflective-panels'){
        const gloss=material('#252c2c',{roughness:.16,metalness:.3});
        for(let i=0;i<5;i++)add(group,new THREE.BoxGeometry(length/5-.025,height-.15,.035),gloss,(i+.5)*length/5,height/2+.05,z);
        for(const y of [.16,Math.min(2.35,height-.03)])add(group,new THREE.BoxGeometry(length,.035,.045),brass,length/2,y,z+wallFace.interiorSide*.025);
      }else if(wall.finish==='teal-gold-panels'){
        add(group,new THREE.BoxGeometry(length,height-.14,.05),material('#174d57'),length/2,height/2+.05,z);
        const dx=.4,dy=.46;
        for(let i=0;i<Math.floor(length/dx);i++)for(let j=0;j<Math.floor(height/dy);j++){
            const x=i*dx,y=.14+j*dy,depth=z+wallFace.interiorSide*.04;
          for(const sign of [-1,1]){
            const a=new THREE.Vector3(x,sign===1?y:y+dy,depth),b=new THREE.Vector3(x+dx,sign===1?y+dy:y,depth),v=b.clone().sub(a);
            const bar=add(group,new THREE.CylinderGeometry(.006,.006,v.length(),4),brass,...a.clone().add(b).multiplyScalar(.5).toArray());bar.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
          }
        }
      }
      if(wall.pilaster){const p=wall.pilaster;add(group,new THREE.BoxGeometry(p.width,height,p.depth),material('#e4e0d6'),p.offset,height/2,z+wallFace.interiorSide*p.depth/2);}
      }
    }
    if(elevation>0)continue;
    const trim=material('#444947');let cursor=0;
    for(const o of [...openings,{offset:length,width:0}]){const inset=o.width?pierInset(o):0,end=o.offset-o.width/2+inset;if(end>cursor)add(group,new THREE.BoxGeometry(end-cursor,.12,wall.thickness+.015),trim,(cursor+end)/2,.06,0);cursor=o.offset+o.width/2-inset;}
  }
  if(ceiling&&data.ceiling){const c=data.ceiling;add(root,new THREE.BoxGeometry(c.size[0],.08,c.size[1]),material('#eceae2'),c.center?.[0]||0,c.height+.04,c.center?.[1]||0);}
  return root;
}

// Flat architectural inlays sit above the circulation surface; they never block a ray or aisle.
export function buildFloorInlays(data={}) {
  const group=new THREE.Group();group.name='Floor inlays';
  for(const inlay of data.floorInlays||[]) {
    const shape=new THREE.Shape();inlay.polygon.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
    const material=new THREE.MeshStandardMaterial({color:inlay.color,roughness:.27,metalness:.05,side:THREE.DoubleSide});
    const surface=new THREE.Mesh(new THREE.ShapeGeometry(shape),material);surface.rotation.x=-Math.PI/2;surface.position.y=-.009+(inlay.layer||0)*.001;surface.receiveShadow=true;group.add(surface);
  }
  return group;
}
