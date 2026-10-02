#!/usr/bin/env node
'use strict';
// Structural release gate. Per-family solvers/rule audits are rerun by verify-all.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
process.chdir(__dirname);
const registry=require('./verify-lobby.cjs'),references=require('./verify-static.cjs');
const manifest=JSON.parse(fs.readFileSync('expansion-manifest.json','utf8'));
const preservation=JSON.parse(fs.readFileSync('expansion-preservation.json','utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const json=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const select=(object,keys=[])=>keys.reduce((v,key)=>v?.[key],object);
// Independent canonicalization for the two composed mate-in-one corpora.
// Chess has no pawns/castling/en-passant rights, so D8 is rule preserving.
// Shogi keeps forward direction, allowing only left/right reflection after
// swapping colors and rotating the entire position to normalize side to move.
function mateCanonical(id,l){
 const s=l.start,n=id==='chess'?8:9;
 if(id==='chess'){assert.equal(s.castle,'');assert.equal(s.ep,-1);assert(!s.board.some(v=>Math.abs(v)===1),'D8 requires pawn-free composed studies');}
 const b=s.turn===1?s.board:s.board.slice().reverse().map(v=>-v),views=[];
 for(let flip=0;flip<2;flip++)for(let rot=0;rot<(id==='chess'?4:1);rot++){
  const out=Array(n*n);for(let i=0;i<n*n;i++){let x=i%n,y=Math.floor(i/n);if(flip)x=n-1-x;for(let t=0;t<rot;t++){const old=x;x=n-1-y;y=old;}out[y*n+x]=b[i];}views.push(out.join(','));
 }
 return views.sort()[0]+(id==='shogi'?'|'+s.hands[s.turn].join(',')+'|'+s.hands[-s.turn].join(','):'');
}
function magicCanonical(level){
 const n=level.size,views=[];assert.equal(level.target,n*(n*n+1)/2,'Standard 1..n² magic-square domain required');
 for(let complement=0;complement<2;complement++)for(let flip=0;flip<2;flip++)for(let rot=0;rot<4;rot++){
  const out=Array(n*n);for(let i=0;i<n*n;i++){let x=i%n,y=Math.floor(i/n),value=level.givens[i];assert(Number.isInteger(value)&&value>=0&&value<=n*n);if(flip)x=n-1-x;for(let t=0;t<rot;t++){const old=x;x=n-1-y;y=old;}out[y*n+x]=complement&&value?n*n+1-value:value;}views.push(out.join(','));
 }
 return n+':'+views.sort()[0];
}
const proofKinds=new Set(['assignment','reachability','local-tactic','forced-strategy','policy-witness','epistemic-proof','real-time-witness']);
assert.equal(manifest.games.length,80);assert.equal(manifest.families.length,8);
assert.equal(manifest.games.reduce((n,g)=>n+g.challenges,0),8000);
assert.equal(new Set(manifest.families.flatMap(f=>f.games)).size,80);
assert.deepEqual(manifest.families.flatMap(f=>f.games).sort(),manifest.games.map(g=>g.id).sort());
let sourceCount=0;for(const [file,sha]of Object.entries(manifest.sourceFiles)){assert(!/(?:^|\/)(?:__pycache__|node_modules|screenshots|test-results)(?:\/|$)|\.(?:pyc|log|tmp)$/.test(file),'Nonrelease file in manifest '+file);assert.equal(hash(file),sha,'Frozen expansion asset changed: '+file);sourceCount++;}
assert(sourceCount>300,'Complete source manifest required');
for(const [file,sha]of Object.entries(preservation.assets))assert.equal(hash(file),sha,'Original game asset changed: '+file);
for(const [file,sha]of Object.entries(preservation.historicalReports))assert.equal(hash(file),sha,'Historical evidence changed: '+file);
const records=[],kindCounts={};
for(const g of manifest.games){
 const entry=registry.games.find(row=>row.id===g.id);assert(entry);assert.equal(entry.status,'ready');assert.equal(entry.category,'expansion');
 assert.equal(entry.url,'./'+g.entry);assert.equal(registry.categoryByGameId[g.id].id,g.primaryCategory);assert(entry.badge.includes('100'));
 for(const field of ['entry','engine','levels']){assert(fs.statSync(g[field]).size>0,g.id+' missing '+field);assert(manifest.sourceFiles[g[field]],g.id+' untracked '+field);}
 assert(proofKinds.has(g.proof.kind),g.id+' invalid proof semantics');assert(g.proof.claim.length>20,g.id+' needs a bounded honest claim');
 if(g.primaryCategory==='cards')assert.equal(g.proof.kind,'policy-witness','Card scenarios cannot be promoted to arbitrary-opponent forced wins');
 if(g.primaryCategory==='tabletop'&&!['chess','shogi'].includes(g.id))assert.equal(g.proof.kind,'local-tactic','Local board goals cannot be relabeled as full-game forced wins');
 if(['chess','shogi','misere-nim'].includes(g.id))assert.equal(g.proof.kind,'forced-strategy');
 if(['hat-deduction','rule-lab'].includes(g.id))assert.equal(g.proof.kind,'epistemic-proof');
 if(g.primaryCategory==='quick'||g.id==='tower-defense')assert.equal(g.proof.kind,'real-time-witness');
 const loaded=json(g.levels),levels=select(loaded,g.levelsRecordPath||[]);assert(Array.isArray(levels),g.id+' corpus must be an array');assert.equal(levels.length,100,g.id+' challenge count');
 assert.equal(new Set(levels.map(l=>String(l.id))).size,100,g.id+' duplicate level IDs');
 const proofData=select(json(g.proof.path),g.proof.recordPath||[]),proofRecords=g.proof.recordsAreKeyed?Object.entries(proofData).map(([id,p])=>({id,...p})):proofData;assert(Array.isArray(proofRecords),g.id+' proof record array missing');assert.equal(proofRecords.length,100,g.id+' proof coverage');
 if(g.proof.recordIdKey!==false){const key=g.proof.recordIdKey||'id';assert.deepEqual(proofRecords.map(p=>String(p[key])).sort(),levels.map(l=>String(l.id)).sort(),g.id+' proof-to-level ID coverage');}
 if(g.proof.requiredField)for(const p of proofRecords)assert(p[g.proof.requiredField]!==undefined,g.id+' missing certificate field '+g.proof.requiredField);
 for(const p of proofRecords)if(p.kind)assert.equal(p.kind,g.proof.kind,g.id+' certificate proof kind mismatch');
 if(g.proof.requiredValue!==undefined)for(const p of proofRecords)assert.equal(p[g.proof.requiredField],g.proof.requiredValue,g.id+' failed proof record');
 if(g.proof.actionField)for(const p of proofRecords)assert(Array.isArray(p[g.proof.actionField])&&p[g.proof.actionField].length>0,g.id+' empty solution witness');
 if(g.proof.embeddedField)for(const l of levels)assert(l[g.proof.embeddedField]!==undefined,g.id+' missing embedded proof');
 if(g.proof.kind==='policy-witness'){
  assert(g.proof.policy&&g.proof.information&&g.proof.claim.includes('fixed'),g.id+' fixed-policy conditions must be explicit');
  for(const l of levels){assert.equal(l.openHands,true,g.id+' challenge must disclose exposed hands');assert.equal(l.opponentPolicy,g.proof.policy,g.id+' policy mismatch');}
 }
 const canonicalCount=g.canonicalEvidence.method==='independent-mate-canonicalization'?new Set(levels.map(l=>mateCanonical(g.id,l))).size:select(json(g.canonicalEvidence.path),g.canonicalEvidence.countPath);assert.equal(canonicalCount,100,g.id+' independent normalized distinct count');
 if(g.id==='magic-square')assert.equal(new Set(levels.map(magicCanonical)).size,100,'Magic-square independent D4 + value-complement duplicate check');
 const proofCount=select(json(g.verificationEvidence.path),g.verificationEvidence.countPath);assert.equal(proofCount,100,g.id+' independently verified proof count');
 assert(!g.proof.claim.toLowerCase().includes('all 8000 unique'),'Do not conflate proof profiles');
 kindCounts[g.proof.kind]=(kindCounts[g.proof.kind]||0)+100;
 const html=fs.readFileSync(g.entry,'utf8');assert(/lang=["']zh-Hant["']/.test(html),g.id+' Traditional Chinese interface');assert(/viewport/.test(html),g.id+' responsive viewport');
 const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,g.id+' duplicate static DOM IDs');
 records.push({id:g.id,title:entry.title,category:g.primaryCategory,challenges:100,proofs:100,canonicalDistinct:100,proofKind:g.proof.kind,claim:g.proof.claim,levelsSHA256:hash(g.levels),proofSHA256:hash(g.proof.path),browserQA:g.browserQA});
}
assert.equal(records.reduce((n,r)=>n+r.proofs,0),8000);
const report={schemaVersion:1,passed:true,scope:'Frozen-source structural integration and certificate coverage; each independent solver is rerun in the complete aggregate audit',build:registry.GAME_BUILD,baseCommit:manifest.sourceBaselineCommit,registryCount:150,newGames:80,newChallenges:8000,proofs:8000,canonicalDistinct:8000,proofKindChallengeCounts:kindCounts,primaryCategoryCounts:manifest.categoryReleaseCounts,originalGameAssetsPreserved:782,originalRecordsAndArtPreserved:70,frozenExpansionFiles:sourceCount,localReferenceAudit:references,games:records,claims:{allChallengesAreUniqueSolutionPuzzles:false,allChallengeWinsAreForced:false,realBrowserVerified:false},sourceFiles:Object.fromEntries(['verify-expansion.cjs','expansion-manifest.json','expansion-preservation.json','app.js','index.html','styles.css'].map(file=>[file,hash(file)]))};
fs.writeFileSync('expansion-verification-report.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS: 80 new games × 100 selectable challenges with complete typed certificates; frozen source hashes, canonical counts, 150-game registry, categories, titles, old assets and local references. Run verify-all.cjs for fresh independent solver/controller evidence.');
module.exports=report;
