'use strict';
/* Deterministic cross-tab read/write interleaving. No browser/rendering claim.
   Run with HEARTS_REVIEW_ROOT=/absolute/site/games node concurrent-write-repro.cjs */
const {boot,ROOT}=require('./controller-harness.cjs'),E=require(ROOT+'/hearts/match-engine.js');
let s=E.create(2);
while(s.phase!=='play'||s.turn!==0||E.legalCards(s).length<2){
  if(s.phase==='pass')s=E.transition(s,{type:'pass',p:s.turn,cards:s.hands[s.turn].slice(0,3)});
  else if(s.phase==='play')s=E.transition(s,{type:'play',p:s.turn,card:E.legalCards(s)[0]});
  else s=E.transition(s,{type:'collect'});
}
const KEY='arcade.hearts.full-match.v3',store={[KEY]:JSON.stringify({schema:1,game:E.save(s)})};
const a=boot({storage:store}),b=boot({storage:store});
a.click('resume-button');b.click('resume-button');
const [ca,cb]=a.snapshot().legal;a.select(ca);b.select(cb);
const get=a.s.localStorage.getItem;let n=0,bSave;
a.s.localStorage.getItem=function(k){
  const old=get(k);
  // A has read the original bytes for its final ownership check. B commits
  // before A sets its bytes. Each localStorage operation remains individually atomic.
  if(k===KEY&&++n===2){b.click('confirm-button');bSave=store[KEY];}
  return old;
};
a.click('confirm-button');
const result={oldEvents:s.events.length,aEvents:a.snapshot().events,bEvents:b.snapshot().events,aConflict:a.snapshot().conflict,bConflict:b.snapshot().conflict,aLockHeld:a.snapshot().lockHeld,bLockBlocked:b.snapshot().lockBlocked,aPlayed:ca,bPlayed:cb,bSaveLost:b.snapshot().events>s.events.length&&store[KEY]!==bSave,finalAction:JSON.parse(JSON.parse(store[KEY]).game).events.at(-1)};
console.log(JSON.stringify(result,null,2));
process.exitCode=result.aEvents>s.events.length&&result.bEvents>s.events.length&&result.bSaveLost?1:0;
