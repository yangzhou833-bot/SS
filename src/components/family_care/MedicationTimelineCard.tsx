import React from 'react';
import { Pill, Plus, Check, Clock, Bell, Sparkles, AlertCircle, Sun, Sunrise, Sunset, Moon } from 'lucide-react';

export interface MedicationItem {
  id: string;
  name: string;
  genericName?: string;
  time: string;
  dosage: string;
  instructions?: string;
  period?: 'morning' | 'noon' | 'evening' | 'night';
  taken: boolean;
  takenAt?: string;
}

interface MedicationTimelineCardProps {
  memberName: string;
  medications: MedicationItem[];
  onToggleMedication: (medId: string) => void;
  onOpenAddModal: () => void;
  onPushToWatch: (medName: string) => void;
}

export const MedicationTimelineCard: React.FC<MedicationTimelineCardProps> = ({
  memberName,
  medications,
  onToggleMedication,
  onOpenAddModal,
  onPushToWatch,
}) => {
  const totalMeds = medications.length;
  const takenCount = medications.filter(m => m.taken).length;
  const progressPercent = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 0;

  const getPeriodIcon = (period?: string, timeStr?: string) => {
    if (period === 'morning' || (timeStr && timeStr.startsWith('0') && parseInt(timeStr) < 11)) {
      return <Sunrise size={12} className="text-amber-500" />;
    }
    if (period === 'noon' || (timeStr && parseInt(timeStr) >= 11 && parseInt(timeStr) < 15)) {
      return <Sun size={12} className="text-orange-500" />;
    }
    if (period === 'evening' || (timeStr && parseInt(timeStr) >= 15 && parseInt(timeStr) < 21)) {
      return <Sunset size={12} className="text-purple-500" />;
    }
    return <Moon size={12} className="text-indigo-500" />;
  };

  const getPeriodLabel = (period?: string, timeStr?: string) => {
    if (period === 'morning' || (timeStr && timeStr.startsWith('0') && parseInt(timeStr) < 11)) return '早晨时段';
    if (period === 'noon' || (timeStr && parseInt(timeStr) >= 11 && parseInt(timeStr) < 15)) return '午间时段';
    if (period === 'evening' || (timeStr && parseInt(timeStr) >= 15 && parseInt(timeStr) < 21)) return '傍晚时段';
    return '夜间睡前';
  };

  return (
    <div className="bg-white border border-[#E4E6EB] rounded-md p-2.5 shadow-2xs space-y-2">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-blue-50 text-[#1877F2] flex items-center justify-center">
            <Pill size={13} className="text-[#1877F2]" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-[#050505] flex items-center gap-1 leading-none">
              <span>今日用药计划与服药提醒</span>
              <span className="text-[8px] bg-blue-50 text-[#1877F2] font-semibold px-1 py-0.2 rounded border border-blue-100">
                {memberName}
              </span>
            </h3>
            <p className="text-[8px] text-[#65676B] mt-0.5">智能手环定时同步震动 · 家人远程打卡监管</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="bg-[#1877F2] hover:bg-blue-600 text-white font-bold px-2 py-1 rounded-md text-[8.5px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
        >
          <Plus size={10} />
          <span>添加药品</span>
        </button>
      </div>

      {/* PROGRESS TRACKER */}
      <div className="bg-[#F0F2F5] p-2 rounded-md border border-[#E4E6EB] space-y-1">
        <div className="flex items-center justify-between text-[9px]">
          <span className="font-bold text-[#050505] flex items-center gap-1">
            <Sparkles size={11} className="text-[#1877F2]" />
            <span>今日服药进度：已完成 {takenCount} / {totalMeds} 次</span>
          </span>
          <span className={`font-extrabold ${takenCount === totalMeds && totalMeds > 0 ? 'text-[#31A24C]' : 'text-[#1877F2]'}`}>
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-[#E4E6EB] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              takenCount === totalMeds && totalMeds > 0 ? 'bg-[#31A24C]' : 'bg-[#1877F2]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* TIMELINE LIST */}
      {medications.length === 0 ? (
        <div className="p-4 text-center text-[#65676B] text-[9.5px] border border-dashed border-[#CBD5E1] rounded-md space-y-1">
          <AlertCircle size={16} className="mx-auto text-gray-400" />
          <p>暂无今日用药计划，点击右上角「添加药品」进行配置。</p>
        </div>
      ) : (
        <div className="relative pl-3 space-y-2 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E4E6EB]">
          {medications.map((med, index) => {
            const periodLabel = getPeriodLabel(med.period, med.time);
            return (
              <div key={med.id} className="relative flex items-start gap-2.5 text-[9px] group">
                {/* TIMELINE NODE */}
                <button
                  type="button"
                  onClick={() => onToggleMedication(med.id)}
                  title={med.taken ? '点击撤销打卡' : '点击确认已服药'}
                  className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center border transition-all cursor-pointer shrink-0 mt-0.5 ${
                    med.taken
                      ? 'bg-[#31A24C] border-[#31A24C] text-white shadow-2xs'
                      : 'bg-white border-[#1877F2] text-[#1877F2] hover:bg-blue-50 ring-2 ring-blue-100'
                  }`}
                >
                  {med.taken ? (
                    <Check size={11} strokeWidth={3} />
                  ) : (
                    <Clock size={10} strokeWidth={2.5} className="animate-pulse" />
                  )}
                </button>

                {/* MEDICATION DETAIL BOX */}
                <div
                  className={`flex-1 p-2 rounded-md border transition-all ${
                    med.taken
                      ? 'bg-[#F9FAFB] border-[#E4E6EB] text-[#65676B]'
                      : 'bg-white border-[#E4E6EB] hover:border-[#1877F2] shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="flex items-center gap-0.5 text-[8px] font-bold text-[#65676B] bg-[#F0F2F5] px-1 py-0.2 rounded">
                          {getPeriodIcon(med.period, med.time)}
                          <span>{periodLabel}</span>
                        </span>
                        <span className="text-[10px] font-bold text-[#1877F2] font-mono">
                          {med.time}
                        </span>
                        <h4 className={`text-[10px] font-bold truncate ${med.taken ? 'line-through text-[#65676B]' : 'text-[#050505]'}`}>
                          {med.name}
                        </h4>
                        {med.genericName && (
                          <span className="text-[8px] text-[#65676B]">({med.genericName})</span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[8px] text-[#65676B] flex-wrap">
                        <span className="font-semibold text-[#050505]">剂量: {med.dosage}</span>
                        {med.instructions && (
                          <span className="bg-amber-50 text-amber-800 border border-amber-100 px-1 py-0.2 rounded font-medium">
                            {med.instructions}
                          </span>
                        )}
                        {med.taken && med.takenAt && (
                          <span className="text-[#31A24C] font-semibold">● 于 {med.takenAt} 准时完成</span>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!med.taken && (
                        <button
                          type="button"
                          onClick={() => onPushToWatch(med.name)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.8 rounded text-[7.5px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                          title="向老人智能手环发送强震动提醒"
                        >
                          <Bell size={11} className="text-amber-600 shrink-0" />
                          <span>手环提醒</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onToggleMedication(med.id)}
                        className={`font-bold px-2 py-0.8 rounded text-[8px] border transition-colors cursor-pointer ${
                          med.taken
                            ? 'bg-green-50 text-[#31A24C] border-green-200 hover:bg-green-100'
                            : 'bg-[#1877F2] text-white border-[#1877F2] hover:bg-blue-600 shadow-2xs'
                        }`}
                      >
                        {med.taken ? '已服 · 撤销' : '一键打卡'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
