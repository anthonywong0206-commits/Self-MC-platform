# MC 自我溫習平台

一個無需後端、可直接部署到 GitHub Pages 及 Vercel 的 MC 題庫與自我測驗網站。

## 已完成功能

- 建立、修改、刪除題庫
- 新增、修改、複製、刪除 MC 題目
- 批量文字輸入題目
- Excel `.xlsx`、CSV 及 TSV 匯入
- 下載 Excel/CSV 欄位範本
- 題庫搜尋及排序
- 開始測驗、答題導覽、題目標記、進度顯示
- 倒數計時或正計時
- 題目及選項隨機排序
- 完成後顯示分數、正確率、正確答案及解析
- 字體大小、測驗時間、計時器、題序、答案顯示、深色模式設定
- JSON 備份及還原
- 響應式桌面、平板及手機介面
- 瀏覽器 `localStorage` 自動儲存

## 本機執行

只需要 Node.js 20 或以上版本，毋須安裝任何第三方套件。

```bash
npm run dev
```

開啟 `http://localhost:3000`。

## 生產環境檢查

```bash
npm run check
npm run build
npm run preview
```

生產檔案會輸出至 `dist/`。

## 部署至 GitHub Pages

1. 在 GitHub 建立新 repository。
2. 將整個專案推送到 `main` branch。
3. 到 repository 的 **Settings → Pages**。
4. 在 Source 選擇 **GitHub Actions**。
5. 專案已包含 `.github/workflows/deploy-pages.yml`，每次推送至 `main` 都會自動建立及部署網站。

## 部署至 Vercel

1. 將專案推送到 GitHub。
2. 在 Vercel 選擇 **Add New → Project**，匯入該 repository。
3. Vercel 會讀取 `vercel.json`：
   - Build Command：`npm run build`
   - Output Directory：`dist`
4. 按 **Deploy**。此專案毋須環境變數。

也可使用 Vercel CLI：

```bash
vercel
```

## Excel 匯入格式

首行使用以下欄位：

| 題目 | A | B | C | D | 答案 | 解析 |
|---|---|---|---|---|---|---|
| 細胞膜的主要功能是？ | 合成蛋白質 | 控制物質進出細胞 | 儲存遺傳物質 | 提供細胞能量 | B | 細胞膜具有選擇性通透性。 |

也支援英文欄名：`question`, `A`, `B`, `C`, `D`, `answer`, `explanation`。

> Excel 解析使用官方 SheetJS 瀏覽器版本。網站需要可連線至 SheetJS CDN；CSV/TSV 匯入則完全在網站內完成，不依賴外部程式庫。

## 批量輸入格式

```text
1. 細胞膜的主要功能是？
A. 合成蛋白質
B. 控制物質進出細胞
C. 儲存遺傳物質
D. 提供細胞能量
答案: B
解析: 細胞膜具有選擇性通透性。

2. 植物細胞特有的構造是？
A. 細胞壁
B. 中心體
C. 溶小體
D. 核糖體
答案: A
```

亦可使用每題一行的 Tab 分隔格式：

```text
題目<TAB>A<TAB>B<TAB>C<TAB>D<TAB>答案<TAB>解析
```

## 資料儲存說明

現版本以瀏覽器 `localStorage` 儲存資料，因此：

- 同一瀏覽器會自動保留題庫、答案及設定。
- 清除瀏覽器網站資料會刪除本機題庫。
- 建議定期在「設定 → 資料與備份」匯出 JSON 備份。
- 如日後需要登入、跨裝置同步或多人共用，可再接駁 Supabase/Firebase。
