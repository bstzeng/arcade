/* Rank 1 is the smallest disc. State[rank-1] is its peg (0=A,1=B,2=C).
   Every such array denotes a legal stack ordering, with small discs on top. */
(function(root,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else root.HanoiEngine=api;})(globalThis,function(){
'use strict';
const cache=new Map(),key=s=>s.join(','),equal=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&key(a)===key(b);
function validState(n,s){return Number.isInteger(n)&&n>=3&&n<=8&&Array.isArray(s)&&s.length===n&&s.every(p=>Number.isInteger(p)&&p>=0&&p<3);}
function validate(l){return !!l&&validState(l.discs,l.start)&&Number.isInteger(l.target)&&l.target>=0&&l.target<3&&Array.isArray(l.solution);}
function initial(l){if(!validate(l))throw Error('關卡資料錯誤');return l.start.slice();}
function tops(s){const t=[null,null,null];for(let i=0;i<s.length;i++)if(t[s[i]]===null)t[s[i]]=i+1;return t;}
function moves(l,s){if(!validState(l.discs,s))return [];const t=tops(s),out=[];for(let from=0;from<3;from++)if(t[from]!==null)for(let to=0;to<3;to++)if(from!==to&&(t[to]===null||t[from]<t[to]))out.push({disc:t[from],from,to});return out;}
function legal(l,s,a){if(!a||![a.disc,a.from,a.to].every(Number.isInteger))return false;return moves(l,s).some(m=>m.disc===a.disc&&m.from===a.from&&m.to===a.to);}
function step(l,s,a){if(!legal(l,s,a))throw Error('一次只能移動頂端圓盤，且小盤須在大盤上');const out=s.slice();out[a.disc-1]=a.to;return out;}
function won(l,s){return validState(l.discs,s)&&s.every(p=>p===l.target);}
function replay(l,actions){if(!Array.isArray(actions)||actions.length>20000)throw Error('走法記錄格式錯誤');const states=[initial(l)];for(const a of actions)states.push(step(l,states.at(-1),a));return states;}
function proof(l){const states=replay(l,l.solution);if(!won(l,states.at(-1)))throw Error('解答未將所有盤子移到目標柱');return states;}
function encode(s){return s.reduce((v,p,i)=>v+p*3**i,0);}
function decode(code,n){return Array.from({length:n},()=>{const p=code%3;code=Math.floor(code/3);return p;});}
/* Complete reverse BFS of all 3^n states: exact minimum for every legal layout. */
function distances(n,target){const k=n+':'+target;if(cache.has(k))return cache.get(k);const dist=new Int16Array(3**n);dist.fill(-1);const goal=encode(Array(n).fill(target)),queue=new Uint16Array(3**n);let front=0,back=1;queue[0]=goal;dist[goal]=0;const l={discs:n};while(front<back){const code=queue[front++],s=decode(code,n);for(const a of moves(l,s)){const next=code+(a.to-a.from)*3**(a.disc-1);if(dist[next]===-1){dist[next]=dist[code]+1;queue[back++]=next;}}}if(back!==3**n)throw Error('狀態圖不完整');cache.set(k,dist);return dist;}
function solve(l,start){if(!validState(l.discs,start))throw Error('盤面資料錯誤');const d=distances(l.discs,l.target),path=[];let s=start.slice();while(!won(l,s)){const current=d[encode(s)],a=moves(l,s).find(a=>d[encode(s)+(a.to-a.from)*3**(a.disc-1)]===current-1);if(!a)throw Error('找不到下一步');path.push(a);s=step(l,s,a);}return path;}
function route(l,actions){const s=replay(l,actions).at(-1);return {moves:solve(l,s),kind:'shortest'};}
/* First-occurrence canonical labels reject layouts differing ONLY by peg names,
   even when the target differs. Disc ranks are never renamed. */
function canonical(s){const map=new Map();return s.map(p=>{if(!map.has(p))map.set(p,map.size);return map.get(p);}).join('');}
return {key,equal,validState,validate,initial,tops,moves,legal,step,won,replay,proof,encode,decode,distances,solve,route,canonical};
});
