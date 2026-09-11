import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Kanban,
  Paperclip,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RFI, RFIStatus, Priority } from '../types';

export const RFITracker: React.FC = () => {
  const {
    rfis,
    users,
    tasks,
    currentUser,
    setSelectedRFIId,
    setIsCreateRFIOpen,
    setSelectedTaskId,
    setActiveTab,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [respondentFilter, setRespondentFilter] = useState<string>('ALL');

  const statusTabs = [
    { key: 'ALL', label: '全部', count: rfis.length },
    { key: RFIStatus.SUBMITTED, label: '已提交', count: rfis.filter(r => r.status === RFIStatus.SUBMITTED).length },
    { key: RFIStatus.IN_REVIEW, label: '會辦中', count: rfis.filter(r => r.status === RFIStatus.IN_REVIEW).length },
    { key: RFIStatus.ANSWERED, label: '已答覆', count: rfis.filter(r => r.status === RFIStatus.ANSWERED).length },
    { key: RFIStatus.CLOSED, label: '已結案', count: rfis.filter(r => r.status === RFIStatus.CLOSED).length },
    { key: RFIStatus.DRAFT, label: '草稿', count: rfis.filter(r => r.status === RFIStatus.DRAFT).length },
    { key: RFIStatus.REJECTED, label: '需補件', count: rfis.filter(r => r.status === RFIStatus.REJECTED).length },
  ];

  const getStatusBadge = (status: RFIStatus) => {
    switch (status) {
      case RFIStatus.DRAFT:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">草稿</span>;
      case RFIStatus.SUBMITTED:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-100 text-sky-700">已提交</span>;
      case RFIStatus.IN_REVIEW:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">會辦中</span>;
      case RFIStatus.ANSWERED:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">已答覆</span>;
      case RFIStatus.CLOSED:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-500">已結案</span>;
      case RFIStatus.REJECTED:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">需補件</span>;
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return <span className="text-[11px] font-semibold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">緊急</span>;
      case Priority.HIGH:
        return <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">高</span>;
      case Priority.MEDIUM:
        return <span className="text-[11px] font-medium bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">中</span>;
      case Priority.LOW:
        return <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">低</span>;
    }
  };

  const filteredRFIs = rfis.filter(rfi => {
    const matchesStatus = statusFilter === 'ALL' || rfi.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      rfi.rfiNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfi.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfi.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rfi.officialAnswer && rfi.officialAnswer.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPriority = priorityFilter === 'ALL' || rfi.priority === priorityFilter;
    const matchesRespondent = respondentFilter === 'ALL' || rfi.respondentId === respondentFilter;

    return matchesStatus && matchesSearch && matchesPriority && matchesRespondent;
  });

  return (
    <div className="flex flex-col flex-1 h-full max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Intro & Overview */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-2">
          <HelpCircle size={15} />
          <span>文件控制與規格釐清中心</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          工程與專案規格釐清中心 (RFI)
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          專為解決專案中「資訊不明或釐清規格」的需求設計。支援單號自動編碼、跨角色會辦答覆、官方核定確認 (Official Response Flag)，並可一鍵直接將答覆轉化為看板實作卡片。
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-xs'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                statusFilter === tab.key ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Action & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋 RFI 單號、主旨、內容..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Priority & Respondent Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">全部優先級</option>
            <option value={Priority.URGENT}>緊急</option>
            <option value={Priority.HIGH}>高</option>
            <option value={Priority.MEDIUM}>中</option>
            <option value={Priority.LOW}>低</option>
          </select>

          <select
            value={respondentFilter}
            onChange={e => setRespondentFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">全部回覆人員</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCreateRFIOpen(true)}
            className="inline-flex items-center space-x-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer ml-auto"
          >
            <Plus size={14} />
            <span>建立 RFI</span>
          </button>
        </div>
      </div>

      {/* RFI Cards List */}
      <div className="space-y-3">
        {filteredRFIs.length === 0 ? (
          <div className="bg-white p-12 text-center border border-dashed border-slate-300 rounded-xl">
            <HelpCircle size={32} className="text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">查無符合條件的 RFI 紀錄</p>
            <p className="text-xs text-slate-500 mt-1">請嘗試變更狀態標籤或點擊上方「建立 RFI」新增需求單。</p>
          </div>
        ) : (
          filteredRFIs.map(rfi => {
            const creator = users.find(u => u.id === rfi.creatorId);
            const respondent = users.find(u => u.id === rfi.respondentId);
            const linkedTask = rfi.taskId ? tasks.find(t => t.id === rfi.taskId) : null;
            const isOverdue = rfi.dueDate ? new Date(rfi.dueDate) < new Date() && rfi.status !== RFIStatus.CLOSED : false;

            return (
              <div
                key={rfi.id}
                id={`rfi-item-${rfi.id}`}
                onClick={() => setSelectedRFIId(rfi.id)}
                className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                {/* Left info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {rfi.rfiNumber}
                    </span>
                    {getStatusBadge(rfi.status)}
                    {getPriorityBadge(rfi.priority)}

                    {rfi.officialAnswer && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} />
                        <span>官方確認答覆</span>
                      </span>
                    )}

                    {linkedTask && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTaskId(linkedTask.id);
                          setActiveTab('kanban');
                        }}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        <Kanban size={11} />
                        <span>已連結任務</span>
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {rfi.subject}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {rfi.question}
                  </p>

                  {/* Official Answer Preview */}
                  {rfi.officialAnswer && (
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 line-clamp-1">
                      <strong className="font-semibold text-slate-800 text-[11px] mr-1">結論答覆：</strong>{' '}
                      {rfi.officialAnswer}
                    </div>
                  )}
                </div>

                {/* Right metadata */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 gap-2 shrink-0">
                  <div className="flex items-center space-x-2 text-xs">
                    {creator && (
                      <div className="flex items-center space-x-1.5" title={`提問者: ${creator.name}`}>
                        <img
                          src={creator.avatarUrl}
                          alt={creator.name}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="text-slate-700 font-medium">{creator.name.split(' ')[0]}</span>
                      </div>
                    )}
                    <ArrowRight size={12} className="text-slate-300" />
                    {respondent ? (
                      <div className="flex items-center space-x-1.5" title={`指定回覆對象: ${respondent.name}`}>
                        <img
                          src={respondent.avatarUrl}
                          alt={respondent.name}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="font-medium text-slate-900">{respondent.name.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">全部人員</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    {rfi.dueDate && (
                      <span
                        className={`flex items-center space-x-1 ${
                          isOverdue ? 'text-rose-600 font-semibold' : ''
                        }`}
                      >
                        <Calendar size={12} />
                        <span>截止: {rfi.dueDate}</span>
                        {isOverdue && <AlertCircle size={12} />}
                      </span>
                    )}

                    {rfi.attachmentIds && rfi.attachmentIds.length > 0 && (
                      <span className="flex items-center space-x-1 text-slate-400">
                        <Paperclip size={12} />
                        <span>{rfi.attachmentIds.length} 附件</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
