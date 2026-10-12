import { BumpFriendDock, IntercomStatus } from './BumpFriendDock';
import { BumpSticker } from './chat/BumpSticker';
import type { MessageAppearance } from './chat/messageStyles';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  Navigation,
  Sparkles,
  Camera,
  Hand,
  Flame,
  DoorOpen,
  Radio,
  Compass,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Volume2,
  Heart,
  Battery,
  MapPin,
  Clock,
  Activity,
  Zap,
  CheckCircle2,
  Bell,
  ShieldAlert,
  Car,
  Check,
  Footprints,
  Users,
  Share2,
  Copy,
  CheckCheck,
  ExternalLink,
  Send,
  Image,
  User,
  Smile,
  CloudSun,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  Calendar,
} from 'lucide-react';
import { Friend, LabelSticker, SimulatedMapActivity, ActivityParticipantStatus, VisitedPlaceItem } from '../types';
import { INITIAL_USER_STICKERS, calculateOrbitAngles } from '../data/stickerData';
import { USER_LOCATION, SIMULATED_ACTIVITIES } from '../data/mockData';
import { getWeatherByLocationName, getWeatherByCoords, getDressingStyle } from '../utils/weatherEngine';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';
import { DoorKnockModal } from './DoorKnockModal';
import { QuickSnapCameraModal } from './QuickSnapCameraModal';

export interface FriendInteractiveModalProps {
  friend: Friend;
  userLocation?: {lat:number;lng:number};
  friendCount?: number;
  onAddFriend?: () => void;
  onGhost?: () => void;
  onProfile?: () => void;
  onSendText?: (text: string) => void;
  onSendSnap?: (url: string, caption?: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (friendId: string) => void;
  onOpenCanvasChat?: (friendId: string, appearance: MessageAppearance) => void;
  onNavigate: (lat: number, lng: number, name: string) => void;
  onShowToast: (msg: string) => void;
  onSelectMe?: () => void;
  onAddNotification?: (notification: {
    id: string;
    title: string;
    content: string;
    time: string;
    unread: boolean;
    type: "sos" | "low_battery" | "arrival" | "friend_request" | "system";
  }) => void;
  onUpdateFriendRelationship?: (friendId: string, relationship: 'normal' | 'close' | 'family' | 'muted' | 'hidden') => void;
  onBump?: (friend: Friend) => void;
  isIntercomTransmitting?: boolean;
  onIntercomTransmittingChange?: (transmitting: boolean) => void;
  sourceRect?: { x: number; y: number; width: number; height: number } | null;
  // List of active map activities for identifying participation
  activities?: SimulatedMapActivity[];
  onOpenActivityDetail?: (activityId: string) => void;
  // Activity context for co-participating friends
  activityContext?: {
    activity: SimulatedMapActivity;
    participant: ActivityParticipantStatus;
    onUpdateParticipantRole?: (activityId: string, participantId: string, role: 'admin' | 'core' | 'member') => void;
    onToggleParticipantArrival?: (activityId: string, participantId: string) => void;
    onAssignTask?: (activityId: string, participantId: string, task: string) => void;
  } | null;
  // 24H activity trajectory replay callback
  onOpenTrajectory?: (friend: Friend) => void;
}

// 7 Standard High-Tactile Interactive Emojis
const SYSTEM_INTERACTION_EMOJIS = ['🪨', '💣', '♥️', '💩', '👍', '👉', '⚽️'];

// Candidates for Add Emoji picker
const CANDIDATE_EMOJIS_TO_ADD = ['🎉', '🔥', '⚡️', '🍕', '🚀', '🧸', '🕶️', '🌈', '🥑', '🎮'];

interface FlyingEmojiItem {
  id: string;
  emoji: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

interface LocalParticleItem {
  id: string;
  text: string;
  x: number;
  y: number;
  scale?: number;
}

interface KnockFistItem {
  id: string;
  x: number;
  y: number;
  tier: 'gentle' | 'urgent' | 'frenzy';
  combo: number;
  text: string;
}

// Pre-defined quick friends list for sharing personal location and footprints
const SHAREABLE_FRIENDS = [
  { id: 'f-stella', name: 'Stella', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', tag: '密友', distance: '1.2km', status: '在线' },
  { id: 'f-zixuan', name: '子轩', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150', tag: '运动中', distance: '1.8km', status: '35km/h' },
  { id: 'f-liam', name: 'Liam', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', tag: '停留中', distance: '250m', status: '咖啡馆' },
  { id: 'f-teacher', name: '张老师', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', tag: '好友', distance: '3.5km', status: '在线' },
  { id: 'f-squad', name: '探索小队全员', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=150', tag: '群组', distance: '全员', status: '8人活跃' },
];

export const FriendInteractiveModal: React.FC<FriendInteractiveModalProps> = ({
  friend,
  userLocation = USER_LOCATION,
  isOpen,
  onClose,
  onOpenChat,
  onOpenCanvasChat,
  onNavigate,
  onShowToast,
  onSelectMe,
  onAddNotification,
  onUpdateFriendRelationship,
  onBump,
  isIntercomTransmitting: externalIntercomTransmitting,
  onIntercomTransmittingChange,
  sourceRect,
  activities,
  onOpenActivityDetail,
  activityContext,
  onOpenTrajectory,
  friendCount = 0, onAddFriend, onGhost, onProfile, onSendText, onSendSnap,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [avatarAnchor, setAvatarAnchor] = useState<{ x: number; y: number } | null>(null);
  const emojiTimeouts = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const scheduleEmoji = (run: () => void, delay: number) => {
    const timer = setTimeout(() => { emojiTimeouts.current.delete(timer); run(); }, delay);
    emojiTimeouts.current.add(timer);
  };
  const avatarContainerRef = useRef<HTMLDivElement>(null);

  // Determine if this friend is participating in an active activity
  const activeParticipatingActivity = useMemo(() => {
    if (activityContext?.activity) {
      return activityContext.activity;
    }
    const activityList = activities && activities.length > 0 ? activities : SIMULATED_ACTIVITIES;
    if (!friend) return null;

    const friendNameClean = (friend.name || '').toLowerCase().replace(/\s+/g, '');
    const friendFirstName = (friend.name || '').split(' ')[0].toLowerCase();

    return (
      activityList.find((act) => {
        return act.participants?.some((p) => {
          const pNameClean = (p.name || '').toLowerCase().replace(/\s+/g, '');
          const pFirstName = (p.name || '').split(' ')[0].toLowerCase();
          const isNameMatch =
            pNameClean === friendNameClean ||
            (friendFirstName.length >= 2 && pNameClean.includes(friendFirstName)) ||
            (pFirstName.length >= 2 && friendNameClean.includes(pFirstName));
          const isAvatarMatch = Boolean(p.avatar && friend.avatar && p.avatar === friend.avatar);
          const isIdMatch = Boolean(
            p.id && friend.id && (p.id === friend.id || p.id.includes(friend.id) || friend.id.includes(p.id))
          );
          return isNameMatch || isAvatarMatch || isIdMatch;
        });
      }) || null
    );
  }, [activityContext, activities, friend]);

  // Participant status within that activity
  const activeParticipantInfo = useMemo(() => {
    if (activityContext?.participant) return activityContext.participant;
    if (!activeParticipatingActivity || !friend) return null;
    const friendNameClean = (friend.name || '').toLowerCase().replace(/\s+/g, '');
    const friendFirstName = (friend.name || '').split(' ')[0].toLowerCase();

    return (
      activeParticipatingActivity.participants?.find((p) => {
        const pNameClean = (p.name || '').toLowerCase().replace(/\s+/g, '');
        const pFirstName = (p.name || '').split(' ')[0].toLowerCase();
        return (
          pNameClean === friendNameClean ||
          (friendFirstName.length >= 2 && pNameClean.includes(friendFirstName)) ||
          (pFirstName.length >= 2 && friendNameClean.includes(pFirstName)) ||
          (p.avatar && friend.avatar && p.avatar === friend.avatar) ||
          (p.id && friend.id && (p.id === friend.id || p.id.includes(friend.id) || friend.id.includes(p.id)))
        );
      }) || null
    );
  }, [activityContext, activeParticipatingActivity, friend]);

  // Friend location realtime weather data
  const friendWeather = useMemo(() => {
    if (!friend) {
      return {
        emoji: '☀️',
        temp: '27°C',
        condition: '晴朗',
        regionName: '兰州',
        humidity: '42%',
        wind: '西北风 2级',
        aqi: 42,
        aqiText: '优',
        tips: '天气晴朗，气温宜人。',
        dressingStyle: '气温宜人偏暖，推荐休闲着装。',
      };
    }

    const locationWeather = getWeatherByLocationName(friend.locationName || '');
    const coordsWeather = getWeatherByCoords(friend.lat, friend.lng);

    return {
      ...coordsWeather,
      emoji: locationWeather.emoji || coordsWeather.emoji || '☀️',
      temp: locationWeather.temp || coordsWeather.temp || '27°C',
      condition: locationWeather.condition || coordsWeather.condition || '晴朗',
      regionName: locationWeather.regionName || friend.locationName || coordsWeather.locationName || '兰州',
      humidity: coordsWeather.humidity || '45%',
      wind: coordsWeather.wind || '微风 2级',
      aqi: coordsWeather.aqi || 42,
      aqiText: coordsWeather.aqiText || (coordsWeather.aqi && coordsWeather.aqi <= 50 ? '优' : '良'),
      tips: coordsWeather.tips || '微风徐徐，最适宜漫步出行。',
      dressingStyle: coordsWeather.dressingStyle || getDressingStyle(locationWeather.temp || coordsWeather.temp),
    };
  }, [friend]);

  // Check if viewing current user's personal profile (我 Alexia)
  const isUserSelf = Boolean(
    friend.isMe || friend.id === 'me' || friend.name.includes('我') || friend.name.toLowerCase().includes('alexia')
  );

  // Activity Participant Management state
  const [participantRole, setParticipantRole] = useState<'admin' | 'core' | 'member'>(
    activityContext?.participant.groupRole || 'member'
  );
  const [isParticipantArrived, setIsParticipantArrived] = useState<boolean>(
    activityContext?.participant.status === 'arrived'
  );
  const [assignedTasks, setAssignedTasks] = useState<string[]>(['物资保障']);

  // Synchronize when activityContext changes
  useEffect(() => {
    if (activityContext?.participant) {
      setParticipantRole(activityContext.participant.groupRole || 'member');
      setIsParticipantArrived(activityContext.participant.status === 'arrived');
    }
  }, [activityContext?.participant?.id, activityContext?.participant?.status, activityContext?.participant?.groupRole]);

  // Measure container dimensions for responsive layout math
  const [containerDims, setContainerDims] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 700,
  });

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDims = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDims({
          width: rect.width || window.innerWidth,
          height: rect.height || window.innerHeight,
        });
      }
    };
    updateDims();
    const ro = new ResizeObserver(updateDims);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Relationship state
  const [currentRelationship, setCurrentRelationship] = useState<'normal' | 'close' | 'family' | 'muted' | 'hidden'>(
    friend.relationship === 'close' || friend.relationship === 'family' || friend.relationship === 'muted' || friend.relationship === 'hidden'
      ? friend.relationship : friend.isCloseFriend ? 'close' : friend.isFamily ? 'family' : 'normal'
  );
  const [isRelationDropdownOpen, setIsRelationDropdownOpen] = useState(false);

  // Footprint / Visited Places state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedPlaceToShare, setSelectedPlaceToShare] = useState<VisitedPlaceItem | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Visited places list with robust fallback
  const visitedPlaces = useMemo<VisitedPlaceItem[]>(() => {
    if (friend.recentVisitedPlaces && friend.recentVisitedPlaces.length > 0) {
      return friend.recentVisitedPlaces;
    }
    return [
      {
        id: `vp-1`,
        name: `Leonie Bakery · 核心人文商圈`,
        address: '甘肃省兰州市城关区南昌路',
        time: '今天 09:30 - 11:45',
        stayDuration: '停留 2.2h',
        category: '核心商圈',
        icon: '☕',
        lat: 36.0592,
        lng: 103.8343,
        city: '兰州市',
        summary: '城市步行探索与好友咖啡聚会',
      },
      {
        id: `vp-2`,
        name: '滨河生态公园 · 慢行步道',
        address: '兰州市城关区滨河东路',
        time: '昨天 16:20 - 18:00',
        stayDuration: '停留 1.6h',
        category: '慢行步道',
        icon: '🌿',
        lat: 36.0628,
        lng: 103.8421,
        city: '兰州市',
        summary: '沿黄河风情线绿道慢跑休闲',
      },
      {
        id: `vp-3`,
        name: '甘肃省博物馆 · 丝路文明展',
        address: '七里河区西津西路3号',
        time: '前天 13:40 - 16:50',
        stayDuration: '停留 3.1h',
        category: '文博展馆',
        icon: '🏛️',
        lat: 36.0667,
        lng: 103.7780,
        city: '兰州市',
        summary: '历史文物参观与艺术研学打卡',
      },
      {
        id: `vp-4`,
        name: '正宁路老字号民俗夜市街',
        address: '城关区正宁路244号',
        time: '3天前 19:10 - 20:50',
        stayDuration: '停留 1.8h',
        category: '民俗美食',
        icon: '🍜',
        lat: 36.0553,
        lng: 103.8242,
        city: '兰州市',
        summary: '特色小吃体验与好友夜游聚餐',
      },
    ];
  }, [friend]);

  const handleOpenShareModal = (place?: VisitedPlaceItem) => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    setSelectedPlaceToShare(place || null);
    setIsShareModalOpen(true);
  };

  const handleShareToTargetFriend = (target: { name: string }) => {
    haptics.trigger('medium');
    soundEffects.playShareSound();
    setIsShareModalOpen(false);
    const placeTitle = selectedPlaceToShare ? `地点「${selectedPlaceToShare.name}」` : `实时位置与近3天4处足迹清单`;
    onShowToast(`💬 已将您的个人${placeTitle}成功分享给【${target.name}】！`);
    if (onAddNotification) {
      onAddNotification({
        id: `footprint-share-${Date.now()}`,
        title: `📍 个人位置/足迹已分享`,
        content: `你已将个人${placeTitle}成功发送给【${target.name}】。`,
        time: '刚刚',
        unread: true,
        type: 'system',
      });
    }
  };

  const handleShareCurrentLocation = () => {
    haptics.trigger('medium');
    soundEffects.playShareSound();
    setIsShareModalOpen(false);
    onShowToast(`📍 已将您的当前实时位置【兰州市城关区 东方红广场】成功分享给好友！`);
    if (onAddNotification) {
      onAddNotification({
        id: `loc-share-${Date.now()}`,
        title: `📍 实时位置已分享`,
        content: `已将当前实时位置【兰州市城关区 东方红广场】分享给好友。`,
        time: '刚刚',
        unread: true,
        type: 'system',
      });
    }
  };

  const handleShareToChat = () => {
    haptics.trigger('medium');
    soundEffects.playShareSound();
    setIsShareModalOpen(false);
    const placeTitle = selectedPlaceToShare ? `「${selectedPlaceToShare.name}」` : `近3天4处足迹`;
    const shareSubject = isUserSelf ? '我的个人' : `【${friend.name}】`;
    onShowToast(`💬 已生成${shareSubject}${placeTitle}足迹卡片，已发送至私聊！`);
    if (onAddNotification) {
      onAddNotification({
        id: `footprint-share-${Date.now()}`,
        title: `👣 足迹分享已发送`,
        content: `你已将${shareSubject}的近期足迹卡片成功分享至私聊。`,
        time: '刚刚',
        unread: true,
        type: 'system',
      });
    }
    setTimeout(() => {
      onClose();
      onOpenChat(friend.id);
    }, 600);
  };

  const handleCopyFootprintText = () => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    const titlePrefix = isUserSelf ? '我的近期足迹与个人位置' : `${friend.name}的近期足迹`;
    const textToCopy = selectedPlaceToShare
      ? `【${titlePrefix}】\n地点：${selectedPlaceToShare.name}\n时间：${selectedPlaceToShare.time} (${selectedPlaceToShare.stayDuration})\n地址：${selectedPlaceToShare.address || '城区'}\n描述：${selectedPlaceToShare.summary || ''}\n—— 来自好友地图共享`
      : `【${titlePrefix} · 近3天去过的地方】\n` +
        visitedPlaces
          .map(
            (p, idx) =>
              `${idx + 1}. ${p.name} [${p.category || '足迹'}]\n   时间：${p.time} (${p.stayDuration})\n   简介：${p.summary || p.address}`
          )
          .join('\n\n') +
        `\n—— 来自好友地图实时共享`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    onShowToast(`📋 足迹清单已复制到剪贴板，快去粘贴分享给好友吧！`);
  };

  const handleShareToGroup = () => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    setIsShareModalOpen(false);
    const subject = isUserSelf ? '我的个人' : `【${friend.name}】`;
    onShowToast(`👥 已将${subject}近期足迹一键同步至小队群聊与动态！`);
  };

