import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, Sparkles, Battery, Zap, Users, Shield, Edit3, Trash2 } from 'lucide-react';
import { LabelSticker, StickerLiker } from '../types';
import { StickerLikerListModal } from './StickerLikerListModal';
import { calculateOrbitAngles } from '../data/stickerData';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import { getContrastColor } from './UserNoteModal';
import { FRIEND_SPEECH_THEMES } from '../utils/friendSpeechNotes';

// Helper to format theme classes and styles matching User Note structure
const getNoteThemeConfig = (theme?: string) => {
  if (theme && FRIEND_SPEECH_THEMES[theme]) {
    const t = FRIEND_SPEECH_THEMES[theme];
    return {
      className: 'text-white border shadow-md',
      style: {
        background: t.cssGradient,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        color: '#ffffff',
      } as React.CSSProperties,
      pointerClassName: '',
      pointerStyle: { borderTopColor: t.pointerColor } as React.CSSProperties,
    };
  }
  if (!theme || theme === 'white') {
    return {
      className: 'bg-white/95 dark:bg-zinc-800/95 text-[#050505] dark:text-[#E4E6EB] border border-[#E4E6EB] dark:border-zinc-700 shadow-md backdrop-blur-xs',
      style: {} as React.CSSProperties,
      pointerClassName: 'border-t-white dark:border-t-zinc-800',
      pointerStyle: {} as React.CSSProperties,
    };
  }
  if (theme === 'pink') {
    return {
      className: 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-400 text-white shadow-md shadow-pink-300/40 border-transparent',
      style: {} as React.CSSProperties,
      pointerClassName: 'border-t-rose-400',
      pointerStyle: {} as React.CSSProperties,
    };
  }
  if (theme === 'blue') {
    return {
      className: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-300/40 border-transparent',
      style: {} as React.CSSProperties,
      pointerClassName: 'border-t-indigo-600',
      pointerStyle: {} as React.CSSProperties,
    };
  }
  if (theme === 'sunset') {
    return {
      className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-300/40 border-transparent',
      style: {} as React.CSSProperties,
      pointerClassName: 'border-t-orange-500',
      pointerStyle: {} as React.CSSProperties,
    };
  }
  if (theme.startsWith('#')) {
    const contrast = getContrastColor(theme);
    return {
      className: 'shadow-md border',
      style: {
        backgroundColor: theme,
        color: contrast.text,
        borderColor: contrast.border,
      } as React.CSSProperties,
      pointerClassName: '',
      pointerStyle: {
        borderTopColor: theme,
      } as React.CSSProperties,
    };
  }
  return {
    className: 'bg-white/95 text-[#050505] border border-[#E4E6EB] shadow-md',
    style: {} as React.CSSProperties,
    pointerClassName: 'border-t-white',
    pointerStyle: {} as React.CSSProperties,
  };
};

interface AvatarWithOrbitStickersProps {
  avatarUrl: string;
  userName: string;
  mood?: string;
  battery?: number;
  behaviorStatus?: string;
  speed?: string;
  stayDuration?: string;
  relationship?: 'family' | 'close' | 'team' | 'work' | string;
  speechBubbleText?: string;
  bubbleTheme?: string;
  bubbleEmoji?: string;
  stickers?: LabelSticker[];
  hideStickers?: boolean;
  showLikes?: boolean;
  size?: 'md' | 'lg' | 'enlarged'; // md: 80px, lg: 96px, enlarged: 140px (1.8x)
  isInteractive?: boolean;
  isEditable?: boolean;
  onLikeSticker?: (stickerId: string) => void;
  onDeleteSticker?: (stickerId: string) => void;
  onOpenMoodPicker?: () => void;
  onBubbleClick?: () => void;
  onAvatarClick?: () => void;
  onShowToast?: (msg: string) => void;
}

