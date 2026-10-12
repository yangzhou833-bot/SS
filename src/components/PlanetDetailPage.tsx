import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  Sparkles,
  Users,
  Compass,
  Calendar,
  Heart,
  MessageCircle,
  Radio,
  Plus,
  Send,
  Check,
  Shield,
  Zap,
  MapPin,
  Flame,
  Orbit,
  X,
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Search,
  ChevronRight,
  Award,
  BarChart3,
  TrendingUp,
  BookmarkCheck,
  Headphones,
  Edit3,
  FolderArchive,
  Globe,
  Sliders
} from 'lucide-react';
import { PlanetItem, PlanetMoment } from '../types';
import { AcademyPRDViewer } from './academy/AcademyPRDViewer';
import { TeacherWorkbench } from './academy/TeacherWorkbench';
import { CourseAssetsLib } from './academy/CourseAssetsLib';
import { CrossCollegeBenchmark } from './academy/CrossCollegeBenchmark';

interface PlanetDetailPageProps {
  planet: PlanetItem;
  onBack: () => void;
  onUpdatePlanet: (updated: PlanetItem) => void;
  showToast: (msg: string) => void;
  onNavigateToMapLocation?: (location: { lat: number; lng: number; name?: string }) => void;
}

interface UniversityCourse {
  id: string;
  name: string;
  code: string;
  teacher: string;
  classroom: string;
  timeSlot: string;
  dayOfWeek: number; // 1 to 7
  credits: number;
  type: '必修' | '选修' | '通识';
  color: string;
  isCheckedIn?: boolean;
  hasAssignment?: boolean;
  assignmentText?: string;
  notesCount: number;
  materialsCount: number;
}

interface AcademicAssignment {
  id: string;
  courseName: string;
  title: string;
  deadline: string;
  isUrgent: boolean;
  isCompleted: boolean;
  scoreWeight: string;
}

interface ExamSchedule {
  id: string;
  courseName: string;
  date: string;
  time: string;
  classroom: string;
  seatNumber: string;
  daysLeft: number;
}

const INITIAL_COURSES: UniversityCourse[] = [
  {
    id: 'c-1',
    name: '高等软件工程与系统架构',
    code: 'CS-4010',
    teacher: '李建华 教授 (领航员)',
    classroom: '逸夫教学楼 302',
    timeSlot: '14:00 - 15:35 (第7-8节)',
    dayOfWeek: 3,
    credits: 3.5,
    type: '必修',
    color: 'from-blue-600 to-indigo-700',
    isCheckedIn: true,
    hasAssignment: true,
    assignmentText: '期末大作业：高并发架构设计方案',
    notesCount: 42,
    materialsCount: 16,
  },
  {
    id: 'c-2',
    name: '人工智能与深度学习算法',
    code: 'AI-3020',
    teacher: '张启明 教授',
    classroom: '信息科学大楼 501',
    timeSlot: '08:00 - 09:35 (第1-2节)',
    dayOfWeek: 3,
    credits: 4.0,
    type: '必修',
    color: 'from-purple-600 to-pink-600',
    isCheckedIn: false,
    hasAssignment: true,
    assignmentText: '实验三：基于 PyTorch 的多模态情感分类器',
    notesCount: 68,
    materialsCount: 24,
  },
  {
    id: 'c-3',
    name: '分布式操作系统内核原理',
    code: 'CS-3080',
    teacher: '陈伟平 教授',
    classroom: '计算机学院实验楼 402',
    timeSlot: '10:00 - 11:35 (第3-4节)',
    dayOfWeek: 3,
    credits: 3.0,
    type: '必修',
    color: 'from-emerald-600 to-teal-700',
    isCheckedIn: true,
    hasAssignment: false,
    notesCount: 29,
    materialsCount: 10,
  },
  {
    id: 'c-4',
    name: '大学物理与量子科学实验 (II)',
    code: 'PHY-2020',
    teacher: '赵文静 教授',
    classroom: '理学院物理实验中心 204',
    timeSlot: '16:00 - 17:35 (第9-10节)',
    dayOfWeek: 1,
    credits: 2.5,
    type: '必修',
    color: 'from-amber-500 to-orange-600',
    isCheckedIn: false,
    notesCount: 5,
    materialsCount: 3,
  },
  {
    id: 'c-5',
    name: '现代宇宙天体物理与引力波导论',
    code: 'AST-1080',
    teacher: '苏教授 (学海星主)',
    classroom: '学术报告厅 A101',
    timeSlot: '19:00 - 20:35 (第11-12节)',
    dayOfWeek: 2,
    credits: 2.0,
    type: '通识',
    color: 'from-pink-500 to-rose-600',
    isCheckedIn: true,
    notesCount: 31,
    materialsCount: 12,
  },
  {
    id: 'c-6',
    name: '人机交互设计与用户体验工程',
    code: 'DES-3040',
    teacher: '林薇 副教授',
    classroom: '设计艺术学院 402',
    timeSlot: '10:00 - 11:35 (第3-4节)',
    dayOfWeek: 2,
    credits: 3.0,
    type: '选修',
    color: 'from-blue-500 to-cyan-600',
    isCheckedIn: true,
    notesCount: 19,
    materialsCount: 8,
  },
];