  const handleGeneratePoster = () => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    setIsShareModalOpen(false);
    onShowToast(`🖼️ 足迹高清海报已成功生成，已保存至系统相册！`);
  };

  // Embedded Circular Compass bearing calculation
  const compassBearing = useMemo(() => {
    if (!friend || typeof friend.lat !== 'number' || typeof friend.lng !== 'number') return 45;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;
    const dLon = toRad(friend.lng - USER_LOCATION.lng);
    const y = Math.sin(dLon) * Math.cos(toRad(friend.lat));
    const x =
      Math.cos(toRad(USER_LOCATION.lat)) * Math.sin(toRad(friend.lat)) -
      Math.sin(toRad(USER_LOCATION.lat)) * Math.cos(toRad(friend.lat)) * Math.cos(dLon);
    let brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
  }, [friend?.lat, friend?.lng]);

  const compassDirectionText = useMemo(() => {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const idx = Math.round(compassBearing / 45) % 8;
    return `${directions[idx]} ${Math.round(compassBearing)}°`;
  }, [compassBearing]);

  // Apple Compass 360-degree ticks calculation (72 graduation marks)
  const compassTicks = useMemo(() => {
    const ticks: { deg: number; length: number; strokeWidth: number; strokeColor: string }[] = [];
    for (let i = 0; i < 72; i++) {
      const deg = i * 5;
      const isCardinal = deg % 90 === 0;
      const isMajor = deg % 30 === 0;
      const isMedium = deg % 15 === 0;
      const length = isCardinal ? 9 : isMajor ? 7 : isMedium ? 5 : 3;
      const strokeWidth = isCardinal ? 2 : isMajor ? 1.5 : isMedium ? 1 : 0.75;
      const strokeColor = isCardinal
        ? deg === 0
          ? '#FF3B30' // North Apple Red
          : '#4B5563' // Gray-600
        : isMajor
        ? '#6B7280' // Gray-500
        : isMedium
        ? '#9CA3AF' // Gray-400
        : '#CBD5E1'; // Slate-300
      ticks.push({ deg, length, strokeWidth, strokeColor });
    }
    return ticks;
  }, []);

  // Orbiting Cutout Label Stickers State
  const [stickersState, setStickersState] = useState<LabelSticker[]>([]);
  const [bouncingStickerId, setBouncingStickerId] = useState<string | null>(null);
  const [stickerHeartPops, setStickerHeartPops] = useState<{ id: number; stickerId: string; x: number; y: number }[]>([]);

  useEffect(() => {
    if (friend.stickers && friend.stickers.length > 0) {
      setStickersState(friend.stickers);
    } else {
      // Default orbiting stickers for friends
      setStickersState(INITIAL_USER_STICKERS.slice(0, 4));
    }
  }, [friend.id, friend.stickers]);

  // Handle Sticker Like / Tap
  const handleStickerTap = useCallback((sticker: LabelSticker, e: React.MouseEvent) => {
    e.stopPropagation();
    setBouncingStickerId(sticker.id);
    setTimeout(() => setBouncingStickerId(null), 380);

    const popId = Date.now() + Math.random();
    const randomOffset = (Math.random() - 0.5) * 24;
    setStickerHeartPops((prev) => [...prev, { id: popId, stickerId: sticker.id, x: randomOffset, y: -20 }]);
    setTimeout(() => {
      setStickerHeartPops((prev) => prev.filter((p) => p.id !== popId));
    }, 900);

    soundEffects.playHeartPopTone();
    haptics.trigger('light');

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

    onShowToast(`❤️ 点赞了【${friend.name}】的「${sticker.label}」贴纸！`);
  }, [friend.name, onShowToast]);

