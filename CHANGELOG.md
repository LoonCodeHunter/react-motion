# Changelog

## 1.0.0 — additional candidate functionality (2026-10-21)

- Added pointer-capture `pan()` with primary-pointer filtering, threshold, axis lock, velocity estimates, cancellation, swipe direction detection and explicit listener cleanup.
- Added `bindScrollAnimation()` for scroll-linked WAAPI time scrubbing with independently owned scroll signals and browser animations.
- Added `createMotionAdapterRegistry()` with lazy third-party provider registration, concurrent-resolution sharing, retries and stale-provider invalidation.
- Added `createMotionInspector()` for bounded, opt-in timing traces, p95, mean and over-budget summaries.
- Added `usePan`, `useScrollScrub`, `useMotionInspector` to the optional React entry point.
- Removed `npm/v` Shields endpoint from README, introduced pinned **source candidate** badge plus version-neutral npm package link and an automated badge-policy preflight. Older/deprecated npm package versions cannot masquerade as the local candidate version through this badge.
- Added dedicated regression tests and `docs/NEXT-GENERATION.md`. No external provider is bundled or performance-parity claim made.

## 1.0.0 — source candidate, not released (2026-10-21)

- Expanded GitHub-friendly README and documentation with custom vector illustrations, detailed React/UI/API/adapter/production guides and source-tested examples.
- Added optional, provider-agnostic `createReactMotionBridge` for pass-through component composition with installed Motion/Framer Motion engines.
- Added explicit one-way cross-provider motion value observers and synchronization, with cleanup and validation tests.
- Included documentation consistency preflight; corrected API reference for shared layout, scroll values and expanded UI components.
- Verified local build and tests; hosted browser/React 18/19 testing and security audit remain stable-release gates.



## 1.0.0-rc.1 — advanced release candidate (2026-10-21)

- Introduced real drag-release velocity, opt-in inertia physics with constraints and cancelable animation drivers.
- Introduced `MotionConfig`, `useAnimationControls`, `AnimatePresence` wait mode and shared layout snapshot `layoutId`.
- Added a chainable timeline builder with labels and stagger, composed motion values, X/Y scroll signals and reusable in-view observer.
- Improved animation cleanup, transform layering after drag, reduced-motion behavior and React gesture lifecycle.
- Added UI components: `MotionProgress`, `MotionToggle`, `MotionSkeleton`, plus improved UI design tokens.
- Added standalone React Vite showcase, React 18/19 SSR and JSX validation workflow, expanded unit tests and feature-parity audit.
- Stable release is blocked on hosted React/browser compatibility testing and benchmarking; no performance superiority claimed.


## 1.0.0-beta.1 — major preview (2026-10-21)

- Add direct React `motion.tag` components under `/react` while keeping core React-independent and retaining `createReactMotion` under `/react-adapter`.
- Add named/array/dynamic variants, transition presets and transform composition.
- Add a basic keyed `AnimatePresence` and React hover, tap, focus, viewport and drag states.
- Add pointer drag with axis constraints, pointer capture, and cleanup, plus accessibility-friendly press/focus handling.
- Add analytical spring sampling for under-/critical/overdamped cases, sampled WAAPI spring keyframes and RAF-driven spring motion values.
- Add composed motion values, mapping/interpolation and React motion value hooks, plus scroll and reduced-motion hooks.
- Expand timelines with labels, overlap/relative offsets, seeking and full lifecycle controls.
- Add frame/object/canvas renderer adapters for UIs outside React.
- Add opt-in `@kovari/react-motion/ui` wrappers (`MotionButton`, `MotionCard`, `MotionReveal`, `MotionBadge`) with editable CSS design tokens.
- Strengthen export verification and add 11 new regression tests (24 total).
- Add modern React showcase with CSS, migration guide, detailed API docs, feature-parity roadmap and release checklist.
- **Known gaps:** not yet Motion feature parity; no browser/React E2E validation in this offline build environment. Do not tag as stable or publish to `latest` until release gates pass.

## Unreleased

- Fix Node 24 release CI by removing the registry-dependent `npm publish --dry-run` check; keep deterministic local `npm pack --dry-run` and package verification instead.
- Make Motion Score CI benchmark the locally packed source commit instead of downloading `@kovari/react-motion@latest`, avoiding a stale release or registry tarball integrity issue.
- Pin the workflow runner to Ubuntu 24.04 and improve package/lockfile preflight checks and diagnostics.

- Fix Motion Score job permissions by separating read-only browser measurement from the gated main-branch score commit.
- Fail clearly when the score artifact is missing and validate the Shields endpoint JSON before updating the tracked badge data.

- Expand integration, security, CI and release documentation.
- Clarify the static source version badge and avoid reading the npm `latest` tag.

# Changelog

## 0.1.2 — 2026-10-20

- Add a shared, dependency-free Motion Score calculator so the browser runner and unit tests use the same formula.
- Define and test the 0–100 score bands: red 0–49, yellow 50–69, green 70–89, yellow-green 90–100.
- Split the long inline benchmark from the workflow into maintained files under `scripts/motion-score/` and document its measured limits in `docs/MOTION-SCORE.md`.
- Change the npm download badge to total downloads with the concise label `downloads`; link the custom score badge to methodology and link run status to the actual GitHub Actions workflow.
- Add seven Motion Score regression tests covering boundaries, ideal/poor results, score monotonicity, weights and invalid metric handling.
- Align the declared Node.js engine and CI matrix with the TypeScript 6 development toolchain (Node.js 20.19+).
- Stabilise Motion Score CI by starting the Vite server and running Playwright in the same step, with readiness checks and process cleanup.
- Add a pending seed response for the Shields.io score endpoint so the badge degrades gracefully before the first successful run.
- Ensure `animate()` enforces zero-duration motion for reduced-motion users even when a duration was passed.
- Standardise README badges to Shields.io `style=flat` and make the source-version badge explicitly match `package.json`.
- Add release-check and package verification scripts, align CI with the release gate, and expand lifecycle, compatibility and release guidance.
- No new runtime dependencies.


## 0.1.1

ESM-first animation primitives covering easing, springs, timelines, gestures, scroll tracking, layout helpers and the optional React adapter.

### Adapter interoperability extension (source candidate)

- Added configurable `createMotionAdapter`, `createAnimateAdapter`, `adaptMotionSource` and `createMotionProviderBridge`.
- Overloaded `createReactMotion(React)` and `createReactMotion(animate)` without conflating React components with imperative drivers.
- Added runtime capability reports, strict configuration errors, caller-defined error forwarding and custom renderer dispatch.
- Added dedicated regression tests and adapter compatibility guidance.
