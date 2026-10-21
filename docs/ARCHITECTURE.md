# Architecture

## Packages / entry points

- `src/dom.ts`, `src/layout.ts`, `src/scroll.ts`: browser-platform primitives.
- `src/spring.ts`, `src/spring-value.ts`, `src/motion-value.ts`, `src/interpolate.ts`, `src/keyframes.ts`: math, signals and interpolation.
- `src/variants.ts`, `src/transform.ts`, `src/presets.ts`: animation state targets, transform generation and UI presets.
- `src/gestures.ts`, `src/drag.ts`: input handling, pointer capture and cleanup.
- `src/timeline.ts`: Web Animations timeline orchestration with labels.
- `src/adapters.ts`: animation-frame drivers for imperative renderers, Canvas and arbitrary objects.
- `src/react.ts`: injected React runtime using only the consumer's React hooks; root import stays React-independent.
- `src/react-bindings.ts`: convenience React subpath that imports the React peer.
- `src/ui.ts`, `src/ui.css`: optional React UI primitives and opt-in design tokens.
- `src/debug.ts`: diagnostics kept out of focused entry points.

## Core constraints

1. Avoid DOM access during module import. Browser-only functions detect missing prerequisites at call time.
2. Every event listener/RAF subscription has an explicit cleanup path.
3. `prefers-reduced-motion` takes precedence over caller duration for native animations.
4. `transform` and `opacity` are the preferred targets for smoother UI motion.
5. Keep `src/mini.ts` small and avoid importing React into it.
6. Keep stable public APIs in TypeScript; public declaration files are generated, not handwritten.
7. Treat subpath exports as contracts; validate each export path against built files before packing.

## Known beta caveats

- React bindings are currently typed structurally rather than using exhaustive `@types/react` intrinsic-element overloads.
- `AnimatePresence` supports keyed direct child exit, but nested presence and re-entry races require additional browser testing.
- Layout transforms may conflict with complex pre-existing CSS transform chains. Shared layout is not implemented.
- Spring keyframes sample an analytical solver to WAAPI rather than executing a dedicated off-thread spring engine.
- Browser benchmark scoring is environment-dependent. Never use it as a blanket 'faster than Motion' claim.
