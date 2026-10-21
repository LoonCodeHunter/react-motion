export function hover(element:Element,onChange:(hovered:boolean)=>void){
 const enter=()=>onChange(true),leave=()=>onChange(false);
 element.addEventListener('pointerenter',enter);element.addEventListener('pointerleave',leave);
 return()=>{element.removeEventListener('pointerenter',enter);element.removeEventListener('pointerleave',leave)};
}
/** Pointer press state, including cancellation/leave and keyboard Space/Enter. */
export function press(element:Element,onChange:(pressed:boolean)=>void){
 const down=(e:Event)=>{if((e as PointerEvent).button===0)onChange(true)};
 const up=()=>onChange(false);
 const keydown=(e:Event)=>{if((e as KeyboardEvent).key==='Enter'||(e as KeyboardEvent).key===' ')onChange(true)};
 const keyup=(e:Event)=>{if((e as KeyboardEvent).key==='Enter'||(e as KeyboardEvent).key===' ')onChange(false)};
 element.addEventListener('pointerdown',down);element.addEventListener('pointerup',up);
 element.addEventListener('pointercancel',up);element.addEventListener('pointerleave',up);
 element.addEventListener('keydown',keydown);element.addEventListener('keyup',keyup);
 element.addEventListener('blur',up);
 return()=>{element.removeEventListener('pointerdown',down);element.removeEventListener('pointerup',up);
  element.removeEventListener('pointercancel',up);element.removeEventListener('pointerleave',up);
  element.removeEventListener('keydown',keydown);element.removeEventListener('keyup',keyup);element.removeEventListener('blur',up)};
}
export function focus(element:Element,onChange:(focused:boolean)=>void){
 const on=()=>onChange(true),off=()=>onChange(false);
 element.addEventListener('focusin',on);element.addEventListener('focusout',off);
 return()=>{element.removeEventListener('focusin',on);element.removeEventListener('focusout',off)};
}
