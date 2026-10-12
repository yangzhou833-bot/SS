import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Utensils,
  Zap,
  Bus,
  HeartPulse,
  GraduationCap,
  Sparkles,
  TrendingDown,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Building2,
  Compass,
} from 'lucide-react';
import { RegionalCostData, CostDimensionKey } from '../../types';

export interface EightDimensionComparisonChartProps {
  selectedRegions: RegionalCostData[];
  baseRegion: RegionalCostData;
  lifestyleStandard?: 'frugal' | 'comfortable' | 'quality' | string;
}

interface DimensionConfig {
  key: CostDimensionKey | 'livability' | 'environment';
  label: string;
  icon: React.ElementType;
  weight: number;
  description: string;
  unit: string;
  color: string;
  bgLight: string;
}

const DIMENSIONS: DimensionConfig[] = [
  { key: 'housing', label: '住房与租房', icon: Home, weight: 0.35, description: '整租/合租房租水平与置业门槛', unit: '元/月', color: '#007AFF', bgLight: 'bg-[#007AFF]/10 text-[#007AFF]' },
  { key: 'food', label: '餐饮与食材', icon: Utensils, weight: 0.22, description: '一日三餐、生鲜农贸及大众餐饮', unit: '元/月', color: '#FF9500', bgLight: 'bg-[#FF9500]/10 text-[#FF9500]' },
  { key: 'utilities', label: '水电燃与供暖', icon: Zap, weight: 0.08, description: '水电气网与北方集中供暖支出', unit: '元/月', color: '#AF52DE', bgLight: 'bg-[#AF52DE]/10 text-[#AF52DE]' },
  { key: 'transportation', label: '公共与日常交通', icon: Bus, weight: 0.10, description: '地铁公交月票、打车及城际通达', unit: '元/月', color: '#5856D6', bgLight: 'bg-[#5856D6]/10 text-[#5856D6]' },
  { key: 'healthcare', label: '医疗与健康保障', icon: HeartPulse, weight: 0.08, description: '三甲挂号配药门诊及重疾就医便利', unit: '指数', color: '#FF2D55', bgLight: 'bg-[#FF2D55]/10 text-[#FF2D55]' },
  { key: 'education', label: '教育与成长支持', icon: GraduationCap, weight: 0.07, description: '优质公办学位分布与辅导文体成本', unit: '指数', color: '#34C759', bgLight: 'bg-[#34C759]/10 text-[#34C759]' },
  { key: 'livability', label: '综合宜居与便利', icon: Sparkles, weight: 0.05, description: '气候舒适度、社区食堂及周边游便利', unit: '指数', color: '#30B0C7', bgLight: 'bg-[#30B0C7]/10 text-[#30B0C7]' },
  { key: 'environment', label: '生态与安全环境', icon: ShieldCheck, weight: 0.05, description: '空气优良率、治安稳定与绿色容积', unit: '指数', color: '#34C759', bgLight: 'bg-[#34C759]/10 text-[#34C759]' },
];

const APPLE_REGION_PALETTE = [
  { stroke: '#007AFF', fill: 'rgba(0, 122, 255, 0.20)', text: 'text-[#007AFF]', bg: 'bg-[#007AFF]', badgeBg: 'bg-[#007AFF]/10 text-[#007AFF]' },
  { stroke: '#34C759', fill: 'rgba(52, 199, 89, 0.20)', text: 'text-[#34C759]', bg: 'bg-[#34C759]', badgeBg: 'bg-[#34C759]/10 text-[#34C759]' },
  { stroke: '#FF9500', fill: 'rgba(255, 149, 0, 0.20)', text: 'text-[#FF9500]', bg: 'bg-[#FF9500]', badgeBg: 'bg-[#FF9500]/10 text-[#FF9500]' },
  { stroke: '#AF52DE', fill: 'rgba(175, 82, 222, 0.20)', text: 'text-[#AF52DE]', bg: 'bg-[#AF52DE]', badgeBg: 'bg-[#AF52DE]/10 text-[#AF52DE]' },
];

