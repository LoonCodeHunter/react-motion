import type {MotionEngineAdapter} from './adapter-factory.js';
/** Lazy, typed provider registration with concurrent-load deduplication. */
export type MotionAdapterFactory=()=>MotionEngineAdapter|Promise<MotionEngineAdapter>;
export interface MotionAdapterRegistry {
  register(name:string,factory:MotionAdapterFactory,options?:{replace?:boolean}):void;
  resolve(name:string):Promise<MotionEngineAdapter>;
  has(name:string):boolean;
  list():readonly string[];
  remove(name:string):boolean;
  clear():void;
}
/** Keep optional animation packages out of the initial bundle until needed. */
export function createMotionAdapterRegistry():MotionAdapterRegistry{
  const factories=new Map<string,MotionAdapterFactory>();
  const resolved=new Map<string,MotionEngineAdapter>();
  const pending=new Map<string,Promise<MotionEngineAdapter>>();
  const revisions=new Map<string,number>();
  const assertName=(name:string)=>{
    if(typeof name!=='string'||!name.trim()||name.trim()!==name)throw new TypeError('Adapter name must be a nonempty trimmed string');
  };
  const invalidate=(name:string)=>{revisions.set(name,(revisions.get(name)??0)+1);resolved.delete(name);pending.delete(name)};
  return {
    register(name,factory,options={}){
      assertName(name);
      if(typeof factory!=='function')throw new TypeError('Adapter factory must be a function');
      if(factories.has(name)&&!options.replace)throw new Error(`Adapter already registered: ${name}`);
      invalidate(name);factories.set(name,factory);
    },
    resolve(name){
      assertName(name);
      const cached=resolved.get(name);if(cached)return Promise.resolve(cached);
      const inflight=pending.get(name);if(inflight)return inflight;
      const factory=factories.get(name);if(!factory)return Promise.reject(new Error(`Unknown animation adapter: ${name}`));
      const revision=revisions.get(name)??0;
      // Schedule factory asynchronously so same-tick resolves share one promise.
      const promise=Promise.resolve().then(()=>factory()).then(adapter=>{
        if(!adapter||typeof adapter.animate!=='function'||typeof adapter.isSupported!=='function')throw new TypeError(`Invalid adapter from ${name}`);
        if(revisions.get(name)!==revision)throw new Error(`Adapter registration changed while resolving: ${name}`);
        resolved.set(name,adapter);return adapter;
      }).finally(()=>{if(pending.get(name)===promise)pending.delete(name)});
      pending.set(name,promise);return promise;
    },
    has(name){return factories.has(name)},
    list(){return Object.freeze([...factories.keys()])},
    remove(name){const existed=factories.delete(name);if(existed)invalidate(name);return existed},
    clear(){for(const name of factories.keys())invalidate(name);factories.clear()},
  };
}
