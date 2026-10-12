import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Compass,
  MapPin,
  ArrowRight,
  CircleDollarSign,
  Truck,
  Home,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
  Bookmark,
  Trash2,
  Info,
} from 'lucide-react';
import {
  RelocationPlan,
  RegionalCostData,
  AdminLevel,
} from '../types';
import {
  REGIONAL_COST_DATABASE,
  generateRelocationPlan,
  PROTOTYPE_DEMO_TAG,
} from '../data/costOfLivingData';
import { costOfLivingStore } from '../data/costOfLivingStore';

interface RelocationPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRegionId?: string;
  reducedMotion?: boolean;
}

export const RelocationPlannerModal: React.FC<RelocationPlannerModalProps> = ({
  isOpen,
  onClose,
  targetRegionId,
  reducedMotion = false,
}) => {
  const [state, setState] = useState(costOfLivingStore.getState());
  const initialDestId = targetRegionId || state.selectedRegionId || 'dujiangyan';

  const [originName, setOriginName] = useState('兰州市城关区');
  const [destinationId, setDestinationId] = useState(initialDestId);
  const [householdSize, setHouseholdSize] = useState(2);
  const [monthlyIncome, setMonthlyIncome] = useState(8500);
  const [targetLevel, setTargetLevel] = useState<AdminLevel>('county');
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'saved'>('create');
  const [hasGenerated, setHasGenerated] = useState(true);

  useEffect(() => {
    return costOfLivingStore.subscribe(setState);
  }, []);

  useEffect(() => {
    if (targetRegionId) {
      setDestinationId(targetRegionId);
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

  const destRegion: RegionalCostData = REGIONAL_COST_DATABASE[destinationId] || REGIONAL_COST_DATABASE.dujiangyan;

  // 动态生成方案
  const currentPlan = generateRelocationPlan({
    destinationRegion: destRegion,
    originRegionName: originName,
    householdSize,
    monthlyIncome,
  });

  const handleSaveCurrentPlan = () => {
    costOfLivingStore.saveRelocationPlan(currentPlan);
    setActiveSubTab('saved');
  };

  const checklistItems = [
    {
      title: '医保异地结算与参保关系转移',
      desc: '在国家医保服务平台App办理跨省异地就医备案，或通过原属地医保局申请医保关系跨省线上转移接续。',
    },
    {
      title: '居住证登记与常住人口申领',
      desc: `到达【${destRegion.name}】后持租房合同与屋主信息前往属地派出所或社区便民服务中心办理居住登记。`,
    },
    {
      title: '子女入学与学籍衔接',
      desc: '凭居住证、劳动合同或营业执照、租房备案证明，在每年义务教育招生季参加划片或统筹学位申报。',
    },
    {
      title: '社区卫生服务与健康档案',
      desc: '携带居民身份证到居住片区社区卫生服务中心或乡镇卫生院建立居民健康档案，慢病长辈可享免费定期筛查。',
    },
    {
      title: '水电气暖公用设施户名核验',
      desc: '入住前同房东查验水电卡、燃气防爆软管及冬季供暖或空调设备能耗，防止历史欠费纠纷。',
    },
  ];

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
          exit={{ scale: 0.96, opacity: 1 }}
          className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-md border border-[#E4E6EB] shadow-2xl flex flex-col pointer-events-auto overflow-hidden z-10"
        >
          {/* 顶栏 */}
          <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-blue-50 text-[#1877F2] flex items-center justify-center">
                <Compass size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black text-[#050505]">定居与搬迁决策规划方案</h2>
                  <span className="text-[10px] bg-blue-50 text-[#1877F2] font-mono px-1.5 py-0.5 rounded-sm border border-blue-200">
                    {PROTOTYPE_DEMO_TAG}
                  </span>
                </div>
                <div className="text-[11px] text-[#65676B]">
                  涵盖首期启动资金储备、月度收支稳健性测算与跨城落地办事指引
                </div>
              </div>
            </div>

            <button
              id="close-relocation-modal-btn"
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* 标签栏 (方案制定 / 已保存方案) */}
          <div className="px-4 bg-[#F7F8FA] border-b border-[#E4E6EB] flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubTab('create')}
              className={`py-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                activeSubTab === 'create'
                  ? 'border-[#1877F2] text-[#1877F2]'
                  : 'border-transparent text-[#65676B] hover:text-[#050505]'
              }`}
            >
              搬迁测算工作台
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('saved')}
              className={`py-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1 ${
                activeSubTab === 'saved'
                  ? 'border-[#1877F2] text-[#1877F2]'
                  : 'border-transparent text-[#65676B] hover:text-[#050505]'
              }`}
            >
              <Bookmark size={12} />
              <span>已保存方案 ({state.savedRelocationPlans.length})</span>
            </button>
          </div>

          {/* 内容区 */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeSubTab === 'create' ? (
              <div className="space-y-4">
                {/* 1. 迁出地与目标迁入地设置 */}
                <div className="bg-[#F7F8FA] p-3 rounded-md border border-[#E4E6EB]">
                  <div className="text-xs font-bold text-[#050505] mb-2 flex items-center gap-1.5">
                    <Truck size={14} className="text-[#1877F2]" />
                    <span>迁居路线与家庭参数配置</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] text-[#65676B] mb-0.5">当前常住出发地</label>
                      <input
                        type="text"
                        value={originName}
                        onChange={(e) => setOriginName(e.target.value)}
                        placeholder="例：兰州市城关区"
                        className="w-full bg-white border border-[#E4E6EB] rounded-sm p-1.5 text-xs text-[#050505] focus:border-[#1877F2] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#65676B] mb-0.5">目标迁入地 (县/市/省)</label>
                      <select
                        value={destinationId}
                        onChange={(e) => setDestinationId(e.target.value)}
                        className="w-full bg-white border border-[#E4E6EB] rounded-sm p-1.5 text-xs font-bold text-[#050505] focus:border-[#1877F2] focus:outline-none"
                      >
                        {Object.values(REGIONAL_COST_DATABASE).map((r, rIdx) => (
                          <option key={`reloc-reg-${r.id}-${rIdx}`} value={r.id}>
                            {r.name} ({r.level === 'county' ? '县级行政区' : r.level === 'city' ? '地级市' : '省级'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#65676B] mb-0.5">迁居家庭规模</label>
                      <select
                        value={householdSize}
                        onChange={(e) => setHouseholdSize(Number(e.target.value))}
                        className="w-full bg-white border border-[#E4E6EB] rounded-sm p-1.5 text-xs text-[#050505] focus:border-[#1877F2] focus:outline-none"
                      >
                        <option value={1}>1人单身搬迁</option>
                        <option value={2}>2人伴侣安家</option>
                        <option value={3}>3人核心家庭</option>
                        <option value={4}>4人及以上多代搬迁</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#65676B] mb-0.5">预计落地月收入 (¥)</label>
                      <input
                        type="number"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                        className="w-full bg-white border border-[#E4E6EB] rounded-sm p-1.5 text-xs text-[#050505] focus:border-[#1877F2] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. 测算核心结论看板 */}
                <div className="bg-white p-3.5 rounded-md border border-[#E4E6EB] shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E4E6EB]">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-sm font-black text-[#050505]">
                        <span>{originName}</span>
                        <ArrowRight size={14} className="text-[#1877F2]" />
                        <span className="text-[#1877F2]">{destRegion.name}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-sm border border-emerald-200">
                        {currentPlan.conclusionTag}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveCurrentPlan}
                      className="text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] px-3 py-1 rounded-sm shadow-2xs border border-[#1877F2] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Bookmark size={12} />
                      <span>保存此方案</span>
                    </button>
                  </div>

                  <div className="mt-2 text-xs text-[#65676B] leading-relaxed">
                    {currentPlan.conclusionNote}
                  </div>

                  {/* 核心财务指标 3 列 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                    <div className="bg-blue-50/50 p-2.5 rounded-sm border border-blue-200">
                      <div className="text-[10px] text-[#65676B]">首期安家启动金总储备</div>
                      <div className="text-xl font-black text-[#1877F2] mt-0.5">
                        ¥{currentPlan.breakdown.totalInitialCashNeeded.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#65676B] mt-0.5">
                        含搬运、押金及前3月生活缓冲金
                      </div>
                    </div>

                    <div className="bg-[#F7F8FA] p-2.5 rounded-sm border border-[#E4E6EB]">
                      <div className="text-[10px] text-[#65676B]">落地预计月开销</div>
                      <div className="text-xl font-black text-[#050505] mt-0.5">
                        ¥{currentPlan.monthlyLocalIncomeVsExpense.estimatedExpense.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#65676B] mt-0.5">
                        住房、餐饮与本地交通基本开支
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 p-2.5 rounded-sm border border-emerald-200">
                      <div className="text-[10px] text-[#65676B]">月度收支预计净盈余</div>
                      <div className="text-xl font-black text-emerald-700 mt-0.5">
                        ¥{currentPlan.monthlyLocalIncomeVsExpense.netMonthlySurplus.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-800 mt-0.5">
                        盈余率 {((currentPlan.monthlyLocalIncomeVsExpense.netMonthlySurplus / (monthlyIncome || 1)) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. 搬迁启动金明细列表 */}
                <div className="bg-white p-3 rounded-md border border-[#E4E6EB]">
                  <div className="text-xs font-bold text-[#050505] mb-2">
                    首期启动现金储备明细拆解 (一次性过渡投入)
                  </div>
                  <div className="divide-y divide-[#E4E6EB] text-xs">
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#65676B]">跨城行李与家私托运包车</span>
                      <span className="font-mono font-bold text-[#050505]">
                        ¥{currentPlan.breakdown.movingAndTransport}
                      </span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#65676B]">租房押金与首期房租 (押一付三)</span>
                      <span className="font-mono font-bold text-[#050505]">
                        ¥{currentPlan.breakdown.rentalDepositAndAdvance}
                      </span>
                    </div>
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#65676B]">新居软装寝具与小家电添置</span>
                      <span className="font-mono font-bold text-[#050505]">
                        ¥{currentPlan.breakdown.furnitureAndAppliances}
                      </span>
                    </div>
                    {currentPlan.breakdown.initialSchoolOrRegistration > 0 && (
                      <div className="py-1.5 flex justify-between">
                        <span className="text-[#65676B]">子女转学/入托前期杂费</span>
                        <span className="font-mono font-bold text-[#050505]">
                          ¥{currentPlan.breakdown.initialSchoolOrRegistration}
                        </span>
                      </div>
                    )}
                    <div className="py-1.5 flex justify-between">
                      <span className="text-[#65676B]">前3个月基本生活缓冲备用金 (防失业/调岗空窗)</span>
                      <span className="font-mono font-bold text-[#1877F2]">
                        ¥{currentPlan.breakdown.firstThreeMonthsBuffer}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. 跨省/跨城定居落地办事指引清单 */}
                <div className="bg-white p-3 rounded-md border border-[#E4E6EB]">
                  <div className="text-xs font-bold text-[#050505] mb-2 flex items-center gap-1.5">
                    <FileText size={14} className="text-[#1877F2]" />
                    <span>定居迁入办事指引清单 ({destRegion.name})</span>
                  </div>

                  <div className="space-y-2">
                    {checklistItems.map((item, idx) => (
                      <div key={idx} className="p-2 bg-[#F7F8FA] rounded-sm border border-[#E4E6EB] text-xs">
                        <div className="font-bold text-[#050505] flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-[#1877F2]" />
                          <span>{item.title}</span>
                        </div>
                        <div className="text-[11px] text-[#65676B] mt-0.5 ml-4 leading-relaxed">
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* 已保存方案列表 */
              <div className="space-y-3">
                {state.savedRelocationPlans.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#65676B]">
                    暂未保存任何搬迁规划方案。请切换至工作台生成并保存。
                  </div>
                ) : (
                  state.savedRelocationPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-white p-3 rounded-md border border-[#E4E6EB] shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-black text-sm text-[#050505]">{plan.title}</div>
                        <button
                          type="button"
                          onClick={() => costOfLivingStore.deleteRelocationPlan(plan.id)}
                          className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                          title="删除此方案"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="text-xs text-[#65676B]">{plan.conclusionNote}</div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                        <div className="bg-[#F7F8FA] p-1.5 rounded-xs">
                          <span className="text-[10px] text-[#65676B]">首期安家金: </span>
                          <span className="font-bold text-[#1877F2]">
                            ¥{plan.breakdown.totalInitialCashNeeded}
                          </span>
                        </div>
                        <div className="bg-[#F7F8FA] p-1.5 rounded-xs">
                          <span className="text-[10px] text-[#65676B]">月支出预计: </span>
                          <span className="font-bold text-[#050505]">
                            ¥{plan.monthlyLocalIncomeVsExpense.estimatedExpense}
                          </span>
                        </div>
                        <div className="bg-[#F7F8FA] p-1.5 rounded-xs">
                          <span className="text-[10px] text-[#65676B]">月收支结余: </span>
                          <span className="font-bold text-emerald-700">
                            ¥{plan.monthlyLocalIncomeVsExpense.netMonthlySurplus}
                          </span>
                        </div>
                        <div className="bg-[#F7F8FA] p-1.5 rounded-xs">
                          <span className="text-[10px] text-[#65676B]">家庭人口: </span>
                          <span className="font-bold text-[#050505]">{plan.householdSize}人</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-[#65676B] pt-1 border-t border-[#E4E6EB] flex justify-between">
                        <span>创建日期：{plan.createdAt}</span>
                        <span className="text-[#1877F2] font-bold">{plan.conclusionTag}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
