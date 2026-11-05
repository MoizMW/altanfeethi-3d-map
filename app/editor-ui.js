export function filterObjects(objects,query=''){
  const terms=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return objects.filter(object=>{
    const text=[object.name,object.id,object.type,object.externalId,object.sourceBlock,...(object.seats||[])].filter(Boolean).join(' ').toLocaleLowerCase();
    return terms.every(term=>text.includes(term));
  });
}

export function sourceObjectLink(object){
  const block=object?.sourceBlock;
  if(!/^(ground|first)\/[a-z0-9][a-z0-9-]*$/.test(block||''))return null;
  return '/?'+new URLSearchParams({block,object:object.id}).toString();
}

// Copy only the reusable design; physical IDs, occupancy IDs and evidence are local.
export function createAssetPlacement(block,asset,configuration,token){
  if(block.readOnly)throw Error('Open the source room to add assets.');
  const object=structuredClone(configuration.preview);
  const suffix=object.variant==='reception-portrait'?`-portrait-${configuration.appearance.portraitIndex||'1'}`:'';
  object.id=`${block.id}-${token}${suffix}`;
  if(block.objects.some(item=>item.id===object.id))throw Error('Asset ID already exists. Try adding again.');
  object.name=asset.name;
  const center=block.architecture?.floorCenter||[0,0];
  const height=object.size[1]*(object.scale?.[1]??1);
  const elevation=object.type==='tv'?Math.max(0,Math.min(1.4,(block.ceilingHeight??4.1)-height-.15)):0;
  object.position=[center[0],elevation,center[1]];object.yaw=0;object.cameras=[];
  const slots=['armchair','office-chair'].includes(object.type)?1:object.type==='sofa'?Math.max(1,configuration.usages[0]?.seats?.length||1):0;
  object.seats=Array.from({length:slots},(_,i)=>`Seat_NEW_${token}_${i+1}`);
  object.confidence='Manually added from shared library; placement and seat IDs pending review.';
  delete object.externalId;delete object.sourceBlock;
  return object;
}

export function removeAsset(block,id){
  if(block.readOnly)throw Error('Open the source room to delete assets.');
  if(!block.objects.some(object=>object.id===id))throw Error('Select an asset to delete.');
  return {...block,objects:block.objects.filter(object=>object.id!==id)};
}
