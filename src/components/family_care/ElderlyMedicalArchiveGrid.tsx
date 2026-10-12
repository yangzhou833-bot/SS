import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Moon, 
  Pill, 
  Plus, 
  Check, 
  Clock, 
  ShieldCheck, 
  Bell, 
  Sparkles, 
  AlertTriangle, 
  Sunrise, 
  Sun, 
  Sunset, 
  Flame, 
  Send,
  Watch,
  HeartPulse,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { MedicationItem } from './MedicationTimelineCard';

interface ElderlyMedicalArchiveGridProps {
  member: {
    id: string;
    name: string;
    bloodType?: string;
    deviceId?: string;
    deviceName?: string;
    emergencyAllergies?: string;
    chronicConditions?: string;
    heartRate: number;
    spO2: number;
    steps: number;
    stepTarget: number;
    sleepHours: number;
    bloodPressure?: string;
    fallHistory?: string;
    reviewReminder?: string;
    medications: MedicationItem[];
  };
  onToggleMedication: (medId: string) => void;
  onOpenAddModal: () => void;
  onPushToWatch: (medName: string) => void;
}

export const ElderlyMedicalArchiveGrid: React.FC<ElderlyMedicalArchiveGridProps> = ({
  member,
  onToggleMedication,
  onOpenAddModal,
  onPushToWatch,
}) => {
  const [activeHeartRatePoint, setActiveHeartRatePoint] = useState<{ time: string; bpm: number } | null>(null);

  const totalMeds = member.medications.length;
  const takenCount = member.medications.filter(m => m.taken).length;
  const progressPercent = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 0;

  // 24-hour heart rate points (Sampled every 4 hours + current)
  const heartRateData = [
    { time: '00:00', bpm: 62 },
    { time: '04:00', bpm: 58 },
    { time: '08:00', bpm: 74 },
    { time: '12:00', bpm: 78 },
    { time: '16:00', bpm: 76 },
    { time: '20:00', bpm: 68 },
    { time: '当前', bpm: member.heartRate }
  ];

  const minBpm = Math.min(...heartRateData.map(d => d.bpm));
  const maxBpm = Math.max(...heartRateData.map(d => d.bpm));

  // SVG Area path generator for Heart Rate sparkline
  const chartW = 280;
  const chartH = 48;
  const paddingX = 8;
  const paddingY = 6;
  const plotW = chartW - paddingX * 2;
  const plotH = chartH - paddingY * 2;

  const points = heartRateData.map((d, i) => {
    const x = paddingX + (i / (heartRateData.length - 1)) * plotW;
    const y = paddingY + plotH - ((d.bpm - 50) / 45) * plotH;
    return { x, y, ...d };
  });

  const linePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartH} L ${points[0].x} ${chartH} Z`;

  const getPeriodIcon = (period?: string, timeStr?: string) => {
    if (period === 'morning' || (timeStr && timeStr.startsWith('0') && parseInt(timeStr) < 11)) {
      return <Sunrise size={11} className="text-amber-500 shrink-0" />;
    }
    if (period === 'noon' || (timeStr && parseInt(timeStr) >= 11 && parseInt(timeStr) < 15)) {
      return <Sun size={11} className="text-orange-500 shrink-0" />;
    }
    if (period === 'evening' || (timeStr && parseInt(timeStr) >= 15 && parseInt(timeStr) < 21)) {
      return <Sunset size={11} className="text-purple-500 shrink-0" />;
    }
    return <Moon size={11} className="text-indigo-500 shrink-0" />;
  };

  const getPeriodLabel = (period?: string, timeStr?: string) => {
    if (period === 'morning' || (timeStr && timeStr.startsWith('0') && parseInt(timeStr) < 11)) return '早晨';
    if (period === 'noon' || (timeStr && parseInt(timeStr) >= 11 && parseInt(timeStr) < 15)) return '中午';
    if (period === 'evening' || (timeStr && parseInt(timeStr) >= 15 && parseInt(timeStr) < 21)) return '傍晚';
    return '睡前';
  };

  return (
    <div className="space-y-2 select-none">
      {/* 1. TOP SUMMARY: 紧凑慢病与急救过敏档案条 (NO REDUNDANT DIVIDER LINES) */}
      <div className="bg-white border border-[#E4E6EB] rounded-md p-2 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#1877F2] shrink-0" />
            <h3 className="text-[11px] font-bold text-[#050505] flex items-center gap-1 leading-none truncate">
              <HeartPulse size={12} className="text-[#FA3B30] shrink-0" />
              <span>医疗健康档案与急救卡</span>
              <span className="text-[8px] bg-blue-50 text-[#1877F2] font-semibold px-1 py-0.2 rounded border border-blue-100 shrink-0">
                {member.name}
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[7.5px] text-[#1877F2] font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              直通 120 急救专网
            </span>
            <span className="text-[7.5px] text-[#31A24C] font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
              ● 档案已联网
            </span>
          </div>
        </div>

        {/* COMPACT INFORMATION CHIPS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[8.5px]">
          <div className="bg-[#F0F2F5] p-1.5 rounded-md flex items-center justify-between">
            <span className="text-[#65676B] font-bold">血型基线</span>
            <span className="font-bold text-[#050505]">{member.bloodType || 'A型 Rh+'}</span>
          </div>

          <div className="bg-[#F0F2F5] p-1.5 rounded-md flex items-center justify-between">
            <span className="text-[#65676B] font-bold">智能终端</span>
            <span className="font-bold text-[#1877F2] truncate max-w-[90px]">{member.deviceName || member.deviceId || 'H-Band Pro'}</span>
          </div>

          <div className="bg-[#F0F2F5] p-1.5 rounded-md col-span-2 flex items-center justify-between gap-1">
            <span className="text-[#65676B] font-bold shrink-0">已确诊慢病</span>
            <span className="font-bold text-[#050505] truncate">{member.chronicConditions || '原发性高血压(3级)、冠心病、骨质疏松'}</span>
          </div>

          <div className="bg-red-50 border border-red-200 p-1.5 rounded-md col-span-2 sm:col-span-4 flex items-center gap-1 text-red-900 font-medium">
            <AlertTriangle size={11} className="text-[#FA3B30] shrink-0" />
            <span className="font-bold text-[#FA3B30] shrink-0">过敏与急救禁忌：</span>
            <span className="truncate">{member.emergencyAllergies || '头孢菌素类药物过敏、严重海鲜过敏'}</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN COMPACT 2-COLUMN GRID: 体征感知 (LEFT) & 药物提醒 (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        
        {/* =================================================================== */}
        {/* LEFT COLUMN: 实时体征网格与多维趋势 (NO DIVIDER LINES)              */}
        {/* =================================================================== */}
        <div className="bg-white border border-[#E4E6EB] rounded-md p-2 shadow-2xs space-y-2">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-red-50 text-[#FA3B30] flex items-center justify-center">
                <Activity size={12} />
              </div>
              <div>
                <h4 className="text-[10.5px] font-bold text-[#050505] leading-none">实时生理体征与健康基线</h4>
                <p className="text-[7.5px] text-[#65676B] mt-0.5">连续体征采样 · 姿态防跌守护</p>
              </div>
            </div>

            <span className="text-[7.5px] text-[#31A24C] font-semibold flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#31A24C] animate-pulse" />
              体征平稳
            </span>
          </div>

          {/* 4-METRIC VITAL STATS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[8.5px]">
            {/* 1. 心率 */}
            <div className="bg-[#F0F2F5] p-1.5 rounded-md space-y-0.5">
              <div className="text-[#65676B] font-bold flex items-center justify-between">
                <span className="flex items-center gap-0.5">
                  <Heart size={10} className="text-[#FA3B30]" />
                  <span>实时心率</span>
                </span>
                <span className="text-[7px] text-[#31A24C] font-bold">● 正常</span>
              </div>
              <div className="text-[12px] font-black text-[#050505]">
                {member.heartRate} <span className="text-[7.5px] font-normal text-[#65676B]">BPM</span>
              </div>
            </div>

            {/* 2. 血氧 */}
            <div className="bg-[#F0F2F5] p-1.5 rounded-md space-y-0.5">
              <div className="text-[#65676B] font-bold flex items-center justify-between">
                <span className="flex items-center gap-0.5">
                  <Activity size={10} className="text-[#1877F2]" />
                  <span>血氧 SpO2</span>
                </span>
                <span className="text-[7px] text-[#31A24C] font-bold">● ≥95%</span>
              </div>
              <div className="text-[12px] font-black text-[#050505]">
                {member.spO2}%
              </div>
            </div>

            {/* 3. 血压 */}
            <div className="bg-[#F0F2F5] p-1.5 rounded-md space-y-0.5">
              <div className="text-[#65676B] font-bold flex items-center justify-between">
                <span className="flex items-center gap-0.5">
                  <ShieldCheck size={10} className="text-purple-600" />
                  <span>血压参考</span>
                </span>
                <span className="text-[7px] text-purple-700 font-bold">● 晨峰</span>
              </div>
              <div className="text-[11px] font-black text-[#050505] truncate">
                {member.bloodPressure || '128 / 82'}
              </div>
            </div>

            {/* 4. 睡眠 */}
            <div className="bg-[#F0F2F5] p-1.5 rounded-md space-y-0.5">
              <div className="text-[#65676B] font-bold flex items-center justify-between">
                <span className="flex items-center gap-0.5">
                  <Moon size={10} className="text-indigo-600" />
                  <span>昨夜睡眠</span>
                </span>
                <span className="text-[7px] text-indigo-700 font-bold">● 良好</span>
              </div>
              <div className="text-[12px] font-black text-[#050505]">
                {member.sleepHours} <span className="text-[7.5px] font-normal text-[#65676B]">小时</span>
              </div>
            </div>
          </div>

          {/* COMPACT HEART RATE SPARKLINE (HIGH DENSITY) */}
          <div className="bg-[#F9FAFB] border border-[#E4E6EB] rounded-md p-1.5 space-y-1">
            <div className="flex items-center justify-between text-[8px]">
              <span className="font-bold text-[#050505] flex items-center gap-1">
                <TrendingUp size={10} className="text-[#FA3B30]" />
                <span>24小时心率波动 (BPM)</span>
              </span>
              <div className="flex items-center gap-2 text-[#65676B]">
                <span>最低: <strong className="text-[#050505]">{minBpm}</strong></span>
                <span>最高: <strong className="text-[#FA3B30]">{maxBpm}</strong></span>
                {activeHeartRatePoint && (
                  <span className="text-[#1877F2] font-bold bg-blue-50 px-1 rounded border border-blue-100">
                    {activeHeartRatePoint.time}: {activeHeartRatePoint.bpm} BPM
                  </span>
                )}
              </div>
            </div>

            {/* SVG MINI SPARKLINE */}
            <div className="relative w-full h-12 bg-white rounded border border-[#E4E6EB] overflow-hidden">
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="elderlyHeartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FA3B30" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FA3B30" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Reference Baseline */}
                <line x1="0" y1={chartH / 2} x2={chartW} y2={chartH / 2} stroke="#E4E6EB" strokeDasharray="3,3" strokeWidth="1" />

                {/* Area Fill */}
                <path d={areaPath} fill="url(#elderlyHeartGradient)" />

                {/* Sparkline Curve */}
                <path d={linePath} fill="none" stroke="#FA3B30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

                {/* Interactive Points */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="3"
                      fill={p.time === '当前' ? '#FA3B30' : '#FFFFFF'}
                      stroke="#FA3B30"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-transform hover:scale-150"
                      onMouseEnter={() => setActiveHeartRatePoint({ time: p.time, bpm: p.bpm })}
                      onMouseLeave={() => setActiveHeartRatePoint(null)}
                    />
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* STEP PROGRESS & FALL SAFEGUARD BADGES (COMPACT ROW) */}
          <div className="grid grid-cols-2 gap-1.5 text-[8.5px]">
            {/* Step progress */}
            <div className="bg-[#F0F2F5] p-1.5 rounded-md space-y-1">
              <div className="flex items-center justify-between text-[#65676B] font-bold">
                <span className="flex items-center gap-1">
                  <Flame size={10} className="text-orange-500" />
                  <span>今日微动</span>
                </span>
                <span className="text-[#050505] font-bold">{member.steps} / {member.stepTarget} 步</span>
              </div>
              <div className="w-full bg-[#E4E6EB] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1877F2] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (member.steps / member.stepTarget) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fall safeguard */}
            <div className="bg-green-50 border border-green-200 p-1.5 rounded-md text-green-900 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#31A24C] flex items-center gap-1">
                  <ShieldCheck size={10} />
                  <span>跌倒监测防线</span>
                </span>
                <span className="text-[7px] text-[#31A24C] font-bold">姿态正常</span>
              </div>
              <p className="text-[7.5px] text-green-800 truncate mt-0.5">{member.fallHistory || '近30天无异常跌落'}</p>
            </div>
          </div>

          {/* HOSPITAL REVIEW REMINDER CHIP */}
          <div className="bg-blue-50 border border-blue-200 p-1.5 rounded-md flex items-center justify-between text-[8px] text-blue-900">
            <span className="flex items-center gap-1 font-bold truncate">
              <Clock size={10} className="text-[#1877F2] shrink-0" />
              <span className="truncate">复查提醒：{member.reviewReminder || '朝阳医院心血管内科定期复查 (下周三 09:30)'}</span>
            </span>
            <span className="text-[7.5px] bg-blue-100 text-[#1877F2] font-bold px-1.5 py-0.2 rounded shrink-0 ml-1">
              就医专线
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: 药物提醒与快捷打卡 (HIGH DENSITY COMPACT GRID)         */}
        {/* =================================================================== */}
        <div className="bg-white border border-[#E4E6EB] rounded-md p-2 shadow-2xs space-y-2 flex flex-col">
          {/* HEADER */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded bg-blue-50 text-[#1877F2] flex items-center justify-center">
                <Pill size={12} className="text-[#1877F2]" />
              </div>
              <div>
                <h4 className="text-[10.5px] font-bold text-[#050505] leading-none">今日用药清单与服药打卡</h4>
                <p className="text-[7.5px] text-[#65676B] mt-0.5">智能手表定时同步震动 · 远程一键打卡</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="bg-[#1877F2] hover:bg-blue-600 text-white font-bold px-2 py-0.8 rounded text-[8px] flex items-center gap-0.5 shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <Plus size={11} className="shrink-0" />
              <span>添加药物</span>
            </button>
          </div>

          {/* PROGRESS TRACKER CHIP */}
          <div className="bg-[#F0F2F5] p-1.5 rounded-md space-y-1">
            <div className="flex items-center justify-between text-[8.5px]">
              <span className="font-bold text-[#050505] flex items-center gap-1">
                <Sparkles size={10} className="text-[#1877F2]" />
                <span>服药进度：已完成 {takenCount} / {totalMeds} 次</span>
              </span>
              <span className={`font-extrabold text-[9px] ${takenCount === totalMeds && totalMeds > 0 ? 'text-[#31A24C]' : 'text-[#1877F2]'}`}>
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

          {/* COMPACT MEDICATION ITEMS LIST */}
          <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto">
            {member.medications.length === 0 ? (
              <div className="p-3 text-center text-[#65676B] text-[9px] border border-dashed border-[#CBD5E1] rounded-md">
                暂无今日服药安排，点击右上角添加。
              </div>
            ) : (
              member.medications.map((med) => {
                const periodLabel = getPeriodLabel(med.period, med.time);
                return (
                  <div
                    key={med.id}
                    className={`p-1.5 rounded-md border transition-all flex items-center justify-between gap-1.5 ${
                      med.taken
                        ? 'bg-green-50/40 border-green-200 text-[#050505]'
                        : 'bg-white border-[#E4E6EB] hover:border-[#1877F2] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {/* Checkbox trigger button */}
                      <button
                        type="button"
                        onClick={() => onToggleMedication(med.id)}
                        title={med.taken ? '点击撤销' : '点击确认已服'}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                          med.taken
                            ? 'bg-[#31A24C] border-[#31A24C] text-white shadow-2xs'
                            : 'bg-white border-[#CBD5E1] hover:border-[#1877F2] text-[#1877F2]'
                        }`}
                      >
                        {med.taken ? <Check size={11} strokeWidth={3} /> : <Clock size={11} className="shrink-0" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[7.5px] font-bold text-[#65676B] bg-[#F0F2F5] px-1 py-0.2 rounded flex items-center gap-0.5">
                            {getPeriodIcon(med.period, med.time)}
                            <span>{periodLabel} {med.time}</span>
                          </span>
                          <h5 className={`text-[9.5px] font-bold truncate ${med.taken ? 'line-through text-[#65676B]' : 'text-[#050505]'}`}>
                            {med.name}
                          </h5>
                          {med.genericName && (
                            <span className="text-[7.5px] text-[#65676B] truncate">({med.genericName})</span>
                          )}
                        </div>

                        <p className="text-[8px] text-[#65676B] truncate mt-0.5">
                          剂量: <span className="font-bold text-[#050505]">{med.dosage}</span>
                          {med.instructions ? ` · ${med.instructions}` : ' · 饭后温水送服'}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onPushToWatch(med.name)}
                        title="向老人智能手表推送震动提醒"
                        className="p-1 rounded bg-[#F0F2F5] hover:bg-blue-50 text-[#1877F2] transition-colors border border-transparent hover:border-blue-200 cursor-pointer"
                      >
                        <Watch size={11} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleMedication(med.id)}
                        className={`text-[8px] font-bold px-1.5 py-0.8 rounded border transition-colors cursor-pointer ${
                          med.taken
                            ? 'bg-green-100 text-[#31A24C] border-green-300 hover:bg-green-200'
                            : 'bg-blue-50 text-[#1877F2] border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        {med.taken ? '已服' : '打卡'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* FOOTER SYNC STATUS CHIP */}
          <div className="bg-[#F0F2F5] p-1.5 rounded-md flex items-center justify-between text-[7.5px] text-[#65676B]">
            <span className="flex items-center gap-1 font-medium">
              <Bell size={11} className="text-[#1877F2] shrink-0" />
              <span>服药提醒已与智能手表双向定时同步</span>
            </span>
            <span className="text-[#31A24C] font-bold">● 实时同步</span>
          </div>
        </div>

      </div>
    </div>
  );
};
