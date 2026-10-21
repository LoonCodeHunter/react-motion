# Advanced timeline and choreography system

All Kovari time values use **milliseconds**. `timeline()` takes segments and optional labels. Each segment targets an existing Element and WAAPI keyframes; the timeline controls playing, pausing, reversing, seeking, finishing and cancellation.

```js
import {timeline} from '@kovari/react-motion/timeline';
const sequence=timeline([
  {label:'intro',at:0},
  {target:title,keyframes:[{opacity:0},{opacity:1}],options:{duration:300,fill:'both'},at:'intro'},
  {target:panel,keyframes:[{transform:'translateY(18px)'},{transform:'none'}],options:{duration:280,fill:'both'},at:'intro+=120'},
]);
sequence.play();
// sequence.pause();sequence.seek(240);sequence.reverse();sequence.cancel();
```

## Fluent builder

```js
import {createTimelineBuilder} from '@kovari/react-motion/timeline-builder';
const builder=createTimelineBuilder().label('start',0)
 .add(title,[{opacity:0},{opacity:1}],{duration:220},'start')
 .stagger(cards,[{opacity:0},{opacity:1}],60,{duration:300},'start+=80');
console.table(builder.inspect());
const controls=builder.build();controls.play();
```

The `at` offset accepts absolute times, known label names, label-relative offsets like `intro+=120`, relative `+=N`/`-=N` and `<` to align with previous segment. Invalid labels/timing throw errors. Keep a single playback owner for each DOM element. Interrupting one sequence should cancel its handles; don't rely on a filled browser animation to be persistent application state.

For large groups, limit the end-to-end delay so content remains usable and accessible. Use reduced-motion alternatives for non-essential choreography. Test fast repeated navigation and out-of-order completion in real browsers.
