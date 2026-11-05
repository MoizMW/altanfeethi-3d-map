import * as THREE from 'three';
import {receptionBrand} from './reception-objects.js';

export const securitySizes = {
  'security-scanner': [1.15, 1.5, 4.6],
  'security-detector': [1.05, 2.3, .45],
  'security-console': [1.1, 1.65, .5],
  'security-kiosk': [.62, 1.5, .5],
  'security-barrier': [4.4, 1.15, .28],
};

// Dimensions are visual estimates; +Z follows the conveyor and pedestrian lanes.
export function buildSecurityObject(g, o, {box, mesh, rod, mat}) {
  const blue = mat(o.color, .45), metal = mat('#a7afb0', .3, .65);
  const dark = mat('#242a2c', .65), trim = mat('#d1d5d3', .4, .4);
  if (o.type === 'security-scanner') {
    // Build around the tunnel rather than filling it with a solid cuboid.
    box(g, [1.15, .7, 1.4], [0, .38, 0], blue, .035);
    for (const x of [-.49, .49]) box(g, [.17, .66, 1.4], [x, 1.05, 0], blue, .025);
    box(g, [1.15, .15, 1.4], [0, 1.425, 0], blue, .035);
    box(g, [.89, .055, 1.45], [0, .745, 0], dark, .005);
    for (const sign of [-1, 1]) {
      const z = sign*.72;
      for (const x of [-.49, .49]) box(g, [.17, .66, .055], [x, 1.05, z], trim, .012);
      box(g, [1.15, .15, .055], [0, 1.425, z], trim, .012);
      for (let i=0; i<10; i++) box(g, [.074, .55, .018], [-.37+i*.082, 1.065, z], dark, .004);
      // Rollers continue at belt height with rails and four supports per end.
      for (let i=0; i<25; i++) {
        const roller = mesh(g, new THREE.CylinderGeometry(.026, .026, .91, 12), metal,
          [0, .75, sign*(.79+i*.061)]);
        roller.rotation.z = Math.PI/2;
      }
      for (const x of [-.5, .5]) {
        box(g, [.06, .10, 1.6], [x, .70, sign*1.5], metal, .007);
        for (const dz of [1.05, 2.18]) box(g, [.055, .67, .055], [x, .335, sign*dz], metal, .005);
      }
      const stop = mesh(g, new THREE.CylinderGeometry(.038, .038, .035, 16), mat('#d9b22c'), [.44, 1.36, z+sign*.04]);
      stop.rotation.x=Math.PI/2;
      const button = mesh(g, new THREE.CylinderGeometry(.021, .021, .04, 16), mat('#bc3e32'), [.44, 1.36, z+sign*.065]);
      button.rotation.x=Math.PI/2;
    }
  } else if (o.type === 'security-detector') {
    for (const x of [-.46, .46]) {
      box(g, [.13, 2.3, .4], [x, 1.15, 0], blue, .02);
      box(g, [.13, .035, .45], [x, .0175, 0], metal, .008);
      box(g, [.022, 1.65, .016], [x, 1.15, .208], dark, .003);
    }
    box(g, [1.05, .18, .4], [0, 2.21, 0], blue, .02);
    box(g, [.4, .09, .015], [0, 2.21, .208], trim, .005);
    box(g, [.14, .045, .008], [0, 2.21, .22], mat('#344c51'), .002);
    if (o.beltClosed) box(g, [.79, .035, .015], [0, .95, .2], dark, .002);
  } else if (o.type === 'security-console') {
    box(g, [.5, .045, .5], [0, .0225, 0], metal, .008);
    // Mounting hardware sits behind the screen backs; +Z faces the operator.
    box(g, [.10, 1.42, .10], [0, .75, -.14], metal, .012).name='Rear monitor post';
    box(g, [1.03, .055, .07], [0, 1.4, -.14], metal, .006).name='Rear monitor crossbar';
    for (const x of [-.275, .275]) {
      box(g, [.07, .07, .115], [x, 1.43, -.08], metal, .006).name='Rear screen bracket';
      const panel=new THREE.Group();panel.position.set(x,1.45,0);panel.rotation.y=-Math.sign(x)*.12;g.add(panel);
      box(panel, [.53, .38, .045], [0, 0, 0], dark, .012);
      box(panel, [.485, .33, .008], [0, 0, .027], mat(o.color, .4), .004).name='Screen face';
      const scaleX=(o.size?.[0]??1.1)/1.1,scaleY=(o.size?.[1]??1.65)/1.65;
      const aspect=400/289.62,logoHeight=Math.min(.33*scaleY*.78,.485*scaleX*.78/aspect);
      mesh(panel,new THREE.PlaneGeometry(logoHeight*aspect/scaleX,logoHeight/scaleY),new THREE.MeshBasicMaterial({map:receptionBrand(),transparent:true,depthWrite:false}),[0,0,.032]).name='Security screen · Altanfeethi bilingual identity';
    }
    box(g, [.62, .035, .27], [0, 1.02, .10], dark, .006);
    box(g, [.42, .018, .15], [-.06, 1.045, .13], mat('#586467'), .004);
  } else if (o.type === 'security-kiosk') {
    box(g, [.5, .04, .46], [0, .02, 0], blue, .02).name='Kiosk base';
    box(g, [.13, 1.15, .14], [0, .61, 0], blue, .02).name='Kiosk stand';
    const head = new THREE.Group(); head.name='Kiosk display';head.position.set(0, 1.35, 0); head.rotation.x=-.24;
    head.scale.set(o.screenScale??1,o.screenScale??1,1);g.add(head);
    box(head, [.62, .30, .055], [0, 0, 0], trim, .015);
    box(head, [.55, .24, .008], [0, 0, .035], mat('#8db4bc', .35), .008);
    box(head, [.23, .035, .009], [0, -.05, .044], mat('#426783'), .003);
  } else if (o.type === 'security-barrier') {
    for (const x of [-2.08, 0, 2.08]) {
      box(g, [.055, 1.15, .07], [x, .575, 0], metal, .005);
      box(g, [.23, .035, .28], [x, .0175, 0], metal, .006);
    }
    for (const x of [-1.04, 1.04]) box(g, [2.02, 1.01, .035], [x, .59, 0], blue, .006);
    for (const y of [.08, 1.11]) box(g, [4.4, .045, .07], [0, y, 0], metal, .005);
  }
}
