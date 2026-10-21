import test from 'node:test';
import assert from 'node:assert/strict';
import {pan} from '../dist/es/pan.js';
import {motionValue} from '../dist/es/motion-value.js';
import {bindScrollAnimation} from '../dist/es/scroll-scrub.js';
import {createAnimateAdapter} from '../dist/es/adapter-factory.js';
import {createMotionAdapterRegistry} from '../dist/es/adapter-registry.js';
import {createMotionInspector} from '../dist/es/inspector.js';

class FakeElement {
  handlers=new Map();capture=null;
  addEventListener(name,fn){const list=this.handlers.get(name)??new Set();list.add(fn);this.handlers.set(name,list)}
  removeEventListener(name,fn){this.handlers.get(name)?.delete(fn)}
  setPointerCapture(id){this.capture=id}
  hasPointerCapture(id){return this.capture===id}
  releasePointerCapture(id){if(this.capture===id)this.capture=null}
  emit(name,options={}){
    const event={pointerId:1,isPrimary:true,button:0,clientX:0,clientY:0,timeStamp:0,cancelable:true,
      prevented:false,preventDefault(){this.prevented=true},...options};
    for(const fn of [...this.handlers.get(name)??[]])fn(event);
    return event;
  }
  listenerCount(){return [...this.handlers.values()].reduce((sum,set)=>sum+set.size,0)}
}

test('pan: tracks threshold, delta, velocity, swipe and cleanup without styles',()=>{
  const element=new FakeElement(),events=[];
  const stop=pan(element,{threshold:8,swipeVelocity:100,swipeDistance:50,
    onStart:(e,i)=>events.push(['start',i.offset.x]),
    onMove:(e,i)=>events.push(['move',i.velocity.x]),
    onEnd:(e,i)=>events.push(['end',i.offset.x]),
    onSwipe:(e,i)=>events.push(['swipe',i.direction])});
  element.emit('pointerdown',{timeStamp:100});
  element.emit('pointermove',{clientX:2,timeStamp:105});
  assert.equal(events.length,0);
  element.emit('pointermove',{clientX:20,timeStamp:120});
  element.emit('pointermove',{clientX:80,timeStamp:160});
  element.emit('pointerup',{clientX:90,timeStamp:180});
  assert.deepEqual(events.map(e=>e[0]),['start','move','move','end','swipe']);
  assert.equal(events.at(-1)[1],'right');
  assert.equal(events[0][1],20);
  assert.ok(events[1][1]>0);
  assert.equal(element.capture,null);
  assert.equal(element.style,undefined);
  stop();stop();assert.equal(element.listenerCount(),0);
});

test('pan: respects active pointer and cancellation; never calls swipe on cancel',()=>{
  const element=new FakeElement();let starts=0,cancels=0,swipes=0;
  const stop=pan(element,{axis:'y',threshold:1,onStart:()=>starts++,onCancel:()=>cancels++,onSwipe:()=>swipes++});
  element.emit('pointerdown',{pointerId:7,timeStamp:10});
  element.emit('pointermove',{pointerId:3,clientY:90,timeStamp:20});
  element.emit('pointermove',{pointerId:7,clientX:90,clientY:10,timeStamp:20});
  element.emit('pointercancel',{pointerId:7,clientY:15,timeStamp:30});
  assert.equal(starts,1);assert.equal(cancels,1);assert.equal(swipes,0);
  stop();
});

test('pan: prevents default only when active and requested',()=>{
 const element=new FakeElement();let moves=0;
 pan(element,{preventDefault:true,threshold:5,onMove:()=>moves++});
 element.emit('pointerdown');
 assert.equal(element.emit('pointermove',{clientX:2,timeStamp:10}).prevented,false);
 assert.equal(element.emit('pointermove',{clientX:8,timeStamp:20}).prevented,true);
 assert.equal(moves,1);
});

test('pan: rejects invalid options and ignores non-primary pointers',()=>{
 const element=new FakeElement();let moved=false;
 assert.throws(()=>pan(element,{axis:'z'}),/axis/);
 assert.throws(()=>pan(element,{velocityWindow:0}),/velocityWindow/);
 const stop=pan(element,{threshold:0,onStart:()=>moved=true});
 element.emit('pointerdown',{isPrimary:false});
 element.emit('pointermove',{clientX:10});
 assert.equal(moved,false);stop();
});

