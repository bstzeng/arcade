(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../management-common/model.js'));else(r.ManagementGames||={})['repair-shop']={...(r.ManagementGames||{})['repair-shop'],engine:f(r.ManagementModel)};})(globalThis,function(M){'use strict';const {need,make}=M;
function advance(l,s,n){s.time+=n;for(const p of s.orders)if(!p.arrived&&p.eta<=s.time){s.parts[p.part]++;p.arrived=true;}if(s.time>l.deadline)s.failed=true;}
return make({start:l=>({time:0,cash:l.cash,tool:1,parts:l.parts.slice(),stock:l.stock.slice(),orders:[],jobs:l.jobs.map(()=>({possible:[0,1,2],tests:[],fixed:false,sold:false})),failed:false,note:'先做檢測確認故障，再訂購合適零件。'}),
 status:(l,s)=>s.failed?'lost':s.jobs.every(j=>j.sold)?(s.cash>=l.target?'won':'lost'):'playing',
 step(l,s,a){const j=s.jobs[a.job],def=l.jobs[a.job];
 if(a.type==='test'){need(j&&!j.sold&&!j.fixed&&[0,1,2].includes(a.test)&&!j.tests.some(t=>t.test===a.test),'此檢測無法重複。');need(s.cash>=1,'檢測需要 1 元。');s.cash--;const positive=def.fault===a.test;j.tests.push({test:a.test,positive});j.possible=positive?[a.test]:j.possible.filter(v=>v!==a.test);advance(l,s,1);s.note=def.name+'：'+['電路','傳動','訊號'][a.test]+(positive?'異常':'正常');}
 else if(a.type==='order'){need([0,1,2].includes(a.part)&&s.stock[a.part]>0&&s.cash>=l.prices[a.part],'庫存或資金不足。');s.cash-=l.prices[a.part];s.stock[a.part]--;s.orders.push({part:a.part,eta:s.time+l.delivery,arrived:false});advance(l,s,1);s.note='零件已訂購；到貨時會自動加入庫存。';}
 else if(a.type==='tool'){need(s.tool<3&&s.cash>=l.toolPrice,'工具已滿級或資金不足。');s.cash-=l.toolPrice;s.tool++;advance(l,s,1);s.note='工具升級為 '+s.tool+' 級。';}
 else if(a.type==='repair'){need(j&&!j.sold&&!j.fixed&&j.possible.length===1,'必須先診斷出唯一故障。');need(s.parts[j.possible[0]]>0&&s.tool>=def.difficulty,'需要正確零件及足夠等級工具。');s.parts[j.possible[0]]--;j.fixed=true;advance(l,s,def.work);s.note=def.name+'已修復，品質 100%。';}
 else if(a.type==='sell'){need(j&&j.fixed&&!j.sold,'只能售出已修好的物品。');j.sold=true;s.cash+=def.price;advance(l,s,1);s.note='售出'+def.name+'，收入 '+def.price+' 元。';}
 else if(a.type==='wait'){advance(l,s,1);s.note='經過一小時，查看到貨時間。';}
 else throw Error('未知修理店動作。');
 },actions(l,s){return [{type:'tool'},{type:'wait'},...[0,1,2].map(part=>({type:'order',part})),...l.jobs.flatMap((j,job)=>[{type:'repair',job},{type:'sell',job},...[0,1,2].map(test=>({type:'test',job,test}))])];},
 describe:(l,a)=>a.type==='tool'?'工具升級':a.type==='wait'?'等候一小時':a.type==='order'?'訂購'+['電路','傳動','訊號'][a.part]+'零件':a.type==='repair'?'修復'+l.jobs[a.job].name:a.type==='sell'?'售出'+l.jobs[a.job].name:'檢測'+l.jobs[a.job].name+'的'+['電路','傳動','訊號'][a.test],
 tip:()=> '陽性檢測直接鎖定故障；兩次陰性也可排除到唯一故障。訂單運送需要時間，可在等待時檢測其他物品。升級工具是整間店共用的投資。'
});});
