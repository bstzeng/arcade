# Galaxies 旋轉星系

50 個原創、唯一解的旋轉星系：4×4 共 10 關、5×5 共 20 關、6×6 共 10 關、7×7 共 10 關。五個章節各 10 關。規則參考：[Simon Tatham — Galaxies](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/galaxies.html)。

## 規則與操作

- 棋盤需完整分割成互不重疊的星系；每個星系必須上下左右連通
- 每個星系恰含一顆指定星心，繞星心旋轉 180° 後，整個形狀完全相同
- 星心可能在格心、格邊或四格交叉點；含星心的必要起始格自動填好，不能更改
- 點編號星心或下方「星心」選單，再點棋盤格子；旋轉對應的另一格會一起塗色。更換所屬星系時，原來的對稱配對會一併清除，避免留下不對稱的半對
- 可暫時繪製不連通的區塊，紅色提醒尚未連到星心；完成時必須全棋盤連通且對稱，顏色之間的粗線就是分區邊界
- 「擦除」、右鍵或 Delete 移除整對；方向鍵移動，Enter／空白鍵塗色，Escape 回到塗色模式；滑鼠停留可預覽成對位置，不改動棋盤
- 提示先清除與唯一解衝突的一對，再提供正確配對；解答預覽不修改棋盤、存檔或通關紀錄
- 重開需要確認；取消／Escape 保留棋盤；重新開始也可復原；提示使用紀錄不因復原而消失

## 可重現驗證

在 Arcade 根目錄執行：

```sh
python3 games/galaxies/generate.py
python3 games/galaxies/verify-primary.py
node games/galaxies/verify-independent.cjs
node games/galaxies/controller-tests.cjs
```

固定種子 493147。產生器從單格出發，反覆合併相鄰且合併後中心對稱的區域，接受每個區域中心確實包含在其內的完整鋪排。主計數器對每顆星心完整枚舉連通的旋轉軌道子集合，再以區域 exact-cover 搜尋至第二解。產生階段可跳過候選太多的嘗試，但不截斷已接受題目的驗證；verify-primary.py 對全部保存題目無候選數量上限地重算。

`verify-independent.cjs` 只讀 levels.json，不匯入主產生器或引擎，也不枚舉區域候選。它直接搜尋每格所屬星心，做旋轉配對的 domain 一致性傳播、從星心出發的可達性剪枝，再以最少候選格子分支；每個完整結果獨立檢查全覆蓋、連通、唯一星心與 180° 對稱，搜尋至第二解。

全部 50 題均恰為一解，星心位置經旋轉與鏡射正規化後也皆不同。題庫包含 138 個格心、198 個格邊、42 個交叉點星心，以及 56 個非矩形星系，因此並非矩形分割的改色版本。

- `levels.json`、`levels.js`：同一份 50 題資料；center=[2×列中心, 2×欄中心]，格心座標由 0 起算
- `generation.json`：固定種子、尺寸分布、嘗試次數及 canonical 多樣性
- `proof.json`：主計數器每題 solutionCount=1，含資料 SHA-256
- `verification.json`：獨立計數器每題解數、搜尋節點、canonical SHA-256 與星心類型統計
- `controller-verification.json`：實際 app.js 的 50 次手動通關、50 次提示通關、42 次可從空盤輸入的錯誤配對修復，以及配對塗色／擦除、星心保護、存檔、毀損存檔、預覽、取消、復原、鍵盤及切關測試

8 個初始棋盤沒有可輸入的錯誤配對，因此錯誤提示修復覆蓋其餘 42 題；所有 50 題都有手動與提示完整通關測試。固定種子重新產生的資料與 generation.json 已確認逐位元一致。章節依尺寸及搜尋工作量分級，未經真人難度校準。最小 DOM 控制器測試不驗證實際瀏覽器渲染。

## 整合

入口 `games/galaxies.html`；回首頁 `../index.html`。執行時只需 `levels.js`、`engine.js`、`state.js`、`app.js`、`style.css`。儲存鍵 `arcade.logic.galaxies.v1`。

主要控制：`#level`、`#board [data-cell="0"]`、`#board [data-center="0"]`、`#center`、`#paint`、`#erase`、`#hint`、`#undo`、`#reset`、`#resetCancel`、`#resetConfirm`、`#solution`、`#winNext`。設計目標是 1180×757 單畫面桌面布局；手機操作列保留於棋盤下方，極小螢幕棋盤區可獨立捲動。
