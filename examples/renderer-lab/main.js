import {createWebMotion} from '../../dist/es/web.js';
import {drawPath} from '../../dist/es/svg.js';
import {tweenCanvas} from '../../dist/es/canvas.js';
import {createMotionProfiler,mountMotionDevtools} from '../../dist/es/devtools.js';

const reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
const cards=document.querySelector('#cards');
const dom=createWebMotion({root:cards});
let svgAnimation=null,canvasAnimation=null;
const replayDOM=()=>{
  dom.cancel();dom.stagger('.floating-tile',[
    {transform:'translateY(20px) scale(.94)',opacity:0},
    {transform:'translateY(0) scale(1)',opacity:1},
  ],{duration:460,each:95,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
};
const replaySVG=()=>{
  svgAnimation?.cancel();
  svgAnimation=drawPath(document.querySelector('#signature'),{duration:960,easing:'cubic-bezier(.5,.1,.2,1)'});
};
const canvas=document.querySelector('#tween');const ctx=canvas.getContext('2d');
const replayCanvas=()=>{
  canvasAnimation?.cancel();
  canvasAnimation=tweenCanvas({x:42,radius:20,alpha:0.2},{x:452,radius:29,alpha:1},
    ({x,radius,alpha})=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#9994e733';ctx.fillRect(35,89,430,2);
      ctx.save();ctx.globalAlpha=alpha;
      const glow=ctx.createRadialGradient(x,90,0,x,90,radius*2.2);
      glow.addColorStop(0,'#f2f4ff');glow.addColorStop(.35,'#b9a9ff');glow.addColorStop(1,'#7163de00');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,90,radius*2.2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#cbb8ff';ctx.beginPath();ctx.arc(x,90,radius,0,Math.PI*2);ctx.fill();ctx.restore();
    },{duration:950,easing:p=>1-Math.pow(1-p,3),reducedMotion});
};
const profiler=createMotionProfiler({maxSamples:600,frameBudgetMs:16.67});profiler.start();
let hud=null;
const refresh=()=>{
  const s=profiler.snapshot();
  document.querySelector('#metric-fps').textContent=s.sampleCount?s.averageFps.toFixed(1):'—';
  document.querySelector('#metric-p95').textContent=s.sampleCount?`${s.p95FrameMs.toFixed(1)} ms`:'—';
  document.querySelector('#metric-slow').textContent=s.sampleCount?`${s.slowFramePercent.toFixed(1)}%`:'—';
  hud?.update();
};
const refreshInterval=window.setInterval(refresh,650);
document.querySelector('#replay-dom').addEventListener('click',replayDOM);
document.querySelector('#replay-svg').addEventListener('click',replaySVG);
document.querySelector('#replay-canvas').addEventListener('click',replayCanvas);
document.querySelector('#play-all').addEventListener('click',()=>{replayDOM();replaySVG();replayCanvas();});
document.querySelector('#toggle-hud').addEventListener('click',event=>{
  if(hud){hud.dispose();hud=null;event.currentTarget.textContent='Show developer HUD ↗';}
  else{hud=mountMotionDevtools(profiler);event.currentTarget.textContent='Hide developer HUD ↗';}
});
document.querySelector('#toggle-monitor').addEventListener('click',event=>{
  if(profiler.running){profiler.stop();document.querySelector('#profiler-status').textContent='Sampling paused';event.currentTarget.textContent='Resume sampler';}
  else{profiler.start();document.querySelector('#profiler-status').textContent='Sampling in renderer';event.currentTarget.textContent='Pause sampler';}
});
// Allow fonts/styles to settle before the initial entrance.
window.requestAnimationFrame(()=>{replayDOM();replaySVG();replayCanvas();});
window.addEventListener('pagehide',()=>{dom.dispose();svgAnimation?.cancel();canvasAnimation?.cancel();profiler.stop();hud?.dispose();clearInterval(refreshInterval);},{once:true});
