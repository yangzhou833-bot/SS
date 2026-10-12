import React from 'react';
import { Friend } from '../types';
import { getFriendSpeechNoteDetail } from '../utils/friendSpeechNotes';

interface FriendSpeechStickyNoteProps {
  friend: Friend;
  isExpanded?: boolean;
  hasUnread?: boolean;
  unreadMsg?: string | null;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  showEmoji?: boolean;
  showFlag?: boolean;
  emojiPosition?: 'left' | 'right';
}

/**
 * FriendSpeechStickyNote - Gradient bubble overlapping with white flag icon & top-right emoji
 */
export const FriendSpeechStickyNote: React.FC<FriendSpeechStickyNoteProps> = ({
  friend,
  isExpanded = false,
  hasUnread = false,
  unreadMsg,
  className = '',
  onClick,
  showEmoji = true,
  showFlag = true,
  emojiPosition = 'right',
}) => {
  const noteDetail = getFriendSpeechNoteDetail(friend);
  const { theme, emoji, cleanText } = noteDetail;
  const displayText = unreadMsg || cleanText;

  return (
    <div
      onClick={onClick}
      className={`relative select-none transition-all duration-250 cursor-pointer whitespace-nowrap map-bubble-layer group/bubble ${className}`}
    >
      {/* 3D Suspended Emoji Badge - Positioned on Top-Right corner of the bubble */}
      {showEmoji && emoji && (
        <div
          className={`absolute -top-2.5 ${
            emojiPosition === 'right' ? '-right-3' : '-left-3.5'
          } z-40 text-2xl animate-emoji-overshoot will-change-transform-opacity select-none pointer-events-none drop-shadow-md`}
        >
          {emoji}
        </div>
      )}

      {/* Custom Gradient Speech Bubble with overlapping White Flag Icon */}
      <div
        className="px-3.5 py-1.5 rounded-2xl text-[11.5px] font-black flex items-center space-x-1.5 border z-30 shadow-md transition-transform group-hover/bubble:scale-105 active:scale-95"
        style={{
          background: theme.cssGradient,
          color: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* White flag icon overlapping with note bubble (白旗图标) */}
        {showFlag && (
          <span
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/25 border border-white/40 text-[9px] leading-none shrink-0 drop-shadow-2xs -ml-1"
            title="白旗"
          >
            🏳️
          </span>
        )}
        <span className="truncate max-w-[190px]">{displayText}</span>
      </div>

      {/* Unread dot */}
      {hasUnread && (
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse z-40" />
      )}
    </div>
  );
};

/**
 * Generate lightweight high-fidelity HTML for Leaflet Map custom DivIcons
 * 便签气泡 ➕ 白旗图标重叠 ➕ 右上角表情
 */
export function generateFriendSpeechNoteHtml(
  friend: Friend,
  options?: {
    isExpanded?: boolean;
    hasUnread?: boolean;
    unreadMsg?: string | null;
    isHighlighted?: boolean;
    showFlag?: boolean;
    emojiPosition?: 'left' | 'right';
  }
): string {
  const noteDetail = getFriendSpeechNoteDetail(friend);
  const { theme, emoji, cleanText } = noteDetail;
  const displayText = options?.unreadMsg || cleanText;
  const hasUnread = options?.hasUnread || false;
  const showFlag = options?.showFlag !== false;
  const emojiPos = options?.emojiPosition || 'right';

  return `
    <div class="absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 z-35 whitespace-nowrap map-bubble-layer pointer-events-auto cursor-pointer select-none origin-bottom transition-all duration-200 hover:scale-105 active:scale-95"
      data-friend-speech-id="${friend.id}"
      style="will-change: transform, opacity; transform: translate3d(0, 0, 0);">
      
      <!-- 3D Suspended Emoji Badge on Top-Right Corner of the bubble -->
      <div class="absolute -top-2.5 ${emojiPos === 'right' ? '-right-3' : '-left-3.5'} z-40 text-2xl animate-emoji-overshoot will-change-transform-opacity select-none pointer-events-none drop-shadow-md">
        ${emoji}
      </div>

      <!-- Custom Speech Bubble with Gradient Color & Overlapping White Flag Icon -->
      <div class="px-3.5 py-1.5 rounded-2xl text-[11.5px] font-black flex items-center space-x-1.5 border z-30 shadow-md"
           style="background: ${theme.cssGradient}; color: #ffffff; border-color: rgba(255, 255, 255, 0.25);">
        ${showFlag ? `<span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/25 border border-white/40 text-[9px] leading-none shrink-0 drop-shadow-2xs -ml-1">🏳️</span>` : ''}
        <span>${displayText}</span>
      </div>

      <!-- Unread Indicator Dot -->
      ${
        hasUnread
          ? `<div class="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse z-40"></div>`
          : ''
      }
    </div>
  `;
}
