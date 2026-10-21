# Migration from 0.1.x to v1.0.0

The 0.1.x package provided compact native DOM/scroll/motion-value utilities and an injected `createReactMotion(React)` wrapper. The v1 source candidate retains a dependency-light core while adding `/react`, `/ui`, `/adapters` and `/provider-bridge`, plus physics, layout and presence systems.

## Existing primitive style

```js
import {animate,stagger,motionValue} from '@kovari/react-motion';
```

## New direct React style

```tsx
'use client';
import {motion,AnimatePresence} from '@kovari/react-motion/react';
const Item=()=> <motion.div initial={{opacity:0}} animate={{opacity:1}}>Welcome</motion.div>;
```

## React injection and external providers are different

```tsx
import * as React from 'react';
import {createReactMotion} from '@kovari/react-motion/react-adapter';
const native=createReactMotion(React);
```

For independently installed `motion/react` or `framer-motion` components use `createReactMotionBridge({motion,AnimatePresence})` from `/provider-bridge`. Do not pass their `motion` object to `createReactMotion(React)`.

The v1 adapter handles real entry/exit/interaction life cycles, not only the 0.1.x CSS-only visual fallback; verify behavior, cleanup and element transforms before upgrading an application. No migration should be treated as complete until React/browser CI and real UI acceptance tests pass.
