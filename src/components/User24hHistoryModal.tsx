import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Car,
  Footprints,
  Clock,
  Users,
  Navigation,
  Share2,
  Radio,
  Plus,
  Compass,
  Check,
  Send,
  Sparkles,
  Trash2,
  BatteryCharging,
  Battery,
  Flame,
  Zap,
  EyeOff,
  Eye,
  ShieldCheck,
  Building2,
  TrendingUp,
  History,
  Award,
  Globe,
  Activity,
  ArrowUpRight,
  Smile,
} from 'lucide-react';
import { TrajectoryPoint, FriendTrajectory } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

export interface FrequentPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  frequencyTag: string;
  visitCount: number;
  category?: string;
}

export interface FrequentCity {
  id: string;
  cityName: string;
  province: string;
  percent: number;
  days: number;
  tag: string;
  isCurrent: boolean;
}

export interface RecentVisitedPlace {
  id: string;
  name: string;
  timeAgo: string;
  stayDuration: string;
  address: string;
  lat: number;
  lng: number;
  mode: 'stay' | 'walking' | 'car';
}

const INITIAL_FREQUENT_CITIES: FrequentCity[] = [
  {
    id: 'city-1',
    cityName: '兰州市',
    province: '甘肃省',
    percent: 78,
    days: 24,
    tag: '常驻城市 · 本月活跃',
    isCurrent: true,
  },
  {
    id: 'city-2',
    cityName: '成都市',
    province: '四川省',
    percent: 14,
    days: 4,
    tag: '近期到访 · 旅行休闲',
    isCurrent: false,
  },
  {
    id: 'city-3',
    cityName: '西安市',
    province: '陕西省',
    percent: 8,
    days: 2,
    tag: '历史打卡 · 周末漫游',
    isCurrent: false,
  },
];

const INITIAL_FREQUENT_PLACES: FrequentPlace[] = [
  {
    id: 'fp-1',
    name: '兰州市城关区 东方红广场',
    address: '甘肃省兰州市城关区庆阳路149号',
    lat: 36.0611,
    lng: 103.8343,
    frequencyTag: '本周 14 次 · 常驻生活圈',
    visitCount: 14,
    category: '商业综合体',
  },
  {
    id: 'fp-2',
    name: '西北师范大学 (知行校区)',
    address: '甘肃省兰州市安宁区安宁东路967号',
    lat: 36.0968,
    lng: 103.7321,
    frequencyTag: '本周 8 次 · 学习科研',
    visitCount: 8,
    category: '高等院校',
  },
  {
    id: 'fp-3',
    name: '兰州老街',
    address: '甘肃省兰州市七里河区马滩文化岛',
    lat: 36.0715,
    lng: 103.7388,
    frequencyTag: '本周 6 次 · 聚会休闲',
    visitCount: 6,
    category: '文化旅游',
  },
  {
    id: 'fp-4',
    name: '黄河风情线 · 中山铁桥',
    address: '甘肃省兰州市城关区南滨河东路中段',
    lat: 36.0642,
    lng: 103.8185,
    frequencyTag: '本周 5 次 · 散步漫游',
    visitCount: 5,
    category: '地标公园',
  },
  {
    id: 'fp-5',
    name: '兰州万达广场 (城关店)',
    address: '甘肃省兰州市城关区天水北路28号',
    lat: 36.0682,
    lng: 103.8624,
    frequencyTag: '本周 4 次 · 餐饮购物',
    visitCount: 4,
    category: '购物中心',
  },
];

