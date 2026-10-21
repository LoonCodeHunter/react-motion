/** Named, composable animation states shared by DOM and React adapters. */
export type AnimationTarget = Record<string, string | number | undefined>;
export interface TransitionOptions {
  duration?: number; // milliseconds, preserving the pre-1.0 API
  delay?: number;
  easing?: string;
  type?: 'tween' | 'spring';
  stiffness?: number;
  damping?: number;
  mass?: number;
}
export type VariantState = { [property: string]: string | number | TransitionOptions | undefined; transition?: TransitionOptions };
export type Variants = Record<string, VariantState | ((custom: unknown) => VariantState)>;
export type VariantInput = AnimationTarget | VariantState | string | readonly string[] | false | undefined;
export function resolveVariant(input: VariantInput, variants: Variants = {}, custom?: unknown): VariantState {
  if (!input) return {};
  if (Array.isArray(input)) return input.reduce<VariantState>((acc, name) => ({...acc, ...resolveVariant(String(name), variants, custom)}), {});
  if (typeof input === 'string') {
    const variant = variants[input];
    if (!variant) return {};
    return typeof variant === 'function' ? variant(custom) : {...variant};
  }
  return {...(input as AnimationTarget)};
}
export function targetValues(target: VariantState): AnimationTarget {
  const { transition: _transition, ...values } = target;
  return values as AnimationTarget;
}

export interface VariantStaggerOptions {
  stagger?:number;
  delay?:number;
  reverse?:boolean;
  custom?:(index:number)=>unknown;
}
/** Resolve a batch of named variants with explicit per-child delay in milliseconds. */
export function staggerVariants(names:readonly VariantInput[],variants:Variants,options:VariantStaggerOptions={}):VariantState[]{
  const stagger=options.stagger??55,delay=options.delay??0;
  if(!Number.isFinite(stagger)||stagger<0||!Number.isFinite(delay)||delay<0)throw new RangeError('Invalid stagger timing');
  return names.map((name,index)=>{
    const variant=resolveVariant(name,variants,options.custom?.(index));
    const position=options.reverse?names.length-index-1:index;
    return {...variant,transition:{...variant.transition,delay:(variant.transition?.delay??0)+delay+stagger*position}};
  });
}
