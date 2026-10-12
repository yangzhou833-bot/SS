import React, { useState } from 'react';
import { Menu, Search, Plus, Clock, Users, Pin, Shield, MapPin, Sparkles, ChevronRight, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GroupHomeScreen } from './GroupHomeScreen';
import { CreateTeamGroupModal, NewGroupData } from './CreateTeamGroupModal';

interface TeamCardData {
  id: string;
  name: string;
  subtitle: string;
  thumbnail: string;
  adminAvatar: string;
  adminName: string;
  attribute: string;
  city: string;
  memberComposition: string;
  timeLabel: string;
  members: string[];
  totalMembersCount: number;
  role: string;
  isPinned: boolean;
  category: 'Your Teams' | 'For You' | 'Discover';
}

const INITIAL_TEAMS: TeamCardData[] = [
  {
    id: 'team-1',
    name: '小组 · 极客开发营',
    subtitle: '专注于高性能前端与分布式系统架构研发',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400',
    adminAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    adminName: 'Alex Mercer',
    attribute: '核心工程与架构',
    city: '北京市',
    memberComposition: '架构师 (4) + 研发工程师 (22)',
    timeLabel: '周一至周五 09:00 - 18:00',
    members: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    ],
    totalMembersCount: 26,
    role: 'Admin',
    isPinned: true,
    category: 'Your Teams',
  },
  {
    id: 'team-2',
    name: '设计 · 核心评审组',
    subtitle: '打造极致美学与无障碍交互的设计工会',
    thumbnail: 'https://images.unsplash.com/photo-1542744094-24638ea0b343?auto=format&fit=crop&q=80&w=400',
    adminAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    adminName: 'Sarah Chen',
    attribute: 'UI设计与视觉美学',
    city: '深圳市',
    memberComposition: '视觉总监 (2) + UI/UX (16)',
    timeLabel: '周二 / 周四 14:00',
    members: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    ],
    totalMembersCount: 18,
    role: 'Admin',
    isPinned: true,
    category: 'Your Teams',
  },
  {
    id: 'team-3',
    name: '市场 · 增长黑客组',
    subtitle: '数据驱动的漏斗分析与全渠道用户增长',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400',
    adminAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    adminName: 'Lucas Zhao',
    attribute: '商业增长与数据黑客',
    city: '上海市',
    memberComposition: '数据分析师 (8) + 运营专家 (24)',
    timeLabel: '每日例会 10:30',
    members: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    ],
    totalMembersCount: 32,
    role: 'Member',
    isPinned: false,
    category: 'For You',
  },
  {
    id: 'team-4',
    name: 'AI · 大模型前沿探索组',
    subtitle: '前沿大模型微调、多模态与智能代理探索',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    adminAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    adminName: 'Mia Wang',
    attribute: '人工智能与大模型',
    city: '杭州市',
    memberComposition: 'AI科学家 (10) + 研究员 (35)',
    timeLabel: '周三研讨会 16:00',
    members: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    ],
    totalMembersCount: 45,
    role: 'Member',
    isPinned: false,
    category: 'Discover',
  }
];

