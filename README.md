<div align="center">
  <img src="https://raw.githubusercontent.com/LoonCodeHunter/react-motion/main/assets/icon.png" width="150" alt="Kovari React Motion icon" />

  <h1>@kovari/react-motion</h1>
  <p><strong>ESM-first animation primitives for React, TypeScript, JavaScript and Kovari Code IDE.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@kovari/react-motion"><img src="https://img.shields.io/badge/version-v0.1.2-6757ff?style=flat" alt="Version v0.1.2" /></a>
    <a href="https://www.npmjs.com/package/@kovari/react-motion"><img src="https://img.shields.io/npm/dt/%40kovari%2Freact-motion?style=flat&amp;logo=npm&amp;logoColor=white&amp;label=downloads" alt="Downloads" /></a>
    <a href="https://github.com/LoonCodeHunter/react-motion/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/LoonCodeHunter/react-motion/ci.yml?branch=main&amp;style=flat&amp;label=CI" alt="CI status" /></a>
    <a href="https://github.com/LoonCodeHunter/react-motion/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-238636?style=flat&amp;logo=opensourceinitiative&amp;logoColor=white" alt="MIT licence" /></a>
    <img src="https://img.shields.io/badge/Node.js-%3E%3D20.19-339933?style=flat&amp;logo=nodedotjs&amp;logoColor=white" alt="Node.js 20.19 or newer" />
    <a href="https://github.com/LoonCodeHunter/react-motion/actions/workflows/motion-score.yml" title="Motion Score workflow status"><img src="https://img.shields.io/github/actions/workflow/status/LoonCodeHunter/react-motion/motion-score.yml?branch=main&amp;style=flat&amp;label=Motion%20Score%20CI" alt="Motion Score CI status" /></a>
    <a href="https://github.com/LoonCodeHunter/react-motion/blob/main/docs/MOTION-SCORE.md" title="See the Motion Score methodology and history"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FLoonCodeHunter%2Freact-motion%2Fmain%2Fmotion-score.json&amp;style=flat" alt="Kovari React Motion Motion Score out of 100" /></a>
  </p>

  <img src="https://raw.githubusercontent.com/LoonCodeHunter/react-motion/main/assets/motion-score.png" alt="Kovari React Motion product overview" width="100%" />

  <p><a href="https://www.npmjs.com/package/@kovari/react-motion">npm package</a> · <a href="https://github.com/LoonCodeHunter/react-motion">GitHub repository</a> · <a href="https://github.com/LoonCodeHunter/react-motion/issues">Issues and support</a></p>
</div>


> **Version badge policy:** the `version-v0.1.2` badge above records the version in this repository (`0.1.2`). It intentionally does not mirror the npm `latest` tag, which may continue to point at the previous published release until this version is published.

---

## Contents

