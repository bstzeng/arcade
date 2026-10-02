# 三峰接龍 / TriPeaks

入口：`../tripeaks.html`。原生 HTML/CSS/JavaScript，無後端、套件、CDN 或外部字型；可直接開啟 HTML，也可由靜態網站提供。

## 玩法與功能

- 標準 52 張獨立牌；三峰牌陣共 28 張，四列為 3 / 6 / 9 / 10 張
- 起初只有底列 10 張翻開；上方牌必須等兩張遮蓋牌都移除才能翻開
- 接到接牌堆的牌須相差 1 點，花色不限；**A–K 可以循環相接**
- 起手接牌堆 1 張，牌庫 23 張，一次抽 1 張、只走一輪、不可重洗；即使有牌可接也可抽牌
- 清空全部 28 張即勝利，牌庫不必抽完
- 50 副編號牌局、逐局保存、無限悔棋、重新開始確認、下一副、計時、步數、通關收藏
- 提示只給出已驗證路線的一步；若偏離，先確認退回最近已驗證節點，不把「找不到原路線」說成「無解」
- 完整解答清單與播放均使用相同規則引擎。播放不覆蓋玩家進度，離開可接續原局
- 桌面同屏牌桌；手機維持三峰排列，可用「大牌」模式左右滑動。全繁體中文、鍵盤操作、減少動態效果支援
- 儲存停用或損毀時可繼續遊玩；恢復時只接受能由實際規則合法回放的行動歷史

## 可解保證的範圍

50 副的**初始狀態**均有完整合法通關證據；不是保證玩家任意選擇後仍可解。每副都是未經手動改動的 Fisher–Yates 洗牌，固定 Mulberry32 種子從 7319001 起搜尋。51 個候選中收錄 50 個已求得解的牌局；種子 7319035 在 500,000 節點上限後仍未定，故未收錄，也未宣稱無解。

全部 50 副均非花色換皮：忽略花色、全域點數環的旋轉/反轉、以及三峰水平鏡像後，仍有 50 種不同的 canonical 點數排列。各局都必須合法移除完整 28 張，牌陣至少含 11 種不同點數。證據合計 2,370 步，每局 39–51 步（28 次出牌、11–23 次抽牌），共實際使用 110 次 A–K 轉接。這些是合法解，**不宣稱最短解或難度評級**。

## 重現驗證

從 `arcade/` 執行，僅需 Node.js（本次以 v24.19.0 執行）：

```sh
node games/tripeaks/test.cjs
node games/tripeaks/test-client.cjs
node games/tripeaks/verify-independent.cjs
node games/tripeaks/generate.cjs --check
```

`test.cjs` 回放實際遊戲引擎並測試遮蓋、點數、牌庫、所有悔棋前綴及提示後綴。`test-client.cjs` 在輕量 DOM 合約模擬器中執行實際客戶端的 50 局通關與控制流程；這不是視覺瀏覽器測試。

`verify-independent.cjs` **不匯入遊戲引擎**，由幾何位置自行建出遮蓋關係，逐步驗證牌組、移除、抽牌、A–K 循環及終局。`generate.cjs --check` 重新洗牌、搜尋與產生全部證據，確認 `deals.js` 逐位元組一致。

重新產生資料與報告：

```sh
node games/tripeaks/generate.cjs
node games/tripeaks/verify-independent.cjs --json > games/tripeaks/certification.json
```

詳見 [QA.md](QA.md)，完整驗證結果為 [certification.json](certification.json)。規則參照遊戲開發商 [Goodsol](https://www.goodsol.com/games/tripeaks.html)，本版明確選用上層蓋牌、A–K 循環、一次牌庫變體。
