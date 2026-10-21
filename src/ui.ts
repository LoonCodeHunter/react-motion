'use client';
/** Optional React UI wrappers. No CSS is imported implicitly; consumers opt into /ui.css. */
import * as React from 'react';
import {motion} from './react-bindings.js';
import {transitionPresets,variantPresets} from './presets.js';
import type {MotionProps} from './react.js';

const cls=(base:string,extra?:string)=>[base,extra].filter(Boolean).join(' ');
export interface MotionUIProps extends MotionProps {className?:string;children?:any;disabled?:boolean;ref?:any}
export interface MotionProgressProps extends Omit<MotionUIProps,'value'> {value?:number;label?:string}
export interface MotionToggleProps extends MotionUIProps {
 pressed?:boolean;onPressedChange?:(pressed:boolean)=>void;
}

/** Native semantic button with focus-visible treatment and spring micro-interactions. */
export const MotionButton: (props:MotionUIProps)=>any=React.forwardRef((props:MotionUIProps,ref:any)=>{
 const {className,whileHover,whileTap,transition,disabled,...rest}=props;
 return React.createElement(motion.button,{
  ...rest,ref,disabled,className:cls('km-ui-button',className),
  whileHover:disabled?undefined:whileHover??{y:-2,scale:1.015},
  whileTap:disabled?undefined:whileTap??{scale:0.975},
  transition:transition??transitionPresets.snappy,
 });
});
/** Card with FLIP geometry transitions and optional hover lift. */
export const MotionCard:(props:MotionUIProps)=>any=React.forwardRef((props:MotionUIProps,ref:any)=>{
 const {className,whileHover,transition,...rest}=props;
 return React.createElement(motion.article,{
  layout:true,...rest,ref,className:cls('km-ui-card',className),
  whileHover:whileHover??{y:-4,scale:1.012},transition:transition??transitionPresets.gentle,
 });
});
/** One-time or repeatable viewport entrance with reduced-motion support. */
export const MotionReveal:(props:MotionUIProps)=>any=React.forwardRef((props:MotionUIProps,ref:any)=>{
 const {className,variants,initial,whileInView,viewport,transition,...rest}=props;
 return React.createElement(motion.div,{
  ...rest,ref,className:cls('km-ui-reveal',className),
  variants:variants??variantPresets.rise,initial:initial??'hidden',
  whileInView:whileInView??'visible',viewport:viewport??{once:true,amount:0.12},
  transition:transition??transitionPresets.gentle,
 });
});
/** Small status badge with scale/fade animation. */
export const MotionBadge:(props:MotionUIProps)=>any=React.forwardRef((props:MotionUIProps,ref:any)=>{
 const {className,initial,animate:target,transition,...rest}=props;
 return React.createElement(motion.span,{
  ...rest,ref,className:cls('km-ui-badge',className),
  initial:initial??{opacity:0,scale:0.92},animate:target??{opacity:1,scale:1},
  transition:transition??transitionPresets.subtle,
 });
});
/** ARIA-labelled determinate progress indicator. Value is clamped to 0..100. */
export const MotionProgress:(props:MotionProgressProps)=>any=React.forwardRef((props:MotionProgressProps,ref:any)=>{
 const {value=0,label='Progress',className,transition,...rest}=props;
 const percentage=Number.isFinite(value)?Math.max(0,Math.min(100,value)):0;
 return React.createElement('div',{...rest,ref,className:cls('km-ui-progress',className),
   role:'progressbar','aria-label':label,'aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':percentage},
   React.createElement(motion.div,{className:'km-ui-progress-fill',initial:{width:'0%'},
     animate:{width:`${percentage}%`},transition:transition??transitionPresets.subtle,'aria-hidden':true}));
});
/** Decorative loading surface. Provide accompanying screen-reader status for meaningful tasks. */
export const MotionSkeleton:(props:MotionUIProps)=>any=React.forwardRef((props:MotionUIProps,ref:any)=>{
 const {className,style={},...rest}=props;
 return React.createElement('span',{...rest,ref,'aria-hidden':true,
  className:cls('km-ui-skeleton',className),style});
});
/** Accessible pressed state using a real button; honors disabled and canceled clicks. */
export const MotionToggle:(props:MotionToggleProps)=>any=React.forwardRef((props:MotionToggleProps,ref:any)=>{
 const {pressed=false,onPressedChange,className,disabled,children,whileTap,onClick,...rest}=props;
 return React.createElement(motion.button,{...rest,ref,type:rest.type??'button',
  className:cls('km-ui-toggle',className),'aria-pressed':Boolean(pressed),disabled,
  whileTap:disabled?undefined:whileTap??{scale:.96},
  onClick:(event:any)=>{onClick?.(event);if(!event.defaultPrevented&&!disabled)onPressedChange?.(!pressed)}},
  React.createElement('span',{className:'km-ui-toggle-track','aria-hidden':true},
   React.createElement('span',{className:'km-ui-toggle-thumb'})),
  children??(pressed?'On':'Off'));
});
