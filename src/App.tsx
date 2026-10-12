import { convertPublishedActivity, activityDraft, activityChatSnapshot, canShareActivityWithFriend, syncActivityConversations } from './utils/activityPlanning';
import { dateKey, scheduleDateParts, dueReminders, withEstimatedTravelPlan, type LifeMapTarget } from './utils/lifePlanning';
import './components/chat/bump.css';
import './components/chat/chat-v4.css';
import './components/floating-friend.css';
import './components/activity-workspace.css';
import './components/activity-creation.css';
import './components/chat/chat-immersive.css';
import { useFlightTracking } from './hooks/useFlightTracking';
import { getFlightSnapshotInfo } from './utils/flightTracking';
import {deliverDoodleMessage,DOODLE_RECEIVED} from './data/doodleMessages';
import { readMessageAppearance } from './components/chat/messageStyles';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CornerDownLeft } from 'lucide-react';
import { soundEffects } from './utils/soundEffects';
import { haptics } from './utils/haptics';
import { EmojiBombingOverlay, EmojiBombingData } from './components/EmojiBombingOverlay';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { SettingsDrawer } from './components/SettingsDrawer';
import { NotificationModal } from './components/NotificationModal';
import { SearchModal } from './components/SearchModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CreateStoryModal } from './components/CreateStoryModal';
import { InstagramVideoModal, InstagramVideoData } from './components/InstagramVideoModal';
import { GuardianPushAlertWidget, GuardianAlertData } from './components/GuardianPushAlertWidget';
import { AddPopupMenu } from './components/AddPopupMenu';
import { FirstTimeAddGuideModal, GuideActionType } from './components/FirstTimeAddGuideModal';
import { AddFriendModal } from './components/AddFriendModal';
import { FriendProfileModal } from './components/FriendProfileModal';
import { MapView } from './components/MapView';
import { ChatView } from './components/ChatView';
import type { MessageAppearance } from './components/chat/messageStyles';
import { TeamsView } from './components/TeamsView';
import { DiscoverView } from './components/DiscoverView';
import { StellarView } from './components/StellarView';
import { ProfileView } from './components/ProfileView';
import { UserNoteModal } from './components/UserNoteModal';
import { ChatManagementCenter } from './components/ChatManagementCenter';
import { ActivityCreationModal, ActivityCreationUiState } from './components/ActivityCreationModal';
import { FamilyGroupModal, FamilyGroupData } from './components/FamilyGroupModal';
import { CreateFamilyGroupPage } from './components/CreateFamilyGroupPage';
import { FamilyCareMonitorPage } from './components/FamilyCareMonitorPage';
import { CalendarView } from './components/CalendarView';
import { TextCenterModal } from './components/TextCenterModal';
import { DocumentCenterModal } from './components/DocumentCenterModal';
import { GoodNotesNoteModal } from './components/GoodNotesNoteModal';
import { ImmersiveAddNoteModal } from './components/ImmersiveAddNoteModal';
import { StellarWorkspacePage } from './components/StellarWorkspacePage';
import { PlanetUniverseModal } from './components/PlanetUniverseModal';
import { QuickEditsStudioModal } from './components/QuickEditsStudioModal';
import { ShareActivityModal } from './components/ShareActivityModal';
import { ShareLocationModal, LocationShareData } from './components/ShareLocationModal';
import { ShareLifePlaceModal } from './components/ShareLifePlaceModal';
import { LifePlace } from './types';
import { lifeLayerStore } from './data/lifeLayerStore';
import { CourseManagementApp, UserRole } from './components/skills/CourseManagementApp';
import { CampusRolePreviewPanel, CampusRoleItem, CAMPUS_ROLES } from './components/CampusRolePreviewPanel';
import { IPhone17ProFrame } from './components/IPhone17ProFrame';
import type { MapStyleMode } from './utils/geoUtils';
import { AuthFlow } from './components/AuthFlow';
import { LoginRoleScreen } from './components/LoginRoleScreen';
import { RoleId, INITIAL_NEW_USER_SNAPSHOT, INITIAL_VETERAN_USER_SNAPSHOT, RoleSnapshot } from './data/roleSnapshotData';
import {
  DualRoleId,
  getActiveRoleId,
  getRoleProfile,
  getSharedState,
  subscribeDualRoleStore,
} from './data/dualRoleStore';
import {
  PhotoAlbum,
  DocumentFolder,
  INITIAL_USER_ALBUMS,
  INITIAL_USER_FOLDERS,
} from './data/documentCenterData';
import { INITIAL_PLANETS } from './data/planetData';
import { SkillItem, INITIAL_SKILLS } from './data/skillsData';

import { StealthDurationModal } from './components/StealthDurationModal';
import { ScheduleCreationModal } from './components/ScheduleCreationModal';
import { ScheduleDetailModal } from './components/ScheduleDetailModal';
import {
  INITIAL_FRIENDS,
  INITIAL_CHATS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DISCOVER_POSTS,
  INITIAL_SCHEDULES,
  CURRENT_USER_PROFILE,
  USER_LOCATION,
} from './data/mockData';
import { ROLE_CONVERSATIONS_MAP, getConversationsForRole } from './data/roleConversationsData';
import { Friend, ChatConversation, ChatMessage, DiscoverPost, NotificationItem, LiveLocationShare, PlanetItem, ProfileData, FriendRelationship, StealthCustomSchedule, Schedule, FlightStatus, SimulatedMapActivity, ContactCardData } from './types';

