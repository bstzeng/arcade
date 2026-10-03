(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.PinballLevels=api;})(globalThis,function(){'use strict';
const version='campaign-v1',levels=[
  {
    "id": 1,
    "title": "雲港啟航",
    "goal": "contact",
    "balls": 5,
    "launchSaveSeconds": 8,
    "instruction": "按住發球再放開，讓球碰到任一反彈器、彈跳柱或航標。球落下時，試試左右拍。",
    "objective": "撞亮任一反彈器或航標",
    "success": "第一盞訊號亮了，成功啟航！",
    "theme": {
      "name": "cloud",
      "light": true,
      "deckTop": "#D9EAF0",
      "deckBottom": "#ADC8D4",
      "accent": "#D49A35",
      "ink": "#26516A",
      "secondary": "#7BA9B6",
      "sling": "#80A6B5",
      "cap": "#315F71"
    }
  },
  {
    "id": 2,
    "title": "森光溫室",
    "goal": "return",
    "balls": 5,
    "launchSaveSeconds": 8,
    "returnRule": {
      "rise": 40,
      "maxSeconds": 1.5,
      "minImpulse": 80,
      "minUpSpeed": 100
    },
    "instruction": "用任一球拍把球往上送回場中。按住或點拍都可以；等球真的向上回擊，嫩芽才會亮起。",
    "objective": "用球拍完成一次向上回擊",
    "success": "嫩芽亮起！你完成了一次向上的回擊。",
    "theme": {
      "name": "garden",
      "light": false,
      "deckTop": "#153D36",
      "deckBottom": "#0C2825",
      "accent": "#5CC7A3",
      "ink": "#F0DEAD",
      "secondary": "#A9D3AD",
      "sling": "#396455",
      "cap": "#24544C"
    }
  },
  {
    "id": 3,
    "title": "夕照貨港",
    "goal": "upper",
    "balls": 5,
    "launchSaveSeconds": 8,
    "instruction": "用左右拍把球送往上方，撞亮任一彈跳柱或航標。目標在球台上半部，請瞄準標示的裝置。",
    "objective": "擊中上方彈跳柱或航標一次",
    "success": "貨港訊號接通！你把球送到了上方目標。",
    "theme": {
      "name": "cargo",
      "light": false,
      "deckTop": "#503530",
      "deckBottom": "#32292C",
      "accent": "#EA996D",
      "ink": "#F4D389",
      "secondary": "#CA7855",
      "sling": "#80594C",
      "cap": "#7F5945"
    }
  },
  {
    "id": 4,
    "title": "冰晶軌道",
    "goal": "orbitReturn",
    "balls": 5,
    "launchSaveSeconds": 8,
    "instruction": "發球穿過外側環軌，再用任一球拍把球向上送回。兩步依序完成，落球會保留第一步。",
    "objective": "① 完成環軌 → ② 向上回擊",
    "success": "冰晶導航完成，兩段航線都已接通。",
    "theme": {
      "name": "ice",
      "light": true,
      "deckTop": "#A6DFEB",
      "deckBottom": "#6BB8D0",
      "accent": "#246A91",
      "ink": "#183542",
      "secondary": "#52B8C9",
      "sling": "#7197AC",
      "cap": "#2B6687",
      "arrow": "#14495F"
    },
    "returnRule": {
      "rise": 40,
      "maxSeconds": 1.5,
      "minImpulse": 80,
      "minUpSpeed": 100
    }
  },
  {
    "id": 5,
    "title": "珊瑚貨艙",
    "goal": "targets",
    "balls": 5,
    "launchSaveSeconds": 8,
    "instruction": "擊中上方A、B、C航標中的任意兩個。不同航標各算一件貨物，落球會保留已點亮的標記。",
    "objective": "點亮兩個不同航標",
    "success": "兩件貨物裝艙完成！",
    "theme": {
      "name": "coral",
      "light": false,
      "deckTop": "#402C4A",
      "deckBottom": "#241D34",
      "accent": "#FF947D",
      "ink": "#E4D8F0",
      "secondary": "#BAA8E4",
      "sling": "#725A80",
      "cap": "#6E516F"
    }
  },
  {
    "id": 6,
    "title": "沙海觀測站",
    "goal": "rampLesson",
    "balls": 5,
    "launchSaveSeconds": 8,
    "instruction": "把球送進右側斜坡，再回到球台。弱球沿入口滑回也算成功；強球會走完高架並落回左拍。觀察不同力度的效果。",
    "objective": "① 真正入坡 → ② 安全回台",
    "success": "斜坡探索完成！球已安全回到球台。",
    "theme": {
      "name": "desert",
      "light": true,
      "deckTop": "#D5BE91",
      "deckBottom": "#BAA174",
      "accent": "#277E83",
      "ink": "#183542",
      "secondary": "#8A5F33",
      "sling": "#819A95",
      "cap": "#326C72",
      "arrow": "#18566F"
    }
  },
  {
    "id": 7,
    "title": "月影礦場",
    "goal": "dock",
    "balls": 5,
    "launchSaveSeconds": 8,
    "instruction": "鎖艙已開啟。把球送到上方標示的圓形艙口，等球真正落入艙內即可完成。",
    "objective": "將一球鎖入月影艙",
    "success": "礦石球已入艙，停靠完成。",
    "theme": {
      "name": "moon",
      "light": false,
      "deckTop": "#24283A",
      "deckBottom": "#141B2B",
      "accent": "#B7A1F2",
      "ink": "#E0E5F0",
      "secondary": "#BDC9DA",
      "sling": "#4A536D",
      "cap": "#655C88"
    },
    "lockOpen": true
  },
  {
    "id": 8,
    "title": "極光中繼站",
    "goal": "relay",
    "balls": 5,
    "launchSaveSeconds": 8,
    "instruction": "艙內已有一顆預備球。你發球後，預備球會由艙口彈出；累計撞擊彈跳柱四次。失去一球仍可繼續接力。",
    "objective": "雙球接力 · 彈跳柱四次",
    "success": "中繼訊號已充滿！雙球接力完成。",
    "theme": {
      "name": "aurora",
      "light": false,
      "deckTop": "#103442",
      "deckBottom": "#0B1D32",
      "accent": "#74E5BE",
      "ink": "#DAF4E9",
      "secondary": "#A5A4FF",
      "sling": "#32606D",
      "cap": "#3F7183"
    },
    "bumperCount": 4,
    "reserveBalls": 1,
    "reserveEject": {
      "rise": 380,
      "vx": -85,
      "vy": -160
    }
  },
  {
    "id": 9,
    "title": "環日船塢",
    "goal": "orbitRamp",
    "balls": 8,
    "launchSaveSeconds": 8,
    "instruction": "先完成外側環軌，再完整穿越右側返航斜坡並落回左側。已完成的第一步跨球保留，不限時間。",
    "objective": "① 環軌 → ② 完整返航",
    "success": "環日航線完成，船塢已接收到返航訊號。",
    "theme": {
      "name": "solar",
      "light": false,
      "deckTop": "#6B2D24",
      "deckBottom": "#402020",
      "accent": "#FFAD5B",
      "ink": "#FFE7B6",
      "secondary": "#D47451",
      "sling": "#835750",
      "cap": "#8C6550"
    }
  },
  {
    "id": 10,
    "title": "深空慶典",
    "goal": "flight",
    "balls": 8,
    "launchSaveSeconds": 8,
    "instruction": "任意順序完成四站：彈跳柱三次、外側環軌、坡道探索／安全回台、鎖艙。斜坡滑回或完整返航都可以；鎖球會由原艙口彈出，徽章跨球保留。",
    "objective": "四站飛行檢查 · 任意順序",
    "success": "四站檢查完成！深空慶典啟航。",
    "theme": {
      "name": "festival",
      "light": false,
      "deckTop": "#253A70",
      "deckBottom": "#17274D",
      "accent": "#73BEFF",
      "ink": "#F3CE75",
      "secondary": "#ACBEE7",
      "sling": "#41587F",
      "cap": "#536695"
    },
    "bumperCount": 3,
    "lockOpen": true
  }
];
function freeze(x){Object.values(x).forEach(v=>{if(v&&typeof v==='object')freeze(v);});return Object.freeze(x);}freeze(levels);return Object.freeze({version,levels,get:id=>levels.find(l=>l.id===Number(id))||null});});
