import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

// Keep filesystem references as file: URLs. URL.pathname is *not* a Windows
// filesystem path: resolving it on Windows can yield a duplicated drive prefix
// such as C:\C:\Users\... . Node's fs API accepts file: URLs directly, and
// dynamic import accepts their .href values on Windows, macOS, and Linux.
const packageRootUrl = new URL('../', import.meta.url);
const manifestUrl = new URL('package.json', packageRootUrl);

async function getManifest() {
  return JSON.parse(await readFile(manifestUrl, 'utf8'));
}

function resolveExport(exportPath) {
  assert.equal(typeof exportPath, 'string', 'export targets must be strings');
  assert.ok(exportPath.startsWith('./'), `export target must be package-relative: ${exportPath}`);
  const target = new URL(exportPath, packageRootUrl);
  assert.ok(target.href.startsWith(packageRootUrl.href), `export target must stay inside package: ${exportPath}`);
  return target;
}

test('every public export maps to an existing compiled file', async () => {
  const manifest = await getManifest();
  assert.equal(manifest.version, '1.0.0');

  for (const [name, entry] of Object.entries(manifest.exports)) {
    const targets = typeof entry === 'string' ? [entry] : Object.values(entry);
    for (const exportPath of targets) {
      const fileUrl = resolveExport(exportPath);
      const info = await stat(fileUrl);
      assert.ok(info.isFile(), `${name}: ${exportPath}`);
    }
  }
});

test('non-React export modules resolve without React being installed', async () => {
  const manifest = await getManifest();
  const reactAndNonJavaScriptPaths = new Set([
    './react', './react-client', './ui',
    './package.json', './styles.css', './ui.css',
  ]);

  for (const [name, entry] of Object.entries(manifest.exports)) {
    if (reactAndNonJavaScriptPaths.has(name)) continue;
    assert.ok(entry && typeof entry === 'object' && typeof entry.import === 'string',
      `${name} must expose an ESM import target`);
    const moduleUrl = resolveExport(entry.import);
    const mod = await import(moduleUrl.href);
    assert.equal(typeof mod, 'object', `${name} should import`);
  }
});

test('file URL resolution preserves Windows drive letters and encoded folders', () => {
  const sampleTestUrl = new URL('file:///C:/Users/example/Kovari%20Projects/react-motion/tests/exports.test.mjs');
  const samplePackageRootUrl = new URL('../', sampleTestUrl);
  assert.equal(
    new URL('./dist/types/index.d.ts', samplePackageRootUrl).href,
    'file:///C:/Users/example/Kovari%20Projects/react-motion/dist/types/index.d.ts',
  );
  assert.equal(
    new URL('./dist/es/index.js', samplePackageRootUrl).href,
    'file:///C:/Users/example/Kovari%20Projects/react-motion/dist/es/index.js',
  );
});
