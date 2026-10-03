# 百代家譜

安排族群配對、追蹤隱藏特徵，在氣候突變前保留足夠的遺傳多樣性。

## 明確的遊戲抽象
這是兩性狀的簡化交叉繼承模型，不是完整孟德爾遺傳；未觀察的隱性值不公開。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
完成 6 代配對，兩性狀保留 5 種等位值，至少 9 個子代通過氣候。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 群體樣本先提供多樣性總數。個體冷耐先公開，旱耐需要觀察才揭露；觀察不推進世代。選兩個不同個體配對。
- 兩個子代分別取一方冷耐與另一方旱耐，最老兩個體退出族譜；本作保存基因樣本，不模擬完整野外死亡。
- 當代寒流只檢查冷耐，乾旱只檢查旱耐，記錄通過氣候測試的子代數；兩性狀的不同值總數就是多樣性。

## 100 情境的實質差異
Initial six two-locus genotypes, ordered climate and diversity/survival quotas; crosses change genotype multiset across generations.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：none; deterministic ecological transition, no strategic opponent appropriate

觀察：No AI policy

範圍：Not applicable; difficulty control disabled in both modes.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
