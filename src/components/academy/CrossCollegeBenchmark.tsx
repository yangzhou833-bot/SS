import React, { useState } from 'react';
import {
  Globe,
  TrendingUp,
  Award,
  BarChart3,
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';

interface CollegeBenchmarkItem {
  id: string;
  rank: number;
  universityName: string;
  major: string;
  starAtlasScore: number; // 专业星群指数
  attendanceRate: number; // 到课率 40%
  lighthouseBrightness: number; // 灯塔亮度 30%
  completionRate: number; // 课程完成度 20%
  activityScore: number; // 教学活跃度 10%
  isMyCollege?: boolean;
}

const BENCHMARK_DATA: CollegeBenchmarkItem[] = [
  {
    id: 'c-1',
    rank: 1,
    universityName: '清华大学 · 计算机星系',
    major: '计算机科学与技术',
    starAtlasScore: 96.8,
    attendanceRate: 98.2,
    lighthouseBrightness: 97.5,
    completionRate: 95.0,
    activityScore: 94.0,
  },
  {
    id: 'c-2',
    rank: 2,
    universityName: '北京大学 · 信息科学星系',
    major: '计算机科学与技术',
    starAtlasScore: 95.4,
    attendanceRate: 97.0,
    lighthouseBrightness: 96.2,
    completionRate: 94.5,
    activityScore: 92.8,
  },
  {
    id: 'c-3',
    rank: 3,
    universityName: '浙江大学 · 软件学院星区',
    major: '软件工程',
    starAtlasScore: 94.7,
    attendanceRate: 96.5,
    lighthouseBrightness: 95.0,
    completionRate: 93.8,
    activityScore: 91.5,
  },
  {
    id: 'c-4',
    rank: 4,
    universityName: '我校 · 计算机科学与技术学院 (学海引力星)',
    major: '计算机科学与技术 / 软件工程',
    starAtlasScore: 93.6,
    attendanceRate: 95.2,
    lighthouseBrightness: 94.0,
    completionRate: 92.5,
    activityScore: 90.0,
    isMyCollege: true,
  },
  {
    id: 'c-5',
    rank: 5,
    universityName: '上海交通大学 · 电子信息星系',
    major: '计算机科学与技术',
    starAtlasScore: 93.1,
    attendanceRate: 94.8,
    lighthouseBrightness: 93.5,
    completionRate: 91.0,
    activityScore: 89.2,
  },
  {
    id: 'c-6',
    rank: 6,
    universityName: '哈尔滨工业大学 · 计算学部',
    major: '计算机科学与技术',
    starAtlasScore: 92.4,
    attendanceRate: 94.0,
    lighthouseBrightness: 92.8,
    completionRate: 90.5,
    activityScore: 88.0,
  },
];

interface CrossCollegeBenchmarkProps {
  showToast: (msg: string) => void;
}

export const CrossCollegeBenchmark: React.FC<CrossCollegeBenchmarkProps> = ({ showToast }) => {
  return (
    <div className="space-y-3.5 max-w-md mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-purple-950/80 border border-cyan-400/30 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-cyan-400" />
            <div>
              <h3 className="text-sm font-extrabold text-white">全国高校同专业星群指数大盘</h3>
              <span className="text-[10px] text-gray-300">已接入 120+ 所高校脱敏教学大数据</span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
            ● 实时联榜
          </span>
        </div>

        {/* Formula calculation explanation */}
        <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 text-[10.5px] text-gray-300 font-mono space-y-1">
          <span className="text-cyan-300 font-bold block">📐 专业星群指数计算权重公式：</span>
          <p className="text-gray-400">
            星群指数 = 到课率×40% + 灯塔亮度×30% + 课程完成度×20% + 教学活跃度×10%
          </p>
        </div>
      </div>

      {/* My College Spotlight */}
      <div className="bg-cyan-500/10 border border-cyan-400/40 rounded-2xl p-3.5 backdrop-blur-md space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Award size={14} className="text-amber-400" />
            <span>我校计算机专业当前全国排名：第 4 名</span>
          </span>
          <span className="text-sm font-black text-cyan-300 font-mono">93.6 分</span>
        </div>
        <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
          <div className="p-1.5 bg-black/30 rounded-lg">
            <span className="text-gray-400 block">到课率(40%)</span>
            <span className="font-bold text-emerald-400">95.2%</span>
          </div>
          <div className="p-1.5 bg-black/30 rounded-lg">
            <span className="text-gray-400 block">灯塔亮度(30%)</span>
            <span className="font-bold text-cyan-300">94.0</span>
          </div>
          <div className="p-1.5 bg-black/30 rounded-lg">
            <span className="text-gray-400 block">完成度(20%)</span>
            <span className="font-bold text-purple-300">92.5%</span>
          </div>
          <div className="p-1.5 bg-black/30 rounded-lg">
            <span className="text-gray-400 block">活跃度(10%)</span>
            <span className="font-bold text-amber-300">90.0</span>
          </div>
        </div>
      </div>

      {/* Ranking List */}
      <div className="space-y-2">
        {BENCHMARK_DATA.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-2xl border backdrop-blur-md space-y-1.5 text-xs transition-all ${
              item.isMyCollege
                ? 'bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border-cyan-400/60 shadow-lg'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[11px] font-mono ${
                    item.rank === 1
                      ? 'bg-amber-400 text-black'
                      : item.rank === 2
                      ? 'bg-slate-300 text-black'
                      : item.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {item.rank}
                </span>
                <div>
                  <h4 className="font-bold text-white text-xs">{item.universityName}</h4>
                  <span className="text-[10px] text-gray-400">{item.major}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-cyan-300 font-mono block">
                  {item.starAtlasScore}
                </span>
                <span className="text-[9.5px] text-gray-400">星群指数</span>
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full"
                style={{ width: `${(item.starAtlasScore / 100) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
