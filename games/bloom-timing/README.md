# 開花的時差

調整花期與花形吸引授粉者，在避開競爭與錯過繁殖季之間找平衡。

## 明確的遊戲抽象
花期與授粉者飛行時窗須相遇，花型影響效率；競爭者花蜜與霜凍也有作用。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
取得 23 顆種子、至少 5 次訪花，剩 1 花蜜儲備；改花期會耗能。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 四個花期與兩種花型可自由組合；改花期的距離會花掉同量能量。
- 授粉者只能到相差不超過一個飛行時窗的花，並依策略選自己的花或競爭者。
- 花型符合口器時每次訪花產 3 種子，否則產 1；霜凍時窗不結種子，每次訪花也消耗 1 花蜜。

## 100 情境的實質差異
Initial bloom/nectar, three tongue types, ordered flight windows, competitor blooms/rewards, frost and sun; seed quota.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：Local pollinator foraging agents

觀察：Visible flower day, shape, nectar, own flight window/tongue and visits already made this turn.

範圍：Challenge fixed normal. Sandbox easy first reachable offer; normal chooses nectar/shape/travel score; hard accounts for crowding by earlier visitors.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
