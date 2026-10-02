/* Shared controller copied into each standalone game's own directory. */
(function(){'use strict';const G=window.GameUI,E=G.engine,$=id=>document.getElementById(id),S=new BoardSession.Session(E,G.id),key='arcade.board.'+G.id+'.v1';let reviewing=false,viewIndex=0,pending=null,notice='',storageOK=true,aiError=false;
const name=p=>p===0?'玩家一':'玩家二';
function save(){try{localStorage.setItem(key,S.serialize());$('saved').textContent='已自動儲存 · 悔棋會回到上一個人類回合';}catch(e){storageOK=false;$('saved').textContent='無法存取本機儲存；可用「匯出棋譜」保存';}}
function sync(){for(const id of ['mode','level','human'])$(id).value=String(S.options[id]);$('level').disabled=S.options.mode==='local';$('human').disabled=S.options.mode==='local';}
function current(){return reviewing?BoardSession.replay(E,S.actions.slice(0,viewIndex)):S.state;}
function draw(){const s=current(),interactive=!reviewing&&!$('dialog').open&&S.isHuman()&&!S.isOver()&&!S.busy;$('phase').textContent=reviewing?'棋譜回放':s.winner!==null?'對局結束':s.draw?'和局':S.busy?'電腦思考中…':G.phase(s);$('counter').textContent='第 '+(s.ply+1)+' 手';$('players').innerHTML=[0,1].map(p=>'<span class="player '+(s.turn===p&&s.winner===null?'active':'')+'"><i class="dot '+(p===1?'two':'')+'"></i>'+name(p)+(S.options.mode==='ai'?(S.options.human===p?' · 你':' · AI'):'')+G.playerInfo(s,p)+'</span>').join('');G.render(s,{interactive,play,draw,reviewing});$('undo').disabled=S.undoIndex()<0;$('replay').disabled=!S.actions.length||reviewing;$('export').disabled=!S.actions.length;$('status').textContent=notice||G.message(s,{name,busy:S.busy,reviewing});$('retry').hidden=!aiError||reviewing;$('replayBar').hidden=!reviewing;$('replayRange').max=S.actions.length;$('replayRange').value=viewIndex;$('replayLabel').textContent=viewIndex+' / '+S.actions.length;}
function runAI(){if(reviewing||$('dialog').open||S.isOver()||S.isHuman()||S.busy)return;aiError=false;S.request(Worker,G.id+'/worker.js',result=>{if(result.error){aiError=true;notice=result.error;draw();return;}notice='';G.clear();save();draw();setTimeout(runAI,100);});draw();}
function play(a){if(reviewing||$('dialog').open||!S.isHuman()||S.busy||S.isOver())return false;if(!S.play(a)){notice='這一步不符合規則';draw();return false;}notice='';aiError=false;G.clear();save();draw();setTimeout(runAI,80);return true;}
function open(title,body,commit,label='確認'){S.cancel();pending=commit;$('dialogTitle').textContent=title;$('dialogBody').innerHTML=body;$('confirm').textContent=label;$('cancel').hidden=!commit;$('dialog').showModal();draw();}
function close(yes){const fn=pending;pending=null;$('dialog').close();if(yes&&fn)fn();sync();draw();runAI();}
$('cancel').onclick=()=>close(false);$('confirm').onclick=()=>close(true);$('dialog').addEventListener('cancel',event=>{event.preventDefault();close(false);});
function reset(opts){reviewing=false;notice='';aiError=false;G.clear();S.reset(opts);sync();save();}
$('reset').onclick=()=>open('重新開始這場對局？','<p>目前棋局與回放會被清空。新局沿用目前模式、座位與難度。</p>',()=>reset(S.options),'重新開始');
for(const id of ['mode','level','human'])$(id).onchange=()=>{const opts={mode:$('mode').value,level:$('level').value,human:Number($('human').value)};if(S.actions.length)open('用新設定開始對局？','<p>變更模式、座位或難度會重新開局。目前棋譜將清空，取消即可保留。</p>',()=>reset(opts),'開始新局');else{reset(opts);draw();runAI();}};
$('undo').onclick=()=>{if(S.undo()){reviewing=false;notice='已回到上一個人類回合';aiError=false;G.clear();save();draw();runAI();}};
$('rules').onclick=()=>open('完整規則',G.rules,null,'知道了');
$('retry').onclick=()=>{notice='';aiError=false;runAI();};
$('replay').onclick=()=>{S.cancel();reviewing=true;viewIndex=0;notice='';G.clear();draw();};$('replayRange').oninput=()=>{viewIndex=Number($('replayRange').value);draw();};$('leaveReplay').onclick=()=>{reviewing=false;notice='';draw();runAI();};
$('export').onclick=()=>{const blob=new Blob([S.serialize()],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=G.id+'-game.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice='棋譜已匯出，可在同一遊戲匯入接續';draw();};
$('import').onclick=()=>$('file').click();$('file').onchange=async event=>{const f=event.target.files[0];event.target.value='';if(!f)return;if(f.size>500000){notice='檔案過大，請使用此遊戲匯出的棋譜';draw();return;}try{const raw=await f.text();BoardSession.read(E,G.id,raw);open('匯入這份棋譜？','<p>已逐步驗證全部動作合法。匯入後將取代目前棋局及對局設定。</p>',()=>{S.load(raw);reviewing=false;notice='已載入合法棋譜';aiError=false;G.clear();sync();save();},'載入棋譜');}catch(e){notice='無法匯入：'+e.message;draw();}};
try{const raw=localStorage.getItem(key);if(raw){S.load(raw);notice='已接續上次的對局';}}catch(e){notice='存檔無效，已安全開新局';}
G.init({play,draw,getState:current,canPlay:()=>!reviewing&&!$('dialog').open&&S.isHuman()&&!S.isOver()&&!S.busy});sync();draw();setTimeout(runAI,150);
window.addEventListener('pagehide',()=>S.cancel());window.addEventListener('pageshow',event=>{if(event.persisted)runAI();});
// Public, read-only diagnostic snapshot used by browser QA; mutations still go through buttons.
window.arcadeSnapshot=()=>({game:G.id,state:JSON.parse(JSON.stringify(S.state)),options:{...S.options},actions:S.actions.length,busy:S.busy,reviewing,generation:S.generation});
})();
