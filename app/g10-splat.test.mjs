import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {server} from './server.mjs';

test('G10 exports contain valid independent Gaussian records tied to their evidence',async()=>{
  const root=new URL('../experiments/g10-gaussian/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('manifest.json',root)));
  assert.equal(manifest.fused,false);
  assert.equal(manifest.trainedMultiView3DGS,false);
  assert.deepEqual(manifest.views.map(v=>v.camera).sort(),['B4','B5','B6']);
  for(const view of manifest.views){
    const evidence=await readFile(new URL('../'+view.source,import.meta.url));
    assert.equal(createHash('sha256').update(evidence).digest('hex'),view.sourceSha256);
    const splat=await readFile(new URL(`${view.camera}.splat`,root));
    assert.equal(splat.length,view.splats*32);
    for(let offset=0;offset<splat.length;offset+=32){
      for(let axis=0;axis<3;axis++){
        assert.ok(Number.isFinite(splat.readFloatLE(offset+axis*4)));
        const scale=splat.readFloatLE(offset+12+axis*4);
        assert.ok(Number.isFinite(scale)&&scale>0);
      }
      const norm=Math.hypot(...Array.from({length:4},(_,i)=>(splat[offset+28+i]-128)/128));
      assert.ok(Math.abs(norm-1)<.02);
    }
    const ply=await readFile(new URL(`${view.camera}.ply`,root));
    const end=ply.indexOf('end_header\n')+'end_header\n'.length;
    assert.match(ply.subarray(0,end).toString(),new RegExp(`element vertex ${view.splats}\\n`));
    assert.equal(ply.length-end,view.splats*17*4);
  }
});

test('G10 preview serves only its intended assets and rejects writes',async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    for(const path of ['/g10-photo.html','/g10-photo.js','/experiments/g10-gaussian/joint-report.json','/experiments/g10-gaussian/G10-photo.splat','/experiments/g10-gaussian/G10-photo.ply','/g10-splat.html','/g10-splat.js','/g10-splat.css',
      '/node_modules/@sparkjsdev/spark/dist/spark.module.js',
      '/experiments/g10-gaussian/manifest.json','/experiments/g10-gaussian/B4.splat',
      '/experiments/g10-gaussian/B5.ply','/experiments/g10-gaussian/G10.splat',
      '/experiments/g10-gaussian/G10.ply','/experiments/g10-gaussian/B6-depth.png']){
      const result=await fetch(base+path);assert.equal(result.status,200,path);await result.arrayBuffer();
    }
    for(const path of ['/experiments/g10-gaussian/README.md','/experiments/g10-gaussian/B7.splat',
      '/experiments/g10-gaussian/%2e%2e%2f%2e%2e%2fpackage.json',
      '/node_modules/@sparkjsdev/spark/package.json']){
      const result=await fetch(base+path);assert.equal(result.status,404,path);await result.text();
    }
    assert.equal((await fetch(base+'/experiments/g10-gaussian/B6.splat',{method:'PUT',body:'invalid'})).status,405);
  }finally{await new Promise(resolve=>server.close(resolve));}
});

test('Joint photographic export uses all three evidence images and finite shared geometry',async()=>{
  const root=new URL('../',import.meta.url),out=new URL('experiments/g10-gaussian/',root);
  const report=JSON.parse(await readFile(new URL('joint-report.json',out)));
  assert.equal(report.authoredGeometryUsed,true);
  assert.equal(report.authoredFurnitureMeshesSampled,true);
  assert.equal(report.photometricallyTrained3DGS,true);
  const shapes=await readFile(new URL('blocks/ground/g10/objects.json',root));
  assert.equal(createHash('sha256').update(shapes).digest('hex'),report.shapeSource.objectsSha256);
  assert.equal(report.pointsPerCamera.reduce((a,b)=>a+b,0)+report.unseenSurfaceSplats,report.splats);
  assert.equal(report.coordinateFrame,'g10-local');
  assert.deepEqual(report.cameras,['B6','B4','B5']);
  assert.ok(report.pointsPerCamera.every(n=>n>1000));
  for(const id of report.cameras){
    const source=await readFile(new URL(`evidence/wide capture snapshots/${id}.jpg`,root));
    assert.equal(createHash('sha256').update(source).digest('hex'),report.sourceHashes[id]);
  }
  assert.ok(report.focals.flat().every(v=>Number.isFinite(v)&&v>0));
  const data=await readFile(new URL('G10-photo.splat',out));
  assert.equal(data.length,report.splats*32);
  for(let offset=0;offset<data.length;offset+=32){
    for(let j=0;j<6;j++)assert.ok(Number.isFinite(data.readFloatLE(offset+j*4)));
    for(let j=3;j<6;j++)assert.ok(data.readFloatLE(offset+j*4)>0);
    const q=Array.from({length:4},(_,j)=>(data[offset+28+j]-128)/128);
    assert.ok(Math.abs(Math.hypot(...q)-1)<.02);
  }
  const ply=await readFile(new URL('G10-photo.ply',out));
  assert.equal(ply.length-ply.indexOf('end_header\n')-11,report.splats*68);
});

test('Single G10 block is a volumetric export of the unchanged authored sources',async()=>{
  const root=new URL('../',import.meta.url),out=new URL('experiments/g10-gaussian/',root);
  const {combined}=JSON.parse(await readFile(new URL('manifest.json',out)));
  assert.equal(combined.method,'authored-geometry-surface-sampling');
  assert.equal(combined.photoFused,false);
  const {objects}=JSON.parse(await readFile(new URL('blocks/ground/g10/objects.json',root)));
  assert.deepEqual(combined.sourceObjects,objects.map(o=>o.id));
  for(const source of combined.sourceFiles)assert.equal(createHash('sha256').update(await readFile(new URL(source.path,root))).digest('hex'),source.sha256);
  const splat=await readFile(new URL('G10.splat',out));
  assert.equal(splat.length,combined.splats*32);
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<splat.length;i+=32)for(let j=0;j<3;j++){
    const value=splat.readFloatLE(i+j*4),scale=splat.readFloatLE(i+12+j*4);
    assert.ok(Number.isFinite(value)&&Number.isFinite(scale)&&scale>0);
    min[j]=Math.min(min[j],value);max[j]=Math.max(max[j],value);
  }
  assert.ok(max[0]-min[0]>5&&max[2]-min[2]>4&&max[1]-min[1]>1.5);
  const ply=await readFile(new URL('G10.ply',out));
  const end=ply.indexOf('end_header\n')+11;
  assert.equal(ply.length-end,combined.splats*68);
});
