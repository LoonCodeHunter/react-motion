export interface Point{x:number;y:number}
export interface DragInfo{point:Point;delta:Point;offset:Point;velocity:Point}
export interface DragConstraints{left?:number;right?:number;top?:number;bottom?:number}
export interface DragOptions {
 axis?:'x'|'y'|'both'; constraints?:DragConstraints; initialOffset?:Point;
 onStart?:(event:PointerEvent,info:DragInfo)=>void;
 onMove?:(event:PointerEvent,info:DragInfo)=>void;
 onEnd?:(event:PointerEvent,info:DragInfo)=>void;
 onCancel?:(event:PointerEvent,info:DragInfo)=>void;
}
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(value,max));
/** Pointer-based drag, works with mouse/touch/pen and returns a complete cleanup function. */
export function drag(element:HTMLElement,options:DragOptions={}) {
 let pointer:number|null=null,last:Point={x:0,y:0},start:Point={x:0,y:0},offset:Point={...(options.initialOffset??{x:0,y:0})},stamp=0,lastVelocity:Point={x:0,y:0};
 const axis=options.axis??'both';const oldTouchAction=element.style.touchAction;
 element.style.touchAction='none';
 const info=(event:PointerEvent,delta:Point,velocity:Point):DragInfo=>({point:{x:event.clientX,y:event.clientY},delta,offset:{...offset},velocity});
 const down=(event:PointerEvent)=>{
  if(pointer!==null||event.button!==0)return;
  pointer=event.pointerId;start=last={x:event.clientX,y:event.clientY};stamp=event.timeStamp;lastVelocity={x:0,y:0};
  element.setPointerCapture?.(pointer);options.onStart?.(event,info(event,{x:0,y:0},{x:0,y:0}));
 };
 const move=(event:PointerEvent)=>{
  if(pointer!==event.pointerId)return;
  const delta={x:axis==='y'?0:event.clientX-last.x,y:axis==='x'?0:event.clientY-last.y};
  const dt=Math.max(1,event.timeStamp-stamp);stamp=event.timeStamp;last={x:event.clientX,y:event.clientY};
  const next={x:offset.x+delta.x,y:offset.y+delta.y};const bounds=options.constraints;
  offset={x:clamp(next.x,bounds?.left??-Infinity,bounds?.right??Infinity),y:clamp(next.y,bounds?.top??-Infinity,bounds?.bottom??Infinity)};
  lastVelocity={x:delta.x/dt*1000,y:delta.y/dt*1000};
  options.onMove?.(event,info(event,delta,lastVelocity));
 };
 const end=(event:PointerEvent)=>{
  if(pointer!==event.pointerId)return;pointer=null;
  if(element.hasPointerCapture?.(event.pointerId))element.releasePointerCapture?.(event.pointerId);
  (event.type==='pointercancel'?options.onCancel:options.onEnd)?.(event,info(event,{x:0,y:0},lastVelocity));
 };
 element.addEventListener('pointerdown',down);element.addEventListener('pointermove',move);
 element.addEventListener('pointerup',end);element.addEventListener('pointercancel',end);
 return {get offset(){return {...offset}},setOffset(next:Point){if(!Number.isFinite(next.x)||!Number.isFinite(next.y))throw new RangeError('Invalid drag offset');offset={...next}},stop(){element.style.touchAction=oldTouchAction;
   element.removeEventListener('pointerdown',down);element.removeEventListener('pointermove',move);
   element.removeEventListener('pointerup',end);element.removeEventListener('pointercancel',end);
   if(pointer!==null&&element.hasPointerCapture?.(pointer))element.releasePointerCapture?.(pointer);pointer=null;
 }};
}
