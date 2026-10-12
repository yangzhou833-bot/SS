import React, { useState } from 'react';
import {
  Users,
  Shield,
  Zap,
  CheckSquare,
  FileText,
  Clock,
  MapPin,
  Plus,
  ArrowRight,
  Settings,
  Bell,
  CheckCircle2,
  AlertCircle,
  Building,
  ExternalLink,
  MessageSquare,
  Navigation,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Compass,
} from 'lucide-react';
import {
  GroupMember,
  GroupWorkSchedule,
  RegionAnimalConfig,
  SquadItem,
  GroupTaskItem,
  GroupAnnouncement,
  TaskStatus,
} from './types';
import { WaveAvatar } from './WaveAvatar';

interface GroupWorkbenchOverviewProps {
  groupName: string;
  groupDescription: string;
  selectedRegionAnimal: RegionAnimalConfig;
  schedule: GroupWorkSchedule;
  members: GroupMember[];
  squads: SquadItem[];
  tasks: GroupTaskItem[];
  announcements: GroupAnnouncement[];
  onOpenManageGroup: () => void;
  onOpenCreateSquad: () => void;
  onOpenCreateTask: () => void;
  onOpenMemberConsent: () => void;
  onSelectSquad: (squad: SquadItem) => void;
  onOpenMissionControl?: (squad: SquadItem) => void;
  onSelectTask: (task: GroupTaskItem) => void;
  onOpenDoc: (docId: string) => void;
  onNavigateToDocsTab: () => void;
  showToast: (msg: string) => void;
  onToggleTaskStep: (taskId: string, stepId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onAddAnnouncement: (title: string, content: string, isPinned: boolean) => void;
}

export const GroupWorkbenchOverview: React.FC<GroupWorkbenchOverviewProps> = ({
  groupName,
  groupDescription,
  selectedRegionAnimal,
  schedule,
  members,
  squads,
  tasks,
  announcements,
  onOpenManageGroup,
  onOpenCreateSquad,
  onOpenCreateTask,
  onOpenMemberConsent,
  onSelectSquad,
  onOpenMissionControl,
  onSelectTask,
  onOpenDoc,
  onNavigateToDocsTab,
  showToast,
  onToggleTaskStep,
  onUpdateTaskStatus,
  onAddAnnouncement,
}) => {
  const [showNewAnnouncementModal, setShowNewAnnouncementModal] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPinned, setNewAnnPinned] = useState(true);

  // Active section tab for mobile/clean switching or unified dashboard
  const [activeMainTab, setActiveMainTab] = useState<'all' | 'squads' | 'tasks' | 'presence'>('all');
  const [taskFilter, setTaskFilter] = useState<'all' | 'in_progress' | 'high_priority' | 'completed'>('all');
  const [memberFilter, setMemberFilter] = useState<'all' | 'office' | 'field' | 'stealth' | 'unauthorized'>('all');

  // Aggregated status calculations
  const officeMembers = members.filter((m) => m.locationStatus === 'office');
  const fieldMembers = members.filter((m) => m.locationStatus === 'field');
  const stealthMembers = members.filter((m) => m.locationStatus === 'stealth');
  const unauthorizedMembers = members.filter((m) => m.locationStatus === 'unauthorized');

