import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Battery, Shield, Users, ArrowUpRight } from 'lucide-react';
import { Friend, LabelSticker } from '../types';
import { INITIAL_USER_STICKERS, calculateOrbitAngles } from '../data/stickerData';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

interface MapAvatarEnlargeOverlayProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToProfile: (friend: Friend) => void;
  onShowToast?: (msg: string) => void;
}

export const MapAvatarEnlargeOverlay: React.FC<MapAvatarEnlargeOverlayProps> = ({
  friend,
  isOpen,
  onClose,
  onProceedToProfile,
  onShowToast,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onProceedToProfileRef = useRef(onProceedToProfile);
  onProceedToProfileRef.current = onProceedToProfile;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [bouncingStickerId, setBouncingStickerId] = useState<string | null>(null);
  const [heartPops, setHeartPops] = useState<{ id: number; stickerId: string; x: number; y: number }[]>([]);
  const [stickersState, setStickersState] = useState<LabelSticker[]>([]);

  useEffect(() => {
    if (friend) {
      if (friend.stickers && friend.stickers.length > 0) {
        setStickersState(friend.stickers);
      } else {
        // Sample friend stickers if available or empty for new user
        if (friend.name.includes('Sarah') || friend.name.includes('Alex')) {
          setStickersState(INITIAL_USER_STICKERS.slice(0, 3));
        } else {
          setStickersState(friend.stickers || []);
        }
      }
    }
  }, [friend?.id]);

  // Handle Sticker Like Tap inside enlarged view
  const handleStickerLikeTap = (sticker: LabelSticker, e: React.MouseEvent) => {
    e.stopPropagation(); // CRITICAL: Stop propagation so bottom sheet profile is NOT opened

    // Reset hold timer so user has time to tap more stickers
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onProceedToProfile(friend!);
      onClose();
    }, 1800);

    // Bounce animation
    setBouncingStickerId(sticker.id);
    setTimeout(() => setBouncingStickerId(null), 350);

    // Heart pop effect
    const popId = Date.now() + Math.random();
    setHeartPops((prev) => [
      ...prev,
      { id: popId, stickerId: sticker.id, x: (Math.random() - 0.5) * 20, y: -20 },
    ]);
    setTimeout(() => {
      setHeartPops((prev) => prev.filter((p) => p.id !== popId));
    }, 800);

    // Sound & Haptic
    soundEffects.playHeartPopTone();
    haptics.trigger('light');

    // Update sticker like count
    setStickersState((prev) =>
      prev.map((s) => {
        if (s.id === sticker.id) {
          const isLiked = !s.likedByMe;
          const nextCount = isLiked ? s.likes + 1 : Math.max(0, s.likes - 1);
          return { ...s, likedByMe: isLiked, likes: nextCount };
        }
        return s;
      })
    );

    if (onShowToast) {
      onShowToast(`❤️ 点赞了「${friend?.name}」的【${sticker.label}】标签贴纸！`);
    }
  };

  useEffect(() => {
    if (isOpen && friend) {
      // Auto-transition to profile card after 1.2s if no sticker interaction happens
      timerRef.current = setTimeout(() => {
        onProceedToProfileRef.current(friend);
        onCloseRef.current();
      }, 1400);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, friend?.id]);

  if (!isOpen || !friend) return null;

  const orbitRadius = 140; // Proportional to 1.8x enlarged avatar (130px avatar diameter)
  const visibleStickers = stickersState.slice(0, 6);
  const angles = calculateOrbitAngles(visibleStickers.length);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none font-sans"
        onClick={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          onProceedToProfile(friend);
          onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 360 }}
          className="flex flex-col items-center justify-center p-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main Orbit Stage Container */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: orbitRadius * 2 + 100, height: orbitRadius * 2 + 100 }}
          >
            {/* Overhead Speech Bubble / Status */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute -top-6 z-40 px-3.5 py-1.5 bg-white/95 dark:bg-zinc-800/95 text-[#050505] dark:text-[#E4E6EB] text-xs font-black rounded-full border border-[#E4E6EB] dark:border-zinc-700 shadow-xl flex items-center space-x-1.5 whitespace-nowrap backdrop-blur-xs cursor-pointer"
              onClick={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                onProceedToProfile(friend);
                onClose();
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{friend.profileDetail?.signature || friend.statusText || '正在附近漫步探索 ✨'}</span>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-800 rotate-45 border-r border-b border-[#E4E6EB] dark:border-zinc-700 -z-10" />
            </motion.div>

            {/* Orbiting Ring Guide Track */}
            {visibleStickers.length > 0 && (
              <div
                className="absolute rounded-full border border-dashed border-white/40 dark:border-blue-400/40 pointer-events-none animate-pulse"
                style={{
                  width: orbitRadius * 2,
                  height: orbitRadius * 2,
                }}
              />
            )}

            {/* Central Enlarged Friend Avatar (130px, z-20) */}
            <div
              className="relative z-20 shrink-0 group cursor-pointer"
              onClick={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                onProceedToProfile(friend);
                onClose();
              }}
              style={{ width: 130, height: 130 }}
            >
              {/* Avatar Container with glowing border */}
              <div className="w-full h-full rounded-full border-4 border-white dark:border-zinc-800 shadow-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 group-hover:scale-105 group-hover:border-[#1877F2] transition-all">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Top-Left: Mood Emoji Badge */}
              <div
                className="absolute -top-1.5 -left-1.5 z-30 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 text-base flex items-center justify-center ring-2 ring-white dark:ring-zinc-700 shadow-sm"
                title={`心情: ${friend.moodEmoji || friend.mood || '🌟'}`}
              >
                <span>{friend.moodEmoji || friend.mood || '🌟'}</span>
              </div>

              {/* Top-Right: Battery Badge */}
              {(friend.batteryLevel !== undefined || friend.battery !== undefined) && (
                <div
                  className="absolute -top-1.5 -right-1.5 z-30 px-2 py-0.5 rounded-full bg-black/80 text-white text-[10px] font-black flex items-center space-x-0.5 ring-2 ring-white shadow-2xs"
                  title={`电量 ${friend.batteryLevel ?? friend.battery}%`}
                >
                  <Battery size={11} className={(friend.batteryLevel ?? friend.battery ?? 100) <= 20 ? 'text-rose-400' : 'text-emerald-400'} />
                  <span>{friend.batteryLevel ?? friend.battery}%</span>
                </div>
              )}

              {/* Bottom-Left: Behavior Status */}
              <div
                className="absolute -bottom-1.5 -left-1.5 z-30 px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-800 text-[#1877F2] text-[10px] font-black ring-2 ring-white dark:ring-zinc-700 shadow-2xs"
              >
                <span>{friend.speed ? `🚴 ${friend.speed}` : friend.stayDuration ? `⏱️ ${friend.stayDuration}` : '📍 刚刚到达'}</span>
              </div>

              {/* Bottom-Right: Relationship Badge */}
              <div className="absolute -bottom-1 -right-1 z-30 w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0">
                {friend.relationship === 'family' || friend.isFamily ? (
                  <span className="w-full h-full rounded-full bg-rose-500 text-white flex items-center justify-center">
                    <Heart size={12} className="fill-white" />
                  </span>
                ) : friend.relationship === 'close' || friend.isCloseFriend ? (
                  <span className="w-full h-full rounded-full bg-purple-500 text-white flex items-center justify-center">
                    <Sparkles size={12} className="fill-white" />
                  </span>
                ) : friend.relationship === 'team' ? (
                  <span className="w-full h-full rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Shield size={12} className="fill-white" />
                  </span>
                ) : (
                  <span className="w-full h-full rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <Users size={12} className="text-white" />
                  </span>
                )}
              </div>
            </div>

            {/* Orbiting Cutout Label Stickers Ring (z-30: sitting on top with gesture disambiguation) */}
            {visibleStickers.map((sticker, index) => {
              const angleDeg = sticker.orbit?.angleDeg ?? angles[index] ?? 45;
              const rad = (angleDeg * Math.PI) / 180;
              const x = Math.cos(rad) * orbitRadius;
              const y = Math.sin(rad) * orbitRadius;
              const isBouncing = bouncingStickerId === sticker.id;

              return (
                <motion.div
                  key={`overlay-sticker-${sticker.id}-${index}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isBouncing ? 1.3 : 1,
                    opacity: 1,
                    x,
                    y: [y - 5, y + 5, y - 5],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{
                    scale: { type: 'spring', damping: 15, stiffness: 350 },
                    y: { repeat: Infinity, duration: 4 + (index % 3), ease: 'easeInOut', delay: index * 0.2 },
                    rotate: { repeat: Infinity, duration: 6 + (index % 2) * 2, ease: 'easeInOut', delay: index * 0.2 },
                  }}
                  onClick={(e) => handleStickerLikeTap(sticker, e)}
                  className="absolute z-30 cursor-pointer flex flex-col items-center group select-none"
                >
                  {/* Cutout Body with Border & Glow */}
                  <div
                    className="relative rounded-full p-0.5 overflow-hidden transition-all filter drop-shadow-lg group-hover:scale-115"
                    style={{
                      width: 52,
                      height: 52,
                      border: `${sticker.border.widthPx}px ${sticker.border.style === 'dashed' ? 'dashed' : 'solid'} ${sticker.border.color}`,
                      boxShadow:
                        sticker.border.style === 'glow'
                          ? `0 0 14px ${sticker.border.color}`
                          : '0 4px 10px rgba(0,0,0,0.25)',
                    }}
                  >
                    <img
                      src={sticker.cutoutUrl}
                      alt={sticker.label}
                      className="w-full h-full object-contain pointer-events-none"
                    />

                    {/* Burst Particle when Liked */}
                    {heartPops
                      .filter((p) => p.stickerId === sticker.id)
                      .map((p) => (
                        <motion.div
                          key={`pop-${p.id}`}
                          initial={{ opacity: 1, scale: 0.6, x: p.x, y: 0 }}
                          animate={{ opacity: 0, scale: 2.2, x: p.x * 2, y: -45 }}
                          transition={{ duration: 0.75, ease: 'easeOut' }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 text-rose-500 text-2xl select-none"
                        >
                          ❤️
                        </motion.div>
                      ))}
                  </div>

                  {/* Like Badge at Bottom-Right Corner */}
                  <div
                    className={`absolute -bottom-1 -right-1 z-40 px-1.5 py-0.5 rounded-full text-[9px] font-black flex items-center space-x-0.5 shadow-md border ${
                      sticker.likedByMe
                        ? 'bg-rose-50 border-rose-300 text-rose-600 ring-1 ring-rose-200'
                        : 'bg-white/95 dark:bg-zinc-800/95 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="text-[9px]">❤️</span>
                    <span>{sticker.likes > 999 ? '1k+' : sticker.likes}</span>
                  </div>

                  {/* Label tag */}
                  {sticker.label && (
                    <div className="mt-1 px-2 py-0.5 bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold rounded-full shadow-md whitespace-nowrap">
                      {sticker.label}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Tap Hint */}
          <div className="mt-4 flex items-center space-x-2 text-white/80 text-xs font-semibold bg-black/40 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 shadow-lg">
            <span>✨ 点击贴纸送出点赞 · 点击头像进入名片</span>
            <ArrowUpRight size={13} className="text-[#1877F2]" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
