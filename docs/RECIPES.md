# Animation recipes

## 1. Interactive dashboard card

```tsx
'use client';
import { motion } from '@kovari/react-motion/react';
const reveal={hidden:{opacity:0,y:18},shown:{opacity:1,y:0}};
export const DashboardCard=()=> <motion.article variants={reveal} initial="hidden" animate="shown"
 whileHover={{y:-3,scale:1.012}} whileTap={{scale:.99}}><h2>Workspace ready</h2></motion.article>;
```

## 2. Accessible determinate progress

```tsx
import {MotionProgress} from '@kovari/react-motion/ui';
export const BuildProgress=({value}:{value:number})=><MotionProgress value={value} label="Project build progress" />;
```

## 3. Viewport reveal

```tsx
import {MotionReveal} from '@kovari/react-motion/ui';
export const Section=()=> <MotionReveal><h2>Features</h2></MotionReveal>;
```

## 4. Scroll-connected indicator

```js
import {scroll} from '@kovari/react-motion/scroll';
const scroller=document.querySelector('.scroller');
const fill=document.querySelector('.progress-fill');
if(scroller&&fill){const h=scroll(scroller);const render=()=>fill.style.transform=`scaleX(${h.progress.get()})`;
 const unsubscribe=h.progress.subscribe(render);render();
 // On teardown: unsubscribe();h.stop();
}
```

## 5. External Motion card

```tsx
import {motion,AnimatePresence} from 'motion/react';
import {createReactMotionBridge} from '@kovari/react-motion/provider-bridge';
const external=createReactMotionBridge({motion,AnimatePresence});
const Card=()=>{const M=external.motion;return <M.div whileHover={{scale:1.03}}>External</M.div>};
```

Use actual real-browser React tests before shipping any recipe. Prefer semantic controls, explicit state, accessible focus and reduced-motion fallbacks.
