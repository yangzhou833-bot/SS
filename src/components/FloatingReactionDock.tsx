import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';
import { Plus } from 'lucide-react';

export interface ReactionEmojiItem {
  emoji: string;
  label: string;
  color?: string;
}

export const QUICK_REACTIONS: ReactionEmojiItem[] = [
  { emoji: '👍', label: '赞', color: '#1877F2' },
  { emoji: '❤️', label: '超爱', color: '#FA3E3E' },
  { emoji: '😂', label: '哈哈', color: '#F7B125' },
  { emoji: '😮', label: '哇哦', color: '#F7B125' },
  { emoji: '😢', label: '难过', color: '#F7B125' },
  { emoji: '😡', label: '气愤', color: '#E94635' },
  { emoji: '🔥', label: '给力', color: '#FF7A00' },
];

interface FloatingReactionDockProps {
  msgId: string;
  x: number;
  y: number;
  isTop: boolean;
  onSelectEmoji: (msgId: string, emoji: string, sourceRect?: DOMRect) => void;
  onOpenFullPicker: () => void;
  onClose: () => void;
}

export const FloatingReactionDock: React.FC<FloatingReactionDockProps> = ({
  msgId,
  x,
  y,
  isTop,
  onSelectEmoji,
  onOpenFullPicker,
  onClose,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <>
      {/* Invisible backdrop to close on outside click */}
      <div
        className="fixed inset-0 z-40 bg-transparent select-none pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      <motion.div
        id="floating-reaction-dock"
        initial={{ opacity: 0, scale: 0.75, y: isTop ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: isTop ? 8 : -8 }}
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 24,
          mass: 0.8,
        }}
        style={{
          left: `${x}px`,
          top: `${y}px`,
        }}
        className="fixed z-50 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-full border border-[#E4E6EB] shadow-[0_8px_28px_rgba(0,0,0,0.12)] flex items-center gap-1 sm:gap-1.5 select-none pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {QUICK_REACTIONS.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          const isNeighbor = hoveredIdx !== null && Math.abs(hoveredIdx - idx) === 1;

          // Scale math for dock lens curve
          let scale = 1;
          let translateY = 0;
          if (isHovered) {
            scale = 1.45;
            translateY = isTop ? -10 : -8;
          } else if (isNeighbor) {
            scale = 1.18;
            translateY = isTop ? -4 : -3;
          }

          return (
            <div
              key={item.emoji}
              className="relative flex flex-col items-center"
              onMouseEnter={() => {
                setHoveredIdx(idx);
                haptics.trigger('light');
              }}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip Label */}
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, y: 4, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 2, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-7 px-2 py-0.5 rounded-full bg-[#1C1E21]/90 text-white text-[10px] font-bold shadow-md whitespace-nowrap pointer-events-none z-30"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Emoji Button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                animate={{
                  scale,
                  y: translateY,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 20,
                }}
                onClick={(e) => {
                  const targetRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  soundEffects.playBubblePopSound();
                  haptics.trigger('medium');
                  onSelectEmoji(msgId, item.emoji, targetRect);
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-2xl sm:text-[26px] leading-none cursor-pointer outline-none transition-shadow rounded-full hover:bg-black/5"
                title={`${item.label} (${item.emoji})`}
              >
                <span className="transform-gpu inline-block drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]">
                  {item.emoji}
                </span>
              </motion.button>
            </div>
          );
        })}

        {/* Divider */}
        <div className="w-[1px] h-5 bg-[#E4E6EB] mx-0.5" />

        {/* More Emojis Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => {
            soundEffects.playTapSound();
            haptics.trigger('light');
            onOpenFullPicker();
          }}
          className="w-7 h-7 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] hover:text-[#1C1E21] flex items-center justify-center transition-colors cursor-pointer"
          title="更多表情"
        >
          <Plus size={15} className="stroke-[2.5]" />
        </motion.button>
      </motion.div>
    </>
  );
};
