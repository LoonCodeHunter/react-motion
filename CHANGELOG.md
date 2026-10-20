## Unreleased

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
