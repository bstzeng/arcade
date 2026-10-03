# 失去天敵之後

逐步恢復捕食關係，觀察食物網連鎖反應，防止新的優勢物種失控。

## 明確的遊戲抽象
捕食改變草食壓力，草食壓力再影響植被；過多捕食者也會讓獵物與自身衰退。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
植被至少 22，鹿兔各至少 2，捕食者維持 1–6；親自回引至少 1 隻，建立至少兩回合捕食。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 回引捕食者需要看到整張食物網：過多會吃光獵物，太少則草食壓力會耗盡植被。
- 先自然長草，再讓每兩隻草食者吃 1 植被；餘草至少 5 時草食者各增 2，否則各減 1。
- 捕食者選一種獵物，每隻最多捕 1；避難區保住部分獵物，完全抓不到食物時捕食者自身減 1。
- 草食族群歸零後不會自然重生；只有「補回較少的草食者」能明確引入新個體。

## 100 情境的實質差異
Initial vegetation/two herbivores/predators, ordered vegetation recovery and goal; releases alter delayed grazing cascade.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：Prey-selection predator

觀察：Public prey counts, shared refuge count and vegetation.

範圍：Challenge fixed normal. Sandbox easy chooses the first prey group with exposed individuals above a safety threshold, otherwise the largest available group; normal follows largest prey group; hard weighs deer as two units of hunting reward, net of refuges.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
