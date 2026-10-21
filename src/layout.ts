export interface Box{x:number;y:number;width:number;height:number}
export const measure=(element:Element):Box=>{
  const r=element.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};
};
/** Perform an inverted FLIP transition. Keeps CSS transforms finite for zero-sized elements. */
export function layout(element:HTMLElement,before:Box,options:KeyframeAnimationOptions={},mode:'both'|'position'|'size'='both'):Animation|null {
  const after=measure(element);
  if(!after.width||!after.height||!before.width||!before.height||typeof element.animate!=='function')return null;
  const dx=mode==='size'?0:before.x-after.x,dy=mode==='size'?0:before.y-after.y;
  const sx=mode==='position'?1:before.width/after.width,sy=mode==='position'?1:before.height/after.height;
  if(!Number.isFinite(sx)||!Number.isFinite(sy))return null;
  const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches??false;
  const finalTransform=element.style.transform||'none';
  const inverted=`translate(${dx}px,${dy}px) scale(${sx},${sy})`;
  const animation=element.animate([
    {transformOrigin:'top left',transform:finalTransform==='none'?inverted:`${inverted} ${finalTransform}`},
    {transformOrigin:'top left',transform:finalTransform}
  ],{easing:'cubic-bezier(.2,.8,.2,1)',fill:'both',...options,duration:reduced?0:(options.duration??300)});
  // Never leave a filled transform masking later animations or React style updates.
  void animation.finished.then(()=>{try{animation.cancel()}catch{}},()=>{});
  return animation;
}
