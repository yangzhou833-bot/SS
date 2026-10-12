import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2 } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { haptics } from '../../utils/haptics';

export interface UnifiedShareButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  showLabel?: boolean;
  size?: number;
  className?: string;
  variant?: 'action-bar' | 'icon-only' | 'pill' | 'outline' | 'subtle';
  title?: string;
  ariaLabel?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

// 6 Emerald / Mint particles shooting out upon sharing
const SHARE_BURST_PARTICLES = [
  { deg: 0, color: '#31A24C' },
  { deg: 60, color: '#10B981' },
  { deg: 120, color: '#00C368' },
  { deg: 180, color: '#31A24C' },
  { deg: 240, color: '#34D399' },
  { deg: 300, color: '#059669' },
];

export const UnifiedShareButton: React.FC<UnifiedShareButtonProps> = ({
  onClick,
  label = '转发',
  showLabel = true,
  size = 18,
  className = '',
  variant = 'action-bar',
  title = '分享',
  ariaLabel,
  disabled = false,
  children,
}) => {
  const [animatingId, setAnimatingId] = useState<number | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (disabled) return;

      setAnimatingId(Date.now());
      soundEffects.playShareSound();
      haptics.trigger('light');

      setTimeout(() => {
        setAnimatingId((prev) => (prev ? null : null));
      }, 650);

      if (onClick) {
        onClick(e);
      }
    },
    [disabled, onClick]
  );

  // Variant base style mappings
  let variantClasses = '';
  switch (variant) {
    case 'action-bar':
      // Green Facebook action bar style with bold text
      variantClasses =
        'flex items-center space-x-1.5 text-[#31A24C] hover:text-[#28843F] active:text-[#206C34] transition-colors cursor-pointer select-none';
      break;
    case 'pill':
      variantClasses =
        'inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#EBF7EE] hover:bg-[#D8F2DD] active:bg-[#C5ECD0] text-[#31A24C] font-semibold text-xs border border-[#31A24C]/30 rounded-md transition-all shadow-2xs cursor-pointer select-none';
      break;
    case 'outline':
      variantClasses =
        'inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-[#EBF7EE] text-[#31A24C] font-bold text-xs border border-[#31A24C] hover:border-[#28843F] rounded-md transition-colors shadow-2xs cursor-pointer select-none';
      break;
    case 'subtle':
      variantClasses =
        'flex items-center space-x-1 text-[#31A24C] hover:bg-[#EBF7EE] px-1.5 py-1 rounded-md transition-colors cursor-pointer select-none';
      break;
    case 'icon-only':
    default:
      variantClasses =
        'relative p-1 text-[#31A24C] hover:text-[#28843F] active:text-[#206C34] transition-all cursor-pointer flex items-center justify-center select-none';
      break;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || (showLabel && label ? label : title)}
      className={`${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Animated Green Spring Pop Icon */}
        <motion.div
          animate={
            animatingId
              ? {
                  scale: [1, 1.42, 0.86, 1.18, 1],
                  rotate: [0, -14, 8, -3, 0],
                }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.52, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          <Share2
            size={size}
            className={`transition-colors shrink-0 text-[#31A24C] filter ${
              animatingId ? 'drop-shadow-[0_2px_6px_rgba(49,162,76,0.45)]' : ''
            }`}
          />
        </motion.div>

        {/* Emerald Shockwave Halo Ring */}
        <AnimatePresence>
          {animatingId && (
            <motion.div
              key={`share-halo-${animatingId}`}
              initial={{ scale: 0.2, opacity: 0.95, borderWidth: 3 }}
              animate={{
                scale: [0.2, 1.8],
                opacity: [0.95, 0.65, 0],
                borderWidth: [3, 1.5, 0],
              }}
              transition={{ duration: 0.48, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border border-[#31A24C] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* 6 Emerald Sparkle Particles Burst */}
        <AnimatePresence>
          {animatingId && (
            <motion.div
              key={`share-particles-${animatingId}`}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
              {SHARE_BURST_PARTICLES.map((p, idx) => {
                const rad = (p.deg * Math.PI) / 180;
                const distance = size + 6;
                const targetX = Math.cos(rad) * distance;
                const targetY = Math.sin(rad) * distance;

                return (
                  <motion.span
                    key={`p-${idx}`}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                    animate={{
                      opacity: [1, 1, 0],
                      x: targetX,
                      y: targetY,
                      scale: [0.5, 1.25, 0.2],
                    }}
                    transition={{ duration: 0.55, ease: 'easeOut', delay: idx * 0.015 }}
                    style={{ color: p.color }}
                    className="absolute text-[8px] font-black leading-none select-none"
                  >
                    ✦
                  </motion.span>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {children ? (
        children
      ) : showLabel && label ? (
        <span className="text-xs font-bold text-[#31A24C] hover:text-[#28843F] transition-colors leading-none">
          {label}
        </span>
      ) : null}
    </button>
  );
};
