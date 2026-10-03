'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),vm=require('node:vm');
const ROOT=__dirname;
const read=file=>JSON.parse(fs.readFileSync(path.join(ROOT,file),'utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,file))).digest('hex');
const norm=value=>JSON.parse(JSON.stringify(value));
const at=(data,keys=[])=>keys.reduce((x,k)=>x?.[k],data);
const spec=read('frontier120-spec.json'),preservation=read('frontier120-preservation.json');
const allowedRootChanges=new Set(['app.js','index.html','styles.css','README.md','verify-all.cjs']);
function safePath(file){assert(typeof file==='string'&&file&&!path.isAbsolute(file)&&!file.split(/[\\/]/).includes('..'),'Unsafe relative path '+file);return file;}
function registry(){const source=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');return norm(vm.runInNewContext(source.slice(0,source.indexOf('let activeCategory'))+';({games,categoryNames,artMarkup,GAME_BUILD,categories,categoryByGameId})'));}
function assertPreserved(){let files=0;for(const [file,sha] of Object.entries(preservation.files)){if(allowedRootChanges.has(file))continue;assert.equal(hash(file),sha,'Historical file changed: '+file);files++;}const base=read('frontier120-baseline-root.json');for(const [file,text] of Object.entries(base.files)){const sha=crypto.createHash('sha256').update(text).digest('hex');assert.equal(sha,preservation.files[file],'Historical root fixture changed: '+file);}return files;}
function loadFamily(id){
 const f=spec.families.find(f=>f.id===id);assert(f,'Unknown family '+id);
 const manifest=read(f.releaseManifestPath),catalog=read(f.catalogPath);assert.equal(manifest.family,id,'Wrong family identity');
 const cards=Array.isArray(catalog)?catalog:catalog.games;assert(Array.isArray(cards));assert.equal(cards.length,15,id+' catalog count');
 assert(Array.isArray(manifest.games));assert.equal(manifest.games.length,15,id+' manifest count');
 assert.deepEqual(manifest.games.map(g=>g.id).sort(),f.games.slice().sort(),id+' exact game set');
 assert.deepEqual(cards.map(g=>g.id||g.slug).sort(),f.games.slice().sort(),id+' exact catalog set');
 const sourceFiles=manifest.sourceFiles||manifest.sourceHashes;assert(sourceFiles&&Object.keys(sourceFiles).length>20,id+' source bindings missing');
 for(const [file,sha]of Object.entries(sourceFiles)){safePath(file);assert.equal(hash(file),sha,id+' stale source: '+file);}
 const games=f.games.map(slug=>{
  const original=spec.games.find(g=>g.id===slug),g=manifest.games.find(g=>g.id===slug),c=cards.find(g=>(g.id||g.slug)===slug);
  assert.equal(g.title,original.title,slug+' exact proposed title');assert.equal(c.title,original.title,slug+' catalog title');
  assert.equal(g.entry,original.entry,slug+' exact entry route');assert(sourceFiles[g.entry],slug+' entry source not bound');
  assert.equal(typeof g.levelBased,'boolean',slug+' must explicitly declare levelBased');
  let levels=null,count=0;
  if(g.levelBased){
   const levelPath=g.levels||g.levelsPath;safePath(levelPath);assert(sourceFiles[levelPath],slug+' corpus source not bound');
   levels=at(read(levelPath),g.levelRecordPath||g.levelsRecordPath||[]);assert(Array.isArray(levels),slug+' level array');assert.equal(levels.length,100,slug+' 100 levels required');
   assert.equal(new Set(levels.map((l,i)=>String(l[g.levelRecordIdKey||'id']??l.missionId??l.level??i+1))).size,100,slug+' duplicate level IDs');
   count=100;const proof=g.proof||{path:g.proofPath||g.levels,kind:g.proofKind,claim:g.proofClaim||g.proofScope};assert(proof?.path&&proof.kind&&proof.claim,slug+' explicit proof scope required');safePath(proof.path);assert(sourceFiles[proof.path],slug+' proof source not bound');
   if(proof.path!==levelPath){const records=at(read(proof.path),proof.recordPath||[]);assert(Array.isArray(records),slug+' proof records missing');assert.equal(records.length,100,slug+' proof coverage');if(proof.recordIdKey)assert.equal(new Set(records.map(r=>String(r[proof.recordIdKey]))).size,100,slug+' duplicate proof IDs');if(proof.requiredField)assert(records.every(r=>r[proof.requiredField]===proof.requiredValue),slug+' unverified proof record');}
  }
  assert(g.uiWitnessMapping,slug+' public UI witness mapping required');assert(g.semanticDiversity,slug+' semantic diversity declaration required');
  if(g.ai?.difficulties?.length)assert.deepEqual([...g.ai.difficulties].sort(),['easy','hard','normal'],slug+' three AI tiers');
  const html=fs.readFileSync(path.join(ROOT,g.entry),'utf8');assert(/lang=["']zh-Hant["']/.test(html),slug+' Traditional Chinese language');assert(/viewport/.test(html),slug+' mobile viewport');assert(html.includes(original.title),slug+' titled HTML');
  assert(g.ai&&typeof g.ai==='object',slug+' AI declaration must be explicit, including none');
  return {...g,family:id,primaryCategory:id,levelCount:count,levels:g.levels||g.levelsPath||null,proof:g.proof||{path:g.proofPath||g.levels,kind:g.proofKind,claim:g.proofClaim||g.proofScope},catalog:c};
 });
 const commands=(manifest.commands||manifest.verificationCommands)?.map(c=>typeof c==='string'?c.split(/\s+/):c);assert(Array.isArray(commands)&&commands.length,id+' commands required');
 for(const argv of commands){assert(Array.isArray(argv)&&['node','python3'].includes(argv[0]),id+' unsafe/unknown command');assert(argv.length>1);}
 assert(sourceFiles[f.catalogPath],id+' catalog not bound');for(const file of Object.keys(sourceFiles)){assert(!preservation.gitBlobs[file],id+' overwrites historical path '+file);assert(file.startsWith(f.directory+'/')||f.games.some(slug=>file===`games/${slug}.html`||file.startsWith(`games/${slug}/`)),id+' foreign ownership '+file);}
 const freshReports=manifest.freshReports||(manifest.evidenceFiles?Object.keys(manifest.evidenceFiles).filter(f=>!f.includes('generation-report')):[manifest.verification].filter(x=>typeof x==='string'));
 assert(freshReports.length,id+' fresh evidence required');for(const file of freshReports){safePath(file);assert(file.startsWith(f.directory+'/'),id+' foreign report path');}for(const argv of commands){safePath(argv[1]);assert(sourceFiles[argv[1]],id+' command script not bound '+argv[1]);}
 return {...f,manifest,catalog:cards,games,sourceFiles,commands,freshReports};
}
module.exports={ROOT,read,hash,norm,at,spec,preservation,allowedRootChanges,safePath,registry,assertPreserved,loadFamily};
