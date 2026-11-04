import {createServer} from 'node:http';
import {readFile,writeFile,rename,mkdir,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,basename} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {validateBlock} from '../shared/schema/block-schema.js';
import {composeLayout} from './layouts.mjs';
import {collectObjectLibrary} from '../scripts/build-object-library.mjs';

const appRoot=fileURLToPath(new URL('./',import.meta.url));
const projectRoot=resolve(appRoot,'..');
const blocksRoot=resolve(projectRoot,'blocks');
const evidenceRoot=resolve(projectRoot,'evidence');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const revision=parts=>createHash('sha256').update(parts.join('\n')).digest('hex');
let saveQueue=Promise.resolve();

function blockKey(value='ground/g9'){
  if(!/^(ground|first)\/[a-z0-9][a-z0-9-]*$/.test(value))throw new Error('Invalid block path');
  return value;
}

function pathsFor(key){const directory=resolve(blocksRoot,key);return {directory,manifest:resolve(directory,'manifest.json'),architecture:resolve(directory,'architecture.json'),objects:resolve(directory,'objects.json'),evidence:resolve(directory,'evidence.json')};}

async function loadBlock(key){
  const paths=pathsFor(key);
  const raw=await Promise.all([paths.manifest,paths.architecture,paths.objects,paths.evidence].map(path=>readFile(path,'utf8')));
  const [manifest,architecture,objects,evidence]=raw.map(JSON.parse);
  const block={...manifest,placement:architecture.placement,floorSize:architecture.floorSize,ceilingHeight:architecture.ceilingHeight,architecture,evidence,objects:objects.objects};
  validateBlock(block);
  return {block,revision:revision(raw),raw,paths};
}

async function listBlocks(){
  const result=[];
  for(const floor of ['ground','first']){
    let entries=[];try{entries=await readdir(resolve(blocksRoot,floor),{withFileTypes:true});}catch{}
    for(const entry of entries)if(entry.isDirectory())try{const manifest=JSON.parse(await readFile(resolve(blocksRoot,floor,entry.name,'manifest.json'),'utf8'));result.push({key:`${floor}/${entry.name}`,id:manifest.id,name:manifest.name,floor,status:manifest.status,owner:manifest.owner});}catch{}
  }
  for(const floor of ['ground','first']){let files=[];try{files=await readdir(resolve(projectRoot,'layouts',floor));}catch{}for(const file of files.filter(f=>f.endsWith('.json'))){const layout=JSON.parse(await readFile(resolve(projectRoot,'layouts',floor,file),'utf8'));result.push({key:`layout:${floor}/${file.slice(0,-5)}`,name:layout.name,floor,status:layout.status});}}
  return result;
}

