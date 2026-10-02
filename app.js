'use strict';
// 新增遊戲：複製一筆資料；完成後將 status 改為 ready，並填入相對路徑 url。
const games = [
  { id: 'number-lab', title: '數字實驗室', category: 'puzzle', description: '滑動合併相同數字，步步累積，挑戰你的 2048。', note: '數字 × 邏輯', art: 'tiles', color: '#c5b3f5', background: '#302b48', word: 'NUMBER LAB', status: 'ready', url: './games/number-lab.html' },
  { id: 'maze-walk', title: '迷宮漫步', category: 'puzzle', description: '穿越隨機生成的迷宮，用觀察找到通往出口的路。', note: '觀察 × 解謎', art: 'maze', color: '#9ac8f3', background: '#25384c', word: 'FIND YOUR WAY', status: 'ready', url: './games/maze-walk.html' },
  { id: 'block-plan', title: '方塊計畫', category: 'strategy', description: '放好每一塊，填滿整行或整列，讓棋盤留住新可能。', note: '佈局 × 思考', art: 'blocks', color: '#e6a396', background: '#49322f', word: 'MAKE YOUR MOVE', status: 'ready', url: './games/block-plan.html' },
  { id: 'memory-match', title: '記憶配對', category: 'puzzle', description: '翻開卡片，記住圖案，以更少步數找齊每一對。', note: '記憶 × 配對', art: 'memory', color: '#edc47e', background: '#443924', word: 'A PERFECT MATCH', status: 'ready', url: './games/memory-match.html' },
  { id: 'tiny-orbit', title: '小小星球', category: 'casual', description: '採集、種植與探索，培育森林，讓星光塔重新發光。', note: '探索 × 放鬆', art: 'planet', color: '#95d7ba', background: '#263d38', word: 'YOUR OWN ORBIT', status: 'ready', url: './games/tiny-orbit.html' },
  { id: 'quick-spark', title: '反應時刻', category: 'casual', description: '等訊號亮起再出手，測試你的反應，別搶跑！', note: '反應 × 專注', art: 'target', color: '#e2a8c5', background: '#402c40', word: 'CATCH THE MOMENT', status: 'ready', url: './games/quick-spark.html' }
];
const categoryNames = { puzzle: '益智解謎', strategy: '策略挑戰', casual: '輕鬆休閒' };
const artMarkup = {
  tiles: '<div class="tiles"><b data-number="2"></b><b data-number="4"></b><b data-number="8"></b><b data-number="16"></b></div>',
  maze: '<div class="maze"></div>',
  blocks: '<div class="blocks"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>',
  memory: '<div class="memory"><i>✦</i><i>✦</i></div>',
  planet: '<div class="planet"></div>',
  target: '<div class="target"></div>'
};
let activeCategory = 'all';
const grid = document.querySelector('#game-grid');
const search = document.querySelector('#search');
const filters = [...document.querySelectorAll('[data-filter]')];
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function gameCard(game, index) {
  const card = element('article', 'card');
  card.style.setProperty('--art-color', game.color);
  card.style.setProperty('--art-bg', game.background);
  const art = element('div', 'card-art');
  art.setAttribute('aria-hidden', 'true');
  art.append(element('div', 'art-pattern'), element('span', 'card-number', `GAME / ${String(index + 1).padStart(2, '0')}`));
  const isReady = game.status === 'ready' && typeof game.url === 'string' && /^\.\/games\/[\w\-/]+(?:\.html)?$/.test(game.url);
  art.append(element('span', 'coming-badge', isReady ? '可以開玩' : 'COMING SOON'));
  const visual = element('div', 'game-art');
  // Only static, developer-controlled artwork templates are inserted as HTML.
  visual.innerHTML = artMarkup[game.art] || artMarkup.blocks;
  art.append(visual, element('span', 'art-word', game.word));
  const content = element('div', 'card-content');
  content.append(element('span', 'category', categoryNames[game.category] || '其他遊戲'), element('h3', '', game.title), element('p', '', game.description));
  const bottom = element('div', 'card-bottom');
  bottom.append(element('small', '', game.note));
  if (isReady) {
    const link = element('a', 'play-link', '開始遊戲 ↗');
    link.href = game.url;
    link.setAttribute('aria-label', `開始遊戲：${game.title}`);
    bottom.append(link);
  } else {
    const button = element('button', '', '敬請期待');
    button.type = 'button';
    button.disabled = true;
    button.setAttribute('aria-label', `${game.title}：概念預覽，尚未開放`);
    bottom.append(button);
  }
  content.append(bottom);
  card.append(art, content);
  return card;
}
function render() {
  const query = search.value.trim().toLocaleLowerCase('zh-Hant');
  const visible = games.filter(game => (activeCategory === 'all' || game.category === activeCategory) && `${game.title} ${game.description} ${game.note} ${game.word} ${categoryNames[game.category]}`.toLocaleLowerCase('zh-Hant').includes(query));
  grid.replaceChildren(...visible.map(game => gameCard(game, games.indexOf(game))));
  document.querySelector('#empty').hidden = visible.length > 0;
  document.querySelector('#results').textContent = `顯示 ${visible.length} 款遊戲 · 隨選隨玩`;
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeCategory)));
  filters[0].querySelector('span').textContent = String(games.length).padStart(2, '0');
}
filters.forEach(button => button.addEventListener('click', () => { activeCategory = button.dataset.filter; render(); }));
search.addEventListener('input', render);
document.querySelector('#reset').addEventListener('click', () => { activeCategory = 'all'; search.value = ''; render(); search.focus(); });
render();
