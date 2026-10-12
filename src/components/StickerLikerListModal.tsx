import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Sparkles, UserCheck } from 'lucide-react';
import { LabelSticker } from '../types';

interface StickerLikerListModalProps {
  sticker: LabelSticker | null;
  isOpen: boolean;
  onClose: () => void;
  onLikeToggle?: (stickerId: string) => void;
}

export const StickerLikerListModal: React.FC<StickerLikerListModalProps> = ({
  sticker,
  isOpen,
  onClose,
  onLikeToggle,
}) => {
  if (!isOpen || !sticker) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-99 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-800 rounded-md w-full max-w-sm shadow-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-between bg-gray-50/70 dark:bg-zinc-800/50">
            <div className="flex items-center space-x-3">
              {/* Sticker Thumbnail Preview */}
              <div
                className="w-11 h-11 rounded-full p-0.5 shadow-2xs overflow-hidden shrink-0 flex items-center justify-center bg-gray-100 dark:bg-zinc-800"
                style={{
                  border: `${sticker.border.widthPx}px ${sticker.border.style === 'dashed' ? 'dashed' : 'solid'} ${sticker.border.color}`,
                  boxShadow: sticker.border.style === 'glow' ? `0 0 10px ${sticker.border.color}` : undefined,
                }}
              >
                <img
                  src={sticker.cutoutUrl}
                  alt={sticker.label}
                  className="w-full h-full object-contain filter drop-shadow-xs"
                />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#050505] dark:text-[#E4E6EB] flex items-center space-x-1.5">
                  <span>{sticker.label}</span>
                </h3>
                <p className="text-xs text-[#65676B] dark:text-zinc-400 flex items-center space-x-1">
                  <Heart size={11} className="fill-rose-500 text-rose-500" />
                  <span>共 {sticker.likes} 人点赞此真人贴纸</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200/70 hover:bg-gray-300 dark:bg-zinc-800 text-[#050505] dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Liker List Stream */}
          <div className="p-3 max-h-72 overflow-y-auto space-y-2 divide-y divide-[#E4E6EB]/60 dark:divide-zinc-800/60">
            {sticker.recentLikers && sticker.recentLikers.length > 0 ? (
              sticker.recentLikers.map((liker, idx) => (
                <div key={`liker-${liker.userId}-${idx}`} className="pt-2 first:pt-0 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#E4E6EB] dark:border-zinc-700 shrink-0">
                      <img
                        src={liker.avatarUrl}
                        alt={liker.userName || 'Liker'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#050505] dark:text-[#E4E6EB] flex items-center space-x-1">
                        <span>{liker.userName || `好友 ${liker.userId}`}</span>
                      </div>
                      <span className="text-[10px] text-[#65676B] dark:text-zinc-400">{liker.time || '刚刚'}</span>
                    </div>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shadow-2xs">
                    <Heart size={12} className="fill-rose-500" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#65676B] dark:text-zinc-400">
                还没有好友给这张贴纸点赞，快分享给好友吧！
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="p-3 border-t border-[#E4E6EB] dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 flex items-center justify-between">
            <span className="text-[11px] text-[#65676B] dark:text-zinc-400">
              {sticker.likedByMe ? '❤️ 你已点赞' : '🤍 点击右侧为贴纸点赞'}
            </span>
            <button
              onClick={() => onLikeToggle?.(sticker.id)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                sticker.likedByMe
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
                  : 'bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-2xs'
              }`}
            >
              <Heart size={13} className={sticker.likedByMe ? 'fill-rose-500 text-rose-500' : 'text-white'} />
              <span>{sticker.likedByMe ? '取消点赞' : '点个赞 ❤️'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
