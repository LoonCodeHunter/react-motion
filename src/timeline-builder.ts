import {timeline, type TimelineAt, type TimelineControls, type TimelineItem} from './timeline.js';
export interface TimelineBuilder {
 add(target:Element,keyframes:Keyframe[]|PropertyIndexedKeyframes,options?:KeyframeAnimationOptions,at?:TimelineAt):TimelineBuilder;
 label(name:string,at?:TimelineAt):TimelineBuilder;
 stagger(targets:readonly Element[],keyframes:Keyframe[]|PropertyIndexedKeyframes,gap:number,options?:KeyframeAnimationOptions,at?:TimelineAt):TimelineBuilder;
 inspect():readonly TimelineItem[];
 build():TimelineControls;
}
/** Chainable authoring helper; no animations are allocated until build(). */
export function createTimelineBuilder():TimelineBuilder {
 const entries:TimelineItem[]=[];
 const builder:TimelineBuilder={
  add(target,keyframes,options={},at){entries.push({target,keyframes,options,at});return builder},
  label(name,at){if(!name.trim())throw new TypeError('Timeline labels cannot be empty');entries.push({label:name,at});return builder},
  stagger(targets,keyframes,gap,options={},at){
   if(!Number.isFinite(gap)||gap<0)throw new RangeError('Stagger gap must be nonnegative and finite');
   // Explicit offsets prevent accumulating a stagger from the previous item's duration.
   const label=`__kovari_stagger_${entries.length}`;
   entries.push({label,at});
   targets.forEach((target,index)=>entries.push({target,keyframes,options,at:index===0?label:`${label}+=${gap*index}`}));
   return builder;
  },
  inspect(){return entries.map(item=>({...item}))},
  build(){return timeline(entries)}
 };return builder;
}
