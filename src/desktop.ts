/** Desktop WebView renderer integration (Electron, Tauri, Chromium web apps).
 * Renderer-only: does not import Node.js, Electron, invoke, or bridge native APIs.
 */
import {createWebMotion, type WebMotion, type WebMotionOptions} from './web.js';
export interface DesktopMotion extends WebMotion { readonly backgrounded:boolean }
export interface DesktopMotionOptions extends WebMotionOptions { pauseWhenHidden?: boolean; document?: Pick<Document,'hidden'|'addEventListener'|'removeEventListener'> }
export function createDesktopMotion(options:DesktopMotionOptions={}):DesktopMotion {
  const scope=createWebMotion(options);
  const doc=options.document??(typeof document==='undefined'?undefined:document);
  const pauseWhenHidden=options.pauseWhenHidden!==false;
  let backgrounded=Boolean(doc?.hidden);
  const onChange=()=>{backgrounded=Boolean(doc?.hidden);if(pauseWhenHidden){if(backgrounded)scope.pause();else scope.play();}};
  if(doc&&pauseWhenHidden)doc.addEventListener('visibilitychange',onChange);
  return {
    ...scope,
    // Explicit forwarding preserves getter behaviour (spread would snapshot getters).
    animate(target,frames,opts){const animations=scope.animate(target,frames,opts);if(backgrounded&&pauseWhenHidden)scope.pause();return animations;},
    stagger(target,frames,opts){const animations=scope.stagger(target,frames,opts);if(backgrounded&&pauseWhenHidden)scope.pause();return animations;},
    cancel:()=>scope.cancel(),pause:()=>scope.pause(),play:()=>scope.play(),
    get active(){return scope.active;},get disposed(){return scope.disposed;},get backgrounded(){return backgrounded;},
    dispose(){doc?.removeEventListener('visibilitychange',onChange);scope.dispose();},
  };
}
