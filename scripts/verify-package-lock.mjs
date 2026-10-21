import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const readJson = async (path) => JSON.parse(await readFile(resolve(process.cwd(), path), 'utf8'));
const manifest = await readJson('./package.json');
const lockfile = await readJson('./package-lock.json');
const lockedRoot = lockfile.packages?.[''];

if (lockfile.lockfileVersion !== 3) {
  throw new Error(`Expected package-lock.json lockfileVersion 3; received ${lockfile.lockfileVersion}.`);
}
if (!lockedRoot) {
  throw new Error('package-lock.json is missing the root packages[""] entry. Regenerate it with npm install.');
}
for (const field of ['name', 'version']) {
  if (manifest[field] !== lockfile[field] || manifest[field] !== lockedRoot[field]) {
    throw new Error(
      `package.json and package-lock.json do not match for "${field}": ` +
      `package.json=${JSON.stringify(manifest[field])}, ` +
      `package-lock.json=${JSON.stringify(lockfile[field])}, ` +
      `package-lock root=${JSON.stringify(lockedRoot[field])}. ` +
      'Update package.json and regenerate package-lock.json together.',
    );
  }
}

console.log(`Package manifest and lockfile are synchronized: ${manifest.name}@${manifest.version}.`);
