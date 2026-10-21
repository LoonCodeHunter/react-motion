import type { AnimationTarget } from './variants.js';
const units: Record<string,string> = { x:'px', y:'px', z:'px', rotate:'deg', rotateX:'deg', rotateY:'deg', skewX:'deg', skewY:'deg' };
const transforms = ['x','y','z','scale','scaleX','scaleY','rotate','rotateX','rotateY','skewX','skewY'] as const;
export function isTransform(key: string): boolean { return (transforms as readonly string[]).includes(key); }
export function transformString(values: AnimationTarget): string {
  const parts: string[] = [];
  for (const key of transforms) {
    const value = values[key]; if (value == null) continue;
    const text = typeof value === 'number' ? `${value}${units[key] ?? ''}` : String(value);
    const name = key === 'x' ? 'translateX' : key === 'y' ? 'translateY' : key === 'z' ? 'translateZ' : key;
    parts.push(`${name}(${text})`);
  }
  return parts.join(' ');
}
export function toStyle(values: AnimationTarget): Record<string, string | number> {
  const style: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value == null || isTransform(key)) continue;
    style[key] = value;
  }
  const transform = transformString(values);
  if (transform) style.transform = transform;
  return style;
}
