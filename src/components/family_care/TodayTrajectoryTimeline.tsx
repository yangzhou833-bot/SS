import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Footprints,
  Car,
  Home,
  MapPin,
  Clock,
  Navigation,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Zap,
  FastForward,
  UserCheck
} from 'lucide-react';
import { CareMember } from '../FamilyCareMonitorPage';

export interface TrajectoryNode {
  id: string;
  time: string;
  location: string;
  arrivalTime: string;
  departureTime: string;
  stayDuration: string;
  moveMode: 'walk' | 'bike' | 'car' | 'bus' | 'stay';
  distance: string;
  confidence: string; // e.g., '99% 高精定位'
  isTriggerAlert: boolean;
  alertText?: string;
  isCommonPlace: boolean;
  coords: { x: number; y: number };
}

export interface TodayTrajectoryTimelineProps {
  member: CareMember;
  onSelectNode: (node: TrajectoryNode) => void;
  onFocusMember: (member: CareMember) => void;
  onShowAllMembers: () => void;
  onToggleTrajectoryVisibility: (visible: boolean) => void;
}

const DEFAULT_NODES: TrajectoryNode[] = [
  {
    id: 'node-1',
    time: '08:10',
    location: '家庭住址 (阳光家园2号楼)',
    arrivalTime: '07:28',
    departureTime: '08:10',
    stayDuration: '停留 42 分钟',
    moveMode: 'stay',
    distance: '0 km',
    confidence: '99% 卫星高精定位',
    isTriggerAlert: false,
    isCommonPlace: true,
    coords: { x: 48, y: 50 },
  },
  {
    id: 'node-2',
    time: '08:52',
    location: '前往朝阳第一小学',
    arrivalTime: '08:10',
    departureTime: '08:52',
    stayDuration: '移动中 · 18 分钟',
    moveMode: 'walk',
    distance: '步行 1.2 km',
    confidence: '98% 北斗基站辅助',
    isTriggerAlert: false,
    isCommonPlace: false,
    coords: { x: 40, y: 40 },
  },
  {
    id: 'node-3',
    time: '09:10',
    location: '朝阳第一小学 (校园安全区)',
    arrivalTime: '08:52',
    departureTime: '16:40',
    stayDuration: '停留 6 小时 20 分钟',
    moveMode: 'stay',
    distance: '0.1 km',
    confidence: '99% 校园围栏蓝牙信标',
    isTriggerAlert: true,
    alertText: '已安全到达学校 (电子围栏自动打卡)',
    isCommonPlace: true,
    coords: { x: 30, y: 30 },
  },
  {
    id: 'node-4',
    time: '16:40',
    location: '离开学校 · 前往家庭住址',
    arrivalTime: '16:40',
    departureTime: '进行中',
    stayDuration: '预计 18:20 到家',
    moveMode: 'walk',
    distance: '步行 860 m',
    confidence: '96% GPS实时跟踪',
    isTriggerAlert: false,
    isCommonPlace: false,
    coords: { x: 55, y: 62 },
  },
];

