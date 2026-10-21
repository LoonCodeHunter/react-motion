import type {MotionValue} from './motion-value.js';
/** Minimal seekable contract shared by browser Animations and custom renderers. */
export interface SeekableAnimation {currentTime:number|string|null;pause():void}
export interface ScrollScrubOptions {
  /** A positive duration in milliseconds. */
  duration:number;
  /** Progress interval in which the animation plays. Defaults to [0,1]. */
  range?:readonly [number,number];
  /** Maps a normalized 0–1 input to a progress fraction; must return a finite value. */
  easing?:(progress:number)=>number;
  /** Pause WAAPI automatic playback before binding (default true). */
  pause?:boolean;
}
const clamp=(n:number)=>Math.min(1,Math.max(0,n));
/** Map a numeric scroll/motion signal to WAAPI currentTime without React re-renders. */
export function bindScrollAnimation(source:Pick<MotionValue<number>,'get'|'subscribe'>,
 animation:SeekableAnimation,options:ScrollScrubOptions):{update():void;stop():void}{
  if(!source||typeof source.get!=='function'||typeof source.subscribe!=='function')throw new TypeError('source must be subscribable');
  if(!animation||typeof animation.pause!=='function')throw new TypeError('animation must support pause()');
  if(!Number.isFinite(options?.duration)||options.duration<=0)throw new RangeError('duration must be a positive finite number');
  const range=options.range??[0,1];
  if(range.length!==2||!range.every(Number.isFinite)||range[0]>=range[1])throw new RangeError('range must be an increasing finite pair');
  if(options.easing!==undefined&&typeof options.easing!=='function')throw new TypeError('easing must be a function');
  if(options.pause!==false)animation.pause();
  let stopped=false;
  const update=()=>{
    if(stopped)return;
    const progress=source.get();
    if(!Number.isFinite(progress))return; // Ignore transient invalid external signals.
    const unit=clamp((progress-range[0])/(range[1]-range[0]));
    const mapped=options.easing?options.easing(unit):unit;
    if(!Number.isFinite(mapped))throw new RangeError('easing must return a finite number');
    animation.currentTime=clamp(mapped)*options.duration;
  };
  const unsubscribe=source.subscribe(update);
  try{update()}catch(error){unsubscribe();throw error}
  return {update,stop(){if(stopped)return;stopped=true;unsubscribe()}};
}