- [Overview](#overview)
- [Why motion?](#why-motion)
- [Features](#features)
- [Compatibility](#compatibility)
- [Installation](#installation)
- [Quick start](#quick-start)
- [React adapter](#react-adapter)
- [DOM animations](#dom-animations)
- [Bubble-pop animation](#bubble-pop-animation)
- [Scroll progress and smooth scrolling](#scroll-progress-and-smooth-scrolling)
- [Springs and easing](#springs-and-easing)
- [Motion values](#motion-values)
- [Timelines](#timelines)
- [Pointer gestures](#pointer-gestures)
- [Layout transitions](#layout-transitions)
- [Debug logging](#debug-logging)
- [Interactive playground](#interactive-playground)
- [API reference](#api-reference)
- [Performance and Motion Score](#performance-and-motion-score)
- [Accessibility](#accessibility)
- [Best practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Development and release checks](#development-and-release-checks)
- [Project structure](#project-structure)
- [Relationship to Motion and Motion+](#relationship-to-motion-and-motion)
- [Licence](#licence)

## Overview

`@kovari/react-motion` is an ESM-first package of compact animation utilities. It provides browser-native element animation helpers, easing functions, spring sampling, observable motion values, scroll progress, pointer gesture subscriptions, layout measurements, timelines and a small React adapter.

It is designed for interfaces that need expressive motion without adopting a large animation framework for every interaction. Use individual primitives where you need them: animate one DOM element, observe a scroll container, sample a spring curve, or add hover/tap states to a React element.

**Package goals**

- Keep the public API modular and tree-shakeable through explicit ESM exports.
- Avoid bundling a second copy of React; React is an optional peer dependency.
- Prefer browser animation capabilities for DOM work where they are suitable.
- Make the low-level primitives composable in JavaScript and TypeScript applications.
- Keep accessibility and measurement visible rather than treating animation as decoration only.

> **Version note:** this source tree declares `@kovari/react-motion@0.1.2`. The badge is intentionally pinned to this repository version and does not read npm's `latest` tag. A source version is not a claim that this release has been published; run the consumer tests and inspect the generated tarball before announcing a release.

## Why motion?

Motion can communicate hierarchy, causality and progress. A subtle entrance can show where new content appeared; a progress indicator can make a long operation feel predictable; a spring-like return can make a draggable object feel connected to the user's input.

Browser-native animations can run transform and opacity keyframes efficiently, while JavaScript APIs are valuable for spring sampling, timelines, interruption, gesture subscriptions, scroll-linked states and layout transitions. For a tiny self-contained hover effect, **CSS is still a good choice**. This package is intended to complement platform APIs, not replace every CSS transition.

## Features

| Capability | Public API | Typical use |
|---|---|---|
| DOM keyframe animations | `animate()` | Pop effects, transitions and animated DOM elements |
| Staggered timing | `stagger()` | Sequencing lists, bubbles and cards |
| Easing functions | `linear`, `easeIn`, `easeOut`, `easeInOut`, `back()`, `cubicBezier()`, `steps()` | Curves and timing control |
| Spring sampling | `spring()` | Generate values for custom spring-like keyframes |
| Observable values | `motionValue()` | Store a value, subscribe to updates and inspect velocity |
| Scroll progress | `scroll()` | Progress bars, scroll-reactive markers and content effects |
| Pointer subscriptions | `hover()`, `press()` | Pointer-enter/leave and press/release state |
| Layout measurements | `measure()`, `layout()` | Animate between element geometries |
| Coordinated animation | `timeline()` | Play, pause, reverse and cancel a set of animations |
| React components | `createReactMotion(React)` | Simple pointer-driven `Div` and `DivCenter` components |
| Debug record buffer | `debug` | Inspect opt-in diagnostic records |

## Compatibility

- **Module format:** ESM (`"type": "module"`).
- **Node.js engine declared by the package:** Node.js 20.19 or newer.
- **React peer dependency:** React `^18.2.0` or `^19.0.0` and matching React DOM versions. React peer dependencies are optional at install time because the non-React utilities can be used without the React adapter.
- **DOM requirements:** `animate()`, `scroll()`, pointer helpers and layout helpers require browser DOM objects. Do not execute DOM-dependent examples during server-side rendering.
- **TypeScript:** declaration files are published in `dist/types/`.
- **Browser behavior:** animation timing and performance can vary by browser, operating system, refresh rate and power mode.

## Installation

```bash
npm install @kovari/react-motion
```

For the React adapter in a React application, ensure React and React DOM are installed too:

```bash
npm install react react-dom @kovari/react-motion
```

Import only the primitives you use. The root export exposes the public API, and package subpaths are available for more focused imports.

```js
import { animate, spring, motionValue, scroll } from "@kovari/react-motion";
```

The package is ESM-first. In Node.js, use an ESM file (`.mjs`) or a project configured for ESM. DOM-specific methods still need a browser environment even though they can be imported by Node.js.

## Quick start

### Animate an element with JavaScript

```js
import { animate } from "@kovari/react-motion";

const card = document.querySelector("[data-motion-card]");

if (card) {
  const animation = animate(
    card,
    [
      { opacity: 0, transform: "translateY(16px) scale(.98)" },
      { opacity: 1, transform: "translateY(0) scale(1)" },
    ],
    {
      duration: 420,
      easing: "cubic-bezier(.2,.8,.2,1)",
      fill: "both",
    },
  );

  // Optional: stop the animation when the owning view is removed.
  // animation.cancel();
}
```

```html
<article data-motion-card>
  <h2>Welcome to Kovari Motion</h2>
  <p>A small keyframe example driven by the package.</p>
</article>
```

`animate()` delegates keyframe playback to the element's browser animation API and returns an `Animation` object. You can inspect its state, await `finished`, or call methods such as `cancel()`, `pause()`, `play()` and `reverse()`.

### Animate a React card with TypeScript

```tsx
import React from "react";
import { createReactMotion, spring } from "@kovari/react-motion";

const { DivCenter } = createReactMotion(React);

export function MotionCard() {
  const transitionDuration = spring({ stiffness: 200 }).duration;

  return (
    <DivCenter
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: transitionDuration, easing: "cubic-bezier(.2,.8,.2,1)" }}
      style={{
        minHeight: 140,
        padding: 24,
        borderRadius: 18,
        border: "1px solid #334155",
        background: "#0f172a",
        color: "#f8fafc",
        cursor: "pointer",
      }}
    >
      <strong>Kovari Motion</strong>
      <span>Move over or press this card.</span>
    </DivCenter>
  );
}
```

The package's current React adapter is deliberately small. `Div` and `DivCenter` choose visual values from `whileTap`, `whileHover`, `animate` or `initial`, then apply them with CSS transitions. In this version `initial` is a fallback state; it is **not** a separate mount-animation lifecycle. For a guaranteed entrance sequence, call `animate()` from an effect after the DOM element exists.

## React adapter

`createReactMotion(React)` receives the React implementation from your app, which allows the package to avoid bundling another React runtime. It returns two components:

- `Div`: an element wrapper with pointer-driven `whileHover` and `whileTap` values.
- `DivCenter`: the same wrapper with flex centring enabled.

### JavaScript (`react`)

```react
import React from "react";
import { createReactMotion } from "@kovari/react-motion";

const { Div, DivCenter } = createReactMotion(React);

export function Actions() {
  return (
    <DivCenter
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, scale: 1.025 }}
      whileTap={{ scale: 0.975 }}
      transition={{ duration: 180, easing: "ease-out" }}
      style={{ padding: 18, borderRadius: 14, background: "#182a44", color: "white" }}
    >
      Open project
    </DivCenter>
  );
}
```

### TypeScript (`tsx`)

```tsx
import React from "react";
import { createReactMotion } from "@kovari/react-motion";

const { Div } = createReactMotion(React);

type InteractiveTileProps = {
  label: string;
  onActivate: () => void;
};

export function InteractiveTile({ label, onActivate }: InteractiveTileProps) {
  return (
    <Div
      as="button"
      type="button"
      onClick={onActivate}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      whileHover={{ x: 3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 160, easing: "ease-out" }}
      style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid #456", cursor: "pointer" }}
    >
      {label}
    </Div>
  );
}
```

### React adapter value shape

The adapter currently recognises these visual values:

| Property | Effect |
|---|---|
| `opacity` | Sets element opacity |
| `x` | Translates horizontally in pixels |
| `y` | Translates vertically in pixels |
| `scale` | Scales the element |
| `rotate` | Rotates the element in degrees |

`transition.duration` is measured in **milliseconds**, and `transition.easing` is a CSS easing string. The adapter is not a full declarative animation framework: it does not promise variants, exit animations, automatic layout measurement or spring physics at the component level. Use the lower-level APIs for those workflows.

## DOM animations

### `animate(target, keyframes, options)`

```ts
animate(
  target: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options?: AnimateOptions,
): Animation;
```

`options` uses the browser's `KeyframeAnimationOptions` and also accepts `reducedMotion?: boolean`. The returned object is a native browser `Animation` instance.

```js
import { animate, stagger } from "@kovari/react-motion";

const cards = [...document.querySelectorAll(".project-card")];
const delayFor = stagger(65, 20);

const animations = cards.map((card, index) =>
  animate(
    card,
    [
      { opacity: 0, transform: "translateY(14px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    {
      duration: 360,
      delay: delayFor(index),
      easing: "cubic-bezier(.2,.8,.2,1)",
      fill: "both",
    },
  ),
);

// To cancel a group later:
// animations.forEach((animation) => animation.cancel());
```

### `stagger(gap, start = 0)`

`stagger()` returns a function that calculates a delay from an item's zero-based index. The `gap` and `start` values are milliseconds.

```js
import { stagger } from "@kovari/react-motion";

const getDelay = stagger(80, 25);
console.log(getDelay(0)); // 25
console.log(getDelay(1)); // 105
console.log(getDelay(2)); // 185
```

Use staggered timing sparingly: long lists can make the final item appear much later than the first. Respect reduced-motion preferences, and consider shorter durations for repeated effects.

## Bubble-pop animation

The following example uses the real `animate()` helper and `stagger()` utility. It assumes that the bubble element has already been added to the DOM.

```js
import { animate, stagger } from "@kovari/react-motion";

const delayFor = stagger(55);

export function popBubbles(bubbles) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  return bubbles.map((bubble, index) =>
    animate(
      bubble,
      [
        { transform: "translate(-50%, -50%) scale(.2)", opacity: 0 },
        { transform: "translate(-50%, -70%) scale(1)", opacity: 1, offset: 0.38 },
        { transform: "translate(-50%, -140%) scale(1.45)", opacity: 0 },
      ],
      {
        duration: prefersReducedMotion ? 1 : 760,
        delay: prefersReducedMotion ? 0 : delayFor(index),
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "forwards",
        // The duration above is explicitly selected from the user's preference.
        reducedMotion: false,
      },
    ),
  );
}
```

A complete touchable demo—including bubble creation and cleanup, staggered bursts, scroll-linked objects, pointer dragging and spring sampling—is in [`MotionPlayground.mdx`](./docs/MotionPlayground.mdx). Render that file through an MDX-enabled React documentation site to make the controls interactive. GitHub's normal README display does not execute MDX.

## Scroll progress and smooth scrolling

### Track a scroll container

`scroll(container?)` returns a `MotionValue<number>` between `0` and `1`, plus a `stop()` function. With no argument, the default container is the browser's `window`. When a container is provided, its scroll position and scrollable height are used.

```tsx
import { useEffect, useRef, useState } from "react";
import { scroll } from "@kovari/react-motion";

export function ScrollMeter() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const tracker = scroll(viewport);
    const sync = () => setProgress(tracker.progress.get());
    const unsubscribe = tracker.progress.subscribe(sync);
    sync();

    return () => {
      unsubscribe();
      tracker.stop();
    };
  }, []);

  return (
    <section>
      <div role="progressbar" aria-label="Panel scroll progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
        <div style={{ width: `${progress * 100}%`, height: 6, background: "#38bdf8" }} />
      </div>
      <div ref={viewportRef} tabIndex={0} style={{ maxHeight: 280, overflowY: "auto" }}>
        {/* Add enough content here to make the panel scroll. */}
      </div>
    </section>
  );
}
```

The `scroll()` helper observes scroll progress; it does not itself command the browser to perform smooth scrolling. Use the platform's scroll APIs for that motion:

```js
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

scrollPanel.scrollTo({
  top: scrollPanel.scrollHeight,
  behavior: prefersReducedMotion ? "auto" : "smooth",
});
```

### Tie an object to scroll progress

```js
import { scroll } from "@kovari/react-motion";

const panel = document.querySelector(".scroll-panel");
const orb = document.querySelector(".scroll-orb");

if (panel && orb) {
  const tracker = scroll(panel);
  const update = () => {
    const progress = tracker.progress.get();
    orb.style.transform = `translateX(${progress * 220}px) rotate(${progress * 360}deg)`;
    orb.style.opacity = String(0.35 + progress * 0.65);
  };
  const unsubscribe = tracker.progress.subscribe(update);
  update();

  // When this view is disposed:
  // unsubscribe();
  // tracker.stop();
}
```

Always stop the tracker and unsubscribe when the owning view is disposed. For long pages, consider throttling any expensive work derived from scroll progress, and prefer compositor-friendly properties such as transform and opacity.

## Springs and easing

### `spring(options?)`

The package's `spring()` function calculates a spring curve and returns:

- `at(ms)`: the calculated spring value at a time in milliseconds.
- `duration`: an estimated settling duration in milliseconds.
- `sample(count = 60)`: a sampled array of curve values.

It **samples spring values**; it does not directly return a DOM `Animation`. Turn the samples into keyframes and pass them to `animate()` when you want to play the curve on an element.

```js
import { animate, spring } from "@kovari/react-motion";

export function springToRest(element) {
  const curve = spring({
    mass: 1,
    stiffness: 250,
    damping: 18,
    velocity: 0,
  });

  const samples = curve.sample(40);
  const keyframes = samples.map((value, index) => ({
    offset: index / Math.max(1, samples.length - 1),
    transform: `translateY(${(1 - value) * -44}px) scale(${1 + (1 - value) * 0.06})`,
  }));

  return animate(element, keyframes, {
    duration: curve.duration,
    easing: "linear",
    fill: "both",
  });
}
```

Spring configuration supports:

| Option | Meaning | Default |
|---|---|---:|
| `mass` | Effective mass of the sampled system; must be greater than zero | `1` |
| `stiffness` | Spring stiffness; must be greater than zero | `170` |
| `damping` | Damping coefficient; must be zero or greater | `26` |
| `velocity` | Initial velocity parameter | `0` |

Invalid mass, stiffness or damping values throw a `RangeError`. Sample fewer frames for short effects and more frames when a longer sequence needs finer resolution.

### Easing functions

The package exports the following easing helpers:

```js
import {
  linear,
  easeIn,
  easeOut,
  easeInOut,
  back,
  cubicBezier,
  steps,
} from "@kovari/react-motion";

const eased = easeInOut(0.4);              // A number between 0 and 1
const overshoot = back()(0.8);              // Back-style curve
const custom = cubicBezier(0.2, 0.8, 0.2, 1)(0.5);
const stepped = steps(5)(0.72);
```

These functions calculate numeric progress values. When using the DOM `animate()` helper, the browser also accepts CSS easing strings such as `"ease-out"`, `"linear"` or `"cubic-bezier(.2,.8,.2,1)"` in the keyframe options.

## Motion values

`motionValue(initial)` creates an observable value with `get()`, `set(value)`, `subscribe(callback)` and `velocity()` methods.

```js
import { motionValue } from "@kovari/react-motion";

const x = motionValue(0);
const unsubscribe = x.subscribe(() => {
  console.log("x changed:", x.get(), "velocity:", x.velocity());
});

x.set(40);
x.set(100);

// Unsubscribe when no longer needed.
unsubscribe();
```

A numeric-to-numeric update calculates a velocity estimate based on the time between updates. Non-numeric changes set velocity to `0`. Unchanged values do not notify subscribers. Keep subscribers lightweight; do not run large DOM queries or expensive rendering work on every update.

### Connect a motion value to an element

```js
import { motionValue } from "@kovari/react-motion";

const x = motionValue(0);
const tile = document.querySelector(".drag-tile");

const unsubscribe = x.subscribe(() => {
  if (tile) tile.style.transform = `translateX(${x.get()}px)`;
});
x.set(24);

// Call both when the component or view is disposed:
// unsubscribe();
```

For production drag interactions, prefer pointer capture, coordinate bounds, cancellation handling and explicit cleanup. [`MotionPlayground.mdx`](./docs/MotionPlayground.mdx) demonstrates a touchable draggable tile with those pieces.

## Timelines

`timeline(items)` creates coordinated animations and returns `duration`, `play()`, `pause()`, `reverse()`, `cancel()` and `finished`.

Each item includes:

- `target`: the DOM element to animate.
- `keyframes`: browser keyframes or property-indexed keyframes.
- `options`: optional animation settings.
- `at`: an optional start offset in milliseconds, or `"<"` to start at the same time as the previous segment.

```js
import { timeline } from "@kovari/react-motion";

const title = document.querySelector(".intro-title");
const card = document.querySelector(".intro-card");
const hint = document.querySelector(".intro-hint");

if (title && card && hint) {
  const sequence = timeline([
    {
      target: title,
      keyframes: [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
      options: { duration: 300, fill: "both", easing: "ease-out" },
      at: 0,
    },
    {
      target: card,
      keyframes: [{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "scale(1)" }],
      options: { duration: 360, fill: "both", easing: "ease-out" },
      at: 120,
    },
    {
      target: hint,
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
      options: { duration: 220, fill: "both" },
      at: "<",
    },
  ]);

  sequence.play();
  // Later: sequence.pause(), sequence.reverse(), or sequence.cancel().
}
```

Create the timeline after all target elements exist. As with any browser animation, cancel the sequence if the owning view is removed before it completes.

## Pointer gestures

The `hover(element, callback)` helper reports `true` on pointer enter and `false` on pointer leave. `press(element, callback)` reports `true` on pointer down and `false` on pointer up or cancellation. Both return a cleanup function.

```js
import { hover, press } from "@kovari/react-motion";

const tile = document.querySelector(".tile");
if (tile) {
  const stopHover = hover(tile, (isHovering) => {
    tile.dataset.hovered = String(isHovering);
  });
  const stopPress = press(tile, (isPressed) => {
    tile.dataset.pressed = String(isPressed);
  });

  // On teardown:
  // stopHover();
  // stopPress();
}
```

These are pointer-state subscriptions, not a full gesture recognition engine. They do not implement dragging constraints, velocity-based release, long-press timers or multi-touch gesture composition for you. Build those behaviors explicitly when your product needs them, and ensure touch users can still reach important controls.

## Layout transitions

`measure(element)` captures an element's current `x`, `y`, `width` and `height`. `layout(element, before, options?)` measures the element again and animates from the previous geometry to its new geometry using a transform.

```js
import { layout, measure } from "@kovari/react-motion";

const card = document.querySelector(".resizable-card");
const parent = document.querySelector(".card-grid");

if (card && parent) {
  const before = measure(card);
  parent.classList.toggle("expanded");

  requestAnimationFrame(() => {
    layout(card, before, {
      duration: 360,
      easing: "cubic-bezier(.2,.8,.2,1)",
    });
  });
}
```

The example relies on the layout change having taken effect before the `layout()` call measures the new position. In component frameworks, coordinate this with the appropriate post-update effect. Avoid dividing by zero: do not animate an element whose measured width or height is zero.

## Debug logging

The `debug` export contains an opt-in in-memory record buffer. Logging is disabled by default.

```js
import { debug } from "@kovari/react-motion";

debug.enable();
debug.log("scroll", "progress changed", { progress: 0.65 });
console.log(debug.records());

// Clear records or disable debug output when finished.
// debug.clear();
// debug.disable();
```

The debug buffer is a development aid, not a production telemetry backend. Do not place credentials, private prompts, personal information or other secrets in debug records.

## Interactive playground

The repository includes [`MotionPlayground.mdx`](./docs/MotionPlayground.mdx), a live React MDX page with four hands-on labs:

1. **Bubble-pop laboratory** — trigger five bubbles with staggered timing and fading/scaling keyframes.
2. **Scroll-linked motion** — scroll a nested panel and watch its progress indicator and cards change.
3. **Touch-and-drag laboratory** — move an object with a mouse, touch screen or stylus, then return it with a spring-sampled animation.
4. **Spring sampling** — replay a motion generated by `spring().sample()`.

### Run the playground in a real MDX renderer

An `.mdx` file is **source code**, not a self-running webpage. GitHub's README view, a plain Markdown preview, and many generic “MDX viewers” only display text; they do not compile React components, resolve npm imports, or run hooks. This is expected behaviour and cannot be fixed by changing a badge or a file extension alone.

For a working preview, use the Vite/React viewer included in the documentation bundle:

```bash
cd mdx-viewer-demo
npm install
npm run dev
```

Open the local URL printed by Vite. The viewer must compile `docs/MotionPlayground.mdx` through an MDX integration, resolve its React component imports, mount React, and run the live bubble, scroll, drag and spring labs. For reproducible documentation, point the viewer at this source package build or an exact published package version rather than depending on an unpinned `latest` version. npm must be reachable to install the viewer's React/Vite/MDX development dependencies.

If you are integrating the file into an existing docs site, configure that site to compile MDX and render its default export as a React component. Do not paste the `.mdx` file into a text-only preview and expect code blocks or component declarations to execute. For Next.js App Router, place hook-using demos in a Client Component and import that component into the MDX page.

### What the playground exercises

1. **Bubble-pop laboratory** — a button creates a burst of DOM bubbles. Kovari's `animate()` drives opacity, transform and blur keyframes; `stagger()` offsets each bubble. Finished animations are removed and references are cleaned up.
2. **Scroll-linked motion** — a real overflow panel is tracked with `scroll(panel)`. Progress updates a track and marker; the browser performs smooth scroll-to-top/bottom unless reduced motion is preferred.
3. **Touch-and-drag** — a pointer-captured tile can be moved with a mouse, touch screen, or stylus. A `motionValue()` stores its horizontal position; `spring().sample()` generates the return keyframes.
4. **Spring lab** — replay a spring sample and inspect a curve generated by the published spring API.

The playground calls only exports present in the `@kovari/react-motion@0.1.1` archive: `animate`, `stagger`, `spring`, `motionValue`, and `scroll`. It does not depend on Motion+, an external animation CDN, or an undocumented package API.

## API reference

### Root export

```js
import {
  animate, stagger,
  linear, easeIn, easeOut, easeInOut, back, cubicBezier, steps,
  spring, motionValue, scroll, timeline,
  hover, press, measure, layout,
  createReactMotion, debug,
} from "@kovari/react-motion";
```

### Published package subpaths

| Import path | Main exports |
|---|---|
| `@kovari/react-motion` | All public primitives listed above |
| `@kovari/react-motion/client` | `createReactMotion`, `motionValue`, `scroll` |
| `@kovari/react-motion/debug` | `debug` |
| `@kovari/react-motion/dom` | `animate`, `stagger` |
| `@kovari/react-motion/easing` | Easing helpers |
| `@kovari/react-motion/gestures` | `hover`, `press` |
| `@kovari/react-motion/layout` | `measure`, `layout` |
| `@kovari/react-motion/mini` | `animate`, `stagger`, `spring`, `motionValue` |
| `@kovari/react-motion/motion-value` | `motionValue` |
| `@kovari/react-motion/react` | `createReactMotion` |
| `@kovari/react-motion/scroll` | `scroll` |
| `@kovari/react-motion/spring` | `spring` |
| `@kovari/react-motion/timeline` | `timeline` |
| `@kovari/react-motion/styles.css` | `.km-center`, `.km-gpu` and reduced-motion CSS for `.km-motion` |

Importing the CSS is optional:

```js
import "@kovari/react-motion/styles.css";
```

The stylesheet provides utility classes; it does not style every component automatically. Review the CSS and avoid applying `will-change` to large numbers of elements without profiling.

## Performance and Motion Score

Kovari React Motion includes a **project-specific Motion Score from 0 to 100**. A score of `0` is the lowest band; `100` is the highest. The number is measured by a browser benchmark against the **latest published npm release**, and the badge is updated from the JSON artifact committed by the workflow. It is a repeatable trend signal—not a universal performance rating, accessibility certification, or guarantee of application smoothness.

- [Motion Score methodology, thresholds and interpretation](./docs/MOTION-SCORE.md)
- [Run history and CI summaries](https://github.com/LoonCodeHunter/react-motion/actions/workflows/motion-score.yml)
- [Workflow source](./.github/workflows/motion-score.yml)
- [Machine-readable badge data](./motion-score.json)

### Score and badge colours

| Score | Badge colour | Interpretation |
|---:|---|---|
| 0–49 | Red | Needs attention; inspect frame pacing and primitive throughput |
| 50–69 | Yellow | Developing; review the component score breakdown |
| 70–89 | Green | Good within comparable benchmark runs |
| 90–100 | Yellow-green | Excellent result on the measured runner |

The scoring code and thresholds are shared by the benchmark and regression tests in `scripts/motion-score/core.mjs`. The unit suite checks the score boundaries, zero/100 behavior, input validation and monotonic improvements. Do not change a threshold without updating that module, its tests and this table together.

### What the score measures

| Component | Weight | Inputs |
|---|---:|---|
| Frame cadence | 40% | `requestAnimationFrame` cadence during 12 concurrent DOM animations and frames taking longer than 24 ms |
| Spring sampling | 20% | Number of spring sample points generated per second |
| MotionValue updates | 20% | Numeric `motionValue.set()` updates per second while a subscriber is attached; notifications are counted for correctness |
| Animation timing | 20% | How close the median observed completion time is to the benchmark's 96 ms animation target |

Each component is normalised against a documented target, clamped to `0–100`, then combined by the stated weights and rounded to an integer. The run writes `motion-score.json`, prints the same metrics in the GitHub Actions job summary and uploads the output as a workflow artifact. It also records the npm package version that was tested, so the result is not mistaken for the repository's unpublished source version.

### Run and publish the score badge

1. Keep `scripts/motion-score/` and `.github/workflows/motion-score.yml` in the default branch.
2. Make sure the repository's Actions policy permits the `update-score` job to write `motion-score.json`. The benchmark job itself receives only `contents: read`; the write permission is restricted to the separate score-update job.
3. Run **Actions → Motion Score → Run workflow**, or push to `main`. Pull requests can benchmark and upload results but never commit the score JSON.
4. On a successful run against `main`, the workflow validates and commits the generated `motion-score.json` file. The Shields endpoint badge reads this file from `raw.githubusercontent.com` and links to the methodology documentation.
5. Inspect the workflow summary and the `kovari-react-motion-score` artifact before making performance claims.

The workflow runs on pushes to `main`, pull requests targeting `main`, manual dispatch and a weekly schedule. Commits that change only `motion-score.json` are ignored by the benchmark push trigger to avoid a loop. If repository branch protection prohibits bot pushes, the benchmark and artifact can still succeed but the badge JSON update needs a permitted update strategy (for example, allowing the score bot or using a generated pull request).

### Read results responsibly

- Compare scores produced by the same runner/browser configuration; hosted-runner load and Chromium updates can move results independently of code changes.
- The benchmark intentionally runs on the latest published version. After publishing a release, run it again to measure that release.
- It does not measure package download size, React render cost, layout shift, energy use, mobile hardware, accessibility, visual quality or every browser.
- A higher synthetic score does not replace profiling real Kovari Code IDE screens or checking reduced-motion, keyboard and touch accessibility.
- Until a successful main-branch benchmark exists, `motion-score.json` remains `pending` and the badge is neutral rather than showing an invented score.

### Local validation commands

```bash
npm ci
npm run typecheck
npm test
npm run pack:verify
npm run pack:dry
npm run release:check
```

`npm run release:check` covers source typechecking, unit tests, build/package validation and npm dry-runs. The separate Motion Score workflow measures a **published** package in a browser; the two workflows answer different questions.

## Accessibility

Motion should support understanding and control, not prevent it.

- **Respect reduced motion.** Read `prefers-reduced-motion` and reduce non-essential movement. Unless you explicitly set `reducedMotion: false`, the `animate()` helper forces duration to `0` when the browser reports a reduced-motion preference—even if the caller supplied a duration. Prefer keeping that safe default for user-facing animations.
- **Prefer useful state transitions.** Do not make information available only while an element is moving.
- **Keep interactions operable.** Buttons should remain real buttons; scroll regions should be focusable where needed; drag-only interactions should have an alternative if moving the object is essential.
- **Avoid flashing.** Do not add rapidly flashing effects or strong repeated scaling that can be uncomfortable.
- **Manage focus.** Animation must not interfere with keyboard focus, text zoom or reading order.
- **Clean up listeners.** Stop scroll tracking, unsubscribe from motion values, remove gesture listeners and cancel animations when their owning view is destroyed.

A small CSS utility is also shipped for `.km-motion`; import the stylesheet only if you use its classes:

```css
@media (prefers-reduced-motion: reduce) {
  .km-motion {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
```

This CSS cannot replace a review of JavaScript-started animations. Apply reduced-motion logic to programmatic animations as shown in the examples.

## Best practices

### Animate composited properties where practical

Prefer `transform` and `opacity` for frequent visual updates. Animating `width`, `height`, `top`, `left` and large shadows can cause layout or paint work depending on the browser and page. Profile rather than assuming all properties behave identically.

### Use lifecycle cleanup

- Keep and cancel `Animation` handles when a component unmounts or a new interaction supersedes the old one.
- Call the cleanup function returned by `hover()` and `press()`.
- For scroll trackers, unsubscribe from `progress` and call `stop()`.
- Keep a single owner for each listener/animation whenever possible.

### Avoid stale UI work

A scroll or motion-value subscriber may run often. Keep callbacks small, avoid synchronous layout reads in every callback, and consider batching UI updates. Do not update React state unnecessarily when a derived value has not changed.

### Keep a11y and performance measured separately

The Motion Score measures a narrow set of timing/throughput signals; it does not verify accessibility or UX quality. Use reduced-motion tests, keyboard tests, screen-reader checks, and real-device profiling independently.

## Badge notes

The npm downloads badge in this README is scoped to **`@kovari/react-motion`**, not `@kovari/code` or another package. It uses Shields.io's scoped npm package path, a direct `.svg` image endpoint, and an explicit “downloads” label. Its displayed value comes from npm/Shields and is not hard-coded. Newly published packages may show zero or unavailable counts until npm download statistics are available; that is different from an invalid image URL. The badge links to the exact npm package page.

## Troubleshooting

### `Cannot find package '@kovari/react-motion'`

Install the package in the same workspace that runs the app or MDX compiler:

```bash
npm install @kovari/react-motion
```

In a monorepo, check the workspace dependency declaration and run the command at the appropriate workspace root.

### `document is not defined` or `window is not defined`

DOM helpers require a browser. Do not invoke them while a server renders a page. Create DOM animations inside a browser event handler or a client-side effect, and guard any direct `window`/`document` access.

### The React component does not animate on mount

The current `Div`/`DivCenter` adapter is not a full mount-animation lifecycle. `initial` acts as a fallback visual value; with `animate` present, the adapter uses `animate` as its current value. For a deliberate entrance, use `useEffect`/`useLayoutEffect` to call `animate()` on an actual DOM ref after it exists.

### The scroll progress never changes

Make sure the container has content that overflows its client height, is actually scrollable, and is the same element passed to `scroll(container)`. Read progress from `tracker.progress.get()`. Stop old trackers and create a new tracker only when the element instance changes.

### The spring appears too slow or too sharp

Tune `stiffness`, `damping` and `mass`; then inspect the returned `duration` and samples. The sample count controls the resolution of the generated keyframes, not the physical duration. If you use a high `duration` manually, remember it is in milliseconds.

### The Motion Score badge is missing

The endpoint badge reads `motion-score.json` from the repository's default branch. Make sure the workflow has run successfully on `main`, Actions is permitted to write the generated JSON, and the raw file is publicly accessible. Pull-request benchmark results are intentionally not committed.

### CI cannot install Chromium

The benchmark workflow downloads Playwright's Chromium build and operating-system dependencies. Check the install logs, package registry availability and repository Actions permissions. The benchmark uses external package installation and can fail before measuring the library if the registry or browser download is unavailable.

## Development and release checks

In the package source repository, the published `package.json` defines these scripts:

```bash
npm install
npm run typecheck
npm test
npm run build
npm run check
npm run pack:dry
npm run publish:dry
```

What these commands are intended to do:

| Command | Purpose |
|---|---|
| `npm run typecheck` | TypeScript no-emit type check |
| `npm test` | Build and run the Node test files |
| `npm run build` | Rebuild ESM output and declaration files, then verify output |
| `npm run check` | Combine type check, tests and a pack dry run |
| `npm run pack:dry` | Check the npm tarball contents without publishing |
| `npm run publish:dry` | Run an npm publish dry run |

Use a clean working tree and review the generated tarball before publishing. The published archive supplied for this documentation task contains `dist/es`, `dist/types`, assets, `README.md`, `LICENSE`, `CHANGELOG.md` and `VALIDATION.md`; development scripts and test sources are maintained in the source repository rather than included in the package tarball.

## Project structure

The relevant published package layout is:

```text
package/
├── assets/
│   ├── icon.png
│   └── motion-score.png
├── dist/
│   ├── es/
│   │   ├── client.js
│   │   ├── debug.js
│   │   ├── dom.js
│   │   ├── easing.js
│   │   ├── gestures.js
│   │   ├── index.js
│   │   ├── layout.js
│   │   ├── mini.js
│   │   ├── motion-value.js
│   │   ├── react.js
│   │   ├── scroll.js
│   │   ├── spring.js
│   │   ├── styles.css
│   │   └── timeline.js
│   └── types/
│       └── matching .d.ts declarations and source maps
├── CHANGELOG.md
├── LICENSE
├── README.md
├── VALIDATION.md
└── package.json
```

Repository-level documentation/support files introduced with this README:

```text
react-motion/
├── .github/
│   └── workflows/
│       └── motion-score.yml   # tracked GitHub Actions benchmark
├── docs/
│   └── MotionPlayground.mdx   # interactive React MDX playground
├── README.md
└── motion-score.json          # generated by successful Motion Score workflow
```

The workflow source is [`.github/workflows/motion-score.yml`](./.github/workflows/motion-score.yml). GitHub Actions discovers it at that path. The score JSON is generated by the workflow; it is not a hand-entered performance claim.

## Relationship to Motion and Motion+

[Motion](https://motion.dev/) is a separate animation project. [Motion+](https://motion.dev/plus) is a separate paid professional toolkit. `@kovari/react-motion` does not redistribute Motion+ source, premium components, or proprietary APIs. The examples in this repository are written around Kovari's own package surface and standard browser APIs.

Do not use a Motion.dev performance badge as if it measures this npm package: that badge reports on a different site. The Motion Score badge linked above uses measurements collected by the workflow in this repository.

## Production integration guides

The root README is the API and quick-start reference. The maintained guides below focus on lifecycle management and release operations:

- [React and browser integration](./docs/INTEGRATION-GUIDE.md) — effects, cleanup, scroll subscriptions, spring sampling and accessibility.
- [Motion Score methodology](./docs/MOTION-SCORE.md) — how the browser benchmark is scored, what the badge JSON requires and how to troubleshoot the workflow.

### Use in Kovari Code IDE

Use React Motion for UI affordances such as project-card hover states, progress indicators, empty-state entrances and the small transitions around generation status. Keep project generation, policy enforcement and filesystem operations in their owning packages. Animation is presentation—not a substitute for loading/error state, keyboard access or reduced-motion support.

## Licence

`@kovari/react-motion` is distributed under the MIT licence. See [`LICENSE`](./LICENSE) for the complete licence text. When reusing this package, retain applicable licence and copyright notices. Third-party services, icons or assets used by an integrating application remain subject to their own licence terms.

---

<p align="center"><strong>Built for expressive interfaces. Keep motion clear, measurable and accessible.</strong></p>


### Dependency audit

Run `npm run security` when registry access is available. It runs `npm audit --audit-level=high`; this command may fail offline if the npm audit service is unreachable.


---

*Kovari Code IDE ecosystem: `www.kovaricode.com` is planned; the website link will be activated after the domain and site are live.*
