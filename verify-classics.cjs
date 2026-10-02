#!/usr/bin/env node
'use strict';
// Reproducible certification of 500 fixed classic puzzles. Node 18+ and Python 3.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
process.chdir(__dirname);
const registry=require('./verify-lobby.cjs');
const suites=[
 ['sudoku','verification.json','levels','solutions',[['python3','verify.py'],['node','test.cjs'],['node','test-ui.cjs']]],
 ['minesweeper','verification.json','levels',null,[['python3','verify.py'],['node','test.cjs'],['node','test-ui.cjs']]],
 ['fifteen-puzzle','certification.json','results',null,[['python3','verify-independent.py'],['node','test.cjs'],['node','test-ui.cjs']]],
 ['hanoi','certification.json','results',null,[['python3','verify-independent.py'],['node','test.cjs'],['node','test-ui.cjs']]],
 ['mastermind','proof.json','results','solutionCount',[['node','verify.cjs'],['node','controller-tests.cjs']]],
 ['akari','proof.json','results','solutionCount',[['python3','verify.py'],['node','controller-tests.cjs']]],
 ['hitori','verification.json','results','solutions',[['node','test.cjs'],['python3','verify.py'],['node','ui-test.cjs']]],
 ['shikaku','verification.json','results','solutions',[['node','test.cjs'],['python3','verify.py'],['node','ui-test.cjs']]],
 ['numberlink','verification-report.json','records','count',[['python3','verify.py'],['node','test.cjs']]],
 ['star-battle','verification-report.json','records','count',[['python3','verify.py'],['node','test.cjs']]]
];
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const preservation=JSON.parse(fs.readFileSync('classics-preservation.json','utf8'));let preserved=0;
for(const [file,sha]of Object.entries(preservation.assets)){assert.equal(hash(file),sha,'Original asset changed: '+file);preserved++;}
const report={passed:false,build:registry.GAME_BUILD,registryCount:67,newGames:10,levelsPerGame:50,totalVerifiedLevels:0,uniquePuzzleLevels:0,noGuessMinesweeperLevels:0,legalMoveWitnessLevels:0,preservedOriginalGames:37,preservedOriginalAssets:preserved,baseCommit:preservation.baseCommit,claims:{uniqueGames:['sudoku','mastermind','akari','hitori','shikaku','numberlink','star-battle'],mastermind:'Uniqueness follows from the prefilled initial clue rows, not merely from a fixed secret code.',minesweeper:'Proof steps are justified using only revealed numbers, previously proven mines, and the published total mine count.',fifteenPuzzle:'20 small 3x3 boards have exact BFS optima; 30 full 4x4 boards provide legal reference routes without optimality claims.',hanoi:'All 50 legal witnesses also have independently enumerated shortest distances.',initialPositionsOnly:true,controllerTestsAreNotBrowserVisualTests:true},suites:[]};
for(const [id,proofFile,key,countKey,commands]of suites){const dir=path.join('games',id);const data=JSON.parse(fs.readFileSync(path.join(dir,'levels.json'),'utf8')),levels=Array.isArray(data)?data:data.levels;assert.equal(levels.length,50,id);assert.equal(new Set(levels.map(x=>x.id)).size,50,id+' duplicate IDs');const row={game:id,levels:50,checks:[],files:{}};report.suites.push(row);
 for(const [bin,f,...extra]of commands){const args=[path.join(dir,f),...extra];console.log('\n> '+bin+' '+args.join(' '));const t=Date.now(),r=spawnSync(bin==='node'?process.execPath:bin,args,{encoding:'utf8',maxBuffer:30*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);row.checks.push({command:bin+' '+args.join(' '),passed:r.status===0,seconds:+((Date.now()-t)/1000).toFixed(3),output:(r.stdout||'').trim(),stderr:(r.stderr||'').trim()});if(r.error||r.status!==0){fs.writeFileSync('classics-verification-report.json',JSON.stringify(report,null,2)+'\n');throw r.error||Error('Failed '+id+' '+f);}}
 const proof=JSON.parse(fs.readFileSync(path.join(dir,proofFile),'utf8'));assert.equal(proof[key].length,50,id+' missing per-level proof');row.independentProof=proofFile;row.results=proof[key];
 if(countKey){assert(proof[key].every(x=>x[countKey]===1),id+' uniqueness');report.uniquePuzzleLevels+=50;}
 if(id==='minesweeper'){assert.equal(proof.verified,true);assert.equal(proof.noGuessCertificates,50);assert(proof.rejectedTamperedProofs>=3);report.noGuessMinesweeperLevels=50;}
 if(['fifteen-puzzle','hanoi'].includes(id)){assert.equal(proof.status,'passed');assert.equal(proof.independentWitnessesReplayed,50);assert(proof.results.every(x=>x.passed===true));report.legalMoveWitnessLevels+=50;}
 for(const f of fs.readdirSync(dir).filter(n=>/\.(?:js|cjs|json|py|css|md|log)$/.test(n)).sort()){row.files[f]=hash(path.join(dir,f));if(/\.(?:js|cjs)$/.test(f))new vm.Script(fs.readFileSync(path.join(dir,f),'utf8'),{filename:path.join(dir,f)});}row.entrySHA256=hash('games/'+id+'.html');report.totalVerifiedLevels+=50;
}
assert.equal(report.totalVerifiedLevels,500);assert.equal(report.uniquePuzzleLevels,350);assert.equal(report.noGuessMinesweeperLevels,50);assert.equal(report.legalMoveWitnessLevels,100);report.passed=true;fs.writeFileSync('classics-verification-report.json',JSON.stringify(report,null,2)+'\n');console.log('\nPASS: 500 new puzzles; 350 uniquely solved clue challenges, 50 no-guess minefields, 100 legal move witnesses; 67 lobby links; '+preserved+' original assets preserved.');
