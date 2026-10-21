# Diagnostics, frame pacing and troubleshooting — v1

## Three layers of diagnostics

1. **Debug events** (`/debug`): local opt-in event records (maximum 500 by default). The React adapter emits `animation-start`, `animation-finish`, `animation-skipped` and `animation-error` when `debug.enable()` is active. No external logging or user data collection.
2. **Inspector durations** (`/inspector`): opt-in named spans and percentiles for code paths your app wraps with `inspector.start('name')` and concludes.
3. **Frame profiler + HUD** (`/devtools`): timing samples from actual `requestAnimationFrame` callbacks; shows approximate FPS, p95 frame spacing and frames over your chosen budget. Use profiler `.start()` and `.stop()`; use HUD `.update()` to refresh it, and `.dispose()` to remove.

## Minimal snippet

```ts
import {debug} from '@kovari/react-motion/debug';
import {createMotionProfiler,mountMotionDevtools} from '@kovari/react-motion/devtools';

debug.enable();
const frameProfiler=createMotionProfiler({frameBudgetMs:16.67,maxSamples:450});
frameProfiler.start();
const hud=mountMotionDevtools(frameProfiler);

// Update when you need a snapshot (not necessarily every frame):
hud.update();
console.table(frameProfiler.snapshot());
console.table(debug.records('react'));

// Shutdown:
hud.dispose();frameProfiler.stop();debug.disable();debug.clear();
```

## Interpreting output

- Low FPS on a background browser tab is expected: the browser may throttle frames.
- P95 over your budget indicates occasional long intervals but **does not identify the package at fault**.
- A fast `motionValue()` update count is not evidence of fast React commits.
- An animation error record includes the *error name*, not potentially sensitive exception strings. Inspect the relevant element and browser console for the original DOMException.
- Empty records usually mean debug is disabled, or no tracked event fired after it was enabled.
- The HUD is intentionally static between explicit `.update()` calls: it avoids adding a timer/render loop that could change the measurements.

## Common causes of choppy UI

| Symptom | What to inspect | Improvement |
|---|---|---|
| Hover stutters | Paint flashing / long tasks | Prefer opacity/transform, avoid large box-shadow/filter effects |
| Animation does not start | Element refs, browser WAAPI availability, reduce-motion preference | Create only after DOM mount and inspect developer console |
| Exit disappears immediately | Presence direct-child requirement and stable keys | Give exiting direct motion children unique keys |
| Drag feels sticky | Pointer capture, scroll competition, CSS transitions | Use `touchAction` appropriately, pause CSS transitions during drag |
| Canvas blanks after animation | App's `draw()` callback | Clear/repaint every frame; package only interpolates numbers |
| App retains listeners | Cleanup under navigation and React StrictMode | Every effect and scope must return an idempotent cleanup |
| More jitter on 120Hz | Assumed 60Hz budgets | Use a suitable budget, profile actual display refresh rate |

## Privacy and security

Do not log passwords, authentication material, prompt text, customer information, full DOM nodes or screenshots. Debug sessions are local-only but the containing app may choose to forward or export them. Avoid bundling development HUDs into release UI by accident, especially for applications with confidential information.

## Verification levels

- **Unit:** deterministic numeric/test-driver assertions, no browser.
- **Component:** React mount/unmount and SSR smoke tests against supported versions (requires installing React dependencies).
- **Browser:** Playwright/WebDriver screenshot and interactive tests across engines.
- **Device:** touch, reduced-motion, laptop power saver, monitor refresh rates.
- **Release:** npm registry rights, GitHub Actions, package provenance and package install into a fresh consumer; only publish after these pass.
