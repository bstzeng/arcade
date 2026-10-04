'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {boot,ROOT}=require('./controller-harness.cjs'),E=require(ROOT+'/hearts/match-engine.js');
const s=E.load(fs.readFileSync(path.join(__dirname,'moon-fixture.json'),'utf8'));
const u=boot({storage:{'arcade.hearts.full-match.v3':JSON.stringify({schema:1,game:E.save(s)})}});
u.click('resume-button');u.close('result-dialog');
const names=['你','青禾','阿木','小岑'];let checks=0;
for(let p=0;p<4;p++){
 assert.ok(u.get('seat-'+p).textContent.includes(`本副 ${s.roundScores[p]} 分`));checks++;
 const row=u.get('score-list').querySelectorAll('.score-row').find(x=>x.textContent.includes(names[p]));
 assert.ok(row.textContent.includes(`本副 ${s.roundScores[p]} 分`));checks++;
}
const report={kind:'simulated-DOM moon-result display regression',status:'passed',checks,seed:s.seed,moon:s.moon,rawPoints:s.points,displayedPoints:s.roundScores};
fs.writeFileSync(path.join(__dirname,'moon-ui-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
