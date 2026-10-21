# API Reference (v1.0.0 source candidate)

**Units:** unless noted, animation durations and timeline offsets use **milliseconds**.

## React subpath `@kovari/react-motion/react`

- `motion.div`, `motion.button`, etc.: generated HTML motion components.
- `initial`, `animate`, `exit`, `whileHover`, `whileTap`, `whileFocus`, `whileInView`, `whileDrag`: animation targets or named variants.
- `variants`: map of named states; values may be functions receiving `custom`.
- `transition`: `{ type?: 'spring' | 'tween', duration?, easing?, stiffness?, damping?, mass?, delay? }`.
- `drag`: boolean or `'x'` / `'y'`; `dragConstraints`: `{left?,right?,top?,bottom?}` in pixels; `onDragStart`, `onDrag`, `onDragEnd` receive pointer event and drag info.
- `viewport`: `{ once?, amount?, margin? }` for `whileInView`.
- `layout`: FLIP changes of a mounted element; `layoutId` supports basic shared-geometry snapshots but not advanced projection across roots/portals.
- `AnimatePresence`: direct, keyed motion children with `exit` targets; `onExitComplete` callback.
- `useMotionValue(initial)`: stable value object with `.get()`, `.set()`, `.jump()`, `.subscribe()`, `.getVelocity()`, `.destroy()`.
- `useTransform(value, inputRange, outputRange)`: derived mapped signal.
- `useSpring(value, options)`: physically-driven derived numeric signal.
- `useScroll(ref?)`: returns `{scrollYProgress, scrollXProgress, scrollY, scrollX}`; cleans up event listeners.
- `useReducedMotion()`: observes accessibility media preference.
- `useMotionValueEvent(value, callback)`: listens for numeric/string value changes.

### Variants

```tsx
const variants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
  selected: ({ scale }: any) => ({ scale }),
};
<motion.div variants={variants} initial="hidden" animate="visible" custom={{scale:1.08}} />;
```

Named arrays merge left to right. Transition overrides are provided within named variants or on the component.

## Vanilla DOM / model APIs

- `animate(element, keyframes, options)`: returns the native `Animation`; use `.finished`, `.pause()`, `.cancel()` etc.
- `stagger(gap, start=0)`: index-to-delay callback in milliseconds.
- `spring(options)`: solver with `.at(ms)`, `.duration`, `.sample(count)`; under-, critical and overdamped springs.
- `springValue(source, options)`: derived motion value running a damped spring in RAF; `.stop()` cancels it.
- `createKeyframes(from, to, transition)`: sampled transform/opacity frames, including springs.
- `motionValue(initial)`, `deriveMotionValue(source, mapper)`, `mapMotionValue(source, input, output)`.
- `mix`, `clamp`, `interpolate` for numeric ranges; out-of-range values clamp unless `{clamp:false}`.
- `drag(el, options)` with `{axis,constraints,onStart,onMove,onEnd,onCancel}`; returns `{offset,stop}`.
- `hover`, `press`, `focus` return cleanup functions.
- `scroll(container?)` returns `{progress, scrollY, scrollX, scrollXProgress, update, stop}`.
- `measure(element)` and `layout(element,before,options)` for FLIP geometry.
- `timeline(segments)` supports at positions `number`, `'<'` (previous start), `'+=N'`, `'-=N'`, labels, and `'label+=N'`. Returns `.duration`, `.animations`, `.play()`, `.pause()`, `.reverse()`, `.cancel()`, `.finish()`, `.seek(ms)`, `.finished`.
- `frameAdapter({onUpdate, duration, delay, ...})` returns a renderer-neutral control object.
- `animateNumber(from,to,callback,options)` and `animateObject(object,key,value,options)` animate numeric models.
- `animateCanvas(ctx,draw,options)` calls `draw(ctx,progress)` on frames; Canvas state remains caller-owned.
- `transitionPresets` and `variantPresets`: optional starting styles.

## Accessibility guidance

Reduced-motion checks suppress native FLIP/WAAPI durations when the browser preference requires it. Keyboard handlers are supplied for press/focus. Consumers must still supply semantic controls, readable focus rings, alternatives to drag-only interactions, and appropriate touch targets.

## Opt-in UI components

Import `MotionButton`, `MotionCard`, `MotionReveal`, `MotionBadge`, `MotionProgress`, `MotionToggle`, `MotionSkeleton` from `@kovari/react-motion/ui`, plus optional `@kovari/react-motion/ui.css`. Components use semantic `button`, `article`, `div`, and `span` elements and can be styled through `.km-ui-*` and CSS variables. They are convenience wrappers, not substitutes for a complete component accessibility review.

## External provider bridge (v1.0.0)

Import `createReactMotionBridge`, `createMotionProviderAdapter`, `fromExternalMotionValue`, and `syncToExternalMotionValue` from `@kovari/react-motion/provider-bridge` or the primitive-only root.

- `createReactMotionBridge({motion, AnimatePresence?, MotionConfig?, name?})` retains the original components, returns a frozen bridge and exposes capabilities for provider-supplied presence/config. It **does not implement** or translate external animation properties itself.
- `fromExternalMotionValue(external)` supports `.get()` plus a change listener (`.on('change', cb)` or `.subscribe(cb)` returning cleanup). Returns `{value, stop}`.
- `syncToExternalMotionValue(local, external)` pushes updates one-way to a value with `.set()` and returns an unsubscribe function.

No external provider or React dependency is imported by the bridge. See [ADAPTERS.md](./ADAPTERS.md).
