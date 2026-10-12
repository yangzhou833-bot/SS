export type GroupRole = 'leader' | 'admin' | 'squad_leader' | 'squad_member' | 'member';

export type LocationConsentStatus = 'agreed_work_hours' | 'unauthorized' | 'squad_temporary' | 'stealth_mode';

export type LocationRuleState = 'working' | 'off_duty' | 'paused';

export interface RegionAnimalConfig {
  region: '甘肃' | '四川' | '陕西' | '云南' | '新疆';
  animalName: string;
  iconName: string; // e.g. 'camel' | 'panda' | 'ibis' | 'monkey' | 'horse'
  emoji: string;
  description: string;
}

export interface SquadBorderConfig {
  color: string; // e.g. '#1877F2', '#FA383E', '#00A400', '#8B5CF6', '#F7931A'
  style: 'solid' | 'double' | 'dashed';
  badge: string; // '⚡' | '🛡️' | '🧭' | '🎯' | '🔥'
  name: string;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: GroupRole;
  roleLabel: string;
  department: string;
  locationConsent: LocationConsentStatus;
  isArrivedOffice: boolean;
  distanceFromOfficeMeters: number;
  currentCoords?: [number, number];
  lastReportTime: string;
  squadId?: string;
  squadBorder?: SquadBorderConfig;
  statusText: string;
  joinDate: string;
  consentTime?: string;
}

export interface GroupWorkSchedule {
  workDays: string[]; // e.g. ['周一', '周二', '周三', '周四', '周五']
  startTime: string; // '09:00'
  endTime: string; // '18:00'
  timezone: string; // 'Asia/Shanghai'
  officeName: string; // 'Stellar 兰州办公室'
  officeCoords: [number, number]; // [36.0611, 103.8343]
  effectiveRadiusMeters: number; // 300
  isWorkingNow: boolean;
  locationRuleState: LocationRuleState;
  holidayExceptions: string[];
}

export type SquadStatus = 'preparing' | 'active' | 'paused' | 'completed';

export interface SquadItem {
  id: string;
  name: string;
  targetGoal: string;
  leaderId: string;
  leaderName: string;
  leaderAvatar: string;
  memberIds: string[];
  members: GroupMember[];
  description: string;
  borderConfig: SquadBorderConfig;
  startTime: string; // '09:30'
  endTime: string; // '17:30'
  gatheringPoint: string; // '兰州中山桥南广场'
  gatheringCoords: [number, number];
  visibilityRange: 'squad_only' | 'group_public';
  associatedDocIds: string[];
  status: SquadStatus;
  progress: number; // 0 - 100
  recentChatSnippet: string;
  endedAt?: string;
}

export type TaskStatus =
  | 'pending_accept'
  | 'accepted'
  | 'in_progress'
  | 'blocked'
  | 'under_review'
  | 'completed'
  | 'cancelled';

export interface TaskStepItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskActivityLog {
  id: string;
  time: string;
  text: string;
  user: string;
  avatar: string;
}

export interface GroupTaskItem {
  id: string;
  title: string;
  targetGoal: string;
  assigneeName: string;
  assigneeAvatar: string;
  assigneeRole: string;
  dueDate: string;
  gatheringPoint: string;
  status: TaskStatus;
  priority: 'high' | 'medium' | 'low';
  steps: TaskStepItem[];
  associatedDocIds: string[];
  locationWindow: string;
  activityLogs: TaskActivityLog[];
  squadId?: string;
  squadName?: string;
}

export type InTeamChatMode = 'squad_channel' | 'task_thread' | 'status_broadcast' | 'emergency_broadcast';

export interface SquadChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  time: string;
  content: string;
  mode: InTeamChatMode;
  isSelf: boolean;
  isEmergency?: boolean;
  acknowledgedUserIds?: string[];
  locationStatusCard?: {
    locationName: string;
    time: string;
    isArrived: boolean;
    accuracy: string;
  };
  attachedFile?: {
    name: string;
    size: string;
    type: string;
  };
  threadReplies?: {
    id: string;
    senderName: string;
    senderAvatar: string;
    content: string;
    time: string;
  }[];
  isResolved?: boolean;
  squadBorder?: SquadBorderConfig;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  operatorName: string;
  operatorAvatar: string;
  actionType: 'rule_update' | 'squad_created' | 'member_role' | 'consent_changed' | 'task_updated' | 'broadcast_sent';
  title: string;
  details: string;
  impactScope: string;
}

