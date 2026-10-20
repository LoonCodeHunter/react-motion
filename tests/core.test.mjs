import test from "node:test";
import assert from "node:assert/strict";
import { createReactMotion } from "../dist/es/react.js";
import { animate, stagger } from "../dist/es/dom.js";
import { linear, easeIn, easeOut, easeInOut, steps, cubicBezier } from "../dist/es/easing.js";
import { spring } from "../dist/es/spring.js";
import { motionValue } from "../dist/es/motion-value.js";

 test("easing helpers calculate bounded progress and reject invalid steps", () => {
  assert.equal(linear(0.5), 0.5);
  assert.equal(easeIn(0.5), 0.25);
  assert.equal(easeOut(0.5), 0.75);
  assert.equal(easeInOut(0), 0);
  assert.equal(easeInOut(1), 1);
  assert.equal(steps(4)(0.6), 0.5);
  const curve = cubicBezier(0.2, 0.8, 0.2, 1);
  assert.ok(Math.abs(curve(0)) < 1e-4);
  assert.ok(Math.abs(curve(1) - 1) < 1e-4);
  assert.ok(curve(0.5) > 0.5);
  assert.throws(() => steps(0), RangeError);
});

test("spring exposes finite samples, a settling duration, and input validation", () => {
  const curve = spring({ stiffness: 220, damping: 18, mass: 1 });
  const samples = curve.sample(12);
  assert.ok(curve.duration > 0);
  assert.equal(samples.length, 12);
  assert.equal(samples[0], 0);
  assert.ok(Math.abs(samples.at(-1) - 1) < 0.01);
  assert.throws(() => spring({ mass: 0 }), RangeError);
  assert.throws(() => spring({ stiffness: 0 }), RangeError);
  assert.throws(() => spring({ damping: -1 }), RangeError);
});

test("motion values notify subscribers once per changed value and support cleanup", () => {
  const value = motionValue(1);
  let notifications = 0;
  const unsubscribe = value.subscribe(() => { notifications += 1; });
  value.set(2);
  value.set(2);
  assert.equal(value.get(), 2);
  assert.equal(notifications, 1);
  assert.ok(value.velocity() >= 0);
  unsubscribe();
  value.set(3);
  assert.equal(notifications, 1);
});

test("stagger returns predictable millisecond offsets", () => {
  const delay = stagger(12, 4);
  assert.equal(delay(0), 4);
  assert.equal(delay(1), 16);
  assert.equal(delay(3), 40);
});

test("animate uses defaults and never lets a duration override reduced motion", () => {
  const previous = globalThis.matchMedia;
  let capturedOptions;
  const target = {
    animate(_keyframes, options) {
      capturedOptions = options;
      return { finished: Promise.resolve(), options };
    },
  };
  try {
    globalThis.matchMedia = () => ({ matches: false });
    animate(target, [{ opacity: 0 }, { opacity: 1 }]);
    assert.equal(capturedOptions.duration, 300);
    assert.equal(capturedOptions.fill, "both");

    globalThis.matchMedia = () => ({ matches: true });
    animate(target, [{ opacity: 0 }, { opacity: 1 }], { duration: 700 });
    assert.equal(capturedOptions.duration, 0);
    assert.equal("reducedMotion" in capturedOptions, false);

    animate(target, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, reducedMotion: true });
    assert.equal(capturedOptions.duration, 0);

    animate(target, [{ opacity: 0 }, { opacity: 1 }], { duration: 700, reducedMotion: false });
    assert.equal(capturedOptions.duration, 700);
  } finally {
    if (previous === undefined) delete globalThis.matchMedia;
    else globalThis.matchMedia = previous;
  }
});

test("React adapter can be created with an injected React-compatible implementation", () => {
  const mockReact = {
    forwardRef: (render) => render,
    useState: (initial) => [initial, () => {}],
    createElement: (type, props, ...children) => ({ type, props, children }),
  };
  const { Div, DivCenter } = createReactMotion(mockReact);
  const element = Div({
    as: "button",
    animate: { opacity: 1, x: 3, y: 4, scale: 2, rotate: 5 },
    transition: { duration: 120, easing: "ease-out" },
    style: { color: "red" },
    type: "button",
  }, null);
  assert.equal(element.type, "button");
  assert.equal(element.props.style.opacity, 1);
  assert.equal(element.props.style.transform, "translateX(3px) translateY(4px) scale(2) rotate(5deg)");
  assert.equal(element.props.style.transition, "all 120ms ease-out");
  const centered = DivCenter({ children: "centered" }, null);
  assert.equal(centered.type, Div);
  assert.equal(centered.props.center, true);
});