const INITIAL_RECENT_PLACES: RecentVisitedPlace[] = [
  {
    id: 'rp-1',
    name: '东方红广场 · 户外步行街',
    timeAgo: '刚刚 (18:25)',
    stayDuration: '停留 1.5 小时',
    address: '甘肃省兰州市城关区庆阳路149号',
    lat: 36.0611,
    lng: 103.8343,
    mode: 'stay',
  },
  {
    id: 'rp-2',
    name: '正宁路小吃夜市',
    timeAgo: '今日 15:40',
    stayDuration: '停留 45 分钟',
    address: '甘肃省兰州市城关区正宁路',
    lat: 36.0562,
    lng: 103.8241,
    mode: 'walking',
  },
  {
    id: 'rp-3',
    name: '西北师范大学 图书馆',
    timeAgo: '今日 11:20',
    stayDuration: '停留 3.8 小时',
    address: '甘肃省兰州市安宁区安宁东路967号',
    lat: 36.0968,
    lng: 103.7321,
    mode: 'stay',
  },
  {
    id: 'rp-4',
    name: '兰州老街 中心水景广场',
    timeAgo: '昨天 20:10',
    stayDuration: '停留 2.0 小时',
    address: '甘肃省兰州市七里河区马滩文化岛',
    lat: 36.0715,
    lng: 103.7388,
    mode: 'car',
  },
  {
    id: 'rp-5',
    name: '中山铁桥 观景台',
    timeAgo: '昨天 14:30',
    stayDuration: '停留 1.2 小时',
    address: '甘肃省兰州市城关区南滨河东路中段',
    lat: 36.0642,
    lng: 103.8185,
    mode: 'walking',
  },
];

interface User24hHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userAvatar?: string;
  userNote?: string;
  userBattery?: number;
  isBatteryCharging?: boolean;
  isStealthMode?: boolean;
  onToggleStealth?: () => void;
  trajectoryPoints: TrajectoryPoint[];
  friendTrajectories?: FriendTrajectory[];
  selectedTimeHour: number;
  onTimeHourChange: (hour: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
  showFriendTrajectories: boolean;
  onToggleShowFriends: () => void;
  onShareInstantLocation?: (locationInfo: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    isLive: boolean;
  }) => void;
  onShareFrequentPlace?: (place: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    frequencyTag?: string;
  }) => void;
  onFlyToLocation?: (loc: { lat: number; lng: number; name?: string }) => void;
}

