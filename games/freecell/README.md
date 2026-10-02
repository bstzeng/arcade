# 新接龍 · FreeCell

純靜態繁體中文遊戲，入口是 `../freecell.html`。不用後端、外部字型或 CDN。可直接開啟 HTML，或由任何靜態網站伺服器提供。

## 玩法與控制

- 一副 52 張牌，四種花色各 A–K；八列依序發 7、7、7、7、6、6、6、6 張，全部朝上
- 四個暫存格各存一張；四個同花色收牌區各依 A → K 遞增
- 牌列須黑紅交錯遞減；空列可放任何牌
- 整組搬移上限為 `(空暫存格 + 1) × 2^可借用空牌列數`；空的目的列不列入可借用空間
- 點牌或牌組，再點目的地；「復原」不限次數；Ctrl / Command + Z 復原、Esc 取消選取、H 顯示提示
- 「提示」不會自動出牌。「解法示範」可逐步查看、單步執行或播放，每 0.55 秒一步；可隨時暫停
- 已離開驗證路線時，不會套用錯誤的後續解法；一般提示只建議合法移動，清楚註明不保證後續可解
- 50 局編號選單、「重開」、「存檔」、「讀檔」、通關與步數／時間紀錄
- 自動接續、手動存檔，以及「玩法」中的匯出／匯入；載入時從原始牌局逐步驗證完整歷史，不接受任意拼造的牌面
- 桌面以單一視窗為主；手機橫向滑動八列，提供牌面放大。極端長牌列在牌桌內捲動，不延長整頁
- 關閉頁面／切到背景會停止播放並保存；關閉儲存權限時仍可遊玩並匯出檔案

規則依據：[Brainium 官方 FreeCell 說明](https://brainium.helpshift.com/hc/en/8-freecell/faq/334-how-do-i-play-freecell/)，2026-10-02 查核。收牌區中的牌不再移回牌桌。

## 有解證明與真實差異

`deals.json` 包含 **50 個各自洗牌的初始分布**及完整合法移動證明。每局使用 MT19937 固定種子，以指定 Fisher–Yates 演算法洗 52 張牌；不是只替換花色、顏色或列順序。每一局先洗牌，再由搜尋程式求解，而不是從已解完牌面製作簡單模板。

- 50 局共 **4,965 步**證明；每局 **74–127 步**
- 遊戲的 JavaScript 引擎逐步重播 50 局，全部達成四花色各 13 張
- 另一份獨立 Python 驗證器重新實作規則，並逐步檢查出牌與牌數守恆
- 驗證每局開始正好 52 張獨立牌、正確 7/7/7/7/6/6/6/6 發牌、52 張完全收齊
- 將八列排序，並枚舉所有保留或整體互換黑紅關係的花色重新命名後，**仍有 50 個不同的標準化起始狀態**
- 所有 50 局只做直接收牌都會卡住，必須使用牌列／暫存格調度；不是 52 下就可收完的 trivial 排列
- 解法可以用合法整組移動，不代表最少步數；證明只保證初始牌面有解，不保證任意走法都可通關

目前 `deals.json` SHA-256：

`ed1d97ea45bab17796a9a92e993fa99c2853fad37e2ec43604cc4fe2e5d6a5db`

## 重現與測試

從 `arcade` 目錄執行：

```sh
node games/freecell/test.js
node games/freecell/test-ui.js
python3 games/freecell/verify.py
python3 games/freecell/verify.py --regenerate
```

`test-ui.js` 以無相依套件的 DOM 狀態模擬執行實際 HTML 程式，涵蓋選牌／雙擊、50 局解法完成、復原、讀寫與重新載入、損毀存檔拒絕、儲存權限失敗、偏離路線提示，以及示範暫停／重開／取消。這是互動狀態測試，不等於真實瀏覽器視覺測試。

最後一項需 Python 3 與 g++，會在暫存目錄編譯求解器、重新產生 50 局，並比較每個牌面和每一步證明與發行資料完全相同。求解器是確定性的加權最佳優先搜尋，狀態以暫存格與列的對稱性去重，並使用安全自動收牌；所做的每一步都完整寫入證明。

重新產生發行資料：

```sh
g++ -O3 -std=c++17 games/freecell/solve.cpp -o /tmp/freecell-solve
/tmp/freecell-solve 50 150000 > games/freecell/deals.json
node games/freecell/build-data.js
node games/freecell/test.js
node games/freecell/test-ui.js
python3 games/freecell/verify.py
```

`build-data.js` 只將同一份 JSON 包成 `window.FREECELL_DEALS`，供 `file://` 或一般網站直接使用，沒有 fetch 或後端需求。測試也會檢查兩份資料一致。

### 資料格式

牌編碼：`suit * 13 + rank - 1`，花色依序黑桃、紅心、梅花、方塊，點數 A=1 至 K=13。每列從被蓋牌到露出的最底牌依序儲存。

移動：`[來源類型, 來源索引, 目的類型, 目的索引, 張數]`。類型 0=牌列、1=暫存格、2=收牌區；索引從 0 起。來源不能是收牌區。整組只能是合法黑紅遞減序列且不得超出當時的空間容量。

## 檔案

執行遊戲必要：`../freecell.html`、`engine.js`、`deals.js`。

隨遊戲發行的可重現證明：`deals.json`、`verify.py`、`solve.cpp`、`test.js`、`test-ui.js`、`build-data.js`、本 README。`generation.log` 記錄各局種子與求得的步數，不參與執行。
