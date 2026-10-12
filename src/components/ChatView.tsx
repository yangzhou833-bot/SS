import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChatConversation, ChatMessage, GroupMember, SimulatedMapActivity, Friend, ContactCardData } from "../types";
import { soundEffects } from "../utils/soundEffects";
import { haptics } from "../utils/haptics";
import { shouldSendOnEnter } from "../utils/chatInput";
import { TelegramEmojiPanel } from './chat/TelegramEmojiPanel';
import { FreeFormChatCanvas } from './chat/FreeFormChatCanvas';
import { MessageStylePicker } from './chat/MessageStylePicker';
import { useMessageAppearance, type MessageAppearance } from './chat/messageStyles';
import { reactionMap, toggleReaction, visibleChatMessages } from './chat/chatMessages';
import { BumpSticker, BUMP_STICKERS, STELLAR_STICKERS } from './chat/BumpSticker';
import { ChatManagementCenter } from "./ChatManagementCenter";
import { SingleEmojiEchoBubble, SingleEmojiEchoBubbleHandle } from "./SingleEmojiEchoBubble";
import { FloatingReactionDock } from "./FloatingReactionDock";
import { EmojiFlyEffect, EmojiFlyEffectHandle } from "./EmojiFlyEffect";
import { FamilyGroupData } from "./FamilyGroupModal";
import { FamilyAvatarCollage } from "./DiscoverView";
import { FULLSCREEN_EFFECT_MAP } from "../data/emojiData";
import { SIMULATED_ACTIVITIES, INITIAL_FRIENDS } from "../data/mockData";
import { ActivityChatCard } from "./ActivityChatCard";
import { LocationChatCard } from "./LocationChatCard";
import { LifePlaceChatCard } from "./LifePlaceChatCard";
import { PlaceMemoryCard } from "./PlaceMemoryCard";
import { ContactChatCard } from "./ContactChatCard";
import { ShareContactModal } from "./ShareContactModal";
import { ContactBriefModal } from "./ContactBriefModal";
import { ActivityDetailShortCard } from "./ActivityDetailShortCard";
import { OnScreenHandwritingLayer } from "./chat/OnScreenHandwritingLayer";
import { LifePlace } from "../types";
import {
  PhotoAlbum,
  DocumentFolder,
  DocumentAsset,
  INITIAL_USER_ALBUMS,
  INITIAL_USER_FOLDERS,
} from "../data/documentCenterData";
import { SkillItem, INITIAL_SKILLS } from "../data/skillsData";
import { EBookReaderApp } from "./skills/EBookReaderApp";
import { CityCostOfLivingApp } from "./skills/CityCostOfLivingApp";
import { SkillDetailModal } from "./skills/SkillDetailModal";
import {
  Search,
  Send,
  Image as ImageIcon,
  Smile,
  ArrowLeft,
  Phone,
  Video,
  Mic,
  Play,
  Pause,
  RotateCcw,
  Copy,
  MoreHorizontal,
  MoreVertical,
  CheckCheck,
  Sparkles,
  Users,
  Menu,
  Edit3,
  Bookmark,
  Trash2,
  BellOff,
  UserCheck,
  Info,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Calendar,
  UserPlus,
  LogOut,
  Pin,
  Megaphone,
  VolumeX,
  FileText,
  Hash,
  X,
  Clock,
  Plus,
  Music,
  Globe,
  Lock,
  Palette,
  Check,
  CornerDownLeft,
  Languages,
  Forward,
  Camera,
  Keyboard,
  AtSign,
  Paperclip,
  Heart,
  Download,
  Maximize2,
  ExternalLink,
  Flame,
  File as FileIcon,
  Navigation,
  Share2,
  MessageCircle,
  Folder,
  FolderPlus,
  ImagePlus,
  CheckCircle2,
  BookOpen,
  BarChart3,
  Briefcase,
  Plane,
  Compass,
  ArrowDown,
  RefreshCw,
  List,
  Grid,
  PenTool,
} from "lucide-react";

export const EMOJI_CATEGORY_LIST = [
  { id: "recent", name: "最近使用", icon: "🕒" },
  { id: "popular", name: "常用表情", icon: "🔥" },
  { id: "people", name: "人物", icon: "😊" },
  { id: "lifestyle", name: "生活", icon: "☕" },
  { id: "activities", name: "活动", icon: "🏃" },
  { id: "weather", name: "天气", icon: "☀️" },
  { id: "symbols", name: "符号", icon: "❤️" },
];

export const EMOJI_DATA: Record<string, { label: string; emojis: string[] }> = {
  popular: {
    label: "常用表情",
    emojis: [
      "👍", "👏", "🎉", "😂", "❤️", "😮", "❓", "💪",
      "🔥", "✌️", "🤝", "✨", "☕", "🌸", "🚀", "💯",
      "🍕", "🎈", "🥳", "🥰", "🙌", "😍", "🙏", "🤣",
    ],
  },
  people: {
    label: "人物与表情",
    emojis: [
      "😊", "😂", "🤣", "😍", "🥰", "😘", "😜", "😎",
      "🤩", "🥳", "🤔", "🤫", "🙄", "🥺", "😭", "🤯",
      "🥵", "🥶", "😴", "😇", "🙋‍♂️", "👨‍💻", "🤦‍♀️", "🤷‍♂️",
      "👍", "👎", "👏", "🙌", "🤝", "✌️", "🤞", "🤙",
      "👊", "✊", "👌", "🤌", "🙏", "💪", "👈", "👉",
    ],
  },
  lifestyle: {
    label: "美食与生活",
    emojis: [
      "☕", "🍵", "🍜", "🍕", "🍔", "🍰", "🍦", "🍺",
      "🍷", "🥤", "🥪", "🍎", "🍓", "🍉", "🥑", "🥐",
      "🚗", "🛵", "🏠", "🛋️", "📱", "💻", "🎒", "💡",
      "🛒", "🔑", "🛁", "✈️", "🚄", "🚲", "🏙️", "🏖️",
    ],
  },
  activities: {
    label: "运动与活动",
    emojis: [
      "🏃", "🚴", "🧗", "⛺", "⛷️", "🏊", "⚽", "🏀",
      "🎾", "🎮", "🎨", "🎬", "🎤", "🎧", "🎸", "🎹",
      "🎳", "🏆", "🥇", "🎯", "🏸", "🥊", "🛹", "🏄",
      "🎲", "🧩", "🎪", "🎫", "🍿", "📸", "🔮", "🪄",
    ],
  },
  weather: {
    label: "自然与天气",
    emojis: [
      "☀️", "🌤️", "⛅", "🌧️", "⛈️", "❄️", "🌈", "⚡",
      "🌪️", "🌙", "🌟", "✨", "🌊", "💨", "🍃", "🍂",
      "🍁", "🌸", "🌻", "🌲", "🪐", "🔥", "💧", "🌍",
    ],
  },
  symbols: {
    label: "符号与标志",
    emojis: [
      "❤️", "💖", "💗", "💓", "💞", "💕", "💘", "💯",
      "💥", "🔥", "❓", "❗", "⚠️", "💤", "💬", "💭",
      "🚩", "📍", "📌", "🔑", "🎁", "🔔", "🎵", "🎶",
      "⏰", "⏳", "🔒", "✅", "❌", "⭐", "💎", "🎯",
    ],
  },
};

const RICH_EMOJI_CATEGORIES = Object.entries(EMOJI_DATA).map(([id, val]) => ({
  id,
  name: val.label,
  emojis: val.emojis,
}));

export const TOP_QUICK_REACTION_EMOJIS = [
  "👍", "❤️", "😂", "🔥", "🎉", "👏", "☕", "✨", "🚀", "💯", "🍕", "🌸",
];

export const SMART_EMOJI_KEYWORD_MAP: Record<string, string[]> = {
  "哈": ["😂", "🤣", "😆", "😹"],
  "笑": ["😂", "😄", "😆", "🤭"],
  "赞": ["👍", "👏", "💯", "🙌"],
  "好": ["👍", "👌", "✨", "💯"],
  "爱": ["❤️", "🥰", "😍", "💕"],
  "喜欢": ["🥰", "❤️", "💖", "✨"],
  "心": ["❤️", "💖", "💓", "💘"],
  "火": ["🔥", "⚡", "💥", "🚀"],
  "牛": ["🐂", "🔥", "💪", "🚀"],
  "666": ["🤙", "🔥", "🎉", "👏"],
  "厉害": ["💪", "👏", "🏆", "🔥"],
  "哭": ["😭", "😢", "🥺", "😿"],
  "难过": ["🥺", "😢", "💔", "😞"],
  "生快": ["🎂", "🎉", "🥳", "🎁"],
  "生日": ["🎂", "🎉", "🥳", "🎈"],
  "庆祝": ["🎉", "🥳", "🍾", "🥂"],
  "干杯": ["🍻", "🥂", "🥃", "🎉"],
  "恭喜": ["🎉", "🎊", "🧧", "👏"],
  "ok": ["👌", "👍", "✅", "🙆‍♂️"],
  "好的": ["👌", "👍", "🙆‍♂️", "✨"],
  "咖啡": ["☕", "🥐", "🍩", "🍵"],
  "拜托": ["🙏", "🥺", "🙇‍♂️", "✨"],
  "谢谢": ["🙏", "❤️", "💐", "😊"],
  "晚安": ["🌙", "😴", "✨", "💤"],
  "早": ["☀️", "☕", "🌅", "👋"],
  "猫": ["🐱", "😻", "🐾", "😽"],
  "狗": ["🐶", "🐕", "🐾", "🐩"],
  "吃": ["🍔", "🍕", "🍜", "🍰"],
  "钱": ["💰", "💵", "🤑", "🧧"],
};

const STICKER_PACKS = [
  {
    id: "s1",
    title: "赞爆了",
    emoji: "🔥",
    bg: "from-amber-400 to-orange-500",
    subtitle: "太强了！",
  },
  {
    id: "s2",
    title: "比心心",
    emoji: "💖",
    bg: "from-pink-400 to-rose-500",
    subtitle: "爱你哟",
  },
  {
    id: "s3",
    title: "写代码中",
    emoji: "💻",
    bg: "from-blue-500 to-indigo-600",
    subtitle: "别催在写了",
  },
  {
    id: "s4",
    title: "哈哈哈哈",
    emoji: "🤣",
    bg: "from-yellow-400 to-amber-500",
    subtitle: "笑不活了",
  },
  {
    id: "s5",
    title: "干饭人",
    emoji: "🍜",
    bg: "from-emerald-400 to-teal-500",
    subtitle: "干饭第一名",
  },
  {
    id: "s6",
    title: "开摆躺平",
    emoji: "🏖️",
    bg: "from-cyan-400 to-blue-500",
    subtitle: "今天休息",
  },
  {
    id: "s7",
    title: "收到好的",
    emoji: "👍",
    bg: "from-blue-600 to-blue-800",
    subtitle: "马上安排",
  },
  {
    id: "s8",
    title: "芜湖起飞",
    emoji: "🚀",
    bg: "from-purple-500 to-indigo-700",
    subtitle: "全速冲刺",
  },
];

const QUICK_PHRASES = [
  "好的，收到！👍",
  "正在路上，马上就到 🚗",
  "稍后联系你，先忙一下 ⏳",
  "没问题，按你说的办 👌",
  "发个定位看看你在哪 📍",
  "今天一起喝杯咖啡吗 ☕",
  "这个方案太棒了 ✨",
  "辛苦了，早点休息 🌙",
];

const EXTENSION_TOOLS = [
  {
    id: "activity",
    name: "活动卡片",
    icon: Compass,
    color: "bg-[#1877F2] text-white",
    desc: "发起与分享社群地图活动",
  },
  {
    id: "camera",
    name: "照片",
    icon: Camera,
    color: "bg-blue-500 text-white",
    desc: "拍摄照片或即时拍照",
  },
  {
    id: "photos",
    name: "相册",
    icon: ImageIcon,
    color: "bg-emerald-500 text-white",
    desc: "发送本地相册图片",
  },
  {
    id: "location",
    name: "位置共享",
    icon: MapPin,
    color: "bg-amber-500 text-white",
    desc: "共享实时地理位置",
  },
  {
    id: "files",
    name: "文件文档",
    icon: FileText,
    color: "bg-purple-500 text-white",
    desc: "发送 PDF / Word 文档",
  },
  {
    id: "contact",
    name: "名片分享",
    icon: UserPlus,
    color: "bg-teal-500 text-white",
    desc: "推荐好友个人名片",
  },
  {
    id: "voice_call",
    name: "语音通话",
    icon: Phone,
    color: "bg-indigo-500 text-white",
    desc: "高清一对一语音通话",
  },
  {
    id: "video_call",
    name: "视频通话",
    icon: Video,
    color: "bg-rose-500 text-white",
    desc: "超清面对面视频连线",
  },
  {
    id: "handwriting",
    name: "全屏手写",
    icon: PenTool,
    color: "bg-gradient-to-tr from-[#1877F2] via-purple-500 to-pink-500 text-white",
    desc: "彩色笔头在屏幕上自由手写涂鸦",
  },
  {
    id: "burn_mode",
    name: "阅后即焚",
    icon: Flame,
    color: "bg-red-500 text-white",
    desc: "开启/关闭阅后即焚加密",
  },
];

const PRESET_ATTACHMENT_PHOTOS = [
  {
    title: "中山铁桥夜景.jpg",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
    label: "中山铁桥夜景",
  },
  {
    title: "黄河风情线夕阳.jpg",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
    label: "黄河落日",
  },
  {
    title: "户外骑行徒步.jpg",
    url: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=600",
    label: "骑行徒步",
  },
  {
    title: "城市露营咖啡.jpg",
    url: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=600",
    label: "露营咖啡",
  },
];

const EMOJI_OPTIONS = [
  "😜",
  "💭",
  "🔥",
  "❤️",
  "☕",
  "⚡",
  "🌟",
  "🎵",
  "🍜",
  "🏖️",
  "🎮",
  "💻",
  "🚀",
  "🌿",
  "🥳",
  "🍕",
  "🎯",
  "🎨",
  "🌈",
  "🍀",
  "🍣",
  "🚴",
  "📸",
  "🍦",
];

const MUSIC_OPTIONS = [
  { id: "m1", title: "周杰伦 - 晴天", artist: "周杰伦", duration: "4:29" },
  { id: "m2", title: "陈奕迅 - 富士山下", artist: "陈奕迅", duration: "4:18" },
  { id: "m3", title: "低苦艾 - 兰州 兰州", artist: "低苦艾", duration: "5:12" },
  {
    id: "m4",
    title: "Lofi Chill Beats",
    artist: "Lofi Girl",
    duration: "2:45",
  },
  {
    id: "m5",
    title: "Taylor Swift - Cruel Summer",
    artist: "Taylor Swift",
    duration: "2:58",
  },
  { id: "m6", title: "林俊杰 - 江南", artist: "林俊杰", duration: "4:28" },
];

const LOCATION_PRESETS = [
  "Sangke Grassland",
  "兰州 · 东方红广场 📍",
  "兰州 · 中山铁桥 🌉",
  "南滨河路音乐茶摊 🎵",
  "兰州老街 🏮",
  "白塔山公园 🏔️",
  "兰州万象城 🛍️",
  "甘肃省博物馆 🏛️",
  "创新科技大厦 A座 🏢",
];

const GIF_OPTIONS = [
  { id: "g1", label: "摸鱼猫咪 🐱", desc: "工作放空中" },
  { id: "g2", label: "狂欢庆祝 🎉", desc: "周末快乐" },
  { id: "g3", label: "咖啡时间 ☕", desc: "续命美式" },
  { id: "g4", label: "活力满满 🔥", desc: "元气全开" },
  { id: "g5", label: "闪耀星光 ✨", desc: "生活明朗" },
  { id: "g6", label: "摇摆音符 🎵", desc: "听歌随心" },
];

const NOTE_TEMPLATES = [
  "音乐不停，分享不止...",
  "今天兰州天气超好，想去黄河边喝茶！☀️",
  "周五晚上谁来南滨河路夜市拼桌？🍢",
  "代码写累了，急需一杯冰美式 ☕",
  "生活明朗，万物可爱 ✨",
  "黄河风情线夜跑打卡 5km 🏃",
];

export interface ColorFamily {
  id: string;
  name: string;
  icon: string;
  gradients: {
    id: string;
    name: string;
    gradientClass: string;
    noteTheme: "pink" | "white" | "blue" | "sunset";
  }[];
}

export const COLOR_FAMILIES: ColorFamily[] = [
  {
    id: "blue-purple",
    name: "湛蓝电光紫",
    icon: "🔵",
    gradients: [
      {
        id: "classic-blue",
        name: "极速湛蓝",
        gradientClass: "bg-gradient-to-r from-[#0084FF] via-[#1877F2] to-[#00C6FF] text-white",
        noteTheme: "blue",
      },
      {
        id: "electric-violet",
        name: "幻彩电光紫",
        gradientClass: "bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 text-white",
        noteTheme: "pink",
      },
      {
        id: "deep-ocean",
        name: "深海极光",
        gradientClass: "bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-400 text-white",
        noteTheme: "blue",
      },
    ],
  },
  {
    id: "warm-sun",
    name: "暖阳蜜桃粉",
    icon: "🍊",
    gradients: [
      {
        id: "peach-lolita",
        name: "蜜桃洛丽塔",
        gradientClass: "bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 text-white",
        noteTheme: "pink",
      },
      {
        id: "solar-orange",
        name: "活力烈阳橙",
        gradientClass: "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white",
        noteTheme: "sunset",
      },
      {
        id: "bubblegum-pink",
        name: "奶油泡泡粉",
        gradientClass: "bg-gradient-to-r from-fuchsia-500 via-pink-400 to-rose-300 text-white",
        noteTheme: "pink",
      },
    ],
  },
  {
    id: "fresh-mint",
    name: "清新生机绿",
    icon: "🍃",
    gradients: [
      {
        id: "mint-forest",
        name: "薄荷森林",
        gradientClass: "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-white",
        noteTheme: "blue",
      },
      {
        id: "matcha-lime",
        name: "柠檬抹茶",
        gradientClass: "bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 text-white",
        noteTheme: "sunset",
      },
      {
        id: "emerald-glass",
        name: "浮翠琉璃",
        gradientClass: "bg-gradient-to-r from-teal-600 via-emerald-400 to-cyan-300 text-white",
        noteTheme: "blue",
      },
    ],
  },
  {
    id: "cyber-luxury",
    name: "赛博与黑金",
    icon: "🖤",
    gradients: [
      {
        id: "cyber-neon",
        name: "赛博霓虹",
        gradientClass: "bg-gradient-to-r from-gray-900 via-indigo-950 to-purple-900 text-cyan-300 border border-cyan-500/30",
        noteTheme: "pink",
      },
      {
        id: "black-gold",
        name: "黑金尊享",
        gradientClass: "bg-gradient-to-r from-neutral-900 via-stone-800 to-amber-900 text-amber-200 border border-amber-500/30",
        noteTheme: "sunset",
      },
      {
        id: "soft-white",
        name: "云雾珍珠白",
        gradientClass: "bg-gradient-to-r from-slate-100 via-white to-sky-100 text-[#050505] border border-blue-200/80",
        noteTheme: "white",
      },
    ],
  },
];

