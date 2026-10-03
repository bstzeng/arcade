(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else root.Social120=f();})(globalThis,function(){'use strict';
const games={},clone=x=>JSON.parse(JSON.stringify(x)),names=['你／青禾','星野','阿洛','墨雨','小葵','遠山'];
const range=n=>Array.from({length:n},(_,i)=>i),rng=seed=>{let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};},pick=(a,r)=>a[Math.floor(r()*a.length)],shuffle=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},sum=a=>a.reduce((x,y)=>x+y,0),action=(type,label,extra={})=>({type,label,...extra}),key=a=>JSON.stringify(Object.fromEntries(Object.entries(a).filter(([k])=>k!=='label').sort(([a],[b])=>a.localeCompare(b))));
function log(s,t){s.history.push(t);if(s.history.length>100)s.history.shift();}
function finish(s,won,text,winners=[0]){s.done=true;s.turn=0;s.won=!!won;s.winners=won?winners:[];s.result=text;log(s,text);}
function register(id,d){games[id]=d;return d;}
function create(id,seed=1,mode='challenge',difficulty='normal'){const d=games[id];if(!d)throw Error('Unknown game '+id);const s={game:id,seed,mode,difficulty,round:1,phase:'start',turn:0,steps:0,done:false,won:false,history:[],public:{},secret:{},players:5};d.init(s,rng(seed));return s;}
function view(s,actor=s.turn){const d=games[s.game];return {game:s.game,seed:s.seed,mode:s.mode,difficulty:s.difficulty,round:s.round,phase:s.phase,actor,turn:s.turn,players:s.players,steps:s.steps,done:s.done,won:s.won,result:s.result||'',public:clone(s.public),history:s.history.slice(),private:clone(d.private(s,actor)),...(s.done?{reveal:clone(d.reveal?d.reveal(s):s.secret.roles||[])}:{})};}
function actions(v){return v.done?[]:games[v.game].actions(v);}
function step(s,a){if(s.done)throw Error('對局已結束');const v=view(s),d=games[s.game],ok=d.validate&&d.validate(v,a)||actions(v).some(b=>key(a)===key(b));if(!ok)throw Error('非法動作 '+JSON.stringify(a));s=clone(s);d.apply(s,a);s.steps++;if(s.steps>1200&&!s.done)finish(s,false,'回合安全上限已到，請重新開局。');return s;}
function bot(v){const d=games[v.game],a=d.bot(v);if(!a||!(d.validate&&d.validate(v,a))&&!actions(v).some(b=>key(a)===key(b)))throw Error('Bot returned illegal action '+v.game+' '+JSON.stringify(a));return a;}
function solve(s){const d=games[s.game],v=view(s);return s.turn===0&&d.solve?d.solve(s,v):bot(v);}
function run(s,limit=1000){const witness=[];while(!s.done&&witness.length<limit){const a=solve(s);witness.push({actor:s.turn,action:a});s=step(s,a);}return {state:s,witness};}
function scoreTargets(v,base=0){const x=range(v.players).map(()=>base);for(const q of v.public.claims||[])if(q.kind==='accuse')x[q.target]+=q.actor===0?3:1;else if(q.kind==='clear')x[q.target]-=2;return x;}
function choose(v,type,test=()=>true){return actions(v).find(a=>a.type===type&&test(a));}
function best(arr,fn){return arr.reduce((b,a)=>b===null||fn(a)>fn(b)?a:b,null);}
function next(s,n=s.players){s.turn=(s.turn+1)%n;return s.turn===0;}
return {games,register,create,view,actions,step,bot,solve,run,clone,range,rng,pick,shuffle,sum,action,key,log,finish,names,scoreTargets,choose,best,next};
});
