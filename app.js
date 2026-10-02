'use strict';
const GAME_BUILD = '20261002-logic-500';
// 新增遊戲：複製一筆資料；完成後將 status 改為 ready，並填入相對路徑 url。
const games = [
  { id: 'number-lab', title: '數字實驗室', category: 'puzzle', description: '滑動合併相同數字，步步累積，挑戰你的 2048。', note: '數字 × 邏輯', art: 'tiles', color: '#c5b3f5', background: '#302b48', word: 'NUMBER LAB', status: 'ready', url: './games/number-lab.html' },
  { id: 'maze-walk', title: '迷宮漫步', category: 'puzzle', description: '穿越隨機生成的迷宮，用觀察找到通往出口的路。', note: '觀察 × 解謎', art: 'maze', color: '#9ac8f3', background: '#25384c', word: 'FIND YOUR WAY', status: 'ready', url: './games/maze-walk.html' },
  { id: 'block-plan', title: '方塊計畫', category: 'strategy', description: '放好每一塊，填滿整行或整列，讓棋盤留住新可能。', note: '佈局 × 思考', art: 'blocks', color: '#e6a396', background: '#49322f', word: 'MAKE YOUR MOVE', status: 'ready', url: './games/block-plan.html' },
  { id: 'memory-match', title: '記憶配對', category: 'puzzle', description: '翻開卡片，記住圖案，以更少步數找齊每一對。', note: '記憶 × 配對', art: 'memory', color: '#edc47e', background: '#443924', word: 'A PERFECT MATCH', status: 'ready', url: './games/memory-match.html' },
  { id: 'tiny-orbit', title: '小小星球', category: 'casual', description: '採集、種植與探索，培育森林，讓星光塔重新發光。', note: '探索 × 放鬆', art: 'planet', color: '#95d7ba', background: '#263d38', word: 'YOUR OWN ORBIT', status: 'ready', url: './games/tiny-orbit.html' },
  { id: 'quick-spark', title: '反應時刻', category: 'casual', description: '等訊號亮起再出手，測試你的反應，別搶跑！', note: '反應 × 專注', art: 'target', color: '#e2a8c5', background: '#402c40', word: 'CATCH THE MOMENT', status: 'ready', url: './games/quick-spark.html' },
  {"id": "railway-town", "title": "鐵道物流小鎮", "category": "strategy", "description": "挑戰三章十六合約，經營十五條貨運線、加工工廠與升級車隊。", "note": "鐵道 × 物流", "art": "maze", "color": "#9ac8f3", "background": "#25384c", "word": "RAILWAY TOWN", "status": "ready", "url": "./games/railway-town.html"},
  {"id": "merge-bistro", "title": "合併餐廳", "category": "casual", "description": "合併食材、烹調料理與完成訂單，打造你的夢想小餐館。", "note": "合併 × 經營", "art": "tiles", "color": "#edc47e", "background": "#443924", "word": "MERGE BISTRO", "status": "ready", "url": "./games/merge-bistro.html"},
  {"id": "space-rescue", "title": "太空救援任務", "category": "strategy", "description": "規劃航線與補給，救援失聯太空站，帶著夥伴安全返航。", "note": "航線 × 救援", "art": "planet", "color": "#c5b3f5", "background": "#302b48", "word": "SPACE RESCUE", "status": "ready", "url": "./games/space-rescue.html"},
  {"id": "backpack-dungeon", "title": "地城背包探險", "category": "strategy", "description": "把戰利品塞進有限背包，搭配裝備效果，挑戰地城首領。", "note": "裝備 × 探險", "art": "blocks", "color": "#e6a396", "background": "#49322f", "word": "PACK & EXPLORE", "status": "ready", "url": "./games/backpack-dungeon.html"},
  {"id": "logic-lab", "title": "邏輯機關實驗室", "category": "puzzle", "description": "配置鏡子與光路，用有限零件解開層層機關。", "note": "光路 × 機關", "art": "target", "color": "#e2a8c5", "background": "#402c40", "word": "LOGIC LAB", "status": "ready", "url": "./games/logic-lab.html"},
  {"id": "island-colony", "title": "荒島聚落", "category": "strategy", "description": "安排居民採集與建設，度過季節變化，把營地發展成村莊。", "note": "生存 × 建設", "art": "memory", "color": "#95d7ba", "background": "#263d38", "word": "ISLAND COLONY", "status": "ready", "url": "./games/island-colony.html"},
  {"id": "klondike", "title": "經典接龍", "category": "cards", "description": "每次翻一張，整理紅黑交錯的牌列，挑戰 50 副驗證可解的牌局。", "note": "經典 × 翻一張", "art": "card-klondike", "color": "#9cddc2", "background": "#234138", "word": "KLONDIKE", "status": "ready", "url": "./games/klondike.html"},
  {"id": "freecell", "title": "新接龍", "category": "cards", "description": "善用四個暫存格，規劃每一步，把 52 張牌送回花色收牌區。", "note": "規劃 × 暫存格", "art": "card-freecell", "color": "#a9c9f7", "background": "#263a52", "word": "FREECELL", "status": "ready", "url": "./games/freecell.html"},
  {"id": "spider", "title": "蜘蛛接龍", "category": "cards", "description": "單一花色，十列牌陣，組成 K 到 A 的完整序列逐組收回。", "note": "一色 × 序列", "art": "card-spider", "color": "#cab1f5", "background": "#392c50", "word": "SPIDER", "status": "ready", "url": "./games/spider.html"},
  {"id": "pyramid", "title": "金字塔接龍", "category": "cards", "description": "配對點數合計 13 的牌，層層揭開金字塔，找到清空的路。", "note": "配對 × 合計 13", "art": "card-pyramid", "color": "#edc27d", "background": "#493924", "word": "PYRAMID", "status": "ready", "url": "./games/pyramid.html"},
  {"id": "tripeaks", "title": "三峰接龍", "category": "cards", "description": "接上高一點或低一點的牌，一步步翻開三座高峰，清空牌陣。", "note": "連接 × 三座山峰", "art": "card-tripeaks", "color": "#eab0bd", "background": "#482f3b", "word": "TRIPEAKS", "status": "ready", "url": "./games/tripeaks.html"},
  {"id": "traffic-jam", "title": "塞車棋", "description": "讓車輛沿自身方向滑動，清出通道，送紅車駛向出口。", "note": "交通 × 調度", "art": "board-traffic-jam", "category": "board", "color": "#9ac8f3", "background": "#25384c", "word": "TRAFFIC JAM", "status": "ready", "url": "./games/traffic-jam.html"},
  {"id": "sliding-blocks", "title": "華容道", "description": "挪動大小方塊與有限空格，讓主角穿越擁擠棋盤。", "note": "滑塊 × 佈局", "art": "board-sliding-blocks", "category": "board", "color": "#e6a396", "background": "#49322f", "word": "SLIDING BLOCKS", "status": "ready", "url": "./games/sliding-blocks.html"},
  {"id": "sokoban", "title": "推箱子", "description": "箱子只能推不能拉，把每一箱送到目標，留意死角。", "note": "推箱 × 規劃", "art": "board-sokoban", "category": "board", "color": "#edc47e", "background": "#443924", "word": "SOKOBAN", "status": "ready", "url": "./games/sokoban.html"},
  {"id": "peg-solitaire", "title": "獨立鑽石", "description": "跳過棋子並移除，步步規劃，讓棋盤最後只留一枚。", "note": "跳躍 × 推演", "art": "board-peg-solitaire", "category": "board", "color": "#c5b3f5", "background": "#302b48", "word": "PEG SOLITAIRE", "status": "ready", "url": "./games/peg-solitaire.html"},
  {"id": "lights-out", "title": "熄燈棋", "description": "一次切換自己與鄰格，找出能將整片燈光熄滅的組合。", "note": "切換 × 邏輯", "art": "board-lights-out", "category": "board", "color": "#95d7ba", "background": "#263d38", "word": "LIGHTS OUT", "status": "ready", "url": "./games/lights-out.html"},
  {"id": "ice-slide", "title": "冰面滑行棋", "description": "一路滑到障礙才停，用其他棋子作擋板，精準抵達目標。", "note": "滑行 × 協作", "art": "board-ice-slide", "category": "board", "color": "#9ac8f3", "background": "#25384c", "word": "ICE SLIDE", "status": "ready", "url": "./games/ice-slide.html"},
  {"id": "bridges", "title": "橋梁連線", "description": "依數字架橋，避免交叉，把所有島嶼連成一體。", "note": "島嶼 × 連線", "art": "board-bridges", "category": "board", "color": "#e6a396", "background": "#49322f", "word": "BRIDGES", "status": "ready", "url": "./games/bridges.html"},
  {"id": "tents", "title": "帳篷與樹", "description": "為樹木安排帳篷，符合行列數量，也留出彼此的距離。", "note": "營地 × 推理", "art": "board-tents", "category": "board", "color": "#edc47e", "background": "#443924", "word": "TENTS", "status": "ready", "url": "./games/tents.html"},
  {"id": "slitherlink", "title": "數字環線", "description": "沿格線畫出唯一封閉環，讓每個數字的邊數恰好吻合。", "note": "環線 × 推理", "art": "board-slitherlink", "category": "board", "color": "#c5b3f5", "background": "#302b48", "word": "SLITHERLINK", "status": "ready", "url": "./games/slitherlink.html"},
  {"id": "polyomino", "title": "多格拼板", "description": "旋轉與翻轉不同拼片，完整填滿棋盤，不重疊也不留空。", "note": "拼片 × 空間", "art": "board-polyomino", "category": "board", "color": "#95d7ba", "background": "#263d38", "word": "POLYOMINO", "status": "ready", "url": "./games/polyomino.html"},
  {"id": "nonogram", "title": "數繪", "description": "從行列數字推算連續色塊，慢慢揭開像素圖案。", "note": "填格 × 圖像", "art": "logic-nonogram", "category": "logic", "color": "#a5d6bf", "background": "#263d38", "word": "NONOGRAM", "status": "ready", "url": "./games/nonogram.html"},
  {"id": "nurikabe", "title": "數牆", "description": "將島嶼分開，用連通海水包圍每座指定面積的小島。", "note": "島嶼 × 邊界", "art": "logic-nurikabe", "category": "logic", "color": "#a7cff3", "background": "#25384c", "word": "NURIKABE", "status": "ready", "url": "./games/nurikabe.html"},
  {"id": "magnets", "title": "磁鐵棋", "description": "安排正負磁極，符合行列數量，避免同極相鄰。", "note": "磁極 × 排列", "art": "logic-magnets", "category": "logic", "color": "#e6a6ad", "background": "#49323a", "word": "MAGNETS", "status": "ready", "url": "./games/magnets.html"},
  {"id": "battleships", "title": "戰艦定位", "description": "依行列線索找出整支艦隊，艦艇之間不能碰觸。", "note": "艦隊 × 搜索", "art": "logic-battleships", "category": "logic", "color": "#b2c8ee", "background": "#2b354c", "word": "BATTLESHIPS", "status": "ready", "url": "./games/battleships.html"},
  {"id": "futoshiki", "title": "不等式數獨", "description": "填入不重複的數字，讓每一個大於、小於關係成立。", "note": "數字 × 比較", "art": "logic-futoshiki", "category": "logic", "color": "#d0b8f3", "background": "#382d4b", "word": "FUTOSHIKI", "status": "ready", "url": "./games/futoshiki.html"},
  {"id": "kakuro", "title": "數和", "description": "交叉填入數字，組成線索總和，每段不得重複。", "note": "加法 × 交叉", "art": "logic-kakuro", "category": "logic", "color": "#edc480", "background": "#443924", "word": "KAKURO", "status": "ready", "url": "./games/kakuro.html"},
  {"id": "masyu", "title": "黑白圓圈環線", "description": "穿過黑白珍珠畫出單一閉環，遵守轉彎與直行規則。", "note": "珍珠 × 環線", "art": "logic-masyu", "category": "logic", "color": "#d3d6e0", "background": "#333847", "word": "MASYU", "status": "ready", "url": "./games/masyu.html"},
  {"id": "net", "title": "旋轉水管", "description": "旋轉線路拼片，將每個節點接上中心，完成無環網路。", "note": "旋轉 × 連通", "art": "logic-net", "category": "logic", "color": "#96d8ce", "background": "#263e3b", "word": "NET", "status": "ready", "url": "./games/net.html"},
  {"id": "black-box", "title": "棋盤雷射", "description": "從邊界射入光線，根據吸收、反射與出口推算隱藏原子。", "note": "光線 × 推理", "art": "logic-black-box", "category": "logic", "color": "#b3b8f1", "background": "#30334e", "word": "BLACK BOX", "status": "ready", "url": "./games/black-box.html"},
  {"id": "skyscrapers", "title": "天際線", "description": "安排不同高度的樓群，讓每一側看見的棟數吻合。", "note": "視角 × 高度", "art": "logic-skyscrapers", "category": "logic", "color": "#efb08e", "background": "#49372d", "word": "SKYSCRAPERS", "status": "ready", "url": "./games/skyscrapers.html"}
];
const categoryNames = { puzzle: '益智解謎', strategy: '策略挑戰', casual: '輕鬆休閒', cards: '接龍牌桌', board: '益智棋盤', logic: '邏輯推理' };
const artMarkup = {
  "logic-nonogram": "<div class=\"logic-art logic-nonogram\"><b>1 3 1</b><div><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>",
  "logic-nurikabe": "<div class=\"logic-art logic-nurikabe\"><i>2</i><i></i><i></i><i>3</i><i></i><i></i><i></i><i></i><i></i><i>1</i><i></i><i></i><i></i><i></i><i></i><i></i></div>",
  "logic-magnets": "<div class=\"logic-art logic-magnets\"><i><b>+</b><b>\u2212</b></i><i><b>\u2212</b><b>+</b></i><i><b>+</b><b>\u2212</b></i></div>",
  "logic-battleships": "<div class=\"logic-art logic-ships\"><i></i><i></i><i></i><b>2\u30001\u30003</b></div>",
  "logic-futoshiki": "<div class=\"logic-art logic-futoshiki\"><i>1</i><b>\uff1c</b><i>3</i><b>\u2228</b><b></b><b>\u2227</b><i>2</i><b>\uff1e</b><i>1</i></div>",
  "logic-kakuro": "<div class=\"logic-art logic-kakuro\"><b>\u2198 7</b><b>\u2199 6</b><b>4</b><i>1</i><i>3</i><b>9</b><i>5</i><i>4</i></div>",
  "logic-masyu": "<div class=\"logic-art logic-masyu\"><i></i><i></i><i></i><i></i></div>",
  "logic-net": "<div class=\"logic-art logic-net\"><i>\u250c</i><i>\u2534</i><i>\u2510</i><i>\u2514</i><b>\u2726</b><i>\u2524</i><i>\u2576</i><i>\u252c</i><i>\u2518</i></div>",
  "logic-black-box": "<div class=\"logic-art logic-blackbox\"><b>\u2198</b><i>?</i><i>?</i><b>\u2197</b></div>",
  "logic-skyscrapers": "<div class=\"logic-art logic-sky\"><i>1</i><i>3</i><i>2</i><i>4</i><b>2 \u2192</b></div>",
  'board-traffic-jam': '<div class="mini-board mini-traffic"><i></i><i></i><i></i><i></i><b>→</b></div>',
  'board-sliding-blocks': '<div class="mini-board mini-slide"><i></i><i></i><i></i><i></i><i></i></div>',
  'board-sokoban': '<div class="mini-board mini-sokoban"><i>✚</i><i>▣</i><i>●</i><i>▣</i><i>✚</i></div>',
  'board-peg-solitaire': '<div class="mini-board mini-peg"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>',
  'board-lights-out': '<div class="mini-board mini-lights"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>',
  'board-ice-slide': '<div class="mini-board mini-ice"><i>1</i><i>2</i><i>3</i><b>◎</b></div>',
  'board-bridges': '<div class="mini-board mini-bridges"><i>2</i><i>3</i><i>2</i><i>3</i></div>',
  'board-tents': '<div class="mini-board mini-tents"><i>♠</i><b>△</b><i>♠</i><b>△</b></div>',
  'board-slitherlink': '<div class="mini-board mini-loop"><i>3</i><i>2</i><i>2</i><i>3</i></div>',
  'board-polyomino': '<div class="mini-board mini-poly"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>',

  tiles: '<div class="tiles"><b data-number="2"></b><b data-number="4"></b><b data-number="8"></b><b data-number="16"></b></div>',
  maze: '<div class="maze"></div>',
  blocks: '<div class="blocks"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>',
  memory: '<div class="memory"><i>✦</i><i>✦</i></div>',
  planet: '<div class="planet"></div>',
  target: '<div class="target"></div>',
  'card-klondike': '<div class="playing-art fan-cards"><i><b>K</b><span>♠</span></i><i><b>Q</b><span>♥</span></i><i><b>J</b><span>♣</span></i></div>',
  'card-freecell': '<div class="playing-art free-cards"><em></em><em></em><i><b>A</b><span>♠</span></i><i><b>2</b><span>♦</span></i></div>',
  'card-spider': '<div class="playing-art spider-cards"><i><b>K</b><span>♠</span></i><i><b>Q</b><span>♠</span></i><i><b>J</b><span>♠</span></i><small>8 × K → A</small></div>',
  'card-pyramid': '<div class="playing-art pyramid-cards"><i><b>K</b><span>♦</span></i><i><b>6</b><span>♠</span></i><i><b>7</b><span>♥</span></i></div>',
  'card-tripeaks': '<div class="playing-art peaks-cards"><i><b>4</b><span>♠</span></i><i><b>5</b><span>♥</span></i><i><b>6</b><span>♣</span></i><em>↗</em></div>'
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
  art.append(element('span', 'coming-badge', isReady ? (game.category === 'logic' ? '50 關 · 唯一解' : game.category === 'board' ? '50 關 · 驗證可解' : '可以開玩') : 'COMING SOON'));
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
    link.href = `${game.url}?v=${encodeURIComponent(GAME_BUILD)}`;
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
