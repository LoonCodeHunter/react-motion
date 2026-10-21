import { chromium } from 'playwright';
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { calculateMotionScore } from './motion-score-core.mjs';

const packageJson = JSON.parse(
  await readFile('node_modules/@kovari/react-motion/package.json', 'utf8'),
);
if (packageJson.name !== '@kovari/react-motion' || !packageJson.version) {
  throw new Error('Installed npm package metadata does not match @kovari/react-motion.');
}

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-dev-shm-usage'],
});

try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load', timeout: 30_000 });
  await page.waitForFunction(
    () => window.__MOTION_SCORE_RESULT__ !== undefined || window.__MOTION_SCORE_ERROR__ !== undefined,
    null,
    { timeout: 60_000 },
  );

  const browserResult = await page.evaluate(() => ({
    result: window.__MOTION_SCORE_RESULT__,
    error: window.__MOTION_SCORE_ERROR__,
  }));
  if (browserResult.error) throw new Error(`Browser benchmark failed: ${browserResult.error}`);
  if (pageErrors.length) throw new Error(`Browser runtime error: ${pageErrors.join('; ')}`);
  if (!browserResult.result?.metrics) throw new Error('Benchmark did not return metric data.');

  const measured = browserResult.result.metrics;
  const scoring = calculateMotionScore(measured);
  const output = {
    schemaVersion: 1,
    label: 'Motion Score',
    message: `${scoring.score}/100`,
    color: scoring.color,
    namedLogo: 'speedtest',
    package: '@kovari/react-motion',
    packageVersion: packageJson.version,
    sourceCommit: process.env.GITHUB_SHA || 'local',
    score: scoring.score,
    components: scoring.components,
    metrics: measured,
    methodology: browserResult.result.methodology,
    generatedAt: new Date().toISOString(),
    runner: `ubuntu-24.04 / Chromium / Node ${process.version}`,
    ranges: {
      red: '0–49',
      yellow: '50–69',
      green: '70–89',
      yellowgreen: '90–100',
    },
  };

  if (!Number.isInteger(output.score) || output.score < 0 || output.score > 100) {
    throw new Error(`Invalid Motion Score produced: ${output.score}`);
  }
  const outputPath = resolve(process.cwd(), '..', 'motion-score.json');
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(output, null, 2));

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    const summary = [
      '# Kovari React Motion — Motion Score',
      '',
      `**Score: ${output.score}/100** · Package: **${output.packageVersion}** · Commit: **${output.sourceCommit}** · Badge colour: **${output.color}**`,
      '',
      '| Metric | Result |',
      '|---|---:|',
      `| Observed animation frame rate | ${measured.measuredFps.toFixed(2)} FPS |`,
      `| Frames over 24 ms | ${measured.droppedFramePercent.toFixed(2)}% |`,
      `| Median 96 ms animation completion | ${measured.animationMedianMs.toFixed(2)} ms |`,
      `| Spring samples per second | ${Math.round(measured.springSamplesPerSecond).toLocaleString()} |`,
      `| MotionValue updates per second | ${Math.round(measured.motionValueUpdatesPerSecond).toLocaleString()} |`,
      `| MotionValue listener notifications | ${measured.motionValueNotifications.toLocaleString()} |`,
      '',
      '## Scoring weights',
      '',
      '| Component | Score | Weight |',
      '|---|---:|---:|',
      `| Frame cadence | ${output.components.frameScore}/100 | 40% |`,
      `| Spring sampling | ${output.components.springScore}/100 | 20% |`,
      `| MotionValue updates | ${output.components.motionValueScore}/100 | 20% |`,
      `| Animation timing | ${output.components.animationTimingScore}/100 | 20% |`,
      '',
      '## Badge colour bands',
      '',
      '| Score | Colour | Meaning |',
      '|---:|---|---|',
      '| 0–49 | Red | Needs attention |',
      '| 50–69 | Yellow | Developing |',
      '| 70–89 | Green | Good |',
      '| 90–100 | Yellow-green | Excellent |',
      '',
      `> ${output.methodology}`,
      '',
      'The index is sensitive to runner, operating system and browser load. Compare measurements on the same GitHub-hosted runner. It is not a universal benchmark, an accessibility score, or a guarantee of application-level performance.',
      '',
    ].join('\n');
    await appendFile(summaryPath, summary, 'utf8');
  }
} finally {
  await browser.close();
}
