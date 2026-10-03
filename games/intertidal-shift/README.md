# 潮間帶換班

選擇生物附著的高度，利用漲退潮時差，平衡乾燥風險與覓食機會。

## 明確的遊戲抽象
附著高度影響浸水、乾燥與浪擊；三種生物耐乾和抓地不同。群落歸零即滅絕，搬位不會產生新個體。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
三個附著群落都存活（至少 2），累積攝食 26。每潮只能搬一群。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 每潮只能替一種生物換附著高度，其他群落留在原位。
- 高度不高於潮位時可取食，但浪力超過抓地力＋高度會造成損失；露出水面則按超過耐乾的高度差受損。
- 所有群落每潮都要消耗 1。先看下一輪潮位與浪力，挑最需要搬遷的一群。
- 群落降至 0 即永久滅絕，本關失敗；本作沒有外來幼生補充。

## 100 情境的實質差異
Species-specific drying/grip, initial heights/populations, ordered tide/wave/plankton and feeding quota; vertical placements affect survival.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：none; deterministic ecological transition, no strategic opponent appropriate

觀察：No AI policy

範圍：Not applicable; difficulty control disabled in both modes.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
