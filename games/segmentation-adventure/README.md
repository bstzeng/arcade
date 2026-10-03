# 斷詞探險

決定一串文字如何切詞，讓句意符合指定畫面。

## 玩法

點字與字之間的切口，把連續文字切成詞。畫面提示決定目標意思；有些句子容許複合詞與短語兩種分析，兩種都接受。只以本關公布詞法解讀，不宣稱中文只有一種斷詞法。

100 個可直接選擇的關卡。操作、協助紀錄、詞彙範圍、AI 資訊邊界及驗證方式見 [家族說明](../words120-common/README.md)。

- 本款資料：`levels.json` / `levels.js`
- 可重放解答：`proofs.json`
- 共用引擎：`../words120-common/engine.js`
- 共用控制器：`../words120-common/app.js`
- 驗證：於倉庫根目錄執行 `node games/words120-common/verify.cjs` 及 `node games/words120-common/ui-tests.cjs`

證明僅涵蓋明示規則下可達成目標；不宣稱唯一解或無限制中文理解。真正瀏覽器的 333／400px 與桌面畫面由整合者另行驗收。
