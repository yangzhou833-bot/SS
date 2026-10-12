import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Map, MessageCircle, Compass, Sparkles, Users, Radio, Mic } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import './map-home-h1.css';

interface BottomNavProps {
  currentTab: 'home' | 'chat' | 'discover' | 'stellar' | 'profile';
  onChangeTab: (tab: 'home' | 'chat' | 'discover' | 'stellar' | 'profile') => void;
  unreadChatsCount: number;
  closeFriendAvatar?: string;
  closeFriendUnreadCount?: number;
  onChatAvatarClick?: () => void;
  // 对讲机按钮整合与状态
  isIntercomMode?: boolean;
  intercomFriendName?: string;
  isIntercomTransmitting?: boolean;
  onIntercomStart?: () => void;
  onIntercomStop?: () => void;
  onIntercomExit?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  unreadChatsCount,
  closeFriendAvatar,
  closeFriendUnreadCount,
  onChatAvatarClick,
  isIntercomMode = false,
  intercomFriendName,
  isIntercomTransmitting = false,
  onIntercomStart,
  onIntercomStop,
  onIntercomExit,
}) => {
  const reduceMotion = useReducedMotion();

  const tabs = [
    { id: 'chat', label: '聊天', icon: MessageCircle, badge: unreadChatsCount },
    { id: 'discover', label: '发现', icon: Compass },
    {
      id: 'home',
      label: isIntercomMode ? (isIntercomTransmitting ? '正在对讲' : '一键对讲') : '地图',
      icon: isIntercomMode ? Radio : Map,
    },
    { id: 'stellar', label: 'Stellar', icon: Sparkles },
    { id: 'profile', label: '我的', isAvatar: true },
  ];

  return (
    <nav
      className="stellar-bottomnav w-full shrink-0 px-2 flex items-center justify-around z-[95] select-none transition-colors duration-200"
      aria-label="主导航"
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const isIntercomTab = tab.id === 'home' && isIntercomMode;
        const Icon = tab.icon;

        if (isIntercomTab) {
          return (
            <div
              key={tab.id}
              className="relative flex flex-col items-center justify-center flex-1 h-full cursor-pointer select-none group"
            >
              {/* Protruding, enlarged and prominent Walkie-Talkie Button */}
              <motion.button
                type="button"
                id="bottomnav-intercom-btn"
                initial={{ scale: 0.8, y: 0 }}
                animate={
                  isIntercomTransmitting
                    ? { scale: 1.15, y: -22 }
                    : { scale: 1.1, y: -18 }
                }
                exit={{ scale: 0.8, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 22,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  haptics.trigger('medium');
                  if (onIntercomStart && onIntercomStop) {
                    onIntercomStart();
                    setTimeout(() => {
                      onIntercomStop();
                    }, 1200);
                  }
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  if (onIntercomStart) onIntercomStart();
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  if (onIntercomStop) onIntercomStop();
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  if (isIntercomTransmitting && onIntercomStop) onIntercomStop();
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onIntercomStart) onIntercomStart();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onIntercomStop) onIntercomStop();
                }}
                className={`relative w-[68px] h-[68px] rounded-full flex items-center justify-center border-4 border-white dark:border-black cursor-pointer active:scale-95 transition-colors duration-200 z-20 ${
                  isIntercomTransmitting
                    ? 'bg-emerald-500 text-white shadow-[0_10px_32px_rgba(16,185,129,0.65)] ring-4 ring-emerald-300/60'
                    : 'bg-[#1877F2] hover:bg-[#166FE5] text-white shadow-[0_10px_28px_rgba(24,119,242,0.55)] ring-2 ring-[#1877F2]/20'
                }`}
                title={intercomFriendName ? `与【${intercomFriendName}】一键实时对讲` : '一键实时对讲'}
                aria-label="一键对讲"
              >
                {/* Subtle pulse halo when idle in intercom mode */}
                {!isIntercomTransmitting && (
                  <span className="absolute -inset-2 rounded-full bg-[#1877F2]/25 animate-ping opacity-40 pointer-events-none" />
                )}

                {/* Transmitting audio wave ripple */}
                {isIntercomTransmitting && (
                  <span className="absolute -inset-3.5 rounded-full bg-emerald-400/30 animate-ping opacity-75 pointer-events-none" />
                )}

                <Radio
                  size={34}
                  className={`stroke-[2.5] transition-transform duration-200 ${
                    isIntercomTransmitting ? 'scale-110 text-white animate-pulse' : 'text-white'
                  }`}
                />
              </motion.button>

              {/* Bold distinctive label below the enlarged button */}
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: -10 }}
                className={`text-[11.5px] font-black tracking-tight whitespace-nowrap z-20 select-none ${
                  isIntercomTransmitting ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#1877F2] dark:text-blue-400'
                }`}
              >
                {isIntercomTransmitting ? '正在对讲...' : '一键对讲'}
              </motion.span>
            </div>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => {
              // 点击其他操作均视为退出操作盘，退出后对讲按钮恢复成地图
              haptics.trigger('light');
              soundEffects.playTapSound();
              if (isIntercomMode) {
                onIntercomExit?.();
              }
              if (tab.id === 'chat' && closeFriendAvatar && onChatAvatarClick) {
                onChatAvatarClick();
              } else {
                onChangeTab(tab.id as any);
              }
            }}
            type="button"
            className="stellar-nav-item flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 cursor-pointer group relative active:scale-95"
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Active Highlight Pill Background & Micro-bounce container */}
            <motion.div
              animate={
                isActive && !reduceMotion
                  ? { scale: 1.04, y: -2 }
                  : { scale: 1, y: 0 }
              }
              transition={{
                type: 'spring',
                stiffness: 480,
                damping: 12,
                mass: 0.5,
              }}
              className={`stellar-nav-disc ${isActive ? 'is-active' : ''} ${tab.isAvatar ? 'is-profile' : ''} relative flex items-center justify-center rounded-full transition-colors duration-200`}
            >
              {tab.isAvatar ? (
                <div
                  className="stellar-nav-portrait rounded-full"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              ) : tab.id === 'chat' && closeFriendUnreadCount && closeFriendUnreadCount > 0 && closeFriendAvatar ? (
                <div
                  className={`w-7 h-7 rounded-full border-2 transition-all p-[1px] gpu-layer will-change-transform-opacity ${
                    isActive ? 'border-[#1877F2] ring-2 ring-[#1877F2]/30' : 'border-[#1877F2] animate-unified-breathe'
                  }`}
                >
                  <img
                    src={closeFriendAvatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#1877F2] rounded-full border border-white dark:border-black" />
                </div>
              ) : (
                <Icon
                  size={24}
                  className="stellar-nav-icon stroke-[2]"
                  aria-hidden="true"
                />
              )}

              {/* Spring Pop-in Unread Badge */}
              <AnimatePresence>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <motion.span
                    key={`tab-unread-badge-${tab.id}`}
                    initial={{ scale: 0, opacity: 0, y: 4 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 550,
                      damping: 15,
                      mass: 0.5,
                    }}
                    className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-[#FA383E] text-white text-[9.5px] font-black rounded-full border-2 border-white dark:border-black shadow-2xs flex items-center justify-center leading-none select-none pointer-events-none z-20"
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {tab.label && (
              <span
                className={`stellar-nav-label text-[12px] leading-none transition-colors duration-200 ${
                  isActive
                    ? 'text-[#1877F2] font-black tracking-tight scale-105'
                    : 'text-[#65676B] dark:text-zinc-400 font-medium group-hover:text-[#050505] dark:group-hover:text-white'
                }`}
              >
                {tab.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

