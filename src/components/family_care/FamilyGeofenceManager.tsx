import React, { useState } from 'react';
import {
  Shield,
  MapPin,
  Clock,
  Plus,
  Edit3,
  Users,
  Bell,
  Check,
  ToggleLeft,
  ToggleRight,
  Sliders
} from 'lucide-react';
import { Geofence, CareMember } from '../FamilyCareMonitorPage';

export interface FamilyGeofenceManagerProps {
  geofences: Geofence[];
  members: CareMember[];
  onToggleGeofence: (fenceId: string) => void;
  onEditSchedule: (fence: Geofence) => void;
  onCreateGeofence: () => void;
  onFocusGeofence: (fence: Geofence) => void;
}

export const FamilyGeofenceManager: React.FC<FamilyGeofenceManagerProps> = ({
  geofences,
  members,
  onToggleGeofence,
  onEditSchedule,
  onCreateGeofence,
  onFocusGeofence,
}) => {
  return (
    <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
        <div className="flex items-center gap-1.5">
          <Shield size={15} className="text-[#1877F2]" />
          <h4 className="text-[13px] font-bold text-[#050505]">家庭安全电子围栏管理</h4>
          <span className="text-[10px] bg-blue-50 text-[#1877F2] font-semibold px-1.5 py-0.5 rounded-sm border border-blue-200">
            {geofences.filter((g) => g.isActive).length} 个激活中
          </span>
        </div>

        <button
          type="button"
          onClick={onCreateGeofence}
          className="px-2 py-1 bg-[#1877F2] text-white rounded-sm text-[11px] font-bold flex items-center gap-1 hover:bg-blue-600 transition-colors cursor-pointer"
        >
          <Plus size={12} />
          <span>创建围栏</span>
        </button>
      </div>

      {/* Geofence Cards List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {geofences.map((fence) => {
          const insideMembers = members.filter((m) => fence.membersInside.includes(m.id));

          return (
            <div
              key={fence.id}
              className={`p-2.5 rounded-md border transition-all ${
                fence.isActive ? 'bg-white border-[#E4E6EB] shadow-2xs' : 'bg-gray-50 border-[#E4E6EB] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-50 text-[#1877F2] flex items-center justify-center font-bold text-[12px] shrink-0">
                    <MapPin size={13} />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-[12px] font-bold text-[#050505]">{fence.name}</h5>
                      <span className="text-[9.5px] bg-gray-100 text-[#65676B] px-1 rounded">
                        半径 {fence.coords.r * 10}m
                      </span>
                    </div>
                    <p className="text-[10px] text-[#65676B]">{fence.schedule}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleGeofence(fence.id)}
                  className="text-[#1877F2] cursor-pointer"
                  title="开关状态"
                >
                  {fence.isActive ? <ToggleRight size={22} className="text-[#1877F2]" /> : <ToggleLeft size={22} className="text-gray-400" />}
                </button>
              </div>

              {/* Members currently inside */}
              <div className="mt-2 pt-1.5 border-t border-[#E4E6EB] flex items-center justify-between text-[10.5px]">
                <div className="flex items-center gap-1.5 text-[#65676B]">
                  <Users size={12} className="text-[#1877F2]" />
                  <span>圈内成员 ({insideMembers.length}):</span>
                  {insideMembers.length === 0 ? (
                    <span className="text-gray-400">无人</span>
                  ) : (
                    insideMembers.map((m) => (
                      <span key={m.id} className="font-bold text-[#050505] bg-gray-100 px-1 rounded">
                        {m.name.split(' ')[0]}
                      </span>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onFocusGeofence(fence)}
                    className="px-1.5 py-0.5 rounded bg-blue-50 text-[#1877F2] text-[10px] font-bold cursor-pointer"
                  >
                    聚焦定位
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditSchedule(fence)}
                    className="p-1 rounded hover:bg-gray-100 text-[#65676B] cursor-pointer"
                    title="设置规则"
                  >
                    <Sliders size={12} />
                  </button>
                </div>
              </div>

              {/* Rules summary tags */}
              <div className="flex flex-wrap items-center gap-1 mt-1.5 text-[9.5px] text-[#65676B]">
                <span className="bg-emerald-50 text-emerald-700 px-1 rounded">进入时提醒: 开启</span>
                <span className="bg-amber-50 text-amber-700 px-1 rounded">离开时提醒: 开启</span>
                <span className="bg-purple-50 text-purple-700 px-1 rounded">超时未按时到达警报: 开启</span>
                <span className="bg-blue-50 text-blue-700 px-1 rounded">低电量/中断提醒: 开启</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
