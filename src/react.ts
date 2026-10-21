import {createAnimateAdapter, createMotionAdapter, type AnimateFunction, type MotionAdapterOptions, type MotionEngineAdapter} from './adapter-factory.js';
import {drag as attachDrag, type DragConstraints, type DragInfo} from './drag.js';
import {animateInertia, type InertiaOptions, type InertiaDriver} from './inertia.js';
import {resolveVariant, targetValues, type VariantInput, type Variants, type AnimationTarget, type TransitionOptions} from './variants.js';
import {toStyle, transformString, isTransform} from './transform.js';
import {createKeyframes} from './keyframes.js';
import {spring} from './spring.js';
import {motionValue, mapMotionValue, type MotionValue} from './motion-value.js';
import {springValue} from './spring-value.js';
import {scroll as attachScroll} from './scroll.js';
import {layout as animateLayout, measure, type Box} from './layout.js';
import {createSharedLayoutRegistry} from './shared-layout.js';
import {reconcilePresence, type PresenceMode, type PresenceItem} from './presence.js';
import {debug} from './debug.js';
import {createAnimationControls, isAnimationControls, type AnimationControls} from './controls.js';

/** A React-compatible adapter injected by the host; the root engine never loads React. */
export interface ReactLike {
  createElement(type:any,props:any,...children:any[]):any;
  forwardRef(render:(props:any,ref:any)=>any):any;
  useState<T>(initial:T|(()=>T)):[T,(next:T|((previous:T)=>T))=>void];
  useRef?<T>(initial:T):{current:T};
  useEffect?(effect:()=>void|(()=>void),deps?:readonly unknown[]):void;
  useLayoutEffect?(effect:()=>void|(()=>void),deps?:readonly unknown[]):void;
  useContext?<T>(context:any):T;
  createContext?<T>(defaultValue:T):any;
  Fragment?:any;
  Children?:{toArray(children:any):any[]};
  cloneElement?(element:any,props:any):any;
}
export interface MotionConfigProps {children?:any;reducedMotion?:'user'|'always'|'never'}
export interface MotionProps {
  as?:string;initial?:VariantInput;animate?:VariantInput|AnimationControls;exit?:VariantInput;
  variants?:Variants;custom?:unknown;
  whileHover?:VariantInput;whileTap?:VariantInput;whileFocus?:VariantInput;whileInView?:VariantInput;whileDrag?:VariantInput;
  transition?:TransitionOptions;style?:Record<string,any>;center?:boolean;
  drag?:boolean|'x'|'y';dragConstraints?:DragConstraints;
  dragMomentum?:boolean;dragTransition?:Omit<InertiaOptions,'velocity'>;
  layout?:boolean|'position'|'size';layoutId?:string;
  viewport?:{once?:boolean;amount?:number|'some'|'all';margin?:string};
  onDragStart?:(event:PointerEvent,info:DragInfo)=>void;
  onDrag?:(event:PointerEvent,info:DragInfo)=>void;
  onDragEnd?:(event:PointerEvent,info:DragInfo)=>void;
  onAnimationStart?:(target:AnimationTarget)=>void;
  onAnimationComplete?:(target:AnimationTarget)=>void;
  onViewportEnter?:(entry:IntersectionObserverEntry)=>void;
  onViewportLeave?:(entry:IntersectionObserverEntry)=>void;
  [key:string]:any;
}
export type MotionComponent=(props:MotionProps&{children?:any;ref?:any})=>any;
const mergeRefs=(...refs:any[])=>(node:any)=>{for(const ref of refs){if(typeof ref==='function')ref(node);else if(ref&&typeof ref==='object')ref.current=node}};
const isMV=(v:unknown):v is MotionValue<unknown>=>!!v&&typeof v==='object'&&typeof (v as MotionValue<unknown>).get==='function'&&typeof (v as MotionValue<unknown>).subscribe==='function';
const unwrapStyle=(style:Record<string,any>)=>Object.fromEntries(Object.entries(style).map(([k,v])=>[k,isMV(v)?v.get():v]));
const unitless=new Set(['opacity','zIndex','fontWeight','lineHeight','flexGrow','flexShrink','order','zoom','scale','scaleX','scaleY']);
function setInlineStyle(element:HTMLElement,key:string,value:unknown){
  if(value===undefined||value===null)return;
  const formatted=typeof value==='number'&&value!==0&&!unitless.has(key)&&!key.startsWith('--')?`${value}px`:String(value);
  if(key.startsWith('--'))element.style.setProperty(key,formatted);
  else (element.style as any)[key]=formatted;
}
/** Native Web Animations are interrupted and cancelled after finishing; inline target owns final state. */
function safeAnimation(element:HTMLElement,from:AnimationTarget,to:AnimationTarget,transition:TransitionOptions|undefined,
  reducedMotion:boolean,done?:()=>void):()=>void {
  const duration=reducedMotion?0:Math.max(0,transition?.duration??300);
  const before=toStyle(from),after=toStyle(to);
  const changed=Object.keys(after).some(key=>before[key]!==undefined&&!Object.is(before[key],after[key]));
  if(!changed||duration===0||typeof element.animate!=='function'){debug.log('react','animation-skipped',{changed,duration,hasWAAPI:typeof element.animate==='function'});done?.();return()=>{}};
  const start:AnimationTarget={},end:AnimationTarget={};
  for(const key of Object.keys(to)){if(from[key]!==undefined)start[key]=from[key];end[key]=to[key]}
  const springDuration=transition?.type==='spring'?spring({stiffness:transition.stiffness,damping:transition.damping,mass:transition.mass}).duration:duration;
  let animation:Animation;
  try{animation=element.animate(createKeyframes(start,end,transition),{
    duration:springDuration,delay:Math.max(0,transition?.delay??0),
    easing:transition?.type==='spring'?'linear':transition?.easing??'ease',fill:'both'
  })}catch(error){debug.log('react','animation-error',{reason:error instanceof Error?error.name:'unknown'});done?.();return()=>{}};
  let canceled=false;
  debug.log('react','animation-start',{duration:springDuration,propertyCount:Object.keys(to).length});
  void animation.finished.then(()=>{
    if(canceled)return;
    // End the animation effect so a filled WAAPI animation can't mask later inline changes.
    try{animation.cancel()}catch{/* node detached */}
    debug.log('react','animation-finish',{duration:springDuration});
    done?.();
  },()=>{/* interruption is normal */});
  return()=>{canceled=true;try{animation.cancel()}catch{/* node detached */}};
}
/** A complete binding factory for SSR-safe and testable React integrations. */
export function createReactMotionComponents(React:ReactLike){
  const variantContext=React.createContext?.<string|undefined>(undefined);
  const configContext=React.createContext?.<MotionConfigProps>({reducedMotion:'user'});
  const sharedLayout=createSharedLayoutRegistry();
  const useLayout=typeof window==='undefined'?React.useEffect:(React.useLayoutEffect??React.useEffect);
  const cache=new Map<string,MotionComponent>();
  function MotionConfig({children,reducedMotion='user'}:MotionConfigProps){
    return configContext?React.createElement(configContext.Provider,{value:{reducedMotion}},children):children;
  }
  function createMotionElement(tag:string):MotionComponent {
    const Component=React.forwardRef((props:MotionProps,forwardedRef:any)=>{
      const {as=tag,initial,animate:animateInput,exit,variants={},custom,whileHover,whileTap,whileFocus,whileInView,whileDrag,
        transition,style={},center=false,drag:enableDrag,dragConstraints,dragMomentum=false,dragTransition,layout:layoutEnabled,layoutId,viewport,
        onDragStart,onDrag,onDragEnd,onAnimationStart,onAnimationComplete,onViewportEnter,onViewportLeave,
        __presenceExiting=false,__onPresenceExit,onPointerEnter,onPointerLeave,onPointerDown,onPointerUp,onPointerCancel,
        onFocus,onBlur,onKeyDown,onKeyUp,...rest}=props;
      const [hovered,setHovered]=React.useState(false),[pressed,setPressed]=React.useState(false),
        [focused,setFocused]=React.useState(false),[inView,setInView]=React.useState(false),[dragging,setDragging]=React.useState(false);
      const [imperativeTarget,setImperativeTarget]=React.useState<VariantInput>(()=>isAnimationControls(animateInput)?animateInput.get():undefined);
      const [instant,setInstant]=React.useState(false);
      const inherited=variantContext&&React.useContext?React.useContext<string|undefined>(variantContext):undefined;
      const config=configContext&&React.useContext?React.useContext<MotionConfigProps>(configContext):{reducedMotion:'user'};
      const reduce=config?.reducedMotion==='always'||(config?.reducedMotion!=='never'&&(
        globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches??false));
      const domRef=React.useRef?.<HTMLElement|null>(null);
      const previousTarget=React.useRef?.<AnimationTarget|null>(null);
      const previousBox=React.useRef?.<Box|null>(null);
      const offset=React.useRef?.({x:0,y:0});
      const liveBase=React.useRef?.('');
      const cleanupAnimation=React.useRef?.<()=>void>(()=>{});
      const inertiaDrivers=React.useRef?.<InertiaDriver[]>([]);
      const control=isAnimationControls(animateInput)?animateInput:undefined;
      React.useEffect?.(()=>{
        if(!control)return;
        setImperativeTarget(control.get());
        return control.subscribe((value,immediate)=>{setInstant(immediate);setImperativeTarget(value)});
      },[control]);
      const supplied=control?imperativeTarget:(animateInput as VariantInput);
      const latest=__presenceExiting?exit:dragging&&whileDrag?whileDrag:pressed&&whileTap?whileTap:
        hovered&&whileHover?whileHover:focused&&whileFocus?whileFocus:inView&&whileInView?whileInView:supplied??inherited??initial;
      const resolved=resolveVariant(latest,variants,custom),target=targetValues(resolved);
      const effectiveTransition=instant?{...resolved.transition,...transition,duration:0}:{...transition,...resolved.transition};
      const from=targetValues(resolveVariant(initial===false?latest:initial??latest,variants,custom));
      const actualStyle=unwrapStyle(style);
      const baseValues:AnimationTarget={...target};
      for(const [key,value]of Object.entries(actualStyle))if(isTransform(key))baseValues[key]=value;
      const explicitTransform=typeof actualStyle.transform==='string'?actualStyle.transform:transformString(baseValues);
      if(liveBase)liveBase.current=explicitTransform;
      const delta=offset?.current??{x:0,y:0};
      const dragTransform=delta.x||delta.y?`translate(${delta.x}px, ${delta.y}px)`:'';
      const visualTransform=[explicitTransform,dragTransform].filter(Boolean).join(' ');
      const activeStyle:Record<string,any>={...toStyle(baseValues),...Object.fromEntries(Object.entries(actualStyle).filter(([key])=>!isTransform(key)))};
      if(visualTransform)activeStyle.transform=visualTransform;
      if(center)Object.assign(activeStyle,{display:'flex',alignItems:'center',justifyContent:'center'});
      const duration=reduce?0:effectiveTransition.duration??300;
      if(!activeStyle.transition)activeStyle.transition=['transform','opacity','filter','background-color','color'].map(name=>`${name} ${duration}ms ${effectiveTransition.easing??'ease'}`).join(', ');
      if(enableDrag){activeStyle.touchAction='none';activeStyle.userSelect='none';if(dragging)activeStyle.transition='none'}
      const targetKey=JSON.stringify(target),transitionKey=JSON.stringify(effectiveTransition);
      React.useEffect?.(()=>{
        const element=domRef?.current;
        if(!element){if(__presenceExiting)__onPresenceExit?.();return}
        const previous=previousTarget?.current??from;
        cleanupAnimation?.current?.();
        let finished=false;
        const notify=()=>{if(finished)return;finished=true;onAnimationComplete?.(target);if(__presenceExiting)__onPresenceExit?.()};
        onAnimationStart?.(target);
        if(cleanupAnimation)cleanupAnimation.current=safeAnimation(element,previous,target,effectiveTransition,reduce,notify);
        if(previousTarget)previousTarget.current={...target};
        if(__presenceExiting&&(!exit||!Object.keys(target).length))notify();
        return()=>cleanupAnimation?.current?.();
      },[targetKey,transitionKey,__presenceExiting,reduce]);
      useLayout?.(()=>{
        const element=domRef?.current;if(!element)return;
        if(layoutId)sharedLayout.enter(layoutId,element,{duration:reduce?0:(effectiveTransition.duration??300)});
        if(!layoutEnabled)return;
        const current=measure(element);
        if(previousBox?.current&&JSON.stringify(current)!==JSON.stringify(previousBox.current)){
          animateLayout(element,previousBox.current,{duration:reduce?0:(effectiveTransition.duration??300)},
            layoutEnabled==='position'?'position':layoutEnabled==='size'?'size':'both');
        }
        if(previousBox)previousBox.current=current;
      });
      useLayout?.(()=>{
        const element=domRef?.current;if(!element||!layoutId)return;
        return()=>sharedLayout.capture(layoutId,element);
      },[layoutId]);
      React.useEffect?.(()=>{
        const element=domRef?.current;if(!element||!enableDrag)return;
        const renderOffset=(x:number,y:number)=>{
          if(offset)offset.current={x,y};
          controller?.setOffset({x,y});
          element.style.transform=[liveBase?.current,x||y?`translate(${x}px, ${y}px)`:''].filter(Boolean).join(' ');
        };
        const stopInertia=()=>{inertiaDrivers?.current.forEach(driver=>driver.stop());if(inertiaDrivers)inertiaDrivers.current=[]};
        const controller=attachDrag(element,{
          axis:enableDrag===true?'both':enableDrag,constraints:dragConstraints,initialOffset:offset?.current,
          onStart(event,info){stopInertia();setDragging(true);element.style.transition='none';onDragStart?.(event,info)},
          onMove(event,info){renderOffset(info.offset.x,info.offset.y);onDrag?.(event,info)},
          onEnd(event,info){setDragging(false);element.style.transition=activeStyle.transition??'';onDragEnd?.(event,info);
            if(dragMomentum&&!reduce){
              for(const axis of ['x','y'] as const){if(enableDrag!==true&&enableDrag!==axis)continue;
                const bounds=axis==='x'?{min:dragConstraints?.left,max:dragConstraints?.right}:{min:dragConstraints?.top,max:dragConstraints?.bottom};
                const driver=animateInertia(info.offset[axis],{...bounds,...dragTransition,velocity:info.velocity[axis]},next=>{
                  const xy=offset?.current??{x:0,y:0};renderOffset(axis==='x'?next:xy.x,axis==='y'?next:xy.y);
                });inertiaDrivers?.current.push(driver);
              }
            }
          },
          onCancel(event,info){setDragging(false);element.style.transition=activeStyle.transition??'';onDragEnd?.(event,info)}
        });
        return()=>{controller.stop();stopInertia();element.style.transition=activeStyle.transition??''};
      },[enableDrag,JSON.stringify(dragConstraints??{}),dragMomentum,JSON.stringify(dragTransition??{}),reduce]);
      React.useEffect?.(()=>{
        const element=domRef?.current;if(!element||!whileInView||typeof IntersectionObserver==='undefined')return;
        const threshold=viewport?.amount==='all'?1:viewport?.amount==='some'?0:viewport?.amount??0;
        const observer=new IntersectionObserver(entries=>{
          for(const entry of entries){
            if(entry.isIntersecting){setInView(true);onViewportEnter?.(entry);if(viewport?.once)observer.unobserve(element)}
            else{setInView(false);onViewportLeave?.(entry)}
          }
        },{rootMargin:viewport?.margin??'0px',threshold});
        observer.observe(element);return()=>observer.disconnect();
      },[Boolean(whileInView),viewport?.amount,viewport?.margin,viewport?.once]);
      React.useEffect?.(()=>{
        const element=domRef?.current;if(!element)return;
        const signals=Object.entries(style).filter(([,v])=>isMV(v)) as [string,MotionValue<any>][];
        const render=()=>{
          const current=unwrapStyle(style),transforms:AnimationTarget={...target};
          for(const [name,value]of Object.entries(current))if(isTransform(name))transforms[name]=value;
          const base=typeof current.transform==='string'?current.transform:transformString(transforms);
          if(liveBase)liveBase.current=base;
          const delta=offset?.current??{x:0,y:0};
          const drag=delta.x||delta.y?`translate(${delta.x}px, ${delta.y}px)`:'';
          if(base||drag)element.style.transform=[base,drag].filter(Boolean).join(' ');
          for(const [name,signal]of signals)if(!isTransform(name))setInlineStyle(element,name,signal.get());
        };
        const unbind=signals.map(([,v])=>v.subscribe(render));render();return()=>unbind.forEach(fn=>fn());
      },[style,targetKey]);
      const composed:any={...rest,ref:mergeRefs(domRef,forwardedRef),style:activeStyle,
        onPointerEnter:(event:any)=>{if(event.pointerType!=='touch')setHovered(true);onPointerEnter?.(event)},
        onPointerLeave:(event:any)=>{setHovered(false);setPressed(false);onPointerLeave?.(event)},
        onPointerDown:(event:any)=>{if(event.button===0)setPressed(true);onPointerDown?.(event)},
        onPointerUp:(event:any)=>{setPressed(false);onPointerUp?.(event)},
        onPointerCancel:(event:any)=>{setPressed(false);onPointerCancel?.(event)},
        onFocus:(event:any)=>{setFocused(true);onFocus?.(event)},
        onBlur:(event:any)=>{setFocused(false);setPressed(false);onBlur?.(event)},
        onKeyDown:(event:any)=>{if(event.key==='Enter'||event.key===' ')setPressed(true);onKeyDown?.(event)},
        onKeyUp:(event:any)=>{if(event.key==='Enter'||event.key===' ')setPressed(false);onKeyUp?.(event)},
      };
      const node=React.createElement(as,composed);
      return variantContext&&typeof latest==='string'?
        React.createElement(variantContext.Provider,{value:latest},node):node;
    });
    (Component as any).__kovariMotion=true;
    return Component as MotionComponent;
  }
  const Div=createMotionElement('div');cache.set('div',Div);
  const DivCenter=React.forwardRef((props:any,ref:any)=>React.createElement(Div,{...props,center:true,ref}));
  const motion=new Proxy({}as Record<string,MotionComponent>,{get(_target,name:string){
    if(typeof name!=='string'||name==='then')return undefined;
    if(!cache.has(name))cache.set(name,createMotionElement(name));return cache.get(name);
  }});
  function useMotionValue<T>(initial:T):MotionValue<T>{
    const ref=React.useRef?.<MotionValue<T>|null>(null);
    if(!ref)throw Error('React.useRef is required for useMotionValue');
    if(!ref.current)ref.current=motionValue(initial);return ref.current;
  }
  function useTransform(source:MotionValue<number>,from:readonly number[],to:readonly number[]){
    const ref=React.useRef?.<ReturnType<typeof mapMotionValue>|null>(null);
    if(!ref)throw Error('React.useRef is required for useTransform');
    if(!ref.current)ref.current=mapMotionValue(source,from,to);
    React.useEffect?.(()=>()=>ref.current?.stop(),[source]);return ref.current;
  }
  function useSpring(source:MotionValue<number>,options:Parameters<typeof springValue>[1]={}){
    const ref=React.useRef?.<ReturnType<typeof springValue>|null>(null);
    if(!ref)throw Error('React.useRef is required for useSpring');
    if(!ref.current)ref.current=springValue(source,options);
    React.useEffect?.(()=>()=>ref.current?.stop(),[source]);return ref.current;
  }
  function useMotionValueEvent<T>(source:MotionValue<T>,callback:(value:T)=>void){
    React.useEffect?.(()=>source.on('change',callback),[source,callback]);
  }
  function useAnimationControls():AnimationControls{
    const ref=React.useRef?.<AnimationControls|null>(null);
    if(!ref)throw Error('React.useRef is required for useAnimationControls');
    if(!ref.current)ref.current=createAnimationControls();
    React.useEffect?.(()=>()=>ref.current?.stop(),[]);return ref.current;
  }
  function useReducedMotion():boolean{
    const [reduced,setReduced]=React.useState(false);
    React.useEffect?.(()=>{
      const media=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
      if(!media)return;setReduced(media.matches);
      const update=()=>setReduced(media.matches);
      media.addEventListener?.('change',update);
      return()=>media.removeEventListener?.('change',update);
    },[]);return reduced;
  }
  function useScroll(container?:{current:Element|null}){
    const scrollYProgress=useMotionValue(0),scrollXProgress=useMotionValue(0);
    const scrollY=useMotionValue(0),scrollX=useMotionValue(0);
    React.useEffect?.(()=>{
      if(container&&!container.current)return;
      if(!container&&typeof window==='undefined')return;
      const observer=attachScroll(container?.current??undefined);
      const pairs=[[observer.progress,scrollYProgress],[observer.scrollXProgress,scrollXProgress],
        [observer.scrollY,scrollY],[observer.scrollX,scrollX]] as const;
      const unbind=pairs.map(([source,dest])=>source.subscribe(()=>dest.set(source.get())));
      for(const [source,dest]of pairs)dest.set(source.get());
      return()=>{unbind.forEach(fn=>fn());observer.stop();for(const [signal]of pairs)signal.destroy()};
    },[container]);return{scrollYProgress,scrollXProgress,scrollY,scrollX};
  }
  function AnimatePresence({children,onExitComplete,mode='sync'}:{children:any;onExitComplete?:()=>void;mode?:PresenceMode}){
    if(!React.Children||!React.cloneElement||!React.useEffect||!React.useRef)return children;
    const current=React.Children.toArray(children);
    const requested=current.map((element:any)=>({key:String(element.key),value:element}));
    const signature=requested.map(item=>item.key).join('\u0000');
    const latest=React.useRef(requested);latest.current=requested;
    const [visible,setVisible]=React.useState<PresenceItem<any>[]>(()=>requested.map(item=>({...item,state:'enter'})));
    const hadExit=React.useRef(false);
    React.useEffect(()=>{
      setVisible(old=>{
        const updated=reconcilePresence(old,latest.current,mode);
        const animatable=updated.filter(item=>item.state!=='exit'||Boolean(item.value?.type?.__kovariMotion));
        const resolved=animatable.length===updated.length?updated:reconcilePresence(animatable,latest.current,mode);
        if(resolved.some(item=>item.state==='exit'))hadExit.current=true;
        return resolved;
      });
    },[signature,mode]);
    const complete=(key:string)=>{
      setVisible(old=>{
        const updated=reconcilePresence(old.filter(item=>item.key!==key),latest.current,mode);
        if(hadExit.current&&!updated.some(item=>item.state==='exit')){
          hadExit.current=false;
          // Callback is invoked after the state commit by a separate effect below.
          completed.current=true;
        }
        return updated;
      });
    };
    const completed=React.useRef(false);
    React.useEffect(()=>{if(completed.current){completed.current=false;onExitComplete?.()}},[visible]);
    const nodes=visible.map(item=>{
      if(item.state!=='exit')return item.value;
      if(!item.value.type?.__kovariMotion){
        // Only a direct motion child has a guaranteed exit completion callback.
        // Non-motion nodes cannot be animated safely, remove them immediately.
        return null;
      }
      return React.cloneElement!(item.value,{__presenceExiting:true,__onPresenceExit:()=>complete(item.key)});
    });
    return React.createElement(React.Fragment??'div',null,...nodes);
  }
  return {Div,DivCenter,motion,MotionConfig,AnimatePresence,useMotionValue,useTransform,useSpring,
    useMotionValueEvent,useAnimationControls,useReducedMotion,useScroll};
}

/** Accept React for declarative components or animate for an imperative driver. */
export function createReactMotion(React: ReactLike, options?: Omit<MotionAdapterOptions, 'react'>): ReturnType<typeof createReactMotionComponents> & {engine: MotionEngineAdapter};
export function createReactMotion(animate: AnimateFunction, options?: Omit<MotionAdapterOptions, 'animate'>): MotionEngineAdapter;
export function createReactMotion(input: ReactLike | AnimateFunction, options: MotionAdapterOptions = {}): unknown {
  if (typeof input === 'function') return createAnimateAdapter(input, options);
  if (!input || typeof input.createElement !== 'function' || typeof input.forwardRef !== 'function' || typeof input.useState !== 'function') {
    throw new TypeError('createReactMotion requires a React runtime or an animate function');
  }
  const react = createReactMotionComponents(input);
  const engine = createMotionAdapter({...options, react:input});
  return Object.assign(react, {engine});
}
