import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Users,
  UserPlus,
  Send,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Folder,
  FolderPlus,
  File,
  FileText,
  Trash2,
  History,
  MessageSquare,
  Plus,
  Highlighter,
  Type,
  ArrowRight,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  Edit3,
  AlertTriangle,
  Lock,
  UserCheck,
  CheckSquare,
  TrendingUp,
  Clock,
  Sparkles,
  ThumbsUp,
  Smile,
  Activity,
  GitBranch,
  Home,
  Image,
  Camera,
  Bell,
  Check,
  CheckCheck,
  Calendar,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  MousePointer,
  StickyNote,
  Layers,
  Move,
  RotateCcw,
  Compass,
  Palette,
  Quote,
  CornerDownLeft
} from 'lucide-react';
import { StellarDocumentWorkspace } from './team_docs/StellarDocumentWorkspace';
import { GroupWorkbenchOverview } from './group_workbench/GroupWorkbenchOverview';
import { ManageGroupModal } from './group_workbench/ManageGroupModal';
import { CreateSquadModal } from './group_workbench/CreateSquadModal';
import { CreateTaskModal } from './group_workbench/CreateTaskModal';
import { TaskDetailModal } from './group_workbench/TaskDetailModal';
import { MemberJoinConsentModal } from './group_workbench/MemberJoinConsentModal';
import { SquadChannelDrawer } from './group_workbench/SquadChannelDrawer';
import { SquadMissionControlPanel } from './group_workbench/SquadMissionControlPanel';
import {
  GroupMember,
  SquadItem,
  GroupTaskItem,
  GroupWorkSchedule,
  SquadChatMessage,
  GroupAnnouncement,
  AuditLogItem,
  RegionAnimalConfig,
  TaskStatus,
  LocationConsentStatus,
  GroupRole,
  SquadMissionTacticalState,
} from './group_workbench/types';
import {
  INITIAL_SCHEDULE,
  INITIAL_MEMBERS,
  INITIAL_SQUADS,
  INITIAL_TASKS,
  INITIAL_SQUAD_MESSAGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_ANNOUNCEMENTS,
  REGION_ANIMALS,
  INITIAL_TACTICAL_MISSION_STATE,
} from './group_workbench/defaultData';

export enum GroupTab {
  DASHBOARD = '工作台',
  CHAT = '协作消息',
  FILES = '文件库',
  DOCS = '协作文档',
  MIND_MAP = '思维导图',
  MEMBERS = '成员',
  TASKS = '任务监控'
}

export interface ThreadReply {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  time: string;
  content: string;
  isSelf: boolean;
}

export interface ConfirmedMember {
  id: string;
  name: string;
  avatar: string;
  time: string;
  timestamp: number;
}

export interface SeenMember {
  id?: string;
  name: string;
  avatar: string;
  time: string;
  timestamp?: number;
}

export interface ChatMessage {
  id: string;
  senderId?: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  time: string;
  content: string;
  isSelf: boolean;
  attachedFile?: {
    name: string;
    size: string;
    type: string;
  };
  // Thread aggregation support
  isMeta?: boolean;
  threadMention?: string; // e.g., "@林晚晴"
  threadReplies?: ThreadReply[];
  isThreadCollapsed?: boolean;
  aiSummary?: string;

  // Quote support
  quotedMessageId?: string; // ID of message being quoted

  // Read receipts support
  seenBy?: SeenMember[];
  requestReadReport?: boolean;

  // Reactions support
  reactions?: { emoji: string; count: number; users: string[] }[];
  attitudes?: string[]; // e.g., 'to-do', 'resolved', 'important'
  
  // Custom interactive attachments
  attachedImage?: string;
  attachedNote?: { title: string; content: string };

  // NEW: 3 message types business logic
  messageType?: 'normal' | 'notice' | 'acknowledge' | 'task';
  targetMemberIds?: string[]; // for task
  isTargetAll?: boolean; // for task
  confirmedBy?: ConfirmedMember[];
}

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId?: string;
  category?: 'core' | 'map' | 'chat' | 'canvas' | 'security' | 'note';
  tag?: string;
  color?: string;
  isSticky?: boolean;
  stickyColor?: 'yellow' | 'blue' | 'green' | 'purple';
  author?: string;
  status?: 'done' | 'wip' | 'planned';
  comments?: Array<{ id: string; author: string; avatar: string; text: string; time: string; resolved?: boolean }>;
  votes?: number;
  hasVotePoll?: boolean;
  pollOptions?: Array<{ option: string; votes: number; users: string[] }>;
}

export interface LiveCursor {
  id: string;
  name: string;
  avatar: string;
  color: string;
  x: number;
  y: number;
}

export interface TeamFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploader: string;
  uploaderAvatar: string;
  date: string;
  version: string;
  folder: string; // 'root' or specific folder ID
  lockedBy?: string;
  annotationsCount: number;
}

export interface FileComment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  time: string;
}

export interface FileVersion {
  id: string;
  version: string;
  updater: string;
  time: string;
  description: string;
  isCurrent: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  department: string;
  status: 'online' | 'offline';
  locationUpdate?: string; // e.g. "北京 · 3分钟前"
  inGroup?: boolean; // 在组状态
  distance?: string; // 距组距离, e.g. "在组 · 0m", "1,180 km", "1,065 km"
  absenceType?: '请假' | '出差' | '外勤' | '缺席' | '调休'; // 请假或缺席类型
  absenceReason?: string; // 详细原因说明
  leavePeriod?: string; // 时间范围
}

export interface TeamTask {
  id: string;
  title: string;
  assigneeId: string;
  priority: 'High' | 'Medium' | 'Low';
  progress: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
}

export interface AvatarUser {
  id?: string;
  name: string;
  avatar: string;
  time?: string;
  timestamp?: number;
}

