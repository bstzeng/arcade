# 菌網交換所

讓菌網調節植物間的養分交換，避免單一宿主壟斷資源，維持森林多樣性。

## 明確的遊戲抽象
宿主供碳給菌網，菌網付能量從有限地下水取水給另一宿主；地下水耗盡不能取水，只有預報雨水另行補充宿主。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
每個宿主健康至少 3，健康差不超過 6，菌能至少 1，完成 3 次交換。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 先加入當輪日照產碳與雨水，再進行你選的交換。
- 供應宿主最多付出 3 碳給菌網；菌網花 2 能量，從有限地下水庫扣掉最多 3 水給接收宿主，之後消耗 1 維持。水庫空了便不能取水。
- 各宿主水量足夠本輪需求則健康＋1，不足則健康－2。避免一直照顧同一宿主而拉大健康差。
- 預報雨水直接加入各宿主；地下水不會自行回復。每輪剩餘宿主水＋地下水＋累積吸收量，必須等於初始水量＋累積雨水。
- 宿主水分活力是可恢復的乾旱壓力分數；0 不代表樹木死亡，本作保留活根以研究水分分配。

## 100 情境的實質差異
Host-specific carbon/water/health, fungal reserve, bounded groundwater, ordered rain/light/demand and balance goal; route direction and timing matter.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：none; deterministic ecological transition, no strategic opponent appropriate

觀察：No AI policy

範圍：Not applicable; difficulty control disabled in both modes.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
