import React, { useState } from 'react';
import {
  Plus,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskCard } from './TaskCard';
import { Priority, Role } from '../types';

export const KanbanBoard: React.FC = () => {
  const {
    columns,
    tasks,
    moveTask,
    canMoveTask,
    canManageColumns,
    canEditBoard,
    currentUser,
    users,
    addColumn,
    updateColumn,
    deleteColumn,
    setIsCreateTaskOpen,
    setActiveTab,
  } = useApp();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [rfiOnlyFilter, setRfiOnlyFilter] = useState(false);

  // Drag states
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Column management states
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingColTitle, setEditingColTitle] = useState('');

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (!canMoveTask) return;
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    if (!canMoveTask) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (colId: string) => {
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    if (!canMoveTask) return;
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTask(taskId, colId);
    }
    setDraggedTaskId(null);
    setDragOverColId(null);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      !searchTerm ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;

    const matchesAssignee =
      assigneeFilter === 'ALL' ||
      task.assigneeId === assigneeFilter ||
      task.coAssigneeIds?.includes(assigneeFilter);

    const matchesRFI = !rfiOnlyFilter || (task.rfiIds && task.rfiIds.length > 0);

    return matchesSearch && matchesPriority && matchesAssignee && matchesRFI;
  });

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;
    addColumn(newColTitle.trim());
    setNewColTitle('');
    setIsAddingCol(false);
  };

  const handleSaveEditColumn = (colId: string) => {
    if (!editingColTitle.trim()) return;
    updateColumn(colId, editingColTitle.trim());
    setEditingColId(null);
  };

  return (
    <div className="flex flex-col flex-1 h-full max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋卡片、描述、標籤..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 bg-white placeholder-slate-400 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="ALL">全部優先級 (All)</option>
            <option value={Priority.URGENT}>緊急 (Urgent)</option>
            <option value={Priority.HIGH}>高 (High)</option>
            <option value={Priority.MEDIUM}>中 (Medium)</option>
            <option value={Priority.LOW}>低 (Low)</option>
          </select>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="ALL">所有負責人</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          {/* Linked RFI Filter button */}
          <button
            onClick={() => setRfiOnlyFilter(!rfiOnlyFilter)}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 text-xs rounded-lg font-medium border transition-colors cursor-pointer ${
              rfiOnlyFilter
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <HelpCircle size={14} />
            <span>僅限關聯 RFI</span>
          </button>

          {/* New Task Button */}
          {canEditBoard && (
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>新增任務</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Notice for Client */}
      {currentUser.role === Role.CLIENT && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2.5">
            <AlertCircle size={17} className="text-amber-600 shrink-0" />
            <span>
              <strong>業主檢視權限 (Client Mode)：</strong> 您可即時查看本專案看板各階段進度卡片；如對任何規格或實作有疑問，可直接點擊「提出 RFI」需求單進行正式提問。
            </span>
          </div>
          <button
            onClick={() => setActiveTab('rfi')}
            className="px-3 py-1.5 bg-amber-600 text-white font-medium text-xs rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap ml-3 cursor-pointer shadow-xs"
          >
            檢視 RFI 清單
          </button>
        </div>
      )}

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start flex-1 min-h-[560px]">
        {columns
          .sort((a, b) => a.order - b.order)
          .map(col => {
            const colTasks = filteredTasks.filter(t => t.columnId === col.id);
            const isOver = dragOverColId === col.id;

            return (
              <div
                key={col.id}
                id={`column-${col.id}`}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={() => handleDragLeave(col.id)}
                onDrop={e => handleDrop(e, col.id)}
                className={`flex flex-col bg-slate-100/70 p-3 rounded-xl border transition-all min-h-[500px] ${
                  isOver
                    ? 'border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 px-1">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {editingColId === col.id ? (
                      <div className="flex items-center space-x-1 flex-1">
                        <input
                          type="text"
                          value={editingColTitle}
                          onChange={e => setEditingColTitle(e.target.value)}
                          className="w-full text-xs font-semibold px-2 py-1 border border-indigo-400 rounded focus:outline-none bg-white text-slate-800"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEditColumn(col.id)}
                          className="p-1 hover:bg-emerald-100 text-emerald-700 rounded"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => setEditingColId(null)}
                          className="p-1 hover:bg-slate-200 text-slate-600 rounded"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-semibold text-xs text-slate-800 tracking-tight">
                          {col.title}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-200/80 text-slate-700">
                          {colTasks.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Column Admin Actions */}
                  {canManageColumns && editingColId !== col.id && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingColId(col.id);
                          setEditingColTitle(col.title);
                        }}
                        title="編輯欄位名稱"
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (colTasks.length > 0) {
                            alert('該欄位尚有任務卡片，請先移出卡片後再行刪除！');
                            return;
                          }
                          if (window.confirm(`確定要刪除欄位「${col.title}」嗎？`)) {
                            deleteColumn(col.id);
                          }
                        }}
                        title="刪除空白欄位"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Task Cards List */}
                <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                  {colTasks.length === 0 ? (
                    <div className="h-32 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xs text-slate-400">
                      尚未排入任務卡片
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />
                    ))
                  )}
                </div>

                {/* Quick Add Task to this column */}
                {canEditBoard && (
                  <button
                    onClick={() => setIsCreateTaskOpen(true)}
                    className="mt-2.5 w-full py-1.5 border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-white text-xs text-slate-600 hover:text-indigo-600 font-medium rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>新增卡片</span>
                  </button>
                )}
              </div>
            );
          })}

        {/* Add New Column */}
        {canManageColumns && (
          <div className="bg-slate-100/50 p-4 border border-dashed border-slate-300 rounded-xl flex flex-col justify-start">
            {isAddingCol ? (
              <form onSubmit={handleCreateColumn} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="輸入新欄位名稱..."
                  value={newColTitle}
                  onChange={e => setNewColTitle(e.target.value)}
                  autoFocus
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-800 placeholder-slate-400"
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                  >
                    建立欄位
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCol(false);
                      setNewColTitle('');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingCol(true)}
                className="w-full py-4 border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-white hover:text-indigo-600 text-xs font-medium text-slate-500 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Plus size={15} />
                <span>新增看板自訂欄位</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
