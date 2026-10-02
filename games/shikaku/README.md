# Shikaku 四角分割

50 個原創唯一解關卡，4×4、5×5、6×6、7×7、8×8 各 10 關。原始規則：[Nikoli Shikaku](https://www.nikoli.co.jp/en/puzzles/shikaku/)。

## 規則與操作

- 棋盤完整分割成矩形（長方形或正方形），不重疊、不留空格
- 每個矩形恰含一個數字，其面積等於數字
- 點選兩個對角，看著色預覽，再按「確認分割」；可在確認前修改終點或取消
- 無效面積、多個／沒有數字、重疊均不允許提交；不會破壞已完成的矩形
- 「擦除」模式移除整塊；右鍵或 Delete 也可移除
- 方向鍵移動，Enter／空白選對角，Escape 取消預覽；觸控使用點兩個對角與確認按鈕
- 提示先移除局部合法但與唯一解衝突的矩形，再新增一個正確矩形
- 預覽解答不修改棋盤或存檔，也不計通關；重開需要確認，取消或 Escape 均保留原局；重開可復原

## 檔案與可重現驗證

在專案根目錄執行：

```
node games/shikaku/generate.cjs
python3 games/shikaku/verify.py
node games/shikaku/test.cjs
node games/shikaku/ui-test.cjs
```

`generate.cjs` 使用固定種子 6124672，產生完整無單格區塊的隨機矩形鋪排，在每塊隨機放置面積線索，使用候選矩形 bit-mask 精確覆蓋搜尋至第二解，只接受一解的題目。依尺寸與每個線索候選數／分支量排列；這是工程難度指標，不是正式人類解題評級。`levels.js` 與 `levels.json` 含相同 50 題。

`verify.py` 完全不讀取／匯入 JS 引擎或產生器。它直接枚舉全部四座標矩形（不同於 JS 因數長寬枚舉），依獨立規則計算每個線索的候選；再做以線索為主的集合不重疊回溯（不同於 JS 以未覆蓋格為主的 BigInt 精確覆蓋）。終局獨立檢查面積、唯一線索、邊界、重疊及全覆蓋。所有題目均搜尋至第二解、恰為一解；旋轉與鏡射正規化後也皆不同。

- `generation.json`：固定種子、演算法、各尺寸接受／嘗試數
- `verification.json`：每題獨立解數、節點、矩形數、正規化 SHA-256
- `engine-verification.json`：50 題引擎解數、狀態操作、非法矩形／重疊／覆蓋測試
- `ui-verification.json`：實際 app.js 在最小 DOM 中執行的 50 次點對角手動通關、50 次提示通關、50 次局部合法錯解修復；另測鍵盤、預覽、取消、重疊、擦除、存檔與毀損防護

桌面為 100dvh 單畫面設計（1180×757），手機控制列放棋盤下方，極小螢幕棋盤區可獨立捲動。無外部依賴、後端或網路資料需求。此自動化測試未執行瀏覽器視覺 QA；最小 DOM 測試不驗證實際渲染。

## 整合

入口 `games/shikaku.html`，回首頁 `../index.html`。必要執行檔：`levels.js`、`engine.js`、`state.js`、`app.js`、`style.css`。儲存鍵 `arcade.logic.shikaku.v1`。主要控制：`#level`、`#board [data-cell="0"]`、`#draw`、`#erase`、`#confirm`、`#cancelSelection`、`#hint`、`#undo`、`#reset`、`#resetCancel`、`#resetConfirm`、`#solution`、`#winNext`。
