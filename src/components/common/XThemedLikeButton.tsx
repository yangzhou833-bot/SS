import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { haptics } from '../../utils/haptics';

interface XThemedLikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onToggle: () => void;
  size?: number;
  showCount?: boolean;
  className?: string;
  labelSuffix?: string; // e.g. "赞"
}

// 7 pairs of radial particles in X/Twitter signature color palette
const PARTICLE_PAIRS = [
  { angleDeg: 0, colorA: '#F91880', colorB: '#FFD400' },
  { angleDeg: 51.4, colorA: '#794BC4', colorB: '#F91880' },
  { angleDeg: 102.8, colorA: '#1D9BF0', colorB: '#00BA7C' },
  { angleDeg: 154.3, colorA: '#00BA7C', colorB: '#FF7A00' },
  { angleDeg: 205.7, colorA: '#FF7A00', colorB: '#F91880' },
  { angleDeg: 257.1, colorA: '#E0245E', colorB: '#794BC4' },
  { angleDeg: 308.6, colorA: '#794BC4', colorB: '#1D9BF0' },
];

export const XThemedLikeButton: React.FC<XThemedLikeButtonProps> = ({
  isLiked,
  likesCount,
  onToggle,
  size = 19,
  showCount = true,
  className = '',
  labelSuffix = '赞',
}) => {
  const [animatingId, setAnimatingId] = useState<number | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      const willLike = !isLiked;
      if (willLike) {
        setAnimatingId(Date.now());
        soundEffects.playLikePopTone();
        haptics.trigger('medium');
      } else {
        setAnimatingId(null);
        soundEffects.playTapSound();
        haptics.trigger('light');
      }

      onToggle();
    },
    [isLiked, onToggle]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isLiked ? '取消点赞' : '点赞'}
      className={`relative inline-flex items-center gap-1.5 select-none cursor-pointer focus:outline-none group ${className}`}
    >
      {/* Heart Icon Container with Particles */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size + 10, height: size + 10 }}
      >
        {/* Stage 1: Central Expanding Halo Shockwave Ring */}
        <AnimatePresence>
          {animatingId && (
            <motion.div
              key={`halo-${animatingId}`}
              initial={{ scale: 0.1, opacity: 0.9, borderWidth: 3.5 }}
              animate={{
                scale: [0.1, 1.45],
                opacity: [0.95, 0.8, 0],
                borderWidth: [3.5, 2, 0.5],
              }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border border-[#E0245E] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Stage 2: 7 Pairs of Radial Sparkle Particles (14 particles total) */}
        <AnimatePresence>
          {animatingId &&
            PARTICLE_PAIRS.map((pair, idx) => {
              const radA = (pair.angleDeg * Math.PI) / 180;
              const radB = ((pair.angleDeg + 15) * Math.PI) / 180;

              // Radius trajectories
              const distA = 22;
              const distB = 27;

              const xA = Math.cos(radA) * distA;
              const yA = Math.sin(radA) * distA;
              const xB = Math.cos(radB) * distB;
              const yB = Math.sin(radB) * distB;

              return (
                <React.Fragment key={`particles-${animatingId}-${idx}`}>
                  {/* Primary Particle A */}
                  <motion.div
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{
                      x: [0, xA * 0.45, xA],
                      y: [0, yA * 0.45, yA],
                      scale: [0, 1.25, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 0.46,
                      ease: [0.16, 1, 0.3, 1],
                      times: [0, 0.3, 1],
                    }}
                    style={{ backgroundColor: pair.colorA }}
                    className="absolute w-1.5 h-1.5 rounded-full pointer-events-none shadow-xs"
                  />

                  {/* Secondary Companion Particle B */}
                  <motion.div
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{
                      x: [0, xB * 0.4, xB],
                      y: [0, yB * 0.4, yB],
                      scale: [0, 1.0, 0],
                      opacity: [0, 0.95, 0],
                    }}
                    transition={{
                      duration: 0.5,
                      delay: 0.03,
                      ease: [0.16, 1, 0.3, 1],
                      times: [0, 0.35, 1],
                    }}
                    style={{ backgroundColor: pair.colorB }}
                    className="absolute w-1 h-1 rounded-full pointer-events-none shadow-xs"
                  />
                </React.Fragment>
              );
            })}
        </AnimatePresence>

        {/* Stage 3: Heart Icon with Elastic Spring & Squash/Overshoot */}
        <motion.div
          key={isLiked ? 'liked' : 'unliked'}
          initial={isLiked ? { scale: 0.7 } : { scale: 0.92 }}
          animate={
            isLiked
              ? {
                  scale: [0.75, 1.36, 0.94, 1.0],
                }
              : {
                  scale: [1.0, 0.88, 1.0],
                }
          }
          whileTap={{ scale: 0.8 }}
          transition={
            isLiked
              ? {
                  duration: 0.45,
                  times: [0, 0.35, 0.7, 1],
                  ease: 'easeOut',
                }
              : {
                  duration: 0.2,
                  ease: 'easeOut',
                }
          }
          className="relative flex items-center justify-center will-change-transform"
        >
          <Heart
            size={size}
            className={`transition-colors duration-200 ${
              isLiked
                ? 'fill-[#E0245E] text-[#E0245E] drop-shadow-[0_2px_8px_rgba(224,36,94,0.35)]'
                : 'text-[#050505] dark:text-white group-hover:text-[#E0245E]'
            }`}
          />
        </motion.div>
      </div>

      {/* Stage 4: Rolling Counter Number */}
      {showCount && (
        <span
          className={`text-xs font-bold tabular-nums transition-colors duration-200 overflow-hidden flex items-center leading-none ${
            isLiked ? 'text-[#E0245E]' : 'text-[#050505] dark:text-white'
          }`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={likesCount}
              initial={{ y: isLiked ? 6 : -6, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: isLiked ? -6 : 6, opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="inline-block"
            >
              {likesCount}
            </motion.span>
          </AnimatePresence>
          {labelSuffix && <span className="ml-0.5">{labelSuffix}</span>}
        </span>
      )}
    </button>
  );
};
