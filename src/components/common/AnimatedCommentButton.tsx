import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { haptics } from '../../utils/haptics';

interface AnimatedCommentButtonProps {
  commentsCount: number;
  hasUserCommented: boolean;
  isJustCommented?: boolean;
  onClick: () => void;
  size?: number;
  className?: string;
}

// 5 sparkle dots for comment pulse
const SPARKLE_DOTS = [
  { x: -14, y: -12, color: '#1877F2', delay: 0 },
  { x: 14, y: -14, color: '#00C6FF', delay: 0.02 },
  { x: 18, y: 8, color: '#60A5FA', delay: 0.04 },
  { x: -16, y: 10, color: '#1877F2', delay: 0.03 },
  { x: 0, y: -18, color: '#38BDF8', delay: 0.01 },
];

export const AnimatedCommentButton: React.FC<AnimatedCommentButtonProps> = ({
  commentsCount,
  hasUserCommented,
  isJustCommented = false,
  onClick,
  size = 19,
  className = '',
}) => {
  const [activeAnimationKey, setActiveAnimationKey] = useState<number | null>(null);

  // Trigger animation whenever isJustCommented becomes true or commentsCount increments with hasUserCommented
  useEffect(() => {
    if (isJustCommented) {
      setActiveAnimationKey(Date.now());
      soundEffects.playBubblePopSound();
      haptics.trigger('medium');

      const timer = setTimeout(() => {
        setActiveAnimationKey(null);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isJustCommented, commentsCount]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="查看或添加评论"
      className={`relative inline-flex items-center gap-1.5 select-none cursor-pointer focus:outline-none group ${className}`}
    >
      {/* Icon Container with Shockwave & Sparkles */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size + 10, height: size + 10 }}
      >
        {/* Blue Expanding Ripple Halo on comment submit */}
        <AnimatePresence>
          {activeAnimationKey && (
            <motion.div
              key={`comment-halo-${activeAnimationKey}`}
              initial={{ scale: 0.3, opacity: 0.9, borderWidth: 3 }}
              animate={{
                scale: [0.3, 1.5],
                opacity: [0.95, 0.6, 0],
                borderWidth: [3, 1.5, 0],
              }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border border-[#1877F2] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Floating Sparkle Dots */}
        <AnimatePresence>
          {activeAnimationKey &&
            SPARKLE_DOTS.map((dot, idx) => (
              <motion.div
                key={`dot-${activeAnimationKey}-${idx}`}
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={{
                  x: [0, dot.x * 0.4, dot.x],
                  y: [0, dot.y * 0.4, dot.y],
                  scale: [0, 1.3, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.5,
                  delay: dot.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ backgroundColor: dot.color }}
                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none shadow-xs"
              />
            ))}
        </AnimatePresence>

        {/* Floating +1 Bubble Badge */}
        <AnimatePresence>
          {activeAnimationKey && (
            <motion.div
              key={`plus-one-${activeAnimationKey}`}
              initial={{ y: 0, opacity: 0, scale: 0.6 }}
              animate={{
                y: -24,
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1.15, 0.95],
              }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none select-none z-30"
            >
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#1877F2] text-white shadow-xs whitespace-nowrap">
                +1 💬
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MessageCircle Icon with Spring Pop & Wobble */}
        <motion.div
          key={hasUserCommented ? 'commented' : 'uncommented'}
          animate={
            activeAnimationKey
              ? {
                  scale: [1, 0.72, 1.35, 0.92, 1.0],
                  rotate: [0, -14, 14, -6, 0],
                }
              : hasUserCommented
              ? { scale: [0.92, 1.0] }
              : { scale: 1.0 }
          }
          whileTap={{ scale: 0.82 }}
          transition={
            activeAnimationKey
              ? {
                  duration: 0.52,
                  times: [0, 0.25, 0.55, 0.8, 1],
                  ease: 'easeOut',
                }
              : { duration: 0.2 }
          }
          className="relative flex items-center justify-center will-change-transform"
        >
          <MessageCircle
            size={size}
            className={`transition-colors duration-200 ${
              hasUserCommented
                ? 'fill-[#1877F2] text-[#1877F2] drop-shadow-[0_2px_6px_rgba(24,119,242,0.35)]'
                : 'text-[#050505] dark:text-white group-hover:text-[#1877F2]'
            }`}
          />
        </motion.div>
      </div>

      {/* Rolling Comments Count */}
      <span
        className={`text-xs font-bold tabular-nums transition-colors duration-200 overflow-hidden flex items-center leading-none ${
          hasUserCommented ? 'text-[#1877F2]' : 'text-[#050505] dark:text-white'
        }`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={commentsCount}
            initial={{ y: 6, opacity: 0, scale: 0.85 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -6, opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="inline-block"
          >
            {commentsCount}
          </motion.span>
        </AnimatePresence>
        <span className="ml-0.5">条</span>
      </span>
    </button>
  );
};
