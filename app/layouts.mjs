import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {validateBlock} from '../shared/schema/block-schema.js';
export async function composeLayout(projectRoot,key,loadBlock){
  if(!/^(ground|first)\/[a-z0-9][a-z0-9-]*$/.test(key))throw Error('Invalid layout path');
  const layout=JSON.parse(await readFile(resolve(projectRoot,'layouts',key+'.json'),'utf8'));
  if(layout.format!=='altanfeethi-floor-layout'||layout.version!==1||!layout.components?.length)throw Error('Invalid layout');
  const floorInlays=[],objects=[],walls=[],openings=[],floorSections=[],rooms=[],circulations=[],groups=new Set(),zones=new Set(),cameras=new Set(layout.evidenceCameras||[]),snapshots={},wideSnapshots={};
  for(const part of layout.components){
    if(!/^(ground|first)\/[a-z0-9][a-z0-9-]*$/.test(part.block)||part.block.split('/')[0]!==layout.floor||!Number.isFinite(part.yaw)||!Array.isArray(part.position)||part.position.length!==3||part.position.some(v=>!Number.isFinite(v)))throw Error('Invalid layout component');
    const {block}=await loadBlock(part.block),a=structuredClone(block.architecture),angle=part.yaw*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
    if(part.architectureOverrides?.floorCenter){const center=part.architectureOverrides.floorCenter;if(!Array.isArray(center)||center.length!==2||center.some(v=>!Number.isFinite(v)))throw Error('Invalid layout floor center');a.floorCenter=center;}
    if(part.architectureOverrides?.floorSections){
      const sections=part.architectureOverrides.floorSections;
      if(!Array.isArray(sections)||sections.some(s=>!s||!Array.isArray(s.center)||s.center.length!==2||s.center.some(v=>!Number.isFinite(v))||!Array.isArray(s.size)||s.size.length!==2||s.size.some(v=>!Number.isFinite(v)||v<=0)||!Number.isFinite(s.yaw??0)))throw Error('Invalid layout floor sections');
      a.floorSections=structuredClone(sections);
    }
    for(const group of block.groups||[])groups.add(group);if(block.zone)zones.add(block.zone);
    for(const wall of a.walls||[]){const endpoints=part.architectureOverrides?.wallEndpoints?.[wall.id];if(endpoints){wall.start=endpoints.start;wall.end=endpoints.end;}const doors=part.architectureOverrides?.wallDoors?.[wall.id];if(doors)wall.doors=doors.map(d=>({...structuredClone(wall.doors?.find(source=>source.id===d.id)||{}),...structuredClone(d)}));}
    for(const room of a.rooms||[]){const footprint=part.architectureOverrides?.roomFootprints?.[room.id];if(footprint)room.footprint=structuredClone(footprint);}
    for(const opening of a.openings||[]){const correction=part.architectureOverrides?.openings?.[opening.id];if(correction)Object.assign(opening,correction);}
    if(part.architectureOverrides?.circulationPolygon)a.circulation={...a.circulation,polygon:part.architectureOverrides.circulationPolygon};
    const point=([x,z])=>[c*x+s*z+part.position[0],-s*x+c*z+part.position[2]];
    for(const source of block.objects){if(part.excludeObjects?.includes(source.id))continue;const o=structuredClone(source),offset=part.objectOffsets?.[o.id]||[0,0,0];if(!Array.isArray(offset)||offset.length!==3||offset.some(v=>!Number.isFinite(v)))throw Error('Invalid layout object offset');const p=point([o.position[0]+offset[0],o.position[2]+offset[2]]);o.position=[p[0],o.position[1]+offset[1]+part.position[1],p[1]];o.yaw+=part.yaw;o.sourceBlock=part.block;objects.push(o);}
    for(const inlay of a.floorInlays||[])floorInlays.push({...inlay,polygon:inlay.polygon.map(point)});
    for(const source of a.walls||[]){if(part.excludeWalls?.includes(source.id))continue;walls.push({...source,start:point(source.start),end:point(source.end)});}
    openings.push(...(a.openings||[]).filter(o=>!part.excludeWalls?.includes(o.wallId)));
    const sections=a.floorSections?.length?a.floorSections:[{center:a.floorCenter||[0,0],size:block.floorSize,color:'#424747'}];
    for(const section of sections)floorSections.push({...section,sourceBlock:part.block,center:point((sections.length===1?part.architectureOverrides?.floorCenter:null)||section.center||a.floorCenter||[0,0]),size:sections.length===1?(part.architectureOverrides?.floorSize||section.size):section.size,yaw:(section.yaw||0)+part.yaw});
    for(const room of a.rooms||[])rooms.push({...room,footprint:room.footprint.map(point),sourceBlock:part.block});
    if(a.circulation?.polygon&&a.circulation.surfaceMaterial!=='same-as-seating')circulations.push({...a.circulation,sourceBlock:part.block,polygon:a.circulation.polygon.map(point)});
    for(const surface of a.circulations||[])circulations.push({...surface,sourceBlock:part.block,polygon:surface.polygon.map(point)});
    for(const id of block.evidence.cameras)cameras.add(id);
    Object.assign(snapshots,block.evidence.snapshots);Object.assign(wideSnapshots,block.evidence.wideSnapshots);
  }
  walls.push(...layout.walls);openings.push(...layout.openings||[]);if(layout.corridor)floorSections.push({...layout.corridor,yaw:0});
  floorSections.push(...layout.floorSections||[]);circulations.push(...layout.circulations||[]);
  objects.push(...structuredClone(layout.objects||[]).map(o=>({...o,sourceBlock:'layout:'+key})));
  Object.assign(snapshots,layout.snapshots);Object.assign(wideSnapshots,layout.wideSnapshots);
  for(const id of cameras)snapshots[id]||=`evidence/camera-snapshots/${id}.jpg`;
  const architecture={floorInlays,floorCenter:layout.floorCenter,floorSections,rooms,circulations,walls,openings,structures:layout.structures||[],voids:layout.voids||[],ceiling:{height:4.1,size:layout.floorSize,center:layout.floorCenter},notes:layout.notes};
  const block={format:'altanfeethi-spatial-block',version:1,id:layout.id,name:layout.name,groups:[...groups],zone:[...zones].join(' / '),floor:layout.floor,status:layout.status,units:'provisional-meters',floorSize:layout.floorSize,ceilingHeight:4.1,placement:{map:`evidence/maps/${layout.floor==='ground'?'ground-floor':'first-floor'}.png`,status:'relative-layout-needs-review'},architecture,objects,evidence:{cameras:[...cameras],snapshots,wideSnapshots,notes:layout.notes},readOnly:true,layoutKey:key};
  if(layout.displayCode)block.displayCode=layout.displayCode;
  validateBlock(block);return {block,revision:null,key};
}
