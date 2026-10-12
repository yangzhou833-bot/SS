import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Send,
  PhoneCall,
  Sliders,
  CheckCircle2,
  Award,
  Sparkles,
  Zap,
  Flame,
  Radio,
  FileSpreadsheet,
  Plus,
  Edit2
} from 'lucide-react';

interface UnarrivedStudent {
  id: string;
  name: string;
  avatar: string;
  major: string;
  classGroup: string;
  distanceMeters: number;
  lastLocation: string;
  lastPingTime: string;
  phone: string;
  status: 'offline' | 'moving' | 'dormitory';
}

const INITIAL_UNARRIVED: UnarrivedStudent[] = [
  {
    id: 'u-1',
    name: '周宇轩',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    major: '计算机科学与技术 2201班',
    classGroup: '第1小班',
    distanceMeters: 480,
    lastLocation: '学生宿舍区 7号楼附近',
    lastPingTime: '1分钟前',
    phone: '138****0129',
    status: 'dormitory',
  },
  {
    id: 'u-2',
    name: '陈思齐',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    major: '计算机科学与技术 2201班',
    classGroup: '第1小班',
    distanceMeters: 260,
    lastLocation: '桃李第一餐厅西侧主干道 (正在移动)',
    lastPingTime: '刚刚',
    phone: '139****8841',
    status: 'moving',
  },
  {
    id: 'u-3',
    name: '王晨阳',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=150',
    major: '计算机科学与技术 2202班',
    classGroup: '第2小班',
    distanceMeters: 620,
    lastLocation: '学校东门快递驿站',
    lastPingTime: '3分钟前',
    phone: '136****5510',
    status: 'moving',
  },
];

interface TeacherWorkbenchProps {
  showToast: (msg: string) => void;
  onNavigateToMapLocation?: (loc: { lat: number; lng: number; name?: string }) => void;
}