export const User24hHistoryModal: React.FC<User24hHistoryModalProps> = ({
  isOpen,
  onClose,
  userName = 'Alexia',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  userNote = '探索生活每个转角 ✨',
  userBattery = 98,
  isBatteryCharging = true,
  isStealthMode = false,
  onToggleStealth,
  trajectoryPoints,
  friendTrajectories = [],
  selectedTimeHour,
  onTimeHourChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangePlaybackSpeed,
  showFriendTrajectories,
  onToggleShowFriends,
  onShareInstantLocation,
  onShareFrequentPlace,
  onFlyToLocation,
}) => {
  const [frequentPlaces, setFrequentPlaces] = useState<FrequentPlace[]>(
    INITIAL_FREQUENT_PLACES
  );
  const [frequentCities] = useState<FrequentCity[]>(INITIAL_FREQUENT_CITIES);
  const [recentPlaces] = useState<RecentVisitedPlace[]>(INITIAL_RECENT_PLACES);
  const [newPlaceInput, setNewPlaceInput] = useState('');
  const [activeTab, setActiveTab] = useState<'myWorld' | 'trajectory'>('myWorld');
  const [myWorldSubTab, setMyWorldSubTab] = useState<'topPlaces' | 'cities' | 'recent'>(
    'topPlaces'
  );

  if (!isOpen) return null;

  // Find nearest trajectory point matching current time hour
  const currentPoint = trajectoryPoints.reduce((prev, curr) => {
    return Math.abs(curr.timeHour - selectedTimeHour) <
      Math.abs(prev.timeHour - selectedTimeHour)
      ? curr
      : prev;
  }, trajectoryPoints[0] || {
    id: 'tp-def',
    lat: 36.0611,
    lng: 103.8343,
    timeHour: selectedTimeHour,
    timeLabel: '12:00',
    locationName: '兰州市城关区 东方红广场',
    speedKmh: 0,
    transportMode: 'stationary',
  });

  // Calculate percentage for progress slider
  const sliderPercent = Math.min(
    100,
    Math.max(0, (selectedTimeHour / 24) * 100)
  );

  // Clean time label string
  const cleanTime = currentPoint.timeLabel.replace(/\s*\([^)]*\)/g, '').trim();

  // Key stay points along 24h
  const stayPoints = trajectoryPoints.filter((pt) => pt.isStayPoint);

  const handleAddFrequentPlace = () => {
    if (!newPlaceInput.trim()) return;
    soundEffects.playSuccessSound();
    haptics.trigger('light');

    const newPlace: FrequentPlace = {
      id: `fp-${Date.now()}`,
      name: newPlaceInput.trim(),
      address: `甘肃省兰州市 · ${newPlaceInput.trim()}`,
      lat: currentPoint.lat || 36.0611,
      lng: currentPoint.lng || 103.8343,
      frequencyTag: '刚刚添加 · 自定义常去',
      visitCount: 1,
      category: '自定义地点',
    };

    setFrequentPlaces((prev) => [newPlace, ...prev]);
    setNewPlaceInput('');
  };

  const handleDeletePlace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playTapSound();
    haptics.trigger('light');
    setFrequentPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  const handleShareInstantLocationClick = () => {
    soundEffects.playTapSound();
    haptics.trigger('medium');
    if (onShareInstantLocation) {
      onShareInstantLocation({
        name: currentPoint.locationName || '兰州市城关区 东方红广场',
        address: '甘肃省兰州市城关区南滨河东路',
        lat: currentPoint.lat || 36.0611,
        lng: currentPoint.lng || 103.8343,
        isLive: true,
      });
    }
  };

  const handleSharePlaceClick = (place: FrequentPlace, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEffects.playTapSound();
    haptics.trigger('medium');
    if (onShareFrequentPlace) {
      onShareFrequentPlace({
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        frequencyTag: place.frequencyTag,
      });
    }
  };

  const handleFlyTo = (lat: number, lng: number, name: string) => {
    soundEffects.playTapSound();
    haptics.trigger('light');
    if (onFlyToLocation) {
      onFlyToLocation({ lat, lng, name });
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-[430px] z-50 pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',sans-serif]">
      {/* Facebook Straight-Edge Clean Frame Modal Card (Adapting full phone screen width) */}
      <div className="bg-white border-t sm:border-x border-[#E4E6EB] rounded-t-[20px] shadow-[0_-8px_32px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col max-h-[82vh] transition-all">
        {/* Top Drag Grabber */}
        <div className="w-10 h-1.2 rounded-full bg-[#CED0D5] mx-auto mt-2.5 mb-1 shrink-0" />

        {/* User Profile Header: Avatar, Name, Battery, Ghost Mode Switch */}
        <div className="px-3.5 py-2.5 border-b border-[#E4E6EB] bg-white shrink-0">
          <div className="flex items-center justify-between gap-2.5">
            {/* Left: Avatar & Nickname & Status */}
            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img
                  src={userAvatar}
                  alt={userName}
                  className={`w-11 h-11 rounded-full object-cover border-2 shadow-2xs ${
                    isStealthMode
                      ? 'border-[#AF52DE] ring-2 ring-[#AF52DE]/30'
                      : 'border-[#31A24C] ring-2 ring-[#31A24C]/25'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${
                    isStealthMode ? 'bg-[#AF52DE]' : 'bg-[#31A24C]'
                  }`}
                  title={isStealthMode ? '幽灵隐身中' : '实时在线'}
                >
                  {isStealthMode ? (
                    <EyeOff size={8} className="text-white" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-sm font-bold text-[#050505] truncate tracking-tight">
                    {userName}
                  </h3>
                  <span className="bg-[#E7F3FF] text-[#1877F2] text-[10px] font-bold px-1.5 py-0.2 rounded border border-[#1877F2]/20 shrink-0">
                    我的主页
                  </span>
                  {isStealthMode && (
                    <span className="bg-[#AF52DE]/10 text-[#AF52DE] text-[9.5px] font-bold px-1.5 py-0.2 rounded border border-[#AF52DE]/20 shrink-0">
                      👻 幽灵中
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#65676B] truncate font-normal mt-0.5">
                  {userNote || '探索生活每个转角 ✨'}
                </p>
              </div>
            </div>

            {/* Right: Close & Share actions */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={handleShareInstantLocationClick}
                className="px-2.5 py-1.5 rounded-md bg-[#1877F2] hover:bg-[#166FE5] text-white text-[11px] font-bold flex items-center space-x-1 shadow-2xs cursor-pointer active:scale-95 transition-all"
                title="分享即时定位给好友"
              >
                <Radio size={12} className="animate-pulse" />
                <span>分享定位</span>
              </button>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] hover:text-[#050505] flex items-center justify-center cursor-pointer transition-all active:scale-90 shrink-0"
                aria-label="关闭卡片"
              >
                <X size={15} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* Sub-row: Battery Bar & Stealth Mode Quick Switch */}
          <div className="mt-2.5 pt-2 border-t border-[#E4E6EB]/80 grid grid-cols-2 gap-2">
            {/* Battery Indicator Card */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#F0F2F5] border border-[#E4E6EB]">
              <div className="flex items-center space-x-1.5 min-w-0">
                {isBatteryCharging ? (
                  <BatteryCharging size={15} className="text-[#31A24C] shrink-0 animate-pulse" />
                ) : (
                  <Battery size={15} className="text-[#1877F2] shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[10px] text-[#65676B] leading-none">我的电量</div>
                  <div className="text-[11px] font-bold text-[#050505] leading-tight mt-0.5 flex items-center gap-1">
                    <span>{userBattery}%</span>
                    <span className="text-[9px] font-normal text-[#31A24C]">
                      {isBatteryCharging ? '充电中 ⚡' : '正常'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-9 h-1.5 rounded-full bg-[#CED0D5] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    userBattery > 20 ? 'bg-[#31A24C]' : 'bg-rose-500'
                  }`}
                  style={{ width: `${userBattery}%` }}
                />
              </div>
            </div>

            {/* Ghost / Stealth Mode Toggle Switch */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playTapSound();
                haptics.trigger('medium');
                if (onToggleStealth) onToggleStealth();
              }}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border transition-all cursor-pointer text-left ${
                isStealthMode
                  ? 'bg-[#AF52DE]/10 border-[#AF52DE]/30 hover:bg-[#AF52DE]/15'
                  : 'bg-[#F0F2F5] border-[#E4E6EB] hover:bg-[#E4E6EB]'
              }`}
              title="切换幽灵隐身模式"
            >
              <div className="flex items-center space-x-1.5 min-w-0">
                {isStealthMode ? (
                  <EyeOff size={14} className="text-[#AF52DE] shrink-0" />
                ) : (
                  <Eye size={14} className="text-[#1877F2] shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[10px] text-[#65676B] leading-none">幽灵模式</div>
                  <div
                    className={`text-[11px] font-bold leading-tight mt-0.5 truncate ${
                      isStealthMode ? 'text-[#AF52DE]' : 'text-[#050505]'
                    }`}
                  >
                    {isStealthMode ? '已隐身 · 坐标冻结' : '实时公开 · 正常共享'}
                  </div>
                </div>
              </div>

              {/* iOS-Style Toggle Pill */}
              <div
                className={`w-7 h-4 rounded-full p-0.5 transition-colors shrink-0 ${
                  isStealthMode ? 'bg-[#AF52DE]' : 'bg-[#CED0D5]'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white shadow-2xs transition-transform ${
                    isStealthMode ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Movement Statistics Grid (今日移动统计) */}
          <div className="mt-2.5 grid grid-cols-4 gap-1.5">
            <div className="bg-[#F0F2F5] rounded-md p-1.5 text-center border border-[#E4E6EB]">
              <div className="text-[9px] text-[#65676B] flex items-center justify-center space-x-0.5">
                <Navigation size={9.5} className="text-[#1877F2]" />
                <span>今日里程</span>
              </div>
              <div className="font-bold text-[#1877F2] text-xs mt-0.5">
                18.4 <span className="text-[8.5px] font-normal text-[#65676B]">km</span>
              </div>
            </div>

            <div className="bg-[#F0F2F5] rounded-md p-1.5 text-center border border-[#E4E6EB]">
              <div className="text-[9px] text-[#65676B] flex items-center justify-center space-x-0.5">
                <Footprints size={9.5} className="text-[#31A24C]" />
                <span>今日步数</span>
              </div>
              <div className="font-bold text-[#050505] text-xs mt-0.5">
                9,482 <span className="text-[8.5px] font-normal text-[#65676B]">步</span>
              </div>
            </div>

            <div className="bg-[#F0F2F5] rounded-md p-1.5 text-center border border-[#E4E6EB]">
              <div className="text-[9px] text-[#65676B] flex items-center justify-center space-x-0.5">
                <Flame size={9.5} className="text-amber-500" />
                <span>消耗热量</span>
              </div>
              <div className="font-bold text-amber-600 text-xs mt-0.5">
                428 <span className="text-[8.5px] font-normal text-[#65676B]">kcal</span>
              </div>
            </div>

            <div className="bg-[#F0F2F5] rounded-md p-1.5 text-center border border-[#E4E6EB]">
              <div className="text-[9px] text-[#65676B] flex items-center justify-center space-x-0.5">
                <Clock size={9.5} className="text-[#AF52DE]" />
                <span>行动时长</span>
              </div>
              <div className="font-bold text-[#050505] text-xs mt-0.5">
                4.2 <span className="text-[8.5px] font-normal text-[#65676B]">h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tab Switcher: 我的世界 vs 24小时轨迹 */}
        <div className="px-3.5 pt-2 pb-1.5 bg-[#F0F2F5] border-b border-[#E4E6EB] shrink-0">
          <div className="flex bg-white p-0.5 rounded-lg border border-[#E4E6EB] shadow-2xs">
            <button
              type="button"
              onClick={() => {
                soundEffects.playTapSound();
                setActiveTab('myWorld');
              }}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'myWorld'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'text-[#65676B] hover:text-[#050505]'
              }`}
            >
              <Globe size={13} />
              <span>我的世界 (地点探索)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playTapSound();
                setActiveTab('trajectory');
              }}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'trajectory'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'text-[#65676B] hover:text-[#050505]'
              }`}
            >
              <Clock size={13} />
              <span>24小时行动轨迹</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto px-3.5 py-2.5 space-y-2.5 custom-scrollbar flex-1">
          {activeTab === 'myWorld' ? (
            /* =================== TAB 1: 我的世界 (My World) =================== */
            <div className="space-y-2.5">
              {/* My World Sub-tab Pill Switcher: 常去城市 / Top 地点 / 近期地点 */}
              <div className="flex items-center space-x-1.5 bg-[#F0F2F5] p-1 rounded-md border border-[#E4E6EB]">
                <button
                  type="button"
                  onClick={() => setMyWorldSubTab('topPlaces')}
                  className={`flex-1 py-1 rounded text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                    myWorldSubTab === 'topPlaces'
                      ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                      : 'text-[#65676B] hover:text-[#050505]'
                  }`}
                >
                  <Award size={12} />
                  <span>Top 地点 ({frequentPlaces.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMyWorldSubTab('cities')}
                  className={`flex-1 py-1 rounded text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                    myWorldSubTab === 'cities'
                      ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                      : 'text-[#65676B] hover:text-[#050505]'
                  }`}
                >
                  <Building2 size={12} />
                  <span>常去城市 ({frequentCities.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMyWorldSubTab('recent')}
                  className={`flex-1 py-1 rounded text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                    myWorldSubTab === 'recent'
                      ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                      : 'text-[#65676B] hover:text-[#050505]'
                  }`}
                >
                  <History size={12} />
                  <span>近期地点 ({recentPlaces.length})</span>
                </button>
              </div>

              {/* Sub-tab 1: Top 地点 (Top Places) */}
              {myWorldSubTab === 'topPlaces' && (
                <div className="space-y-2">
                  {/* Input for adding new place */}
                  <div className="p-2 bg-[#F0F2F5] rounded-md border border-[#E4E6EB] space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#050505]">
                      <span className="flex items-center space-x-1 text-[#1877F2]">
                        <Sparkles size={12} />
                        <span>键入添加 Top 常去地点</span>
                      </span>
                      <span className="text-[10px] font-normal text-[#65676B]">
                        支持一键导航与分享
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <div className="relative flex-1">
                        <MapPin
                          size={13}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#65676B]"
                        />
                        <input
                          type="text"
                          placeholder="输入地点名称 (如 兰州大学、五泉山公园)..."
                          value={newPlaceInput}
                          onChange={(e) => setNewPlaceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddFrequentPlace();
                          }}
                          className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-md outline-none text-[#050505] placeholder-[#8A8D91]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFrequentPlace}
                        disabled={!newPlaceInput.trim()}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1 transition-all ${
                          newPlaceInput.trim()
                            ? 'bg-[#1877F2] hover:bg-[#166FE5] text-white shadow-2xs cursor-pointer active:scale-95'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus size={13} />
                        <span>添加</span>
                      </button>
                    </div>
                  </div>

                  {/* Places list with Rank Badges */}
                  <div className="space-y-1.5">
                    {frequentPlaces.map((place, idx) => (
                      <div
                        key={place.id}
                        className="p-2.5 bg-white rounded-md border border-[#E4E6EB] hover:border-[#1877F2]/50 transition-all flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          {/* Rank badge */}
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs ${
                              idx === 0
                                ? 'bg-amber-400 text-amber-950 border border-amber-500/30'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-800 border border-slate-400/30'
                                : idx === 2
                                ? 'bg-amber-700/20 text-amber-800 border border-amber-700/30'
                                : 'bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB]'
                            }`}
                          >
                            {idx + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5">
                              <h4 className="text-xs font-bold text-[#050505] truncate">
                                {place.name}
                              </h4>
                              {place.category && (
                                <span className="text-[9px] font-semibold px-1 py-0.2 bg-[#F0F2F5] text-[#1877F2] rounded border border-[#E4E6EB] shrink-0">
                                  {place.category}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-[#65676B] truncate">
                              <span className="font-semibold text-emerald-600">
                                {place.frequencyTag}
                              </span>
                              <span>·</span>
                              <span className="truncate">{place.address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions: Navigate + Share + Delete */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleFlyTo(place.lat, place.lng, place.name)}
                            className="p-1.5 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1877F2] border border-[#E4E6EB] transition-colors"
                            title="在地图上查看"
                          >
                            <ArrowUpRight size={12} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleSharePlaceClick(place, e)}
                            className="px-2 py-1 rounded-md bg-[#1877F2] hover:bg-[#166FE5] text-white text-[10.5px] font-bold flex items-center space-x-1 transition-all shadow-2xs cursor-pointer active:scale-95"
                            title="分享地点卡片给好友"
                          >
                            <Share2 size={11} />
                            <span>分享</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeletePlace(place.id, e)}
                            className="p-1 rounded-md hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                            title="删除地点"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab 2: 常去城市 (Frequent Cities) */}
              {myWorldSubTab === 'cities' && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-[#E7F3FF] rounded-md border border-[#1877F2]/20 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 size={15} className="text-[#1877F2]" />
                      <div>
                        <div className="text-xs font-bold text-[#050505]">
                          城市足迹分析
                        </div>
                        <div className="text-[10px] text-[#65676B]">
                          基于 GPS 历史驻留时间与打卡频次智能汇总
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#1877F2] border border-[#1877F2]/20">
                      共点亮 3 城
                    </span>
                  </div>

                  <div className="space-y-2">
                    {frequentCities.map((city) => (
                      <div
                        key={city.id}
                        className="p-3 bg-white rounded-md border border-[#E4E6EB] shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-md bg-[#F0F2F5] text-[#1877F2] flex items-center justify-center font-bold text-xs border border-[#E4E6EB]">
                              {city.cityName.slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <h4 className="text-xs font-bold text-[#050505]">
                                  {city.cityName}
                                </h4>
                                <span className="text-[9.5px] text-[#65676B]">
                                  ({city.province})
                                </span>
                                {city.isCurrent && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#31A24C]/10 text-[#31A24C] rounded border border-[#31A24C]/20">
                                    当前驻留
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#65676B] mt-0.5">
                                {city.tag} · 驻留 {city.days} 天
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-bold text-[#1877F2]">
                              {city.percent}%
                            </span>
                            <div className="text-[9px] text-[#65676B]">足迹占比</div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 rounded-full bg-[#F0F2F5] overflow-hidden border border-[#E4E6EB]/60">
                          <div
                            className={`h-full rounded-full transition-all ${
                              city.isCurrent ? 'bg-[#1877F2]' : 'bg-slate-400'
                            }`}
                            style={{ width: `${city.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab 3: 近期地点 (Recent Places) */}
              {myWorldSubTab === 'recent' && (
                <div className="space-y-2">
                  <div className="text-[10.5px] font-semibold text-[#65676B] px-0.5 flex items-center justify-between">
                    <span>⏱️ 近期到访与打卡时间线</span>
                    <span>自动同步</span>
                  </div>

                  <div className="space-y-1.5">
                    {recentPlaces.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-2.5 bg-white rounded-md border border-[#E4E6EB] hover:border-[#1877F2]/50 transition-all flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-md bg-[#F0F2F5] text-[#1877F2] flex items-center justify-center shrink-0 border border-[#E4E6EB]">
                            {rec.mode === 'car' ? (
                              <Car size={13} />
                            ) : rec.mode === 'walking' ? (
                              <Footprints size={13} />
                            ) : (
                              <MapPin size={13} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5">
                              <h4 className="text-xs font-bold text-[#050505] truncate">
                                {rec.name}
                              </h4>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#F0F2F5] text-[#1877F2] rounded border border-[#E4E6EB] shrink-0">
                                {rec.stayDuration}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-[#65676B] truncate">
                              <span className="font-medium text-[#1877F2]">{rec.timeAgo}</span>
                              <span>·</span>
                              <span className="truncate">{rec.address}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleFlyTo(rec.lat, rec.lng, rec.name)}
                            className="p-1.5 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1877F2] border border-[#E4E6EB] transition-colors"
                            title="在地图上查看"
                          >
                            <ArrowUpRight size={12} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleSharePlaceClick({
                                id: rec.id,
                                name: rec.name,
                                address: rec.address,
                                lat: rec.lat,
                                lng: rec.lng,
                                frequencyTag: `${rec.timeAgo} · ${rec.stayDuration}`,
                                visitCount: 1,
                              })
                            }
                            className="px-2 py-1 rounded-md bg-[#1877F2] hover:bg-[#166FE5] text-white text-[10.5px] font-bold flex items-center space-x-1 transition-all shadow-2xs cursor-pointer active:scale-95"
                            title="分享近期地点"
                          >
                            <Share2 size={11} />
                            <span>分享</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* =================== TAB 2: 24小时轨迹回放 (24h Trajectory) =================== */
            <div className="space-y-2">
              {/* Current Location & Replay Point Card */}
              <div className="bg-[#F0F2F5] rounded-md p-2.5 border border-[#E4E6EB] flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-md bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-xs">
                    {currentPoint.transportMode === 'car' ? (
                      <Car size={15} strokeWidth={2.2} />
                    ) : currentPoint.transportMode === 'walking' ? (
                      <Footprints size={15} strokeWidth={2.2} />
                    ) : (
                      <MapPin size={15} strokeWidth={2.2} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-[#1877F2] tracking-tight">
                        {cleanTime}
                      </span>
                      <span className="text-[9px] font-semibold text-[#050505] bg-white px-1.5 py-0.2 rounded shadow-2xs border border-[#E4E6EB]">
                        {currentPoint.speedKmh > 0
                          ? `${currentPoint.speedKmh} km/h`
                          : '停留中'}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#050505] truncate mt-0.5 flex items-center gap-1">
                      <Navigation
                        size={10}
                        className="text-[#1877F2] shrink-0 fill-[#1877F2]"
                      />
                      <span className="truncate">{currentPoint.locationName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {currentPoint.intersectingFriendName && (
                    <div className="bg-[#AF52DE]/10 text-[#AF52DE] border border-[#AF52DE]/20 text-[9.5px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse">
                      <Users size={10} strokeWidth={2.2} />
                      <span>与 {currentPoint.intersectingFriendName}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleSharePlaceClick({
                        id: 'curr',
                        name: currentPoint.locationName,
                        address: '甘肃省兰州市城关区南滨河东路',
                        lat: currentPoint.lat,
                        lng: currentPoint.lng,
                        frequencyTag: '当前轨迹打卡点',
                        visitCount: 1,
                      })
                    }
                    className="p-1.5 rounded-md bg-white hover:bg-[#E4E6EB] text-[#1877F2] border border-[#E4E6EB] transition-colors shadow-2xs"
                    title="分享此坐标"
                  >
                    <Share2 size={12} />
                  </button>
                </div>
              </div>

              {/* Slider & Timeline Section */}
              <div className="bg-[#F0F2F5]/90 rounded-md p-2.5 border border-[#E4E6EB] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-medium text-[#65676B] px-0.5">
                  <span>00:00</span>
                  <span className="text-white bg-[#1877F2] font-bold text-[10px] px-2 py-0.5 rounded shadow-xs">
                    {cleanTime}
                  </span>
                  <span>24:00</span>
                </div>

                {/* Range Slider */}
                <div className="relative flex items-center h-4 px-0.5">
                  <input
                    type="range"
                    min={0}
                    max={24}
                    step={0.1}
                    value={selectedTimeHour}
                    onChange={(e) => onTimeHourChange(parseFloat(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #1877F2 0%, #1877F2 ${sliderPercent}%, #E4E6EB ${sliderPercent}%, #E4E6EB 100%)`,
                    }}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer focus:outline-none 
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:w-4 
                      [&::-webkit-slider-thumb]:h-4 
                      [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:bg-white 
                      [&::-webkit-slider-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.25)] 
                      [&::-webkit-slider-thumb]:border 
                      [&::-webkit-slider-thumb]:border-[#1877F2] 
                      [&::-webkit-slider-thumb]:active:scale-115 
                      [&::-webkit-slider-thumb]:transition-transform"
                  />
                </div>

                {/* Stay Points Chips */}
                <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none text-[9.5px]">
                  <span className="font-medium text-[#65676B] shrink-0 pl-0.5">
                    地标:
                  </span>
                  {stayPoints.map((sp) => {
                    const isSelected =
                      Math.abs(selectedTimeHour - sp.timeHour) < 0.5;
                    const spTime = sp.timeLabel
                      .replace(/\s*\([^)]*\)/g, '')
                      .trim();
                    return (
                      <button
                        key={sp.id}
                        onClick={() => onTimeHourChange(sp.timeHour)}
                        className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center space-x-0.5 ${
                          isSelected
                            ? 'bg-[#1877F2] text-white shadow-xs font-bold'
                            : 'bg-white hover:bg-[#E4E6EB] text-[#050505] border border-[#E4E6EB]'
                        }`}
                      >
                        <span>📍</span>
                        <span>{spTime}</span>
                        <span className="opacity-80">
                          {sp.locationName.split(' ')[1] ||
                            sp.locationName.slice(0, 4)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Controls Bar */}
              <div className="flex items-center justify-between pt-1">
                {/* Play / Pause & Reset */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={onTogglePlay}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1 transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-xs ${
                      isPlaying
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause size={13} strokeWidth={2.4} />
                    ) : (
                      <Play size={13} strokeWidth={2.4} fill="currentColor" />
                    )}
                    <span>{isPlaying ? '暂停' : '回放轨迹'}</span>
                  </button>

                  <button
                    onClick={() => onTimeHourChange(0)}
                    className="w-7 h-7 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1877F2] border border-[#E4E6EB] transition-all active:scale-92 cursor-pointer flex items-center justify-center shrink-0"
                    title="重置到 00:00"
                    aria-label="重置"
                  >
                    <RotateCcw size={13} strokeWidth={2.2} />
                  </button>
                </div>

                {/* Playback Speed */}
                <div className="flex items-center space-x-0.5 bg-[#F0F2F5] border border-[#E4E6EB] p-0.5 rounded-md shrink-0">
                  {[1, 2, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => onChangePlaybackSpeed(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                        playbackSpeed === s
                          ? 'bg-white text-[#1877F2] shadow-2xs font-bold border border-[#E4E6EB]'
                          : 'text-[#65676B] hover:text-[#050505]'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                {/* Friend Trajectory Overlay Toggle */}
                <button
                  onClick={onToggleShowFriends}
                  className={`px-2.5 py-1.5 rounded-md text-[10.5px] font-bold flex items-center space-x-1 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    showFriendTrajectories
                      ? 'bg-[#AF52DE] text-white shadow-xs'
                      : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] border border-[#E4E6EB]'
                  }`}
                  title="切换是否显示好友轨迹迹线"
                >
                  <Users size={12} strokeWidth={2.2} />
                  <span>好友迹线</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
