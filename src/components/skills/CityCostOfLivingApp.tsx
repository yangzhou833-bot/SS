import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Scale,
  Calculator,
  Compass,
  Building2,
  MapPin,
  Sparkles,
  ArrowRightLeft,
  Copy,
  Download,
  Search,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Home,
  Utensils,
  Zap,
  Bus,
  HeartPulse,
  GraduationCap,
  Info,
  Check,
  RotateCcw,
  Sliders,
  DollarSign,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  ArrowUpRight,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Coffee,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { haptics } from '../../utils/haptics';
import {
  RegionalCostData,
  AdminLevel,
  CostDimensionKey,
  LifestylePresetKey,
  BudgetSimulatorInput,
  BudgetSimulatorOutput,
  RelocationPlan,
} from '../../types';
import {
  REGIONAL_COST_DATABASE,
  LIFESTYLE_PRESETS,
  calculateBudgetSimulation,
  generateRelocationPlan,
  PROTOTYPE_DEMO_TAG,
} from '../../data/costOfLivingData';
import { EightDimensionComparisonChart } from './EightDimensionComparisonChart';

export interface CityCostOfLivingAppProps {
  onClose: () => void;
  showToast?: (message: string) => void;
  initialTab?: 'comparison' | 'budget' | 'relocation' | 'profiles';
  initialRegionId?: string;
}

type TabKey = 'comparison' | 'budget' | 'relocation' | 'profiles';
type ComparisonLevelKey = 'national' | 'province' | 'city' | 'county';

