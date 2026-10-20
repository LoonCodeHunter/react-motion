/**
 * Shared Motion Score calculations.
 *
 * This module intentionally has no browser or Node.js dependencies so the same
 * scoring rules can be used by the browser benchmark, the Node.js score runner,
 * and the unit tests.
 */

export const MOTION_SCORE_WEIGHTS = Object.freeze({
  frameCadence: 0.4,
  springSampling: 0.2,
  motionValueThroughput: 0.2,
  animationTiming: 0.2,
});

export const MOTION_SCORE_TARGETS = Object.freeze({
  targetFps: 60,
  springSamplesPerSecond: 150_000,
  motionValueUpdatesPerSecond: 200_000,
  targetAnimationDurationMs: 96,
  droppedFrameThresholdMs: 24,
});

const clamp = (value, minimum = 0, maximum = 100) =>
  Math.max(minimum, Math.min(maximum, value));

function requireFiniteMetric(metrics, name) {
  const value = metrics?.[name];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Motion Score metric "${name}" must be a finite number.`);
  }
  return value;
}

/** Clamp and round a numeric score into the public 0–100 range. */
export function clampMotionScore(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.round(clamp(value));
}

/**
 * Map a score to a Shields.io-compatible named colour.
 *
 * 0–49: red (needs attention)
 * 50–69: yellow (developing)
 * 70–89: green (good)
 * 90–100: yellowgreen (excellent)
 */
export function motionScoreColor(value) {
  const score = clampMotionScore(value);
  if (score < 50) return 'red';
  if (score < 70) return 'yellow';
  if (score < 90) return 'green';
  return 'yellowgreen';
}

/**
 * Calculate the documented weighted index from raw browser measurements.
 * All throughput values are normalised to explicit ceilings; results are
 * comparable only when runner/browser conditions are similar.
 */
export function calculateMotionScore(metrics) {
  const measuredFps = requireFiniteMetric(metrics, 'measuredFps');
  const droppedFramePercent = requireFiniteMetric(metrics, 'droppedFramePercent');
  const springSamplesPerSecond = requireFiniteMetric(metrics, 'springSamplesPerSecond');
  const motionValueUpdatesPerSecond = requireFiniteMetric(metrics, 'motionValueUpdatesPerSecond');
  const animationMedianMs = requireFiniteMetric(metrics, 'animationMedianMs');

  if (measuredFps < 0 || droppedFramePercent < 0 || droppedFramePercent > 100 ||
      springSamplesPerSecond < 0 || motionValueUpdatesPerSecond < 0 || animationMedianMs < 0) {
    throw new RangeError('Motion Score metrics must be non-negative; droppedFramePercent must be between 0 and 100.');
  }

  const frameScore = clamp(
    100 - Math.max(0, MOTION_SCORE_TARGETS.targetFps - measuredFps) * 2.5 - droppedFramePercent * 1.1,
  );
  const springScore = clamp(
    springSamplesPerSecond / MOTION_SCORE_TARGETS.springSamplesPerSecond * 100,
  );
  const motionValueScore = clamp(
    motionValueUpdatesPerSecond / MOTION_SCORE_TARGETS.motionValueUpdatesPerSecond * 100,
  );
  const animationTimingScore = clamp(
    100 - Math.abs(animationMedianMs - MOTION_SCORE_TARGETS.targetAnimationDurationMs) /
      MOTION_SCORE_TARGETS.targetAnimationDurationMs * 100,
  );

  const score = clampMotionScore(
    frameScore * MOTION_SCORE_WEIGHTS.frameCadence +
    springScore * MOTION_SCORE_WEIGHTS.springSampling +
    motionValueScore * MOTION_SCORE_WEIGHTS.motionValueThroughput +
    animationTimingScore * MOTION_SCORE_WEIGHTS.animationTiming,
  );

  return Object.freeze({
    score,
    color: motionScoreColor(score),
    components: Object.freeze({
      frameScore: Math.round(frameScore),
      springScore: Math.round(springScore),
      motionValueScore: Math.round(motionValueScore),
      animationTimingScore: Math.round(animationTimingScore),
    }),
  });
}
