# 第七章：通知中心與審計日誌 (Notifications & Audit Trail)

## 7.1 通知中心 (Notification System)
- **通知類型**：
  - `ASSIGNED`：被指派為主辦或協辦人
  - `RFI_ANSWER`：關注之 RFI 獲得正式回覆
  - `OVERDUE`：任務逾期警示
  - `STATUS_CHANGE`：卡片或 RFI 狀態變更
- **介面表現**：
  - 頂部導覽列顯示未讀紅色 Badge。
  - 點擊鈴鐺彈出浮層選單，點擊通知可直接跳轉至對應任務或 RFI 彈窗，並標示為已讀。

## 7.2 活動歷程與審計日誌 (Activity Feed)
- 每次資料實體（`TASK`、`RFI`、`COLUMN`）發生新增、修改、狀態移動或留言時，系統強制建立一筆 `ActivityLog`。
- 記錄要素：
  - `id`: 記錄唯一識別碼
  - `projectId`: 專案識別碼
  - `entityType` / `entityId` / `entityTitle`: 受影響實體
  - `action`: 動作描述（如「移動狀態至進行中」、「核定官方答覆」）
  - `userId`: 操作人員 ID
  - `createdAt`: ISO 8601 時間戳記
- 活動日誌為唯讀且不可篡改，提供完整專案歷史回溯。
