import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Flag,
  Navigation,
  Shield,
  Clock,
  Plus,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
  Layers,
  Users,
  FileText,
  MessageSquare,
  ArrowRight,
  Compass,
  Zap,
  Sliders,
  Sparkles,
  ChevronRight,
  Check,
  Split,
  Eye,
  Send,
  HelpCircle,
  TrendingUp,
  Activity,
  Maximize2,
  Calendar,
  ArrowLeft,
  Map as MapIcon,
  ListOrdered,
  ListFilter,
} from 'lucide-react';
import {
  SquadItem,
  GroupMember,
  MissionWaypoint,
  MemberAssignedRoute,
  TacticalMissionTask,
  TacticalTimelineEvent,
  SquadMissionTacticalState,
  WaypointType,
  SquadBorderConfig,
  TaskStatus,
} from './types';
import { WaveAvatar } from './WaveAvatar';
import { MissionLiveTimeline } from './MissionLiveTimeline';
import { TacticalInteractiveMap } from './TacticalInteractiveMap';

interface SquadMissionControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  squad: SquadItem;
  members: GroupMember[];
  missionState: SquadMissionTacticalState;
  onUpdateMissionState: (newState: SquadMissionTacticalState) => void;
  showToast: (msg: string) => void;
  onOpenDoc?: (docId: string) => void;
  onNavigateToChannel?: () => void;
}