interface ChatViewProps {
  isDarkMode?: boolean;
  conversations: ChatConversation[];
  friends?: Friend[];
  onSendMessage: (
    conversationId: string,
    text: string,
    options?: {
      textStyle?: ChatMessage["textStyle"];
      duration?: number;
      url?: string;
      type?: "text" | "audio" | "image" | "file" | "location" | "emoji" | "activity" | "contact" | "handwriting";
      imageUrl?: string;
      isHandwriting?: boolean;
      doodleLayout?: ChatMessage["doodleLayout"];
      handwritingStrokes?: Array<{ points: Array<{ x: number; y: number }>; color: string; width: number; isEraser?: boolean }>;
      fileData?: { name: string; size: string; type?: string; url?: string };
      locationData?: {
        name: string;
        address?: string;
        lat?: number;
        lng?: number;
      };
      contactData?: ContactCardData;
      emojiData?: { emoji: string; animation?: string };
      isBurnAfterReading?: boolean;
      activityId?: string;
      activityData?: SimulatedMapActivity;
    },
    quotedMessage?: { id: string; senderName?: string; text?: string },
  ) => string | void;
  onDeleteMessage?: (conversationId: string, messageId: string) => void;
  onUpdateMessage?: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  onDeleteConversation?: (conversationId: string) => void;
  onToggleUnreadConversation?: (conversationId: string) => void;
  activeChatId?: string | null;
  canvasEntry?: { friendId: string; appearance: MessageAppearance; key: number } | null;
  onSelectChat: (id: string | null) => void;
  onOpenFriendProfile?: (friendId: string) => void;
  onCreateGroupConversation?: (
    groupName: string,
    announcement: string,
    selectedFriendIds: string[],
  ) => void;
  userNote?: string;
  attachedEmoji?: string;
  noteTheme?: "pink" | "white" | "blue" | "sunset";
  onUpdateUserNote?: (note: string, emoji: string, theme: string) => void;
  onOpenNoteEditor?: () => void;
  onOpenManagementCenter?: () => void;
  onOpenTeams?: () => void;
  familyGroup?: FamilyGroupData | null;
  onOpenFamilyModal?: () => void;
  onOpenFamilyCare?: () => void;
  onShareRealTimeLocation?: (share: any) => void;
  onNavigateToMapLocation?: (loc: { lat: number; lng: number; name: string }) => void;
  onOpenActivityOnMap?: (activity: SimulatedMapActivity) => void;
  userAlbums?: PhotoAlbum[];
  setUserAlbums?: React.Dispatch<React.SetStateAction<PhotoAlbum[]>>;
  userFolders?: DocumentFolder[];
  setUserFolders?: React.Dispatch<React.SetStateAction<DocumentFolder[]>>;
  onOpenDocumentCenter?: () => void;
  onOpenTeamWorkspace?: (teamId: string) => void;
  skills?: SkillItem[];
  onOpenSkill?: (skill: SkillItem) => void;
  onOpenCourseApp?: () => void;
  onOpenStellarTab?: () => void;
  onOpenCalendar?: () => void;
  onToggleSkillInstall?: (skill: SkillItem) => void;
  onToggleSkillEnable?: (skill: SkillItem) => void;
  onRefreshConversations?: () => Promise<void> | void;
  onTogglePinConversation?: (convId: string) => void;
  activities?: SimulatedMapActivity[];
  onShareActivity?: (activity: SimulatedMapActivity) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  isDarkMode = false,
  conversations,
  friends = INITIAL_FRIENDS,
  onSendMessage,
  onDeleteMessage,
  onUpdateMessage,
  onDeleteConversation,
  onToggleUnreadConversation,
  onTogglePinConversation,
  activeChatId,
  canvasEntry,
  onSelectChat,
  onOpenFriendProfile,
  onCreateGroupConversation,
  onRefreshConversations,
  userNote: propUserNote,
  attachedEmoji: propAttachedEmoji,
  noteTheme: propNoteTheme,
  onUpdateUserNote,
  onOpenNoteEditor,
  onOpenManagementCenter,
  onOpenTeams,
  familyGroup,
  onOpenFamilyModal,
  onOpenFamilyCare,
  onShareRealTimeLocation,
  onNavigateToMapLocation,
  onOpenActivityOnMap,
  userAlbums,
  setUserAlbums,
  userFolders,
  setUserFolders,
  onOpenDocumentCenter,
  onOpenTeamWorkspace,
  skills: propSkills,
  onOpenSkill,
  onOpenCourseApp,
  onOpenStellarTab,
  onOpenCalendar,
  onToggleSkillInstall,
  onToggleSkillEnable,
  activities = [],
  onShareActivity,
}) => {
  const activeConversation = conversations.find((c) => c.id === activeChatId || c.friendId === activeChatId);
  const prefersReducedMotion = useReducedMotion();
  const [localUserAlbums, setLocalUserAlbums] = useState<PhotoAlbum[]>(INITIAL_USER_ALBUMS);
  const [localUserFolders, setLocalUserFolders] = useState<DocumentFolder[]>(INITIAL_USER_FOLDERS);
  const activeUserAlbums = userAlbums || localUserAlbums;
  const setActiveUserAlbums = setUserAlbums || setLocalUserAlbums;
  const activeUserFolders = userFolders || localUserFolders;
  const setActiveUserFolders = setUserFolders || setLocalUserFolders;

  // Stellar Installed & User-Added Modules
  const [isEBookAppOpen, setIsEBookAppOpen] = useState(false);
  const [isCityCostAppOpen, setIsCityCostAppOpen] = useState(false);
  const [selectedSkillForDetail, setSelectedSkillForDetail] = useState<SkillItem | null>(null);

  // Activity Card & Drawer State
  const [selectedChatActivity, setSelectedChatActivity] = useState<SimulatedMapActivity | null>(null);
  const [selectedChatLifePlace, setSelectedChatLifePlace] = useState<LifePlace | null>(null);
  const [isActivityPickerOpen, setIsActivityPickerOpen] = useState(false);
  const allActivitiesList = useMemo(() => {
    return activities && activities.length > 0 ? activities : SIMULATED_ACTIVITIES;
  }, [activities]);

  const skillsList = propSkills && propSkills.length > 0 ? propSkills : INITIAL_SKILLS;
  const installedSkills = useMemo(() => {
    const seen = new Set<string>();
    const uniqueSkills = skillsList.filter((s) => {
      if (!s || !s.id || seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
    const filtered = uniqueSkills.filter((s) => s.isInstalled);
    if (filtered.length === 0) {
      return uniqueSkills.slice(0, 6);
    }
    return filtered;
  }, [skillsList]);

  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const lastScrollTopRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Pull to refresh chat list state
  const conversationListRef = useRef<HTMLDivElement | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<"idle" | "pulling" | "ready" | "refreshing" | "success" | "error">("idle");
  const isMouseDraggingRef = useRef(false);
  const mouseStartYRef = useRef<number>(0);
  const wheelPullDeltaRef = useRef<number>(0);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredHapticRef = useRef(false);

  // Single Emoji Echo played message IDs tracker (plays once on send/receive, does not replay on scroll)
  const playedEchoMsgIdsRef = useRef<Set<string>>(new Set());
  const singleEmojiBubbleRefs = useRef<Map<string, SingleEmojiEchoBubbleHandle>>(new Map());

  // Floating Reaction & Emoji particle system ref
  const emojiFlyRef = useRef<EmojiFlyEffectHandle | null>(null);
  const lastTapMessageRef = useRef<{ id: string; time: number } | null>(null);
  const lastQuickReactionRef = useRef<{ id: string; time: number } | null>(null);

  // Emoji Drawer interaction mode: "insert" (append to text) vs "instant" (1-tap quick send)
  const [emojiDrawerSendMode, setEmojiDrawerSendMode] = useState<"insert" | "instant">("insert");

  // Hold-to-Grow Mega Emoji Charging State
  const [chargingEmoji, setChargingEmoji] = useState<{
    emoji: string;
    scale: number;
    rect: DOMRect;
  } | null>(null);
  const chargeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chargeStartTimeRef = useRef<number>(0);
  const chargeStepRef = useRef<number>(0);

  const handleMarkEchoPlayed = useCallback((msgId: string) => {
    playedEchoMsgIdsRef.current.add(msgId);
  }, []);

  // Quick-Save Bottom Sheet state for message images and documents
  const [quickSaveState, setQuickSaveState] = useState<{
    isOpen: boolean;
    message: ChatMessage | null;
    targetType: "folder" | "album";
  }>({
    isOpen: false,
    message: null,
    targetType: "folder",
  });
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [newQuickCollectionName, setNewQuickCollectionName] = useState("");

  const handleOpenQuickSave = (msg: ChatMessage, targetType: "folder" | "album") => {
    setQuickSaveState({
      isOpen: true,
      message: msg,
      targetType,
    });
    setIsQuickCreateOpen(false);
    setNewQuickCollectionName("");
  };

  const [savedMessageMap, setSavedMessageMap] = useState<Record<string, string>>({});

  const handleDirectQuickSave = (msg: ChatMessage, collectionId: string, targetType: "folder" | "album") => {
    if (targetType === "album") {
      const targetAlbum = (activeUserAlbums.length > 0 ? activeUserAlbums : [{ id: 'default-alb', name: '默认相册', photoCount: 0, photos: [], createdDate: '2026-08-18' }]).find((a) => a.id === collectionId) || activeUserAlbums[0];
      if (targetAlbum) {
        const newAsset: DocumentAsset = {
          id: `saved-photo-${Date.now()}`,
          title: `${targetAlbum.name}_图片_${Date.now().toString().slice(-4)}`,
          type: "photo",
          url: msg.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
          size: "2.5 MB",
          source: { type: "manual", name: "聊天快捷存入" },
          date: msg.timestamp || "刚刚",
          timestamp: Date.now(),
          aiCategory: "inspiration",
          aiTags: ["聊天存入", targetAlbum.name],
          targetAlbumId: targetAlbum.id,
          fileExtension: "jpg",
        };
        setActiveUserAlbums((prev) => {
          const list = prev.length > 0 ? prev : [{ id: 'default-alb', name: '默认相册', photoCount: 0, photos: [], createdDate: '2026-08-18' }];
          return list.map((alb) =>
            alb.id === targetAlbum.id
              ? { ...alb, photoCount: alb.photoCount + 1, photos: [newAsset, ...alb.photos] }
              : alb
          );
        });
        showToast(`✅ 已成功存入个人相册【${targetAlbum.name}】📸`);
      }
    } else {
      const targetFolder = (activeUserFolders.length > 0 ? activeUserFolders : [{ id: 'default-fld', name: '默认文件夹', fileCount: 0, files: [], createdDate: '2026-08-18' }]).find((f) => f.id === collectionId) || activeUserFolders[0];
      if (targetFolder) {
        const newAsset: DocumentAsset = {
          id: `saved-doc-${Date.now()}`,
          title: msg.fileData?.name || `文件归档_${Date.now().toString().slice(-4)}.pdf`,
          type: "document",
          size: msg.fileData?.size || "1.8 MB",
          source: { type: "manual", name: "聊天快捷存入" },
          date: msg.timestamp || "刚刚",
          timestamp: Date.now(),
          aiCategory: "contracts",
          aiTags: ["聊天归档", targetFolder.name],
          targetFolderId: targetFolder.id,
          author: msg.senderName || "我",
          fileExtension: (msg.fileData?.name?.split(".").pop() as any) || "pdf",
        };
        setActiveUserFolders((prev) => {
          const list = prev.length > 0 ? prev : [{ id: 'default-fld', name: '默认文件夹', fileCount: 0, files: [], createdDate: '2026-08-18' }];
          return list.map((fld) =>
            fld.id === targetFolder.id
              ? { ...fld, fileCount: fld.fileCount + 1, files: [newAsset, ...fld.files] }
              : fld
          );
        });
        showToast(`✅ 已成功存入个人文件夹【${targetFolder.name}】📁`);
      }
    }
    setSavedMessageMap((prev) => ({ ...prev, [msg.id]: collectionId }));
  };

  const handleExecuteQuickSave = (collectionId: string) => {
    if (!quickSaveState.message) return;
    const msg = quickSaveState.message;
    const isAlbum = quickSaveState.targetType === "album";

    if (isAlbum) {
      const targetAlbum = activeUserAlbums.find((a) => a.id === collectionId);
      if (targetAlbum) {
        const newAsset: DocumentAsset = {
          id: `saved-photo-${Date.now()}`,
          title: `${targetAlbum.name}_图片_${Date.now().toString().slice(-4)}`,
          type: "photo",
          url: msg.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
          size: "2.5 MB",
          source: {
            type: "manual",
            name: "聊天快捷存入",
          },
          date: msg.timestamp || "刚刚",
          timestamp: Date.now(),
          aiCategory: "inspiration",
          aiTags: ["聊天存入", targetAlbum.name],
          targetAlbumId: targetAlbum.id,
          fileExtension: "jpg",
        };

        setActiveUserAlbums((prev) =>
          prev.map((alb) =>
            alb.id === targetAlbum.id
              ? {
                  ...alb,
                  photoCount: alb.photoCount + 1,
                  photos: [newAsset, ...alb.photos],
                }
              : alb
          )
        );
        showToast(`✅ 已成功存入个人相册【${targetAlbum.name}】📸`);
      }
    } else {
      const targetFolder = activeUserFolders.find((f) => f.id === collectionId);
      if (targetFolder) {
        const newAsset: DocumentAsset = {
          id: `saved-doc-${Date.now()}`,
          title: msg.fileData?.name || `文件归档_${Date.now().toString().slice(-4)}.pdf`,
          type: "document",
          size: msg.fileData?.size || "1.8 MB",
          source: {
            type: "manual",
            name: "聊天快捷存入",
          },
          date: msg.timestamp || "刚刚",
          timestamp: Date.now(),
          aiCategory: "contracts",
          aiTags: ["聊天归档", targetFolder.name],
          targetFolderId: targetFolder.id,
          author: msg.senderName || "我",
          fileExtension: (msg.fileData?.name?.split(".").pop() as any) || "pdf",
        };

        setActiveUserFolders((prev) =>
          prev.map((fld) =>
            fld.id === targetFolder.id
              ? {
                  ...fld,
                  fileCount: fld.fileCount + 1,
                  files: [newAsset, ...fld.files],
                }
              : fld
          )
        );
        showToast(`✅ 已成功存入个人文件夹【${targetFolder.name}】📁`);
      }
    }

    setQuickSaveState({ isOpen: false, message: null, targetType: "folder" });
  };

  const handleQuickCreateAndSave = () => {
    if (!newQuickCollectionName.trim()) {
      showToast("请输入名称 ✨");
      return;
    }

    const isAlbum = quickSaveState.targetType === "album";
    if (isAlbum) {
      const newAlbum: PhotoAlbum = {
        id: `user-album-${Date.now()}`,
        name: newQuickCollectionName.trim(),
        coverUrl: quickSaveState.message?.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400",
        isGroupSync: false,
        photoCount: 0,
        createdDate: new Date().toISOString().slice(0, 10),
        description: "快速创建的相册",
        photos: [],
      };
      setActiveUserAlbums((prev) => [newAlbum, ...prev]);
      handleExecuteQuickSave(newAlbum.id);
    } else {
      const newFolder: DocumentFolder = {
        id: `user-folder-${Date.now()}`,
        name: newQuickCollectionName.trim(),
        isGroupSync: false,
        fileCount: 0,
        color: "#1877F2",
        createdDate: new Date().toISOString().slice(0, 10),
        description: "快速创建的文件夹",
        files: [],
      };
      setActiveUserFolders((prev) => [newFolder, ...prev]);
      handleExecuteQuickSave(newFolder.id);
    }
  };
  const [inputText, setInputText] = useState("");
  const [messageAppearance, setMessageAppearance] = useMessageAppearance();
  useEffect(() => {
    if (!canvasEntry || !activeConversation || activeConversation.friendId !== canvasEntry.friendId) return;
    setMessageAppearance(canvasEntry.appearance);
  }, [canvasEntry?.key, activeConversation?.id]);
  const [isMessageStyleOpen, setIsMessageStyleOpen] = useState(false);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Auto-resize chat textarea dynamically as text grows (up to 4 lines max)
  useEffect(() => {
    const el = chatTextareaRef.current;
    if (el) {
      el.style.height = "auto";
      const computedLineHeight = 22;
      const verticalPadding = 8;
      const minHeight = computedLineHeight + verticalPadding; // 30px (1 line)
      const maxHeight = computedLineHeight * 4 + verticalPadding; // 96px (max 4 lines)
      const scrollHeight = el.scrollHeight;

      if (scrollHeight > maxHeight) {
        el.style.height = `${maxHeight}px`;
        el.style.overflowY = "auto";
      } else {
        const targetHeight = Math.max(scrollHeight, minHeight);
        el.style.height = `${targetHeight}px`;
        el.style.overflowY = "hidden";
      }
    }
  }, [inputText]);
  const [isBurnAfterReadingMode, setIsBurnAfterReadingMode] = useState(false);
  const [quotedMessage, setQuotedMessage] = useState<{
    id: string;
    senderName?: string;
    text?: string;
  } | null>(null);
  const [viewingBurnMessageId, setViewingBurnMessageId] = useState<
    string | null
  >(null);
  const [burnedMessageIds, setBurnedMessageIds] = useState<Set<string>>(
    new Set(),
  );
  const [swipedMessageId, setSwipedMessageId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<{
    msgId: string;
    offset: number;
    direction: "left" | "right";
  } | null>(null);
  const [activeQuickReplyMsgId, setActiveQuickReplyMsgId] = useState<string | null>(null);

  const handleSendQuickActionReply = (text: string, targetMsg: ChatMessage) => {
    if (!activeChatId) return;
    const quote = {
      id: targetMsg.id,
      senderName: targetMsg.isMe
        ? "我"
        : targetMsg.senderName || activeConversation?.friendName || "对方",
      text:
        targetMsg.text ||
        (targetMsg.imageUrl
          ? "[图片]"
          : targetMsg.fileData
            ? "[文件]"
            : targetMsg.locationData
              ? "[位置]"
              : "[消息]"),
    };
    onSendMessage(activeChatId, text, { type: "text" }, quote);
    setSwipedMessageId(null);
    setSwipeOffset(null);
    setActiveQuickReplyMsgId(null);
    soundEffects.playWhooshSound();
    haptics.trigger("medium");
    showToast(`已快捷回复「${text}」`);
  };

  const getBubbleTransformStyle = (mId: string, isMeMsg: boolean) => {
    if (swipeOffset && swipeOffset.msgId === mId) {
      return {
        transform: `translateX(${swipeOffset.offset}px)`,
        transition: "none",
      };
    }
    if (swipedMessageId === mId) {
      return {
        transform: isMeMsg ? "translateX(-6px)" : "translateX(6px)",
        transition: "transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)",
      };
    }
    return {
      transform: "none",
      transition: "transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)",
    };
  };
  const [swipedChatId, setSwipedChatId] = useState<string | null>(null);
  const lastSwipeActionTimeRef = useRef<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "groups">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedChatIds, setPinnedChatIds] = useState<string[]>([
    "cg-1",
    "friend-1",
  ]);
  const [chatActionMenuId, setChatActionMenuId] = useState<string | null>(null);

  // Long-press conversation to pin/unpin to top (长按会话置顶并移至列表最上方)
  const convLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const convLongPressStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isConvLongPressTriggeredRef = useRef(false);
  const [pressingChatId, setPressingChatId] = useState<string | null>(null);

  const handleTogglePinConversation = (convId: string) => {
    const targetConv = conversations.find((c) => c.id === convId);
    const convName = targetConv?.friendName || "会话";
    const currentlyPinned = pinnedChatIds.includes(convId) || !!targetConv?.isPinned;

    if (currentlyPinned) {
      setPinnedChatIds((prev) => prev.filter((id) => id !== convId));
      showToast(`已取消 "${convName}" 的置顶`);
      soundEffects.playTapSound();
      haptics.trigger("medium");
    } else {
      // Put at index 0 so it is placed at the absolute top of the list
      setPinnedChatIds((prev) => [convId, ...prev.filter((id) => id !== convId)]);
      showToast(`📌 已将 "${convName}" 置顶，排在列表最上方`);
      soundEffects.playSuccessSound();
      haptics.trigger("heavy");
    }

    if (onTogglePinConversation) {
      onTogglePinConversation(convId);
    }
  };

  const handleStartLongPress = (convId: string, clientX: number, clientY: number) => {
    convLongPressStartPosRef.current = { x: clientX, y: clientY };
    isConvLongPressTriggeredRef.current = false;
    setPressingChatId(convId);

    if (convLongPressTimerRef.current) {
      clearTimeout(convLongPressTimerRef.current);
    }

    convLongPressTimerRef.current = setTimeout(() => {
      isConvLongPressTriggeredRef.current = true;
      setPressingChatId(null);
      convLongPressStartPosRef.current = null;
      handleTogglePinConversation(convId);
    }, 500);
  };

  const handleMoveLongPress = (clientX: number, clientY: number) => {
    if (!convLongPressStartPosRef.current) return;
    const dist = Math.hypot(
      clientX - convLongPressStartPosRef.current.x,
      clientY - convLongPressStartPosRef.current.y
    );
    if (dist > 8) {
      if (convLongPressTimerRef.current) {
        clearTimeout(convLongPressTimerRef.current);
        convLongPressTimerRef.current = null;
      }
      setPressingChatId(null);
      convLongPressStartPosRef.current = null;
    }
  };

  const handleEndLongPress = () => {
    if (convLongPressTimerRef.current) {
      clearTimeout(convLongPressTimerRef.current);
      convLongPressTimerRef.current = null;
    }
    setPressingChatId(null);
    convLongPressStartPosRef.current = null;
  };

  // Forwarding & Multi-Select states
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedMultiMsgIds, setSelectedMultiMsgIds] = useState<Set<string>>(new Set());

  const handleToggleMultiSelectMessage = (msgId: string) => {
    setSelectedMultiMsgIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };
  const [forwardModalState, setForwardModalState] = useState<{
    isOpen: boolean;
    sourceMessages: ChatMessage[];
    forwardMode: "itemized" | "unified";
    selectedTargetChatIds: string[];
    searchQuery: string;
  }>({
    isOpen: false,
    sourceMessages: [],
    forwardMode: "itemized",
    selectedTargetChatIds: [],
    searchQuery: "",
  });

  // Create Group Chat Modal state
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAnnouncement, setNewGroupAnnouncement] = useState(
    "欢迎大家加入群聊！请文明交流，共同营造良好的沟通环境。",
  );
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  // Group Details Editing states
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [groupAnnouncementInput, setGroupAnnouncementInput] = useState("");
  const [showManagementCenter, setShowManagementCenter] = useState(false);

  // Chat View Swipe Right-to-Left or Drag to open Chat Management Center
  const isBubbleGestureActiveRef = useRef<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [containerDragOffset, setContainerDragOffset] = useState<number>(0);
  const edgeBackRef = useRef(false);

  const isTargetInsideBubbleOrControl = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof Element)) return false;
    return !!target.closest(
      '[id^="msg-bubble-"], [data-msg-bubble], .msg-bubble-entry-200, .msg-bubble-card, .bump-canvas-precision, .stellar-chat-drawer, button, input, textarea, a, select, [role="button"], #floating-message-action-menu, #floating-emoji-picker, #chat-input-container, #chat-input-bar, #chat-header-bar, .group-action-tray, .quick-action-reply-panel, [id^="conv-list-"]'
    );
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    edgeBackRef.current = false;
    // If a bubble gesture is active or interaction originated from a bubble/button/input, do not drag screen!
    if (isBubbleGestureActiveRef.current || isTargetInsideBubbleOrControl(e.target)) {
      setDragStartX(null);
      setDragStartY(null);
      return;
    }
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
    edgeBackRef.current = Boolean(activeConversation && x >= 0 && x <= 28);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isBubbleGestureActiveRef.current || dragStartX === null || dragStartY === null) return;
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    // Horizontal left swipe on the dialogue screen background
    if (edgeBackRef.current && deltaX > 0 && deltaX > Math.abs(deltaY) * 1.2) {
      setContainerDragOffset(Math.min(220, deltaX));
    } else if (deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      // Rubber-band damping formula: non-linear resistance for left drag
      const damped = -Math.pow(Math.abs(deltaX), 0.85) * 1.15;
      setContainerDragOffset(Math.max(-140, damped));
    } else {
      setContainerDragOffset(0);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isBubbleGestureActiveRef.current || dragStartX === null || dragStartY === null) {
      setDragStartX(null);
      setDragStartY(null);
      setContainerDragOffset(0);
      return;
    }
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    // Right-to-left swipe on the dialogue screen background (deltaX < -45) -> Open Chat Management Center
    if (edgeBackRef.current && deltaX > 90 && deltaX > Math.abs(deltaY) * 1.3) {
      onSelectChat(null);
    } else if (deltaX < -45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (onOpenManagementCenter) {
        onOpenManagementCenter();
      } else {
        setShowManagementCenter(true);
      }
    }
    setDragStartX(null);
    setDragStartY(null);
    setContainerDragOffset(0);
    edgeBackRef.current = false;
  };

  // Top Story / Note interaction
  const [localUserNote, setLocalUserNote] = useState("音乐不停，分享不止...");
  const [localAttachedEmoji, setLocalAttachedEmoji] = useState("😜");
  const [localNoteTheme, setLocalNoteTheme] = useState<
    "pink" | "white" | "blue" | "sunset"
  >("pink");

  const userNote = propUserNote !== undefined ? propUserNote : localUserNote;
  const attachedEmoji =
    propAttachedEmoji !== undefined ? propAttachedEmoji : localAttachedEmoji;
  const noteTheme =
    propNoteTheme !== undefined ? propNoteTheme : localNoteTheme;
  const [noteMusic, setNoteMusic] = useState<string | null>(null);
  const [noteLocationTag, setNoteLocationTag] = useState<string | null>(null);
  const [noteGif, setNoteGif] = useState<string | null>(null);
  const [noteAudience, setNoteAudience] = useState<
    "friends" | "close" | "private"
  >("friends");
  const [hasNoteBubble, setHasNoteBubble] = useState(true);
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Draft state inside the fullscreen note creator
  const [tempText, setTempText] = useState("音乐不停，分享不止...");
  const [tempEmoji, setTempEmoji] = useState("😜");
  const [tempTheme, setTempTheme] = useState<
    "pink" | "white" | "blue" | "sunset"
  >("pink");
  const [tempMusic, setTempMusic] = useState<string | null>(null);
  const [tempLocationTag, setTempLocationTag] = useState<string | null>(null);
  const [tempGif, setTempGif] = useState<string | null>(null);
  const [tempAudience, setTempAudience] = useState<
    "friends" | "close" | "private"
  >("friends");

  // User Chat Speech Bubble Gradient & Color Family State
  const [userBubbleGradient, setUserBubbleGradient] = useState<string>(() => {
    return (
      localStorage.getItem("chat_user_bubble_gradient") ||
      "bg-[#007AFF] text-white"
    );
  });
  const [selectedColorFamily, setSelectedColorFamily] =
    useState<string>("blue-purple");

  // Active Picker Sheet: 'none' | 'emoji' | 'music' | 'location' | 'gif' | 'audience' | 'phrases' | 'palette'
  const [activePickerModal, setActivePickerModal] = useState<
    | "none"
    | "emoji"
    | "music"
    | "location"
    | "gif"
    | "audience"
    | "phrases"
    | "palette"
  >("none");

  // Virtual keyboard state
  const [isKeyboardShift, setIsKeyboardShift] = useState(false);
  const [isKeyboard123, setIsKeyboard123] = useState(false);
  const [isKeyboardLangZh, setIsKeyboardLangZh] = useState(true);

  // Action Menu Dropdown (More options: mark read, archive, delete)
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Group Details Drawer/Modal state
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isCancelZone, setIsCancelZone] = useState(false);
  const recordingTimerRef = useRef<number | null>(null);

  // Audio Playback states: { [messageId]: boolean }
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Transcribed Voice Messages state
  const [transcribedAudioIds, setTranscribedAudioIds] = useState<string[]>([]);

  // Multi-Reaction state: { [messageId]: { [emoji]: { count: number, hasReacted: boolean, users?: string[] } } }
  const [localMessageReactionsMap, setMessageReactionsMap] = useState<
    Record<string, Record<string, { count: number; hasReacted: boolean; users?: string[] }>>
  >({});
  const messageReactionsMap = useMemo(() => Object.fromEntries((activeConversation?.messages || []).map(message => [message.id, onUpdateMessage ? reactionMap(message, localMessageReactionsMap[message.id]) : localMessageReactionsMap[message.id] ?? reactionMap(message)])), [activeConversation?.messages, localMessageReactionsMap, onUpdateMessage]);

  // Highlighted Message ID (triggered by clicking reply preview or quoted bubble, ~700ms glow)
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);

  // Message currently being edited
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);

  // Locally edited message text overrides: { [msgId]: string }
  const [editedMessageMap, setEditedMessageMap] = useState<Record<string, string>>({});

  // Recalled message ids
  const [recalledMsgIds, setRecalledMsgIds] = useState<string[]>([]);

  // Recent Emojis state
  const [recentEmojis, setRecentEmojis] = useState<string[]>([
    "👍", "❤️", "😂", "🎉", "🔥", "👏", "😮", "❓", "💪", "✨", "☕", "🌸"
  ]);

  // Emoji combo multiplier tracking
  const lastSentEmojiTimeRef = useRef<number>(0);
  const lastSentEmojiCharRef = useRef<string>("");
  const [emojiComboMap, setEmojiComboMap] = useState<Record<string, number>>({});
  const fxCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Full-Screen Particle & Emoji Burst Engine
  const triggerFullScreenEffect = (effectType: string) => {
    const canvas = fxCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const charMap: Record<string, string[]> = {
      confetti: ["🎉", "✨", "🎊", "⭐", "🌟"],
      hearts: ["❤️", "💖", "💕", "💗", "💓"],
      fire: ["🔥", "💥", "⚡", "✨"],
      sparkles: ["✨", "🌟", "⭐", "💫"],
      bomb: ["💣", "💥", "💨", "🔥"],
      rocket: ["🚀", "✨", "💨", "⭐"],
      thumbs: ["👍", "👏", "✨", "💯"],
    };

    const chars = charMap[effectType] || ["✨", "🎉", "❤️"];
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      char: string;
      rotation: number;
      vr: number;
    }> = [];

    const count = 36;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 100,
        y: canvas.height * 0.7 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 16 - 6,
        size: Math.random() * 16 + 18,
        alpha: 1,
        char: chars[Math.floor(Math.random() * chars.length)],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
      });
    }

    const start = performance.now();
    const duration = 1400;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = elapsed / duration;
      if (progress >= 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // gravity
        p.rotation += p.vr;
        p.alpha = Math.max(0, 1 - progress * 1.1);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  // Message Deletion Particle Dispersion Effect (Physics Engine: 6-8 Disintegrating Particles)
  const triggerMessageDispersionEffect = (rect: DOMRect) => {
    const canvas = fxCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Strictly 6 to 8 particles as specified in requirements
    const count = Math.floor(Math.random() * 3) + 6;
    const colors = ["#1877F2", "#166fe5", "#4292f8", "#E4E6EB", "#8A8D91", "#FFFFFF"];

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      width: number;
      height: number;
      rotation: number;
      vRot: number;
      alpha: number;
      color: string;
      isRounded: boolean;
    }> = [];

    for (let i = 0; i < count; i++) {
      const baseAngle = (i / count) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.45;
      const angle = baseAngle + jitter;
      const speed = Math.random() * 6 + 4.5;
      const spreadX = (Math.random() - 0.5) * (Math.min(rect.width, 120) * 0.6);
      const spreadY = (Math.random() - 0.5) * (Math.min(rect.height, 60) * 0.6);

      particles.push({
        x: centerX + spreadX,
        y: centerY + spreadY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.2, // upward initial explosion impulse
        width: Math.random() * 5 + 6,
        height: Math.random() * 5 + 6,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.35,
        alpha: 1,
        color: colors[i % colors.length],
        isRounded: i % 2 === 0,
      });
    }

    const start = performance.now();
    const duration = 400; // Snappy 400ms physical particle disintegration

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      if (progress >= 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gravity = 0.22;
      const drag = 0.95;

      particles.forEach((p) => {
        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.rotation += p.vRot;
        p.alpha = Math.max(0, 1 - progress * 1.08);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const scale = Math.max(0.2, 1 - progress * 0.45);
        const w = p.width * scale;
        const h = p.height * scale;

        if (p.isRounded) {
          ctx.beginPath();
          ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-w / 2, -h / 2, w, h);
        }
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  // Single Tap Emoji Reaction Floating Bar
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<{
    msgId: string;
    x: number;
    y: number;
    isTop: boolean;
  } | null>(null);

  // Long Press / Right-Click Floating Action Menu - Anchored directly above the chat bubble
  const [activeActionMenu, setActiveActionMenu] = useState<{
    msg: ChatMessage;
    x: number;
    y: number;
    isTop: boolean;
  } | null>(null);

  const [isFlyAwaySend, setIsFlyAwaySend] = useState(false);

  useEffect(() => {
    try { const saved = localStorage.getItem(`stellar_chat_reactions_${activeConversation?.id}`); setMessageReactionsMap(saved ? JSON.parse(saved) : {}); } catch { setMessageReactionsMap({}); }
    setEditedMessageMap({}); setDeletedMsgIds([]); setRecalledMsgIds([]); setEditingMessage(null); setQuotedMessage(null);
  }, [activeConversation?.id]);

  // Toggle reaction on a message with smooth merge/count update
  const handleToggleReaction = (msgId: string, emoji: string) => {
    const currentMsgMap = toggleReaction(messageReactionsMap[msgId] || {}, emoji);
    const next = { ...messageReactionsMap, [msgId]: currentMsgMap };
    setMessageReactionsMap(next);
    if (activeConversation && onUpdateMessage) onUpdateMessage(activeConversation.id, msgId, { reactions: Object.entries(currentMsgMap).map(([emoji, entry]) => ({emoji,count:entry.count,hasReacted:entry.hasReacted})) });
    try { localStorage.setItem(`stellar_chat_reactions_${activeConversation?.id}`, JSON.stringify(next)); } catch {}
    if (currentMsgMap[emoji]?.hasReacted) setRecentEmojis(previous => [emoji,...previous.filter(value => value !== emoji)].slice(0,16));

    soundEffects.playBubblePopSound();
    haptics.trigger('light');
    setActiveEmojiPicker(null);
    setActiveActionMenu(null);
  };

  // Jump to quoted or referenced message and trigger ~700ms highlight
  const handleJumpToMessage = (targetMsgId: string) => {
    const el = document.getElementById(`msg-bubble-${targetMsgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMsgId(targetMsgId);
      setTimeout(() => {
        setHighlightedMsgId(null);
      }, 700);
    } else {
      showToast("原消息已不在可视列表中");
    }
  };

  // Start editing a message
  const handleStartEditMessage = (msg: ChatMessage) => {
    setEditingMessage(msg);
    setInputText(msg.text || "");
    setQuotedMessage(null);
    setActiveActionMenu(null);
    if (chatTextareaRef.current) {
      chatTextareaRef.current.focus();
    }
  };

  // Action Menu Helpers
  const handleActionEdit = (msg: ChatMessage) => {
    handleStartEditMessage(msg);
  };

  const handleActionRecall = (msgId: string) => {
    handleRecallMessage(msgId);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setInputText("");
  };

  // Recall a message (撤回消息：该条消息被删除，并显示“你撤回了一条消息”)
  const handleRecallMessage = (msgIdOrMsg: string | ChatMessage) => {
    const msgId = typeof msgIdOrMsg === "string" ? msgIdOrMsg : msgIdOrMsg.id;
    if (!msgId) return;

    // 1. 本地更新 recalledMsgIds
    setRecalledMsgIds((prev) => (prev.includes(msgId) ? prev : [...prev, msgId]));

    // 2. 更新消息属性：清空原有内容，改为已撤回提示
    if (activeConversation && onUpdateMessage) {
      onUpdateMessage(activeConversation.id, msgId, {
        isRecalled: true,
        type: 'recalled',
        text: '你撤回了一条消息',
        imageUrl: undefined,
        audioUrl: undefined,
        fileData: undefined,
        locationData: undefined,
        activityData: undefined,
        contactData: undefined,
        reactions: [],
      });
    }

    setActiveActionMenu(null);
    showToast("你撤回了一条消息");
    soundEffects.playTapSound();
    haptics.trigger('medium');
  };

  const handleBubbleDoubleTap = (msgId: string, clientX?: number, clientY?: number) => {
    // A click is synthesized after a long press. Consume it so the action menu
    // remains open until the user explicitly chooses an action or taps away.
    if (gestureStateRef.current.isLongPressed) return false;
    const now = Date.now();
    if (lastQuickReactionRef.current?.id === msgId && now - lastQuickReactionRef.current.time < 350) return false;
    lastQuickReactionRef.current = {id:msgId,time:now};
    handleToggleReaction(msgId, "👍");
    soundEffects.playBubblePopSound();
    haptics.trigger('light');
    if (!prefersReducedMotion && clientX && clientY && emojiFlyRef.current) {
      emojiFlyRef.current.spawnBurstAt(clientX, clientY, "👍", 5);
    } else if (!prefersReducedMotion && emojiFlyRef.current) {
      const el = document.getElementById(`msg-bubble-${msgId}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        emojiFlyRef.current.spawnBurstAt(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          "👍", 5,
        );
      }
    }
    return true;
  };

  // Locally deleted message ids
  const [deletedMsgIds, setDeletedMsgIds] = useState<string[]>([]);
  const [pinnedMsgIds, setPinnedMsgIds] = useState<string[]>([]);


  // Contacts Drawer state
  const [isContactsDrawerOpen, setIsContactsDrawerOpen] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [selectedAlphaLetter, setSelectedAlphaLetter] = useState<string | null>(null);

  // Input Module Comprehensive State
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [isHandwritingOpen, setIsHandwritingOpen] = useState(false);
  const [activeBottomDrawer, setActiveBottomDrawer] = useState<
    "none" | "emoji" | "more"
  >("none");
  const [bottomDrawerHeight, setBottomDrawerHeight] = useState(300);
  const [isDrawerResizing, setIsDrawerResizing] = useState(false);
  const bottomDrawerRef = useRef<HTMLDivElement>(null);
  const cancelDrawerResizeRef = useRef<(() => void) | null>(null);
  const drawerMaximum = () => Math.max(220, Math.min(540, (bottomDrawerRef.current?.parentElement?.clientHeight || 760) * .65));
  useEffect(() => { cancelDrawerResizeRef.current?.(); }, [activeBottomDrawer,activeChatId]);
  useEffect(() => () => cancelDrawerResizeRef.current?.(), []);
  const beginDrawerResize = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault(); event.stopPropagation(); cancelDrawerResizeRef.current?.();
    const initial = bottomDrawerRef.current?.getBoundingClientRect().height || bottomDrawerHeight;
    const startY = event.clientY, pointerId = event.pointerId, max = drawerMaximum();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture?.(pointerId); setIsDrawerResizing(true);
    const move = (e: PointerEvent) => { if (e.pointerId === pointerId) setBottomDrawerHeight(Math.max(160,Math.min(max,initial + startY - e.clientY))); };
    const cleanup = () => {
      window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',end); window.removeEventListener('pointercancel',cancel); window.removeEventListener('blur',cancel);
      if (target.hasPointerCapture?.(pointerId)) target.releasePointerCapture(pointerId);
      cancelDrawerResizeRef.current = null; setIsDrawerResizing(false);
    };
    const end = (e: PointerEvent) => { if (e.pointerId !== pointerId) return; move(e); cleanup(); };
    const cancel = () => { cleanup(); setBottomDrawerHeight(initial); };
    cancelDrawerResizeRef.current = cancel;
    window.addEventListener('pointermove',move); window.addEventListener('pointerup',end); window.addEventListener('pointercancel',cancel); window.addEventListener('blur',cancel);
  };
  const drawerHandle = <div role="slider" tabIndex={0} aria-label="调整聊天面板高度" aria-orientation="vertical" aria-valuemin={160} aria-valuemax={drawerMaximum()} aria-valuenow={Math.round(bottomDrawerHeight)} className="stellar-chat-drawer-handle" onPointerDown={beginDrawerResize} onKeyDown={event => {
    if (!['ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    setBottomDrawerHeight(current => event.key === 'Home' ? 160 : event.key === 'End' ? drawerMaximum() : Math.max(160,Math.min(drawerMaximum(),current + (event.key === 'ArrowUp' ? 40 : -40))));
  }} />;
  const [isShareContactModalOpen, setIsShareContactModalOpen] = useState(false);
  const [selectedBriefContact, setSelectedBriefContact] = useState<ContactCardData | null>(null);
  const [isBriefContactModalOpen, setIsBriefContactModalOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{
    type: "image" | "location" | "file" | "contact" | "camera";
    title: string;
    previewUrl?: string;
    subtitle?: string;
    contactData?: ContactCardData;
  } | null>(null);

  // Hold-to-Talk voice state
  const [isHoldingVoice, setIsHoldingVoice] = useState(false);
  const [voiceHoldCancel, setVoiceHoldCancel] = useState(false);
  const [voiceHoldSeconds, setVoiceHoldSeconds] = useState(0);
  const voiceHoldTimerRef = useRef<number | null>(null);
  const voiceStartYRef = useRef<number>(0);

  // Gesture tracking timer & state
  const longPressTimerRef = useRef<number | null>(null);
  const gestureStateRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    msgId: string | null;
    rect: DOMRect | null;
    isLongPressed: boolean;
    isSwiping: boolean;
  }>({
    startX: 0,
    startY: 0,
    startTime: 0,
    msgId: null,
    rect: null,
    isLongPressed: false,
    isSwiping: false,
  });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2000);
  };

  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setPullDistance(48);
    setRefreshStatus("refreshing");
    haptics.trigger("medium");
    soundEffects.playTapSound();

    try {
      if (onRefreshConversations) {
        await onRefreshConversations();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 750));
      }
      setRefreshStatus("success");
      soundEffects.playTapSound();
      showToast("💬 聊天列表已刷新，已同步最新消息");
    } catch {
      setRefreshStatus("error");
      showToast("⚠️ 刷新失败，请稍后重试");
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setRefreshStatus("idle");
        hasTriggeredHapticRef.current = false;
      }, 500);
    }
  }, [isRefreshing, onRefreshConversations]);

  const handleListTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    const listEl = conversationListRef.current;
    if (listEl && listEl.scrollTop > 2) {
      touchStartYRef.current = null;
      touchStartXRef.current = null;
      return;
    }
    touchStartYRef.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
    hasTriggeredHapticRef.current = false;
  };

  const handleListTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null || isRefreshing) return;
    const listEl = conversationListRef.current;
    if (listEl && listEl.scrollTop > 2) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - touchStartYRef.current;
    const deltaX = currentX - (touchStartXRef.current ?? currentX);

    if (deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX)) {
      const damped = Math.min(80, Math.pow(deltaY, 0.82));
      setPullDistance(damped);
      setIsPulling(true);

      if (damped >= 50 && !hasTriggeredHapticRef.current) {
        hasTriggeredHapticRef.current = true;
        haptics.trigger("light");
      } else if (damped < 50 && hasTriggeredHapticRef.current) {
        hasTriggeredHapticRef.current = false;
      }
    }
  };

  const handleListTouchEnd = () => {
    if (touchStartYRef.current === null) return;
    touchStartYRef.current = null;
    touchStartXRef.current = null;
    setIsPulling(false);

    if (pullDistance >= 50 && !isRefreshing) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
    hasTriggeredHapticRef.current = false;
  };

  const handleListMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    const listEl = conversationListRef.current;
    if (listEl && listEl.scrollTop > 2) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) return;

    isMouseDraggingRef.current = true;
    mouseStartYRef.current = e.clientY;
    hasTriggeredHapticRef.current = false;
  };

  const handleListMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDraggingRef.current || isRefreshing) return;
    const listEl = conversationListRef.current;
    if (listEl && listEl.scrollTop > 2) return;

    const deltaY = e.clientY - mouseStartYRef.current;
    if (deltaY > 0) {
      const damped = Math.min(80, Math.pow(deltaY, 0.82));
      setPullDistance(damped);
      setIsPulling(true);

      if (damped >= 50 && !hasTriggeredHapticRef.current) {
        hasTriggeredHapticRef.current = true;
        haptics.trigger("light");
      }
    }
  };

  const handleListMouseUp = () => {
    if (!isMouseDraggingRef.current) return;
    isMouseDraggingRef.current = false;
    setIsPulling(false);

    if (pullDistance >= 50 && !isRefreshing) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
    hasTriggeredHapticRef.current = false;
  };

  const handleListWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 12) {
      setIsHeaderCollapsed(true);
    } else if (e.deltaY < -12 && lastScrollTopRef.current <= 30) {
      setIsHeaderCollapsed(false);
    }

    const listEl = conversationListRef.current;
    if (listEl && listEl.scrollTop <= 0 && e.deltaY < -12 && !isRefreshing) {
      wheelPullDeltaRef.current += Math.abs(e.deltaY) * 0.7;
      const damped = Math.min(75, Math.pow(wheelPullDeltaRef.current, 0.8));
      setPullDistance(damped);
      setIsPulling(true);

      if (damped >= 50) {
        triggerRefresh();
        wheelPullDeltaRef.current = 0;
        setIsPulling(false);
      } else {
        if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = setTimeout(() => {
          setPullDistance(0);
          setIsPulling(false);
          wheelPullDeltaRef.current = 0;
        }, 300);
      }
    }
  };

  const visibleMessages = useMemo(() => visibleChatMessages(activeConversation?.messages || [], deletedMsgIds, editedMessageMap, recalledMsgIds, localMessageReactionsMap, !!onUpdateMessage), [activeConversation?.messages, deletedMsgIds, editedMessageMap, recalledMsgIds, localMessageReactionsMap, onUpdateMessage]);
  const isGroupChat = !!(
    activeConversation &&
    (activeConversation.isGroup || activeConversation.id.startsWith("cg"))
  );
  const isTeamChat = !!(
    activeConversation &&
    (activeConversation.isTeam || activeConversation.friendName.includes("小组"))
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatMessagesContainerRef.current) {
      const container = chatMessagesContainerRef.current;
      if (behavior === "auto") {
        container.scrollTop = container.scrollHeight;
      } else {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    }
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({
          behavior,
          block: "end",
          inline: "nearest",
        });
      } catch {
        // fallback safe
      }
    }
  };

  // Auto-scroll to bottom as user sends/receives messages or switches chats
  useEffect(() => {
    if (activeConversation) {
      // Immediate instantaneous scroll on chat open / message changes
      scrollToBottom("auto");
      const raf = requestAnimationFrame(() => {
        scrollToBottom("auto");
      });

      // Staggered smooth scrolls as layout and message bubble animation settle
      const timer1 = setTimeout(() => scrollToBottom("smooth"), 30);
      const timer2 = setTimeout(() => scrollToBottom("smooth"), 100);
      const timer3 = setTimeout(() => scrollToBottom("smooth"), 250);

      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [
    activeConversation?.id,
    activeConversation?.messages?.length,
    activeConversation?.messages?.[activeConversation.messages.length - 1]?.id,
    activeConversation?.messages?.[activeConversation.messages.length - 1]?.text,
    activeConversation?.messages?.[activeConversation.messages.length - 1]?.imageUrl,
    activeConversation?.messages?.[activeConversation.messages.length - 1]?.timestamp,
  ]);

  // Scroll to bottom when bottom drawer is opened
  useEffect(() => {
    if (activeBottomDrawer !== "none") {
      const t = setTimeout(() => scrollToBottom("smooth"), 100);
      return () => clearTimeout(t);
    }
  }, [activeBottomDrawer]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (voiceHoldTimerRef.current) clearInterval(voiceHoldTimerRef.current);
    };
  }, []);

  // Play synthetic voice note sound using Web Audio API
  const playVoiceSnippet = (messageId: string, durationSeconds: number = 3) => {
    if (playingAudioId === messageId) {
      setPlayingAudioId(null);
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContextClass();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.6);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + durationSeconds);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + durationSeconds);
      }
    } catch (e) {
      console.warn("Web Audio error:", e);
    }

    setPlayingAudioId(messageId);
    setTimeout(() => {
      setPlayingAudioId((curr) => (curr === messageId ? null : curr));
    }, durationSeconds * 1000);
  };

  // Start Voice Recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setIsCancelZone(false);

    recordingTimerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Stop & Send Voice Recording
  const stopAndSendRecording = () => {
    if (!isRecording) return;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const duration = Math.max(1, recordingSeconds);
    setIsRecording(false);
    setRecordingSeconds(0);

    if (isCancelZone) {
      showToast("录音已取消");
      setIsCancelZone(false);
      return;
    }

    if (activeChatId) {
      onSendMessage(activeChatId, "", { duration }, quotedMessage || undefined);
      setQuotedMessage(null);
      soundEffects.playWhooshSound();
      haptics.trigger('success');
      showToast(`已发送 ${duration} 秒语音消息 🎙️`);
    }
  };

  // Cancel Voice Recording
  const cancelRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setIsCancelZone(false);
    showToast("录音已取消");
  };

  // File input refs for real attachment upload
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Helper: check if message text contains ONLY 1-4 emojis without surrounding text
  const isPureEmoji = (text?: string): boolean => {
    if (!text) return false;
    const trimmed = text.trim();
    if (!trimmed) return false;
    const emojiRegex =
      /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\u200D|\uFE0F|\uFE0E|[\u{1F3FB}-\u{1F3FF}]|\s)+$/u;
    return trimmed.length <= 16 && emojiRegex.test(trimmed);
  };

  // Helper: check if message text contains strictly a SINGLE emoji (for 64px dynamic bubble)
  const isSingleEmoji = (text?: string): boolean => {
    if (!text) return false;
    const trimmed = text.trim();
    if (!trimmed) return false;

    if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
      try {
        const segmenter = new (Intl as any).Segmenter("en", {
          granularity: "grapheme",
        });
        const segments = Array.from(segmenter.segment(trimmed));
        if (segments.length === 1) {
          const emojiRegex =
            /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\u200D|\uFE0F|\uFE0E|[\u{1F3FB}-\u{1F3FF}])+$/u;
          return emojiRegex.test(trimmed);
        }
        return false;
      } catch (err) {
        // fallback
      }
    }

    const singleEmojiRegex =
      /^(\p{Extended_Pictographic}|\p{Emoji_Presentation})([\uFE0F\uFE0E]|\u200D[\p{Extended_Pictographic}|\p{Emoji_Presentation}]|[\u{1F3FB}-\u{1F3FF}])*$/u;
    return singleEmojiRegex.test(trimmed);
  };

  // Helper: Get avatar URL for quoted message sender
  const getQuotedSenderAvatar = (senderName?: string): string => {
    if (!senderName) return activeConversation?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150";
    if (senderName === "我" || senderName.includes("Rarcardo") || senderName === "你") {
      return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150";
    }
    if (activeConversation?.groupDetails?.members) {
      const found = activeConversation.groupDetails.members.find(
        (m) => m.name.toLowerCase().includes(senderName.toLowerCase()) || senderName.toLowerCase().includes(m.name.toLowerCase())
      );
      if (found?.avatar) return found.avatar;
    }
    return activeConversation?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150";
  };

  // Helper: Highlight @mentions in text messages with interactive badge & thumbnail avatar
  const renderHighlightedText = (text?: string, isMe?: boolean) => {
    if (!text) return null;
    const parts = text.split(/(@[\w\u4e00-\u9fa5]+)/g);
    const memberAvatars: Record<string, string> = {
      Sarah:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      "Sarah Chen":
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      Alex: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      "Alex Mercer":
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      Lucas:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      "Lucas Zhao":
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      Mia: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
      "Mia Wang":
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
      David:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      "David Chen":
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      所有人:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=150",
    };
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith("@")) {
            const targetName = part.slice(1);
            const avatar =
              memberAvatars[targetName] ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
            return (
              <span
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setInputText((prev) =>
                    prev ? `${prev} @${targetName} ` : `@${targetName} `,
                  );
                  showToast(`已快捷 @${targetName}`);
                }}
                className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full font-bold text-[11px] mx-0.5 transition-all cursor-pointer select-none ${
                  isMe
                    ? "bg-white/25 text-white ring-1 ring-white/30 hover:bg-white/35"
                    : "bg-blue-100 text-[#1877F2] ring-1 ring-blue-200 hover:bg-blue-200"
                }`}
              >
                <img
                  src={avatar}
                  alt={targetName}
                  className="w-3.5 h-3.5 rounded-full object-cover shrink-0 ring-1 ring-white"
                />
                <span>@{targetName}</span>
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  // Real Photo / Camera file picker change handler
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedAttachment({
          type: "image",
          title: file.name,
          previewUrl: event.target?.result as string,
          subtitle: `${(file.size / 1024).toFixed(1)} KB`,
        });
        setActiveBottomDrawer("none");
        showToast("已载入本地照片，可直接点击发送 📷");
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // Real Document file picker change handler
  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAttachment({
        type: "file",
        title: file.name,
        subtitle: `${(file.size / (1024 * 1024)).toFixed(2)} MB · 文档`,
      });
      setActiveBottomDrawer("none");
      showToast(`已选择文档: ${file.name} 📄`);
    }
    e.target.value = "";
  };

  // Comprehensive message send (handles text, attachments, quotes, prototype emojis, photos)
  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChatId) return;

    const trimmed = inputText.trim();
    if (!trimmed && !selectedAttachment) return;

    // Handle Editing state
    if (editingMessage) {
      if (trimmed) {
        setEditedMessageMap((prev) => ({
          ...prev,
          [editingMessage.id]: trimmed,
        }));
        onUpdateMessage?.(activeConversation?.id || activeChatId, editingMessage.id, {text:trimmed});
        showToast("消息已更新 ✏️");
        soundEffects.playSuccessSound();
      }
      setEditingMessage(null);
      setInputText("");
      if (chatTextareaRef.current) {
        chatTextareaRef.current.style.height = "36px";
      }
      return;
    }

    if (selectedAttachment) {
      const baseOptions = { isBurnAfterReading: isBurnAfterReadingMode };
      if (
        selectedAttachment.type === "image" ||
        selectedAttachment.type === "camera"
      ) {
        onSendMessage(
          activeChatId,
          trimmed,
          {
            ...baseOptions,
            type: "image",
            textStyle: messageAppearance,
            imageUrl:
              selectedAttachment.previewUrl ||
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400",
          },
          quotedMessage || undefined,
        );
      } else if (selectedAttachment.type === "file") {
        onSendMessage(
          activeChatId,
          trimmed,
          {
            ...baseOptions,
            type: "file",
            fileData: {
              name: selectedAttachment.title,
              size: selectedAttachment.subtitle || "2.4 MB",
              type: "doc",
            },
          },
          quotedMessage || undefined,
        );
      } else if (selectedAttachment.type === "location") {
        onSendMessage(
          activeChatId,
          trimmed,
          {
            ...baseOptions,
            type: "location",
            locationData: {
              name: selectedAttachment.title,
              address: selectedAttachment.subtitle || "甘肃省兰州市城关区",
            },
          },
          quotedMessage || undefined,
        );
      } else if (selectedAttachment.type === "contact") {
        const contactCard = selectedAttachment.contactData || {
          name: selectedAttachment.title,
          avatar: selectedAttachment.previewUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
          bio: selectedAttachment.subtitle || "同城探索达人",
          locationName: "东方红广场",
          address: "甘肃省兰州市城关区广场南路",
          lat: 36.0615,
          lng: 103.8085,
          distance: "850m",
          isOnline: true,
        };
        onSendMessage(
          activeChatId,
          `[名片] ${selectedAttachment.title}`,
          {
            ...baseOptions,
            type: "contact",
            contactData: contactCard,
          },
          quotedMessage || undefined,
        );
      }
    } else {
      const baseOptions = { isBurnAfterReading: isBurnAfterReadingMode };
      const now = Date.now();

      // Check if it's pure emoji reply
      if (isPureEmoji(trimmed)) {
        // Prohibit chaotic full-screen explosion in group chat
        if (!isGroupChat && FULLSCREEN_EFFECT_MAP[trimmed]) {
          triggerFullScreenEffect(FULLSCREEN_EFFECT_MAP[trimmed]);
        }

        // Fast consecutive emoji combo multiplier
        if (
          now - lastSentEmojiTimeRef.current < 550 &&
          lastSentEmojiCharRef.current === trimmed
        ) {
          setEmojiComboMap((prev) => ({
            ...prev,
            [trimmed]: (prev[trimmed] || 1) + 1,
          }));
        } else {
          setEmojiComboMap((prev) => ({ ...prev, [trimmed]: 1 }));
        }
        lastSentEmojiTimeRef.current = now;
        lastSentEmojiCharRef.current = trimmed;

        onSendMessage(
          activeChatId,
          trimmed,
          {
            ...baseOptions,
            type: "emoji",
            emojiData: { emoji: trimmed, animation: "bounce" },
          },
          quotedMessage || undefined,
        );
      } else {
        onSendMessage(
          activeChatId,
          trimmed,
          { ...baseOptions, type: "text", textStyle: messageAppearance },
          quotedMessage || undefined,
        );
      }
    }

    // Snappy paper plane feedback: strictly within 120ms
    setIsFlyAwaySend(true);
    setTimeout(() => setIsFlyAwaySend(false), 120);

    setInputText("");
    if (chatTextareaRef.current) {
      chatTextareaRef.current.style.height = "36px";
    }
    setSelectedAttachment(null);
    setQuotedMessage(null);
    setActiveBottomDrawer("none");
    soundEffects.playWhooshSound();
    haptics.trigger("light");

    // Non-blocking smooth scroll to bottom
    requestAnimationFrame(() => {
      scrollToBottom("smooth");
    });
  };

  // Send full-screen handwriting message
  const handleSendHandwriting = (imageUrl: string, strokes: any[], doodleLayout: ChatMessage["doodleLayout"]) => {
    if (!activeChatId) return;
    onSendMessage(
      activeChatId,
      "[涂鸦]",
      {
        type: "handwriting",
        imageUrl,
        isHandwriting: true,
        handwritingStrokes: strokes,
        doodleLayout,
        textStyle: messageAppearance,
      }
    );
    soundEffects.playWhooshSound();
    haptics.trigger("success");
    showToast("涂鸦已加入对话");
  };

  // Send single sticker / meme directly
  const handleSendSticker = (sticker: {
    title: string;
    emoji: string;
    subtitle: string;
  }) => {
    if (!activeChatId) return;
    // Prohibit full-screen chaotic explosion in group chat
    if (!isGroupChat && FULLSCREEN_EFFECT_MAP[sticker.emoji]) {
      triggerFullScreenEffect(FULLSCREEN_EFFECT_MAP[sticker.emoji]);
    }
    onSendMessage(
      activeChatId,
      sticker.emoji,
      {
        type: "emoji",
        emojiData: { emoji: sticker.emoji, animation: "bounce" },
      },
      quotedMessage || undefined,
    );
    setQuotedMessage(null);
    setActiveBottomDrawer("none");
    soundEffects.playWhooshSound();
    haptics.trigger("light");
    showToast(`已发送贴纸表情: ${sticker.title} ${sticker.emoji}`);
  };

  // Send quick phrase directly
  const handleSendPhrase = (phrase: string) => {
    if (!activeChatId) return;
    onSendMessage(
      activeChatId,
      phrase,
      { type: "text" },
      quotedMessage || undefined,
    );
    setQuotedMessage(null);
    soundEffects.playWhooshSound();
    haptics.trigger('light');
    setActiveBottomDrawer("none");
    showToast(`已发送常用语: ${phrase}`);
  };

  // Handle clicking one of the 8 Plus Extension Tools
  const handleSelectTool = (toolId: string) => {
    switch (toolId) {
      case "activity":
        setIsActivityPickerOpen(true);
        setActiveBottomDrawer("none");
        break;

      case "photos":
        if (photoInputRef.current) {
          photoInputRef.current.click();
        } else {
          setSelectedAttachment({
            type: "image",
            title: "兰州·中山铁桥实景.jpg",
            previewUrl:
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
            subtitle: "342.5 KB · 示例照片",
          });
          setActiveBottomDrawer("none");
          showToast("已载入照片，可直接点击发送 📷");
        }
        break;

      case "camera":
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        } else {
          setSelectedAttachment({
            type: "image",
            title: "即时拍摄_01.jpg",
            previewUrl:
              "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=600",
            subtitle: "418.2 KB · 即时拍照",
          });
          setActiveBottomDrawer("none");
          showToast("已拍照，可直接点击发送 📷");
        }
        break;

      case "location": {
        const targetChatId = activeChatId || activeConversation?.id;
        const liveShareData = {
          id: `live-share-${Date.now()}`,
          userId: "me",
          userName: "我 (Alexia)",
          userAvatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
          locationName: "兰州 · 中山铁桥 (实时位置共享)",
          address: "甘肃省兰州市城关区南滨河东路",
          lat: 36.0611,
          lng: 103.8343,
          createdAt: Date.now(),
          expiresAt: Date.now() + 60 * 60 * 1000,
          durationMinutes: 60,
        };

        // Notify parent to generate live location bubble on map
        if (onShareRealTimeLocation) {
          onShareRealTimeLocation(liveShareData);
        }

        // Send a dedicated Live Location message into active chat
        if (targetChatId) {
          onSendMessage(
            targetChatId,
            "📍 开启了实时位置共享（有效期 1 小时）",
            {
              type: "location",
              locationData: {
                name: "兰州 · 中山铁桥 (实时共享中)",
                address: "甘肃省兰州市城关区南滨河东路 (有效期 1 小时)",
                lat: 36.0611,
                lng: 103.8343,
              },
              liveLocation: {
                isActive: true,
                expiresAt: Date.now() + 60 * 60 * 1000,
                durationMinutes: 60,
                lat: 36.0611,
                lng: 103.8343,
                locationName: "兰州 · 中山铁桥",
                address: "甘肃省兰州市城关区南滨河东路",
                userAvatar:
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
                userName: "我 (Alexia)",
              },
            } as any,
            quotedMessage || undefined,
          );
        }

        setActiveBottomDrawer("none");
        setQuotedMessage(null);
        soundEffects.playWhooshSound();
        haptics.trigger("medium");
        showToast("已开启实时位置共享（地图上已生成带头像气泡，有效期 1 小时）📍");
        break;
      }

      case "voice_call":
        setActiveBottomDrawer("none");
        soundEffects.playTapSound();
        showToast("正在发起一对一高清语音通话 📞...");
        break;

      case "video_call":
        setActiveBottomDrawer("none");
        soundEffects.playTapSound();
        showToast("正在发起面对面 4K 超清视频连线 📹...");
        break;

      case "files":
        if (docInputRef.current) {
          docInputRef.current.click();
        } else {
          setSelectedAttachment({
            type: "file",
            title: "活动行前须知手册.pdf",
            subtitle: "2.45 MB · 文档",
          });
          setActiveBottomDrawer("none");
          showToast("已选择文档: 活动行前须知手册.pdf 📄");
        }
        break;

      case "contact":
        setActiveBottomDrawer("none");
        setIsShareContactModalOpen(true);
        soundEffects.playTapSound();
        haptics.trigger("light");
        break;

      case "note":
        setActiveBottomDrawer("none");
        setIsEditingNote(true);
        break;

      case "handwriting":
        setIsHandwritingOpen(true);
        setActiveBottomDrawer("none");
        soundEffects.playTapSound();
        haptics.trigger("light");
        break;

      case "burn_mode":
        setIsBurnAfterReadingMode((prev) => !prev);
        setActiveBottomDrawer("none");
        soundEffects.playTapSound();
        showToast(isBurnAfterReadingMode ? "已关闭阅后即焚模式" : "🔥 已开启阅后即焚加密模式");
        break;

      default:
        break;
    }
  };

  // Hold-to-Talk touch gesture logic
  const handleHoldVoiceStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    voiceStartYRef.current = clientY;
    setIsHoldingVoice(true);
    setVoiceHoldCancel(false);
    setVoiceHoldSeconds(1);

    if (navigator.vibrate) navigator.vibrate(30);

    voiceHoldTimerRef.current = window.setInterval(() => {
      setVoiceHoldSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleHoldVoiceMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isHoldingVoice) return;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    // Slide up by 60px to cancel
    if (voiceStartYRef.current - clientY > 60) {
      setVoiceHoldCancel(true);
    } else {
      setVoiceHoldCancel(false);
    }
  };

  const handleHoldVoiceEnd = () => {
    if (!isHoldingVoice) return;
    if (voiceHoldTimerRef.current) {
      clearInterval(voiceHoldTimerRef.current);
      voiceHoldTimerRef.current = null;
    }

    const duration = Math.max(1, voiceHoldSeconds);
    const wasCancel = voiceHoldCancel;

    setIsHoldingVoice(false);
    setVoiceHoldCancel(false);
    setVoiceHoldSeconds(0);

    if (wasCancel) {
      showToast("已取消语音发送");
      return;
    }

    if (activeChatId) {
      onSendMessage(activeChatId, "", { duration }, quotedMessage || undefined);
      setQuotedMessage(null);
      showToast(`已发送 ${duration}" 语音消息 🎙️`);
      setTimeout(() => scrollToBottom("smooth"), 50);
    }
  };

  // Global event listeners for hold-to-talk release/cancel
  useEffect(() => {
    if (!isHoldingVoice) return;

    const handleGlobalMove = (e: TouchEvent | MouseEvent) => {
      handleHoldVoiceMove(e as any);
    };

    const handleGlobalEnd = () => {
      handleHoldVoiceEnd();
    };

    window.addEventListener("mousemove", handleGlobalMove);
    window.addEventListener("mouseup", handleGlobalEnd);
    window.addEventListener("touchmove", handleGlobalMove);
    window.addEventListener("touchend", handleGlobalEnd);
    window.addEventListener("touchcancel", handleGlobalEnd);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchmove", handleGlobalMove);
      window.removeEventListener("touchend", handleGlobalEnd);
      window.removeEventListener("touchcancel", handleGlobalEnd);
    };
  }, [isHoldingVoice, voiceHoldCancel, voiceHoldSeconds]);

  // Gesture handlers with conflict prevention: Swipe vs Single Tap (Emoji Reaction) vs Long Press (>500ms Floating Action Bar)
  const handleMessageGestureStart = (
    msg: ChatMessage,
    clientX: number,
    clientY: number,
    targetRect?: DOMRect,
  ) => {
    if (msg.type === "recalled" || msg.isRecalled) return;
    if (isMultiSelectMode) return; // 多选模式下禁用长按弹出操作栏

    isBubbleGestureActiveRef.current = true;
    setDragStartX(null);
    setDragStartY(null);
    setContainerDragOffset(0);

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    gestureStateRef.current = {
      startX: clientX,
      startY: clientY,
      startTime: Date.now(),
      msgId: msg.id,
      rect: targetRect || null,
      isLongPressed: false,
      isSwiping: false,
    };

    // 500ms long press timer for floating action bar directly above the chat bubble
    longPressTimerRef.current = window.setTimeout(() => {
      gestureStateRef.current.isLongPressed = true;
      setActiveEmojiPicker(null);
      setSwipedMessageId(null);

      const rect = gestureStateRef.current.rect;
      if (rect) {
        const menuWidth = 276;
        const estimatedMenuHeight = 220;
        const isTop = rect.top > estimatedMenuHeight + 16;
        const posX = Math.max(
          12,
          Math.min(
            window.innerWidth - menuWidth - 12,
            rect.left + rect.width / 2 - menuWidth / 2,
          ),
        );
        const posY = isTop
          ? Math.max(12, rect.top - 8)
          : Math.min(window.innerHeight - 12, rect.bottom + 8);
        setActiveActionMenu({
          msg,
          x: posX,
          y: posY,
          isTop,
        });
      } else {
        const menuWidth = 276;
        const estimatedMenuHeight = 220;
        const isTop = clientY > estimatedMenuHeight + 16;
        const posX = Math.max(
          12,
          Math.min(window.innerWidth - menuWidth - 12, clientX - menuWidth / 2),
        );
        const posY = isTop
          ? Math.max(12, clientY - 8)
          : Math.min(window.innerHeight - 12, clientY + 16);
        setActiveActionMenu({
          msg,
          x: posX,
          y: posY,
          isTop,
        });
      }

      if (navigator.vibrate) navigator.vibrate(40);
    }, 500);
  };

  const handleMessageGestureMove = (
    msg: ChatMessage,
    clientX: number,
    clientY: number,
  ) => {
    if (gestureStateRef.current.msgId !== msg.id) return;
    const deltaX = clientX - gestureStateRef.current.startX;
    const deltaY = clientY - gestureStateRef.current.startY;

    // Movement cancels long press
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    // Horizontal swipe detection (supports both left swipe and right swipe)
    if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
      gestureStateRef.current.isSwiping = true;
      isBubbleGestureActiveRef.current = true;
      setDragStartX(null);
      setDragStartY(null);
      setContainerDragOffset(0);
      const clampedOffset =
        deltaX > 0
          ? Math.min(68, deltaX * 0.7)
          : Math.max(-68, deltaX * 0.7);
      setSwipeOffset({
        msgId: msg.id,
        offset: clampedOffset,
        direction: deltaX > 0 ? "right" : "left",
      });
    }
  };

  const handleMessageGestureEnd = (
    msg: ChatMessage,
    clientX: number,
    clientY: number,
    targetRect?: DOMRect,
  ) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const finishGesture = () => {
      setSwipeOffset(null);
      setContainerDragOffset(0);
      setTimeout(() => {
        isBubbleGestureActiveRef.current = false;
      }, 120);
    };

    try {
      const { startX, startY, startTime, isLongPressed, isSwiping } =
        gestureStateRef.current;
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      const duration = Date.now() - startTime;

      // If already triggered long press, do nothing further
      if (isLongPressed) return;

      // Left and right swipe for quick actions & replies
      if (
        isSwiping ||
        (Math.abs(deltaX) > 18 && Math.abs(deltaX) > Math.abs(deltaY))
      ) {
        // 1. Right swipe (>= 40px): Telegram-style Instant Quoted Reply
        if (deltaX >= 40) {
          setQuotedMessage({
            id: msg.id,
            senderName: msg.isMe
              ? "我"
              : msg.senderName || activeConversation?.friendName || "对方",
            text:
              msg.text ||
              (msg.imageUrl
                ? "[图片]"
                : msg.fileData
                  ? "[文件]"
                  : msg.locationData
                    ? "[位置]"
                    : "[消息]"),
          });
          setSwipedMessageId(null);
          setActiveQuickReplyMsgId(null);
          setActiveEmojiPicker(null);
          setActiveActionMenu(null);
          haptics.trigger("light");
          soundEffects.playTapSound();
          showToast(
            msg.isMe
              ? "已右滑引用自己的发言"
              : `已右滑引用 @${msg.senderName || activeConversation?.friendName || "对方"} 进行回复`,
          );
          requestAnimationFrame(() => {
            document.getElementById("chat-text-input")?.focus();
          });
          return;
        }

        // 2. Left swipe (<= -40px): Slide out Quick Action Replies bar
        if (deltaX <= -40) {
          setSwipedMessageId(msg.id);
          setActiveQuickReplyMsgId(msg.id);
          setActiveEmojiPicker(null);
          setActiveActionMenu(null);
          haptics.trigger("medium");
          soundEffects.playTapSound();
          showToast("已滑出快速操作回复");
          return;
        }

        setSwipedMessageId(null);
        setActiveQuickReplyMsgId(null);
        return;
      }

      // Single Tap / Click detection: small delta (<10px) and short duration (<450ms)
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && duration < 450) {
        // 多选模式下：再次点击气泡视为勾选/取消勾选，不弹出表情
        if (isMultiSelectMode) {
          setActiveEmojiPicker(null);
          setActiveActionMenu(null);
          setSelectedMultiMsgIds((prev) => {
            const next = new Set(prev);
            if (next.has(msg.id)) next.delete(msg.id);
            else next.add(msg.id);
            return next;
          });
          return;
        }

        // If currently swiped open, tap closes it
        if (swipedMessageId === msg.id) {
          setSwipedMessageId(null);
          return;
        }
        setSwipedMessageId(null);
        setActiveActionMenu(null);

        // Check for double tap (<350ms)
        const now = Date.now();
        if (
          lastTapMessageRef.current &&
          lastTapMessageRef.current.id === msg.id &&
          now - lastTapMessageRef.current.time < 350
        ) {
          lastTapMessageRef.current = null;
          handleBubbleDoubleTap(msg.id, clientX, clientY);
          setActiveEmojiPicker(null);
          return;
        }
        lastTapMessageRef.current = { id: msg.id, time: now };

        // Toggle emoji reaction floating bar
        if (activeEmojiPicker?.msgId === msg.id) {
          setActiveEmojiPicker(null);
        } else if (targetRect) {
          const isTop = targetRect.top >= 100;
          const panelWidth = 330;
          const posX = Math.max(
            12,
            Math.min(
              window.innerWidth - panelWidth - 12,
              targetRect.left + targetRect.width / 2 - panelWidth / 2,
            ),
          );
          const posY = isTop ? targetRect.top - 54 : targetRect.bottom + 8;
          setActiveEmojiPicker({
            msgId: msg.id,
            x: posX,
            y: posY,
            isTop,
          });
        }
      }
    } finally {
      finishGesture();
    }
  };

  // Emoji Reaction selection handler with parabolic flight & burst
  const handleSelectEmoji = (msgId: string, emoji: string, sourceRect?: DOMRect) => {
    handleToggleReaction(msgId, emoji);
    if (!prefersReducedMotion && FULLSCREEN_EFFECT_MAP[emoji]) {
      triggerFullScreenEffect(FULLSCREEN_EFFECT_MAP[emoji]);
    }

    if (sourceRect && emojiFlyRef.current && !prefersReducedMotion) {
      const msgRowEl =
        document.getElementById(`chat-message-row-${msgId}`) ||
        document.getElementById(`msg-bubble-${msgId}`);
      if (msgRowEl) {
        const targetRect = msgRowEl.getBoundingClientRect();
        const toX = targetRect.left + (targetRect.width > 120 ? 45 : targetRect.width / 2);
        const toY = targetRect.bottom - 18;
        emojiFlyRef.current.spawnFly({
          emoji,
          fromX: sourceRect.left + sourceRect.width / 2,
          fromY: sourceRect.top + sourceRect.height / 2,
          toX,
          toY,
          size: 28,
        });
        setTimeout(() => {
          emojiFlyRef.current?.spawnBurstAt(toX, toY, emoji, 5);
        }, 520);
      }
    }

    setActiveEmojiPicker(null);
  };

  // 快速直接发送单表情（支持一键直发、快捷表情栏、长按 Mega 蓄力表情）
  const handleSendSingleEmoji = useCallback(
    (emojiStr: string, sourceRect?: DOMRect, isMega: boolean = false) => {
      if (!activeChatId) return;
      const now = Date.now();
      const baseOptions = { isBurnAfterReading: isBurnAfterReadingMode };

      if (
        !prefersReducedMotion &&
        !isGroupChat &&
        FULLSCREEN_EFFECT_MAP[emojiStr]
      ) {
        triggerFullScreenEffect(FULLSCREEN_EFFECT_MAP[emojiStr]);
      }

      const isRapidCombo =
        now - lastSentEmojiTimeRef.current < 580 &&
        lastSentEmojiCharRef.current === emojiStr;

      if (isRapidCombo) {
        setEmojiComboMap((prev) => ({
          ...prev,
          [emojiStr]: (prev[emojiStr] || 1) + 1,
        }));
        // Haptic burst when triggering rapid consecutive taps / high frequency!
        haptics.burst();
      } else {
        setEmojiComboMap((prev) => ({ ...prev, [emojiStr]: 1 }));
        if (!isMega) {
          haptics.trigger("medium");
        }
      }
      lastSentEmojiTimeRef.current = now;
      lastSentEmojiCharRef.current = emojiStr;

      onSendMessage(
        activeChatId,
        emojiStr,
        {
          ...baseOptions,
          type: "emoji",
          emojiData: {
            emoji: emojiStr,
            animation: "bounce",
            isMega,
          },
        },
        quotedMessage || undefined,
      );

      setQuotedMessage(null);

      soundEffects.playBubblePopSound();

      if (sourceRect && emojiFlyRef.current && !prefersReducedMotion) {
        const fromX = sourceRect.left + sourceRect.width / 2;
        const fromY = sourceRect.top + sourceRect.height / 2;

        // Instant tactile emission burst shockwave and spark micro-particles at source button
        emojiFlyRef.current.spawnEmissionBurst(fromX, fromY, emojiStr);

        const container = chatMessagesContainerRef.current;
        const toX = container
          ? container.getBoundingClientRect().right - 70
          : window.innerWidth - 70;
        const toY = window.innerHeight - 160;

        emojiFlyRef.current.spawnFly({
          emoji: emojiStr,
          fromX,
          fromY,
          toX,
          toY,
          size: isMega ? 48 : 34,
        });

        // If Mega release or combo streak, trigger landing explosion
        if (isMega || isRapidCombo) {
          setTimeout(() => {
            emojiFlyRef.current?.spawnBurstAt(toX, toY, emojiStr, isMega ? 10 : 6);
          }, 460);
        }
      }
    },
    [
      activeChatId,
      isBurnAfterReadingMode,
      isGroupChat,
      onSendMessage,
      prefersReducedMotion,
      quotedMessage,
    ],
  );

  const handleStartChargeMegaEmoji = (
    emoji: string,
    source: React.TouchEvent | React.MouseEvent | DOMRect,
  ) => {
    const rect =
      source instanceof DOMRect
        ? source
        : (source.currentTarget as HTMLElement).getBoundingClientRect();
    chargeStartTimeRef.current = Date.now();
    chargeStepRef.current = 0;
    setChargingEmoji({ emoji, scale: 1, rect });
    soundEffects.playBubblePopSound();
    haptics.tick(12);

    if (prefersReducedMotion) return;

    if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    chargeIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - chargeStartTimeRef.current;
      const progress = Math.min(elapsed / 1100, 1);
      // Smooth organic growth curve with cubic-bezier-like acceleration
      const newScale = 1 + Math.sin((progress * Math.PI) / 2) * 1.95;
      setChargingEmoji((prev) => (prev ? { ...prev, scale: newScale } : null));

      // Multi-step progressive tactile feedback: 25%, 50%, 75%, 100%
      const currentStep = Math.floor(progress * 4);
      if (currentStep > chargeStepRef.current) {
        chargeStepRef.current = currentStep;
        if (currentStep === 4) {
          haptics.burst();
          soundEffects.playBubblePopSound();
        } else {
          haptics.stepPulse(currentStep);
        }
      }
    }, 40);
  };

  const handleReleaseMegaEmoji = (emoji: string) => {
    if (chargeIntervalRef.current) {
      clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = null;
    }
    const elapsed = Date.now() - chargeStartTimeRef.current;
    const isMega = elapsed >= 380;
    const rect = chargingEmoji?.rect;
    setChargingEmoji(null);

    if (isMega) {
      haptics.springRelease();
    } else {
      haptics.trigger("medium");
    }

    handleSendSingleEmoji(emoji, rect, isMega);
  };

  const handleCancelMegaEmoji = () => {
    if (chargeIntervalRef.current) {
      clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = null;
    }
    if (chargingEmoji) {
      haptics.tick(6);
    }
    setChargingEmoji(null);
  };

  // Smart Emoji Suggestions based on input text
  const smartSuggestedEmojis = React.useMemo(() => {
    if (!inputText || inputText.length > 40) return [];
    const lower = inputText.toLowerCase();
    const suggestions: string[] = [];
    for (const [kw, emojis] of Object.entries(SMART_EMOJI_KEYWORD_MAP)) {
      if (lower.includes(kw)) {
        for (const em of emojis) {
          if (!suggestions.includes(em)) {
            suggestions.push(em);
          }
        }
      }
    }
    return suggestions.slice(0, 6);
  }, [inputText]);

  // Burn after reading view handler
  const handleViewBurnMessage = (msgId: string) => {
    setViewingBurnMessageId(msgId);
    setTimeout(() => {
      setBurnedMessageIds((prev) => {
        const next = new Set(prev);
        next.add(msgId);
        return next;
      });
      setViewingBurnMessageId((current) =>
        current === msgId ? null : current,
      );
    }, 5000);
  };

  // Delete message handler (for swipe delete and long-press menu delete)
  const handleDeleteMessage = (msgId: string) => {
    const el = document.getElementById(`msg-bubble-${msgId}`);
    if (el) {
      const rect = el.getBoundingClientRect();
      triggerMessageDispersionEffect(rect);
    }
    if (onDeleteMessage && activeChatId) {
      onDeleteMessage(activeConversation?.id || activeChatId, msgId);
    } else setDeletedMsgIds((prev) => [...prev, msgId]);
    setSwipedMessageId(null);
    setActiveActionMenu(null);
    showToast("已删除消息 🗑️");
  };

  // Floating Action Menu Handlers
  const handleActionDelete = (msg: ChatMessage) => {
    handleDeleteMessage(msg.id);
  };

  const handleActionCopy = (msg: ChatMessage) => {
    if (msg.text) {
      navigator.clipboard?.writeText(msg.text);
      showToast("消息文本已复制 📋");
    } else {
      showToast("此消息无可复制的文本内容");
    }
    setActiveActionMenu(null);
  };

  const handleActionForward = (msg: ChatMessage) => {
    setActiveActionMenu(null);
    setForwardModalState({
      isOpen: true,
      sourceMessages: [msg],
      forwardMode: "itemized",
      selectedTargetChatIds: [],
      searchQuery: "",
    });
  };

  const handleActionPin = (msg: ChatMessage) => {
    const isPinned = pinnedMsgIds.includes(msg.id);
    setPinnedMsgIds((prev) =>
      isPinned ? prev.filter((id) => id !== msg.id) : [msg.id, ...prev],
    );
    setActiveActionMenu(null);
    showToast(isPinned ? "已取消置顶消息" : "已置顶消息 📌");
  };

  // Confirmation Handler for Forwarding (Looping through targets and messages)
  const handleConfirmForward = () => {
    if (
      forwardModalState.selectedTargetChatIds.length === 0 ||
      forwardModalState.sourceMessages.length === 0
    ) {
      showToast("请先勾选需要转发的目标联系人 ⚠️");
      return;
    }

    const targets = conversations.filter((c) =>
      forwardModalState.selectedTargetChatIds.includes(c.id)
    );
    const targetNames = targets.map((c) => c.friendName).join("、");

    forwardModalState.selectedTargetChatIds.forEach((targetChatId) => {
      if (forwardModalState.forwardMode === "itemized") {
        // 逐条转发: 循环发送每一条消息
        forwardModalState.sourceMessages.forEach((m) => {
          if (m.type === "emoji") {
            onSendMessage(targetChatId, m.text || m.emojiData?.emoji || "", { type: "emoji", emojiData: m.emojiData });
          } else if (m.type === "audio") {
            onSendMessage(targetChatId, m.text || "", { type: "audio", url: m.audioUrl, duration: m.audioDuration });
          } else if (m.type === "image" || m.imageUrl) {
            onSendMessage(targetChatId, m.text || "", {
              type: "image",
              imageUrl: m.imageUrl || m.text,
            });
          } else if (m.type === "contact" || m.contactData) {
            onSendMessage(targetChatId, m.text || `[名片] ${m.contactData?.name || ''}`, {
              type: "contact",
              contactData: m.contactData,
            });
          } else if (m.type === "file" || m.fileData) {
            onSendMessage(targetChatId, m.text || "", {
              type: "file",
              fileData: m.fileData,
            });
          } else if (m.type === "location" || m.locationData) {
            onSendMessage(targetChatId, m.text || "", {
              type: "location",
              locationData: m.locationData,
            });
          } else if (m.type === "activity" || m.activityData || m.activityId) {
            onSendMessage(targetChatId, m.text || `[活动] ${m.activityData?.title || ''}`, {
              type: "activity",
              activityId: m.activityId || m.activityData?.id,
              activityData: m.activityData,
            });
          } else {
            onSendMessage(targetChatId, m.text || "[转发消息]", {
              type: "text",
              textStyle: m.textStyle,
            });
          }
        });
      } else {
        // 统一转发: 合并成 1 条【聊天记录】消息
        const mergedHeader = `[合并转发聊天记录] (共 ${forwardModalState.sourceMessages.length} 条消息)\n`;
        const mergedContent = forwardModalState.sourceMessages
          .map(
            (m) =>
              `${m.senderName || (m.isMe ? "我" : "成员")}: ${
                m.type === "contact" || m.contactData
                  ? `[名片] ${m.contactData?.name || m.text || "联系人"}`
                  : m.text || (m.imageUrl ? "[图片]" : "[多媒体内容]")
              }`
          )
          .join("\n");
        const fullMergedText = `${mergedHeader}${mergedContent}`;

        onSendMessage(targetChatId, fullMergedText, { type: "text" });
      }
    });

    const modeLabel =
      forwardModalState.forwardMode === "itemized" ? "逐条转发" : "统一转发";
    showToast(
      `🎉 已成功【${modeLabel}】至 ${targetNames || `${targets.length}个联系人`}！`
    );

    setForwardModalState({
      isOpen: false,
      sourceMessages: [],
      forwardMode: "itemized",
      selectedTargetChatIds: [],
      searchQuery: "",
    });
    setIsMultiSelectMode(false);
    setSelectedMultiMsgIds(new Set());
  };

  // Avatar Long-Press to @ Mention & Click to Open Friend Profile
  const avatarTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAvatarLongPressedRef = useRef<boolean>(false);
  const avatarStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleAvatarPointerDown = (
    friendId: string,
    displayName: string,
    e: React.PointerEvent,
  ) => {
    isAvatarLongPressedRef.current = false;
    avatarStartPosRef.current = { x: e.clientX, y: e.clientY };

    if (avatarTimerRef.current) {
      clearTimeout(avatarTimerRef.current);
    }

    avatarTimerRef.current = setTimeout(() => {
      isAvatarLongPressedRef.current = true;
      setInputText((prev) =>
        prev ? `${prev} @${displayName} ` : `@${displayName} `,
      );
      showToast(`已快捷 @${displayName}`);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch (err) {}
      }
    }, 450);
  };

  const handleAvatarPointerUp = (friendId: string, e: React.PointerEvent) => {
    if (avatarTimerRef.current) {
      clearTimeout(avatarTimerRef.current);
      avatarTimerRef.current = null;
    }

    // Check if pointer dragged or moved significantly
    if (avatarStartPosRef.current) {
      const dist = Math.hypot(
        e.clientX - avatarStartPosRef.current.x,
        e.clientY - avatarStartPosRef.current.y,
      );
      if (dist > 12) return;
    }

    // If not long-pressed, perform normal click -> open friend profile modal
    if (!isAvatarLongPressedRef.current) {
      const targetId = friendId || activeConversation?.friendId;
      if (onOpenFriendProfile && targetId) {
        onOpenFriendProfile(targetId);
      }
    }
  };

  const handleAvatarPointerCancel = () => {
    if (avatarTimerRef.current) {
      clearTimeout(avatarTimerRef.current);
      avatarTimerRef.current = null;
    }
  };

  // Team Chats for the horizontal bar
  const baseTeamChats = conversations.filter(
    (c) => c.isTeam || c.friendName.includes("小组"),
  );

  // Dedicated 3 teams for the top groups card display
  const teamChats = [
    {
      id: "team-1",
      friendId: "group-dev",
      friendName: "小组 · 极客开发营 (18人)",
      avatar:
        baseTeamChats[0]?.avatar ||
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=300",
      lastMessage: baseTeamChats[0]?.lastMessage || "Alex：前端定位组件重构已合并到主分支",
      time: "13:40",
      unreadCount: 2,
      isGroup: true,
      isTeam: true,
      groupAvatars: baseTeamChats[0]?.groupAvatars || [
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
      ],
    },
    {
      id: "team-2",
      friendId: "group-design",
      friendName: "设计 · 核心评审组",
      avatar:
        "https://images.unsplash.com/photo-1542744094-24638ea0b343?auto=format&fit=crop&q=80&w=300",
      lastMessage: "Sarah：视觉规范 V4.0 已上传至小组网盘",
      time: "11:20",
      unreadCount: 0,
      isGroup: true,
      isTeam: true,
      groupAvatars: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      ],
    },
    {
      id: "team-3",
      friendId: "group-growth",
      friendName: "市场 · 增长黑客组",
      avatar:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=300",
      lastMessage: "Lucas：漏斗转化数据已同步到看板",
      time: "09:45",
      unreadCount: 5,
      isGroup: true,
      isTeam: true,
      groupAvatars: [
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      ],
    },
  ].filter(Boolean);

  // Top 5 Frequent Friends for the horizontal note/story bar
  const frequentFriends = conversations
    .filter(
      (c) =>
        !c.id.startsWith("cg") && !c.isTeam && !c.friendName.includes("小组"),
    )
    .slice(0, 5);

  // Filter conversations for the vertical list
  const filteredConversations = conversations
    .filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.friendName.toLowerCase().includes(q);
        const matchMsg = c.lastMessage.toLowerCase().includes(q);
        if (!matchName && !matchMsg) return false;
      }
      if (filterTab === "unread") return c.unreadCount > 0;
      if (filterTab === "groups") return c.id.startsWith("cg") || c.isGroup || c.isTeam || c.friendName.includes("小组");
      return true;
    })
    .sort((a, b) => {
      const aPinned = pinnedChatIds.includes(a.id) || !!a.isPinned;
      const bPinned = pinnedChatIds.includes(b.id) || !!b.isPinned;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      if (aPinned && bPinned) {
        const aIdx = pinnedChatIds.indexOf(a.id);
        const bIdx = pinnedChatIds.indexOf(b.id);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
      }
      return 0;
    });

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // =========================================================================
  // Helper: Render Aggregated Group Avatar vs Square Team Avatar vs Single Avatar
  // 1. 小组/团队头像为方形 (Square Rounded Avatar - 区别其他单人圆形头像)
  // 2. 群聊头像为方形框架与多位用户头像聚合
  // 3. 好友头像为圆形单人
  // =========================================================================
  const renderAggregatedAvatar = (
    conv: ChatConversation,
    sizeClass = "w-11 h-11",
  ) => {
    const isTeam = conv.isTeam || conv.friendName.includes("小组");
    const isGroup = conv.isGroup || conv.id.startsWith("cg");

    // 1. 小组/团队头像为方形，区别其他单人头像
    if (isTeam) {
      return (
        <div
          className={`${sizeClass} rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 overflow-hidden shadow-2xs ring-1 ring-gray-200/80 shrink-0 relative`}
        >
          <img
            src={conv.avatar}
            alt={conv.friendName}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      );
    }

    // 2. 群聊头像显示多位用户头像有机聚合 (方形背景框架)
    if (isGroup) {
      const defaultAvatars = [
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      ];
      const rawAvatars = conv.groupAvatars && conv.groupAvatars.length > 0 ? conv.groupAvatars : defaultAvatars;
      const avatars = Array.from({ length: 6 }, (_, i) => rawAvatars[i % rawAvatars.length]);

      const organicPositions = [
        { top: '12%', left: '8%', width: '50%', height: '50%', zIndex: 'z-20' },  // 0: Main Large (Center-Left)
        { top: '6%', left: '54%', width: '36%', height: '36%', zIndex: 'z-15' },   // 1: Top-Right Medium
        { top: '38%', left: '48%', width: '44%', height: '44%', zIndex: 'z-18' },  // 2: Middle-Right Medium-Large
        { top: '52%', left: '10%', width: '36%', height: '36%', zIndex: 'z-16' },  // 3: Bottom-Left Medium
        { top: '65%', left: '40%', width: '28%', height: '28%', zIndex: 'z-14' },  // 4: Bottom-Center Small
        { top: '3%', left: '38%', width: '22%', height: '22%', zIndex: 'z-10' },   // 5: Top-Center Tiny
      ];

      return (
        <div
          className={`${sizeClass} rounded-xl bg-[#F0F2F5] overflow-hidden ring-1 ring-gray-200/90 shadow-2xs shrink-0 relative`}
        >
          {avatars.map((av, idx) => {
            const pos = organicPositions[idx % organicPositions.length];
            return (
              <img
                key={`grp-av-${idx}-${av}`}
                src={av}
                alt="Group Member"
                style={{
                  top: pos.top,
                  left: pos.left,
                  width: pos.width,
                  height: pos.height,
                }}
                className={`absolute ${pos.zIndex} rounded-full object-cover border-[1.5px] border-white shadow-2xs`}
              />
            );
          })}
        </div>
      );
    }

    // 3. 好友单人圆形头像
    return (
      <img
        src={conv.avatar}
        alt={conv.friendName}
        className={`${sizeClass} rounded-full object-cover ring-1 ring-gray-200 shrink-0`}
      />
    );
  };

  // Virtual keyboard key press helper
  const handleVirtualKeyPress = (char: string) => {
    setTempText(
      (prev) =>
        prev + (isKeyboardShift ? char.toUpperCase() : char.toLowerCase()),
    );
  };

  const handleVirtualBackspace = () => {
    setTempText((prev) => (prev.length > 0 ? prev.slice(0, -1) : ""));
  };

  const handleVirtualSpace = () => {
    setTempText((prev) => prev + " ");
  };

  const handlePublishNote = () => {
    const newNote = tempText.trim() || "音乐不停，分享不止...";
    const newEmoji = tempEmoji;
    const newTheme = tempTheme;
    if (onUpdateUserNote) {
      onUpdateUserNote(newNote, newEmoji, newTheme);
    } else {
      setLocalUserNote(newNote);
      setLocalAttachedEmoji(newEmoji);
      setLocalNoteTheme(newTheme);
    }
    setNoteMusic(tempMusic);
    setNoteLocationTag(tempLocationTag);
    setNoteGif(tempGif);
    setNoteAudience(tempAudience);
    setHasNoteBubble(true);
    setIsEditingNote(false);
    showToast("便签已发布到顶部与收件箱 🎉");
  };

  // =========================================================================
  // Active Chat Detail Screen (Facebook-style White UI with Group Content & Width)
  // =========================================================================
  if (activeConversation) {
    const groupDetails = activeConversation.groupDetails;

    return (
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { edgeBackRef.current = false; setDragStartX(null); setDragStartY(null); setContainerDragOffset(0); }}
        data-chat-screen
        data-doodling={isHandwritingOpen}
        style={{
          transform: `translateX(${containerDragOffset}px)`,
          transition:
            containerDragOffset === 0
              ? "transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.25)"
              : "none",
        }}
        className="absolute inset-0 z-40 bg-[#F0F2F5] dark:bg-black text-[#050505] dark:text-white flex flex-col select-none overflow-hidden font-sans touch-pan-y"
      >


        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#050505]/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
            {toastMessage}
          </div>
        )}

        {/* Top Navigation Bar (Normal vs Multi-Select Mode) */}
        {isMultiSelectMode ? (
          <div
            id="chat-multiselect-header-bar"
            onPointerDown={(e) => e.stopPropagation()}
            className="h-12 bg-white dark:bg-black border-b border-[#E4E6EB] dark:border-zinc-800 text-[#050505] dark:text-white px-3.5 flex items-center justify-between shrink-0 shadow-2xs z-20 animate-in fade-in duration-150 select-none"
          >
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsMultiSelectMode(false);
                  setSelectedMultiMsgIds(new Set());
                  showToast("已退出多选模式");
                }}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-[#007AFF] text-xs font-extrabold flex items-center space-x-1 transition-all cursor-pointer"
                title="退出多选"
              >
                <X size={15} />
                <span>取消</span>
              </button>
              <span className="text-xs font-black text-gray-900">
                已选择 <span className="text-[#007AFF] font-extrabold text-sm">{selectedMultiMsgIds.size}</span> 项消息
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  const visibleMsgs = activeConversation.messages.filter(
                    (msg) => !deletedMsgIds.includes(msg.id)
                  );
                  if (selectedMultiMsgIds.size === visibleMsgs.length) {
                    setSelectedMultiMsgIds(new Set());
                  } else {
                    setSelectedMultiMsgIds(new Set(visibleMsgs.map((m) => m.id)));
                  }
                }}
                className="px-3 py-1.5 rounded-full bg-blue-50 text-[#007AFF] hover:bg-blue-100 active:scale-95 text-xs font-bold transition-all cursor-pointer"
              >
                {selectedMultiMsgIds.size ===
                activeConversation.messages.filter((msg) => !deletedMsgIds.includes(msg.id)).length
                  ? "取消全选"
                  : "全选"}
              </button>
            </div>
          </div>
        ) : (
          /* Facebook Style White Top Navigation Bar */
          <div
            id="chat-header-bar"
            data-free-canvas={true}
            onPointerDown={(e) => e.stopPropagation()}
            className="h-12 bg-white dark:bg-black border-b border-[#E4E6EB] dark:border-zinc-800 text-[#050505] dark:text-white px-3 flex items-center justify-between shrink-0 shadow-2xs z-10"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <button
                id="back-to-chat-list-btn"
                onClick={() => onSelectChat(null)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-white hover:bg-[#F0F2F5] dark:bg-zinc-900 dark:hover:bg-zinc-800 active:scale-95 text-[#050505] dark:text-white text-xs font-bold transition-all cursor-pointer shrink-0 border border-[#E4E6EB] dark:border-zinc-800 hover:border-[#1877F2] shadow-2xs"
                title="返回聊天列表" aria-label="返回聊天列表"
              >
                <ArrowLeft size={15} strokeWidth={2.5} className="text-[#1877F2]" />

                {Boolean(activeConversation.unreadCount && activeConversation.unreadCount > 0) && (
                  <span className="ml-1 px-1.5 py-0.2 bg-[#1877F2] text-white text-[10px] rounded-md font-extrabold">
                    {activeConversation.unreadCount}
                  </span>
                )}
              </button>

              {/* Avatar: Square avatar for groups / Round avatar for private */}
              <div
                className="relative cursor-pointer group shrink-0"
                onClick={() => {
                  if (isGroupChat) {
                    setShowGroupDetails(true);
                  } else if (onOpenFriendProfile) {
                    onOpenFriendProfile(activeConversation.friendId);
                  }
                }}
                title={isGroupChat ? "点击查看小组详情" : "点击查看好友个人主页"}
              >
                {isGroupChat ? (
                  /* Round Aggregated Avatar for Group / Team */
                  renderAggregatedAvatar(activeConversation, "w-10 h-10")
                ) : (
                  /* Round Avatar for Private Chat */
                  <div className="relative">
                    <img
                      src={activeConversation.avatar}
                      alt={activeConversation.friendName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E4E6EB] group-hover:ring-[#1877F2] transition-all"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                  </div>
                )}
              </div>

              {/* Title & Status */}
              <div
                className="cursor-pointer min-w-0 flex-1"
                onClick={() => {
                  if (isGroupChat) {
                    setShowGroupDetails(true);
                  } else if (onOpenFriendProfile) {
                    onOpenFriendProfile(activeConversation.friendId);
                  }
                }}
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <h3 className="font-extrabold text-sm text-[#050505] dark:text-white truncate tracking-wide">
                    {activeConversation.friendName}
                  </h3>
                  {isTeamChat ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200/80 px-1.5 py-0.2 rounded-md font-extrabold shrink-0">
                      小组
                    </span>
                  ) : isGroupChat ? (
                    <span className="text-[10px] bg-blue-50 text-[#1877F2] border border-blue-200/80 px-1.5 py-0.2 rounded-md font-extrabold shrink-0">
                      群聊
                    </span>
                  ) : null}
                </div>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 truncate mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                  <span>
                    {isTeamChat
                      ? `${groupDetails?.memberCount || 18} 位成员 · 小组协作在线`
                      : isGroupChat
                      ? `${groupDetails?.memberCount || 18} 位成员 · 群聊沟通在线`
                      : "好友聊天"}
                  </span>
                </p>
              </div>
            </div>

            {/* Floating conversation actions */}
            <div className="flex items-center space-x-1.5 text-[#1877F2] shrink-0">
              {/* Call button */}
              <button
                onClick={() => showToast("正在拨通语音通话... 📞")}
                className="w-8 h-8 rounded-md bg-white border border-[#E4E6EB] hover:border-[#1877F2] hover:bg-[#F0F2F5] active:scale-95 flex items-center justify-center cursor-pointer transition-all shadow-2xs"
                title="语音通话"
              >
                <Phone size={16} />
              </button>
              {/* Video button */}
              <button
                onClick={() => showToast("正在呼起高清视频连线... 📹")}
                className="w-8 h-8 rounded-md bg-white border border-[#E4E6EB] hover:border-[#1877F2] hover:bg-[#F0F2F5] active:scale-95 flex items-center justify-center cursor-pointer transition-all shadow-2xs"
                title="视频通话"
              >
                <Video size={16} />
              </button>

              {/* Chat Management Center Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenManagementCenter) {
                    onOpenManagementCenter();
                  } else {
                    setShowManagementCenter(true);
                  }
                }}
                className="w-8 h-8 rounded-md bg-white border border-[#E4E6EB] hover:border-[#1877F2] hover:bg-blue-50 active:scale-95 flex items-center justify-center text-[#1877F2] cursor-pointer transition-all shadow-2xs"
                title="打开聊天管理中心（时间轴与资产包）"
              >
                <Clock size={16} />
              </button>

              {/* Info / Group Details or Add to Group Modal Toggle Button */}
              <button
                id="open-group-or-profile-details-btn"
                onClick={() => {
                  if (isGroupChat) {
                    setShowGroupDetails(true);
                  } else if (onCreateGroupConversation && activeConversation) {
                    setNewGroupName(`与 ${activeConversation.friendName} 的群聊`);
                    setNewGroupAnnouncement(
                      "欢迎大家加入群聊！请文明交流，共同营造良好的沟通环境。",
                    );
                    setSelectedFriendIds([activeConversation.friendId]);
                    setIsCreateGroupModalOpen(true);
                  }
                }}
                className="w-8 h-8 rounded-md bg-white border border-[#E4E6EB] hover:border-[#1877F2] hover:bg-[#F0F2F5] active:scale-95 flex items-center justify-center text-[#1877F2] cursor-pointer transition-all shadow-2xs"
                title={isGroupChat ? "查看小组详情" : "添加好友进群聊"}
              >
                {isGroupChat ? <Info size={20} /> : <Plus size={20} />}
              </button>
            </div>
          </div>
        )}

        {/* Create Group Chat Modal (Facebook UI Style) */}
        {isCreateGroupModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#CED0D5]/50 flex flex-col">
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#E4E6EB] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#050505]">
                  添加好友进群聊
                </h2>
                <button
                  type="button"
                  onClick={() => setIsCreateGroupModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] flex items-center justify-center text-[#65676B] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
                {/* Group Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#65676B] uppercase tracking-wider">
                    群聊名称 (Group Name)
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="输入群名称..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#CED0D5] focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 outline-none text-sm font-medium text-[#050505] bg-[#F0F2F5]/50"
                  />
                </div>

                {/* Group Announcement */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#65676B] uppercase tracking-wider">
                    群公告 (Announcement)
                  </label>
                  <textarea
                    value={newGroupAnnouncement}
                    onChange={(e) => setNewGroupAnnouncement(e.target.value)}
                    placeholder="输入群公告或规章制度..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#CED0D5] focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 outline-none text-sm font-medium text-[#050505] bg-[#F0F2F5]/50 resize-none h-20"
                  />
                </div>

                {/* Friend Selection List */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#65676B] uppercase tracking-wider">
                    选择群成员 ({selectedFriendIds.length + 1} 人已选)
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 border border-[#E4E6EB] rounded-lg p-2 bg-[#F0F2F5]/30">
                    {conversations
                      .filter((c) => !c.id.startsWith("cg"))
                      .map((c, cIdx) => {
                        const isSelected = selectedFriendIds.includes(
                          c.friendId,
                        );
                        return (
                          <div
                            key={`cg-pick-c-${c.id}-${cIdx}`}
                            onClick={() => {
                              if (isSelected) {
                                if (
                                  activeConversation &&
                                  c.friendId === activeConversation.friendId
                                ) {
                                  showToast("当前聊天好友默认必须在群内");
                                  return;
                                }
                                setSelectedFriendIds(
                                  selectedFriendIds.filter(
                                    (id) => id !== c.friendId,
                                  ),
                                );
                              } else {
                                setSelectedFriendIds([
                                  ...selectedFriendIds,
                                  c.friendId,
                                ]);
                              }
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-blue-50 border border-blue-200"
                                : "hover:bg-[#E4E6EB]/50 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <img
                                src={c.avatar}
                                alt={c.friendName}
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                              />
                              <span className="text-xs font-bold text-[#050505] truncate">
                                {c.friendName}
                              </span>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                isSelected
                                  ? "bg-[#1877F2] border-[#1877F2] text-white"
                                  : "border-[#CED0D5] bg-white"
                              }`}
                            >
                              {isSelected && (
                                <Check size={12} strokeWidth={3} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3.5 bg-[#F0F2F5] border-t border-[#E4E6EB] flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-[#65676B] hover:bg-[#E4E6EB] transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const groupName =
                      newGroupName.trim() ||
                      `与 ${activeConversation.friendName} 的群聊`;
                    const announcement =
                      newGroupAnnouncement.trim() || "欢迎加入群聊！";
                    if (onCreateGroupConversation) {
                      onCreateGroupConversation(
                        groupName,
                        announcement,
                        selectedFriendIds,
                      );
                    }
                    setIsCreateGroupModalOpen(false);
                    showToast(`已成功创建群聊 "${groupName}" 🎉`);
                  }}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-sm transition-colors cursor-pointer"
                >
                  确认创建群聊
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Every conversation uses the same persistent free canvas. */}
        {(
          <FreeFormChatCanvas
            key={activeConversation.id}
            conversation={activeConversation}
            messages={visibleMessages}
            friends={friends}
            onNavigateToLocation={(loc) => {
              if (onNavigateToMapLocation) {
                onNavigateToMapLocation(loc);
                showToast(`正在地图上锁定：${loc.name} 📍`);
              }
            }}
            onOpenActivity={(act) => setSelectedChatActivity(act)}
            onOpenContactBrief={(contact) => {
              setSelectedBriefContact(contact);
              setIsBriefContactModalOpen(true);
            }}
            onOpenLifePlace={(place) => setSelectedChatLifePlace(place)}
            onAddFriend={(contact) => {
              showToast(`已向 ${contact.name} 发送好友申请 📩`);
            }}
            onSendMessage={(text) => {
              if (activeChatId) {
                onSendMessage(activeChatId, text);
                soundEffects.playWhooshSound();
                haptics.trigger('light');
              }
            }}
            onDeleteMessage={handleDeleteMessage}
            onRecallMessage={handleRecallMessage}
            onEditMessage={handleStartEditMessage}
            onShareMessage={handleActionForward}
            onDuplicateMessage={(msg) => onSendMessage(activeConversation.id, msg.text || "", { doodleLayout:msg.doodleLayout, isHandwriting:msg.isHandwriting, handwritingStrokes:msg.handwritingStrokes, type: msg.type === "recalled" || msg.type === "life_place" ? "text" : msg.type, imageUrl: msg.imageUrl, url: msg.audioUrl, duration: msg.audioDuration, textStyle: msg.textStyle || {id:msg.isMe || msg.senderId === 'me' ? 'lime' : 'cloud',alignment:'center'}, emojiData: msg.emojiData, fileData: msg.fileData, locationData: msg.locationData, contactData: msg.contactData, activityId: msg.activityId, activityData: msg.activityData }, msg.quotedMessage)}
            onQuotedReply={(msg) => {
              setQuotedMessage({
                id: msg.id,
                senderName: msg.isMe ? '我' : msg.senderName || activeConversation.friendName || '对方',
                text: msg.text || (msg.imageUrl ? '[图片]' : '[消息]'),
              });
              if (chatTextareaRef.current) {
                chatTextareaRef.current.focus();
              }
            }}
            onAddReaction={(msgId, emoji) => handleToggleReaction(msgId, emoji)}
            onShowToast={showToast}
            onOpenFriendProfile={onOpenFriendProfile}
          />
        )}

        {/* 3. Single-Tap Floating Emoji Reaction Dock (Facebook Straight-Edge Frame + Dock Lens Physics) */}
        {activeEmojiPicker && (
          <FloatingReactionDock
            msgId={activeEmojiPicker.msgId}
            x={activeEmojiPicker.x}
            y={activeEmojiPicker.y}
            isTop={activeEmojiPicker.isTop}
            onSelectEmoji={(msgId, emoji, sourceRect) =>
              handleSelectEmoji(msgId, emoji, sourceRect)
            }
            onOpenFullPicker={() => {
              setActiveEmojiPicker(null);
              setActiveBottomDrawer("emoji");
            }}
            onClose={() => setActiveEmojiPicker(null)}
          />
        )}

        {/* 4. Long Press Floating Action Menu (Directly above the chat bubble, NOT a popup modal) */}
        {activeActionMenu && (
          <div
            id="floating-message-action-menu"
            style={{
              left: `${activeActionMenu.x}px`,
              top: `${activeActionMenu.y}px`,
              transform: activeActionMenu.isTop
                ? "translateY(-100%)"
                : undefined,
            }}
            className="fixed z-50 min-w-[276px] max-w-[calc(100vw-24px)] max-h-[calc(100vh-24px)] overflow-y-auto bg-[#1C1C1E]/95 text-white backdrop-blur-md border border-gray-700/80 rounded-2xl py-1.5 px-1.5 shadow-2xl flex flex-col gap-1 animate-in fade-in zoom-in-90 duration-150 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                快速回应
              </span>
              <button
                type="button"
                onClick={() => setActiveActionMenu(null)}
                className="h-6 w-6 rounded-full text-gray-400 hover:bg-white/10 hover:text-white"
                aria-label="关闭消息操作"
              >
                <X size={13} className="mx-auto" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 px-1">
              {["👍", "❤️", "😂", "🎉", "🔥", "👏", "😮"].map((emoji, emojiIdx) => (
                <button
                  key={`quick-reaction-${emoji}-${emojiIdx}`}
                  type="button"
                  onClick={(e) =>
                    handleSelectEmoji(
                      activeActionMenu.msg.id,
                      emoji,
                      e.currentTarget.getBoundingClientRect(),
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-all hover:scale-110 hover:bg-white/15 active:scale-90"
                  title={`回应 ${emoji}`}
                  aria-label={`回应 ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="h-px bg-white/10" />

            <div className="flex flex-wrap items-center gap-0.5">
              <button
                type="button"
                id="floating-action-copy-btn"
                onClick={() => handleActionCopy(activeActionMenu.msg)}
                className="px-2.5 py-1.5 rounded-xl hover:bg-white/15 active:scale-95 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                title="复制消息内容"
              >
                <Copy size={13} className="text-gray-300" />
                <span>复制</span>
              </button>

              <button
                type="button"
                id="floating-action-quote-btn"
                onClick={() => {
                  const senderName =
                    activeActionMenu.msg.senderName ||
                    activeConversation?.friendName ||
                    "对方";
                  setQuotedMessage({
                    id: activeActionMenu.msg.id,
                    senderName,
                    text: activeActionMenu.msg.text || "[语音/图片消息]",
                  });
                  setActiveActionMenu(null);
                  showToast(`已回复 ${senderName} 的发言`);
                }}
                className="px-2.5 py-1.5 rounded-xl hover:bg-white/15 active:scale-95 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                title="回复消息"
              >
                <CornerDownLeft size={13} className="text-gray-300" />
                <span>回复</span>
              </button>

              <button
                type="button"
                id="floating-action-forward-btn"
                onClick={() => handleActionForward(activeActionMenu.msg)}
                className="px-2.5 py-1.5 rounded-xl hover:bg-white/15 active:scale-95 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                title="转发消息"
              >
                <Forward size={13} className="text-gray-300" />
                <span>转发</span>
              </button>

              <button
                type="button"
                id="floating-action-pin-btn"
                onClick={() => handleActionPin(activeActionMenu.msg)}
                className={`px-2.5 py-1.5 rounded-xl active:scale-95 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                  pinnedMsgIds.includes(activeActionMenu.msg.id)
                    ? "bg-[#1877F2]/25 text-blue-300"
                    : "hover:bg-white/15"
                }`}
                title="置顶消息"
              >
                <Pin size={13} className="text-blue-300" />
                <span>
                  {pinnedMsgIds.includes(activeActionMenu.msg.id)
                    ? "取消置顶"
                    : "置顶"}
                </span>
              </button>

              {activeActionMenu.msg.isMe &&
                activeActionMenu.msg.text &&
                !activeActionMenu.msg.imageUrl && (
                  <button
                    type="button"
                    id="floating-action-edit-btn"
                    onClick={() => handleActionEdit(activeActionMenu.msg)}
                    className="px-2.5 py-1.5 rounded-xl hover:bg-blue-500/20 active:scale-95 text-xs font-semibold text-blue-300 flex items-center space-x-1 transition-all cursor-pointer"
                    title="编辑消息"
                  >
                    <Edit3 size={13} className="text-blue-300" />
                    <span>编辑</span>
                  </button>
                )}

              {activeActionMenu.msg.isMe && !activeActionMenu.msg.isRecalled && activeActionMenu.msg.type !== 'recalled' && (
                <button
                  type="button"
                  id="floating-action-recall-btn"
                  onClick={() => handleRecallMessage(activeActionMenu.msg.id)}
                  className="px-2.5 py-1.5 rounded-xl hover:bg-amber-500/20 active:scale-95 text-xs font-semibold text-amber-300 flex items-center space-x-1 transition-all cursor-pointer"
                  title="撤回消息"
                >
                  <RotateCcw size={13} className="text-amber-300" />
                  <span>撤回消息</span>
                </button>
              )}

              {!activeActionMenu.msg.isMe && (
                <button
                  type="button"
                  id="floating-action-mention-btn"
                  onClick={() => {
                    const senderName =
                      activeActionMenu.msg.senderName ||
                      activeConversation?.friendName ||
                      "对方";
                    setInputText((prev) => `@${senderName} ` + prev);
                    setActiveActionMenu(null);
                    showToast(`已在聊天框中 @${senderName}`);
                  }}
                  className="px-2.5 py-1.5 rounded-xl hover:bg-amber-500/20 active:scale-95 text-xs font-semibold text-amber-300 flex items-center space-x-1 transition-all cursor-pointer"
                  title="@提醒对方"
                >
                  <AtSign size={13} />
                  <span>@{activeActionMenu.msg.senderName || "TA"}</span>
                </button>
              )}

              <button
                type="button"
                id="floating-action-multiselect-btn"
                onClick={() => {
                  const msgId = activeActionMenu.msg.id;
                  setActiveActionMenu(null);
                  setIsMultiSelectMode(true);
                  setSelectedMultiMsgIds(new Set([msgId]));
                  showToast("已进入多选模式，按需勾选多条消息");
                }}
                className="px-2.5 py-1.5 rounded-xl hover:bg-white/15 active:scale-95 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                title="多选消息"
              >
                <CheckCheck size={13} className="text-gray-300" />
                <span>多选</span>
              </button>

              <button
                type="button"
                id="floating-action-delete-btn"
                onClick={() => handleActionDelete(activeActionMenu.msg)}
                className="px-2.5 py-1.5 rounded-xl hover:bg-red-500/20 active:scale-95 text-xs font-semibold text-rose-400 flex items-center space-x-1 transition-all cursor-pointer"
                title="删除消息"
              >
                <Trash2 size={13} className="text-rose-400" />
                <span>删除</span>
              </button>
            </div>

            {/* Arrow Indicator Pointer towards bubble */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent ${
                activeActionMenu.isTop
                  ? "border-t-[5px] border-t-[#1C1C1E]/95 -bottom-[5px]"
                  : "border-b-[5px] border-b-[#1C1C1E]/95 -top-[5px]"
              }`}
            />
          </div>
        )}

        {/* Scroll anchor for automatic scrolling to bottom */}
        <div ref={messagesEndRef} className="h-0.5 w-full shrink-0" />

        <motion.button
          type="button"
          id="scroll-chat-to-bottom-btn"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          onClick={() => {
            scrollToBottom("smooth");
            setShowScrollToBottom(false);
          }}
          style={{
            bottom: activeBottomDrawer === "emoji" ? "335px" : "76px",
          }}
          className={`absolute left-1/2 z-40 h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-[#D8DADF] bg-white text-[#1877F2] shadow-[0_5px_16px_rgba(0,0,0,0.16)] active:scale-90 ${
            showScrollToBottom ? "flex" : "hidden"
          }`}
          aria-label="回到底部"
          title="回到底部"
        >
          <ArrowDown size={18} />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#1877F2] ring-2 ring-white" />
        </motion.button>

        {/* ================================================================= */}
        {/* COMPREHENSIVE CHAT INPUT MODULE (全面设计的聊天输入模块) */}
        {/* ================================================================= */}

        {/* 1. Hold-to-Talk Fullscreen Visual HUD Overlay (拟真语音录制中浮层) */}
        {isHoldingVoice && (
          <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-150">
            <div
              className={`p-8 rounded-3xl flex flex-col items-center space-y-4 max-w-xs w-full text-center transition-all ${
                voiceHoldCancel
                  ? "bg-rose-500/95 text-white shadow-2xl scale-105"
                  : "bg-[#1C1C1E]/95 text-white border border-gray-700/80 shadow-2xl"
              }`}
            >
              {/* Dynamic Sound Wave Pulse Circle */}
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  voiceHoldCancel
                    ? "bg-white text-rose-500 animate-bounce"
                    : "bg-[#1877F2] text-white shadow-xl ring-4 ring-[#1877F2]/30 animate-pulse"
                }`}
              >
                {voiceHoldCancel ? <X size={36} /> : <Mic size={36} />}
              </div>

              {/* Dynamic Sound Waves */}
              <div className="flex items-center space-x-1 h-9">
                {[45, 85, 60, 100, 75, 95, 65, 90, 50, 95, 70, 85, 55, 80].map(
                  (h, i) => (
                    <span
                      key={`hold-wave-${i}`}
                      style={{
                        height: `${Math.max(30, (h * (Math.sin(Date.now() / 100 + i) + 1.8)) / 2.8)}%`,
                      }}
                      className={`w-1.5 rounded-full transition-all duration-75 ${
                        voiceHoldCancel ? "bg-white" : "bg-[#1877F2]"
                      }`}
                    />
                  ),
                )}
              </div>

              {/* Duration Timer & Speech Transcription Preview */}
              <div className="flex flex-col items-center space-y-1">
                <div className="text-base font-black tracking-wider text-blue-400">
                  {`00:${voiceHoldSeconds.toString().padStart(2, "0")}`}
                </div>
                <div className="text-[11px] text-gray-400 font-medium italic">
                  {voiceHoldSeconds > 1 ? "“正在实时语音转文字...”" : "“正在聆听您的声音...”"}
                </div>
              </div>

              {/* Cancel guidance indicator */}
              <div
                className={`text-xs font-semibold px-4 py-1.5 rounded-full ${
                  voiceHoldCancel
                    ? "bg-black/40 text-white"
                    : "bg-white/10 text-gray-300"
                }`}
              >
                {voiceHoldCancel ? "松开手指，取消发送" : "↑ 手指上滑，取消发送"}
              </div>
            </div>
          </div>
        )}

        {/* 2. Legacy Recording Active Overlay if triggered via tap */}
        {isRecording && (
          <div className="px-4 py-3 bg-white border-t border-[#E4E6EB] flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center animate-ping">
                <Mic size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-rose-600 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>正在录音 {recordingSeconds}s</span>
                </div>
                <p className="text-[10px] text-[#65676B]">
                  {isCancelZone ? "松开手指将取消发送" : "松开发送，轻触取消"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="px-3 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] text-xs font-semibold rounded-full cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={stopAndSendRecording}
                className="px-4 py-1.5 bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white text-xs font-bold rounded-full shadow-md cursor-pointer flex items-center space-x-1"
              >
                <span>发送</span>
                <Send size={12} />
              </button>
            </div>
          </div>
        )}

        {/* 3. Attachment Preview Card Bar (相册/定位/文档/拍照选中后的预览条) */}
        {selectedAttachment && (
          <div className="px-3 py-2 bg-blue-50/90 border-t border-blue-100/90 flex items-center justify-between animate-in slide-in-from-bottom-1 duration-150">
            <div className="flex items-center space-x-2.5 truncate flex-1 min-w-0">
              {selectedAttachment.previewUrl ? (
                <img
                  src={selectedAttachment.previewUrl}
                  alt="Attachment"
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-blue-200 shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  {selectedAttachment.type === "file" && <FileText size={18} />}
                  {selectedAttachment.type === "contact" && (
                    <UserPlus size={18} />
                  )}
                  {selectedAttachment.type === "location" && (
                    <MapPin size={18} />
                  )}
                </div>
              )}
              <div className="truncate flex-1">
                <div className="text-xs font-bold text-[#1877F2] flex items-center space-x-1">
                  <span>{selectedAttachment.title}</span>
                  <span className="text-[10px] text-blue-400 font-normal">
                    已附加
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  {selectedAttachment.subtitle || "点击发送一并发送"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAttachment(null)}
              className="w-7 h-7 rounded-full hover:bg-blue-100 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors ml-2 cursor-pointer shrink-0"
              title="移除附件"
              aria-label="移除附件"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* 4. Quoted / Referenced Reply Preview Banner */}
        {quotedMessage && (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-[#1877F2] shrink-0 animate-in slide-in-from-bottom-1 duration-150">
            <div className="flex items-center space-x-1.5 truncate">
              <img
                src={getQuotedSenderAvatar(quotedMessage.senderName)}
                alt={quotedMessage.senderName || "Sender"}
                className="w-4 h-4 rounded-full object-cover shrink-0 ring-1 ring-blue-300/80 shadow-2xs"
              />
              <span className="font-bold">
                回复 @{quotedMessage.senderName}:
              </span>
              <span className="truncate text-gray-600">
                {quotedMessage.text}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setQuotedMessage(null)}
              aria-label="取消回复"
              className="text-gray-400 hover:text-gray-700 ml-2 cursor-pointer min-w-11 min-h-11 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )}

        {/* 4.5. Editing Message Preview Banner */}
        {editingMessage && (
          <div className="px-4 py-2 bg-blue-50/90 border-t border-blue-200/80 flex items-center justify-between text-xs text-[#1877F2] shrink-0 animate-in slide-in-from-bottom-1 duration-150">
            <div className="flex items-center space-x-1.5 truncate">
              <Edit3 size={13} className="text-[#1877F2] shrink-0" />
              <span className="font-bold">
                正在编辑消息:
              </span>
              <span className="truncate text-gray-600">
                {editingMessage.text}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingMessage(null);
                setInputText("");
              }}
              className="text-gray-400 hover:text-gray-700 ml-2 cursor-pointer p-1"
              title="取消编辑"
              aria-label="取消编辑"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              ✕
            </button>
          </div>
        )}

        {isMultiSelectMode ? (
          /* MULTI-SELECT BOTTOM ACTION TOOLBAR */
          <div className="p-3 bg-white/98 backdrop-blur-xl border-t border-gray-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex items-center justify-between shrink-0 font-sans select-none z-30 animate-in slide-in-from-bottom duration-200">
            {/* Left: Cancel & Selected Count */}
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsMultiSelectMode(false);
                  setSelectedMultiMsgIds(new Set());
                  showToast("已退出多选模式");
                }}
                className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-[#007AFF] text-xs font-extrabold flex items-center space-x-1 cursor-pointer transition-all"
                title="退出多选"
              >
                <X size={15} />
                <span>取消</span>
              </button>
              <span className="text-xs font-bold text-gray-800">
                已选中 <span className="text-[#007AFF] font-extrabold text-sm">{selectedMultiMsgIds.size}</span> 条
              </span>
            </div>

            {/* Right: Next Step Actions (Forward, Bookmark, Delete) */}
            <div className="flex items-center space-x-2">
              {/* 1. Forward */}
              <button
                type="button"
                disabled={selectedMultiMsgIds.size === 0}
                onClick={() => {
                  const activeVisibleMessages = activeConversation.messages.filter(
                    (msg) => !deletedMsgIds.includes(msg.id)
                  );
                  const selectedMsgs = activeVisibleMessages.filter((m) =>
                    selectedMultiMsgIds.has(m.id)
                  );
                  if (selectedMsgs.length === 0) {
                    soundEffects.playTapSound();
                    haptics.trigger("warning");
                    showToast("请先选择需要转发的消息 ⚠️");
                    return;
                  }
                  setForwardModalState({
                    isOpen: true,
                    sourceMessages: selectedMsgs,
                    forwardMode: "itemized",
                    selectedTargetChatIds: [],
                    searchQuery: "",
                  });
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#007AFF] hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 active:scale-95"
                title="转发选中消息"
              >
                <Forward size={14} />
                <span>转发</span>
              </button>

              {/* 2. Bookmark / Favorite */}
              <button
                type="button"
                disabled={selectedMultiMsgIds.size === 0}
                onClick={() => {
                  const count = selectedMultiMsgIds.size;
                  showToast(`已成功收藏 ${count} 条消息到我的收藏 ⭐️`);
                  setIsMultiSelectMode(false);
                  setSelectedMultiMsgIds(new Set());
                }}
                className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 active:scale-95"
                title="收藏选中消息"
              >
                <Bookmark size={14} />
                <span>收藏</span>
              </button>

              {/* 3. Delete */}
              <button
                type="button"
                disabled={selectedMultiMsgIds.size === 0}
                onClick={() => {
                  const selectedIds = Array.from(selectedMultiMsgIds) as string[];
                  if (selectedIds.length === 0) return;
                  selectedIds.forEach((id: string) => {
                    handleDeleteMessage(id);
                  });
                  setIsMultiSelectMode(false);
                  setSelectedMultiMsgIds(new Set());
                  showToast(`已删除 ${selectedIds.length} 条消息 🗑️`);
                }}
                className="px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 active:scale-95"
                title="删除选中消息"
              >
                <Trash2 size={14} />
                <span>删除</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Burn After Reading Mode Banner */}
            {isBurnAfterReadingMode && (
              <div className="bg-rose-500 text-white px-3.5 py-2 text-xs font-bold flex items-center justify-between shrink-0 animate-in slide-in-from-bottom-2 duration-200 shadow-2xs z-20">
                <div className="flex items-center space-x-2">
                  <Flame size={16} className="animate-bounce shrink-0" />
                  <span>🔥 阅后即焚模式已开启：消息将在查看后 5 秒自动销毁</span>
                </div>
                <button
                  onClick={() => setIsBurnAfterReadingMode(false)}
                  className="text-white/90 hover:text-white text-xs underline cursor-pointer shrink-0 ml-2"
                >
                  关闭
                </button>
              </div>
            )}

            {/* Smart Contextual Emoji Suggestions Bar */}
            {smartSuggestedEmojis.length > 0 && (
              <div
                id="smart-emoji-suggestions-bar"
                className="bg-white/95 dark:bg-zinc-900 backdrop-blur-md px-3 py-1.5 border-t border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-150 select-none shadow-2xs z-20"
              >
                <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-0.5">
                  <span className="text-[11px] font-bold text-[#65676B] flex items-center gap-1 shrink-0">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>联想表情:</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {smartSuggestedEmojis.map((emoji, emojiIdx) => (
                      <button
                        key={`smart-em-${emoji}-${emojiIdx}`}
                        type="button"
                        onClick={(e) => {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          handleSendSingleEmoji(emoji, rect);
                        }}
                        onMouseDown={(e) => handleStartChargeMegaEmoji(emoji, e)}
                        onMouseUp={() => handleReleaseMegaEmoji(emoji)}
                        onMouseLeave={handleCancelMegaEmoji}
                        onTouchStart={(e) => handleStartChargeMegaEmoji(emoji, e)}
                        onTouchEnd={() => handleReleaseMegaEmoji(emoji)}
                        className="text-2xl emoji-tap-spring hover:scale-125 p-1 rounded-md hover:bg-[#F0F2F5] cursor-pointer flex items-center justify-center shrink-0 select-none will-change-transform"
                        title={`点击立即发送 ${emoji} · 长按蓄力大表情`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 ml-2 font-medium">长按蓄力放大</span>
              </div>
            )}

            {/* 6. Main Interactive Input Toolbar (Facebook Straight-Edge Line Frame UI) */}
            {!isRecording && (
              <div className="chat-quick-replies" role="toolbar" aria-label="快捷信息" onPointerDown={(e)=>e.stopPropagation()}>
                {['你好呀 👋','在路上 🚶','马上到 📍','等我一下 ⏳','到啦 ✨','晚点聊 🌙'].map((text, tIdx)=>(
                  <button key={`quick-reply-${tIdx}-${text}`} type="button" onClick={()=>{
                    setInputMode("text");
                    setInputText(prev=>prev ? `${prev} ${text}` : text);
                    setActiveBottomDrawer("none");
                    requestAnimationFrame(()=>chatTextareaRef.current?.focus());
                    haptics.trigger("light");
                  }}>{text}</button>
                ))}
              </div>
            )}
            {!isRecording && (
              <div
                id="chat-input-bar"
                onPointerDown={(e) => e.stopPropagation()}
                className="p-2.5 pb-3 bg-white dark:bg-black border-t border-[#E4E6EB] dark:border-zinc-800 flex items-end space-x-2 shrink-0 select-none shadow-2xs transition-all relative"
              >

                {/* Left Button: Plus (+) Extensions Drawer Toggle */}
                <button
                  type="button"
                  id="toggle-more-drawer-btn"
                  onClick={() => {
                    setActiveBottomDrawer((prev) =>
                      prev === "more" ? "none" : "more",
                    );
                  }}
                  className={`w-9 h-9 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs active:scale-95 ${
                    activeBottomDrawer === "more"
                      ? "bg-[#1877F2] text-white border-[#1877F2] rotate-45"
                      : "text-[#1877F2] bg-white dark:bg-zinc-900 hover:border-[#1877F2] hover:bg-[#F0F2F5]"
                  }`}
                  title="快捷功能扩展 (照片、位置共享、相册等)"
                >
                  <Plus size={20} className="transition-transform duration-200" />
                </button>

                <button type="button" aria-label="消息样式" className="bump-composer-style" onClick={() => setIsMessageStyleOpen(true)}>Aa</button>
                {isMessageStyleOpen && <MessageStylePicker appearance={messageAppearance} onChange={setMessageAppearance} onClose={() => setIsMessageStyleOpen(false)} />}
                {/* Input Center: Dynamic Auto-Growing Textarea OR Hold-to-Talk Capsule */}
                {inputMode === "text" ? (
                  <div
                    className={`bump-message-style style-${messageAppearance.id} flex-1 relative flex items-end min-h-[38px]`}
                  >
                    <textarea
                      ref={chatTextareaRef}
                      id="chat-text-input"
                      aria-label={isGroupChat ? "群聊消息" : "消息"}
                      rows={1}
                      placeholder={
                        isGroupChat
                          ? "发到群聊..."
                          : "消息"
                      }
                      value={inputText}
                      onFocus={() => {
                        setIsInputFocused(true);
                        setActiveBottomDrawer("none");
                      }}
                      onBlur={() => setIsInputFocused(false)}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (shouldSendOnEnter({ key: e.key, shiftKey: e.shiftKey, isComposing: e.nativeEvent.isComposing, keyCode: e.nativeEvent.keyCode })) {
                          e.preventDefault();
                          handleSendText();
                        }
                      }}
                      className="w-full bg-transparent placeholder-current text-[15px] sm:text-sm leading-[22px] resize-none outline-none focus:outline-none scrollbar-thin scrollbar-thumb-gray-300 pr-8 py-1 font-sans"
                      style={{ lineHeight: "22px", maxHeight: "96px", minHeight: "30px", color: "inherit", fontFamily: "inherit", fontWeight: "inherit", textAlign: messageAppearance.alignment }}
                    />

                    {/* Voice toggle button behind input field */}
                    <button
                      type="button"
                      id="input-voice-toggle-btn"
                      onClick={() => {
                        setInputMode("voice");
                        setActiveBottomDrawer("none");
                      }}
                      className="absolute right-1.5 bottom-1 text-[#1877F2] hover:text-[#166fe5] hover:bg-blue-50/80 dark:hover:bg-zinc-800 transition-colors p-1.5 rounded-md cursor-pointer flex items-center justify-center shrink-0"
                      title="切换为语音输入"
                      aria-label="切换为语音输入"
                    >
                      <Mic size={17} />
                    </button>
                  </div>
                ) : (
                  /* Hold-to-Talk Voice Sending Button */
                  <div className="flex-1 relative flex items-center min-h-[38px]">
                    <div
                      id="hold-to-talk-button"
                      onTouchStart={handleHoldVoiceStart}
                      onTouchMove={handleHoldVoiceMove}
                      onTouchEnd={handleHoldVoiceEnd}
                      onMouseDown={handleHoldVoiceStart}
                      onMouseMove={handleHoldVoiceMove}
                      onMouseUp={handleHoldVoiceEnd}
                      className={`w-full h-[38px] flex items-center justify-center rounded-md text-center text-xs font-bold transition-all cursor-pointer select-none shadow-2xs border pr-8 ${
                        isHoldingVoice
                          ? "bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] scale-[0.99]"
                          : "bg-white text-[#050505] dark:bg-zinc-900 dark:text-zinc-100 border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] hover:bg-[#F0F2F5]"
                      }`}
                    >
                      {isHoldingVoice
                        ? voiceHoldCancel
                          ? "松开手指，取消发送"
                          : "松开 发送"
                        : "按住 说话"}
                    </div>

                    {/* Toggle button to switch back to text input box */}
                    <button
                      type="button"
                      id="input-keyboard-toggle-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInputMode("text");
                        setActiveBottomDrawer("none");
                        setTimeout(() => chatTextareaRef.current?.focus(), 50);
                      }}
                      className="absolute right-1.5 text-[#1877F2] hover:text-[#166fe5] hover:bg-blue-50/80 dark:hover:bg-zinc-800 transition-colors p-1.5 rounded-md cursor-pointer flex items-center justify-center shrink-0 z-10"
                      title="变回消息输入框"
                      aria-label="变回消息输入框"
                    >
                      <Keyboard size={17} />
                    </button>
                  </div>
                )}

                {/* Right Buttons: Emoji Drawer Toggle */}
                <button
                  type="button"
                  id="toggle-emoji-drawer-btn"
                  onClick={() => {
                    setActiveBottomDrawer((prev) =>
                      prev === "emoji" ? "none" : "emoji",
                    );
                  }}
                  className={`w-9 h-9 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs active:scale-95 ${
                    activeBottomDrawer === "emoji"
                      ? "bg-amber-100 text-amber-600 border-amber-300"
                      : "text-[#65676B] bg-white dark:bg-zinc-900 hover:border-[#1877F2] hover:bg-[#F0F2F5]"
                  }`}
                  title="表情与贴纸"
                >
                  <Smile size={19} />
                </button>

                {/* Send Button when text or attachment is present */}
                {(inputText.trim() || selectedAttachment) && (
                  <button
                    id="send-chat-message-btn"
                    type="button"
                    onClick={() => handleSendText()}
                    className={`h-9 px-3.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-md font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 ${
                      isFlyAwaySend ? "animate-fly-plane pointer-events-none" : ""
                    }`}
                    title="立即发送"
                  >
                    <Send size={13} className={isFlyAwaySend ? "text-white" : ""} />
                    <span>发送</span>
                  </button>
                )}
              </div>
            )}

            {/* Confirmed strokes become messages on the same chat canvas. */}
            {activeConversation && (
              <OnScreenHandwritingLayer
                key={activeConversation.id}
                onSend={handleSendHandwriting}
                isActive={isHandwritingOpen}
                onActiveChange={setIsHandwritingOpen}
                showToast={showToast}
              />
            )}
          </>
        )}

        {/* 7. Bottom Drawer A: Comprehensive Emoji, Stickers & Phrases Tabbed Panel */}
        {activeBottomDrawer === "emoji" && <div ref={bottomDrawerRef} className={`stellar-chat-drawer ${isDrawerResizing ? 'is-resizing' : ''}`} style={{height:bottomDrawerHeight}}>
          {drawerHandle}
          <div className="stellar-chat-drawer-body">
            <div className="stellar-chat-stickers" aria-label="原创立体贴纸">{[...STELLAR_STICKERS, ...BUMP_STICKERS.filter(item => !("friends" in item) || (friends?.length || 0) >= item.friends)].map((item, itemIdx) => <button key={`stellar-bump-stk-${item.id}-${itemIdx}`} aria-label={`发送 ${item.label}`} onClick={() => { handleSendSingleEmoji(item.emoji); setActiveBottomDrawer("none"); }}><BumpSticker emoji={item.emoji} size={60} /><span>{item.label}</span></button>)}</div>
            <TelegramEmojiPanel
          isOpen={activeBottomDrawer === "emoji"}
          onClose={() => setActiveBottomDrawer("none")}
          onEmojiSelect={(emoji, sourceRect, behavior = "default") => {
            setRecentEmojis((prev) => [
              emoji,
              ...prev.filter((item) => item !== emoji),
            ].slice(0, 16));
            if (behavior === "send" || emojiDrawerSendMode === "instant") {
              handleSendSingleEmoji(emoji, sourceRect);
              return;
            }

            setInputText((prev) => prev + emoji);
            soundEffects.playBubblePopSound();
            haptics.trigger("light");
            const inputEl = document.getElementById("chat-text-input");
            if (
              sourceRect &&
              inputEl &&
              emojiFlyRef.current &&
              !prefersReducedMotion
            ) {
              const targetRect = inputEl.getBoundingClientRect();
              emojiFlyRef.current.spawnFly({
                emoji,
                fromX: sourceRect.left + sourceRect.width / 2,
                fromY: sourceRect.top + sourceRect.height / 2,
                toX: targetRect.left + 25,
                toY: targetRect.top + targetRect.height / 2,
                size: 24,
              });
            }
          }}
          onEmojiHoldStart={handleStartChargeMegaEmoji}
          onEmojiHoldEnd={handleReleaseMegaEmoji}
          onEmojiHoldCancel={handleCancelMegaEmoji}
          recentEmojis={recentEmojis}
          reduceMotion={!!prefersReducedMotion}
        />
          </div>
        </div>}

        {typeof document !== "undefined" &&
          createPortal(
            <>
              <EmojiFlyEffect ref={emojiFlyRef} />

              {chargingEmoji && (
                <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden">
                  {!prefersReducedMotion && chargingEmoji.scale >= 2.35 && (
                    <div className="absolute inset-0 bg-black/10 animate-in fade-in duration-150" />
                  )}

                  <div
                    role="status"
                    aria-live="polite"
                    className="absolute flex flex-col items-center select-none"
                    style={{
                      left: `${Math.min(
                        Math.max(
                          58,
                          chargingEmoji.rect.left + chargingEmoji.rect.width / 2,
                        ),
                        window.innerWidth - 58,
                      )}px`,
                      top: `${Math.max(112, chargingEmoji.rect.top - 12)}px`,
                      transform: "translate(-50%, -100%)",
                    }}
                  >
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/90 bg-white/95 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-md">
                      {!prefersReducedMotion && (
                        <>
                          <motion.span
                            className="absolute inset-[-9px] rounded-full border-2 border-[#1877F2]/35"
                            initial={{ scale: 0.72, opacity: 0.8 }}
                            animate={{ scale: 1.38, opacity: 0 }}
                            transition={{
                              duration: 1.1,
                              repeat: Infinity,
                              ease: "easeOut",
                            }}
                          />
                          <motion.span
                            className="absolute inset-[-2px] rounded-full border border-indigo-400/35"
                            initial={{ scale: 0.9, opacity: 0.7 }}
                            animate={{ scale: 1.18, opacity: 0.15 }}
                            transition={{
                              duration: 0.75,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut",
                            }}
                          />
                        </>
                      )}

                      <span
                        className="relative z-10 leading-none will-change-transform"
                        style={{
                          fontSize: "54px",
                          transform: `scale(${chargingEmoji.scale})`,
                          transition: prefersReducedMotion
                            ? "none"
                            : "transform 0.08s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          filter: `drop-shadow(0 ${Math.round(
                            7 * chargingEmoji.scale,
                          )}px ${Math.round(
                            18 * chargingEmoji.scale,
                          )}px rgba(24,119,242,${Math.min(
                            0.5,
                            0.15 + (chargingEmoji.scale - 1) * 0.35,
                          )}))`,
                        }}
                      >
                        {chargingEmoji.emoji}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 rounded-full bg-[#1C1C1E]/92 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg">
                      <Flame
                        size={13}
                        className={`text-amber-400 ${
                          chargingEmoji.scale >= 2 && !prefersReducedMotion
                            ? "animate-bounce"
                            : ""
                        }`}
                      />
                      <span>
                        {chargingEmoji.scale >= 2.3
                          ? "松开，轰炸"
                          : chargingEmoji.scale >= 1.7
                            ? "继续按住"
                            : "蓄力中"}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-white/70 shadow-inner ring-1 ring-black/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1877F2] via-indigo-500 to-amber-400 transition-all duration-75"
                        style={{
                          width: `${Math.min(
                            100,
                            ((chargingEmoji.scale - 1) / 1.95) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>,
            document.body,
          )}

        {/* 8. Bottom Drawer B: 8-Grid Plus Extension Tools Panel */}
        {activeBottomDrawer === "more" && (
          <div ref={bottomDrawerRef} className={`stellar-chat-drawer ${isDrawerResizing ? 'is-resizing' : ''}`} style={{height:bottomDrawerHeight}}>
          {drawerHandle}
          <div className="stellar-chat-drawer-body">
          <div
            id="chat-extension-tools-drawer"
            className="bg-white dark:bg-[#242526] border-t border-[#E4E6EB] dark:border-zinc-800 p-4 shadow-sm select-none z-30 animate-in slide-in-from-bottom duration-200 shrink-0"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB] dark:border-zinc-800 mb-3">
              <span className="text-xs font-bold text-[#050505] dark:text-[#E4E6EB] flex items-center space-x-1.5">
                <Sparkles size={14} className="text-[#1877F2]" />
                <span>扩展功能与富媒体</span>
              </span>
              <button
                type="button"
                id="close-more-drawer-btn"
                onClick={() => setActiveBottomDrawer("none")}
                className="text-[#65676B] dark:text-zinc-400 hover:text-[#050505] dark:hover:text-white p-1 rounded-md hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                title="关闭扩展面板"
              >
                <X size={16} />
              </button>
            </div>

            {/* 4x2 Tools Grid */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {EXTENSION_TOOLS.map((tool, tIdx) => {
                const IconComponent = tool.icon;
                return (
                  <button
                    key={`ext-tool-item-${tool.id}-${tIdx}`}
                    type="button"
                    id={`ext-tool-${tool.id}`}
                    onClick={() => handleSelectTool(tool.id)}
                    className="flex flex-col items-center space-y-1.5 p-2 rounded-md hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 border border-transparent hover:border-[#E4E6EB] dark:hover:border-zinc-700 transition-all cursor-pointer active:scale-95 group"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <IconComponent size={22} />
                    </div>
                    <span className="text-xs font-semibold text-[#050505] dark:text-[#E4E6EB] group-hover:text-[#1877F2] transition-colors">
                      {tool.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Photos Carousel */}
            <div className="mt-3 pt-3 border-t border-[#E4E6EB] dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#65676B] dark:text-zinc-400 flex items-center gap-1">
                  <ImageIcon size={12} className="text-[#1877F2]" />
                  <span>快捷发送照片 / 示例相册</span>
                </span>
                <span className="text-[10px] text-[#65676B] dark:text-zinc-400">点击即选即发</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_ATTACHMENT_PHOTOS.map((p, idx) => (
                  <button
                    key={`quick-photo-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedAttachment({
                        type: "image",
                        title: p.title,
                        previewUrl: p.url,
                        subtitle: "350 KB · 快捷相册",
                      });
                      setActiveBottomDrawer("none");
                      soundEffects.playTapSound();
                      showToast(`已载入「${p.label}」照片，可直接点击发送 📷`);
                    }}
                    className="group relative rounded-md overflow-hidden border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] aspect-video bg-gray-100 dark:bg-zinc-800 cursor-pointer transition-all active:scale-95 shadow-2xs"
                  >
                    <img
                      src={p.url}
                      alt={p.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[9px] font-medium text-white truncate text-center">
                      {p.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* GROUP SHORTCUT BAR (群聊快捷栏: 圆形图标设置按钮 + 聚合头像与角色角标) */}
        {/* ================================================================= */}
        {showGroupDetails && (() => {
          const groupDetails = activeConversation?.groupDetails;
          return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center animate-in fade-in duration-150">
            <div
              id="group-details-modal"
              className="bg-white w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200 border border-[#CED0D5]/50"
            >
              {/* Shortcut Bar Header */}
              <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between bg-[#F8F9FA] shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center">
                    <Users size={15} />
                  </div>
                  <div>
                    <h3 className="font-black text-xs text-[#050505] leading-tight">群聊快捷栏</h3>
                    <p className="text-[9.5px] text-[#65676B]">
                      {activeConversation.friendName} · 共 {groupDetails?.memberCount || 18} 名成员
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGroupDetails(false)}
                  className="w-7 h-7 rounded-full bg-gray-200/80 hover:bg-gray-300 flex items-center justify-center text-[#65676B] cursor-pointer transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Shortcut Bar Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {/* 1. Circular Setting Buttons Grid (圆形图标加下方名字设计) */}
                <div>
                  <div className="text-[10px] font-bold text-[#65676B] mb-2 px-1">群聊快捷设置</div>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {/* Pin */}
                    <button
                      onClick={() => {
                        setIsPinned(!isPinned);
                        showToast(isPinned ? "已取消置顶" : "已置顶群聊");
                      }}
                      className="flex flex-col items-center space-y-1.5 group cursor-pointer"
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-2xs group-hover:scale-105 ${
                          isPinned
                            ? "bg-[#1877F2] text-white ring-2 ring-blue-300"
                            : "bg-[#F0F2F5] text-[#050505] hover:bg-gray-200"
                        }`}
                      >
                        <Pin size={18} />
                      </div>
                      <span className="text-[10px] font-bold text-[#050505] truncate max-w-[56px]">
                        {isPinned ? "已置顶" : "置顶聊天"}
                      </span>
                    </button>

                    {/* Mute */}
                    <button
                      onClick={() => {
                        setIsMuted(!isMuted);
                        showToast(isMuted ? "已恢复消息通知" : "已开启消息免打扰");
                      }}
                      className="flex flex-col items-center space-y-1.5 group cursor-pointer"
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-2xs group-hover:scale-105 ${
                          isMuted
                            ? "bg-amber-500 text-white ring-2 ring-amber-300"
                            : "bg-[#F0F2F5] text-[#050505] hover:bg-gray-200"
                        }`}
                      >
                        <VolumeX size={18} />
                      </div>
                      <span className="text-[10px] font-bold text-[#050505] truncate max-w-[56px]">
                        {isMuted ? "已静音" : "消息免打扰"}
                      </span>
                    </button>

                    {/* Announcement */}
                    <button
                      onClick={() => {
                        setGroupAnnouncementInput(groupDetails?.announcement || "欢迎加入群聊！");
                        setIsEditingAnnouncement(true);
                      }}
                      className="flex flex-col items-center space-y-1.5 group cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#F0F2F5] text-[#1877F2] flex items-center justify-center hover:bg-blue-50 transition-all shadow-2xs group-hover:scale-105">
                        <Megaphone size={18} />
                      </div>
                      <span className="text-[10px] font-bold text-[#050505] truncate max-w-[56px]">
                        群公告
                      </span>
                    </button>

                    {/* Invite Friend */}
                    <button
                      onClick={() => showToast("已生成群邀请口令，可转发给好友")}
                      className="flex flex-col items-center space-y-1.5 group cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#F0F2F5] text-emerald-600 flex items-center justify-center hover:bg-emerald-50 transition-all shadow-2xs group-hover:scale-105">
                        <UserPlus size={18} />
                      </div>
                      <span className="text-[10px] font-bold text-[#050505] truncate max-w-[56px]">
                        邀请好友
                      </span>
                    </button>

                    {/* Rename */}
                    <button
                      onClick={() => {
                        setGroupNameInput(activeConversation.friendName);
                        setIsEditingGroupName(true);
                      }}
                      className="flex flex-col items-center space-y-1.5 group cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#F0F2F5] text-purple-600 flex items-center justify-center hover:bg-purple-50 transition-all shadow-2xs group-hover:scale-105">
                        <Edit3 size={18} />
                      </div>
                      <span className="text-[10px] font-bold text-[#050505] truncate max-w-[56px]">
                        改群名
                      </span>
                    </button>
                  </div>
                </div>

                {/* Inline Edit Group Name Box */}
                {isEditingGroupName && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl space-y-2">
                    <label className="block text-xs font-bold text-[#1877F2]">更改群聊名称</label>
                    <input
                      type="text"
                      value={groupNameInput}
                      onChange={(e) => setGroupNameInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 bg-white outline-none font-medium text-[#050505]"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setIsEditingGroupName(false)}
                        className="px-3 py-1 text-xs text-gray-600 font-bold hover:bg-gray-200 rounded-lg cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => {
                          if (groupNameInput.trim()) {
                            activeConversation.friendName = groupNameInput.trim();
                            showToast("群名称已更新");
                          }
                          setIsEditingGroupName(false);
                        }}
                        className="px-3 py-1 text-xs bg-[#1877F2] text-white font-bold rounded-lg cursor-pointer"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                )}

                {/* Inline Edit Announcement Box */}
                {isEditingAnnouncement && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl space-y-2">
                    <label className="block text-xs font-bold text-[#1877F2]">修改群公告</label>
                    <textarea
                      value={groupAnnouncementInput}
                      onChange={(e) => setGroupAnnouncementInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 bg-white outline-none font-medium text-[#050505] h-16 resize-none"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setIsEditingAnnouncement(false)}
                        className="px-3 py-1 text-xs text-gray-600 font-bold hover:bg-gray-200 rounded-lg cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => {
                          if (groupDetails) {
                            groupDetails.announcement = groupAnnouncementInput;
                          }
                          showToast("群公告已更新");
                          setIsEditingAnnouncement(false);
                        }}
                        className="px-3 py-1 text-xs bg-[#1877F2] text-white font-bold rounded-lg cursor-pointer"
                      >
                        发布公告
                      </button>
                    </div>
                  </div>
                )}

                {/* Group Announcement banner if available */}
                {groupDetails?.announcement && !isEditingAnnouncement && (
                  <div className="bg-[#E7F3FF] border border-[#1877F2]/20 rounded-2xl p-2.5 flex items-start space-x-2">
                    <Megaphone size={14} className="text-[#1877F2] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-[#1877F2]">群公告</div>
                      <p className="text-[11px] text-[#050505] leading-snug mt-0.5">{groupDetails.announcement}</p>
                    </div>
                  </div>
                )}

                {/* 2. Group Members Aggregated Display (头像加下方姓名，右下角角色: 管理员、群主) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-[#050505]">群成员聚合</span>
                      <span className="text-[10px] font-bold text-[#1877F2] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {groupDetails?.members?.length || 8} 人
                      </span>
                    </div>
                    <span
                      onClick={() => showToast("已展开全部 18 位成员")}
                      className="text-[10.5px] text-[#1877F2] font-bold hover:underline cursor-pointer"
                    >
                      查看全部 &gt;
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 p-2 bg-[#F8F9FA] rounded-2xl border border-[#E4E6EB]">
                    {(() => {
                      const displayMembers = (groupDetails?.members && groupDetails.members.length > 0)
                        ? groupDetails.members
                        : [
                            { id: "gm1", name: "Alex Mercer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150", role: "群主" },
                            { id: "gm2", name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", role: "管理员" },
                            { id: "gm3", name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150", role: "管理员" },
                            { id: "gm4", name: "David Miller", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" },
                            { id: "gm5", name: "Hui Zhang", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" },
                            { id: "gm6", name: "Liam Wilson", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150" },
                            { id: "gm7", name: "我 (Alexia)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" },
                          ];

                      return (
                        <>
                          {displayMembers.map((member: any, idx: number) => {
                            const isOwner = member.role === "群主" || idx === 0;
                            const isAdmin = member.role === "管理员" || idx === 1 || idx === 2;
                            return (
                              <div
                                key={`grp-mem-${member.id || idx}-${idx}`}
                                onClick={() => {
                                  setShowGroupDetails(false);
                                  if (onOpenFriendProfile) {
                                    onOpenFriendProfile(member.id);
                                  }
                                }}
                                className="flex flex-col items-center space-y-1 group cursor-pointer"
                              >
                                <div className="relative">
                                  <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-2xs group-hover:scale-105 transition-transform"
                                  />
                                  {/* Role badge in bottom right corner of avatar */}
                                  {isOwner ? (
                                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[7.5px] font-black px-1 rounded-full border border-white shadow-2xs leading-tight">
                                      群主
                                    </span>
                                  ) : isAdmin ? (
                                    <span className="absolute -bottom-1 -right-1 bg-[#1877F2] text-white text-[7.5px] font-black px-1 rounded-full border border-white shadow-2xs leading-tight">
                                      管理员
                                    </span>
                                  ) : null}
                                </div>
                                <span className="text-[10px] font-bold text-[#050505] truncate max-w-[56px] text-center">
                                  {member.name.split(" ")[0]}
                                </span>
                              </div>
                            );
                          })}

                          {/* Plus Add Button */}
                          <div
                            onClick={() => showToast("已打开好友选择器添加群成员")}
                            className="flex flex-col items-center space-y-1 group cursor-pointer"
                          >
                            <div className="w-11 h-11 rounded-full border-2 border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-400 group-hover:border-[#1877F2] group-hover:text-[#1877F2] transition-all shadow-2xs group-hover:scale-105">
                              <Plus size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-[#65676B] group-hover:text-[#1877F2] truncate max-w-[56px] text-center">
                              添加
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 3. Exit Group Action */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setShowGroupDetails(false);
                      showToast("已安全退出该群聊");
                      onSelectChat(null);
                    }}
                    className="w-full py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>退出群聊</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        })()}

        {/* Hidden File Inputs for Attachment Uploads inside Conversation */}
        <input
          type="file"
          ref={photoInputRef}
          accept="image/*"
          className="hidden"
          onChange={handlePhotoFileChange}
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoFileChange}
        />
        <input
          type="file"
          ref={docInputRef}
          accept="*/*"
          className="hidden"
          onChange={handleDocFileChange}
        />

        {/* ACTIVITY PICKER MODAL (发送活动卡片选择器) inside activeConversation */}
        <AnimatePresence>
          {isActivityPickerOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsActivityPickerOpen(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              />

              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 280 }}
                className="relative w-full max-w-lg bg-white dark:bg-[#242526] rounded-t-2xl sm:rounded-2xl p-5 z-10 shadow-2xl max-h-[85vh] flex flex-col font-sans border-t sm:border border-[#E4E6EB] dark:border-zinc-700"
              >
                {/* Top Drag Indicator */}
                <div className="w-10 h-1 bg-gray-300 dark:bg-zinc-600 rounded-full mx-auto mb-3 shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB] dark:border-zinc-700 shrink-0">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#1877F2]">
                      <Compass size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#050505] dark:text-[#E4E6EB]">
                        发送活动卡片
                      </h3>
                      <p className="text-[11px] text-[#65676B] dark:text-zinc-400">
                        选择一个同城/社群活动，向当前聊天发送直观信息卡片
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsActivityPickerOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#F0F2F5] dark:bg-zinc-700 hover:bg-[#E4E6EB] dark:hover:bg-zinc-600 flex items-center justify-center text-[#050505] dark:text-white cursor-pointer transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Activity List */}
                <div className="py-3 overflow-y-auto space-y-2.5 flex-1 pr-1 max-h-[60vh]">
                  {allActivitiesList.map((act) => {
                    const themeColor = act.color || "#1877F2";
                    return (
                      <div
                        key={`conv-act-${act.id}`}
                        onClick={() => {
                          const targetId = activeChatId || activeConversation?.id;
                          if (!targetId) {
                            showToast("请先选择一个聊天会话");
                            return;
                          }
                          onSendMessage(
                            targetId,
                            `[活动] ${act.title}`,
                            {
                              type: "activity",
                              activityId: act.id,
                              activityData: act,
                            },
                            quotedMessage || undefined,
                          );
                          setQuotedMessage(null);
                          setIsActivityPickerOpen(false);
                          soundEffects.playWhooshSound();
                          haptics.trigger("medium");
                          showToast(`已发送「${act.title}」活动卡片 🎯`);
                        }}
                        className="p-3 bg-white dark:bg-[#18191A] border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] dark:hover:border-[#1877F2] rounded-md shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-2xs"
                            style={{ backgroundColor: `${themeColor}18` }}
                          >
                            {act.icon || "🎯"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[#1877F2] font-bold text-[11px]">
                                {act.date || "今天"} · {act.startTime || act.timeRange || "15:00"}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-medium">
                                {act.category === "sports" ? "运动" : act.category === "party" ? "聚会" : "探索"}
                              </span>
                            </div>
                            <h4 className="text-[13px] font-bold text-[#050505] dark:text-[#E4E6EB] truncate group-hover:text-[#1877F2] transition-colors mt-0.5">
                              {act.title}
                            </h4>
                            <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate flex items-center space-x-1 mt-0.5">
                              <MapPin size={11} className="shrink-0 text-gray-400" />
                              <span className="truncate">{act.locationName || act.address}</span>
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 ml-3">
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-md bg-[#1877F2] text-white text-xs font-bold shadow-2xs group-hover:bg-blue-600 transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <span>发送</span>
                            <Send size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* SHARE CONTACT CARD MODAL (发送名片卡片弹窗 - 聊天会话内即时展示)   */}
        {/* ================================================================= */}
        <ShareContactModal
          isOpen={isShareContactModalOpen}
          onClose={() => setIsShareContactModalOpen(false)}
          friends={friends}
          conversations={conversations}
          activeChatId={activeConversation.id || activeChatId}
          onSendContactCard={(contact, targetChatId) => {
            const finalChatId = targetChatId || activeConversation.id || activeChatId || (conversations[0]?.id || '');
            if (!finalChatId) {
              showToast("请进入具体的聊天会话后再发送名片 👤");
              return;
            }
            onSendMessage(
              finalChatId,
              `[名片] ${contact.name}`,
              {
                type: "contact",
                contactData: contact,
              }
            );
            soundEffects.playWhooshSound();
            haptics.trigger("success");
            const targetConv = conversations.find((c) => c.id === finalChatId || c.friendId === finalChatId);
            const targetConvName = targetConv?.friendName || activeConversation.friendName || '当前聊天';
            showToast(`已向「${targetConvName}」发送 ${contact.name} 的名片卡片 👤`);
            setIsShareContactModalOpen(false);
            requestAnimationFrame(() => {
              scrollToBottom("smooth");
            });
          }}
        />

        {/* ================================================================= */}
        {/* CONTACT CARD BRIEF INFO & ADD FRIEND MODAL (好友名片简要信息与加好友) */}
        {/* ================================================================= */}
        <ContactBriefModal
          isOpen={isBriefContactModalOpen}
          onClose={() => setIsBriefContactModalOpen(false)}
          contactData={selectedBriefContact}
          currentFriends={friends}
          onOpenProfile={(userId) => {
            if (onOpenFriendProfile && userId) {
              onOpenFriendProfile(userId);
            }
          }}
          onStartChat={(userId, userName) => {
            const existingConv = conversations.find((c) => c.id === userId || c.friendId === userId);
            if (existingConv) {
              onSelectChat(existingConv.id);
            } else {
              onSelectChat(userId);
            }
            setIsBriefContactModalOpen(false);
            showToast(`已进入与 ${userName || '联系人'} 的聊天 💬`);
          }}
          onNavigateToMap={(loc) => {
            if (onNavigateToMapLocation) {
              onNavigateToMapLocation(loc);
              showToast(`正在地图上锁定：${loc.name} 📍`);
            }
          }}
          showToast={showToast}
        />

        {/* ================================================================= */}
        {/* FULL-SCREEN IMAGE LIGHTBOX VIEWER MODAL                           */}
        {/* ================================================================= */}
        {lightboxImageUrl && (
          <div
            id="photo-lightbox-modal"
            onClick={() => setLightboxImageUrl(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-150 select-none"
          >
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
              <a
                href={lightboxImageUrl}
                download="photo.jpg"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors backdrop-blur-xs"
                title="保存原图"
              >
                <Download size={18} />
              </a>
              <button
                type="button"
                onClick={() => setLightboxImageUrl(null)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors backdrop-blur-xs"
                title="关闭预览"
              >
                <X size={20} />
              </button>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl max-h-[85vh] flex items-center justify-center relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src={lightboxImageUrl}
                alt="High Resolution Full View"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl animate-in zoom-in-95 duration-200"
              />
            </div>

            <div className="absolute bottom-6 bg-white/20 backdrop-blur-md text-white text-xs px-4 py-1.5 rounded-full">
              轻触任意空白区域退出预览
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* FORWARDING TARGET SELECTION MODAL (转发目标选择与循环发送弹窗)   */}
        {/* ================================================================= */}
        {forwardModalState.isOpen && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 overflow-hidden font-sans">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center">
                    <Forward size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#050505]">转发消息</h3>
                    <p className="text-[11px] text-gray-500">
                      包含 {forwardModalState.sourceMessages.length} 条所选消息
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForwardModalState((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mode Switcher Buttons: 逐条转发 vs 统一转发 */}
              <div className="mt-3 p-1 bg-gray-100 rounded-full flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setForwardModalState((prev) => ({
                      ...prev,
                      forwardMode: "itemized",
                    }))
                  }
                  className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                    forwardModalState.forwardMode === "itemized"
                      ? "bg-[#1877F2] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Forward size={13} />
                  <span>逐条转发</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForwardModalState((prev) => ({
                      ...prev,
                      forwardMode: "unified",
                    }))
                  }
                  className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                    forwardModalState.forwardMode === "unified"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Share2 size={13} />
                  <span>统一转发 (合并记录)</span>
                </button>
              </div>

              {/* Mode Explanation Banner */}
              <div className="mt-2 text-[11px] text-gray-500 bg-blue-50/60 p-2 rounded-xl border border-blue-100/80 shrink-0">
                {forwardModalState.forwardMode === "itemized" ? (
                  <span>逐条转发：将选中的每条消息作为独立的发言气泡依次循环发送给目标。</span>
                ) : (
                  <span>统一转发：将选中的多条消息合并压缩为 1 条【聊天记录】整体发送。</span>
                )}
              </div>

              {/* Selected Messages Preview Scrollbox */}
              <div className="mt-2 bg-gray-50 rounded-2xl p-2.5 max-h-24 overflow-y-auto space-y-1 text-xs border border-gray-100 shrink-0 custom-scrollbar">
                {forwardModalState.sourceMessages.map((m, idx) => (
                  <div key={`forward-msg-act-${m.id || idx}-${idx}`} className="text-gray-700 truncate text-[11px]">
                    <span className="font-bold text-[#050505]">
                      {m.senderName || (m.isMe ? "我" : "成员")}:
                    </span>{" "}
                    {m.text || (m.imageUrl ? "[图片]" : "[多媒体消息]")}
                  </div>
                ))}
              </div>

              {/* Target Contacts Selection List */}
              <div className="mt-3 flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <span className="text-xs font-bold text-[#050505]">
                    选择转发目标联系人 ({forwardModalState.selectedTargetChatIds.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = conversations.map((c) => c.id);
                      const isAllSelected =
                        forwardModalState.selectedTargetChatIds.length === allIds.length;
                      setForwardModalState((prev) => ({
                        ...prev,
                        selectedTargetChatIds: isAllSelected ? [] : allIds,
                      }));
                    }}
                    className="text-[11px] font-bold text-[#1877F2] hover:underline cursor-pointer"
                  >
                    {forwardModalState.selectedTargetChatIds.length === conversations.length
                      ? "取消全选"
                      : "全选"}
                  </button>
                </div>

                {/* Search Bar */}
                <div className="bg-gray-100 rounded-full px-3 py-1.5 flex items-center space-x-2 mb-2 shrink-0">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={forwardModalState.searchQuery}
                    onChange={(e) =>
                      setForwardModalState((prev) => ({
                        ...prev,
                        searchQuery: e.target.value,
                      }))
                    }
                    placeholder="搜索联系人或群聊..."
                    className="bg-transparent text-xs text-[#050505] outline-none flex-1 placeholder-gray-400 min-w-0"
                  />
                </div>

                {/* Contacts Scroll Area */}
                <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {conversations
                    .filter((c) =>
                      c.friendName
                        .toLowerCase()
                        .includes(forwardModalState.searchQuery.toLowerCase())
                    )
                    .map((conv, fIdx) => {
                      const isSelected = forwardModalState.selectedTargetChatIds.includes(
                        conv.id
                      );
                      return (
                        <div
                          key={`fwd-conv-act-${conv.id}-${fIdx}`}
                          onClick={() => {
                            setForwardModalState((prev) => ({
                              ...prev,
                              selectedTargetChatIds: isSelected
                                ? prev.selectedTargetChatIds.filter(
                                    (id) => id !== conv.id
                                  )
                                : [...prev.selectedTargetChatIds, conv.id],
                            }));
                          }}
                          className={`p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-blue-50/70 border-[#1877F2]/40 shadow-xs"
                              : "hover:bg-gray-50 border-transparent"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <img
                              src={conv.avatar}
                              alt={conv.friendName}
                              className="w-9 h-9 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-[#050505] truncate">
                                {conv.friendName}
                              </h4>
                              <p className="text-[10px] text-gray-500 truncate">
                                {conv.lastMessage || "最近有互动"}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                              isSelected
                                ? "bg-[#1877F2] border-[#1877F2] text-white"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setForwardModalState((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-600 transition-colors cursor-pointer"
                >
                  取消
                </button>

                <button
                  type="button"
                  disabled={
                    forwardModalState.selectedTargetChatIds.length === 0 ||
                    forwardModalState.sourceMessages.length === 0
                  }
                  onClick={handleConfirmForward}
                  className="px-5 py-2 rounded-full bg-[#1877F2] hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Send size={13} />
                  <span>
                    确认转发 ({forwardModalState.selectedTargetChatIds.length})
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Facebook Style Pure White Main Conversations Screen (Re-engineered Design)
  // =========================================================================
  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: `translateX(${containerDragOffset}px)`,
        transition:
          containerDragOffset === 0
            ? "transform 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.25)"
            : "none",
      }}
      className="absolute inset-0 bg-white dark:bg-black text-[#050505] dark:text-white flex flex-col select-none overflow-hidden font-sans touch-pan-y"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#050505]/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          {toastMessage}
        </div>
      )}

      {/* COLLAPSIBLE HEADER WRAPPER (Stories & Notes + Teams & Groups) */}
      <motion.div
        initial={false}
        animate={{
          height: isHeaderCollapsed ? 0 : 'auto',
          opacity: isHeaderCollapsed ? 0 : 1,
          y: isHeaderCollapsed ? -12 : 0,
        }}
        transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
        className={`overflow-hidden shrink-0 transition-opacity ${
          isHeaderCollapsed ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      >
        {/* 2. HORIZONTAL STORIES & NOTES SCROLL BAR */}
        <div className="pt-7 pb-3 px-4 bg-white dark:bg-black border-b border-[#E4E6EB]/70 dark:border-zinc-800 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-6 min-w-max py-1.5 pl-2.5">
            {/* ================================================================= */}
            {/* "我的便签/标签" (My Story Note) - User displays note bubble & label */}
            {/* ================================================================= */}
            <div
              id="my-story-note-item"
              className="flex flex-col items-center shrink-0 cursor-pointer group select-none"
              onClick={() => {
                if (onOpenNoteEditor) {
                  onOpenNoteEditor();
                } else {
                  setTempEmoji(attachedEmoji);
                  setTempText(userNote);
                  setTempTheme(noteTheme);
                  setTempMusic(noteMusic);
                  setTempLocationTag(noteLocationTag);
                  setTempGif(noteGif);
                  setTempAudience(noteAudience);
                  setActivePickerModal("none");
                  setIsEditingNote(true);
                }
              }}
              title="点击更新我的便签与状态气泡"
            >
              <div className="relative">
                {/* Floating Mini Speech Bubble on Avatar Edge */}
                {hasNoteBubble && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 max-w-[140px] animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                    <div
                      className={`px-2 py-0.5 rounded-full shadow-md flex items-center space-x-1 text-[10px] font-bold whitespace-nowrap ${
                        noteTheme === "pink"
                          ? "bg-gradient-to-r from-pink-500 via-purple-500 to-rose-400 text-white"
                          : noteTheme === "blue"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                            : noteTheme === "sunset"
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                              : "bg-white/95 backdrop-blur-md text-[#050505] border border-blue-200/80"
                      }`}
                    >
                      <span className="text-xs">{attachedEmoji}</span>
                      <span className="truncate max-w-[90px]">
                        {userNote ||
                          (noteMusic
                            ? `🎵 ${noteMusic}`
                            : "音乐不停，分享不止...")}
                      </span>
                    </div>
                    {/* Speech Bubble Pointer Triangle */}
                    <div
                      className={`w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4px] mx-auto -mt-px filter drop-shadow-2xs ${
                        noteTheme === "pink"
                          ? "border-t-pink-500"
                          : noteTheme === "blue"
                            ? "border-t-blue-500"
                            : noteTheme === "sunset"
                              ? "border-t-orange-500"
                              : "border-t-white"
                      }`}
                    />
                  </div>
                )}

                {/* User Avatar Circle */}
                <div className="w-15 h-15 rounded-full ring-2 ring-[#1877F2] p-0.5 bg-white shadow-xs group-hover:scale-105 transition-all">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                    alt="My Story Note"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                {/* Small Action Badge at bottom-right corner */}
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#1877F2] text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-2xs group-hover:scale-110 transition-transform">
                  <Plus size={12} className="stroke-[3]" />
                </div>
              </div>

              {/* Label below avatar */}
              <span className="text-[11px] font-bold text-[#050505] dark:text-zinc-200 group-hover:text-[#1877F2] mt-1.5 truncate text-center max-w-[76px] transition-colors">
                我的标签
              </span>
            </div>

            {/* ================================================================= */}
            {/* 用户添加的 Stellar 模块功能 (Stellar User-Added Modular Skills) */}
            {/* ================================================================= */}
            {installedSkills.map((skill, sIdx) => {
              let shortName = skill.displayName.split('(')[0].trim();
              if (skill.id === 'skill-course-management') shortName = '高校教学';
              else if (skill.id === 'skill-ebook') shortName = '电子书';
              else if (skill.id === 'skill-city-cost-of-living') shortName = '生活成本';
              else if (skill.id === 'skill-happy-family') shortName = '家庭看护';
              else if (skill.id === 'skill-gemini-spatial') shortName = 'Gemini AI';
              else if (skill.id === 'skill-office') shortName = 'Office 办公';
              else if (skill.id === 'skill-travel') shortName = '旅行计划';
              else if (skill.id === 'skill-events') shortName = '活动管家';
              else if (skill.id === 'skill-data-analyst') shortName = '数据分析';
              else if (skill.id === 'skill-codesandbox') shortName = '代码沙盒';
              else if (shortName.length > 5) shortName = shortName.slice(0, 5);

              const isFamilySkill = skill.id === 'skill-happy-family';

              return (
                <div
                  key={`installed-skill-${skill.id}-${sIdx}`}
                  onClick={() => {
                    if (skill.id === 'skill-course-management') {
                      if (onOpenCourseApp) {
                        onOpenCourseApp();
                      } else {
                        showToast(`打开【${skill.displayName}】高校教学应用 🎓`);
                      }
                    } else if (skill.id === 'skill-ebook') {
                      setIsEBookAppOpen(true);
                    } else if (skill.id === 'skill-city-cost-of-living') {
                      setIsCityCostAppOpen(true);
                    } else if (isFamilySkill) {
                      if (onOpenFamilyCare) {
                        onOpenFamilyCare();
                      } else if (onOpenFamilyModal) {
                        onOpenFamilyModal();
                      }
                    } else if (skill.id === 'skill-office') {
                      if (onOpenDocumentCenter) {
                        onOpenDocumentCenter();
                      } else {
                        setSelectedSkillForDetail(skill);
                      }
                    } else if (skill.id === 'skill-events') {
                      if (onOpenCalendar) {
                        onOpenCalendar();
                      } else {
                        setSelectedSkillForDetail(skill);
                      }
                    } else {
                      setSelectedSkillForDetail(skill);
                    }
                  }}
                  className="flex flex-col items-center shrink-0 cursor-pointer group select-none"
                  title={`点击进入【${skill.displayName}】模块`}
                >
                  <div className="relative">
                    <div
                      className={`w-15 h-15 rounded-full p-0.5 ring-2 transition-all overflow-hidden bg-white shadow-2xs ${
                        isFamilySkill
                          ? 'ring-amber-500'
                          : skill.isEnabled
                            ? 'ring-[#1877F2]'
                            : 'ring-gray-200'
                      }`}
                    >
                      {isFamilySkill && familyGroup?.members && familyGroup.members.length > 0 ? (
                        <FamilyAvatarCollage
                          members={familyGroup.members}
                          fallbackAvatar={familyGroup.avatarUrl || skill.authorAvatar}
                        />
                      ) : skill.authorAvatar ? (
                        <img
                          src={skill.authorAvatar}
                          alt={skill.displayName}
                          className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : skill.id === 'skill-course-management' ? (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                          <BookOpen size={24} />
                        </div>
                      ) : skill.id === 'skill-ebook' ? (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white">
                          <BookOpen size={24} />
                        </div>
                      ) : skill.id === 'skill-city-cost-of-living' ? (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                          <BarChart3 size={24} />
                        </div>
                      ) : skill.id === 'skill-gemini-spatial' ? (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white">
                          <Sparkles size={24} />
                        </div>
                      ) : skill.id === 'skill-office' ? (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white">
                          <Briefcase size={24} />
                        </div>
                      ) : skill.id === 'skill-travel' ? (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                          <Plane size={24} />
                        </div>
                      ) : skill.id === 'skill-events' ? (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white">
                          <Calendar size={24} />
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                          {skill.displayName.slice(0, 2)}
                        </div>
                      )}
                    </div>

                    {/* Family corner badge */}
                    {isFamilySkill && (
                      <span className="absolute -top-1 -left-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-2xs">
                        家庭
                      </span>
                    )}

                    {/* Specific module notification badges (通知分散到具体模块内容) */}
                    {isFamilySkill ? (
                      <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-[#FA383E] text-white text-[8.5px] font-black px-1 rounded-full border-2 border-white shadow-2xs flex items-center justify-center" title="2条家庭安全提醒">
                        2
                      </span>
                    ) : skill.id === 'skill-course-management' ? (
                      <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-[#FA383E] text-white text-[8.5px] font-black px-1 rounded-full border-2 border-white shadow-2xs flex items-center justify-center" title="3条教学考勤与教务通知">
                        3
                      </span>
                    ) : skill.id === 'skill-ebook' ? (
                      <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-[#FA383E] text-white text-[8.5px] font-black px-1 rounded-full border-2 border-white shadow-2xs flex items-center justify-center" title="1条课件更新通知">
                        1
                      </span>
                    ) : skill.id === 'skill-city-cost-of-living' ? (
                      <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-[#FA383E] text-white text-[8.5px] font-black px-1 rounded-full border-2 border-white shadow-2xs flex items-center justify-center" title="2条生活与账单提醒">
                        2
                      </span>
                    ) : null}

                    {/* Module running status dot */}
                    {skill.isEnabled && (
                      <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#10B981] rounded-full ring-2 ring-white" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-[#050505] dark:text-zinc-200 group-hover:text-[#1877F2] mt-1.5 truncate text-center max-w-[76px] transition-colors">
                    {shortName}
                  </span>
                </div>
              );
            })}

            {/* 添加 Stellar 模块快捷入口 */}
            <div
              onClick={() => {
                if (onOpenStellarTab) {
                  onOpenStellarTab();
                  showToast("已前往 Stellar 星图探索与添加更多功能模块 🚀");
                } else {
                  showToast("前往 Stellar 模块市场添加更多功能");
                }
              }}
              className="flex flex-col items-center shrink-0 cursor-pointer group select-none"
              title="前往 Stellar 添加更多功能模块"
            >
              <div className="relative">
                <div className="w-15 h-15 rounded-full border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50/90 dark:bg-zinc-900/90 flex items-center justify-center text-gray-400 dark:text-zinc-400 group-hover:border-[#1877F2] group-hover:bg-blue-50/50 dark:group-hover:bg-blue-950/40 group-hover:text-[#1877F2] transition-all shadow-2xs group-hover:scale-105">
                  <Plus size={24} className="stroke-[2.5]" />
                </div>
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white dark:border-zinc-900 shadow-2xs">
                  Stellar
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#65676B] dark:text-zinc-400 group-hover:text-[#1877F2] mt-1.5 truncate text-center max-w-[76px] transition-colors">
                添加模块
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2.5 DEDICATED TEAMS & GROUPS MODULE (小组独立模块: 适配黑色主题) */}
        {/* ================================================================= */}
        <div className="py-2.5 px-3 bg-white dark:bg-black border-b border-[#E4E6EB]/70 dark:border-zinc-800 shrink-0">
          {/* Module Header: Left "小组", Right "更多小组>" */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center space-x-1.5">
              <span className="text-[13px] font-bold text-[#050505] dark:text-white tracking-tight">
                小组
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#F0F2F5] dark:bg-zinc-800 text-[#65676B] dark:text-zinc-300 text-[10px] font-bold">
                {teamChats.length}
              </span>
              {/* 分散到具体模块内容：小组动态未读通知 */}
              <span className="px-1.5 py-0.2 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#FA383E] dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/40 text-[9.5px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FA383E] animate-pulse" />
                <span>7条动态</span>
              </span>
            </div>

            <button
              onClick={onOpenTeams}
              className="text-xs font-semibold text-[#1877F2] hover:text-[#166FE5] dark:text-[#409CFF] dark:hover:text-[#64B5F6] active:opacity-75 flex items-center transition-colors cursor-pointer"
              title="查看更多团队与小组"
            >
              <span>更多小组&gt;</span>
            </button>
          </div>

          {/* Horizontal Scrolling Team Cards - 刚好一个页面展示三个小组 */}
          <div className="w-full">
            <div className="grid grid-cols-3 gap-2 pb-0.5 w-full">
              {teamChats.slice(0, 3).map((team, tIdx) => (
                <div
                  key={`team-chat-${team.id}-${tIdx}`}
                  onClick={() => {
                    if (onOpenTeamWorkspace) {
                      onOpenTeamWorkspace(team.id);
                    } else {
                      onSelectChat(team.id);
                    }
                  }}
                  className="flex cursor-pointer group select-none relative w-full"
                  title={`点击进入 ${team.friendName} 协作工作台`}
                >
                  {/* 3 cards per screen width */}
                  <div className="relative w-full h-[72px] rounded-xl ring-1 ring-gray-200 dark:ring-zinc-800 group-hover:ring-[#1877F2] bg-white dark:bg-zinc-900 shadow-xs group-hover:scale-102 transition-all overflow-hidden flex flex-col justify-between">
                    <img
                      src={team.avatar}
                      alt={team.friendName}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />

                    {/* Top Name */}
                    <div className="relative z-10 w-full pt-1 pl-1.5 pr-4 text-[9.5px] font-bold text-white leading-tight drop-shadow-md truncate">
                      {team.friendName}
                    </div>

                    {/* Unread badge */}
                    {team.unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-3.5 h-3.5 px-0.5 bg-[#FA383E] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs z-20">
                        {team.unreadCount}
                      </span>
                    )}

                    {/* Bottom Overlapping Avatars */}
                    <div className="relative z-10 flex -space-x-1.5 px-1.5 pb-1">
                      {team.groupAvatars?.slice(0, 3).map((avatar, idx) => (
                        <img
                          key={`team-av-${team.id}-${idx}`}
                          src={avatar}
                          alt="member"
                          className="w-4 h-4 rounded-full ring-1 ring-white dark:ring-zinc-900 object-cover shadow-xs"
                        />
                      ))}
                      {(team.groupAvatars?.length || 0) > 3 && (
                        <div className="w-4 h-4 rounded-full ring-1 ring-white dark:ring-zinc-900 bg-gray-100 dark:bg-zinc-800 text-[#65676B] dark:text-zinc-300 text-[7.5px] font-bold flex items-center justify-center shadow-xs">
                          +{(team.groupAvatars?.length || 0) - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================================================================= */}
      {/* 5. FULLSCREEN "MY NOTE" CREATION MODAL (Matching IMG_5250 & IMG_5248) */}
      {/* ================================================================= */}
      {isEditingNote && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col justify-between select-none animate-in fade-in duration-150 overflow-hidden font-sans">
          {/* Top Bar: Close Button (Top-left '✕') */}
          <div className="px-4 py-3 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                setActivePickerModal("none");
                setIsEditingNote(false);
              }}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
              title="关闭"
            >
              <X size={20} className="stroke-[2.5]" />
            </button>

            <span className="text-xs font-semibold text-gray-400">
              新建便签
            </span>

            <div className="w-10 h-10" />
          </div>

          {/* Center Note Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 relative max-w-lg mx-auto w-full">
            {/* Note Speech Bubble and Avatar Assembly */}
            <div className="flex flex-col items-center relative mb-4">
              {/* Attached Emoji Bubble (Positioned at top-left of the speech bubble) */}
              <div className="relative mb-2">
                <div
                  onClick={() =>
                    setActivePickerModal(
                      activePickerModal === "emoji" ? "none" : "emoji",
                    )
                  }
                  className="absolute -top-3.5 -left-3.5 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-lg cursor-pointer hover:scale-110 active:scale-95 transition-all"
                  title="点击更改表情"
                >
                  {tempEmoji}
                </div>

                {/* Speech Bubble Container */}
                <div
                  className={`px-5 py-3 rounded-3xl shadow-lg relative max-w-[260px] text-center transition-all ${
                    tempTheme === "pink"
                      ? "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-400 text-white shadow-pink-200/50"
                      : tempTheme === "blue"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200/50"
                        : tempTheme === "sunset"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-200/50"
                          : "bg-white text-gray-900 border border-gray-200/80 shadow-md"
                  }`}
                >
                  <input
                    type="text"
                    value={tempText}
                    onChange={(e) => setTempText(e.target.value)}
                    placeholder="音乐不停，分享不止..."
                    className={`bg-transparent text-sm font-semibold outline-none text-center w-full placeholder-white/80 ${
                      tempTheme === "white"
                        ? "placeholder-gray-400 text-gray-900"
                        : "text-white"
                    }`}
                    maxLength={35}
                  />

                  {/* Speech Bubble Pointer Triangle */}
                  <div
                    className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mx-auto -mb-4 mt-2 filter drop-shadow-2xs ${
                      tempTheme === "pink"
                        ? "border-t-pink-500"
                        : tempTheme === "blue"
                          ? "border-t-blue-500"
                          : tempTheme === "sunset"
                            ? "border-t-orange-500"
                            : "border-t-white"
                    }`}
                  />
                </div>
              </div>

              {/* Large Avatar */}
              <div className="relative mt-2">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Color Palette Badge on bottom-right of avatar */}
                <button
                  type="button"
                  onClick={() => {
                    setActivePickerModal(
                      activePickerModal === "palette" ? "none" : "palette",
                    );
                  }}
                  className={`absolute bottom-0 right-0 w-9 h-9 rounded-full shadow-md border flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer ${
                    activePickerModal === "palette"
                      ? "bg-[#1877F2] text-white border-[#1877F2] ring-2 ring-blue-300"
                      : "bg-white border-gray-200 text-[#1877F2]"
                  }`}
                  title="点击展开发言气泡与便签调色盘"
                >
                  <Palette size={18} className={activePickerModal === "palette" ? "text-white" : "text-[#1877F2]"} />
                </button>
              </div>
            </div>

            {/* Selected Tags / Badges (Music, Location, Sticker) */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {tempLocationTag ? (
                <div className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full flex items-center space-x-1.5 text-xs font-semibold text-gray-800 transition-colors">
                  <MapPin size={13} className="text-rose-500" />
                  <span
                    onClick={() => setActivePickerModal("location")}
                    className="cursor-pointer"
                  >
                    {tempLocationTag}
                  </span>
                  <button
                    onClick={() => setTempLocationTag(null)}
                    className="text-gray-400 hover:text-gray-700 ml-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : null}

              {tempMusic ? (
                <div className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full flex items-center space-x-1.5 text-xs font-semibold text-gray-800 transition-colors">
                  <Music size={13} className="text-blue-500" />
                  <span
                    onClick={() => setActivePickerModal("music")}
                    className="cursor-pointer"
                  >
                    {tempMusic}
                  </span>
                  <button
                    onClick={() => setTempMusic(null)}
                    className="text-gray-400 hover:text-gray-700 ml-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : null}

              {tempGif ? (
                <div className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full flex items-center space-x-1.5 text-xs font-semibold text-gray-800 transition-colors">
                  <span className="text-[10px] font-black bg-purple-100 text-purple-600 px-1 rounded">
                    GIF
                  </span>
                  <span>{tempGif}</span>
                  <button
                    onClick={() => setTempGif(null)}
                    className="text-gray-400 hover:text-gray-700 ml-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : null}
            </div>

            {/* Circular Feature Action Buttons: 🎨 (Palette), 🎵 (Music), 📍 (Location), GIF (Stickers) */}
            <div className="flex items-center space-x-3.5 mt-4">
              <button
                type="button"
                onClick={() =>
                  setActivePickerModal(
                    activePickerModal === "palette" ? "none" : "palette",
                  )
                }
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  activePickerModal === "palette"
                    ? "bg-blue-50 text-[#1877F2] ring-2 ring-[#1877F2]"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="选择发言气泡与便签配色"
              >
                <Palette size={18} />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActivePickerModal(
                    activePickerModal === "music" ? "none" : "music",
                  )
                }
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  tempMusic
                    ? "bg-blue-50 text-[#1877F2] ring-2 ring-[#1877F2]"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="添加背景音乐"
              >
                <Music size={18} />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActivePickerModal(
                    activePickerModal === "location" ? "none" : "location",
                  )
                }
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  tempLocationTag
                    ? "bg-rose-50 text-rose-600 ring-2 ring-rose-500"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="添加定位"
              >
                <MapPin size={18} />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActivePickerModal(
                    activePickerModal === "gif" ? "none" : "gif",
                  )
                }
                className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer shadow-xs ${
                  tempGif
                    ? "bg-purple-50 text-purple-600 ring-2 ring-purple-500"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title="添加动态贴纸"
              >
                GIF
              </button>
            </div>

            {/* Helper Subtext */}
            <p className="text-xs text-gray-400 text-center mt-4">
              你的便签将在这个位置以及收件箱顶部显示 24 小时。
            </p>
          </div>

          {/* Interactive Popover Picker Sheets */}
          {activePickerModal !== "none" && (
            <div className="bg-gray-50 border-t border-gray-200 p-4 max-h-64 overflow-y-auto animate-in slide-in-from-bottom duration-150 shrink-0">
              {/* Palette Color Family & Gradient Picker Sheet */}
              {activePickerModal === "palette" && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                      <Palette size={15} className="text-[#1877F2]" />
                      <span>选择发言气泡与便签配色 (分色系模块)</span>
                    </span>
                    <button
                      onClick={() => setActivePickerModal("none")}
                      className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer font-bold"
                    >
                      完成
                    </button>
                  </div>

                  {/* Color Family Tabs (色系模块) */}
                  <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2 mb-2.5">
                    {COLOR_FAMILIES.map((family, famIdx) => (
                      <button
                        key={`fam-${family.id}-${famIdx}`}
                        onClick={() => setSelectedColorFamily(family.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center space-x-1 ${
                          selectedColorFamily === family.id
                            ? "bg-[#1877F2] text-white shadow-xs"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <span>{family.icon}</span>
                        <span>{family.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Gradient Choices Grid under selected Color Family */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {COLOR_FAMILIES.find((f) => f.id === selectedColorFamily)?.gradients.map((grad, gradIdx) => {
                      const isSelected = userBubbleGradient === grad.gradientClass;
                      return (
                        <button
                          key={`grad-${grad.id}-${gradIdx}`}
                          onClick={() => {
                            setUserBubbleGradient(grad.gradientClass);
                            setTempTheme(grad.noteTheme);
                            localStorage.setItem("chat_user_bubble_gradient", grad.gradientClass);
                            showToast(`已应用发言气泡配色：${grad.name} 🎨`);
                          }}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                            isSelected
                              ? "border-[#1877F2] bg-blue-50/80 shadow-xs ring-2 ring-blue-500/30"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          {/* Live Cartoon Speech Bubble Mini Preview */}
                          <div className="flex items-center justify-end mb-1">
                            <div
                              className={`px-3 py-1 rounded-[14px] rounded-br-[2px] text-[10px] font-bold shadow-xs ${grad.gradientClass}`}
                            >
                              {grad.name} 气泡
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-bold text-gray-800">{grad.name}</span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center">
                                <Check size={10} className="stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Emoji Picker */}
              {activePickerModal === "emoji" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">
                      选择便签表情
                    </span>
                    <button
                      onClick={() => setActivePickerModal("none")}
                      className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      完成
                    </button>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {EMOJI_OPTIONS.map((em, idx) => (
                      <button
                        key={`emoji-opt-${em}-${idx}`}
                        onClick={() => {
                          setTempEmoji(em);
                          setActivePickerModal("none");
                        }}
                        className="h-10 rounded-xl bg-white text-xl flex items-center justify-center hover:scale-110 active:scale-95 shadow-xs border border-gray-100 cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Music Picker */}
              {activePickerModal === "music" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">
                      选择便签音乐
                    </span>
                    <button
                      onClick={() => setActivePickerModal("none")}
                      className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      关闭
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MUSIC_OPTIONS.map((m, mIdx) => (
                      <button
                        key={`music-opt-${m.id}-${mIdx}`}
                        onClick={() => {
                          setTempMusic(m.title);
                          setActivePickerModal("none");
                        }}
                        className={`p-2.5 rounded-xl text-left flex items-center justify-between border cursor-pointer ${
                          tempMusic === m.title
                            ? "bg-blue-50 border-blue-300 text-[#1877F2]"
                            : "bg-white border-gray-100 hover:bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Music size={14} />
                          <span className="text-xs font-semibold">
                            {m.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {m.duration}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Picker */}
              {activePickerModal === "location" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">
                      选择便签定位
                    </span>
                    <button
                      onClick={() => setActivePickerModal("none")}
                      className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      关闭
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LOCATION_PRESETS.map((loc, idx) => (
                      <button
                        key={`loc-preset-${loc}-${idx}`}
                        onClick={() => {
                          setTempLocationTag(loc);
                          setActivePickerModal("none");
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer ${
                          tempLocationTag === loc
                            ? "bg-rose-500 text-white border-rose-500"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        📍 {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* GIF Picker */}
              {activePickerModal === "gif" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">
                      选择动态贴纸
                    </span>
                    <button
                      onClick={() => setActivePickerModal("none")}
                      className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      关闭
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GIF_OPTIONS.map((g, gIdx) => (
                      <button
                        key={`gif-opt-${g.id}-${gIdx}`}
                        onClick={() => {
                          setTempGif(g.label);
                          setActivePickerModal("none");
                        }}
                        className={`p-2 rounded-xl text-left border cursor-pointer ${
                          tempGif === g.label
                            ? "bg-purple-50 border-purple-300 text-purple-700"
                            : "bg-white border-gray-100 hover:bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-xs font-bold">{g.label}</p>
                        <p className="text-[10px] text-gray-400">{g.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Audience Picker */}
              {activePickerModal === "audience" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">
                      选择便签可见范围
                    </span>
                    <button
                      onClick={() => setActivePickerModal("none")}
                      className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      完成
                    </button>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setTempAudience("friends");
                        setActivePickerModal("none");
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer ${
                        tempAudience === "friends"
                          ? "bg-blue-50 text-[#1877F2]"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Users size={15} />
                        <span>与好友分享 (全部好友可见)</span>
                      </div>
                      {tempAudience === "friends" && <Check size={14} />}
                    </button>

                    <button
                      onClick={() => {
                        setTempAudience("close");
                        setActivePickerModal("none");
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer ${
                        tempAudience === "close"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Sparkles size={15} />
                        <span>与密友分享 (仅特别关注好友)</span>
                      </div>
                      {tempAudience === "close" && <Check size={14} />}
                    </button>

                    <button
                      onClick={() => {
                        setTempAudience("private");
                        setActivePickerModal("none");
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer ${
                        tempAudience === "private"
                          ? "bg-gray-200 text-gray-900"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Lock size={15} />
                        <span>仅自己可见</span>
                      </div>
                      {tempAudience === "private" && <Check size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Controls & Action Bar */}
          <div className="shrink-0 bg-white border-t border-gray-100">
            {/* Audience & Share Row */}
            <div className="px-4 py-2.5 flex items-center justify-between bg-white border-b border-gray-100">
              <button
                type="button"
                onClick={() =>
                  setActivePickerModal(
                    activePickerModal === "audience" ? "none" : "audience",
                  )
                }
                className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 cursor-pointer py-1 px-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Users size={14} className="text-gray-500" />
                <span>
                  {tempAudience === "friends"
                    ? "与好友分享"
                    : tempAudience === "close"
                      ? "与密友分享"
                      : "仅自己可见"}
                </span>
                <ChevronRight size={14} className="text-gray-400" />
              </button>

              <button
                id="share-note-btn"
                type="button"
                onClick={handlePublishNote}
                className="px-6 py-2 bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-xs font-bold text-white rounded-full shadow-md transition-all cursor-pointer"
              >
                分享
              </button>
            </div>

            {/* Mobile Keyboard Top Toolbar */}
            <div className="px-4 py-2 bg-[#F6F7F9] flex items-center justify-between border-b border-gray-200/80 text-gray-600">
              <button
                type="button"
                onClick={() => setTempText(QUICK_PHRASES[0])}
                className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center font-bold text-sm"
                title="P"
              >
                P
              </button>
              <button
                type="button"
                onClick={() =>
                  setTempText(
                    QUICK_PHRASES[
                      Math.floor(Math.random() * QUICK_PHRASES.length)
                    ],
                  )
                }
                className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center font-bold text-xs"
                title="灵感短句"
              >
                Aa
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard
                    ?.readText?.()
                    .then((t) => t && setTempText((prev) => prev + t));
                  showToast("已从剪贴板粘贴");
                }}
                className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                title="剪贴板"
              >
                <FileText size={16} />
              </button>
              <button
                type="button"
                onClick={() => showToast("语音输入就绪")}
                className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                title="语音"
              >
                <Mic size={16} />
              </button>
              <button
                type="button"
                onClick={() => showToast("图片识别已就绪")}
                className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                title="相册"
              >
                <ImageIcon size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsKeyboardLangZh(!isKeyboardLangZh)}
                className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center text-xs font-bold"
                title="语言切换"
              >
                {isKeyboardLangZh ? "文/A" : "A/文"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setActivePickerModal(
                    activePickerModal === "emoji" ? "none" : "emoji",
                  )
                }
                className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center text-gray-700"
                title="Emoji"
              >
                <Smile size={18} />
              </button>
            </div>

            {/* Realistic Interactive Mobile Keyboard */}
            <div className="bg-[#D1D5DB]/70 p-1.5 pb-4 space-y-1.5">
              {/* Row 1 */}
              <div className="flex justify-center space-x-1">
                {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map(
                  (k) => (
                    <button
                      key={`kb-r1-${k}`}
                      type="button"
                      onClick={() => handleVirtualKeyPress(k)}
                      className="flex-1 h-10 bg-white rounded-lg shadow-sm text-sm font-semibold text-gray-900 active:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      {isKeyboardShift ? k : k.toLowerCase()}
                    </button>
                  ),
                )}
              </div>

              {/* Row 2 */}
              <div className="flex justify-center space-x-1 px-3">
                {["A", "S", "D", "F", "G", "H", "J", "K", "L"].map((k) => (
                  <button
                    key={`kb-r2-${k}`}
                    type="button"
                    onClick={() => handleVirtualKeyPress(k)}
                    className="flex-1 h-10 bg-white rounded-lg shadow-sm text-sm font-semibold text-gray-900 active:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    {isKeyboardShift ? k : k.toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Row 3 (Shift, Z-M, Backspace) */}
              <div className="flex justify-center space-x-1">
                <button
                  type="button"
                  onClick={() => setIsKeyboardShift(!isKeyboardShift)}
                  className={`w-11 h-10 rounded-lg shadow-sm flex items-center justify-center font-bold text-xs ${
                    isKeyboardShift
                      ? "bg-white text-[#1877F2]"
                      : "bg-[#AEB3BE] text-gray-800"
                  }`}
                >
                  ⇧
                </button>
                {["Z", "X", "C", "V", "B", "N", "M"].map((k) => (
                  <button
                    key={`kb-r3-${k}`}
                    type="button"
                    onClick={() => handleVirtualKeyPress(k)}
                    className="flex-1 h-10 bg-white rounded-lg shadow-sm text-sm font-semibold text-gray-900 active:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    {isKeyboardShift ? k : k.toLowerCase()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleVirtualBackspace}
                  className="w-11 h-10 bg-[#AEB3BE] rounded-lg shadow-sm flex items-center justify-center text-gray-800 active:bg-gray-400 transition-colors"
                >
                  ⌫
                </button>
              </div>

              {/* Row 4 (123, Emoji, Space, Lang, Return) */}
              <div className="flex justify-center space-x-1">
                <button
                  type="button"
                  onClick={() => setIsKeyboard123(!isKeyboard123)}
                  className="w-10 h-10 bg-[#AEB3BE] rounded-lg shadow-sm flex items-center justify-center text-xs font-bold text-gray-800"
                >
                  123
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActivePickerModal(
                      activePickerModal === "emoji" ? "none" : "emoji",
                    )
                  }
                  className="w-10 h-10 bg-[#AEB3BE] rounded-lg shadow-sm flex items-center justify-center text-gray-800"
                >
                  <Smile size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleVirtualSpace}
                  className="flex-1 h-10 bg-white rounded-lg shadow-sm text-xs font-medium text-gray-500 flex items-center justify-center active:bg-gray-200"
                >
                  空格
                </button>
                <button
                  type="button"
                  onClick={() => setIsKeyboardLangZh(!isKeyboardLangZh)}
                  className="w-10 h-10 bg-[#AEB3BE] rounded-lg shadow-sm flex items-center justify-center text-xs font-bold text-gray-800"
                >
                  {isKeyboardLangZh ? "中" : "英"}
                </button>
                <button
                  type="button"
                  onClick={handlePublishNote}
                  className="w-14 h-10 bg-[#1877F2] text-white rounded-lg shadow-sm flex items-center justify-center text-xs font-bold active:bg-blue-700"
                >
                  换行
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FILTER TABS & THREE-DOT ACTION MENU */}
      <div className="px-3.5 py-2 bg-white dark:bg-black border-b border-[#E4E6EB]/60 dark:border-zinc-800 flex items-center justify-between shrink-0 relative">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsContactsDrawerOpen(true)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              isContactsDrawerOpen
                ? "bg-[#1877F2] text-white shadow-xs"
                : "bg-[#F0F2F5] dark:bg-zinc-800/80 text-[#65676B] dark:text-zinc-300 hover:bg-[#E4E6EB] dark:hover:bg-zinc-700"
            }`}
            title="点击打开通讯录"
          >
            <UserCheck size={13} />
            <span>通讯录</span>
          </button>
        </div>

        {/* Right Actions: Quick Refresh & Three-Dot More Actions Menu */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => triggerRefresh()}
            disabled={isRefreshing}
            className="w-8 h-8 rounded-full hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 active:scale-95 flex items-center justify-center text-[#65676B] dark:text-zinc-400 hover:text-[#1877F2] transition-colors cursor-pointer"
            title="刷新聊天列表"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-[#1877F2]" : ""} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMoreActions((prev) => !prev)}
              className="w-8 h-8 rounded-full hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 active:scale-95 flex items-center justify-center text-[#65676B] dark:text-zinc-400 hover:text-[#050505] dark:hover:text-white transition-colors cursor-pointer"
              title="更多管理选项"
            >
              <MoreVertical size={18} />
            </button>

            {/* Dropdown Menu */}
            {showMoreActions && (
              <div
                className="absolute right-0 top-10 w-44 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-[#E4E6EB] dark:border-zinc-800 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowMoreActions(false)}
              >
                <button
                  onClick={() => triggerRefresh()}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#050505] hover:bg-[#F0F2F5] flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <RefreshCw size={14} className={`text-[#1877F2] ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>刷新聊天列表</span>
                </button>
                <button
                  onClick={() => showToast("已将所有未读会话标记为已读")}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#050505] hover:bg-[#F0F2F5] flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <UserCheck size={14} className="text-[#1877F2]" />
                  <span>标记未读</span>
                </button>
                <button
                  onClick={() => showToast("已将会话归档")}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#050505] hover:bg-[#F0F2F5] flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <Bookmark size={14} className="text-amber-500" />
                  <span>归档会话</span>
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={() => showToast("已清理会话缓存")}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <Trash2 size={14} />
                  <span>删除记录</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. MAIN CONVERSATIONS LIST (Aggregated Avatars for Group Chats, Square for Teams) */}
      <div
        ref={conversationListRef}
        className="flex-1 overflow-y-auto divide-y divide-[#E4E6EB]/50 dark:divide-zinc-800 bg-white dark:bg-black overscroll-contain relative select-none"
        onClick={() => setShowMoreActions(false)}
        onTouchStart={handleListTouchStart}
        onTouchMove={handleListTouchMove}
        onTouchEnd={handleListTouchEnd}
        onTouchCancel={handleListTouchEnd}
        onMouseDown={handleListMouseDown}
        onMouseMove={handleListMouseMove}
        onMouseUp={handleListMouseUp}
        onMouseLeave={handleListMouseUp}
        onWheel={handleListWheel}
        onScroll={(e) => {
          if (activeActionMenu) setActiveActionMenu(null);
          if (activeEmojiPicker) setActiveEmojiPicker(null);
          const currentScrollTop = e.currentTarget.scrollTop;
          if (currentScrollTop > lastScrollTopRef.current && currentScrollTop > 10) {
            setIsHeaderCollapsed(true);
          } else if (currentScrollTop <= 6 || (lastScrollTopRef.current - currentScrollTop > 20)) {
            setIsHeaderCollapsed(false);
          }
          lastScrollTopRef.current = currentScrollTop;
        }}
      >
        {/* Pull-to-Refresh Indicator Banner */}
        <div
          style={{
            height: isRefreshing ? 48 : pullDistance,
            opacity: pullDistance > 4 || isRefreshing ? 1 : 0,
            transition: isPulling ? "none" : "height 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease",
          }}
          className="overflow-hidden flex items-center justify-center bg-[#F7F8FA] border-b border-[#E4E6EB]/60 shrink-0 select-none"
        >
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#65676B] py-1.5 px-3.5 bg-white border border-[#E4E6EB] rounded-md shadow-2xs">
            {isRefreshing ? (
              <>
                {refreshStatus === "success" ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-emerald-600 font-bold">聊天列表已刷新，已是最新</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="text-[#1877F2] animate-spin" />
                    <span className="text-[#1877F2] font-bold">正在同步最新会话与消息...</span>
                  </>
                )}
              </>
            ) : pullDistance >= 50 ? (
              <>
                <ArrowDown size={14} className="text-[#1877F2] transition-transform duration-200 rotate-180" />
                <span className="text-[#1877F2] font-bold">释放立即刷新聊天列表</span>
              </>
            ) : (
              <>
                <ArrowDown
                  size={14}
                  className="text-[#65676B] transition-transform duration-150"
                  style={{ transform: `rotate(${Math.min(180, (pullDistance / 50) * 180)}deg)` }}
                />
                <span>下滑继续刷新聊天列表</span>
              </>
            )}
          </div>
        </div>
        {filteredConversations.map((conv, cIdx) => {
          const isTeam = conv.isTeam || conv.friendName.includes("小组");
          const isGroup = conv.id.startsWith("cg") || conv.isGroup;
          const isPinned = pinnedChatIds.includes(conv.id);
          const is1v1 = !isTeam && !isGroup;
          const isSwiped = swipedChatId === conv.id;

          return (
            <div
              key={`conv-list-${conv.id}-${cIdx}`}
              className="relative overflow-hidden w-full border-b border-[#E4E6EB]/50"
              onTouchStart={(e) => {
                setTouchStartX(e.touches[0].clientX);
              }}
              onTouchMove={(e) => {
                if (touchStartX === null) return;
                const deltaX = e.touches[0].clientX - touchStartX;
                if (deltaX < -30) {
                  setSwipedChatId(conv.id);
                } else if (deltaX > 30) {
                  setSwipedChatId(null);
                }
              }}
              onTouchEnd={() => setTouchStartX(null)}
            >
              {/* Swipe Action Background Buttons */}
              <div
                className={`absolute top-0 right-0 h-full flex items-center z-20 transition-opacity duration-150 ${
                  isSwiped ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const now = Date.now();
                    if (now - lastSwipeActionTimeRef.current < 350) return;
                    lastSwipeActionTimeRef.current = now;
                    if (onToggleUnreadConversation) {
                      onToggleUnreadConversation(conv.id);
                    } else {
                      showToast(conv.unreadCount > 0 ? "已标记为已读" : "标记为未读");
                    }
                    setSwipedChatId(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const now = Date.now();
                    if (now - lastSwipeActionTimeRef.current < 350) return;
                    lastSwipeActionTimeRef.current = now;
                    if (onToggleUnreadConversation) {
                      onToggleUnreadConversation(conv.id);
                    } else {
                      showToast(conv.unreadCount > 0 ? "已标记为已读" : "标记为未读");
                    }
                    setSwipedChatId(null);
                  }}
                  className="w-16 h-full bg-[#1877F2] hover:bg-blue-600 flex flex-col items-center justify-center text-white cursor-pointer active:bg-blue-700 transition-colors shrink-0 shadow-inner"
                  title="未读/已读"
                >
                  <MessageCircle size={20} />
                  <span className="text-[10px] font-bold mt-1">
                    {conv.unreadCount > 0 ? "已读" : "未读"}
                  </span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const now = Date.now();
                    if (now - lastSwipeActionTimeRef.current < 350) return;
                    lastSwipeActionTimeRef.current = now;
                    if (onDeleteConversation) {
                      onDeleteConversation(conv.id);
                    } else {
                      showToast("已删除该聊天 🗑️");
                    }
                    setSwipedChatId(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const now = Date.now();
                    if (now - lastSwipeActionTimeRef.current < 350) return;
                    lastSwipeActionTimeRef.current = now;
                    if (onDeleteConversation) {
                      onDeleteConversation(conv.id);
                    } else {
                      showToast("已删除该聊天 🗑️");
                    }
                    setSwipedChatId(null);
                  }}
                  className="w-16 h-full bg-rose-500 hover:bg-rose-600 flex flex-col items-center justify-center text-white cursor-pointer active:bg-rose-700 transition-colors shrink-0 shadow-inner"
                  title="删除聊天"
                >
                  <Trash2 size={20} />
                  <span className="text-[10px] font-bold mt-1">删除</span>
                </button>
              </div>

              <div
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  handleStartLongPress(conv.id, touch.clientX, touch.clientY);
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  handleMoveLongPress(touch.clientX, touch.clientY);
                }}
                onTouchEnd={handleEndLongPress}
                onTouchCancel={handleEndLongPress}
                onMouseDown={(e) => {
                  if (e.button !== 0) return;
                  const target = e.target as HTMLElement;
                  if (target.closest("button, a, input, select, textarea")) return;
                  handleStartLongPress(conv.id, e.clientX, e.clientY);
                }}
                onMouseMove={(e) => {
                  handleMoveLongPress(e.clientX, e.clientY);
                }}
                onMouseUp={handleEndLongPress}
                onMouseLeave={handleEndLongPress}
                onClick={() => {
                  if (isConvLongPressTriggeredRef.current) {
                    setTimeout(() => {
                      isConvLongPressTriggeredRef.current = false;
                    }, 200);
                    return;
                  }
                  if (chatActionMenuId) setChatActionMenuId(null);
                  else if (isSwiped) setSwipedChatId(null);
                  else if (isTeam && onOpenTeamWorkspace) onOpenTeamWorkspace(conv.id);
                  else onSelectChat(conv.id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setChatActionMenuId(
                    chatActionMenuId === conv.id ? null : conv.id,
                  );
                }}
                className={`p-3.5 transition-all duration-200 flex items-center space-x-3.5 cursor-pointer group relative select-none ${
                  isSwiped ? "-translate-x-32" : "translate-x-0"
                } ${
                  pressingChatId === conv.id
                    ? "scale-[0.985] bg-blue-100/60 dark:bg-blue-900/60"
                    : isPinned
                    ? "bg-[#F0F7FF] hover:bg-[#E7F3FF] dark:bg-blue-950/40 dark:hover:bg-blue-900/40"
                    : "bg-white dark:bg-black hover:bg-[#F0F2F5] dark:hover:bg-zinc-900"
                }`}
              >
                {/* Chat Item Context Menu for Pin / Unpin */}
                {chatActionMenuId === conv.id && (
                  <div className="absolute right-4 top-12 z-40 bg-white rounded-md shadow-xl border border-[#E4E6EB] py-1.5 w-32 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePinConversation(conv.id);
                        setChatActionMenuId(null);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-[#050505] hover:bg-blue-50 hover:text-[#1877F2] flex items-center space-x-2 cursor-pointer"
                    >
                      <Pin size={13} className={isPinned ? "fill-[#1877F2] text-[#1877F2]" : ""} />
                      <span>{isPinned ? "取消置顶" : "置顶聊天"}</span>
                    </button>
                  </div>
                )}

                {/* Avatar: Aggregated Circle for Groups, Square for Teams, Circle for Friends */}
                <div
                  className="relative shrink-0"
                  onClick={(e) => {
                    if (!isGroup && !isTeam && onOpenFriendProfile) {
                      e.stopPropagation();
                      onOpenFriendProfile(conv.friendId);
                    }
                  }}
                  title={
                    isTeam ? "小组" : isGroup ? "群聊" : "点击查看好友主页"
                  }
                >
                  {renderAggregatedAvatar(conv, "w-11 h-11")}

                  {isTeam ? (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white rounded-md ring-1.5 ring-white flex items-center justify-center shadow-2xs">
                      <Users size={9} />
                    </span>
                  ) : isGroup ? (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#1877F2] text-white rounded-full ring-1.5 ring-white flex items-center justify-center shadow-2xs">
                      <Users size={9} />
                    </span>
                  ) : conv.isCloseFriend ? (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-rose-500 text-white rounded-full ring-1.5 ring-white flex items-center justify-center shadow-xs" title="密友">
                      <Heart size={10} className="fill-white text-white" />
                    </span>
                  ) : (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-1.5 ring-white" />
                  )}

                  {/* 红色小圆点：根据 unreadCount 显示，若未读数为 0 则不显示 */}
                  {conv.unreadCount > 0 && (
                    <span
                      id={`unread-dot-avatar-${conv.id}`}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-[#FA383E] rounded-full ring-2 ring-white shadow-xs z-10 pointer-events-none animate-in fade-in zoom-in-75 duration-150"
                      title={`未读: ${conv.unreadCount}`}
                    />
                  )}
                </div>

                {/* Chat info preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#050505] dark:text-white truncate flex items-center space-x-1.5">
                      {isPinned && (
                        <span className="inline-flex items-center space-x-0.5 text-[10px] text-[#1877F2] bg-blue-100/70 border border-[#1877F2]/30 px-1.5 py-0.5 rounded font-bold shrink-0 shadow-2xs">
                          <Pin
                            size={10}
                            className="fill-[#1877F2] text-[#1877F2]"
                          />
                          <span>置顶</span>
                        </span>
                      )}
                      <span>{conv.friendName}</span>
                      {isTeam ? (
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold shrink-0">
                          小组
                        </span>
                      ) : isGroup ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold shrink-0">
                          群聊
                        </span>
                      ) : null}
                    </h4>
                    <span className="text-[10px] text-[#65676B] font-medium shrink-0 pl-1">
                      {conv.time}
                    </span>
                  </div>
                  <p className="text-xs text-[#65676B] truncate mt-1 group-hover:text-[#050505] leading-relaxed">
                    {conv.lastMessage}
                  </p>
                </div>

                {/* 红色小圆点及未读数字：若未读数为 0 则不显示 */}
                {conv.unreadCount > 0 && (
                  <div
                    id={`unread-badge-${conv.id}`}
                    className="flex items-center space-x-1.5 shrink-0"
                  >
                    <span
                      className="w-2.5 h-2.5 bg-[#FA383E] rounded-full shadow-2xs shrink-0"
                      title={`未读: ${conv.unreadCount}`}
                    />
                    <span className="min-w-[18px] h-[18px] px-1 bg-[#FA383E] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 shadow-xs">
                      {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredConversations.length === 0 && (
          <div className="py-16 text-center text-[#65676B] flex flex-col items-center justify-center">
            <Search size={32} className="text-gray-300 mb-2" />
            <p className="text-xs font-semibold">没有找到符合条件的聊天记录</p>
          </div>
        )}
      </div>

      {/* Hidden File Inputs for Real Effective Attachment Uploads */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoFileChange}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoFileChange}
      />
      <input
        type="file"
        ref={docInputRef}
        accept="*/*"
        className="hidden"
        onChange={handleDocFileChange}
      />

      {/* ================================================================= */}
      {/* CONTACTS CARD DRAWER (从底部上滑出来的通讯录卡片) */}
      {/* ================================================================= */}
      {isContactsDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200"
          onClick={() => setIsContactsDrawerOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl max-h-[85vh] h-[80vh] flex flex-col shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Drag Handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full my-2.5 mx-auto shrink-0" />

            {/* Header */}
            <div className="px-4 pb-2 border-b border-[#E4E6EB] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center font-bold">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#050505]">通讯录</h3>
                  <p className="text-[11px] text-[#65676B] font-medium">
                    共 {conversations.filter((c) => !c.isGroup && !c.id.startsWith("cg") && !c.isTeam).length} 位联系人好友
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsContactsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-[#65676B] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Top Search Bar */}
            <div className="p-3 bg-[#F0F2F5]/60 border-b border-[#E4E6EB]/60 shrink-0">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3 text-[#65676B]" />
                <input
                  type="text"
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  placeholder="搜索通讯录好友名称或拼音..."
                  className="w-full bg-white pl-9 pr-8 py-2 rounded-full text-xs font-medium text-[#050505] placeholder-[#65676B] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/40 shadow-2xs"
                />
                {contactSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setContactSearchQuery("")}
                    className="absolute right-2.5 w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-400"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>

            {/* Main Contacts List + Right Alphabetical A-Z Index Bar */}
            <div className="flex-1 min-h-0 relative flex">
              {/* Left Contacts List */}
              <div className="flex-1 overflow-y-auto pr-8 pl-4 py-2 space-y-4">
                {(() => {
                  const contacts1v1 = conversations.filter(
                    (c) => !c.isGroup && !c.id.startsWith("cg") && !c.isTeam
                  );

                  const filtered = contacts1v1.filter((c) => {
                    if (!contactSearchQuery.trim()) return true;
                    const q = contactSearchQuery.toLowerCase();
                    return (
                      c.friendName.toLowerCase().includes(q) ||
                      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 text-center text-[#65676B] text-xs">
                        未找到匹配“{contactSearchQuery}”的联系人
                      </div>
                    );
                  }

                  // Group by alphabet letter
                  const letterGroups: { [letter: string]: typeof filtered } = {};

                  filtered.forEach((item) => {
                    const name = item.friendName;
                    let letter = "#";
                    if (name.includes("Alex") || name.startsWith("A")) letter = "A";
                    else if (name.includes("David") || name.startsWith("D")) letter = "D";
                    else if (name.includes("Elena") || name.startsWith("E")) letter = "E";
                    else if (name.includes("Lucas") || name.startsWith("L")) letter = "L";
                    else if (name.includes("Mia") || name.startsWith("M")) letter = "M";
                    else if (name.includes("Sarah") || name.includes("薛梦") || name.startsWith("S")) letter = "S";
                    else if (name.includes("Victor") || name.startsWith("V")) letter = "V";
                    else if (name.includes("周") || name.includes("赵") || name.startsWith("Z")) letter = "Z";
                    else {
                      const firstChar = name.charAt(0).toUpperCase();
                      if (/^[A-Z]$/.test(firstChar)) letter = firstChar;
                    }

                    if (!letterGroups[letter]) letterGroups[letter] = [];
                    letterGroups[letter].push(item);
                  });

                  const activeLetters = Object.keys(letterGroups).sort((a, b) => {
                    if (a === "#") return 1;
                    if (b === "#") return -1;
                    return a.localeCompare(b);
                  });

                  const displayedLetters = selectedAlphaLetter
                    ? activeLetters.filter((l) => l === selectedAlphaLetter)
                    : activeLetters;

                  return (
                    <div className="space-y-4 pb-8">
                      {selectedAlphaLetter && (
                        <div className="flex items-center justify-between bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-xs text-[#1877F2]">
                          <span>正在按字母“<strong>{selectedAlphaLetter}</strong>”过滤</span>
                          <button
                            type="button"
                            onClick={() => setSelectedAlphaLetter(null)}
                            className="font-bold underline cursor-pointer hover:text-blue-700"
                          >
                            显示全部
                          </button>
                        </div>
                      )}

                      {displayedLetters.map((letter, lIdx) => (
                        <div key={`contact-ltr-${letter}-${lIdx}`} id={`contact-group-${letter}`} className="space-y-1.5">
                          <div className="text-xs font-black text-[#1877F2] bg-gray-100/90 px-2.5 py-0.5 rounded-md inline-block">
                            {letter}
                          </div>
                          <div className="divide-y divide-gray-100">
                            {letterGroups[letter].map((contact, cIdx) => (
                              <div
                                key={`contact-item-${contact.id}-${cIdx}`}
                                onClick={() => {
                                  if (onOpenFriendProfile && contact.friendId) {
                                    onOpenFriendProfile(contact.friendId);
                                  } else {
                                    onSelectChat(contact.id);
                                  }
                                  setIsContactsDrawerOpen(false);
                                }}
                                className="py-2.5 flex items-center justify-between hover:bg-gray-50 rounded-xl px-2 transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="relative shrink-0">
                                    <img
                                      src={contact.avatar}
                                      alt={contact.friendName}
                                      className="w-11 h-11 rounded-full object-cover ring-1 ring-gray-200"
                                    />
                                    {contact.isCloseFriend ? (
                                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0">
                                        <Heart size={11} className="fill-white text-white shrink-0" />
                                      </span>
                                    ) : (
                                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center space-x-1.5">
                                      <h4 className="text-xs font-bold text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                                        {contact.friendName}
                                      </h4>
                                      {contact.isCloseFriend && (
                                        <span className="text-[9px] bg-rose-50 text-rose-600 px-1 py-0.2 rounded font-bold">
                                          密友
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-[#65676B] truncate">
                                      {contact.lastMessage || "点击发起聊天"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1.5 shrink-0">
                                  {activeChatId && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const friendObj = friends.find((f) => f.id === contact.friendId);
                                        const cardData: ContactCardData = {
                                          userId: contact.friendId,
                                          name: contact.friendName,
                                          avatar: contact.avatar,
                                          bio: friendObj?.profileDetail?.bio || friendObj?.status || "同城探索达人 · 户外探险",
                                          role: "好友推荐",
                                          locationName: friendObj?.locationName || "兰州市城关区",
                                          address: friendObj?.address || "甘肃省兰州市城关区",
                                          lat: friendObj?.lat ?? 36.0615,
                                          lng: friendObj?.lng ?? 103.8085,
                                          distance: friendObj?.distance || "800m",
                                          isOnline: friendObj?.isOnline ?? true,
                                        };
                                        onSendMessage(
                                          activeChatId,
                                          `[名片] ${contact.friendName}`,
                                          {
                                            type: "contact",
                                            contactData: cardData,
                                          }
                                        );
                                        setIsContactsDrawerOpen(false);
                                        soundEffects.playSuccessSound();
                                        haptics.trigger("success");
                                        showToast(`已向当前聊天推荐 ${contact.friendName} 的名片 👤`);
                                      }}
                                      className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[#1877F2] active:scale-95 text-[11px] font-bold rounded-full transition-all cursor-pointer border border-blue-200/80 dark:border-blue-900/50 shrink-0"
                                      title="将此名片发送至当前聊天"
                                    >
                                      发名片
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectChat(contact.id);
                                      setIsContactsDrawerOpen(false);
                                    }}
                                    className="px-3 py-1 bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white text-[11px] font-bold rounded-full transition-all cursor-pointer shadow-2xs shrink-0"
                                  >
                                    发消息
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Right Side Floating Alphabetical A-Z Index Bar */}
              <div className="absolute right-1 top-2 bottom-4 w-6 bg-white/90 backdrop-blur-xs border border-gray-200/80 rounded-full shadow-md flex flex-col items-center justify-between py-1 text-[9px] font-bold text-[#65676B] select-none z-10">
                {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#"].map(
                  (char, chIdx) => (
                    <button
                      key={`alpha-idx-${char}-${chIdx}`}
                      type="button"
                      onClick={() => {
                        setSelectedAlphaLetter((prev) => (prev === char ? null : char));
                        const el = document.getElementById(`contact-group-${char}`);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        selectedAlphaLetter === char
                          ? "bg-[#1877F2] text-white font-extrabold scale-125 shadow-2xs"
                          : "hover:bg-blue-50 hover:text-[#1877F2]"
                      }`}
                      title={`按 ${char} 检索`}
                    >
                      {char}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image Lightbox Viewer Modal */}
      {lightboxImageUrl && (
        <div
          id="photo-lightbox-modal"
          onClick={() => setLightboxImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-150 select-none"
        >
          <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
            <a
              href={lightboxImageUrl}
              download="photo.jpg"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors backdrop-blur-xs"
              title="保存原图"
            >
              <Download size={18} />
            </a>
            <button
              type="button"
              onClick={() => setLightboxImageUrl(null)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors backdrop-blur-xs"
              title="关闭预览"
            >
              <X size={20} />
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl max-h-[85vh] flex items-center justify-center relative rounded-2xl overflow-hidden shadow-2xl"
          >
            <img
              src={lightboxImageUrl}
              alt="High Resolution Full View"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl animate-in zoom-in-95 duration-200"
            />
          </div>

          <div className="absolute bottom-6 bg-white/20 backdrop-blur-md text-white text-xs px-4 py-1.5 rounded-full">
            轻触任意空白区域退出预览
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SHARE CONTACT CARD MODAL (发送名片卡片弹窗 - Facebook 直角线框体系) */}
      {/* ================================================================= */}
      <ShareContactModal
        isOpen={isShareContactModalOpen}
        onClose={() => setIsShareContactModalOpen(false)}
        friends={friends}
        conversations={conversations}
        activeChatId={activeChatId || activeConversation?.id}
        onSendContactCard={(contact, targetChatId) => {
          const finalChatId = targetChatId || activeChatId || activeConversation?.id || (conversations[0]?.id || '');
          if (!finalChatId) {
            showToast("请选择需要发送名片的目标聊天 👤");
            return;
          }
          onSendMessage(
            finalChatId,
            `[名片] ${contact.name}`,
            {
              type: "contact",
              contactData: contact,
            }
          );
          soundEffects.playWhooshSound();
          haptics.trigger("success");
          const targetConvName = conversations.find((c) => c.id === finalChatId)?.friendName || '当前聊天';
          showToast(`已向「${targetConvName}」发送 ${contact.name} 的名片卡片 👤`);
          requestAnimationFrame(() => {
            scrollToBottom("smooth");
          });
        }}
      />

      {/* ================================================================= */}
      {/* CONTACT CARD BRIEF INFO & ADD FRIEND MODAL (好友名片简要信息与加好友) */}
      {/* ================================================================= */}
      <ContactBriefModal
        isOpen={isBriefContactModalOpen}
        onClose={() => setIsBriefContactModalOpen(false)}
        contactData={selectedBriefContact}
        currentFriends={friends}
        onOpenProfile={(userId) => {
          if (onOpenFriendProfile && userId) {
            onOpenFriendProfile(userId);
          }
        }}
        onStartChat={(userId, userName) => {
          const existingConv = conversations.find((c) => c.id === userId || c.friendId === userId);
          if (existingConv) {
            onSelectChat(existingConv.id);
          } else {
            onSelectChat(userId);
          }
          setIsBriefContactModalOpen(false);
          showToast(`已进入与 ${userName || '联系人'} 的聊天 💬`);
        }}
        onNavigateToMap={(loc) => {
          if (onNavigateToMapLocation) {
            onNavigateToMapLocation(loc);
            showToast(`正在地图上锁定：${loc.name} 📍`);
          }
        }}
        showToast={showToast}
      />

      {/* ================================================================= */}
      {/* FORWARDING TARGET SELECTION MODAL (转发目标选择与循环发送弹窗) */}
      {/* ================================================================= */}
      {forwardModalState.isOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 overflow-hidden font-sans">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center">
                  <Forward size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#050505]">转发消息</h3>
                  <p className="text-[11px] text-gray-500">
                    包含 {forwardModalState.sourceMessages.length} 条所选消息
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForwardModalState((prev) => ({ ...prev, isOpen: false }))
                }
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Switcher Buttons: 逐条转发 vs 统一转发 */}
            <div className="mt-3 p-1 bg-gray-100 rounded-full flex items-center shrink-0">
              <button
                type="button"
                onClick={() =>
                  setForwardModalState((prev) => ({
                    ...prev,
                    forwardMode: "itemized",
                  }))
                }
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                  forwardModalState.forwardMode === "itemized"
                    ? "bg-[#1877F2] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Forward size={13} />
                <span>逐条转发</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setForwardModalState((prev) => ({
                    ...prev,
                    forwardMode: "unified",
                  }))
                }
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                  forwardModalState.forwardMode === "unified"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Share2 size={13} />
                <span>统一转发 (合并记录)</span>
              </button>
            </div>

            {/* Mode Explanation Banner */}
            <div className="mt-2 text-[11px] text-gray-500 bg-blue-50/60 p-2 rounded-xl border border-blue-100/80 shrink-0">
              {forwardModalState.forwardMode === "itemized" ? (
                <span>逐条转发：将选中的每条消息作为独立的发言气泡依次循环发送给目标。</span>
              ) : (
                <span>统一转发：将选中的多条消息合并压缩为 1 条【聊天记录】整体发送。</span>
              )}
            </div>

            {/* Selected Messages Preview Scrollbox */}
            <div className="mt-2 bg-gray-50 rounded-2xl p-2.5 max-h-24 overflow-y-auto space-y-1 text-xs border border-gray-100 shrink-0 custom-scrollbar">
              {forwardModalState.sourceMessages.map((m, idx) => (
                <div key={`forward-msg-${m.id || idx}-${idx}`} className="text-gray-700 truncate text-[11px]">
                  <span className="font-bold text-[#050505]">
                    {m.senderName || (m.isMe ? "我" : "成员")}:
                  </span>{" "}
                  {m.text || (m.imageUrl ? "[图片]" : "[多媒体消息]")}
                </div>
              ))}
            </div>

            {/* Target Contacts Selection List */}
            <div className="mt-3 flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <span className="text-xs font-bold text-[#050505]">
                  选择转发目标联系人 ({forwardModalState.selectedTargetChatIds.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const allIds = conversations.map((c) => c.id);
                    const isAllSelected =
                      forwardModalState.selectedTargetChatIds.length === allIds.length;
                    setForwardModalState((prev) => ({
                      ...prev,
                      selectedTargetChatIds: isAllSelected ? [] : allIds,
                    }));
                  }}
                  className="text-[11px] font-bold text-[#1877F2] hover:underline cursor-pointer"
                >
                  {forwardModalState.selectedTargetChatIds.length === conversations.length
                    ? "取消全选"
                    : "全选"}
                </button>
              </div>

              {/* Search Bar */}
              <div className="bg-gray-100 rounded-full px-3 py-1.5 flex items-center space-x-2 mb-2 shrink-0">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={forwardModalState.searchQuery}
                  onChange={(e) =>
                    setForwardModalState((prev) => ({
                      ...prev,
                      searchQuery: e.target.value,
                    }))
                  }
                  placeholder="搜索联系人或群聊..."
                  className="bg-transparent text-xs text-[#050505] outline-none flex-1 placeholder-gray-400 min-w-0"
                />
              </div>

              {/* Contacts Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {conversations
                  .filter((c) =>
                    c.friendName
                      .toLowerCase()
                      .includes(forwardModalState.searchQuery.toLowerCase())
                  )
                  .map((conv, fIdx) => {
                    const isSelected = forwardModalState.selectedTargetChatIds.includes(
                      conv.id
                    );
                    return (
                      <div
                        key={`fwd-conv-${conv.id}-${fIdx}`}
                        onClick={() => {
                          setForwardModalState((prev) => ({
                            ...prev,
                            selectedTargetChatIds: isSelected
                              ? prev.selectedTargetChatIds.filter((id) => id !== conv.id)
                              : [...prev.selectedTargetChatIds, conv.id],
                          }));
                        }}
                        className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/80 border-[#1877F2] shadow-2xs"
                            : "bg-white border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={conv.avatar}
                            alt={conv.friendName}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-[#050505]">
                              {conv.friendName}
                            </h4>
                            <p className="text-[10px] text-gray-400 truncate max-w-[180px]">
                              {conv.lastMessage || "暂无最新消息"}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-[#1877F2] border-[#1877F2] text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Footer Confirm Forward Button */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end space-x-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setForwardModalState((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-600 transition-colors cursor-pointer"
              >
                取消
              </button>

              <button
                type="button"
                disabled={
                  forwardModalState.selectedTargetChatIds.length === 0 ||
                  forwardModalState.sourceMessages.length === 0
                }
                onClick={handleConfirmForward}
                className="px-5 py-2 rounded-full bg-[#1877F2] hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Send size={13} />
                <span>
                  确认转发 ({forwardModalState.selectedTargetChatIds.length})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick-Save Bottom Sheet (存入个人相册/文件夹) */}
      <AnimatePresence>
        {quickSaveState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickSaveState({ isOpen: false, message: null, targetType: "folder" })}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl p-5 z-10 shadow-2xl max-h-[85vh] flex flex-col font-sans"
            >
              {/* Top Drag Indicator Pill */}
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3 shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#1877F2]">
                    {quickSaveState.targetType === "album" ? (
                      <ImageIcon size={18} />
                    ) : (
                      <Folder size={18} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#050505]">
                      {quickSaveState.targetType === "album"
                        ? "存入个人相册"
                        : "存入个人文件夹"}
                    </h3>
                    <p className="text-[11px] text-[#65676B]">
                      选择目标归档位置，将此资源分类保存
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setQuickSaveState({ isOpen: false, message: null, targetType: "folder" })}
                  className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-[#050505] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Quick Create Inline Accordion */}
              <div className="py-2.5 shrink-0">
                {!isQuickCreateOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsQuickCreateOpen(true)}
                    className="w-full py-2.5 px-3 rounded-2xl bg-[#F0F2F5] hover:bg-blue-50 hover:text-[#1877F2] text-xs font-bold text-[#050505] flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-dashed border-gray-300 hover:border-[#1877F2]"
                  >
                    <Plus size={15} />
                    <span>
                      新建个人{quickSaveState.targetType === "album" ? "相册" : "文件夹"}并存入
                    </span>
                  </button>
                ) : (
                  <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 flex items-center space-x-2">
                    <input
                      type="text"
                      value={newQuickCollectionName}
                      onChange={(e) => setNewQuickCollectionName(e.target.value)}
                      placeholder={`输入新${quickSaveState.targetType === "album" ? "相册" : "文件夹"}名称...`}
                      autoFocus
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                    />
                    <button
                      type="button"
                      onClick={handleQuickCreateAndSave}
                      className="px-3 py-1.5 bg-[#1877F2] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs"
                    >
                      创建并存入
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickCreateOpen(false);
                        setNewQuickCollectionName("");
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* List of user-created manual items */}
              <div className="flex-1 overflow-y-auto space-y-2 py-1 max-h-[320px]">
                {quickSaveState.targetType === "album" ? (
                  activeUserAlbums.map((album, aIdx) => (
                    <div
                      key={`save-album-${album.id}-${aIdx}`}
                      onClick={() => handleExecuteQuickSave(album.id)}
                      className="p-3 rounded-2xl bg-white border border-gray-100 hover:border-[#1877F2] hover:bg-blue-50/40 transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={album.coverUrl}
                          alt={album.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs font-bold text-[#050505] truncate group-hover:text-[#1877F2]">
                              {album.name}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-[#1877F2] font-semibold shrink-0">
                              个人相册
                            </span>
                          </div>
                          <p className="text-[11px] text-[#65676B] truncate">
                            {album.photoCount} 张照片 · {album.description || "个人相册"}
                          </p>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-[#F0F2F5] group-hover:bg-[#1877F2] group-hover:text-white flex items-center justify-center text-[#65676B] shrink-0 transition-colors">
                        <Plus size={15} />
                      </div>
                    </div>
                  ))
                ) : (
                  activeUserFolders.map((folder, fIdx) => (
                    <div
                      key={`save-folder-${folder.id}-${fIdx}`}
                      onClick={() => handleExecuteQuickSave(folder.id)}
                      className="p-3 rounded-2xl bg-white border border-gray-100 hover:border-[#1877F2] hover:bg-blue-50/40 transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: folder.color || "#1877F2" }}
                        >
                          <Folder size={22} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs font-bold text-[#050505] truncate group-hover:text-[#1877F2]">
                              {folder.name}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-[#1877F2] font-semibold shrink-0">
                              个人文档夹
                            </span>
                          </div>
                          <p className="text-[11px] text-[#65676B] truncate">
                            {folder.fileCount} 个文档 · {folder.description || "个人资料归档"}
                          </p>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-[#F0F2F5] group-hover:bg-[#1877F2] group-hover:text-white flex items-center justify-center text-[#65676B] shrink-0 transition-colors">
                        <Plus size={15} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* View in Document Center entry */}
              {onOpenDocumentCenter && (
                <div className="pt-3 border-t border-gray-100 mt-2 flex justify-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickSaveState({ isOpen: false, message: null, targetType: "folder" });
                      onOpenDocumentCenter();
                    }}
                    className="text-xs font-bold text-[#1877F2] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>打开完整文档中心进行多级管理</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* STELLAR MODULE POPUPS (E-Book Reader, City Cost of Living, Skill Detail) */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isEBookAppOpen && (
              <EBookReaderApp
                isDarkMode={isDarkMode}
                onClose={() => setIsEBookAppOpen(false)}
                showToast={showToast}
              />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCityCostAppOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <div className="w-full h-full max-w-md bg-white overflow-hidden shadow-2xl relative">
              <CityCostOfLivingApp
                onClose={() => setIsCityCostAppOpen(false)}
                showToast={showToast}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedSkillForDetail && (
          <SkillDetailModal
            skill={selectedSkillForDetail}
            onClose={() => setSelectedSkillForDetail(null)}
            onToggleInstall={(skill) => {
              onToggleSkillInstall?.(skill);
            }}
            onToggleEnable={(skill) => {
              onToggleSkillEnable?.(skill);
            }}
            onStar={(skill) => {
              showToast(`已收藏【${skill.displayName}】⭐`);
            }}
            onOpenPlayground={(skill) => {
              showToast(`启动【${skill.displayName}】沙盒演练`);
            }}
            onOpenConfig={(skill) => {
              showToast(`打开【${skill.displayName}】配置`);
            }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* ACTIVITY DETAIL SHORT CARD (社群活动底部详情面板)                */}
      {/* ================================================================= */}
      <AnimatePresence>
        {selectedChatActivity && (
          <ActivityDetailShortCard
            activity={selectedChatActivity}
            userLocation={{ lat: 36.0611, lng: 103.8343 }}
            friends={friends}
            onClose={() => setSelectedChatActivity(null)}
            onNavigate={(act) => {
              if (onOpenActivityOnMap) {
                onOpenActivityOnMap(act);
              } else if (onNavigateToMapLocation) {
                onNavigateToMapLocation({
                  lat: act.lat,
                  lng: act.lng,
                  name: act.title,
                });
              } else {
                showToast(`正在导航至【${act.title}】📍`);
              }
            }}
            onOpenCalendar={onOpenCalendar}
            onShowToast={showToast}
            onShareActivity={(act) => {
              if (onShareActivity) {
                onShareActivity(act);
              } else {
                showToast(`准备分享「${act.title}」活动卡片 🎯`);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* LIFE PLACE MEMORY CARD (生活坐标详情卡片)                          */}
      {/* ================================================================= */}
      {selectedChatLifePlace && (
        <PlaceMemoryCard
          place={selectedChatLifePlace}
          onClose={() => setSelectedChatLifePlace(null)}
          onNavigate={(p) => {
            setSelectedChatLifePlace(null);
            if (onNavigateToMapLocation) {
              onNavigateToMapLocation({
                lat: p.lat,
                lng: p.lng,
                name: p.name,
              });
              showToast(`📍 正在为您规划前往「${p.name}」的最优路线...`);
            }
          }}
          onShareLifePlace={(p) => {
            if (onShareActivity) {
              showToast(`准备分享「${p.name}」生活坐标卡片 📍`);
            }
          }}
          showToast={showToast}
        />
      )}

      {/* ================================================================= */}
      {/* ACTIVITY PICKER MODAL (发送活动卡片选择器)                         */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isActivityPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsActivityPickerOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl p-5 z-10 shadow-2xl max-h-[85vh] flex flex-col font-sans border-t border-[#E4E6EB]"
            >
              {/* Top Drag Indicator */}
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3 shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#1877F2]">
                    <Compass size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#050505]">
                      发送活动卡片
                    </h3>
                    <p className="text-[11px] text-[#65676B]">
                      选择一个同城/社群活动，向当前聊天发送直观信息卡片
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsActivityPickerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-[#050505] cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Activity List */}
              <div className="py-3 overflow-y-auto space-y-2.5 flex-1 pr-1 max-h-[60vh]">
                {allActivitiesList.map((act, actIdx) => {
                  const themeColor = act.color || "#1877F2";
                  return (
                    <div
                      key={`all-act-${act.id}-${actIdx}`}
                      onClick={() => {
                        if (!activeChatId) {
                          showToast("请先选择一个聊天会话");
                          return;
                        }
                        onSendMessage(
                          activeChatId,
                          `[活动] ${act.title}`,
                          {
                            type: "activity",
                            activityId: act.id,
                            activityData: act,
                          },
                          quotedMessage || undefined,
                        );
                        setQuotedMessage(null);
                        setIsActivityPickerOpen(false);
                        soundEffects.playWhooshSound();
                        haptics.trigger("medium");
                        showToast(`已发送「${act.title}」活动卡片 🎯`);
                      }}
                      className="p-3 bg-white border border-[#E4E6EB] hover:border-[#1877F2] rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow-2xs"
                          style={{ backgroundColor: `${themeColor}18` }}
                        >
                          {act.icon || "🎯"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[#1877F2] font-bold text-[11px]">
                              {act.date || "今天"} · {act.startTime || act.timeRange || "15:00"}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-medium">
                              {act.category === "sports" ? "运动" : act.category === "party" ? "聚会" : "探索"}
                            </span>
                          </div>
                          <h4 className="text-[13px] font-bold text-[#050505] truncate group-hover:text-[#1877F2] transition-colors mt-0.5">
                            {act.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 truncate flex items-center space-x-1 mt-0.5">
                            <MapPin size={11} className="shrink-0 text-gray-400" />
                            <span className="truncate">{act.locationName || act.address}</span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-3">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-md bg-[#1877F2] text-white text-xs font-bold shadow-2xs group-hover:bg-blue-600 transition-colors flex items-center space-x-1"
                        >
                          <span>发送</span>
                          <Send size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden File Inputs for Attachment Uploads inside Conversation */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoFileChange}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoFileChange}
      />
      <input
        type="file"
        ref={docInputRef}
        accept="*/*"
        className="hidden"
        onChange={handleDocFileChange}
      />
    </div>
  );
};
