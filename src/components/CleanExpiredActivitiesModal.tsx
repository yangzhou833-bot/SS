import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Archive, CheckCircle2, Clock, MapPin, X, AlertTriangle } from 'lucide-react';
import { SimulatedMapActivity } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

interface CleanExpiredActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  expiredActivities: SimulatedMapActivity[];
  onConfirmClean: (activityIds: string[]) => void;
}

export const CleanExpiredActivitiesModal: React.FC<CleanExpiredActivitiesModalProps> = ({
  isOpen,
  onClose,
  expiredActivities,
  onConfirmClean,
}) => {
  if (!isOpen) return null;

  const count = expiredActivities.length;

  const handleClean = () => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    onConfirmClean(expiredActivities.map((a) => a.id));
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        />

        {/* Modal Container - Facebook Straight-Edge Line Frame UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-md bg-white border border-[#E4E6EB] rounded-md shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Top Header */}
          <div className="p-4 border-b border-[#E4E6EB] bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-md bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <Archive size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-[15px] text-[#050505] leading-tight">
                  一键清理已结束活动
                </h3>
                <p className="text-[11px] text-[#65676B] font-medium mt-0.5">
                  智能识别已过预定时间的旧活动
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {/* Info Notice Banner */}
            <div className="p-3 bg-[#F7F8FA] border border-[#E4E6EB] rounded-md flex items-start space-x-2.5">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-[#050505] leading-relaxed">
                共检测到 <strong className="text-[#1877F2] font-black">{count}</strong> 项活动开始时间已过。执行一键清理后，旧活动将自动转为<strong className="text-[#050505]">「已归档」</strong>状态并从活跃地图中收拢，保持地图视野整洁。
              </div>
            </div>

            {/* List of Expired Activities */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#65676B] uppercase tracking-wider">
                待归档清理的活动 ({count})
              </div>

              {expiredActivities.length > 0 ? (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {expiredActivities.map((act, actIdx) => (
                    <div
                      key={`clean-act-${act.id}-${actIdx}`}
                      className="p-2.5 bg-white border border-[#E4E6EB] rounded-md flex items-center justify-between hover:border-[#1877F2]/40 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-xl shrink-0">{act.icon || '☕️'}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#050505] truncate">
                            {act.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-[10px] text-[#65676B] mt-0.5">
                            <span className="flex items-center space-x-1">
                              <Clock size={10} />
                              <span>{act.date || '历史活动'} {act.startTime}</span>
                            </span>
                            <span className="flex items-center space-x-1 truncate">
                              <MapPin size={10} />
                              <span className="truncate">{act.locationName}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-zinc-100 text-zinc-600 border border-zinc-300 shrink-0 ml-2">
                        已结束
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#65676B] bg-[#F7F8FA] rounded-md border border-[#E4E6EB]">
                  当前暂无过期的活动记录，所有活动均在有效期内。
                </div>
              )}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-3 bg-[#F7F8FA] border-t border-[#E4E6EB] flex items-center justify-end space-x-2 shrink-0">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-white hover:bg-[#F0F2F5] active:scale-98 text-[#050505] font-bold rounded-md text-xs border border-[#E4E6EB] transition-all cursor-pointer"
            >
              稍后提醒
            </button>
            <button
              disabled={count === 0}
              onClick={handleClean}
              className={`px-4 py-2 font-extrabold rounded-md text-xs flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer ${
                count > 0
                  ? 'bg-[#1877F2] hover:bg-[#166FE5] active:scale-98 text-white border border-[#1877F2]'
                  : 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
            >
              <Trash2 size={13} />
              <span>一键清理并归档 ({count})</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
