import React, { useMemo, useState } from 'react';
import { MapPin, Navigation, Sparkles, Check, Bookmark, ExternalLink } from 'lucide-react';
import { ChatMessage, Friend, LifePlace } from '../types';
import { calculateLatLngDistanceMeters } from '../utils/geoUtils';
import { USER_LOCATION } from '../data/mockData';
import { lifeLayerStore, LIFE_PLACE_CATEGORIES } from '../data/lifeLayerStore';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';

interface LifePlaceChatCardProps {
  message: ChatMessage;
  senderAvatar: string;
  senderName: string;
  friendName: string;
  friendAvatar?: string;
  friend?: Friend;
  isMe: boolean;
  onClick?: () => void;
  onAdoptAsMyPlace?: (place: LifePlace) => void;
  showToast?: (msg: string) => void;
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

export const LifePlaceChatCard: React.FC<LifePlaceChatCardProps> = ({
  message,
  senderAvatar,
  senderName,
  friendName,
  friendAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  friend,
  isMe,
  onClick,
  onAdoptAsMyPlace,
  showToast,
}) => {
  // Extract place data from message or fallback
  const place = useMemo<LifePlace>(() => {
    if (message.lifePlaceData) return message.lifePlaceData;
    const loc = message.locationData;
    return {
      id: message.lifePlaceId || `place-fallback-${message.id}`,
      name: loc?.name || message.text?.replace(/^\[生活坐标\s*📍?\]\s*/, '') || '生活探索坐标',
      category: 'cafe',
      icon: '☕',
      color: '#F2A65A',
      lat: loc?.lat ?? 36.0612,
      lng: loc?.lng ?? 103.8368,
      createdBy: {
        id: message.senderId,
        name: senderName,
        avatar: senderAvatar,
        isMe,
      },
      createdAt: new Date().toISOString(),
      tags: ['宝藏地点', '生活图层'],
      note: '好友分享的个人生活坐标，常来此地小憩或探索。',
      distanceKm: 0.35,
      direction: '兰州城关',
      isSaved: false,
      memory: {
        visitCount: 3,
        totalDwellMinutes: 120,
        avgStayMinutes: 40,
        firstVisitAt: new Date().toISOString(),
        lastVisitAt: new Date().toISOString(),
        currentlyHere: false,
        currentDwellMinutes: 0,
        visitSparklineWeeks: [1, 2, 1, 0, 1, 2, 0, 1],
        dominantMood: '😄',
        visits: [],
      },
      encounters: { friendCount: 1, totalEncounters: 2, friends: [] },
      visitors: { friendsWhoVisit: [], popularByWeekdayHour: [] },
      sharing: { forwardedTo: [], revocable: true },
    };
  }, [message, senderName, senderAvatar, isMe]);

  const [isAdopted, setIsAdopted] = useState<boolean>(() => {
    return lifeLayerStore.isAdoptedOrOwned({
      id: place.id,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
    });
  });

  const categoryMeta = useMemo(() => {
    return (
      LIFE_PLACE_CATEGORIES.find((c) => c.key === place.category) || {
        key: 'other',
        label: '生活据点',
        icon: place.icon || '📍',
        color: place.color || '#1877F2',
        gradient: 'from-blue-500 to-indigo-600',
      }
    );
  }, [place.category, place.icon, place.color]);

  const lat = place.lat;
  const lng = place.lng;

  // Derive static map tile URL
  const tileUrl = useMemo(() => {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return '';
    }
    return getTileUrl(lat, lng, 14);
  }, [lat, lng]);

