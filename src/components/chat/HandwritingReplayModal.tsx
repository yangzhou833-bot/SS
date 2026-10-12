import React, { useRef, useState, useEffect } from 'react';
import { X, Play, RotateCcw } from 'lucide-react';
import { HandwritingStroke } from './FullScreenHandwriting';

interface HandwritingReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  strokes?: HandwritingStroke[];
  imageUrl?: string;
  senderName?: string;
}

export const HandwritingReplayModal: React.FC<HandwritingReplayModalProps> = ({
  isOpen,
  onClose,
  strokes = [],
  imageUrl,
  senderName = '好友',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI sizing
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Initial clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // If no strokes, just draw image if available
    if (!strokes.length && imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      return;
    }

    // Playback logic
    setIsPlaying(true);
    let currentStrokeIdx = 0;
    let currentPointIdx = 0;

    const renderStep = () => {
      if (currentStrokeIdx >= strokes.length) {
        setIsPlaying(false);
        return;
      }

      const stroke = strokes[currentStrokeIdx];
      if (stroke.points.length === 0) {
        currentStrokeIdx++;
        currentPointIdx = 0;
        animationRef.current = requestAnimationFrame(renderStep);
        return;
      }

      ctx.save();
      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.width * 2;
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = stroke.width;
        ctx.strokeStyle = stroke.color;
        if (stroke.width >= 20) ctx.globalAlpha = 0.55;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const pts = stroke.points;
      if (currentPointIdx === 0) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
        currentPointIdx = 1;
      } else if (currentPointIdx < pts.length) {
        const p1 = pts[currentPointIdx - 1];
        const p2 = pts[currentPointIdx];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        currentPointIdx++;
      } else {
        currentStrokeIdx++;
        currentPointIdx = 0;
      }
      ctx.restore();

      animationRef.current = requestAnimationFrame(renderStep);
    };

    animationRef.current = requestAnimationFrame(renderStep);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isOpen, strokes, imageUrl]);

  const handleRestart = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setIsPlaying(true);
    // Trigger re-render of effect
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E6EB] dark:border-zinc-700 bg-[#F0F2F5]/50 dark:bg-zinc-800/50">
          <div className="flex items-center space-x-2">
            <span className="text-base">✍️</span>
            <div>
              <h4 className="text-xs font-bold text-[#050505] dark:text-white">
                {senderName} 的手写笔迹
              </h4>
              <p className="text-[10px] text-[#65676B]">全屏手写内容</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#65676B] hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Canvas / Image */}
        <div className="relative w-full aspect-4/3 bg-white dark:bg-zinc-900 border-b border-[#E4E6EB] dark:border-zinc-700 flex items-center justify-center overflow-hidden">
          {imageUrl && !strokes.length ? (
            <img src={imageUrl} alt="手写内容" className="w-full h-full object-contain p-2" />
          ) : (
            <canvas ref={canvasRef} className="w-full h-full object-contain touch-none" />
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F0F2F5] dark:bg-zinc-800">
          <div className="flex items-center space-x-2">
            {strokes.length > 0 && (
              <button
                type="button"
                onClick={handleRestart}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E4E6EB] dark:border-zinc-700 bg-white dark:bg-zinc-700 text-[#050505] dark:text-white hover:border-[#1877F2] flex items-center space-x-1 cursor-pointer transition-all shadow-2xs"
              >
                <RotateCcw size={12} />
                <span>重新回放</span>
              </button>
            )}
            {isPlaying && (
              <span className="text-[11px] text-[#1877F2] font-medium flex items-center space-x-1 animate-pulse">
                <Play size={10} />
                <span>正在重现书写笔迹...</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 text-xs font-bold bg-[#1877F2] text-white rounded-md hover:bg-[#166fe5] transition-all cursor-pointer shadow-2xs"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
