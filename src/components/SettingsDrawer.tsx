import React, { useState, useEffect } from 'react';
import { useDialogFocus } from '../utils/useDialogFocus';
import {
  X,
  Shield,
  Eye,
  Bell,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  User,
  Car,
  Folder,
  Lock,
  Volume2,
  Sparkles,
  FolderOpen,
  MessageSquare,
  MessageCircle,
  StickyNote,
  HeartHandshake,
  Calendar,
  Search,
  Trash2,
  Database,
  Download,
  RefreshCw,
  Cpu,
  Activity,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  Compass,
  Layers,
  FileDown,
  Check,
  Info,
  ShieldAlert,
  Sliders,
  MapPin,
  Users,
  EyeOff,
  Flame,
  Briefcase,
  GraduationCap,
  Cake,
  Heart,
  Home,
  Link2,
  Music,
  Tv,
  Gamepad2,
  Mail,
  Phone,
  Award,
  AtSign,
  Image as ImageIcon,
  Camera,
  Upload,
  History,
} from 'lucide-react';
import type { MapStyleMode } from '../utils/geoUtils';
import { downloadSystemManual } from '../utils/documentationGenerator';
import { ProfileData } from '../types';

export interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  userAvatar?: string;
  onUpdateAvatar?: (avatar: string) => void;
  onSelectTab: (tab: 'home' | 'chat' | 'teams' | 'discover' | 'stellar' | 'profile' | 'calendar') => void;
  trafficEnabled?: boolean;
  onToggleTraffic?: () => void;
  mapStyle?: MapStyleMode;
  onChangeMapStyle?: (style: MapStyleMode) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isStealthMode?: boolean;
  onToggleStealth?: () => void;
  onOpenKeyConfig?: () => void;
  activeMapFilter?: string | string[];
  onSelectMapFilter?: (filter: 'all' | 'family' | 'friends' | 'groups' | 'activities' | 'stars') => void;
  showToast?: (msg: string) => void;
  // Quick Control Center entry points
  onOpenDocumentCenter?: () => void;
  onOpenNoteEditor?: () => void;
  onOpenStellarWorkspace?: () => void;
  onOpenChatManagement?: () => void;
  onOpenFamilyGroup?: () => void;
  onOpenFamilyCare?: () => void;
  onOpenSearch?: () => void;
  onOpenAddModal?: () => void;
  onOpenNotifications?: () => void;
  onOpenCalendar?: () => void;
  onOpenExploration?: () => void;
  unreadNotificationsCount?: number;
  onLogout?: () => void;
  onSimulateCloseFriendMessage?: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  profileData,
  setProfileData,
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  onUpdateAvatar,
  onSelectTab,
  trafficEnabled = true,
  onToggleTraffic,
  mapStyle = 'standard',
  onChangeMapStyle,
  isDarkMode = false,
  onToggleDarkMode,
  isStealthMode = false,
  onToggleStealth,
  activeMapFilter = [],
  onSelectMapFilter,
  showToast,
  onOpenDocumentCenter,
  onOpenNoteEditor,
  onOpenStellarWorkspace,
  onOpenChatManagement,
  onOpenFamilyGroup,
  onOpenFamilyCare,
  onOpenSearch,
  onOpenAddModal,
  onOpenNotifications,
  onOpenCalendar,
  onOpenExploration,
  unreadNotificationsCount = 0,
  onLogout,
  onSimulateCloseFriendMessage,
}) => {
  // Nested sub-page navigation state
  const [activeView, setActiveView] = useState<
    | 'main'
    | 'locationVisibility'
    | 'locationPrecision'
    | 'myStarPoints'
    | 'familyCircle'
    | 'logoutConfirm'
    | 'editProfile'
    | 'accountSecurity'
    | 'whoCanMessage'
    | 'blockedUsers'
    | 'help'
    | 'about'
  >('main');

  const activeFilters = Array.isArray(activeMapFilter)
    ? activeMapFilter
    : activeMapFilter
    ? [activeMapFilter]
    : ['friends', 'activities', 'stars', 'family', 'life'];

  // Interactive settings state (locally driven but synced with UI)
  const [locVisibility, setLocVisibility] = useState<'everyone' | 'chatted' | 'invisible'>('everyone');
  const [locPrecision, setLocPrecision] = useState<'precise' | 'blurred' | 'city'>('precise');
  const [msgPermission, setMsgPermission] = useState<'everyone' | 'nearby' | 'starpoints'>('everyone');
  const [activityStatus, setActivityStatus] = useState<boolean>(true);
  
  // Notification states
  const [starPointNotif, setStarPointNotif] = useState<boolean>(true);
  const [nearbyNotif, setNearbyNotif] = useState<boolean>(true);
  const [sosNotif, setSosNotif] = useState<boolean>(true); // Cannot be muted warning

  // Cache & system states
  const [cacheCleared, setCacheCleared] = useState(false);
  const [hapticSoundEnabled, setHapticSoundEnabled] = useState(true);
  const [dndEnabled, setDndEnabled] = useState(false);

  // Profile values derived directly from parent profileData
  const operatorName = profileData?.operatorName || 'Alexia Vance';
  const operatorId = profileData?.operatorId || 'stellar_alexia';
  const operatorBio = profileData?.operatorBio || '在线';
  const moodStatus = profileData?.moodStatus || '在线';
  const signature = profileData?.signature || '音乐不停，分享不止...';
  const aboutYou = profileData?.aboutYou || '自由职业，热爱科技、网络安全与户外探索。';
  const pinnedDetail = profileData?.pinnedDetail || '数字内容创作者';
  const category = profileData?.category || '数字内容创作者 · 运动员';
  const isAICreator = profileData?.isAICreator || false;
  const currentCity = profileData?.currentCity || '甘肃省兰州市城关区';
  const hometown = profileData?.hometown || '甘肃省天水市';
  const birthday = profileData?.birthday || '1996-10-12';
  const relationshipStatus = profileData?.relationshipStatus || '单身';
  const familyStatus = profileData?.familyStatus || '陈建国 (父亲)';
  const gender = profileData?.gender || '男性';
  const languages = profileData?.languages || '中文 (普通话), 英语';
  const websiteLink = profileData?.websiteLink || 'https://stellar.vance.io';
  const workExperience = profileData?.workExperience || 'Stellar 地图探索及安全控制工作室';
  const educationHistory = profileData?.educationHistory || '兰州大学 · 计算机科学与技术';
  const hobbies = profileData?.hobbies || 'DotA 2, 徒步登山, 摄影, 骑行';
  const interestsMusic = profileData?.interestsMusic || 'Post-Rock, Ambient, Electronic';
  const interestsTV = profileData?.interestsTV || '黑客军团 (Mr. Robot), 硅谷';
  const interestsMovie = profileData?.interestsMovie || '黑客帝国, 星际穿越';
  const interestsGame = profileData?.interestsGame || 'DotA 2, Cyberpunk 2077';
  const interestsSports = profileData?.interestsSports || '极客自行车队, 越野跑';
  const travelPlaces = profileData?.travelPlaces || '青海湖, 祁连山, 麦积山石窟';
  const socialMedia = profileData?.socialMedia || 'stellar_alexia_social';
  const phoneNumber = profileData?.phoneNumber || '+86 181 9097 2878';
  const emailAddress = profileData?.emailAddress || 'alexia.vance@stellar.net';
  const promoMaterials = profileData?.promoMaterials || 'https://youtube.com/stellar_showcase';

  const updateProfileField = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Avatar Management: 3 Historical Avatars + Custom Album selection
  const [historyAvatars, setHistoryAvatars] = useState<string[]>([
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
  ]);
  const [currentAvatar, setCurrentAvatar] = useState<string>(userAvatar);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [selectedAlbumCategory, setSelectedAlbumCategory] = useState<'curated' | 'geek' | 'nature' | 'art'>('curated');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Synchronize incoming userAvatar prop
  useEffect(() => {
    if (userAvatar) {
      setCurrentAvatar(userAvatar);
      setHistoryAvatars((prev) => {
        if (prev.includes(userAvatar)) {
          return prev;
        }
        return [userAvatar, prev[0], prev[1]].filter(Boolean).slice(0, 3);
      });
    }
  }, [userAvatar]);

  const handleSelectAvatar = (newUrl: string, label?: string) => {
    setCurrentAvatar(newUrl);
    setHistoryAvatars((prev) => {
      const filtered = prev.filter((a) => a !== newUrl);
      return [newUrl, ...filtered].slice(0, 3);
    });
    if (onUpdateAvatar) {
      onUpdateAvatar(newUrl);
    }
    if (showToast) {
      showToast(label ? `已切换为 ${label} 👤` : '已一键切换头像 👤');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const uploadedUrl = reader.result as string;
        handleSelectAvatar(uploadedUrl, '相册自选照片');
        setIsAlbumModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const ALBUM_PRESETS = [
    {
      id: 'curated',
      name: '系统精选',
      items: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      ],
    },
    {
      id: 'geek',
      name: '科技极客',
      items: [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
      ],
    },
    {
      id: 'nature',
      name: '自然探索',
      items: [
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1534751516642-a171edd2521d?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300',
      ],
    },
    {
      id: 'art',
      name: '艺术肖像',
      items: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=300',
      ],
    },
  ];

  // Section expansion state in Edit Profile view
  const [openProfileSection, setOpenProfileSection] = useState<string | null>('profile');

  const dialog = useDialogFocus(isOpen, () => isAlbumModalOpen ? setIsAlbumModalOpen(false) : onClose());

  if (!isOpen) return null;

  const handleClearCache = () => {
    setCacheCleared(true);
    if (showToast) showToast('已清空本地渲染缓存，释放 248.6 MB 内存空间 🧹');
  };

  const handleExportBackup = () => {
    if (showToast) showToast('已生成加密数据资产备份包 (Stellar_Backup.zip) 📦');
  };

  const handleRotateKeys = () => {
    if (showToast) showToast('端到端 (E2EE) 会话加密密钥已重新协商轮换 🔒');
  };

  // Helper text mapping for current selected states
  const getLocVisibilityText = () => {
    if (locVisibility === 'everyone') return '所有人';
    if (locVisibility === 'chatted') return '仅对话过的用户';
    return '隐身 (幽灵模式)';
  };

  const getLocPrecisionText = () => {
    if (locPrecision === 'precise') return '精确坐标';
    if (locPrecision === 'blurred') return '模糊范围';
    return '城市/地区级';
  };

  const getMsgPermissionText = () => {
    if (msgPermission === 'everyone') return '所有人';
    if (msgPermission === 'nearby') return '仅附近的人';
    return '仅共同星点成员';
  };

  return (
    <div ref={dialog} tabIndex={-1} className="absolute inset-0 z-[220] flex select-none font-sans" id="settings-drawer-wrapper">
      {/* Backdrop */}
      <div
        id="settings-drawer-backdrop"
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel - Pure Facebook White Straight-Edge Design System */}
      <div 
        id="settings-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title"
        className="relative w-[88%] max-w-[360px] h-full bg-white text-[#050505] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r border-[#E4E6EB]"
      >
        
        {/* ============================================================== */}
        {/* 1. NESTED NAVIGATION HEADER                                     */}
        {/* ============================================================== */}
        <div className="p-4 bg-white border-b border-[#E4E6EB] shrink-0 shadow-2xs flex items-center justify-between" id="settings-header">
          <div className="flex items-center space-x-2">
            {activeView !== 'main' && (
              <button
                type="button"
                id="settings-back-btn"
                onClick={() => setActiveView('main')}
                className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[#F0F2F5] active:scale-95 transition-all text-[#1877F2] cursor-pointer"
                aria-label="返回上一级"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            <h2 className="font-bold text-[#050505] text-base" id="settings-title">
              {activeView === 'main' && '设置与动态'}
              {activeView === 'locationVisibility' && '位置可见性'}
              {activeView === 'locationPrecision' && '定位精确度'}
              {activeView === 'myStarPoints' && '我创建的星点'}
              {activeView === 'familyCircle' && '家庭看护监护圈'}
              {activeView === 'logoutConfirm' && '登出确认'}
              {activeView === 'editProfile' && '编辑个人名片'}
              {activeView === 'accountSecurity' && '账户与安全'}
              {activeView === 'whoCanMessage' && '对话发起权限'}
              {activeView === 'blockedUsers' && '已拉黑用户'}
              {activeView === 'help' && '帮助与反馈'}
              {activeView === 'about' && '关于 Stellar OS'}
            </h2>
          </div>

          <button
            type="button"
            id="settings-close-btn"
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] active:scale-95 flex items-center justify-center cursor-pointer transition-all shrink-0"
            aria-label="关闭设置"
          >
            <X size={16} />
          </button>
        </div>

        {/* ============================================================== */}
        {/* 2. SCROLLABLE CONTENT BODY WITH DYNAMIC VIEW SWITCHING         */}
        {/* ============================================================== */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-3 custom-scrollbar" id="settings-scroll-body">
          
          {/* ========================================== */}
          {/* VIEW 1: MAIN SETTINGS MENU                 */}
          {/* ========================================== */}
          {activeView === 'main' && (
            <div className="space-y-3" id="view-main-content">
              
              {/* Account Overview Card - Moved to the very top */}
              <div 
                id="main-profile-card"
                className="bg-white border border-[#E4E6EB] rounded-md p-3 flex items-center justify-between hover:border-[#1877F2] transition-all shadow-2xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                      alt="Avatar"
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-[#1877F2]/20"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#31A24C] ring-2 ring-white flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-bold text-[#050505] text-sm truncate">{operatorName}</h3>
                      <span className="text-[9px] font-bold bg-[#E7F3FF] text-[#1877F2] px-1.5 py-0.5 rounded-full border border-[#1877F2]/20 shrink-0">
                        操作员
                      </span>
                    </div>
                    <p className="text-[11px] text-[#65676B] mt-0.5 truncate">
                      @{operatorId} · {moodStatus} · {signature}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="go-edit-profile-btn"
                  onClick={() => setActiveView('editProfile')}
                  className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-gray-400 hover:text-[#1877F2] transition-colors cursor-pointer"
                  aria-label="编辑个人资料"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Top Quick Control Bar Grid (放置原顶栏快捷操作) */}
              <div className="space-y-1.5" id="section-topbar-quick-controls">
                <div className="px-1 text-[11px] font-bold text-[#65676B] tracking-wide uppercase flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles size={12} className="text-[#1877F2]" />
                    <span>顶栏快捷控制台</span>
                  </div>
                  <span className="text-[10px] text-[#1877F2] font-semibold">快捷功能入口</span>
                </div>

                <div className="p-2.5 bg-white border border-[#E4E6EB] rounded-md grid grid-cols-3 gap-2 shadow-2xs">
                  {/* 1. 深色模式 */}
                  <button
                    aria-label="切换深色模式" aria-pressed={isDarkMode}
                    type="button"
                    onClick={() => {
                      if (onToggleDarkMode) onToggleDarkMode();
                      if (showToast) showToast(!isDarkMode ? '已切换至深色模式 🌙' : '已恢复浅色模式 ☀️');
                    }}
                    className={`p-2.5 rounded-md flex flex-col items-center justify-center transition-all cursor-pointer border shadow-2xs ${
                      isDarkMode
                        ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] font-bold'
                        : 'bg-white hover:bg-[#F0F2F5] text-[#050505] border-[#E4E6EB] hover:border-[#1877F2]'
                    }`}
                  >
                    {isDarkMode ? <Sun size={18} className="text-amber-500 mb-1" /> : <Moon size={18} className="text-[#1877F2] mb-1" />}
                    <span className="text-[11px] font-bold text-[#050505]">深色模式</span>
                    <span className="text-[9px] text-[#65676B]">{isDarkMode ? '已开启' : '关闭'}</span>
                  </button>

                  {/* 2. 活动日历 */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenCalendar) onOpenCalendar();
                      else onSelectTab('calendar');
                    }}
                    className="p-2.5 bg-white hover:bg-[#F0F2F5] rounded-md flex flex-col items-center justify-center transition-all cursor-pointer border border-[#E4E6EB] hover:border-[#1877F2] text-[#050505] shadow-2xs"
                  >
                    <Calendar size={18} className="text-[#1877F2] mb-1" />
                    <span className="text-[11px] font-bold text-[#050505]">活动日历</span>
                    <span className="text-[9px] text-[#65676B]">课表日程</span>
                  </button>

                  {/* 3. 隐身幽灵 */}
                  <button
                      aria-label="雷达隐身模式（轨迹冻结）" aria-pressed={isStealthMode}
                    type="button"
                    onClick={() => {
                      if (onToggleStealth) onToggleStealth();
                      if (showToast) showToast(!isStealthMode ? '已开启隐身模式 👻' : '已恢复正常可见');
                    }}
                    className={`p-2.5 rounded-md flex flex-col items-center justify-center transition-all cursor-pointer border shadow-2xs ${
                      isStealthMode
                        ? 'bg-purple-50 border-purple-500 text-purple-600 font-bold'
                        : 'bg-white hover:bg-[#F0F2F5] text-[#050505] border-[#E4E6EB] hover:border-[#1877F2]'
                    }`}
                  >
                    <EyeOff size={18} className={isStealthMode ? 'text-purple-600 mb-1' : 'text-[#65676B] mb-1'} />
                    <span className="text-[11px] font-bold text-[#050505]">隐身模式</span>
                    <span className="text-[9px] text-[#65676B]">{isStealthMode ? '隐身中' : '正常'}</span>
                  </button>

                  {/* 4. 通知中心 */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenNotifications) onOpenNotifications();
                    }}
                    className="p-2.5 bg-white hover:bg-[#F0F2F5] rounded-md flex flex-col items-center justify-center transition-all cursor-pointer border border-[#E4E6EB] hover:border-[#1877F2] text-[#050505] shadow-2xs relative"
                  >
                    <div className="relative mb-1">
                      <Bell size={18} className="text-[#1877F2]" />
                      <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-[#FA383E] text-white rounded-full text-[8px] font-black flex items-center justify-center">
                        {unreadNotificationsCount > 0 ? unreadNotificationsCount : 4}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#050505]">通知提醒</span>
                    <span className="text-[9px] text-[#65676B]">{unreadNotificationsCount > 0 ? `${unreadNotificationsCount}条未读` : '4条未读'}</span>
                  </button>

                  {/* 5. 搜索查找 */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenSearch) onOpenSearch();
                    }}
                    className="p-2.5 bg-white hover:bg-[#F0F2F5] rounded-md flex flex-col items-center justify-center transition-all cursor-pointer border border-[#E4E6EB] hover:border-[#1877F2] text-[#050505] shadow-2xs"
                  >
                    <Search size={18} className="text-[#1877F2] mb-1" />
                    <span className="text-[11px] font-bold text-[#050505]">全局搜索</span>
                    <span className="text-[9px] text-[#65676B]">搜索好友</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenExploration?.();
                    }}
                    className="p-2.5 bg-white hover:bg-[#F0F2F5] rounded-md flex flex-col items-center justify-center transition-all cursor-pointer border border-[#E4E6EB] hover:border-[#1877F2] text-[#050505] shadow-2xs"
                  >
                    <Compass size={18} className="text-[#1877F2] mb-1" />
                    <span className="text-[11px] font-bold text-[#050505]">探索与足迹</span>
                    <span className="text-[9px] text-[#65676B]">城市探索记录</span>
                  </button>

                  {/* 6. 发布创建 */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenAddModal) onOpenAddModal();
                    }}
                    className="p-2.5 bg-[#1877F2] hover:bg-[#166fe5] border border-[#1877F2] rounded-md flex flex-col items-center justify-center transition-all cursor-pointer text-white shadow-2xs active:scale-98"
                  >
                    <Flame size={18} className="text-white mb-1" />
                    <span className="text-[11px] font-bold text-white">发布创建</span>
                    <span className="text-[9px] text-blue-100">新建内容</span>
                  </button>
                </div>
              </div>

              {/* Radar Style Renderer - Moved to the very top & Added default-on layer switches */}
              <div className="space-y-1.5" id="section-radar-style">
                <div className="px-1 text-[11px] font-bold text-[#65676B] tracking-wide uppercase flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Layers size={12} className="text-[#1877F2]" />
                    <span>雷达底图与全局视觉主题</span>
                  </div>
                  <span className="text-[10px] text-[#1877F2] font-semibold">黑白模式设置</span>
                </div>

                {/* 深夜黑色模式 Global Dark Mode Switcher */}
                <div className="p-3 bg-white border border-[#E4E6EB] hover:border-[#1877F2] rounded-md flex items-center justify-between shadow-2xs transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-200">
                      <Sun size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#050505] flex items-center space-x-1.5">
                        <span>深夜黑色模式</span>
                        {isDarkMode && <span className="text-[9px] bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/30 px-1.5 py-0.2 rounded-full font-bold">已开启</span>}
                      </div>
                      <p className="text-[10px] text-[#65676B] mt-0.5">
                        开启后全局 UI 调整为纯黑高对比度布局
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onToggleDarkMode) {
                        onToggleDarkMode();
                      }
                      if (showToast) {
                        showToast(!isDarkMode ? '已开启深夜黑色模式 🌙' : '已恢复标准日间高亮模式 ☀️');
                      }
                    }}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shrink-0 ${
                      isDarkMode ? 'bg-[#1877F2] justify-end' : 'bg-gray-200 justify-start'
                    }`}
                    aria-label="切换深夜黑色模式" aria-pressed={isDarkMode}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-xs flex items-center justify-center text-[10px]">
                      {isDarkMode ? '🌙' : '☀️'}
                    </div>
                  </button>
                </div>

                <div className="p-2.5 bg-white border border-[#E4E6EB] rounded-md space-y-2.5 shadow-2xs">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onChangeMapStyle) onChangeMapStyle('standard');
                        if (showToast) showToast('已切换至「标准白天」底图 ☀️');
                      }}
                      className={`py-2 px-1 rounded-md flex flex-col items-center justify-center transition-all cursor-pointer border shadow-2xs ${
                        mapStyle === 'standard'
                          ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] font-bold'
                          : 'bg-white hover:bg-[#F0F2F5] text-[#65676B] hover:text-[#050505] border-[#E4E6EB] hover:border-[#1877F2]'
                      }`}
                    >
                      <Sun size={15} className="mb-1 text-amber-500" />
                      <span className="text-[10.5px] font-bold">标准白天</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onChangeMapStyle) onChangeMapStyle('dark');
                        if (showToast) showToast('已切换至「深空暗夜」底图 🌙');
                      }}
                      className={`py-2 px-1 rounded-md flex flex-col items-center justify-center transition-all cursor-pointer border shadow-2xs ${
                        mapStyle === 'dark'
                          ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] font-bold'
                          : 'bg-white hover:bg-[#F0F2F5] text-[#65676B] hover:text-[#050505] border-[#E4E6EB] hover:border-[#1877F2]'
                      }`}
                    >
                      <Moon size={15} className="mb-1 text-[#1877F2]" />
                      <span className="text-[10.5px] font-bold">深空暗夜</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onChangeMapStyle) onChangeMapStyle('minimal');
                        if (showToast) showToast('已切换至「极简线条」底图 📐');
                      }}
                      className={`py-2 px-1 rounded-md flex flex-col items-center justify-center transition-all cursor-pointer border shadow-2xs ${
                        mapStyle === 'minimal'
                          ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] font-bold'
                          : 'bg-white hover:bg-[#F0F2F5] text-[#65676B] hover:text-[#050505] border-[#E4E6EB] hover:border-[#1877F2]'
                      }`}
                    >
                      <Layers size={15} className="mb-1 text-[#31A24C]" />
                      <span className="text-[10.5px] font-bold">极简线条</span>
                    </button>
                  </div>

                  {/* Layer Default-on Status Toggles */}
                  <div className="pt-2.5 border-t border-[#E4E6EB] space-y-1.5">
                    <div className="text-[10px] font-bold text-[#65676B] tracking-wide uppercase">
                      图层默认开启状态
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {/* Friends layer */}
                      <button
                        aria-label="好友定位图层" aria-pressed={activeFilters.includes('friends')}
                        type="button"
                        onClick={() => {
                          if (onSelectMapFilter) onSelectMapFilter('friends' as any);
                        }}
                        className={`p-2 border text-left rounded-md transition-all cursor-pointer flex items-center justify-between hover:border-[#1877F2] shadow-2xs ${
                          activeFilters.includes('friends') ? 'bg-[#E7F3FF]/40 border-[#1877F2]' : 'bg-white border-[#E4E6EB]'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-[#1877F2]/10 text-[#1877F2] rounded-full">
                            <Users size={11} />
                          </div>
                          <div className="min-w-0 leading-none">
                            <div className="text-[10px] font-bold text-[#050505] truncate">好友定位图层</div>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <span className={`w-1 h-1 rounded-full shrink-0 ${activeFilters.includes('friends') ? 'bg-[#31A24C]' : 'bg-gray-400'}`} />
                              <span className="text-[8.5px] text-[#65676B] font-semibold">
                                {activeFilters.includes('friends') ? '已显示' : '已隐藏'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-6.5 h-3.5 rounded-full p-[1.5px] transition-colors shrink-0 flex items-center ml-1 ${
                            activeFilters.includes('friends') ? 'bg-[#1877F2] justify-end' : 'bg-gray-300 justify-start'
                          }`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-2xs" />
                        </div>
                      </button>

                      {/* Life Moments layer */}
                      <button
                        aria-label="生活动态图层" aria-pressed={activeFilters.includes('life')}
                        type="button"
                        onClick={() => {
                          if (onSelectMapFilter) onSelectMapFilter('life' as any);
                        }}
                        className={`p-2 border text-left rounded-md transition-all cursor-pointer flex items-center justify-between hover:border-[#1877F2] shadow-2xs ${
                          activeFilters.includes('life') ? 'bg-[#E7F3FF]/40 border-[#1877F2]' : 'bg-white border-[#E4E6EB]'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-[#EC4899]/10 text-[#EC4899] rounded-full">
                            <Moon size={11} />
                          </div>
                          <div className="min-w-0 leading-none">
                            <div className="text-[10px] font-bold text-[#050505] truncate">生活动态图层</div>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <span className={`w-1 h-1 rounded-full shrink-0 ${activeFilters.includes('life') ? 'bg-[#31A24C]' : 'bg-gray-400'}`} />
                              <span className="text-[8.5px] text-[#65676B] font-semibold">
                                {activeFilters.includes('life') ? '已显示' : '已隐藏'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-6.5 h-3.5 rounded-full p-[1.5px] transition-colors shrink-0 flex items-center ml-1 ${
                            activeFilters.includes('life') ? 'bg-[#1877F2] justify-end' : 'bg-gray-300 justify-start'
                          }`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-2xs" />
                        </div>
                      </button>

                      {/* Stars layer */}
                      <button
                        aria-label="星点标记图层" aria-pressed={activeFilters.includes('stars')}
                        type="button"
                        onClick={() => {
                          if (onSelectMapFilter) onSelectMapFilter('stars' as any);
                        }}
                        className={`p-2 border text-left rounded-md transition-all cursor-pointer flex items-center justify-between hover:border-[#1877F2] shadow-2xs ${
                          activeFilters.includes('stars') ? 'bg-[#E7F3FF]/40 border-[#1877F2]' : 'bg-white border-[#E4E6EB]'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-[#F59E0B]/10 text-[#F59E0B] rounded-full">
                            <Sparkles size={11} />
                          </div>
                          <div className="min-w-0 leading-none">
                            <div className="text-[10px] font-bold text-[#050505] truncate">星点标记图层</div>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <span className={`w-1 h-1 rounded-full shrink-0 ${activeFilters.includes('stars') ? 'bg-[#31A24C]' : 'bg-gray-400'}`} />
                              <span className="text-[8.5px] text-[#65676B] font-semibold">
                                {activeFilters.includes('stars') ? '已显示' : '已隐藏'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-6.5 h-3.5 rounded-full p-[1.5px] transition-colors shrink-0 flex items-center ml-1 ${
                            activeFilters.includes('stars') ? 'bg-[#1877F2] justify-end' : 'bg-gray-300 justify-start'
                          }`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-2xs" />
                        </div>
                      </button>

                      {/* Activities layer */}
                      <button
                        aria-label="活动事件图层" aria-pressed={activeFilters.includes('activities')}
                        type="button"
                        onClick={() => {
                          if (onSelectMapFilter) onSelectMapFilter('activities' as any);
                        }}
                        className={`p-2 border text-left rounded-md transition-all cursor-pointer flex items-center justify-between hover:border-[#1877F2] shadow-2xs ${
                          activeFilters.includes('activities') ? 'bg-[#E7F3FF]/40 border-[#1877F2]' : 'bg-white border-[#E4E6EB]'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-[#F97316]/10 text-[#F97316] rounded-full">
                            <Flame size={11} className="fill-current" />
                          </div>
                          <div className="min-w-0 leading-none">
                            <div className="text-[10px] font-bold text-[#050505] truncate">活动事件图层</div>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <span className={`w-1 h-1 rounded-full shrink-0 ${activeFilters.includes('activities') ? 'bg-[#31A24C]' : 'bg-gray-400'}`} />
                              <span className="text-[8.5px] text-[#65676B] font-semibold">
                                {activeFilters.includes('activities') ? '已显示' : '已隐藏'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-6.5 h-3.5 rounded-full p-[1.5px] transition-colors shrink-0 flex items-center ml-1 ${
                            activeFilters.includes('activities') ? 'bg-[#1877F2] justify-end' : 'bg-gray-300 justify-start'
                          }`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-2xs" />
                        </div>
                      </button>

                      {/* Family layer */}
                      <button
                        aria-label="家庭看护图层" aria-pressed={activeFilters.includes('family')}
                        type="button"
                        onClick={() => {
                          if (onSelectMapFilter) onSelectMapFilter('family' as any);
                        }}
                        className={`p-2 border text-left rounded-md transition-all cursor-pointer flex items-center justify-between hover:border-[#1877F2] col-span-2 shadow-2xs ${
                          activeFilters.includes('family') ? 'bg-[#E7F3FF]/40 border-[#1877F2]' : 'bg-white border-[#E4E6EB]'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-[#10B981]/10 text-[#10B981] rounded-full">
                            <ShieldCheck size={11} />
                          </div>
                          <div className="min-w-0 leading-none">
                            <div className="text-[10px] font-bold text-[#050505] truncate">家庭看护图层</div>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <span className={`w-1 h-1 rounded-full shrink-0 ${activeFilters.includes('family') ? 'bg-[#31A24C]' : 'bg-gray-400'}`} />
                              <span className="text-[8.5px] text-[#65676B] font-semibold">
                                {activeFilters.includes('family') ? '已显示' : '已隐藏'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-6.5 h-3.5 rounded-full p-[1.5px] transition-colors shrink-0 flex items-center ml-1 ${
                            activeFilters.includes('family') ? 'bg-[#1877F2] justify-end' : 'bg-gray-300 justify-start'
                          }`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-2xs" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* A. Centralized Management Hub (Quick Access Buttons) */}
              <div className="space-y-2" id="section-quick-hub">
                <div className="px-1 text-[11px] font-bold text-[#65676B] tracking-wide uppercase flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Terminal size={12} className="text-[#1877F2]" />
                    <span>快捷控制与管理中心</span>
                  </span>
                  <span className="text-[8px] text-[#1877F2] font-bold bg-[#E7F3FF] px-1.5 py-0.2 rounded-md border border-[#1877F2]/10">
                    QUICK HUB
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenDocumentCenter) {
                        onOpenDocumentCenter();
                      } else {
                        onClose();
                        onSelectTab('profile');
                      }
                      if (showToast) showToast('已直达文档与资产中心 📁');
                    }}
                    className="p-2.5 bg-white hover:bg-[#F0F2F5] rounded-md border border-[#E4E6EB] hover:border-[#1877F2] flex flex-col items-center justify-center text-center transition-all cursor-pointer group active:scale-95 shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <FolderOpen size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-[#050505] mt-1 truncate w-full">文档资产</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenChatManagement) {
                        onOpenChatManagement();
                      } else {
                        onClose();
                        onSelectTab('chat');
                      }
                      if (showToast) showToast('已打开群聊与会话管理中枢 💬');
                    }}
                    className="p-2.5 bg-white hover:bg-[#F0F2F5] rounded-md border border-[#E4E6EB] hover:border-[#1877F2] flex flex-col items-center justify-center text-center transition-all cursor-pointer group active:scale-95 shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#E6F8EB] text-[#31A24C] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <MessageSquare size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-[#050505] mt-1 truncate w-full">会话治理</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenStellarWorkspace) {
                        onOpenStellarWorkspace();
                      } else if (onOpenNoteEditor) {
                        onOpenNoteEditor();
                      } else {
                        onClose();
                        onSelectTab('profile');
                      }
                      if (showToast) showToast('已进入 Stellar 工作台 💼');
                    }}
                    className="p-2.5 bg-white hover:bg-[#F0F2F5] rounded-md border border-[#E4E6EB] hover:border-[#1877F2] flex flex-col items-center justify-center text-center transition-all cursor-pointer group active:scale-95 shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <StickyNote size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-[#050505] mt-1 truncate w-full">Stellar 工作台</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenFamilyCare) {
                        onOpenFamilyCare();
                      } else if (onOpenFamilyGroup) {
                        onOpenFamilyGroup();
                      } else {
                        setActiveView('familyCircle');
                      }
                    }}
                    className="p-2.5 bg-white hover:bg-[#F0F2F5] rounded-md border border-[#E4E6EB] hover:border-[#1877F2] flex flex-col items-center justify-center text-center transition-all cursor-pointer group active:scale-95 shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FEE2E2] text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <HeartHandshake size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-[#050505] mt-1 truncate w-full">家庭守护</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectTab('calendar');
                      if (showToast) showToast('已直达全局日程时间线 📅');
                    }}
                    className="p-2.5 bg-white hover:bg-[#F0F2F5] rounded-md border border-[#E4E6EB] hover:border-[#1877F2] flex flex-col items-center justify-center text-center transition-all cursor-pointer group active:scale-95 shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <Calendar size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-[#050505] mt-1 truncate w-full">日程计划</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenSearch) {
                        onOpenSearch();
                      } else {
                        onClose();
                      }
                      if (showToast) showToast('已唤起全局雷达检索 🔍');
                    }}
                    className="p-2.5 bg-white hover:bg-[#F0F2F5] rounded-md border border-[#E4E6EB] hover:border-[#1877F2] flex flex-col items-center justify-center text-center transition-all cursor-pointer group active:scale-95 shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <Search size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-[#050505] mt-1 truncate w-full">全局检索</span>
                  </button>
                </div>
              </div>

              {/* B. Account Configuration Section */}
              <div className="space-y-2">
                <div className="px-1 text-[11px] font-bold text-[#65676B] tracking-wide uppercase flex items-center space-x-1.5">
                  <User size={12} className="text-[#1877F2]" />
                  <span>账户安全与名片</span>
                </div>
                
                <div className="bg-white border border-[#E4E6EB] rounded-md divide-y divide-[#E4E6EB] overflow-hidden shadow-2xs hover:border-[#1877F2] transition-colors">
                  <div 
                    onClick={() => setActiveView('editProfile')}
                    className="p-3 flex items-center justify-between hover:bg-[#F0F2F5] cursor-pointer active:bg-gray-100 transition-colors"
                  >
                    <span className="text-xs font-medium text-[#050505]">编辑个人资料与头像</span>
                    <ChevronRight size={14} className="text-[#65676B]" />
                  </div>
                  <div 
                    onClick={() => setActiveView('accountSecurity')}
                    className="p-3 flex items-center justify-between hover:bg-[#F0F2F5] cursor-pointer active:bg-gray-100 transition-colors"
                  >
                    <span className="text-xs font-medium text-[#050505]">密码、安全与登录节点</span>
                    <ChevronRight size={14} className="text-[#65676B]" />
                  </div>
                </div>
              </div>

              {/* C. Map & Sensor Controls (KEEP PRESERVING LAYER AND RENDER STYLES!) */}
              <div className="space-y-2" id="section-map-controls">
                <div className="px-1 text-[11px] font-bold text-[#65676B] tracking-wide uppercase flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Compass size={12} className="text-[#31A24C]" />
                    <span>地理感知、精确度与可见性</span>
                  </span>
                  <span className="text-[8px] text-[#31A24C] font-bold bg-[#E6F8EB] px-1.5 py-0.2 rounded-md border border-[#31A24C]/10">
                    GIS LAYER
                  </span>
                </div>

                <div className="bg-white border border-[#E4E6EB] rounded-md divide-y divide-[#E4E6EB] overflow-hidden shadow-2xs hover:border-[#1877F2] transition-colors">
                  {/* Traffic switch */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Car size={16} className="text-[#31A24C]" />
                      <div className="text-xs font-semibold text-[#050505]">实时路况感知叠加层</div>
                    </div>
                    <button
                      aria-label="实时路况感知叠加层" aria-pressed={trafficEnabled}
                      type="button"
                      onClick={() => {
                        if (onToggleTraffic) onToggleTraffic();
                        if (showToast) showToast(trafficEnabled ? '已关闭实时路况图层' : '已开启实时路况图层 🚦');
                      }}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                        trafficEnabled ? 'bg-[#1877F2] justify-end' : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>

                  {/* Stealth Mode switch */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <ShieldCheck size={16} className="text-[#1877F2]" />
                      <div className="text-xs font-semibold text-[#050505]">雷达隐身模式 (轨迹冻结)</div>
                    </div>
                    <button
                      aria-label="雷达隐身模式（轨迹冻结）" aria-pressed={isStealthMode}
                      type="button"
                      onClick={() => {
                        if (onToggleStealth) onToggleStealth();
                        if (showToast) showToast(isStealthMode ? '已恢复正常在线广播' : '已激活雷达隐身 🛡️');
                      }}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                        isStealthMode ? 'bg-amber-500 justify-end' : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>

                  {/* Close Friend Message Simulator switch */}
                  <div className="p-3 flex items-center justify-between bg-blue-50/20">
                    <div className="flex items-center space-x-2.5">
                      <MessageCircle size={16} className="text-[#1877F2]" />
                      <div className="text-xs font-semibold text-[#050505]">模拟密友 薛梦 发送新消息</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSimulateCloseFriendMessage) {
                          onSimulateCloseFriendMessage();
                        }
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                    >
                      发送 💬
                    </button>
                  </div>

                  {/* Interactive Sub-page navigation: Location Visibility */}
                  <div 
                    onClick={() => setActiveView('locationVisibility')}
                    className="p-3 flex items-center justify-between hover:bg-[#F0F2F5] cursor-pointer active:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Eye size={16} className="text-blue-500" />
                      <span className="text-xs font-semibold text-[#050505]">位置可见性</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-gray-500">
                      <span className="text-[11px] font-bold text-[#1877F2] bg-[#E7F3FF] px-2 py-0.5 rounded-full">
                        {getLocVisibilityText()}
                      </span>
                      <ChevronRight size={14} />
                    </div>
                  </div>

                  {/* Interactive Sub-page navigation: Location Precision */}
                  <div 
                    onClick={() => setActiveView('locationPrecision')}
                    className="p-3 flex items-center justify-between hover:bg-[#F0F2F5] cursor-pointer active:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Sliders size={16} className="text-cyan-500" />
                      <span className="text-xs font-semibold text-[#050505]">位置广播精确度</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-gray-500">
                      <span className="text-[11px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
                        {getLocPrecisionText()}
                      </span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>


              </div>

              {/* D. Privacy & Dialog Interactions */}
              <div className="space-y-2">
                <div className="px-1 text-[11px] font-bold text-[#65676B] tracking-wide uppercase flex items-center space-x-1.5">
                  <Lock size={12} className="text-[#1877F2]" />
                  <span>隐私与即时通讯互动</span>
                </div>

                <div className="bg-white border border-[#E4E6EB] rounded-md divide-y divide-[#E4E6EB] overflow-hidden shadow-2xs hover:border-[#1877F2] transition-colors">
                  <div 
                    onClick={() => setActiveView('whoCanMessage')}
                    className="p-3 flex items-center justify-between hover:bg-[#F0F2F5] cursor-pointer active:bg-gray-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-[#050505]">谁可以向我发起密聊</span>
                    <div className="flex items-center space-x-1.5 text-gray-500">
                      <span className="text-[10.5px] text-[#65676B]">{getMsgPermissionText()}</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>

                  {/* Activity status (with blue toggle) */}
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#050505]">在线状态 (地图绿圈广播)</span>
                    <button
                      aria-label="在线状态广播" aria-pressed={activityStatus}
                      type="button"
                      onClick={() => {
                        setActivityStatus(!activityStatus);
                        if (showToast) showToast(!activityStatus ? '已在地图上公开在线状态 🟢' : '已隐藏在线绿圈');
                      }}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                        activityStatus ? 'bg-[#1877F2] justify-end' : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>

                  <div 
                    onClick={() => setActiveView('blockedUsers')}
                    className="p-3 flex items-center justify-between hover:bg-[#F0F2F5] cursor-pointer active:bg-gray-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-[#050505]">已拉黑屏蔽用户列表</span>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <span className="text-[10.5px] text-gray-400">0 人</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* E. Notification Center Preferences */}
              <div className="space-y-2">
                <div className="px-1 text-[11px] font-bold text-[#65676B] tracking-wide uppercase flex items-center space-x-1.5">
                  <Bell size={12} className="text-[#1877F2]" />
                  <span>雷达告警与消息通知推送</span>
                </div>

                <div className="bg-white border border-[#E4E6EB] rounded-md divide-y divide-[#E4E6EB] overflow-hidden shadow-2xs hover:border-[#1877F2] transition-colors">
                  {/* Toggle 1: Star Points */}
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#050505] block">星点会话与话题讨论消息</span>
                      <span className="text-[10px] text-[#65676B]">星标群聊的消息即时闪烁推送</span>
                    </div>
                    <button
                      aria-label="星点会话与话题讨论消息推送" aria-pressed={starPointNotif}
                      type="button"
                      onClick={() => setStarPointNotif(!starPointNotif)}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                        starPointNotif ? 'bg-[#1877F2] justify-end' : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>

                  {/* Toggle 2: Nearby Radar */}
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#050505] block">附近雷达动态提示</span>
                      <span className="text-[10px] text-[#65676B]">发现附近的新地标、活动与星友</span>
                    </div>
                    <button
                      aria-label="附近雷达动态提示" aria-pressed={nearbyNotif}
                      type="button"
                      onClick={() => setNearbyNotif(!nearbyNotif)}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                        nearbyNotif ? 'bg-[#1877F2] justify-end' : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>

                  {/* Toggle 3: SOS Critical alert */}
                  <div className="p-3 flex items-center justify-between bg-rose-50/20">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-rose-700 block">家庭看护 SOS 紧急越界警报</span>
                        <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-md border border-rose-200">
                          安全强控
                        </span>
                      </div>
                      <span className="text-[9.5px] text-rose-500 block font-medium mt-0.5">
                        🚨 安全通知不可静音 · 保护家人生命安全
                      </span>
                    </div>
                    <button
                      aria-label="家庭看护 SOS 紧急越界警报" aria-pressed={sosNotif}
                      type="button"
                      onClick={() => {
                        setSosNotif(!sosNotif);
                        if (showToast) showToast(sosNotif ? '已暂停看护后台越界声光推送 🔕' : '已重置家庭紧急看护通道 🔊');
                      }}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                        sosNotif ? 'bg-rose-600 justify-end' : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>
                </div>
              </div>

              {/* F. My Created Spaces & History */}
              <div className="space-y-2">
                <div className="px-1 text-[11px] font-bold text-[#65676B] tracking-wide uppercase flex items-center space-x-1.5">
                  <Sparkles size={12} className="text-[#1877F2]" />
                  <span>我的空间星标与足迹</span>
                </div>

                <div className="bg-white border border-[#E4E6EB] rounded-md divide-y divide-[#E4E6EB] overflow-hidden shadow-2xs hover:border-[#1877F2] transition-colors">
                  <div 
                    onClick={() => setActiveView('myStarPoints')}
                    className="p-3 flex items-center justify-between hover:bg-[#F0F2F5] cursor-pointer active:bg-gray-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-[#050505]">我创建管理的星点 (Star Points)</span>
                    <ChevronRight size={14} className="text-[#65676B]" />
                  </div>
                  <div 
                    onClick={() => {
                      if (showToast) showToast('已拉取您在甘肃省/兰州市的全部签到足迹 (总计 12 个历史地标)');
                    }}
                    className="p-3 flex items-center justify-between hover:bg-[#F0F2F5] cursor-pointer active:bg-gray-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-[#050505]">收藏内容与历史签到足迹</span>
                    <ChevronRight size={14} className="text-[#65676B]" />
                  </div>
                </div>
              </div>

              {/* G. Family Circle Navigation Group */}
              <div className="space-y-2">
                <div className="px-1 text-[11px] font-bold text-[#65676B] tracking-wide uppercase flex items-center space-x-1.5">
                  <HeartHandshake size={12} className="text-rose-600" />
                  <span>家庭守护专属看护舱</span>
                </div>

                <div className="bg-white border border-[#E4E6EB] rounded-md divide-y divide-[#E4E6EB] overflow-hidden shadow-2xs hover:border-[#1877F2] transition-colors">
                  <div 
                    onClick={() => setActiveView('familyCircle')}
                    className="p-3 flex items-center justify-between hover:bg-[#F0F2F5] cursor-pointer active:bg-gray-100 transition-colors"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#050505] block">家庭成员看护监护圈</span>
                      <span className="text-[10px] text-[#65676B]">配置老人、孩童的安全防丢防越界围栏</span>
                    </div>
                    <ChevronRight size={14} className="text-[#65676B]" />
                  </div>
                  
                  <div 
                    onClick={() => {
                      if (showToast) showToast('守护隐私中心：Stellar 绝对不收集任何离线数据，看护位置仅授权家人解密 🛡️');
                    }}
                    className="p-3 flex items-center justify-between hover:bg-[#F0F2F5] cursor-pointer active:bg-gray-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-[#050505]">看护人授权与守护隐私中心</span>
                    <ChevronRight size={14} className="text-[#65676B]" />
                  </div>
                </div>
              </div>

              {/* H. Diagnostics & System Maintenance */}
              <div className="space-y-2">
                <div className="px-1 text-[11px] font-bold text-[#65676B] tracking-wide uppercase flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Database size={12} className="text-amber-600" />
                    <span>系统维护、诊断与加密资产</span>
                  </span>
                  <span className="text-[8px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-500/10">
                    SYSTEM
                  </span>
                </div>

                <div className="bg-white border border-[#E4E6EB] rounded-md p-3.5 space-y-3 text-xs shadow-2xs hover:border-[#1877F2] transition-colors">
                  {/* Cache */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#050505]">本地存储与离线 data 缓存</div>
                      <div className="text-[10px] text-[#65676B]">
                        {cacheCleared ? '已释放 · 占用 0 KB' : '临时离线地标渲染 248.6 MB'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearCache}
                      className="px-3 py-1.5 rounded-md bg-[#F0F2F5] hover:bg-gray-200 active:scale-95 text-[10.5px] font-bold text-[#050505] flex items-center space-x-1 cursor-pointer transition-all border border-[#E4E6EB]"
                    >
                      <Trash2 size={12} className="text-rose-500" />
                      <span>{cacheCleared ? '已清理' : '一键清理'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* I. Help & About OS */}
              <div className="space-y-2">
                <div className="px-1 text-[11px] font-bold text-[#65676B] tracking-wide uppercase flex items-center space-x-1.5">
                  <HelpCircle size={12} className="text-[#1877F2]" />
                  <span>帮助、支持与法律声明</span>
                </div>

                <div className="bg-white border border-[#E4E6EB] rounded-md divide-y divide-[#E4E6EB] overflow-hidden shadow-2xs hover:border-[#1877F2] transition-colors">
                  <div 
                    onClick={() => setActiveView('help')}
                    className="p-3 flex items-center justify-between hover:bg-[#F0F2F5] cursor-pointer active:bg-gray-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-[#050505]">帮助中心与故障回馈反馈</span>
                    <ChevronRight size={14} className="text-[#65676B]" />
                  </div>
                  <div 
                    onClick={() => setActiveView('about')}
                    className="p-3 flex items-center justify-between hover:bg-[#F0F2F5] cursor-pointer active:bg-gray-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-[#050505]">关于 Stellar OS 及开源授权许可</span>
                    <ChevronRight size={14} className="text-[#65676B]" />
                  </div>
                </div>
              </div>

              {/* J. Logout soft button */}
              <div className="pt-2">
                <button
                  type="button"
                  id="main-logout-btn"
                  onClick={() => setActiveView('logoutConfirm')}
                  className="w-full py-2.5 bg-white hover:bg-rose-50 text-rose-600 font-bold rounded-md text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-98 border border-[#E4E6EB] hover:border-rose-300 shadow-2xs"
                >
                  <LogOut size={14} />
                  <span>安全退出节点连接</span>
                </button>
                <div className="text-center text-[9px] text-[#65676B] mt-2 tracking-wider font-medium">
                  STELLAR OS v4.0.0-PRO · META DESIGN SYSTEM
                </div>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* VIEW 2: LOCATION VISIBILITY                */}
          {/* ========================================== */}
          {activeView === 'locationVisibility' && (
            <div className="space-y-4" id="view-visibility-content">
              <div className="bg-white border border-[#E4E6EB] rounded-md shadow-2xs p-4 text-xs text-[#65676B] space-y-2">
                <div className="font-bold text-[#050505] text-sm flex items-center space-x-1.5">
                  <Eye size={16} className="text-[#1877F2]" />
                  <span>位置广播控制中心</span>
                </div>
                <p>
                  Stellar 是基于真实地理底图的即时社交系统。在这里，您可以控制哪些人能在其雷达底图上查看到您的定位标记：
                </p>
              </div>

              {/* Radio Group inside a beautiful Facebook card */}
              <div className="bg-white border border-[#E4E6EB] rounded-md overflow-hidden shadow-2xs divide-y divide-[#E4E6EB]">
                {/* Option 1: Everyone */}
                <div 
                  onClick={() => {
                    setLocVisibility('everyone');
                    if (showToast) showToast('位置可见性已设为【所有人】');
                  }}
                  className="p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                      locVisibility === 'everyone' ? 'border-[#1877F2] bg-[#E7F3FF]' : 'border-gray-300 bg-white'
                    }`}>
                      {locVisibility === 'everyone' && <div className="w-2 h-2 rounded-full bg-[#1877F2]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#050505]">所有人 (Everyone)</div>
                    <p className="text-[10.5px] text-[#65676B] mt-0.5">
                      地图上的所有在线、同城、探索成员均能在雷达中搜索并显示您的实时位置。
                    </p>
                  </div>
                </div>

                {/* Option 2: Only people I've chatted with */}
                <div 
                  onClick={() => {
                    setLocVisibility('chatted');
                    if (showToast) showToast('位置可见性已设为【仅有过对话的用户】');
                  }}
                  className="p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                      locVisibility === 'chatted' ? 'border-[#1877F2] bg-[#E7F3FF]' : 'border-gray-300 bg-white'
                    }`}>
                      {locVisibility === 'chatted' && <div className="w-2 h-2 rounded-full bg-[#1877F2]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#050505]">仅对话过的用户 (Only Chat Convs)</div>
                    <p className="text-[10.5px] text-[#65676B] mt-0.5">
                      仅允许在您的私密对话、群聊或家庭监护中有过沟通记录的成员在地图上看到您。
                    </p>
                  </div>
                </div>

                {/* Option 3: Invisible */}
                <div 
                  onClick={() => {
                    setLocVisibility('invisible');
                    if (showToast) showToast('位置已完全隐身 (幽灵模式) 🛡️');
                  }}
                  className="p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                      locVisibility === 'invisible' ? 'border-[#1877F2] bg-[#E7F3FF]' : 'border-gray-300 bg-white'
                    }`}>
                      {locVisibility === 'invisible' && <div className="w-2 h-2 rounded-full bg-[#1877F2]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#050505] flex items-center space-x-1.5">
                      <span>隐身幽灵模式 (Invisible Mode)</span>
                      <EyeOff size={12} className="text-amber-600" />
                    </div>
                    <p className="text-[10.5px] text-[#65676B] mt-0.5">
                      地图标记将被临时消除，您能正常查看地图，但任何人都无法捕获您的即时物理坐标轨迹。
                    </p>
                  </div>
                </div>
              </div>

              {/* Safe Note Callout */}
              <div className="bg-blue-50/50 p-3.5 rounded-md border border-[#1877F2]/20 text-[11px] text-blue-800 space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold">
                  <ShieldAlert size={14} className="text-[#1877F2]" />
                  <span>看护生命安全保障承诺</span>
                </div>
                <p className="leading-relaxed">
                  提示：即使此处开启了【隐身】，若您在家庭守护看护舱中授权绑定了“家人、看护监护人”，在遭遇异常危机、跌倒、电子围栏越界或主动发起 SOS 呼救状态时，看护人依然能穿透隐私限制解密获取您当前的位置以作紧急派遣。
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('main')}
                className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-md text-xs transition-colors cursor-pointer active:scale-98 shadow-sm"
              >
                保存并返回设置
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW 3: LOCATION PRECISION                 */}
          {/* ========================================== */}
          {activeView === 'locationPrecision' && (
            <div className="space-y-4" id="view-precision-content">
              <div className="bg-white border border-[#E4E6EB] rounded-md shadow-2xs p-4 text-xs text-[#65676B] space-y-2">
                <div className="font-bold text-[#050505] text-sm flex items-center space-x-1.5">
                  <Sliders size={16} className="text-cyan-500" />
                  <span>定位广播精确度配置</span>
                </div>
                <p>
                  控制广播到地图网络中的位置坐标精密度。您可以选择高精度或者模糊范围来掩盖真实的家庭地址、房间和门牌：
                </p>
              </div>

              <div className="bg-white border border-[#E4E6EB] rounded-md overflow-hidden shadow-2xs divide-y divide-[#E4E6EB]">
                {/* Option 1: Precise */}
                <div 
                  onClick={() => {
                    setLocPrecision('precise');
                    if (showToast) showToast('定位精度已配置为【精准物理坐标】');
                  }}
                  className="p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                      locPrecision === 'precise' ? 'border-[#1877F2] bg-[#E7F3FF]' : 'border-gray-300 bg-white'
                    }`}>
                      {locPrecision === 'precise' && <div className="w-2 h-2 rounded-full bg-[#1877F2]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#050505]">精确物理坐标 (Precise Coordinates)</div>
                    <p className="text-[10.5px] text-[#65676B] mt-0.5">
                      向看护人和地图广播绝对实时的 GPS 位置坐标。误差在 1 米以内，适用于实时救援调度、运动和位置互认。
                    </p>
                  </div>
                </div>

                {/* Option 2: Blurred */}
                <div 
                  onClick={() => {
                    setLocPrecision('blurred');
                    if (showToast) showToast('定位精度已配置为【模糊偏差圈】');
                  }}
                  className="p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                      locPrecision === 'blurred' ? 'border-[#1877F2] bg-[#E7F3FF]' : 'border-gray-300 bg-white'
                    }`}>
                      {locPrecision === 'blurred' && <div className="w-2 h-2 rounded-full bg-[#1877F2]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#050505]">模糊范围圈 (Blurred Area Offset)</div>
                    <p className="text-[10.5px] text-[#65676B] mt-0.5">
                      在您真实经纬度周围 200 米至 500 米半径内产生随机的向量偏置，保护敏感常驻居所不被窥伺。
                    </p>
                  </div>
                </div>

                {/* Option 3: City Level */}
                <div 
                  onClick={() => {
                    setLocPrecision('city');
                    if (showToast) showToast('定位精度已设为【城市/地区级别】');
                  }}
                  className="p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                      locPrecision === 'city' ? 'border-[#1877F2] bg-[#E7F3FF]' : 'border-gray-300 bg-white'
                    }`}>
                      {locPrecision === 'city' && <div className="w-2 h-2 rounded-full bg-[#1877F2]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#050505]">城市/地区级别 (City & Region only)</div>
                    <p className="text-[10.5px] text-[#65676B] mt-0.5">
                      隐藏所有的街道、建筑物与具体地标定位。雷达上仅标识您当前所在的城市节点（如：中国·甘肃省兰州市）。
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('main')}
                className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-md text-xs transition-colors cursor-pointer active:scale-98 shadow-sm"
              >
                保存并返回设置
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW 4: WHO CAN MESSAGE ME                 */}
          {/* ========================================== */}
          {activeView === 'whoCanMessage' && (
            <div className="space-y-4" id="view-message-permission-content">
              <div className="bg-white border border-[#E4E6EB] rounded-md shadow-2xs p-4 text-xs text-[#65676B] space-y-2">
                <div className="font-bold text-[#050505] text-sm flex items-center space-x-1.5">
                  <Lock size={16} className="text-[#1877F2]" />
                  <span>发起密聊权限管理</span>
                </div>
                <p>
                  限制哪些类别的同城星友或地标成员可以直接给您发起端到端（E2EE）对称加密对话：
                </p>
              </div>

              <div className="bg-white border border-[#E4E6EB] rounded-md overflow-hidden shadow-2xs divide-y divide-[#E4E6EB]">
                {/* Option 1: Everyone */}
                <div 
                  onClick={() => {
                    setMsgPermission('everyone');
                    if (showToast) showToast('发起密聊权限已设为【所有人】');
                  }}
                  className="p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                      msgPermission === 'everyone' ? 'border-[#1877F2] bg-[#E7F3FF]' : 'border-gray-300 bg-white'
                    }`}>
                      {msgPermission === 'everyone' && <div className="w-2 h-2 rounded-full bg-[#1877F2]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#050505]">任何人 (Everyone)</div>
                    <p className="text-[10.5px] text-[#65676B] mt-0.5">
                      地图上的所有探索者、星友、同城成员均可随时发起安全密聊对话。
                    </p>
                  </div>
                </div>

                {/* Option 2: Only nearby */}
                <div 
                  onClick={() => {
                    setMsgPermission('nearby');
                    if (showToast) showToast('发起密聊权限已设为【仅限附近的人】');
                  }}
                  className="p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                      msgPermission === 'nearby' ? 'border-[#1877F2] bg-[#E7F3FF]' : 'border-gray-300 bg-white'
                    }`}>
                      {msgPermission === 'nearby' && <div className="w-2 h-2 rounded-full bg-[#1877F2]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#050505]">仅附近的人 (Only nearby people)</div>
                    <p className="text-[10.5px] text-[#65676B] mt-0.5">
                      仅允许当前在您的雷达扫描半径以内（例如 3 公里范围）的物理邻近用户发起对话。
                    </p>
                  </div>
                </div>

                {/* Option 3: Shared starpoints */}
                <div 
                  onClick={() => {
                    setMsgPermission('starpoints');
                    if (showToast) showToast('发起密聊权限已设为【共同星点成员】');
                  }}
                  className="p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                      msgPermission === 'starpoints' ? 'border-[#1877F2] bg-[#E7F3FF]' : 'border-gray-300 bg-white'
                    }`}>
                      {msgPermission === 'starpoints' && <div className="w-2 h-2 rounded-full bg-[#1877F2]" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#050505]">共同星点的成员 (Star Points members only)</div>
                    <p className="text-[10.5px] text-[#65676B] mt-0.5">
                      仅限在同一个群组讨论空间、地标、或兴趣星点中有过共同参与记录的成员可以发起对话。
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('main')}
                className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-md text-xs transition-colors cursor-pointer active:scale-98 shadow-sm"
              >
                保存并返回设置
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW 5: MY STAR POINTS LIST                */}
          {/* ========================================== */}
          {activeView === 'myStarPoints' && (
            <div className="space-y-4" id="view-starpoints-content">
              <div className="bg-white border border-[#E4E6EB] rounded-md p-4 shadow-2xs space-y-2 text-xs text-[#65676B]">
                <div className="font-bold text-[#050505] text-sm flex items-center space-x-1.5">
                  <Sparkles size={16} className="text-[#1877F2]" />
                  <span>我创建与运营的星点</span>
                </div>
                <p>
                  星点 (Star Points) 是由用户在底图上长按开辟的话题群组讨论空间。作为星主，您在这里可以管理自己的高能星域：
                </p>
              </div>

              {/* Star Points list card */}
              <div className="space-y-2">
                {/* Star Point 1 */}
                <div 
                  onClick={() => {
                    if (showToast) showToast('已在雷达地图上锁定【兰州深夜食堂】核心星标');
                    onClose();
                  }}
                  className="bg-white border border-[#E4E6EB] rounded-md p-3 shadow-2xs hover:border-[#1877F2] transition-colors cursor-pointer active:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-amber-600 flex items-center justify-center shrink-0">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#050505]">#兰州深夜食堂</div>
                        <p className="text-[10px] text-[#65676B] mt-0.5">
                          兰州市城关区金城关文化博览园节点
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-[#E6F8EB] text-[#31A24C] px-1.5 py-0.5 rounded-full">
                      3人在线
                    </span>
                  </div>
                </div>

                {/* Star Point 2 */}
                <div 
                  onClick={() => {
                    if (showToast) showToast('已在雷达地图上锁定【河西走廊自驾群】核心星标');
                    onClose();
                  }}
                  className="bg-white border border-[#E4E6EB] rounded-md p-3 shadow-2xs hover:border-[#1877F2] transition-colors cursor-pointer active:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center shrink-0">
                        <Car size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#050505]">#河西走廊自驾群</div>
                        <p className="text-[10px] text-[#65676B] mt-0.5">
                          甘肃兰州至河西四郡 (武威、张掖、酒泉、敦煌)
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-[#E6F8EB] text-[#31A24C] px-1.5 py-0.5 rounded-full">
                      12人在线
                    </span>
                  </div>
                </div>

                {/* Star Point 3 */}
                <div 
                  onClick={() => {
                    if (showToast) showToast('已在雷达地图上锁定【甘肃老家看护哨】监视点');
                    onClose();
                  }}
                  className="bg-white border border-[#E4E6EB] rounded-md p-3 shadow-2xs hover:border-[#1877F2] transition-colors cursor-pointer active:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <ShieldAlert size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#050505]">#甘肃老家看护哨</div>
                        <p className="text-[10px] text-[#65676B] mt-0.5">
                          兰州新区新安里社区 · 安全守护
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                      2人在线
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-3 rounded-md text-[10px] text-center text-[#65676B]">
                💡 提示：在主地图上任意空白区域双击或长按，即可快速开辟新的星点讨论空间。
              </div>

              <button
                type="button"
                onClick={() => setActiveView('main')}
                className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-[#050505] font-bold rounded-md text-xs transition-colors cursor-pointer active:scale-98"
              >
                返回设置
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW 6: FAMILY CIRCLE                      */}
          {/* ========================================== */}
          {activeView === 'familyCircle' && (
            <div className="space-y-4" id="view-family-circle-content">
              <div className="bg-white border border-[#E4E6EB] rounded-md p-4 shadow-2xs space-y-2 text-xs text-[#65676B]">
                <div className="font-bold text-[#050505] text-sm flex items-center space-x-1.5 text-rose-600">
                  <HeartHandshake size={16} />
                  <span>看护监护圈成员状态</span>
                </div>
                <p>
                  当您配置并授权看护监护人，他们可以在本终端后台建立跌倒、呼救越界警报通道，全方位照拂亲人：
                </p>
              </div>

              {/* Members List Cards */}
              <div className="space-y-2">
                {/* Member 1 */}
                <div className="bg-white border border-[#E4E6EB] rounded-md p-3.5 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250"
                      alt="陈建国"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#050505] flex items-center space-x-1.5">
                        <span>陈建国</span>
                        <span className="text-[9px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded-full border border-rose-100">
                          被监护人 · 父亲
                        </span>
                      </div>
                      <p className="text-[10px] text-[#65676B] mt-0.5">
                        在线 · 心率：76 bpm · 定位：甘肃老家
                      </p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#31A24C] shadow-xs" title="在线正常" />
                </div>

                {/* Member 2 */}
                <div className="bg-white border border-[#E4E6EB] rounded-md p-3.5 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
                      alt="王叔叔"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#050505] flex items-center space-x-1.5">
                        <span>王叔叔</span>
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded-full border border-blue-100">
                          共同守护人
                        </span>
                      </div>
                      <p className="text-[10px] text-[#65676B] mt-0.5">
                        在线 · 授权等级：全权委托
                      </p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#31A24C] shadow-xs" title="在线正常" />
                </div>

                {/* Member 3 */}
                <div className="bg-white border border-[#E4E6EB] rounded-md p-3.5 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                      alt="林浩"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#050505] flex items-center space-x-1.5">
                        <span>林浩</span>
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded-full border border-blue-100">
                          共同守护人 · 兄弟
                        </span>
                      </div>
                      <p className="text-[10px] text-[#65676B] mt-0.5">
                        在线 · 共同守护群组成员
                      </p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#31A24C] shadow-xs" title="在线正常" />
                </div>
              </div>

              {/* ENTER FAMILY CARE MONITOR BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  id="settings-enter-care-terminal"
                  onClick={() => {
                    onClose();
                    if (onOpenFamilyCare) {
                      onOpenFamilyCare();
                    }
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-98 shadow-sm"
                >
                  <ShieldAlert size={14} />
                  <span>进入守护控制中枢/越界派遣大舱</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('main')}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-[#050505] font-bold rounded-md text-xs transition-colors cursor-pointer active:scale-98"
              >
                返回设置
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW 7: LOG OUT CONFIRMATION               */}
          {/* ========================================== */}
          {activeView === 'logoutConfirm' && (
            <div className="space-y-4" id="view-logout-confirm-content">
              <div className="bg-white border border-[#E4E6EB] rounded-md p-5 shadow-2xs text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <ShieldAlert size={24} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-[#050505] text-sm">确定要退出连接吗？</h3>
                  <p className="text-[11px] text-[#65676B] leading-relaxed">
                    登出后，本台终端将彻底断开与北西北核心骨干节点的 AES-256 位对称加密连接，您的地图雷达位置、状态便签也将立即从公共雷达底图上冻结、抹除。
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (showToast) showToast('已安全登出并断开 Stellar 控制终端');
                      if (onLogout) onLogout();
                      onClose();
                    }}
                    className="py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md text-xs transition-colors cursor-pointer active:scale-98 shadow-xs"
                  >
                    安全退出节点
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView('main')}
                    className="py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] font-bold rounded-md text-xs transition-colors cursor-pointer active:scale-98"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW 8: EDIT PROFILE                       */}
          {/* ========================================== */}
          {activeView === 'editProfile' && (
            <div className="space-y-3 [&_input]:min-h-11 [&_input]:text-base [&_select]:min-h-11 [&_select]:text-base [&_textarea]:text-base" id="view-edit-profile-content">
              <div className="space-y-2.5">
                {/* ============================================================== */}
                {/* AVATAR SELECTION BAR: 3 HISTORY AVATARS + ALBUM BUTTON        */}
                {/* ============================================================== */}
                <div 
                  id="avatar-selector-card"
                  className="bg-white border border-[#E4E6EB] rounded-none p-3 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#1877F2]" />
                      <span className="text-xs font-bold text-[#050505]">头像选择与历史档案</span>
                    </div>
                    <span className="text-[10px] text-[#65676B]">点击一键切换</span>
                  </div>

                  {/* Row with 3 Historical Avatars + Album Picker Button */}
                  <div className="flex items-center gap-2">
                    {/* 3 Historical Avatars */}
                    <div className="flex items-center gap-2 flex-1">
                      {historyAvatars.slice(0, 3).map((avatarUrl, idx) => {
                        const isCurrent = (currentAvatar || userAvatar) === avatarUrl;
                        return (
                          <div
                            key={idx}
                            id={`history-avatar-item-${idx}`}
                            onClick={() => handleSelectAvatar(avatarUrl, `历史头像 ${idx + 1}`)}
                            className="flex flex-col items-center flex-1 cursor-pointer group"
                            title={`一键切换至历史头像 ${idx + 1}`}
                          >
                            <div className="relative">
                              <img
                                src={avatarUrl}
                                alt={`历史头像 ${idx + 1}`}
                                className={`w-11 h-11 rounded-full object-cover transition-all duration-150 ${
                                  isCurrent
                                    ? 'ring-2 ring-[#1877F2] ring-offset-1 scale-105 shadow-2xs'
                                    : 'border border-[#E4E6EB] opacity-75 group-hover:opacity-100 group-hover:border-[#1877F2]'
                                }`}
                              />
                              {isCurrent && (
                                <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-[#1877F2] text-white rounded-full flex items-center justify-center shadow-xs shrink-0">
                                  <Check size={11} strokeWidth={3} className="shrink-0" />
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[9px] mt-1 font-medium truncate max-w-full ${
                                isCurrent ? 'text-[#1877F2] font-bold' : 'text-[#65676B] group-hover:text-[#050505]'
                              }`}
                            >
                              {isCurrent ? '当前使用' : `历史 ${idx + 1}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Vertical Divider */}
                    <div className="h-10 w-[1px] bg-[#E4E6EB] shrink-0" />

                    {/* Album Button */}
                    <div className="flex flex-col items-center shrink-0">
                      <button
                        type="button"
                        id="open-avatar-album-btn"
                        onClick={() => setIsAlbumModalOpen(true)}
                        className="w-11 h-11 rounded-full bg-[#F0F2F5] hover:bg-[#E7F3FF] border border-[#E4E6EB] hover:border-[#1877F2] text-[#1877F2] flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs group"
                        title="进入相册选择头像"
                        aria-label="进入相册选择头像"
                      >
                        <ImageIcon size={18} className="group-hover:scale-110 transition-transform text-[#1877F2]" />
                      </button>
                      <span className="text-[9px] mt-1 text-[#1877F2] font-bold">
                        相册选择
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACCORDION CONTAINERS */}
                <div className="border border-[#E4E6EB] divide-y divide-[#E4E6EB] overflow-hidden bg-white shadow-2xs text-xs">
                    
                    {/* SECTION 1: 个人资料 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenProfileSection(openProfileSection === 'profile' ? null : 'profile')}
                        className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-bold text-[#050505] transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center space-x-2">
                          <User size={13} className="text-[#1877F2]" />
                          <span>个人资料 (Profile Header)</span>
                        </span>
                        <ChevronRight size={14} className={`text-gray-500 transition-transform ${openProfileSection === 'profile' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {openProfileSection === 'profile' && (
                        <div className="p-3 bg-white space-y-3 border-t border-[#E4E6EB] animate-in fade-in duration-100">
                          <div>
                            <label htmlFor="settings-profile-field-1" className="block text-[10px] font-bold text-[#65676B] mb-1">展示昵称</label>
                            <input id="settings-profile-field-1"
                              type="text"
                              value={operatorName}
                              onChange={(e) => updateProfileField('operatorName', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-2" className="block text-[10px] font-bold text-[#65676B] mb-1">Stellar 雷达专属 ID</label>
                            <input id="settings-profile-field-2"
                              type="text"
                              value={operatorId}
                              onChange={(e) => updateProfileField('operatorId', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-3" className="block text-[10px] font-bold text-[#65676B] mb-1">心情状态 (Mood Status)</label>
                            <input id="settings-profile-field-3"
                              type="text"
                              value={moodStatus}
                              onChange={(e) => {
                                setProfileData((prev) => ({
                                  ...prev,
                                  moodStatus: e.target.value,
                                  operatorBio: e.target.value,
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                              placeholder="例如：在线、忙碌"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-4" className="block text-[10px] font-bold text-[#65676B] mb-1">个性签名 (Personal Signature)</label>
                            <input id="settings-profile-field-4"
                              type="text"
                              value={signature}
                              onChange={(e) => updateProfileField('signature', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                              placeholder="例如：音乐不停，分享不止..."
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-5" className="block text-[10px] font-bold text-[#65676B] mb-1">关于你 (About You)</label>
                            <textarea id="settings-profile-field-5"
                              value={aboutYou}
                              onChange={(e) => updateProfileField('aboutYou', e.target.value)}
                              rows={2}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2] resize-none"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-6" className="block text-[10px] font-bold text-[#65676B] mb-1">已置顶的详细信息</label>
                            <input id="settings-profile-field-6"
                              type="text"
                              value={pinnedDetail}
                              onChange={(e) => updateProfileField('pinnedDetail', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 2: 类别 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenProfileSection(openProfileSection === 'category' ? null : 'category')}
                        className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-bold text-[#050505] transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center space-x-2">
                          <Folder size={13} className="text-[#1877F2]" />
                          <span>主页类别与属性 (Category)</span>
                        </span>
                        <ChevronRight size={14} className={`text-gray-500 transition-transform ${openProfileSection === 'category' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {openProfileSection === 'category' && (
                        <div className="p-3 bg-white space-y-3 border-t border-[#E4E6EB] animate-in fade-in duration-100">
                          <div>
                            <label htmlFor="settings-profile-field-7" className="block text-[10px] font-bold text-[#65676B] mb-1">主页职业类别</label>
                            <input id="settings-profile-field-7"
                              type="text"
                              value={category}
                              onChange={(e) => updateProfileField('category', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <div>
                              <div className="text-[10px] font-bold text-[#050505]">AI 创作者身份 (AI Creator)</div>
                              <p className="text-[9px] text-[#65676B]">是否在个人主页上挂载 AI 生成星点标记章</p>
                            </div>
                            <button
                      aria-label="AI 创作者身份" aria-pressed={isAICreator}
                              type="button"
                              onClick={() => updateProfileField('isAICreator', !isAICreator)}
                              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-100 flex items-center ${
                                isAICreator ? 'bg-[#1877F2] justify-end' : 'bg-gray-300 justify-start'
                              }`}
                            >
                              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 3: 个人详情 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenProfileSection(openProfileSection === 'details' ? null : 'details')}
                        className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-bold text-[#050505] transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center space-x-2">
                          <MapPin size={13} className="text-[#1877F2]" />
                          <span>个人详情 (Personal Details)</span>
                        </span>
                        <ChevronRight size={14} className={`text-gray-500 transition-transform ${openProfileSection === 'details' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {openProfileSection === 'details' && (
                        <div className="p-3 bg-white space-y-3 border-t border-[#E4E6EB] animate-in fade-in duration-100">
                          <div>
                            <label htmlFor="settings-profile-field-8" className="block text-[10px] font-bold text-[#65676B] mb-1">所在地 (城市或城镇)</label>
                            <input id="settings-profile-field-8"
                              type="text"
                              value={currentCity}
                              onChange={(e) => updateProfileField('currentCity', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-9" className="block text-[10px] font-bold text-[#65676B] mb-1">家乡 (Hometown)</label>
                            <input id="settings-profile-field-9"
                              type="text"
                              value={hometown}
                              onChange={(e) => updateProfileField('hometown', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-10" className="block text-[10px] font-bold text-[#65676B] mb-1">出生日期 (Birthday)</label>
                            <input id="settings-profile-field-10"
                              type="date"
                              value={birthday}
                              onChange={(e) => updateProfileField('birthday', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-11" className="block text-[10px] font-bold text-[#65676B] mb-1">感情状况 (Relationship)</label>
                            <select id="settings-profile-field-11"
                              value={relationshipStatus}
                              onChange={(e) => updateProfileField('relationshipStatus', e.target.value as any)}
                              className="w-full px-2 px-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            >
                              <option value="单身">单身</option>
                              <option value="恋爱中">恋爱中</option>
                              <option value="已婚">已婚</option>
                              <option value="热恋中">热恋中</option>
                              <option value="有保护关系的守护中">有保护关系的守护中</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-12" className="block text-[10px] font-bold text-[#65676B] mb-1">家庭状态 (Family Status)</label>
                            <input id="settings-profile-field-12"
                              type="text"
                              value={familyStatus}
                              onChange={(e) => updateProfileField('familyStatus', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-13" className="block text-[10px] font-bold text-[#65676B] mb-1">性别 (Gender)</label>
                            <select id="settings-profile-field-13"
                              value={gender}
                              onChange={(e) => updateProfileField('gender', e.target.value as any)}
                              className="w-full px-2 px-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            >
                              <option value="男性">男性 (Male)</option>
                              <option value="女性">女性 (Female)</option>
                              <option value="多元性别">多元/自定义性别</option>
                              <option value="仅对自己公开">仅对自己公开</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-14" className="block text-[10px] font-bold text-[#65676B] mb-1">语言 (Languages)</label>
                            <input id="settings-profile-field-14"
                              type="text"
                              value={languages}
                              onChange={(e) => updateProfileField('languages', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 4: 链接 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenProfileSection(openProfileSection === 'links' ? null : 'links')}
                        className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-bold text-[#050505] transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center space-x-2">
                          <Link2 size={13} className="text-[#1877F2]" />
                          <span>社交链接与作品集 (Links)</span>
                        </span>
                        <ChevronRight size={14} className={`text-gray-500 transition-transform ${openProfileSection === 'links' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {openProfileSection === 'links' && (
                        <div className="p-3 bg-white space-y-3 border-t border-[#E4E6EB] animate-in fade-in duration-100">
                          <div>
                            <label htmlFor="settings-profile-field-15" className="block text-[10px] font-bold text-[#65676B] mb-1">个人网站、博客或作品集</label>
                            <input id="settings-profile-field-15"
                              type="url"
                              value={websiteLink}
                              onChange={(e) => updateProfileField('websiteLink', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 5: 工作教育 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenProfileSection(openProfileSection === 'education' ? null : 'education')}
                        className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-bold text-[#050505] transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center space-x-2">
                          <Briefcase size={13} className="text-[#1877F2]" />
                          <span>工作与教育经历 (Work & Education)</span>
                        </span>
                        <ChevronRight size={14} className={`text-gray-500 transition-transform ${openProfileSection === 'education' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {openProfileSection === 'education' && (
                        <div className="p-3 bg-white space-y-3 border-t border-[#E4E6EB] animate-in fade-in duration-100">
                          <div>
                            <label htmlFor="settings-profile-field-16" className="block text-[10px] font-bold text-[#65676B] mb-1">工作经历 (Work Experience)</label>
                            <input id="settings-profile-field-16"
                              type="text"
                              value={workExperience}
                              onChange={(e) => updateProfileField('workExperience', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-17" className="block text-[10px] font-bold text-[#65676B] mb-1">教育经历 (High School / University)</label>
                            <input id="settings-profile-field-17"
                              type="text"
                              value={educationHistory}
                              onChange={(e) => updateProfileField('educationHistory', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 6: 爱好兴趣 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenProfileSection(openProfileSection === 'interests' ? null : 'interests')}
                        className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-bold text-[#050505] transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center space-x-2">
                          <Gamepad2 size={13} className="text-[#1877F2]" />
                          <span>爱好与兴趣圈子 (Hobbies)</span>
                        </span>
                        <ChevronRight size={14} className={`text-gray-500 transition-transform ${openProfileSection === 'interests' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {openProfileSection === 'interests' && (
                        <div className="p-3 bg-white space-y-3 border-t border-[#E4E6EB] animate-in fade-in duration-100">
                          <div>
                            <label htmlFor="settings-profile-field-18" className="block text-[10px] font-bold text-[#65676B] mb-1">我的核心爱好 (e.g., DotA 2)</label>
                            <input id="settings-profile-field-18"
                              type="text"
                              value={hobbies}
                              onChange={(e) => updateProfileField('hobbies', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-19" className="block text-[10px] font-bold text-[#65676B] mb-1">喜欢的音乐 (Music)</label>
                            <input id="settings-profile-field-19"
                              type="text"
                              value={interestsMusic}
                              onChange={(e) => updateProfileField('interestsMusic', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-20" className="block text-[10px] font-bold text-[#65676B] mb-1">喜欢的影视/节目 (TV & Movies)</label>
                            <input id="settings-profile-field-20"
                              type="text"
                              value={interestsTV}
                              onChange={(e) => updateProfileField('interestsTV', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-21" className="block text-[10px] font-bold text-[#65676B] mb-1">喜爱的游戏 (Games)</label>
                            <input id="settings-profile-field-21"
                              type="text"
                              value={interestsGame}
                              onChange={(e) => updateProfileField('interestsGame', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-22" className="block text-[10px] font-bold text-[#65676B] mb-1">运动队与运动员 (Sports)</label>
                            <input id="settings-profile-field-22"
                              type="text"
                              value={interestsSports}
                              onChange={(e) => updateProfileField('interestsSports', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 7: 旅行 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenProfileSection(openProfileSection === 'travel' ? null : 'travel')}
                        className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-bold text-[#050505] transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center space-x-2">
                          <Compass size={13} className="text-[#1877F2]" />
                          <span>旅行与签到足迹 (Travel)</span>
                        </span>
                        <ChevronRight size={14} className={`text-gray-500 transition-transform ${openProfileSection === 'travel' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {openProfileSection === 'travel' && (
                        <div className="p-3 bg-white space-y-3 border-t border-[#E4E6EB] animate-in fade-in duration-100">
                          <div>
                            <label htmlFor="settings-profile-field-23" className="block text-[10px] font-bold text-[#65676B] mb-1">常签到的旅行地点 (Places Visited)</label>
                            <input id="settings-profile-field-23"
                              type="text"
                              value={travelPlaces}
                              onChange={(e) => updateProfileField('travelPlaces', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 8: 联系信息 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenProfileSection(openProfileSection === 'contact' ? null : 'contact')}
                        className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-bold text-[#050505] transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center space-x-2">
                          <Phone size={13} className="text-[#1877F2]" />
                          <span>敏感联系与媒介 (Contact)</span>
                        </span>
                        <ChevronRight size={14} className={`text-gray-500 transition-transform ${openProfileSection === 'contact' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {openProfileSection === 'contact' && (
                        <div className="p-3 bg-white space-y-3 border-t border-[#E4E6EB] animate-in fade-in duration-100">
                          <div>
                            <label htmlFor="settings-profile-field-24" className="block text-[10px] font-bold text-[#65676B] mb-1">社交媒体主页 ID</label>
                            <input id="settings-profile-field-24"
                              type="text"
                              value={socialMedia}
                              onChange={(e) => updateProfileField('socialMedia', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-25" className="block text-[10px] font-bold text-[#65676B] mb-1">加密电话号码 (🔒 仅限自己)</label>
                            <input id="settings-profile-field-25"
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => updateProfileField('phoneNumber', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-26" className="block text-[10px] font-bold text-[#65676B] mb-1">加密邮箱地址</label>
                            <input id="settings-profile-field-26"
                              type="email"
                              value={emailAddress}
                              onChange={(e) => updateProfileField('emailAddress', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                          <div>
                            <label htmlFor="settings-profile-field-27" className="block text-[10px] font-bold text-[#65676B] mb-1">个人或产品宣传素材 URL</label>
                            <input id="settings-profile-field-27"
                              type="url"
                              value={promoMaterials}
                              onChange={(e) => updateProfileField('promoMaterials', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-none text-xs text-[#050505] focus:outline-none focus:border-[#1877F2]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 9: 徽章 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenProfileSection(openProfileSection === 'badges' ? null : 'badges')}
                        className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-bold text-[#050505] transition-colors cursor-pointer text-left"
                      >
                        <span className="flex items-center space-x-2">
                          <Award size={13} className="text-[#1877F2]" />
                          <span>我的荣耀与勋章 (Badges)</span>
                        </span>
                        <ChevronRight size={14} className={`text-gray-500 transition-transform ${openProfileSection === 'badges' ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {openProfileSection === 'badges' && (
                        <div className="p-3 bg-white border-t border-[#E4E6EB] animate-in fade-in duration-100 text-center py-4 space-y-1">
                          <Award size={24} className="mx-auto text-gray-300" />
                          <div className="text-[11px] font-bold text-[#050505]">本周您还未获得任何徽章</div>
                          <p className="text-[9px] text-[#65676B]">在主地图雷达上持续保持跌倒监护授权、成功在星点发言或打卡足迹即可解锁星点纪念勋章。</p>
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (showToast) showToast('个人名片信息本地同步成功！ 🎉');
                        setActiveView('main');
                      }}
                      className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-none text-xs transition-colors cursor-pointer active:scale-98 shadow-xs"
                    >
                      确认保存并返回设置
                    </button>
                  </div>
                </div>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW 9: ACCOUNT SECURITY                   */}
          {/* ========================================== */}
          {activeView === 'accountSecurity' && (
            <div className="space-y-4" id="view-security-content">
              <div className="bg-white border border-[#E4E6EB] rounded-md p-4 shadow-2xs text-xs space-y-2 text-[#65676B]">
                <div className="font-bold text-[#050505] text-sm flex items-center space-x-1.5">
                  <Lock size={16} className="text-[#1877F2]" />
                  <span>加密安全与节点安全组</span>
                </div>
                <p>
                  配置您的两步验证、TLS 连接密钥状态，确保会话无法被任何外部中间人节点破解。
                </p>
              </div>

              <div className="bg-white border border-[#E4E6EB] rounded-md divide-y divide-[#E4E6EB] overflow-hidden shadow-2xs text-xs">
                <div className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                  <span>双重身份验证 (2FA)</span>
                  <span className="text-[#31A24C] font-bold">已启用 ✔</span>
                </div>
                <div className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                  <span>骨干网络密钥对协商</span>
                  <span className="text-[#1877F2] font-bold">SHA-256 协商级</span>
                </div>
                <div className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                  <span>常驻安全登录位置</span>
                  <span className="text-[#65676B]">甘肃省兰州市 (最新)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('main')}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-[#050505] font-bold rounded-md text-xs transition-colors cursor-pointer"
              >
                返回
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW 10: BLOCKED USERS                     */}
          {/* ========================================== */}
          {activeView === 'blockedUsers' && (
            <div className="space-y-4" id="view-blocked-content">
              <div className="bg-white border border-[#E4E6EB] rounded-md p-4 shadow-2xs text-xs text-center text-[#65676B] space-y-2">
                <EyeOff size={22} className="mx-auto text-[#65676B]" />
                <div className="font-bold text-[#050505] text-sm">已拉黑屏蔽用户</div>
                <p className="px-2">
                  您当前尚未拉黑屏蔽任何用户。被拉黑的用户无法在地图上搜索到您，也无法发送任何即时密聊消息。
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('main')}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-[#050505] font-bold rounded-md text-xs transition-colors cursor-pointer"
              >
                返回设置
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW 11: HELP & FEEDBACK                   */}
          {/* ========================================== */}
          {activeView === 'help' && (
            <div className="space-y-4" id="view-help-content">
              <div className="bg-white border border-[#E4E6EB] rounded-md p-4 shadow-2xs text-xs text-[#65676B] space-y-2">
                <div className="font-bold text-[#050505] text-sm">帮助中心与故障回馈</div>
                <p>
                  Stellar OS 配备了完备的自我排障系统，如遇到雷达未刷新、Leaflet 加载问题，请通过以下通道重置连接或阅读指南：
                </p>
              </div>

              <div className="bg-white border border-[#E4E6EB] rounded-md divide-y divide-[#E4E6EB] overflow-hidden shadow-2xs text-xs">
                <div 
                  onClick={() => {
                    if (showToast) showToast('使用文档《Stellar 全景探针使用规范》已加载到本地缓存');
                  }}
                  className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                >
                  <span>1. 地理地图与雷达标记使用指南</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
                <div 
                  onClick={() => {
                    if (showToast) showToast('家庭越界、跌倒传感警报故障重协商成功 📡');
                  }}
                  className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                >
                  <span>2. 跌倒/呼救传感器故障排障及授权</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
                <div 
                  onClick={() => {
                    if (showToast) showToast('已收集当前网络遥测帧，并发送给技术开发团队 ✈️');
                  }}
                  className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                >
                  <span>3. 故障日志收集与一键遥测回馈</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('main')}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-[#050505] font-bold rounded-md text-xs transition-colors cursor-pointer"
              >
                返回
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW 12: ABOUT STELLAR OS                  */}
          {/* ========================================== */}
          {activeView === 'about' && (
            <div className="space-y-4" id="view-about-content">
              <div className="bg-white border border-[#E4E6EB] rounded-md p-5 shadow-2xs text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center mx-auto ring-4 ring-blue-50">
                  <Globe size={24} />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#050505] text-sm">Stellar OS Pro</h3>
                  <p className="text-[10.5px] text-[#65676B]">版本：v4.0.0 (Build Final-2026)</p>
                </div>

                <p className="text-[10.5px] text-[#65676B] text-justify leading-relaxed px-1">
                  Stellar OS 是基于 React 19 并遵循严酷的 Facebook Straight-Edge UI 系统而缔造的次世代低开销、高响应即时地理协作系统。系统所有的消息通讯均经由 E2EE 高度加密，保证终端主权的纯粹和数据的终极离线。
                </p>

                <div className="text-[9px] text-[#8A8D91] border-t border-gray-100 pt-3">
                  © 2026 Stellar Technology Ltd. <br /> All rights reserved.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('main')}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-[#050505] font-bold rounded-md text-xs transition-colors cursor-pointer"
              >
                返回设置
              </button>
            </div>
          )}

        </div>

        {/* ============================================================== */}
        {/* 3. STATIC FOOTER FOR COMPONENT BRANDING                         */}
        {/* ============================================================== */}
        <div className="p-3 border-t border-[#E4E6EB] bg-white shrink-0 text-center text-[9px] text-gray-400" id="settings-footer">
          STELLAR OPERATING TERMINAL · CORE SETTINGS PANEL
        </div>
      </div>

      {/* Hidden File Input for Device Album Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
        id="avatar-file-upload-input"
      />

      {/* ============================================================== */}
      {/* 4. PHOTO ALBUM SELECTION MODAL (相册选择弹窗)                  */}
      {/* ============================================================== */}
      {isAlbumModalOpen && (
        <div 
          id="avatar-album-modal-overlay"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150"
        >
          <div 
            id="avatar-album-modal-card" data-dialog-focus-scope role="dialog" aria-modal="true" aria-label="相册与头像库"
            className="w-full max-w-[340px] bg-white border border-[#E4E6EB] shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="p-3.5 bg-white border-b border-[#E4E6EB] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#050505]">相册与头像库</h3>
                  <p className="text-[10px] text-[#65676B]">选择系统预设或从本地相册上传</p>
                </div>
              </div>
              <button
                type="button"
                id="close-album-modal-btn" autoFocus aria-label="关闭相册选择"
                onClick={() => setIsAlbumModalOpen(false)}
                className="w-11 h-11 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="p-2 border-b border-[#E4E6EB] bg-[var(--stellar-surface-soft)] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {ALBUM_PRESETS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedAlbumCategory(cat.id as any)}
                  className={`px-2.5 py-1 text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors border ${
                    selectedAlbumCategory === cat.id
                      ? 'bg-[#1877F2] text-white border-[#1877F2]'
                      : 'bg-white text-[#65676B] hover:text-[#050505] border-[#E4E6EB]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Photo Grid Body */}
            <div className="p-3 overflow-y-auto flex-1 custom-scrollbar max-h-[280px]">
              <div className="grid grid-cols-3 gap-2.5">
                {ALBUM_PRESETS.find((c) => c.id === selectedAlbumCategory)?.items.map((imgUrl, i) => {
                  const isSelected = (currentAvatar || userAvatar) === imgUrl;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        handleSelectAvatar(imgUrl, '精选相册头像');
                        setIsAlbumModalOpen(false);
                      }}
                      className={`relative aspect-square cursor-pointer group overflow-hidden border transition-all duration-150 ${
                        isSelected
                          ? 'border-[#1877F2] ring-2 ring-[#1877F2]'
                          : 'border-[#E4E6EB] hover:border-[#1877F2]'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt="Avatar Option"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#1877F2]/20 flex items-center justify-center">
                          <span className="w-6 h-6 bg-[#1877F2] text-white rounded-full flex items-center justify-center shadow-md">
                            <Check size={14} strokeWidth={3} />
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Bottom: Local Photo Album Upload Button */}
            <div className="p-3 bg-white border-t border-[#E4E6EB] space-y-2">
              <button
                type="button"
                id="upload-from-local-album-btn"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 bg-[#E7F3FF] hover:bg-[#DBEBFF] text-[#1877F2] border border-[#1877F2]/30 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors active:scale-98"
              >
                <Upload size={14} />
                <span>从手机本地相册选择上传...</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAlbumModalOpen(false)}
                className="w-full py-1.5 text-center text-xs text-[#65676B] hover:text-[#050505] cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
