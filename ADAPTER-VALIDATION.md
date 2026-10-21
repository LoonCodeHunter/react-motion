# Adaptive Motion v1.0.0 — validation record

Date: 2026-10-21. State: **source release candidate; not a stable production certification**.

## Implemented

- `createReactMotion(React)` returns Kovari React bindings plus `.engine`.
- `createReactMotion(animate)` returns an imperative adapter with no fabricated JSX components.
- `createMotionAdapter({react, animate, motion, AnimatePresence, MotionConfig, driver, name, onError, reducedMotion})` composes independent engines.
- `adaptMotionSource()` recognizes valid React-compatible runtimes, functions, and explicit options.
- `createMotionProviderBridge()` bridges supplied external JSX component providers with adapter capability metadata.
- Values can be imported from external provider or sent to external provider with a cleanup function.
- Inputs validated and thrown driver errors passed to onError and rethrown.

## Observed locally

- `npm run release:check` passed on Node 22.16.0 with globally installed TypeScript 5.8.3.
- 55 Node tests passed, zero failures.
- 37 declared public package export paths; 69 referenced artifacts verified.
- npm archive generated after build; remote registry and browser integration not tested here.

## Required before stable publishing

- Run `npm ci` and TypeScript from the repository lockfile on all supported Node versions.
- Execute real React 18 and 19 consumer tests, Vite/Next SSR and hydration, and React StrictMode cleanup.
- Verify `motion` and `framer-motion` adapters against installed provider packages (tests currently use realistic fakes).
- Browser-run Chromium, Firefox and WebKit smoke tests, mobile touch, keyboard accessibility and reduced motion.
- Benchmark against Motion under equivalent workloads, not a fabricated five-star marketing score.
- GitHub CI must finish green on the proposed v1 branch. Publish only after code review and audits.
