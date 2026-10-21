import { access, readFile } from 'node:fs/promises';
import { dirname, resolve, relative, sep } from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(await readFile('package.json', 'utf8'));
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
if (manifest.version !== lock.version || manifest.version !== lock.packages?.['']?.version) {
  throw new Error('Package version does not match package-lock.json');
}
const artifacts = new Set(['dist/es/index.js', 'dist/es/styles.css', 'dist/types/index.d.ts']);
for (const [subpath, entry] of Object.entries(manifest.exports)) {
  const paths = typeof entry === 'string' ? [entry] : Object.values(entry);
  for (const entryPath of paths) {
    if (typeof entryPath !== 'string' || !entryPath.startsWith('./')) throw new Error(`Invalid export ${subpath}: ${entryPath}`);
    const full = resolve(root, entryPath);
    if (!full.startsWith(`${root}${sep}`)) throw new Error(`Export escapes package root: ${entryPath}`);
    await access(full);
    artifacts.add(relative(root, full));
  }
}
console.log(`Validated version ${manifest.version} with ${Object.keys(manifest.exports).length} exports and ${artifacts.size} export artifacts.`);
