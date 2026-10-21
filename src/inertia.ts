/** Physics for inertial dragging. Values are measured in px, velocity in px/s and time in ms. */
export interface InertiaOptions {
  velocity: number;
  friction?: number;
  min?: number;
  max?: number;
  bounceStiffness?: number;
  bounceDamping?: number;
  restSpeed?: number;
  restDelta?: number;
}
export interface InertiaSample { position:number; velocity:number; done:boolean }
export interface InertiaDriver { readonly finished:Promise<void>; stop():void }
const finite = (value:number, name:string) => { if(!Number.isFinite(value)) throw new RangeError(`${name} must be finite`); return value; };
/** Deterministic semi-implicit integration. Useful for testing and non-DOM renderers. */
export function stepInertia(position:number,velocity:number,dt:number,options:InertiaOptions):InertiaSample {
  finite(position,'position');finite(velocity,'velocity');finite(dt,'dt');
  if(dt<0)throw new RangeError('dt must not be negative');
  const friction=options.friction??7;
  const stiffness=options.bounceStiffness??280;
  const damping=options.bounceDamping??32;
  const min=options.min??-Infinity,max=options.max??Infinity;
  if(!Number.isFinite(friction)||!(friction>0)||!Number.isFinite(stiffness)||!(stiffness>0)||
    !Number.isFinite(damping)||damping<0||min>max||
    !Number.isFinite(options.restSpeed??1)||(options.restSpeed??1)<0||
    !Number.isFinite(options.restDelta??0.5)||(options.restDelta??0.5)<0)throw new RangeError('Invalid inertia options');
  // Cap step size so a suspended browser tab cannot destabilise the spring.
  const steps=Math.max(1,Math.ceil(dt/16));const seconds=dt/steps/1000;
  for(let i=0;i<steps;i++){
    const boundary=position<min?min:position>max?max:null;
    if(boundary===null){velocity*=Math.exp(-friction*seconds);}
    else {velocity+=(stiffness*(boundary-position)-damping*velocity)*seconds;}
    position+=velocity*seconds;
  }
  const boundary=position<min?min:position>max?max:null;
  const restSpeed=options.restSpeed??1,restDelta=options.restDelta??0.5;
  const done=Math.abs(velocity)<=restSpeed&&(boundary===null||Math.abs(position-boundary)<=restDelta);
  if(done&&boundary!==null)position=boundary;
  return {position,velocity:done?0:velocity,done};
}
/** Interruptible requestAnimationFrame inertia driver; caller owns DOM state and cleanup. */
export function animateInertia(from:number,options:InertiaOptions,onUpdate:(value:number)=>void):InertiaDriver {
  const raf=globalThis.requestAnimationFrame?.bind(globalThis);
  const caf=globalThis.cancelAnimationFrame?.bind(globalThis);
  let position=finite(from,'from'),velocity=finite(options.velocity,'velocity'),frame=0,previous=-1,stopped=false;
  let resolve!:()=>void;const finished=new Promise<void>(r=>{resolve=r});
  const settle=()=>{if(stopped)return;stopped=true;if(frame&&caf)caf(frame);resolve()};
  const tick=(time:number)=>{
    if(stopped)return;frame=0;
    const dt=previous<0?16:Math.min(64,Math.max(0,time-previous));previous=time;
    const result=stepInertia(position,velocity,dt,options);
    position=result.position;velocity=result.velocity;onUpdate(position);
    if(result.done)settle();else frame=raf?.(tick)??0;
  };
  // Validate options even if RAF is unavailable; avoid silently accepting bad physics.
  stepInertia(position,velocity,0,options);
  if(raf)frame=raf(tick);
  else {onUpdate(Math.max(options.min??-Infinity,Math.min(options.max??Infinity,position)));settle()}
  return {finished,stop:settle};
}
