# 沉睡種子庫

決定每年多少種子發芽、多少繼續休眠，讓族群度過災年與豐年循環。

## 明確的遊戲抽象
休眠分散災年的風險，但有儲藏損耗；豐年投入發芽才能補足長期種子庫。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
結束時種子庫至少 33，至少 4 年有收成；種子庫歸零即失敗。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 選擇本年發芽比例，實際數量向下取整且至少 1；其餘留在地下。
- 收成＝發芽數×年景倍率，向下取整；休眠損耗向上取整。新種子加入種子庫但不能超過容量。
- 災年全發芽會失去整個種子庫，永遠少量發芽又可能錯過豐年，請比較完整年景順序。

## 100 情境的實質差異
Initial seed count, ordered yield and dormant decay, capacity, final bank and productive-year quota; disaster order affects germination.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：none; deterministic ecological transition, no strategic opponent appropriate

觀察：No AI policy

範圍：Not applicable; difficulty control disabled in both modes.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
