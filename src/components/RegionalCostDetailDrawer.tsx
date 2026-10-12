import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  CircleDollarSign,
  TrendingUp,
  Home,
  Utensils,
  Zap,
  Bus,
  Wifi,
  HeartPulse,
  GraduationCap,
  Baby,
  Users,
  Scissors,
  Shirt,
  Film,
  Shield,
  Trees,
  Truck,
  Scale,
  Compass,
  AlertCircle,
  Calendar,
  Building2,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
} from 'lucide-react';
import {
  RegionalCostData,
  CostDimensionKey,
} from '../types';
import {
  REGIONAL_COST_DATABASE,
  PROTOTYPE_DEMO_TAG,
} from '../data/costOfLivingData';
import { costOfLivingStore } from '../data/costOfLivingStore';

interface RegionalCostDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  regionId: string;
  onOpenComparison: () => void;
  onOpenBudget: (regionId: string) => void;
  onOpenRelocation: (regionId: string) => void;
  reducedMotion?: boolean;
}

export const RegionalCostDetailDrawer: React.FC<RegionalCostDetailDrawerProps> = ({
  isOpen,
  onClose,
  regionId,
  onOpenComparison,
  onOpenBudget,
  onOpenRelocation,
  reducedMotion = false,
}) => {
  const region: RegionalCostData = REGIONAL_COST_DATABASE[regionId] || REGIONAL_COST_DATABASE.yuzhong;

  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'county_special'>('overview');
  const [expandedDimension, setExpandedDimension] = useState<CostDimensionKey | null>('housing');

  // 支持键盘 Escape 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getDimensionIcon = (key: CostDimensionKey) => {
    switch (key) {
      case 'housing':
        return Home;
      case 'food':
        return Utensils;
      case 'utilities':
        return Zap;
      case 'transportation':
        return Bus;
      case 'communications':
        return Wifi;
      case 'healthcare':
        return HeartPulse;
      case 'education':
        return GraduationCap;
      case 'childcare':
        return Baby;
      case 'elder_care':
        return Users;
      case 'daily_services':
        return Scissors;
      case 'clothing_home':
        return Shirt;
      case 'leisure_social':
        return Film;
      case 'employment_income':
        return TrendingUp;
      case 'taxes_social_security':
        return Shield;
      case 'environment_safety':
        return Trees;
      case 'relocation_overhead':
        return Truck;
      default:
        return CircleDollarSign;
    }
  };

  const isInComparison = costOfLivingStore.getState().comparisonRegionIds.includes(region.id);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto"
        />

        {/* 抽屉主容器 - Facebook直角线框风格 */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-2xl max-h-[86vh] bg-white rounded-t-xl border-t border-x border-[#E4E6EB] shadow-2xl flex flex-col pointer-events-auto overflow-hidden z-10"
        >
          {/* 顶栏控制条 */}
          <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                  region.level === 'county'
                    ? 'bg-emerald-100 text-emerald-800'
                    : region.level === 'city'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {region.level === 'county' ? '县级行政区' : region.level === 'city' ? '地级市' : '省级行政区'}
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black text-[#050505]">{region.name}</h2>
                  <span className="text-xs text-[#65676B]">生活成本综合档案</span>
                </div>
                <div className="text-[11px] text-[#65676B] flex items-center gap-1">
                  <span>{region.parentPath}</span>
                  <span>·</span>
                  <span>置信度等级 {region.confidenceLevel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-blue-50 text-[#1877F2] font-mono px-1.5 py-0.5 rounded-sm border border-blue-200">
                {PROTOTYPE_DEMO_TAG}
              </span>
              <button
                id="close-region-detail-btn"
                type="button"
                onClick={onClose}
                aria-label="关闭区域详情抽屉"
                className="w-8 h-8 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 若为无数据测试区，显示明确空状态 */}
          {!region.hasData ? (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-base font-bold text-[#050505] mb-1">暂无该区域生活成本数据</h3>
              <p className="text-xs text-[#65676B] max-w-md mb-4 leading-relaxed">
                {region.emptyStateReason || '该区县尚未完成定点生活成本社会调查采样。数据采编团队已列入下一季度抽样排期，暂不提供估测数值以防误导。'}
              </p>
              <div className="bg-[#F0F2F5] p-3 rounded-md border border-[#E4E6EB] text-left text-xs text-[#050505] max-w-md w-full">
                <div className="font-bold mb-1 text-[#1877F2]">欢迎本地居民与高校机构提供数据源：</div>
                <div className="text-[11px] text-[#65676B]">
                  可提交：当地主流房租范围、主要农贸市场菜价、公共交通票价及三甲医疗跨城转诊耗时等真实生活凭据。
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 标签栏 (概览 / 16项明细 / 县级特殊评估) */}
              <div className="flex items-center px-4 border-b border-[#E4E6EB] shrink-0 bg-[#F7F8FA] gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'overview'
                      ? 'border-[#1877F2] text-[#1877F2]'
                      : 'border-transparent text-[#65676B] hover:text-[#050505]'
                  }`}
                >
                  核心收支与画像
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('dimensions')}
                  className={`py-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'dimensions'
                      ? 'border-[#1877F2] text-[#1877F2]'
                      : 'border-transparent text-[#65676B] hover:text-[#050505]'
                  }`}
                >
                  16项成本维度明细
                </button>
                {region.level === 'county' && region.countyIndicators && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('county_special')}
                    className={`py-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                      activeTab === 'county_special'
                        ? 'border-[#1877F2] text-[#1877F2]'
                        : 'border-transparent text-[#65676B] hover:text-[#050505]'
                    }`}
                  >
                    县域特殊评估要素 ({region.name})
                  </button>
                )}
              </div>

              {/* 抽屉滑动内容主体 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'overview' && (
                  <>
                    {/* 综合收支核心卡片 (区间呈现，不给单一绝对值) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-[#F0F2F5] p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">月度基本开支</div>
                        <div className="text-sm font-black text-[#050505] mt-0.5">
                          ¥{region.monthlyBasicRange.low}–{region.monthlyBasicRange.high}
                        </div>
                        <div className="text-[9.5px] text-[#1877F2] mt-0.5">典型中位 ¥{region.monthlyBasicRange.typical}/月</div>
                      </div>

                      <div className="bg-[#F0F2F5] p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">全职税后薪资中位</div>
                        <div className="text-sm font-black text-[#050505] mt-0.5">
                          ¥{region.afterTaxIncomeRange.low}–{region.afterTaxIncomeRange.high}
                        </div>
                        <div className="text-[9.5px] text-emerald-600 mt-0.5">典型净得 ¥{region.afterTaxIncomeRange.typical}/月</div>
                      </div>

                      <div className="bg-[#F0F2F5] p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">预计每月可支配盈余</div>
                        <div className="text-sm font-black text-[#1877F2] mt-0.5">
                          ¥{region.disposableIncomeRange.low}–{region.disposableIncomeRange.high}
                        </div>
                        <div className="text-[9.5px] text-[#65676B] mt-0.5">住房负担比 {(region.housingBurdenRatio * 100).toFixed(0)}%</div>
                      </div>

                      <div className="bg-[#F0F2F5] p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">综合生活成本指数</div>
                        <div className="text-sm font-black text-purple-700 mt-0.5">
                          {region.overallCostIndex} <span className="text-[10px] font-normal text-[#65676B]">/ 100</span>
                        </div>
                        <div className="text-[9.5px] text-[#65676B] mt-0.5">就业机遇指数 {region.incomeOpportunityIndex}</div>
                      </div>
                    </div>

                    {/* 六大关键分项雷达评估 */}
                    <div className="bg-white p-3 rounded-md border border-[#E4E6EB]">
                      <div className="text-xs font-bold text-[#050505] mb-2 flex items-center justify-between">
                        <span>六大生活决策维度指数</span>
                        <span className="text-[10px] text-[#65676B]">满分 100 分</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                        <div className="bg-[#F7F8FA] p-2 rounded-sm border border-[#E4E6EB]">
                          <div className="text-[10px] text-[#65676B]">住房负担</div>
                          <div className="font-bold text-[#1877F2] mt-0.5">{((1 - region.housingBurdenRatio) * 100).toFixed(0)}分</div>
                        </div>
                        <div className="bg-[#F7F8FA] p-2 rounded-sm border border-[#E4E6EB]">
                          <div className="text-[10px] text-[#65676B]">就业机遇</div>
                          <div className="font-bold text-emerald-600 mt-0.5">{region.incomeOpportunityIndex}分</div>
                        </div>
                        <div className="bg-[#F7F8FA] p-2 rounded-sm border border-[#E4E6EB]">
                          <div className="text-[10px] text-[#65676B]">医疗保障</div>
                          <div className="font-bold text-rose-600 mt-0.5">{region.healthcareIndex}分</div>
                        </div>
                        <div className="bg-[#F7F8FA] p-2 rounded-sm border border-[#E4E6EB]">
                          <div className="text-[10px] text-[#65676B]">教育资源</div>
                          <div className="font-bold text-indigo-600 mt-0.5">{region.educationIndex}分</div>
                        </div>
                        <div className="bg-[#F7F8FA] p-2 rounded-sm border border-[#E4E6EB]">
                          <div className="text-[10px] text-[#65676B]">交通便利</div>
                          <div className="font-bold text-amber-600 mt-0.5">{region.transportIndex}分</div>
                        </div>
                        <div className="bg-[#F7F8FA] p-2 rounded-sm border border-[#E4E6EB]">
                          <div className="text-[10px] text-[#65676B]">生态环境</div>
                          <div className="font-bold text-teal-600 mt-0.5">{region.environmentIndex}分</div>
                        </div>
                      </div>
                    </div>

                    {/* 适合人群画像与优势/压力 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-md border border-[#E4E6EB]">
                        <div className="text-xs font-bold text-[#050505] mb-1.5 flex items-center gap-1">
                          <Check size={14} className="text-emerald-600" />
                          <span>适合居住群体画像</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {region.suitableProfiles.map((prof, idx) => (
                            <span
                              key={`suit-prof-${prof}-${idx}`}
                              className="text-[11px] bg-[#E7F3FF] text-[#1877F2] px-2 py-0.5 rounded-sm border border-[#1877F2]/20"
                            >
                              {prof}
                            </span>
                          ))}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#E4E6EB]">
                          <div className="text-[11px] font-bold text-[#050505] mb-1">主要比较优势：</div>
                          <ul className="text-[11px] text-[#65676B] space-y-1 list-disc list-inside">
                            {region.mainAdvantages.map((adv, idx) => (
                              <li key={`main-adv-${adv}-${idx}`}>{adv}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-md border border-[#E4E6EB]">
                        <div className="text-xs font-bold text-[#050505] mb-1.5 flex items-center gap-1">
                          <AlertCircle size={14} className="text-amber-600" />
                          <span>主要成本压力与生活短板</span>
                        </div>
                        <ul className="text-[11px] text-[#65676B] space-y-1.5 list-disc list-inside">
                          {region.mainCostPressures.map((press, idx) => (
                            <li key={`main-press-${press}-${idx}`}>{press}</li>
                          ))}
                        </ul>

                        {region.seasonalVariationWarning && (
                          <div className="mt-2 p-2 bg-amber-50 rounded-sm border border-amber-200 text-[10.5px] text-amber-800">
                            <strong>季节波动提示：</strong>
                            {region.seasonalVariationWarning}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 数据样本与置信度元数据 */}
                    <div className="bg-[#F7F8FA] p-2.5 rounded-md border border-[#E4E6EB] text-[11px] text-[#65676B] space-y-1">
                      <div className="flex items-center justify-between">
                        <span>数据采编样本：{region.sampleSize}</span>
                        <span>统计周期：{region.statisticalPeriod}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>数据源：{region.source}</span>
                        <span>最近更新：{region.updateDate}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* 16项成本维度明细 */}
                {activeTab === 'dimensions' && (
                  <div className="space-y-2">
                    <div className="text-xs text-[#65676B] px-1">
                      涵盖 16 个标准化开支维度，包含低、中位与高位开支区间及官方/抽样数据置信度评级：
                    </div>

                    {(Object.keys(region?.dimensions || {}) as CostDimensionKey[]).map((dimKey) => {
                      const dim = region?.dimensions?.[dimKey];
                      if (!dim) return null;
                      const Icon = getDimensionIcon(dimKey);
                      const isExpanded = expandedDimension === dimKey;

                      return (
                        <div
                          key={dimKey}
                          className="bg-white rounded-md border border-[#E4E6EB] overflow-hidden transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedDimension(isExpanded ? null : dimKey)}
                            className="w-full p-2.5 flex items-center justify-between hover:bg-[#F7F8FA] text-left cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-blue-50 text-[#1877F2] flex items-center justify-center">
                                <Icon size={14} />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-[#050505]">{dim.name}</span>
                                <span className="text-[10px] text-[#65676B] ml-2 font-mono">
                                  ¥{dim.monthlyRange.low}–{dim.monthlyRange.high} {dim.monthlyRange.unit}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-[#F0F2F5] text-[#65676B] px-1.5 py-0.5 rounded-xs font-mono">
                                信度{dim.confidence}
                              </span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-3 border-t border-[#E4E6EB] bg-[#F7F8FA] space-y-2">
                              <div className="text-[11px] text-[#050505] leading-relaxed">
                                {dim.summary}
                              </div>

                              <div className="bg-white rounded-sm border border-[#E4E6EB] divide-y divide-[#E4E6EB]">
                                {dim.items.map((item, idx) => (
                                  <div key={`dim-item-${dim.key}-${item.name}-${idx}`} className="p-2 flex items-center justify-between text-[11px]">
                                    <div>
                                      <span className="font-bold text-[#050505]">{item.name}</span>
                                      {item.note && (
                                        <span className="text-[10px] text-[#65676B] ml-1.5">({item.note})</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-[#1877F2]">
                                        ¥{item.range.low}–{item.range.high} {item.range.unit || ''}
                                      </span>
                                      <span className="text-[8.5px] bg-gray-100 text-gray-600 px-1 rounded-xs">
                                        信度{item.confidence}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="text-[10px] text-[#65676B] flex items-center justify-between pt-1">
                                <span>数据源: {dim.source}</span>
                                <span>更新时间: {dim.updateDate}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 县域特殊评估要素 (针对榆中县 / 都江堰市等县级行政区) */}
                {activeTab === 'county_special' && region.countyIndicators && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-2.5 rounded-md border border-blue-200 text-xs text-blue-900 leading-relaxed">
                      <strong>县域下沉指标体系：</strong>
                      针对县级市、县域独立经济体特别建立的15项长住与过渡评估指标，综合反映到地级市/省会核心区跨城通勤、三甲就医与养老适宜度。
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">到省会/地级市三甲医院耗时</div>
                        <div className="font-bold text-[#050505] mt-0.5">
                          {region.countyIndicators.travelTimeToHigherHospitals}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">通往地级市中心出行成本</div>
                        <div className="font-bold text-[#050505] mt-0.5">
                          {region.countyIndicators.costOfTravelingToCityCenter}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">当地租购房价格概况</div>
                        <div className="text-[#050505] mt-0.5">
                          {region.countyIndicators.rentAndHousePriceSummary}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">本地就业供给与产业结构</div>
                        <div className="text-[#050505] mt-0.5">
                          {region.countyIndicators.localJobAvailability}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">主导产业集聚方向</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {region.countyIndicators.industryConcentration.map((ind, i) => (
                            <span key={`ind-conc-${ind}-${i}`} className="text-[10px] bg-[#F0F2F5] px-1.5 py-0.2 rounded-xs">
                              {ind}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">外卖与家政快修覆盖度</div>
                        <div className="text-[#050505] mt-0.5">
                          {region.countyIndicators.deliveryAndHousekeepingCoverage}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">示范高中与高等教育辐射</div>
                        <div className="text-[#050505] mt-0.5">
                          {region.countyIndicators.highSchoolAndVocationalAccess}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">重大疾病转诊与特需医疗</div>
                        <div className="text-[#050505] mt-0.5">
                          {region.countyIndicators.outOfCountyMedicalForSevere}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">
                          银发养老适宜度得分：
                          <strong className="text-emerald-700 ml-1">
                            {region.countyIndicators.retirementSuitabilityScore}分
                          </strong>
                        </div>
                        <div className="text-[#65676B] mt-0.5 text-[11px]">
                          {region.countyIndicators.retirementSuitabilityNote}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-md border border-[#E4E6EB]">
                        <div className="text-[10px] text-[#65676B]">
                          远程办公/数字游民得分：
                          <strong className="text-[#1877F2] ml-1">
                            {region.countyIndicators.remoteWorkSuitabilityScore}分
                          </strong>
                        </div>
                        <div className="text-[#65676B] mt-0.5 text-[11px]">
                          {region.countyIndicators.remoteWorkSuitabilityNote}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 底部浮动操作栏 */}
              <div className="p-3 border-t border-[#E4E6EB] bg-white flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (isInComparison) {
                      costOfLivingStore.removeRegionFromComparison(region.id);
                    } else {
                      costOfLivingStore.addRegionToComparison(region.id);
                    }
                  }}
                  className={`px-3 py-2 rounded-md text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isInComparison
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-white text-[#050505] hover:bg-[#F0F2F5] border-[#E4E6EB]'
                  }`}
                >
                  <Scale size={14} />
                  <span>{isInComparison ? '已加入对比 (点击移除)' : '加入多地对比'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBudget(region.id);
                    }}
                    className="px-3 py-2 rounded-md text-xs font-bold text-[#1877F2] bg-[#E7F3FF] hover:bg-[#DBEBFF] border border-[#1877F2]/30 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CircleDollarSign size={14} />
                    <span>测算在此预算</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRelocation(region.id);
                    }}
                    className="px-3 py-2 rounded-md text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] shadow-2xs border border-[#1877F2] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Compass size={14} />
                    <span>制定定居规划</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
