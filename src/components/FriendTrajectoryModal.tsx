import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Footprints,
  Clock,
  Navigation,
  Compass,
  Sparkles,
  ArrowLeft,
  Calendar,
  Zap,
  Activity,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Friend, TrajectoryPoint } from '../types';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';

export interface FriendTrajectoryModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  // Callback when time scrub changes, to sync map position
  onTimeChange?: (timeHour: number, point: TrajectoryPoint) => void;
}

// Generate realistic 24-hour activity points for a given friend based on their initial location
export const generateFriend24hTrajectory = (friend: Friend): TrajectoryPoint[] => {
  const baseLat = friend.lat || 36.0610;
  const baseLng = friend.lng || 103.8320;
  const friendName = friend.name || '好友';

  return [
    {
      id: `${friend.id}-tp-0`,
      lat: baseLat + 0.0035,
      lng: baseLng - 0.0028,
      timeHour: 0,
      timeLabel: '00:00',
      locationName: `${friendName} 的常驻居所 🏠`,
      speedKmh: 0,
      transportMode: 'stationary',
      isStayPoint: true,
      stayDurationMinutes: 450,
      note: '夜间休息中 · 守护连接正常',
    },
    {
      id: `${friend.id}-tp-1`,
      lat: baseLat + 0.0030,
      lng: baseLng - 0.0015,
      timeHour: 7.5,
      timeLabel: '07:30',
      locationName: '街角晨光咖啡坊 ☕',
      speedKmh: 4,
      transportMode: 'walking',
      isStayPoint: true,
      stayDurationMinutes: 25,
      note: '购买热拿铁与牛角面包',
    },
    {
      id: `${friend.id}-tp-2`,
      lat: baseLat + 0.0010,
      lng: baseLng + 0.0020,
      timeHour: 9.0,
      timeLabel: '09:00',
      locationName: '城市科学创新园区 🏢',
      speedKmh: 24,
      transportMode: 'car',
      isStayPoint: true,
      stayDurationMinutes: 180,
      note: '上午工作协同与项目讨论',
    },
    {
      id: `${friend.id}-tp-3`,
      lat: baseLat - 0.0020,
      lng: baseLng + 0.0040,
      timeHour: 12.5,
      timeLabel: '12:30',
      locationName: '风味美食街 · 聚餐食肆 🍜',
      speedKmh: 5,
      transportMode: 'walking',
      isStayPoint: true,
      stayDurationMinutes: 60,
      note: '与同伴享用午餐，能量满分',
    },
    {
      id: `${friend.id}-tp-4`,
      lat: baseLat - 0.0010,
      lng: baseLng + 0.0015,
      timeHour: 15.0,
      timeLabel: '15:00',
      locationName: '滨河绿地文化走廊 🌿',
      speedKmh: 14,
      transportMode: 'bicycle',
      isStayPoint: true,
      stayDurationMinutes: 45,
      note: '骑行兜风 · 沿途拍摄风景',
    },
    {
      id: `${friend.id}-tp-5`,
      lat: baseLat + 0.0005,
      lng: baseLng - 0.0010,
      timeHour: 18.5,
      timeLabel: '18:30',
      locationName: '东方红广场 社交活力区 🌟',
      speedKmh: 18,
      transportMode: 'car',
      isStayPoint: true,
      stayDurationMinutes: 90,
      note: '与好友相聚，享受傍晚惬意时光',
    },
    {
      id: `${friend.id}-tp-6`,
      lat: baseLat,
      lng: baseLng,
      timeHour: 24.0,
      timeLabel: '24:00 (实时)',
      locationName: friend.locationName || '当前所在位置 📍',
      speedKmh: friend.speed ? parseInt(friend.speed, 10) || 0 : 0,
      transportMode: 'stationary',
      isStayPoint: true,
      stayDurationMinutes: 30,
      note: friend.status || '电量充足，随时准备出发',
    },
  ];
};

