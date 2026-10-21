'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, usePan } from '@kovari/react-motion/react';
import { transitionPresets, variantPresets } from '@kovari/react-motion/presets';
import { MotionButton, MotionBadge, MotionCard, MotionProgress, MotionSkeleton, MotionToggle } from '@kovari/react-motion/ui';
import { staggerVariants } from '@kovari/react-motion/variants';
import { scroll } from '@kovari/react-motion/scroll';
import { bindScrollAnimation } from '@kovari/react-motion/scroll-scrub';
import '@kovari/react-motion/ui.css';
import './showcase.css';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
};

const ideas = [
  {category:'TRANSITIONS',title:'Animation that makes sense.',body:'React state, keyboard navigation and pointer motion working together.'},
  {category:'INTERACTION',title:'A gesture-led interface.',body:'Swipe with a pointer or use the buttons to explore each card.'},
  {category:'PERFORMANCE',title:'One motion, many renderers.',body:'Scroll-scrubbed native keyframes and modular animation primitives.'},
];

function SwipeLab() {
  const [selected,setSelected] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const move = (direction:number) => setSelected(index => (index+direction+ideas.length)%ideas.length);
  const reset = () => { if(cardRef.current) {cardRef.current.style.transition='transform 180ms ease-out';cardRef.current.style.transform='translateX(0)'} };
  usePan(cardRef, {
    axis:'x',threshold:5,swipeDistance:65,swipeVelocity:280,
    onStart:()=>{if(cardRef.current)cardRef.current.style.transition='none'},
    onMove:(_,info)=>{if(cardRef.current)cardRef.current.style.transform=`translateX(${Math.max(-120,Math.min(120,info.offset.x))}px)`},
    onEnd:reset,onCancel:reset,
    onSwipe:(_,info)=>move(info.direction==='left'?1:-1),
  });
  return <section className="panel" aria-label="Swipe navigation">
    <div className="panel-heading"><span>05 / Pan + Swipe</span><span className="status-dot">Accessible</span></div>
    <div className="swipe-card" ref={cardRef} style={{touchAction:'pan-y'}}>
      <span className="ui-showcase-label">{ideas[selected]!.category}</span>
      <h2>{ideas[selected]!.title}</h2>
      <p>{ideas[selected]!.body}</p>
    </div>
    <div className="swipe-actions">
      <button type="button" className="swipe-control" onClick={()=>move(-1)} aria-label="Previous card">←</button>
      <span aria-live="polite">{selected+1} / {ideas.length}</span>
      <button type="button" className="swipe-control" onClick={()=>move(1)} aria-label="Next card">→</button>
    </div>
  </section>;
}

function ScrollScrubLab() {
  const trackRef=useRef<HTMLDivElement>(null);
  const blobRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const track=trackRef.current,blob=blobRef.current;
    if(!track||!blob)return;
    const animation=blob.animate([
      {transform:'translateX(0)',opacity:.5},
      {transform:'translateX(190px)',opacity:1},
    ],{duration:1000,fill:'both'});
    const tracker=scroll(track);
    const control=bindScrollAnimation(tracker.progress,animation,{duration:1000});
    return ()=>{control.stop();tracker.stop();animation.cancel()};
  },[]);
  return <section className="panel" aria-label="Scroll-driven keyframe scrubbing">
    <div className="panel-heading"><span>06 / Scroll Scrub</span><span className="status-dot">WAAPI</span></div>
    <div className="scrub-orbit" aria-hidden="true"><div className="scrub-blob" ref={blobRef}/></div>
    <div className="scrub-content" tabIndex={0} ref={trackRef} aria-label="Scroll this area to animate the progress orb">
      <p>Scroll inside this panel — native animation follows your progress.</p>
      <p>Motion is linked to the scroll signal without React rerenders.</p>
      <p>Native keyframes, reusable values and explicit cleanup.</p>
      <p>Try keyboard scrolling and touch, too.</p>
      <p>You have reached the end of the animation path.</p>
    </div>
  </section>;
}