  // Interactive Action States
  const [greetCount, setGreetCount] = useState(0);
  const [isPoked, setIsPoked] = useState(false);
  const [isGreetingWaving, setIsGreetingWaving] = useState(false);
  const greetWaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [hitEffect, setHitEffect] = useState(false);
  const [knockCount, setKnockCount] = useState(0);
  const [bumpCount, setBumpCount] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isKnockModalOpen, setIsKnockModalOpen] = useState(false);

  // Emojis & Particle States
  const [customEmojis, setCustomEmojis] = useState<string[]>(['👻', '🐱', '🍕', '🚀']);
  const [isAddEmojiOpen, setIsAddEmojiOpen] = useState(false);
  const [flyingEmojis, setFlyingEmojis] = useState<FlyingEmojiItem[]>([]);
  const [localParticles, setLocalParticles] = useState<LocalParticleItem[]>([]);
  const [knockFists, setKnockFists] = useState<KnockFistItem[]>([]);

  // Emoji Combo Dynamic Counter State (表情连击数字与音效)
  const [comboInfo, setComboInfo] = useState<{
    count: number;
    emoji: string;
    tier: 'normal' | 'super' | 'mega' | 'frenzy';
    active: boolean;
    scaleKey: number;
  }>({
    count: 0,
    emoji: '💣',
    tier: 'normal',
    active: false,
    scaleKey: 0,
  });
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Emoji Cannon Charge / Barrage State
  const [chargingEmoji, setChargingEmoji] = useState<string | null>(null);
  const [chargeCount, setChargeCount] = useState(0);
  const chargeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chargeStartTimeRef = useRef<number>(0);

  // Intercom Walkie-Talkie State
  const [internalIntercom, setInternalIntercom] = useState(false);
  const isIntercom = externalIntercomTransmitting !== undefined ? externalIntercomTransmitting : internalIntercom;
  const [intercomSeconds, setIntercomSeconds] = useState(0);
  const intercomTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [intercomStatus, setIntercomStatus] = useState<IntercomStatus>('idle');
  const [intercomError, setIntercomError] = useState('');
  const [voicePreviewUrl, setVoicePreviewUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const voiceUrlRef = useRef<string | null>(null);
  const intercomSessionRef = useRef(0);
  const intercomChangeRef = useRef(onIntercomTransmittingChange);
  intercomChangeRef.current = onIntercomTransmittingChange;

  useEffect(() => () => {
    intercomSessionRef.current += 1;
    if (intercomTimerRef.current) { clearInterval(intercomTimerRef.current); intercomTimerRef.current = null; }
    const recorder = recorderRef.current;
    if (recorder) {
      recorder.onstop = null;
      recorder.ondataavailable = null;
      recorder.onerror = null;
      if (recorder.state !== 'inactive') recorder.stop();
    }
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (voiceUrlRef.current) URL.revokeObjectURL(voiceUrlRef.current);
    if (recorder) intercomChangeRef.current?.(false);
  }, [friend.id]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      emojiTimeouts.current.forEach(clearTimeout);
      if (chargeTimerRef.current) clearInterval(chargeTimerRef.current);
      if (intercomTimerRef.current) clearInterval(intercomTimerRef.current);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      if (greetWaveTimerRef.current) clearTimeout(greetWaveTimerRef.current);
    };
  }, []);

  // Calculate layout coordinates for the avatar and console
  const isShortScreen = containerDims.height < 640;
  const isLandscape = containerDims.width > 500 && containerDims.height < 500;
  const actionConsoleHeight = isShortScreen ? 285 : 310;
  const availableTopArea = Math.max(160, containerDims.height - actionConsoleHeight);

  // Adaptive Avatar Size:
  // Compact on short phones (88-96px), Standard on taller phones (116-124px)
  const avatarSize = isShortScreen ? 92 : 118;
  const infoBadgeHeight = 40;
  const gapBetweenAvatarAndBadge = 8;

  // Safe area math: guarantees avatar visual envelope never overlaps top nav (y >= 14px) or console
  const totalAvatarEnvelopeHeight = avatarSize + gapBetweenAvatarAndBadge + infoBadgeHeight;
  const desiredCenterY = Math.round(availableTopArea * 0.44);
  const minCenterY = 14 + avatarSize / 2 + 6;
  const maxCenterY = Math.max(minCenterY, availableTopArea - 14 - infoBadgeHeight - gapBetweenAvatarAndBadge - avatarSize / 2);
  const safeAvatarCenterY = avatarAnchor?.y ?? (isLandscape ? containerDims.height * 0.45 : Math.min(Math.max(desiredCenterY, minCenterY), maxCenterY));
  const safeAvatarCenterX = avatarAnchor?.x ?? containerDims.width * (isLandscape ? 0.25 : 0.5);

  useEffect(() => {
    let frame: number;
    const track = () => {
      const marker = Array.from(document.querySelectorAll<HTMLElement>('[data-friend-id]')).find(el => el.dataset.friendId === friend.id && el.getBoundingClientRect().width > 0);
      const root = containerRef.current?.getBoundingClientRect();
      if (marker && root) {
        const rect = marker.getBoundingClientRect();
        const next = { x: rect.left + rect.width / 2 - root.left, y: rect.top + Math.min(rect.height, rect.width) / 2 - root.top };
        setAvatarAnchor(prev => prev && Math.abs(prev.x - next.x) < 0.5 && Math.abs(prev.y - next.y) < 0.5 ? prev : next);
      }
      frame = requestAnimationFrame(track);
    };
    frame = requestAnimationFrame(track);
    return () => cancelAnimationFrame(frame);
  }, [friend.id]);

  // Source marker offset for shared-layout / FLIP animation
  const animationParams = useMemo(() => {
    if (sourceRect && sourceRect.width > 0) {
      const sourceCenterX = sourceRect.x + sourceRect.width / 2;
      const sourceCenterY = sourceRect.y + sourceRect.height / 2;
      const dx = sourceCenterX - safeAvatarCenterX;
      const dy = sourceCenterY - safeAvatarCenterY;
      const scale = Math.max(0.3, Math.min(0.7, sourceRect.width / avatarSize));
      return { startX: dx, startY: dy, startScale: scale };
    }
    return { startX: 0, startY: 60, startScale: 0.5 };
  }, [sourceRect, safeAvatarCenterX, safeAvatarCenterY, avatarSize]);

  // Spring transition definition
  const springTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { type: 'spring' as const, stiffness: 340, damping: 28, mass: 0.8 };

  // Trigger floating particle near avatar
  const spawnLocalParticle = useCallback((text: string) => {
    const id = `particle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const randomAngle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 40;
    const px = Math.cos(randomAngle) * distance;
    const py = Math.sin(randomAngle) * distance - 20;

    setLocalParticles((prev) => [...prev.slice(-12), { id, text, x: px, y: py }]);
    setTimeout(() => {
      setLocalParticles((prev) => prev.filter((p) => p.id !== id));
    }, 900);
  }, []);

  // 1. Action: 打招呼 (Greet)
  const handleGreet = useCallback(() => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    soundEffects.playMessageSound();
    setGreetCount((prev) => prev + 1);
    setIsPoked(true);
    setIsGreetingWaving(true);

    if (greetWaveTimerRef.current) clearTimeout(greetWaveTimerRef.current);
    greetWaveTimerRef.current = setTimeout(() => {
      setIsGreetingWaving(false);
      setIsPoked(false);
    }, 1200);

    spawnLocalParticle('👋');
    spawnLocalParticle('✨');
    spawnLocalParticle('🌟');

    onShowToast(`已向【${friend.name}】挥手打招呼 👋 (今日已打招呼 ${greetCount + 1} 次)`);
    if (onAddNotification) {
      onAddNotification({
        id: `greet-${Date.now()}`,
        title: `打招呼已送达`,
        content: `你已向 ${friend.name} 挥手打招呼 👋`,
        time: '刚刚',
        unread: false,
        type: 'system',
      });
    }
  }, [friend.name, greetCount, onShowToast, onAddNotification, spawnLocalParticle]);

  // Register emoji hit with combo counter
  const registerEmojiHit = useCallback((emoji: string) => {
    setHitEffect(true);
    spawnLocalParticle(emoji);
    setTimeout(() => setHitEffect(false), 240);

    // Update combo count & tier
    setComboInfo((prev) => {
      const nextCount = prev.active ? prev.count + 1 : 1;
      let tier: 'normal' | 'super' | 'mega' | 'frenzy' = 'normal';
      if (nextCount >= 20) tier = 'frenzy';
      else if (nextCount >= 10) tier = 'mega';
      else if (nextCount >= 5) tier = 'super';

      return {
        count: nextCount,
        emoji,
        tier,
        active: true,
        scaleKey: Date.now(),
      };
    });

    // Audio & Haptics
    soundEffects.playBubblePopSound();
    haptics.trigger('light');

    // Reset Combo Decay Timer
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setComboInfo((prev) => ({ ...prev, active: false }));
    }, 1600);
  }, [spawnLocalParticle]);

  // 2. Action: 碰一碰 (Bump)
  const handleBump = useCallback(() => {
    haptics.trigger('heavy');
    soundEffects.playBumpImpactSound();
    setBumpCount((prev) => prev + 1);
    setHitEffect(true);
    setTimeout(() => setHitEffect(false), 350);

    spawnLocalParticle('💥');
    spawnLocalParticle('🔥');
    spawnLocalParticle('✨');

    onShowToast(`已与【${friend.name}】发生碰一碰！💥 (今日已碰 ${bumpCount + 1} 次)`);
    if (onBump) {
      onBump(friend);
    }
  }, [friend, bumpCount, onShowToast, onBump, spawnLocalParticle]);

  // 3. Action: 催一催 (Knock-Knock)
  const handleKnock = useCallback(() => {
    haptics.trigger('medium');
    const nextCount = knockCount + 1;
    setKnockCount(nextCount);

    let tier: 'gentle' | 'urgent' | 'frenzy' = 'gentle';
    let text = '敲一敲';
    if (nextCount >= 8) {
      tier = 'frenzy';
      text = '疯狂催门!';
    } else if (nextCount >= 4) {
      tier = 'urgent';
      text = '快点啦!';
    }

    soundEffects.playWoodKnockSound(tier, nextCount);

    const fistId = `fist-${Date.now()}-${Math.random()}`;
    const fistItem: KnockFistItem = {
      id: fistId,
      x: (Math.random() - 0.5) * 40,
      y: -60 - Math.random() * 20,
      tier,
      combo: nextCount,
      text,
    };

    setKnockFists((prev) => [...prev.slice(-5), fistItem]);
    setTimeout(() => {
      setKnockFists((prev) => prev.filter((f) => f.id !== fistId));
    }, 1000);

    onShowToast(`已催促【${friend.name}】(${text}) 🚪✊`);
  }, [friend.name, knockCount, onShowToast]);

  // 4. Action: 速拍 (Quick Snap)
  const handleQuickSnap = useCallback(() => {
    haptics.trigger('light');
    setIsCameraOpen(true);
  }, []);

  const handleSendCameraSnap = useCallback((imgData: string, caption?: string) => {
    onSendSnap?.(imgData, caption);
    setIsCameraOpen(false);
    setIsSnapping(true);
    setTimeout(() => setIsSnapping(false), 400);
    haptics.trigger('success');
    onShowToast(`📸 速拍已发送给【${friend.name}】`);
    if (onAddNotification) {
      onAddNotification({
        id: `snap-${Date.now()}`,
        title: `速拍已发送`,
        content: `已成功将即时速拍照片发送给 ${friend.name}`,
        time: '刚刚',
        unread: false,
        type: 'system',
      });
    }
  }, [friend.name, onShowToast, onAddNotification, onSendSnap]);

  // 5. Action: 找他/她 (Navigate)
  const handleStartNav = useCallback(() => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    onClose();
    if (typeof friend.lat === 'number' && typeof friend.lng === 'number') {
      onNavigate(friend.lat, friend.lng, friend.name);
    }
  }, [friend, onClose, onNavigate]);

  // Launch single flying emoji
  const launchFlyingEmoji = useCallback((emoji: string, startX?: number, startY?: number) => {
    haptics.trigger('light');
    soundEffects.playBubblePopSound();

    const id = `fly-${Date.now()}-${Math.random()}`;
    const root = containerRef.current?.getBoundingClientRect();
    const sx = startX === undefined ? containerDims.width / 2 : startX - (root?.left || 0);
    const sy = startY === undefined ? containerDims.height - 180 : startY - (root?.top || 0);
    // Directly converge and focus on the friend avatar's center
    const tx = (avatarAnchor?.x ?? safeAvatarCenterX) + (Math.random() - 0.5) * 6;
    const ty = (avatarAnchor?.y ?? safeAvatarCenterY) + (Math.random() - 0.5) * 6;

    setFlyingEmojis((prev) => [...prev.slice(-15), { id, emoji, startX: sx, startY: sy, targetX: tx, targetY: ty }]);

    // Target impact feedback with Combo registration
    scheduleEmoji(() => {
      registerEmojiHit(emoji);
    }, 420);

    scheduleEmoji(() => {
      setFlyingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 600);
  }, [containerDims, safeAvatarCenterX, safeAvatarCenterY, avatarAnchor, registerEmojiHit]);

  // Emoji Button Press & Hold (Barrage Cannon)
  const handleEmojiButtonDown = useCallback((emoji: string, e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    setChargingEmoji(emoji);
    setChargeCount(1);
    chargeStartTimeRef.current = Date.now();

    // Fire first emoji immediately
    launchFlyingEmoji(emoji, clientX, clientY);

    // Start charging loop
    if (chargeTimerRef.current) clearInterval(chargeTimerRef.current);
    chargeTimerRef.current = setInterval(() => {
      setChargeCount((prev) => {
        const next = prev + 1;
        if (next % 3 === 0) {
          haptics.trigger('medium');
        } else {
          haptics.trigger('light');
        }
        launchFlyingEmoji(emoji, clientX + (Math.random() - 0.5) * 20, clientY);
        return next;
      });
    }, 140);
  }, [launchFlyingEmoji]);

  const handleEmojiButtonUp = useCallback(() => {
    if (chargeTimerRef.current) {
      clearInterval(chargeTimerRef.current);
      chargeTimerRef.current = null;
    }

    if (chargingEmoji && chargeCount > 1) {
      haptics.trigger('heavy');
      onShowToast(`🚀 已向【${friend.name}】发射 ${chargeCount} 连发表情炮台！`);
    }

    setChargingEmoji(null);
    setChargeCount(0);
  }, [chargingEmoji, chargeCount, friend.name, onShowToast]);

  // Add custom emoji
  const handleAddCustomEmoji = useCallback((em: string) => {
    if (!customEmojis.includes(em)) {
      setCustomEmojis((prev) => [...prev, em]);
      haptics.trigger('light');
      onShowToast(`已添加新表情 ${em} 到快捷栏`);
    }
    setIsAddEmojiOpen(false);
  }, [customEmojis, onShowToast]);

  // Update Relationship
  const handleSelectRelationship = useCallback((rel: 'normal' | 'close' | 'family' | 'muted' | 'hidden') => {
    setCurrentRelationship(rel);
    setIsRelationDropdownOpen(false);
    haptics.trigger('medium');
    onUpdateFriendRelationship?.(friend.id, rel);
    const labelMap = {
      normal: '普通好友',
      close: '⭐ 密友',
      family: '🏠 家人',
      muted: '🔕 静音',
      hidden: '👻 隐藏',
    };
    onShowToast(`已将【${friend.name}】设为 ${labelMap[rel]}`);
  }, [friend.id, friend.name, onUpdateFriendRelationship, onShowToast]);

  // The prototype records locally; there is no peer-to-peer voice transport yet.
  const handleStopIntercom = useCallback(() => {
    if (recorderRef.current?.state !== 'recording') return;
    if (intercomTimerRef.current) {
      clearInterval(intercomTimerRef.current);
      intercomTimerRef.current = null;
    }
    recorderRef.current.stop();
    haptics.trigger('medium');
    soundEffects.playWalkieTalkieEnd();
    setInternalIntercom(false);
    intercomChangeRef.current?.(false);
  }, []);

  const handleOneClickIntercom = useCallback(async () => {
    if (intercomStatus === 'recording') {
      handleStopIntercom();
      return;
    }
    if (intercomStatus === 'requesting') return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setIntercomStatus('error');
      setIntercomError('当前浏览器不支持录音，请使用支持麦克风的浏览器');
      onShowToast('当前浏览器不支持录音，尚未发送语音');
      return;
    }
    const session = ++intercomSessionRef.current;
    setIntercomStatus('requesting');
    setIntercomError('');
    setIntercomSeconds(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (session !== intercomSessionRef.current) { stream.getTracks().forEach(track => track.stop()); return; }
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        if (session !== intercomSessionRef.current) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        if (!blob.size) { setIntercomStatus('error'); setIntercomError('没有录到声音，请重新录音'); return; }
        const url = URL.createObjectURL(blob);
        voiceUrlRef.current = url;
        setVoicePreviewUrl(url);
        setIntercomStatus('preview');
        onShowToast('录音已生成，可在卡片中试听；尚未发送给好友');
      };
      recorder.onerror = () => {
        intercomSessionRef.current += 1;
        recorder.onstop = null;
        if (recorder.state !== 'inactive') recorder.stop();
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        if (intercomTimerRef.current) clearInterval(intercomTimerRef.current);
        intercomTimerRef.current = null;
        setInternalIntercom(false);
        intercomChangeRef.current?.(false);
        setIntercomStatus('error');
        setIntercomError('录音中断，请检查麦克风后重试');
      };
      if (voiceUrlRef.current) URL.revokeObjectURL(voiceUrlRef.current);
      voiceUrlRef.current = null;
      setVoicePreviewUrl(null);
      recorder.start();
      const startedAt = Date.now();
      setIntercomStatus('recording');
      setInternalIntercom(true);
      intercomChangeRef.current?.(true);
      haptics.trigger('heavy');
      soundEffects.playWalkieTalkieStart();
      intercomTimerRef.current = setInterval(() => {
        const seconds = Math.floor((Date.now() - startedAt) / 1000);
        setIntercomSeconds(seconds);
        if (seconds >= 180) handleStopIntercom();
      }, 1000);
    } catch (error) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
      if (session !== intercomSessionRef.current) return;
      const denied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError');
      const message = denied ? '麦克风未授权，录音未开始' : '无法打开麦克风，请检查设备后重试';
      setIntercomStatus('error');
      setIntercomError(message);
      onShowToast(message);
    }
  }, [intercomStatus, handleStopIntercom, onShowToast]);

  useEffect(() => {
    const stopWhenHidden = () => { if (document.hidden) handleStopIntercom(); };
    document.addEventListener('visibilitychange', stopWhenHidden);
    window.addEventListener('pagehide', handleStopIntercom);
    return () => {
      document.removeEventListener('visibilitychange', stopWhenHidden);
      window.removeEventListener('pagehide', handleStopIntercom);
    };
  }, [handleStopIntercom]);

  // 1. 活动管理：催催集合
  const handleRushAssemble = useCallback(() => {
    haptics.trigger('heavy');
    soundEffects.playTapSound();
    setKnockCount((prev) => prev + 1);
    const actTitle = activityContext?.activity.title.split('·')[0] || '活动';
    onShowToast(`🔔 已向【${friend.name}】发送活动集合催促提醒！预计5分钟内到达。`);
    if (onAddNotification) {
      onAddNotification({
        id: `act-rush-${Date.now()}`,
        title: `活动集合催促`,
        content: `已向 ${friend.name} 发送「${actTitle}」集合催促，当前定位显示正在赶往集合点。`,
        time: '刚刚',
        unread: true,
        type: 'system',
      });
    }
  }, [activityContext?.activity.title, friend.name, onAddNotification, onShowToast]);

  // 轨迹追踪 / 互动轨迹 (打开好友24小时内的活动轨迹)
  const handleOpenTrajectory = useCallback(() => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    onClose();
    if (onOpenTrajectory) {
      onOpenTrajectory(friend);
    } else {
      onShowToast(`🗺️ 打开【${friend.name}】24小时活动轨迹`);
    }
  }, [friend, onClose, onOpenTrajectory, onShowToast]);

  // 2. 活动管理：轨迹追踪
  const handleTrackTrajectory = useCallback(() => {
    handleOpenTrajectory();
  }, [handleOpenTrajectory]);

  // 3. 活动管理：确认到场 / 代签到
  const handleToggleArrival = useCallback(() => {
    const nextArrived = !isParticipantArrived;
    setIsParticipantArrived(nextArrived);
    haptics.trigger(nextArrived ? 'success' : 'medium');
    soundEffects.playTapSound();
    if (activityContext?.onToggleParticipantArrival) {
      activityContext.onToggleParticipantArrival(activityContext.activity.id, activityContext.participant.id);
    }
    onShowToast(
      nextArrived
        ? `✅ 已为【${friend.name}】成功签到，状态已更新为「已在现场集合」！`
        : `已更新【${friend.name}】状态为「在途中赶往」🚗`
    );
  }, [activityContext, friend.name, isParticipantArrived, onShowToast]);

  // 4. 活动管理：活动私信
  const handleActivityChat = useCallback(() => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    onClose();
    onOpenChat(friend.id);
  }, [friend.id, onClose, onOpenChat]);

  // 5. 活动管理：权限管理 (组员 -> 核心 -> 管理员)
  const handleCycleRole = useCallback(() => {
    const roleCycle: ('admin' | 'core' | 'member')[] = ['member', 'core', 'admin'];
    const nextIdx = (roleCycle.indexOf(participantRole) + 1) % roleCycle.length;
    const nextRole = roleCycle[nextIdx];
    setParticipantRole(nextRole);
    haptics.trigger('medium');
    soundEffects.playTapSound();
    if (activityContext?.onUpdateParticipantRole) {
      activityContext.onUpdateParticipantRole(activityContext.activity.id, activityContext.participant.id, nextRole);
    }
    const roleLabel = nextRole === 'admin' ? '👑 活动管理员' : nextRole === 'core' ? '⭐ 核心组员' : '👥 普通组员';
    onShowToast(`已更新【${friend.name}】在活动中的角色为：${roleLabel}`);
  }, [activityContext, friend.name, participantRole, onShowToast]);

  // 6. 活动管理：路线护航 / 组队接送
  const handleRouteEscort = useCallback(() => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    onShowToast(`🚗 已规划前往接应【${friend.name}】的最佳护航路线`);
    onNavigate(friend.lat, friend.lng, `接应·${friend.name}`);
    onClose();
  }, [friend.lat, friend.lng, friend.name, onClose, onNavigate, onShowToast]);

  // 活动任务分配切换
  const handleToggleTask = useCallback((taskName: string) => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    setAssignedTasks((prev) => {
      const exists = prev.includes(taskName);
      const next = exists ? prev.filter((t) => t !== taskName) : [...prev, taskName];
      if (activityContext?.onAssignTask) {
        activityContext.onAssignTask(activityContext.activity.id, activityContext.participant.id, taskName);
      }
      onShowToast(exists ? `已取消【${friend.name}】的「${taskName}」任务` : `📌 已将「${taskName}」任务分派给【${friend.name}】`);
      return next;
    });
  }, [activityContext, friend.name, onShowToast]);

  // Relationship Tag and Ring Styles
  const relationshipTag = useMemo(() => {
    switch (currentRelationship) {
      case 'close':
        return { label: '密友', icon: '⭐', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700' };
      case 'family':
        return { label: '家人', icon: '🏠', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700' };
      case 'muted':
        return { label: '静音', icon: '🔕', color: 'text-gray-500 bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700' };
      case 'hidden':
        return { label: '隐藏', icon: '👻', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700' };
      default:
        return { label: '好友', icon: '👥', color: 'text-[#1877F2] bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' };
    }
  }, [currentRelationship]);

  const ringStyle = useMemo(() => {
    // 头像边框从白色变成紫色呼吸标识被选中 (Purple breathing ring identifier)
    return 'border-2 border-white ring-4 ring-purple-600 ring-offset-2 ring-offset-white/90 dark:ring-offset-zinc-900 shadow-[0_0_24px_rgba(147,51,234,0.55)] animate-pulse';
  }, []);

  return (
    <div
      ref={containerRef}
      id="friend-interactive-overlay"
      className="absolute inset-0 z-40 overflow-hidden pointer-events-none select-none"
    >
      {/* 1. Transparent Tap Outside Area (No dark backdrop, keeps real map crystal clear) */}
      <div
        onClick={onClose}
        className="absolute inset-x-0 top-0 bottom-[340px] pointer-events-auto cursor-default z-10"
        aria-label="点击地图空白区域关闭操作卡片"
      />

      {/* 2. Shutter flash effect for quick snap */}
      {isSnapping && (
        <motion.div
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute inset-0 bg-white z-50 pointer-events-none"
        />
      )}

      {/* 3. Sub-Modals: Door Knock Modal & Quick Snap Modal */}
      {isKnockModalOpen && (
        <DoorKnockModal
          isOpen={isKnockModalOpen}
          friend={friend}
          onClose={() => setIsKnockModalOpen(false)}
          onShowToast={onShowToast}
          onAddNotification={onAddNotification}
        />
      )}

      {isCameraOpen && (
        <QuickSnapCameraModal
          isOpen={isCameraOpen}
          friend={friend}
          onClose={() => setIsCameraOpen(false)}
          onSendSnap={handleSendCameraSnap}
        />
      )}

      {/* 3.1 Sub-Modal: Footprint Share Modal (足迹分享弹窗) */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none pointer-events-auto">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#E4E6EB] dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#1877F2]/10 dark:bg-[#1877F2]/20 flex items-center justify-center text-[#1877F2]">
                    <Share2 size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#050505] dark:text-[#E4E6EB]">
                      {isUserSelf ? '分享个人位置与足迹' : '分享足迹给好友'}
                    </h3>
                    <p className="text-[9.5px] text-[#65676B] dark:text-zinc-400">
                      {isUserSelf ? '将您的实时位置或近期去过的地方分享给好友' : `${friend.name} · 近期去过的地方`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Modal Body / Preview Card */}
              <div className="p-3 overflow-y-auto max-h-[68vh]">
                {/* 1. Current Live Location Quick Share */}
                <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-md p-2 mb-2.5 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <MapPin size={13} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-[11px] font-black text-[#050505] dark:text-white truncate">
                          兰州市城关区 东方红广场
                        </span>
                        <span className="text-[8.5px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold px-1 rounded">
                          实时GPS
                        </span>
                      </div>
                      <p className="text-[9px] text-[#65676B] dark:text-zinc-400 truncate">
                        电量 98% · 移动速度 35km/h · 随时在线
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleShareCurrentLocation}
                    className="shrink-0 ml-2 px-2.5 py-1 bg-[#31A24C] hover:bg-[#28843F] text-white rounded text-[10px] font-bold shadow-2xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    分享实时位置
                  </button>
                </div>

                {/* 2. Quick Recipient Selection (一键分享给指定好友) */}
                <div className="mb-2.5">
                  <div className="flex items-center justify-between mb-1 px-0.5">
                    <span className="text-[10.5px] font-bold text-[#65676B] dark:text-zinc-400">
                      选择分享目标好友
                    </span>
                    <span className="text-[9px] text-[#31A24C] font-semibold">
                      快速私发
                    </span>
                  </div>
                  <div className="space-y-1">
                    {SHAREABLE_FRIENDS.map((f, fIdx) => (
                      <div
                        key={`share-friend-${f.id}-${fIdx}`}
                        className="flex items-center justify-between p-1.5 bg-[#F7F8FA] dark:bg-zinc-800/80 border border-[#E4E6EB] dark:border-zinc-700/60 rounded hover:border-[#31A24C]/50 transition-colors"
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <img
                            src={f.avatar}
                            alt={f.name}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-[#31A24C]/30 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-[#050505] dark:text-white truncate block leading-tight">
                              {f.name}
                            </span>
                            <span className="text-[9px] text-[#65676B] dark:text-zinc-400 leading-tight">
                              {f.tag} · {f.distance} · {f.status}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleShareToTargetFriend(f)}
                          className="px-2.5 py-1 bg-[#31A24C] hover:bg-[#28843F] text-white rounded text-[9.5px] font-bold shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0 ml-1.5 whitespace-nowrap"
                        >
                          分享给TA
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Preview Card (Facebook Style) */}
                <div className="bg-[#F7F8FA] dark:bg-zinc-800/80 border border-[#E4E6EB] dark:border-zinc-700 rounded-md p-2.5 mb-3 shadow-2xs">
                  <div className="flex items-center space-x-2 pb-2 border-b border-[#E4E6EB] dark:border-zinc-700/60">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-[#1877F2]/30"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-black text-[#050505] dark:text-white truncate">
                          {isUserSelf ? '我 (Alexia)' : friend.name}
                        </span>
                        <span className="text-[9px] bg-blue-50 dark:bg-zinc-700 text-[#1877F2] dark:text-blue-400 font-bold px-1.5 py-0.2 rounded">
                          {selectedPlaceToShare ? '单点足迹' : '近3天轨迹'}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#65676B] dark:text-zinc-400 truncate">
                        {friend.locationName || '甘肃省 · 兰州市城关区'}
                      </p>
                    </div>
                  </div>

                  {/* Places list in preview */}
                  {selectedPlaceToShare ? (
                    <div className="pt-2">
                      <div className="flex items-start space-x-2 bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded p-2">
                        <span className="text-lg shrink-0">{selectedPlaceToShare.icon || '📍'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11.5px] font-black text-[#050505] dark:text-white truncate">
                              {selectedPlaceToShare.name}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              {selectedPlaceToShare.stayDuration}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-[#1877F2] font-semibold mt-0.5">
                            {selectedPlaceToShare.time}
                          </p>
                          <p className="text-[9px] text-[#65676B] dark:text-zinc-400 mt-1">
                            {selectedPlaceToShare.summary || selectedPlaceToShare.address}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPlaceToShare(null)}
                        className="mt-1.5 text-[10px] text-[#1877F2] hover:underline cursor-pointer flex items-center justify-center w-full"
                      >
                        切换为分享全部 4 处足迹 ›
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 space-y-1.5">
                      {visitedPlaces.map((p, pIdx) => (
                        <div
                          key={`vis-place-${p.id}-${pIdx}`}
                          className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700/60 rounded px-2 py-1.5"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-sm shrink-0">{p.icon || '📍'}</span>
                            <div className="min-w-0">
                              <p className="text-[10.5px] font-bold text-[#050505] dark:text-white truncate">
                                {p.name}
                              </p>
                              <p className="text-[9px] text-[#65676B] dark:text-zinc-400">
                                {p.time} · {p.stayDuration}
                              </p>
                            </div>
                          </div>
                          <span className="text-[8.5px] text-[#1877F2] bg-blue-50 dark:bg-zinc-800 px-1 py-0.5 rounded font-bold shrink-0 ml-1">
                            {p.category || '打卡'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4 Share Options */}
                <div className="space-y-1.5">
                  {/* Option 1: Send to DM */}
                  <button
                    type="button"
                    onClick={handleShareToChat}
                    className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white py-2 px-3 rounded-md text-xs font-bold flex items-center justify-center space-x-1.5 shadow-2xs active:scale-98 transition-all cursor-pointer"
                  >
                    <Send size={13} />
                    <span>发送到好友私聊</span>
                  </button>

                  {/* Option 2: Copy Footprint Text */}
                  <button
                    type="button"
                    onClick={handleCopyFootprintText}
                    className="w-full bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] text-[#050505] dark:text-[#E4E6EB] py-2 px-3 rounded-md text-xs font-bold flex items-center justify-center space-x-1.5 shadow-2xs active:scale-98 transition-all cursor-pointer"
                  >
                    {isCopied ? <CheckCheck size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{isCopied ? '已复制足迹清单至剪贴板' : '复制足迹文本清单'}</span>
                  </button>

                  {/* Option 3 & 4: Share to Group and Poster */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={handleShareToGroup}
                      className="bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] text-[#050505] dark:text-[#E4E6EB] py-1.5 px-2 rounded-md text-[11px] font-bold flex items-center justify-center space-x-1 shadow-2xs active:scale-98 transition-all cursor-pointer"
                    >
                      <Users size={12} className="text-purple-500" />
                      <span>发到小队群聊</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGeneratePoster}
                      className="bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] text-[#050505] dark:text-[#E4E6EB] py-1.5 px-2 rounded-md text-[11px] font-bold flex items-center justify-center space-x-1 shadow-2xs active:scale-98 transition-all cursor-pointer"
                    >
                      <Image size={12} className="text-amber-500" />
                      <span>保存精美海报</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-2 border-t border-[#E4E6EB] dark:border-zinc-800 bg-[#F7F8FA] dark:bg-zinc-900 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-3 py-1 rounded text-xs font-bold text-[#65676B] hover:text-[#050505] dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Local Floating Action Particles (Centered near Avatar) */}
      {localParticles.map((p, pIdx) => (
        <motion.div
          key={`loc-particle-${p.id}-${pIdx}`}
          initial={{
            opacity: 1,
            x: safeAvatarCenterX + p.x * 0.3,
            y: safeAvatarCenterY + p.y * 0.3,
            scale: 0.4,
          }}
          animate={{
            opacity: [1, 0.9, 0],
            x: safeAvatarCenterX + p.x,
            y: safeAvatarCenterY + p.y - 30,
            scale: [0.4, 1.4, 0.8],
          }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          className="absolute z-45 text-3xl pointer-events-none select-none drop-shadow-md"
        >
          {p.text}
        </motion.div>
      ))}

      {/* 5. 3D Knock Fist Gestures ✊ */}
      {knockFists.map((fist, fistIdx) => (
        <motion.div
          key={`knock-fist-${fist.id}-${fistIdx}`}
          initial={{
            opacity: 0,
            x: safeAvatarCenterX + fist.x,
            y: safeAvatarCenterY + fist.y + 30,
            scale: 0.3,
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: safeAvatarCenterX + fist.x,
            y: [safeAvatarCenterY + fist.y + 30, safeAvatarCenterY + fist.y - 20, safeAvatarCenterY + fist.y - 45],
            scale: [0.3, 1.3, 0.9],
          }}
          transition={{ duration: 0.95, times: [0, 0.2, 0.8, 1], ease: 'easeOut' }}
          className="absolute z-45 pointer-events-none flex flex-col items-center justify-center select-none"
        >
          <span className="text-5xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]">
            ✊
          </span>
          <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-md">
            {fist.text} x{fist.combo}
          </span>
        </motion.div>
      ))}

      {/* 6. Parabolic Flying Emojis Layer */}
      {flyingEmojis.map((item, itemIdx) => {
        const deltaX = item.targetX - item.startX;
        const deltaY = item.targetY - item.startY;
        const midX = item.startX + deltaX * 0.5 + (deltaX >= 0 ? -24 : 24);
        const midY = Math.min(item.startY, item.targetY) - 85;

        return (
          <React.Fragment key={`fly-emoji-${item.id}-${itemIdx}`}>
            {/* Flying Emoji - parabolic arc converging directly to friend avatar center */}
            <motion.div
              initial={{ x: item.startX, y: item.startY, scale: prefersReducedMotion ? 0.6 : 1, opacity: 0.95 }}
              animate={{
                x: [item.startX, midX, item.targetX],
                y: [item.startY, midY, item.targetY],
                scale: [0.65, 1.45, 1.15, 0.4],
                rotate: [0, 160, 360],
                opacity: [0.95, 1, 1, 0],
              }}
              transition={{ duration: prefersReducedMotion ? 0.05 : 0.48, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-48 text-3xl pointer-events-none select-none drop-shadow-md -translate-x-1/2 -translate-y-1/2"
            >
              <BumpSticker emoji={item.emoji} size={90} />
            </motion.div>
          </React.Fragment>
        );
      })}

      {/* Hero Avatar on Map is displayed directly on the map marker, no duplicate modal avatar */}





      {/* 8. Floating Arcade-Style Emoji Combo Counter (表情连击数字与音效) */}
      <AnimatePresence>
        {comboInfo.active && comboInfo.count > 0 && (
          <motion.div
            key={`combo-${comboInfo.scaleKey}`}
            initial={{ scale: 0.3, opacity: 0, y: 15 }}
            animate={{
              scale: [0.3, 1.4, 1.12],
              opacity: [0, 1, 1],
              y: [15, -30, -22],
              rotate: [-12, 6, -3],
            }}
            exit={{ scale: 0.7, opacity: 0, y: -50 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute z-50 pointer-events-none select-none flex flex-col items-center"
            style={{
              left: `${(avatarAnchor?.x ?? safeAvatarCenterX) + avatarSize * 0.45}px`,
              top: `${(avatarAnchor?.y ?? safeAvatarCenterY) - avatarSize * 0.55}px`,
            }}
          >
            <span className="bump-combo-count">{comboInfo.count}x</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. Waving Greet Pulse Shockwaves & Hand Overlay (打招呼动效) */}
      {isGreetingWaving && (
        <div
          className="absolute pointer-events-none z-35 flex items-center justify-center"
          style={{
            left: `${safeAvatarCenterX}px`,
            top: `${safeAvatarCenterY}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Concentric Expanding Ripple Waves */}
          {[0, 1, 2].map((waveIdx) => (
            <motion.div
              key={`greet-wave-${waveIdx}`}
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 2.7, opacity: 0 }}
              transition={{
                duration: 1.1,
                ease: 'easeOut',
                delay: waveIdx * 0.2,
                repeat: 1,
              }}
              className="absolute rounded-full border-2 border-[#1877F2]/60 dark:border-blue-400/60"
              style={{
                width: `${avatarSize}px`,
                height: `${avatarSize}px`,
              }}
            />
          ))}

          {/* Waving Hand Gesture */}
          <motion.div
            initial={{ scale: 0.4, rotate: 0, opacity: 0 }}
            animate={{
              scale: [0.4, 1.4, 1.2, 1.3, 0.9],
              rotate: [0, -35, 30, -30, 20, -15, 0],
              opacity: [0, 1, 1, 1, 0],
              y: [-10, -50, -45],
            }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="absolute text-5xl filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] select-none z-45"
          >
            👋
          </motion.div>

          {/* Floating Callout Text */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: -75, scale: 1.1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="absolute z-45 px-3.5 py-1 bg-[#1877F2] text-white text-xs font-black rounded-full shadow-lg whitespace-nowrap"
          >
            👋 挥手打招呼!
          </motion.div>
        </div>
      )}

      {!activityContext && <BumpFriendDock friend={friend} userLocation={userLocation} friendCount={friendCount}
        onLaunch={launchFlyingEmoji} onOpenChat={handleActivityChat} onSendText={onSendText}
        onOpenCanvasChat={appearance => { onClose(); if (onOpenCanvasChat) onOpenCanvasChat(friend.id, appearance); else onOpenChat(friend.id); }}
        onCamera={() => setIsCameraOpen(true)} onClose={onClose} onKnock={handleKnock} onGreet={handleGreet} onBump={handleBump}
        relationship={currentRelationship} onRelationshipChange={onUpdateFriendRelationship ? handleSelectRelationship : undefined}
        onNavigate={handleStartNav} onTrajectory={handleOpenTrajectory} onAddFriend={onAddFriend} onGhost={onGhost} onProfile={onProfile} onShowToast={onShowToast} />}
      {/* 8. Refined Social Interaction Console (Slide from bottom) */}
      {activityContext &&
      <motion.div
        key="action-console-tray"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0.01 }
            : { type: 'spring', stiffness: 360, damping: 30, delay: 0.1 }
        }
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto bg-[#F7F8FA] dark:bg-zinc-900 rounded-t-2xl px-3 pt-2 pb-[calc(6px+var(--sab,0px))] shadow-[0_-12px_36px_rgba(0,0,0,0.18)] border-t border-x border-[#E4E6EB] dark:border-zinc-800"
      >
        {/* Drag Indicator Pill */}
        <div className="w-10 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto mb-1.5" />

        {/* Top Handle & Header Bar */}
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center space-x-1.5 text-[#050505] dark:text-[#E4E6EB] text-[11.5px] font-bold">
            {activityContext ? (
              <>
                <Activity size={14} className="text-[#1877F2] animate-pulse shrink-0" />
                <span className="text-[#1877F2] font-black truncate max-w-[170px] sm:max-w-[210px]">
                  【{activityContext.activity.title.split('·')[0]}】活动管理
                </span>
                <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 shrink-0">
                  · 成员导航
                </span>
              </>
            ) : (
              <>
                <Radio size={14} className="text-[#1877F2] animate-pulse shrink-0" />
                <span className="font-bold">好友互动操作台</span>
                <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400">
                  · {friend.name}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-1.5 relative shrink-0">
            {activityContext ? (
              /* Participant Role Toggle Pill */
              <button
                type="button"
                id="modal-activity-role-btn"
                onClick={handleCycleRole}
                className="flex items-center space-x-1 px-2 py-0.8 bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 rounded-md text-[11px] font-extrabold text-[#050505] dark:text-[#E4E6EB] hover:border-[#1877F2] cursor-pointer shadow-2xs transition-colors"
                title="点击切换成员活动角色"
              >
                <span>{participantRole === 'admin' ? '👑 管理员' : participantRole === 'core' ? '⭐ 核心' : '👥 组员'}</span>
              </button>
            ) : (
              /* Relationship selector pill */
              <div className="relative">
                <button
                  type="button"
                  id="modal-relation-toggle-btn"
                  onClick={() => setIsRelationDropdownOpen((prev) => !prev)}
                  className="flex items-center space-x-1 px-2 py-0.8 bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 rounded-md text-[11px] font-bold text-[#050505] dark:text-[#E4E6EB] hover:border-[#1877F2]/60 cursor-pointer shadow-2xs"
                  title="更改与好友的关系标签"
                >
                  <span>{relationshipTag.icon}</span>
                  <span>{relationshipTag.label}</span>
                  <ChevronDown size={12} className="text-gray-400 ml-0.5" />
                </button>

                {/* Relationship Dropdown Menu */}
                {isRelationDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-lg z-50 py-1 flex flex-col text-xs font-bold pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => handleSelectRelationship('close')}
                      className="px-3 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center space-x-1.5 cursor-pointer text-amber-500"
                    >
                      <span>⭐</span>
                      <span>设为密友</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectRelationship('family')}
                      className="px-3 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center space-x-1.5 cursor-pointer text-rose-500"
                    >
                      <span>🏠</span>
                      <span>设为家人</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectRelationship('normal')}
                      className="px-3 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center space-x-1.5 cursor-pointer text-[#1877F2]"
                    >
                      <span>👥</span>
                      <span>普通好友</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectRelationship('muted')}
                      className="px-3 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center space-x-1.5 cursor-pointer text-gray-500"
                    >
                      <span>🔕</span>
                      <span>静音通知</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectRelationship('hidden')}
                      className="px-3 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center space-x-1.5 cursor-pointer text-purple-500"
                    >
                      <span>👻</span>
                      <span>隐身隐藏</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              id="modal-close-tray-btn"
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#65676B] hover:text-[#050505] dark:text-zinc-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#E4E6EB] dark:border-zinc-700"
              title="关闭互动操作台"
              aria-label="关闭互动操作台"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Integrated Navigation Cockpit (一体化罗盘与方位仪表区 - 仅在活动中出现) */}
        {activityContext && (
          <div className="flex items-center justify-between gap-2 mb-2 p-1.5 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-lg border border-[#E4E6EB] dark:border-zinc-700/80 shadow-2xs">
            {/* Left Card: 目标方位 */}
            <div
              onClick={() => {
                haptics.trigger('light');
                soundEffects.playTapSound();
                onShowToast(`🧭 目标方位：${compassDirectionText}，正朝向目标方向`);
              }}
              className="flex-1 min-w-[76px] bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700/60 rounded-md p-2 flex flex-col items-center justify-center cursor-pointer hover:border-[#1877F2]/60 transition-all shadow-2xs group select-none active:scale-97"
              title="点击查看目标方位指引"
            >
              <div className="flex items-center space-x-1 text-[#65676B] dark:text-zinc-400 mb-0.5">
                <Compass size={12} className="text-[#1877F2] group-hover:rotate-45 transition-transform" />
                <span className="text-[10px] font-bold">目标方位</span>
              </div>
              <span className="text-[14px] font-black text-[#050505] dark:text-white font-mono tracking-tight leading-tight">
                {Math.round(compassBearing)}°
              </span>
              <span className="text-[9.5px] font-extrabold text-[#1877F2] mt-0.5">
                {compassDirectionText.split(' ')[0]}偏向
              </span>
            </div>

            {/* Center: Apple UI Dynamic Frosted Glass Compass (苹果级动态毛玻璃大罗盘) */}
            <div
              id="modal-embedded-circular-compass"
              onClick={() => {
                haptics.trigger('medium');
                soundEffects.playTapSound();
                onShowToast(`🧭 苹果级罗盘已精准锁定【${friend.name}】：${compassDirectionText} · 距离 ${friend.distance || '620m'}`);
              }}
              className="relative w-[122px] h-[122px] sm:w-[130px] sm:h-[130px] shrink-0 rounded-full backdrop-blur-2xl bg-white/45 dark:bg-black/55 border border-white/80 dark:border-white/20 ring-1 ring-black/5 dark:ring-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.18),0_2px_10px_rgba(24,119,242,0.2),inset_0_1.5px_2px_rgba(255,255,255,0.9),inset_0_-1.5px_2px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform duration-200 group select-none hover:shadow-[0_12px_28px_rgba(24,119,242,0.28)] overflow-hidden"
              title={`苹果UI动态透明罗盘：精准指向【${friend.name}】(${compassDirectionText})`}
            >
              {/* 1. Dynamic Glass Glare & Radial Vignette Background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/25 via-transparent to-white/55 dark:from-white/5 dark:to-white/10 pointer-events-none rounded-full" />
              <div className="absolute inset-[3px] rounded-full border border-black/5 dark:border-white/10 pointer-events-none" />

              {/* 2. Apple Compass Instrument SVG Dial Rim (72 精确刻度圈) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="74" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-gray-300/80 dark:text-zinc-700/80" />
                <circle cx="80" cy="80" r="63" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" className="text-gray-300/60 dark:text-zinc-700/60" />

                {compassTicks.map((t, tIdx) => (
                  <line
                    key={`compass-tick-${t.deg}-${tIdx}`}
                    x1="80"
                    y1={80 - 74}
                    x2="80"
                    y2={80 - 74 + t.length}
                    stroke={t.strokeColor}
                    strokeWidth={t.strokeWidth}
                    strokeLinecap="round"
                    transform={`rotate(${t.deg} 80 80)`}
                  />
                ))}

                <line x1="80" y1="58" x2="80" y2="102" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" className="text-gray-400/50 dark:text-zinc-600/50" />
                <line x1="58" y1="80" x2="102" y2="80" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" className="text-gray-400/50 dark:text-zinc-600/50" />
              </svg>

              {/* 3. Cardinal & Intercardinal Typography */}
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-[#FF3B30] tracking-wider leading-none select-none drop-shadow-2xs">
                N
              </span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-black text-zinc-600 dark:text-zinc-300 tracking-wider leading-none select-none">
                S
              </span>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-600 dark:text-zinc-300 tracking-wider leading-none select-none">
                W
              </span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-600 dark:text-zinc-300 tracking-wider leading-none select-none">
                E
              </span>

              {/* Intercardinal Labels */}
              <span className="absolute top-5 right-5 text-[6.5px] font-bold text-zinc-400 dark:text-zinc-500 leading-none select-none">NE</span>
              <span className="absolute bottom-5.5 right-5 text-[6.5px] font-bold text-zinc-400 dark:text-zinc-500 leading-none select-none">SE</span>
              <span className="absolute bottom-5.5 left-5 text-[6.5px] font-bold text-zinc-400 dark:text-zinc-500 leading-none select-none">SW</span>
              <span className="absolute top-5 left-5 text-[6.5px] font-bold text-zinc-400 dark:text-zinc-500 leading-none select-none">NW</span>

              {/* 4. Apple Dynamic 3D Faceted Needle Assembly */}
              <motion.div
                className="w-full h-full absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{ rotate: compassBearing }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0.01 }
                    : { type: 'spring', stiffness: 140, damping: 15 }
                }
              >
                <div className="absolute top-3 w-7 h-16 bg-gradient-to-t from-transparent via-[#1877F2]/10 to-[#1877F2]/30 rounded-t-full filter blur-[1.5px] animate-pulse pointer-events-none" />

                {/* North Point: Two-Faceted 3D Apple/Meta Blue Needle */}
                <div className="absolute top-4 flex items-end drop-shadow-[0_4px_8px_rgba(24,119,242,0.45)]">
                  <div className="w-0 h-0 border-r-[5.5px] border-r-transparent border-b-[50px] border-b-[#1877F2]" />
                  <div className="w-0 h-0 border-l-[5.5px] border-l-transparent border-b-[50px] border-b-[#0B4DB8]" />
                </div>

                {/* South Point: Two-Faceted Metallic Needle */}
                <div className="absolute bottom-5 flex items-start drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                  <div className="w-0 h-0 border-r-[4.5px] border-r-transparent border-t-[38px] border-t-white/95 dark:border-t-zinc-200" />
                  <div className="w-0 h-0 border-l-[4.5px] border-l-transparent border-t-[38px] border-t-zinc-300 dark:border-t-zinc-600" />
                </div>

                {/* Precision Center Machined Pivot & Jewel */}
                <div className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-200 via-white to-zinc-300 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-800 border border-white/90 dark:border-zinc-500 shadow-md flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0A4BB8] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.8)] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white shadow-2xs" />
                  </div>
                </div>
              </motion.div>

              {/* 5. Apple UI Top Floating HUD */}
              <div className="absolute top-7.5 z-20 flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-white/75 dark:bg-zinc-900/75 backdrop-blur-md border border-white/80 dark:border-zinc-700 shadow-2xs pointer-events-none">
                <span className="text-[9px] font-black text-[#1C1E21] dark:text-white font-mono leading-none">
                  {Math.round(compassBearing)}°
                </span>
                <div className="w-[1px] h-2 bg-gray-300 dark:bg-zinc-600" />
                <span className="text-[8.5px] font-black text-[#1877F2] leading-none">
                  {compassDirectionText.split(' ')[0]}
                </span>
              </div>

              {/* 6. Apple UI Bottom Floating HUD */}
              <div className="absolute bottom-7.5 z-20 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-white/90 dark:border-zinc-700 shadow-2xs pointer-events-none">
                <span className="text-[8.5px] font-black text-[#1877F2] tracking-tight leading-none">
                  📍 {friend.distance || '620m'}
                </span>
              </div>
            </div>

            {/* Right Card: 目标距离与预计用时 */}
            <div
              onClick={() => {
                haptics.trigger('light');
                soundEffects.playTapSound();
                onShowToast(`📍 距离【${friend.name}】约 ${friend.distance || '620m'}，步行预计需 11 分钟`);
              }}
              className="flex-1 min-w-[76px] bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700/60 rounded-md p-2 flex flex-col items-center justify-center cursor-pointer hover:border-[#1877F2]/60 transition-all shadow-2xs group select-none active:scale-97"
              title="点击查看直线距离与时间"
            >
              <div className="flex items-center space-x-1 text-[#65676B] dark:text-zinc-400 mb-0.5">
                <Navigation size={12} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">目标距离</span>
              </div>
              <span className="text-[14px] font-black text-[#050505] dark:text-white font-mono tracking-tight leading-tight">
                {friend.distance || '620m'}
              </span>
              <span className="text-[9.5px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                步行约11分
              </span>
            </div>
          </div>
        )}

        {/* 5 Main Action Buttons: Activity Management Buttons or Standard Social Buttons */}
        {activityContext ? (
          <div className="grid grid-cols-5 gap-1 sm:gap-1.5 mb-1.5">
            {/* 1. 催催集合 */}
            <button
              type="button"
              id="action-btn-rush-assemble"
              onClick={handleRushAssemble}
              className="bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] rounded-md p-1.5 flex flex-col items-center justify-center space-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.06)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer min-h-[50px] select-none text-[#050505] dark:text-[#E4E6EB]"
              title="发送集合催促提醒"
            >
              <Bell size={18} className="text-amber-500" />
              <span className="text-[10px] font-bold leading-none">催催集合</span>
            </button>

            {/* 2. 轨迹追踪 */}
            <button
              type="button"
              id="action-btn-track-trajectory"
              onClick={handleTrackTrajectory}
              className="bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] rounded-md p-1.5 flex flex-col items-center justify-center space-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.06)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer min-h-[50px] select-none text-[#050505] dark:text-[#E4E6EB]"
              title="查验实时轨迹路线"
            >
              <Footprints size={18} className="text-[#1877F2]" />
              <span className="text-[10px] font-bold leading-none">轨迹追踪</span>
            </button>

            {/* 3. 确认到场 / 代签到 */}
            <button
              type="button"
              id="action-btn-confirm-arrival"
              onClick={handleToggleArrival}
              className={`border rounded-md p-1.5 flex flex-col items-center justify-center space-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.06)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer min-h-[50px] select-none ${
                isParticipantArrived
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-zinc-800 border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] text-[#050505] dark:text-[#E4E6EB]'
              }`}
              title={isParticipantArrived ? '已确认就位 (点击撤销)' : '代为确认到场'}
            >
              <CheckCircle2 size={18} className={isParticipantArrived ? 'text-emerald-600' : 'text-[#65676B]'} />
              <span className="text-[10px] font-bold leading-none">
                {isParticipantArrived ? '已到场' : '确认到场'}
              </span>
            </button>

            {/* 4. 活动私信 */}
            <button
              type="button"
              id="action-btn-activity-chat"
              onClick={handleActivityChat}
              className="bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] rounded-md p-1.5 flex flex-col items-center justify-center space-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.06)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer min-h-[50px] select-none text-[#050505] dark:text-[#E4E6EB]"
              title="与成员活动私聊"
            >
              <MessageCircle size={18} className="text-[#1877F2]" />
              <span className="text-[10px] font-bold leading-none">活动私信</span>
            </button>

            {/* 5. 权限管理 */}
            <button
              type="button"
              id="action-btn-role-management"
              onClick={handleCycleRole}
              className="bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-purple-500 rounded-md p-1.5 flex flex-col items-center justify-center space-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.06)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer min-h-[50px] select-none text-[#050505] dark:text-[#E4E6EB]"
              title="切换活动权限与角色"
            >
              <ShieldAlert size={18} className="text-purple-600" />
              <span className="text-[10px] font-bold leading-none">管理权限</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5">
            {/* 1. 打招呼 */}
            <button
              type="button"
              id="action-btn-greet"
              onClick={handleGreet}
              className="bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/60 rounded-md p-1.5 flex flex-col items-center justify-center space-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.06)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer min-h-[50px] select-none text-[#050505] dark:text-[#E4E6EB]"
              aria-label="打招呼"
            >
              <Hand size={18} className="text-[#1877F2]" />
              <span className="text-[10px] font-bold leading-none">打招呼</span>
            </button>

            {/* 2. 碰一碰 */}
            <button
              type="button"
              id="action-btn-bump"
              onClick={handleBump}
              className="bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/60 rounded-md p-1.5 flex flex-col items-center justify-center space-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.06)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer min-h-[50px] select-none text-[#050505] dark:text-[#E4E6EB]"
              aria-label="碰一碰"
            >
              <Flame size={18} className="text-[#F97316]" />
              <span className="text-[10px] font-bold leading-none">碰一碰</span>
            </button>

            {/* 3. 互动轨迹 */}
            <button
              type="button"
              id="action-btn-friend-trajectory"
              onClick={handleOpenTrajectory}
              className="bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/60 rounded-md p-1.5 flex flex-col items-center justify-center space-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.06)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer min-h-[50px] select-none text-[#050505] dark:text-[#E4E6EB]"
              aria-label="好友互动轨迹"
              title="查看好友24小时内的活动轨迹"
            >
              <Footprints size={18} className="text-[#1877F2]" />
              <span className="text-[10px] font-bold leading-none">互动轨迹</span>
            </button>

            {/* 4. 催一催 (No nested buttons) */}
            <button
              type="button"
              id="action-btn-knock"
              onClick={handleKnock}
              className="relative bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/60 rounded-md p-1.5 flex flex-col items-center justify-center space-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.06)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer min-h-[50px] select-none text-[#050505] dark:text-[#E4E6EB]"
              aria-label="催一催"
            >
              {knockCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-amber-500 text-white rounded-full px-1 text-[8.5px] font-black leading-tight">
                  {knockCount}
                </span>
              )}
              <DoorOpen size={18} className="text-[#D97706]" />
              <span className="text-[10px] font-bold leading-none">催一催</span>
            </button>

            {/* 5. 速拍 */}
            <button
              type="button"
              id="action-btn-snap"
              onClick={handleQuickSnap}
              className="bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/60 rounded-md p-1.5 flex flex-col items-center justify-center space-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.06)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer min-h-[50px] select-none text-[#050505] dark:text-[#E4E6EB]"
              aria-label="即时速拍"
            >
              <Camera size={18} className="text-[#1877F2]" />
              <span className="text-[10px] font-bold leading-none">速拍</span>
            </button>

            {/* 6. 聊天 */}
            <button
              type="button"
              id="action-btn-chat"
              onClick={() => {
                haptics.trigger('light');
                onClose();
                onOpenChat(friend.id);
              }}
              className="bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/60 rounded-md p-1.5 flex flex-col items-center justify-center space-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.06)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer min-h-[50px] select-none text-[#050505] dark:text-[#E4E6EB]"
              aria-label="打开聊天"
            >
              <MessageCircle size={18} className="text-[#1877F2]" />
              <span className="text-[10px] font-bold leading-none">聊天</span>
            </button>

            {/* 7. 找他/她 */}
            <button
              type="button"
              id="action-btn-nav"
              onClick={handleStartNav}
              className="bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#059669]/60 rounded-md p-1.5 flex flex-col items-center justify-center space-y-0.5 shadow-[0_2px_0_rgba(0,0,0,0.06)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer min-h-[50px] select-none text-[#050505] dark:text-[#E4E6EB]"
              aria-label="发起地图导航找好友"
            >
              <Navigation size={18} className="text-[#059669]" />
              <span className="text-[10px] font-bold leading-none text-[#059669] dark:text-emerald-400">找TA</span>
            </button>
          </div>
        )}

        {/* Second Row: Activity Task Dispatch or Recessed Emoji Cannon Tray */}
        {activityContext ? (
          <div className="bg-[#EEF0F3] dark:bg-zinc-800/80 p-1.5 rounded-lg border border-[#E4E6EB]/80 dark:border-zinc-700/60 mb-1.5">
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="text-[10px] font-black text-[#050505] dark:text-[#E4E6EB] flex items-center space-x-1">
                <span>📋 活动任务分派:</span>
                <span className="text-[9px] font-normal text-[#65676B] dark:text-zinc-400">(点击指定分工)</span>
              </span>
              <span className="text-[9px] font-bold text-[#1877F2]">
                已分派 {assignedTasks.length} 项
              </span>
            </div>
            <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 select-none scrollbar-none">
              {['📋 物资保障', '📸 摄影记录', '🚩 路线领队', '📝 现场签到', '🚑 应急医疗', '🍰 茶歇补给'].map((task, taskIdx) => {
                const isAssigned = assignedTasks.includes(task);
                return (
                  <button
                    key={`act-task-${task}-${taskIdx}`}
                    type="button"
                    onClick={() => handleToggleTask(task)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all border shrink-0 ${
                      isAssigned
                        ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs scale-102'
                        : 'bg-white dark:bg-zinc-700 hover:bg-gray-50 text-[#050505] dark:text-[#E4E6EB] border-[#E4E6EB] dark:border-zinc-600'
                    }`}
                  >
                    {isAssigned && <Check size={10} className="inline mr-0.5" />}
                    {task}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-[#EEF0F3] dark:bg-zinc-800/80 p-1.5 rounded-lg border border-[#E4E6EB]/80 dark:border-zinc-700/60 mb-1.5">
            <div className="flex items-center justify-between gap-1">
              {SYSTEM_INTERACTION_EMOJIS.map((emoji, emojiIdx) => (
                <button
                  key={`sys-em-${emoji}-${emojiIdx}`}
                  type="button"
                  onMouseDown={(e) => handleEmojiButtonDown(emoji, e)}
                  onMouseUp={handleEmojiButtonUp}
                  onMouseLeave={handleEmojiButtonUp}
                  onTouchStart={(e) => handleEmojiButtonDown(emoji, e)}
                  onTouchEnd={handleEmojiButtonUp}
                  className="w-9 h-9 sm:w-10 sm:h-9 rounded-md bg-white dark:bg-zinc-700 hover:bg-gray-50 active:scale-90 flex items-center justify-center text-xl shadow-2xs border border-[#E4E6EB] dark:border-zinc-600 transition-all cursor-pointer select-none"
                  title={`按住连发 ${emoji}`}
                  aria-label={`发送表情 ${emoji}`}
                >
                  {emoji}
                </button>
              ))}

              {/* Add Custom Emoji Button */}
              <button
                type="button"
                id="add-custom-emoji-btn"
                onClick={() => setIsAddEmojiOpen((prev) => !prev)}
                className="w-8 h-9 rounded-md bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer select-none"
                title="添加自定义表情"
                aria-label="添加自定义表情"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add Emoji Palette Drawer */}
            {isAddEmojiOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-1.5 pt-1.5 border-t border-gray-200 dark:border-zinc-700 flex items-center space-x-1.5 overflow-x-auto pb-0.5"
              >
                {CANDIDATE_EMOJIS_TO_ADD.map((em, emIdx) => (
                  <button
                    key={`pick-${em}-${emIdx}`}
                    type="button"
                    onClick={() => handleAddCustomEmoji(em)}
                    className="w-8 h-8 rounded-md bg-white dark:bg-zinc-700 text-base flex items-center justify-center hover:scale-110 active:scale-90 transition-transform cursor-pointer border border-[#E4E6EB] dark:border-zinc-600 shrink-0"
                  >
                    {em}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Custom Emojis Strip */}
            {customEmojis.length > 0 && (
              <div className="mt-1 flex items-center space-x-1 overflow-x-auto pb-0.5 select-none">
                <span className="text-[9.5px] font-bold text-gray-400 dark:text-zinc-500 shrink-0">快捷:</span>
                {customEmojis.map((em, idx) => (
                  <button
                    key={`cust-${idx}-${em}`}
                    type="button"
                    onClick={(e) => launchFlyingEmoji(em, e.clientX, e.clientY)}
                    className="w-7 h-7 rounded-md bg-white dark:bg-zinc-700 border border-[#E4E6EB] dark:border-zinc-600 flex items-center justify-center text-sm shrink-0 active:scale-90 transition-all cursor-pointer shadow-2xs"
                    title={`发射 ${em}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Integrated Bottom Navigation Bar (5 tabs with central PTT Walkie-Talkie) */}
        <div className="pt-1.5 border-t border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-around select-none">
          {/* 1. 聊天 */}
          <button
            type="button"
            onClick={() => {
              haptics.trigger('light');
              soundEffects.playTapSound();
              onClose();
              onOpenChat(friend.id);
            }}
            className="flex flex-col items-center justify-center flex-1 py-0.5 gap-0.5 cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="p-0.5 rounded-full group-hover:bg-[#F0F2F5] dark:group-hover:bg-zinc-800 transition-colors">
              <MessageCircle size={18} className="text-[#65676B] dark:text-zinc-400 group-hover:text-[#1877F2] transition-colors" />
            </div>
            <span className="text-[10px] font-medium text-[#65676B] dark:text-zinc-400 group-hover:text-[#050505] dark:group-hover:text-white leading-none">
              聊天
            </span>
          </button>

          {/* 2. 发现 */}
          <button
            type="button"
            onClick={() => {
              haptics.trigger('light');
              soundEffects.playTapSound();
              onClose();
            }}
            className="flex flex-col items-center justify-center flex-1 py-0.5 gap-0.5 cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="p-0.5 rounded-full group-hover:bg-[#F0F2F5] dark:group-hover:bg-zinc-800 transition-colors">
              <Compass size={18} className="text-[#65676B] dark:text-zinc-400 group-hover:text-[#1877F2] transition-colors" />
            </div>
            <span className="text-[10px] font-medium text-[#65676B] dark:text-zinc-400 group-hover:text-[#050505] dark:group-hover:text-white leading-none">
              发现
            </span>
          </button>

          {/* 3. Central PTT Walkie-Talkie (按住对讲) */}
          <div className="relative flex flex-col items-center justify-center flex-1 cursor-pointer select-none">
            <motion.button
              type="button"
              id="modal-integrated-intercom-btn"
              initial={{ scale: 0.95 }}
              animate={
                isIntercom
                  ? { scale: 1.12, y: -4 }
                  : { scale: 1.0, y: -2 }
              }
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 20,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleOneClickIntercom();
              }}
              className={`relative w-[48px] h-[48px] rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-800 cursor-pointer active:scale-95 transition-all duration-200 z-30 shadow-md ${
                isIntercom
                  ? 'bg-emerald-500 text-white shadow-[0_4px_18px_rgba(16,185,129,0.55)] ring-3 ring-emerald-300/60'
                  : 'bg-[#1877F2] hover:bg-[#166FE5] text-white shadow-[0_4px_14px_rgba(24,119,242,0.4)] ring-2 ring-[#1877F2]/20'
              }`}
              title={`与【${friend.name}】对讲录音预览，仅本机试听`}
              aria-label={intercomStatus === 'recording' ? '结束对讲录音' : '一键对讲'}
              disabled={intercomStatus === 'requesting'}
            >
              {isIntercom && (
                <span className="absolute -inset-2 rounded-full bg-emerald-400/40 animate-ping opacity-75 pointer-events-none" />
              )}
              <Volume2
                size={22}
                className={`transition-transform duration-200 ${
                  isIntercom ? 'scale-110 text-white animate-pulse' : 'text-white'
                }`}
              />
            </motion.button>

            <span
              className={`text-[9.5px] font-black tracking-tight whitespace-nowrap mt-0.5 select-none transition-colors ${
                isIntercom ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#1877F2] dark:text-blue-400'
              }`}
            >
              {intercomStatus === 'recording' ? `结束录音 ${intercomSeconds}s` : '一键对讲'}
            </span>
          </div>

          {/* 4. Stellar */}
          <button
            type="button"
            onClick={() => {
              haptics.trigger('light');
              soundEffects.playTapSound();
              onClose();
            }}
            className="flex flex-col items-center justify-center flex-1 py-0.5 gap-0.5 cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="p-0.5 rounded-full group-hover:bg-[#F0F2F5] dark:group-hover:bg-zinc-800 transition-colors">
              <Sparkles size={18} className="text-[#65676B] dark:text-zinc-400 group-hover:text-[#1877F2] transition-colors" />
            </div>
            <span className="text-[10px] font-medium text-[#65676B] dark:text-zinc-400 group-hover:text-[#050505] dark:group-hover:text-white leading-none">
              Stellar
            </span>
          </button>

          {/* 5. 我的 */}
          <button
            type="button"
            onClick={() => {
              haptics.trigger('light');
              soundEffects.playTapSound();
              onClose();
            }}
            className="flex flex-col items-center justify-center flex-1 py-0.5 gap-0.5 cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-zinc-700 overflow-hidden group-hover:border-[#1877F2] transition-colors">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                alt="User Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[10px] font-medium text-[#65676B] dark:text-zinc-400 group-hover:text-[#050505] dark:group-hover:text-white leading-none">
              我的
            </span>
          </button>
        </div>
        <div className="bump-intercom-feedback" aria-live="polite">{intercomError || (intercomStatus === 'recording' ? '正在录音，再次点击结束；尚未发送给好友' : '点击开始录音，再次点击结束；仅本机试听')}</div>
        {voicePreviewUrl && <div className="bump-intercom-preview"><audio aria-label="对讲录音试听" controls src={voicePreviewUrl}/><span>语音预览 · 尚未发送给好友</span></div>}
      </motion.div>}
    </div>
  );
};
