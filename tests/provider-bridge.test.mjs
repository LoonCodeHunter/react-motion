import test from 'node:test';
import assert from 'node:assert/strict';
import {createReactMotionBridge,createMotionProviderAdapter,fromExternalMotionValue,syncToExternalMotionValue} from '../dist/es/provider-bridge.js';
import {motionValue} from '../dist/es/motion-value.js';
function source(start=0,style='on'){
 let value=start;const listeners=new Set();let stopped=0;
 const obj={get:()=>value,set(v){value=v;listeners.forEach(f=>f(value))},listenerCount:()=>listeners.size,stops:()=>stopped};
 const register=fn=>{listeners.add(fn);return()=>{listeners.delete(fn);stopped++}};
 if(style==='on')obj.on=(event,fn)=>{assert.equal(event,'change');return register(fn)};
 else obj.subscribe=register;
 return obj;
}
test('external component providers are preserved',()=>{
 const motion={div(){}};const presence=()=>null;const adapter=createReactMotionBridge({name:'motion/react',motion,AnimatePresence:presence});
 assert.strictEqual(adapter.motion,motion);assert.strictEqual(adapter.AnimatePresence,presence);
 assert.equal(adapter.capabilities.presence,true);assert.equal(adapter.capabilities.config,false);
 assert.equal(adapter.engine,'motion/react');assert.strictEqual(createMotionProviderAdapter,createReactMotionBridge);
});
test('absent or invalid component providers are rejected',()=>{
 assert.throws(()=>createReactMotionBridge({motion:null}),/Provide a motion/);
 assert.equal(createReactMotionBridge({motion:{div(){}}}).AnimatePresence,undefined);
});
for(const type of ['on','subscribe'])test(`external signal ${type} subscription and cleanup`,()=>{
 const s=source(4,type),b=fromExternalMotionValue(s);assert.equal(b.value.get(),4);
 s.set(9);assert.equal(b.value.get(),9);b.stop();b.stop();assert.equal(s.listenerCount(),0);assert.equal(s.stops(),1);
 s.set(10);assert.equal(b.value.get(),9);
});
test('Kovari signal to external signal is one-way and cleanable',()=>{
 const s=motionValue(3),target=source(0);const stop=syncToExternalMotionValue(s,target);
 assert.equal(target.get(),3);s.set(6);assert.equal(target.get(),6);
 stop();s.set(9);assert.equal(target.get(),6);
});
test('malformed signal adapters raise clear errors',()=>{
 assert.throws(()=>fromExternalMotionValue({get:()=>3}),/on\("change"\) or subscribe/);
 assert.throws(()=>fromExternalMotionValue({get:()=>3,subscribe:()=>{}}),/cleanup/);
 assert.throws(()=>syncToExternalMotionValue(motionValue(0),{}),/set/);
});
