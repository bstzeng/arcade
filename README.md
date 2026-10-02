# Arcade · 遊戲小宇宙

輕量、響應式的繁體中文遊戲入口網站。原生 HTML / CSS / JavaScript，無套件、無外部字型、無追蹤，也不需要建置。

目前六張卡片都是**待開發的概念預覽**，並非可玩的遊戲；未承諾推出日期。

## 本機預覽

在儲存庫根目錄執行：

```sh
python3 -m http.server 8080
```

開啟 http://localhost:8080 。也可直接打開 `index.html`。

## 檔案

- `index.html`：首頁架構、導覽與區塊
- `styles.css`：響應式版面、CSS 插畫、鍵盤焦點與減少動態效果設定
- `app.js`：遊戲資料、卡片呈現、分類篩選、搜尋與空狀態
- `favicon.svg`：站台圖示

## 新增遊戲

1. 在 `app.js` 的 `games` 陣列新增資料：

```js
{
  id: 'my-game',
  title: '我的遊戲',
  category: 'puzzle', // puzzle、strategy 或 casual
  description: '一段簡短介紹。',
  note: '邏輯 × 挑戰',
  art: 'tiles', // tiles、maze、blocks、memory、planet、target
  color: '#c5b3f5',
  background: '#302b48',
  word: 'MY GAME',
  status: 'soon',
  url: ''
}
```

2. 遊戲完成後，放入 `games/my-game/index.html`（或 `games/my-game.html`）。
3. 將 `status` 設成 `'ready'`，`url` 設成 `'./games/my-game/index.html'`。卡片會自動顯示「開始遊戲」。只接受本站 `./games/` 下、英數字／底線／連字號命名的相對路徑，避免錯誤或不安全網址。
4. 加入新類型時，同時更新 `categoryNames` 與 `index.html` 篩選按鈕；插畫可在 `artMarkup` 與 CSS 擴充。

遊戲數量會自動更新；分類與搜尋可以交叉使用。搜尋不到時可一鍵重設。所有導覽都能用鍵盤操作；未完成遊戲不會提供假的啟動連結。

## GitHub Pages

此網站可直接由 `main` 分支根目錄 `/ (root)` 發布，不需要 GitHub Actions 或 Jekyll。儲存庫保持原本的可見性；私人儲存庫能否使用 Pages 取決於 GitHub 帳號方案。啟用前也應留意 GitHub Pages 網站通常是公開可見，即使原始碼儲存庫為私人。

## 基本檢查

```sh
node --check app.js
```

建議新增內容後，在桌面及手機寬度驗證：全部遊戲、各分類、關鍵字搜尋、無結果重設、鍵盤焦點、遊戲連結與直接重新整理。
