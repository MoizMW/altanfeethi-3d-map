import husky from 'husky';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const cwd=fileURLToPath(new URL('../',import.meta.url));
function git(args){
  const result=spawnSync('git',args,{cwd,encoding:'utf8'});
  if(result.error)throw result.error;
  return result;
}
const existing=git(['config','--get','core.hooksPath']);
if(existing.status!==0&&existing.status!==1)throw Error(existing.stderr||'Could not inspect Git hooks configuration.');
if(existing.stdout.trim()&&!['.githooks','.husky/_'].includes(existing.stdout.trim())){
  throw Error('An existing hooks path is configured. Stop and ask the maintainer to reconcile it; do not replace or disable existing hooks.');
}
process.chdir(cwd);
const error=husky();
if(error)throw Error(error);
const installed=git(['config','--get','core.hooksPath']);
if(installed.status!==0||installed.stdout.trim()!=='.husky/_')throw Error('Husky was not enabled. Do not push until hook installation succeeds.');
console.log('Husky pre-push hook enabled. Direct pushes to main are blocked for everyone by default.');
