import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ghost,
  Clock,
  Sun,
  Moon,
  Shield,
  X,
  Check,
  Users,
  Sliders,
  Sparkles,
  Calendar,
  Eye,
  EyeOff,
  Star,
  Heart,
  CheckCircle2,
  Info
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';
import { Friend, StealthCustomSchedule } from '../types';

interface StealthDurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDuration: (duration: '3h' | '12h' | 'tomorrow' | 'custom_schedule' | 'cancel_stealth', scheduleData?: StealthCustomSchedule) => void;
  isCurrentlyStealth: boolean;
  friends?: Friend[];
  customSchedule?: StealthCustomSchedule;
  onSaveSchedule?: (schedule: StealthCustomSchedule) => void;
}

export const StealthDurationModal: React.FC<StealthDurationModalProps> = ({
  isOpen,
  onClose,
  onSelectDuration,
  isCurrentlyStealth,
  friends = [],
  customSchedule,
  onSaveSchedule,
}) => {
  // Discrete active hours state (0 to 23)
  const [activeHours, setActiveHours] = useState<number[]>(() => {
    if (customSchedule) {
      const start = customSchedule.startHour ?? 12;
      const end = customSchedule.endHour ?? 14;
      const hrs: number[] = [];
      if (start <= end) {
        for (let h = start; h < end; h++) hrs.push(h);
      } else {
        for (let h = start; h < 24; h++) hrs.push(h);
        for (let h = 0; h < end; h++) hrs.push(h);
      }
      return hrs.length > 0 ? hrs : [12, 13];
    }
    return [12, 13]; // Default lunch 2 hours
  });

  const [allowAllFriends, setAllowAllFriends] = useState<boolean>(customSchedule?.allowAllFriends ?? true);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(
    customSchedule?.selectedFriendIds && customSchedule.selectedFriendIds.length > 0
      ? customSchedule.selectedFriendIds
      : friends.map((f) => f.id)
  );

  // Preset multi-select / single-select state
  const [selectMode, setSelectMode] = useState<'single' | 'multi'>('multi');
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>(['noon']);

  // Quick presets including 中午两小时, 晚上两小时, and User Custom Preset cards
  const [quickPresets, setQuickPresets] = useState([
    { id: 'noon', label: '中午 12:00 - 14:00', hours: [12, 13], desc: '午间休闲 · 开放 2h', isCustom: false },
    { id: 'evening', label: '晚上 19:00 - 21:00', hours: [19, 20], desc: '夜间社交 · 开放 2h', isCustom: false },
    { id: 'custom1', label: '自定义预设一', hours: [8, 9], desc: '08:00 - 10:00 · 可更新选区', isCustom: true },
    { id: 'custom2', label: '自定义预设二', hours: [21, 22], desc: '21:00 - 23:00 · 可更新选区', isCustom: true },
  ]);

  // Sync with prop when opened
  useEffect(() => {
    if (isOpen && customSchedule) {
      const start = customSchedule.startHour ?? 12;
      const end = customSchedule.endHour ?? 14;
      const hrs: number[] = [];
      if (start <= end) {
        for (let h = start; h < end; h++) hrs.push(h);
      } else {
        for (let h = start; h < 24; h++) hrs.push(h);
        for (let h = 0; h < end; h++) hrs.push(h);
      }
      setActiveHours(hrs.length > 0 ? hrs : [12, 13]);
      setAllowAllFriends(customSchedule.allowAllFriends ?? true);
      if (customSchedule.selectedFriendIds && customSchedule.selectedFriendIds.length > 0) {
        setSelectedFriendIds(customSchedule.selectedFriendIds);
      } else if (friends.length > 0) {
        setSelectedFriendIds(friends.map((f) => f.id));
      }
    }
  }, [isOpen, customSchedule, friends]);

  if (!isOpen) return null;

  const currentSystemHour = new Date().getHours();
  const currentSystemMinute = new Date().getMinutes();

  // Helper to format active hours into clean range string
  const formatActiveHoursText = (hours: number[]) => {
    if (!hours || hours.length === 0) return '全天隐身';
    if (hours.length === 24) return '00:00 ~ 24:00 (全天)';

    const sorted = Array.from(new Set(hours)).sort((a: number, b: number) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i <= sorted.length; i++) {
      if (i < sorted.length && sorted[i] === prev + 1) {
        prev = sorted[i];
      } else {
        const endHourVal = (prev + 1) % 24;
        const endHourStr = endHourVal === 0 ? '24' : String(endHourVal).padStart(2, '0');
        const startHourStr = String(start).padStart(2, '0');
        ranges.push(`${startHourStr}:00 ~ ${endHourStr}:00`);
        if (i < sorted.length) {
          start = sorted[i];
          prev = sorted[i];
        }
      }
    }

    return ranges.join(', ');
  };

  // Calculate if current time is inside open window
  const isCurrentlyInOpenWindow = activeHours.includes(currentSystemHour);
  const openHoursDuration = activeHours.length;
  const stealthHoursDuration = 24 - openHoursDuration;

  const durationOptions = [
    {
      id: '3h' as const,
      title: '保持 3 小时',
      shortTitle: '3 小时',
      subtitle: '适合短暂专注或个人休息',
      shortDesc: '专注休息',
      icon: Clock,
      badge: '推荐',
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400',
    },
    {
      id: '12h' as const,
      title: '保持 12 小时',
      shortTitle: '12 小时',
      subtitle: '半天时间内对好友显示最后活跃状态',
      shortDesc: '半日隐身',
      icon: Moon,
      badge: '半日',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-400',
    },
    {
      id: 'tomorrow' as const,
      title: '直到明天早晨',
      shortTitle: '直到明天',
      subtitle: '明天 08:00 自动恢复实时位置共享',
      shortDesc: '次日08:00',
      icon: Sun,
      badge: '通宵',
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400',
    },
  ];

  const handleToggleHour = (h: number) => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    setActiveHours((prev) => {
      if (prev.includes(h)) {
        if (prev.length === 1) return prev; // keep at least 1 hour
        return prev.filter((item) => item !== h);
      } else {
        return [...prev, h].sort((a, b) => a - b);
      }
    });
  };

  const handleTogglePreset = (preset: typeof quickPresets[0]) => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    if (selectMode === 'single') {
      setSelectedPresetIds([preset.id]);
      setActiveHours([...preset.hours]);
    } else {
      let newSelected: string[];
      if (selectedPresetIds.includes(preset.id)) {
        if (selectedPresetIds.length === 1) return; // Keep at least one
        newSelected = selectedPresetIds.filter((id) => id !== preset.id);
      } else {
        newSelected = [...selectedPresetIds, preset.id];
      }
      setSelectedPresetIds(newSelected);

      const activePresets = quickPresets.filter((p) => newSelected.includes(p.id));
      const combinedHours = Array.from(new Set(activePresets.flatMap((p) => p.hours))).sort((a: number, b: number) => a - b);
      setActiveHours(combinedHours.length > 0 ? combinedHours : preset.hours);
    }
  };

  const handleSaveCurrentToCustomPreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.trigger('success');
    soundEffects.playTapSound();
    const rangeText = formatActiveHoursText(activeHours);
    setQuickPresets((prev) =>
      prev.map((p) => {
        if (p.id === presetId) {
          return {
            ...p,
            hours: [...activeHours],
            desc: `${rangeText} · 已设置为当前选区`,
          };
        }
        return p;
      })
    );
  };

  const handleToggleFriend = (friendId: string) => {
    haptics.trigger('light');
    setSelectedFriendIds((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const handleSelectAllFriends = () => {
    haptics.trigger('light');
    setSelectedFriendIds(friends.map((f) => f.id));
  };

  const handleSelectCloseFriendsOnly = () => {
    haptics.trigger('light');
    const closeFriends = friends.filter((f) => f.isCloseFriend || f.relationship === 'close');
    setSelectedFriendIds(closeFriends.length > 0 ? closeFriends.map((f) => f.id) : friends.slice(0, 2).map((f) => f.id));
  };

  const handleSelectFamilyOnly = () => {
    haptics.trigger('light');
    const familyFriends = friends.filter((f) => f.isFamily || f.relationship === 'family');
    setSelectedFriendIds(familyFriends.length > 0 ? familyFriends.map((f) => f.id) : friends.slice(0, 1).map((f) => f.id));
  };

  const handleApplyCustomSchedule = () => {
    haptics.trigger('success');
    soundEffects.playTapSound();
    const sortedHours = [...activeHours].sort((a, b) => a - b);
    const startHour = sortedHours.length > 0 ? sortedHours[0] : 12;
    const endHour = sortedHours.length > 0 ? (sortedHours[sortedHours.length - 1] + 1) % 24 : 14;

    const schedule: StealthCustomSchedule = {
      enabled: true,
      startHour,
      endHour,
      allowAllFriends,
      selectedFriendIds: allowAllFriends ? friends.map((f) => f.id) : selectedFriendIds,
    };
    if (onSaveSchedule) {
      onSaveSchedule(schedule);
    }
    onSelectDuration('custom_schedule', schedule);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Sheet Sliding Up from bottom */}
        <motion.div
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0.8 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white rounded-t-2xl p-4 sm:p-5 shadow-2xl border-t border-[#E4E6EB] z-10 select-none max-h-[88vh] flex flex-col"
        >
          {/* Header pill handle */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 shrink-0" />

          {/* Modal Title & Close */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Ghost size={22} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#050505] flex items-center gap-1.5">
                  幽灵模式设置
                  <span className="text-[10.5px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                    {isCurrentlyStealth ? '当前幽灵生效中' : '隐身与定时上线'}
                  </span>
                </h3>
                <p className="text-xs text-[#65676B] mt-0.5">
                  幽灵模式下气泡收缩，好友视角将仅显示「最近活跃」
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              aria-label="关闭"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Fixed Duration 3 Buttons (Facebook Straight-Edge Style) */}
          <div className="grid grid-cols-3 gap-2 mb-3 shrink-0">
            {durationOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    haptics.trigger('light');
                    soundEffects.playTapSound();
                    onSelectDuration(opt.id);
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-md border transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95 text-center ${opt.color}`}
                >
                  <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-2xs border border-current/20 mb-1">
                    <Icon size={14} />
                  </div>
                  <span className="text-xs font-bold leading-tight text-[#050505]">
                    {opt.shortTitle}
                  </span>
                  <span className="text-[9.5px] opacity-80 mt-0.5 leading-tight">
                    {opt.shortDesc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Schedule & Visible Friends Content Area */}
          <div className="overflow-y-auto flex-1 pr-0.5 space-y-3 pb-2">
            <div className="space-y-3">
              {/* 1. Time Span Card */}
              <div className="bg-white border border-[#E4E6EB] rounded-md p-3.5 shadow-2xs space-y-3 hover:border-[#1877F2] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Calendar size={15} className="text-[#1877F2]" />
                    <span className="text-xs font-bold text-[#050505]">定位开放时间</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#E7F3FF] text-[#1877F2] px-2 py-0.5 rounded-full border border-[#1877F2]/20">
                    开放 {openHoursDuration}h · 幽灵 {stealthHoursDuration}h
                  </span>
                </div>

                {/* Visual 24-Hour Bar Representation (Discrete Independent Hour Toggle) */}
                <div className="space-y-1 pt-1">
                  {/* Top Row: Even Hours (双数时间在模块上方显示，带有细线指向对应位置) */}
                  <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-0 text-[7.5px] font-medium text-[#65676B] select-none">
                    {Array.from({ length: 24 }).map((_, h) => (
                      <div key={`even-${h}`} className="flex flex-col items-center justify-end overflow-visible leading-none">
                        {h % 2 === 0 ? (
                          <>
                            <span className="whitespace-nowrap scale-90">{String(h).padStart(2, '0')}:00</span>
                            <div className="w-[1px] h-1.5 bg-[#65676B]/50 mt-0.5" />
                          </>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {/* 24 Segments Bar - Discrete Toggle */}
                  <div className="h-6 w-full bg-purple-100 rounded-md overflow-hidden flex border border-[#E4E6EB] relative shadow-inner">
                    {Array.from({ length: 24 }).map((_, h) => {
                      const isOpen = activeHours.includes(h);
                      const isCurrent = h === currentSystemHour;

                      return (
                        <div
                          key={`hour-seg-${h}`}
                          onClick={() => handleToggleHour(h)}
                          className={`flex-1 h-full cursor-pointer transition-colors relative border-r border-white/20 last:border-r-0 ${
                            isOpen ? 'bg-[#31A24C] hover:bg-[#2b9143]' : 'bg-purple-900/80 hover:bg-purple-800'
                          }`}
                          title={`${String(h).padStart(2, '0')}:00 - ${isOpen ? '开放上线' : '幽灵隐身'} (点击独立切换)`}
                        >
                          {isCurrent && (
                            <div className="absolute inset-0 border-2 border-amber-400 z-10 animate-pulse flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Row: Odd Hours (单数时间在模块下方显示，带有细线指向对应位置) */}
                  <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-0 text-[7.5px] font-medium text-[#65676B] select-none">
                    {Array.from({ length: 24 }).map((_, h) => (
                      <div key={`odd-${h}`} className="flex flex-col items-center justify-start overflow-visible leading-none">
                        {h % 2 !== 0 ? (
                          <>
                            <div className="w-[1px] h-1.5 bg-[#65676B]/50 mb-0.5" />
                            <span className="whitespace-nowrap scale-90">{String(h).padStart(2, '0')}:00</span>
                          </>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {/* Current time tracker */}
                  <div className="flex items-center justify-between text-[10px] text-[#65676B] pt-1">
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
                      <span>当前时间：{String(currentSystemHour).padStart(2, '0')}:{String(currentSystemMinute).padStart(2, '0')}</span>
                      <span className={`font-bold ml-1 ${isCurrentlyInOpenWindow ? 'text-[#31A24C]' : 'text-purple-600'}`}>
                        ({isCurrentlyInOpenWindow ? '处于开放上线时段内' : '处于幽灵模式中'})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-0.5 text-emerald-700">
                        <span className="w-2 h-2 rounded-sm bg-[#31A24C] inline-block" />
                        <span>开放</span>
                      </span>
                      <span className="flex items-center space-x-0.5 text-purple-700">
                        <span className="w-2 h-2 rounded-sm bg-purple-900/80 inline-block" />
                        <span>幽灵</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Presets Section: 中午两小时, 晚上两小时, 其余用户自定义 */}
                <div className="space-y-2 pt-2 border-t border-[#E4E6EB]">
                  {/* Title & Mode Switcher */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#050505] flex items-center gap-1">
                      <span>定位开放时段预设</span>
                      <span className="text-[9.5px] font-normal text-[#65676B]">（点击独立应用或多选组合）</span>
                    </span>
                    <div className="flex items-center bg-[#F0F2F5] p-0.5 rounded-md border border-[#E4E6EB]">
                      <button
                        type="button"
                        onClick={() => {
                          haptics.trigger('light');
                          setSelectMode('single');
                          if (selectedPresetIds.length > 1) {
                            setSelectedPresetIds([selectedPresetIds[0]]);
                          }
                        }}
                        className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded transition-all cursor-pointer ${
                          selectMode === 'single'
                            ? 'bg-[#1877F2] text-white shadow-2xs'
                            : 'text-[#65676B] hover:text-[#050505]'
                        }`}
                      >
                        单选
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          haptics.trigger('light');
                          setSelectMode('multi');
                        }}
                        className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded transition-all cursor-pointer ${
                          selectMode === 'multi'
                            ? 'bg-[#1877F2] text-white shadow-2xs'
                            : 'text-[#65676B] hover:text-[#050505]'
                        }`}
                      >
                        多选
                      </button>
                    </div>
                  </div>

                  {/* Preset Buttons Layout */}
                  <div className="space-y-1.5">
                    {/* Top Row: 中午两小时, 晚上两小时 */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {quickPresets.slice(0, 2).map((preset) => {
                        const isSelected = selectedPresetIds.includes(preset.id);
                        return (
                          <button
                            key={`top-preset-${preset.id}`}
                            type="button"
                            onClick={() => handleTogglePreset(preset)}
                            className={`p-2 rounded-md border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] ring-1 ring-[#1877F2]/30 shadow-2xs'
                                : 'bg-[#F0F2F5]/70 text-[#050505] border-[#E4E6EB] hover:border-[#1877F2]'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10.5px] font-black truncate">{preset.label}</span>
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-extrabold ${
                                  isSelected ? 'bg-[#1877F2] border-[#1877F2] text-white' : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && '✓'}
                              </span>
                            </div>
                            <span className="text-[9px] opacity-80 mt-1 font-medium">{preset.desc}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Bottom Row: 用户自定义预设卡片 (提供设为当前选区按钮) */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {quickPresets.slice(2).map((preset) => {
                        const isSelected = selectedPresetIds.includes(preset.id);
                        return (
                          <div
                            key={`custom-preset-${preset.id}`}
                            onClick={() => handleTogglePreset(preset)}
                            className={`p-2 rounded-md border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                              isSelected
                                ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] ring-1 ring-[#1877F2]/30 shadow-2xs'
                                : 'bg-[#F0F2F5]/70 text-[#050505] border-[#E4E6EB] hover:border-[#1877F2]'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10.5px] font-black truncate">{preset.label}</span>
                              <div className="flex items-center space-x-1">
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-extrabold ${
                                    isSelected ? 'bg-[#1877F2] border-[#1877F2] text-white' : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  {isSelected && '✓'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[9px]">
                              <span className="opacity-80 font-medium truncate max-w-[100px]">{preset.desc}</span>
                              <button
                                type="button"
                                onClick={(e) => handleSaveCurrentToCustomPreset(preset.id, e)}
                                className="px-1.5 py-0.5 rounded bg-white/80 hover:bg-[#1877F2] hover:text-white border border-[#E4E6EB] text-[8.5px] font-bold text-[#1877F2] transition-colors shrink-0"
                                title="将当前24小时轴上的选择保存为此预设"
                              >
                                存当前选区
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Select Visible Friends Card */}
              <div className="bg-white border border-[#E4E6EB] rounded-md p-3.5 shadow-2xs space-y-3 hover:border-[#1877F2] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Users size={15} className="text-[#1877F2]" />
                    <span className="text-xs font-bold text-[#050505]">开放时段内可见好友</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        haptics.trigger('light');
                        setAllowAllFriends(true);
                        setSelectedFriendIds(friends.map((f) => f.id));
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        allowAllFriends
                          ? 'bg-[#1877F2] text-white border-[#1877F2]'
                          : 'bg-white text-[#65676B] border-[#E4E6EB]'
                      }`}
                    >
                      全部好友 ({friends.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        haptics.trigger('light');
                        setAllowAllFriends(false);
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        !allowAllFriends
                          ? 'bg-[#1877F2] text-white border-[#1877F2]'
                          : 'bg-white text-[#65676B] border-[#E4E6EB]'
                      }`}
                    >
                      指定好友 ({selectedFriendIds.length})
                    </button>
                  </div>
                </div>

                {/* If specific friends selected, show quick chips and friend list */}
                {!allowAllFriends && (
                  <div className="space-y-2 pt-1 border-t border-[#E4E6EB]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] text-[#65676B]">快速选择圈子:</span>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={handleSelectAllFriends}
                          className="text-[9.5px] font-bold px-1.5 py-0.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded border border-[#E4E6EB] cursor-pointer"
                        >
                          全选
                        </button>
                        <button
                          type="button"
                          onClick={handleSelectCloseFriendsOnly}
                          className="text-[9.5px] font-bold px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded border border-amber-200 cursor-pointer flex items-center space-x-0.5"
                        >
                          <Star size={11} className="shrink-0" />
                          <span>仅密友</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSelectFamilyOnly}
                          className="text-[9.5px] font-bold px-1.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 cursor-pointer flex items-center space-x-0.5"
                        >
                          <Heart size={11} className="shrink-0" />
                          <span>仅家人</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFriendIds([])}
                          className="text-[9.5px] font-bold px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border border-gray-200 cursor-pointer"
                        >
                          清空
                        </button>
                      </div>
                    </div>

                    {/* Friends Grid */}
                    <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                      {friends.map((friend) => {
                        const isSelected = selectedFriendIds.includes(friend.id);
                        return (
                          <div
                            key={friend.id}
                            onClick={() => handleToggleFriend(friend.id)}
                            className={`p-1.5 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#E7F3FF] border-[#1877F2]'
                                : 'bg-white border-[#E4E6EB] hover:border-gray-300 opacity-70'
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 min-w-0">
                              <img
                                src={friend.avatar}
                                alt={friend.name}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <div className="text-[10.5px] font-bold text-[#050505] truncate">
                                  {friend.name}
                                </div>
                                <div className="text-[8px] text-[#65676B] truncate">
                                  {friend.isCloseFriend ? '⭐ 密友' : friend.isFamily ? '🛡️ 家人' : '好友'}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-[#1877F2] border-[#1877F2] text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check size={10} strokeWidth={3} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Rule Note Banner */}
              <div className="p-2.5 bg-blue-50/70 border border-[#1877F2]/20 rounded-md flex items-start space-x-2 text-[10px] text-[#1c1e21]">
                <Info size={14} className="text-[#1877F2] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-[#1877F2]">全自动隐身规则：</strong>
                  系统将在 <strong>{formatActiveHoursText(activeHours)}</strong> 开放上线并向所选好友显示实时定位；其余 <strong>{stealthHoursDuration} 小时</strong>将全自动保持幽灵隐身状态。
                </p>
              </div>
            </div>
          </div>

          {/* Action Bottom Controls */}
          <div className="pt-2 border-t border-[#E4E6EB] shrink-0 space-y-2">
            <button
              type="button"
              id="apply-custom-stealth-btn"
              onClick={handleApplyCustomSchedule}
              className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166fe5] active:scale-98 text-white font-bold rounded-md text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <CheckCircle2 size={15} />
              <span>启用 24小时定时幽灵规则 ({formatActiveHoursText(activeHours)} 开放)</span>
            </button>

            {isCurrentlyStealth ? (
              <button
                type="button"
                onClick={() => {
                  haptics.trigger('warning');
                  soundEffects.playTapSound();
                  onSelectDuration('cancel_stealth');
                }}
                className="w-full py-2 rounded-md bg-[#F0F2F5] hover:bg-rose-50 hover:text-rose-600 border border-[#E4E6EB] text-[#050505] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Shield size={14} className="text-[#1877F2]" />
                <span>立即关闭幽灵模式（0.3s 弹入恢复实时位置）</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-1.5 text-center text-xs font-medium text-[#65676B] hover:text-[#050505] transition-colors cursor-pointer"
              >
                暂不开启
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
