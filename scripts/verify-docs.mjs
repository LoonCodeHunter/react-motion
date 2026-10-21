import {readFile,access} from 'node:fs/promises';
import {resolve,dirname,sep} from 'node:path';
const root=process.cwd();
const guides=['README.md','docs/ADAPTERS.md','docs/REACT-GUIDE.md','docs/TIMELINES.md','docs/UI-SYSTEM.md','docs/ACCESSIBILITY.md','docs/PERFORMANCE.md','docs/TROUBLESHOOTING.md','docs/RECIPES.md','docs/PRODUCTION-READINESS.md','docs/FEATURE-PARITY.md','docs/MIGRATION-v1.md','docs/NEXT-GENERATION.md','docs/BADGES.md','docs/API-SURFACES-v1.md','docs/COMPETITOR-RESEARCH-v1.md','docs/DESKTOP-AND-RENDERERS.md','docs/DEBUGGING-v1.md','docs/RELEASE-V1-ENGINEERING.md','examples/renderer-lab/README.md'];
const errors=[];let count=0;
for(const file of guides){
 const text=await readFile(file,'utf8');
 if((text.match(/^\s*```/gm)||[]).length%2)errors.push(`${file}: unmatched code fence`);
 for(const [,prefix,alt,link] of text.matchAll(/(!?)\[([^\]]*)\]\(([^)]+)\)/g)){
  if(prefix&&!alt.trim())errors.push(`${file}: image is missing alt text`);
  if(/^(https?:|mailto:|data:|#)/.test(link))continue;
  const pathname=decodeURIComponent(link.split('#')[0].split('?')[0]);if(!pathname)continue;
  const target=resolve(root,dirname(file),pathname);
  if(target!==root&&!target.startsWith(root+sep)){errors.push(`${file}: path escapes root ${link}`);continue}
  try{await access(target);count++}catch{errors.push(`${file}: broken link ${link}`)}
 }
}
const manifest=JSON.parse(await readFile('package.json','utf8'));
for(const name of ['./provider-bridge','./react','./ui','./adapters'])if(!manifest.exports[name])errors.push(`Missing export ${name}`);
if(errors.length){errors.forEach(e=>console.error('ERROR',e));process.exitCode=1}
else console.log(`Docs OK: ${guides.length} documents, ${count} local links, fences balanced.`);
