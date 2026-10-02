'use strict';
const GAME_BUILD = '20261002-categories';
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
  {"id": "skyscrapers", "title": "天際線", "description": "安排不同高度的樓群，讓每一側看見的棟數吻合。", "note": "視角 × 高度", "art": "logic-skyscrapers", "category": "logic", "color": "#efb08e", "background": "#49372d", "word": "SKYSCRAPERS", "status": "ready", "url": "./games/skyscrapers.html"} ,
  {"id": "sudoku", "title": "數獨", "category": "classic", "description": "從迷你盤面挑戰到九宮格，讓行、列與宮內的數字不重複。", "note": "九宮 × 推理", "art": "classic-sudoku", "color": "#cab7f0", "background": "#352e48", "word": "SUDOKU", "status": "ready", "url": "./games/sudoku.html", "badge": "50 關 · 唯一解"},
  {"id": "minesweeper", "title": "踩地雷", "category": "classic", "description": "從已知起點展開數字，以邏輯排除地雷，50 關都不必猜。", "note": "數字 × 排雷", "art": "classic-minesweeper", "color": "#abd6bf", "background": "#273d35", "word": "MINESWEEPER", "status": "ready", "url": "./games/minesweeper.html", "badge": "50 關 · 不必猜"},
  {"id": "fifteen-puzzle", "title": "十五數字拼圖", "category": "classic", "description": "從九宮格練習到十五塊方片，借一格空位將數字逐一歸位。", "note": "滑動 × 排序", "art": "classic-fifteen-puzzle", "color": "#efc388", "background": "#443725", "word": "FIFTEEN PUZZLE", "status": "ready", "url": "./games/fifteen-puzzle.html", "badge": "50 關 · 驗證可解"},
  {"id": "hanoi", "title": "漢諾塔", "category": "classic", "description": "一次搬一片，小片不能壓在大片下方，規劃到達目標的路。", "note": "圓盤 × 規劃", "art": "classic-hanoi", "color": "#a8c8f1", "background": "#29384b", "word": "TOWER OF HANOI", "status": "ready", "url": "./games/hanoi.html", "badge": "50 關 · 驗證可解"},
  {"id": "mastermind", "title": "猜密碼", "category": "classic", "description": "讀懂已給定的黑白回饋，組合線索，推理唯一的隱藏密碼。", "note": "色碼 × 推演", "art": "classic-mastermind", "color": "#eab0c6", "background": "#472e3b", "word": "MASTERMIND", "status": "ready", "url": "./games/mastermind.html", "badge": "50 關 · 唯一密碼"},
  {"id": "akari", "title": "燈泡棋", "category": "classic", "description": "用燈泡照亮每個白格，符合牆上數字，燈泡不能互相照見。", "note": "光線 × 佈局", "art": "classic-akari", "color": "#eed791", "background": "#443d27", "word": "AKARI", "status": "ready", "url": "./games/akari.html", "badge": "50 關 · 唯一解"},
  {"id": "hitori", "title": "一人一格", "category": "classic", "description": "塗黑重複數字，黑格不能相鄰，留下連通的白色棋盤。", "note": "去重 × 連通", "art": "classic-hitori", "color": "#d8c9bb", "background": "#3f3833", "word": "HITORI", "status": "ready", "url": "./games/hitori.html", "badge": "50 關 · 唯一解"},
  {"id": "shikaku", "title": "矩形分割", "category": "classic", "description": "按數字劃出矩形，每區恰有一個線索，面積與數字相同。", "note": "矩形 × 面積", "art": "classic-shikaku", "color": "#a7d9d1", "background": "#283f3c", "word": "SHIKAKU", "status": "ready", "url": "./games/shikaku.html", "badge": "50 關 · 唯一解"},
  {"id": "numberlink", "title": "數字連線", "category": "classic", "description": "連接成對的數字，路徑不能交叉，讓每一格都有歸屬。", "note": "路徑 × 配對", "art": "classic-numberlink", "color": "#b4bdf0", "background": "#30364d", "word": "NUMBERLINK", "status": "ready", "url": "./games/numberlink.html", "badge": "50 關 · 唯一解"},
  {"id": "star-battle", "title": "星星戰棋", "category": "classic", "description": "讓行、列與區域各擁有指定星星，星星彼此不能接觸。", "note": "星星 × 區域", "art": "classic-star-battle", "color": "#edb799", "background": "#463429", "word": "STAR BATTLE", "status": "ready", "url": "./games/star-battle.html", "badge": "50 關 · 唯一解"},
  {"id": "mahjong-solitaire", "title": "麻將接龍", "category": "collection", "description": "配對露出且至少一側開放的相同牌，逐層清空立體牌陣。", "note": "配對 × 層次", "art": "collection-mahjong-solitaire", "color": "#e8d6aa", "background": "#433d2d", "word": "MAHJONG SOLITAIRE", "status": "ready", "url": "./games/mahjong-solitaire.html", "badge": "50 關 · 驗證可解"},
  {"id": "tangram", "title": "七巧板", "category": "collection", "description": "旋轉、翻轉七片幾何拼板，精準拼滿每個目標輪廓。", "note": "幾何 × 拼合", "art": "collection-tangram", "color": "#f0b896", "background": "#483529", "word": "TANGRAM", "status": "ready", "url": "./games/tangram.html", "badge": "50 關 · 驗證可解"},
  {"id": "samegame", "title": "同色消除", "category": "collection", "description": "選擇相鄰同色方塊一起消除，利用重力與收攏清空棋盤。", "note": "色塊 × 預判", "art": "collection-samegame", "color": "#d5a5e8", "background": "#3d2d46", "word": "SAMEGAME", "status": "ready", "url": "./games/samegame.html", "badge": "50 關 · 驗證可解"},
  {"id": "untangle", "title": "解開繩結", "category": "collection", "description": "移動網路節點，讓所有線段不再交叉，還原清楚的連線。", "note": "節點 × 空間", "art": "collection-untangle", "color": "#a9d8dd", "background": "#283d42", "word": "UNTANGLE", "status": "ready", "url": "./games/untangle.html", "badge": "50 關 · 驗證可解"},
  {"id": "dominosa", "title": "多米諾配對", "category": "collection", "description": "將數字棋盤分成骨牌，每種無序數字組合恰好使用一次。", "note": "骨牌 × 配對", "art": "collection-dominosa", "color": "#c4bcf0", "background": "#353247", "word": "DOMINOSA", "status": "ready", "url": "./games/dominosa.html", "badge": "50 關 · 唯一解"},
  {"id": "unruly", "title": "黑白平衡", "category": "collection", "description": "平衡兩種顏色的行列數量，避免連續三格同色。", "note": "平衡 × 排除", "art": "collection-unruly", "color": "#e7c591", "background": "#453c2d", "word": "UNRULY", "status": "ready", "url": "./games/unruly.html", "badge": "50 關 · 唯一解"},
  {"id": "keen", "title": "算術方格", "category": "collection", "description": "行列填入不重複數字，讓每一籠的四則運算符合目標。", "note": "算術 × 方格", "art": "collection-keen", "color": "#afd4ab", "background": "#303f30", "word": "KEEN", "status": "ready", "url": "./games/keen.html", "badge": "50 關 · 唯一解"},
  {"id": "galaxies", "title": "旋轉星系", "category": "collection", "description": "依星系中心畫出連通區域，每區都保持半圈旋轉對稱。", "note": "星系 × 對稱", "art": "collection-galaxies", "color": "#b0c9ef", "background": "#2c384b", "word": "GALAXIES", "status": "ready", "url": "./games/galaxies.html", "badge": "50 關 · 唯一解"},
  {"id": "signpost", "title": "箭頭接龍", "category": "collection", "description": "順著八方向箭頭連接全部格子，排成從起點到終點的數列。", "note": "箭頭 × 順序", "art": "collection-signpost", "color": "#e8abc1", "background": "#462f3b", "word": "SIGNPOST", "status": "ready", "url": "./games/signpost.html", "badge": "50 關 · 唯一解"},
  {"id": "fillomino", "title": "數字分區", "category": "collection", "description": "分出連通區塊，數字等於區域大小，同尺寸區域不能相連。", "note": "區域 × 數字", "art": "collection-fillomino", "color": "#aadad0", "background": "#293f3a", "word": "FILLOMINO", "status": "ready", "url": "./games/fillomino.html", "badge": "50 關 · 唯一解"} ,
  {"id": "reversi", "title": "黑白棋", "category": "tabletop", "description": "夾住對手棋子翻成己色，掌握角落與行動空間。", "note": "翻轉 × 角落", "art": "tabletop-reversi", "color": "#a8d8c0", "background": "#263e35", "word": "REVERSI", "status": "ready", "url": "./games/reversi.html", "badge": "多人 · AI 三種難度"},
  {"id": "gomoku", "title": "五子棋", "category": "tabletop", "description": "攻守兼顧，在十五路棋盤連成五子，搶先布局。", "note": "連五 × 攻防", "art": "tabletop-gomoku", "color": "#e9c38e", "background": "#443a29", "word": "GOMOKU", "status": "ready", "url": "./games/gomoku.html", "badge": "多人 · AI 三種難度"},
  {"id": "connect-four", "title": "四子棋", "category": "tabletop", "description": "選一欄落下棋子，橫、直或斜向連成四子。", "note": "重力 × 連線", "art": "tabletop-connect-four", "color": "#a7c9f2", "background": "#293b53", "word": "CONNECT FOUR", "status": "ready", "url": "./games/connect-four.html", "badge": "多人 · AI 三種難度"},
  {"id": "checkers", "title": "西洋跳棋", "category": "tabletop", "description": "斜走、連跳與升王，算準吃子路線，突破對手。", "note": "連跳 × 升王", "art": "tabletop-checkers", "color": "#e5acaa", "background": "#472f35", "word": "CHECKERS", "status": "ready", "url": "./games/checkers.html", "badge": "多人 · AI 三種難度"},
  {"id": "chinese-checkers", "title": "中國跳棋", "category": "tabletop", "description": "跨過相鄰棋子接力跳躍，把隊伍送進對面的營地。", "note": "跳躍 × 競速", "art": "tabletop-chinese-checkers", "color": "#c8b2f0", "background": "#382e4b", "word": "CHINESE CHECKERS", "status": "ready", "url": "./games/chinese-checkers.html", "badge": "多人 · AI 三種難度"},
  {"id": "aeroplane-chess", "title": "飛行棋", "category": "tabletop", "description": "擲骰起飛、追趕與返航，和朋友同機輪流競賽。", "note": "擲骰 × 返航", "art": "tabletop-aeroplane-chess", "color": "#a2d8d9", "background": "#294044", "word": "AEROPLANE CHESS", "status": "ready", "url": "./games/aeroplane-chess.html", "badge": "多人 · AI 三種難度"},
  {"id": "kalah", "title": "播棋", "category": "tabletop", "description": "將棋子逐穴播下，爭取再走一步與巧妙捕獲。", "note": "播種 × 收集", "art": "tabletop-kalah", "color": "#e6c68c", "background": "#453b29", "word": "KALAH", "status": "ready", "url": "./games/kalah.html", "badge": "多人 · AI 三種難度"},
  {"id": "nine-mens-morris", "title": "九子棋", "category": "tabletop", "description": "布子、移子並連成三子直線，逐步削弱對手。", "note": "成磨 × 移子", "art": "tabletop-nine-mens-morris", "color": "#c1c9eb", "background": "#30394c", "word": "NINE MEN’S MORRIS", "status": "ready", "url": "./games/nine-mens-morris.html", "badge": "多人 · AI 三種難度"},
  {"id": "quoridor", "title": "步步為營", "category": "tabletop", "description": "前進與築牆交替，保留通路，率先走到對岸。", "note": "築牆 × 路徑", "art": "tabletop-quoridor", "color": "#a9d6a7", "background": "#2e402f", "word": "QUORIDOR", "status": "ready", "url": "./games/quoridor.html", "badge": "多人 · AI 三種難度"},
  {"id": "quarto", "title": "四連特徵棋", "category": "tabletop", "description": "由你挑子交給對手，四枚棋子的共同特徵就是勝機。", "note": "選子 × 特徵", "art": "tabletop-quarto", "color": "#dfb2de", "background": "#442f46", "word": "QUARTO", "status": "ready", "url": "./games/quarto.html", "badge": "多人 · AI 三種難度"},
  {"id": "xiangqi", "title": "象棋", "category": "tabletop", "description": "車馬炮越過楚河漢界，保護己方將帥，步步布局逼出勝機。", "note": "楚河 × 將帥", "art": "tabletop-xiangqi", "color": "#edb993", "background": "#49352b", "word": "XIANGQI", "status": "ready", "url": "./games/xiangqi.html", "badge": "雙人 · AI 三種難度"},
  {"id": "banqi", "title": "暗棋", "category": "tabletop", "description": "翻開棋子分定紅黑，掌握大小吃子與炮的跳吃，步步揭開勝機。", "note": "翻棋 × 推算", "art": "tabletop-banqi", "color": "#d6b8ed", "background": "#3d2f49", "word": "BANQI", "status": "ready", "url": "./games/banqi.html", "badge": "雙人 · AI 三種難度"},
  {"id": "air-traffic", "title": "空中指揮所", "category": "strategy", "description": "拖曳畫航線，指揮進場與離場航班，帶每一架飛機安全回家。", "note": "航線 × 調度", "art": "air-traffic", "color": "#a8e5dc", "background": "#203f47", "word": "AIR TRAFFIC CONTROL", "status": "ready", "url": "./games/air-traffic.html", "badge": "8 張地圖 · 即時指揮"}
];
const categoryNames = { puzzle: '益智解謎', strategy: '策略挑戰', casual: '輕鬆休閒', cards: '接龍牌桌', board: '益智棋盤', logic: '邏輯推理', classic: '經典益智', collection: '經典新挑戰', tabletop: '多人棋桌' };
const artMarkup = {
  "air-traffic": "<svg class=\"air-traffic-art\" viewBox=\"0 0 160 130\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M9 109C26 72 50 103 59 67S108 64 153 19\" fill=\"none\" stroke=\"#a8e5dc\" stroke-width=\"2\" stroke-dasharray=\"5 5\" opacity=\".6\"/><circle cx=\"78\" cy=\"68\" r=\"52\" fill=\"#a8e5dc08\" stroke=\"currentColor\" opacity=\".35\"/><circle cx=\"78\" cy=\"68\" r=\"34\" fill=\"none\" stroke=\"currentColor\" opacity=\".2\"/><path d=\"M26 68h104M78 16v104\" stroke=\"currentColor\" opacity=\".15\"/><g transform=\"translate(58 79) rotate(-24)\"><rect x=\"-7\" y=\"-20\" width=\"14\" height=\"61\" rx=\"3\" fill=\"#182d37\" stroke=\"#d9e9d0\"/><path d=\"M0-15v49\" stroke=\"#d9e9d0\" stroke-width=\"2\" stroke-dasharray=\"6 6\"/><path d=\"M-11 19h4M7 19h4M-11 31h4M7 31h4\" stroke=\"#d2f86a\" stroke-width=\"2\"/></g><g transform=\"translate(97 36) rotate(32)\"><path d=\"M0-16 4-3 18 5 18 10 3 6 3 15 9 19 9 22 0 19-9 22-9 19-3 15-3 6-18 10-18 5-4-3Z\" fill=\"#e6f9f3\" stroke=\"#193a40\" stroke-width=\"1.5\"/><circle cy=\"1\" r=\"25\" fill=\"none\" stroke=\"#d2f86a\" opacity=\".45\"/></g><path d=\"m132 92 4 9 11 4-11 3-4 10-3-10-10-3 10-4Z\" fill=\"#f1cc8c\"/><circle cx=\"16\" cy=\"26\" r=\"3\" fill=\"#d2f86a\"/><circle cx=\"148\" cy=\"65\" r=\"2\" fill=\"#a8e5dc\"/></svg>",
  "tabletop-xiangqi": "<svg class=\"tabletop-art\" viewBox=\"0 0 144 128\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"20\" y=\"8\" width=\"104\" height=\"112\" rx=\"5\" fill=\"#b48a5520\" stroke=\"currentColor\"/><path d=\"M33 16v39m0 19v38M59 16v39m0 19v38M85 16v39m0 19v38M111 16v39m0 19v38M20 29h104M20 55h104M20 74h104M20 99h104\" stroke=\"currentColor\" opacity=\".4\"/><text x=\"72\" y=\"69\" text-anchor=\"middle\" font-family=\"serif\" font-size=\"10\" fill=\"currentColor\">楚河　漢界</text><circle cx=\"59\" cy=\"29\" r=\"14\" fill=\"#f5dfb8\" stroke=\"#29313b\" stroke-width=\"2\"/><text x=\"59\" y=\"34\" text-anchor=\"middle\" font-family=\"serif\" font-weight=\"700\" font-size=\"15\" fill=\"#29313b\">將</text><circle cx=\"85\" cy=\"99\" r=\"14\" fill=\"#f5dfb8\" stroke=\"#a3433f\" stroke-width=\"2\"/><text x=\"85\" y=\"104\" text-anchor=\"middle\" font-family=\"serif\" font-weight=\"700\" font-size=\"15\" fill=\"#a3433f\">帥</text><circle cx=\"33\" cy=\"74\" r=\"14\" fill=\"#f5dfb8\" stroke=\"#a3433f\" stroke-width=\"2\"/><text x=\"33\" y=\"79\" text-anchor=\"middle\" font-family=\"serif\" font-weight=\"700\" font-size=\"15\" fill=\"#a3433f\">馬</text></svg>",
  "tabletop-banqi": "<svg class=\"tabletop-art\" viewBox=\"0 0 144 128\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"12\" y=\"24\" width=\"120\" height=\"80\" rx=\"9\" fill=\"#ffffff08\" stroke=\"currentColor\"/><path d=\"M42 24v80M72 24v80M102 24v80M12 64h120\" stroke=\"currentColor\" opacity=\".25\"/><circle cx=\"27\" cy=\"44\" r=\"12\" fill=\"#755777\" stroke=\"#d6b8ed\"/><path d=\"M21 44h12M27 38v12\" stroke=\"#d6b8ed\" opacity=\".5\"/><circle cx=\"87\" cy=\"44\" r=\"12\" fill=\"#755777\" stroke=\"#d6b8ed\"/><path d=\"M81 44h12M87 38v12\" stroke=\"#d6b8ed\" opacity=\".5\"/><circle cx=\"117\" cy=\"44\" r=\"12\" fill=\"#755777\" stroke=\"#d6b8ed\"/><path d=\"M111 44h12M117 38v12\" stroke=\"#d6b8ed\" opacity=\".5\"/><circle cx=\"57\" cy=\"84\" r=\"12\" fill=\"#755777\" stroke=\"#d6b8ed\"/><path d=\"M51 84h12M57 78v12\" stroke=\"#d6b8ed\" opacity=\".5\"/><circle cx=\"87\" cy=\"84\" r=\"12\" fill=\"#755777\" stroke=\"#d6b8ed\"/><path d=\"M81 84h12M87 78v12\" stroke=\"#d6b8ed\" opacity=\".5\"/><circle cx=\"57\" cy=\"44\" r=\"14\" fill=\"#f5dfb8\" stroke=\"#a3433f\" stroke-width=\"2\"/><text x=\"57\" y=\"49\" text-anchor=\"middle\" font-family=\"serif\" font-weight=\"700\" font-size=\"15\" fill=\"#a3433f\">炮</text><circle cx=\"27\" cy=\"84\" r=\"14\" fill=\"#f5dfb8\" stroke=\"#29313b\" stroke-width=\"2\"/><text x=\"27\" y=\"89\" text-anchor=\"middle\" font-family=\"serif\" font-weight=\"700\" font-size=\"15\" fill=\"#29313b\">卒</text><path d=\"M112 89q18 -8 11 -25\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"m120 67 3-5 4 4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>",

  "tabletop-reversi": "<svg class=\"tabletop-art\" viewBox=\"0 0 144 128\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"22\" y=\"15\" width=\"100\" height=\"100\" rx=\"6\" fill=\"#ffffff08\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M47 15v100 M22 40h100\" stroke=\"currentColor\" opacity=\".35\"/><path d=\"M72 15v100 M22 65h100\" stroke=\"currentColor\" opacity=\".35\"/><path d=\"M97 15v100 M22 90h100\" stroke=\"currentColor\" opacity=\".35\"/><circle cx=\"59\" cy=\"52\" r=\"10\" fill=\"#f2eee1\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"84\" cy=\"77\" r=\"10\" fill=\"#f2eee1\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"84\" cy=\"52\" r=\"10\" fill=\"#18252b\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"59\" cy=\"77\" r=\"10\" fill=\"#18252b\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"34\" cy=\"27\" r=\"10\" fill=\"#18252b\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><path d=\"M24 116h94\" stroke=\"currentColor\" stroke-width=\"4\"/></svg>",
  "tabletop-gomoku": "<svg class=\"tabletop-art\" viewBox=\"0 0 144 128\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"16\" y=\"10\" width=\"108\" height=\"108\" rx=\"6\" fill=\"#ffffff08\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M34 10v108 M16 28h108\" stroke=\"currentColor\" opacity=\".35\"/><path d=\"M52 10v108 M16 46h108\" stroke=\"currentColor\" opacity=\".35\"/><path d=\"M70 10v108 M16 64h108\" stroke=\"currentColor\" opacity=\".35\"/><path d=\"M88 10v108 M16 82h108\" stroke=\"currentColor\" opacity=\".35\"/><path d=\"M106 10v108 M16 100h108\" stroke=\"currentColor\" opacity=\".35\"/><circle cx=\"34\" cy=\"28\" r=\"7\" fill=\"#222029\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"52\" cy=\"46\" r=\"7\" fill=\"#222029\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"70\" cy=\"64\" r=\"7\" fill=\"#222029\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"88\" cy=\"82\" r=\"7\" fill=\"#222029\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"106\" cy=\"100\" r=\"7\" fill=\"#222029\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"52\" cy=\"28\" r=\"7\" fill=\"#eee5cd\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"70\" cy=\"46\" r=\"7\" fill=\"#eee5cd\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"88\" cy=\"64\" r=\"7\" fill=\"#eee5cd\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"106\" cy=\"82\" r=\"7\" fill=\"#eee5cd\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/></svg>",
  "tabletop-connect-four": "<svg class=\"tabletop-art\" viewBox=\"0 0 144 128\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"13\" y=\"19\" width=\"118\" height=\"90\" rx=\"8\" fill=\"currentColor\" opacity=\".8\"/><circle cx=\"29\" cy=\"35\" r=\"8\" fill=\"#243445\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"50\" cy=\"35\" r=\"8\" fill=\"#243445\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"71\" cy=\"35\" r=\"8\" fill=\"#243445\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"92\" cy=\"35\" r=\"8\" fill=\"#243445\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"113\" cy=\"35\" r=\"8\" fill=\"#243445\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"29\" cy=\"56\" r=\"8\" fill=\"#243445\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"50\" cy=\"56\" r=\"8\" fill=\"#243445\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"71\" cy=\"56\" r=\"8\" fill=\"#eab58d\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"92\" cy=\"56\" r=\"8\" fill=\"#eee7cc\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"113\" cy=\"56\" r=\"8\" fill=\"#eab58d\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"29\" cy=\"77\" r=\"8\" fill=\"#eee7cc\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"50\" cy=\"77\" r=\"8\" fill=\"#eab58d\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"71\" cy=\"77\" r=\"8\" fill=\"#eee7cc\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"92\" cy=\"77\" r=\"8\" fill=\"#eab58d\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"113\" cy=\"77\" r=\"8\" fill=\"#eee7cc\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"29\" cy=\"98\" r=\"8\" fill=\"#eab58d\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"50\" cy=\"98\" r=\"8\" fill=\"#eee7cc\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"71\" cy=\"98\" r=\"8\" fill=\"#eab58d\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"92\" cy=\"98\" r=\"8\" fill=\"#eee7cc\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"113\" cy=\"98\" r=\"8\" fill=\"#eab58d\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/></svg>",
  "tabletop-checkers": "<svg class=\"tabletop-art\" viewBox=\"0 0 144 128\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"20\" y=\"14\" width=\"25\" height=\"25\" fill=\"#583d43\"/><rect x=\"45\" y=\"14\" width=\"25\" height=\"25\" fill=\"#f2dbc7\"/><rect x=\"70\" y=\"14\" width=\"25\" height=\"25\" fill=\"#583d43\"/><rect x=\"95\" y=\"14\" width=\"25\" height=\"25\" fill=\"#f2dbc7\"/><rect x=\"20\" y=\"39\" width=\"25\" height=\"25\" fill=\"#f2dbc7\"/><rect x=\"45\" y=\"39\" width=\"25\" height=\"25\" fill=\"#583d43\"/><rect x=\"70\" y=\"39\" width=\"25\" height=\"25\" fill=\"#f2dbc7\"/><rect x=\"95\" y=\"39\" width=\"25\" height=\"25\" fill=\"#583d43\"/><rect x=\"20\" y=\"64\" width=\"25\" height=\"25\" fill=\"#583d43\"/><rect x=\"45\" y=\"64\" width=\"25\" height=\"25\" fill=\"#f2dbc7\"/><rect x=\"70\" y=\"64\" width=\"25\" height=\"25\" fill=\"#583d43\"/><rect x=\"95\" y=\"64\" width=\"25\" height=\"25\" fill=\"#f2dbc7\"/><rect x=\"20\" y=\"89\" width=\"25\" height=\"25\" fill=\"#f2dbc7\"/><rect x=\"45\" y=\"89\" width=\"25\" height=\"25\" fill=\"#583d43\"/><rect x=\"70\" y=\"89\" width=\"25\" height=\"25\" fill=\"#f2dbc7\"/><rect x=\"95\" y=\"89\" width=\"25\" height=\"25\" fill=\"#583d43\"/><circle cx=\"57.5\" cy=\"26.5\" r=\"10\" fill=\"#bf7376\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"107.5\" cy=\"26.5\" r=\"10\" fill=\"#bf7376\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"82.5\" cy=\"51.5\" r=\"10\" fill=\"#bf7376\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"57.5\" cy=\"76.5\" r=\"10\" fill=\"#eee2c6\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><text x=\"57.5\" y=\"82\" font-size=\"17\" text-anchor=\"middle\" fill=\"#5b4149\">\u265b</text></svg>",
  "tabletop-chinese-checkers": "<svg class=\"tabletop-art\" viewBox=\"0 0 144 128\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M72 5L92 40H132L112 64L132 89H92L72 124L52 89H12L32 64L12 40H52Z\" fill=\"#ffffff0b\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"72\" cy=\"24\" r=\"7\" fill=\"#cbb0ef\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"61\" cy=\"44\" r=\"7\" fill=\"#cbb0ef\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"83\" cy=\"44\" r=\"7\" fill=\"#cbb0ef\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"72\" cy=\"104\" r=\"7\" fill=\"#efd28c\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"61\" cy=\"84\" r=\"7\" fill=\"#efd28c\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"83\" cy=\"84\" r=\"7\" fill=\"#efd28c\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"40\" cy=\"64\" r=\"7\" fill=\"#ffffff18\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"61\" cy=\"64\" r=\"7\" fill=\"#ffffff18\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"83\" cy=\"64\" r=\"7\" fill=\"#ffffff18\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"104\" cy=\"64\" r=\"7\" fill=\"#ffffff18\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/></svg>",
  "tabletop-aeroplane-chess": "<svg class=\"tabletop-art\" viewBox=\"0 0 144 128\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"17\" y=\"10\" width=\"110\" height=\"110\" rx=\"12\" fill=\"#ffffff08\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M53 10v110 M91 10v110 M17 46h110 M17 84h110\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"35\" cy=\"28\" r=\"12\" fill=\"#e59c98\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"109\" cy=\"28\" r=\"12\" fill=\"#b2c6ef\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"35\" cy=\"102\" r=\"12\" fill=\"#d8c58e\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"109\" cy=\"102\" r=\"12\" fill=\"#acd2ad\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><path d=\"M71 48l7 13 13 4-13 4-7 13-5-13-13-4 13-4z\" fill=\"currentColor\"/></svg>",
  "tabletop-kalah": "<svg class=\"tabletop-art\" viewBox=\"0 0 144 128\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"5\" y=\"25\" width=\"134\" height=\"76\" rx=\"26\" fill=\"#aa804344\" stroke=\"currentColor\" stroke-width=\"3\"/><ellipse cx=\"20\" cy=\"63\" rx=\"9\" ry=\"23\" fill=\"#302518\" stroke=\"currentColor\"/><ellipse cx=\"124\" cy=\"63\" rx=\"9\" ry=\"23\" fill=\"#302518\" stroke=\"currentColor\"/><ellipse cx=\"45\" cy=\"45\" rx=\"10\" ry=\"11\" fill=\"#302518\" stroke=\"currentColor\"/><ellipse cx=\"72\" cy=\"45\" rx=\"10\" ry=\"11\" fill=\"#302518\" stroke=\"currentColor\"/><ellipse cx=\"99\" cy=\"45\" rx=\"10\" ry=\"11\" fill=\"#302518\" stroke=\"currentColor\"/><ellipse cx=\"45\" cy=\"81\" rx=\"10\" ry=\"11\" fill=\"#302518\" stroke=\"currentColor\"/><ellipse cx=\"72\" cy=\"81\" rx=\"10\" ry=\"11\" fill=\"#302518\" stroke=\"currentColor\"/><ellipse cx=\"99\" cy=\"81\" rx=\"10\" ry=\"11\" fill=\"#302518\" stroke=\"currentColor\"/><circle cx=\"42\" cy=\"42\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"48\" cy=\"47\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"69\" cy=\"43\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"75\" cy=\"48\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"97\" cy=\"42\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"103\" cy=\"48\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"44\" cy=\"79\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"50\" cy=\"85\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"69\" cy=\"78\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"76\" cy=\"83\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"97\" cy=\"78\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"102\" cy=\"84\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"20\" cy=\"56\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"19\" cy=\"64\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"22\" cy=\"70\" r=\"3\" fill=\"#f4d393\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/></svg>",
  "tabletop-nine-mens-morris": "<svg class=\"tabletop-art\" viewBox=\"0 0 144 128\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"17\" y=\"8\" width=\"110\" height=\"110\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><rect x=\"35\" y=\"26\" width=\"74\" height=\"74\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><rect x=\"53\" y=\"44\" width=\"38\" height=\"38\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M72 8v36 M72 82v36 M17 63h36 M91 63h36\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"17\" cy=\"8\" r=\"8\" fill=\"#eff0e0\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"72\" cy=\"8\" r=\"8\" fill=\"#eff0e0\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"127\" cy=\"8\" r=\"8\" fill=\"#eff0e0\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"53\" cy=\"82\" r=\"8\" fill=\"#394a64\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"72\" cy=\"118\" r=\"8\" fill=\"#394a64\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"109\" cy=\"63\" r=\"8\" fill=\"#394a64\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/></svg>",
  "tabletop-quoridor": "<svg class=\"tabletop-art\" viewBox=\"0 0 144 128\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"17\" y=\"8\" width=\"110\" height=\"110\" rx=\"6\" fill=\"#ffffff08\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M39 8v110 M17 30h110\" stroke=\"currentColor\" opacity=\".35\"/><path d=\"M61 8v110 M17 52h110\" stroke=\"currentColor\" opacity=\".35\"/><path d=\"M83 8v110 M17 74h110\" stroke=\"currentColor\" opacity=\".35\"/><path d=\"M105 8v110 M17 96h110\" stroke=\"currentColor\" opacity=\".35\"/><path d=\"M60 8v43 M82 74h43 M38 74v43\" stroke=\"#f0cb87\" stroke-width=\"7\" stroke-linecap=\"round\"/><circle cx=\"72\" cy=\"107\" r=\"8\" fill=\"#d0e8c7\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"94\" cy=\"19\" r=\"8\" fill=\"#485b64\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><path d=\"M72 89V60h22V38\" stroke=\"#d0e8c7\" fill=\"none\" stroke-width=\"3\" stroke-dasharray=\"4 4\"/></svg>",
  "tabletop-quarto": "<svg class=\"tabletop-art\" viewBox=\"0 0 144 128\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"19\" y=\"8\" width=\"108\" height=\"108\" rx=\"6\" fill=\"#ffffff08\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M46 8v108 M19 35h108\" stroke=\"currentColor\" opacity=\".35\"/><path d=\"M73 8v108 M19 62h108\" stroke=\"currentColor\" opacity=\".35\"/><path d=\"M100 8v108 M19 89h108\" stroke=\"currentColor\" opacity=\".35\"/><circle cx=\"32.5\" cy=\"21.5\" r=\"9\" fill=\"#e4c58d\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"59.5\" cy=\"48.5\" r=\"9\" fill=\"#614e64\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><rect x=\"77\" y=\"66\" width=\"18\" height=\"18\" rx=\"2\" fill=\"#e4c58d\" stroke=\"#fff8\"/><rect x=\"104\" y=\"93\" width=\"18\" height=\"18\" rx=\"2\" fill=\"#614e64\" stroke=\"#fff8\"/><circle cx=\"86.5\" cy=\"48.5\" r=\"9\" fill=\"#e4c58d\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><circle cx=\"86.5\" cy=\"48.5\" r=\"3\" fill=\"#442f46\" stroke=\"#ffffff70\" stroke-width=\"1.5\"/><path d=\"M33 22l81 81\" stroke=\"#f3d8ef\" stroke-width=\"2\" stroke-dasharray=\"3 5\"/></svg>",

  "collection-mahjong-solitaire": "<div class=\"collection-art collection-mahjong\"><i>東</i><i>發</i><i>中</i><i>發</i><i>東</i></div>",
  "collection-tangram": "<svg class=\"collection-art\" viewBox=\"0 0 140 140\"><g stroke=\"#263342\" stroke-width=\"3\"><path fill=\"#e9a67a\" d=\"M10 10H130L70 70Z\"/><path fill=\"#f2ca82\" d=\"M130 10V130L70 70Z\"/><path fill=\"#b7cc9b\" d=\"M10 130H70L10 70Z\"/><path fill=\"#c2b0dd\" d=\"M10 70L40 40L70 70L40 100Z\"/><path fill=\"#a3c5df\" d=\"M10 10V70L40 40Z\"/><path fill=\"#ecabae\" d=\"M70 70L40 100H100Z\"/><path fill=\"#d9d6a1\" d=\"M40 100H100L130 130H70Z\"/></g></svg>",
  "collection-samegame": "<div class=\"collection-art collection-same\"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>",
  "collection-untangle": "<svg class=\"collection-art\" viewBox=\"0 0 140 140\"><path d=\"M20 30L120 105L110 20L20 110L20 30L110 20L120 105L20 110\" stroke=\"currentColor\" stroke-width=\"4\" fill=\"none\"/><g fill=\"#e9cf93\" stroke=\"#293944\" stroke-width=\"3\"><circle cx=\"20\" cy=\"30\" r=\"9\"/><circle cx=\"110\" cy=\"20\" r=\"9\"/><circle cx=\"120\" cy=\"105\" r=\"9\"/><circle cx=\"20\" cy=\"110\" r=\"9\"/></g></svg>",
  "collection-dominosa": "<div class=\"collection-art collection-domino\"><i>0│1</i><i>2│2</i><i>1│2</i><i>0│0</i></div>",
  "collection-unruly": "<div class=\"collection-art collection-binary\"><i>0</i><i>0</i><i>1</i><i>1</i><i>0</i><i>1</i><i>1</i><i>0</i><i>1</i><i>1</i><i>0</i><i>0</i><i>0</i><i>1</i><i>0</i><i>1</i></div>",
  "collection-keen": "<div class=\"collection-art collection-keen\"><i><small>6×</small>1</i><i>2</i><i>3</i><i><small>2÷</small>2</i><i>1</i><i>4</i><i><small>7+</small>3</i><i>4</i><i>1</i></div>",
  "collection-galaxies": "<svg class=\"collection-art\" viewBox=\"0 0 140 140\"><path d=\"M10 10H130V130H10Z M10 50H90V10 M50 50V90H130 M50 90V130 M90 50V90\" fill=\"#aec9ed18\" stroke=\"currentColor\" stroke-width=\"3\"/><g fill=\"#f4d994\"><circle cx=\"50\" cy=\"30\" r=\"6\"/><circle cx=\"110\" cy=\"50\" r=\"6\"/><circle cx=\"30\" cy=\"90\" r=\"6\"/><circle cx=\"90\" cy=\"110\" r=\"6\"/></g></svg>",
  "collection-signpost": "<div class=\"collection-art collection-sign\"><i>1→</i><i>↘</i><i>↓</i><i>↑</i><i>↗</i><i>↓</i><i>↖</i><i>←</i><i>9</i></div>",
  "collection-fillomino": "<div class=\"collection-art collection-fill\"><i>3</i><i>3</i><i>4</i><i>3</i><i>4</i><i>3</i><i>3</i><i>4</i><i>4</i><i>4</i><i>4</i><i>4</i></div>",

  "classic-sudoku": "<div class=\"classic-art classic-sudoku\"><i>1</i><i></i><i>3</i><i></i><i>5</i><i></i><i>7</i><i></i><i>9</i></div>",
  "classic-minesweeper": "<div class=\"classic-art classic-mine\"><i>1</i><i>1</i><i></i><i>1</i><i>⚑</i><i></i><i></i><i>2</i><i>1</i></div>",
  "classic-fifteen-puzzle": "<div class=\"classic-art classic-fifteen\"><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i><i>7</i><i>8</i><i>9</i><i>10</i><i>11</i><i>12</i><i>13</i><i>14</i><i>15</i><b></b></div>",
  "classic-hanoi": "<div class=\"classic-art classic-hanoi\"><span><i></i><i></i><i></i></span><b></b><b></b></div>",
  "classic-mastermind": "<div class=\"classic-art classic-code\"><div><i>●</i><i>◆</i><i>▲</i><i>■</i></div><span>● ● ○</span><div><i>◆</i><i>■</i><i>●</i><i>▲</i></div></div>",
  "classic-akari": "<div class=\"classic-art classic-akari\"><i></i><i>✦</i><i></i><i>1</i><i></i><i>2</i><i></i><i>✦</i><i></i></div>",
  "classic-hitori": "<div class=\"classic-art classic-hitori\"><i>2</i><i>3</i><i>2</i><i>3</i><i>1</i><i>2</i><i>1</i><i>2</i><i>3</i></div>",
  "classic-shikaku": "<div class=\"classic-art classic-shikaku\"><i>4</i><i>6</i><i>2</i><i>4</i></div>",
  "classic-numberlink": "<div class=\"classic-art classic-numberlink\"><i>1</i><b></b><i>1</i><i>2</i><b></b><i>2</i></div>",
  "classic-star-battle": "<div class=\"classic-art classic-star\"><i></i><i>★</i><i></i><i></i><i></i><i></i><i></i><i></i><i>★</i><i>★</i><i></i><i></i><i></i><i>★</i><i></i><i></i></div>",
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
// Browse by how a game plays, independently of the historical release collection.
// Every game has exactly one primary category; retain its original registry metadata.
const categories = [
  { id: 'tabletop', title: '棋類對戰', description: '找個朋友，或挑戰三種難度的 AI。', examples: '象棋・五子棋・黑白棋', icon: '♟', color: '#edc47e', gameIds: ['reversi', 'gomoku', 'connect-four', 'checkers', 'chinese-checkers', 'aeroplane-chess', 'kalah', 'nine-mens-morris', 'quoridor', 'quarto', 'xiangqi', 'banqi'] },
  { id: 'cards', title: '牌桌接龍', description: '整理牌序、配對牌面，慢慢清空牌桌。', examples: '經典接龍・蜘蛛・麻將', icon: '♠', color: '#95d7ba', gameIds: ['klondike', 'freecell', 'spider', 'pyramid', 'tripeaks', 'mahjong-solitaire'] },
  { id: 'numbers', title: '數字推理', description: '從加總、排序到數獨，找出數字的規律。', examples: '數獨・2048・算術方格', icon: '123', color: '#c5b3f5', gameIds: ['number-lab', 'futoshiki', 'kakuro', 'skyscrapers', 'sudoku', 'hitori', 'dominosa', 'unruly', 'keen'] },
  { id: 'deduction', title: '線索解謎', description: '觀察提示、排除可能，一步步推理答案。', examples: '踩地雷・數繪・猜密碼', icon: '◎', color: '#e2a8c5', gameIds: ['nonogram', 'nurikabe', 'magnets', 'battleships', 'black-box', 'minesweeper', 'mastermind', 'akari', 'shikaku', 'star-battle', 'galaxies', 'fillomino', 'tents', 'lights-out'] },
  { id: 'spatial', title: '空間拼圖', description: '滑動、旋轉與搬移，替每一塊找到位置。', examples: '華容道・推箱子・七巧板', icon: '▧', color: '#e6a396', gameIds: ['traffic-jam', 'sliding-blocks', 'sokoban', 'peg-solitaire', 'ice-slide', 'polyomino', 'fifteen-puzzle', 'hanoi', 'tangram', 'untangle'] },
  { id: 'paths', title: '連線迷宮', description: '接好線路、走出迷宮，讓路徑完整相連。', examples: '迷宮・水管・數字連線', icon: '⌁', color: '#9ac8f3', gameIds: ['maze-walk', 'logic-lab', 'bridges', 'slitherlink', 'masyu', 'net', 'numberlink', 'signpost'] },
  { id: 'simulation', title: '經營冒險', description: '規劃資源、探索世界，或即時指揮航線。', examples: '鐵道・餐廳・空中指揮所', icon: '✈', color: '#a8d9d2', gameIds: ['tiny-orbit', 'railway-town', 'merge-bistro', 'space-rescue', 'backpack-dungeon', 'island-colony', 'air-traffic'] },
  { id: 'quick', title: '休閒反應', description: '配對、消除、練反應，空閒時輕鬆玩一局。', examples: '記憶配對・反應・消除', icon: '✦', color: '#d2f86a', gameIds: ['block-plan', 'memory-match', 'quick-spark', 'samegame'] }
];
const categoryByGameId = Object.fromEntries(categories.flatMap(category => category.gameIds.map(id => [id, category])));
const categoryCounts = Object.fromEntries(categories.map(category => [category.id, games.filter(game => categoryByGameId[game.id] === category).length]));

let activeCategory = 'all';
const grid = document.querySelector('#game-grid');
const search = document.querySelector('#search');
const filters = [...document.querySelectorAll('[data-filter]')];
const categorySelect = document.querySelector('#category-select');
const overview = document.querySelector('#category-overview');
const overviewHeading = document.querySelector('#category-title');
const clearSearch = document.querySelector('#clear-search');
const backToCategories = document.querySelector('#back-to-categories');
const resultsTitle = document.querySelector('#browse-title');
const resultsDescription = document.querySelector('#browse-description');
const resultsRegion = document.querySelector('#browse-results');
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function gameCard(game, index) {
  const card = element('article', 'card');
  card.dataset.gameId = game.id;
  card.style.setProperty('--art-color', game.color);
  card.style.setProperty('--art-bg', game.background);
  const art = element('div', 'card-art');
  art.setAttribute('aria-hidden', 'true');
  art.append(element('div', 'art-pattern'), element('span', 'card-number', `GAME / ${String(index + 1).padStart(2, '0')}`));
  const isReady = game.status === 'ready' && typeof game.url === 'string' && /^\.\/games\/[\w\-/]+(?:\.html)?$/.test(game.url);
  art.append(element('span', 'coming-badge', isReady ? (game.badge || (game.category === 'logic' ? '50 關 · 唯一解' : game.category === 'board' ? '50 關 · 驗證可解' : '可以開玩')) : 'COMING SOON'));
  const visual = element('div', 'game-art');
  // Only static, developer-controlled artwork templates are inserted as HTML.
  visual.innerHTML = artMarkup[game.art] || artMarkup.blocks;
  art.append(visual, element('span', 'art-word', game.word));
  const content = element('div', 'card-content');
  content.append(element('span', 'category', categoryByGameId[game.id].title), element('h4', '', game.title), element('p', '', game.description));
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
function normalized(value) {
  return value.normalize('NFKC').toLocaleLowerCase('zh-Hant').replace(/\s+/g, ' ').trim();
}
function matchingGames() {
  const words = normalized(search.value).split(' ').filter(Boolean);
  return games.filter(game => {
    const category = categoryByGameId[game.id];
    const haystack = normalized(`${game.id} ${game.title} ${game.description} ${game.note} ${game.word} ${category.title} ${categoryNames[game.category]}`);
    return (activeCategory === 'all' || category.id === activeCategory) && words.every(word => haystack.includes(word));
  });
}
function render() {
  const query = search.value.trim();
  const visible = matchingGames();
  const selected = categories.find(category => category.id === activeCategory);
  const groups = categories.flatMap(category => {
    const members = visible.filter(game => categoryByGameId[game.id] === category);
    if (!members.length) return [];
    const group = element('section', 'game-group');
    group.dataset.category = category.id;
    group.style.setProperty('--category-color', category.color);
    group.setAttribute('aria-labelledby', `group-${category.id}`);
    const heading = element('div', 'game-group-heading');
    const title = element('h3', '', category.title);
    title.id = `group-${category.id}`;
    title.append(element('span', 'group-count', `${members.length} 款`));
    heading.append(title, element('p', '', category.description));
    const cards = element('div', 'game-grid');
    cards.append(...members.map(game => gameCard(game, games.indexOf(game))));
    group.append(heading, cards);
    return [group];
  });
  grid.replaceChildren(...groups);
  overview.hidden = Boolean(query) || activeCategory !== 'all';
  document.querySelector('#category-intro').hidden = overview.hidden;
  document.querySelector('#empty').hidden = visible.length > 0;
  clearSearch.hidden = search.value.length === 0;
  backToCategories.hidden = !overview.hidden;
  resultsTitle.textContent = query ? '搜尋結果' : selected ? selected.title : '全部遊戲';
  resultsDescription.textContent = query ? `搜尋「${query}」，範圍包含全部 ${games.length} 款遊戲。` : selected ? selected.description : '依玩法分組，找到喜歡的就開始吧。';
  document.querySelector('#results').textContent = query ? `找到 ${visible.length} 款遊戲` : `共 ${visible.length} 款遊戲${selected ? '' : ' · ' + categories.length + ' 個分類'}`;
  categorySelect.value = activeCategory;
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeCategory)));
}
function saveLocation(push = false) {
  const url = new URL(window.location.href);
  url.searchParams.delete('category');
  url.searchParams.delete('q');
  if (activeCategory !== 'all') url.searchParams.set('category', activeCategory);
  if (search.value.trim()) url.searchParams.set('q', search.value.trim());
  // Preserve unrelated URL parameters and the existing page anchor.
  const next = url.pathname + url.search + url.hash;
  const current = window.location.pathname + window.location.search + window.location.hash;
  if (next !== current) window.history[push ? 'pushState' : 'replaceState'](null, '', next);
}
function readLocation() {
  const params = new URL(window.location.href).searchParams;
  const requested = params.get('category');
  search.value = params.get('q') || '';
  activeCategory = search.value.trim() ? 'all' : categories.some(category => category.id === requested) ? requested : 'all';
  render();
}
function focusResults() {
  resultsTitle.focus({ preventScroll: true });
  resultsRegion.scrollIntoView({ block: 'start' });
}
function chooseCategory(id) {
  activeCategory = categories.some(category => category.id === id) ? id : 'all';
  search.value = '';
  saveLocation(true);
  render();
  focusResults();
}
function resetCatalog({ returnToCategories = false } = {}) {
  activeCategory = 'all';
  search.value = '';
  saveLocation(true);
  render();
  if (returnToCategories) {
    overviewHeading.focus({ preventScroll: true });
    overviewHeading.scrollIntoView({ block: 'start' });
  } else {
    search.focus({ preventScroll: true });
  }
}
filters.forEach(button => {
  const category = categories.find(item => item.id === button.dataset.filter);
  button.querySelector('[data-category-count]').textContent = String(category ? categoryCounts[category.id] : games.length);
  button.addEventListener('click', () => chooseCategory(button.dataset.filter));
});
categorySelect.replaceChildren(...[{ id: 'all', title: '全部遊戲' }, ...categories].map(category => {
  const option = element('option', '', `${category.title}（${category.id === 'all' ? games.length : categoryCounts[category.id]}）`);
  option.value = category.id;
  return option;
}));
categorySelect.addEventListener('change', () => chooseCategory(categorySelect.value));
search.addEventListener('input', () => {
  activeCategory = 'all';
  saveLocation();
  render();
});
search.addEventListener('keydown', event => {
  if (event.key === 'Escape' && search.value) {
    event.preventDefault();
    resetCatalog();
  } else if (event.key === 'Enter' && search.value.trim()) {
    event.preventDefault();
    focusResults();
  }
});
clearSearch.addEventListener('click', () => resetCatalog());
document.querySelector('#reset').addEventListener('click', () => resetCatalog({ returnToCategories: true }));
backToCategories.addEventListener('click', () => resetCatalog({ returnToCategories: true }));
window.addEventListener('popstate', () => {
  readLocation();
  // Keep the user's scroll position on browser Back/Forward; only restore view state.
});
readLocation();
