export function validateBlock(b) {
  const fail = (reason = 'Check format, IDs, seat mappings and finite dimensions.') => { throw new Error(`Invalid spatial block: ${reason}`); };
  const vector = (v,n) => Array.isArray(v)&&v.length===n&&v.every(x=>Number.isFinite(x)&&Math.abs(x)<1000);
  if(b?.format!=='altanfeethi-spatial-block'||b.version!==1||!/^[-a-z0-9]{3,80}$/.test(b.id)||!['ground','first'].includes(b.floor)||!Array.isArray(b.objects)||b.objects.length>5000||!vector(b.floorSize,2)||b.floorSize.some(x=>x<=0)||!Number.isFinite(b.ceilingHeight)||b.ceilingHeight<=0) fail();
  if(b.architecture?.floorCenter&&!vector(b.architecture.floorCenter,2))fail('Invalid floor center.');
  const walls=b.architecture?.walls||[],openings=b.architecture?.openings||[];
  const wallIds=new Set();
  for(const w of walls){if(wallIds.has(w.id)||typeof w.id!=='string'||!['glass','solid'].includes(w.kind)||!vector(w.start,2)||!vector(w.end,2)||Math.hypot(w.end[0]-w.start[0],w.end[1]-w.start[1])<.1||!Number.isFinite(w.height)||w.height<=0||w.height>20||!Number.isFinite(w.thickness)||w.thickness<=0||w.thickness>2)fail('Invalid wall segment.');wallIds.add(w.id);}
  const doorIds=new Set();
  for(const w of walls)if(w.doors!=null){
    if(w.kind!=='glass'||!Array.isArray(w.doors))fail('Glass doors require a glass wall.');
    const length=Math.hypot(w.end[0]-w.start[0],w.end[1]-w.start[1]);
    let previousEnd=-1;
    for(const d of w.doors.slice().sort((a,b)=>a.offset-b.offset)){
      if(typeof d.id!=='string'||!d.id||doorIds.has(d.id)||![d.offset,d.width,d.height].every(Number.isFinite)||d.width<=.1||d.height<=.1||d.height>w.height||d.offset-d.width/2<0||d.offset+d.width/2>length||d.offset-d.width/2<=previousEnd)fail('Invalid or overlapping glass door.');
      if((d.handleHeight!=null&&(!Number.isFinite(d.handleHeight)||d.handleHeight<=0||d.handleHeight>=d.height))||(d.handleLength!=null&&(!Number.isFinite(d.handleLength)||d.handleLength<=0)))fail('Invalid glass door handle.');
      previousEnd=d.offset+d.width/2;doorIds.add(d.id);
    }
  }
  for(const w of walls)if(w.elevation!=null&&(!Number.isFinite(w.elevation)||w.elevation<0||w.elevation+w.height>20))fail('Invalid wall elevation.');
  const openingIds=new Set();for(const o of openings){const w=walls.find(w=>w.id===o.wallId);if(!w||w.kind!=='solid'||openingIds.has(o.id)||typeof o.id!=='string'||o.kind!=='rounded-passage'||![o.offset,o.width,o.springHeight,o.height].every(Number.isFinite)||o.width<=0||o.springHeight<=0||o.height<=o.springHeight||o.height>=w.height||o.offset-o.width/2<0||o.offset+o.width/2>Math.hypot(w.end[0]-w.start[0],w.end[1]-w.start[1]))fail('Invalid opening.');openingIds.add(o.id);}
  for(const w of walls){const list=openings.filter(o=>o.wallId===w.id).sort((a,b)=>a.offset-b.offset);for(let i=1;i<list.length;i++)if(list[i-1].offset+list[i-1].width/2>=list[i].offset-list[i].width/2)fail('Openings overlap.');}
  if(b.architecture?.ceiling){const c=b.architecture.ceiling;if(!vector(c.size,2)||c.size.some(x=>x<=0)||!Number.isFinite(c.height)||c.height<=0||c.height>20||(c.center&&!vector(c.center,2)))fail('Invalid ceiling.');}
  const ids=new Set(), seats=new Set(), tables=new Set();
  for(const o of b.objects){
    if(typeof o.id!=='string'||ids.has(o.id)||!['sofa','armchair','table','screen','plant','counter','office-chair','cabinet','display','wall-panel','luggage-scale','floor-lamp','display-console','privacy-pod','automatic-glass-gate','security-scanner','security-detector','security-console','security-kiosk','security-barrier','passport-booth','passport-gate','passport-totem'].includes(o.type)||typeof o.name!=='string'||!vector(o.position,3)||!vector(o.size,3)||o.size.some(x=>x<0.05||x>100)||!vector(o.scale??[1,1,1],3)||(o.scale??[1,1,1]).some(x=>x<0.05||x>10)||!Number.isFinite(o.yaw)||!/^#[0-9a-f]{6}$/i.test(o.color)||!Array.isArray(o.seats)||!Array.isArray(o.cameras)||o.cameras.some(c=>typeof c!=='string'||c.length>80)) fail();
    if(['armchair','office-chair'].includes(o.type)&&o.seats.length!==1)fail();
    if(o.type==='armchair'&&['#637d79','#3f5c59'].includes(o.color.toLowerCase()))fail('This green lounge-chair finish is retired. Use the shared reference slate-blue (#3d4a55).');
    if(o.type==='sofa'&&o.seats.length<1)fail();
    if(o.type==='table'&&o.externalId!=null&&o.externalId!==''){
      if(typeof o.externalId!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(o.externalId))fail('Table ID must use letters, numbers, _ or - (up to 80 characters).');
      if(tables.has(o.externalId))fail('Table ID already belongs to another table in this block.');
      tables.add(o.externalId);
    }
    if(o.type==='security-kiosk'&&(!Number.isFinite(o.screenScale??1)||(o.screenScale??1)<.5||(o.screenScale??1)>2))fail('Kiosk screen scale must be between 0.5 and 2.');
    if(o.type==='passport-gate'&&(![1,2].includes(o.leafCount??2)||(o.hingeSide!=null&&!['left','right'].includes(o.hingeSide))))fail('Passport gate requires one or two glass leaves and a valid hinge side.');
    if(['automatic-glass-gate','passport-gate'].includes(o.type)&&(!Number.isFinite(o.openFraction??0)||(o.openFraction??0)<0||(o.openFraction??0)>1))fail('Gate opening must be between 0 and 1.');
    ids.add(o.id); for(const s of o.seats){if(typeof s!=='string'||!/^Seat_[A-Za-z0-9_-]{1,40}$/.test(s))fail('Chair ID must start with Seat_ and use letters, numbers, _ or -.');if(seats.has(s))fail(`Chair ID ${s} already belongs to another seat.`);seats.add(s);}
  }
  return b;
}
