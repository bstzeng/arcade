/* Starweave Mage V3. Sixty original creatures; no network or asset dependencies.
 * A species is anatomy + motion + combat role, never just a palette swap.
 * Every regional pool is available immediately. Encounter scheduling belongs to engine.js.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StarweaveBestiary = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const biomes = ['薄荷林徑', '月傘洞窟', '霜鈴遺跡', '琥珀曠野', '星夜書庫'];
  const bodies = ['blob', 'rabbit', 'fox', 'beetle', 'turtle', 'bird', 'moth', 'mushroom', 'crab', 'snail', 'gecko', 'serpent', 'sprite', 'golem', 'book'];
  const motions = ['hop', 'scuttle', 'swoop', 'float', 'crawl', 'amble', 'burrow', 'zigzag'];
  const attacks = ['touch', 'bolt', 'fan', 'pulse', 'charge', 'mortar', 'guard', 'drain', 'sweep', 'burst'];
  const bossPatterns = ['root-lanes', 'petal-orbit', 'spore-garden', 'crystal-cross', 'frost-comets', 'bell-cones', 'sand-serpent', 'amber-triad', 'ink-labyrinth', 'page-storm'];
  // Omitted keys mean no appendage. Each token names a visible geometric feature.
  const featureVocabulary = {
    horns: ['twig', 'crystal', 'crescent', 'fork'],
    spikes: ['leaf', 'crystal', 'quills'],
    ears: ['round', 'long', 'lop', 'tuft', 'fin'],
    wings: ['leaf', 'petal', 'moth', 'feather', 'page', 'crystal'],
    tail: ['curl', 'plume', 'fork', 'ribbon', 'tuft', 'comet', 'key'],
    shell: ['spiral', 'dome', 'pinecone', 'crystal', 'bell', 'teapot', 'stack'],
    crest: ['sprout', 'fan', 'crown', 'flame', 'antenna', 'quill'],
    ornament: ['dew', 'lantern', 'flower', 'acorn', 'star', 'bell', 'rune', 'clock', 'inkwell', 'scroll',
      'root-canopy', 'petal-halo', 'spore-garden', 'prism-cross', 'comet-orbit', 'bell-court', 'dune-sail', 'amber-triad', 'ink-crown', 'page-vortex']
  };
  const attackNames = {touch: '近身輕碰', bolt: '單發光彈', fan: '扇形散射', pulse: '近身波紋', charge: '直線衝刺', mortar: '落點拋投', guard: '蓄力守勢', drain: '汲取光線', sweep: '橫向掃擊', burst: '短促連發'};
  const motionNames = {hop: '彈跳', scuttle: '橫行', swoop: '掠飛', float: '飄浮', crawl: '爬行', amble: '慢步', burrow: '鑽行', zigzag: '折返'};

  function palette(body, accent, light, dark) { return {body, accent, light, dark}; }
  // Tuning tuple: health, damage, speed, preferred range, cooldown, readable windup.
  function creature(id, name, biome, kind, body, features, colors, motion, attack, tune, description, shapeHint, pattern) {
    const value = {id, name, biome, kind, body, features, palette: colors, motion, attack,
      hpMod: tune[0], damageMod: tune[1], speedMod: tune[2], range: tune[3], cooldown: tune[4], windup: tune[5], description, shapeHint};
    if (pattern) value.pattern = pattern;
    return value;
  }
  function n(id, name, biome, body, features, colors, motion, attack, tune, description, shapeHint) {
    return creature(id, name, biome, 'normal', body, features, colors, motion, attack, tune, description, shapeHint);
  }
  function b(id, name, biome, body, features, colors, motion, attack, tune, pattern, description, shapeHint) {
    return creature(id, name, biome, 'boss', body, features, colors, motion, attack, tune, description, shapeHint, pattern);
  }

  const monsters = [
    // 0 · Mint forest: soft plant silhouettes, seed shells and dew ornaments.
    n('forest-dewblob', '露珠軟團', 0, 'blob', {crest: 'sprout', ornament: 'dew'},
      palette('#88d7b4', '#eac77b', '#e5fff0', '#497d6e'), 'hop', 'touch', [0.82, 0.78, 1.04, 84, 2.65, 0.9],
      '蓄一下小跳躍，再靠近輕碰。', '水滴圓身、頭頂雙芽、額前大露珠。'),
    n('forest-leafrabbit', '葉耳跳兔', 0, 'rabbit', {ears: 'long', tail: 'tuft', ornament: 'acorn'},
      palette('#b9d995', '#d99f7c', '#fff1d6', '#6e8861'), 'hop', 'charge', [0.86, 0.91, 1.22, 118, 3.35, 1.15],
      '壓低葉耳預告，沿直線短衝。', '一高一低的長葉耳、橡果胸飾、圓絨尾。'),
    n('forest-fernfox', '蕨尾小狐', 0, 'fox', {ears: 'tuft', tail: 'plume', crest: 'sprout'},
      palette('#b7ca9a', '#e8bd8b', '#f5eed8', '#617867'), 'zigzag', 'fan', [0.9, 0.82, 1.18, 204, 3.8, 1.2],
      '左右折返後，朝前方展開蕨葉散射。', '尖頰小狐、蓬鬆蕨尾、雙芽額冠。'),
    n('forest-acornbeetle', '橡果甲蟲', 0, 'beetle', {horns: 'fork', shell: 'pinecone', ornament: 'acorn'},
      palette('#baaa80', '#90c5a1', '#f1dfb8', '#6d745e'), 'scuttle', 'guard', [1.4, 0.75, 0.7, 106, 4.15, 1.35],
      '收攏橡果背甲蓄力，再向近處反擊。', '三段松果背甲、分叉小角、六隻短足。'),
    n('forest-cloverturtle', '三葉背龜', 0, 'turtle', {shell: 'dome', ears: 'round', ornament: 'flower'},
      palette('#8bbdaa', '#dccb80', '#e6f2d5', '#597b72'), 'amble', 'pulse', [1.32, 0.8, 0.68, 132, 4.25, 1.4],
      '慢慢靠近，放出一圈三葉草波紋。', '寬圓龜殼、圓耳、背上三瓣大花。'),
    n('forest-reedbird', '蘆笛啾鳥', 0, 'bird', {wings: 'feather', crest: 'fan', tail: 'ribbon'},
      palette('#a0c8b8', '#eab6a0', '#fff1d5', '#617b77'), 'swoop', 'bolt', [0.76, 0.9, 1.28, 236, 2.95, 0.85],
      '掠飛拉開距離，吹出一枚蘆笛光彈。', '圓胸小鳥、扇形羽冠、兩條細長飄尾。'),
    n('forest-petalmoth', '花瓣絨蛾', 0, 'moth', {wings: 'petal', crest: 'antenna', ornament: 'dew'},
      palette('#dcb7c5', '#b1d6ad', '#fff1ea', '#9b768c'), 'float', 'burst', [0.7, 0.73, 0.98, 198, 3.75, 1.05],
      '花瓣翼張開時，短促連吐露光。', '四片圓花瓣翼、彎曲觸鬚、露珠腹飾。'),
    n('forest-teacap', '茶帽菇仔', 0, 'mushroom', {shell: 'teapot', crest: 'sprout', tail: 'curl'},
      palette('#cbbfa0', '#9bc4a1', '#fff0d0', '#847963'), 'amble', 'mortar', [1.05, 1.1, 0.76, 254, 4.3, 1.5],
      '茶帽先冒光，再把種子拋向預告落點。', '茶壺形大菇帽、芽葉壺蓋、彎捲菌絲尾。'),
    n('forest-barksnail', '木紋蝸寶', 0, 'snail', {shell: 'spiral', horns: 'twig', ornament: 'acorn'},
      palette('#b7aa90', '#a6cfa7', '#f2e8c9', '#766d5c'), 'crawl', 'drain', [1.22, 0.74, 0.65, 164, 4.45, 1.3],
      '樹枝觸角亮起，以細細木光汲取活力。', '高起木紋螺殼、枝狀觸角、殼旁小橡果。'),
    n('forest-willowsprite', '柳燈精靈', 0, 'sprite', {wings: 'leaf', ornament: 'lantern', tail: 'ribbon'},
      palette('#bedbc2', '#ebcf8e', '#f2fff2', '#7c9a88'), 'float', 'sweep', [0.78, 0.92, 1.08, 174, 3.5, 1.1],
      '擺動柳燈，向前橫掃一束柔光。', '細長鈴鐺身、成對柳葉翼、燈籠及飄帶尾。'),

    // 1 · Mushroom cave: luminous caps, crystals, coiling feelers and soft gills.
    n('cave-jellyspore', '果凍孢團', 1, 'blob', {spikes: 'quills', ornament: 'lantern'},
      palette('#bca3d9', '#a9d9cb', '#f5e8ff', '#79688f'), 'float', 'pulse', [0.87, 0.84, 0.88, 144, 3.9, 1.25],
      '小刺先鼓起，再向近處推出孢子波。', '半透明扁團、放射軟刺、懸在腹下的菌燈。'),
    n('cave-moonrabbit', '月傘垂耳兔', 1, 'rabbit', {ears: 'lop', shell: 'dome', crest: 'flame', ornament: 'star'},
      palette('#d3bddf', '#afc3e1', '#fff0f3', '#8e779f'), 'hop', 'fan', [0.83, 0.86, 1.15, 216, 3.85, 1.15],
      '躍起撐開傘背，向前灑出月光散彈。', '垂耳兔、圓傘背、月焰額毛和星飾。'),
    n('cave-velvetbeetle', '絨角鑽蟲', 1, 'beetle', {horns: 'crescent', shell: 'crystal', tail: 'fork'},
      palette('#a89cce', '#e0b999', '#e9e0fc', '#716589'), 'burrow', 'charge', [1.16, 1.06, 1.12, 122, 3.95, 1.35],
      '先隆起一小塊地面，再短距離直衝。', '月牙絨角、菱面背甲、分岔小尾。'),
    n('cave-lanternmoth', '燈籠粉蛾', 1, 'moth', {wings: 'moth', crest: 'antenna', ornament: 'lantern'},
      palette('#c5aad1', '#ecda9e', '#fbe9fa', '#877091'), 'zigzag', 'bolt', [0.72, 0.88, 1.2, 248, 2.8, 0.9],
      '繞著小菌燈折返，放出單顆燈光彈。', '狹長上翼和圓下翼、雙觸鬚、腹下吊燈。'),
    n('cave-bellmushroom', '鈴褶小菇', 1, 'mushroom', {shell: 'bell', crest: 'crown', ornament: 'dew'},
      palette('#b49ace', '#dbaed0', '#f3dff1', '#77658e'), 'amble', 'burst', [1.13, 0.79, 0.77, 186, 3.65, 1.2],
      '菌褶亮起後，接連吐出幾粒微光。', '鐘形菌帽、三尖小冠、帽緣露珠。'),
    n('cave-crystalcrab', '晶鉗洞蟹', 1, 'crab', {horns: 'crystal', spikes: 'crystal', tail: 'tuft'},
      palette('#b9aad7', '#a3d7df', '#f0e8ff', '#756b93'), 'scuttle', 'guard', [1.44, 0.83, 0.82, 110, 4.2, 1.4],
      '舉起晶鉗守勢蓄力，再敲向近處。', '寬平蟹身、兩隻晶鉗、背晶簇及短絨尾。'),
    n('cave-spiralsnail', '螺燈蝸牛', 1, 'snail', {shell: 'spiral', ears: 'fin', ornament: 'lantern'},
      palette('#c9b4cd', '#b7d7c0', '#fff0e5', '#887692'), 'crawl', 'mortar', [1.19, 1.12, 0.66, 260, 4.4, 1.45],
      '螺殼旋亮，將菌光拋向標記的地面。', '豎直大螺殼、扇鰭觸角、殼口提燈。'),
    n('cave-wallgecko', '洞壁黏蜥', 1, 'gecko', {ears: 'fin', tail: 'curl', crest: 'fan'},
      palette('#a0c5c0', '#cfaddb', '#e8f4df', '#678d8b'), 'crawl', 'touch', [0.95, 0.89, 1.3, 88, 2.55, 0.85],
      '貼地快爬，張開小腳掌靠近輕碰。', '扁闊吸盤足、扇鰭耳、捲尾和薄扇冠。'),
    n('cave-ribbonsnake', '紫帶小蛇', 1, 'serpent', {tail: 'ribbon', crest: 'sprout', ornament: 'flower'},
      palette('#bba6d2', '#ead0a9', '#f1e4fa', '#7d6b95'), 'zigzag', 'sweep', [0.98, 0.96, 1.1, 182, 3.45, 1.15],
      '先把花尾向後收，再橫向揮出光帶。', '短短的盤曲蛇身、芽冠、尾端花朵與長帶。'),
    n('cave-puffsprite', '孢絨精', 1, 'sprite', {wings: 'moth', spikes: 'quills', ornament: 'star'},
      palette('#d3c1df', '#afcce7', '#fff3fb', '#937b9d'), 'float', 'drain', [0.75, 0.76, 0.94, 176, 4.1, 1.3],
      '星飾微亮後，牽出一束汲取菌光。', '蓬圓軟刺身、小蛾翼、胸前懸星。'),

    // 2 · Icy ruins: crystalline edges, bells and stone runes, never hard stuns.
    n('ice-snowhare', '雪襪絨兔', 2, 'rabbit', {ears: 'long', shell: 'crystal', tail: 'tuft'},
      palette('#d3e4e8', '#a0c5df', '#ffffff', '#7e99aa'), 'hop', 'touch', [0.88, 0.85, 1.26, 86, 2.6, 0.8],
      '雪襪腳掌輕跳，在近處蓄力碰一下。', '長耳雪兔、背後晶片、厚絨腳襪和短圓尾。'),
    n('ice-frostfox', '霜扇幼狐', 2, 'fox', {ears: 'tuft', tail: 'plume', crest: 'crown'},
      palette('#bfd7e2', '#c8bde5', '#f4fbff', '#718f9e'), 'zigzag', 'fan', [0.91, 0.86, 1.19, 218, 3.75, 1.15],
      '霜尾張成小扇，再灑出三向冰光。', '高絨尖耳、巨大扇尾、三尖冰冠。'),
    n('ice-iciclebeetle', '冰錐甲仔', 2, 'beetle', {horns: 'crystal', shell: 'crystal', spikes: 'crystal'},
      palette('#a9ceda', '#d0bfe6', '#e9fcff', '#678d9c'), 'scuttle', 'burst', [1.27, 0.83, 0.85, 194, 3.95, 1.25],
      '晶甲逐片亮起，短促連射小冰錐。', '稜角橢圓背甲、前方長晶角、兩排短晶刺。'),
    n('ice-snowturtle', '雪盞背龜', 2, 'turtle', {shell: 'bell', spikes: 'crystal', ornament: 'rune'},
      palette('#abcbd4', '#d8caaa', '#eef7ef', '#6e929a'), 'amble', 'guard', [1.5, 0.78, 0.65, 116, 4.45, 1.5],
      '縮入雪盞蓄力，符印亮起後才反擊。', '倒扣雪鐘龜殼、側邊晶刺、醒目方形符印。'),
    n('ice-bellbird', '叮鈴雪雀', 2, 'bird', {wings: 'feather', crest: 'crown', ornament: 'bell'},
      palette('#d6e5e4', '#dcb88b', '#ffffff', '#869ba7'), 'swoop', 'bolt', [0.74, 0.92, 1.32, 246, 2.85, 0.9],
      '小鈴一晃，沿前方送出一枚冰光。', '圓胸雪雀、三尖羽冠、胸前大鈴。'),
    n('ice-snowmoth', '六羽霜蛾', 2, 'moth', {wings: 'crystal', spikes: 'crystal', crest: 'antenna'},
      palette('#c3d6ed', '#c8b5dd', '#f4f9ff', '#8192b0'), 'float', 'drain', [0.77, 0.77, 0.92, 184, 4.2, 1.3],
      '六片霜翼慢慢展平，牽出細細寒光汲取。', '六角霜翼、短晶腹刺、兩根冰觸鬚。'),
    n('ice-ruincrab', '石印小蟹', 2, 'crab', {shell: 'dome', horns: 'fork', ornament: 'rune'},
      palette('#aabfc2', '#94cdda', '#e3eded', '#6c858b'), 'scuttle', 'charge', [1.25, 1.08, 1.0, 128, 4.0, 1.35],
      '雙鉗扣住石印，橫身調頭後短衝。', '厚石圓背、分叉鉗尖、前方石印盾飾。'),
    n('ice-glasssnail', '冰盞蝸牛', 2, 'snail', {shell: 'crystal', horns: 'crescent', ornament: 'dew'},
      palette('#b9dfe4', '#b9bee4', '#efffff', '#7399a5'), 'crawl', 'mortar', [1.2, 1.14, 0.67, 258, 4.35, 1.5],
      '晶殼收集冷光，拋向先亮起的圓形落點。', '透明多面冰殼、月牙觸角、巨大冰露。'),
    n('ice-cometsnake', '彗尾冰蛇', 2, 'serpent', {tail: 'comet', crest: 'flame', horns: 'crystal'},
      palette('#afcfeb', '#dfc4e4', '#f3faff', '#718caa'), 'zigzag', 'sweep', [0.94, 1.02, 1.16, 192, 3.55, 1.2],
      '彗尾先抬高，再掃出一道冰藍弧光。', '彎曲短蛇身、晶角、焰形額冠與彗星尾球。'),
    n('ice-runegolem', '符石咚咚', 2, 'golem', {horns: 'crystal', shell: 'stack', ornament: 'rune'},
      palette('#aabecb', '#a8d6e1', '#e5edf2', '#6b8193'), 'amble', 'pulse', [1.43, 0.96, 0.7, 154, 4.35, 1.45],
      '石拳舉高預告，敲出一圈近身符光。', '三塊疊石身、方拳、晶角與胸前菱形符。'),

    // 3 · Amber wilds: warm clay, kettle shells, seed pods and desert fans.
    n('wild-sandblob', '砂糖軟團', 3, 'blob', {spikes: 'leaf', crest: 'flame', ornament: 'star'},
      palette('#e5c08f', '#dda986', '#fff0d0', '#a38061'), 'burrow', 'burst', [0.85, 0.77, 1.02, 188, 3.6, 1.05],
      '從沙面探頭，連吐幾粒亮亮的砂糖。', '扁軟沙團、葉片狀砂刺、火焰額毛和星粒。'),
    n('wild-dunefox', '風沙耳狐', 3, 'fox', {ears: 'long', tail: 'fork', ornament: 'bell'},
      palette('#e6bd93', '#b6c59f', '#fff0d6', '#a78266'), 'zigzag', 'charge', [0.9, 1.0, 1.35, 124, 3.65, 1.1],
      '大耳朝後貼，鈴聲一響就沿直線短衝。', '超長風帆耳、分岔尾、頸前小銅鈴。'),
    n('wild-amberbeetle', '琥珀滾甲', 3, 'beetle', {horns: 'fork', shell: 'dome', ornament: 'star'},
      palette('#d8a75f', '#c3bd8e', '#ffe4ad', '#946b43'), 'scuttle', 'touch', [1.18, 0.92, 0.97, 92, 2.7, 0.95],
      '圓甲微微晃動，靠近後用小角輕碰。', '透明琥珀圓甲、分叉小角、甲內大星粒。'),
    n('wild-seedturtle', '籽莢背龜', 3, 'turtle', {shell: 'pinecone', crest: 'sprout', ornament: 'acorn'},
      palette('#b7b78e', '#dcaf76', '#eee6b9', '#7d8362'), 'amble', 'mortar', [1.34, 1.13, 0.68, 252, 4.4, 1.5],
      '背上籽莢張開，將大種子拋向預告落點。', '多節籽莢高背、嫩芽額冠、橡果胸扣。'),
    n('wild-sunbird', '暖羽啾鵲', 3, 'bird', {wings: 'feather', crest: 'flame', tail: 'fork'},
      palette('#e7b278', '#c19bb8', '#ffecd2', '#a77955'), 'swoop', 'fan', [0.73, 0.82, 1.31, 228, 3.7, 1.1],
      '掠過暖風後，扇開翅膀灑出金光。', '火焰羽冠、寬翅、剪刀形雙尾。'),
    n('wild-duskmoth', '暮紗砂蛾', 3, 'moth', {wings: 'moth', tail: 'ribbon', ornament: 'rune'},
      palette('#b7a2b3', '#e4c084', '#eee3dd', '#81717f'), 'float', 'drain', [0.79, 0.79, 0.99, 180, 4.15, 1.25],
      '暮紗翼緩緩拍動，以細光汲取附近活力。', '長蛾翼、兩條拖地紗尾、胸前沙紋符。'),
    n('wild-cactuscrab', '仙掌小蟹', 3, 'crab', {spikes: 'quills', shell: 'dome', crest: 'sprout'},
      palette('#afbe99', '#e6bb9c', '#ecedd4', '#7b8c68'), 'scuttle', 'guard', [1.46, 0.81, 0.78, 108, 4.3, 1.4],
      '仙掌背先收緊，再用兩隻小鉗反擊。', '仙掌圓背、密短軟刺、頂芽、對稱圓鉗。'),
    n('wild-kettlegecko', '茶壺沙蜥', 3, 'gecko', {shell: 'teapot', ears: 'round', tail: 'curl'},
      palette('#ceae88', '#9fbcaa', '#f9e8c8', '#8c735b'), 'crawl', 'bolt', [1.02, 0.98, 1.08, 238, 3.15, 1.0],
      '壺背噴一口暖氣，接著吐出茶光彈。', '低矮四足蜥、完整茶壺背殼、圓耳和壺柄捲尾。'),
    n('wild-ribbonsnake', '結帶沙蛇', 3, 'serpent', {horns: 'crescent', tail: 'ribbon', crest: 'fan'},
      palette('#ddbd8d', '#c7a5ba', '#fff0d4', '#9e7e5b'), 'burrow', 'sweep', [1.03, 1.01, 1.13, 190, 3.8, 1.25],
      '沙痕先彎成弧線，再甩出長帶掃擊。', '圓盤蛇身、月牙角、扇冠、打結的帶狀尾。'),
    n('wild-claygolem', '陶鈴石偶', 3, 'golem', {shell: 'bell', crest: 'crown', ornament: 'bell'},
      palette('#cfa386', '#bdc6a5', '#f5ddc0', '#916d5b'), 'amble', 'pulse', [1.42, 0.99, 0.69, 156, 4.25, 1.45],
      '陶身叮噹作響，踏出近身的圓形聲波。', '鐘形陶土胸、短方拳、三尖冠與懸鈴。'),

    // 4 · Midnight library: paper wings, ink, clock faces and ribbon bookmarks.
    n('library-inkblob', '墨滴軟團', 4, 'blob', {tail: 'curl', crest: 'quill', ornament: 'inkwell'},
      palette('#8c94b9', '#c8a4c1', '#dfe5fc', '#596580'), 'hop', 'touch', [0.86, 0.88, 1.05, 86, 2.5, 0.85],
      '羽筆先一抖，再彈向近處留下墨點。', '墨滴圓身、羽筆額毛、墨水瓶胸飾、捲尾。'),
    n('library-quillfox', '羽筆書狐', 4, 'fox', {ears: 'tuft', tail: 'plume', ornament: 'scroll'},
      palette('#a6aac6', '#dbc79b', '#ecebfa', '#72758f'), 'zigzag', 'sweep', [0.95, 0.99, 1.21, 182, 3.45, 1.1],
      '先展開小卷軸，再用羽筆尾橫掃墨光。', '尖絨耳書狐、超大羽筆尾、胸前橫卷。'),
    n('library-bookmarkbeetle', '書籤甲蟲', 4, 'beetle', {wings: 'page', horns: 'crescent', ornament: 'scroll'},
      palette('#b49baf', '#d5c29a', '#f1e2e3', '#7d697f'), 'scuttle', 'guard', [1.35, 0.8, 0.8, 112, 4.2, 1.4],
      '闔攏紙翼蓄力，書籤展開時才反擊。', '小橢圓甲身、成對折頁翼、月牙角和卷軸。'),
    n('library-stampbird', '印章夜雀', 4, 'bird', {wings: 'page', crest: 'quill', tail: 'key'},
      palette('#a0abc7', '#d8b4aa', '#e9eef9', '#65768f'), 'swoop', 'bolt', [0.72, 0.93, 1.29, 250, 2.9, 0.9],
      '紙翼輕拍，送出一枚方形印章光彈。', '圓胸夜雀、折頁雙翼、羽筆冠和鑰匙尾。'),
    n('library-atlasmoth', '星圖紙蛾', 4, 'moth', {wings: 'page', crest: 'antenna', ornament: 'star'},
      palette('#b2a8d2', '#b0cfdf', '#f1eafa', '#7b7298'), 'float', 'fan', [0.76, 0.84, 1.0, 222, 3.8, 1.2],
      '星圖頁翼展平後，向前鋪開星點散射。', '四張折頁大翼、細觸鬚、腹前立體星飾。'),
    n('library-shelfcrab', '書架橫蟹', 4, 'crab', {shell: 'stack', horns: 'twig', ornament: 'clock'},
      palette('#a69bac', '#cbb692', '#e9decd', '#756980'), 'scuttle', 'charge', [1.3, 1.1, 0.96, 126, 4.15, 1.4],
      '先合起小書架，鐘面一閃就向前短衝。', '疊書方背、枝狀鉗尖、正面圓鐘。'),
    n('library-scrollsnail', '捲軸蝸仔', 4, 'snail', {shell: 'spiral', tail: 'key', ornament: 'scroll'},
      palette('#c4baa8', '#b0a0c6', '#fcf1d8', '#898078'), 'crawl', 'drain', [1.23, 0.78, 0.66, 172, 4.35, 1.3],
      '捲軸緩慢攤開，以文字光線汲取活力。', '厚紙螺卷殼、側邊卷軸、鑰匙形小尾。'),
    n('library-candlegecko', '燭火壁蜥', 4, 'gecko', {crest: 'flame', ears: 'round', tail: 'comet'},
      palette('#b2bdc7', '#e7be92', '#edf0e8', '#788998'), 'crawl', 'burst', [0.93, 0.8, 1.23, 192, 3.6, 1.05],
      '尾端燭光變亮，接連彈出微小火星。', '低矮四足、圓耳、燭焰額毛、明亮彗球尾。'),
    n('library-ticksprite', '滴答書靈', 4, 'sprite', {wings: 'page', tail: 'ribbon', ornament: 'clock'},
      palette('#baa8cc', '#e0c48e', '#f5eafb', '#847093'), 'float', 'pulse', [0.81, 0.88, 0.95, 148, 4.0, 1.25],
      '圓鐘先滴答兩拍，再推出一圈文字波。', '小斗篷形浮身、折頁翼、長書籤尾和圓鐘。'),
    n('library-nibblebook', '小冊咬咬', 4, 'book', {horns: 'fork', ornament: 'rune', tail: 'ribbon'},
      palette('#a69cc2', '#c9c49f', '#f2e6d1', '#716888'), 'amble', 'mortar', [1.12, 1.12, 0.75, 256, 4.3, 1.45],
      '張開封面念一聲，將字團拋向標記落點。', '張嘴的小方書、叉形頁角、符印與書籤尾。')
  ];

  const bosses = [
    // Boss hazards are telegraphed pressure, not extra creatures. SW stays protected.
    b('forest-rootwarden', '根鬚森公', 0, 'golem', {horns: 'twig', spikes: 'leaf', shell: 'stack', crest: 'crown', ornament: 'root-canopy'},
      palette('#83aa8b', '#dbbb7f', '#e8edce', '#4c705d'), 'amble', 'sweep', [3.25, 1.45, 0.68, 268, 5.4, 1.8], 'root-lanes',
      '三側根脈依序亮起，再沿預告路線伸展；左下退路保持暢通。', '巨大的疊木方身、樹枝雙角、葉冠與橫跨肩膀的樹根華蓋。'),
    b('forest-petalqueen', '花環羽后', 0, 'moth', {wings: 'petal', ears: 'fin', tail: 'ribbon', crest: 'crown', ornament: 'petal-halo'},
      palette('#d4aac0', '#a7c5a2', '#fff0e8', '#926f87'), 'float', 'fan', [2.75, 1.38, 0.92, 290, 4.9, 1.55], 'petal-orbit',
      '花環預告後向三側散出旋轉花瓣，花瓣不封住左下退路。', '六片寬大花瓣翼、扇耳、長花帶與圍繞頭部的花環。'),
    b('cave-sporematron', '月傘庭主', 1, 'mushroom', {shell: 'dome', horns: 'crescent', crest: 'sprout', ornament: 'spore-garden'},
      palette('#baa0d0', '#b5d9bd', '#f8e8fb', '#7c628f'), 'amble', 'mortar', [3.35, 1.42, 0.65, 304, 5.6, 1.85], 'spore-garden',
      '三側地面先長出發光孢圈，再短暫綻開；孢圈不生成小怪。', '巨大的雙層圓傘、月牙帽角、頂芽及環繞菌柄的三朵小傘。'),
    b('cave-prismclaw', '稜晶巨鉗', 1, 'crab', {horns: 'crystal', spikes: 'crystal', shell: 'crystal', crest: 'crown', ornament: 'prism-cross'},
      palette('#a9c9dc', '#d5addd', '#eefbff', '#6f849c'), 'scuttle', 'bolt', [3.15, 1.58, 0.82, 300, 5.0, 1.65], 'crystal-cross',
      '晶鉗描出交叉光路後依序閃耀，光路在左下安全走廊外截斷。', '寬大的多面晶背、兩隻高舉巨鉗、十字稜晶與尖冠。'),
    b('ice-cometcoil', '星霜長鱗', 2, 'serpent', {horns: 'crescent', spikes: 'crystal', tail: 'comet', crest: 'crown', ornament: 'comet-orbit'},
      palette('#aacce7', '#c4b4de', '#f3fbff', '#6c85a6'), 'zigzag', 'mortar', [2.9, 1.55, 0.94, 320, 5.1, 1.7], 'frost-comets',
      '三顆霜星標記落點後依序降下，留下可自動繞開的空隙。', '長盤曲蛇身、月牙角、背晶鱗及繞著頭部的三顆彗星。'),
    b('ice-bellseraph', '鐘翼雪使', 2, 'bird', {wings: 'crystal', shell: 'bell', crest: 'fan', ornament: 'bell-court'},
      palette('#c5e0e5', '#debf8d', '#ffffff', '#7e9aa8'), 'swoop', 'fan', [2.85, 1.46, 0.9, 310, 5.25, 1.75], 'bell-cones',
      '三枚雪鈴亮起，送出略微錯開的三道聲波扇面。', '展開的大晶翼、鐘形圓胸、扇冠及翼下三枚大鈴。'),
    b('wild-dunecrawler', '流砂長吻', 3, 'gecko', {horns: 'fork', spikes: 'quills', ears: 'fin', tail: 'curl', crest: 'flame', ornament: 'dune-sail'},
      palette('#d5ad78', '#b5bea1', '#ffe9c1', '#946d4a'), 'burrow', 'charge', [3.1, 1.6, 1.02, 286, 4.75, 1.6], 'sand-serpent',
      '沙脊先描出直線，再短衝並揚起側邊沙圈；左下退路保持暢通。', '長吻四足沙蜥、背部高大帆鰭、叉角、寬鰭耳和彎捲長尾。'),
    b('wild-ambercrown', '琥珀三冠', 3, 'turtle', {shell: 'dome', horns: 'crystal', crest: 'crown', tail: 'fork', ornament: 'amber-triad'},
      palette('#d0aa6d', '#b9caaa', '#ffedba', '#8e703f'), 'amble', 'pulse', [3.5, 1.5, 0.65, 294, 5.7, 1.9], 'amber-triad',
      '三座琥珀冠一起共鳴，短暫守勢時在三側預告大小不同的琥珀圈。', '低矮巨龜、通透大圓殼、背上三座獨立高冠及分叉尾。'),
    b('library-inkcurator', '墨頁館主', 4, 'book', {wings: 'page', horns: 'twig', crest: 'quill', ornament: 'ink-crown'},
      palette('#8f94b9', '#d4b496', '#e9e4f3', '#59617e'), 'float', 'sweep', [3.2, 1.62, 0.78, 324, 5.65, 1.85], 'ink-labyrinth',
      '墨線先畫出三側折角，再逐段亮起；迷宮始終留出左下出口。', '厚大直立開卷、左右折頁翼、枝角與一圈懸浮墨滴皇冠。'),
    b('library-pagekeeper', '萬頁星靈', 4, 'sprite', {wings: 'page', shell: 'stack', crest: 'crown', tail: 'ribbon', ornament: 'page-vortex'},
      palette('#b4a6d1', '#b7cddb', '#fff0fa', '#7b6d96'), 'float', 'burst', [2.65, 1.4, 0.95, 330, 4.6, 1.5], 'page-storm',
      '環形書頁先聚攏預告，再與一道頁光錯開掃出；左下安全走廊保持暢通。', '高挑星靈、疊書裙、長書籤尾、折頁雙翼及環身的巨大書頁渦。')
  ];

  const all = monsters.concat(bosses);
  const byId = Object.create(null);
  all.forEach(def => { byId[def.id] = def; });
  function forBiome(biome, kind = 'normal') {
    if (!Number.isInteger(biome) || biome < 0 || biome >= biomes.length) return [];
    const source = kind === 'normal' ? monsters : kind === 'boss' ? bosses : kind === 'all' ? all : [];
    return source.filter(def => def.biome === biome);
  }
  function getById(id) { return byId[id] || null; }
  function geometrySignature(def) {
    return def.body + ':' + Object.keys(def.features).sort().map(key => key + '=' + def.features[key]).join('|');
  }
  function validate() {
    const errors = [], ids = new Set(), names = new Set(), silhouettes = new Set();
    if (monsters.length !== 50 || bosses.length !== 10 || all.length !== 60) errors.push('Expected exactly 50 normal monsters and 10 bosses.');
    const bounds = {normal: {hpMod: [0.7, 1.5], damageMod: [0.7, 1.3], speedMod: [0.65, 1.35], range: [80, 260], cooldown: [2.4, 4.5], windup: [0.8, 1.5]},
      boss: {hpMod: [2.5, 3.5], damageMod: [1.3, 1.8], speedMod: [0.65, 1.35], range: [180, 330], cooldown: [3.5, 6], windup: [1.2, 1.9]}};
    for (const def of all) {
      if (!/^[a-z]+-[a-z]+$/.test(def.id) || ids.has(def.id)) errors.push('Invalid or duplicate ID: ' + def.id);
      if (!def.name || names.has(def.name)) errors.push('Missing or duplicate name: ' + def.id);
      ids.add(def.id); names.add(def.name);
      if (!Number.isInteger(def.biome) || def.biome < 0 || def.biome > 4) errors.push('Invalid biome: ' + def.id);
      if (!bounds[def.kind] || !bodies.includes(def.body) || !motions.includes(def.motion) || !attacks.includes(def.attack)) errors.push('Invalid type: ' + def.id);
      if (!def.description || !def.shapeHint) errors.push('Missing design description: ' + def.id);
      if (Object.keys(def.features).length < 2) errors.push('Insufficient anatomy detail: ' + def.id);
      for (const [key, value] of Object.entries(def.features)) {
        if (!featureVocabulary[key] || !featureVocabulary[key].includes(value)) errors.push('Unknown geometric feature: ' + def.id + '.' + key);
      }
      const signature = geometrySignature(def);
      if (silhouettes.has(signature)) errors.push('Repeated anatomy: ' + def.id);
      silhouettes.add(signature);
      for (const key of ['body', 'accent', 'light', 'dark']) {
        if (!/^#[0-9a-f]{6}$/i.test(def.palette[key])) errors.push('Invalid palette: ' + def.id + '.' + key);
      }
      for (const [key, range] of Object.entries(bounds[def.kind] || {})) {
        if (!Number.isFinite(def[key]) || def[key] < range[0] || def[key] > range[1]) errors.push('Out-of-range tuning: ' + def.id + '.' + key);
      }
    }
    for (let biome = 0; biome < biomes.length; biome++) {
      if (forBiome(biome).length !== 10 || forBiome(biome, 'boss').length !== 2) errors.push('Incorrect regional counts: ' + biome);
      if (new Set(forBiome(biome).map(def => def.attack)).size !== 10) errors.push('Missing regional combat role: ' + biome);
    }
    if (new Set(all.map(def => def.body)).size !== 15) errors.push('All 15 body families must appear.');
    if (new Set(bosses.map(def => def.body)).size !== 10) errors.push('Boss silhouettes must use 10 distinct body families.');
    if (new Set(bosses.map(def => def.pattern)).size !== 10 || bosses.some(def => !bossPatterns.includes(def.pattern))) errors.push('Boss patterns must be unique and complete.');
    return {ok: errors.length === 0, errors, normalCount: monsters.length, bossCount: bosses.length, geometryCount: silhouettes.size, bodyCount: new Set(all.map(def => def.body)).size};
  }
  // The catalog is reference data. Freeze it so save/encounter state cannot alter species.
  function freeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  }
  return freeze({version: 3, monsters, bosses, all, byId, forBiome, getById, geometrySignature, validate,
    biomes, bodies, motions, attacks, bossPatterns, featureVocabulary, attackNames, motionNames});
});
