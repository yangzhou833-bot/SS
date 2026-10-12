import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Battery,
  ShieldAlert,
  Clock,
  Phone,
  Eye,
  CheckCircle2,
  XCircle,
  Zap,
  Navigation,
  CloudRain,
  Activity,
  Sliders
} from 'lucide-react';
import { CareMember } from '../FamilyCareMonitorPage';

export interface SafetyAlertItem {
  id: string;
  memberId?: string;
  memberName: string;
  type: 'geofence_enter' | 'geofence_exit' | 'delay' | 'low_battery' | 'gps_lost' | 'still' | 'hazard' | 'sos' | 'weather';
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'emergency';
  isResolved: boolean;
  coords?: { x: number; y: number };
}

export interface FamilySafetyAlertsFeedProps {
  members: CareMember[];
  onViewMapCoords: (coords: { x: number; y: number }) => void;
  onViewMemberTrajectory: (memberId: string) => void;
  onContactMember: (memberId: string) => void;
  onOpenRulesConfig?: () => void;
}

const DEFAULT_ALERTS: SafetyAlertItem[] = [
  {
    id: 'alert-1',
    memberId: 'm4',
    memberName: '郭欣怡 (女儿)',
    type: 'geofence_enter',
    title: '女儿已安全到达学校',
    description: '电子围栏「朝阳第一小学」触发进入打卡，打卡精度 ±3m。',
    timestamp: '今天 08:52',
    severity: 'low',
    isResolved: true,
    coords: { x: 30, y: 30 },
  },
  {
    id: 'alert-2',
    memberId: 'm3',
    memberName: '郭建国 (爸爸)',
    type: 'geofence_exit',
    title: '爸爸已离开家庭安全区',
    description: '汽车驶出阳光家园边界，处于驾车通勤状态，预计 45 分钟后到达公司。',
    timestamp: '今天 08:15',
    severity: 'low',
    isResolved: true,
    coords: { x: 65, y: 35 },
  },
  {
    id: 'alert-3',
    memberId: 'm5',
    memberName: '郭小宇 (儿子)',
    type: 'delay',
    title: '儿子预计到家时间已延迟 15 分钟',
    description: '通学绿道沿途停留时间超限，目前正步行于文昌路绿道，预计 18:20 到家。',
    timestamp: '10 分钟前',
    severity: 'medium',
    isResolved: false,
    coords: { x: 55, y: 62 },
  },
  {
    id: 'alert-4',
    memberId: 'm5',
    memberName: '郭小宇 (儿子)',
    type: 'low_battery',
    title: '儿子手机电量低于 20%',
    description: '设备电量仅剩 18%，已为您自动发起低电量超省电定位守护策略。',
    timestamp: '5 分钟前',
    severity: 'medium',
    isResolved: false,
    coords: { x: 55, y: 62 },
  },
  {
    id: 'alert-5',
    memberId: 'm6',
    memberName: '郭星河',
    type: 'gps_lost',
    title: '郭星河的定位已中断 8 分钟',
    description: '进入东方红广场地下停车场或高楼遮挡区域，已显示最后已知位置。',
    timestamp: '8 分钟前',
    severity: 'medium',
    isResolved: false,
    coords: { x: 50, y: 45 },
  },
  {
    id: 'alert-6',
    memberName: '全家提醒',
    type: 'hazard',
    title: '附近 300 m 发现低照明隐患区域',
    description: '网格员上报文昌路14号老旧街角施工地块施工照明缺乏，请引导长辈避开。',
    timestamp: '今天 07:30',
    severity: 'medium',
    isResolved: false,
    coords: { x: 26, y: 70 },
  },
];

