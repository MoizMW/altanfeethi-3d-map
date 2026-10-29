export function validateBlock(b) {
  const fail = (reason = 'Check format, IDs, seat mappings and finite dimensions.') => { throw new Error(`Invalid spatial block: ${reason}`); };
  const vector = (v,n) => Array.isArray(v)&&v.length===n&&v.every(x=>Number.isFinite(x)&&Math.abs(x)<1000);
  if(b?.format!=='altanfeethi-spatial-block'||b.version!==1||!/^[-a-z0-9]{3,80}$/.test(b.id)||!['ground','first'].includes(b.floor)||!Array.isArray(b.objects)||b.objects.length>5000||!vector(b.floorSize,2)||b.floorSize.some(x=>x<=0)||!Number.isFinite(b.ceilingHeight)||b.ceilingHeight<=0) fail();
  const ids=new Set(), seats=new Set();
  for(const o of b.objects){
    if(typeof o.id!=='string'||ids.has(o.id)||!['sofa','armchair','table','screen','plant','counter','office-chair','cabinet','display','wall-panel','luggage-scale'].includes(o.type)||typeof o.name!=='string'||!vector(o.position,3)||!vector(o.size,3)||o.size.some(x=>x<0.05||x>100)||!vector(o.scale??[1,1,1],3)||(o.scale??[1,1,1]).some(x=>x<0.05||x>10)||!Number.isFinite(o.yaw)||!/^#[0-9a-f]{6}$/i.test(o.color)||!Array.isArray(o.seats)||!Array.isArray(o.cameras)||o.cameras.some(c=>typeof c!=='string'||c.length>80)) fail();
    if(['armchair','office-chair'].includes(o.type)&&o.seats.length!==1)fail();
    if(o.type==='sofa'&&o.seats.length<1)fail();
    ids.add(o.id); for(const s of o.seats){if(typeof s!=='string'||!/^Seat_[A-Za-z0-9_-]{1,40}$/.test(s))fail('Chair ID must start with Seat_ and use letters, numbers, _ or -.');if(seats.has(s))fail(`Chair ID ${s} already belongs to another seat.`);seats.add(s);}
  }
  return b;
}
