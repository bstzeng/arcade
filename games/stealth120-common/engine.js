(function(root){'use strict';
const dirs=[[0,-1],[1,0],[0,1],[-1,0]], clone=x=>JSON.parse(JSON.stringify(x)), eq=(a,b)=>a===b;
function xy(l,p){return[p%l.w,Math.floor(p/l.w)]}function md(l,a,b){const[x,y]=xy(l,a),[u,v]=xy(l,b);return Math.abs(x-u)+Math.abs(y-v)}
function next(l,p,d){const[x,y]=xy(l,p),[u,v]=dirs[d];return x+u<0||x+u>=l.w||y+v<0||y+v>=l.h?-1:p+u+v*l.w}
function open(l,p){return p>=0&&p<l.w*l.h&&!l.walls.includes(p)}
function line(l,a,b){const[x,y]=xy(l,a),[u,v]=xy(l,b);if(x!==u&&y!==v)return false;const d=x===u?(y<v?2:0):(x<u?1:3);for(let c=next(l,a,d);c!==b;c=next(l,c,d))if(!open(l,c))return false;return true}
function path(l,a,b){if(a===b)return[a];let q=[a],seen=new Map([[a,-1]]);for(let k=0;k<q.length;k++)for(let d=0;d<4;d++){let p=next(l,q[k],d);if(open(l,p)&&!seen.has(p)){seen.set(p,q[k]);q.push(p);if(p===b){let r=[p];while(r[0]!==a)r.unshift(seen.get(r[0]));return r}}}return[]}
function seen(l,g,p){if(p===g.p)return true;const[x,y]=xy(l,g.p),[u,v]=xy(l,p),[dx,dy]=dirs[g.dir];return (dx===0?x===u&&Math.sign(v-y)===dy:y===v&&Math.sign(u-x)===dx)&&md(l,g.p,p)<=g.range&&line(l,g.p,p)}
function guardInit(g){return{p:g.route[0],dir:g.dir||0,range:g.range||3,idx:0,mode:'patrol',target:-1,timer:0}}
function initial(l){let s={p:l.start,t:0,used:0,mask:0,status:'playing',message:'觀察盤面，選擇第一步。',guards:(l.guards||[]).map(guardInit),alert:0,identity:0,disabled:0,air:l.air||999,fansOff:false,rescued:false,hold:false,hp:l.hostage??null,decoys:l.decoys||0,shots:0,memory:0,rewinds:l.rewinds||0,off:false,digs:0};
if(l.kind==='thief-exchange')Object.assign(s,{p:0,stash:false,taken:false,fake:false});
if(l.kind==='tailing-mission')Object.assign(s,{p:0,lane:l.lane,target:3,targetLane:l.targetLane});
if(l.kind==='document-swap')Object.assign(s,{selected:-1,paper:0,seal:0,date:0,swapped:false});
if(l.kind==='dual-infiltration')Object.assign(s,{a:l.starts[0],b:l.starts[1],gate:false,passed:false});
if(l.kind==='bug-sweep')Object.assign(s,{freq:0,noise:true,readings:[[],[]],removed:0,battery:l.battery});return s}
function fail(s,msg){s.status='lost';s.message=msg;return s}function win(s){s.status='won';s.message='任務完成。撤離成功！';return s}
function patrol(l,s,noise){s.guards.forEach((g,i)=>{const cfg=l.guards[i];if(noise&&md(l,g.p,noise.p)<=noise.power){g.target=noise.p;g.mode='investigate';g.timer=cfg.search||3}
if(g.mode==='investigate'){let p=path(l,g.p,g.target);if(p.length>1){const a=xy(l,g.p),b=xy(l,p[1]);g.dir=dirs.findIndex(d=>a[0]+d[0]===b[0]&&a[1]+d[1]===b[1]);g.p=p[1]}else{g.mode='search';g.timer=cfg.search||3}}
else if(g.mode==='search'){g.dir=(g.dir+1)%4;if(--g.timer<=0)g.mode='return'}
else if(g.mode==='return'){let p=path(l,g.p,cfg.route[g.idx]);if(p.length>1){let a=xy(l,g.p),b=xy(l,p[1]);g.dir=dirs.findIndex(d=>a[0]+d[0]===b[0]&&a[1]+d[1]===b[1]);g.p=p[1]}else g.mode='patrol'}
else {g.idx=(g.idx+1)%cfg.route.length;let dest=cfg.route[g.idx];if(dest===g.p)g.dir=(g.dir+1)%4;else{let a=xy(l,g.p),b=xy(l,dest);g.dir=dirs.findIndex(d=>a[0]+d[0]===b[0]&&a[1]+d[1]===b[1]);g.p=dest}}});}
function lit(l,p,t){return(l.lights||[]).some(x=>x.p===p&&t%x.period===x.on)}
function cameraSight(l,s,p,t){return s.disabled<=0&&(l.cameras||[]).some(c=>seen(l,{p:c.p,range:c.range,dir:(c.dir+Math.floor(t/c.speed))%4},p))}
function candidates(l,s,f){let r=[];for(let p=0;p<l.w*l.h;p++)if(s.readings[f].every(z=>100-10*md(l,p,z.p)===z.value))r.push(p);return r}
function actions(l,s){if(s.status!=='playing')return l.kind==='rewind-agent'&&s.status==='lost'&&s.rewinds>0?['rewind']:[];
if(l.kind==='thief-exchange')return['cw','ccw','wait','exchange','stash'];
if(l.kind==='tailing-mission')return['forward','sprint','left','right','wait'];
if(l.kind==='document-swap')return l.docs.map((_,i)=>'select:'+i).concat(['paper:0','paper:1','paper:2','seal:0','seal:1','seal:2','date:0','date:1','date:2','wait','swap','leave']);
if(l.kind==='bug-sweep')return['noise','freq:0','freq:1'].concat(Array.from({length:l.w*l.h},(_,p)=>'scan:'+p),Array.from({length:l.w*l.h},(_,p)=>'remove:'+p));
if(l.kind==='dual-infiltration')return['a0','a1','a2','a3','b0','b1','b2','b3'];
let a=['m0','m1','m2','m3','wait'];if(l.kind==='silent-footsteps')a.push('fast0','fast1','fast2','fast3');
if(l.kind==='disguise-pass')a.push('dress:0','dress:1','dress:2');if(l.kind==='camera-labyrinth')a.push('hack');if(l.kind==='vent-escape')a.push('valve');if(l.kind==='prison-break')a.push('dig');if(l.kind==='hostage-extraction')a.push('rescue','hold');if(l.kind==='decoy-setup')for(let p=0;p<l.w*l.h;p++)if(open(l,p)&&md(l,s.p,p)<=3)a.push('decoy:'+p);
if(l.kind==='spy-photography')for(let i=0;i<l.evidence.length;i++)for(let z=0;z<3;z++)a.push('photo:'+i+':'+z);if(l.kind==='rewind-agent')a.push('rewind','disable');return a}
function step(l,input,a){if(!actions(l,input).includes(a))return input;let s=clone(input),noise=null;s.message='';const kind=l.kind;
if(kind==='thief-exchange'){
 const n=l.n;s.t++;s.used++;if(a==='cw')s.p=(s.p+1)%n;if(a==='ccw')s.p=(s.p+n-1)%n;if(s.p===l.pickup)s.fake=true;
 const target=(l.targetStart+s.t*l.targetSpeed)%n,crowd=l.crowd[s.t%l.crowd.length];const dist=Math.min((s.p-target+n)%n,(target-s.p+n)%n),covered=crowd.includes(s.p);
 if(a==='exchange'){if(!s.fake)return fail(s,'還沒有仿品，交接失敗。');if(dist>1||!covered)return fail(s,'交接沒有被人群擋住，身份暴露。');s.taken=true;s.fake=false;s.message='調包完成！先把真品藏入外套。'}
 if(a==='stash'){if(!s.taken||!covered)return fail(s,'藏物動作被發現。');s.stash=true}
 if(s.taken&&!s.stash&&l.watch[s.t%l.watch.length]===s.p&&!covered)return fail(s,'巡視守衛發現手中真品。');
 if(s.taken&&s.stash&&s.p===0)return win(s);if(s.t>l.limit)return fail(s,'最後出口已封鎖。');return s;
}
if(kind==='tailing-mission'){
 const i=s.t;if(i>=l.route.length)return s;const r=l.route[i];s.t++;s.used++;s.target+=r.speed;s.targetLane=r.lane;if(a==='forward')s.p++;if(a==='sprint')s.p+=2;if(a==='left')s.lane--;if(a==='right')s.lane++;
 if(s.lane<0||s.lane>2||l.blocks.some(b=>b.x===s.p&&b.lane===s.lane))return fail(s,'走入封鎖車道，跟丟目標。');const gap=s.target-s.p;if(gap<2)return fail(s,'距離太近，被目標認出。');if(gap>5)return fail(s,'距離太遠，跟丟目標。');
 if(r.look&&s.lane===s.targetLane&&!l.covers.some(b=>b.x===s.p&&b.lane===s.lane))return fail(s,'目標回頭，你沒有掩體。');if(s.t===l.route.length)return win(s);return s;
}
if(kind==='document-swap'){
 const oldCol=s.t%l.cols;s.t++;s.used++;let bits=a.split(':');if(bits[0]==='select')s.selected=+bits[1];if(['paper','seal','date'].includes(bits[0]))s[bits[0]]=+bits[1];
 if(a==='swap'){if(s.selected<0)return fail(s,'尚未選定文件。');const d=l.docs[s.selected];if(s.selected%l.cols===oldCol)return fail(s,'巡檢員正在查看這一欄。');if(!l.clues.every((v,i)=>d[['dept','rank','mark'][i]]===v))return fail(s,'文件不符合線索，調包了錯誤原件。');if(d.paper!==s.paper||d.seal!==s.seal||d.date!==s.date)return fail(s,'仿品的紙張、封蠟或日期不符。');s.swapped=true;s.message='調包完畢，請安全離場。'}
 if(a==='leave'){if(!s.swapped)return fail(s,'尚未完成原件調包。');return win(s)}if(s.t>l.limit)return fail(s,'例行盤點開始，未及撤離。');return s;
}
if(kind==='bug-sweep'){
 const [op,n]=a.split(':'),p=+n;if(op==='freq'){s.freq=p;return s}if(op==='noise'){s.noise=!s.noise;s.battery--;s.message=s.noise?'環境干擾開啟。':'環境干擾已關閉。'}
 if(op==='scan'){s.battery--;const v=100-10*md(l,p,l.bugs[s.freq]),raw=v+(s.noise?l.noise[p%l.noise.length]:0);s.readings[s.freq]=s.readings[s.freq].filter(r=>r.p!==p);s.readings[s.freq].push({p,value:v,raw,offset:s.noise?l.noise[p%l.noise.length]:0});s.message='頻道 '+(s.freq+1)+'：原始 '+raw+'，扣除干擾後 '+v+'。'}
 if(op==='remove'){const c=candidates(l,s,s.freq);if(s.readings[s.freq].length<2||c.length!==1||c[0]!==p){s.battery-=3;s.message='證據不足或位置不符，損失 3 電量。'}else{s.removed|=1<<s.freq;s.message='已拆除頻道 '+(s.freq+1)+' 的裝置。'}}
 s.t++;if(s.removed===3)return win(s);if(s.battery<=0)return fail(s,'探測器電量用盡。');return s;
}
if(kind==='dual-infiltration'){
 const who=a[0],d=+a[1],old=s[who],p=next(l,old,d);if(!open(l,p)||Math.floor(p/l.w)<(who==='a'?0:l.h/2)||Math.floor(p/l.w)>=(who==='a'?l.h/2:l.h))return input;
 if(p===l.gates[0]&&!s.gate||p===l.gates[1]&&!s.passed&&s.a!==l.plate)return input;s[who]=p;s.t++;s.used++;if(s.b===l.switch)s.gate=true;if(s.b===l.gates[1])s.passed=true;if(s.a===l.exits[0]&&s.b===l.exits[1])return win(s);return s;
}
if(kind==='rewind-agent'&&a==='rewind'){if(s.rewinds<=0)return input;let n=initial(l);n.memory=s.memory;n.rewinds=s.rewinds-1;n.used=s.used+1;n.message='已倒帶。門碼記憶 '+n.memory+' 保留。';return n}
let dest=s.p,move=/^(m|fast)[0-3]$/.test(a);if(move){const fast=a.startsWith('fast'),d=+a.slice(-1);dest=next(l,s.p,d);if(!open(l,dest))return input;
 if(kind==='shadow-infiltration'&&lit(l,dest,s.t+1))return input;
 if(kind==='disguise-pass'&&(l.doors||[]).some(x=>x.p===dest&&x.identity!==s.identity))return input;
 if(kind==='vent-escape'){if(!(l.pipes[s.p]&(1<<d))||!(l.pipes[dest]&(1<<((d+2)%4))))return input;if(l.fans.some(f=>f.p===dest&&!s.fansOff&&(s.t+1)%f.period!==f.off))return input;}
 if(kind==='prison-break'&&l.doors.some(x=>x.p===dest&&(s.t+1)%4!==x.open))return input;
 s.p=dest;s.used+=kind==='silent-footsteps'&&!fast?2:1;
 if(kind==='silent-footsteps'&&fast){let power=(l.floors[dest]||0)+1;if(power>1)noise={p:dest,power};}
 }else{s.used++;const [op,arg]=a.split(':');if(op==='dress'){if(!l.wardrobes.includes(s.p))return input;s.identity=+arg}
 else if(a==='hack'){if(s.p!==l.hack)return input;s.disabled=4}
 else if(a==='valve'){if(s.p!==l.valve)return input;s.fansOff=!s.fansOff}
 else if(a==='dig'){if(s.p!==l.dig||(s.mask&3)!==3)return input;s.digs++}
 else if(a==='rescue'){if(md(l,s.p,s.hp)>1||s.rescued)return input;s.rescued=true}
 else if(a==='hold'){if(!s.rescued)return input;s.hold=!s.hold}
 else if(op==='decoy'){if(s.decoys<=0)return input;s.decoys--;noise={p:+arg,power:l.w+l.h};s.message='聲源已投出，守衛開始調查。'}
 else if(op==='photo'){let target=l.evidence[+arg],zoom=+a.split(':')[2],distance=md(l,s.p,target),min=[1,3,5][zoom],max=[2,4,7][zoom];if(!line(l,s.p,target)||distance<min||distance>max)return input;s.shots|=1<<(+arg);s.message='證據 '+(+arg+1)+' 已拍攝。'}
 else if(a==='disable'){if(s.p!==l.start||s.memory!==(1<<l.traps.length)-1)return input;s.off=true;s.message='利用記住的門碼停用感測網。'}
 }
s.t++;if(s.disabled>0)s.disabled--;patrol(l,s,noise);
 if(kind==='vent-escape'){s.air--;let bottle=l.oxygen.indexOf(s.p);if(bottle>=0&&!(s.mask&(1<<(bottle+2)))){s.air+=l.refill;s.mask|=1<<(bottle+2)}}
 if(kind==='prison-break'){if(s.p===l.key)s.mask|=1;if(s.p===l.tool)s.mask|=2}else if(s.p===l.chip)s.mask|=1;
 if(kind==='rewind-agent'&&!s.off){let j=l.traps.indexOf(s.p);if(j>=0){s.memory|=1<<j;return fail(s,'感測器啟動；已記住第 '+(j+1)+' 段門碼。可倒帶保留情報。')}}
 if(kind==='hostage-extraction'&&s.rescued&&!s.hold&&md(l,s.p,s.hp)>1){let way=path(l,s.hp,s.p);if(way.length>1&&!s.guards.some(g=>seen(l,g,way[1])))s.hp=way[1]}
 let detected=s.guards.some(g=>seen(l,g,s.p)||(kind==='hostage-extraction'&&s.rescued&&seen(l,g,s.hp)));
 if(kind==='disguise-pass')detected=s.guards.some(g=>md(l,g.p,s.p)<=1);
 if(s.guards.some(g=>g.p===s.p||(kind==='hostage-extraction'&&s.rescued&&g.p===s.hp)))return fail(s,'與守衛正面相遇，任務暴露。');
 if(detected){s.alert++;s.message='警戒 '+s.alert+'／2：立刻離開視線！';s.guards.forEach(g=>{if(kind!=='decoy-setup'&&seen(l,g,s.p)){g.target=s.p;g.mode='investigate';g.timer=2}});if(s.alert>=2)return fail(s,'連續被看見，守衛已鎖定你。')}else s.alert=Math.max(0,s.alert-1);
 if(kind==='camera-labyrinth'&&cameraSight(l,s,s.p,s.t))return fail(s,'被轉向後的監視器拍到。');
 if(s.air<=0)return fail(s,'氧氣已用盡。');if(s.used>(l.budget||999))return fail(s,'行動點用盡。');
 const ready=kind==='spy-photography'?s.shots===(1<<l.evidence.length)-1:kind==='prison-break'?(s.mask&3)===3&&s.digs>=l.requiredDigs:kind==='hostage-extraction'?s.rescued&&md(l,s.hp,l.exit)<=1:kind==='rewind-agent'?s.off&&(s.mask&1):(s.mask&1);
 if(s.p===l.exit&&ready)return win(s);return s;
}
function key(l,s){let t=s.t%(l.cycle||12);if(l.kind==='tailing-mission')t=s.t;if(l.kind==='document-swap')return JSON.stringify([s.selected,s.paper,s.seal,s.date,s.swapped,s.t%l.cols]);if(l.kind==='thief-exchange')return JSON.stringify([s.p,t,s.fake,s.taken,s.stash]);if(l.kind==='dual-infiltration')return [s.a,s.b,+s.gate,+s.passed].join(',');return JSON.stringify([s.p,t,s.mask,s.guards,s.identity,s.disabled,0,s.fansOff,s.rescued,s.hold,s.hp,s.decoys,s.shots,s.memory,s.rewinds,s.off,s.digs,s.lane,s.target,s.status,s.alert]);}
function solve(l,start=initial(l),max=130000){let q=[{s:start,parent:-1,a:null}],visited=new Map([[key(l,start),0]]);for(let i=0;i<q.length&&i<max;i++){let node=q[i];if(node.s.status==='won'){let out=[];for(let j=i;q[j].parent>=0;j=q[j].parent)out.unshift(q[j].a);return {actions:out,explored:i+1}}
 for(const a of actions(l,node.s)){const s=step(l,node.s,a);if(s===node.s||(s.status==='lost'&&l.kind!=='rewind-agent'))continue;const k=key(l,s),old=visited.get(k);if(old!==undefined&&q[old].s.used<=s.used)continue;visited.set(k,q.length);q.push({s,parent:i,a});} }return null}
const api={initial,step,actions,solve,key,clone,xy,md,next,open,line,path,seen,lit,cameraSight,candidates};if(typeof module==='object')module.exports=api;else root.StealthEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
