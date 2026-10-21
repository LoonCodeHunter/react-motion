import type { TransitionOptions, Variants } from './variants.js';
/** Production-oriented starting points; customise these to fit your product's motion language. */
export const transitionPresets: Readonly<Record<'instant'|'subtle'|'snappy'|'gentle'|'expressive'|'modal'|'notification'|'flow',TransitionOptions>>=Object.freeze({
  instant:{type:'tween',duration:0},
  subtle:{type:'tween',duration:160,easing:'ease-out'},
  snappy:{type:'spring',stiffness:360,damping:30,mass:1},
  gentle:{type:'spring',stiffness:170,damping:26,mass:1},
  expressive:{type:'spring',stiffness:260,damping:18,mass:1},
  modal:{type:'spring',stiffness:220,damping:27,mass:1},
  notification:{type:'spring',stiffness:310,damping:25,mass:1},
  flow:{type:'tween',duration:260,easing:'cubic-bezier(.2,.8,.2,1)'},
});
export const variantPresets: Readonly<Record<'fade'|'rise'|'scale'|'slideLeft'|'slideRight'|'pop'|'collapse',Variants>>=Object.freeze({
  fade:{hidden:{opacity:0},visible:{opacity:1}},
  rise:{hidden:{opacity:0,y:18},visible:{opacity:1,y:0}},
  scale:{hidden:{opacity:0,scale:0.94},visible:{opacity:1,scale:1}},
  slideLeft:{hidden:{opacity:0,x:28},visible:{opacity:1,x:0}},
  slideRight:{hidden:{opacity:0,x:-28},visible:{opacity:1,x:0}},
  pop:{hidden:{opacity:0,scale:.86},visible:{opacity:1,scale:1}},
  collapse:{hidden:{opacity:0,scaleY:.82},visible:{opacity:1,scaleY:1}},
});
