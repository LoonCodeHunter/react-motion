import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MOTION_SCORE_WEIGHTS,
  calculateMotionScore,
  clampMotionScore,
  motionScoreColor,
} from '../scripts/motion-score/core.mjs';

const excellentMetrics = {
  measuredFps: 60,
  droppedFramePercent: 0,
  springSamplesPerSecond: 150_000,
  motionValueUpdatesPerSecond: 200_000,
  animationMedianMs: 96,
};

test('Motion Score weights total 100 percent', () => {
  const total = Object.values(MOTION_SCORE_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  assert.equal(total, 1);
});

test('clampMotionScore keeps the public score between 0 and 100', () => {
  assert.equal(clampMotionScore(-100), 0);
  assert.equal(clampMotionScore(0), 0);
  assert.equal(clampMotionScore(75.6), 76);
  assert.equal(clampMotionScore(100), 100);
  assert.equal(clampMotionScore(500), 100);
  assert.equal(clampMotionScore(Number.NaN), 0);
});

test('score colours follow the published thresholds', () => {
  const thresholds = [
    [-10, 'red'], [0, 'red'], [49, 'red'],
    [50, 'yellow'], [69, 'yellow'],
    [70, 'green'], [89, 'green'],
    [90, 'yellowgreen'], [96, 'yellowgreen'],
    [97, 'yellowgreen'], [100, 'yellowgreen'], [101, 'yellowgreen'],
  ];
  for (const [score, expected] of thresholds) {
    assert.equal(motionScoreColor(score), expected, `Expected score ${score} to map to ${expected}`);
  }
});

test('ideal benchmark measurements score 100 and use yellowgreen', () => {
  const result = calculateMotionScore(excellentMetrics);
  assert.equal(result.score, 100);
  assert.equal(result.color, 'yellowgreen');
  assert.deepEqual(result.components, {
    frameScore: 100,
    springScore: 100,
    motionValueScore: 100,
    animationTimingScore: 100,
  });
});

test('poor benchmark measurements score zero and use red', () => {
  const result = calculateMotionScore({
    measuredFps: 0,
    droppedFramePercent: 100,
    springSamplesPerSecond: 0,
    motionValueUpdatesPerSecond: 0,
    animationMedianMs: 10_000,
  });
  assert.equal(result.score, 0);
  assert.equal(result.color, 'red');
});

test('higher throughput and steadier frame pacing do not lower the score', () => {
  const baseline = calculateMotionScore({
    measuredFps: 45,
    droppedFramePercent: 12,
    springSamplesPerSecond: 80_000,
    motionValueUpdatesPerSecond: 100_000,
    animationMedianMs: 118,
  });
  const improved = calculateMotionScore({
    measuredFps: 60,
    droppedFramePercent: 1,
    springSamplesPerSecond: 120_000,
    motionValueUpdatesPerSecond: 180_000,
    animationMedianMs: 100,
  });
  assert.ok(improved.score > baseline.score);
});

test('invalid or impossible metrics are rejected', () => {
  assert.throws(() => calculateMotionScore({ ...excellentMetrics, measuredFps: Number.NaN }), /finite number/i);
  assert.throws(() => calculateMotionScore({ ...excellentMetrics, droppedFramePercent: 101 }), /between 0 and 100/i);
  assert.throws(() => calculateMotionScore({ ...excellentMetrics, springSamplesPerSecond: -1 }), /non-negative/i);
});
