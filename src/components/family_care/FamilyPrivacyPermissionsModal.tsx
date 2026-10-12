import React, { useState } from 'react';
import {
  Lock,
  X,
  Eye,
  EyeOff,
  Shield,
  Clock,
  Check,
  AlertTriangle,
  History,
  Info,
  Sliders,
  RotateCcw
} from 'lucide-react';

export interface FamilyPrivacyPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTogglePauseMyLocation: () => void;
  isMyLocationPaused: boolean;
}

export const FamilyPrivacyPermissionsModal: React.FC<FamilyPrivacyPermissionsModalProps> = ({
  isOpen,
  onClose,
  onTogglePauseMyLocation,
  isMyLocationPaused,
}) => {
  const [approximateOnly, setApproximateOnly] = useState(false);
  const [tempShareDuration, setTempShareDuration] = useState<'off' | '1h' | '8h' | '24h'>('off');
  const [stopHistoryShare, setStopHistoryShare] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in select-none">
      <div className="bg-white border border-[#E4E6EB] rounded-xl shadow-2xl max-w-lg w-full p-4 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 text-[#1877F2] flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#050505]">权限与隐私透明度控制</h3>
              <p className="text-[10.5px] text-[#65676B]">配置全网地理位置、历史轨迹与提醒可见范围</p>
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

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-[11px]">
          {/* Transparency Matrix */}
          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-md space-y-2">
            <h4 className="font-bold text-[#1877F2] flex items-center gap-1">
              <Eye size={13} />
              可见范围透明度概览
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10.5px] text-[#050505]">
              <div className="bg-white p-2 rounded border border-[#E4E6EB]">
                <p className="text-[#65676B]">实时定位可见</p>
                <p className="font-bold text-[#1877F2]">全家庭 6 位成员</p>
              </div>
              <div className="bg-white p-2 rounded border border-[#E4E6EB]">
                <p className="text-[#65676B]">今日轨迹可见</p>
                <p className="font-bold text-[#31A24C]">仅家庭管理员 (2人)</p>
              </div>
              <div className="bg-white p-2 rounded border border-[#E4E6EB]">
                <p className="text-[#65676B]">历史轨迹可见</p>
                <p className="font-bold text-[#F59E0B]">需授权 (默认 7 天)</p>
              </div>
              <div className="bg-white p-2 rounded border border-[#E4E6EB]">
                <p className="text-[#65676B]">安全提醒接收</p>
                <p className="font-bold text-[#FA3B30]">紧急事件全员推送</p>
              </div>
            </div>
          </div>

          {/* Privacy Controls */}
          <div className="space-y-2 border-t border-[#E4E6EB] pt-3">
            <h4 className="font-bold text-[#050505]">快捷隐私防护开关</h4>

            {/* Pause Location */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-[#E4E6EB] rounded">
              <div>
                <p className="font-bold text-[#050505]">暂停我的位置更新 (隐身模式)</p>
                <p className="text-[10px] text-[#65676B]">开启后其他成员仅能看到您最后一次有效位置。</p>
              </div>
              <button
                type="button"
                onClick={onTogglePauseMyLocation}
                className={`px-3 py-1 rounded text-[11px] font-bold cursor-pointer ${
                  isMyLocationPaused
                    ? 'bg-[#FA3B30] text-white hover:bg-red-600'
                    : 'bg-[#1877F2] text-white hover:bg-blue-600'
                }`}
              >
                {isMyLocationPaused ? '已暂停定位' : '正常共享中'}
              </button>
            </div>

            {/* Approximate location only */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-[#E4E6EB] rounded">
              <div>
                <p className="font-bold text-[#050505]">仅共享大概位置 (500m 模糊圈)</p>
                <p className="text-[10px] text-[#65676B]">隐藏门牌精准经纬度，仅向非主监护人展示周边街区。</p>
              </div>
              <button
                type="button"
                onClick={() => setApproximateOnly(!approximateOnly)}
                className={`px-3 py-1 rounded text-[11px] font-bold cursor-pointer ${
                  approximateOnly ? 'bg-[#31A24C] text-white' : 'bg-gray-200 text-[#050505]'
                }`}
              >
                {approximateOnly ? '已开启模糊' : '精准位置'}
              </button>
            </div>

            {/* Temporary Location Sharing */}
            <div className="p-2.5 bg-gray-50 border border-[#E4E6EB] rounded space-y-1.5">
              <p className="font-bold text-[#050505]">临时共享位置有效时间设置</p>
              <div className="flex items-center gap-2">
                {(['off', '1h', '8h', '24h'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTempShareDuration(d)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer ${
                      tempShareDuration === d ? 'bg-[#1877F2] text-white' : 'bg-white border border-[#E4E6EB] text-[#050505]'
                    }`}
                  >
                    {d === 'off' ? '长效共享' : `${d} 计时`}
                  </button>
                ))}
              </div>
            </div>

            {/* Stop History Sharing */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-[#E4E6EB] rounded">
              <div>
                <p className="font-bold text-[#050505]">停止共享历史轨迹</p>
                <p className="text-[10px] text-[#65676B]">即刻锁止过往 7-30 天的历史漫游轨迹明细。</p>
              </div>
              <button
                type="button"
                onClick={() => setStopHistoryShare(!stopHistoryShare)}
                className={`px-3 py-1 rounded text-[11px] font-bold cursor-pointer ${
                  stopHistoryShare ? 'bg-[#FA3B30] text-white' : 'bg-gray-200 text-[#050505]'
                }`}
              >
                {stopHistoryShare ? '已锁定历史' : '正常共享'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E4E6EB] pt-3 shrink-0 flex items-center justify-between">
          <span className="text-[10px] text-[#65676B]">所有规则依据 ISO 27701 隐私标准脱敏加密</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1877F2] text-white rounded-md text-[12px] font-bold hover:bg-blue-600 transition-colors cursor-pointer"
          >
            保存隐私设置
          </button>
        </div>
      </div>
    </div>
  );
};
