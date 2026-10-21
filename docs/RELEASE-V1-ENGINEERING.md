# Engineering release report — Kovari Motion v1.0.0

**Prepared:** 2026-10-21. **Release status:** locally built release candidate; **not published to npm or pushed to GitHub** by this artifact preparation. A source manifest `version: 1.0.0` and version image are *not* evidence of a public release.

## Inputs and audit

- Uploaded npm archive: `kovari-react-motion-0.1.2(1).tgz` (compiled distribution, metadata, docs and assets).
- Uploaded `package.json` / `README(4).md` for v0.1.2 compatibility/documentation reference.
- Uploaded complete source v1.0.0 candidate ZIP. This source—not just the compiled v0.1.2 tarball—is the base for the revision.
- Public repository `https://github.com/LoonCodeHunter/react-motion`: publicly accessible; browser search alone was insufficient to verify npm's live latest tag in this environment.

## Baseline findings

- v0.1.2 provided the WAAPI wrapper, easing/spring sampling, values, scroll/gestures/timelines/layout and injected React `Div`/`DivCenter` adapter.
- The supplied v1 candidate already provided variants, declarative `motion.*`, presence, FLIP/layout, momentum drag, scroll scrubbing, engine adapters, UI kit, gallery, test suite and packaging validation. Do not misrepresent inherited features as changes delivered during this revision.
- Baseline source `npm run typecheck` and `npm test` passed **66** tests before changes.

## Implemented changes

1. Added five independently importable APIs: `./web`, `./svg`, `./canvas`, `./desktop`, `./devtools`. The root also exports the underlying functions.
2. Added scoped browser WAAPI lifecycle, including per-scope animation ownership, selector scoping, stagger and partial-batch rollback.
3. Added native SVG path drawing using path metrics; retained normal native WAAPI handles for additional SVG animation.
4. Added Canvas named numeric state tween with deterministic scheduler injection, progress/seek/reverse/pause, reduced motion and non-rejecting `finished` resolution.
5. Added desktop WebView visibility lifecycle and explicit listener teardown (renderer-only, no native privileges).
6. Added profiler snapshot and lightweight opt-in HUD. Replaced unbounded debug singleton with bounded sessions while preserving `debug.enable/disable/log/records/clear`.
7. Instrumented React animation lifecycle for opt-in debugging, removed blanket `transition: all`, and marked direct React bindings/UI components `'use client'` for client-component bundlers.
8. Updated image labels from source candidate to **Version v1.0.0** in README; synchronized badge verifier, SVG hero label, demo label and badge guide.
9. Added deterministic regression tests for these new surfaces.

## Explicit limits

- No claim that the package surpasses Motion/React Spring/GSAP/Anime.js on FPS, bundle size or maturity without peer benchmarks.
- No automatic SVG morphing, canvas accessibility controls, native Electron/Tauri backend, React Native binding, or complete Vue/Svelte declarative adapter.
- No external third-party framework source code copied into the package.
- Local Node unit tests and TS typechecking do not cover all browser engines or on-device input behavior.
- No npm publish, GitHub push, release tag creation, or live npm-version confirmation was performed.

## Operator handoff

Run from repository root:

```bash
npm ci
npm run typecheck
npm test
npm run docs:check
npm run badges:check
npm run release:check
npm pack --dry-run --ignore-scripts
```

Then install the generated `.tgz` into **fresh** React 18 and 19 consumers and a DOM-only TypeScript app, exercise the Electron/Tauri renderer example in an actual desktop WebView, and review the CI/browser matrix. Only after successful clean-repo validation and publisher authentication, run `npm publish --access public` yourself. If version `1.0.0` is already in npm, a new version must be chosen; npm releases cannot be replaced in place.

See [API-SURFACES-v1](./API-SURFACES-v1.md), [COMPETITOR-RESEARCH-v1](./COMPETITOR-RESEARCH-v1.md), and [DEBUGGING-v1](./DEBUGGING-v1.md).
