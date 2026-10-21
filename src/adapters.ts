import { interpolate } from './interpolate.js';
export interface AnimationDriver{play():void;pause():void;cancel():void;finished:Promise<void>}
export interface FrameAdapterOptions{duration?:number;delay?:number;onUpdate:(progress:number)=>void;onComplete?:()=>void;reducedMotion?:boolean}
/** Renderer-independent driver usable for Canvas, WebGL uniform, Three and custom UIs. */
export function frameAdapter(options:FrameAdapterOptions):AnimationDriver {
 const duration=options.reducedMotion?0:Math.max(0,options.duration??300);
 const delay=Math.max(0,options.delay??0);
 const raf=globalThis.requestAnimationFrame?.bind(globalThis);
 const caf=globalThis.cancelAnimationFrame?.bind(globalThis);
 let frame=0,start=-1,elapsed=0,running=false,settled=false,resolve!:()=>void;
 const finished=new Promise<void>(r=>resolve=r);
 const complete=()=>{if(settled)return;settled=true;running=false;options.onUpdate(1);options.onComplete?.();resolve()};
 const tick=(time:number)=>{
  frame=0;if(!running)return;
  if(start<0)start=time-elapsed;
  const current=time-start;elapsed=current;if(current<delay){frame=raf?.(tick)??0;return;}
  const progress=duration===0?1:Math.min(1,(current-delay)/duration);
  options.onUpdate(progress);
  if(progress>=1)complete();else frame=raf?.(tick)??0;
 };
 return {finished,play(){if(settled||running)return;running=true;start=-1;
   if(!raf){complete();return;}frame=raf(tick);
 },pause(){if(!running)return;running=false;if(frame&&caf)caf(frame);frame=0;},cancel(){if(frame&&caf)caf(frame);running=false;frame=0;settled=true;resolve();}};
}
export function animateNumber(from:number,to:number,onUpdate:(value:number)=>void,options:Omit<FrameAdapterOptions,'onUpdate'>={}):AnimationDriver{
 const driver=frameAdapter({...options,onUpdate:t=>onUpdate(interpolate(t,[0,1],[from,to]))});driver.play();return driver;
}

/** Animate a numeric field of an ordinary object (Canvas/SVG/WebGL model state). */
export function animateObject<T extends object,K extends keyof T>(model:T,key:K,to:number,options:Omit<FrameAdapterOptions,'onUpdate'>={}):AnimationDriver{
 const from=model[key];if(typeof from!=='number'||!Number.isFinite(from)||!Number.isFinite(to))throw new TypeError('animateObject requires finite numeric values');
 return animateNumber(from,to,next=>{(model as Record<K,number>)[key]=next},options);
}
/** Canvas-friendly frame renderer: animate a progress value, then invoke draw(). */
export function animateCanvas(context:CanvasRenderingContext2D,draw:(ctx:CanvasRenderingContext2D,progress:number)=>void,options:Omit<FrameAdapterOptions,'onUpdate'>={}):AnimationDriver{
 const driver=frameAdapter({...options,onUpdate:progress=>draw(context,progress)});driver.play();return driver;
}
