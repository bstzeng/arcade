# 海底噴泉居民

讓深海群落適應噴泉脈動，發展能量儲存或休眠能力，撐過冷卻期。

## 明確的遊戲抽象
熱脈衝提供能量；容量、酵素與休眠分別改變溢流、活動成本與冷卻期存活。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
群落至少 6，最後甦醒、儲能至少 2，完成兩次化能收穫。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 化能收穫只有活動時有效，取得脈衝強度×3 能量；多於容量的部分會逸散。
- 儲能囊花 2 能量換 4 容量；酵素花 2 降低每代活動成本，最低 1。休眠固定耗 1。
- 在熱脈衝時甦醒且能量至少 3，便花 2 繁殖一個群落；最後要有足夠能量並保持清醒。

## 100 情境的實質差異
Initial reserve/capacity, ordered pulse magnitudes and cold spells; timing of inherited storage/enzymes/sleep versus breeding.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：none; deterministic ecological transition, no strategic opponent appropriate

觀察：No AI policy

範圍：Not applicable; difficulty control disabled in both modes.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
