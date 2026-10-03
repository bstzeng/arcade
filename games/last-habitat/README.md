# 最後一塊棲地

用有限的生態通道連接破碎棲地，促進擴散，避免小族群逐代消失。

## 明確的遊戲抽象
通道才允許個體移動；小族群需要救援，承載量與每代氣候決定能否建立。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
五塊棲地各至少 2 隻，總數 20；至少三條有效通道，工程預算不可超支。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 點通道支付一次建造成本；已建通道會一直保留，不會因下一次操作消失。
- 每條通道把過多的一側送 1 個體到較少的一側，必須差至少 2 且供應側多於 2。
- 只有 1 個體的孤群會消失，2 個體以上才可在容量內繁殖；救空棲地常需要兩條通道同時送來個體。

## 100 情境的實質差異
Labeled habitat graph edge availability/cost, budget, initial populations, capacities and ordered local climate; corridor routing changes rescue.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：none; deterministic ecological transition, no strategic opponent appropriate

觀察：No AI policy

範圍：Not applicable; difficulty control disabled in both modes.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
