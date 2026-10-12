import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Friend, FriendInMapNavState, FriendNavStatus, FriendRelationship } from '../types';
import {
  Navigation,
  X,
  MessageCircle,
  Sparkles,
  Star,
  Home,
  User,
  VolumeX,
  Footprints,
  Car,
  EyeOff,
  CheckCircle2,
  Pause,
  Play,
  Send,
  Heart,
  Zap,
  Activity,
  Hand,
  Camera,
  Plus,
  Clock,
  Battery,
  MapPin,
  Gauge,
  ArrowRight,
  RotateCcw,
  Compass,
  Users,
  BellOff,
  ChevronDown,
  Layers,
  Flame,
} from 'lucide-react';
import { QuickSnapCameraModal } from './QuickSnapCameraModal';

export interface FriendInMapNavBottomBarProps {
  friend: Friend | null;
  navState?: FriendInMapNavState | null;
  isOpen: boolean;
  onClose: () => void;
  onStartNav: (friend: Friend) => void;
  onUpdateNavStatus: (status: FriendNavStatus) => void;
  onUpdateProgress: (progress: number) => void;
  onCloseNav: () => void;
  onQuickChat: (friendId: string, text: string) => void;
  onOpenChat: (friendId: string) => void;
  onSendGreeting: (friend: Friend, type: 'wave' | 'heart' | 'star' | 'poke') => void;
  onTriggerMapBubble?: (friendId: string, emoji: string, text?: string) => void;
  onUpdateRelationship: (friendId: string, rel: FriendRelationship) => void;
  onToggleReducedMotion: () => void;
  onAddNotification?: (title: string, content: string, type: 'message' | 'like' | 'system' | 'radar') => void;
  onShowToast?: (msg: string) => void;
}

const SYSTEM_EMOJIS = [
  { id: 'snowball', emoji: '🪨', name: '雪球' },
  { id: 'bomb', emoji: '💣', name: '炸弹' },
  { id: 'heart', emoji: '♥️', name: '爱心' },
  { id: 'poop', emoji: '💩', name: '大便' },
  { id: 'thumbsup', emoji: '👍', name: '点赞' },
  { id: 'poke', emoji: '👉', name: '戳一戳' },
  { id: 'soccer', emoji: '⚽️', name: '足球' },
  { id: 'celebrate', emoji: '🎉', name: '庆祝' },
  { id: 'fire', emoji: '🔥', name: '热情' },
];

