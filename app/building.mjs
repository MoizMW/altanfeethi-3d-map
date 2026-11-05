import {composeLayout} from './layouts.mjs';

export const transformPoint=([x,z],yaw,[tx,,tz])=>{
  const a=yaw*Math.PI/180;return [Math.cos(a)*x+Math.sin(a)*z+tx,-Math.sin(a)*x+Math.cos(a)*z+tz];
};

// Align the saved floors at the lower escalator landing without scaling furniture.
export async function composeBuilding(root,loadBlock){
  const ground=(await composeLayout(root,'ground/b-g-lounges',loadBlock)).block;
  const first=(await composeLayout(root,'first/center-right',loadBlock)).block;
  const lower=ground.architecture.structures.find(s=>s.id==='g19-visible-escalator-rise');
  const upper=first.architecture.structures.find(s=>s.id==='first-lobby-stair-and-escalator');
  if(!lower||!upper)throw Error('Both stair/escalator anchors are required.');
  const elevation=upper.drop,yaw=-90;
  const foot=transformPoint([upper.endX,upper.escalatorZ],upper.yaw,upper.position);
  const rotated=transformPoint(foot,yaw,[0,0,0]);
  const position=[lower.position[0]-rotated[0],elevation,lower.position[2]-rotated[1]];
  const originalStart=upper.startX;
  // A shared provisional flight fits inside G19. Fill the unused upper void
  // with a landing bridge instead of stretching either floor's furniture.
  const flight={...upper,startX:upper.endX-7.6,stairWidth:lower.stairWidth,escalatorWidth:lower.escalatorWidth,
    stairZ:upper.escalatorZ-lower.stairZ,lowerLandingLength:.5};
  const p=transformPoint([upper.position[0],upper.position[2]],yaw,position);
  const connector={...flight,id:'building-shared-stair-escalator',position:[p[0],elevation,p[1]],yaw:upper.yaw+yaw};
  ground.architecture.structures=ground.architecture.structures.filter(s=>s.id!==lower.id);
  first.architecture.structures=first.architecture.structures.filter(s=>s.id!==upper.id);
  const opening=first.architecture.voids.find(v=>v.id==='stair-escalator-opening');
  const localCenter=[(originalStart+flight.startX)/2,5.5];
  // The opening's cross-span in the authored stair coordinates is 2.4..8.6.
  const center=transformPoint(localCenter,upper.yaw,upper.position);
  first.architecture.floorSections.push({id:'building-upper-landing-bridge',center,size:[flight.startX-originalStart,6.2],yaw:upper.yaw,color:'#424747'});
  return {id:'altanfeethi-building',name:'Altanfeethi terminal',status:'Aligned draft · dimensions provisional',elevation,
    floors:[{id:'ground',label:'Ground floor',layout:'ground/b-g-lounges',position:[0,0,0],yaw:0,block:ground},
      {id:'first',label:'First floor',layout:'first/center-right',position,yaw,block:first}],connector,
    alignment:{groundAnchor:lower.position,firstAnchor:foot,upperOpening:opening?.id,run:7.6,
      notes:'Building-only alignment uses one shared 3.8 m-high flight and G19 lane widths. Run, elevation and bridge are provisional. Original floor files and furniture dimensions are preserved.'}};
}
