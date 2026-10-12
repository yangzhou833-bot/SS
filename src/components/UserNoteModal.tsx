import React, { useState } from 'react';
import {
  X,
  Palette,
  Music,
  MapPin,
  Users,
  ChevronRight,
  Check,
  Sparkles,
  Lock,
} from 'lucide-react';

export function getContrastColor(hexColor: string) {
  if (!hexColor || !hexColor.startsWith('#')) {
    if (hexColor === 'white') return { text: '#111827', border: 'rgba(0,0,0,0.1)', placeholder: 'text-gray-400', isDark: false };
    return { text: '#ffffff', border: 'transparent', placeholder: 'text-white/70', isDark: true };
  }
  
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  
  return yiq >= 180 
    ? { text: '#111827', border: 'rgba(0,0,0,0.08)', placeholder: 'text-gray-500', isDark: false } 
    : { text: '#ffffff', border: 'rgba(255,255,255,0.15)', placeholder: 'text-white/70', isDark: true };
}

interface UserNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  userNote: string;
  attachedEmoji: string;
  noteTheme: string;
  userAvatar?: string;
  onUpdateUserNote: (note: string, emoji: string, theme: string, avatar?: string) => void;
  onOpenCreateSticker?: () => void;
}

const EMOJI_OPTIONS = [
  '😜', '🌟', '🎵', '🔥', '☕️', '🏃‍♂️', '🎧', '✈️',
  '🌈', '✨', '🐱', '🍕', '🎉', '💪', '🌸', '🏀',
  '🐶', '🦊', '🐰', '🐼', '🐨', '🐯', '🦁', '🐸',
  '🍔', '🍟', '🍣', '🍦', '🍩', '🍪', '🥤', '🍺',
  '⚽️', '🏸', '🛹', '🎮', '🎤', '🎬', '🎸', '🎨',
  '☀️', '🌊', '❄️', '🍀', '⛺️', '🏠', '🚗', '🛵',
  '🔮', '🧸', '🎈', '🔑', '💌', '💎', '💡', '🚀'
];

export const PALETTE_COLORS = [
  // Row 1
  { hex: '#203F9A', ru: 'Яркий синий', zh: '耀眼深蓝' },
  { hex: '#94C2DA', ru: 'Пастельный голубой', zh: '粉蓝' },
  { hex: '#0F7055', ru: 'Спокойный зеленый', zh: '平静深绿' },
  { hex: '#FF99BF', ru: 'Светлый розовый', zh: '浅粉' },
  { hex: '#587032', ru: 'Спокойный зеленый', zh: '安逸草绿' },
  { hex: '#F67227', ru: 'Яркий оранжевый', zh: '耀眼橘橙' },

  // Row 2
  { hex: '#E84797', ru: 'Яркий розовый', zh: '耀眼玫粉' },
  { hex: '#E7A0CC', ru: 'Пастельный розовый', zh: '粉紫' },
  { hex: '#EAE6DB', ru: 'Зеленоватый бежевый', zh: '浅灰绿' },
  { hex: '#EC1D25', ru: 'Яркий красный', zh: '鲜红' },
  { hex: '#E764A5', ru: 'Яркий розовый', zh: '暖粉' },
  { hex: '#FBFAE6', ru: 'Выбеленный зеленый', zh: '冷杉白' },

  // Row 3
  { hex: '#EFE8E0', ru: 'Светлый бежевый', zh: '象牙白' },
  { hex: '#4E7CB2', ru: 'Пастельный синий', zh: '经典蓝' },
  { hex: '#22443B', ru: 'Темный зеленый', zh: '墨绿' },
  { hex: '#BAA791', ru: 'Пастельный коричневый', zh: '奶茶褐' },
  { hex: '#FFBCBB', ru: 'Светлый розовый', zh: '初桃粉' },
  { hex: '#F04639', ru: 'Яркий красный', zh: '亮橙红' }
];

