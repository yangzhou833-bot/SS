import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Plus, Bell, Calendar as CalendarIcon, Ghost, BookOpen, X, ArrowLeft, Orbit, Sparkles, Moon, Sun, BatteryCharging, Zap, Settings, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import './map-home-h1.css';

interface TopBarProps {
  currentTab: 'home' | 'chat' | 'teams' | 'discover' | 'stellar' | 'profile' | 'calendar';
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onOpenAdd: () => void;
  onOpenNotifications: () => void;
  onOpenCalendar?: () => void;
  onOpenTextCenter?: () => void;
  onOpenDocumentCenter?: () => void;
  onBack?: () => void;
  isStealthMode?: boolean;
  onToggleStealth?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isPowerSaverMode?: boolean;
  onTogglePowerSaver?: () => void;
  unreadNotificationsCount: number;
  isCourseAppOpen?: boolean;
  onCloseCourseApp?: () => void;
  onOpenAddCourse?: () => void;
  isFamilyCareOpen?: boolean;
  onCloseFamilyCare?: () => void;
  familyCareSafetyStatusText?: string;
  familyCareSafetyStatus?: 'safe' | 'warning' | 'danger' | 'normal';
  familyCareUnreadCount?: number;
  onOpenFamilyCareSettings?: () => void;
  familyTimeRange?: 'realtime' | 'today' | 'history';
  onChangeFamilyTimeRange?: (range: 'realtime' | 'today' | 'history') => void;
}

interface FacebookRippleButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  title?: string;
  ariaLabel?: string;
  children: React.ReactNode;
  variant?: 'light' | 'primary' | 'purple' | 'cosmic' | 'cosmic-primary' | 'dark' | 'amber';
}

