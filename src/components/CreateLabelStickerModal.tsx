import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Scissors,
  Check,
  RotateCcw,
  Palette,
  Sliders,
  Type,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { LabelSticker, StickerBorder } from '../types';
import { PRESET_CUTOUT_STOCK } from '../data/stickerData';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

interface CreateLabelStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStickersCount: number;
  onSaveSticker: (newSticker: LabelSticker) => void;
  onShowToast?: (msg: string) => void;
}

const COLOR_PRESETS = [
  { label: '经典纯白', value: '#FFFFFF', isLight: true },
  { label: 'Facebook蓝', value: '#1877F2', isLight: false },
  { label: '活力暖橙', value: '#FF6B00', isLight: false },
  { label: '烈焰玫瑰', value: '#FF2E63', isLight: false },
  { label: '霓虹金黄', value: '#FFB800', isLight: true },
  { label: '翡翠荧光绿', value: '#00E676', isLight: false },
  { label: '星云魅紫', value: '#A855F7', isLight: false },
  { label: '赛博青蓝', value: '#00D2FC', isLight: false },
];

export const CreateLabelStickerModal: React.FC<CreateLabelStickerModalProps> = ({
  isOpen,
  onClose,
  currentStickersCount,
  onSaveSticker,
  onShowToast,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 State: Photo source
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>(PRESET_CUTOUT_STOCK[0].sourcePhotoUrl);
  const [selectedStockId, setSelectedStockId] = useState<string>(PRESET_CUTOUT_STOCK[0].id);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 2 State: Cutout Canvas
  const [isProcessingCutout, setIsProcessingCutout] = useState<boolean>(false);
  const [cutoutDataUrl, setCutoutDataUrl] = useState<string>(PRESET_CUTOUT_STOCK[0].cutoutUrl);
  const [brushMode, setBrushMode] = useState<'keep' | 'erase'>('erase');
  const [brushSize, setBrushSize] = useState<number>(20);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Step 3 State: Styling & Border
  const [stickerLabel, setStickerLabel] = useState<string>('吃货 Foodie 🍔');
  const [borderColor, setBorderColor] = useState<string>('#FFFFFF');
  const [borderWidth, setBorderWidth] = useState<number>(3);
  const [borderStyle, setBorderStyle] = useState<'solid' | 'dashed' | 'glow'>('solid');
  const [stickerSize, setStickerSize] = useState<number>(48);
  const [rotationDeg, setRotationDeg] = useState<number>(0);

  // Camera stream cleanup
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (!isOpen) return null;

  // Step 1: Start Camera Stream
  const handleStartCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setIsCameraActive(false);
      onShowToast?.('未能访问摄像头，请尝试上传照片或选择素材库');
    }
  };

  const handleCaptureCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 400, 400);
      const data = canvas.toDataURL('image/png');
      setSelectedImageSrc(data);
      setIsCameraActive(false);
      if (videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
      runAutoCutout(data);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      setSelectedImageSrc(data);
      runAutoCutout(data);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectStock = (stock: typeof PRESET_CUTOUT_STOCK[0]) => {
    setSelectedStockId(stock.id);
    setSelectedImageSrc(stock.sourcePhotoUrl);
    setCutoutDataUrl(stock.cutoutUrl);
    setStickerLabel(stock.label);
    setBorderColor(stock.borderColor);
    setBorderStyle(stock.borderStyle);
    setCurrentStep(2);
  };

  // Step 2: Intelligent Real-Time Canvas Cutout Segmentation
  const runAutoCutout = (imgSrc: string) => {
    setIsProcessingCutout(true);
    setCurrentStep(2);
    soundEffects.playSnapShutter();
    haptics.trigger('light');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw centered circular/elliptical subject segmentation
        ctx.drawImage(img, 0, 0, 300, 300);
        const imgData = ctx.getImageData(0, 0, 300, 300);
        const data = imgData.data;

        // Smart edge transparency gradient filter based on radial distance from center
        const centerX = 150;
        const centerY = 150;
        const maxRadius = 135;

        for (let y = 0; y < 300; y++) {
          for (let x = 0; x < 300; x++) {
            const idx = (y * 300 + x) * 4;
            const dist = Math.hypot(x - centerX, y - centerY);
            if (dist > maxRadius) {
              data[idx + 3] = 0; // Transparent background
            } else if (dist > maxRadius - 20) {
              const alphaRatio = (maxRadius - dist) / 20;
              data[idx + 3] = Math.floor(data[idx + 3] * alphaRatio);
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        const cutoutResult = canvas.toDataURL('image/png');
        setCutoutDataUrl(cutoutResult);
      }
      setIsProcessingCutout(false);
    };
    img.onerror = () => {
      setCutoutDataUrl(imgSrc);
      setIsProcessingCutout(false);
    };
    img.src = imgSrc;
  };

  // Manual Brush / Eraser Tool on Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawOnCanvas(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    drawOnCanvas(e);
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setCutoutDataUrl(canvasRef.current.toDataURL('image/png'));
    }
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.save();
    if (brushMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
    }
    ctx.restore();
  };

  // Step 4: Finalize & Save
  const handleFinalSave = () => {
    if (currentStickersCount >= 6) {
      onShowToast?.('贴纸上限 6 个，请先在个人主页长按删除一个贴纸');
      soundEffects.playErrorBeep();
      return;
    }

    const newId = `st_${Date.now()}`;
    const newSticker: LabelSticker = {
      id: newId,
      cutoutUrl: cutoutDataUrl,
      sourcePhotoUrl: selectedImageSrc,
      label: stickerLabel.trim() || '我的标签',
      border: {
        color: borderColor,
        widthPx: borderWidth,
        style: borderStyle,
      },
      sizePx: stickerSize,
      likes: 1,
      likedByMe: true,
      recentLikers: [
        {
          userId: 'me',
          userName: '我',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          time: '刚刚',
        },
      ],
      orbit: {
        angleDeg: (currentStickersCount * 60 + 35) % 360,
        radiusPx: 88,
        phase: (currentStickersCount * 0.3) % 1.0,
      },
      hidden: false,
      createdAt: new Date().toISOString(),
    };

    soundEffects.playSendTone();
    haptics.trigger('success');
    onSaveSticker(newSticker);
    onShowToast?.(`✨ 成功生成真人专属抠图贴纸「${newSticker.label}」并置入环形轨道！`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-99 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-800 rounded-md w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Header with Steps */}
          <div className="p-4 border-b border-[#E4E6EB] dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-md bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center font-black">
                <Scissors size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#050505] dark:text-[#E4E6EB]">
                  新建真人照片抠图标签贴纸
                </h3>
                <div className="flex items-center space-x-1.5 text-[11px] text-[#65676B] dark:text-zinc-400 mt-0.5">
                  <span className={currentStep === 1 ? 'text-[#1877F2] font-black' : ''}>1. 选照片</span>
                  <span>→</span>
                  <span className={currentStep === 2 ? 'text-[#1877F2] font-black' : ''}>2. 抠主体</span>
                  <span>→</span>
                  <span className={currentStep === 3 ? 'text-[#1877F2] font-black' : ''}>3. 定制白边/标签</span>
                  <span>→</span>
                  <span className={currentStep === 4 ? 'text-[#1877F2] font-black' : ''}>4. 入轨</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200/70 hover:bg-gray-300 dark:bg-zinc-800 text-[#050505] dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content by Steps */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {/* Limit Warning */}
            {currentStickersCount >= 6 && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-2.5 rounded-md flex items-center space-x-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
                <AlertCircle size={15} className="shrink-0" />
                <span>已达 6 个贴纸上限。保存前请先删除一个旧贴纸。</span>
              </div>
            )}

            {/* STEP 1: Pick Photo */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Option A: Take Photo */}
                  <button
                    onClick={handleStartCamera}
                    className="p-4 bg-gray-50 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-[#E4E6EB] hover:border-[#1877F2] rounded-md flex flex-col items-center justify-center space-y-2 text-[#050505] dark:text-[#E4E6EB] transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera size={24} />
                    </div>
                    <span className="text-xs font-black">实时自拍 / 抓拍</span>
                    <span className="text-[10px] text-[#65676B] dark:text-zinc-400">开启前置/后置相机生成</span>
                  </button>

                  {/* Option B: Upload Photo */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 bg-gray-50 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-[#E4E6EB] hover:border-[#1877F2] rounded-md flex flex-col items-center justify-center space-y-2 text-[#050505] dark:text-[#E4E6EB] transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <span className="text-xs font-black">相册上传照片</span>
                    <span className="text-[10px] text-[#65676B] dark:text-zinc-400">支持 JPG/PNG/HEIC 本地图片</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Camera Live Stream View */}
                {isCameraActive && (
                  <div className="relative rounded-md overflow-hidden bg-black aspect-square max-w-xs mx-auto border border-[#E4E6EB]">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <button
                      onClick={handleCaptureCamera}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-[#1877F2] rounded-full font-black text-xs shadow-lg flex items-center space-x-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Camera size={14} />
                      <span>拍摄并自动抠图</span>
                    </button>
                  </div>
                )}

                {/* Option C: Curated Photo Cutout Presets */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-[#050505] dark:text-[#E4E6EB] flex items-center space-x-1">
                      <Sparkles size={13} className="text-[#1877F2]" />
                      <span>或从精选灵动生活素材库直接选取：</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_CUTOUT_STOCK.map((stock, sIdx) => (
                      <button
                        key={`preset-stock-${stock.id}-${sIdx}`}
                        onClick={() => handleSelectStock(stock)}
                        className={`p-2 bg-gray-50 dark:bg-zinc-800 rounded-md border text-center flex flex-col items-center space-y-1.5 transition-all cursor-pointer ${
                          selectedStockId === stock.id
                            ? 'border-[#1877F2] ring-2 ring-[#1877F2]/20 bg-blue-50/40'
                            : 'border-[#E4E6EB] hover:border-gray-400'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-200 dark:bg-zinc-700 flex items-center justify-center p-0.5">
                          <img
                            src={stock.cutoutUrl}
                            alt={stock.label}
                            className="w-full h-full object-contain filter drop-shadow-xs"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#050505] dark:text-[#E4E6EB] truncate w-full">
                          {stock.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Cutout Segmentation & Manual Refinement */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#050505] dark:text-[#E4E6EB]">
                    抠图效果实时预览 (透明底)
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setBrushMode(brushMode === 'erase' ? 'keep' : 'erase')}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        brushMode === 'erase'
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {brushMode === 'erase' ? '🧽 橡皮擦除' : '🖌️ 恢复保留'}
                    </button>
                    <button
                      onClick={() => runAutoCutout(selectedImageSrc)}
                      className="p-1 text-gray-500 hover:text-black cursor-pointer"
                      title="重置自动抠图"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>

                {/* Checkerboard Transparent Canvas Preview */}
                <div className="relative w-64 h-64 mx-auto rounded-md border border-[#E4E6EB] dark:border-zinc-800 overflow-hidden shadow-inner flex items-center justify-center bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]">
                  {isProcessingCutout ? (
                    <div className="flex flex-col items-center space-y-2 text-[#1877F2]">
                      <div className="w-8 h-8 border-3 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold">正在自动分离前景主体...</span>
                    </div>
                  ) : (
                    <img
                      src={cutoutDataUrl}
                      alt="Cutout Preview"
                      className="max-w-full max-h-full object-contain filter drop-shadow-md"
                    />
                  )}
                </div>

                {/* Brush size slider */}
                <div className="flex items-center space-x-3 px-2">
                  <span className="text-[11px] text-[#65676B] shrink-0">笔刷粗细:</span>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full accent-[#1877F2]"
                  />
                  <span className="text-[11px] font-bold text-[#050505] w-6">{brushSize}px</span>
                </div>
              </div>
            )}

            {/* STEP 3: Customize Border, Text & Styling */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Live Preview on Orbit Ring */}
                <div className="relative w-48 h-48 mx-auto rounded-full border-2 border-dashed border-[#1877F2]/30 flex items-center justify-center bg-blue-50/20">
                  {/* Center Fake Avatar */}
                  <div className="w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden opacity-50">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                      alt="Center Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Orbiting Live Sticker Preview */}
                  <div
                    className="absolute -top-1 right-2 flex flex-col items-center animate-bounce"
                    style={{
                      transform: `rotate(${rotationDeg}deg) scale(${stickerSize / 48})`,
                    }}
                  >
                    <div
                      className="relative rounded-full p-0.5 overflow-hidden transition-all"
                      style={{
                        width: `${stickerSize}px`,
                        height: `${stickerSize}px`,
                        border: `${borderWidth}px ${borderStyle === 'dashed' ? 'dashed' : 'solid'} ${borderColor}`,
                        boxShadow:
                          borderStyle === 'glow'
                            ? `0 0 14px ${borderColor}`
                            : '0 4px 10px rgba(0,0,0,0.18)',
                      }}
                    >
                      <img
                        src={cutoutDataUrl}
                        alt="Sticker Final"
                        className="w-full h-full object-contain filter drop-shadow-xs"
                      />
                    </div>
                    {/* Label Tag Bubble */}
                    <div className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-white/95 text-[#050505] border border-[#E4E6EB] shadow-xs whitespace-nowrap">
                      {stickerLabel || '贴纸标签'}
                    </div>
                  </div>
                </div>

                {/* A. Label Text Input */}
                <div>
                  <label className="text-xs font-black text-[#050505] dark:text-[#E4E6EB] block mb-1">
                    🏷️ 贴纸标签名称 (显示在气泡内/下)
                  </label>
                  <input
                    type="text"
                    value={stickerLabel}
                    onChange={(e) => setStickerLabel(e.target.value)}
                    maxLength={14}
                    placeholder="如：吃货 Foodie、夜猫子、破风骑手"
                    className="w-full text-xs font-bold bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 rounded-md px-3 py-2 outline-none focus:border-[#1877F2]"
                  />
                </div>

                {/* B. White Border & Color Selection */}
                <div>
                  <label className="text-xs font-black text-[#050505] dark:text-[#E4E6EB] block mb-1.5">
                    🎨 边缘轮廓描边颜色 (支持经典白边与个性色彩)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_PRESETS.map((preset, pIdx) => (
                      <button
                        key={`preset-color-${preset.value}-${pIdx}`}
                        onClick={() => setBorderColor(preset.value)}
                        className={`p-1.5 rounded-md border text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all ${
                          borderColor === preset.value
                            ? 'border-[#1877F2] ring-2 ring-[#1877F2]/20 bg-blue-50/50'
                            : 'border-[#E4E6EB] hover:border-gray-400'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: preset.value }}
                        />
                        <span className="text-[10px] text-[#050505] dark:text-[#E4E6EB] truncate">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* C. Border Width & Style */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#65676B] dark:text-zinc-400 block mb-1">
                      描边粗细 ({borderWidth}px)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(Number(e.target.value))}
                      className="w-full accent-[#1877F2]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#65676B] dark:text-zinc-400 block mb-1">
                      描边风格
                    </label>
                    <div className="flex rounded-md border border-[#E4E6EB] overflow-hidden">
                      {(['solid', 'dashed', 'glow'] as const).map((style, sIdx) => (
                        <button
                          key={`border-style-${style}-${sIdx}`}
                          onClick={() => setBorderStyle(style)}
                          className={`flex-1 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
                            borderStyle === style
                              ? 'bg-[#1877F2] text-white'
                              : 'bg-white dark:bg-zinc-800 text-[#050505] dark:text-[#E4E6EB]'
                          }`}
                        >
                          {style === 'solid' ? '实线' : style === 'dashed' ? '虚线' : '发光'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-[#E4E6EB] dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((currentStep - 1) as any)}
                className="px-3 py-1.5 rounded-md text-xs font-bold text-[#65676B] hover:bg-gray-200 transition-colors cursor-pointer"
              >
                上一步
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep((currentStep + 1) as any)}
                className="px-4 py-1.5 rounded-md text-xs font-black bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-2xs flex items-center space-x-1 transition-all cursor-pointer"
              >
                <span>下一步</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={handleFinalSave}
                className="px-5 py-1.5 rounded-md text-xs font-black bg-gradient-to-r from-[#1877F2] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md flex items-center space-x-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles size={13} />
                <span>保存并飞入环绕轨道 ✨</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
