import { Friend } from '../types';

export interface FriendSpeechThemeConfig {
  id: string;
  name: string;
  cssGradient: string; // CSS linear-gradient matching Alexia standard
  tailwindGradient: string; // Tailwind gradient classes
  bgHex: string;
  borderColor: string;
  borderClass: string;
  textColor: string;
  textClass: string;
  shadowClass: string;
  pointerColor: string;
  accentEmoji: string;
}

export const FRIEND_SPEECH_THEMES: Record<string, FriendSpeechThemeConfig> = {
  sakura_pink: {
    id: 'sakura_pink',
    name: '樱花玫粉',
    cssGradient: 'linear-gradient(to right, #ec4899, #d946ef, #f43f5e)',
    tailwindGradient: 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-400 text-white',
    bgHex: '#ec4899',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderClass: 'border-white/25',
    textColor: '#ffffff',
    textClass: 'text-white',
    shadowClass: 'shadow-md shadow-pink-500/25',
    pointerColor: '#f43f5e',
    accentEmoji: '💖',
  },
  sunset_amber: {
    id: 'sunset_amber',
    name: '日落暖金',
    cssGradient: 'linear-gradient(to right, #f59e0b, #f97316)',
    tailwindGradient: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    bgHex: '#f59e0b',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderClass: 'border-white/25',
    textColor: '#ffffff',
    textClass: 'text-white',
    shadowClass: 'shadow-md shadow-amber-500/25',
    pointerColor: '#f97316',
    accentEmoji: '🍵',
  },
  mint_emerald: {
    id: 'mint_emerald',
    name: '薄荷碧翠',
    cssGradient: 'linear-gradient(to right, #10b981, #06b6d4)',
    tailwindGradient: 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white',
    bgHex: '#10b981',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderClass: 'border-white/25',
    textColor: '#ffffff',
    textClass: 'text-white',
    shadowClass: 'shadow-md shadow-emerald-500/25',
    pointerColor: '#06b6d4',
    accentEmoji: '🌿',
  },
  sky_azure: {
    id: 'sky_azure',
    name: '晴空湛蓝',
    cssGradient: 'linear-gradient(to right, #3b82f6, #0ea5e9)',
    tailwindGradient: 'bg-gradient-to-r from-blue-500 to-sky-500 text-white',
    bgHex: '#3b82f6',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderClass: 'border-white/25',
    textColor: '#ffffff',
    textClass: 'text-white',
    shadowClass: 'shadow-md shadow-blue-500/25',
    pointerColor: '#0ea5e9',
    accentEmoji: '☁️',
  },
  lavender_purple: {
    id: 'lavender_purple',
    name: '幻彩罗兰',
    cssGradient: 'linear-gradient(to right, #8b5cf6, #d946ef)',
    tailwindGradient: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white',
    bgHex: '#8b5cf6',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderClass: 'border-white/25',
    textColor: '#ffffff',
    textClass: 'text-white',
    shadowClass: 'shadow-md shadow-purple-500/25',
    pointerColor: '#d946ef',
    accentEmoji: '💜',
  },
  apricot_orange: {
    id: 'apricot_orange',
    name: '暖杏橘红',
    cssGradient: 'linear-gradient(to right, #ea580c, #f59e0b)',
    tailwindGradient: 'bg-gradient-to-r from-orange-600 to-amber-500 text-white',
    bgHex: '#ea580c',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderClass: 'border-white/25',
    textColor: '#ffffff',
    textClass: 'text-white',
    shadowClass: 'shadow-md shadow-orange-500/25',
    pointerColor: '#f59e0b',
    accentEmoji: '🍊',
  },
  ice_cyan: {
    id: 'ice_cyan',
    name: '冰川极光',
    cssGradient: 'linear-gradient(to right, #06b6d4, #3b82f6)',
    tailwindGradient: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
    bgHex: '#06b6d4',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderClass: 'border-white/25',
    textColor: '#ffffff',
    textClass: 'text-white',
    shadowClass: 'shadow-md shadow-cyan-500/25',
    pointerColor: '#3b82f6',
    accentEmoji: '💎',
  },
  fuchsia_magic: {
    id: 'fuchsia_magic',
    name: '幻彩魅紫',
    cssGradient: 'linear-gradient(to right, #a855f7, #ec4899)',
    tailwindGradient: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    bgHex: '#a855f7',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderClass: 'border-white/25',
    textColor: '#ffffff',
    textClass: 'text-white',
    shadowClass: 'shadow-md shadow-fuchsia-500/25',
    pointerColor: '#ec4899',
    accentEmoji: '🌸',
  },
  matcha_lime: {
    id: 'matcha_lime',
    name: '青柠翡翠',
    cssGradient: 'linear-gradient(to right, #84cc16, #10b981)',
    tailwindGradient: 'bg-gradient-to-r from-lime-500 to-emerald-500 text-white',
    bgHex: '#84cc16',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderClass: 'border-white/25',
    textColor: '#ffffff',
    textClass: 'text-white',
    shadowClass: 'shadow-md shadow-lime-500/25',
    pointerColor: '#10b981',
    accentEmoji: '☕',
  },
  indigo_dream: {
    id: 'indigo_dream',
    name: '深空星夜',
    cssGradient: 'linear-gradient(to right, #3b82f6, #6366f1, #8b5cf6)',
    tailwindGradient: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white',
    bgHex: '#4f46e5',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderClass: 'border-white/25',
    textColor: '#ffffff',
    textClass: 'text-white',
    shadowClass: 'shadow-md shadow-indigo-500/25',
    pointerColor: '#8b5cf6',
    accentEmoji: '🎵',
  },
  coral_flame: {
    id: 'coral_flame',
    name: '珊瑚烈焰',
    cssGradient: 'linear-gradient(to right, #ef4444, #f97316)',
    tailwindGradient: 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
    bgHex: '#ef4444',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderClass: 'border-white/25',
    textColor: '#ffffff',
    textClass: 'text-white',
    shadowClass: 'shadow-md shadow-red-500/25',
    pointerColor: '#f97316',
    accentEmoji: '🔥',
  },
  ocean_teal: {
    id: 'ocean_teal',
    name: '深海碧波',
    cssGradient: 'linear-gradient(to right, #14b8a6, #0284c7)',
    tailwindGradient: 'bg-gradient-to-r from-teal-500 to-sky-600 text-white',
    bgHex: '#14b8a6',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderClass: 'border-white/25',
    textColor: '#ffffff',
    textClass: 'text-white',
    shadowClass: 'shadow-md shadow-teal-500/25',
    pointerColor: '#0284c7',
    accentEmoji: '🌊',
  },
};

