/** Closed-form damped harmonic oscillator with support for under-, critical and overdamping. */
export interface SpringOptions { mass?:number;stiffness?:number;damping?:number;velocity?:number }
export function spring(options:SpringOptions={}){
 const mass=options.mass??1,k=options.stiffness??170,d=options.damping??26,v=options.velocity??0;
 if(!Number.isFinite(mass)||!Number.isFinite(k)||!Number.isFinite(d)||!Number.isFinite(v)||mass<=0||k<=0||d<0)
   throw new RangeError('Invalid spring');
 const omega=Math.sqrt(k/mass),ratio=d/(2*Math.sqrt(k*mass));
 const at=(ms:number):number=>{
  const t=Math.max(0,ms)/1000;
  if(ratio<1-1e-5){const damped=omega*Math.sqrt(1-ratio*ratio);
    return 1-Math.exp(-ratio*omega*t)*(Math.cos(damped*t)+(ratio*omega-v)/damped*Math.sin(damped*t));
  }
  if(ratio>1+1e-5){
    const root=Math.sqrt(ratio*ratio-1),r1=-omega*(ratio-root),r2=-omega*(ratio+root);
    const c1=(v+r2)/(r1-r2),c2=-1-c1;
    return 1+c1*Math.exp(r1*t)+c2*Math.exp(r2*t);
  }
  return 1-Math.exp(-omega*t)*(1+(omega-v)*t);
 };
 // Require both small position error and speed to avoid false settling at an overshoot crossing.
 let duration=20_000;
 for(let ms=16;ms<=20_000;ms+=16){
  if(Math.abs(1-at(ms))<0.001&&Math.abs(at(ms+16)-at(ms-16))<0.0005){duration=ms;break;}
 }
 return {at,duration,sample(count=60){if(!Number.isInteger(count)||count<1)throw new RangeError('Sample count must be positive');
   return Array.from({length:count},(_,i)=>at(duration*i/Math.max(1,count-1)));}};
}
