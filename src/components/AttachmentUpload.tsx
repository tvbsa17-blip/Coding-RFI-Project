import React, { useRef, useState, useEffect } from 'react';
import {
  Paperclip,
  Upload,
  Image as ImageIcon,
  FileText,
  FileArchive,
  Download,
  Trash2,
  Maximize2,
  Clipboard,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Attachment } from '../types';
import { useApp } from '../context/AppContext';

interface AttachmentUploadProps {
  entityType: 'task' | 'rfi';
  entityId: string;
  attachmentIds: string[];
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  entityType,
  entityId,
  attachmentIds,
}) => {
  const { attachments, uploadAttachment, deleteAttachment, openLightbox, users } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteSuccessNotice, setPasteSuccessNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Filter attachments belonging to this entity
  const entityAttachments = attachments.filter(a =>
    attachmentIds.includes(a.id) || (entityType === 'task' ? a.taskId === entityId : a.rfiId === entityId)
  );

  // Client-side image compression & process file
  const processFile = (file: File) => {
    setUploadError(null);

    // SRS 6.1: 限制單一圖片 10MB、一般附件 50MB
    const isImage = file.type.startsWith('image/');
    const maxSizeBytes = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setUploadError(`檔案大小超過限制 (圖片上限 10MB, 文件上限 50MB)`);
      return;
    }

    if (isImage) {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1920;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/webp', 0.85);
            uploadAttachment(
              {
                name: file.name.replace(/\.[^/.]+$/, '') + '.webp',
                size: Math.round(dataUrl.length * 0.75),
                type: 'image/webp',
                url: dataUrl,
              },
              entityType === 'task' ? { taskId: entityId } : { rfiId: entityId }
            );

            setPasteSuccessNotice(`已上傳圖檔: ${file.name}`);
            setTimeout(() => setPasteSuccessNotice(null), 3000);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        uploadAttachment(
          {
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            url: (e.target?.result as string) || '',
          },
          entityType === 'task' ? { taskId: entityId } : { rfiId: entityId }
        );

        setPasteSuccessNotice(`已上傳附件: ${file.name}`);
        setTimeout(() => setPasteSuccessNotice(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const timeStr = new Date().toISOString().slice(11, 19).replace(/:/g, '');
            const pastedFile = new File([blob], `SCREENSHOT_${timeStr}.png`, { type: blob.type });
            processFile(pastedFile);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [entityId, entityType]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file) processFile(file);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <ImageIcon size={16} className="text-indigo-600" />;
    if (mime.includes('pdf')) return <FileText size={16} className="text-rose-600" />;
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return <FileArchive size={16} className="text-amber-600" />;
    return <Paperclip size={16} className="text-slate-500" />;
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone & Clipboard Paste Notice */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50'
            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
          onChange={e => {
            if (e.target.files) {
              for (let i = 0; i < e.target.files.length; i++) {
                const f = e.target.files[i];
                if (f) processFile(f);
              }
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-1.5">
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
            <Upload size={16} />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            點擊或拖曳檔案至此處上傳
          </p>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Clipboard size={12} className="text-indigo-500" />
            <span>支援直接 <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-semibold">Ctrl+V / Cmd+V</kbd> 貼上截圖</span>
          </div>
          <p className="text-[11px] text-slate-400">
            檔案上限：圖片 &le; 10MB • 文件 &le; 50MB (PNG, JPG, WEBP, PDF, DOCX, XLSX, ZIP)
          </p>
        </div>
      </div>

      {/* Upload Notification Alert */}
      {pasteSuccessNotice && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2">
          <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
          <span>{pasteSuccessNotice}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center space-x-2">
          <AlertTriangle size={14} className="shrink-0 text-rose-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Attachment List */}
      {entityAttachments.length > 0 && (
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
            <Paperclip size={13} />
            <span>已附加檔案 ({entityAttachments.length})</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {entityAttachments.map(att => {
              const isImg = att.mimeType.startsWith('image/');
              const uploader = users.find(u => u.id === att.uploadedById);

              return (
                <div
                  key={att.id}
                  className="bg-white p-2.5 border border-slate-200 rounded-xl shadow-xs flex items-center justify-between space-x-2 text-xs hover:border-slate-300 transition-colors group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    {/* Thumbnail or File icon */}
                    {isImg ? (
                      <div
                        onClick={() => openLightbox(att.fileUrl, att.fileName)}
                        className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 cursor-zoom-in relative border border-slate-200"
                        title="點擊放大檢視"
                      >
                        <img
                          src={att.fileUrl}
                          alt={att.fileName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 size={12} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                        {getFileIcon(att.mimeType)}
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-medium text-slate-800 truncate"
                        title={att.fileName}
                      >
                        {att.fileName}
                      </p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{formatFileSize(att.fileSize)}</span>
                        {uploader && (
                          <span>• {uploader.name.split(' ')[0]}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Preview, Download, Delete */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {isImg && (
                      <button
                        onClick={() => openLightbox(att.fileUrl, att.fileName)}
                        title="燈箱預覽"
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Maximize2 size={14} />
                      </button>
                    )}

                    <a
                      href={att.fileUrl}
                      download={att.fileName}
                      target="_blank"
                      rel="noreferrer"
                      title="下載檔案"
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    >
                      <Download size={14} />
                    </a>

                    <button
                      onClick={() => {
                        if (window.confirm(`確定要刪除附件「${att.fileName}」嗎？`)) {
                          deleteAttachment(att.id);
                        }
                      }}
                      title="刪除附件"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
