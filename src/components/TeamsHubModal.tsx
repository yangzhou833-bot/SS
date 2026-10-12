import React, { useState } from 'react';
import {
  X,
  Users,
  Plus,
  MapPin,
  Footprints,
  Shield,
  Navigation,
  Clock,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { SimulatedMapActivity } from '../types';

export interface TeamsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateTeam: () => void;
  onSelectTeamActivityOnMap: (activityId?: string) => void;
  onOpenTeamsPage?: () => void;
  activities: SimulatedMapActivity[];
  showToast?: (msg: string) => void;
}

interface TeamOverviewItem {
  id: string;
  name: string;
  category: string;
  avatar: string;
  role: 'admin' | 'member';
  roleText: string;
  memberCount: number;
  activeNowCount: number;
  activityId?: string;
  activityTitle?: string;
  geofenceRadiusKm: number;
  description: string;
  members: {
    name: string;
    avatar: string;
    statusText: string;
    transport: string;
    isArrived: boolean;
  }[];
}

const PRESET_MY_TEAMS: TeamOverviewItem[] = [
  {
    id: 'team-geek-lzu',
    name: '兰州大学极客小组 · 2026',
    category: '技术研发 & 算法集训',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=200',
    role: 'admin',
    roleText: '👑 小组管理员 (我)',
    memberCount: 4,
    activeNowCount: 4,
    activityId: 'act-team-1',
    activityTitle: '【极客开发营】算法集训实战营 & 编程黑客松',
    geofenceRadiusKm: 2.5,
    description: '兰州大学开源与算法竞技团队，已开启 2.5km 活动电子围栏与全员实时轨迹授权',
    members: [
      { name: 'Alex Mercer (我)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', statusText: '场地已就位', transport: 'walk', isArrived: true },
      { name: '陈晨', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', statusText: '🚗 驾车·在途 (38km/h)', transport: 'car', isArrived: false },
      { name: '林峰', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', statusText: '🚶 步行·在途 (5km/h)', transport: 'walk', isArrived: false },
      { name: '赵敏', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', statusText: '🚴 骑行·在途 (16km/h)', transport: 'bike', isArrived: false },
    ],
  },
  {
    id: 'team-cycling-lanzhou',
    name: '兰州高校骑行徒步社',
    category: '户外探险 & 运动社交',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200',
    role: 'member',
    roleText: '👤 普通组员',
    memberCount: 6,
    activeNowCount: 3,
    geofenceRadiusKm: 5.0,
    description: '周末黄河风情线与兴隆山骑行拉练，实时共享组员骑行速度与轨迹点位',
    members: [
      { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', statusText: '领队·已就位', transport: 'bike', isArrived: true },
      { name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', statusText: '准备中', transport: 'walk', isArrived: false },
      { name: '王珂', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', statusText: '🚴 骑行·在途', transport: 'bike', isArrived: false },
    ],
  },
];

export const TeamsHubModal: React.FC<TeamsHubModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateTeam,
  onSelectTeamActivityOnMap,
  onOpenTeamsPage,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredTeams = PRESET_MY_TEAMS.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="teams-hub-modal"
        className="relative w-full max-w-lg bg-white rounded-md border border-[#E4E6EB] shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Facebook Blue Accent Line */}
        <div className="h-1 w-full bg-[#1877F2]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E6EB] bg-white shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-md bg-[#E7F3FF] border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2]">
              <Users size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[#050505]">小组中心</h2>
                <span className="text-[10.5px] font-bold px-1.5 py-0.2 rounded-xs bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/20">
                  {PRESET_MY_TEAMS.length} 个小组
                </span>
              </div>
              <p className="text-[11px] text-[#65676B]">
                小组动态 · 全员定位与活动轨迹查阅 · 电子围栏
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Create Team Quick Action inside Group Hub */}
            <button
              id="hub-create-team-btn"
              onClick={() => {
                onClose();
                onOpenCreateTeam();
              }}
              className="px-2.5 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] active:scale-[0.98] text-white text-xs font-bold rounded-sm border border-[#1877F2] shadow-2xs flex items-center space-x-1 transition-colors cursor-pointer"
              title="创建新的小组"
            >
              <Plus size={13} className="stroke-[2.5]" />
              <span>添加小组</span>
            </button>

            <button
              id="close-teams-hub-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-95 flex items-center justify-center text-[#65676B] transition-colors cursor-pointer border border-[#E4E6EB]"
              title="关闭"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#F0F2F5] border-b border-[#E4E6EB] shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#65676B]" />
            <input
              type="text"
              placeholder="搜索我加入的小组、团队标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E4E6EB] rounded-sm text-xs text-[#050505] placeholder-[#8A8D91] focus:outline-none focus:border-[#1877F2]"
            />
          </div>
        </div>

        {/* Scrollable Teams List */}
        <div className="p-3.5 overflow-y-auto space-y-3 flex-1">
          {filteredTeams.map((team) => {
            const isAdmin = team.role === 'admin';

            return (
              <div
                key={team.id}
                className="bg-white rounded-md border border-[#E4E6EB] hover:border-[#1877F2]/60 p-3.5 transition-all shadow-2xs"
              >
                {/* Team Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={team.avatar}
                      alt={team.name}
                      className="w-11 h-11 rounded-md object-cover border border-[#E4E6EB] shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <h3 className="font-bold text-xs text-[#050505]">{team.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-xs border ${
                            isAdmin
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-gray-100 text-[#65676B] border-gray-200'
                          }`}
                        >
                          {team.roleText}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#65676B] mt-0.5 flex items-center space-x-2">
                        <span>{team.category}</span>
                        <span>·</span>
                        <span>{team.memberCount} 位成员</span>
                        <span>·</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                          {team.activeNowCount}人在线
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Description & Geofence Policy */}
                <p className="text-[11px] text-[#65676B] mt-2.5 leading-relaxed bg-[#F7F8FA] p-2 rounded-sm border border-[#E4E6EB]">
                  {team.description}
                </p>

                {/* Group Activity Highlight (if any) */}
                {team.activityTitle && (
                  <div className="mt-2.5 p-2 bg-[#E7F3FF] rounded-sm border border-[#1877F2]/20 flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-6 h-6 rounded-xs bg-[#1877F2] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        🏃
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-[#1877F2] truncate">
                          进行中活动：{team.activityTitle}
                        </div>
                        <div className="text-[9.5px] text-[#65676B] flex items-center space-x-1">
                          <Shield size={10} className="text-[#1877F2]" />
                          <span>围栏半径: {team.geofenceRadiusKm}km · 授权定位有效</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-xs border border-emerald-300 shrink-0">
                      进行中
                    </span>
                  </div>
                )}

                {/* Member Avatars & Live Status Row */}
                <div className="mt-3 pt-2.5 border-t border-[#E4E6EB]">
                  <div className="text-[10.5px] font-bold text-[#050505] mb-2 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Users size={12} className="text-[#1877F2]" />
                      <span>组员实时状态</span>
                    </span>
                    <span className="text-[10px] text-[#65676B]">
                      {isAdmin ? '👑 您享有全员定位与轨迹查阅权限' : '🔒 轨迹隐私保护中'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {team.members.map((m, mIdx) => (
                      <div
                        key={`m-${team.id}-${mIdx}`}
                        className="flex items-center space-x-2 p-1.5 rounded-xs bg-[#F7F8FA] border border-[#E4E6EB]"
                      >
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-6 h-6 rounded-full object-cover border border-white shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[10.5px] font-bold text-[#050505] truncate">{m.name}</div>
                          <div className="text-[9.5px] text-[#65676B] truncate flex items-center space-x-1">
                            <span>{m.statusText}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons (Facebook Straight-Edge Style) */}
                <div className="mt-3 pt-2.5 border-t border-[#E4E6EB] flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectTeamActivityOnMap(team.activityId);
                      showToast?.(`📍 已在地图聚焦「${team.name}」并打开活动及全员行进轨迹看板`);
                    }}
                    className="flex-1 py-1.5 px-2 bg-[#1877F2] hover:bg-[#166FE5] active:scale-[0.98] text-white text-xs font-bold rounded-sm border border-[#1877F2] shadow-2xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Navigation size={12} />
                    <span>地图聚焦与全员轨迹</span>
                  </button>

                  {onOpenTeamsPage && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTeamsPage();
                        showToast?.(`💼 已进入「${team.name}」完整团队工作空间`);
                      }}
                      className="py-1.5 px-3 bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-[0.98] text-[#050505] text-xs font-bold rounded-sm border border-[#E4E6EB] flex items-center space-x-1 transition-colors cursor-pointer"
                      title="进入小组大厅与团队工作空间"
                    >
                      <ExternalLink size={12} />
                      <span>工作空间</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Quick Actions */}
        <div className="p-3 bg-[#F7F8FA] border-t border-[#E4E6EB] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#65676B] flex items-center space-x-1">
            <CheckCircle2 size={13} className="text-[#1877F2]" />
            <span>支持自定义小组活动范围与位置授权规则</span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenTeamsPage && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTeamsPage();
                }}
                className="text-xs font-bold text-[#1877F2] hover:underline flex items-center space-x-0.5 cursor-pointer"
              >
                <span>完整小组大厅</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
