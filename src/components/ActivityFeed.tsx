import React, { useState } from 'react';
import {
  History,
  Kanban,
  HelpCircle,
  Columns,
  Search,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ActivityFeed: React.FC = () => {
  const { activityLogs, users, setSelectedTaskId, setSelectedRFIId, setActiveTab } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = activityLogs.filter(log => {
    const matchesType = filterType === 'ALL' || log.entityType === filterType;
    const matchesSearch =
      !searchTerm ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesSearch;
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'TASK':
        return <Kanban size={13} className="text-indigo-600" />;
      case 'RFI':
        return <HelpCircle size={13} className="text-sky-600" />;
      case 'COLUMN':
        return <Columns size={13} className="text-amber-600" />;
      default:
        return <History size={13} className="text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-1">
            <History size={15} />
            <span>系統審計紀錄</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            專案活動歷程與審計日誌
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            完整記錄看板卡片、RFI 需求單與系統設定之異動軌跡 (Who, What, When)。
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">全部類別</option>
            <option value="TASK">看板任務 (Task)</option>
            <option value="RFI">需求單 (RFI)</option>
            <option value="COLUMN">看板欄位 (Column)</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="搜尋活動動作、執行人員或標題..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
        />
      </div>

      {/* Timeline List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            查無符合條件之活動日誌紀錄
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filteredLogs.map(log => {
              const actor = users.find(u => u.id === log.userId);

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 top-2 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />

                  {/* Log Content Card */}
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-2">
                        {actor && (
                          <img
                            src={actor.avatarUrl}
                            alt={actor.name}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                          />
                        )}
                        <span className="text-xs font-semibold text-slate-800">{actor?.name || '系統'}</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 uppercase">
                          {actor?.role || 'SYSTEM'}
                        </span>
                        <span className="text-xs text-slate-500">{log.action}</span>
                      </div>

                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Clock size={11} />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-200/60">
                      <button
                        onClick={() => {
                          if (log.entityType === 'TASK') {
                            setSelectedTaskId(log.entityId);
                            setActiveTab('kanban');
                          } else if (log.entityType === 'RFI') {
                            setSelectedRFIId(log.entityId);
                            setActiveTab('rfi');
                          }
                        }}
                        className="text-xs font-medium text-slate-800 hover:text-indigo-600 flex items-center space-x-1.5 text-left cursor-pointer transition-colors"
                      >
                        {getEntityIcon(log.entityType)}
                        <span className="font-semibold">{log.entityTitle}</span>
                      </button>

                      {log.details && (
                        <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {log.details}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
