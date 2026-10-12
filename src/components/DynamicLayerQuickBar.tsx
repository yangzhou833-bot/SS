import React, { useRef, useMemo, useEffect, useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Flame, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Target, 
  Layers, 
  BatteryCharging, 
  Battery, 
  BatteryLow, 
  Compass, 
  X,
  Navigation,
  Clock,
  Radio,
  ChevronRight
} from 'lucide-react';
import { Friend, SimulatedMapActivity, Schedule, CustomMapMarker, DiscoverPost, MapLayerId, LifePlace } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import './map-home-h1.css';
import './layer-quick-cards.css';
import { getActivityStatusInfo } from '../utils/countdownHelper';
import { scheduleDateParts, schedulePhase, placeIntent } from '../utils/lifePlanning';
import { starCardCreationDate } from '../utils/starCardPresentation';

export interface DynamicLayerQuickBarProps {
  activeLayer: MapLayerId;
  friends: Friend[];
  activities?: SimulatedMapActivity[];
  schedules?: Schedule[];
  customMarkers?: CustomMapMarker[];
  lifePlaces?: LifePlace[];
  onSelectLifePlace?: (place: LifePlace) => void;
  starCards?: DiscoverPost[];
  selectedItemId?: string | null;
  showPlaces?: boolean;
  showStars?: boolean;
  onFocusItem?: (item: { id: string; lat: number; lng: number }) => void;
  onSelectFriend: (friend: Friend) => void;
  onSelectActivity: (activity: SimulatedMapActivity) => void;
  onSelectSchedule: (schedule: Schedule) => void;
  onSelectCustomMarker: (marker: CustomMapMarker) => void;
  onSelectStarCard: (card: DiscoverPost) => void;
  onSelectLayer?: (layer: MapLayerId) => void;
  onOpenFriendsList?: () => void;
  onClose?: () => void;
  className?: string;
}

// Helpers for Activity Card
const getActivityCover = (act: SimulatedMapActivity): string => {
  if (act.coverImageUrl) return act.coverImageUrl;
  const title = act.title || '';
  if (title.includes('黄河') || title.includes('徒步')) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=450';
  if (title.includes('极客') || title.includes('算法') || title.includes('开发') || title.includes('黑客松')) return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=450';
  if (title.includes('采风') || title.includes('摄影')) return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=450';
  if (title.includes('音乐') || title.includes('节')) return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=450';
  if (title.includes('骑行') || title.includes('运动')) return 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=450';
  if (title.includes('咖啡') || title.includes('美食')) return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=450';
  return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=450';
};

const getOrganizerName = (act: SimulatedMapActivity): string => {
  if (act.authorName) return act.authorName;
  if (act.groupAdminName) return act.groupAdminName;
  const organizerParticipant = act.participants?.find((p) => p.relationshipLabel?.includes('组织') || p.name?.includes('发起') || p.name?.includes('我'));
  if (organizerParticipant) return organizerParticipant.name.split(' ')[0];
  return '';
};

const getOrganizerAvatar = (act: SimulatedMapActivity): string => {
  if (act.authorAvatar) return act.authorAvatar;
  if (act.groupAdminAvatar) return act.groupAdminAvatar;
  const organizerParticipant = act.participants?.find((p) => p.relationshipLabel?.includes('组织') || p.name?.includes('发起') || p.name?.includes('我'));
  if (organizerParticipant) return organizerParticipant.avatar;
  return '';
};

