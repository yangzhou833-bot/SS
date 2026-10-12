import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';
import { isCustomSticker, renderCustomSticker } from './chat/StickerCatalog';

export type EmojiSemanticVariant =
  | 'heart'
  | 'thumbsup'
  | 'joy'
  | 'party'
  | 'fire'
  | 'star'
  | 'standard';

export interface EmojiAnimationConfig {
  variant: EmojiSemanticVariant;
  className: string;
  description: string;
  hasSparkles: boolean;
  durationMs: number;
}

/**
 * CSS 动画字典：根据 emoji 语义分类映射特定的关键帧动画变体与粒子行为
 */
export const EMOJI_ANIMATION_DICTIONARY: Record<
  EmojiSemanticVariant,
  EmojiAnimationConfig
> = {
  heart: {
    variant: 'heart',
    className: 'anim-single-emoji-heart',
    description: '两次轻微跳动心率脉冲',
    hasSparkles: true,
    durationMs: 420,
  },
  thumbsup: {
    variant: 'thumbsup',
    className: 'anim-single-emoji-thumbsup',
    description: '向上弹起并出现两枚小星点',
    hasSparkles: true,
    durationMs: 420,
  },
  joy: {
    variant: 'joy',
    className: 'anim-single-emoji-joy',
    description: '轻微左右欢乐摇摆',
    hasSparkles: false,
    durationMs: 420,
  },
  party: {
    variant: 'party',
    className: 'anim-single-emoji-party',
    description: '出现三枚短暂彩色纸屑点',
    hasSparkles: true,
    durationMs: 420,
  },
  fire: {
    variant: 'fire',
    className: 'anim-single-emoji-fire',
    description: '两次快速高亮闪动并伴随火星点',
    hasSparkles: true,
    durationMs: 420,
  },
  star: {
    variant: 'star',
    className: 'anim-single-emoji-star',
    description: '向上浮动并显示细小星点',
    hasSparkles: true,
    durationMs: 420,
  },
  standard: {
    variant: 'standard',
    className: 'anim-single-emoji-standard',
    description: '标准420ms弹力放大回响',
    hasSparkles: true,
    durationMs: 420,
  },
};

/**
 * 解析 Emoji 所属语义变体
 */
export function getEmojiSemanticVariant(emoji: string): EmojiSemanticVariant {
  const trimmed = emoji.trim();
  if (trimmed === 'sticker_melt_heart' || ['❤️', '💖', '💗', '💓', '💘', '💕', '💞', '♥', '💟', '💝', '💌'].some((e) => trimmed.includes(e))) {
    return 'heart';
  }
  if (trimmed === 'sticker_purple_thumb' || ['👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿'].some((e) => trimmed.includes(e))) {
    return 'thumbsup';
  }
  if (['😂', '🤣', '😹', '😆', '😄'].some((e) => trimmed.includes(e))) {
    return 'joy';
  }
  if (trimmed === 'sticker_frothy_beer' || ['🎉', '🎊', '🥳', '🍾', '🎈'].some((e) => trimmed.includes(e))) {
    return 'party';
  }
  if (trimmed === 'sticker_flame_buddy' || ['🔥', '⚡', '💥', '🧨'].some((e) => trimmed.includes(e))) {
    return 'fire';
  }
  if (['⭐', '🌟', '✨', '💫', '🌠'].some((e) => trimmed.includes(e))) {
    return 'star';
  }
  return 'standard';
}

export interface SingleEmojiEchoBubbleHandle {
  replay: () => void;
  isPlaying: boolean;
  getVariant: () => EmojiSemanticVariant;
}

export interface SingleEmojiEchoBubbleProps {
  msgId: string;
  emoji: string;
  artwork?: React.ReactNode;
  isMe: boolean;
  timestamp?: string;
  hasPlayedInitially: boolean;
  onMarkPlayed?: (msgId: string) => void;
  isSwipedOpen?: boolean;
  swipeOffset?: number;
  messageReactions?: Record<string, { count: number; hasReacted: boolean }>;
  onToggleReaction?: (msgId: string, emoji: string) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  onDoubleTap?: (msgId: string) => boolean;
  isMega?: boolean;
  className?: string;
}

export const SingleEmojiEchoBubble = forwardRef<
  SingleEmojiEchoBubbleHandle,
  SingleEmojiEchoBubbleProps
