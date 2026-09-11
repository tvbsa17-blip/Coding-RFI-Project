/**
 * SRS 規範定義資料模型 (Data Schema Types)
 * 參照專案管理與 RFI 追蹤系統規格書
 */

export enum Role {
  ADMIN = 'ADMIN',     // 系統管理員: 管理專案、使用者、全系統權限
  PM = 'PM',           // 專案經理: 建立專案、分配卡片、建立/審核 RFI
  MEMBER = 'MEMBER',   // 工程人員/執行者: 更新卡片狀態、回覆 RFI、上傳附件
  CLIENT = 'CLIENT',   // 客戶/外部人員: 僅能提出 RFI 與檢視特定看板
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum RFIStatus {
  DRAFT = 'DRAFT',             // 草稿
  SUBMITTED = 'SUBMITTED',     // 已提交/待解答
  IN_REVIEW = 'IN_REVIEW',     // 處理中/會辦中
  ANSWERED = 'ANSWERED',       // 已答覆/待確認
  CLOSED = 'CLOSED',           // 已結案
  REJECTED = 'REJECTED',       // 駁回/需補件
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  department?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  projectId: string;
  color?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // in bytes
  mimeType: string;
  taskId?: string;
  rfiId?: string;
  uploadedById: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  rfiId?: string;
  taskId?: string;
  isOfficialResponse?: boolean; // 官方正式答覆確認 (Official Response Flag)
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  columnId: string;
  projectId: string;
  assigneeId?: string;
  coAssigneeIds?: string[];
  tags: string[];
  attachmentIds: string[];
  rfiIds: string[]; // 一張卡片可關聯多個 RFI 單號
  createdAt: string;
  updatedAt: string;
}

export interface RFI {
  id: string;
  rfiNumber: string; // e.g., RFI-202609-001 (自動生成)
  subject: string;   // 提問主題
  question: string;  // 釐清內容
  officialAnswer?: string; // 官方正式答覆
  status: RFIStatus; // 狀態生命週期
  priority: Priority;
  creatorId: string; // 提問者
  respondentId?: string; // 指定被詢問對象 (Respondent / Reviewer)
  projectId: string;
  taskId?: string;   // 關聯的看板卡片 ID (若有)
  dueDate?: string;  // 希望答覆日期
  attachmentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ASSIGNED' | 'RFI_ANSWER' | 'OVERDUE' | 'STATUS_CHANGE';
  isRead: boolean;
  linkType?: 'task' | 'rfi';
  linkId?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  entityType: 'TASK' | 'RFI' | 'COLUMN';
  entityId: string;
  entityTitle: string;
  action: string;
  userId: string;
  details?: string;
  createdAt: string;
}
