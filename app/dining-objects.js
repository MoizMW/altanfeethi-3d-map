import * as THREE from 'three';

// Opt-in variants use the existing counter/display-console size contracts.
export function buildDiningObject(g,o,{box,mesh,rod,mat,referenceSize}) {
  const parent=g;g=new THREE.Group();parent.add(g);
  if(['dining-palm','dining-dracaena','dining-topiary'].includes(o.variant)){
    const [w,h,d]=referenceSize[o.type],pot=mat('#eee9dc',.3),soil=mat('#3c3024'),stem=mat('#625443'),leaf=mat(o.color,.62);
    mesh(g,new THREE.CylinderGeometry(w*.35,w*.26,.38,32),pot,[0,.19,0]);
    mesh(g,new THREE.CylinderGeometry(w*.32,w*.32,.015,24),soil,[0,.382,0]);
    if(o.variant==='dining-palm'){
      for(let i=0;i<9;i++){
        const a=i*2.4,top=.98+(i%4)*.16,cx=Math.cos(a)*w*.12,cz=Math.sin(a)*d*.12;
        rod(g,[0,.36,0],[cx,top,cz],.009,stem);
        const tip=[Math.cos(a)*w*.48,top+.05,Math.sin(a)*d*.48];rod(g,[cx,top,cz],tip,.005,leaf);
        for(let j=1;j<=8;j++)for(const side of [-1,1]){
          const t=j/9,x=cx+(tip[0]-cx)*t,z=cz+(tip[2]-cz)*t,y=top+.13*Math.sin(t*Math.PI);
          const blade=mesh(g,new THREE.SphereGeometry(1,8,6),leaf,[x+side*Math.sin(a)*.035,y-.035,z-side*Math.cos(a)*.035]);blade.scale.set(.018,.13*(1-t*.65),.007);blade.rotation.set(.4,a,side*.65);
        }
      }
    }else{
      for(let i=0;i<3;i++){
        const x=(i-1)*w*.16,top=h-.13-i*.20;rod(g,[x,.36,0],[x,top,0],.012,stem);
        for(let j=0;j<9;j++){
          const a=j*2.4,y=top-(o.variant==='dining-topiary'?j%3*.035:j%3*.08),r=w*(o.variant==='dining-topiary'?.17:.29);
          const blade=mesh(g,new THREE.SphereGeometry(1,8,6),leaf,[x+Math.cos(a)*r,y,Math.sin(a)*r]);blade.scale.set(.032,o.variant==='dining-topiary'?.07:.19,.015);blade.rotation.set(.7,a,.55);
        }
      }
    }
  }else if(o.variant==='dining-menu-stand'){
    g.scale.set(3.1/.60,.9/1.15,.4/.42);
    const dark=mat('#303638',.28),paper=mat('#d6d8cd',.7);
    box(g,[.46,.045,.38],[0,.0225,0],dark,.008);
    box(g,[.15,1.0,.13],[0,.54,0],dark,.006);
    const head=new THREE.Group();head.position.y=1.08;head.rotation.x=-.24;g.add(head);
    box(head,[.60,.045,.42],[0,0,0],dark,.006);
    box(head,[.45,.004,.29],[0,.026,0],paper,.002);
    for(let i=0;i<5;i++)box(head,[.31,.003,.009],[0,.030,-.09+i*.04],dark,.001);
  }else if(o.variant==='dining-lantern-stand'){
    g.scale.set(3.1/.24,.9/1.7,.4/.24);
    const brass=mat('#bca16b',.25,.7),stone=mat('#bba986',.65);
    mesh(g,new THREE.CylinderGeometry(.065,.105,.47,24),stone,[0,.235,0]);
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2;rod(g,[Math.cos(a)*.098,.03,Math.sin(a)*.098],[Math.cos(a)*.066,.45,Math.sin(a)*.066],.0025,brass);}
    rod(g,[0,.46,0],[0,1.24,0],.012,brass);
    mesh(g,new THREE.CylinderGeometry(.115,.115,.018,32),brass,[0,1.17,0]);
    const glass=mat('#e9eee2',.1);glass.transparent=true;glass.opacity=.22;glass.depthWrite=false;
    mesh(g,new THREE.CylinderGeometry(.065,.065,.27,24,1,true),glass,[0,1.4,0]);
    for(const y of [1.26,1.55])mesh(g,new THREE.CylinderGeometry(.075,.075,.018,24),brass,[0,y,0]);
    mesh(g,new THREE.CylinderGeometry(.026,.026,.15,16),mat('#fff6dc'),[0,1.34,0]);
    rod(g,[0,1.56,0],[0,1.7,0],.007,brass);
  }else if(o.variant==='dining-botanical-print'){
    g.scale.set(.58/.8,.42/1.5,.18/.07);
    const frame=mat('#282927',.3),paper=mat('#f1eee3'),ink=mat('#264d51'),gold=mat('#ad9867',.32,.5);
    box(g,[.8,1.5,.035],[0,.75,0],frame,.003);
    for(const side of [-1,1]){
      box(g,[.755,1.45,.008],[0,.75,side*.023],paper,.002);
      box(g,[.40,1.05,.005],[0,.75,side*.03],ink,.001);
      for(let row=0;row<5;row++)for(let col=0;col<3;col++){
        const x=-.13+col*.13,y=.35+row*.15;
        const shape=new THREE.Shape();shape.moveTo(x-.055,y);shape.lineTo(x+.055,y);shape.lineTo(x+(row%2?.055:-.055),y+.13);shape.closePath();
        mesh(g,new THREE.ShapeGeometry(shape),mat((row+col)%2?'#82998b':'#d4d7bd'),[0,0,side*.035]).material.side=THREE.DoubleSide;
      }
      for(let i=0;i<7;i++){
        const curve=new THREE.EllipseCurve(0,1.04,.04+i*.018,.19,0,Math.PI*2),points=curve.getPoints(48).map(p=>new THREE.Vector3(p.x,p.y,side*.037));
        const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#ad9867'}));line.raycast=()=>{};g.add(line);
      }
    }
  }else if(o.variant==='food-buffet') {
    const stone=mat('#eeeade',.24),dark=mat('#232a2b',.25),steel=mat('#aeb6b4',.22,.7);
    const light=mat('#fffde8',.45);light.emissive=new THREE.Color('#fff5ce');light.emissiveIntensity=.8;
    // Two open illuminated front niches, stone uprights and continuous worktop.
    box(g,[2.45,.10,.86],[0,.08,0],stone,.008);
    box(g,[2.45,.09,.86],[0,.84,0],stone,.008);
    box(g,[2.45,.11,.89],[0,.94,0],stone,.008);
    box(g,[2.45,.67,.07],[0,.46,-.395],stone,.005);
    for(const x of [-1.17,0,1.17])box(g,[.11,.69,.86],[x,.47,0],stone,.005);
    for(const x of [-.59,.59]) {
      box(g,[1.06,.035,.75],[x,.17,.015],light,.003);
      box(g,[1.06,.52,.015],[x,.47,-.35],light,.002);
      box(g,[1.04,.018,.08],[x,.78,.30],light,.002);
    }
    box(g,[2.38,.12,.10],[0,1.04,-.36],stone,.005);
    // Coffee machine with hopper, spouts, drip tray and cups.
    box(g,[.43,.42,.32],[.57,1.22,-.02],dark,.015);
    box(g,[.29,.25,.017],[.57,1.25,.15],steel,.006);
    box(g,[.30,.025,.22],[.57,1.01,.20],dark,.004);
    for(const x of [.50,.64]) {rod(g,[x,1.14,.20],[x,1.09,.20],.014,steel);mesh(g,new THREE.CylinderGeometry(.035,.025,.065,16),stone,[x,1.04,.20]);}
    box(g,[.28,.12,.24],[.57,1.49,-.02],mat('#3a3029',.3),.015);
    // Gold beverage urn, hot-water tap and serving trays.
    const gold=mat('#b9a05d',.24,.75);
    mesh(g,new THREE.CylinderGeometry(.095,.095,.31,24),gold,[-.82,1.16,-.04]);
    mesh(g,new THREE.SphereGeometry(.095,20,12),gold,[-.82,1.32,-.04]);
    for(const x of [-.90,-.74])rod(g,[x,1.02,-.04],[x,.98,-.04],.013,gold);
    rod(g,[-.82,1.08,.05],[-.82,1.08,.12],.015,gold);
    for(let i=0;i<3;i++) {
      const x=-.43+i*.18;
      box(g,[.14,.025,.24],[x,1.01,.10],steel,.012);
      for(let k=0;k<4;k++)mesh(g,new THREE.CylinderGeometry(.055,.055,.014,20),stone,[x,1.03+k*.015,.10]);
    }
    if(o.serviceStyle==='juice')for(let i=0;i<2;i++) {
      const x=-.37+i*.22;
      mesh(g,new THREE.CylinderGeometry(.065,.065,.30,20),mat(i?'#c6a14a':'#d6ba57',.2),[x,1.17,-.13]);
      mesh(g,new THREE.CylinderGeometry(.07,.07,.025,20),steel,[x,1.33,-.13]);
    }
    else {
      for(const [r,dx] of [[.20,0],[.14,-.07]]) {const ring=mesh(g,new THREE.TorusGeometry(r,.008,8,48),gold,[.91+dx,1.27,-.24]);ring.rotation.y=.15;}
      box(g,[.36,.025,.14],[.88,1.02,-.24],gold,.004);
    }
    if(o.detailLevel==='dining-reviewed'){
      // Stacked crockery and glasses seen through the illuminated buffet niches.
      for(const x of [-.94,-.68,.25,.51,.77])for(let k=0;k<4;k++)mesh(g,new THREE.CylinderGeometry(.065,.065,.012,16),stone,[x,.20+k*.015,.18]);
      for(const x of [-.36,-.18,.10,.92])mesh(g,new THREE.CylinderGeometry(.035,.028,.09,16),stone,[x,.22,.15]);
      for(let i=0;i<5;i++)mesh(g,new THREE.CylinderGeometry(.024,.024,.11,12),steel,[-.48+i*.07,1.055,.26]);
    }
    // Side refrigerator with dark glazed door, lit interior and handle.
    box(g,[.34,.82,.65],[1.41,.45,-.03],dark,.012);
    box(g,[.28,.68,.018],[1.41,.45,.305],mat('#354e56',.17,.35),.003);
    for(let row=0;row<3;row++)for(let col=0;col<3;col++)box(g,[.045,.11,.04],[1.33+col*.08,.25+row*.18,.325],mat(['#937b3b','#8c3941','#7a8e92'][col],.3),.004);
    rod(g,[1.54,.35,.33],[1.54,.65,.33],.009,steel);
    box(g,[.29,.025,.20],[1.41,.88,.02],steel,.006);
    g.scale.x=2.45/2.81;g.position.x=-.18*g.scale.x;
  } else if(o.variant==='grand-piano') {
    const black=mat('#171d1e',.14,.25),ivory=mat('#edece2',.32),gold=mat('#a18c50',.3,.65);
    // Curved closed baby-grand body, normalized to the display-console reference.
    const shape=new THREE.Shape();shape.moveTo(-1.48,.25);shape.lineTo(1.48,.25);shape.lineTo(1.48,-.18);shape.bezierCurveTo(1.35,-.55,.35,-.73,-.55,-.58);shape.bezierCurveTo(-1.25,-.52,-1.48,-.25,-1.48,.25);
    const body=mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.15,bevelEnabled:true,bevelSize:.02,bevelThickness:.01,bevelSegments:2,curveSegments:24}),black,[0,.71,0]);body.rotation.x=Math.PI/2;
    box(g,[2.95,.09,.16],[0,.69,.30],black,.015);
    box(g,[2.68,.04,.21],[0,.72,.40],ivory,.002);
    for(let i=0;i<43;i++) {const x=-1.30+i*.061;box(g,[.004,.006,.21],[x,.746,.40],black,.001);if(![2,6].includes(i%7))box(g,[.032,.035,.12],[x+.024,.757,.35],black,.002);}
    for(const [x,z] of [[-1.25,.18],[1.25,.18],[-.3,-.45]])box(g,[.12,.59,.10],[x,.33,z],black,.012);
    for(const x of [-.13,0,.13])box(g,[.065,.025,.15],[x,.10,.38],gold,.004);
    box(g,[1.05,.10,.40],[0,.43,.95],black,.025);
    for(const x of [-.43,.43])for(const z of [.82,1.08])box(g,[.055,.38,.055],[x,.20,z],black,.006);
    g.scale.z=.4/1.86;g.position.z=-.25*g.scale.z;
  }
}