const THEME_KEYS = Object.keys(FRIEND_SPEECH_THEMES);

/**
 * Fixed specific simulated notes & assigned gradient color themes for key friends
 */
const SPECIAL_FRIEND_NOTES: Record<string, { note: string; emoji: string; themeKey: string; tag: string }> = {
  f1: {
    note: '🚗 驶向东方红广场 · 奔赴相见 💖',
    emoji: '💖',
    themeKey: 'sakura_pink',
    tag: '恋人便签',
  },
  'fam-1': {
    note: '在家客厅泡了壶春茶，慢生活中 🍵',
    emoji: '🍵',
    themeKey: 'sunset_amber',
    tag: '家人便签',
  },
  'fam-2': {
    note: '在商场挑新鲜水果，准备晚饭 🛍️',
    emoji: '🛍️',
    themeKey: 'fuchsia_magic',
    tag: '家人便签',
  },
  'fam-3': {
    note: '操场踢球中，活力满格 ⚽⚡',
    emoji: '⚽',
    themeKey: 'mint_emerald',
    tag: '家人便签',
  },
  'fam-4': {
    note: '滨河公园晨练太极，微风舒畅 🌿',
    emoji: '🌳',
    themeKey: 'sky_azure',
    tag: '家人便签',
  },
  'fam-5': {
    note: '植物园赏花拍美照，心情极佳 🌸',
    emoji: '🌸',
    themeKey: 'sakura_pink',
    tag: '家人便签',
  },
  u_001: {
    note: '尝到了一杯绝赞的燕麦拿铁 ☕',
    emoji: '☕',
    themeKey: 'matcha_lime',
    tag: '密友随想',
  },
  f2: {
    note: '中山桥吹晚风，夜色太美啦 🌉',
    emoji: '🌉',
    themeKey: 'indigo_dream',
    tag: '密友动态',
  },
  f3: {
    note: '白塔山健步打卡，俯瞰全城 ⛰️',
    emoji: '🏃',
    themeKey: 'coral_flame',
    tag: '运动打卡',
  },
  f4: {
    note: '博物馆看丝路文明展，大开眼界 🏺',
    emoji: '🏺',
    themeKey: 'ice_cyan',
    tag: '文化探访',
  },
  'team-m-chen': {
    note: '极客小组集结 🚗 驾车在途 38km/h',
    emoji: '🚗',
    themeKey: 'apricot_orange',
    tag: '小组在途',
  },
  'team-m-lin': {
    note: '步行前往飞云楼 🚶 5km/h',
    emoji: '🚶',
    themeKey: 'ocean_teal',
    tag: '小组在途',
  },
  'team-m-zhao': {
    note: '骑行前往活动场地 🚴 16km/h',
    emoji: '🚴',
    themeKey: 'lavender_purple',
    tag: '小组在途',
  },
  'team-m-wang': {
    note: '高校骑行社拉练中 🚴 22km/h',
    emoji: '⚡',
    themeKey: 'sunset_amber',
    tag: '社团活动',
  },
};

