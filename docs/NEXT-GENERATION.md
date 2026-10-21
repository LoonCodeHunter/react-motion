# Next-generation motion utilities — candidate v1.0.0

These APIs are independent of React and do not automatically import third-party animation engines. All examples assume browser DOM access unless otherwise stated.

## New import paths

| Entry | Public API | Size and ownership design |
|---|---|---|
| `@kovari/react-motion/pan` | `pan`, gesture types | Event listeners + pointer capture; caller owns DOM transforms |
| `@kovari/react-motion/scroll-scrub` | `bindScrollAnimation` | Subscribes to MotionValue; caller owns `Animation` and source |
| `@kovari/react-motion/adapter-registry` | `createMotionAdapterRegistry` | Registers lazy async providers, caches each resolved instance |
| `@kovari/react-motion/inspector` | `createMotionInspector` | In-memory opt-in timings with explicit bounds |

## Gesture semantics and limits

`pan(element, {axis, threshold, velocityWindow, swipeDistance, swipeVelocity, onStart, onMove, onEnd, onCancel, onSwipe})` returns a cleanup function. All distances are CSS pixels. Velocity is CSS pixels/second across a recent input-sample window. `onStart` is deferred until the displacement threshold; `onEnd` is called only for started pans. A cancel never triggers swipe. Secondary button and non-primary pointer contacts are ignored. Callback exceptions propagate; use error boundaries at caller level if appropriate. Native pointer events may compete with scrolling, so configure `touch-action` on the element deliberately.

The package doesn't promise native mobile swipe navigation, screen reader interaction or cross-platform haptics.

## Scroll scrub contract

`bindScrollAnimation(progressValue, animation, {duration, range, easing, pause})` keeps `animation.currentTime` in sync with an observable signal. `range` is a progress interval `[start,end]` with strictly increasing bounds; values outside it clamp to the first/last frame. No browser `ScrollTimeline` API dependency is required. Easing must produce a finite progress fraction. The returned controller has `update()` and `stop()`; `stop()` unsubscribes and does not `cancel()` the animation.

## Lazy registry contract

`createMotionAdapterRegistry()` returns `register(name,factory,{replace?})`, `resolve(name)`, `has(name)`, `list()`, `remove(name)` and `clear()`. Factory results are checked for the `MotionEngineAdapter` interface, and simultaneous requests share a single in-flight factory promise. Errors allow retry. Removing or replacing a registration invalidates a pending result; there is no implicit animation cancellation or provider disposal.

This pattern is useful for loading Motion, custom Canvas/WebGL drivers, or experimental engines only on routes where they are actually needed. Dynamic imports of packages your app hasn't installed still fail; package installation is explicitly the host's responsibility.

## Inspector caveats

`createMotionInspector({enabled,maxRecords,frameBudgetMs,now})` collects bounded trace records; `start(label,category)` returns a finish function and `measure()` accepts manually obtained durations. `summary()` returns `{count,meanMs,p95Ms,maxMs,overBudget}`. Disable collection in sensitive views and never include secrets or user content in trace labels. The metric is not GPU timing, a browser frame profiler, a bundle-size metric or a Motion comparison.

## Verification / acceptance criteria

- Unit tests check callback order, pointer identity, velocity, cancellation and listener teardown.
- Unit tests check scrub clamping, errors, initial synchronization and ownership-preserving stop.
- Unit tests check lazy provider loading, concurrent deduplication, retry, replacement and stale resolution.
- Unit tests check inspector buffering, idempotent spans, disabled state and percentile computation.
- Integration tests in real browsers, React 18/19, reduced motion, touch hardware and comparable Motion benchmarks remain release gates.

See [production readiness](./PRODUCTION-READINESS.md), [adapter compatibility](./ADAPTER-COMPATIBILITY.md) and [feature parity](./FEATURE-PARITY.md).

## React hooks

For React applications, use `usePan(ref, options)` to attach listeners with callback refs and effect cleanup; numeric gesture configuration changes rebind listeners while a callback-function identity change alone does not. `useScrollScrub(source, animationRef, options)` binds a scroll signal to a controlled animation; it unsubscribes during unmount/reconfiguration. `useMotionInspector(options)` creates a trace inspector scoped to a component.

```tsx
import {useRef} from 'react';
import {usePan} from '@kovari/react-motion/react';

function SwipeCard() {
  const ref = useRef<HTMLDivElement>(null);
  usePan(ref, {axis:'x', onSwipe: (_, info) => console.log(info.direction)});
  return <div ref={ref} style={{touchAction:'pan-y'}}>Swipe horizontally</div>;
}
```

Hooks need React installed and must be used only in React function components; the primitive-only imports do not import React. See [React guide](./REACT-GUIDE.md).
