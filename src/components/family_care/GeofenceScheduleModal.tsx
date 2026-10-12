import React, { useState } from 'react';
import { Clock, X, Shield, Check, Calendar, Sun, Moon, Sparkles, Sliders } from 'lucide-react';
import { Geofence } from '../FamilyCareMonitorPage';

interface GeofenceScheduleModalProps {
  geofence: Geofence | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGeofence: Geofence) => void;
}

export const GeofenceScheduleModal: React.FC<GeofenceScheduleModalProps> = ({
  geofence,
  isOpen,
  onClose,
  onSave,
}) => {
  const [preset, setPreset] = useState<'all_day' | 'school_workdays' | 'morning_evening' | 'night_sleep' | 'custom'>(
    geofence?.schedulePreset || 'all_day'
  );
  const [startTime, setStartTime] = useState<string>(geofence?.startTime || '07:45');
  const [endTime, setEndTime] = useState<string>(geofence?.endTime || '17:30');
  const [daysOfWeek, setDaysOfWeek] = useState<string>(geofence?.daysOfWeek || '周一至周五');
  const [isActive, setIsActive] = useState<boolean>(geofence?.isActive ?? true);
  const [notifyOnExit, setNotifyOnExit] = useState<boolean>(geofence?.notifyOnExit ?? true);
  const [notifyOnEnter, setNotifyOnEnter] = useState<boolean>(geofence?.notifyOnEnter ?? true);

  const applyPreset = (presetKey: 'all_day' | 'school_workdays' | 'morning_evening' | 'night_sleep' | 'custom') => {
    setPreset(presetKey);
    if (presetKey === 'all_day') {
      setStartTime('00:00');
      setEndTime('24:00');
      setDaysOfWeek('每天');
    } else if (presetKey === 'school_workdays') {
      setStartTime('07:45');
      setEndTime('17:30');
      setDaysOfWeek('周一至周五');
    } else if (presetKey === 'morning_evening') {
      setStartTime('06:30');
      setEndTime('20:00');
      setDaysOfWeek('每天');
    } else if (presetKey === 'night_sleep') {
      setStartTime('21:30');
      setEndTime('07:00');
      setDaysOfWeek('每天');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!geofence) return;
    let scheduleSummary = '';
    if (preset === 'all_day') {
      scheduleSummary = '每日全天 00:00 - 24:00 (实时布控)';
    } else if (preset === 'school_workdays') {
      scheduleSummary = `周一至周五 ${startTime} - ${endTime} (校园防线)`;
    } else if (preset === 'morning_evening') {
      scheduleSummary = `${daysOfWeek} ${startTime} - ${endTime} (散步晨练时段)`;
    } else if (preset === 'night_sleep') {
      scheduleSummary = `每日夜间 ${startTime} - ${endTime} (静卧防走失)`;
    } else {
      scheduleSummary = `${daysOfWeek} ${startTime} - ${endTime} (自定义时段)`;
    }

    const updated: Geofence = {
      ...geofence,
      schedulePreset: preset,
      startTime,
      endTime,
      daysOfWeek,
      schedule: scheduleSummary,
      isActive,
      notifyOnExit,
      notifyOnEnter
    };

    onSave(updated);
  };

  if (!isOpen || !geofence) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in select-none">
      <div className="bg-white border border-[#E4E6EB] rounded-xl shadow-xl max-w-sm w-full p-4 space-y-3">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-[#1877F2] flex items-center justify-center">
              <Shield size={14} />
            </div>
            <div>
              <h3 className="text-[12px] font-bold text-[#050505] flex items-center gap-1">
                <span>设置电子围栏动态生效时段</span>
              </h3>
              <p className="text-[8.5px] text-[#65676B]">{geofence.name} · {geofence.categoryName}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-[#65676B] hover:text-[#050505] p-1">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3 text-[10px]">
          {/* ACTIVE STATUS TOGGLE */}
          <div className="bg-[#F0F2F5] p-2 rounded-lg flex items-center justify-between border border-[#E4E6EB]">
            <div>
              <span className="font-bold text-[#050505] block">围栏防护状态</span>
              <span className="text-[8.5px] text-[#65676B]">
                {isActive ? '正在布防 · 实时根据时段自动生效' : '已暂停布防'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-2.5 py-1 rounded-md font-bold text-[9px] border transition-colors cursor-pointer ${
                isActive
                  ? 'bg-green-50 text-[#31A24C] border-green-300'
                  : 'bg-gray-200 text-gray-700 border-gray-300'
              }`}
            >
              {isActive ? '● 布防中' : '○ 已暂停'}
            </button>
          </div>

          {/* PRESET SCHEDULE CARDS */}
          <div>
            <label className="block font-bold text-[#050505] mb-1.5 flex items-center gap-1">
              <Sparkles size={11} className="text-[#1877F2]" />
              <span>常用场景预设时段</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('all_day')}
                className={`p-1.5 rounded-lg border text-left transition-all ${
                  preset === 'all_day'
                    ? 'bg-blue-50/70 border-[#1877F2] text-[#1877F2] ring-1 ring-[#1877F2]/30'
                    : 'bg-white border-[#E4E6EB] hover:border-gray-300 text-[#050505]'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>🏡 常住家园 (全天)</span>
                </div>
                <div className="text-[8px] text-[#65676B] mt-0.5">24小时全时段守护</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('school_workdays')}
                className={`p-1.5 rounded-lg border text-left transition-all ${
                  preset === 'school_workdays'
                    ? 'bg-blue-50/70 border-[#1877F2] text-[#1877F2] ring-1 ring-[#1877F2]/30'
                    : 'bg-white border-[#E4E6EB] hover:border-gray-300 text-[#050505]'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>🏫 学校 (工作日)</span>
                </div>
                <div className="text-[8px] text-[#65676B] mt-0.5">07:45 - 17:30 上学时段</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('morning_evening')}
                className={`p-1.5 rounded-lg border text-left transition-all ${
                  preset === 'morning_evening'
                    ? 'bg-blue-50/70 border-[#1877F2] text-[#1877F2] ring-1 ring-[#1877F2]/30'
                    : 'bg-white border-[#E4E6EB] hover:border-gray-300 text-[#050505]'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>🌳 公园 (散步/晨练)</span>
                </div>
                <div className="text-[8px] text-[#65676B] mt-0.5">06:30 - 20:00 休闲活动</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('night_sleep')}
                className={`p-1.5 rounded-lg border text-left transition-all ${
                  preset === 'night_sleep'
                    ? 'bg-blue-50/70 border-[#1877F2] text-[#1877F2] ring-1 ring-[#1877F2]/30'
                    : 'bg-white border-[#E4E6EB] hover:border-gray-300 text-[#050505]'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>🌙 夜间 (睡眠防走失)</span>
                </div>
                <div className="text-[8px] text-[#65676B] mt-0.5">21:30 - 07:00 静卧看护</div>
              </button>
            </div>
          </div>

          {/* TIME RANGE CONFIGURATION */}
          <div className="bg-[#F0F2F5] p-2 rounded-lg border border-[#E4E6EB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#050505] flex items-center gap-1">
                <Clock size={11} className="text-[#1877F2]" />
                <span>生效起止时间</span>
              </span>
              <button
                type="button"
                onClick={() => setPreset('custom')}
                className="text-[8px] text-[#1877F2] font-semibold hover:underline"
              >
                自定义修改
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] text-[#65676B] mb-0.5 font-bold">开始时间</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setPreset('custom');
                  }}
                  className="w-full bg-white border border-[#E4E6EB] rounded p-1 text-[10px] font-mono text-[#050505] outline-none focus:border-[#1877F2]"
                />
              </div>

              <div>
                <label className="block text-[8px] text-[#65676B] mb-0.5 font-bold">结束时间</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setPreset('custom');
                  }}
                  className="w-full bg-white border border-[#E4E6EB] rounded p-1 text-[10px] font-mono text-[#050505] outline-none focus:border-[#1877F2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[8px] text-[#65676B] mb-0.5 font-bold">生效重复周期</label>
              <select
                value={daysOfWeek}
                onChange={(e) => {
                  setDaysOfWeek(e.target.value);
                  setPreset('custom');
                }}
                className="w-full bg-white border border-[#E4E6EB] rounded p-1 text-[9.5px] text-[#050505] outline-none focus:border-[#1877F2]"
              >
                <option value="每天">每天 (周一至周日)</option>
                <option value="周一至周五">周一至周五 (仅工作日)</option>
                <option value="周末">周末 (周六与周日)</option>
                <option value="工作日及周六">周一至周六</option>
              </select>
            </div>
          </div>

          {/* NOTIFICATION TRIGGERS */}
          <div className="space-y-1 text-[9px]">
            <span className="font-bold text-[#050505] block">告警触发条件</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnExit}
                  onChange={(e) => setNotifyOnExit(e.target.checked)}
                  className="rounded text-[#1877F2] focus:ring-0 w-3 h-3 cursor-pointer"
                />
                <span className="text-[#050505]">离开围栏时告警 (防走失)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnEnter}
                  onChange={(e) => setNotifyOnEnter(e.target.checked)}
                  className="rounded text-[#1877F2] focus:ring-0 w-3 h-3 cursor-pointer"
                />
                <span className="text-[#050505]">进入围栏时提示 (到校/到家)</span>
              </label>
            </div>
          </div>

          {/* MODAL FOOTER */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E6EB]">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#F0F2F5] hover:bg-gray-200 text-[#050505] font-bold px-3 py-1.5 rounded-lg text-[9.5px] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-[#1877F2] hover:bg-blue-600 text-white font-bold px-4 py-1.5 rounded-lg text-[9.5px] flex items-center gap-1 shadow-2xs transition-colors"
            >
              <Check size={11} strokeWidth={3} />
              <span>保存生效规则</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