export const AvatarStack: React.FC<{
  users?: AvatarUser[];
  members?: AvatarUser[];
  title?: string;
  maxCount?: number;
  maxVisible?: number;
  emptyPlaceholder?: string;
}> = ({ users, members, title = '成员名单', maxCount, maxVisible = 4, emptyPlaceholder = '暂无记录' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const list = users || members || [];

  if (!list || list.length === 0) {
    return (
      <span className="text-[8.5px] text-[#8A8D91] font-medium italic">
        {emptyPlaceholder}
      </span>
    );
  }

  // Sorting: 按时间先后排序
  const sortedUsers = [...list].sort((a, b) => {
    if (a.timestamp && b.timestamp) return a.timestamp - b.timestamp;
    return 0;
  });

  const limit = maxCount || maxVisible;
  const total = sortedUsers.length;
  const isOverflow = total > limit;
  const displayAvatars = isOverflow ? sortedUsers.slice(0, limit - 1) : sortedUsers.slice(0, limit);
  const overflowCount = isOverflow ? total - (limit - 1) : 0;

  return (
    <div 
      className="relative inline-flex items-center select-none"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div 
        className="flex items-center -space-x-1 cursor-pointer py-0.5"
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
      >
        {displayAvatars.map((user, idx) => (
          <img
            key={`avatar-${idx}-${user.name}`}
            src={user.avatar}
            alt={user.name}
            title={`${user.name} (${user.time || '已记录'})`}
            className="w-3.5 h-3.5 rounded-full border border-white object-cover ring-1 ring-[#E4E6EB] hover:scale-120 hover:z-20 transition-transform bg-white shrink-0 shadow-2xs"
          />
        ))}

        {isOverflow && (
          <div 
            className="w-3.5 h-3.5 rounded-full border border-white bg-[#E7F3FF] ring-1 ring-[#1877F2]/30 flex items-center justify-center text-[6.5px] font-black text-[#1877F2] hover:scale-120 hover:z-20 transition-transform shrink-0 shadow-2xs"
            title={`还有 +${overflowCount} 位成员`}
          >
            +{overflowCount}
          </div>
        )}
      </div>

      {/* Hover/Click Tooltip with full list */}
      {showTooltip && (
        <div 
          className="absolute bottom-full right-0 mb-1.5 z-50 p-2 bg-[#050505]/95 text-white rounded-[4px] shadow-lg text-left min-w-[140px] max-w-[220px] border border-white/10 backdrop-blur-xs pointer-events-auto animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/20 pb-1 mb-1.5 text-[9px] text-zinc-300 font-black">
            <span>{title} ({total}人)</span>
            <span className="text-[7px] text-zinc-400">时间先后</span>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5 no-scrollbar">
            {sortedUsers.map((u, i) => (
              <div key={`tooltip-user-${u.id || u.name}-${i}`} className="flex items-center justify-between text-[8px] space-x-2 py-0.5">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <img src={u.avatar} className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-white/30" alt={u.name} />
                  <span className="font-bold text-white truncate">{u.name}</span>
                </div>
                <span className="text-[7px] text-zinc-400 shrink-0 font-medium">{u.time || '刚刚'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const TaskMemberPickerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
  onConfirm: (isAll: boolean, selectedMemberIds: string[]) => void;
}> = ({ isOpen, onClose, members, onConfirm }) => {
  const [isAll, setIsAll] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>(['m_admin', 'm_owner']);

  if (!isOpen) return null;

  const toggleMember = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleApply = () => {
    if (!isAll && selectedIds.length === 0) {
      alert('请至少选择一位组员，或切换为“全员发送”');
      return;
    }
    onConfirm(isAll, selectedIds);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white border border-[#E4E6EB] rounded-[4px] shadow-lg max-w-sm w-full p-4 text-left space-y-3.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#F5F6F7] pb-2.5">
          <div className="flex items-center space-x-1.5">
            <span className="p-1 rounded-[2px] bg-[#1877F2]/10 text-[#1877F2]">
              <CheckSquare size={14} />
            </span>
            <h3 className="text-xs font-black text-[#050505]">指派任务待办 (定向发送设置)</h3>
          </div>
          <button onClick={onClose} className="text-[#8A8D91] hover:text-[#050505] cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <p className="text-[10px] text-[#65676B] leading-relaxed">
          设置此任务待办卡片的接收范围。仅被选中的组员及发送者可以在协作消息流中可见该任务卡片并进行签收。
        </p>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-[#F5F6F7] p-1 rounded-[4px]">
          <button
            onClick={() => setIsAll(true)}
            className={`py-1.5 text-[10px] font-black rounded-[3px] transition-all cursor-pointer ${
              isAll
                ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                : 'text-[#65676B] hover:text-[#050505]'
            }`}
          >
            📢 全员发送 ({members.length}人可见)
          </button>
          <button
            onClick={() => setIsAll(false)}
            className={`py-1.5 text-[10px] font-black rounded-[3px] transition-all cursor-pointer ${
              !isAll
                ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                : 'text-[#65676B] hover:text-[#050505]'
            }`}
          >
            🎯 指定组员 ({selectedIds.length}人已选)
          </button>
        </div>

        {/* Member Checkbox List */}
        {!isAll && (
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1 border border-[#E4E6EB] rounded-[3px] p-1.5 bg-[#FAFAFA]">
            {members.map((member) => {
              const isSelected = selectedIds.includes(member.id);
              return (
                <div
                  key={`chk-mem-${member.id}`}
                  onClick={() => toggleMember(member.id)}
                  className={`flex items-center justify-between p-2 rounded-[3px] border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1877F2]/5 border-[#1877F2]/40 text-[#050505]'
                      : 'bg-white border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2]/40'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full object-cover border border-[#E4E6EB]" />
                    <div className="truncate text-left">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-black text-[#050505] truncate">{member.name}</span>
                        <span className="text-[8px] px-1 py-0.2 rounded-[2px] bg-[#1877F2]/10 text-[#1877F2] font-extrabold">{member.role}</span>
                      </div>
                      <p className="text-[8px] text-[#8A8D91] truncate">{member.department}</p>
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded-[2px] border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#1877F2] border-[#1877F2] text-white' : 'border-[#CCD0D5] bg-white'
                  }`}>
                    {isSelected && <Check size={10} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#F5F6F7]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-[#E4E6EB] hover:bg-[#FAFAFA] text-xs font-bold rounded-[4px] cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleApply}
            className="px-3.5 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-black rounded-[4px] cursor-pointer"
          >
            确认并进入会话编辑框
          </button>
        </div>
      </div>
    </div>
  );
};

export interface GroupHomeScreenProps {
  groupId: string;
  groupName: string;
  subTitle: string;
  attribute: string;
  city: string;
  adminName: string;
  adminAvatar: string;
  coverImage: string;
  memberCount: number;
  isPublic?: boolean;
  onBack: () => void;
  showToast: (msg: string) => void;
  onGoHome?: () => void;
  onOpenStellarWorkspace?: () => void;
}

export const GroupHomeScreen: React.FC<GroupHomeScreenProps> = ({
  groupId,
  groupName,
  subTitle,
  attribute,
  city,
  adminName,
  adminAvatar,
  coverImage,
  memberCount,
  isPublic = true,
  onBack,
  showToast,
  onGoHome,
  onOpenStellarWorkspace
}) => {
  const [selectedTab, setSelectedTab] = useState<GroupTab>(GroupTab.CHAT);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sub-navigation tab states inside Dashboard and Chat pages
  const [dashboardSubTab, setDashboardSubTab] = useState<'overview' | 'tasks' | 'members'>('overview');
  const [chatSubTab, setChatSubTab] = useState<'chat' | 'mindmap' | 'docs' | 'files'>('chat');
  
  // Current user identity constants
  const currentUserId = 'm_member1';
  const currentUserName = 'Hui Zhang';
  const currentUserAvatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150';
  const currentUserRole = 'Member';

  // ==================== WORKBENCH UPGRADE STATES ====================
  const [groupNameState, setGroupNameState] = useState(groupName || 'Stellar 城市探索先锋组');
  const [groupDescriptionState, setGroupDescriptionState] = useState(
    subTitle || 'Stellar 分布式协作与时空探索先锋工作组。专注于前沿定位、高精地图测绘与智能代理交互。'
  );
  const [selectedRegionAnimal, setSelectedRegionAnimal] = useState<RegionAnimalConfig>(REGION_ANIMALS[0]);
  const [scheduleState, setScheduleState] = useState<GroupWorkSchedule>(INITIAL_SCHEDULE);
  const [workbenchMembers, setWorkbenchMembers] = useState<GroupMember[]>(INITIAL_MEMBERS);
  const [workbenchSquads, setWorkbenchSquads] = useState<SquadItem[]>(INITIAL_SQUADS);
  const [workbenchTasks, setWorkbenchTasks] = useState<GroupTaskItem[]>(INITIAL_TASKS);
  const [workbenchMessages, setWorkbenchMessages] = useState<SquadChatMessage[]>(INITIAL_SQUAD_MESSAGES);
  const [workbenchAnnouncements, setWorkbenchAnnouncements] = useState<GroupAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [workbenchAuditLogs, setWorkbenchAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Modal States for Workbench
  const [isManageGroupOpen, setIsManageGroupOpen] = useState(false);
  const [isCreateSquadOpen, setIsCreateSquadOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isMemberConsentOpen, setIsMemberConsentOpen] = useState(false);
  const [selectedSquadForChannel, setSelectedSquadForChannel] = useState<SquadItem | null>(null);
  const [selectedSquadForMissionControl, setSelectedSquadForMissionControl] = useState<SquadItem | null>(null);
  const [tacticalMissionStates, setTacticalMissionStates] = useState<Record<string, SquadMissionTacticalState>>(INITIAL_TACTICAL_MISSION_STATE);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<GroupTaskItem | null>(null);

  // Workbench Action Handlers
  const handleToggleTaskStep = (taskId: string, stepId: string) => {
    setWorkbenchTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSteps = t.steps.map(s => s.id === stepId ? { ...s, done: !s.done } : s);
        return { ...t, steps: updatedSteps };
      }
      return t;
    }));
    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map(s => s.id === stepId ? { ...s, done: !s.done } : s)
        };
      });
    }
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    setWorkbenchTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    const targetTask = workbenchTasks.find(t => t.id === taskId);
    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail(prev => prev ? { ...prev, status } : null);
    }
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      operatorName: currentUserName,
      operatorAvatar: currentUserAvatar,
      actionType: 'task_updated',
      title: `更新任务「${targetTask?.title || taskId}」状态`,
      details: `将任务进度流转为【${status}】`,
      impactScope: '影响负责人的执行状态与小队甘特图看板'
    };
    setWorkbenchAuditLogs(prev => [newLog, ...prev]);
    showToast(`任务状态已更新`);
  };

  const handleAddAnnouncement = (title: string, content: string, isPinned: boolean) => {
    const newAnn: GroupAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      publishTime: '刚刚',
      publisherName: currentUserName,
      publisherAvatar: currentUserAvatar,
      isPinned,
      isEmergency: false,
      readCount: 1
    };
    setWorkbenchAnnouncements(prev => [newAnn, ...prev]);
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      operatorName: currentUserName,
      operatorAvatar: currentUserAvatar,
      actionType: 'broadcast_sent',
      title: `发布新公告「${title}」`,
      details: content,
      impactScope: '全员工作台可见'
    };
    setWorkbenchAuditLogs(prev => [newLog, ...prev]);
    showToast('公告发布成功');
  };

  const handleEndSquadWindow = (squadId: string) => {
    setWorkbenchSquads(prev => prev.map(s => s.id === squadId ? { ...s, status: 'completed', endedAt: '刚刚' } : s));
    const sq = workbenchSquads.find(s => s.id === squadId);
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      operatorName: currentUserName,
      operatorAvatar: currentUserAvatar,
      actionType: 'task_updated',
      title: `结束小队「${sq?.name || squadId}」临时定位窗口`,
      details: '任务结束，所有小队成员定位通道已自动切断并归档。',
      impactScope: '该小队成员恢复默认隐私保护模式'
    };
    setWorkbenchAuditLogs(prev => [newLog, ...prev]);
    showToast(`小队「${sq?.name}」活动已结束，临时定位已关闭`);
  };

  const handleSelectConsent = (consentType: 'agreed_work_hours' | 'unauthorized' | 'undecided') => {
    const mappedStatus: LocationConsentStatus = consentType === 'agreed_work_hours' ? 'agreed_work_hours' : 'unauthorized';
    setWorkbenchMembers(prev => prev.map(m => m.id === 'mem-1' ? { ...m, locationConsent: mappedStatus } : m));
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      operatorName: 'Alex Mercer',
      operatorAvatar: currentUserAvatar,
      actionType: 'consent_changed',
      title: '更新成员定位授权设置',
      details: `定位授权设置为【${consentType === 'agreed_work_hours' ? '工作时段内授权' : '未授权/隐私保护'}】`,
      impactScope: '更新组内定位可见性'
    };
    setWorkbenchAuditLogs(prev => [newLog, ...prev]);
    setIsMemberConsentOpen(false);
    showToast('隐私授权设置已保存');
  };

  // 1. CHAT TAB STATES
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm_notice',
      senderId: 'm_admin',
      senderName: 'Sarah Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      senderRole: 'Admin',
      time: '10:05',
      content: '【通知】本周五下午 16:00 将在第一协同会议室进行 《Stellar UI 视觉重构规范 V4.0》 全员验收评审，请全体小组成员准时接入。',
      isSelf: false,
      messageType: 'notice',
      seenBy: [
        { id: 'm_owner', name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', time: '10:06', timestamp: 100 },
        { id: 'm_member1', name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '10:08', timestamp: 200 },
        { id: 'm_member2', name: 'Mia Wang', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', time: '10:10', timestamp: 300 },
        { id: 'm_viewer', name: 'Lucas Zhao', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', time: '10:12', timestamp: 400 }
      ],
      reactions: []
    },
    {
      id: 'm_ack',
      senderId: 'm_owner',
      senderName: 'Alex Mercer',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      senderRole: 'Owner',
      time: '10:12',
      content: '【知会确认】请核心工程与架构组全体成员知悉：主干分支已锁定并开启静态类型检查与 Straight-Edge 样式引擎回归测试，收到请点击右下角确认签收。',
      isSelf: false,
      messageType: 'acknowledge',
      seenBy: [
        { id: 'm_admin', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '10:13', timestamp: 120 },
        { id: 'm_member1', name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '10:14', timestamp: 140 }
      ],
      confirmedBy: [
        { id: 'm_admin', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '10:14', timestamp: 150 },
        { id: 'm_viewer', name: 'Lucas Zhao', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', time: '10:16', timestamp: 170 }
      ],
      reactions: [{ emoji: '👏', count: 1, users: ['Sarah Chen'] }]
    },
    {
      id: 'm_task',
      senderId: 'm_owner',
      senderName: 'Alex Mercer',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      senderRole: 'Owner',
      time: '10:18',
      content: '【任务待办】请评估前端重构这套 Straight-Edge 规范所需的确切工时，并输出地图悬浮面板与控制台的组件适配计划。',
      isSelf: false,
      messageType: 'task',
      isTargetAll: false,
      targetMemberIds: ['m_member1', 'm_admin'],
      seenBy: [
        { id: 'm_admin', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '10:19', timestamp: 180 },
        { id: 'm_member1', name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '10:20', timestamp: 190 }
      ],
      confirmedBy: [],
      reactions: []
    },
    {
      id: 'm1',
      senderName: 'Sarah Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      senderRole: 'Admin',
      time: '10:15',
      content: '大家早上好！我刚把最新的 《Stellar UI 视觉重构规范 V4.0》 稿件上传到了文件库。这次我们完全采用了直角细线框（Facebook Straight-Edge）风格，所有的卡片圆角都限制在 4px 以内，配合高对比度白色底，整体的布局密度和专业感提升了非常多。',
      isSelf: false,
      seenBy: [
        { name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', time: '10:16' },
        { name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '10:24' },
        { name: 'Lucas Zhao', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', time: '10:20' }
      ],
      reactions: [
        { emoji: '💯', count: 2, users: ['Alex Mercer', 'Hui Zhang'] }
      ]
    },
    {
      id: 'm2',
      senderName: 'Alex Mercer',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      senderRole: 'Owner',
      time: '10:18',
      content: '收到！看起来非常硬朗且专业。这和我们星历宇宙的底层高精度坐标风格非常契合。@Hui Zhang 请评估一下前端重构这一套 UI 所需的开发周期，我们需要尽快在下一个 Sprint 交付。',
      isSelf: false,
      isMeta: true,
      threadMention: '@Hui Zhang',
      isThreadCollapsed: false,
      threadReplies: [
        {
          id: 'tr1',
          senderName: 'Hui Zhang',
          senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
          senderRole: 'Member',
          time: '10:21',
          content: '好的老大，评估中！直角和 1px 细线很容易，我们的样式引擎已经完全支持这种配置。',
          isSelf: true
        },
        {
          id: 'tr2',
          senderName: 'Sarah Chen',
          senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
          senderRole: 'Admin',
          time: '10:22',
          content: '对，特别注意不要有任何大圆角和药丸形状按钮。',
          isSelf: false
        }
      ],
      seenBy: [
        { name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '10:20' },
        { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '10:19' }
      ]
    },
    {
      id: 'm3',
      senderName: 'Hui Zhang',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      senderRole: 'Member',
      time: '10:24',
      content: '没问题，我已经拉取了最新的 Figma 设计文件。因为这套直角规范在组件层面上非常模块化、统一，我们可以在 3 个工作日内完成整个控制面板和地图悬浮组件的适配。我已经把测试基准报告放到文件库了。',
      isSelf: true,
      quotedMessageId: 'm1',
      attachedFile: {
        name: 'Stellar_Distributed_Routing_v2.pdf',
        size: '4.8 MB',
        type: 'pdf'
      },
      seenBy: [
        { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '10:26' },
        { name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', time: '10:28' }
      ]
    },
    {
      id: 'm4',
      senderName: 'Sarah Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      senderRole: 'Admin',
      time: '10:30',
      content: '太棒了！有任何样式还原度上的疑问，随时在文件库的规范文件里进行标注或者发起批注评论，我会实时收到推送并协助解决。',
      isSelf: false,
      quotedMessageId: 'm3',
      seenBy: [
        { name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', time: '10:31' },
        { name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '10:32' }
      ]
    }
  ]);
  const [newMessageText, setNewMessageText] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const groupChatTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // NEW: 3 Message Types Drafting & Targeted Delivery States
  const [draftMessageType, setDraftMessageType] = useState<'normal' | 'notice' | 'acknowledge' | 'task'>('normal');
  const [showTaskMemberPicker, setShowTaskMemberPicker] = useState<boolean>(false);
  const [taskTargetConfig, setTaskTargetConfig] = useState<{ isAll: boolean; selectedMemberIds: string[] }>({
    isAll: true,
    selectedMemberIds: ['m_admin', 'm_owner']
  });
  
  // Custom screenshot-15 states
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showNoteCreator, setShowNoteCreator] = useState(false);
  const [showCameraSimulator, setShowCameraSimulator] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // 2. FILES TAB STATES
  const [currentFolder, setCurrentFolder] = useState<string>('root'); // 'root', 'design', 'code'
  const [selectedFileForDetails, setSelectedFileForDetails] = useState<TeamFile | null>(null);
  const [fileDetailTab, setFileDetailTab] = useState<'comments' | 'history' | 'annotate'>('comments');
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<'highlight' | 'underline' | 'note' | null>(null);
  const [fileComments, setFileComments] = useState<Record<string, FileComment[]>>({
    'f1': [
      { id: 'c1', userName: 'Alex Mercer', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', text: '这个版本的直角设计比之前的要清晰很多，对比度也完全符合 AA 级别标准，点赞。', time: '1小时前' },
      { id: 'c2', userName: 'Sarah Chen', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', text: '是的，蓝红绿黄四色的比重经过了数学级光学微调，更适合长时间屏幕操作。', time: '45分钟前' }
    ]
  });
  const [newCommentText, setNewCommentText] = useState('');

  const [teamFiles, setTeamFiles] = useState<TeamFile[]>([
    {
      id: 'f1',
      name: 'Stellar_UI_Tokens_and_Design_System_v4.pdf',
      size: '12.5 MB',
      type: 'pdf',
      uploader: 'Sarah Chen',
      uploaderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      date: '2026-08-21',
      version: 'v4.0',
      folder: 'design',
      annotationsCount: 4
    },
    {
      id: 'f2',
      name: 'Stellar_Distributed_Routing_v2.pdf',
      size: '4.8 MB',
      type: 'pdf',
      uploader: 'Hui Zhang',
      uploaderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      date: '2026-08-21',
      version: 'v2.1',
      folder: 'root',
      annotationsCount: 1
    },
    {
      id: 'f3',
      name: 'Yanqi_Lake_Cycling_Route_45km.gpx',
      size: '1.2 MB',
      type: 'gpx',
      uploader: 'Alex Mercer',
      uploaderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      date: '2026-08-20',
      version: 'v1.0',
      folder: 'root',
      annotationsCount: 0
    },
    {
      id: 'f4',
      name: 'Team_Quarterly_Roadmap_2026.docx',
      size: '2.1 MB',
      type: 'docx',
      uploader: 'Alex Mercer',
      uploaderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      date: '2026-08-19',
      version: 'v1.2',
      folder: 'root',
      annotationsCount: 0
    }
  ]);

  const fileVersions: Record<string, FileVersion[]> = {
    'f1': [
      { id: 'v1_4', version: 'v4.0', updater: 'Sarah Chen', time: '2026-08-21 10:12', description: '全面适配 Facebook 直角细线框风格与色彩比例校准', isCurrent: true },
      { id: 'v1_3', version: 'v3.2', updater: 'Sarah Chen', time: '2026-08-15 16:30', description: '调整了深色模式下的对比度和阴影表现', isCurrent: false },
      { id: 'v1_2', version: 'v3.0', updater: 'Sarah Chen', time: '2026-08-10 14:00', description: '基础色彩令牌与数学阶梯排版规范初稿', isCurrent: false }
    ],
    'f2': [
      { id: 'v2_2', version: 'v2.1', updater: 'Hui Zhang', time: '2026-08-21 10:22', description: '优化了极端网络丢包环境下的重连重传队列深度', isCurrent: true },
      { id: 'v2_1', version: 'v2.0', updater: 'Hui Zhang', time: '2026-08-18 11:45', description: '初始高并行分布式路由协议版本', isCurrent: false }
    ]
  };

  const [annotations, setAnnotations] = useState<Array<{ id: string; type: 'highlight' | 'underline' | 'note'; text: string; author: string; positionY: number; content?: string }>>([
    { id: 'a1', type: 'highlight', text: '所有的卡片圆角都限制在 4px 以内，配合高对比度白色底', author: 'Sarah Chen', positionY: 80 },
    { id: 'a2', type: 'note', text: '主色调 蓝 #5DADE2 / 红 #E74C3C / 绿 #2ECC71 / 黄 #F5A623', author: 'Alex Mercer', positionY: 160, content: '需要重点确认前端对于这些冷暖色调的无障碍视觉还原情况。' },
    { id: 'a3', type: 'underline', text: '无药丸、无大圆角、1.5px 细线、round cap/join', author: 'Hui Zhang', positionY: 240 }
  ]);

  // 3. MEMBERS TAB STATES
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 'm_owner', name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', role: 'Owner', department: '核心工程与架构组', status: 'online', locationUpdate: '北京总部 · 2分钟前', inGroup: true, distance: '在组 · 总部工区 (0m)' },
    { id: 'm_admin', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', role: 'Admin', department: '视觉美学与 UI 体验公会', status: 'online', locationUpdate: '北京总部 · 5分钟前', inGroup: true, distance: '在组 · 0.1km' },
    { id: 'm_member1', name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', role: 'Member', department: '核心工程与架构组', status: 'online', locationUpdate: '北京总部 · 12分钟前', inGroup: true, distance: '在组 · 0.3km' },
    { id: 'm_member2', name: 'Mia Wang', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', role: 'Member', department: 'AI 实验室及智能代理解析', status: 'offline', locationUpdate: '杭州西湖区 · 1小时前', inGroup: false, distance: '1,180 km', absenceType: '请假', absenceReason: '年假休假中 (批准通过)', leavePeriod: '8/26 - 8/29' },
    { id: 'm_viewer', name: 'Lucas Zhao', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', role: 'Viewer', department: '商业增长与流量运营', status: 'online', locationUpdate: '上海张江高科 · 刚刚', inGroup: false, distance: '1,065 km', absenceType: '出差', absenceReason: '外勤出差 (客户路演)', leavePeriod: '今日全天' }
  ]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member' | 'Viewer'>('Member');

  // 4. TASKS MONITORING TAB STATES
  const [tasks, setTasks] = useState<TeamTask[]>([
    {
      id: 't1',
      title: '重构大地图悬浮控制面板 ( Straight-Edge 规范 )',
      assigneeId: 'm_member1', // Hui Zhang
      priority: 'High',
      progress: 65,
      status: 'In Progress',
      dueDate: '2026-08-24'
    },
    {
      id: 't2',
      title: '验证分布式路由丢包重连协议 v2.1',
      assigneeId: 'm_owner', // Alex Mercer
      priority: 'High',
      progress: 90,
      status: 'In Progress',
      dueDate: '2026-08-22'
    },
    {
      id: 't3',
      title: '输出 Stellar UI Tokens 全套色板数学模型',
      assigneeId: 'm_admin', // Sarah Chen
      priority: 'Medium',
      progress: 100,
      status: 'Completed',
      dueDate: '2026-08-20'
    },
    {
      id: 't4',
      title: '多智能代理解析算法模型轻量化蒸馏训练',
      assigneeId: 'm_member2', // Mia Wang
      priority: 'Low',
      progress: 15,
      status: 'Pending',
      dueDate: '2026-08-28'
    }
  ]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('m_member1');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-08-25');
  const [newTaskProgress, setNewTaskProgress] = useState(20);

  // 5. MIND MAP CO-CREATION & INFINITE CANVAS STATES
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('root');
  const [canvasZoom, setCanvasZoom] = useState<number>(0.92);
  const [canvasPan, setCanvasPan] = useState<{ x: number; y: number }>({ x: 20, y: 10 });
  const [canvasMode, setCanvasMode] = useState<'select' | 'pan'>('select');
  const [canvasGridStyle, setCanvasGridStyle] = useState<'dots' | 'grid' | 'clean'>('dots');
  const [activeMindMapView, setActiveMindMapView] = useState<'canvas' | 'outline'>('canvas');
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [canvasDragStart, setCanvasDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodeDragStart, setNodeDragStart] = useState<{ mouseX: number; mouseY: number; initialNodeX: number; initialNodeY: number } | null>(null);
  const [showAddStickyModal, setShowAddStickyModal] = useState(false);
  const [newStickyText, setNewStickyText] = useState('💡 规范：保持 1px 直角线框，统一品牌蓝');
  const [newStickyColor, setNewStickyColor] = useState<'yellow' | 'blue' | 'green' | 'purple'>('yellow');
  const [isNodeInspectorOpen, setIsNodeInspectorOpen] = useState(true);

  const [mindMapNodes, setMindMapNodes] = useState<MindMapNode[]>([
    {
      id: 'root',
      text: 'Stellar V4.0 协同中枢与设计规范',
      x: 360,
      y: 200,
      category: 'core',
      tag: '核心架构',
      status: 'wip',
      comments: [
        { id: 'c1', author: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', text: '本周期的核心交付件，Facebook 直角细线框样式需完全跑通。', time: '10:05' }
      ]
    },
    // Left Upper: 大地图与时空姿态
    { id: 'b1', text: '🗺️ 大地图与姿态解算层', parentId: 'root', x: 100, y: 90, category: 'map', tag: '时空定位', status: 'done', comments: [], votes: 4 },
    { id: 'b1_1', text: '📍 动态高精差分偏移校准', parentId: 'b1', x: -140, y: 20, category: 'map', status: 'wip', comments: [], votes: 2 },
    { id: 'b1_2', text: '📊 高能流重载压力热力渲染', parentId: 'b1', x: -140, y: 110, category: 'map', status: 'done', comments: [], votes: 3 },
    { id: 'b1_3', text: '📡 毫秒级星轨广播协议 v2.1', parentId: 'b1', x: -140, y: 190, category: 'map', status: 'planned', comments: [] },

    // Left Lower: 协作消息流
    { id: 'b2', text: '💬 直角线框协作消息流', parentId: 'root', x: 100, y: 310, category: 'chat', tag: '消息通讯', status: 'done', comments: [], votes: 5 },
    { id: 'b2_1', text: '📥 @聚合内联线程折叠与AI简报', parentId: 'b2', x: -140, y: 280, category: 'chat', status: 'done', comments: [] },
    { id: 'b2_2', text: '⚡ 态势感知与全员确认闭环', parentId: 'b2', x: -140, y: 360, category: 'chat', status: 'wip', comments: [] },
    { id: 'b2_3', text: '📁 富格式协作附件与漫游日志', parentId: 'b2', x: -140, y: 440, category: 'chat', status: 'planned', comments: [] },

    // Right Upper: 无限矢量画布
    { id: 'b3', text: '🎨 无限矢量画布协同空间', parentId: 'root', x: 620, y: 90, category: 'canvas', tag: '矢量画布', status: 'wip', comments: [], votes: 6 },
    { id: 'b3_1', text: '🖱️ 多人低延迟实时光标追溯', parentId: 'b3', x: 860, y: 20, category: 'canvas', status: 'done', comments: [], votes: 2 },
    { id: 'b3_2', text: '📋 协作指派、评审与合并流', parentId: 'b3', x: 860, y: 110, category: 'canvas', status: 'wip', comments: [] },
    { id: 'b3_3', text: '🗳️ 节点匿名共识表决与批注流', parentId: 'b3', x: 860, y: 190, category: 'canvas', status: 'wip', comments: [] },

    // Right Lower: 安全与审计
    { id: 'b4', text: '🛡️ 分布式安全与审计架构', parentId: 'root', x: 620, y: 310, category: 'security', tag: '安全审计', status: 'wip', comments: [], votes: 3 },
    { id: 'b4_1', text: '🔐 端到端轻量级国密通道 (P2P)', parentId: 'b4', x: 860, y: 280, category: 'security', status: 'done', comments: [] },
    { id: 'b4_2', text: '📜 变更操作不可篡改审计溯源', parentId: 'b4', x: 860, y: 360, category: 'security', status: 'wip', comments: [] },
    { id: 'b4_3', text: '👥 动态RBAC细粒度权限矩阵', parentId: 'b4', x: 860, y: 440, category: 'security', status: 'planned', comments: [] },

    // Sticky Notes (便签贴纸)
    {
      id: 'sticky_1',
      text: '💡 设计准则：遵循 Facebook 1px 细线框体系，统一 #1877F2 品牌蓝与 0 阴影冗余。',
      x: 350,
      y: 40,
      isSticky: true,
      stickyColor: 'yellow',
      author: 'Alex Mercer'
    },
    {
      id: 'sticky_2',
      text: '🚀 Sprint 4 目标：完成全链路消息气泡与思维导图双向联动闭环，保障低延迟。',
      x: 350,
      y: 380,
      isSticky: true,
      stickyColor: 'blue',
      author: 'Sarah Chen'
    }
  ]);

  // Live Cursors of other members
  const [liveCursors, setLiveCursors] = useState<LiveCursor[]>([
    { id: 'c_alex', name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', color: '#2ECC71', x: 380, y: 120 },
    { id: 'c_sarah', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', color: '#E74C3C', x: 510, y: 220 }
  ]);

  // Request flow status
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted' | 'reviewed'>('none');
  const [requestAssignee, setRequestAssignee] = useState<string>('m_admin'); // default Sarah Chen
  const [requestMessage, setRequestMessage] = useState<string>('请协助排查「地图定位层」下的偏移算法参数，加上高能校准');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<Array<{ id: string; ver: string; updater: string; time: string; desc: string }>>([
    { id: 'v1', ver: 'v1.0', updater: 'Alex Mercer', time: '10:00', desc: '创建了协作思维导图骨架' },
    { id: 'v2', ver: 'v1.1', updater: 'Hui Zhang', time: '10:20', desc: '添加了「协作消息流」分支节点' }
  ]);

  // 6. RICH CHAT EXTENDED STATES
  const [activeReplyThreadId, setActiveReplyThreadId] = useState<string | null>(null);
  const [threadReplyText, setThreadReplyText] = useState<string>('');
  const [showReadReceipts, setShowReadReceipts] = useState<boolean>(true);
  const [requestCriticalRead, setRequestCriticalRead] = useState<boolean>(false);
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>({
    id: 'm_ack',
    senderId: 'm_owner',
    senderName: 'Alex Mercer',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    senderRole: 'Owner',
    time: '10:12',
    content: '【知会确认】请核心工程与架构组全体成员知悉：主干分支已锁定并开启静态类型检查与 Straight-Edge 样式引擎回归测试，收到请点击右下角确认签收。',
    isSelf: false,
    messageType: 'acknowledge',
    seenBy: [],
    reactions: []
  });
  const [selectedMessageForReceipts, setSelectedMessageForReceipts] = useState<ChatMessage | null>(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>('m_ack');
  const [showThreadEmojiPicker, setShowThreadEmojiPicker] = useState<string | null>(null);
  const [activeInlineReplyMessageId, setActiveInlineReplyMessageId] = useState<string | null>(null);
  const [inlineReplyText, setInlineReplyText] = useState<string>('');
  const [showInlineEmojiPicker, setShowInlineEmojiPicker] = useState<string | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Helper to determine bubble & dashed-line frame color based on speaker/message attributes
  const getSpeakerColorConfig = (m: ChatMessage) => {
    if (m.messageType === 'notice' || m.content.includes('【通知】')) {
      return { hex: '#2ECC71', borderClass: 'border-[#2ECC71]', textClass: 'text-[#2ECC71]', bgClass: 'bg-[#2ECC71]', lightBg: 'bg-[#E8F8F0]', badgeBg: 'bg-[#2ECC71]/15', label: '通知绿' };
    }
    if (m.messageType === 'acknowledge' || m.content.includes('【知会确认】')) {
      return { hex: '#F5A623', borderClass: 'border-[#F5A623]', textClass: 'text-[#F5A623]', bgClass: 'bg-[#F5A623]', lightBg: 'bg-[#FEF9E7]', badgeBg: 'bg-[#F5A623]/15', label: '知会金' };
    }
    if (m.messageType === 'task' || m.content.includes('【任务代办】') || m.content.includes('【任务待办】')) {
      return { hex: '#1877F2', borderClass: 'border-[#1877F2]', textClass: 'text-[#1877F2]', bgClass: 'bg-[#1877F2]', lightBg: 'bg-[#EBF5FB]', badgeBg: 'bg-[#1877F2]/15', label: '任务蓝' };
    }
    if (m.senderRole === 'Owner') {
      return { hex: '#F5A623', borderClass: 'border-[#F5A623]', textClass: 'text-[#F5A623]', bgClass: 'bg-[#F5A623]', lightBg: 'bg-amber-50/70', badgeBg: 'bg-amber-100', label: '组长金' };
    }
    if (m.senderRole === 'Admin') {
      return { hex: '#1877F2', borderClass: 'border-[#1877F2]', textClass: 'text-[#1877F2]', bgClass: 'bg-[#1877F2]', lightBg: 'bg-blue-50/70', badgeBg: 'bg-blue-100', label: '管理蓝' };
    }
    if (m.isSelf) {
      return { hex: '#1877F2', borderClass: 'border-[#1877F2]', textClass: 'text-[#1877F2]', bgClass: 'bg-[#1877F2]', lightBg: 'bg-blue-50/50', badgeBg: 'bg-[#1877F2]/15', label: '协同蓝' };
    }
    return { hex: '#4B5563', borderClass: 'border-[#4B5563]', textClass: 'text-[#4B5563]', bgClass: 'bg-[#4B5563]', lightBg: 'bg-[#F0F2F5]', badgeBg: 'bg-[#E4E6EB]', label: '成员灰' };
  };

  // Jump smoothly to the target quoted message bubble & pulse with glow ring
  const handleJumpToQuotedMessage = (targetMsgId: string, speakerName?: string) => {
    const el = document.getElementById(`group-msg-${targetMsgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(targetMsgId);
      showToast(`🎯 已沿虚线精准定位至 @${speakerName || '发言人'} 的发言气泡`);
      setTimeout(() => {
        setHighlightedMessageId(prev => (prev === targetMsgId ? null : prev));
      }, 3000);
    } else {
      showToast(`🎯 目标气泡 @${speakerName || ''} 位于消息流中`);
    }
  };

  // Simulated live cursor movements
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCursors(prev => prev.map(cursor => {
        const dx = (Math.random() - 0.5) * 24;
        const dy = (Math.random() - 0.5) * 24;
        return {
          ...cursor,
          // Constrain coordinates to standard mind map display box (800x400)
          x: Math.max(40, Math.min(760, cursor.x + dx)),
          y: Math.max(40, Math.min(360, cursor.y + dy))
        };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Automatic read receipt recording for Notice (通知) cards upon viewing
  useEffect(() => {
    setChatMessages(prev => {
      let hasUpdate = false;
      const nowTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      const updated = prev.map(msg => {
        const isNotice = msg.messageType === 'notice' || msg.content.includes('【通知】');
        if (isNotice) {
          const seenList = msg.seenBy || [];
          const alreadySeen = seenList.some(u => u.name === currentUserName || u.id === currentUserId);
          if (!alreadySeen) {
            hasUpdate = true;
            return {
              ...msg,
              messageType: 'notice',
              seenBy: [
                ...seenList,
                {
                  id: currentUserId,
                  name: currentUserName,
                  avatar: currentUserAvatar,
                  time: nowTime,
                  timestamp: Date.now()
                }
              ]
            };
          }
        }
        return msg;
      });
      return hasUpdate ? updated : prev;
    });
  }, []);

  // Auto-grow textarea height dynamically based on input content (录入文字全部可见)
  useEffect(() => {
    if (groupChatTextareaRef.current) {
      groupChatTextareaRef.current.style.height = 'auto';
      const scrollHeight = groupChatTextareaRef.current.scrollHeight;
      // Clamp between min 34px and max 160px for graceful multiline editing
      const calculatedHeight = Math.min(Math.max(scrollHeight, 34), 160);
      groupChatTextareaRef.current.style.height = `${calculatedHeight}px`;
    }
  }, [newMessageText]);

  // ACTION HANDLERS
  const handleConfirmReceipt = (messageId: string, actionType: 'acknowledge' | 'task') => {
    const nowStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const newConfirmation: ConfirmedMember = {
      id: currentUserId,
      name: currentUserName,
      avatar: currentUserAvatar,
      time: nowStr,
      timestamp: Date.now()
    };

    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const currentConfirmed = msg.confirmedBy || [];
        const alreadyConfirmed = currentConfirmed.some(u => u.id === currentUserId || u.name === currentUserName);
        if (!alreadyConfirmed) {
          return {
            ...msg,
            confirmedBy: [...currentConfirmed, newConfirmation]
          };
        }
      }
      return msg;
    }));

    showToast(actionType === 'acknowledge' ? '✍️ 已完成知会确认签收' : '📋 已成功确认接收任务待办');

    // Simulated WebSocket real-time broadcast: another teammate also confirms
    setTimeout(() => {
      setChatMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const list = msg.confirmedBy || [];
          const candidate = members.find(m => m.status === 'online' && m.id !== currentUserId && !list.some(u => u.id === m.id));
          if (candidate) {
            return {
              ...msg,
              confirmedBy: [
                ...list,
                {
                  id: candidate.id,
                  name: candidate.name,
                  avatar: candidate.avatar,
                  time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                  timestamp: Date.now()
                }
              ]
            };
          }
        }
        return msg;
      }));
    }, 2500);
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;
    
    // Detect message type from draftMessageType or explicit tag prefix
    let resolvedType: 'normal' | 'notice' | 'acknowledge' | 'task' = draftMessageType;
    if (newMessageText.includes('【通知】')) resolvedType = 'notice';
    else if (newMessageText.includes('【知会确认】')) resolvedType = 'acknowledge';
    else if (newMessageText.includes('【任务代办】') || newMessageText.includes('【任务待办】')) resolvedType = 'task';

    // Automatically check if message is a meta thread (has an @mention)
    const mentions = ['@Alex Mercer', '@Sarah Chen', '@Hui Zhang', '@Mia Wang', '@Lucas Zhao', '@林晚晴'];
    const hasMention = mentions.some(m => newMessageText.includes(m));
    const matchedMention = mentions.find(m => newMessageText.includes(m)) || '';

    const nowTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    const newMessage: ChatMessage = {
      id: `chat-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      senderRole: currentUserRole,
      time: nowTime,
      content: newMessageText,
      isSelf: true,
      messageType: resolvedType,
      targetMemberIds: resolvedType === 'task' ? (!taskTargetConfig.isAll ? taskTargetConfig.selectedMemberIds : undefined) : undefined,
      isTargetAll: resolvedType === 'task' ? taskTargetConfig.isAll : undefined,
      seenBy: resolvedType === 'notice' ? [
        { id: currentUserId, name: currentUserName, avatar: currentUserAvatar, time: nowTime, timestamp: Date.now() },
        { id: 'm_admin', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: nowTime, timestamp: Date.now() + 100 }
      ] : (showReadReceipts ? [
        { id: 'm_viewer', name: 'Lucas Zhao', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', time: '刚刚', timestamp: Date.now() }
      ] : []),
      confirmedBy: [],
      quotedMessageId: replyingToMessage ? replyingToMessage.id : undefined,
      isMeta: hasMention,
      threadMention: hasMention ? matchedMention : undefined,
      threadReplies: hasMention ? [] : undefined,
      isThreadCollapsed: hasMention ? false : undefined,
      requestReadReport: requestCriticalRead,
      reactions: []
    };

    setChatMessages([...chatMessages, newMessage]);
    setNewMessageText('');
    setReplyingToMessage(null);
    setRequestCriticalRead(false);
    setDraftMessageType('normal');
    setTaskTargetConfig({ isAll: true, selectedMemberIds: [] });
    
    showToast(
      resolvedType === 'notice' 
        ? '📢 通知消息已全员发布并开启自动已读记录' 
        : resolvedType === 'acknowledge'
        ? '✍️ 知会确认卡片已发送，等待组员签收'
        : resolvedType === 'task'
        ? '📋 任务待办已定向推送给指定成员'
        : '协作消息发送成功 📨'
    );
  };

  const handleSendPhoto = (imageUrl: string) => {
    const newMessage: ChatMessage = {
      id: `chat-${Date.now()}`,
      senderName: 'Hui Zhang',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      senderRole: 'Member',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      content: '📷 [发送了一张照片]',
      isSelf: true,
      attachedImage: imageUrl,
      seenBy: showReadReceipts ? [
        { name: 'Lucas Zhao', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', time: '刚刚' }
      ] : [],
      reactions: []
    };
    setChatMessages([...chatMessages, newMessage]);
    setShowPhotoPicker(false);
    showToast('照片发送成功 🖼️');
  };

  const handleSendNote = (title: string, content: string) => {
    if (!title.trim() || !content.trim()) {
      showToast('⚠️ 标题和内容不能为空');
      return;
    }
    const newMessage: ChatMessage = {
      id: `chat-${Date.now()}`,
      senderName: 'Hui Zhang',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      senderRole: 'Member',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      content: `📝 [共享了一篇工作笔记：${title}]`,
      isSelf: true,
      attachedNote: { title, content },
      seenBy: showReadReceipts ? [
        { name: 'Lucas Zhao', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', time: '刚刚' }
      ] : [],
      reactions: []
    };
    setChatMessages([...chatMessages, newMessage]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setShowNoteCreator(false);
    showToast('工作笔记分享成功 🗒️');
  };

  const handleSendThreadReply = (messageId: string) => {
    if (!threadReplyText.trim()) return;
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const newReply: ThreadReply = {
          id: `reply-${Date.now()}`,
          senderName: 'Hui Zhang',
          senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
          senderRole: 'Member',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          content: threadReplyText,
          isSelf: true
        };
        return {
          ...msg,
          threadReplies: [...(msg.threadReplies || []), newReply]
        };
      }
      return msg;
    }));
    setThreadReplyText('');
    setActiveReplyThreadId(null);
    showToast('已发表线程内联回复 💬');
  };

  const handleSendInlineBubbleReply = (messageId: string) => {
    if (!inlineReplyText.trim()) return;
    const targetMsg = chatMessages.find(m => m.id === messageId);
    const nowTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    const newReply: ThreadReply = {
      id: `reply-${Date.now()}`,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      senderRole: currentUserRole,
      time: nowTime,
      content: inlineReplyText,
      isSelf: true
    };

    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          isMeta: true,
          threadMention: msg.threadMention || `@${msg.senderName}`,
          isThreadCollapsed: false,
          threadReplies: [...(msg.threadReplies || []), newReply]
        };
      }
      return msg;
    }));

    setInlineReplyText('');
    setActiveInlineReplyMessageId(null);
    showToast(`已在 @${targetMsg?.senderName || '该消息'} 的对话框内发送回复 💬`);
  };

  const handleSummarizeThread = (messageId: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const summaryText = `💡 AI 讨论简报：\n• Hui Zhang 与组员确认了直角规范在组件层面的适配进度。\n• 承诺 3 个工作日内完成整个控制面板与悬浮地图组件的完全重构。\n• Sarah Chen 强调了 1px 细线、直角且无药丸等核心视觉规范，需要通过批注流保持实时核验。`;
        return {
          ...msg,
          aiSummary: summaryText
        };
      }
      return msg;
    }));
    showToast('已通过 AI 一键生成线程讨论摘要 ⚡');
  };

  const handleToggleAttitude = (messageId: string, attitude: 'important' | 'to-do' | 'resolved') => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        let currentAttitudes = msg.attitudes || [];
        if (currentAttitudes.includes(attitude)) {
          currentAttitudes = currentAttitudes.filter(a => a !== attitude);
        } else {
          currentAttitudes = [...currentAttitudes, attitude];
          // If resolved is checked, auto-post a thumbs-up reaction!
          if (attitude === 'resolved') {
            let currentReactions = msg.reactions || [];
            const hasThumbsUp = currentReactions.some(r => r.emoji === '👍');
            if (hasThumbsUp) {
              currentReactions = currentReactions.map(r => r.emoji === '👍' ? { ...r, count: r.count + 1 } : r);
            } else {
              currentReactions = [...currentReactions, { emoji: '👍', count: 1, users: ['Hui Zhang'] }];
            }
            msg.reactions = currentReactions;
          }
        }
        return { ...msg, attitudes: currentAttitudes };
      }
      return msg;
    }));
    showToast(`已成功标记消息状态 📌`);
  };

  const handleAddEmojiReaction = (messageId: string, emoji: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        let currentReactions = msg.reactions || [];
        const existingReactionIndex = currentReactions.findIndex(r => r.emoji === emoji);
        if (existingReactionIndex > -1) {
          const rx = currentReactions[existingReactionIndex];
          if (rx.users.includes('Hui Zhang')) {
            // Remove reaction
            const updatedUsers = rx.users.filter(u => u !== 'Hui Zhang');
            if (updatedUsers.length === 0) {
              currentReactions = currentReactions.filter(r => r.emoji !== emoji);
            } else {
              currentReactions[existingReactionIndex] = {
                ...rx,
                count: rx.count - 1,
                users: updatedUsers
              };
            }
          } else {
            // Add Hui Zhang to existing reaction
            currentReactions[existingReactionIndex] = {
              ...rx,
              count: rx.count + 1,
              users: [...rx.users, 'Hui Zhang']
            };
          }
        } else {
          // Create new reaction
          currentReactions = [...currentReactions, { emoji, count: 1, users: ['Hui Zhang'] }];
        }
        return { ...msg, reactions: currentReactions };
      }
      return msg;
    }));
    setActiveReactionMessageId(null);
  };

  // MIND MAP ACTIONS
  const handleAddMindMapNode = (parentId: string) => {
    const text = prompt("请输入新子节点的内容：", "新协作特性子节点");
    if (!text) return;

    const parentNode = mindMapNodes.find(n => n.id === parentId);
    if (!parentNode) return;

    // Place child on a smart offset based on parents
    const count = mindMapNodes.filter(n => n.parentId === parentId).length;
    const newId = `node-${Date.now()}`;
    const newNode: MindMapNode = {
      id: newId,
      text,
      parentId,
      x: parentNode.x + (parentId === 'root' ? (count % 2 === 0 ? 180 : -180) : 120),
      y: parentNode.y + (count * 60) - 30,
      comments: []
    };

    setMindMapNodes([...mindMapNodes, newNode]);
    setVersionHistory([
      { id: `v-${Date.now()}`, ver: `v1.${versionHistory.length + 1}`, updater: 'Hui Zhang', time: '刚刚', desc: `新增子节点「${text}」` },
      ...versionHistory
    ]);
    setSelectedNodeId(newId);
    showToast('思维导图子节点添加成功 🌿');
  };

  const handleEditMindMapNode = (nodeId: string) => {
    const node = mindMapNodes.find(n => n.id === nodeId);
    if (!node) return;
    const newText = prompt("请输入节点新内容：", node.text);
    if (!newText) return;

    setMindMapNodes(mindMapNodes.map(n => n.id === nodeId ? { ...n, text: newText } : n));
    setVersionHistory([
      { id: `v-${Date.now()}`, ver: `v1.${versionHistory.length + 1}`, updater: 'Hui Zhang', time: '刚刚', desc: `修改节点名称为「${newText}」` },
      ...versionHistory
    ]);
    showToast('节点内容已更新 ✏️');
  };

  const handleDeleteMindMapNode = (nodeId: string) => {
    if (nodeId === 'root') {
      showToast('无法删除根协同中枢节点 ❌');
      return;
    }
    if (!confirm('确定要删除该节点及其子分支节点吗？')) return;

    // Recursive delete children helper
    const getDescendantIds = (id: string): string[] => {
      const children = mindMapNodes.filter(n => n.parentId === id);
      return [id, ...children.flatMap(c => getDescendantIds(c.id))];
    };

    const toDelete = getDescendantIds(nodeId);
    setMindMapNodes(mindMapNodes.filter(n => !toDelete.includes(n.id)));
    setSelectedNodeId(null);
    setVersionHistory([
      { id: `v-${Date.now()}`, ver: `v1.${versionHistory.length + 1}`, updater: 'Hui Zhang', time: '刚刚', desc: `删除了节点分支` },
      ...versionHistory
    ]);
    showToast('选中分支节点已成功删除 🗑️');
  };

  const handleAddNodeComment = (nodeId: string) => {
    const commentText = prompt("请输入针对此节点的批注意见：", "直角边的底色对比度在极端天气下有待提升");
    if (!commentText) return;

    setMindMapNodes(mindMapNodes.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          comments: [
            ...(n.comments || []),
            {
              id: `nc-${Date.now()}`,
              author: 'Hui Zhang',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
              text: commentText,
              time: '刚刚'
            }
          ]
        };
      }
      return n;
    }));
    showToast('导图节点意见批注成功 💬');
  };

  const handleVoteNode = (nodeId: string) => {
    setMindMapNodes(mindMapNodes.map(n => {
      if (n.id === nodeId) {
        return { ...n, votes: (n.votes || 0) + 1 };
      }
      return n;
    }));
    showToast('已投出宝贵的一票 👍');
  };

  const handleTriggerNodeVotePoll = (nodeId: string) => {
    setMindMapNodes(mindMapNodes.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          hasVotePoll: true,
          votes: 0,
          pollOptions: [
            { option: '选项 A：通过重构验收', votes: 0, users: [] },
            { option: '选项 B：需进一步调优', votes: 0, users: [] }
          ]
        };
      }
      return n;
    }));
    showToast('已在节点上成功发起快捷匿名表决票 🗳️');
  };

  const handleVotePollOption = (nodeId: string, optionIndex: number) => {
    setMindMapNodes(mindMapNodes.map(n => {
      if (n.id === nodeId && n.pollOptions) {
        const updatedOptions = [...n.pollOptions];
        const opt = updatedOptions[optionIndex];
        if (opt.users.includes('Hui Zhang')) {
          opt.votes -= 1;
          opt.users = opt.users.filter(u => u !== 'Hui Zhang');
        } else {
          opt.votes += 1;
          opt.users = [...opt.users, 'Hui Zhang'];
        }
        return { ...n, pollOptions: updatedOptions };
      }
      return n;
    }));
    showToast('匿名投票状态已更新 🗳️');
  };

  // INFINITE CANVAS CONTROLLERS & ACTIONS
  const handleZoomIn = () => {
    setCanvasZoom(prev => Math.min(1.6, Math.round((prev + 0.1) * 100) / 100));
  };

  const handleZoomOut = () => {
    setCanvasZoom(prev => Math.max(0.5, Math.round((prev - 0.1) * 100) / 100));
  };

  const handleResetCanvasView = () => {
    setCanvasZoom(0.92);
    setCanvasPan({ x: 20, y: 10 });
    showToast('视野已重置居中 🎯');
  };

  const handleAddStickyNote = () => {
    if (!newStickyText.trim()) return;
    const newSticky: MindMapNode = {
      id: `sticky-${Date.now()}`,
      text: newStickyText,
      x: 350 - canvasPan.x / canvasZoom,
      y: 200 - canvasPan.y / canvasZoom,
      isSticky: true,
      stickyColor: newStickyColor,
      author: 'Hui Zhang'
    };
    setMindMapNodes(prev => [...prev, newSticky]);
    setShowAddStickyModal(false);
    setNewStickyText('');
    showToast('协作便签已成功贴在画布上 📝');
  };

  const handleAIExtendMindMap = () => {
    const targetId = selectedNodeId || 'root';
    const parentNode = mindMapNodes.find(n => n.id === targetId) || mindMapNodes[0];
    
    const candidates = [
      { text: '⚡ 端侧 WebGPU 遥感渲染加速管线', category: 'canvas' as const },
      { text: '🔒 零信任时空数据权限验证拦截器', category: 'security' as const },
      { text: '🛰️ 异步状态离线恢复与差分补丁', category: 'map' as const },
      { text: '🤖 智能协同 Agent 自动化变更审核', category: 'core' as const }
    ];
    
    // Pick 2 items not already in the mind map
    const existingTexts = mindMapNodes.map(n => n.text);
    const available = candidates.filter(c => !existingTexts.includes(c.text));
    const toAdd = available.slice(0, 2);
    
    if (toAdd.length === 0) {
      showToast('当前架构拓扑已达到最优密度 🌟');
      return;
    }

    const currentCount = mindMapNodes.filter(n => n.parentId === parentNode.id).length;
    const newCreatedNodes: MindMapNode[] = toAdd.map((item, idx) => ({
      id: `ai-node-${Date.now()}-${idx}`,
      text: item.text,
      parentId: parentNode.id,
      category: item.category,
      x: parentNode.x + (parentNode.id === 'root' ? (currentCount + idx) % 2 === 0 ? 220 : -220 : 180),
      y: parentNode.y + (currentCount + idx) * 70 - 40,
      comments: []
    }));

    setMindMapNodes(prev => [...prev, ...newCreatedNodes]);
    setVersionHistory([
      { id: `v-${Date.now()}`, ver: `v1.${versionHistory.length + 1}`, updater: 'AI Assistant', time: '刚刚', desc: `AI 智能拓扑扩展了「${toAdd.map(t => t.text).join('、')}」` },
      ...versionHistory
    ]);
    showToast(`✨ AI 已为您智能拓展了 ${toAdd.length} 个分布式子分支！`);
  };

  const handleSendRequest = () => {
    setIsRequestModalOpen(false);
    setRequestStatus('pending');
    const targetMemberName = members.find(m => m.id === requestAssignee)?.name || 'Sarah Chen';
    showToast(`协作请求已发送给 ${targetMemberName} 🚀`);

    // Post an interactive card to Chat Messages as requested!
    const targetMember = members.find(m => m.id === requestAssignee);
    const newMessage: ChatMessage = {
      id: `request-card-${Date.now()}`,
      senderName: 'Hui Zhang',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      senderRole: 'Member',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      content: `💡 发起了【思维导图共创指派】：\n指派给: @${targetMemberName}\n意见诉求: "${requestMessage}"`,
      isSelf: true,
      attachedFile: {
        name: `📁 导图协同: ${requestMessage.slice(0, 15)}...`,
        size: '实时评审闭环通道',
        type: 'request_action'
      }
    };
    setChatMessages(prev => [...prev, newMessage]);

    // Simulate member accepting the request and collaborating live after 4 seconds
    setTimeout(() => {
      setRequestStatus('accepted');
      showToast(`🎨 ${targetMemberName} 已接受您的思维导图协同修改请求，正在接入画布！`);

      // Snap cursor of target collaborator directly to b1_1 "偏移校准算法" node
      setLiveCursors(prev => prev.map(c => {
        if (c.id === 'c_sarah' && requestAssignee === 'm_admin') {
          return { ...c, x: 50, y: 80 }; // Near b1_1
        }
        if (c.id === 'c_alex' && requestAssignee === 'm_owner') {
          return { ...c, x: 50, y: 80 };
        }
        return c;
      }));

      // Simulate editor editing the node after 4 seconds
      setTimeout(() => {
        setMindMapNodes(nodes => nodes.map(node => {
          if (node.id === 'b1_1') {
            return {
              ...node,
              text: '📍 偏移校准算法 [已由 Sarah 协同修正 ⚡]',
              comments: [
                ...(node.comments || []),
                {
                  id: `nc-sarah-${Date.now()}`,
                  author: targetMemberName,
                  avatar: targetMember?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
                  text: '我已成功更新该节点！将高能偏移校准量收敛到了直角规范的 50m 标准。',
                  time: '刚刚'
                }
              ]
            };
          }
          return node;
        }));

        setVersionHistory(history => [
          { id: `vh-${Date.now()}`, ver: 'v1.2', updater: targetMemberName, time: '刚刚', desc: `协同修改了「偏移校准算法」分支参数，使其适配 Stellar V4.0 标准` },
          ...history
        ]);

        setRequestStatus('reviewed');
        showToast(`💡 ${targetMemberName} 的修改成果已提交！评审状态就绪！`);
      }, 4000);

    }, 4000);
  };

  const handleUploadFile = () => {
    const fileName = prompt("请输入要上传的文件名称：", "Stellar_Distributed_Protocol_v3.docx");
    if (!fileName) return;
    const newFile: TeamFile = {
      id: `file-${Date.now()}`,
      name: fileName,
      size: '3.4 MB',
      type: fileName.split('.').pop() || 'docx',
      uploader: 'Hui Zhang',
      uploaderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      date: new Date().toISOString().split('T')[0],
      version: 'v1.0',
      folder: currentFolder === 'root' ? 'root' : currentFolder,
      annotationsCount: 0
    };
    setTeamFiles([newFile, ...teamFiles]);
    showToast(`文件「${fileName}」已安全上传至当前目录 📁`);
  };

  const handleAddComment = () => {
    if (!newCommentText.trim() || !selectedFileForDetails) return;
    const fileId = selectedFileForDetails.id;
    const comment: FileComment = {
      id: `comment-${Date.now()}`,
      userName: 'Hui Zhang',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      text: newCommentText,
      time: '刚刚'
    };
    const currentComments = fileComments[fileId] || [];
    setFileComments({
      ...fileComments,
      [fileId]: [...currentComments, comment]
    });
    setNewCommentText('');
    showToast('评论发表成功 💬');
  };

  const handleAddAnnotation = () => {
    const textSelection = prompt("请输入您要划线/高亮批注的文本：", "1.5px 细线、round cap/join");
    if (!textSelection) return;
    const noteText = prompt("请输入您的批注意见：", "在 Safari 浏览器中有些细线会有锯齿问题，需要增加抗锯齿渲染样式。");
    const newAnn = {
      id: `ann-${Date.now()}`,
      type: activeAnnotationTool || 'highlight',
      text: textSelection,
      author: 'Hui Zhang',
      positionY: 280,
      content: noteText || undefined
    };
    setAnnotations([...annotations, newAnn]);
    if (selectedFileForDetails) {
      setTeamFiles(teamFiles.map(f => f.id === selectedFileForDetails.id ? { ...f, annotationsCount: f.annotationsCount + 1 } : f));
    }
    showToast('划词批注添加成功 ✏️');
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) {
      showToast('请输入被邀请人的昵称或邮箱');
      return;
    }
    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: inviteEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      role: inviteRole,
      department: '未分配探索部门',
      status: 'offline'
    };
    setMembers([...members, newMember]);
    setIsInviteOpen(false);
    setInviteEmail('');
    showToast(`邀请函已成功送达给「${inviteEmail}」 🚀`);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] text-[#050505] font-sans overflow-hidden select-none">
      
      {/* ==================== 1. TOP SUB-NAVBAR FOR DASHBOARD HUB ==================== */}
      {(selectedTab === GroupTab.DASHBOARD || selectedTab === GroupTab.TASKS || selectedTab === GroupTab.MEMBERS) && (
        <div className="px-4 py-3 bg-white border-b border-[#E4E6EB] shrink-0 z-10 flex items-center shadow-xs">
          <div className="flex items-center space-x-3 w-full overflow-x-auto no-scrollbar scroll-smooth">
            {/* 返回按钮 (Circular with label below) */}
            <button
              onClick={onBack}
              className="flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 min-w-[50px] text-center"
              title="返回上一级"
            >
              <div className="w-8 h-8 rounded-full border border-[#E4E6EB] bg-[#FAFAFA] text-[#65676B] flex items-center justify-center hover:border-[#1877F2] hover:text-[#1877F2] hover:bg-white transition-all">
                <ArrowLeft size={14} className="shrink-0" />
              </div>
              <span className="text-[9px] font-black text-[#65676B] mt-1 leading-none">返回</span>
            </button>
            <div className="h-8 w-[1px] bg-[#E4E6EB] shrink-0" />

            {/* 工作台总览 */}
            <button
              onClick={() => {
                setSelectedTab(GroupTab.DASHBOARD);
                setSelectedFileForDetails(null);
              }}
              className="flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 min-w-[56px] text-center"
            >
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                selectedTab === GroupTab.DASHBOARD
                  ? 'bg-[#1877F2] border-[#1877F2] text-white'
                  : 'bg-[#FAFAFA] border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2] hover:text-[#1877F2] hover:bg-white'
              }`}>
                <Activity size={14} className="shrink-0" />
              </div>
              <span className={`text-[9px] font-black mt-1 leading-none ${selectedTab === GroupTab.DASHBOARD ? 'text-[#1877F2]' : 'text-[#65676B]'}`}>
                工作台总览
              </span>
            </button>

            {/* 任务监控 */}
            <button
              onClick={() => {
                setSelectedTab(GroupTab.TASKS);
                setSelectedFileForDetails(null);
              }}
              className="flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 min-w-[56px] text-center"
            >
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                selectedTab === GroupTab.TASKS
                  ? 'bg-[#1877F2] border-[#1877F2] text-white'
                  : 'bg-[#FAFAFA] border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2] hover:text-[#1877F2] hover:bg-white'
              }`}>
                <CheckCircle2 size={14} className="shrink-0" />
              </div>
              <span className={`text-[9px] font-black mt-1 leading-none ${selectedTab === GroupTab.TASKS ? 'text-[#1877F2]' : 'text-[#65676B]'}`}>
                任务监控
              </span>
            </button>

            {/* 成员列表 */}
            <button
              onClick={() => {
                setSelectedTab(GroupTab.MEMBERS);
                setSelectedFileForDetails(null);
              }}
              className="flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 min-w-[56px] text-center"
            >
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                selectedTab === GroupTab.MEMBERS
                  ? 'bg-[#1877F2] border-[#1877F2] text-white'
                  : 'bg-[#FAFAFA] border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2] hover:text-[#1877F2] hover:bg-white'
              }`}>
                <Users size={14} className="shrink-0" />
              </div>
              <span className={`text-[9px] font-black mt-1 leading-none ${selectedTab === GroupTab.MEMBERS ? 'text-[#1877F2]' : 'text-[#65676B]'}`}>
                成员列表
              </span>
            </button>

            {/* 文件/文档 (Stellar 文档空间) */}
            <button
              onClick={() => {
                setSelectedTab(GroupTab.DOCS);
                setSelectedFileForDetails(null);
              }}
              className="flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 min-w-[56px] text-center"
              title="进入 Stellar 文件与文档工作台"
            >
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                selectedTab === GroupTab.DOCS
                  ? 'bg-[#1877F2] border-[#1877F2] text-white'
                  : 'bg-[#FAFAFA] border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2] hover:text-[#1877F2] hover:bg-white'
              }`}>
                <FileText size={14} className="shrink-0" />
              </div>
              <span className={`text-[9px] font-black mt-1 leading-none ${selectedTab === GroupTab.DOCS ? 'text-[#1877F2]' : 'text-[#65676B]'}`}>
                文件/文档
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ==================== 2. TOP HEADER FOR CHAT HUB ==================== */}
      {selectedTab === GroupTab.CHAT && (
        <div className="px-4 py-2.5 bg-white border-b border-[#E4E6EB] shrink-0 z-10 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onBack}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md border border-[#E4E6EB] bg-[#FAFAFA] hover:bg-white hover:border-[#1877F2] text-[#65676B] hover:text-[#1877F2] transition-all cursor-pointer text-xs font-bold"
              title="返回上一级"
            >
              <ArrowLeft size={14} />
              <span>返回</span>
            </button>
            <div className="h-4 w-[1px] bg-[#E4E6EB]" />
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black text-[#050505]">{groupName}</span>
              <span className="text-[10px] text-[#65676B]">/</span>
              <span className="text-xs font-bold text-[#1877F2]">协作群聊</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-[#2ECC71] rounded-full inline-block animate-pulse" />
            <span className="text-[10px] font-extrabold text-[#65676B]">协作漫游模式活跃中</span>
          </div>
        </div>
      )}

      {/* 3. DYNAMIC CONTENT AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col min-h-0 bg-white">
        
        {/* ==================== TAB 0: DASHBOARD (小组工作台) ==================== */}
        {selectedTab === GroupTab.DASHBOARD && (
          <GroupWorkbenchOverview
            groupName={groupNameState}
            groupDescription={groupDescriptionState}
            selectedRegionAnimal={selectedRegionAnimal}
            schedule={scheduleState}
            members={workbenchMembers}
            squads={workbenchSquads}
            tasks={workbenchTasks}
            announcements={workbenchAnnouncements}
            onOpenManageGroup={() => setIsManageGroupOpen(true)}
            onOpenCreateSquad={() => setIsCreateSquadOpen(true)}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
            onOpenMemberConsent={() => setIsMemberConsentOpen(true)}
            onSelectSquad={(squad) => setSelectedSquadForChannel(squad)}
            onOpenMissionControl={(squad) => setSelectedSquadForMissionControl(squad)}
            onSelectTask={(task) => setSelectedTaskForDetail(task)}
            onOpenDoc={(docId) => {
              setSelectedTab(GroupTab.DOCS);
              showToast(`已为您导航至关联文档空间`);
            }}
            onNavigateToDocsTab={() => {
              setSelectedTab(GroupTab.DOCS);
              showToast('已进入协作文档空间');
            }}
            showToast={showToast}
            onToggleTaskStep={handleToggleTaskStep}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onAddAnnouncement={handleAddAnnouncement}
          />
        )}

        {/* ==================== TAB 1: CHAT (聊天) ==================== */}
        {selectedTab === GroupTab.CHAT && (
          <div className="flex flex-col h-full bg-white relative">
            
            {/* Thread Custom Subheader / Filter Bar */}
            <div className="px-4 py-2 border-b border-[#E4E6EB] bg-[#F5F6F7] flex items-center justify-between shrink-0 text-left">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#2ECC71] rounded-full inline-block animate-pulse" />
                <span className="text-[10px] font-extrabold text-[#65676B]">协作漫游模式活跃中</span>
              </div>
              <div className="flex items-center space-x-3 text-[10px]">
                <label className="flex items-center space-x-1 cursor-pointer font-bold select-none text-[#65676B]">
                  <input
                    type="checkbox"
                    checked={showReadReceipts}
                    onChange={(e) => {
                      setShowReadReceipts(e.target.checked);
                      showToast(e.target.checked ? '已开启已读回执，气泡下将实时显示已读人数' : '已关闭已读回执 🔒');
                    }}
                    className="accent-[#1877F2]"
                  />
                  <span>显示已读状态</span>
                </label>
              </div>
            </div>

            {/* Scrollable Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-left">
              <div className="text-center">
                <span className="px-2.5 py-0.5 text-[9px] font-bold text-[#65676B] bg-[#FAFAFA] border border-[#E4E6EB] rounded-[3px]">
                  🔒 此工作组群采用 Stellar 协作消息流 · 支持 @聚合线程与引用连线
                </span>
              </div>

              {chatMessages
                .filter((msg) => {
                  // Task message targeted visibility filtering
                  if (msg.messageType === 'task' || msg.content.includes('【任务代办】') || msg.content.includes('【任务待办】')) {
                    if (msg.isTargetAll === true) return true;
                    if (msg.isSelf) return true;
                    if (msg.targetMemberIds && msg.targetMemberIds.length > 0) {
                      return msg.targetMemberIds.includes(currentUserId);
                    }
                  }
                  return true;
                })
                .map((msg) => {
                const quoted = msg.quotedMessageId ? chatMessages.find(m => m.id === msg.quotedMessageId) : null;
                const quotedSpeakerColor = quoted ? getSpeakerColorConfig(quoted) : null;
                const isReplyingThis = replyingToMessage?.id === msg.id;

                const isNotice = msg.messageType === 'notice' || msg.content.includes('【通知】');
                const isAcknowledge = msg.messageType === 'acknowledge' || msg.content.includes('【知会确认】');
                const isTask = msg.messageType === 'task' || msg.content.includes('【任务代办】') || msg.content.includes('【任务待办】');
                const isConfirmedByMe = (msg.confirmedBy || []).some(u => u.id === currentUserId || u.name === currentUserName);

                // For task, resolve targeted member names
                const targetNames = isTask && msg.targetMemberIds && msg.targetMemberIds.length > 0
                  ? msg.targetMemberIds.map(id => members.find(m => m.id === id)?.name || id).join(', ')
                  : null;

                return (
                  <div 
                    key={msg.id} 
                    id={`group-msg-${msg.id}`}
                    className={`relative group/msg transition-all duration-300 ${
                      highlightedMessageId === msg.id ? 'scale-[1.01] p-1 rounded-md bg-blue-50/50 ring-2 ring-[#1877F2]' : ''
                    }`}
                  >
                    
                    {/* Visual Quote dashed line with speaker bubble frame color & Click-to-Jump */}
                    {quoted && quotedSpeakerColor && (
                      <div 
                        onClick={() => handleJumpToQuotedMessage(quoted.id, quoted.senderName)}
                        className={`absolute top-0 bottom-4 ${msg.isSelf ? '-right-4' : '-left-4'} w-5 flex flex-col items-center justify-between cursor-pointer group/dash z-20`}
                        title={`点击此虚线直达 @${quoted.senderName} 的发言气泡`}
                      >
                        {/* Top Origin Node */}
                        <div 
                          className="w-2.5 h-2.5 rounded-full border-2 bg-white shadow-2xs group-hover/dash:scale-135 transition-transform flex items-center justify-center"
                          style={{ borderColor: quotedSpeakerColor.hex, backgroundColor: quotedSpeakerColor.hex }}
                        >
                          <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                        </div>
                        {/* Dashed Connecting Line in quoted speaker frame color */}
                        <div 
                          className="w-0 grow border-l-2 border-dashed group-hover/dash:border-l-[2.5px] transition-all opacity-85 group-hover/dash:opacity-100 my-0.5" 
                          style={{ borderColor: quotedSpeakerColor.hex }}
                        />
                        {/* Bottom Anchor Node */}
                        <div 
                          className="w-2.5 h-2.5 rounded-full border-2 bg-white shadow-2xs group-hover/dash:scale-135 transition-transform flex items-center justify-center"
                          style={{ borderColor: quotedSpeakerColor.hex }}
                        >
                          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: quotedSpeakerColor.hex }} />
                        </div>
                      </div>
                    )}

                    <div
                      className={`flex items-start space-x-1.5 max-w-[96%] relative ${
                        msg.isSelf ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
                      }`}
                    >
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-6 h-6 rounded-[3px] border border-[#E4E6EB] shrink-0 object-cover mt-0.5"
                      />
                      
                      <div className="space-y-1 relative max-w-full flex-1 min-w-0">
                        
                        {/* Sender Info Row */}
                        <div className={`flex items-center space-x-1.5 ${msg.isSelf ? 'justify-end' : ''}`}>
                          <span className="text-[11px] font-black text-[#050505]">{msg.senderName}</span>
                          <span className={`px-1 py-0.2 text-[7.5px] font-black rounded-[2px] border ${
                            msg.senderRole === 'Owner'
                              ? 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20'
                              : msg.senderRole === 'Admin'
                              ? 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20'
                              : 'bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20'
                          }`}>
                            {msg.senderRole}
                          </span>
                          <span className="text-[8.5px] text-[#8A8D91] font-medium">{msg.time}</span>
                        </div>

                        {/* Quoted Box with Speaker Frame Color & Jump Action */}
                        {quoted && quotedSpeakerColor && (
                          <div 
                            onClick={() => handleJumpToQuotedMessage(quoted.id, quoted.senderName)}
                            className={`p-2 rounded-[4px] border-2 border-dashed ${quotedSpeakerColor.borderClass} ${quotedSpeakerColor.lightBg} text-left cursor-pointer hover:shadow-xs transition-all mb-1.5 flex items-center justify-between group/quote select-none max-w-sm`}
                            title={`点击虚线直接跳转至 @${quoted.senderName} 的发言气泡`}
                          >
                            <div className="flex items-center space-x-2 truncate min-w-0">
                              <div 
                                className="w-5 h-5 rounded-[3px] text-white flex items-center justify-center text-[10px] shrink-0 font-black shadow-2xs group-hover/quote:scale-110 transition-transform"
                                style={{ backgroundColor: quotedSpeakerColor.hex }}
                              >
                                <Quote size={11} className="stroke-[2.5]" />
                              </div>
                              <div className="truncate text-left">
                                <div className="flex items-center space-x-1.5 text-[9px] font-black" style={{ color: quotedSpeakerColor.hex }}>
                                  <span>🔗 引用 @{quoted.senderName}</span>
                                  <span className="text-[#8A8D91] font-normal text-[8px]">({quoted.senderRole || '成员'} · {quoted.time})</span>
                                </div>
                                <p className="text-[9.5px] text-[#050505] truncate font-medium max-w-xs mt-0.5">
                                  “{quoted.content}”
                                </p>
                              </div>
                            </div>

                            {/* Jump Button */}
                            <div 
                              className="px-2 py-0.5 rounded-[3px] text-[8.5px] font-black flex items-center space-x-1 shrink-0 ml-2 group-hover/quote:scale-105 transition-all text-white shadow-2xs"
                              style={{ backgroundColor: quotedSpeakerColor.hex }}
                            >
                              <span>沿虚线跳转</span>
                              <ChevronRight size={10} className="stroke-[3]" />
                            </div>
                          </div>
                        )}

                        {/* Message Content Bubble (Straight-Edge Style) */}
                        <div 
                          className={`p-2.5 sm:p-3 text-xs leading-relaxed relative cursor-pointer group transition-all shadow-2xs ${
                            highlightedMessageId === msg.id
                              ? 'ring-4 ring-offset-2 ring-[#007AFF] shadow-xl scale-[1.02]'
                              : ''
                          } ${
                            isNotice
                              ? 'bg-[#E8F8F0] border border-[#2ECC71]/40 text-[#050505] rounded-md'
                              : isAcknowledge
                              ? 'bg-[#FEF9E7] border border-[#F5A623]/40 text-[#050505] rounded-md'
                              : isTask
                              ? 'bg-[#EBF5FB] border border-[#1877F2]/30 text-[#050505] rounded-md'
                              : msg.isMeta 
                              ? 'border border-[#E4E6EB] border-l-[3px] border-l-[#F5A623] bg-white rounded-md' 
                              : msg.isSelf
                              ? 'bg-[#007AFF] text-white rounded-[14px] rounded-br-[2px]'
                              : 'bg-[#F0F2F5] text-[#000000] rounded-[14px] rounded-bl-[2px]'
                          }`}
                          onClick={() => {
                            setActiveReactionMessageId(activeReactionMessageId === msg.id ? null : msg.id);
                          }}
                        >
                          {/* Message Header Badge for Special Types */}
                          {isNotice && (
                            <div className="flex items-center space-x-1.5 text-[#2ECC71] font-bold text-[9.5px] pb-1 mb-1.5 border-b border-[#2ECC71]/15">
                              <span className="px-1.5 py-0.5 rounded-[2px] bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/25 text-[8.5px] font-bold">
                                📢 全员通知
                              </span>
                              <span className="text-[8.5px] text-[#65676B] font-medium">小组成员自动已读</span>
                            </div>
                          )}

                          {isAcknowledge && (
                            <div className="flex items-center space-x-1.5 text-[#F5A623] font-bold text-[9.5px] pb-1 mb-1.5 border-b border-[#F5A623]/15">
                              <span className="px-1.5 py-0.5 rounded-[2px] bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/25 text-[8.5px] font-bold">
                                ✍️ 知会确认
                              </span>
                              <span className="text-[8.5px] text-[#65676B] font-medium">全员可见 · 需手动签收</span>
                            </div>
                          )}

                          {isTask && (
                            <div className="flex items-center justify-between flex-wrap gap-1 text-[#1877F2] text-[9.5px] pb-1 mb-1.5 border-b border-[#1877F2]/15">
                              <div className="flex items-center space-x-1.5">
                                <span className="px-1.5 py-0.5 rounded-[2px] bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/25 font-bold text-[8.5px]">
                                  📋 任务待办
                                </span>
                                <span className="text-[8.5px] text-[#65676B] font-medium">需定向接收确认</span>
                              </div>
                              {targetNames ? (
                                <span className="text-[8.5px] text-[#1877F2] bg-white/90 px-1.5 py-0.5 rounded-[2px] border border-[#1877F2]/20 font-bold">
                                  🎯 指定: {targetNames}
                                </span>
                              ) : (
                                <span className="text-[8.5px] text-[#65676B] bg-white/90 px-1.5 py-0.5 rounded-[2px] border border-[#E4E6EB] font-bold">
                                  👥 全员待办
                                </span>
                              )}
                            </div>
                          )}

                          {/* Main Text Content */}
                          <p className={`whitespace-pre-line ${isTask || isNotice || isAcknowledge ? 'text-[11px] leading-relaxed font-normal text-[#1C1E21]' : 'font-medium'}`}>
                            {isTask || isNotice || isAcknowledge ? msg.content.replace(/^【(任务待办|任务代办|通知|知会确认)】\s*/, '') : msg.content}
                          </p>

                          {/* Attached Image inside chat */}
                          {msg.attachedImage && (
                            <div className="mt-2.5 rounded-[4px] overflow-hidden border border-[#E4E6EB] max-w-sm">
                              <img 
                                src={msg.attachedImage} 
                                alt="Attachment" 
                                className="w-full max-h-60 object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}

                          {/* Attached Note card inside chat */}
                          {msg.attachedNote && (
                            <div className="mt-2.5 p-3 bg-white border-l-4 border-l-[#1877F2] border border-[#E4E6EB] rounded-[3px] text-left max-w-sm space-y-1 hover:bg-[#F5F6F7] transition-colors">
                              <div className="flex items-center space-x-1.5 text-[#1877F2] font-black text-[11px]">
                                <FileText size={14} />
                                <span>工作笔记：{msg.attachedNote.title}</span>
                              </div>
                              <p className="text-[10px] text-[#65676B] line-clamp-3 leading-relaxed whitespace-pre-line bg-[#FAFAFA] p-2 rounded border border-[#E4E6EB]/50 mt-1">
                                {msg.attachedNote.content}
                              </p>
                              <div className="flex items-center justify-between text-[8px] text-[#8A8D91] pt-1">
                                <span>已同步发送至小组协作流</span>
                                <span className="underline cursor-pointer hover:text-[#1877F2]" onClick={(e) => { e.stopPropagation(); showToast('正在打开并编辑笔记...'); }}>去查看</span>
                              </div>
                            </div>
                          )}

                          {/* Attached File Row within chat */}
                          {msg.attachedFile && (
                            <div className="mt-2.5 p-2 bg-[#FAFAFA] border border-[#E4E6EB] rounded-[3px] flex items-center justify-between space-x-2">
                              <div className="flex items-center space-x-2 truncate">
                                <FileText size={16} className={msg.attachedFile.type === 'request_action' ? 'text-[#F5A623] shrink-0' : 'text-[#1877F2] shrink-0'} />
                                <div className="truncate text-left">
                                  <p className="font-extrabold text-[10px] text-[#050505] truncate">{msg.attachedFile.name}</p>
                                  <p className="text-[9px] text-[#65676B]">{msg.attachedFile.size}</p>
                                </div>
                              </div>
                              {msg.attachedFile.type === 'request_action' ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTab(GroupTab.MIND_MAP);
                                    showToast('正在为您打开思维导图协同画布');
                                  }}
                                  className="px-2 py-1 bg-[#F5A623] hover:bg-[#F5A623]/90 text-white text-[9px] font-black rounded-[2px] transition-colors"
                                >
                                  查看共创导图
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTab(GroupTab.FILES);
                                    const targetFile = teamFiles.find(f => f.name === msg.attachedFile?.name);
                                    if (targetFile) setSelectedFileForDetails(targetFile);
                                    showToast('已在文件库中为您打开该协作文件');
                                  }}
                                  className="text-[9px] text-[#1877F2] font-black hover:underline shrink-0"
                                >
                                  去批注 &gt;
                                </button>
                              )}
                            </div>
                          )}

                          {/* ================= SPECIAL CARD FOOTERS ================= */}
                          {/* 1. Notice Footer: Auto-Read Avatar Stack */}
                          {isNotice && (
                            <div className="mt-2 pt-2 border-t border-[#2ECC71]/20 flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-1 text-[9px] font-bold text-[#2ECC71]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
                                <span>已自动记录浏览回执</span>
                              </div>
                              <div className="flex items-center space-x-1.5 shrink-0">
                                <span className="text-[9px] text-[#65676B] font-bold">已读:</span>
                                <AvatarStack members={msg.seenBy || []} title="已读成员" maxVisible={4} emptyPlaceholder="暂无记录" />
                              </div>
                            </div>
                          )}

                          {/* 2. Acknowledgment Footer: Confirm button + Avatar Stack */}
                          {isAcknowledge && (
                            <div className="mt-2.5 pt-2 border-t border-[#F5A623]/25 flex items-center justify-between gap-2">
                              <button
                                disabled={isConfirmedByMe}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmReceipt(msg.id, 'acknowledge');
                                }}
                                className={`px-2.5 py-1 text-[10px] font-black rounded-[3px] border transition-all cursor-pointer flex items-center space-x-1 shrink-0 ${
                                  isConfirmedByMe
                                    ? 'bg-gray-100 border-[#E4E6EB] text-[#8A8D91] cursor-not-allowed opacity-90'
                                    : 'bg-[#F5A623] hover:bg-[#E09612] text-white border-[#F5A623] shadow-xs active:scale-95'
                                }`}
                              >
                                {isConfirmedByMe ? (
                                  <>
                                    <Check size={11} className="stroke-[3]" />
                                    <span>已签收</span>
                                  </>
                                ) : (
                                  <>
                                    <span>确认签收</span>
                                  </>
                                )}
                              </button>

                              <div className="flex items-center space-x-1.5 shrink-0">
                                <span className="text-[9px] text-[#65676B] font-bold">已确认:</span>
                                <AvatarStack members={msg.confirmedBy || []} title="已确认签收成员" maxVisible={4} emptyPlaceholder="暂无签收" />
                              </div>
                            </div>
                          )}

                          {/* 3. Task Footer: Confirm button + Avatar Stack */}
                          {isTask && (
                            <div className="mt-2.5 pt-2 border-t border-[#1877F2]/25 flex items-center justify-between gap-2">
                              <button
                                disabled={isConfirmedByMe}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmReceipt(msg.id, 'task');
                                }}
                                className={`px-2.5 py-1 text-[10px] font-black rounded-[3px] border transition-all cursor-pointer flex items-center space-x-1 shrink-0 ${
                                  isConfirmedByMe
                                    ? 'bg-gray-100 border-[#E4E6EB] text-[#8A8D91] cursor-not-allowed opacity-90'
                                    : 'bg-[#1877F2] hover:bg-[#166FE5] text-white border-[#1877F2] shadow-xs active:scale-95'
                                }`}
                              >
                                {isConfirmedByMe ? (
                                  <>
                                    <Check size={11} className="stroke-[3]" />
                                    <span>已接收</span>
                                  </>
                                ) : (
                                  <>
                                    <span>确认接收</span>
                                  </>
                                )}
                              </button>

                              <div className="flex items-center space-x-1.5 shrink-0">
                                <span className="text-[9px] text-[#65676B] font-bold">已接收:</span>
                                <AvatarStack members={msg.confirmedBy || []} title="已接收任务成员" maxVisible={4} emptyPlaceholder="暂未接收" />
                              </div>
                            </div>
                          )}

                          {/* Inline Reaction Chips (No bubble, just emoji and number) */}
                          {((msg.reactions && msg.reactions.length > 0) || (msg.attitudes && msg.attitudes.length > 0)) && (
                            <div className="flex items-center flex-wrap gap-2 mt-1.5 pt-0.5">
                              {msg.reactions?.map((rx, idx) => (
                                <button
                                  key={`rx-${rx.emoji}-${idx}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddEmojiReaction(msg.id, rx.emoji);
                                  }}
                                  className="inline-flex items-center space-x-1 cursor-pointer transition-transform hover:scale-110 active:scale-95 select-none bg-transparent border-0 p-0"
                                  title={`赞同人: ${rx.users.join(', ')}`}
                                >
                                  <span className="text-xs leading-none">{rx.emoji}</span>
                                  <span className={`text-[10px] font-bold leading-none ${rx.users.includes('Hui Zhang') ? 'text-[#1877F2]' : 'text-[#65676B]'}`}>
                                    {rx.count}
                                  </span>
                                </button>
                              ))}

                              {msg.attitudes?.map((att, idx) => (
                                <span
                                  key={`att-${att}-${idx}`}
                                  className="inline-flex items-center space-x-0.5 text-[9px] font-bold text-[#65676B]"
                                >
                                  <span>{att === 'important' ? '🔴' : att === 'to-do' ? '🟡' : '🟢'}</span>
                                  <span className="text-[9px]">{att === 'important' ? '重要' : att === 'to-do' ? '待办' : '已解决'}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Read receipts status pill inside bubble */}
                          {!isNotice && !isAcknowledge && !isTask && showReadReceipts && msg.seenBy && msg.seenBy.length > 0 && (
                            <div className="mt-1 flex items-center justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMessageForReceipts(selectedMessageForReceipts?.id === msg.id ? null : msg);
                                }}
                                className="inline-flex items-center space-x-1 text-[8.5px] text-[#2ECC71] font-black hover:underline cursor-pointer"
                              >
                                <span>✓ {msg.seenBy.length}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]" />
                              </button>
                            </div>
                          )}

                          {/* Seen-by details expand list */}
                          {!isNotice && !isAcknowledge && !isTask && selectedMessageForReceipts?.id === msg.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1.5 p-2 bg-[#FAFAFA] border border-[#E4E6EB] rounded-[3px] text-left space-y-1 z-10 relative"
                            >
                              <p className="text-[8px] font-black text-[#8A8D91] border-b border-[#E4E6EB] pb-0.5">确认已读成员及时间</p>
                              {msg.seenBy?.map((seen, sIdx) => (
                                <div key={sIdx} className="flex items-center justify-between text-[8px] text-[#65676B]">
                                  <span className="font-bold">{seen.name}</span>
                                  <span>{seen.time}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* ================= @聚合内联线程 (Divided by thin line, no nested card) ================= */}
                          {msg.isMeta && msg.threadReplies && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="mt-2.5 pt-2.5 border-t border-[#E4E6EB] text-left space-y-2"
                            >
                              {/* Thread header */}
                              <div className="flex items-center justify-between pb-1 shrink-0">
                                <span className="text-[10px] font-black text-[#65676B] flex items-center space-x-1">
                                  <GitBranch size={10} className="text-[#F5A623]" />
                                  <span>线程回复聚合束（关于 {msg.threadMention}）</span>
                                </span>
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    onClick={() => handleSummarizeThread(msg.id)}
                                    className="px-1.5 py-0.5 bg-yellow-50 hover:bg-yellow-100 text-[#F5A623] border border-yellow-200 rounded-[2px] text-[8px] font-black transition-colors cursor-pointer"
                                  >
                                    AI 摘要
                                  </button>
                                  <button
                                    onClick={() => {
                                      setChatMessages(chatMessages.map(m => m.id === msg.id ? { ...m, isThreadCollapsed: !m.isThreadCollapsed } : m));
                                    }}
                                    className="text-[#65676B] hover:text-[#1877F2] p-0.5 cursor-pointer"
                                  >
                                    {msg.isThreadCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                                  </button>
                                </div>
                              </div>

                              {/* Thread replies display */}
                              {!msg.isThreadCollapsed && (
                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                  {msg.aiSummary && (
                                    <div className="p-2 bg-yellow-50/50 border border-dashed border-[#F5A623]/30 text-[9px] text-[#050505] rounded-[3px] leading-relaxed">
                                      <p className="font-extrabold text-[#F5A623] flex items-center space-x-1">
                                        <Sparkles size={10} />
                                        <span>线程自动简报汇总</span>
                                      </p>
                                      <p className="whitespace-pre-line mt-1">{msg.aiSummary}</p>
                                    </div>
                                  )}

                                  {msg.threadReplies.length === 0 ? (
                                    <p className="text-[9px] text-[#8A8D91] italic py-1">暂无对该提及对象的二次回复</p>
                                  ) : (
                                    msg.threadReplies.map((reply, rIdx) => (
                                      <div key={reply.id} className="relative flex items-start space-x-2 text-[10px]">
                                        {/* Circular avatar & connecting vertical line */}
                                        <div className="relative flex flex-col items-center shrink-0 self-stretch">
                                          <img
                                            src={reply.senderAvatar}
                                            alt={reply.senderName}
                                            className="w-4 h-4 rounded-full border border-[#E4E6EB] z-10 object-cover bg-white shrink-0 shadow-2xs"
                                          />
                                          {rIdx < (msg.threadReplies?.length ?? 0) - 1 && (
                                            <span className="w-[1.5px] bg-[#CBD5E1] grow mt-1 -mb-2" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0 pb-1">
                                          <div className="flex items-center justify-between text-[8px]">
                                            <span className="font-extrabold text-[#050505]">{reply.senderName}</span>
                                            <span className="text-[#8A8D91]">{reply.time}</span>
                                          </div>
                                          <p className="text-[#050505] mt-0.5 font-medium leading-relaxed whitespace-pre-line">{reply.content}</p>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}

                              {/* Thread Quick Reply Row with Emoji button */}
                              {!msg.isThreadCollapsed && (
                                <div className="pt-1.5 flex items-center space-x-1.5 border-t border-[#E4E6EB]/60">
                                  <input
                                    type="text"
                                    placeholder="快速补充关于此 @ 的回复..."
                                    value={activeReplyThreadId === msg.id ? threadReplyText : ''}
                                    onChange={(e) => {
                                      setActiveReplyThreadId(msg.id);
                                      setThreadReplyText(e.target.value);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendThreadReply(msg.id)}
                                    className="flex-1 bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-[3px] px-2 py-1 text-[9px] text-[#050505] outline-none"
                                  />
                                  
                                  {/* Emoji Button in Thread Input */}
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowThreadEmojiPicker(showThreadEmojiPicker === msg.id ? null : msg.id);
                                      }}
                                      className="p-1 text-[#65676B] hover:text-[#1877F2] hover:bg-[#E4E6EB]/50 rounded-[2px] transition-colors flex items-center justify-center cursor-pointer"
                                      title="插入表情"
                                    >
                                      <Smile size={13} />
                                    </button>

                                    {showThreadEmojiPicker === msg.id && (
                                      <div 
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute bottom-full right-0 mb-1 bg-white border border-[#E4E6EB] shadow-md rounded-[4px] p-1 flex items-center space-x-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                                      >
                                        {['👍', '✅', '🫡', '💯', '✨', '🤝'].map(em => (
                                          <button
                                            key={`thread-em-${em}`}
                                            type="button"
                                            onClick={() => {
                                              setActiveReplyThreadId(msg.id);
                                              setThreadReplyText(prev => (activeReplyThreadId === msg.id ? prev + em : em));
                                              setShowThreadEmojiPicker(null);
                                            }}
                                            className="text-sm p-1 hover:bg-[#F0F2F5] hover:scale-115 rounded-[2px] transition-all cursor-pointer leading-none"
                                          >
                                            {em}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => handleSendThreadReply(msg.id)}
                                    className="px-2.5 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white text-[8.5px] font-black rounded-[3px] transition-colors cursor-pointer shrink-0"
                                  >
                                    回复
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ================= INLINE DIALOGUE INPUT BOX (点击回复即可在对话框中显示对话输入框) ================= */}
                          {activeInlineReplyMessageId === msg.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="mt-2.5 pt-2.5 border-t border-[#E4E6EB] bg-[#FAFAFA] -mx-3 -mb-3 p-2.5 rounded-b-[3px] space-y-2 animate-in fade-in duration-150 text-left"
                            >
                              <div className="flex items-center justify-between text-[9px] font-black text-[#65676B]">
                                <div className="flex items-center space-x-1 text-[#1877F2]">
                                  <CornerDownLeft size={11} />
                                  <span>回复 @{msg.senderName} 的此条消息</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveInlineReplyMessageId(null)}
                                  className="text-[#8A8D91] hover:text-[#050505] cursor-pointer p-0.5"
                                  title="收起输入框"
                                >
                                  <X size={11} />
                                </button>
                              </div>

                              <div className="flex items-end space-x-1.5">
                                <textarea
                                  rows={1}
                                  autoFocus
                                  placeholder={`输入对 @${msg.senderName} 的回复...`}
                                  value={inlineReplyText}
                                  onChange={(e) => {
                                    setInlineReplyText(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, 28), 100)}px`;
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSendInlineBubbleReply(msg.id);
                                    }
                                  }}
                                  className="flex-1 bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-[3px] px-2 py-1 text-xs text-[#050505] outline-none shadow-2xs placeholder:text-[#8A8D91] resize-none leading-relaxed overflow-y-auto"
                                  style={{ minHeight: '28px', maxHeight: '100px' }}
                                />

                                {/* Quick Inline Emoji Picker */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setShowInlineEmojiPicker(showInlineEmojiPicker === msg.id ? null : msg.id)}
                                    className="p-1 text-[#65676B] hover:text-[#1877F2] hover:bg-white rounded-[3px] border border-transparent hover:border-[#E4E6EB] transition-colors flex items-center justify-center cursor-pointer"
                                    title="插入快捷表情"
                                  >
                                    <Smile size={13} />
                                  </button>

                                  {showInlineEmojiPicker === msg.id && (
                                    <div className="absolute bottom-full right-0 mb-1 bg-white border border-[#E4E6EB] shadow-md rounded-[4px] p-1 flex items-center space-x-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                      {['👍', '✅', '🫡', '💯', '✨', '🤝', '❤️'].map(em => (
                                        <button
                                          key={`inline-em-${em}`}
                                          type="button"
                                          onClick={() => {
                                            setInlineReplyText(prev => prev + em);
                                            setShowInlineEmojiPicker(null);
                                          }}
                                          className="text-xs p-1 hover:bg-[#F0F2F5] hover:scale-115 rounded-[2px] transition-all cursor-pointer leading-none"
                                        >
                                          {em}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleSendInlineBubbleReply(msg.id)}
                                  className="px-2.5 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white text-[9px] font-black rounded-[3px] transition-colors cursor-pointer shrink-0 flex items-center space-x-1 shadow-2xs"
                                >
                                  <Send size={10} />
                                  <span>发送</span>
                                </button>
                              </div>

                              {/* Fast quick-reply chips */}
                              <div className="flex items-center space-x-1 pt-0.5 overflow-x-auto no-scrollbar">
                                <span className="text-[8px] text-[#8A8D91] shrink-0">快捷:</span>
                                {['收到，马上跟进', '已完成评审', '赞同此方案', '需进一步对齐'].map((phrase) => (
                                  <button
                                    key={phrase}
                                    type="button"
                                    onClick={() => setInlineReplyText(phrase)}
                                    className="text-[8px] bg-white hover:bg-[#F0F2F5] text-[#65676B] hover:text-[#1877F2] border border-[#E4E6EB] px-1.5 py-0.5 rounded-[2px] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                                  >
                                    {phrase}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ================= UNIFIED FLOATING EMOJIS & ACTIONS (合并统一的悬浮交互操作条) ================= */}
                          {activeReactionMessageId === msg.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute z-40 -top-8 left-0 sm:left-1 bg-white border border-[#E4E6EB] rounded-[3px] shadow-sm px-1.5 py-0.5 flex items-center space-x-1 animate-in fade-in zoom-in-95 duration-100 whitespace-nowrap max-w-full"
                            >
                              {/* 表情选择区 */}
                              <span className="text-[8px] font-bold text-[#8A8D91] mr-0.5 shrink-0">表情:</span>
                              <div className="flex items-center space-x-0.5 shrink-0">
                                {['👍', '❤️', '💯', '✅', '🫡', '🔥', '👏'].map((emoji, eIdx) => (
                                  <button
                                    key={`ghs-emoji-${emoji}-${eIdx}`}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddEmojiReaction(msg.id, emoji);
                                    }}
                                    className="text-xs p-0.5 hover:bg-[#F0F2F5] hover:scale-125 rounded-[2px] transition-all cursor-pointer leading-none"
                                    title={`添加 ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>

                              <span className="w-[1px] h-3 bg-[#E4E6EB] shrink-0 mx-0.5" />

                              {/* 引用 */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReplyingToMessage(msg);
                                  showToast(`已引用 @${msg.senderName} 的发言`);
                                }}
                                className="flex items-center space-x-1 px-1.5 py-0.5 text-[9px] font-extrabold text-[#65676B] hover:text-[#1877F2] hover:bg-[#F0F2F5] rounded-[2px] transition-colors cursor-pointer shrink-0"
                                title="引用此消息"
                              >
                                <Quote size={10} className="text-[#F5A623]" />
                                <span>引用</span>
                              </button>

                              <span className="w-[1px] h-3 bg-[#E4E6EB] shrink-0" />

                              {/* 回复 */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveInlineReplyMessageId(activeInlineReplyMessageId === msg.id ? null : msg.id);
                                  if (activeInlineReplyMessageId !== msg.id) {
                                    setInlineReplyText('');
                                    showToast(`已在对话框中开启针对 @${msg.senderName} 的即时回复`);
                                  }
                                }}
                                className={`flex items-center space-x-1 px-1.5 py-0.5 text-[9px] font-extrabold rounded-[2px] transition-colors cursor-pointer shrink-0 ${
                                  activeInlineReplyMessageId === msg.id
                                    ? 'bg-[#1877F2] text-white'
                                    : 'text-[#1877F2] hover:bg-[#1877F2]/10'
                                }`}
                                title="在此对话框中回复"
                              >
                                <CornerDownLeft size={10} />
                                <span>回复</span>
                              </button>

                              <span className="w-[1px] h-3 bg-[#E4E6EB] shrink-0" />

                              {/* 关闭 */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveReactionMessageId(null);
                                }}
                                className="p-0.5 text-[#8A8D91] hover:text-[#050505] hover:bg-[#F0F2F5] rounded-[2px] cursor-pointer shrink-0"
                                title="关闭"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          )}

                          {/* Settings Trigger overlay on hover */}
                          <div className="absolute right-1 top-1 opacity-0 group-hover/msg:opacity-100 transition-opacity flex space-x-1 bg-white border border-[#E4E6EB] shadow-xs p-0.5 rounded-[3px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReplyingToMessage(msg);
                                showToast(`已选择引用并回复：${msg.senderName}`);
                              }}
                              className="p-1 hover:bg-[#F5F6F7] text-[#65676B] hover:text-[#1877F2] rounded-[2px]"
                              title="引用回复"
                            >
                              <Quote size={10} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveReactionMessageId(activeReactionMessageId === msg.id ? null : msg.id);
                              }}
                              className="p-1 hover:bg-[#F5F6F7] text-[#65676B] hover:text-[#1877F2] rounded-[2px]"
                              title="快捷表情与操作"
                            >
                              <Smile size={10} />
                            </button>
                          </div>
                        </div>

                        {/* Critical Read Report */}
                        {msg.requestReadReport && (
                          <div className="mt-1 p-2 bg-[#E7F3FF] border border-[#1877F2]/30 rounded-[3px] text-left max-w-sm space-y-1">
                            <div className="flex items-center justify-between text-[9px] font-black text-[#1877F2]">
                              <span>⚠️ 强效消息确认报告</span>
                              <span>✓ 3/4</span>
                            </div>
                            <div className="w-full bg-white/50 h-1 rounded-[1px] overflow-hidden">
                              <div className="bg-[#1877F2] h-full" style={{ width: '75%' }} />
                            </div>
                            <p className="text-[8px] text-[#65676B]">未读：Mia Wang · 请知悉人阅后一键点赞确认。</p>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quote Draft Preview Bar (if active) */}
            {replyingToMessage && (
              <div className="px-4 py-2 border-t border-[#E4E6EB] bg-[#F5F6F7] flex items-center justify-between shrink-0 text-left">
                <div className="text-[10px] text-[#65676B] truncate">
                  <span className="font-extrabold text-[#F5A623]">引用起草中</span>：@{replyingToMessage.senderName} “{replyingToMessage.content}”
                </div>
                <button
                  onClick={() => setReplyingToMessage(null)}
                  className="p-1 hover:bg-[#FAFAFA] text-[#8A8D91] hover:text-red-500 rounded-[2px]"
                >
                  <X size={10} />
                </button>
              </div>
            )}

            {/* Input action bottom bar */}
            <div className="p-3 bg-white border-t border-[#E4E6EB] shrink-0 relative">
              {showPlusMenu && (
                <div className="mb-3 p-3 bg-white border border-[#E4E6EB] rounded-[4px] shadow-sm animate-in slide-in-from-bottom-2 duration-150 text-left">
                  {/* First row: Circular icon buttons with label below */}
                  <div className="grid grid-cols-5 gap-2 pb-3 border-b border-[#F5F6F7]">
                    {[
                      { label: '照片', icon: Image, action: () => { setShowPhotoPicker(true); setShowPlusMenu(false); } },
                      { label: '笔记', icon: Edit3, action: () => { setShowNoteCreator(true); setShowPlusMenu(false); } },
                      { label: '收藏', icon: Bookmark, action: () => { showToast('⭐️ 已调起团队置顶高能收藏夹'); setShowPlusMenu(false); } },
                      { label: '文件', icon: Folder, action: () => { setSelectedTab(GroupTab.FILES); showToast('📁 已无缝跳转至协作文件库，一键分享上传文件'); setShowPlusMenu(false); } },
                      { label: '相机', icon: Camera, action: () => { setShowCameraSimulator(true); setShowPlusMenu(false); } }
                    ].map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={`plus-item-${item.label}`}
                          onClick={item.action}
                          className="flex flex-col items-center justify-center py-1.5 rounded-[4px] hover:bg-[#F5F6F7] cursor-pointer transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] flex items-center justify-center group-hover:scale-105 transition-transform">
                            <IconComp size={18} />
                          </div>
                          <span className="text-[10px] font-bold text-[#65676B] mt-1.5">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Second row: Label and tags */}
                  <div className="pt-2.5">
                    <div className="flex items-center space-x-1 mb-2">
                      <span className="inline-block px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-[#1877F2]/10 text-[#1877F2] rounded-[2px] leading-none">
                        标签
                      </span>
                      <span className="text-[10px] text-[#8A8D91] font-semibold">快速插入消息分类标识</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setDraftMessageType('notice');
                          setNewMessageText(prev => prev.startsWith('【通知】 ') ? prev : '【通知】 ' + prev);
                          showToast('已进入【通知】编辑模式 📢');
                          setShowPlusMenu(false);
                        }}
                        className="px-2.5 py-1 text-[10px] font-black rounded-[4px] border cursor-pointer transition-colors border-[#2ECC71]/40 text-[#2ECC71] bg-[#E8F8F0] hover:bg-[#2ECC71]/20 hover:border-[#2ECC71]"
                      >
                        通知
                      </button>
                      <button
                        onClick={() => {
                          setDraftMessageType('acknowledge');
                          setNewMessageText(prev => prev.startsWith('【知会确认】 ') ? prev : '【知会确认】 ' + prev);
                          showToast('已进入【知会确认】编辑模式 ✍️');
                          setShowPlusMenu(false);
                        }}
                        className="px-2.5 py-1 text-[10px] font-black rounded-[4px] border cursor-pointer transition-colors border-[#F5A623]/40 text-[#F5A623] bg-[#FEF9E7] hover:bg-[#F5A623]/20 hover:border-[#F5A623]"
                      >
                        知会确认
                      </button>
                      <button
                        onClick={() => {
                          setShowPlusMenu(false);
                          setShowTaskMemberPicker(true);
                        }}
                        className="px-2.5 py-1 text-[10px] font-black rounded-[4px] border cursor-pointer transition-colors border-[#1877F2]/40 text-[#1877F2] bg-[#EBF5FB] hover:bg-[#1877F2]/20 hover:border-[#1877F2]"
                      >
                        任务待办
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Draft Message Type Mode Indicator Chip Bar */}
              {draftMessageType !== 'normal' && (
                <div className="mb-2 px-2.5 py-1.5 rounded-[3px] border text-[10px] flex items-center justify-between animate-in slide-in-from-bottom-1 duration-150 text-left bg-[#FAFAFA] border-[#E4E6EB]">
                  <div className="flex items-center space-x-2">
                    <span className={`px-1.5 py-0.5 rounded-[2px] font-black ${
                      draftMessageType === 'notice'
                        ? 'bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30'
                        : draftMessageType === 'acknowledge'
                        ? 'bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30'
                        : 'bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/30'
                    }`}>
                      {draftMessageType === 'notice' ? '📢 通知模式' : draftMessageType === 'acknowledge' ? '✍️ 知会模式' : '📋 任务待办模式'}
                    </span>
                    {draftMessageType === 'task' && (
                      <div className="flex items-center space-x-1">
                        <span className="text-[9px] text-[#65676B] font-bold">
                          接收人：{taskTargetConfig.isAll ? '全员接收' : `指定 ${taskTargetConfig.selectedMemberIds.length} 位成员`}
                        </span>
                        <button
                          onClick={() => setShowTaskMemberPicker(true)}
                          className="text-[9px] text-[#1877F2] font-black hover:underline cursor-pointer ml-1"
                        >
                          修改
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setDraftMessageType('normal');
                      setNewMessageText(prev => prev.replace(/^【(通知|知会确认|任务代办|任务待办)】\s*/, ''));
                      showToast('已退出特殊消息编辑模式');
                    }}
                    className="text-[9px] text-[#8A8D91] hover:text-red-500 font-bold flex items-center space-x-0.5 cursor-pointer"
                  >
                    <X size={10} />
                    <span>取消</span>
                  </button>
                </div>
              )}

              <div className="flex items-end space-x-1.5">
                <button
                  type="button"
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className={`w-8 h-8 rounded-[4px] border flex items-center justify-center cursor-pointer transition-all shrink-0 mb-0.5 ${
                    showPlusMenu
                      ? 'bg-[#1877F2]/15 border-[#1877F2] text-[#1877F2] scale-95'
                      : 'border-[#E4E6EB] hover:border-[#1877F2] text-[#65676B] hover:text-[#1877F2] bg-white'
                  }`}
                  title="添加工具或附件"
                >
                  <Plus size={15} className={`transition-transform duration-200 ${showPlusMenu ? 'rotate-45 text-[#1877F2]' : ''}`} />
                </button>

                <div className="flex-1 min-w-0 bg-white border border-[#E4E6EB] focus-within:border-[#1877F2] focus-within:ring-1 focus-within:ring-[#1877F2]/25 rounded-[4px] px-2.5 py-0.5 transition-all shadow-2xs">
                  <textarea
                    ref={groupChatTextareaRef}
                    rows={1}
                    placeholder="请输入您的工作协作消息... (含有@提及将自动生成内联聚合线程)"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="w-full bg-transparent text-xs text-[#050505] placeholder:text-[#8A8D91] outline-none resize-none leading-relaxed overflow-y-auto scrollbar-thin scrollbar-thumb-[#CED0D5] py-0.5 block"
                    style={{ minHeight: '30px', maxHeight: '150px' }}
                  />
                </div>

                {/* Critical report check toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setRequestCriticalRead(!requestCriticalRead);
                    showToast(requestCriticalRead ? '已取消强效已读确认' : '已选择强效已读模式！发送后将生成阅读进度条 ⚠️');
                  }}
                  className={`w-8 h-8 rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors shrink-0 mb-0.5 ${
                    requestCriticalRead
                      ? 'bg-amber-50 text-[#F5A623] border-[#F5A623]'
                      : 'bg-white text-[#65676B] border-[#E4E6EB] hover:border-[#F5A623]'
                  }`}
                  title="强效已读确认进度条"
                >
                  <Clock size={14} />
                </button>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="h-8 px-2.5 bg-[#1877F2] hover:bg-[#166FE5] active:scale-95 text-white text-[11px] font-bold rounded-[4px] flex items-center space-x-1 cursor-pointer transition-all shrink-0 mb-0.5 shadow-2xs"
                >
                  <Send size={11} />
                  <span>发送</span>
                </button>
              </div>
            </div>

            {/* Task Targeted Member Picker Modal */}
            <TaskMemberPickerModal
              isOpen={showTaskMemberPicker}
              onClose={() => setShowTaskMemberPicker(false)}
              members={members}
              currentUserId={currentUserId}
              onConfirm={(isAll, selectedIds) => {
                setTaskTargetConfig({ isAll, selectedMemberIds: selectedIds });
                setDraftMessageType('task');
                setNewMessageText(prev => prev.startsWith('【任务待办】 ') ? prev : '【任务待办】 ' + prev);
                showToast(isAll ? '已设为全员任务待办 📋' : `已指定 ${selectedIds.length} 位成员为任务接收人 🎯`);
              }}
            />

            {/* Photo Picker Overlay Panel */}
            {showPhotoPicker && (
              <div className="absolute inset-0 bg-black/60 z-30 flex flex-col justify-end animate-in fade-in duration-150">
                <div className="bg-white rounded-t-lg p-4 border-t border-[#E4E6EB] max-h-[80%] flex flex-col text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F5F6F7] mb-3">
                    <h3 className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
                      <Image size={14} className="text-[#1877F2]" />
                      <span>📂 选择高拟真照片发送</span>
                    </h3>
                    <button onClick={() => setShowPhotoPicker(false)} className="text-[#8A8D91] hover:text-[#050505] cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#65676B] mb-3">点击任意照片，直接调取并同步上传发送至小组协作消息：</p>
                  <div className="grid grid-cols-2 gap-2.5 overflow-y-auto max-h-[300px] pr-1">
                    {[
                      { title: '空间姿态遥测状态图', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=350' },
                      { title: '高精度遥感地理轨迹', url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=350' },
                      { title: '父亲常去公园安全监测', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=350' },
                      { title: '行车碰撞雷达热力分析', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=350' }
                    ].map((p, idx) => (
                      <button 
                        key={`photo-sample-${idx}-${p.title}`} 
                        onClick={() => handleSendPhoto(p.url)}
                        className="group relative border border-[#E4E6EB] rounded-[4px] overflow-hidden hover:border-[#1877F2] bg-[#FAFAFA] text-left transition-all cursor-pointer"
                      >
                        <img src={p.url} className="w-full h-24 object-cover" referrerPolicy="no-referrer" />
                        <div className="p-1.5 bg-white">
                          <p className="text-[9px] font-black text-[#050505] truncate">{p.title}</p>
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                          点击发送
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Note Creator Overlay Panel */}
            {showNoteCreator && (
              <div className="absolute inset-0 bg-black/60 z-30 flex flex-col justify-end animate-in fade-in duration-150">
                <div className="bg-white rounded-t-lg p-4 border-t border-[#E4E6EB] max-h-[90%] flex flex-col text-left space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F5F6F7]">
                    <h3 className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
                      <Edit3 size={14} className="text-[#1877F2]" />
                      <span>📝 创建漫游工作笔记</span>
                    </h3>
                    <button onClick={() => setShowNoteCreator(false)} className="text-[#8A8D91] hover:text-[#050505] cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#65676B]">随时记录团队决策、技术标准或紧急提示。创建好后将以精美笔记卡片形式同步发送：</p>
                  
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-[10px] font-bold text-[#65676B] block mb-1">笔记标题</span>
                      <input 
                        type="text" 
                        placeholder="例如：紧急车辆碰撞自救知识库"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        className="w-full bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-[4px] px-2.5 py-1.5 text-xs outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-bold text-[#65676B] block mb-1">详细内容</span>
                      <textarea 
                        rows={5}
                        placeholder="请输入工作笔记详细内容，例如自救步骤或安全守则..."
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        className="w-full bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-[4px] px-2.5 py-1.5 text-xs outline-none resize-none"
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#F5F6F7]">
                    <button 
                      onClick={() => setShowNoteCreator(false)}
                      className="px-3 py-1.5 border border-[#E4E6EB] hover:bg-[#FAFAFA] text-xs font-bold rounded-[4px] cursor-pointer"
                    >
                      取消
                    </button>
                    <button 
                      onClick={() => handleSendNote(newNoteTitle, newNoteContent)}
                      className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-black rounded-[4px] cursor-pointer"
                    >
                      确认发送至聊天
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Simulator Overlay Panel */}
            {showCameraSimulator && (
              <div className="absolute inset-0 bg-black/95 z-30 flex flex-col justify-between p-4 text-white animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-xs font-bold tracking-widest text-[#E4E6EB] uppercase">太空红外安全相机 (SIMULATION)</span>
                  </div>
                  <button onClick={() => setShowCameraSimulator(false)} className="text-[#8A8D91] hover:text-white cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                {/* Camera preview area */}
                <div className="flex-1 my-4 bg-zinc-950 border border-zinc-800 rounded-md overflow-hidden relative flex flex-col items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400" 
                    alt="Camera preview" 
                    className="w-full h-full object-cover opacity-85"
                    referrerPolicy="no-referrer"
                  />
                  {/* Grid Overlay lines */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-white" />
                    <div className="border-r border-white" />
                    <div />
                  </div>
                  {/* Center focus indicator */}
                  <div className="absolute w-12 h-12 border border-dashed border-[#1877F2]/60 rounded-full animate-pulse" />
                  <span className="absolute bottom-2 bg-black/60 px-2 py-0.5 rounded text-[8px] tracking-wide text-zinc-300">
                    已自动调起太空高阶防抖拍照模式
                  </span>
                </div>

                <div className="flex flex-col items-center space-y-3">
                  {/* Big circular shutter trigger */}
                  <button 
                    onClick={() => {
                      handleSendPhoto('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400');
                      setShowCameraSimulator(false);
                    }}
                    className="w-16 h-16 rounded-full border-4 border-white p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-all bg-white/10 cursor-pointer"
                    title="拍照并发送"
                  >
                    <div className="w-full h-full rounded-full bg-white" />
                  </button>
                  <span className="text-[10px] text-zinc-400">点击大圆圈：即刻拍照上传发送</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: FILES (文件库) ==================== */}
        {selectedTab === GroupTab.FILES && !selectedFileForDetails && (
          <div className="p-4 space-y-4 flex flex-col h-full bg-white">
            {/* Search, Filter, and Upload Bar */}
            <div className="flex items-center space-x-2 shrink-0">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8D91]" />
                <input
                  type="text"
                  placeholder="搜索库中文件、文件夹或上传者..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E4E6EB] focus:border-[#5DADE2] rounded-[4px] pl-8 pr-3 py-1.5 text-xs text-[#050505] outline-none"
                />
              </div>
              <button
                onClick={handleUploadFile}
                className="px-3.5 py-1.5 bg-[#5DADE2] hover:bg-[#5DADE2]/95 text-white text-xs font-black rounded-[4px] flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Upload size={13} />
                <span>上传文件</span>
              </button>
            </div>

            {/* Folder / Navigation Breadcrumbs */}
            <div className="flex items-center space-x-2 text-xs border-b border-[#E4E6EB] pb-2 shrink-0">
              <button
                onClick={() => setCurrentFolder('root')}
                className={`font-bold hover:text-[#5DADE2] ${currentFolder === 'root' ? 'text-[#5DADE2]' : 'text-[#65676B]'}`}
              >
                根目录 (Root)
              </button>
              <ChevronRight size={12} className="text-[#8A8D91]" />
              <button
                onClick={() => setCurrentFolder('design')}
                className={`font-bold hover:text-[#5DADE2] ${currentFolder === 'design' ? 'text-[#5DADE2]' : 'text-[#65676B]'}`}
              >
                视觉与UI规范
              </button>
              <span className="text-[#8A8D91] ml-auto text-[10px] font-semibold">
                共 {teamFiles.filter(f => currentFolder === 'root' ? true : f.folder === currentFolder).length} 个资源
              </span>
            </div>

            {/* Virtual Folder Grid (if at root) */}
            {currentFolder === 'root' && searchQuery === '' && (
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div
                  onClick={() => setCurrentFolder('design')}
                  className="p-3 bg-white border border-[#E4E6EB] hover:border-[#5DADE2] rounded-[4px] flex items-center space-x-2.5 cursor-pointer transition-all"
                >
                  <Folder className="w-8 h-8 text-[#F5A623] shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-black text-[#050505] truncate">视觉与UI规范</p>
                    <p className="text-[9px] text-[#65676B]">1个文档 · 4个版本</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setCurrentFolder('code');
                    showToast('已进入「代码基准报告」临时文件夹 (目前为空)');
                  }}
                  className="p-3 bg-white border border-[#E4E6EB] hover:border-[#5DADE2] rounded-[4px] flex items-center space-x-2.5 cursor-pointer transition-all"
                >
                  <Folder className="w-8 h-8 text-[#8A8D91] shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-black text-[#050505] truncate">架构协议</p>
                    <p className="text-[9px] text-[#65676B]">0个文档 · 无历史记录</p>
                  </div>
                </div>
              </div>
            )}

            {/* File List Stream */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pb-10">
              {teamFiles
                .filter(file => {
                  if (currentFolder !== 'root' && file.folder !== currentFolder) return false;
                  if (searchQuery.trim() !== '') {
                    return file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           file.uploader.toLowerCase().includes(searchQuery.toLowerCase());
                  }
                  return true;
                })
                .map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileForDetails(file)}
                    className="p-3 bg-white border border-[#E4E6EB] hover:border-[#5DADE2] rounded-[4px] flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-8 h-8 border border-[#E4E6EB] rounded-[4px] bg-[#FAFAFA] text-[#65676B] group-hover:text-[#5DADE2] group-hover:border-[#5DADE2] flex items-center justify-center shrink-0 font-bold text-[10px] uppercase">
                        {file.type}
                      </div>
                      <div className="truncate text-left">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-black text-[#050505] truncate">{file.name}</p>
                          <span className="px-1 py-0.2 text-[8px] font-black bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20 rounded-[2px]">
                            {file.version}
                          </span>
                        </div>
                        <p className="text-[9px] text-[#65676B] mt-0.5">
                          大小: {file.size} · 上传者: {file.uploader} · 更新: {file.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {file.annotationsCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[8px] font-black bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20 rounded-[2px]">
                          ✏️ {file.annotationsCount} 批注
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast(`正在下载安全加密副本: ${file.name} 📥`);
                        }}
                        className="w-7 h-7 rounded-[4px] border border-[#E4E6EB] hover:border-[#5DADE2] hover:text-[#5DADE2] flex items-center justify-center transition-all bg-white"
                        title="下载"
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 2 DETAIL: FILE DEEP COLLABORATION WORKSPACE ==================== */}
        {selectedTab === GroupTab.FILES && selectedFileForDetails && (
          <div className="flex flex-col h-full bg-white">
            
            {/* Header with back navigation inside files */}
            <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between bg-[#FAFAFA] shrink-0">
              <button
                onClick={() => {
                  setSelectedFileForDetails(null);
                  setActiveAnnotationTool(null);
                }}
                className="flex items-center space-x-1 text-xs font-black text-[#65676B] hover:text-[#050505]"
              >
                <ChevronLeft size={16} />
                <span>返回文件列表</span>
              </button>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#8A8D91] block">当前文件协作空间</span>
                <span className="text-xs font-black text-[#050505] truncate max-w-[200px] block">{selectedFileForDetails.name}</span>
              </div>
            </div>

            {/* Inner Tabs: Comments, Version History, Annotations */}
            <div className="px-4 py-2 border-b border-[#E4E6EB] shrink-0 bg-white">
              <div className="grid grid-cols-3 gap-1 p-0.5 border border-[#E4E6EB] bg-[#FAFAFA] rounded-[3px]">
                <button
                  onClick={() => setFileDetailTab('comments')}
                  className={`py-1 text-[10px] font-bold rounded-[2px] text-center ${
                    fileDetailTab === 'comments' ? 'bg-[#5DADE2] text-white' : 'text-[#65676B]'
                  }`}
                >
                  💬 协同评论 ({fileComments[selectedFileForDetails.id]?.length || 0})
                </button>
                <button
                  onClick={() => setFileDetailTab('history')}
                  className={`py-1 text-[10px] font-bold rounded-[2px] text-center ${
                    fileDetailTab === 'history' ? 'bg-[#5DADE2] text-white' : 'text-[#65676B]'
                  }`}
                >
                  ⏳ 版本变迁 ({fileVersions[selectedFileForDetails.id]?.length || 1})
                </button>
                <button
                  onClick={() => setFileDetailTab('annotate')}
                  className={`py-1 text-[10px] font-bold rounded-[2px] text-center ${
                    fileDetailTab === 'annotate' ? 'bg-[#5DADE2] text-white' : 'text-[#65676B]'
                  }`}
                >
                  ✏️ 划线批注 ({selectedFileForDetails.annotationsCount})
                </button>
              </div>
            </div>

            {/* Content Area swapping depending on file detail tab */}
            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
              
              {/* FILE DETAIL TAB 1: COMMENTS */}
              {fileDetailTab === 'comments' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {(fileComments[selectedFileForDetails.id] || []).map((comm) => (
                      <div key={`file-comm-${comm.id}`} className="flex items-start space-x-2.5 p-2.5 bg-[#FAFAFA] border border-[#E4E6EB] rounded-[4px]">
                        <img src={comm.userAvatar} className="w-7 h-7 rounded-[4px] object-cover border border-[#E4E6EB]" alt="avatar" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-[#050505]">{comm.userName}</span>
                            <span className="text-[9px] text-[#8A8D91]">{comm.time}</span>
                          </div>
                          <p className="text-[11px] text-[#65676B] mt-1 leading-normal text-left">{comm.text}</p>
                        </div>
                      </div>
                    ))}

                    {(!fileComments[selectedFileForDetails.id] || fileComments[selectedFileForDetails.id].length === 0) && (
                      <div className="py-8 text-center text-[#8A8D91]">
                        <MessageSquare className="w-8 h-8 mx-auto mb-1 stroke-[1.5]" />
                        <p className="text-[11px]">暂无针对此文件的特定讨论评论</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#E4E6EB]">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="发表针对此文件的协作意见..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        className="flex-1 bg-white border border-[#E4E6EB] focus:border-[#5DADE2] rounded-[4px] px-3 py-1 text-xs text-[#050505] outline-none"
                      />
                      <button
                        onClick={handleAddComment}
                        className="px-3 bg-[#5DADE2] hover:bg-[#5DADE2]/90 text-white text-[10px] font-black rounded-[4px]"
                      >
                        评论
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FILE DETAIL TAB 2: VERSION HISTORY */}
              {fileDetailTab === 'history' && (
                <div className="space-y-4">
                  <div className="relative pl-4 border-l border-[#E4E6EB] space-y-5 ml-2 pt-1 text-left">
                    {(fileVersions[selectedFileForDetails.id] || [
                      { id: 'v_def', version: 'v1.0', updater: selectedFileForDetails.uploader, time: selectedFileForDetails.date + ' 10:00', description: '上传了初始协作版本。', isCurrent: true }
                    ]).map((ver) => (
                      <div key={`file-ver-${ver.id}`} className="relative">
                        {/* Dot */}
                        <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                          ver.isCurrent ? 'bg-[#2ECC71] border-white ring-2 ring-[#2ECC71]/30' : 'bg-[#E4E6EB] border-white'
                        }`} />
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-[#050505]">{ver.version}</span>
                            {ver.isCurrent && (
                              <span className="px-1 py-0.2 text-[8px] font-black bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20 rounded-[2px]">
                                当前版本
                              </span>
                            )}
                            <span className="text-[9px] text-[#8A8D91]">{ver.time}</span>
                          </div>
                          <p className="text-[10px] text-[#65676B] font-bold mt-1">更新人: {ver.updater}</p>
                          <p className="text-[11px] text-[#65676B] mt-0.5 leading-relaxed">{ver.description}</p>
                          
                          {!ver.isCurrent && (
                            <button
                              onClick={() => {
                                showToast(`已将文件版本回滚还原至 ${ver.version} ⏳`);
                              }}
                              className="mt-2 text-[9px] text-[#5DADE2] font-black hover:underline"
                            >
                              一键回滚/还原此版本
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FILE DETAIL TAB 3: ANNOTATION WORKSPACE (划线批注) */}
              {fileDetailTab === 'annotate' && (
                <div className="space-y-4">
                  {/* Annotation toolbar */}
                  <div className="p-2 border border-[#E4E6EB] bg-[#FAFAFA] rounded-[4px] flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-black text-[#65676B]">批注排型工具栏</span>
                    <div className="flex space-x-1">
                      {[
                        { id: 'highlight', icon: Highlighter, label: '高亮' },
                        { id: 'underline', icon: Type, label: '下划线' },
                        { id: 'note', icon: Bookmark, label: '附言' }
                      ].map((tool) => {
                        const isToolActive = activeAnnotationTool === tool.id;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => {
                              setActiveAnnotationTool(isToolActive ? null : (tool.id as any));
                              showToast(`已选用批注工具: ${tool.label}，随时在下方文本流划选添加`);
                            }}
                            className={`px-2 py-1 border rounded-[2px] flex items-center space-x-1 text-[9px] font-black transition-colors ${
                              isToolActive
                                ? 'bg-[#5DADE2] text-white border-[#5DADE2]'
                                : 'bg-white text-[#65676B] border-[#E4E6EB] hover:border-[#5DADE2]'
                            }`}
                          >
                            <tool.icon size={10} />
                            <span>{tool.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Inline Document Page Viewer */}
                  <div className="p-4 bg-[#FAFAFA] border border-[#E4E6EB] rounded-[4px] min-h-[160px] relative text-left">
                    <h3 className="text-xs font-black text-[#050505] border-b border-[#E4E6EB] pb-2 mb-2">文件核心章节预览与划词区间</h3>
                    <p className="text-xs text-[#65676B] leading-relaxed relative z-10">
                      Stellar 设计方案主要聚焦于大地图社交场景下高能流控制机制。在全新的
                      <span className="bg-[#F5A623]/20 border-b border-[#F5A623] text-[#050505] px-0.5 font-bold cursor-pointer" title="Sarah Chen 的高亮批注">
                        “所有的卡片圆角都限制在 4px 以内，配合高对比度白色底”
                      </span>
                      规范中，我们致力于消除一切非必要的圆角阴影。
                      针对团队的特色标识与业务流程，我们统一了
                      <span className="border-b border-[#5DADE2] text-[#050505] px-0.5 cursor-pointer font-bold" title="Hui Zhang 的下划线批注">
                        “无药丸、无大圆角、1.5px 细线、round cap/join”
                      </span>
                      的设计语言。
                    </p>

                    {/* Right-side absolute floating notes indicators */}
                    <div className="mt-4 pt-3 border-t border-[#E4E6EB] space-y-2">
                      <p className="text-[10px] font-black text-[#65676B]">活动批注详情 (划词列表)</p>
                      {annotations.map((ann) => (
                        <div key={ann.id} className="p-2 bg-white border border-[#E4E6EB] rounded-[2px] text-[10px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-[#5DADE2]">
                              {ann.type === 'highlight' ? '🟡 高亮划词' : ann.type === 'underline' ? '🔵 下划线' : '🟢 附言段'}
                            </span>
                            <span className="text-[9px] text-[#8A8D91]">{ann.author}</span>
                          </div>
                          <p className="text-gray-800 font-medium text-left">“{ann.text}”</p>
                          {ann.content && <p className="text-[#65676B] bg-[#FAFAFA] p-1 border-l-2 border-[#F5A623] mt-1 text-left">{ann.content}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAddAnnotation}
                    className="w-full py-1.5 bg-[#5DADE2] hover:bg-[#5DADE2]/90 text-white text-xs font-black rounded-[4px] flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Plus size={12} />
                    <span>模拟在此段落划词批注</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ==================== TAB: MIND_MAP (思维导图共创 & 无限画布) ==================== */}
        {selectedTab === GroupTab.MIND_MAP && (
          <div className="flex flex-col h-full bg-white relative select-none">
            
            {/* Header / Sub Toolbar with View Mode Switcher */}
            <div className="px-3 py-2 border-b border-[#E4E6EB] bg-[#F5F6F7] flex flex-wrap items-center justify-between gap-2 shrink-0 text-left">
              
              {/* Left: Title & Segmented View Switcher */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 text-xs font-black text-[#050505] shrink-0">
                  <GitBranch size={15} className="text-[#1877F2]" />
                  <span className="truncate max-w-[180px] sm:max-w-none">Stellar V4.0 思维导图共创空间</span>
                </div>

                {/* View Mode Toggle: Canvas vs Outline */}
                <div className="flex items-center bg-[#E4E6EB] p-0.5 rounded-[4px] border border-[#CED0D4] shrink-0">
                  <button
                    onClick={() => setActiveMindMapView('canvas')}
                    className={`px-2 py-0.5 text-[9px] font-black rounded-[2px] transition-all flex items-center space-x-1 ${
                      activeMindMapView === 'canvas'
                        ? 'bg-white text-[#1877F2] shadow-2xs'
                        : 'text-[#65676B] hover:text-[#050505]'
                    }`}
                  >
                    <Compass size={11} />
                    <span>🎨 协同画布</span>
                  </button>
                  <button
                    onClick={() => setActiveMindMapView('outline')}
                    className={`px-2 py-0.5 text-[9px] font-black rounded-[2px] transition-all flex items-center space-x-1 ${
                      activeMindMapView === 'outline'
                        ? 'bg-white text-[#1877F2] shadow-2xs'
                        : 'text-[#65676B] hover:text-[#050505]'
                    }`}
                  >
                    <Layers size={11} />
                    <span>📋 属性与工作流</span>
                  </button>
                </div>
              </div>

              {/* Right: Quick Action Triggers */}
              <div className="flex items-center space-x-1.5">
                {onOpenStellarWorkspace && (
                  <button
                    onClick={onOpenStellarWorkspace}
                    className="px-2.5 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white text-[10px] font-black rounded-[4px] flex items-center space-x-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                    title="在全屏全功能 Stellar 工作台中无限协同"
                  >
                    <Compass size={12} />
                    <span>进入 Stellar 协同工作台</span>
                  </button>
                )}

                <button
                  onClick={() => setShowAddStickyModal(true)}
                  className="px-2 py-1 bg-white hover:bg-[#FAFAFA] border border-[#E4E6EB] hover:border-[#1877F2] text-[#050505] text-[10px] font-bold rounded-[4px] flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                  title="添加便签贴纸"
                >
                  <StickyNote size={11} className="text-amber-500" />
                  <span className="hidden sm:inline">贴便签</span>
                </button>

                <button
                  onClick={handleAIExtendMindMap}
                  className="px-2 py-1 bg-white hover:bg-[#FAFAFA] border border-[#E4E6EB] hover:border-[#1877F2] text-[#1877F2] text-[10px] font-black rounded-[4px] flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                  title="AI 智能拓扑扩展分支"
                >
                  <Sparkles size={11} className="text-[#1877F2]" />
                  <span className="hidden sm:inline">AI 拓扑拓展</span>
                </button>

                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="px-2.5 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white text-[10px] font-black rounded-[4px] flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus size={11} />
                  <span>指派共创</span>
                </button>
              </div>

            </div>

            {/* ==================== VIEW 1: FULL INFINITE CANVAS ==================== */}
            {activeMindMapView === 'canvas' && (
              <div className="flex-1 flex flex-col relative overflow-hidden bg-[#F5F6F7]">
                
                {/* Floating Canvas Top Toolbar */}
                <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
                  
                  {/* Left tool controllers */}
                  <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-xs border border-[#E4E6EB] p-1 rounded-[4px] shadow-xs pointer-events-auto">
                    {/* Tool: Select Mode */}
                    <button
                      onClick={() => setCanvasMode('select')}
                      className={`p-1.5 rounded-[2px] border text-[9px] font-black flex items-center space-x-1 transition-all ${
                        canvasMode === 'select'
                          ? 'bg-[#1877F2] text-white border-[#1877F2]'
                          : 'bg-white text-[#65676B] border-transparent hover:border-[#E4E6EB]'
                      }`}
                      title="选择与拖拽节点"
                    >
                      <MousePointer size={12} />
                      <span className="hidden md:inline">选择</span>
                    </button>

                    {/* Tool: Pan Mode */}
                    <button
                      onClick={() => setCanvasMode('pan')}
                      className={`p-1.5 rounded-[2px] border text-[9px] font-black flex items-center space-x-1 transition-all ${
                        canvasMode === 'pan'
                          ? 'bg-[#1877F2] text-white border-[#1877F2]'
                          : 'bg-white text-[#65676B] border-transparent hover:border-[#E4E6EB]'
                      }`}
                      title="抓手漫游画布"
                    >
                      <Hand size={12} />
                      <span className="hidden md:inline">抓手</span>
                    </button>

                    <div className="h-4 w-[1px] bg-[#E4E6EB]" />

                    {/* Quick Add Child Node */}
                    <button
                      onClick={() => {
                        const targetId = selectedNodeId || 'root';
                        handleAddMindMapNode(targetId);
                      }}
                      className="px-2 py-1 bg-[#FAFAFA] hover:bg-white border border-[#E4E6EB] hover:border-[#1877F2] text-[9px] font-black text-[#1877F2] rounded-[2px] flex items-center space-x-1 cursor-pointer"
                      title="为当前选中节点添加子分支"
                    >
                      <Plus size={11} />
                      <span>添加子分支</span>
                    </button>

                    {/* Grid Style Toggle */}
                    <button
                      onClick={() => {
                        setCanvasGridStyle(prev => prev === 'dots' ? 'grid' : prev === 'grid' ? 'clean' : 'dots');
                      }}
                      className="p-1.5 bg-[#FAFAFA] hover:bg-white border border-[#E4E6EB] text-[#65676B] rounded-[2px] text-[9px] font-bold"
                      title={`网格样式: ${canvasGridStyle}`}
                    >
                      <Palette size={11} />
                    </button>
                  </div>

                  {/* Right Zoom & Viewport Controllers */}
                  <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-xs border border-[#E4E6EB] p-1 rounded-[4px] shadow-xs pointer-events-auto">
                    <button
                      onClick={handleZoomOut}
                      className="p-1 hover:bg-[#F5F6F7] text-[#65676B] hover:text-[#050505] rounded-[2px] cursor-pointer"
                      title="缩小 (-)"
                    >
                      <ZoomOut size={13} />
                    </button>
                    
                    <span className="text-[10px] font-black text-[#050505] font-mono px-1 min-w-[38px] text-center">
                      {Math.round(canvasZoom * 100)}%
                    </span>

                    <button
                      onClick={handleZoomIn}
                      className="p-1 hover:bg-[#F5F6F7] text-[#65676B] hover:text-[#050505] rounded-[2px] cursor-pointer"
                      title="放大 (+)"
                    >
                      <ZoomIn size={13} />
                    </button>

                    <div className="h-4 w-[1px] bg-[#E4E6EB]" />

                    <button
                      onClick={handleResetCanvasView}
                      className="px-1.5 py-0.5 hover:bg-[#F5F6F7] text-[#1877F2] text-[9px] font-black rounded-[2px] flex items-center space-x-1 cursor-pointer"
                      title="居中重置视野"
                    >
                      <RotateCcw size={10} />
                      <span className="hidden sm:inline">复位</span>
                    </button>
                  </div>

                </div>

                {/* The Infinite Canvas Interactive Area */}
                <div
                  className={`flex-1 w-full h-full relative overflow-hidden select-none transition-colors ${
                    canvasMode === 'pan' ? (isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
                  } ${
                    canvasGridStyle === 'dots'
                      ? 'bg-white bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]'
                      : canvasGridStyle === 'grid'
                      ? 'bg-white bg-[linear-gradient(to_right,#E4E6EB_1px,transparent_1px),linear-gradient(to_bottom,#E4E6EB_1px,transparent_1px)] [background-size:24px_24px]'
                      : 'bg-white'
                  }`}
                  onMouseDown={(e) => {
                    // Only start canvas pan if clicking directly on background
                    if ((e.target as HTMLElement).closest('.mind-map-node-card')) return;
                    setIsDraggingCanvas(true);
                    setCanvasDragStart({ x: e.clientX - canvasPan.x, y: e.clientY - canvasPan.y });
                  }}
                  onMouseMove={(e) => {
                    if (isDraggingCanvas) {
                      setCanvasPan({
                        x: e.clientX - canvasDragStart.x,
                        y: e.clientY - canvasDragStart.y
                      });
                    } else if (draggingNodeId && nodeDragStart) {
                      const deltaX = (e.clientX - nodeDragStart.mouseX) / canvasZoom;
                      const deltaY = (e.clientY - nodeDragStart.mouseY) / canvasZoom;
                      setMindMapNodes(prev => prev.map(node => {
                        if (node.id === draggingNodeId) {
                          return {
                            ...node,
                            x: Math.round(nodeDragStart.initialNodeX + deltaX),
                            y: Math.round(nodeDragStart.initialNodeY + deltaY)
                          };
                        }
                        return node;
                      }));
                    }
                  }}
                  onMouseUp={() => {
                    setIsDraggingCanvas(false);
                    setDraggingNodeId(null);
                    setNodeDragStart(null);
                  }}
                  onTouchStart={(e) => {
                    if ((e.target as HTMLElement).closest('.mind-map-node-card')) return;
                    const touch = e.touches[0];
                    setIsDraggingCanvas(true);
                    setCanvasDragStart({ x: touch.clientX - canvasPan.x, y: touch.clientY - canvasPan.y });
                  }}
                  onTouchMove={(e) => {
                    if (isDraggingCanvas && e.touches.length > 0) {
                      const touch = e.touches[0];
                      setCanvasPan({
                        x: touch.clientX - canvasDragStart.x,
                        y: touch.clientY - canvasDragStart.y
                      });
                    }
                  }}
                  onTouchEnd={() => {
                    setIsDraggingCanvas(false);
                    setDraggingNodeId(null);
                    setNodeDragStart(null);
                  }}
                >
                  
                  {/* Canvas Scaled Content Matrix */}
                  <div
                    style={{
                      transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
                      transformOrigin: '0 0',
                      width: '2400px',
                      height: '1600px',
                      position: 'absolute',
                      left: 0,
                      top: 0
                    }}
                  >
                    
                    {/* SVG Connecting Bezier Lines Layer */}
                    <svg className="absolute inset-0 pointer-events-none w-full h-full">
                      {mindMapNodes.map(node => {
                        if (!node.parentId || node.isSticky) return null;
                        const parent = mindMapNodes.find(n => n.id === node.parentId);
                        if (!parent) return null;

                        const isLeft = node.x < parent.x;
                        const startX = isLeft ? parent.x : parent.x + 200;
                        const startY = parent.y + 26;
                        const endX = isLeft ? node.x + 190 : node.x;
                        const endY = node.y + 26;

                        const dx = Math.abs(endX - startX) * 0.5;
                        const controlX1 = isLeft ? startX - dx : startX + dx;
                        const controlY1 = startY;
                        const controlX2 = isLeft ? endX + dx : endX - dx;
                        const controlY2 = endY;

                        const isLineActive = selectedNodeId === node.id || selectedNodeId === parent.id;

                        return (
                          <g key={`line-${node.id}`}>
                            <path
                              d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                              fill="none"
                              stroke={isLineActive ? "#1877F2" : "#94A3B8"}
                              strokeWidth={isLineActive ? 2.5 : 1.5}
                              strokeDasharray={node.status === 'planned' ? "4,4" : undefined}
                              className="transition-colors duration-200"
                            />
                            {/* Animated Flow Packet Indicator */}
                            <circle r={isLineActive ? 3.5 : 2.5} fill={isLineActive ? "#1877F2" : "#64748B"}>
                              <animateMotion
                                path={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                                dur="2.5s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Nodes Layer */}
                    {mindMapNodes.map(node => {
                      const isSelected = selectedNodeId === node.id;
                      const isRoot = node.id === 'root';

                      // Render Sticky Note Variant
                      if (node.isSticky) {
                        const stickyBg = 
                          node.stickyColor === 'yellow' ? 'bg-amber-50 border-amber-300 text-amber-950' :
                          node.stickyColor === 'blue' ? 'bg-sky-50 border-sky-300 text-sky-950' :
                          node.stickyColor === 'green' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
                          'bg-purple-50 border-purple-300 text-purple-950';

                        return (
                          <div
                            key={`sticky-node-${node.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNodeId(node.id);
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setSelectedNodeId(node.id);
                              setDraggingNodeId(node.id);
                              setNodeDragStart({
                                mouseX: e.clientX,
                                mouseY: e.clientY,
                                initialNodeX: node.x,
                                initialNodeY: node.y
                              });
                            }}
                            style={{
                              left: `${node.x}px`,
                              top: `${node.y}px`,
                              width: '210px'
                            }}
                            className={`mind-map-node-card absolute p-3 border rounded-[4px] shadow-xs cursor-move transition-shadow ${stickyBg} ${
                              isSelected ? 'ring-2 ring-[#1877F2]' : 'hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-black/10 pb-1 mb-1.5">
                              <span className="text-[9px] font-black uppercase flex items-center space-x-1">
                                <StickyNote size={10} />
                                <span>便签 · @{node.author || '成员'}</span>
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMindMapNode(node.id);
                                }}
                                className="text-black/40 hover:text-red-600 p-0.5"
                                title="删除便签"
                              >
                                <X size={10} />
                              </button>
                            </div>
                            <p className="text-[10px] font-medium leading-relaxed break-words">{node.text}</p>
                          </div>
                        );
                      }

                      // Render Standard Mind Map Node
                      const categoryPill = 
                        node.category === 'core' ? { bg: 'bg-[#1877F2]/10', text: 'text-[#1877F2]', border: 'border-[#1877F2]/30', label: '核心架构' } :
                        node.category === 'map' ? { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30', label: '时空定位' } :
                        node.category === 'chat' ? { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30', label: '协作消息' } :
                        node.category === 'canvas' ? { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30', label: '矢量画布' } :
                        { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30', label: '安全审计' };

                      return (
                        <div
                          key={`map-node-${node.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNodeId(node.id);
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            handleEditMindMapNode(node.id);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setSelectedNodeId(node.id);
                            if (canvasMode === 'select') {
                              setDraggingNodeId(node.id);
                              setNodeDragStart({
                                mouseX: e.clientX,
                                mouseY: e.clientY,
                                initialNodeX: node.x,
                                initialNodeY: node.y
                              });
                            }
                          }}
                          style={{
                            left: `${node.x}px`,
                            top: `${node.y}px`,
                            width: isRoot ? '220px' : '190px'
                          }}
                          className={`mind-map-node-card absolute p-2.5 rounded-[4px] border transition-all text-left bg-white shadow-2xs group cursor-pointer ${
                            isSelected
                              ? 'border-[#1877F2] ring-2 ring-[#1877F2]/25 z-30'
                              : isRoot
                              ? 'border-[#1877F2] hover:shadow-xs z-20'
                              : 'border-[#E4E6EB] hover:border-[#1877F2] z-10'
                          }`}
                        >
                          
                          {/* Top Tag & Status */}
                          <div className="flex items-center justify-between pb-1 border-b border-[#F0F2F5] mb-1.5">
                            <span className={`px-1.5 py-0.2 rounded-[2px] text-[8px] font-black uppercase border ${categoryPill.bg} ${categoryPill.text} ${categoryPill.border}`}>
                              {node.tag || categoryPill.label}
                            </span>

                            <div className="flex items-center space-x-1">
                              {node.status === 'done' && (
                                <span className="w-2 h-2 rounded-full bg-[#2ECC71]" title="状态：已就绪" />
                              )}
                              {node.status === 'wip' && (
                                <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" title="状态：进行中" />
                              )}
                              {node.status === 'planned' && (
                                <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" title="状态：规划中" />
                              )}
                              <Move size={11} className="text-[#8A8D91] opacity-0 group-hover:opacity-100 cursor-move shrink-0" />
                            </div>
                          </div>

                          {/* Node Main Title */}
                          <p className={`text-[10.5px] font-extrabold leading-snug break-words ${
                            isRoot ? 'text-[#1877F2]' : 'text-[#050505]'
                          }`}>
                            {node.text}
                          </p>

                          {/* Node Footer Stats */}
                          <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#F0F2F5] text-[8.5px] text-[#8A8D91] font-bold">
                            <div className="flex items-center space-x-1.5">
                              {node.comments && node.comments.length > 0 && (
                                <span className="flex items-center space-x-0.5 text-[#1877F2]" title="批注意见">
                                  <MessageSquare size={11} className="shrink-0" />
                                  <span>{node.comments.length}</span>
                                </span>
                              )}
                              {node.votes && node.votes > 0 ? (
                                <span className="flex items-center space-x-0.5 text-[#2ECC71]" title="共识赞同票">
                                  <ThumbsUp size={11} className="shrink-0" />
                                  <span>{node.votes}</span>
                                </span>
                              ) : null}
                            </div>

                            {node.hasVotePoll && (
                              <span className="text-[#F5A623] px-1 bg-amber-50 rounded-[2px] text-[7.5px]" title="正在表决">
                                🗳️ 表决中
                              </span>
                            )}
                          </div>

                          {/* Floating Context Quick Action Bar over selected node */}
                          {isSelected && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-1/2 -translate-x-1/2 -top-8 bg-white border border-[#E4E6EB] px-1.5 py-1 rounded-[4px] shadow-sm flex items-center space-x-1 whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-100"
                            >
                              <button
                                onClick={() => handleAddMindMapNode(node.id)}
                                className="px-1.5 py-0.5 bg-[#1877F2] text-white text-[8px] font-black rounded-[2px] hover:bg-[#166FE5] flex items-center space-x-0.5"
                                title="添加子分支"
                              >
                                <Plus size={11} className="shrink-0" />
                                <span>子分支</span>
                              </button>
                              <button
                                onClick={() => handleEditMindMapNode(node.id)}
                                className="px-1.5 py-0.5 bg-[#FAFAFA] hover:bg-[#F0F2F5] text-[#050505] text-[8px] font-bold rounded-[2px] border border-[#E4E6EB]"
                                title="重命名"
                              >
                                ✏️ 改名
                              </button>
                              <button
                                onClick={() => handleVoteNode(node.id)}
                                className="px-1.5 py-0.5 bg-[#FAFAFA] hover:bg-[#F0F2F5] text-[#2ECC71] text-[8px] font-bold rounded-[2px] border border-[#E4E6EB]"
                                title="赞同投票"
                              >
                                👍 赞
                              </button>
                              <button
                                onClick={() => handleAddNodeComment(node.id)}
                                className="px-1.5 py-0.5 bg-[#FAFAFA] hover:bg-[#F0F2F5] text-[#1877F2] text-[8px] font-bold rounded-[2px] border border-[#E4E6EB]"
                                title="批注意见"
                              >
                                💬 批注
                              </button>
                              {!isRoot && (
                                <button
                                  onClick={() => handleDeleteMindMapNode(node.id)}
                                  className="p-1 hover:bg-red-50 text-[#8A8D91] hover:text-red-600 rounded-[2px]"
                                  title="删除分支"
                                >
                                  <Trash2 size={11} className="shrink-0" />
                                </button>
                              )}
                            </div>
                          )}

                        </div>
                      );
                    })}

                    {/* Live Collaborators Simulated Cursors */}
                    {liveCursors.map(cursor => (
                      <div
                        key={cursor.id}
                        style={{
                          left: `${cursor.x}px`,
                          top: `${cursor.y}px`,
                        }}
                        className="absolute pointer-events-none transition-all duration-700 ease-out z-40"
                      >
                        <svg className="w-5 h-5 drop-shadow-sm" viewBox="0 0 24 24" fill="none">
                          <path d="M4.5 3V19L9.13 14.37L14.63 21L17.5 19.37L12 12.75L17.5 12.13L4.5 3Z" fill={cursor.color} stroke="white" strokeWidth="1.5" />
                        </svg>
                        
                        <div
                          style={{ backgroundColor: cursor.color }}
                          className="ml-3 mt-1 px-1.5 py-0.5 text-[8px] font-black text-white rounded-[2px] shadow-xs flex items-center space-x-1 whitespace-nowrap"
                        >
                          <span className="w-1 h-1 rounded-full bg-white inline-block animate-ping" />
                          <span>{cursor.name}</span>
                        </div>
                      </div>
                    ))}

                  </div>

                </div>

                {/* Floating Bottom Quality Telemetry Bar */}
                <div className="absolute left-3 bottom-3 z-20 flex items-center space-x-2 bg-white/95 backdrop-blur-xs border border-[#E4E6EB] px-2.5 py-1.5 rounded-[4px] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#2ECC71] inline-block animate-pulse" />
                  <span className="text-[9px] font-black text-[#050505]">P2P 实时协同就绪</span>
                  <span className="text-[8px] text-[#8A8D91] border-l border-[#E4E6EB] pl-2">ping 12ms · 3人在线漫游</span>
                  <button
                    onClick={() => setActiveMindMapView('outline')}
                    className="text-[9px] font-black text-[#1877F2] hover:underline cursor-pointer border-l border-[#E4E6EB] pl-2"
                  >
                    查看详情大纲 →
                  </button>
                </div>

              </div>
            )}

            {/* ==================== VIEW 2: SPLIT / OUTLINE & WORKFLOW ==================== */}
            {activeMindMapView === 'outline' && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden text-left bg-[#FAFAFA]">
                
                {/* Left Outline & Workflow Column */}
                <div className="w-full md:w-[340px] border-r border-[#E4E6EB] flex flex-col h-full bg-white shrink-0 overflow-y-auto">
                  
                  {/* 👥 多人实时协作与指派卡片 */}
                  <div className="p-3 border-b border-[#E4E6EB] bg-white space-y-2">
                    <h4 className="text-[10px] font-black text-[#65676B] uppercase tracking-wider flex items-center space-x-1.5">
                      <Users size={12} className="text-[#1877F2]" />
                      <span>多人在线协作状态</span>
                    </h4>
                    
                    <div className="flex items-center space-x-2 pb-1">
                      <div className="flex -space-x-1.5">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" title="Hui Zhang (您)" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" title="Sarah Chen" className="w-6 h-6 rounded-full border-2 border-white object-cover animate-pulse" />
                        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" title="Alex Mercer" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                      </div>
                      <span className="text-[10px] text-[#65676B] font-extrabold">3 人在线漫游画布</span>
                    </div>

                    {/* Collaborative request flow simulation */}
                    <div className="p-2.5 border border-[#E4E6EB] bg-[#FAFAFA] rounded-[3px] text-[10px]">
                      <p className="font-extrabold text-[#050505] flex items-center space-x-1 mb-1">
                        <Sparkles size={11} className="text-[#F5A623]" />
                        <span>多人共创工作流</span>
                      </p>

                      {requestStatus === 'none' && (
                        <div className="space-y-1.5">
                          <p className="text-[#65676B] text-[9px]">当前没有活跃的他人指派。您可以快速指派设计与技术骨干共同编辑。</p>
                          <button
                            onClick={() => setIsRequestModalOpen(true)}
                            className="w-full py-1.5 bg-white border border-[#E4E6EB] hover:border-[#1877F2] text-[9px] font-black text-[#1877F2] text-center rounded-[3px] cursor-pointer transition-colors shadow-2xs"
                          >
                            发起多人共创修改指派 🚀
                          </button>
                        </div>
                      )}

                      {requestStatus === 'pending' && (
                        <div className="space-y-1 bg-amber-50 p-2 border border-dashed border-amber-300 rounded-[3px]">
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="font-extrabold text-[#F5A623]">📨 待确认接单</span>
                            <span className="text-[#8A8D91]">刚刚</span>
                          </div>
                          <p className="text-[9px] text-gray-700">
                            已派发修改诉求给 <span className="font-black">@{members.find(m => m.id === requestAssignee)?.name}</span>：
                          </p>
                          <p className="text-[9px] text-[#65676B] italic">“{requestMessage}”</p>
                          <p className="text-[8px] text-[#8A8D91] animate-pulse">系统自动连线中，协同接入中...</p>
                        </div>
                      )}

                      {requestStatus === 'accepted' && (
                        <div className="space-y-1 bg-purple-50 p-2 border border-dashed border-purple-300 rounded-[3px]">
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="font-extrabold text-purple-600 flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full inline-block animate-ping" />
                              <span>🎨 正在修改中</span>
                            </span>
                            <span className="text-[#8A8D91]">正在操作</span>
                          </div>
                          <p className="text-[9px] text-gray-700">
                            <span className="font-black">@{members.find(m => m.id === requestAssignee)?.name}</span> 接受了共创指派，正在操作节点！
                          </p>
                        </div>
                      )}

                      {requestStatus === 'reviewed' && (
                        <div className="space-y-1 bg-emerald-50 p-2 border border-[#2ECC71]/30 rounded-[3px]">
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="font-extrabold text-[#2ECC71]">💡 修改就绪待评审</span>
                            <span className="text-[#8A8D91]">等待采纳</span>
                          </div>
                          <p className="text-[9px] text-gray-700">
                            <span className="font-black">@{members.find(m => m.id === requestAssignee)?.name}</span> 已完成修改！
                          </p>
                          <div className="flex space-x-1 pt-1">
                            <button
                              onClick={() => {
                                setRequestStatus('none');
                                showToast('已核验通过！协作更新正式合并进 Stellar V4.0 思维导图规范');
                              }}
                              className="flex-1 py-1 bg-[#2ECC71] text-white text-[8px] font-black rounded-[2px] hover:bg-[#27AE60] transition-colors"
                            >
                              认可并采纳
                            </button>
                            <button
                              onClick={() => {
                                setRequestStatus('accepted');
                                showToast('已要求协作人进行二次优化校对');
                              }}
                              className="py-1 px-1.5 bg-white border border-[#E4E6EB] text-gray-700 text-[8px] font-bold rounded-[2px]"
                            >
                              退回重改
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* 🌿 节点详情与控制面板 */}
                  <div className="p-3 border-b border-[#E4E6EB] bg-white space-y-3">
                    <h4 className="text-[10px] font-black text-[#65676B] uppercase tracking-wider flex items-center space-x-1.5">
                      <Activity size={12} className="text-[#1877F2]" />
                      <span>选中节点属性控制</span>
                    </h4>

                    {(() => {
                      const node = mindMapNodes.find(n => n.id === selectedNodeId) || mindMapNodes[0];
                      if (!node) return null;
                      return (
                        <div className="space-y-3">
                          <div className="p-2.5 bg-[#F5F6F7] border border-[#E4E6EB] rounded-[3px]">
                            <span className="text-[8.5px] text-[#8A8D91] font-black uppercase block">当前节点</span>
                            <p className="text-xs font-black text-[#050505] mt-0.5 break-words">{node.text}</p>
                          </div>

                          {/* Quick Edit controls */}
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              onClick={() => handleAddMindMapNode(node.id)}
                              className="py-1 border border-[#1877F2]/30 hover:border-[#1877F2] text-[9px] font-black text-[#1877F2] bg-[#1877F2]/5 rounded-[2px]"
                            >
                              ➕ 新增子节点
                            </button>
                            <button
                              onClick={() => handleEditMindMapNode(node.id)}
                              className="py-1 border border-[#E4E6EB] hover:border-[#1877F2] text-[9px] font-black text-[#65676B] bg-white rounded-[2px]"
                            >
                              ✏️ 重命名
                            </button>
                            <button
                              onClick={() => handleDeleteMindMapNode(node.id)}
                              className="py-1 border border-[#E4E6EB] hover:border-red-500 hover:text-red-600 text-[9px] font-black text-[#65676B] bg-white rounded-[2px]"
                            >
                              🗑️ 删除分支
                            </button>
                          </div>

                          {/* 🗳️ 节点共识表决 */}
                          <div className="p-2 border border-[#E4E6EB] bg-[#FAFAFA] rounded-[3px] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-extrabold text-[#050505]">🗳️ 匿名共识度表决</span>
                              <span className="text-[8px] text-[#8A8D91]">
                                同意票数: <span className="text-[#1877F2] font-black">{node.votes || 0}</span>
                              </span>
                            </div>

                            <button
                              onClick={() => handleVoteNode(node.id)}
                              className="w-full py-1 bg-[#1877F2] text-white text-[8.5px] font-black rounded-[2px] flex items-center justify-center space-x-1"
                            >
                              <ThumbsUp size={10} />
                              <span>👍 我赞成此决策 (+1)</span>
                            </button>
                          </div>

                          {/* 💬 批注意见流 */}
                          <div className="p-2 border border-[#E4E6EB] bg-white rounded-[3px] space-y-2">
                            <span className="text-[9px] font-extrabold text-[#050505] flex items-center space-x-1">
                              <MessageSquare size={10} className="text-[#1877F2]" />
                              <span>节点批注评论 ({node.comments?.length || 0})</span>
                            </span>

                            {node.comments && node.comments.length > 0 ? (
                              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                                {node.comments.map((comm) => (
                                  <div key={`node-comm-${comm.id}`} className="p-1.5 bg-[#FAFAFA] border border-[#E4E6EB] rounded-[2px] text-left">
                                    <div className="flex items-center justify-between text-[8px] text-[#65676B] font-extrabold">
                                      <span className="flex items-center space-x-1">
                                        <img src={comm.avatar} className="w-3.5 h-3.5 rounded-full object-cover border" />
                                        <span>{comm.author}</span>
                                      </span>
                                      <span>{comm.time}</span>
                                    </div>
                                    <p className="text-[9px] text-[#050505] font-medium mt-1 leading-normal break-words">“{comm.text}”</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[8.5px] text-[#8A8D91] italic text-center py-1">暂无批注</p>
                            )}

                            <button
                              onClick={() => handleAddNodeComment(node.id)}
                              className="w-full py-1 border border-dashed border-[#E4E6EB] hover:border-[#1877F2] text-[8.5px] font-black text-[#65676B] hover:text-[#1877F2] text-center rounded-[2px] cursor-pointer"
                            >
                              💬 发表批注意见
                            </button>
                          </div>

                        </div>
                      );
                    })()}
                  </div>

                  {/* 📋 协作版本追溯大纲 */}
                  <div className="p-3 bg-white space-y-2 flex-1">
                    <h4 className="text-[10px] font-black text-[#65676B] uppercase tracking-wider flex items-center space-x-1.5">
                      <History size={12} className="text-[#1877F2]" />
                      <span>协作版本追溯大纲</span>
                    </h4>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 text-[9px]">
                      {versionHistory.map((ver) => (
                        <div key={`node-ver-${ver.id}`} className="flex items-start space-x-2 border-l border-[#E4E6EB] pl-2 pb-2 relative last:pb-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] absolute left-[-3.5px] top-1.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-[#1877F2] font-black">{ver.ver}</span>
                              <span className="text-[#8A8D91] text-[8px]">{ver.time}</span>
                            </div>
                            <p className="text-gray-700 mt-0.5 font-medium">{ver.desc}</p>
                            <p className="text-[8px] text-[#8A8D91]">更新人: {ver.updater}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right: Full Nodes Tree Overview List */}
                <div className="flex-1 p-4 bg-white overflow-y-auto space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                    <span className="text-xs font-black text-[#050505]">Stellar V4.0 全局拓扑树状结构</span>
                    <button
                      onClick={() => setActiveMindMapView('canvas')}
                      className="px-3 py-1 bg-[#1877F2] text-white text-xs font-black rounded-[4px] flex items-center space-x-1 shadow-2xs"
                    >
                      <Compass size={12} />
                      <span>返回无限画布视图</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {mindMapNodes.filter(n => !n.parentId).map(root => (
                      <div key={root.id} className="border border-[#1877F2] rounded-[4px] p-3 bg-[#1877F2]/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#1877F2] flex items-center space-x-1.5">
                            <GitBranch size={13} />
                            <span>{root.text}</span>
                          </span>
                          <span className="px-1.5 py-0.5 bg-[#1877F2] text-white text-[8px] font-black rounded-[2px]">根节点</span>
                        </div>

                        {/* First Level Children */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-[#1877F2]/20">
                          {mindMapNodes.filter(n => n.parentId === root.id).map(child => (
                            <div
                              key={child.id}
                              onClick={() => {
                                setSelectedNodeId(child.id);
                                setActiveMindMapView('canvas');
                              }}
                              className="p-2.5 bg-white border border-[#E4E6EB] hover:border-[#1877F2] rounded-[4px] cursor-pointer transition-all space-y-1.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-[#050505] truncate">{child.text}</span>
                                <span className="text-[8px] text-[#1877F2] font-bold">查看定位 →</span>
                              </div>

                              {/* Sub-children list */}
                              <div className="space-y-1 pt-1 border-t border-[#F0F2F5]">
                                {mindMapNodes.filter(sc => sc.parentId === child.id).map(sub => (
                                  <div key={sub.id} className="flex items-center space-x-1 text-[9px] text-[#65676B]">
                                    <span className="w-1 h-1 rounded-full bg-[#1877F2]" />
                                    <span className="truncate">{sub.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* MODAL 1: 发起多人实时共创指派 */}
            {isRequestModalOpen && (
              <div className="absolute inset-0 bg-[#050505]/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-[#E4E6EB] rounded-[4px] shadow-sm w-full max-w-md p-4 text-left space-y-3">
                  
                  <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2 shrink-0">
                    <span className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
                      <Sparkles size={14} className="text-[#1877F2]" />
                      <span>发起多人在线思维导图共创指派</span>
                    </span>
                    <button
                      onClick={() => setIsRequestModalOpen(false)}
                      className="p-1 hover:bg-[#F5F6F7] text-[#8A8D91] hover:text-red-500 rounded-[2px]"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-extrabold text-[#65676B]">1. 选择协同指派成员 (Assignee)</label>
                    <p className="text-[10px] text-[#8A8D91] mb-1">被指派的组员将收到高能星秒级弹框推送，并接受指令接入画笔</p>
                    <select
                      value={requestAssignee}
                      onChange={(e) => setRequestAssignee(e.target.value)}
                      className="w-full bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-[4px] px-2 py-1.5 outline-none font-bold"
                    >
                      {members.filter(m => m.id !== 'm_member1').map(m => (
                        <option key={`opt-assignee-${m.id}`} value={m.id}>{m.name} ({m.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-extrabold text-[#65676B]">2. 协同诉求意见 (Specification)</label>
                    <textarea
                      rows={3}
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="例如：请协助排查「大地图定位层」下的偏移算法参数，加上高能校准..."
                      className="w-full bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-[4px] p-2 outline-none font-medium text-xs leading-normal resize-none"
                    />
                  </div>

                  <div className="p-2 bg-[#FAFAFA] border border-[#E4E6EB] rounded-[3px] text-[10px] text-[#65676B] leading-relaxed">
                    💡 <span className="font-extrabold text-[#050505]">实时接单反馈机制</span>：
                    点击“确认发送”后，系统将在协作群聊中推送一份附带“查看共创导图”快捷通道卡片。
                    稍后您将看到该成员的实时动态光标向目标节点移动并提交修改，整个流程支持在线审核合并。
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1 border-t border-[#E4E6EB] shrink-0">
                    <button
                      onClick={() => setIsRequestModalOpen(false)}
                      className="px-3.5 py-1.5 bg-white border border-[#E4E6EB] hover:border-[#1877F2] text-gray-700 text-xs font-bold rounded-[4px]"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSendRequest}
                      className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-black rounded-[4px]"
                    >
                      确认并指派发送
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* MODAL 2: 添加便签贴纸 */}
            {showAddStickyModal && (
              <div className="absolute inset-0 bg-[#050505]/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-[#E4E6EB] rounded-[4px] shadow-sm w-full max-w-md p-4 text-left space-y-3">
                  
                  <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2 shrink-0">
                    <span className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
                      <StickyNote size={14} className="text-amber-500" />
                      <span>在画布上贴上团队便签 (Sticky Note)</span>
                    </span>
                    <button
                      onClick={() => setShowAddStickyModal(false)}
                      className="p-1 hover:bg-[#F5F6F7] text-[#8A8D91] hover:text-red-500 rounded-[2px]"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Sticky Color Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#65676B]">选择便签底色</label>
                    <div className="flex space-x-2">
                      {[
                        { id: 'yellow', label: '柠檬黄', bg: 'bg-amber-200 border-amber-400' },
                        { id: 'blue', label: '天蓝色', bg: 'bg-sky-200 border-sky-400' },
                        { id: 'green', label: '薄荷绿', bg: 'bg-emerald-200 border-emerald-400' },
                        { id: 'purple', label: '香芋紫', bg: 'bg-purple-200 border-purple-400' }
                      ].map(c => (
                        <button
                          key={c.id}
                          onClick={() => setNewStickyColor(c.id as any)}
                          className={`flex-1 py-1 px-2 border rounded-[3px] text-[9px] font-black ${c.bg} ${
                            newStickyColor === c.id ? 'ring-2 ring-[#1877F2]' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sticky Content Textarea */}
                  <div className="space-y-1 text-xs">
                    <label className="font-extrabold text-[#65676B]">便签提示内容</label>
                    <textarea
                      rows={4}
                      value={newStickyText}
                      onChange={(e) => setNewStickyText(e.target.value)}
                      placeholder="写下团队设计准则、紧急备忘、待办提示..."
                      className="w-full bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-[4px] p-2 outline-none font-medium text-xs leading-normal resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1 border-t border-[#E4E6EB] shrink-0">
                    <button
                      onClick={() => setShowAddStickyModal(false)}
                      className="px-3.5 py-1.5 bg-white border border-[#E4E6EB] hover:border-[#1877F2] text-gray-700 text-xs font-bold rounded-[4px]"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleAddStickyNote}
                      className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-black rounded-[4px]"
                    >
                      贴在画布中央
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== TAB 3: DOCS & FILES (Stellar 文档与文件工作台) ==================== */}
        {selectedTab === GroupTab.DOCS && (
          <div className="h-full w-full flex flex-col overflow-hidden bg-white">
            <StellarDocumentWorkspace
              onBack={() => {
                setSelectedTab(GroupTab.DASHBOARD);
              }}
              groupName={groupName}
              showToast={showToast}
            />
          </div>
        )}

        {/* ==================== TAB 4: MEMBERS (成员列表) ==================== */}
        {selectedTab === GroupTab.MEMBERS && (
          <div className="p-4 space-y-4 flex flex-col h-full bg-white text-left">
            
            {/* Top Invite Action row */}
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3 shrink-0">
              <div>
                <span className="text-xs font-black text-[#050505]">小组成员列表 ({members.length}位已加入)</span>
                <p className="text-[10px] text-[#65676B] mt-0.5">可点击授予或分配管理角色</p>
              </div>

              <button
                onClick={() => setIsInviteOpen(true)}
                className="px-3 py-1.5 bg-[#5DADE2] hover:bg-[#5DADE2]/90 text-white text-xs font-black rounded-[4px] flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <UserPlus size={13} />
                <span>邀请新成员</span>
              </button>
            </div>

            {/* Pending Approvals placeholder row for fidelity */}
            <div className="p-2.5 bg-[#FAFAFA] border border-[#E4E6EB] rounded-[4px] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <UserCheck size={14} className="text-[#F5A623]" />
                <span className="text-[10px] font-bold text-[#65676B]">待处理加入申请：有 2 个探索者申请待审批</span>
              </div>
              <button
                onClick={() => showToast('已打开加入申请审批流列表')}
                className="text-[9px] text-[#5DADE2] font-black hover:underline"
              >
                去审核 &gt;
              </button>
            </div>

            {/* Member List Stream */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pb-10">
              {members.map((member) => (
                <div
                  key={`stream-mem-${member.id}`}
                  className="p-3 bg-white border border-[#E4E6EB] rounded-[4px] flex items-center justify-between hover:border-[#1877F2] transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-9 h-9 rounded-[4px] object-cover border border-[#E4E6EB]"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        member.status === 'online' ? 'bg-[#2ECC71]' : 'bg-[#8A8D91]'
                      }`} />
                      {member.status === 'online' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#2ECC71] animate-ping opacity-75" />
                      )}
                    </div>

                    <div className="text-left truncate">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-[#050505] truncate">{member.name}</span>
                        <span className={`px-1.5 py-0.2 text-[8px] font-black rounded-[2px] border ${
                          member.role === 'Owner'
                            ? 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20'
                            : member.role === 'Admin'
                            ? 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20'
                            : member.role === 'Member'
                            ? 'bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20'
                            : 'bg-[#65676B]/10 text-[#65676B] border-[#65676B]/20'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#65676B] mt-0.5 truncate flex items-center space-x-1.5 flex-wrap">
                        <span>{member.department}</span>
                        <span className="text-[#8A8D91]">•</span>
                        {member.inGroup === false ? (
                          <>
                            <span className="text-[#1877F2] font-extrabold">距组 {member.distance}</span>
                            <span className="text-[#8A8D91]">•</span>
                            <span className={`px-1 py-0.2 rounded-sm font-bold ${
                              member.absenceType === '请假' 
                                ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                                : 'bg-blue-50 text-[#1877F2] border border-blue-200'
                            }`}>
                              {member.absenceType === '请假' ? '🏖️ 请假中' : '💼 外勤出差'}
                              {member.leavePeriod ? ` (${member.leavePeriod})` : ''}
                            </span>
                          </>
                        ) : (
                          <span className="text-[#2ECC71] font-bold">🟢 在组 · 实时坐标已锁定</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const newRole = prompt(`设置「${member.name}」新角色 (Owner / Admin / Member / Viewer)：`, member.role);
                      if (newRole && ['Owner', 'Admin', 'Member', 'Viewer'].includes(newRole)) {
                        setMembers(members.map(m => m.id === member.id ? { ...m, role: newRole as any } : m));
                        showToast(`已成功将 ${member.name} 的角色调整为 ${newRole} 🛡️`);
                      }
                    }}
                    className="w-7 h-7 rounded-[4px] border border-[#E4E6EB] hover:border-[#1877F2] text-[#65676B] hover:text-[#1877F2] flex items-center justify-center bg-white transition-colors cursor-pointer"
                    title="配置成员管理"
                  >
                    <MoreVertical size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 5: TASKS (任务监控) ==================== */}
        {selectedTab === GroupTab.TASKS && (
          <div className="p-3.5 space-y-3 flex flex-col h-full bg-[#F0F2F5] overflow-y-auto no-scrollbar text-left">
            {/* Top Stats and "Assign Task" Trigger row */}
            <div className="bg-white border border-[#E4E6EB] rounded-[4px] p-3 flex items-center justify-between gap-2 shrink-0 shadow-2xs">
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <CheckSquare size={14} className="text-[#1877F2] shrink-0" />
                  <span className="text-xs font-black text-[#050505] truncate">Stellar 小组任务进度监控中心</span>
                </div>
                <p className="text-[10px] text-[#65676B] mt-0.5 truncate">
                  组长与管理员可实时指派任务并追踪执行进度
                </p>
              </div>

              <button
                onClick={() => {
                  setNewTaskTitle('');
                  setNewTaskProgress(20);
                  setIsAddTaskOpen(true);
                }}
                className="px-2.5 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-[11px] font-black rounded-[3px] flex items-center space-x-1 shrink-0 cursor-pointer transition-colors shadow-2xs active:scale-95 whitespace-nowrap"
              >
                <Plus size={13} className="stroke-[3]" />
                <span>分配新任务</span>
              </button>
            </div>

            {/* Task List Grid */}
            <div className="space-y-2.5 flex-1 overflow-y-auto pb-10 pr-0.5">
              {tasks.map((task, tIdx) => {
                const assignee = members.find(m => m.id === task.assigneeId) || members[0];
                return (
                  <div 
                    key={`list-task-${task.id}-${tIdx}`} 
                    className="bg-white border border-[#E4E6EB] rounded-[4px] p-3.5 shadow-2xs hover:border-[#1877F2] transition-all space-y-2.5"
                  >
                    {/* Top: Status Badges & Due Date */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-[2px] border ${
                          task.priority === 'High' 
                            ? 'bg-rose-50 text-[#E41E3F] border-rose-200' 
                            : task.priority === 'Medium' 
                            ? 'bg-amber-50 text-[#D97706] border-amber-200' 
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {task.priority === 'High' ? '高优先级' : task.priority === 'Medium' ? '中优先级' : '低优先级'}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-[2px] border ${
                          task.status === 'Completed' 
                            ? 'bg-emerald-50 text-[#2ECC71] border-emerald-200' 
                            : task.status === 'In Progress' 
                            ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]/30' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {task.status === 'Completed' ? '已完成' : task.status === 'In Progress' ? '进行中' : '未开始'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 text-[9.5px] text-[#8A8D91] font-semibold shrink-0">
                        <Calendar size={11} className="text-[#8A8D91]" />
                        <span>截止: {task.dueDate}</span>
                      </div>
                    </div>

                    {/* Middle: Title */}
                    <h4 className="text-[12px] font-black text-[#050505] leading-snug text-left">
                      {task.title}
                    </h4>

                    {/* Assignee Row */}
                    <div className="flex items-center space-x-2 pt-0.5">
                      <img 
                        src={assignee.avatar} 
                        className="w-5 h-5 rounded-full object-cover border border-[#E4E6EB] shadow-2xs shrink-0" 
                        alt="avatar" 
                      />
                      <div className="flex items-center space-x-1.5 text-[10px]">
                        <span className="font-extrabold text-[#050505]">{assignee.name}</span>
                        <span className="text-[#CBD5E1]">|</span>
                        <span className="text-[9px] text-[#65676B] font-medium bg-[#F0F2F5] px-1.5 py-0.5 rounded-[2px]">
                          {assignee.department}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Progress bar & Interactive Controller */}
                    <div className="pt-2 border-t border-[#E4E6EB] space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#65676B] font-bold">任务执行进度:</span>
                        <span className={`font-black text-[11px] ${task.status === 'Completed' ? 'text-[#2ECC71]' : 'text-[#1877F2]'}`}>
                          {task.progress}%
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-[#F0F2F5] h-2 rounded-[2px] overflow-hidden border border-[#E4E6EB]/80">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            task.status === 'Completed' ? 'bg-[#2ECC71]' : 'bg-[#1877F2]'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>

                      {/* Steppers & Completion Button */}
                      <div className="flex items-center justify-between space-x-2 pt-0.5">
                        <div className="flex space-x-1 shrink-0">
                          <button
                            onClick={() => {
                              const newProg = Math.max(0, task.progress - 10);
                              setTasks(tasks.map(t => t.id === task.id ? { 
                                ...t, 
                                progress: newProg,
                                status: newProg === 100 ? 'Completed' : newProg > 0 ? 'In Progress' : 'Pending'
                              } : t));
                              showToast('已下调任务进度 -10%');
                            }}
                            disabled={task.status === 'Completed'}
                            className="px-2 py-0.5 border border-[#E4E6EB] hover:border-[#1877F2] hover:bg-[#F0F2F5] text-[9.5px] font-black rounded-[2px] bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 text-[#050505]"
                          >
                            -10%
                          </button>
                          <button
                            onClick={() => {
                              const newProg = Math.min(100, task.progress + 10);
                              setTasks(tasks.map(t => t.id === task.id ? { 
                                ...t, 
                                progress: newProg,
                                status: newProg === 100 ? 'Completed' : 'In Progress'
                              } : t));
                              showToast(newProg === 100 ? '任务已 100% 达成并自动归档！🎉' : '已提升任务进度 +10% 🚀');
                            }}
                            disabled={task.status === 'Completed'}
                            className="px-2 py-0.5 border border-[#E4E6EB] hover:border-[#1877F2] hover:bg-[#F0F2F5] text-[9.5px] font-black rounded-[2px] bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 text-[#050505]"
                          >
                            +10%
                          </button>
                        </div>

                        {task.status !== 'Completed' ? (
                          <button
                            onClick={() => {
                              setTasks(tasks.map(t => t.id === task.id ? { ...t, progress: 100, status: 'Completed' } : t));
                              showToast('任务已一键标记完成！🎉');
                            }}
                            className="px-2.5 py-0.5 bg-[#2ECC71] hover:bg-[#27AE60] text-white text-[9.5px] font-black rounded-[2px] transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95 flex items-center space-x-1"
                          >
                            <Check size={11} className="stroke-[3]" />
                            <span>完成任务</span>
                          </button>
                        ) : (
                          <span className="text-[9.5px] text-[#2ECC71] font-black flex items-center space-x-1 shrink-0 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[2px]">
                            <Check size={11} className="stroke-[3]" />
                            <span>已归档</span>
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ==================== POPUP MODAL: INVITE MEMBER ==================== */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E6EB] rounded-[4px] w-full max-w-sm p-4 space-y-4 shadow-xl text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-xs font-black text-[#050505]">发送 Stellar 协作邀请函</h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="w-6 h-6 rounded-[4px] border border-[#E4E6EB] text-[#65676B] hover:text-[#050505] flex items-center justify-center bg-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#65676B] mb-1">邀请对象 (Stellar 账号 / 邮箱 / 电话)</label>
                <input
                  type="text"
                  placeholder="请输入要邀请的探索者昵称或联系方式"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-white border border-[#E4E6EB] focus:border-[#5DADE2] rounded-[4px] px-3 py-1.5 text-xs text-[#050505] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#65676B] mb-1">配置初始角色权限 (ROLE)</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-white border border-[#E4E6EB] focus:border-[#5DADE2] rounded-[4px] px-2 py-1.5 text-xs text-[#050505] outline-none"
                >
                  <option value="Admin">Admin (管理员 - 读写并管理成员)</option>
                  <option value="Member">Member (标准协作成员 - 可读写/批注文件)</option>
                  <option value="Viewer">Viewer (仅观摩成员 - 只读)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 border-t border-[#E4E6EB] pt-3">
              <button
                onClick={() => setIsInviteOpen(false)}
                className="px-3 py-1.5 border border-[#E4E6EB] text-[#65676B] text-[10px] font-black rounded-[4px]"
              >
                取消
              </button>
              <button
                onClick={handleSendInvite}
                className="px-4 py-1.5 bg-[#5DADE2] hover:bg-[#5DADE2]/90 text-white text-[10px] font-black rounded-[4px]"
              >
                发送邀请函
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== POPUP MODAL: ADD TASK ==================== */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E6EB] rounded-[4px] w-full max-w-sm p-4 space-y-4 shadow-xl text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-xs font-black text-[#050505]">分配新工作任务 (Assign Task)</h3>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="w-6 h-6 rounded-[4px] border border-[#E4E6EB] text-[#65676B] hover:text-[#050505] flex items-center justify-center bg-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#65676B] mb-1">任务名称</label>
                <input
                  type="text"
                  placeholder="请输入要分配的具体任务描述..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-[4px] px-3 py-1.5 text-xs text-[#050505] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#65676B] mb-1">执行人员 (Assignee)</label>
                <select
                  value={newTaskAssigneeId}
                  onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                  className="w-full bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-[4px] px-2 py-1.5 text-xs text-[#050505] outline-none"
                >
                  {members.map(m => (
                    <option key={`opt-task-${m.id}`} value={m.id}>{m.name} ({m.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#65676B] mb-1">优先级</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-[4px] px-2 py-1.5 text-xs text-[#050505] outline-none"
                  >
                    <option value="High">High (高)</option>
                    <option value="Medium">Medium (中)</option>
                    <option value="Low">Low (低)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#65676B] mb-1">初始进度 ({newTaskProgress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="10"
                    value={newTaskProgress}
                    onChange={(e) => setNewTaskProgress(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#65676B] mb-1">截止日期</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-[4px] px-3 py-1.5 text-xs text-[#050505] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 border-t border-[#E4E6EB] pt-3">
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="px-3 py-1.5 border border-[#E4E6EB] text-[#65676B] text-[10px] font-black rounded-[4px]"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!newTaskTitle.trim()) {
                    showToast('请输入任务名称！');
                    return;
                  }
                  const newTask: TeamTask = {
                    id: `task-${Date.now()}`,
                    title: newTaskTitle,
                    assigneeId: newTaskAssigneeId,
                    priority: newTaskPriority,
                    progress: newTaskProgress,
                    status: newTaskProgress === 100 ? 'Completed' : newTaskProgress > 0 ? 'In Progress' : 'Pending',
                    dueDate: newTaskDueDate
                  };
                  setTasks([newTask, ...tasks]);
                  setIsAddTaskOpen(false);
                  showToast(`任务分配成功：${newTaskTitle} 🎉`);
                }}
                className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-[10px] font-black rounded-[4px]"
              >
                分配任务
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== BOTTOM NAVIGATION BAR (Establish Navigation Bar) ==================== */}
      <div className="px-3 pt-1.5 pb-[calc(0.375rem+var(--sab,0px))] bg-white border-t border-[#E4E6EB] shrink-0 z-20 shadow-sm flex items-center">
        {/* Horizontal Scroll wrapper for all buttons, starting with "返回" */}
        <div className="flex items-center space-x-1.5 w-full overflow-x-auto no-scrollbar scroll-smooth">
          
          {/* Home按钮 (Home + Label) */}
          <button
            onClick={onGoHome || onBack}
            className="flex flex-col items-center justify-center px-3 py-1 rounded-[4px] border border-[#E4E6EB] bg-white hover:bg-[#F5F6F7] hover:border-[#1877F2]/50 active:scale-95 transition-all cursor-pointer shrink-0 min-w-[56px] h-11 text-center"
            title="Home"
          >
            <Home size={16} className="text-[#1877F2] mb-0.5" />
            <span className="text-[9px] font-black text-[#65676B]">Home</span>
          </button>

          {/* Spacer divider */}
          <div className="h-6 w-[1px] bg-[#E4E6EB] shrink-0" />

          {/* 协作消息 (CHAT Hub) */}
          <button
            onClick={() => {
              setSelectedTab(GroupTab.CHAT);
              setSelectedFileForDetails(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center px-2 py-1 rounded-[4px] border transition-all cursor-pointer shrink-0 min-w-[68px] h-11 text-center ${
              selectedTab === GroupTab.CHAT || selectedTab === GroupTab.MIND_MAP
                ? 'bg-[#1877F2]/10 border-[#1877F2] text-[#1877F2] font-black shadow-3xs'
                : 'border-transparent text-[#65676B] hover:text-[#050505] hover:bg-[#F5F6F7]'
            }`}
          >
            <MessageSquare size={16} className={`${selectedTab === GroupTab.CHAT || selectedTab === GroupTab.MIND_MAP ? 'text-[#1877F2]' : 'text-[#65676B]'} mb-0.5`} />
            <span className="text-[9px] font-black truncate">协作消息</span>
          </button>

          {/* 工作台 (DASHBOARD Hub) */}
          <button
            onClick={() => {
              setSelectedTab(GroupTab.DASHBOARD);
              setSelectedFileForDetails(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center px-2 py-1 rounded-[4px] border transition-all cursor-pointer shrink-0 min-w-[68px] h-11 text-center ${
              selectedTab === GroupTab.DASHBOARD || selectedTab === GroupTab.TASKS || selectedTab === GroupTab.MEMBERS
                ? 'bg-[#1877F2]/10 border-[#1877F2] text-[#1877F2] font-black shadow-3xs'
                : 'border-transparent text-[#65676B] hover:text-[#050505] hover:bg-[#F5F6F7]'
            }`}
          >
            <Activity size={16} className={`${selectedTab === GroupTab.DASHBOARD || selectedTab === GroupTab.TASKS || selectedTab === GroupTab.MEMBERS ? 'text-[#1877F2]' : 'text-[#65676B]'} mb-0.5`} />
            <span className="text-[9px] font-black truncate">工作台</span>
          </button>

          {/* Stellar工作台 (Moved from top subnav to bottom navbar as requested) */}
          <button
            onClick={() => {
              if (onOpenStellarWorkspace) {
                onOpenStellarWorkspace();
              } else {
                showToast('正在为您打开 Stellar 协同工作台... 🚀');
              }
            }}
            className="flex-1 flex flex-col items-center justify-center px-2 py-1 rounded-[4px] border border-[#1877F2]/40 bg-[#1877F2]/5 hover:bg-[#1877F2] hover:border-[#1877F2] text-[#1877F2] hover:text-white transition-all cursor-pointer shrink-0 min-w-[76px] h-11 text-center group"
            title="在全屏全功能 Stellar 工作台中进行导图共创与极速绘制"
          >
            <Compass size={16} className="text-[#1877F2] group-hover:text-white transition-colors mb-0.5" />
            <span className="text-[9px] font-black truncate">Stellar工作台</span>
          </button>

          {/* 文件/文档 (DOCS & FILES Hub) */}
          <button
            onClick={() => {
              setSelectedTab(GroupTab.DOCS);
              setSelectedFileForDetails(null);
            }}
            className={`flex-1 flex flex-col items-center justify-center px-2 py-1 rounded-[4px] border transition-all cursor-pointer shrink-0 min-w-[68px] h-11 text-center ${
              selectedTab === GroupTab.DOCS || selectedTab === GroupTab.FILES
                ? 'bg-[#1877F2]/10 border-[#1877F2] text-[#1877F2] font-black shadow-3xs'
                : 'border-transparent text-[#65676B] hover:text-[#050505] hover:bg-[#F5F6F7]'
            }`}
          >
            <FileText size={16} className={`${selectedTab === GroupTab.DOCS || selectedTab === GroupTab.FILES ? 'text-[#1877F2]' : 'text-[#65676B]'} mb-0.5`} />
            <span className="text-[9px] font-black truncate">文件/文档</span>
          </button>

        </div>
      </div>

      {/* ==================== WORKBENCH MODALS & DRAWERS ==================== */}
      <ManageGroupModal
        isOpen={isManageGroupOpen}
        onClose={() => setIsManageGroupOpen(false)}
        groupName={groupNameState}
        setGroupName={setGroupNameState}
        groupDescription={groupDescriptionState}
        setGroupDescription={setGroupDescriptionState}
        selectedRegionAnimal={selectedRegionAnimal}
        setSelectedRegionAnimal={setSelectedRegionAnimal}
        schedule={scheduleState}
        setSchedule={setScheduleState}
        members={workbenchMembers}
        setMembers={setWorkbenchMembers}
        squads={workbenchSquads}
        tasks={workbenchTasks}
        auditLogs={workbenchAuditLogs}
        setAuditLogs={setWorkbenchAuditLogs}
        showToast={showToast}
      />

      <CreateSquadModal
        isOpen={isCreateSquadOpen}
        onClose={() => setIsCreateSquadOpen(false)}
        members={workbenchMembers}
        onSquadCreated={(newSquad) => {
          setWorkbenchSquads((prev) => [newSquad, ...prev]);
          setIsCreateSquadOpen(false);
          showToast(`小队「${newSquad.name}」已创建`);
        }}
        showToast={showToast}
        setAuditLogs={setWorkbenchAuditLogs}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        members={workbenchMembers}
        squads={workbenchSquads}
        onTaskCreated={(newTask) => {
          setWorkbenchTasks((prev) => [newTask, ...prev]);
          setIsCreateTaskOpen(false);
          showToast(`任务「${newTask.title}」已创建`);
        }}
        showToast={showToast}
      />

      <TaskDetailModal
        isOpen={!!selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        task={selectedTaskForDetail}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onToggleStep={handleToggleTaskStep}
        onOpenDoc={(docId) => {
          setSelectedTab(GroupTab.DOCS);
          showToast(`已为您导航至关联文档`);
        }}
        showToast={showToast}
      />

      <MemberJoinConsentModal
        isOpen={isMemberConsentOpen}
        onClose={() => setIsMemberConsentOpen(false)}
        groupName={groupNameState}
        onSelectConsent={handleSelectConsent}
        showToast={showToast}
      />

      {selectedSquadForChannel && (
        <SquadChannelDrawer
          isOpen={!!selectedSquadForChannel}
          onClose={() => setSelectedSquadForChannel(null)}
          squad={selectedSquadForChannel}
          members={workbenchMembers}
          messages={workbenchMessages}
          setMessages={setWorkbenchMessages}
          onEndSquadWindow={handleEndSquadWindow}
          onOpenMissionControl={(sq) => {
            setSelectedSquadForMissionControl(sq);
          }}
          onSimulateArrived={() => {
            showToast('已模拟全员到达集结点');
          }}
          showToast={showToast}
          setAuditLogs={setWorkbenchAuditLogs}
          onOpenDoc={(docId) => {
            setSelectedTab(GroupTab.DOCS);
            showToast('已为您导航至关联文档');
          }}
        />
      )}

      {/* 小队行动指挥台 (Squad Action Command Center) */}
      {selectedSquadForMissionControl && (
        <SquadMissionControlPanel
          isOpen={!!selectedSquadForMissionControl}
          onClose={() => setSelectedSquadForMissionControl(null)}
          squad={selectedSquadForMissionControl}
          members={workbenchMembers}
          missionState={
            tacticalMissionStates[selectedSquadForMissionControl.id] || {
              ...INITIAL_TACTICAL_MISSION_STATE['squad-1'],
              squadId: selectedSquadForMissionControl.id,
            }
          }
          onUpdateMissionState={(newState) => {
            setTacticalMissionStates((prev) => ({
              ...prev,
              [newState.squadId]: newState,
            }));
          }}
          showToast={showToast}
          onOpenDoc={(docId) => {
            setSelectedTab(GroupTab.DOCS);
            showToast('已为您导航至关联文档空间');
          }}
          onNavigateToChannel={() => {
            const targetSq = selectedSquadForMissionControl;
            setSelectedSquadForMissionControl(null);
            if (targetSq) {
              setSelectedSquadForChannel(targetSq);
            }
          }}
        />
      )}

    </div>
  );
};