const EMPTY_LIVE_LOCATION_SHARES: LiveLocationShare[] = [];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  type MainTab = 'home' | 'chat' | 'teams' | 'discover' | 'stellar' | 'profile' | 'calendar';
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [tabHistory, setTabHistory] = useState<MainTab[]>(['home']);
  const [tabSlideDirection, setTabSlideDirection] = useState<number>(1);

  const TAB_ORDER = ['home', 'chat', 'teams', 'discover', 'stellar', 'profile', 'calendar'] as const;

  const handleNavigateTab = useCallback((tab: MainTab) => {
    setIsAddMenuOpen(false);
    setCurrentTab((prevTab) => {
      if (prevTab === tab) return prevTab;

      const prevIdx = TAB_ORDER.indexOf(prevTab);
      const nextIdx = TAB_ORDER.indexOf(tab);
      setTabSlideDirection(nextIdx >= prevIdx ? 1 : -1);

      setTabHistory((prevHistory) => {
        if (prevHistory[prevHistory.length - 1] === tab) return prevHistory;
        return [...prevHistory, tab];
      });

      return tab;
    });
  }, []);

  const handleGoBack = useCallback(() => {
    setIsAddMenuOpen(false);
    setTabHistory((prevHistory) => {
      if (prevHistory.length > 1) {
        const newHistory = prevHistory.slice(0, -1);
        const targetTab = newHistory[newHistory.length - 1];

        setCurrentTab((curr) => {
          const prevIdx = TAB_ORDER.indexOf(curr);
          const nextIdx = TAB_ORDER.indexOf(targetTab);
          setTabSlideDirection(nextIdx >= prevIdx ? 1 : -1);
          return targetTab;
        });

        return newHistory;
      } else {
        setCurrentTab((curr) => {
          if (curr !== 'home') {
            const prevIdx = TAB_ORDER.indexOf(curr);
            const nextIdx = TAB_ORDER.indexOf('home');
            setTabSlideDirection(nextIdx >= prevIdx ? 1 : -1);
            return 'home';
          }
          return 'home';
        });
        return ['home'];
      }
    });
  }, []);

  // Dynamic window.innerHeight and safe-area calculated properties to avoid bottom notch/indicator
  useEffect(() => {
    const updateCalculatedProperties = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      // Determine safe area bottom offset dynamically
      const windowH = window.innerHeight;
      const isNotchScreen = windowH >= 780 || (typeof window !== 'undefined' && window.screen && window.screen.height >= 780);
      const safeAreaBottomOffset = isNotchScreen ? 34 : 16;

      document.documentElement.style.setProperty('--safe-area-bottom', `${safeAreaBottomOffset}px`);
      // Offset calculation for map bottom controls to avoid the bottom operation bar
      const mapControlsOffset = safeAreaBottomOffset + 20;
      document.documentElement.style.setProperty('--map-bottom-control-offset', `${mapControlsOffset}px`);
    };

    updateCalculatedProperties();
    window.addEventListener('resize', updateCalculatedProperties);
    window.addEventListener('orientationchange', updateCalculatedProperties);
    return () => {
      window.removeEventListener('resize', updateCalculatedProperties);
      window.removeEventListener('orientationchange', updateCalculatedProperties);
    };
  }, []);
  const [courseAppInitialRole, setCourseAppInitialRole] = useState<UserRole>('instructor');
  const [activeCampusRoleId, setActiveCampusRoleId] = useState<string>('instructor');
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [roleConversationsMap, setRoleConversationsMap] = useState<Record<string, ChatConversation[]>>(() => {
    const initialMap: Record<string, ChatConversation[]> = { ...ROLE_CONVERSATIONS_MAP };
    if (initialMap.alex_explorer) {
      initialMap.alex_explorer = initialMap.alex_explorer.map((c) => {
        if (c.friendId === 'f1') {
          const now = new Date();
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const timeStr = `${hours}:${minutes}`;
          const newMsg: ChatMessage = {
            id: 'sim-msg-initial-talk',
            senderId: 'f1',
            text: '我们能再聊聊吗？',
            timestamp: timeStr,
            isMe: false,
            createdAt: now.getTime(),
          };
          return {
            ...c,
            unreadCount: 1,
            lastMessage: '我们能再聊聊吗？',
            time: timeStr,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      });
    }
    return initialMap;
  });

  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem('stellar_chat_conversations_instructor') || 'null'); if (Array.isArray(saved) && saved.every(c => c.id && Array.isArray(c.messages))) return saved; } catch {}
    return roleConversationsMap['instructor'] || getConversationsForRole('instructor');
  });


  useEffect(() => {
    try { localStorage.setItem(`stellar_chat_conversations_${activeCampusRoleId}`, JSON.stringify(conversations)); } catch {}
  }, [conversations, activeCampusRoleId]);

  useEffect(()=>{
    const receive=(event:Event)=>{const detail=(event as CustomEvent<{roleId:string;conversations:ChatConversation[]}>).detail;if(detail.roleId===activeCampusRoleId)setConversations(detail.conversations);};
    const receiveStorage=(event:StorageEvent)=>{if(event.key!==`stellar_chat_conversations_${activeCampusRoleId}`||!event.newValue)return;try{const data=JSON.parse(event.newValue);if(Array.isArray(data)&&data.every(c=>c.id&&Array.isArray(c.messages)))setConversations(data);}catch{}};
    window.addEventListener(DOODLE_RECEIVED,receive);window.addEventListener('storage',receiveStorage);
    return()=>{window.removeEventListener(DOODLE_RECEIVED,receive);window.removeEventListener('storage',receiveStorage);};
  },[activeCampusRoleId]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isLifeMapPanelOpen,setIsLifeMapPanelOpen] = useState(false);
  const [isMapPinRadialMenuOpen, setIsMapPinRadialMenuOpen] = useState<boolean>(false);
  const [discoverPosts, setDiscoverPosts] = useState<DiscoverPost[]>(INITIAL_DISCOVER_POSTS);
  // 去除默认的预设共享位置设置（根据用户指示完全清空预设共享位置）
  const [liveLocationShares, setLiveLocationShares] = useState<LiveLocationShare[]>([]);

  const handleShareRealTimeLocation = (shareData: LiveLocationShare) => {
    setLiveLocationShares((prev) => [
      shareData,
      ...prev.filter((s) => s.userId !== shareData.userId),
    ]);
  };

  const handleRemoveLiveLocationShare = useCallback((shareId: string) => {
    setLiveLocationShares((prev) => prev.filter((s) => s.id !== shareId && s.userId !== shareId));
  }, []);

  const [mapFocusTarget, setMapFocusTarget] = useState<LifeMapTarget | null>(null);
  const [calendarFocusDate, setCalendarFocusDate] = useState<string>();
  const [scheduleInitialDate, setScheduleInitialDate] = useState<string>();
  const handleNavigateToMapLocation = (location: { lat: number; lng: number; name?: string; scheduleId?: string; planRoute?: boolean }) => {
    handleNavigateTab('home');
    setActiveChatId(null);
    setSelectedMapFriend(null); setSelectedMapActivity(null);
    setMapFocusTarget({...location,name:location.name || '目标地点',timestamp:Date.now()});
    if (location.scheduleId) setActiveMapFilter(['schedules']);
    showToast(`已在地图上锁定：${location.name || '实时位置'} 📍`);
  };

  const handleOpenActivityOnMap = (activity: SimulatedMapActivity) => {
    handleNavigateTab('home');
    setActiveChatId(null);
    setSelectedMapFriend(null);
    setSelectedMapActivity(activity);
    showToast(`已在地图上定位活动：${activity.title} 📍`);
  };

  // User Note / Label state shared between ChatView and MapView
  const [userNote, setUserNote] = useState('音乐不停，分享不止...');
  const [attachedEmoji, setAttachedEmoji] = useState('😜');
  const [noteTheme, setNoteTheme] = useState<'pink' | 'white' | 'blue' | 'sunset' | string>('pink');
  const [userAvatar, setUserAvatar] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150');

  const [profileData, setProfileData] = useState<ProfileData>({
    operatorName: 'Alexia Vance',
    operatorId: 'stellar_alexia',
    operatorBio: '在线',
    moodStatus: '在线',
    signature: '音乐不停，分享不止...',
    aboutYou: '自由职业，热爱科技、网络安全与户外探索。',
    pinnedDetail: '数字内容创作者',
    category: '数字内容创作者 · 运动员',
    isAICreator: false,
    currentCity: '甘肃省兰州市城关区',
    hometown: '甘肃省天水市',
    birthday: '1996-10-12',
    relationshipStatus: '单身',
    familyStatus: '陈建国 (父亲)',
    gender: '男性',
    languages: '中文 (普通话), 英语',
    websiteLink: 'https://stellar.vance.io',
    workExperience: 'Stellar 地图探索及安全控制工作室',
    educationHistory: '兰州大学 · 计算机科学与技术',
    hobbies: 'DotA 2, 徒步登山, 摄影, 骑行',
    interestsMusic: 'Post-Rock, Ambient, Electronic',
    interestsTV: '黑客军团 (Mr. Robot), 硅谷',
    interestsMovie: '黑客帝国, 星际穿越',
    interestsGame: 'DotA 2, Cyberpunk 2077',
    interestsSports: '极客自行车队, 越野跑',
    travelPlaces: '青海湖, 祁连山, 麦积山石窟',
    socialMedia: 'stellar_alexia_social',
    phoneNumber: '+86 181 9097 2878',
    emailAddress: 'alexia.vance@stellar.net',
    promoMaterials: 'https://youtube.com/stellar_showcase',
    stickers: INITIAL_VETERAN_USER_SNAPSHOT.stickers,
    hideStickers: false,
  });

  // Dual Role Snapshots & Switcher State
  const [currentRole, setCurrentRole] = useState<RoleId>('veteran_user');
  const [roleSnapshots, setRoleSnapshots] = useState<Record<RoleId, RoleSnapshot>>({
    new_user: INITIAL_NEW_USER_SNAPSHOT,
    veteran_user: INITIAL_VETERAN_USER_SNAPSHOT,
  });

  const applyRoleSnapshot = useCallback((snapshot: RoleSnapshot) => {
    setProfileData((prev) => ({
      ...prev,
      ...snapshot.profileData,
      stickers: snapshot.stickers,
      hideStickers: snapshot.hideStickers,
    }));
    setUserAvatar(snapshot.avatar);
    setUserNote(snapshot.speechBubbleText);
    setAttachedEmoji(snapshot.mood);
    setNoteTheme(snapshot.bubbleTheme || '#1877F2');
    setFriends(snapshot.friends);
    setNotifications(snapshot.notifications);
  }, []);

  const handleSwitchRole = (targetRoleId: RoleId) => {
    setRoleSnapshots((prevSnapshots) => {
      const updatedSnapshots = { ...prevSnapshots };
      updatedSnapshots[currentRole] = {
        ...updatedSnapshots[currentRole],
        avatar: userAvatar,
        speechBubbleText: userNote,
        mood: attachedEmoji,
        bubbleTheme: noteTheme,
        profileData: {
          ...profileData,
        },
        friends: friends,
        notifications: notifications,
      };

      const targetSnapshot = updatedSnapshots[targetRoleId];
      applyRoleSnapshot(targetSnapshot);
      return updatedSnapshots;
    });

    setCurrentRole(targetRoleId);
    showToast(`🔄 已成功切换至「${targetRoleId === 'new_user' ? '新用户 (萌新探索者)' : '老用户 (资深探索官)'}」账号身份`);
  };

  const handleResetRoleData = () => {
    const freshSnapshot = currentRole === 'new_user' ? { ...INITIAL_NEW_USER_SNAPSHOT } : { ...INITIAL_VETERAN_USER_SNAPSHOT };
    setRoleSnapshots((prev) => ({
      ...prev,
      [currentRole]: freshSnapshot,
    }));
    applyRoleSnapshot(freshSnapshot);
    showToast(`✨ 已恢复「${currentRole === 'new_user' ? '新用户' : '老用户'}」的初始数据快照！`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast('🔒 已退出当前账号，返回手机端双身份登录选择页');
  };

  const handleSelectRoleAndLogin = (roleId: RoleId) => {
    handleSwitchRole(roleId);
    setIsLoggedIn(true);
    showToast(`🎉 欢迎进入 Stellar 星图 · 已以「${roleId === 'new_user' ? '新用户' : '老用户'}」身份登录`);
  };

  // Shared Family Group state
  const [familyGroup, setFamilyGroup] = useState<FamilyGroupData | null>({
    isSet: true,
    name: 'Stellar 幸福家庭组',
    avatarUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=200',
    members: [
      { id: 'm1', name: '陈建国', relation: '父亲', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250' },
      { id: 'm2', name: '王叔叔', relation: '叔叔', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250' },
      { id: 'm3', name: '林浩', relation: '兄弟', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250' },
      { id: 'm4', name: '张伟', relation: '朋友', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250' },
    ],
  });
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isCreateFamilyPageOpen, setIsCreateFamilyPageOpen] = useState(false);
  const [isFamilyCareOpen, setIsFamilyCareOpen] = useState(false);
  const [familyTimeRange, setFamilyTimeRange] = useState<'realtime' | 'today' | 'history'>('realtime');
  const [isFamilyManagementModalOpen, setIsFamilyManagementModalOpen] = useState(false);

  // Close friend bubble z-index, long-press menu, star status, dissipation, and map movement lock states
  const [showBubbleMenu, setShowBubbleMenu] = useState(false);
  const [isStarredCloseFriend, setIsStarredCloseFriend] = useState(false);
  const [isDissipating, setIsDissipating] = useState(false);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [isFriendAvatarAlertActive, setIsFriendAvatarAlertActive] = useState(true);
  const [showQuickReplyBar, setShowQuickReplyBar] = useState(false);
  const [quickReplyText, setQuickReplyText] = useState('');
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals & Drawers state
  const [isStellarWorkspaceOpen, setIsStellarWorkspaceOpen] = useState(false);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [isGoodNotesOpen, setIsGoodNotesOpen] = useState(false);
  const [isImmersiveAddNoteOpen, setIsImmersiveAddNoteOpen] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [explorationTrigger, setExplorationTrigger] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityInitialDraft, setActivityInitialDraft] = useState<ActivityCreationUiState | undefined>();
  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem('stellar_life_schedules_v1') || 'null'); if (Array.isArray(saved)) return saved; } catch {}
    return INITIAL_SCHEDULES;
  });
  useEffect(() => { try { localStorage.setItem('stellar_life_schedules_v1',JSON.stringify(schedules)); } catch {} },[schedules]);
  const [isScheduleCreationOpen, setIsScheduleCreationOpen] = useState(false);
  const [selectedScheduleForDetail, setSelectedScheduleForDetail] = useState<Schedule | null>(null);
  const [isScheduleDetailOpen, setIsScheduleDetailOpen] = useState(false);
  const [pinLocation, setPinLocation] = useState<{ name?: string; address?: string; lat?: number; lng?: number } | null>(null);

  const handleUpdateSchedule = useCallback((updated: Schedule) => {
    setSchedules(prev => prev.map(item => item.id === updated.id ? updated : item));
    setSelectedScheduleForDetail(prev => prev?.id === updated.id ? updated : prev);
  }, []);
  const { configured: flightServiceConfigured, refreshFlight } = useFlightTracking(schedules, handleUpdateSchedule);

  const handleCreateScheduleSuccess = (newSchedule: Schedule) => {
    setSchedules((prev) => [withEstimatedTravelPlan(newSchedule,USER_LOCATION), ...prev]);
    showToast(`📅 日程 "${newSchedule.title}" 已成功创建！已在地图与日历中同步锚点`);
  };

  const handleSelectSchedule = (schedule: Schedule) => {
    setSelectedScheduleForDetail(schedule);
    setIsScheduleDetailOpen(true);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    setIsScheduleDetailOpen(false);
    setSelectedScheduleForDetail(null);
    showToast('已从我的日程中清理 🗑️');
  };

  const handleUpdateScheduleStatus = (scheduleId: string, newFlightStatus?: FlightStatus) => {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id === scheduleId && newFlightStatus && s.flight) {
          return {
            ...s,
            flight: {
              ...s.flight,
              status: newFlightStatus, live: undefined, isSimulated: true,
            },
          };
        }
        return s;
      })
    );
    if (selectedScheduleForDetail && selectedScheduleForDetail.id === scheduleId) {
      setSelectedScheduleForDetail((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          flight: prev.flight && newFlightStatus ? { ...prev.flight, status: newFlightStatus, live: undefined, isSimulated: true } : prev.flight,
        };
      });
    }
  };
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [isStealthModalOpen, setIsStealthModalOpen] = useState(false);
  const [stealthDuration, setStealthDuration] = useState<string | null>(null);
  const [stealthSchedule, setStealthSchedule] = useState<StealthCustomSchedule | null>(null);

  // Evaluate custom stealth schedule periodically
  useEffect(() => {
    if (!stealthSchedule || !stealthSchedule.enabled) return;

    const checkSchedule = () => {
      const curH = new Date().getHours();
      const inOpenWindow =
        stealthSchedule.startHour <= stealthSchedule.endHour
          ? curH >= stealthSchedule.startHour && curH < stealthSchedule.endHour
          : curH >= stealthSchedule.startHour || curH < stealthSchedule.endHour;

      // Outside open window -> stealth mode active
      setIsStealthMode(!inOpenWindow);
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 30000);
    return () => clearInterval(interval);
  }, [stealthSchedule]);
  const [trafficEnabled, setTrafficEnabled] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<MapStyleMode>('standard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setMapStyle('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setMapStyle('standard');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      showToast(next ? '🌙 已开启深色模式 (0.4s 交叉淡化)' : '☀️ 已切换至浅色模式 (0.4s 交叉淡化)');
      return next;
    });
  };

  const [activeMapFilter, setActiveMapFilter] = useState<string[]>(['friends']);

  const handleMapFilterChange = (filterId: string | string[]) => {
    if (Array.isArray(filterId)) {
      setActiveMapFilter(filterId);
      return;
    }
    setActiveMapFilter(prev => {
      const current = Array.isArray(prev) ? prev : [prev];
      let base = current.includes('all') ? ['friends', 'activities', 'stars', 'family', 'life', 'groups', 'squads'] : current;
      
      if (filterId === 'all') {
        const isAllOn = base.includes('friends') && base.includes('activities') && base.includes('stars') && base.includes('family') && base.includes('life');
        if (isAllOn) {
          return ['friends'];
        } else {
          return ['all', 'friends', 'activities', 'stars', 'family', 'life', 'groups', 'squads'];
        }
      }

      let next: string[];
      if (base.includes(filterId)) {
        next = base.filter(f => f !== filterId);
      } else {
        next = [...base, filterId];
      }
      return next.length > 0 ? next : ['all', 'friends', 'family', 'groups', 'squads', 'activities', 'schedules', 'places'];
    });
  };
  const [publishedActivities, setPublishedActivities] = useState<ActivityCreationUiState[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem('stellar_life_activities_v1') || 'null'); if (Array.isArray(saved)) return saved; } catch {}
    return [];
  });
  useEffect(() => { try { localStorage.setItem('stellar_life_activities_v1',JSON.stringify(publishedActivities)); } catch {} },[publishedActivities]);
  const [activityChanges, setActivityChanges] = useState<Record<string, SimulatedMapActivity>>(() => {
    try { return JSON.parse(localStorage.getItem('stellar_activity_updates_v1') || '{}'); } catch { return {}; }
  });
  useEffect(() => { try { localStorage.setItem('stellar_activity_updates_v1', JSON.stringify(activityChanges)); } catch { setToastMessage('活动记录未能保存，浏览器存储空间不足，请减少活动照片后重试'); } }, [activityChanges]);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isFirstTimeAddGuideOpen, setIsFirstTimeAddGuideOpen] = useState(false);
  const [isTriggerPlaceMarker, setIsTriggerPlaceMarker] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [canvasChatEntry, setCanvasChatEntry] = useState<{ friendId: string; appearance: MessageAppearance; key: number } | null>(null);
  const [selectedProfileFriend, setSelectedProfileFriend] = useState<Friend | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showManagementCenter, setShowManagementCenter] = useState(false);
  const [isTextCenterOpen, setIsTextCenterOpen] = useState(false);
  const [isDocumentCenterOpen, setIsDocumentCenterOpen] = useState(false);
  const [userAlbums, setUserAlbums] = useState<PhotoAlbum[]>(INITIAL_USER_ALBUMS);
  const [userFolders, setUserFolders] = useState<DocumentFolder[]>(INITIAL_USER_FOLDERS);
  const [planets, setPlanets] = useState<PlanetItem[]>(INITIAL_PLANETS);
  const [skills, setSkills] = useState<SkillItem[]>(INITIAL_SKILLS);
  const [isPlanetUniverseOpen, setIsPlanetUniverseOpen] = useState(false);
  const [isQuickEditsOpen, setIsQuickEditsOpen] = useState(false);
  const [isCourseAppOpen, setIsCourseAppOpen] = useState(false);
  const [courseAppRequestedTab, setCourseAppRequestedTab] = useState<'attendance' | 'create' | 'analytics' | 'badges' | 'mycourses'>('attendance');
  const [calendarTrigger, setCalendarTrigger] = useState<number>(0);
  const [addCourseMenuTrigger, setAddCourseMenuTrigger] = useState<number>(0);
  const [stellarTargetUnboxId, setStellarTargetUnboxId] = useState<string | null>(null);
  const [reminderSchedule, setReminderSchedule] = useState<Schedule | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedGroupWorkspaceId, setSelectedGroupWorkspaceId] = useState<string | null>(null);
  const [selectedMapFriend, setSelectedMapFriend] = useState<Friend | null>(null);
  const [selectedMapActivity, setSelectedMapActivity] = useState<SimulatedMapActivity | null>(null);
  const [isMapIntercomTransmitting, setIsMapIntercomTransmitting] = useState(false);

  // Multi-System Role Switcher & Fast Experience Handlers
  const handleSelectCampusRole = (roleItem: CampusRoleItem) => {
    // 1. Persist current role conversations before switching
    setRoleConversationsMap((prev) => ({
      ...prev,
      [activeCampusRoleId]: conversations,
    }));

    // 2. Fetch and activate the target role's conversations
    let targetConversations = roleConversationsMap[roleItem.id] || getConversationsForRole(roleItem.id);
    try { const saved = JSON.parse(localStorage.getItem(`stellar_chat_conversations_${roleItem.id}`) || 'null'); if (Array.isArray(saved) && saved.every(c => c.id && Array.isArray(c.messages))) targetConversations = saved; } catch {}
    setConversations(targetConversations);
    setActiveChatId(null); // Reset active chat so the user lands on the conversation list
    setIsFriendAvatarAlertActive(true);
    setShowQuickReplyBar(false);

    setActiveCampusRoleId(roleItem.id);
    if (roleItem.appRole) {
      setCourseAppInitialRole(roleItem.appRole);
    }

    if (!isLoggedIn) {
      setIsLoggedIn(true);
    }

    setProfileData((prev) => ({
      ...prev,
      name: roleItem.characterName,
      operatorName: roleItem.characterName,
      bio: `${roleItem.name} · ${roleItem.title} (${roleItem.dept})`,
      signature: roleItem.note || `${roleItem.name} · ${roleItem.title}`,
      occupation: roleItem.title,
      studentId: roleItem.characterId,
      aboutYou: roleItem.description,
    }));
    setUserAvatar(roleItem.avatar);

    if (roleItem.note) {
      setUserNote(roleItem.note);
    }
    if (roleItem.emoji) {
      setAttachedEmoji(roleItem.emoji);
    }
    if (roleItem.theme) {
      setNoteTheme(roleItem.theme as any);
    }

    if (roleItem.id === 'friend_liam' || roleItem.id === 'friend_sarah') {
      showToast(`👥 已切换至好友「${roleItem.characterName}」视角，聊天对话框已实时更新！`);
    } else if (roleItem.targetModule === 'course_app') {
      showToast(`🎓 已切换至「${roleItem.name} · ${roleItem.characterName}」，课程教学对话已更新！`);
    } else if (roleItem.targetModule === 'family_care') {
      showToast(`🏡 已切换至家庭关怀角色「${roleItem.characterName}」，家庭聊天对话已更新！`);
    } else if (roleItem.targetModule === 'teams_hub') {
      showToast(`🚴 已切换至户外团队角色「${roleItem.characterName}」，车队聊天对话已更新！`);
    } else if (roleItem.targetModule === 'discover') {
      showToast(`✨ 已切换至创作者角色「${roleItem.characterName}」，达人创作对话已更新！`);
    } else {
      showToast(`🌍 已切换至「${roleItem.name} · ${roleItem.characterName}」，聊天对话已更新！`);
    }
  };

  // Dual Role Memory Subscription & Synchronization Hook
  useEffect(() => {
    const unsubscribe = subscribeDualRoleStore(() => {
      const activeDualId = getActiveRoleId();
      const activeProfile = getRoleProfile(activeDualId);
      const shared = getSharedState();

      setUserAvatar(activeProfile.avatar);
      setAttachedEmoji(activeProfile.mood);
      setUserNote(activeProfile.speechBubbleText);
      setProfileData(activeProfile.profileData);
      if (activeProfile.notifications) {
        setNotifications(activeProfile.notifications);
      }
      setIsStealthMode(activeProfile.ghostMode);

      // Sync Friend Relationship dynamically based on shared friendship state
      const otherRoleId: DualRoleId = activeDualId === 'roleA' ? 'roleB' : 'roleA';
      const otherProfile = getRoleProfile(otherRoleId);

      if (shared.friendship === 'friends') {
        setFriends((prevFriends) => {
          const exists = prevFriends.some((f) => f.id === otherProfile.userId || f.name === otherProfile.operatorName);
          if (!exists) {
            const newFriendItem = {
              id: otherProfile.userId,
              name: otherProfile.operatorName,
              avatar: otherProfile.avatar,
              distance: '1.2 km',
              status: otherProfile.behaviorStatus,
              battery: otherProfile.battery,
              stayDuration: otherProfile.stayDuration || '刚刚',
              speedKmh: 0,
              mood: otherProfile.mood,
              lat: 36.062,
              lng: 103.832,
              relationship: 'friend' as const,
              speechBubble: otherProfile.speechBubbleText,
            };
            return [newFriendItem, ...prevFriends];
          }
          return prevFriends;
        });
      } else if (shared.friendship === 'none' || shared.friendship === 'declined') {
        setFriends((prevFriends) =>
          prevFriends.filter((f) => f.id !== otherProfile.userId && f.name !== otherProfile.operatorName)
        );
      }
    });

    return unsubscribe;
  }, []);

  const handleNavigateModule = (targetModule: 'course_app' | 'home_map' | 'family_care' | 'teams_hub' | 'discover') => {
    if (!isLoggedIn) {
      setIsLoggedIn(true);
    }
    if (targetModule === 'course_app') {
      setIsCourseAppOpen(true);
      setIsFamilyCareOpen(false);
    } else if (targetModule === 'family_care') {
      setIsCourseAppOpen(false);
      setIsFamilyCareOpen(true);
    } else if (targetModule === 'discover') {
      setIsCourseAppOpen(false);
      setIsFamilyCareOpen(false);
      handleNavigateTab('discover');
    } else if (targetModule === 'teams_hub') {
      setIsCourseAppOpen(false);
      setIsFamilyCareOpen(false);
      handleNavigateTab('home');
      handleMapFilterChange('groups');
    } else {
      // home_map
      setIsCourseAppOpen(false);
      setIsFamilyCareOpen(false);
      handleNavigateTab('home');
    }
  };

  const handleOpenCourseAppWithRole = (
    tab: 'attendance' | 'create' | 'analytics' | 'badges' | 'mycourses' = 'attendance',
    role?: UserRole
  ) => {
    if (role) {
      setCourseAppInitialRole(role);
    }
    if (!isLoggedIn) {
      setIsLoggedIn(true);
    }
    setCourseAppRequestedTab(tab);
    setIsCourseAppOpen(true);
  };

  const handleToggleLoginState = () => {
    setIsLoggedIn((prev) => {
      const next = !prev;
      showToast(next ? '🎉 已快速登入星图主界面' : '🔒 已回到手机端登录与鉴权页面');
      return next;
    });
  };

  // Skill Synchronization Handlers across all views
  const handleToggleSkillInstall = (skill: SkillItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skill.id
          ? {
              ...s,
              isInstalled: !s.isInstalled,
              isEnabled: !s.isInstalled ? true : false,
              downloads: !s.isInstalled ? s.downloads + 1 : s.downloads,
            }
          : s
      )
    );

    if (!skill.isInstalled) {
      showToast(`📦 成功安装并激活【${skill.displayName}】，2s 周期呼吸光效已生效！`);
    } else {
      showToast(`🗑️ 已卸载技能【${skill.displayName}】`);
    }
  };

  const handleToggleSkillEnable = (skill: SkillItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    let nextState = false;
    setSkills((prev) =>
      prev.map((s) => {
        if (s.id === skill.id) {
          nextState = !s.isEnabled;
          return {
            ...s,
            isInstalled: true,
            isEnabled: nextState,
          };
        }
        return s;
      })
    );
    showToast(
      !skill.isEnabled
        ? `⚡ 呼吸光效已激活！技能【${skill.displayName}】已装载，星航者名片已同步，发现页已生成专属入口 🌠`
        : `⏸️ 已暂停技能【${skill.displayName}】的协同装载`
    );
  };

  const handlePracticeSkillExp = (skill: SkillItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSkills((prev) =>
      prev.map((s) => {
        if (s.id === skill.id) {
          const newExp = s.mastery.exp + 15;
          let newLevel = s.mastery.level;
          let newTier = s.mastery.tierTitle;
          if (newExp >= s.mastery.maxExp) {
            newLevel += 1;
            newTier = newLevel >= 5 ? '首席科学家' : newLevel >= 4 ? '资深学者' : newLevel >= 3 ? '进阶工程师' : '熟练实践者';
          }
          const updatedMaxExp = newLevel > s.mastery.level ? s.mastery.maxExp + 50 : s.mastery.maxExp;
          const boundedExp = newExp >= s.mastery.maxExp ? newExp - s.mastery.maxExp : newExp;
          return {
            ...s,
            mastery: {
              ...s.mastery,
              exp: boundedExp,
              maxExp: updatedMaxExp,
              level: newLevel,
              tierTitle: newTier,
              percentage: Math.min(100, Math.round((boundedExp / updatedMaxExp) * 100)),
            },
          };
        }
        return s;
      })
    );
    showToast(`📈 技能【${skill.displayName}】熟练度 +15 XP！星航者名片技能树已同步更新 🎉`);
  };

  const handleStarSkill = (skill: SkillItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSkills((prev) =>
      prev.map((s) => (s.id === skill.id ? { ...s, isStarred: !s.isStarred, stars: s.isStarred ? s.stars - 1 : s.stars + 1 } : s))
    );
    showToast(skill.isStarred ? `已取消标星【${skill.displayName}】` : `⭐ 已为【${skill.displayName}】点亮学术标星！`);
  };

  const handleEquipAllCoreSkills = () => {
    setSkills((prev) =>
      prev.map((s) => {
        if (['skill-data-analysis', 'skill-academic-chart', 'skill-project-manage', 'skill-code-debug'].includes(s.id)) {
          return { ...s, isInstalled: true, isEnabled: true };
        }
        return s;
      })
    );
    showToast('⚡ 已一键激活全部核心学术与协作技能！已赋予 2s 周期呼吸灯光效并同步至星航者名片 🌠');
  };
  const [currentBombing, setCurrentBombing] = useState<EmojiBombingData | null>(null);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [videoStories, setVideoStories] = useState<InstagramVideoData[]>([
    {
      id: 'story-1',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lights-41642-large.mp4',
      authorName: 'Alex Mercer',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      caption: '三里屯夜幕下的霓虹闪烁，探索城市引力波 ✨',
      location: '北京市朝阳区三里屯商圈',
      likesCount: 142,
      commentsCount: 18,
    },
  ]);
  const [activeInstagramVideo, setActiveInstagramVideo] = useState<InstagramVideoData | null>(null);
  const [guardianAlert, setGuardianAlert] = useState<GuardianAlertData | null>(null);

  const handleGuardianAlertClick = (alert: GuardianAlertData) => {
    handleSendMessage(
      alert.conversationId,
      `[🚨 紧急安全通报] ${alert.message}`,
      { type: 'text' }
    );
    setGuardianAlert(null);
    showToast('已查看安全通报，并自动同步至聊天记录 🛡️');
    setActiveChatId(alert.conversationId);
    handleNavigateTab('chat');
  };

  const handleSendStory = (type: 'photo' | 'video', mediaUrl: string, caption: string, location: string) => {
    if (type === 'photo') {
      const newStarPost: DiscoverPost = {
        id: `star-${Date.now()}`,
        createdAt: Date.now(),
        authorName: '我',
        authorAvatar: userAvatar,
        time: '刚刚',
        content: caption || '分享了新星片 🌠',
        image: mediaUrl,
        location: location,
        isStarCard: true,
        postType: 'star',
        likes: 0,
        comments: 0,
      };
      setDiscoverPosts((prev) => [newStarPost, ...prev]);
    } else {
      const newVideoStory: InstagramVideoData = {
        id: `story-${Date.now()}`,
        videoUrl: mediaUrl,
        authorName: '我',
        authorAvatar: userAvatar,
        caption: caption || '我的快拍短视频 🎥',
        location: location,
        likesCount: 1,
        commentsCount: 0,
        isLiked: false,
      };
      setVideoStories((prev) => [newVideoStory, ...prev]);
    }
  };

  // Only simulate emoji bombing ONCE upon first entry in this browser session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasSimulated = sessionStorage.getItem('stellar_initial_bombing_simulated');
    if (hasSimulated) return;

    sessionStorage.setItem('stellar_initial_bombing_simulated', 'true');
    const singleBombing: EmojiBombingData = {
      senderName: 'Sarah Chen (薛梦)',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
      emoji: '💣',
      count: 24,
      message: '欢迎回到 Stellar 星图！💥投掷了一波炸弹问候！',
    };

    const timer = setTimeout(() => {
      setCurrentBombing(singleBombing);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    let seen: Set<string>;
    try { seen = new Set(JSON.parse(localStorage.getItem('stellar_life_reminders_v1') || '[]')); } catch { seen = new Set(); }
    const check = () => {
      if (document.visibilityState === 'hidden') return;
      const due = dueReminders(schedules.filter(schedule => schedule.type !== 'flight' || getFlightSnapshotInfo(schedule).status !== 'cancelled'),Date.now(),seen);
      due.forEach(item => {
        seen.add(item.key);
        setReminderSchedule(item.schedule);
        const content = `${item.schedule.title} · ${item.schedule.location.name}`;
        setNotifications(prev => [{id:item.key,title:item.kind === '出发' ? '该出发了' : '日程提醒',content,time:'刚刚',type:'system',read:false},...prev]);
        showToast(`${item.kind === '出发' ? '该出发了' : '日程提醒'}：${content}`);
      });
      if (due.length) try { localStorage.setItem('stellar_life_reminders_v1',JSON.stringify([...seen].slice(-500))); } catch {}
    };
    check(); const timer = window.setInterval(check,15000);
    document.addEventListener('visibilitychange',check);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange',check); };
  },[schedules,showToast]);

  const unreadNotificationsCount = (notifications || []).filter((n) => !n.read).length;
  const unreadChatsCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const [sharingActivity, setSharingActivity] = useState<SimulatedMapActivity | null>(null);
  const [sharingLocation, setSharingLocation] = useState<LocationShareData | null>(null);
  const [sharingLifePlace, setSharingLifePlace] = useState<LifePlace | null>(null);

  const handleSendMessage = (
    conversationId: string,
    text: string,
    options?: {
      textStyle?: ChatMessage['textStyle'];
      duration?: number;
      url?: string;
      type?: 'text' | 'audio' | 'image' | 'file' | 'location' | 'emoji' | 'activity' | 'contact' | 'life_place' | 'handwriting';
      imageUrl?: string;
      isHandwriting?: boolean;
      doodleLayout?: ChatMessage["doodleLayout"];
      handwritingStrokes?: Array<{ points: Array<{ x: number; y: number }>; color: string; width: number; isEraser?: boolean }>;
      fileData?: { name: string; size: string; type?: string; url?: string };
      locationData?: { name: string; address?: string; lat?: number; lng?: number };
      contactData?: ContactCardData;
      emojiData?: { emoji: string; animation?: string };
      isBurnAfterReading?: boolean;
      povExpiresAt?: number;
      activityId?: string;
      activityData?: SimulatedMapActivity;
      lifePlaceId?: string;
      lifePlaceData?: LifePlace;
    },
    quotedMessage?: { id: string; senderName?: string; text?: string }
  ) => {
    const now = new Date();
    const messageId = `msg-${crypto.randomUUID()}`;
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    const dateLabelStr = `${year}年${month}月${day}日`;
    const fullTimestampStr = `${dateLabelStr} ${timeStr}`;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId || c.friendId === conversationId) {
          const type = options?.type || (options?.contactData ? 'contact' : options?.duration ? 'audio' : 'text');
          const isAudio = type === 'audio';
          const newMsg: ChatMessage = {
            id: messageId,
            senderId: 'me',
            text: isAudio ? '' : text,
            timestamp: timeStr,
            dateLabel: dateLabelStr,
            fullTimestamp: fullTimestampStr,
            createdAt: now.getTime(),
            isMe: true,
            type,
            textStyle: (type === 'text' || type === 'image') ? options?.textStyle || readMessageAppearance() : undefined,
            audioDuration: options?.duration || (isAudio ? 3 : undefined),
            audioUrl: options?.url,
            imageUrl: options?.imageUrl,
            isHandwriting: options?.isHandwriting || type === 'handwriting',
            handwritingStrokes: options?.handwritingStrokes,
            doodleLayout: options?.doodleLayout,
            fileData: options?.fileData,
            locationData: options?.locationData,
            contactData: options?.contactData,
            emojiData: options?.emojiData,
            isBurnAfterReading: options?.isBurnAfterReading,
            povExpiresAt: options?.povExpiresAt,
            activityId: options?.activityId,
            activityData: options?.activityData,
            lifePlaceId: options?.lifePlaceId || options?.lifePlaceData?.id,
            lifePlaceData: options?.lifePlaceData,
            quotedMessage,
          };

          let lastMsg = text;
          if (type === 'handwriting' || options?.isHandwriting) lastMsg = '[手写 ✍️]';
          else if (type === 'audio') lastMsg = `[语音 🎙️ ${newMsg.audioDuration || 3}"]`;
          else if (type === 'image') lastMsg = '[图片 📷]';
          else if (type === 'file') lastMsg = `[文件] ${options?.fileData?.name || ''}`;
          else if (type === 'location') lastMsg = `[位置 📍] ${options?.locationData?.name || ''}`;
          else if (type === 'life_place') lastMsg = `[生活坐标 📍] ${options?.lifePlaceData?.name || text}`;
          else if (type === 'emoji') lastMsg = `[表情] ${options?.emojiData?.emoji || text}`;
          else if (type === 'activity') lastMsg = `[活动 🎯] ${options?.activityData?.title || text}`;
          else if (type === 'contact') lastMsg = `[名片 👤] ${options?.contactData?.name || text}`;

          return {
            ...c,
            lastMessage: lastMsg,
            time: timeStr,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );
    if(options?.doodleLayout) {
      const recipient=conversations.find(c=>c.id===conversationId||c.friendId===conversationId);
      if(recipient) deliverDoodleMessage({id:messageId,senderId:'me',isMe:true,text,timestamp:timeStr,dateLabel:dateLabelStr,fullTimestamp:fullTimestampStr,createdAt:now.getTime(),type:'handwriting',imageUrl:options.imageUrl,isHandwriting:true,handwritingStrokes:options.handwritingStrokes,doodleLayout:options.doodleLayout},{roleId:activeCampusRoleId,name:profileData.operatorName||'Alex',avatar:userAvatar},recipient);
    }
    return messageId;
  };

  const handleUpdateActivity = (activity: SimulatedMapActivity) => {
    setActivityChanges(previous => ({ ...previous, [activity.id]: activity }));
    setSelectedMapActivity(previous => previous?.id === activity.id ? activity : previous);
    setConversations(previous => syncActivityConversations(previous, activity));
    setRoleConversationsMap(previous => Object.fromEntries(Object.keys(previous).map(roleId => [roleId, syncActivityConversations(previous[roleId], activity)])));
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (!key?.startsWith('stellar_chat_conversations_') || key === `stellar_chat_conversations_${activeCampusRoleId}`) continue;
        try {
          const saved = JSON.parse(localStorage.getItem(key) || 'null');
          if (!Array.isArray(saved) || !saved.every(chat => chat?.id && Array.isArray(chat.messages))) continue;
          const updated = syncActivityConversations(saved, activity);
          if (updated !== saved) localStorage.setItem(key, JSON.stringify(updated));
        } catch {}
      }
    } catch {}
    setSchedules(previous => previous.map(schedule => schedule.id === `sched-act-${activity.id}` ? {
      ...schedule, status: activity.endedAt ? 'completed' : 'active',
      reminders: [activity.reminderMinutes ?? 30],
      reminder: { enabled: activity.isReminderSet !== false && !activity.endedAt, advanceMinutes: activity.reminderMinutes ?? 30 }, updatedAt: new Date().toISOString(),
    } : schedule));
  };

  const handleEditActivity = (activity: SimulatedMapActivity, repeat = false) => {
    const original = publishedActivities.find(item => item.id === activity.id);
    const draft = activityDraft(activity, original);
    if (repeat) {
      draft.id = undefined;
      draft.startTime = `${dateKey(new Date(Date.now() + 86400000))} 18:00`;
      draft.endTime = `${dateKey(new Date(Date.now() + 86400000))} 20:00`;
      draft.deadlineTime = '';
    }
    setActivityInitialDraft(draft); setPinLocation(null); setIsActivityModalOpen(true);
  };

  const handleOpenActivityChat = (selectedActivity: SimulatedMapActivity) => {
    const activity = activityChanges[selectedActivity.id] || selectedActivity;
    const id = `activity-chat-${activity.id}`;
    const members = activity.participants.filter(member => member.invitationStatus !== 'invited');
    setConversations(previous => {
      if (previous.some(conversation => conversation.id === id)) return syncActivityConversations(previous, activity);
      return [{ id, friendId: id, friendName: activity.title, avatar: activity.coverImageUrl || activity.authorAvatar || userAvatar,
        lastMessage: `[活动] ${activity.title}`, time: '刚刚', unreadCount: 0, isGroup: true,
        groupAvatars: members.map(member => member.avatar),
        groupDetails: { announcement: activity.equipmentTips || '', tags: ['活动'], createdAt: dateKey(), location: activity.locationName, adminName: activity.authorName || '我', memberCount: members.length, members: members.map(member => ({ id: member.id, name: member.name, avatar: member.avatar, role: member.groupRole === 'admin' ? '群主' as const : '成员' as const })) },
        messages: [{ id: `activity-invite-${activity.id}`, senderId: 'me', isMe: true, type: 'activity' as const, text: activity.title, timestamp: '刚刚', activityId: activity.id, activityData: activityChatSnapshot(activity) }],
      }, ...previous];
    });
    handleNavigateTab('chat'); setActiveChatId(id);
  };

  const handleShareActivityToFriend = (
    friendIds: string[] | string,
    sharedActivity: SimulatedMapActivity
  ) => {
    const activity = activityChanges[sharedActivity.id] || sharedActivity;
    const requestedIds = [...new Set(Array.isArray(friendIds) ? friendIds : [friendIds])];
    if (requestedIds.length === 0) return;
    if (activity.privacyLevel === 'private') { showToast('该活动仅自己可见，不能分享'); return; }
    const ids = requestedIds.filter(friendId => canShareActivityWithFriend(activity, friendId));
    if (ids.length === 0) { showToast('该活动仅对指定好友或参与者可见'); return; }
    const snapshot = activityChatSnapshot(activity);
    const skippedText = ids.length < requestedIds.length ? `，已跳过 ${requestedIds.length - ids.length} 位不在可见范围内的好友` : '';

    const sentNames: string[] = [];

    ids.forEach((friendId) => {
      let conv = conversations.find((c) => c.friendId === friendId);
      let convId = conv?.id;
      const friendObj = friends.find((f) => f.id === friendId);
      const friendName = friendObj?.name || conv?.friendName || '好友';
      const friendAvatar =
        friendObj?.avatar ||
        conv?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';

      sentNames.push(friendName);

      if (!conv) {
        convId = `c-${Date.now()}-${friendId}`;
        const newConv: ChatConversation = {
          id: convId,
          friendId,
          friendName,
          avatar: friendAvatar,
          lastMessage: `[活动 🎯] ${activity.title}`,
          time: '刚刚',
          unreadCount: 0,
          messages: [],
        };
        setConversations((prev) => [newConv, ...prev]);
      }

      handleSendMessage(convId!, `[活动] ${activity.title}`, {
        type: 'activity',
        activityId: activity.id,
        activityData: snapshot,
      });
    });

    soundEffects.playShareSound();
    if (ids.length === 1) {
      showToast(`已成功将「${activity.title}」活动卡片分享给 ${sentNames[0]} 🎯${skippedText}`);
      handleAddNotification(
        `活动分享`,
        `已向 ${sentNames[0]} 发送「${activity.title}」`,
        'message'
      );
    } else {
      const summaryText =
        sentNames.length <= 2
          ? sentNames.join('、')
          : `${sentNames.slice(0, 2).join('、')} 等 ${sentNames.length} 位好友`;
      showToast(`已成功将活动分享给 ${summaryText} 🎯${skippedText}`);
      handleAddNotification(
        `活动批量分享`,
        `已向 ${summaryText} 发送「${activity.title}」活动卡片`,
        'message'
      );
    }
  };

  const handleShareLocationToFriend = (
    friendIds: string[] | string,
    locationData: LocationShareData
  ) => {
    const ids = Array.isArray(friendIds) ? friendIds : [friendIds];
    if (ids.length === 0) return;

    const sentNames: string[] = [];

    ids.forEach((friendId) => {
      let conv = conversations.find((c) => c.friendId === friendId);
      let convId = conv?.id;
      const friendObj = friends.find((f) => f.id === friendId);
      const friendName = friendObj?.name || conv?.friendName || '好友';
      const friendAvatar =
        friendObj?.avatar ||
        conv?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';

      sentNames.push(friendName);

      if (!conv) {
        convId = `c-${Date.now()}-${friendId}`;
        const newConv: ChatConversation = {
          id: convId,
          friendId,
          friendName,
          avatar: friendAvatar,
          lastMessage: `[位置 📍] ${locationData.name}`,
          time: '刚刚',
          unreadCount: 0,
          messages: [],
        };
        setConversations((prev) => [newConv, ...prev]);
      }

      handleSendMessage(convId!, `[位置] ${locationData.name}`, {
        type: 'location',
        locationData: {
          name: locationData.name,
          address: locationData.address || '甘肃省兰州市城关区南滨河东路',
          lat: locationData.lat,
          lng: locationData.lng,
        },
      });
    });

    soundEffects.playShareSound();
    const isLive = Boolean(locationData.isLive);
    const tagLabel = isLive ? '即时定位' : '常去地点';
    if (ids.length === 1) {
      showToast(`已成功将「${locationData.name}」${tagLabel}分享给 ${sentNames[0]} 📍`);
      handleAddNotification(
        `位置分享`,
        `已向 ${sentNames[0]} 发送「${locationData.name}」${tagLabel}卡片`,
        'message'
      );
    } else {
      const summaryText =
        sentNames.length <= 2
          ? sentNames.join('、')
          : `${sentNames.slice(0, 2).join('、')} 等 ${sentNames.length} 位好友`;
      showToast(`已成功将${tagLabel}分享给 ${summaryText} 📍`);
      handleAddNotification(
        `位置批量分享`,
        `已向 ${summaryText} 发送「${locationData.name}」${tagLabel}卡片`,
        'message'
      );
    }
  };

  const handleShareLifePlaceToFriend = (
    friendIds: string[] | string,
    place: LifePlace
  ) => {
    const ids = Array.isArray(friendIds) ? friendIds : [friendIds];
    if (ids.length === 0) return;

    const sentNames: string[] = [];

    ids.forEach((friendId) => {
      let conv = conversations.find((c) => c.friendId === friendId);
      let convId = conv?.id;
      const friendObj = friends.find((f) => f.id === friendId);
      const friendName = friendObj?.name || conv?.friendName || '好友';
      const friendAvatar =
        friendObj?.avatar ||
        conv?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';

      sentNames.push(friendName);

      if (!conv) {
        convId = `c-${Date.now()}-${friendId}`;
        const newConv: ChatConversation = {
          id: convId,
          friendId,
          friendName,
          avatar: friendAvatar,
          lastMessage: `[生活坐标 📍] ${place.name}`,
          time: '刚刚',
          unreadCount: 0,
          messages: [],
        };
        setConversations((prev) => [newConv, ...prev]);
      }

      handleSendMessage(convId!, `[生活坐标 📍] ${place.name}`, {
        type: 'life_place',
        lifePlaceData: place,
        lifePlaceId: place.id,
        locationData: {
          name: place.name,
          address: place.direction || '兰州市城关区',
          lat: place.lat,
          lng: place.lng,
        },
      });
    });

    lifeLayerStore.forwardPlace(
      place.id,
      ids.map((id) => {
        const f = friends.find((item) => item.id === id);
        return {
          userId: id,
          userName: f?.name || '好友',
          avatar: f?.avatar,
          mode: 'added_to_map',
          shareVisitCount: true,
          sharePhotos: true,
          shareEncounters: false,
          shareNotes: true,
          at: new Date().toISOString(),
        };
      })
    );

    soundEffects.playShareSound();
    if (ids.length === 1) {
      showToast(`已成功将生活坐标「${place.name}」分享给 ${sentNames[0]} 📍`);
      handleAddNotification(
        `生活坐标分享`,
        `已向 ${sentNames[0]} 发送生活坐标「${place.name}」`,
        'message'
      );
    } else {
      const summaryText =
        sentNames.length <= 2
          ? sentNames.join('、')
          : `${sentNames.slice(0, 2).join('、')} 等 ${sentNames.length} 位好友`;
      showToast(`已成功将生活坐标分享给 ${summaryText} 📍`);
      handleAddNotification(
        `生活坐标批量分享`,
        `已向 ${summaryText} 发送生活坐标「${place.name}」`,
        'message'
      );
    }
  };

  const handleUpdateMessage = (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => {
    setConversations(prev => prev.map(conversation => {
      if (conversation.id !== conversationId) return conversation;
      const messages = conversation.messages.map(message => message.id === messageId ? {...message,...updates,id:message.id} : message);
      const last = messages[messages.length-1];
      return {...conversation,messages,lastMessage:last?.text || (last ? '[消息]' : '暂无消息')};
    }));
  };

  const handleDeleteMessage = (conversationId: string, messageId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          const filtered = c.messages.filter((m) => m.id !== messageId);
          const lastMsg =
            filtered.length > 0
              ? filtered[filtered.length - 1].text || '[消息]'
              : '暂无消息';
          return {
            ...c,
            lastMessage: lastMsg,
            messages: filtered,
          };
        }
        return c;
      })
    );
  };

  const handleDeleteConversation = (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    showToast('已删除该会话 🗑️');
  };

  const handleToggleUnreadConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadCount: c.unreadCount > 0 ? 0 : 1,
          };
        }
        return c;
      })
    );
    showToast('已更新未读状态 💬');
  };

  const handleTogglePinConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            isPinned: !c.isPinned,
          };
        }
        return c;
      })
    );
  };

  const handleRefreshConversations = useCallback(async () => {
    // 模拟网络请求同步与刷新最新会话
    await new Promise((resolve) => setTimeout(resolve, 600));
    setConversations((prev) => {
      // 保持数据并刷新实例引用
      return [...prev];
    });
  }, []);

  const handleUpdateFriendRelationship = (friendId: string, relationship: FriendRelationship) => {
    setFriends((prev) =>
      prev.map((f) => {
        if (f.id === friendId) {
          const isClose = relationship === 'close';
          const isFamily = relationship === 'family';
          const isMuted = relationship === 'muted';
          const isHidden = relationship === 'hidden';
          return {
            ...f,
            relationship,
            isCloseFriend: isClose,
            isFamily,
            isMuted,
            isHidden,
          };
        }
        return f;
      })
    );
  };

  const [simulationIndex, setSimulationIndex] = useState(0);

  // Automatically clear unread count for active conversation
  useEffect(() => {
    if (activeChatId) {
      setConversations((prev) => {
        const hasUnread = prev.some((c) => c.id === activeChatId && c.unreadCount > 0);
        if (!hasUnread) return prev;
        return prev.map((c) => (c.id === activeChatId && c.unreadCount > 0 ? { ...c, unreadCount: 0 } : c));
      });
    }
  }, [activeChatId]);

  const handleSimulateCloseFriendMessage = () => {
    const simTexts = [
      '嗨，你看到我新发的星片动态了吗？✨',
      '中山桥这边的风好舒服啊，你快到了吗？🌉',
      '我发现了一家特别好喝的手冲咖啡店，等会带你去！☕',
      '今天的晚霞好美啊，一定要拍张照片记录下来！🌅',
      '哈哈，刚才那个段子太有意思了，分享给你！📱',
    ];
    const text = simTexts[simulationIndex % simTexts.length];
    setSimulationIndex((prev) => prev + 1);

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const newMsg: ChatMessage = {
      id: `sim-msg-${Date.now()}`,
      senderId: 'f1', // Xue Meng
      text: text,
      timestamp: timeStr,
      isMe: false,
      createdAt: now.getTime(),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.friendId === 'f1') {
          return {
            ...c,
            unreadCount: c.unreadCount + 1,
            lastMessage: text,
            time: timeStr,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    handleAddNotification('密友 薛梦', text, 'message');
    showToast('💬 密友 薛梦 给您发送了一条新消息！');
  };

  const handleCloseEmojiBombing = useCallback(() => {
    setCurrentBombing(null);
  }, []);

  const handleOpenChatWithFriend = useCallback((friendId: string, appearance?: MessageAppearance) => {
    setCanvasChatEntry(appearance ? { friendId, appearance, key: Date.now() } : null);
    setConversations((prev) => {
      const existing = prev.find((c) => c.friendId === friendId);
      if (existing) {
        setActiveChatId(existing.id);
        return prev;
      }
      const friendObj = friends.find((f) => f.id === friendId);
      const newConvId = `c-${Date.now()}`;
      const newConv: ChatConversation = {
        id: newConvId,
        friendId,
        friendName: friendObj?.name || '好友',
        avatar: friendObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        lastMessage: '开始聊天吧！',
        time: '刚刚',
        unreadCount: 0,
        messages: [],
      };
      setActiveChatId(newConvId);
      return [newConv, ...prev];
    });
    handleNavigateTab('chat');
  }, [friends]);

  const handleQuickChatWithFriend = (friendId: string, text: string, options?: { type: 'image'; imageUrl: string; povExpiresAt?: number }) => {
    let conv = conversations.find((c) => c.friendId === friendId);
    let convId = conv?.id;
    const friendObj = friends.find((f) => f.id === friendId);
    const friendName = friendObj?.name || conv?.friendName || '好友';
    const friendAvatar = friendObj?.avatar || conv?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';

    if (!conv) {
      convId = `c-${Date.now()}`;
      const newConv: ChatConversation = {
        id: convId,
        friendId,
        friendName,
        avatar: friendAvatar,
        lastMessage: text,
        time: '刚刚',
        unreadCount: 0,
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
    }

    // Send my message
    handleSendMessage(convId!, text, options);
    showToast(`已向 ${friendName} 发送快捷消息 💬`);
    handleAddNotification(`向 ${friendName} 发送消息`, `"${text}"`, 'message');

    if (options?.type === 'image') return;

    // Simulate friend's reply after 1.2s to trigger unread badge on bottom navigation bar's Chat icon
    setTimeout(() => {
      const replyTexts = [
        '收到你的快捷留言啦！我现在在附近呢 😊',
        '哈哈收到！等会儿见 👋',
        '看到了！刚刚在忙，马上来找你 ✨',
        '好呀好呀，我们地图上见 📍',
      ];
      const replyText = replyTexts[Math.floor(Math.random() * replyTexts.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const newMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        senderId: friendId,
        text: replyText,
        timestamp: timeStr,
        isMe: false,
        createdAt: now.getTime(),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.friendId === friendId || c.id === convId) {
            return {
              ...c,
              unreadCount: c.unreadCount + 1,
              lastMessage: replyText,
              time: timeStr,
              messages: [...c.messages, newMsg],
            };
          }
          return c;
        })
      );

      handleAddNotification(friendName, replyText, 'message');
      showToast(`💬 ${friendName}: ${replyText}`);
    }, 1200);
  };

  const handleOpenFriendProfile = (friendId: string) => {
    if (friendId === 'me' || friendId === CURRENT_USER_PROFILE.id || friendId === 'user-current') {
      setSelectedProfileFriend(CURRENT_USER_PROFILE);
      setIsProfileModalOpen(true);
      return;
    }
    let friend = friends.find((f) => f && (f.id === friendId || f.name?.includes(friendId)));
    if (!friend) {
      const conv = conversations.find(
        (c) => c && (c.friendId === friendId || c.id === friendId || c.friendName?.includes(friendId))
      );
      if (conv) {
        friend = {
          id: conv.friendId || friendId,
          name: conv.friendName,
          avatar: conv.avatar,
          status: '在线',
          isOnline: true,
          locationName: '未透露地址',
          distance: '附近',
          battery: 90,
          lat: 36.061,
          lng: 103.834,
          x: 50,
          y: 50,
          lastUpdated: '1分钟前',
        };
      } else {
        friend = {
          id: friendId,
          name: friendId,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
          status: '在线',
          isOnline: true,
          locationName: '兰州市城关区东方红广场',
          distance: '100m',
          battery: 88,
          lat: 36.061,
          lng: 103.834,
          x: 50,
          y: 50,
          lastUpdated: '1分钟前',
        };
      }
    }
    setSelectedProfileFriend(friend);
    setIsProfileModalOpen(true);
  };

  const handleCreateGroupConversation = (groupName: string, announcement: string, selectedFriendIds: string[]) => {
    const newChatId = `cg-${Date.now()}`;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const memberList = selectedFriendIds.map((id) => {
      const conv = conversations.find(c => c.friendId === id || c.id === id);
      return {
        id,
        name: conv?.friendName || '好友',
        avatar: conv?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        role: '成员' as const,
      };
    });

    const newGroupConv: ChatConversation = {
      id: newChatId,
      friendId: `group-${Date.now()}`,
      friendName: groupName,
      avatar: memberList[0]?.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400',
      lastMessage: '群聊已创建，开始聊天吧！',
      time: timeStr,
      unreadCount: 0,
      isGroup: true,
      groupAvatars: memberList.map(m => m.avatar),
      groupDetails: {
        description: announcement,
        announcement: announcement,
        tags: ['小组交流', '协作'],
        createdAt: '刚刚',
        adminName: '我',
        memberCount: memberList.length + 1,
        members: [
          { id: 'me', name: '我', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', role: '群主' },
          ...memberList
        ],
      },
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: 'system',
          text: `群聊 "${groupName}" 已创建成功，公告：${announcement}`,
          timestamp: timeStr,
          isMe: false,
          type: 'text'
        }
      ]
    };

    setConversations(prev => [newGroupConv, ...prev]);
    setActiveChatId(newChatId);
  };

  const handleAddPost = (
    content: string,
    location: string,
    images?: string[],
    privacy?: string,
    taggedFriends?: string[],
    postType?: 'moment' | 'star'
  ) => {
    let finalContent = content;
    if (taggedFriends && taggedFriends.length > 0) {
      finalContent += `\n\n📌 提醒看：${taggedFriends.map((f) => `@${f}`).join(' ')}`;
    }
    if (privacy && privacy !== '公开') {
      finalContent += ` [权限:${privacy}]`;
    }

    const isStar = postType === 'star';
    const newPost: DiscoverPost = {
      id: `p-${Date.now()}`,
      createdAt: Date.now(),
      authorName: 'Alexia Vance',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      location: location || '甘肃省兰州市城关区东方红广场',
      lat: 36.0620 + (Math.random() - 0.5) * 0.015,
      lng: 103.8080 + (Math.random() - 0.5) * 0.015,
      time: '刚刚',
      content: finalContent,
      image: images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800'],
      likes: 1,
      comments: 0,
      postType: isStar ? 'star' : 'moment',
      isStarCard: isStar,
    };
    setDiscoverPosts([newPost, ...discoverPosts]);
    showToast(isStar ? '星片发布成功！已自动关联至地图星片层与个人时间线 🌠' : '动态已成功发布至 Stellar 朋友圈 🌟');
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleAddNotification = (title: string, content: string, type: 'message' | 'like' | 'system' | 'radar') => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      content,
      time: '刚刚',
      type,
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const handleLikePost = (postId: string) => {
    setDiscoverPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const liked = p.likedByMe;
          return {
            ...p,
            likedByMe: !liked,
            likes: liked ? Math.max(0, p.likes - 1) : p.likes + 1,
          };
        }
        return p;
      })
    );
  };

  const handleAddCommentToPost = (postId: string, commentText: string) => {
    setDiscoverPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `c-${Date.now()}`,
            userName: 'RicardoZhan',
            userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
            content: commentText,
            time: '刚刚',
          };
          const existingList = p.commentsList || [];
          return {
            ...p,
            comments: (p.comments || 0) + 1,
            commentsList: [newComment, ...existingList],
          };
        }
        return p;
      })
    );
  };

  // 关系优先级计算：依次为 恋人 (1) > 家人 (2) > 密友 (3) > 好友 (4)
  const getSpeakingFriendPriority = useCallback((conv: ChatConversation, friendList: Friend[]): number => {
    const matchedFriend = friendList.find((f) => f.id === conv.friendId || f.name === conv.friendName);
    const rel = conv.relationship || matchedFriend?.relationship;
    const label = `${conv.relationshipLabel || ''} ${matchedFriend?.relationshipLabel || ''}`.toLowerCase();
    const name = `${conv.friendName || ''} ${matchedFriend?.name || ''}`.toLowerCase();

    // 1. 恋人
    if (rel === 'lover' || label.includes('恋人') || label.includes('情侣') || name.includes('恋人') || (conv as any).isLover) {
      return 1;
    }
    // 2. 家人
    if (rel === 'family' || label.includes('家人') || label.includes('亲人') || name.includes('父亲') || name.includes('母亲') || name.includes('爸') || name.includes('妈') || name.includes('家人') || (conv as any).isFamily) {
      return 2;
    }
    // 3. 密友 (包含教学体系中的助教/副领航员)
    if (rel === 'close' || conv.isCloseFriend || matchedFriend?.isCloseFriend || label.includes('密友') || label.includes('领航') || label.includes('助教')) {
      return 3;
    }
    // 4. 好友
    if (rel === 'friend' || !conv.isGroup) {
      return 4;
    }
    return 5;
  }, []);

  // 筛选出所有有未读发言的会话，并按关系亲密度（恋人 > 家人 > 密友 > 好友）及时间/未读数排序
  const unreadConversations = conversations.filter((c) => (c.unreadCount || 0) > 0);
  const sortedSpeakingChats = [...unreadConversations].sort((a, b) => {
    const pA = getSpeakingFriendPriority(a, friends);
    const pB = getSpeakingFriendPriority(b, friends);
    if (pA !== pB) return pA - pB;
    return (b.unreadCount || 0) - (a.unreadCount || 0);
  });

  const closestSpeakingChat = sortedSpeakingChats[0] || conversations.find((c) => (c.unreadCount || 0) > 0) || null;
  const closestSpeakingAvatar = closestSpeakingChat?.avatar;
  const closestSpeakingUnreadCount = closestSpeakingChat?.unreadCount || 0;
  const closestSpeakingMsgs = closestSpeakingChat && Array.isArray(closestSpeakingChat.messages)
    ? closestSpeakingChat.messages.filter((m) => !m.isMe).slice(-closestSpeakingUnreadCount)
    : [];
  const newestClosestMsg = closestSpeakingMsgs[closestSpeakingMsgs.length - 1] || 
    (closestSpeakingChat?.messages && closestSpeakingChat.messages.filter(m => !m.isMe).pop()) || 
    (closestSpeakingChat ? { id: 'last-msg', senderId: closestSpeakingChat.friendId, text: closestSpeakingChat.lastMessage, timestamp: closestSpeakingChat.time, isMe: false } : null);
  const olderClosestMsgs = closestSpeakingMsgs.slice(0, -1);
  const activeChatConversation = conversations.find((c) => c.id === activeChatId);

  // 快捷回复处理函数（支持预设快捷短语或自定义输入）
  const handleSendQuickReply = (textToSend?: string) => {
    const text = (textToSend || quickReplyText).trim();
    if (!text || !closestSpeakingChat) return;

    const newMsg: ChatMessage = {
      id: `msg-qr-${Date.now()}`,
      senderId: 'me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === closestSpeakingChat.id) {
          return {
            ...c,
            unreadCount: 0,
            lastMessage: text,
            time: newMsg.timestamp,
            messages: [...(c.messages || []), newMsg],
          };
        }
        return c;
      })
    );

    soundEffects.playTapSound();
    haptics.trigger('success');
    showToast(`已快捷回复「${closestSpeakingChat.friendName}」: ${text}`);
    setQuickReplyText('');
    setShowQuickReplyBar(false);
    setIsFriendAvatarAlertActive(false);
  };

  return (
    <IPhone17ProFrame
      userNote={userNote}
      attachedEmoji={attachedEmoji}
      currentTab={currentTab}
      immersive={isLoggedIn && !isCourseAppOpen && !isFamilyCareOpen && (currentTab === 'home' || (currentTab === 'chat' && Boolean(activeChatId)))}
      desktopCanvasContent={
        <CampusRolePreviewPanel
          isLoggedIn={isLoggedIn}
          currentActiveRole={activeCampusRoleId}
          isCourseAppOpen={isCourseAppOpen}
          onSelectRoleAndLogin={handleSelectCampusRole}
          onOpenCourseApp={handleOpenCourseAppWithRole}
          onCloseCourseApp={() => setIsCourseAppOpen(false)}
          onToggleLoginState={handleToggleLoginState}
          onNavigateModule={handleNavigateModule}
        />
      }
    >
      <div className={`stellar-app relative w-full h-full flex flex-col overflow-hidden theme-crossfade bg-white dark:bg-black text-[#050505] dark:text-white ${currentTab === 'home' && !isCourseAppOpen && !isFamilyCareOpen && isLoggedIn ? 'stellar-map-shell' : ''}`}>
        {!isLoggedIn ? (
          <LoginRoleScreen onSelectRoleAndLogin={handleSelectRoleAndLogin} />
        ) : (
          <>
            {/* Top Navigation Bar (Hidden on profile page, inside active chat detail, or inside a team group workspace) */}
        {((!(currentTab === 'chat' && activeChatId) && !(currentTab === 'teams' && selectedGroupWorkspaceId) && currentTab !== 'profile') || isFamilyCareOpen) && (
          <TopBar
            currentTab={isCourseAppOpen ? 'home' : currentTab}
            isCourseAppOpen={isCourseAppOpen}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onCloseCourseApp={() => setIsCourseAppOpen(false)}
            onOpenAddCourse={() => setAddCourseMenuTrigger((prev) => prev + 1)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenAdd={() => {
              const hasSeen = localStorage.getItem('stellar_has_seen_add_guide');
              if (!hasSeen && currentTab === 'home') {
                setIsFirstTimeAddGuideOpen(true);
                localStorage.setItem('stellar_has_seen_add_guide', 'true');
              } else {
                setIsAddMenuOpen((prev) => !prev);
              }
            }}
            onOpenNotifications={() => {
              setIsNotificationsOpen(true);
              handleMarkAllRead();
            }}
            onBack={handleGoBack}
            onOpenCalendar={() => {
              if (isCourseAppOpen) {
                setCourseAppRequestedTab('badges');
                setCalendarTrigger((prev) => prev + 1);
                showToast('📅 已弹出直角线条课表与教案卡片');
              } else if (currentTab === 'calendar') {
                handleGoBack();
              } else {
                handleNavigateTab('calendar');
              }
            }}
            onOpenTextCenter={() => setIsDocumentCenterOpen(true)}
            onOpenDocumentCenter={() => setIsDocumentCenterOpen(true)}
            isStealthMode={isStealthMode}
            onToggleStealth={() => {
              if (!isStealthMode) {
                // Open stealth mode selection bottom modal
                setIsStealthModalOpen(true);
              } else {
                // Disable: 0.3s pop-in restoration & open duration modal or turn off directly
                setIsStealthModalOpen(true);
              }
            }}
            unreadNotificationsCount={unreadNotificationsCount}
            isFamilyCareOpen={isFamilyCareOpen}
            onCloseFamilyCare={() => setIsFamilyCareOpen(false)}
            familyCareSafetyStatusText="有延迟提醒"
            familyCareSafetyStatus="warning"
            familyCareUnreadCount={2}
            familyTimeRange={familyTimeRange}
            onChangeFamilyTimeRange={setFamilyTimeRange}
            onOpenFamilyCareSettings={() => setIsFamilyManagementModalOpen(true)}
          />
        )}

        {/* Main View Container (occupies the full middle viewport area between TopBar and BottomNav) */}
        <main
          className="flex-1 min-h-0 relative w-full overflow-hidden"
        >
          {isCourseAppOpen ? (
            <CourseManagementApp
              onClose={() => {
                setIsCourseAppOpen(false);
                setAddCourseMenuTrigger(0);
                setCalendarTrigger(0);
              }}
              showToast={showToast}
              requestedTab={courseAppRequestedTab}
              initialRole={courseAppInitialRole}
              onRoleChange={(newRole) => {
                const matchingRole = CAMPUS_ROLES.find((r) => r.id === newRole || r.appRole === newRole);
                if (matchingRole) {
                  handleSelectCampusRole(matchingRole);
                } else {
                  setCourseAppInitialRole(newRole);
                  setActiveCampusRoleId(newRole);
                }
              }}
              calendarTrigger={calendarTrigger}
              addCourseMenuTrigger={addCourseMenuTrigger}
            />
          ) : (
            <AnimatePresence mode="popLayout" custom={tabSlideDirection} initial={false}>
              {currentTab === 'home' && (
                <motion.div
                  key="tab-home"
                  custom={tabSlideDirection}
                  initial={{ x: tabSlideDirection * 28, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -tabSlideDirection * 28, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full h-full"
                >
                  <MapView
                    friends={friends}
                    conversations={conversations}
                    liveLocationShares={isStealthMode ? EMPTY_LIVE_LOCATION_SHARES : liveLocationShares}
                    onRemoveLiveLocationShare={handleRemoveLiveLocationShare}
                    onAddLiveLocationShare={handleShareRealTimeLocation}
                    onSendMessage={handleSendMessage}
                    currentUserName={profileData.operatorName || 'Alexia Vance'}
                    publishedActivities={publishedActivities}
                    activityChanges={activityChanges}
                    onUpdateActivity={handleUpdateActivity}
                    onEditActivity={activity => handleEditActivity(activity)}
                    onRepeatActivity={activity => handleEditActivity(activity, true)}
                    onOpenActivityChat={handleOpenActivityChat}
                    isStealthMode={isStealthMode}
                    onToggleStealth={() => setIsStealthModalOpen(true)}
                    onOpenChatWith={handleOpenChatWithFriend}
                    userNote={userNote}
                    attachedEmoji={attachedEmoji}
                    noteTheme={noteTheme}
                    userAvatar={userAvatar}
                    onEditUserStatus={() => setIsNoteEditorOpen(true)}
                    onOpenFamilyCare={() => setIsFamilyCareOpen(true)}
                    onOpenTeams={() => handleNavigateTab('teams')}
                    onOpenDiscover={() => handleNavigateTab('discover')}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    explorationTrigger={explorationTrigger}
                    onAddFriend={() => setIsAddFriendModalOpen(true)}
                    onOpenFriendProfile={handleOpenFriendProfile}
                    trafficEnabled={trafficEnabled}
                    onToggleTraffic={() => setTrafficEnabled((prev) => !prev)}
                    mapStyle={mapStyle}
                    onChangeMapStyle={(style) => setMapStyle(style)}
                    activeMapFilter={activeMapFilter}
                    onChangeMapFilter={handleMapFilterChange}
                    discoverPosts={discoverPosts}
                    onLikePost={handleLikePost}
                    onAddCommentToPost={handleAddCommentToPost}
                    showToast={showToast}
                    onAddNotification={handleAddNotification}
                    triggerPlaceMarker={isTriggerPlaceMarker}
                    onResetTriggerPlaceMarker={() => setIsTriggerPlaceMarker(false)}
                    onUpdateFriendRelationship={handleUpdateFriendRelationship}
                    onQuickChatWith={handleQuickChatWithFriend}
                    schedules={schedules}
                    onSelectSchedule={handleSelectSchedule}
                    focusLocation={mapFocusTarget}
                    onLifePanelToggle={setIsLifeMapPanelOpen}
                    onUpdateSchedule={handleUpdateSchedule}
                    onOpenScheduleCreation={(loc, date) => {
                      setPinLocation(loc || null); setScheduleInitialDate(date || dateKey());
                      setIsScheduleCreationOpen(true);
                    }}
                    onOpenActivityCreation={(loc) => {
                      setPinLocation(loc || null); setActivityInitialDraft(undefined);
                      setIsActivityModalOpen(true);
                    }}
                    onOpenCreateStory={(loc) => {
                      if (loc) setPinLocation(loc);
                      setIsCreateStoryOpen(true);
                    }}
                    onPinRadialMenuToggle={setIsMapPinRadialMenuOpen}
                    onOpenCalendar={() => handleNavigateTab('calendar')}
                    selectedFriend={selectedMapFriend}
                    onSelectedFriendChange={setSelectedMapFriend}
                    selectedActivity={selectedMapActivity}
                    onSelectedActivityChange={setSelectedMapActivity}
                    isIntercomTransmitting={isMapIntercomTransmitting}
                    onIntercomTransmittingChange={setIsMapIntercomTransmitting}
                    onShareActivity={(act) => setSharingActivity(act)}
                    onShareLocation={(loc) => setSharingLocation(loc)}
                    onShareLifePlace={(place) => setSharingLifePlace(place)}
                  />
                </motion.div>
              )}
              {currentTab === 'chat' && (
                <motion.div
                  key="tab-chat"
                  custom={tabSlideDirection}
                  initial={{ x: tabSlideDirection * 28, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -tabSlideDirection * 28, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full h-full"
                >
                  <ChatView
                    isDarkMode={isDarkMode}
                    conversations={conversations}
                    friends={friends}
                    onSendMessage={handleSendMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onUpdateMessage={handleUpdateMessage}
                    onDeleteConversation={handleDeleteConversation}
                    onToggleUnreadConversation={handleToggleUnreadConversation}
                    onTogglePinConversation={handleTogglePinConversation}
                    onRefreshConversations={handleRefreshConversations}
                    activeChatId={activeChatId}
                    canvasEntry={canvasChatEntry}
                    onSelectChat={(id) => { setActiveChatId(id); if (id === null && selectedMapFriend) handleNavigateTab('home'); }}
                    onOpenFriendProfile={handleOpenFriendProfile}
                    onCreateGroupConversation={handleCreateGroupConversation}
                    onOpenManagementCenter={() => setShowManagementCenter(true)}
                    activities={publishedActivities}
                    onShareActivity={(act) => setSharingActivity(act)}
                    userNote={userNote}
                    attachedEmoji={attachedEmoji}
                    noteTheme={noteTheme as any}
                    onOpenNoteEditor={() => setIsNoteEditorOpen(true)}
                    onUpdateUserNote={(note, emoji, theme) => {
                      setUserNote(note);
                      setAttachedEmoji(emoji);
                      setNoteTheme(theme as any);
                    }}
                    onOpenTeams={() => {
                      setSelectedGroupWorkspaceId(null);
                      handleNavigateTab('teams');
                    }}
                    onOpenTeamWorkspace={(teamId) => {
                      setSelectedGroupWorkspaceId(teamId);
                      handleNavigateTab('teams');
                    }}
                    familyGroup={familyGroup}
                    onOpenFamilyModal={() => setIsCreateFamilyPageOpen(true)}
                    onOpenFamilyCare={() => setIsFamilyCareOpen(true)}
                    onShareRealTimeLocation={handleShareRealTimeLocation}
                    onNavigateToMapLocation={handleNavigateToMapLocation}
                    onOpenActivityOnMap={handleOpenActivityOnMap}
                    userAlbums={userAlbums}
                    setUserAlbums={setUserAlbums}
                    userFolders={userFolders}
                    setUserFolders={setUserFolders}
                    onOpenDocumentCenter={() => setIsDocumentCenterOpen(true)}
                    skills={skills}
                    onOpenCourseApp={() => {
                      setCourseAppRequestedTab('attendance');
                      setAddCourseMenuTrigger(0);
                      setCalendarTrigger(0);
                      setIsCourseAppOpen(true);
                    }}
                    onOpenStellarTab={() => handleNavigateTab('stellar')}
                    onOpenCalendar={() => handleNavigateTab('calendar')}
                    onToggleSkillInstall={handleToggleSkillInstall}
                    onToggleSkillEnable={handleToggleSkillEnable}
                  />
                </motion.div>
              )}
              {currentTab === 'teams' && (
                <motion.div
                  key="tab-teams"
                  custom={tabSlideDirection}
                  initial={{ x: tabSlideDirection * 28, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -tabSlideDirection * 28, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full h-full"
                >
                  <TeamsView
                    onOpenMenu={() => setIsSettingsOpen(true)}
                    showToast={showToast}
                    selectedTeamId={selectedGroupWorkspaceId}
                    onSelectTeamId={setSelectedGroupWorkspaceId}
                    onGoHome={() => {
                      handleNavigateTab('home');
                      setSelectedGroupWorkspaceId(null);
                    }}
                    onOpenStellarWorkspace={() => setIsStellarWorkspaceOpen(true)}
                  />
                </motion.div>
              )}
              {currentTab === 'discover' && (
                <motion.div
                  key="tab-discover"
                  custom={tabSlideDirection}
                  initial={{ x: tabSlideDirection * 28, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -tabSlideDirection * 28, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full h-full"
                >
                  <DiscoverView
                    isDarkMode={isDarkMode}
                    posts={discoverPosts}
                    publishedActivities={publishedActivities}
                    onLikePost={handleLikePost}
                    onOpenFriendProfile={handleOpenFriendProfile}
                    familyGroup={familyGroup}
                    onOpenFamilyModal={() => setIsCreateFamilyPageOpen(true)}
                    onOpenFamilyCare={() => setIsFamilyCareOpen(true)}
                    onSaveFamilyGroup={(data) => {
                      setFamilyGroup(data);
                      showToast('家庭小组已更新 🎉');
                    }}
                    onRemoveFamilyGroup={() => {
                      setFamilyGroup(null);
                      showToast('家庭小组已重置');
                    }}
                    onShowToast={showToast}
                    onOpenPlanetUniverse={() => {
                      handleNavigateTab('stellar');
                      setStellarTargetUnboxId('planet-cyber-01');
                      showToast('🚀 已进入 Stellar 并定位高能盲盒星球【BOX-CYBER-01】');
                    }}
                    skills={skills}
                    onPracticeSkillExp={handlePracticeSkillExp}
                    onToggleSkillEnable={handleToggleSkillEnable}
                    onOpenStellarTab={() => handleNavigateTab('stellar')}
                    onOpenCourseApp={() => {
                      setCourseAppRequestedTab('attendance');
                      setAddCourseMenuTrigger(0);
                      setCalendarTrigger(0);
                      setIsCourseAppOpen(true);
                    }}
                  />
                </motion.div>
              )}
              {currentTab === 'stellar' && (
                <motion.div
                  key="tab-stellar"
                  custom={tabSlideDirection}
                  initial={{ x: tabSlideDirection * 28, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -tabSlideDirection * 28, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full h-full"
                >
                  <StellarView
                    isDarkMode={isDarkMode}
                    onBack={handleGoBack}
                    friends={friends}
                    planets={planets}
                    familyGroup={familyGroup}
                    onOpenFamilyCare={() => setIsFamilyCareOpen(true)}
                    onOpenFamilyModal={() => setIsCreateFamilyPageOpen(true)}
                    onUpdatePlanet={(updated) => {
                      setPlanets((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                    }}
                    showToast={showToast}
                    onNavigateToMapLocation={handleNavigateToMapLocation}
                    initialUnboxingPlanetId={stellarTargetUnboxId}
                    onClearTargetUnboxId={() => setStellarTargetUnboxId(null)}
                    skills={skills}
                    onToggleSkillInstall={handleToggleSkillInstall}
                    onToggleSkillEnable={handleToggleSkillEnable}
                    onStarSkill={handleStarSkill}
                    onPracticeSkillExp={handlePracticeSkillExp}
                    onEquipAllCoreSkills={handleEquipAllCoreSkills}
                    onOpenCourseApp={() => {
                      setCourseAppRequestedTab('attendance');
                      setAddCourseMenuTrigger(0);
                      setCalendarTrigger(0);
                      setIsCourseAppOpen(true);
                    }}
                  />
                </motion.div>
              )}
              {currentTab === 'profile' && (
                <motion.div
                  key="tab-profile"
                  custom={tabSlideDirection}
                  initial={{ x: tabSlideDirection * 28, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -tabSlideDirection * 28, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full h-full"
                >
                  <ProfileView
                    profileData={profileData}
                    setProfileData={setProfileData}
                    userNote={userNote}
                    attachedEmoji={attachedEmoji}
                    noteTheme={noteTheme}
                    userAvatar={userAvatar}
                    discoverPosts={discoverPosts}
                    onLikePost={handleLikePost}
                    onAddCommentToPost={handleAddCommentToPost}
                    onOpenNoteEditor={() => setIsNoteEditorOpen(true)}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onOpenSearch={() => setIsSearchOpen(true)}
                    onOpenAddPost={() => setIsAddOpen(true)}
                    onOpenDocumentAssets={() => setIsDocumentCenterOpen(true)}
                    onBack={handleGoBack}
                    showToast={showToast}
                  />
                </motion.div>
              )}
              {currentTab === 'calendar' && (
                <motion.div
                  key="tab-calendar"
                  custom={tabSlideDirection}
                  initial={{ x: tabSlideDirection * 28, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -tabSlideDirection * 28, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full h-full"
                >
                  <CalendarView
                    onBack={handleGoBack}
                    publishedActivities={publishedActivities}
                    schedules={schedules}
                    onSelectSchedule={handleSelectSchedule}
                    focusDate={calendarFocusDate}
                    onOpenScheduleCreation={(date) => { setPinLocation(null); setScheduleInitialDate(date || dateKey()); setIsScheduleCreationOpen(true); }}
                    onNavigateToLocation={(name,lat,lng,scheduleId) => { if (typeof lat === 'number' && typeof lng === 'number') handleNavigateToMapLocation({lat,lng,name,scheduleId}); }}
                    onAddNotification={(newNotif) => {
                      setNotifications((prev) => [newNotif, ...prev]);
                    }}
                    showToast={showToast}
                    onShareActivity={(act) => setSharingActivity(act)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>

        {/* Backdrop for outside-click dismiss ("点击屏幕其他地方视为退出") */}
        {currentTab === 'home' && isFriendAvatarAlertActive && closestSpeakingChat && closestSpeakingUnreadCount > 0 && !isMapPinRadialMenuOpen && !isLifeMapPanelOpen && !selectedMapFriend && !isScheduleCreationOpen && !isScheduleDetailOpen && !isActivityModalOpen && (
          <div
            className="fixed inset-0 z-[180] bg-black/5 dark:bg-black/20 pointer-events-auto transition-opacity"
            onClick={() => {
              setIsFriendAvatarAlertActive(false);
              setShowQuickReplyBar(false);
              showToast('已关闭消息气泡并恢复聊天图标');
            }}
          />
        )}

        {/* Closest Speaking Friend Single Bubble Popup (发言气泡上移，遮挡好朋友列表，下沿不和导航栏连接) */}
        {currentTab === 'home' && isFriendAvatarAlertActive && closestSpeakingChat && closestSpeakingUnreadCount > 0 && !isMapPinRadialMenuOpen && !isLifeMapPanelOpen && !selectedMapFriend && !isScheduleCreationOpen && !isScheduleDetailOpen && !isActivityModalOpen && (
          <div
            className={`absolute bottom-[calc(76px+var(--sab,0px))] left-1/2 -translate-x-1/2 ${closestSpeakingUnreadCount > 0 ? 'z-[200]' : 'z-[100]'} w-[290px] max-w-[calc(100%-20px)] pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200 select-none gpu-layer will-change-transform`}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
              e.preventDefault();
              if (isMapMoving) return;
              setShowBubbleMenu(true);
            }}
          >
            {/* Particle Dissipation Animation Overlay */}
            {isDissipating && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-[210]">
                <div className="flex space-x-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={`dissipate-particle-${i}`}
                      className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-particle-dissipate"
                      style={{ animationDelay: `${i * 40}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Reply Interactive Card (点击气泡可以快速回复，具有清晰的线条边框) */}
            <AnimatePresence>
              {showQuickReplyBar && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.16 }}
                  className="mb-2.5 w-full bg-white dark:bg-zinc-900 rounded-xl border-2 border-[#1877F2] shadow-2xl p-3 flex flex-col gap-2.5 z-[220]"
                >
                  <div className="flex items-center justify-between border-b border-[#E4E6EB] dark:border-zinc-800 pb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img
                        src={closestSpeakingChat.avatar}
                        alt={closestSpeakingChat.friendName}
                        className="w-5 h-5 rounded-full object-cover border border-[#1877F2] shrink-0"
                      />
                      <span className="text-[12px] font-bold text-[#050505] dark:text-white truncate">
                        快捷回复 · {closestSpeakingChat.friendName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuickReplyBar(false)}
                      className="text-gray-400 hover:text-black dark:hover:text-white p-0.5 rounded-full cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Preset Quick Reply Chips with explicit line borders */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '收到！马上查看',
                      '好的老师，辛苦了',
                      '名单已核对完毕',
                      '稍后回复您',
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSendQuickReply(chip)}
                        className="text-[11px] bg-blue-50/80 dark:bg-blue-950/40 hover:bg-[#1877F2] hover:text-white text-[#1877F2] dark:text-blue-300 px-2.5 py-1 rounded-md border border-[#1877F2]/40 hover:border-[#1877F2] transition-colors cursor-pointer font-medium shadow-2xs"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Input form with line frame */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendQuickReply();
                    }}
                    className="flex items-center gap-1.5 pt-0.5"
                  >
                    <input
                      type="text"
                      value={quickReplyText}
                      onChange={(e) => setQuickReplyText(e.target.value)}
                      placeholder={`回复 ${closestSpeakingChat.friendName}...`}
                      className="flex-1 bg-[#F0F2F5] dark:bg-zinc-800 text-[12px] px-3 py-1.5 rounded-lg outline-none border border-[#CCD0D5] focus:border-[#1877F2] text-[#050505] dark:text-white placeholder:text-gray-400 transition-colors"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!quickReplyText.trim()}
                      className="w-8 h-8 rounded-lg bg-[#1877F2] disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:bg-blue-600 transition-colors"
                    >
                      <Send size={13} />
                    </button>
                  </form>

                  {/* Direct Jump to Full Conversation Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveChatId(closestSpeakingChat.id);
                      setConversations((prev) =>
                        prev.map((c) => (c.id === closestSpeakingChat.id ? { ...c, unreadCount: 0 } : c))
                      );
                      setIsFriendAvatarAlertActive(false);
                      setShowQuickReplyBar(false);
                      handleNavigateTab('chat');
                    }}
                    className="w-full text-center text-[11px] text-[#1877F2] font-bold hover:underline pt-0.5 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>进入完整聊天界面</span>
                    <span>›</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Long-press Action Menu Modal */}
            {showBubbleMenu && (
              <div className="absolute -top-44 left-0 right-0 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E4E6EB] p-2 z-[220] animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[11px] font-bold text-[#65676B] px-2 py-1 border-b border-[#E4E6EB] mb-1 flex justify-between items-center">
                  <span className="flex items-center space-x-1">
                    <span>消息快捷操作</span>
                    {isStarredCloseFriend && <span className="text-[10px] text-amber-500 font-bold">★ 星标</span>}
                  </span>
                  <button onClick={(ev) => { ev.stopPropagation(); setShowBubbleMenu(false); }} className="text-gray-400 hover:text-black">✕</button>
                </div>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setIsDissipating(true);
                    setTimeout(() => {
                      setConversations((prev) =>
                        prev.map((c) => (c.id === closestSpeakingChat.id ? { ...c, unreadCount: 0 } : c))
                      );
                      setShowBubbleMenu(false);
                      setIsDissipating(false);
                      setIsFriendAvatarAlertActive(false);
                      showToast('已将该好友消息标为已读 ✓');
                    }, 400);
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] font-medium text-[#050505] hover:bg-blue-50 hover:text-[#1877F2] rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <span>📌</span>
                  <span>标记为已读</span>
                </button>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setIsDissipating(true);
                    setTimeout(() => {
                      setConversations((prev) =>
                        prev.map((c) => (c.id === closestSpeakingChat.id ? { ...c, unreadCount: 0, messages: [] } : c))
                      );
                      setShowBubbleMenu(false);
                      setIsDissipating(false);
                      setIsFriendAvatarAlertActive(false);
                      showToast('已清空消息提醒 🗑️');
                    }, 400);
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <span>🗑️</span>
                  <span>清除消息提醒</span>
                </button>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    const nextStarred = !isStarredCloseFriend;
                    setIsStarredCloseFriend(nextStarred);
                    setShowBubbleMenu(false);
                    showToast(nextStarred ? '⭐ 已将好友设为星标好友，置顶推送已开启！' : '☆ 已取消星标好友');
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] font-medium text-[#050505] hover:bg-blue-50 hover:text-[#1877F2] rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <span>⭐</span>
                  <span>{isStarredCloseFriend ? '取消星标好友' : '设置为星标好友'}</span>
                </button>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setShowBubbleMenu(false);
                    showToast('已对该好友开启免打扰 🔕');
                  }}
                  className="w-full text-left px-3 py-2 text-[12px] font-medium text-[#050505] hover:bg-blue-50 hover:text-[#1877F2] rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <span>🔕</span>
                  <span>开启免打扰</span>
                </button>
              </div>
            )}

            {newestClosestMsg && closestSpeakingChat && (
              <div className="flex flex-col gap-1.5 items-center relative">
                <div
                  onClick={() => {
                    // 点击气泡展开快捷回复
                    setShowQuickReplyBar((prev) => !prev);
                  }}
                  className="w-full bg-[#1877F2] rounded-2xl px-4 py-4 min-h-[112px] flex flex-col justify-between hover:brightness-105 transition-all duration-200 cursor-pointer text-left select-none group relative border-2 border-white/60 dark:border-blue-400/80 animate-unified-breathe gpu-layer will-change-transform-opacity shadow-xl"
                >
                  {/* Top-Right Exit/Close Button Icon (右上角显示退出按钮图标，点击气泡消失) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDissipating(true);
                      setTimeout(() => {
                        setIsFriendAvatarAlertActive(false);
                        setShowQuickReplyBar(false);
                        setIsDissipating(false);
                        if (showToast) showToast('已取消提醒并恢复聊天图标');
                      }, 180);
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black/70 hover:bg-black/90 active:scale-90 text-white flex items-center justify-center border border-white/80 cursor-pointer z-30 transition-transform hover:scale-110 shadow-sm"
                    title="关闭气泡"
                    aria-label="关闭气泡"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>

                  {/* Message content and timestamp */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[12.5px] text-white font-medium leading-relaxed tracking-normal">
                      {newestClosestMsg.text || '[媒体内容]'}
                    </p>
                    <div className="flex justify-between items-center mt-0.5">
                      {/* 快捷回复发言线条边框按钮 */}
                      <span className="inline-flex items-center gap-1 text-[10px] text-white bg-white/20 hover:bg-white/30 border border-white/60 px-2 py-0.5 rounded-full font-medium shadow-2xs transition-colors">
                        <span>点击快捷回复</span>
                        <span className="text-[11px]">💬</span>
                      </span>
                      <span className="text-[10px] text-blue-100 font-medium">
                        {newestClosestMsg.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Previous / Older messages inside the same bubble */}
                  {olderClosestMsgs.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-white/25 border-dashed flex flex-col gap-1 max-h-20 overflow-y-auto pr-0.5">
                      {olderClosestMsgs.map((oldMsg, idx) => (
                        <div key={oldMsg.id ? `old-msg-${oldMsg.id}-${idx}` : `old-msg-idx-${idx}`} className="text-[10px] text-blue-50 leading-tight bg-black/15 p-1.5 rounded-xl border border-white/15">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[8px] font-bold text-blue-200">历史消息</span>
                            <span className="text-[7.5px] text-blue-200/80">{oldMsg.timestamp}</span>
                          </div>
                          <p className="line-clamp-2">{oldMsg.text || '[媒体内容]'}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom subtle bubble accent (下沿保持独立悬浮，不与导航栏相连) */}
                  <div className="absolute -bottom-1.5 left-8 w-3 h-3 rounded-full bg-[#1877F2] border border-white/60 shadow-xs pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Navigation Bar (Hidden when inside active chat detail, in a team group view, Family Care Monitor is open, University Course Management is open, custom map pin menu is active, or friend interactive modal is open) */}
        {!(currentTab === 'chat' && activeChatId) && !(currentTab === 'teams' && selectedGroupWorkspaceId) && !isFamilyCareOpen && !isCourseAppOpen && !isMapPinRadialMenuOpen && !selectedMapFriend && (
          <BottomNav
            currentTab={['home', 'chat', 'discover', 'stellar', 'profile'].includes(currentTab) ? currentTab as any : 'home'}
            onChangeTab={(tab) => {
              setIsCourseAppOpen(false);
              setIsFamilyCareOpen(false); // Close family care view when user navigates using tabs!
              setActiveChatId(null);
              setSelectedGroupWorkspaceId(null);
              setSelectedMapFriend(null); // 点击其他操作视为退出操作盘
              // 其他操作时取消好友头像和信息气泡，恢复到聊天图标
              setIsFriendAvatarAlertActive(false);
              setShowQuickReplyBar(false);
              handleNavigateTab(tab);
              console.log(`切换到 [${tab}]`);
            }}
            onChatAvatarClick={() => {
              // 点击头像进入聊天界面
              if (closestSpeakingChat) {
                setActiveChatId(closestSpeakingChat.id);
                setConversations((prev) =>
                  prev.map((c) => (c.id === closestSpeakingChat.id ? { ...c, unreadCount: 0 } : c))
                );
                showToast(`已进入与 ${closestSpeakingChat.friendName} 的聊天界面 💬`);
              }
              setIsFriendAvatarAlertActive(false);
              setShowQuickReplyBar(false);
              handleNavigateTab('chat');
            }}
            unreadChatsCount={unreadChatsCount}
            closeFriendAvatar={isFriendAvatarAlertActive ? closestSpeakingAvatar : undefined}
            closeFriendUnreadCount={isFriendAvatarAlertActive ? closestSpeakingUnreadCount : 0}
            isIntercomMode={Boolean(selectedMapFriend && currentTab === 'home')}
            intercomFriendName={selectedMapFriend?.name}
            isIntercomTransmitting={isMapIntercomTransmitting}
            onIntercomStart={() => {
              setIsMapIntercomTransmitting(true);
              soundEffects.playWalkieTalkieStart();
              haptics.trigger('heavy');
            }}
            onIntercomStop={() => {
              setIsMapIntercomTransmitting(false);
              soundEffects.playWalkieTalkieEnd();
              haptics.trigger('success');
              if (selectedMapFriend) {
                showToast(`🎙️ 实时对讲已发送给【${selectedMapFriend.name}】，好友已实时听到 🔊`);
                handleAddNotification(
                  `向 ${selectedMapFriend.name} 发送了实时对讲`,
                  `【${selectedMapFriend.name}】已实时收听您的对讲语音。`,
                  'message'
                );
              }
            }}
            onIntercomExit={() => {
              setSelectedMapFriend(null);
            }}
          />
        )}

        {/* Modals & Overlays */}
        <SettingsDrawer
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profileData={profileData}
          setProfileData={setProfileData}
          userAvatar={userAvatar}
          onUpdateAvatar={(newAvatar) => setUserAvatar(newAvatar)}
          onSelectTab={(tab) => {
            handleNavigateTab(tab);
            if (tab !== 'chat') setActiveChatId(null);
          }}
          onLogout={() => setIsLoggedIn(false)}
          onSimulateCloseFriendMessage={handleSimulateCloseFriendMessage}
          trafficEnabled={trafficEnabled}
          onToggleTraffic={() => setTrafficEnabled((prev) => !prev)}
          mapStyle={mapStyle}
          onChangeMapStyle={(style) => {
            setMapStyle(style);
            if (style === 'dark') {
              setIsDarkMode(true);
            } else if (style === 'standard') {
              setIsDarkMode(false);
            }
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          isStealthMode={isStealthMode}
          onToggleStealth={() => setIsStealthModalOpen(true)}
          activeMapFilter={activeMapFilter}
          onSelectMapFilter={handleMapFilterChange}
          showToast={showToast}
          onOpenDocumentCenter={() => {
            setIsSettingsOpen(false);
            setIsDocumentCenterOpen(true);
          }}
          onOpenStellarWorkspace={() => {
            setIsSettingsOpen(false);
            setIsStellarWorkspaceOpen(true);
          }}
          onOpenNoteEditor={() => {
            setIsSettingsOpen(false);
            setIsNoteEditorOpen(true);
          }}
          onOpenChatManagement={() => {
            setIsSettingsOpen(false);
            setShowManagementCenter(true);
          }}
          onOpenFamilyGroup={() => {
            setIsSettingsOpen(false);
            setIsFamilyModalOpen(true);
          }}
          onOpenFamilyCare={() => {
            setIsSettingsOpen(false);
            setIsFamilyCareOpen(true);
          }}
          onOpenSearch={() => {
            setIsSettingsOpen(false);
            setIsSearchOpen(true);
          }}
          onOpenAddModal={() => {
            setIsSettingsOpen(false);
            setIsAddOpen(true);
          }}
          onOpenNotifications={() => {
            setIsSettingsOpen(false);
            setIsNotificationsOpen(true);
          }}
          onOpenCalendar={() => {
            setIsSettingsOpen(false);
            handleNavigateTab('calendar');
          }}
          onOpenExploration={() => {
            handleNavigateTab('home');
            setExplorationTrigger((value) => value + 1);
          }}
          unreadNotificationsCount={unreadNotificationsCount}
        />

        <NotificationModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
        />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          friends={friends}
          onSelectFriend={(friend) => {
            handleNavigateTab('home');
            setIsSearchOpen(false);
            showToast(`📍 已在地图上跳转并锁定「${friend.name}」的位置 (${friend.locationName || '实时坐标'})`);
          }}
        />

        <CreatePostModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAddPost={handleAddPost}
          showToast={showToast}
        />

        <ActivityCreationModal
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          showToast={showToast}
          initialLocation={pinLocation || undefined}
          initialActivity={activityInitialDraft}
          friends={[...friends.filter(friend => !friend.isMe && friend.id !== 'me'), { ...CURRENT_USER_PROFILE, name: profileData.operatorName || CURRENT_USER_PROFILE.name, avatar: userAvatar }]}
          onSuccessPublish={(activityData) => {
            // 1. Save activity to publishedActivities state for hot slices & feed display
            const finalizedActivity: ActivityCreationUiState = {
              ...activityData,
              id: activityData.id || `act-user-${Date.now()}`,
              lat: activityData.venueLocation?.lat ?? activityData.lat,
              lng: activityData.venueLocation?.lng ?? activityData.lng,
            };
            const existing = activityChanges[finalizedActivity.id!] || selectedMapActivity?.id === finalizedActivity.id && selectedMapActivity;
            const converted = convertPublishedActivity(finalizedActivity, [...friends, { ...CURRENT_USER_PROFILE, name: profileData.operatorName || CURRENT_USER_PROFILE.name, avatar: userAvatar }]);
            const mapActivity = existing ? { ...existing, ...converted,
              status: existing.status, activityState: existing.activityState, needs: existing.needs, moments: existing.moments, updates: existing.updates,
              isReminderSet: existing.isReminderSet, reminderMinutes: existing.reminderMinutes,
              ...(finalizedActivity.visibility === activityInitialDraft?.visibility ? { privacyLevel: existing.privacyLevel, visibleFriendIds: existing.visibleFriendIds } : {}),
              participants: [...converted.participants.map(member => ({ ...member, ...existing.participants.find(previous => previous.id === member.id), activityRole: member.activityRole })), ...existing.participants.filter(member => member.invitationStatus !== 'invited' && !converted.participants.some(next => next.id === member.id))],
            } : converted;
            setPublishedActivities((prev) => [finalizedActivity, ...prev.filter(item => item.id !== finalizedActivity.id)]);
            handleUpdateActivity(mapActivity); setActivityInitialDraft(undefined);

            // 2. Synchronize to schedules for Calendar & Map Schedules Layer
            const rawStart = finalizedActivity.startTime;
            const rawEnd = finalizedActivity.endTime;
            const datePart = rawStart.split(/[ T]/)[0];
            const startPart = rawStart.includes(' ') ? rawStart.split(' ')[1] : (rawStart.includes('T') ? rawStart.split('T')[1] : rawStart);
            const endPart = rawEnd.includes(' ') ? rawEnd.split(' ')[1] : (rawEnd.includes('T') ? rawEnd.split('T')[1] : rawEnd);

            const actIcon =
              finalizedActivity.subType === 'CYCLING' ? '🚴‍♂️' :
              finalizedActivity.subType === 'RUNNING' ? '🏃‍♂️' :
              finalizedActivity.subType === 'RV_CAMPING' ? '⛺️' :
              finalizedActivity.subType === 'HIKING' || finalizedActivity.subType === 'FAMILY_HIKE' ? '⛰️' :
              finalizedActivity.subType === 'SKIING' ? '⛷️' :
              finalizedActivity.subType === 'FOODIE' ? '🍜' :
              finalizedActivity.subType === 'MUSIC_FEST' || finalizedActivity.subType === 'KTV' ? '🎵' :
              finalizedActivity.subType === 'BALL_GAMES' ? '🏀' :
              finalizedActivity.subType === 'PHOTOGRAPHY' ? '📷' : '🎉';

            const newSchedule: Schedule = {
              id: `sched-act-${finalizedActivity.id}`,
              type: 'custom',
              title: `【活动】${finalizedActivity.title}`,
              description: finalizedActivity.description || '由 Alexia 发起的精彩同城活动',
              note: `招募人数: ${finalizedActivity.minParticipants}-${finalizedActivity.maxParticipants}人 · 费用类型: ${finalizedActivity.feeType}${finalizedActivity.fixedFee ? ` (¥${finalizedActivity.fixedFee})` : ''}`,
              icon: actIcon,
              color: '#1877F2',
              startDate: datePart,
              startTime: startPart,
              endTime: endPart,
              startAt: rawStart,
              endAt: rawEnd,
              allDay: false,
              timezone: 'Asia/Shanghai',
              location: {
                name: finalizedActivity.originLocation!.name,
                address: finalizedActivity.originLocation!.address || finalizedActivity.originLocation!.name,
                latitude: finalizedActivity.originLocation!.lat,
                longitude: finalizedActivity.originLocation!.lng,
              },
              destination: finalizedActivity.venueLocation ? { name: finalizedActivity.venueLocation.name, address: finalizedActivity.venueLocation.address, latitude: finalizedActivity.venueLocation.lat, longitude: finalizedActivity.venueLocation.lng } : undefined,
              reminders: [mapActivity.reminderMinutes ?? 30],
              reminder: { enabled: mapActivity.isReminderSet !== false && !mapActivity.endedAt, advanceMinutes: mapActivity.reminderMinutes ?? 30 },
              mapVisibleAt: 'always',
              keepAsHistory: true,
              visibilityRule: {
                scope: 'specified',
                showDepartureTime: true,
                showCurrentLocation: true,
              },
              status: mapActivity.endedAt ? 'completed' : 'active',
              createdAt: schedules.find(item => item.id === `sched-act-${finalizedActivity.id}`)?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setSchedules((prev) => [withEstimatedTravelPlan(newSchedule,USER_LOCATION), ...prev.filter(item => item.id !== newSchedule.id)]);

            // 3. When an activity is published, create a new discover post
            const newPost: DiscoverPost = {
              id: `act-post-${finalizedActivity.id}`,
              authorName: profileData.operatorName || CURRENT_USER_PROFILE.name,
              authorAvatar: userAvatar,
              location: finalizedActivity.venueLocation!.name,
              time: '刚刚',
              content: `【发起活动】${finalizedActivity.title}\n⏰ 时间：${finalizedActivity.startTime}\n📍 集合地点：${finalizedActivity.startPoint}\n🏁 活动地点：${finalizedActivity.venueLocation?.name || finalizedActivity.endPoint}\n🎯 目标招募：${finalizedActivity.minParticipants}-${finalizedActivity.maxParticipants}人 (${finalizedActivity.feeType})\n📝 计划：${finalizedActivity.description || '快来加入同城社群！'}`,
              image: finalizedActivity.coverImageUrl || undefined,
              likes: 1,
              comments: 0,
            };
            setDiscoverPosts((prev) => [newPost, ...prev.filter(item => item.id !== newPost.id)]);

            // 4. Return to home map view to see the freshly published activity pin
            handleNavigateTab('home'); setActiveMapFilter(['activities']); setSelectedMapActivity(mapActivity);
            showToast(`🚀 活动 "${finalizedActivity.title}" 已成功发布！已在地图上生成活动图标，并同步至日历日程！`);
          }}
        />

        <AddPopupMenu
          isOpen={isAddMenuOpen}
          currentTab={currentTab}
          onClose={() => setIsAddMenuOpen(false)}
          onOpenGuide={() => setIsFirstTimeAddGuideOpen(true)}
          onSelectAction={(action) => {
            if (action === 'create-group') {
              handleNavigateTab('teams');
              showToast('👥 已进入小组管理中心，可直接添加与管理小组');
            } else if (action === 'create-schedule') {
              setIsScheduleCreationOpen(true);
            } else if (action === 'create-activity') {
              setPinLocation(null); setActivityInitialDraft(undefined); setIsActivityModalOpen(true);
            } else if (action === 'create-snapshot') {
              setIsCreateStoryOpen(true);
            } else if (action === 'create-map-anchor') {
              handleNavigateTab('home');
              setActiveChatId(null);
              setIsTriggerPlaceMarker(true);
              showToast('📍 已进入地图中心选点与锚点标记状态');
            } else if (action === 'add-friend') {
              setIsAddFriendModalOpen(true);
            } else if (action === 'create-note') {
              setIsImmersiveAddNoteOpen(true);
            } else if (action === 'publish-post') {
              setIsAddOpen(true);
            } else if (action === 'explore-planets') {
              handleNavigateTab('stellar');
              showToast('🌌 已导航至星球探索页面');
            }
          }}
        />

        {/* 首次使用 / 功能提示页面：点击右上角加号提示 4 大圆形核心创作 */}
        <FirstTimeAddGuideModal
          isOpen={isFirstTimeAddGuideOpen}
          onClose={() => setIsFirstTimeAddGuideOpen(false)}
          onSelectAction={(action: GuideActionType) => {
            setIsFirstTimeAddGuideOpen(false);
            if (action === 'create-schedule') {
              setIsScheduleCreationOpen(true);
            } else if (action === 'create-activity') {
              setPinLocation(null); setActivityInitialDraft(undefined); setIsActivityModalOpen(true);
            } else if (action === 'create-snapshot') {
              setIsCreateStoryOpen(true);
            } else if (action === 'create-map-anchor') {
              handleNavigateTab('home');
              setActiveChatId(null);
              setIsTriggerPlaceMarker(true);
              showToast('📍 已进入地图中心选点与锚点标记状态');
            }
          }}
        />

        <AddFriendModal
          isOpen={isAddFriendModalOpen}
          onClose={() => setIsAddFriendModalOpen(false)}
          showToast={showToast}
          onAddNotification={(title, content, type) => {
            handleAddNotification(title, content, type);
          }}
        />

        <FriendProfileModal
          isOpen={isProfileModalOpen}
          friend={selectedProfileFriend}
          onClose={() => setIsProfileModalOpen(false)}
          onSendMessage={(friendId) => handleOpenChatWithFriend(friendId)}
        />

        <UserNoteModal
          isOpen={isNoteEditorOpen}
          onClose={() => setIsNoteEditorOpen(false)}
          userNote={userNote}
          attachedEmoji={attachedEmoji}
          noteTheme={noteTheme}
          userAvatar={userAvatar}
          onUpdateUserNote={(note, emoji, theme, avatar) => {
            setUserNote(note);
            setAttachedEmoji(emoji);
            setNoteTheme(theme as any);
            if (avatar) setUserAvatar(avatar);
            setProfileData((prev) => ({
              ...prev,
              signature: note,
            }));
            showToast('状态便签与气泡配色已更新 🎉');
          }}
          onOpenCreateSticker={() => {
            setIsNoteEditorOpen(false);
            handleNavigateTab('profile');
            showToast('✂️ 已切换至个人主页，开启照片抠图贴纸编辑器');
          }}
        />

        <FamilyGroupModal
          isOpen={isFamilyModalOpen}
          onClose={() => setIsFamilyModalOpen(false)}
          familyGroup={familyGroup}
          onSaveFamilyGroup={(data) => {
            setFamilyGroup(data);
            showToast('家庭小组已更新 🎉');
          }}
          onRemoveFamilyGroup={() => {
            setFamilyGroup(null);
            showToast('家庭小组已重置');
          }}
        />

        <CreateFamilyGroupPage
          isOpen={isCreateFamilyPageOpen}
          onClose={() => setIsCreateFamilyPageOpen(false)}
          onSuccess={(msg) => showToast(msg)}
          onSaveFamilyGroup={(data) => {
            setFamilyGroup(data);
            showToast('家庭守护小组与专属图标已创建 🎉');
          }}
        />

        <FamilyCareMonitorPage
          isOpen={isFamilyCareOpen}
          onClose={() => setIsFamilyCareOpen(false)}
          familyGroup={familyGroup}
          timeRange={familyTimeRange}
          setTimeRange={setFamilyTimeRange}
          isManagementModalOpen={isFamilyManagementModalOpen}
          setIsManagementModalOpen={setIsFamilyManagementModalOpen}
          onOpenSettings={() => {
            setIsFamilyManagementModalOpen(true);
          }}
          onExitFamilyCare={() => {
            setIsFamilyManagementModalOpen(false);
            setIsFamilyCareOpen(false);
            setIsCreateFamilyPageOpen(true);
            showToast('已退出家庭看护，已返回家庭看护登录初始界面');
          }}
          onDisbandFamilyGroup={() => {
            setFamilyGroup(null);
            setIsFamilyManagementModalOpen(false);
            setIsFamilyCareOpen(false);
            setIsCreateFamilyPageOpen(true);
            showToast('家庭看护群已一键解散，已重置回到家庭看护登录初始界面');
          }}
        />

        <TextCenterModal
          isOpen={isTextCenterOpen}
          onClose={() => setIsTextCenterOpen(false)}
          showToast={showToast}
        />

        <DocumentCenterModal
          isOpen={isDocumentCenterOpen}
          onClose={() => setIsDocumentCenterOpen(false)}
          conversations={conversations}
          userAlbums={userAlbums}
          setUserAlbums={setUserAlbums}
          userFolders={userFolders}
          setUserFolders={setUserFolders}
          showToast={showToast}
        />

        <GoodNotesNoteModal
          isOpen={isGoodNotesOpen}
          onClose={() => setIsGoodNotesOpen(false)}
          onSaveNote={(newNote) => {
            showToast(`笔记【${newNote.title}】已成功存入文档中心 📑`);
            setIsGoodNotesOpen(false);
          }}
          showToast={showToast}
        />

        <ImmersiveAddNoteModal
          isOpen={isImmersiveAddNoteOpen}
          onClose={() => setIsImmersiveAddNoteOpen(false)}
          onSave={(noteData) => {
            showToast(`笔记【${noteData.title}】已存入微信收藏与Stellar文档 📑`);
            setIsImmersiveAddNoteOpen(false);
          }}
        />

        <StellarWorkspacePage
          isOpen={isStellarWorkspaceOpen}
          onClose={() => setIsStellarWorkspaceOpen(false)}
          showToast={showToast}
        />

        {reminderSchedule && schedules.some(item => item.id === reminderSchedule.id && item.status !== 'cancelled' && (item.type !== 'flight' || getFlightSnapshotInfo(item).status !== 'cancelled')) && <div className="life-reminder-banner" role="status"><div><strong>该为「{reminderSchedule.title}」准备出发了</strong><span>{reminderSchedule.location.name} · 路程与提前到达时间可调整</span></div><button onClick={() => {handleNavigateToMapLocation({lat:reminderSchedule.location.latitude,lng:reminderSchedule.location.longitude,name:reminderSchedule.title,scheduleId:reminderSchedule.id,planRoute:true});setReminderSchedule(null);}}>规划出发</button><button aria-label="关闭日程提醒" onClick={() => setReminderSchedule(null)}><X size={16}/></button></div>}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#050505]/90 text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
            {toastMessage}
          </div>
        )}

        {/* Chat Management Center Modal */}
        {showManagementCenter && activeChatConversation && (
          <ChatManagementCenter
            chatName={activeChatConversation.friendName}
            chatAvatar={activeChatConversation.avatar}
            isGroup={activeChatConversation.isGroup || activeChatConversation.id.startsWith('cg')}
            onClose={() => setShowManagementCenter(false)}
            onShowToast={showToast}
            onOpenDocumentAssets={() => {
              setShowManagementCenter(false);
              setIsDocumentCenterOpen(true);
            }}
          />
        )}
        {/* Emoji Bombing Full Screen Overlay */}
        <EmojiBombingOverlay
          bombing={currentBombing}
          onClose={handleCloseEmojiBombing}
        />

        {/* Guardian / Vehicle Jumping Push Alert (Left side of screen) */}
        <GuardianPushAlertWidget
          alert={guardianAlert}
          onDismiss={() => setGuardianAlert(null)}
          onClickAlert={handleGuardianAlertClick}
        />

        <CreateStoryModal
          isOpen={isCreateStoryOpen}
          onClose={() => setIsCreateStoryOpen(false)}
          onSendStory={handleSendStory}
          showToast={showToast}
          initialLocation={pinLocation?.name || pinLocation?.address}
        />

        <InstagramVideoModal
          isOpen={!!activeInstagramVideo}
          story={activeInstagramVideo}
          onClose={() => setActiveInstagramVideo(null)}
          onLike={(id) => {
            setVideoStories((prev) =>
              prev.map((s) => (s.id === id ? { ...s, likesCount: (s.likesCount || 0) + 1, isLiked: true } : s))
            );
          }}
          onComment={(id, text) => {
            setVideoStories((prev) =>
              prev.map((s) => (s.id === id ? { ...s, commentsCount: (s.commentsCount || 0) + 1 } : s))
            );
          }}
          showToast={showToast}
        />

        <PlanetUniverseModal
          isOpen={isPlanetUniverseOpen}
          onClose={() => setIsPlanetUniverseOpen(false)}
          planets={planets}
          onUpdatePlanet={(updated) => {
            setPlanets((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          }}
          showToast={showToast}
          onNavigateToMapLocation={(loc) => {
            setIsPlanetUniverseOpen(false);
            handleNavigateToMapLocation(loc);
          }}
        />

        <QuickEditsStudioModal
          isOpen={isQuickEditsOpen}
          onClose={() => setIsQuickEditsOpen(false)}
          onSendToChat={(message) => {
            if (activeChatId) {
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id === activeChatId) {
                    const newMsg: ChatMessage = {
                      id: `msg-${Date.now()}`,
                      senderId: 'me',
                      senderName: 'Alexia',
                      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
                      text: message,
                      timestamp: '刚刚',
                      isMe: true,
                      type: 'text',
                    };
                    return {
                      ...c,
                      lastMessage: message,
                      lastTime: '刚刚',
                      messages: [...c.messages, newMsg],
                    };
                  }
                  return c;
                })
              );
              showToast('已将创游卡片发送至当前会话 🎮');
            } else {
              showToast('已复制创游指令卡片');
            }
          }}
          showToast={showToast}
        />

        {/* Schedule Creation Modal */}
        <ScheduleCreationModal
          isOpen={isScheduleCreationOpen}
          onClose={() => setIsScheduleCreationOpen(false)}
          friends={friends}
          onSuccessCreate={handleCreateScheduleSuccess}
          initialLocation={pinLocation || undefined}
          initialDate={scheduleInitialDate}
          onViewOnMap={(sched) => {
            setIsScheduleCreationOpen(false);
            handleNavigateToMapLocation({lat:sched.location.latitude,lng:sched.location.longitude,name:sched.title,scheduleId:sched.id});
          }}
          onViewOnCalendar={(sched) => {
            setIsScheduleCreationOpen(false);
            setCalendarFocusDate(scheduleDateParts(sched).date);
            handleNavigateTab('calendar');
            showToast(`已在日历中打开日程：${sched.title} 📅`);
          }}
          showToast={showToast}
        />

        {/* Schedule Detail & Flight Simulator Modal */}
        <ScheduleDetailModal
          isOpen={isScheduleDetailOpen}
          schedule={selectedScheduleForDetail}
          onClose={() => setIsScheduleDetailOpen(false)}
          onViewOnMap={(sched) => {
            setIsScheduleDetailOpen(false);
            const position = sched.type === 'flight' ? getFlightSnapshotInfo(sched).position : null;
            handleNavigateToMapLocation({lat:position?.lat ?? sched.location.latitude,lng:position?.lng ?? sched.location.longitude,name:sched.title,scheduleId:sched.id});
          }}
          onViewOnCalendar={(sched) => {
            setIsScheduleDetailOpen(false);
            setCalendarFocusDate(scheduleDateParts(sched).date);
            handleNavigateTab('calendar');
            showToast(`已在对应日历中打开日程：${sched.title} 📅`);
          }}
          onDeleteSchedule={handleDeleteSchedule}
          onUpdateScheduleStatus={handleUpdateScheduleStatus}
          onUpdateSchedule={handleUpdateSchedule}
          onPlanRoute={(sched) => {setIsScheduleDetailOpen(false);handleNavigateToMapLocation({lat:sched.location.latitude,lng:sched.location.longitude,name:sched.title,scheduleId:sched.id,planRoute:true});}}
          onRefreshFlight={refreshFlight}
          flightServiceConfigured={flightServiceConfigured}
          showToast={showToast}
        />

        {/* Stealth Mode Duration Modal (0.3s slide up) */}
        <StealthDurationModal
          isOpen={isStealthModalOpen}
          isCurrentlyStealth={isStealthMode}
          friends={friends}
          customSchedule={stealthSchedule || undefined}
          onSaveSchedule={(schedule) => {
            setStealthSchedule(schedule);
          }}
          onClose={() => setIsStealthModalOpen(false)}
          onSelectDuration={(dur, scheduleData) => {
            setIsStealthModalOpen(false);
            if (dur === 'cancel_stealth') {
              setIsStealthMode(false);
              setStealthDuration(null);
              setStealthSchedule(null);
              showToast('🌐 幽灵模式已关闭 · 我的气泡 0.3s 弹入恢复实时位置');
            } else if (dur === 'custom_schedule' && scheduleData) {
              setStealthSchedule(scheduleData);
              const curH = new Date().getHours();
              const inOpen =
                scheduleData.startHour <= scheduleData.endHour
                  ? curH >= scheduleData.startHour && curH < scheduleData.endHour
                  : curH >= scheduleData.startHour || curH < scheduleData.endHour;

              setIsStealthMode(!inOpen);
              setStealthDuration(`定时: ${String(scheduleData.startHour).padStart(2, '0')}:00-${String(scheduleData.endHour).padStart(2, '0')}:00`);

              const friendCountLabel = scheduleData.allowAllFriends
                ? '全部好友'
                : `${scheduleData.selectedFriendIds.length}位好友`;
              if (inOpen) {
                showToast(`⏱️ 定时规则生效：当前处于开放时段（${friendCountLabel}可见），其余时段将自动幽灵隐身`);
              } else {
                showToast(`👻 定时规则生效：当前处于隐身时段（幽灵模式开启），${String(scheduleData.startHour).padStart(2, '0')}:00将自动上线`);
              }
            } else {
              setIsStealthMode(true);
              setStealthDuration(dur);
              setStealthSchedule(null);
              const label = dur === '3h' ? '3 小时' : dur === '12h' ? '12 小时' : '直到明天早晨';
              showToast(`👻 幽灵模式已开启 (${label}) · 气泡淡出收缩，好友视角显示「最近活跃」`);
            }
          }}
        />

        {/* Share Activity Card to Friend Modal */}
        <ShareActivityModal
          isOpen={!!sharingActivity}
          onClose={() => setSharingActivity(null)}
          activity={sharingActivity}
          friends={friends}
          onConfirmShare={handleShareActivityToFriend}
        />

        {/* Share Location / Frequent Place Card to Friend Modal */}
        <ShareLocationModal
          isOpen={!!sharingLocation}
          onClose={() => setSharingLocation(null)}
          locationData={sharingLocation}
          friends={friends}
          onConfirmShare={handleShareLocationToFriend}
        />

        {/* Share Life Place Card to Friend Modal */}
        <ShareLifePlaceModal
          isOpen={!!sharingLifePlace}
          onClose={() => setSharingLifePlace(null)}
          place={sharingLifePlace}
          friends={friends}
          onConfirmShare={handleShareLifePlaceToFriend}
        />
      </>
    )}
  </div>
    </IPhone17ProFrame>
  );
}
