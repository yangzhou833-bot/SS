import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MapPin,
  Clock,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Navigation,
  Radio,
  MessageCircle,
  Footprints,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Map as MapIcon,
  Users,
  Compass,
  Zap,
  ArrowUpDown,
  Check,
  X,
  Shield,
  Heart,
} from 'lucide-react';
import { Friend } from '../types';
import { USER_LOCATION } from '../data/mockData';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';

interface FriendsListViewProps {
  friends: Friend[];
  onBackToMap: () => void;
  onLocateFriendOnMap: (friend: Friend) => void;
  onOpenChatWith: (friendId: string) => void;
  onStartIntercomWith: (friend: Friend) => void;
  onViewTrajectory?: (friend: Friend) => void;
  showToast?: (message: string) => void;
}

type FilterCategory = 'all' | 'close' | 'family' | 'nearby' | 'moving' | 'stationary' | 'low_battery';
type SortOrder = 'distance_asc' | 'stay_desc' | 'battery_asc' | 'active_desc';

// Helper to parse numeric distance in meters from string like "420m", "1.9km"
function parseDistanceMeters(distanceStr: string): number {
  if (!distanceStr) return 999999;
  const clean = distanceStr.trim().toLowerCase();
  if (clean.endsWith('km')) {
    const num = parseFloat(clean.replace('km', ''));
    return isNaN(num) ? 999999 : num * 1000;
  }
  if (clean.endsWith('m')) {
    const num = parseFloat(clean.replace('m', ''));
    return isNaN(num) ? 999999 : num;
  }
  const num = parseFloat(clean);
  return isNaN(num) ? 999999 : num;
}

// Helper to format stay duration consistently
export function formatFriendStayDuration(friend: Friend): { text: string; tag: string; isMoving: boolean } {
  if (friend.activityState === 'moving' || (friend.speed && friend.speed !== '0 km/h')) {
    const speed = friend.speed || '移动中';
    return {
      text: friend.stayDuration ? `在途中 · ${friend.stayDuration}` : `行进中 · 时速 ${speed}`,
      tag: '在途移动',
      isMoving: true,
    };
  }

  if (friend.stayDuration) {
    return {
      text: friend.stayDuration.startsWith('已停留') || friend.stayDuration.startsWith('停留')
        ? friend.stayDuration
        : `已停留 ${friend.stayDuration}`,
      tag: '常驻驻留',
      isMoving: false,
    };
  }

  // Consistent fallback stay duration based on id hash for rich experience
  const defaultStays = [
    '已停留 35分钟',
    '已停留 1小时20分',
    '已停留 45分钟',
    '已停留 2小时15分',
    '刚到达 8分钟',
    '已停留 3小时40分',
  ];
  const charCodeSum = friend.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const stay = defaultStays[charCodeSum % defaultStays.length];
  return {
    text: stay,
    tag: '常驻驻留',
    isMoving: false,
  };
}

