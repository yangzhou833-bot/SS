import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Sparkles } from 'lucide-react';
import { EMOJI_CATEGORY_LIST, EMOJI_DATA } from '../ChatView';
import { USER_IMAGE_STICKERS, isCustomSticker, renderCustomSticker } from './StickerCatalog';

interface TelegramEmojiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (
    emoji: string,
    sourceRect?: DOMRect,
    behavior?: 'default' | 'send',
  ) => void;
  onEmojiHoldStart?: (emoji: string, sourceRect?: DOMRect) => void;
  onEmojiHoldEnd?: (emoji: string) => void;
  onEmojiHoldCancel?: () => void;
  recentEmojis: string[];
  reduceMotion?: boolean;
}

const TABS = [
  { id: 'recent', label: '最近' },
  { id: 'emoji', label: '表情' },
  { id: 'stickers', label: '贴纸' },
  { id: 'gif', label: 'GIF' },
] as const;

const STICKERS = [
  { emoji: '🔥', label: '赞爆了', className: 'from-amber-100 to-orange-200' },
  { emoji: '💖', label: '比心心', className: 'from-rose-100 to-pink-200' },
  { emoji: '🎉', label: '庆祝', className: 'from-sky-100 to-blue-200' },
  { emoji: '👍', label: '可以', className: 'from-emerald-100 to-teal-200' },
  { emoji: '🥳', label: '开心', className: 'from-violet-100 to-fuchsia-200' },
  { emoji: '☕', label: '休息', className: 'from-stone-100 to-amber-200' },
];

const GIFS = [
  { emoji: '👏', label: '鼓掌', className: 'from-amber-200 via-orange-100 to-rose-200' },
  { emoji: '🚀', label: '出发', className: 'from-sky-200 via-cyan-100 to-blue-200' },
  { emoji: '😂', label: '大笑', className: 'from-yellow-200 via-amber-100 to-orange-200' },
  { emoji: '🎊', label: '庆祝', className: 'from-fuchsia-200 via-pink-100 to-violet-200' },
  { emoji: '💪', label: '加油', className: 'from-emerald-200 via-lime-100 to-teal-200' },
  { emoji: '❤️', label: '喜欢', className: 'from-rose-200 via-pink-100 to-red-200' },
];

