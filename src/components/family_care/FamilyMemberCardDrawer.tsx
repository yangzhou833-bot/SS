import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  PhoneCall,
  Route,
  Navigation,
  Bell,
  ShieldCheck,
  Battery,
  BatteryCharging,
  ChevronUp,
  ChevronDown,
  MapPin,
  Clock,
  Compass,
  Zap,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  Car,
  Footprints,
  Bike,
  Bus,
  Home,
  Sliders,
  Eye,
  Info
} from 'lucide-react';
import { CareMember } from '../FamilyCareMonitorPage';

export interface FamilyMemberCardDrawerProps {
  member: CareMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (member: CareMember) => void;
  onCallMember: (member: CareMember) => void;
  onViewTodayTrajectory: (member: CareMember) => void;
  onSetArrivalAlert: (member: CareMember) => void;
  onOpenDetails: (member: CareMember) => void;
}

export const FamilyMemberCardDrawer: React.FC<FamilyMemberCardDrawerProps> = ({
  member,
  isOpen,
  onClose,
  onSendMessage,
  onCallMember,
  onViewTodayTrajectory,
  onSetArrivalAlert,
  onOpenDetails,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen || !member) return null;

  const isLowBattery = member.battery <= 20;

  const getTransportBadge = () => {
    if (member.statusText.includes('驾车') || member.statusText.includes('车速')) {
      return { icon: <Car size={13} />, text: '驾车中', bg: 'bg-blue-50 text-blue-700' };
    }
    if (member.statusText.includes('步行') || member.bodyPosture === '正常行走') {
      return { icon: <Footprints size={13} />, text: '步行中', bg: 'bg-emerald-50 text-emerald-700' };
    }
    if (member.statusText.includes('骑行')) {
      return { icon: <Bike size={13} />, text: '骑行中', bg: 'bg-amber-50 text-amber-700' };
    }
    if (member.statusText.includes('公交')) {
      return { icon: <Bus size={13} />, text: '公交中', bg: 'bg-purple-50 text-purple-700' };
    }
    return { icon: <Home size={13} />, text: '静止 / 在家', bg: 'bg-gray-100 text-[#050505]' };
  };

  const transport = getTransportBadge();

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E4E6EB] shadow-2xl transition-all duration-300 flex flex-col select-none rounded-t-2xl ${
        isExpanded ? 'h-[75vh]' : 'h-[44vh]'
      }`}
    >
      {/* Top Drag Handle & Toggle */}
      <div
        className="w-full flex flex-col items-center pt-2 pb-1 bg-gray-50 border-b border-[#E4E6EB] rounded-t-2xl cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-10 h-1 bg-[#E4E6EB] rounded-full mb-1" />
        <div className="flex items-center justify-between w-full px-4 text-[11px] text-[#65676B]">
          <span className="font-bold text-[#050505]">被监护人卡片 · {member.name}</span>
          <div className="flex items-center gap-1">
            <span className="text-[#1877F2] font-semibold">{isExpanded ? '已展开' : '上滑看更多'}</span>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* TOP SECTION: Avatar, Name, Role, Safety Status, Update Time, Distance, Battery */}
        <div className="p-3 bg-white border border-[#E4E6EB] rounded-md shadow-2xs space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    member.status === 'danger' ? 'bg-[#FA3B30] animate-ping' : member.status === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#31A24C]'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-bold text-[#050505]">{member.name}</h3>
                  <span className="text-[10.5px] bg-blue-50 text-[#1877F2] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                    {member.relation}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                  <span className={`font-bold ${member.status === 'danger' ? 'text-[#FA3B30]' : member.status === 'warning' ? 'text-[#F59E0B]' : 'text-[#31A24C]'}`}>
                    {member.status === 'danger' ? '紧急触发 SOS' : member.status === 'warning' ? '需要关注' : '当前安全'}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-[#65676B]">更新: {member.lastActive}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-[#1877F2] font-bold">距家 860m</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md border border-[#E4E6EB] hover:bg-gray-100 text-[#65676B]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#E4E6EB] text-[10.5px] text-[#65676B]">
            <span className={`font-bold px-1.5 py-0.5 rounded ${isLowBattery ? 'bg-red-50 text-[#FA3B30] border border-red-200' : 'bg-gray-100'}`}>
              剩余电量: {member.battery}% {member.isCharging ? '(充电中)' : ''}
            </span>
            <span className="bg-gray-100 px-1.5 py-0.5 rounded">定位精度 ±{member.gpsAccuracy}</span>
            <span className="text-[#1877F2] font-medium flex items-center gap-0.5">
              <Eye size={10} />
              仅监护人可见
            </span>
          </div>
        </div>

        {/* MIDDLE SECTION: Location, Movement Status, Safe Fence, Schedule, Last Activity */}
        <div className="p-3 bg-gray-50 border border-[#E4E6EB] rounded-md space-y-2 text-[11.5px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-[#65676B]">当前地点与移动状态</p>
              <p className="font-bold text-[#050505] text-[13px]">{member.locationName}</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${transport.bg}`}>
              {transport.icon}
              {transport.text}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E4E6EB] text-[10.5px]">
            <div>
              <p className="text-[#65676B]">围栏守护:</p>
              <p className="font-bold text-[#31A24C]">已在安全区域内</p>
            </div>
            <div>
              <p className="text-[#65676B]">按计划到达:</p>
              <p className="font-bold text-[#1877F2]">预计 18:20 按时到家</p>
            </div>
            <div className="col-span-2">
              <p className="text-[#65676B]">今日最后活动:</p>
              <p className="font-bold text-[#050505]">{member.stayDuration} · 姿态平稳正常</p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: STRICTLY 4 PRIMARY ACTION BUTTONS */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {/* 1. 联系 */}
          <button
            type="button"
            onClick={() => onCallMember(member)}
            className="h-11 bg-[#1877F2] text-white rounded-md font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-blue-600 transition-colors cursor-pointer shadow-2xs"
          >
            <PhoneCall size={15} />
            <span>联系</span>
          </button>

          {/* 2. 查看轨迹 */}
          <button
            type="button"
            onClick={() => onViewTodayTrajectory(member)}
            className="h-11 bg-white border border-[#E4E6EB] text-[#050505] hover:bg-amber-50 hover:border-[#F59E0B] rounded-md font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Route size={15} className="text-[#F59E0B]" />
            <span>查看轨迹</span>
          </button>

          {/* 3. 设置提醒 */}
          <button
            type="button"
            onClick={() => onSetArrivalAlert(member)}
            className="h-11 bg-white border border-[#E4E6EB] text-[#050505] hover:bg-blue-50 hover:border-[#1877F2] rounded-md font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bell size={15} className="text-[#1877F2]" />
            <span>设置提醒</span>
          </button>

          {/* 4. 查看详情 / 更多 */}
          <button
            type="button"
            onClick={() => onOpenDetails(member)}
            className="h-11 bg-[#F0F2F5] border border-[#E4E6EB] text-[#050505] hover:bg-gray-200 rounded-md font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders size={15} className="text-purple-600" />
            <span>查看详情</span>
          </button>
        </div>
      </div>
    </div>
  );
};
