import {readdir,readFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateBlock} from '../shared/schema/block-schema.js';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const globalBlockIds=new Set(),globalObjectIds=new Set(),globalSeatIds=new Set();
let count=0;

function unique(set,value,label){if(set.has(value))throw new Error(`Duplicate ${label}: ${value}`);set.add(value);}

for(const floor of ['ground','first']){
  const floorPath=resolve(root,'blocks',floor);let entries=[];try{entries=await readdir(floorPath,{withFileTypes:true});}catch{}
  for(const entry of entries){
    if(!entry.isDirectory())continue;
    const directory=resolve(floorPath,entry.name);
    // Branch switches can leave ignored backups without an authored block.
    if((await readdir(directory)).every(name=>name==='backups'))continue;
    const [manifest,architecture,objects,evidence]=await Promise.all(['manifest.json','architecture.json','objects.json','evidence.json'].map(async file=>JSON.parse(await readFile(resolve(directory,file),'utf8'))));
    if(manifest.floor!==floor)throw new Error(`${floor}/${entry.name}: manifest floor does not match its directory`);
    if(manifest.slug!==entry.name)throw new Error(`${floor}/${entry.name}: manifest slug does not match its directory`);
    for(const [file,data] of [['architecture.json',architecture],['objects.json',objects],['evidence.json',evidence]])if(data.blockId!==manifest.id)throw new Error(`${floor}/${entry.name}/${file}: blockId does not match manifest`);
    const block={...manifest,placement:architecture.placement,floorSize:architecture.floorSize,ceilingHeight:architecture.ceilingHeight,architecture,evidence,objects:objects.objects};validateBlock(block);
    unique(globalBlockIds,block.id,'block ID');for(const object of block.objects){unique(globalObjectIds,object.id,'object ID');for(const seat of object.seats)unique(globalSeatIds,seat,'seat ID');}
    await access(resolve(root,block.placement.map));for(const camera of evidence.cameras){if(!evidence.snapshots?.[camera])throw new Error(`${floor}/${entry.name}: missing snapshot reference for ${camera}`);await access(resolve(root,evidence.snapshots[camera]));}
    count++;
  }
}

if(!count)throw new Error('No spatial blocks found');
console.log(`Validated ${count} block(s), ${globalObjectIds.size} objects and ${globalSeatIds.size} seat IDs.`);
