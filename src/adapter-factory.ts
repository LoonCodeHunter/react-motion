/** Dependency-injected animation integrations. No optional provider is imported by Kovari. */
import { createReactMotionBridge, fromExternalMotionValue, syncToExternalMotionValue, type ExternalMotionValue } from './provider-bridge.js';
import { motionValue, type MotionValue } from './motion-value.js';
import type { ReactLike } from './react.js';

export type AnimateFunction = (target: any, keyframes: any, options?: any) => unknown;
export interface MotionAdapterOptions {
  name?: string;
  react?: ReactLike;
  /** Optional imperative animation provider (e.g. animate from motion). */
  animate?: AnimateFunction;
  /** Optional declarative component collection (e.g. motion from motion/react). */
  motion?: Record<string, unknown> | ((...args: any[]) => any);
  AnimatePresence?: unknown;
  MotionConfig?: unknown;
  /** A separate backend for WebGL, Canvas, SVG or other renderers. */
  driver?: AnimateFunction;
  reducedMotion?: 'user' | 'always' | 'never';
  onError?: (error: unknown) => void;
}
export type AdapterKind = 'react' | 'animate' | 'provider' | 'custom' | 'composed';
export interface MotionEngineAdapter {
  readonly name: string;
  readonly kind: AdapterKind;
  readonly capabilities: Readonly<{
    react: boolean; imperative: boolean; components: boolean; presence: boolean;
    config: boolean; customDriver: boolean; values: true;
  }>;
  readonly motion?: MotionAdapterOptions['motion'];
  readonly AnimatePresence?: unknown;
  readonly MotionConfig?: unknown;
  /** Invoke the selected imperative provider. Throws clearly if no animate provider exists. */
  animate(target: any, keyframes: any, options?: any): unknown;
  /** Invoke a custom rendering backend, falling back to animate. */
  drive(target: any, keyframes: any, options?: any): unknown;
  createValue<T>(initial: T): MotionValue<T>;
  fromExternalValue<T>(external: ExternalMotionValue<T>): ReturnType<typeof fromExternalMotionValue<T>>;
  syncToExternalValue<T>(source: MotionValue<T>, target: Pick<ExternalMotionValue<T>, 'set'>): () => void;
  isSupported(feature: keyof MotionEngineAdapter['capabilities']): boolean;
}
function isReactLike(value: unknown): value is ReactLike {
  if (!value || typeof value !== 'object') return false;
  const source = value as Partial<ReactLike>;
  return typeof source.createElement === 'function' && typeof source.forwardRef === 'function' && typeof source.useState === 'function';
}
function checkFunction(value: unknown, key: string): void {
  if (value !== undefined && typeof value !== 'function') throw new TypeError(`${key} must be a function`);
}
/** Build an explicit, capability-reporting adapter for an optional provider. */
export function createMotionAdapter(options: MotionAdapterOptions): MotionEngineAdapter {
  if (!options || typeof options !== 'object') throw new TypeError('Adapter options must be an object');
  if (options.react !== undefined && !isReactLike(options.react)) throw new TypeError('react must provide React hooks and createElement');
  checkFunction(options.animate, 'animate');
  checkFunction(options.driver, 'driver');
  if (options.motion !== undefined && options.motion !== null && typeof options.motion !== 'object' && typeof options.motion !== 'function') {
    throw new TypeError('motion must be a component provider');
  }
  if (options.reducedMotion !== undefined && !['user', 'always', 'never'].includes(options.reducedMotion)) {
    throw new TypeError('reducedMotion must be user, always, or never');
  }
  checkFunction(options.onError, 'onError');
  const react = options.react !== undefined;
  const imperative = options.animate !== undefined;
  const components = options.motion != null;
  const customDriver = options.driver !== undefined;
  if (!react && !imperative && !components && !customDriver) throw new TypeError('Supply react, animate, motion, or driver');
  const count = Number(react) + Number(imperative) + Number(components) + Number(customDriver);
  const kind: AdapterKind = count > 1 ? 'composed' : react ? 'react' : imperative ? 'animate' : components ? 'provider' : 'custom';
  const capabilities = Object.freeze({react, imperative, components, presence: options.AnimatePresence != null,
    config: options.MotionConfig != null, customDriver, values: true as const});
  const call = (fn: AnimateFunction | undefined, label: string, target: any, keyframes: any, settings?: any) => {
    if (!fn) throw new Error(`${label} is not configured for this adapter`);
    try { return fn(target, keyframes, settings); }
    catch (error) { options.onError?.(error); throw error; }
  };
  const adapter: MotionEngineAdapter = {
    name: options.name?.trim() || kind, kind, capabilities,
    motion: options.motion, AnimatePresence: options.AnimatePresence, MotionConfig: options.MotionConfig,
    animate: (target, keyframes, settings) => call(options.animate, 'animate', target, keyframes, settings),
    drive: (target, keyframes, settings) => call(options.driver ?? options.animate, 'drive', target, keyframes, settings),
    createValue: motionValue, fromExternalValue: fromExternalMotionValue,
    syncToExternalValue: syncToExternalMotionValue,
    isSupported: feature => capabilities[feature],
  };
  return Object.freeze(adapter);
}
/** An imperative Motion animate function does not itself supply React components. */
export function createAnimateAdapter(animate: AnimateFunction, options: Omit<MotionAdapterOptions, 'animate'> = {}): MotionEngineAdapter {
  return createMotionAdapter({...options, animate});
}
/** Recognize explicit React runtimes or imperative animation functions without guessing how to render. */
export function adaptMotionSource(source: ReactLike | AnimateFunction | MotionAdapterOptions): MotionEngineAdapter {
  if (typeof source === 'function') return createAnimateAdapter(source);
  if (isReactLike(source)) return createMotionAdapter({react: source});
  return createMotionAdapter(source as MotionAdapterOptions);
}
/** Build external Motion/framer-motion component pass-through plus imperative capabilities. */
export function createMotionProviderBridge(options: MotionAdapterOptions & {motion: NonNullable<MotionAdapterOptions['motion']>}) {
  const adapter = createMotionAdapter(options);
  const provider = createReactMotionBridge({motion: options.motion, AnimatePresence: options.AnimatePresence,
    MotionConfig: options.MotionConfig, name: options.name});
  return Object.freeze({...adapter, provider});
}
