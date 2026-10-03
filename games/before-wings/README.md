# 長出翅膀之前

逐代選擇攀爬與滑翔特徵，跨越愈來愈寬的峽谷，同時維持覓食能力。

## 明確的遊戲抽象
攀爬與滑翔共同增加距離；大滑翔膜也提高每代食物需求。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
跨過至少 5 道峽谷，最後保留 2 能量；特徵逐代繼承。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 每代只選育一個性狀，其值增加 1 並永久繼承。
- 滑翔距離＝2×攀爬＋3×滑翔；到達峽谷所需距離才能跨越。
- 每代覓食＋果實補充能量，滑翔性狀＋2 是維持成本，成功跨越再花 1；膜太大可能餓倒。

## 100 情境的實質差異
Ordered canyon gaps and fruit, initial energy, horizon and crossing quota; inherited movement/feeding allocation changes.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：none; deterministic ecological transition, no strategic opponent appropriate

觀察：No AI policy

範圍：Not applicable; difficulty control disabled in both modes.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
