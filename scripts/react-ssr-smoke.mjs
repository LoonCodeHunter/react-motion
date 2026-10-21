import assert from 'node:assert/strict';
import * as React from 'react';
import {renderToString} from 'react-dom/server';
import {motion,AnimatePresence,MotionConfig,useMotionValue,useTransform,useAnimationControls} from '@kovari/react-motion/react';
import {MotionButton,MotionProgress,MotionSkeleton,MotionToggle} from '@kovari/react-motion/ui';

function HookSmoke(){
 const x=useMotionValue(0),opacity=useTransform(x,[0,100],[1,.25]);
 const controls=useAnimationControls();
 assert.equal(controls.get(),undefined);
 return React.createElement(motion.div,{animate:{opacity:1},style:{opacity}},'signal ready');
}
const tree=React.createElement(MotionConfig,{reducedMotion:'always'},
 React.createElement('main',null,
  React.createElement(motion.section,{initial:{opacity:0,y:12},animate:{opacity:1,y:0},className:'hero'},'Hello'),
  React.createElement(AnimatePresence,{mode:'wait'},React.createElement(motion.span,{key:'x',exit:{opacity:0}},'Present')),
  React.createElement(HookSmoke),
  React.createElement(MotionButton,{type:'button'},'Continue'),
  React.createElement(MotionProgress,{label:'Loading',value:67}),
  React.createElement(MotionSkeleton,{style:{width:80}}),
  React.createElement(MotionToggle,{pressed:true,onPressedChange:()=>{}},'Enabled')
 ));
const html=renderToString(tree);
for(const text of ['Hello','signal ready','Continue','aria-valuenow="67"','aria-pressed="true"','Enabled'])assert.ok(html.includes(text),`SSR missing ${text}: ${html}`);
assert.ok(!/\bdragMomentum=/.test(html),'Private motion props must not reach DOM');
console.log(`React ${React.version}: SSR and hook smoke passed (${html.length} characters)`);