const MUSIC_OPTIONS = [
  { id: 'm1', title: '周杰伦 - 晴天', duration: '04:29' },
  { id: 'm2', title: 'Taylor Swift - Cruel Summer', duration: '02:58' },
  { id: 'm3', title: 'Laufey - From The Start', duration: '02:49' },
  { id: 'm4', title: '在新西兰的星空下 - Ambient Synth', duration: '03:15' },
];

const LOCATION_PRESETS = [
  '兰州市城关区东方红广场',
  '阿那亚海边礼堂',
  '中央音乐学院',
  '四姑娘山景区',
];

const GIF_OPTIONS = [
  { id: 'gif_cat', label: '跳舞小猫 🐱', desc: '治愈系律动', url: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3pjcXoxNmZ5ZzB6ZzFkcXZ6ejBpeTZ4ZnI4emxkdTF2eW5kbmRlMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/8vQSQ3cNXuCH5DYGBq/giphy.gif' },
  { id: 'gif_pika', label: '闪烁皮卡 🎉', desc: '狂欢气氛组', url: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWp3dW9wdWRlZmhpeGlzNjhxdWpyNmxvdXkybmJtdDZpd2RpaTFvYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/33OrjzUFwkwEg/giphy.gif' },
  { id: 'gif_heart', label: '像素心动 💖', desc: '满屏粉红爱意', url: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3JsdXRxNGx1dzV2NXA1Z3Q2ajFkaXoxbzh3cTR0YmttZnRwdHlydyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/1gSTZf67mPOXshSg9B/giphy.gif' },
  { id: 'gif_shiba', label: '软萌柴犬 🐶', desc: '治愈甜心柴', url: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTNuZzI5aWhzcmRxZWh2amR6ZWZqYms2YTM4MXYwcThnaHBndTExMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Ip6D66Ihm670YyXNoJ/giphy.gif' },
];

export const UserNoteModal: React.FC<UserNoteModalProps> = ({
  isOpen,
  onClose,
  userNote,
  attachedEmoji,
  noteTheme,
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  onUpdateUserNote,
  onOpenCreateSticker,
}) => {
  const [tempText, setTempText] = useState(userNote);
  const [tempEmoji, setTempEmoji] = useState(attachedEmoji);
  const [tempTheme, setTempTheme] = useState<string>(noteTheme);
  const [tempAvatar, setTempAvatar] = useState<string>(userAvatar);
  const [activePickerModal, setActivePickerModal] = useState<
    'none' | 'palette' | 'emoji' | 'music' | 'location' | 'gif' | 'audience'
  >('none');
  const [selectedColorFamily, setSelectedColorFamily] = useState('sweet');
  const [tempMusic, setTempMusic] = useState<string | null>(null);
  const [tempLocationTag, setTempLocationTag] = useState<string | null>(null);
  const [tempGif, setTempGif] = useState<string | null>(null);
  const [tempAudience, setTempAudience] = useState<'friends' | 'close' | 'private'>('friends');

  if (!isOpen) return null;

  const handlePublish = () => {
    onUpdateUserNote(tempText.trim() || '音乐不停，分享不止...', tempEmoji, tempTheme, tempAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between select-none animate-in fade-in duration-150 overflow-hidden font-sans">
      {/* Top Bar: Close Button */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-gray-100">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
          title="关闭"
        >
          <X size={18} className="stroke-[2.5]" />
        </button>

        <span className="text-sm font-bold text-gray-800">
          我的便签与状态气泡
        </span>

        <button
          onClick={handlePublish}
          className="px-4 py-1.5 bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-xs font-bold text-white rounded-full shadow-md transition-all cursor-pointer"
        >
          发布
        </button>
      </div>

      {/* Center Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative max-w-lg mx-auto w-full">
        {/* Note Speech Bubble and Avatar Assembly */}
        <div className="flex flex-col items-center relative mb-4">
          {/* Emoji Badge Button - 3D Floating Style */}
          <div className="relative mb-2">
            <div
              onClick={() =>
                setActivePickerModal(activePickerModal === 'emoji' ? 'none' : 'emoji')
              }
              className="absolute -top-5 -left-6 z-30 text-5xl cursor-pointer hover:scale-110 active:scale-95 transition-all filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)] select-none"
              title="点击更改便签表情"
            >
              {tempEmoji}
            </div>

            {/* Speech Bubble Preview */}
            {(() => {
              const contrast = getContrastColor(tempTheme);
              return (
                <div
                  style={{
                    backgroundColor: tempTheme.startsWith('#') ? tempTheme : undefined,
                    color: contrast.text,
                    borderColor: tempTheme.startsWith('#') ? contrast.border : undefined,
                  }}
                  className={`px-6 py-3.5 rounded-3xl shadow-lg relative min-w-[240px] max-w-[280px] text-center transition-all flex flex-col justify-center items-center border ${
                    !tempTheme.startsWith('#') ? (
                      tempTheme === 'pink'
                        ? 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-400 text-white shadow-pink-200/50 border-transparent'
                        : tempTheme === 'blue'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200/50 border-transparent'
                        : tempTheme === 'sunset'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-200/50 border-transparent'
                        : 'bg-white text-gray-900 border-gray-200/80 shadow-md'
                    ) : ''
                  }`}
                >
                  <input
                    type="text"
                    value={tempText}
                    onChange={(e) => setTempText(e.target.value)}
                    placeholder="音乐不停，分享不止..."
                    style={{
                      color: contrast.text,
                    }}
                    className="bg-transparent text-sm font-bold outline-none text-center w-full placeholder-current"
                    maxLength={35}
                  />

                  {/* Speech Pointer Triangle */}
                  <div
                    style={{
                      borderTopColor: tempTheme.startsWith('#') ? tempTheme : undefined,
                    }}
                    className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mx-auto -mb-4 mt-2 filter drop-shadow-2xs transition-all ${
                      !tempTheme.startsWith('#') ? (
                        tempTheme === 'pink'
                          ? 'border-t-pink-500'
                          : tempTheme === 'blue'
                          ? 'border-t-blue-500'
                          : tempTheme === 'sunset'
                          ? 'border-t-orange-500'
                          : 'border-t-white'
                      ) : ''
                    }`}
                  />
                </div>
              );
            })()}
          </div>

        {/* User Avatar Circle */}
        <div className="relative mt-2">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-[#1877F2]/80 p-0.5 bg-white shadow-xl overflow-hidden">
            <img
              src={tempAvatar}
              alt="User Avatar"
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Color Palette Button */}
          <button
            type="button"
            onClick={() =>
              setActivePickerModal(activePickerModal === 'palette' ? 'none' : 'palette')
            }
            className={`absolute bottom-0 right-0 w-9 h-9 rounded-full shadow-md border flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer ${
              activePickerModal === 'palette'
                ? 'bg-[#1877F2] text-white border-[#1877F2] ring-2 ring-blue-300'
                : 'bg-white border-gray-200 text-[#1877F2]'
            }`}
            title="点击展开气泡配色盘"
          >
            <Palette size={18} className={activePickerModal === 'palette' ? 'text-white' : 'text-[#1877F2]'} />
          </button>
        </div>
        </div>

        {/* Selected Tags Display */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {tempLocationTag && (
            <div className="bg-gray-100 px-3 py-1 rounded-full flex items-center space-x-1 text-xs font-semibold text-gray-800">
              <MapPin size={12} className="text-rose-500" />
              <span>{tempLocationTag}</span>
              <button onClick={() => setTempLocationTag(null)} className="text-gray-400 hover:text-gray-700 ml-1">✕</button>
            </div>
          )}
          {tempMusic && (
            <div className="bg-gray-100 px-3 py-1 rounded-full flex items-center space-x-1 text-xs font-semibold text-gray-800">
              <Music size={12} className="text-blue-500" />
              <span>{tempMusic}</span>
              <button onClick={() => setTempMusic(null)} className="text-gray-400 hover:text-gray-700 ml-1">✕</button>
            </div>
          )}
          {tempGif && (
            <div className="bg-gray-100 px-3 py-1 rounded-full flex items-center space-x-1 text-xs font-semibold text-gray-800">
              <span className="text-[9px] font-black bg-purple-100 text-purple-600 px-1 rounded">GIF</span>
              <span>{tempGif}</span>
              <button onClick={() => setTempGif(null)} className="text-gray-400 hover:text-gray-700 ml-1">✕</button>
            </div>
          )}
        </div>

        {/* Feature Tools Buttons Row */}
        <div className="flex items-center space-x-3.5 mt-4">
          <button
            type="button"
            onClick={() => setActivePickerModal(activePickerModal === 'palette' ? 'none' : 'palette')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              activePickerModal === 'palette' ? 'bg-blue-50 text-[#1877F2] ring-2 ring-[#1877F2]' : 'bg-gray-100 text-gray-700'
            }`}
            title="配色"
          >
            <Palette size={18} />
          </button>

          <button
            type="button"
            onClick={() => setActivePickerModal(activePickerModal === 'music' ? 'none' : 'music')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              tempMusic ? 'bg-blue-50 text-[#1877F2] ring-2 ring-[#1877F2]' : 'bg-gray-100 text-gray-700'
            }`}
            title="音乐"
          >
            <Music size={18} />
          </button>

          <button
            type="button"
            onClick={() => setActivePickerModal(activePickerModal === 'location' ? 'none' : 'location')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              tempLocationTag ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-500' : 'bg-gray-100 text-gray-700'
            }`}
            title="定位"
          >
            <MapPin size={18} />
          </button>

          <button
            type="button"
            onClick={() => setActivePickerModal(activePickerModal === 'gif' ? 'none' : 'gif')}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer shadow-xs ${
              tempGif ? 'bg-purple-50 text-purple-600 ring-2 ring-purple-500' : 'bg-gray-100 text-gray-700'
            }`}
            title="贴纸"
          >
            GIF
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          你的便签将在个人主页、地图位置及聊天顶部显示 24 小时。
        </p>
      </div>

      {/* Interactive Picker Sheets */}
      {activePickerModal !== 'none' && (
        <div className="bg-gray-50 border-t border-gray-200 p-4 max-h-64 overflow-y-auto animate-in slide-in-from-bottom duration-150 shrink-0">
          {activePickerModal === 'palette' && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                  <Palette size={15} className="text-[#1877F2]" />
                  <span>选择发言气泡与便签配色 (18色拟真网格)</span>
                </span>
                <button onClick={() => setActivePickerModal('none')} className="text-xs text-[#1877F2] font-bold">
                  完成
                </button>
              </div>

              {/* 3x6 High Fidelity Color Grid */}
              <div className="grid grid-cols-6 gap-2">
                {PALETTE_COLORS.map((color, index) => {
                  const isSelected = tempTheme === color.hex;
                  const contrast = getContrastColor(color.hex);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setTempTheme(color.hex)}
                      className={`relative aspect-[4/3] rounded-lg flex flex-col justify-between p-1.5 transition-all text-left border select-none cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-blue-500 ring-offset-1 scale-102 shadow-md z-10'
                          : 'hover:scale-102 hover:shadow-xs'
                      }`}
                      style={{
                        backgroundColor: color.hex,
                        color: contrast.text,
                        borderColor: isSelected ? '#1877F2' : contrast.border,
                      }}
                    >
                      {/* Top hex & flower icon */}
                      <div className="flex items-center justify-between w-full opacity-95">
                        <span className="text-[7.5px] font-mono leading-none">{color.hex}</span>
                        <span className="text-[8.5px] leading-none">✿</span>
                      </div>
                      
                      {/* Bottom bilingual descriptions */}
                      <div className="flex flex-col select-none mt-1 leading-tight overflow-hidden w-full">
                        <span className="text-[7.5px] font-bold opacity-80 truncate" style={{ fontSize: '7px' }}>
                          {color.ru}
                        </span>
                        <span className="text-[9px] font-black truncate mt-0.5" style={{ fontSize: '8.5px' }}>
                          {color.zh}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activePickerModal === 'emoji' && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                  <span>😜</span>
                  <span>选择便签表情 (56款精选表情)</span>
                </span>
                <button onClick={() => setActivePickerModal('none')} className="text-xs text-[#1877F2] font-bold">
                  完成
                </button>
              </div>
              <div className="grid grid-cols-8 gap-2 pb-2">
                {EMOJI_OPTIONS.map((em, idx) => {
                  const isSelected = tempEmoji === em;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTempEmoji(em);
                        setActivePickerModal('none');
                      }}
                      className={`h-10 rounded-xl bg-white text-xl flex items-center justify-center hover:scale-110 active:scale-95 shadow-xs border cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {em}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Entry: Create Photo Cutout Label Sticker */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setActivePickerModal('none');
                    if (onOpenCreateSticker) {
                      onOpenCreateSticker();
                    }
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 text-[#1877F2] rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <span className="text-sm">✂️</span>
                  <span>＋ 制作头像照片抠图贴纸 (Photo Cutout Sticker)</span>
                </button>
              </div>
            </div>
          )}

          {activePickerModal === 'music' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">选择便签音乐</span>
                <button onClick={() => setActivePickerModal('none')} className="text-xs text-[#1877F2] font-bold">关闭</button>
              </div>
              <div className="space-y-1.5">
                {MUSIC_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setTempMusic(m.title);
                      setActivePickerModal('none');
                    }}
                    className={`w-full p-2 rounded-xl text-left flex items-center justify-between border cursor-pointer ${
                      tempMusic === m.title ? 'bg-blue-50 border-blue-300 text-[#1877F2]' : 'bg-white border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xs font-semibold">{m.title}</span>
                    <span className="text-[10px] text-gray-400">{m.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePickerModal === 'location' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">选择定位</span>
                <button onClick={() => setActivePickerModal('none')} className="text-xs text-[#1877F2] font-bold">关闭</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {LOCATION_PRESETS.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTempLocationTag(loc);
                      setActivePickerModal('none');
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer ${
                      tempLocationTag === loc ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePickerModal === 'gif' && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                  <span className="text-xs">🎬</span>
                  <span>精选魔性 GIF 动态贴纸 & 头像 (点击替换头像)</span>
                </span>
                <button onClick={() => setActivePickerModal('none')} className="text-xs text-[#1877F2] font-bold">
                  关闭
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {GIF_OPTIONS.map((g) => {
                  const isSelected = tempGif === g.label;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setTempGif(g.label);
                        setTempAvatar(g.url); // Directly replaces user avatar in preview!
                        setActivePickerModal('none');
                      }}
                      className={`relative p-1.5 rounded-xl flex flex-col items-center justify-between border bg-white cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                        isSelected
                          ? 'border-purple-500 ring-2 ring-purple-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img src={g.url} alt={g.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 mt-1 truncate w-full text-center">
                        {g.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Share Row */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => setActivePickerModal(activePickerModal === 'audience' ? 'none' : 'audience')}
          className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 cursor-pointer py-1 px-2.5 rounded-full bg-gray-100"
        >
          <Users size={14} className="text-gray-500" />
          <span>
            {tempAudience === 'friends' ? '与好友分享' : tempAudience === 'close' ? '与密友分享' : '仅自己可见'}
          </span>
          <ChevronRight size={14} className="text-gray-400" />
        </button>

        <button
          onClick={handlePublish}
          className="px-6 py-2 bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-xs font-bold text-white rounded-full shadow-md transition-all cursor-pointer"
        >
          分享便签
        </button>
      </div>
    </div>
  );
};
