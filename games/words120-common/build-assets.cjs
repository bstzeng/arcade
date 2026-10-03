'use strict';const fs=require('fs'),path=require('path'),data=require('./data.json');const root=path.resolve(__dirname,'../..');
const T=(x,y,s,size=36,color='#effaf6')=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" font-size="${size}" font-family="system-ui, sans-serif" font-weight="650">${s}</text>`;
const line=(x,y,a,b,color='#9ae2cf',w=5)=>`<path d="M${x} ${y} L${a} ${b}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
const rect=(x,y,w,h,c='#294658')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="15" fill="${c}" stroke="#639188" stroke-width="2"/>`;
const motifs={
 'punctuation-escape':rect(120,103,175,165)+rect(345,103,175,165)+T(208,217,'？',100,'#ffd896')+T(432,217,'！',100,'#9ce4cb')+line(301,185,335,185),
 'radical-workshop':T(180,214,'日',80)+T(286,214,'＋',46,'#f4cd90')+T(390,214,'月',80)+T(515,214,'明',88,'#aee8d6'),
 'compact-telegram':rect(119,116,402,133)+T(320,165,'開 紅 門',37,'#f3c787')+T(320,222,'升 吊 橋',37,'#9ce4cb')+line(150,272,495,272),
 'alien-grammar':rect(87,136,132,105)+rect(254,96,132,105)+rect(421,136,132,105)+T(153,204,'mi',45)+T(320,165,'lom',39,'#e4c695')+T(487,204,'pa',45)+line(208,246,432,246),
 'homophone-scene':T(179,211,'鹿',91,'#f0d092')+T(461,211,'路',91,'#a7e9d5')+T(320,177,'lù',34)+line(275,210,365,210)+line(350,195,365,210)+line(350,225,365,210),
 'pronoun-detective':rect(86,92,160,75)+rect(86,223,160,75)+rect(405,158,150,75)+T(166,143,'她',39)+T(166,273,'它',39,'#f1ce9c')+T(480,209,'誰？',36)+line(246,132,405,193)+line(246,260,405,200),
 'forbidden-word-traveler':rect(120,123,130,145)+T(185,218,'字',64,'#edacaa')+line(119,127,250,268,'#ef9c9c',9)+rect(350,112,190,78)+rect(350,220,190,60)+T(445,164,'換個說法',25)+T(445,261,'✓',35,'#ade9cd'),
 'meaning-relay':rect(69,129,143,150)+rect(248,95,144,150)+rect(428,129,144,150)+T(140,180,'公告',32)+T(320,149,'童話',32,'#edd095')+T(500,180,'說明',32)+T(140,240,'≡',51)+T(320,210,'≡',51)+T(500,240,'≡',51),
 'one-word-fate':T(193,206,'未',100,'#eeb2aa')+T(448,206,'已',100,'#a7e7d3')+line(277,170,362,170)+line(350,158,362,170)+line(350,182,362,170)+line(194,241,194,281)+line(194,281,448,281)+line(448,281,448,241),
 'metaphor-gallery':rect(103,84,434,211)+rect(125,105,390,166,'#1b3849')+'<circle cx="227" cy="166" r="26" fill="#f3d391"/><path d="M150 245Q225 145 305 233Q378 147 491 245" fill="none" stroke="#9cdec8" stroke-width="8"/>'+T(410,168,'像…',33),
 'tone-mixer':[165,270,375,480].map((x,i)=>line(x,109,x,283,'#62858e',8)+rect(x-17,140+i%2*68,34,48,i%2?'#e9c993':'#a3dcc9')).join('')+T(321,328,'同一事實 · 不同語氣',23),
 'lost-dictionary':rect(109,88,422,222)+line(320,99,320,296)+T(214,162,'nali',34,'#f4d095')+T(421,162,'船',38)+T(214,228,'sumi',34,'#a9e5d3')+T(421,228,'樹',38),
 'segmentation-adventure':T(127,194,'學',65)+T(231,194,'生',65)+T(351,194,'會',65)+T(492,194,'唱歌',49)+line(180,126,180,225,'#eccb90',4)+line(286,115,286,242,'#a5e4cf',8)+line(410,126,410,225,'#eccb90',4)+T(320,293,'切口改變意思',26),
 'rhyme-rescue':T(303,157,'晨 曦 送 暖 光',41)+T(303,235,'快 快 渡 長 江',41)+line(466,169,526,169,'#e8c28a',6)+line(466,249,526,249,'#e8c28a',6)+T(510,291,'ang',25,'#b2ead6'),
 'precise-naming':[['#cf6579',155,145],['#7cafdc',275,145],['#cf6579',395,145],['#7cafdc',515,145]].map(([c,x,y],i)=>i%2?`<rect x="${x-27}" y="${y-27}" width="54" height="54" rx="3" fill="${c}"/>`:`<circle cx="${x}" cy="${y}" r="28" fill="${c}"/>`).join('')+rect(127,220,416,67)+T(335,266,'紅 而且 圓',32)+T(155,101,'★',28,'#f4d394')+T(395,101,'★',28,'#f4d394')
};
for(const [id,g]of Object.entries(data)){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400" role="img" aria-label="${g.title}"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#223a4e"/><stop offset="1" stop-color="#111f2c"/></linearGradient></defs><rect width="640" height="400" rx="28" fill="url(#bg)"/><circle cx="580" cy="30" r="156" fill="#81d6c2" opacity=".06"/><circle cx="60" cy="350" r="135" fill="#f3c686" opacity=".05"/>${T(320,57,g.title,28,'#d7e9e7')}${motifs[id]}${T(320,370,'文字與語言 · 100 關',17,'#a9c7d0')}</svg>\n`;
 fs.writeFileSync(path.join(root,'games',id,'art.svg'),svg);
 fs.writeFileSync(path.join(root,'games',id,'README.md'),`# ${g.title}\n\n${g.proposal}\n\n## 玩法\n\n${g.tutorial}\n\n100 個可直接選擇的關卡。操作、協助紀錄、詞彙範圍、AI 資訊邊界及驗證方式見 [家族說明](../words120-common/README.md)。\n\n- 本款資料：\`levels.json\` / \`levels.js\`\n- 可重放解答：\`proofs.json\`\n- 共用引擎：\`../words120-common/engine.js\`\n- 共用控制器：\`../words120-common/app.js\`\n- 驗證：於倉庫根目錄執行 \`node games/words120-common/verify.cjs\` 及 \`node games/words120-common/ui-tests.cjs\`\n\n證明僅涵蓋明示規則下可達成目標；不宣稱唯一解或無限制中文理解。真正瀏覽器的 333／400px 與桌面畫面由整合者另行驗收。\n`);
}
console.log('Wrote 15 distinct SVG artworks and game READMEs.');
