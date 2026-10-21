import { spring } from './spring.js';
import { toStyle } from './transform.js';
import type { AnimationTarget, TransitionOptions } from './variants.js';

/** Generate WAAPI-ready tween/spring keyframes from animation targets. */
export function createKeyframes(from:AnimationTarget,to:AnimationTarget,transition:TransitionOptions={}):Array<Record<string,string|number>> {
  const start:AnimationTarget={...from},end:AnimationTarget={...to};
  for(const key of Object.keys(end))if(start[key]==null){
    // Provide neutral values only for properties with well-defined neutral states.
    if(key==='opacity'||key==='scale'||key==='scaleX'||key==='scaleY')start[key]=1;
    else if(['x','y','z','rotate','rotateX','rotateY','skewX','skewY'].includes(key))start[key]=0;
  }
  if(transition.type!=='spring')return [toStyle(start),toStyle(end)];
  const curve=spring({stiffness:transition.stiffness,damping:transition.damping,mass:transition.mass});
  const frames=Math.min(90,Math.max(20,Math.ceil(curve.duration/24)));
  return Array.from({length:frames},(_,i)=>{
    const progress=curve.at(curve.duration*i/(frames-1));
    const values:AnimationTarget={...end};
    for(const [key,finish] of Object.entries(end)){
      const begin=start[key];
      if(typeof begin==='number'&&typeof finish==='number')values[key]=begin+(finish-begin)*progress;
      else if(i<frames-1&&begin!=null)values[key]=begin;
    }
    return toStyle(values);
  });
}
