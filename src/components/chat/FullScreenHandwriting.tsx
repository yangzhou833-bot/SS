import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Undo2, RotateCcw, X, Send, Eraser, Check } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { haptics } from '../../utils/haptics';

export interface HandwritingStroke {
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
  isEraser?: boolean;
}

interface FullScreenHandwritingProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (imageUrl: string, strokes: HandwritingStroke[]) => void;
  friendName?: string;
}

const PALETTE_COLORS = [
  { id: 'fb-blue', name: '经典蓝', value: '#1877F2' },
  { id: 'coral-red', name: '珊瑚红', value: '#FF3B30' },
  { id: 'orange', name: '活力橙', value: '#FF9500' },
  { id: 'lime', name: '荧光青', value: '#C6FF00' },
  { id: 'green', name: '生机绿', value: '#34C759' },
  { id: 'pink', name: '浪漫粉', value: '#FF2D55' },
  { id: 'purple', name: '幻影紫', value: '#AF52DE' },
  { id: 'black', name: '极夜黑', value: '#1C1E21' },
  { id: 'white', name: '月光白', value: '#FFFFFF' },
];

const PEN_WIDTHS = [
  { label: '细', value: 3 },
  { label: '中', value: 6 },
  { label: '粗', value: 12 },
  { label: '荧光', value: 24, isHighlighter: true },
];

