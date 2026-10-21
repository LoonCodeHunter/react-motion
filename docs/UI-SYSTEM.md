# Animated UI design system

The optional `@kovari/react-motion/ui` package is a **React** layer; import `@kovari/react-motion/ui.css` separately. The low-level core never pulls UI CSS implicitly. Its components accept a `className` for product-specific styling and keep semantic host elements where appropriate.

| Component | Element | Purpose |
|---|---|---|
| `MotionButton` | button | Responsive tap/hover action |
| `MotionCard` | article | Soft hover elevation and layout |
| `MotionReveal` | div | Viewport entrance |
| `MotionBadge` | span | Animated status marker |
| `MotionProgress` | progressbar div | 0–100 determinate progress with accessible name |
| `MotionToggle` | button with aria-pressed | Controlled pressed state |
| `MotionSkeleton` | aria-hidden span | Decorative loading skeleton |

```tsx
'use client';
import {useState} from 'react';
import {MotionCard,MotionButton,MotionProgress,MotionToggle} from '@kovari/react-motion/ui';
import '@kovari/react-motion/ui.css';
function ControlPanel(){
 const [enabled,setEnabled]=useState(false);
 return <MotionCard><h2>Build status</h2>
  <MotionProgress value={66} label="Packaging progress" />
  <MotionButton type="button">View build</MotionButton>
  <MotionToggle aria-label="Enable animations" pressed={enabled} onPressedChange={setEnabled}/>
 </MotionCard>;
}
```

## Quality principles

- Keep entry animations short and purposeful; optimize for comprehension, not maximal movement.
- Preserve readable focus rings, native button semantics and sufficient contrast.
- Only animate nonessential movement when reduced-motion is requested.
- Place loading text/status near decorative skeletons; don't rely on visuals only.
- Use design-token CSS custom properties from `src/ui.css` to match your product theme.
- Prefer transforms and opacity over repeated forced-layout updates where suitable.
- Animate between actual UI states, never as a substitute for correct application state management.

## Production review

Test low-end hardware, mouse/touch/keyboard, zoom, reduced-motion mode, light/dark surfaces, and progress announcements. The included UI source is a starter design system, not a certified accessibility component library.
