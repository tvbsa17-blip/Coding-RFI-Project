# 開發規劃專區 (doc/dev/)

本目錄存放**所有新功能開發前**的討論與實施計畫書。

---

## 📌 開發工作流程原則 (Workflow Rule)

依據專案團隊與代理人 (Agents) 開發規範：

1. **先討論與規劃 (Pre-Development)**：
   - 任何新功能、介面改版或核心邏輯調整，**嚴禁未經討論直接修改程式碼**。
   - 必須先與使用者/團隊充分討論，釐清需求後撰寫實施計畫。
2. **命名規範 (Naming Convention)**：
   - 檔案命名一律使用：`plan_<功能名稱>.md`
   - 例如：
     - `plan_rfi_export_pdf.md`
     - `plan_multi_project_switch.md`
     - `plan_custom_kanban_color.md`
3. **對齊與確認 (Alignment & Approval)**：
   - 提交計畫後等待使用者核准確認，作為後續執行的不可變合約。
4. **開發中參照 (Reference during Dev)**：
   - 開發過程嚴格參照此計畫書步驟逐項落實，避免範圍蔓延 (Scope Creep)。
5. **完成後寫回規格 (Post-Development Spec Sync)**：
   - 功能實作完成且測試無誤後，**必須將最新功能規格與架構寫回 `doc/spec/` 對應章節**。

---

## 📝 實施計畫書標準範本 (Template)

每次建立 `plan_<功能名稱>.md` 時，請依循以下標準結構撰寫：

```markdown
# [計畫名稱] plan_<功能名稱>

- **建立日期**：YYYY-MM-DD
- **負責人員 / Agent**：
- **當前狀態**：草稿 (Draft) / 討論中 (Under Discussion) / 已核准 (Approved) / 實作中 (In Progress) / 已完成 (Done)

---

## 1. 需求背景與目標 (Background & Objectives)
- 解決什麼問題？使用者故事 (User Stories)？
- 預期達成的效益？

## 2. 影響範圍評估 (Impact Scope)
- 涉及的資料結構 (`types.ts`)：
- 涉及的元件 (`src/components/`)：
- 涉及的狀態與邏輯 (`AppContext.tsx`)：

## 3. 詳細技術實施步驟 (Implementation Steps)
1. 步驟一：
2. 步驟二：
3. 步驟三：

## 4. 驗證與測試計畫 (Verification Plan)
- [ ] 本地功能手動測試項目
- [ ] 建置與型別檢查 (`npm run build`, `npm run lint`)
- [ ] 權限矩陣驗證 (Admin / PM / Member / Client)

## 5. 完成後寫回規格規劃 (Spec Update Plan)
- 預計更新 `doc/spec/` 中的章節檔案：
```
