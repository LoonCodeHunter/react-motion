import type {AnimationTarget,TransitionOptions} from './variants.js';
export interface SequenceStep{at:number;duration:number;target:AnimationTarget;transition?:TransitionOptions}
export interface SequenceOptions{stagger?:number;initialDelay?:number;duration?:number}
/** Compute staggered element targets without observing layout or mutating inputs. */
export function staggerSequence(targets:readonly AnimationTarget[],options:SequenceOptions={}):SequenceStep[]{
  const stagger=options.stagger??60,initialDelay=options.initialDelay??0,duration=options.duration??300;
  if(![stagger,initialDelay,duration].every(v=>Number.isFinite(v)&&v>=0))throw new RangeError('Sequence timings must be finite non-negative milliseconds');
  return targets.map((target,index)=>({at:initialDelay+stagger*index,duration,target:{...target}}));
}
/** Keyed variant propagation for nested React trees. */
export function cascadeVariant(parent:string|undefined,child:string|undefined):string|undefined {return child??parent;}
