/** SVG-first helpers built on native SVG path metrics and WAAPI. */
import {animate, type AnimateOptions} from './dom.js';

export function animateSVG(target: SVGElement, frames: Keyframe[] | PropertyIndexedKeyframes, options: AnimateOptions = {}): Animation {
  if (!target || typeof target.animate !== 'function') throw new TypeError('animateSVG requires an SVG element with Web Animations support');
  return animate(target, frames, options);
}
export interface DrawPathOptions extends AnimateOptions { reverse?: boolean }
const drawingPaths = new WeakMap<SVGGeometryElement,{animation:Animation;restore:()=>void}>();
/** Animate a stroked SVG path from hidden to drawn; caller owns the returned Animation.
 * The effect is self-contained: existing inline stroke dash styles are restored on cancel/finish.
 * Uses an explicit starting keyframe so it does not rely on a CSS paint state transition.
 */
export function drawPath(path: SVGGeometryElement, {reverse = false, ...options}: DrawPathOptions = {}): Animation {
  if (!path || typeof path.getTotalLength !== 'function' || !path.style) throw new TypeError('drawPath expects SVGGeometryElement');
  const current = drawingPaths.get(path);
  if (current) { current.animation.cancel(); current.restore(); }
  const length = path.getTotalLength();
  if (!Number.isFinite(length) || length <= 0) throw new RangeError('SVG path length must be positive');
  const existing = {array:path.style.strokeDasharray, offset:path.style.strokeDashoffset};
  const to = reverse ? -length : 0;
  path.style.strokeDasharray = `${length}`;
  path.style.strokeDashoffset = String(to);
  try {
    const animation = animate(path, [{strokeDashoffset: String(reverse ? 0 : length)}, {strokeDashoffset: String(to)}],
      {duration:650,easing:'ease-in-out',...options,fill:'both'});
    let cleaned = false;
    const restore = () => {
      if (cleaned) return; cleaned = true;
      path.style.strokeDasharray = existing.array;
      path.style.strokeDashoffset = existing.offset;
    };
    // A previous cancellation must not overwrite the next animation's inline style.
    const record={animation,restore};
    drawingPaths.set(path,record);
    void animation.finished.then(() => {
      if (drawingPaths.get(path) === record) drawingPaths.delete(path);
    }, () => {
      if (drawingPaths.get(path) !== record) return;
      restore(); drawingPaths.delete(path);
    });
    return animation;
  } catch (error) {
    path.style.strokeDasharray = existing.array;
    path.style.strokeDashoffset = existing.offset;
    throw error;
  }
}
