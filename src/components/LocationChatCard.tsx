import React, { useMemo } from 'react';
import { MapPin, Navigation, Compass, Radio } from 'lucide-react';
import { ChatMessage, Friend } from '../types';
import { calculateLatLngDistanceMeters } from '../utils/geoUtils';
import { USER_LOCATION } from '../data/mockData';

interface LocationChatCardProps {
  message: ChatMessage;
  senderAvatar: string;
  senderName: string;
  friendName: string;
  friendAvatar?: string;
  friend?: Friend;
  isMe: boolean;
  onClick?: () => void;
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

export const LocationChatCard: React.FC<LocationChatCardProps> = ({
  message,
  senderAvatar,
  senderName,
  friendName,
  friendAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  friend,
  isMe,
  onClick,
}) => {
  // Extract coordinates from message
  const locData = message.liveLocation || message.locationData;
  const lat = locData?.lat ?? (isMe ? USER_LOCATION.lat : friend?.lat ?? 36.0611);
  const lng = locData?.lng ?? (isMe ? USER_LOCATION.lng : friend?.lng ?? 103.8343);
  const locationName =
    locData?.name ||
    (locData as any)?.locationName ||
    '兰州 · 中山铁桥';
  const address =
    locData?.address ||
    '甘肃省兰州市城关区南滨河东路';

  const isLive = Boolean(message.liveLocation && message.liveLocation.isActive !== false);

  // Derive static map tile URL
  const tileUrl = useMemo(() => {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return '';
    }
    return getTileUrl(lat, lng, 14);
  }, [lat, lng]);

  // Compute realistic distance between sender and friend
  const distanceText = useMemo(() => {
    // Determine the two reference points:
    // Sender coordinate:
    const sLat = lat;
    const sLng = lng;

    // Target/Friend coordinate:
    // If sender is me, other party is friend
    // If sender is friend, other party is me (USER_LOCATION)
    const tLat = isMe ? (friend?.lat ?? 36.0650) : USER_LOCATION.lat;
    const tLng = isMe ? (friend?.lng ?? 103.8400) : USER_LOCATION.lng;

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
        return `${Math.max(60, Math.round(distM))} m`;
      }
      return `${(distM / 1000).toFixed(1)} km`;
    }

