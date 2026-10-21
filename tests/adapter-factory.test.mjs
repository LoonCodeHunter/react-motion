import test from 'node:test';
import assert from 'node:assert/strict';
import { createMotionAdapter,createAnimateAdapter,adaptMotionSource,createMotionProviderBridge } from '../dist/es/adapter-factory.js';
import { createReactMotion } from '../dist/es/react.js';
const fakeReact = {createElement(){},forwardRef(fn){return fn},useState(v){return [v,()=>{}]}};
test('inject imperative animate into overloaded createReactMotion without faking React components',()=>{
  const calls=[];const animate=(...args)=>{calls.push(args);return {stop(){}}};
  const adapter=createReactMotion(animate);
  assert.equal(adapter.kind,'animate');assert.equal(adapter.capabilities.react,false);
  assert.equal(adapter.isSupported('imperative'),true);
  assert.equal(typeof adapter.animate({},[{opacity:0},{opacity:1}],{duration:.3}).stop,'function');
  assert.equal(calls.length,1);assert.equal(adapter.motion,undefined);
});
test('React runtime retains component surface and gains explicit engine metadata',()=>{
  const r=createReactMotion(fakeReact);assert.equal(typeof r.motion.div,'function');
  assert.equal(r.engine.capabilities.react,true);assert.equal(r.engine.capabilities.imperative,false);
});
test('composed adapters expose separate imperative and declarative sources',()=>{
  const animate=()=>123;const motion={div(){}};
  const adapter=createMotionAdapter({name:'unified',react:fakeReact,animate,motion,AnimatePresence(){},reducedMotion:'always'});
  assert.equal(adapter.kind,'composed');assert.equal(adapter.animate(null,null),123);
  assert.strictEqual(adapter.motion,motion);assert.equal(adapter.capabilities.presence,true);
});
test('custom drivers and errors are surfaced predictably',()=>{
  const error=new Error('provider failed');let observed;
  const adapter=createMotionAdapter({driver(){throw error},onError(e){observed=e}});
  assert.throws(()=>adapter.drive(null,null),/provider failed/);assert.strictEqual(error,observed);
  assert.throws(()=>adapter.animate(null,null),/not configured/);
});
test('supports function, React and options source discovery',()=>{
  assert.equal(adaptMotionSource(()=>null).kind,'animate');
  assert.equal(adaptMotionSource(fakeReact).kind,'react');
  assert.equal(adaptMotionSource({motion:{div(){}}}).kind,'provider');
});
test('provider adapter preserves provider references and signal bridge',()=>{
  const motion={div(){}};const value=createMotionProviderBridge({motion});
  assert.strictEqual(value.provider.motion,motion);assert.equal(value.capabilities.components,true);
  const v=value.createValue(2);assert.equal(v.get(),2);v.destroy();
});
test('invalid providers and runtimes fail visibly',()=>{
  assert.throws(()=>createMotionAdapter({}),/Supply/);
  assert.throws(()=>createMotionAdapter({animate:42}),/must be a function/);
  assert.throws(()=>createMotionAdapter({react:{createElement(){}}}),/react must provide/);
  assert.throws(()=>createReactMotion({}),/React runtime/);
  assert.throws(()=>createMotionAdapter({driver:()=>0,reducedMotion:'maybe'}),/reducedMotion/);
});
