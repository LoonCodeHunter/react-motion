import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveVariant, targetValues } from '../dist/es/variants.js';
import { interpolate } from '../dist/es/interpolate.js';
import { motionValue, mapMotionValue } from '../dist/es/motion-value.js';
import { spring } from '../dist/es/spring.js';
import { createKeyframes } from '../dist/es/keyframes.js';
import { transformString } from '../dist/es/transform.js';
import { frameAdapter } from '../dist/es/adapters.js';
import { drag } from '../dist/es/drag.js';
import { timeline } from '../dist/es/timeline.js';
import { createReactMotion } from '../dist/es/react.js';

function fakeTarget() {
 const listeners = new Map();
 return {
  style:{touchAction:''},
  addEventListener(name,fn){listeners.set(name,fn)},
  removeEventListener(name,fn){if(listeners.get(name)===fn)listeners.delete(name)},
  emit(name,info={}){listeners.get(name)?.({type:name,button:0,pointerId:1,clientX:0,clientY:0,timeStamp:0,...info})},
  listenerCount(){return listeners.size},
  setPointerCapture(){},releasePointerCapture(){},hasPointerCapture(){return true},
 };
}
test('variant arrays compose and dynamic variants receive custom data',()=>{
 const variants={hidden:{opacity:0,x:-20},show:c=>({opacity:1,x:c.x,transition:{duration:400}})};
 const merged=resolveVariant(['hidden','show'],variants,{x:50});
 assert.deepEqual(targetValues(merged),{opacity:1,x:50});
 assert.equal(merged.transition.duration,400);
 assert.equal(resolveVariant('missing',variants).opacity,undefined);
 assert.equal(variants.hidden.opacity,0);
});
test('interpolation clamps by default and validates inputs',()=>{
 assert.equal(interpolate(2,[0,10],[0,100]),20);
 assert.equal(interpolate(-100,[0,10],[0,100]),0);
 assert.ok(Math.abs(interpolate(11,[0,10],[0,100],{clamp:false})-110)<1e-9);
 assert.throws(()=>interpolate(1,[0,0],[0,1]),RangeError);
 assert.throws(()=>interpolate(1,[0,2],[1]),RangeError);
});
test('derived motion values unsubscribe and support change events',()=>{
 const source=motionValue(0),scaled=mapMotionValue(source,[0,10],[0,100]);
 let events=0;const off=scaled.on('change',()=>events++);
 source.set(5);assert.equal(scaled.get(),50);assert.equal(events,1);
 off();scaled.stop();source.set(6);assert.equal(scaled.get(),50);
 scaled.destroy();source.destroy();
});
test('spring solves all damping regimes and rejects invalid input',()=>{
 for(const damping of [4,20,40,100]){
   const curve=spring({stiffness:100,mass:1,damping});
   assert.equal(curve.at(0),0);
   assert.ok(Math.abs(curve.at(12000)-1)<0.01,`damping=${damping}`);
   assert.ok(curve.sample(10).every(Number.isFinite));
 }
 assert.throws(()=>spring({velocity:NaN}),RangeError);
 assert.throws(()=>spring().sample(0),RangeError);
});
test('spring generates finite WAAPI frames including transform coordinates',()=>{
 const frames=createKeyframes({x:0,opacity:0,scale:0.5},{x:80,opacity:1,scale:1},{type:'spring',stiffness:180,damping:16});
 assert.ok(frames.length>=20);assert.match(frames[0].transform,/translateX\(0px\)/);
 assert.match(frames.at(-1).transform,/translateX\(/);
 assert.equal(frames[0].opacity,0);
 assert.ok(Math.abs(frames.at(-1).opacity-1)<0.01);
 assert.equal(createKeyframes({opacity:0},{opacity:1}).length,2);
 assert.equal(transformString({x:2,rotate:30}),'translateX(2px) rotate(30deg)');
});
test('drag tracks constrained offsets and cleans up pointer listeners',()=>{
 const target=fakeTarget(),moves=[];
 const handle=drag(target,{axis:'x',constraints:{left:-10,right:20},onMove:(_e,info)=>moves.push(info)});
 target.emit('pointerdown',{clientX:10,clientY:0,timeStamp:0});
 target.emit('pointermove',{clientX:50,clientY:100,timeStamp:10});
 assert.deepEqual(handle.offset,{x:20,y:0});
 assert.equal(moves[0].velocity.y,0);
 target.emit('pointerup',{clientX:50,clientY:100,timeStamp:11});
 handle.stop();assert.equal(target.style.touchAction,'');assert.equal(target.listenerCount(),0);
});
test('timeline supports labels, relative offsets, seek, and cancellation',()=>{
 const animations=[];
 const el={animate(_frames,opts){const a={opts,currentTime:null,finished:Promise.resolve(),play(){},pause(){},reverse(){},cancel(){},finish(){}};animations.push(a);return a}};
 const controls=timeline([
  {target:el,keyframes:[{opacity:0},{opacity:1}],options:{duration:100}},
  {label:'swap',at:'-=' + 20},
  {target:el,keyframes:[{opacity:0},{opacity:1}],options:{duration:200},at:'swap+=10'},
  {target:el,keyframes:[{opacity:0},{opacity:1}],options:{duration:50},at:'<'},
 ]);
 assert.equal(controls.duration,290);
 assert.equal(animations[1].opts.delay,90);
 assert.equal(animations[2].opts.delay,90);
 controls.seek(42);assert.equal(animations[1].currentTime,42);controls.cancel();
 assert.throws(()=>timeline([{target:el,keyframes:[{}],at:'missing'}]),/Unknown timeline label/);
});
test('frame renderer supports pause, resume and completion without timers',async()=>{
 const oldRaf=globalThis.requestAnimationFrame,oldCaf=globalThis.cancelAnimationFrame;
 const frames=new Map();let seq=0;
 globalThis.requestAnimationFrame=fn=>{frames.set(++seq,fn);return seq};
 globalThis.cancelAnimationFrame=id=>frames.delete(id);
 const tick=ms=>{const entries=[...frames.values()];frames.clear();entries.forEach(fn=>fn(ms))};
 try{
  const values=[];const a=frameAdapter({duration:100,onUpdate:p=>values.push(p)});
  a.play();tick(0);tick(25);a.pause();a.play();tick(50);tick(125);
  await a.finished;
  assert.equal(values.at(-1),1);
  assert.ok(values.some(v=>v>.2&&v<.6));
 }finally{if(oldRaf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=oldRaf;
  if(oldCaf===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=oldCaf;}
});
test('React adapter exposes motion tags, preserves event callbacks and drag props',()=>{
 const fakeReact={forwardRef:render=>render,useState:value=>[value,()=>{}],createElement:(type,props,...children)=>({type,props,children})};
 const {motion,Div}=createReactMotion(fakeReact);
 let entered=0;
 const component=motion.button;
 assert.equal(component,motion.button);
 const rendered=component({animate:{opacity:1,x:20},onPointerEnter(){entered++},drag:'x',style:{color:'red'}},null);
 assert.equal(rendered.type,'button');assert.equal(rendered.props.style.opacity,1);
 assert.equal(rendered.props.style.transform,'translateX(20px)');
 rendered.props.onPointerEnter({});assert.equal(entered,1);
 assert.equal(rendered.props.drag,undefined);
 assert.ok(Div);
});
