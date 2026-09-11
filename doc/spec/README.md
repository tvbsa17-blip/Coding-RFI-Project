# 系統規格文件庫 (doc/spec/)

本目錄存放**專案管理與 RFI 追蹤系統**的正式功能規格書 (Software Requirement Specification, SRS)。
本規格採**章節式架構 (Chapter-based Architecture)** 組織，任何新功能完成開發後，皆必須寫回對應章節進行維護與更新。

---

## 📚 規格章節目錄 (Table of Contents)

* [**第一章：系統概述與專案範圍**](./01_overview.md)
  * 系統定位、核心價值、示範專案背景與整體範圍。
* [**第二章：系統架構與技術棧**](./02_architecture.md)
  * 前端單頁應用架構、狀態管理、本機資料持久化、相依套件與目錄規範。
* [**第三章：角色權限存取控制 (RBAC)**](./03_rbac_permissions.md)
  * Admin / PM / Member / Client 四層角色權限矩陣、操作約束與身分切換。
* [**第四章：看板管理與時程甘特圖模組**](./04_kanban_and_gantt.md)
  * 欄位自訂、卡片拖曳排序 (Drag & Drop)、時間維度 (日/週/月) 甘特圖、工時與關聯單號。
* [**第五章：資訊需求單 (RFI) 追蹤模組**](./05_rfi_tracking.md)
  * RFI 編碼原則、六階狀態機生命週期、官方答覆審核 (Official Response)、一鍵轉化為任務卡片。
* [**第六章：附件與剪貼簿貼圖模組**](./06_attachments_clipboard.md)
  * 剪貼簿直接貼圖 (Ctrl+V / Cmd+V)、檔案拖曳上傳、格式與容量限制、燈箱放大檢視。
* [**第七章：通知中心與審計日誌模組**](./07_notifications_audit.md)
  * 即時鈴鐺通知機制、系統活動審計軌跡 (Activity Feed)。

---

## 🔄 規格書維護規則 (Maintenance Rules)

1. **功能完成後寫回**：當新功能於 `doc/dev/plan_<功能名稱>.md` 開發完畢並驗證後，必須將正式行為、資料介面與操作規範寫回本目錄對應章節。
2. **新增獨立章節**：若新增全新獨立模組（如：報表匯出、多專案管理），應建立新編號章節（例如 `08_reports_export.md`）並同步更新此索引表。
3. **保持代碼一致**：規格書中所引用的介面欄位 (`types.ts`) 與操作邏輯必須與實際程式碼 100% 吻合。
