# 第四章：看板管理與時程甘特圖模組 (Kanban & Gantt)

## 4.1 看板工作流 (Kanban Board)
- **預設欄位**：
  - 待處理 (To Do)
  - 進行中 (In Progress)
  - 審查與測試 (Review)
  - 已完成 (Done)
- **卡片核心屬性 (`Task`)**：
  - `id`: 唯一識別碼
  - `title`, `description`: 任務標題與說明
  - `priority`: 優先級 (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
  - `startDate`, `dueDate`: 預計開始與截止日
  - `estimatedHours`, `actualHours`: 預估與實際工時
  - `assigneeId`, `coAssigneeIds`: 主辦人與多位協辦人
  - `tags`: 標籤分類
  - `rfiIds`: 關聯的 RFI 單號清單
  - `attachmentIds`: 附加檔案清單

## 4.2 卡片拖曳 (HTML5 Drag & Drop)
- 支援使用者跨欄位拖曳。
- 拖曳放置後觸發 `moveTask(taskId, targetColumnId)`，更新狀態並同步記錄審計日誌。
- CLIENT 角色受防竄改防護，禁止觸發拖曳。

## 4.3 時程甘特圖 (Gantt Chart)
- **時間維度切換**：日視圖 (Day)、週視圖 (Week)、月視圖 (Month)。
- **今日基準線 (Today Line)**：高亮顯示今日日期縱向對齊線。
- **進度填滿比 (Progress Ratio)**：根據預估工時與耗時計算條狀圖填滿程度。
- **逾期狀態識別**：超過 `dueDate` 且未在已完成欄位之任務，自動標示紅色警示。
