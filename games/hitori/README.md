# Hitori 數字消除

50 個原創唯一解關卡，4×4、5×5、6×6、7×7、8×8 各 10 關。原始規則：[Nikoli Hitori](https://www.nikoli.co.jp/en/puzzles/hitori/)。

## 規則與操作

- 塗黑部分數字，保留的白格在同列與同欄都不能有重複數字
- 黑格不能共邊；白格至少有一格，且全部以共邊方式連通
- 點格子使用選取的塗黑／保留／清除模式，再點同樣標記可清除
- 未標記格也算白格，不要求把白格全部圈起來
- 方向鍵移動；2 塗黑，1 圈選白格，0／Delete 清除；右鍵圈選白格
- 提示先移除與唯一解衝突的標記，再揭開必要黑格；通關記錄區分是否使用提示
- 解答預覽不變更存檔、棋盤或通關紀錄；重新開始需確認，取消與 Escape 均保留棋盤；重開可復原

## 檔案與可重現驗證

在專案根目錄執行：

```
node games/hitori/generate.cjs
python3 games/hitori/verify.py
node games/hitori/test.cjs
node games/hitori/ui-test.cjs
```

`generate.cjs` 使用固定種子 93817031，先製作連通白格／最大獨立黑格，再填入 Latin 數字與交叉重複線索，以完整 CSP 搜尋至第二解，僅接受恰好一解。五個尺寸依序成長，各組依搜尋工作量排序；此排序為工程難度指標，不是正式人類解題評級。`levels.js` 與 `levels.json` 含相同 50 題。

`verify.py` 完全不讀取／匯入 JS 引擎或產生器。它逐列枚舉所有不相鄰黑格位元遮罩，篩選同列數字唯一，逐列檢查垂直黑格相鄰與各欄數字集合，最後用獨立 flood fill 檢查白格連通。所有題目搜尋至第二解，結果均為 1。它另檢查 50 題在旋轉、鏡射及全域數字重新命名後仍不同，並以相等數字衝突圖再驗證 50 個不同的結構，排除僅換數字的變體。

- `generation.json`：固定種子、演算法、各尺寸接受／嘗試數
- `verification.json`：獨立解數、搜尋節點、層級摘要、資料 SHA-256
- `engine-verification.json`：50 題實際引擎與狀態測試；小棋盤全部 512 種黑白組合比較
- `ui-verification.json`：實際 app.js 在最小 DOM 中執行的 50 次手動解法通關、50 次提示通關、50 次錯步後提示修復，以及復原、重開取消、儲存毀損、鍵盤、預覽與導覽測試

桌面版為 100dvh 單畫面設計（1180×757），手機將控制列移至棋盤下方；棋盤區可在極小螢幕內獨立捲動。無外部函式庫、後端或網路資料需求。此自動化測試未執行瀏覽器視覺 QA；最小 DOM 測試不代表像素排版驗證。

## 整合

入口 `games/hitori.html`，回首頁 `../index.html`。必要執行檔為 `levels.js`、`engine.js`、`state.js`、`app.js`、`style.css`。儲存鍵 `arcade.logic.hitori.v1`。主要控制：`#level`、`#board [data-cell="0"]`、`#paint2`、`#paint1`、`#paint0`、`#hint`、`#undo`、`#reset`、`#resetCancel`、`#resetConfirm`、`#solution`、`#winNext`。
