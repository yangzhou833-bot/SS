import React, { useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Footprints,
  Car,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  Flame,
  Activity,
  Navigation,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Friend, TrajectoryPoint } from '../types';
import { InterpolatedTrajectoryState, formatTimeHour } from '../utils/trajectoryData';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

export interface FriendTrajectoryTimelineBarProps {
  friend: Friend;
  points: TrajectoryPoint[];
  currentHour: number;
  onHourChange: (hour: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  interpolatedState: InterpolatedTrajectoryState;
  onExit: () => void;
}

export const FriendTrajectoryTimelineBar: React.FC<FriendTrajectoryTimelineBarProps> = ({
  friend,
  points,
  currentHour,
  onHourChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  interpolatedState,
  onExit,
}) => {
  // Auto-playback loop timer
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        onHourChange(Math.min(24, Math.round((currentHour + 0.1 * playbackSpeed) * 10) / 10));
      }, 90);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, currentHour, playbackSpeed, onHourChange]);

  // Pause when reaching 24.0
  useEffect(() => {
    if (currentHour >= 24 && isPlaying) {
      onTogglePlay();
    }
  }, [currentHour, isPlaying, onTogglePlay]);

  const sliderPercent = Math.max(0, Math.min(100, (currentHour / 24) * 100));

  const getTransportIcon = () => {
    switch (interpolatedState.transportMode) {
      case 'car':
        return <Car size={13} className="text-[#1877F2] shrink-0" />;
      case 'walking':
        return <Footprints size={13} className="text-emerald-600 shrink-0" />;
      case 'bicycle':
        return <Activity size={13} className="text-purple-600 shrink-0" />;
      default:
        return <MapPin size={13} className="text-amber-500 shrink-0" />;
    }
  };

  return (
    <AnimatePresence>
      {/* 1. Top Exit & Header Banner (Facebook Straight-Edge Frame Style) */}
      <motion.div
        key="friend-trajectory-top-banner"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="absolute top-3 left-3 right-3 z-45 pointer-events-auto flex items-center justify-between gap-2 max-w-xl mx-auto"
      >
        {/* Friend Identity Pill */}
        <div className="bg-white border border-[#E4E6EB] rounded-md px-3 py-1.5 shadow-xs flex items-center space-x-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#1877F2] shrink-0">
            <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black text-[#050505] truncate">{friend.name}</span>
              <span className="text-[9.5px] font-bold text-[#1877F2] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60 shrink-0">
                24小时活动轨迹
              </span>
            </div>
            <span className="text-[9.5px] text-[#65676B] truncate">
              {friend.relationshipLabel || '好友'} · 电池 {friend.battery}%
            </span>
          </div>
        </div>

        {/* Exit & Return to Map Button */}
        <button
          type="button"
          id="exit-friend-trajectory-btn"
          onClick={() => {
            soundEffects.playTapSound();
            haptics.trigger('light');
            onExit();
          }}
          className="bg-white hover:bg-gray-50 active:scale-95 text-[#050505] hover:text-rose-600 border border-[#E4E6EB] hover:border-rose-300 rounded-md px-3 py-2 shadow-xs flex items-center space-x-1.5 text-xs font-bold transition-all cursor-pointer select-none shrink-0"
          title="退出轨迹回放并返回主页地图"
          aria-label="退出轨迹回放"
        >
          <X size={14} strokeWidth={2.4} className="text-rose-500" />
          <span>退出轨迹</span>
          <span className="text-[10px] text-gray-400 font-normal">| 返回主页</span>
        </button>
      </motion.div>

      {/* 2. Bottom Timeline Controller Card (Facebook Straight-Edge Line Frame Style) */}
      <motion.div
        key="friend-trajectory-bottom-console"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="absolute bottom-3 left-3 right-3 z-45 pointer-events-auto max-w-xl mx-auto bg-white border border-[#E4E6EB] rounded-md shadow-md p-3 select-none flex flex-col space-y-2 text-[#050505]"
      >
        {/* Top Info Bar: Current Time, Movement Mode, Speed & Location */}
        <div className="flex items-center justify-between gap-2 border-b border-[#E4E6EB] pb-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {/* Time Pill Badge */}
            <div className="bg-[#1877F2] text-white font-mono font-black text-xs px-2.5 py-1 rounded shadow-2xs flex items-center space-x-1 shrink-0">
              <Clock size={12} strokeWidth={2.4} />
              <span>{interpolatedState.timeLabel}</span>
            </div>

            {/* Location & Speed Status */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#050505] truncate">
                {getTransportIcon()}
                <span className="truncate">{interpolatedState.locationName}</span>
              </div>
              <div className="flex items-center space-x-2 text-[9.5px] text-[#65676B] mt-0.5">
                <span className="font-semibold text-[#1877F2]">
                  {interpolatedState.speedKmh > 0 ? `${interpolatedState.speedKmh} km/h` : '停留中'}
                </span>
                <span>·</span>
                <span className="truncate">{interpolatedState.note || '轨迹打卡记录'}</span>
              </div>
            </div>
          </div>

          {/* Quick Exit Icon */}
          <button
            type="button"
            onClick={onExit}
            className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 border border-[#E4E6EB] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="关闭轨迹返回地图"
          >
            <X size={14} />
          </button>
        </div>

        {/* Timeline Slider with Draggable Left-Right Thumb */}
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#65676B] px-0.5">
            <span>00:00 (起点)</span>
            <span className="text-[#1877F2] font-black">{interpolatedState.progressPercent}% 进度</span>
            <span>24:00 (实时)</span>
          </div>

          <div className="relative flex items-center h-5 px-0.5">
            <input
              type="range"
              min={0}
              max={24}
              step={0.1}
              value={currentHour}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onHourChange(val);
                haptics.trigger('light');
              }}
              style={{
                background: `linear-gradient(to right, #1877F2 0%, #1877F2 ${sliderPercent}%, #E4E6EB ${sliderPercent}%, #E4E6EB 100%)`,
              }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none 
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:w-5 
                [&::-webkit-slider-thumb]:h-5 
                [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-white 
                [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.3)] 
                [&::-webkit-slider-thumb]:border-2 
                [&::-webkit-slider-thumb]:border-[#1877F2] 
                [&::-webkit-slider-thumb]:active:scale-125 
                [&::-webkit-slider-thumb]:transition-transform"
              title="左右滑动调整时间轴"
            />
          </div>

          {/* Quick Stay Points / Landmarks Horizontal Scroller */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none text-[9.5px]">
            <span className="font-bold text-[#65676B] shrink-0 text-[10px]">打卡点:</span>
            {points.map((pt) => {
              const isSelected = Math.abs(currentHour - pt.timeHour) < 0.6;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => {
                    soundEffects.playTapSound();
                    haptics.trigger('light');
                    onHourChange(pt.timeHour);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all border shrink-0 flex items-center space-x-1 ${
                    isSelected
                      ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs scale-102'
                      : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] border-[#E4E6EB]'
                  }`}
                >
                  <span>{pt.timeLabel.split(' ')[0]}</span>
                  <span className="opacity-80">
                    {pt.locationName.split(' ')[0]?.slice(0, 4) || '地点'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Playback & Speed Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-[#E4E6EB]/80">
          {/* Play / Pause & Reset */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              id="timeline-play-pause-btn"
              onClick={() => {
                soundEffects.playTapSound();
                haptics.trigger('medium');
                if (currentHour >= 24) onHourChange(0);
                onTogglePlay();
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-xs ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause size={13} strokeWidth={2.4} />
                  <span>暂停</span>
                </>
              ) : (
                <>
                  <Play size={13} strokeWidth={2.4} fill="currentColor" />
                  <span>{currentHour >= 24 ? '重头回放' : '开始回放'}</span>
                </>
              )}
            </button>

            {/* Jump to 00:00 */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playTapSound();
                onHourChange(0);
              }}
              className="p-1.5 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1877F2] border border-[#E4E6EB] transition-all active:scale-92 cursor-pointer flex items-center justify-center shrink-0"
              title="重置到 00:00"
              aria-label="重置到0点"
            >
              <RotateCcw size={13} strokeWidth={2.2} />
            </button>

            {/* Jump to Now (24:00) */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playTapSound();
                onHourChange(24);
              }}
              className="px-2 py-1 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] border border-[#E4E6EB] text-[10.5px] font-bold cursor-pointer"
              title="跳转至实时当前位置"
            >
              实时位置
            </button>
          </div>

          {/* Speed Selector (1x, 2x, 5x) */}
          <div className="flex items-center space-x-1 bg-[#F0F2F5] border border-[#E4E6EB] p-0.5 rounded-md shrink-0">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => {
                  soundEffects.playTapSound();
                  onChangeSpeed(spd);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                    : 'text-[#65676B] hover:text-[#050505]'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
