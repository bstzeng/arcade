(function(){
'use strict';
const E=window.BanqiEngine,S=window.BanqiSession,A=window.BanqiAI;
const $=id=>document.getElementById(id),board=$('board');
const names=[['兵','砲','傌','俥','相','仕','帥'],['卒','炮','馬','車','象','士','將']];
const coords=i=>'ABCDEFGH'[i%8]+(Math.floor(i/8)+1);
let selected=null,focusIndex=0,showLegal=true,pending=null,lastSnapshot=null;
let storage;try{storage=window.localStorage;}catch(e){}
const controller=S.create({storage,workerFactory:()=>new Worker('./banqi/worker.js?v=1'),fallback:(s,l,seed)=>A.choose(s,l,seed),onChange:render});
function playerName(seat,s){return s.settings.mode==='local'?'玩家 '+(seat+1):seat===s.settings.human?'你':'電腦';}
function colorName(color){return color===0?'紅方':color===1?'黑方':'棋色待定';}
function syncSettings(s){$('mode').value=s.settings.mode;$('difficulty').value=s.settings.level;$('side').value=String(s.settings.human);$('difficulty').disabled=s.settings.mode==='local';$('side').disabled=s.settings.mode==='local';}
function outcome(result,s){return result.winner===null?'握手言和':playerName(result.winner,s)+'獲勝';}
function reason(result){const reasons={'all-pieces-captured':'對方棋子已全部被吃光','no-legal-actions':'對方已無合法行動','threefold-repetition':'相同局面出現三次',elimination:'對方棋子已全部被吃光',no_moves:'對方已無合法行動',noMoves:'對方已無合法行動',immobilized:'對方已無合法行動',repetition:'相同局面出現三次',no_progress:'連續八十手沒有翻棋或吃子',noProgress:'連續八十手沒有翻棋或吃子',"no-progress":'連續八十手沒有翻棋或吃子'};return reasons[result.reason]||(result.winner===null?'已達和局條件':'棋局結束');}
function labelAt(i,state){const p=state.board[i],position=coords(i);if(!p)return position+' 空格';if(!p.up)return position+' 覆棋，點選翻開';return position+' '+colorName(p.color)+' '+names[p.color][p.rank];}
function render(s){
 lastSnapshot=s;const state=s.state,publicState=E.publicView(state),legal=E.legalMoves(state),last=s.actions[s.actions.length-1];
 if(selected!==null&&(!state.board[selected]||!state.board[selected].up||state.board[selected].color!==state.colors[state.turn]||s.busy||state.result))selected=null;
 const targets=new Set(selected===null?[]:legal.filter(a=>a.type==='move'&&a.from===selected).map(a=>a.to));
 const hadFocus=board.contains(document.activeElement);board.replaceChildren();
 for(let i=0;i<32;i++){const p=publicState.board[i],button=document.createElement('button');button.type='button';button.className='cell'+(selected===i?' selected':'')+(showLegal&&targets.has(i)?' target':'')+(last&&(last.to===i||last.from===i)?' last':'');button.dataset.index=String(i);button.tabIndex=i===focusIndex?0:-1;button.setAttribute('aria-label',labelAt(i,publicState));button.setAttribute('aria-pressed',String(selected===i));if(s.busy||state.result)button.setAttribute('aria-disabled','true');if(p){const piece=document.createElement('span');piece.className='piece '+(!p.up?'covered':p.color===0?'red':'black');piece.setAttribute('aria-hidden','true');if(p.up)piece.textContent=names[p.color][p.rank];button.appendChild(piece);}button.addEventListener('click',()=>activate(i));button.addEventListener('keydown',event=>onKey(event,i));button.addEventListener('focus',()=>{focusIndex=i;for(const b of board.children)b.tabIndex=b===button?0:-1;});board.appendChild(button);}
 if(hadFocus&&board.children[focusIndex])board.children[focusIndex].focus();
 syncSettings(s);$('remaining').textContent=publicState.board.filter(p=>p&&!p.up).length+' 枚未翻';
 for(let seat=0;seat<2;seat++){const color=state.colors[seat];$('player'+seat).textContent=playerName(seat,s)+' · '+(seat===0?'先手':'後手');$('color'+seat).textContent=colorName(color);$('mark'+seat).textContent=color===null?'？':color===0?'紅':'黑';$('mark'+seat).className='seat-mark'+(color===0?' red':'');$('seat'+seat).classList.toggle('active',!state.result&&state.turn===seat);$('count'+seat).textContent=color===null?'—':String(16-(state.captured||[]).filter(p=>p.color===color).length);}
 $('phase').textContent=state.result?'這一局，已經有了答案':state.colors[0]===null?'第一手翻棋，決定雙方棋色':colorName(state.colors[state.turn])+'行動 · 翻棋或走棋';
 $('turnTitle').textContent=state.result?outcome(state.result,s):s.busy?'電腦思考中…':'輪到'+playerName(state.turn,s);
 $('turnDescription').textContent=state.result?reason(state.result):s.busy?'只依公開棋面與剩餘棋種推演。':selected!==null?'點選亮點走棋或吃子；也可以直接翻棋。':'點選覆棋翻開，或選自己的明棋移動。';
 $('moveCount').textContent=state.result?state.ply+' 手結束':'第 '+(state.ply+1)+' 手';
 $('lastMove').textContent=!last?'尚未翻棋':last.type==='flip'?'翻開 '+coords(last.to):coords(last.from)+' → '+coords(last.to);
 $('undo').disabled=!s.canUndo;$('legalToggle').textContent='◎ 落點提示：'+(showLegal?'開':'關');$('legalToggle').setAttribute('aria-pressed',String(showLegal));
 const banner=$('resultBanner');banner.hidden=!state.result;banner.replaceChildren();if(state.result){banner.appendChild(document.createTextNode(outcome(state.result,s)));const small=document.createElement('small');small.textContent=reason(state.result);banner.appendChild(small);}
 $('status').textContent=s.notice||(state.result?'可以撤銷回看，或開啟下一局。':selected!==null?targets.size?'可選 '+targets.size+' 個走棋／吃子位置。':'這枚棋子暫時無路可走，請另選棋子或翻棋。':'');
 const difficulty={easy:'簡單',normal:'普通',hard:'困難'};
 $('aiDetail').textContent=s.settings.mode==='local'?'同一台裝置，輪流操作。':s.busy?difficulty[s.settings.level]+' · 有限額度搜尋':s.stats&&s.stats.fallback?'備援走法 · 未讀取任何覆棋內容':difficulty[s.settings.level]+'電腦 · 公開資訊抽樣';
}
function activate(i){focusIndex=i;const s=controller.get(),state=s.state;if(s.busy||state.result)return;const p=state.board[i];if(p&&!p.up){selected=null;controller.act({type:'flip',to:i});return;}if(selected!==null){const move={type:'move',from:selected,to:i};if(E.legalMoves(state).some(a=>a.type==='move'&&a.from===selected&&a.to===i)){selected=null;controller.act(move);return;}}
 selected=p&&p.up&&p.color===state.colors[state.turn]?(selected===i?null:i):null;render(controller.get());}
function onKey(event,i){let next=i;const x=i%8,y=Math.floor(i/8);if(event.key==='ArrowLeft')next=y*8+Math.max(0,x-1);else if(event.key==='ArrowRight')next=y*8+Math.min(7,x+1);else if(event.key==='ArrowUp')next=Math.max(0,y-1)*8+x;else if(event.key==='ArrowDown')next=Math.min(3,y+1)*8+x;else if(event.key==='Enter'||event.key===' '){event.preventDefault();activate(i);return;}else if(event.key==='Escape'){event.preventDefault();selected=null;render(controller.get());return;}else return;event.preventDefault();focusIndex=next;board.children[next].focus();}
function requestReset(next){pending=next;syncSettings(controller.get());$('confirmText').textContent='目前棋局將被新的隨機棋局取代，撤銷紀錄也會清除。是否繼續？';$('confirmDialog').showModal();}
$('mode').addEventListener('change',()=>requestReset({...controller.get().settings,mode:$('mode').value}));
$('difficulty').addEventListener('change',()=>requestReset({...controller.get().settings,level:$('difficulty').value}));
$('side').addEventListener('change',()=>requestReset({...controller.get().settings,human:Number($('side').value)}));
$('restart').addEventListener('click',()=>requestReset(controller.get().settings));
$('cancelConfirm').addEventListener('click',()=>{pending=null;$('confirmDialog').close();syncSettings(controller.get());});
$('confirmDialog').addEventListener('cancel',()=>{pending=null;syncSettings(controller.get());});
$('acceptConfirm').addEventListener('click',()=>{if(!pending)return;const config=pending;pending=null;$('confirmDialog').close();selected=null;controller.reset(config);});
$('help').addEventListener('click',()=>$('helpDialog').showModal());$('closeHelp').addEventListener('click',()=>$('helpDialog').close());
$('undo').addEventListener('click',()=>{selected=null;controller.undo();});
$('legalToggle').addEventListener('click',()=>{showLegal=!showLegal;render(controller.get());});
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'&&!$('helpDialog').open&&!$('confirmDialog').open){event.preventDefault();selected=null;controller.undo();}});
window.addEventListener('pagehide',()=>controller.destroy());
window.addEventListener('pageshow',event=>{if(event.persisted)controller.start();});
controller.load();controller.start();
})();