export const FamilySafetyAlertsFeed: React.FC<FamilySafetyAlertsFeedProps> = ({
  members,
  onViewMapCoords,
  onViewMemberTrajectory,
  onContactMember,
  onOpenRulesConfig,
}) => {
  const [alerts, setAlerts] = useState<SafetyAlertItem[]>(DEFAULT_ALERTS);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'unresolved' | 'high'>('all');

  const toggleResolve = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === alertId ? { ...item, isResolved: !item.isResolved } : item))
    );
  };

  const suppressAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((item) => item.id !== alertId));
  };

  const filteredAlerts = alerts.filter((item) => {
    if (filterSeverity === 'unresolved') return !item.isResolved;
    if (filterSeverity === 'high') return item.severity === 'high' || item.severity === 'emergency';
    return true;
  });

  return (
    <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
        <div className="flex items-center gap-1.5">
          <Bell size={15} className="text-[#FA3B30]" />
          <h4 className="text-[13px] font-bold text-[#050505]">家庭安全提醒汇总</h4>
          <span className="text-[10px] bg-red-50 text-[#FA3B30] font-bold px-1.5 py-0.5 rounded-sm border border-red-200">
            {alerts.filter((a) => !a.isResolved).length} 条待处理
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilterSeverity('all')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded cursor-pointer ${
              filterSeverity === 'all' ? 'bg-[#1877F2] text-white' : 'bg-gray-100 text-[#65676B]'
            }`}
          >
            全部 ({alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('unresolved')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded cursor-pointer ${
              filterSeverity === 'unresolved' ? 'bg-[#FA3B30] text-white' : 'bg-gray-100 text-[#65676B]'
            }`}
          >
            未处理
          </button>
          {onOpenRulesConfig && (
            <button
              type="button"
              onClick={onOpenRulesConfig}
              className="p-1 rounded border border-[#E4E6EB] hover:bg-gray-50 text-[#65676B]"
              title="修改提醒规则"
            >
              <Sliders size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Alert Cards Feed */}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-6 text-[12px] text-[#65676B]">
            <CheckCircle2 size={24} className="mx-auto mb-1 text-[#31A24C]" />
            所有家庭安全提醒均已核实处理，守护防线稳固！
          </div>
        ) : (
          filteredAlerts.map((item) => {
            const isEmergency = item.severity === 'emergency' || item.severity === 'high';
            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-md border transition-all ${
                  item.isResolved
                    ? 'bg-gray-50 border-[#E4E6EB] opacity-70'
                    : isEmergency
                    ? 'bg-red-50/70 border-red-300 shadow-2xs'
                    : 'bg-white border-[#E4E6EB] shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    {isEmergency ? (
                      <AlertTriangle size={15} className="text-[#FA3B30] shrink-0 animate-pulse" />
                    ) : (
                      <Bell size={14} className="text-[#F59E0B] shrink-0" />
                    )}
                    <h5 className="text-[12px] font-bold text-[#050505]">{item.title}</h5>
                  </div>
                  <span className="text-[10px] text-[#65676B]">{item.timestamp}</span>
                </div>

                <p className="text-[10.5px] text-[#65676B] mt-1">{item.description}</p>

                {/* Card Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-1 mt-2 pt-1.5 border-t border-[#E4E6EB]/60">
                  <div className="flex items-center gap-1">
                    {item.coords && (
                      <button
                        type="button"
                        onClick={() => onViewMapCoords(item.coords!)}
                        className="px-1.5 py-0.5 rounded bg-blue-50 text-[#1877F2] text-[10px] font-bold hover:bg-blue-100 cursor-pointer flex items-center gap-0.5"
                      >
                        <Eye size={10} />
                        查看地图
                      </button>
                    )}
                    {item.memberId && (
                      <button
                        type="button"
                        onClick={() => onViewMemberTrajectory(item.memberId!)}
                        className="px-1.5 py-0.5 rounded bg-amber-50 text-[#F59E0B] text-[10px] font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-0.5"
                      >
                        <Navigation size={10} />
                        查看轨迹
                      </button>
                    )}
                    {item.memberId && (
                      <button
                        type="button"
                        onClick={() => onContactMember(item.memberId!)}
                        className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#31A24C] text-[10px] font-bold hover:bg-emerald-100 cursor-pointer flex items-center gap-0.5"
                      >
                        <Phone size={10} />
                        联系成员
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleResolve(item.id)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer ${
                        item.isResolved
                          ? 'bg-gray-200 text-[#050505]'
                          : 'bg-[#31A24C] text-white hover:bg-emerald-600'
                      }`}
                    >
                      {item.isResolved ? '重置未处理' : '标记已处理'}
                    </button>
                    <button
                      type="button"
                      onClick={() => suppressAlert(item.id)}
                      className="px-1.5 py-0.5 rounded bg-gray-100 text-[#65676B] hover:text-[#050505] text-[10px] cursor-pointer"
                    >
                      不再提醒
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