const INITIAL_ASSIGNMENTS: AcademicAssignment[] = [
  {
    id: 'a-1',
    courseName: '高等软件工程与系统架构',
    title: '期末大作业：高并发架构方案设计与压力测试报告',
    deadline: '明日 23:59 (剩余 1 天)',
    isUrgent: true,
    isCompleted: false,
    scoreWeight: '占比 30%',
  },
  {
    id: 'a-2',
    courseName: '人工智能与深度学习算法',
    title: '实验三：基于 PyTorch 的多模态情感分类器调优',
    deadline: '周五 18:00 (剩余 3 天)',
    isUrgent: true,
    isCompleted: false,
    scoreWeight: '占比 15%',
  },
  {
    id: 'a-3',
    courseName: '分布式操作系统内核原理',
    title: '课后作业：写进程调度算法模拟器 (C/Rust)',
    deadline: '下周一 12:00 (剩余 6 天)',
    isUrgent: false,
    isCompleted: false,
    scoreWeight: '占比 10%',
  },
  {
    id: 'a-4',
    courseName: '大学物理与量子科学实验 (II)',
    title: '实验报告 04：迈克尔逊干涉仪波长测定数据处理',
    deadline: '已按时提交',
    isUrgent: false,
    isCompleted: true,
    scoreWeight: '占比 10%',
  },
];

const INITIAL_EXAMS: ExamSchedule[] = [
  {
    id: 'ex-1',
    courseName: '高等软件工程与系统架构',
    date: '2025-06-24',
    time: '09:00 - 11:00',
    classroom: '逸夫楼 302',
    seatNumber: '08 座',
    daysLeft: 18,
  },
  {
    id: 'ex-2',
    courseName: '人工智能与深度学习算法',
    date: '2025-06-27',
    time: '14:30 - 16:30',
    classroom: '信息馆 501',
    seatNumber: '24 座',
    daysLeft: 21,
  },
  {
    id: 'ex-3',
    courseName: '分布式操作系统内核原理',
    date: '2025-07-02',
    time: '09:00 - 11:00',
    classroom: '教学楼 104',
    seatNumber: '15 座',
    daysLeft: 26,
  },
];

