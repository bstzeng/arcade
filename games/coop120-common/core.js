(function(root){
'use strict';
const copy=x=>JSON.parse(JSON.stringify(x));
const DIRS=[{name:'向上',dx:0,dy:-1,key:'U'},{name:'向右',dx:1,dy:0,key:'R'},{name:'向下',dx:0,dy:1,key:'D'},{name:'向左',dx:-1,dy:0,key:'L'}];
const mod=(a,n)=>(a%n+n)%n, key=(x,y)=>`${x},${y}`;
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function path(w,h,start,goal,blocked=[]){const ban=new Set(blocked),q=[start],prev=new Map([[key(...start),null]]);for(let n=0;n<q.length;n++){const p=q[n];if(p[0]===goal[0]&&p[1]===goal[1]){const out=[];let k=key(...p);while(prev.get(k)){const v=prev.get(k);out.unshift(v.d);k=v.k;}return out;}for(const d of DIRS){const x=p[0]+d.dx,y=p[1]+d.dy,k=key(x,y);if(x<0||x>=w||y<0||y>=h||ban.has(k)||prev.has(k))continue;prev.set(k,{k:key(...p),d:d.key});q.push([x,y]);}}return null;}
const act=(type,label,data={})=>({type,label,...data});
function svg(body,w=560,h=320){return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="依目前角色顯示的遊戲場景"><defs><linearGradient id="sky" x2="1" y2="1"><stop stop-color="#15394b"/><stop offset="1" stop-color="#25253f"/></linearGradient></defs><rect width="${w}" height="${h}" rx="22" fill="url(#sky)"/>${body}</svg>`;}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const txt=(x,y,t,size=17,color='#e8f4fa')=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" font-family="system-ui,sans-serif" font-size="${size}">${esc(t)}</text>`;
function grid(w,h,cells,extra=''){const k=Math.min(440/w,255/h),ox=(560-w*k)/2,oy=25;let b='';for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=cells(x,y)||{},cx=ox+x*k,cy=oy+y*k;b+=`<rect x="${cx+2}" y="${cy+2}" width="${k-4}" height="${k-4}" rx="6" fill="${c.color||'#214557'}"/>`+(c.label?txt(cx+k/2,cy+k*.65,c.label,Math.min(22,k*.45)): '');}return svg(b+extra);}
const common={copy,DIRS,mod,key,rng,shuffle,path,act,svg,txt,esc,grid};
const models={};
function register(id,m){models[id]=m;}
function create(id,level){const m=models[id];if(!m)throw Error('unknown game');return{game:id,level:copy(level),...m.init(copy(level)),won:false,lost:false,turns:0,log:[]};}
function observe(s,role){if(role!==0&&role!==1)throw Error('invalid role');const o=models[s.game].observe(s,role);return copy({game:s.game,role,won:s.won,lost:s.lost,...o});}
function controls(s,role){if(s.won||s.lost)return[];return models[s.game].actions(observe(s,role));}
function legal(s,role){return controls(s,role).filter(a=>{try{return !!models[s.game].step(copy(s),role,copy(a))?.ok;}catch{return false;}});}
function step(s,role,a){if(s.won||s.lost||![0,1].includes(role)||!a||typeof a.type!=='string')return {ok:false,reason:'目前不能執行'};const m=models[s.game];const before=copy({...s,log:[]});before.log=s.log.slice();let result;try{result=m.step(s,role,copy(a));}catch{result={ok:false,reason:'操作資料不完整或不合法'};}if(!result||!result.ok){for(const k of Object.keys(s))delete s[k];Object.assign(s,before);return result||{ok:false,reason:'這個角色無法執行這項操作'};}s.turns++;s.log.push({role,action:copy(a)});return result;}
function ai(s,role){return s.won||s.lost?null:models[s.game].ai(observe(s,role));}
function transitionFromObservation(o){return models[o.game].ai(copy(o));}
function solve(s,limit=3000,reverse=false){const witness=[];for(let i=0;i<limit&&!s.won&&!s.lost;i++){let done=false;for(const role of (reverse?[1,0]:[0,1])){const a=ai(s,role);if(a){const r=step(s,role,a);if(!r.ok)throw Error(`${s.game} AI invalid ${JSON.stringify(a)} ${r.reason}`);witness.push({role,action:a});done=true;if(s.won||s.lost)break;}}if(!done)throw Error(`${s.game} stalled: ${JSON.stringify(s)}`);}if(!s.won)throw Error(`${s.game} did not solve: ${JSON.stringify(s)}`);return witness;}
function parseSave(raw){try{const p=JSON.parse(raw);if(!p||p.version!==1||typeof p.completed!=='object'||Array.isArray(p.completed))return {version:1,completed:{}};const completed={};for(const [k,v]of Object.entries(p.completed))if(/^\d+$/.test(k)&&+k>=1&&+k<=100&&Array.isArray(v))completed[k]=v.filter(x=>['manual','assisted','demo'].includes(x));return{version:1,completed};}catch{return{version:1,completed:{}};}}
function record(progress,n,kind){const p=copy(progress);p.completed[n]=Array.from(new Set([...(p.completed[n]||[]),kind]));return p;}
root.CoopCore={...common,models,register,create,observe,controls,legal,step,ai,transitionFromObservation,solve,parseSave,record};if(typeof module!=='undefined')module.exports=root.CoopCore;
})(typeof globalThis!=='undefined'?globalThis:this);