async function loadScene(url){
  const data=await (url.searchParams.has('layout')?composeLayout(projectRoot,url.searchParams.get('layout'),loadBlock):loadBlock(blockKey(url.searchParams.get('block')||undefined)));
  let files=[];
  try{files=await readdir(resolve(evidenceRoot,'tables_drawing'));}catch(error){if(error.code!=='ENOENT')throw error;}
  const available=new Set(files);
  data.block.evidence.tableDrawings=[...new Set(data.block.objects.filter(o=>o.type==='table').map(o=>o.externalId?.match(/^Table_([A-Za-z]+\d+)$/)?.[1]).filter(id=>id&&available.has(`${id}.png`)))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  return data;
}

function send(res,status,data,type='application/json; charset=utf-8'){res.writeHead(status,{'Content-Type':type,'Cache-Control':type.startsWith('image/')?'public, max-age=60':'no-store'});res.end(typeof data==='string'||Buffer.isBuffer(data)?data:JSON.stringify(data));}

async function requestJson(req){let raw='';for await(const part of req){raw+=part;if(raw.length>2_000_000)throw new Error('Block is too large');}return JSON.parse(raw);}

async function saveObjects(req,res,key){
  const payload=await requestJson(req);validateBlock(payload.block);
  const save=async()=>{
    const current=await loadBlock(key);
    if(payload.revision!==current.revision)return send(res,409,{error:'This block changed on disk. Download your draft, reload, then merge the changes.'});
    for(const field of ['format','version','id','floor'])if(payload.block[field]!==current.block[field])return send(res,400,{error:`The editor cannot change block ${field}.`});
    const cameras=new Set(current.block.evidence.cameras||[]);
    if(payload.block.objects.some(object=>object.cameras.some(camera=>!cameras.has(camera))))return send(res,400,{error:'An object references a camera outside this block evidence file.'});
    await mkdir(resolve(current.paths.directory,'backups'),{recursive:true});
    await writeFile(resolve(current.paths.directory,'backups',`${Date.now()}-${randomUUID()}.json`),JSON.stringify(current.block,null,2)+'\n');
    const next=JSON.stringify({format:'altanfeethi-block-objects',version:1,blockId:current.block.id,objects:payload.block.objects},null,2)+'\n';
    const temp=resolve(current.paths.directory,`.objects-${randomUUID()}.tmp`);await writeFile(temp,next);await rename(temp,current.paths.objects);
    const updated=await loadBlock(key);send(res,200,{revision:updated.revision});
  };
  saveQueue=saveQueue.then(save,save);await saveQueue;
}

export const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/api/object-library'&&req.method==='GET')return send(res,200,await collectObjectLibrary(projectRoot));
    if(url.pathname==='/api/blocks'&&req.method==='GET')return send(res,200,{blocks:await listBlocks()});
    if(url.pathname==='/api/block'){
      const key=blockKey(url.searchParams.get('block')||undefined);
      if(req.method==='GET'){const data=await loadScene(url);return send(res,200,{revision:data.revision,block:data.block,key});}
      if(url.searchParams.has('layout'))return send(res,405,{error:'Edit furniture in its source block; layout placements are stored separately.'});
      if(req.method==='PUT')return saveObjects(req,res,key);
      return send(res,405,{error:'Method not allowed'});
    }
    if(url.pathname.startsWith('/api/evidence/table-drawing/')&&req.method==='GET'){
      const id=url.pathname.slice('/api/evidence/table-drawing/'.length);
      if(!/^[A-Za-z]+\d+$/.test(id))return send(res,404,{error:'Not found'});
      const {block}=await loadScene(url);
      if(!block.evidence.tableDrawings.includes(id))return send(res,404,{error:'No table drawing for this block'});
      return send(res,200,await readFile(resolve(evidenceRoot,'tables_drawing',`${id}.png`)),types['.png']);
    }
    if(url.pathname.startsWith('/api/evidence/camera/')&&req.method==='GET'){
      const key=blockKey(url.searchParams.get('block')||undefined),id=decodeURIComponent(basename(url.pathname));
      if(!/^[A-Za-z0-9_-]{1,80}$/.test(id))return send(res,404,{error:'Not found'});
      const {block}=await loadScene(url);if(!block.evidence.cameras.includes(id))return send(res,404,{error:'Camera is not evidence for this block'});
      if(url.searchParams.get('wide')==='1'){
        const path=block.evidence.wideSnapshots?.[id];if(!path)return send(res,404,{error:'No wide capture for this camera'});
        const target=resolve(projectRoot,path);if(!target.startsWith(evidenceRoot+'/'))return send(res,403,{error:'Evidence path rejected'});
        return send(res,200,await readFile(target),types['.jpg']);
      }
      return send(res,200,await readFile(resolve(evidenceRoot,'camera-snapshots',`${id}.jpg`)),types['.jpg']);
    }
    if(url.pathname==='/api/evidence/map'&&req.method==='GET'){
      const {block}=await loadScene(url);
      const target=resolve(projectRoot,block.placement.map);if(!target.startsWith(resolve(evidenceRoot,'maps')+'/'))return send(res,403,{error:'Map path rejected'});
      return send(res,200,await readFile(target),types[extname(target)]||'application/octet-stream');
    }
    if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
    const relative=decodeURIComponent(url.pathname).slice(1)||'index.html';let target;
    if(['index.html','viewer.js','architecture.js','reception-objects.js','lounge-objects.js','security-objects.js','passport-objects.js','styles.css','editor.css','lounge-tables.js','lobby-fixtures.js','vertical-circulation.js','dining-objects.js','object-builders.js','library.html','library.js','library.css'].includes(relative))target=resolve(appRoot,relative);
    else if(relative==='curved-armchair.js')target=resolve(appRoot,relative);
    else if(relative==='first-floor-reception.js')target=resolve(appRoot,relative);
    else if(relative==='shared/assets/branding/altanfeethi-reception.svg')target=resolve(projectRoot,relative);
    else if(relative==='shared/materials/textures/reception-marble/charcoal-veined.png')target=resolve(projectRoot,relative);
    else if(relative==='shared/materials/textures/lounge-pillow/pillow-reference.png')target=resolve(projectRoot,relative);
    else if(relative==='shared/materials/textures/lounge-pillow/pillow-botanical-clean.png')target=resolve(projectRoot,relative);
    else if(relative==='shared/assets/library/inventory.json')target=resolve(projectRoot,relative);
    else if(relative==='shared/schema/block-schema.js')target=resolve(projectRoot,relative);
    else if(/^shared\/assets\/flags\/(saudi|altanfeethi)\.svg$/.test(relative))target=resolve(projectRoot,relative);
    else if(/^shared\/assets\/portraits\/reception-[123]\.png$/.test(relative))target=resolve(projectRoot,relative);
    else if(/^node_modules\/three\/(build|examples\/jsm)\/[\w/.-]+\.js$/.test(relative)&&!relative.includes('..'))target=resolve(appRoot,relative);
    else return send(res,404,{error:'Not found'});
    send(res,200,await readFile(target),types[extname(target)]||'application/octet-stream');
  }catch(error){send(res,error.code==='ENOENT'?404:400,{error:error.code==='ENOENT'?'Block or asset not found':error.message});}
});

if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(Number(process.argv[2]||4209),'127.0.0.1',()=>console.log(`Altanfeethi block editor: http://127.0.0.1:${server.address().port}/?block=ground/g9`));
