(function(){
'use strict';
const $=id=>document.getElementById(id),E=SpiderEngine,DATA=SPIDER_DEALS.deals,KEY='arcade-spider-certified-v1',rankName=r=>({1:'A',11:'J',12:'Q',13:'K'}[r]||String(r));
let storageOK=true,book={version:1,current:0,slots:{},wins:[]},current=0,deal,state,history=[],actions=[],elapsed=0,selected=null,hinted=null,proofStates=new Map(),playing=false,playTimer=null,confirmAction=null,lastTick=Date.now(),loadedWarning='';
try{const parsed=JSON.parse(localStorage.getItem(KEY));if(parsed?.version===1&&parsed.slots&&typeof parsed.slots==='object'&&!Array.isArray(parsed.slots)){book=parsed;book.wins=Array.isArray(book.wins)?book.wins.filter(i=>Number.isInteger(i)&&i>=0&&i<50):[];book.current=Number.isInteger(book.current)&&book.current>=0&&book.current<50?book.current:0;}}catch(e){storageOK=false;}
function message(text,error=false){$('message').textContent=text;$('message').classList.toggle('error',error);}
function persist(){book.current=current;book.slots[current]={actions:actions.slice(),elapsed};try{localStorage.setItem(KEY,JSON.stringify(book));storageOK=true;}catch(e){storageOK=false;}$('saveNote').textContent=storageOK?'進度與全部復原記錄已自動儲存':'無法儲存：請勿關閉分頁，本次仍可正常遊玩';}
function updateTimer(){const seconds=Math.floor(elapsed/1000);$('timer').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
function pause(){playing=false;clearTimeout(playTimer);playTimer=null;$('play').textContent='▶ 解法演示';$('play').classList.remove('playing');}
function tick(){const now=Date.now();if(actions.length&&!E.won(state)&&!document.hidden)elapsed+=Math.max(0,now-lastTick);lastTick=now;updateTimer();}
function prepareProof(){proofStates=new Map();let s=E.start(deal);deal.solution.forEach((a,i)=>{proofStates.set(E.key(s),i);s=E.step(s,a,deal.ranks);});proofStates.set(E.key(s),deal.solution.length);}
function load(index,reset=false){pause();selected=null;hinted=null;current=index;deal=DATA[index];actions=[];history=[];state=E.start(deal);elapsed=0;loadedWarning='';if(!reset){const slot=book.slots[index];if(slot&&Array.isArray(slot.actions)){elapsed=Number.isFinite(slot.elapsed)&&slot.elapsed>=0?slot.elapsed:0;for(const a of slot.actions){try{const next=E.step(state,a,deal.ranks);history.push(state);actions.push(a);state=next;}catch(e){loadedWarning='部分儲存記錄無效，已恢復至最後一個合法步驟。';break;}}}}lastTick=Date.now();prepareProof();persist();render();message(loadedWarning||(actions.length?'已接續這一局；之前的每一步都可以復原。':'點選一張牌，再點目標列。連續降冪的牌可一起移動。'),!!loadedWarning);$('boardScroll').scrollLeft=0;}
function render(){
 const h=Math.max(200,$('boardScroll').clientHeight),cardH=innerWidth>=1200?128:122;
 $('board').replaceChildren();
 state.columns.forEach((col,c)=>{
  const el=document.createElement('div');el.className='column';el.dataset.column=c;
  if(selected&&E.canMove(state,{type:'move',from:selected.column,index:selected.index,to:c},deal.ranks))el.classList.add('target');
  if(hinted?.type==='move'&&hinted.to===c)el.classList.add('hint-target');
  const label=document.createElement('span');label.className='column-label';label.textContent=String(c+1).padStart(2,'0');el.append(label);
  const empty=document.createElement('button');empty.className='empty';empty.textContent='♠';empty.setAttribute('aria-label',`第 ${c+1} 列${col.length?'，選為目的地':'，空列'}`);empty.addEventListener('click',()=>clickColumn(c));el.append(empty);
  const hidden=col.filter(x=>!x.up).length,visible=col.length-hidden;
  const hiddenStep=9,faceStep=Math.min(25,Math.max(19,(h-cardH-47-hidden*hiddenStep)/Math.max(1,visible-1)));
  let top=25;
  col.forEach((card,i)=>{const b=document.createElement('button');b.type='button';b.className='card '+(card.up?'faceup':'back');b.style.top=top+'px';b.style.zIndex=i+1;b.dataset.column=c;b.dataset.index=i;
   if(card.up){const r=rankName(deal.ranks[card.id]);b.innerHTML='<span class="rank">'+r+'<span class="mini">♠</span></span><span class="center" aria-hidden="true">♠</span><span class="bottom" aria-hidden="true">'+r+' ♠</span>';b.setAttribute('aria-label',`第 ${c+1} 列，黑桃 ${r}${E.movable(state,c,i,deal.ranks)?`，可選取 ${col.length-i} 張`:''}`);b.addEventListener('click',()=>clickCard(c,i));b.draggable=E.movable(state,c,i,deal.ranks);b.addEventListener('dragstart',ev=>{pause();selected={column:c,index:i};hinted=null;ev.dataTransfer.setData('text/plain',JSON.stringify(selected));ev.dataTransfer.effectAllowed='move';});}
   else{b.disabled=true;b.setAttribute('aria-label',`第 ${c+1} 列，未翻開的牌`);}
   if(selected&&selected.column===c&&i>=selected.index)b.classList.add('selected');
   if(hinted?.type==='move'&&hinted.from===c&&i>=hinted.index)b.classList.add('hinted');
   el.append(b);top+=card.up?faceStep:hiddenStep;
  });
  el.style.height=Math.max(170,top+(col.length?cardH-(col.at(-1).up?faceStep:hiddenStep):0)+12)+'px';
  el.addEventListener('dragover',ev=>{if(selected&&E.canMove(state,{type:'move',from:selected.column,index:selected.index,to:c},deal.ranks)){ev.preventDefault();ev.dataTransfer.dropEffect='move';}});
  el.addEventListener('drop',ev=>{ev.preventDefault();if(selected)clickColumn(c);});
  $('board').append(el);
 });
 $('completed').innerHTML=state.completed.length+' <span>/ 8</span>';$('moves').textContent=actions.length;
 $('foundation').replaceChildren();for(let i=0;i<8;i++){const s=document.createElement('span');s.textContent='♠';if(i<state.completed.length)s.className='done';s.setAttribute('aria-label',`第 ${i+1} 組${i<state.completed.length?'已完成':'未完成'}`);$('foundation').append(s);}
 $('undo').disabled=!history.length;$('dealStock').disabled=!state.stock.length||E.won(state);$('stockLabel').textContent=`剩餘 ${state.stock.length/10} 排 · ${state.stock.length} 張`;$('dealStock').classList.toggle('hinted',hinted?.type==='deal');
 $('wonBox').hidden=!E.won(state);$('hint').disabled=E.won(state);$('play').disabled=E.won(state);$('totalWins').textContent=new Set(book.wins).size+' / 50 已通關';
 $('dealSelect').replaceChildren();DATA.forEach((d,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`第 ${String(i+1).padStart(2,'0')} 局${book.wins.includes(i)?' ✓':book.slots[i]?.actions?.length?' · 進行中':''}`;$('dealSelect').append(o);});$('dealSelect').value=current;updateTimer();
}
function act(a,automatic=false){if(!automatic)pause();let next;try{next=E.step(state,a,deal.ranks);}catch(e){message(a.type==='deal'?'有空列時不能發牌。先把任意合法牌串移到每個空列。':'這個位置不能接牌：請放到大 1 點的牌上，或移到空列。',true);return false;}tick();const completed=state.completed.length;history.push(state);actions.push({...a});state=next;selected=null;hinted=null;if(E.won(state)){pause();if(!book.wins.includes(current))book.wins.push(current);message('完成八組！這一局的全部牌張都已收好。');}else if(state.completed.length>completed)message('漂亮！完整 K → A 已自動收起，繼續整理下一組。');else message(automatic?'正在展示已驗證解法；隨時可以暫停、復原或自己接手。':a.type==='deal'?'新的一排已發出。找找能接起來的牌。':'已移動。繼續選牌，或用復原探索其他走法。');persist();render();return true;}
function clickColumn(c){pause();if(selected){const a={type:'move',from:selected.column,index:selected.index,to:c};if(selected.column===c){selected=null;render();return;}act(a);}else if(!state.columns[c].length)message('先選一張牌或合法牌串，再點這個空列。');}
function clickCard(c,i){pause();if(selected&&selected.column!==c){clickColumn(c);return;}if(selected?.column===c&&selected.index===i){selected=null;render();return;}if(!E.movable(state,c,i,deal.ranks)){message('這串牌不連續。只能選單張或同花色連續降冪的牌串。',true);return;}selected={column:c,index:i};hinted=null;render();const n=state.columns[c].length-i;message(`已選第 ${c+1} 列的 ${n} 張牌。點選金框目標列即可移動。`);}
function undo(){pause();if(!history.length)return;tick();state=history.pop();actions.pop();selected=null;hinted=null;persist();render();message('已完整復原上一步，發牌、翻牌與完成牌組也一併還原。');}
function actionText(a){if(a.type==='deal')return '發下一排：從備牌向十列各發一張。';const n=state.columns[a.from].length-a.index,r=rankName(deal.ranks[state.columns[a.from][a.index].id]);return `將第 ${a.from+1} 列以 ${r} 開頭的 ${n} 張牌，移到第 ${a.to+1} 列。`;}
function showHint(){pause();selected=null;const at=proofStates.get(E.key(state));if(at!==undefined&&at<deal.solution.length){hinted=deal.solution[at];message('認證解法下一步：'+actionText(hinted));}else{const choices=E.legal(state,deal.ranks);choices.sort((a,b)=>score(b)-score(a));hinted=choices[0]||(E.canDeal(state)?{type:'deal'}:null);message(hinted?'目前合法建議（未保證通關）：'+actionText(hinted):'目前沒有可用的移動或發牌。可復原到較早的位置，或重新演示完整解法。',!hinted);}render();if(hinted?.type==='move')$('board').children[hinted.from].scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});}
function score(a){const col=state.columns[a.from];return (a.index>0&&!col[a.index-1].up?30:0)+(state.columns[a.to].length?8:0)+(col.length-a.index);}
function ask(title,text,button,callback){pause();confirmAction=callback;$('confirmTitle').textContent=title;$('confirmText').textContent=text;$('confirmYes').textContent=button;$('confirmDialog').showModal();}
function startPlayback(){if(E.won(state))return;playing=true;$('play').textContent='Ⅱ 暫停演示';$('play').classList.add('playing');message('正在展示這一局的已驗證解法；可以隨時暫停接手。');const advance=()=>{if(!playing)return;const at=proofStates.get(E.key(state));if(at===undefined){pause();message('目前牌桌已偏離認證路線，演示已安全停止。',true);return;}if(at>=deal.solution.length){pause();return;}act(deal.solution[at],true);if(playing)playTimer=setTimeout(advance,480);};playTimer=setTimeout(advance,350);}
$('play').addEventListener('click',()=>{if(playing){pause();message('演示已暫停。你可以接手移動，或繼續觀看。');return;}if(!proofStates.has(E.key(state)))ask('從開局展示解法？','目前走法已偏離已驗證路線。演示需要重開這一局，這局的進行中步驟會被清除；已通關紀錄保留。','重開並展示',()=>{load(current,true);startPlayback();});else startPlayback();});
$('hint').addEventListener('click',showHint);$('undo').addEventListener('click',undo);$('dealStock').addEventListener('click',()=>act({type:'deal'}));$('dealSelect').addEventListener('change',e=>{tick();persist();load(Number(e.target.value));});
$('restart').addEventListener('click',()=>{if(!actions.length){load(current,true);return;}ask('重新開始這一局？','這局的進行中步驟將清除。其他牌局與已通關紀錄會保留。','重新開始',()=>load(current,true));});
function next(){tick();persist();let target=DATA.findIndex((_,i)=>i!==current&&!book.slots[i]?.actions?.length&&!book.wins.includes(i));if(target<0)target=(current+1)%DATA.length;load(target);}
$('newGame').addEventListener('click',next);$('nextGame').addEventListener('click',next);
$('rules').addEventListener('click',()=>{pause();$('rulesDialog').showModal();});$('proof').addEventListener('click',()=>{pause();$('proofDialog').showModal();});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$ (b.dataset.close).close()));
$('confirmCancel').addEventListener('click',()=>{confirmAction=null;$('confirmDialog').close();});$('confirmYes').addEventListener('click',()=>{const a=confirmAction;confirmAction=null;$('confirmDialog').close();if(a)a();});$('confirmDialog').addEventListener('cancel',()=>{confirmAction=null;});
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();}else if(e.key==='Escape'){pause();selected=null;hinted=null;render();message('已取消選牌。');}});
document.addEventListener('dragend',()=>render());
document.addEventListener('visibilitychange',()=>{lastTick=Date.now();if(document.hidden){pause();persist();}});window.addEventListener('pagehide',()=>{tick();persist();});window.addEventListener('resize',()=>render());
load(book.current);setInterval(tick,1000);setInterval(persist,5000);
// Read-only test access for published browser QA; all changes still use UI controls.
window.spiderQA={snapshot:()=>({current,state:JSON.parse(JSON.stringify(state)),actions:JSON.parse(JSON.stringify(actions)),elapsed,playing,matchedProof:proofStates.get(E.key(state)),storageOK})};
})();
