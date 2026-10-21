# Windows `npm pack` failure: public export tests (v1.0.0)

## Symptoms

When running `npm pack` on Windows, the `prepack` hook runs `npm run check`, which runs the entire build and test suite. The original `tests/exports.test.mjs` computed package filesystem paths with:

```js
resolve(new URL('..', import.meta.url).pathname, entry.import)
```

In Windows, a `file:` URL pathname such as `/C:/Users/...` is **not** a Windows-native path. Passing that pathname into `path.resolve` can produce an invalid duplicated drive prefix such as `C:\C:\Users\...`. As a result, **two separate tests in the same file** failed:

1. `every public export maps to an existing compiled file` — `stat()` could not locate the `.d.ts` files.
2. `non-React export modules resolve without React being installed` — dynamic `import()` could not locate the compiled `.js` modules.

The compilation phase had already passed. These two error messages do not indicate missing generated artifacts, bad npm export mappings, or a broken React runtime.

## Fix

The corrected test retains native `file:` URLs throughout:

```js
const packageRootUrl = new URL('../', import.meta.url);
const declarationUrl = new URL('./dist/types/index.d.ts', packageRootUrl);
await stat(declarationUrl); // fs accepts file URLs

const entryUrl = new URL('./dist/es/index.js', packageRootUrl);
const mod = await import(entryUrl.href); // import accepts URL strings
```

The corrected `tests/exports.test.mjs` also validates export targets as package-relative paths and includes a regression test for `file:///C:/` URLs and folders containing spaces. This solution works on Windows, macOS, and Linux without introducing an npm dependency.

If a native filesystem path is needed elsewhere, use `fileURLToPath(url)` from `node:url` instead of `.pathname`.

## Apply the fix to your repository

Replace `tests/exports.test.mjs` with the file from this fixed source archive. The package remains version `1.0.0` because this is a local packaging/test correction. If you have **already published** `1.0.0`, npm does not allow replacing that exact version; release a new patch version (`1.0.1`) after testing instead.

Then run these commands at the repository root in PowerShell:

```powershell
node --version
npm ci
npm run typecheck
npm test
npm run release:check
npm pack
```

Expected successful test summary: **77 tests**, all passing (76 original tests plus one regression test). `npm pack` should finish with a tarball name and exit code 0. If a new error appears, inspect that error separately rather than treating every future failure as a path issue.

## Publishing checklist

- `npm run typecheck` passes.
- `npm test` passes on the actual Windows machine.
- `npm run release:check` passes.
- `npm pack` creates an archive without errors.
- Inspect the archive: `tar -tzf kovari-react-motion-1.0.0.tgz`.
- Test installation and runtime imports from the archive in a separate application.
- Confirm registry availability and ownership (`npm whoami`, `npm view @kovari/react-motion versions --json`).
- Finish browser/React integration checks; unit success alone is not a full production guarantee.

This fix addresses the **two reported failures**. It does not assert that untested browser/desktop configurations are verified.
