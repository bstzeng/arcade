# 精準命名師

用最短描述選中全部目標圖案，又不能包含干擾圖案。

## 玩法

用屬性詞及「而且／或／非」選中所有帶星號的圖案，不可選到其他圖案。最短以屬性詞出現次數計算，括號及連接詞不計；任何同樣精簡且集合正確的描述都接受。

100 個可直接選擇的關卡。操作、協助紀錄、詞彙範圍、AI 資訊邊界及驗證方式見 [家族說明](../words120-common/README.md)。

- 本款資料：`levels.json` / `levels.js`
- 可重放解答：`proofs.json`
- 共用引擎：`../words120-common/engine.js`
- 共用控制器：`../words120-common/app.js`
- 驗證：於倉庫根目錄執行 `node games/words120-common/verify.cjs` 及 `node games/words120-common/ui-tests.cjs`

證明僅涵蓋明示規則下可達成目標；不宣稱唯一解或無限制中文理解。真正瀏覽器的 333／400px 與桌面畫面由整合者另行驗收。
