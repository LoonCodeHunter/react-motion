import { motionValue, type MotionValue, type DerivedMotionValue } from './motion-value.js';
import type { SpringOptions } from './spring.js';
/** Frame-driven physically simulated value. Unsubscribes and cancels its frame on stop(). */
export function springValue(source:MotionValue<number>,options:SpringOptions={}):DerivedMotionValue<number>{
 const mass=options.mass??1,stiffness=options.stiffness??170,damping=options.damping??26;
 if(mass<=0||stiffness<=0||damping<0)throw new RangeError('Invalid spring');
 const output=motionValue(source.get());let velocity=options.velocity??0,last=0,frame=0,active=true;
 const raf=globalThis.requestAnimationFrame?.bind(globalThis);
 const caf=globalThis.cancelAnimationFrame?.bind(globalThis);
 const tick=(now:number)=>{
  if(!active)return;frame=0;
  const dt=Math.min(0.04,Math.max(0.001,(now-(last||now-16))/1000));last=now;
  // Semi-implicit Euler: stable for browser frames, with dt cap after tab suspension.
  const delta=source.get()-output.get();velocity+=(stiffness*delta-damping*velocity)/mass*dt;
  const next=output.get()+velocity*dt;
  if(Math.abs(delta)<0.001&&Math.abs(velocity)<0.001){output.set(source.get());frame=0;return;}
  output.set(next);if(raf)frame=raf(tick);
 };
 const schedule=()=>{if(!active)return;if(!raf){output.jump(source.get());return;}if(frame)return;last=0;frame=raf(tick)};
 const unbind=source.subscribe(schedule);schedule();
 const stop=()=>{active=false;unbind();if(frame&&caf)caf(frame);frame=0};
 return {...output,stop,destroy(){stop();output.destroy()}};
}
