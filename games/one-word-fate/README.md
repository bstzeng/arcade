# 一字改命

每回合只換故事中的一個字，觀察情節連鎖變化。

## 玩法

每回合只替換一個「已／未」字，其他文字保持原樣。每次改字都會沿因果規則更新場景；不必照示範順序，任何達成最終目標的合法連鎖都算成功。

100 個可直接選擇的關卡。操作、協助紀錄、詞彙範圍、AI 資訊邊界及驗證方式見 [家族說明](../words120-common/README.md)。

- 本款資料：`levels.json` / `levels.js`
- 可重放解答：`proofs.json`
- 共用引擎：`../words120-common/engine.js`
- 共用控制器：`../words120-common/app.js`
- 驗證：於倉庫根目錄執行 `node games/words120-common/verify.cjs` 及 `node games/words120-common/ui-tests.cjs`

證明僅涵蓋明示規則下可達成目標；不宣稱唯一解或無限制中文理解。真正瀏覽器的 333／400px 與桌面畫面由整合者另行驗收。
