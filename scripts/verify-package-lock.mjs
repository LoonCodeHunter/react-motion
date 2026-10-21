import {readFile} from 'node:fs/promises';
const readJson=async(path)=>JSON.parse(await readFile(path,'utf8'));
const manifest=await readJson('package.json');
const lock=await readJson('package-lock.json');
if(lock.lockfileVersion!==3)throw new Error('Expected npm lockfileVersion 3');
const root=lock.packages?.[''];
if(!root)throw new Error('package-lock.json is missing packages[""]');
for(const field of ['name','version']){
 if(manifest[field]!==lock[field]||manifest[field]!==root[field])
  throw new Error(`Lockfile mismatch for ${field}: manifest=${manifest[field]}, lock=${lock[field]}, root=${root[field]}`);
}
console.log(`Verified ${manifest.name}@${manifest.version} matches package-lock.json`);
