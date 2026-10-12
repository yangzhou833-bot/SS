import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface EmojiBombingData {
  senderName: string;
  senderAvatar: string;
  emoji: string;
  count: number;
  message?: string;
}

interface EmojiBombingOverlayProps {
  bombing: EmojiBombingData | null;
  onClose: () => void;
}

export const EmojiBombingOverlay: React.FC<EmojiBombingOverlayProps> = ({
  bombing,
  onClose,
}) => {
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (bombing) {
      if (typeof window !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([150, 80, 200]);
        } catch (e) {
          // ignore
        }
      }

      const timer = setTimeout(() => {
        onCloseRef.current();
      }, 3400);

      return () => clearTimeout(timer);
    }
  }, [bombing]);

  // Memoize particles to avoid re-generating random positions on every animation frame
  const particles = useMemo(() => {
    if (!bombing) return [];
    const count = Math.min(32, Math.max(16, bombing.count || 24));
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (i % 2 === 0 ? 0.2 : -0.2);
      const distance = 140 + (i % 5) * 45;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;

      return {
        id: i,
        emoji: i % 3 === 0 ? (bombing.emoji || '💣') : i % 3 === 1 ? '💥' : (bombing.emoji || '🔥'),
        size: 32 + (i % 4) * 8, // 32px - 56px
        targetX,
        targetY,
        delay: (i % 8) * 0.03,
        rotation: (i % 2 === 0 ? 1 : -1) * (180 + (i % 6) * 45),
      };
    });
  }, [bombing?.senderName, bombing?.emoji, bombing?.count]);

  if (!bombing) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] bg-transparent pointer-events-none select-none overflow-hidden will-change-transform">
        {/* 1. Sender Avatar flying from top-left towards center user avatar */}
        <motion.div
          initial={{ x: -160, y: -180, scale: 0.6, opacity: 0 }}
          animate={{
            x: [ -160, 0, 0 ],
            y: [ -180, 0, 0 ],
            scale: [ 0.6, 1.15, 1 ],
            opacity: [ 0, 1, 1, 0 ],
          }}
          transition={{ duration: 1.6, times: [0, 0.35, 0.8, 1], ease: 'easeInOut', type: 'tween' }}
          style={{ position: 'absolute', left: '50%', top: '50%', willChange: 'transform, opacity' }}
          className="flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-30"
        >
          <div className="w-18 h-18 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-amber-400 to-amber-500 shadow-[0_4px_24px_rgba(244,63,94,0.6)]">
            <img
              src={bombing.senderAvatar}
              alt={bombing.senderName}
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="mt-1.5 bg-[#050505]/85 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-bold shadow-md border border-white/20 whitespace-nowrap flex items-center space-x-1">
            <span>{bombing.senderName}</span>
            <span className="text-amber-300">投掷表情轰炸</span>
            <span>{bombing.emoji}</span>
          </div>
        </motion.div>

        {/* 2. Emojis traveling from sender -> User Center -> Bursting Outwards smoothly */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: -160,
              y: -180,
              scale: 0.2,
              opacity: 0,
            }}
            animate={{
              x: [ -160, 0, p.targetX ],
              y: [ -180, 0, p.targetY ],
              scale: [ 0.2, 1.25, 1.05, 0.9 ],
              opacity: [ 0, 1, 1, 0 ],
              rotate: [ 0, p.rotation * 0.4, p.rotation ],
            }}
            transition={{
              duration: 2.2,
              times: [0, 0.4, 0.85, 1],
              ease: [0.22, 1, 0.36, 1],
              delay: 0.25 + p.delay,
              type: 'tween',
            }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              fontSize: `${p.size}px`,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))',
              willChange: 'transform, opacity',
            }}
            className="-translate-x-1/2 -translate-y-1/2 transform-gpu"
          >
            {p.emoji}
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};
