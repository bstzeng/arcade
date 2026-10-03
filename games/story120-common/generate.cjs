'use strict';
const fs=require('fs'),path=require('path'),E=require('./engine.js'),semantic=require('./semantic.cjs');
const root=path.resolve(__dirname,'../..'),spec=require('./spec.json');
function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
const premises={
'apocalypse-radio':['三夜暴雨前，電台要連起彼此孤立的據點。','警報只剩短波可用，聽眾請你給出能負責的路線。','你接替失聯主持人，桌上留著尚未核對的求援名單。','城裡停電，回電者成為下一夜唯一的嚮導。'],
'seven-letters':['風雨把三位故人留在旅館，七封信同時抵達櫃檯。','旅館即將易主，住客還不知道彼此帶來的信。','一封遲到的道歉與一份房契，等著同一夜的投遞。','離開的人已收好行李，你得決定哪些話能趕在天亮前抵達。'],
'last-council':['國境消息不斷送到，這是各派最後一次同桌表決。','王室讓出議程，三份資產成為交換支持的籌碼。','遷都與留守各有代價，會議後仍要真的交付承諾。','書記特別提醒：同一座糧倉不能在三份盟約中各出現一次。'],
'memory-pawn':['當舖開到末班車離站，故人的門卻不一定等你。','你需要一個新的去處，也想保留能讓人認出你的話。','店主收下往事，不收未來；每一段記憶都有不同用途。','照護站、舊屋與遠方都在等一個決定，資源卻藏在記憶裡。'],
'enemy-heir':['敵對陣營的成年人被選為繼承人，你們有三年準備交權。','印璽已備好，繼承人要求先學會真正處理爭議。','交權章程尚無文字，課堂上的每一次不同意見都會留下影響。','國家期待平穩交接，你的學生卻不願成為你的複製品。'],
'last-boat-ticket':['末班船只剩一個位子，另外兩人得安排島上的明天。','碼頭倒數離港，技術筆記比行李更值得留下。','有人想走，有人願留下；船票使一個選擇變成兩條故事線。','修船匠、信使與農師在岸邊交換情報，沒有人可以替所有人決定。'],
'yesterday-witness':['三位證人都看過昨日現場，卻尚未聽過彼此的版本。','卷宗缺少來源註記，你說出的每個名字都可能改變後來的回憶。','有人急著形成共同說法，你仍可以把親見和轉述分開。','聽證前夕，三段記憶需要核對，不能只靠它們聽起來相似。'],
'false-king':['真王缺席，平民替身得到短暫施政與坦白的機會。','禮服很合身，宮廷中卻有人開始問起你不曾擁有的童年。','城民只看見政令的結果，私下知情的人則等待你的公開選擇。','王冠替你打開大門，也把身分的期限帶進每次會面。'],
 'three-names':['同一座橋收到三份委託，它們來自你三個名字的同伴。','城門將在黎明開啟，三種身分許下的優先權不能同時兌現。','你可以保密，也可以把名字放到同一張協商桌上。','一個名字想封橋，另一個想通行，真正的橋沒有分身。'],
'future-defense':['公庫重開，你交替坐在年輕決策者與年老辯護者的位置。','四十年前的文件正被拆封，當年的空白如今仍是空白。','有人要求一份完整說法，但年輕的你未必留下過完整記錄。','三次事件穿過歲月，署名會保留責任，也會保留辯護依據。'],
'villain-turn':['城中糧食與城門引起衝突，你輪流接手三個對立位置。','沒有人從全知的角度開始，每章只能面對公開現實與自己的記錄。','上一個角色以為必要的措施，可能正是下一個角色的困境。','檔案、糧食與通路都只有一份，三種立場必須在同一座城相遇。'],
'unspoken-promise':['三件不能隨意轉述的事，藏在六次看似平常的會面裡。','有人要求你說出姓名，也有人只需要知道如何提供協助。','沉默能保護界線，也可能令一段關係暫時疏遠。','你可以回答、保留或有限轉述，但別人只能傳出已知道的部分。'],
'hero-retirement':['退休申請已收件，你還有七天把日常交給接班人。','三位舊友都留有委託；不去的地方不會停止發展。','這一週可以四處救火，也可以先留下方法，讓別人接手。','劍即將掛回牆上，但期限與未被拜訪的地方仍照常前進。'],
'borrowed-day':['兩位成年人交換一天生活，紙條是理解對方界線的唯一橋梁。','你得到對方的行程，也得到替別人作承諾的誘惑。','早晨換了身分，晚間卻必須把人際後果一同帶回。','代辦清單之外還有故友期待，對方正等待你的說明。'],
'final-wishes':['三句遺願留在桌上，家屬記得的脈絡並不完全相同。','物件清點完成，接下來必須把不同解讀變成可執行安排。','一把琴、一間屋與一段水聲，都不能替逝者說出唯一答案。','你被託付協調遺願，要記下同意，也要容得下保留意見。']};
function buildGame(game,write=true){const levels=[],proofs=[],seenOperative=new Set(),seenBehavior=new Set();for(let n=0;levels.length<100&&n<1000;n++){
 const id=String(levels.length+1).padStart(3,'0'),base={id,config:E.configFor(n),goal:[],premise:premises[game.id][n%4]};
 const random=rng((spec.games.findIndex(g=>g.id===game.id)+1)*1000003+n*17041+57),terminals=[];
 for(let sample=0;sample<196;sample++){let s=E.create(game.id,base);while(!s.done){const options=E.legal(s);s=E.apply(s,options[Math.floor(random()*options.length)]);}terminals.push(s);}
 const labels=E.defs[game.id].labels,keys=Object.keys(labels),selected=[keys[n%keys.length],keys[(n+1)%keys.length]];
 const buckets=new Map();for(const s of terminals){const f=E.facts(s),goal=[{key:'ending',label:'故事結局',value:f.ending},...selected.map(k=>({key:k,label:labels[k],value:f[k]}))],key=JSON.stringify(goal);if(!buckets.has(key))buckets.set(key,{goal,paths:[]});const b=buckets.get(key);if(!b.paths.some(t=>t.join('|')===s.trace.join('|')))b.paths.push(s.trace);}
 const possible=[...buckets.values()].filter(b=>b.paths.length>=2);if(!possible.length)throw Error(game.id+' has no alternate paths');
 possible.sort((a,b)=>JSON.stringify(a.goal).localeCompare(JSON.stringify(b.goal),'zh-Hant'));
 const fp=semantic.behavior(game.id,base),start=(n*7+Math.floor(n/6))%possible.length;let chosen=null;
 for(let offset=0;offset<possible.length;offset++){const candidate=possible[(start+offset)%possible.length],trial={...base,goal:candidate.goal};if(!seenOperative.has(semantic.operative(game.id,trial))&&!seenBehavior.has(semantic.behavioralGoal(fp,trial))){chosen=candidate;seenOperative.add(semantic.operative(game.id,trial));seenBehavior.add(semantic.behavioralGoal(fp,trial));break;}}
 if(!chosen)continue;const level={...base,title:`${id} · ${chosen.goal[0].value}`,goal:chosen.goal,structure:{eventOrder:base.config.order,causalLinks:base.config.links,publicRule:base.config.rule},hint:E.defs[game.id].hint};levels.push(level);proofs.push({id,witness:chosen.paths[0],alternate:chosen.paths[1],status:'won',mode:'challenge',difficulty:'normal'});
 }
 if(levels.length!==100)throw Error(game.id+' did not produce100 operative unique missions');
 if(write){const dir=path.join(root,'games',game.id);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'levels.json'),JSON.stringify(levels,null,2)+'\n');fs.writeFileSync(path.join(dir,'proofs.json'),JSON.stringify(proofs,null,2)+'\n');}
 return {levels,proofs};}
if(require.main===module){for(const game of spec.games){buildGame(game);console.log(game.id+': generated 100 causal missions and 100 alternate traces');}}
module.exports={buildGame};
