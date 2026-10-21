# v1.0.0 source candidate validation

This is a candidate source tree, not a published stable or browser-certified release. Local release checks should be executed in the extracted project root, and hosted React/browser checks must run before stable publication.

- `npm run verify:lockfile` validates package metadata/lockfile.
- `npm run docs:check` verifies Markdown links, code fences and relevant exports.
- `npm run typecheck` verifies source types.
- `npm test` rebuilds and runs unit/regression suites, including the optional provider bridge.
- `npm run pack:verify` verifies export paths.
- `npm run release:check` combines deterministic local checks.

**External gates:** official React 18/19 consumer integration, Chromium/Firefox/WebKit animation/gesture/layout tests, reduced-motion/keyboard checks, GitHub Actions hosted execution, security audit and independent Motion benchmarks. An npm version declared in source does not establish publication. See `docs/PRODUCTION-READINESS.md`.
