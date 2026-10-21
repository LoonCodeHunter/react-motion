# Fair performance comparison protocol

**Do not label Kovari "faster than Motion" until repeatable third-party-style measurements pass.** Comparisons should use the same target browser, DOM hierarchy, rendering workload, machine, browser build, animation durations and reduced-motion settings.

## Workloads

- **Entrance:** 100/500/1,000 cards animating transform and opacity with 150 ms stagger.
- **Interaction:** 250 buttons hovered/pressed repeatedly; collect event-to-frame latency.
- **Reorder:** 50 cards moving through grid/list geometry changes, including nested transforms.
- **Presence:** 100 keyed items enter/exit rapidly with re-entry before exit completion.
- **Gesture:** fixed pointer trajectory across constraints, sampled with mouse and touchscreen emulation.
- **Scroll:** 200 scroll-linked transforms during a controlled 3,000 px scroll.
- **Import:** minified+gzip/brotli entry-point weights, module parse cost and cold import.

## Measurements

- FPS median, 95th percentile frame time and long tasks; warmup + at least 15 sampled runs.
- Main thread CPU duration, JS heap before/after teardown, retained listeners after 100 cycles.
- Correctness: all final styles; interruption handling; focus/keyboard/reduced motion.
- Bundle sizes for **equivalent features**, not root-import vs cherry-picked subpaths.
- Device: exact CPU/GPU, OS, browser versions and CPU throttling settings in the report.

## Reporting

Run A/B on the same machine, alternate order, report raw samples and confidence intervals. Identify any features unsupported by either library rather than scoring them as zero performance. Kovari Motion Score is its own health signal, **not** an A/B library benchmark.
