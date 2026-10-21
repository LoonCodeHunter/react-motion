# Kovari Motion v1.0.0 — API surfaces

> **Source/API reference.** This document describes the source files in this archive, not the package currently available from the public npm `latest` tag. All timings throughout the library are **milliseconds** unless indicated otherwise.

## Which entry point should you import?

| Consumer | Entry point | Runtime expectation | Key features |
|---|---|---|---|
| React 18 / 19 | `@kovari/react-motion/react` | React client environment | `motion`, `AnimatePresence`, `MotionConfig`, hooks, `usePan` and `useMotionInspector` |
| Plain JS or TS | `@kovari/react-motion/web` | DOM and Web Animations | `createWebMotion()`; scoped selectors, staggering and disposal |
| SVG | `@kovari/react-motion/svg` | SVG DOM and Web Animations | `animateSVG()`, `drawPath()` |
| Canvas 2D / WebGL / custom | `@kovari/react-motion/canvas` | `requestAnimationFrame` or injected scheduler | `tweenCanvas()` frame values, pause, seek, reverse, cancellation |
| Electron / Tauri renderer | `@kovari/react-motion/desktop` | WebView renderer | `createDesktopMotion()` with visibility-related pause |
| Profiling | `@kovari/react-motion/devtools` | rAF; DOM only for HUD | `createMotionProfiler()`, `mountMotionDevtools()` |
| Debug records | `@kovari/react-motion/debug` | JS runtime | `debug`, `createDebugSession()` |
| Low-level primitives | `@kovari/react-motion` | Mostly browser-agnostic | `spring`, `motionValue`, `stagger`, `timeline`, etc. |

**Do not import `@kovari/react-motion/react` from a React Server Component.** Put it in a file with `'use client'`, or import only pure utilities on the server. Native Electron main processes are Node.js—not DOM renderers. Run the WebView bridge in the renderer.

### 1. Vanilla browser / Web API

```ts
import { createWebMotion } from '@kovari/react-motion/web';

const cardRoot = document.querySelector<HTMLElement>('#cards')!;
const motion = createWebMotion({ root: cardRoot });

motion.stagger('.card', [
  { opacity: 0, transform: 'translateY(16px)' },
  { opacity: 1, transform: 'translateY(0)' },
], { duration: 300, easing: 'ease-out', each: 45 });

// Teardown in your router, framework effect cleanup, or unmount handler.
motion.dispose();
```

**API contract:** `animate(target, frames, options?)` and `stagger(target, frames, options?)` return **arrays of native `Animation` handles**, not a proprietary promise. A string selector runs inside the provided root (or `document`). A DOM `Element` or iterable of Elements is also accepted. No match returns an empty array. `.pause()` and `.play()` operate on currently tracked animations, `.cancel()` cancels them without disposing the scope, and `.dispose()` cancels and irreversibly closes it. The `active` count only includes animations still pending, and an interrupted partial batch rolls back the completed part. `reducedMotion` respects the existing DOM helper's media-query default unless explicitly overridden.

### 2. SVG API

```ts
import { drawPath, animateSVG } from '@kovari/react-motion/svg';

const path = document.querySelector<SVGPathElement>('#signature')!;
const draw = drawPath(path, { duration: 800, easing: 'ease-in-out' });

const circle = document.querySelector<SVGCircleElement>('#orb')!;
const pulse = animateSVG(circle, [{ opacity: .3 }, { opacity: 1 }], {
  duration: 600, direction: 'alternate', iterations: 2,
});

// On teardown: cancel the handles.
// draw.cancel(); pulse.cancel();
```

`drawPath` uses `getTotalLength()`, changes `strokeDasharray`, then animates `strokeDashoffset`. It requires a stroked shape with positive path length. On cancellation it restores the previous inline dash settings. On normal finish it retains the drawn inline state. It is **not** SVG path morphing; morphing arbitrary `d` commands needs additional path normalization/interpolation.

### 3. Canvas / WebGL model API

```ts
import { tweenCanvas } from '@kovari/react-motion/canvas';

const canvas = document.querySelector('canvas')!;
const ctx = canvas.getContext('2d')!;
const animation = tweenCanvas(
  { x: 20, radius: 14, alpha: 0 },
  { x: 240, radius: 30, alpha: 1 },
  ({ x, radius, alpha }) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(x, 70, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#8b6dff'; ctx.fill();
  },
  { duration: 650, easing: t => t * (2 - t) },
);

animation.pause();
animation.seek(.5); // 50% progress
animation.play();
// animation.cancel() during unmount
```