export const CityCostOfLivingApp: React.FC<CityCostOfLivingAppProps> = ({
  onClose,
  showToast,
  initialTab = 'comparison',
  initialRegionId = 'lanzhou',
}) => {
  const REGIONAL_COST_LIST = useMemo(() => {
    const list = Object.values(REGIONAL_COST_DATABASE);
    const seen = new Set<string>();
    return list.filter((r) => {
      if (!r || !r.id || seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, []);

  // Helper for benchmark prices
  const getBenchmarkPrice = (
    reg: RegionalCostData,
    type: 'beef_noodle' | 'rent' | 'heating' | 'kindergarten' | 'taxi' | 'latte'
  ): number => {
    if (!reg || !reg.dimensions) return 0;
    if (type === 'rent') return reg.dimensions.housing?.monthlyRange?.typical || 1200;
    if (type === 'beef_noodle') {
      const item = reg.dimensions.food?.items?.find(
        (i) => i.name.includes('面') || i.name.includes('快餐') || i.name.includes('餐')
      );
      return item?.range?.typical || (reg.level === 'county' ? 10 : reg.level === 'city' ? 14 : 20);
    }
    if (type === 'heating') {
      const item = reg.dimensions.utilities?.items?.find(
        (i) => i.name.includes('暖') || i.name.includes('空调') || i.name.includes('能耗')
      );
      return (
        item?.range?.typical ||
        (reg.provinceName.includes('甘肃') || reg.provinceName.includes('黑龙江') || reg.provinceName.includes('北京')
          ? 380
          : 150)
      );
    }
    if (type === 'kindergarten') {
      const item = reg.dimensions.education?.items?.find(
        (i) => i.name.includes('幼') || i.name.includes('学前') || i.name.includes('公办')
      );
      return item?.range?.typical || (reg.level === 'county' ? 450 : 900);
    }
    if (type === 'taxi') {
      const item = reg.dimensions.transportation?.items?.find(
        (i) => i.name.includes('出租') || i.name.includes('打车')
      );
      return item?.range?.typical || (reg.level === 'county' ? 6 : 10);
    }
    if (type === 'latte') {
      return reg.overallCostIndex > 70 ? 32 : 25;
    }
    return 0;
  };

  // Navigation
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // --- TAB 1: COMPARISON STATE ---
  const [comparisonLevel, setComparisonLevel] = useState<ComparisonLevelKey>('city');
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([
    'lanzhou',
    'yuzhong',
    'chengdu',
  ]);
  const [lifestyleStandard, setLifestyleStandard] = useState<'basic' | 'moderate' | 'comfortable'>('moderate');
  const [salaryInput, setSalaryInput] = useState<number>(8500);

  // --- TAB 2: BUDGET SIMULATOR STATE ---
  const [budgetRegionId, setBudgetRegionId] = useState<string>(initialRegionId);
  const [budgetPreset, setBudgetPreset] = useState<LifestylePresetKey>('single_comfortable');
  const [activeQuickTier, setActiveQuickTier] = useState<'minimal' | 'standard' | 'quality' | null>('standard');
  const [householdSize, setHouseholdSize] = useState<number>(1);
  const [housingType, setHousingType] = useState<string>('rent_1bed');
  const [commuteType, setCommuteType] = useState<string>('public_transit');
  const [diningType, setDiningType] = useState<string>('half_half');
  const [hasChildEducation, setHasChildEducation] = useState<boolean>(false);
  const [educationType, setEducationType] = useState<string>('public_school');
  const [hasElderCare, setHasElderCare] = useState<boolean>(false);
  const [monthlyNetIncome, setMonthlyNetIncome] = useState<number>(8000);

  // --- TAB 3: RELOCATION PLANNER STATE ---
  const [relocationOriginName, setRelocationOriginName] = useState<string>('北京');
  const [relocationDestId, setRelocationDestId] = useState<string>('yuzhong');
  const [relocationIncome, setRelocationIncome] = useState<number>(9000);
  const [relocationHouseholdSize, setRelocationHouseholdSize] = useState<number>(2);

  // --- TAB 4: REGIONAL PROFILES STATE ---
  const [profileSearch, setProfileSearch] = useState<string>('');
  const [profileLevelFilter, setProfileLevelFilter] = useState<'all' | 'macro' | 'province' | 'city' | 'county'>('all');
  const [detailModalRegionId, setDetailModalRegionId] = useState<string | null>(null);

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
  };

  // Switch Tab Handler
  const handleTabChange = (tab: TabKey) => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    setActiveTab(tab);
  };

  // -------------------------------------------------------------
  // TAB 1 COMPUTATIONS: Multi-Region Comparison
  // -------------------------------------------------------------
  const filteredRegionsByLevel = useMemo(() => {
    if (comparisonLevel === 'national') {
      return REGIONAL_COST_LIST.filter((r) => r.level === 'national' || r.level === 'macro');
    }
    if (comparisonLevel === 'province') {
      return REGIONAL_COST_LIST.filter((r) => r.level === 'province');
    }
    if (comparisonLevel === 'county') {
      return REGIONAL_COST_LIST.filter((r) => r.level === 'county');
    }
    return REGIONAL_COST_LIST.filter((r) => r.level === 'city');
  }, [comparisonLevel, REGIONAL_COST_LIST]);

  const selectedRegionsData: RegionalCostData[] = useMemo(() => {
    return selectedRegionIds
      .map((id) => REGIONAL_COST_DATABASE[id])
      .filter(Boolean);
  }, [selectedRegionIds]);

  const baseRegion = selectedRegionsData[0] || REGIONAL_COST_DATABASE['lanzhou'];

  const handleAddRegion = (id: string) => {
    if (selectedRegionIds.includes(id)) {
      notify('该区域已在对比列表中');
      return;
    }
    if (selectedRegionIds.length >= 4) {
      notify('最多支持4个区域同时横向对比');
      return;
    }
    haptics.trigger('medium');
    soundEffects.playTapSound();
    setSelectedRegionIds([...selectedRegionIds, id]);
  };

  const handleRemoveRegion = (id: string) => {
    if (selectedRegionIds.length <= 1) {
      notify('至少保留一个对比区域');
      return;
    }
    haptics.trigger('light');
    soundEffects.playTapSound();
    setSelectedRegionIds(selectedRegionIds.filter((item) => item !== id));
  };

  const handleSwapBase = () => {
    if (selectedRegionIds.length < 2) return;
    haptics.trigger('medium');
    soundEffects.playTapSound();
    const rotated = [...selectedRegionIds.slice(1), selectedRegionIds[0]];
    setSelectedRegionIds(rotated);
    notify(`🔄 已将「${REGIONAL_COST_DATABASE[rotated[0]]?.name}」设为参照基准`);
  };

  const handleCopyComparisonReport = () => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    if (!baseRegion) return;

    let report = `【生活成本多级对比与薪酬平价精算报告】\n`;
    report += `基准参照：${baseRegion.name} (${baseRegion.provinceName}) | 综合指数：${baseRegion.overallCostIndex}\n`;
    report += `基准月薪输入：¥${salaryInput} 元/月\n`;
    report += `对比对象列表：\n`;

    selectedRegionsData.slice(1).forEach((target) => {
      const ratio = target.overallCostIndex / Math.max(1, baseRegion.overallCostIndex);
      const eqSalary = Math.round(salaryInput * ratio);
      const diffPct = Math.round(
        ((target.overallCostIndex - baseRegion.overallCostIndex) / baseRegion.overallCostIndex) * 100
      );
      report += `• 【${target.name} (${target.provinceName})】: 成本相差 ${diffPct >= 0 ? '+' : ''}${diffPct}% | 维持同等生活品质所需平价薪资：¥${eqSalary} 元/月\n`;
    });

    report += `\n数据来源：国家统计局、发改委物价监测中心及实地民生采样。\n`;
    navigator.clipboard.writeText(report);
    notify('📋 对比报告已成功复制到剪贴板！');
  };

  const handleExportCSV = () => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    let csv = `区域名称,省份/所属,层级,综合成本指数,房租典型值,交通指数,医疗指数,教育指数,宜居指数,一居整租中位数,牛肉面/快餐均价,冬季取暖能耗\n`;
    selectedRegionsData.forEach((r) => {
      const rent = r.dimensions.housing?.monthlyRange?.typical || 1200;
      const beef = getBenchmarkPrice(r, 'beef_noodle');
      const heating = getBenchmarkPrice(r, 'heating');
      csv += `"${r.name}","${r.provinceName}","${r.level}",${r.overallCostIndex},${rent},${r.transportIndex},${r.healthcareIndex},${r.educationIndex},${r.livabilityIndex},${rent},${beef},${heating}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `生活成本对比精算表_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('📥 对比数据 CSV 文件已生成导出');
  };

  // -------------------------------------------------------------
  // TAB 2 COMPUTATIONS: Budget Simulator
  // -------------------------------------------------------------
  const budgetRegion = REGIONAL_COST_DATABASE[budgetRegionId] || REGIONAL_COST_DATABASE['lanzhou'];

  const budgetInput: BudgetSimulatorInput = useMemo(() => {
    return {
      regionId: budgetRegionId,
      householdSize,
      housingType,
      commuteType,
      diningType,
      monthlyNetIncome,
      hasChildEducation,
      educationType,
      hasElderCare,
      preset: budgetPreset,
    };
  }, [
    budgetRegionId,
    householdSize,
    housingType,
    commuteType,
    diningType,
    monthlyNetIncome,
    hasChildEducation,
    educationType,
    hasElderCare,
    budgetPreset,
  ]);

  const budgetOutput: BudgetSimulatorOutput = useMemo(() => {
    return calculateBudgetSimulation(budgetRegion, budgetInput);
  }, [budgetRegion, budgetInput]);

  const handleSelectPreset = (key: LifestylePresetKey) => {
    const p = LIFESTYLE_PRESETS[key];
    if (!p) return;
    haptics.trigger('light');
    soundEffects.playTapSound();
    setBudgetPreset(key);
    setActiveQuickTier(null);
    setHouseholdSize(p.householdSize);
    setHousingType(p.housingType);
    setCommuteType(p.commuteType);
    setDiningType(p.diningType);
    setHasChildEducation(p.hasChildEducation);
    setEducationType(p.educationType);
    setHasElderCare(p.hasElderCare);
    setMonthlyNetIncome(p.defaultIncome);
    notify(`✨ 已切换为「${p.name}」模型`);
  };

  const handleQuickTierChange = (tier: 'minimal' | 'standard' | 'quality') => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    setActiveQuickTier(tier);
    if (tier === 'minimal') {
      setHousingType('rent_shared');
      setDiningType('cook_mostly');
      setCommuteType('walk_bike');
      setHouseholdSize(1);
      setHasChildEducation(false);
      setEducationType('public_school');
      setHasElderCare(false);
      setMonthlyNetIncome(4500);
      setBudgetPreset('single_tight');
      notify('⚡ 已切换至「极简模式」：合租单间 + 自炊节流 + 步行骑行');
    } else if (tier === 'standard') {
      setHousingType('rent_1bed');
      setDiningType('half_half');
      setCommuteType('public_transit');
      setHouseholdSize(1);
      setHasChildEducation(false);
      setEducationType('public_school');
      setHasElderCare(false);
      setMonthlyNetIncome(8000);
      setBudgetPreset('single_comfortable');
      notify('⚡ 已切换至「标准模式」：整租一居 + 外卖自炊各半 + 公交地铁');
    } else if (tier === 'quality') {
      setHousingType('rent_2bed');
      setDiningType('dine_out_often');
      setCommuteType('private_car');
      setHouseholdSize(2);
      setHasChildEducation(false);
      setEducationType('bilingual_private');
      setHasElderCare(true);
      setMonthlyNetIncome(15000);
      setBudgetPreset('couple_high');
      notify('⚡ 已切换至「品质模式」：品质两居 + 高频堂食聚餐 + 私车出行 + 长辈照护');
    }
  };

  // -------------------------------------------------------------
  // TAB 3 COMPUTATIONS: Relocation Planner
  // -------------------------------------------------------------
  const relocationDest =
    REGIONAL_COST_DATABASE[relocationDestId] ||
    REGIONAL_COST_DATABASE['yuzhong'] ||
    REGIONAL_COST_DATABASE['lanzhou'];

  const relocationPlan: RelocationPlan = useMemo(() => {
    return generateRelocationPlan({
      destinationRegion: relocationDest,
      originRegionName: relocationOriginName,
      monthlyIncome: relocationIncome,
      householdSize: relocationHouseholdSize,
    });
  }, [relocationDest, relocationOriginName, relocationIncome, relocationHouseholdSize]);

  // -------------------------------------------------------------
  // TAB 4 COMPUTATIONS: Regional Profiles
  // -------------------------------------------------------------
  const filteredProfiles = useMemo(() => {
    return REGIONAL_COST_LIST.filter((r) => {
      const matchSearch =
        !profileSearch ||
        r.name.includes(profileSearch) ||
        r.provinceName?.includes(profileSearch) ||
        r.cityName?.includes(profileSearch);
      const matchLevel =
        profileLevelFilter === 'all' ||
        (profileLevelFilter === 'macro' && (r.level === 'national' || r.level === 'macro')) ||
        (profileLevelFilter === 'province' && r.level === 'province') ||
        (profileLevelFilter === 'city' && r.level === 'city') ||
        (profileLevelFilter === 'county' && r.level === 'county');
      return matchSearch && matchLevel;
    });
  }, [profileSearch, profileLevelFilter, REGIONAL_COST_LIST]);

  const detailRegion = detailModalRegionId ? REGIONAL_COST_DATABASE[detailModalRegionId] : null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#F2F2F7] dark:bg-[#000000] text-[#1C1C1E] dark:text-[#F2F2F7] flex flex-col overflow-hidden font-sans select-none animate-in fade-in duration-200">
      {/* 1. TOP HEADER (Apple Frosted Glass Navigation Bar) */}
      <header className="backdrop-blur-2xl bg-white/80 dark:bg-[#1C1C1E]/80 border-b border-black/5 dark:border-white/10 px-3.5 sm:px-5 py-2.5 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
        <button
          onClick={() => {
            haptics.trigger('light');
            soundEffects.playTapSound();
            onClose();
          }}
          className="flex items-center gap-1.5 text-[#007AFF] font-semibold text-[14px] hover:opacity-80 active:scale-95 px-2.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 cursor-pointer transition-all"
          title="返回"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          <span>返回</span>
        </button>

        <div className="flex flex-col items-center text-center px-1">
          <div className="flex items-center gap-1.5">
            <Scale size={16} className="text-[#007AFF]" />
            <h2 className="text-[15px] font-bold tracking-tight text-[#1C1C1E] dark:text-white leading-tight">
              城市生活成本与多级对比精算中枢
            </h2>
          </div>
          <span className="text-[11px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
            全国 / 省 / 市 / 区县四级对比 · 预算模拟 · 跨城定居规划
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyComparisonReport}
            className="px-3 py-1.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#007AFF] font-semibold text-[12px] rounded-full flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title="复制报告"
          >
            <Copy size={13} />
            <span className="hidden sm:inline">复制报告</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#007AFF] font-semibold text-[12px] rounded-full flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title="导出 CSV 表格"
          >
            <Download size={13} />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </header>

      {/* 2. TAB NAVIGATION (Apple Segmented Control Bar) */}
      <div className="px-3 sm:px-5 py-2 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shrink-0">
        <div className="max-w-4xl mx-auto">
          <nav className="p-1 bg-[#767680]/12 dark:bg-[#767680]/24 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { key: 'comparison', label: '多地生活成本对比', icon: Scale },
              { key: 'budget', label: '预算模拟精算器', icon: Calculator },
              { key: 'relocation', label: '跨城定居规划', icon: Compass },
              { key: 'profiles', label: '区域成本档案库', icon: Building2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key as TabKey)}
                  className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-xl font-semibold text-[12.5px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#636366] text-[#1C1C1E] dark:text-white shadow-xs'
                      : 'text-[#8E8E93] hover:text-[#1C1E21] dark:hover:text-white'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[#007AFF] dark:text-white' : ''} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. SCROLLABLE MAIN BODY (Apple System Grouped Canvas) */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 max-w-6xl mx-auto w-full pb-24">
        
        {/* =========================================================
            TAB 1: MULTI-REGION COST COMPARISON
           ========================================================= */}
        {activeTab === 'comparison' && (
          <div className="space-y-4">
            {/* Apple Filter & Level Switcher Inset Card */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/10 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#8E8E93] flex items-center gap-1">
                    <Layers size={14} className="text-[#007AFF]" />
                    <span>对比级别：</span>
                  </span>
                  <div className="p-0.5 bg-[#767680]/12 dark:bg-[#767680]/24 rounded-xl flex items-center gap-0.5">
                    {(
                      [
                        { key: 'national', label: '全国宏观' },
                        { key: 'province', label: '重点省份' },
                        { key: 'city', label: '中心城市' },
                        { key: 'county', label: '区县下沉' },
                      ] as const
                    ).map((lvl) => (
                      <button
                        key={lvl.key}
                        onClick={() => {
                          haptics.trigger('light');
                          setComparisonLevel(lvl.key);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                          comparisonLevel === lvl.key
                            ? 'bg-white dark:bg-[#636366] text-[#007AFF] dark:text-white shadow-xs'
                            : 'text-[#8E8E93] hover:text-[#1C1E21] dark:hover:text-white'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Swap Base Button */}
                {selectedRegionsData.length >= 2 && (
                  <button
                    onClick={handleSwapBase}
                    className="px-3 py-1.5 bg-[#007AFF]/10 hover:bg-[#007AFF]/15 text-[#007AFF] font-semibold text-[12px] rounded-full flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <ArrowRightLeft size={13} />
                    <span>轮换基准城市</span>
                  </button>
                )}
              </div>

              {/* Selected Region Chips & Quick Add Selector (Apple Pills) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#8E8E93] font-medium">
                    当前对比池（首位为基准，支持 2-4 地同屏）：
                  </span>
                  <span className="text-[11px] text-[#8E8E93] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                    {selectedRegionsData.length}/4 地
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedRegionsData.map((reg, idx) => (
                    <div
                      key={reg.id}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xs transition-all ${
                        idx === 0
                          ? 'bg-[#007AFF] text-white'
                          : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white border border-black/5 dark:border-white/10'
                      }`}
                    >
                      {idx === 0 && (
                        <span className="text-[10px] font-black bg-white/20 text-white px-1.5 py-0.2 rounded-full">
                          基准
                        </span>
                      )}
                      <span className="font-semibold text-[13px]">{reg.name}</span>
                      <span className="text-[11px] opacity-75">({reg.provinceName})</span>
                      <button
                        onClick={() => handleRemoveRegion(reg.id)}
                        className="opacity-70 hover:opacity-100 p-0.5 rounded-full transition-opacity cursor-pointer"
                        title="移除"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {/* Add Region Selector Dropdown */}
                  {selectedRegionsData.length < 4 && (
                    <div className="flex items-center">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddRegion(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 text-[12px] text-[#007AFF] font-semibold px-3 py-1.5 rounded-full shadow-xs cursor-pointer outline-hidden hover:bg-[#E5E5EA] transition-colors"
                      >
                        <option value="" disabled>
                          + 添加对比城市或区县...
                        </option>
                        {filteredRegionsByLevel.map((r, rIdx) => (
                          <option key={`reg-opt-${r.id}-${rIdx}`} value={r.id} disabled={selectedRegionIds.includes(r.id)}>
                            {r.name} ({r.provinceName} · {r.level === 'county' ? '区县' : r.level === 'city' ? '城市' : '省市'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Benchmark Salary Input & Living Standard Tabs */}
              <div className="pt-3 border-t border-black/5 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
                <div className="flex items-center gap-2.5">
                  <span className="text-[12px] font-semibold text-[#8E8E93] shrink-0">基准税后月薪：</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#8E8E93] font-bold">¥</span>
                    <input
                      type="number"
                      step={500}
                      value={salaryInput}
                      onChange={(e) => setSalaryInput(Math.max(1000, Number(e.target.value) || 1000))}
                      className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl pl-7 pr-3 py-1.5 text-[13px] font-bold text-[#1C1C1E] dark:text-white focus:ring-2 focus:ring-[#007AFF]/30 outline-hidden"
                    />
                  </div>
                  <span className="text-[11px] text-[#8E8E93] shrink-0">元/月</span>
                </div>

                <div className="flex items-center gap-2 justify-start sm:justify-end">
                  <span className="text-[12px] font-semibold text-[#8E8E93]">生活档次偏好：</span>
                  <div className="p-0.5 bg-[#767680]/12 dark:bg-[#767680]/24 rounded-xl flex items-center gap-0.5">
                    {(
                      [
                        { key: 'basic', label: '基础紧凑' },
                        { key: 'moderate', label: '适度温饱' },
                        { key: 'comfortable', label: '品质小康' },
                      ] as const
                    ).map((std) => (
                      <button
                        key={std.key}
                        onClick={() => setLifestyleStandard(std.key)}
                        className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                          lifestyleStandard === std.key
                            ? 'bg-white dark:bg-[#636366] text-[#007AFF] dark:text-white shadow-xs'
                            : 'text-[#8E8E93] hover:text-[#1C1E21] dark:hover:text-white'
                        }`}
                      >
                        {std.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Core KPI Cards Comparison (Apple Inset Widget Cards) */}
            <div className={`grid grid-cols-1 md:grid-cols-${selectedRegionsData.length} gap-3.5`}>
              {selectedRegionsData.map((reg, idx) => {
                const isBase = idx === 0;
                const costRatio = reg.overallCostIndex / Math.max(1, baseRegion.overallCostIndex);
                const equivalentSalary = Math.round(salaryInput * costRatio);
                const diffPct = Math.round(
                  ((reg.overallCostIndex - baseRegion.overallCostIndex) / baseRegion.overallCostIndex) * 100
                );
                const rentTypical = reg.dimensions.housing?.monthlyRange?.typical || 1200;
                const beefPrice = getBenchmarkPrice(reg, 'beef_noodle');
                const heatingPrice = getBenchmarkPrice(reg, 'heating');

                return (
                  <div
                    key={reg.id}
                    className={`bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 shadow-xs border transition-all space-y-3.5 ${
                      isBase
                        ? 'border-[#007AFF]/40 ring-2 ring-[#007AFF]/20'
                        : 'border-black/5 dark:border-white/10'
                    }`}
                  >
                    {/* Header Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isBase ? 'bg-[#007AFF]/15 text-[#007AFF]' : 'bg-black/5 text-[#8E8E93]'}`}>
                          <MapPin size={16} />
                        </div>
                        <div>
                          <h3 className="font-bold text-[15px] tracking-tight text-[#1C1C1E] dark:text-white">{reg.name}</h3>
                          <span className="text-[11px] text-[#8E8E93]">
                            {reg.provinceName} · {reg.level === 'county' ? '区县' : reg.level === 'city' ? '城市' : '省市'}
                          </span>
                        </div>
                      </div>
                      {isBase ? (
                        <span className="text-[11px] font-semibold text-[#007AFF] bg-[#007AFF]/10 px-2.5 py-1 rounded-full">
                          基准参照
                        </span>
                      ) : (
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                            diffPct > 0
                              ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                              : diffPct < 0
                              ? 'bg-[#34C759]/10 text-[#34C759]'
                              : 'bg-black/5 text-[#8E8E93]'
                          }`}
                        >
                          {diffPct > 0 ? <TrendingUp size={12} /> : diffPct < 0 ? <TrendingDown size={12} /> : null}
                          <span>{diffPct >= 0 ? `+${diffPct}%` : `${diffPct}%`}</span>
                        </span>
                      )}
                    </div>

                    {/* Cost Index & Equivalent Salary (Apple Inset Metric Tiles) */}
                    <div className="grid grid-cols-2 gap-2 bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 rounded-xl text-center">
                      <div>
                        <div className="text-[11px] text-[#8E8E93] font-medium">综合成本指数</div>
                        <div className="text-[18px] font-bold tracking-tight text-[#1C1C1E] dark:text-white mt-0.5">
                          {reg.overallCostIndex} <span className="text-[11px] font-normal text-[#8E8E93]">/ 100</span>
                        </div>
                      </div>
                      <div className="border-l border-black/5 dark:border-white/10 pl-2">
                        <div className="text-[11px] text-[#8E8E93] font-medium">等效平价月薪</div>
                        <div className="text-[18px] font-bold tracking-tight text-[#007AFF] mt-0.5">
                          ¥{equivalentSalary.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Quick Metric Stats with Apple Rounded Icons */}
                    <div className="space-y-2 text-[12px]">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#F9F9FB] dark:bg-[#242426]">
                        <span className="text-[#8E8E93] flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                            <Home size={11} />
                          </div>
                          一居整租中位
                        </span>
                        <span className="font-semibold text-[#1C1C1E] dark:text-white">
                          ¥{rentTypical} <span className="font-normal text-[10px] text-[#8E8E93]">元/月</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#F9F9FB] dark:bg-[#242426]">
                        <span className="text-[#8E8E93] flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center">
                            <Utensils size={11} />
                          </div>
                          牛肉面/快餐单餐
                        </span>
                        <span className="font-semibold text-[#1C1C1E] dark:text-white">¥{beefPrice} 元</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#F9F9FB] dark:bg-[#242426]">
                        <span className="text-[#8E8E93] flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-[#AF52DE]/10 text-[#AF52DE] flex items-center justify-center">
                            <Zap size={11} />
                          </div>
                          冬季暖气/冷暖能耗
                        </span>
                        <span className="font-semibold text-[#1C1C1E] dark:text-white">¥{heatingPrice} 元/月</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#F9F9FB] dark:bg-[#242426]">
                        <span className="text-[#8E8E93] flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-[#30B0C7]/10 text-[#30B0C7] flex items-center justify-center">
                            <Sparkles size={11} />
                          </div>
                          宜居总评
                        </span>
                        <span className="font-bold text-[#007AFF]">{reg.livabilityIndex} 分</span>
                      </div>
                    </div>

                    {/* Action Links (Apple Button Style) */}
                    <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setBudgetRegionId(reg.id);
                          handleTabChange('budget');
                          notify(`🧮 已将「${reg.name}」载入预算精算器`);
                        }}
                        className="flex-1 py-2 bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] text-[#007AFF] font-semibold text-[12px] rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                      >
                        测算预算
                      </button>
                      <button
                        onClick={() => {
                          setRelocationDestId(reg.id);
                          handleTabChange('relocation');
                          notify(`🧭 已将「${reg.name}」载入跨城定居规划`);
                        }}
                        className="flex-1 py-2 bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold text-[12px] rounded-xl transition-all active:scale-95 cursor-pointer text-center shadow-xs"
                      >
                        定居规划
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 8-Dimensional Radar & Dynamic Bar Comparison Chart */}
            <EightDimensionComparisonChart
              selectedRegions={selectedRegionsData}
              baseRegion={baseRegion}
              lifestyleStandard={lifestyleStandard}
            />

            {/* Granular Benchmark Price Table (Apple Inset Table) */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/10 space-y-3 overflow-x-auto">
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-[14px] text-[#1C1C1E] dark:text-white">
                      关键民生标杆实测单价对照
                    </span>
                    <p className="text-[11px] text-[#8E8E93]">基于居民一线采价与官方物价监测</p>
                  </div>
                </div>
              </div>

              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/10 text-[#8E8E93]">
                    <th className="py-2.5 pr-4 font-semibold">实测商品 / 服务类别</th>
                    {selectedRegionsData.map((r) => (
                      <th key={r.id} className="py-2.5 px-3 font-semibold text-[#1C1C1E] dark:text-white">
                        {r.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  <tr>
                    <td className="py-2.5 pr-4 text-[#8E8E93] flex items-center gap-1.5">
                      <Home size={13} className="text-[#007AFF]" />
                      <span>一居室整租均价</span>
                    </td>
                    {selectedRegionsData.map((r) => (
                      <td key={r.id} className="py-2.5 px-3 font-semibold text-[#1C1C1E] dark:text-white">
                        ¥{r.dimensions.housing?.monthlyRange?.typical || 1200} 元/月
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-[#8E8E93] flex items-center gap-1.5">
                      <Utensils size={13} className="text-[#FF9500]" />
                      <span>兰州牛肉面 / 快餐单餐</span>
                    </td>
                    {selectedRegionsData.map((r) => (
                      <td key={r.id} className="py-2.5 px-3 font-semibold text-[#1C1C1E] dark:text-white">
                        ¥{getBenchmarkPrice(r, 'beef_noodle')} 元/碗
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-[#8E8E93] flex items-center gap-1.5">
                      <Zap size={13} className="text-[#AF52DE]" />
                      <span>冬季集中供暖 / 能耗支出</span>
                    </td>
                    {selectedRegionsData.map((r) => (
                      <td key={r.id} className="py-2.5 px-3 font-semibold text-[#1C1C1E] dark:text-white">
                        ¥{getBenchmarkPrice(r, 'heating')} 元/月
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-[#8E8E93] flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-[#34C759]" />
                      <span>公立托幼 / 学前教育</span>
                    </td>
                    {selectedRegionsData.map((r) => (
                      <td key={r.id} className="py-2.5 px-3 font-semibold text-[#1C1C1E] dark:text-white">
                        ¥{getBenchmarkPrice(r, 'kindergarten')} 元/月
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-[#8E8E93] flex items-center gap-1.5">
                      <Bus size={13} className="text-[#5856D6]" />
                      <span>打车起步价 (3公里)</span>
                    </td>
                    {selectedRegionsData.map((r) => (
                      <td key={r.id} className="py-2.5 px-3 font-semibold text-[#1C1C1E] dark:text-white">
                        ¥{getBenchmarkPrice(r, 'taxi')} 元
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-[#8E8E93] flex items-center gap-1.5">
                      <Coffee size={13} className="text-[#FF2D55]" />
                      <span>星巴克大杯拿铁标价</span>
                    </td>
                    {selectedRegionsData.map((r) => (
                      <td key={r.id} className="py-2.5 px-3 font-semibold text-[#1C1C1E] dark:text-white">
                        ¥{getBenchmarkPrice(r, 'latte')} 元
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: BUDGET SIMULATOR (Apple Wallet / Fitness aesthetic)
           ========================================================= */}
        {activeTab === 'budget' && (
          <div className="space-y-4">
            {/* Target Region & Lifestyle Presets Inset Card */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <span className="text-[14px] font-semibold text-[#1C1C1E] dark:text-white">
                      预算测算目标区域
                    </span>
                    <p className="text-[12px] text-[#8E8E93]">选择您希望进行收支测算的城市或区县</p>
                  </div>
                </div>

                <select
                  value={budgetRegionId}
                  onChange={(e) => {
                    haptics.trigger('light');
                    setBudgetRegionId(e.target.value);
                  }}
                  className="bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 font-semibold text-[13px] text-[#007AFF] px-3 py-1.5 rounded-full cursor-pointer outline-hidden"
                >
                  {REGIONAL_COST_LIST.map((r, rIdx) => (
                    <option key={`budget-opt-${r.id}-${rIdx}`} value={r.id}>
                      {r.name} ({r.provinceName} · {r.level === 'county' ? '区县' : r.level === 'city' ? '城市' : '省市'})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3 Main Tiers (Apple Card Toggles) */}
              <div className="space-y-2.5">
                <span className="text-[12px] font-semibold text-[#8E8E93] flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-[#007AFF]" />
                  <span>生活模式快速一键调整：</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: 'minimal', title: '极简模式', emoji: '🌱', desc: '合租单间 · 自炊节流 · 步行单车', budget: '¥4.5k' },
                    { key: 'standard', title: '标准模式', emoji: '⚖️', desc: '整租一居 · 平价外卖各半 · 公交地铁', budget: '¥8.0k' },
                    { key: 'quality', title: '品质模式', emoji: '✨', desc: '两居品质 · 堂食咖啡 · 私家车+长辈', budget: '¥15k' },
                  ].map((tier) => {
                    const isSelected = activeQuickTier === tier.key;
                    return (
                      <button
                        key={tier.key}
                        type="button"
                        onClick={() => handleQuickTierChange(tier.key as any)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-xs flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-[#007AFF]/10 border-[#007AFF] ring-2 ring-[#007AFF]/20 text-[#1C1C1E] dark:text-white'
                            : 'bg-[#F9F9FB] dark:bg-[#242426] border-black/5 dark:border-white/5 hover:bg-[#F2F2F7] text-[#1C1E21] dark:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[14px]">
                            {tier.emoji} {tier.title}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#007AFF] text-white' : 'bg-black/5 text-[#8E8E93]'}`}>
                            {tier.budget}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[#8E8E93] leading-tight">
                          {tier.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Parameter Inputs (Apple Inset Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-black/5 dark:border-white/10">
                {/* Net Income */}
                <div className="bg-[#F9F9FB] dark:bg-[#242426] p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-2">
                  <label className="text-[12px] text-[#8E8E93] font-semibold flex items-center gap-1.5">
                    <DollarSign size={13} className="text-[#007AFF]" />
                    <span>税后月净收入</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8E8E93] font-bold">¥</span>
                    <input
                      type="number"
                      step={500}
                      value={monthlyNetIncome}
                      onChange={(e) => {
                        setActiveQuickTier(null);
                        setMonthlyNetIncome(Math.max(0, Number(e.target.value) || 0));
                      }}
                      className="w-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-lg pl-6 pr-3 py-1.5 text-[13px] font-bold text-[#1C1C1E] dark:text-white outline-hidden focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                  <div className="flex items-center gap-1 pt-0.5">
                    {[4500, 8000, 15000, 25000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          haptics.trigger('light');
                          setActiveQuickTier(null);
                          setMonthlyNetIncome(val);
                        }}
                        className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                          monthlyNetIncome === val
                            ? 'bg-[#007AFF] text-white'
                            : 'bg-black/5 text-[#8E8E93] hover:bg-black/10'
                        }`}
                      >
                        {val >= 10000 ? `${val / 1000}k` : `${val / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Household Size */}
                <div className="bg-[#F9F9FB] dark:bg-[#242426] p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-2">
                  <label className="text-[12px] text-[#8E8E93] font-semibold flex items-center gap-1.5">
                    <Building2 size={13} className="text-[#34C759]" />
                    <span>常住家庭人口</span>
                  </label>
                  <select
                    value={householdSize}
                    onChange={(e) => {
                      setActiveQuickTier(null);
                      setHouseholdSize(Number(e.target.value));
                    }}
                    className="w-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[#1C1C1E] dark:text-white outline-hidden cursor-pointer"
                  >
                    <option value={1}>1 人（单身独居）</option>
                    <option value={2}>2 人（夫妻/情侣）</option>
                    <option value={3}>3 人（三口之家）</option>
                    <option value={4}>4 人（二胎/四口）</option>
                    <option value={5}>5 人（三代同堂）</option>
                  </select>
                </div>

                {/* Housing Type */}
                <div className="bg-[#F9F9FB] dark:bg-[#242426] p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-2">
                  <label className="text-[12px] text-[#8E8E93] font-semibold flex items-center gap-1.5">
                    <Home size={13} className="text-[#007AFF]" />
                    <span>房屋/居住偏好</span>
                  </label>
                  <select
                    value={housingType}
                    onChange={(e) => {
                      setActiveQuickTier(null);
                      setHousingType(e.target.value);
                    }}
                    className="w-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[#1C1C1E] dark:text-white outline-hidden cursor-pointer"
                  >
                    <option value="rent_shared">合租单间 / 步梯开间</option>
                    <option value="rent_1bed">整租一居室 (标准套房)</option>
                    <option value="rent_2bed">整租两居室 (品质居家)</option>
                    <option value="rent_3bed">整租三居室 (宽敞家庭)</option>
                    <option value="own_paid_off">自有全款住房 (仅物业水电)</option>
                    <option value="own_mortgage">自住商品房 (含按揭月供)</option>
                  </select>
                </div>

                {/* Commute Type */}
                <div className="bg-[#F9F9FB] dark:bg-[#242426] p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-2">
                  <label className="text-[12px] text-[#8E8E93] font-semibold flex items-center gap-1.5">
                    <Bus size={13} className="text-[#5856D6]" />
                    <span>日常通勤方式</span>
                  </label>
                  <select
                    value={commuteType}
                    onChange={(e) => {
                      setActiveQuickTier(null);
                      setCommuteType(e.target.value);
                    }}
                    className="w-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[#1C1C1E] dark:text-white outline-hidden cursor-pointer"
                  >
                    <option value="walk_bike">步行 / 自行车 / 共享单车</option>
                    <option value="public_transit">地铁 + 公交主力出行</option>
                    <option value="private_car">私家燃油车 / 新能源车</option>
                    <option value="intercity_train">跨市城际高铁通勤</option>
                  </select>
                </div>

                {/* Dining Type */}
                <div className="bg-[#F9F9FB] dark:bg-[#242426] p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-2">
                  <label className="text-[12px] text-[#8E8E93] font-semibold flex items-center gap-1.5">
                    <Utensils size={13} className="text-[#FF9500]" />
                    <span>就餐与餐饮类型</span>
                  </label>
                  <select
                    value={diningType}
                    onChange={(e) => {
                      setActiveQuickTier(null);
                      setDiningType(e.target.value);
                    }}
                    className="w-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[#1C1C1E] dark:text-white outline-hidden cursor-pointer"
                  >
                    <option value="cook_mostly">买菜自炊为主 (健康节流)</option>
                    <option value="half_half">自炊与平价外卖各半</option>
                    <option value="dine_out_often">高频堂食聚餐与精品咖啡</option>
                  </select>
                </div>

                {/* Elder Care */}
                <div className="bg-[#F9F9FB] dark:bg-[#242426] p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-2">
                  <label className="text-[12px] text-[#8E8E93] font-semibold flex items-center gap-1.5">
                    <HeartPulse size={13} className="text-[#FF2D55]" />
                    <span>长辈赡养与慢病补贴</span>
                  </label>
                  <select
                    value={hasElderCare ? 'yes' : 'no'}
                    onChange={(e) => {
                      setActiveQuickTier(null);
                      setHasElderCare(e.target.value === 'yes');
                    }}
                    className="w-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[#1C1C1E] dark:text-white outline-hidden cursor-pointer"
                  >
                    <option value="no">无特殊长辈照护补贴</option>
                    <option value="yes">有长辈日常慢病/营养补充 (¥800/月)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Simulation Results (Apple Health / Activity Rings Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/10 text-center space-y-1">
                <div className="text-[12px] text-[#8E8E93] font-medium">预估月度总开销</div>
                <div className="text-[24px] font-bold tracking-tight text-[#1C1C1E] dark:text-white">
                  ¥{budgetOutput.estimatedMonthlyBudget.toLocaleString()}
                  <span className="text-[12px] font-normal text-[#8E8E93] ml-1">/月</span>
                </div>
                <div className="text-[11px] text-[#8E8E93]">
                  年化总开销约 ¥{(budgetOutput.estimatedMonthlyBudget * 12).toLocaleString()} 元
                </div>
              </div>

              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/10 text-center space-y-1">
                <div className="text-[12px] text-[#8E8E93] font-medium">月度预计净结余</div>
                <div
                  className={`text-[24px] font-bold tracking-tight ${
                    budgetOutput.surplusOrDeficit >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'
                  }`}
                >
                  {budgetOutput.surplusOrDeficit >= 0 ? '+' : ''}¥{budgetOutput.surplusOrDeficit.toLocaleString()}
                  <span className="text-[12px] font-normal text-[#8E8E93] ml-1">/月</span>
                </div>
                <div className="text-[11px] text-[#8E8E93]">
                  {budgetOutput.surplusOrDeficit >= 0 ? '✨ 财务健康，月度储蓄稳健' : '⚠️ 产生赤字，建议精简住房或增加收入'}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/10 text-center space-y-1">
                <div className="text-[12px] text-[#8E8E93] font-medium">建议 6 个月应急备用金</div>
                <div className="text-[24px] font-bold tracking-tight text-[#007AFF]">
                  ¥{budgetOutput.emergencyBufferRecommended.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#8E8E93]">防御突发失业或家庭医疗风险底线</div>
              </div>
            </div>

            {/* Expense Breakdown (Apple Health styled progress rows) */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <span className="font-semibold text-[14px] text-[#1C1C1E] dark:text-white">
                  各项月度开支明细结构分布
                </span>
                <span className="text-[11px] text-[#8E8E93]">共 8 大民生类别</span>
              </div>

              <div className="space-y-3">
                {[
                  { label: '房屋租金 / 月供维护', amount: budgetOutput.breakdown.housing, icon: Home, color: '#007AFF' },
                  { label: '餐饮生鲜食材', amount: budgetOutput.breakdown.food, icon: Utensils, color: '#FF9500' },
                  { label: '水电燃气能耗供暖', amount: budgetOutput.breakdown.utilities, icon: Zap, color: '#AF52DE' },
                  { label: '交通出行通勤', amount: budgetOutput.breakdown.transportation, icon: Bus, color: '#5856D6' },
                  { label: '通信网络日用杂支', amount: budgetOutput.breakdown.dailyAndComms, icon: Sparkles, color: '#30B0C7' },
                  { label: '子女教育学杂', amount: budgetOutput.breakdown.childEducation, icon: GraduationCap, color: '#34C759' },
                  { label: '医疗健康与长辈关照', amount: budgetOutput.breakdown.healthAndCare, icon: HeartPulse, color: '#FF2D55' },
                  { label: '休闲社交娱乐', amount: budgetOutput.breakdown.leisureAndMisc, icon: DollarSign, color: '#FF9500' },
                ].map((item, idx) => {
                  const pct = Math.round((item.amount / Math.max(1, budgetOutput.estimatedMonthlyBudget)) * 100);
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-[#8E8E93] flex items-center gap-2">
                          <Icon size={14} style={{ color: item.color }} />
                          <span className="text-[#1C1C1E] dark:text-white font-medium">{item.label}</span>
                        </span>
                        <span className="font-bold text-[#1C1C1E] dark:text-white">
                          ¥{item.amount.toLocaleString()} <span className="text-[10px] text-[#8E8E93]">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-black/5 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                <span className="text-[12px] text-[#8E8E93]">精算完毕？可直接将当前配置带入跨城定居规划</span>
                <button
                  onClick={() => {
                    setRelocationDestId(budgetRegionId);
                    setRelocationIncome(monthlyNetIncome);
                    setRelocationHouseholdSize(householdSize);
                    handleTabChange('relocation');
                    notify(`🧭 已将预算数据载入跨城定居规划`);
                  }}
                  className="px-4 py-2 bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold text-[12px] rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  以此预算规划定居 →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: RELOCATION PLANNER (Apple Intelligence Summary aesthetic)
           ========================================================= */}
        {activeTab === 'relocation' && (
          <div className="space-y-4">
            {/* Relocation Config Inset Card */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-black/5 dark:border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                  <Compass size={20} />
                </div>
                <div>
                  <span className="font-semibold text-[14px] text-[#1C1C1E] dark:text-white">
                    跨城迁居决策与财务精算器
                  </span>
                  <p className="text-[12px] text-[#8E8E93]">评估从一线/新一线向高性价比区县迁移的收支改善与安家成本</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-[#8E8E93] font-semibold block mb-1">迁出地 (当前常住)</label>
                  <input
                    type="text"
                    value={relocationOriginName}
                    onChange={(e) => setRelocationOriginName(e.target.value)}
                    className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl px-3 py-2 text-[13px] font-bold text-[#1C1C1E] dark:text-white outline-hidden focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#8E8E93] font-semibold block mb-1">迁入目标地 (目的地区县)</label>
                  <select
                    value={relocationDestId}
                    onChange={(e) => setRelocationDestId(e.target.value)}
                    className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl px-3 py-2 text-[13px] font-bold text-[#007AFF] outline-hidden cursor-pointer"
                  >
                    {REGIONAL_COST_LIST.map((r, rIdx) => (
                      <option key={`reloc-opt-${r.id}-${rIdx}`} value={r.id}>
                        {r.name} ({r.provinceName} · {r.level === 'county' ? '区县' : r.level === 'city' ? '城市' : '省市'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#8E8E93] font-semibold block mb-1">预计月收入 (元/月)</label>
                  <input
                    type="number"
                    step={500}
                    value={relocationIncome}
                    onChange={(e) => setRelocationIncome(Math.max(1000, Number(e.target.value) || 1000))}
                    className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl px-3 py-2 text-[13px] font-bold text-[#1C1C1E] dark:text-white outline-hidden focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#8E8E93] font-semibold block mb-1">迁居家庭人数</label>
                  <select
                    value={relocationHouseholdSize}
                    onChange={(e) => setRelocationHouseholdSize(Number(e.target.value))}
                    className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl px-3 py-2 text-[13px] font-bold text-[#1C1C1E] dark:text-white outline-hidden"
                  >
                    <option value={1}>1 人（个人独立迁居）</option>
                    <option value={2}>2 人（夫妻/情侣）</option>
                    <option value={3}>3 人（核心家庭带娃）</option>
                    <option value={4}>4 人及以上（多代同行）</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Feasibility Assessment Conclusion Card (Apple Intelligence Gradient Style) */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-[14px] text-[#1C1C1E] dark:text-white">迁居综合评估结论：</span>
                  <span className="px-3 py-1 bg-[#34C759]/15 text-[#34C759] font-bold text-[12px] rounded-full">
                    {relocationPlan.conclusionTag}
                  </span>
                </div>
                <span className="text-[11px] text-[#8E8E93]">{relocationPlan.createdAt}</span>
              </div>

              <div className="p-4 bg-gradient-to-br from-[#007AFF]/5 via-[#5856D6]/5 to-[#AF52DE]/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#007AFF]">
                  <Sparkles size={14} />
                  <span>智能评估总结</span>
                </div>
                <p className="text-[13px] text-[#1C1C1E] dark:text-white leading-relaxed">
                  {relocationPlan.conclusionNote}
                </p>
              </div>

              {/* Startup Cash Needed Breakdown */}
              <div className="pt-3 border-t border-black/5 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[13px] text-[#1C1C1E] dark:text-white">
                    首次安家启动资金需求测算
                  </span>
                  <span className="text-[15px] font-bold text-[#007AFF]">
                    总计需备：¥{relocationPlan.breakdown.totalInitialCashNeeded.toLocaleString()} 元
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-[12px]">
                  <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 rounded-xl">
                    <div className="text-[11px] text-[#8E8E93]">跨城搬家物流</div>
                    <div className="font-bold text-[14px] text-[#1C1C1E] dark:text-white mt-1">
                      ¥{relocationPlan.breakdown.movingAndTransport.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 rounded-xl">
                    <div className="text-[11px] text-[#8E8E93]">租房押金与预付</div>
                    <div className="font-bold text-[14px] text-[#1C1C1E] dark:text-white mt-1">
                      ¥{relocationPlan.breakdown.rentalDepositAndAdvance.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 rounded-xl">
                    <div className="text-[11px] text-[#8E8E93]">家居家电添置</div>
                    <div className="font-bold text-[14px] text-[#1C1C1E] dark:text-white mt-1">
                      ¥{relocationPlan.breakdown.furnitureAndAppliances.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 rounded-xl">
                    <div className="text-[11px] text-[#8E8E93]">前3个月缓冲储备</div>
                    <div className="font-bold text-[14px] text-[#1C1C1E] dark:text-white mt-1">
                      ¥{relocationPlan.breakdown.firstThreeMonthsBuffer.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Phase Action Roadmap (Apple Inset Timeline) */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                  <span className="font-semibold text-[14px] text-[#1C1C1E] dark:text-white">
                    跨区域安家迁居 3 阶段行动路线图
                  </span>
                </div>
                <span className="text-[11px] text-[#8E8E93]">科学避坑指南</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#F9F9FB] dark:bg-[#242426] rounded-xl border border-black/5 dark:border-white/5 space-y-1.5">
                  <div className="font-bold text-[13px] text-[#007AFF] flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>阶段一：迁徙前评估与实地摸底 (T - 60天)</span>
                  </div>
                  <p className="text-[12px] text-[#8E8E93] leading-relaxed">
                    远程对照目标区县（如兰州榆中县）近半年实际租赁挂牌价与采暖能耗；实地短居3天跑通高铁城际通勤与生鲜物价；核实公办教育对口划片与三甲转诊路线。
                  </p>
                </div>

                <div className="p-3.5 bg-[#F9F9FB] dark:bg-[#242426] rounded-xl border border-black/5 dark:border-white/5 space-y-1.5">
                  <div className="font-bold text-[13px] text-[#007AFF] flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>阶段二：签约租购、转籍与落户 (T - 15天 至 T + 15天)</span>
                  </div>
                  <p className="text-[12px] text-[#8E8E93] leading-relaxed">
                    完成房屋租赁正规网签备案；通过国家医保服务平台 App 一键开通跨省异地就医直接结算；调取社保公积金跨省转移接续；办理子女学籍档案转入预审。
                  </p>
                </div>

                <div className="p-3.5 bg-[#F9F9FB] dark:bg-[#242426] rounded-xl border border-black/5 dark:border-white/5 space-y-1.5">
                  <div className="font-bold text-[13px] text-[#007AFF] flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>阶段三：社区融入与常态收支运转 (T + 30天后)</span>
                  </div>
                  <p className="text-[12px] text-[#8E8E93] leading-relaxed">
                    熟悉周边农贸早市与平价社区食堂，月度餐饮开销下降35%以上；建立本地邻里人脉；定期复盘生活成本月报，确保储蓄结余稳步达成预期。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: REGIONAL ARCHIVES & PROFILES (Apple Spotlight Search)
           ========================================================= */}
        {activeTab === 'profiles' && (
          <div className="space-y-4">
            {/* Apple Spotlight Search & Filter Pills */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-xs border border-black/5 dark:border-white/10 space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
                <input
                  type="text"
                  placeholder="搜索省份、城市、区县名称（如：兰州、榆中、双流、杭州、深圳）..."
                  value={profileSearch}
                  onChange={(e) => setProfileSearch(e.target.value)}
                  className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-xl pl-10 pr-3 py-2 text-[13px] text-[#1C1C1E] dark:text-white outline-hidden focus:ring-2 focus:ring-[#007AFF]/30"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { key: 'all', label: '全部样本' },
                  { key: 'macro', label: '全国大盘' },
                  { key: 'province', label: '重点省份' },
                  { key: 'city', label: '中心城市' },
                  { key: 'county', label: '区县下沉 (特含榆中县等)' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setProfileLevelFilter(f.key as any)}
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      profileLevelFilter === f.key
                        ? 'bg-[#007AFF] text-white shadow-xs'
                        : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93] hover:text-[#1C1E21] dark:hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Regional Cards Grid (Apple Inset Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {filteredProfiles.map((reg, regIdx) => {
                const rentTypical = reg.dimensions.housing?.monthlyRange?.typical || 1200;
                const beefPrice = getBenchmarkPrice(reg, 'beef_noodle');
                const heatingPrice = getBenchmarkPrice(reg, 'heating');

                return (
                  <div
                    key={`reg-card-${reg.id}-${regIdx}`}
                    className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-xs border border-black/5 dark:border-white/10 space-y-3 hover:border-[#007AFF]/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                          <MapPin size={15} />
                        </div>
                        <div>
                          <h4 className="font-bold text-[14px] text-[#1C1C1E] dark:text-white">{reg.name}</h4>
                          <span className="text-[11px] text-[#8E8E93]">{reg.provinceName}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          reg.level === 'county'
                            ? 'bg-[#AF52DE]/15 text-[#AF52DE]'
                            : reg.level === 'city'
                            ? 'bg-[#007AFF]/15 text-[#007AFF]'
                            : 'bg-[#FF9500]/15 text-[#FF9500]'
                        }`}
                      >
                        {reg.level === 'county' ? '区县级' : reg.level === 'city' ? '市级' : '省级/大盘'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center bg-[#F2F2F7] dark:bg-[#2C2C2E] p-2.5 rounded-xl">
                      <div>
                        <div className="text-[10.5px] text-[#8E8E93]">综合指数</div>
                        <div className="text-[15px] font-bold text-[#1C1C1E] dark:text-white mt-0.5">
                          {reg.overallCostIndex}
                        </div>
                      </div>
                      <div className="border-l border-black/5 dark:border-white/10">
                        <div className="text-[10.5px] text-[#8E8E93]">一居整租中位</div>
                        <div className="text-[15px] font-bold text-[#007AFF] mt-0.5">
                          ¥{rentTypical}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#8E8E93] space-y-1">
                      <div className="flex items-center justify-between">
                        <span>牛肉面 / 快餐：</span>
                        <span className="font-semibold text-[#1C1C1E] dark:text-white">¥{beefPrice} 元</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>冬季供暖能耗：</span>
                        <span className="font-semibold text-[#1C1C1E] dark:text-white">¥{heatingPrice} 元/月</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>宜居总评：</span>
                        <span className="font-bold text-[#34C759]">{reg.livabilityIndex} 分</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          handleAddRegion(reg.id);
                          handleTabChange('comparison');
                          notify(`📊 已将「${reg.name}」加入对比`);
                        }}
                        className="flex-1 py-1.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] text-[#007AFF] font-semibold text-[11px] rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                      >
                        + 对比
                      </button>
                      <button
                        onClick={() => {
                          setBudgetRegionId(reg.id);
                          handleTabChange('budget');
                          notify(`🧮 已将「${reg.name}」载入预算精算器`);
                        }}
                        className="flex-1 py-1.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] text-[#007AFF] font-semibold text-[11px] rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                      >
                        测算
                      </button>
                      <button
                        onClick={() => setDetailModalRegionId(reg.id)}
                        className="px-2.5 py-1.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[#8E8E93] hover:text-[#1C1E21] dark:hover:text-white font-semibold text-[11px] rounded-xl transition-all cursor-pointer"
                        title="详情档案"
                      >
                        详情
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Apple Sheet Detail Modal */}
            {detailRegion && (
              <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-xl border border-black/10 dark:border-white/15 animate-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                        <MapPin size={16} />
                      </div>
                      <h3 className="font-bold text-[16px] text-[#1C1C1E] dark:text-white">
                        {detailRegion.name} 生活成本深度档案
                      </h3>
                    </div>
                    <button
                      onClick={() => setDetailModalRegionId(null)}
                      className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1E21] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-[13px] text-[#8E8E93] leading-relaxed">
                    {detailRegion.name}位于{detailRegion.provinceName}，综合生活成本指数为 {detailRegion.overallCostIndex}{' '}
                    (全国平均为50)。宜居指数评分 {detailRegion.livabilityIndex} 分。
                  </p>

                  <div className="space-y-2">
                    <span className="font-semibold text-[13px] text-[#1C1C1E] dark:text-white">
                      核心支出分项典型区间
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                      {Object.entries(detailRegion?.dimensions || {}).map(([key, val]) => (
                        <div key={key} className="bg-[#F2F2F7] dark:bg-[#2C2C2E] p-2.5 rounded-xl">
                          <div className="text-[11px] text-[#8E8E93]">{val.name || key}</div>
                          <div className="font-bold text-[#1C1C1E] dark:text-white mt-0.5">
                            ¥{val.monthlyRange?.typical || 0} 元/月
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        handleAddRegion(detailRegion.id);
                        setDetailModalRegionId(null);
                        handleTabChange('comparison');
                        notify(`📊 已将「${detailRegion.name}」加入对比`);
                      }}
                      className="px-4 py-2 bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold text-[12px] rounded-xl cursor-pointer transition-all active:scale-95 shadow-xs"
                    >
                      加入横向对比
                    </button>
                    <button
                      onClick={() => setDetailModalRegionId(null)}
                      className="px-4 py-2 bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] text-[#1C1C1E] dark:text-white font-semibold text-[12px] rounded-xl cursor-pointer"
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. BOTTOM CITATION & SOURCE DISCLAIMER (Apple Clean Footnote) */}
        <footer className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 text-[11px] text-[#8E8E93] leading-relaxed shadow-xs border border-black/5 dark:border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#1C1C1E] dark:text-white">
            <Info size={14} className="text-[#007AFF]" />
            <span>数据源与方法论声明</span>
          </div>
          <div>
            数据来源于国家统计局各省调查总队 CPI 月度公报、住建部重点城市住房租赁指数监测系统、发改委价格司主要食品监测点、各市医保门诊与学前教育公办指导价，以及 2024-2026 年本地真实居民众包采价样本。
          </div>
          <div className="text-[#007AFF] font-medium">{PROTOTYPE_DEMO_TAG}</div>
        </footer>

      </div>
    </div>
  );
};