    if (friend?.distance) {
      return friend.distance.replace(/\s*\(.*\)/, '').trim();
    }
    return '850 m';
  }, [lat, lng, isMe, friend]);

  // The avatar displayed on the map pin anchor
  const pinAvatar =
    message.liveLocation?.userAvatar ||
    senderAvatar ||
    (isMe
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
      : friendAvatar);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const accessibleLabel = `定位地图卡片：${locationName}，距好友 ${distanceText}，地址：${address}`;

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
      <div className="flex items-stretch min-h-[106px]">
        {/* Left Column: Location Info & Distance */}
        <div className="flex-1 p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden">
          <div>
            {/* Top Row: Theme Icon Badge + Status/Time + Tag Chip */}
            <div className="flex items-start space-x-2.5">
              {/* Theme Badge (Facebook Blue Style matching Activity Card) */}
              <div
                className="w-12 h-12 rounded-md flex items-center justify-center shrink-0 shadow-2xs border border-[#E4E6EB] dark:border-zinc-700 bg-blue-50/80 dark:bg-blue-950/40 text-[#1877F2] relative group-hover:scale-105 transition-transform"
                title="定位信息"
              >
                {isLive ? (
                  <Radio size={24} className="text-[#1877F2] animate-pulse" />
                ) : (
                  <Compass size={24} className="text-[#1877F2]" />
                )}
                {isLive && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-800" />
                )}
              </div>

              {/* Status & Location Title */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                  <span className="font-extrabold text-[11.5px] truncate tracking-tight text-[#1877F2]">
                    {isLive ? '实时位置共享' : '位置分享'}
                  </span>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-sm bg-[#F0F2F5] dark:bg-zinc-800 text-[#65676B] dark:text-zinc-300 border border-[#E4E6EB] dark:border-zinc-700">
                    {isLive ? '有效 1小时' : 'GPS 准确定位'}
                  </span>
                </div>

                {/* Primary Location Name */}
                <h4
                  className="mt-1 font-extrabold text-[13px] sm:text-[13.5px] leading-snug text-[#050505] dark:text-[#E4E6EB] line-clamp-1 group-hover:text-[#1877F2] transition-colors"
                  title={locationName}
                >
                  {locationName}
                </h4>
              </div>
            </div>

            {/* Address Line with Lucide MapPin */}
            <div className="mt-2 flex items-center space-x-1 text-[#65676B] dark:text-zinc-400 text-[10.5px] sm:text-[11px] truncate">
              <MapPin size={12} className="text-[#1877F2] shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          </div>

          {/* Bottom Row: Sender Avatar Only (不显示好友头像，只显示发送人头像) + Explicit Distance Display */}
          <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-[#E4E6EB] dark:border-zinc-700">
            {/* Sender Avatar Only */}
            <div className="flex items-center min-w-0">
              <img
                src={senderAvatar}
                alt={senderName}
                title={`发送人: ${senderName}`}
                className="w-5 h-5 rounded-full object-cover border-2 border-white dark:border-zinc-800 ring-1 ring-black/5 shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100';
                }}
              />
            </div>

            {/* Prominent Distance Tag */}
            <div className="flex items-center space-x-1 text-[#1877F2] dark:text-[#2D88FF] font-black text-[11px] sm:text-[11.5px] shrink-0 bg-blue-50/90 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/40">
              <Navigation size={10.5} className="shrink-0 fill-[#1877F2] dark:fill-[#2D88FF]" />
              <span>相距 {distanceText}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Map Thumbnail with Map Pin Anchor containing User Avatar */}
        <div className="w-[30%] min-w-[95px] max-w-[115px] bg-[#F0F2F5] dark:bg-zinc-800 border-l border-[#E4E6EB] dark:border-zinc-700 relative overflow-hidden pointer-events-none select-none flex items-center justify-center">
          {tileUrl ? (
            <>
              {/* Map Tile Image */}
              <img
                src={tileUrl}
                alt="Map Preview"
                className="absolute inset-0 w-full h-full object-cover filter saturate-[1.15] contrast-[1.05]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />

              {/* Light grid overlay */}
              <div className="absolute inset-0 bg-[#1877F2]/5" />

              {/* Centered Map Pin Anchor Marker with User Avatar */}
              <div className="relative z-10 flex flex-col items-center drop-shadow-md">
                {/* Pin Head Bubble with User Avatar */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full p-0.5 bg-[#1877F2] shadow-md ring-2 ring-white dark:ring-zinc-900 overflow-hidden flex items-center justify-center">
                    <img
                      src={pinAvatar}
                      alt="User Pin"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';
                      }}
                    />
                  </div>
                  {/* Live status dot on pin */}
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-xs animate-pulse" />
                </div>

                {/* Downward-pointing triangle tip (地图图钉锚点针尖) */}
                <div className="w-0 h-0 border-l-[4.5px] border-l-transparent border-r-[4.5px] border-r-transparent border-t-[6.5px] border-t-[#1877F2] -mt-[0.5px]" />

                {/* Anchor ground contact shadow */}
                <div className="w-3.5 h-1 bg-black/35 dark:bg-black/60 rounded-full blur-[0.5px] mt-0.5" />
              </div>
            </>
          ) : (
            /* Deterministic Fallback */
            <div className="p-2 flex flex-col items-center justify-center text-center space-y-1 text-gray-400">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-700 border border-[#E4E6EB] dark:border-zinc-600 flex items-center justify-center text-[#1877F2]">
                <MapPin size={16} />
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
