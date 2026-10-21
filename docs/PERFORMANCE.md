# Performance, benchmarks and Motion Score

WAAPI is the preferred browser-native playback mechanism for DOM keyframes. High-frequency data updates can instead use observable values and frame drivers. Performance depends on DOM size, animated properties, device, browser, display refresh rate, page scripts and whether the tab is foregrounded.

## Practical guidance

- Prefer `transform` and `opacity` for frequent animation where possible; profile paint/layout costs.
- Avoid synchronous layout measurement on every scroll callback.
- Dispose animation handles, observers and subscribers during unmount or route changes.
- Be selective with `will-change`, especially for hundreds of elements.
- Limit stagger chains so later items don't become unavailable for too long.
- Use stable render and scroll targets; avoid redundant React renders for per-frame values.

## Fair comparison against Motion/Framer

Choose two exact published package versions, identical example DOM trees, equal keyframe curves/durations and identical browser/hardware. Measure transferred gzip/brotli bytes, initialization, React hydration/render cost, animation frame cadence, long tasks, memory, input latency, accessibility and reduced-motion outcomes. Publish trace data and reproduction code. **No measured superiority is claimed without that experiment.**

## Motion Score

The repository-specific 0–100 Motion Score uses 40% frame cadence, 20% spring throughput, 20% motion-value throughput and 20% animation timing. Bands: 0–49 red, 50–69 yellow, 70–89 green, 90–100 yellow-green. It is a synthetic score scoped to a particular browser runner, **not** a cross-library leaderboard or accessibility certification. Hosted CI must actually run before the badge can be considered authoritative. See [MOTION-SCORE.md](./MOTION-SCORE.md).
