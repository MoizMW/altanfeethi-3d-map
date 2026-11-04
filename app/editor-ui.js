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
