(function(C){const{act,rng,svg,txt}=C;
const laws=['潮水','月亮','守衛','樹木','暴風','身形'];const values=[['高','低'],['暗','明'],['清醒','睡眠'],['枯萎','生長'],['猛烈','平息'],['巨大','微小']];
const scenes=[
{name:'銀河渡口',text:'潮水擋住了前路；月光也能凝結成渡橋。',paths:[{verb:'涉水過河',law:0,v:1,gift:'貝殼'},{verb:'走月光橋',law:1,v:1,gift:'星塵'}]},
{name:'沉睡的城門',text:'守衛守住門，門縫卻容得下一個小小旅人。',paths:[{verb:'悄悄過門',law:2,v:1,gift:'鑰匙'},{verb:'鑽過門縫',law:5,v:1,gift:'羽毛'}]},
{name:'風暴裂谷',text:'一棵枯樹立在谷邊；若風止了，掛索也能通行。',paths:[{verb:'走樹枝橋',law:3,v:1,gift:'木笛'},{verb:'滑索越谷',law:4,v:1,gift:'羽毛'}]},
{name:'巨石圖書館',text:'巨人才推得開巨石；明月會照出另一扇紙門。',paths:[{verb:'推開巨石',law:5,v:0,gift:'石印'},{verb:'走進紙門',law:1,v:1,gift:'星塵'}]},
{name:'海底花園',text:'退潮會露出石階；高大的活樹也通往花園。',paths:[{verb:'沿石階走',law:0,v:1,gift:'貝殼'},{verb:'攀上樹冠',law:3,v:1,gift:'木笛'}]},
{name:'夢獸的宴席',text:'夢獸睡著時能偷溜；縮小後可以藏進茶杯。',paths:[{verb:'繞過夢獸',law:2,v:1,gift:'鑰匙'},{verb:'藏進茶杯',law:5,v:1,gift:'羽毛'}]},
{name:'星空鐘樓',text:'暴風停息才能攀鐘繩；月亮明亮時有光梯。',paths:[{verb:'攀上鐘繩',law:4,v:1,gift:'石印'},{verb:'沿光梯爬',law:1,v:1,gift:'星塵'}]},
{name:'永夜森林',text:'森林活過來就會讓路；巨大身形也能跨越荊棘。',paths:[{verb:'跟隨樹徑',law:3,v:1,gift:'木笛'},{verb:'跨越荊棘',law:5,v:0,gift:'石印'}]}
];
C.register('storyteller-avatar',{
roles:['故事化身','說書人'],icon:'❝',color:'#d9b89a',intro:'說書人改寫世界的一句條件，化身選擇行動。每個困境都有兩種真正成立的解法，故事會記住帶走的紀念物。',help:['化身選擇想採用的行動，先向說書人提出意圖。','說書人看到兩種道路所需的故事條件，可花一點墨水改寫潮水、月亮、守衛、樹木、暴風或身形。','化身再次按原行動才會實際通過。每幕有 3 點墨水；至少兩條解法，不需照著示範走。'],
generate(n){const r=rng(n*1091);const chapters=Array.from({length:3+n%6},()=>({scene:Math.floor(r()*scenes.length),twist:Math.floor(r()*2)})),initial=Array.from({length:6},()=>Math.floor(r()*2));for(let i=0;i<3;i++)chapters[i].scene=Math.floor(n/Math.pow(8,i))%8;for(const p of scenes[chapters[0].scene].paths)initial[p.law]=1-p.v;return{id:n,chapters,laws:initial};},
init(l){return{chapter:0,laws:l.laws,ink:3,intent:null,gifts:[],last:'故事從一扇未開的門開始。'};},
observe(s,r){const ch=s.level.chapters[s.chapter],scene=ch?scenes[ch.scene]:null;return{chapter:s.chapter,total:s.level.chapters.length,laws:s.laws,ink:s.ink,intent:s.intent,gifts:s.gifts,last:s.last,scene:scene?{name:scene.name,text:scene.text,paths:scene.paths.map((p,i)=>({...p,v:p.v,...(r===0?{law:p.law}:{} )}))}:null,preferred:ch?.twist};},
actions(o){if(!o.scene)return[];return o.role===0?o.scene.paths.map((p,i)=>act('act',`${o.intent===i?'執行':'提出'}：${p.verb}`,{i})):laws.flatMap((name,law)=>[0,1].map(v=>act('rewrite',`${name} → ${values[law][v]}`,{law,v})));},
step(s,r,a){const z=scenes[s.level.chapters[s.chapter].scene];if(r===1&&a.type==='rewrite'&&Number.isInteger(a.law)&&a.law>=0&&a.law<6&&[0,1].includes(a.v)&&s.ink>0){if(s.laws[a.law]===a.v)return{ok:false,reason:'這句故事已經如此'};s.laws[a.law]=a.v;s.ink--;return{ok:true};}if(r!==0||a.type!=='act'||![0,1].includes(a.i))return{ok:false};if(s.intent!==a.i){s.intent=a.i;return{ok:true};}const p=z.paths[a.i];if(s.laws[p.law]!==p.v)return{ok:false,reason:'故事條件還不允許這個行動，請說書人改寫'};s.gifts.push(p.gift);s.last=`你在${z.name}${p.verb}，帶走了${p.gift}。`;s.chapter++;s.intent=null;s.ink=3;s.won=s.chapter===s.level.chapters.length;return{ok:true};},
ai(o){if(!o.scene)return null;if(o.role===0){if(o.intent===null)return act('act','提出故事行動',{i:o.preferred});const p=o.scene.paths[o.intent];return o.laws[p.law]===p.v?act('act','在改寫的世界裡行動',{i:o.intent}):null;}if(o.intent===null)return null;const p=o.scene.paths[o.intent];return o.laws[p.law]!==p.v&&o.ink>0?act('rewrite','改寫意圖所需條件',{law:p.law,v:p.v}):null;},
view(o){let b=`<path d="M45 60Q150 20 280 65Q410 20 515 60V275Q410 235 280 278Q150 235 45 275Z" fill="#776754"/><path d="M280 65V278" stroke="#362f34" stroke-width="4"/>`+txt(163,99,o.scene?.name||'故事的尾聲',21);if(o.scene){b+=txt(160,157,o.scene.paths[0].verb,19)+txt(160,206,o.scene.paths[1].verb,19);for(let i=0;i<6;i++)b+=txt(399,98+i*27,`${laws[i]}：${values[i][o.laws[i]]}`,17);}return svg(b);},status:o=>`篇章 ${o.chapter}/${o.total} · 墨水 ${o.ink}/3 · ${o.scene?.text||o.last}`
});})(typeof module!=='undefined'?require('../coop120-common/core.js'):CoopCore);
