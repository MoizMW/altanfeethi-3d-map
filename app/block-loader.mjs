import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {validateBlock} from '../shared/schema/block-schema.js';

export function blockKey(value='ground/g9') {
  if(!/^(ground|first)\/[a-z0-9][a-z0-9-]*$/.test(value))throw new Error('Invalid block path');
  return value;
}

export function createBlockLoader(projectRoot) {
  const blocksRoot=resolve(projectRoot,'blocks');
  const pathsFor=key=>{
    const directory=resolve(blocksRoot,key);
    return {
      directory,
      manifest:resolve(directory,'manifest.json'),
      architecture:resolve(directory,'architecture.json'),
      objects:resolve(directory,'objects.json'),
      evidence:resolve(directory,'evidence.json'),
    };
  };

  return async function loadBlock(key) {
    const paths=pathsFor(key);
    const raw=await Promise.all([paths.manifest,paths.architecture,paths.objects,paths.evidence].map(path=>readFile(path,'utf8')));
    const [manifest,architecture,objects,evidence]=raw.map(JSON.parse);
    const block={...manifest,placement:architecture.placement,floorSize:architecture.floorSize,ceilingHeight:architecture.ceilingHeight,architecture,evidence,objects:objects.objects};
    validateBlock(block);
    return {block,revision:createHash('sha256').update(raw.join('\n')).digest('hex'),raw,paths};
  };
}