export const EightDimensionComparisonChart: React.FC<EightDimensionComparisonChartProps> = ({
  selectedRegions,
  baseRegion,
  lifestyleStandard = 'comfortable',
}) => {
  const [viewMode, setViewMode] = useState<'bars' | 'radar'>('bars');
  const [hoveredDim, setHoveredDim] = useState<string | null>(null);

  // Multiplier for lifestyle standard
  const standardMultiplier =
    lifestyleStandard === 'frugal' ? 0.78 : lifestyleStandard === 'quality' ? 1.45 : 1.0;

  // Helper to extract score (0-100 scale) for each dimension
  const getDimensionScore = (region: RegionalCostData, dimKey: string): number => {
    switch (dimKey) {
      case 'housing':
        return Math.min(100, Math.round(region.overallCostIndex * 1.15));
      case 'food':
        return Math.min(100, Math.round(region.overallCostIndex * 0.95));
      case 'utilities':
        return Math.min(100, Math.round(region.overallCostIndex * 0.85));
      case 'transportation':
        return Math.min(100, Math.round(region.transportIndex || region.overallCostIndex * 0.9));
      case 'healthcare':
        return Math.min(100, region.healthcareIndex || 50);
      case 'education':
        return Math.min(100, region.educationIndex || 50);
      case 'livability':
        return Math.min(100, region.livabilityIndex || 50);
      case 'environment':
        return Math.min(100, region.environmentIndex || 50);
      default:
        return region.overallCostIndex;
    }
  };

  // Helper to get estimated monthly expenditure for financial dimensions
  const getDimensionMonthlyEstimate = (region: RegionalCostData, dimKey: string): number => {
    const baseMonthly = region.monthlyBasicRange?.typical || 3500;
    const dim = DIMENSIONS.find((d) => d.key === dimKey);
    const weight = dim ? dim.weight : 0.1;
    return Math.round(baseMonthly * weight * standardMultiplier);
  };

  // Radar chart SVG calculation (8 vertices)
  const radarPoints = (region: RegionalCostData) => {
    const centerX = 150;
    const centerY = 140;
    const maxRadius = 100;
    const count = DIMENSIONS.length;

    return DIMENSIONS.map((dim, i) => {
      const angle = ((Math.PI * 2) / count) * i - Math.PI / 2;
      const score = getDimensionScore(region, dim.key);
      const r = (score / 100) * maxRadius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return { x, y, angle, score };
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/10 space-y-4"
    >
      {/* Apple Style Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shadow-xs">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base tracking-tight text-[#1C1C1E] dark:text-white">
                八维生活成本与宜居矩阵
              </h3>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF]">
                对照：{baseRegion.name}
              </span>
            </div>
            <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
              量化住房、餐饮、能耗、交通、医疗、教育、宜居及生态八大核心维度
            </p>
          </div>
        </div>

        {/* Apple Segmented Control */}
        <div className="flex items-center bg-[#767680]/12 dark:bg-[#767680]/24 p-1 rounded-xl text-[12px]">
          <button
            onClick={() => setViewMode('bars')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === 'bars'
                ? 'bg-white dark:bg-[#636366] text-[#1C1C1E] dark:text-white shadow-xs font-semibold'
                : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
            }`}
          >
            分组横条对比
          </button>
          <button
            onClick={() => setViewMode('radar')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              viewMode === 'radar'
                ? 'bg-white dark:bg-[#636366] text-[#1C1C1E] dark:text-white shadow-xs font-semibold'
                : 'text-[#8E8E93] hover:text-[#1C1E21] dark:hover:text-white'
            }`}
          >
            八维雷达图
          </button>
        </div>
      </div>

      {/* Region Chips Legend (Apple Pills) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-medium text-[#8E8E93]">对比区域：</span>
        {selectedRegions.map((region, idx) => {
          const color = APPLE_REGION_PALETTE[idx % APPLE_REGION_PALETTE.length];
          const isBase = region.id === baseRegion.id;
          return (
            <motion.div
              key={region.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white shadow-xs border border-black/5 dark:border-white/10"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.stroke }} />
              <span>{region.name}</span>
              {isBase && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#007AFF] text-white">基准</span>
              )}
              <span className="text-[11px] text-[#8E8E93] font-mono">
                {region.overallCostIndex}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* VIEW 1: Granular Horizontal Dimension Comparison (Apple Inset Grouped style) */}
      <AnimatePresence mode="wait">
        {viewMode === 'bars' && (
          <motion.div
            key="bars-view"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="space-y-2.5"
          >
            {DIMENSIONS.map((dim, dimIdx) => {
              const Icon = dim.icon;
              const isHovered = hoveredDim === dim.key;
              const baseScore = getDimensionScore(baseRegion, dim.key);

              return (
                <motion.div
                  key={dim.key}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: dimIdx * 0.03 }}
                  onMouseEnter={() => setHoveredDim(dim.key)}
                  onMouseLeave={() => setHoveredDim(null)}
                  className={`p-3 rounded-xl border transition-all ${
                    isHovered
                      ? 'border-[#007AFF]/30 bg-[#F2F2F7]/80 dark:bg-[#2C2C2E]/80 shadow-xs'
                      : 'border-black/5 dark:border-white/5 bg-[#F9F9FB] dark:bg-[#242426] hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E]'
                  }`}
                >
                  {/* Dimension title line */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${dim.bgLight}`}>
                        <Icon size={14} />
                      </div>
                      <span className="font-semibold text-[13px] text-[#1C1C1E] dark:text-white">{dim.label}</span>
                      <span className="text-[11px] text-[#8E8E93]">· {dim.description}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#8E8E93] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md">
                      权重 {(dim.weight * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Bars for each selected region */}
                  <div className="space-y-2">
                    {selectedRegions.map((region, idx) => {
                      const color = APPLE_REGION_PALETTE[idx % APPLE_REGION_PALETTE.length];
                      const score = getDimensionScore(region, dim.key);
                      const isBase = region.id === baseRegion.id;
                      const diff = score - baseScore;
                      const monthlyEst = getDimensionMonthlyEstimate(region, dim.key);

                      return (
                        <div key={region.id} className="flex items-center gap-2.5 text-[12px]">
                          <div className="w-16 sm:w-20 truncate font-semibold text-[#1C1C1E] dark:text-white shrink-0 text-right">
                            {region.name}
                          </div>

                          {/* Progress Bar with iOS smooth rounded-full track */}
                          <div className="flex-1 bg-black/5 dark:bg-white/10 h-3 rounded-full overflow-hidden relative">
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, Math.max(8, score))}%` }}
                              transition={{ duration: 0.5, delay: 0.05 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                              style={{
                                backgroundColor: color.stroke,
                              }}
                            />
                          </div>

                          {/* Monthly Estimate & Comparison with Base */}
                          <div className="w-32 sm:w-40 text-right shrink-0 flex items-center justify-end gap-1.5 font-mono text-[11px]">
                            {dim.unit === '元/月' ? (
                              <span className="font-semibold text-[#1C1C1E] dark:text-white">¥{monthlyEst}/月</span>
                            ) : (
                              <span className="font-semibold text-[#1C1C1E] dark:text-white">{score}分</span>
                            )}

                            {!isBase && (
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                  diff < 0
                                    ? 'bg-[#34C759]/15 text-[#34C759]'
                                    : diff > 0
                                    ? 'bg-[#FF3B30]/15 text-[#FF3B30]'
                                    : 'bg-black/5 text-[#8E8E93]'
                                }`}
                              >
                                {diff < 0 ? (
                                  <>
                                    <TrendingDown size={10} className="mr-0.5" />
                                    低{Math.abs(diff)}%
                                  </>
                                ) : diff > 0 ? (
                                  <>
                                    <TrendingUp size={10} className="mr-0.5" />
                                    高{diff}%
                                  </>
                                ) : (
                                  '持平'
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* VIEW 2: Radar Chart Representation (Apple Aesthetics) */}
        {viewMode === 'radar' && (
          <motion.div
            key="radar-view"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2"
          >
            {/* SVG Radar Graphic */}
            <div className="md:col-span-6 flex items-center justify-center p-2">
              <svg viewBox="0 0 300 280" className="w-full max-w-[290px] h-auto overflow-visible font-sans">
                {/* Background concentric rings */}
                {[20, 40, 60, 80, 100].map((ring, ringIdx) => (
                  <motion.circle
                    key={ring}
                    cx="150"
                    cy="140"
                    r={ring}
                    fill="none"
                    stroke="#E5E5EA"
                    strokeWidth="1"
                    strokeDasharray={ring === 100 ? undefined : '3,3'}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ transformOrigin: '150px 140px' }}
                    transition={{ duration: 0.4, delay: ringIdx * 0.05, ease: 'easeOut' }}
                  />
                ))}

                {/* Dimension axis lines & labels */}
                {DIMENSIONS.map((dim, i) => {
                  const count = DIMENSIONS.length;
                  const angle = ((Math.PI * 2) / count) * i - Math.PI / 2;
                  const endX = 150 + 100 * Math.cos(angle);
                  const endY = 140 + 100 * Math.sin(angle);
                  const labelX = 150 + 120 * Math.cos(angle);
                  const labelY = 140 + 120 * Math.sin(angle);

                  return (
                    <motion.g
                      key={dim.key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.15 + i * 0.03 }}
                    >
                      <line x1="150" y1="140" x2={endX} y2={endY} stroke="#E5E5EA" strokeWidth="1" />
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[10px] fill-[#8E8E93] font-medium"
                      >
                        {dim.label.split('与')[0]}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Polygon overlays for each region with Apple sleek bloom */}
                {selectedRegions.map((region, idx) => {
                  const color = APPLE_REGION_PALETTE[idx % APPLE_REGION_PALETTE.length];
                  const pts = radarPoints(region);
                  const polyString = pts.map((p) => `${p.x},${p.y}`).join(' ');

                  return (
                    <motion.g
                      key={region.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ transformOrigin: '150px 140px' }}
                      transition={{
                        duration: 0.65,
                        delay: 0.2 + idx * 0.12,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <polygon
                        points={polyString}
                        fill={color.fill}
                        stroke={color.stroke}
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        className="transition-colors duration-200"
                      />
                      {pts.map((p, pIdx) => (
                        <motion.circle
                          key={pIdx}
                          cx={p.x}
                          cy={p.y}
                          r="3.5"
                          fill={color.stroke}
                          stroke="#FFF"
                          strokeWidth="1.5"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.4 + idx * 0.1 + pIdx * 0.02,
                            ease: 'backOut',
                          }}
                        />
                      ))}
                    </motion.g>
                  );
                })}
              </svg>
            </div>

            {/* Quick breakdown alongside radar (Apple Inset Cards) */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="md:col-span-6 space-y-3"
            >
              <div className="p-3.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-xl space-y-1">
                <div className="font-semibold text-[13px] text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
                  <Compass size={15} className="text-[#007AFF]" />
                  <span>多维雷达洞察</span>
                </div>
                <p className="text-[12px] text-[#8E8E93] leading-relaxed">
                  雷达覆盖面积越向外舒展，代表该地区在该民生维度的指标评分越充裕。住房与餐饮合计权重超 57%，是支配跨城生活体感的最显著因素。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {selectedRegions.map((region, idx) => {
                  const color = APPLE_REGION_PALETTE[idx % APPLE_REGION_PALETTE.length];
                  const monthlyTotal = Math.round(
                    (region.monthlyBasicRange?.typical || 3500) * standardMultiplier
                  );
                  return (
                    <motion.div
                      key={region.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + idx * 0.08 }}
                      className="p-3 bg-[#F9F9FB] dark:bg-[#242426] border border-black/5 dark:border-white/5 rounded-xl space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-[13px] text-[#1C1C1E] dark:text-white">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.stroke }} />
                        <span>{region.name}</span>
                      </div>
                      <div className="text-[11px] text-[#8E8E93]">
                        预估基础月开销：
                        <span className="font-bold text-[#007AFF] ml-0.5">¥{monthlyTotal}</span>
                      </div>
                      <div className="text-[11px] text-[#8E8E93] truncate">
                        核心优势：{region.mainAdvantages?.[0] || '生活宜居惬意'}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
