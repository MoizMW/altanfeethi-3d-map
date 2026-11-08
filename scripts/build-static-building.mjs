import {cp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {createBlockLoader} from '../app/block-loader.mjs';
import {composeBuilding} from '../app/building.mjs';

const projectRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const distRoot=resolve(projectRoot,'dist');
const appRoot=resolve(projectRoot,'app');
const copy=(source,target)=>cp(source,target,{recursive:true});

await rm(distRoot,{recursive:true,force:true});
await mkdir(resolve(distRoot,'data'),{recursive:true});

const loadBlock=createBlockLoader(projectRoot);
const building=await composeBuilding(projectRoot,loadBlock);
await writeFile(resolve(distRoot,'data','building.json'),JSON.stringify(building));

const sourceHtml=await readFile(resolve(appRoot,'building.html'),'utf8');
const staticHtml=sourceHtml
  .replace('<html lang="en">','<html lang="en" data-building-data="./data/building.json">')
  .replace('<a class="editor-link" href="/?layout=ground/b-g-lounges">Open floor editor ↗</a>','')
  .replace('<a id="source-link">Open source room ↗</a>','<a id="source-link" hidden>Open source room ↗</a>')
  .replaceAll('href="building.html"','href="./"');
await writeFile(resolve(distRoot,'index.html'),staticHtml);

const browserModules=[
  'architecture.js','buffet-objects.js','building-visibility.js','building.js','carpet.js','center-lounge.js',
  'contact-shadows.js','curved-armchair.js','cylindrical-display.js','dining-objects.js','first-floor-reception.js',
  'floor-materials.js','floors.js','human-avatars.js','lobby-fixtures.js','lounge-objects.js','lounge-sofa.js',
  'lounge-tables.js','object-builders.js','passport-objects.js','private-lounge-objects.js','reception-objects.js',
  'room-mirror.js','security-objects.js','static-instances.js','vertical-circulation.js','walk-mode.js',
];
await Promise.all([
  writeFile(resolve(distRoot,'building.css'),await readFile(resolve(appRoot,'building.css'))),
  ...browserModules.map(file=>copy(resolve(appRoot,file),resolve(distRoot,file))),
  copy(resolve(appRoot,'node_modules','three','build'),resolve(distRoot,'node_modules','three','build')),
  copy(resolve(appRoot,'node_modules','three','examples','jsm'),resolve(distRoot,'node_modules','three','examples','jsm')),
  copy(resolve(projectRoot,'shared','materials'),resolve(distRoot,'shared','materials')),
  ...['artwork','branding','flags','portraits'].map(directory=>copy(resolve(projectRoot,'shared','assets',directory),resolve(distRoot,'shared','assets',directory))),
]);

console.log(`Static building map exported to ${distRoot}`);
