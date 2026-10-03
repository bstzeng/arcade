#!/usr/bin/env node
'use strict';
// Builds the 270-game lobby only after all 120 deliverables validate. It does not
// publish, assert browser QA, or reinterpret the 13 creative sandboxes as levels.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const T=require('./expansion120-tools.cjs');process.chdir(__dirname);
const BUILD='20261003-expansion120';
const browse={
 sports:['運動競技','掌握球路、風向與時機，在球場上挑戰自己。','冰球・羽球・迷你高爾夫','◉','#8bd9e9','#253e48'],
 vehicles:['載具操控','控制油門、轉向與慣性，駕馭各種交通工具。','卡丁車・帆船・月球車','↗','#f2bd7c','#45372c'],
 stealth:['潛行諜報','觀察巡邏、聲音與暗處，完成秘密任務。','影子潛入・偽裝・倒帶','◈','#a7cdb3','#2b3b35'],
 social:['社交推理','讀懂證詞與行動，和本機角色展開推理。','狼人・內鬼・真假收藏家','◌','#d0b0ed','#3b2f46'],
 coop:['非對稱合作','不同能力、不同視角，互相協助突破難關。','盲圖・巨人小匠・光束','⇄','#edbb99','#43362e'],
 code:['程式自動化','寫規則、逐步除錯，讓程式帶來正確結果。','蜂群・除錯・非同步郵局','{ }','#9fd8c5','#283e38'],
 words:['文字語言','拆字、斷詞與換個說法，用文字改變世界。','偏旁・一字改命・押韻','文','#e7c88d','#443c2c'],
 music:['音樂聲音','探索音色、空間和旋律，創作自己的聲音。','音色・回音・故事配樂','♪','#b3c5f3','#303951']
};
function svgArt(g,c){
 const p=[c.artFile,c.artwork,c.artworkPath,c.artPath,g.artwork,g.artFile,g.artPath,c.art].find(x=>typeof x==='string'&&x.endsWith('.svg'))||'games/'+g.id+'/art.svg';
 if(fs.existsSync(p)){const svg=fs.readFileSync(p,'utf8');assert(/<svg\b/.test(svg),g.id+' missing SVG root');assert(!/<(?:script|foreignObject)\b|\bon\w+=|https?:\/\//i.test(svg.replace(/http:\/\/www\.w3\.org\/2000\/svg/g,'')),g.id+' unsafe external/active SVG');return svg.replace(/<svg\b([^>]*)>/,(_,attrs)=>'<svg'+attrs.replace(/\sclass=[\"'][^\"']*[\"']/g,'')+' class=\"expansion120-art\">');}
 const custom=fs.existsSync('expansion120-lobby-art.cjs')?require('./expansion120-lobby-art.cjs'):{};
 assert(typeof custom[g.id]==='string'&&custom[g.id].includes('<svg'),g.id+' requires a distinct mechanic-specific lobby illustration');return custom[g.id];
}
T.assertPreserved();
const families=T.spec.families.map(f=>T.loadFamily(f.id)),newGames=families.flatMap(f=>f.games);assert.equal(newGames.length,120);
const art={},entries=[];
for(const g of newGames){const c=g.catalog,[title,description,examples,icon,color,background]=browse[g.family];const key='expansion120-'+g.id;art[key]=svgArt(g,c);entries.push({id:g.id,title:g.title,category:'expansion120',description:c.description||T.spec.games.find(p=>p.id===g.id).proposal,note:c.note||title,art:key,color:c.color||color,background:c.background||background,word:c.word&&c.word!=='SOCIAL CLUB'?c.word:c.en||g.id.replaceAll('-',' ').toUpperCase(),status:'ready',url:'./'+g.entry,badge:c.badge||c.tag||(g.levelBased?'100 關挑戰':'自由創作')});}
assert.equal(new Set(entries.map(g=>g.id)).size,120);assert.equal(new Set(Object.values(art)).size,120,'Each new game needs distinct illustration');
const categories=T.spec.families.map(f=>{const [title,description,examples,icon,color]=browse[f.id];return{id:f.id,title,description,examples,icon,color,gameIds:f.games};});
const baseline=T.read('expansion120-baseline-root.json').files;
let app=baseline['app.js'];
app=app.replace("const GAME_BUILD = '20261002-expansion80';","const GAME_BUILD = '"+BUILD+"';");
const registryEnd=app.indexOf('\n];\nconst categoryNames');assert(registryEnd>0);app=app.slice(0,registryEnd)+',\n'+entries.map(g=>'  '+JSON.stringify(g)).join(',\n')+app.slice(registryEnd);
app=app.replace("const categoryNames = {", "const categoryNames = { expansion120: '新玩法探索',");
const marker='// Browse by how a game plays';assert(app.includes(marker));app=app.replace(marker,'Object.assign(artMarkup, '+JSON.stringify(art,null,2)+');\n'+marker);
const catsEnd=app.indexOf('\n];\nconst categoryByGameId');assert(catsEnd>0);app=app.slice(0,catsEnd)+',\n'+categories.map(c=>'  '+JSON.stringify(c)).join(',\n')+app.slice(catsEnd);
let index=baseline['index.html'];index=index.replaceAll('20261002-expansion80',BUILD).replaceAll('150','270').replaceAll('八個分類','十六個分類').replaceAll('8 個分類','16 個分類').replaceAll('一百五十','二百七十');
const tiles=categories.map(c=>`          <button class="category-tile" type="button" data-filter="${c.id}" aria-pressed="false" aria-controls="game-grid" style="--category-color:${c.color}">\n            <span class="category-tile-top"><span class="category-icon" aria-hidden="true">${c.icon}</span><span class="category-size"><span data-category-count>15</span> 款 <span aria-hidden="true">↗</span></span></span>\n            <span class="category-title">${c.title}</span><span class="category-examples">${c.examples}</span>\n          </button>`).join('\n');
index=index.replace('        </div>\n        <div id="browse-results"',tiles+'\n        </div>\n        <div id="browse-results"');
const levels=newGames.reduce((n,g)=>n+g.levelCount,0),levelGames=newGames.filter(g=>g.levelBased).length,sandboxGames=120-levelGames;
index=index.replace(/<meta name="description"[^>]*>/,`<meta name="description" content="Arcade 遊戲小宇宙。270 款遊戲、十六個分類。新加入運動、載具、潛行、社交、合作、程式、文字與聲音遊戲。">`);
index=index.replace(/<p>二百七十個小世界[\s\S]*?<\/p>/,`<p>二百七十個小世界，十六種探索方向。新增 120 款運動、載具、潛行、社交、合作、程式、文字與聲音遊戲；其中 ${levelGames} 款各有 100 個挑戰，共 ${levels.toLocaleString('en-US')} 關，另有 ${sandboxGames} 款自由創作。原有 80 款的 8,000 關挑戰、250 副接龍牌局與 2,000 關益智完整保留。解答依公開規則與指定對手策略驗證，不代表唯一解或對任意對手必勝。部分遊戲提供本機 AI 或同機合作；聲音創作需點按後啟用音訊。實際規則與模式以各遊戲說明為準。</p>`);
const css=baseline['styles.css']+'\n/* 120 new mechanic-specific covers, scoped to the new expansion only. */\n.expansion120-art{display:block;flex:none;width:156px;height:130px;overflow:hidden;transform:rotate(7deg);border-radius:9px;filter:drop-shadow(3px 5px 1px #0002)}\n';
let readme=baseline['README.md'];readme=readme.replace('一百五十款遊戲均可直接遊玩','二百七十款遊戲均可直接遊玩').replace('首頁依實際玩法分成八類','首頁依實際玩法分成十六類').replace('搜尋始終涵蓋全部 150 款','搜尋始終涵蓋全部 270 款');
readme=readme.replace('## 分類瀏覽與搜尋',`## 120 款新玩法\n\n此次新增 120 款，與既有 150 款合計 **270 款**。${levelGames} 款有關卡的遊戲各具 100 關，合計 **${levels.toLocaleString('en-US')} 個挑戰**；其餘 ${sandboxGames} 款為自由創作，不把審美喜好宣稱為客觀可解關卡。全部沿用原生瀏覽器技術，無外部 AI 或帳號服務。各遊戲 README 公開其精確變體、證明範圍與限制。\n\n`+categories.map(c=>`- ${c.title}：15 款，${c.examples}`).join('\n')+`\n\n執行 \`node verify-expansion120-all.cjs\` 重跑歷史150款與新增八類的實際測試及270款大廳回歸。\`expansion120-manifest.json\` 逐項列出關卡、AI、來源與測試路徑；實際瀏覽器與部署驗收分開記錄，不以離線DOM模擬冒充。\n\n## 分類瀏覽與搜尋`);
readme=readme.replace('## 基本檢查\n\n','## 基本檢查\n\n完整離線驗證需 Node.js 18+ 與 Python 3，並先在 Python 虛擬環境依 `games/chess/requirements-test.txt` 及 `games/shogi/requirements-test.txt` 安裝固定版本的測試棋規函式庫。網站本身沒有外部執行依賴。\n\n');
readme=readme.replace(/```sh\nnode --check app\.js[\s\S]*?```/, '```sh\nnode --check app.js\nnode verify-static.cjs\nnode verify-expansion120.cjs\nnode verify-expansion120-lobby.cjs\nnode verify-expansion120-regressions.cjs\n# 完整重跑既有150款、新增120款與大廳整合\nnode verify-all.cjs\n```');
const sourceFiles=Object.assign({},...families.map(f=>f.sourceFiles));for(const f of families){sourceFiles[f.releaseManifestPath]=T.hash(f.releaseManifestPath);sourceFiles[f.catalogPath]=T.hash(f.catalogPath);}
const manifest={schemaVersion:1,status:'integrated-awaiting-independent-browser-and-final-release-audits',sourceBaselineCommit:T.preservation.baseCommit,baselineGames:150,newGames:120,releaseGames:270,newLevelGames:levelGames,newSandboxGames:sandboxGames,newChallengeCount:levels,categories,allowedHistoricalRootChanges:[...T.allowedRootChanges],families:families.map(f=>({id:f.id,directory:f.directory,games:f.games.map(g=>g.id),manifest:f.releaseManifestPath,catalog:f.catalogPath,commands:f.commands,freshReports:f.freshReports})),games:newGames.map(({catalog,...g})=>g),sourceFiles,claims:{allGamesHaveLevels:false,allChallengesUnique:false,arbitraryOpponentForcedWins:false,actualBrowserQAPassed:false,publicationReady:false}};
if(process.argv.includes('--write')){
 // All preparation/validation above completes before changing runtime files.
 fs.writeFileSync('app.js',app);fs.writeFileSync('index.html',index);fs.writeFileSync('styles.css',css);fs.writeFileSync('README.md',readme);fs.writeFileSync('expansion120-manifest.json',JSON.stringify(manifest,null,2)+'\n');
 console.log(`Integrated 270 games / 16 categories; ${levelGames} level games / ${sandboxGames} creative sandboxes. Browser and release gates pending.`);
}else console.log(`DRY RUN ready: 120 new entries, ${levels} challenge witnesses expected. Use --write only after family freeze.`);
