import {type VariantInput} from './variants.js';
/** Imperative targets without depending on React. Suitable for event-driven UI state. */
export interface AnimationControls {
  get():VariantInput;
  start(target:VariantInput):void;
  set(target:VariantInput):void;
  subscribe(listener:(target:VariantInput,instant:boolean)=>void):()=>void;
  stop():void;
}
export function createAnimationControls(initial?:VariantInput):AnimationControls {
  let current=initial;
  const listeners=new Set<(target:VariantInput,instant:boolean)=>void>();
  const publish=(next:VariantInput,instant:boolean)=>{current=next;for(const fn of [...listeners])fn(next,instant)};
  return {
    get:()=>current,
    start:(next)=>publish(next,false),
    set:(next)=>publish(next,true),
    subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener)},
    stop(){listeners.clear()},
  };
}
export const isAnimationControls=(v:unknown):v is AnimationControls=>
 !!v&&typeof v==='object'&&typeof (v as AnimationControls).subscribe==='function'&&typeof (v as AnimationControls).start==='function'&&typeof (v as AnimationControls).get==='function';
