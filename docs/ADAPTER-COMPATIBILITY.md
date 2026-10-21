# Adapter compatibility and validation matrix

This guide separates **implemented contracts** from functionality owned by optional providers. External libraries are never bundled.

| Source | Setup | React components | Imperative playback | Signals | Ownership |
|---|---|---|---|---|---|
| React 18/19 | `createReactMotion(React)` | Kovari JSX | only with `{animate}` option | Kovari values | Kovari |
| Motion `animate` | `createReactMotion(animate)` | No | Yes | Kovari values + bridge | Motion |
| Motion React | `createMotionAdapter({motion, AnimatePresence})` | Pass-through | only with supplied `animate` | One-way bridge | Motion |
| Framer Motion | same provider shape | Pass-through | optional | One-way bridge | Framer Motion |
| Vanilla browser | `frameAdapter`, `animate` | No | Yes | Kovari values | Browser/Kovari |
| Canvas | `animateCanvas` | No | Custom | Kovari values | Caller |
| WebGL/Three.js | `createMotionAdapter({driver})` | No | Custom | Kovari values | Caller |

## Required integration gates

1. Unit-test overload discrimination and return types.
2. Consumer-install built npm tarball with React 18 and React 19 independently.
3. Verify external Motion/framer-motion versions and exact imports (they change across releases).
4. Test hydration and StrictMode effect cleanup in a real browser.
5. Profile drag, shared layout, presence exit, large staggered lists and scroll on midrange mobile hardware.
6. Verify reduced motion and keyboard alternatives, screen-reader semantics, and pointer cancellation.
7. Keep the benchmarking script neutral; never report all features as 5/5 absent measurement.

The current local suite confirms the factory contract. It does **not** certify these external-browser gates. See [Production readiness](./PRODUCTION-READINESS.md).
