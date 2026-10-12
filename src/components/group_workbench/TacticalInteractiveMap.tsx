import React, { useState, useRef, useEffect } from 'react';
import {
  Navigation,
  Plus,
  Move,
  Check,
  RotateCcw,
  Sparkles,
  MapPin,
  Maximize2,
  Minimize2,
  Layers,
  Zap,
  Clock,
  Compass,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  MissionWaypoint,
  MemberAssignedRoute,
  TacticalMissionTask,
  SquadMissionTacticalState,
  SquadBorderConfig,
  TacticalTimelineEvent,
} from './types';
import { WaveAvatar } from './WaveAvatar';
import { recalculateMissionRouteSchedule } from './routePlanningService';

interface TacticalInteractiveMapProps {
  missionState: SquadMissionTacticalState;
  onUpdateWaypoints?: (waypoints: MissionWaypoint[]) => void;
  onRecalculateSchedule?: (payload: {
    waypoints: MissionWaypoint[];
    tacticalTasks: TacticalMissionTask[];
    memberRoutes: MemberAssignedRoute[];
    timelineEvent?: TacticalTimelineEvent;
    totalDistanceKm: number;
    estimatedTotalMinutes: number;
  }) => void;
  selectedWaypointId: string | null;
  onSelectWaypoint: (waypointId: string) => void;
  squadBorderConfig: SquadBorderConfig;
  leaderId: string;
  isRerouted?: boolean;
  showToast: (msg: string) => void;
  className?: string;
}

