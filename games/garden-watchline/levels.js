/* Garden Watchline: 30 authored missions, 141 waves, 1,857 public spawn entries. Deterministic formations; no random or level-dependent stat scaling. */
(function(root){var levels=[
  {
    "id": 1,
    "title": "第一束芽光",
    "chapter": 1,
    "biome": "meadow",
    "subtitle": "晨露小徑 · 把陽光種進土裡",
    "tip": "先放暖燈花，再用芽葉弩守住有敵人的路。每路的守園車都能救急一次。",
    "brief": "從中央開始，慢慢照顧三條小徑。花園允許犯錯，先試著種下第一株吧。",
    "lanes": [
      1,
      2,
      3
    ],
    "startSun": 350,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "burst"
    ],
    "blocked": [],
    "fertile": [
      [
        2,
        0
      ]
    ],
    "waves": [
      {
        "name": "晨間訪客",
        "brief": "只有中央路，先觀察芽葉弩的射程。",
        "gap": 14,
        "bonus": 60,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 8,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 16,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "左右問候",
        "brief": "上下兩路輪流出現，不必一次種滿。",
        "gap": 14,
        "bonus": 60,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 7,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 14,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 21,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "三路小徑",
        "brief": "三條路都需要一位守護者。",
        "gap": 14,
        "bonus": 65,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 5,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 10,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 15,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 20,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "第一場合奏",
        "brief": "中央多一位訪客；星火蕾可處理靠得近的敵人。",
        "gap": 14,
        "bonus": 75,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 4,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 8,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 13,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 18,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 23,
            "lane": 2,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 2,
    "title": "樹皮小哨站",
    "chapter": 1,
    "biome": "meadow",
    "subtitle": "晨露小徑 · 前排替你爭取時間",
    "tip": "藤編牆擋在芽葉弩前方。保留一小筆芽光，遇到空路就能補種。",
    "brief": "新夥伴藤編牆加入！較密的中央隊伍會教你把時間變成優勢。",
    "lanes": [
      1,
      2,
      3
    ],
    "startSun": 375,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "bark",
      "burst"
    ],
    "blocked": [],
    "fertile": [
      [
        1,
        1
      ],
      [
        3,
        1
      ]
    ],
    "waves": [
      {
        "name": "先守兩翼",
        "brief": "兩翼各有一位；可以從後排開始。",
        "gap": 12,
        "bonus": 60,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 6,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 14,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 18,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "中央列隊",
        "brief": "中央連續來客，試試前排藤編牆。",
        "gap": 12,
        "bonus": 65,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 4,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 9,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 15,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 19,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "換邊照料",
        "brief": "壓力由下路轉往上路。",
        "gap": 12,
        "bonus": 65,
        "spawns": [
          {
            "at": 0,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 4,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 9,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 14,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 18,
            "lane": 1,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "穩穩守住",
        "brief": "三路都有訪客，但先前的防線能繼續幫忙。",
        "gap": 12,
        "bonus": 80,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 0,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 6,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 10,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 15,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 18,
            "lane": 3,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 3,
    "title": "快腳的午後",
    "chapter": 1,
    "biome": "meadow",
    "subtitle": "晨露小徑 · 讓急性子慢下來",
    "tip": "霜鈴蘭能減速疾腳影，藤編牆則是可靠的第二道保險。",
    "brief": "疾腳影跑得快、卻不耐打。第一次會獨自出現在中央，方便你練習。",
    "lanes": [
      1,
      2,
      3
    ],
    "startSun": 400,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "burst"
    ],
    "blocked": [],
    "fertile": [
      [
        2,
        2
      ]
    ],
    "waves": [
      {
        "name": "一位急性子",
        "brief": "第一位疾腳影獨自走中央。",
        "gap": 15,
        "bonus": 65,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 10,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 16,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 21,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "慢快交錯",
        "brief": "先來苔影，疾腳影稍後跟上。",
        "gap": 12,
        "bonus": 65,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 2,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 7,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 7.7,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 10,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 10.7,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 17,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "中央接力",
        "brief": "中央的兩次衝刺間有補種空檔。",
        "gap": 12,
        "bonus": 70,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 0.7,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 7,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 9,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 15,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 15.7,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 20,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 22,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "穩住節奏",
        "brief": "兩翼疾腳影錯開登場，中央維持普通壓力。",
        "gap": 12,
        "bonus": 80,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 3,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 3.7,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 7,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 7.7,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 11,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 16,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 20,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 24,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 24.7,
            "lane": 2,
            "type": "runner"
          }
        ]
      }
    ]
  },
  {
    "id": 4,
    "title": "五條花徑",
    "chapter": 1,
    "biome": "meadow",
    "subtitle": "晨露小徑 · 把花園照顧得更寬",
    "tip": "最外側兩路現在也開放了。先看每波路線預告，再補齊空路。",
    "brief": "完整的五路花園登場。新路先各來一位苔影，給你充足時間建立防線。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 450,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "burst"
    ],
    "blocked": [],
    "fertile": [
      [
        0,
        1
      ],
      [
        4,
        1
      ]
    ],
    "waves": [
      {
        "name": "新的邊界",
        "brief": "新開的最上路與最下路先來苔影。",
        "gap": 14,
        "bonus": 65,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 8,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 15,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 20,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 23,
            "lane": 4,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "花徑輪唱",
        "brief": "五條路依序出現，不用搶著一起補。",
        "gap": 12,
        "bonus": 70,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 4,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 8,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 12,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 16,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 22,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 22.7,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 23.4,
            "lane": 2,
            "type": "runner"
          }
        ]
      },
      {
        "name": "兩翼微風",
        "brief": "上下邊路的疾腳影分開到達。",
        "gap": 12,
        "bonus": 75,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 2,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 6,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 8,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 12,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 12.7,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 18,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 18.7,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 24,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "五路守園",
        "brief": "每路一小隊，中路稍晚再補一位。",
        "gap": 12,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 2,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 4,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 7,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 7.7,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 11,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 11.7,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 15,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 16,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 17,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 19,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 23,
            "lane": 2,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 5,
    "title": "晨露守園節",
    "chapter": 1,
    "biome": "meadow",
    "subtitle": "晨露小徑 · 第一場小小慶典",
    "tip": "先讓五路都有芽葉弩，再把霜鈴蘭和藤編牆放在來客最多的路。",
    "brief": "把芽光、射手、減速與前排一起用起來。這場慶典考驗照顧次序，沒有新敵人。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 475,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "burst"
    ],
    "blocked": [
      [
        0,
        5
      ],
      [
        4,
        5
      ]
    ],
    "fertile": [
      [
        1,
        1
      ],
      [
        2,
        2
      ],
      [
        3,
        1
      ]
    ],
    "waves": [
      {
        "name": "中央花束",
        "brief": "先穩中央與相鄰兩路。",
        "gap": 12,
        "bonus": 70,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 3,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 6,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 10,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 16,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 20,
            "lane": 3,
            "type": "runner"
          }
        ]
      },
      {
        "name": "繞園一圈",
        "brief": "壓力從最上路逐步移到最下路。",
        "gap": 12,
        "bonus": 75,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 4,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 7,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 7.3,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 7.7,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 8.1,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 8.5,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 11,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 15,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 19,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 19.7,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 24,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 24.7,
            "lane": 4,
            "type": "runner"
          }
        ]
      },
      {
        "name": "前排接棒",
        "brief": "上下兩翼先吃壓力，中央稍後衝刺。",
        "gap": 12,
        "bonus": 80,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 0,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 1,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 1,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 4,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 4,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 9,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 13,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 18,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 18.3,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 18.7,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 19.1,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 19.4,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 24,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "晨露謝幕",
        "brief": "五路交錯的最後合奏，波次獎勵可用來補強。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 0,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 0,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 5,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 6,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 9,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 10,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 13,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 14,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 14.4,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 14.8,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 15.2,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 15.6,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 16,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 17,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 20,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 21,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 24,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 25,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 25,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 27,
            "lane": 3,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 6,
    "title": "雨點成群",
    "chapter": 2,
    "biome": "rain",
    "subtitle": "苔階雨庭 · 一次照顧一小群",
    "tip": "莓果炮的範圍傷害很適合成群的小團影。星火蕾也能清掉一團。",
    "brief": "小團影血量低，但喜歡結伴。新夥伴莓果炮能讓密集隊伍不再可怕。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 475,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "burst"
    ],
    "blocked": [
      [
        2,
        5
      ]
    ],
    "fertile": [
      [
        1,
        2
      ],
      [
        3,
        2
      ]
    ],
    "waves": [
      {
        "name": "三顆雨點",
        "brief": "中央先來一小群，試試莓果炮。",
        "gap": 12,
        "bonus": 70,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 1.5,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 3,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 12,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 18,
            "lane": 4,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "兩把小傘",
        "brief": "兩團小團影分別走兩翼。",
        "gap": 12,
        "bonus": 75,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 0.5,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 1,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 1.5,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.5,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3.5,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 8,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 8.5,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 9,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 9.5,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.5,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 11,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 11.5,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 12,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 19,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 23,
            "lane": 4,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "雨聲漸密",
        "brief": "小隊聚在中路，外側只有零星苔影。",
        "gap": 12,
        "bonus": 80,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 3,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 6,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 6.4,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 6.8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 7,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 7.4,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 7.8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 8.4,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 8.8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 10,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 15,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 20,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 24,
            "lane": 2,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "一陣好雨",
        "brief": "兩次成群來客之間有轉移注意力的空檔。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 0.4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 1,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 1.4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 1.8,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.8,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 6,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 10,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.4,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.8,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 11,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 11.4,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 11.8,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 12,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 12.4,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 12.8,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 16,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 20,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 25,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 27,
            "lane": 3,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 7,
    "title": "殼帽慢行",
    "chapter": 2,
    "biome": "rain",
    "subtitle": "苔階雨庭 · 厚殼也有解法",
    "tip": "石帽影會減少普通射擊傷害。莓果炮更有效，霜鈴蘭與藤編牆能補上時間。",
    "brief": "第一位石帽影會獨自走中央。它很慢，先穩住其他路，再安排破殼火力。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 500,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "burst"
    ],
    "blocked": [],
    "fertile": [
      [
        2,
        2
      ],
      [
        0,
        1
      ],
      [
        4,
        1
      ]
    ],
    "waves": [
      {
        "name": "一頂殼帽",
        "brief": "中央只有一位石帽影，慢慢試著拆解。",
        "gap": 15,
        "bonus": 75,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 12,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 16,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 22,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 25,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "厚殼與雨點",
        "brief": "上路厚殼，下路小群，兩種答案各有舞台。",
        "gap": 12,
        "bonus": 80,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 5,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 6.5,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 8,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 13,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 17,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 23,
            "lane": 2,
            "type": "runner"
          }
        ]
      },
      {
        "name": "兩邊慢行",
        "brief": "厚殼在兩側錯開登場，中央只需基本火力。",
        "gap": 12,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 4,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 8.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 13,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 17,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 21,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 22,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 23,
            "lane": 2,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "雨庭巡遊",
        "brief": "中央厚殼後有一團小團影，範圍攻擊可兼顧。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 3,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 6,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 9,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 10,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 11,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 15,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 16,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 16.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 20,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 25,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 28,
            "lane": 4,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 8,
    "title": "穿過厚厚雨衣",
    "chapter": 2,
    "biome": "rain",
    "subtitle": "苔階雨庭 · 赤葉扇的直線答案",
    "tip": "赤葉扇的穿透火力能對付石帽影與排成直線的隊伍。把它放在厚殼會經過的路。",
    "brief": "赤葉扇加入花園。厚殼不再只是拖時間的考題，現在可以直接破開。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 500,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "burst"
    ],
    "blocked": [
      [
        1,
        4
      ],
      [
        3,
        4
      ]
    ],
    "fertile": [
      [
        0,
        2
      ],
      [
        2,
        2
      ],
      [
        4,
        2
      ]
    ],
    "waves": [
      {
        "name": "直線練習",
        "brief": "中央先排成一列，試試新夥伴赤葉扇。",
        "gap": 12,
        "bonus": 75,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 4,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 8,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 14,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 19,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "上下雨衣",
        "brief": "上下邊路各有厚殼，內側則是零星快客。",
        "gap": 12,
        "bonus": 80,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 5,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 5.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 10,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 15,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 20,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 23,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 27,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "中線長隊",
        "brief": "中路多位來客拉成長隊，兩翼保留可讀的間隔。",
        "gap": 12,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 3,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 6,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 7,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 13,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 18,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 23,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 27,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "雨衣大遊行",
        "brief": "三條不同路先後出現厚殼，慢慢把破甲火力鋪開。",
        "gap": 12,
        "bonus": 105,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 5,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 5.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 10,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 13,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 16,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 16.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 20,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 21,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 22,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 26,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 27,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 28,
            "lane": 3,
            "type": "swarm"
          }
        ]
      }
    ]
  },
  {
    "id": 9,
    "title": "三葉修補所",
    "chapter": 2,
    "biome": "rain",
    "subtitle": "苔階雨庭 · 讓前排重新精神",
    "tip": "露滴草能治療周圍八格的植物。放在兩面藤編牆之間，可一起照顧它們。",
    "brief": "露滴草加入。這次來客分成短促小隊，練習在間隙修補花園。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 500,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        0,
        6
      ],
      [
        4,
        6
      ]
    ],
    "fertile": [
      [
        2,
        3
      ],
      [
        1,
        4
      ],
      [
        3,
        4
      ]
    ],
    "waves": [
      {
        "name": "先搭修補站",
        "brief": "中央兩側先有小隊，前排不用擺得太分散。",
        "gap": 12,
        "bonus": 80,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 3,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 6,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 9,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 16,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 21,
            "lane": 4,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "短促雨陣",
        "brief": "厚殼與疾腳影錯開，留意前排耐久。",
        "gap": 12,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 5,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 5.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 10,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 14,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 19,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 20,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 21,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 27,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "修好再出發",
        "brief": "中段有較長空檔，可以補種或修補。",
        "gap": 12,
        "bonus": 90,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 0,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 3,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 7,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 12,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 12.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 25,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 25.5,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 26,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 26.5,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 27,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 27.5,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 28,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 28.5,
            "lane": 4,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "雨後新葉",
        "brief": "內側前排迎接連續小隊，外側苔影稍後才來。",
        "gap": 12,
        "bonus": 105,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 0,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 4.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 5.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 8.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 9.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 12,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 17,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 18,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 19,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 20,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 25,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 29,
            "lane": 4,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 10,
    "title": "苔階雙重奏",
    "chapter": 2,
    "biome": "rain",
    "subtitle": "苔階雨庭 · 厚殼與雨點的合奏",
    "tip": "赤葉扇處理厚殼，莓果炮照顧小群；不用每條路都種一樣的組合。",
    "brief": "雨庭的章末考驗。每波把厚殼與群體放在不同位置，讀懂預告就能從容安排。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 525,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        1,
        5
      ],
      [
        3,
        5
      ]
    ],
    "fertile": [
      [
        0,
        2
      ],
      [
        2,
        1
      ],
      [
        4,
        2
      ]
    ],
    "waves": [
      {
        "name": "一慢一群",
        "brief": "上路厚殼，下路小群，中央維持輕壓力。",
        "gap": 12,
        "bonus": 80,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 3,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 4,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 5,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 10,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 14,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 18,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 24,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "交換位置",
        "brief": "厚殼改走下路，小群改走上路。",
        "gap": 12,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 3,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 3.3,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 3.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 4,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 4.3,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 4.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 5,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 5.3,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 5.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 10,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 10.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 11.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 15,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 20,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 25,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 26,
            "lane": 3,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "三線雨幕",
        "brief": "內側兩路有厚殼，中路的小群可交給範圍火力。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 5,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 5.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 6.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 9,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 10,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 15,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 19,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 23,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 27,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 30,
            "lane": 2,
            "type": "runner"
          }
        ]
      },
      {
        "name": "苔階謝幕",
        "brief": "壓力分成三段；保留星火蕾處理最擁擠的一團。",
        "gap": 12,
        "bonus": 115,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 3,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 3.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 4.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 6,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 10,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 11,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 12,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 16,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 17,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 18,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 23,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 23.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 24.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 28,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 32,
            "lane": 4,
            "type": "runner"
          }
        ]
      }
    ]
  },
  {
    "id": 11,
    "title": "跳過第一片葉",
    "chapter": 3,
    "biome": "orchard",
    "subtitle": "風鈴果園 · 防線要有一點深度",
    "tip": "跳葉影能跳過遇見的第一面藤編牆。在後方留一道防線，或先用霜鈴蘭減速。",
    "brief": "第一次跳葉影獨自走中央。牠會越過一面盾，卻不能越過整座花園。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 525,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [],
    "fertile": [
      [
        2,
        2
      ],
      [
        1,
        1
      ],
      [
        3,
        1
      ]
    ],
    "waves": [
      {
        "name": "一小步跳躍",
        "brief": "中央的新來客先獨自登場。",
        "gap": 15,
        "bonus": 80,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 8.64,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 11.52,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 15.84,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 18.72,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "前後兩排",
        "brief": "兩翼輪流有跳躍，後排要有第二個答案。",
        "gap": 12,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 0.7,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 4.32,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 4.32,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 8.64,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 11.52,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 18,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 20.88,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "果枝上的腳步",
        "brief": "普通小群走中間，跳葉影在外側錯開。",
        "gap": 12,
        "bonus": 90,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 0.4,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 0.72,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 1.12,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 1.44,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 1.84,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 5.04,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 5.74,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 10.08,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 10.78,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 13.68,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 16.56,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 20.16,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "讓盾接力",
        "brief": "一位厚殼牽制中央，兩翼跳躍稍後抵達。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 3.6,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 5.76,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 8.64,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 9.34,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 12.96,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 13.66,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 16.56,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 19.44,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 21.6,
            "lane": 2,
            "type": "runner"
          }
        ]
      },
      {
        "name": "果園迎新",
        "brief": "跳躍與小群分路登場，優先照顧缺少後備的路。",
        "gap": 12,
        "bonus": 110,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 0.7,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 3.6,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 4.3,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 7.2,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 7.92,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 8.64,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 12.24,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 12.94,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 15.84,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 16.54,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 19.44,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 21.6,
            "lane": 4,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 12,
    "title": "風鈴的輪唱",
    "chapter": 3,
    "biome": "orchard",
    "subtitle": "風鈴果園 · 注意力跟著風移動",
    "tip": "每波依不同方向掃過五條路。提前準備基本防線，再跟著預告補強。",
    "brief": "果園像一首輪唱，壓力依序移動。這次沒有新敵人，只練習安排照顧順序。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 525,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        2,
        5
      ]
    ],
    "fertile": [
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        3,
        2
      ],
      [
        4,
        2
      ]
    ],
    "waves": [
      {
        "name": "由上而下",
        "brief": "從最上路開始，逐路輪到最下路。",
        "gap": 12,
        "bonus": 80,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 2.88,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 5.76,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 8.64,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 11.52,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 15.12,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 18.72,
            "lane": 4,
            "type": "runner"
          }
        ]
      },
      {
        "name": "由下而上",
        "brief": "這回方向反過來，疾腳影穿插在內側。",
        "gap": 12,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 2.88,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 3.58,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 5.76,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 6.56,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 7.36,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 8.64,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 9.34,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 11.52,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 16.56,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 20.16,
            "lane": 0,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "從中央展開",
        "brief": "中央先跳躍，接著內側、最後兩翼。",
        "gap": 12,
        "bonus": 90,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 0.7,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 3.6,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 3.6,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 7.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 7.9,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 10.08,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 10.98,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 18,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 21.6,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "兩翼收攏",
        "brief": "群體先在兩端聚集，再往中央集中。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 0.72,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 1.44,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 5.04,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 5.76,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 6.48,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 10.8,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 10.8,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 11.5,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 15.12,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 15.12,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 15.82,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 19.44,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 20.24,
            "lane": 2,
            "type": "shell"
          }
        ]
      },
      {
        "name": "風鈴五重奏",
        "brief": "每路都有不同的小隊，規律仍然清楚。",
        "gap": 12,
        "bonus": 110,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 3.6,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 7.2,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 7.9,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 8.6,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 10.8,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 15.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 16,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 17.28,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 19.44,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 20.16,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 20.88,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 23.04,
            "lane": 4,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 13,
    "title": "果籃的兩端",
    "chapter": 3,
    "biome": "orchard",
    "subtitle": "風鈴果園 · 別忘了花園的邊邊",
    "tip": "肥沃格在最上與最下路，適合強化邊路火力。中央也要留基本守備。",
    "brief": "這次兩側最熱鬧。果籃擋住少數前方格子，後方仍有充足位置建立兩層防線。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 550,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        0,
        5
      ],
      [
        4,
        5
      ]
    ],
    "fertile": [
      [
        0,
        1
      ],
      [
        0,
        2
      ],
      [
        4,
        1
      ],
      [
        4,
        2
      ]
    ],
    "waves": [
      {
        "name": "兩端問候",
        "brief": "邊路先來苔影，中央稍後補上一位。",
        "gap": 12,
        "bonus": 80,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 0,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 3.6,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 5.76,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 10.8,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 15.84,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 19.44,
            "lane": 3,
            "type": "runner"
          }
        ]
      },
      {
        "name": "果籃後的腳步",
        "brief": "兩端跳葉影錯開，內側只需基本射手。",
        "gap": 12,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 0.7,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 5.04,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 5.74,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 8.64,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 11.52,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 14.4,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 18,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 21.6,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "厚皮果實",
        "brief": "上下路苔影較耐打，中央有一小群。",
        "gap": 12,
        "bonus": 90,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 4.32,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 5.12,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 5.92,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 7.92,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 8.64,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 12.96,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 15.84,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 19.44,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 21.6,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "兩邊都照顧",
        "brief": "一側群體、一側跳躍，下一段交換。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 0.72,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 1.44,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 5.04,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 5.74,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 6.44,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 10.08,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 10.8,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 11.52,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 15.84,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 16.54,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 17.24,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 19.44,
            "lane": 2,
            "type": "runner"
          }
        ]
      },
      {
        "name": "滿滿兩籃",
        "brief": "邊路各有厚殼與快客，內側來客較晚。",
        "gap": 12,
        "bonus": 115,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 2.88,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 3.68,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 4.48,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 5.76,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 8.64,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 11.52,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 15.12,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 18,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 18.7,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 20.88,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 21.58,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 24.48,
            "lane": 2,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 14,
    "title": "晚到的急性子",
    "chapter": 3,
    "biome": "orchard",
    "subtitle": "風鈴果園 · 看清隊伍裡的快慢",
    "tip": "疾腳影會追上慢隊伍。霜鈴蘭能把速度拉近，莓果炮則能利用聚在一起的時機。",
    "brief": "先來的是厚殼，後面才是快腳。別只看第一位敵人，波次預告能幫你留好應對。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 550,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        0,
        4
      ],
      [
        4,
        4
      ]
    ],
    "fertile": [
      [
        1,
        2
      ],
      [
        3,
        2
      ]
    ],
    "waves": [
      {
        "name": "慢慢走、快快到",
        "brief": "中路厚殼先出現，疾腳影稍後追上。",
        "gap": 12,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 11.52,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 18.72,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 21.6,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "上下追趕",
        "brief": "上路與下路各有一對快慢搭配。",
        "gap": 12,
        "bonus": 90,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 3.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 4.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 5.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 7.92,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 12.24,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 15.84,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 18.72,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 22.32,
            "lane": 2,
            "type": "hopper"
          }
        ]
      },
      {
        "name": "跳躍換拍",
        "brief": "中央改成跳葉影，邊路維持慢快接力。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 2.16,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 5.76,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 6.46,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 7.16,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 8.64,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 9.34,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 12.24,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 12.94,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 15.84,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 16.56,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 19.44,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 20.16,
            "lane": 3,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "留一個後手",
        "brief": "前半厚殼，後半快腳，波中有清楚空檔。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.44,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 2.24,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 3.04,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 3.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 4.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 5.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 12.24,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 15.12,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 18,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 20.88,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 24.48,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "果園交錯曲",
        "brief": "三組快慢小隊錯開，不需要同時處理全部。",
        "gap": 12,
        "bonus": 115,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 3.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 4.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 5.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 7.9,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 8.6,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 10.08,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 13.68,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 16.56,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 17.28,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 18,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 21.6,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 22.32,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 23.04,
            "lane": 4,
            "type": "swarm"
          }
        ]
      }
    ]
  },
  {
    "id": 15,
    "title": "風鈴大合奏",
    "chapter": 3,
    "biome": "orchard",
    "subtitle": "風鈴果園 · 有前排，也有後備",
    "tip": "兩層防線不必每路一樣。跳躍多的路留後備，厚殼多的路加赤葉扇或莓果炮。",
    "brief": "果園章末把輪唱、邊路和跳躍組合在一起。每次轉換前都留有準備空檔。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 575,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        1,
        5
      ],
      [
        3,
        5
      ]
    ],
    "fertile": [
      [
        0,
        2
      ],
      [
        2,
        1
      ],
      [
        4,
        2
      ]
    ],
    "waves": [
      {
        "name": "先聽前奏",
        "brief": "外側苔影，中路跳躍，輕輕暖身。",
        "gap": 12,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 0,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 3.6,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 7.2,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 10.08,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 15.12,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 18.72,
            "lane": 4,
            "type": "runner"
          }
        ]
      },
      {
        "name": "上下應答",
        "brief": "兩翼厚殼先後抵達，中央小群稍晚。",
        "gap": 12,
        "bonus": 90,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 4.32,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 5.12,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 5.92,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 8.64,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 9.36,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 10.08,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 14.4,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 18.72,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 22.32,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "果籃舞步",
        "brief": "跳葉影走邊路，厚殼走內側。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 0.7,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 1.4,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 4.32,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 5.02,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 5.72,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 7.2,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 11.52,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 12.32,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 15.84,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 19.44,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 21.6,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 23.76,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "一陣風過後",
        "brief": "前後兩陣群體之間有修補時間。",
        "gap": 12,
        "bonus": 105,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 0.3,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 0.6,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 0.72,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 1,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 1.3,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 1.44,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 1.7,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 4.32,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 4.6,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 4.9,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 5.04,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 5.3,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 5.6,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 5.76,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 6,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 6.3,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 13.68,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 16.56,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 19.44,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 23.76,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 25.2,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "風鈴謝幕",
        "brief": "五路的老朋友齊聚，壓力分成幾個小段。",
        "gap": 12,
        "bonus": 125,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 2.88,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 3.68,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 4.48,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 5.76,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 6.46,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 7.16,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 8.64,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 12.24,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 15.84,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 16.56,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 17.28,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 20.88,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 21.6,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 22.32,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 25.92,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 26.72,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 27.52,
            "lane": 2,
            "type": "shell"
          }
        ]
      }
    ]
  },
  {
    "id": 16,
    "title": "提燈來客",
    "chapter": 4,
    "biome": "dusk",
    "subtitle": "月影花境 · 先看見隊伍的幫手",
    "tip": "提燈影會替附近同伴回血。範圍傷害或星火蕾可以一起處理它與周圍的小隊。",
    "brief": "夜色裡出現一盞小燈。先認識會治療的提燈影，再學會拆開它照顧的隊伍。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 550,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        0,
        5
      ],
      [
        4,
        5
      ]
    ],
    "fertile": [
      [
        2,
        2
      ],
      [
        1,
        3
      ],
      [
        3,
        3
      ]
    ],
    "waves": [
      {
        "name": "一盞小燈",
        "brief": "提燈影先獨自走中央，稍後才有同行者。",
        "gap": 15,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 7.2,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 10.08,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 14.4,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 18,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 21.6,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 23.76,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "小燈與雨點",
        "brief": "上路提燈與小群，下路只有普通隊伍。",
        "gap": 12,
        "bonus": 90,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 2.16,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 4.32,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 4.72,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 5.04,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 5.44,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 5.76,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 10.8,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 15.12,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 19.44,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "把燈找出來",
        "brief": "下路有提燈幫手，中路厚殼可以慢慢處理。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 0.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 2.16,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 4.32,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 8.64,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 9.44,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 12.96,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 17.28,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 20.88,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 23.76,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "燈下的快慢",
        "brief": "提燈走中央，兩翼快客錯開。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 2.88,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 6.48,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 10.08,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 10.78,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 12.96,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 13.66,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 16.56,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 17.28,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 20.16,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 20.88,
            "lane": 3,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "第一場燈會",
        "brief": "兩盞燈相隔較遠，先處理其中一隊即可。",
        "gap": 12,
        "bonus": 120,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 2.16,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 5.04,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 10.8,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 11.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 12.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 12.96,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 15.84,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 19.44,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 23.04,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 26.64,
            "lane": 2,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 17,
    "title": "小小蘑菇燈會",
    "chapter": 4,
    "biome": "dusk",
    "subtitle": "月影花境 · 把擁擠變成優勢",
    "tip": "隊伍越擠，莓果炮越有價值。星火蕾留給提燈與小群重疊的時候。",
    "brief": "小團影圍著提燈結隊。這一關讓範圍火力當主角，其他路的壓力較輕。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 575,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        2,
        5
      ]
    ],
    "fertile": [
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        3,
        2
      ]
    ],
    "waves": [
      {
        "name": "中央小聚",
        "brief": "一盞燈與中央小群先暖身。",
        "gap": 12,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 2.16,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 2.88,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 3.6,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 9.36,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 13.68,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 18,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 21.6,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "上半場燈會",
        "brief": "上半部先熱鬧，下方只有苔影。",
        "gap": 12,
        "bonus": 90,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 2.16,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.7,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.88,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3.3,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3.6,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3.6,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3.9,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 4.2,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 4.5,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 7.2,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 7.92,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 8.64,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 14.4,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 19.44,
            "lane": 4,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "下半場燈會",
        "brief": "下半部接棒，留意沒有範圍火力的路。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 2.16,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 2.4,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 2.7,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 2.88,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 3,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 3.3,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 3.6,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 3.6,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 3.9,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 4.2,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 4.5,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 7.2,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 7.92,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 8.64,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 14.4,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 19.44,
            "lane": 0,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "小燈換位置",
        "brief": "提燈改走邊路，中央疾腳影稍後才到。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 2.16,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 4.32,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 5.04,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 5.76,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 11.52,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 12.32,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 13.12,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 18,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 21.6,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 24.48,
            "lane": 3,
            "type": "runner"
          }
        ]
      },
      {
        "name": "蘑菇圓舞曲",
        "brief": "兩團燈會前後錯開，各留一次處理機會。",
        "gap": 12,
        "bonus": 125,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 2.16,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.7,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.88,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3.3,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3.6,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3.6,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3.9,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 4.2,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 4.5,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 7.2,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 9.36,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 9.6,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 9.9,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.08,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.2,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.5,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.8,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.8,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 11.1,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 11.4,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 11.7,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 16.56,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 20.88,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 25.2,
            "lane": 2,
            "type": "hopper"
          }
        ]
      }
    ]
  },
  {
    "id": 18,
    "title": "月光棋盤",
    "chapter": 4,
    "biome": "dusk",
    "subtitle": "月影花境 · 留白也是防線的一部分",
    "tip": "石塊只是少數不能種植的格子。先在左半部建立骨架，再利用肥沃格補強。",
    "brief": "月光映出交錯石塊。每路都有完整後排，前排則需要選一個更合適的位置。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 575,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        0,
        4
      ],
      [
        1,
        5
      ],
      [
        2,
        4
      ],
      [
        3,
        5
      ],
      [
        4,
        4
      ]
    ],
    "fertile": [
      [
        0,
        2
      ],
      [
        1,
        3
      ],
      [
        2,
        2
      ],
      [
        3,
        3
      ],
      [
        4,
        2
      ]
    ],
    "waves": [
      {
        "name": "沿著空格種下",
        "brief": "先以苔影熟悉石塊位置。",
        "gap": 12,
        "bonus": 85,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 2.88,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 5.76,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 9.36,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 12.96,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 17.28,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 20.88,
            "lane": 4,
            "type": "runner"
          }
        ]
      },
      {
        "name": "內外分工",
        "brief": "內側厚殼，外側跳躍，需要不同的防線。",
        "gap": 12,
        "bonus": 90,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 4.32,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 5.12,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 5.92,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 8.64,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 9.34,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 12.96,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 13.66,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 16.56,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 20.16,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 23.76,
            "lane": 3,
            "type": "runner"
          }
        ]
      },
      {
        "name": "中央燈影",
        "brief": "中路提燈有夥伴，兩翼小群則各自成隊。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 0.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 2.16,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 2.4,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 4.32,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 8.64,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 9.36,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 10.08,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 15.12,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 15.84,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 16.56,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 21.6,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 24.48,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "棋盤換步",
        "brief": "快客先走內側，跳躍從中央跟上。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 3.6,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 7.2,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 7.9,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 10.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 11.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 12.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 15.12,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 15.92,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 16.72,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 19.44,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 22.32,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 25.2,
            "lane": 2,
            "type": "runner"
          }
        ]
      },
      {
        "name": "月光落子",
        "brief": "三段不同隊形，仍有足夠空格重新整理。",
        "gap": 12,
        "bonus": 125,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 2.16,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 5.76,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 6.56,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 7.36,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 7.92,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 12.24,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 13.04,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 15.84,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 16.64,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 19.44,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 20.16,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 20.88,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 24.48,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 28.08,
            "lane": 4,
            "type": "hopper"
          }
        ]
      }
    ]
  },
  {
    "id": 19,
    "title": "一盞接著一盞",
    "chapter": 4,
    "biome": "dusk",
    "subtitle": "月影花境 · 留好下一次應對",
    "tip": "不要把所有救急手段都用在第一隊。每波分成兩段，波次預告能幫你保留芽光。",
    "brief": "提燈隊伍總是成對出現，但中間有空檔。處理第一隊後，再慢慢轉向第二隊。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 575,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        1,
        4
      ],
      [
        3,
        4
      ]
    ],
    "fertile": [
      [
        0,
        1
      ],
      [
        2,
        3
      ],
      [
        4,
        1
      ]
    ],
    "waves": [
      {
        "name": "左右各一盞",
        "brief": "兩隊小燈分成前後兩段。",
        "gap": 12,
        "bonus": 90,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 2.16,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 5.04,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 12.96,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 15.12,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 18,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 22.32,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 25.92,
            "lane": 2,
            "type": "runner"
          }
        ]
      },
      {
        "name": "內側接力",
        "brief": "先上內側，後下內側，厚殼各有幫手。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 2.88,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 14.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 15.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 16,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 16.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 17.28,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 21.6,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 24.48,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 27.36,
            "lane": 2,
            "type": "hopper"
          }
        ]
      },
      {
        "name": "快客穿插",
        "brief": "兩隊群體之間穿插一位疾腳影。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 0.4,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 0.72,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 1.2,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 1.44,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 2,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 4.32,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 9.36,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 15.12,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 15.52,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 15.84,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 15.92,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 16.32,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 16.56,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 16.72,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 17.12,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 19.44,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 24.48,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 27.36,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "跳躍也分先後",
        "brief": "兩側跳葉影錯開，提燈留在中央。",
        "gap": 12,
        "bonus": 105,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 0.7,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 1.4,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 5.76,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 9.36,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 12.24,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 15.84,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 16.54,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 17.24,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 20.16,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 23.76,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 27.36,
            "lane": 3,
            "type": "runner"
          }
        ]
      },
      {
        "name": "夜路接棒",
        "brief": "四小段依序來到，每次先照顧當下最危險的一路。",
        "gap": 12,
        "bonus": 125,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 2.88,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 7.92,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 12.96,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 13.76,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 14.56,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 15.36,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 15.84,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 20.88,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 25.2,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 25.92,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 26.64,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 30.24,
            "lane": 2,
            "type": "hopper"
          }
        ]
      }
    ]
  },
  {
    "id": 20,
    "title": "月影守燈人",
    "chapter": 4,
    "biome": "dusk",
    "subtitle": "月影花境 · 讓花園的光亮留下",
    "tip": "每盞燈都能看見對應的路線。厚殼旁補穿透，群體旁補範圍，快客旁補減速。",
    "brief": "月影章末不增加新規則，而是把你學過的答案放到不同道路。看清隊形再下手。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 600,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        0,
        5
      ],
      [
        2,
        5
      ],
      [
        4,
        5
      ]
    ],
    "fertile": [
      [
        1,
        2
      ],
      [
        2,
        1
      ],
      [
        3,
        2
      ]
    ],
    "waves": [
      {
        "name": "提燈前奏",
        "brief": "中央燈隊先暖身，邊路普通來客稍後到。",
        "gap": 12,
        "bonus": 90,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 2.16,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 5.04,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 8.64,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 11.52,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 15.84,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 19.44,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 23.04,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "厚殼雙燈",
        "brief": "兩隊厚殼與提燈分成兩段抵達。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 2.88,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 7.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 8.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 9.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 10.08,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 15.12,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 18,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 21.6,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 22.32,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 23.04,
            "lane": 2,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "兩翼燈會",
        "brief": "邊路群體各有一盞燈，內側來客較晚。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 2.16,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 2.4,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 2.8,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 2.88,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 3.2,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 3.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 3.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 4,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 4.4,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 4.8,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 5.2,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 8.64,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 10.8,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 11.04,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 11.44,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 11.52,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 11.84,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 12.24,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 12.24,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 12.64,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 13.04,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 13.44,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 13.84,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 17.28,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 21.6,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 25.92,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "月影變奏",
        "brief": "提燈與跳躍分路，外側有疾腳影。",
        "gap": 12,
        "bonus": 110,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 2.88,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 6.48,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 7.18,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 10.8,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 11.5,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 15.12,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 18.72,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 22.32,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 25.2,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 28.08,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 28.8,
            "lane": 2,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "把燈留在花園",
        "brief": "最後三隊逐段登場，保留一點芽光就能補救。",
        "gap": 12,
        "bonus": 135,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 2.88,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 3.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 6.48,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 7.28,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 8.08,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 8.88,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 9.36,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 9.68,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 15.12,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 15.84,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 19.44,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 20.16,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 20.88,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 24.48,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 28.8,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 31.68,
            "lane": 4,
            "type": "runner"
          }
        ]
      }
    ]
  },
  {
    "id": 21,
    "title": "大塊頭慢慢來",
    "chapter": 5,
    "biome": "frost",
    "subtitle": "霜葉溫室 · 耐心也是一種火力",
    "tip": "巨根影很耐打，但走得最慢。霜鈴蘭、持續火力與藤編牆一起用，比只靠一次星火蕾穩。",
    "brief": "第一位巨根影獨自走中央。牠給你充足時間觀察，也提醒你把防線種得更深。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 600,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [],
    "fertile": [
      [
        2,
        1
      ],
      [
        2,
        2
      ],
      [
        1,
        3
      ],
      [
        3,
        3
      ]
    ],
    "waves": [
      {
        "name": "巨枝初見",
        "brief": "中央只有一位巨根影，其他路很晚才來客。",
        "gap": 16,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "brute"
          },
          {
            "at": 9.6,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 12.6,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 16.2,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 19.2,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 22.2,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "把時間留下",
        "brief": "上內側巨枝，外側是錯開的疾腳影。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "brute"
          },
          {
            "at": 4.2,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 7.2,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 10.8,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 12,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 12.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 13.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 18,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 21,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 23.4,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "慢樹與小芽",
        "brief": "下內側巨枝，中央的小群可用範圍火力照顧。",
        "gap": 12,
        "bonus": 105,
        "spawns": [
          {
            "at": 0,
            "lane": 3,
            "type": "brute"
          },
          {
            "at": 3.6,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 4.2,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 4.8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 9,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 9.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 10.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 11.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 12.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 13.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 17.4,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 21,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 23.4,
            "lane": 2,
            "type": "runner"
          }
        ]
      },
      {
        "name": "整理溫室",
        "brief": "這波沒有巨枝，趁機補上經濟與修補。",
        "gap": 12,
        "bonus": 110,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 2.4,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 4.8,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 8.4,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 12,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 12.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 13.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 15.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 16.2,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 19.2,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 19.8,
            "lane": 4,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "兩棵慢慢走的樹",
        "brief": "兩位巨枝前後錯開，普通來客則分走其他路。",
        "gap": 12,
        "bonus": 135,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "brute"
          },
          {
            "at": 7.2,
            "lane": 3,
            "type": "brute"
          },
          {
            "at": 10,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 10.8,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 10.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 11.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 12.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 13.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 13.8,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 16.8,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 19.8,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 22.8,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 25.8,
            "lane": 2,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 22,
    "title": "溫室的暖陽",
    "chapter": 5,
    "biome": "frost",
    "subtitle": "霜葉溫室 · 養成會長大的防線",
    "tip": "後排肥沃格很適合暖燈花。先建立基本火力，再把多出的芽光投入長期防線。",
    "brief": "溫室後排留了五格沃土。這場較長的守園，會獎勵你早早種下的小小投資。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 575,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        1,
        5
      ],
      [
        3,
        5
      ]
    ],
    "fertile": [
      [
        0,
        0
      ],
      [
        1,
        0
      ],
      [
        2,
        0
      ],
      [
        3,
        0
      ],
      [
        4,
        0
      ]
    ],
    "waves": [
      {
        "name": "暖陽開窗",
        "brief": "前半苔影少，先建立每路的基本守備。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 3,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 6,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 9.6,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 13.2,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 17.4,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 21,
            "lane": 4,
            "type": "runner"
          }
        ]
      },
      {
        "name": "養好的第一排",
        "brief": "厚殼與跳躍開始考驗防線深度。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 3.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 4.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 5.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 7.8,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 11.4,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 17.4,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 21,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 24,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "投資長大了",
        "brief": "中央巨枝登場，側邊仍有小群需要照顧。",
        "gap": 12,
        "bonus": 110,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "brute"
          },
          {
            "at": 4.8,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 5.4,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 10.2,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 10.8,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 11.4,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 16.2,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 16.2,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 17,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 17.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 18.6,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 18.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 21.6,
            "lane": 3,
            "type": "hopper"
          }
        ]
      },
      {
        "name": "霜葉修補時",
        "brief": "兩隊提燈分路，留意前排生命與後排空格。",
        "gap": 12,
        "bonus": 115,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 2.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 8.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 9.6,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 9.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 13.8,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 17.4,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 21,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 21.6,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 22.2,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 25.2,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "暖陽留到最後",
        "brief": "內側兩位巨枝逐一抵達，外側隊伍依然分段。",
        "gap": 12,
        "bonus": 140,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "brute"
          },
          {
            "at": 6,
            "lane": 3,
            "type": "brute"
          },
          {
            "at": 10.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 10.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 11.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 12.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 13.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 14,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 15.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 16,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 16.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 17.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 18.6,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 21.6,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 24.6,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 27.6,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 30,
            "lane": 3,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 23,
    "title": "霜葉的邊境",
    "chapter": 5,
    "biome": "frost",
    "subtitle": "霜葉溫室 · 把耐心放在兩側",
    "tip": "巨根影這次常走最外側。邊路放好持續火力，中央的肥沃格可支援相鄰植物。",
    "brief": "兩側花徑較長、來客也更耐打。中間仍有充足空間，適合建立安穩的修補核心。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 600,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        0,
        5
      ],
      [
        4,
        5
      ],
      [
        2,
        6
      ]
    ],
    "fertile": [
      [
        0,
        2
      ],
      [
        4,
        2
      ],
      [
        2,
        3
      ]
    ],
    "waves": [
      {
        "name": "最上路的腳步",
        "brief": "上方巨枝先來，下方與中央稍後暖身。",
        "gap": 12,
        "bonus": 95,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "brute"
          },
          {
            "at": 6,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 9,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 12.6,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 16.2,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 19.8,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 22.8,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "最下路的回聲",
        "brief": "下方巨枝接棒，上方改成厚殼。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 4,
            "type": "brute"
          },
          {
            "at": 4.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 5.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 6.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 9,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 12.6,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 16.2,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 19.8,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 23.4,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 25.8,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "中央也要顧",
        "brief": "兩邊暫緩，中央提燈小群需要範圍火力。",
        "gap": 12,
        "bonus": 110,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 0.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 1.8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 2.4,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 2.4,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 3,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 3.2,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 11.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 15.6,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 19.8,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 24,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "一邊慢、一邊快",
        "brief": "上邊巨枝，下邊跳躍，內側快客錯開。",
        "gap": 12,
        "bonus": 115,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "brute"
          },
          {
            "at": 4.2,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 8.4,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 12,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 15.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 16.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 17.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 18,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 18.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 19.2,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 19.8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 20.4,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 24.6,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 27,
            "lane": 4,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "守住兩端的光",
        "brief": "巨枝走兩翼，中間來客間隔清楚。",
        "gap": 12,
        "bonus": 140,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "brute"
          },
          {
            "at": 7.2,
            "lane": 4,
            "type": "brute"
          },
          {
            "at": 11.4,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 12.2,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 13,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 13.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 14.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 15.4,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 15.6,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 18,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 21.6,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 25.2,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 28.2,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 30.6,
            "lane": 4,
            "type": "drifter"
          }
        ]
      }
    ]
  },
  {
    "id": 24,
    "title": "補給接力站",
    "chapter": 5,
    "biome": "frost",
    "subtitle": "霜葉溫室 · 每波都能重新站穩",
    "tip": "本關每波補給更充足。先修好最薄弱的一路，再考慮添新植物。",
    "brief": "守園隊送來額外的波次補給。即使上一波手忙腳亂，下一波仍有機會重新整理。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 550,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        0,
        4
      ],
      [
        4,
        4
      ]
    ],
    "fertile": [
      [
        1,
        3
      ],
      [
        2,
        3
      ],
      [
        3,
        3
      ]
    ],
    "waves": [
      {
        "name": "第一箱補給",
        "brief": "普通來客為主，結束後有充足芽光可補種。",
        "gap": 12,
        "bonus": 130,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 2.4,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 4.8,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 8.4,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 12,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 15.6,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 18.6,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 21.6,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "前排補強箱",
        "brief": "內側厚殼與跳躍交錯，保留後備位置。",
        "gap": 12,
        "bonus": 140,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 3.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 4.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 5.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 11.4,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 15.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 16.2,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 16.8,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 20.4,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 21,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 21.6,
            "lane": 4,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "給中央的支援",
        "brief": "中央巨枝配合外側小隊，補給仍然充足。",
        "gap": 12,
        "bonus": 150,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "brute"
          },
          {
            "at": 4.8,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 5.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 6.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 7.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 12,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 12.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 13.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 18.6,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 22.2,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 25.8,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "整理好再接棒",
        "brief": "群體與快客交替，這波沒有巨枝。",
        "gap": 12,
        "bonus": 155,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 1.8,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.8,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3.2,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3.6,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 4.4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 4.8,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 5.2,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 7.2,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 9,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 9.6,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 9.6,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.2,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.4,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.8,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 11.2,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 11.6,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 12,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 12.4,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 15,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 19.2,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 23.4,
            "lane": 2,
            "type": "runner"
          }
        ]
      },
      {
        "name": "把補給化成花園",
        "brief": "最後兩位巨枝分路慢行，讓完整防線接力。",
        "gap": 12,
        "bonus": 165,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "brute"
          },
          {
            "at": 7.2,
            "lane": 3,
            "type": "brute"
          },
          {
            "at": 11.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 12.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 13,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 13.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 14.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 15.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 15.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 16.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 17.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 18,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 18.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 19.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 19.8,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 22.8,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 25.2,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 28.2,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 31.2,
            "lane": 4,
            "type": "runner"
          }
        ]
      }
    ]
  },
  {
    "id": 25,
    "title": "古樹溫室之心",
    "chapter": 5,
    "biome": "frost",
    "subtitle": "霜葉溫室 · 穩穩站到最後",
    "tip": "巨根影與提燈影分路時，先清掉能快速處理的小隊，再把火力留給耐打的對手。",
    "brief": "溫室章末需要一座能修補、能減速、也能持續輸出的花園。波次之間放心整理。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 625,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        1,
        5
      ],
      [
        3,
        5
      ]
    ],
    "fertile": [
      [
        0,
        1
      ],
      [
        2,
        2
      ],
      [
        4,
        1
      ],
      [
        2,
        3
      ]
    ],
    "waves": [
      {
        "name": "古樹前奏",
        "brief": "中央巨枝，其他路以苔影暖身。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "brute"
          },
          {
            "at": 6,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 9,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 12,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 15,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 18.6,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 22.2,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 25.2,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "溫室兩翼",
        "brief": "邊路各有厚殼燈隊，中央稍後跳躍。",
        "gap": 12,
        "bonus": 110,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 2.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 3.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 7.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 8.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 9.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 10.2,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 10.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 11,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 15,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 18.6,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 19.2,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 19.8,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 23.4,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 24,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 24.6,
            "lane": 3,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "枝幹與嫩芽",
        "brief": "內側巨枝分別登場，中央小群先行。",
        "gap": 12,
        "bonus": 120,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "brute"
          },
          {
            "at": 4.2,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 4.8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 5.4,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 9,
            "lane": 3,
            "type": "brute"
          },
          {
            "at": 14.4,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 15,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 15.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 16.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 17.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 18.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 18.6,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 22.8,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 26.4,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "最後一次修補",
        "brief": "沒有巨枝的整理波，混合小隊仍需留意。",
        "gap": 12,
        "bonus": 125,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 3.2,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 6.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 7.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 8.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 9,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 9,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 9.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 13.2,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 16.8,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 20.4,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 24,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 24.6,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 27.6,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 28.2,
            "lane": 3,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "古樹之心",
        "brief": "兩翼巨枝與中央燈隊依次前進，逐個拆解。",
        "gap": 12,
        "bonus": 150,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "brute"
          },
          {
            "at": 7.2,
            "lane": 4,
            "type": "brute"
          },
          {
            "at": 12,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 12.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 13.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 14.4,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 15.2,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 16,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 18.6,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 22.8,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 26.4,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 27,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 27.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 30.6,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 31.2,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 31.8,
            "lane": 4,
            "type": "swarm"
          }
        ]
      }
    ]
  },
  {
    "id": 26,
    "title": "月下重逢",
    "chapter": 6,
    "biome": "moon",
    "subtitle": "曙光盛典 · 熟悉的朋友換條路",
    "tip": "這一章沒有新敵人。依照每波的路線與隊形，使用你最順手的組合。",
    "brief": "最後一章從從容的重逢開始。先把花園種起來，再讓所有學過的答案找到位置。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 625,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [],
    "fertile": [
      [
        0,
        2
      ],
      [
        2,
        2
      ],
      [
        4,
        2
      ]
    ],
    "waves": [
      {
        "name": "老朋友問候",
        "brief": "五路苔影依次登場，中央有一位疾腳影。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 4.8,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 7.2,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 9.6,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 13.2,
            "lane": 2,
            "type": "runner"
          },
          {
            "at": 16.8,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 20.4,
            "lane": 4,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "兩場小聚會",
        "brief": "上路燈會，下路厚殼，中央跳躍稍後到。",
        "gap": 12,
        "bonus": 105,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 1.8,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 3,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 7.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 7.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 8.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 9.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 10.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 10.8,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 18,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 21.6,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "慢慢走的重逢",
        "brief": "中央巨枝，邊路兩組快慢小隊。",
        "gap": 12,
        "bonus": 115,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "brute"
          },
          {
            "at": 4.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 5,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 5.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 6.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 7.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 7.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 8.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 9.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 10.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 11,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 12,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 16.2,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 20.4,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 23.4,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 26.4,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "月下輪唱",
        "brief": "跳躍由上往下，提燈在中間照顧小隊。",
        "gap": 12,
        "bonus": 120,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 0.7,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 4.2,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 4.9,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 8.4,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 9.2,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 10,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 10.2,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 10.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 15.1,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 18.6,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 19.3,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 22.2,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 22.8,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 25.8,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 26.4,
            "lane": 4,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "重逢的合照",
        "brief": "巨枝走中央，兩翼群體錯開登場。",
        "gap": 12,
        "bonus": 145,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "brute"
          },
          {
            "at": 4.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 5.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 6.4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 8.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 9,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 9.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 10.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 11.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 12.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 13,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 13.2,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 15,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 15.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 16.2,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 20.4,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 22.2,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 22.8,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 23.4,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 27.6,
            "lane": 2,
            "type": "hopper"
          }
        ]
      }
    ]
  },
  {
    "id": 27,
    "title": "月壇環形花圃",
    "chapter": 6,
    "biome": "moon",
    "subtitle": "曙光盛典 · 用地形畫出自己的答案",
    "tip": "中央一整排肥沃格能強化火力或修補。前方石塊不影響射擊，選好位置就能利用它們。",
    "brief": "月壇上的石塊像一圈花邊，每路仍有足夠的後排與前排空格。把你的拿手防線種進去。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 650,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        0,
        5
      ],
      [
        1,
        4
      ],
      [
        2,
        6
      ],
      [
        3,
        4
      ],
      [
        4,
        5
      ]
    ],
    "fertile": [
      [
        0,
        2
      ],
      [
        1,
        2
      ],
      [
        2,
        2
      ],
      [
        3,
        2
      ],
      [
        4,
        2
      ]
    ],
    "waves": [
      {
        "name": "描出花圃輪廓",
        "brief": "邊路厚殼、內側普通來客，先熟悉空格。",
        "gap": 12,
        "bonus": 100,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 3.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 10.2,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 13.2,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 16.8,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 20.4,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 23.4,
            "lane": 2,
            "type": "hopper"
          }
        ]
      },
      {
        "name": "環形腳步",
        "brief": "五路依序有不同來客，跳躍需要後備。",
        "gap": 12,
        "bonus": 110,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 0.7,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 3.6,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 7.2,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 8.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 9.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 10.4,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 10.8,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 11.2,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 15.1,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 18,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 20.4,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 23.4,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 24,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 24.6,
            "lane": 2,
            "type": "swarm"
          }
        ]
      },
      {
        "name": "中心的慢樹",
        "brief": "中央巨枝，兩側提燈小隊錯開。",
        "gap": 12,
        "bonus": 120,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "brute"
          },
          {
            "at": 4.8,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 5.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 6.4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 7.2,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 12,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 12.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 13.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 14.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 15.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 18.6,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 22.2,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 25.8,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 28.2,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "花圃兩端",
        "brief": "巨枝轉往上路，下路範圍火力有用武之地。",
        "gap": 12,
        "bonus": 125,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "brute"
          },
          {
            "at": 4.8,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 6.6,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 7.2,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 7.8,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 12,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 12.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 13.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 15.2,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 16.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 17,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 17.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 18.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 19.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 20.4,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 24.6,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 27.6,
            "lane": 4,
            "type": "runner"
          }
        ]
      },
      {
        "name": "月壇盛開",
        "brief": "兩翼巨枝與中央群體讓不同植物各展所長。",
        "gap": 12,
        "bonus": 150,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "brute"
          },
          {
            "at": 7.2,
            "lane": 4,
            "type": "brute"
          },
          {
            "at": 11.4,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 13.2,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 13.8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 14.4,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 18.6,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 22.8,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 26.4,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 30,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 33.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 34.4,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 35.2,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 36,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 36.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 37.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 38.4,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 39.2,
            "lane": 2,
            "type": "shell"
          }
        ]
      }
    ]
  },
  {
    "id": 28,
    "title": "三拍小夜曲",
    "chapter": 6,
    "biome": "moon",
    "subtitle": "曙光盛典 · 厚殼、群體、快腳",
    "tip": "每波有清楚的三段節奏。先看厚殼在哪，再找群體，最後替疾腳影留好減速。",
    "brief": "厚殼、群體、快腳依次上場。你能從容處理一段，再用下一段檢查防線是否完整。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 650,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        2,
        5
      ]
    ],
    "fertile": [
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        3,
        2
      ],
      [
        4,
        1
      ]
    ],
    "waves": [
      {
        "name": "第一拍：慢與快",
        "brief": "中央厚殼起頭，群體和快客分走兩側。",
        "gap": 12,
        "bonus": 105,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 4.2,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 4.8,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 5.4,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 9.6,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.2,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 10.8,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 15.6,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 19.8,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 24,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "第二拍：換個方向",
        "brief": "外側厚殼先來，中間小群，最後內側快客。",
        "gap": 12,
        "bonus": 115,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 3.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 3.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 4.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 5.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 6.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 7.8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 8.4,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 9,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 13.2,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 17.4,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 21.6,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 25.8,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 28.2,
            "lane": 4,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "第三拍：跳過前排",
        "brief": "內側厚殼、邊路小群，中央跳躍替代衝刺。",
        "gap": 12,
        "bonus": 120,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 3.2,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 4.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 5,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 5.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 6.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 7.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 8.4,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 9,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 9.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 13.8,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 15,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 19.8,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 24,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 27.6,
            "lane": 3,
            "type": "runner"
          }
        ]
      },
      {
        "name": "慢板與燈影",
        "brief": "一位巨枝開場，兩隊燈會分段出現。",
        "gap": 12,
        "bonus": 130,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "brute"
          },
          {
            "at": 6,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 7.8,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 7.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 8.4,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 8.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 9,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 9.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 10.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 15,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 16.8,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 16.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 17.4,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 17.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 18,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 18.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 19.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 23.4,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 27.6,
            "lane": 3,
            "type": "runner"
          }
        ]
      },
      {
        "name": "三拍重奏",
        "brief": "巨枝與厚殼先行，接著群體，最後是跳躍。",
        "gap": 12,
        "bonus": 150,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "brute"
          },
          {
            "at": 4.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 5.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 6.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 7.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 8.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 9.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 10.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 12,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 12.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 13.2,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 17.4,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 18,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 18.6,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 23.4,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 27.6,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 31.8,
            "lane": 4,
            "type": "runner"
          }
        ]
      }
    ]
  },
  {
    "id": 29,
    "title": "給黎明的練習",
    "chapter": 6,
    "biome": "moon",
    "subtitle": "曙光盛典 · 找出花園最後的空缺",
    "tip": "每波偏重不同能力。波間檢查：每路有火力嗎？厚殼有答案嗎？跳躍後還有後備嗎？",
    "brief": "盛典前的最後一次彩排。把每波當成一次小檢查，缺哪一塊就補哪一塊。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 650,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        1,
        5
      ],
      [
        3,
        5
      ]
    ],
    "fertile": [
      [
        0,
        2
      ],
      [
        2,
        1
      ],
      [
        2,
        3
      ],
      [
        4,
        2
      ]
    ],
    "waves": [
      {
        "name": "檢查：每路都有守護",
        "brief": "五路依次來客，中路厚殼考驗持續火力。",
        "gap": 12,
        "bonus": 105,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 4.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 9.6,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 13.2,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 16.8,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 20.4,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 24,
            "lane": 3,
            "type": "hopper"
          }
        ]
      },
      {
        "name": "檢查：範圍與穿透",
        "brief": "外側厚殼，內側兩團提燈小隊。",
        "gap": 12,
        "bonus": 115,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 3.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 3.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 4.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 5.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 6.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 7.8,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 9.6,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 10.2,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 10.8,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 15,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 16.8,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 17.4,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 18,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 22.8,
            "lane": 2,
            "type": "runner"
          }
        ]
      },
      {
        "name": "檢查：前後兩道防線",
        "brief": "跳葉影輪流試探，巨枝在中央慢行。",
        "gap": 12,
        "bonus": 125,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "brute"
          },
          {
            "at": 4.8,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 9,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 13.2,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 17.4,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 21.6,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 24.6,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 27.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 28.4,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 29.2,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 30,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 30.6,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 30.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 31.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 32.4,
            "lane": 2,
            "type": "shell"
          }
        ]
      },
      {
        "name": "檢查：修補與後手",
        "brief": "兩翼巨枝，中間分段來客，留好補種資源。",
        "gap": 12,
        "bonus": 135,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "brute"
          },
          {
            "at": 7.2,
            "lane": 4,
            "type": "brute"
          },
          {
            "at": 12,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 12.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 13.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 14.4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 15.2,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 16,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 19.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 20,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 20.8,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 21.6,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 21.6,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 22.4,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 23.2,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 25.8,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 26.4,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 27,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 31.2,
            "lane": 2,
            "type": "hopper"
          }
        ]
      },
      {
        "name": "彩排謝幕",
        "brief": "五路混合隊形，用完整花園接住最後一輪。",
        "gap": 12,
        "bonus": 155,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "brute"
          },
          {
            "at": 4.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 5.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 6.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 7.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 8.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 9.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 12,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 12.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 13.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 14.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 15.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 16,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 16.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 19.2,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 23.4,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 27,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 27.6,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 28.2,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 31.8,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 32.4,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 33,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 36.6,
            "lane": 2,
            "type": "runner"
          }
        ]
      }
    ]
  },
  {
    "id": 30,
    "title": "曙光盛開之時",
    "chapter": 6,
    "biome": "moon",
    "subtitle": "曙光盛典 · 讓每一朵花都有舞台",
    "tip": "六波會重訪一路學過的本領。勝利只需要守住花園，不必完美；星火蕾和守園車都算你的夥伴。",
    "brief": "最後的守園盛典！每波各有主題，波次補給豐富。把你喜歡的花園種出來，一起等到天亮。",
    "lanes": [
      0,
      1,
      2,
      3,
      4
    ],
    "startSun": 700,
    "lives": 5,
    "available": [
      "glow",
      "pod",
      "frost",
      "bark",
      "mortar",
      "ember",
      "clover",
      "burst"
    ],
    "blocked": [
      [
        0,
        6
      ],
      [
        4,
        6
      ]
    ],
    "fertile": [
      [
        0,
        1
      ],
      [
        1,
        2
      ],
      [
        2,
        1
      ],
      [
        2,
        3
      ],
      [
        3,
        2
      ],
      [
        4,
        1
      ]
    ],
    "waves": [
      {
        "name": "晨露：五路花開",
        "brief": "從熟悉的苔影與快腳開始，先站穩五路。",
        "gap": 12,
        "bonus": 110,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "drifter"
          },
          {
            "at": 1.5,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 3,
            "lane": 2,
            "type": "drifter"
          },
          {
            "at": 4.5,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 6,
            "lane": 4,
            "type": "drifter"
          },
          {
            "at": 9,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 12,
            "lane": 4,
            "type": "runner"
          },
          {
            "at": 15,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 17,
            "lane": 3,
            "type": "drifter"
          },
          {
            "at": 19.5,
            "lane": 2,
            "type": "runner"
          }
        ]
      },
      {
        "name": "雨庭：雨點與厚殼",
        "brief": "厚殼與小群分路，範圍與穿透各有舞台。",
        "gap": 12,
        "bonus": 120,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 2.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 3,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 3.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 3.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 4.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 5.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 6,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 6.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 6.5,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 7,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 10.5,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 11,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 11.5,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 15,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 15.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 16.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 18.5,
            "lane": 0,
            "type": "runner"
          },
          {
            "at": 22,
            "lane": 4,
            "type": "runner"
          }
        ]
      },
      {
        "name": "果園：前後接力",
        "brief": "跳葉影依序探路，後備防線可以從容接手。",
        "gap": 12,
        "bonus": 130,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 0.7,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 1.4,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 3.5,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 4.2,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 4.9,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 7,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 7.7,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 8.4,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 10.5,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 11.2,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 11.9,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 14,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 14.7,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 15.4,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 17,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 20,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 23,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 26,
            "lane": 3,
            "type": "runner"
          },
          {
            "at": 29,
            "lane": 2,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "月影：找出小燈",
        "brief": "三隊提燈各自登場，先看清最需要處理的路。",
        "gap": 12,
        "bonus": 140,
        "spawns": [
          {
            "at": 0,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 0.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 1.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 2,
            "lane": 1,
            "type": "lantern"
          },
          {
            "at": 2.4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 3.2,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 6.5,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 7.3,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 8.1,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 8.5,
            "lane": 3,
            "type": "lantern"
          },
          {
            "at": 8.9,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 9.7,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 10.5,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 13,
            "lane": 2,
            "type": "lantern"
          },
          {
            "at": 14.5,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 15,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 15.5,
            "lane": 2,
            "type": "swarm"
          },
          {
            "at": 19.5,
            "lane": 0,
            "type": "hopper"
          },
          {
            "at": 23,
            "lane": 4,
            "type": "hopper"
          },
          {
            "at": 26.5,
            "lane": 1,
            "type": "drifter"
          },
          {
            "at": 28.5,
            "lane": 3,
            "type": "drifter"
          }
        ]
      },
      {
        "name": "溫室：古樹慢行",
        "brief": "兩翼巨枝慢慢來，內側小隊分段抵達。",
        "gap": 12,
        "bonus": 155,
        "spawns": [
          {
            "at": 0,
            "lane": 0,
            "type": "brute"
          },
          {
            "at": 6,
            "lane": 4,
            "type": "brute"
          },
          {
            "at": 10,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 10.8,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 11.6,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 12.4,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 13.2,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 13.5,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 14,
            "lane": 1,
            "type": "shell"
          },
          {
            "at": 14.3,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 15.1,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 15.9,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 16.7,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 17,
            "lane": 2,
            "type": "hopper"
          },
          {
            "at": 17.5,
            "lane": 3,
            "type": "shell"
          },
          {
            "at": 20,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 20.5,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 21,
            "lane": 1,
            "type": "swarm"
          },
          {
            "at": 24,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 24.5,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 25,
            "lane": 3,
            "type": "swarm"
          },
          {
            "at": 28.5,
            "lane": 2,
            "type": "runner"
          }
        ]
      },
      {
        "name": "曙光：一起等到天亮",
        "brief": "最後一波分成數段，全園都有自己的任務。",
        "gap": 16,
        "bonus": 180,
        "spawns": [
          {
            "at": 0,
            "lane": 2,
            "type": "brute"
          },
          {
            "at": 4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 4.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 5.6,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 6,
            "lane": 0,
            "type": "lantern"
          },
          {
            "at": 6.4,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 7.2,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 8.8,
            "lane": 0,
            "type": "shell"
          },
          {
            "at": 10,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 10.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 11.6,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 12,
            "lane": 4,
            "type": "lantern"
          },
          {
            "at": 12.4,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 13.2,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 14,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 14.8,
            "lane": 4,
            "type": "shell"
          },
          {
            "at": 16,
            "lane": 1,
            "type": "hopper"
          },
          {
            "at": 19.5,
            "lane": 3,
            "type": "hopper"
          },
          {
            "at": 23,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 23.5,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 24,
            "lane": 0,
            "type": "swarm"
          },
          {
            "at": 27.5,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 28,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 28.5,
            "lane": 4,
            "type": "swarm"
          },
          {
            "at": 32,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 32.8,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 33.6,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 34.4,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 35.2,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 35.5,
            "lane": 1,
            "type": "runner"
          },
          {
            "at": 36,
            "lane": 2,
            "type": "shell"
          },
          {
            "at": 38.5,
            "lane": 3,
            "type": "runner"
          }
        ]
      }
    ]
  }
];if(typeof module==='object'&&module.exports)module.exports=levels;if(root){root.BloomwardLevels=levels;root.BLOOMWARD_LEVELS=levels;}})(typeof globalThis!=='undefined'?globalThis:this);
