import React from 'react';
import { Navigation, Loader2, Layers, Sparkles, MapPin, Radio, Compass } from 'lucide-react';

interface MapSkeletonPlaceholderProps {
  isLoading?: boolean;
  mapStyle?: 'standard' | 'dark' | 'minimal';
}

/**
 * MapSkeletonPlaceholder - Leaflet 地图初始化骨架屏与空间底图占位符
 * - 针对 Leaflet 地图初始化、瓦片抓取及信标网络构建阶段提供细腻的骨架动画
 * - 模拟真实的道路网格、黄河水系弧线、用户中心脉冲信标及好友图钉轮廓
 * - 消除白屏或黑屏突兀感，严格遵循 Facebook 直角线框 UI 体系
 */
export const MapSkeletonPlaceholder: React.FC<MapSkeletonPlaceholderProps> = ({
  isLoading = true,
  mapStyle = 'standard',
}) => {
  if (!isLoading) return null;

  const isDark = mapStyle === 'dark';

  return (
    <div
      id="map-skeleton-placeholder"
      className={`absolute inset-0 z-30 flex flex-col items-center justify-between select-none overflow-hidden transition-opacity duration-500 ease-out pointer-events-none ${isDark ? 'bg-[#18191A]' : 'bg-[#E5E9EE]'}`}
      aria-hidden="true"
    >
      {/* 1. 模拟地图道路网络与地理水系骨架 (Simulated Road Network & Water Contours) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60 dark:opacity-35"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="skeleton-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke={isDark ? '#2D3035' : '#D1D5DB'}
              strokeWidth="1"
            />
          </pattern>
          <linearGradient id="shimmer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#242526' : '#FFFFFF'} stopOpacity="0.3" />
            <stop offset="50%" stopColor={isDark ? '#3A3B3C' : '#E7F3FF'} stopOpacity="0.75" />
            <stop offset="100%" stopColor={isDark ? '#242526' : '#FFFFFF'} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* 基础街区网格 */}
        <rect width="100%" height="100%" fill="url(#skeleton-grid)" />

        {/* 模拟黄河主水道曲线 (Lanzhou Yellow River Contour) */}
        <path
          d="M -20,180 Q 120,230 220,190 T 420,220 T 600,180"
          fill="none"
          stroke={isDark ? '#1E3A5F' : '#BAE6FD'}
          strokeWidth="18"
          strokeLinecap="round"
          className="opacity-70 animate-pulse"
        />

        {/* 模拟城市主干道路网 (骨架微光路网) */}
        <path
          d="M 40,-20 L 40,900"
          stroke={isDark ? '#3A3B3C' : '#CBD5E1'}
          strokeWidth="6"
        />
        <path
          d="M 180,-20 L 180,900"
          stroke={isDark ? '#3A3B3C' : '#CBD5E1'}
          strokeWidth="7"
        />
        <path
          d="M 320,-20 L 320,900"
          stroke={isDark ? '#3A3B3C' : '#CBD5E1'}
          strokeWidth="5"
        />
        <path
          d="M -20,340 L 600,340"
          stroke={isDark ? '#3A3B3C' : '#CBD5E1'}
          strokeWidth="7"
        />
        <path
          d="M -20,520 L 600,520"
          stroke={isDark ? '#3A3B3C' : '#CBD5E1'}
          strokeWidth="6"
        />

        {/* 斜向快速路 */}
        <line
          x1="-20"
          y1="80"
          x2="500"
          y2="600"
          stroke={isDark ? '#3A3B3C' : '#D1D5DB'}
          strokeWidth="5"
          strokeDasharray="8 6"
        />
      </svg>

      {/* 2. 模拟顶部状态栏骨架 (Top Capsules Skeleton) */}
      <div className="relative w-full px-3 pt-3 flex items-center justify-between z-10">
        {/* 左侧天气胶囊骨架 */}
        <div className="h-[22px] w-28 rounded-full bg-white/70 dark:bg-white/10 border border-white/60 dark:border-white/20 backdrop-blur-xs flex items-center px-2 space-x-1.5 animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <div className="h-2 w-14 rounded bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* 右侧探索度胶囊骨架 */}
        <div className="h-[22px] w-20 rounded-full bg-white/70 dark:bg-white/10 border border-white/60 dark:border-white/20 backdrop-blur-xs flex items-center justify-center space-x-1.5 animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          <div className="h-2 w-10 rounded bg-gray-300 dark:bg-gray-600" />
        </div>
      </div>

      {/* 3. 模拟地图好友信标骨架图钉 (Simulated Pins around Center) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* 中心用户定位光晕与脉冲 (User Location Skeleton Beacon) */}
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          {/* 雷达外波纹 */}
          <div className="absolute w-28 h-28 -top-8 rounded-full bg-[#1877F2]/15 animate-ping duration-1000" />
          <div className="absolute w-18 h-18 -top-3 rounded-full bg-[#1877F2]/25 animate-pulse" />

          {/* 头像圆环骨架 */}
          <div className="relative w-12 h-12 rounded-full bg-white ring-4 ring-[#1877F2] shadow-sm flex items-center justify-center overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Navigation size={18} className="text-[#1877F2] fill-[#1877F2] animate-bounce" />
            </div>
          </div>
          {/* 用户姓名牌骨架 */}
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-[#242526] border border-[#E4E6EB] dark:border-gray-700 shadow-2xs flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-extrabold text-[#050505] dark:text-gray-200">
              兰州 · 东方红广场
            </span>
          </div>
        </div>

        {/* 模拟左侧好友图钉骨架 */}
        <div className="absolute top-[32%] left-[22%] flex flex-col items-center opacity-75 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-white ring-2 ring-emerald-400 p-0.5 shadow-sm">
            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="mt-1 h-3.5 w-12 rounded-full bg-white/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
        </div>

        {/* 模拟右侧好友图钉骨架 */}
        <div className="absolute top-[38%] right-[20%] flex flex-col items-center opacity-75 animate-pulse delay-200">
          <div className="w-9 h-9 rounded-full bg-white ring-2 ring-indigo-400 p-0.5 shadow-sm">
            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="mt-1 h-3.5 w-14 rounded-full bg-white/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
        </div>

        {/* 模拟下方活动图钉骨架 */}
        <div className="absolute top-[66%] left-[34%] flex flex-col items-center opacity-70 animate-pulse delay-300">
          <div className="px-2 py-1 rounded-md bg-[#1877F2]/80 text-white text-[9.5px] font-bold shadow-xs">
            🎯 城市路线采风
          </div>
          <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1877F2]/80" />
        </div>
      </div>

      {/* 4. 居中 Facebook Straight-Edge 直角线框加载卡片 (Status Card) */}
      <div className="relative z-20 my-auto pointer-events-auto">
        <div
          className={`px-5 py-4 rounded-md border shadow-md flex flex-col items-center max-w-[270px] w-full text-center transition-all ${
            isDark
              ? 'bg-[#242526]/95 border-gray-700 text-gray-100'
              : 'bg-white/95 border-[#E4E6EB] text-[#050505]'
          } backdrop-blur-md`}
        >
          {/* 雷达扫描图标 */}
          <div className="relative w-11 h-11 rounded-md bg-[#1877F2]/10 border border-[#1877F2]/25 flex items-center justify-center mb-2.5">
            <Radio size={20} className="text-[#1877F2] animate-pulse" />
            <div className="absolute inset-0 rounded-md bg-[#1877F2]/10 animate-ping" />
          </div>

          {/* 标题 */}
          <div className="flex items-center justify-center space-x-1.5 font-bold text-xs text-[#1877F2] mb-1">
            <Loader2 size={13} className="animate-spin text-[#1877F2] shrink-0" />
            <span className="tracking-tight">正在加载空间数字地图</span>
          </div>

          {/* 状态副文本 */}
          <p className="text-[10.5px] text-[#65676B] dark:text-gray-400 font-sans tracking-tight mb-2.5">
            校准经纬度与信标网络 · 瓦片渲染中
          </p>

          {/* Facebook 经典直角微进度条 (Shimmer Bar) */}
          <div
            className={`w-full h-1 rounded-full overflow-hidden relative ${
              isDark ? 'bg-gray-700' : 'bg-[#F0F2F5]'
            }`}
          >
            <div className="absolute top-0 bottom-0 left-0 bg-[#1877F2] w-1/3 rounded-full animate-map-shimmer origin-left" />
          </div>

          {/* 引擎徽章 */}
          <div className="mt-2 flex items-center justify-center space-x-1 text-[9.5px] text-[#8A8D91]">
            <Layers size={10} className="text-[#1877F2]" />
            <span>OpenStreetMap · Slippy Leaflet 空间引擎</span>
          </div>
        </div>
      </div>

      {/* 5. 模拟右侧与底部控制按钮骨架 (Bottom Controls Skeleton) */}
      <div className="relative w-full px-3 pb-8 flex items-end justify-between z-10 pointer-events-none">
        {/* 底部左侧图层控制按钮骨架 */}
        <div className="w-8 h-8 rounded-md bg-white/80 dark:bg-gray-800 border border-[#E4E6EB] dark:border-gray-700 shadow-2xs flex items-center justify-center animate-pulse">
          <Layers size={14} className="text-gray-400" />
        </div>

        {/* 底部右侧缩放与回中控制骨架 */}
        <div className="flex flex-col space-y-1.5 animate-pulse">
          <div className="w-8 h-8 rounded-md bg-white/80 dark:bg-gray-800 border border-[#E4E6EB] dark:border-gray-700 shadow-2xs flex items-center justify-center">
            <Compass size={14} className="text-gray-400" />
          </div>
          <div className="w-8 h-8 rounded-md bg-[#1877F2]/80 text-white shadow-2xs flex items-center justify-center">
            <Navigation size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
