# 縮字電報

在極少字數內傳達任務，讓隊友依訊息正確操作。

## 玩法

把兩個有先後次序的操作壓縮成電報。隊友只讀你的電報，依畫面詞典拆成命令；標點、空格可省略，最多六個漢字。不接受詞典以外的自由指令。

100 個可直接選擇的關卡。操作、協助紀錄、詞彙範圍、AI 資訊邊界及驗證方式見 [家族說明](../words120-common/README.md)。

- 本款資料：`levels.json` / `levels.js`
- 可重放解答：`proofs.json`
- 共用引擎：`../words120-common/engine.js`
- 共用控制器：`../words120-common/app.js`
- 驗證：於倉庫根目錄執行 `node games/words120-common/verify.cjs` 及 `node games/words120-common/ui-tests.cjs`

證明僅涵蓋明示規則下可達成目標；不宣稱唯一解或無限制中文理解。真正瀏覽器的 333／400px 與桌面畫面由整合者另行驗收。
