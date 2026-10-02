# Keen 算術方格

50 個原創、唯一解的算術方格：4×4 共 20 關、5×5 共 20 關、6×6 共 10 關。五個章節各 10 關。規則參考：[Simon Tatham — Keen](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/keen.html)。

## 規則與操作

- 每列、每欄填入 1 到 N，每個數字恰好出現一次
- 粗框圈出的「籠」須符合左上角的目標值與 +、−、×、÷ 運算；單格籠直接等於標示數字
- 減法和除法只出現在兩格籠，不計兩個數字的順序；同籠數字可以重複，但不能違反同行或同欄規則
- 點選格子後按棋盤下方數字，或直接按數字鍵；方向鍵移動，Delete／Backspace／0／清除按鈕清空所選格，右鍵也能清除
- 紅色提示同行／同欄重複，或已填滿但算式不符的籠；只有完整符合全部規則才通關
- 提示先清除一個與唯一解衝突的數字，再逐格提供正確答案；復原不抹除曾使用提示的紀錄
- 解答預覽鎖住所有編輯，不修改棋盤、存檔或通關紀錄；重開需要確認，取消／Escape 保留棋盤，重開後可復原

## 可重現驗證

在 Arcade 根目錄執行：

```sh
python3 games/keen/generate.py
python3 games/keen/verify-primary.py
node games/keen/verify-independent.cjs
node games/keen/controller-tests.cjs
```

產生器固定種子 734891，先以隨機回溯建立 Latin square，再生成連通、形狀不同的 1–4 格籠。加乘與兩格減除混用，逐一枚舉每個籠可行的數字組合，用籠層級的最少候選回溯搜尋至第二解，只接受唯一解題目。旋轉與鏡射正規化後，50 個題目和 50 個「不看運算數值的籠形狀分割」均不重複。

`verify-independent.cjs` 只讀 levels.json，完全不匯入產生器或遊戲引擎。獨立以「格子」為搜尋變數，用 Latin 行列限制及部分和／乘積上下界剪枝，完整搜尋到第二解；另外檢查籠連通、完整分割、運算元數目、原始答案、旋轉鏡射正規化。這與主驗證的整籠數值 tuple 搜尋採用不同變數及剪枝。

- `levels.json`、`levels.js`：相同 50 題，無網路依賴
- `generation.json`：固定種子、尺寸分布、嘗試次數及正規化多樣性
- `proof.json`：主計數器的 50 個 solutionCount=1，含資料 SHA-256
- `verification.json`：獨立計數器的每題解數、搜尋節點及 canonical SHA-256
- `controller-verification.json`：實際 app.js 的 50 次手動通關、50 次提示通關、50 次錯填提示修復，以及存檔、毀損存檔、預覽、取消、復原、鍵盤、邊界切關等測試

相同種子重新產生的 levels.json、levels.js、generation.json 已確認逐位元相同。章節難度依尺寸及搜尋工作量排序，是工程指標，不代表經真人校準的難度。控制器測試使用最小 DOM，並不等於瀏覽器視覺測試。

## 整合

入口 `games/keen.html`；回首頁 `../index.html`。執行時只需要 `levels.js`、`engine.js`、`state.js`、`app.js`、`style.css`。儲存鍵 `arcade.logic.keen.v1`。

主要控制：`#level`、`#board [data-cell="0"]`、`#numbers [data-value="1"]`、`#erase`、`#hint`、`#undo`、`#reset`、`#resetCancel`、`#resetConfirm`、`#solution`、`#winNext`。桌面使用 100dvh 單畫面布局，設計目標 1180×757；手機操作列保留於棋盤下方，極小螢幕棋盤區可以獨立捲動。