The `draw` callback receives a fresh numeric state. It controls canvas clearing and painting. `finished` resolves with `'finished'` or `'cancelled'`; cancellation does not produce an unhandled rejection. `reverse()` changes direction, and `seek()` validates a normalized 0..1 progress. Supply `scheduler: {now, request, cancel}` for deterministic tests or non-browser rendering environments. **Canvas is rasterized:** there is no built-in DOM accessibility tree; provide a semantic fallback for meaningful information.

Note: the existing `animateCanvas(ctx, draw, options)` in `/adapters` and the root entry remains supported. It animates a **progress callback** using `frameAdapter`, while `tweenCanvas(from, to, draw, options)` animates **named numeric state**. These are intentionally separate APIs, so earlier consumers do not break.

### 4. Desktop renderer API

```ts
import { createDesktopMotion } from '@kovari/react-motion/desktop';
const workspace = createDesktopMotion({ root: document, pauseWhenHidden: true });
workspace.animate('#command-palette', [
  { opacity: 0, transform: 'translateY(-10px)' },
  { opacity: 1, transform: 'translateY(0)' },
], { duration: 180, easing: 'ease-out' });

window.addEventListener('beforeunload', () => workspace.dispose(), { once: true });
```

All functionality in this entry point stays inside Chromium/WebKit/WebView browser APIs. It neither needs nor calls Electron's `ipcRenderer`, Tauri's native commands, Node's `fs`, or other privileged bridges. On document visibility changes it pauses/resumes **the animations owned by this scope**. This is an application policy convenience, not an operating-system power-management API. If you already pause animations yourself when a view becomes inactive, set `pauseWhenHidden: false`.

### 5. Debugging APIs

```ts
import {debug, createDebugSession} from '@kovari/react-motion/debug';
import {createMotionProfiler, mountMotionDevtools} from '@kovari/react-motion/devtools';

const trace = createDebugSession({maxRecords:250});
trace.enable();
const unsubscribe = trace.subscribe(record => console.debug(record.scope, record.message));
trace.log('my-component', 'transition-start', { duration: 240 });

// Global opt-in diagnostic events from the React adapter.
debug.enable();

const profiler = createMotionProfiler({frameBudgetMs:16.67, maxSamples:600});
profiler.start();
const hud = mountMotionDevtools(profiler);
// In a debug interval or your own view render: hud.update();

// Cleanup:
hud.dispose(); profiler.stop(); trace.disable(); unsubscribe(); debug.disable();
```

The profiler measures **actual requestAnimationFrame intervals on the host device**: sample count, mean FPS, p95 interval, slow-frame count and percentage. It cannot identify expensive React components or prove that one animation package outruns another. The HUD has **no background polling** and updates only when `.update()` is called. Both session records and profiler samples are bounded; nothing is sent to a server or local storage. Do not include tokens, secrets or personal information in manually logged metadata.

### 6. React API

```tsx
'use client';
import { motion, AnimatePresence, MotionConfig } from '@kovari/react-motion/react';

const variants = {
  closed: { opacity: 0, y: 12 },
  open: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260 } },
};

export function Notice({ visible }: { visible: boolean }) {
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="sync">
        {visible && (
          <motion.aside key="notice" initial="closed" animate="open" exit="closed"
            variants={variants} whileHover={{ y: -3 }}>
            Changes saved
          </motion.aside>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
```

MotionConfig currently supports `reducedMotion="user" | "always" | "never"`. Durations are milliseconds (e.g., `180`), unlike Motion's common seconds notation. See [REACT-GUIDE](./REACT-GUIDE.md) and [MIGRATION-v1](./MIGRATION-v1.md) for lifecycle and differences. Kovari's React projection/layout logic remains simpler than Motion's mature system; do not claim feature-by-feature parity without browser integration tests.

## SSR, reduced motion and failure modes

- **ESM only.** Use `import`, not CommonJS `require`.
- **Pure imports:** import of a module is safe on a server in the absence of DOM execution, except direct React bindings (client-only) should be loaded in a client component.
- **Native animation:** requires `Element.animate` at execution time; if absent, provide your own fallback or handle the exception. `animateSVG` validates support.
- **Reduced motion:** native `animate` forces `duration: 0` for the browser preference unless overridden. `tweenCanvas` has an explicit `reducedMotion` option; pass your own preference to it.
- **Browser visibility:** foreground/background changes may throttle rAF and animations independent of this package.
- **Cleanup:** motion scopes, frame drivers, debug overlays, observers, animation handles and event subscriptions all have owners. Dispose in framework unmount/lifecycle code.

## Stability policy

The source archive is **v1.0.0**. It provides the APIs documented here and a local automated test suite. It does **not** imply that npm's `latest` tag has been updated or that a complete multi-browser/React-version CI matrix has run. See [RELEASE-CHECKLIST](./RELEASE-CHECKLIST.md) and [PRODUCTION-READINESS](./PRODUCTION-READINESS.md).