>(
  (
    {
      msgId,
      emoji,
      artwork,
      isMe,
      timestamp,
      hasPlayedInitially,
      onMarkPlayed,
      isSwipedOpen = false,
      swipeOffset,
      messageReactions,
      onToggleReaction,
      onContextMenu,
      onPointerDown,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onDoubleTap,
      isMega = false,
      className = '',
    },
    ref,
  ) => {
    const variant = getEmojiSemanticVariant(emoji);
    const animConfig = EMOJI_ANIMATION_DICTIONARY[variant];
    const [isPlaying, setIsPlaying] = useState<boolean>(!hasPlayedInitially);
    const [showSparkles, setShowSparkles] = useState<boolean>(false);
    const [animKey, setAnimKey] = useState<number>(0);
    const [comboCount, setComboCount] = useState<number>(0);

    const animTimerRef = useRef<number | null>(null);
    const sparkleTimerRef = useRef<number | null>(null);
    const comboTimerRef = useRef<number | null>(null);

    // 检查系统的无障碍“减少动态效果”设置
    const isReducedMotion = useCallback(() => {
      if (typeof window === 'undefined') return false;
      return (
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    }, []);

    // 严格清理所有计时器与粒子状态
    const clearTimers = useCallback(() => {
      if (animTimerRef.current) {
        clearTimeout(animTimerRef.current);
        animTimerRef.current = null;
      }
      if (sparkleTimerRef.current) {
        clearTimeout(sparkleTimerRef.current);
        sparkleTimerRef.current = null;
      }
    }, []);

    // 触发单表情回响动效（总时长不超过 420ms，完全播放后彻底卸载粒子层）
    const triggerAnimation = useCallback(() => {
      clearTimers();
      const reduced = isReducedMotion();
      setIsPlaying(true);
      setShowSparkles(false);
      setAnimKey((prev) => prev + 1);

      // 移动端轻微触感反馈（无声音）
      try {
        haptics.trigger('light');
      } catch {}

      if (reduced) {
        // 140ms 淡入微缩放
        animTimerRef.current = window.setTimeout(() => {
          setIsPlaying(false);
          setShowSparkles(false);
        }, 140);
      } else {
        // 300ms - 420ms: 显现短暂粒子点
        if (animConfig.hasSparkles) {
          sparkleTimerRef.current = window.setTimeout(() => {
            setShowSparkles(true);
          }, 290);
        }

        // 420ms: 稳定完成，严格清除所有状态粒子与装饰层
        animTimerRef.current = window.setTimeout(() => {
          setIsPlaying(false);
          setShowSparkles(false);
        }, 420);
      }
    }, [clearTimers, isReducedMotion, animConfig.hasSparkles]);

    // 暴露 ref 命令式控制句柄供外部触发手动重播
    useImperativeHandle(
      ref,
      () => ({
        replay: () => {
          triggerAnimation();
        },
        isPlaying,
        getVariant: () => variant,
      }),
      [triggerAnimation, isPlaying, variant],
    );

    const hasTriggeredOnceRef = useRef(false);

    // 发送方/接收方首次挂载时播放一次，滚动回来时不再重复触发
    useEffect(() => {
      if (!hasPlayedInitially && !hasTriggeredOnceRef.current) {
        hasTriggeredOnceRef.current = true;
        triggerAnimation();
        onMarkPlayed?.(msgId);
      }
      return () => {
        clearTimers();
      };
    }, [msgId, hasPlayedInitially, triggerAnimation, onMarkPlayed, clearTimers]);

    // 点击或键盘操作触发重播
    const handleReplay = (e?: React.MouseEvent | React.KeyboardEvent) => {
      if (e) {
        e.stopPropagation();
      }
      if (onDoubleTap && onDoubleTap(msgId)) {
        return;
      }
      soundEffects.playBubblePopSound();
      triggerAnimation();

      // Combo count handling with tactile feedback
      setComboCount((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          haptics.burst();
        } else {
          haptics.tick(10);
        }
        if (comboTimerRef.current) {
          clearTimeout(comboTimerRef.current);
        }
        comboTimerRef.current = window.setTimeout(() => {
          setComboCount(0);
          comboTimerRef.current = null;
        }, 1600);
        return next;
      });
    };

    const animClass = isPlaying
      ? isReducedMotion()
        ? 'anim-single-emoji-reduced'
        : animConfig.className
      : '';

    // 渲染 300ms - 420ms 微粒子（动画结束后完全 unmount 移除）
    const renderSparkles = () => {
      if (!isPlaying || !showSparkles || isReducedMotion() || !animConfig.hasSparkles) {
        return null;
      }

      if (variant === 'thumbsup') {
        return (
          <div
            className="absolute inset-0 pointer-events-none z-20 overflow-visible select-none"
            aria-hidden="true"
          >
            <span
              className="absolute top-1 right-1 w-2 h-2 text-[#1877F2] font-black text-[10px] anim-single-emoji-sparkle"
              style={{
                ['--tw-sparkle-x' as any]: '6px',
                ['--tw-sparkle-y' as any]: '-8px',
              }}
            >
              ✦
            </span>
            <span
              className="absolute top-2 left-1 w-1.5 h-1.5 text-[#3B82F6] font-black text-[8px] anim-single-emoji-sparkle"
              style={{
                ['--tw-sparkle-x' as any]: '-6px',
                ['--tw-sparkle-y' as any]: '-6px',
              }}
            >
              ✦
            </span>
          </div>
        );
      }

      if (variant === 'party') {
        return (
          <div
            className="absolute inset-0 pointer-events-none z-20 overflow-visible select-none"
            aria-hidden="true"
          >
            <span
              className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-[#1877F2] anim-single-emoji-sparkle"
              style={{
                ['--tw-sparkle-x' as any]: '-7px',
                ['--tw-sparkle-y' as any]: '-9px',
              }}
            />
            <span
              className="absolute top-0 right-2 w-1.5 h-1.5 rounded-full bg-[#F59E0B] anim-single-emoji-sparkle"
              style={{
                ['--tw-sparkle-x' as any]: '8px',
                ['--tw-sparkle-y' as any]: '-8px',
              }}
            />
            <span
              className="absolute bottom-2 right-1 w-1.5 h-1.5 rounded-full bg-[#EC4899] anim-single-emoji-sparkle"
              style={{
                ['--tw-sparkle-x' as any]: '7px',
                ['--tw-sparkle-y' as any]: '6px',
              }}
            />
          </div>
        );
      }

      if (variant === 'fire') {
        return (
          <div
            className="absolute inset-0 pointer-events-none z-20 overflow-visible select-none"
            aria-hidden="true"
          >
            <span
              className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-[#F97316] anim-single-emoji-sparkle"
              style={{
                ['--tw-sparkle-x' as any]: '6px',
                ['--tw-sparkle-y' as any]: '-9px',
              }}
            />
            <span
              className="absolute top-0 left-2 w-1.5 h-1.5 rounded-full bg-[#EAB308] anim-single-emoji-sparkle"
              style={{
                ['--tw-sparkle-x' as any]: '-6px',
                ['--tw-sparkle-y' as any]: '-7px',
              }}
            />
            <span
              className="absolute top-3 right-0 w-1 h-1 rounded-full bg-[#EF4444] anim-single-emoji-sparkle"
              style={{
                ['--tw-sparkle-x' as any]: '5px',
                ['--tw-sparkle-y' as any]: '-4px',
              }}
            />
          </div>
        );
      }

      if (variant === 'heart') {
        return (
          <div
            className="absolute inset-0 pointer-events-none z-20 overflow-visible select-none"
            aria-hidden="true"
          >
            <span
              className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-[#EF4444] anim-single-emoji-sparkle"
              style={{
                ['--tw-sparkle-x' as any]: '-7px',
                ['--tw-sparkle-y' as any]: '-8px',
              }}
            />
            <span
              className="absolute top-0 right-2 w-1.5 h-1.5 rounded-full bg-[#F43F5E] anim-single-emoji-sparkle"
              style={{
                ['--tw-sparkle-x' as any]: '7px',
                ['--tw-sparkle-y' as any]: '-7px',
              }}
            />
            <span
              className="absolute bottom-2 right-1.5 w-1 h-1 rounded-full bg-[#FB7185] anim-single-emoji-sparkle"
              style={{
                ['--tw-sparkle-x' as any]: '6px',
                ['--tw-sparkle-y' as any]: '5px',
              }}
            />
          </div>
        );
      }

      // Default & Star: 3 颗微粒子星点
      return (
        <div
          className="absolute inset-0 pointer-events-none z-20 overflow-visible select-none"
          aria-hidden="true"
        >
          <span
            className="absolute top-0 left-2 text-[#F59E0B] font-bold text-[9px] anim-single-emoji-sparkle"
            style={{
              ['--tw-sparkle-x' as any]: '-6px',
              ['--tw-sparkle-y' as any]: '-8px',
            }}
          >
            ✦
          </span>
          <span
            className="absolute top-0 right-2 text-[#1877F2] font-bold text-[9px] anim-single-emoji-sparkle"
            style={{
              ['--tw-sparkle-x' as any]: '7px',
              ['--tw-sparkle-y' as any]: '-7px',
            }}
          >
            ✦
          </span>
          <span
            className="absolute bottom-1 right-1 text-[#3B82F6] font-bold text-[7px] anim-single-emoji-sparkle"
            style={{
              ['--tw-sparkle-x' as any]: '6px',
              ['--tw-sparkle-y' as any]: '5px',
            }}
          >
            ●
          </span>
        </div>
      );
    };

    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`单表情 ${emoji}，${animConfig.description}，按回车或空格重播放大回响动效`}
        onClick={handleReplay}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleReplay(e);
          }
        }}
        onContextMenu={onContextMenu}
        onPointerDown={onPointerDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        style={{
          transform:
            typeof swipeOffset === 'number'
              ? `translateX(${swipeOffset}px)`
              : isSwipedOpen
                ? isMe
                  ? 'translateX(-6px)'
                  : 'translateX(6px)'
                : 'none',
          transition:
            typeof swipeOffset === 'number'
              ? 'none'
              : 'transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
        className={`relative group select-none py-1 px-1.5 cursor-pointer flex flex-col items-center outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] rounded-md ${className}`}
        title={`点击重播放大回响 (${animConfig.description}) · 长按或右键快捷菜单`}
      >
        {/* 单表情展示框 (普通 54px, Mega 蓄力 82px) */}
        <div
          className={`relative flex items-center justify-center ${
            isMega
              ? 'w-[82px] h-[82px] min-w-[76px] min-h-[76px]'
              : 'w-[54px] h-[54px] min-w-[48px] min-h-[48px]'
          }`}
        >
          {/* Combo Multiplier Badge */}
          {comboCount >= 2 && (
            <div
              key={`combo-${comboCount}`}
              className="absolute -top-2 -right-4 z-30 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white font-black text-[11px] leading-tight shadow-md anim-emoji-emit-pop flex items-center gap-0.5 pointer-events-none select-none"
              style={{
                filter: 'drop-shadow(0 2px 8px rgba(239, 68, 68, 0.45))',
              }}
            >
              <span>x{comboCount}</span>
              {comboCount >= 5 && <span>🔥</span>}
            </div>
          )}

          {isCustomSticker(emoji) ? (
            <span
              key={`emoji-anim-${animKey}`}
              className={`select-none transform-gpu inline-flex items-center justify-center transition-transform ${animClass}`}
            >
              {renderCustomSticker(emoji, isMega ? 96 : 64)}
            </span>
          ) : (
            <span
              key={`emoji-anim-${animKey}`}
              className={`${
                isMega
                  ? 'text-7xl sm:text-[76px]'
                  : 'text-5xl sm:text-[52px]'
              } leading-none select-none transform-gpu inline-block transition-transform ${animClass}`}
              style={{
                lineHeight: 1,
                display: 'inline-block',
                textAlign: 'center',
              }}
            >
              {artwork || emoji}
            </span>
          )}

          {/* 300ms - 420ms 状态粒子层（动效结束后严格从 DOM 中销毁卸载） */}
          {renderSparkles()}
        </div>

        {/* 消息发送时间戳（不遮挡表情） */}
        {timestamp && (
          <div className="text-[9px] text-gray-400 font-mono mt-0.5 flex items-center justify-center select-none opacity-80">
            <span>{timestamp}</span>
          </div>
        )}

        {/* 表态 Reaction 徽标 */}
        {messageReactions && Object.keys(messageReactions).length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1 mt-1 z-10 select-none">
            {Object.entries(messageReactions).map(
              ([reactEmoji, rData]: [string, any]) => {
                if (!rData || rData.count <= 0) return null;
                return (
                  <button
                    key={reactEmoji}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleReaction)
                        onToggleReaction(msgId, reactEmoji);
                    }}
                    className={`px-2 py-0.5 rounded-full text-xs flex items-center space-x-1 border cursor-pointer transition-all active:scale-95 reaction-chip-pop ${
                      rData.hasReacted
                        ? 'bg-blue-50/95 text-[#1877F2] border-[#1877F2]/50 font-bold ring-1 ring-[#1877F2]/30'
                        : 'bg-white/95 text-gray-700 border-gray-200/80 hover:bg-gray-50 font-medium'
                    }`}
                    title={
                      rData.hasReacted
                        ? `你和 ${rData.count - 1} 人表态了 ${reactEmoji} (点击取消)`
                        : `${rData.count} 人表态了 ${reactEmoji} (点击也表态)`
                    }
                  >
                    <span className="text-[13px] leading-none">
                      {reactEmoji}
                    </span>
                    <span className="text-[10px] font-sans ml-0.5">
                      {rData.count}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>
    );
  },
);

SingleEmojiEchoBubble.displayName = 'SingleEmojiEchoBubble';
