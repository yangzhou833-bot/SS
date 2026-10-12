import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  Move,
  RotateCw,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Palette,
  Check,
  Compass,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { LabelSticker } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

interface StickerManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  stickers: LabelSticker[];
  avatarUrl: string;
  userName: string;
  onSaveStickers: (newStickers: LabelSticker[]) => void;
  onOpenCreateSticker: () => void;
  onShowToast?: (msg: string) => void;
}

const COLOR_PRESETS = [
  { label: '纯白', value: '#FFFFFF', isGlow: false },
  { label: 'Facebook蓝', value: '#1877F2', isGlow: false },
  { label: '霓虹金黄', value: '#FFB800', isGlow: false },
  { label: '烈焰玫瑰', value: '#FF2E63', isGlow: false },
  { label: '翡翠荧光绿', value: '#00E676', isGlow: false },
  { label: '星云魅紫', value: '#A855F7', isGlow: false },
  { label: '纯白发光', value: '#FFFFFF', isGlow: true },
  { label: '蓝光光晕', value: '#1877F2', isGlow: true },
];

const PRESET_POSITIONS = [
  { label: '↖ 左上', angle: 135, radius: 88 },
  { label: '↗ 右上', angle: 45, radius: 88 },
  { label: '↘ 右下', angle: 315, radius: 88 },
  { label: '↙ 左下', angle: 225, radius: 88 },
  { label: '⬆ 正上', angle: 90, radius: 92 },
  { label: '⬇ 正下', angle: 270, radius: 92 },
];

