/* UI never changes cards directly: every draw, recycle, and removal uses engine.step. */
(function () {
'use strict';
const E=window.PyramidEngine, database=window.PYRAMID_DEALS, $=id=>document.getElementById(id);
const KEY='arcade-pyramid-v1', suits=['♠','♥','♣','♦'], suitNames=['黑桃','紅心','梅花','方塊'];
const face=c=>['','A','2','3','4','5','6','7','8','9','10','J','Q','K'][E.rank(c)];
const name=c=>`${suitNames[Math.floor(c/13)]} ${face(c)}（${E.rank(c)}）`;
let deal,states,log=[],proofStates,proofMap,selected=null,hintAction=null,elapsed=0,assisted=false,autoplay=null,saveOK=true,confirmAction=null,confirmFocus=null;
let lastTick=performance.now(),saveClock=0,notice='從最下層開始，找到合計 13 的兩張牌';
const state=()=>states[states.length-1];
const format=n=>`${Math.floor(n/60)}:${String(Math.floor(n)%60).padStart(2,'0')}`;
function setStatus(s){notice=s;$('status').textContent=s;}
function stopPlayback(message){if(autoplay!==null){clearInterval(autoplay);autoplay=null;if(message)setStatus(message);} $('solution').textContent='▶ 播放完整解答';}
function save(){
  try{localStorage.setItem(KEY,JSON.stringify({version:1,deal:deal.id,actions:log,elapsed:Math.floor(elapsed),assisted}));saveOK=true;}
  catch(_){saveOK=false;}
  $('saveStatus').textContent=saveOK?'進度保存在此瀏覽器':'瀏覽器無法儲存；本局仍可遊玩';
}
function ask(title,text,action){
  stopPlayback();if(deal)render();confirmAction=action;confirmFocus=document.activeElement;
  $('confirmTitle').textContent=title;$('confirmText').textContent=text;$('confirmDialog').showModal();$('cancelConfirm').focus();
}
function load(d,actions=[],seconds=0,used=false){
  stopPlayback();deal=d;log=actions.slice();states=E.replay(deal,log);proofStates=E.proof(deal);
  proofMap=new Map(proofStates.map((s,i)=>[E.key(s),i]));selected=null;hintAction=null;elapsed=seconds;assisted=used;lastTick=performance.now();
  notice=E.won(state())?'這局已經完成，可重玩或選擇下一局':'從最下層開始，找到合計 13 的兩張牌';render();save();
}
function selectDeal(d){
  if(d.id===deal.id)return;
  const go=()=>load(d);
  if(log.length||elapsed>0)ask('開始另一局？','切換牌局會清除目前這局的進度與撤銷紀錄。',go);else go();
}
function cardButton(c,loc){
  const b=document.createElement('button'),s=state(),pos=loc==='waste'?-1:loc;
  const free=pos<0||E.exposed(s,pos);b.type='button';b.className='card'+([1,3].includes(Math.floor(c/13))?' red':'')+(!free?' covered':'')+(selected===c?' selected':'')+(hintAction&&hintAction.cards&&hintAction.cards.includes(c)?' hinted':'');
  b.dataset.card=String(c);b.disabled=!free||autoplay!==null;
  let where='最上方廢牌';
  if(pos>=0){let r=0;while((r+1)*(r+2)/2<=pos)r++;where=`第 ${r+1} 層第 ${pos-r*(r+1)/2+1} 張`;}
  b.setAttribute('aria-label',`${name(c)}，${where}，${free?'可配對':'尚有覆蓋牌'}`);b.setAttribute('aria-pressed',String(selected===c));
  const corner=document.createElement('span');corner.className='corner';corner.textContent=face(c)+suits[Math.floor(c/13)];
  const symbol=document.createElement('span');symbol.className='suit';symbol.textContent=suits[Math.floor(c/13)];symbol.setAttribute('aria-hidden','true');
  const value=document.createElement('span');value.className='value';value.textContent=E.rank(c);value.setAttribute('aria-hidden','true');b.append(corner,symbol,value);b.addEventListener('click',()=>pick(c));return b;
}
function render(){
  const active=document.activeElement,focusCard=active&&active.dataset?active.dataset.card:null,s=state();
  $('pyramid').replaceChildren();
  let pos=0;
  for(let r=0;r<7;r++)for(let col=0;col<=r;col++,pos++){
    const c=s.pyramid[pos],b=c===null?document.createElement('div'):cardButton(c,pos);
    if(c===null){b.className='card empty';b.setAttribute('aria-hidden','true');}
    b.style.setProperty('--row',r);b.style.setProperty('--left',`${((6-r)/2+col)/7*100}%`);$('pyramid').append(b);
  }
  $('waste').replaceChildren();if(s.waste.length)$('waste').append(cardButton(s.waste.at(-1),'waste'));
  $('stockCount').textContent=s.stock.length;$('wasteCount').textContent=s.waste.length;
  $('drawLabel').textContent=s.stock.length?'翻一張':(s.waste.length&&s.redeals<2?'重新循環':'已無翻牌');
  $('stock').setAttribute('aria-label',s.stock.length?`翻出牌庫下一張，剩餘 ${s.stock.length} 張`:(s.waste.length&&s.redeals<2?`將廢牌重新循環，剩餘 ${2-s.redeals} 次`:'沒有可翻的牌'));
  $('stock').disabled=E.won(s)||autoplay!==null||(!s.stock.length&&(!s.waste.length||s.redeals>=2));
  $('stock').classList.toggle('hinted',!!hintAction&&['draw','recycle'].includes(hintAction.type));
  $('cleared').innerHTML=`${28-s.pyramid.filter(c=>c!==null).length}<small> / 28</small>`;
  $('moves').textContent=s.moves;$('time').textContent=format(elapsed);$('cycles').innerHTML=`${2-s.redeals}<small> 次</small>`;
  $('deal').value=String(deal.id);$('dealLabel').textContent=`牌局 ${String(deal.id).padStart(2,'0')}`;
  $('certified').textContent=assisted?'◆ 已驗證有解 · 輔助':'◆ 已驗證有解';
  $('undo').disabled=!log.length;$('hint').disabled=E.won(s);$('solution').textContent=autoplay===null?'▶ 播放完整解答':'Ⅱ 停止播放';
  $('win').hidden=!E.won(s);
  if(E.won(s)){$('winTitle').textContent=autoplay!==null?'解答示範完成！':'金字塔清空了！';$('winDetail').textContent=`${s.moves} 步 · ${format(elapsed)}${assisted?' · 本局使用了輔助':''}`;}
  $('status').textContent=notice;
  if(focusCard!==null){const b=document.querySelector(`[data-card="${focusCard}"]`);if(b&&!b.disabled)b.focus({preventScroll:true});}
}
function describe(a){
  if(a.type==='draw')return '提示：點亮框牌庫，翻出下一張牌';
  if(a.type==='recycle')return '提示：點亮框牌庫，將廢牌重新循環';
  return a.cards.length===1?`提示：移除 ${name(a.cards[0])}`:`提示：配對 ${name(a.cards[0])} 與 ${name(a.cards[1])}`;
}
function hasRemoval(s){const p=E.playable(s);return p.some((c,i)=>E.rank(c)===13||p.slice(i+1).some(d=>E.rank(c)+E.rank(d)===13));}
function perform(a,fromPlayback=false){
  if(autoplay!==null&&!fromPlayback)return;
  if(!E.legal(state(),a)){setStatus('這一步目前不合法，請選擇完全露出的牌');return;}
  const clean=a.type==='remove'?{type:a.type,cards:a.cards.slice()}:{type:a.type};
  states.push(E.step(state(),clean));log.push(clean);selected=null;hintAction=null;
  if(E.won(state()))notice=fromPlayback?'完整解答已逐步播放完畢；你可以重玩，自己挑戰一次':'完成！金字塔已清空，牌庫剩牌不影響勝利';
  else if(fromPlayback)notice=`解答示範第 ${log.length} 步：${a.type==='remove'?'移除 '+a.cards.map(name).join(' ＋ '):a.type==='draw'?'翻出一張牌':'重新循環廢牌'}`;
  else if(!hasRemoval(state()))notice=state().stock.length?'目前沒有可配對組合，可以翻出下一張牌':E.legal(state(),{type:'recycle'})?'目前沒有配對；可重新循環廢牌':'目前已無合法下一步，可以撤銷，或用提示退回已知可解位置';
  else notice=a.type==='remove'?'配對成功，看看剛露出的牌':'翻牌完成，看看有沒有合計 13 的組合';
  render();save();
  if(E.won(state())&&autoplay!==null)stopPlayback();
}
function pick(c){
  if(autoplay!==null||E.won(state()))return;
  if(!E.playable(state()).includes(c))return;
  if(E.rank(c)===13){perform({type:'remove',cards:[c]});return;}
  if(selected===c){selected=null;hintAction=null;notice='已取消選牌';render();return;}
  if(selected!==null){
    if(E.rank(selected)+E.rank(c)===13){perform({type:'remove',cards:[selected,c]});return;}
    selected=c;hintAction=null;notice=`兩張未合計 13；改選 ${name(c)}，再找一張 ${13-E.rank(c)}`;
  }else{selected=c;hintAction=null;notice=`已選 ${name(c)}，再找一張 ${13-E.rank(c)}`;}
  render();
}
function showHint(){
  stopPlayback();if(E.won(state()))return;
  const index=proofMap.get(E.key(state()));
  if(index!==undefined){
    const a=deal.witness[index];if(!a||!E.legal(state(),a)){setStatus('此位置沒有可用的驗證提示');return;}
    assisted=true;selected=null;hintAction=a;notice=describe(a);render();save();return;
  }
  let checkpoint=states.length-2;
  while(checkpoint>=0&&!proofMap.has(E.key(states[checkpoint])))checkpoint--;
  if(checkpoint<0){setStatus('找不到安全的提示位置，請重玩本局');return;}
  const count=log.length-checkpoint;
  ask('退回已知可解的位置？',`目前走法已離開保存的解答，並不表示一定無解。要撤銷最近 ${count} 步，回到已驗證可解的位置再顯示提示嗎？退回後仍可自行遊玩。`,()=>{
    log=log.slice(0,checkpoint);states=states.slice(0,checkpoint+1);selected=null;hintAction=null;assisted=true;showHint();
  });
}
$('stock').addEventListener('click',()=>perform({type:state().stock.length?'draw':'recycle'}));
$('undo').addEventListener('click',()=>{stopPlayback();if(!log.length)return;log.pop();states.pop();selected=null;hintAction=null;notice='已撤銷一步；可以嘗試不同選擇';render();save();});
$('hint').addEventListener('click',showHint);
$('restart').addEventListener('click',()=>{if(log.length||elapsed>0)ask('重玩本局？','將回到同一副初始牌，清除本局操作紀錄與計時。',()=>load(deal));else load(deal);});
$('next').addEventListener('click',()=>selectDeal(database.deals[deal.id%database.deals.length]));
$('deal').addEventListener('change',e=>{const next=database.deals.find(d=>d.id===Number(e.target.value));$('deal').value=String(deal.id);if(next)selectDeal(next);});
$('solution').addEventListener('click',()=>{
  if(autoplay!==null){stopPlayback('已停止示範，你可以從目前位置接手');render();save();return;}
  ask('播放完整解答？','將重新開始本局並依序示範所有合法步驟，清除原操作紀錄與計時。可隨時按「停止播放」接手；完成後會標示使用了輔助。',()=>{
    load(deal,[],0,true);notice='開始示範完整解答，可隨時停止接手';
    autoplay=setInterval(()=>{
      if(document.hidden){stopPlayback('切換頁面時已暫停示範，你可以接手或重新播放');render();return;}
      const a=deal.witness[log.length];if(!a){stopPlayback();render();return;}perform(a,true);
    },650);render();save();
  });
});
$('acceptConfirm').addEventListener('click',()=>{const fn=confirmAction;confirmAction=null;$('confirmDialog').close();if(fn)fn();});
$('cancelConfirm').addEventListener('click',()=>{confirmAction=null;$('confirmDialog').close();});
$('confirmDialog').addEventListener('close',()=>{confirmAction=null;if(confirmFocus&&confirmFocus.isConnected)confirmFocus.focus({preventScroll:true});});
$('help').addEventListener('click',()=>{stopPlayback('已停止示範');render();$('helpDialog').showModal();$('closeHelp').focus();});
$('closeHelp').addEventListener('click',()=>$('helpDialog').close());
$('helpDialog').addEventListener('close',()=>$('help').focus({preventScroll:true}));
try{
  if(database.version!==1||database.deals.length<50)throw Error('資料版本錯誤');
  database.deals.forEach(d=>{E.proof(d);const o=document.createElement('option');o.value=d.id;o.textContent=`第 ${String(d.id).padStart(2,'0')} 局 · 已驗證有解`;$('deal').append(o);});
  let restored=false,badSave=false;
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){
      const saved=JSON.parse(raw),d=database.deals.find(d=>d.id===saved.deal);
      if(saved.version!==1||!d||!Array.isArray(saved.actions)||!Number.isSafeInteger(saved.elapsed)||saved.elapsed<0||saved.elapsed>31536000||typeof saved.assisted!=='boolean')throw Error('無效存檔');
      E.replay(d,saved.actions);load(d,saved.actions,saved.elapsed,saved.assisted);restored=true;
    }
  }catch(_){badSave=true;}
  if(!restored)load(database.deals[0]);
  if(badSave)setStatus(saveOK?'舊存檔無法通過驗證，已安全開始第 01 局':'瀏覽器無法儲存進度，本局仍可正常遊玩');
  else if(!saveOK)setStatus('瀏覽器無法儲存進度，本局仍可正常遊玩');
  else if(restored)setStatus(E.won(state())?'已恢復完成的牌局；可重玩或選擇下一局':'已恢復並驗證每一步存檔，可以繼續遊玩');
  setInterval(()=>{
    const now=performance.now(),dt=(now-lastTick)/1000;lastTick=now;
    if(!document.hidden&&log.length&&!E.won(state())){elapsed+=Math.min(dt,1);$('time').textContent=format(elapsed);saveClock+=dt;if(saveClock>=5){saveClock=0;save();}}
  },250);
}catch(error){setStatus('遊戲資料驗證失敗，請重新整理。為避免錯誤牌局，已停止操作。');document.querySelectorAll('button,select').forEach(b=>{if(!['help','closeHelp'].includes(b.id))b.disabled=true;});console.error(error);}
document.addEventListener('visibilitychange',()=>{lastTick=performance.now();if(document.hidden){stopPlayback();save();}else if(deal)render();});
window.addEventListener('pagehide',()=>{stopPlayback();if(deal)save();});
})();
