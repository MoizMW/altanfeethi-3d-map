import {chmodSync} from 'node:fs';
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
if(existing.stdout.trim()&&existing.stdout.trim()!=='.githooks'){
  throw Error('An existing hooks path is configured. Stop and ask the maintainer to reconcile it; do not replace or disable existing hooks.');
}
chmodSync(new URL('../.githooks/pre-push',import.meta.url),0o755);
const installed=git(['config','--local','core.hooksPath','.githooks']);
if(installed.status!==0)throw Error(installed.stderr||'Could not enable repository hooks.');
console.log('Repository pre-push hook enabled. Direct pushes to main are blocked for everyone by default.');