export const PlanetDetailPage: React.FC<PlanetDetailPageProps> = ({
  planet,
  onBack,
  onUpdatePlanet,
  showToast,
  onNavigateToMapLocation,
}) => {
  const isAcademicPlanet = planet.id === 'planet-cyber' || planet.id === 'planet-academic';

  // Identity / Role switcher state: student, teacher, supervisor, admin
  const [currentRole, setCurrentRole] = useState<'student' | 'teacher' | 'supervisor' | 'admin'>('student');

  const [activeTab, setActiveTab] = useState<string>(
    isAcademicPlanet ? 'schedule' : 'moments'
  );
  const [newMomentText, setNewMomentText] = useState('');
  const [isPostingMoment, setIsPostingMoment] = useState(false);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(3); // Wednesday as default
  const [courses, setCourses] = useState<UniversityCourse[]>(INITIAL_COURSES);
  const [assignments, setAssignments] = useState<AcademicAssignment[]>(INITIAL_ASSIGNMENTS);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [assignmentCourse, setAssignmentCourse] = useState('高等软件工程与系统架构');

  // Pomodoro timer states for Study Room
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [studySound, setStudySound] = useState<'rain' | 'waves' | 'cafe' | 'off'>('rain');
  const [onlineStudyCount, setOnlineStudyCount] = useState(148);

  // Gravitational Pulsing State
  const [isGravitationalPulsing, setIsGravitationalPulsing] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      showToast('🎉 太棒了！您已完成一个 25 分钟专注学习番茄钟周期！获得 +15 引力学分 ☕');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds, showToast]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleToggleJoin = () => {
    const nextJoined = !planet.isJoined;
    const nextCount = nextJoined ? planet.citizensCount + 1 : planet.citizensCount - 1;
    const updated = {
      ...planet,
      isJoined: nextJoined,
      citizensCount: nextCount,
    };
    onUpdatePlanet(updated);
    showToast(
      nextJoined
        ? `🎉 欢迎成为【${planet.name}】正式成员！已绑定大学学业管理档案 🎓`
        : `已退出【${planet.name}】档案`
    );
  };

  const handleSendGravitationalWave = () => {
    setIsGravitationalPulsing(true);
    showToast(`📡 已向【${planet.name}】全校课业群发射引力波！引发 ${planet.citizensCount} 位星友学霸共振 ✨`);
    setTimeout(() => {
      setIsGravitationalPulsing(false);
    }, 2500);
  };

  const handleToggleCheckIn = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const next = !c.isCheckedIn;
          showToast(
            next
              ? `✅ 课程【${c.name}】灯塔有效签到成功！停留时长达标，获得 +10 学分积分！✨`
              : `已取消【${c.name}】签到状态`
          );
          return { ...c, isCheckedIn: next };
        }
        return c;
      })
    );
  };

  const handleToggleAssignment = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          const next = !a.isCompleted;
          showToast(next ? `🎉 恭喜完成大作业【${a.title}】！获得 +5 积分！` : `已恢复作业待提交状态`);
          return { ...a, isCompleted: next };
        }
        return a;
      })
    );
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentTitle.trim()) return;
    const newAss: AcademicAssignment = {
      id: `a-${Date.now()}`,
      courseName: assignmentCourse,
      title: newAssignmentTitle.trim(),
      deadline: '剩余 5 天',
      isUrgent: false,
      isCompleted: false,
      scoreWeight: '日常考核',
    };
    setAssignments((prev) => [newAss, ...prev]);
    setNewAssignmentTitle('');
    setIsAddingAssignment(false);
    showToast('📝 新作业任务已成功添加至 DDL 看板！');
  };

  const handleLikeMoment = (momentId: string) => {
    const updatedMoments = planet.moments.map((m) => {
      if (m.id === momentId) {
        const liked = m.isLiked;
        return {
          ...m,
          isLiked: !liked,
          likes: liked ? m.likes - 1 : m.likes + 1,
        };
      }
      return m;
    });
    onUpdatePlanet({
      ...planet,
      moments: updatedMoments,
    });
  };

  const handlePublishMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMomentText.trim()) return;

    const newMoment: PlanetMoment = {
      id: `pm-${Date.now()}`,
      title: `${planet.name} 最新学业简报`,
      authorName: '我 (Alexia)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      likes: 1,
      time: '刚刚',
      text: newMomentText.trim(),
      isLiked: true,
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    };

    onUpdatePlanet({
      ...planet,
      moments: [newMoment, ...planet.moments],
    });
    setNewMomentText('');
    setIsPostingMoment(false);
    showToast(`✨ 学业动态已成功广播至【${planet.name}】！`);
  };

  const currentDayCourses = courses.filter((c) => c.dayOfWeek === selectedDayOfWeek);

  return (
    <div className="absolute inset-0 z-50 bg-[#070913] text-white flex flex-col overflow-hidden font-sans select-none animate-in fade-in zoom-in-95 duration-300 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      <style>{`
        @keyframes planetAxialSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes wavePing {
          0% { transform: scale3d(0.6, 0.6, 1); opacity: 0.9; }
          100% { transform: scale3d(3.2, 3.2, 1); opacity: 0; }
        }
        .animate-planet-spin {
          animation: planetAxialSpin ${planet.orbitSpeed}s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        .animate-wave-ping {
          animation: wavePing 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
          will-change: transform, opacity;
          transform: translateZ(0);
        }
      `}</style>

      {/* Background Cosmic Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-[140px] opacity-40 transition-colors duration-700"
          style={{ backgroundColor: planet.themeColor }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070913]/85 to-[#070913]" />

        {/* Pulsing gravitational wave effect */}
        {isGravitationalPulsing && (
          <div className="absolute top-48 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-4 border-cyan-400 animate-wave-ping pointer-events-none z-30" />
        )}
      </div>

      {/* Top Header Bar with Back & Role Indicator */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#070913]/90 backdrop-blur-xl z-30">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span className="text-xs font-bold font-mono">← 主宇宙</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-wider text-cyan-300">{planet.name}</span>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded-full font-mono font-bold">
            {currentRole === 'student'
              ? '🎓 星航者'
              : currentRole === 'teacher'
              ? '🧭 领航员'
              : currentRole === 'supervisor'
              ? '🛡️ 星区守护者'
              : '🏛️ 星系管理员'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: planet.name,
                  text: planet.description,
                  url: window.location.href,
                });
              } else {
                showToast(`🌌 已生成【${planet.name}】学术星图专属引力坐标！`);
              }
            }}
            className="p-1.5 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="分享星球坐标"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Role Switcher Floating Header Strip */}
      {isAcademicPlanet && (
        <div className="bg-black/60 px-4 py-2 border-b border-cyan-400/20 flex items-center justify-between gap-2 z-20 backdrop-blur-md">
          <div className="flex items-center gap-1 text-xs text-gray-300">
            <Shield size={12} className="text-cyan-400" />
            <span className="text-[11px] font-bold">身份层级切换：</span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { role: 'student', label: '星航者 (学生)', icon: '🎓' },
              { role: 'teacher', label: '领航员 (教师)', icon: '🧭' },
              { role: 'supervisor', label: '守护者 (辅导员)', icon: '🛡️' },
            ].map((r) => (
              <button
                key={r.role}
                onClick={() => {
                  setCurrentRole(r.role as any);
                  if (r.role === 'teacher' || r.role === 'supervisor') {
                    setActiveTab('pilot');
                  }
                  showToast(`🔄 已切换为【${r.label}】身份，权限与功能视图秒级更新！`);
                }}
                className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  currentRole === r.role
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-16 z-10">
        {/* Planet Hero / Gravitational Visual Anchor */}
        <div className="flex flex-col items-center pt-5 pb-3 px-4 relative">
          <div className="relative mb-3">
            {/* Spinning Planet 3D Canvas Mock */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl transition-transform active:scale-90 cursor-pointer"
              style={{
                background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${planet.themeColor} 45%, #050814 100%)`,
                boxShadow: `0 0 50px ${planet.themeColor}60`,
              }}
              onClick={handleSendGravitationalWave}
            >
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8),transparent)] pointer-events-none" />
              <div className="text-4xl filter drop-shadow-md select-none animate-bounce">{planet.icon}</div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent w-full h-1 animate-pulse" />
            </div>

            {/* Orbiting Satellites / Stations */}
            <div className="absolute -top-1 right-1 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-[9px] text-cyan-300 flex items-center gap-1 shadow-lg">
              <Orbit size={10} className="animate-spin text-cyan-400" />
              <span>教务枢纽 01</span>
            </div>
          </div>

          {/* Titles */}
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            {planet.name}
          </h1>
          <p className="text-[11px] text-cyan-300 font-mono mb-1">{planet.englishName}</p>
          <p className="text-xs text-gray-300 text-center max-w-sm leading-relaxed px-2 mb-3">
            {planet.description}
          </p>

          {/* Academic Key Metric Dashboard Bar */}
          {isAcademicPlanet && (
            <div className="w-full max-w-md bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-purple-950/70 border border-cyan-400/30 rounded-2xl p-3 mb-3 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
                <span className="font-bold text-cyan-200 flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-cyan-400" />
                  <span>2025-2026 春季学期 · 第6教学周</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  ● 正常在籍 · 到课率 93.1%
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="p-1.5 bg-black/40 rounded-xl">
                  <span className="text-[9.5px] text-gray-400 block">综合 GPA</span>
                  <span className="text-sm font-black text-amber-300">3.88</span>
                </div>
                <div className="p-1.5 bg-black/40 rounded-xl">
                  <span className="text-[9.5px] text-gray-400 block">学业积分</span>
                  <span className="text-sm font-black text-cyan-300">280<span className="text-[9px] text-gray-400">分</span></span>
                </div>
                <div className="p-1.5 bg-black/40 rounded-xl">
                  <span className="text-[9.5px] text-gray-400 block">本周课程</span>
                  <span className="text-sm font-black text-white">7 门</span>
                </div>
                <div className="p-1.5 bg-black/40 rounded-xl">
                  <span className="text-[9.5px] text-gray-400 block">临近 DDL</span>
                  <span className="text-sm font-black text-rose-400">2 项</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick CTA row */}
          <div className="w-full max-w-md flex items-center gap-2 mb-2">
            <button
              onClick={handleToggleJoin}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer ${
                planet.isJoined
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-[0_4px_20px_rgba(6,182,212,0.4)]'
              }`}
            >
              {planet.isJoined ? (
                <>
                  <Check size={14} strokeWidth={2.5} />
                  <span>已入籍 · 学业系统已绑定</span>
                </>
              ) : (
                <>
                  <Plus size={14} strokeWidth={2.5} />
                  <span>加入学海星球 · 绑定课表</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                showToast('🔄 已连接教务系统，智能课表与灯塔排课已同步更新！');
              }}
              className="px-3 py-2.5 bg-white/10 hover:bg-white/15 active:scale-95 text-white rounded-full text-xs font-bold border border-white/15 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Zap size={13} className="text-amber-400" />
              <span>同步教务</span>
            </button>
          </div>
        </div>

        {/* Dynamic Navigation Tabs Header */}
        <div className="sticky top-0 bg-[#070913]/95 backdrop-blur-md px-3 py-2 border-y border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar z-30">
          {isAcademicPlanet ? (
            <>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Calendar size={13} />
                <span>智能课表 ({courses.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('pilot')}
                className={`flex items-center gap-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'pilot'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Compass size={13} />
                <span>领航员工作台</span>
              </button>

              <button
                onClick={() => setActiveTab('assets')}
                className={`flex items-center gap-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'assets'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <FolderArchive size={13} />
                <span>课程资产库</span>
              </button>

              <button
                onClick={() => setActiveTab('benchmark')}
                className={`flex items-center gap-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'benchmark'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Globe size={13} />
                <span>同专业跨校大盘</span>
              </button>

              <button
                onClick={() => setActiveTab('prd')}
                className={`flex items-center gap-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'prd'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md ring-1 ring-cyan-400/50'
                    : 'bg-white/5 text-cyan-300 hover:text-white'
                }`}
              >
                <BookOpen size={13} className="text-cyan-400" />
                <span>📖 PRD V4.0 全文</span>
              </button>

              <button
                onClick={() => setActiveTab('ddl')}
                className={`flex items-center gap-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'ddl'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Clock size={13} />
                <span>作业与考试 ({assignments.filter((a) => !a.isCompleted).length})</span>
              </button>

              <button
                onClick={() => setActiveTab('studyroom')}
                className={`flex items-center gap-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'studyroom'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Headphones size={13} />
                <span>引力自习室 ({onlineStudyCount}人)</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('moments')}
                className={`flex items-center gap-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'moments' ? 'bg-[#1877F2] text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles size={13} />
                <span>动态星迹 ({planet.moments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('citizens')}
                className={`flex items-center gap-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'citizens' ? 'bg-[#1877F2] text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users size={13} />
                <span>居民星友 ({planet.citizens.length})</span>
              </button>
            </>
          )}
        </div>

        {/* Tab Content 1: Smart University Timetable */}
        {activeTab === 'schedule' && (
          <div className="p-4 space-y-3 max-w-md mx-auto">
            {/* Weekday Switcher Strip */}
            <div className="grid grid-cols-7 gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10 text-center">
              {[
                { day: 1, label: '一', date: '6.16' },
                { day: 2, label: '二', date: '6.17' },
                { day: 3, label: '三', date: '6.18' },
                { day: 4, label: '四', date: '6.19' },
                { day: 5, label: '五', date: '6.20' },
                { day: 6, label: '六', date: '6.21' },
                { day: 7, label: '日', date: '6.22' },
              ].map((item) => (
                <button
                  key={item.day}
                  onClick={() => setSelectedDayOfWeek(item.day)}
                  className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedDayOfWeek === item.day
                      ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-white shadow-md scale-105'
                      : 'hover:bg-white/10 text-gray-400'
                  }`}
                >
                  <span className="text-[10px] block font-bold">周{item.label}</span>
                  <span className="text-[9px] opacity-75">{item.date}</span>
                </button>
              ))}
            </div>

            {/* Daily Course Stream */}
            <div className="flex items-center justify-between pt-1 px-1">
              <span className="text-xs font-bold text-gray-300">
                周{['一', '二', '三', '四', '五', '六', '日'][selectedDayOfWeek - 1]} 共 {currentDayCourses.length} 门课程灯塔
              </span>
              <button
                onClick={() => showToast('➕ 支持在教务系统中录入自定义课程')}
                className="text-[11px] font-bold text-cyan-300 hover:underline flex items-center gap-0.5"
              >
                <Plus size={12} />
                <span>加课</span>
              </button>
            </div>

            {currentDayCourses.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-gray-400 space-y-2">
                <span className="text-3xl">☕</span>
                <p className="text-xs font-bold text-gray-300">今日无课程安排</p>
                <p className="text-[11px]">可前往【引力自习室】复习期末考点或完成大作业！</p>
              </div>
            ) : (
              currentDayCourses.map((c) => (
                <div
                  key={c.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md shadow-lg relative overflow-hidden space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9.5px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30 font-bold">
                          {c.type} · {c.credits}学分
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{c.code}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-white mt-1">{c.name}</h3>
                    </div>

                    <button
                      onClick={() => handleToggleCheckIn(c.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        c.isCheckedIn
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                      }`}
                    >
                      <CheckCircle2 size={12} />
                      <span>{c.isCheckedIn ? '已有效签到 (+10分)' : '灯塔考勤签到'}</span>
                    </button>
                  </div>

                  {/* Class Info Badges */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 bg-black/30 p-2 rounded-xl border border-white/5">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-cyan-400 shrink-0" />
                      <span className="truncate">{c.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-rose-400 shrink-0" />
                      <span className="truncate font-semibold">{c.classroom}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-purple-400 shrink-0" />
                      <span className="truncate">{c.teacher}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText size={12} className="text-amber-400 shrink-0" />
                      <span className="truncate">{c.notesCount} 篇笔记 · {c.materialsCount} 份资料</span>
                    </div>
                  </div>

                  {c.hasAssignment && (
                    <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-rose-300">
                        <AlertCircle size={13} />
                        <span className="font-bold text-[11px]">{c.assignmentText}</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('ddl')}
                        className="text-[10px] text-cyan-300 font-bold hover:underline"
                      >
                        查看 DDL →
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content 2: Teacher / Pilot Workbench */}
        {activeTab === 'pilot' && (
          <div className="p-4">
            <TeacherWorkbench
              showToast={showToast}
              onNavigateToMapLocation={onNavigateToMapLocation}
            />
          </div>
        )}

        {/* Tab Content 3: Course Assets Library */}
        {activeTab === 'assets' && (
          <div className="p-4">
            <CourseAssetsLib showToast={showToast} />
          </div>
        )}

        {/* Tab Content 4: Cross-College Benchmark */}
        {activeTab === 'benchmark' && (
          <div className="p-4">
            <CrossCollegeBenchmark showToast={showToast} />
          </div>
        )}

        {/* Tab Content 5: PRD V4.0 Full Document Reader & Export */}
        {activeTab === 'prd' && (
          <div className="p-4 max-w-2xl mx-auto">
            <AcademyPRDViewer showToast={showToast} />
          </div>
        )}

        {/* Tab Content 6: Assignments & Exams Kanban (DDL) */}
        {activeTab === 'ddl' && (
          <div className="p-4 space-y-4 max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Clock size={14} className="text-rose-400" />
                <span>学期作业与项目 DDL</span>
              </h3>

              <button
                onClick={() => setIsAddingAssignment(true)}
                className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>新建作业项</span>
              </button>
            </div>

            {/* Add Assignment Modal Form */}
            {isAddingAssignment && (
              <form
                onSubmit={handleCreateAssignment}
                className="bg-black/50 border border-cyan-400/50 rounded-2xl p-3 space-y-2 text-xs animate-in fade-in"
              >
                <span className="font-bold text-cyan-300 block">📝 添加新的课后大作业 / 任务</span>
                <input
                  type="text"
                  value={newAssignmentTitle}
                  onChange={(e) => setNewAssignmentTitle(e.target.value)}
                  placeholder="输入大作业名称与截止要求..."
                  className="w-full p-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder:text-gray-400 focus:outline-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingAssignment(false)}
                    className="px-3 py-1 text-gray-400 hover:text-white"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-cyan-500 text-white font-bold rounded-lg"
                  >
                    确认保存
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {assignments.map((ass) => (
                <div
                  key={ass.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    ass.isCompleted
                      ? 'bg-white/5 border-white/5 opacity-60'
                      : ass.isUrgent
                      ? 'bg-rose-500/10 border-rose-500/40 shadow-lg'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => handleToggleAssignment(ass.id)}
                        className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                          ass.isCompleted
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'border-white/30 hover:border-cyan-400'
                        }`}
                      >
                        {ass.isCompleted && <Check size={12} strokeWidth={3} />}
                      </button>
                      <div>
                        <span className="text-[10px] text-cyan-300 font-mono block">{ass.courseName}</span>
                        <h4 className={`text-xs font-bold ${ass.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                          {ass.title}
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        ass.isCompleted
                          ? 'bg-white/10 text-gray-400'
                          : ass.isUrgent
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {ass.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Exam Schedule */}
            <div className="pt-2 space-y-2">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <BookmarkCheck size={14} className="text-amber-400" />
                <span>期末统考日程与考场</span>
              </h3>

              <div className="space-y-2">
                {INITIAL_EXAMS.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white text-xs">{ex.courseName}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[10.5px] text-gray-400">
                        <span>{ex.date} {ex.time}</span>
                        <span>·</span>
                        <span className="text-cyan-300">{ex.classroom} ({ex.seatNumber})</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-amber-300 font-mono block">{ex.daysLeft}</span>
                      <span className="text-[9px] text-gray-400">天后开考</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 7: Gravity Pomodoro Study Room */}
        {activeTab === 'studyroom' && (
          <div className="p-4 space-y-4 max-w-md mx-auto">
            <div className="bg-gradient-to-b from-blue-950/80 to-purple-950/80 border border-cyan-400/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-cyan-300">
                <span className="flex items-center gap-1">
                  <Headphones size={13} />
                  <span>学海引力自修室 #04</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono text-[10px]">
                  ● {onlineStudyCount} 人在线自习
                </span>
              </div>

              {/* Big Pomodoro Timer */}
              <div className="py-2">
                <div className="text-5xl font-black text-white font-mono tracking-wider drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                  {formatTimer(pomodoroSeconds)}
                </div>
                <span className="text-[11px] text-cyan-200 mt-1 block">
                  {isTimerRunning ? '🌌 正在深度专注学习中... 引力波共振启动' : '☕ 准备好开始 25 分钟番茄专注了吗？'}
                </span>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-6 py-2.5 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer ${
                    isTimerRunning
                      ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause size={14} />
                      <span>暂停专注</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="white" />
                      <span>开始专注番茄钟</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setPomodoroSeconds(25 * 60);
                    showToast('🔄 已重置番茄专注计时器');
                  }}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-full transition-colors cursor-pointer"
                  title="重置计时"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Ambient Sound Switcher */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
                <span className="flex items-center gap-1 text-[11px]">
                  <Volume2 size={12} className="text-cyan-400" />
                  <span>专注白噪音：</span>
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { key: 'rain', label: '🌧️ 窗外雨声' },
                    { key: 'waves', label: '🌊 星海潮汐' },
                    { key: 'cafe', label: '☕ 咖啡厅' },
                    { key: 'off', label: '静音' },
                  ].map((snd) => (
                    <button
                      key={snd.key}
                      onClick={() => {
                        setStudySound(snd.key as any);
                        showToast(`已切换自习室环境音：${snd.label}`);
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                        studySound === snd.key
                          ? 'bg-cyan-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {snd.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 8: Moments & Feed (General) */}
        {activeTab === 'moments' && (
          <div className="p-4 space-y-3 max-w-md mx-auto">
            {/* Post button */}
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-gray-300">学友互动与课程问答 ({planet.moments.length})</span>
              <button
                onClick={() => setIsPostingMoment(!isPostingMoment)}
                className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 shadow"
              >
                <Plus size={13} />
                <span>发布学业问答</span>
              </button>
            </div>

            {/* Posting Modal / Form */}
            {isPostingMoment && (
              <form
                onSubmit={handlePublishMoment}
                className="bg-white/5 border border-cyan-400/50 rounded-2xl p-3 space-y-2 backdrop-blur-md"
              >
                <textarea
                  value={newMomentText}
                  onChange={(e) => setNewMomentText(e.target.value)}
                  placeholder="向全校星友提问、分享学习笔记或组队期末复习..."
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-cyan-400 resize-none h-20"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPostingMoment(false)}
                    className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full text-xs font-bold transition-all shadow cursor-pointer"
                  >
                    广播
                  </button>
                </div>
              </form>
            )}

            {/* Moments List */}
            <div className="space-y-3">
              {planet.moments.map((moment) => (
                <div
                  key={moment.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={moment.authorAvatar}
                        alt={moment.authorName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-cyan-400"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{moment.authorName}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">{moment.time}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-200 leading-relaxed">{moment.text}</p>

                  {moment.image && (
                    <img
                      src={moment.image}
                      alt="Moment"
                      className="w-full h-36 object-cover rounded-xl border border-white/10"
                    />
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs text-gray-400">
                    <button
                      onClick={() => handleLikeMoment(moment.id)}
                      className={`flex items-center gap-1 transition-colors cursor-pointer ${
                        moment.isLiked ? 'text-rose-400 font-bold' : 'hover:text-white'
                      }`}
                    >
                      <Heart size={14} fill={moment.isLiked ? '#fb7185' : 'transparent'} />
                      <span>{moment.likes}</span>
                    </button>

                    <button
                      onClick={() => showToast('💬 正在打开学术问答讨论信箱气泡...')}
                      className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageCircle size={14} />
                      <span>回复讨论</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
