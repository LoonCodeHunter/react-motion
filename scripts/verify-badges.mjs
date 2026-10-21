import {readFile} from 'node:fs/promises';
const manifest=JSON.parse(await readFile('package.json','utf8'));
const readme=await readFile('README.md','utf8');
if(/img\.shields\.io\/npm\/v\//i.test(readme))throw new Error('Do not use npm/v shields: they track the published version, not repository source');
if(!readme.includes(`https://img.shields.io/badge/version-v${manifest.version}-`))throw new Error(`Version badge must identify the source version ${manifest.version}`);
if(!readme.includes('https://www.npmjs.com/package/@kovari/react-motion'))throw new Error('Missing distinct npm package link');
console.log(`Badge policy OK: version v${manifest.version}, no misleading npm-latest badge.`);