export const TacticalInteractiveMap: React.FC<TacticalInteractiveMapProps> = ({
  missionState,
  onUpdateWaypoints,
  onRecalculateSchedule,
  selectedWaypointId,
  onSelectWaypoint,
  squadBorderConfig,
  leaderId,
  isRerouted = false,
  showToast,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingWaypoint, setIsDraggingWaypoint] = useState<string | null>(null);
  const [isOptimizingAnimation, setIsOptimizingAnimation] = useState(false);
  const [routeMetrics, setRouteMetrics] = useState({
    distanceKm: 3.8,
    estimatedMinutes: 240,
  });

  // Maintain interactive coordinates in percentage relative to container
  const [waypointPositions, setWaypointPositions] = useState<Record<string, { xPct: number; yPct: number }>>(() => {
    const initial: Record<string, { xPct: number; yPct: number }> = {};
    missionState.waypoints.forEach((wp, idx) => {
      // Base layout on map
      const x = 20 + (idx % 6) * 12 + (idx === 4 ? 4 : 0);
      const y = 74 - idx * 9.5;
      initial[wp.id] = { xPct: Math.min(92, Math.max(8, x)), yPct: Math.min(90, Math.max(10, y)) };
    });
    return initial;
  });

  // Keep waypoint positions in sync when waypoints list changes externally
  useEffect(() => {
    setWaypointPositions((prev) => {
      const next = { ...prev };
      let changed = false;
      missionState.waypoints.forEach((wp, idx) => {
        if (!next[wp.id]) {
          const x = 20 + (idx % 6) * 12 + (idx === 4 ? 4 : 0);
          const y = 74 - idx * 9.5;
          next[wp.id] = { xPct: Math.min(92, Math.max(8, x)), yPct: Math.min(90, Math.max(10, y)) };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [missionState.waypoints]);

  // Compute Optimal Polyline using Distance & Geometry
  const computeOptimalPolyline = () => {
    const sortedWps = [...missionState.waypoints].sort((a, b) => a.orderIndex - b.orderIndex);
    const pts = sortedWps.map((wp) => {
      const pos = waypointPositions[wp.id] || { xPct: 50, yPct: 50 };
      return { id: wp.id, x: pos.xPct * 8, y: pos.yPct * 6 }; // Scale to 800x600 SVG viewBox
    });

    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;

    let pathD = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      if (isRerouted && i === 3) {
        // Smooth reroute bypass curve
        pathD += ` Q ${pts[i].x + 40},${pts[i].y - 30} ${pts[i].x},${pts[i].y}`;
      } else {
        pathD += ` L ${pts[i].x},${pts[i].y}`;
      }
    }
    return pathD;
  };

  // Compute member sub-route paths dynamically based on assigned waypoint coordinates
  const computeMemberRouteD = (mr: MemberAssignedRoute) => {
    const pts = mr.waypointIds
      .map((wId) => {
        const pos = waypointPositions[wId];
        return pos ? { x: pos.xPct * 8, y: pos.yPct * 6 } : null;
      })
      .filter((p): p is { x: number; y: number } => p !== null);

    if (pts.length < 2) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x},${pts[i].y}`;
    }
    return d;
  };

  // Drag and drop handlers
  const handlePointerDown = (wpId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDraggingWaypoint(wpId);
    onSelectWaypoint(wpId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingWaypoint || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const xPct = Math.max(5, Math.min(95, Math.round((rawX / rect.width) * 100)));
    const yPct = Math.max(5, Math.min(95, Math.round((rawY / rect.height) * 100)));

    setWaypointPositions((prev) => ({
      ...prev,
      [isDraggingWaypoint]: { xPct, yPct },
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingWaypoint) {
      const targetWp = missionState.waypoints.find((w) => w.id === isDraggingWaypoint);
      const draggedId = isDraggingWaypoint;
      setIsDraggingWaypoint(null);

      // Trigger optimization calculation animation
      setIsOptimizingAnimation(true);
      setTimeout(() => setIsOptimizingAnimation(false), 900);

      // 核心：调用路线路径规划接口，重新计算最优路线，并自动更新所有队员任务卡片中的预计到达时间(ETA)与里程碑
      const result = recalculateMissionRouteSchedule(
        missionState.waypoints,
        waypointPositions,
        missionState.tacticalTasks,
        missionState.memberRoutes,
        draggedId,
        missionState.startLocationName ? '09:00' : '09:00'
      );

      setRouteMetrics({
        distanceKm: result.totalDistanceKm,
        estimatedMinutes: result.estimatedTotalMinutes,
      });

      if (onRecalculateSchedule) {
        onRecalculateSchedule(result);
      } else if (onUpdateWaypoints) {
        onUpdateWaypoints(result.waypoints);
      }

      const draggedEta = result.waypoints.find((w) => w.id === draggedId)?.description?.match(/预计到达:\s*(\d{2}:\d{2})/);
      showToast(
        `队长已调整「${targetWp?.name || '检查点'}」坐标：路径已重新拟合(全长 ${result.totalDistanceKm}km)，ETA更新为 ${draggedEta ? draggedEta[1] : '已刷新'}！`
      );
    }
  };

  // 队长一键触发「最优路线重新拟合」接口
  const handleManualRecompute = () => {
    setIsOptimizingAnimation(true);
    setTimeout(() => setIsOptimizingAnimation(false), 900);

    const result = recalculateMissionRouteSchedule(
      missionState.waypoints,
      waypointPositions,
      missionState.tacticalTasks,
      missionState.memberRoutes,
      selectedWaypointId || missionState.waypoints[0]?.id
    );

    setRouteMetrics({
      distanceKm: result.totalDistanceKm,
      estimatedMinutes: result.estimatedTotalMinutes,
    });

    if (onRecalculateSchedule) {
      onRecalculateSchedule(result);
    } else if (onUpdateWaypoints) {
      onUpdateWaypoints(result.waypoints);
    }

    showToast(`已调用路径规划算法：已根据当前全部 ${missionState.waypoints.length} 个坐标点重新计算最优路线与全员ETA！`);
  };

  const totalPolylineD = computeOptimalPolyline();

  return (
    <div
      ref={mapContainerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`w-full h-full relative overflow-hidden bg-[#EBF2F7] dark:bg-zinc-950 select-none touch-none ${className}`}
    >
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-25 dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#1877F2 1px, transparent 1px), radial-gradient(#1877F2 1px, #EBF2F7 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Dynamic Route Re-calculation Status Banner */}
      {isOptimizingAnimation && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-gray-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full border border-blue-400/40 shadow-lg flex items-center space-x-2 text-xs animate-in fade-in zoom-in-95 pointer-events-none">
          <Sparkles size={13} className="text-yellow-400 animate-spin" />
          <span className="font-bold">TSP 最优折线规划中 · 正在同步全员任务卡片 ETA...</span>
        </div>
      )}

      {/* SVG Canvas for Map Topography, Routes, and Optimal Polyline */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1877F2" />
            <stop offset="100%" stopColor="#00C2FF" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Yellow River Stream (黄河水域) */}
        <path
          d="M 0,380 Q 200,340 400,360 T 800,330 L 800,430 Q 600,450 400,440 T 0,460 Z"
          fill="#BAE6FD"
          opacity="0.65"
        />
        <text x="40" y="420" fill="#0284C7" fontSize="13" fontWeight="bold" opacity="0.8">
          黄河兰州段 · 风情线水域
        </text>

        {/* White Pagoda Mountain Topography (白塔山地形轮廓) */}
        <path
          d="M 150,220 Q 300,120 500,130 T 780,240 L 780,310 Q 500,280 200,300 Z"
          fill="#D1FAE5"
          opacity="0.6"
        />
        <text x="360" y="160" fill="#059669" fontSize="13" fontWeight="bold" opacity="0.8">
          白塔山公园主峰 · 标高 1700m
        </text>

        {/* Dynamic Computed Optimal Total Polyline (动态最优总路线) */}
        <path
          d={totalPolylineD}
          fill="none"
          stroke={isRerouted ? '#8B5CF6' : 'url(#routeGradient)'}
          strokeWidth="6"
          strokeDasharray={isRerouted ? '6,6' : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isRerouted || isOptimizingAnimation ? 'animate-pulse' : ''}
          filter="url(#glow)"
        />

        {/* Member Sub-Routes Overlays (自动拟合队员所选坐标点) */}
        {missionState.memberRoutes.map((mr, mrIdx) => {
          const memberPathD = computeMemberRouteD(mr);
          if (!memberPathD) return null;
          return (
            <path
              key={`map-subroute-${mr.memberId}-${mrIdx}`}
              d={memberPathD}
              fill="none"
              stroke={mr.routeColor}
              strokeWidth="3"
              strokeDasharray="4,4"
              opacity="0.9"
            />
          );
        })}
      </svg>

      {/* Interactive Drag-and-Drop Waypoint Markers */}
      {missionState.waypoints.map((wp, idx) => {
        const isSelected = selectedWaypointId === wp.id;
        const pos = waypointPositions[wp.id] || { xPct: 20 + idx * 12, yPct: 70 - idx * 8 };
        const isHazard = wp.type === 'hazard';
        const isGathering = wp.type === 'gathering';
        const isDestination = wp.type === 'destination';
        const isTask = wp.type === 'task';
        const isSupply = wp.type === 'supply';

        // Extract ETA badge if present
        const etaMatch = wp.description?.match(/预计到达:\s*(\d{2}:\d{2})/);
        const etaText = etaMatch ? etaMatch[1] : null;

        return (
          <div
            key={`map-marker-${wp.id}-${idx}`}
            onPointerDown={(e) => handlePointerDown(wp.id, e)}
            style={{
              left: `${pos.xPct}%`,
              top: `${pos.yPct}%`,
              cursor: isDraggingWaypoint === wp.id ? 'grabbing' : 'grab',
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-transform ${
              isSelected ? 'scale-115 z-40' : 'hover:scale-105'
            }`}
            title={`按住拖拽校准坐标：${wp.name}（拖拽后自动重算最优路线与全员预计到达时间）`}
          >
            {/* Pulsing ring on hazard or active */}
            {isHazard && (
              <span className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
            )}

            {/* Waypoint Marker Icon */}
            <div
              className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-sm text-xs font-bold transition-all ${
                isHazard
                  ? 'bg-rose-50 border-rose-500 text-rose-600'
                  : isGathering
                  ? 'bg-blue-50 border-[#1877F2] text-[#1877F2]'
                  : isDestination
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-700'
                  : isSupply
                  ? 'bg-amber-50 border-amber-500 text-amber-700'
                  : isTask
                  ? 'bg-purple-50 border-purple-600 text-purple-700'
                  : 'bg-white border-gray-600 text-gray-800'
              } ${isDraggingWaypoint === wp.id ? 'ring-4 ring-[#1877F2]/40 scale-110 shadow-lg' : ''}`}
            >
              {isHazard ? (
                '⚠️'
              ) : isGathering ? (
                '🚩'
              ) : isDestination ? (
                '🏁'
              ) : isSupply ? (
                '☕'
              ) : isTask ? (
                '🎯'
              ) : (
                idx + 1
              )}

              {wp.isArrived && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black border border-white">
                  ✓
                </span>
              )}
            </div>

            {/* Waypoint Label & Live ETA Badge */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded-sm whitespace-nowrap text-[10px] font-bold border shadow-2xs pointer-events-none flex flex-col items-center gap-0.5 ${
                isSelected
                  ? 'bg-gray-900 text-white border-gray-900 ring-2 ring-[#1877F2]'
                  : 'bg-white/95 text-gray-800 border-[#E4E6EB]'
              }`}
            >
              <div className="flex items-center space-x-1">
                <span>{wp.name}</span>
                {isDraggingWaypoint === wp.id && <Move size={10} className="text-[#1877F2] animate-spin" />}
              </div>
              {etaText && (
                <span
                  className={`text-[9px] px-1 py-0.2 rounded-xs font-mono font-extrabold ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-[#1877F2] border border-blue-200'
                  }`}
                >
                  ETA {etaText}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Member Live Position Markers with Animated Wave Border and Captain C Badge */}
      {missionState.memberRoutes.map((mr, i) => {
        const posX = 30 + i * 20 + (mr.status === 'blocked' ? -5 : 0);
        const posY = 65 - i * 16;
        const isCaptain = mr.memberId === leaderId || mr.memberName.includes('队长');

        return (
          <div
            key={`map-member-av-${mr.memberId}-${i}`}
            style={{ left: `${posX}%`, top: `${posY}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-35 flex flex-col items-center cursor-pointer transition-all duration-300"
            title={`${mr.memberName} · ${mr.status === 'blocked' ? '⚠️ 任务阻塞' : '前进中'}`}
          >
            <WaveAvatar
              src={mr.memberAvatar}
              name={mr.memberName}
              size={36}
              isCaptain={isCaptain}
              badgeIcon={squadBorderConfig.badge}
              borderConfig={squadBorderConfig}
              className="shadow-md"
            />

            <div className="mt-1 px-1.5 py-0.2 bg-white/90 backdrop-blur-xs text-[9.5px] font-bold text-gray-900 rounded-sm border border-[#E4E6EB] whitespace-nowrap shadow-2xs flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mr.routeColor }} />
              <span>{mr.memberName.split(' ')[0]}</span>
            </div>
          </div>
        );
      })}

      {/* Top Left Dynamic Route Recalculation Bar */}
      <div className="absolute top-3 left-3 z-30 flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={handleManualRecompute}
          className="px-2.5 py-1.5 bg-white/95 dark:bg-zinc-900/95 hover:bg-blue-50 dark:hover:bg-zinc-800 text-[#1877F2] dark:text-blue-400 text-xs font-bold rounded-sm border border-[#E4E6EB] dark:border-zinc-800 hover:border-[#1877F2] shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer backdrop-blur-xs"
        >
          <Compass size={13} className="text-[#1877F2] dark:text-blue-400" />
          <span>重算最优路线</span>
        </button>

        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs rounded-sm border border-[#E4E6EB] dark:border-zinc-800 text-[11px] text-gray-600 dark:text-zinc-300 shadow-2xs">
          <span className="flex items-center space-x-1 text-gray-800 dark:text-white font-bold">
            <Activity size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span>路线全长: {routeMetrics.distanceKm} km</span>
          </span>
          <span className="text-gray-300 dark:text-zinc-700">|</span>
          <span className="text-gray-500 dark:text-zinc-400">
            拖拽任意坐标点即时重算 ETA 与任务卡片
          </span>
        </div>
      </div>

      {/* Floating Tactical Route Thumbnail Overlay (小队总路线缩略图) */}
      <div className="absolute bottom-3 right-3 z-30 p-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs rounded-sm border border-[#E4E6EB] dark:border-zinc-800 shadow-md pointer-events-auto">
        <div className="flex items-center justify-between text-[10px] font-bold text-gray-700 dark:text-zinc-300 mb-1 border-b border-gray-100 dark:border-zinc-800 pb-1">
          <span className="flex items-center space-x-1">
            <Navigation size={11} className="text-[#1877F2] dark:text-blue-400" />
            <span>总路线缩略图</span>
          </span>
          <span className="text-gray-400 dark:text-zinc-500 font-mono">{routeMetrics.distanceKm}km</span>
        </div>

        {/* Mini SVG Thumbnail */}
        <div className="w-28 h-18 bg-[#F0F4F8] dark:bg-zinc-950 rounded-xs border border-gray-200 dark:border-zinc-800 relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 800 600">
            <path
              d="M 0,380 Q 200,340 400,360 T 800,330 L 800,430 Q 600,450 400,440 T 0,460 Z"
              fill="#BAE6FD"
              opacity="0.8"
            />
            <path
              d={totalPolylineD}
              fill="none"
              stroke={isRerouted ? '#8B5CF6' : '#1877F2'}
              strokeWidth="16"
              strokeLinecap="round"
            />
            {missionState.waypoints.map((wp, wpIdx) => {
              const pos = waypointPositions[wp.id] || { xPct: 50, yPct: 50 };
              return (
                <circle
                  key={`map-thumb-wp-${wp.id}-${wpIdx}`}
                  cx={pos.xPct * 8}
                  cy={pos.yPct * 6}
                  r="18"
                  fill="#FFFFFF"
                  stroke="#1877F2"
                  strokeWidth="8"
                />
              );
            })}
          </svg>
        </div>

        <div className="text-[9px] text-gray-500 dark:text-zinc-400 text-center mt-1 font-medium">
          队长拖拽检查点动态拟合
        </div>
      </div>
    </div>
  );
};
