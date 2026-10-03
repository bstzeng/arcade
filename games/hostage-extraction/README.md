# 人質撤離

穿過守衛到人質身邊，利用跟隨與原地等待安全撤離。

靠近 H 後按救援；人質 AI 每拍沿安全最短路跟隨，距離 1 時停下。可以命令原地等待，再返回接應。紅色視線對兩人都危險；你與人質都到出口附近才完成。

100 個固定離散任務。每關資料在 levels.json，逐步勝利見證在 witnesses.json；levels.js 為瀏覽器無須網路請求的相同資料副本。共用引擎 ../stealth120-common/engine.js 中的 hostage-extraction 分支是本遊戲的實際規則。

驗證：從 arcade 執行 node games/stealth120-common/verify.cjs。

提示、示範、撤銷與玩家完成分開；示範不增加完成數。正規規則的倒帶不是協助。所有動作離散進行，不使用真實時間。沒有外部服務、安裝套件或追蹤。
