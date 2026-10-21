/** Bounded opt-in motion telemetry for app-local debugging, not external monitoring. */
export interface MotionTrace { readonly label:string; readonly durationMs:number; readonly startedAt:number; readonly category:string; }
export interface MotionTraceSummary {count:number;meanMs:number;p95Ms:number;maxMs:number;overBudget:number;}
export interface MotionInspectorOptions {maxRecords?:number;frameBudgetMs?:number;now?:()=>number;enabled?:boolean;}
export interface MotionInspector {
  start(label:string,category?:string):()=>number;
  measure(label:string,ms:number,category?:string):void;
  records(category?:string):readonly MotionTrace[];
  summary(category?:string):MotionTraceSummary;
  clear():void;enable():void;disable():void;
}
/** Inject now() in tests, never store secrets or DOM objects in traces. */
export function createMotionInspector(options:MotionInspectorOptions={}):MotionInspector {
  const max=options.maxRecords??512,budget=options.frameBudgetMs??16.67;
  if(!Number.isSafeInteger(max)||max<1||max>100_000)throw new RangeError('maxRecords must be 1..100000');
  if(!Number.isFinite(budget)||budget<=0)throw new RangeError('frameBudgetMs must be positive');
  const now=options.now??(()=>globalThis.performance?.now?.()??Date.now());
  let enabled=options.enabled??false;const traces:MotionTrace[]=[];
  const write=(label:string,ms:number,category:string,startedAt:number)=>{
    if(!enabled)return;
    if(typeof label!=='string'||!label.trim())throw new TypeError('Trace label is required');
    if(!Number.isFinite(ms)||ms<0)throw new RangeError('Trace duration must be nonnegative finite');
    traces.push(Object.freeze({label,category,durationMs:ms,startedAt}));
    if(traces.length>max)traces.splice(0,traces.length-max);
  };
  const values=(category?:string)=>category===undefined?traces:traces.filter(t=>t.category===category);
  return {
    start(label,category='animation'){
      const started=now();let finished=false;
      return()=>{if(finished)return 0;finished=true;const elapsed=Math.max(0,now()-started);write(label,elapsed,category,started);return elapsed};
    },
    measure(label,ms,category='animation'){write(label,ms,category,now())},
    records(category){return Object.freeze([...values(category)])},
    summary(category){const durations=values(category).map(t=>t.durationMs).sort((a,b)=>a-b);
      if(!durations.length)return {count:0,meanMs:0,p95Ms:0,maxMs:0,overBudget:0};
      return {count:durations.length,meanMs:durations.reduce((a,b)=>a+b,0)/durations.length,
        p95Ms:durations[Math.ceil(durations.length*.95)-1]!,maxMs:durations[durations.length-1]!,
        overBudget:durations.filter(ms=>ms>budget).length};
    },
    clear(){traces.length=0},enable(){enabled=true},disable(){enabled=false},
  };
}
