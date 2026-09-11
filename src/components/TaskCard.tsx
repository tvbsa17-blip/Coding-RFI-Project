import React from 'react';
import {
  Calendar,
  Clock,
  Paperclip,
  AlertCircle,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { Task, Priority } from '../types';
import { useApp } from '../context/AppContext';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  const {
    users,
    rfis,
    setSelectedTaskId,
    setSelectedRFIId,
    setActiveTab,
    canMoveTask,
    canEditBoard,
    deleteTask,
  } = useApp();

  const assignee = users.find(u => u.id === task.assigneeId);
  const coAssignees = users.filter(u => task.coAssigneeIds?.includes(u.id));

  // Linked RFIs
  const linkedRFIs = rfis.filter(r => task.rfiIds?.includes(r.id));

  // Check if overdue
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return (
          <span className="bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 text-[11px] font-semibold rounded-md">
            緊急
          </span>
        );
      case Priority.HIGH:
        return (
          <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold rounded-md">
            高
          </span>
        );
      case Priority.MEDIUM:
        return (
          <span className="bg-sky-100 text-sky-700 border border-sky-200 px-2 py-0.5 text-[11px] font-medium rounded-md">
            中
          </span>
        );
      case Priority.LOW:
        return (
          <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[11px] font-medium rounded-md">
            低
          </span>
        );
    }
  };

  return (
    <div
      id={`task-card-${task.id}`}
      draggable={canMoveTask}
      onDragStart={e => onDragStart(e, task.id)}
      onClick={() => setSelectedTaskId(task.id)}
      className={`group bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer select-none relative ${
        canMoveTask ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      }`}
    >
      {/* Priority & Quick Actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>{getPriorityBadge(task.priority)}</div>

        <div className="flex items-center space-x-1.5">
          {task.estimatedHours && (
            <span className="inline-flex items-center text-[11px] text-slate-500 space-x-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
              <Clock size={12} />
              <span>{task.estimatedHours}h</span>
            </span>
          )}

          {canEditBoard && (
            <button
              onClick={e => {
                e.stopPropagation();
                if (window.confirm(`確定要刪除任務「${task.title}」嗎？`)) {
                  deleteTask(task.id);
                }
              }}
              title="刪除卡片"
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 mb-1 leading-snug group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h3>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-2.5 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Linked RFIs */}
      {linkedRFIs.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {linkedRFIs.map(rfi => (
            <button
              key={rfi.id}
              onClick={e => {
                e.stopPropagation();
                setSelectedRFIId(rfi.id);
                setActiveTab('rfi');
              }}
              title={`關聯需求單: ${rfi.subject}`}
              className="inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors"
            >
              <HelpCircle size={11} />
              <span>{rfi.rfiNumber}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {task.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 text-slate-600 border border-slate-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Dates, Attachments & Assignee avatars */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2">
        {/* Dates & Attachments */}
        <div className="flex items-center space-x-2.5 text-xs text-slate-500">
          {task.dueDate && (
            <span
              className={`flex items-center space-x-1 text-[11px] ${
                isOverdue
                  ? 'text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded'
                  : 'text-slate-500'
              }`}
              title={`截止日期: ${task.dueDate}`}
            >
              <Calendar size={12} />
              <span>{task.dueDate.slice(5)}</span>
              {isOverdue && <AlertCircle size={12} className="text-rose-600" />}
            </span>
          )}

          {task.attachmentIds && task.attachmentIds.length > 0 && (
            <span className="flex items-center space-x-0.5 text-slate-400">
              <Paperclip size={12} />
              <span className="text-[11px]">{task.attachmentIds.length}</span>
            </span>
          )}
        </div>

        {/* Assignees */}
        <div className="flex items-center -space-x-1.5">
          {assignee && (
            <img
              src={assignee.avatarUrl}
              alt={assignee.name}
              title={`主辦人: ${assignee.name}`}
              className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
            />
          )}
          {coAssignees.map(co => (
            <img
              key={co.id}
              src={co.avatarUrl}
              alt={co.name}
              title={`協辦人: ${co.name}`}
              className="w-5 h-5 rounded-full object-cover ring-2 ring-white opacity-90"
            />
          ))}
          {!assignee && coAssignees.length === 0 && (
            <span className="text-[11px] text-slate-400">未指派</span>
          )}
        </div>
      </div>
    </div>
  );
};
