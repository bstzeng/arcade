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
  },
  {
    "id": 11,
    "layoutID": "transfer-b",
    "title": "晨郵分流",
    "goal": "reactorFeed",
    "balls": 5,
    "launchSaveSeconds": 8,
    "instruction": "按住發球，參考畫面百分比蓄力至40–65%再放開，讓球沿新分流撞亮任一反應爐彈跳柱。較弱發球不一定能送達；下方反彈器不算收件。",
    "objective": "沿發射分流接通反應爐",
    "success": "郵件已送達反應爐！球沿發射分流進場，並完成了真正的彈跳柱碰撞。",
    "theme": {
      "name": "postal",
      "light": true,
      "deckTop": "#E9E3D6",
      "deckBottom": "#CBBEAF",
      "accent": "#B4524C",
      "ink": "#263E51",
      "secondary": "#7D939E",
      "sling": "#A89389",
      "cap": "#455C6A",
      "arrow": "#263E51"
    },
    "chargeHint": [
      40,
      65
    ]
  },
  {
    "id": 12,
    "layoutID": "transfer-b",
    "title": "蜂巢分揀",
    "goal": "targets",
    "balls": 5,
    "launchSaveSeconds": 8,
    "instruction": "新球台的A、B、C航標錯落在中央。擊中任意兩個不同航標，為兩件包裹蓋章；落球後已收集的標記會保留。",
    "objective": "在錯列航標中蓋下兩個不同印章",
    "success": "兩件包裹已完成分揀！不同角度的航標都收到了球的撞擊。",
    "theme": {
      "name": "honey",
      "light": true,
      "deckTop": "#E1BA57",
      "deckBottom": "#B99545",
      "accent": "#3F7F77",
      "ink": "#443A29",
      "secondary": "#876C3B",
      "sling": "#AA9562",
      "cap": "#526E59",
      "arrow": "#234F50"
    }
  },
  {
    "id": 13,
    "layoutID": "transfer-b",
    "title": "潮汐回航",
    "goal": "sideReturn",
    "balls": 5,
    "launchSaveSeconds": 8,
    "returnRule": {
      "side": "right",
      "rise": 40,
      "maxSeconds": 1.5,
      "minImpulse": 80,
      "minUpSpeed": 100
    },
    "instruction": "球台的高架回流落向右拍。先練習用右拍把來球真正向上送回；不必先走完天橋，按住或點拍都可以。",
    "objective": "用右拍完成一次向上回擊",
    "success": "回航訊號接通！右拍與球接觸後，球已真正向上返回場中。",
    "theme": {
      "name": "tide",
      "light": true,
      "deckTop": "#B8D9CE",
      "deckBottom": "#7DAFA5",
      "accent": "#D88052",
      "ink": "#204D57",
      "secondary": "#598D94",
      "sling": "#729D94",
      "cap": "#356B70",
      "arrow": "#204D57"
    }
  },
  {
    "id": 14,
    "layoutID": "transfer-b",
    "title": "熔芯試坡",
    "goal": "rampLesson",
    "balls": 5,
    "launchSaveSeconds": 8,
    "instruction": "把球送進左側坡道，再安全回台。滑回入口或完整S橋返航都可以；只進坡還不算完成。落球後換個力度，例如40%、60%、80%輪流試，別一直重複同一球。",
    "objective": "左側入坡 → 安全回台",
    "success": "熔芯坡道探索完成！同一顆球已從坡道安全回到球台。",
    "theme": {
      "name": "furnace",
      "light": false,
      "deckTop": "#542C40",
      "deckBottom": "#321D32",
      "accent": "#D89862",
      "ink": "#F0DAB9",
      "secondary": "#AD6D68",
      "sling": "#80545F",
      "cap": "#775159"
    },
    "retryHint": "換力度試40／60／80%"
  },
  {
    "id": 15,
    "layoutID": "transfer-b",
    "title": "電波環站",
    "goal": "reactors",
    "balls": 5,
    "launchSaveSeconds": 8,
    "instruction": "接通馬蹄環站內的兩個不同反應爐節點，順序不限。這一關練習節點接觸，不要求完整穿越環線；重複碰同一個節點只算一次。",
    "objective": "接通兩個不同反應爐節點",
    "success": "兩個電波節點接通！你完成的是節點任務，完整環線仍可另外挑戰。",
    "theme": {
      "name": "radio",
      "light": false,
      "deckTop": "#344F88",
      "deckBottom": "#203257",
      "accent": "#F2D865",
      "ink": "#CFDFEA",
      "secondary": "#7AA7C7",
      "sling": "#586D95",
      "cap": "#496A9A"
    }
  },
  {
    "id": 16,
    "layoutID": "transfer-b",
    "title": "翡翠泊位",
    "goal": "dock",
    "balls": 6,
    "launchSaveSeconds": 8,
    "lockOpen": true,
    "instruction": "進階停靠：左上鎖艙已開啟，球真正落入才完成。這關有6球；落球後換個力度，試40%、60%、80%，再配合左右拍調整方向，不需要先解鎖其他裝置。",
    "objective": "將一球停靠左上鎖艙",
    "success": "翡翠泊位已收到球，真實停靠完成。",
    "theme": {
      "name": "jade",
      "light": false,
      "deckTop": "#145B50",
      "deckBottom": "#0C3A36",
      "accent": "#E8C575",
      "ink": "#E1E8D5",
      "secondary": "#74AE8E",
      "sling": "#438472",
      "cap": "#2A6A58"
    },
    "retryHint": "換力度試40／60／80%"
  },
  {
    "id": 17,
    "layoutID": "transfer-b",
    "title": "霓虹接駁",
    "goal": "transferTarget",
    "balls": 8,
    "launchSaveSeconds": 8,
    "lockOpen": true,
    "instruction": "兩條接駁路線任選一條：真正停靠左艙並彈出，或完成左坡探索並安全回台。之後再撞任一航標；已完成的路線步驟跨球保留。",
    "objective": "① 出艙或坡道回台 → ② 航標",
    "success": "霓虹接駁完成！你選擇的實體路線已接上航標訊號。",
    "theme": {
      "name": "neon",
      "light": false,
      "deckTop": "#281F36",
      "deckBottom": "#181A2A",
      "accent": "#EE7CA4",
      "ink": "#E2E1F0",
      "secondary": "#83D9DC",
      "sling": "#624E73",
      "cap": "#66537D"
    }
  },
  {
    "id": 18,
    "layoutID": "transfer-b",
    "title": "白瓷天橋",
    "goal": "bridgeChoice",
    "balls": 8,
    "launchSaveSeconds": 8,
    "instruction": "選擇完整穿越S橋並落回右拍區；或分段試航：先進入左坡並安全滑回，再用右拍向上回擊。分段步驟跨球保留，畫面會說明你完成哪一條路線。",
    "objective": "完整S橋 或 分段回台＋右拍",
    "success": "白瓷天橋試航完成！",
    "theme": {
      "name": "porcelain",
      "light": true,
      "deckTop": "#E4DFEC",
      "deckBottom": "#BFB9D0",
      "accent": "#627EC5",
      "ink": "#493F64",
      "secondary": "#8B94B5",
      "sling": "#9993B4",
      "cap": "#64729B",
      "arrow": "#354C85"
    },
    "returnRule": {
      "side": "right",
      "rise": 40,
      "maxSeconds": 1.5,
      "minImpulse": 80,
      "minUpSpeed": 100
    }
  },
  {
    "id": 19,
    "layoutID": "transfer-b",
    "title": "深海中繼",
    "goal": "relayTargets",
    "balls": 5,
    "launchSaveSeconds": 8,
    "reserveBalls": 1,
    "instruction": "左艙的預備球會在首次發球後實際彈出。接力撞亮兩個不同航標，再累計一次任一拍的真正向上回擊，順序不限。失去一球仍可繼續；兩球全失才扣一輪。",
    "objective": "雙球接力 · 航標任2＋球拍回擊",
    "success": "深海中繼接通！兩個不同航標與一次球拍回擊都已完成。",
    "theme": {
      "name": "abyss",
      "light": false,
      "deckTop": "#073F4D",
      "deckBottom": "#062936",
      "accent": "#DDA66D",
      "ink": "#DCF1EE",
      "secondary": "#8BD9E4",
      "sling": "#376574",
      "cap": "#2D6275"
    },
    "returnRule": {
      "rise": 40,
      "maxSeconds": 1.5,
      "minImpulse": 80,
      "minUpSpeed": 100
    }
  },
  {
    "id": 20,
    "layoutID": "transfer-b",
    "title": "緋紅總樞",
    "goal": "dispatch",
    "balls": 8,
    "launchSaveSeconds": 8,
    "lockOpen": true,
    "returnRule": {
      "side": "right",
      "rise": 40,
      "maxSeconds": 1.5,
      "minImpulse": 80,
      "minUpSpeed": 100
    },
    "instruction": "四項路線任選三章：兩個不同航標、左坡探索並安全回台、右拍向上回擊、左艙停靠。滑回入口也能取得試坡章；已取得的章跨球保留，自由選擇順序。",
    "objective": "四選三 · 集滿三枚轉運章",
    "success": "緋紅總樞已完成三項轉運檢查！你的路線選擇讓中樞順利啟用。",
    "theme": {
      "name": "vermilion",
      "light": false,
      "deckTop": "#8A3E37",
      "deckBottom": "#542C31",
      "accent": "#FFD06C",
      "ink": "#F3E1BE",
      "secondary": "#D49071",
      "sling": "#A77162",
      "cap": "#975A54"
    }
  }
];
function freeze(x){Object.values(x).forEach(v=>{if(v&&typeof v==='object')freeze(v);});return Object.freeze(x);}freeze(levels);return Object.freeze({version,levels,get:id=>levels.find(l=>l.id===Number(id))||null});});
