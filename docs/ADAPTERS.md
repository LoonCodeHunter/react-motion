# Adapter system — native renderers and external providers

Kovari supports two intentionally different approaches: **renderer-independent numeric drivers** (native to Kovari) and **explicit third-party React provider composition** (external providers retain control of their own components). These approaches should never be confused.

## Import table

| Symbol | Import | Role | Cleanup |
|---|---|---|---|
| `frameAdapter` | `/adapters` | Schedule progress via requestAnimationFrame | `pause()` / `cancel()` |
| `animateNumber` | `/adapters` | Animate scalar values | `cancel()` |
| `animateObject` | `/adapters` | Numeric object properties | `cancel()` |
| `animateCanvas` | `/adapters` | User-owned Canvas drawing callback | `cancel()` |
| `createMotionAdapter` / `createAnimateAdapter` | `/adapter-factory` | Composable imperative/React/provider driver | Provider-owned |
| `adaptMotionSource` | `/adapter-factory` | Detect explicit React runtime or animate function | Provider-owned |
| `createMotionProviderBridge` | `/adapter-factory` | External component and driver bridge | Provider-owned |
| `createReactMotionBridge` | `/provider-bridge` | Expose supplied external motion components | Provider-owned |
| `fromExternalMotionValue` | `/provider-bridge` | External → Kovari value | `.stop()` |
| `syncToExternalMotionValue` | `/provider-bridge` | Kovari → external value | Returned function |

## Built-in frame driver

```ts
import { frameAdapter, animateObject } from '@kovari/react-motion/adapters';
const state = { x: 0, rotation: 0 };
const position = animateObject(state, 'x', 200, { duration: 500 });
const driver = frameAdapter({ duration: 300, onUpdate: value => console.log(value) });
driver.play();
// position.cancel(); driver.cancel();
```

The callback is renderer-independent; **Kovari does not own Canvas/WebGL/Three.js scene graphs**. An application using these libraries must perform its own drawing and manage scheduling conflicts. `animateCanvas(ctx, draw, options)` calls the given callback on each progress update. On non-browser runtimes, a frame-driver fallback completes without continuous frames.

## Flexible source overloads and composition

As of the extended v1 source, `createReactMotion()` accepts **two different inputs**. The return type varies according to the input; use the corresponding methods.

```tsx
import * as React from 'react';
import { createReactMotion } from '@kovari/react-motion/react-adapter';

const app = createReactMotion(React);
const Card = app.motion.div;               // React component
const value = app.useMotionValue;          // React hook
const metadata = app.engine.capabilities; // React = true
```

```ts
import {animate} from 'motion';
import {createReactMotion} from '@kovari/react-motion/react-adapter';

const motionEngine = createReactMotion(animate);
motionEngine.animate('.card', {opacity:[0,1]}, {duration:.25});
// .motion is deliberately undefined: animate alone does not provide components.
```

This is not a promise that Motion's `animate()` and the browser's `Element.animate()` have identical signatures or return types. The injected provider controls its own semantics and lifecycle.

### Typed configurable adapter factory

```tsx
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createMotionAdapter } from '@kovari/react-motion/adapter-factory';

const engine = createMotionAdapter({
  name:'framer-motion', react:React, motion, AnimatePresence,
  reducedMotion:'user',
  onError(error){ console.error(error); },
});
engine.isSupported('components'); // true
engine.isSupported('imperative'); // false unless animate is supplied
```

Configuration fields: `name`, `react`, `animate`, `motion`, `AnimatePresence`, `MotionConfig`, `driver`, `reducedMotion`, `onError`. All are optional independently, but at least one engine source (`react`, `animate`, `motion` or `driver`) must be present. `react` must expose `createElement`, `forwardRef` and `useState`; callback fields must be functions. `reducedMotion` is validated as `user` / `always` / `never`; **the external provider must still be configured separately to honour the user's preference**.

The adapter returns `name`, `kind`, immutable `capabilities`, `animate`, `drive`, `motion`, `AnimatePresence`, `MotionConfig`, `createValue`, `fromExternalValue`, `syncToExternalValue`, and `isSupported`. Unconfigured operations throw a clear error. User-provided `onError` receives errors thrown by an animation or renderer driver; errors are rethrown, not silently ignored.

### Combining Kovari React with an external imperative driver

```tsx
import * as React from 'react';
import { animate } from 'motion';
import { createReactMotion } from '@kovari/react-motion/react-adapter';

const { motion: kovariMotion, engine } = createReactMotion(React, {
  name:'kovari-plus-motion-animate', animate,
});
// kovariMotion.div is owned by Kovari; engine.animate() delegates to Motion.
```

Do not concurrently animate the same `transform` or other CSS property using two providers; conflicting ownership produces visual glitches. For externally owned JSX elements use `createMotionProviderBridge({motion, AnimatePresence})` or `createReactMotionBridge({motion, AnimatePresence})` instead of treating them as Kovari motion components.

### Custom rendering backend

```ts
import {createMotionAdapter} from '@kovari/react-motion/adapter-factory';
const state = {progress:0};
const adapter = createMotionAdapter({name:'renderer',driver(target, keyframes){
  target.progress = keyframes[0];
  return {cancel(){}};
}});
adapter.drive(state,[1]);
```

You own the custom driver's rendering loop, timing, cancellation, SSR boundaries, and any lifecycle promises. Kovari's built-in `frameAdapter`, `animateObject` and `animateCanvas` remain the recommended low-level building blocks.

## Native React injection vs external animation engines

Provider factories from `motion/react` and `framer-motion` are passed through. They are not merged with Kovari's own layout, presence, variants or state machine. The `createReactMotion(React)` overload produces Kovari JSX components; the `createReactMotion(animate)` overload delegates imperative calls. The names are similar for ergonomic reasons, but the return type and capabilities are intentionally different.

## One-way motion-value synchronization

```ts
import { motionValue as externalMotionValue } from 'motion';
import { fromExternalMotionValue, syncToExternalMotionValue } from '@kovari/react-motion/provider-bridge';
import { motionValue } from '@kovari/react-motion/motion-value';
const remote = externalMotionValue(0);
const imported = fromExternalMotionValue(remote);
remote.set(35); // imported.value.get() becomes 35
imported.stop();

const local = motionValue(0);
const stop = syncToExternalMotionValue(local, remote);
local.set(60);
stop();local.destroy();
```

`fromExternalMotionValue()` requires `.get()` and `.on('change', cb)` or `.subscribe(cb)` returning an unsubscribe function. `syncToExternalMotionValue()` requires external `.set()`. Both are deliberately unidirectional to prevent subscription loops. The bridge neither makes signal types identical nor transfers ownership of the external animation lifecycle.

## Adapter verification checklist

- Verify concrete installed provider versions and React peer dependencies.
- Check SSR boundaries, React StrictMode mount/unmount and event cleanup.
- Confirm native/external providers do not animate the same `transform` simultaneously.
- Test reduced motion, keyboard and touch input.
- Track resulting JS bundles for duplicate React/provider engines.
- Treat independent provider behavior as the external library's functionality—not a Kovari native parity claim.
