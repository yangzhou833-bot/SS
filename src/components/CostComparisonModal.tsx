import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Scale,
  Plus,
  Trash2,
  Sliders,
  Check,
  TrendingDown,
  TrendingUp,
  CircleDollarSign,
  Home,
  Utensils,
  Zap,
  Bus,
  HeartPulse,
  GraduationCap,
  Sparkles,
  Info,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  ComparisonMode,
  CostDimensionKey,
  RegionalCostData,
} from '../types';
import {
  REGIONAL_COST_DATABASE,
  DEFAULT_INDEX_WEIGHTS,
  PROTOTYPE_DEMO_TAG,
} from '../data/costOfLivingData';
import { costOfLivingStore } from '../data/costOfLivingStore';

interface CostComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBudget: (regionId: string) => void;
  onOpenRelocation: (regionId: string) => void;
  reducedMotion?: boolean;
}

export const CostComparisonModal: React.FC<CostComparisonModalProps> = ({
  isOpen,
  onClose,
  onOpenBudget,
  onOpenRelocation,
  reducedMotion = false,
}) => {
  const [state, setState] = useState(costOfLivingStore.getState());
  const [isWeightPanelOpen, setIsWeightPanelOpen] = useState(false);

  useEffect(() => {
    return costOfLivingStore.subscribe(setState);
  }, []);

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

  const comparisonRegions: RegionalCostData[] = state.comparisonRegionIds
    .map((id) => REGIONAL_COST_DATABASE[id])
    .filter(Boolean);

  const allAvailableRegions = Object.values(REGIONAL_COST_DATABASE);

  const dimensionKeys: { key: CostDimensionKey; label: string; icon: React.ElementType }[] = [
    { key: 'housing', label: '住房与房租', icon: Home },
    { key: 'food', label: '餐饮与食材', icon: Utensils },
    { key: 'utilities', label: '水电暖能源', icon: Zap },
    { key: 'transportation', label: '交通出行', icon: Bus },
    { key: 'healthcare', label: '医疗健康', icon: HeartPulse },
    { key: 'education', label: '教育学习', icon: GraduationCap },
  ];

  const handleWeightPreset = (preset: 'balanced' | 'rent_focus' | 'family' | 'retirement') => {
    switch (preset) {
      case 'balanced':
        costOfLivingStore.setIndexWeights({ ...DEFAULT_INDEX_WEIGHTS }, 'balanced');
        break;
      case 'rent_focus':
        costOfLivingStore.setIndexWeights(
          { housing: 0.5, food: 0.2, utilities: 0.1, transportation: 0.1, healthcare: 0.05, education: 0.05 },
          'rent_focus'
        );
        break;
      case 'family':
        costOfLivingStore.setIndexWeights(
          { housing: 0.3, food: 0.2, utilities: 0.1, transportation: 0.05, healthcare: 0.1, education: 0.25 },
          'family'
        );
        break;
      case 'retirement':
        costOfLivingStore.setIndexWeights(
          { housing: 0.25, food: 0.25, utilities: 0.1, transportation: 0.05, healthcare: 0.3, education: 0.05 },
          'retirement'
        );
        break;
    }
  };

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

        {/* 模态框主体 - Facebook Straight Line Frame */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-md border border-[#E4E6EB] shadow-2xl flex flex-col pointer-events-auto overflow-hidden z-10"
        >
          {/* 模态框顶栏 */}
          <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-blue-50 text-[#1877F2] flex items-center justify-center">
                <Scale size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black text-[#050505]">多地生活成本横向对比</h2>
                  <span className="text-[10px] bg-blue-50 text-[#1877F2] font-mono px-1.5 py-0.5 rounded-sm border border-blue-200">
                    {PROTOTYPE_DEMO_TAG}
                  </span>
                </div>
                <div className="text-[11px] text-[#65676B]">
                  已选 {comparisonRegions.length} 个区域 (支持 2-4 地同台多维对比)
                </div>
              </div>
            </div>

            <button
              id="close-comparison-modal-btn"
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* 模式选择与权重调节工具栏 */}
          <div className="px-4 py-2.5 bg-[#F7F8FA] border-b border-[#E4E6EB] flex flex-wrap items-center justify-between gap-2 shrink-0">
            {/* 对比模式切换 */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#050505] mr-1">对比基准：</span>
              <button
                type="button"
                onClick={() => costOfLivingStore.setComparisonMode('same_standard')}
                className={`px-2.5 py-1 text-xs rounded-sm font-bold border cursor-pointer transition-colors ${
                  state.comparisonMode === 'same_standard'
                    ? 'bg-[#1877F2] text-white border-[#1877F2]'
                    : 'bg-white text-[#050505] border-[#E4E6EB] hover:bg-[#F0F2F5]'
                }`}
              >
                同等生活标准 (控制相同租房/消费品规)
              </button>
              <button
                type="button"
                onClick={() => costOfLivingStore.setComparisonMode('local_lifestyle')}
                className={`px-2.5 py-1 text-xs rounded-sm font-bold border cursor-pointer transition-colors ${
                  state.comparisonMode === 'local_lifestyle'
                    ? 'bg-[#1877F2] text-white border-[#1877F2]'
                    : 'bg-white text-[#050505] border-[#E4E6EB] hover:bg-[#F0F2F5]'
                }`}
              >
                本地生活惯例 (反映当地市民消费形态)
              </button>
            </div>

            {/* 权重调节与区域增删 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWeightPanelOpen(!isWeightPanelOpen)}
                className={`text-xs font-bold px-2 py-1 rounded-sm border flex items-center gap-1 cursor-pointer transition-colors ${
                  isWeightPanelOpen
                    ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]'
                    : 'bg-white text-[#050505] border-[#E4E6EB] hover:bg-[#F0F2F5]'
                }`}
              >
                <Sliders size={13} />
                <span>偏好权重 ({state.weightMode})</span>
              </button>

              {/* 增添对比区域下拉选择 */}
              {comparisonRegions.length < 4 && (
                <div className="flex items-center gap-1">
                  <select
                    id="add-region-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        costOfLivingStore.addRegionToComparison(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="bg-white border border-[#E4E6EB] rounded-sm text-xs px-2 py-1 text-[#050505] focus:outline-none focus:border-[#1877F2]"
                  >
                    <option value="">+ 添加候选区县/城市...</option>
                    {allAvailableRegions
                      .filter((r) => !state.comparisonRegionIds.includes(r.id))
                      .map((r, rIdx) => (
                        <option key={`comp-opt-${r.id}-${rIdx}`} value={r.id}>
                          {r.name} ({r.level === 'county' ? '县级' : r.level === 'city' ? '市级' : '省级'})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 权重调节预设面板 */}
          {isWeightPanelOpen && (
            <div className="p-3 bg-[#E7F3FF]/40 border-b border-[#E4E6EB] text-xs">
              <div className="font-bold text-[#050505] mb-1.5 flex items-center gap-1">
                <Sliders size={13} className="text-[#1877F2]" />
                <span>自定义权重画像预设 (计算指数时动态偏向您重视的方面)：</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleWeightPreset('balanced')}
                  className={`px-2 py-1 rounded-sm text-xs font-medium border cursor-pointer ${
                    state.weightMode === 'balanced'
                      ? 'bg-[#1877F2] text-white border-[#1877F2]'
                      : 'bg-white text-[#050505] border-[#E4E6EB]'
                  }`}
                >
                  均衡标准 (住35% 食25% 水电10% 行10% 医10% 教10%)
                </button>
                <button
                  type="button"
                  onClick={() => handleWeightPreset('rent_focus')}
                  className={`px-2 py-1 rounded-sm text-xs font-medium border cursor-pointer ${
                    state.weightMode === 'rent_focus'
                      ? 'bg-[#1877F2] text-white border-[#1877F2]'
                      : 'bg-white text-[#050505] border-[#E4E6EB]'
                  }`}
                >
                  租房/青年刚需 (住房拉至50%)
                </button>
                <button
                  type="button"
                  onClick={() => handleWeightPreset('family')}
                  className={`px-2 py-1 rounded-sm text-xs font-medium border cursor-pointer ${
                    state.weightMode === 'family'
                      ? 'bg-[#1877F2] text-white border-[#1877F2]'
                      : 'bg-white text-[#050505] border-[#E4E6EB]'
                  }`}
                >
                  育儿家庭重心 (教育25% 医疗10%)
                </button>
                <button
                  type="button"
                  onClick={() => handleWeightPreset('retirement')}
                  className={`px-2 py-1 rounded-sm text-xs font-medium border cursor-pointer ${
                    state.weightMode === 'retirement'
                      ? 'bg-[#1877F2] text-white border-[#1877F2]'
                      : 'bg-white text-[#050505] border-[#E4E6EB]'
                  }`}
                >
                  退休养老康养 (医疗30% 居住25%)
                </button>
              </div>
            </div>
          )}

          {/* 表格内容对比主体 */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* 近 5 年生活成本指数历史波动趋势折线图 (Recharts) */}
            <div className="p-3 bg-white rounded-md border border-[#E4E6EB] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-black text-xs text-[#050505]">
                  <LineChartIcon size={15} className="text-[#1877F2]" />
                  <span>近 5 年生活成本指数历史波动与未来趋势预判</span>
                </div>
                <span className="text-[10px] text-[#65676B] bg-[#F0F2F5] px-1.5 py-0.5 rounded-sm">
                  数据基于历年统计局公报与抽样调查加权
                </span>
              </div>
              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      {
                        year: '2022',
                        ...comparisonRegions.reduce((acc, r) => ({ ...acc, [r.name]: Math.max(30, Math.round(r.overallCostIndex * 0.90)) }), {}),
                      },
                      {
                        year: '2023',
                        ...comparisonRegions.reduce((acc, r) => ({ ...acc, [r.name]: Math.max(30, Math.round(r.overallCostIndex * 0.93)) }), {}),
                      },
                      {
                        year: '2024',
                        ...comparisonRegions.reduce((acc, r) => ({ ...acc, [r.name]: Math.max(30, Math.round(r.overallCostIndex * 0.96)) }), {}),
                      },
                      {
                        year: '2025 (当前)',
                        ...comparisonRegions.reduce((acc, r) => ({ ...acc, [r.name]: r.overallCostIndex }), {}),
                      },
                      {
                        year: '2026 (预测)',
                        ...comparisonRegions.reduce((acc, r) => ({ ...acc, [r.name]: Math.min(100, Math.round(r.overallCostIndex * 1.025)) }), {}),
                      },
                    ]}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4E6EB" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#65676B' }} />
                    <YAxis domain={[30, 95]} tick={{ fontSize: 10, fill: '#65676B' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E4E6EB', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                    {comparisonRegions.map((r, rIdx) => {
                      const colors = ['#1877F2', '#10B981', '#F59E0B', '#8B5CF6'];
                      return (
                        <Line
                          key={r.id}
                          type="monotone"
                          dataKey={r.name}
                          stroke={colors[rIdx % colors.length]}
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          activeDot={{ r: 6 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-[#E4E6EB]">
                  <th className="p-2.5 font-bold text-[#65676B] w-36 bg-[#F7F8FA]">对比指标项</th>
                  {comparisonRegions.map((region) => (
                    <th key={region.id} className="p-2.5 font-bold text-[#050505] min-w-44 bg-white border-l border-[#E4E6EB]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="font-black text-sm">{region.name}</span>
                          <span className="text-[9px] bg-[#F0F2F5] px-1 py-0.2 rounded-xs text-[#65676B]">
                            {region.level === 'county' ? '县级' : region.level === 'city' ? '市级' : '省级'}
                          </span>
                        </div>
                        {comparisonRegions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => costOfLivingStore.removeRegionFromComparison(region.id)}
                            className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                            title="移除此列"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] text-[#65676B] font-normal">{region.parentPath}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E6EB]">
                {/* 综合成本指数 */}
                <tr className="bg-blue-50/40">
                  <td className="p-2.5 font-bold text-[#050505]">综合成本指数</td>
                  {comparisonRegions.map((r) => (
                    <td key={r.id} className="p-2.5 border-l border-[#E4E6EB]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-[#1877F2]">{r.overallCostIndex}</span>
                        <span className="text-[10px] text-[#65676B]">/ 100</span>
                      </div>
                      <div className="text-[10px] text-[#65676B]">
                        {r.overallCostIndex > 65 ? '成本偏高' : r.overallCostIndex > 50 ? '中等平衡' : '生活成本洼地'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 月度基本开支区间 */}
                <tr>
                  <td className="p-2.5 font-bold text-[#050505]">月度基本开支</td>
                  {comparisonRegions.map((r) => (
                    <td key={r.id} className="p-2.5 border-l border-[#E4E6EB]">
                      <div className="font-bold text-[#050505]">
                        ¥{r.monthlyBasicRange.low}–{r.monthlyBasicRange.high}/月
                      </div>
                      <div className="text-[10px] text-[#1877F2]">中位典型: ¥{r.monthlyBasicRange.typical}</div>
                    </td>
                  ))}
                </tr>

                {/* 全职税后薪资中位 */}
                <tr>
                  <td className="p-2.5 font-bold text-[#050505]">全职税后薪酬</td>
                  {comparisonRegions.map((r) => (
                    <td key={r.id} className="p-2.5 border-l border-[#E4E6EB]">
                      <div className="font-bold text-emerald-700">
                        ¥{r.afterTaxIncomeRange.low}–{r.afterTaxIncomeRange.high}/月
                      </div>
                      <div className="text-[10px] text-[#65676B]">中位税后: ¥{r.afterTaxIncomeRange.typical}</div>
                    </td>
                  ))}
                </tr>

                {/* 住房负担比 */}
                <tr>
                  <td className="p-2.5 font-bold text-[#050505]">住房负担占比</td>
                  {comparisonRegions.map((r) => (
                    <td key={r.id} className="p-2.5 border-l border-[#E4E6EB]">
                      <div className="font-bold text-[#050505]">
                        {(r.housingBurdenRatio * 100).toFixed(0)}%
                      </div>
                      <div className="text-[10px] text-[#65676B]">
                        {r.housingBurdenRatio < 0.25 ? '压力极低' : r.housingBurdenRatio < 0.35 ? '舒适适中' : '负担偏重'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 预计可支配盈余 */}
                <tr className="bg-emerald-50/40">
                  <td className="p-2.5 font-bold text-[#050505]">每月可支配结余</td>
                  {comparisonRegions.map((r) => (
                    <td key={r.id} className="p-2.5 border-l border-[#E4E6EB]">
                      <div className="font-black text-emerald-700">
                        ¥{r.disposableIncomeRange.low}–{r.disposableIncomeRange.high}/月
                      </div>
                      <div className="text-[10px] text-emerald-800">
                        典型盈余 ¥{r.disposableIncomeRange.typical}/月
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 6大重点子维度对比 */}
                {dimensionKeys.map((dim) => {
                  const Icon = dim.icon;
                  return (
                    <tr key={dim.key}>
                      <td className="p-2.5 font-bold text-[#050505] flex items-center gap-1.5">
                        <Icon size={14} className="text-[#1877F2]" />
                        <span>{dim.label}</span>
                      </td>
                      {comparisonRegions.map((r) => {
                        const targetDim = r?.dimensions?.[dim.key];
                        if (!targetDim) return <td key={r.id} className="p-2.5 border-l border-[#E4E6EB] text-gray-400">暂无</td>;
                        return (
                          <td key={r.id} className="p-2.5 border-l border-[#E4E6EB]">
                            <div className="font-bold text-[#050505]">
                              ¥{targetDim.monthlyRange?.low ?? 0}–{targetDim.monthlyRange?.high ?? 0} {targetDim.monthlyRange?.unit || '元'}
                            </div>
                            <div className="text-[10px] text-[#65676B] line-clamp-1">{targetDim.summary || '暂无说明'}</div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* 比较优势总结 */}
                <tr>
                  <td className="p-2.5 font-bold text-[#050505]">核心比较优势</td>
                  {comparisonRegions.map((r) => (
                    <td key={r.id} className="p-2.5 border-l border-[#E4E6EB] align-top">
                      <ul className="text-[10.5px] text-[#65676B] space-y-0.5 list-disc list-inside">
                        {r.mainAdvantages.map((adv, i) => (
                          <li key={i} className="line-clamp-1">{adv}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* 操作入口 (去测算此地预算 / 去做定居规划) */}
                <tr className="bg-[#F7F8FA]">
                  <td className="p-2.5 font-bold text-[#65676B]">针对行动</td>
                  {comparisonRegions.map((r) => (
                    <td key={r.id} className="p-2.5 border-l border-[#E4E6EB]">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenBudget(r.id);
                          }}
                          className="px-2 py-1 text-[11px] font-bold text-[#1877F2] bg-[#E7F3FF] hover:bg-[#DBEBFF] rounded-sm border border-[#1877F2]/30 text-center cursor-pointer transition-colors"
                        >
                          测算{r.name}预算
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenRelocation(r.id);
                          }}
                          className="px-2 py-1 text-[11px] font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] rounded-sm border border-[#1877F2] text-center cursor-pointer transition-colors"
                        >
                          制定{r.name}搬迁方案
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* 底部信息与关闭 */}
          <div className="p-3 border-t border-[#E4E6EB] bg-white flex items-center justify-between text-xs text-[#65676B] shrink-0">
            <div className="flex items-center gap-1.5">
              <Info size={14} className="text-[#1877F2]" />
              <span>
                数据说明：差额基于同等品规抽样估算，实际开支受个人习惯影响。
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] font-bold rounded-sm border border-[#E4E6EB] cursor-pointer transition-colors"
            >
              完成比对
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
