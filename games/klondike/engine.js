/* Klondike Turn One: deterministic rules shared by the UI and certificate replay. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Klondike=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const suit=c=>Math.floor(c/13),rank=c=>c%13+1,color=c=>suit(c)%2;
const clone=s=>({tableau:s.tableau.map(p=>({cards:p.cards.slice(),down:p.down})),stock:s.stock.slice(),waste:s.waste.slice(),foundation:s.foundation.slice()});
function assert(x,message){if(!x)throw new Error(message);}
function initial(deck){assert(Array.isArray(deck)&&deck.length===52&&new Set(deck).size===52&&deck.every(c=>Number.isInteger(c)&&c>=0&&c<52),'牌組必須是 52 張不重複的牌');let n=0;const tableau=Array.from({length:7},(_,i)=>({cards:deck.slice(n,n+=i+1),down:i}));return {tableau,stock:deck.slice(28).reverse(),waste:[],foundation:[0,0,0,0]};}
function valid(s){
 try{assert(s&&Array.isArray(s.tableau)&&s.tableau.length===7,'七個牌列');assert(Array.isArray(s.stock)&&Array.isArray(s.waste)&&Array.isArray(s.foundation)&&s.foundation.length===4,'牌堆格式');const all=[...s.stock,...s.waste];
 s.tableau.forEach(p=>{assert(p&&Array.isArray(p.cards)&&Number.isInteger(p.down)&&p.down>=0&&(p.cards.length?p.down<p.cards.length:p.down===0),'覆牌數');all.push(...p.cards);for(let i=p.down+1;i<p.cards.length;i++)assert(rank(p.cards[i-1])===rank(p.cards[i])+1&&color(p.cards[i-1])!==color(p.cards[i]),'正面牌序');});
 s.foundation.forEach((n,z)=>{assert(Number.isInteger(n)&&n>=0&&n<=13,'完成區');for(let r=0;r<n;r++)all.push(z*13+r);});assert(all.length===52&&new Set(all).size===52&&all.every(c=>Number.isInteger(c)&&c>=0&&c<52),'52 張唯一牌');return true;}catch(e){return false;}
}
function source(s,zone,p,i){if(zone==='w'){assert(s.waste.length,'翻牌區沒有牌');return [s.waste.at(-1)];}if(zone==='f'){assert(Number.isInteger(p)&&p>=0&&p<4&&s.foundation[p]>0,'完成區沒有牌');return [p*13+s.foundation[p]-1];}assert(zone==='t'&&Number.isInteger(p)&&p>=0&&p<7,'來源牌列');const col=s.tableau[p];assert(Number.isInteger(i)&&i>=col.down&&i<col.cards.length,'只能移動正面牌');const cards=col.cards.slice(i);for(let n=1;n<cards.length;n++)assert(rank(cards[n-1])===rank(cards[n])+1&&color(cards[n-1])!==color(cards[n]),'須紅黑交錯遞減');return cards;}
/* Actions: ['d'] draw one; ['r'] recycle; ['m', source zone, pile, index, target zone, pile]. */
function apply(s,a){
 assert(Array.isArray(a),'動作格式');const n=clone(s);
 if(a[0]==='d'){assert(a.length===1&&n.stock.length,'牌庫已空');n.waste.push(n.stock.pop());return n;}
 if(a[0]==='r'){assert(a.length===1&&!n.stock.length&&n.waste.length,'牌庫清空後才能回收');n.stock=n.waste.reverse();n.waste=[];return n;}
 assert(a[0]==='m'&&a.length===6,'未知動作');const [,fz,p,i,tz,q]=a,cards=source(s,fz,p,i),c=cards[0];
 assert(Number.isInteger(q),'目標編號');
 if(tz==='t'){assert(q>=0&&q<7&&!(fz==='t'&&p===q),'目標牌列');const dst=n.tableau[q].cards;assert(dst.length?rank(dst.at(-1))===rank(c)+1&&color(dst.at(-1))!==color(c):rank(c)===13,'只能紅黑交錯遞減，空位限 K');dst.push(...cards);}
 else{assert(tz==='f'&&q>=0&&q<4&&cards.length===1&&suit(c)===q&&rank(c)===n.foundation[q]+1,'完成區須同花色 A 到 K');assert(!(fz==='f'&&p===q),'來源與目標相同');n.foundation[q]++;}
 if(fz==='w')n.waste.pop();else if(fz==='f')n.foundation[p]--;else{const col=n.tableau[p];col.cards.splice(i);if(col.down&&col.down===col.cards.length)col.down--;}
 return n;
}
function can(s,a){try{apply(s,a);return true;}catch(e){return false;}}
function won(s){return s.foundation.every(n=>n===13);}
function key(s){return JSON.stringify([s.tableau.map(p=>[p.down,...p.cards]),s.stock,s.waste,s.foundation]);}
function cardName(c){return ['黑桃','紅心','梅花','方塊'][suit(c)]+(['A','2','3','4','5','6','7','8','9','10','J','Q','K'][rank(c)-1]);}
return {initial,clone,valid,apply,can,won,key,rank,suit,color,cardName,source};
});
