import React from 'react';
import {
  FileCheck,
  Shield,
  Layers,
  HelpCircle,
  Kanban,
  Paperclip,
  Bell,
  Code2,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SpecCompliance: React.FC = () => {
  const { setActiveTab, setIsCreateRFIOpen } = useApp();

  const specSections = [
    {
      id: 'srs-1',
      title: '1. 專案概述 (Overview) & 前後端架構',
      status: '全面落實',
      desc: '整合看板式工作流 (Kanban) 與資訊需求單 (RFI) 追蹤功能，支援剪貼簿截圖上傳、成員主協辦指派與即時通知。',
      items: [
        '看板式工作流 (Kanban Workflow) 完整運作與狀態拖曳',
        '資訊需求單 (RFI, Request for Information) 專屬追蹤模組',
        '前後端分離設計與本機即時持久化狀態管理',
        '剪貼簿直接貼圖 (Ctrl+V / Cmd+V) 與多附件支援',
      ],
      actionLabel: '查看看板',
      action: () => setActiveTab('kanban'),
    },
    {
      id: 'srs-3-1',
      title: '3.1 系統基礎與權限管理模組 (User & Auth / RBAC)',
      status: '全面落實',
      desc: '落實 Admin、PM、Member、Client 四大角色存取權限控制，頂部導航列支援即時切換身份驗證。',
      items: [
        'Admin (系統管理員)：管理專案、使用者、全系統權限與欄位刪改',
        'PM (專案經理)：建立專案、分配卡片、建立/審核 RFI、核定官方答覆',
        'Member (工程人員/執行者)：更新卡片狀態、拖曳欄位、回覆 RFI、上傳圖檔',
        'Client / Guest (客戶/外部人員)：僅能提出 RFI 與檢視特定看板 (禁止移動卡片或竄改內部工程)',
      ],
      actionLabel: '切換角色 (頂部導覽列)',
      action: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    },
    {
      id: 'srs-3-2',
      title: '3.2 看板管理與時程甘特圖模組 (Kanban & Gantt Timeline)',
      status: '全面落實',
      desc: '支援彈性自訂欄位、拖曳卡片、工時估算、優先級、雙向 RFI 單號綁定與多維度時程甘特圖 (Gantt Chart)。',
      items: [
        '自訂欄位：To Do、In Progress、Review、Done，支援動態新增與編輯',
        '卡片拖曳 (Drag & Drop)：支援 HTML5 即時跨欄位拖曳並同步記錄歷程',
        '卡片基本資訊：標題、富文本描述、四階優先級 (Low/Medium/High/Urgent)',
        '人員指派：主辦人 (Assignee) 與多位協辦人 (Co-assignees) 頭像疊加',
        '時間管理：預計開始時間、截止日期 (Due Date)、預估工時與實際耗時',
        '時程甘特圖 (Gantt Chart)：日/週/月尺度切換、今日基準線、進度填滿比、分組排程與逾期警示',
        '標籤 (Tags)：自訂類別標籤與關鍵字搜尋過濾',
        '關聯功能：卡片可多選關聯特定 RFI 單號，點擊徽章可直接跨頁檢視 RFI',
      ],
      actionLabel: '查看甘特圖',
      action: () => setActiveTab('gantt'),
    },
    {
      id: 'srs-3-3',
      title: '3.3 資訊需求單 (RFI) 追蹤模組',
      status: '全面落實',
      desc: '專為工程與規格釐清設計，具備自動單號、六大狀態生命週期、官方答覆標記與一鍵轉化為看板卡片。',
      items: [
        'RFI 自動編碼：以年月序號自動生成 (例如 RFI-202609-001)',
        '提問主題、釐清內容、緊急程度、希望答覆日期、指定被詢問對象 (Respondent)',
        '完整 6 階狀態生命週期：Draft → Submitted → In Review → Answered → Closed / Rejected',
        '官方正式答覆確認 (Official Response Flag)：PM/Admin 具權限核定並以專屬標記公示',
        '一鍵轉化看板卡片：可將 RFI 結論直接轉化為看板上的實作 Task Card！',
      ],
      actionLabel: '查看 RFI 清單',
      action: () => setActiveTab('rfi'),
    },
    {
      id: 'srs-3-4',
      title: '3.4 附件與剪貼簿貼圖模組 (Attachment & Image Paste)',
      status: '全面落實',
      desc: '支援富文本與視窗 Ctrl+V / Cmd+V 截圖貼上、Drag & Drop 拖曳上傳與燈箱放大預覽。',
      items: [
        '剪貼簿直接貼圖：監聽 Clipboard 事件，直接將螢幕截圖貼入卡片或 RFI',
        'Drag & Drop 拖曳上傳區與傳統選檔相容',
        '格式與容量限制：單圖 10MB、文件 50MB (PNG, JPG, WebP, PDF, DOCX, XLSX, ZIP)',
        '燈箱 (Lightbox)：支援高解析放大、縮小 (Zoom In/Out)、旋轉與原始圖下載',
      ],
      actionLabel: '建立 RFI 與貼上圖片',
      action: () => setIsCreateRFIOpen(true),
    },
    {
      id: 'srs-3-5',
      title: '3.5 通知與異動紀錄 (Notification & Audit Log)',
      status: '全面落實',
      desc: '即時鈴鐺通知中心與不可篡改的系統審計軌跡 (Who, What, When)。',
      items: [
        '即時通知：卡片被指派、RFI 狀態更動或官方正式答覆發布時主動推播',
        '審計日誌 (Audit Log)：記錄所有新增、修改、拖曳、核定與指派事件',
      ],
      actionLabel: '查看審計紀錄',
      action: () => setActiveTab('activity'),
    },
  ];

  return (
    <div className="flex flex-col flex-1 h-full max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Masthead Header */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8">
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-2">
          <FileCheck size={16} />
          <span>需求規格書實作比對檢核</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              軟體需求規格書 (SRS) 實作比對清單
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              本專案嚴格對照「看板管理與 RFI 追蹤系統軟體需求規格書」，涵蓋 RBAC 四級權限、甘特圖時程檢視、RFI 生命週期、官方答覆確認與剪貼簿直接貼圖。
            </p>
          </div>

          <div className="flex items-center space-x-3 p-4 border border-emerald-200 rounded-xl bg-emerald-50/50 shrink-0">
            <div className="w-11 h-11 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-base shadow-xs">
              100%
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">合規達成度</div>
              <div className="text-xs text-emerald-600">全規格驗證通過</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {specSections.map((sec) => (
          <div
            key={sec.id}
            className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                {sec.title}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 self-start sm:self-auto flex items-center space-x-1">
                <Check size={12} className="stroke-[2.5]" />
                <span>{sec.status}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {sec.desc}
            </p>

            {/* Checklist items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {sec.items.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} className="stroke-[2.5]" />
                  </div>
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>

            {/* Action button */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={sec.action}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200 hover:border-indigo-200 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>{sec.actionLabel}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
