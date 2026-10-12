import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarPlus,
  CalendarRange,
  Camera,
  MapPinPlus,
  X,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';

export type GuideActionType =
  | 'create-schedule'
  | 'create-activity'
  | 'create-snapshot'
  | 'create-map-anchor';

interface FirstTimeAddGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: GuideActionType) => void;
}

interface CircularFeatureItem {
  id: GuideActionType;
  title: string;
  tag: string;
  desc: string;
  icon: React.ReactNode;
  bgCircle: string;
  textColor: string;
  borderColor: string;
  hoverBorderColor: string;
  ringGlow: string;
}

const GUIDE_ITEMS: CircularFeatureItem[] = [
  {
    id: 'create-schedule',
    title: '创建日程',
    tag: '时间与航程',
    desc: '规划普通 / 航班日程，地图与日历 5 步精确定位',
    icon: <CalendarPlus size={24} className="stroke-[2.2]" />,
    bgCircle: 'bg-blue-50 dark:bg-blue-950/40',
    textColor: 'text-[#1877F2] dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverBorderColor: 'hover:border-[#1877F2]',
    ringGlow: 'hover:ring-4 hover:ring-blue-100 dark:hover:ring-blue-900/30',
  },
  {
    id: 'create-activity',
    title: '创建活动',
    tag: '聚会与群聚',
    desc: '发起多人骑行、聚会与户外露营，全员位置协作',
    icon: <CalendarRange size={24} className="stroke-[2.2]" />,
    bgCircle: 'bg-amber-50 dark:bg-amber-950/40',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800',
    hoverBorderColor: 'hover:border-amber-500',
    ringGlow: 'hover:ring-4 hover:ring-amber-100 dark:hover:ring-amber-900/30',
  },
  {
    id: 'create-snapshot',
    title: '创建快拍',
    tag: '即时星片',
    desc: '拍摄地图实况照片与短视频，分享探索足迹',
    icon: <Camera size={24} className="stroke-[2.2]" />,
    bgCircle: 'bg-rose-50 dark:bg-rose-950/40',
    textColor: 'text-rose-500 dark:text-rose-400',
    borderColor: 'border-rose-200 dark:border-rose-800',
    hoverBorderColor: 'hover:border-rose-500',
    ringGlow: 'hover:ring-4 hover:ring-rose-100 dark:hover:ring-rose-900/30',
  },
  {
    id: 'create-map-anchor',
    title: '创建地图锚点',
    tag: '图钉与地标',
    desc: '在地图中心精准标记自定义地点与生活记忆',
    icon: <MapPinPlus size={24} className="stroke-[2.2]" />,
    bgCircle: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    hoverBorderColor: 'hover:border-emerald-500',
    ringGlow: 'hover:ring-4 hover:ring-emerald-100 dark:hover:ring-emerald-900/30',
  },
];

export const FirstTimeAddGuideModal: React.FC<FirstTimeAddGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const handleChoose = (id: GuideActionType) => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    onClose();
    onSelectAction(id);
  };

  const handleDismiss = () => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 select-none font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window: Facebook Straight Line Frame System */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden z-10 p-5 sm:p-6"
        >
          {/* Top Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#F0F2F5] dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-[#65676B] dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            title="关闭指引"
            aria-label="关闭指引"
          >
            <X size={15} />
          </button>

          {/* Header Title Section */}
          <div className="text-center pt-1 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[#1877F2] dark:text-blue-400 text-[11px] font-bold shadow-2xs mb-2">
              <Sparkles size={13} className="text-[#1877F2] animate-pulse" />
              <span>新手指引 · 地图快捷创作</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#050505] dark:text-white tracking-tight">
              点击右上角加号，随时发起 4 大核心创作
            </h3>
            <p className="text-xs text-[#65676B] dark:text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
              您可直接点击下方任一圆形图标立即体验，或关闭后随时在右上角呼出菜单
            </p>
          </div>

          {/* 4 Circular Action Icons Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            {GUIDE_ITEMS.map((item, idx) => (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChoose(item.id)}
                className={`flex flex-col items-center text-center p-3 rounded-xl bg-white dark:bg-zinc-800/80 border ${item.borderColor} ${item.hoverBorderColor} ${item.ringGlow} shadow-2xs hover:shadow-md transition-all cursor-pointer group`}
              >
                {/* Prominent Circular Icon Container */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${item.bgCircle} ${item.textColor} border-2 ${item.borderColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 mb-2.5 relative`}
                >
                  {item.icon}
                  {/* Subtle step indicator badge */}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 text-[10px] font-bold text-[#050505] dark:text-white flex items-center justify-center shadow-2xs">
                    {idx + 1}
                  </span>
                </div>

                {/* Title */}
                <div className="text-xs sm:text-sm font-black text-[#050505] dark:text-white group-hover:text-[#1877F2] transition-colors leading-tight">
                  {item.title}
                </div>

                {/* Subtitle tag */}
                <span className="mt-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-[#F0F2F5] dark:bg-zinc-700/60 text-[#65676B] dark:text-zinc-300">
                  {item.tag}
                </span>

                {/* Description */}
                <p className="text-[10px] text-[#65676B] dark:text-zinc-400 mt-1.5 line-clamp-2 leading-tight">
                  {item.desc}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Bottom Confirmation Bar */}
          <div className="mt-5 pt-3 border-t border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[#65676B] dark:text-zinc-400">
              <HelpCircle size={14} className="text-[#1877F2]" />
              <span>可在右上角加号菜单中随时查看</span>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <span>我知道了</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