export const TelegramEmojiPanel: React.FC<TelegramEmojiPanelProps> = ({
  isOpen,
  onClose,
  onEmojiSelect,
  onEmojiHoldStart,
  onEmojiHoldEnd,
  onEmojiHoldCancel,
  recentEmojis,
  reduceMotion = false,
}) => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('recent');
  const [activeCategory, setActiveCategory] = useState('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const pressRef = useRef<{
    emoji: string;
    timer: number;
    rect: DOMRect;
    startX: number;
    startY: number;
    isLongPress: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const categories = useMemo(
    () => EMOJI_CATEGORY_LIST.filter((category) => category.id !== 'recent'),
    [],
  );
  const allEmojis = useMemo(
    () => Array.from(new Set(Object.values(EMOJI_DATA).flatMap((category) => category.emojis))),
    [],
  );
  const recentList = recentEmojis.length > 0 ? recentEmojis : allEmojis.slice(0, 24);
  const searchedEmojis = useMemo(() => {
    const query = searchTerm.trim();
    if (!query) return null;
    return allEmojis.filter((emoji) => emoji.includes(query));
  }, [allEmojis, searchTerm]);
  const categoryEmojis = EMOJI_DATA[activeCategory]?.emojis ?? allEmojis.slice(0, 24);

  const searchedStickers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return USER_IMAGE_STICKERS;
    return USER_IMAGE_STICKERS.filter(
      (s) => s.label.toLowerCase().includes(query) || s.name.toLowerCase().includes(query),
    );
  }, [searchTerm]);

  const emitEmoji = (
    emoji: string,
    sourceRect?: DOMRect,
    behavior: 'default' | 'send' = 'default',
  ) => {
    onEmojiSelect(emoji, sourceRect, behavior);
  };

  const cancelEmojiPress = () => {
    if (pressRef.current) window.clearTimeout(pressRef.current.timer);
    pressRef.current = null;
    onEmojiHoldCancel?.();
  };

  const finishEmojiPress = (emoji: string, emitShortPress: boolean) => {
    const press = pressRef.current;
    if (!press || press.emoji !== emoji) return;
    window.clearTimeout(press.timer);
    pressRef.current = null;

    if (press.isLongPress) {
      suppressClickRef.current = true;
      onEmojiHoldEnd?.(emoji);
    } else if (emitShortPress) {
      suppressClickRef.current = true;
      emitEmoji(emoji, press.rect);
    }
  };

  const getEmojiPressHandlers = (emoji: string) => ({
    onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      cancelEmojiPress();
      const rect = event.currentTarget.getBoundingClientRect();
      const press = {
        emoji,
        rect,
        startX: event.clientX,
        startY: event.clientY,
        isLongPress: false,
        timer: 0,
      };
      press.timer = window.setTimeout(() => {
        if (!pressRef.current || pressRef.current.emoji !== emoji) return;
        pressRef.current.isLongPress = true;
        onEmojiHoldStart?.(emoji, rect);
      }, 360);
      pressRef.current = press;
    },
    onMouseMove: (event: React.MouseEvent<HTMLButtonElement>) => {
      const press = pressRef.current;
      if (!press || press.emoji !== emoji || press.isLongPress) return;
      if (
        Math.abs(event.clientX - press.startX) > 8 ||
        Math.abs(event.clientY - press.startY) > 8
      ) {
        cancelEmojiPress();
      }
    },
    onMouseUp: () => finishEmojiPress(emoji, false),
    onMouseLeave: cancelEmojiPress,
    onTouchStart: (event: React.TouchEvent<HTMLButtonElement>) => {
      cancelEmojiPress();
      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      const press = {
        emoji,
        rect,
        startX: touch.clientX,
        startY: touch.clientY,
        isLongPress: false,
        timer: 0,
      };
      press.timer = window.setTimeout(() => {
        if (!pressRef.current || pressRef.current.emoji !== emoji) return;
        pressRef.current.isLongPress = true;
        onEmojiHoldStart?.(emoji, rect);
      }, 360);
      pressRef.current = press;
    },
    onTouchMove: (event: React.TouchEvent<HTMLButtonElement>) => {
      const press = pressRef.current;
      const touch = event.touches[0];
      if (!press || press.emoji !== emoji || press.isLongPress) return;
      if (
        Math.abs(touch.clientX - press.startX) > 8 ||
        Math.abs(touch.clientY - press.startY) > 8
      ) {
        cancelEmojiPress();
      }
    },
    onTouchEnd: () => finishEmojiPress(emoji, true),
    onTouchCancel: cancelEmojiPress,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }
      emitEmoji(emoji, event.currentTarget.getBoundingClientRect());
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      emitEmoji(emoji, event.currentTarget.getBoundingClientRect());
    },
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.section
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 300, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: 'spring', damping: 27, stiffness: 320, mass: 0.8 }
          }
          className="bg-white border-t-2 border-[#1877F2] w-full z-[100] flex flex-col overflow-hidden shadow-lg"
          aria-label="表情与贴纸面板"
        >
          <div className="w-10 h-1 bg-[#CED0D4] rounded-full mt-2 mx-auto shrink-0" />

          <div className="flex items-end px-3 pt-1 shrink-0">
            <div className="flex flex-1 items-end gap-1 overflow-x-auto scrollbar-none">
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchTerm('');
                    }}
                    className={`relative px-3 py-2 text-[12px] font-bold transition-all active:scale-95 flex items-center gap-1 ${
                      active ? 'text-[#1877F2]' : 'text-[#65676B] hover:text-[#050505]'
                    }`}
                    title={`打开${tab.label}`}
                  >
                    <span>{tab.label}</span>
                    {tab.id === 'stickers' && (
                      <span className="text-[8.5px] px-1 py-0.2 rounded bg-blue-50 text-[#1877F2] font-black border border-blue-200">
                        NEW
                      </span>
                    )}
                    {active && (
                      <motion.span
                        layoutId="telegram-emoji-tab"
                        className="absolute left-2 right-2 bottom-0 h-0.5 rounded-full bg-[#1877F2]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mb-1 w-7 h-7 rounded-full flex items-center justify-center text-[#65676B] hover:bg-[#F0F2F5] active:scale-90 transition-all"
              title="关闭表情面板"
              aria-label="关闭表情面板"
            >
              ×
            </button>
          </div>

          {activeTab !== 'recent' && (
            <div className="px-3 pt-1 pb-2 shrink-0">
              <label className="flex items-center gap-2 h-8 px-3 rounded-full bg-[#F0F2F5] text-[#65676B] focus-within:ring-1 focus-within:ring-[#1877F2]/30">
                <Search size={14} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-xs text-[#050505] outline-none placeholder:text-[#8A8D91]"
                  placeholder={activeTab === 'stickers' ? "搜索贴纸 (如: 心心, 哭, 啤酒...)" : "搜索表情"}
                  aria-label="搜索表情与贴纸"
                />
              </label>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {activeTab === 'recent' && (
              <div className="grid grid-cols-8 gap-1 px-2 pb-3">
                {recentList.map((emoji, index) => (
                  <button
                    key={`${emoji}-${index}`}
                    type="button"
                    {...getEmojiPressHandlers(emoji)}
                    className="aspect-square rounded-lg text-[25px] leading-none flex items-center justify-center hover:bg-[#F0F2F5] active:scale-75 transition-transform"
                    title={`选择 ${emoji}`}
                  >
                    {isCustomSticker(emoji) ? (
                      <span className="flex items-center justify-center pointer-events-none">
                        {renderCustomSticker(emoji, 28)}
                      </span>
                    ) : (
                      emoji
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'emoji' && (
              <>
                {!searchedEmojis && (
                  <div className="flex items-center gap-1 px-2 pb-2 overflow-x-auto scrollbar-none">
                    {categories.map((category) => {
                      const active = activeCategory === category.id;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setActiveCategory(category.id)}
                          className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 ${
                            active
                              ? 'bg-[#E7F3FF] text-[#1877F2]'
                              : 'bg-[#F0F2F5] text-[#65676B] hover:bg-[#E4E6EB]'
                          }`}
                        >
                          {category.icon} {category.name}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="grid grid-cols-8 gap-1 px-2 pb-3">
                  {(searchedEmojis ?? categoryEmojis).map((emoji, index) => (
                    <button
                      key={`${emoji}-${index}`}
                      type="button"
                      {...getEmojiPressHandlers(emoji)}
                      className="aspect-square rounded-lg text-[25px] leading-none flex items-center justify-center hover:bg-[#F0F2F5] active:scale-75 transition-transform"
                      title={`选择 ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'stickers' && (
              <div className="px-3 pb-3 space-y-3">
                {/* 3D Special Custom Sticker Pack from User Image inside prominent Blue Frame */}
                <div className="border-2 border-[#1877F2] rounded-lg bg-gradient-to-b from-blue-50/40 via-white to-white p-2.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles size={13} className="text-[#1877F2]" />
                      <span className="text-[11.5px] font-black text-[#050505] tracking-tight">
                        潮流立体表情贴纸 (9款独立个体)
                      </span>
                    </div>
                    <span className="text-[9px] bg-[#1877F2] text-white font-extrabold px-1.5 py-0.5 rounded shadow-2xs">
                      贴纸专属蓝框
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {searchedStickers.map((sticker) => (
                      <button
                        key={`custom-3d-sticker-${sticker.id}`}
                        type="button"
                        onClick={(event) =>
                          emitEmoji(
                            sticker.id,
                            event.currentTarget.getBoundingClientRect(),
                            'send',
                          )
                        }
                        className="group relative aspect-[1.1] rounded-md bg-white border border-[#1877F2]/40 hover:border-[#1877F2] hover:bg-blue-50/25 flex flex-col items-center justify-center p-1.5 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer overflow-hidden"
                        title={`点击发送「${sticker.label}」`}
                      >
                        <div className="transform transition-transform duration-200 group-hover:scale-110 flex items-center justify-center">
                          {sticker.render(50)}
                        </div>
                        <span className="mt-1 text-[9.5px] font-extrabold text-[#050505] group-hover:text-[#1877F2] truncate max-w-full leading-none transition-colors">
                          {sticker.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {searchedStickers.length === 0 && (
                    <div className="py-4 text-center text-xs text-gray-400 font-bold">
                      未找到相关贴纸
                    </div>
                  )}
                </div>

                {/* Classic Fast Stickers */}
                <div className="pt-1 border-t border-gray-100">
                  <div className="text-[10.5px] font-bold text-[#65676B] mb-1.5 px-1">
                    经典快捷贴纸
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {STICKERS.map((sticker, index) => (
                      <button
                        key={`tg-sticker-${sticker.label}-${index}`}
                        type="button"
                        onClick={(event) =>
                          emitEmoji(
                            sticker.emoji,
                            event.currentTarget.getBoundingClientRect(),
                            'send',
                          )
                        }
                        className={`aspect-[1.3] rounded-md bg-gradient-to-br ${sticker.className} border border-transparent hover:border-[#1877F2]/40 flex flex-col items-center justify-center shadow-2xs hover:brightness-105 active:scale-90 transition-all cursor-pointer`}
                        title={`发送贴纸 ${sticker.label}`}
                      >
                        <span className="text-3xl drop-shadow-xs">{sticker.emoji}</span>
                        <span className="mt-1 text-[9.5px] font-bold text-gray-700">{sticker.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gif' && (
              <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                {GIFS.map((gif, index) => (
                  <button
                    key={`tg-gif-${gif.label}-${index}`}
                    type="button"
                    onClick={(event) =>
                      emitEmoji(
                        gif.emoji,
                        event.currentTarget.getBoundingClientRect(),
                        'send',
                      )
                    }
                    className={`relative h-20 overflow-hidden rounded-xl bg-gradient-to-br ${gif.className} active:scale-90 transition-transform`}
                    title={`发送动图 ${gif.label}`}
                  >
                    <motion.span
                      animate={
                        reduceMotion
                          ? { scale: 1, rotate: 0 }
                          : { scale: [1, 1.12, 1], rotate: [0, index % 2 ? 6 : -6, 0] }
                      }
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              duration: 1.8 + index * 0.1,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }
                      }
                      className="absolute inset-0 flex items-center justify-center text-4xl"
                    >
                      {gif.emoji}
                    </motion.span>
                    <span className="absolute left-2 bottom-1.5 text-[9px] font-black text-gray-800/75">
                      GIF · {gif.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};
