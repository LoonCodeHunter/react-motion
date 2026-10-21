'use client';
/** Direct React integration. The core package remains React-independent. */
import * as React from 'react';
import { createReactMotion, type ReactLike } from './react.js';
const instance = createReactMotion(React as unknown as ReactLike);
export const motion = instance.motion;
export const AnimatePresence = instance.AnimatePresence;
export const MotionConfig = instance.MotionConfig;
export const useMotionValue = instance.useMotionValue;
export const useTransform = instance.useTransform;
export const useSpring = instance.useSpring;
export const useMotionValueEvent = instance.useMotionValueEvent;
export const useAnimationControls = instance.useAnimationControls;
export const useReducedMotion = instance.useReducedMotion;
export const useScroll = instance.useScroll;
export { createReactMotion } from './react.js';
export type { MotionComponent, MotionProps, ReactLike, MotionConfigProps } from './react.js';

// Optional opt-in hooks. The core pan, scrubber and inspector modules remain React-free.
import { pan, type PanOptions } from './pan.js';
import { bindScrollAnimation, type SeekableAnimation, type ScrollScrubOptions } from './scroll-scrub.js';
import { createMotionInspector, type MotionInspectorOptions } from './inspector.js';
import type { MotionValue } from './motion-value.js';

/** Attach pointer-pan callbacks to a stable ref. Automatically cleans up on unmount. */
export function usePan(ref: {current: Element | null}, options: PanOptions = {}):void {
  const latest = React.useRef(options);
  latest.current = options;
  const { axis, threshold, velocityWindow, swipeDistance, swipeVelocity, preventDefault } = options;
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const callbacks: PanOptions = {
      axis, threshold, velocityWindow, swipeDistance, swipeVelocity, preventDefault,
      onStart: (e, info) => latest.current.onStart?.(e, info),
      onMove: (e, info) => latest.current.onMove?.(e, info),
      onEnd: (e, info) => latest.current.onEnd?.(e, info),
      onCancel: (e, info) => latest.current.onCancel?.(e, info),
      onSwipe: (e, info) => latest.current.onSwipe?.(e, info),
    };
    return pan(element, callbacks);
  }, [ref, axis, threshold, velocityWindow, swipeDistance, swipeVelocity, preventDefault]);
}

/** Reconnects a scroll signal to a browser animation when the source or target changes. */
export function useScrollScrub(source: Pick<MotionValue<number>, 'get' | 'subscribe'> | null,
  animationRef: {current: SeekableAnimation | null}, options: ScrollScrubOptions):void {
  const { duration, range, easing, pause } = options;
  const rangeStart=range?.[0],rangeEnd=range?.[1];
  React.useEffect(() => {
    if (!source || !animationRef.current) return;
    const controller = bindScrollAnimation(source, animationRef.current, {
      duration, range: rangeStart !== undefined && rangeEnd !== undefined ? [rangeStart, rangeEnd] : undefined,
      easing, pause,
    });
    return () => controller.stop();
  }, [source, animationRef, duration, rangeStart, rangeEnd, easing, pause]);
}

/** A per-component, explicitly opt-in trace recorder. */
export function useMotionInspector(options: MotionInspectorOptions = {}) {
  const [inspector] = React.useState(() => createMotionInspector(options));
  return inspector;
}
