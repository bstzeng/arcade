# 金字塔接龍：50 局可重播驗證牌局

一副完整 52 張牌，28 張金字塔與 24 張牌庫。可用牌合計 13 消除，K 單獨移除；一次翻一張，廢牌頂牌限定，最多兩次循環。清空金字塔即勝利。

50 個不同牌局全部經獨立 Python 檢查器及實際 JavaScript 遊戲引擎逐步驗證，共 2,163 個合法動作。

驗證：python3 games/pyramid/verify.py；node games/pyramid/test.js；node games/pyramid/test-ui.js
