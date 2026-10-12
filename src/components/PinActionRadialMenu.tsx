import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, Camera, MapPin, Navigation } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

export type PinActionType = 'schedule' | 'activity' | 'snap' | 'base';

interface PinActionRadialMenuProps {
  isOpen: boolean;
  coord: { lat: number; lng: number } | null;
  address?: string;
  onClose: () => void;
  onSelectAction: (action: PinActionType) => void;
}

export const PinActionRadialMenu: React.FC<PinActionRadialMenuProps> = ({
  isOpen,
  coord,
  address = '目标位置',
  onClose,
  onSelectAction,
}) => {
  if (!isOpen || !coord) return null;

  const handleActionClick = (e: React.MouseEvent, action: PinActionType) => {
    e.stopPropagation();
    haptics.trigger('medium');
    soundEffects.playTapSound();
    onSelectAction(action);
  };

  const formattedLat = coord.lat.toFixed(4);
  const formattedLng = coord.lng.toFixed(4);

  return (
    <AnimatePresence>
      {/* 
        透明防误触全局事件层：无黑色/灰色遮罩背景，纯透传地图，
        点击空白区域平滑关闭 
      */}
      <div 
        className="fixed inset-0 z-40 bg-transparent pointer-events-auto select-none"
        onClick={() => {
          haptics.trigger('light');
          onClose();
        }}
      />

      {/* 
        纯圆形快捷功能键：悬浮于屏幕正中心锚钉/图钉正下方
      */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: -8 }}
        transition={{ type: 'spring', damping: 22, stiffness: 350 }}
        className="fixed top-[calc(50%+55px)] left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex flex-col items-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 4 个纯圆形功能图标 (无外包大卡片) */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* 1. 日程 (Schedule) */}
          <motion.button
            id="pin-action-schedule-btn"
            type="button"
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, y: 15 }}
            transition={{ type: 'spring', damping: 18, stiffness: 320, delay: 0.02 }}
            onClick={(e) => handleActionClick(e, 'schedule')}
            className="group flex flex-col items-center focus:outline-none cursor-pointer"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-[#1877F2] border-2 border-[#1877F2] shadow-md flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-active:scale-92 group-hover:bg-[#1877F2] group-hover:text-white">
              <Calendar size={24} strokeWidth={2.4} />
            </div>
            <span className="mt-1.5 px-2 py-0.5 bg-white border border-[#E4E6EB] text-[#050505] text-[10px] font-black rounded-md shadow-2xs group-hover:border-[#1877F2] group-hover:text-[#1877F2] transition-colors whitespace-nowrap">
              日程
            </span>
          </motion.button>

          {/* 2. 活动 (Activity) */}
          <motion.button
            id="pin-action-activity-btn"
            type="button"
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, y: 15 }}
            transition={{ type: 'spring', damping: 18, stiffness: 320, delay: 0.06 }}
            onClick={(e) => handleActionClick(e, 'activity')}
            className="group flex flex-col items-center focus:outline-none cursor-pointer"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-amber-600 border-2 border-amber-500 shadow-md flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-active:scale-92 group-hover:bg-amber-500 group-hover:text-white">
              <Users size={24} strokeWidth={2.4} />
            </div>
            <span className="mt-1.5 px-2 py-0.5 bg-white border border-[#E4E6EB] text-[#050505] text-[10px] font-black rounded-md shadow-2xs group-hover:border-amber-500 group-hover:text-amber-600 transition-colors whitespace-nowrap">
              活动
            </span>
          </motion.button>

          {/* 3. 快拍 (Quick Snap / Story) */}
          <motion.button
            id="pin-action-snap-btn"
            type="button"
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, y: 15 }}
            transition={{ type: 'spring', damping: 18, stiffness: 320, delay: 0.1 }}
            onClick={(e) => handleActionClick(e, 'snap')}
            className="group flex flex-col items-center focus:outline-none cursor-pointer"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-rose-600 border-2 border-rose-500 shadow-md flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-active:scale-92 group-hover:bg-rose-500 group-hover:text-white">
              <Camera size={24} strokeWidth={2.4} />
            </div>
            <span className="mt-1.5 px-2 py-0.5 bg-white border border-[#E4E6EB] text-[#050505] text-[10px] font-black rounded-md shadow-2xs group-hover:border-rose-500 group-hover:text-rose-600 transition-colors whitespace-nowrap">
              快拍
            </span>
          </motion.button>

          {/* 4. 据点 (Base / Custom Marker) */}
          <motion.button
            id="pin-action-base-btn"
            type="button"
            initial={{ opacity: 0, scale: 0.4, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, y: 15 }}
            transition={{ type: 'spring', damping: 18, stiffness: 320, delay: 0.14 }}
            onClick={(e) => handleActionClick(e, 'base')}
            className="group flex flex-col items-center focus:outline-none cursor-pointer"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-emerald-600 border-2 border-emerald-600 shadow-md flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-active:scale-92 group-hover:bg-emerald-600 group-hover:text-white">
              <MapPin size={24} strokeWidth={2.4} />
            </div>
            <span className="mt-1.5 px-2 py-0.5 bg-white border border-[#E4E6EB] text-[#050505] text-[10px] font-black rounded-md shadow-2xs group-hover:border-emerald-600 group-hover:text-emerald-600 transition-colors whitespace-nowrap">
              据点
            </span>
          </motion.button>
        </div>

        {/* 锚点微调指示 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.18 }}
          className="mt-3.5 px-3.5 py-1.5 bg-white border border-[#E4E6EB] text-[#1877F2] font-black text-xs rounded-full shadow-md flex items-center space-x-1.5 cursor-pointer hover:border-[#1877F2] transition-all"
        >
          <Navigation size={13} className="text-[#1877F2]" />
          <span>锚点图钉出现后，可以微调坐标</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
