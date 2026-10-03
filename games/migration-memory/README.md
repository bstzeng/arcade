# 遷徙不是直線

試探不同遷徙路線，讓後代繼承路線記憶，同時避免耗盡沿途棲地。

## 明確的遊戲抽象
走過的路線降低後代能耗；同一濕地重複取食會耗盡，空置才回復。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
族群達 16，至少 5 次抵達，沿途仍保留 6 單位食物。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 每次操作代表一季完整路線；每個路線經過的濕地會被取食。
- 飛行成本＝路線成本＋當季逆風－路線記憶，至少 1。每次走過該路線，後代記憶增加 1，最多 3。
- 到達時能量至少 2 才能繁殖，否則減少族群；沒有使用的濕地才回復食物。

## 100 情境的實質差異
Wetland capacities, per-stop intake, route flight cost, ordered winds/rain and reserve goal; route histories modify future energy and depletion.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：none; deterministic ecological transition, no strategic opponent appropriate

觀察：No AI policy

範圍：Not applicable; difficulty control disabled in both modes.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
