# Stable 1.0.0 release gate checklist

> **This artifact is a v1.0.0 source candidate. It is not a claim of published or externally certified production readiness.** The live GitHub `main` checked during preparation still declared `0.1.2`. A separate draft PR fixes its known `verify:lockfile` error.

| Gate | Local | Hosted/browser release requirement |
|---|---|---|
| Package and lockfile consistency | `npm run verify:lockfile` | Repeat on clean CI runner |
| TypeScript and build | `npm run typecheck && npm run build` | Node 20/22/24 matrix |
| Core and adapter tests | `npm test` | Clean Linux/Windows jobs |
| Documentation/badge consistency | `npm run docs:check && npm run badges:check` | GitHub rendered image/link review |
| Export map | `npm run pack:verify` | Fresh tarball consumer import |
| React 18 and 19 | Tests for API surface | Real official React DOM/SSR/hydration/JSX consumer |
| Browser features | Not covered by Node unit tests | Chromium, Firefox, WebKit interactions |
| Pan/swipe/layout/presence | Deterministic unit coverage | Real touch/keyboard, rapid toggles, nested scroll and pointer-capture quirks |
| Reduced motion | Code review | Real browser preference/a11y checks |
| Motion Score | YAML/source exists | Successful hosted browser benchmark |
| Security | Network-dependent | Registry npm audit / release supply-chain review |
| Competitor performance | Not measured | Reproducible same-hardware comparison if claimed |

## Reproducible source commands

```bash
npm ci
npm run verify:lockfile
npm run typecheck
npm test
npm run docs:check
npm run pack:verify
npm run release:check
npm pack --ignore-scripts
```

Run a clean consumer install of the exact generated `.tgz` rather than accidentally resolving the older published npm version. Test `/react` and `/ui` imports in official React 18 and React 19 projects, SSR and hydration, and browser animation lifecycle. Ensure the CI jobs actually finish successfully on GitHub; valid YAML isn't proof of a working CI.

## Publication strategy

1. Review changes in a Git branch/PR against `main`.
2. Resolve lockfile/registry issues and hosted CI failures.
3. Confirm all React/browser/reduced-motion acceptance criteria.
4. Verify the exact tarball contents and ensure no secrets are included.
5. If more validation is required, publish a unique prerelease version under the `next` dist-tag first (npm versions are immutable).
6. Release `1.0.0` to `latest` only after all mandatory gates are green.
7. Install the published version from npm in a clean consumer app, then update badge/version announcements.

**Do not** announce "better than Motion", "zero errors", or "fully production tested" based only on Node unit tests or a successful typecheck. Document any remaining limits transparently.
