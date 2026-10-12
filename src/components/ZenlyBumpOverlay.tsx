import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Heart, Flame, Sparkles, X } from 'lucide-react';
import { Friend } from '../types';

interface ZenlyBumpOverlayProps {
  friend: Friend | null;
  userAvatar?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ZenlyBumpOverlay: React.FC<ZenlyBumpOverlayProps> = ({
  friend,
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  isOpen,
  onClose,
}) => {
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (isOpen) {
      // Haptic feedback & Web Audio impact sound
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 50, 150]);
      }

      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } catch {
        // audio might be prevented
      }

      const timer = setTimeout(() => {
        onCloseRef.current();
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !friend) return null;

  // Generate 24 burst particles for explosion
  const burstParticles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const dist = 110 + (i % 4) * 40;
    const emojis = ['💥', '❤️', '🔥', '⚡️', '✨', '🎉', '🌟'];
    return {
      id: i,
      emoji: emojis[i % emojis.length],
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      scale: 0.8 + (i % 3) * 0.4,
    };
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs select-none pointer-events-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white p-2 cursor-pointer z-50"
        >
          <X size={22} />
        </button>

        <div className="relative flex items-center justify-center w-full max-w-sm px-4">
          
          {/* 1. Left Avatar (Me) - Charging from left */}
          <motion.div
            initial={{ x: -160, scale: 0.7, opacity: 0 }}
            animate={{ x: -28, scale: 1.1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 280, delay: 0.1 }}
            className="flex flex-col items-center z-20"
          >
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-[0_0_32px_rgba(59,130,246,0.8)] ring-4 ring-white">
              <img
                src={userAvatar}
                alt="Me"
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="mt-2 bg-white/90 text-[#050505] font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md">
              我 (Alexia)
            </span>
          </motion.div>

          {/* 2. Impact Center Badge: BUMP! */}
          <motion.div
            initial={{ scale: 0, rotate: -25, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], rotate: [-25, 10, 0], opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
            className="absolute z-30 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-[0_0_36px_rgba(249,115,22,0.9)] ring-4 ring-yellow-300 animate-zenly-bump">
              <Zap size={32} className="text-white fill-yellow-200" />
            </div>
            <div className="mt-2 bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-xl border-2 border-yellow-300 tracking-wider">
              BUMP! 碰一碰
            </div>
          </motion.div>

          {/* 3. Right Avatar (Friend) - Charging from right */}
          <motion.div
            initial={{ x: 160, scale: 0.7, opacity: 0 }}
            animate={{ x: 28, scale: 1.1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 280, delay: 0.1 }}
            className="flex flex-col items-center z-20"
          >
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-orange-400 to-rose-600 shadow-[0_0_32px_rgba(244,63,94,0.8)] ring-4 ring-white">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="mt-2 bg-white/90 text-[#050505] font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md">
              {friend.name}
            </span>
          </motion.div>

          {/* 4. Burst Particles */}
          {burstParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                scale: [0, p.scale, 0.4],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.4, delay: 0.28, ease: 'easeOut' }}
              className="absolute text-2xl pointer-events-none z-40"
            >
              {p.emoji}
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-12 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-md border border-[#E4E6EB] shadow-xl text-center"
        >
          <p className="text-xs font-bold text-[#050505] flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            <span>碰一碰成功！双方已同步建立 Zenly 专属灵动足迹</span>
          </p>
          <p className="text-[10px] text-[#65676B] mt-0.5">
            与【{friend.name}】在此刻合体打卡 · 保持紧密守护
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
