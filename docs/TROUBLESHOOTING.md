# Troubleshooting

| Symptom | Diagnosis | Next step |
|---|---|---|
| Missing `verify:lockfile` script on GitHub | Old repo manifest/workflow mismatch | Apply targeted GitHub PR, run `npm run verify:lockfile` |
| Cannot resolve `/provider-bridge` | Unreleased or old package version | Install built candidate tarball; inspect `exports` |
| React module missing | React subpath used in non-React application | Install React + React DOM or use core-only imports |
| `window` / `document` missing | DOM helper invoked during SSR | Run on mount/client; use `'use client'` |
| Exit element disappears | Presence child isn't direct keyed motion element | Add stable key and `exit` prop |
| Drag conflict | Multiple transform writers / touch CSS | Inspect constraints, transforms, pointer captures |
| Scroll progress stuck | Container not scrollable or wrong ref | Confirm overflow and call tracker.stop on unmount |
| Browser animation won't settle | A filled WAAPI animation is masking inline state | Cancel stale animation; ensure final styles are durable |
| `EINTEGRITY` during npm install | Tarball hash differs from lockfile | Compare official registry integrity, don't disable verification |
| Windows `EPERM` | Node/editor process holds files | Close watchers, retry in clean PowerShell |
| CI YAML parses but job fails | Real install/build/browsers failed | Open the failed Actions step and logs |

## Diagnosis commands

```powershell
node --version
npm --version
npm run verify:lockfile
npm run docs:check
npm run typecheck
npm test
npm run release:check
npm pack --dry-run --ignore-scripts
```

For external adapters, remember: `createReactMotion(React)` takes React's hooks runtime; `createReactMotionBridge({motion})` takes a third-party motion factory. They are different. A bridge doesn't translate provider-specific variants or layouts. Never post tokens, passwords, personal content or secret registry settings in issue reports.