export const StickerManagementModal: React.FC<StickerManagementModalProps> = ({
  isOpen,
  onClose,
  stickers,
  avatarUrl,
  userName,
  onSaveStickers,
  onOpenCreateSticker,
  onShowToast,
}) => {
  const [localStickers, setLocalStickers] = useState<LabelSticker[]>(stickers);
  const [selectedStickerId, setSelectedStickerId] = useState<string>(
    stickers.length > 0 ? stickers[0].id : ''
  );

  // Sync with prop when opened
  React.useEffect(() => {
    setLocalStickers(stickers);
    if (stickers.length > 0 && !stickers.find((s) => s.id === selectedStickerId)) {
      setSelectedStickerId(stickers[0].id);
    }
  }, [stickers, isOpen]);

  if (!isOpen) return null;

  const currentSticker = localStickers.find((s) => s.id === selectedStickerId);

  // Update a field on the selected sticker
  const handleUpdateCurrent = (updates: Partial<LabelSticker>) => {
    if (!selectedStickerId) return;
    setLocalStickers((prev) =>
      prev.map((s) => (s.id === selectedStickerId ? { ...s, ...updates } : s))
    );
  };

  // Update position (angle & radius)
  const handleUpdatePosition = (angleDeg: number, radiusPx?: number) => {
    if (!selectedStickerId || !currentSticker) return;
    const currentRadius = currentSticker.orbit?.radiusPx || 88;
    handleUpdateCurrent({
      orbit: {
        angleDeg,
        radiusPx: radiusPx !== undefined ? radiusPx : currentRadius,
        phase: currentSticker.orbit?.phase || 0,
      },
    });
  };

  // Distribute all stickers evenly around the avatar
  const handleDistributeEvenly = () => {
    if (localStickers.length === 0) return;
    const step = 360 / localStickers.length;
    setLocalStickers((prev) =>
      prev.map((s, idx) => ({
        ...s,
        orbit: {
          angleDeg: Math.round(idx * step + 45) % 360,
          radiusPx: 88,
          phase: idx * 0.2,
        },
      }))
    );
    soundEffects.playBubblePopSound();
    haptics.trigger('light');
    onShowToast?.('✨ 贴纸已自动环绕均匀排列');
  };

  // Delete current sticker
  const handleDeleteSticker = (id: string) => {
    const updated = localStickers.filter((s) => s.id !== id);
    setLocalStickers(updated);
    if (selectedStickerId === id) {
      setSelectedStickerId(updated.length > 0 ? updated[0].id : '');
    }
    soundEffects.playWarningSound();
    haptics.trigger('light');
    onShowToast?.('贴纸已删除');
  };

  // Toggle hide/show
  const handleToggleHide = (id: string) => {
    setLocalStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s))
    );
  };

  // Save changes
  const handleSave = () => {
    onSaveStickers(localStickers);
    soundEffects.playSendTone();
    haptics.trigger('success');
    onShowToast?.('贴纸编辑与位置已保存 🎉');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-90 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-800 rounded-md w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Bar Header */}
          <div className="px-4 py-3 border-b border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-between bg-[#F0F2F5]/60 dark:bg-zinc-800/50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center font-bold">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#050505] dark:text-[#E4E6EB]">
                  贴纸管理与位置编排
                </h3>
                <p className="text-[11px] text-[#65676B] dark:text-zinc-400">
                  编辑贴纸外观 · 自由调整放置位置 ({localStickers.length}/6)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200/70 hover:bg-gray-300 dark:bg-zinc-800 text-[#050505] dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. Orbit Visual Drag & Positioning Canvas */}
            <div className="relative w-full h-64 bg-gradient-to-b from-[#E7F3FF]/40 to-white dark:from-zinc-800/40 dark:to-zinc-900 rounded-md border border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-center overflow-hidden">
              {/* Background Orbit Ring */}
              <div className="absolute w-44 h-44 rounded-full border border-dashed border-[#1877F2]/30 dark:border-blue-400/30 pointer-events-none" />
              <div className="absolute w-32 h-32 rounded-full border border-dashed border-gray-300/40 dark:border-zinc-700/40 pointer-events-none" />

              {/* Center Avatar (z-20 layer) */}
              <div className="relative z-20 w-20 h-20 rounded-full border-2 border-white dark:border-zinc-700 shadow-md overflow-hidden bg-gray-100 shrink-0">
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              </div>

              {/* Orbiting Stickers in Canvas */}
              {localStickers.map((sticker, sIdx) => {
                const angleDeg = sticker.orbit?.angleDeg ?? 45;
                const radius = sticker.orbit?.radiusPx ?? 88;
                const rad = (angleDeg * Math.PI) / 180;
                const x = Math.cos(rad) * (radius * 0.95);
                const y = Math.sin(rad) * (radius * 0.95);
                const isSelected = sticker.id === selectedStickerId;

                return (
                  <motion.div
                    key={`canvas-stk-${sticker.id}-${sIdx}`}
                    drag
                    dragConstraints={{ left: -110, right: 110, top: -110, bottom: 110 }}
                    dragElastic={0.1}
                    onDragEnd={(_, info) => {
                      // Calculate new angle and radius based on offset
                      const currentX = x + info.offset.x;
                      const currentY = y + info.offset.y;
                      let newAngle = (Math.atan2(currentY, currentX) * 180) / Math.PI;
                      if (newAngle < 0) newAngle += 360;
                      const newDist = Math.min(110, Math.max(60, Math.hypot(currentX, currentY)));
                      
                      setSelectedStickerId(sticker.id);
                      setLocalStickers((prev) =>
                        prev.map((s) =>
                          s.id === sticker.id
                            ? {
                                ...s,
                                orbit: {
                                  angleDeg: Math.round(newAngle),
                                  radiusPx: Math.round(newDist / 0.95),
                                  phase: s.orbit?.phase || 0,
                                },
                              }
                            : s
                        )
                      );
                      haptics.trigger('light');
                    }}
                    onClick={() => {
                      setSelectedStickerId(sticker.id);
                      soundEffects.playTapSound();
                    }}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                      width: Math.min(48, sticker.sizePx || 44),
                      height: Math.min(48, sticker.sizePx || 44),
                    }}
                    className={`absolute z-10 cursor-grab active:cursor-grabbing flex items-center justify-center transition-shadow ${
                      isSelected ? 'ring-2 ring-[#1877F2] ring-offset-2 scale-110 z-30' : 'hover:scale-105'
                    } ${sticker.hidden ? 'opacity-30 grayscale' : 'opacity-100'}`}
                  >
                    <div
                      className="w-full h-full rounded-full overflow-hidden p-0.5"
                      style={{
                        backgroundColor: sticker.border?.color || '#FFFFFF',
                        boxShadow:
                          sticker.border?.style === 'glow'
                            ? `0 0 10px ${sticker.border?.color || '#1877F2'}`
                            : '0 2px 5px rgba(0,0,0,0.15)',
                      }}
                    >
                      <img
                        src={sticker.cutoutUrl}
                        alt=""
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </div>
                  </motion.div>
                );
              })}

              {/* Guide Hint */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-[#65676B] dark:text-zinc-400 bg-white/80 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full border border-[#E4E6EB] dark:border-zinc-700 pointer-events-none whitespace-nowrap">
                💡 可在上方画布中直接拖拽贴纸调整位置
              </div>
            </div>

            {/* 2. Selected Sticker Customization Controls */}
            {currentSticker ? (
              <div className="border border-[#E4E6EB] dark:border-zinc-800 rounded-md p-3.5 space-y-3 bg-[#F0F2F5]/40 dark:bg-zinc-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={currentSticker.cutoutUrl}
                      alt=""
                      className="w-8 h-8 object-contain rounded-full bg-white border border-[#E4E6EB]"
                    />
                    <div>
                      <span className="text-xs font-black text-[#050505] dark:text-[#E4E6EB]">
                        {currentSticker.label || '专属贴纸'}
                      </span>
                      <span className="text-[10px] text-[#65676B] block">
                        当前位置: {currentSticker.orbit?.angleDeg ?? 45}° · 距离: {currentSticker.orbit?.radiusPx ?? 88}px
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleHide(currentSticker.id)}
                      className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 text-[#65676B] transition-colors"
                      title={currentSticker.hidden ? '取消隐藏' : '隐藏此贴纸'}
                    >
                      {currentSticker.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSticker(currentSticker.id)}
                      className="p-1.5 rounded-md hover:bg-rose-100 text-rose-600 transition-colors"
                      title="删除此贴纸"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Preset Position Buttons */}
                <div>
                  <label className="text-[10px] font-bold text-[#65676B] dark:text-zinc-400 block mb-1.5">
                    快速放置方位预设
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                    {PRESET_POSITIONS.map((pos, posIdx) => (
                      <button
                        key={`preset-pos-${pos.label}-${posIdx}`}
                        type="button"
                        onClick={() => handleUpdatePosition(pos.angle, pos.radius)}
                        className="px-2 py-1 bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] hover:text-[#1877F2] text-xs font-bold text-[#050505] dark:text-[#E4E6EB] rounded-md transition-all active:scale-95 text-center cursor-pointer"
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position Angle & Distance Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-[#050505] dark:text-zinc-300 mb-1">
                      <span>围绕角度 (0°~360°)</span>
                      <span className="text-[#1877F2]">{currentSticker.orbit?.angleDeg ?? 45}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={currentSticker.orbit?.angleDeg ?? 45}
                      onChange={(e) => handleUpdatePosition(parseInt(e.target.value, 10))}
                      className="w-full accent-[#1877F2] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-[#050505] dark:text-zinc-300 mb-1">
                      <span>贴纸大小</span>
                      <span className="text-[#1877F2]">{currentSticker.sizePx || 46}px</span>
                    </div>
                    <input
                      type="range"
                      min={34}
                      max={60}
                      value={currentSticker.sizePx || 46}
                      onChange={(e) =>
                        handleUpdateCurrent({ sizePx: parseInt(e.target.value, 10) })
                      }
                      className="w-full accent-[#1877F2] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Border Color & Glow Preset */}
                <div>
                  <label className="text-[10px] font-bold text-[#65676B] dark:text-zinc-400 block mb-1.5">
                    边框样式与发光
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((cp, idx) => {
                      const isActive =
                        currentSticker.border?.color === cp.value &&
                        (cp.isGlow ? currentSticker.border?.style === 'glow' : currentSticker.border?.style !== 'glow');
                      return (
                        <button
                          key={`cp-${idx}`}
                          type="button"
                          onClick={() => {
                            handleUpdateCurrent({
                              border: {
                                color: cp.value,
                                widthPx: 3,
                                style: cp.isGlow ? 'glow' : 'solid',
                              },
                            });
                          }}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1 border transition-all cursor-pointer ${
                            isActive
                              ? 'border-[#1877F2] bg-[#1877F2]/10 text-[#1877F2]'
                              : 'border-[#E4E6EB] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[#050505] dark:text-zinc-300 hover:border-gray-400'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: cp.value }}
                          />
                          <span>{cp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#65676B] border border-dashed border-[#E4E6EB] rounded-md">
                暂无贴纸，点击下方按钮制作新贴纸吧！
              </div>
            )}

            {/* 3. Sticker Strip List & Add Button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#050505] dark:text-[#E4E6EB]">
                  全部已装备贴纸 ({localStickers.length}/6)
                </span>
                <button
                  type="button"
                  onClick={handleDistributeEvenly}
                  className="text-[11px] font-bold text-[#1877F2] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCw size={12} />
                  <span>一键均分环绕</span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {localStickers.map((stk, stkIdx) => {
                  const isSelected = stk.id === selectedStickerId;
                  return (
                    <div
                      key={`stk-item-${stk.id}-${stkIdx}`}
                      onClick={() => setSelectedStickerId(stk.id)}
                      className={`relative p-2 rounded-md border flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#1877F2] bg-[#1877F2]/5 shadow-xs'
                          : 'border-[#E4E6EB] dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:border-[#1877F2]/60'
                      }`}
                    >
                      <img
                        src={stk.cutoutUrl}
                        alt=""
                        className="w-9 h-9 object-contain mb-1"
                      />
                      <span className="text-[10px] font-bold text-[#050505] dark:text-[#E4E6EB] truncate max-w-[50px] text-center">
                        {stk.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[8px]">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}

                {localStickers.length < 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenCreateSticker();
                    }}
                    className="p-2 rounded-md border-2 border-dashed border-[#1877F2]/40 hover:border-[#1877F2] bg-[#E7F3FF]/40 hover:bg-[#E7F3FF] flex flex-col items-center justify-center text-[#1877F2] transition-all cursor-pointer min-h-[70px]"
                  >
                    <Plus size={18} className="mb-0.5" />
                    <span className="text-[10px] font-black">新建贴纸</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-[#E4E6EB] dark:border-zinc-800 bg-[#F0F2F5]/50 dark:bg-zinc-800/40 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onOpenCreateSticker();
              }}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] text-xs font-bold text-[#1877F2] rounded-md transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>制作新抠图贴纸</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:bg-gray-100 text-xs font-bold text-[#050505] dark:text-[#E4E6EB] rounded-md transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#1877F2] hover:bg-blue-600 text-xs font-black text-white rounded-md shadow-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
              >
                <Check size={14} />
                <span>保存贴纸编排</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
