// Orbit damping gets frames while it changes the view; a still map does no GPU work.
export function createRenderLoop({update,render,request=requestAnimationFrame,cancel=cancelAnimationFrame,
  clock=()=>performance.now(),defer=setTimeout,clear=clearTimeout,settleMs=160,
  needsAnimation=()=>false,animationMs=1000/15}) {
  let frame=null,timer=null,dirty=true,active=false,lastMotion=-Infinity,disposed=false;
  const schedule=()=>{if(!disposed&&frame===null)frame=request(tick);};
  const invalidate=()=>{dirty=true;schedule();};
  function tick() {
    frame=null;
    const changed=update();
    const now=clock();if(changed)lastMotion=now;
    const moving=active||changed||now-lastMotion<settleMs;
    if(dirty||changed){dirty=false;render({moving,now});}
    if(changed)schedule();
    if(timer!==null){clear(timer);timer=null;}
    if(moving&&!active)timer=defer(()=>{timer=null;invalidate();},Math.max(1,settleMs-(now-lastMotion)));
    else if(!changed&&needsAnimation())timer=defer(()=>{timer=null;invalidate();},animationMs);
  }
  return {
    invalidate,
    setActive(value){active=value;if(value)lastMotion=clock();invalidate();},
    dispose(){disposed=true;if(frame!==null)cancel(frame);if(timer!==null)clear(timer);},
  };
}

export function renderQuality({meshCount,pixelRatio=1,moving=false,viewSpan=Infinity}) {
  const large=meshCount>1500;
  return {
    pixelRatio:Math.min(pixelRatio,2),
    reflections:!moving&&!large&&viewSpan<28,
  };
}
