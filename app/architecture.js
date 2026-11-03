import * as THREE from 'three';

const iZoneWallTextures=new Map();
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
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.65,...extra});
  const add=(g,geometry,m,x,y,z)=>{const o=new THREE.Mesh(geometry,m);o.position.set(x,y,z);o.castShadow=!m.transparent;o.receiveShadow=true;g.add(o);return o;};
  for(const wall of data.walls||[]){
    const elevation=wall.elevation??0;
    if(cutaway&&elevation>=1.05)continue;
    const [ax,az]=wall.start,[bx,bz]=wall.end,length=Math.hypot(bx-ax,bz-az),height=cutaway?Math.min(1.05-elevation,wall.height):wall.height;
    const group=new THREE.Group();group.position.set(ax,elevation,az);group.rotation.y=-Math.atan2(bz-az,bx-ax);group.userData.boundaryId=wall.id;root.add(group);
    if(wall.variant==='opaque-blue-panel') {
      const finish=material(wall.color||'#245968',{roughness:.18,metalness:.28});
      add(group,new THREE.BoxGeometry(length,height,wall.thickness),finish,length/2,height/2,0);
      const seam=material('#486d73',{roughness:.25,metalness:.45});
      for(let x=0;x<=length+.001;x+=length/Math.ceil(length/1.2))add(group,new THREE.BoxGeometry(.012,height,.008),seam,x,height/2,wall.thickness/2+.004);
      continue;
    }
    if (wall.kind === 'glass') {
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

      for (const x of [0, length / 2, length]) {
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
    add(group,geometry,iZoneFinish?material('#ffffff',{map:iZoneWallTexture(wall.color||'#d8d3c7',wood),roughness:wood?.48:.72}):material(wall.color||'#e2dfd5'),0,0,0);
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
      if(wall.finish==='dark-reflective-panels'){
        const gloss=material('#252c2c',{roughness:.16,metalness:.3});
        for(let i=0;i<5;i++)add(group,new THREE.BoxGeometry(length/5-.025,height-.15,.035),gloss,(i+.5)*length/5,height/2+.05,z);
        for(const y of [.16,Math.min(2.35,height-.03)])add(group,new THREE.BoxGeometry(length,.035,.045),brass,length/2,y,z+wall.interiorSide*.025);
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
      if(wall.pilaster){const p=wall.pilaster;add(group,new THREE.BoxGeometry(p.width,height,p.depth),material('#e4e0d6'),p.offset,height/2,z+wall.interiorSide*p.depth/2);}
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
