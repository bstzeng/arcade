(function (root) {
  'use strict';
  const colors = ['#ffad86', '#87e4d0', '#c5b5ff', '#f4d47c'];
  const airport = (id, name, x, y, deg, length = 100) => {
    const heading = deg * Math.PI / 180;
    return { id, name, x, y, heading, length, color: colors[id.charCodeAt(0) - 65], helipad: { x: x - Math.sin(heading) * 53, y: y + Math.cos(heading) * 53, radius: 20 } };
  };
  const maps = [
    {id:'islands',name:'翡翠群島',en:'EMERALD ISLES',subtitle:'海風輕拂的第一班航線',biome:'islands',difficulty:1,targetLandings:6,spawnInterval:17,departureRate:.18,maxTraffic:5,description:'兩座島嶼、兩條跑道。學會在海面上留出轉彎空間。',airports:[airport('A','珊瑚機場',290,280,0),airport('B','翡翠機場',705,450,180)]},
    {id:'canyon',name:'赤岩峽谷',en:'RED ROCK CANYON',subtitle:'在蜿蜒河谷之上交會',biome:'canyon',difficulty:2,targetLandings:8,spawnInterval:16,departureRate:.23,maxTraffic:6,description:'方向相反的谷地跑道。提早整理交錯航線。',airports:[airport('A','赤岩機場',280,200,90),airport('B','河谷機場',710,480,-90)]},
    {id:'city',name:'都會海灣',en:'METRO BAY',subtitle:'繁忙城市裡的從容調度',biome:'city',difficulty:3,targetLandings:10,spawnInterval:15,departureRate:.26,maxTraffic:7,description:'三座機場加入值勤。注意較快的噴射機。',airports:[airport('A','港灣機場',275,215,0),airport('B','南城機場',375,505,180),airport('C','都會機場',745,335,90)]},
    {id:'alpine',name:'雪線山谷',en:'ALPINE CROSSING',subtitle:'雪峰、杉林與安靜的天空',biome:'alpine',difficulty:4,targetLandings:12,spawnInterval:14.5,departureRate:.28,maxTraffic:7,description:'斜向跑道考驗進場安排。直升機使用 H 停機坪。',airports:[airport('A','白峰機場',250,280,35),airport('B','松林機場',710,455,-145),airport('C','高地機場',710,180,145)]},
    {id:'desert',name:'沙漠綠洲',en:'OASIS CIRCUIT',subtitle:'金色沙丘之間的綠色航站',biome:'desert',difficulty:5,targetLandings:14,spawnInterval:13.5,departureRate:.30,maxTraffic:8,description:'長距離跨區調度。別讓慢速機與快機追上彼此。',airports:[airport('A','砂丘機場',240,465,-90),airport('B','綠洲機場',510,195,0),airport('C','金砂機場',765,465,90)]},
    {id:'lakes',name:'湖畔田野',en:'LAKELAND FIELDS',subtitle:'四座小鎮，共享一片天空',biome:'lakes',difficulty:6,targetLandings:16,spawnInterval:13,departureRate:.32,maxTraffic:8,description:'四座機場全面開放。善用外圈，減少中央交叉。',airports:[airport('A','西田機場',225,200,0),airport('B','東湖機場',765,225,90),airport('C','南岸機場',725,515,180),airport('D','麥田機場',245,500,-90)]},
    {id:'volcano',name:'火山環礁',en:'VOLCANIC ATOLL',subtitle:'熔岩大地與深藍海洋',biome:'volcano',difficulty:7,targetLandings:18,spawnInterval:12,departureRate:.33,maxTraffic:9,description:'斜向進場與四區交會。中央火山僅是景色，可以飛越。',airports:[airport('A','玄武機場',225,245,45),airport('B','環礁機場',730,210,135),airport('C','熔岸機場',740,490,-135),airport('D','黑沙機場',255,510,-45)]},
    {id:'aurora',name:'極光港灣',en:'AURORA HARBOR',subtitle:'在極光之下完成最後一班',biome:'aurora',difficulty:8,targetLandings:20,spawnInterval:11,departureRate:.35,maxTraffic:9,description:'最忙碌的夜間值勤。保持間距，成為全空域指揮官。',airports:[airport('A','北光機場',260,200,0),airport('B','冰港機場',730,250,90),airport('C','星灣機場',690,495,180),airport('D','極地機場',250,475,-90)]}
  ];
  const data = { maps, colors, width:1000, height:700 };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  root.AirTrafficMaps = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