export const FullScreenHandwriting: React.FC<FullScreenHandwritingProps> = ({
  isOpen,
  onClose,
  onSend,
  friendName = '好友',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedColor, setSelectedColor] = useState<string>('#1877F2');
  const [selectedWidth, setSelectedWidth] = useState<number>(6);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [strokes, setStrokes] = useState<HandwritingStroke[]>([]);
  const [undoneStrokes, setUndoneStrokes] = useState<HandwritingStroke[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawnAny, setHasDrawnAny] = useState<boolean>(false);

  const currentStrokeRef = useRef<HandwritingStroke | null>(null);

  // Redraw all strokes on canvas
  const redrawCanvas = useCallback((allStrokes: HandwritingStroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    allStrokes.forEach((stroke) => {
      if (stroke.points.length < 1) return;

      ctx.save();
      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.width * 2;
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = stroke.width;
        ctx.strokeStyle = stroke.color;
        if (stroke.width >= 20) {
          ctx.globalAlpha = 0.55; // Highlighter effect
        }
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.points.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          const prev = stroke.points[i - 1];
          const curr = stroke.points[i];
          const midX = (prev.x + curr.x) / 2;
          const midY = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
        ctx.lineTo(stroke.points[stroke.points.length - 1].x, stroke.points[stroke.points.length - 1].y);
        ctx.stroke();
      }
      ctx.restore();
    });
  }, []);

  // Sync canvas size with high DPI
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    redrawCanvas(strokes);
  }, [strokes, redrawCanvas]);

  useEffect(() => {
    if (isOpen) {
      resizeCanvas();
      const timer = setTimeout(resizeCanvas, 150);
      window.addEventListener('resize', resizeCanvas);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [isOpen, resizeCanvas]);

  // Pointer event handlers for silky smooth drawing
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if not supported
    }

    setIsDrawing(true);
    setHasDrawnAny(true);
    const coords = getCoordinates(e);

    const newStroke: HandwritingStroke = {
      points: [coords],
      color: selectedColor,
      width: selectedWidth,
      isEraser,
    };
    currentStrokeRef.current = newStroke;

    const nextStrokes = [...strokes, newStroke];
    setStrokes(nextStrokes);
    setUndoneStrokes([]);
    redrawCanvas(nextStrokes);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const coords = getCoordinates(e);
    currentStrokeRef.current.points.push(coords);

    // Instant incremental drawing for latency-free feel
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pts = currentStrokeRef.current.points;
    const len = pts.length;
    if (len >= 2) {
      ctx.save();
      if (currentStrokeRef.current.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = currentStrokeRef.current.width * 2;
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = currentStrokeRef.current.width;
        ctx.strokeStyle = currentStrokeRef.current.color;
        if (currentStrokeRef.current.width >= 20) {
          ctx.globalAlpha = 0.55;
        }
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      const p1 = pts[len - 2];
      const p2 = pts[len - 1];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    setIsDrawing(false);
    currentStrokeRef.current = null;
    redrawCanvas(strokes);
  };

  // Undo
  const handleUndo = () => {
    if (strokes.length === 0) return;
    haptics.trigger('light');
    const last = strokes[strokes.length - 1];
    const remaining = strokes.slice(0, -1);
    setStrokes(remaining);
    setUndoneStrokes((prev) => [...prev, last]);
    redrawCanvas(remaining);
  };

  // Clear
  const handleClear = () => {
    if (strokes.length === 0) return;
    haptics.trigger('medium');
    setUndoneStrokes((prev) => [...prev, ...strokes]);
    setStrokes([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Generate trimmed export PNG
  const handleConfirmSend = () => {
    if (strokes.length === 0) {
      haptics.trigger('warning');
      return;
    }

    soundEffects.playWhooshSound();
    haptics.trigger('success');

    // Create a temporary trimmed export canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate bounding box of all strokes
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    strokes.forEach((s) => {
      s.points.forEach((p) => {
        const radius = s.width;
        minX = Math.min(minX, p.x - radius);
        minY = Math.min(minY, p.y - radius);
        maxX = Math.max(maxX, p.x + radius);
        maxY = Math.max(maxY, p.y + radius);
      });
    });

    const padding = 24;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(rect.width, maxX + padding);
    maxY = Math.min(rect.height, maxY + padding);

    const exportW = Math.max(160, maxX - minX);
    const exportH = Math.max(100, maxY - minY);

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportW * dpr;
    exportCanvas.height = exportH * dpr;
    const exportCtx = exportCanvas.getContext('2d');

    if (exportCtx) {
      exportCtx.scale(dpr, dpr);
      // Soft clean Facebook backdrop
      exportCtx.fillStyle = '#FFFFFF';
      exportCtx.fillRect(0, 0, exportW, exportH);

      // Draw faint dot grid in Facebook style
      exportCtx.fillStyle = '#E4E6EB';
      for (let x = 12; x < exportW; x += 20) {
        for (let y = 12; y < exportH; y += 20) {
          exportCtx.fillRect(x, y, 1.5, 1.5);
        }
      }

      // Draw translated strokes
      strokes.forEach((stroke) => {
        if (stroke.points.length < 1) return;
        exportCtx.save();
        if (stroke.isEraser) {
          exportCtx.globalCompositeOperation = 'destination-out';
          exportCtx.lineWidth = stroke.width * 2;
          exportCtx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
          exportCtx.globalCompositeOperation = 'source-over';
          exportCtx.lineWidth = stroke.width;
          exportCtx.strokeStyle = stroke.color;
          if (stroke.width >= 20) exportCtx.globalAlpha = 0.55;
        }
        exportCtx.lineCap = 'round';
        exportCtx.lineJoin = 'round';

        exportCtx.beginPath();
        const start = stroke.points[0];
        exportCtx.moveTo(start.x - minX, start.y - minY);

        for (let i = 1; i < stroke.points.length; i++) {
          const prev = stroke.points[i - 1];
          const curr = stroke.points[i];
          const midX = (prev.x + curr.x) / 2 - minX;
          const midY = (prev.y + curr.y) / 2 - minY;
          exportCtx.quadraticCurveTo(prev.x - minX, prev.y - minY, midX, midY);
        }
        const last = stroke.points[stroke.points.length - 1];
        exportCtx.lineTo(last.x - minX, last.y - minY);
        exportCtx.stroke();
        exportCtx.restore();
      });
    }

    const dataUrl = exportCanvas.toDataURL('image/png');
    onSend(dataUrl, strokes);
    setStrokes([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 flex flex-col pointer-events-auto select-none overflow-hidden bg-black/45 backdrop-blur-[2px] transition-all animate-in fade-in duration-200"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Top Banner Guide */}
      <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between px-3.5 py-2 bg-white/95 dark:bg-[#242526]/95 border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] animate-pulse" />
          <span className="text-xs font-bold text-[#050505] dark:text-zinc-100">
            全屏手写面板 · 绘制发送给 {friendName}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {!hasDrawnAny && (
            <span className="text-[11px] text-[#65676B] hidden sm:inline">
              在屏幕任意区域自由书写
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            title="关闭手写"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Full-Screen Drawing Canvas */}
      <div className="flex-1 relative w-full h-full cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 w-full h-full touch-none"
        />

        {/* Empty Canvas Callout */}
        {strokes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/60 flex items-center justify-center mb-3">
              <span className="text-2xl">✍️</span>
            </div>
            <p className="text-sm font-semibold text-white tracking-wide">
              在此区域直接手写文字或涂鸦
            </p>
            <p className="text-xs text-white/80 mt-1">
              支持多色书写与荧光标记，好友可实时查看
            </p>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar: Two Rows as Requested (给出两行工具栏) */}
      <div className="relative z-20 mx-2.5 mb-3 p-2.5 bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-lg flex flex-col gap-2.5 transition-all">
        {/* Row 1: Color Palette (可以选择几种颜色) & Stroke Width / Eraser */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {/* Colors List */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {PALETTE_COLORS.map((col) => {
              const isSelected = !isEraser && selectedColor === col.value;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => {
                    setSelectedColor(col.value);
                    setIsEraser(false);
                    haptics.trigger('light');
                  }}
                  className={`w-7 h-7 rounded-md transition-all flex items-center justify-center relative cursor-pointer active:scale-90 ${
                    isSelected
                      ? 'ring-2 ring-[#1877F2] ring-offset-2 scale-110 shadow-xs'
                      : 'hover:scale-105 border border-black/10'
                  }`}
                  style={{ backgroundColor: col.value }}
                  title={col.name}
                >
                  {isSelected && (
                    <Check
                      size={13}
                      className={col.value === '#FFFFFF' || col.value === '#C6FF00' ? 'text-black' : 'text-white'}
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="h-5 w-[1px] bg-[#E4E6EB] dark:bg-zinc-700 shrink-0 mx-1" />

          {/* Stroke Widths */}
          <div className="flex items-center space-x-1 shrink-0">
            {PEN_WIDTHS.map((pw) => (
              <button
                key={pw.label}
                type="button"
                onClick={() => {
                  setSelectedWidth(pw.value);
                  setIsEraser(false);
                  haptics.trigger('light');
                }}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  !isEraser && selectedWidth === pw.value
                    ? 'bg-[#1877F2] text-white shadow-2xs'
                    : 'text-[#65676B] hover:bg-[#F0F2F5] dark:hover:bg-zinc-700 border border-[#E4E6EB] dark:border-zinc-700'
                }`}
                title={`笔触粗细: ${pw.label}`}
              >
                {pw.label}
              </button>
            ))}

            {/* Eraser */}
            <button
              type="button"
              onClick={() => {
                setIsEraser((prev) => !prev);
                haptics.trigger('light');
              }}
              className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                isEraser
                  ? 'bg-amber-500 text-white shadow-2xs ring-2 ring-amber-300'
                  : 'text-[#65676B] hover:bg-[#F0F2F5] dark:hover:bg-zinc-700 border border-[#E4E6EB] dark:border-zinc-700'
              }`}
              title="橡皮擦"
            >
              <Eraser size={15} />
            </button>
          </div>
        </div>

        {/* Row 2: Action Buttons (撤销、清空、退出、发送手写) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E4E6EB] dark:border-zinc-700/80">
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-[#E4E6EB] dark:border-zinc-700 text-[#050505] dark:text-zinc-200 hover:border-[#1877F2] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="撤销上一笔"
            >
              <Undo2 size={13} />
              <span>撤销</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-[#E4E6EB] dark:border-zinc-700 text-[#050505] dark:text-zinc-200 hover:border-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="清空当前手写"
            >
              <RotateCcw size={13} />
              <span>清空</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-[#65676B] hover:text-black dark:hover:text-white rounded-md hover:bg-[#F0F2F5] transition-all cursor-pointer"
            >
              退出
            </button>

            <button
              type="button"
              onClick={handleConfirmSend}
              disabled={strokes.length === 0}
              className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-md font-bold text-xs shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={13} />
              <span>发送手写</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
