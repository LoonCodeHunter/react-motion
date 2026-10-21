# Integration Guide — @kovari/react-motion

This guide shows how to integrate the package primitives into a React application or a browser-only feature inside Kovari Code IDE. All imports below use the public `@kovari/react-motion` exports.

## Install and confirm the runtime

```bash
npm install @kovari/react-motion
npm ls @kovari/react-motion
node --input-type=module -e "import('@kovari/react-motion').then(m => console.log(Object.keys(m).sort()))"
```

The package is ESM-first. `animate`, `scroll`, gesture helpers and layout measurements operate on browser DOM objects and must be started after the DOM node exists. Importing the helpers in a Node process is not the same as executing a DOM animation in Node.

## React adapter for simple interactive surfaces

```tsx
import React from "react";
import { createReactMotion } from "@kovari/react-motion";

const { Div, DivCenter } = createReactMotion(React);

export function ProjectTile({ title, onOpen }: { title: string; onOpen(): void }) {
  return (
    <DivCenter
      as="button"
      type="button"
      onClick={onOpen}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 160, easing: "ease-out" }}
      style={{ padding: 18, borderRadius: 14, border: "1px solid #34465d", cursor: "pointer" }}
    >
      {title}
    </DivCenter>
  );
}
```

The adapter intentionally stays small. Its current `initial` prop is a fallback visual state, not a guaranteed mount-animation lifecycle. Use the low-level `animate()` API in an effect for explicit entrance animations.

## Use a ref and cancel animations on unmount

```tsx
import { useEffect, useRef } from "react";
import { animate } from "@kovari/react-motion";

export function EntrancePanel() {
  const elementRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = animate(element, [
      { opacity: 0, transform: "translateY(12px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], { duration: reduced ? 1 : 260, easing: "ease-out", fill: "both", reducedMotion: false });
    return () => animation.cancel();
  }, []);
  return <section ref={elementRef}>Project ready</section>;
}
```

Choose the duration in application code when reduced motion is enabled. `reducedMotion: false` above only tells the helper not to override the already-selected duration; it should not be used to ignore the user's preference.

## Subscribe to scroll progress safely

```ts
import { scroll } from "@kovari/react-motion";

const panel = document.querySelector<HTMLElement>("#preview-scroll");
if (panel) {
  const tracker = scroll(panel);
  const unsubscribe = tracker.progress.subscribe(() => {
    const amount = tracker.progress.get();
    document.documentElement.style.setProperty("--preview-progress", String(amount));
  });
  // Call both when this panel's owning view is removed:
  // unsubscribe();
  // tracker.stop();
}
```

`scroll()` observes progress; it does not initiate smooth scrolling. Use `Element.scrollTo({ behavior: "smooth" })` for browser scrolling, with `behavior: "auto"` when reduced motion is preferred.

## Create a spring-driven DOM animation

```ts
import { animate, spring } from "@kovari/react-motion";

export function settle(element: HTMLElement) {
  const curve = spring({ mass: 1, stiffness: 240, damping: 20 });
  const samples = curve.sample(36);
  const keyframes = samples.map((value, index) => ({
    offset: index / Math.max(1, samples.length - 1),
    transform: `translateY(${(1 - value) * -32}px) scale(${1 + (1 - value) * 0.04})`,
  }));
  return animate(element, keyframes, { duration: curve.duration, easing: "linear", fill: "both" });
}
```

`spring()` samples a curve; it does not itself start a DOM animation. The example translates samples to Web Animations API keyframes.

## Production checklist

- Animate `transform` and `opacity` for frequent updates where possible, then profile in a real browser.
- Cancel active `Animation` objects when their view is removed or replaced.
- Unsubscribe every `motionValue`, `scroll`, `hover` and `press` callback during cleanup.
- Treat pointer animation as decoration, not the only way to activate a control; preserve keyboard support.
- Test with reduced motion both enabled and disabled.
- Avoid doing layout reads and expensive React state updates in every scroll callback.
- Keep browser benchmarks separate from claims about accessibility, battery use or every user's device.

## Further reading

- [README](../README.md) — package-wide reference and examples.
- [Motion Score method](./MOTION-SCORE.md) — what the performance badge measures.
