import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calculator,
  Home,
  Utensils,
  Zap,
  Bus,
  Baby,
  HeartPulse,
  Film,
  CircleDollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  Compass,
} from 'lucide-react';
import {
  BudgetSimulatorInput,
  LifestylePresetKey,
  RegionalCostData,
} from '../types';
import {
  REGIONAL_COST_DATABASE,
  LIFESTYLE_PRESETS,
  calculateBudgetSimulation,
  PROTOTYPE_DEMO_TAG,
} from '../data/costOfLivingData';
import { costOfLivingStore } from '../data/costOfLivingStore';

interface BudgetSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRegionId?: string;
  onOpenRelocation: (regionId: string) => void;
  reducedMotion?: boolean;
}

export const BudgetSimulatorModal: React.FC<BudgetSimulatorModalProps> = ({
  isOpen,
  onClose,
  targetRegionId,
  onOpenRelocation,
  reducedMotion = false,
}) => {
  const storeState = costOfLivingStore.getState();
  const initialRegionId = targetRegionId || storeState.selectedRegionId || 'yuzhong';

  const [input, setInput] = useState<BudgetSimulatorInput>({
    regionId: initialRegionId,
    householdSize: 1,
    housingType: 'rent_1bed',
    commuteType: 'public_transit',
    diningType: 'cook_mostly',
    monthlyNetIncome: 6500,
    hasChildEducation: false,
    educationType: 'none',
    hasElderCare: false,
    preset: 'single_comfortable',
  });

  useEffect(() => {
    if (targetRegionId) {
      setInput((prev) => ({ ...prev, regionId: targetRegionId }));
    }
  }, [targetRegionId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentRegion = REGIONAL_COST_DATABASE[input.regionId] || REGIONAL_COST_DATABASE.yuzhong;
  const simulation = calculateBudgetSimulation(input, currentRegion);

  const applyPreset = (presetKey: LifestylePresetKey) => {
    const p = LIFESTYLE_PRESETS[presetKey];
    if (!p) return;
    setInput((prev) => ({
      ...prev,
      householdSize: p.householdSize,
      housingType: p.housingType,
      commuteType: p.commuteType,
      diningType: p.diningType,
      hasChildEducation: p.hasChildEducation,
      educationType: p.educationType,
      hasElderCare: p.hasElderCare,
      monthlyNetIncome: p.defaultIncome,
      preset: presetKey,
    }));
  };

  const isSurplus = simulation.surplusOrDeficit >= 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-none">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto"
        />

        {/* 弹窗主体 - Facebook 直角线框风格 */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-md border border-[#E4E6EB] shadow-2xl flex flex-col pointer-events-auto overflow-hidden z-10"
        >
          {/* 顶栏 */}
          <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-blue-50 text-[#1877F2] flex items-center justify-center">
                <Calculator size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black text-[#050505]">我的生活成本预算测算器</h2>
                  <span className="text-[10px] bg-blue-50 text-[#1877F2] font-mono px-1.5 py-0.5 rounded-sm border border-blue-200">
                    {PROTOTYPE_DEMO_TAG}
                  </span>
                </div>
                <div className="text-[11px] text-[#65676B]">
                  基于目标地区本地真实物价，量身测算月度必需开销与结余空间
                </div>
              </div>
            </div>

            <button
              id="close-budget-modal-btn"
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* 快捷生活形态预设栏 */}
          <div className="px-4 py-2 bg-[#F7F8FA] border-b border-[#E4E6EB] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-xs font-bold text-[#050505] shrink-0 mr-1">快捷模板：</span>
            {(Object.keys(LIFESTYLE_PRESETS) as LifestylePresetKey[]).map((key) => {
              const p = LIFESTYLE_PRESETS[key];
              const isSelected = input.preset === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className={`px-2.5 py-1 rounded-sm text-xs font-medium shrink-0 border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#1877F2] text-white border-[#1877F2] font-bold'
                      : 'bg-white text-[#050505] border-[#E4E6EB] hover:bg-[#F0F2F5]'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* 左右分栏计算工作台 */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#E4E6EB]">
            {/* 左侧：输入参数配置 (7列) */}
            <div className="md:col-span-7 p-4 space-y-3.5">
              {/* 1. 目标地区选择 */}
              <div>
                <label className="block text-xs font-bold text-[#050505] mb-1">
                  目标测算地区 (最低支持至县级行政区)
                </label>
                <select
                  value={input.regionId}
                  onChange={(e) => setInput({ ...input, regionId: e.target.value })}
                  className="w-full bg-white border border-[#E4E6EB] rounded-sm p-2 text-xs font-medium text-[#050505] focus:border-[#1877F2] focus:outline-none"
                >
                  {Object.values(REGIONAL_COST_DATABASE).map((r, rIdx) => (
                    <option key={`budget-reg-${r.id}-${rIdx}`} value={r.id}>
                      {r.name} ({r.parentPath}) · 综合成本指数 {r.overallCostIndex}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. 预计月度可支配净收入 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#050505]">
                    家庭月度税后净收入预期 (¥)
                  </label>
                  <span className="text-xs font-mono font-bold text-[#1877F2]">
                    ¥{input.monthlyNetIncome.toLocaleString()} / 月
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="30000"
                  step="500"
                  value={input.monthlyNetIncome}
                  onChange={(e) => setInput({ ...input, monthlyNetIncome: Number(e.target.value) })}
                  className="w-full accent-[#1877F2] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#65676B] mt-0.5">
                  <span>¥2,000 (基础保障)</span>
                  <span>¥8,000 (舒适中位)</span>
                  <span>¥30,000 (宽裕)</span>
                </div>
              </div>

              {/* 3. 家庭人数与住房形式 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">家庭居住人口</label>
                  <select
                    value={input.householdSize}
                    onChange={(e) => setInput({ ...input, householdSize: Number(e.target.value) })}
                    className="w-full bg-white border border-[#E4E6EB] rounded-sm p-1.5 text-xs text-[#050505] focus:border-[#1877F2] focus:outline-none"
                  >
                    <option value={1}>1人 (单身/青年独立租房)</option>
                    <option value={2}>2人 (伴侣/无子女合租)</option>
                    <option value={3}>3人 (核心三口之家)</option>
                    <option value={4}>4人及以上 (三代同堂)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">住房居住方式</label>
                  <select
                    value={input.housingType}
                    onChange={(e) => setInput({ ...input, housingType: e.target.value as any })}
                    className="w-full bg-white border border-[#E4E6EB] rounded-sm p-1.5 text-xs text-[#050505] focus:border-[#1877F2] focus:outline-none"
                  >
                    <option value="rent_shared">合租单间 (低成本启动)</option>
                    <option value="rent_1bed">整租一居室 (私密独立)</option>
                    <option value="rent_2bed">整租两居室 (居家舒适)</option>
                    <option value="rent_3bed">整租三居室 (宽敞家庭)</option>
                    <option value="own_paid_off">自购已结清 (仅物业水电)</option>
                    <option value="own_mortgage">自购月供按揭中</option>
                  </select>
                </div>
              </div>

              {/* 4. 通勤出行与日常餐饮 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">主力出行通勤</label>
                  <select
                    value={input.commuteType}
                    onChange={(e) => setInput({ ...input, commuteType: e.target.value as any })}
                    className="w-full bg-white border border-[#E4E6EB] rounded-sm p-1.5 text-xs text-[#050505] focus:border-[#1877F2] focus:outline-none"
                  >
                    <option value="walk_bike">步行 / 自行车 / 电瓶车</option>
                    <option value="public_transit">公交 / 地铁 / 县域班车</option>
                    <option value="private_car">私家车自驾 (油费车险)</option>
                    <option value="intercity_train">跨城城际高铁通勤</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#050505] mb-1">日常餐饮结构</label>
                  <select
                    value={input.diningType}
                    onChange={(e) => setInput({ ...input, diningType: e.target.value as any })}
                    className="w-full bg-white border border-[#E4E6EB] rounded-sm p-1.5 text-xs text-[#050505] focus:border-[#1877F2] focus:outline-none"
                  >
                    <option value="cook_mostly">基本自煮 (农贸市场买菜)</option>
                    <option value="half_half">半自煮半外卖/快餐</option>
                    <option value="dine_out_often">高频堂食社交 / 咖啡轻食</option>
                  </select>
                </div>
              </div>

              {/* 5. 子女托幼教育 & 医疗养老特别项 */}
              <div className="bg-[#F7F8FA] p-2.5 rounded-sm border border-[#E4E6EB] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 font-bold text-[#050505] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={input.hasChildEducation}
                      onChange={(e) => setInput({ ...input, hasChildEducation: e.target.checked })}
                      className="accent-[#1877F2] cursor-pointer"
                    />
                    <span>家庭包含学龄前托育或基础教育支出</span>
                  </label>
                </div>

                {input.hasChildEducation && (
                  <select
                    value={input.educationType}
                    onChange={(e) => setInput({ ...input, educationType: e.target.value as any })}
                    className="w-full bg-white border border-[#E4E6EB] rounded-sm p-1 text-xs text-[#050505]"
                  >
                    <option value="nursery">托育园 / 普惠早教 (每月额外约 ¥1,500)</option>
                    <option value="public_school">公办义务教育阶段 (教辅课后约 ¥400)</option>
                    <option value="private_school">民办 / 示范国际高中 (约 ¥2,500/月)</option>
                  </select>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E4E6EB]">
                  <label className="flex items-center gap-1.5 font-bold text-[#050505] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={input.hasElderCare}
                      onChange={(e) => setInput({ ...input, hasElderCare: e.target.checked })}
                      className="accent-[#1877F2] cursor-pointer"
                    />
                    <span>包含长辈长期慢病配药或康养照料 (每月额外约 ¥800)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 右侧：计算结果面板 (5列) */}
            <div className="md:col-span-5 p-4 bg-[#F7F8FA] flex flex-col justify-between space-y-3">
              <div>
                <div className="text-xs font-bold text-[#65676B] mb-1">
                  在【{currentRegion.name}】测算结果
                </div>

                {/* 月度预算大字呈现 */}
                <div className="bg-white p-3 rounded-md border border-[#E4E6EB] shadow-2xs mb-3">
                  <div className="text-[11px] text-[#65676B]">预计每月总生活开支</div>
                  <div className="text-2xl font-black text-[#1877F2] mt-0.5">
                    ¥{simulation.estimatedMonthlyBudget.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-[#65676B]">/ 月</span>
                  </div>

                  {/* 收支差额卡片 */}
                  <div
                    className={`mt-2.5 p-2 rounded-sm border flex items-center gap-2 ${
                      isSurplus
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {isSurplus ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                    )}
                    <div className="text-xs">
                      <div className="font-bold">
                        {isSurplus
                          ? `每月预计净结余 +¥${simulation.surplusOrDeficit.toLocaleString()}`
                          : `每月预计收支缺口 -¥${Math.abs(simulation.surplusOrDeficit).toLocaleString()}`}
                      </div>
                      <div className="text-[10px] text-[#65676B] mt-0.5">
                        {isSurplus
                          ? '结余率良好，具备安居与定居储蓄能力'
                          : '建议调降租房规格或提升收入期望'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 开支分项明细 */}
                <div className="bg-white p-3 rounded-md border border-[#E4E6EB] space-y-1.5 text-xs">
                  <div className="font-bold text-[#050505] text-[11px] mb-1">各项开支拆解预测：</div>
                  <div className="flex justify-between text-[#65676B]">
                    <span>住房房租/月供及物业</span>
                    <span className="font-mono font-bold text-[#050505]">
                      ¥{simulation.breakdown.housing}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#65676B]">
                    <span>餐饮与生鲜采购</span>
                    <span className="font-mono font-bold text-[#050505]">
                      ¥{simulation.breakdown.food}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#65676B]">
                    <span>水电燃气/冬季供暖</span>
                    <span className="font-mono font-bold text-[#050505]">
                      ¥{simulation.breakdown.utilities}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#65676B]">
                    <span>交通通勤出行</span>
                    <span className="font-mono font-bold text-[#050505]">
                      ¥{simulation.breakdown.transportation}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#65676B]">
                    <span>宽带通信与日常必需</span>
                    <span className="font-mono font-bold text-[#050505]">
                      ¥{simulation.breakdown.dailyAndComms}
                    </span>
                  </div>
                  {simulation.breakdown.childEducation > 0 && (
                    <div className="flex justify-between text-[#65676B]">
                      <span>托育与子女教育</span>
                      <span className="font-mono font-bold text-[#050505]">
                        ¥{simulation.breakdown.childEducation}
                      </span>
                    </div>
                  )}
                  {simulation.breakdown.healthAndCare > 0 && (
                    <div className="flex justify-between text-[#65676B]">
                      <span>医疗慢病与长辈照料</span>
                      <span className="font-mono font-bold text-[#050505]">
                        ¥{simulation.breakdown.healthAndCare}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#65676B]">
                    <span>休闲社交与应急杂项</span>
                    <span className="font-mono font-bold text-[#050505]">
                      ¥{simulation.breakdown.leisureAndMisc}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#E4E6EB] flex justify-between text-xs font-bold text-[#1877F2]">
                    <span>建议应急备用金 (3-6月)</span>
                    <span className="font-mono">¥{simulation.emergencyBufferRecommended.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 底部直接生成搬迁规划按钮 */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRelocation(currentRegion.id);
                  }}
                  className="w-full py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-sm shadow-2xs border border-[#1877F2] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Compass size={14} />
                  <span>将此预算导入【{currentRegion.name}】定居规划</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
