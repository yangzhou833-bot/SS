import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DiscoverPost, ProfileData, LabelSticker } from '../types';
import { AvatarWithOrbitStickers } from './AvatarWithOrbitStickers';
import { CreateLabelStickerModal } from './CreateLabelStickerModal';
import { StickerManagementModal } from './StickerManagementModal';
import { INITIAL_USER_STICKERS } from '../data/stickerData';
import { StarCardDetailModal } from './StarCardDetailModal';
import { starCardCreationDate } from '../utils/starCardPresentation';
import {
  Menu,
  Search,
  Edit3,
  Settings,
  Check,
  MoreHorizontal,
  Plus,
  MapPin,
  Heart,
  MessageCircle,
  Share2,
  Users,
  User,
  Image as ImageIcon,
  Camera,
  Bookmark,
  Sparkles,
  Layers,
  Shield,
  Star,
  FileText,
  ChevronUp,
  ChevronDown,
  X,
  Send,
  ArrowLeft,
  QrCode,
  Download,
  Copy,
  Calendar as CalendarIcon,
  Music,
  Gamepad2,
  Bike,
  Palette,
  Coffee,
  Rocket,
  CheckCircle2,
  Award,
  Info,
  Cpu,
  Home,
  Globe,
  Link2,
  Briefcase,
  GraduationCap,
  Compass,
  AtSign,
  Phone,
  Mail,
  FileDown,
  Tv,
} from 'lucide-react';

interface ProfileViewProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  userNote?: string;
  attachedEmoji?: string;
  noteTheme?: string;
  userAvatar?: string;
  discoverPosts?: DiscoverPost[];
  onLikePost?: (postId: string) => void;
  onAddCommentToPost?: (postId: string, commentText: string) => void;
  onOpenNoteEditor?: () => void;
  onOpenSettings?: () => void;
  onOpenSearch?: () => void;
  onOpenAddPost?: () => void;
  onOpenDocumentAssets?: () => void;
  onBack?: () => void;
  showToast?: (msg: string) => void;
}

interface ProfileFriendItem {
  id: string;
  name: string;
  avatar: string;
  relationType: 'family' | 'close' | 'team' | 'work';
  relationLabel: string;
  status?: string;
}

// 多子母分类数据（音乐流派、游戏类型、运动门类等）
const HOBBY_TAXONOMY = [
  {
    id: 'music',
    name: '音乐流派',
    icon: Music,
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-50',
    subcategories: [
      '流行 (Pop)',
      '摇滚 (Rock)',
      '爵士 (Jazz)',
      '古典音乐',
      '电子/EDM',
      '嘻哈/说唱',
      '民谣 (Folk)',
      'R&B/Soul',
      '独立音乐',
      '重金属',
    ],
  },
  {
    id: 'game',
    name: '多种游戏',
    icon: Gamepad2,
    iconColor: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    subcategories: [
      'MOBA (DOTA2/LOL)',
      'FPS/射击 (CS/瓦罗兰特/Apex)',
      '开放世界RPG (黑神话/巫师/原神)',
      '主机独占 (PS5/Switch/Xbox)',
      '策略卡牌 (文明/炉石/星际)',
      '独立神作 (哈迪斯/空洞骑士)',
      '赛车竞速 (地平线/GT)',
      '模拟经营 (动森/城市天际线)',
    ],
  },
  {
    id: 'sports',
    name: '多种运动',
    icon: Bike,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    subcategories: [
      '骑行 (公路/山地)',
      '跑步/马拉松',
      '健身/力量训练',
      '羽毛球',
      '网球',
      '游泳',
      '滑雪/单板',
      '攀岩/抱石',
      '冲浪/潜水',
      '篮球',
      '足球',
    ],
  },
  {
    id: 'creation',
    name: '创作艺术',
    icon: Palette,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50',
    subcategories: [
      '摄影/胶片',
      '视频剪辑/Vlog',
      '插画/绘画',
      '写作/阅读',
      '3D建模/设计',
      '音乐编曲制作',
    ],
  },
  {
    id: 'lifestyle',
    name: '生活方式',
    icon: Coffee,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-50',
    subcategories: [
      '手冲咖啡/特调',
      '露营/徒步探险',
      '美食料理/烘焙',
      '旅行远足',
      '宠物/猫狗',
      '桌游/剧本杀',
    ],
  },
  {
    id: 'tech',
    name: '科技探索',
    icon: Rocket,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    subcategories: [
      '编程开发/极客',
      '天文观星',
      'AI / 机器学习',
      '数码硬件DIY',
    ],
  },
];

