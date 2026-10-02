(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../management-common/model.js'));else(r.ManagementGames||={})['caravan-trade']={...(r.ManagementGames||{})['caravan-trade'],engine:f(r.ManagementModel)};})(globalThis,function(M){'use strict';const {need,make}=M;const load=s=>s.cargo.reduce((a,b)=>a+b,0)+Math.ceil(s.food/3);
return make({start:l=>({city:0,day:0,cash:l.cash,food:l.food,hp:l.hp,guard:false,cargo:[0,0,0],stock:l.cities.map(c=>c.stock.slice()),foodStock:l.cities.map(c=>c.foodStock),done:l.contracts.map(()=>false),sold:[0,0,0],failed:false,note:'查看各城價格、合約和道路風險，留出糧食空間。'}),
 status:(l,s)=>s.failed?'lost':s.done.every(Boolean)&&s.city===0&&s.cash>=l.target?'won':'playing',
 step(l,s,a){const city=l.cities[s.city];
 if(a.type==='buy'){need([0,1,2].includes(a.good)&&s.stock[s.city][a.good]>0&&s.cash>=city.buy[a.good]&&load(s)+1<=l.capacity,'貨物、資金或載重空間不足。');s.stock[s.city][a.good]--;s.cash-=city.buy[a.good];s.cargo[a.good]++;s.note='購入'+l.goods[a.good]+'。';}
 else if(a.type==='sell'){need([0,1,2].includes(a.good)&&s.cargo[a.good]>0,'背包內沒有這件貨物。');s.cargo[a.good]--;s.cash+=city.sell[a.good];s.sold[a.good]++;s.note='售出'+l.goods[a.good]+'。';}
 else if(a.type==='food'){need(s.foodStock[s.city]>0&&s.cash>=city.foodPrice,'沒有糧食庫存或資金不足。');need(s.cargo.reduce((a,b)=>a+b,0)+Math.ceil((s.food+3)/3)<=l.capacity,'補充後會超過載重。');s.cash-=city.foodPrice;s.food+=3;s.foodStock[s.city]--;s.note='補充 3 日份糧食。';}
 else if(a.type==='guard'){need(!s.guard&&s.cash>=l.guardPrice,'已有護衛或資金不足。');s.cash-=l.guardPrice;s.guard=true;s.note='護衛保護下一段路程，抵達後離隊。';}
 else if(a.type==='travel'){const road=l.roads[a.road];need(road&&(road.a===s.city||road.b===s.city),'只能走相連道路。');need(s.food>=road.days&&load(s)<=l.capacity,'糧食或載重不足。');s.food-=road.days;s.day+=road.days;if(road.risk&&!s.guard){s.hp-=road.risk;const i=s.cargo.findIndex(n=>n>0);if(i>=0)s.cargo[i]--;s.note='遭遇風險，生命減少 '+road.risk+' 並遺失一件貨物。';}else s.note='安全抵達下一座城。';s.guard=false;s.city=road.a===s.city?road.b:road.a;if(s.hp<=0||s.day>l.deadline)s.failed=true;}
 else if(a.type==='deliver'){const c=l.contracts[a.contract];need(c&&!s.done[a.contract]&&c.city===s.city&&s.cargo[c.good]>=c.quantity,'所在地或貨物數量不符合合約。');s.cargo[c.good]-=c.quantity;s.cash+=c.reward;s.done[a.contract]=true;s.note='完成合約，收入 '+c.reward+' 元。';}
 else throw Error('未知商隊動作。');
 },actions(l,s){return [{type:'food'},{type:'guard'},...[0,1,2].flatMap(good=>[{type:'buy',good},{type:'sell',good}]),...l.roads.map((r,road)=>({type:'travel',road})),...l.contracts.map((c,contract)=>({type:'deliver',contract}))];},
 describe:(l,a)=>a.type==='buy'?'購入'+l.goods[a.good]:a.type==='sell'?'售出'+l.goods[a.good]:a.type==='food'?'購買 3 糧食':a.type==='guard'?'聘請一程護衛':a.type==='deliver'?'交付合約 '+(a.contract+1):'走 '+l.cities[l.roads[a.road].a].name+' ↔ '+l.cities[l.roads[a.road].b].name,
 tip:()=> '每 3 份糧食占一格。合約只支付一次；市場庫存不會刷新。高風險道路可用護衛換取安全；任何到港後護衛都會離隊。交貨後還要回到起點並達到現金目標。'
});});
