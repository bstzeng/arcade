/* Independent verifier: no import of engine, UI or generator. Rays + integer state BFS. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const levels=JSON.parse(fs.readFileSync(path.join(__dirname,'levels.json'),'utf8'));
const transforms=n=>Array.from({length:8},(_,v)=>p=>{let a=p%n,b=Math.floor(p/n);if(v&4)a=n-1-a;for(let r=0;r<(v&3);r++){let old=a;a=n-1-b;b=old;}return b*n+a;});
const topo=l=>transforms(l.size).map(f=>l.walls.map(f).sort((a,b)=>a-b).join(',')).sort()[0];
const canonical=l=>transforms(l.size).map(f=>[l.size,l.walls.map(f).sort((a,b)=>a-b).join(','),f(l.goal),f(l.start[l.target]),l.start.filter((_,i)=>i!==l.target).map(f).sort((a,b)=>a-b).join(',')].join('|')).sort()[0];
function inspect(l){
 const n=l.size,N=n*n,blocked=new Set(l.walls),rays=Array.from({length:N},()=>Array(4));
 assert.equal(blocked.size,l.walls.length);assert(l.walls.every(p=>p>=0&&p<N));assert.equal(new Set(l.start).size,3);assert(l.start.every(p=>p>=0&&p<N&&!blocked.has(p)));assert(!blocked.has(l.goal));assert(l.target>=0&&l.target<3);
 for(let p=0;p<N;p++)for(let d=0;d<4;d++){const a=[];let x=p%n,y=Math.floor(p/n);while(true){if(d===0)y--;if(d===1)x++;if(d===2)y++;if(d===3)x--;const q=y*n+x;if(x<0||x>=n||y<0||y>=n||blocked.has(q))break;a.push(q);}rays[p][d]=a;}
 const step=(s,r,d)=>{let to=s[r];for(const q of rays[s[r]][d]){if(s[(r+1)%3]===q||s[(r+2)%3]===q)break;to=q;}if(to===s[r])return null;const t=s.slice();t[r]=to;return t;};
 let state=l.start.slice(),helpers=0,collisions=0;assert.notEqual(state[l.target],l.goal);
 for(const [r,d]of l.solution){assert(Number.isInteger(r)&&r>=0&&r<3);assert(Number.isInteger(d)&&d>=0&&d<4);assert.notEqual(state[l.target],l.goal,'Witness must stop immediately on success');const before=state;state=step(state,r,d);assert(state,'Witness contains no-op');if(r!==l.target)helpers++;const ray=rays[before[r]][d],i=ray.indexOf(state[r]);if(i+1<ray.length&&state.some((q,j)=>j!==r&&q===ray[i+1]))collisions++;}
 assert.equal(state[l.target],l.goal);assert(helpers>0);assert(collisions>0);assert.equal(l.solution.at(-1)[0],l.target);
 // Every target is interior with four open neighbors: arrival MUST use another robot as a stopper.
 assert(l.goal%n>0&&l.goal%n<n-1&&Math.floor(l.goal/n)>0&&Math.floor(l.goal/n)<n-1);assert([l.goal-n,l.goal+1,l.goal+n,l.goal-1].every(p=>!blocked.has(p)));
 // Independently prove moving only the target with fixed helpers is insufficient.
 const solo=[l.start],soloSeen=new Set([l.start[l.target]]);for(const s of solo){assert.notEqual(s[l.target],l.goal,'Target-only solution exists');for(let d=0;d<4;d++){const t=step(s,l.target,d);if(t&&!soloSeen.has(t[l.target])){soloSeen.add(t[l.target]);solo.push(t);}}}
 // Independent breadth-first shortest-distance proof using level queues and integer encoding.
 const pack=s=>(s[0]*N+s[1])*N+s[2],unpack=k=>[Math.floor(k/(N*N)),Math.floor(k/N)%N,k%N];
 const seen=new Uint8Array(N*N*N),q=new Int32Array(N*N*N);q[0]=pack(l.start);seen[q[0]]=1;let end=1,head=0,depth=0,min=null;
 while(head<end&&min===null){const until=end;while(head<until&&min===null){const s=unpack(q[head++]);if(s[l.target]===l.goal){min=depth;break;}for(let r=0;r<3;r++)for(let d=0;d<4;d++){const t=step(s,r,d);if(t){const k=pack(t);if(!seen[k]){seen[k]=1;q[end++]=k;}}}}depth++;}
 assert.equal(min,l.solution.length);assert.equal(min,l.proof.distance);assert.equal(canonical(l),l.canonical);
 return {id:l.id,size:n,shortestDistance:min,helperMoves:helpers,robotStops:collisions,independentVisited:end};
}
assert.equal(levels.length,50);assert.equal(new Set(levels.map(l=>l.size+':'+topo(l))).size,50,'All 50 topologies are non-equivalent under D4');assert.equal(new Set(levels.map(canonical)).size,50,'No color/symmetry duplicates');
let previous=0;const report=[];for(const l of levels){assert.equal(l.id,report.length+1);assert(l.proof.distance>=previous,'Progression is nondecreasing');previous=l.proof.distance;report.push(inspect(l));console.log(`Verified ${l.id}/50: ${report.at(-1).shortestDistance} slides, ${report.at(-1).helperMoves} helper moves`);}
const result={schema:1,levelFileSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'levels.json'))).digest('hex'),total:50,independent:true,checks:['legal witness replay','50 D4-distinct board topologies','color-permutation-aware puzzle uniqueness','target-only unreachability','target requires robot stopper','independent shortest-distance BFS','monotone distance progression'],levels:report};
fs.writeFileSync(path.join(__dirname,'proof-report.json'),JSON.stringify(result,null,2)+'\n');console.log('PASS: all 50 levels independently certified');