export const SquadMissionControlPanel: React.FC<SquadMissionControlPanelProps> = ({
  isOpen,
  onClose,
  squad,
  members,
  missionState,
  onUpdateMissionState,
  showToast,
  onOpenDoc,
  onNavigateToChannel,
}) => {
  // Active Sidebar Tabs on desktop / view switcher on mobile: 'map' | 'waypoints' | 'routes' | 'tasks' | 'timeline'
  const [activeTab, setActiveTab] = useState<'waypoints' | 'routes' | 'tasks' | 'timeline'>('waypoints');
  const [mobileView, setMobileView] = useState<'map' | 'waypoints' | 'routes' | 'tasks' | 'timeline'>('map');
  
  // Selected interactive waypoint on map/list
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>('wp-1');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('task-1');
  const [selectedMemberRouteId, setSelectedMemberRouteId] = useState<string | null>('mem-3');

  // Modals for Adding Waypoint, Planning Route, Binding Task, Splitting Routes
  const [showAddWaypointModal, setShowAddWaypointModal] = useState(false);
  const [newWpName, setNewWpName] = useState('');
  const [newWpType, setNewWpType] = useState<WaypointType>('checkpoint');
  const [newWpLat, setNewWpLat] = useState('36.0690');
  const [newWpLng, setNewWpLng] = useState('103.8200');
  const [newWpDesc, setNewWpDesc] = useState('');
  const [newWpCondition, setNewWpCondition] = useState('');
  const [newWpAssignedMember, setNewWpAssignedMember] = useState('mem-3');
  const [newWpBoundTask, setNewWpBoundTask] = useState('task-1');

  // Plan Total Route Inputs
  const [showPlanRouteModal, setShowPlanRouteModal] = useState(false);
  const [startPointInput, setStartPointInput] = useState(missionState.startLocationName || '兰州中山铁桥南广场');
  const [endPointInput, setEndPointInput] = useState(missionState.endLocationName || '白塔山顶全景台');

  // Edit Task Duration Modal
  const [editingTask, setEditingTask] = useState<TacticalMissionTask | null>(null);
  const [editDurationMinutes, setEditDurationMinutes] = useState<number>(120);

  // Split Route to Member Modal
  const [showSplitRouteModal, setShowSplitRouteModal] = useState(false);
  const [splitTargetMemberId, setSplitTargetMemberId] = useState<string>('mem-5');
  const [splitSelectedWpIds, setSplitSelectedWpIds] = useState<string[]>(['wp-1', 'wp-3', 'wp-6']);
  const [splitCompletionCond, setSplitCompletionCond] = useState('到达全部指定坐标点并自检上报');
  const [splitVisibility, setSplitVisibility] = useState<'squad_only' | 'group_public' | 'leader_only'>('squad_only');
  const [splitBoundTask, setSplitBoundTask] = useState('task-2');

  // Interactive Live Demo Guided Script Step (1 to 8)
  const [demoStep, setDemoStep] = useState<number>(1);

  // Format Countdown Timer
  const [countdown, setCountdown] = useState<number>(missionState.actionCountdownSeconds || 24840);

  useEffect(() => {
    if (missionState.missionStatus !== 'in_progress' && missionState.missionStatus !== 'rerouted') return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [missionState.missionStatus]);

  if (!isOpen) return null;

  const formatSeconds = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper for adding timeline event
  const appendTimelineEvent = (
    title: string,
    type: TacticalTimelineEvent['type'],
    description: string,
    statusTag?: string
  ) => {
    const newEvent: TacticalTimelineEvent = {
      id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      title,
      type,
      operatorName: squad.leaderName || 'Lucas Zhao (小队长)',
      operatorAvatar: squad.leaderAvatar,
      description,
      squadId: squad.id,
      statusTag,
    };
    return [newEvent, ...missionState.timeline];
  };

  // 1. Commander Actions (集合、出发、到达、暂停、改道、阻塞、完成、结束行动)
  const handleSendCommand = (order: SquadMissionTacticalState['activeCommandOrder'], customDesc?: string) => {
    let newStatus: SquadMissionTacticalState['missionStatus'] = missionState.missionStatus;
    let title = '';
    let type: TacticalTimelineEvent['type'] = 'order';
    let tag = '';
    let desc = customDesc || '';

    switch (order) {
      case 'gathering':
        title = '下达指令：【全员集合】';
        desc = desc || '全员前往集合点报到并开启高精定位同步。';
        tag = '集合指令';
        break;
      case 'departure':
        title = '下达指令：【正式出发】';
        newStatus = 'in_progress';
        desc = desc || '行动计时启动，全员按各自预定路线开始推进。';
        tag = '全员出发';
        break;
      case 'arrival':
        title = '模拟触发：【坐标点到达打卡】';
        desc = desc || '小队成员进入目标坐标点50米有效半径，自动触发到达打卡与任务阶段步进。';
        tag = '到达打卡';
        type = 'arrival';
        // Auto mark selected waypoint as arrived
        if (selectedWaypointId) {
          const updatedWps = missionState.waypoints.map((w) =>
            w.id === selectedWaypointId ? { ...w, isArrived: true, arrivedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) } : w
          );
          missionState.waypoints = updatedWps;
        }
        break;
      case 'pause':
        title = '下达指令：【行动暂停休整】';
        newStatus = 'paused';
        desc = desc || '全员就地休整，暂停倒计时推进。';
        tag = '行动暂停';
        break;
      case 'reroute':
        title = '指挥台调度：【全队路线改道】';
        newStatus = 'rerouted';
        desc = desc || '检测到危险路段或前方阻塞，启动避险改道路线，更新各成员子路线与时间轴。';
        tag = '路线改道';
        type = 'reroute';
        missionState.isRerouted = true;
        break;
      case 'block':
        title = '突发上报：【成员/任务阻塞】';
        newStatus = 'blocked';
        desc = desc || '成员 Elena 报告山顶瞬时风速超标，任务《白塔山高空航拍》标记为阻塞，等待天气好转。';
        tag = '行动阻塞';
        type = 'blocked';
        // mark task-4 as blocked
        missionState.tacticalTasks = missionState.tacticalTasks.map((t) =>
          t.id === 'task-4' ? { ...t, status: 'blocked', isBlocked: true, blockedReason: '阵风6级超标' } : t
        );
        break;
      case 'complete':
        title = '任务达标：【终点会师验收】';
        newStatus = 'completed';
        desc = desc || '全员抵达终点白塔山全景台，完成全线KML差分标定与资料汇总。';
        tag = '行动达标';
        break;
      case 'end_mission':
        title = '指挥台下达：【结束行动并关闭定位】';
        newStatus = 'ended';
        desc = desc || '行动圆满结束，实时高精定位已自动切断（关闭GPS共享），仅保留最终行动摘要与文档纪要。';
        tag = '定位关闭';
        type = 'end';
        break;
    }

    const updatedTimeline = appendTimelineEvent(title, type, desc, tag);

    const updatedState: SquadMissionTacticalState = {
      ...missionState,
      missionStatus: newStatus,
      activeCommandOrder: order,
      isLiveLocationActive: order !== 'end_mission',
      isRerouted: order === 'reroute' ? true : missionState.isRerouted,
      timeline: updatedTimeline,
      missionSummary:
        order === 'end_mission'
          ? {
              totalDurationMinutes: 180,
              completedWaypointsCount: missionState.waypoints.filter((w) => w.isArrived).length || missionState.waypoints.length,
              totalWaypointsCount: missionState.waypoints.length,
              completedTasksCount: missionState.tacticalTasks.length,
              totalTasksCount: missionState.tacticalTasks.length,
              endTimestamp: new Date().toLocaleString('zh-CN'),
              finalStatusReport: '全线打卡顺利完成，已沉淀至协作知识库',
            }
          : missionState.missionSummary,
    };

    onUpdateMissionState(updatedState);
    showToast(`已执行指令：${title}`);
  };

  // 2. Add New Waypoint
  const handleAddWaypoint = () => {
    if (!newWpName.trim()) {
      showToast('请输入坐标点名称');
      return;
    }
    const lat = parseFloat(newWpLat) || 36.069;
    const lng = parseFloat(newWpLng) || 103.82;

    const newWp: MissionWaypoint = {
      id: `wp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: newWpName.trim(),
      type: newWpType,
      coords: [lat, lng],
      description: newWpDesc || `${newWpType === 'hazard' ? '⚠️ 危险提醒：路面湿滑' : '队长新增标记坐标点'}`,
      orderIndex: missionState.waypoints.length + 1,
      assignedMemberIds: [newWpAssignedMember],
      boundTaskId: newWpBoundTask,
      arrivalTriggerRadiusMeters: 50,
      completionCondition: newWpCondition || '到达现场拍照打卡',
      isArrived: false,
    };

    const updatedWps = [...missionState.waypoints, newWp];
    const updatedState: SquadMissionTacticalState = {
      ...missionState,
      waypoints: updatedWps,
      timeline: appendTimelineEvent(
        `队长添加了新坐标点【${newWp.name}】`,
        'order',
        `类型: ${newWpType} · 坐标: [${lat}, ${lng}] · 绑定任务: ${newWpBoundTask}`,
        '坐标增加'
      ),
    };

    onUpdateMissionState(updatedState);
    setShowAddWaypointModal(false);
    setNewWpName('');
    showToast(`已成功添加坐标点：${newWp.name}`);
  };

  // 3. Plan Total Route (起点 + 终点)
  const handleSavePlannedRoute = () => {
    const updatedState: SquadMissionTacticalState = {
      ...missionState,
      startLocationName: startPointInput,
      endLocationName: endPointInput,
      timeline: appendTimelineEvent(
        `总路线规划更新: ${startPointInput} ➔ ${endPointInput}`,
        'order',
        '队长重新设定了小队行动的起点与终点，并完成了主干路线连线渲染。',
        '路线更新'
      ),
    };
    onUpdateMissionState(updatedState);
    setShowPlanRouteModal(false);
    showToast(`总路线已规划：${startPointInput} ➔ ${endPointInput}`);
  };

  // 4. Save Task Duration Modification
  const handleSaveTaskDuration = () => {
    if (!editingTask) return;
    const updatedTasks = missionState.tacticalTasks.map((t) =>
      t.id === editingTask.id ? { ...t, estimatedDurationMinutes: editDurationMinutes } : t
    );
    const updatedState: SquadMissionTacticalState = {
      ...missionState,
      tacticalTasks: updatedTasks,
      timeline: appendTimelineEvent(
        `修改任务时长: ${editingTask.title}`,
        'order',
        `预计时长调整为 ${editDurationMinutes} 分钟，系统已同步更新时间轴排期。`,
        '时长调整'
      ),
    };
    onUpdateMissionState(updatedState);
    setEditingTask(null);
    showToast(`已将任务时长修改为 ${editDurationMinutes} 分钟`);
  };

  // 5. Split Route to Member
  const handleSaveSplitRoute = () => {
    const targetMember = members.find((m) => m.id === splitTargetMemberId) || members[0];
    const existingIdx = missionState.memberRoutes.findIndex((r) => r.memberId === splitTargetMemberId);

    const colors = ['#1877F2', '#FA383E', '#00A400', '#8B5CF6', '#F7931A'];
    const newRoute: MemberAssignedRoute = {
      memberId: splitTargetMemberId,
      memberName: targetMember.name,
      memberAvatar: targetMember.avatar,
      routeColor: colors[(missionState.memberRoutes.length + 1) % colors.length],
      waypointIds: splitSelectedWpIds,
      visibilityScope: splitVisibility,
      completionCondition: splitCompletionCond,
      boundTaskId: splitBoundTask,
      status: 'in_progress',
      currentCoords: targetMember.currentCoords || [36.0652, 103.8290],
    };

    let updatedRoutes = [...missionState.memberRoutes];
    if (existingIdx >= 0) {
      updatedRoutes[existingIdx] = newRoute;
    } else {
      updatedRoutes.push(newRoute);
    }

    const updatedState: SquadMissionTacticalState = {
      ...missionState,
      memberRoutes: updatedRoutes,
      timeline: appendTimelineEvent(
        `为队员 ${targetMember.name} 分配独立路线`,
        'order',
        `分配了 ${splitSelectedWpIds.length} 个坐标点，绑定任务: ${splitBoundTask}，可见范围: ${splitVisibility === 'squad_only' ? '小队内可见' : '小组公开'}`,
        '路线拆分'
      ),
    };

    onUpdateMissionState(updatedState);
    setShowSplitRouteModal(false);
    showToast(`已为队员 ${targetMember.name} 成功分配专属子路线！`);
  };

  // 6. One-Click Interactive Walkthrough Demo (8 steps sequentially)
  const runNextDemoStep = () => {
    switch (demoStep) {
      case 1: {
        const wpA: MissionWaypoint = {
          id: `wp-demo-1`,
          name: '甘肃省古籍善本打卡台',
          type: 'task',
          coords: [36.066, 103.824],
          description: '历史文献与善本数字化采风',
          orderIndex: missionState.waypoints.length + 1,
          assignedMemberIds: ['mem-3'],
          boundTaskId: 'task-1',
          arrivalTriggerRadiusMeters: 50,
          isArrived: false,
          completionCondition: '打卡并上传古籍展陈近景照片',
        };
        const wpB: MissionWaypoint = {
          id: `wp-demo-2`,
          name: '黄河母亲像水文安全哨',
          type: 'checkpoint',
          coords: [36.069, 103.815],
          description: '汛期黄河亲水平台安全视距检测',
          orderIndex: missionState.waypoints.length + 2,
          assignedMemberIds: ['mem-5'],
          boundTaskId: 'task-2',
          arrivalTriggerRadiusMeters: 50,
          isArrived: false,
          completionCondition: '拍照上传实时水位标尺',
        };
        const wpC: MissionWaypoint = {
          id: `wp-demo-3`,
          name: '白塔山南麓落石警戒区',
          type: 'hazard',
          coords: [36.071, 103.818],
          description: '⚠️ 陡坡有少量碎石滚落风险，禁止靠近左侧护坡',
          orderIndex: missionState.waypoints.length + 3,
          assignedMemberIds: ['mem-1'],
          boundTaskId: 'task-3',
          arrivalTriggerRadiusMeters: 60,
          isArrived: false,
          completionCondition: '设置警示路标或向指挥台发起改道',
        };

        const filteredPrevWps = missionState.waypoints.filter((w) => !w.id.startsWith('wp-demo-'));
        const updatedWps = [...filteredPrevWps, wpA, wpB, wpC];
        const updatedState: SquadMissionTacticalState = {
          ...missionState,
          waypoints: updatedWps,
          timeline: appendTimelineEvent(
            '【演示步骤1】小队长批量添加3个高精坐标点',
            'order',
            '成功在地图中注入：古籍善本打卡台、黄河母亲像水文安全哨、白塔山南麓落石警戒区',
            '批量标定'
          ),
        };
        onUpdateMissionState(updatedState);
        setDemoStep(2);
        showToast('【步骤1/8】已成功添加3个实地坐标点');
        break;
      }

      case 2: {
        const updatedState: SquadMissionTacticalState = {
          ...missionState,
          startLocationName: '兰州中山铁桥南广场 (集结点)',
          endLocationName: '白塔山顶全景台 (会师验收)',
          timeline: appendTimelineEvent(
            '【演示步骤2】规划小队行动总路线',
            'order',
            '设定总路线：中山铁桥南广场 ➔ 白塔山顶全景台，自动生成拓扑连线与导航基准。',
            '总线规划'
          ),
        };
        onUpdateMissionState(updatedState);
        setDemoStep(3);
        showToast('【步骤2/8】总路线已生成并连线');
        break;
      }

      case 3: {
        const filteredRoutes = missionState.memberRoutes.filter((r) => r.memberId !== 'mem-2');
        const updatedRoutes = [
          ...filteredRoutes,
          {
            memberId: 'mem-2',
            memberName: 'David Liu',
            memberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            routeColor: '#8B5CF6',
            waypointIds: ['wp-1', 'wp-demo-1', 'wp-demo-2'],
            visibilityScope: 'squad_only' as const,
            completionCondition: '完成水文与古籍展陈资料采集',
            boundTaskId: 'task-2',
            status: 'in_progress' as const,
            currentCoords: [36.067, 103.821] as [number, number],
          },
        ];
        const updatedState: SquadMissionTacticalState = {
          ...missionState,
          memberRoutes: updatedRoutes,
          timeline: appendTimelineEvent(
            '【演示步骤3】拆分独立路线分配至队员 David Liu',
            'order',
            '为队员 David 独立指定了3个坐标点序列，设置小队内保密可见。',
            '队员分流'
          ),
        };
        onUpdateMissionState(updatedState);
        setDemoStep(4);
        showToast('【步骤3/8】已为队员分配独立路线');
        break;
      }

      case 4: {
        const updatedTasks = missionState.tacticalTasks.map((t) =>
          t.id === 'task-1' ? { ...t, estimatedDurationMinutes: 75, boundWaypointId: 'wp-demo-1' } : t
        );
        const updatedState: SquadMissionTacticalState = {
          ...missionState,
          tacticalTasks: updatedTasks,
          timeline: appendTimelineEvent(
            '【演示步骤4】绑定任务并动态微调预计时长',
            'order',
            '将任务《历史古籍展陈采风》绑定至古籍打卡台坐标，并将时长调整为75分钟。',
            '排期调整'
          ),
        };
        onUpdateMissionState(updatedState);
        setDemoStep(5);
        showToast('【步骤4/8】任务已绑定坐标并更新时长');
        break;
      }

      case 5:
        handleSendCommand('departure', '【演示步骤5】小队长正式发布出发指令，行动计时启动，全员进入临时定位窗口。');
        setDemoStep(6);
        break;

      case 6: {
        const updatedWps = missionState.waypoints.map((w, idx) =>
          idx === 0 || w.id === 'wp-1'
            ? { ...w, isArrived: true, arrivedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }
            : w
        );
        const updatedState: SquadMissionTacticalState = {
          ...missionState,
          waypoints: updatedWps,
          timeline: appendTimelineEvent(
            '【演示步骤6】先锋组打卡第一集结点',
            'arrival',
            '先锋队员进入第一坐标点50米打卡圈，触发自动报到，任务进入第二阶段。',
            '先锋打卡'
          ),
        };
        onUpdateMissionState(updatedState);
        setDemoStep(7);
        showToast('【步骤6/8】先锋队员已到达首个打卡点');
        break;
      }

      case 7:
        handleSendCommand(
          'reroute',
          '【演示步骤7】突发阻塞与指挥台改道：白塔山南麓落石警戒，队长下达全队改走东侧缓坡栈道。'
        );
        setDemoStep(8);
        break;

      case 8:
        handleSendCommand('end_mission', '【演示步骤8】全员抵达终点，队长下达结束行动指令。实时定位已关闭，保留行动摘要。');
        setDemoStep(1);
        showToast('【步骤8/8】行动已圆满结束，定位已关闭');
        break;
    }
  };

  const currentWp =
    missionState.waypoints.find((w) => w.id === selectedWaypointId) || missionState.waypoints[0] || {
      name: '未选择点位',
      description: '请在地图或列表中选择坐标点',
    };

  return (
    <div
      id="squad-mission-control-panel-modal"
      role="region"
      aria-label="小队行动指挥台"
      className="absolute inset-0 z-50 bg-[#F0F2F5] dark:bg-black text-[#050505] dark:text-white flex flex-col w-full h-full overflow-hidden animate-in fade-in slide-in-from-right duration-200 select-none"
    >
      {/* 1. Page Header (Full-Page Top Navigation Bar with Back Link) */}
      <header className="px-3 sm:px-4 py-2.5 bg-white dark:bg-black border-b border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0 shadow-2xs z-30">
        {/* Left: Standard Page Back Link & Squad Info */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center space-x-1 py-1 px-1.5 -ml-1 text-[#1877F2] dark:text-[#1877F2] hover:opacity-80 active:scale-95 text-xs font-bold transition-all shrink-0 cursor-pointer"
            title="返回小组工作台"
          >
            <ArrowLeft size={18} className="stroke-[2.5]" />
            <span className="font-bold text-xs sm:text-sm">工作台</span>
          </button>

          <div className="h-5 w-px bg-[#E4E6EB] dark:bg-zinc-800 hidden sm:block" />

          {/* Squad Leader Avatar with Wave Border */}
          <div className="hidden xs:flex items-center space-x-2 min-w-0">
            <WaveAvatar
              src={squad.leaderAvatar}
              name={squad.leaderName}
              size={34}
              isCaptain={true}
              badgeIcon={squad.borderConfig.badge}
              borderConfig={squad.borderConfig}
              className="shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white truncate">
                  小队指挥台 · {squad.name}
                </h1>
                <span
                  className={`text-[10px] px-1.5 py-0.2 font-bold rounded-sm border shrink-0 ${
                    missionState.missionStatus === 'in_progress'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] dark:text-blue-400 border-blue-200 dark:border-blue-800/60'
                      : missionState.missionStatus === 'rerouted'
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/60'
                      : missionState.missionStatus === 'blocked'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                      : missionState.missionStatus === 'ended'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                  }`}
                >
                  {missionState.missionStatus === 'in_progress'
                    ? '● 执行中'
                    : missionState.missionStatus === 'rerouted'
                    ? '🔀 已改道'
                    : missionState.missionStatus === 'blocked'
                    ? '⚠️ 阻塞'
                    : missionState.missionStatus === 'ended'
                    ? '🏁 已结束'
                    : '⏳ 准备'}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 dark:text-zinc-400 hidden md:flex items-center space-x-2">
                <span>队长: {squad.leaderName}</span>
                <span>·</span>
                <span className="text-[#1877F2] dark:text-blue-400 font-mono font-bold flex items-center space-x-1">
                  <Clock size={11} />
                  <span>倒计时: {formatSeconds(countdown)}</span>
                </span>
                <span>·</span>
                <span className="truncate max-w-[200px]">
                  {missionState.startLocationName} ➔ {missionState.endLocationName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions: Interactive Walkthrough Demo, Channel & Status Badges */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* GPS Status Indicator */}
          {missionState.isLiveLocationActive ? (
            <span className="hidden sm:inline-flex text-[10px] px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold rounded-md border border-emerald-200 dark:border-emerald-800/60 items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>RTK定位活跃</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex text-[10px] px-2 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-bold rounded-md border border-gray-200 dark:border-zinc-700 items-center space-x-1">
              <span>🛡️ 定位已切断</span>
            </span>
          )}

          {/* Interactive Demo Button */}
          <button
            onClick={runNextDemoStep}
            className="px-2.5 sm:px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] active:scale-95 text-white text-[11px] sm:text-xs font-bold rounded-md border border-[#1877F2] shadow-2xs transition-all flex items-center space-x-1 cursor-pointer"
            title="一键演示添加坐标、规划总路线、分配队员、绑定任务、修改时长、开始行动、模拟到达、模拟阻塞与改道结束"
          >
            <Sparkles size={13} className="animate-spin-slow" />
            <span>全流程演示 ({demoStep}/8)</span>
          </button>

          {onNavigateToChannel && (
            <button
              onClick={onNavigateToChannel}
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 text-xs font-bold rounded-md border border-[#E4E6EB] dark:border-zinc-800 hover:border-[#1877F2] shadow-2xs transition-all flex items-center space-x-1 cursor-pointer"
              title="打开小队频道"
            >
              <MessageSquare size={13} className="text-[#1877F2] dark:text-blue-400" />
              <span className="hidden sm:inline">队内频道</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Tactical Commander Quick Order Dispatch Bar */}
      <section className="px-3 sm:px-4 py-1.5 bg-white dark:bg-black border-b border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0 text-xs overflow-x-auto scrollbar-none z-20">
        <div className="flex items-center space-x-1.5 text-gray-600 dark:text-zinc-400 font-bold shrink-0">
          <Compass size={14} className="text-[#1877F2] dark:text-blue-400" />
          <span className="hidden sm:inline">战术快速调度:</span>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => handleSendCommand('gathering')}
            className="px-2.5 py-1 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-800 dark:text-zinc-200 text-[11px] font-bold rounded-md border border-[#E4E6EB] dark:border-zinc-800 hover:border-[#1877F2] transition-all cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <Users size={12} className="text-[#1877F2] dark:text-blue-400" />
            <span>集合</span>
          </button>

          <button
            onClick={() => handleSendCommand('departure')}
            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#1877F2] dark:text-blue-400 text-[11px] font-bold rounded-md border border-blue-200 dark:border-blue-800/60 transition-all cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <Play size={12} />
            <span>出发</span>
          </button>

          <button
            onClick={() => handleSendCommand('arrival')}
            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold rounded-md border border-emerald-200 dark:border-emerald-800/60 transition-all cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <CheckCircle2 size={12} />
            <span>打卡</span>
          </button>

          <button
            onClick={() => handleSendCommand('pause')}
            className="px-2.5 py-1 bg-white dark:bg-zinc-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[11px] font-bold rounded-md border border-[#E4E6EB] dark:border-zinc-800 hover:border-amber-400 transition-all cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <Pause size={12} />
            <span>暂停</span>
          </button>

          <button
            onClick={() => handleSendCommand('reroute')}
            className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-400 text-[11px] font-bold rounded-md border border-purple-200 dark:border-purple-800/60 transition-all cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <Split size={12} />
            <span>改道</span>
          </button>

          <button
            onClick={() => handleSendCommand('block')}
            className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 text-[11px] font-bold rounded-md border border-rose-200 dark:border-rose-800/60 transition-all cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <AlertTriangle size={12} />
            <span>阻塞</span>
          </button>

          <button
            onClick={() => handleSendCommand('complete')}
            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-400 text-[11px] font-bold rounded-md border border-emerald-300 dark:border-emerald-800/60 transition-all cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <Flag size={12} />
            <span>会师</span>
          </button>

          <button
            onClick={() => handleSendCommand('end_mission')}
            className="px-2.5 py-1 bg-gray-800 dark:bg-zinc-800 hover:bg-black text-white text-[11px] font-bold rounded-md border border-gray-700 dark:border-zinc-700 transition-all cursor-pointer flex items-center space-x-1 shrink-0"
            title="结束行动并彻底关闭实时定位"
          >
            <Shield size={12} className="text-emerald-400" />
            <span>结束定位</span>
          </button>
        </div>
      </section>

      {/* 3. Real-Time Dynamic Action Milestone Timeline Banner */}
      <section className="px-3 sm:px-4 py-1.5 bg-white dark:bg-black border-b border-[#E4E6EB] dark:border-zinc-800 shrink-0">
        <MissionLiveTimeline
          missionState={missionState}
          tasks={missionState.tacticalTasks}
          waypoints={missionState.waypoints}
          onSelectTask={(t) => {
            setSelectedTaskId(t.id);
            setActiveTab('tasks');
            setMobileView('tasks');
          }}
          onSelectWaypoint={(wId) => {
            setSelectedWaypointId(wId);
            setActiveTab('waypoints');
            setMobileView('waypoints');
          }}
          onOpenDoc={onOpenDoc}
        />
      </section>

      {/* 4. Mobile Top View Switcher Segmented Bar (< lg) */}
      <nav aria-label="移动端视图导航" className="lg:hidden px-3 py-1.5 bg-[#F8FAFC] dark:bg-black border-b border-[#E4E6EB] dark:border-zinc-800 flex items-center space-x-1 overflow-x-auto scrollbar-none shrink-0 z-20">
        <button
          onClick={() => setMobileView('map')}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center space-x-1 shrink-0 cursor-pointer ${
            mobileView === 'map'
              ? 'bg-[#1877F2] text-white shadow-2xs'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-[#E4E6EB] dark:border-zinc-800'
          }`}
        >
          <MapIcon size={13} />
          <span>态势地图</span>
        </button>

        <button
          onClick={() => {
            setMobileView('waypoints');
            setActiveTab('waypoints');
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center space-x-1 shrink-0 cursor-pointer ${
            mobileView === 'waypoints'
              ? 'bg-[#1877F2] text-white shadow-2xs'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-[#E4E6EB] dark:border-zinc-800'
          }`}
        >
          <MapPin size={13} />
          <span>坐标点 ({missionState.waypoints.length})</span>
        </button>

        <button
          onClick={() => {
            setMobileView('routes');
            setActiveTab('routes');
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center space-x-1 shrink-0 cursor-pointer ${
            mobileView === 'routes'
              ? 'bg-[#1877F2] text-white shadow-2xs'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-[#E4E6EB] dark:border-zinc-800'
          }`}
        >
          <Split size={13} />
          <span>分队路线 ({missionState.memberRoutes.length})</span>
        </button>

        <button
          onClick={() => {
            setMobileView('tasks');
            setActiveTab('tasks');
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center space-x-1 shrink-0 cursor-pointer ${
            mobileView === 'tasks'
              ? 'bg-[#1877F2] text-white shadow-2xs'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-[#E4E6EB] dark:border-zinc-800'
          }`}
        >
          <CheckCircle2 size={13} />
          <span>任务清单 ({missionState.tacticalTasks.length})</span>
        </button>

        <button
          onClick={() => {
            setMobileView('timeline');
            setActiveTab('timeline');
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center space-x-1 shrink-0 cursor-pointer ${
            mobileView === 'timeline'
              ? 'bg-[#1877F2] text-white shadow-2xs'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-[#E4E6EB] dark:border-zinc-800'
          }`}
        >
          <Clock size={13} />
          <span>动态日志</span>
        </button>
      </nav>

      {/* 5. Main Body: Fully Responsive Multi-Device Architecture */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col lg:grid lg:grid-cols-12 bg-[#F0F2F5] dark:bg-black">
        {/* ================= MAP SECTION ================= */}
        {/* Visible on desktop always, or on mobile when mobileView === 'map' */}
        <div
          className={`lg:col-span-7 xl:col-span-8 bg-[#F0F2F5] dark:bg-black relative flex flex-col border-b lg:border-b-0 lg:border-r border-[#E4E6EB] dark:border-zinc-800 overflow-hidden ${
            mobileView === 'map' ? 'flex-1 h-full' : 'hidden lg:flex'
          }`}
        >
          {/* Top Tactical Map Overlay Strip */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs px-2.5 sm:px-3 py-1.5 rounded-md border border-[#E4E6EB] dark:border-zinc-800 shadow-2xs text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center space-x-2 pointer-events-auto">
              <Navigation size={14} className="text-[#1877F2] dark:text-blue-400" />
              <span className="hidden sm:inline">实地战术态势图 · RTK 亚米级校准</span>
              <span className="sm:hidden">态势图</span>
              <span className="text-[10px] text-gray-300 dark:text-zinc-700">|</span>
              <span className="text-[11px] text-gray-600 dark:text-zinc-400">坐标点 ({missionState.waypoints.length})</span>
            </div>

            <div className="flex items-center space-x-1.5 pointer-events-auto">
              <button
                onClick={() => setShowAddWaypointModal(true)}
                className="px-2 sm:px-2.5 py-1 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 text-[#1877F2] dark:text-blue-400 text-xs font-bold rounded-md border border-[#E4E6EB] dark:border-zinc-800 hover:border-[#1877F2] shadow-2xs transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>添加点位</span>
              </button>
              <button
                onClick={() => setShowPlanRouteModal(true)}
                className="px-2 sm:px-2.5 py-1 bg-white dark:bg-zinc-900 hover:bg-purple-50 dark:hover:bg-zinc-800 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-md border border-[#E4E6EB] dark:border-zinc-800 hover:border-purple-300 shadow-2xs transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Navigation size={13} className="text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">规划总路线</span>
                <span className="sm:hidden">规划路线</span>
              </button>
            </div>
          </div>

          {/* Tactical Vector Map Visual Simulation with Drag and Optimal Path Planning */}
          <div className="flex-1 min-h-0 relative">
            <TacticalInteractiveMap
              missionState={missionState}
              onUpdateWaypoints={(updatedWps) => {
                onUpdateMissionState({
                  ...missionState,
                  waypoints: updatedWps,
                });
              }}
              onRecalculateSchedule={({ waypoints, tacticalTasks, memberRoutes, timelineEvent }) => {
                const updatedTimeline = timelineEvent
                  ? [timelineEvent, ...missionState.timeline]
                  : missionState.timeline;
                onUpdateMissionState({
                  ...missionState,
                  waypoints,
                  tacticalTasks,
                  memberRoutes,
                  timeline: updatedTimeline,
                });
              }}
              selectedWaypointId={selectedWaypointId}
              onSelectWaypoint={(wId) => {
                setSelectedWaypointId(wId);
              }}
              squadBorderConfig={squad.borderConfig}
              leaderId={squad.leaderId}
              isRerouted={missionState.isRerouted}
              showToast={showToast}
            />
          </div>

          {/* Bottom Status Ticker */}
          <div className="px-3 py-2 bg-white dark:bg-black border-t border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-zinc-400 min-w-0">
              <span className="font-bold text-gray-800 dark:text-zinc-200 shrink-0">选中点:</span>
              <span className="text-[#1877F2] dark:text-blue-400 font-extrabold truncate">{currentWp.name}</span>
              <span className="text-gray-300 dark:text-zinc-700 hidden sm:inline">·</span>
              <span className="text-gray-500 dark:text-zinc-400 truncate hidden sm:inline max-w-xs">{currentWp.description}</span>
            </div>
            <div className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center space-x-2 shrink-0">
              <span className="hidden sm:inline">触发条件: {currentWp.completionCondition || '无障碍通畅'}</span>
              {/* On mobile, allow quick button to switch to waypoints list */}
              <button
                onClick={() => {
                  setMobileView('waypoints');
                  setActiveTab('waypoints');
                }}
                className="lg:hidden text-[#1877F2] dark:text-blue-400 font-bold text-xs hover:underline flex items-center space-x-0.5"
              >
                <span>查看详情</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ================= TACTICAL SIDEBAR / MOBILE DETAIL PANEL ================= */}
        {/* Visible on desktop always, or on mobile when mobileView !== 'map' */}
        <div
          className={`lg:col-span-5 xl:col-span-4 bg-white dark:bg-black flex flex-col h-full overflow-hidden ${
            mobileView !== 'map' ? 'flex-1 h-full' : 'hidden lg:flex'
          }`}
        >
          {/* Desktop Tabs Header */}
          <div className="hidden lg:flex px-3 pt-2.5 pb-2 bg-[#F8FAFC] dark:bg-zinc-950 border-b border-[#E4E6EB] dark:border-zinc-800 items-center justify-between shrink-0">
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('waypoints')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'waypoints'
                    ? 'bg-white dark:bg-zinc-900 text-[#1877F2] dark:text-blue-400 border border-[#E4E6EB] dark:border-zinc-800 shadow-2xs'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                坐标点 ({missionState.waypoints.length})
              </button>
              <button
                onClick={() => setActiveTab('routes')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'routes'
                    ? 'bg-white dark:bg-zinc-900 text-[#1877F2] dark:text-blue-400 border border-[#E4E6EB] dark:border-zinc-800 shadow-2xs'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                路线拆分 ({missionState.memberRoutes.length})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'bg-white dark:bg-zinc-900 text-[#1877F2] dark:text-blue-400 border border-[#E4E6EB] dark:border-zinc-800 shadow-2xs'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                绑定任务 ({missionState.tacticalTasks.length})
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-white dark:bg-zinc-900 text-[#1877F2] dark:text-blue-400 border border-[#E4E6EB] dark:border-zinc-800 shadow-2xs'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                时间轴播报
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
            {/* TAB 1: WAYPOINTS LIST */}
            {activeTab === 'waypoints' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-[#E4E6EB] dark:border-zinc-800">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">全线规划坐标点序列</h3>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400">点击选中可在地图上高亮标定并查看详细参数</p>
                  </div>
                  <button
                    onClick={() => setShowAddWaypointModal(true)}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#1877F2] dark:text-blue-400 text-xs font-bold rounded-md border border-blue-200 dark:border-blue-800/60 transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>新增坐标点</span>
                  </button>
                </div>

                {missionState.waypoints.map((wp, idx) => {
                  const isSelected = selectedWaypointId === wp.id;
                  return (
                    <div
                      key={`ctrl-wp-${wp.id}-${idx}`}
                      onClick={() => {
                        setSelectedWaypointId(wp.id);
                      }}
                      className={`p-3 rounded-md border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/50 dark:bg-blue-950/40 border-[#1877F2] ring-1 ring-[#1877F2]/40 shadow-2xs'
                          : 'bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/60 border-[#E4E6EB] dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{wp.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-sm font-bold shrink-0">
                            {wp.type === 'gathering'
                              ? '集合点'
                              : wp.type === 'checkpoint'
                              ? '检查点'
                              : wp.type === 'task'
                              ? '任务点'
                              : wp.type === 'supply'
                              ? '补给点'
                              : wp.type === 'hazard'
                              ? '⚠️ 危险提示'
                              : '终点'}
                          </span>
                        </div>

                        {wp.isArrived ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-0.5 shrink-0 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-sm border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 size={11} />
                            <span>已打卡 ({wp.arrivedTime || '已到达'})</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold shrink-0">未打卡</span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-600 dark:text-zinc-300 line-clamp-2 mb-2">{wp.description}</p>

                      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-gray-500 dark:text-zinc-400 pt-1.5 border-t border-gray-100 dark:border-zinc-800">
                        <span>有效半径: {wp.arrivalTriggerRadiusMeters || 50}米</span>
                        <span>达成条件: {wp.completionCondition || '打卡'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: MEMBER ROUTES SPLIT */}
            {activeTab === 'routes' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-[#E4E6EB] dark:border-zinc-800">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">队长拆分子路线分配</h3>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400">将行动主干路径按队员角色拆分为独立打卡子路线</p>
                  </div>
                  <button
                    onClick={() => setShowSplitRouteModal(true)}
                    className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-md border border-purple-200 dark:border-purple-800/60 transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Split size={12} />
                    <span>拆分新路线</span>
                  </button>
                </div>

                {missionState.memberRoutes.map((mr, mrIdx) => (
                  <div
                    key={`ctrl-mr-${mr.memberId}-${mrIdx}`}
                    className="p-3 bg-white dark:bg-zinc-900 rounded-md border border-[#E4E6EB] dark:border-zinc-800 hover:border-[#1877F2] transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <WaveAvatar
                          src={mr.memberAvatar}
                          name={mr.memberName}
                          size={28}
                          isCaptain={mr.memberId === squad.leaderId}
                          badgeIcon={squad.borderConfig.badge}
                          borderConfig={squad.borderConfig}
                        />
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">{mr.memberName}</div>
                          <div className="text-[10px] text-gray-500 dark:text-zinc-400">
                            可见范围: {mr.visibilityScope === 'squad_only' ? '小队可见' : '小组公开'}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold border ${
                          mr.status === 'blocked'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] dark:text-blue-400 border-blue-200 dark:border-blue-800/60'
                        }`}
                      >
                        {mr.status === 'blocked' ? '⚠️ 路线阻塞' : '推进中'}
                      </span>
                    </div>

                    {/* Waypoints Sequence Chips */}
                    <div className="flex flex-wrap items-center gap-1">
                      {mr.waypointIds.map((wId, i) => {
                        const wObj = missionState.waypoints.find((w) => w.id === wId);
                        return (
                          <span
                            key={`mr-wpid-${mr.memberId}-${wId}-${i}`}
                            className="text-[10px] px-1.5 py-0.5 bg-[#F8FAFC] dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 rounded-sm text-gray-700 dark:text-zinc-300 flex items-center space-x-1"
                          >
                            <span>{i + 1}.</span>
                            <span className="truncate max-w-[90px]">{wObj?.name || wId}</span>
                          </span>
                        );
                      })}
                    </div>

                    <div className="text-[11px] text-gray-600 dark:text-zinc-300 bg-[#F8FAFC] dark:bg-zinc-800/80 p-2 rounded-sm border border-gray-100 dark:border-zinc-700">
                      <span className="font-bold text-gray-700 dark:text-zinc-200">完成条件: </span>
                      <span>{mr.completionCondition}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: TACTICAL BOUND TASKS */}
            {activeTab === 'tasks' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-[#E4E6EB] dark:border-zinc-800">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">路线绑定任务清单</h3>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400">任务与地理坐标联动，拖拽点位自动重新计算ETA</p>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">共 {missionState.tacticalTasks.length} 项</span>
                </div>

                {missionState.tacticalTasks.map((task, tIdx) => {
                  const boundWp = missionState.waypoints.find(
                    (w) => w.id === task.boundWaypointId || w.boundTaskId === task.id
                  );
                  const isSelected = selectedTaskId === task.id;

                  return (
                    <div
                      key={`ctrl-task-${task.id}-${tIdx}`}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`p-3 bg-white dark:bg-zinc-900 rounded-md border transition-all space-y-2 shadow-2xs cursor-pointer ${
                        isSelected ? 'border-[#1877F2] ring-1 ring-[#1877F2]' : 'border-[#E4E6EB] dark:border-zinc-800 hover:border-[#1877F2]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{task.title}</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-xs font-mono font-black shrink-0">
                              ETA {task.dueTime}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-zinc-400 flex items-center space-x-1 mt-0.5">
                            <span>执行人: {task.assigneeName}</span>
                            <span>·</span>
                            <span>预计: {task.estimatedDurationMinutes}分钟</span>
                            {boundWp && (
                              <>
                                <span>·</span>
                                <span className="text-[#1877F2] dark:text-blue-400 font-semibold truncate max-w-[120px]">📍 {boundWp.name}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTask(task);
                            setEditDurationMinutes(task.estimatedDurationMinutes);
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold text-[#1877F2] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded-md hover:bg-blue-100 cursor-pointer shrink-0"
                        >
                          改时长
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-600 dark:text-zinc-300 space-y-1 bg-[#F8FAFC] dark:bg-zinc-800/80 p-2 rounded-sm border border-gray-100 dark:border-zinc-700">
                        <div>
                          <span className="font-bold text-gray-700 dark:text-zinc-200">到达触发: </span>
                          <span>{task.arrivalTrigger}</span>
                        </div>
                        <div>
                          <span className="font-bold text-gray-700 dark:text-zinc-200">完成条件: </span>
                          <span>{task.completionCondition}</span>
                        </div>
                        {task.associatedDocTitle && (
                          <div className="flex items-center space-x-1 text-[#1877F2] dark:text-blue-400">
                            <FileText size={11} />
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                if (task.associatedDocId && onOpenDoc) onOpenDoc(task.associatedDocId);
                              }}
                              className="hover:underline cursor-pointer font-bold truncate"
                            >
                              关联文档: {task.associatedDocTitle}
                            </span>
                          </div>
                        )}
                      </div>

                      {task.isBlocked && (
                        <div className="text-[10px] text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 p-1.5 rounded-sm border border-rose-200 dark:border-rose-800/60 flex items-center space-x-1 font-bold">
                          <AlertTriangle size={12} />
                          <span>阻塞原因: {task.blockedReason || '天气超标'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 4: TIMELINE & SQUAD BROADCASTS */}
            {activeTab === 'timeline' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#E4E6EB] dark:border-zinc-800">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">行动时间轴与全队播报</h3>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400">实时作战日志同步 · 包含指令下达与自动打卡事件</p>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">{missionState.timeline.length} 条记录</span>
                </div>

                <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4E6EB] dark:before:bg-zinc-800">
                  {missionState.timeline.map((ev, evIdx) => (
                    <div key={`ctrl-ev-${ev.id}-${evIdx}`} className="relative text-xs">
                      {/* Dot */}
                      <div
                        className={`absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                          ev.type === 'arrival'
                            ? 'bg-emerald-500'
                            : ev.type === 'blocked'
                            ? 'bg-rose-500'
                            : ev.type === 'reroute'
                            ? 'bg-purple-500'
                            : ev.type === 'end'
                            ? 'bg-gray-800 dark:bg-zinc-300'
                            : 'bg-[#1877F2]'
                        }`}
                      />

                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="font-bold text-gray-900 dark:text-white">{ev.title}</span>
                        <span className="text-gray-400 dark:text-zinc-500 text-[10px] font-mono">{ev.time}</span>
                      </div>

                      <p className="text-[11px] text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/80 p-2 rounded-sm border border-gray-100 dark:border-zinc-700">
                        {ev.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {/* A. Add Waypoint Modal */}
      {showAddWaypointModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-md border border-[#E4E6EB] dark:border-zinc-800 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">在地图上添加新坐标点</h3>
              <button onClick={() => setShowAddWaypointModal(false)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 p-1 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">坐标点名称</label>
                <input
                  type="text"
                  value={newWpName}
                  onChange={(e) => setNewWpName(e.target.value)}
                  placeholder="如：白塔山东门售票处"
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-md focus:border-[#1877F2] outline-none placeholder-gray-400 dark:placeholder-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">点位类型</label>
                  <select
                    value={newWpType}
                    onChange={(e) => setNewWpType(e.target.value as WaypointType)}
                    className="w-full px-2 py-1.5 border border-[#E4E6EB] dark:border-zinc-700 rounded-md outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  >
                    <option value="checkpoint">检查点</option>
                    <option value="task">任务点</option>
                    <option value="supply">补给点</option>
                    <option value="hazard">危险提示</option>
                    <option value="gathering">集合点</option>
                    <option value="destination">终点</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">绑定负责人</label>
                  <select
                    value={newWpAssignedMember}
                    onChange={(e) => setNewWpAssignedMember(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#E4E6EB] dark:border-zinc-700 rounded-md outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                  >
                    {members.map((m, mIdx) => (
                      <option key={`wp-mopt-${m.id}-${mIdx}`} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">完成条件 / 触发内容</label>
                <input
                  type="text"
                  value={newWpCondition}
                  onChange={(e) => setNewWpCondition(e.target.value)}
                  placeholder="如：全员拍照打卡 / 设备基准校准"
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-md focus:border-[#1877F2] outline-none placeholder-gray-400 dark:placeholder-zinc-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E6EB] dark:border-zinc-800 flex justify-end space-x-2">
              <button
                onClick={() => setShowAddWaypointModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleAddWaypoint}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#1877F2] rounded-md hover:bg-[#166FE5] cursor-pointer"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B. Plan Total Route Modal */}
      {showPlanRouteModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-md border border-[#E4E6EB] dark:border-zinc-800 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">规划小队总路线</h3>
              <button onClick={() => setShowPlanRouteModal(false)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 p-1 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">行动起点 (集合)</label>
                <input
                  type="text"
                  value={startPointInput}
                  onChange={(e) => setStartPointInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-md outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">行动终点 (会师)</label>
                <input
                  type="text"
                  value={endPointInput}
                  onChange={(e) => setEndPointInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-md outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E6EB] dark:border-zinc-800 flex justify-end space-x-2">
              <button
                onClick={() => setShowPlanRouteModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSavePlannedRoute}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#1877F2] rounded-md hover:bg-[#166FE5] cursor-pointer"
              >
                保存总路线
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. Edit Task Duration Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-md border border-[#E4E6EB] dark:border-zinc-800 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">修改任务预计时长</h3>
              <button onClick={() => setEditingTask(null)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 p-1 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-gray-800 dark:text-zinc-200">{editingTask.title}</div>
              <div>
                <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">预计执行时长 (分钟)</label>
                <input
                  type="number"
                  value={editDurationMinutes}
                  onChange={(e) => setEditDurationMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-md outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E6EB] dark:border-zinc-800 flex justify-end space-x-2">
              <button
                onClick={() => setEditingTask(null)}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveTaskDuration}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#1877F2] rounded-md hover:bg-[#166FE5] cursor-pointer"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D. Split Route Modal */}
      {showSplitRouteModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-md border border-[#E4E6EB] dark:border-zinc-800 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">拆分总路线为队员子路线</h3>
              <button onClick={() => setShowSplitRouteModal(false)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 p-1 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">选择分配队员</label>
                <select
                  value={splitTargetMemberId}
                  onChange={(e) => setSplitTargetMemberId(e.target.value)}
                  className="w-full px-2 py-1.5 border border-[#E4E6EB] dark:border-zinc-700 rounded-md outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                >
                  {members.map((m, mIdx) => (
                    <option key={`split-mopt-${m.id}-${mIdx}`} value={m.id}>
                      {m.name} ({m.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">可见范围</label>
                <select
                  value={splitVisibility}
                  onChange={(e) => setSplitVisibility(e.target.value as any)}
                  className="w-full px-2 py-1.5 border border-[#E4E6EB] dark:border-zinc-700 rounded-md outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                >
                  <option value="squad_only">小队成员可见 (保密)</option>
                  <option value="group_public">全小组公开</option>
                  <option value="leader_only">仅队长可见</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-zinc-300 block mb-1">完成条件</label>
                <input
                  type="text"
                  value={splitCompletionCond}
                  onChange={(e) => setSplitCompletionCond(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-md outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E6EB] dark:border-zinc-800 flex justify-end space-x-2">
              <button
                onClick={() => setShowSplitRouteModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveSplitRoute}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#1877F2] rounded-md hover:bg-[#166FE5] cursor-pointer"
              >
                确认拆分路线
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