export const DynamicLayerQuickBar: React.FC<DynamicLayerQuickBarProps> = ({
  activeLayer,
  friends,
  activities = [],
  schedules = [],
  customMarkers = [],
  lifePlaces = [],
  onSelectLifePlace,
  starCards = [],
  selectedItemId,
  showPlaces = true,
  showStars = true,
  onFocusItem,
  onSelectFriend,
  onSelectActivity,
  onSelectSchedule,
  onSelectCustomMarker,
  onSelectStarCard,
  onSelectLayer,
  onOpenFriendsList,
  onClose,
  className = '',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFocusedId = useRef<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [lifeSubFilter, setLifeSubFilter] = useState<'all' | 'places' | 'schedules'>('all');

  useEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
    lastFocusedId.current = null;
    setFocusedId(null);
    setLifeSubFilter('all');
    return () => { if (scrollTimer.current) clearTimeout(scrollTimer.current); };
  }, [activeLayer, showPlaces, showStars]);

  const handleCardScroll = () => {
    if (!onFocusItem) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const cards: HTMLButtonElement[] = Array.from(container.querySelectorAll('[data-focus-id]')) as HTMLButtonElement[];
      const leadingEdge = container.getBoundingClientRect().left + 16;
      const card = cards.reduce<HTMLButtonElement | null>((nearest, item) =>
        !nearest || Math.abs(item.getBoundingClientRect().left - leadingEdge) < Math.abs(nearest.getBoundingClientRect().left - leadingEdge) ? item : nearest, null);
      if (!card || card.dataset.focusId === lastFocusedId.current) return;
      const lat = Number(card.dataset.lat), lng = Number(card.dataset.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      lastFocusedId.current = card.dataset.focusId!;
      setFocusedId(lastFocusedId.current);
      onFocusItem({ id: lastFocusedId.current, lat, lng });
    }, 140);
  };

  // 1. Separate Family Members vs General Friends
  const familyMembers = useMemo(() => {
    return friends.filter(
      (f) => f.relationship === 'family' || f.isFamily || f.id.startsWith('fam-') || f.name.includes('爸爸') || f.name.includes('妈妈') || f.name.includes('儿子') || f.name.includes('爷爷') || f.name.includes('奶奶')
    );
  }, [friends]);

  const nonFamilyFriends = useMemo(() => {
    return friends.filter(
      (f) => !f.id.startsWith('fam-') && !f.isFamily && f.relationship !== 'family' && !f.name.includes('爸爸') && !f.name.includes('妈妈') && !f.name.includes('爷爷') && !f.name.includes('奶奶') && !f.isGroupMember
    );
  }, [friends]);

  // 2. User-Related Activities
  const userRelatedActivities = useMemo(() => {
    if (!activities || activities.length === 0) return [];
    return [...activities].sort((a, b) => {
      if (a.isUserPublished && !b.isUserPublished) return -1;
      if (!a.isUserPublished && b.isUserPublished) return 1;
      return 0;
    });
  }, [activities]);

  // 3. Group Active Members (小组活动成员)
  const groupActiveMembers = useMemo(() => {
    return friends.filter(
      (f) => f.isGroupMember || f.groupId || f.id.startsWith('team-') || f.name.includes('陈晨') || f.name.includes('林峰') || f.name.includes('赵敏') || f.name.includes('王珂')
    );
  }, [friends]);

  // 4. Squad Tactical Members & Data
  const squadMembers = useMemo(() => {
    return [
      {
        id: 'squad-lead-alex',
        name: 'Alex (先锋先导)',
        role: '先导探路员',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        lat: 36.0665,
        lng: 103.8285,
      },
      {
        id: 'squad-comm-sarah',
        name: 'Sarah (战术联络)',
        role: '协同通信员',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        lat: 36.0610,
        lng: 103.8110,
      },
    ];
  }, []);

  // Layer Meta Information (Facebook straight-edge style)
  const layerMeta = useMemo(() => {
    switch (activeLayer) {
      case 'family':
        return {
          title: '家庭守护快捷栏',
          tag: '家人',
          accentColor: '#10B981',
          bgAccent: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
          icon: ShieldCheck,
        };
      case 'activities':
        return {
          title: '活动集结快捷栏',
          tag: `活动 (${userRelatedActivities.length})`,
          accentColor: '#F97316',
          bgAccent: 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30',
          icon: Flame,
        };
      case 'groups':
        return {
          title: '小组活动成员',
          tag: `成员 (${groupActiveMembers.length})`,
          accentColor: '#06B6D4',
          bgAccent: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/30',
          icon: Users,
        };
      case 'squads':
        return {
          title: '小队战术快捷栏',
          tag: '小队',
          accentColor: '#6366F1',
          bgAccent: 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/30',
          icon: Target,
        };
      case 'schedules':
        return {
          title: '日程与航班快捷栏',
          tag: `日程 (${schedules.length})`,
          accentColor: '#8B5CF6',
          bgAccent: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30',
          icon: Calendar,
        };
      case 'stars':
        return {
          title: '星片图层（打卡 · 发现）',
          tag: `星片 (${starCards.length})`,
          accentColor: '#F59E0B',
          bgAccent: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
          icon: Sparkles,
        };
      case 'life':
      case 'places':
        return {
          title: '生活图层（地图坐标 · 日程）',
          tag: `生活 (${(lifePlaces.length + customMarkers.length) + schedules.length})`,
          accentColor: '#1877F2',
          bgAccent: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/30',
          icon: MapPin,
        };
      case 'friends':
        return {
          title: '好友在线快捷栏',
          tag: `好友 (${nonFamilyFriends.length})`,
          accentColor: '#1877F2',
          bgAccent: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/30',
          icon: Users,
        };
      case 'all':
      default:
        return {
          title: '全景要素快捷栏',
          tag: '全景',
          accentColor: '#1877F2',
          bgAccent: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/30',
          icon: Layers,
        };
    }
  }, [activeLayer, userRelatedActivities.length, groupActiveMembers.length, nonFamilyFriends.length, lifePlaces.length, customMarkers.length, schedules.length, starCards.length]);

  // 全部图层开启时，不显示内容
  if (activeLayer === 'all') {
    return null;
  }

  return (
    <div
      className={`stellar-layer-quickbar ${activeLayer === 'friends' ? 'is-friends' : ''} relative z-30 select-none pointer-events-auto max-w-full flex items-center justify-center ${className}`}
      aria-label="快速成员导航栏"
      data-layer={activeLayer}
    >
      {/* Horizontal Scrolling Items (去除大方块气泡，纯头像呈现，无多余背景框) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleCardScroll}
        className={`stellar-layer-quickbar-scroll ${activeLayer === 'friends' ? 'stellar-friends-quickbar' : ''} flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 px-2 max-w-full`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* === CASE 1: FAMILY LAYER (家人守护快捷栏 - 纯头像与名字) === */}
        {activeLayer === 'family' && (
          <>
            {familyMembers.map((member, idx) => {
              const isSelected = selectedItemId === member.id;
              return (
                <button
                  key={`dl-fam-${member.id || idx}-${idx}`}
                  type="button"
                  onClick={() => {
                    haptics.trigger('light');
                    soundEffects.playTapSound();
                    onSelectFriend(member);
                  }}
                  className="flex flex-col items-center shrink-0 transition-transform duration-200 cursor-pointer group active:scale-95 focus:outline-none"
                  title={`定位「${member.name}」`}
                >
                  <div className={`relative w-11 h-11 rounded-full p-0.5 transition-all duration-200 ${
                    isSelected
                      ? 'ring-3 ring-[#10B981] scale-110 shadow-lg'
                      : 'ring-2 ring-emerald-400/90 shadow-md group-hover:scale-105'
                  }`}>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full bg-zinc-800"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-xs" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate max-w-[64px] text-center mt-1 select-none">
                    {member.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </>
        )}

        {/* Activity photo cards preserve the existing selection callback. */}
        {activeLayer === 'activities' && userRelatedActivities.map((act) => {
          const status = getActivityStatusInfo(act);
          const organizerName = getOrganizerName(act);
          const organizerAvatar = getOrganizerAvatar(act);
          return <button
            key={`dl-act-${act.id}`}
            type="button"
            data-focus-id={act.id} data-lat={act.lat} data-lng={act.lng}
            data-focused={focusedId === act.id || selectedItemId === act.id}
            className="stellar-layer-card stellar-photo-card"
            title={`打开活动「${act.title}」`}
            onClick={() => { haptics.trigger('light'); soundEffects.playTapSound(); onSelectActivity(act); }}
          >
            <span className="stellar-layer-photo">
              <img src={getActivityCover(act)} alt="" loading="lazy" />
              <span className="stellar-card-status" data-phase={status.isExpired ? 'ended' : status.statusLabel === '进行中' ? 'active' : 'upcoming'}>{status.statusLabel === '即将开始' ? '准备中' : status.statusLabel}</span>
            </span>
            {organizerAvatar && <img className="stellar-card-host" src={organizerAvatar} alt={organizerName || '活动发起人'} />}
            <strong className="stellar-card-title">{act.title}</strong>
            <span className="stellar-card-meta"><Clock size={13} aria-hidden="true" /><span>{[act.date, act.startTime || act.timeRange].filter(Boolean).join(' ')} · {act.participants.length}人</span></span>
            <span className="stellar-card-meta"><MapPin size={13} aria-hidden="true" /><span>{act.locationName || act.address || '地点待设置'}</span></span>
          </button>;
        })}

        {/* === CASE 3: GROUPS LAYER (小组成员 - 纯头像与名字) === */}
        {activeLayer === 'groups' && (
          <>
            {groupActiveMembers.map((member, idx) => {
              const isSelected = selectedItemId === member.id;
              return (
                <button
                  key={`dl-grp-${member.id || idx}-${idx}`}
                  type="button"
                  onClick={() => {
                    haptics.trigger('light');
                    soundEffects.playTapSound();
                    onSelectFriend(member);
                  }}
                  className="flex flex-col items-center shrink-0 transition-transform duration-200 cursor-pointer group active:scale-95 focus:outline-none"
                  title={`定位组员「${member.name}」`}
                >
                  <div className={`relative w-11 h-11 rounded-full p-0.5 transition-all duration-200 ${
                    isSelected
                      ? 'ring-3 ring-[#06B6D4] scale-110 shadow-lg'
                      : 'ring-2 ring-cyan-400/90 shadow-md group-hover:scale-105'
                  }`}>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full bg-zinc-800"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 border-white dark:border-zinc-900 shadow-xs" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate max-w-[64px] text-center mt-1 select-none">
                    {member.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </>
        )}

        {/* === CASE 4: SQUADS LAYER (小队战术队员 - 纯头像与名字) === */}
        {activeLayer === 'squads' && (
          <>
            {squadMembers.map((squadItem, idx) => (
              <button
                key={`dl-sqd-${squadItem.id || idx}-${idx}`}
                type="button"
                onClick={() => {
                  haptics.trigger('light');
                  soundEffects.playTapSound();
                  onSelectCustomMarker({
                    id: squadItem.id,
                    name: squadItem.name,
                    description: squadItem.role,
                    lat: squadItem.lat,
                    lng: squadItem.lng,
                    iconType: 'pin',
                    color: '#6366F1',
                    category: 'squad',
                    createdAt: Date.now(),
                  } as any);
                }}
                className="flex flex-col items-center shrink-0 transition-transform duration-200 cursor-pointer group active:scale-95 focus:outline-none"
                title={`定位小队成员「${squadItem.name}」`}
              >
                <div className="relative w-11 h-11 rounded-full p-0.5 ring-2 ring-indigo-400/90 shadow-md group-hover:scale-105 transition-all">
                  <img
                    src={squadItem.avatar}
                    alt={squadItem.name}
                    className="w-full h-full object-cover rounded-full bg-zinc-800"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-900 shadow-xs" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate max-w-[64px] text-center mt-1 select-none">
                  {squadItem.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </>
        )}

        {/* Schedules use their stored cover, date and location, without invented attendees. */}
        {activeLayer === 'schedules' && schedules.map((sched) => {
          const phase = schedulePhase(sched);
          const date = scheduleDateParts(sched);
          const flight = sched.type === 'flight' || Boolean(sched.flight);
          const label = flight && sched.flight ? ({ upcoming: '待起飞', departing: '准备出发', to_airport: '前往机场', at_airport: '已到机场', boarding: '登机中', in_flight: '飞行中', landed: '已落地', delayed: '已延误', on_time: '准时', cancelled: '已取消', completed: '已结束' }[sched.flight.status] || '航班') : ({upcoming:'待开始',active:'进行中',ended:'已结束',cancelled:'已取消'}[phase]);
          return <button
            key={`dl-sch-${sched.id}`} type="button"
            data-focus-id={sched.id} data-lat={sched.location.latitude} data-lng={sched.location.longitude}
            data-focused={focusedId === sched.id || selectedItemId === sched.id}
            className="stellar-layer-card stellar-photo-card is-schedule"
            title={`打开日程「${sched.title}」`}
            onClick={() => { haptics.trigger('light'); soundEffects.playTapSound(); onSelectSchedule(sched); }}
          >
            <span className="stellar-layer-photo">
              {sched.image ? <img src={sched.image} alt="" loading="lazy" /> : <span className="stellar-card-photo-placeholder" aria-hidden="true">{sched.icon || (flight ? '✈️' : '📅')}</span>}
              <span className="stellar-card-status" data-phase={phase}>{label}</span>
            </span>
            <strong className="stellar-card-title">{sched.title}</strong>
            <span className="stellar-card-meta"><Clock size={13} aria-hidden="true" /><span>{date.date ? date.date.slice(5).replace('-', '/') : ''} {sched.allDay ? '全天' : date.start || '时间待设置'}</span></span>
            <span className="stellar-card-meta"><MapPin size={13} aria-hidden="true" /><span>{sched.location.name || '地点待设置'}</span></span>
          </button>;
        })}

        {/* === CASE 5: LIFE LAYER (生活图层：地图坐标与日程规划归类显示) === */}
        {(activeLayer === 'life' || activeLayer === 'places') && (
          <>
            {/* 分层子分类快捷切换胶囊 (全部 / 地图坐标 / 日程安排) */}
            <div className="flex items-center gap-1 shrink-0 p-1 bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-800 rounded-md shadow-2xs mr-1">
              <button
                type="button"
                onClick={() => { haptics.trigger('light'); setLifeSubFilter('all'); }}
                className={`px-2 py-1 rounded-sm text-[10px] font-bold cursor-pointer transition-all ${
                  lifeSubFilter === 'all'
                    ? 'bg-[#1877F2] text-white shadow-2xs'
                    : 'text-gray-600 dark:text-zinc-300 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800'
                }`}
              >
                全部生活 ({(lifePlaces.length + customMarkers.length) + schedules.length})
              </button>
              <button
                type="button"
                onClick={() => { haptics.trigger('light'); setLifeSubFilter('places'); }}
                className={`px-2 py-1 rounded-sm text-[10px] font-bold cursor-pointer transition-all ${
                  lifeSubFilter === 'places'
                    ? 'bg-[#1877F2] text-white shadow-2xs'
                    : 'text-gray-600 dark:text-zinc-300 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800'
                }`}
              >
                📍 地图坐标 ({lifePlaces.length + customMarkers.length})
              </button>
              <button
                type="button"
                onClick={() => { haptics.trigger('light'); setLifeSubFilter('schedules'); }}
                className={`px-2 py-1 rounded-sm text-[10px] font-bold cursor-pointer transition-all ${
                  lifeSubFilter === 'schedules'
                    ? 'bg-[#1877F2] text-white shadow-2xs'
                    : 'text-gray-600 dark:text-zinc-300 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800'
                }`}
              >
                📅 日程规划 ({schedules.length})
              </button>
            </div>

            {/* 1. 地图坐标：生活地点卡片 (Life Places) */}
            {(lifeSubFilter === 'all' || lifeSubFilter === 'places') && lifePlaces.map((place) => {
              const image = place.photos?.[0] || place.memory.visits.flatMap(visit => visit.photos || [])[0];
              const intent = placeIntent(place);
              return (
                <button
                  key={`dl-life-${place.id}`}
                  type="button"
                  data-focus-id={place.id}
                  data-lat={place.lat}
                  data-lng={place.lng}
                  data-focused={focusedId === place.id || selectedItemId === place.id}
                  className="stellar-layer-card stellar-info-card is-place border border-[#E4E6EB] hover:border-[#1877F2] rounded-md transition-all shadow-2xs"
                  title={`定位生活地点「${place.name}」`}
                  onClick={() => {
                    haptics.trigger('light');
                    soundEffects.playTapSound();
                    onSelectLifePlace?.(place);
                  }}
                >
                  <span className="stellar-place-photo">
                    {image ? <img src={image} alt="" loading="lazy" /> : <span className="stellar-card-photo-placeholder" aria-hidden="true">{place.icon}</span>}
                  </span>
                  <span className="stellar-info-body">
                    <div className="flex items-center justify-between mb-0.5">
                      <strong className="stellar-card-title truncate max-w-[120px]">{place.name}</strong>
                      <span className="text-[8.5px] px-1 py-0.2 bg-blue-50 text-[#1877F2] font-bold rounded border border-blue-200">地图坐标</span>
                    </div>
                    <span className="stellar-card-meta"><MapPin size={12} aria-hidden="true" /><span>{place.note || '生活常去地'}</span></span>
                    <span className="stellar-card-meta"><span className="stellar-place-intent">{{frequent:'常去',favorite:'喜欢',want_to_go:'想去'}[intent]}</span><span>{place.distanceKm !== undefined ? `${place.distanceKm.toFixed(1)} km` : ''}</span></span>
                    <span className="stellar-card-author"><img src={place.createdBy.avatar} alt="" /><span>{place.createdBy.name}</span></span>
                  </span>
                </button>
              );
            })}

            {/* 2. 地图坐标：自定标记点 (Custom Markers) */}
            {(lifeSubFilter === 'all' || lifeSubFilter === 'places') && customMarkers.map((marker) => (
              <button
                key={`dl-mrk-${marker.id}`}
                type="button"
                data-focus-id={marker.id}
                data-lat={marker.lat}
                data-lng={marker.lng}
                data-focused={focusedId === marker.id || selectedItemId === marker.id}
                className="stellar-layer-card stellar-info-card is-place border border-[#E4E6EB] hover:border-[#1877F2] rounded-md transition-all shadow-2xs"
                title={`定位自定标记「${marker.title}」`}
                onClick={() => {
                  haptics.trigger('light');
                  soundEffects.playTapSound();
                  onSelectCustomMarker(marker);
                }}
              >
                <span className="stellar-place-photo">
                  {marker.photos?.[0]?.url ? <img src={marker.photos[0].url} alt="" loading="lazy" /> : <span className="stellar-card-photo-placeholder" aria-hidden="true">{marker.icon || '📍'}</span>}
                </span>
                <span className="stellar-info-body">
                  <div className="flex items-center justify-between mb-0.5">
                    <strong className="stellar-card-title truncate max-w-[120px]">{marker.title}</strong>
                    <span className="text-[8.5px] px-1 py-0.2 bg-emerald-50 text-emerald-600 font-bold rounded border border-emerald-200">据点坐标</span>
                  </div>
                  <span className="stellar-card-meta"><MapPin size={12} aria-hidden="true" /><span>{marker.address || '已保存坐标'}</span></span>
                  <span className="stellar-card-meta"><Navigation size={12} aria-hidden="true" /><span>{marker.categoryLabel || '个人空间'}</span></span>
                  {marker.authorName && <span className="stellar-card-author">{marker.authorAvatar && <img src={marker.authorAvatar} alt="" />}<span>{marker.authorName}</span></span>}
                </span>
              </button>
            ))}

            {/* 3. 日程安排与航班卡片 (Schedules in Life Layer) */}
            {(lifeSubFilter === 'all' || lifeSubFilter === 'schedules') && schedules.map((sched) => {
              const phase = schedulePhase(sched);
              const date = scheduleDateParts(sched);
              const flight = sched.type === 'flight' || Boolean(sched.flight);
              const label = flight && sched.flight ? ({ upcoming: '待起飞', departing: '准备出发', to_airport: '前往机场', at_airport: '已到机场', boarding: '登机中', in_flight: '飞行中', landed: '已落地', delayed: '已延误', on_time: '准时', cancelled: '已取消', completed: '已结束' }[sched.flight.status] || '航班') : ({upcoming:'待开始',active:'进行中',ended:'已结束',cancelled:'已取消'}[phase]);
              return (
                <button
                  key={`dl-life-sch-${sched.id}`}
                  type="button"
                  data-focus-id={sched.id}
                  data-lat={sched.location.latitude}
                  data-lng={sched.location.longitude}
                  data-focused={focusedId === sched.id || selectedItemId === sched.id}
                  className="stellar-layer-card stellar-photo-card is-schedule border border-[#E4E6EB] hover:border-[#1877F2] rounded-md transition-all shadow-2xs"
                  title={`定位生活日程「${sched.title}」`}
                  onClick={() => {
                    haptics.trigger('light');
                    soundEffects.playTapSound();
                    onSelectSchedule(sched);
                  }}
                >
                  <span className="stellar-layer-photo">
                    {sched.image ? <img src={sched.image} alt="" loading="lazy" /> : <span className="stellar-card-photo-placeholder" aria-hidden="true">{sched.icon || (flight ? '✈️' : '📅')}</span>}
                    <span className="stellar-card-status" data-phase={phase}>{label}</span>
                  </span>
                  <div className="flex items-center justify-between px-2 pt-1">
                    <strong className="stellar-card-title truncate max-w-[120px]">{sched.title}</strong>
                    <span className="text-[8.5px] px-1 py-0.2 bg-purple-50 text-purple-600 font-bold rounded border border-purple-200">{flight ? '航班' : '日程'}</span>
                  </div>
                  <span className="stellar-card-meta"><Clock size={12} aria-hidden="true" /><span>{date.date ? date.date.slice(5).replace('-', '/') : ''} {sched.allDay ? '全天' : date.start || '待定'}</span></span>
                  <span className="stellar-card-meta"><MapPin size={12} aria-hidden="true" /><span>{sched.location.name || '地点待设置'}</span></span>
                </button>
              );
            })}
          </>
        )}

        {/* === CASE 6: STARS LAYER (星片图层：打卡回忆与瞬间发现) === */}
        {activeLayer === 'stars' && starCards.map((card) => {
          const date = starCardCreationDate(card);
          const [month, day] = date.short.includes('/') ? date.short.split('/') : ['—', '—'];
          const image = card.image || card.images?.[0];
          return (
            <button
              key={`dl-crd-${card.id}`}
              type="button"
              data-focus-id={card.id}
              data-lat={card.lat}
              data-lng={card.lng}
              data-focused={focusedId === card.id || selectedItemId === card.id}
              className="stellar-layer-card stellar-info-card is-star border border-[#E4E6EB] hover:border-[#1877F2] rounded-md transition-all shadow-2xs"
              title={`打开星片「${card.content}」`}
              onClick={() => {
                haptics.trigger('light');
                soundEffects.playTapSound();
                onSelectStarCard(card);
              }}
            >
              <span className="stellar-star-photo">
                {image ? <img className="stellar-star-image" src={image} alt="" loading="lazy" /> : <span className="stellar-card-photo-placeholder" aria-hidden="true">✨</span>}
                <img className="stellar-star-avatar" src={card.authorAvatar} alt="" />
                <span className="stellar-star-calendar" title={date.full}><span>{month === '—' ? '—' : `${Number(month)}月`}</span><strong>{day}</strong></span>
              </span>
              <span className="stellar-info-body">
                <div className="flex items-center justify-between mb-0.5">
                  <strong className="stellar-card-title truncate max-w-[120px]">{card.content || card.location || '星片'}</strong>
                  <span className="text-[8.5px] px-1 py-0.2 bg-amber-50 text-amber-600 font-bold rounded border border-amber-200">星片</span>
                </div>
                <span className="stellar-card-meta"><Calendar size={12} aria-hidden="true" /><span>{date.short}</span></span>
                <span className="stellar-card-meta"><MapPin size={12} aria-hidden="true" /><span>{card.location || '位置未记录'}</span></span>
                <span className="stellar-card-author"><img src={card.authorAvatar} alt="" /><span>{card.authorName}</span></span>
              </span>
            </button>
          );
        })}

        {/* === CASE 7: FRIENDS LAYER (好友快捷栏 - 纯头像呈现，无方块气泡) === */}
        {activeLayer === 'friends' && (
          <>
            {nonFamilyFriends.map((friend, idx) => {
              const isSelected = selectedItemId === friend.id;
              return (
                <button
                  key={`dl-frd-${friend.id || idx}-${idx}`}
                  type="button"
                  aria-label={`定位好友「${friend.name}」`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    haptics.trigger('light');
                    soundEffects.playTapSound();
                    onSelectFriend(friend);
                  }}
                  className="stellar-quick-friend-button flex flex-col items-center shrink-0 cursor-pointer group active:scale-95"
                  title={`定位好友「${friend.name}」`}
                >
                  {/* 好友只显示头像 */}
                  <div className={`stellar-quick-friend-avatar ${isSelected ? 'is-selected' : ''} relative w-11 h-11 rounded-full p-0.5`}>
                    <img
                      src={friend.avatar}
                      alt=""
                      className="w-full h-full object-cover rounded-full bg-zinc-800"
                    />
                    {friend.isOnline !== false && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-xs" />
                    )}
                  </div>
                  {/* 好友名字 */}
                  <span className="stellar-quick-friend-name truncate max-w-[64px] text-center mt-1 select-none">
                    {friend.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
