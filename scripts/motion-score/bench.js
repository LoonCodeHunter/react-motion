import { animate, motionValue, spring, stagger } from '@kovari/react-motion';

const clamp = (value, minimum = 0, maximum = 100) => Math.max(minimum, Math.min(maximum, value));
const median = (values) => {
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 1
    ? ordered[middle]
    : (ordered[middle - 1] + ordered[middle]) / 2;
};

const stage = document.querySelector('#stage');
if (!stage) throw new Error('Motion Score benchmark stage was not created.');

function createTarget() {
  const element = document.createElement('div');
  Object.assign(element.style, {
    width: '18px',
    height: '18px',
    margin: '1px',
    display: 'inline-block',
    borderRadius: '50%',
    background: '#2563eb',
    opacity: '0',
    transform: 'translateY(8px)',
  });
  stage.append(element);
  return element;
}

async function runBenchmark() {
  // Basic correctness sentinel: benchmark only if stagger produces expected delays.
  const delayFor = stagger(12, 4);
  const staggerCheck = delayFor(0) === 4 && delayFor(3) === 40;
  if (!staggerCheck) throw new Error('stagger() returned unexpected timing values.');

  // Measure spring-sample throughput over a fixed number of sampling iterations.
  const springStart = performance.now();
  let springSampleCount = 0;
  const springIterations = 180;
  const samplesPerCurve = 90;
  for (let iteration = 0; iteration < springIterations; iteration += 1) {
    springSampleCount += spring({ stiffness: 220, damping: 18, mass: 1 }).sample(samplesPerCurve).length;
  }
  const springElapsedMs = Math.max(1, performance.now() - springStart);
  const springSamplesPerSecond = springSampleCount / (springElapsedMs / 1000);

  // Measure observable updates and verify that every change reaches a subscriber.
  const value = motionValue(0);
  let notifications = 0;
  const unsubscribe = value.subscribe(() => { notifications += 1; });
  const updateCount = 50_000;
  const valueStart = performance.now();
  for (let index = 1; index <= updateCount; index += 1) value.set(index);
  const valueElapsedMs = Math.max(1, performance.now() - valueStart);
  unsubscribe();
  if (notifications !== updateCount) {
    throw new Error(`MotionValue notifications mismatch: expected ${updateCount}, received ${notifications}.`);
  }
  const motionValueUpdatesPerSecond = updateCount / (valueElapsedMs / 1000);

  // Measure median completion time of the package's wrapper around browser animation.
  const timingTarget = createTarget();
  const timingSamples = [];
  const animationIterations = 7;
  for (let iteration = 0; iteration < animationIterations; iteration += 1) {
    const start = performance.now();
    const animation = animate(timingTarget, [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0px)' },
    ], { duration: 96, easing: 'linear', fill: 'both', reducedMotion: false });
    await animation.finished;
    timingSamples.push(performance.now() - start);
    animation.cancel();
  }
  const animationMedianMs = median(timingSamples);
  timingTarget.remove();

  // Measure frame cadence under a small, repeatable batch of 12 concurrent animations.
  const animationTargets = Array.from({ length: 12 }, createTarget);
  const animations = animationTargets.map((element, index) => animate(element, [
    { opacity: 0, transform: 'translateY(12px) scale(.95)' },
    { opacity: 1, transform: 'translateY(0px) scale(1)' },
  ], { duration: 920, delay: delayFor(index), easing: 'ease-out', fill: 'both', reducedMotion: false }));

  let frameResult;
  try {
    frameResult = await new Promise((resolve, reject) => {
      const start = performance.now();
      let previous = null;
      const deltas = [];
      const timeout = window.setTimeout(() => reject(new Error('requestAnimationFrame sampling timed out.')), 5_000);

      function tick(now) {
        if (previous !== null) deltas.push(now - previous);
        previous = now;
        if (now - start < 1_000) {
          requestAnimationFrame(tick);
          return;
        }

        window.clearTimeout(timeout);
        const elapsedMs = Math.max(1, now - start);
        const droppedFrames = deltas.filter((delta) => delta > 24).length;
        resolve({
          measuredFps: deltas.length / (elapsedMs / 1000),
          droppedFramePercent: deltas.length ? droppedFrames / deltas.length * 100 : 100,
          frameSamples: deltas.length,
          frameWindowMs: elapsedMs,
        });
      }
      requestAnimationFrame(tick);
    });
    await Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));
  } finally {
    animations.forEach((animation) => animation.cancel());
    animationTargets.forEach((element) => element.remove());
  }

  const metrics = {
    measuredFps: clamp(frameResult.measuredFps, 0, 240),
    droppedFramePercent: clamp(frameResult.droppedFramePercent),
    frameSamples: frameResult.frameSamples,
    frameWindowMs: Number(frameResult.frameWindowMs.toFixed(2)),
    animationMedianMs: Number(animationMedianMs.toFixed(2)),
    expectedAnimationDurationMs: 96,
    springSamplesPerSecond: Math.round(springSamplesPerSecond),
    motionValueUpdatesPerSecond: Math.round(motionValueUpdatesPerSecond),
    motionValueNotifications: notifications,
    staggerCheck,
  };

  if (!Number.isFinite(metrics.measuredFps) || !Number.isFinite(metrics.animationMedianMs)) {
    throw new Error('Browser benchmark produced non-finite metrics.');
  }
  if (metrics.frameSamples < 10) {
    throw new Error(`Too few animation frame samples collected: ${metrics.frameSamples}.`);
  }

  return {
    metrics,
    methodology: 'Weighted browser CI index: frame cadence 40%, spring sampling throughput 20%, MotionValue update throughput 20%, and 96 ms animation completion timing 20%. Higher is better on comparable browser/runner environments; this is a project-specific trend metric, not a universal performance or accessibility certification.',
  };
}

runBenchmark().then((result) => {
  window.__MOTION_SCORE_RESULT__ = result;
}).catch((error) => {
  window.__MOTION_SCORE_ERROR__ = String(error?.stack || error?.message || error);
});
