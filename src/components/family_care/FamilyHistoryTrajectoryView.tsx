import React, { useState } from 'react';
import {
  Calendar,
  ShieldCheck,
  Lock,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileText,
  Sliders,
  BarChart2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { CareMember } from '../FamilyCareMonitorPage';

export interface FamilyHistoryTrajectoryViewProps {
  selectedMember: CareMember;
  onUpdateRetentionPolicy?: (policy: '24h' | '7d' | '30d' | 'none') => void;
}

export const FamilyHistoryTrajectoryView: React.FC<FamilyHistoryTrajectoryViewProps> = ({
  selectedMember,
  onUpdateRetentionPolicy,
}) => {
  const [rangeTab, setRangeTab] = useState<'today' | '7d' | '30d'>('today');
  const [retentionPolicy, setRetentionPolicy] = useState<'24h' | '7d' | '30d' | 'none'>('7d');

  const handlePolicyChange = (policy: '24h' | '7d' | '30d' | 'none') => {
    setRetentionPolicy(policy);
    if (onUpdateRetentionPolicy) onUpdateRetentionPolicy(policy);
  };

  return (
    <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
        <div className="flex items-center gap-1.5">
          <Calendar size={15} className="text-[#1877F2]" />
          <h4 className="text-[13px] font-bold text-[#050505]">家庭历史轨迹与档案</h4>
          <span className="text-[10px] bg-blue-50 text-[#1877F2] font-semibold px-1.5 py-0.5 rounded-sm border border-blue-200">
            {selectedMember.name}
          </span>
        </div>

        {/* Range Selector */}
        <div className="flex items-center bg-[#F0F2F5] p-0.5 rounded border border-[#E4E6EB]">
          <button
            type="button"
            onClick={() => setRangeTab('today')}
            className={`px-2 py-0.5 text-[10.5px] font-medium rounded-xs cursor-pointer ${
              rangeTab === 'today' ? 'bg-white text-[#1877F2] font-bold shadow-2xs' : 'text-[#65676B]'
            }`}
          >
            今日
          </button>
          <button
            type="button"
            onClick={() => setRangeTab('7d')}
            className={`px-2 py-0.5 text-[10.5px] font-medium rounded-xs cursor-pointer ${
              rangeTab === '7d' ? 'bg-white text-[#1877F2] font-bold shadow-2xs' : 'text-[#65676B]'
            }`}
          >
            近 7 天
          </button>
          <button
            type="button"
            onClick={() => setRangeTab('30d')}
            className={`px-2 py-0.5 text-[10.5px] font-medium rounded-xs cursor-pointer ${
              rangeTab === '30d' ? 'bg-white text-[#1877F2] font-bold shadow-2xs' : 'text-[#65676B]'
            }`}
          >
            近 30 天
          </button>
        </div>
      </div>

      {/* Authorization Banner */}
      <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-md text-[11px] text-[#1877F2] flex items-center gap-1.5">
        <Lock size={13} className="shrink-0" />
        <span className="font-medium">历史轨迹仅对获得授权的家庭成员可见，数据已通过加密通道保护。</span>
      </div>

      {/* TAB 1: TODAY SUMMARY */}
      {rangeTab === 'today' && (
        <div className="space-y-2 text-[11px]">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
              <p className="text-[#65676B] text-[10px]">今日活动里程</p>
              <p className="font-bold text-[#050505] text-[13px]">4.8 km</p>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
              <p className="text-[#65676B] text-[10px]">到访常去地点</p>
              <p className="font-bold text-[#050505] text-[13px]">3 处</p>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
              <p className="text-[#65676B] text-[10px]">预计到家时间</p>
              <p className="font-bold text-[#31A24C] text-[13px]">18:20 正常</p>
            </div>
          </div>
          <p className="text-[10px] text-[#65676B] bg-gray-50 p-2 rounded border border-[#E4E6EB]">
            📌 提示：选择「近 7 天」或「近 30 天」可查看深度活动规律与安全异常趋势图表。
          </p>
        </div>
      )}

      {/* TAB 2: LAST 7 DAYS */}
      {rangeTab === '7d' && (
        <div className="space-y-2 text-[11px]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
              <p className="text-[#65676B] text-[10px]">日均活动距离</p>
              <p className="font-bold text-[#050505] text-[13px]">6.2 km / 天</p>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
              <p className="text-[#65676B] text-[10px]">平均离/到家时间</p>
              <p className="font-bold text-[#050505] text-[12px]">07:45 离 / 18:15 到</p>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
              <p className="text-[#65676B] text-[10px]">未按时到达记录</p>
              <p className="font-bold text-[#F59E0B] text-[13px]">1 次 (已报安)</p>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
              <p className="text-[#65676B] text-[10px]">定位中断记录</p>
              <p className="font-bold text-[#31A24C] text-[13px]">0 次 (信号优良)</p>
            </div>
          </div>

          <div className="p-2.5 bg-gray-50 border border-[#E4E6EB] rounded space-y-1">
            <p className="font-bold text-[#050505]">近 7 天常去地点记录</p>
            <ul className="list-disc list-inside text-[10.5px] text-[#65676B] space-y-0.5">
              <li>朝阳第一小学 (校园): 5 次到访</li>
              <li>阳光家园2号楼 (家): 7 次到访</li>
              <li>文昌路绿道社区服务站: 3 次到访</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: LAST 30 DAYS */}
      {rangeTab === '30d' && (
        <div className="space-y-2 text-[11px]">
          <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded space-y-1.5">
            <p className="font-bold text-[#1877F2]">家庭成员活动规律与 Top 5 常去地点</p>
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div>
                <p className="text-[#65676B]">1. 阳光家园2号楼 (30次)</p>
                <p className="text-[#65676B]">2. 朝阳第一小学 (22次)</p>
                <p className="text-[#65676B]">3. 朝阳第一医院 (4次)</p>
              </div>
              <div>
                <p className="text-[#65676B]">4. 文昌路图书大厦 (3次)</p>
                <p className="text-[#65676B]">5. 东方红广场中心 (2次)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
              <p className="text-[#65676B] text-[10px]">平均每日活动里程</p>
              <p className="font-bold text-[#050505] text-[12px]">7.8 km</p>
            </div>
            <div className="p-2 bg-[#F0F2F5] rounded border border-[#E4E6EB]">
              <p className="text-[#65676B] text-[10px]">最近安全事件</p>
              <p className="font-bold text-[#31A24C] text-[12px]">无高风险报警</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Retention Settings */}
      <div className="border-t border-[#E4E6EB] pt-2 flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-[#050505] flex items-center justify-between">
          <span>管理员轨迹保存期限设置</span>
          <span className="text-[10px] text-[#65676B]">当前生效: {retentionPolicy}</span>
        </label>
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => handlePolicyChange('24h')}
            className={`py-1 text-[10px] rounded border font-medium cursor-pointer ${
              retentionPolicy === '24h' ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-gray-50 text-[#050505] border-[#E4E6EB]'
            }`}
          >
            保存 24 小时
          </button>
          <button
            type="button"
            onClick={() => handlePolicyChange('7d')}
            className={`py-1 text-[10px] rounded border font-medium cursor-pointer ${
              retentionPolicy === '7d' ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-gray-50 text-[#050505] border-[#E4E6EB]'
            }`}
          >
            保存 7 天
          </button>
          <button
            type="button"
            onClick={() => handlePolicyChange('30d')}
            className={`py-1 text-[10px] rounded border font-medium cursor-pointer ${
              retentionPolicy === '30d' ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-gray-50 text-[#050505] border-[#E4E6EB]'
            }`}
          >
            保存 30 天
          </button>
          <button
            type="button"
            onClick={() => handlePolicyChange('none')}
            className={`py-1 text-[10px] rounded border font-medium cursor-pointer ${
              retentionPolicy === 'none' ? 'bg-[#FA3B30] text-white border-[#FA3B30]' : 'bg-gray-50 text-[#050505] border-[#E4E6EB]'
            }`}
          >
            不保存历史
          </button>
        </div>
      </div>
    </div>
  );
};