export default function App() {
  const [visible, setVisible] = useState(true);
  const [detailed, setDetailed] = useState(false);
  const x = useMotionValue(0);
  const tilt = useTransform(x, [-160, 0, 160], [-8, 0, 8]);
  return (
    <main className="showcase">
      <div className="ambient" aria-hidden="true" />
      <div className="showcase-shell">
        <header className="showcase-header">
          <span className="eyebrow">KOVARI · MOTION SYSTEM / VERSION 1.0.0</span>
          <h1>Interfaces that <em>feel</em> alive.</h1>
          <p>Expressive transitions, tactile interactions and a motion language that feels deliberate.</p>
        </header>
        <section className="showcase-grid" aria-label="Motion examples">
          <div className="panel large">
            <div className="panel-heading"><span>01 / Presence</span><span className="status-dot">Interactive</span></div>
            <div className="presence-stage">
              <AnimatePresence>
                {visible && (
                  <motion.article key="welcome" className="floating-card" initial="hidden" animate="visible" exit="hidden"
                    variants={fadeUp} whileHover={{ y: -5, scale: 1.015 }} transition={transitionPresets.snappy}>
                    <span className="card-symbol" aria-hidden="true">✦</span>
                    <span className="card-kicker">MADE FOR INTERACTION</span>
                    <strong>A smoother experience.</strong>
                    <small>Native animations · Composable states</small>
                  </motion.article>
                )}
              </AnimatePresence>
            </div>
            <button className="action" onClick={() => setVisible(v => !v)}>{visible ? 'Hide card' : 'Show card'} <span aria-hidden="true">↗</span></button>
          </div>
          <div className="panel">
            <div className="panel-heading"><span>02 / Drag</span><span className="status-dot">Pointer</span></div>
            <div className="drag-stage">
              <div className="track" aria-hidden="true" />
              <motion.div className="drag-orb" drag="x" dragConstraints={{ left: -110, right: 110 }} whileDrag={{ scale: 1.12 }}
                style={{ rotate: tilt }} onDrag={(_event, info) => x.set(info.offset.x)} aria-label="Draggable decorative orb" />
            </div>
            <p className="panel-caption">Drag the orb to feel the difference.</p>
          </div>
          <div className="panel">
            <div className="panel-heading"><span>03 / States</span><span className="status-dot">Spring</span></div>
            <div className="interaction-stage">
              <motion.button className="pill" whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.96 }} whileFocus={{ scale: 1.04 }}
                transition={transitionPresets.snappy}>Explore motion <span aria-hidden="true">↗</span></motion.button>
            </div>
            <p className="panel-caption">Hover, keyboard-focus or press.</p>
          </div>
          <section className="panel wide" aria-label="Design system and variants">
            <div className="panel-heading"><span>04 / UI Motion System</span><span className="status-dot">Composable</span></div>
            <div className="ui-showcase-grid">
              <div className="ui-showcase-item">
                <div className="ui-showcase-label">Interface primitives</div>
                <MotionBadge>New in 1.0 RC</MotionBadge>
                <h2>Tactile by design.</h2>
                <p>Accessible controls, thoughtful easing and reduced-motion support.</p>
                <div className="ui-showcase-controls">
                  <MotionButton type="button" onClick={() => setDetailed(value => !value)}>Update progress</MotionButton>
                  <MotionToggle aria-label="Enable rich details" pressed={detailed} onPressedChange={setDetailed}/>
                </div>
                <MotionProgress value={detailed ? 94 : 68} label="Interface readiness"/>
                <div className="progress-key"><span>Interface readiness</span><span>{detailed ? 94 : 68}%</span></div>
              </div>
              <MotionCard className="ui-showcase-item list-motion-card" whileHover={{y:-4}}>
                <div className="ui-showcase-label">Variant choreography</div>
                <h2>States that flow.</h2>
                <div className="animated-list">
                  {staggerVariants(['visible','visible','visible'],variantPresets.rise,{stagger:80,delay:70}).map((target,index) =>
                    <motion.div className="animated-list-row" key={index} initial="hidden" animate={target} variants={variantPresets.rise}>
                      <span className="list-indicator" aria-hidden="true">{index+1}</span>
                      <span>{['Natural entrance', 'Fluid choreography', 'Consistent motion'][index]}</span>
                    </motion.div>
                  )}
                </div>
              </MotionCard>
              <div className="ui-showcase-item">
                <div className="ui-showcase-label">Loading experience</div>
                <h2>Polished states.</h2>
                <p>A gentle animated skeleton with a built-in reduced-motion fallback.</p>
                <div className="skeleton-rows" role="status" aria-label="Sample content loading">
                  <MotionSkeleton style={{width:'75%',height:14}}/>
                  <MotionSkeleton style={{width:'94%',height:14}}/>
                  <MotionSkeleton style={{width:'52%',height:14}}/>
                </div>
              </div>
            </div>
          </section>
          <SwipeLab />
          <ScrollScrubLab />
        </section>
        <footer className="showcase-footer"><span>Built with @kovari/react-motion</span><span>Motion with intention.</span></footer>
      </div>
    </main>
  );
}
