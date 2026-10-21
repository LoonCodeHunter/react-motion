// Build-only ambient typing. Consumers use their own official React type declarations.
declare module 'react' {
  export function createElement(type: any, props?: any, ...children: any[]): any;
  export function forwardRef(render: (props: any, ref: any) => any): any;
  export function useState<T>(value: T | (()=>T)): [T, (value: T | ((prev:T)=>T))=>void];
  export function useRef<T>(value: T): {current: T};
  export function useEffect(effect:()=>void|(()=>void),deps?:readonly unknown[]):void;
  export function useLayoutEffect(effect:()=>void|(()=>void),deps?:readonly unknown[]):void;
  export function createContext<T>(value:T):any;
  export function useContext<T>(context:any):T;
  export const Children: {toArray(children:any):any[]};
  export function cloneElement(element:any,props:any):any;
  export const Fragment:any;
}
