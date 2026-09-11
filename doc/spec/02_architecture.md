# 第二章：系統架構與技術棧 (Architecture & Tech Stack)

## 2.1 技術棧組成
- **前端核心**：React 19 + TypeScript (~5.8)
- **建置工具**：Vite 6
- **樣式系統**：Tailwind CSS v4
- **動畫與動態**：Motion (Framer Motion)
- **圖示庫**：Lucide React
- **狀態持久化**：React Context API + 本機 `localStorage`

## 2.2 目錄結構規範
```
Coding-RFI-Project/
├── doc/
│   ├── dev/            # 開發前計畫書 (plan_<功能名稱>.md)
│   └── spec/           # 系統規格書 (分章節)
├── src/
│   ├── components/     # UI 元件層 (Kanban, Gantt, RFI, Modals 等)
│   ├── context/        # 狀態管理層 (AppContext.tsx)
│   ├── data/           # 種子資料 (initialData.ts)
│   ├── types.ts        # 全域資料型別定義 (TypeScript Schema)
│   ├── App.tsx         # 主視圖路由與彈窗容器
│   ├── main.tsx        # React 根掛載點
│   └── index.css       # Tailwind 基礎樣式
├── start.bat / stop.bat # Windows 一鍵啟動 / 關閉腳本
├── start.ps1 / stop.ps1 # PowerShell 啟動 / 關閉腳本
├── DESIGN.md           # 系統架構與設計指南
├── AGENTS.md           # AI 代理人開發工作規範
└── package.json        # 專案相依與建置腳本
```

## 2.3 資料流向與持久化機制
- 系統啟動時優先自 `localStorage` 讀取快照；若無快照則以 `initialData.ts` 之種子資料初始化。
- 任何對專案、欄位、卡片、RFI、附件、留言的變更，均透過 `AppContext` 提供之 Dispatcher 即時同步至 `localStorage`，並自動寫入 `activityLogs`。
