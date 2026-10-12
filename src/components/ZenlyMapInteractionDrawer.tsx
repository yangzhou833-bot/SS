import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sliders,
  MessageSquare,
  Phone,
  MapPin,
  Footprints,
  Bike,
  Car,
  Bus,
  WifiOff,
  Battery,
  AlertTriangle,
  Clock,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Share2,
  Bell,
  Users,
  CheckCircle2,
  Calendar,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Info,
  Lock,
  Compass,
  Eye,
  ArrowUpRight,
  Navigation,
  EyeOff,
  Sparkles,
  UserCheck,
  Send,
  MoreHorizontal,
  Flame,
  Award,
  Globe,
  Heart,
  Activity,
  Coffee,
  Building,
  Home
} from 'lucide-react';
import { Friend, FriendRelationship } from '../types';
import { soundEffects } from '../utils/soundEffects';

export interface UserTrajectoryPayload {
  user: {
    id: string;
    nickname: string;
    online: boolean;
    lastSeenAt?: string;
    mood?: string;
    myLabel?: string;
    battery?: number;
    charging?: boolean;
    isMoving?: boolean;
    speedKmh?: number | null;
    stayMinutes?: number;
    currentPoi?: string;
    distanceKm?: number;
    direction?: string;
    locationUpdatedAt?: string;
    visibility?: string;
    interests?: string[];
  };
  today: {
    stats: {
      distanceKm: number;
      moveMinutes: number;
      steps: number;
      kcal: number;
      avgSpeedKmh: number;
      maxSpeedKmh: number;
    };
    timeline: Array<{
      start: string;
      end: string | null;
      mode: string;
      from?: string;
      to?: string;
      place?: string;
      durationMin: number;
      distanceKm?: number;
      isCurrent?: boolean;
    }>;
    route?: string;
    placesVisited: Array<{ name: string; count: number }>;
  };
  history: {
    range: string;
    days: Array<{
      date: string;
      distanceKm: number;
      places: number;
      mood?: string;
      topPlaces: string[];
    }>;
    footprint: {
      cities: number;
      totalKm: number;
      topPlaces: Array<{ name: string; count: number }>;
    };
  };
  interactions: {
    streakDays: number;
    weeklyCount: number;
    closeness: string;
    sharingLocation: { active: boolean; minutes: number };
    sharedActivities: Array<{
      name: string;
      time: string;
      status: string;
      participants: string[];
    }>;
    commonPlaces: Array<{ name: string; times: number; last: string }>;
    recent: Array<{ type: string; by: string; summary: string; at: string }>;
  };
  locationSocial: {
    nearMiss: { last7Days: number; last: string; withinM: number };
    lowBatteryAlert: boolean;
    sosEnabled: boolean;
    arrivalAlerts: { on: boolean; places: string[] };
    badges: Array<{ name: string; value: number }>;
    commonInterests: string[];
  };
}

export const DEFAULT_STELLA_TRAJECTORY_DATA: UserTrajectoryPayload = {
  user: {
    id: 'u_001',
    nickname: 'Stella',
    online: true,
    lastSeenAt: '2025-06-01T11:40:00',
    mood: '😄',
    myLabel: '今天也要元气满满！',
    battery: 78,
    charging: false,
    isMoving: false,
    speedKmh: null,
    stayMinutes: 45,
    currentPoi: 'Leonie Bakery',
    distanceKm: 1.2,
    direction: '东南',
    locationUpdatedAt: '2025-06-01T12:15:00',
    visibility: 'shared',
    interests: ['Art Galleries', 'Smooth Jazz'],
  },
  today: {
    stats: {
      distanceKm: 8.4,
      moveMinutes: 52,
      steps: 6120,
      kcal: 320,
      avgSpeedKmh: 16,
      maxSpeedKmh: 45,
    },
    timeline: [
      { start: '08:30', end: '08:55', mode: 'bike', from: '家', to: '公司', durationMin: 25, distanceKm: 6.2 },
      { start: '08:55', end: '12:05', mode: 'stay', place: '公司', durationMin: 190 },
      { start: '12:05', end: '12:17', mode: 'walk', from: '公司', to: 'Leonie Bakery', durationMin: 12, distanceKm: 0.9 },
      { start: '12:17', end: null, mode: 'stay', place: 'Leonie Bakery', durationMin: 45, isCurrent: true },
    ],
    route: 'polyline-encoded-string',
    placesVisited: [
      { name: 'The Roastery', count: 12 },
      { name: '公司', count: 180 },
    ],
  },
  history: {
    range: '7d',
    days: [
      { date: '2025-05-31', distanceKm: 12.1, places: 5, mood: '😊', topPlaces: ['家', '健身房', 'Central Park'] },
    ],
    footprint: {
      cities: 8,
      totalKm: 2140,
      topPlaces: [{ name: 'The Roastery', count: 12 }],
    },
  },
  interactions: {
    streakDays: 6,
    weeklyCount: 23,
    closeness: 'BFF',
    sharingLocation: { active: true, minutes: 120 },
    sharedActivities: [
      { name: '城市骑行', time: '2025-06-01T18:00', status: 'upcoming', participants: ['u_001', 'u_002'] },
    ],
    commonPlaces: [{ name: 'Central Park', times: 5, last: '2025-05-28' }],
    recent: [{ type: 'like', by: 'Stella', summary: '赞了你的动态「周末骑行」', at: '2小时前' }],
  },
  locationSocial: {
    nearMiss: { last7Days: 3, last: '昨天 18:20', withinM: 500 },
    lowBatteryAlert: false,
    sosEnabled: true,
    arrivalAlerts: { on: true, places: ['家', '公司'] },
    badges: [
      { name: '足迹城市', value: 8 },
      { name: '连续打卡', value: 21 },
      { name: '活动达人', value: 15 },
    ],
    commonInterests: ['Art Galleries', 'Smooth Jazz'],
  },
};

