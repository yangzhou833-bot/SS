import React, { useState } from 'react';
import {
  Users,
  X,
  MapPin,
  Clock,
  Send,
  Navigation,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';
import { CareMember } from '../FamilyCareMonitorPage';

export interface FamilyAssemblyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: CareMember[];
  onConfirmSendInvitations: () => void;
}

export const FamilyAssemblyCardModal: React.FC<FamilyAssemblyCardModalProps> = ({
  isOpen,
  onClose,
  members,
  onConfirmSendInvitations,
}) => {
  const [assemblyPlace, setAssemblyPlace] = useState('东方红广场 (几何推荐集合中心)');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setSentSuccess(true);
    setTimeout(() => {
      onConfirmSendInvitations();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in select-none">
      <div className="bg-white border border-[#E4E6EB] rounded-xl shadow-2xl max-w-md w-full p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 text-[#1877F2] flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#050505]">智能家庭快速集合计算器</h3>
              <p className="text-[10.5px] text-[#65676B]">基于地图算子计算最佳中间交汇点与各人 ETA</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#65676B] hover:text-[#050505] p-1.5 rounded-md hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Assembly Location Card */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-md space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1877F2] flex items-center gap-1">
              <MapPin size={13} />
              计算最佳集合点
            </span>
            <span className="text-[10px] bg-white text-[#1877F2] px-1.5 py-0.5 rounded font-bold border border-blue-200">
              全员均衡
            </span>
          </div>
          <p className="font-bold text-[#050505] text-[13px]">{assemblyPlace}</p>
          <p className="text-[10px] text-[#65676B]">北京市朝阳区东方红广场中央音乐喷泉前 (全员平均行驶时间 12 分钟)</p>
        </div>

        {/* Member Distance & ETA List */}
        <div className="space-y-1.5 max-h-52 overflow-y-auto">
          <h4 className="text-[11px] font-bold text-[#050505]">各成员距离与预计到达时间 (ETA)</h4>
          {members.map((m, idx) => {
            const distanceText = idx === 0 ? '1.1 km' : idx === 1 ? '0.8 km' : idx === 2 ? '3.4 km' : '1.5 km';
            const etaText = idx === 0 ? '预计 8 分钟到达' : idx === 1 ? '预计 5 分钟到达' : idx === 2 ? '预计 12 分钟驾车到达' : '预计 10 分钟到达';
            return (
              <div key={m.id} className="p-2 bg-gray-50 border border-[#E4E6EB] rounded flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover border" />
                  <div>
                    <span className="font-bold text-[#050505]">{m.name}</span>
                    <span className="text-[10px] text-[#65676B] ml-2">{m.relation}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1877F2]">{distanceText}</p>
                  <p className="text-[10px] text-[#31A24C]">{etaText}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="border-t border-[#E4E6EB] pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-[#E4E6EB] hover:bg-gray-100 rounded-md text-[12px] font-medium text-[#050505] cursor-pointer"
          >
            取消
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={sentSuccess}
            className="px-4 py-1.5 bg-[#1877F2] text-white rounded-md text-[12px] font-bold flex items-center gap-1.5 hover:bg-blue-600 transition-colors cursor-pointer shadow-2xs"
          >
            {sentSuccess ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-300" />
                <span>集合邀请已群发!</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>群发家庭集合邀请</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
