import test from 'node:test';
import assert from 'node:assert/strict';
import {stepInertia,animateInertia} from '../dist/es/inertia.js';
import {createSharedLayoutRegistry} from '../dist/es/shared-layout.js';
import {reconcilePresence} from '../dist/es/presence.js';
import {staggerSequence,cascadeVariant} from '../dist/es/sequence.js';
import {createAnimationControls,isAnimationControls} from '../dist/es/controls.js';
import {drag} from '../dist/es/drag.js';
import {layout} from '../dist/es/layout.js';
import {scroll} from '../dist/es/scroll.js';
import {inView} from '../dist/es/observe.js';
import {createReactMotion} from '../dist/es/react.js';
import {staggerVariants} from '../dist/es/variants.js';
import {createTimelineBuilder} from '../dist/es/timeline-builder.js';
import {motionValue} from '../dist/es/motion-value.js';
import {combineMotionValues} from '../dist/es/motion-combine.js';

const rect=(x,y,width,height)=>({x,y,width,height});
function pointerNode(){const handlers=new Map();return {style:{touchAction:''},
 addEventListener(k,fn){handlers.set(k,fn)},removeEventListener(k){handlers.delete(k)},
 emit(type,props={}){handlers.get(type)?.({type,button:0,pointerId:9,clientX:0,clientY:0,timeStamp:0,...props})},
 setPointerCapture(){},releasePointerCapture(){},hasPointerCapture(){return true},listenerCount(){return handlers.size}}}

