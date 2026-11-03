import * as THREE from 'three';

export const passportSizes = {
  'passport-booth': [1.35, 1.7, 2.25],
  'passport-gate': [1.925, 1.1, .24],
  'passport-totem': [.6, 1.9, .24],
};

// Booth front is +Z (traveller side); the officer approaches from the open rear.
export function buildPassportObject(g, o, {box, mesh, rod, mat}) {
  const navy=mat(o.color,.55),brass=mat('#ab9564',.35,.6),dark=mat('#242a2c');
  const metal=mat('#a7afb0',.3,.65);
  const glass=new THREE.MeshStandardMaterial({color:'#a7c3bc',transparent:true,opacity:.2,
    roughness:.18,depthWrite:false,side:THREE.DoubleSide});
  if(o.type==='passport-booth'){
    box(g,[1.35,.07,1.45],[0,.035,-.4],mat('#d0c7af',.5),.006).name='Staff platform';
    box(g,[1.35,.82,.15],[0,.49,1.05],navy,.01);
    box(g,[1.35,.10,.17],[0,.05,1.035],brass,.005);
    box(g,[1.28,.055,.64],[0,.795,.58],dark,.008).name='Officer worktop';
    for(const x of [-.54,.54])box(g,[.045,.76,.045],[x,.38,.52],dark,.005);
    box(g,[.65,.39,.16],[0,1.075,1.0],brass,.006);
    box(g,[.73,.045,.28],[0,1.292,.98],dark,.006);
    // Reader towers and a small biometric-pad placeholder are part of the desk.
    for(const x of [-.55,.55]){
      box(g,[.13,.76,.16],[x,1.25,1.0],brass,.008);
      box(g,[.14,.11,.17],[x,1.635,1.0],dark,.008);
      box(g,[.075,.018,.006],[x,1.635,1.09],mat('#4c5b59'),.002);
    }
    box(g,[.22,.07,.22],[-.32,.94,1.0],mat('#cccfc7'),.012);
    box(g,[.15,.018,.15],[-.32,.984,1.01],mat('#346577'),.005);
    box(g,[.40,.018,.16],[0,.833,.49],mat('#586467'),.004);
    for(let i=0;i<8;i++)box(g,[.026,.006,.11],[-.15+i*.041,.846,.49],dark,.001);
    box(g,[.18,.13,.13],[.02,1.38,1.0],dark,.012);
    box(g,[.05,.05,.025],[.02,1.47,1.0],mat('#eeeade'),.006);
    const poleX=.30;
    rod(g,[poleX,1.32,1.0],[poleX,1.67,1.0],.006,metal);
    mesh(g,new THREE.CylinderGeometry(.045,.045,.012,16),metal,[poleX,1.32,1.0]);
    // Plain green cloth cue only; small flag inscriptions are not fabricated.
    box(g,[.16,.115,.004],[poleX-.075,1.58,1.0],mat('#285b43'),.001);
    const partitions=new THREE.Group();partitions.name='Booth partitions';g.add(partitions);
    for(const [side,enabled] of [[-1,!o.omitLeftPartition],[1,!o.omitRightPartition]]){
      if(!enabled)continue;
      const x=side*.6575;
      box(partitions,[.035,.75,2.25],[x,.445,0],navy,.006);
      box(partitions,[.018,.84,2.16],[x,1.24,0],glass,.002);
      for(const z of [-1.105,1.105])box(partitions,[.035,1.7,.035],[x,.85,z],brass,.004);
      box(partitions,[.035,.035,2.25],[x,1.6825,0],brass,.004);
    }
  }else if(o.type==='passport-gate'){
    // Author the opening at its requested width while preserving post thickness.
    // The outer object applies the normal reference-size transform afterwards.
    const gate=new THREE.Group();gate.scale.x=passportSizes[o.type][0]/o.size[0];g.add(gate);
    const width=o.size[0],clear=width-.20,leafCount=o.leafCount??2,leafWidth=clear/leafCount;
    const hinges=leafCount===1?[o.hingeSide==='left'?-1:1]:[-1,1];
    const gateGlass=glass.clone();if(leafCount===1){gateGlass.opacity=.12;gateGlass.roughness=.12;}
    for(const side of hinges){
      const x=side*(width/2-.085);
      mesh(gate,new THREE.CylinderGeometry(.055,.055,1.1,24),metal,[x,.55,0]).name='Gate hinge post';
      mesh(gate,new THREE.CylinderGeometry(.085,.085,.025,24),metal,[x,.0125,0]);
    }
    for(const side of hinges){
      const leaf=new THREE.Group();leaf.position.set(side*clear/2,0,0);
      leaf.rotation.y=-side*(o.openFraction??0)*Math.PI/2;gate.add(leaf);
      box(leaf,[leafWidth-.012,.91,.016],[-side*leafWidth/2,.57,0],gateGlass,.008).name='Swing gate glass';
      if(leafCount===1){
        box(leaf,[leafWidth-.012,.018,.022],[-side*leafWidth/2,1.025,0],metal,.004).name='Single gate top rail';
        box(gate,[.11,.035,.045],[-side*(width/2-.055),.96,0],brass,.004).name='Counter-side gate latch';
      }
      for(const y of [.19,.94]){
        box(leaf,[.065,.04,.05],[-side*.025,y,0],metal,.005);
      }
    }
  }else if(o.type==='passport-totem'){
    box(g,[.5,.035,.24],[0,.0175,0],dark,.008);
    box(g,[.16,.10,.10],[0,.06,0],dark,.005);
    box(g,[.60,1.82,.095],[0,.99,0],navy,.012);
    box(g,[.52,1.36,.008],[0,1.12,.054],mat('#34515f',.4),.005);
    box(g,[.12,.04,.009],[0,.25,.054],mat('#6b8d7f'),.003);
  }
}
