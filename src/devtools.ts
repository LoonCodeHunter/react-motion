/** Opt-in frame sampler and developer HUD for web/Electron/Tauri renderer processes. */
export interface FrameMetric {sampleCount:number;averageFps:number;p95FrameMs:number;slowFrames:number;slowFramePercent:number;}
export interface MotionProfilerOptions {
  frameBudgetMs?:number;maxSamples?:number;
  requestFrame?:(callback:FrameRequestCallback)=>number;
  cancelFrame?:(id:number)=>void;
}
export interface MotionProfiler {start():void;stop():void;reset():void;snapshot():Readonly<FrameMetric>;readonly running:boolean;}
export function createMotionProfiler(options:MotionProfilerOptions={}):MotionProfiler {
  const budget=options.frameBudgetMs??16.67,limit=options.maxSamples??600;
  if(!Number.isFinite(budget)||budget<=0)throw new RangeError('frameBudgetMs must be positive');
  if(!Number.isSafeInteger(limit)||limit<2||limit>100_000)throw new RangeError('maxSamples must be between 2 and 100000');
  const request=options.requestFrame??((fn:FrameRequestCallback)=>globalThis.requestAnimationFrame(fn));
  const cancel=options.cancelFrame??((id:number)=>globalThis.cancelAnimationFrame(id));
  let active=false,id:number|null=null,previous:number|null=null;
  const samples:number[]=[];
  const next=(now:number)=>{
    id=null;
    if(!active)return;
    if(previous!==null){const elapsed=now-previous;
      if(Number.isFinite(elapsed)&&elapsed>0){samples.push(elapsed);if(samples.length>limit)samples.shift();}}
    previous=now;id=request(next);
  };
  return {
    start(){if(active)return;active=true;previous=null;id=request(next);},
    stop(){active=false;if(id!==null){cancel(id);id=null;}previous=null;},
    reset(){samples.length=0;previous=null;},
    snapshot(){const ordered=[...samples].sort((a,b)=>a-b);const total=samples.reduce((a,b)=>a+b,0);
      const slow=samples.filter(value=>value>budget).length;
      return Object.freeze({sampleCount:samples.length,averageFps:total>0?1000*samples.length/total:0,
        p95FrameMs:ordered.length?ordered[Math.ceil(.95*ordered.length)-1]!:0,slowFrames:slow,
        slowFramePercent:samples.length?100*slow/samples.length:0});},
    get running(){return active;},
  };
}
export interface DevtoolsHud {dispose():void;update():void;readonly element:HTMLElement}
/** Read-only status HUD. No telemetry upload, recording of user input or persisted storage. */
export function mountMotionDevtools(profiler:MotionProfiler, target?:HTMLElement):DevtoolsHud {
  if(typeof document==='undefined')throw new Error('Motion Devtools HUD requires a browser DOM');
  const parent=target??document.body;
  if(!parent)throw new Error('No container for motion HUD');
  const element=document.createElement('output');
  element.setAttribute('aria-label','Kovari motion frame diagnostics');
  element.style.cssText='position:fixed;right:12px;bottom:12px;z-index:2147483647;background:#101426;color:#f1f5ff;border:1px solid #50618a;border-radius:10px;padding:10px 13px;font:12px/1.5 ui-monospace,monospace;pointer-events:none;white-space:pre;box-shadow:0 8px 28px #0005';
  parent.appendChild(element);
  let disposed=false;
  const update=()=>{if(disposed)return;const s=profiler.snapshot();element.textContent=`KOVARI / MOTION v1.0.0\nFPS: ${s.averageFps.toFixed(1)}  P95: ${s.p95FrameMs.toFixed(1)}ms\nSlow frames: ${s.slowFrames}/${s.sampleCount} (${s.slowFramePercent.toFixed(1)}%)`;};
  update();return{element,update,dispose(){if(disposed)return;disposed=true;element.remove();}};
}
