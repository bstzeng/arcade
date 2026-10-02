/* Shared, pure Pyramid rules. Also used by the in-browser game and proof replay. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PyramidEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const rank = id => id % 13 + 1;
  const children = Array.from({length:28}, (_, i) => {
    let row = 0; while ((row+1)*(row+2)/2 <= i) row++;
    return row === 6 ? [] : [i+row+1, i+row+2];
  });
  function validDeal(d) {
    return !!d && Array.isArray(d.pyramid) && d.pyramid.length === 28 && Array.isArray(d.stock) && d.stock.length === 24 &&
      new Set([...d.pyramid,...d.stock]).size === 52 && [...d.pyramid,...d.stock].every(c => Number.isInteger(c) && c >= 0 && c < 52);
  }
  function initial(d) {
    if (!validDeal(d)) throw Error('牌局資料不完整');
    return {pyramid:d.pyramid.slice(),stock:d.stock.slice(),waste:[],removed:[],redeals:0,moves:0};
  }
  const won = s => s.pyramid.every(c => c === null);
  const exposed = (s,i) => Number.isInteger(i) && i >= 0 && i < 28 && s.pyramid[i] !== null && children[i].every(j => s.pyramid[j] === null);
  function playable(s) {
    const cards = s.pyramid.filter((c,i) => exposed(s,i));
    if (s.waste.length) cards.push(s.waste[s.waste.length-1]);
    return cards;
  }
  function legal(s,a) {
    if (!s || !a || won(s)) return false;
    if (a.type === 'draw') return s.stock.length > 0;
    if (a.type === 'recycle') return s.stock.length === 0 && s.waste.length > 0 && s.redeals < 2;
    if (a.type !== 'remove' || !Array.isArray(a.cards) || ![1,2].includes(a.cards.length) || new Set(a.cards).size !== a.cards.length) return false;
    const p = playable(s);
    return a.cards.every(c => Number.isInteger(c) && p.includes(c)) &&
      (a.cards.length === 1 ? rank(a.cards[0]) === 13 : a.cards.reduce((n,c) => n+rank(c),0) === 13);
  }
  function step(s,a) {
    if (!legal(s,a)) throw Error('不合法的動作');
    const n = {pyramid:s.pyramid.slice(),stock:s.stock.slice(),waste:s.waste.slice(),removed:s.removed.slice(),redeals:s.redeals,moves:s.moves+1};
    if (a.type === 'draw') n.waste.push(n.stock.shift());
    else if (a.type === 'recycle') { n.stock=n.waste.slice(); n.waste=[]; n.redeals++; }
    else a.cards.forEach(c => { const i=n.pyramid.indexOf(c); if(i>=0) n.pyramid[i]=null; else n.waste.pop(); n.removed.push(c); });
    return n;
  }
  const key = s => JSON.stringify([s.pyramid,s.stock,s.waste,s.redeals]);
  function replay(d,actions) {
    if (!Array.isArray(actions) || actions.length > 256) throw Error('紀錄格式錯誤');
    const states=[initial(d)];
    for (const a of actions) states.push(step(states[states.length-1],a));
    return states;
  }
  function proof(d) {
    const states=replay(d,d.witness);
    if(!won(states[states.length-1])) throw Error('解答未完成');
    return states;
  }
  return {rank,children,validDeal,initial,won,exposed,playable,legal,step,key,replay,proof};
});
