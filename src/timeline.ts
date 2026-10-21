import { animate } from './dom.js';
/** Times are milliseconds, matching the existing 0.x DOM API. */
export type TimelineAt=number|'<'|`+=${number}`|`-=${number}`|string;
export interface Segment {
  target:Element;
  keyframes:Keyframe[]|PropertyIndexedKeyframes;
  options?:KeyframeAnimationOptions;
  at?:TimelineAt;
}
export interface TimelineLabel{label:string;at?:TimelineAt}
export type TimelineItem=Segment|TimelineLabel;
export interface TimelineControls {
  readonly duration:number;
  readonly animations:readonly Animation[];
  play():void;pause():void;reverse():void;cancel():void;finish():void;seek(ms:number):void;
  readonly finished:Promise<void>;
}
function resolveTime(at:TimelineAt|undefined,cursor:number,previous:number,labels:Map<string,number>):number {
  if(at==null)return cursor;
  if(typeof at==='number')return Math.max(0,at);
  if(at==='<')return previous;
  if(at.startsWith('+='))return Math.max(0,cursor+Number(at.slice(2)));
  if(at.startsWith('-='))return Math.max(0,cursor-Number(at.slice(2)));
  const match=/^([^+-]+)([+-]=)(\d+(?:\.\d+)?)$/.exec(at);
  if(match){const label=labels.get(match[1]);if(label===undefined)throw new Error(`Unknown timeline label: ${match[1]}`);
    return Math.max(0,label+(match[2]=='+='?1:-1)*Number(match[3]));}
  const label=labels.get(at);if(label===undefined)throw new Error(`Unknown timeline label: ${at}`);return label;
}
/** Coordinated WAAPI timeline with labels, relative offsets and scrubbing. */
export function timeline(items:readonly TimelineItem[]):TimelineControls{
 const labels=new Map<string,number>();let cursor=0,previous=0;
 const animations:Animation[]=[];
 for(const item of items){
  const at=resolveTime(item.at,cursor,previous,labels);
  if(!Number.isFinite(at))throw new RangeError('Invalid timeline offset');
  if('label' in item){if(labels.has(item.label))throw new Error(`Duplicate timeline label: ${item.label}`);
    labels.set(item.label,at);cursor=Math.max(cursor,at);previous=at;continue;}
  const options=item.options??{};const duration=Number(options.duration??300),delay=Number(options.delay??0);
  if(!Number.isFinite(duration)||duration<0||!Number.isFinite(delay))throw new RangeError('Invalid timeline timing');
  const animation=animate(item.target,item.keyframes,{...options,delay:at+delay});
  animation.pause();animations.push(animation);previous=at;cursor=Math.max(cursor,at+delay+duration);
 }
 const seek=(time:number)=>{const ms=Math.min(cursor,Math.max(0,time));animations.forEach(a=>{a.pause();a.currentTime=ms})};
 return {duration:cursor,animations:Object.freeze([...animations]),
  play:()=>animations.forEach(a=>a.play()),pause:()=>animations.forEach(a=>a.pause()),
  reverse:()=>animations.forEach(a=>a.reverse()),cancel:()=>animations.forEach(a=>a.cancel()),
  finish:()=>animations.forEach(a=>a.finish()),seek,
  finished:Promise.all(animations.map(a=>a.finished.catch(()=>undefined))).then(()=>undefined)
 };
}