  const filteredMembers = members.filter((m) => {
    if (memberFilter === 'office') return m.locationStatus === 'office';
    if (memberFilter === 'field') return m.locationStatus === 'field';
    if (memberFilter === 'stealth') return m.locationStatus === 'stealth';
    if (memberFilter === 'unauthorized') return m.locationStatus === 'unauthorized';
    return true;
  });

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'in_progress') return t.status === 'in_progress' || t.status === 'accepted';
    if (taskFilter === 'high_priority') return t.priority === 'high';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasksCount = tasks.filter((t) => t.status === 'in_progress' || t.status === 'accepted').length;
  const activeSquadsCount = squads.filter((s) => s.status === 'active').length;

  const demoDocList = [
    { id: 'doc-1', title: '《城市探索组协作手册》', tag: '团队规范', icon: '📖', desc: '小组核心行动准则与安全规范' },
    { id: 'doc-privacy-rule', title: '《小组定位与隐私规则》', tag: '安全隐私', icon: '🛡️', desc: '工作时段与位置聚合保护条款' },
    { id: 'doc-task-list', title: '《本周行动任务清单》', tag: '行动任务', icon: '📋', desc: '本周各战术小组执行进度汇总' },
    { id: 'doc-3', title: '《兰州城市路线知识库》', tag: '路线数据', icon: '🗺️', desc: '黄河风情线与白塔山地形坐标' },
  ];

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) {
      showToast('请完整填写公告标题与内容');
      return;
    }
    onAddAnnouncement(newAnnTitle.trim(), newAnnContent.trim(), newAnnPinned);
    setNewAnnTitle('');
    setNewAnnContent('');
    setShowNewAnnouncementModal(false);
    showToast('小组公告已成功发布并同步至工作台 📢');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 space-y-4 bg-[#F0F2F5] dark:bg-black min-h-full font-sans text-[#050505] dark:text-white">
      {/* ================= 1. HEADER HERO: Clean Meta Straight-Line Header ================= */}
      <div className="bg-white dark:bg-zinc-950 rounded-md border border-[#E4E6EB] dark:border-zinc-800 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Group Info Branding */}
          <div className="flex items-start space-x-3.5 min-w-0">
            <div className="w-12 h-12 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-2xl shrink-0 shadow-2xs select-none">
              {selectedRegionAnimal.emoji}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                  {groupName}
                </h1>
                <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] font-bold rounded-sm border border-blue-200 dark:border-blue-800 flex items-center space-x-1 shrink-0">
                  <span>{selectedRegionAnimal.region}</span>
                  <span>·</span>
                  <span>{selectedRegionAnimal.animalName}</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold rounded-sm border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>实时协同中</span>
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed max-w-3xl line-clamp-2">
                {groupDescription}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E4E6EB] dark:border-zinc-800">
            <button
              onClick={onOpenCreateSquad}
              className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] active:scale-[0.98] text-white text-xs font-bold rounded-sm border border-[#1877F2] shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
              title="成立新小队与任务编组"
            >
              <Zap size={14} />
              <span>成立小队</span>
            </button>

            <button
              onClick={onOpenCreateTask}
              className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-[0.98] text-gray-800 dark:text-zinc-200 text-xs font-bold rounded-sm border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
              title="新建行动任务"
            >
              <Plus size={14} className="text-[#1877F2]" />
              <span>新建任务</span>
            </button>

            <button
              onClick={onOpenMemberConsent}
              className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-blue-50/50 dark:hover:bg-zinc-800 active:scale-[0.98] text-[#1877F2] text-xs font-bold rounded-sm border border-blue-200 dark:border-blue-900 hover:border-[#1877F2] shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
              title="授权与隐私中心"
            >
              <Shield size={14} />
              <span>授权中心</span>
            </button>

            <button
              onClick={onOpenManageGroup}
              className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-[0.98] text-gray-800 dark:text-zinc-200 text-xs font-bold rounded-sm border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
              title="管理小组工作制度与定位规则"
            >
              <Settings size={14} className="text-gray-600 dark:text-zinc-400" />
              <span>管理小组</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Bento Metrics (High Density, Clean Alignment) */}
        <div className="mt-4 pt-3.5 border-t border-[#E4E6EB] dark:border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="p-2.5 bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-800 rounded-sm flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#1877F2] flex items-center justify-center shrink-0">
              <Zap size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-gray-500 dark:text-zinc-400">执行中小队</div>
              <div className="text-xs font-bold text-gray-900 dark:text-zinc-200 truncate">
                {activeSquadsCount} 支活跃 / 共 {squads.length} 队
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-800 rounded-sm flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#1877F2] flex items-center justify-center shrink-0">
              <CheckSquare size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-gray-500 dark:text-zinc-400">任务达成情况</div>
              <div className="text-xs font-bold text-gray-900 dark:text-zinc-200 truncate">
                {completedTasksCount} 已完结 · {inProgressTasksCount} 执行中
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-800 rounded-sm flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#1877F2] flex items-center justify-center shrink-0">
              <Building size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-gray-500 dark:text-zinc-400">在岗与聚合坐标</div>
              <div className="text-xs font-bold text-gray-900 dark:text-zinc-200 truncate">
                {officeMembers.length} 办公 · {fieldMembers.length} 外勤
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-sm flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Shield size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">定位隐私防护</div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                {schedule.startTime}-{schedule.endTime} 有效 · 拒绝最高
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. WORKBENCH MAIN BODY (8 Cols Left + 4 Cols Right) ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* ================= LEFT MAIN (8 Cols): Squads, Tasks & Presence ================= */}
        <div className="xl:col-span-8 space-y-4">
          
          {/* SQUAD MISSION COMMAND CENTER QUICK HERO BANNER */}
          {squads.length > 0 && onOpenMissionControl && (
            <div className="bg-gradient-to-r from-blue-900 via-[#1877F2] to-indigo-800 rounded-md p-4 text-white shadow-xs border border-blue-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-md bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shrink-0">
                  <Compass size={22} className="animate-spin-slow" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 mb-0.5">
                    <h2 className="text-sm font-bold text-white truncate">
                      小队行动指挥台 · 实时作战中心
                    </h2>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-400 text-gray-950 font-black rounded-xs">
                      LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100 line-clamp-1">
                    当前正在推进「{squads[0].name}」实地行动 · 实时时间轴、最优折线路径拟合与队员动态
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onOpenMissionControl(squads[0])}
                  className="px-3.5 py-2 bg-white hover:bg-blue-50 active:scale-95 text-[#1877F2] text-xs font-black rounded-sm shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Navigation size={13} className="text-[#1877F2]" />
                  <span>启动指挥台</span>
                </button>
              </div>
            </div>
          )}

          {/* A. Active Squads Section (小队管理) */}
          <div className="bg-white dark:bg-zinc-950 rounded-md border border-[#E4E6EB] dark:border-zinc-800 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#E4E6EB] dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-sm bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#1877F2]">
                  <Zap size={14} />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    执行中小队与战术编组 ({squads.length})
                  </h2>
                </div>
              </div>

              <button
                onClick={onOpenCreateSquad}
                className="text-xs font-bold text-[#1877F2] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>成立新小队</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {squads.map((squad, sqIdx) => {
                const isOngoing = squad.status === 'active';
                const isPrep = squad.status === 'preparing';

                return (
                  <div
                    key={`gwb-sq-${squad.id}-${sqIdx}`}
                    onClick={() => onSelectSquad(squad)}
                    className="p-3.5 bg-white hover:bg-[#F8FAFC] border border-[#E4E6EB] hover:border-[#1877F2] rounded-md transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Wave Avatar with C Badge + Name & Status */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center space-x-3 min-w-0">
                          <WaveAvatar
                            src={squad.leaderAvatar}
                            name={squad.leaderName}
                            size={38}
                            isCaptain={true}
                            badgeIcon={squad.borderConfig.badge}
                            borderConfig={squad.borderConfig}
                            className="shrink-0"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5 mb-0.5">
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#1877F2] truncate">
                                {squad.name}
                              </span>
                              <span
                                className={`text-[9.5px] px-1.5 py-0.2 font-bold rounded-sm border shrink-0 ${
                                  isOngoing
                                    ? 'bg-blue-50 text-[#1877F2] border-blue-200'
                                    : isPrep
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}
                              >
                                {isOngoing ? '执行中' : isPrep ? '筹备中' : '已完成'}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 truncate">
                              队长: {squad.leaderName} · {squad.members.length} 位队员
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          {onOpenMissionControl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenMissionControl(squad);
                              }}
                              className="px-2 py-1 bg-blue-50 hover:bg-[#1877F2] text-[#1877F2] hover:text-white text-[11px] font-bold rounded-sm border border-blue-200 hover:border-[#1877F2] transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                              title="打开小队行动指挥台"
                            >
                              <Navigation size={11} />
                              <span>指挥台</span>
                            </button>
                          )}
                          <span className="text-xs font-bold text-[#1877F2] flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform">
                            <span>频道</span>
                            <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>

                      {/* Goal snippet */}
                      <p className="text-xs text-gray-700 font-medium line-clamp-2 mb-2.5">
                        {squad.targetGoal}
                      </p>
                    </div>

                    {/* Bottom Meta Bar */}
                    <div className="pt-2.5 border-t border-[#E4E6EB] space-y-1.5 text-[11px] text-gray-500">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="flex items-center space-x-1 text-gray-600">
                          <Clock size={12} className="text-[#1877F2] shrink-0" />
                          <span>
                            {squad.startTime} - {squad.endTime}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1 text-gray-600 truncate max-w-[140px]">
                          <MapPin size={12} className="text-rose-500 shrink-0" />
                          <span className="truncate">{squad.gatheringPoint.split(' ')[0]}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 text-[#1877F2] bg-blue-50/50 px-2 py-1 rounded-sm border border-blue-100">
                        <MessageSquare size={11} className="shrink-0" />
                        <span className="truncate text-[10.5px]">{squad.recentChatSnippet}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* B. Task & Action Item Management (任务清单) */}
          <div className="bg-white dark:bg-zinc-950 rounded-md border border-[#E4E6EB] dark:border-zinc-800 p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 pb-2.5 border-b border-[#E4E6EB]">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-sm bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2]">
                  <CheckSquare size={14} />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-gray-900">
                    小组行动任务与步骤 ({tasks.length})
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter Tabs */}
                <div className="flex items-center space-x-1 bg-[#F0F2F5] p-0.5 rounded-sm">
                  <button
                    onClick={() => setTaskFilter('all')}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-xs transition-all cursor-pointer ${
                      taskFilter === 'all' ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    全部 ({tasks.length})
                  </button>
                  <button
                    onClick={() => setTaskFilter('in_progress')}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-xs transition-all cursor-pointer ${
                      taskFilter === 'in_progress' ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    执行中 ({inProgressTasksCount})
                  </button>
                  <button
                    onClick={() => setTaskFilter('high_priority')}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-xs transition-all cursor-pointer ${
                      taskFilter === 'high_priority' ? 'bg-white text-rose-600 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🔥 高优
                  </button>
                  <button
                    onClick={() => setTaskFilter('completed')}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-xs transition-all cursor-pointer ${
                      taskFilter === 'completed' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    已完成 ({completedTasksCount})
                  </button>
                </div>

                <button
                  onClick={onOpenCreateTask}
                  className="text-xs font-bold text-[#1877F2] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>新建任务</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTasks.map((task, tIdx) => {
                const completedSteps = task.steps.filter((s) => s.done).length;
                const totalSteps = task.steps.length;
                const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                return (
                  <div
                    key={`gwb-task-${task.id}-${tIdx}`}
                    className="p-3.5 bg-white border border-[#E4E6EB] hover:border-[#1877F2]/60 rounded-md transition-all space-y-2.5 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          onClick={() => onSelectTask(task)}
                          className="cursor-pointer group flex-1 min-w-0"
                        >
                          <div className="flex items-center space-x-1.5 mb-1">
                            <span className="text-xs font-bold text-gray-900 group-hover:text-[#1877F2] truncate">
                              {task.title}
                            </span>
                            {task.priority === 'high' && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-700 font-bold rounded-xs shrink-0">
                                🔥 高
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{task.targetGoal}</p>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 font-bold rounded-sm border shrink-0 ${
                            task.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : task.status === 'in_progress'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : task.status === 'blocked'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-[#1877F2] border-blue-200'
                          }`}
                        >
                          {task.status === 'completed'
                            ? '已完成'
                            : task.status === 'in_progress'
                            ? '执行中'
                            : task.status === 'blocked'
                            ? '阻塞'
                            : '已接受'}
                        </span>
                      </div>

                      {/* Interactive Steps checklist */}
                      <div className="space-y-1 bg-[#F8FAFC] border border-[#E4E6EB] rounded-sm p-2">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                          <span>行动步骤 ({completedSteps}/{totalSteps})</span>
                          <span className="font-bold text-[#1877F2]">{progress}%</span>
                        </div>
                        {task.steps.slice(0, 2).map((step, sIdx) => (
                          <div
                            key={`step-${step.id}-${sIdx}`}
                            onClick={() => onToggleTaskStep(task.id, step.id)}
                            className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer hover:text-[#1877F2]"
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
                                step.done
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {step.done && <CheckCircle2 size={10} />}
                            </div>
                            <span
                              className={`text-[11px] truncate ${
                                step.done ? 'line-through text-gray-400' : ''
                              }`}
                            >
                              {step.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2 min-w-0">
                        <WaveAvatar
                          src={task.assigneeAvatar}
                          name={task.assigneeName}
                          size={24}
                          isCaptain={task.assigneeRole?.includes('队长') || task.assigneeRole?.includes('组长')}
                          badgeIcon="⚡"
                          borderConfig={{
                            color: '#1877F2',
                            style: 'solid',
                            badge: '⚡',
                            name: '默认小队',
                          }}
                          className="shrink-0"
                        />
                        <span className="font-bold text-gray-700 truncate">{task.assigneeName}</span>
                      </div>

                      <button
                        onClick={() => onSelectTask(task)}
                        className="text-xs font-bold text-[#1877F2] hover:underline cursor-pointer flex items-center space-x-0.5 shrink-0"
                      >
                        <span>详情</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. Presence & Location Protection Grid (在岗与坐标看板) */}
          <div className="bg-white dark:bg-zinc-950 rounded-md border border-[#E4E6EB] dark:border-zinc-800 p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-[#E4E6EB]">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-sm bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2]">
                  <Building size={14} />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-gray-900">
                    在岗成员状态看板 ({members.length} 人)
                  </h2>
                </div>
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setMemberFilter('all')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-sm border transition-all cursor-pointer ${
                    memberFilter === 'all'
                      ? 'bg-[#1877F2] text-white border-[#1877F2]'
                      : 'bg-white text-gray-600 border-[#E4E6EB] hover:border-gray-400'
                  }`}
                >
                  全部 ({members.length})
                </button>
                <button
                  onClick={() => setMemberFilter('office')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-sm border transition-all cursor-pointer ${
                    memberFilter === 'office'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-[#E4E6EB] hover:border-gray-400'
                  }`}
                >
                  在岗 ({officeMembers.length})
                </button>
                <button
                  onClick={() => setMemberFilter('field')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-sm border transition-all cursor-pointer ${
                    memberFilter === 'field'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-[#E4E6EB] hover:border-gray-400'
                  }`}
                >
                  外勤 ({fieldMembers.length})
                </button>
                <button
                  onClick={() => setMemberFilter('stealth')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-sm border transition-all cursor-pointer ${
                    memberFilter === 'stealth'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-gray-600 border-[#E4E6EB] hover:border-gray-400'
                  }`}
                >
                  隐身 ({stealthMembers.length})
                </button>
                <button
                  onClick={() => setMemberFilter('unauthorized')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-sm border transition-all cursor-pointer ${
                    memberFilter === 'unauthorized'
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'bg-white text-gray-600 border-[#E4E6EB] hover:border-gray-400'
                  }`}
                >
                  未授权 ({unauthorizedMembers.length})
                </button>
              </div>
            </div>

            {/* Member Grid Stream */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm max-h-44 overflow-y-auto">
              {filteredMembers.map((m, mIdx) => {
                const isOffice = m.locationStatus === 'office';
                const isField = m.locationStatus === 'field';
                const isStealth = m.locationStatus === 'stealth';
                const isCaptain = m.role === 'squad_leader' || m.role === 'leader';
                const isSquadMember = m.role === 'squad_member' || isCaptain;

                return (
                  <div
                    key={`gwb-mem-${m.id}-${mIdx}`}
                    className="flex items-center space-x-2 p-1.5 bg-white border border-[#E4E6EB] hover:border-[#1877F2] rounded-sm text-xs shadow-2xs transition-all"
                    title={`${m.name} · ${m.department} · ${
                      isOffice ? '在岗 (已聚合)' : isField ? '外勤任务中' : isStealth ? '个人隐身模式' : '未授权定位'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {isSquadMember ? (
                        <WaveAvatar
                          src={m.avatar}
                          name={m.name}
                          size={26}
                          isCaptain={isCaptain}
                          badgeIcon={m.squadBorder?.badge || '⚡'}
                          borderConfig={
                            m.squadBorder || {
                              color: '#1877F2',
                              style: 'solid',
                              badge: '⚡',
                              name: '先锋队',
                            }
                          }
                        />
                      ) : (
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-6.5 h-6.5 rounded-full object-cover border border-[#E4E6EB]"
                        />
                      )}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                          isOffice
                            ? 'bg-emerald-500'
                            : isField
                            ? 'bg-[#1877F2]'
                            : isStealth
                            ? 'bg-amber-500'
                            : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 truncate text-[11px]">{m.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {isOffice ? '在岗' : isField ? '外勤' : isStealth ? '隐身' : '未授权'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDEBAR (4 Cols): Announcements, Policy & Knowledge ================= */}
        <div className="xl:col-span-4 space-y-4">
          
          {/* A. Group Announcements (小组动态与通知) */}
          <div className="bg-white dark:bg-zinc-950 rounded-md border border-[#E4E6EB] dark:border-zinc-800 p-4 sm:p-5 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#E4E6EB]">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-sm bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2]">
                  <Bell size={14} />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-gray-900">
                  小组动态与公告 ({announcements.length})
                </h2>
              </div>

              <button
                onClick={() => setShowNewAnnouncementModal(true)}
                className="text-xs font-bold text-[#1877F2] hover:underline flex items-center space-x-0.5 cursor-pointer"
              >
                <Plus size={13} />
                <span>发布</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-68 overflow-y-auto pr-0.5">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-3 rounded-md border text-xs space-y-1.5 transition-all ${
                    ann.isPinned
                      ? 'bg-blue-50/40 border-blue-200'
                      : 'bg-[#F8FAFC] border-[#E4E6EB]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-gray-900 flex items-center space-x-1.5 truncate">
                      {ann.isPinned && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-[#1877F2] text-white font-bold rounded-xs shrink-0">
                          置顶
                        </span>
                      )}
                      <span className="truncate">{ann.title}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">{ann.date}</span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-relaxed line-clamp-2">
                    {ann.content}
                  </p>
                  <div className="text-[10px] text-gray-400 pt-0.5">发布人：{ann.author}</div>
                </div>
              ))}
            </div>
          </div>

          {/* B. Rules & Privacy Laws (定位规则与隐私法则) */}
          <div className="bg-white dark:bg-zinc-950 rounded-md border border-[#E4E6EB] dark:border-zinc-800 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#E4E6EB]">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-sm bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2]">
                  <Shield size={14} />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-gray-900">
                  定位规则与隐私法则
                </h2>
              </div>

              <button
                onClick={onOpenManageGroup}
                className="text-xs font-bold text-[#1877F2] hover:underline flex items-center space-x-0.5 cursor-pointer"
              >
                <span>配置</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E4E6EB] rounded-sm space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-bold">生效时段</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-sm border border-emerald-200">
                  工作日 {schedule.startTime}-{schedule.endTime}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                优先级阶梯：个人拒绝 &gt; 隐私隐身 &gt; 小组禁用 &gt; 小队临时窗口 &gt; 基础工作时段。
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] border-t border-gray-200/70">
                <span className="text-gray-500">办公聚合半径</span>
                <span className="font-bold text-gray-800">{schedule.effectiveRadiusMeters} 米自动折叠</span>
              </div>
            </div>
          </div>

          {/* C. Team Knowledge & Docs (小组关联文档与资产) */}
          <div className="bg-white rounded-md border border-[#E4E6EB] p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#E4E6EB]">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-sm bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2]">
                  <FileText size={14} />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-gray-900">
                  团队知识库与文档 ({demoDocList.length})
                </h2>
              </div>

              <button
                onClick={onNavigateToDocsTab}
                className="text-xs font-bold text-[#1877F2] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>全部</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
              {demoDocList.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onOpenDoc(doc.id)}
                  className="p-2.5 bg-white hover:bg-blue-50/30 border border-[#E4E6EB] hover:border-[#1877F2] rounded-md transition-all cursor-pointer flex items-center space-x-2.5 group shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-sm bg-[#F8FAFC] group-hover:bg-blue-50 border border-[#E4E6EB] group-hover:border-blue-200 flex items-center justify-center text-sm shrink-0">
                    {doc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900 group-hover:text-[#1877F2] truncate">
                      {doc.title}
                    </div>
                    <div className="text-[10px] text-gray-400">{doc.desc}</div>
                  </div>
                  <ExternalLink
                    size={12}
                    className="text-gray-300 group-hover:text-[#1877F2] shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL: Post Announcement ================= */}
      {showNewAnnouncementModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowNewAnnouncementModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-md border border-[#E4E6EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-14 px-4 bg-white border-b border-[#E4E6EB] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2]">
                  <Bell size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">发布小组新公告</h3>
                  <p className="text-[11px] text-gray-500">同步推送至全员工作台总览</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewAnnouncementModal(false)}
                className="w-8 h-8 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="关闭发布公告弹窗"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostAnnouncement} className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">公告标题 *</label>
                <input
                  type="text"
                  placeholder="例如：本周六秋季拉练集合时间与装备要求"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">公告内容 *</label>
                <textarea
                  rows={4}
                  placeholder="详细说明通知事项、集合要求与注意事项..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E4E6EB] rounded-sm focus:outline-none focus:border-[#1877F2] bg-white"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 p-2.5 bg-[#F8FAFC] border border-[#E4E6EB] rounded-sm">
                <input
                  type="checkbox"
                  id="ann-pinned"
                  checked={newAnnPinned}
                  onChange={(e) => setNewAnnPinned(e.target.checked)}
                  className="accent-[#1877F2] cursor-pointer"
                />
                <label htmlFor="ann-pinned" className="text-xs font-bold text-gray-800 cursor-pointer">
                  全组置顶公告（将显示置顶金标并排在最前）
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E4E6EB]">
                <button
                  type="button"
                  onClick={() => setShowNewAnnouncementModal(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-sm border border-[#E4E6EB] cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-sm border border-[#1877F2] shadow-2xs cursor-pointer"
                >
                  确认发布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
