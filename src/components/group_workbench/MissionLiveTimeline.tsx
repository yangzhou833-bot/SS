import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ChevronRight,
  FileText,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { TacticalMissionTask, MissionWaypoint, SquadMissionTacticalState } from './types';

interface MissionLiveTimelineProps {
  missionState: SquadMissionTacticalState;
  tasks: TacticalMissionTask[];
  waypoints: MissionWaypoint[];
  onSelectTask?: (task: TacticalMissionTask) => void;
  onSelectWaypoint?: (waypointId: string) => void;
  onOpenDoc?: (docId: string) => void;
  className?: string;
}

export const MissionLiveTimeline: React.FC<MissionLiveTimelineProps> = ({
  missionState,
  tasks,
  waypoints,
  onSelectTask,
  onSelectWaypoint,
  onOpenDoc,
  className = '',
}) => {
  // Current real-time clock
  const [currentTimeStr, setCurrentTimeStr] = useState(() =>
    new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(
        new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Parse HH:MM to total minutes from 00:00
  const parseTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  };

  // Assume squad active window or default to 09:00 - 18:00
  const baseStartMinutes = parseTimeToMinutes('09:00');
  const baseEndMinutes = parseTimeToMinutes('18:00');
  const totalWindowMinutes = Math.max(1, baseEndMinutes - baseStartMinutes);

  // Calculate current progress percentage
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const clampedCurrentMinutes = Math.max(baseStartMinutes, Math.min(baseEndMinutes, currentMinutes));
  const rawProgressPercent = ((clampedCurrentMinutes - baseStartMinutes) / totalWindowMinutes) * 100;
  
  // If mission completed or ended, pin to 100%, else calculate
  const currentProgressPercent =
    missionState.missionStatus === 'completed' || missionState.missionStatus === 'ended'
      ? 100
      : Math.max(8, Math.min(95, Math.round(rawProgressPercent)));

  // Calculate remaining minutes for earliest unfinished milestone
  const activeTask = tasks.find((t) => t.status === 'in_progress' || t.status === 'accepted') || tasks[0];
  const activeTaskDueMinutes = activeTask ? parseTimeToMinutes(activeTask.dueTime) : baseEndMinutes;
  const remainingMinutes = Math.max(0, activeTaskDueMinutes - currentMinutes);
  const remainingHoursFormatted = `${Math.floor(remainingMinutes / 60)}小时${remainingMinutes % 60}分`;

  // Dynamically generate Key Milestones from all waypoints and tasks with updated ETAs
  const sortedWps = [...waypoints].sort((a, b) => a.orderIndex - b.orderIndex);

  // Map each waypoint into dynamic timeline milestone node
  const dynamicMilestones = sortedWps.map((wp, idx) => {
    // Extract ETA from description or calculate
    const etaMatch = wp.description?.match(/预计到达:\s*(\d{2}:\d{2})/);
    const timeDisplay = etaMatch ? etaMatch[1] : idx === 0 ? '09:00' : `${10 + idx}:00`;
    
    // Find bound task
    const boundTask = tasks.find((t) => t.boundWaypointId === wp.id || t.id === wp.boundTaskId) || tasks[idx % tasks.length];

    let milestoneType = wp.type === 'gathering' ? 'start' : wp.type === 'destination' ? 'destination' : 'checkpoint';
    let status = wp.isArrived
      ? 'completed'
      : idx === 0 && missionState.missionStatus !== 'preparing'
      ? 'completed'
      : idx === 1 && missionState.missionStatus === 'in_progress'
      ? 'in_progress'
      : 'pending';

    if (boundTask?.isBlocked) {
      status = 'blocked';
    }

    return {
      id: `ms-${wp.id}`,
      wpId: wp.id,
      title: boundTask?.title || wp.name,
      time: boundTask?.dueTime || timeDisplay,
      type: milestoneType,
      status,
      location: wp.name,
      desc: boundTask
        ? `负责人: ${boundTask.assigneeName} · 预计${boundTask.estimatedDurationMinutes || 60}分钟`
        : wp.description || '按计划标绘行进',
      taskObj: boundTask,
    };
  });

  // Limit to at most 4-6 prominent milestone cards for clean layout
  const milestones = dynamicMilestones.slice(0, 6);

  return (
    <div
      id="mission-live-timeline-panel"
      className={`bg-white dark:bg-black rounded-md border border-[#E4E6EB] dark:border-zinc-800 p-3 sm:p-4 shadow-2xs space-y-3.5 text-[#050505] dark:text-white ${className}`}
    >
      {/* Header with Live Clock & Progress Highlight */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E6EB] dark:border-zinc-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-sm bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-[#1877F2] dark:text-blue-400 flex items-center justify-center font-bold">
            <Clock size={15} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                实时行动时间轴与里程碑
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 font-bold rounded-sm bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ETA 自动拟合中</span>
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
              根据队长在地图拖拽检查点坐标实时重算最优折线、全员预计到达时间(ETA)与里程碑排期
            </p>
          </div>
        </div>

        {/* Right Countdown & Current Realtime */}
        <div className="flex items-center space-x-2 bg-[#F8FAFC] dark:bg-zinc-900 px-2.5 py-1.5 rounded-sm border border-[#E4E6EB] dark:border-zinc-800 text-xs">
          <span className="text-gray-500 dark:text-zinc-400 font-medium">当前时间:</span>
          <span className="font-mono font-bold text-gray-900 dark:text-white">{currentTimeStr}</span>
          <span className="text-gray-300 dark:text-zinc-700">|</span>
          <span className="text-gray-500 dark:text-zinc-400 font-medium">阶段剩余:</span>
          <span className="font-mono font-bold text-[#1877F2] dark:text-blue-400">{remainingHoursFormatted}</span>
        </div>
      </div>

      {/* Dynamic Progress Track Bar */}
      <div className="space-y-1.5 bg-[#F8FAFC] dark:bg-zinc-900 p-3 rounded-sm border border-[#E4E6EB] dark:border-zinc-800">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-gray-700 dark:text-zinc-200 flex items-center space-x-1">
            <Zap size={12} className="text-[#1877F2]" />
            <span>全队综合执行进度</span>
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-zinc-400">
              {missionState.waypoints.filter((w) => w.isArrived).length}/{missionState.waypoints.length} 坐标点完成
            </span>
            <span className="font-mono font-black text-xs text-[#1877F2] dark:text-blue-400">
              {currentProgressPercent}%
            </span>
          </div>
        </div>

        {/* Progress bar container */}
        <div className="relative w-full h-3 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#1877F2] to-blue-400 rounded-full transition-all duration-500 relative"
            style={{ width: `${currentProgressPercent}%` }}
          >
            {/* Animated shimmer light effect */}
            <div className="absolute inset-0 bg-white/25 animate-pulse" />
          </div>
        </div>

        {/* Start / End Meta */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
          <span>09:00 出发</span>
          <span className="text-[#1877F2] dark:text-blue-400 font-bold">▲ 当前推进位置</span>
          <span>
            {waypoints[waypoints.length - 1]?.description?.match(/预计到达:\s*(\d{2}:\d{2})/)?.[1] || '17:30'} 终点会师
          </span>
        </div>
      </div>

      {/* Milestone Nodes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {milestones.map((m, idx) => {
          const isCurrentActive =
            (m.status === 'in_progress' || (idx === 1 && missionState.missionStatus === 'in_progress')) &&
            missionState.missionStatus !== 'ended' &&
            missionState.missionStatus !== 'completed';
          const isDone =
            m.status === 'completed' ||
            (idx === 0 && missionState.missionStatus !== 'preparing') ||
            missionState.missionStatus === 'completed' ||
            missionState.missionStatus === 'ended';
          const isBlocked = m.taskObj?.isBlocked || m.status === 'blocked';

          return (
            <div
              key={`ms-node-${m.id}-${idx}`}
              onClick={() => {
                if (m.taskObj && onSelectTask) onSelectTask(m.taskObj);
                if (m.wpId && onSelectWaypoint) onSelectWaypoint(m.wpId);
              }}
              className={`p-2.5 rounded-sm border transition-all relative flex flex-col justify-between cursor-pointer ${
                isCurrentActive
                  ? 'bg-blue-50/60 dark:bg-blue-950/40 border-[#1877F2] ring-2 ring-[#1877F2]/20 shadow-xs'
                  : isBlocked
                  ? 'bg-rose-50/50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60'
                  : isDone
                  ? 'bg-white dark:bg-zinc-900 border-[#E4E6EB] dark:border-zinc-800 hover:border-emerald-500'
                  : 'bg-[#FAFAFA] dark:bg-zinc-950 border-[#E4E6EB] dark:border-zinc-800 opacity-85 hover:opacity-100'
              }`}
            >
              {/* Top Node Indicator & Time */}
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : isBlocked
                        ? 'bg-rose-500 border-rose-600 text-white animate-bounce'
                        : isCurrentActive
                        ? 'bg-[#1877F2] border-[#1877F2] text-white animate-pulse'
                        : 'bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">{m.time}</span>
                    <span className="text-[9px] px-1 py-0.2 bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] dark:text-blue-400 rounded-xs font-mono font-bold">
                      ETA
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-sm font-bold border ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60'
                      : isBlocked
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                      : isCurrentActive
                      ? 'bg-blue-100 dark:bg-blue-950 text-[#1877F2] dark:text-blue-400 border-blue-300 dark:border-blue-800'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-700'
                  }`}
                >
                  {isDone ? '已完成' : isBlocked ? '⚠️ 阻塞' : isCurrentActive ? '● 进行中' : '等待到达'}
                </span>
              </div>

              {/* Title & Location */}
              <div className="min-w-0 mb-2">
                <div className="text-xs font-bold text-gray-900 dark:text-white truncate" title={m.title}>
                  {m.title}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-zinc-400 truncate mt-0.5 flex items-center space-x-1">
                  <span>📍</span>
                  <span className="font-semibold text-gray-700 dark:text-zinc-300">{m.location}</span>
                </div>
              </div>

              {/* Bottom Details & Doc Link */}
              <div className="pt-1.5 border-t border-gray-100 dark:border-zinc-800 text-[10px] text-gray-600 dark:text-zinc-400 space-y-1">
                <p className="line-clamp-1">{m.desc}</p>
                {m.taskObj?.associatedDocTitle && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (m.taskObj?.associatedDocId && onOpenDoc) {
                        onOpenDoc(m.taskObj.associatedDocId);
                      }
                    }}
                    className="text-[#1877F2] dark:text-blue-400 hover:underline flex items-center space-x-1 font-bold truncate cursor-pointer"
                  >
                    <FileText size={10} />
                    <span className="truncate">{m.taskObj.associatedDocTitle}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
