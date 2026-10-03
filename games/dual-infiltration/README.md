# 雙區同步潛入

輪流操作兩名特工，踩住壓板替彼此開門。

A 和 B 在上下兩区行動。A 踩 P 開 B 的門；B 取得開關 S 後永久打開 A 的門。B 的門在 B 通過後鎖定為開。兩名特工都到 E 才完成；切換角色不耗回合。

100 個固定離散任務。每關資料在 levels.json，逐步勝利見證在 witnesses.json；levels.js 為瀏覽器無須網路請求的相同資料副本。共用引擎 ../stealth120-common/engine.js 中的 dual-infiltration 分支是本遊戲的實際規則。

驗證：從 arcade 執行 node games/stealth120-common/verify.cjs。

提示、示範、撤銷與玩家完成分開；示範不增加完成數。正規規則的倒帶不是協助。所有動作離散進行，不使用真實時間。沒有外部服務、安裝套件或追蹤。
