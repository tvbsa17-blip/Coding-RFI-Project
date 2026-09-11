import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarRange,
  HelpCircle,
  FileCheck,
  History,
  Plus,
  Bell,
  CheckCheck,
  ChevronDown,
  RotateCcw,
  AlertCircle,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    users,
    setCurrentUser,
    activeTab,
    setActiveTab,
    setIsCreateTaskOpen,
    setIsCreateRFIOpen,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSelectedTaskId,
    setSelectedRFIId,
    tasks,
    rfis,
    canEditBoard,
    resetToDefaults,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            ADMIN
          </span>
        );
      case Role.PM:
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            PM
          </span>
        );
      case Role.MEMBER:
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            MEMBER
          </span>
        );
      case Role.CLIENT:
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            CLIENT
          </span>
        );
    }
  };

  const getRoleDescription = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return '管理專案、使用者、全系統權限';
      case Role.PM:
        return '建立專案、分配卡片、建立/審核 RFI、自訂欄位';
      case Role.MEMBER:
        return '更新卡片狀態、回覆 RFI、上傳附件';
      case Role.CLIENT:
        return '僅能提出 RFI 與檢視特定看板 (受限檢視)';
    }
  };

  const userNotifications = notifications.filter(n => n.userId === currentUser.id);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              SCM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                  專案管理與 RFI 追蹤系統
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  SRS 規格合規
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 hidden md:block">
                看板工作流 • 時程甘特圖 • 資訊需求單 (RFI) 追蹤與審核
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {canEditBoard && (
              <button
                id="btn-create-task"
                onClick={() => setIsCreateTaskOpen(true)}
                className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors space-x-1.5 cursor-pointer"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>新增任務</span>
              </button>
            )}

            <button
              id="btn-create-rfi"
              onClick={() => setIsCreateRFIOpen(true)}
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-xs transition-colors space-x-1.5 cursor-pointer"
            >
              <HelpCircle size={15} strokeWidth={2} />
              <span>提出 RFI</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-notification-bell"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                aria-label="即時通知中心"
              >
                <Bell size={18} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg p-0 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center space-x-2 text-slate-800">
                      <Bell size={15} className="text-indigo-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        系統即時通知 ({userNotifications.length})
                      </span>
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
                      >
                        <CheckCheck size={13} />
                        <span>全部已讀</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {userNotifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        暫無任何通知訊息
                      </div>
                    ) : (
                      userNotifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.linkType === 'task' && notif.linkId) {
                              setSelectedTaskId(notif.linkId);
                              setActiveTab('kanban');
                            } else if (notif.linkType === 'rfi' && notif.linkId) {
                              setSelectedRFIId(notif.linkId);
                              setActiveTab('rfi');
                            }
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors flex items-start space-x-2.5 ${
                            !notif.isRead ? 'bg-indigo-50/40 font-medium' : ''
                          }`}
                        >
                          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-indigo-600' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900">{notif.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                            <span className="text-[11px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                id="btn-user-switcher"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{currentUser.role}</div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-0 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-bold text-slate-800">
                      切換角色驗證 (RBAC 模擬)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      即時切換身分驗證權限與介面限制 (SRS 3.1)
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left p-3 flex items-center space-x-3 transition-colors cursor-pointer ${
                          u.id === currentUser.id
                            ? 'bg-indigo-50/60 font-semibold'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-slate-900 truncate">{u.name}</p>
                            {getRoleBadge(u.role)}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{getRoleDescription(u.role)}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 p-2.5 bg-slate-50">
                    <button
                      onClick={() => {
                        resetToDefaults();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-900 rounded-lg border border-slate-200 flex items-center justify-center space-x-2 transition-colors shadow-xs"
                    >
                      <RotateCcw size={13} />
                      <span>重設回預設示範資料</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-100 mt-3 pt-2 overflow-x-auto">
          <button
            id="tab-kanban"
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'kanban'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard size={15} />
            <span>看板工作流</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${
              activeTab === 'kanban'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {tasks.length}
            </span>
          </button>

          <button
            id="tab-gantt"
            onClick={() => setActiveTab('gantt')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'gantt'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarRange size={15} />
            <span>甘特時程圖</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${
              activeTab === 'gantt'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {tasks.filter(t => t.startDate || t.dueDate).length}
            </span>
          </button>

          <button
            id="tab-rfi"
            onClick={() => setActiveTab('rfi')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'rfi'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HelpCircle size={15} />
            <span>需求單 (RFI)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${
              activeTab === 'rfi'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {rfis.length}
            </span>
          </button>

          <button
            id="tab-activity"
            onClick={() => setActiveTab('activity')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History size={15} />
            <span>活動歷程</span>
          </button>

          <button
            id="tab-spec"
            onClick={() => setActiveTab('spec')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'spec'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck size={15} />
            <span>規格檢驗 (SRS)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
