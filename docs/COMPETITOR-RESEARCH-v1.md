# Competitive research and engineering priorities for Kovari Motion 1.0.0

**Research scope:** Public upstream documentation reviewed October 21, 2026, plus the uploaded v0.1.2 npm tarball and uploaded v1 source tree. Statements below describe **documented feature sets**, not independent speed benchmarks. The user-provided v1 source was already much richer than v0.1.2 and passed 66 baseline tests before edits. The publicly visible GitHub `main` did not establish that this v1 source was published to npm.

## Functional matrix (not a performance ranking)

| Capability | Motion (formerly Framer Motion) | React Spring | GSAP | Anime.js | Kovari v1.0.0 source |
|---|---|---|---|---|---|
| Declarative React | Strong core `motion.*` API | `animated.*` with spring hooks | React hook integration | Mostly imperative | `motion.*`, `AnimatePresence`, state/gesture props |
| Motion/physics values | Springs/values | Core strength | Eases & physics extensions | Physics and property animation | Springs, values, `springValue`, inertia |
| Layout & presence | Mature layout / shared layout / exit | `useTransition` | Layout patterns and plugins | Imperative choreography | FLIP layout, shared registry, presence reconciler; narrower edge-case coverage |
| Timelines | Sequencing | Hook orchestration | Mature timeline | Mature timeline positions and labels | `timeline`, `timelineBuilder`, `sequence` |
| Vanilla DOM | Yes | Not primary focus | Yes | Yes | `animate`, `createWebMotion` |
| SVG | Yes | Supported animated elements | Yes | Yes | `animateSVG`, `drawPath`; **no arbitrary path morphing** |
| Canvas / custom | JavaScript motion values | Custom interpolation | Canvas-supported patterns | JS animation values | `frameAdapter`, `animateCanvas`, `tweenCanvas` |
| Resource cleanup | Framework lifecycle | Hook lifecycle | `gsap.context().revert()` | Manual cancellation | Per-scope `dispose()`, React effects, explicit handles |
| Desktop | Browser/WebView | Browser/WebView | Browser/WebView | Browser/WebView | DOM `createDesktopMotion` renderer wrapper |
| Profiling | Browser tools and ecosystem | Browser tools | Browser tools | Browser tools | Opt-in frame profiler, local diagnostics; **not apples-to-apples benchmarks** |

### Sources consulted

- Motion for React overview, variants, gesture states and layout: https://motion.dev/docs/react, https://motion.dev/docs/react-motion-component, https://motion.dev/docs/react-gestures
- React Spring `useTransition`: https://www.react-spring.dev/docs/components/use-transition
- GSAP lifecycle and `context()` cleanup: https://gsap.com/docs/v3/GSAP/gsap.context()/
- Anime.js timeline positions and stagger: https://animejs.com/documentation/timeline/time-position and https://animejs.com/documentation/utilities/stagger/
- Kovari public GitHub project: https://github.com/LoonCodeHunter/react-motion
- Kovari npm package page: https://www.npmjs.com/package/@kovari/react-motion (this environment could not fetch registry listing reliably; its published latest version was **not** independently confirmed)

## What Kovari already did well at v0.1.2

- ESM package and explicit subpaths, native WAAPI DOM wrapper.
- Physics curve sampling, observable values, timeline orchestration.
- Focused JS APIs independent of the React peer package.
- Reduced-motion-aware native animation.
- TypeScript declarations and documentation.

## What the uploaded v1 candidate already introduced

`motion.*` components, variants, presence, drag/pan/swipe, inertia, scroll scrubbing, timeline builder, reactive transforms, Canvas progress driver, external engine/provider adapters, inspector, optional UI primitives, and a React showcase. These are inherited capabilities—not added in this patch.

## Concrete engineering upgrades implemented in this revised archive

1. **Scoped native animation:** new `createWebMotion` owns WAAPI handles, scoped selection, rollback on partial batch failure and teardown. Motivated by GSAP context's clear ownership model; implemented independently.
2. **Additional API families:** SVG path drawing, named Canvas numeric tween, Electron/Tauri WebView visibility manager, and development profiler. Framework-agnostic by design.
3. **Lower incidental CSS work:** React adapter no longer uses blanket `transition: all`; it narrows the CSS fallback to visual properties. This is a sensible change, **not a measured FPS improvement**.
4. **Bounded tracing:** debug buffer has a size cap, event subscriptions and opt-in React adapter lifecycle diagnostics, plus frame cadence metrics.
5. **Build and docs hygiene:** static `version-v1.0.0` badge replaces `source-v1.0.0 candidate`. Badge checks enforce consistency with the package manifest.
6. **Regression coverage:** new deterministic tests cover lifecycle, frame scheduler behavior, SVG cleanup, desktop visibility, and profiler calculations.

## Where competitors still outperform Kovari in feature maturity

- Motion: production-hardened automatic layout projection, integrated SVG animation, robust React edge cases, gesture semantics, and extensive browser compatibility matrix.
- GSAP: advanced timeline scrubbing, sequencing, tooling and broad plugin ecosystem.
- React Spring: deeply integrated interruptible springs and hooks for physics-driven React state.
- Anime.js: a larger vocabulary of relative timeline positions and a richer animation/property space.

**Do not promise that Kovari 'outclasses' the above libraries until a browser/device benchmark establishes comparable results.** The sensible ambition is a focused, maintainable engine whose import surface and behavior are easy to reason about.

## Fair comparison protocol

1. Pin exact versions of every competitor and React / React DOM, avoid `latest` during comparisons.
2. Run Chromium, Firefox and WebKit in equivalent headless/headed modes on the same host and CPU power profile.
3. Compare at least: 12 opacity/transform element animations; 100-item staggering; drag/interruption; scroll progression; mount/unmount leak test; JavaScript-busy main thread.
4. Separate measurements: gzip transfer size per imported feature, startup scripting, commit/render cost, p50/p95 frame times, completion drift, stability of cancellation, and memory after 1000 mount cycles.
5. Capture Chrome tracing/long tasks when a metric regresses; prefer UX responsiveness over synthetic update counts.
6. Test keyboard, touch, reduced-motion, and screen-reader semantics separately; never call a performance score an accessibility score.
7. Save raw results, CI runner and browser build IDs in the benchmark artifact; publish reproducible scripts, not only a headline FPS.

See [COMPETITIVE-BENCHMARK-PLAN](./COMPETITIVE-BENCHMARK-PLAN.md) and [MOTION-SCORE](./MOTION-SCORE.md). The existing Motion Score workflow measures a narrow benchmark and **does not** by itself compare third-party libraries.