// Helper to calculate bearing from user to friend
function calculateBearingDegrees(userLat: number, userLng: number, targetLat: number, targetLng: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const dLon = toRad(targetLng - userLng);
  const y = Math.sin(dLon) * Math.cos(toRad(targetLat));
  const x =
    Math.cos(toRad(userLat)) * Math.sin(toRad(targetLat)) -
    Math.sin(toRad(userLat)) * Math.cos(toRad(targetLat)) * Math.cos(dLon);
  let brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

function getBearingArrowAndName(bearing: number): { arrow: string; name: string } {
  const dirs = [
    { name: '北', arrow: '↑' },
    { name: '东北', arrow: '↗' },
    { name: '东', arrow: '→' },
    { name: '东南', arrow: '↘' },
    { name: '南', arrow: '↓' },
    { name: '西南', arrow: '↙' },
    { name: '西', arrow: '←' },
    { name: '西北', arrow: '↖' },
  ];
  const idx = Math.round(bearing / 45) % 8;
  return dirs[idx];
}

export const FriendsListView: React.FC<FriendsListViewProps> = ({
  friends,
  onBackToMap,
  onLocateFriendOnMap,
  onOpenChatWith,
  onStartIntercomWith,
  onViewTrajectory,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<SortOrder>('distance_asc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Online and nearby counts
  const stats = useMemo(() => {
    const total = friends.length;
    const online = friends.filter((f) => f.isOnline).length;
    const nearby = friends.filter((f) => parseDistanceMeters(f.distance) <= 1500).length;
    const lowBattery = friends.filter((f) => f.battery <= 20).length;
    return { total, online, nearby, lowBattery };
  }, [friends]);

  // Filtering
  const filteredFriends = useMemo(() => {
    return friends.filter((f) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = f.name?.toLowerCase().includes(query);
        const matchLoc = f.locationName?.toLowerCase().includes(query);
        const matchStatus = f.status?.toLowerCase().includes(query);
        const matchRemark = f.remark?.toLowerCase().includes(query);
        const matchGroup = f.groupName?.toLowerCase().includes(query);
        if (!matchName && !matchLoc && !matchStatus && !matchRemark && !matchGroup) {
          return false;
        }
      }

      // Filter tags
      switch (activeFilter) {
        case 'close':
          return f.isCloseFriend || f.relationship === 'close';
        case 'family':
          return f.isFamily || f.relationship === 'family' || f.name.includes('爸爸') || f.name.includes('妈妈') || f.name.includes('祖母') || f.name.includes('爷爷');
        case 'nearby':
          return parseDistanceMeters(f.distance) <= 1500;
        case 'moving':
          return f.activityState === 'moving' || (f.speed && f.speed !== '0 km/h');
        case 'stationary':
          return f.activityState !== 'moving' && (!f.speed || f.speed === '0 km/h');
        case 'low_battery':
          return f.battery <= 20;
        case 'all':
        default:
          return true;
      }
    });
  }, [friends, searchQuery, activeFilter]);

  // Sorting
  const sortedFriends = useMemo(() => {
    return [...filteredFriends].sort((a, b) => {
      if (sortBy === 'distance_asc') {
        return parseDistanceMeters(a.distance) - parseDistanceMeters(b.distance);
      }
      if (sortBy === 'battery_asc') {
        return a.battery - b.battery;
      }
      if (sortBy === 'stay_desc') {
        const aStay = formatFriendStayDuration(a);
        const bStay = formatFriendStayDuration(b);
        if (aStay.isMoving && !bStay.isMoving) return 1;
        if (!aStay.isMoving && bStay.isMoving) return -1;
        return 0;
      }
      if (sortBy === 'active_desc') {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return 0;
      }
      return 0;
    });
  }, [filteredFriends, sortBy]);

  const filterChips: { id: FilterCategory; label: string; count?: number }[] = [
    { id: 'all', label: '全部好友', count: stats.total },
    { id: 'nearby', label: '📍 附近 (<1.5km)', count: stats.nearby },
    { id: 'close', label: '💛 密友' },
    { id: 'family', label: '👨‍👩‍👧 家人' },
    { id: 'moving', label: '🚗 移动中' },
    { id: 'stationary', label: '🛑 驻留休息' },
    { id: 'low_battery', label: '🪫 电量告警', count: stats.lowBattery > 0 ? stats.lowBattery : undefined },
  ];

  const sortOptions: { id: SortOrder; label: string }[] = [
    { id: 'distance_asc', label: '📏 按距离从近到远' },
    { id: 'stay_desc', label: '⏱️ 按停留时长排序' },
    { id: 'battery_asc', label: '🔋 按电量低优先' },
    { id: 'active_desc', label: '⚡ 按最近在线活跃' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#F0F2F5] dark:bg-zinc-950 overflow-hidden select-none">
      {/* 1. Header Toolbar with Dual-Perspective Switcher */}
      <div className="shrink-0 bg-white dark:bg-zinc-900 border-b border-[#E4E6EB] dark:border-zinc-800 px-3.5 pt-3 pb-2.5 shadow-2xs z-20">
        <div className="flex items-center justify-between gap-2">
          {/* Title & Online Stats */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-black text-[#050505] dark:text-[#E4E6EB] tracking-tight">
                好友列表
              </h1>
              <span className="px-2 py-0.5 bg-[#E7F3FF] dark:bg-blue-950/60 text-[#1877F2] dark:text-blue-400 text-[11px] font-black rounded-full border border-blue-200 dark:border-blue-900/60">
                {friends.length} 人
              </span>
            </div>
            <p className="text-[11px] text-[#65676B] dark:text-zinc-400 font-medium">
              {stats.online} 人在线 · {stats.nearby} 人在附近 · 快速找人模式
            </p>
          </div>

          {/* Dual Perspective Switcher: [地图视角 | 好友列表] */}
          <div className="inline-flex p-0.5 bg-[#F0F2F5] dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-inner">
            <button
              type="button"
              id="switch-to-map-view-btn"
              onClick={() => {
                haptics.trigger('light');
                soundEffects.playTapSound();
                onBackToMap();
              }}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-[#65676B] dark:text-zinc-400 hover:text-[#050505] dark:hover:text-white rounded transition-colors cursor-pointer"
              title="切换到地图视角"
            >
              <MapIcon size={13} className="text-[#65676B] dark:text-zinc-400" />
              <span>地图视角</span>
            </button>
            <button
              type="button"
              id="active-friends-list-btn"
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-black bg-white dark:bg-zinc-700 text-[#1877F2] dark:text-blue-400 rounded shadow-2xs border border-[#E4E6EB] dark:border-zinc-600"
              title="当前为好友列表视图"
            >
              <Users size={13} className="text-[#1877F2] dark:text-blue-400" />
              <span>好友列表</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex items-center space-x-2 mt-2.5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#65676B] dark:text-zinc-400" />
            <input
              type="text"
              id="friends-list-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索好友姓名、地点、停留状态..."
              className="w-full pl-8 pr-8 py-1.5 bg-[#F0F2F5] dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 rounded-md text-xs font-medium text-[#050505] dark:text-[#E4E6EB] placeholder-[#65676B] dark:placeholder-zinc-500 focus:outline-none focus:border-[#1877F2] focus:bg-white dark:focus:bg-zinc-900 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <button
              type="button"
              id="friends-list-sort-btn"
              onClick={() => setIsSortDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-1 px-2 py-1.5 bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] rounded-md text-xs font-bold text-[#050505] dark:text-[#E4E6EB] shadow-2xs transition-colors cursor-pointer"
              title="切换排序规则"
            >
              <ArrowUpDown size={12} className="text-[#1877F2]" />
              <span className="hidden sm:inline">
                {sortOptions.find((s) => s.id === sortBy)?.label.split(' ')[1] || '排序'}
              </span>
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-lg py-1 z-50 flex flex-col text-xs font-bold">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id);
                      setIsSortDropdownOpen(false);
                      haptics.trigger('light');
                    }}
                    className={`flex items-center justify-between px-3 py-2 text-left hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 transition-colors ${
                      sortBy === opt.id ? 'text-[#1877F2] bg-blue-50/50 dark:bg-blue-950/30' : 'text-[#050505] dark:text-[#E4E6EB]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <Check size={13} className="text-[#1877F2]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Chips Horizontal Scroll */}
        <div className="flex items-center space-x-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                id={`filter-chip-${chip.id}`}
                onClick={() => {
                  setActiveFilter(chip.id);
                  haptics.trigger('light');
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1877F2] text-white shadow-2xs border border-[#1877F2]'
                    : 'bg-white dark:bg-zinc-800 text-[#65676B] dark:text-zinc-300 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/50 hover:bg-gray-50'
                }`}
              >
                <span>{chip.label}</span>
                {chip.count !== undefined && (
                  <span
                    className={`ml-0.5 px-1 py-0.2 rounded text-[10px] font-extrabold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    {chip.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Scrollable Friends List Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2 no-scrollbar">
        {sortedFriends.length === 0 ? (
          /* Empty search/filter state */
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-800 rounded-md p-6">
            <Users size={36} className="text-gray-300 dark:text-zinc-600 mb-2 stroke-[1.5]" />
            <h3 className="text-sm font-bold text-[#050505] dark:text-[#E4E6EB]">未找到符合条件的好友</h3>
            <p className="text-xs text-[#65676B] dark:text-zinc-400 mt-1 max-w-xs">
              尝试清除过滤条件或修改搜索关键词，查看全部 {friends.length} 位好友。
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
                haptics.trigger('light');
              }}
              className="mt-3 px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-md text-xs font-bold shadow-2xs cursor-pointer"
            >
              重置筛选与搜索
            </button>
          </div>
        ) : (
          sortedFriends.map((friend) => {
            const stayInfo = formatFriendStayDuration(friend);
            const bearing = calculateBearingDegrees(
              USER_LOCATION.lat,
              USER_LOCATION.lng,
              friend.lat || USER_LOCATION.lat,
              friend.lng || USER_LOCATION.lng
            );
            const dirInfo = getBearingArrowAndName(bearing);
            const isLowBattery = friend.battery <= 20;

            return (
              <div
                key={friend.id}
                id={`friend-card-${friend.id}`}
                className="bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-800 hover:border-[#1877F2] rounded-md p-3 shadow-2xs transition-all flex flex-col gap-2.5 group"
              >
                {/* Upper Block: Avatar + Main Info + Distance / Bearing */}
                <div className="flex items-start justify-between gap-2.5">
                  {/* Left: Avatar with Online & Battery Badges */}
                  <div className="relative shrink-0">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-2xs"
                    />
                    {/* Online status indicator */}
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                        friend.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                      title={friend.isOnline ? '实时在线' : '离线'}
                    />
                  </div>

                  {/* Middle: Friend Name, Badges, Location, Stay Duration, Status */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="text-sm font-black text-[#050505] dark:text-[#E4E6EB] truncate">
                        {friend.name}
                      </span>

                      {/* Relationship & Role Tags */}
                      {friend.isCloseFriend && (
                        <span className="px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded border border-amber-200 dark:border-amber-900">
                          💛 密友
                        </span>
                      )}
                      {friend.isFamily && (
                        <span className="px-1.5 py-0.2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded border border-rose-200 dark:border-rose-900">
                          👨‍👩‍👧 家人
                        </span>
                      )}
                      {friend.relationship === 'lover' && (
                        <span className="px-1.5 py-0.2 bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 text-[10px] font-bold rounded border border-pink-200 dark:border-pink-900">
                          💖 情侣
                        </span>
                      )}
                      {friend.groupName && (
                        <span className="px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/50 text-[#1877F2] text-[10px] font-bold rounded border border-blue-200 dark:border-blue-900">
                          {friend.groupName}
                        </span>
                      )}
                    </div>

                    {/* Venue / Location Name */}
                    <div className="flex items-center space-x-1 mt-0.5 text-xs text-[#050505] dark:text-zinc-200 font-bold truncate">
                      <MapPin size={11} className="text-[#1877F2] shrink-0" />
                      <span className="truncate">{friend.locationName || '兰州市城关区'}</span>
                    </div>

                    {/* Key Metric: 停留时长 (Stay Duration) & Motion State */}
                    <div className="flex items-center space-x-1.5 mt-1 flex-wrap text-[11px]">
                      <span
                        className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${
                          stayInfo.isMoving
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 text-[#1877F2]'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        <Clock size={10} className="shrink-0" />
                        <span>{stayInfo.text}</span>
                      </span>

                      {/* Speed if moving */}
                      {friend.speed && friend.speed !== '0 km/h' && (
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-bold rounded text-[10px] border border-[#E4E6EB] dark:border-zinc-700">
                          {friend.speed}
                        </span>
                      )}

                      {/* Battery Indicator with Color Coding */}
                      <span
                        className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          isLowBattery
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 animate-pulse'
                            : friend.battery <= 45
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200'
                            : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-[#E4E6EB] dark:border-zinc-700'
                        }`}
                        title={`电量 ${friend.battery}%`}
                      >
                        <Battery size={11} className={isLowBattery ? 'text-rose-600' : 'text-gray-500'} />
                        <span>{friend.battery}%</span>
                        {isLowBattery && <span className="text-[9px] font-black">低电量</span>}
                      </span>
                    </div>

                    {/* Status Quote / Activity Text */}
                    {friend.status && (
                      <p className="text-[11px] text-[#65676B] dark:text-zinc-400 mt-1 line-clamp-1 italic">
                        "{friend.status}"
                      </p>
                    )}
                  </div>

                  {/* Right: Distance & Bearing Arrow */}
                  <div className="flex flex-col items-end shrink-0 pl-1">
                    <div className="flex items-baseline space-x-0.5 text-[#1877F2] font-black text-sm">
                      <span>{friend.distance || '1.2km'}</span>
                    </div>
                    <div className="flex items-center space-x-0.5 text-[10px] font-bold text-[#65676B] dark:text-zinc-400 mt-0.5">
                      <span className="text-xs text-[#1877F2]">{dirInfo.arrow}</span>
                      <span>{dirInfo.name}</span>
                    </div>
                  </div>
                </div>

                {/* Lower Action Row: Quick Finding & Communication Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-[#E4E6EB] dark:border-zinc-800/80">
                  {/* 1. 在地图中定位 */}
                  <button
                    type="button"
                    id={`btn-locate-friend-${friend.id}`}
                    onClick={() => {
                      haptics.trigger('medium');
                      soundEffects.playTapSound();
                      onLocateFriendOnMap(friend);
                      showToast?.(`已在地图中锁定定位【${friend.name}】🎯`);
                    }}
                    className="flex items-center justify-center space-x-1 py-1.5 px-1 bg-[#E7F3FF] dark:bg-blue-950/60 hover:bg-blue-100 text-[#1877F2] dark:text-blue-300 border border-blue-200 dark:border-blue-900 rounded-md text-[11px] font-black transition-colors cursor-pointer shadow-2xs"
                    title="在地图中定位该好友"
                  >
                    <Navigation size={12} className="fill-[#1877F2]" />
                    <span>地图定位</span>
                  </button>

                  {/* 2. 一键对讲 */}
                  <button
                    type="button"
                    id={`btn-intercom-friend-${friend.id}`}
                    onClick={() => {
                      haptics.trigger('heavy');
                      soundEffects.playWalkieTalkieStart();
                      onStartIntercomWith(friend);
                      showToast?.(`已开启与【${friend.name}】的一键无线电对讲 🎙️`);
                    }}
                    className="flex items-center justify-center space-x-1 py-1.5 px-1 bg-white dark:bg-zinc-800 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 border border-[#E4E6EB] dark:border-zinc-700 rounded-md text-[11px] font-black transition-colors cursor-pointer shadow-2xs"
                    title="发起一键实时对讲"
                  >
                    <Radio size={12} className="text-emerald-600 animate-pulse" />
                    <span>一键对讲</span>
                  </button>

                  {/* 3. 发送私聊 */}
                  <button
                    type="button"
                    id={`btn-chat-friend-${friend.id}`}
                    onClick={() => {
                      haptics.trigger('light');
                      soundEffects.playTapSound();
                      onOpenChatWith(friend.id);
                    }}
                    className="flex items-center justify-center space-x-1 py-1.5 px-1 bg-white dark:bg-zinc-800 hover:border-[#1877F2] text-[#050505] dark:text-[#E4E6EB] border border-[#E4E6EB] dark:border-zinc-700 rounded-md text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                    title="打开聊天会话"
                  >
                    <MessageCircle size={12} className="text-[#1877F2]" />
                    <span>发私信</span>
                  </button>

                  {/* 4. 24h轨迹 */}
                  <button
                    type="button"
                    id={`btn-track-friend-${friend.id}`}
                    onClick={() => {
                      haptics.trigger('light');
                      soundEffects.playTapSound();
                      if (onViewTrajectory) {
                        onViewTrajectory(friend);
                      } else {
                        onLocateFriendOnMap(friend);
                      }
                      showToast?.(`已调取【${friend.name}】24小时足迹时间轴 ⏱️`);
                    }}
                    className="flex items-center justify-center space-x-1 py-1.5 px-1 bg-white dark:bg-zinc-800 hover:border-purple-500 text-[#65676B] dark:text-zinc-300 border border-[#E4E6EB] dark:border-zinc-700 rounded-md text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                    title="查看好友24小时历史轨迹"
                  >
                    <Footprints size={12} className="text-purple-600" />
                    <span>24h足迹</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