test('scroll scrub: maps a source range to seekable currentTime and unsubscribes',()=>{
 const progress=motionValue(0);const animation={currentTime:0,pauses:0,pause(){this.pauses++}};
 const ctl=bindScrollAnimation(progress,animation,{duration:800,range:[.25,.75]});
 assert.equal(animation.pauses,1);assert.equal(animation.currentTime,0);
 progress.set(.5);assert.equal(animation.currentTime,400);
 progress.set(1);assert.equal(animation.currentTime,800);
 progress.set(0);assert.equal(animation.currentTime,0);
 ctl.stop();ctl.stop();progress.set(.6);assert.equal(animation.currentTime,0);
 progress.destroy();
});

test('scroll scrub: applies easing, ignores invalid progress, validates configs',()=>{
 const v=motionValue(.5);const a={currentTime:0,pause(){}};
 bindScrollAnimation(v,a,{duration:100,easing:x=>x*x}).stop();assert.equal(a.currentTime,25);
 assert.throws(()=>bindScrollAnimation(v,a,{duration:0}),/duration/);
 assert.throws(()=>bindScrollAnimation(v,a,{duration:100,range:[.8,.2]}),/range/);
 assert.throws(()=>bindScrollAnimation(v,a,{duration:100,easing:()=>Infinity}),/easing/);
 v.destroy();
});

test('registry: lazy load, concurrency sharing and cache exactly once',async()=>{
 const registry=createMotionAdapterRegistry();let loads=0;
 const provider=createAnimateAdapter(()=>123);
 registry.register('motion',async()=>{loads++;await Promise.resolve();return provider});
 assert.deepEqual(registry.list(),['motion']);
 const [a,b]=await Promise.all([registry.resolve('motion'),registry.resolve('motion')]);
 assert.strictEqual(a,b);assert.strictEqual(a,provider);assert.equal(loads,1);
 assert.strictEqual(await registry.resolve('motion'),a);assert.equal(loads,1);
 assert.equal((await registry.resolve('motion')).animate(null,null),123);
});

test('registry: errors retry; stale registration invalidated; unknown errors',async()=>{
 const registry=createMotionAdapterRegistry();let tries=0;
 registry.register('fail',()=>{tries++;if(tries===1)throw Error('unavailable');return createAnimateAdapter(()=>2)});
 await assert.rejects(registry.resolve('fail'),/unavailable/);
 assert.equal((await registry.resolve('fail')).animate(null,null),2);
 assert.equal(tries,2);
 assert.throws(()=>registry.register('fail',()=>null),/already registered/);
 let release;
 registry.register('stale',()=>new Promise(resolve=>{release=resolve}));
 const stale=registry.resolve('stale');
 await Promise.resolve();
 registry.register('stale',()=>createAnimateAdapter(()=>3),{replace:true});
 release(createAnimateAdapter(()=>99));
 await assert.rejects(stale,/registration changed/);
 assert.equal((await registry.resolve('stale')).animate(null,null),3);
 await assert.rejects(registry.resolve('unknown'),/Unknown/);
 assert.equal(registry.remove('stale'),true);assert.equal(registry.has('stale'),false);
 registry.clear();assert.deepEqual(registry.list(),[]);
});

test('registry: provider contract checks and names reject missing implementations',async()=>{
 const r=createMotionAdapterRegistry();
 assert.throws(()=>r.register(' ',()=>null),/name/);
 r.register('bad',()=>({animate(){}}));
 await assert.rejects(r.resolve('bad'),/Invalid adapter/);
});

test('inspector: bounded times, percentiles and deterministic timing',()=>{
 let time=100;const i=createMotionInspector({enabled:true,maxRecords:3,frameBudgetMs:10,now:()=>time});
 const done=i.start('card','ui');time=116;assert.equal(done(),16);assert.equal(done(),0);
 i.measure('scroll',2,'ui');i.measure('drag',18,'ui');i.measure('another',4,'ui');
 assert.deepEqual(i.records('ui').map(t=>t.label),['scroll','drag','another']);
 const summary=i.summary('ui');assert.equal(summary.count,3);assert.equal(summary.maxMs,18);
 assert.equal(summary.p95Ms,18);assert.equal(summary.overBudget,1);
 i.disable();i.measure('nope',99);assert.equal(i.records().length,3);
 i.clear();assert.equal(i.summary().count,0);
});

test('inspector: validates budgets, lengths, and labels',()=>{
 assert.throws(()=>createMotionInspector({maxRecords:0}),/maxRecords/);
 assert.throws(()=>createMotionInspector({frameBudgetMs:-1}),/frameBudget/);
 const i=createMotionInspector({enabled:true});
 assert.throws(()=>i.measure('',1),/label/);assert.throws(()=>i.measure('bad',-1),/duration/);
});
