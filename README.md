# 專案管理與 RFI 追蹤系統 (SCM 2.0)

整合**看板式工作流 (Kanban)**、**時程甘特圖 (Gantt Chart)** 與 **資訊需求單 (RFI, Request for Information)** 追蹤之企業專案管理系統。

---

## ⚡ 本地快速啟動與關閉

專案已為 Windows 環境配置了一鍵啟動與關閉腳本，支援**直接雙擊執行**或**終端機指令**：

### 方式一：Windows 檔案總管雙擊執行（推薦）

* **啟動伺服器**：雙擊根目錄下的 [`start.bat`](file:///c:/Users/Jieh/Documents/VScode%20Project/Coding-RFI-Project/start.bat)
  * 自動檢查 Node.js 與相依套件環境。
  * 自動於獨立視窗啟動 Vite 伺服器 (`http://localhost:3000`)。
  * 自動開啟預設瀏覽器進入系統。
* **關閉伺服器**：雙擊根目錄下的 [`stop.bat`](file:///c:/Users/Jieh/Documents/VScode%20Project/Coding-RFI-Project/stop.bat)
  * 安全尋找並終止佔用 Port 3000 的伺服器程序。
  * 自動釋放通訊埠並關閉伺服器視窗。

---

### 方式二：PowerShell 終端機執行

若您習慣在 VSCode 內建終端機或 PowerShell 中操作：

```powershell
# 啟動伺服器
.\start.ps1

# 關閉伺服器
.\stop.ps1
```

*(腳本已內建繞過 PowerShell ExecutionPolicy 限制，在任何 Windows 電腦上均可無障礙執行)*

---

### 方式三：標準 npm 指令

```bash
# 安裝相依套件 (首次執行)
npm install

# 啟動本地開發伺服器 (自動開啟 http://localhost:3000)
npm run dev

# 建置正式版本
npm run build

# 型別檢查
npm run lint
```

---

## 🛠️ 本次重構與優化重點

1. **安裝完整專案相依套件**：
   - 解決本地環境原本缺少 `node_modules` 的問題，成功下載並編譯 React 19、Tailwind CSS v4、Vite 6 等全部 215 個相關套件。
2. **Vite 本地運行組態優化** ([`vite.config.ts`](file:///c:/Users/Jieh/Documents/VScode%20Project/Coding-RFI-Project/vite.config.ts))：
   - 移除雲端 AI Studio 專屬的暫停熱更新 (DISABLE_HMR) 與編碼註解。
   - 配置標準通訊埠 `port: 3000`、綁定 `0.0.0.0` 並啟用 `open: true` 自動開啟瀏覽器。
3. **npm package.json 重構** ([`package.json`](file:///c:/Users/Jieh/Documents/VScode%20Project/Coding-RFI-Project/package.json))：
   - 正式命名專案為 `coding-rfi-project`。
   - 精簡無效雲端套件，校正 Windows 環境相容指令。
4. **雙模式跨平台管理腳本**：
   - 解決 Windows PowerShell 預設禁止載入 `npm.ps1` (`PSSecurityException`) 的阻擋問題。
   - 提供 UTF-8 BOM 編碼之雙擊批次檔 (`start.bat` / `stop.bat`) 與 PowerShell 腳本 (`start.ps1` / `stop.ps1`)。
