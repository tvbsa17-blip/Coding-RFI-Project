import React, { useState, useEffect } from 'react';
import {
  X,
  Tag as TagIcon,
  HelpCircle,
  MessageSquare,
  Send,
  AlertCircle,
  Check,
  Trash2,
  ExternalLink,
  Paperclip,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Priority, Task, Role } from '../types';
import { AttachmentUpload } from './AttachmentUpload';

interface TaskModalProps {
  taskId: string | null;
  onClose: () => void;
  isCreateMode?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose, isCreateMode = false }) => {
  const {
    tasks,
    columns,
    users,
    rfis,
    currentUser,
    canEditBoard,
    createTask,
    updateTask,
    deleteTask,
    project,
    comments,
    addComment,
    setSelectedRFIId,
    setActiveTab,
  } = useApp();

  const existingTask = taskId ? tasks.find(t => t.id === taskId) : null;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('');
  const [actualHours, setActualHours] = useState<number | ''>('');
  const [assigneeId, setAssigneeId] = useState('');
  const [coAssigneeIds, setCoAssigneeIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [rfiIds, setRfiIds] = useState<string[]>([]);

  // Comment input
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || '');
      setColumnId(existingTask.columnId);
      setPriority(existingTask.priority);
      setStartDate(existingTask.startDate || '');
      setDueDate(existingTask.dueDate || '');
      setEstimatedHours(existingTask.estimatedHours ?? '');
      setActualHours(existingTask.actualHours ?? '');
      setAssigneeId(existingTask.assigneeId || '');
      setCoAssigneeIds(existingTask.coAssigneeIds || []);
      setTags(existingTask.tags || []);
      setRfiIds(existingTask.rfiIds || []);
    } else {
      setTitle('');
      setDescription('');
      setColumnId(columns[0]?.id || '');
      setPriority(Priority.MEDIUM);
      setStartDate(new Date().toISOString().slice(0, 10));
      setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
      setEstimatedHours(16);
      setActualHours(0);
      setAssigneeId(currentUser.id);
      setCoAssigneeIds([]);
      setTags(['功能開發']);
      setRfiIds([]);
    }
  }, [existingTask, columns, currentUser]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const toggleCoAssignee = (userId: string) => {
    if (coAssigneeIds.includes(userId)) {
      setCoAssigneeIds(coAssigneeIds.filter(id => id !== userId));
    } else {
      setCoAssigneeIds([...coAssigneeIds, userId]);
    }
  };

  const toggleRfiLink = (rfiId: string) => {
    if (rfiIds.includes(rfiId)) {
      setRfiIds(rfiIds.filter(id => id !== rfiId));
    } else {
      setRfiIds([...rfiIds, rfiId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isCreateMode || !existingTask) {
      createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        columnId: columnId || columns[0].id,
        projectId: project.id,
        assigneeId: assigneeId || undefined,
        coAssigneeIds,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        estimatedHours: typeof estimatedHours === 'number' ? estimatedHours : undefined,
        actualHours: typeof actualHours === 'number' ? actualHours : 0,
        tags,
        attachmentIds: [],
        rfiIds,
      });
    } else {
      updateTask(existingTask.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        columnId,
        assigneeId: assigneeId || undefined,
        coAssigneeIds,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        estimatedHours: typeof estimatedHours === 'number' ? estimatedHours : undefined,
        actualHours: typeof actualHours === 'number' ? actualHours : undefined,
        tags,
        rfiIds,
      });
    }

    onClose();
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !existingTask) return;
    addComment(newComment.trim(), { taskId: existingTask.id }, false);
    setNewComment('');
  };

  const isReadOnly = !canEditBoard;
  const taskComments = existingTask ? comments.filter(c => c.taskId === existingTask.id) : [];

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {isCreateMode || !existingTask
                ? '新增任務卡片'
                : `任務詳情：${existingTask.title}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Read-only banner */}
          {isReadOnly && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center space-x-2">
              <AlertCircle size={15} className="shrink-0 text-amber-600" />
              <span>
                <strong>業主唯讀模式：</strong> 目前為客戶檢視權限，僅供查閱任務內容與 RFI 關聯。
              </span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              任務標題 *
            </label>
            <input
              type="text"
              required
              disabled={isReadOnly}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：系統架構重構與資料庫遷移..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 bg-white placeholder-slate-400 disabled:bg-slate-50"
            />
          </div>

          {/* Column & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                看板階段
              </label>
              <select
                disabled={isReadOnly}
                value={columnId}
                onChange={e => setColumnId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
              >
                {columns.map(col => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                優先等級
              </label>
              <select
                disabled={isReadOnly}
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
              >
                <option value={Priority.URGENT}>緊急 (Urgent)</option>
                <option value={Priority.HIGH}>高 (High)</option>
                <option value={Priority.MEDIUM}>中 (Medium)</option>
                <option value={Priority.LOW}>低 (Low)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              規格與執行描述
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="詳細說明施工/開發規範、預期產出、驗收標準..."
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 bg-white placeholder-slate-400 leading-relaxed disabled:bg-slate-50"
            />
          </div>

          {/* Assignees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                主辦人員
              </label>
              <select
                disabled={isReadOnly}
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
              >
                <option value="">-- 未指派 --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                協辦人員
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 border border-slate-200 rounded-lg min-h-[42px] bg-slate-50/50">
                {users
                  .filter(u => u.id !== assigneeId)
                  .map(u => {
                    const isSelected = coAssigneeIds.includes(u.id);
                    return (
                      <button
                        type="button"
                        key={u.id}
                        disabled={isReadOnly}
                        onClick={() => toggleCoAssignee(u.id)}
                        className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors flex items-center space-x-1 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{u.name.split(' ')[0]}</span>
                        {isSelected && <Check size={11} />}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Dates & Hours */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">開始日期</label>
              <input
                type="date"
                disabled={isReadOnly}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">截止日期</label>
              <input
                type="date"
                disabled={isReadOnly}
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">預估工時 (hr)</label>
              <input
                type="number"
                min="0"
                disabled={isReadOnly}
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="16"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">實際耗時 (hr)</label>
              <input
                type="number"
                min="0"
                disabled={isReadOnly}
                value={actualHours}
                onChange={e => setActualHours(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="12"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              自訂標籤
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1"
                >
                  <span>#{tag}</span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-slate-700 ml-1"
                    >
                      <X size={11} />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {!isReadOnly && (
              <div className="flex items-center space-x-2 max-w-xs">
                <input
                  type="text"
                  placeholder="輸入新標籤..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  新增
                </button>
              </div>
            )}
          </div>

          {/* RFI Associations */}
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
                <HelpCircle size={14} className="text-indigo-600" />
                <span>關聯資訊需求單 (Linked RFIs)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                勾選以綁定
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rfis.map(rfi => {
                const isLinked = rfiIds.includes(rfi.id);
                return (
                  <div
                    key={rfi.id}
                    onClick={() => !isReadOnly && toggleRfiLink(rfi.id)}
                    className={`p-2.5 border rounded-lg transition-all text-left cursor-pointer flex items-start justify-between ${
                      isLinked
                        ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-xs font-bold ${isLinked ? 'text-indigo-700' : 'text-slate-800'}`}>
                          {rfi.rfiNumber}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          isLinked ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {rfi.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 truncate mt-1">{rfi.subject}</p>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedRFIId(rfi.id);
                          setActiveTab('rfi');
                          onClose();
                        }}
                        title="開啟此 RFI 詳細頁面"
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <ExternalLink size={13} />
                      </button>
                      <input
                        type="checkbox"
                        checked={isLinked}
                        readOnly
                        className="accent-indigo-600 rounded"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attachments & Clipboard Paste */}
          {existingTask && (
            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-xs font-semibold text-slate-800 mb-2 flex items-center space-x-1.5">
                <Paperclip size={14} className="text-indigo-600" />
                <span>附件與截圖 (支援剪貼簿直接 Ctrl+V 貼圖)</span>
              </h3>
              <AttachmentUpload
                entityType="task"
                entityId={existingTask.id}
                attachmentIds={existingTask.attachmentIds || []}
              />
            </div>
          )}

          {/* Comments Discussion Section */}
          {existingTask && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
                <MessageSquare size={14} className="text-indigo-600" />
                <span>任務留言討論 ({taskComments.length})</span>
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {taskComments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">尚無任何討論留言</p>
                ) : (
                  taskComments.map(c => {
                    const author = users.find(u => u.id === c.userId);
                    return (
                      <div key={c.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-1.5">
                            <img
                              src={author?.avatarUrl}
                              alt={author?.name}
                              className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <span className="font-semibold text-slate-800">{author?.name}</span>
                            <span className="text-[10px] text-slate-400">({author?.role})</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed pl-5">{c.content}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add comment box */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="輸入留言內容..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePostComment(e);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={handlePostComment}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Send size={12} />
                  <span>傳送</span>
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          {existingTask && canEditBoard ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`確定要刪除卡片「${existingTask.title}」嗎？`)) {
                  deleteTask(existingTask.id);
                  onClose();
                }
              }}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>刪除卡片</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {isReadOnly ? '關閉' : '取消'}
            </button>
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
              >
                {isCreateMode || !existingTask ? '建立卡片' : '儲存變更'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
