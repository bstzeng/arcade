(function(){
  'use strict';
  const E=window.TriPeaks,D=window.TRIPEAKS_DATA,S=window.TriPeaksSession;
  const $=id=>document.getElementById(id),SAVE_KEY='arcade-tripeaks-certified-v1';
  if(!E||!D||!S){$('status').textContent='遊戲檔案未完整載入，請重新整理後再試';return;}
  const SUITS=['♠','♥','♣','♦'],SUIT_NAMES=['黑桃','紅心','梅花','方塊'];
  const ranks=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const name=c=>SUIT_NAMES[E.suit(c)]+' '+ranks[E.rank(c)];
  const where=i=>{const row=E.POSITIONS[i][1],start=[0,3,9,18][row];return `第 ${row+1} 列第 ${i-start+1} 張`;};
  let book=S.empty(),storageOK=true,recovered=false;
  try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const result=S.decode(raw);book=result.book;recovered=result.recovered;}}
  catch(_){storageOK=false;}
  let deal,trace=[],state,elapsed=0,assisted=false,checkpoints,preview=null,previewInterval=null;
  let hintAction=null,message='',confirmAction=null,lastTick=performance.now(),lastSave=lastTick,initialized=false;
  const clockText=ms=>{const sec=Math.floor(ms/1000);return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;};
  function anyDialog(){return !!document.querySelector('dialog[open]');}
  function tick(){
    const now=performance.now();
    if(initialized&&trace.length&&state.remaining&&!preview&&!document.hidden&&!anyDialog())elapsed+=Math.max(0,now-lastTick);
    lastTick=now;
    if(initialized)$('timer').textContent=clockText(elapsed);
  }
  function remember(){
    if(!initialized)return;
    book.active=deal.id;
    book.records[deal.id]={seed:deal.seed,actions:trace.slice(),elapsed,assisted};
  }
  function save(){
    remember();
    try{localStorage.setItem(SAVE_KEY,S.encode(book));storageOK=true;}catch(_){storageOK=false;}
    $('saveStatus').textContent=storageOK?'進度自動保存在此瀏覽器':'儲存不可用；目前只保留在此分頁';
    lastSave=performance.now();
  }
  function openDialog(id){tick();$(id).showModal();}
  function closeDialog(id){$(id).close();lastTick=performance.now();}
  function confirm(title,text,label,fn){
    confirmAction=fn;$('confirmTitle').textContent=title;$('confirmText').textContent=text;$('confirmOK').textContent=label;openDialog('confirmDialog');
  }
  function choose(id){
    const next=D.deals.find(d=>d.id===id);if(!next)return false;
    tick();if(preview)stopPreview(false);remember();
    deal=next;const record=book.records[id];
    trace=record?record.actions.slice():[];elapsed=record?record.elapsed:0;assisted=record?record.assisted:false;
    state=E.replay(deal,trace);checkpoints=E.checkpoints(deal,deal.witness);hintAction=null;initialized=true;lastTick=performance.now();
    message=trace.length?`已接續第 ${String(id).padStart(3,'0')} 副牌局，悔棋歷史也已保留`:'從底列開始，找一張比接牌堆大 1 或小 1 的牌';
    if(!state.remaining)message='這副已經通關，可以重新挑戰或選下一副';
    render();save();return true;
  }
  function cardFace(element,card){
    const corner=document.createElement('span');corner.className='corner';
    const value=document.createElement('span');value.textContent=ranks[E.rank(card)];
    const suit=document.createElement('span');suit.className='suit';suit.textContent=SUITS[E.suit(card)];
    corner.append(value,suit);
    const center=document.createElement('span');center.className='center-suit';center.textContent=SUITS[E.suit(card)];
    element.append(corner,center);
    if(E.suit(card)===1||E.suit(card)===3)element.classList.add('red');
  }
  function renderBoard(s){
    const focused=document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.card:null;
    const el=$('tableau');el.replaceChildren();
    for(let i=0;i<28;i++){
      if(!(s.remaining&(1<<i)))continue;
      const button=document.createElement('button'),open=E.exposed(s,i),playable=E.canRemove(deal,s,i);
      button.className='card'+(!open?' covered':'')+(playable?' playable':'')+(hintAction===i&&!preview?' hinted':'');
      button.dataset.card=String(i);button.type='button';button.style.left=(.425+E.POSITIONS[i][0]*10)+'%';button.style.top=(E.POSITIONS[i][1]*21.5)+'%';
      button.disabled=!open||!!preview;
      button.setAttribute('aria-label',open?`${where(i)}，${name(deal.cards[i])}${playable?'，可以出牌':'，目前不能接上'}`:`${where(i)}，蓋牌，必須先移除下方兩張牌`);
      if(open){cardFace(button,deal.cards[i]);const position=document.createElement('span');position.className='place';position.textContent=String(i+1).padStart(2,'0');button.append(position);}
      button.addEventListener('click',()=>play(i));el.append(button);
    }
    if(focused!==undefined&&focused!==null&&!preview){
      const same=el.querySelector(`[data-card="${focused}"]`);
      const next=same&&!same.disabled?same:el.querySelector('.playable:not(:disabled)')||el.querySelector('.card:not(:disabled)')||$('stock');
      if(next&&!next.disabled)next.focus({preventScroll:true});
    }
    const waste=$('waste');waste.className='card waste';waste.replaceChildren();cardFace(waste,s.waste);waste.setAttribute('aria-label',`接牌堆：${name(s.waste)}`);
    $('stockCount').textContent=String(23-s.stockIndex);$('stockText').textContent=s.stockIndex>=23?'已抽完':'抽一張';
    $('stock').disabled=!!preview||!s.remaining||s.stockIndex>=23;$('stock').classList.toggle('hinted',hintAction===-1&&!preview);
    $('stock').setAttribute('aria-label',s.stockIndex<23?`抽一張牌，牌庫剩餘 ${23-s.stockIndex} 張`:'牌庫已用完，不能重洗');
    const rank=E.rank(s.waste),lo=rank===1?13:rank-1,hi=rank===13?1:rank+1;
    $('rankHelp').textContent=`可以接 ${ranks[lo]} 或 ${ranks[hi]}`;
  }
  function render(){
    const s=preview?preview.state:state;
    renderBoard(s);$('dealNumber').textContent='#'+String(deal.id).padStart(3,'0');$('cleared').textContent=String(28-E.count(s.remaining));$('moves').textContent=String(s.moves);$('timer').textContent=clockText(elapsed);
    $('undo').disabled=!!preview||!trace.length;$('undoCount').textContent=trace.length?`(${trace.length})`:'';
    for(const id of ['hint','restart','newDeal','chooseDeal','solutionOpen'])$(id).disabled=!!preview||(id==='hint'&&!state.remaining);
    $('status').textContent=message;
    $('routeState').textContent=preview?'解答示範 · 不覆蓋你的進度':assisted?'輔助遊玩 · 可隨時悔棋':checkpoints.has(E.key(state))?'目前仍在驗證路線':'自由探索中';
    $('completedCount').textContent=Object.keys(book.completed).length+' / 50';$('completedBar').style.width=(Object.keys(book.completed).length*2)+'%';
    $('saveStatus').textContent=storageOK?'進度自動保存在此瀏覽器':'儲存不可用；目前只保留在此分頁';
    $('winBanner').hidden=!!s.remaining;
    if(!s.remaining){
      $('winTitle').textContent=preview?'解答示範完成':'三峰全清，漂亮！';
      $('winDetail').textContent=preview?`28 張牌全數移除，共 ${deal.witness.length} 步`:`${clockText(elapsed)} · ${trace.length} 步 · ${assisted?'輔助通關':'獨立通關'}`;
    }
    $('winNext').hidden=!!preview;
    $('previewBar').hidden=!preview;
    if(preview){$('previewLabel').textContent=`示範 ${preview.index} / ${deal.witness.length} 步`;$('previewToggle').textContent=preview.playing?'暫停':'播放';$('previewToggle').disabled=preview.index>=deal.witness.length;$('previewNext').disabled=preview.index>=deal.witness.length;}
  }
  function recordWin(){
    const existing=book.completed[deal.id],record={seed:deal.seed,actions:trace.slice(),elapsed,assisted};
    if(!existing||(existing.assisted&&!assisted)||(existing.assisted===assisted&&trace.length<existing.actions.length))book.completed[deal.id]=record;
  }
  function play(action){
    if(preview||anyDialog()||!state.remaining)return false;
    tick();
    let next;try{next=E.step(deal,state,action);}catch(_){
      message=action===-1?'牌庫已經用完，可以悔棋或查看解答':'這張牌現在不能接上；請選已翻開且相差 1 的牌';$('status').textContent=message;return false;
    }
    const played=action===-1?next.waste:deal.cards[action];trace.push(action);state=next;hintAction=null;
    message=action===-1?`翻到${name(played)}，找找下一張可接的牌`:`接上${name(played)}，繼續你的路線`;
    if(!state.remaining){recordWin();message='28 張牌全數清空！你的通關紀錄已加入收藏';}
    else if(!E.legal(deal,state).length)message='目前無牌可接、牌庫也已用完。可悔棋，或用提示返回已驗證的節點';
    render();save();return true;
  }
  function undo(){
    if(preview||anyDialog()||!trace.length)return false;tick();trace.pop();state=E.replay(deal,trace);hintAction=null;
    message='已退回一步；可以改走另一條路，悔棋不扣次數';render();save();return true;
  }
  function hint(){
    if(preview||anyDialog()||!state.remaining)return false;tick();
    const point=checkpoints.get(E.key(state));
    if(point!==undefined){
      hintAction=deal.witness[point];assisted=true;
      message=hintAction===-1?'已驗證提示：請抽一張牌庫；接著仍有完整通關路線':`已驗證提示：接上${name(deal.cards[hintAction])}（${where(hintAction)}）；這一步可繼續通關`;
      render();save();return true;
    }
    let s=E.initial(deal),last=0;
    trace.forEach((a,i)=>{s=E.step(deal,s,a);if(checkpoints.has(E.key(s)))last=i+1;});
    const back=trace.length-last;
    confirm('要回到可驗證的路線嗎？',`目前已離開這份通關解答，並不代表現在無解。要給出確定能通關的提示，需要${last?'返回最近的驗證節點':'回到初始牌局'}，退回 ${back} 步。計時保留，你也可以取消並繼續探索。`,`退回 ${back} 步並提示`,()=>{
      tick();trace=trace.slice(0,last);state=E.replay(deal,trace);assisted=true;hintAction=null;render();save();hint();
    });return false;
  }
  function restart(){
    if(preview||anyDialog())return;
    confirm('重新挑戰這副牌？',`第 ${String(deal.id).padStart(3,'0')} 副會回到相同的初始牌面，清除這局的步數、計時與悔棋歷史。已完成的通關收藏會保留。`,'重新開始',()=>{
      trace=[];state=E.initial(deal);elapsed=0;assisted=false;hintAction=null;lastTick=performance.now();message='同一副牌，換一種走法。準備好就開始吧';render();save();
    });
  }
  function nextDeal(){
    if(preview)return;remember();
    let id;
    for(let n=1;n<=D.deals.length;n++){const candidate=(deal.id-1+n)%D.deals.length+1;if(!book.completed[candidate]&&!(book.records[candidate]&&book.records[candidate].actions.length)){id=candidate;break;}}
    if(!id)id=deal.id%D.deals.length+1;choose(id);
  }
  function dealPicker(){
    const grid=$('dealGrid');grid.replaceChildren();
    for(const d of D.deals){
      const b=document.createElement('button');b.textContent=String(d.id).padStart(2,'0');
      const record=book.records[d.id],complete=!!book.completed[d.id];
      b.className=(d.id===deal.id?'current ':'')+(complete?'completed':record&&record.actions.length?'played':'');
      b.setAttribute('aria-label',`第 ${d.id} 副${complete?'，已通關':record&&record.actions.length?'，遊玩中':''}${d.id===deal.id?'，目前牌局':''}`);
      if(d.id===deal.id)b.setAttribute('aria-current','true');
      b.addEventListener('click',()=>{closeDialog('dealDialog');choose(d.id);});grid.append(b);
    }
    openDialog('dealDialog');
  }
  function solution(){
    if(preview)return;tick();assisted=true;render();save();
    $('solutionTitle').textContent=`第 ${String(deal.id).padStart(3,'0')} 副 · 通關解答`;
    $('solutionSummary').textContent=`這是一條已驗證的完整通關路線：移除 28 張、抽牌 ${deal.witness.filter(a=>a===-1).length} 次，共 ${deal.witness.length} 步。它不一定是最少步數解。查看或示範會將本局標記為輔助遊玩。`;
    const list=$('solutionList');list.replaceChildren();let s=E.initial(deal);
    deal.witness.forEach((a,i)=>{
      const li=document.createElement('li'),next=E.step(deal,s,a);
      li.textContent=a===-1?`抽牌 → ${name(next.waste)}（牌庫剩 ${23-next.stockIndex} 張）`:`${where(a)}：${name(deal.cards[a])} → 接在${name(s.waste)}上`;
      if(a===-1)li.classList.add('draw-step');if(checkpoints.get(E.key(state))===i)li.classList.add('at-step');list.append(li);s=next;
    });openDialog('solutionDialog');
  }
  function startPreview(){
    closeDialog('solutionDialog');tick();
    preview={state:E.initial(deal),index:0,playing:true,oldMessage:message,oldHint:hintAction};
    hintAction=null;message='正在示範已驗證的解答；你的牌局進度已保留';render();
    clearInterval(previewInterval);previewInterval=setInterval(()=>{if(preview&&preview.playing&&!document.hidden&&!anyDialog())previewStep();},800);
  }
  function previewStep(){
    if(!preview||preview.index>=deal.witness.length)return false;
    const a=deal.witness[preview.index];preview.state=E.step(deal,preview.state,a);preview.index++;
    message=a===-1?`示範：抽到${name(preview.state.waste)}`:`示範：${where(a)}的${name(deal.cards[a])}接到接牌堆`;
    if(!preview.state.remaining){preview.playing=false;message='完整解答已播放完畢。點「返回我的牌局」接續自己的進度';}
    render();return true;
  }
  function stopPreview(redraw=true){
    if(!preview)return;message=preview.oldMessage;hintAction=preview.oldHint;preview=null;clearInterval(previewInterval);previewInterval=null;lastTick=performance.now();if(redraw)render();
  }
  $('stock').addEventListener('click',()=>play(-1));$('undo').addEventListener('click',undo);$('hint').addEventListener('click',hint);
  $('restart').addEventListener('click',restart);$('newDeal').addEventListener('click',nextDeal);$('winNext').addEventListener('click',nextDeal);
  $('chooseDeal').addEventListener('click',dealPicker);$('helpOpen').addEventListener('click',()=>openDialog('helpDialog'));
  $('solutionOpen').addEventListener('click',solution);$('startPreview').addEventListener('click',startPreview);
  $('previewToggle').addEventListener('click',()=>{if(preview){preview.playing=!preview.playing;render();}});
  $('previewNext').addEventListener('click',()=>{if(preview)preview.playing=false;previewStep();});$('previewExit').addEventListener('click',()=>stopPreview());
  $('largeCards').addEventListener('click',()=>{const on=document.body.classList.toggle('large-mode');$('largeCards').setAttribute('aria-pressed',String(on));$('largeCards').textContent=on?'縮小':'大牌';});
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(b.dataset.close)));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',()=>{lastTick=performance.now();if(d.id==='confirmDialog')confirmAction=null;}));
  $('confirmCancel').addEventListener('click',()=>closeDialog('confirmDialog'));
  $('confirmOK').addEventListener('click',()=>{const fn=confirmAction;confirmAction=null;closeDialog('confirmDialog');if(fn)fn();});
  document.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||anyDialog())return;
    const tag=event.target&&event.target.tagName;if(['INPUT','SELECT','TEXTAREA'].includes(tag))return;
    const key=event.key.toLowerCase();if(['d','u','h'].includes(key)){event.preventDefault();if(key==='d')play(-1);if(key==='u')undo();if(key==='h')hint();return;}
    if(!event.key.startsWith('Arrow')||!event.target||event.target.dataset.card===undefined||preview)return;
    const cards=[...$('tableau').querySelectorAll('.card:not(:disabled)')].sort((a,b)=>{const pa=E.POSITIONS[Number(a.dataset.card)],pb=E.POSITIONS[Number(b.dataset.card)];return pa[1]-pb[1]||pa[0]-pb[0];});
    const at=cards.indexOf(event.target);if(at<0||!cards.length)return;event.preventDefault();const direction=['ArrowLeft','ArrowUp'].includes(event.key)?-1:1;cards[(at+direction+cards.length)%cards.length].focus();
  });
  document.addEventListener('visibilitychange',()=>{tick();save();lastTick=performance.now();});
  window.addEventListener('pagehide',()=>{tick();save();});
  setInterval(()=>{tick();if(performance.now()-lastSave>15000)save();},1000);
  const query=Number(new URLSearchParams(location.search).get('deal'));choose(Number.isInteger(query)&&query>=1&&query<=50?query:book.active);
  if(recovered){message='已略過損壞或不相容的存檔；有效牌局仍已保留，可以安全繼續';$('status').textContent=message;}
  // Read-only QA visibility plus the same public controls; no alternative rules.
  window.TriPeaksApp=Object.freeze({snapshot:()=>({deal:deal.id,state:{...state},trace:trace.slice(),elapsed,assisted,preview:preview?{index:preview.index,state:{...preview.state}}:null,storageOK}),play,undo,hint,choose,solution,startPreview,previewStep,stopPreview});
})();