export interface GroupAnnouncement {
  id: string;
  title: string;
  content: string;
  publishTime: string;
  publisherName: string;
  publisherAvatar: string;
  isPinned: boolean;
  isEmergency?: boolean;
  readCount: number;
}

// -------------------------------------------------------------
// 小队行动指挥台 (Squad Mission Control & Tactical Routing)
// -------------------------------------------------------------
export type WaypointType =
  | 'gathering'     // 集合点
  | 'checkpoint'    // 检查点
  | 'task'          // 任务点
  | 'supply'        // 补给点
  | 'hazard'        // 危险提示
  | 'destination';  // 终点

export interface MissionWaypoint {
  id: string;
  name: string;
  type: WaypointType;
  coords: [number, number]; // [lat, lng]
  description?: string;
  orderIndex: number;
  assignedMemberIds?: string[];
  boundTaskId?: string;
  arrivalTriggerRadiusMeters?: number; // default 50m
  isArrived?: boolean;
  arrivedTime?: string;
  completionCondition?: string; // e.g. "打卡签到 / 拍摄照片 / 耗材自检"
  hazardNotice?: string;
}

export interface MemberAssignedRoute {
  memberId: string;
  memberName: string;
  memberAvatar: string;
  routeColor: string;
  waypointIds: string[]; // 坐标点到达顺序
  visibilityScope: 'squad_only' | 'group_public' | 'leader_only';
  completionCondition: string; // 完成条件
  boundTaskId?: string;
  status: 'pending' | 'in_progress' | 'arrived' | 'blocked' | 'rerouted' | 'completed';
  currentCoords?: [number, number];
  deviationNotice?: string;
}

export interface TacticalMissionTask {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string;
  assigneeRole: string;
  startTime: string; // '09:30'
  dueTime: string;   // '11:00'
  estimatedDurationMinutes: number; // 预计时长 (分钟)
  arrivalTrigger: string; // e.g. "进入中山桥南广场50米自动触发"
  completionCondition: string; // e.g. "完成差分基准站校准并上传数据"
  associatedDocTitle?: string; // 关联文档
  associatedDocId?: string;
  boundWaypointId?: string;
  status: TaskStatus;
  isOverdue?: boolean;
  isBlocked?: boolean;
  blockedReason?: string;
}

export interface TacticalTimelineEvent {
  id: string;
  time: string;
  title: string;
  type: 'order' | 'arrival' | 'overdue' | 'blocked' | 'reroute' | 'doc' | 'end';
  operatorName: string;
  operatorAvatar: string;
  description: string;
  squadId: string;
  statusTag?: string;
}

export interface SquadMissionTacticalState {
  squadId: string;
  missionStatus: 'preparing' | 'in_progress' | 'paused' | 'blocked' | 'rerouted' | 'completed' | 'ended';
  startLocationName: string;
  startCoords: [number, number];
  endLocationName: string;
  endCoords: [number, number];
  totalRoutePoints: [number, number][]; // 规划总路线坐标序列
  isRerouted?: boolean;
  reroutedRoutePoints?: [number, number][];
  waypoints: MissionWaypoint[];
  memberRoutes: MemberAssignedRoute[];
  tacticalTasks: TacticalMissionTask[];
  timeline: TacticalTimelineEvent[];
  actionCountdownSeconds: number; // 行动倒计时 (秒)
  isLiveLocationActive: boolean; // 是否开启实时定位，结束后仅保留摘要
  activeCommandOrder?: 'gathering' | 'departure' | 'arrival' | 'pause' | 'reroute' | 'block' | 'complete' | 'end_mission';
  missionSummary?: {
    totalDurationMinutes: number;
    completedWaypointsCount: number;
    totalWaypointsCount: number;
    completedTasksCount: number;
    totalTasksCount: number;
    endTimestamp: string;
    finalStatusReport: string;
  };
}
