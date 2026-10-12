import React, { useMemo } from 'react';

interface MapScaleBarProps {
  zoom: number;
  centerLat?: number;
  mapStyle?: 'standard' | 'dark' | 'minimal';
  className?: string;
}

/**
 * 高德地图标准比例尺 (AutoNavi / Amap Scale Bar)
 * - 地图尺尺寸固定 (46px)，缩小固定在左下角
 * - 放大缩小地图时，标尺物理宽度保持不变，仅动态更新显示的地图尺寸数值与单位 (如 50米, 100米, 200米, 500米, 1公里, 2公里, 5公里, 10公里...)
 * - 仅显示 0 与 目标距离两端，线条精致纤细
 */
const FIXED_SCALE_BAR_WIDTH_PX = 46;

const STANDARD_SCALE_LADDER_METERS = [
  5, 10, 20, 50, 100, 200, 500,
  1000, 2000, 5000, 10000, 20000, 50000,
  100000, 200000, 500000, 1000000, 2000000
];

export const MapScaleBar: React.FC<MapScaleBarProps> = ({
  zoom,
  centerLat = 36.0592,
  mapStyle = 'standard',
  className = '',
}) => {
  // 根据当前地图缩放级别和纬度，按照高德地图逻辑计算当前对应的标准梯队尺寸文本，标尺物理大小保持不变
  const displayDistanceText = useMemo(() => {
    const latRad = (centerLat * Math.PI) / 180;
    // Web Mercator 地面分辨率: metersPerPixel = 156543.03392 * cos(lat) / 2^zoom
    const mpp = (156543.03392 * Math.cos(latRad)) / Math.pow(2, zoom);
    const rawMeters = FIXED_SCALE_BAR_WIDTH_PX * mpp;

    // 从标准刻度阶梯中选取最接近的尺寸
    let closestMeters = STANDARD_SCALE_LADDER_METERS[0];
    let minDiff = Infinity;

    for (const step of STANDARD_SCALE_LADDER_METERS) {
      // 使用对数差值匹配最舒适的比例尺层级
      const diff = Math.abs(Math.log(step) - Math.log(rawMeters));
      if (diff < minDiff) {
        minDiff = diff;
        closestMeters = step;
      }
    }

    if (closestMeters >= 1000) {
      return `${closestMeters / 1000}公里`;
    }
    return `${closestMeters}米`;
  }, [zoom, centerLat]);

  const isDark = mapStyle === 'dark';

  return (
    <div
      id="map-scale-bar"
      className={`select-none pointer-events-none flex flex-col items-start font-sans shrink-0 ${className}`}
    >
      {/* 数字刻度标签 (0 与 当前地图尺寸) */}
      <div
        className={`flex justify-between items-center text-[7.5px] font-bold leading-none mb-0.5 tracking-tight ${
          isDark
            ? 'text-gray-100 [text-shadow:_0_0.5px_1.5px_rgba(0,0,0,0.95)]'
            : 'text-[#1C1E21] [text-shadow:_0_0.5px_1.5px_rgba(255,255,255,0.95)]'
        }`}
        style={{ width: `${FIXED_SCALE_BAR_WIDTH_PX}px` }}
      >
        <span>0</span>
        <span className={isDark ? 'text-[#3897f0]' : 'text-[#1877F2]'}>{displayDistanceText}</span>
      </div>

      {/* 固定尺寸线段标尺 (高德风格左刻度、右刻度、底线，尺寸完全固定不变) */}
      <div
        className={`relative h-[2.5px] border-b border-l border-r ${
          isDark
            ? 'border-gray-200 shadow-[0_0.5px_1px_rgba(0,0,0,0.8)]'
            : 'border-[#1C1E21] shadow-[0_0.5px_1px_rgba(255,255,255,0.8)]'
        }`}
        style={{ width: `${FIXED_SCALE_BAR_WIDTH_PX}px` }}
      />
    </div>
  );
};


