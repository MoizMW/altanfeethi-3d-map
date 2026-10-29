import * as THREE from 'three';

export function buildArchitecture(data,{cutaway=false,ceiling=false}={}) {
  const root=new THREE.Group();root.name='Architecture';
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.65,...extra});
  const add=(g,geometry,m,x,y,z)=>{const o=new THREE.Mesh(geometry,m);o.position.set(x,y,z);o.castShadow=!m.transparent;o.receiveShadow=true;g.add(o);return o;};
  for(const wall of data.walls||[]){
    const [ax,az]=wall.start,[bx,bz]=wall.end,length=Math.hypot(bx-ax,bz-az),height=cutaway?Math.min(1.05,wall.height):wall.height;
    const group=new THREE.Group();group.position.set(ax,0,az);group.rotation.y=-Math.atan2(bz-az,bx-ax);group.userData.boundaryId=wall.id;root.add(group);
    if(wall.kind==='glass'){
      add(group,new THREE.BoxGeometry(length,height,wall.thickness),material('#9dbfc3',{transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide}),length/2,height/2,0);
      const frame=material('#717a78',{metalness:.45,roughness:.4});
      for(const x of [0,length/2,length])add(group,new THREE.BoxGeometry(.05,height,.08),frame,x,height/2,0);
      for(const y of [.08,height])add(group,new THREE.BoxGeometry(length,.06,.08),frame,length/2,y,0);
      add(group,new THREE.BoxGeometry(length,.42,.015),material('#cadbd8',{transparent:true,opacity:.4,depthWrite:false}),length/2,Math.min(.85,height/2),-.05);continue;
    }
    const openings=(data.openings||[]).filter(o=>o.wallId===wall.id).sort((a,b)=>a.offset-b.offset);
    // The wall contour follows the arch; no wall plane crosses the opening.
    const shape=new THREE.Shape();shape.moveTo(0,0);
    for(const o of openings){const left=o.offset-o.width/2,right=o.offset+o.width/2;shape.lineTo(left,0);shape.lineTo(left,Math.min(o.springHeight,height));
      if(o.height>=height&&cutaway)shape.lineTo(right,height);
      else shape.absellipse(o.offset,o.springHeight,o.width/2,o.height-o.springHeight,Math.PI,0,true,0);
      shape.lineTo(right,0);
    }
    shape.lineTo(length,0);shape.lineTo(length,height);shape.lineTo(0,height);shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:wall.thickness,bevelEnabled:false,curveSegments:24});geometry.translate(0,0,-wall.thickness/2);
    add(group,geometry,material(wall.color||'#e2dfd5'),0,0,0);
    if(wall.finish){
      // Side-wall relief is component detail; structural endpoints stay stable.
      const z=wall.interiorSide*(wall.thickness/2+.025),brass=material('#ab9564',{metalness:.6,roughness:.35});
      if(wall.finish==='dark-reflective-panels'){
        const gloss=material('#252c2c',{roughness:.16,metalness:.3});
        for(let i=0;i<5;i++)add(group,new THREE.BoxGeometry(length/5-.025,height-.15,.035),gloss,(i+.5)*length/5,height/2+.05,z);
        for(const y of [.16,Math.min(2.35,height-.03)])add(group,new THREE.BoxGeometry(length,.035,.045),brass,length/2,y,z+wall.interiorSide*.025);
      }else if(wall.finish==='teal-gold-panels'){
        add(group,new THREE.BoxGeometry(length,height-.14,.05),material('#174d57'),length/2,height/2+.05,z);
        const dx=.4,dy=.46;
        for(let i=0;i<Math.floor(length/dx);i++)for(let j=0;j<Math.floor(height/dy);j++){
          const x=i*dx,y=.14+j*dy,depth=z+wall.interiorSide*.04;
          for(const sign of [-1,1]){
            const a=new THREE.Vector3(x,sign===1?y:y+dy,depth),b=new THREE.Vector3(x+dx,sign===1?y+dy:y,depth),v=b.clone().sub(a);
            const bar=add(group,new THREE.CylinderGeometry(.006,.006,v.length(),4),brass,...a.clone().add(b).multiplyScalar(.5).toArray());bar.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
          }
        }
      }
      if(wall.pilaster){const p=wall.pilaster;add(group,new THREE.BoxGeometry(p.width,height,p.depth),material('#e4e0d6'),p.offset,height/2,z+wall.interiorSide*p.depth/2);}
    }
    const trim=material('#444947');let cursor=0;
    for(const o of [...openings,{offset:length,width:0}]){const end=o.offset-o.width/2;if(end>cursor)add(group,new THREE.BoxGeometry(end-cursor,.12,wall.thickness+.015),trim,(cursor+end)/2,.06,0);cursor=o.offset+o.width/2;}
  }
  if(ceiling&&data.ceiling){const c=data.ceiling;add(root,new THREE.BoxGeometry(c.size[0],.08,c.size[1]),material('#eceae2'),c.center?.[0]||0,c.height+.04,c.center?.[1]||0);}
  return root;
}
