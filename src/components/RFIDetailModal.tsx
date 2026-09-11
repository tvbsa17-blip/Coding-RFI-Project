import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Send,
  Kanban,
  Paperclip,
  Check,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Edit,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RFI, RFIStatus, Priority, Role } from '../types';
import { AttachmentUpload } from './AttachmentUpload';

interface RFIDetailModalProps {
  rfiId: string;
  onClose: () => void;
}

export const RFIDetailModal: React.FC<RFIDetailModalProps> = ({ rfiId, onClose }) => {
  const {
    rfis,
    users,
    tasks,
    currentUser,
    updateRFIStatus,
    updateRFI,
    convertRFIToTask,
    comments,
    addComment,
    canReviewRFI,
    setSelectedTaskId,
    setActiveTab,
  } = useApp();

  const rfi = rfis.find(r => r.id === rfiId);

  // Comment & Official Answer State
  const [commentText, setCommentText] = useState('');
  const [isOfficialCheck, setIsOfficialCheck] = useState(false);
  const [officialInputText, setOfficialInputText] = useState('');
  const [isEditingOfficial, setIsEditingOfficial] = useState(false);

  if (!rfi) return null;

  const creator = users.find(u => u.id === rfi.creatorId);
  const respondent = users.find(u => u.id === rfi.respondentId);
  const linkedTask = rfi.taskId ? tasks.find(t => t.id === rfi.taskId) : null;
  const rfiComments = comments.filter(c => c.rfiId === rfi.id);

  // Lifecycle steps in order
  const lifecycleSteps = [
    { key: RFIStatus.DRAFT, label: '01 // DRAFT' },
    { key: RFIStatus.SUBMITTED, label: '02 // SUBMITTED' },
    { key: RFIStatus.IN_REVIEW, label: '03 // IN REVIEW' },
    { key: RFIStatus.ANSWERED, label: '04 // ANSWERED' },
    { key: RFIStatus.CLOSED, label: '05 // CLOSED' },
  ];

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(commentText.trim(), { rfiId: rfi.id }, isOfficialCheck);
    setCommentText('');
    setIsOfficialCheck(false);
  };

  const handleSaveOfficialAnswer = () => {
    if (!officialInputText.trim()) return;
    updateRFIStatus(rfi.id, RFIStatus.ANSWERED, officialInputText.trim());
    setIsEditingOfficial(false);
  };

  const handleConvertToTask = () => {
    const newTask = convertRFIToTask(rfi.id);
    alert(`已成功將本需求單轉化為看板實作卡片：「${newTask.title}」！`);
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              {rfi.rfiNumber}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              工程需求單詳細審查
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Subject & Core Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                狀態：{rfi.status}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                優先級：{rfi.priority}
              </span>
              {rfi.dueDate && (
                <span className="text-xs text-slate-500 flex items-center space-x-1">
                  <Calendar size={13} />
                  <span>到期日：{rfi.dueDate}</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {rfi.subject}
            </h2>
          </div>

          {/* Status Pipeline Visualization */}
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-700">
                生命週期流轉進度 (Lifecycle Pipeline)
              </h3>
              <span className="text-[11px] text-slate-400">標準工程審核程序</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center">
              {lifecycleSteps.map((step) => {
                const isCurrent = rfi.status === step.key;
                const isPassed =
                  (step.key === RFIStatus.DRAFT && rfi.status !== RFIStatus.DRAFT) ||
                  (step.key === RFIStatus.SUBMITTED && [RFIStatus.IN_REVIEW, RFIStatus.ANSWERED, RFIStatus.CLOSED].includes(rfi.status)) ||
                  (step.key === RFIStatus.IN_REVIEW && [RFIStatus.ANSWERED, RFIStatus.CLOSED].includes(rfi.status)) ||
                  (step.key === RFIStatus.ANSWERED && rfi.status === RFIStatus.CLOSED);

                return (
                  <div
                    key={step.key}
                    className={`py-2 px-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isPassed
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isPassed && <Check size={12} className="inline mr-0.5" />}
                    <span>{step.label.split(' // ')[1]}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Status Transition Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">階段操作：</span>

              {rfi.status === RFIStatus.DRAFT && (
                <button
                  onClick={() => updateRFIStatus(rfi.id, RFIStatus.SUBMITTED)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  送出需求單
                </button>
              )}

              {rfi.status === RFIStatus.SUBMITTED && (
                <button
                  onClick={() => updateRFIStatus(rfi.id, RFIStatus.IN_REVIEW)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  標記審核中
                </button>
              )}

              {rfi.status === RFIStatus.IN_REVIEW && canReviewRFI && (
                <button
                  onClick={() => {
                    const ans = prompt('請輸入官方正式答覆核定內容：', rfi.officialAnswer || '');
                    if (ans !== null && ans.trim()) {
                      updateRFIStatus(rfi.id, RFIStatus.ANSWERED, ans.trim());
                    }
                  }}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <CheckCircle2 size={13} />
                  <span>發布官方核定答覆</span>
                </button>
              )}

              {rfi.status === RFIStatus.ANSWERED && (
                <button
                  onClick={() => updateRFIStatus(rfi.id, RFIStatus.CLOSED)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Check size={13} />
                  <span>結案需求單</span>
                </button>
              )}

              {canReviewRFI && rfi.status !== RFIStatus.REJECTED && (
                <button
                  onClick={() => {
                    if (window.confirm('確定要駁回此需求單並請提出人補件嗎？')) {
                      updateRFIStatus(rfi.id, RFIStatus.REJECTED);
                    }
                  }}
                  className="px-3 py-1 text-xs font-semibold rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                >
                  駁回並要求補件
                </button>
              )}
            </div>
          </div>

          {/* Question Body */}
          <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-700 pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-900">提問與釐清需求詳情</span>
              {creator && (
                <span className="text-slate-400">
                  提出人：{creator.name} ({creator.role})
                </span>
              )}
            </div>
            <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed pt-1">
              {rfi.question}
            </p>
          </div>

          {/* Official Response Banner */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <div className="flex items-center space-x-2 text-emerald-900">
                <ShieldCheck size={17} className="text-emerald-600" />
                <h3 className="text-xs font-bold">
                  官方正式答覆核定 (Official Response)
                </h3>
              </div>

              {canReviewRFI && !isEditingOfficial && (
                <button
                  onClick={() => {
                    setOfficialInputText(rfi.officialAnswer || '');
                    setIsEditingOfficial(true);
                  }}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 cursor-pointer"
                >
                  <Edit size={12} />
                  <span>{rfi.officialAnswer ? '編輯答覆' : '+ 填寫官方答覆'}</span>
                </button>
              )}
            </div>

            {isEditingOfficial ? (
              <div className="space-y-2 pt-2">
                <textarea
                  rows={3}
                  value={officialInputText}
                  onChange={e => setOfficialInputText(e.target.value)}
                  placeholder="請輸入經技術主管或專案負責人正式核定的答覆結論..."
                  className="w-full text-xs p-3 border border-emerald-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 leading-relaxed"
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveOfficialAnswer}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    儲存並發布
                  </button>
                  <button
                    onClick={() => setIsEditingOfficial(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : rfi.officialAnswer ? (
              <p className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line pt-1">
                {rfi.officialAnswer}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic pt-1">
                尚待專案主管或技術負責人核定發布正式官方答覆。
              </p>
            )}
          </div>

          {/* Action: Convert RFI to Kanban Task */}
          <div className="p-4 border border-indigo-100 rounded-xl bg-indigo-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 font-semibold text-xs text-indigo-950">
                <Kanban size={15} className="text-indigo-600" />
                <span>看板任務連動 (Kanban Integration)</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {linkedTask
                  ? `已與看板任務「${linkedTask.title}」正式綁定`
                  : '此需求單結論已確認？可一鍵自動轉化為看板上的實作卡片'}
              </p>
            </div>

            {linkedTask ? (
              <button
                onClick={() => {
                  setSelectedTaskId(linkedTask.id);
                  setActiveTab('kanban');
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>檢視看板卡片</span>
                <ExternalLink size={13} />
              </button>
            ) : (
              <button
                onClick={handleConvertToTask}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Kanban size={14} />
                <span>轉化為看板任務</span>
              </button>
            )}
          </div>

          {/* Attachments & Image Paste */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-semibold text-slate-800 mb-2 flex items-center space-x-1.5">
              <Paperclip size={14} className="text-indigo-600" />
              <span>附件與截圖 (支援 Ctrl+V / Cmd+V 快速貼上)</span>
            </h3>
            <AttachmentUpload
              entityType="rfi"
              entityId={rfi.id}
              attachmentIds={rfi.attachmentIds || []}
            />
          </div>

          {/* RFI Comments & Discussion History */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
              <MessageSquare size={14} className="text-indigo-600" />
              <span>審查歷史與討論紀錄 ({rfiComments.length})</span>
            </h3>

            <div className="space-y-2.5">
              {rfiComments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">尚無任何討論紀錄</p>
              ) : (
                rfiComments.map(comm => {
                  const author = users.find(u => u.id === comm.userId);
                  return (
                    <div
                      key={comm.id}
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        comm.isOfficialResponse
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50/60 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <img
                            src={author?.avatarUrl}
                            alt={author?.name}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <span className="font-semibold text-slate-900">{author?.name}</span>
                          <span className="text-[11px] text-slate-400">({author?.role})</span>

                          {comm.isOfficialResponse && (
                            <span className="px-2 py-0.2 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800">
                              官方正式答覆
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {new Date(comm.createdAt).toLocaleString([], {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-slate-800 pl-7 leading-relaxed">{comm.content}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Post reply box */}
            <form onSubmit={handlePostReply} className="pt-2 space-y-2">
              <textarea
                rows={2}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="輸入回覆意見或技術說明..."
                className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 placeholder-slate-400"
              />

              <div className="flex items-center justify-between">
                {canReviewRFI ? (
                  <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isOfficialCheck}
                      onChange={e => setIsOfficialCheck(e.target.checked)}
                      className="accent-indigo-600 rounded"
                    />
                    <span className="font-medium">標記為官方正式結論 (Official Response)</span>
                  </label>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-40 transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Send size={12} />
                  <span>發表留言</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
