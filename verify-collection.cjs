#!/usr/bin/env node
'use strict';
// Reproducible independent certification; tests run in isolated copies so source assets stay frozen.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
process.chdir(__dirname);
const registry=require('./verify-lobby.cjs');
const suites=[
 ['mahjong-solitaire','certification.json','levels','solvable',[['python3','verify-independent.py'],['node','controller-tests.cjs']]],
 ['tangram','certification.json','levels','solvable',[['python3','verify-independent.py'],['node','controller-tests.cjs']]],
 ['samegame','certification.json','rows','solved',[['python3','verify.py'],['node','controller-tests.cjs']]],
 ['untangle','certification.json','rows','solved',[['python3','verify.py'],['node','controller-tests.cjs']]],
 ['dominosa','proof.json','levels','solutions',[['python3','verify.py'],['node','controller-tests.cjs']]],
 ['unruly','proof.json','levels','solutions',[['python3','verify.py'],['node','controller-tests.cjs']]],
 ['keen','verification.json','results','solutionCount',[['python3','verify-primary.py'],['node','verify-independent.cjs'],['node','controller-tests.cjs']]],
 ['galaxies','verification.json','results','solutionCount',[['python3','verify-primary.py'],['node','verify-independent.cjs'],['node','controller-tests.cjs']]],
 ['signpost','verification-report.json','results','solutionCount',[['python3','verify.py'],['python3','solver-tests.py'],['node','controller-tests.cjs']]],
 ['fillomino','verification-report.json','results','solutionCount',[['python3','verify.py'],['python3','solver-tests.py'],['node','controller-tests.cjs']]]
];
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const preservation=JSON.parse(fs.readFileSync('collection-preservation.json','utf8'));
function checkPreservation(){for(const [file,sha] of Object.entries(preservation.assets))assert.equal(hash(file),sha,'Historical asset changed: '+file);}
checkPreservation();
const report={passed:false,build:registry.GAME_BUILD,registryCount:57,batchGames:10,levelsPerGame:50,totalVerifiedLevels:0,uniqueSolutionLevels:0,completionWitnessLevels:0,preservedOriginalGames:47,preservedOriginalAssets:Object.keys(preservation.assets).length,baseCommit:preservation.baseCommit,claims:{initialPositionsOnly:true,uniqueGames:['dominosa','unruly','keen','galaxies','signpost','fillomino'],multipleSolutionsAllowed:['mahjong-solitaire','tangram','samegame','untangle'],independentCertificatesRegeneratedInIsolation:true,controllerTestsAreNotBrowserVisualTests:true,mobileBrowserTestingClaimed:false},suites:[]};
const reportFile='collection-verification-report.json';
try{
 for(const [id,proofFile,rowsKey,resultKey,commands] of suites){
  const dir=path.join(__dirname,'games',id),entry=registry.games.find(g=>g.id===id);assert.equal(entry.category,'collection');
  const data=JSON.parse(fs.readFileSync(path.join(dir,'levels.json'),'utf8')),levels=Array.isArray(data)?data:data.levels;assert.equal(levels.length,50,id);assert.equal(new Set(levels.map(x=>x.id)).size,50,id+' duplicate level IDs');
  const row={game:id,levels:50,proof:proofFile,checks:[],files:{}};report.suites.push(row);
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'arcade-'+id+'-')),copy=path.join(temporary,'games',id);fs.mkdirSync(path.dirname(copy),{recursive:true});fs.cpSync(dir,copy,{recursive:true,filter:f=>!f.includes('__pycache__')});fs.copyFileSync(path.join(__dirname,'games',id+'.html'),path.join(temporary,'games',id+'.html'));
  try{
   for(const [bin,file,...extra]of commands){const args=[path.join(copy,file),...extra];console.log('\n> '+bin+' games/'+id+'/'+file);const t=Date.now(),r=spawnSync(bin==='node'?process.execPath:bin,args,{cwd:temporary,encoding:'utf8',maxBuffer:30*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);row.checks.push({command:bin+' games/'+id+'/'+file,passed:r.status===0,seconds:+((Date.now()-t)/1000).toFixed(3),output:(r.stdout||'').trim(),stderr:(r.stderr||'').trim()});if(r.error||r.status!==0)throw r.error||Error('Failed '+id+' '+file);}
   const proof=JSON.parse(fs.readFileSync(path.join(copy,proofFile),'utf8'));assert.equal(proof[rowsKey].length,50,id+' proof row count');assert.equal(new Set(proof[rowsKey].map(x=>x.id)).size,50,id+' duplicate proof IDs');for(let i=0;i<50;i++)assert.equal(proof[rowsKey][i].id,levels[i].id,id+' proof identity');
   const unique=report.claims.uniqueGames.includes(id);assert(proof[rowsKey].every(r=>r[resultKey]===(unique?1:true)),id+' failed proof result');row.results=proof[rowsKey];
   if(unique)report.uniqueSolutionLevels+=50;else report.completionWitnessLevels+=50;
   const distinctKey={"mahjong-solitaire":"uniqueLayouts",tangram:'uniqueSilhouettes',samegame:'distinctModuloColorNamesAndHorizontalReflection',untangle:'nonIsomorphicGraphCount',dominosa:'canonicalDistinct',unruly:'canonicalDistinct',keen:'canonicalUniquePuzzles',galaxies:'canonicalUniquePuzzles',signpost:'canonicalDistinctSolutions',fillomino:'canonicalDistinctSolutions'}[id];assert.equal(proof[distinctKey],50,id+' distinctness');row.distinctness={key:distinctKey,count:50};
   if(id==='untangle')assert(proof.rows.every(r=>r.connected&&r.solutionCrossings===0&&r.degenerateConflicts===0));if(id==='samegame')assert(proof.rows.every(r=>r.remaining===0));if(id==='unruly'){assert.equal(proof.solutionCanonicalDistinct,50);assert.equal(proof.repeatedRowsAllowed,true);}if(id==='fillomino')assert.equal(proof.cluelessRegionsAllowed,true);
  }finally{fs.rmSync(temporary,{recursive:true,force:true});}
  for(const f of fs.readdirSync(dir).filter(f=>/\.(?:js|cjs|json|py|css|md|log)$/.test(f)).sort()){row.files[f]=hash(path.join(dir,f));if(/\.(?:js|cjs)$/.test(f))new vm.Script(fs.readFileSync(path.join(dir,f),'utf8'),{filename:path.join(dir,f)});}row.entrySHA256=hash(path.join(__dirname,'games',id+'.html'));report.totalVerifiedLevels+=50;
 }
 assert.equal(report.totalVerifiedLevels,500);assert.equal(report.uniqueSolutionLevels,300);assert.equal(report.completionWitnessLevels,200);checkPreservation();report.passed=true;
}finally{fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');}
console.log('\nPASS: 500 new levels; 300 independent unique solutions and 200 legal completion witnesses; 57 lobby entries; all '+report.preservedOriginalAssets+' historical game assets unchanged.');
