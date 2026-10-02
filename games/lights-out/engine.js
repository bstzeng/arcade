/* Lights Out over GF(2). Same pure transition function powers UI and proof replay. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LightsEngine=api;})(globalThis,function(){
'use strict';
function validate(l){return !!l&&Number.isInteger(l.size)&&l.size>=3&&l.size<=6&&Array.isArray(l.lights)&&l.lights.length===l.size*l.size&&l.lights.every(x=>x===0||x===1);}
function initial(l){if(!validate(l))throw Error('關卡資料錯誤');return l.lights.slice();}
function affected(n,i){if(!Number.isInteger(i)||i<0||i>=n*n)return [];const out=[i],r=Math.floor(i/n),c=i%n;if(r>0)out.push(i-n);if(r<n-1)out.push(i+n);if(c>0)out.push(i-1);if(c<n-1)out.push(i+1);return out;}
function legal(l,s,i){return Number.isInteger(i)&&i>=0&&i<l.size*l.size&&Array.isArray(s)&&s.length===l.size*l.size;}
function step(l,s,i){if(!legal(l,s,i))throw Error('不合法的格子');const out=s.slice();for(const j of affected(l.size,i))out[j]^=1;return out;}
const won=s=>s.every(x=>x===0);
const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
function replay(l,actions){if(!Array.isArray(actions))throw Error('存檔格式錯誤');const states=[initial(l)];for(const i of actions)states.push(step(l,states.at(-1),i));return states;}
function proof(l){const s=replay(l,l.solution);if(!won(s.at(-1)))throw Error('解答未完成');return s;}
/* Reduced-row echelon solve + every nullspace combination: minimum-weight solution.
   Board sizes 3..6 have at most four free variables, so exhaustive enumeration is tiny. */
function solve(l,s){const n=l.size*l.size;let rows=Array.from({length:n},(_,r)=>{const a=new Uint8Array(n+1);a[n]=s[r];for(let c=0;c<n;c++)if(affected(l.size,c).includes(r))a[c]=1;return a;});const pivots=[];let p=0;for(let c=0;c<n;c++){let r=p;while(r<n&&!rows[r][c])r++;if(r===n)continue;[rows[p],rows[r]]=[rows[r],rows[p]];for(let j=0;j<n;j++)if(j!==p&&rows[j][c])for(let k=c;k<=n;k++)rows[j][k]^=rows[p][k];pivots.push(c);p++;}for(let r=p;r<n;r++)if(rows[r][n])return null;const free=Array.from({length:n},(_,i)=>i).filter(i=>!pivots.includes(i));if(free.length>16)throw Error('Unsupported nullspace');let best=null;for(let mask=0;mask<2**free.length;mask++){const x=new Uint8Array(n);free.forEach((c,j)=>x[c]=(mask>>j)&1);pivots.forEach((c,r)=>{x[c]=rows[r][n];free.forEach(f=>x[c]^=rows[r][f]&x[f]);});const sol=Array.from(x, (v,i)=>v?i:-1).filter(i=>i>=0);if(best===null||sol.length<best.length)best=sol;}return best;}
function canonical(l){const n=l.size,t=[(x,y)=>[x,y],(x,y)=>[n-1-x,y],(x,y)=>[x,n-1-y],(x,y)=>[n-1-x,n-1-y],(x,y)=>[y,x],(x,y)=>[n-1-y,x],(x,y)=>[y,n-1-x],(x,y)=>[n-1-y,n-1-x]];return n+':'+t.map(f=>{const a=Array(n*n);l.lights.forEach((v,i)=>{const[x,y]=f(i%n,Math.floor(i/n));a[y*n+x]=v;});return a.join('');}).sort()[0];}
return {validate,initial,affected,legal,step,won,replay,proof,solve,canonical,equal};
});
