# Kovari React Motion v1.0.0+ — source-candidate engineering report

Date: 2026-10-21  
Package manifest: `@kovari/react-motion@1.0.0`  
Status: **local source candidate, not a published release or independently production-certified**.

## Implemented additions

1. **Pan/swipe gesture recognizer** (`src/pan.ts`, `/pan`): pointer capture, primary-pointer validation, threshold, axis selection, per-sample velocities, swipe direction/threshold, cancel/end separation, idempotent cleanup. Opt-in `preventDefault`; leaves `touch-action` and visual transforms to consumers.
2. **Native animation scroll binding** (`src/scroll-scrub.ts`, `/scroll-scrub`): drives `Animation.currentTime` from an observable value, with validated progress range, optional easing, initial sync and unsubscribing without destroying the caller's animation.
3. **Lazy provider registry** (`src/adapter-registry.ts`, `/adapter-registry`): registered synchronous or asynchronous adapter factories; simultaneous resolves share a promise, failures can retry, replacement invalidates pending stale results; no forced Motion dependency.
4. **Bounded animation inspector** (`src/inspector.ts`, `/inspector`): optional local timing traces, frame budget and p95 summaries; no production telemetry, no secrets or user data.
5. **React hooks** from `/react`: `usePan`, `useScrollScrub`, `useMotionInspector`. These offer React effect cleanup around framework-independent primitives.
6. **Two new visual showcase labs**: swipe gallery with accessible previous/next controls, and a scroll-scrubbed native keyframe orb.
7. **Badges**: removed `img.shields.io/npm/v/...` from README; version badge is explicitly pinned to **v1.0.0 source candidate**, separate from a version-neutral npm link, and checked by `scripts/verify-badges.mjs`. Added detailed `docs/BADGES.md` and `docs/NEXT-GENERATION.md`.

## Local verification (2026-10-21)

| Check | Result |
|---|---|
| TypeScript source check and dual builds | PASS under available `tsc 5.8.3` on Node 22.16.0 |
| `npm run release:check` | PASS locally |
| Node test suite | **66 passed, 0 failed**, including 11 new next-generation tests |
| Manifest export validation | **41 export paths**, **77 verified artifacts** |
| Markdown/docs check | **14 checked documents; 40 valid local links** |
| Badge preflight | PASS; no npm-version badge |
| Isolated npm tarball consumer | PASS; offline tarball install and four new subpath/root exports imported successfully |
| npm package archive | Produced without lifecycle script execution (`npm pack --ignore-scripts`) |

## Not yet verified — critical gates

- `npm ci --offline` **could not reinstall the locked toolchain** because the npm cache lacks `undici-types@6.21.0`; this is an environment/cache limitation, not a successful lockfile test. CI must run actual registry-backed `npm ci` with the declared TypeScript 6 dependency.
- React 18/19 real application render/hydration and StrictMode effects; Playwright Chromium/Firefox/WebKit; mobile touch and keyboard accessibility; native WAAPI scroll behavior in real browsers; reduced motion on actual devices.
- Browser-based performance/feature comparison against Motion (Framer Motion). No fair benchmark has been executed: **do not claim five-star feature parity or superiority based on these local tests**.
- Security registry audit and npm release/publish verification.
- The new v1 source has **not** been pushed to the repository's `main` branch or published on npm. Existing GitHub code and badge state can differ.

## SOFA research used

Consulted the connected Stack Overflow for Agents knowledge base for React/animation performance and adapter contract testing. Applied the general recommendation to exercise injected providers through their actual call signatures and error paths, rather than relying on superficial callable checks. Guidance was interpreted as engineering input, not proof of cross-browser correctness.

## Release approach

1. Work in a separate v1 feature branch, compare its diffs with current GitHub `main`, and protect existing CI fixes.
2. Run `npm ci`, `npm run release:check`, React 18/19 hosted consumer tests, Playwright browser tests and security audit with registry/network access.
3. Review reduced-motion, gesture keyboard alternatives, layout/presence behavior and interoperability with real external Motion packages.
4. Collect equivalent-condition bundle/frame performance benchmarks before making competitor claims.
5. Review the exact `.tgz` and use a prerelease/next dist-tag first if gates remain open. Only then promote a stable `1.0.0` package to `latest`.

The source README uses an **explicitly pinned source candidate badge** and a separate npm package link. It intentionally does not announce that v1.0.0 is available as the published npm latest version.