test('inertia decays freely without overshooting the stable resting point',()=>{
 let pos=0,velocity=1100,done=false;
 for(let i=0;i<500&&!done;i++){const sample=stepInertia(pos,velocity,16,{velocity:1100});pos=sample.position;velocity=sample.velocity;done=sample.done}
 assert.equal(done,true);assert.ok(pos>0&&pos<170);assert.equal(velocity,0);
});
test('inertia respects spring bounds and settles inside constraints',()=>{
 let pos=170,velocity=3000,done=false;
 for(let i=0;i<1000&&!done;i++){const sample=stepInertia(pos,velocity,16,{velocity:3000,min:-100,max:100});pos=sample.position;velocity=sample.velocity;done=sample.done}
 assert.equal(done,true);assert.equal(pos,100);
});
test('inertia validates invalid inputs and large frame steps remain finite',()=>{
 assert.throws(()=>stepInertia(0,NaN,16,{velocity:0}),/finite/);
 assert.throws(()=>stepInertia(0,5,-1,{velocity:5}),/dt/);
 assert.throws(()=>stepInertia(0,5,16,{velocity:5,min:10,max:-10}),/Invalid/);
 assert.ok(Number.isFinite(stepInertia(10,20000,200,{velocity:20000,min:0,max:50}).position));
});
test('inertia RAF driver updates, can be interrupted and releases finished',async()=>{
 const raf=globalThis.requestAnimationFrame,caf=globalThis.cancelAnimationFrame;
 const callbacks=new Map();let i=0;
 globalThis.requestAnimationFrame=fn=>{callbacks.set(++i,fn);return i};
 globalThis.cancelAnimationFrame=id=>callbacks.delete(id);
 try{
  const updates=[];const driver=animateInertia(0,{velocity:400},x=>updates.push(x));
  const tick=callbacks.get(1);callbacks.delete(1);tick?.(16);driver.stop();await driver.finished;
  assert.equal(callbacks.size,0);assert.equal(updates.length,1);assert.ok(updates[0]>0);
 }finally{if(raf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=raf;
 if(caf===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=caf}
});
test('shared layout snapshots consume one time and retain no element references',()=>{
 const registry=createSharedLayoutRegistry();const element={getBoundingClientRect:()=>rect(3,4,80,40)};
 registry.capture('nav-tab',element);assert.equal(registry.size(),1);
 let captured;
 const incoming={getBoundingClientRect:()=>rect(20,20,80,40),style:{transform:'scale(1.1)'},animate:(frames,options)=>{
  captured={frames,options};return {finished:new Promise(()=>{}),cancel(){}};
 }};
 const result=registry.enter('nav-tab',incoming,{duration:180});
 assert.ok(result);assert.equal(registry.size(),0);
 assert.match(captured.frames[0].transform,/translate/);
 assert.match(captured.frames.at(-1).transform,/scale\(1.1\)/);
 assert.equal(registry.enter('nav-tab',incoming),null);
 assert.throws(()=>registry.capture('',element),/layoutId/);
});
test('FLIP animations cancel their fill effect on finish',async()=>{
 let release;let canceled=0;
 const node={getBoundingClientRect:()=>rect(20,0,100,100),style:{transform:'translateX(5px)'},
 animate(){return{finished:new Promise(resolve=>release=resolve),cancel(){canceled++}}}};
 layout(node,rect(0,0,100,100));release();await Promise.resolve();await Promise.resolve();assert.equal(canceled,1);
});
test('presence sync retains exiting keys at stable position and supports re-entry',()=>{
 const old=[{key:'a',value:1,state:'present'},{key:'b',value:2,state:'present'}];
 const next=reconcilePresence(old,[{key:'b',value:22},{key:'c',value:3}]);
 assert.deepEqual(next.map(x=>[x.key,x.state]),[['a','exit'],['b','present'],['c','enter']]);
 const restored=reconcilePresence(next,[{key:'a',value:4},{key:'b',value:5}]);
 assert.equal(restored.find(x=>x.key==='a').state,'present');
});
test('presence wait holds newcomers until the old exit completes',()=>{
 const old=[{key:'old',value:1,state:'present'}];
 const waiting=reconcilePresence(old,[{key:'new',value:2}],'wait');
 assert.deepEqual(waiting.map(x=>x.key),['old']);assert.equal(waiting[0].state,'exit');
 const entered=reconcilePresence([],[{key:'new',value:2}],'wait');
 assert.deepEqual(entered.map(x=>x.key),['new']);
});
test('presence prevents duplicate React keys',()=>{
 assert.throws(()=>reconcilePresence([],[{key:'x',value:1},{key:'x',value:2}]),/Duplicate/);
});
test('stagger sequence copies targets, preserves ordering and validates timings',()=>{
 const first={opacity:0};const values=staggerSequence([first,{opacity:1}],{stagger:55,initialDelay:20,duration:100});
 assert.deepEqual(values.map(x=>[x.at,x.duration]),[[20,100],[75,100]]);
 values[0].target.opacity=2;assert.equal(first.opacity,0);
 assert.equal(cascadeVariant('hidden',undefined),'hidden');assert.equal(cascadeVariant('hidden','visible'),'visible');
 assert.throws(()=>staggerSequence([],{stagger:-1}),RangeError);
});
test('animation controls update listeners and stop without retaining references',()=>{
 const control=createAnimationControls({opacity:0}),received=[];
 assert.equal(isAnimationControls(control),true);
 const off=control.subscribe((target,instant)=>received.push([target.opacity,instant]));
 control.start({opacity:1});control.set({opacity:0.3});assert.deepEqual(received,[[1,false],[0.3,true]]);
 off();control.start({opacity:0});assert.equal(received.length,2);
 control.stop();assert.deepEqual(control.get(),{opacity:0});
});
test('drag end passes true release velocity for momentum',()=>{
 const node=pointerNode();let result;
 const controller=drag(node,{onEnd:(_event,info)=>result=info,initialOffset:{x:20,y:0}});
 node.emit('pointerdown',{clientX:0,timeStamp:10});node.emit('pointermove',{clientX:40,timeStamp:30});
 node.emit('pointerup',{clientX:40,timeStamp:35});
 assert.equal(result.offset.x,60);assert.equal(result.velocity.x,2000);
 controller.setOffset({x:95,y:15});assert.deepEqual(controller.offset,{x:95,y:15});
 controller.stop();assert.equal(node.listenerCount(),0);
});
test('scroll exposes horizontal and vertical signals and cleans listeners',()=>{
 const oldWindow=globalThis.window,oldResize=globalThis.ResizeObserver;
 const node={scrollLeft:20,scrollTop:50,scrollHeight:300,clientHeight:100,scrollWidth:400,clientWidth:200,
   handlers:new Map(),addEventListener(event,fn){this.handlers.set(event,fn)},removeEventListener(event){this.handlers.delete(event)}};
 try{delete globalThis.window;delete globalThis.ResizeObserver;
  const handle=scroll(node);assert.equal(handle.progress.get(),.25);assert.equal(handle.scrollXProgress.get(),.1);
  assert.equal(handle.scrollY.get(),50);node.scrollTop=100;node.handlers.get('scroll')();assert.equal(handle.progress.get(),.5);
  handle.stop();assert.equal(node.handlers.size,0);
 }finally{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
 if(oldResize===undefined)delete globalThis.ResizeObserver;else globalThis.ResizeObserver=oldResize}
});
test('inView gracefully degrades outside browser and never changes styles',()=>{
 const previous=globalThis.IntersectionObserver;delete globalThis.IntersectionObserver;
 try{const node={style:{opacity:'1'}};const stop=inView(node,()=>{});stop();assert.equal(node.style.opacity,'1')}
 finally{if(previous!==undefined)globalThis.IntersectionObserver=previous}
});
test('React factory keeps core dependency-free and exposes new production APIs',()=>{
 const R={forwardRef:render=>render,useState:initial=>[typeof initial==='function'?initial():initial,()=>{}],
 createElement:(tag,props,...children)=>({tag,props,children})};
 const api=createReactMotion(R);
 assert.equal(typeof api.motion.section,'function');assert.equal(typeof api.MotionConfig,'function');
 assert.equal(typeof api.useAnimationControls,'function');
 const motionNode=api.motion.div({layoutId:'sidebar',dragMomentum:true,drag:'x',animate:{opacity:.7}},null);
 assert.equal(motionNode.tag,'div');assert.equal(motionNode.props.layoutId,undefined);
 assert.equal(motionNode.props.dragMomentum,undefined);assert.equal(motionNode.props.style.opacity,.7);
});

test('timeline builder coordinates named milestones and staggered steps',()=>{
 const fake={animate(_frames,options){return {options,currentTime:null,finished:Promise.resolve(),play(){},pause(){},reverse(){},finish(){},cancel(){}}}};
 const steps=createTimelineBuilder().label('intro',0).add(fake,[{opacity:0},{opacity:1}],{duration:100},'intro')
   .stagger([fake,fake],[{opacity:0},{opacity:1}],35,{duration:50},'intro+=120');
 assert.equal(steps.inspect().length,5);
 const controls=steps.build();assert.equal(controls.duration,205);
 assert.equal(controls.animations[2].options.delay,155);
 controls.cancel();
});

test('combined motion values update across multiple inputs and unsubscribe on stop',()=>{
 const a=motionValue(2),b=motionValue(3);
 const sum=combineMotionValues([a,b],(x,y)=>x+y);
 assert.equal(sum.get(),5);a.set(5);b.set(8);assert.equal(sum.get(),13);
 sum.stop();a.set(20);assert.equal(sum.get(),13);
 sum.destroy();a.destroy();b.destroy();
});


test('advanced staggered named variants preserve custom state and delay',()=>{
 const variants={show:(n)=>({x:n,opacity:1,transition:{duration:190,delay:20}})};
 const result=staggerVariants(['show','show','show'],variants,{stagger:40,delay:10,reverse:true,custom:i=>i*5});
 assert.deepEqual(result.map(x=>x.x),[0,5,10]);
 assert.deepEqual(result.map(x=>x.transition.delay),[110,70,30]);
 assert.equal(result[0].transition.duration,190);
 assert.throws(()=>staggerVariants([],variants,{stagger:-5}),RangeError);
});
