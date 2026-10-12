import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export interface MapUserCalloutPopoverProps {
  avatarUrl: string;
  userName: string;
  messageText: string;
  emojis?: string; // e.g. "😔 💕" or "☕️ ✨"
  batteryLevel?: number; // e.g. 88
  isOnline?: boolean;
  defaultOpen?: boolean;
  onClickAvatar?: () => void;
  onClickCallout?: () => void;
  onLikeCallout?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const MapUserCalloutPopover: React.FC<MapUserCalloutPopoverProps> = ({
  avatarUrl,
  userName,
  messageText,
  emojis = '😔 💕',
  batteryLevel = 88,
  isOnline = true,
  defaultOpen = true,
  onClickAvatar,
  onClickCallout,
  onLikeCallout,
  className = '',
  style,
}) => {
  const [likesCount, setLikesCount] = useState(3);
  const [hasLiked, setHasLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultOpen);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasLiked) {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    }
    if (onLikeCallout) onLikeCallout();
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpanded) {
      // Trigger gorgeous dazzling exit animation before hiding
      setIsExiting(true);
      setTimeout(() => {
        setIsExpanded(false);
        setIsExiting(false);
      }, 420);
    } else {
      setIsExiting(false);
      setIsExpanded(true);
    }
    if (onClickAvatar) onClickAvatar();
  };

  return (
    <div
      style={style}
      className={`relative inline-flex flex-col items-start select-none font-sans group ${className}`}
    >
      {/* Ultra-smooth Apple-Maps-style Spring Animation & Dazzling Exit Keyframes */}
      <style>{`
        @keyframes appleMapSpringRefined {
          0% {
            opacity: 0;
            transform: translate3d(0, 16px, 0) scale(0.3) rotate(-8deg);
            filter: blur(4px);
          }
          55% {
            opacity: 1;
            transform: translate3d(0, -4px, 0) scale(1.08) rotate(2deg);
            filter: blur(0px);
          }
          78% {
            transform: translate3d(0, 2px, 0) scale(0.97) rotate(-1deg);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            filter: blur(0px);
          }
        }
        @keyframes gorgeousDazzlingExit {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            filter: blur(0px);
          }
          25% {
            opacity: 1;
            transform: translate3d(0, -12px, 0) scale(1.18) rotate(-4deg);
            filter: blur(0px);
          }
          60% {
            opacity: 0.85;
            transform: translate3d(12px, -24px, 0) scale(0.7) rotate(12deg);
            filter: blur(2px);
          }
          100% {
            opacity: 0;
            transform: translate3d(35px, -55px, 0) scale(0.15) rotate(35deg);
            filter: blur(10px);
          }
        }
        .apple-spring-popover {
          will-change: transform, opacity;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. FLOATING SPEECH BUBBLE (#FFFFFF Pure White, Soft Shadow, Dynamic Size) */}
      {/* ========================================================================= */}
      {(isExpanded || isExiting) && (
        <div
          onClick={onClickCallout}
          style={{
            animation: isExiting
              ? 'gorgeousDazzlingExit 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards'
              : 'appleMapSpringRefined 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            transformOrigin: '24px bottom',
          }}
          className="relative bg-[#1877F2] text-white w-auto min-w-[120px] max-w-[240px] px-4 py-2.5 rounded-[20px] shadow-[0_8px_25px_rgba(24,119,242,0.35),0_2px_6px_rgba(0,0,0,0.08)] border border-blue-400/40 flex flex-col items-center justify-center text-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-98 z-20 shrink-0"
        >
          {/* Text Message (Dynamic height/width adapt to text length) */}
          <p className="text-xs sm:text-sm font-bold text-white leading-snug tracking-normal break-words whitespace-pre-wrap">
            {messageText}
          </p>

          {/* Emojis Display */}
          {emojis && (
            <span className="text-base sm:text-lg mt-0.5 tracking-wide leading-none select-none animate-bounce">
              {emojis}
            </span>
          )}

          {/* Facebook/Meta Style Like Reaction Pill */}
          <div className="absolute -bottom-2 -right-1 flex items-center bg-white/95 backdrop-blur-md px-1.5 py-0.5 rounded-full shadow-2xs border border-gray-100 text-[10px] font-bold text-[#050505] transition-transform hover:scale-110 z-30">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center space-x-0.5 cursor-pointer ${
                hasLiked ? 'text-rose-500 font-extrabold' : 'text-gray-400 hover:text-rose-500'
              }`}
            >
              <Heart size={10} className={hasLiked ? 'fill-rose-500 text-rose-500' : ''} />
              <span className="text-[9px]">{likesCount}</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 2. TAIL: ANTI-ALIASED SEMICIRCLE ARC CONNECTING SMOOTHLY TO AVATAR */}
          {/* ========================================================================= */}
          <div className="absolute -bottom-[9.5px] left-5 flex flex-col items-center z-10 pointer-events-none">
            {/* Anti-aliased Semicircle Arc Vector Curve */}
            <svg
              width="20"
              height="11"
              viewBox="0 0 20 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              shapeRendering="geometricPrecision"
              className="text-blue-500 drop-shadow-[0_2px_3px_rgba(0,0,0,0.03)] -mt-[0.5px]"
            >
              <path
                d="M0 0C0 6.075 4.477 11 10 11C15.523 11 20 6.075 20 0H0Z"
                fill="#1877F2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. USER AVATAR BASE (Positioned at Bottom-Left Under Tail) */}
      {/* ========================================================================= */}
      <div
        onClick={handleAvatarClick}
        className="relative mt-2.5 left-2 cursor-pointer z-10 transition-transform hover:scale-105 active:scale-95"
        title="点击保持/切换发言气泡显示"
      >
        {/* Avatar Ring */}
        <div
          className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-100 transition-all ${
            isExpanded ? 'ring-2 ring-[#1877F2]' : 'hover:ring-2 hover:ring-gray-300'
          }`}
        >
          <img
            src={avatarUrl}
            alt={userName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Battery & Online Badge */}
        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-xs border border-gray-100 flex items-center space-x-0.5 px-1.5 py-0.2">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          {batteryLevel !== undefined && (
            <span className="text-[9px] font-mono font-bold text-gray-700">{batteryLevel}%</span>
          )}
        </div>
      </div>
    </div>
  );
};
