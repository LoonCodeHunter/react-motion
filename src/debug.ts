/** Explicit, bounded, process-local debug records. Disabled by default in production. */
export interface MotionDebugRecord {
  readonly scope:string;
  readonly message:string;
  readonly data?:unknown;
  readonly time:number;
}
export interface MotionDebugOptions {maxRecords?:number;now?:()=>number}
export interface MotionDebugSession {
  readonly enabled:boolean;
  enable():void;disable():void;clear():void;
  log(scope:string,message:string,data?:unknown):void;
  records(scope?:string):readonly MotionDebugRecord[];
  subscribe(listener:(record:MotionDebugRecord)=>void):()=>void;
}
export function createDebugSession(options:MotionDebugOptions={}):MotionDebugSession {
  const capacity=options.maxRecords??500;
  if(!Number.isSafeInteger(capacity)||capacity<1||capacity>100_000)throw new RangeError('maxRecords must be 1..100000');
  const now=options.now??Date.now;
  let enabled=false;
  const records:MotionDebugRecord[]=[];
  const listeners=new Set<(record:MotionDebugRecord)=>void>();
  return {
    get enabled(){return enabled;},
    enable(){enabled=true;},disable(){enabled=false;},clear(){records.length=0;},
    log(scope,message,data){
      if(!enabled)return;
      if(!scope.trim()||!message.trim())throw new TypeError('scope and message are required');
      const record=Object.freeze({scope,message,data,time:now()});
      records.push(record);if(records.length>capacity)records.shift();
      for(const callback of listeners){try{callback(record)}catch{/* Debug subscriptions cannot break animation code. */}}
    },
    records(scope){return Object.freeze(records.filter(r=>scope===undefined||r.scope===scope));},
    subscribe(callback){if(typeof callback!=='function')throw new TypeError('Debug listener must be a function');
      listeners.add(callback);return()=>{listeners.delete(callback)};},
  };
}
/** Default singleton. Avoid logging secrets, user content or credentials. */
export const debug=createDebugSession();