export const FriendInMapNavBottomBar: React.FC<FriendInMapNavBottomBarProps> = ({
  friend: initialFriend,
  navState,
  isOpen,
  onClose,
  onStartNav,
  onUpdateNavStatus,
  onUpdateProgress,
  onCloseNav,
  onQuickChat,
  onOpenChat,
  onSendGreeting,
  onTriggerMapBubble,
  onUpdateRelationship,
  onToggleReducedMotion,
  onAddNotification,
  onShowToast,
}) => {
  // Determine active friend (from navState or initialFriend)
  const activeFriend = navState?.friend || initialFriend;

  // View Mode: 'profile' (好友详情与互动) vs 'navigating' (寻友实时导航)
  const isNavigating = Boolean(navState && navState.friend);
  const [activeTab, setActiveTab] = useState<'profile' | 'navigating'>('profile');

  // Sync activeTab when navigation starts
  useEffect(() => {
    if (isNavigating) {
      setActiveTab('navigating');
    } else {
      setActiveTab('profile');
    }
  }, [isNavigating]);

  // Quick Chat State
  const [showQuickChatInput, setShowQuickChatInput] = useState(false);
  const [quickChatMessage, setQuickChatMessage] = useState('');

  // Relationship dropdown
  const [showRelationDropdown, setShowRelationDropdown] = useState(false);

  // Nav movement state dropdown
  const [showNavStateDropdown, setShowNavStateDropdown] = useState(false);

  // QuickSnap Camera Modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Custom Emoji adding
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customEmojis, setCustomEmojis] = useState<string[]>(['✨', '🌟']);

  // Floating Emojis & Combo Numbers FX
  const [flyingEmojis, setFlyingEmojis] = useState<{ id: string; emoji: string; startX: number; startY: number; targetX: number; targetY: number }[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<{ id: string; text: string; xOffset: number; targetX: number; targetY: number }[]>([]);
  const [comboCount, setComboCount] = useState(0);
  const [avatarBounce, setAvatarBounce] = useState(false);
  const [hitEffect, setHitEffect] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [greetings, setGreetings] = useState<{ id: string; text: string; targetX: number; targetY: number }[]>([]);

  // Upper Center Avatar Ref for accurate flying coordinates
  const bigAvatarRef = useRef<HTMLDivElement | null>(null);

  // 12 floating organic emojis surrounding the center avatar in orbit
  const radialIcons = ['💬', '⭐', '🏠', '🔋', '✨', '💖', '🌟', '🍀', '🔥', '🚀', '💎', '🎈'];

  // Simulated Friend Reply Banner
  const [incomingBomb, setIncomingBomb] = useState<{
    friendName: string;
    friendAvatar: string;
    listStr: string;
    totalCount: number;
  } | null>(null);

  const sentEmojisAccumulatorRef = useRef<{ [key: string]: number }>({});
  const simulationTimeoutRef = useRef<any>(null);

  if (!isOpen || !activeFriend) {
    return null;
  }

  const friend = activeFriend;
  const currentRelation: FriendRelationship =
    friend.relationship ||
    (friend.isCloseFriend ? 'close' : friend.isFamily ? 'family' : friend.isMuted ? 'muted' : friend.isHidden ? 'hidden' : 'friend');

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters < 15) return '0 米 (已碰面)';
    if (meters < 1000) return `${Math.round(meters)} 米`;
    return `${(meters / 1000).toFixed(1)} 公里`;
  };

  // Format ETA
  const formatEta = (seconds: number) => {
    if (seconds <= 0) return '已到达目的地';
    const mins = Math.ceil(seconds / 60);
    if (mins < 1) return '即将到达 (<1分钟)';
    return `约 ${mins} 分钟`;
  };

  // Relationship styling config (Facebook Straight-Edge UI System)
  const getRelationshipBadge = (rel?: FriendRelationship) => {
    switch (rel) {
      case 'close':
        return {
          label: '密友',
          icon: <Star size={11} className="fill-amber-500 text-amber-500" />,
          color: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
        };
      case 'family':
        return {
          label: '家人',
          icon: <Home size={11} className="text-rose-600" />,
          color: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
        };
      case 'muted':
        return {
          label: '已静音',
          icon: <VolumeX size={11} className="text-gray-500" />,
          color: 'bg-gray-100 text-gray-700 border-gray-300',
          dot: 'bg-gray-400',
        };
      case 'hidden':
        return {
          label: '已隐藏',
          icon: <EyeOff size={11} className="text-purple-600" />,
          color: 'bg-purple-50 text-purple-700 border-purple-300',
          dot: 'bg-purple-500',
        };
      default:
        return {
          label: '好友',
          icon: <User size={11} className="text-[#1877F2]" />,
          color: 'bg-blue-50 text-[#1877F2] border-blue-200',
          dot: 'bg-[#1877F2]',
        };
    }
  };

  // Navigation Status text
  const getNavStatusBadge = (st: FriendNavStatus) => {
    switch (st) {
      case 'friend_moving_to_me':
        return {
          text: '对方正在朝我走来',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
          icon: <Footprints size={12} className="text-emerald-600 animate-bounce" />,
        };
      case 'me_moving_to_friend':
        return {
          text: '我正在前往对方位置',
          color: 'text-[#1877F2] bg-blue-50 border-blue-200',
          icon: <Navigation size={12} className="text-[#1877F2] fill-[#1877F2]" />,
        };
      case 'arrived':
        return {
          text: '双方已碰面 / 已到达',
          color: 'text-purple-700 bg-purple-50 border-purple-300',
          icon: <CheckCircle2 size={12} className="text-purple-600" />,
        };
      case 'paused':
        return {
          text: '移动已暂停',
          color: 'text-amber-700 bg-amber-50 border-amber-300',
          icon: <Pause size={12} className="text-amber-600" />,
        };
      case 'departed':
        return {
          text: '对方正在离开',
          color: 'text-rose-700 bg-rose-50 border-rose-300',
          icon: <Car size={12} className="text-rose-600" />,
        };
      case 'stealth':
        return {
          text: '隐身 / 暂不可见',
          color: 'text-gray-700 bg-gray-100 border-gray-300',
          icon: <EyeOff size={12} className="text-gray-600" />,
        };
    }
  };

  const relBadge = getRelationshipBadge(currentRelation);
  const navStatusBadge = navState ? getNavStatusBadge(navState.status) : null;

  // Sound synthesis & vibration for tactile feedback
  const playSoundAndVibrate = (emoji: string) => {
    try {
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (emoji === '💣') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.3);
      } else if (emoji === '♥️' || emoji === 'heart') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      }

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // Audio fallback
    }
  };

  // Schedule simulated response barrage from friend
  const scheduleResponseSimulation = (sentEmoji: string) => {
    sentEmojisAccumulatorRef.current[sentEmoji] = (sentEmojisAccumulatorRef.current[sentEmoji] || 0) + 1;

    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current);
    }

    simulationTimeoutRef.current = setTimeout(() => {
      const userSentTotal = (Object.values(sentEmojisAccumulatorRef.current) as number[]).reduce((a: number, b: number) => a + b, 0);
      if (userSentTotal === 0) return;

      const responseCount = Math.max(2, Math.floor(userSentTotal * 0.8) + Math.floor(Math.random() * 3));
      const availableResponseEmojis = ['💣', '👍', '♥️', '💩', '🪨', '⚽️', '🎉', '🔥'];
      const chosenEmojis: string[] = [];
      const numTypes = Math.min(3, Math.floor(Math.random() * 2) + 1);

      for (let i = 0; i < numTypes; i++) {
        const randEmoji = availableResponseEmojis[Math.floor(Math.random() * availableResponseEmojis.length)];
        if (!chosenEmojis.includes(randEmoji)) chosenEmojis.push(randEmoji);
      }

      const listStr = chosenEmojis.join(' ');
      setIncomingBomb({
        friendName: friend.name,
        friendAvatar: friend.avatar,
        listStr,
        totalCount: responseCount,
      });

      if (onShowToast) {
        onShowToast(`💬 收到来自 ${friend.name} 的表情互动回赠！`);
      }
      if (onAddNotification) {
        onAddNotification(`收到来自 ${friend.name} 的表情回赠`, `${friend.name} 回复了你的表情互动: ${listStr} (+${responseCount})`, 'message');
      }

      sentEmojisAccumulatorRef.current = {};
    }, 2800);
  };

  // Avatar poke interaction
  const handleAvatarPoke = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSoundAndVibrate('👉');
    setIsPoked(true);
    setTimeout(() => setIsPoked(false), 350);

    const greetTexts = ['Hi! 👋', 'Hello! ✨', 'Hey there! 💖', 'Aloha! 🌺', 'Yo! 🤙', '你好呀! 🌸'];
    const text = greetTexts[Math.floor(Math.random() * greetTexts.length)];
    const id = `greet-${Date.now()}-${Math.random()}`;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight * 0.22;
    if (bigAvatarRef.current) {
      const rect = bigAvatarRef.current.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top;
    }

    setGreetings((prev) => [...prev, { id, text, targetX, targetY }]);
    setTimeout(() => {
      setGreetings((prev) => prev.filter((g) => g.id !== id));
    }, 1600);

    if (onTriggerMapBubble) {
      onTriggerMapBubble(friend.id, '👉', '戳了戳');
    }

    if (onShowToast) {
      onShowToast(`👉 戳了戳 ${friend.name}！✨`);
    }
  };

  // Trigger Emoji Animation
  const handleTriggerEmoji = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSoundAndVibrate(emoji);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight * 0.22;
    if (bigAvatarRef.current) {
      const avatarRect = bigAvatarRef.current.getBoundingClientRect();
      targetX = avatarRect.left + avatarRect.width / 2;
      targetY = avatarRect.top + avatarRect.height / 2;
    }

    const newFlyingId = `flying-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newFlying = {
      id: newFlyingId,
      emoji,
      startX,
      startY,
      targetX,
      targetY,
    };

    setFlyingEmojis((prev) => [...prev, newFlying]);
    const nextCombo = comboCount + 1;
    setComboCount(nextCombo);

    // Trigger overhead bubble on the map marker
    if (onTriggerMapBubble) {
      onTriggerMapBubble(friend.id, emoji);
    }

    // Hit reaction when emoji reaches avatar (~520ms)
    setTimeout(() => {
      setHitEffect(true);
      setAvatarBounce(true);
      setTimeout(() => {
        setHitEffect(false);
        setAvatarBounce(false);
      }, 300);
      setFlyingEmojis((prev) => prev.filter((item) => item.id !== newFlyingId));
    }, 520);

    // Add damage / combo score badge floating up from avatar
    const newDamageId = `dmg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const damageText = nextCombo >= 2 ? `Combo x${nextCombo}! ${emoji} 🔥` : `+1 ${emoji} 💫`;
    const newDamage = {
      id: newDamageId,
      text: damageText,
      xOffset: (Math.random() - 0.5) * 60,
      targetX,
      targetY,
    };
    setDamageNumbers((prev) => [...prev, newDamage]);

    setTimeout(() => {
      setDamageNumbers((prev) => prev.filter((item) => item.id !== newDamageId));
    }, 1200);

    scheduleResponseSimulation(emoji);
  };

  // Send Quick Greeting
  const handleGreetingClick = (type: 'wave' | 'heart' | 'star' | 'poke', e?: React.MouseEvent) => {
    playSoundAndVibrate(type === 'poke' ? '👉' : type === 'heart' ? '♥️' : '👋');
    setAvatarBounce(true);
    setTimeout(() => setAvatarBounce(false), 350);

    const emojiIcons = {
      wave: '👋',
      heart: '💖',
      star: '⭐',
      poke: '👉',
    };
    const emojiTexts = {
      wave: '拍了拍',
      heart: '送爱心 💖',
      star: '点亮星光 ⭐',
      poke: '戳了戳 👉',
    };

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight * 0.22;
    if (bigAvatarRef.current) {
      const rect = bigAvatarRef.current.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    // Spawn a flying emoji from button to avatar
    if (e && e.currentTarget) {
      const btnRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const startX = btnRect.left + btnRect.width / 2;
      const startY = btnRect.top + btnRect.height / 2;
      const flyingId = `flying-greet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const flyingEmoji = emojiIcons[type];
      setFlyingEmojis((prev) => [
        ...prev,
        {
          id: flyingId,
          emoji: flyingEmoji,
          startX,
          startY,
          targetX,
          targetY,
        },
      ]);
      setTimeout(() => {
        setHitEffect(true);
        setTimeout(() => setHitEffect(false), 300);
        setFlyingEmojis((prev) => prev.filter((item) => item.id !== flyingId));
      }, 520);
    }

    const greetId = `greet-${Date.now()}-${Math.random()}`;
    const greetLabel = emojiTexts[type];
    setGreetings((prev) => [...prev, { id: greetId, text: `${emojiIcons[type]} ${greetLabel}`, targetX, targetY: targetY - 40 }]);
    setTimeout(() => {
      setGreetings((prev) => prev.filter((g) => g.id !== greetId));
    }, 1600);

    // Trigger overhead bubble over friend on map
    if (onTriggerMapBubble) {
      onTriggerMapBubble(friend.id, emojiIcons[type], emojiTexts[type]);
    }

    onSendGreeting(friend, type);
    if (onShowToast) {
      const labels = {
        wave: `👋 已向「${friend.name}」打招呼！`,
        heart: `💖 已向「${friend.name}」送出爱心！`,
        star: `⭐ 已为「${friend.name}」点亮星光！`,
        poke: `👉 戳了戳「${friend.name}」！`,
      };
      onShowToast(labels[type]);
    }
  };

  // Handle Relation setting
  const handleSetRelation = (rel: FriendRelationship) => {
    onUpdateRelationship(friend.id, rel);
    const labelMap: Record<FriendRelationship, string> = {
      lover: `❤️ 已将「${friend.name}」设为恋人关系，享有专属状态与最高优先级提醒`,
      close: `⭐ 已将「${friend.name}」设为密友，享有地图高亮与动态优先推送`,
      family: `🏠 已将「${friend.name}」设为家人守护`,
      friend: `👥 已将「${friend.name}」恢复为普通好友`,
      muted: `🔕 已将「${friend.name}」静音`,
      hidden: `👻 已将「${friend.name}」隐藏`,
    };
    if (onShowToast) onShowToast(labelMap[rel]);
    if (onAddNotification) {
      onAddNotification('好友关系设置更新', labelMap[rel], 'system');
    }
    setShowRelationDropdown(false);
  };

  // Send Inline Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickChatMessage.trim()) return;
    onQuickChat(friend.id, quickChatMessage.trim());
    setQuickChatMessage('');
    setShowQuickChatInput(false);
  };

  // Handle Add Custom Emoji
  const handleAddCustomEmoji = () => {
    if (customInput.trim() && !customEmojis.includes(customInput.trim())) {
      setCustomEmojis((prev) => [...prev, customInput.trim()]);
      setCustomInput('');
      setIsAddingCustom(false);
      if (onShowToast) onShowToast('自定义表情已添加 ✨');
    }
  };

  // Handle Quick Snap
  const handleSendCameraSnap = (photoUrl: string, captionText?: string) => {
    setIsCameraOpen(false);
    if (onShowToast) onShowToast(`📸 实时速拍照片已成功发送给 ${friend.name}！✨`);
    if (onAddNotification) {
      onAddNotification(
        `向 ${friend.name} 发送了速拍照片`,
        captionText ? `附言: "${captionText}"` : `已成功向 ${friend.name} 发送实时速拍镜头照片。`,
        'message'
      );
    }
  };

  return (
    <>
      {/* 1. Global Flying Emojis & Damage Combo Floating Layer */}
      {flyingEmojis.map((item, index) => {
        const deltaX = item.targetX - item.startX;
        const deltaY = item.targetY - item.startY;
        const midX = item.startX + deltaX * 0.45 + (deltaX > 0 ? -45 : 45);
        const midY = item.startY + deltaY * 0.5 - 140;

        return (
          <React.Fragment key={`fly-${item.id}-${index}`}>
            {/* Curved Motion Blur Trail */}
            <motion.div
              style={{ position: 'fixed', left: 0, top: 0, pointerEvents: 'none', zIndex: 9998 }}
              initial={{
                x: item.startX - 28,
                y: item.startY - 28,
                scale: 0.5,
                opacity: 0.3,
              }}
              animate={{
                x: [item.startX - 28, midX - 15, item.targetX - 28],
                y: [item.startY - 28, midY + 25, item.targetY - 28],
                scale: [0.5, 1.8, 1.0],
                rotate: [0, 180, 360],
                opacity: [0.3, 0.6, 0],
              }}
              transition={{ duration: 0.52, delay: 0.04, ease: [0.22, 1, 0.36, 1], type: 'tween' }}
              className="text-4xl filter blur-[1.5px] select-none"
            >
              {item.emoji}
            </motion.div>

            {/* Trailing Sparkle Particle */}
            <motion.div
              style={{ position: 'fixed', left: 0, top: 0, pointerEvents: 'none', zIndex: 9998 }}
              initial={{
                x: item.startX,
                y: item.startY,
                opacity: 1,
                scale: 0.4,
              }}
              animate={{
                x: [item.startX, midX - 25, item.targetX - 10],
                y: [item.startY, midY - 20, item.targetY - 10],
                opacity: [1, 0.9, 0],
                scale: [0.4, 1.5, 0.2],
              }}
              transition={{ duration: 0.48, ease: 'easeOut' }}
              className="text-2xl select-none"
            >
              ✨
            </motion.div>

            {/* Main Flying Emoji with dynamic Bezier curved trajectory, kinetic squash & spin */}
            <motion.div
              style={{ position: 'fixed', left: 0, top: 0, pointerEvents: 'none', zIndex: 9999 }}
              initial={{
                x: item.startX - 28,
                y: item.startY - 28,
                scale: 0.7,
                opacity: 1,
              }}
              animate={{
                x: [item.startX - 28, midX - 28, item.targetX - 28],
                y: [item.startY - 28, midY, item.targetY - 28],
                scale: [0.7, 2.6, 1.5],
                scaleX: [0.8, 1.3, 0.9],
                scaleY: [1.3, 0.8, 1.1],
                rotate: [0, 240, 540],
              }}
              transition={{ duration: 0.52, ease: [0.2, 0.85, 0.25, 1], type: 'tween' }}
              className="text-5xl drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)] select-none"
            >
              {item.emoji}
            </motion.div>
          </React.Fragment>
        );
      })}

      {damageNumbers.map((dmg) => (
        <motion.div
          key={dmg.id}
          style={{ position: 'fixed', left: 0, top: 0, pointerEvents: 'none', zIndex: 10000 }}
          initial={{
            opacity: 1,
            x: dmg.targetX + dmg.xOffset - 40,
            y: dmg.targetY - 30,
            scale: 0.6,
          }}
          animate={{
            opacity: [1, 1, 0],
            y: dmg.targetY - 110,
            scale: [1.2, 1.8, 1.1],
          }}
          transition={{ duration: 0.9, ease: 'easeOut', type: 'tween' }}
          className="text-2xl font-black text-amber-500 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] select-none whitespace-nowrap"
        >
          {dmg.text}
        </motion.div>
      ))}

      {/* 2. Top Banner Alert: Simulated Response from Friend */}
      <AnimatePresence>
        {incomingBomb && (
          <motion.div
            initial={{ y: -80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={() => setIncomingBomb(null)}
            className="fixed top-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-90 bg-white border border-[#E4E6EB] rounded-md p-3 shadow-xl flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="relative shrink-0">
              <img
                src={incomingBomb.friendAvatar}
                alt={incomingBomb.friendName}
                className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-bold">
                💬
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#1C1E21] truncate">来自 {incomingBomb.friendName} 的表情回赠</h4>
                <span className="text-[10px] font-bold text-[#1877F2] bg-blue-50 px-1.5 py-0.2 rounded-xs border border-blue-200">
                  +{incomingBomb.totalCount}
                </span>
              </div>
              <p className="text-xs text-[#65676B] mt-0.5 truncate font-bold">
                <span className="text-[#1877F2]">{incomingBomb.listStr}</span>
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIncomingBomb(null);
              }}
              className="text-[#65676B] hover:text-[#1C1E21] p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Floating Speech Bubble Greetings Layer */}
      {greetings.map((greet) => (
        <motion.div
          key={greet.id}
          style={{ position: 'fixed', left: 0, top: 0, pointerEvents: 'none', zIndex: 10000 }}
          initial={{
            opacity: 0,
            x: greet.targetX - 70,
            y: greet.targetY - 10,
            scale: 0.6,
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: greet.targetY - 90,
            scale: [0.8, 1.2, 1.2, 0.85],
          }}
          transition={{ duration: 1.6, times: [0, 0.15, 0.8, 1], ease: 'easeOut', type: 'tween' }}
          className="px-4 py-2 rounded-md bg-white text-[#1877F2] font-black text-sm shadow-xl border border-[#E4E6EB] flex items-center justify-center select-none"
        >
          {/* Bubble pointer triangle */}
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#E4E6EB] rotate-45" />
          <span className="relative z-10 whitespace-nowrap">{greet.text}</span>
        </motion.div>
      ))}

      {/* 4. Backdrop Overlay (Clicking outside dismisses the interaction) */}
      <div
        className="fixed inset-0 z-30 bg-black/15 backdrop-blur-[0.5px] cursor-pointer"
        onClick={() => {
          setIncomingBomb(null);
          onClose();
        }}
      />

      {/* 5. Upper Center Stage: Avatar Expanding from Small to Large + Orbiting Emojis + Name Pill */}
      {activeTab === 'profile' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-[18%] sm:top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center z-40 w-full max-w-sm px-4 pointer-events-none"
        >
          <div className="relative flex items-center justify-center my-4 pointer-events-auto">
            {/* Outer Concentric Orbit Track Ring 1 (Dashed, Rotating Clockwise) */}
            <div className="absolute w-64 h-64 rounded-full border border-dashed border-[#1877F2]/40 dark:border-[#1877F2]/60 animate-spin-slow pointer-events-none" />

            {/* Inner Concentric Orbit Track Ring 2 (Dotted, Rotating Counter-Clockwise) */}
            <div className="absolute w-52 h-52 rounded-full border border-dotted border-amber-400/40 animate-reverse-spin-slow pointer-events-none" />

            {/* Floating Organic Emojis Orbiting the Avatar */}
            {radialIcons.map((icon, idx) => {
              const angle = (idx / radialIcons.length) * Math.PI * 2;
              const radius = 110;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * (radius * 0.85);
              return (
                <motion.div
                  key={`radial-icon-${idx}-${icon}`}
                  animate={{
                    y: [y, y - 5, y + 5, y],
                    x: [x, x + 4, x - 4, x],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3.5 + (idx % 3),
                    repeat: Infinity,
                    ease: 'easeInOut',
                    type: 'tween',
                  }}
                  className="absolute text-2xl sm:text-3xl pointer-events-none select-none drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)] shrink-0 z-40"
                  style={{
                    marginLeft: -14,
                    marginTop: -14,
                  }}
                >
                  {icon}
                </motion.div>
              );
            })}

            {/* Central Expanding Avatar */}
            <motion.div
              ref={bigAvatarRef}
              onClick={handleAvatarPoke}
              title="点击戳一戳好友"
              initial={{ scale: 0.25, y: 70, opacity: 0 }}
              animate={{
                scale: isPoked
                  ? 1.55
                  : hitEffect
                  ? 2.35
                  : 1.95,
                scaleY: isPoked ? 0.75 : 1,
                scaleX: isPoked ? 1.25 : 1,
                y: 0,
                opacity: 1,
              }}
              transition={
                isPoked
                  ? { type: 'spring', stiffness: 500, damping: 12 }
                  : { type: 'spring', stiffness: 320, damping: 22 }
              }
              className={`relative w-20 h-20 rounded-full p-1 shadow-2xl cursor-pointer transition-all ${
                currentRelation === 'close'
                  ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 ring-4 ring-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.6)]'
                  : currentRelation === 'family'
                  ? 'bg-gradient-to-tr from-rose-500 via-purple-500 to-pink-400 ring-4 ring-rose-300 shadow-[0_0_24px_rgba(244,63,94,0.6)]'
                  : 'bg-gradient-to-tr from-[#1877F2] via-indigo-500 to-pink-500 ring-4 ring-blue-300 shadow-[0_0_24px_rgba(24,119,242,0.5)]'
              } ${hitEffect ? 'ring-4 ring-yellow-400 ring-offset-2 scale-110' : ''}`}
            >
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-full h-full rounded-full object-cover border-2 border-white shadow-inner select-none pointer-events-none"
              />
              {/* Online / Relationship Badge at corner of large avatar */}
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow">
                {currentRelation === 'close' ? '⭐' : currentRelation === 'family' ? '🏠' : '✓'}
              </div>
            </motion.div>
          </div>

          {/* Name & Location & Distance Pill Badge - 下移避开环绕旋转表情 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-[68px] bg-white/85 backdrop-blur-xl px-4 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.75)] border border-white/80 flex items-center space-x-2 text-xs font-bold text-[#1C1E21] pointer-events-auto select-none transition-all duration-300"
          >
            {currentRelation === 'close' && <span className="text-amber-500">⭐</span>}
            {currentRelation === 'family' && <span className="text-rose-500">🏠</span>}
            <span className="font-black">{friend.name}</span>
            <span className="text-gray-300">·</span>
            <span className="text-[#65676B] truncate max-w-[110px]">{friend.locationName || '附近'}</span>
            <span className="text-gray-300">·</span>
            <span className="text-[#1877F2] font-black">{friend.distance || '附近 320m'}</span>
          </motion.div>
        </div>
      )}

      {/* 6. Main Unified In-Map Friend Card (Facebook Straight-Edge Line Frame UI System) */}
      <div
        id="unified-friend-in-map-card"
        className="absolute bottom-2 left-2 right-2 sm:left-4 sm:right-4 sm:max-w-2xl sm:mx-auto z-40 bg-white border border-[#E4E6EB] rounded-md shadow-lg p-3 sm:p-3.5 transition-all animate-in slide-in-from-bottom duration-200 text-[#1C1E21] select-none"
      >
        {/* Top Header Row: Avatar + Friend Info + Relationship Dropdown + Mode Switcher / Close Button */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E4E6EB]">
          {/* Left: Avatar & Meta */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={friend.avatar}
                alt={friend.name}
                className={`w-11 h-11 rounded-full object-cover border border-[#E4E6EB] shadow-2xs transition-transform duration-200 ${
                  avatarBounce ? 'scale-115 ring-2 ring-[#1877F2]' : ''
                }`}
                referrerPolicy="no-referrer"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${relBadge.dot}`}
                title={relBadge.label}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-[#1C1E21] truncate max-w-[120px]">
                  {friend.name}
                </span>

                {/* Clickable Relationship Badge with Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRelationDropdown((prev) => !prev)}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9.5px] font-bold rounded-xs border cursor-pointer hover:brightness-95 transition-all ${relBadge.color}`}
                    title="点击修改好友关系分组"
                  >
                    {relBadge.icon}
                    <span>{relBadge.label}</span>
                    <ChevronDown size={10} className="opacity-70" />
                  </button>

                  {/* Relationship Setting Dropdown Popover */}
                  {showRelationDropdown && (
                    <div className="absolute left-0 top-full mt-1 w-38 bg-white border border-[#E4E6EB] rounded-md shadow-xl py-1 z-50 animate-in fade-in duration-100 text-xs">
                      <div className="text-[9px] font-bold text-[#65676B] px-2.5 py-1 uppercase tracking-wider border-b border-[#E4E6EB]">
                        设置好友关系
                      </div>
                      <button
                        onClick={() => handleSetRelation('close')}
                        className={`w-full text-left px-2.5 py-1.5 font-bold flex items-center space-x-1.5 hover:bg-amber-50 cursor-pointer ${
                          currentRelation === 'close' ? 'text-amber-600 bg-amber-50/50' : 'text-[#1C1E21]'
                        }`}
                      >
                        <Star size={13} className="text-amber-500 fill-amber-500" />
                        <span>设为密友 ⭐</span>
                      </button>
                      <button
                        onClick={() => handleSetRelation('family')}
                        className={`w-full text-left px-2.5 py-1.5 font-bold flex items-center space-x-1.5 hover:bg-rose-50 cursor-pointer ${
                          currentRelation === 'family' ? 'text-rose-600 bg-rose-50/50' : 'text-[#1C1E21]'
                        }`}
                      >
                        <Home size={13} className="text-rose-600" />
                        <span>设为家人 🏠</span>
                      </button>
                      <button
                        onClick={() => handleSetRelation('friend')}
                        className={`w-full text-left px-2.5 py-1.5 font-bold flex items-center space-x-1.5 hover:bg-blue-50 cursor-pointer ${
                          currentRelation === 'friend' ? 'text-[#1877F2] bg-blue-50/50' : 'text-[#1C1E21]'
                        }`}
                      >
                        <Users size={13} className="text-[#1877F2]" />
                        <span>普通好友 👥</span>
                      </button>
                      <button
                        onClick={() => handleSetRelation('muted')}
                        className={`w-full text-left px-2.5 py-1.5 font-bold flex items-center space-x-1.5 hover:bg-gray-100 cursor-pointer ${
                          currentRelation === 'muted' ? 'text-gray-900 bg-gray-100' : 'text-[#65676B]'
                        }`}
                      >
                        <BellOff size={13} className="text-gray-500" />
                        <span>静音通知 🔕</span>
                      </button>
                      <button
                        onClick={() => handleSetRelation('hidden')}
                        className={`w-full text-left px-2.5 py-1.5 font-bold flex items-center space-x-1.5 hover:bg-purple-50 cursor-pointer ${
                          currentRelation === 'hidden' ? 'text-purple-600 bg-purple-50/50' : 'text-[#65676B]'
                        }`}
                      >
                        <EyeOff size={13} className="text-purple-500" />
                        <span>地图隐藏 👻</span>
                      </button>
                    </div>
                  )}
                </div>

                {friend.battery !== undefined && (
                  <span className="text-[9.5px] text-[#65676B] bg-[#F0F2F5] px-1.5 py-0.5 rounded-2xs font-mono font-bold flex items-center gap-0.5">
                    <Battery size={11} className="text-[#65676B]" />
                    <span>{friend.battery}%</span>
                  </span>
                )}
              </div>

              {/* Status and Location text */}
              <div className="flex items-center gap-1.5 text-[10.5px] text-[#65676B] mt-0.5 truncate">
                <span className="truncate">{friend.locationName || '兰州中心商圈'}</span>
                <span>·</span>
                {friend.stayDuration ? (
                  <span>⏱️ 停留{friend.stayDuration}</span>
                ) : (
                  <span>{friend.status || '在线'}</span>
                )}
                {friend.speed && <span>· 🚶 {friend.speed}</span>}
              </div>
            </div>
          </div>

          {/* Right: View Mode Toggle & Close Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isNavigating && (
              <div className="flex items-center bg-[#F0F2F5] p-0.5 rounded-xs border border-[#E4E6EB]">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-2xs transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-white text-[#1877F2] shadow-2xs'
                      : 'text-[#65676B] hover:text-[#1C1E21]'
                  }`}
                >
                  资料
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('navigating')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-2xs transition-all cursor-pointer ${
                    activeTab === 'navigating'
                      ? 'bg-[#1877F2] text-white shadow-2xs'
                      : 'text-[#65676B] hover:text-[#1C1E21]'
                  }`}
                >
                  导航
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (isNavigating) {
                  onCloseNav();
                }
                onClose();
              }}
              className="p-1 text-[#65676B] hover:text-[#1C1E21] hover:bg-[#F0F2F5] rounded-xs transition-colors cursor-pointer"
              title="关闭卡片"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: FRIEND PROFILE & QUICK INTERACTION MODE (好友资料与全能互动卡片) */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="pt-2 space-y-2.5 animate-in fade-in duration-150">
            {/* 1. Emoji Row directly below avatar header (移动到头像后面的一栏，不要气泡，图标直接显示立体感) */}
            <div className="py-1 border-b border-[#E4E6EB]/70">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
                {SYSTEM_EMOJIS.map((item) => (
                  <button
                    key={`system-emoji-${item.id}`}
                    onClick={(e) => handleTriggerEmoji(item.emoji, e)}
                    className="flex items-center justify-center cursor-pointer transition-transform hover:scale-130 active:scale-90 select-none shrink-0 p-1 group"
                    title={item.name}
                  >
                    <span className="text-2xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.28)] transition-transform group-hover:-translate-y-0.5 select-none">
                      {item.emoji}
                    </span>
                  </button>
                ))}

                {/* Custom Emojis */}
                {customEmojis.map((emoji, idx) => (
                  <button
                    key={`custom-emoji-${idx}-${emoji}`}
                    onClick={(e) => handleTriggerEmoji(emoji, e)}
                    className="flex items-center justify-center cursor-pointer transition-transform hover:scale-130 active:scale-90 select-none shrink-0 p-1 group"
                  >
                    <span className="text-2xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.28)] transition-transform group-hover:-translate-y-0.5 select-none">
                      {emoji}
                    </span>
                  </button>
                ))}

                {/* Add Custom Emoji (+) Button */}
                <button
                  onClick={() => setIsAddingCustom((prev) => !prev)}
                  className="w-7 h-7 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1877F2] flex items-center justify-center border border-[#CED0D4] shrink-0 cursor-pointer transition-transform hover:scale-110 shadow-2xs ml-0.5"
                  title="添加自定义表情"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Custom Emoji Input Form */}
              {isAddingCustom && (
                <div className="mt-1.5 p-2 bg-[#F0F2F5] rounded-xs border border-[#CED0D4] flex items-center space-x-1.5 animate-in fade-in duration-100">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="输入自定义表情 (如 🎉)"
                    className="flex-1 bg-white border border-[#CED0D4] rounded-xs px-2.5 py-1.5 text-xs text-[#1C1E21] focus:outline-hidden focus:border-[#1877F2]"
                  />
                  <button
                    onClick={handleAddCustomEmoji}
                    className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xs text-xs font-bold cursor-pointer"
                  >
                    添加
                  </button>
                  <button
                    onClick={() => setIsAddingCustom(false)}
                    className="px-3 py-1.5 bg-white text-[#65676B] rounded-xs text-xs font-bold border border-[#CED0D4] cursor-pointer"
                  >
                    取消
                  </button>
                </div>
              )}
            </div>

            {/* 2. Primary Actions & Quick Interactions */}
            <div className="space-y-1.5 pt-0.5">
              {/* Row 1: 去找他, 速拍, 戳一戳, 打招呼 */}
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                {/* 1. START IN-MAP NAVIGATION: 缩小，改为：去找他 */}
                <button
                  type="button"
                  id="start-friend-inmap-nav-btn"
                  onClick={() => {
                    onStartNav(friend);
                    setActiveTab('navigating');
                  }}
                  className="py-1.5 px-3 bg-[#1877F2] hover:bg-[#166FE5] active:scale-[0.98] text-white font-bold rounded-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  title="开启寻友路线导航"
                >
                  <Navigation size={13} className="fill-white shrink-0" />
                  <span>去找他</span>
                </button>

                {/* 2. QUICK SNAP 速拍 */}
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="py-1.5 px-2.5 bg-white hover:bg-[#F0F2F5] active:scale-[0.98] text-[#1C1E21] border border-[#CED0D4] font-bold rounded-xs flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                  title="速拍功能：一键拍照给好友发送"
                >
                  <Camera size={13} className="text-[#1877F2] shrink-0" />
                  <span>速拍</span>
                </button>

                {/* 3. POKE 戳一戳 */}
                <button
                  type="button"
                  onClick={(e) => handleGreetingClick('poke', e)}
                  className="py-1.5 px-2.5 bg-white hover:bg-[#F0F2F5] active:scale-[0.98] text-[#1C1E21] border border-[#CED0D4] font-bold rounded-xs flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                  title="戳一戳好友"
                >
                  <Zap size={13} className="text-amber-500 shrink-0" />
                  <span>戳一戳</span>
                </button>

                {/* 4. WAVE 打招呼 */}
                <button
                  type="button"
                  onClick={(e) => handleGreetingClick('wave', e)}
                  className="py-1.5 px-2.5 bg-white hover:bg-[#F0F2F5] text-[#1C1E21] border border-[#CED0D4] font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap shrink-0"
                  title="挥手打招呼"
                >
                  <span className="text-xs">👋</span>
                  <span>打招呼</span>
                </button>
              </div>

              {/* Row 2: 直接显示快捷留言输入框 */}
              <form onSubmit={handleSendChat} className="flex items-center gap-1.5 w-full pt-0.5">
                <div className="relative flex-1 flex items-center">
                  <MessageCircle size={13} className="absolute left-2.5 text-[#1877F2] shrink-0 pointer-events-none" />
                  <input
                    type="text"
                    value={quickChatMessage}
                    onChange={(e) => setQuickChatMessage(e.target.value)}
                    placeholder="快捷留言"
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-[#FAFBFD] hover:bg-white border border-[#CED0D4] rounded-xs focus:outline-hidden focus:border-[#1877F2] focus:bg-white text-[#1C1E21] font-medium shadow-2xs transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="py-1.5 px-3 bg-[#1877F2] hover:bg-[#166FE5] active:scale-[0.98] text-white font-bold rounded-xs flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0 text-xs"
                >
                  <Send size={12} />
                  <span>发送</span>
                </button>
              </form>
            </div>

            {/* 3. Bottom Row: Left Distance info chip + Right bottom corner Chat button (移动到右下角，点击后进入聊天界面) */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#E4E6EB]/70">
              <div className="text-[11px] text-[#65676B] font-mono font-bold bg-[#FAFBFD] px-2.5 py-1.5 rounded-xs border border-[#E4E6EB] flex items-center gap-1 truncate">
                <span>📍 距离:</span>
                <span className="text-[#1877F2] font-black">{friend.distance || '附近 320m'}</span>
                {friend.locationName && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-[#65676B] truncate max-w-[130px]">{friend.locationName}</span>
                  </>
                )}
              </div>

              {/* Chat Button placed at the bottom right corner */}
              <button
                type="button"
                id="friend-bottom-right-chat-btn"
                onClick={() => {
                  onClose();
                  onOpenChat(friend.id);
                }}
                className="py-1.5 px-3.5 bg-white hover:bg-[#F0F2F5] active:scale-[0.98] text-[#1C1E21] border border-[#CED0D4] font-bold rounded-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0 text-xs"
                title="点击进入聊天界面"
              >
                <MessageCircle size={14} className="text-[#1877F2] shrink-0" />
                <span>聊天</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: IN-MAP FRIEND NAVIGATION HUD MODE (实时寻友导航 HUD 状态卡片) */}
        {/* ========================================================================= */}
        {activeTab === 'navigating' && navState && (
          <div className="pt-2.5 space-y-2.5 animate-in fade-in duration-150">
            {/* Metric Grid: Live Distance & ETA & Relative Movement Mode */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {/* Distance box */}
              <div className="bg-[#FAFBFD] p-2 rounded-xs border border-[#E4E6EB] space-y-0.5">
                <span className="text-[9.5px] text-[#65676B] block font-bold">相对实时距离</span>
                <div className="font-mono font-black text-sm text-[#1877F2] flex items-center gap-1">
                  <Navigation size={13} className="text-[#1877F2] fill-[#1877F2]" />
                  <span>{formatDistance(navState.currentDistanceMeters)}</span>
                </div>
              </div>

              {/* ETA box */}
              <div className="bg-[#FAFBFD] p-2 rounded-xs border border-[#E4E6EB] space-y-0.5">
                <span className="text-[9.5px] text-[#65676B] block font-bold">预计到达耗时 (ETA)</span>
                <div className="font-mono font-black text-sm text-emerald-600 flex items-center gap-1">
                  <Activity size={13} />
                  <span>{formatEta(navState.currentEtaSeconds)}</span>
                </div>
              </div>

              {/* Movement state badge */}
              <div className="col-span-2 sm:col-span-1 bg-[#FAFBFD] p-2 rounded-xs border border-[#E4E6EB] space-y-0.5 flex flex-col justify-center">
                <span className="text-[9.5px] text-[#65676B] block font-bold">相对移动态</span>
                {navStatusBadge && (
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9.5px] font-bold rounded-xs border ${navStatusBadge.color}`}
                  >
                    {navStatusBadge.icon}
                    <span>{navStatusBadge.text}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Progress Slider (Interactive simulation of moving along path) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] text-[#65676B] font-bold">
                <span>{navState.status === 'friend_moving_to_me' ? `起点 (${friend.name})` : '起点 (我的坐标)'}</span>
                <span className="text-[#1877F2]">移动进度: {Math.round(navState.progress * 100)}%</span>
                <span>{navState.status === 'friend_moving_to_me' ? '终点 (我的位置)' : `终点 (${friend.name})`}</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={navState.progress}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateProgress(val);
                  }}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1877F2]"
                />
              </div>
            </div>

            {/* Inline Quick Chat Form */}
            {showQuickChatInput && (
              <form onSubmit={handleSendChat} className="flex items-center gap-1.5 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={quickChatMessage}
                  onChange={(e) => setQuickChatMessage(e.target.value)}
                  placeholder={`发消息给 ${friend.name}（不跳出地图）...`}
                  autoFocus
                  className="flex-1 px-2.5 py-1.5 text-xs bg-[#FAFBFD] border border-[#CED0D4] rounded-xs focus:outline-hidden focus:border-[#1877F2] text-[#1C1E21]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Send size={12} />
                  <span>发送</span>
                </button>
              </form>
            )}

            {/* Bottom Action Controls: Quick Interactions + Nav State Switcher + Exit Nav */}
            <div className="flex items-center justify-between gap-1.5 pt-2.5 border-t border-[#E4E6EB] flex-wrap text-xs">
              {/* Left: Greetings in navigation */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => handleGreetingClick('wave', e)}
                  className="px-2.5 py-1.5 bg-white hover:bg-[#F0F2F5] text-[#1C1E21] border border-[#CED0D4] font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap text-[11px]"
                  title="发送挥手打招呼"
                >
                  <span className="text-xs">👋</span>
                  <span>打招呼</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleGreetingClick(currentRelation === 'close' ? 'star' : 'heart', e)}
                  className="px-2.5 py-1.5 bg-white hover:bg-[#F0F2F5] text-[#1C1E21] border border-[#CED0D4] font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap text-[11px]"
                >
                  {currentRelation === 'close' ? (
                    <>
                      <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                      <span>送星星</span>
                    </>
                  ) : (
                    <>
                      <Heart size={12} className="text-rose-500 fill-rose-500 shrink-0" />
                      <span>送爱心</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowQuickChatInput((prev) => !prev)}
                  className={`px-2.5 py-1.5 border font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap text-[11px] ${
                    showQuickChatInput
                      ? 'bg-blue-50 text-[#1877F2] border-[#1877F2]'
                      : 'bg-white hover:bg-[#F0F2F5] text-[#1C1E21] border-[#CED0D4]'
                  }`}
                  title="地图内快速聊天"
                >
                  <MessageCircle size={12} className="text-[#1877F2] shrink-0" />
                  <span>发消息</span>
                </button>
              </div>

              {/* Right: Movement state dropdown & Exit nav */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Movement Mode Switcher */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNavStateDropdown((prev) => !prev)}
                    className="px-2.5 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap text-[11px]"
                    title="切换移动状态"
                  >
                    <Zap size={12} className="shrink-0" />
                    <span>状态 ▾</span>
                  </button>

                  {showNavStateDropdown && (
                    <div className="absolute right-0 bottom-full mb-1 w-44 bg-white border border-[#E4E6EB] rounded-md shadow-xl p-1 z-50 text-xs space-y-0.5 animate-in fade-in duration-100">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateNavStatus('friend_moving_to_me');
                          setShowNavStateDropdown(false);
                        }}
                        className={`w-full px-2.5 py-1.5 text-left rounded-xs flex items-center justify-between cursor-pointer ${
                          navState.status === 'friend_moving_to_me'
                            ? 'bg-blue-50 text-[#1877F2] font-bold'
                            : 'hover:bg-[#F0F2F5] text-[#1C1E21]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Footprints size={13} className="text-emerald-600 shrink-0" />
                          <span>好友朝我移动</span>
                        </span>
                        {navState.status === 'friend_moving_to_me' && <span className="text-[10px]">●</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onUpdateNavStatus('me_moving_to_friend');
                          setShowNavStateDropdown(false);
                        }}
                        className={`w-full px-2.5 py-1.5 text-left rounded-xs flex items-center justify-between cursor-pointer ${
                          navState.status === 'me_moving_to_friend'
                            ? 'bg-blue-50 text-[#1877F2] font-bold'
                            : 'hover:bg-[#F0F2F5] text-[#1C1E21]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Navigation size={13} className="text-[#1877F2] shrink-0" />
                          <span>我去找好友</span>
                        </span>
                        {navState.status === 'me_moving_to_friend' && <span className="text-[10px]">●</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onUpdateNavStatus('paused');
                          setShowNavStateDropdown(false);
                        }}
                        className={`w-full px-2.5 py-1.5 text-left rounded-xs flex items-center justify-between cursor-pointer ${
                          navState.status === 'paused'
                            ? 'bg-blue-50 text-[#1877F2] font-bold'
                            : 'hover:bg-[#F0F2F5] text-[#1C1E21]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Pause size={13} className="text-amber-600 shrink-0" />
                          <span>暂停移动</span>
                        </span>
                        {navState.status === 'paused' && <span className="text-[10px]">●</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onUpdateNavStatus('arrived');
                          onUpdateProgress(1);
                          setShowNavStateDropdown(false);
                        }}
                        className={`w-full px-2.5 py-1.5 text-left rounded-xs flex items-center justify-between cursor-pointer ${
                          navState.status === 'arrived'
                            ? 'bg-blue-50 text-[#1877F2] font-bold'
                            : 'hover:bg-[#F0F2F5] text-[#1C1E21]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-purple-600 shrink-0" />
                          <span>已到达 / 已碰面</span>
                        </span>
                        {navState.status === 'arrived' && <span className="text-[10px]">●</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onUpdateNavStatus('departed');
                          setShowNavStateDropdown(false);
                        }}
                        className={`w-full px-2.5 py-1.5 text-left rounded-xs flex items-center justify-between cursor-pointer ${
                          navState.status === 'departed'
                            ? 'bg-blue-50 text-[#1877F2] font-bold'
                            : 'hover:bg-[#F0F2F5] text-[#1C1E21]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Car size={13} className="text-rose-600 shrink-0" />
                          <span>好友离开</span>
                        </span>
                        {navState.status === 'departed' && <span className="text-[10px]">●</span>}
                      </button>
                    </div>
                  )}
                </div>

                {/* Exit Navigation Button */}
                <button
                  type="button"
                  onClick={() => {
                    onCloseNav();
                    setActiveTab('profile');
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap text-[11px]"
                  title="退出寻友导航"
                >
                  <X size={12} className="shrink-0" />
                  <span>退出导航</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Snap Camera Modal */}
      {isCameraOpen && (
        <QuickSnapCameraModal
          isOpen={isCameraOpen}
          friend={friend}
          onClose={() => setIsCameraOpen(false)}
          onSendSnap={handleSendCameraSnap}
        />
      )}
    </>
  );
};
