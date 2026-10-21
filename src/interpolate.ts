import { cubicBezier, easeInOut, linear, type Easing } from './easing.js';
export interface InterpolateOptions { clamp?: boolean; ease?: Easing }
export function mix(a:number,b:number,progress:number):number {return a+(b-a)*progress}
export function clamp(min:number,max:number,value:number):number {return Math.min(max,Math.max(min,value))}
export function interpolate(input:number,from:readonly number[],to:readonly number[],options:InterpolateOptions={}):number {
  if (from.length!==to.length||from.length<2)throw new RangeError('Input/output ranges must have equal lengths >= 2');
  for(let i=1;i<from.length;i++) if(from[i]<=from[i-1])throw new RangeError('Input range must be strictly increasing');
  const bounded=options.clamp!==false?clamp(from[0],from[from.length-1],input):input;
  let i=0;while(i<from.length-2&&bounded>from[i+1])i++;
  const progress=(bounded-from[i])/(from[i+1]-from[i]);
  return mix(to[i],to[i+1],(options.ease?options.ease(progress):progress));
}
export const easings = {linear,easeInOut,cubicBezier};
