import React from 'react';
import { Shield, Clock, EyeOff, UserX, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Zap, Info } from 'lucide-react';
import { GroupWorkSchedule } from './types';

interface LocationRulesTimelineProps {
  schedule: GroupWorkSchedule;
  onOpenManageRules?: () => void;
}

export const LocationRulesTimeline: React.FC<LocationRulesTimelineProps> = ({
  schedule,
  onOpenManageRules,
}) => {
  const steps = [
    {
      id: 'step-1',
      title: '工作中可见 (工作时段规则)',
      timeWindow: `${schedule.workDays.join('、')} ${schedule.startTime} - ${schedule.endTime}`,
      badge: '日常基础策略',
      badgeColor: 'bg-blue-50 text-[#1877F2] border-blue-200',
      icon: Clock,
      description: '仅在设定工作日和上班时间内，针对明确授权定位的组员展示办公点及活动范围位置。',
      privacyNote: `办公坐标：${schedule.officeName}（${schedule.effectiveRadiusMeters}米半径内聚合显示）`,
      isCurrentActive: schedule.locationRuleState === 'working',
    },
    {
      id: 'step-2',
      title: '非工作时段隐藏 (自动隐私保护)',
      timeWindow: `${schedule.endTime} - 次日 ${schedule.startTime} 及节假日`,
      badge: '隐私刚性保护',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: EyeOff,
      description: '非工作时段系统自动关闭组员实时定位，绝不将最后一次历史精确位置伪装或显示为当前实时位置。',
      privacyNote: '地图统一显示“当前不显示组员定位”和规则摘要，杜绝隐蔽追踪。',
      isCurrentActive: schedule.locationRuleState === 'off_duty',
    },
    {
      id: 'step-3',
      title: '成员拒绝优先 (最高效力原则)',
      timeWindow: '全时段最高优先级',
      badge: '零容忍覆盖',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: UserX,
      description: '成员明确拒绝、开启个人隐私模式或未勾选授权时，即使在工作时段也绝不展示其位置。',
      privacyNote: '统一标识为“未授权定位”，任何看板与地图严禁透出其精确经纬度坐标。',
      isCurrentActive: false,
    },
    {
      id: 'step-4',
      title: '小队时段为临时授权 (任务窗口期)',
      timeWindow: '小队活动开始至结束',
      badge: '临时任务专用',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Zap,
      description: '创建小队并由成员单独确认后，在指定任务时段内队员互见位置；活动一旦结束，定位自动即刻关闭并锁定结束时间。',
      privacyNote: '结束后位置采集立即切断，相关任务文档保留在团队空间。',
      isCurrentActive: false,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Fixed Priority Card */}
      <div className="bg-white rounded-md border border-[#E4E6EB] p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2]">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">定位规则固定优先级法则</h3>
              <p className="text-[11px] text-gray-500">
                Stellar 定位引擎严格按照不可篡改的单向优先级判定显示策略
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 font-bold rounded-sm bg-blue-50 text-[#1877F2] border border-blue-200">
            原型演示
          </span>
        </div>

        {/* Priority Flow Diagram */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-3 overflow-x-auto">
          <div className="flex items-center space-x-1.5 min-w-[620px] text-xs">
            <div className="px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-sm font-bold flex items-center space-x-1 shrink-0">
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center">1</span>
              <span>成员明确拒绝</span>
            </div>
            <ArrowRight size={13} className="text-gray-400 shrink-0" />

            <div className="px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-sm font-bold flex items-center space-x-1 shrink-0">
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] flex items-center justify-center">2</span>
              <span>个人隐私模式</span>
            </div>
            <ArrowRight size={13} className="text-gray-400 shrink-0" />

            <div className="px-2.5 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-sm font-bold flex items-center space-x-1 shrink-0">
              <span className="w-4 h-4 rounded-full bg-gray-600 text-white text-[9px] flex items-center justify-center">3</span>
              <span>小组禁用</span>
            </div>
            <ArrowRight size={13} className="text-gray-400 shrink-0" />

            <div className="px-2.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-sm font-bold flex items-center space-x-1 shrink-0">
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center">4</span>
              <span>小队临时窗口</span>
            </div>
            <ArrowRight size={13} className="text-gray-400 shrink-0" />

            <div className="px-2.5 py-1.5 bg-blue-50 text-[#1877F2] border border-blue-200 rounded-sm font-bold flex items-center space-x-1 shrink-0">
              <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white text-[9px] flex items-center justify-center">5</span>
              <span>小组工作时段</span>
            </div>
            <ArrowRight size={13} className="text-gray-400 shrink-0" />

            <div className="px-2.5 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-sm font-bold shrink-0">
              默认状态
            </div>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-md border border-[#E4E6EB] p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            规则生命周期与时间轴
          </h4>
          {onOpenManageRules && (
            <button
              onClick={onOpenManageRules}
              className="text-xs font-bold text-[#1877F2] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>配置规则参数</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4E6EB]">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative">
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${
                    step.isCurrentActive
                      ? 'border-[#1877F2] text-[#1877F2] ring-2 ring-blue-100'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${step.isCurrentActive ? 'bg-[#1877F2]' : 'bg-gray-300'}`} />
                </div>

                <div className="bg-white rounded-md border border-[#E4E6EB] p-3 hover:border-[#1877F2]/60 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <Icon size={15} className="text-[#1877F2]" />
                      <span className="text-xs font-bold text-gray-900">{step.title}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 font-bold rounded-sm border ${step.badgeColor}`}>
                      {step.badge}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-gray-500 mb-1.5 flex items-center space-x-1">
                    <Clock size={11} />
                    <span>{step.timeWindow}</span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed mb-2">
                    {step.description}
                  </p>

                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm p-2 text-[11px] text-gray-600 flex items-start space-x-1.5">
                    <Info size={13} className="text-[#1877F2] shrink-0 mt-0.5" />
                    <span>{step.privacyNote}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