export const TodayTrajectoryTimeline: React.FC<TodayTrajectoryTimelineProps> = ({
  member,
  onSelectNode,
  onFocusMember,
  onShowAllMembers,
  onToggleTrajectoryVisibility,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<1 | 2 | 4>(1);
  const [progressIndex, setProgressIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const onSelectNodeRef = useRef(onSelectNode);
  onSelectNodeRef.current = onSelectNode;

  // Playback timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressIndex((prev) => {
          if (prev >= DEFAULT_NODES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          setTimeout(() => onSelectNodeRef.current?.(DEFAULT_NODES[next]), 0);
          return next;
        });
      }, 2000 / playSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playSpeed]);

  const toggleVisibility = () => {
    const next = !isVisible;
    setIsVisible(next);
    onToggleTrajectoryVisibility(next);
  };

  return (
    <div className="bg-white border border-[#E4E6EB] rounded-md p-3 space-y-3 select-none">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E6EB] pb-2">
        <div className="flex items-center gap-1.5">
          <Footprints size={15} className="text-[#1877F2]" />
          <h4 className="text-[13px] font-bold text-[#050505]">今日活动轨迹</h4>
          <span className="text-[10px] bg-blue-50 text-[#1877F2] px-1.5 py-0.5 rounded-sm border border-blue-200">
            {member.name}
          </span>
        </div>

        {/* Player Action Toolbar */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2 py-1 rounded-sm text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              isPlaying
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-[#1877F2] text-white hover:bg-blue-600'
            }`}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? '暂停播放' : '播放轨迹'}</span>
          </button>

          {/* Speed Selector */}
          <button
            type="button"
            onClick={() => setPlaySpeed(playSpeed === 1 ? 2 : playSpeed === 2 ? 4 : 1)}
            className="px-2 py-1 rounded-sm border border-[#E4E6EB] bg-gray-50 hover:bg-gray-100 text-[#050505] text-[10.5px] font-bold cursor-pointer"
            title="切换播放倍速"
          >
            {playSpeed}x 倍速
          </button>

          <button
            type="button"
            onClick={() => onFocusMember(member)}
            className="p-1 rounded-sm border border-[#E4E6EB] hover:bg-gray-100 text-[#65676B]"
            title="聚焦当前成员"
          >
            <Navigation size={13} />
          </button>

          <button
            type="button"
            onClick={onShowAllMembers}
            className="p-1 rounded-sm border border-[#E4E6EB] hover:bg-gray-100 text-[#65676B]"
            title="显示全部家庭成员"
          >
            <UserCheck size={13} />
          </button>

          <button
            type="button"
            onClick={toggleVisibility}
            className="p-1 rounded-sm border border-[#E4E6EB] hover:bg-gray-100 text-[#65676B]"
            title={isVisible ? '隐藏轨迹' : '显示轨迹'}
          >
            {isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-[#65676B]">
          <span>轨迹回放进度 ({progressIndex + 1} / {DEFAULT_NODES.length})</span>
          <span>{DEFAULT_NODES[progressIndex]?.time} · {DEFAULT_NODES[progressIndex]?.location}</span>
        </div>
        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#1877F2] h-full transition-all duration-300"
            style={{ width: `${((progressIndex + 1) / DEFAULT_NODES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Timeline Node List */}
      <div className="space-y-2 relative pl-3 border-l-2 border-[#1877F2]/30 max-h-56 overflow-y-auto">
        {DEFAULT_NODES.map((node, idx) => {
          const isSelected = idx === progressIndex;
          return (
            <div
              key={node.id}
              onClick={() => {
                setProgressIndex(idx);
                onSelectNode(node);
              }}
              className={`p-2 rounded-md border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50/70 border-[#1877F2] shadow-2xs'
                  : 'bg-white border-[#E4E6EB] hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#050505]">{node.time}</span>
                  <span className="text-[11px] font-semibold text-[#1877F2]">{node.location}</span>
                </div>
                {node.isCommonPlace && (
                  <span className="text-[9.5px] bg-emerald-50 text-emerald-700 px-1 rounded border border-emerald-200">
                    家庭常用地点
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1 text-[10.5px] text-[#65676B]">
                <span>到达: {node.arrivalTime}</span>
                <span>离开: {node.departureTime}</span>
                <span className="font-medium text-gray-800">{node.stayDuration}</span>
                <span>{node.distance}</span>
                <span className="text-[9.5px] bg-gray-100 px-1 rounded">{node.confidence}</span>
              </div>

              {node.isTriggerAlert && node.alertText && (
                <div className="mt-1.5 p-1 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-800 flex items-center gap-1 font-medium">
                  <AlertCircle size={11} className="text-amber-600 shrink-0" />
                  <span>{node.alertText}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
