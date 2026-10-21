/** Scoped, imperative Web Animations API for plain HTML, Vue, Svelte, Electron and Tauri renderers.
 * No React import, implicit stylesheet, or global listener is installed.
 */
import { animate as nativeAnimate, stagger, type AnimateOptions } from './dom.js';

export type WebTarget = Element | string | Iterable<Element>;
export interface WebMotionOptions { root?: ParentNode; reducedMotion?: boolean }
export interface WebMotion {
  animate(target: WebTarget, frames: Keyframe[] | PropertyIndexedKeyframes, options?: AnimateOptions): Animation[];
  stagger(target: WebTarget, frames: Keyframe[] | PropertyIndexedKeyframes,
    options?: AnimateOptions & { each?: number; start?: number }): Animation[];
  cancel(): void;
  pause(): void;
  play(): void;
  readonly active: number;
  readonly disposed: boolean;
  dispose(): void;
}

/** Create an independently disposable animation scope. Selectors are resolved only in `root`. */
export function createWebMotion(options: WebMotionOptions = {}): WebMotion {
  const current = new Set<Animation>();
  let disposed = false;
  const select = (target: WebTarget): Element[] => {
    if (typeof target === 'string') {
      const root = options.root ?? (typeof document === 'undefined' ? undefined : document);
      if (!root || !('querySelectorAll' in root)) throw new Error('CSS selectors require a DOM root');
      return [...root.querySelectorAll(target)];
    }
    if (target && typeof (target as Element).animate === 'function') return [target as Element];
    if (target && typeof (target as Iterable<Element>)[Symbol.iterator] === 'function') {
      const elements = [...target as Iterable<Element>];
      if (elements.some(item => !item || typeof item.animate !== 'function')) throw new TypeError('Every target must support Element.animate');
      return elements;
    }
    throw new TypeError('Expected an Element, selector, or iterable of Elements');
  };
  const animateMany = (target: WebTarget, frames: Keyframe[] | PropertyIndexedKeyframes,
    options: AnimateOptions, each?: number, start?: number): Animation[] => {
    if (disposed) throw new Error('Motion scope has been disposed');
    const elements = select(target);
    const reduced = options.reducedMotion ?? scopeReducedMotion ?? globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const delays = each === undefined || reduced ? undefined : stagger(each, start);
    const results: Animation[] = [];
    try {
      elements.forEach((element, index) => {
        const animation = nativeAnimate(element, frames, {
          ...options,
          reducedMotion: options.reducedMotion ?? scopeReducedMotion,
          delay: reduced ? 0 : (typeof options.delay === 'number' ? options.delay : 0) + (delays?.(index) ?? 0),
        });
        current.add(animation);
        results.push(animation);
        void animation.finished.then(() => current.delete(animation), () => current.delete(animation));
      });
    } catch (error) {
      // A partially failed batch must not leave orphaned animations.
      results.forEach(animation => { animation.cancel(); current.delete(animation); });
      throw error;
    }
    return results;
  };
  const scopeReducedMotion = options.reducedMotion;
  return {
    animate: (target, frames, config = {}) => animateMany(target, frames, config),
    stagger: (target, frames, { each = 55, start = 0, ...config } = {}) => {
      if (![each, start].every(n => Number.isFinite(n) && n >= 0)) throw new RangeError('Stagger timing must be nonnegative finite milliseconds');
      return animateMany(target, frames, config, each, start);
    },
    cancel: () => { for (const animation of [...current]) { animation.cancel(); current.delete(animation); } },
    pause: () => { for (const animation of current) animation.pause(); },
    play: () => { for (const animation of current) animation.play(); },
    get active() { return current.size; },
    get disposed() { return disposed; },
    dispose() { if (disposed) return; disposed = true; for (const animation of [...current]) { animation.cancel(); current.delete(animation); } },
  };
}
