# 借來的外表

演化擬態與警戒色；當天敵逐漸學會辨識，就要調整下一代的策略。

## 明確的遊戲抽象
捕食者只能看外表、背景與過去攻擊結果；不能讀取本代是否真的有毒。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
保留 10 隻、1 能量並避開至少 2 次攻擊；先讓天敵親身學會一次有毒警戒，再用無毒擬態迴避兩次。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 隱蔽色符合背景時天敵看不到你，但任務也要求親自建立警戒與擬態學習。
- 有毒警戒耗 3，受到試探時不損失族群，該信號記憶＋3；無毒擬態耗 1，被試探會損失 2。
- 普通天敵在信號記憶至少 2 時迴避；成功擬態會使記憶減 1，沒使用的信號也逐代淡忘。

## 100 情境的實質差異
Ordered background and food, energy and population goal; actual learned warning/mimic sequence is required, not only camouflage.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：Predator learning visible warning patterns

觀察：Visible colour, whether prey is concealed, and memory of previous attacks. Actual current toxin/mimic identity is NEVER passed to the policy.

範圍：Challenge fixed normal. Sandbox easy avoids learned signal at memory 1, normal at 2, hard at 4; thresholds change attack choices, not population stats.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