export const FriendTrajectoryModal: React.FC<FriendTrajectoryModalProps> = ({
  friend,
  isOpen,
  onClose,
  onTimeChange,
}) => {
  const [selectedTimeHour, setSelectedTimeHour] = useState<number>(24.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate friend trajectory points
  const points = useMemo(() => {
    if (!friend) return [];
    return generateFriend24hTrajectory(friend);
  }, [friend]);

  // Interpolated current point along trajectory according to selectedTimeHour
  const currentInterpolatedPoint = useMemo(() => {
    if (points.length === 0) return null;
    if (selectedTimeHour <= points[0].timeHour) return points[0];
    if (selectedTimeHour >= points[points.length - 1].timeHour) return points[points.length - 1];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (selectedTimeHour >= p1.timeHour && selectedTimeHour <= p2.timeHour) {
        const span = p2.timeHour - p1.timeHour;
        const ratio = span > 0 ? (selectedTimeHour - p1.timeHour) / span : 0;
        return {
          id: `interp-${selectedTimeHour}`,
          lat: p1.lat + (p2.lat - p1.lat) * ratio,
          lng: p1.lng + (p2.lng - p1.lng) * ratio,
          timeHour: selectedTimeHour,
          timeLabel: `${Math.floor(selectedTimeHour).toString().padStart(2, '0')}:${Math.floor((selectedTimeHour % 1) * 60).toString().padStart(2, '0')}`,
          locationName: ratio > 0.5 ? p2.locationName : p1.locationName,
          speedKmh: Math.round(p1.speedKmh + (p2.speedKmh - p1.speedKmh) * ratio),
          transportMode: ratio > 0.5 ? p2.transportMode : p1.transportMode,
          note: p2.note || p1.note,
        } as TrajectoryPoint;
      }
    }
    return points[points.length - 1];
  }, [points, selectedTimeHour]);

  // Keep a stable ref to onTimeChange callback to avoid re-triggering effect on parent re-renders
  const onTimeChangeRef = useRef(onTimeChange);
  useEffect(() => {
    onTimeChangeRef.current = onTimeChange;
  }, [onTimeChange]);

  const lastNotifiedHourRef = useRef<number | null>(null);

  // Sync with external map when scrubbed
  useEffect(() => {
    if (currentInterpolatedPoint) {
      if (lastNotifiedHourRef.current !== selectedTimeHour) {
        lastNotifiedHourRef.current = selectedTimeHour;
        onTimeChangeRef.current?.(selectedTimeHour, currentInterpolatedPoint);
      }
    }
  }, [selectedTimeHour, currentInterpolatedPoint]);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setSelectedTimeHour((prev) => {
          if (prev >= 24) {
            return 0;
          }
          return Math.min(24, Math.round((prev + 0.2 * playbackSpeed) * 10) / 10);
        });
      }, 120);
    } else if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);

  const handleTogglePlay = () => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    setIsPlaying(false);
    setSelectedTimeHour(0);
  };

  const formatHourString = (hourVal: number) => {
    const h = Math.floor(hourVal);
    const m = Math.floor((hourVal % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !friend) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] pointer-events-none flex flex-col justify-between">
        {/* Top Header Floating Straight-Edge Bar (Status & Return to Map Button) */}
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="pt-3 px-3 pointer-events-auto flex items-center justify-between w-full max-w-md mx-auto"
        >
          {/* Back / Exit Button */}
          <button
            type="button"
            onClick={() => {
              haptics.trigger('light');
              soundEffects.playTapSound();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-md border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs text-[#050505] dark:text-white font-bold text-xs hover:border-[#1877F2] active:scale-95 transition-all cursor-pointer"
            title="退出轨迹回放并返回主页地图"
          >
            <ArrowLeft size={15} className="text-[#1877F2]" />
            <span>返回主页地图</span>
          </button>

          {/* Title & Info Pill */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-md border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs">
            <div className="w-5 h-5 rounded-full overflow-hidden ring-1.5 ring-[#1877F2] shrink-0">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <span className="font-extrabold text-[#050505] dark:text-white truncate max-w-[100px]">
                {friend.name}
              </span>
              <span className="text-[10px] font-bold text-[#1877F2] bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                24H 互动轨迹
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Interactive Timeline Console & Slider Sheet */}
        <motion.div
          initial={{ y: 220, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 220, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="pointer-events-auto w-full max-w-md mx-auto px-3 pb-[calc(14px+var(--sab,0px))]"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-md p-3 border border-[#E4E6EB] dark:border-zinc-800 shadow-xs flex flex-col space-y-2.5">
            {/* Simplified UI: Directly show time, location and slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#050505] dark:text-white">
                <span className="font-mono text-sm text-[#1877F2] font-black">{formatHourString(selectedTimeHour)}</span>
                <span className="truncate max-w-[200px]">{currentInterpolatedPoint?.locationName || '轨迹位置获取中'}</span>
              </div>

              <input
                type="range"
                min={0}
                max={24}
                step={0.1}
                value={selectedTimeHour}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSelectedTimeHour(val);
                  haptics.trigger('selection');
                }}
                className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#1877F2]"
              />

              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {points.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      haptics.trigger('light');
                      soundEffects.playTapSound();
                      setSelectedTimeHour(p.timeHour);
                    }}
                    className={`flex items-center space-x-1 px-2 py-1 rounded border text-[10px] font-bold transition-all shrink-0 ${
                      Math.abs(selectedTimeHour - p.timeHour) <= 0.6
                        ? 'bg-[#1877F2] text-white border-[#1877F2]'
                        : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-[#E4E6EB] dark:border-zinc-700'
                    }`}
                  >
                    <span>📍</span>
                    <span>{p.locationName.split(' ')[0]?.slice(0, 4)}</span>
                  </button>
                ))}
              </div>

              {/* 3. Replay Controls & Exit Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E4E6EB]/80 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="p-2 bg-[#1877F2] text-white rounded-md active:scale-95 transition-all"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-2 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded-md active:scale-95 transition-all"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    haptics.trigger('light');
                    soundEffects.playTapSound();
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:text-[#1877F2] transition-colors"
                >
                  退出回放
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
