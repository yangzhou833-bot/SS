import React, { useEffect } from 'react';
import { LifePlace } from '../types';
import { getRelativeCreationTime } from '../data/lifeLayerStore';
import { Sparkles, ChevronRight, MapPin, Clock, User } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';

interface FloatingPlaceNameplateProps {
  place: LifePlace;
  position?: { x: number; y: number }; // Screen coordinate position if computed
  onOpenCard: (place: LifePlace) => void;
  onClose?: () => void;
  autoDismissMs?: number;
}

export const FloatingPlaceNameplate: React.FC<FloatingPlaceNameplateProps> = ({
  place,
  position,
  onOpenCard,
  onClose,
  autoDismissMs = 4500,
}) => {
  useEffect(() => {
    if (!autoDismissMs) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [place.id, autoDismissMs, onClose]);

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.trigger('light');
    soundEffects.playTapSound();
    onOpenCard(place);
  };

  const formattedDate = place.createdAt.split('T')[0];
  const relativeTime = getRelativeCreationTime(place.createdAt);
  const hasSharedEncounters = place.encounters.totalEncounters > 0;

  // Render floating speech-bubble style nameplate
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleTap}
      onKeyDown={(e) => e.key === 'Enter' && handleTap(e as any)}
      className="absolute z-[100] -translate-x-1/2 -translate-y-full pointer-events-auto cursor-pointer select-none group focus:outline-none"
      style={{
        left: position ? `${position.x}px` : '50%',
        top: position ? `${position.y - 14}px` : '42%',
      }}
    >
      {/* Container with bubble tail */}
      <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-150 ease-out">
        {/* Main Card */}
        <div className="bg-white border border-[#E4E6EB] hover:border-[#1877F2] rounded-xl shadow-lg shadow-black/10 px-3.5 py-2.5 min-w-[210px] max-w-[280px] transition-all duration-200 group-hover:scale-[1.02] group-active:scale-[0.98]">
          {/* Top row: Category emoji + Place Name + Co-presence Spark */}
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 shadow-2xs"
                style={{ backgroundColor: `${place.color}20`, border: `1px solid ${place.color}40` }}
              >
                {place.icon}
              </span>
              <h4 className="text-xs font-bold text-[#1C1E21] truncate font-sans group-hover:text-[#1877F2] transition-colors">
                {place.name}
              </h4>
            </div>

            {hasSharedEncounters && (
              <span
                className="flex items-center gap-0.5 text-[9.5px] font-bold text-amber-700 bg-amber-50 border border-amber-300/80 px-1.5 py-0.5 rounded-full shrink-0 animate-pulse"
                title={`与 ${place.encounters.friendCount} 位好友共存记忆`}
              >
                <Sparkles size={10} className="text-amber-500 fill-amber-400" />
                <span>共同回忆</span>
              </span>
            )}
          </div>

          {/* Middle row: Creator info with avatar badge */}
          <div className="flex items-center justify-between text-[10.5px] text-[#65676B] mb-1">
            <div className="flex items-center gap-1 min-w-0">
              <img
                src={place.createdBy.avatar}
                alt={place.createdBy.name}
                className="w-4 h-4 rounded-full object-cover border border-[#E4E6EB] shrink-0"
              />
              <span className="truncate font-medium">
                {place.createdBy.isMe ? '由我创建' : `由 ${place.createdBy.name} 创建`}
              </span>
            </div>

            <span className="text-[10px] font-mono text-[#8A8D91] shrink-0">
              {place.distanceKm !== undefined ? `${place.distanceKm}km · ${place.direction}` : ''}
            </span>
          </div>

          {/* Bottom row: Creation date + relative time & action hint */}
          <div className="flex items-center justify-between pt-1 border-t border-[#F0F2F5] text-[9.5px] text-[#8A8D91]">
            <span className="flex items-center gap-1">
              <Clock size={10} className="text-[#8A8D91]" />
              <span>{formattedDate} ({relativeTime})</span>
            </span>

            <span className="text-[#1877F2] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              <span>地点记忆</span>
              <ChevronRight size={10} />
            </span>
          </div>
        </div>

        {/* Speech-Bubble Downward Tail */}
        <div className="w-0 h-0 border-x-[7px] border-x-transparent border-t-[8px] border-t-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.06)] -mt-[1px]" />
      </div>
    </div>
  );
};
