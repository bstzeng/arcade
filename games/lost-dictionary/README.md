# 失落字典

從反覆出現的陌生詞推理意思，逐步建立自己的字典。

## 玩法

每座遺跡有四個陌生名詞。觀察詞串與畫面中的物件集合，利用交集和排除建立詞典。詞序不表示順序；每詞只指一物，各詞不同義。成功後會把詞義加入本機筆記。

100 個可直接選擇的關卡。操作、協助紀錄、詞彙範圍、AI 資訊邊界及驗證方式見 [家族說明](../words120-common/README.md)。

- 本款資料：`levels.json` / `levels.js`
- 可重放解答：`proofs.json`
- 共用引擎：`../words120-common/engine.js`
- 共用控制器：`../words120-common/app.js`
- 驗證：於倉庫根目錄執行 `node games/words120-common/verify.cjs` 及 `node games/words120-common/ui-tests.cjs`

證明僅涵蓋明示規則下可達成目標；不宣稱唯一解或無限制中文理解。真正瀏覽器的 333／400px 與桌面畫面由整合者另行驗收。
