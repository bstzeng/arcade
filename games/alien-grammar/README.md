# 外星文法課

觀察句子與動畫，推理語法，再組句控制機器。

## 玩法

讀對照語料，推理主詞、動詞、受詞的位置。點詞卡組句，再執行。帶 ka／po 格標記的方言允許三組詞任意排列；nu 是否定，zo 是複數。角色會依句子演示，不會偷看任務。

100 個可直接選擇的關卡。操作、協助紀錄、詞彙範圍、AI 資訊邊界及驗證方式見 [家族說明](../words120-common/README.md)。

- 本款資料：`levels.json` / `levels.js`
- 可重放解答：`proofs.json`
- 共用引擎：`../words120-common/engine.js`
- 共用控制器：`../words120-common/app.js`
- 驗證：於倉庫根目錄執行 `node games/words120-common/verify.cjs` 及 `node games/words120-common/ui-tests.cjs`

證明僅涵蓋明示規則下可達成目標；不宣稱唯一解或無限制中文理解。真正瀏覽器的 333／400px 與桌面畫面由整合者另行驗收。
