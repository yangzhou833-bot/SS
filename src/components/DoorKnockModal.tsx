import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, Zap, Flame, Clock, Navigation, CheckCircle2, User, Volume2, Shield } from 'lucide-react';
import { Friend } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

interface DoorKnockModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onAddNotification?: (title: string, content: string, type: 'message' | 'like' | 'system' | 'radar') => void;
}

interface KnockStackItem {
  id: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  combo: number;
  text: string;
  tier: 'gentle' | 'urgent' | 'frenzy';
  timestamp: number;
}

const QUICK_REPORT_PRESETS = [
  { id: 'on_the_way', emoji: '🏃‍♂️', label: '我在路上了', text: '我在路上了！正在全力加速赶往现场！' },
  { id: '2_mins_left', emoji: '⏱️', label: '还差2分钟到', text: '距离目的地仅剩最后2分钟，马上到达！' },
  { id: 'at_door', emoji: '🚪', label: '已到门外等开门', text: '我已到达门外/教室门口，速来开门汇合！' },
  { id: 'saved_seat', emoji: '🪑', label: '已占好前排座位', text: '已在教室前排黄金C位帮你占好座位，快来！' },
  { id: 'brought_coffee', emoji: '☕', label: '给你带了热饮', text: '顺路给你带了提神咖啡/奶茶，趁热快来喝~' },
  { id: 'hurry_up', emoji: '⚡', label: '老师要点名了', text: '讲师已开启信标无感考勤，马上点名，速来！' },
];

