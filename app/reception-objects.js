import * as THREE from 'three';

// Local +Z is the visitor side of counters and the facing direction of chairs.
export const receptionSizes = {
  'automatic-glass-gate': [8.4,2.8,.16],
  'privacy-pod': [1.35,2.35,1.35],
  'floor-lamp': [.46,1.85,.46],
  'display-console': [3.1,.9,.4],
  counter: [2.45, 1.18, .86],
  'office-chair': [.64, 1.22, .68],
  cabinet: [2.45, .78, .42],
  display: [.58, .42, .18],
  'wall-panel': [12.2, 4.1, .12],
  'luggage-scale': [.6, 1.65, .75],
};

export function buildReceptionObject(g, o, {box, mesh, rod, mat}) {
  const [w,h,d] = receptionSizes[o.type];
  const body=mat(o.color), wood=mat('#856746'), charcoal=mat('#242a2c'), metal=mat('#a7afb0',.3,.65);
  if(o.type==='automatic-glass-gate'&&o.variant==='swing-turnstile'){
    // Rotate leaves in physical units before the viewer's nonuniform reference scaling.
    const assembly=new THREE.Group();assembly.scale.fromArray(receptionSizes[o.type].map((v,i)=>v/o.size[i]));g.add(assembly);g=assembly;
    const [w,h,d]=o.size;
    const glass=new THREE.MeshStandardMaterial({color:'#c1d5d1',transparent:true,opacity:.55,roughness:.2,depthWrite:false,side:THREE.DoubleSide});
    const rail=mat('#a3acad',.3,.7),top=mat('#242c2d',.25),green=mat('#51bf9b',.3);
    for(const x of [-w*.47,0,w*.47]){
      for(const z of [-d*.39,d*.39])box(g,[w*.05,h,d*.15],[x,h/2,z],rail,.02);
      box(g,[w*.065,h*.055,d],[x,h*.97,0],top,.015);
      box(g,[w*.04,h*.55,d*.018],[x,h*.42,0],rail,.004);
      box(g,[w*.04,h*.016,d*.1],[x,h,d*.34],green,.002);
    }
    for(const center of [-w*.235,w*.235])for(const sign of [-1,1]){
      const hinge=new THREE.Group();hinge.position.set(center+sign*w*.21,h*.54,0);hinge.rotation.y=sign*(o.openFraction??0)*Math.PI/2;g.add(hinge);
      box(hinge,[w*.195,h*.57,d*.018],[-sign*w*.0975,0,0],glass,.006);
    }
  }else if(o.type==='automatic-glass-gate'){
    const frame=mat(o.color,.32,.65),glass=new THREE.MeshStandardMaterial({color:'#a7c1c7',transparent:true,opacity:.2,roughness:.12,depthWrite:false,side:THREE.DoubleSide});
    const clear=3.6,sideWidth=(w-clear)/2,open=o.openFraction??0,leafHeight=h-.13;
    const pane=(width,x,z)=>{
      const leaf=new THREE.Group();leaf.position.set(x,0,z);g.add(leaf);
      box(leaf,[width-.06,leafHeight-.18,.018],[0,leafHeight/2,0],glass,.003);
      for(const edge of [-1,1])box(leaf,[.055,leafHeight,.065],[edge*(width/2-.0275),leafHeight/2,0],frame,.005);
      for(const y of [.055,leafHeight-.055])box(leaf,[width,.075,.065],[0,y,0],frame,.005);
      for(const y of [.95,1.65])box(leaf,[width-.06,.028,.021],[0,y,.012],mat('#d3dedc',.45),.002);
    };
    for(const sign of [-1,1]){
      pane(sideWidth,sign*(clear/2+sideWidth/2),0);
      pane(clear/2,sign*(clear/4+open*clear/2),.075);
    }
    box(g,[w,.13,.19],[0,h-.065,0],frame,.012);
    box(g,[.22,.055,.07],[0,h-.09,-.13],mat('#202c2e'),.012);
    box(g,[w,.018,.13],[0,.009,0],frame,.002);
  }else if(o.type==='privacy-pod'){
    const shell=mat(o.color,.65),frame=mat('#293335',.35,.3);
    const glass=new THREE.MeshStandardMaterial({color:'#a6bdbe',transparent:true,opacity:.18,roughness:.12,depthWrite:false,side:THREE.DoubleSide});
    box(g,[w,.08,d],[0,.04,0],frame,.025);
    box(g,[w,.08,d],[0,h-.04,0],frame,.025);
    box(g,[w-.08,h-.16,.07],[0,h/2,-d/2+.035],shell,.012);
    for(const x of [-w/2+.035,w/2-.035])box(g,[.07,h-.16,d-.08],[x,h/2,0],shell,.012);
    for(const x of [-w/2+.045,w/2-.045])box(g,[.055,h-.12,.055],[x,h/2,d/2-.035],frame,.012);
    box(g,[w-.12,h-.18,.018],[0,h/2,d/2-.035],glass,.005);
    box(g,[.025,.22,.035],[w*.3,1.05,d/2+.012],metal,.008);
    box(g,[w-.2,.04,.38],[0,.94,-d*.2],mat('#e2ded4',.35),.012);
    for(let i=0;i<6;i++)box(g,[.015,.009,d*.45],[-.2+i*.08,h+.005,0],charcoal,.002);
    // A worktop is visible; no occupancy seat or chair identity is inferred.
  }else if(o.type==='floor-lamp'&&o.variant==='pendant'){
    const shade=mat('#b9ad88',.22,.75);
    box(g,[w*.24,h*.018,d*.24],[0,h*.99,0],shade,.008);
    rod(g,[0,h*.97,0],[0,h*.7,0],.012,charcoal);
    mesh(g,new THREE.CylinderGeometry(w*.24,w*.48,h*.09,32),shade,[0,h*.66,0]);
    const bulb=mat('#fff3ce');bulb.emissive=new THREE.Color('#ffe1a3');bulb.emissiveIntensity=.45;
    mesh(g,new THREE.SphereGeometry(w*.15,16,10),bulb,[0,h*.61,0]);
  }else if(o.type==='floor-lamp'){
    box(g,[.3,.035,.3],[0,.025,0],mat('#ab9564',.35,.6),.008);
    rod(g,[0,.04,0],[0,1.58,0],.018,mat('#ab9564',.35,.6));
    const shade=mat('#f4ecd2',.85);shade.emissive=new THREE.Color('#e4d4a1');shade.emissiveIntensity=.18;
    mesh(g,new THREE.CylinderGeometry(.23,.23,.36,32),shade,[0,1.67,0]);
  }else if(o.type==='display-console'&&o.variant==='i-zone-end-console'){
    const assembly=new THREE.Group();assembly.scale.fromArray(receptionSizes[o.type].map((v,i)=>v/o.size[i]));g.add(assembly);
    const [width,height,depth]=o.size,top=height*.55,stone=mat(o.color,.32),brass=mat('#ab9564',.3,.65);
    box(assembly,[width,.055,depth],[0,top,0],stone,.008);
    box(assembly,[width,.05,depth],[0,.025,0],stone,.008);
    for(const x of [-width/2+.025,width/2-.025])for(const z of [-depth/2+.025,depth/2-.025])box(assembly,[.025,top,.025],[x,top/2,z],charcoal,.003);
    for(const [x,r,color] of [[-width*.29,.26,brass],[width*.3,.32,metal]]){
      box(assembly,[.3,.04,.2],[x,top+.05,0],charcoal,.004);
      const ring=mesh(assembly,new THREE.TorusGeometry(r,.018,8,48),color,[x,top+r+.07,0]);
      if(x<0){const second=mesh(assembly,new THREE.TorusGeometry(r*.75,.012,8,48),color,[x+.15,top+r+.09,0]);second.rotation.y=.35;}
    }
    mesh(assembly,new THREE.CylinderGeometry(.04,.1,.3,24),mat('#eeece4'),[0,top+.18,0]);
  }else if(o.type==='display-console'&&o.variant==='ring-pedestal'){
    const brass=mat('#ab9564',.35,.6);
    box(g,[w,.065,d],[0,h-.0325,0],body,.008);
    box(g,[w*.48,h-.09,d*.72],[0,(h-.09)/2,0],body,.012);
    box(g,[w*.62,.04,d*.86],[0,.02,0],body,.005);
    box(g,[w*.19,.035,d*.42],[0,h+.0175,0],charcoal,.004);
    for(const sign of [-1,1]){
      const ring=mesh(g,new THREE.TorusGeometry(h*.3,h*.012,10,48),brass,[sign*w*.045,h*1.32,0]);
      ring.scale.x=(o.size[1]/h)/(o.size[0]/w);
      ring.rotation.y=sign*.28;
    }
  }else if(o.type==='display-console'){
    const brass=mat('#ab9564',.35,.6),stone=mat(o.color,.28);
    box(g,[w,.045,d],[0,h-.022,0],stone,.008);
    for(const x of [-w/2+.045,w/2-.045])for(const z of [-d/2+.035,d/2-.035])box(g,[.025,h-.045,.025],[x,(h-.045)/2,z],brass,.004);
    for(const z of [-d/2+.035,d/2-.035])box(g,[w,.025,.025],[0,.12,z],brass,.004);
    for(const x of [-w*.28,w*.28]){
      mesh(g,new THREE.CylinderGeometry(.07,.12,.27,16),mat('#415466',.35),[x,h+.135,0]);
      mesh(g,new THREE.CylinderGeometry(.035,.07,.2,16),mat('#415466',.35),[x,h+.37,0]);
    }
    box(g,[.28,.04,.16],[0,h+.02,0],charcoal,.004);
    mesh(g,new THREE.TorusGeometry(.2,.025,10,36),mat('#a5a9a2',.35,.55),[0,h+.24,0]);
  }else if(o.type==='counter'&&o.variant==='unused-glass-counter') {
    box(g,[w,h*.62,d],[0,h*.31,0],body,.008);
    box(g,[w,h*.035,d],[0,h*.64,0],charcoal,.005);
    const glass=new THREE.MeshStandardMaterial({color:'#9eafad',transparent:true,opacity:.24,roughness:.15,depthWrite:false,side:THREE.DoubleSide});
    for(const x of [-w*.48,w*.48])box(g,[w*.015,h*.35,d*.92],[x,h*.825,0],glass,.002);
    box(g,[w,h*.35,d*.015],[0,h*.825,-d*.46],glass,.002);
    for(const x of [-w*.47,w*.47])box(g,[w*.015,h*.36,d*.025],[x,h*.825,-d*.46],metal,.002);
  }else if(o.type==='counter') {
    // Open staff side, lower worktop, stone fascia and recessed teal panels.
    box(g,[w,.95,.14],[0,.54,d/2-.07],body,.012);
    box(g,[w,.09,.32],[0,h-.045,d/2-.16],body,.012);
    for(const x of [-w/2+.055,w/2-.055]) box(g,[.11,h,d],[x,h/2,0],body,.012);
    box(g,[w-.23,.055,d-.15],[0,.75,-.075],wood,.01);
    box(g,[w-.3,.38,.018],[0,.27,d/2+.006],mat('#137580',.4),.005);
    box(g,[w-.24,.07,.12],[0,.035,d/2-.05],charcoal,.005);
    const slots=o.workstations===0?[]:o.workstations===3?[-w*.32,0,w*.32]:o.workstations===1?[0]:[-w*.24,w*.24];
    for(const x of slots) {
      box(g,[.33,.04,.14],[x,.795,-.24],charcoal,.005);
      for(let k=0;k<8;k++) box(g,[.025,.005,.1],[x-.13+k*.037,.818,-.24],mat('#586467'),.001);
    }
  } else if(o.type==='office-chair') {
    mesh(g,new THREE.CylinderGeometry(.035,.05,.4,12),metal,[0,.25,0]);
    // Join the gas lift to the seat pan, and the rear bracket to the backrest.
    // These overlaps keep the assembly connected when the whole chair is scaled.
    box(g,[.24,.055,.3],[0,.423,-.025],charcoal,.012);
    box(g,[.09,.27,.065],[0,.53,-.24],charcoal,.012);
    for(let i=0;i<5;i++) {
      const a=i*Math.PI*2/5,x=Math.cos(a)*.29,z=Math.sin(a)*.29;
      rod(g,[0,.15,0],[x,.08,z],.022,metal);
      mesh(g,new THREE.SphereGeometry(.04,10,8),charcoal,[x,.045,z]);
    }
    box(g,[.49,.095,.48],[0,.47,.015],body,.04);
    box(g,[.47,.48,.075],[0,.8,-.235],body,.035);
    box(g,[.055,.14,.035],[0,1.045,-.235],charcoal,.006);
    box(g,[.29,.17,.09],[0,1.12,-.22],body,.04);
    // Mesh-back detail, represented as recessed strips without image textures.
    for(let i=0;i<7;i++) box(g,[.36,.012,.006],[0,.65+i*.047,-.194],mat('#434c4c'),.001);
    for(const x of [-.285,.285]) {
      rod(g,[x*.7,.45,0],[x,.49,0],.02,charcoal);
      box(g,[.03,.2,.03],[x,.54,0],charcoal,.005);
      box(g,[.075,.05,.28],[x,.66,0],body,.02);
    }
  } else if(o.type==='cabinet'&&o.variant==='pole-mounted-gate-reader') {
    const lift=h*4/6.5,headHeight=h*2.5/6.5;
    box(g,[w*.8,h*.03,d*.8],[0,h*.015,0],metal,.008);
    box(g,[w*.2,lift,d*.2],[0,lift/2,0],metal,.006);
    box(g,[w*.9,headHeight,d*.75],[0,lift+headHeight/2,0],body,.015);
    box(g,[w*.65,headHeight*.63,d*.025],[0,lift+headHeight*.58,d*.39],mat('#263c48',.25),.003);
    box(g,[w*.65,headHeight*.09,d*.03],[0,lift+headHeight*.14,d*.39],mat('#4d987b'),.003);
  } else if(o.type==='cabinet'&&o.variant==='gate-mounted-reader') {
    box(g,[w*.8,h*.08,d*.8],[0,h*.04,0],metal,.008);
    box(g,[w*.3,h*.2,d*.3],[0,h*.16,0],metal,.006);
    box(g,[w*.9,h*.76,d*.75],[0,h*.62,0],body,.015);
    box(g,[w*.65,h*.48,d*.025],[0,h*.68,d*.39],mat('#263c48',.25),.003);
    box(g,[w*.65,h*.07,d*.03],[0,h*.34,d*.39],mat('#4d987b'),.003);
  } else if(o.type==='cabinet'&&o.variant==='access-reader') {
    box(g,[w*.6,h*.06,d*.8],[0,h*.03,0],metal,.008);
    box(g,[w*.15,h*.72,d*.18],[0,h*.4,0],metal,.008);
    box(g,[w*.65,h*.25,d*.55],[0,h*.86,0],body,.02);
    box(g,[w*.36,h*.14,d*.025],[0,h*.88,d*.29],mat('#263c48',.25),.003);
    box(g,[w*.4,h*.04,d*.03],[0,h*.7,d*.29],mat('#4d987b'),.003);
  } else if(o.type==='cabinet'&&o.variant==='plain-planter') {
    box(g,[w,h,d],[0,h/2,0],body,.008);
    box(g,[w*.88,h*.03,d*.8],[0,h,0],mat('#3f3529'),.004);
  } else if(o.type==='cabinet'&&o.variant==='drawer-pedestal') {
    box(g,[w,h,d],[0,h/2,0],body,.008);
    for(let i=0;i<3;i++){
      box(g,[w*.9,h*.28,.012],[0,h*(.17+i*.32),d/2+.008],wood,.003);
      box(g,[w*.24,h*.035,.025],[0,h*(.22+i*.32),d/2+.022],metal,.003);
    }
  } else if(o.type==='cabinet'&&o.variant==='checkin-kiosk') {
    // Cabinet reference dimensions keep kiosk units independently editable.
    const alloy=mat(o.color,.32,.6),face=mat('#e3e7e1',.4);
    box(g,[w,.04,d],[0,.02,0],charcoal,.008);
    box(g,[w*.96,h-.04,d*.85],[0,h/2+.02,-d*.04],alloy,.02);
    box(g,[w*.85,h*.43,.018],[0,h*.55,d*.4],face,.004);
    box(g,[w*.82,h*.25,.035],[0,h*.85,d*.4],charcoal,.01);
    box(g,[w*.7,h*.18,.012],[0,h*.85,d*.45],mat('#76a7bd',.25),.003);
    box(g,[w*.6,.014,.02],[0,h*.29,d*.43],charcoal,.002);
    box(g,[w*.45,.014,.025],[0,h*.23,d*.43],alloy,.002);
  } else if(o.type==='cabinet') {
    box(g,[w,h,d],[0,h/2,0],body,.008);
    box(g,[w+.02,.04,d+.025],[0,h,0],wood,.008);
    for(let i=1;i<4;i++) box(g,[.008,h-.06,.006],[-w/2+i*w/4,h/2,d/2+.004],mat('#64513d'),.001);
  } else if(o.type==='display'&&o.variant==='desk-reader') {
    box(g,[w*.8,h*.045,d*.8],[0,h*.022,0],charcoal,.008);
    box(g,[w*.14,h*.55,d*.18],[0,h*.3,0],charcoal,.006);
    const head=box(g,[w*.7,h*.5,d*.4],[0,h*.73,0],charcoal,.015);head.rotation.x=-.15;
    box(g,[w*.48,h*.3,d*.025],[0,h*.75,d*.23],body,.003);
  } else if(o.type==='display'&&o.variant==='reception-portrait') {
    const index=o.id.match(/portrait-([123])$/)?.[1]||'1';
    const texture=typeof document!=='undefined'?new THREE.TextureLoader().load(`/shared/assets/portraits/reception-${index}.png`):null;
    if(texture){texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;}
    const print=new THREE.MeshBasicMaterial({color:'#ffffff',map:texture});
    if(o.frameStyle==='slim-brass'){
      // Build frame widths in physical units to preserve photo proportions after resizing.
      const frame=new THREE.Group();frame.scale.fromArray(receptionSizes[o.type].map((v,i)=>v/o.size[i]));g.add(frame);
      const [W,H,D]=o.size,border=.014,edge=mat('#a79363',.3,.65);
      box(frame,[W-.018,H-.018,D*.7],[0,H/2,0],charcoal,.003);
      box(frame,[W-border*2,H-border*2,.008],[0,H/2,D/2],mat('#e6e2d7',.85),.002);
      for(const x of [-W/2+border/2,W/2-border/2])box(frame,[border,H,D],[x,H/2,.003],edge,.003);
      for(const y of [border/2,H-border/2])box(frame,[W-border*2,border,D],[0,y,.003],edge,.003);
      const aspect=(index==='2'?640:639)/820,photoWidth=Math.min(W-.07,(H-.07)*aspect),photoHeight=photoWidth/aspect;
      mesh(frame,new THREE.PlaneGeometry(photoWidth,photoHeight),print,[0,H/2,D/2+.006]).name='Matted portrait print';
    }else{
      box(g,[w,h,.035],[0,h/2,0],charcoal,.004);
      for(const side of [-1,1]){
        const face=mesh(g,new THREE.PlaneGeometry(w-.025,h-.025),print,[0,h/2,side*.023]);
        if(side<0)face.rotation.y=Math.PI;
      }
    }
  } else if(o.type==='display'&&o.variant==='framed-art') {
    box(g,[w,h,.035],[0,h/2,0],charcoal,.004);
    for(const side of [-1,1]){
      box(g,[w-.025,h-.025,.008],[0,h/2,side*.023],body,.003);
      for(let i=0;i<4;i++){
        const ring=mesh(g,new THREE.TorusGeometry(1,.012,4,32),mat('#78766d'),[(i-1.5)*w*.12,h*(.38+(i%2)*.22),side*.03]);
        ring.scale.set(w*(.16+i*.015),h*(.25-i*.025),.4);ring.rotation.z=i*.6;
      }
    }
  } else if(o.type==='display') {
    box(g,[w,h-.07,.035],[0,h/2+.035,0],charcoal,.008);
    box(g,[w-.035,h-.105,.008],[0,h/2+.035,.024],body,.003);
    if(o.mount!=='wall') {
      box(g,[.04,.14,.035],[0,.08,0],charcoal,.005);
      box(g,[.24,.015,d],[0,.012,0],charcoal,.005);
    }
  } else if(o.type==='wall-panel'&&o.variant==='standing-flag'&&['saudi','altanfeethi'].includes(o.flagDesign)) {
    const assembly=new THREE.Group();assembly.scale.fromArray(receptionSizes[o.type].map((v,i)=>v/o.size[i]));g.add(assembly);
    const [width,height,depth]=o.size,poleX=-width*.3;
    mesh(assembly,new THREE.CylinderGeometry(width*.23,width*.25,.045,32),metal,[poleX,.0225,0]);
    rod(assembly,[poleX,.04,0],[poleX,height-.06,0],.013,metal);
    mesh(assembly,new THREE.SphereGeometry(.035,16,12),metal,[poleX,height-.035,0]);
    const cloth=new THREE.PlaneGeometry(width*.75,height*.64,24,40);
    const positions=cloth.attributes.position,uv=cloth.attributes.uv;
    for(let i=0;i<positions.count;i++){
      const u=uv.getX(i),v=uv.getY(i);
      positions.setZ(i,Math.sin(u*Math.PI*4+v*.6)*.045*u);
      positions.setY(i,positions.getY(i)-Math.sin(u*Math.PI)*.035*(1-v));
    }
    cloth.computeVertexNormals();
    const texture=typeof document!=='undefined'?new THREE.TextureLoader().load(`/shared/assets/flags/${o.flagDesign}.svg`):null;
    if(texture){texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;}
    const fabric=new THREE.MeshStandardMaterial({color:'#ffffff',map:texture,roughness:.9,side:THREE.FrontSide});
    const front=mesh(assembly,cloth,fabric,[width*.075,height*.61,.003]);front.name='Flag cloth · front';
    const backCloth=cloth.clone(),backUV=backCloth.attributes.uv;
    // Both printed faces remain readable, including the Saudi inscription.
    for(let i=0;i<backUV.count;i++)backUV.setX(i,1-backUV.getX(i));
    const reverse=fabric.clone();reverse.side=THREE.BackSide;
    const back=mesh(assembly,backCloth,reverse,[width*.075,height*.61,-.003]);back.name='Flag cloth · reverse';
  } else if(o.type==='wall-panel'&&o.variant==='standing-flag') {
    box(g,[w*.7,h*.018,d*.85],[0,h*.009,0],metal,.012);
    box(g,[w*.025,h*.98,d*.06],[-w*.35,h*.5,0],metal,.003);
    box(g,[w*.8,h*.64,d*.025],[w*.05,h*.64,0],body,.008);
    box(g,[w*.48,h*.012,d*.03],[w*.02,h*.57,d*.02],mat(o.color==='#f1eee5'?'#9b6a65':'#d8decc'),.002);
  } else if(o.type==='wall-panel'&&o.variant==='timber-office-door') {
    box(g,[w,h,d],[0,h/2,0],mat(o.color,.48),.004);
    const frame=mat('#41352f'),brass=mat('#ab9564',.35,.6);
    for(const x of [-w/2+w*.018,w/2-w*.018])box(g,[w*.036,h,d*1.12],[x,h/2,0],frame,.002);
    box(g,[w,h*.018,d*1.12],[0,h*.991,0],frame,.002);
    for(const side of [-1,1]){
      for(let row=1;row<30;row++)box(g,[w*.91,h*.0015,d*.018],[0,h*row/30,side*d*.51],mat(row%3?'#624b3e':'#7b6250'),.001);
      box(g,[w*.22,h*.12,d*.05],[0,h*.8,side*d*.55],brass,.002);
      box(g,[w*.025,h*.07,d*.16],[-w*.34,h*.43,side*d*.58],brass,.002);
    }
  } else if(o.type==='wall-panel'&&o.variant==='teal-service-door') {
    box(g,[w,h,d],[0,h/2,0],mat(o.color,.15,.22),.004);
    const edge=mat('#244d56',.3,.3),brass=mat('#b49b61',.3,.7);
    for(const x of [-w/2,w/2])box(g,[w*.012,h,d*.12],[x,h/2,d*.55],edge,.001);
    box(g,[w,h*.006,d*.12],[0,h,d*.55],edge,.001);
    for(const y of [h*.035,h*.96])mesh(g,new THREE.SphereGeometry(.025,12,8),brass,[w*.4,y,d*.6]);
  } else if(o.type==='wall-panel'&&o.variant==='teal-reception-backdrop') {
    const glass=mat(o.color,.14,.22),brass=mat('#b49b61',.28,.7);
    box(g,[w,h,d],[0,h/2,0],glass,.005);
    for(let i=0;i<6;i++){
      const x=-w/2+i*w/5;
      box(g,[w*.0015,h,d*.08],[x,h/2,d*.55],mat('#315a5f'),.001);
      for(const y of [h*.035,h*.97])mesh(g,new THREE.SphereGeometry(.025,10,8),brass,[x,y,d*.65]);
    }
    // Subtle etched leaf lines; no reflected furniture or photographic shadows.
    const points=[];
    for(const center of [-w*.36,w*.36])for(let row=0;row<7;row++)for(const sign of [-1,1]){
      const y=h*(.12+row*.105);points.push(new THREE.Vector3(center,y,d*.55),new THREE.Vector3(center+sign*w*.12,y+h*.1,d*.55));
    }
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#6c9495',transparent:true,opacity:.35})));
    if(typeof document!=='undefined'){
      const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=512;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#f0eee4';ctx.textAlign='center';
      ctx.font='86px sans-serif';ctx.fillText('التنفيذي',768,225);
      ctx.font='bold 68px sans-serif';ctx.fillText('ALTANFEETHI',768,335);
      ctx.strokeStyle='#ba836d';ctx.lineWidth=15;ctx.beginPath();
      for(const sign of [-1,1]){ctx.moveTo(768,130);ctx.bezierCurveTo(768,60,768+sign*65,25,768+sign*120,25);}ctx.stroke();
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      mesh(g,new THREE.PlaneGeometry(w*.63,h*.38),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}),[0,h*.62,d*.6]);
    }
  } else if(o.type==='wall-panel'&&o.variant==='stone-relief') {
    box(g,[w,h,d],[0,h/2,0],body,.004);
    for(let row=0;row<12;row++)for(let col=0;col<3;col++){
      box(g,[w*.3,h*.07,d*.22],[-w*.33+col*w*.33,h*(row+.5)/12,d*.57],mat(row%2?'#c4b69a':'#cfc3a9'),.002);
    }
  } else if(o.type==='wall-panel'&&o.variant==='air-curtain') {
    box(g,[w,h,d],[0,h/2,0],body,.008);
    for(let i=0;i<32;i++)box(g,[w/60,h*.65,.006],[-w*.46+i*w*.92/31,h*.5,d/2+.004],charcoal,.001);
  } else if(o.type==='wall-panel'&&o.variant==='pleated-curtain') {
    const points=[],indices=[],columns=40;
    for(let row=0;row<2;row++)for(let i=0;i<=columns;i++)points.push(-w/2+w*i/columns,row*h,Math.sin(i/columns*Math.PI*12)*d*.45);
    for(let i=0;i<columns;i++){const a=i,b=i+1,c=i+columns+1,e=c+1;indices.push(a,b,c,b,e,c);}
    const cloth=new THREE.BufferGeometry();cloth.setAttribute('position',new THREE.Float32BufferAttribute(points,3));cloth.setIndex(indices);cloth.computeVertexNormals();
    mesh(g,cloth,new THREE.MeshStandardMaterial({color:o.color,roughness:1,side:THREE.DoubleSide}),[0,0,0]);
  } else if(o.type==='wall-panel'&&o.variant==='plain') {
    box(g,[w,h,d],[0,h/2,0],body,.003);
  } else if(o.type==='wall-panel') {
    box(g,[w,h,d],[0,h/2,0],body,.005);
    const n=Math.ceil(w/.48);
    for(let i=1;i<n;i++) box(g,[.008,h,.006],[-w/2+i*w/n,h/2,d/2+.004],mat('#67513d'),.001);
    box(g,[w,.12,.025],[0,.06,d/2+.016],charcoal,.002);
  } else if(o.type==='luggage-scale') {
    box(g,[w,.09,d],[0,.045,.1],metal,.01);
    box(g,[w*.75,h,.16],[0,h/2,-d/2+.08],body,.02);
    box(g,[.23,.18,.02],[0,h-.27,-d/2+.17],charcoal,.005);
    box(g,[.16,.1,.008],[0,h-.27,-d/2+.184],mat('#8cd5e6',.25),.002);
  }
}
