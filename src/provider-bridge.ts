/** Explicit optional interoperability with separately installed animation providers. */
import { motionValue, type MotionValue } from './motion-value.js';
export interface ExternalMotionValue<T> {
  get():T;
  set?(value:T):void;
  on?(event:'change', callback:(value:T)=>void):(()=>void)|void;
  subscribe?(callback:(value:T)=>void):(()=>void)|void;
}
export interface ProviderBridgeSource<T=unknown> {
  motion:T;
  AnimatePresence?:unknown;
  MotionConfig?:unknown;
  name?:string;
}
export interface ImportedMotionValue<T> { value:MotionValue<T>;stop():void }
export interface ProviderBridge<T> {
  readonly engine:string;
  readonly motion:T;
  readonly AnimatePresence:unknown|undefined;
  readonly MotionConfig:unknown|undefined;
  readonly capabilities:Readonly<{components:true;presence:boolean;config:boolean}>;
  fromExternalValue<V>(value:ExternalMotionValue<V>):ImportedMotionValue<V>;
  syncToExternalValue<V>(source:MotionValue<V>,external:Pick<ExternalMotionValue<V>,'set'>):()=>void;
}
export function fromExternalMotionValue<T>(external:ExternalMotionValue<T>):ImportedMotionValue<T> {
  if(!external||typeof external.get!=='function')throw new TypeError('External value must provide get()');
  const value=motionValue(external.get());
  let active=true;
  const changed=(next:T)=>{if(active)value.set(next)};
  let unsub:unknown;
  if(typeof external.on==='function')unsub=external.on('change',changed);
  else if(typeof external.subscribe==='function')unsub=external.subscribe(changed);
  else throw new TypeError('External value must provide on("change") or subscribe()');
  if(typeof unsub!=='function')throw new TypeError('External value subscription must return cleanup');
  value.set(external.get());
  return {value,stop(){if(!active)return;active=false;(unsub as()=>void)();value.destroy()}};
}
export function syncToExternalMotionValue<T>(source:MotionValue<T>,external:Pick<ExternalMotionValue<T>,'set'>):()=>void {
  if(!source||typeof source.get!=='function'||typeof source.subscribe!=='function'||typeof external?.set!=='function')
    throw new TypeError('A Kovari signal and an external set() are required');
  let active=true;
  const sync=()=>{if(active)external.set!(source.get())};
  const unsub=source.subscribe(sync);
  sync();
  return ()=>{if(!active)return;active=false;unsub()};
}
/** Keep external component factories owned by their original animation provider. */
export function createReactMotionBridge<T>(source:ProviderBridgeSource<T>):ProviderBridge<T>{
  if(!source||((typeof source.motion!=='object'||source.motion===null)&&typeof source.motion!=='function'))
    throw new TypeError('Provide a motion component factory or object');
  return Object.freeze({
    engine:source.name?.trim()||'external',motion:source.motion,
    AnimatePresence:source.AnimatePresence,MotionConfig:source.MotionConfig,
    capabilities:Object.freeze({components:true as const,presence:source.AnimatePresence!=null,config:source.MotionConfig!=null}),
    fromExternalValue:fromExternalMotionValue,syncToExternalValue:syncToExternalMotionValue,
  });
}
export const createMotionProviderAdapter=createReactMotionBridge;
