import {motionValue} from './motion-value.js';
const clamp01=(n:number)=>Math.max(0,Math.min(1,n));
/** Window or container scroll signals. 0..1 progress values and absolute px offsets. */
export function scroll(container?:Element|Window){
  const root=container??(typeof window!=='undefined'?window:undefined);
  if(!root)throw new Error('scroll() requires a browser or explicit container');
  const progress=motionValue(0),scrollY=motionValue(0),scrollX=motionValue(0),scrollXProgress=motionValue(0);
  const isWindow=typeof window!=='undefined'&&root===window;
  const update=()=>{
    const el=isWindow?document.documentElement:root as Element;
    const top=isWindow?window.scrollY:el.scrollTop;
    const left=isWindow?window.scrollX:el.scrollLeft;
    const availableY=Math.max(0,el.scrollHeight-el.clientHeight);
    const availableX=Math.max(0,el.scrollWidth-el.clientWidth);
    scrollY.set(top);scrollX.set(left);
    progress.set(availableY>0?clamp01(top/availableY):0);
    scrollXProgress.set(availableX>0?clamp01(left/availableX):0);
  };
  root.addEventListener('scroll',update,{passive:true});
  const resize=typeof window!=='undefined'?window:undefined;
  resize?.addEventListener('resize',update,{passive:true});
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(update):null;
  observer?.observe(isWindow?document.documentElement:root as Element);
  update();
  return {progress,scrollY,scrollX,scrollXProgress,update,stop(){
    root.removeEventListener('scroll',update);resize?.removeEventListener('resize',update);observer?.disconnect();
  }};
}