  // Compute realistic distance
  const distanceText = useMemo(() => {
    const sLat = lat;
    const sLng = lng;
    const tLat = isMe ? (friend?.lat ?? 36.065) : USER_LOCATION.lat;
    const tLng = isMe ? (friend?.lng ?? 103.84) : USER_LOCATION.lng;

    if (
      typeof sLat === 'number' &&
      typeof sLng === 'number' &&
      typeof tLat === 'number' &&
      typeof tLng === 'number' &&
      !isNaN(sLat) &&
      !isNaN(sLng) &&
      !isNaN(tLat) &&
      !isNaN(tLng)
    ) {
      const distM = calculateLatLngDistanceMeters(sLat, sLng, tLat, tLng);
      if (distM < 1000) {
        return `${Math.max(50, Math.round(distM))} m`;
      }
      return `${(distM / 1000).toFixed(1)} km`;
    }
    return place.distanceKm ? `${place.distanceKm} km` : '350 m';
  }, [lat, lng, isMe, friend, place.distanceKm]);

  // Handle One-Click Adopt as My Life Place
  const handleAdopt = () => {
    haptics.trigger('success');
    soundEffects.playSuccessSound();

    const result = lifeLayerStore.adoptPlaceAsMyOwn(place);
    setIsAdopted(true);

    if (onAdoptAsMyPlace) {
      onAdoptAsMyPlace(result.place);
    }

    if (showToast) {
      showToast(
        result.alreadyExists
          ? `⭐️ 已将「${place.name}」收藏并置顶在你的生活图层！`
          : `✨ 已成功将「${place.name}」一键设为你的生活坐标（${categoryMeta.label}）！`
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const accessibleLabel = `生活坐标卡片：${place.name}，分类：${categoryMeta.label}，距离：${distanceText}，创建者：${place.createdBy?.name || senderName}`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={accessibleLabel}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onKeyDown={handleKeyDown}
      className="group relative w-full max-w-[340px] bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-2xs hover:border-[#1877F2] dark:hover:border-[#1877F2] hover:shadow-xs transition-all cursor-pointer overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] text-left active:scale-[0.99]"
    >
      {/* Horizontal Two-Column Composition: ~70% Info / ~30% Map Thumbnail */}
      <div className="flex items-stretch min-h-[118px]">
        {/* Left Column: Life Place Info & Quick Actions */}
        <div className="flex-1 p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden">
          <div>
            {/* Top Row: Category Emoji Badge + Tags + Source */}
            <div className="flex items-start space-x-2.5">
              {/* Category Emoji Badge */}
              <div
                className="w-11 h-11 rounded-md flex items-center justify-center text-xl shrink-0 shadow-2xs border border-[#E4E6EB] dark:border-zinc-700 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: `${categoryMeta.color}18` }}
                title={`分类: ${categoryMeta.label}`}
              >
                <span>{place.icon || categoryMeta.icon}</span>
              </div>

              {/* Status & Title Area */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                  <span className="font-extrabold text-[11.5px] truncate tracking-tight text-[#1877F2]">
                    生活坐标
                  </span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm border shrink-0"
                    style={{
                      backgroundColor: `${categoryMeta.color}15`,
                      color: categoryMeta.color,
                      borderColor: `${categoryMeta.color}35`,
                    }}
                  >
                    {categoryMeta.label}
                  </span>
                  <span className="text-[9px] font-bold px-1 py-0.2 rounded-sm bg-[#F0F2F5] dark:bg-zinc-800 text-[#65676B] dark:text-zinc-300 border border-[#E4E6EB] dark:border-zinc-700">
                    {place.createdBy?.isMe ? '我创建的' : '好友私藏'}
                  </span>
                </div>

                {/* Primary Place Name */}
                <h4
                  className="mt-1 font-extrabold text-[13px] sm:text-[13.5px] leading-snug text-[#050505] dark:text-[#E4E6EB] line-clamp-1 group-hover:text-[#1877F2] transition-colors"
                  title={place.name}
                >
                  {place.name}
                </h4>
              </div>
            </div>

            {/* Address / Direction / Distance line */}
            <div className="mt-1.5 flex items-center space-x-1 text-[#65676B] dark:text-zinc-400 text-[10.5px] truncate">
              <MapPin size={11.5} className="text-[#1877F2] shrink-0" />
              <span className="truncate">
                {place.direction ? `${place.direction} · ` : ''}
                {place.address || '甘肃省兰州市城关区'}
              </span>
            </div>

            {/* Note Quote (if present) */}
            {place.note && (
              <p className="mt-1.5 text-[10px] text-[#65676B] dark:text-zinc-400 italic bg-[#F7F8FA] dark:bg-zinc-800/80 px-2 py-1 rounded-sm border border-[#E4E6EB] dark:border-zinc-700/80 line-clamp-1">
                “{place.note}”
              </p>
            )}
          </div>

          {/* Bottom Row: Sender Info + One-Click Adopt Button */}
          <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-[#E4E6EB] dark:border-zinc-700 gap-1.5">
            {/* Sender Avatar & Distance */}
            <div className="flex items-center space-x-1.5 min-w-0">
              <img
                src={senderAvatar}
                alt={senderName}
                title={`分享人: ${senderName}`}
                className="w-4.5 h-4.5 rounded-full object-cover border border-[#E4E6EB] dark:border-zinc-700 shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100';
                }}
              />
              <span className="text-[10px] font-bold text-[#65676B] dark:text-zinc-400 truncate">
                相距 {distanceText}
              </span>
            </div>

            {/* Actions: One-Click Set as My Life Place Button */}
            <div className="flex items-center gap-1 shrink-0">
              {isAdopted ? (
                <div
                  className="px-2 py-0.8 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-sm border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 select-none"
                  title="已收录至您的个人生活图层"
                >
                  <Check size={11} className="stroke-[2.5]" />
                  <span>已设为我的坐标</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdopt();
                  }}
                  className="px-2.5 py-0.8 bg-[#1877F2] hover:bg-[#166FE5] text-white text-[10px] font-bold rounded-sm border border-[#1877F2] flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                  title="一键将该地点设为我的生活坐标并同步至生活图层"
                >
                  <Sparkles size={11} className="shrink-0" />
                  <span>设为生活坐标</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Map Tile Thumbnail with Themed Pin Marker */}
        <div className="w-[30%] min-w-[95px] max-w-[115px] bg-[#F0F2F5] dark:bg-zinc-800 border-l border-[#E4E6EB] dark:border-zinc-700 relative overflow-hidden pointer-events-none select-none flex items-center justify-center">
          {tileUrl ? (
            <>
              {/* Map Tile Image */}
              <img
                src={tileUrl}
                alt="Map Thumbnail"
                className="absolute inset-0 w-full h-full object-cover filter saturate-[1.15] contrast-[1.05]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />

              {/* Light grid overlay */}
              <div className="absolute inset-0 bg-[#1877F2]/5" />

              {/* Centered Map Pin Anchor Marker with Place Category Emoji */}
              <div className="relative z-10 flex flex-col items-center drop-shadow-md">
                {/* Pin Head Bubble with Emoji */}
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full p-0.5 shadow-md ring-2 ring-white dark:ring-zinc-900 overflow-hidden flex items-center justify-center text-sm"
                    style={{ backgroundColor: categoryMeta.color }}
                  >
                    <span>{place.icon || categoryMeta.icon}</span>
                  </div>
                  {/* Subtle sparkle dot */}
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-zinc-900 shadow-xs" />
                </div>

                {/* Downward-pointing triangle tip */}
                <div
                  className="w-0 h-0 border-l-[4.5px] border-l-transparent border-r-[4.5px] border-r-transparent border-t-[6.5px] -mt-[0.5px]"
                  style={{ borderTopColor: categoryMeta.color }}
                />

                {/* Anchor ground contact shadow */}
                <div className="w-3.5 h-1 bg-black/35 dark:bg-black/60 rounded-full blur-[0.5px] mt-0.5" />
              </div>
            </>
          ) : (
            <div className="p-2 flex flex-col items-center justify-center text-center space-y-1 text-gray-400">
              <div
                className="w-8 h-8 rounded-full border border-[#E4E6EB] dark:border-zinc-600 flex items-center justify-center text-base"
                style={{ backgroundColor: `${categoryMeta.color}20` }}
              >
                <span>{place.icon || categoryMeta.icon}</span>
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
