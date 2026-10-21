import { test } from 'node:test';
import assert from 'node:assert/strict';
import {createWebMotion} from '../dist/es/web.js';
import {animateSVG,drawPath} from '../dist/es/svg.js';
import {tweenCanvas} from '../dist/es/canvas.js';
import {createDesktopMotion} from '../dist/es/desktop.js';
import {createMotionProfiler} from '../dist/es/devtools.js';

const fakeElement = () => {
  const results=[];
  const element={results,animate(frames,opts){
    let ok,fail;
    const finished=new Promise((resolve,reject)=>{ok=resolve;fail=reject});
    const animation={frames,opts,finished,paused:0,playing:0,cancelled:0,
      pause(){this.paused++},play(){this.playing++},cancel(){this.cancelled++;fail(new Error('Cancelled'))},finish(){ok()}};
    results.push(animation);return animation;
  }};
  return element;
};

test('web API scopes selector lookup, staggers and cancels on disposal',async()=>{
  const first=fakeElement(),second=fakeElement();let selector;
  const scope=createWebMotion({root:{querySelectorAll(s){selector=s;return[first,second]}}});
  const result=scope.stagger('.tile',[{opacity:0},{opacity:1}],{duration:200,delay:10,each:50,start:5});
  assert.equal(selector,'.tile');assert.deepEqual(result.map(a=>a.opts.delay),[15,65]);
  assert.equal(scope.active,2);
  scope.pause();assert.equal(result[0].paused,1);
  scope.play();assert.equal(result[1].playing,1);
  scope.dispose();assert.equal(scope.active,0);assert.equal(scope.disposed,true);
  assert.equal(result[0].cancelled,1);
  assert.throws(()=>scope.animate(first,[],{}),/disposed/);
  await Promise.resolve();assert.equal(scope.active,0);
});

test('web API rollbacks partially successful animation batches',()=>{
  const el=fakeElement();const scope=createWebMotion();
  const broken={animate(){throw new Error('WAAPI unavailable')}};
  assert.throws(()=>scope.animate([el,broken],[]),/WAAPI unavailable/);
  assert.equal(el.results[0].cancelled,1);assert.equal(scope.active,0);
  assert.throws(()=>scope.stagger(el,[],{each:-2}),/Stagger/);
});

test('SVG path draw uses path length and restores style after cancellation', async()=>{
  const path=fakeElement();path.style={strokeDasharray:'12',strokeDashoffset:'4'};path.getTotalLength=()=>140;
  const animation=drawPath(path,{duration:900});
  assert.equal(path.style.strokeDasharray,'140');
  assert.equal(animation.frames[0].strokeDashoffset,'140');
  assert.equal(animation.frames[1].strokeDashoffset,'0');
  animation.cancel();await Promise.resolve();await Promise.resolve();
  assert.equal(path.style.strokeDasharray,'12');assert.equal(path.style.strokeDashoffset,'4');
  assert.equal(animateSVG(path,[{opacity:0},{opacity:1}],{duration:110}).opts.duration,110);
  assert.throws(()=>drawPath({...path,getTotalLength:()=>0}),/positive/);
});

function clock(){let now=0,id=0;const q=new Map();return{
  scheduler:{now:()=>now,request:fn=>{q.set(++id,fn);return id},cancel:n=>q.delete(n)},
  tick(t){now=t;const callbacks=[...q.values()];q.clear();callbacks.forEach(fn=>fn(t))},get queued(){return q.size},
}}

test('Canvas tween interpolates, pauses, resumes, seeks and settles without exceptions',async()=>{
  const c=clock();let value=NaN;
  const animator=tweenCanvas({x:0},{x:100},next=>{value=next.x},{duration:100,easing:t=>t,scheduler:c.scheduler});
  assert.equal(animator.state,'running');c.tick(40);assert.equal(value,40);
  animator.pause();assert.equal(c.queued,0);c.tick(70);assert.equal(value,40);
  animator.play();c.tick(100);assert.equal(value,70);c.tick(130);assert.equal(value,100);
  assert.equal(await animator.finished,'finished');assert.equal(animator.state,'finished');
  const delayed=tweenCanvas({x:0},{x:10},next=>{value=next.x},{duration:100,delay:50,easing:t=>t,scheduler:c.scheduler});
  c.tick(150);assert.equal(value,0);c.tick(200);assert.equal(value,2); // 20ms since 180 start
  delayed.seek(.75);assert.equal(value,7.5);delayed.cancel();assert.equal(await delayed.finished,'cancelled');
});

test('desktop renderer pauses in the background and removes visibility listener',()=>{
  const listeners=new Map();const document={hidden:false,addEventListener:(name,cb)=>listeners.set(name,cb),removeEventListener:name=>listeners.delete(name)};
  const animator=createDesktopMotion({document});const element=fakeElement();
  animator.animate(element,[{opacity:0},{opacity:1}]);
  document.hidden=true;listeners.get('visibilitychange')();
  assert.equal(animator.backgrounded,true);assert.equal(element.results[0].paused,1);
  document.hidden=false;listeners.get('visibilitychange')();assert.equal(element.results[0].playing,1);
  animator.dispose();assert.equal(listeners.size,0);assert.equal(animator.disposed,true);
});

test('profiler produces bounded percentile metrics without starting automatically',()=>{
  let next;let canceled=0;
  const profiler=createMotionProfiler({frameBudgetMs:20,maxSamples:3,requestFrame:fn=>{next=fn;return 1},cancelFrame:()=>canceled++});
  assert.equal(profiler.snapshot().averageFps,0);assert.equal(profiler.running,false);
  profiler.start();next(0);next(10);next(30);next(70);next(80);
  const report=profiler.snapshot();assert.equal(report.sampleCount,3);
  assert.equal(report.p95FrameMs,40);assert.equal(report.slowFrames,1);
  assert.ok(report.averageFps>0);profiler.stop();assert.equal(canceled,1);
  profiler.reset();assert.equal(profiler.snapshot().sampleCount,0);
  assert.throws(()=>createMotionProfiler({frameBudgetMs:0}),/positive/);
});

test('reduced-motion web scope removes staggered delays',()=>{
  const first=fakeElement(),second=fakeElement();
  const scope=createWebMotion({reducedMotion:true});
  const animations=scope.stagger([first,second],[{opacity:0},{opacity:1}],{duration:500,delay:150,start:20,each:90});
  assert.deepEqual(animations.map(a=>[a.opts.duration,a.opts.delay]),[[0,0],[0,0]]);
  scope.dispose();
});

test('replaying SVG path drawing does not let old cancellation overwrite new geometry', async()=>{
  const path=fakeElement();path.style={strokeDasharray:'original',strokeDashoffset:'original'};
  path.getTotalLength=()=>150;
  const old=drawPath(path);
  const next=drawPath(path);
  assert.equal(old.cancelled,1);
  await Promise.resolve();await Promise.resolve();
  assert.equal(path.style.strokeDasharray,'150');
  assert.equal(path.style.strokeDashoffset,'0');
  next.cancel();await Promise.resolve();await Promise.resolve();
  assert.equal(path.style.strokeDasharray,'original');
});
