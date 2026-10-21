# v1 Release Candidate: API and architectural guide

**Package:** `@kovari/react-motion` v1.0.0-rc.1. Units use **milliseconds**, unlike some React animation libraries that use seconds. `motion.*` requires React as a peer; the core is usable without React.

## Imports

```ts
import {animate, timeline, spring, motionValue, createTimelineBuilder} from '@kovari/react-motion';
import {drag} from '@kovari/react-motion/drag';
import {stepInertia, animateInertia} from '@kovari/react-motion/inertia';
import {createSharedLayoutRegistry} from '@kovari/react-motion/shared-layout';
import {motion, MotionConfig, AnimatePresence, useAnimationControls} from '@kovari/react-motion/react';
import {MotionButton, MotionProgress, MotionToggle} from '@kovari/react-motion/ui';
```

### Motion components

```tsx
import {motion,AnimatePresence,MotionConfig} from '@kovari/react-motion/react';
const states = {
  closed: {opacity:0,y:18},
  open: {opacity:1,y:0,transition:{type:'spring',stiffness:260,damping:26}},
};
function Panel({open}:{open:boolean}){
  return <MotionConfig reducedMotion="user"><AnimatePresence mode="wait">
    {open&&<motion.aside key="panel" initial="closed" animate="open" exit="closed"
      variants={states} whileHover={{scale:1.01}} layout>Content</motion.aside>}
  </AnimatePresence></MotionConfig>;
}
```

`MotionConfig.reducedMotion` accepts `user` (OS preference), `always` or `never`. Override to `never` only with careful accessibility review. `AnimatePresence` supports `sync` and `wait`, **direct motion children**; nested coordination requires further work.

### Drag + inertia

```tsx
<motion.div drag="x" dragMomentum dragTransition={{friction:8,bounceStiffness:320}}
  dragConstraints={{left:-120,right:120}} whileDrag={{scale:1.04}}
  onDragEnd={(_event,info)=>console.log(info.velocity.x)}>Drag</motion.div>
```

Constraint edges are coordinates relative to the starting offset, in pixels. `dragMomentum` is opt-in (default `false`) for backward compatibility. Inertial position is an additional offset after the base `animate`/`style` transform; when feeding `onDrag` positions into your own motion value, do not also use the same value as an X/Y transform on the same element or you will double the translation.

### Timeline builder

```ts
const t=createTimelineBuilder()
  .label('intro',0)
  .add(document.querySelector('.hero')!,[{opacity:0},{opacity:1}],{duration:300},'intro')
  .stagger([...document.querySelectorAll('.chip')],[{opacity:0},{opacity:1}],50,{duration:200},'intro+=150')
  .build();
t.play();t.seek(200);t.pause();
```

Builder construction is inert until `.build()`; `timeline()` remains available for declarative sequences. Times are milliseconds. `seek(ms)` applies the timeline's global time to all native animations.

### Motion value composition

```ts
const x=motionValue(0),y=motionValue(0);
const distance=combineMotionValues([x,y],(a,b)=>Math.hypot(a,b));
x.set(30);y.set(40);console.log(distance.get()); // 50
distance.stop();distance.destroy();x.destroy();y.destroy();
```

### Shared layout

`layoutId="hero-card"` captures geometry on unmount and animates a later mounted element with the same ID in the **same React adapter scope**. `layout` independently animates movement and size of a single element. The registry stores only geometry snapshots, not detached DOM elements. For advanced crossfades, nested projections, or complex list reorder behaviour, use a specialised library until Kovari's projection system matures.

### React hooks

`useMotionValue`, `useTransform`, `useSpring`, `useMotionValueEvent`, `useAnimationControls`, `useScroll`, `useReducedMotion` are available from `/react`. `useScroll` returns `{scrollX,scrollY,scrollXProgress,scrollYProgress}`. Use from client components (`'use client'`).

### UI components

`MotionButton`, `MotionCard`, `MotionReveal`, `MotionBadge`, `MotionProgress`, `MotionToggle`, `MotionSkeleton` from `/ui` and opt-in styles from `/ui.css`. Progress uses `0..100` with ARIA progressbar metadata. Toggle uses a real button and `aria-pressed`. Skeleton is decorative and hidden from screen readers—supply adjacent live-status text when loading is meaningful.

## Cleanup contract

- DOM primitives return `Animation` objects; call `.cancel()` on interruption.
- Drag, hover, focus and in-view utilities return `stop()`/cleanup functions.
- Inertia and frame drivers expose `.stop()`/`.cancel()` and `.finished`.
- Derived values expose `.stop()` to unsubscribe; `.destroy()` to dispose listeners.
- Timelines expose `.cancel()`; layouts clear their own finished WAAPI effect.

## Errors and diagnostics

Physics validates finite timings and bounds. Presence rejects duplicated keys. Verify the package lockfile before CI with `npm run verify:lockfile` and run the complete suite using `npm run release:check`.
