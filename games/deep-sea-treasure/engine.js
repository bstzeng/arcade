(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('../management-common/model.js'));else(r.ManagementGames||={})['deep-sea-treasure']={...(r.ManagementGames||{})['deep-sea-treasure'],engine:f(r.ManagementModel)};})(globalThis,function(M){'use strict';const {need,make}=M;
const cargo=(l,s)=>s.bag.reduce((n,i)=>n+l.treasures[i].weight,0),value=(l,s)=>s.bag.reduce((n,i)=>n+l.treasures[i].value,0);
const engine=make({start:l=>({cell:l.start,air:l.air,maxAir:l.air,cash:l.cash,suit:l.suit,bag:[],taken:[],cans:l.cans.map(c=>c.uses),hp:l.hp,time:0,key:false,failed:false,note:'氧氣包含回程！目標寶物必須帶回船上才算完成。'}),
 status:(l,s)=>s.failed?'lost':s.cell===l.start&&l.required.every(i=>s.bag.includes(i))&&value(l,s)>=l.target?'won':'playing',
 step(l,s,a){
 if(a.type==='move'){need(Number.isInteger(a.cell)&&l.cells[a.cell]&&!l.cells[a.cell].wall,'這格有礁石，無法通行。');const x=s.cell%l.width,y=Math.floor(s.cell/l.width),nx=a.cell%l.width,ny=Math.floor(a.cell/l.width);need(Math.abs(x-nx)+Math.abs(y-ny)===1,'每次只能潛行到上下左右相鄰格。');need(ny<=s.suit,'潛水衣無法承受這個深度。');need(!l.cells[a.cell].locked||s.key,'必須取得古船鑰匙。');const against=l.cells[s.cell].current&&l.cells[s.cell].current!==(nx>x?'E':nx<x?'W':ny>y?'S':'N'),cost=1+Math.floor(ny/2)+Math.floor(cargo(l,s)/l.heavy)+(against?1:0);s.air-=cost;s.cell=a.cell;s.time++;if(l.cells[a.cell].hazard)s.hp-=l.cells[a.cell].hazard;if(l.sharks.some(p=>p[s.time%p.length]===s.cell))s.hp--;if(l.cells[a.cell].key)s.key=true;s.note='潛行消耗 '+cost+' 氧氣；目前載重 '+cargo(l,s)+'。';}
 else if(a.type==='take'){const t=l.treasures[a.treasure];need(t&&t.cell===s.cell&&!s.taken.includes(a.treasure),'這件寶物不在附近，或已拿過。');need(cargo(l,s)+t.weight<=l.capacity,'背包超重。');s.bag.push(a.treasure);s.taken.push(a.treasure);s.air-=2;s.time++;s.note='取回'+t.name+'，採集消耗 2 氧氣。';}
 else if(a.type==='drop'){need(s.bag.includes(a.treasure),'背包內沒有這件寶物。');s.bag=s.bag.filter(i=>i!==a.treasure);s.note='已丟棄寶物；本次遠征不能再次拾取。';}
 else if(a.type==='air'){const c=l.cans[a.can];need(c&&c.cell===s.cell&&s.cans[a.can]>0,'此處沒有可用的補氣罐。');s.air=Math.min(s.maxAir,s.air+c.air);s.cans[a.can]--;s.time++;s.note='使用有限補氣罐。';}
 else if(a.type==='tank'){need(s.cell===l.start&&s.cash>=3&&s.maxAir===l.air,'氣瓶只能在船上升級一次。');s.cash-=3;s.maxAir+=15;s.air+=15;s.note='氣瓶上限增加 15。';}
 else if(a.type==='suit'){need(s.cell===l.start&&s.cash>=3&&s.suit<l.height-1,'只能在船上升級耐壓衣。');s.cash-=3;s.suit++;s.note='耐壓深度增加一層。';}
 else throw Error('未知潛水動作。');if(s.air<0||s.hp<=0||s.time>l.deadline)s.failed=true;
 },actions(l,s){return [{type:'tank'},{type:'suit'},...l.cells.map((c,cell)=>({type:'move',cell})),...l.treasures.flatMap((t,treasure)=>[{type:'take',treasure},{type:'drop',treasure}]),...l.cans.map((c,can)=>({type:'air',can}))];},
 describe:(l,a)=>a.type==='move'?'潛行到 '+(a.cell%l.width+1)+' 欄／'+(Math.floor(a.cell/l.width)+1)+' 層':a.type==='take'?'拾取'+l.treasures[a.treasure].name:a.type==='drop'?'丟棄'+l.treasures[a.treasure].name:a.type==='air'?'使用補氣罐':a.type==='tank'?'升級氣瓶（3 元）':'升級耐壓衣（3 元）',
 tip:()=> '移動氧耗 = 1 + 深度÷2 取整 + 載重÷重裝門檻取整，逆流再 +1。寶物越多，回程越耗氧；必要時留下次要寶物，或預留補氣罐給回程。'
});engine.cargo=cargo;engine.value=value;return engine;});
