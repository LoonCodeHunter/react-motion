# Comparison with Motion/Framer Motion

This is a capability and validation matrix for **Kovari's v1 source candidate**, not a five-star benchmark. The external adapter can reuse independently installed Motion components without implementing those features natively in Kovari.

| Capability | Kovari candidate | Gap vs mature Motion implementations |
|---|---|---|
| Native browser keyframes | Yes | Measure real-world performance |
| Small primitives and modular subpaths | Yes | Verify bundle sizes |
| React motion elements | Yes | Browser/SSR validation pending |
| Springs and motion values | Yes | Broader interpolation/orchestration semantics |
| Hover, tap, focus, pan and swipe | Partial | Multi-touch, nested gesture arbitration and mobile browser validation |
| Drag with inertia | Partial | More constraints, controls and nested gestures |
| Layout/FLIP | Partial | Full projection, portals and nested transforms |
| Scroll and WAAPI scrubbing | Partial | Native ScrollTimeline parity, observers across nested scopes |
| Presence and exit | Partial | Nested presence propagation and advanced exit modes |
| Dynamic variants | Yes | Deep orchestration features |
| Timelines and scrubbing | Yes | Integration and interruption tests |
| Inspector diagnostics | Yes, bounded traces | Visual development tools and real-browser compositor profiling |
| Reduced motion | Source support | Comprehensive browser/a11y validation |
| UI kit | Yes | Cross-browser and screen reader testing |
| Provider bridge | Yes | Pass-through by design, not native feature equivalence |

Priority order: **P0** CI/React 18/19/browser verification, **P1** presence and layout projection, **P2** complex gestures/scroll, **P3** competitive benchmarks, devtools and ecosystem integrations. Nothing here is a measured claim of superiority over another package.
