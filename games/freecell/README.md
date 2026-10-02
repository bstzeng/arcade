# 新接龍 · FreeCell

標準 52 張正面牌、八列牌陣、四個暫存格。牌列紅黑交錯遞減，同花色 A 至 K 收牌；整組搬移遵守空格容量。

50 個獨立固定種子洗牌，共 4,965 步完整合法解法，由遊戲引擎與獨立 Python 驗證器重播。

驗證：python3 games/freecell/verify.py；node games/freecell/test.js；node games/freecell/test-ui.js
