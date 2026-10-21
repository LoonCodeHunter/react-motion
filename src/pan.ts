/** Pointer-capture pan/swipe gestures without implicit DOM style mutation. */
export type GestureAxis = 'x' | 'y' | 'both';
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';
export interface PanInfo {
  point: Readonly<{x:number;y:number}>;
  origin: Readonly<{x:number;y:number}>;
  delta: Readonly<{x:number;y:number}>;
  offset: Readonly<{x:number;y:number}>;
  velocity: Readonly<{x:number;y:number}>; // px / second, averaged across recent samples
  distance: number;
  pointerId: number;
}
export interface SwipeInfo extends PanInfo { direction: SwipeDirection; }
export interface PanOptions {
  axis?:GestureAxis;
  /** Minimum displacement before onStart fires; defaults to 3 pixels. */
  threshold?:number;
  /** Maximum sample lookback for velocity; defaults to 100 ms. */
  velocityWindow?:number;
  /** Minimum displacement and speed required to report a swipe. */
  swipeDistance?:number;
  swipeVelocity?:number;
  /** Opt in to calling preventDefault while actively dragging. */
  preventDefault?:boolean;
  onStart?:(event:PointerEvent,info:PanInfo)=>void;
  onMove?:(event:PointerEvent,info:PanInfo)=>void;
  onEnd?:(event:PointerEvent,info:PanInfo)=>void;
  onCancel?:(event:PointerEvent,info:PanInfo)=>void;
  onSwipe?:(event:PointerEvent,info:SwipeInfo)=>void;
}
const distance=(x:number,y:number)=>Math.hypot(x,y);
/** Adds listeners only to the supplied target; returns an idempotent teardown. */
export function pan(element:Element,options:PanOptions={}):()=>void {
  if(!element || typeof element.addEventListener!=='function')throw new TypeError('pan requires a DOM element');
  const {axis='both',threshold=3,velocityWindow=100,swipeDistance=35,swipeVelocity=350,preventDefault=false}=options;
  if(!['x','y','both'].includes(axis))throw new TypeError('axis must be x, y, or both');
  for(const [key,value] of Object.entries({threshold,velocityWindow,swipeDistance,swipeVelocity}))
    if(!Number.isFinite(value)||value<0||(key==='velocityWindow'&&value===0))throw new RangeError(`${key} must be a valid nonnegative number`);
  type Sample={x:number;y:number;t:number};
  let activeId:number|null=null,started=false,origin={x:0,y:0},previous={x:0,y:0},samples:Sample[]=[];
  let detached=false;
  const eventTime=(event:PointerEvent)=>Number.isFinite(event.timeStamp)?event.timeStamp:Date.now();
  const filter=(x:number,y:number)=>({x:axis==='y'?0:x,y:axis==='x'?0:y});
  const sample=(event:PointerEvent)=>{
    const t=eventTime(event),coords=filter(event.clientX-origin.x,event.clientY-origin.y);
    const point={x:origin.x+coords.x,y:origin.y+coords.y};
    samples.push({x:point.x,y:point.y,t});
    while(samples.length>2&&samples[1]!.t<t-velocityWindow)samples.shift();
    return point;
  };
  const info=(point:{x:number;y:number}):PanInfo=>{
    const oldest=samples[0],newest=samples[samples.length-1];
    const dt=oldest&&newest?Math.max(0,newest.t-oldest.t):0;
    const velocity=dt>0?{x:(newest.x-oldest.x)*1000/dt,y:(newest.y-oldest.y)*1000/dt}:{x:0,y:0};
    const offset={x:point.x-origin.x,y:point.y-origin.y};
    return {point:{...point},origin:{...origin},delta:{x:point.x-previous.x,y:point.y-previous.y},offset,velocity,distance:distance(offset.x,offset.y),pointerId:activeId!};
  };
  const down=(event:PointerEvent)=>{
    if(detached||activeId!==null||event.isPrimary===false||event.button!==0)return;
    activeId=event.pointerId;started=false;origin={x:event.clientX,y:event.clientY};previous={...origin};samples=[{...origin,t:eventTime(event)}];
    try{element.setPointerCapture?.(activeId)}catch{/* detached nodes or unsupported capture */}
  };
  const move=(event:PointerEvent)=>{
    if(detached||event.pointerId!==activeId)return;
    const point=sample(event),data=info(point);
    if(!started&&data.distance>=threshold){started=true;options.onStart?.(event,data)}
    if(started){if(preventDefault&&event.cancelable)event.preventDefault();options.onMove?.(event,data)}
    previous=point;
  };
  const release=(event:PointerEvent,cancelled:boolean)=>{
    if(event.pointerId!==activeId)return;
    const point=sample(event),data=info(point);
    if(started){
      if(cancelled)options.onCancel?.(event,data);
      else{
        options.onEnd?.(event,data);
        const horizontal=Math.abs(data.offset.x)>=Math.abs(data.offset.y);
        const magnitude=horizontal?Math.abs(data.velocity.x):Math.abs(data.velocity.y);
        if(data.distance>=swipeDistance&&magnitude>=swipeVelocity){
          const direction:SwipeDirection=horizontal?(data.offset.x>=0?'right':'left'):(data.offset.y>=0?'down':'up');
          options.onSwipe?.(event,{...data,direction});
        }
      }
    }
    const id=activeId;activeId=null;started=false;samples=[];
    try{if(id!==null&&element.hasPointerCapture?.(id))element.releasePointerCapture?.(id)}catch{/* already lost capture */}
  };
  const up=(e:PointerEvent)=>release(e,false);
  const cancel=(e:PointerEvent)=>release(e,true);
  const lost=(e:PointerEvent)=>{if(e.pointerId===activeId)release(e,true)};
  element.addEventListener('pointerdown',down as EventListener);
  element.addEventListener('pointermove',move as EventListener);
  element.addEventListener('pointerup',up as EventListener);
  element.addEventListener('pointercancel',cancel as EventListener);
  element.addEventListener('lostpointercapture',lost as EventListener);
  return()=>{
    if(detached)return;detached=true;
    element.removeEventListener('pointerdown',down as EventListener);
    element.removeEventListener('pointermove',move as EventListener);
    element.removeEventListener('pointerup',up as EventListener);
    element.removeEventListener('pointercancel',cancel as EventListener);
    element.removeEventListener('lostpointercapture',lost as EventListener);
    if(activeId!==null){try{if(element.hasPointerCapture?.(activeId))element.releasePointerCapture?.(activeId)}catch{}}
    activeId=null;samples=[];
  };
}
