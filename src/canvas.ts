/** RequestAnimationFrame numerical tween driver for Canvas 2D, WebGL uniforms and arbitrary renderers.
 * Canvas itself owns paint; this module never calls React or touches a DOM node.
 */
import {easeInOut} from './easing.js';
export interface FrameScheduler {
  now(): number;
  request(callback:(timestamp:number)=>void):number;
  cancel(id:number):void;
}
export interface CanvasMotionOptions {
  duration?:number;delay?:number;easing?:(progress:number)=>number;reducedMotion?:boolean;
  scheduler?:FrameScheduler; autoplay?:boolean;
}
export type CanvasMotionResult = 'finished'|'cancelled';
export interface CanvasMotion<T extends Record<string,number>> {
  play():void; pause():void; reverse():void; seek(progress:number):void; cancel():void;
  readonly progress:number;readonly state:'idle'|'running'|'paused'|'finished'|'cancelled';
  readonly finished:Promise<CanvasMotionResult>;
}
const browserScheduler:FrameScheduler={
  now:()=>globalThis.performance?.now?.()??Date.now(),
  request:cb=>globalThis.requestAnimationFrame(cb),
  cancel:id=>globalThis.cancelAnimationFrame(id),
};
function finiteNumber(value:unknown, label:string):asserts value is number {
  if(typeof value!=='number'||!Number.isFinite(value))throw new RangeError(`${label} must be a finite number`);
}
/** Paint with `draw(values)` in your own canvas context. No implicit canvas clearing. */
export function tweenCanvas<T extends Record<string,number>>(from:T,to:T,draw:(values:T)=>void,options:CanvasMotionOptions={}):CanvasMotion<T> {
  const duration=options.duration??360,delay=options.delay??0,easing=options.easing??easeInOut,scheduler=options.scheduler??browserScheduler;
  finiteNumber(duration,'duration');finiteNumber(delay,'delay');
  if(duration<0||delay<0)throw new RangeError('duration and delay must not be negative');
  if(typeof draw!=='function'||typeof easing!=='function')throw new TypeError('draw and easing must be functions');
  if(!scheduler||typeof scheduler.now!=='function'||typeof scheduler.request!=='function'||typeof scheduler.cancel!=='function') throw new TypeError('An animation frame scheduler is required');
  const keys=Object.keys(to) as (keyof T)[];
  if(keys.some(key=>!(key in from)))throw new TypeError('Both states must define the same properties');
  for(const key of keys){finiteNumber(from[key],String(key));finiteNumber(to[key],String(key));}
  let progress=0,direction=1,frame:number|null=null,origin=0,state:CanvasMotion<T>['state']='idle';
  let resolveFinished!:(value:CanvasMotionResult)=>void;
  const finished=new Promise<CanvasMotionResult>(resolve=>{resolveFinished=resolve;});
  const settle=(result:CanvasMotionResult)=>{if(state==='finished'||state==='cancelled')return;state=result;resolveFinished(result);};
  const render=(p:number)=>{
    progress=Math.min(1,Math.max(0,p));
    const eased=easing(progress);
    finiteNumber(eased,'easing result');
    const values={} as T;
    for(const key of keys) values[key]=(from[key]+(to[key]-from[key])*eased) as T[keyof T];
    draw(values);
  };
  const stopFrame=()=>{if(frame!==null){scheduler.cancel(frame);frame=null;}};
  const tick=(timestamp:number)=>{
    frame=null;
    if(state!=='running')return;
    const t=Math.max(0,timestamp-origin);
    const p=duration===0?1:Math.min(1,t/duration);
    render(direction===1?p:1-p);
    if(p>=1){settle('finished');return;}
    frame=scheduler.request(tick);
  };
  const play=()=>{
    if(state==='finished'||state==='cancelled'||state==='running')return;
    if(options.reducedMotion){render(direction===1?1:0);settle('finished');return;}
    origin=scheduler.now()+(state==='idle'?delay:0)-(direction===1?progress:1-progress)*duration;
    state='running';frame=scheduler.request(tick);
  };
  const controller:CanvasMotion<T>={
    play,
    pause(){if(state==='running'){stopFrame();state='paused';}},
    reverse(){if(state==='finished'||state==='cancelled')return;const running=state==='running';stopFrame();direction*=-1;
      if(running){state='paused';play();}},
    seek(p:number){finiteNumber(p,'progress');if(p<0||p>1)throw new RangeError('progress must be in [0, 1]');render(p);
      if(state==='running'){stopFrame();state='paused';play();}},
    cancel(){stopFrame();settle('cancelled');},
    get progress(){return progress;},get state(){return state;},finished,
  };
  render(0);
  if(options.autoplay!==false)play();
  return controller;
}
