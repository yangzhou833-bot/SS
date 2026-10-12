import React from "react";
import { Navigation, Loader2, Compass, Layers } from "lucide-react";

interface MapLoadingMaskProps {
  isLoading: boolean;
  mapStyle?: "standard" | "dark" | "minimal";
}

/**
 * 地图初始加载半透明蒙层 (Map Loading Semi-Transparent Mask)
 * - 针对低网速环境及地图瓦片初始化阶段的平滑加载体验优化
 * - 严格遵循 Facebook Straight-Edge 直角线框设计系统规范 (bg-white, border-[#E4E6EB], rounded-md)
 * - 居中加载指示器，提供平滑的半透明毛玻璃淡入淡出动画过渡，不阻断底层渲染管线
 */
export const MapLoadingMask: React.FC<MapLoadingMaskProps> = ({
  isLoading,
  mapStyle = "standard",
}) => {
  const isDark = mapStyle === "dark";

  return (
    <div
      id="map-initial-loading-mask"
      className={`absolute inset-0 z-40 flex items-center justify-center p-4 select-none transition-all duration-700 ease-out ${
        isLoading
          ? "opacity-100 pointer-events-auto backdrop-blur-sm"
          : "opacity-0 pointer-events-none backdrop-blur-none"
      } ${
        isDark
          ? "bg-[#18191A]/80 text-gray-100"
          : "bg-white/80 text-[#050505]"
      }`}
      aria-busy={isLoading}
      aria-live="polite"
    >
      {/* Facebook 直角线框风格居中加载卡片 */}
      <div
        id="map-loading-indicator-card"
        className={`relative px-6 py-5 rounded-md border shadow-2xs flex flex-col items-center max-w-[290px] w-full text-center transition-all duration-500 ease-out transform ${
          isLoading ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-1"
        } ${
          isDark
            ? "bg-[#242526] border-gray-700 text-gray-100"
            : "bg-white border-[#E4E6EB] text-[#050505]"
        }`}
      >
        {/* 雷达扫描 / 罗盘脉冲动效 */}
        <div className="relative w-16 h-16 flex items-center justify-center mb-3">
          {/* 双层同心脉冲雷达波 */}
          <div className="absolute inset-0 rounded-full bg-[#1877F2]/20 dark:bg-[#1877F2]/30 animate-map-radar" />
          <div className="absolute inset-0 rounded-full bg-[#1877F2]/15 dark:bg-[#1877F2]/20 animate-map-radar-delayed" />

          {/* 居中定位罗盘图标 */}
          <div
            className={`relative w-12 h-12 rounded-md border flex items-center justify-center shadow-2xs transition-colors ${
              isDark
                ? "bg-[#18191A] border-gray-700"
                : "bg-white border-[#E4E6EB]"
            }`}
          >
            <Navigation
              size={22}
              className="text-[#1877F2] fill-[#1877F2] animate-map-compass drop-shadow-none"
            />
          </div>
        </div>

        {/* 标题与加载旋转器 */}
        <div className="flex items-center justify-center space-x-1.5 font-bold text-sm text-[#1877F2] mb-1">
          <Loader2 size={15} className="animate-spin text-[#1877F2] shrink-0" />
          <span className="tracking-tight">正在载入空间地图</span>
        </div>

        {/* 副标题状态提示 */}
        <p className="text-[11.5px] text-[#65676B] dark:text-gray-400 font-sans tracking-tight mb-3">
          构建空间图层与信标网络 · 瓦片渲染中
        </p>

        {/* Facebook 经典直角微进度条 (Shimmer 动画) */}
        <div
          className={`w-full h-1 rounded-full overflow-hidden relative ${
            isDark ? "bg-gray-700" : "bg-[#F0F2F5]"
          }`}
        >
          <div className="absolute top-0 bottom-0 left-0 bg-[#1877F2] w-1/3 rounded-full animate-map-shimmer origin-left" />
        </div>

        {/* 底部轻量标签 */}
        <div className="mt-2.5 flex items-center justify-center space-x-1 text-[10px] text-[#8A8D91]">
          <Layers size={11} className="text-[#1877F2]" />
          <span>Slippy Leaflet 空间引擎</span>
        </div>
      </div>
    </div>
  );
};

