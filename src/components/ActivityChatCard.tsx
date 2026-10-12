import React, { useMemo } from 'react';
import { MapPin, Users } from 'lucide-react';
import { SimulatedMapActivity, Friend, ActivityParticipantStatus } from '../types';
import { validCoordinates } from '../utils/creationValidation';
import { getActivityStatusInfo } from '../utils/countdownHelper';

interface ActivityChatCardProps {
  activityId?: string;
  activityData?: SimulatedMapActivity;
  liveActivity?: SimulatedMapActivity;
  messageRecipientFriendId?: string;
  friends?: Friend[];
  currentUserId?: string;
  onClick?: () => void;
  isMe?: boolean;
}

/**
 * Converts lat/lng coordinates to a CartoCDN / OSM tile coordinate at a specific zoom level
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

/**
 * Format activity date/time into sentence case Stellar blue label
 * e.g. "今天, 17:00" or "9月5日, 15:00"
 */
function formatActivityTimeLabel(dateStr?: string, timeStr?: string): string {
  if (!timeStr && !dateStr) return '今天, 15:00';
  
  const cleanTime = timeStr || '15:00';
  if (dateStr) {
    if (dateStr.includes('今天') || dateStr.toLowerCase().includes('today')) {
      return `今天, ${cleanTime}`;
    }
    return `${dateStr}, ${cleanTime}`;
  }
  return `今天, ${cleanTime}`;
}

