// Opt-in developer measurements, exposed on the canvas for repeatable browser checks.
export function createRenderProfile(renderer,enabled=false) {
  if(!enabled)return {begin(){},end(){}};
  renderer.info.autoReset=false;
  const samples=[];let start=0,last=0,frames=0,published=0;
  return {
    begin(){renderer.info.reset();start=performance.now();},
    end(extra={}) {
      const now=performance.now();frames++;
      samples.push({submitMs:now-start,intervalMs:last?start-last:0,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,...extra});
      if(samples.length>90)samples.shift();last=start;
      if(extra.moving!==false&&now-published<250)return;
      published=now;
      renderer.domElement.dataset.renderProfile=JSON.stringify({frames,
        geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,
        ...extra,samples});
    },
  };
}
