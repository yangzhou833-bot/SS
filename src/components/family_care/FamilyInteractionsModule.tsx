import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  MapPin,
  Calendar,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Navigation,
  Heart,
  Plus
} from 'lucide-react';
import { CareMember } from '../FamilyCareMonitorPage';

export interface FamilyInteractionsModuleProps {
  members: CareMember[];
  onInitiateAssembly: () => void;
  onShareMyLocation: () => void;
  onCreatePlan: () => void;
  onSendToGroupChat: () => void;
  onViewJointTrajectory: () => void;
}

export const FamilyInteractionsModule: React.FC<FamilyInteractionsModuleProps> = ({
  members,
  onInitiateAssembly,
  onShareMyLocation,
  onCreatePlan,
  onSendToGroupChat,
  onViewJointTrajectory,
}) => {
  const [momConfirmed, setMomConfirmed] = useState(true);
  const [dadConfirmed, setDadConfirmed] = useState(false);

  return (
    <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
        <div className="flex items-center gap-1.5">
          <Heart size={15} className="text-[#FA3B30]" />
          <h4 className="text-[13px] font-bold text-[#050505]">家庭互动与共同足迹</h4>
          <span className="text-[10px] bg-red-50 text-[#FA3B30] font-bold px-1.5 py-0.5 rounded-sm border border-red-200">
            亲密度 100%
          </span>
        </div>

        <button
          type="button"
          onClick={onInitiateAssembly}
          className="px-2.5 py-1 bg-[#1877F2] text-white rounded-sm text-[11px] font-bold flex items-center gap-1 hover:bg-blue-600 transition-colors cursor-pointer shadow-2xs"
        >
          <Users size={12} />
          <span>发起家庭集合</span>
        </button>
      </div>

      {/* Joint Footprints & Interaction Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        {/* Joint Visit Log */}
        <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-md space-y-1">
          <div className="flex items-center gap-1 font-bold text-[#1877F2]">
            <MapPin size={13} />
            <span>共同到访回忆</span>
          </div>
          <p className="text-[#050505] font-semibold">“你们昨天一起去过中山桥”</p>
          <p className="text-[10px] text-[#65676B]">本周家庭共同到访 3 个地点 · 留下 12 张家庭留影</p>
          <button
            type="button"
            onClick={onViewJointTrajectory}
            className="mt-1 text-[10px] text-[#1877F2] font-bold underline cursor-pointer"
          >
            查看共同轨迹 &rarr;
          </button>
        </div>

        {/* Family Group Chat Activity */}
        <div className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-md space-y-1">
          <div className="flex items-center gap-1 font-bold text-[#31A24C]">
            <MessageSquare size={13} />
            <span>家庭群动态</span>
          </div>
          <p className="text-[#050505] font-semibold">家庭群最近一次互动：今天 09:27</p>
          <p className="text-[10px] text-[#65676B]">妈妈: “今晚做红烧肉，大家准时回家！”</p>
          <button
            type="button"
            onClick={onSendToGroupChat}
            className="mt-1 text-[10px] text-[#31A24C] font-bold underline cursor-pointer"
          >
            进入家庭群聊 &rarr;
          </button>
        </div>
      </div>

      {/* Shared Family Plan Widget */}
      <div className="p-2.5 bg-white border border-[#E4E6EB] rounded-md space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-[#050505]">
            <Calendar size={13} className="text-[#F59E0B]" />
            <span>周末家庭聚餐计划：东方红广场</span>
          </div>
          <span className="text-[10px] text-[#65676B]">本周六 18:00</span>
        </div>

        <div className="flex items-center justify-between bg-gray-50 p-2 rounded text-[10.5px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              妈妈: {momConfirmed ? <span className="text-[#31A24C] font-bold">已确认参会</span> : <span className="text-gray-400">未确认</span>}
            </span>
            <span className="flex items-center gap-1">
              爸爸: {dadConfirmed ? <span className="text-[#31A24C] font-bold">已确认参会</span> : <span className="text-[#F59E0B] font-bold">尚未确认</span>}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDadConfirmed(!dadConfirmed)}
            className="px-2 py-0.5 bg-blue-50 text-[#1877F2] font-bold text-[10px] rounded border border-blue-200 hover:bg-blue-100 cursor-pointer"
          >
            {dadConfirmed ? '取消确认' : '替爸爸确认'}
          </button>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
        <button
          type="button"
          onClick={onShareMyLocation}
          className="p-2 bg-gray-50 border border-[#E4E6EB] hover:bg-blue-50 hover:border-[#1877F2] rounded text-[#050505] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <Share2 size={12} className="text-[#1877F2]" />
          <span>共享我的位置</span>
        </button>

        <button
          type="button"
          onClick={onCreatePlan}
          className="p-2 bg-gray-50 border border-[#E4E6EB] hover:bg-emerald-50 hover:border-[#31A24C] rounded text-[#050505] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <Plus size={12} className="text-[#31A24C]" />
          <span>创建家庭计划</span>
        </button>

        <button
          type="button"
          onClick={onSendToGroupChat}
          className="p-2 bg-gray-50 border border-[#E4E6EB] hover:bg-purple-50 hover:border-purple-600 rounded text-[#050505] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <Send size={12} className="text-purple-600" />
          <span>发送到家庭群</span>
        </button>

        <button
          type="button"
          onClick={onViewJointTrajectory}
          className="p-2 bg-gray-50 border border-[#E4E6EB] hover:bg-amber-50 hover:border-[#F59E0B] rounded text-[#050505] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <Navigation size={12} className="text-[#F59E0B]" />
          <span>查看共同轨迹</span>
        </button>
      </div>
    </div>
  );
};
