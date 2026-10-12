import React, { useState } from 'react';
import { Radio, Users, CheckCircle, Wifi, MapPin, X, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BeaconPoint } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

interface BeaconDetailCardProps {
  beacon: BeaconPoint;
  onClose: () => void;
  onCheckIn?: (beaconId: string) => void;
  showToast?: (msg: string) => void;
}

export const BeaconDetailCard: React.FC<BeaconDetailCardProps> = ({
  beacon,
  onClose,
  onCheckIn,
  showToast,
}) => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [checkedInCount, setCheckedInCount] = useState(beacon.checkedInCount);

  const percentage = Math.min(100, Math.round((checkedInCount / beacon.capacity) * 100));

  const handleCheckInClick = () => {
    if (hasCheckedIn) {
      if (showToast) showToast('您已在此教室打卡完成！');
      return;
    }

    haptics.trigger('medium');
    soundEffects.playTapSound();
    setHasCheckedIn(true);
    setCheckedInCount((prev) => prev + 1);

    if (onCheckIn) {
      onCheckIn(beacon.id);
    }

    if (showToast) {
      showToast(`🎉 成功在【${beacon.classroomName}】完成信标打卡！`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[100] pointer-events-auto"
      >
        <div className="bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-800 rounded-md shadow-xl overflow-hidden text-[#050505] dark:text-[#E4E6EB] p-4 relative">
          {/* Close Button */}
          <button
            onClick={() => {
              haptics.trigger('light');
              onClose();
            }}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#F0F2F5] dark:bg-zinc-800 hover:bg-[#E4E6EB] dark:hover:bg-zinc-700 flex items-center justify-center text-[#65676B] dark:text-zinc-400 transition-colors cursor-pointer z-10"
            title="关闭"
          >
            <X size={15} />
          </button>

          {/* Header Row */}
          <div className="flex items-start space-x-3 pr-8">
            {/* Beacon Breathing Icon Badge */}
            <div className="relative shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-md bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Radio size={20} className="animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  {beacon.code}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-zinc-400 flex items-center space-x-1">
                  <Wifi size={11} className="text-emerald-500" />
                  <span>{beacon.signalStrength}</span>
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-[#050505] dark:text-[#E4E6EB] mt-1 line-clamp-1">
                {beacon.classroomName}
              </h3>
            </div>
          </div>

          {/* Check-in Progress & Stats */}
          <div className="mt-3.5 bg-[#F7F8FA] dark:bg-zinc-800/60 rounded-md p-3 border border-[#E4E6EB] dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-extrabold flex items-center space-x-1 text-[#050505] dark:text-[#E4E6EB]">
                <Users size={14} className="text-[#1877F2]" />
                <span>实时在班打卡人数</span>
              </span>
              <span className="font-black text-[#1877F2]">
                {checkedInCount} <span className="text-gray-400 font-normal">/ {beacon.capacity} 人</span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#1877F2] to-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-zinc-400 mt-1.5">
              <span>教室容纳率: {percentage}%</span>
              {beacon.lastCheckInUser && (
                <span className="flex items-center space-x-1">
                  <Clock size={10} />
                  <span>最新打卡: {beacon.lastCheckInUser}</span>
                </span>
              )}
            </div>
          </div>

          {/* Recent Check-in Avatars */}
          {beacon.checkInUsers && beacon.checkInUsers.length > 0 && (
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1.5">
                  {beacon.checkInUsers.slice(0, 4).map((u) => (
                    <img
                      key={u.id}
                      src={u.avatar}
                      alt={u.name}
                      className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 object-cover shadow-2xs"
                      title={`${u.name} (${u.time})`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                  已有 {beacon.checkInUsers.length} 位同学完成打卡
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-4">
            <button
              onClick={handleCheckInClick}
              disabled={hasCheckedIn}
              className={`w-full py-2.5 px-4 rounded-md font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-98 ${
                hasCheckedIn
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
                  : 'bg-[#1877F2] hover:bg-blue-600 text-white border border-[#1877F2]'
              }`}
            >
              {hasCheckedIn ? (
                <>
                  <CheckCircle size={16} />
                  <span>已完成信标打卡</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>一键完成课堂信标打卡</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
