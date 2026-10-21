# React integration — complete developer guide

## Entry points

Use `@kovari/react-motion/react` for native React components and hooks, `@kovari/react-motion/react-adapter` for `createReactMotion(React)`, and `@kovari/react-motion/ui` for semantic prebuilt UI. The primitive-only root and focused subpaths never need React. Next.js App Router and comparable RSC systems require `'use client'` for hook-based/mounted animations.

## Component properties

| Prop | Meaning |
|---|---|
| `initial` / `animate` / `exit` | Entrance, current and exit visual states |
| `variants` / `custom` | Named and dynamic state definitions |
| `whileHover` / `whileTap` / `whileFocus` | Pointer and focus-driven state |
| `whileDrag` / `whileInView` | Drag and IntersectionObserver state |
| `transition` | Duration in **milliseconds**, easing or spring configuration |
| `drag`, `dragConstraints`, `dragMomentum` | Pointer dragging, bounds, inertia |
| `layout`, `layoutId` | Basic FLIP/shared layout measurement |
| `viewport` | IntersectionObserver `once`, amount and margin |
| `onAnimationStart`, `onAnimationComplete`, `onDragEnd` | Lifecycle hooks |

### Dynamic variant choreography

```tsx
'use client';
import { motion } from '@kovari/react-motion/react';
const states = {
  hidden: {opacity:0,y:18},
  visible: (i: unknown) => ({opacity:1,y:0,transition:{duration:280,delay:typeof i==='number'?i*50:0}}),
};
export function Results() {
  return <div>{['A','B','C'].map((name,i) =>
    <motion.div key={name} variants={states} custom={i} initial="hidden" animate="visible" whileHover={{scale:1.025}}>{name}</motion.div>
  )}</div>;
}
```

### Presence and exit

```tsx
import {motion,AnimatePresence} from '@kovari/react-motion/react';
const Panel=({visible}:{visible:boolean})=><AnimatePresence mode="wait">
  {visible && <motion.section key="panel" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>Panel</motion.section>}
</AnimatePresence>;
```

Presence supports **direct keyed Kovari motion components**, `sync`/`wait` timing, and exit callbacks. It does not promise full nested-tree propagation, cross-root animation, or transform correction in portals. Changes during rapid toggles need browser testing.

### Drag and momentum

```tsx
<motion.div drag="x" dragMomentum dragConstraints={{left:-120,right:120}} whileDrag={{scale:1.05}}
  onDragEnd={(_event,info)=>console.log(info.offset,info.velocity)} style={{touchAction:'none'}} />
```

A visual drag target is not a substitute for keyboard controls needed to complete a task. Use semantic buttons or dedicated reorder controls for assistive input.

### Hooks and signals

`useMotionValue(initial)` gives a persistent value; `useTransform(source, input, output)` maps numeric ranges; `useSpring(source, options)` derives a spring-smoothed value; `useMotionValueEvent(signal, callback)` subscribes in a React effect; `useScroll(ref)` exposes progress and offsets; `useReducedMotion()` reads the system preference; `useAnimationControls()` creates an imperative state controller. Styles can accept motion values, but avoid also writing to a property through a second animation engine.

### Layout, lifecycle, SSR

- FLIP `layout`/`layoutId` is a basic geometry solution, **not** mature deep layout projection.
- Animate only after element mount; DOM-dependent code cannot run during SSR.
- Preserve stable keys, cancel animations when routing away, and unsubscribe from external values.
- Do not mix `motion/react` elements and Kovari motion elements when expecting a shared layout/presence context.
- The current React `MotionProps` uses a broad index signature; strict native intrinsic typings are still a maturity gap.
- Validate hydration and browser behavior with **official React 18 and 19** before publishing stable v1.
