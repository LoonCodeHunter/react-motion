export interface AnimateOptions extends KeyframeAnimationOptions { reducedMotion?: boolean }

export function animate(
  target: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: AnimateOptions = {},
): Animation {
  const { reducedMotion, ...animationOptions } = options;
  const prefersReducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const shouldReduceMotion = reducedMotion === true || (reducedMotion !== false && prefersReducedMotion);

  // An explicit duration must not accidentally override a user's reduced-motion
  // preference. Pass only standard Web Animations API options to target.animate().
  return target.animate(keyframes, {
    ...animationOptions,
    duration: shouldReduceMotion ? 0 : animationOptions.duration ?? 300,
    fill: animationOptions.fill ?? 'both',
  });
}

export const stagger = (gap: number, start = 0) => (index: number) => start + index * gap;
