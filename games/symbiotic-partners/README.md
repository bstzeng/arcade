# 共生合夥人

替植物、真菌和昆蟲搭配夥伴，建立互惠網路，抵抗季節變化與外來物種。

## 明確的遊戲抽象
連線持續交換資源；植株數固定三株，水分活力 0 表示枯萎但根系仍活著，可補水恢復，並不是死亡後復活。 這是確定性、小規模的教育遊戲模型，所有公式與數值只是玩法規則，不是科學預測、遺傳諮詢或保育建議。

## 目標與控制
三株植物水分活力至少 2、菌儲備至少 1，取得 16 顆種子。（其他情境的具體目標見畫面。）每次按一個操作按鈕推進一代；家譜觀察不推進世代。可用滑鼠、觸控、Tab/Enter 或前九項的 1–9。R 重置；P 暫停。完整環境序列在「環境預報」中，沒有反應時間限制。

## 具體玩法
- 每株可同時有一個真菌夥伴及一個昆蟲夥伴；改連線不會移除其他植株的夥伴。
- 真菌每輪收取宿主 1 碳並供水；供水少於季節需水會降低健康。昆蟲消耗 1 花蜜並按花型產生種子。
- 優先救缺水植株，再安排適合花型的授粉者；入侵者會降低當輪指定植株的授粉產量。
- 植株數固定為三株；水分活力是可恢復的水分狀態，不是個體數。0 代表地上枯萎但根系存活，補水可恢復；本作不模擬根系死亡。

## 100 情境的實質差異
Ordered drought, flower type, sunlight and attacked host; initial host health and seed quota alter persistent partnership scheduling.

每個情境有固定 ID、完整初態、獨立終局條件與非空合法操作證據。生成器使用確定性候選、實際引擎搜尋與拒絕無解候選；不以名稱、顏色、種子或旋轉鏡射當新任務。

## 生物決策
角色：none; deterministic ecological transition, no strategic opponent appropriate

觀察：No AI policy

範圍：Not applicable; difficulty control disabled in both modes.

## 證明範圍與輔助
proofs.json 中的 actions 透過與網頁相同的 engine.js 起點與 advance 執行。只有普通策略挑戰宣告可達成；自由實驗難度不宣告全部可解。提示或示範逐步使用合法按鈕，會保存輔助標記；重載、重置或切換模式不清除同關輔助標记，不覆寫已有自主紀錄。自由實驗沒有挑戰成績。未觀察隱性性狀不傳給 AI；家譜解答先合法觀察全部親代。

## 驗證
從專案根目錄執行 node games/ecology120-common/verify-all.cjs。確定性資料重建：node games/ecology120-common/generate.cjs --check。見共用 verification-report.json 的來源綁定與實際通過項目。引擎、控制器、模擬 DOM 與實際瀏覽器證据分開；本檔不宣稱已完成瀏覽器或託管驗收。
