# 第五章：資訊需求單 (RFI) 追蹤模組

## 5.1 RFI 編碼原則
- 格式：`RFI-YYYYMM-XXX`（例如：`RFI-202609-001`）。
- 建立時依當前年月與流水號自動遞增產出。

## 5.2 六階狀態生命週期 (`RFIStatus`)

```
[ 草稿 Draft ]
      ↓
[ 已提交 Submitted ] ← 提出問題、指派被詢問對象
      ↓
[ 審查/會辦中 In Review ] ← 會同各方討論、提出答覆
      ↓
[ 已答覆 Answered ] ← PM/Admin 核定官方答覆
      ↓
┌─────┴─────┐
↓           ↓
[ 已結案 Closed ]   [ 駁回/補件 Rejected ]
```

## 5.3 官方正式答覆確認 (Official Response Flag)
- 一般留言僅為討論過程。
- 唯有具備 PM 或 ADMIN 權限之使用者，可將特定回覆標記為「官方正式答覆 (`isOfficialResponse = true`)」並寫入 `rfi.officialAnswer`。
- 官方答覆於前端以金黃色徽章醒目標示。

## 5.4 一鍵轉化為看板卡片 (RFI to Task)
- 當 RFI 獲得官方解答後，PM/ADMIN 可點擊「轉化為任務卡片」。
- 系統自動以 RFI 標題與解答內容建立看板任務，並將新任務與該 RFI 自動雙向綁定。
