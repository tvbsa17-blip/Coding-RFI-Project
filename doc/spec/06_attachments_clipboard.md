# 第六章：附件與剪貼簿貼圖模組 (Attachments & Clipboard)

## 6.1 剪貼簿截圖直接貼上
- 全域及上傳元件監聽 `paste` 事件。
- 支援使用者使用系統截圖工具（如 Win + Shift + S 或 Cmd + Shift + 4）截圖後，直接按下 `Ctrl+V` / `Cmd+V`。
- 系統自動解析 `ClipboardEvent.clipboardData.items` 中的圖片物件，將其轉換為 Base64 / Blob URL 並自動命名（如 `截圖_YYYYMMDD_HHmmss.png`）。

## 6.2 拖曳上傳 (Drag & Drop)
- 支援拖曳單檔或多檔案至卡片或 RFI 上傳區塊。
- 檔案限制：單圖上限 10MB，文件上限 50MB。
- 支援格式：PNG, JPG, WebP, PDF, DOCX, XLSX, ZIP。

## 6.3 圖片燈箱 (Lightbox)
- 點擊圖片附件開啟全螢幕燈箱。
- 支援滑鼠滾輪放大、縮小 (Zoom In/Out)、90 度旋轉與原圖下載。
