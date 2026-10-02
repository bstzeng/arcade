# 三峰接龍 · TriPeaks

標準 52 張牌、三峰 28 張、底牌一張與牌庫 23 張。露出的牌相差一點即可連接，A 與 K 可相接，牌庫只走一輪。清空三峰即勝利。

50 個獨立種子洗牌皆有完整合法解法，共 2,370 步，另以獨立規則實作重播並確認不同布局。解答示範不會覆寫玩家進度。

驗證：node games/tripeaks/test.cjs；node games/tripeaks/test-client.cjs；node games/tripeaks/generate.cjs --check