export interface ZenlyMapInteractionDrawerProps {
  friend: Friend | null;
  isOpen: boolean;
  isNavigating?: boolean;
  trajectoryData?: UserTrajectoryPayload;
  onClose: () => void;
  onOpenChat: (friendId: string) => void;
  onStartNavigation: (lat: number, lng: number, name: string) => void;
  onStopNavigation?: () => void;
  onSendEmojiBomb?: (emoji: string, text?: string) => void;
  onTriggerBump?: (friend: Friend) => void;
  onQuickSnap?: () => void;
  onUpdateFriendRelationship?: (friendId: string, relationship: FriendRelationship) => void;
  onShowToast: (msg: string) => void;
}

export const ZenlyMapInteractionDrawer: React.FC<ZenlyMapInteractionDrawerProps> = ({
  friend,
  isOpen,
  isNavigating = false,
  trajectoryData,
  onClose,
  onOpenChat,
  onStartNavigation,
  onStopNavigation,
  onTriggerBump,
  onShowToast,
}) => {
  // Select active trajectory payload
  const payload: UserTrajectoryPayload = trajectoryData || DEFAULT_STELLA_TRAJECTORY_DATA;

  // Height state: 'compact' (~42% screen height) | 'expanded' (~78% screen height)
  const [expansionState, setExpansionState] = useState<'compact' | 'expanded'>('compact');

  // Active History Tab
  const [activeTab, setActiveTab] = useState<'today' | '7days' | 'footprint'>('today');

  // Trajectory Node Selection
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(3);

  // Playback States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const [playbackProgress, setPlaybackProgress] = useState<number>(60);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modal overlays inside card
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isMeetupModalOpen, setIsMeetupModalOpen] = useState(false);
  const [isShareLocationModalOpen, setIsShareLocationModalOpen] = useState(false);
  const [isArrivalAlertModalOpen, setIsArrivalAlertModalOpen] = useState(false);

  // Settings & options state
  const [shareDuration, setShareDuration] = useState<'15m' | '1h' | 'until_off'>('1h');
  const [alertCondition, setAlertCondition] = useState<'arrive' | 'leave' | 'overdue'>('arrive');
  const [privacySettings, setPrivacySettings] = useState({
    pauseUpdate: false,
    tempShare: true,
    approximateLocation: false,
    stopHistoryShare: false,
    retentionDays: '30',
    muteFriendLocation: false,
  });

  // Reset when friend changes or drawer opens
  useEffect(() => {
    if (isOpen) {
      setExpansionState('compact');
      setActiveTab('today');
      setSelectedNodeIndex(3);
      setIsPlaying(false);
      setPlaybackProgress(60);
    }
  }, [friend?.id, isOpen]);

  // Trajectory Playback Loop
  useEffect(() => {
    if (!isPlaying) return;

    playbackTimerRef.current = setInterval(() => {
      setPlaybackProgress((prev) => {
        const next = prev + 2 * playbackSpeed;
        if (next >= 100) {
          setTimeout(() => {
            setIsPlaying(false);
          }, 0);
          return 0;
        }
        return next;
      });
    }, 180);

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed]);

  if (!isOpen || !friend) return null;

  const nickname = payload.user.nickname || friend.name;
  const mood = payload.user.mood || friend.mood || '😄';
  const label = payload.user.myLabel || friend.status || '今天也要元气满满！';
  const batteryLevel = payload.user.battery ?? friend.battery ?? 78;
  const closeness = payload.interactions.closeness || 'BFF';
  const distanceStr = `${payload.user.distanceKm ?? 1.2} km ${payload.user.direction ?? '东南'}`;
  const currentPoi = payload.user.currentPoi || friend.locationName || 'Leonie Bakery';
  const stayMinutes = payload.user.stayMinutes ?? 45;

  // Render Transport Mode Icon
  const renderTransportIcon = (mode: string) => {
    switch (mode) {
      case 'walk':
      case 'walking':
        return <Footprints size={14} className="text-[#1877F2]" />;
      case 'bike':
      case 'bicycle':
        return <Bike size={14} className="text-amber-500" />;
      case 'car':
        return <Car size={14} className="text-[#1877F2]" />;
      case 'bus':
        return <Bus size={14} className="text-purple-500" />;
      case 'stay':
      case 'stationary':
        return <Coffee size={14} className="text-[#31A24C]" />;
      default:
        return <MapPin size={14} className="text-[#31A24C]" />;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-45 overflow-hidden select-none">
      {/* Facebook Straight-Edge Bottom User Trajectory Card Sheet */}
      <AnimatePresence>
        <motion.div
          key={`user-trajectory-card-${friend.id}`}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            height: expansionState === 'expanded' ? '78vh' : '42vh',
          }}
          className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-x border-[#E4E6EB] rounded-t-xl shadow-xl z-50 pointer-events-auto flex flex-col overflow-hidden transition-all duration-220 ease-out"
        >
          {/* Sheet Top Drag Handle Bar */}
          <div
            onClick={() => setExpansionState((prev) => (prev === 'compact' ? 'expanded' : 'compact'))}
            className="w-full py-2 bg-[#F0F2F5]/60 border-b border-[#E4E6EB] flex flex-col items-center justify-center cursor-pointer hover:bg-[#F0F2F5] transition-colors shrink-0"
            title="点击展开 / 收起卡片"
          >
            <div className="w-10 h-1 rounded-full bg-[#CBD5E1]" />
            <div className="flex items-center space-x-1 text-[9px] font-bold text-[#65676B] mt-1">
              <span>{expansionState === 'compact' ? '向上拖拽展开完整动态轨迹' : '轻触折叠卡片'}</span>
              {expansionState === 'compact' ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </div>
          </div>

          {/* Section 1: Card Top Header (User Profile, Mood, Battery, Closeness, Quick Actions) */}
          <div className="p-3 border-b border-[#E4E6EB] bg-white shrink-0">
            <div className="flex items-center justify-between gap-2">
              {/* User Avatar with Pulse Ring */}
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-white border-2 border-[#1877F2] ring-2 ring-[#1877F2]/30 ring-offset-1 animate-pulse overflow-hidden flex items-center justify-center">
                    <img
                      src={friend.avatar}
                      alt={nickname}
                      className="w-full h-full object-cover block"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#31A24C] border-2 border-white flex items-center justify-center text-[8px]">
                    {mood}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="text-sm font-bold text-[#050505] truncate">{nickname}</h3>
                    <span className="text-[9px] font-extrabold text-[#1877F2] bg-[#E7F3FF] border border-[#1877F2]/30 px-1.5 py-0.2 rounded-md shrink-0 flex items-center gap-0.5">
                      <Heart size={9} className="fill-[#1877F2]" />
                      {closeness}
                    </span>
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md shrink-0">
                      连续 {payload.interactions.streakDays} 天
                    </span>
                  </div>

                  <div className="text-[10px] text-[#050505] font-semibold mt-0.5 truncate flex items-center gap-1">
                    <span>{mood}</span>
                    <span className="italic text-[#65676B]">“{label}”</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-[#65676B] mt-0.5 truncate">
                    <span className="text-[#31A24C] font-bold flex items-center gap-0.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#31A24C] inline-block" />
                      在线
                    </span>
                    <span>·</span>
                    <span className="truncate">距你 {distanceStr}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Battery size={11} className={batteryLevel < 20 ? 'text-rose-500' : 'text-[#31A24C]'} />
                      {batteryLevel}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Vector Action Buttons Row */}
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenChat(friend.id)}
                  className="p-2 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1877F2] transition-colors cursor-pointer border border-[#E4E6EB]"
                  title="发消息"
                >
                  <MessageSquare size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => onShowToast(`📞 正在向 ${nickname} 发起语音通话...`)}
                  className="p-2 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#31A24C] transition-colors cursor-pointer border border-[#E4E6EB]"
                  title="语音通话"
                >
                  <Phone size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMeetupModalOpen(true)}
                  className="p-2 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-amber-600 transition-colors cursor-pointer border border-[#E4E6EB]"
                  title="约在这里见"
                >
                  <MapPin size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="p-2 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] transition-colors cursor-pointer border border-[#E4E6EB]"
                  title="更多隐私设置"
                >
                  <Sliders size={15} />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] transition-colors cursor-pointer border border-[#E4E6EB] ml-1"
                  title="关闭卡片"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Interests & Sharing status bar */}
            <div className="mt-2 pt-2 border-t border-[#E4E6EB]/60 flex items-center justify-between text-[9.5px] text-[#65676B] flex-wrap gap-1">
              <div className="flex items-center space-x-1">
                <span className="font-bold text-[#050505]">共同兴趣:</span>
                {payload.locationSocial.commonInterests.map((interest, idx) => (
                  <span key={`comm-int-${interest}-${idx}`} className="bg-[#F0F2F5] px-1.5 py-0.2 rounded text-[#1877F2] font-semibold border border-[#E4E6EB]">
                    {interest}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-1">
                <Shield size={10} className="text-[#1877F2]" />
                <span>实时位置共享中 (剩余 {payload.interactions.sharingLocation.minutes} 分钟)</span>
              </div>
            </div>
          </div>

          {/* Scrollable Main Content Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E4E6EB] bg-white">
            {/* Section 2: Current POI Status & Today's 6-Grid Activity Metrics */}
            <div className="p-3 bg-[#F0F2F5]/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1877F2] animate-ping" />
                  <h4 className="text-xs font-black text-[#050505] tracking-tight">当前位置</h4>
                  <span className="text-[9.5px] font-bold text-[#31A24C] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                    静止停留中
                  </span>
                </div>
                <span className="text-[10px] text-[#65676B]">更新于 12:15</span>
              </div>

              {/* Current POI Highlight Box */}
              <div className="bg-white border border-[#E4E6EB] rounded-md p-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="p-2 rounded-md bg-[#E7F3FF] text-[#1877F2] shrink-0">
                    <Coffee size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#050505] truncate">{currentPoi}</div>
                    <div className="text-[10.5px] text-[#65676B] mt-0.5">
                      已停留 <strong className="text-[#1877F2]">{stayMinutes} 分钟</strong> · 距离你 {distanceStr}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onStartNavigation(36.0580, 103.8390, currentPoi)}
                  className="px-2.5 py-1 rounded bg-[#1877F2] hover:bg-[#166fe5] text-white text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Navigation size={11} />
                  <span>导航</span>
                </button>
              </div>

              {/* Today's 6-Grid Stats Panel */}
              <div className="bg-white border border-[#E4E6EB] rounded-md p-2.5 space-y-2">
                <div className="text-[11px] font-bold text-[#050505] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Activity size={13} className="text-[#1877F2]" />
                    <span>今日活动数据统计</span>
                  </span>
                  <span className="text-[9.5px] text-[#65676B] font-normal">目标完成度 85%</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className="bg-[#F0F2F5] p-2 rounded border border-[#E4E6EB]">
                    <div className="text-[#65676B] text-[9px]">移动总距</div>
                    <div className="font-bold text-[#1877F2] text-xs">{payload.today.stats.distanceKm} km</div>
                  </div>
                  <div className="bg-[#F0F2F5] p-2 rounded border border-[#E4E6EB]">
                    <div className="text-[#65676B] text-[9px]">今日步数</div>
                    <div className="font-bold text-[#050505] text-xs">{payload.today.stats.steps.toLocaleString()} 步</div>
                  </div>
                  <div className="bg-[#F0F2F5] p-2 rounded border border-[#E4E6EB]">
                    <div className="text-[#65676B] text-[9px]">消耗热量</div>
                    <div className="font-bold text-rose-600 text-xs">{payload.today.stats.kcal} kcal</div>
                  </div>
                  <div className="bg-[#F0F2F5] p-2 rounded border border-[#E4E6EB]">
                    <div className="text-[#65676B] text-[9px]">运动时长</div>
                    <div className="font-bold text-[#31A24C] text-xs">{payload.today.stats.moveMinutes} 分钟</div>
                  </div>
                  <div className="bg-[#F0F2F5] p-2 rounded border border-[#E4E6EB]">
                    <div className="text-[#65676B] text-[9px]">平均速度</div>
                    <div className="font-bold text-[#050505] text-xs">{payload.today.stats.avgSpeedKmh} km/h</div>
                  </div>
                  <div className="bg-[#F0F2F5] p-2 rounded border border-[#E4E6EB]">
                    <div className="text-[#65676B] text-[9px]">最高车速</div>
                    <div className="font-bold text-amber-600 text-xs">{payload.today.stats.maxSpeedKmh} km/h</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Today's Activity Timeline ("今日时间线轨迹") */}
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#050505] flex items-center space-x-1.5">
                  <Clock size={13} className="text-[#1877F2]" />
                  <span>今日路线与时间线 (Timeline)</span>
                </h4>

                {/* Trajectory Playback Controls */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-2 py-1 rounded text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-2xs'
                    }`}
                  >
                    {isPlaying ? <Pause size={11} /> : <Play size={11} />}
                    <span>{isPlaying ? '暂停回放' : '回放轨迹'}</span>
                  </button>

                  <div className="flex items-center bg-[#F0F2F5] p-0.5 rounded border border-[#E4E6EB] text-[9px]">
                    {[1, 2, 4].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPlaybackSpeed(s as 1 | 2 | 4)}
                        className={`px-1 py-0.5 rounded font-bold cursor-pointer ${
                          playbackSpeed === s ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-[#65676B]'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-3 space-y-2.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4E6EB]">
                {payload.today.timeline.map((node, index) => {
                  const isSelected = selectedNodeIndex === index;
                  const isCurrent = node.isCurrent || index === payload.today.timeline.length - 1;

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedNodeIndex(index)}
                      className={`relative flex items-start space-x-2.5 p-2 rounded-md border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E7F3FF]/60 border-[#1877F2]'
                          : 'bg-white border-[#E4E6EB] hover:bg-[#F0F2F5]/50'
                      }`}
                    >
                      {/* Timeline Node Dot */}
                      <div
                        className={`absolute -left-3.5 top-3 w-2.5 h-2.5 rounded-full border-2 border-white shrink-0 ${
                          isCurrent ? 'bg-[#1877F2] ring-2 ring-[#1877F2]/40 animate-pulse' : 'bg-[#31A24C]'
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-black text-[#050505]">
                              {node.start} {node.end ? `- ${node.end}` : '- 现在'}
                            </span>
                            <span className="text-[9.5px] font-bold text-[#1877F2] bg-[#E7F3FF] border border-[#1877F2]/20 px-1 py-0.2 rounded">
                              {node.mode === 'bike' ? '骑行' : node.mode === 'walk' ? '步行' : '停留'}
                            </span>
                          </div>
                          {node.distanceKm && (
                            <span className="text-[10px] font-bold text-[#050505]">
                              {node.distanceKm} km
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-bold text-[#050505] mt-1 flex items-center space-x-1">
                          {renderTransportIcon(node.mode)}
                          <span>
                            {node.place
                              ? `停留在 ${node.place}`
                              : `从 ${node.from} 前往 ${node.to}`}
                          </span>
                        </div>

                        <div className="text-[10px] text-[#65676B] mt-0.5">
                          耗时 {node.durationMin} 分钟 · GPS 厘米级精确定位
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 4: History & Footprint ("足迹与历史纪录") */}
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#050505] flex items-center space-x-1.5">
                  <Globe size={13} className="text-[#1877F2]" />
                  <span>足迹地图与历史统计</span>
                </h4>

                {/* History Tabs */}
                <div className="flex items-center bg-[#F0F2F5] p-0.5 rounded border border-[#E4E6EB] text-[10px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('today')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                      activeTab === 'today' ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-[#65676B]'
                    }`}
                  >
                    概览
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('7days')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                      activeTab === '7days' ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-[#65676B]'
                    }`}
                  >
                    近 7 天
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('footprint')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                      activeTab === 'footprint' ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-[#65676B]'
                    }`}
                  >
                    城市足迹
                  </button>
                </div>
              </div>

              {/* Tab 1: Footprint Summary */}
              {activeTab === 'footprint' && (
                <div className="space-y-2 text-[11px]">
                  <div className="grid grid-cols-2 gap-1.5 bg-[#E7F3FF]/50 p-2 rounded-md border border-[#1877F2]/30">
                    <div>
                      <span className="text-[#65676B] text-[10px]">足迹涉及城市：</span>
                      <strong className="text-[#1877F2] block text-sm font-black">
                        {payload.history.footprint.cities} 个城市
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#65676B] text-[10px]">累计总行进里程：</span>
                      <strong className="text-[#050505] block text-sm font-black">
                        {payload.history.footprint.totalKm.toLocaleString()} km
                      </strong>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E4E6EB] p-2.5 rounded-md space-y-1.5">
                    <div className="font-bold text-[#050505] text-[11px] flex items-center gap-1">
                      <Building size={12} className="text-[#1877F2]" />
                      <span>高频常去打卡地 (Visited Places)：</span>
                    </div>
                    {payload.today.placesVisited.map((place, idx) => (
                      <div key={`visited-place-${place.name}-${idx}`} className="flex items-center justify-between text-[10.5px] p-1.5 bg-[#F0F2F5] rounded">
                        <span className="font-semibold text-[#050505]">{place.name}</span>
                        <span className="text-[#1877F2] font-bold">已到访 {place.count} 次</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: 7-day History */}
              {activeTab === '7days' && (
                <div className="space-y-2 text-[11px]">
                  {payload.history.days.map((day, idx) => (
                    <div
                      key={`hist-day-${day.date}-${idx}`}
                      onClick={() => onShowToast(`📅 已调出 ${day.date} 的历史轨迹`)}
                      className="bg-white border border-[#E4E6EB] hover:bg-[#F0F2F5] p-2 rounded-md flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-[#050505] flex items-center space-x-1.5">
                          <span>{day.date}</span>
                          <span className="text-xs">{day.mood}</span>
                        </div>
                        <div className="text-[10px] text-[#65676B] mt-0.5">
                          行进 {day.distanceKm} km · 打卡 {day.places} 处地点 (常去: {day.topPlaces.join(', ')})
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-[#65676B]" />
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Overview default */}
              {activeTab === 'today' && (
                <div className="bg-[#F0F2F5]/60 border border-[#E4E6EB] p-2.5 rounded-md space-y-1.5 text-[10.5px]">
                  <div className="flex items-center justify-between text-[#050505]">
                    <span>🏙️ 足迹城市：</span>
                    <strong className="text-[#1877F2]">{payload.history.footprint.cities} 个城市</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#050505]">
                    <span>📍 常去主打卡点：</span>
                    <span>{payload.today.placesVisited.map((p) => p.name).join(' / ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#050505]">
                    <span>🔥 连续记录：</span>
                    <span className="text-[#31A24C] font-bold">打卡连续 {payload.interactions.streakDays} 天</span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: Interaction & Near Miss Social ("社交互动与擦肩而过") */}
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-[#050505] flex items-center space-x-1.5">
                <Users size={13} className="text-[#1877F2]" />
                <span>社交互动与缘分连结</span>
              </h4>

              <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                {/* Near Miss Alert Box */}
                <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-md flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-md bg-amber-500 text-white shrink-0">
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <div className="font-bold text-amber-900 text-[11px]">近7天 3 次擦肩而过 (Near Miss)</div>
                      <div className="text-[10px] text-amber-700 mt-0.5">
                        上次相遇：{payload.locationSocial.nearMiss.last} · 距离 &lt; {payload.locationSocial.nearMiss.withinM}m
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onShowToast('✨ 已向对方发送缘分擦肩招呼！')}
                    className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[9.5px] font-bold shrink-0 cursor-pointer shadow-2xs"
                  >
                    打招呼
                  </button>
                </div>

                {/* Shared Activity Box */}
                {payload.interactions.sharedActivities.map((act, idx) => (
                  <div key={`shared-act-${act.name}-${idx}`} className="bg-white border border-[#E4E6EB] p-2 rounded-md flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#65676B]">共同活动计划：</div>
                      <div className="font-bold text-[#050505] text-[11px]">🚴 {act.name}</div>
                      <div className="text-[9.5px] text-[#1877F2] font-semibold mt-0.5">{act.time} · 即将开始</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onShowToast(`🚴 已打开活动「${act.name}」详情`)}
                      className="px-2 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1877F2] rounded text-[10px] font-bold border border-[#E4E6EB] cursor-pointer"
                    >
                      查看活动
                    </button>
                  </div>
                ))}

                {/* Recent Interaction */}
                {payload.interactions.recent.map((rec, idx) => (
                  <div
                    key={`recent-inter-${rec.at}-${idx}`}
                    onClick={() => onOpenChat(friend.id)}
                    className="bg-white border border-[#E4E6EB] hover:bg-[#F0F2F5] p-2 rounded-md cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[10px] text-[#65676B]">最近动态互动：</div>
                      <div className="font-bold text-[#050505] truncate">{rec.summary}</div>
                    </div>
                    <span className="text-[9px] text-[#65676B] shrink-0 ml-2">{rec.at}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6: Social Badges Grid */}
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-[#050505] flex items-center space-x-1.5">
                <Award size={13} className="text-amber-500" />
                <span>地图勋章与成就 (Badges)</span>
              </h4>

              <div className="grid grid-cols-3 gap-2">
                {payload.locationSocial.badges.map((badge, idx) => (
                  <div
                    key={`social-badge-${badge.name}-${idx}`}
                    className="bg-white border border-[#E4E6EB] hover:border-[#1877F2] p-2 rounded-md text-center space-y-0.5 transition-colors cursor-pointer"
                    onClick={() => onShowToast(`🏆 成就「${badge.name}」: ${badge.value}`)}
                  >
                    <div className="flex justify-center text-amber-500">
                      {idx === 0 ? <Globe size={16} /> : idx === 1 ? <Flame size={16} /> : <Zap size={16} />}
                    </div>
                    <div className="text-[10px] font-bold text-[#050505] truncate">{badge.name}</div>
                    <div className="text-[11px] font-black text-[#1877F2]">{badge.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 7: Fixed Bottom Quick Action Bar (4 Core Buttons) */}
          <div className="p-2.5 bg-white border-t border-[#E4E6EB] grid grid-cols-4 gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenChat(friend.id)}
              className="bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-2 rounded-md text-[11px] flex flex-col items-center justify-center space-y-0.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>发消息</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMeetupModalOpen(true)}
              className="bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] font-bold py-2 rounded-md text-[11px] flex flex-col items-center justify-center space-y-0.5 border border-[#E4E6EB] transition-all active:scale-95 cursor-pointer"
            >
              <MapPin size={14} className="text-[#1877F2]" />
              <span>约在这里见</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playShareSound();
                setIsShareLocationModalOpen(true);
              }}
              className="bg-[#EBF7EE] hover:bg-[#D8F2DD] text-[#31A24C] font-bold py-2 rounded-md text-[11px] flex flex-col items-center justify-center space-y-0.5 border border-[#31A24C]/30 transition-all active:scale-95 cursor-pointer shadow-2xs group"
            >
              <Share2 size={14} className="text-[#31A24C] transition-transform group-active:scale-125" />
              <span>分享位置</span>
            </button>

            <button
              type="button"
              onClick={() => setIsArrivalAlertModalOpen(true)}
              className="bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] font-bold py-2 rounded-md text-[11px] flex flex-col items-center justify-center space-y-0.5 border border-[#E4E6EB] transition-all active:scale-95 cursor-pointer"
            >
              <Bell size={14} className="text-amber-600" />
              <span>到达提醒</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modal 1: Meetup Modal ("约在这里见") */}
      {isMeetupModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white border border-[#E4E6EB] rounded-lg max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-sm font-bold text-[#050505] flex items-center space-x-1.5">
                <MapPin size={16} className="text-[#1877F2]" />
                <span>与 {nickname} 约在 {currentPoi} 见面</span>
              </h3>
              <button type="button" onClick={() => setIsMeetupModalOpen(false)} className="text-[#65676B]">
                <X size={16} />
              </button>
            </div>

            <div className="bg-[#F0F2F5] p-3 rounded-md space-y-1.5 text-xs">
              <div className="font-bold text-[#050505]">约定地点：{currentPoi}</div>
              <div className="text-[#65676B]">距你 {distanceStr} · 双方步行/自行车均可轻松抵达</div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsMeetupModalOpen(false)}
                className="px-3 py-1.5 rounded-md border border-[#E4E6EB] text-xs font-bold text-[#65676B]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMeetupModalOpen(false);
                  onShowToast(`📍 已成功向 ${nickname} 发送见面邀请！`);
                }}
                className="px-3 py-1.5 rounded-md bg-[#1877F2] text-white text-xs font-bold"
              >
                发送见面邀请
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Share Location Duration Modal */}
      {isShareLocationModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white border border-[#E4E6EB] rounded-lg max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-sm font-bold text-[#050505] flex items-center space-x-1.5">
                <Share2 size={16} className="text-[#31A24C]" />
                <span>选择向 {nickname} 共享位置时长</span>
              </h3>
              <button type="button" onClick={() => setIsShareLocationModalOpen(false)} className="text-[#65676B]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                { id: '15m', label: '15 分钟' },
                { id: '1h', label: '1 小时' },
                { id: 'until_off', label: '直到我手动关闭' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setShareDuration(item.id as any)}
                  className={`p-2.5 rounded-md border flex items-center justify-between cursor-pointer ${
                    shareDuration === item.id ? 'border-[#1877F2] bg-[#E7F3FF]/50 font-bold' : 'border-[#E4E6EB]'
                  }`}
                >
                  <span>{item.label}</span>
                  {shareDuration === item.id && <CheckCircle2 size={15} className="text-[#1877F2]" />}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsShareLocationModalOpen(false);
                onShowToast(`✅ 已向 ${nickname} 共享位置，时长：${shareDuration === '15m' ? '15分钟' : shareDuration === '1h' ? '1小时' : '直到关闭'}`);
              }}
              className="w-full py-2 bg-[#1877F2] text-white font-bold text-xs rounded-md"
            >
              确认共享
            </button>
          </div>
        </div>
      )}

      {/* Modal 3: Set Arrival Alert Modal */}
      {isArrivalAlertModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white border border-[#E4E6EB] rounded-lg max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-sm font-bold text-[#050505] flex items-center space-x-1.5">
                <Bell size={16} className="text-amber-600" />
                <span>设置 {nickname} 到达提醒</span>
              </h3>
              <button type="button" onClick={() => setIsArrivalAlertModalOpen(false)} className="text-[#65676B]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                { id: 'arrive', label: '到达【家/公司/Leonie Bakery】时提醒我' },
                { id: 'leave', label: '离开当前位置时提醒我' },
                { id: 'overdue', label: '超过预计到达时间时提醒我' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setAlertCondition(item.id as any)}
                  className={`p-2.5 rounded-md border flex items-center justify-between cursor-pointer ${
                    alertCondition === item.id ? 'border-[#1877F2] bg-[#E7F3FF]/50 font-bold' : 'border-[#E4E6EB]'
                  }`}
                >
                  <span>{item.label}</span>
                  {alertCondition === item.id && <CheckCircle2 size={15} className="text-[#1877F2]" />}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsArrivalAlertModalOpen(false);
                onShowToast(`🔔 已成功开启 ${nickname} 的到达提醒！`);
              }}
              className="w-full py-2 bg-[#1877F2] text-white font-bold text-xs rounded-md"
            >
              保存提醒设置
            </button>
          </div>
        </div>
      )}

      {/* Modal 4: Privacy & Security Settings Modal */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white border border-[#E4E6EB] rounded-lg max-w-sm w-full p-4 space-y-3 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-sm font-bold text-[#050505] flex items-center space-x-1.5">
                <Shield size={16} className="text-[#1877F2]" />
                <span>隐私和安全设置</span>
              </h3>
              <button type="button" onClick={() => setIsPrivacyModalOpen(false)} className="text-[#65676B]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 bg-[#F0F2F5] rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <span>暂停我的位置更新</span>
                  <input
                    type="checkbox"
                    checked={privacySettings.pauseUpdate}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, pauseUpdate: e.target.checked })}
                    className="accent-[#1877F2] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>共享大概位置 (120m 模糊范围)</span>
                  <input
                    type="checkbox"
                    checked={privacySettings.approximateLocation}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, approximateLocation: e.target.checked })}
                    className="accent-[#1877F2] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>停止共享历史轨迹</span>
                  <input
                    type="checkbox"
                    checked={privacySettings.stopHistoryShare}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, stopHistoryShare: e.target.checked })}
                    className="accent-[#1877F2] cursor-pointer"
                  />
                </div>
              </div>

              <div className="border-t border-[#E4E6EB] pt-2 space-y-1.5">
                <button
                  type="button"
                  onClick={() => onShowToast(`👁️ 当前包含：${nickname} 等 3 位星级好友可查看你的位置`)}
                  className="w-full p-2 bg-white border border-[#E4E6EB] rounded-md text-left font-bold text-[#050505] flex justify-between items-center"
                >
                  <span>查看谁可以看到我的位置</span>
                  <ChevronRight size={14} className="text-[#65676B]" />
                </button>

                <button
                  type="button"
                  onClick={() => onShowToast('⚠️ 已将该位置定位偏差问题提交给系统打标排查')}
                  className="w-full p-2 bg-white border border-[#E4E6EB] rounded-md text-left text-rose-600 font-bold flex justify-between items-center"
                >
                  <span>举报错误定位</span>
                  <ChevronRight size={14} className="text-[#65676B]" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsPrivacyModalOpen(false);
                onShowToast('⚙️ 隐私与安全设置已更新');
              }}
              className="w-full py-2 bg-[#1877F2] text-white font-bold text-xs rounded-md"
            >
              关闭并保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
