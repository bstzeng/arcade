# 群居的代價

調整分享食物、守望與育幼行為，觀察合作與搭便車如何影響族群。

## 明確的遊戲抽象
採食、警戒與育幼互相佔用時間；鄰居依可見互信與資源決定合作或搭便車。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
成體至少 11、幼體至少 1、食物至少 1、互信至少 2，育幼至少兩次。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 你與鄰居分別選工作；你的採集產 3 食物，鄰居採集產 2，另加當日野果。
- 分享花 2 食物、加 2 互信；育幼加 1 幼體；守望避免當日掠食。制裁減少搭便車但也降低 1 互信。
- 群落每天吃 2；缺糧會失去成體和幼體。有至少 3 幼體及 1 食物時，2 幼體長成 1 成體。

## 100 情境的實質差異
Initial social/resource state, ordered raids/fruit and adulthood quota; player task affects cooperation/defection response.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：Neighbor deciding foraging, care, watching or freeloading

觀察：Public food, trust, young, freeloading count and raid forecast; player current role not passed.

範圍：Challenge fixed normal. Sandbox easy reacts to immediate hunger, low trust and absence of young, ignoring raid forecasts; normal reacts to food/trust/young; hard additionally forecasts raids and responds to past freeloading.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
