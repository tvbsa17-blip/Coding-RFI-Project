import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Priority, RFIStatus } from '../types';

interface CreateRFIModalProps {
  onClose: () => void;
}

export const CreateRFIModal: React.FC<CreateRFIModalProps> = ({ onClose }) => {
  const {
    users,
    currentUser,
    createRFI,
    project,
    setSelectedRFIId,
    setActiveTab,
    rfis,
  } = useApp();

  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [respondentId, setRespondentId] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)
  );

  // Preview generated RFI number
  const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
  const predictedNumber = `RFI-${yearMonth}-${String(rfis.length + 1).padStart(3, '0')}`;

  const handleSubmit = (status: RFIStatus) => {
    if (!subject.trim() || !question.trim()) {
      alert('請填寫提問主題與釐清內容！');
      return;
    }

    const newRfi = createRFI({
      subject: subject.trim(),
      question: question.trim(),
      priority,
      status,
      creatorId: currentUser.id,
      respondentId: respondentId || undefined,
      projectId: project.id,
      dueDate: dueDate || undefined,
      attachmentIds: [],
    });

    onClose();
    setSelectedRFIId(newRfi.id);
    setActiveTab('rfi');
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              RFI
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                提出工程與規格需求單 (RFI)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                單號預覽：<span className="font-semibold text-slate-700">{predictedNumber}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              提問主題 *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="例如：企業 SSO 登入授權碼流程規格確認..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 bg-white placeholder-slate-400"
            />
          </div>

          {/* Question / Clarification content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              釐清內容與規格背景 *
            </label>
            <textarea
              rows={4}
              required
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="請詳細敘述需求不明確或規格衝突之處、目前阻礙、以及期望之答覆範圍..."
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 bg-white placeholder-slate-400 leading-relaxed"
            />
          </div>

          {/* Priority, Due Date, Respondent */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                緊急程度
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value={Priority.URGENT}>緊急 (Urgent)</option>
                <option value={Priority.HIGH}>高 (High)</option>
                <option value={Priority.MEDIUM}>中 (Medium)</option>
                <option value={Priority.LOW}>低 (Low)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                要求答覆日期
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                指定回覆者
              </label>
              <select
                value={respondentId}
                onChange={e => setRespondentId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">-- 全體 / 未指派 --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tips banner */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center space-x-2">
            <HelpCircle size={15} className="shrink-0 text-indigo-600" />
            <span>
              送出後即可在詳細頁面使用 <kbd className="bg-white border border-indigo-200 px-1.5 py-0.5 rounded text-[11px] font-semibold text-indigo-800">Ctrl+V / Cmd+V</kbd> 直接貼上相關規格或問題截圖，亦可指派特定團隊會簽。
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            取消
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleSubmit(RFIStatus.DRAFT)}
              className="px-4 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              儲存草稿
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(RFIStatus.SUBMITTED)}
              className="px-5 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Send size={13} />
              <span>正式提出需求單</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
