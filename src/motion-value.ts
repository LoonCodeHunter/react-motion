import { interpolate, type InterpolateOptions } from './interpolate.js';
export type MotionValueEvent = 'change' | 'animationStart' | 'animationComplete' | 'animationCancel';
export interface MotionValue<T> {
  get():T; set(v:T):void; jump(v:T):void;
  subscribe(fn:()=>void):()=>void;
  on(event:MotionValueEvent, listener:(v:T)=>void):()=>void;
  velocity():number; getVelocity():number;
  destroy():void;
}
export function motionValue<T>(initial:T): MotionValue<T> {
  let value=initial, previous=initial, time=0, speed=0;
  const subscribers=new Set<()=>void>();
  const events=new Map<MotionValueEvent,Set<(v:T)=>void>>();
  const now=()=>globalThis.performance?.now?.()??Date.now();
  function set(next:T) {
    if(Object.is(next,value))return;
    const current=now();
    speed=typeof next==='number'&&typeof value==='number'&&time>0?(next-value)/Math.max(1,current-time)*1000:0;
    previous=value;value=next;time=current;
    subscribers.forEach(fn=>fn());events.get('change')?.forEach(fn=>fn(value));
  }
  return {
    get:()=>value,set,
    jump(next) {speed=0;previous=next;value=next;time=now();subscribers.forEach(fn=>fn());events.get('change')?.forEach(fn=>fn(value));},
    subscribe(fn){subscribers.add(fn);return()=>subscribers.delete(fn)},
    on(event,fn){let set=events.get(event);if(!set){set=new Set();events.set(event,set)}set.add(fn);return()=>set!.delete(fn)},
    velocity:()=>speed,getVelocity:()=>speed,
    destroy(){subscribers.clear();events.clear();},
  };
}
export interface DerivedMotionValue<T> extends MotionValue<T> { stop():void }
export function deriveMotionValue<A,B>(source:MotionValue<A>,mapper:(v:A)=>B):DerivedMotionValue<B> {
  const result=motionValue(mapper(source.get()));
  const unsubscribe=source.subscribe(()=>result.set(mapper(source.get())));
  return {...result,stop:unsubscribe,destroy(){unsubscribe();result.destroy()}};
}
export function mapMotionValue(source:MotionValue<number>,from:readonly number[],to:readonly number[],options:InterpolateOptions={}):DerivedMotionValue<number> {
  return deriveMotionValue(source,v=>interpolate(v,from,to,options));
}
