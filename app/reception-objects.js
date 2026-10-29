import * as THREE from 'three';

// Local +Z is the visitor side of counters and the facing direction of chairs.
export const receptionSizes = {
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
  if(o.type==='floor-lamp'){
    box(g,[.3,.035,.3],[0,.025,0],mat('#ab9564',.35,.6),.008);
    rod(g,[0,.04,0],[0,1.58,0],.018,mat('#ab9564',.35,.6));
    const shade=mat('#f4ecd2',.85);shade.emissive=new THREE.Color('#e4d4a1');shade.emissiveIntensity=.18;
    mesh(g,new THREE.CylinderGeometry(.23,.23,.36,32),shade,[0,1.67,0]);
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
  }else if(o.type==='counter') {
    // Open staff side, lower worktop, stone fascia and recessed teal panels.
    box(g,[w,.95,.14],[0,.54,d/2-.07],body,.012);
    box(g,[w,.09,.32],[0,h-.045,d/2-.16],body,.012);
    for(const x of [-w/2+.055,w/2-.055]) box(g,[.11,h,d],[x,h/2,0],body,.012);
    box(g,[w-.23,.055,d-.15],[0,.75,-.075],wood,.01);
    box(g,[w-.3,.38,.018],[0,.27,d/2+.006],mat('#137580',.4),.005);
    box(g,[w-.24,.07,.12],[0,.035,d/2-.05],charcoal,.005);
    for(const x of o.workstations===1?[0]:[-w*.24,w*.24]) {
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
  } else if(o.type==='cabinet') {
    box(g,[w,h,d],[0,h/2,0],body,.008);
    box(g,[w+.02,.04,d+.025],[0,h,0],wood,.008);
    for(let i=1;i<4;i++) box(g,[.008,h-.06,.006],[-w/2+i*w/4,h/2,d/2+.004],mat('#64513d'),.001);
  } else if(o.type==='display') {
    box(g,[w,h-.07,.035],[0,h/2+.035,0],charcoal,.008);
    box(g,[w-.035,h-.105,.008],[0,h/2+.035,.024],body,.003);
    if(o.mount!=='wall') {
      box(g,[.04,.14,.035],[0,.08,0],charcoal,.005);
      box(g,[.24,.015,d],[0,.012,0],charcoal,.005);
    }
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
