import React, { useState } from 'react';
import { Activity, Heart, Moon, Flame, TrendingUp, Info, ShieldCheck, Clock } from 'lucide-react';

interface HealthTrendChartsProps {
  memberName: string;
  heartRate: number;
  spO2: number;
  steps: number;
  stepTarget: number;
  sleepHours: number;
  bloodPressure?: string;
}

export const HealthTrendCharts: React.FC<HealthTrendChartsProps> = ({
  memberName,
  heartRate,
  spO2,
  steps,
  stepTarget,
  sleepHours,
  bloodPressure = '128 / 82 mmHg',
}) => {
  const [activeHeartRatePoint, setActiveHeartRatePoint] = useState<{ time: string; bpm: number } | null>(null);
  const [activeSleepDay, setActiveSleepDay] = useState<{ day: string; deep: number; light: number; score: number } | null>(null);

  // 24-hour heart rate points (Sampled every 4 hours + current)
  const heartRateData = [
    { time: '00:00', bpm: 62 },
    { time: '04:00', bpm: 58 },
    { time: '08:00', bpm: 74 },
    { time: '12:00', bpm: 78 },
    { time: '16:00', bpm: 76 },
    { time: '20:00', bpm: 68 },
    { time: '当前', bpm: heartRate }
  ];

  // 7-day sleep quality points (deep sleep, light sleep, score)
  const sleepData = [
    { day: '周一', deep: 2.6, light: 4.6, score: 86 },
    { day: '周二', deep: 2.8, light: 4.8, score: 89 },
    { day: '周三', deep: 2.3, light: 4.5, score: 82 },
    { day: '周四', deep: 2.9, light: 4.9, score: 91 },
    { day: '周五', deep: 2.7, light: 4.7, score: 87 },
    { day: '周六', deep: 3.1, light: 5.0, score: 93 },
    { day: '昨夜', deep: 2.8, light: 4.7, score: 88 }
  ];

  // 7-day step counts
  const stepData = [
    { day: '周一', count: 6200, target: stepTarget },
    { day: '周二', count: 5800, target: stepTarget },
    { day: '周三', count: 6450, target: stepTarget },
    { day: '周四', count: 7100, target: stepTarget },
    { day: '周五', count: 5300, target: stepTarget },
    { day: '周六', count: 6900, target: stepTarget },
    { day: '今日', count: steps, target: stepTarget }
  ];

  const minBpm = Math.min(...heartRateData.map(d => d.bpm));
  const maxBpm = Math.max(...heartRateData.map(d => d.bpm));
  const avgBpm = Math.round(heartRateData.reduce((acc, curr) => acc + curr.bpm, 0) / heartRateData.length);

  // SVG Area path generator for Heart Rate (width: 280, height: 60)
  const chartW = 280;
  const chartH = 60;
  const paddingX = 12;
  const paddingY = 8;
  const plotW = chartW - paddingX * 2;
  const plotH = chartH - paddingY * 2;

  const points = heartRateData.map((d, i) => {
    const x = paddingX + (i / (heartRateData.length - 1)) * plotW;
    const y = paddingY + plotH - ((d.bpm - 50) / 45) * plotH;
    return { x, y, ...d };
  });

  const linePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartH} L ${points[0].x} ${chartH} Z`;

  return (
    <div className="bg-white border border-[#E4E6EB] rounded-md p-2.5 shadow-2xs space-y-2.5">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-red-50 text-[#FA3B30] flex items-center justify-center">
            <TrendingUp size={13} />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-[#050505] leading-none flex items-center gap-1">
              <span>多维生理健康数据趋势图表</span>
              <span className="text-[8px] bg-red-50 text-[#FA3B30] font-semibold px-1 py-0.2 rounded border border-red-100">
                {memberName}
              </span>
            </h3>
            <p className="text-[8px] text-[#65676B] mt-0.5">心率连续曲线 · 睡眠深度周期 · 7日活动达标分析</p>
          </div>
        </div>

        <span className="text-[8px] text-[#31A24C] font-semibold flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#31A24C] animate-pulse" />
          体征基线优良
        </span>
      </div>

      {/* QUICK VITALS BADGE ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[8.5px]">
        <div className="bg-[#F0F2F5] border border-[#E4E6EB] p-1.5 rounded-md">
          <div className="text-[#65676B] font-bold flex items-center gap-1">
            <Heart size={10} className="text-[#FA3B30]" />
            <span>实时心率</span>
          </div>
          <div className="text-[12px] font-extrabold text-[#050505] mt-0.5">
            {heartRate} <span className="text-[8px] font-normal text-[#65676B]">BPM</span>
          </div>
          <span className="text-[7.5px] text-[#31A24C] font-semibold">● 静息平稳 (60-100)</span>
        </div>

        <div className="bg-[#F0F2F5] border border-[#E4E6EB] p-1.5 rounded-md">
          <div className="text-[#65676B] font-bold flex items-center gap-1">
            <Activity size={10} className="text-[#1877F2]" />
            <span>血氧饱和度</span>
          </div>
          <div className="text-[12px] font-extrabold text-[#050505] mt-0.5">
            {spO2}%
          </div>
          <span className="text-[7.5px] text-[#31A24C] font-semibold">● 充盈充足 (≥95%)</span>
        </div>

        <div className="bg-[#F0F2F5] border border-[#E4E6EB] p-1.5 rounded-md">
          <div className="text-[#65676B] font-bold flex items-center gap-1">
            <ShieldCheck size={10} className="text-purple-600" />
            <span>血压参考</span>
          </div>
          <div className="text-[11px] font-extrabold text-[#050505] mt-0.5 truncate">
            {bloodPressure}
          </div>
          <span className="text-[7.5px] text-purple-700 font-semibold">● 自动晨峰监测</span>
        </div>

        <div className="bg-[#F0F2F5] border border-[#E4E6EB] p-1.5 rounded-md">
          <div className="text-[#65676B] font-bold flex items-center gap-1">
            <Moon size={10} className="text-indigo-600" />
            <span>昨夜睡眠</span>
          </div>
          <div className="text-[12px] font-extrabold text-[#050505] mt-0.5">
            {sleepHours} <span className="text-[8px] font-normal text-[#65676B]">小时</span>
          </div>
          <span className="text-[7.5px] text-indigo-700 font-semibold">● 深睡占比 37%</span>
        </div>
      </div>

      {/* CHART 1: 24-HOUR HEART RATE TREND (Area Sparkline) */}
      <div className="bg-[#F9FAFB] border border-[#E4E6EB] rounded-md p-2 space-y-1.5">
        <div className="flex items-center justify-between text-[9px]">
          <div className="flex items-center gap-1 font-bold text-[#050505]">
            <Heart size={11} className="text-[#FA3B30]" />
            <span>24小时心率连续趋势 (BPM)</span>
          </div>
          <div className="flex items-center gap-2 text-[8px] text-[#65676B]">
            <span>最低: <strong className="text-[#050505]">{minBpm}</strong></span>
            <span>最高: <strong className="text-[#050505]">{maxBpm}</strong></span>
            <span>均值: <strong className="text-[#1877F2]">{avgBpm}</strong></span>
          </div>
        </div>

        {/* INTERACTIVE AREA GRAPH */}
        <div className="relative w-full h-[64px] bg-white border border-[#E4E6EB] rounded overflow-hidden select-none">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FA3B30" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FA3B30" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid baseline lines */}
            <line x1="0" y1="18" x2={chartW} y2="18" stroke="#F0F2F5" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="0" y1="36" x2={chartW} y2="36" stroke="#F0F2F5" strokeWidth="1" strokeDasharray="3,3" />

            {/* Area & Line */}
            <path d={areaPath} fill="url(#heartGradient)" />
            <path d={linePath} fill="none" stroke="#FA3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {points.map((p, idx) => (
              <g key={idx} className="cursor-pointer" onMouseEnter={() => setActiveHeartRatePoint(p)} onClick={() => setActiveHeartRatePoint(p)}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill="#ffffff"
                  stroke="#FA3B30"
                  strokeWidth="1.8"
                  className="hover:r-4 transition-all"
                />
              </g>
            ))}
          </svg>

          {/* HOVER TOOLTIP POPUP */}
          {activeHeartRatePoint && (
            <div className="absolute top-1 right-2 bg-black/80 text-white text-[8px] px-1.5 py-0.5 rounded font-mono shadow">
              {activeHeartRatePoint.time}: {activeHeartRatePoint.bpm} BPM
            </div>
          )}
        </div>

        {/* X AXIS LABELS */}
        <div className="flex justify-between text-[7.5px] text-[#65676B] px-1 font-mono">
          {heartRateData.map((d, i) => (
            <span key={i}>{d.time}</span>
          ))}
        </div>
      </div>

      {/* CHART 2: 7-DAY SLEEP QUALITY (STACKED BARS) & 7-DAY STEPS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* SLEEP BARS */}
        <div className="bg-[#F9FAFB] border border-[#E4E6EB] rounded-md p-2 space-y-1.5">
          <div className="flex items-center justify-between text-[9px]">
            <div className="flex items-center gap-1 font-bold text-[#050505]">
              <Moon size={11} className="text-indigo-600" />
              <span>7日睡眠时长与质量结构</span>
            </div>
            <span className="text-[8px] text-indigo-700 font-bold bg-indigo-50 px-1 py-0.2 rounded">
              周均 7.4h
            </span>
          </div>

          <div className="h-[60px] flex items-end justify-between gap-1 pt-2 px-1">
            {sleepData.map((d, idx) => {
              const totalHours = d.deep + d.light;
              const barHeightPct = Math.min(100, (totalHours / 9) * 100);
              const deepPct = (d.deep / totalHours) * 100;
              const lightPct = 100 - deepPct;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                  onClick={() => setActiveSleepDay(d)}
                >
                  <div
                    className="w-full max-w-[18px] bg-indigo-100 rounded-t flex flex-col overflow-hidden border border-indigo-200 group-hover:border-indigo-500 transition-all"
                    style={{ height: `${barHeightPct}%` }}
                    title={`${d.day}: 深睡${d.deep}h + 浅睡${d.light}h = ${totalHours.toFixed(1)}h (评分${d.score})`}
                  >
                    <div className="bg-indigo-300 w-full" style={{ height: `${lightPct}%` }} />
                    <div className="bg-indigo-600 w-full flex-1" />
                  </div>
                  <span className="text-[7.5px] text-[#65676B]">{d.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3 text-[7.5px] text-[#65676B] border-t border-[#E4E6EB] pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-indigo-600 inline-block" />
              <span>深睡眠</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-indigo-300 inline-block" />
              <span>浅睡眠</span>
            </span>
          </div>
        </div>

        {/* 7-DAY STEPS BARS */}
        <div className="bg-[#F9FAFB] border border-[#E4E6EB] rounded-md p-2 space-y-1.5">
          <div className="flex items-center justify-between text-[9px]">
            <div className="flex items-center gap-1 font-bold text-[#050505]">
              <Flame size={11} className="text-orange-500" />
              <span>7日步数活动与目标达成</span>
            </div>
            <span className="text-[8px] text-orange-700 font-bold bg-orange-50 px-1 py-0.2 rounded">
              目标 6,000步
            </span>
          </div>

          <div className="h-[60px] flex items-end justify-between gap-1 pt-2 px-1 relative">
            {/* Target line */}
            <div className="absolute top-[28%] left-0 right-0 border-b border-dashed border-orange-300 z-0 pointer-events-none" />

            {stepData.map((d, idx) => {
              const isTargetReached = d.count >= d.target;
              const barHeightPct = Math.min(100, (d.count / 8000) * 100);

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1 cursor-pointer group z-10"
                  title={`${d.day}: ${d.count} 步 (${isTargetReached ? '已达标' : '未达标'})`}
                >
                  <div
                    className={`w-full max-w-[18px] rounded-t transition-all border ${
                      isTargetReached
                        ? 'bg-[#31A24C] border-green-600 group-hover:brightness-110'
                        : 'bg-[#1877F2] border-blue-600 group-hover:brightness-110'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />
                  <span className="text-[7.5px] text-[#65676B]">{d.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3 text-[7.5px] text-[#65676B] border-t border-[#E4E6EB] pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#31A24C] inline-block" />
              <span>目标达成</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#1877F2] inline-block" />
              <span>常态活动</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