/**
 * Get colorful speech note details for any friend
 */
export function getFriendSpeechNoteDetail(friend: Friend): {
  text: string;
  emoji: string;
  theme: FriendSpeechThemeConfig;
  categoryTag: string;
  cleanText: string;
} {
  const special = SPECIAL_FRIEND_NOTES[friend.id];
  let themeKey: string;
  let text: string;
  let emoji: string;
  let categoryTag: string;

  if (special) {
    themeKey = special.themeKey;
    text = friend.status || special.note;
    emoji = special.emoji;
    categoryTag = special.tag;
  } else {
    // Deterministic hash based on ID
    let hash = 0;
    const str = friend.id + (friend.name || '');
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % THEME_KEYS.length;
    themeKey = THEME_KEYS[idx];

    // Status or default quote
    const fallbackQuotes = [
      { text: '今天也是元气满满的一天 ✨', emoji: '✨', tag: '日常随想' },
      { text: '发现了一家宝藏咖啡馆 ☕', emoji: '☕', tag: '探店打卡' },
      { text: '沿黄河风情线散步吹风 🌿', emoji: '🌿', tag: '漫步生活' },
      { text: '电量充沛，随时可以出发 ⚡', emoji: '⚡', tag: '状态便签' },
      { text: '戴着耳机听喜欢的黑胶唱片 🎵', emoji: '🎵', tag: '音乐时刻' },
      { text: '刚买到了热腾腾的烘焙面包 🥐', emoji: '🥐', tag: '美食随记' },
      { text: '阳光正好，在草坪上看书 📖', emoji: '📖', tag: '悠闲午后' },
      { text: '整理了最近拍的相册美照 📸', emoji: '📸', tag: '照片记忆' },
    ];
    const qIdx = Math.abs(hash >> 3) % fallbackQuotes.length;
    const q = fallbackQuotes[qIdx];

    text = friend.status || q.text;
    emoji = friend.mood || q.emoji;
    categoryTag = friend.isFamily ? '家人便签' : friend.isCloseFriend ? '密友便签' : q.tag;
  }

  // Extract clean text without leading emoji
  const cleanText = text.replace(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[^\p{L}\p{N}\s])+\s*/u, '').trim() || text;
  const theme = FRIEND_SPEECH_THEMES[themeKey] || FRIEND_SPEECH_THEMES.sakura_pink;

  return {
    text,
    emoji,
    theme,
    categoryTag,
    cleanText,
  };
}