export const DoorKnockModal: React.FC<DoorKnockModalProps> = ({
  friend,
  isOpen,
  onClose,
  onShowToast,
  onAddNotification,
}) => {
  const [knockCount, setKnockCount] = useState(0);
  const [lastKnockTier, setLastKnockTier] = useState<'gentle' | 'urgent' | 'frenzy'>('gentle');
  const [knocksStack, setKnocksStack] = useState<KnockStackItem[]>([]);
  const [isDoorShaking, setIsDoorShaking] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('on_the_way');
  const [customReportText, setCustomReportText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [hasSentReport, setHasSentReport] = useState(false);
  const doorRef = useRef<HTMLDivElement | null>(null);

  // Auto reset combo after idle
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setKnockCount(0);
      setKnocksStack([]);
      setHasSentReport(false);
    }
  }, [isOpen]);

  if (!isOpen || !friend) return null;

  // Determine Knock Tier
  const getKnockTier = (count: number): 'gentle' | 'urgent' | 'frenzy' => {
    if (count <= 2) return 'gentle';
    if (count <= 4) return 'urgent';
    return 'frenzy';
  };

  const currentTier = getKnockTier(knockCount);

  // Trigger Door Knock
  const handleKnock = (e?: React.MouseEvent, overrideMultiplier?: number) => {
    const addCount = overrideMultiplier || 1;
    const nextCount = knockCount + addCount;
    setKnockCount(nextCount);
    const tier = getKnockTier(nextCount);
    setLastKnockTier(tier);

    // Play wood knock sound & haptics
    soundEffects.playWoodKnockSound(tier, nextCount);
    if (tier === 'gentle') {
      haptics.trigger('light');
    } else if (tier === 'urgent') {
      haptics.trigger('medium');
    } else {
      haptics.trigger('warning');
    }

    // Door shake impact animation
    setIsDoorShaking(true);
    setTimeout(() => setIsDoorShaking(false), 180);

    // Calculate spawn coordinates for 3D Floating Knock Gesture ✊ KNOCK!
    let posX = 0;
    let posY = 0;

    if (e && doorRef.current) {
      const rect = doorRef.current.getBoundingClientRect();
      posX = e.clientX - rect.left - 40;
      posY = e.clientY - rect.top - 40;
    } else {
      // Random coordinates around door center
      posX = 60 + (Math.random() - 0.5) * 140;
      posY = 80 + (Math.random() - 0.5) * 120;
    }

    const knockTexts = {
      gentle: ['KNOCK!', '咚咚~', 'TAP!', '轻叩门扉'],
      urgent: ['KNOCK! KNOCK!', '急促敲门!', '速开门!', 'TOK TOK TOK!'],
      frenzy: ['BAM! BAM! 💥', '连环狂敲!!', '我在路上啦!', '速速开门!!', 'RUSH! 🔥'],
    };

    const textList = knockTexts[tier];
    const chosenText = textList[Math.floor(Math.random() * textList.length)];

    const newItem: KnockStackItem = {
      id: `knock-${Date.now()}-${Math.random()}`,
      x: posX,
      y: posY,
      rotate: (Math.random() - 0.5) * 30,
      scale: tier === 'gentle' ? 1 : tier === 'urgent' ? 1.3 : 1.6,
      combo: nextCount,
      text: chosenText,
      tier,
      timestamp: Date.now(),
    };

    setKnocksStack((prev) => [...prev.slice(-8), newItem]);

    // Toast & Notification
    if (nextCount === 1) {
      onShowToast(`🚪 轻叩了【${friend.name}】的门扉 · 提示注意到课/出发`);
    } else if (nextCount === 3) {
      onShowToast(`⚡ 3连急促敲门！正在催问【${friend.name}】「你在路上了吗？」`);
    } else if (nextCount >= 5 && nextCount % 2 === 1) {
      onShowToast(`🔥 连环狂敲 x${nextCount}！夺命连环催【${friend.name}】速速汇合！`);
    }

    // Reset idle timer
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      // Don't fully reset to 0 right away so user sees total, but can decay
    }, 4000);
  };

  // Send Report / Urge Payload
  const handleSendReport = () => {
    const preset = QUICK_REPORT_PRESETS.find((p) => p.id === selectedPreset);
    const content = isCustomMode && customReportText.trim() ? customReportText.trim() : (preset?.text || '我在路上了！马上到！');

    soundEffects.playSuccessSound();
    haptics.trigger('success');
    setHasSentReport(true);

    const tierDesc = currentTier === 'gentle' ? '轻叩敲门' : currentTier === 'urgent' ? '急促敲门 x3' : `连环狂敲 x${knockCount}`;
    onShowToast(`🚪 已向【${friend.name}】发送敲门报备：「${content}」(${tierDesc}) ✨`);

    if (onAddNotification) {
      onAddNotification(
        `向 ${friend.name} 发送了敲门报备`,
        `【${tierDesc}】${content}`,
        'message'
      );
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none pointer-events-auto">
        {/* Modal Window: Facebook Straight-Edge Line Frame UI */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="w-full max-w-md bg-white border border-[#E4E6EB] rounded-md shadow-2xl overflow-hidden flex flex-col text-[#1C1E21]"
        >
          {/* 1. Facebook Style Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E6EB] bg-[#FAFBFD]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xs bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/30 flex items-center justify-center font-bold text-sm shadow-2xs">
                🚪
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                  <span>敲门 Knock-Knock 互动</span>
                  <span className="text-[9.5px] text-[#1877F2] bg-[#E7F3FF] px-1.5 py-0.2 rounded-2xs border border-[#1877F2]/30 font-mono font-bold">
                    催人 & 报备
                  </span>
                </h3>
                <p className="text-[9.5px] text-[#65676B]">
                  连敲升级 · 1敲轻叩 / 3敲急促 / 5+敲连环狂敲
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-xs hover:bg-[#F0F2F5] text-[#65676B] hover:text-[#1C1E21] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* 2. Target Friend Profile Banner */}
          <div className="px-4 py-2 bg-[#F0F7FF] border-b border-[#E4E6EB] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-8 h-8 rounded-full object-cover border border-[#1877F2]/40 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#1C1E21] truncate flex items-center gap-1.5">
                  <span>{friend.name}</span>
                  <span className="text-[9px] text-[#65676B] font-normal truncate">
                    ({friend.locationName || '附近教学区'})
                  </span>
                </div>
                <div className="text-[9px] text-[#65676B] flex items-center gap-2 mt-0.5">
                  <span>距你: <strong className="text-[#1877F2] font-mono">{friend.distance || '120m'}</strong></span>
                  <span>·</span>
                  <span>状态: <strong>{friend.status || '在位'}</strong></span>
                </div>
              </div>
            </div>

            {/* Knock Multiplier Badge */}
            <div className="text-right shrink-0">
              <div className="text-[9px] text-[#65676B] font-bold">已连敲叩门</div>
              <div className={`text-base font-black font-mono leading-none flex items-center justify-end gap-0.5 ${
                currentTier === 'frenzy' ? 'text-amber-600 animate-pulse' : currentTier === 'urgent' ? 'text-[#1877F2]' : 'text-emerald-600'
              }`}>
                <span>x{knockCount}</span>
                <span className="text-[10px]">次</span>
              </div>
            </div>
          </div>

          {/* 3. Centerpiece Interactive Realistic 3D Wooden Door Arena */}
          <div className="p-4 bg-gradient-to-b from-[#F5F6F8] to-[#E9EAEC] border-b border-[#E4E6EB] flex flex-col items-center relative overflow-hidden">
            {/* Interactive Knockable Door Frame */}
            <div
              ref={doorRef}
              onClick={(e) => handleKnock(e)}
              className={`w-60 h-64 sm:w-64 sm:h-72 rounded-md border-4 border-[#5C3A21] bg-[#8B5A2B] shadow-2xl relative cursor-pointer select-none transition-transform duration-100 overflow-hidden ${
                isDoorShaking ? 'scale-[0.98] rotate-[0.8deg]' : 'hover:scale-[1.01]'
              }`}
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #8B5A2B 0px, #7A4B20 12px, #8B5A2B 24px)',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 12px 30px rgba(0,0,0,0.25)',
              }}
              title="点击门板任意处连续暴扣敲门！"
            >
              {/* Door Bevel Panels (Upper & Lower Wooden Panels) */}
              <div className="absolute top-4 left-4 right-4 h-24 border-2 border-[#5C3A21] bg-[#704214]/60 rounded-xs shadow-inner flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                {/* Gold Nameplate */}
                <div className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 text-amber-950 text-[9.5px] font-mono font-black px-2.5 py-0.5 rounded-2xs border border-amber-500 shadow-md flex items-center gap-1">
                  <span>ROOM · {friend.name}</span>
                </div>
                {/* Peephole / Door Viewer */}
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-amber-700 mt-2 shadow-inner" />
              </div>

              {/* Lower Wooden Panel */}
              <div className="absolute bottom-4 left-4 right-4 h-28 border-2 border-[#5C3A21] bg-[#704214]/60 rounded-xs shadow-inner pointer-events-none" />

              {/* Brass Door Handle & Knocker Ring */}
              <div className="absolute right-4 top-32 w-5 h-12 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 rounded-xs border border-amber-800 shadow-lg flex items-center justify-center pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-900" />
              </div>

              {/* Center Brass Ring Knocker */}
              <div className="absolute left-1/2 -translate-x-1/2 top-28 flex flex-col items-center pointer-events-none">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-amber-700 shadow-md flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full border-2 border-amber-900" />
                </div>
                <div className="w-5 h-8 border-3 border-amber-400 rounded-b-full shadow-md -mt-1" />
              </div>

              {/* Tap Hint Banner on Door */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md whitespace-nowrap pointer-events-none flex items-center gap-1">
                <span>✊ 点击门板任意处敲门</span>
              </div>

              {/* Dynamic 3D Floating Stacking Fist Gestures: ✊ KNOCK! */}
              {knocksStack.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{
                    x: item.x,
                    y: item.y,
                    scale: 0.3,
                    opacity: 0,
                    rotate: item.rotate - 20,
                  }}
                  animate={{
                    x: item.x + (Math.random() - 0.5) * 30,
                    y: item.y - 45,
                    scale: [0.3, item.scale, item.scale * 0.9],
                    opacity: [0, 1, 1, 0],
                    rotate: [item.rotate - 20, item.rotate, item.rotate + 10],
                  }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                  className="absolute z-40 pointer-events-none flex flex-col items-center select-none"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Glowing Aura Ring */}
                  <div className={`absolute w-16 h-16 rounded-full blur-md animate-ping ${
                    item.tier === 'frenzy' ? 'bg-amber-400/50' : item.tier === 'urgent' ? 'bg-blue-400/40' : 'bg-yellow-300/30'
                  }`} />

                  {/* 3D Fist Icon */}
                  <div className="text-4xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] transform hover:scale-110">
                    ✊
                  </div>

                  {/* 3D Pop Badge Text */}
                  <div
                    className={`font-black italic px-2 py-0.5 rounded-2xs text-[10px] tracking-tight uppercase shadow-lg border mt-0.5 whitespace-nowrap ${
                      item.tier === 'frenzy'
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white border-yellow-300 shadow-orange-500/50'
                        : item.tier === 'urgent'
                        ? 'bg-[#1877F2] text-white border-blue-300 shadow-blue-500/40'
                        : 'bg-amber-100 text-amber-900 border-amber-400 shadow-amber-300/40'
                    }`}
                  >
                    <span>{item.text} x{item.combo}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Multi-Knock Tier Escalation Status Bar (1敲/3敲/5+敲) */}
            <div className="w-full max-w-sm mt-3 grid grid-cols-3 gap-1.5 text-center">
              {/* Tier 1: 1 敲 (轻叩) */}
              <div
                className={`p-1.5 rounded-xs border text-[9px] transition-all ${
                  currentTier === 'gentle' && knockCount > 0
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs ring-1 ring-emerald-300'
                    : 'bg-white border-[#E4E6EB] text-[#65676B]'
                }`}
              >
                <div className="font-bold flex items-center justify-center gap-0.5">
                  <span>🪵 1-2敲</span>
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded-2xs">轻叩</span>
                </div>
                <div className="text-[8px] mt-0.5 text-[#65676B]">轻声提醒·友好出发</div>
              </div>

              {/* Tier 2: 3 敲 (急促敲门) */}
              <div
                className={`p-1.5 rounded-xs border text-[9px] transition-all ${
                  currentTier === 'urgent'
                    ? 'bg-blue-50 border-[#1877F2] text-[#1877F2] font-bold shadow-2xs ring-1 ring-blue-300'
                    : 'bg-white border-[#E4E6EB] text-[#65676B]'
                }`}
              >
                <div className="font-bold flex items-center justify-center gap-0.5">
                  <span>⚡ 3-4敲</span>
                  <span className="text-[8px] bg-blue-100 text-blue-800 px-1 rounded-2xs">急促</span>
                </div>
                <div className="text-[8px] mt-0.5 text-[#65676B]">急促催问·快到时间</div>
              </div>

              {/* Tier 3: 5+ 敲 (连环狂敲) */}
              <div
                className={`p-1.5 rounded-xs border text-[9px] transition-all ${
                  currentTier === 'frenzy'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-2xs ring-1 ring-amber-400 animate-pulse'
                    : 'bg-white border-[#E4E6EB] text-[#65676B]'
                }`}
              >
                <div className="font-bold flex items-center justify-center gap-0.5">
                  <span>🔥 5+敲</span>
                  <span className="text-[8px] bg-amber-400 text-amber-950 px-1 rounded-2xs font-mono">狂敲</span>
                </div>
                <div className="text-[8px] mt-0.5 text-[#65676B]">夺命狂催·暴风报备</div>
              </div>
            </div>

            {/* Quick Multiplier Knock Action Toolbar */}
            <div className="w-full max-w-sm mt-2.5 flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={(e) => handleKnock(e, 1)}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold rounded-xs cursor-pointer shadow-2xs transition-colors flex items-center justify-center gap-1"
              >
                <span>✊ 轻叩 +1</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleKnock(e, 3)}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-blue-50 text-[#1877F2] border border-[#1877F2]/40 text-[10px] font-bold rounded-xs cursor-pointer shadow-2xs transition-colors flex items-center justify-center gap-1"
              >
                <span>⚡ 急促 +3</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleKnock(e, 5)}
                className="flex-1 py-1.5 px-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-amber-950 border border-amber-500 text-[10px] font-black rounded-xs cursor-pointer shadow-2xs transition-transform active:scale-95 flex items-center justify-center gap-1"
              >
                <span>🔥 狂敲 +5</span>
              </button>
            </div>
          </div>

          {/* 4. Quick Report & Urge Preset Chips Selection */}
          <div className="p-3.5 space-y-2.5 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1C1E21] flex items-center gap-1">
                <span>报备与催促台词 (同步随敲门广播)</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCustomMode((prev) => !prev)}
                className="text-[9.5px] text-[#1877F2] font-bold hover:underline cursor-pointer"
              >
                {isCustomMode ? '切换推荐台词' : '自定义文字'}
              </button>
            </div>

            {/* Preset Grid Chips */}
            {!isCustomMode ? (
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_REPORT_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(preset.id);
                        haptics.trigger('light');
                      }}
                      className={`p-2 rounded-xs border text-left transition-all cursor-pointer shadow-2xs flex items-start gap-1.5 ${
                        isSelected
                          ? 'bg-[#E7F3FF] border-[#1877F2] ring-1 ring-[#1877F2] text-[#1877F2]'
                          : 'bg-[#FAFBFD] border-[#E4E6EB] hover:border-[#1877F2] text-[#1C1E21]'
                      }`}
                    >
                      <span className="text-sm shrink-0 mt-0.5">{preset.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-[10.5px] font-bold leading-tight">{preset.label}</div>
                        <div className="text-[8.5px] text-[#65676B] truncate mt-0.5 leading-tight">
                          {preset.text}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={customReportText}
                  onChange={(e) => setCustomReportText(e.target.value)}
                  placeholder="输入自定义敲门报备台词（例如：我到楼下了，带了早餐给你~）"
                  className="w-full bg-[#FAFBFD] border border-[#E4E6EB] focus:border-[#1877F2] rounded-xs px-3 py-2 text-xs text-[#1C1E21] focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* 5. Footer Action Buttons */}
          <div className="p-3 bg-[#FAFBFD] border-t border-[#E4E6EB] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-white hover:bg-gray-100 text-[#65676B] border border-[#CED0D4] text-xs font-bold rounded-xs cursor-pointer transition-colors"
            >
              取消
            </button>

            <button
              type="button"
              disabled={hasSentReport}
              onClick={handleSendReport}
              className={`flex-1 py-2 px-4 text-white text-xs font-bold rounded-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                hasSentReport
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1877F2] hover:bg-[#166FE5]'
              }`}
            >
              {hasSentReport ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>已成功发送敲门报备！</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>发送敲门报备 (附连敲 x{knockCount || 1})</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