// Helper to convert date formats
const toInputDate = (dateStr: string) => {
  const match = dateStr.match(/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '1990-10-20';
};

const toDisplayDate = (inputVal: string) => {
  if (!inputVal) return '1990年10月20日';
  const parts = inputVal.split('-');
  if (parts.length === 3) {
    return `${parts[0]}年${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日`;
  }
  return inputVal;
};

// Deterministic Dot-Matrix QR Generator Component
const DotMatrixQR: React.FC<{ avatar: string; size?: number }> = ({ avatar, size = 220 }) => {
  const gridCount = 25;
  const cellSize = size / gridCount;
  const dotRadius = cellSize * 0.4;

  // Generate deterministic bit pattern for round dots
  const isCellActive = (r: number, c: number) => {
    // Corner patterns (top-left, top-right, bottom-left)
    const inTL = r < 7 && c < 7;
    const inTR = r < 7 && c >= gridCount - 7;
    const inBL = r >= gridCount - 7 && c < 7;

    // Inside finder markers
    if (inTL) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    if (inTR) {
      const cRel = c - (gridCount - 7);
      if (r === 0 || r === 6 || cRel === 0 || cRel === 6) return true;
      if (r >= 2 && r <= 4 && cRel >= 2 && cRel <= 4) return true;
      return false;
    }
    if (inBL) {
      const rRel = r - (gridCount - 7);
      if (rRel === 0 || rRel === 6 || c === 0 || c === 6) return true;
      if (rRel >= 2 && rRel <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }

    // Center area reserved for avatar cutout (7x7 in center)
    const centerStart = Math.floor(gridCount / 2) - 3;
    const centerEnd = centerStart + 6;
    if (r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) {
      return false;
    }

    // Alignment dots & timing strips
    if (r === 6 || c === 6) {
      return (r + c) % 2 === 0;
    }

    // Deterministic pseudo-random pattern for realistic QR data look
    const val = (r * 17 + c * 31 + (r ^ c) * 7) % 100;
    return val > 42;
  };

  const dots: { r: number; c: number }[] = [];
  for (let r = 0; r < gridCount; r++) {
    for (let c = 0; c < gridCount; c++) {
      if (isCellActive(r, c)) {
        dots.push({ r, c });
      }
    }
  }

  return (
    <div className="relative flex items-center justify-center p-3 bg-white rounded-2xl shadow-inner border border-[#E4E6EB]">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <defs>
          <radialGradient id="qrDotGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1877F2" />
            <stop offset="100%" stopColor="#0C56B8" />
          </radialGradient>
        </defs>

        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.c * cellSize + cellSize / 2}
            cy={dot.r * cellSize + cellSize / 2}
            r={dotRadius}
            fill="url(#qrDotGradient)"
          />
        ))}
      </svg>

      {/* Central User Avatar with Verified Badge */}
      <div
        className="absolute rounded-full ring-3 ring-white shadow-md overflow-visible bg-white p-0.5"
        style={{
          width: cellSize * 6.5,
          height: cellSize * 6.5,
        }}
      >
        <img
          src={avatar}
          alt="Avatar"
          className="w-full h-full rounded-full object-cover"
        />
        <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-[#1877F2] text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
          <CheckCircle2 size={12} className="stroke-[3]" />
        </div>
      </div>
    </div>
  );
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileData,
  setProfileData,
  userNote = '音乐不停，分享不止...',
  attachedEmoji = '😜',
  noteTheme = 'pink',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  discoverPosts = [],
  onLikePost,
  onAddCommentToPost,
  onOpenNoteEditor,
  onOpenSettings,
  onOpenSearch,
  onOpenAddPost,
  onOpenDocumentAssets,
  onBack,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'stars' | 'photos'>('all');
  const [activeStarModal, setActiveStarModal] = useState<DiscoverPost | null>(null);
  const [activeStarCommentInput, setActiveStarCommentInput] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFriendsExpanded, setIsFriendsExpanded] = useState(false);

  // QR Code Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Avatar & Name Only Modal State ("点击修改，只修改个人头像和名称")
  const [isAvatarNameModalOpen, setIsAvatarNameModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(userAvatar);
  const [tempName, setTempName] = useState(profileData.operatorName);

  // Bubble Status Only Modal State ("点击气泡，仅改动气泡表情和签名，不是修改个人信息")
  const [isBubbleStatusModalOpen, setIsBubbleStatusModalOpen] = useState(false);
  const [tempEmoji, setTempEmoji] = useState(attachedEmoji);
  const [tempMoodStatus, setTempMoodStatus] = useState(profileData.moodStatus || '在线');
  const [tempSignature, setTempSignature] = useState(profileData.signature || '音乐不停，分享不止...');

  // Photo Cutout Label Stickers State
  const [userStickers, setUserStickers] = useState<LabelSticker[]>(
    profileData.stickers !== undefined ? profileData.stickers : INITIAL_USER_STICKERS
  );
  const [isStickerManagerOpen, setIsStickerManagerOpen] = useState(false);
  const [isCreateStickerModalOpen, setIsCreateStickerModalOpen] = useState(false);
  const [hideStickers, setHideStickers] = useState<boolean>(!!profileData.hideStickers);

  useEffect(() => {
    if (profileData.stickers !== undefined) {
      setUserStickers(profileData.stickers);
    }
    if (profileData.hideStickers !== undefined) {
      setHideStickers(!!profileData.hideStickers);
    }
  }, [profileData.stickers, profileData.hideStickers]);

  const handleLikeUserSticker = (stickerId: string) => {
    setUserStickers((prev) =>
      prev.map((s) => {
        if (s.id === stickerId) {
          return {
            ...s,
            likedByMe: true,
            likes: s.likes + 1,
            recentLikers: [
              {
                userId: 'me',
                userName: '我',
                avatarUrl: profileAvatar,
                time: '刚刚',
              },
              ...s.recentLikers.filter((l) => l.userId !== 'me'),
            ],
          };
        }
        return s;
      })
    );
  };

  const handleDeleteUserSticker = (stickerId: string) => {
    setUserStickers((prev) => prev.filter((s) => s.id !== stickerId));
  };

  const handleSaveNewSticker = (newSticker: LabelSticker) => {
    setUserStickers((prev) => [newSticker, ...prev.slice(0, 5)]);
    setProfileData((prev) => ({
      ...prev,
      stickers: [newSticker, ...(prev.stickers || INITIAL_USER_STICKERS).slice(0, 5)],
    }));
  };

  const handleOpenAvatarNameModal = () => {
    setTempAvatar(profileAvatar);
    setTempName(profileName);
    setIsAvatarNameModalOpen(true);
  };

  const handleOpenBubbleStatusModal = () => {
    setTempEmoji(profileEmoji);
    setTempMoodStatus(profileData.moodStatus || '在线');
    setTempSignature(profileData.signature || '音乐不停，分享不止...');
    setIsBubbleStatusModalOpen(true);
  };

  // Hobbies Multi-level Subcategory Modal State
  const [isHobbyModalOpen, setIsHobbyModalOpen] = useState(false);
  const [selectedHobbyCategory, setSelectedHobbyCategory] = useState('music');
  const [tempSelectedHobbies, setTempSelectedHobbies] = useState<string[]>([]);
  const [customHobbyInput, setCustomHobbyInput] = useState('');

  const userStarCards = discoverPosts.filter(
    (p) => p.isStarCard || p.postType === 'star'
  );

  // Main Profile State linked directly to global profileData
  const profileName = profileData.operatorName;
  const setProfileName = (val: string | ((prev: string) => string)) => {
    setProfileData(prev => ({
      ...prev,
      operatorName: typeof val === 'function' ? val(prev.operatorName) : val
    }));
  };

  const profileLocation = profileData.currentCity;
  const setProfileLocation = (val: string | ((prev: string) => string)) => {
    setProfileData(prev => ({
      ...prev,
      currentCity: typeof val === 'function' ? val(prev.currentCity) : val
    }));
  };

  const profileBirthdate = toDisplayDate(profileData.birthday);
  const setProfileBirthdate = (val: string | ((prev: string) => string)) => {
    setProfileData(prev => ({
      ...prev,
      birthday: toInputDate(typeof val === 'function' ? val(toDisplayDate(prev.birthday)) : val)
    }));
  };

  const profileGender = profileData.gender;
  const setProfileGender = (val: string | ((prev: string) => string)) => {
    setProfileData(prev => ({
      ...prev,
      gender: typeof val === 'function' ? val(prev.gender) : val
    }));
  };

  const profileHobbies = profileData.hobbies;
  const setProfileHobbies = (val: string | ((prev: string) => string)) => {
    setProfileData(prev => ({
      ...prev,
      hobbies: typeof val === 'function' ? val(prev.hobbies) : val
    }));
  };

  const profileGame = profileData.interestsGame;
  const setProfileGame = (val: string | ((prev: string) => string)) => {
    setProfileData(prev => ({
      ...prev,
      interestsGame: typeof val === 'function' ? val(prev.interestsGame) : val
    }));
  };

  const [profileEmoji, setProfileEmoji] = useState(attachedEmoji);
  const [profileAvatar, setProfileAvatar] = useState(userAvatar);

  React.useEffect(() => {
    if (userAvatar) {
      setProfileAvatar(userAvatar);
    }
  }, [userAvatar]);

  // Inline Page Edit Mode State (No popup modal/card)
  const [isEditing, setIsEditing] = useState(false);

  // Post Like & Comment local states
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [isPostSaved, setIsPostSaved] = useState(false);
  const [postLikesCount, setPostLikesCount] = useState(18);
  const [commentsList, setCommentsList] = useState([
    { id: 'c1', userName: 'Hui Zhang', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120', content: '景色太赞了！引力波雷达很拉风！', time: '10分钟前' },
    { id: 'c2', userName: 'Alex', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120', content: '下次去黄河铁桥带我一个🚴', time: '5分钟前' },
  ]);
  const [newCommentInput, setNewCommentInput] = useState('');

  // Comprehensive Friends List with Specific Relationship Types (家人、密友、同一个小组、同事)
  const allFriendsList: ProfileFriendItem[] = [
    { id: 'f1', name: 'Alex', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120', relationType: 'close', relationLabel: '密友' },
    { id: 'f2', name: 'Lucas', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120', relationType: 'team', relationLabel: '同一个小组' },
    { id: 'f3', name: 'David', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', relationType: 'work', relationLabel: '同事' },
    { id: 'f4', name: 'Elena', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', relationType: 'family', relationLabel: '家人' },
    { id: 'f5', name: 'Sophia', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120', relationType: 'close', relationLabel: '密友' },
    { id: 'f6', name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120', relationType: 'family', relationLabel: '家人' },
    { id: 'f7', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120', relationType: 'team', relationLabel: '同一个小组' },
    { id: 'f8', name: 'Mia Wang', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=120', relationType: 'team', relationLabel: '同一个小组' },
    { id: 'f9', name: 'Liam Wilson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', relationType: 'work', relationLabel: '同事' },
    { id: 'f10', name: 'Chloe Lin', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120', relationType: 'close', relationLabel: '密友' },
  ];

  const friendsPreview = allFriendsList.slice(0, 5);

  // Relationship Badge Renderer for Avatar Bottom-Right Corner (如家人图标、密友图标、同一个小组图标)
  const renderRelationBadge = (relationType: 'family' | 'close' | 'team' | 'work') => {
    switch (relationType) {
      case 'family':
        return (
          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0"
            title="家人"
          >
            <Heart size={11} className="fill-white shrink-0" />
          </span>
        );
      case 'close':
        return (
          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0"
            title="密友"
          >
            <Sparkles size={11} className="fill-white shrink-0" />
          </span>
        );
      case 'team':
        return (
          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0"
            title="同一个小组"
          >
            <Shield size={11} className="fill-white shrink-0" />
          </span>
        );
      case 'work':
        return (
          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0"
            title="同事"
          >
            <Users size={11} className="shrink-0" />
          </span>
        );
      default:
        return (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
        );
    }
  };

  const cornerLikers = [
    { id: 'lk1', name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
    { id: 'lk2', name: 'Alex', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' },
    { id: 'lk3', name: 'Lucas', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150' },
    { id: 'lk4', name: 'Elena', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { id: 'lk5', name: 'David', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  ];

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  ];

  const handleToggleEditMode = () => {
    if (isEditing) {
      // Complete Editing
      setIsEditing(false);
      if (showToast) showToast('个人资料修改已保存');
    } else {
      // Enter Edit Mode
      setIsEditing(true);
      if (showToast) showToast('已进入原地编辑模式，可直接修改页面信息');
    }
  };

  const handleAddComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommentInput.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      userName: profileName,
      userAvatar: profileAvatar,
      content: newCommentInput.trim(),
      time: '刚刚',
    };

    setCommentsList([...commentsList, newComment]);
    setNewCommentInput('');
    if (showToast) showToast('评论成功');
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#8CCDF0] via-[#C4E8FA] to-white dark:from-zinc-950 dark:via-black dark:to-black text-[#050505] dark:text-white flex flex-col select-none overflow-y-auto scrollbar-none">
      {/* 顶部返回按钮与原点二维码名片按钮及贴纸管理 */}
      <div className="sticky top-0 z-30 pt-3.5 px-3.5 flex items-center justify-between pointer-events-none">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="返回上一次操作的页面"
            className="pointer-events-auto w-11 h-11 rounded-full bg-white/70 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 active:scale-95 text-[#1C1E21] dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs border border-white/60 dark:border-zinc-700 backdrop-blur-md"
            title="返回上一次操作的页面"
          >
            <ArrowLeft size={18} className="stroke-[2.5]" />
          </button>
        ) : <div />}

        {/* 右上角贴纸管理与原点二维码名片入口 */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* 贴纸管理入口 (移动到顶部 二维码边) */}
          <button
            type="button"
            onClick={() => {
              setIsStickerManagerOpen(true);
              if (showToast) showToast('已打开贴纸管理与位置编排 ✨');
            }}
            className="min-h-11 px-3 rounded-full bg-white/70 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 active:scale-95 text-[#1877F2] border border-white/60 dark:border-zinc-700 hover:border-[#1877F2] shadow-xs backdrop-blur-md flex items-center space-x-1.5 text-xs font-bold cursor-pointer transition-all group"
            title="编辑贴纸与放置位置"
          >
            <Layers size={14} className="stroke-[2.5] text-[#1877F2] group-hover:scale-110 transition-transform" />
            <span>贴纸管理</span>
          </button>

          {/* 右上角原点二维码名片入口 (点击可放大并扫码添加) */}
          <button
            type="button"
            onClick={() => {
              setIsQrModalOpen(true);
              if (showToast) showToast('已打开个人原点二维码名片 ✨');
            }}
            aria-label="打开我的二维码名片"
            className="w-11 h-11 rounded-full bg-white/70 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 active:scale-95 text-[#1877F2] flex items-center justify-center transition-all cursor-pointer shadow-xs border border-white/60 backdrop-blur-md group"
            title="我的原点二维码 (对方扫一扫添加好友)"
          >
            <QrCode size={18} className="stroke-[2.2] group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Main Stream Container */}
      <div className="max-w-xl mx-auto w-full pb-20 -mt-8">
        
        {/* 2. 个人信息与数据区 (In-Place Editable directly on page) */}
        <div className={`relative px-4 pt-10 pb-6 border-b border-white/20 bg-white/10 backdrop-blur-xs space-y-5 transition-all overflow-hidden ${
          isEditing ? 'ring-2 ring-emerald-500/50 bg-emerald-50/20 rounded-2xl mx-2 my-2' : ''
        }`}>
          {isEditing && (
            <div className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-between border border-emerald-200">
              <span>正在原地编辑模式，修改下方内容后点击“完成”保存</span>
              <button
                onClick={handleToggleEditMode}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer"
              >
                完成
              </button>
            </div>
          )}

          <div className="flex flex-col items-center text-center space-y-2 pt-2 relative w-full select-none">
            {/* Ambient Floating Photo-Cutout Stickers Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-40">
              {userStickers.slice(0, 3).map((stk, sIdx) => {
                const posClasses = [
                  'top-1 left-2 animate-[bounce_6s_infinite_ease-in-out]',
                  'top-4 right-3 animate-[bounce_7s_infinite_ease-in-out_1s]',
                  'bottom-2 left-4 animate-[pulse_5s_infinite_ease-in-out_2s]'
                ][sIdx % 3];
                return (
                  <div key={`bg-stk-${stk.id}`} className={`absolute ${posClasses} w-7 h-7 rounded-full overflow-hidden border border-white/70 shadow-2xs`}>
                    <img src={stk.cutoutUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                );
              })}
            </div>

            {/* RealMoji Photo Cutout Orbiting Label Stickers & Centered Avatar with 4 Corner Badges */}
            <div className="relative shrink-0 flex items-center justify-center my-1 z-10">
              <AvatarWithOrbitStickers
                avatarUrl={profileAvatar}
                userName={profileName}
                mood={attachedEmoji || profileEmoji || '🌟'}
                battery={95}
                behaviorStatus={profileData.moodStatus || '在线'}
                relationship="close"
                speechBubbleText={userNote || (profileData.signature ? profileData.signature.slice(0, 18) : undefined)}
                bubbleEmoji={attachedEmoji || profileEmoji || '😜'}
                bubbleTheme={noteTheme}
                stickers={userStickers}
                hideStickers={hideStickers}
                size="lg"
                isInteractive={true}
                isEditable={true}
                onLikeSticker={handleLikeUserSticker}
                onDeleteSticker={handleDeleteUserSticker}
                onBubbleClick={() => {
                  if (onOpenNoteEditor) {
                    onOpenNoteEditor();
                  } else {
                    handleOpenBubbleStatusModal();
                  }
                }}
                onOpenMoodPicker={() => {
                  if (onOpenNoteEditor) {
                    onOpenNoteEditor();
                  } else {
                    handleOpenBubbleStatusModal();
                  }
                }}
                onAvatarClick={handleOpenAvatarNameModal}
                onShowToast={showToast}
              />
            </div>

            {/* Avatar Quick Presets in Edit Mode */}
            {isEditing && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={`edit-preset-${idx}`}
                    type="button"
                    aria-label={`选择预设头像 ${idx + 1}`}
                    aria-pressed={profileAvatar === preset}
                    onClick={() => setProfileAvatar(preset)}
                    className={`w-11 h-11 rounded-full overflow-hidden border transition-all cursor-pointer ${
                      profileAvatar === preset ? 'border-emerald-500 ring-2 ring-emerald-400 scale-110' : 'border-white/50 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* User Identity Details (Centered in card) */}
            <div className="space-y-2 w-full max-w-sm px-2">
              {isEditing ? (
                /* Nickname Input */
                <div className="text-center">
                  <label className="text-[10px] font-bold text-emerald-800 block mb-0.5 text-center">昵称</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full text-center text-base font-black text-[#050505] bg-white/80 border border-emerald-400 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="修改个人名称"
                  className="min-h-11 mx-auto flex items-center justify-center space-x-1.5 cursor-pointer group focus-visible:outline-2 focus-visible:outline-blue-500 rounded-lg"
                  onClick={handleOpenAvatarNameModal}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleOpenAvatarNameModal();
                    }
                  }}
                  title="点击修改个人名称"
                >
                  <h2 className="text-xl font-black text-[#050505] dark:text-white tracking-tight group-hover:text-[#1877F2] transition-colors">{profileName}</h2>
                  <div className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-2xs" title="已认证">
                    <Check size={10} className="stroke-[3]" />
                  </div>
                  <Edit3 size={13} className="text-[#1877F2] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" />
                </div>
              )}

              {!isEditing && (
                <p className="text-xs text-[#45474B] dark:text-zinc-300 font-semibold flex flex-wrap gap-x-1 gap-y-1 items-center justify-center">
                  <span>100 位好友 · 45 条动态</span>
                  <span>·</span>
                  <span className="inline-flex items-center text-rose-500 font-black">
                    ❤️ 获赞 {userStickers.reduce((acc, s) => acc + (s.likes || 0), 0)}
                  </span>
                  <span>·</span>
                  <span>{profileLocation}</span>
                </p>
              )}

              {/* Custom Note Status / Bio Input */}
              {isEditing ? (
                <div className="space-y-2 pt-1.5 text-left max-w-sm mx-auto">
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#1877F2] block mb-0.5 text-center">挂件</label>
                      <input
                        type="text"
                        value={profileEmoji}
                        onChange={(e) => setProfileEmoji(e.target.value)}
                        className="w-full text-xs text-center bg-white border border-[#E4E6EB] rounded-md py-1 outline-none focus:border-[#1877F2]"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] font-bold text-[#1877F2] block mb-0.5">心情状态</label>
                      <input
                        type="text"
                        value={profileData.moodStatus || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, moodStatus: e.target.value }))}
                        className="w-full text-xs bg-white border border-[#E4E6EB] rounded-md px-2 py-1 outline-none focus:border-[#1877F2]"
                        placeholder="例如：在线、忙碌"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#1877F2] block mb-0.5">个性签名与便签</label>
                    <input
                      type="text"
                      value={profileData.signature || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, signature: e.target.value }))}
                      className="w-full text-xs bg-white border border-[#E4E6EB] rounded-md px-2 py-1 outline-none focus:border-[#1877F2]"
                      placeholder="例如：音乐不停，分享不止..."
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {/* Mood Status Capsule (Directly edits Note / Status) */}
                  <div
                    onClick={() => {
                      if (onOpenNoteEditor) {
                        onOpenNoteEditor();
                      } else {
                        handleOpenBubbleStatusModal();
                      }
                    }}
                    className="inline-flex items-center space-x-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-95 text-[#1877F2] text-[11px] font-bold px-3 py-1 rounded-full cursor-pointer transition-all border border-[#E4E6EB] shadow-2xs group"
                    title="点击直接进入便签与状态编辑页面（与聊天左上角便签协同）"
                  >
                    <span>{attachedEmoji || profileEmoji || '😜'}</span>
                    <span>{profileData.moodStatus || '在线'}</span>
                    <Edit3 size={10} className="text-[#1877F2] opacity-60 group-hover:opacity-100" />
                  </div>

                  {/* Personal Signature / Note Capsule (Directly edits Note) */}
                  <div
                    onClick={() => {
                      if (onOpenNoteEditor) {
                        onOpenNoteEditor();
                      } else {
                        handleOpenBubbleStatusModal();
                      }
                    }}
                    className="inline-flex items-center space-x-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-95 text-[#050505] text-[11px] font-medium px-3 py-1 rounded-full cursor-pointer transition-all border border-[#E4E6EB] shadow-2xs group"
                    title="点击直接进入便签编辑页面（与聊天左上角便签协同）"
                  >
                    <span className="text-[#1877F2]">✍️</span>
                    <span className="truncate max-w-[180px]">{userNote || profileData.signature || '音乐不停，分享不止...'}</span>
                    <Edit3 size={10} className="text-[#1877F2] opacity-60 group-hover:opacity-100" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                if (onOpenAddPost) onOpenAddPost();
                else if (showToast) showToast('已打开发布动态');
              }}
              className="py-2.5 px-4 rounded-full bg-[#1877F2] hover:bg-[#166fe5] active:scale-98 text-white text-xs font-bold transition-all shadow-xs cursor-pointer text-center flex items-center justify-center space-x-1.5"
            >
              <Plus size={15} />
              <span>发布动态</span>
            </button>

            {/* In-Place Toggle Button / Done Button */}
            <button
              onClick={handleToggleEditMode}
              className={`py-2.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center space-x-1.5 ${
                isEditing
                  ? 'bg-[#10B981] hover:bg-emerald-600 text-white shadow-sm'
                  : 'bg-white/50 hover:bg-white/80 text-[#050505] border border-white/40'
              }`}
            >
              {isEditing ? (
                <>
                  <Check size={15} className="stroke-[3]" />
                  <span>完成修改</span>
                </>
              ) : (
                <span>编辑资料</span>
              )}
            </button>
          </div>
        </div>

        {/* 3. Discover-Style Category Pill Tabs + Rightmost 文档与资产 Button */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200/80 dark:border-zinc-800 px-4 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: '全部' },
              { id: 'posts', label: '动态' },
              { id: 'stars', label: '星片 ✨' },
              { id: 'photos', label: '照片' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#1877F2] text-white shadow-2xs'
                    : 'bg-[#F0F2F5] dark:bg-zinc-900 text-[#050505] dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 紧贴最右侧的【文档与资产】按钮 */}
          <button
            onClick={() => {
              if (onOpenDocumentAssets) {
                onOpenDocumentAssets();
              } else if (showToast) {
                showToast('已进入【文档与资产】中心');
              }
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-[#1877F2] text-xs font-bold shrink-0 border border-blue-200/80 dark:border-blue-800 transition-colors cursor-pointer ml-2 shadow-2xs"
            title="查看文档与资产"
          >
            <Bookmark size={13} className="text-[#1877F2]" />
            <span className="whitespace-nowrap">文档与资产</span>
          </button>
        </div>

        {/* 4. Friends List Section (Expandable with Relationship Badges: 家人、密友、同一个小组、同事) */}
        {activeTab === 'all' && (
          <div className="px-4 py-3.5 border-b border-gray-200/80 bg-white space-y-2.5 transition-all">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#050505] uppercase tracking-wider flex items-center space-x-1.5">
                <Users size={14} className="text-[#1877F2]" />
                <span>好友 ({allFriendsList.length})</span>
                <div className="flex items-center space-x-1 ml-1 text-[9px] text-gray-500 font-normal">
                  <span className="flex items-center space-x-0.5 text-rose-500">
                    <Heart size={11} className="fill-rose-500 shrink-0" />
                    <span>家人</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center space-x-0.5 text-purple-600">
                    <Sparkles size={11} className="fill-purple-600 shrink-0" />
                    <span>密友</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center space-x-0.5 text-emerald-600">
                    <Shield size={11} className="fill-emerald-600 shrink-0" />
                    <span>同组</span>
                  </span>
                </div>
              </h3>
              <button
                onClick={() => {
                  const nextState = !isFriendsExpanded;
                  setIsFriendsExpanded(nextState);
                  if (showToast) {
                    showToast(nextState ? '已展开全部好友列表及关系标签' : '已收起好友列表');
                  }
                }}
                className="text-xs font-bold text-[#1877F2] hover:underline cursor-pointer flex items-center space-x-0.5"
              >
                <span>{isFriendsExpanded ? '收起' : '查看全部'}</span>
                {isFriendsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Collapsed view: Horizontal scroll row of preview friends */}
            {!isFriendsExpanded ? (
              <div className="flex items-center space-x-3.5 overflow-x-auto pb-1 scrollbar-none">
                {friendsPreview.map((friend) => (
                  <div
                    key={`preview-friend-${friend.id}`}
                    onClick={() => {
                      if (showToast) showToast(`查看好友: ${friend.name} (${friend.relationLabel})`);
                    }}
                    className="flex flex-col items-center shrink-0 space-y-1 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full ring-2 ring-[#1877F2]/30 p-0.5 bg-white shadow-2xs group-hover:scale-105 transition-transform overflow-visible relative">
                      <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" />
                      {/* Avatar bottom-right relationship badge */}
                      {renderRelationBadge(friend.relationType)}
                    </div>
                    <span className="text-[11px] font-semibold text-[#050505] truncate max-w-[56px] text-center">
                      {friend.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* Expanded view: Grid layout displaying all friends with relationship badges & labels */
              <div className="grid grid-cols-5 gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-200/80 animate-in fade-in zoom-in-98 duration-150">
                {allFriendsList.map((friend) => (
                  <div
                    key={`all-friend-${friend.id}`}
                    onClick={() => {
                      if (showToast) showToast(`查看好友: ${friend.name} (${friend.relationLabel})`);
                    }}
                    className="flex flex-col items-center space-y-1 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full ring-2 ring-[#1877F2]/30 p-0.5 bg-white shadow-2xs group-hover:scale-105 transition-transform overflow-visible relative">
                      <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" />
                      {/* Avatar bottom-right relationship badge */}
                      {renderRelationBadge(friend.relationType)}
                    </div>
                    <span className="text-[10.5px] font-bold text-[#050505] truncate max-w-[58px] text-center">
                      {friend.name}
                    </span>
                    <span className={`text-[8.5px] font-bold px-1 rounded leading-tight ${
                      friend.relationType === 'family'
                        ? 'bg-rose-50 text-rose-600'
                        : friend.relationType === 'close'
                        ? 'bg-purple-50 text-purple-600'
                        : friend.relationType === 'team'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {friend.relationLabel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. Personal Details Section (In-Place Edit Inputs on page) */}
        {activeTab === 'all' && (
          <div className={`px-4 py-3.5 border-b border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3 transition-all ${
            isEditing ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : ''
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#050505] dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                <span>个人详情</span>
                {isEditing && <span className="text-[10px] text-emerald-600 font-bold">（可直接修改与选择）</span>}
              </h3>
              <button
                onClick={handleToggleEditMode}
                className={`text-xs font-bold transition-all cursor-pointer ${
                  isEditing ? 'text-[#10B981] underline font-extrabold' : 'text-[#1877F2] hover:underline'
                }`}
              >
                {isEditing ? '完成' : '编辑'}
              </button>
            </div>

            <div className="space-y-4">
              {/* Group 1: 核心身份与认证 */}
              <div className="border border-[#E4E6EB] dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 p-3 shadow-2xs space-y-2.5">
                <div className="border-b border-[#F0F2F5] dark:border-zinc-800 pb-1.5 flex items-center space-x-1.5">
                  <Award size={14} className="text-[#1877F2]" />
                  <span className="font-bold text-xs text-[#050505] dark:text-white">核心身份与认证</span>
                </div>
                <div className="divide-y divide-gray-100 space-y-2.5 text-xs">
                  {/* Category */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Award size={13} className="text-[#1877F2]" />
                      <span>主页类别</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.category}
                        onChange={(e) => setProfileData(prev => ({ ...prev, category: e.target.value }))}
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none font-medium focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileData.category || '未设置'}</span>
                    )}
                  </div>

                  {/* Pinned Detail */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Bookmark size={13} className="text-[#1877F2]" />
                      <span>置顶身份</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.pinnedDetail}
                        onChange={(e) => setProfileData(prev => ({ ...prev, pinnedDetail: e.target.value }))}
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none font-medium focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileData.pinnedDetail || '未设置'}</span>
                    )}
                  </div>

                  {/* About You */}
                  <div className="pt-2 flex flex-col space-y-1">
                    <span className="font-semibold text-[#65676B] flex items-center space-x-1">
                      <Info size={13} className="text-[#1877F2]" />
                      <span>个人简介说明</span>
                    </span>
                    {isEditing ? (
                      <textarea
                        value={profileData.aboutYou}
                        onChange={(e) => setProfileData(prev => ({ ...prev, aboutYou: e.target.value }))}
                        className="bg-white border border-emerald-400 rounded-md px-2 py-1 text-xs text-[#050505] outline-none font-medium focus:ring-1 focus:ring-emerald-500 w-full h-16 resize-none"
                      />
                    ) : (
                      <span className="text-[#65676B] leading-relaxed bg-[#F0F2F5] p-2 rounded-md font-light text-[11px] block">{profileData.aboutYou || '未设置详细的个人简介。'}</span>
                    )}
                  </div>

                  {/* AI Creator Badge */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Cpu size={13} className="text-purple-500" />
                      <span>AI创作者认证</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={profileData.isAICreator}
                        onChange={(e) => setProfileData(prev => ({ ...prev, isAICreator: e.target.checked }))}
                        className="w-4 h-4 text-[#1877F2] rounded-sm border-gray-300 focus:ring-[#1877F2] cursor-pointer"
                      />
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        profileData.isAICreator 
                          ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-3xs' 
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        {profileData.isAICreator ? '已认证 (Creator)' : '未激活'}
                      </span>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <User size={13} className="text-[#1877F2]" />
                      <span>性别</span>
                    </span>
                    {isEditing ? (
                      <select
                        value={profileGender}
                        onChange={(e) => setProfileGender(e.target.value)}
                        className="bg-white border border-emerald-400 rounded-md px-2 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                      >
                        <option value="男性">男性</option>
                        <option value="女性">女性</option>
                        <option value="保密">保密</option>
                      </select>
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileGender}</span>
                    )}
                  </div>

                  {/* Birthdate */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <CalendarIcon size={13} className="text-[#1877F2]" />
                      <span>出生日期</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="date"
                        value={toInputDate(profileBirthdate)}
                        onChange={(e) => {
                          const newDate = toDisplayDate(e.target.value);
                          setProfileBirthdate(newDate);
                        }}
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileBirthdate}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 2: 地理及生活状况 */}
              <div className="border border-[#E4E6EB] rounded-md bg-white p-3 shadow-2xs space-y-2.5">
                <div className="border-b border-[#F0F2F5] pb-1.5 flex items-center space-x-1.5">
                  <MapPin size={14} className="text-[#1877F2]" />
                  <span className="font-bold text-xs text-[#050505]">生活背景及所在地</span>
                </div>
                <div className="divide-y divide-gray-100 space-y-2.5 text-xs">
                  {/* Current City */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <MapPin size={13} className="text-[#1877F2]" />
                      <span>所在地</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileLocation}
                        onChange={(e) => setProfileLocation(e.target.value)}
                        placeholder="输入当前城市"
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileLocation || '保密'}</span>
                    )}
                  </div>

                  {/* Hometown */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Home size={13} className="text-[#1877F2]" />
                      <span>家乡</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.hometown}
                        onChange={(e) => setProfileData(prev => ({ ...prev, hometown: e.target.value }))}
                        placeholder="输入家乡城市"
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileData.hometown || '保密'}</span>
                    )}
                  </div>

                  {/* Relationship Status */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Heart size={13} className="text-red-500" />
                      <span>感情状态</span>
                    </span>
                    {isEditing ? (
                      <select
                        value={profileData.relationshipStatus}
                        onChange={(e) => setProfileData(prev => ({ ...prev, relationshipStatus: e.target.value }))}
                        className="bg-white border border-emerald-400 rounded-md px-2 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                      >
                        <option value="单身">单身</option>
                        <option value="热恋中">热恋中</option>
                        <option value="已婚">已婚</option>
                        <option value="保密">保密</option>
                      </select>
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileData.relationshipStatus || '保密'}</span>
                    )}
                  </div>

                  {/* Family Status */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Users size={13} className="text-[#1877F2]" />
                      <span>家庭成员</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.familyStatus}
                        onChange={(e) => setProfileData(prev => ({ ...prev, familyStatus: e.target.value }))}
                        placeholder="输入配偶、父母或子女"
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileData.familyStatus || '无'}</span>
                    )}
                  </div>

                  {/* Languages */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Globe size={13} className="text-teal-500" />
                      <span>掌握语言</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.languages}
                        onChange={(e) => setProfileData(prev => ({ ...prev, languages: e.target.value }))}
                        placeholder="例如: 中文、英语"
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileData.languages || '中文'}</span>
                    )}
                  </div>

                  {/* Travel Places */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Compass size={13} className="text-orange-500" />
                      <span>足迹城市</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.travelPlaces}
                        onChange={(e) => setProfileData(prev => ({ ...prev, travelPlaces: e.target.value }))}
                        placeholder="去过的主要城市"
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileData.travelPlaces || '暂未设置'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 3: 工作及学术背景 */}
              <div className="border border-[#E4E6EB] rounded-md bg-white p-3 shadow-2xs space-y-2.5">
                <div className="border-b border-[#F0F2F5] pb-1.5 flex items-center space-x-1.5">
                  <Briefcase size={14} className="text-[#1877F2]" />
                  <span className="font-bold text-xs text-[#050505]">工作经历与学术背景</span>
                </div>
                <div className="divide-y divide-gray-100 space-y-2.5 text-xs">
                  {/* Work Experience */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Briefcase size={13} className="text-[#1877F2]" />
                      <span>工作单位</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.workExperience}
                        onChange={(e) => setProfileData(prev => ({ ...prev, workExperience: e.target.value }))}
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileData.workExperience || '自由职业'}</span>
                    )}
                  </div>

                  {/* Education History */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <GraduationCap size={13} className="text-[#1877F2]" />
                      <span>教育经历</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.educationHistory}
                        onChange={(e) => setProfileData(prev => ({ ...prev, educationHistory: e.target.value }))}
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileData.educationHistory || '未设置'}</span>
                    )}
                  </div>

                  {/* Website Link */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Link2 size={13} className="text-sky-500" />
                      <span>个人主页</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.websiteLink}
                        onChange={(e) => setProfileData(prev => ({ ...prev, websiteLink: e.target.value }))}
                        placeholder="https://example.com"
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      profileData.websiteLink ? (
                        <a
                          href={profileData.websiteLink}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noreferrer"
                          className="text-[#1877F2] font-bold hover:underline text-right"
                        >
                          {profileData.websiteLink.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-right">未设置</span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Group 4: 广泛兴趣与嗜好 */}
              <div className="border border-[#E4E6EB] rounded-md bg-white p-3 shadow-2xs space-y-2.5">
                <div className="border-b border-[#F0F2F5] pb-1.5 flex items-center space-x-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span className="font-bold text-xs text-[#050505]">兴趣圈子与极客嗜好</span>
                </div>
                <div className="divide-y divide-gray-100 space-y-2.5 text-xs">
                  {/* Hobbies picker */}
                  <div className="pt-2 flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                        <Sparkles size={13} className="text-amber-500" />
                        <span>主要爱好</span>
                      </span>
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = profileHobbies
                              ? profileHobbies.split(/[、,，\s]+/).filter(Boolean)
                              : [];
                            setTempSelectedHobbies(currentList);
                            setIsHobbyModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1877F2] border border-blue-200 rounded-md text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                        >
                          <Plus size={11} className="stroke-[2.5]" />
                          <span>分类子菜单选择</span>
                        </button>
                      ) : (
                        <span className="text-[#050505] text-right font-medium">{profileHobbies || '暂未设置'}</span>
                      )}
                    </div>

                    {/* Hobbies lists */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5 justify-end">
                      {(profileHobbies ? profileHobbies.split(/[、,，\s]+/).filter(Boolean) : []).map((hobby, hIdx) => (
                        <span
                          key={`${hobby}-${hIdx}`}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#F0F2F5] text-[#050505] border border-[#E4E6EB] flex items-center space-x-1"
                        >
                          <span>{hobby}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                const list = profileHobbies.split(/[、,，\s]+/).filter(Boolean);
                                const updated = list.filter((_, idx) => idx !== hIdx);
                                setProfileHobbies(updated.join('、'));
                              }}
                              className="text-gray-400 hover:text-red-500 cursor-pointer ml-0.5"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Music */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Music size={13} className="text-[#1877F2]" />
                      <span>喜爱音乐</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.interestsMusic}
                        onChange={(e) => setProfileData(prev => ({ ...prev, interestsMusic: e.target.value }))}
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileData.interestsMusic || '未设置'}</span>
                    )}
                  </div>

                  {/* TV & Movies */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Tv size={13} className="text-red-500" />
                      <span>影视收藏</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.interestsTV}
                        onChange={(e) => setProfileData(prev => ({ ...prev, interestsTV: e.target.value }))}
                        placeholder="影视/剧集"
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileData.interestsTV || '未设置'}</span>
                    )}
                  </div>

                  {/* Games */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Gamepad2 size={13} className="text-indigo-500" />
                      <span>擅长游戏</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileGame}
                        onChange={(e) => setProfileGame(e.target.value)}
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="font-bold text-[#1877F2] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-right">{profileGame || '未设置'}</span>
                    )}
                  </div>

                  {/* Sports */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Bike size={13} className="text-emerald-500" />
                      <span>喜欢运动</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.interestsSports}
                        onChange={(e) => setProfileData(prev => ({ ...prev, interestsSports: e.target.value }))}
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-medium text-right">{profileData.interestsSports || '未设置'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 5: 联系安全及展示媒介 */}
              <div className="border border-[#E4E6EB] rounded-md bg-white p-3 shadow-2xs space-y-2.5">
                <div className="border-b border-[#F0F2F5] pb-1.5 flex items-center space-x-1.5">
                  <Phone size={14} className="text-[#1877F2]" />
                  <span className="font-bold text-xs text-[#050505]">安全、联系方式与宣发</span>
                </div>
                <div className="divide-y divide-gray-100 space-y-2.5 text-xs">
                  {/* Phone */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Phone size={13} className="text-blue-500" />
                      <span>联系电话</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-mono text-right">{profileData.phoneNumber || '保密'}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <Mail size={13} className="text-[#1877F2]" />
                      <span>电子邮箱</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.emailAddress}
                        onChange={(e) => setProfileData(prev => ({ ...prev, emailAddress: e.target.value }))}
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#050505] font-mono text-right">{profileData.emailAddress || '保密'}</span>
                    )}
                  </div>

                  {/* Social Media ID */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <AtSign size={13} className="text-[#1877F2]" />
                      <span>社交主页ID</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.socialMedia}
                        onChange={(e) => setProfileData(prev => ({ ...prev, socialMedia: e.target.value }))}
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      <span className="text-[#1877F2] font-semibold text-right">@{profileData.socialMedia || 'stellar_user'}</span>
                    )}
                  </div>

                  {/* Promo Materials */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-semibold text-[#65676B] shrink-0 w-24 flex items-center space-x-1">
                      <FileDown size={13} className="text-indigo-500" />
                      <span>宣发内容</span>
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.promoMaterials}
                        onChange={(e) => setProfileData(prev => ({ ...prev, promoMaterials: e.target.value }))}
                        placeholder="宣发网盘/YouTube链接"
                        className="bg-white border border-emerald-400 rounded-md px-2.5 py-1 text-xs text-[#050505] outline-none text-right focus:ring-1 focus:ring-emerald-500 w-44"
                      />
                    ) : (
                      profileData.promoMaterials ? (
                        <a
                          href={profileData.promoMaterials}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noreferrer"
                          className="text-[#1877F2] font-bold hover:underline truncate w-44 text-right block"
                        >
                          {profileData.promoMaterials.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-right">未上传宣发内容</span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom "完成" Button in Details Section when Editing */}
            {isEditing && (
              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleToggleEditMode}
                  className="w-full py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-full text-xs font-black shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Check size={16} className="stroke-[3]" />
                  <span>完成个人资料编辑</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 6. Discover-Style Feed Section */}
        {(activeTab === 'all' || activeTab === 'posts') && (
          <div className="bg-white border-b border-gray-200/80">
            {/* Post Header Bar */}
            <div className="px-4 pt-4 flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2.5">
                <img
                  src={profileAvatar}
                  alt={profileName}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
                />
                <div>
                  <div className="text-xs font-bold text-[#050505] flex items-center space-x-1">
                    <span>{profileName}</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[8px]">✓</span>
                  </div>
                  <div className="text-[10px] text-[#65676B] flex items-center space-x-1.5 mt-0.5 font-light">
                    <span>6月2日 14:30</span>
                    <span className="opacity-50">·</span>
                    <span className="text-gray-500 font-light flex items-center space-x-0.5">
                      <MapPin size={10} className="text-[#1877F2] shrink-0" />
                      <span>兰州黄河铁桥</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                aria-label="查看动态选项"
                onClick={() => {
                  if (showToast) showToast('原型演示：动态选项尚未接入');
                }}
                className="w-11 h-11 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#65676B] cursor-pointer transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Post Text Body */}
            <p className="px-4 text-xs text-[#050505] leading-relaxed mb-3">
              今天在兰州黄河铁桥漫步，落日余晖与城市引力波雷达完美交织，分享stellar轨迹记录。✨
            </p>

            {/* Post Photo Attachment with Irregular Scatter Corner Likers */}
            <div className="relative bg-gray-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800"
                alt="Post Photo"
                className="w-full h-auto max-h-[420px] object-cover"
              />

              {/* Corner Likers */}
              {cornerLikers.length > 0 && (
                <div
                  className="absolute bottom-2 right-2 z-10 w-24 h-16 select-none pointer-events-none"
                  title="点赞的好友"
                >
                  {cornerLikers.map((liker, lIdx) => {
                    const irregularOffsets = [
                      { bottom: '6px', right: '6px', size: 'w-5 h-5', zIndex: 'z-20' },
                      { bottom: '22px', right: '26px', size: 'w-4 h-4', zIndex: 'z-10' },
                      { bottom: '2px', right: '34px', size: 'w-4.5 h-4.5', zIndex: 'z-15' },
                      { bottom: '24px', right: '2px', size: 'w-4.5 h-4.5', zIndex: 'z-18' },
                      { bottom: '36px', right: '16px', size: 'w-3.5 h-3.5', zIndex: 'z-12' },
                    ];
                    const pos = irregularOffsets[lIdx % irregularOffsets.length];
                    return (
                      <div
                        key={liker.id || lIdx}
                        style={{ bottom: pos.bottom, right: pos.right }}
                        className={`absolute ${pos.zIndex}`}
                      >
                        <div className="relative">
                          <img
                            src={liker.avatar}
                            alt={liker.name}
                            className={`${pos.size} rounded-full object-cover shrink-0 shadow-2xs ring-1 ring-white/90`}
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 text-white rounded-full flex items-center justify-center ring-1 ring-white shadow-2xs">
                            <Heart size={6} className="fill-white stroke-none" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="px-3.5 pt-2.5 pb-2 flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <button
                  aria-pressed={isPostLiked}
                  onClick={() => {
                    const nextLiked = !isPostLiked;
                    setIsPostLiked(nextLiked);
                    setPostLikesCount(nextLiked ? postLikesCount + 1 : postLikesCount - 1);
                  }}
                  className="min-h-11 flex items-center space-x-1.5 text-[#050505] hover:text-red-500 transition-colors cursor-pointer group"
                >
                  <Heart
                    size={19}
                    className={`transition-transform group-active:scale-125 ${
                      isPostLiked ? 'fill-rose-500 text-rose-500' : 'text-[#050505]'
                    }`}
                  />
                  <span className={`text-xs font-bold ${isPostLiked ? 'text-rose-500' : 'text-[#050505]'}`}>
                    {postLikesCount}赞
                  </span>
                </button>

                <div className="flex items-center space-x-1.5 text-[#050505]">
                  <MessageCircle size={19} className="text-[#050505]" />
                  <span className="text-xs font-bold">{commentsList.length}条</span>
                </div>

                <button
                  onClick={() => {
                    if (showToast) showToast('原型演示：动态分享入口，尚未复制链接');
                  }}
                  className="min-h-11 flex items-center space-x-1.5 text-[#050505] hover:text-[#1877F2] transition-colors cursor-pointer"
                >
                  <Share2 size={19} />
                  <span className="text-xs font-bold text-[#050505]">转发</span>
                </button>
              </div>

              <button
                type="button"
                aria-label={isPostSaved ? '取消收藏动态' : '收藏动态'}
                aria-pressed={isPostSaved}
                onClick={() => setIsPostSaved(saved => !saved)}
                className="w-11 h-11 flex items-center justify-center text-[#050505] hover:text-[#1877F2] transition-colors cursor-pointer"
              >
                <Bookmark size={19} className={isPostSaved ? 'fill-[#1877F2] text-[#1877F2]' : ''} />
              </button>
            </div>

            {/* Latest Liker Summary - Smaller and thinner font */}
            {cornerLikers.length > 0 && (
              <div className="px-3.5 text-[9.5px] text-[#65676B] mb-1 font-light tracking-tight">
                由 <span className="font-normal text-gray-800 cursor-pointer hover:underline">Hui Zhang</span> 等 <span className="font-normal text-gray-800">{postLikesCount} 人</span> 赞过
              </div>
            )}

            {/* Clean Comments */}
            <div className="px-3.5 pb-2.5 space-y-1.5">
              {commentsList.map((comment, cIdx) => (
                <div key={comment.id ? `${comment.id}-${cIdx}` : `comm-${cIdx}`} className="leading-snug flex items-start justify-between py-0.5 group">
                  <div className="flex items-start space-x-1.5 text-[#050505] min-w-0 flex-1">
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="w-4 h-4 rounded-full object-cover shrink-0 ring-1 ring-gray-200 border border-white mt-[1px] cursor-pointer hover:opacity-85"
                    />
                    <div className="leading-snug min-w-0">
                      <span className="text-[11.5px] font-semibold text-[#050505] mr-1.5 hover:underline cursor-pointer align-baseline">
                        {comment.userName}
                      </span>
                      <span className="text-[10.5px] font-normal text-gray-700 leading-relaxed align-baseline">{comment.content}</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 shrink-0 ml-2 pt-0.5 font-light">{comment.time}</span>
                </div>
              ))}

              {/* Clean Comment Input Field */}
              <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-2 border-t border-gray-100 mt-1.5">
                <input
                  type="text"
                  value={newCommentInput}
                  onChange={(e) => setNewCommentInput(e.target.value)}
                  placeholder="添加评论..."
                  className="flex-1 text-xs text-[#050505] placeholder-gray-400 outline-none bg-transparent"
                />
                <button
                  type="submit"
                  disabled={!newCommentInput.trim()}
                  className="text-xs font-bold text-[#1877F2] disabled:opacity-40 cursor-pointer"
                >
                  发布
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 6.5. Star Cards (星片) Timeline Section */}
        {(activeTab === 'all' || activeTab === 'stars') && (
          <div className="px-4 py-4 bg-amber-50/40 border-b border-amber-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>发布的星片 ({userStarCards.length})</span>
              </h3>
              <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                按时间倒序
              </span>
            </div>

            {userStarCards.length > 0 ? (
              <div className="space-y-4">
                {userStarCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white rounded-md border border-[#E4E6EB] p-3 shadow-[0_5px_14px_#172b4d18] space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="relative">
                          <img
                            src={card.authorAvatar}
                            alt={card.authorName}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center border border-white">
                            ★
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 flex items-center space-x-1">
                            <span>{card.authorName}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-md">
                              星片
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center space-x-1 mt-0.5">
                            <MapPin size={10} className="text-amber-500" />
                            <span>{card.location}</span>
                            <span>·</span>
                            <span>{card.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Text */}
                    {card.content && (
                      <p className="text-xs text-gray-800 leading-relaxed font-medium">
                        {card.content}
                      </p>
                    )}

                    {/* Frameless photo, with author and the stored creation date. */}
                    <div className="flex justify-center my-3">
                      <button type="button" aria-label={`打开星片：${card.location}`} onClick={() => setActiveStarModal(card)} className="relative w-full max-w-[292px] aspect-[3/4] bg-white rounded-md overflow-hidden shadow-[0_3px_0_#d2dae7,0_9px_16px_#172b4d30,0_18px_30px_#172b4d20] group cursor-pointer text-left">
                        {card.image || card.images?.[0] ? <img src={card.image || card.images?.[0]} alt={card.location} className="w-full h-full object-cover"/> : <div className="h-full flex flex-col justify-center p-6 gap-3 text-[#1C1E21]"><span className="text-3xl">✨</span><p className="text-sm line-clamp-5">{card.content}</p></div>}
                        <div className="absolute top-3 left-3 flex items-center gap-2 max-w-[calc(100%-85px)]"><img src={card.authorAvatar} alt={card.authorName} className="w-8 h-8 shrink-0 rounded-full object-cover shadow-md"/><span className="text-[10px] font-bold text-[#1C1E21] bg-white/95 rounded-md px-1.5 py-1 truncate">{card.authorName}</span></div>
                        <span title={starCardCreationDate(card).full} className="absolute top-3 right-3 flex items-center gap-1 text-[9px] font-bold text-[#1877F2] bg-white/95 rounded-md px-1.5 py-1 shadow-xs"><CalendarIcon size={12}/>{starCardCreationDate(card).short}</span>
                        {card.videoUrl && <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 text-[#1877F2] flex items-center justify-center shadow-md">▶</span>}
                        <span className="absolute bottom-3 left-3 max-w-[calc(100%-24px)] truncate text-[10px] font-bold text-[#1C1E21] px-2 py-1 rounded-md bg-white/95 shadow-xs">📍 {card.location.split('·')[0]}</span>
                      </button>
                    </div>

                    {/* Interactive Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                      <button
                        onClick={() => {
                          if (onLikePost) onLikePost(card.id);
                          if (showToast) showToast(card.likedByMe ? "已取消点赞" : "为星片点赞！✨");
                        }}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded-full font-bold transition-colors ${
                          card.likedByMe
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Heart size={14} className={card.likedByMe ? "fill-rose-500 text-rose-500" : ""} />
                        <span>{card.likes} 点赞</span>
                      </button>

                      <button
                        onClick={() => setActiveStarModal(card)}
                        className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        <MessageCircle size={14} />
                        <span>{card.commentsList?.length || card.comments || 0} 评论</span>
                      </button>
                    </div>

                    {/* Embedded Recent Comments Preview */}
                    {card.commentsList && card.commentsList.length > 0 && (
                      <div className="bg-amber-50/50 p-2.5 rounded-xl space-y-1.5 text-xs border border-amber-100">
                        {card.commentsList.slice(0, 2).map((c, cIdx) => (
                          <div key={c.id ? `embed-${c.id}-${cIdx}` : `embed-comm-${cIdx}`} className="flex items-start space-x-2">
                            <span className="font-bold text-gray-900 shrink-0">{c.userName}:</span>
                            <span className="text-gray-700 truncate">{c.content}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-amber-200 text-amber-700 text-xs">
                暂未发布星片，点击主页【+】按钮选择「发布星片」记录轨迹吧！✨
              </div>
            )}
          </div>
        )}

        {/* Map and profile use the same white star-card detail. */}
        {activeStarModal && <StarCardDetailModal
          card={discoverPosts.find(post => post.id === activeStarModal.id) || activeStarModal}
          onClose={() => setActiveStarModal(null)}
          onLike={() => {onLikePost?.(activeStarModal.id);showToast?.('已更新点赞');}}
          commentValue={activeStarCommentInput}
          onCommentChange={setActiveStarCommentInput}
          onSubmitComment={() => {
            if (!activeStarCommentInput.trim()) return;
            onAddCommentToPost?.(activeStarModal.id,activeStarCommentInput.trim());
            setActiveStarCommentInput('');
            showToast?.('评论已发布！💬');
          }}
        />}

        {/* 7. Photos Section */}
        {(activeTab === 'all' || activeTab === 'photos') && (
          <div className="px-4 py-3.5 bg-white space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#050505] uppercase tracking-wider flex items-center space-x-1.5">
                <ImageIcon size={14} className="text-[#1877F2]" />
                <span>照片 (42)</span>
              </h3>
              <span className="text-xs text-[#1877F2] font-bold cursor-pointer hover:underline">查看全部</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=400"
                  alt="Photo 1"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400"
                  alt="Photo 2"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400"
                  alt="Photo 3"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: 原点二维码名片弹窗 (Dot-matrix QR Code Modal)                      */}
        {/* ========================================================================= */}
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white border border-[#E4E6EB] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
              
              {/* Modal Top Header */}
              <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between bg-gray-50/70">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center border border-blue-200">
                    <QrCode size={14} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black text-[#050505]">原点二维码名片</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* QR Card Body */}
              <div className="p-6 flex flex-col items-center text-center space-y-4 bg-gradient-to-b from-blue-50/40 via-white to-white">
                {/* User Info Header */}
                <div className="flex items-center space-x-3 text-left w-full px-2">
                  <div className="relative">
                    <img
                      src={profileAvatar}
                      alt={profileName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1877F2]/40"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1877F2] text-white rounded-full flex items-center justify-center ring-2 ring-white">
                      <CheckCircle2 size={10} className="stroke-[3]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-sm font-black text-[#050505] truncate">{profileName}</h4>
                      <span className="text-[10px] bg-blue-100 text-[#1877F2] font-bold px-1.5 py-0.2 rounded-full">PRO</span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      ID: 8829031 · {profileLocation || '北京'}
                    </p>
                  </div>
                </div>

                {/* Dot-matrix QR Code Display */}
                <div className="p-4 bg-white rounded-2xl border border-[#E4E6EB] shadow-xs flex items-center justify-center">
                  <DotMatrixQR
                    size={200}
                    avatar={profileAvatar}
                  />
                </div>

                {/* Explanatory text */}
                <p className="text-xs text-gray-500 leading-relaxed px-3">
                  扫一扫上面的原点二维码，添加我为好友并查看专属星图动态
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (showToast) showToast('原型演示：名片保存入口，尚未保存到相册');
                    }}
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-all active:scale-98 cursor-pointer"
                  >
                    <Download size={14} className="stroke-[2.5]" />
                    <span>保存名片</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (showToast) showToast('原型演示：名片口令入口，尚未写入剪贴板');
                    }}
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-[#F0F2F5] hover:bg-gray-200 text-[#050505] text-xs font-bold border border-[#E4E6EB] transition-all active:scale-98 cursor-pointer"
                  >
                    <Copy size={14} />
                    <span>复制口令</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (showToast) showToast('原型演示：名片分享入口，尚未调起系统分享');
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-[#1877F2] hover:underline cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Share2 size={13} />
                  <span>分享给好友或微信群</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: 嗜好分类多子母菜单弹窗 (Hobbies Multi-level Subcategory Selector)   */}
        {/* ========================================================================= */}
        {isHobbyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white border border-[#E4E6EB] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]">
              
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between bg-gray-50/70 shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                    <Sparkles size={14} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#050505]">选择嗜好分类 (多子母层级)</h3>
                    <p className="text-[10px] text-gray-500">点击母分类切换，勾选或添加子标签</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHobbyModalOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Selected Tags Preview Bar */}
              <div className="p-3 bg-blue-50/50 border-b border-blue-100 flex flex-wrap items-center gap-1.5 shrink-0 max-h-24 overflow-y-auto">
                <span className="text-[11px] font-bold text-[#1877F2] shrink-0 mr-1">
                  已选择 ({tempSelectedHobbies.length}):
                </span>
                {tempSelectedHobbies.length === 0 ? (
                  <span className="text-[11px] text-gray-400">尚未选择任何嗜好标签</span>
                ) : (
                  tempSelectedHobbies.map((hobby, idx) => (
                    <span
                      key={`hobby-${hobby}-${idx}`}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white text-[#1877F2] border border-blue-200 flex items-center space-x-1 shadow-2xs"
                    >
                      <span>{hobby}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempSelectedHobbies(tempSelectedHobbies.filter((_, i) => i !== idx));
                        }}
                        className="text-blue-400 hover:text-red-500 cursor-pointer ml-0.5"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Two-Column Multi-level Category Selector */}
              <div className="flex-1 flex overflow-hidden min-h-[280px]">
                {/* Left Parent Categories Navigation */}
                <div className="w-1/3 border-r border-[#E4E6EB] bg-gray-50/60 p-2 space-y-1 overflow-y-auto shrink-0">
                  {HOBBY_TAXONOMY.map((cat) => {
                    const isCurrent = selectedHobbyCategory === cat.id;
                    const countInCat = cat.subcategories.filter((sub) => tempSelectedHobbies.includes(sub)).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedHobbyCategory(cat.id)}
                        className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isCurrent
                            ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                            : 'text-[#050505] hover:bg-gray-200/70 border border-transparent'
                        }`}
                      >
                        <span className="flex items-center space-x-1.5 truncate">
                          <cat.icon size={14} className={cat.iconColor || "text-[#1877F2]"} />
                          <span className="truncate">{cat.name}</span>
                        </span>
                        {countInCat > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                            {countInCat}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Subcategories Grid */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                  {(() => {
                    const currentCategory = HOBBY_TAXONOMY.find((c) => c.id === selectedHobbyCategory) || HOBBY_TAXONOMY[0];
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <h4 className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
                            <currentCategory.icon size={14} className={currentCategory.iconColor || "text-[#1877F2]"} />
                            <span>{currentCategory.name} 子分类</span>
                          </h4>
                          <span className="text-[10px] text-gray-400">可多选</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {currentCategory.subcategories.map((sub, subIdx) => {
                            const isSelected = tempSelectedHobbies.includes(sub);
                            return (
                              <button
                                key={`${sub}-${subIdx}`}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setTempSelectedHobbies(tempSelectedHobbies.filter((h) => h !== sub));
                                  } else {
                                    setTempSelectedHobbies([...tempSelectedHobbies, sub]);
                                  }
                                }}
                                className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between border cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50/80 border-[#1877F2] text-[#1877F2] shadow-2xs'
                                    : 'bg-white border-[#E4E6EB] text-[#050505] hover:border-gray-300'
                                }`}
                              >
                                <span className="truncate">{sub}</span>
                                {isSelected ? (
                                  <Check size={14} className="text-[#1877F2] stroke-[3] shrink-0" />
                                ) : (
                                  <Plus size={13} className="text-gray-300 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Add Custom Tag Bar */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      自定义添加个性标签:
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={customHobbyInput}
                        onChange={(e) => setCustomHobbyInput(e.target.value)}
                        placeholder="例如: 陆地冲浪板、黑胶唱片..."
                        className="flex-1 bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg px-2.5 py-1.5 text-xs text-[#050505] outline-none focus:bg-white focus:border-[#1877F2]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (customHobbyInput.trim() && !tempSelectedHobbies.includes(customHobbyInput.trim())) {
                              setTempSelectedHobbies([...tempSelectedHobbies, customHobbyInput.trim()]);
                              setCustomHobbyInput('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customHobbyInput.trim() && !tempSelectedHobbies.includes(customHobbyInput.trim())) {
                            setTempSelectedHobbies([...tempSelectedHobbies, customHobbyInput.trim()]);
                            setCustomHobbyInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-[#1877F2] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="p-3 bg-gray-50 border-t border-[#E4E6EB] flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setTempSelectedHobbies([])}
                  className="text-xs font-bold text-gray-500 hover:text-red-500 cursor-pointer"
                >
                  清空已选
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsHobbyModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#E4E6EB] text-xs font-bold text-[#050505] hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileHobbies(tempSelectedHobbies.join('、'));
                      setIsHobbyModalOpen(false);
                      if (showToast) showToast(`已更新爱好标签 (${tempSelectedHobbies.length} 项)`);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-all active:scale-98 cursor-pointer flex items-center space-x-1"
                  >
                    <Check size={14} className="stroke-[3]" />
                    <span>确认应用 ({tempSelectedHobbies.length})</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Modal 1: Avatar & Name Only ("点击修改，只修改个人头像和名称") */}
        {isAvatarNameModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white border border-[#E4E6EB] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col animate-[scaleUp_0.2s_ease-out]">
              
              {/* Modal Header */}
              <div className="px-4 py-3.5 bg-gray-50 border-b border-[#E4E6EB] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#050505]">修改个人头像和名称</h3>
                  <p className="text-[10px] font-bold text-[#1877F2]">只修改个人头像与名称，不影响其他信息</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarNameModalOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-4">
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-2.5">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full border-2 border-[#1877F2] p-0.5 shadow-md overflow-hidden bg-white">
                      <img src={tempAvatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    </div>
                  </div>

                  {/* Preset Avatar Selectors */}
                  <div className="w-full">
                    <label className="text-[10px] font-extrabold text-gray-500 block text-center mb-1.5">选择预设头像</label>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {avatarPresets.map((preset, idx) => (
                        <button
                          key={`avatar-preset-${idx}`}
                          type="button"
                          aria-label={`选择预设头像 ${idx + 1}`}
                          aria-pressed={tempAvatar === preset}
                          onClick={() => setTempAvatar(preset)}
                          className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            tempAvatar === preset ? 'border-[#1877F2] scale-110 ring-2 ring-[#1877F2]/30' : 'border-gray-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={preset} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Avatar URL Input */}
                  <div className="w-full pt-1">
                    <label className="text-[10px] font-extrabold text-gray-500 block mb-1">或输入自定义头像图片 URL:</label>
                    <input
                      type="text"
                      value={tempAvatar}
                      onChange={(e) => setTempAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg px-2.5 py-1.5 text-xs text-[#050505] outline-none focus:bg-white focus:border-[#1877F2]"
                    />
                  </div>
                </div>

                {/* Name Section */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="text-[11px] font-bold text-[#050505] block mb-1">
                    个人名称 / 昵称:
                  </label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="输入个人名称"
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg px-3 py-2 text-sm font-bold text-[#050505] outline-none focus:bg-white focus:border-[#1877F2]"
                  />
                </div>

              </div>

              {/* Modal Footer Controls */}
              <div className="p-3 bg-gray-50 border-t border-[#E4E6EB] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAvatarNameModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#E4E6EB] text-xs font-bold text-[#050505] hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tempAvatar.trim()) setProfileAvatar(tempAvatar.trim());
                    if (tempName.trim()) setProfileName(tempName.trim());
                    setIsAvatarNameModalOpen(false);
                    if (showToast) showToast('已成功更新个人头像和名称 ✨');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-all active:scale-98 cursor-pointer flex items-center space-x-1"
                >
                  <Check size={14} className="stroke-[3]" />
                  <span>确认修改</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Modal 2: Bubble Status & Signature Only ("点击气泡，仅改动气泡表情和签名，不是修改个人信息") */}
        {isBubbleStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white border border-[#E4E6EB] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col animate-[scaleUp_0.2s_ease-out]">
              
              {/* Modal Header */}
              <div className="px-4 py-3.5 bg-gray-50 border-b border-[#E4E6EB] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#050505]">修改气泡状态与签名</h3>
                  <p className="text-[10px] font-bold text-[#1877F2]">仅改动气泡表情、在线状态与签名，不改个人信息</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBubbleStatusModalOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-4">
                
                {/* Bubble Emoji Picker */}
                <div>
                  <label className="text-[11px] font-bold text-[#050505] block mb-1.5">
                    气泡挂件表情:
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['😜', '✍️', '🔥', '☕️', '🎧', '💼', '🎮', '✈️', '🌟', '😴', '🚴', '🍀', '💥', '🍹', '🎨'].map((emo, eIdx) => (
                      <button
                        key={`${emo}-${eIdx}`}
                        type="button"
                        onClick={() => setTempEmoji(emo)}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border transition-all cursor-pointer ${
                          tempEmoji === emo ? 'bg-[#1877F2]/10 border-[#1877F2] scale-110' : 'bg-[#F0F2F5] border-[#E4E6EB] hover:bg-gray-200'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tempEmoji}
                    onChange={(e) => setTempEmoji(e.target.value)}
                    placeholder="输入自定义 Emoji"
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg px-2.5 py-1.5 text-xs text-[#050505] outline-none focus:bg-white focus:border-[#1877F2]"
                  />
                </div>

                {/* Mood Status Text */}
                <div>
                  <label className="text-[11px] font-bold text-[#050505] block mb-1">
                    在线 / 心情状态文本:
                  </label>
                  <input
                    type="text"
                    value={tempMoodStatus}
                    onChange={(e) => setTempMoodStatus(e.target.value)}
                    placeholder="例如：在线、忙碌、工作中"
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg px-3 py-1.5 text-xs font-bold text-[#050505] outline-none focus:bg-white focus:border-[#1877F2]"
                  />
                </div>

                {/* Signature Text */}
                <div>
                  <label className="text-[11px] font-bold text-[#050505] block mb-1">
                    个性签名:
                  </label>
                  <textarea
                    rows={2}
                    value={tempSignature}
                    onChange={(e) => setTempSignature(e.target.value)}
                    placeholder="例如：音乐不停，分享不止..."
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg px-3 py-1.5 text-xs font-medium text-[#050505] outline-none focus:bg-white focus:border-[#1877F2] resize-none"
                  />
                </div>

                {/* Photo-cutout Label Stickers Management Section */}
                <div className="pt-2 border-t border-[#E4E6EB]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-black text-[#050505]">🏷️ 头像环绕真人照片贴纸</span>
                      <span className="text-[10px] text-[#65676B]">({userStickers.length}/6)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsBubbleStatusModalOpen(false);
                          setIsStickerManagerOpen(true);
                        }}
                        className="px-2 py-1 rounded-md bg-white border border-[#E4E6EB] text-[#1877F2] text-[10px] font-bold hover:border-[#1877F2] transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Layers size={11} />
                        <span>位置编排</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreateStickerModalOpen(true)}
                        className="px-2.5 py-1 rounded-full bg-[#1877F2] text-white text-[10px] font-black hover:bg-blue-700 transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                      >
                        <Plus size={11} className="stroke-[3]" />
                        <span>新建真人贴纸</span>
                      </button>
                    </div>
                  </div>

                  {/* Stickers Strip */}
                  <div className="grid grid-cols-3 gap-2">
                    {userStickers.map((stk) => (
                      <div
                        key={stk.id}
                        className="relative p-2 bg-[#F0F2F5] rounded-md border border-[#E4E6EB] flex flex-col items-center text-center group"
                      >
                        <button
                          type="button"
                          onClick={() => handleDeleteUserSticker(stk.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
                          title="删除贴纸"
                        >
                          <X size={10} />
                        </button>
                        <div
                          className="w-9 h-9 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-2xs mb-1"
                          style={{
                            border: `${stk.border.widthPx}px solid ${stk.border.color}`,
                          }}
                        >
                          <img src={stk.cutoutUrl} alt={stk.label} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[9px] font-black text-[#050505] truncate w-full">{stk.label}</span>
                        <span className="text-[8px] text-rose-500 font-bold">❤️ {stk.likes}</span>
                      </div>
                    ))}
                    {userStickers.length === 0 && (
                      <div className="col-span-3 py-4 text-center text-xs text-[#65676B]">
                        暂无真人贴纸，点击上方按钮新建属于你的个性贴纸！
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer Controls */}
              <div className="p-3 bg-gray-50 border-t border-[#E4E6EB] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBubbleStatusModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#E4E6EB] text-xs font-bold text-[#050505] hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileEmoji(tempEmoji);
                    setProfileData((prev) => ({
                      ...prev,
                      moodStatus: tempMoodStatus,
                      signature: tempSignature,
                    }));
                    setIsBubbleStatusModalOpen(false);
                    if (showToast) showToast('已保存气泡状态与签名 ✍️');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-all active:scale-98 cursor-pointer flex items-center space-x-1"
                >
                  <Check size={14} className="stroke-[3]" />
                  <span>保存状态</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* RealMoji Photo Cutout Sticker Creation Modal */}
        <CreateLabelStickerModal
          isOpen={isCreateStickerModalOpen}
          onClose={() => setIsCreateStickerModalOpen(false)}
          currentStickersCount={userStickers.length}
          onSaveSticker={handleSaveNewSticker}
          onShowToast={showToast}
        />

        {/* RealMoji Sticker Management & Orbit Position Editor Modal */}
        <StickerManagementModal
          isOpen={isStickerManagerOpen}
          onClose={() => setIsStickerManagerOpen(false)}
          stickers={userStickers}
          avatarUrl={profileAvatar}
          userName={profileName}
          onSaveStickers={(updated) => {
            setUserStickers(updated);
            setProfileData((prev) => ({
              ...prev,
              stickers: updated,
            }));
          }}
          onOpenCreateSticker={() => {
            setIsStickerManagerOpen(false);
            setIsCreateStickerModalOpen(true);
          }}
          onShowToast={showToast}
        />

      </div>
    </div>
  );
};
