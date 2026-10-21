import {motionValue,type MotionValue,type DerivedMotionValue} from './motion-value.js';
/** Compose arbitrary numeric or nonnumeric signals with deterministic cleanup. */
export function combineMotionValues<T extends readonly unknown[],R>(
 sources:{[K in keyof T]:MotionValue<T[K]>},
 project:(...values:T)=>R
):DerivedMotionValue<R>{
 const read=()=>project(...(sources.map(s=>s.get()) as unknown as T));
 const result=motionValue(read());
 const unbind=sources.map(source=>source.subscribe(()=>result.set(read())));
 let active=true;
 const stop=()=>{if(!active)return;active=false;unbind.forEach(fn=>fn())};
 return {...result,stop,destroy(){stop();result.destroy()}};
}
