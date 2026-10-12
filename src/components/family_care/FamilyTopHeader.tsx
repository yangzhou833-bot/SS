import React from 'react';
import { ChevronLeft, Shield, Settings, Bell, Clock, Activity, History } from 'lucide-react';

export interface FamilyTopHeaderProps {
  familyName?: string;
  memberCount?: number;
  onlineCount?: number;
  safetyStatus?: 'safe' | 'warning' | 'danger' | 'normal';
  safetyStatusText?: string;
  timeRange: 'realtime' | 'today' | 'history';
  setTimeRange: (range: 'realtime' | 'today' | 'history') => void;
  unreadAlertCount: number;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
}

export const FamilyTopHeader: React.FC<FamilyTopHeaderProps> = ({
  familyName = 'Stellar 幸福家庭组',
  memberCount = 6,
  onlineCount = 4,
  safetyStatus = 'safe',
  safetyStatusText = '当前安全',
  timeRange,
  setTimeRange,
  unreadAlertCount,
  onClose,
  onOpenSettings,
  onOpenNotifications,
}) => {
  const statusColors = {
    safe: { bg: 'bg-[#31A24C]/10', text: 'text-[#31A24C]', border: 'border-[#31A24C]/30', dot: 'bg-[#31A24C]' },
    warning: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30', dot: 'bg-[#F59E0B]' },
    danger: { bg: 'bg-[#FA3B30]/10', text: 'text-[#FA3B30]', border: 'border-[#FA3B30]/30', dot: 'bg-[#FA3B30]' },
    normal: { bg: 'bg-[#65676B]/10', text: 'text-[#65676B]', border: 'border-[#65676B]/30', dot: 'bg-[#65676B]' },
  };

  const currStatus = statusColors[safetyStatus] || statusColors.safe;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E4E6EB] px-3 py-2 flex flex-col gap-2 shadow-2xs select-none">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-gray-100 border border-[#E4E6EB] flex items-center justify-center text-[#050505] transition-colors cursor-pointer"
            title="返回"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-[#050505] tracking-tight">家庭守护舱</span>
              <span className="text-[10px] bg-blue-50 text-[#1877F2] font-semibold px-1.5 py-0.5 rounded-sm border border-blue-200">
                {familyName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10.5px] text-[#65676B]">
              <span>{memberCount} 位成员</span>
              <span className="w-1 h-1 rounded-full bg-[#E4E6EB]" />
              <span className="flex items-center gap-1 text-[#31A24C]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#31A24C] animate-pulse" />
                {onlineCount} 人在线
              </span>
            </div>
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Safety Status Pill */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium ${currStatus.bg} ${currStatus.text} ${currStatus.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currStatus.dot}`} />
            <span>{safetyStatusText}</span>
          </div>

          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-md hover:bg-gray-100 border border-[#E4E6EB] flex items-center justify-center text-[#65676B] hover:text-[#050505] transition-colors cursor-pointer"
            title="通知提醒"
          >
            <Bell size={16} />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FA3B30] text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center border border-white">
                {unreadAlertCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-md hover:bg-gray-100 border border-[#E4E6EB] flex items-center justify-center text-[#65676B] hover:text-[#050505] transition-colors cursor-pointer"
            title="家庭守护舱设置"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Time Range Selector Tabs */}
      <div className="flex items-center justify-between bg-[#F0F2F5] p-0.5 rounded-md border border-[#E4E6EB]">
        <button
          type="button"
          onClick={() => setTimeRange('realtime')}
          className={`flex-1 py-1 text-[11px] font-medium rounded-sm flex items-center justify-center gap-1 transition-all cursor-pointer ${
            timeRange === 'realtime'
              ? 'bg-white text-[#1877F2] font-bold shadow-2xs border border-[#E4E6EB]'
              : 'text-[#65676B] hover:text-[#050505]'
          }`}
        >
          <Activity size={12} />
          <span>实时</span>
        </button>
        <button
          type="button"
          onClick={() => setTimeRange('today')}
          className={`flex-1 py-1 text-[11px] font-medium rounded-sm flex items-center justify-center gap-1 transition-all cursor-pointer ${
            timeRange === 'today'
              ? 'bg-white text-[#1877F2] font-bold shadow-2xs border border-[#E4E6EB]'
              : 'text-[#65676B] hover:text-[#050505]'
          }`}
        >
          <Clock size={12} />
          <span>今日</span>
        </button>
        <button
          type="button"
          onClick={() => setTimeRange('history')}
          className={`flex-1 py-1 text-[11px] font-medium rounded-sm flex items-center justify-center gap-1 transition-all cursor-pointer ${
            timeRange === 'history'
              ? 'bg-white text-[#1877F2] font-bold shadow-2xs border border-[#E4E6EB]'
              : 'text-[#65676B] hover:text-[#050505]'
          }`}
        >
          <History size={12} />
          <span>历史</span>
        </button>
      </div>
    </header>
  );
};