export const ActivityChatCard: React.FC<ActivityChatCardProps> = ({
  activityData,
  liveActivity,
  messageRecipientFriendId,
  friends = [],
  onClick,
}) => {
  // Use live activity data if available, or fall back to immutable snapshot from message
  const act = liveActivity || activityData;

  // Determine if activity coordinates exist and are valid
  const hasValidCoordinates = !!act && validCoordinates(act);

  const tileUrl = useMemo(() => {
    if (!hasValidCoordinates || !act) return '';
    return getTileUrl(act.lat, act.lng, 14);
  }, [hasValidCoordinates, act]);

  // Derive theme icon and background
  const themeIcon = act?.icon || '🎯';
  const themeColor = act?.color || '#1877F2';
  const timeLabel = formatActivityTimeLabel(act?.date, act?.startTime || act?.timeRange?.split('-')[0]?.trim());
  const title = act?.title || '同城集结探索活动';
  const locationLabel = act?.locationName || act?.address || '集结地点';
  const distanceLabel = '';

  // Filter mutually visible participants based on privacy/visibility rules
  const visibleParticipants = useMemo(() => {
    if (!act || !act.participants || !Array.isArray(act.participants)) return [];

    return act.participants.filter((p: ActivityParticipantStatus) => {
      // 1. Exclude unauthorized location / hidden participants
      // The invitation card shows membership, never member coordinates.

      // 2. Exclude ghost / stealth mode participants
      if (p.status === 'departed' && p.statusText?.includes('隐身')) return false;

      // 3. Find if participant is known in friends list and verify not blocked/hidden
      const friendRecord = friends.find((f) => f.id === p.id);
      if (friendRecord) {
        if ((friendRecord as any).isBlocked || (friendRecord as any).isGhostMode) {
          return false;
        }
      }

      return true;
    });
  }, [act, friends]);

  const actualParticipants = visibleParticipants.filter(member => member.invitationStatus !== 'invited');
  const maxAvatars = 4;
  const displayedParticipants = actualParticipants.slice(0, maxAvatars);
  const overflowCount = Math.max(0, actualParticipants.length - maxAvatars);

  // Exact text specified by user: "两好友参与"
  const participantText = actualParticipants.length === 2 ? '两好友参与' : `${actualParticipants.length}位好友参与`;

  const statusInfo = useMemo(() => {
    return getActivityStatusInfo(act || {});
  }, [act]);

  const accessibleLabel = `查看活动：${title}，时间：${timeLabel}，地点：${locationLabel}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

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
      className="group relative w-full max-w-[340px] bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-2xs hover:border-[#1877F2] hover:shadow-xs transition-all cursor-pointer overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] text-left active:scale-[0.99]"
    >
      {/* Horizontal Two-Column Composition: 70% Info / 30% Map Thumbnail (Consistent with Location & Contact Card) */}
      <div className="flex items-stretch min-h-[102px]">
        {/* Left Column: Activity Info */}
        <div className="flex-1 p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden">
          <div>
            {/* Top Row: Theme Emoji Badge + Date/Time + Category */}
            <div className="flex items-start space-x-2.5">
              {/* Theme Emoji Badge (w-10 h-10 strictly matching LocationCard and ContactCard) */}
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center text-[22px] leading-none shrink-0 shadow-2xs border border-[#E4E6EB] dark:border-zinc-700 bg-[#F7F8FA] dark:bg-zinc-800"
                style={{ backgroundColor: `${themeColor}15` }}
                title={`活动类别: ${act?.category || '探索'}`}
              >
                <span className="leading-none select-none">{themeIcon}</span>
              </div>

              {/* Date/Time + Title Area */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                  <span className={`font-extrabold text-[11.5px] truncate tracking-tight ${statusInfo.isExpired ? 'text-[#65676B]' : 'text-[#1877F2]'}`}>
                    {timeLabel}
                  </span>
                  {statusInfo.isExpired ? (
                    <span className="text-[9.5px] font-black px-1.5 py-0.2 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                      {statusInfo.statusLabel}
                    </span>
                  ) : act?.category ? (
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-sm bg-[#F0F2F5] dark:bg-zinc-800 text-[#65676B] dark:text-zinc-300 border border-[#E4E6EB] dark:border-zinc-700">
                      {act.category}
                    </span>
                  ) : null}
                </div>

                {/* Primary Activity Title */}
                <h4
                  className="mt-0.5 font-extrabold text-[13px] sm:text-[13.5px] leading-snug text-[#050505] dark:text-[#E4E6EB] line-clamp-1 group-hover:text-[#1877F2] transition-colors"
                  title={title}
                >
                  {title}
                </h4>
              </div>
            </div>

            {/* Location / Distance Line with Lucide MapPin */}
            <div className="mt-2 flex items-center space-x-1 text-[#65676B] dark:text-zinc-400 text-[10.5px] sm:text-[11px] truncate">
              <MapPin size={12} className="text-[#1877F2] shrink-0" />
              <span className="truncate">
                {distanceLabel}
                {locationLabel}
              </span>
            </div>
          </div>

          {/* Bottom Row: Mutually Visible Participant Avatars + "两好友参与" */}
          <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-[#E4E6EB] dark:border-zinc-700">
            <div className="flex items-center space-x-1.5 min-w-0">
              <div className="flex items-center -space-x-1.5 overflow-hidden shrink-0">
                {displayedParticipants.map((p) => (
                  <img
                    key={p.id}
                    src={
                      p.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
                    }
                    alt={p.name}
                    title={`${p.name} (${p.statusText || '参与中'})`}
                    className="w-5 h-5 rounded-full object-cover border-2 border-white dark:border-zinc-800 ring-1 ring-black/5 shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100';
                    }}
                  />
                ))}

                {/* Overflow +N Indicator */}
                {overflowCount > 0 && (
                  <div
                    className="w-5 h-5 rounded-full bg-[#F0F2F5] dark:bg-zinc-800 text-[#65676B] dark:text-zinc-300 text-[9.5px] font-extrabold flex items-center justify-center border-2 border-white dark:border-zinc-800 shrink-0"
                    title={`还有 ${overflowCount} 位共同好友参与`}
                  >
                    +{overflowCount}
                  </div>
                )}
              </div>

              <span className="ml-1 text-[10px] text-[#65676B] dark:text-zinc-400 font-bold truncate">
                {participantText}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Non-interactive Static Map Thumbnail (Exact 30% min-w-[95px] max-w-[115px]) */}
        <div className="w-[30%] min-w-[95px] max-w-[115px] bg-[#F0F2F5] dark:bg-zinc-800 border-l border-[#E4E6EB] dark:border-zinc-700 relative overflow-hidden pointer-events-none select-none flex items-center justify-center">
          {hasValidCoordinates && tileUrl ? (
            <>
              {/* Static Map Tile Background */}
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

              {/* Centered Single Activity Marker Pin with Theme Emoji Icon */}
              <div className="relative z-10 flex flex-col items-center drop-shadow-md">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full p-0.5 bg-[#1877F2] shadow-md ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-[15px] leading-none select-none">
                      {themeIcon}
                    </div>
                  </div>
                  {/* Status indicator dot */}
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900 shadow-xs ${
                      statusInfo.isExpired ? 'bg-zinc-400' : 'bg-emerald-500 animate-pulse'
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
            /* Deterministic Local Fallback */
            <div className="p-2 flex flex-col items-center justify-center text-center space-y-1 text-gray-400">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-700 border border-[#E4E6EB] dark:border-zinc-600 flex items-center justify-center text-[16px] leading-none">
                <span>{themeIcon}</span>
              </div>
              <span className="text-[9px] font-bold text-[#1877F2] leading-tight line-clamp-1">
                {locationLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
