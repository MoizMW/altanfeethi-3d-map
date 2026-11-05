import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const hook=fileURLToPath(new URL('../.githooks/pre-push',import.meta.url));
const oid='a'.repeat(40),zero='0'.repeat(40);
const update=(destination,{source='refs/heads/codex/change',deleted=false}={})=>`${source} ${deleted?zero:oid} ${destination} ${oid}\n`;
const run=(input,env={})=>spawnSync('sh',[hook,'origin','example.invalid/repo.git'],{input,encoding:'utf8',env:{...process.env,...env}});

test('Allows feature branches, tags and empty updates',()=>{
  for(const input of ['',update('refs/heads/codex/change'),update('refs/heads/main-fix'),update('refs/tags/main')])assert.equal(run(input).status,0);
});
test('Blocks main regardless of source branch, detached HEAD, deletion or mixed updates',()=>{
  for(const input of [update('refs/heads/main'),update('refs/heads/main',{source:'HEAD'}),update('refs/heads/main',{source:'(delete)',deleted:true}),update('refs/heads/codex/change')+update('refs/heads/main')]){
    const result=run(input);assert.equal(result.status,1);assert.match(result.stderr,/Only repository owner MoizMW/);
  }
});
test('A claimed owner name or environment override never authorizes main',()=>{
  const result=run(update('refs/heads/main'),{USER:'MoizMW',GIT_AUTHOR_NAME:'MoizMW',MOIZMW_MAIN_PUSH_AUTHORIZED:'1',SKIP:'pre-push',HUSKY:'0'});
  assert.equal(result.status,1);
});