const FacebookRippleButton: React.FC<FacebookRippleButtonProps> = ({
  onClick,
  className = '',
  title,
  ariaLabel,
  children,
  variant = 'light',
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = { id: Date.now() + Math.random(), x, y, size };
    setRipples((prev) => [...prev.slice(-3), newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    haptics.trigger('light');
    soundEffects.playTapSound();

    if (onClick) {
      onClick(e);
    }
  };

  const baseVariant =
    variant === 'cosmic-primary'
      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
      : variant === 'cosmic'
      ? 'bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-zinc-900 text-cyan-600 dark:text-cyan-400 border border-[#E4E6EB] dark:border-zinc-800 shadow-2xs'
      : variant === 'primary'
      ? 'bg-[#1877F2] hover:bg-blue-600 text-white shadow-2xs'
      : variant === 'purple'
      ? 'bg-white dark:bg-black hover:bg-purple-50 dark:hover:bg-zinc-900 text-purple-600 dark:text-purple-400 border border-[#E4E6EB] dark:border-zinc-800 shadow-2xs'
      : variant === 'amber'
      ? 'bg-white dark:bg-black hover:bg-amber-50 dark:hover:bg-zinc-900 text-amber-600 dark:text-amber-400 border border-[#E4E6EB] dark:border-zinc-800 shadow-2xs'
      : variant === 'dark'
      ? 'bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-zinc-900 text-amber-500 dark:text-amber-400 border border-[#E4E6EB] dark:border-zinc-800 shadow-2xs'
      : 'bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-zinc-900 text-[#050505] dark:text-white border border-[#E4E6EB] dark:border-zinc-800 shadow-2xs';

  const rippleColor =
    variant === 'cosmic' || variant === 'cosmic-primary'
      ? 'bg-cyan-300/40'
      : variant === 'primary' || variant === 'purple' || variant === 'amber'
      ? 'bg-white/35'
      : 'bg-[#1877F2]/25';

  return (
    <button
      onClick={handleClick}
      className={`stellar-topbar-button relative overflow-hidden w-9 h-9 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer select-none shrink-0 ${baseVariant} ${className}`}
      title={title}
      aria-label={ariaLabel}
      data-variant={variant}
    >
      {/* Expanding Ripple Effect */}
      {ripples.map((ripple, rIdx) => (
        <span
          key={`ripple-${ripple.id}-${rIdx}`}
          className={`absolute rounded-full pointer-events-none animate-ping ${rippleColor}`}
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
            animationDuration: '500ms',
            animationTimingFunction: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
          }}
        />
      ))}
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </button>
  );
};

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onOpenSettings,
  onOpenSearch,
  onOpenAdd,
  onOpenNotifications,
  onOpenCalendar,
  onOpenTextCenter,
  onOpenDocumentCenter,
  onBack,
  isStealthMode = false,
  onToggleStealth,
  isDarkMode = false,
  onToggleDarkMode,
  isPowerSaverMode = false,
  onTogglePowerSaver,
  unreadNotificationsCount,
  isCourseAppOpen = false,
  onCloseCourseApp,
  onOpenAddCourse,
  isFamilyCareOpen = false,
  onCloseFamilyCare,
  familyCareSafetyStatusText = '有延迟提醒',
  familyCareSafetyStatus = 'warning',
  familyCareUnreadCount = 2,
  onOpenFamilyCareSettings,
  familyTimeRange = 'realtime',
  onChangeFamilyTimeRange,
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isStellar = currentTab === 'stellar' && !isCourseAppOpen;
  const isMapHome = currentTab === 'home' && !isCourseAppOpen && !isFamilyCareOpen;

  // Auto-shrink when clicking outside anywhere on the page or pressing Escape
  useEffect(() => {
    if (!isSearchExpanded) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchExpanded]);

  // Focus input whenever expanded
  useEffect(() => {
    if (isSearchExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchExpanded]);

  const getModuleName = () => {
    if (isCourseAppOpen) return '高校教学管理';
    if (isFamilyCareOpen) return '家庭守护舱';
    switch (currentTab) {
      case 'home':
        return '地图';
      case 'chat':
        return '聊天';
      case 'teams':
        return '小组';
      case 'discover':
        return '发现';
      case 'stellar':
        return 'Stellar 盲盒宇宙';
      case 'profile':
        return '我的';
      case 'calendar':
        return '活动日历';
      default:
        return '地图';
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      onOpenSearch();
    }
  };

  return (
    <>
      {/* Click-outside backdrop overlay to dismiss search from anywhere on the screen */}
      {isSearchExpanded && (
        <div
          id="topbar-search-backdrop"
          onClick={() => {
            haptics.trigger('light');
            setIsSearchExpanded(false);
          }}
          className="fixed inset-0 z-35 bg-black/10 transition-opacity duration-200 cursor-pointer"
        />
      )}

      <header
        ref={searchContainerRef}
        className={`stellar-topbar ${isMapHome ? 'stellar-home-topbar' : ''} w-full shrink-0 h-14 px-3 flex items-center justify-between z-40 select-none font-sans bg-white dark:bg-black border-b border-[#E4E6EB] dark:border-zinc-800 shadow-2xs text-[#050505] dark:text-white relative`}
      >
        <AnimatePresence mode="wait">
          {!isSearchExpanded || isCourseAppOpen ? (
            <motion.div
              key="standard-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="stellar-topbar-row flex items-center justify-between w-full"
            >
              {/* Left: Menu Drawer & Active Module Name */}
              <div className="stellar-topbar-left flex items-center space-x-2 shrink-0">
                {isCourseAppOpen ? (
                  <button
                    id="course-app-topbar-back-btn"
                    onClick={() => {
                      haptics.trigger('light');
                      if (onCloseCourseApp) onCloseCourseApp();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E7F3FF] dark:bg-blue-950/60 hover:bg-[#DBECFE] dark:hover:bg-blue-900/60 active:scale-95 text-[#1877F2] font-bold text-xs transition-all cursor-pointer border border-[#1877F2]/30 shadow-2xs shrink-0"
                    title="返回地图"
                    aria-label="返回地图"
                  >
                    <ArrowLeft size={16} className="stroke-[2.5]" />
                    <span>返回</span>
                  </button>
                ) : isFamilyCareOpen ? (
                  <button
                    onClick={() => {
                      haptics.trigger('light');
                      if (onCloseFamilyCare) onCloseFamilyCare();
                    }}
                    className="w-9.5 h-9.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:scale-90 flex items-center justify-center text-[#1877F2] transition-all cursor-pointer border border-[#1877F2]/20 shrink-0"
                    title="返回地图"
                    aria-label="返回"
                  >
                    <ArrowLeft size={19} className="stroke-[2.5]" />
                  </button>
                ) : currentTab === 'calendar' ? (
                  <button
                    onClick={() => {
                      haptics.trigger('light');
                      if (onBack) {
                        onBack();
                      } else if (onOpenCalendar) {
                        onOpenCalendar();
                      }
                    }}
                    className="w-9.5 h-9.5 rounded-full bg-[#F0F2F5] dark:bg-zinc-900 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 active:scale-90 flex items-center justify-center text-[#050505] dark:text-white transition-all cursor-pointer shrink-0 border border-[#E4E6EB] dark:border-zinc-800"
                    title="返回上一页"
                    aria-label="返回上一页"
                  >
                    <ArrowLeft size={19} className="stroke-[2.2] text-[#1877F2]" />
                  </button>
                ) : currentTab === 'chat' ? (
                  <button
                    onClick={() => {
                      haptics.trigger('light');
                      if (onBack) {
                        onBack();
                      }
                    }}
                    className="w-9.5 h-9.5 rounded-full bg-[#F0F2F5] dark:bg-zinc-900 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 active:scale-90 flex items-center justify-center text-[#050505] dark:text-white transition-all cursor-pointer shrink-0 border border-[#E4E6EB] dark:border-zinc-800"
                    title="返回上一页"
                    aria-label="返回上一页"
                  >
                    <ArrowLeft size={19} className="stroke-[2.2] text-[#1877F2]" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      haptics.trigger('light');
                      onOpenSettings();
                    }}
                    className="stellar-topbar-button w-9.5 h-9.5 rounded-full active:scale-90 flex items-center justify-center transition-all cursor-pointer shrink-0 bg-[#F0F2F5] dark:bg-zinc-900 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 text-[#050505] dark:text-white border border-[#E4E6EB] dark:border-zinc-800"
                    title="打开设置侧栏"
                    aria-label="打开设置"
                  >
                    <SlidersHorizontal size={18} className={isMapHome ? "stroke-[2.2]" : "stroke-[2.2] text-[#050505] dark:text-white"} />
                  </button>
                )}

                {!isMapHome && <div className="stellar-topbar-title flex items-center gap-1.5 min-w-0">
                  <span
                    className="text-sm sm:text-base font-black tracking-tight whitespace-nowrap text-[#050505]"
                  >
                    {isStellar ? 'Stellar' : getModuleName()}
                  </span>
                  {isStellar && (
                    <div className="hidden xs:flex items-center gap-1">
                      <span className="text-[9.5px] bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/30 px-1.5 py-0.2 rounded-2xs font-bold whitespace-nowrap">
                        盲盒宇宙
                      </span>
                      <span className="text-[9.5px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-2xs font-bold whitespace-nowrap">
                        技能库
                      </span>
                    </div>
                  )}
                  {isFamilyCareOpen && (
                    <span className="hidden xs:inline-flex text-[10px] bg-blue-50 text-[#1877F2] font-semibold px-1.5 py-0.5 rounded-sm border border-blue-200 whitespace-nowrap">
                      Stellar 幸福家庭组
                    </span>
                  )}
                </div>}
              </div>

              {/* Center Area: Time Range Segmented Selector when isFamilyCareOpen is true, or Search Pill */}
              {isFamilyCareOpen ? (
                <div className="flex items-center justify-center mx-1 sm:mx-2 bg-[#F0F2F5] p-0.5 rounded-md border border-[#E4E6EB] shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.trigger('light');
                      onChangeFamilyTimeRange?.('realtime');
                    }}
                    className={`px-2 py-0.5 text-[10.5px] font-bold rounded-xs transition-all cursor-pointer ${
                      familyTimeRange === 'realtime'
                        ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                        : 'text-[#65676B] hover:text-[#050505]'
                    }`}
                  >
                    实时
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.trigger('light');
                      onChangeFamilyTimeRange?.('today');
                    }}
                    className={`px-2 py-0.5 text-[10.5px] font-bold rounded-xs transition-all cursor-pointer ${
                      familyTimeRange === 'today'
                        ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                        : 'text-[#65676B] hover:text-[#050505]'
                    }`}
                  >
                    今日
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.trigger('light');
                      onChangeFamilyTimeRange?.('history');
                    }}
                    className={`px-2 py-0.5 text-[10.5px] font-bold rounded-xs transition-all cursor-pointer ${
                      familyTimeRange === 'history'
                        ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                        : 'text-[#65676B] hover:text-[#050505]'
                    }`}
                  >
                    历史
                  </button>
                </div>
              ) : !isCourseAppOpen && currentTab !== 'profile' && currentTab !== 'discover' ? (
                currentTab === 'home' ? (
                  <button
                    type="button"
                    id="topbar-search-trigger"
                    aria-label="搜索好友、地点"
                    aria-expanded={isSearchExpanded}
                    onClick={() => {
                      haptics.trigger('light');
                      soundEffects.playTapSound();
                      setIsSearchExpanded(true);
                    }}
                    className="stellar-home-search flex items-center justify-center rounded-full cursor-pointer transition-all active:scale-98 bg-white border border-[#E4E6EB] shadow-2xs hover:border-[#1877F2]/50 text-[#1c1e21]"
                    title="点击展开搜索框"
                  >
                    <Search size={18} className="shrink-0" aria-hidden="true" />
                    
                  </button>
                ) : (
                  <div
                    id="topbar-search-trigger"
                    onClick={() => {
                      haptics.trigger('light');
                      soundEffects.playTapSound();
                      setIsSearchExpanded(true);
                    }}
                    className="flex-1 mx-1.5 flex items-center rounded-full px-2.5 py-1 cursor-pointer max-w-[130px] sm:max-w-xs transition-all min-w-0 active:scale-98 bg-[#F0F2F5] dark:bg-zinc-900 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 hover:border-[#1877F2]/40 border border-transparent dark:border-zinc-800 text-[#65676B] dark:text-zinc-400"
                    title="点击展开搜索框"
                  >
                    <Search
                      size={13}
                      className="mr-1 shrink-0 text-[#1877F2]"
                    />
                    <span className="text-[11px] truncate font-medium">
                      {isStellar
                        ? '搜盲盒...'
                        : currentTab === 'chat'
                        ? '搜索...'
                        : '搜...'}
                    </span>
                  </div>
                )
              ) : (
                <div className="flex-1" />
              )}

              {isMapHome && (
                <div
                  id="stellar-home-weather-slot"
                  hidden={isSearchExpanded}
                  className="flex-1 min-w-0 flex items-center justify-center mx-2 sm:mx-3 h-11 pointer-events-auto relative z-20"
                />
              )}

              {/* Right: Action Buttons Group */}
              {isFamilyCareOpen ? (
                <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0" id="topbar-family-care-buttons">
                  {/* Safety Status Pill */}
                  <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-md border text-[10.5px] font-bold ${
                    familyCareSafetyStatus === 'danger' ? 'bg-red-50 dark:bg-red-950/50 text-[#FA3B30] border-red-200 dark:border-red-900/50' :
                    familyCareSafetyStatus === 'warning' ? 'bg-amber-50 dark:bg-amber-950/50 text-[#F59E0B] border-amber-200 dark:border-amber-900/50' :
                    'bg-emerald-50 dark:bg-emerald-950/50 text-[#31A24C] border-emerald-200 dark:border-emerald-900/50'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      familyCareSafetyStatus === 'danger' ? 'bg-[#FA3B30] animate-pulse' :
                      familyCareSafetyStatus === 'warning' ? 'bg-[#F59E0B]' :
                      'bg-[#31A24C]'
                    }`} />
                    <span className="whitespace-nowrap">{familyCareSafetyStatusText}</span>
                  </div>

                  {/* Day / Night Mode Toggle */}
                  <FacebookRippleButton
                    onClick={onToggleDarkMode}
                    variant="light"
                    title={isDarkMode ? '切换至白天模式 ☀️' : '切换至黑夜模式 🌙'}
                    ariaLabel={isDarkMode ? '白天模式' : '黑夜模式'}
                  >
                    {isDarkMode ? (
                      <Sun size={16} className="stroke-[2.2] text-amber-400" />
                    ) : (
                      <Moon size={16} className="stroke-[2.2] text-zinc-700 dark:text-zinc-200" />
                    )}
                  </FacebookRippleButton>

                  {/* Notification Bell */}
                  <FacebookRippleButton
                    onClick={onOpenNotifications}
                    variant="light"
                    title="通知提醒"
                    ariaLabel="通知"
                  >
                    <div className="relative flex items-center justify-center">
                      <Bell size={16} className="stroke-[2.2] text-[#050505] dark:text-white" />
                      {(familyCareUnreadCount ?? 2) > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-[#FA383E] rounded-full flex items-center justify-center text-[8.5px] text-white font-black px-0.5 border border-white dark:border-black">
                          {familyCareUnreadCount ?? 2}
                        </span>
                      )}
                    </div>
                  </FacebookRippleButton>

                  {/* Settings Gear */}
                  <FacebookRippleButton
                    onClick={onOpenFamilyCareSettings || onOpenSettings}
                    variant="light"
                    title="家庭守护舱设置"
                    ariaLabel="设置"
                  >
                    <Settings size={16} className="stroke-[2.2] text-[#050505] dark:text-white" />
                  </FacebookRippleButton>
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0" id="topbar-action-buttons">
                  {/* 1. Activity Calendar / Document Center */}
                  {!isStellar && (
                    currentTab === 'chat' ? (
                      <FacebookRippleButton
                        onClick={onOpenDocumentCenter || onOpenTextCenter}
                        variant="light"
                        title="文档中心"
                        ariaLabel="文档中心"
                      >
                        <BookOpen size={17} className="text-[#1877F2] stroke-[2.2]" />
                      </FacebookRippleButton>
                    ) : (
                      <FacebookRippleButton
                        onClick={onOpenCalendar}
                        variant={currentTab === 'calendar' ? 'primary' : 'light'}
                        title="活动日历 / 课表"
                        ariaLabel="活动日历"
                      >
                        <CalendarIcon
                          size={17}
                          className={
                            currentTab === 'calendar'
                              ? 'text-white stroke-[2.4]'
                              : 'text-[#1877F2] stroke-[2.2]'
                          }
                        />
                      </FacebookRippleButton>
                    )
                  )}

                  {/* 2. Stealth Mode Button */}
                  {(currentTab !== 'home' || isCourseAppOpen) && <FacebookRippleButton
                    onClick={onToggleStealth}
                    variant={isStealthMode ? 'purple' : 'light'}
                    title={isStealthMode ? '隐身模式已开启' : '开启隐身模式'}
                    ariaLabel="隐身模式"
                  >
                    <Ghost
                      size={17}
                      className={
                        isStealthMode
                          ? 'stroke-[2.4] text-purple-600 dark:text-purple-400'
                          : 'stroke-[2] text-[#65676B] dark:text-zinc-400'
                      }
                    />
                  </FacebookRippleButton>}

                  {/* Add / Publish Button */}
                  <FacebookRippleButton
                    onClick={isCourseAppOpen && onOpenAddCourse ? onOpenAddCourse : onOpenAdd}
                    variant="primary"
                    title={isCourseAppOpen ? '添加新课程' : '打开快捷操作'}
                    ariaLabel="打开快捷操作"
                  >
                    <Plus size={18} className="stroke-[2.5]" />
                  </FacebookRippleButton>
                </div>
              )}
            </motion.div>
          ) : (
            /* Expanded Search Bar Mode: Animates to full width with Facebook style */
            <motion.div
              key="expanded-search"
              initial={{ opacity: 0, scale: 0.97, y: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex items-center w-full space-x-2 z-50"
            >
              <div className="stellar-search-surface flex-1 flex items-center rounded-md px-3 py-1.5 border border-[#1877F2] bg-white dark:bg-black ring-2 ring-[#1877F2]/20 shadow-xs transition-all">
                <Search size={16} className="mr-2 shrink-0 text-[#1877F2]" />
                <input
                  ref={inputRef}
                  id="topbar-search-expanded-input"
                  type="text"
                  aria-label="搜索好友、地点、消息"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    currentTab === 'chat'
                      ? '搜索好友、群聊、消息内容或便签...'
                      : currentTab === 'stellar'
                      ? '搜索盲盒、星系节点或星际好友...'
                      : '搜索好友、实时位置、足迹或群聊...'
                  }
                  className="w-full bg-transparent text-xs outline-none text-[#050505] dark:text-white placeholder-[#65676B] dark:placeholder-zinc-400 font-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit();
                    } else if (e.key === 'Escape') {
                      setIsSearchExpanded(false);
                    }
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      inputRef.current?.focus();
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                    title="清空"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Cancel / Shrink Button */}
              <button
                type="button"
                id="topbar-search-cancel-btn"
                onClick={() => {
                  haptics.trigger('light');
                  setIsSearchExpanded(false);
                }}
                className="stellar-search-cancel px-3 py-1.5 rounded-md text-xs font-bold active:scale-95 cursor-pointer bg-[#F0F2F5] dark:bg-zinc-900 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 text-[#1877F2] border border-[#E4E6EB] dark:border-zinc-800 transition-colors shrink-0"
              >
                取消
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {/* The map owns weather data and its existing detail action. */}

        {/* Floating Quick Search Categories / Dropdown Suggestions when search is expanded */}
        <AnimatePresence>
          {isSearchExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="stellar-search-suggestions absolute left-0 right-0 top-full mt-1 mx-3 bg-white border border-[#E4E6EB] rounded-md shadow-md p-2 z-50 flex flex-col gap-1.5 select-none"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 px-1">
                <span>快捷搜索分类</span>
                <span className="text-[10px] text-gray-400">按 ESC 或点击空白处退出</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '👥 全部好友', q: '好友' },
                  { label: '💬 最近消息', q: '聊天' },
                  { label: '📍 附近足迹', q: '位置' },
                  { label: '👪 守护家庭', q: '家庭' },
                  { label: '🌌 Stellar 盲盒', q: '盲盒' },
                ].map((tag, tIdx) => (
                  <button
                    key={`${tag.label}-${tIdx}`}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag.q);
                      onOpenSearch();
                      setIsSearchExpanded(false);
                    }}
                    className="text-[11px] font-medium px-2.5 py-1 rounded bg-[#F0F2F5] hover:bg-blue-50 hover:text-[#1877F2] text-[#050505] transition-colors cursor-pointer border border-[#E4E6EB]"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};


