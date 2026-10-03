# 會自己演化的島

每輪只能改變一項環境條件，觀察物種競爭，替瀕危支系保留生存空間。

## 明確的遊戲抽象
不同支系有不同環境偏好；改善一項條件可能壓縮另一支系的空間。族群歸零即滅絕，本作沒有移入或種子庫。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
三支系都保留至少 3 隻，瀕危支系 2 達 10 隻。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 六個操作每次只令水量、林蔭或岩地其中一項增減 1，範圍 0–4。
- 每支系適合度＝6 減去三項環境與偏好的距離總和；≥3 增 2，≥1 增 1，其他減 1。
- 總族群超過容量時，入侵覓食者選一支系額外吃掉 1。比較環境偏好，避免只救一支而失去其他支系。
- 族群降至 0 即永久滅絕，本關失敗；改善環境不會憑空產生新個體。

## 100 情境的實質差異
Three fixed-identity niches, starting environmental axes/populations, capacity and endangered lineage; habitat tradeoffs vary.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：Invasive forager selecting a lineage under crowded resource conditions

觀察：Public lineage populations and current niche suitability; no hidden traits.

範圍：Challenge fixed normal. Sandbox easy selects the first visibly abundant lineage (population at least 6), otherwise a surviving one; normal chooses largest population, hard weighs population and current habitat fitness.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
