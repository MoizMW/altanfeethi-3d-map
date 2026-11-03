import * as THREE from 'three';

// Opt-in variants use the existing counter/display-console size contracts.
export function buildDiningObject(g,o,{box,mesh,rod,mat}) {
  const parent=g;g=new THREE.Group();parent.add(g);
  if(o.variant==='food-buffet') {
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
      for(const r of [.11,.075]) {const ring=mesh(g,new THREE.TorusGeometry(r,.008,8,40),gold,[.94,1.19,-.24]);ring.rotation.y=.15;}
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
