# Renderer Laboratory — web / Electron / Tauri source demo

An interactive, dependency-free HTML/JS/CSS demonstration of the new v1.0.0 entry points. It imports this archive's `dist/es/*.js` directly, **not** npm `latest`.

From the repository root, after `npm run build`:

```bash
python3 -m http.server 4173
```

Visit `http://localhost:4173/examples/renderer-lab/` from a Chromium/Firefox/WebKit browser, or load the corresponding built assets into the WebView renderer of Electron or Tauri. `file://` opening is not recommended because module imports can be blocked by browser CORS policies.

Includes 4 labs: native scoped DOM entrances, SVG path drawing, Canvas interpolation and optional frame diagnostics HUD. No network requests, fonts, analytics or external runtime dependencies. All measurements are local and are not third-party comparative benchmarks. The React showcase lives separately at `examples/react-showcase/` and requires installing its React tooling.