export const TeacherWorkbench: React.FC<TeacherWorkbenchProps> = ({
  showToast,
  onNavigateToMapLocation,
}) => {
  const [unassignedList, setUnassignedList] = useState<UnarrivedStudent[]>(INITIAL_UNARRIVED);
  const [activeTab, setActiveTab] = useState<'lighthouses' | 'unassigned' | 'settings'>('lighthouses');
  
  // Lighthouse Config States
  const [checkInRadius, setCheckInRadius] = useState<number>(100);
  const [minStayDuration, setMinStayDuration] = useState<number>(40);
  const [chatMode, setChatMode] = useState<string>('all');

  const lighthouses = [
    {
      id: 'lh-1',
      week: '第1周 周二 14:00 - 15:35',
      classroom: '逸夫楼 A-301',
      title: '行列式与矩阵乘法初论',
      status: 'completed',
      statusText: '已结课 · 点亮指数 100% ✨',
      presentCount: 96,
      totalCount: 96,
      color: 'text-emerald-400',
    },
    {
      id: 'lh-2',
      week: '第1周 周四 10:00 - 11:35',
      classroom: '逸夫楼 A-301',
      title: '分块矩阵与初等行变换',
      status: 'completed',
      statusText: '已结课 · 点亮指数 97% 🌟',
      presentCount: 93,
      totalCount: 96,
      color: 'text-emerald-400',
    },
    {
      id: 'lh-3',
      week: '第2周 周二 14:00 - 15:35 (今日进行中)',
      classroom: '逸夫楼 A-301',
      title: '线性方程组的解结构与秩',
      status: 'active',
      statusText: '⚡ 授课进行中 · 91/96 到场',
      presentCount: 91,
      totalCount: 96,
      color: 'text-cyan-400',
    },
    {
      id: 'lh-4',
      week: '第2周 周四 10:00 - 11:35',
      classroom: '逸夫楼 A-301',
      title: '向量空间与线性相关性',
      status: 'upcoming',
      statusText: '📅 待开始 · 排课已锁定',
      presentCount: 0,
      totalCount: 96,
      color: 'text-gray-400',
    },
  ];

  const handleSendReminder = (student: UnarrivedStudent) => {
    showToast(`🔔 已向【${student.name}】发送【课程灯塔入场紧急催签通知】！`);
  };

  const handleCallStudent = (student: UnarrivedStudent) => {
    showToast(`📞 正在拨打学生【${student.name}】电话：${student.phone}`);
  };

  return (
    <div className="space-y-3.5 max-w-md mx-auto">
      {/* Pilot Header Card */}
      <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-slate-900 border border-cyan-400/40 rounded-2xl p-4 shadow-xl space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 font-black text-base">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white">李建华 教授 (领航员)</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-1.5 py-0.2 rounded-full font-mono">
                  星海名师 LV.8
                </span>
              </div>
              <span className="text-[10.5px] text-gray-300">计算机学院 · 主讲《高等软件工程与系统架构》</span>
            </div>
          </div>
        </div>

        {/* Teaching Experience Bar */}
        <div className="space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
          <div className="flex justify-between text-[11px]">
            <span className="text-gray-300 font-bold flex items-center gap-1">
              <Flame size={12} className="text-amber-400" />
              <span>教学经验值 (EXP)</span>
            </span>
            <span className="text-cyan-300 font-mono font-bold">450 / 1000 EXP</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full" style={{ width: '45%' }} />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
          <div className="p-2 bg-black/30 rounded-xl border border-white/5">
            <span className="text-[10px] text-gray-400 block">本周平均到课率</span>
            <span className="text-sm font-black text-emerald-400">95.2%</span>
          </div>
          <div className="p-2 bg-black/30 rounded-xl border border-white/5">
            <span className="text-[10px] text-gray-400 block">当前未到学生</span>
            <span className="text-sm font-black text-rose-400">{unassignedList.length} 人</span>
          </div>
          <div className="p-2 bg-black/30 rounded-xl border border-white/5">
            <span className="text-[10px] text-gray-400 block">累计已点亮灯塔</span>
            <span className="text-sm font-black text-cyan-300">18 座</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
        <button
          onClick={() => setActiveTab('lighthouses')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center ${
            activeTab === 'lighthouses'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          学期排课灯塔
        </button>
        <button
          onClick={() => setActiveTab('unassigned')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center relative ${
            activeTab === 'unassigned'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          未到学生雷达
          {unassignedList.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-rose-500 text-white rounded-full font-mono">
              {unassignedList.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          签到参数规则
        </button>
      </div>

      {/* View 1: Semester Lighthouses */}
      {activeTab === 'lighthouses' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-gray-300">航线排课列表 (共 32 座灯塔)</span>
            <button
              onClick={() => showToast('➕ 新增临时加课/实验灯塔')}
              className="text-cyan-300 font-bold hover:underline flex items-center gap-0.5"
            >
              <Plus size={12} />
              <span>新建排课</span>
            </button>
          </div>

          {lighthouses.map((lh) => (
            <div
              key={lh.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md space-y-2 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-mono">{lh.week}</span>
                    <span className="text-[9.5px] bg-white/10 text-cyan-300 px-1.5 rounded">
                      {lh.classroom}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-white mt-0.5">{lh.title}</h4>
                </div>

                <span className={`text-[10.5px] font-bold ${lh.color}`}>{lh.statusText}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-gray-400">
                <span>
                  应到: <strong className="text-white">{lh.totalCount}人</strong> | 实到:{' '}
                  <strong className="text-cyan-300">{lh.presentCount}人</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast(`🔧 正在调课【${lh.title}】`)}
                    className="hover:text-cyan-300 transition-colors cursor-pointer text-[10px]"
                  >
                    调课
                  </button>
                  <button
                    onClick={() => showToast(`🛑 已暂停该次灯塔授课计划`)}
                    className="hover:text-rose-400 transition-colors cursor-pointer text-[10px]"
                  >
                    停课
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 2: Unarrived Students Radar */}
      {activeTab === 'unassigned' && (
        <div className="space-y-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs space-y-1">
            <div className="flex items-center justify-between text-rose-300 font-bold">
              <span className="flex items-center gap-1">
                <AlertTriangle size={13} className="text-rose-400" />
                <span>实时未到学生高精雷达追踪</span>
              </span>
              <span>{unassignedList.length} 人未进入灯塔半径</span>
            </div>
            <p className="text-[10.5px] text-gray-400">
              * 根据 PRD 隐私协议，仅授课老师与辅导员有权查看未到学生实时距离与位置投影。
            </p>
          </div>

          <div className="space-y-2">
            {unassignedList.map((st) => (
              <div
                key={st.id}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <img src={st.avatar} alt={st.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-rose-400/40" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{st.name}</span>
                        <span className="text-[9.5px] text-gray-400 font-mono">{st.classGroup}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 block">{st.major}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    距离灯塔 {st.distanceMeters}m
                  </span>
                </div>

                <div className="p-2 bg-black/30 rounded-xl border border-white/5 text-[10.5px] text-gray-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">最后定位位置:</span>
                    <span className="text-cyan-300 font-semibold">{st.lastLocation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">信号上报时间:</span>
                    <span className="font-mono text-gray-400">{st.lastPingTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (onNavigateToMapLocation) {
                        onNavigateToMapLocation({ lat: 36.061, lng: 103.834, name: `${st.name} 当前位置` });
                      }
                      showToast(`📍 已在地图上锁定【${st.name}】实时方位红点！`);
                    }}
                    className="px-2.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <MapPin size={11} className="text-cyan-300" />
                    <span>地图锁定</span>
                  </button>

                  <button
                    onClick={() => handleSendReminder(st)}
                    className="px-2.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Send size={11} />
                    <span>催签提醒</span>
                  </button>

                  <button
                    onClick={() => handleCallStudent(st)}
                    className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer shadow"
                  >
                    <PhoneCall size={11} />
                    <span>一键呼叫</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 3: Lighthouse Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sliders size={14} className="text-cyan-400" />
              <span>灯塔物理签到规则参数</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">● 实时生效</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-300">默认签到坐标半径</span>
                <span className="text-cyan-300 font-bold font-mono">{checkInRadius} 米</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 200].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setCheckInRadius(r);
                      showToast(`已将签到半径设为 ${r} 米`);
                    }}
                    className={`py-1.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      checkInRadius === r
                        ? 'bg-cyan-500 text-white border-cyan-300 shadow'
                        : 'bg-black/30 text-gray-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {r} 米
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-300">最低停留判定时长</span>
                <span className="text-cyan-300 font-bold font-mono">{minStayDuration} 分钟</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[30, 40, 60].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setMinStayDuration(d);
                      showToast(`已将有效到场最低停留时长设为 ${d} 分钟`);
                    }}
                    className={`py-1.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      minStayDuration === d
                        ? 'bg-cyan-500 text-white border-cyan-300 shadow'
                        : 'bg-black/30 text-gray-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {d} 分钟
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-gray-300 block mb-1">默认课堂聊天模式</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'all', label: '全员可见 · 自由互动' },
                  { key: 'host', label: '仅领航员可见 · 提问模式' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setChatMode(m.key);
                      showToast(`已切换课堂互动模式：${m.label}`);
                    }}
                    className={`p-2 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      chatMode === m.key
                        ? 'bg-cyan-500 text-white border-cyan-300 shadow'
                        : 'bg-black/30 text-gray-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] block">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
