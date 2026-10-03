# 影子潛入

光帶每拍切換；在暗格間穿行，取得情報後撤離。

移動到四鄰暗格。黃色條紋是本拍亮格，下拍會切換；紅色扇形是守衛視線。牆壁遮光。取得 ◇ 情報後到 E；等待可調整巡邏與照明時序。

100 個固定離散任務。每關資料在 levels.json，逐步勝利見證在 witnesses.json；levels.js 為瀏覽器無須網路請求的相同資料副本。共用引擎 ../stealth120-common/engine.js 中的 shadow-infiltration 分支是本遊戲的實際規則。

驗證：從 arcade 執行 node games/stealth120-common/verify.cjs。

提示、示範、撤銷與玩家完成分開；示範不增加完成數。正規規則的倒帶不是協助。所有動作離散進行，不使用真實時間。沒有外部服務、安裝套件或追蹤。
