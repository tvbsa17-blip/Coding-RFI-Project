import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LightboxModal: React.FC = () => {
  const { lightbox, closeLightbox } = useApp();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!lightbox.isOpen) return null;

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-between p-4"
      onClick={closeLightbox}
    >
      {/* Top Header Bar */}
      <div
        className="w-full flex items-center justify-between text-white max-w-5xl z-10 py-2 border-b border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2">
          <Maximize2 size={16} className="text-indigo-400" />
          <span className="text-sm font-semibold truncate">{lightbox.title}</span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
          <button
            onClick={handleZoomOut}
            title="縮小"
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-xs font-semibold px-1 text-slate-200">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            title="放大"
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ZoomIn size={15} />
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button
            onClick={handleRotate}
            title="旋轉 90°"
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCw size={15} />
          </button>
          <button
            onClick={handleReset}
            title="重設大小"
            className="text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 px-2 py-1 rounded-lg transition-colors cursor-pointer"
          >
            重設
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <a
            href={lightbox.imageUrl}
            download={lightbox.title || 'image.png'}
            target="_blank"
            rel="noreferrer"
            title="下載圖檔"
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Download size={15} />
          </a>
        </div>

        {/* Close Button */}
        <button
          onClick={closeLightbox}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-4 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Image Display Area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden w-full max-h-[85vh] p-4"
        onClick={closeLightbox}
      >
        <img
          src={lightbox.imageUrl}
          alt={lightbox.title}
          onClick={e => e.stopPropagation()}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.1s ease-out',
          }}
          className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-white/10 cursor-default select-none bg-slate-900/60"
        />
      </div>

      {/* Bottom Hint */}
      <div className="text-xs text-slate-400 z-10 py-1 font-medium">
        點擊背景或右上角關閉按鈕以退出燈箱檢視
      </div>
    </div>
  );
};
