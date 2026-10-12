import React from 'react';
import {
  CircleDollarSign,
  TrendingUp,
  Home,
  HeartPulse,
  GraduationCap,
  Bus,
  Sparkles,
  MapPin,
  ChevronRight,
  Info,
  Scale,
  Compass,
} from 'lucide-react';
import {
  RegionalCostData,
  CostSubLayerKey,
} from '../types';
import {
  REGIONAL_COST_DATABASE,
  COST_SUBLAYERS_CONFIG,
  PROTOTYPE_DEMO_TAG,
} from '../data/costOfLivingData';
import { costOfLivingStore } from '../data/costOfLivingStore';

interface CostOfLivingMapOverlayProps {
  activeSubLayer: CostSubLayerKey;
  onSelectSubLayer: (subLayer: CostSubLayerKey) => void;
  selectedRegionId: string;
  onSelectRegion: (regionId: string) => void;
  onOpenComparison: () => void;
  onOpenBudget: () => void;
  onOpenRelocation: () => void;
  reducedMotion?: boolean;
}

export const CostOfLivingMapOverlay: React.FC<CostOfLivingMapOverlayProps> = ({
  activeSubLayer,
  onSelectSubLayer,
  selectedRegionId,
  onSelectRegion,
  onOpenComparison,
  onOpenBudget,
  onOpenRelocation,
  reducedMotion = false,
}) => {
  const currentSubLayerConfig =
    COST_SUBLAYERS_CONFIG.find((c) => c.key === activeSubLayer) || COST_SUBLAYERS_CONFIG[0];

  const regionsList: RegionalCostData[] = [
    REGIONAL_COST_DATABASE.yuzhong,
    REGIONAL_COST_DATABASE.dujiangyan,
    REGIONAL_COST_DATABASE.lanzhou,
    REGIONAL_COST_DATABASE.chengdu,
    REGIONAL_COST_DATABASE.gansu,
    REGIONAL_COST_DATABASE.sichuan,
  ];

  const getSubLayerValue = (region: RegionalCostData): { display: string; subText: string } => {
    switch (activeSubLayer) {
      case 'cost_index':
        return {
          display: `指数 ${region.overallCostIndex}`,
          subText: `全国基准=50 · ${region.overallCostIndex > 65 ? '成本偏高' : region.overallCostIndex > 50 ? '中等温和' : '低成本洼地'}`,
        };
      case 'income':
        return {
          display: `¥${region.afterTaxIncomeRange.typical}/月`,
          subText: `税后净中位数 (${region.afterTaxIncomeRange.low}-${region.afterTaxIncomeRange.high})`,
        };
      case 'rent':
        return {
          display: `¥${region?.dimensions?.housing?.monthlyRange?.typical || 1200}/月`,
          subText: `整租两居中位数 (占收入 ${((region?.housingBurdenRatio || 0) * 100).toFixed(0)}%)`,
        };
      case 'healthcare':
        return {
          display: `保障分 ${region.healthcareIndex}`,
          subText: region.level === 'county' ? (region.countyIndicators?.travelTimeToHigherHospitals || '定点二甲') : '密集三甲集群',
        };
      case 'education':
        return {
          display: `资源分 ${region.educationIndex}`,
          subText: region.level === 'county' ? '示范性高中+普惠学位' : '大学本科高校聚集',
        };
      case 'transport':
        return {
          display: `出行分 ${region.transportIndex}`,
          subText: `月均通勤约 ¥${region?.dimensions?.transportation?.monthlyRange?.typical || 200}`,
        };
      case 'livability':
        return {
          display: `宜居分 ${region.livabilityIndex}`,
          subText: `环境分 ${region.environmentIndex} · ${region.mainAdvantages[0] || '宜居舒适'}`,
        };
      default:
        return { display: `指数 ${region.overallCostIndex}`, subText: '综合指标' };
    }
  };

  const getSubLayerIcon = (key: CostSubLayerKey) => {
    switch (key) {
      case 'cost_index':
        return CircleDollarSign;
      case 'income':
        return TrendingUp;
      case 'rent':
        return Home;
      case 'healthcare':
        return HeartPulse;
      case 'education':
        return GraduationCap;
      case 'transport':
        return Bus;
      case 'livability':
        return Sparkles;
      default:
        return CircleDollarSign;
    }
  };

  return (
    <div
      id="cost-of-living-map-overlay"
      className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3"
    >
      {/* 顶部：7大子图层切换滑动栏 (紧贴于快捷栏下方) */}
      <div className="w-full pt-11 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md border border-[#E4E6EB] rounded-md shadow-2xs p-1.5 flex flex-col gap-1">
          <div className="flex items-center justify-between px-1.5 pb-1 border-b border-[#E4E6EB]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#050505]">
              <CircleDollarSign size={14} className="text-[#1877F2]" />
              <span>生活成本决策子图层</span>
              <span className="text-[10px] text-[#65676B] font-normal">
                ({currentSubLayerConfig.label} · {currentSubLayerConfig.unit})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] bg-[#F0F2F5] text-[#65676B] px-1.5 py-0.5 rounded-sm border border-[#E4E6EB]">
                {PROTOTYPE_DEMO_TAG}
              </span>
            </div>
          </div>

          {/* 7大子图层选项横滑按钮 */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {COST_SUBLAYERS_CONFIG.map((sub) => {
              const Icon = getSubLayerIcon(sub.key);
              const isActive = activeSubLayer === sub.key;
              return (
                <button
                  key={sub.key}
                  id={`cost-sublayer-${sub.key}-btn`}
                  type="button"
                  onClick={() => onSelectSubLayer(sub.key)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium shrink-0 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#1877F2] text-white font-bold shadow-2xs border border-[#1877F2]'
                      : 'bg-white text-[#050505] hover:bg-[#F0F2F5] border border-[#E4E6EB]'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-white' : 'text-[#1877F2]'} />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 地图中部：重点区县与城市成本卡片快捷选择栏 */}
      <div className="w-full flex justify-center pointer-events-auto">
        <div className="w-full max-w-lg bg-white/95 backdrop-blur-md border border-[#E4E6EB] rounded-md shadow-2xs p-2">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold text-[#050505] flex items-center gap-1">
              <MapPin size={12} className="text-[#1877F2]" />
              <span>标杆采样区县与城市指标看板 (点击查看明细与抽样)</span>
            </span>
            <span className="text-[10px] text-[#65676B]">最低支持至县级行政区</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {regionsList.map((region) => {
              const isSelected = selectedRegionId === region.id;
              const val = getSubLayerValue(region);
              return (
                <button
                  key={region.id}
                  id={`region-card-btn-${region.id}`}
                  type="button"
                  onClick={() => onSelectRegion(region.id)}
                  className={`text-left p-2 rounded-md border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E7F3FF] border-[#1877F2] shadow-2xs ring-1 ring-[#1877F2]/40'
                      : 'bg-white hover:bg-[#F7F8FA] border-[#E4E6EB] hover:border-[#1877F2]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-[#050505]">{region.name}</span>
                      <span
                        className={`text-[8.5px] px-1 py-0.2 rounded-xs font-bold ${
                          region.level === 'county'
                            ? 'bg-emerald-100 text-emerald-800'
                            : region.level === 'city'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {region.level === 'county' ? '县级' : region.level === 'city' ? '市级' : '省级'}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-[#1877F2] bg-blue-50 px-1 rounded-xs border border-blue-200">
                      信度{region.confidenceLevel}
                    </span>
                  </div>

                  {/* 当前激活子图层对应数值 */}
                  <div className="mt-1 text-xs font-bold text-[#1877F2]">{val.display}</div>
                  <div className="text-[10px] text-[#65676B] truncate mt-0.5">{val.subText}</div>
                </button>
              );
            })}
          </div>

          {/* 快捷对比与工具栏 */}
          <div className="mt-2 pt-1.5 border-t border-[#E4E6EB] flex items-center justify-between">
            <div className="text-[10px] text-[#65676B] flex items-center gap-1">
              <Info size={11} className="text-[#1877F2]" />
              <span>数据更新：2026-08-15 · 滚动社会调查抽样</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                id="cost-open-compare-btn"
                type="button"
                onClick={onOpenComparison}
                className="text-[11px] font-bold text-[#1877F2] bg-[#E7F3FF] hover:bg-[#DBEBFF] px-2 py-0.5 rounded-sm border border-[#1877F2]/30 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Scale size={11} />
                <span>横向对比 (2-4地)</span>
              </button>
              <button
                id="cost-open-budget-btn"
                type="button"
                onClick={onOpenBudget}
                className="text-[11px] font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] px-2 py-0.5 rounded-sm shadow-2xs border border-[#1877F2] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Compass size={11} />
                <span>测算我的预算</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 底部留空，保证不遮挡底层导航栏与比例尺 */}
      <div className="h-2" />
    </div>
  );
};
