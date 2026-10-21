# Electron, Tauri, React, DOM, SVG and Canvas integration

Kovari is a UI motion layer. It should never own filesystem permissions, window management, process creation or IPC. Treat Electron/Tauri as **trusted desktop application frameworks with potentially untrusted renderer content**: keep Node/native capabilities on their controlled side and use Kovari only in the renderer.

## Electron renderer

Install in the renderer's dependency graph:

```bash
npm install @kovari/react-motion
```

```ts
// renderer/motion.ts — safe in an Electron BrowserWindow renderer, not Electron main.ts
import {createDesktopMotion} from '@kovari/react-motion/desktop';
export const windowMotion = createDesktopMotion({root:document,pauseWhenHidden:true});

export function openPalette(): void {
  windowMotion.animate('#command-palette', [
    {opacity:0,transform:'translateY(-12px) scale(.98)'},
    {opacity:1,transform:'translateY(0) scale(1)'},
  ], {duration:190,easing:'cubic-bezier(.2,.8,.2,1)'});
}

window.addEventListener('beforeunload',()=>windowMotion.dispose(),{once:true});
```

Renderers already use Chromium's compositor and Web Animations API. This API does **not** require the Electron package as a runtime dependency and does not import `electron`. Use normal Content Security Policy and isolated preload interfaces; do not enable `nodeIntegration` merely for animation.

## Tauri WebView renderer

In Vite/React/Svelte code bundled inside Tauri, use the same `/desktop` entry point. When a screen is destroyed, `.dispose()` its scope. Native code and Tauri commands live outside this package. WebView engines vary by OS (WebKit vs WebView2), so test Safari/WebKit-specific WAAPI support where needed.

## React inside Electron or Tauri

Use `/react` components inside a React client view, or `/desktop` imperative scopes inside `useEffect`:

```tsx
'use client';
import {useEffect,useRef} from 'react';
import {createDesktopMotion} from '@kovari/react-motion/desktop';

export function ProjectTile() {
  const tile=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!tile.current)return;
    const scope=createDesktopMotion({root:tile.current});
    scope.animate(tile.current,[{opacity:0},{opacity:1}],{duration:180});
    return()=>scope.dispose();
  },[]);
  return <div ref={tile}>Workspace loaded</div>;
}
```

## DOM vs React vs Canvas

- Use `/react` for state-driven UI entrance/exit/hover/tap transitions.
- Use `/web` for non-React DOM or fine-grained element batches.
- Use `/svg` for path drawing and animated SVG style properties.
- Use `/canvas` for numeric model interpolation and explicit custom painting. Canvas values do not become semantic focusable controls automatically.
- Use `/desktop` for scoped WAAPI work whose lifecycle should follow document visibility.
- Use `/devtools` only in development or explicitly opted-in diagnostics.

**Units:** all durations in this package use milliseconds. Many third-party React animation libraries use seconds; translating their examples without conversion can create very long animations.

## Performance notes

Favor `transform` and `opacity` for recurring visuals. A 60 Hz screen typically provides ~16.67 ms between frames and a 120 Hz display ~8.33 ms: both represent the entire page's work, not just animation. Avoid measuring layout during every pointer move. Debounce expensive developer logging. On hidden pages the browser may throttle timers and animation frames; the `/desktop` scope pauses/restarts its own currently active native animations.

## Accessibility and cleanup

Use buttons, labels, ARIA values and keyboard alternatives for gestures. Honor the operating system's reduced-motion preference: WAAPI `animate` does so automatically unless explicitly overridden, while Canvas requires `reducedMotion` configuration. Cancel handles, unsubscribe from values, disconnect observers and dispose all scopes during unmount/navigation. Browser `beforeunload` is only a backup; component cleanup is the primary owner.