interface TeamsViewProps {
  onOpenMenu?: () => void;
  showToast: (msg: string) => void;
  selectedTeamId?: string | null;
  onSelectTeamId?: (id: string | null) => void;
  onGoHome?: () => void;
  onOpenStellarWorkspace?: () => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  onOpenMenu,
  showToast,
  selectedTeamId,
  onSelectTeamId,
  onGoHome,
  onOpenStellarWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<'Your Teams' | 'For You' | 'Discover'>('Your Teams');
  const [teams, setTeams] = useState<TeamCardData[]>(INITIAL_TEAMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTeamForHome, setSelectedTeamForHome] = useState<TeamCardData | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Determine active selected team based on either parent prop or local state
  const activeSelectedTeam = (() => {
    if (selectedTeamId) {
      const normalizedId = selectedTeamId
        .replace('cg-team-', 'team-')
        .replace('cg-', 'team-')
        .replace('cg4', 'team-1')
        .replace('group-dev', 'team-1')
        .replace('group-design', 'team-2')
        .replace('group-growth', 'team-3');
      
      const found = teams.find((t) => {
        const normalizedTid = t.id.replace('cg-team-', 'team-').replace('cg-', 'team-');
        return (
          t.id === selectedTeamId ||
          t.id === normalizedId ||
          normalizedId === normalizedTid ||
          t.name.includes(selectedTeamId) ||
          selectedTeamId.includes(t.name) ||
          (selectedTeamId === 'cg4' && t.id === 'team-1') ||
          (selectedTeamId.includes('极客') && t.id === 'team-1') ||
          (selectedTeamId.includes('评审') && t.id === 'team-2') ||
          (selectedTeamId.includes('增长') && t.id === 'team-3')
        );
      });
      // Always guarantee entry to the team operation screen (GroupHomeScreen) if selectedTeamId was provided
      return found || teams[0];
    }
    return selectedTeamForHome;
  })();

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t))
    );
    const target = teams.find((t) => t.id === id);
    showToast(target?.isPinned ? '已取消置顶小组' : '已成功置顶小组 (Top)');
  };

  const filteredTeams = teams.filter((t) => {
    if (activeTab === 'Your Teams' && t.category !== 'Your Teams' && !t.isPinned) return false;
    if (activeTab === 'For You' && t.category !== 'For You') return false;
    if (activeTab === 'Discover' && t.category !== 'Discover') return false;
    if (searchQuery.trim()) {
      return t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             t.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
             t.attribute.toLowerCase().includes(searchQuery.toLowerCase()) ||
             t.city.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <AnimatePresence mode="wait">
      {activeSelectedTeam ? (
        <motion.div
          key="workspace"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="h-full w-full"
        >
          <GroupHomeScreen
            groupId={activeSelectedTeam.id}
            groupName={activeSelectedTeam.name}
            subTitle={activeSelectedTeam.subtitle}
            attribute={activeSelectedTeam.attribute}
            city={activeSelectedTeam.city}
            adminName={activeSelectedTeam.adminName}
            adminAvatar={activeSelectedTeam.adminAvatar}
            coverImage={activeSelectedTeam.thumbnail}
            memberCount={activeSelectedTeam.totalMembersCount}
            onBack={() => {
              if (onSelectTeamId) {
                onSelectTeamId(null);
              }
              setSelectedTeamForHome(null);
            }}
            showToast={showToast}
            onGoHome={onGoHome}
            onOpenStellarWorkspace={onOpenStellarWorkspace}
          />
        </motion.div>
      ) : (
        <motion.div
          key="list"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 15 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{ containerType: 'inline-size', containerName: 'stellar-teams' }}
          className="flex flex-col h-full bg-[#FAFAFA] dark:bg-black text-[#0f172a] dark:text-white font-sans select-none overflow-hidden"
        >
          <style>{`@container stellar-teams (max-width: 340px) { .stellar-teams-grid { grid-template-columns: minmax(0, 1fr); } }`}</style>
          {/* TABS with Enhanced Hierarchy for Active / Selected State */}
          <div className="px-4 py-3 bg-white dark:bg-black border-b border-[#E5E7EB] dark:border-zinc-800 shrink-0">
            <div className="flex items-center space-x-2 bg-[#F3F4F6] dark:bg-zinc-900 p-1.5 rounded-2xl">
              {(['Your Teams', 'For You', 'Discover'] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    aria-pressed={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 min-h-11 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                      isActive
                        ? 'bg-white dark:bg-zinc-800 text-[#1877F2] shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-[#6B7280] dark:text-zinc-400 hover:text-[#111827] dark:hover:text-white'
                    }`}
                  >
                    {tab === 'Your Teams' ? '我的小组' : tab === 'For You' ? '为你推荐' : '发现探索'}
                    {isActive && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#1877F2] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. LIST CARD LAYOUT: 2-Column Grid with height increased by 50% */}
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 no-scrollbar">
            {filteredTeams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Users size={40} className="text-gray-300 mb-2 stroke-[1.5]" />
                <p className="text-sm font-medium text-gray-500">没有找到相关小组</p>
                <p className="text-xs text-gray-400 mt-1">尝试切换标签或搜索其他关键词</p>
              </div>
            ) : (
              <div className="stellar-teams-grid grid grid-cols-2 gap-3.5">
                {filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`进入小组：${team.name}`}
                    onKeyDown={(event) => {
                      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        event.currentTarget.click();
                      }
                    }}
                    onClick={() => {
                      if (onSelectTeamId) {
                        onSelectTeamId(team.id);
                      } else {
                        setSelectedTeamForHome(team);
                      }
                    }}
                    className="bg-white dark:bg-zinc-950 rounded-md border border-[#E4E6EB] dark:border-zinc-800 hover:border-[#1877F2] shadow-2xs hover:shadow-sm transition-all overflow-hidden relative cursor-pointer group select-none flex flex-col justify-between"
                    style={{ minHeight: '280px' }}
                  >
                    {/* 1. UPPER HALF: Big Photo Header */}
                    <div className="relative h-40 w-full overflow-hidden bg-gray-900 shrink-0">
                      {/* Cover Photo */}
                      <img
                        src={team.thumbnail}
                        alt={team.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      {/* Gradient Overlay for high text contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

                      {/* Top-Left: Group Name & Attribute Tag */}
                      <div className="absolute top-2.5 left-2.5 right-14 z-10">
                        <h2 className="text-sm font-bold text-white line-clamp-2 drop-shadow-md tracking-tight text-left">
                          {team.name}
                        </h2>
                        <div className="mt-1 text-left">
                          <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-white/20 backdrop-blur-md text-white rounded border border-white/30 shadow-2xs">
                            {team.attribute}
                          </span>
                        </div>
                      </div>

                      {/* Top-Right: Pin Button (置顶) */}
                      <button
                        onClick={(e) => togglePin(team.id, e)}
                        aria-label={team.isPinned ? '取消置顶小组' : '置顶小组'}
                        aria-pressed={team.isPinned}
                        className={`absolute top-1.5 right-1.5 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer z-20 shadow-md ${
                          team.isPinned
                            ? 'bg-[#1877F2] text-white ring-2 ring-white'
                            : 'bg-black/40 backdrop-blur-md text-white hover:bg-black/60'
                        }`}
                        title={team.isPinned ? '取消置顶' : '置顶小组'}
                      >
                        <Pin size={16} className={team.isPinned ? 'fill-white' : ''} />
                      </button>

                      {/* Photo Bottom Bar: Overlapping Member Avatars & "进入 >" */}
                      <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between">
                        <div className="flex items-center -space-x-1 overflow-hidden">
                          {team.members.slice(0, 3).map((avatar, idx) => (
                            <img
                              key={`top-member-${idx}-${avatar}`}
                              src={avatar}
                              alt="member"
                              className="w-4.5 h-4.5 rounded-full ring-1 ring-white object-cover shadow-xs"
                            />
                          ))}
                          <div className="w-4.5 h-4.5 rounded-full ring-1 ring-white bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold flex items-center justify-center shadow-xs">
                            +{team.totalMembersCount - 3}
                          </div>
                        </div>
                        <div className="flex items-center space-x-0.5 text-[9px] font-bold text-white bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-full hover:bg-[#1877F2] transition-colors">
                          <span>进入</span>
                          <ChevronRight size={10} />
                        </div>
                      </div>
                    </div>

                    {/* 2. LOWER HALF: White Information Section (白色信息栏) */}
                    <div className="p-3 bg-white dark:bg-zinc-950 space-y-2.5 flex-1 flex flex-col justify-between text-[#334155] dark:text-zinc-300">
                      <div className="space-y-2 text-xs text-[#334155] dark:text-zinc-300">
                        {/* Leader (组长) */}
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#1877F2] flex items-center justify-center shrink-0">
                            <UserCheck size={11} />
                          </span>
                          <span className="text-gray-400 dark:text-zinc-500 shrink-0">组长:</span>
                          <div className="flex items-center space-x-1 truncate">
                            <img
                              src={team.adminAvatar}
                              alt={team.adminName}
                              className="w-4 h-4 rounded-full object-cover shrink-0 ring-1 ring-gray-200 dark:ring-zinc-700"
                            />
                            <span className="font-bold text-[#0f172a] dark:text-white truncate">{team.adminName}</span>
                          </div>
                        </div>

                        {/* Member Composition (构成) */}
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Users size={11} />
                          </span>
                          <span className="text-gray-400 dark:text-zinc-500 shrink-0">构成:</span>
                          <span className="truncate font-medium text-[#1e293b] dark:text-zinc-300">{team.memberComposition}</span>
                        </div>

                        {/* City (城市) */}
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <MapPin size={11} />
                          </span>
                          <span className="text-gray-400 dark:text-zinc-500 shrink-0">城市:</span>
                          <span className="font-medium text-[#1e293b] dark:text-zinc-300">{team.city}</span>
                        </div>
                      </div>

                      {/* Bottom Row in White Info Section: Member avatars & "进入 >" */}
                      <div className="pt-2 border-t border-[#F1F5F9] dark:border-zinc-800/80 flex items-center justify-between">
                        <div className="flex items-center -space-x-1 overflow-hidden">
                          {team.members.map((avatar, idx) => (
                            <img
                              key={`bot-member-${idx}-${avatar}`}
                              src={avatar}
                              alt="member"
                              className="w-4 h-4 rounded-full ring-1 ring-white dark:ring-zinc-900 object-cover shadow-2xs"
                            />
                          ))}
                          <div className="w-4 h-4 rounded-full ring-1 ring-white dark:ring-zinc-900 bg-gray-100 dark:bg-zinc-800 text-[#64748B] dark:text-zinc-400 text-[8px] font-bold flex items-center justify-center shadow-2xs">
                            +{team.totalMembersCount - team.members.length}
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-[#1877F2] hover:underline flex items-center">
                          进入 &gt;
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Blank Card with Plus Sign to Add New Group */}
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-white/80 dark:bg-zinc-950/80 rounded-md border-2 border-dashed border-gray-300 dark:border-zinc-800 hover:border-[#1877F2] hover:bg-blue-50/20 shadow-2xs hover:shadow-xs transition-all overflow-hidden relative cursor-pointer group select-none flex flex-col items-center justify-center p-6 text-center"
                  style={{ minHeight: '280px' }}
                  title="添加新小组"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-zinc-900 group-hover:bg-[#1877F2] text-[#1877F2] group-hover:text-white flex items-center justify-center shadow-sm transition-all group-hover:scale-110 mb-3">
                    <Plus size={26} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 group-hover:text-[#1877F2] transition-colors">
                    添加小组
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 max-w-[120px]">
                    从头像选择、输入名称到邀请组员，一站式创建
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Create Team Group Modal */}
          <CreateTeamGroupModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreateTeam={(newTeam: NewGroupData) => {
              setTeams((prev) => [newTeam, ...prev]);
              if (onSelectTeamId) {
                onSelectTeamId(newTeam.id);
              } else {
                setSelectedTeamForHome(newTeam);
              }
            }}
            showToast={showToast}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
