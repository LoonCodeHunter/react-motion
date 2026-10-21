# Windows / VS Code: install, develop, test and prepare a pre-release

1. Extract the **source ZIP** to a dedicated folder such as `C:\Projects\react-motion-rc`. Do not copy files over your production branch without first reviewing the changes.
2. Open that folder in VS Code or PowerShell.
3. With Node.js 22 or 24 and working registry access, run:

```powershell
npm ci
npm run release:check
```

4. Explore the locally built React example:

```powershell
cd .\examples\react-showcase
npm install
npm run dev
```

Vite prints the localhost address to open in Edge or Chrome. Use keyboard Tab and Shift+Tab, mouse, and touch to test all interactions. Turn on Windows reduced-motion animations preference and confirm effects respect it. **The demo is not a substitute for automated browser compatibility tests.**

5. For a direct local tarball:

```powershell
cd ..\..
npm pack --ignore-scripts
```

This writes `kovari-react-motion-1.0.0-rc.1.tgz` into the current directory. Install it from your test React app:

```powershell
npm install "C:\Projects\react-motion-rc\kovari-react-motion-1.0.0-rc.1.tgz"
```

6. Open a **new feature branch** in your GitHub repo and commit the changes. The updated `.github/workflows/ci.yml`, `react-integration.yml` and `motion-score.yml` must all pass in your actual GitHub environment.

```powershell
git checkout -b feat/react-motion-v1-rc
# after reviewing and copying the files from your extracted source folder
git add .
git commit -m "feat: add React Motion v1 release candidate"
git push -u origin feat/react-motion-v1-rc
```

Open a pull request; do not overwrite the existing `main` branch blindly. **Publish to npm only after reviewing CI, browser tests, package contents and changes:** `npm publish --tag next` (requires your own npm credentials and permissions). Do not use the `latest` tag for this unverified RC.

### Troubleshooting

- **`npm ci` fails**: check your Node/npm versions, connection and integrity metadata; don't disable integrity checks.
- **React runtime cannot resolve**: ensure your consuming app installs compatible `react` and `react-dom` peers; import components from `/react` or `/ui`.
- **React Server Components**: add `'use client'` to the file rendering motion components; root primitives remain framework-agnostic.
- **Motion Score fails**: open the GitHub Actions benchmark job's first failing step and diagnose that step; avoid weakening scoring thresholds to make the job appear green.
