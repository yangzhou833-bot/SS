import React, { useMemo } from 'react';
import { MapPin, Navigation, UserCheck, MessageSquare, ExternalLink, Sparkles, UserPlus } from 'lucide-react';
import { ChatMessage, ContactCardData } from '../types';
import { calculateLatLngDistanceMeters } from '../utils/geoUtils';
import { USER_LOCATION } from '../data/mockData';

interface ContactChatCardProps {
  message: ChatMessage;
  contactData?: ContactCardData;
  senderAvatar?: string;
  senderName?: string;
  onOpenProfile?: (userId?: string) => void;
  onOpenBriefModal?: (contact: ContactCardData) => void;
  onAddFriend?: (contact: ContactCardData) => void;
  onNavigateToLocation?: (location: { lat: number; lng: number; name: string }) => void;
  isMe?: boolean;
}

/**
 * Converts lat/lng coordinates to a CartoCDN Voyager tile coordinate at zoom level 14
 */
function getTileUrl(lat: number, lng: number, zoom: number = 14): string {
  try {
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lng + 180) / 360) * n);
    const latRad = (lat * Math.PI) / 180;
    const y = Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
    );
    const subdomains = ['a', 'b', 'c', 'd'];
    const s = subdomains[Math.abs(x + y) % subdomains.length];
    return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${x}/${y}.png`;
  } catch {
    return '';
  }
}

export const ContactChatCard: React.FC<ContactChatCardProps> = ({
  message,
  contactData: customContactData,
  senderAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  senderName = '我',
  onOpenProfile,
  onOpenBriefModal,
  onAddFriend,
  onNavigateToLocation,
  isMe = false,
}) => {
  const data = customContactData || message.contactData || {
    name: 'Sarah Chen (薛梦)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    bio: '户外探索领队 · 摄影爱好者',
    locationName: '东方红广场',
    address: '甘肃省兰州市城关区广场南路',
    lat: 36.0615,
    lng: 103.8085,
    distance: '850m',
    mutualFriendsCount: 6,
    isOnline: true,
  };

  const isSelf = data.userId === 'me' || data.role === '本人名片';
  const isAlreadyFriend = data.isFriend ?? (data.userId && !isSelf && data.userId !== 'me');

  const lat = data.lat ?? 36.0615;
  const lng = data.lng ?? 103.8085;
  const locationName = data.locationName || '兰州 · 东方红广场';
  const address = data.address || '甘肃省兰州市城关区广场南路';

  // Static map preview tile URL
  const tileUrl = useMemo(() => {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return '';
    }
    return getTileUrl(lat, lng, 14);
  }, [lat, lng]);

  // Compute realistic distance to user location
  const distanceText = useMemo(() => {
    if (data.distance) return data.distance.replace(/\s*\(.*\)/, '').trim();
    if (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng)
    ) {
      const distM = calculateLatLngDistanceMeters(
        USER_LOCATION.lat,
        USER_LOCATION.lng,
        lat,
        lng
      );
      if (distM < 1000) {
        return `${Math.max(60, Math.round(distM))} m`;
      }
      return `${(distM / 1000).toFixed(1)} km`;
    }
    return '850 m';
  }, [lat, lng, data.distance]);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenBriefModal) {
      onOpenBriefModal(data);
    } else if (onOpenProfile && data.userId) {
      onOpenProfile(data.userId);
    } else if (onNavigateToLocation) {
      onNavigateToLocation({ lat, lng, name: `${data.name} 的常驻位置` });
    }
  };

  const handleLocationBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigateToLocation) {
      onNavigateToLocation({ lat, lng, name: `${data.name} · ${locationName}` });
    } else if (onOpenBriefModal) {
      onOpenBriefModal(data);
    }
  };

  const handleAddFriendClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddFriend) {
      onAddFriend(data);
    } else if (onOpenBriefModal) {
      onOpenBriefModal(data);
    } else if (onOpenProfile && data.userId) {
      onOpenProfile(data.userId);
    }
  };

  const accessibleLabel = `名片卡片：${data.name}，${data.bio || ''}，当前定位：${locationName}，相距 ${distanceText}`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={accessibleLabel}
      onClick={handleCardClick}
      className="group relative w-full max-w-[340px] bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-2xs hover:border-[#1877F2] dark:hover:border-[#1877F2] hover:shadow-xs transition-all cursor-pointer overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] text-left active:scale-[0.99]"
    >
      {/* Horizontal Two-Column Composition: Info Column (~70%) + Map & Avatar Column (~30%) */}
      <div className="flex items-stretch min-h-[118px]">
        {/* Left Column: User Details & Location */}
        <div className="flex-1 p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden">
          <div>
            {/* Top Row: Theme Badge + Status & Name */}
            <div className="flex items-start space-x-2.5">
              {/* User Avatar Badge with Facebook Straight-Edge Line Frame */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-md overflow-hidden border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs group-hover:scale-105 transition-transform bg-gray-100 dark:bg-zinc-800">
                  <img
                    src={data.avatar}
                    alt={data.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';
                    }}
                  />
                </div>
                {/* Online indicator dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-800 shadow-2xs ${
                    data.isOnline !== false ? 'bg-emerald-500' : 'bg-gray-400'
                  }`}
                  title={data.isOnline !== false ? '当前在线' : '离线'}
                />
              </div>

              {/* Status Header & User Name */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                  <span className="font-extrabold text-[11.5px] truncate tracking-tight text-[#1877F2]">
                    好友名片
                  </span>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-sm bg-[#F0F2F5] dark:bg-zinc-800 text-[#65676B] dark:text-zinc-300 border border-[#E4E6EB] dark:border-zinc-700">
                    {data.role || '名片分享'}
                  </span>
                </div>

                {/* Primary User Name */}
                <div className="mt-0.5 flex items-center space-x-1">
                  <h4
                    className="font-extrabold text-[13px] sm:text-[13.5px] leading-snug text-[#050505] dark:text-[#E4E6EB] line-clamp-1 group-hover:text-[#1877F2] transition-colors"
                    title={data.name}
                  >
                    {data.name}
                  </h4>
                  {data.mutualFriendsCount && data.mutualFriendsCount > 0 ? (
                    <span className="text-[9px] text-[#1877F2] bg-blue-50 dark:bg-blue-950/60 px-1 rounded font-bold shrink-0">
                      {data.mutualFriendsCount}位共同好友
                    </span>
                  ) : null}
                </div>

                {/* User Bio / Details */}
                <p className="text-[10.5px] text-[#65676B] dark:text-zinc-400 truncate mt-0.5">
                  {data.bio || (data.handle ? `@${data.handle.replace(/^@/, '')}` : '同城探索活跃用户')}
                </p>
              </div>
            </div>

            {/* Geolocation line with MapPin (similar to Map Card) */}
            <div
              onClick={handleLocationBadgeClick}
              className="mt-2 flex items-center space-x-1 text-[#65676B] dark:text-zinc-400 text-[10.5px] sm:text-[11px] truncate hover:text-[#1877F2] transition-colors"
              title={`${locationName} · ${address}`}
            >
              <MapPin size={12} className="text-[#1877F2] shrink-0" />
              <span className="font-medium truncate">{locationName}</span>
              <span className="text-gray-300 dark:text-zinc-600 shrink-0">·</span>
              <span className="truncate opacity-85">{address}</span>
            </div>
          </div>

          {/* Bottom Bar: Sender Avatar (不显示文字) + Prominent Distance Chip & Profile Action */}
          <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-[#E4E6EB] dark:border-zinc-700">
            {/* Sender Avatar Only (不显示文字) */}
            <div className="flex items-center min-w-0">
              <img
                src={
                  senderAvatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
                }
                alt={senderName || '发送人'}
                title={senderName ? `发送人: ${senderName}` : '发送人'}
                className="w-5 h-5 rounded-full object-cover border-2 border-white dark:border-zinc-800 ring-1 ring-black/5 shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100';
                }}
              />
            </div>

            {/* Prominent Distance & Action */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <div className="flex items-center space-x-1 text-[#1877F2] dark:text-[#2D88FF] font-black text-[10.5px] sm:text-[11px] bg-blue-50/90 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/40">
                <Navigation size={10} className="shrink-0 fill-[#1877F2] dark:fill-[#2D88FF]" />
                <span>相距 {distanceText}</span>
              </div>

              <button
                type="button"
                id={`add-friend-btn-${data.userId || data.name}`}
                onClick={handleAddFriendClick}
                className="px-2.5 py-1 rounded-sm bg-[#1877F2] hover:bg-[#166FE5] active:scale-95 text-white font-bold text-[10.5px] transition-all cursor-pointer flex items-center space-x-1 shadow-2xs"
                title={isSelf ? "查看本人名片" : isAlreadyFriend ? "查看好友详情 / 已是好友" : `添加 ${data.name} 为好友`}
              >
                <UserPlus size={11} strokeWidth={2.5} className="shrink-0" />
                <span>{isSelf ? "我的名片" : isAlreadyFriend ? "已是好友" : "添加好友"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Mini Map Thumbnail with Contact Avatar Pin Anchor */}
        <div className="w-[30%] min-w-[95px] max-w-[115px] bg-[#F0F2F5] dark:bg-zinc-800 border-l border-[#E4E6EB] dark:border-zinc-700 relative overflow-hidden pointer-events-none select-none flex items-center justify-center">
          {tileUrl ? (
            <>
              {/* Map Tile Image */}
              <img
                src={tileUrl}
                alt="Location Map Preview"
                className="absolute inset-0 w-full h-full object-cover filter saturate-[1.15] contrast-[1.05]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />

              {/* Light blue grid tint */}
              <div className="absolute inset-0 bg-[#1877F2]/5" />

              {/* Centered Map Pin Anchor with Contact Avatar */}
              <div className="relative z-10 flex flex-col items-center drop-shadow-md">
                {/* Pin Head Bubble with User Avatar */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full p-0.5 bg-[#1877F2] shadow-md ring-2 ring-white dark:ring-zinc-900 overflow-hidden flex items-center justify-center">
                    <img
                      src={data.avatar}
                      alt={data.name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';
                      }}
                    />
                  </div>
                  {/* Status beacon dot */}
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900 shadow-xs ${
                      data.isOnline !== false ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                    }`}
                  />
                </div>

                {/* Downward-pointing triangle tip (地图图钉锚点针尖) */}
                <div className="w-0 h-0 border-l-[4.5px] border-l-transparent border-r-[4.5px] border-r-transparent border-t-[6.5px] border-t-[#1877F2] -mt-[0.5px]" />

                {/* Anchor ground contact shadow */}
                <div className="w-3.5 h-1 bg-black/35 dark:bg-black/60 rounded-full blur-[0.5px] mt-0.5" />
              </div>
            </>
          ) : (
            /* Fallback avatar preview */
            <div className="p-2 flex flex-col items-center justify-center text-center space-y-1">
              <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-zinc-700 border border-[#E4E6EB] dark:border-zinc-600 flex items-center justify-center text-[#1877F2]">
                <UserCheck size={18} />
              </div>
              <span className="text-[9px] font-bold text-[#1877F2]">
                {distanceText}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