export const AvatarWithOrbitStickers: React.FC<AvatarWithOrbitStickersProps> = ({
  avatarUrl,
  userName,
  mood = '🌟',
  battery = 92,
  behaviorStatus,
  speed,
  stayDuration,
  relationship,
  speechBubbleText,
  bubbleTheme,
  bubbleEmoji,
  stickers = [],
  hideStickers = false,
  showLikes = false,
  size = 'lg',
  isInteractive = true,
  isEditable = false,
  onLikeSticker,
  onDeleteSticker,
  onOpenMoodPicker,
  onBubbleClick,
  onAvatarClick,
  onShowToast,
}) => {
  const extractedEmoji = (() => {
    if (!speechBubbleText) return undefined;
    const match = speechBubbleText.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[^\p{L}\p{N}\s])+/u);
    return match ? match[0].trim() : undefined;
  })();

  const displayEmoji = bubbleEmoji || extractedEmoji || mood || '✨';

  const cleanText = (() => {
    if (!speechBubbleText) return '';
    const stripped = speechBubbleText
      .replace(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[^\p{L}\p{N}\s])+\s*/u, '')
      .trim();
    return stripped || speechBubbleText;
  })();

  const themeConfig = getNoteThemeConfig(bubbleTheme);

  const [activeLikerModalSticker, setActiveLikerModalSticker] = useState<LabelSticker | null>(null);
  const [bouncingStickerId, setBouncingStickerId] = useState<string | null>(null);
  const [heartPops, setHeartPops] = useState<{ id: number; stickerId: string; x: number; y: number }[]>([]);
  const [deletingStickerId, setDeletingStickerId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Size specifications (avatar diameter, orbit radius, sticker size)
  // 分散四周，增加轨道半径，避免紧贴头像
  const sizeConfig = {
    md: { avatarSize: 76, orbitRadius: 76, stickerBaseSize: 38 },
    lg: { avatarSize: 92, orbitRadius: 96, stickerBaseSize: 44 },
    enlarged: { avatarSize: 130, orbitRadius: 145, stickerBaseSize: 52 },
  }[size];

  const visibleStickers = hideStickers ? [] : stickers.slice(0, 6);
  const angles = calculateOrbitAngles(visibleStickers.length);

  // Handle Sticker Tap (Pure sticker tap with heart pop and haptic feedback)
  const handleStickerTap = (sticker: LabelSticker, e: React.MouseEvent) => {
    e.stopPropagation();

    // Trigger bounce
    setBouncingStickerId(sticker.id);
    setTimeout(() => setBouncingStickerId(null), 400);

    // Trigger Heart Pop with random floating offset for continuous tap excitement
    const popId = Date.now() + Math.random();
    const randomOffset = (Math.random() - 0.5) * 24;
    setHeartPops((prev) => [...prev, { id: popId, stickerId: sticker.id, x: randomOffset, y: -20 }]);
    setTimeout(() => {
      setHeartPops((prev) => prev.filter((p) => p.id !== popId));
    }, 900);

    // Sound & Haptic
    soundEffects.playHeartPopTone();
    haptics.trigger('light');

    if (onLikeSticker) {
      onLikeSticker(sticker.id);
    }
    if (onShowToast) {
      onShowToast(`❤️ 点赞了【${userName}】的贴纸！`);
    }
  };

  // Long-press detection to trigger delete mode
  const handleTouchStart = (stickerId: string) => {
    if (!isEditable) return;
    longPressTimerRef.current = setTimeout(() => {
      setDeletingStickerId(stickerId);
      haptics.trigger('warning');
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handleDeleteClick = (stickerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(stickerId);
  };

  const confirmDelete = (stickerId: string) => {
    if (onDeleteSticker) {
      onDeleteSticker(stickerId);
    }
    setShowDeleteConfirm(null);
    setDeletingStickerId(null);
    if (onShowToast) {
      onShowToast('贴纸已删除');
    }
  };

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: sizeConfig.orbitRadius * 2 + 100, height: sizeConfig.orbitRadius * 2 + 100 }}>
      {/* Subtle Circular Orbit Ring Track */}
      {visibleStickers.length > 0 && (
        <div
          className="absolute rounded-full border border-dashed border-[#1877F2]/20 dark:border-blue-400/20 pointer-events-none"
          style={{
            width: sizeConfig.orbitRadius * 2,
            height: sizeConfig.orbitRadius * 2,
          }}
        />
      )}

      {/* Centered Avatar with 4 Corner Badges and Snug Speech Bubble (z-20 layer ensures avatar is above stickers) */}
      <div
        className="relative z-20 shrink-0 group cursor-pointer"
        onClick={onAvatarClick}
        style={{ width: sizeConfig.avatarSize, height: sizeConfig.avatarSize }}
      >
        {/* Speech Bubble / Status Note Above Head - 按照我的便签结构设计显示，表情显示在气泡顶部，不是在气泡中 */}
        {speechBubbleText && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(e) => {
              if (onBubbleClick) {
                e.stopPropagation();
                onBubbleClick();
              }
            }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center select-none cursor-pointer group/bubble"
            title={onBubbleClick ? '点击直接编辑便签与好友信' : undefined}
          >
            {/* 1. 表情显示在气泡顶部 (不是在气泡中) - 3D 浮动表情徽章 */}
            {displayEmoji && (
              <div
                className="absolute -top-3.5 left-2 z-50 text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.22)] select-none transition-transform group-hover/bubble:scale-115 active:scale-95 pointer-events-none"
              >
                {displayEmoji}
              </div>
            )}

            {/* 2. 便签气泡主体 (按照便签结构设计) */}
            <div
              style={themeConfig.style}
              className={`py-1 rounded-2xl text-xs font-black shadow-md flex items-center space-x-1 whitespace-nowrap transition-all border ${
                themeConfig.className
              } ${displayEmoji ? 'pl-7 pr-3' : 'px-3.5'} group-hover/bubble:scale-105 active:scale-95`}
            >
              <span className="truncate max-w-[200px]">{cleanText}</span>
              {onBubbleClick && (
                <span className="text-[10px] opacity-75 group-hover/bubble:opacity-100 font-normal ml-0.5">✎</span>
              )}
            </div>

            {/* 3. 气泡底部指向头像的倒三角箭头 (Speech Pointer Triangle) */}
            <div
              style={themeConfig.pointerStyle}
              className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] -mt-[1px] filter drop-shadow-2xs transition-all ${themeConfig.pointerClassName}`}
            />
          </motion.div>
        )}

        {/* Avatar Image Container */}
        <div
          className="w-full h-full rounded-full border-4 border-white dark:border-zinc-800 shadow-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 group-hover:scale-105 group-hover:border-[#1877F2] transition-all"
        >
          <img
            src={avatarUrl}
            alt={userName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 1. Top-Left: Mood Badge (Clickable to open Mood & Note/Sticker Creator) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenMoodPicker?.();
          }}
          className="absolute -top-1.5 -left-1.5 z-30 w-7 h-7 rounded-full bg-white dark:bg-zinc-800 text-sm flex items-center justify-center ring-2 ring-white dark:ring-zinc-700 shadow-sm hover:scale-115 active:scale-95 transition-transform cursor-pointer"
          title="心情挂件 · 点击进入心情与便签"
        >
          <span>{mood}</span>
        </button>

        {/* 2. Top-Right: Behavior / Movement Status Badge */}
        {behaviorStatus && (
          <div
            className="absolute -top-1.5 -right-1.5 z-30 px-1.5 py-0.5 rounded-full bg-white dark:bg-zinc-800 text-[#1877F2] text-[9px] font-black ring-2 ring-white dark:ring-zinc-700 shadow-2xs pointer-events-none"
            title={behaviorStatus}
          >
            <span>{behaviorStatus}</span>
          </div>
        )}

        {/* 3. Bottom-Left: Battery Status Badge (用户头像左下方显示电池电量) */}
        {battery !== undefined && (
          <div
            className="absolute -bottom-1.5 -left-1.5 z-30 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-xs text-white text-[9px] font-black flex items-center space-x-0.5 ring-2 ring-white shadow-2xs pointer-events-none"
            title={`电量 ${battery}%`}
          >
            <Battery size={10} className={battery <= 20 ? 'text-rose-400' : 'text-emerald-400'} />
            <span>{battery}%</span>
          </div>
        )}

        {/* 4. Bottom-Right: State-Exclusive Status Badge (Speed when moving, Stay Duration when staying) or Friend Relationship Badge */}
        {(() => {
          const isMoving = speed && !speed.includes('0 km/h') && speed !== '0';
          const text = isMoving ? speed : (stayDuration || '停留 20分');
          const icon = isMoving ? '' : '☕';
          const cleanText = isMoving ? (text.replace(/[^0-9. km\/h]/g, '').trim() || '35km/h') : text;
          if (speed || stayDuration) {
            return (
              <div className="absolute -bottom-1 -right-5 z-30 select-none pointer-events-none flex items-center justify-center">
                <div className="bg-white/95 dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 text-[#050505] dark:text-[#E4E6EB] px-1.5 h-3.5 rounded-full text-[7.5px] font-black shadow-2xs whitespace-nowrap flex items-center space-x-0.5 ring-1 ring-white">
                  {icon && <span>{icon}</span>}
                  <span>{cleanText}</span>
                </div>
              </div>
            );
          }
          if (relationship) {
            return (
              <div className="absolute -bottom-1 -right-1 z-30 w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0 pointer-events-none">
                {relationship === 'family' && (
                  <span className="w-full h-full rounded-full bg-rose-500 text-white flex items-center justify-center">
                    <Heart size={11} className="fill-white" />
                  </span>
                )}
                {relationship === 'close' && (
                  <span className="w-full h-full rounded-full bg-purple-500 text-white flex items-center justify-center">
                    <Sparkles size={11} className="fill-white" />
                  </span>
                )}
                {relationship === 'team' && (
                  <span className="w-full h-full rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Shield size={11} className="fill-white" />
                  </span>
                )}
                {relationship === 'work' && (
                  <span className="w-full h-full rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <Users size={11} className="text-white" />
                  </span>
                )}
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* Floating Photo Cutout Label Stickers on Orbit Rings (z-10 layer: strictly beneath avatar z-20) */}
      {visibleStickers.map((sticker, index) => {
        const angleDeg = sticker.orbit?.angleDeg ?? angles[index] ?? 45;
        const radius = (sticker.orbit?.radiusPx ?? sizeConfig.orbitRadius) * (size === 'enlarged' ? 1.4 : 1);
        const rad = (angleDeg * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;

        const effectiveSize = (sticker.sizePx || sizeConfig.stickerBaseSize) * (size === 'enlarged' ? 1.25 : 1);
        const phase = sticker.orbit?.phase ?? index * 0.3;
        const isBouncing = bouncingStickerId === sticker.id;
        const isDeleting = deletingStickerId === sticker.id;

        return (
          <motion.div
            key={`avatar-stk-${sticker.id || index}-${index}`}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1, scale: 1, x, y }
                : {
                    opacity: 1,
                    scale: isBouncing ? 1.2 : 1,
                    x,
                    y: [y - 6, y + 6, y - 6],
                    rotate: [-6, 6, -6],
                  }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.3 }
                : {
                    y: { repeat: Infinity, duration: 4 + (index % 3), ease: 'easeInOut', delay: phase },
                    rotate: { repeat: Infinity, duration: 6 + (index % 2) * 2, ease: 'easeInOut', delay: phase },
                    scale: { type: 'spring', damping: 15, stiffness: 300 },
                  }
            }
            className="absolute z-10 flex flex-col items-center cursor-pointer group select-none"
            onClick={(e) => isInteractive && handleStickerTap(sticker, e)}
            onTouchStart={() => handleTouchStart(sticker.id)}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart(sticker.id)}
            onMouseUp={handleTouchEnd}
          >
            {/* Delete Mode Red Cross Button (Unrecoverable Confirmation) */}
            {isDeleting && (
              <button
                onClick={(e) => handleDeleteClick(sticker.id, e)}
                className="absolute -top-2 -right-2 z-30 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center ring-2 ring-white shadow-md animate-pulse cursor-pointer hover:scale-110"
                title="删除贴纸"
              >
                <X size={12} />
              </button>
            )}

            {/* Sticker Transparent Cutout Body with Border & Glow */}
            <div
              className="relative rounded-full p-0.5 overflow-hidden transition-all filter drop-shadow-md group-hover:scale-110"
              style={{
                width: `${effectiveSize}px`,
                height: `${effectiveSize}px`,
                border: `${sticker.border.widthPx}px ${sticker.border.style === 'dashed' ? 'dashed' : 'solid'} ${sticker.border.color}`,
                boxShadow:
                  sticker.border.style === 'glow'
                    ? `0 0 12px ${sticker.border.color}`
                    : '0 3px 8px rgba(0,0,0,0.18)',
              }}
            >
              <img
                src={sticker.cutoutUrl}
                alt={sticker.label}
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* Heart Burst Particle Effect when Liked */}
              {heartPops
                .filter((p) => p.stickerId === sticker.id)
                .map((p) => (
                  <motion.div
                    key={`pop-${p.id}`}
                    initial={{ opacity: 1, scale: 0.5, x: p.x, y: 0 }}
                    animate={{ opacity: 0, scale: 1.9, x: p.x * 1.5, y: -40 }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 text-rose-500 text-xl select-none"
                  >
                    ❤️
                  </motion.div>
                ))}
            </div>

            {/* Like Badge at Bottom-Right Corner (❤️ count) - Hidden by default */}
            {showLikes && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLikerModalSticker(sticker);
                }}
                className={`absolute -bottom-1.5 -right-1 z-30 px-1.5 py-0.5 rounded-full text-[9px] font-black flex items-center space-x-0.5 shadow-sm border cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
                  sticker.likedByMe
                    ? 'bg-rose-50 border-rose-300 text-rose-600 ring-1 ring-rose-200'
                    : 'bg-white/95 dark:bg-zinc-800/95 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                }`}
                title="点击查看点赞好友列表"
              >
                <span className="text-[9px]">❤️</span>
                <span>{sticker.likes > 999 ? '1k+' : sticker.likes}</span>
                {/* Stacked Recent Likers Avatars */}
                {sticker.recentLikers && sticker.recentLikers.length > 0 && (
                  <div className="flex -space-x-1 ml-0.5 pointer-events-none">
                    {sticker.recentLikers.slice(0, 2).map((liker, idx) => (
                      <img
                        key={`liker-${liker.userId || idx}-${idx}`}
                        src={liker.avatarUrl}
                        alt={liker.userName}
                        className="w-3 h-3 rounded-full border border-white object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Label name bubble */}
            {sticker.label && (
              <div className="mt-1 px-1.5 py-0.5 bg-black/75 backdrop-blur-xs text-white text-[8px] font-bold rounded-full shadow-2xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {sticker.label}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Delete Confirmation Popup Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-99 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-[#E4E6EB] rounded-md p-4 max-w-xs w-full shadow-xl space-y-3">
            <h4 className="text-sm font-black text-[#050505] dark:text-white">确定要删除此贴纸吗？</h4>
            <p className="text-xs text-[#65676B] dark:text-zinc-400">
              删除后贴纸及其点赞数据将不可恢复。
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="px-3 py-1 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-md cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liker List Modal */}
      {activeLikerModalSticker && (
        <StickerLikerListModal
          sticker={activeLikerModalSticker}
          isOpen={!!activeLikerModalSticker}
          onClose={() => setActiveLikerModalSticker(null)}
          onLikeToggle={(sId) => {
            onLikeSticker?.(sId);
            setActiveLikerModalSticker((prev) =>
              prev && prev.id === sId
                ? {
                    ...prev,
                    likedByMe: !prev.likedByMe,
                    likes: prev.likedByMe ? Math.max(0, prev.likes - 1) : prev.likes + 1,
                  }
                : prev
            );
          }}
        />
      )}
    </div>
  );
};
