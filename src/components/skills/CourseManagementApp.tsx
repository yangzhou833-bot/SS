import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  MoreHorizontal,
  BookOpen,
  UserCheck,
  TrendingUp,
  QrCode,
  Calendar,
  FileText,
  User,
  Clock,
  Check,
  ChevronRight,
  Home,
  CalendarCheck,
  CalendarDays,
  PieChart,
  UserCircle,
  Loader2,
  X,
  Award,
  Medal,
  Trophy,
  Star,
  Zap,
  Sparkles,
  Share2,
  Target,
  Lock,
  CheckCircle2,
  Sliders,
  Bell,
  HelpCircle,
  Radio,
  MapPin,
  Users,
  Plus,
  AlertCircle,
  Compass,
  ShieldCheck,
  Maximize2,
  Eye,
  Settings,
  Layers,
  Info,
  CheckSquare,
  Wifi,
  Battery,
  GraduationCap,
  Building,
  Mail,
  Smartphone,
  Edit3,
  FileSpreadsheet,
  Activity,
  ChevronUp,
  ChevronDown,
  PlusCircle,
  BarChart3,
  AlertTriangle,
  ArrowLeft,
  TowerControl,
  Image as ImageIcon,
  Search,
  WifiOff,
  RefreshCw,
  Database,
  CloudOff,
  CloudCheck,
  School
} from 'lucide-react';
import { CustomMapMarker } from '../../types';
import {
  StudentWorkspaceView,
  MonitorWorkspaceView,
  TAWorkspaceView,
  AdviserWorkspaceView,
  AdminWorkspaceView,
} from '../roles/RoleWorkspaceViews';
import { AttendanceAnalyticsDashboard } from './AttendanceAnalyticsDashboard';
import { CourseScheduleTimetable } from './CourseScheduleTimetable';
import { IdentitySelectionModal, UserIdentityProfile } from './IdentitySelectionModal';
import { CreateCourseFormView } from './CreateCourseFormView';
import { BeaconMapPreviewModal } from './BeaconMapPreviewModal';
import { soundEffects } from '../../utils/soundEffects';
import { haptics } from '../../utils/haptics';

export interface ClassListItem {
  id: string;
  name: string;
  shortCode: string;
  count: number;
  adviser: string;
  dept: string;
}

export type UserRole = 'instructor' | 'adviser' | 'monitor' | 'student' | 'ta' | 'admin';

export interface CourseManagementAppProps {
  onClose?: () => void;
  showToast?: (msg: string) => void;
  requestedTab?: 'attendance' | 'create' | 'analytics' | 'badges' | 'mycourses';
  initialRole?: UserRole;
  onRoleChange?: (newRole: UserRole) => void;
  calendarTrigger?: number;
  addCourseMenuTrigger?: number;
  onLightUpBeacon?: (beacon: { teacher: string; courseName: string; lat: number; lng: number; room: string }) => void;
}

export const ROLE_CONFIGS: Record<UserRole, {
  name: string;
  title: string;
  characterName: string;
  characterId: string;
  dept: string;
  avatar: string;
  badgeClass: string;
  tabNames: string[];
}> = {
  instructor: {
    name: '领航员',
    title: '任课教师 / 教授',
    characterName: '张立华 教授',
    characterId: 'TEA-202488',
    dept: '计算机科学与技术学院',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    badgeClass: 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]/30',
    tabNames: ['电子考勤', '我的课程'],
  },
  ta: {
    name: '副领航员',
    title: '课程助教 / 实验员',
    characterName: '王助教 (硕士生)',
    characterId: 'TA-202401',
    dept: '高级算法与AI课程组',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    tabNames: ['助教考勤', '假条审核', '离线同步', '我的课程'],
  },
  adviser: {
    name: '星区守护者',
    title: '院系辅导员 / 团委书记',
    characterName: '李辅导员',
    characterId: 'ADV-2019',
    dept: '计算机科学学院 · 学工办',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-300',
    tabNames: ['全院预警', '假条终审', '学情看板', '班级学生'],
  },
  monitor: {
    name: '班级守护者',
    title: '小班班长 / 团支书',
    characterName: '赵班长 (计科2401)',
    characterId: '2024CS0801',
    dept: '计科2024级一班 (32人)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    tabNames: ['班级考勤', '一键催到', '现场核查', '班级课表'],
  },
  student: {
    name: '星航者',
    title: '选课学生 / 学员',
    characterName: '陈星航 (本科生)',
    characterId: '2024CS0805',
    dept: '计科2024级一班',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-300',
    tabNames: ['信标打卡', '我的课表', '成长徽章', '请假申请'],
  },
  admin: {
    name: '星系管理员',
    title: '校教务处处级管理者',
    characterName: '林教务长',
    characterId: 'ADM-0001',
    dept: '学校教务处 · 教学运行科',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-300',
    tabNames: ['全校总览', '学院对比', '宏观学情', '周历调度'],
  },
};

export interface LeaveNoteItem {
  type: 'sick' | 'personal' | 'official' | 'late_makeup';
  reason: string;
  proofImage?: string;
  submittedAt: string;
  approvedAt?: string;
  approver?: string;
  noteStatus: 'pending' | 'approved' | 'rejected';
  hospitalOrOrg?: string;
  leaveDate?: string;
  doctorAdvice?: string;
}

export interface OfflineAttendanceRecord {
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  checkInTimestamp: number;
  formattedTime: string;
  beaconRssi: number;
  offlineReason: 'network_offline' | 'beacon_weak_signal' | 'campus_gateway_timeout';
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  cachedLocallyAt: number;
  retryCount: number;
}

export interface StudentItem {
  id: string;
  name: string;
  studentId?: string; // 学号，如 2024CS0805
  avatar: string;
  status: 'absent_gray' | 'in_geofence' | 'checked_in' | 'leave_approved' | 'official_leave';
  geofenceDistanceMeters: number;
  timerMinutesRemaining: number;
  isMissed?: boolean;
  colorBg: string;
  className?: string;
  absentCount?: number; // 学期累计缺勤次数
  consecutiveAbsent?: number; // 连续缺勤次数
  riskLevel?: 'high' | 'medium' | 'low'; // 缺勤风险等级
  leaveNote?: LeaveNoteItem;
  manualRemarks?: string;
  auditTime?: string;
  latestChangeReason?: string; // e.g. '请假销假' | '人工补录' | '竞赛公假' | '信标入圈' | '旷课未到' | '假条待审'
  auditNote?: string; // 审核批注 (在头像气泡悬停时展示)
  isOfflineCached?: boolean; // 离线/弱网本地缓存待同步
  offlineCheckInTimestamp?: number; // 离线打卡发生时的精确时间戳
  offlineSyncStatus?: 'pending' | 'syncing' | 'synced'; // 本地缓存与服务器同步状态
}

export interface CourseItem {
  id: string;
  name: string;
  teacher: string;
  schedule: string;
  classroom: string;
  groupType: 'small' | 'large';
  classes: string[];
  beaconLat: number;
  beaconLng: number;
  beaconRadius: number;
  status: 'ongoing' | 'upcoming' | 'completed';
  attendancePct: number;
  checkedCount: number;
  totalCount: number;
  hasBeaconIcon: boolean;
  isIntroductory?: boolean; // 是否为介绍类/公开导论课程（不可修改）
  introText?: string; // 介绍课程说明文本
}

export interface BadgeItem {
  id: string;
  title: string;
  category: string;
  iconName: 'award' | 'medal' | 'trophy' | 'star' | 'zap' | 'sparkles';
  isUnlocked: boolean;
  unlockDate?: string;
  progressPct: number;
  shortDesc: string;
  pathDescription: {
    overview: string;
    steps: string[];
    reward: string;
    currentStatusText: string;
  };
  gradient: string;
}

// Helper to derive 8-week student absence trend line chart data
const getStudentTrendData = (absentCount: number, studentId: string): number[] => {
  if (absentCount === 0) return [0, 0, 0, 0, 0, 0, 0, 0];
  if (absentCount === 1) return [0, 0, 0, 1, 1, 1, 1, 1];
  if (absentCount === 2) return [0, 0, 1, 1, 1, 2, 2, 2];
  if (absentCount === 3) return [0, 1, 1, 2, 2, 3, 3, 3];
  if (absentCount === 4) return [0, 1, 1, 2, 3, 3, 4, 4];
  if (absentCount === 5) return [0, 1, 2, 3, 4, 4, 5, 5];
  if (absentCount >= 6) return [0, 1, 2, 3, 4, 5, 6, Math.min(absentCount, 8)];
  
  const hash = (studentId || 'stu').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const start = hash % 2;
  return [0, start, start, start + 1, start + 2, start + 2, Math.max(0, absentCount - 1), absentCount];
};

const INITIAL_STUDENTS: StudentItem[] = [
  {
    id: 's1',
    name: '陈志强',
    studentId: '2024CS0801',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    status: 'absent_gray',
    geofenceDistanceMeters: 120,
    timerMinutesRemaining: 30,
    colorBg: 'bg-emerald-500',
    className: 'CS101 计科一班',
    absentCount: 1,
    consecutiveAbsent: 0,
    riskLevel: 'low',
    latestChangeReason: '假条待审',
    auditNote: '已出示校医院急诊挂号凭据，待任课教师统一核准并核销旷课',
    auditTime: '今日 09:20',
    leaveNote: {
      type: 'sick',
      reason: '因急性肠胃炎于校医院急诊就医，附就诊挂号单及医嘱证明',
      submittedAt: '今日 09:15',
      hospitalOrOrg: '兰州大学校医院 (急诊科)',
      doctorAdvice: '建议留观补液，休息半天',
      proofImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600',
      noteStatus: 'pending',
    },
  },
  {
    id: 's2',
    name: '邓雅文',
    studentId: '2024CS0802',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'absent_gray',
    geofenceDistanceMeters: 85,
    timerMinutesRemaining: 30,
    colorBg: 'bg-indigo-500',
    className: 'CS101 计科一班',
    absentCount: 1,
    consecutiveAbsent: 1,
    riskLevel: 'low',
    latestChangeReason: '请假销假',
    auditNote: '辅导员王老师已批准事假半天，已查验纸质批条，准予销假',
    auditTime: '今日 08:45',
    leaveNote: {
      type: 'personal',
      reason: '家庭突发急事并已向辅导员提交纸质请假条报备',
      submittedAt: '今日 08:30',
      hospitalOrOrg: '计算机学院学生工作办公室',
      doctorAdvice: '辅导员王老师已批准事假半天',
      proofImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
      noteStatus: 'approved',
    },
  },
  {
    id: 's3',
    name: '高海峰',
    studentId: '2024CS0803',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    status: 'absent_gray',
    geofenceDistanceMeters: 160,
    timerMinutesRemaining: 30,
    colorBg: 'bg-amber-500',
    className: 'CS101 计科一班',
    absentCount: 4,
    consecutiveAbsent: 2,
    riskLevel: 'high',
    latestChangeReason: '假条待审',
    auditNote: '体温38.6℃附附属医院发热门诊诊断单，待讲师复核销假',
    auditTime: '昨日 20:00',
    leaveNote: {
      type: 'sick',
      reason: '高热咽痛上呼吸道感染，校医院诊断开具休养建议单',
      submittedAt: '昨日 19:40',
      hospitalOrOrg: '校附属医院发热门诊',
      doctorAdvice: '体温 38.6℃，建议居家休息隔离 1 天',
      proofImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600',
      noteStatus: 'pending',
    },
  },
  {
    id: 's4',
    name: '黄婷婷',
    studentId: '2024CS0804',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    status: 'absent_gray',
    geofenceDistanceMeters: 1100,
    timerMinutesRemaining: 30,
    colorBg: 'bg-rose-500',
    className: 'CS102 计科二班',
    absentCount: 2,
    consecutiveAbsent: 0,
    riskLevel: 'medium',
    latestChangeReason: '竞赛公假',
    auditNote: '代表学院参加全国算法精英赛选拔，公假公函真实合规',
    auditTime: '今日 08:00',
    leaveNote: {
      type: 'official',
      reason: '代表学院参加全国大学生软件测试与算法精英邀请赛半决赛选拔',
      submittedAt: '今日 07:50',
      hospitalOrOrg: '学院竞赛与实践教学中心',
      doctorAdvice: '竞赛负责人张主任已签字审批公假',
      proofImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
      noteStatus: 'pending',
    },
  },
  {
    id: 's5',
    name: '李明轩',
    studentId: '2024CS0805',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'absent_gray',
    geofenceDistanceMeters: 210,
    timerMinutesRemaining: 30,
    colorBg: 'bg-cyan-500',
    className: 'CS102 计科二班',
    absentCount: 6,
    consecutiveAbsent: 3,
    riskLevel: 'high',
    latestChangeReason: '假条待审',
    auditNote: '校医院急诊科静脉输液证明待核实，连续缺席已亮起预警',
    auditTime: '今日 10:15',
    leaveNote: {
      type: 'sick',
      reason: '突发急性肠胃炎与脱水，校医院急诊输液留观，事后出示急诊诊断证明书',
      submittedAt: '今日 10:10',
      hospitalOrOrg: '兰州大学校医院急诊科',
      doctorAdvice: '予以静脉输液支持，建议静养休假，暂缓上课',
      proofImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600',
      noteStatus: 'pending',
    },
  },
  {
    id: 's6',
    name: '刘梓晨',
    studentId: '2024CS0806',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    status: 'absent_gray',
    geofenceDistanceMeters: 30,
    timerMinutesRemaining: 30,
    colorBg: 'bg-purple-500',
    className: 'CS102 计科二班',
    absentCount: 0,
    consecutiveAbsent: 0,
    riskLevel: 'low',
    latestChangeReason: '旷课未到',
    auditNote: '距离信标30m暂未进入考勤圈，尚未提交请假证明',
    auditTime: '今日 10:00',
  },
  {
    id: 's7',
    name: '马丽华',
    studentId: '2024CS0807',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'absent_gray',
    geofenceDistanceMeters: 95,
    timerMinutesRemaining: 30,
    colorBg: 'bg-teal-500',
    className: 'CS104 计科四班',
    absentCount: 1,
    consecutiveAbsent: 0,
    riskLevel: 'low',
    latestChangeReason: '旷课未到',
    auditNote: '未在教室蓝牙范围内检测到打卡信号，已下发督学推送',
    auditTime: '今日 10:00',
  },
  {
    id: 's8',
    name: '潘建国',
    studentId: '2024CS0808',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'absent_gray',
    geofenceDistanceMeters: 180,
    timerMinutesRemaining: 30,
    colorBg: 'bg-blue-600',
    className: 'CS104 计科四班',
    absentCount: 3,
    consecutiveAbsent: 1,
    riskLevel: 'medium',
    latestChangeReason: '人工补录',
    auditNote: '手机蓝牙模块故障无法自动打卡，已在实验室就座由班长证实，待讲师补录实到',
    auditTime: '今日 10:05',
    leaveNote: {
      type: 'late_makeup',
      reason: '手机定位蓝牙模块故障无法自动打卡，已在教室前排就座，申请教师现场补签',
      submittedAt: '今日 10:05',
      hospitalOrOrg: '3-101 实验室现场核验',
      doctorAdvice: '同班同学与班长现场证实已按时到课',
      noteStatus: 'pending',
    },
  },
  {
    id: 's9',
    name: '任小宇',
    studentId: '2024CS0809',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    status: 'absent_gray',
    geofenceDistanceMeters: 25,
    timerMinutesRemaining: 30,
    colorBg: 'bg-orange-500',
    className: 'CS104 计科四班',
    absentCount: 0,
    consecutiveAbsent: 0,
    riskLevel: 'low',
    latestChangeReason: '旷课未到',
    auditNote: '未检测到电子签到凭据，已进入考勤待补录名单',
    auditTime: '今日 10:00',
  },
  {
    id: 's10',
    name: '宋嘉豪',
    studentId: '2024CS0810',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    status: 'absent_gray',
    geofenceDistanceMeters: 140,
    timerMinutesRemaining: 30,
    colorBg: 'bg-[#1877F2]',
    className: 'CS101 计科一班',
    absentCount: 2,
    consecutiveAbsent: 0,
    riskLevel: 'medium',
    latestChangeReason: '旷课未到',
    auditNote: '累计旷课2次，待辅导员督促补录或提交事后假条',
    auditTime: '今日 10:00',
  },
  {
    id: 's11',
    name: '唐雨薇',
    studentId: '2024CS0811',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    status: 'absent_gray',
    geofenceDistanceMeters: 15,
    timerMinutesRemaining: 30,
    colorBg: 'bg-pink-600',
    className: 'CS102 计科二班',
    absentCount: 0,
    consecutiveAbsent: 0,
    riskLevel: 'low',
    latestChangeReason: '旷课未到',
    auditNote: '距信标15m尚未打卡',
    auditTime: '今日 10:00',
  },
  {
    id: 's12',
    name: '王威龙',
    studentId: '2024CS0812',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    status: 'absent_gray',
    geofenceDistanceMeters: 300,
    timerMinutesRemaining: 30,
    colorBg: 'bg-slate-600',
    className: 'CS104 计科四班',
    absentCount: 5,
    consecutiveAbsent: 2,
    riskLevel: 'high',
    latestChangeReason: '旷课未到',
    auditNote: '累计旷课5次（高危预警），期末考试资格预警已触发',
    auditTime: '今日 10:00',
  },
];

export const INITIAL_CALENDAR_DAYS = [
  {
    num: 12,
    weekday: '周一',
    course: '数据结构与算法',
    room: '3-101 计算机实验室',
    time: '10:00 - 12:00',
    isTaught: true,
    isUpcoming: false,
    rate: 93.8,
    checked: 30,
    total: 32,
    absent: [
      { name: '李明轩', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', reason: '围栏外 120m', status: '缺勤/离线' },
      { name: '邓雅文', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', reason: '请假 (病假已报备)', status: '事假报备' },
    ],
    plan: '第 8 讲：树与二叉树赫夫曼树构建 · 实验课重点：动态图表模拟与无感签到考勤',
  },
  {
    num: 13,
    weekday: '周二',
    course: '学术导师答疑 (Office Hour)',
    room: '理科楼 3-402 办公室',
    time: '14:30 - 16:30',
    isTaught: true,
    isUpcoming: false,
    rate: 100,
    checked: 15,
    total: 15,
    absent: [],
    plan: '号纲咨询与本周论文大作业问题解答',
  },
  {
    num: 14,
    weekday: '周三',
    course: '操作系统原理与实验',
    room: '5-203 嵌入式中心',
    time: '14:00 - 16:00',
    isTaught: true,
    isUpcoming: false,
    rate: 96.9,
    checked: 31,
    total: 32,
    absent: [
      { name: '高海峰', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', reason: '未签到 (距教室 160m)', status: '未到课' },
    ],
    plan: '第 6 讲：进程调度与死锁避免算法 · 实验课重点：多线程互斥锁实训',
  },
  {
    num: 15,
    weekday: '周四',
    course: '软件工程实训研讨',
    room: '学院创新研讨厅',
    time: '09:00 - 11:30',
    isTaught: true,
    isUpcoming: false,
    rate: 94.1,
    checked: 16,
    total: 17,
    absent: [
      { name: '黄婷婷', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', reason: '竞赛公假报备', status: '公假' },
    ],
    plan: '敏捷开发与 Scrum 敏捷看板建模实操',
  },
  {
    num: 16,
    weekday: '周五',
    course: '数据库系统概论',
    room: '2-405 大报告厅',
    time: '08:00 - 10:00',
    isTaught: true,
    isUpcoming: false,
    rate: 90.6,
    checked: 29,
    total: 32,
    absent: [
      { name: '李明轩', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', reason: '未签到 (距教室 210m)', status: '未到课' },
      { name: '高海峰', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', reason: '未签到 (距教室 160m)', status: '未到课' },
      { name: '王威龙', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', reason: '未签到 (距教室 300m)', status: '缺勤' },
    ],
    plan: '第 5 讲：SQL 索引优化与事务隔离级别 · 实验课重点：高并发数据查询',
  },
  {
    num: 17,
    weekday: '周六',
    course: '无排课 (休息/自由备课)',
    room: '-',
    time: '-',
    isTaught: false,
    isUpcoming: false,
    rate: 0,
    checked: 0,
    total: 0,
    absent: [],
    plan: '周末自由时间，无课程排期',
  },
  {
    num: 18,
    weekday: '周日',
    course: '无排课 (休息/自由备课)',
    room: '-',
    time: '-',
    isTaught: false,
    isUpcoming: false,
    rate: 0,
    checked: 0,
    total: 0,
    absent: [],
    plan: '周末自由时间，无课程排期',
  },
  {
    num: 19,
    weekday: '周一',
    course: '数据结构与算法',
    room: '3-101 计算机实验室',
    time: '10:00 - 12:00',
    isTaught: false,
    isUpcoming: true,
    rate: 0,
    checked: 0,
    total: 32,
    absent: [],
    plan: '第 9 讲：图的遍历与最短路径 Dijkstra 算法',
  },
  {
    num: 20,
    weekday: '周二',
    course: '学术导师答疑 (Office Hour)',
    room: '理科楼 3-402 办公室',
    time: '14:30 - 16:30',
    isTaught: false,
    isUpcoming: true,
    rate: 0,
    checked: 0,
    total: 15,
    absent: [],
    plan: 'Office Hour 答疑与下半学期实训分组',
  },
  {
    num: 21,
    weekday: '周三',
    course: '操作系统原理与实验',
    room: '5-203 嵌入式中心',
    time: '14:00 - 16:00',
    isTaught: false,
    isUpcoming: true,
    rate: 0,
    checked: 0,
    total: 32,
    absent: [],
    plan: '第 7 讲：虚拟内存与页面置换 FIFO/LRU 算法实验',
  },
  {
    num: 22,
    weekday: '周四',
    course: '软件工程实训研讨',
    room: '学院创新研讨厅',
    time: '09:00 - 11:30',
    isTaught: false,
    isUpcoming: true,
    rate: 0,
    checked: 0,
    total: 17,
    absent: [],
    plan: '代码审查 (Code Review) 与 Git 工作流演练',
  },
  {
    num: 23,
    weekday: '周五',
    course: '数据库系统概论',
    room: '2-405 大报告厅',
    time: '08:00 - 10:00',
    isTaught: false,
    isUpcoming: true,
    rate: 0,
    checked: 0,
    total: 32,
    absent: [],
    plan: '第 6 讲：并发控制与 MVCC 数据库备份实操',
  },
  {
    num: 24,
    weekday: '周六',
    course: '无排课 (休息/自由备课)',
    room: '-',
    time: '-',
    isTaught: false,
    isUpcoming: false,
    rate: 0,
    checked: 0,
    total: 0,
    absent: [],
    plan: '周末自由时间，无课程排期',
  },
  {
    num: 25,
    weekday: '周日',
    course: '无排课 (休息/自由备课)',
    room: '-',
    time: '-',
    isTaught: false,
    isUpcoming: false,
    rate: 0,
    checked: 0,
    total: 0,
    absent: [],
    plan: '周末自由时间，无课程排期',
  },
];

const INITIAL_BADGES: BadgeItem[] = [
  {
    id: 'badge-attendance',
    title: '全勤导师勋章',
    category: '考勤管理',
    iconName: 'medal',
    isUnlocked: true,
    unlockDate: '2026-05-18',
    progressPct: 100,
    shortDesc: '单学期带课学生平均到课率保持 95% 以上',
    gradient: 'from-[#1877F2] to-blue-600',
    pathDescription: {
      overview: '表彰在课堂教学考勤管理中表现卓越、学生到课率持续名列前茅的教学导师。',
      steps: [
        '1. 创建并维护至少 2 门学期核心讲授课程；',
        '2. 连续 10 周开启 50 米地理围栏智能定位签到；',
        '3. 班级学生单学期综合平均到课率提升并稳定在 95% 以上。',
      ],
      reward: '解锁“全勤导师”专属金边主页徽章 + 获得全校优质课程推介权重',
      currentStatusText: '已达成！于 2026-05-18 荣获全勤导师认证',
    },
  },
  {
    id: 'badge-ds-master',
    title: '数据结构大师',
    category: '课程考勤',
    iconName: 'trophy',
    isUnlocked: true,
    unlockDate: '2026-06-02',
    progressPct: 100,
    shortDesc: '完成《数据结构与算法》全部 16 课时 30 分钟连续签到',
    gradient: 'from-[#1877F2] to-indigo-600',
    pathDescription: {
      overview: '授予在计算机专业核心基石课程中保持无缺勤、无迟到完美出勤记录的优秀学员。',
      steps: [
        '1. 进入 3-101 实验室 50 米 Beacon 地理围栏范围；',
        '2. 保持持续在位 30 分钟以上触发系统无感签到；',
        '3. 学期累计出勤积分达到 160 光点。',
      ],
      reward: '解锁“数据结构大师”勋章 + 获赠算法实训库优先提权试用',
      currentStatusText: '已达成！完美出勤 16 课时',
    },
  },
  {
    id: 'badge-[#1877F2]-pioneer',
    title: '教学数字化先锋',
    category: '生态创新',
    iconName: 'sparkles',
    isUnlocked: true,
    unlockDate: '2026-07-10',
    progressPct: 100,
    shortDesc: '率先试用信标 Beacon 定位考勤与缺勤自动推送功能',
    gradient: 'from-amber-500 to-orange-600',
    pathDescription: {
      overview: '鼓励积极使用电子考勤套件、联动班主任与班长形成三方联动协同管理模式。',
      steps: [
        '1. 配置首个 50 米半径中心坐标蓝牙/虚拟信标；',
        '2. 自动向缺勤学生及其班主任触发单次合规告警；',
        '3. 导出包含直线趋势图的期末考勤合规报告。',
      ],
      reward: '解锁“数字化先锋”特别标识 + 获得高精地理围栏调试特权',
      currentStatusText: '已达成！三方协同通知系统正常运行',
    },
  },
  {
    id: 'badge-os-expert',
    title: '操作系统精炼',
    category: '课程考勤',
    iconName: 'zap',
    isUnlocked: false,
    progressPct: 75,
    shortDesc: '完成《操作系统原理》12 次实验课打卡',
    gradient: 'from-purple-500 to-indigo-600',
    pathDescription: {
      overview: '旨在激励学生打卡操作系统内核原理与并发编程实验室课时。',
      steps: [
        '1. 5-203 实验室连续签到 12 次；',
        '2. 每次完成连续 30 分钟在位时长校验；',
        '3. 获得光点积分 120 积分。',
      ],
      reward: '解锁“操作系统精炼”专属勋章',
      currentStatusText: '进行中 (已完成 9/12 课时，进度 75%)',
    },
  },
];

export const CALENDAR_DAYS_SCHEDULE = [
  {
    num: 12,
    weekday: '周一',
    course: '数据结构与算法',
    room: '3-101 计算机实验室',
    time: '10:00 - 12:00',
    isTaught: true,
    isUpcoming: false,
    rate: 93.8,
    checked: 30,
    total: 32,
    absent: [
      { name: '李明轩', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', reason: '围栏外 120m', status: '缺勤/离线' },
      { name: '邓雅文', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', reason: '请假 (病假已报备)', status: '事假报备' },
    ],
    plan: '第 8 讲：树与二叉树赫夫曼树构建 · 实验课重点：动态图表模拟与无感签到考勤',
  },
  {
    num: 13,
    weekday: '周二',
    course: '学术导师答疑 (Office Hour)',
    room: '理科楼 3-402 办公室',
    time: '14:30 - 16:30',
    isTaught: true,
    isUpcoming: false,
    rate: 100,
    checked: 15,
    total: 15,
    absent: [],
    plan: '导学答疑咨询与本周论文大作业问题解答',
  },
  {
    num: 14,
    weekday: '周三',
    course: '操作系统原理与实验',
    room: '5-203 嵌入式中心',
    time: '14:00 - 16:00',
    isTaught: true,
    isUpcoming: false,
    rate: 96.9,
    checked: 31,
    total: 32,
    absent: [
      { name: '高海峰', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', reason: '未签到 (距教室 160m)', status: '未到课' },
    ],
    plan: '第 6 讲：进程调度与死锁避免算法 · 实验课重点：多线程互斥锁实训',
  },
  {
    num: 15,
    weekday: '周四',
    course: '软件工程实训研讨',
    room: '学院创新研讨厅',
    time: '09:00 - 11:30',
    isTaught: true,
    isUpcoming: false,
    rate: 94.1,
    checked: 16,
    total: 17,
    absent: [
      { name: '黄婷婷', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', reason: '竞赛公假报备', status: '公假' },
    ],
    plan: '敏捷开发与 Scrum 敏捷看板建模实操',
  },
  {
    num: 16,
    weekday: '周五',
    course: '数据库系统概论',
    room: '2-405 大报告厅',
    time: '08:00 - 10:00',
    isTaught: true,
    isUpcoming: false,
    rate: 90.6,
    checked: 29,
    total: 32,
    absent: [
      { name: '李明轩', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', reason: '未签到 (距教室 210m)', status: '未到课' },
      { name: '高海峰', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', reason: '未签到 (距教室 160m)', status: '未到课' },
      { name: '王威龙', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', reason: '未签到 (距教室 300m)', status: '缺勤' },
    ],
    plan: '第 5 讲：SQL 索引优化与事务隔离级别 · 实验课重点：高并发数据查询',
  },
  {
    num: 17,
    weekday: '周六',
    course: '无排课 (休息/自由备课)',
    room: '-',
    time: '-',
    isTaught: false,
    isUpcoming: false,
    rate: 0,
    checked: 0,
    total: 0,
    absent: [],
    plan: '周末自由时间，无课程排期',
  },
  {
    num: 18,
    weekday: '周日',
    course: '无排课 (休息/自由备课)',
    room: '-',
    time: '-',
    isTaught: false,
    isUpcoming: false,
    rate: 0,
    checked: 0,
    total: 0,
    absent: [],
    plan: '周末自由时间，无课程排期',
  },
  {
    num: 19,
    weekday: '周一',
    course: '数据结构与算法',
    room: '3-101 计算机实验室',
    time: '10:00 - 12:00',
    isTaught: false,
    isUpcoming: true,
    rate: 0,
    checked: 0,
    total: 32,
    absent: [],
    plan: '第 9 讲：图的遍历与最短路径 Dijkstra 算法',
  },
  {
    num: 20,
    weekday: '周二',
    course: '学术导师答疑 (Office Hour)',
    room: '理科楼 3-402 办公室',
    time: '14:30 - 16:30',
    isTaught: false,
    isUpcoming: true,
    rate: 0,
    checked: 0,
    total: 15,
    absent: [],
    plan: 'Office Hour 答疑与下半学期实训分组',
  },
  {
    num: 21,
    weekday: '周三',
    course: '操作系统原理与实验',
    room: '5-203 嵌入式中心',
    time: '14:00 - 16:00',
    isTaught: false,
    isUpcoming: true,
    rate: 0,
    checked: 0,
    total: 32,
    absent: [],
    plan: '第 7 讲：虚拟内存与页面置换 FIFO/LRU 算法实验',
  },
  {
    num: 22,
    weekday: '周四',
    course: '软件工程实训研讨',
    room: '学院创新研讨厅',
    time: '09:00 - 11:30',
    isTaught: false,
    isUpcoming: true,
    rate: 0,
    checked: 0,
    total: 17,
    absent: [],
    plan: '代码审查 (Code Review) 与 Git 工作流演练',
  },
  {
    num: 23,
    weekday: '周五',
    course: '数据库系统概论',
    room: '2-405 大报告厅',
    time: '08:00 - 10:00',
    isTaught: false,
    isUpcoming: true,
    rate: 0,
    checked: 0,
    total: 32,
    absent: [],
    plan: '第 6 讲：并发控制与 MVCC 数据库备份实操',
  },
  {
    num: 24,
    weekday: '周六',
    course: '无排课 (休息/自由备课)',
    room: '-',
    time: '-',
    isTaught: false,
    isUpcoming: false,
    rate: 0,
    checked: 0,
    total: 0,
    absent: [],
    plan: '周末自由时间，无课程排期',
  },
  {
    num: 25,
    weekday: '周日',
    course: '无排课 (休息/自由备课)',
    room: '-',
    time: '-',
    isTaught: false,
    isUpcoming: false,
    rate: 0,
    checked: 0,
    total: 0,
    absent: [],
    plan: '周末自由时间，无课程排期',
  },
];

export interface WeekDayDateInfo {
  day: string;
  dateStr: string;
  fullDateStr: string;
  monthDayStr: string;
}

export const getWeekDayDates = (weekNumber: number = 8): WeekDayDateInfo[] => {
  const weekStartOffsets: Record<number, { month: number; startDay: number }> = {
    6: { month: 9, startDay: 28 },
    7: { month: 10, startDay: 5 },
    8: { month: 10, startDay: 12 },
    9: { month: 10, startDay: 19 },
    10: { month: 10, startDay: 26 },
    11: { month: 11, startDay: 2 },
    12: { month: 11, startDay: 9 },
  };
  const weekInfo = weekStartOffsets[weekNumber] || { month: 10, startDay: 12 + (weekNumber - 8) * 7 };
  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  return weekDays.map((day, idx) => {
    const d = new Date(2026, weekInfo.month - 1, weekInfo.startDay + idx);
    const m = d.getMonth() + 1;
    const dayOfMonth = d.getDate();
    const dateStr = `${m}/${dayOfMonth < 10 ? '0' + dayOfMonth : dayOfMonth}`;
    const fullDateStr = `2026年${m}月${dayOfMonth}日`;
    const monthDayStr = `${m}月${dayOfMonth}日`;
    return {
      day,
      dateStr,
      fullDateStr,
      monthDayStr,
    };
  });
};

export const CourseManagementApp: React.FC<CourseManagementAppProps> = ({
  onClose,
  showToast,
  requestedTab,
  initialRole,
  onRoleChange,
  calendarTrigger,
  addCourseMenuTrigger,
  onLightUpBeacon,
}) => {
  // Role Switcher State
  const [role, setRole] = useState<UserRole>(initialRole || 'instructor');
  const [isInAppRoleMenuOpen, setIsInAppRoleMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  // ================= 身份创建流程与信息定义 (教师/辅导员，教师可选：助教、讲师、副教授、教授) =================
  const [isIdentityCreated, setIsIdentityCreated] = useState<boolean>(false);
  const [selectedIdentityType, setSelectedIdentityType] = useState<'teacher' | 'counselor'>('teacher');
  const [teacherRankTag, setTeacherRankTag] = useState<'助教' | '讲师' | '副教授' | '教授'>('教授');
  const [counselorRankTag, setCounselorRankTag] = useState<string>('专职辅导员');
  const [identityName, setIdentityName] = useState<string>('张立华');
  const [identityStaffId, setIdentityStaffId] = useState<string>('TEA-202688');
  const [identityDept, setIdentityDept] = useState<string>('计算机科学与技术学院');
  const [identityOffice, setIdentityOffice] = useState<string>('理科楼 3-402');
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState<boolean>(!isIdentityCreated);

  // 确认身份选择并同步至系统全局
  const handleConfirmIdentity = (profile: UserIdentityProfile) => {
    setSelectedIdentityType(profile.type);
    setTeacherRankTag(profile.teacherTag);
    setCounselorRankTag(profile.counselorTag);
    setIdentityName(profile.name);
    setIdentityStaffId(profile.staffId);
    setIdentityDept(profile.department);
    setIdentityOffice(profile.office);
    setIsIdentityCreated(true);
    setIsIdentityModalOpen(false);

    if (profile.type === 'teacher') {
      setRole('instructor');
      setNewCourseTeacher(`${profile.name} ${profile.teacherTag} (我)`);
      if (onRoleChange) onRoleChange('instructor');
      notify(`🎓 身份创建完成：【教师 · ${profile.teacherTag}】${profile.name}！请从头填写建立第一门授课课程`);
      setActiveTab('mycourses');
      setCourseSubTab('courses');
    } else {
      setRole('adviser');
      if (onRoleChange) onRoleChange('adviser');
      notify(`🛡️ 身份创建完成：【辅导员 · ${profile.counselorTag}】${profile.name}！已进入学工管理控制台`);
      setActiveTab('attendance');
    }
  };

  // 从头填写建立课程
  const handleCreateCourseFromScratch = (courseData: {
    name: string;
    teacher: string;
    schedule: string;
    classroom: string;
    groupType: 'small' | 'large';
    classes: string[];
    beaconLat: number;
    beaconLng: number;
    beaconRadius: number;
    day: string;
    time: string;
  }) => {
    const newId = `c-${Date.now()}`;
    const newCourseItem: CourseItem = {
      id: newId,
      name: courseData.name,
      teacher: courseData.teacher,
      schedule: courseData.schedule,
      classroom: courseData.classroom,
      groupType: courseData.groupType,
      classes: courseData.classes,
      beaconLat: courseData.beaconLat,
      beaconLng: courseData.beaconLng,
      beaconRadius: courseData.beaconRadius,
      status: 'upcoming',
      attendancePct: 100,
      checkedCount: 0,
      totalCount: courseData.groupType === 'large' ? 62 : 32,
      hasBeaconIcon: true,
    };

    setCourses((prev) => [newCourseItem, ...prev]);
    setActiveCourseSlideIndex(0);

    // 同步加入周历排期
    const newScheduleItem = {
      id: `sch-${Date.now()}`,
      day: courseData.day,
      title: courseData.name,
      time: courseData.time,
      room: courseData.classroom,
      tag: courseData.groupType === 'large' ? '合班大课' : '小班精讲',
      hasBeacon: true,
      classes: courseData.classes.join(', '),
    };

    setWeeklySchedule((prev) => {
      const updated = [...prev, newScheduleItem];
      const dayOrder: Record<string, number> = { 周一: 1, 周二: 2, 周三: 3, 周四: 4, 周五: 5, 周六: 6, 周日: 7 };
      updated.sort((a, b) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99));
      return updated;
    });

    // 自动在地图点亮信标
    const beaconMarker: CustomMapMarker = {
      id: `beacon-${Date.now()}`,
      lat: courseData.beaconLat,
      lng: courseData.beaconLng,
      icon: '🗼',
      category: 'life',
      categoryLabel: '课程灯塔',
      title: `${courseData.teacher} + ${courseData.name}`,
      address: `50m 虚拟考勤围栏 · ${courseData.classroom}`,
      createdAt: Date.now(),
      timeString: '刚刚生成',
      note: `【课程灯塔】已同步课表并在地图生成灯塔坐标与 50m 虚拟信标`,
      authorName: courseData.teacher,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      isBeacon: true,
      color: '#1877F2',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('stellar_custom_markers') || '[]');
      const filtered = existing.filter((m: any) => m.id !== beaconMarker.id);
      localStorage.setItem('stellar_custom_markers', JSON.stringify([beaconMarker, ...filtered]));
      window.dispatchEvent(new CustomEvent('stellar_custom_markers_updated', { detail: beaconMarker }));
    } catch (e) {
      console.error(e);
    }

    if (onLightUpBeacon) {
      onLightUpBeacon({
        teacher: courseData.teacher,
        courseName: courseData.name,
        lat: courseData.beaconLat,
        lng: courseData.beaconLng,
        room: courseData.classroom,
      });
    }

    notify(`🎉 课程《${courseData.name}》建立成功！已同步至课表排期与 50m 电子考勤信标。`);
  };

  // Navigation Tab State (电子考勤 | 我的课程)
  const [activeTab, setActiveTab] = useState<'attendance' | 'create' | 'analytics' | 'badges' | 'mycourses'>('attendance');
  // Sub-tabs for 电子考勤 (实时考勤大厅 | 考勤看板与统计)
  const [attendanceSubTab, setAttendanceSubTab] = useState<'live' | 'analytics'>('live');
  // Sub-tabs for 我的课程 (授课课程管理 | 课程课表与排期日历)
  const [courseSubTab, setCourseSubTab] = useState<'courses' | 'schedule'>('courses');
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>('all');

  // Calendar Popup Modal State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [selectedCalendarDayNum, setSelectedCalendarDayNum] = useState<number>(12); // Default to Oct 12

  // Top-Right "+" Action Menu Popup Card State ("点击后，弹出卡片，显示两个选项：1.新建课程 2.添加班级。")
  const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('CS104 计科四班');
  const [newClassDept, setNewClassDept] = useState<string>('计算机科学与技术学院');
  const [newClassCount, setNewClassCount] = useState<string>('32');
  const [newClassAdviser, setNewClassAdviser] = useState<string>('张立华 教授');

  // Dynamic Class List State ("添加班级后，班级栏中加入新添加的班级卡片")
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState<boolean>(false);
  const [classList, setClassList] = useState<Array<{
    id: string;
    name: string;
    shortCode: string;
    dept: string;
    count: number;
    adviser: string;
  }>>([
    { id: 'cls-1', name: 'CS101 计科一班', shortCode: 'CS101', dept: '计算机科学与技术学院', count: 32, adviser: '张立华 教授' },
    { id: 'cls-2', name: 'CS102 计科二班', shortCode: 'CS102', dept: '计算机科学与技术学院', count: 30, adviser: '李明 老师' },
    { id: 'cls-3', name: 'CS103 计科三班', shortCode: 'CS103', dept: '计算机科学与技术学院', count: 35, adviser: '王建国 教授' },
  ]);

  // Map Coordinate Preset Picker Modal State ("选择地图坐标" 弹窗)
  const [isCoordPickerOpen, setIsCoordPickerOpen] = useState<boolean>(false);

  // Smooth Collapsed summary card state (Controlled collapse without layout jumping on scroll)
  const [isScrolledDown, setIsScrolledDown] = useState<boolean>(false);
  // Attendance Hall Expand/Collapse State ("下方实时显示考勤大厅按钮修改为收起展开按钮")
  const [isAttendanceHallExpanded, setIsAttendanceHallExpanded] = useState<boolean>(true);

  // Edit Course Modal State ("课程卡片内，增加修改课程按钮")
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [editCourseName, setEditCourseName] = useState<string>('');
  const [editTeacher, setEditTeacher] = useState<string>('');
  const [editClassroom, setEditClassroom] = useState<string>('');
  const [editWeek, setEditWeek] = useState<number>(8);
  const [editDay, setEditDay] = useState<string>('周一');
  const [editTime, setEditTime] = useState<string>('10:00 - 12:00');
  const [editGroupType, setEditGroupType] = useState<'small' | 'large'>('small');
  const [editBeaconRadius, setEditBeaconRadius] = useState<string>('50');
  const [editClasses, setEditClasses] = useState<string>('CS101 计科一班');
  const [editSelectedClasses, setEditSelectedClasses] = useState<string[]>(['CS101 计科一班']);
  const [editLessonPlan, setEditLessonPlan] = useState<string>('第 8 讲：核心数据结构与实验课引导');

  useEffect(() => {
    if (requestedTab) {
      if (requestedTab === 'analytics') {
        setActiveTab('attendance');
        setAttendanceSubTab('analytics');
      } else if (requestedTab === 'badges') {
        setActiveTab('mycourses');
        setCourseSubTab('schedule');
      } else if (requestedTab === 'attendance') {
        setActiveTab('attendance');
        setAttendanceSubTab('live');
      } else if (requestedTab === 'mycourses' || requestedTab === 'create') {
        setActiveTab('mycourses');
        setCourseSubTab('courses');
      } else {
        setActiveTab(requestedTab);
      }
    }
  }, [requestedTab]);

  useEffect(() => {
    if (calendarTrigger && calendarTrigger > 0) {
      setIsCalendarModalOpen(true);
    }
  }, [calendarTrigger]);

  useEffect(() => {
    if (addCourseMenuTrigger && addCourseMenuTrigger > 0) {
      setIsAddMenuOpen(true);
    }
  }, [addCourseMenuTrigger]);
  const [selectedCourseForSession, setSelectedCourseForSession] = useState<CourseItem | null>(null);

  // UI Panels Modals
  const [showStyleGuide, setShowStyleGuide] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  // 勋章状态与点亮金色光圈扩散动效状态 (BadgeItem Gamification & Lighting State)
  const [badges, setBadges] = useState<BadgeItem[]>(() => {
    try {
      const saved = localStorage.getItem('STELLAR_COURSE_BADGES');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_BADGES;
  });
  const [animatingBadgeId, setAnimatingBadgeId] = useState<string | null>(null);

  // 点亮勋章：从未解锁变更为已解锁，触发金色光圈扩散动画与轻微弹性缩放反馈
  const handleUnlockBadge = (badgeId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const targetBadge = badges.find(b => b.id === badgeId);
    if (!targetBadge) return;

    setBadges(prev => {
      const updated = prev.map(b => {
        if (b.id === badgeId) {
          return {
            ...b,
            isUnlocked: true,
            unlockDate: new Date().toISOString().split('T')[0],
            progressPct: 100,
            pathDescription: {
              ...b.pathDescription,
              currentStatusText: `已达成！于 ${new Date().toISOString().split('T')[0]} 荣获教学荣誉认证`,
            }
          };
        }
        return b;
      });
      try {
        localStorage.setItem('STELLAR_COURSE_BADGES', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 若详情弹窗当前展示该勋章，同步更新
    setSelectedBadge(prev => {
      if (prev && prev.id === badgeId) {
        return {
          ...prev,
          isUnlocked: true,
          unlockDate: new Date().toISOString().split('T')[0],
          progressPct: 100,
          pathDescription: {
            ...prev.pathDescription,
            currentStatusText: `已达成！于 ${new Date().toISOString().split('T')[0]} 荣获教学荣誉认证`,
          }
        };
      }
      return prev;
    });

    // 触发金色光圈扩散与卡片轻微弹性缩放动画
    setAnimatingBadgeId(badgeId);
    setTimeout(() => {
      setAnimatingBadgeId(null);
    }, 2200);

    notify(`✨ 荣誉点亮！恭喜荣获【${targetBadge.title}】教学成就勋章！`);
  };

  // 重置勋章状态（方便反复测试/体验点亮动画）
  const handleResetBadge = (badgeId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setBadges(prev => {
      const updated = prev.map(b => {
        if (b.id === badgeId) {
          return {
            ...b,
            isUnlocked: false,
            progressPct: 75,
            pathDescription: {
              ...b.pathDescription,
              currentStatusText: '进行中 (已完成 9/12 课时，进度 75%)',
            }
          };
        }
        return b;
      });
      try {
        localStorage.setItem('STELLAR_COURSE_BADGES', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSelectedBadge(prev => (prev && prev.id === badgeId ? { ...prev, isUnlocked: false, progressPct: 75 } : prev));
    notify('已重置该勋章为未解锁状态，可再次点击点亮体验动效');
  };

  // Gamification Light Points
  const [lightPoints, setLightPoints] = useState(180);

  // Active Session Attendance State
  const [students, setStudents] = useState<StudentItem[]>(INITIAL_STUDENTS);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Offline Caching & Sync State (本地离线缓存与弱网防误判引擎)
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [beaconSignalQuality, setBeaconSignalQuality] = useState<'strong' | 'unstable' | 'offline'>('strong');
  const [isAutoSyncing, setIsAutoSyncing] = useState<boolean>(false);
  const [showOfflineCacheModal, setShowOfflineCacheModal] = useState<boolean>(false);
  const [offlineRecords, setOfflineRecords] = useState<OfflineAttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('STELLAR_COURSE_OFFLINE_ATTENDANCE');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    // Default sample offline cached record for realistic offline-first demonstration
    return [
      {
        studentId: 's8',
        studentName: '周小波',
        courseId: 'c1',
        courseName: '数据结构与算法',
        checkInTimestamp: Date.now() - 12 * 60 * 1000,
        formattedTime: '10:18:24 (本地离线晶振记录)',
        beaconRssi: -88,
        offlineReason: 'beacon_weak_signal',
        syncStatus: 'pending',
        cachedLocallyAt: Date.now() - 12 * 60 * 1000,
        retryCount: 0,
      },
    ];
  });

  // Save offline records to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('STELLAR_COURSE_OFFLINE_ATTENDANCE', JSON.stringify(offlineRecords));
    } catch {
      // ignore
    }
  }, [offlineRecords]);

  // Sync offline status into students state when offline records exist
  useEffect(() => {
    if (offlineRecords.length > 0) {
      setStudents((prev) =>
        prev.map((s) => {
          const cached = offlineRecords.find((r) => r.studentId === s.id && r.syncStatus === 'pending');
          if (cached && s.status === 'absent_gray') {
            return {
              ...s,
              status: 'checked_in',
              isOfflineCached: true,
              offlineCheckInTimestamp: cached.checkInTimestamp,
              offlineSyncStatus: 'pending',
              latestChangeReason: '离线缓存已记',
              auditNote: `本地断网/信标微弱时已精确捕获时间戳 (${cached.formattedTime})，待网络恢复后自动上报。`,
            };
          }
          return s;
        })
      );
    }
  }, []);

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (showToast) showToast('📶 网络连接已恢复，正在触发离线考勤记录自动同步...');
      triggerAutoSyncToServer();
    };
    const handleOffline = () => {
      setIsOnline(false);
      if (showToast) showToast('⚠️ 教师/学生设备已进入离线弱网模式，所有打卡将转入本地沙盒安全缓存。');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineRecords]);

  // Automatic / Manual sync offline records to attendance server
  const triggerAutoSyncToServer = () => {
    const pendingList = offlineRecords.filter((r) => r.syncStatus === 'pending');
    if (pendingList.length === 0) {
      notify('✅ 本地离线考勤队列为空，所有记录均已与云端考勤服务器保持同步。');
      return;
    }

    setIsAutoSyncing(true);
    notify(`🔄 正在将 ${pendingList.length} 条离线打卡时间戳原子性同步至教务考勤服务器...`);

    setTimeout(() => {
      // Mark records as synced
      setOfflineRecords((prev) =>
        prev.map((r) => (r.syncStatus === 'pending' ? { ...r, syncStatus: 'synced' as const } : r))
      );

      // Update student items state
      setStudents((prev) =>
        prev.map((s) => {
          const wasPending = pendingList.some((p) => p.studentId === s.id);
          if (wasPending) {
            return {
              ...s,
              status: 'checked_in',
              isOfflineCached: false,
              offlineSyncStatus: 'synced',
              latestChangeReason: '离线同步成功',
              auditNote: '已从本地缓存离线校验时间戳成功同步至云端考勤服务器，判定为正常出勤。',
            };
          }
          return s;
        })
      );

      setIsAutoSyncing(false);
      setLightPoints((prev) => prev + pendingList.length * 10);
      notify(`🎉 同步成功！${pendingList.length} 名离线打卡学生已入库归档，避免网络波动导致误判旷课 (+${pendingList.length * 10} 光点)。`);
    }, 1200);
  };

  // Push Notifications Toast Log
  const [notifications, setNotifications] = useState<Array<{ id: string; time: string; text: string; roleTargets: string }>>([
    {
      id: 'n1',
      time: '10:05',
      text: '课程《数据结构与算法》已启动 50 米信标电子考勤，应到 12 人。',
      roleTargets: '任课教师 / 班主任 / 班长',
    },
  ]);

  // Manual Verification & Late Check-in Modal State ("人工核查/补签" 弹窗)
  const [isManualAuditModalOpen, setIsManualAuditModalOpen] = useState<boolean>(false);
  const [auditTargetStudent, setAuditTargetStudent] = useState<StudentItem | null>(null);
  const [auditNewStatus, setAuditNewStatus] = useState<'leave_approved' | 'official_leave' | 'checked_in' | 'absent_gray'>('leave_approved');
  const [auditLeaveType, setAuditLeaveType] = useState<'sick' | 'personal' | 'official' | 'late_makeup'>('sick');
  const [auditReason, setAuditReason] = useState<string>('');
  const [auditHospitalOrOrg, setAuditHospitalOrOrg] = useState<string>('兰州大学校医院 (急诊科)');
  const [auditDoctorAdvice, setAuditDoctorAdvice] = useState<string>('');
  const [auditProofImage, setAuditProofImage] = useState<string>('');
  const [auditRemarks, setAuditRemarks] = useState<string>('');
  const [isPreviewProofLarge, setIsPreviewProofLarge] = useState<boolean>(false);
  const [calendarDaysList, setCalendarDaysList] = useState<Array<any>>(INITIAL_CALENDAR_DAYS);

  // Multi-Select & Batch Audit State ("名册列表多选与批量人工核查/补签")
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isBatchAuditModalOpen, setIsBatchAuditModalOpen] = useState<boolean>(false);
  const [batchNewStatus, setBatchNewStatus] = useState<'leave_approved' | 'official_leave' | 'checked_in' | 'absent_gray'>('leave_approved');
  const [batchLeaveType, setBatchLeaveType] = useState<'sick' | 'personal' | 'official' | 'late_makeup'>('sick');
  const [batchReason, setBatchReason] = useState<string>('学生出示病假/事假凭证原件及相关证明，经任课教师现场统一核查');
  const [batchHospitalOrOrg, setBatchHospitalOrOrg] = useState<string>('兰州大学校医院 / 学院学工办');
  const [batchDoctorAdvice, setBatchDoctorAdvice] = useState<string>('就医凭证及事假条完备真实，予以批量核准并销假');
  const [batchRemarks, setBatchRemarks] = useState<string>('已统一核验多名学生提交的就医证明与假条原件，手续真实合规，准予批量补录销假，考勤统计已同步扣减旷课。');

  // Courses List (去除现有的课程建立，初始为空，由用户从头填写建立)
  const [courses, setCourses] = useState<CourseItem[]>([]);

  // Active Course Slide Index for Overlapping Card Carousel
  const [activeCourseSlideIndex, setActiveCourseSlideIndex] = useState(0);

  // Time Dimension for Overlapping Performance Dashboard: 1周 | 一个月 | 季度 | 学期
  const [attendancePeriod, setAttendancePeriod] = useState<'1week' | '1month' | 'quarter' | 'semester'>('1week');

  // Campus Coordinate Landmark Presets for Course Beacon selection
  const CAMPUS_COORD_PRESETS = [
    { name: '兰州大学 · 计算机教学实验中心', room: '3-101 计算机实验室', lat: '36.0592', lng: '103.8343', desc: '校区主教学实验楼 · 计算机科学与技术系' },
    { name: '创新科研大楼 · 软件工程实训基地', room: '1-302 软件实验室', lat: '36.0664', lng: '103.8153', desc: '科技园核心孵化基地 · 软件工程实验室' },
    { name: '信息科学与智能硬件创新中心', room: '5-203 嵌入式中心', lat: '36.0745', lng: '103.8240', desc: '智能物联网与机器人系统实验室' },
    { name: '理科楼 · 计算机与数据科学学院', room: '理科楼 3-402 教研室', lat: '36.0610', lng: '103.8110', desc: '教研室与导师答疑中心' },
    { name: '东方红广场校区 · 阶梯多媒体报告厅', room: '2-405 大报告厅', lat: '36.0580', lng: '103.8350', desc: '学术交流与多班联合大课报告厅' },
  ];

  // Create Course Multi-Layer Form State
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseTeacher, setNewCourseTeacher] = useState('张立华 教授 (我)');
  const [newCourseDept, setNewCourseDept] = useState('计算机与软件学院');
  const [newCourseWeek, setNewCourseWeek] = useState<number>(8);
  const [newCourseDay, setNewCourseDay] = useState('周四');
  const [newCourseTime, setNewCourseTime] = useState('10:00 - 12:00');
  const [newCourseRoom, setNewCourseRoom] = useState('3-101 计算机实验室');
  const [newGroupType, setNewGroupType] = useState<'small' | 'large'>('small');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['CS101 计科一班']);
  const [newLat, setNewLat] = useState('36.0592');
  const [newLng, setNewLng] = useState('103.8343');
  const [newBeaconRadius, setNewBeaconRadius] = useState('50');
  const [mergeClasses, setMergeClasses] = useState<string[]>(['CS101', 'CS102']);

  // Classroom Cards State (小卡片模式)
  const [classroomPresets, setClassroomPresets] = useState([
    { id: 'cr-1', room: '3-101 计算机实验室', location: '兰州大学 · 计算机教学实验中心', lat: '36.0592', lng: '103.8343', tag: '主实验楼' },
    { id: 'cr-2', room: '1-302 软件实验室', location: '创新科研大楼 · 软件工程实训基地', lat: '36.0664', lng: '103.8153', tag: '软件实训' },
    { id: 'cr-3', room: '5-203 嵌入式中心', location: '信息科学与智能硬件创新中心', lat: '36.0745', lng: '103.8240', tag: 'IoT研讨' },
    { id: 'cr-4', room: '3-402 教研室', location: '理科楼 · 计算机与数据科学学院', lat: '36.0610', lng: '103.8110', tag: '学术答疑' },
    { id: 'cr-5', room: '2-405 大报告厅', location: '东方红广场校区 · 阶梯报告厅', lat: '36.0580', lng: '103.8350', tag: '阶梯大课' },
  ]);

  // Add New Classroom Modal State
  const [isAddClassroomModalOpen, setIsAddClassroomModalOpen] = useState(false);
  const [newCRRoom, setNewCRRoom] = useState('');
  const [newCRLocation, setNewCRLocation] = useState('');
  const [newCRLat, setNewCRLat] = useState('36.0600');
  const [newCRLng, setNewCRLng] = useState('103.8200');
  const [newCRTag, setNewCRTag] = useState('自定义教室');

  // Light up course beacon handler ("点亮课程灯塔")
  const handleLightUpBeaconAction = () => {
    const rawCourseName = newCourseName.trim() || '算法与数据结构实训';
    const rawTeacher = newCourseTeacher.trim() || '张立华';
    const teacherClean = rawTeacher.replace(/（我）|\(我\)/g, '').trim();
    const teacherFormatted = teacherClean.includes('教授') ? teacherClean : `${teacherClean} 教授`;
    const beaconTitle = `${teacherFormatted} + ${rawCourseName}`;
    const targetLat = parseFloat(newLat) || 36.0592;
    const targetLng = parseFloat(newLng) || 103.8343;

    const beaconMarker: CustomMapMarker = {
      id: `beacon-${Date.now()}`,
      lat: targetLat,
      lng: targetLng,
      icon: '🗼',
      category: 'life',
      categoryLabel: '课程灯塔',
      title: beaconTitle,
      address: `50m 虚拟考勤围栏 · ${newCourseRoom || '计算机实验室'}`,
      createdAt: Date.now(),
      timeString: '刚刚点亮',
      note: `【课程灯塔】${beaconTitle} 已开启 50m 虚拟信标定位考勤`,
      authorName: teacherFormatted,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      isBeacon: true,
      color: '#1877F2',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('stellar_custom_markers') || '[]');
      const filtered = existing.filter((m: any) => m.id !== beaconMarker.id);
      const updated = [beaconMarker, ...filtered];
      localStorage.setItem('stellar_custom_markers', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('stellar_custom_markers_updated', { detail: beaconMarker }));
    } catch (err) {
      console.error('Error saving beacon marker:', err);
    }

    if (onLightUpBeacon) {
      onLightUpBeacon({
        teacher: teacherFormatted,
        courseName: rawCourseName,
        lat: targetLat,
        lng: targetLng,
        room: newCourseRoom || '3-101 计算机实验室',
      });
    } else {
      notify(`🗼 已成功点亮课程灯塔【${beaconTitle}】并在地图定位！`);
    }
  };

  // Dynamic Weekly Timetable Schedule
  const [weeklySchedule, setWeeklySchedule] = useState<Array<{
    id: string;
    day: string;
    title: string;
    time: string;
    room: string;
    tag: string;
    hasBeacon: boolean;
    isToday?: boolean;
    classes?: string;
  }>>([]);

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
    else alert(msg);
  };

  // Derived counts for current active session
  const [beaconChargeSimulationTier, setBeaconChargeSimulationTier] = useState<'auto' | '25' | '55' | '75' | '95' | '100'>('auto');
  const checkedInCount = students.filter((s) => s.status === 'checked_in').length;
  const inGeofenceCount = students.filter((s) => s.status === 'in_geofence').length;
  const totalStudents = students.length;

  // Beacon 50m Geofence Detection State & Breathing Aperture Surge
  const [recentGeofenceDetection, setRecentGeofenceDetection] = useState<{
    studentName: string;
    timestamp: number;
    distance: number;
    isBatch?: boolean;
  } | null>(null);
  const [isApertureSurgeActive, setIsApertureSurgeActive] = useState<boolean>(false);
  
  // Dynamic Attendance Percentage calculation supporting interactive charge simulation
  const currentAttendancePct =
    beaconChargeSimulationTier === '25' ? 25 :
    beaconChargeSimulationTier === '55' ? 55 :
    beaconChargeSimulationTier === '75' ? 75 :
    beaconChargeSimulationTier === '95' ? 95 :
    beaconChargeSimulationTier === '100' ? 100 :
    Math.min(100, Math.max(0, Math.round(((180 + checkedInCount) / 200) * 100)));

  // Calculate Beacon Energy Level:
  const getBeaconEnergyStatus = () => {
    if (currentAttendancePct >= 90) {
      return {
        label: currentAttendancePct >= 98 ? 'Radiant Overcharge (100% 满额超导爆发)' : 'Radiant Beacon (璀璨信标 90-100%)',
        level: 'Radiant',
        glowClass: 'bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 text-amber-900 border-2 border-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_35px_rgba(251,191,36,0.65)]',
        barColor: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-400',
        bgGradient: 'from-amber-500/10 via-yellow-400/20 to-amber-500/10',
        isRadiant: true,
        chargeText: '✨ Radiant 璀璨级充能爆发中 (全厅发光呼吸共振)',
        pulseStyle: {
          boxShadow: '0 0 35px rgba(251, 191, 36, 0.85), inset 0 0 20px rgba(254, 240, 138, 0.8)',
        },
      };
    }
    if (currentAttendancePct >= 61) {
      return {
        label: 'Bright Blue Pulse (高能跃迁 61-89%)',
        level: 'Bright',
        glowClass: 'bg-[#1877F2]/10 text-[#1877F2] border-2 border-[#1877F2] ring-2 ring-[#1877F2]/30',
        barColor: 'bg-gradient-to-r from-[#1877F2] to-blue-400',
        textColor: 'text-[#1877F2]',
        borderColor: 'border-[#1877F2]',
        bgGradient: 'from-blue-500/10 to-indigo-500/10',
        isRadiant: false,
        chargeText: '⚡ 高能充能上升中 (向 90% Radiant 冲刺)',
        pulseStyle: {
          boxShadow: '0 0 15px rgba(24, 119, 242, 0.5)',
        },
      };
    }
    if (currentAttendancePct >= 31) {
      return {
        label: 'Moderate Glow (常态充能 31-60%)',
        level: 'Moderate',
        glowClass: 'bg-blue-50 text-blue-800 border border-blue-300',
        barColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        bgGradient: 'from-blue-50 to-indigo-50',
        isRadiant: false,
        chargeText: '🔋 常态稳健充能中',
        pulseStyle: {},
      };
    }
    return {
      label: 'Dim Beacon (低能待机 0-30%)',
      level: 'Dim',
      glowClass: 'bg-slate-100 text-slate-700 border border-slate-300',
      barColor: 'bg-gradient-to-r from-slate-400 to-gray-500',
      textColor: 'text-slate-600',
      borderColor: 'border-slate-300',
      bgGradient: 'from-slate-50 to-gray-100',
      isRadiant: false,
      chargeText: '🪫 低能蓄力待充能',
      pulseStyle: {},
    };
  };

  const beaconEnergy = getBeaconEnergyStatus();

  // Handle Geofence Simulation: Student enters 50m radius
  const handleSimulateEnterGeofence = (studentId: string) => {
    const dist = Math.floor(Math.random() * 20) + 5;
    const target = students.find((s) => s.id === studentId);
    const studentName = target?.name || '学生';

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId && s.status === 'absent_gray') {
          return {
            ...s,
            status: 'in_geofence',
            geofenceDistanceMeters: dist,
            timerMinutesRemaining: 30,
          };
        }
        return s;
      })
    );

    // Trigger optical breathing aperture surge & tactile feedback
    setRecentGeofenceDetection({
      studentName,
      timestamp: Date.now(),
      distance: dist,
      isBatch: false,
    });
    setIsApertureSurgeActive(true);
    soundEffects.playTapSound();
    haptics.trigger('medium');

    setTimeout(() => {
      setIsApertureSurgeActive(false);
    }, 4500);

    notify(`📡 【${studentName}】进入 50 米信标围栏！光圈脉冲共振增强，30 分钟倒计时启动。`);
  };

  // Handle Batch Enter Geofence
  const handleSimulateBatchEnter = () => {
    setStudents((prev) =>
      prev.map((s, idx) => {
        if (s.status === 'absent_gray' && idx < 6) {
          return {
            ...s,
            status: 'in_geofence',
            geofenceDistanceMeters: 15,
            timerMinutesRemaining: 30,
          };
        }
        return s;
      })
    );

    setRecentGeofenceDetection({
      studentName: '前 6 名学生 (批量)',
      timestamp: Date.now(),
      distance: 15,
      isBatch: true,
    });
    setIsApertureSurgeActive(true);
    soundEffects.playAlertSound();
    haptics.trigger('heavy');

    setTimeout(() => {
      setIsApertureSurgeActive(false);
    }, 4500);

    notify('📡 前 6 名学生同时进入 50 米围栏！围栏光圈共振爆发，开始 30 分钟倒计时！');
  };

  // Handle Complete 30-Min Stay Check-In (with offline caching support)
  const handleSimulateCheckInComplete = (studentId: string, forceOffline: boolean = false) => {
    const isOfflineNow = !isOnline || beaconSignalQuality === 'offline' || forceOffline;
    const now = Date.now();
    const formatted = new Date(now).toLocaleTimeString('zh-CN', { hour12: false }) + ' (本地缓存打卡)';
    const target = students.find((s) => s.id === studentId);

    if (isOfflineNow) {
      // Offline / weak signal mode: cache record locally
      const newOfflineRecord: OfflineAttendanceRecord = {
        studentId,
        studentName: target?.name || '未知学生',
        courseId: 'c1',
        courseName: '数据结构与算法',
        checkInTimestamp: now,
        formattedTime: formatted,
        beaconRssi: beaconSignalQuality === 'unstable' ? -92 : -99,
        offlineReason: !isOnline ? 'network_offline' : 'beacon_weak_signal',
        syncStatus: 'pending',
        cachedLocallyAt: now,
        retryCount: 0,
      };

      setOfflineRecords((prev) => [newOfflineRecord, ...prev.filter((r) => r.studentId !== studentId)]);

      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === studentId) {
            return {
              ...s,
              status: 'checked_in',
              timerMinutesRemaining: 0,
              isOfflineCached: true,
              offlineCheckInTimestamp: now,
              offlineSyncStatus: 'pending',
              latestChangeReason: '离线缓存已记',
              auditNote: `本地信标/断网环境捕获打卡时间戳 (${formatted})，已写入离线安全沙盒，网络恢复后自动补发同步。`,
            };
          }
          return s;
        })
      );

      notify(`📦 【${target?.name || '学生'}】检测到网络断开/信标微弱，打卡记录已保存至本地离线缓存！网络恢复后将自动上报同步。`);
      return;
    }

    // Online normal check-in
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            status: 'checked_in',
            timerMinutesRemaining: 0,
            isOfflineCached: false,
            offlineSyncStatus: 'synced',
            latestChangeReason: '信标入圈',
          };
        }
        return s;
      })
    );
    setLightPoints((prev) => prev + 10);
    notify(`🎉 【${target?.name}】满 30 分钟无感签到成功！头像融合计入总数 (+10 光点)。`);
  };

  // Handle Offline Cache Check-in directly (模拟学生在断网/信号盲区下打卡)
  const handleSimulateOfflineCheckIn = (studentId: string) => {
    handleSimulateCheckInComplete(studentId, true);
  };

  // Handle Batch Complete All In Geofence
  const handleSimulateBatchCheckIn = () => {
    let count = 0;
    const isOfflineNow = !isOnline || beaconSignalQuality === 'offline';
    const now = Date.now();

    if (isOfflineNow) {
      const pendingStudents = students.filter((s) => s.status === 'in_geofence' || s.status === 'absent_gray');
      const newRecords: OfflineAttendanceRecord[] = pendingStudents.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        courseId: 'c1',
        courseName: '数据结构与算法',
        checkInTimestamp: now,
        formattedTime: new Date(now).toLocaleTimeString('zh-CN', { hour12: false }) + ' (断网批量缓存)',
        beaconRssi: -95,
        offlineReason: 'network_offline',
        syncStatus: 'pending',
        cachedLocallyAt: now,
        retryCount: 0,
      }));

      setOfflineRecords((prev) => [...newRecords, ...prev.filter((r) => !pendingStudents.some((p) => p.id === r.studentId))]);

      setStudents((prev) =>
        prev.map((s) => {
          if (s.status === 'in_geofence' || s.status === 'absent_gray') {
            return {
              ...s,
              status: 'checked_in',
              timerMinutesRemaining: 0,
              isOfflineCached: true,
              offlineCheckInTimestamp: now,
              offlineSyncStatus: 'pending',
              latestChangeReason: '离线缓存已记',
            };
          }
          return s;
        })
      );
      notify(`📦 弱网模式：已为 ${pendingStudents.length} 名学生记录本地离线时间戳，等待网络恢复后自动批量同步！`);
      return;
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.status === 'in_geofence' || s.status === 'absent_gray') {
          count++;
          return {
            ...s,
            status: 'checked_in',
            timerMinutesRemaining: 0,
          };
        }
        return s;
      })
    );
    setLightPoints((prev) => prev + count * 10);
    notify(`🎉 全员签到完成！增加 ${count * 10} 光点，考勤率达成 100% 触发【Radiant Beacon】璀璨光束！`);
  };

  // Open Manual Verification & Late Check-in Modal ("进入补签补录模式")
  const openManualAuditModal = (student: StudentItem) => {
    setAuditTargetStudent(student);
    const existing = student.leaveNote;
    if (existing) {
      setAuditLeaveType(existing.type);
      setAuditReason(existing.reason);
      setAuditHospitalOrOrg(existing.hospitalOrOrg || '兰州大学校医院 (急诊科)');
      setAuditDoctorAdvice(existing.doctorAdvice || '已出具正式就医与证明单据，建议准予销假');
      setAuditProofImage(existing.proofImage || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600');
      setAuditNewStatus(
        existing.type === 'official'
          ? 'official_leave'
          : existing.type === 'late_makeup'
          ? 'checked_in'
          : 'leave_approved'
      );
    } else {
      setAuditLeaveType('sick');
      setAuditReason('学生事后出示校医院门诊诊断凭证与请假条，申请人工核验并补录出勤');
      setAuditHospitalOrOrg('兰州大学校医院 (急诊科)');
      setAuditDoctorAdvice('急性肠胃炎门诊诊断证明，建议休养半天');
      setAuditProofImage('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600');
      setAuditNewStatus('leave_approved');
    }
    setAuditRemarks(
      student.manualRemarks ||
        `已核验学生【${student.name}】出示的请假凭证原件，材料真实合规，准予补录销假，考勤统计已自动扣减旷课。`
    );
    setIsManualAuditModalOpen(true);
  };

  // Save Manual Verification & Late Check-in ("保存并自动同步更新至考勤看板")
  const handleSaveManualAudit = () => {
    if (!auditTargetStudent) return;
    const isApprovedOrChecked =
      auditNewStatus === 'leave_approved' ||
      auditNewStatus === 'official_leave' ||
      auditNewStatus === 'checked_in';
    const isClearingAbsence = auditTargetStudent.status === 'absent_gray' && isApprovedOrChecked;

    const updatedStudents = students.map((s) => {
      if (s.id === auditTargetStudent.id) {
        const newAbsentCount = isClearingAbsence
          ? Math.max(0, (s.absentCount || 1) - 1)
          : s.absentCount || 0;
        const newConsecutive = isClearingAbsence ? 0 : s.consecutiveAbsent || 0;
        const newRisk: 'high' | 'medium' | 'low' =
          newAbsentCount >= 4 ? 'high' : newAbsentCount >= 2 ? 'medium' : 'low';

        const reasonLabel =
          auditNewStatus === 'leave_approved'
            ? '请假销假'
            : auditNewStatus === 'official_leave'
            ? '竞赛公假'
            : auditNewStatus === 'checked_in'
            ? '人工补录'
            : '旷课缺勤';

        return {
          ...s,
          status: auditNewStatus,
          absentCount: newAbsentCount,
          consecutiveAbsent: newConsecutive,
          riskLevel: newRisk,
          manualRemarks: auditRemarks,
          auditNote: auditRemarks,
          latestChangeReason: reasonLabel,
          auditTime: '刚刚 (2026-10-12 10:45)',
          leaveNote: {
            type: auditLeaveType,
            reason: auditReason,
            hospitalOrOrg: auditHospitalOrOrg,
            doctorAdvice: auditDoctorAdvice,
            proofImage: auditProofImage,
            submittedAt: auditTargetStudent.leaveNote?.submittedAt || '今日 09:30',
            approvedAt: '2026-10-12 10:45',
            approver: '张立华 教授 (主讲教师)',
            noteStatus: (auditNewStatus === 'absent_gray' ? 'rejected' : 'approved') as 'approved' | 'rejected',
          },
        };
      }
      return s;
    });

    setStudents(updatedStudents);

    // Sync with calendar days list
    setCalendarDaysList((prevDays) =>
      prevDays.map((day) => {
        if (day.absent && day.absent.some((ab: any) => ab.name === auditTargetStudent.name)) {
          if (isApprovedOrChecked) {
            const updatedAbsent = day.absent.filter((ab: any) => ab.name !== auditTargetStudent.name);
            const newChecked = Math.min(day.total, day.checked + 1);
            const newRate = Number(((newChecked / day.total) * 100).toFixed(1));
            return {
              ...day,
              absent: updatedAbsent,
              checked: newChecked,
              rate: newRate,
            };
          }
        }
        return day;
      })
    );

    const statusTitle =
      auditNewStatus === 'leave_approved'
        ? '准予事/病假 (已销假)'
        : auditNewStatus === 'official_leave'
        ? '准予公假 (竞赛报备)'
        : auditNewStatus === 'checked_in'
        ? '现场补录实到'
        : '维持旷课缺勤';

    notify(
      `✅ 已完成【${auditTargetStudent.name}】人工核查补签！状态变更为【${statusTitle}】，考勤看板统计数据已实时同步！`
    );
    setIsManualAuditModalOpen(false);
  };

  // Multi-select & Batch Audit Handlers
  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllStudents = (studentList: StudentItem[]) => {
    const listIds = studentList.map((s) => s.id);
    const isAllSelected = listIds.length > 0 && listIds.every((id) => selectedStudentIds.includes(id));
    if (isAllSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !listIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...listIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  const openBatchAuditModal = () => {
    if (selectedStudentIds.length === 0) {
      notify('请先在名册中勾选需要批量核查修改的学生');
      return;
    }
    setBatchRemarks(
      `已统一核验勾选的 ${selectedStudentIds.length} 名学生出示的假条或证明材料，手续真实合规，准予批量核准并同步考勤看板。`
    );
    setIsBatchAuditModalOpen(true);
  };

  const handleSaveBatchAudit = () => {
    if (selectedStudentIds.length === 0) return;
    const isApprovedOrChecked =
      batchNewStatus === 'leave_approved' ||
      batchNewStatus === 'official_leave' ||
      batchNewStatus === 'checked_in';

    const reasonLabel =
      batchNewStatus === 'leave_approved'
        ? '请假销假'
        : batchNewStatus === 'official_leave'
        ? '竞赛公假'
        : batchNewStatus === 'checked_in'
        ? '人工补录'
        : '旷课缺勤';

    const statusTitle =
      batchNewStatus === 'leave_approved'
        ? '准予事/病假 (已销假)'
        : batchNewStatus === 'official_leave'
        ? '准予公假 (竞赛报备)'
        : batchNewStatus === 'checked_in'
        ? '现场补录实到'
        : '标记旷课缺勤';

    setStudents((prevStudents) =>
      prevStudents.map((s) => {
        if (selectedStudentIds.includes(s.id)) {
          const isClearingAbsence = s.status === 'absent_gray' && isApprovedOrChecked;
          const newAbsentCount = isClearingAbsence
            ? Math.max(0, (s.absentCount || 1) - 1)
            : s.absentCount || 0;
          const newConsecutive = isClearingAbsence ? 0 : s.consecutiveAbsent || 0;
          const newRisk: 'high' | 'medium' | 'low' =
            newAbsentCount >= 4 ? 'high' : newAbsentCount >= 2 ? 'medium' : 'low';

          return {
            ...s,
            status: batchNewStatus,
            absentCount: newAbsentCount,
            consecutiveAbsent: newConsecutive,
            riskLevel: newRisk,
            manualRemarks: batchRemarks,
            auditNote: batchRemarks,
            latestChangeReason: reasonLabel,
            auditTime: '刚刚 (2026-10-12 10:45)',
            leaveNote: {
              type: batchLeaveType,
              reason: batchReason,
              hospitalOrOrg: batchHospitalOrOrg,
              doctorAdvice: batchDoctorAdvice,
              submittedAt: s.leaveNote?.submittedAt || '今日 09:30',
              approvedAt: '2026-10-12 10:45',
              approver: '张立华 教授 (主讲教师)',
              noteStatus: (batchNewStatus === 'absent_gray' ? 'rejected' : 'approved') as 'approved' | 'rejected',
            },
          };
        }
        return s;
      })
    );

    // Sync calendar days list
    setCalendarDaysList((prevDays) =>
      prevDays.map((day) => {
        if (day.absent && isApprovedOrChecked) {
          const selectedStudentNames = students
            .filter((s) => selectedStudentIds.includes(s.id))
            .map((s) => s.name);
          const updatedAbsent = day.absent.filter((ab: any) => !selectedStudentNames.includes(ab.name));
          const removedCount = day.absent.length - updatedAbsent.length;
          const newChecked = Math.min(day.total, day.checked + removedCount);
          const newRate = Number(((newChecked / day.total) * 100).toFixed(1));
          return {
            ...day,
            absent: updatedAbsent,
            checked: newChecked,
            rate: newRate,
          };
        }
        return day;
      })
    );

    notify(
      `✅ 已成功对 ${selectedStudentIds.length} 名学生完成批量【人工核查/补签】！状态统一更新为【${statusTitle}】，考勤看板已同步！`
    );
    setSelectedStudentIds([]);
    setIsBatchAuditModalOpen(false);
  };

  const handleQuickBatchStatus = (
    targetStatus: 'leave_approved' | 'official_leave' | 'checked_in' | 'absent_gray',
    reason: string,
    remarks: string
  ) => {
    if (selectedStudentIds.length === 0) return;
    const isApprovedOrChecked =
      targetStatus === 'leave_approved' ||
      targetStatus === 'official_leave' ||
      targetStatus === 'checked_in';

    setStudents((prevStudents) =>
      prevStudents.map((s) => {
        if (selectedStudentIds.includes(s.id)) {
          const isClearingAbsence = s.status === 'absent_gray' && isApprovedOrChecked;
          const newAbsentCount = isClearingAbsence
            ? Math.max(0, (s.absentCount || 1) - 1)
            : s.absentCount || 0;
          const newConsecutive = isClearingAbsence ? 0 : s.consecutiveAbsent || 0;
          const newRisk: 'high' | 'medium' | 'low' =
            newAbsentCount >= 4 ? 'high' : newAbsentCount >= 2 ? 'medium' : 'low';

          return {
            ...s,
            status: targetStatus,
            absentCount: newAbsentCount,
            consecutiveAbsent: newConsecutive,
            riskLevel: newRisk,
            manualRemarks: remarks,
            auditNote: remarks,
            latestChangeReason: reason,
            auditTime: '刚刚 (2026-10-12 10:45)',
            leaveNote: {
              type: targetStatus === 'official_leave' ? 'official' : targetStatus === 'checked_in' ? 'late_makeup' : 'sick',
              reason: remarks,
              hospitalOrOrg: '教务现场核验',
              doctorAdvice: '讲师快捷批量核验审批',
              submittedAt: s.leaveNote?.submittedAt || '今日 09:30',
              approvedAt: '2026-10-12 10:45',
              approver: '张立华 教授 (主讲教师)',
              noteStatus: (targetStatus === 'absent_gray' ? 'rejected' : 'approved') as 'approved' | 'rejected',
            },
          };
        }
        return s;
      })
    );

    // Sync calendar days list if applicable
    if (isApprovedOrChecked) {
      setCalendarDaysList((prevDays) =>
        prevDays.map((day) => {
          if (day.absent) {
            const selectedStudentNames = students
              .filter((s) => selectedStudentIds.includes(s.id))
              .map((s) => s.name);
            const updatedAbsent = day.absent.filter((ab: any) => !selectedStudentNames.includes(ab.name));
            const removedCount = day.absent.length - updatedAbsent.length;
            const newChecked = Math.min(day.total, day.checked + removedCount);
            const newRate = Number(((newChecked / day.total) * 100).toFixed(1));
            return {
              ...day,
              absent: updatedAbsent,
              checked: newChecked,
              rate: newRate,
            };
          }
          return day;
        })
      );
    }

    notify(`⚡ 已快捷批量更新 ${selectedStudentIds.length} 名学生为【${reason}】状态！`);
    setSelectedStudentIds([]);
  };

  // Helper for dynamic status display & styling (icon + text)
  const getStatusBubbleConfig = (student: StudentItem): {
    text: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    dotColor: string;
    icon: React.ReactNode;
  } => {
    // Priority: Offline local cached status
    if (student.isOfflineCached || student.offlineSyncStatus === 'pending') {
      return {
        text: '离线已存',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-400',
        dotColor: 'bg-amber-500',
        icon: <Database size={11} className="shrink-0" />,
      };
    }

    if (student.latestChangeReason) {
      if (student.latestChangeReason.includes('销假') || student.latestChangeReason.includes('准假')) {
        return {
          text: student.latestChangeReason,
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-300',
          dotColor: 'bg-emerald-500',
          icon: <CheckCircle2 size={11} className="shrink-0" />,
        };
      }
      if (student.latestChangeReason.includes('补录') || student.latestChangeReason.includes('实到')) {
        return {
          text: student.latestChangeReason,
          bgColor: 'bg-blue-50',
          textColor: 'text-[#1877F2]',
          borderColor: 'border-[#1877F2]/40',
          dotColor: 'bg-[#1877F2]',
          icon: <Check size={11} className="shrink-0" />,
        };
      }
      if (student.latestChangeReason.includes('公假') || student.latestChangeReason.includes('竞赛')) {
        return {
          text: student.latestChangeReason,
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-700',
          borderColor: 'border-indigo-300',
          dotColor: 'bg-indigo-500',
          icon: <Award size={11} className="shrink-0" />,
        };
      }
      if (student.latestChangeReason.includes('待审')) {
        return {
          text: student.latestChangeReason,
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-300',
          dotColor: 'bg-amber-500',
          icon: <Clock size={11} className="shrink-0" />,
        };
      }
      return {
        text: student.latestChangeReason,
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-700',
        borderColor: 'border-rose-300',
        dotColor: 'bg-rose-500',
        icon: <AlertCircle size={11} className="shrink-0" />,
      };
    }

    // Fallback by status
    switch (student.status) {
      case 'leave_approved':
        return {
          text: '请假销假',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-300',
          dotColor: 'bg-emerald-500',
          icon: <CheckCircle2 size={11} className="shrink-0" />,
        };
      case 'official_leave':
        return {
          text: '竞赛公假',
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-700',
          borderColor: 'border-indigo-300',
          dotColor: 'bg-indigo-500',
          icon: <Award size={11} className="shrink-0" />,
        };
      case 'checked_in':
        return {
          text: student.leaveNote ? '人工补录' : '信标入圈',
          bgColor: 'bg-blue-50',
          textColor: 'text-[#1877F2]',
          borderColor: 'border-[#1877F2]/40',
          dotColor: 'bg-[#1877F2]',
          icon: student.leaveNote ? <Check size={11} className="shrink-0" /> : <Radio size={11} className="shrink-0" />,
        };
      case 'in_geofence':
        return {
          text: '信标入圈',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-300',
          dotColor: 'bg-amber-500',
          icon: <Radio size={11} className="shrink-0" />,
        };
      case 'absent_gray':
      default:
        if (student.leaveNote) {
          return {
            text: '假条待审',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-800',
            borderColor: 'border-amber-300',
            dotColor: 'bg-amber-500',
            icon: <Clock size={11} className="shrink-0" />,
          };
        }
        return {
          text: '旷课未到',
          bgColor: 'bg-rose-50',
          textColor: 'text-rose-600',
          borderColor: 'border-rose-200',
          dotColor: 'bg-rose-500',
          icon: <AlertCircle size={11} className="shrink-0" />,
        };
    }
  };

  // Handle Session End -> Missed Check-in & Push Alerts
  const handleEndSessionAndAlert = () => {
    setIsSessionActive(false);

    const missedList: StudentItem[] = [];
    setStudents((prev) =>
      prev.map((s) => {
        if (s.status !== 'checked_in') {
          missedList.push(s);
          return { ...s, isMissed: true };
        }
        return s;
      })
    );

    setStudents((prev) => {
      const copy = [...prev];
      copy.sort((a, b) => {
        if (a.isMissed && !b.isMissed) return -1;
        if (!a.isMissed && b.isMissed) return 1;
        return a.name.localeCompare(b.name, 'zh');
      });
      return copy;
    });

    const absentNames = missedList.map((m) => m.name).join('、') || '无缺勤';
    const newNotice = {
      id: `notice-${Date.now()}`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      text: `【缺勤警报推送】课程《数据结构与算法》下课。未签到学生：${absentNames}。已同步至任课教师、班主任及班长。`,
      roleTargets: '任课教师 / 班主任 / 班长',
    };

    setNotifications((prev) => [newNotice, ...prev]);
    notify(`⚠️ 课程下课！未打卡学生高亮置顶。告警已同时推送给任课教师、班主任及班长！`);
  };

  // Handle Create Course Submission ("确认新建并同步课表按钮改为：同步课表并在地图生成灯塔坐标")
  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) {
      notify('请输入课程名称');
      return;
    }

    const assignedClasses = selectedClasses;
    const selectedTotalCount = selectedClasses.reduce((sum, clsName) => {
      const found = classList.find((c) => c.name === clsName);
      return sum + (found ? found.count : 0);
    }, 0);
    const fullScheduleStr = `每${newCourseDay} ${newCourseTime}`;
    const targetLat = parseFloat(newLat) || 36.0592;
    const targetLng = parseFloat(newLng) || 103.8343;

    const created: CourseItem = {
      id: `course-${Date.now()}`,
      name: newCourseName,
      teacher: newCourseTeacher,
      schedule: fullScheduleStr,
      classroom: newCourseRoom,
      groupType: newGroupType,
      classes: assignedClasses,
      beaconLat: targetLat,
      beaconLng: targetLng,
      beaconRadius: parseInt(newBeaconRadius, 10) || 50,
      status: 'upcoming',
      attendancePct: 0,
      checkedCount: 0,
      totalCount: selectedTotalCount || (newGroupType === 'large' ? 62 : 32),
      hasBeaconIcon: true,
    };

    // Add to courses list
    setCourses((prev) => [created, ...prev]);

    // Automatically synchronize and map into the weekly timetable schedule
    const newScheduleItem = {
      id: `sch-${Date.now()}`,
      day: newCourseDay,
      title: newCourseName,
      time: newCourseTime,
      room: newCourseRoom,
      tag: newGroupType === 'large' ? '合班大课' : '小班精讲',
      hasBeacon: true,
      isToday: newCourseDay === '周一',
      classes: assignedClasses.join(', '),
    };

    setWeeklySchedule((prev) => {
      const dayOrder: Record<string, number> = { '周一': 1, '周二': 2, '周三': 3, '周四': 4, '周五': 5, '周六': 6, '周日': 7 };
      const updated = [...prev, newScheduleItem];
      updated.sort((a, b) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99));
      return updated;
    });

    // Automatically create lighthouse beacon on map and save marker
    const rawTeacher = newCourseTeacher.trim() || '张立华';
    const teacherClean = rawTeacher.replace(/（我）|\(我\)/g, '').trim();
    const teacherFormatted = teacherClean.includes('教授') ? teacherClean : `${teacherClean} 教授`;
    const beaconTitle = `${teacherFormatted} + ${newCourseName.trim()}`;

    const beaconMarker: CustomMapMarker = {
      id: `beacon-${Date.now()}`,
      lat: targetLat,
      lng: targetLng,
      icon: '🗼',
      category: 'life',
      categoryLabel: '课程灯塔',
      title: beaconTitle,
      address: `50m 虚拟考勤围栏 · ${newCourseRoom || '计算机实验室'}`,
      createdAt: Date.now(),
      timeString: '刚刚生成',
      note: `【课程灯塔】${beaconTitle} 已同步课表并在地图生成灯塔坐标与 50m 虚拟信标`,
      authorName: teacherFormatted,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      isBeacon: true,
      color: '#1877F2',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('stellar_custom_markers') || '[]');
      const filtered = existing.filter((m: any) => m.id !== beaconMarker.id);
      const updated = [beaconMarker, ...filtered];
      localStorage.setItem('stellar_custom_markers', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('stellar_custom_markers_updated', { detail: beaconMarker }));
    } catch (err) {
      console.error('Error saving beacon marker:', err);
    }

    if (onLightUpBeacon) {
      onLightUpBeacon({
        teacher: teacherFormatted,
        courseName: newCourseName.trim(),
        lat: targetLat,
        lng: targetLng,
        room: newCourseRoom || '3-101 计算机实验室',
      });
    }

    setNewCourseName('');
    setIsCreateCourseModalOpen(false);
    setActiveTab('attendance');
    setSelectedCourseForSession(null);
    notify(`✅ 成功同步课表并在地图生成《${created.name}》灯塔坐标！`);
  };

  // Open Edit Course Modal Helper
  const openEditCourseModal = (course: CourseItem) => {
    // 介绍的课程不可以修改
    if (course.isIntroductory || course.id.includes('intro') || course.name.includes('介绍课程') || course.name.includes('导论 (介绍')) {
      notify(`⚠️ 课程《${course.name}》为学院统一介绍课程，参数受教务处锁定保护，不可修改。`);
      return;
    }

    setEditingCourse(course);
    setEditCourseName(course.name);
    setEditTeacher(course.teacher || '张立华 教授');
    setEditClassroom(course.classroom || '3-101 计算机实验室');
    
    // Parse day and time from schedule string if available
    const parts = course.schedule.split(' ');
    if (parts.length >= 2) {
      setEditDay(parts[0].replace('每', ''));
      setEditTime(parts.slice(1).join(' '));
    } else {
      setEditDay('周一');
      setEditTime(course.schedule || '10:00 - 12:00');
    }

    setEditGroupType(course.groupType || 'small');
    setEditBeaconRadius(String(course.beaconRadius || 50));
    setEditClasses(course.classes.join(', '));
    setEditSelectedClasses(course.classes && course.classes.length > 0 ? course.classes : ['CS101 计科一班']);
    setEditLessonPlan(`《${course.name}》直角线条教案与课程实验安排`);
    setIsEditCourseModalOpen(true);
  };

  // Save Edited Course Handler
  const handleSaveEditedCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editCourseName.trim()) {
      notify('请输入有效课程名称');
      return;
    }

    const updatedClassesArr = editSelectedClasses.length > 0 ? editSelectedClasses : editClasses.split(/[,，]/).map((c) => c.trim()).filter(Boolean);
    const updatedScheduleStr = `每${editDay} ${editTime}`;

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === editingCourse.id) {
          return {
            ...c,
            name: editCourseName,
            teacher: editTeacher,
            classroom: editClassroom,
            schedule: updatedScheduleStr,
            groupType: editGroupType,
            beaconRadius: parseInt(editBeaconRadius, 10) || 50,
            classes: updatedClassesArr.length > 0 ? updatedClassesArr : c.classes,
          };
        }
        return c;
      })
    );

    // Also update weekly schedule matrix
    setWeeklySchedule((prev) =>
      prev.map((item) => {
        if (item.title.includes(editingCourse.name) || editingCourse.name.includes(item.title) || item.id === editingCourse.id) {
          return {
            ...item,
            title: editCourseName,
            day: editDay,
            time: editTime,
            room: editClassroom,
            tag: editGroupType === 'large' ? '合班大课' : '小班精讲',
            classes: updatedClassesArr.join(', '),
          };
        }
        return item;
      })
    );

    setIsEditCourseModalOpen(false);
    notify(`✅ 成功修改课程《${editCourseName}》信息与课表排期！信标 50m 参数已自动刷新。`);
  };

  return (
    <div className="w-full h-full bg-[#F0F2F5] relative font-sans flex flex-col select-none text-[#1C1E21] overflow-hidden">

      {/* ================= STYLE GUIDE MODAL (FACEBOOK DESIGN SYSTEM) ================= */}
      {showStyleGuide && (
        <div className="bg-[#FAFBFD] p-3 border-b border-[#E4E6EB] space-y-2 text-xs shrink-0 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-1.5">
            <h3 className="font-bold text-[#1C1E21] flex items-center gap-1.5 text-[11px]">
              <Layers size={14} className="text-[#1877F2]" />
              <span>Facebook UI 规范 (Straight-Edge Style)</span>
            </h3>
            <button
              onClick={() => setShowStyleGuide(false)}
              className="text-[#65676B] hover:text-[#1C1E21] cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white p-2 border border-[#E4E6EB] space-y-1">
              <span className="font-bold text-[#1877F2]">Palette:</span>
              <div className="flex gap-1 pt-1">
                <span className="w-3.5 h-3.5 bg-[#1877F2] inline-block border border-[#1877F2]" title="Primary #1877F2" />
                <span className="w-3.5 h-3.5 bg-[#F0F2F5] inline-block border border-[#E4E6EB]" title="Page BG #F0F2F5" />
                <span className="w-3.5 h-3.5 bg-[#E4E6EB] inline-block border border-[#E4E6EB]" title="Border #E4E6EB" />
                <span className="w-3.5 h-3.5 bg-[#1C1E21] inline-block" title="Text #1C1E21" />
                <span className="w-3.5 h-3.5 bg-[#42B72A] inline-block" title="Success #42B72A" />
                <span className="w-3.5 h-3.5 bg-[#F23B6A] inline-block" title="Danger #F23B6A" />
              </div>
            </div>

            <div className="bg-white p-2 border border-[#E4E6EB] space-y-1">
              <span className="font-bold text-[#1C1E21]">直角无伪影:</span>
              <p className="text-[#65676B] leading-tight">
                圆角 &le; 4px，1px 灰色细线，无伪影，平铺配色。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOP PERMANENT USER ROLE IDENTITY & IN-APP SWITCHER ================= */}
      <div className="bg-white border-b border-[#E4E6EB] px-3 py-1.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative shrink-0">
            <img
              src={ROLE_CONFIGS[role]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              alt={ROLE_CONFIGS[role]?.characterName || '用户角色'}
              className="w-7 h-7 rounded-full object-cover border border-[#E4E6EB]"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-[11.5px] font-bold text-[#050505] truncate">
                {role === 'instructor'
                  ? `${identityName} ${teacherRankTag}`
                  : role === 'adviser'
                  ? `${identityName} 辅导员`
                  : ROLE_CONFIGS[role]?.characterName || '张立华 教授'}
              </span>
              <span
                className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-xs border ${
                  role === 'instructor'
                    ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]/30'
                    : role === 'adviser'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                    : ROLE_CONFIGS[role]?.badgeClass || 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]/30'
                } shrink-0`}
              >
                {role === 'instructor'
                  ? `教师 · ${teacherRankTag}`
                  : role === 'adviser'
                  ? `辅导员 · ${counselorRankTag}`
                  : ROLE_CONFIGS[role]?.name || '领航员'}
              </span>
            </div>
            <div className="text-[9px] text-[#65676B] truncate">
              {role === 'instructor' || role === 'adviser'
                ? `${identityDept} · ${identityStaffId}`
                : `${ROLE_CONFIGS[role]?.title} · ${ROLE_CONFIGS[role]?.dept}`}
            </div>
          </div>
        </div>

        {/* Action buttons: Return Button + Reselect Identity + Switch Role */}
        <div className="flex items-center gap-1 shrink-0">
          {onClose && (
            <button
              type="button"
              id="course-app-internal-back-btn"
              onClick={onClose}
              className="px-2 py-0.8 bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-95 text-[#1877F2] text-[9.5px] font-bold rounded-xs border border-[#CED0D4] flex items-center gap-0.5 cursor-pointer transition-colors shadow-2xs"
              title="返回手机主页地图"
            >
              <ArrowLeft size={11} className="stroke-[2.5]" />
              <span>返回</span>
            </button>
          )}

          <button
            type="button"
            id="reselect-identity-top-btn"
            onClick={() => setIsIdentityModalOpen(true)}
            className="px-2 py-0.8 bg-[#E7F3FF] hover:bg-[#D8EBFF] text-[#1877F2] text-[9.5px] font-bold rounded-xs border border-[#1877F2]/30 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            title="重新选择教师或辅导员身份"
          >
            <GraduationCap size={11} />
            <span>重选身份</span>
          </button>

          {/* Quick in-app role switch button with popup */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsInAppRoleMenuOpen(!isInAppRoleMenuOpen)}
              className="px-2 py-0.8 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] text-[9.5px] font-bold rounded-xs border border-[#CED0D4] flex items-center gap-1 cursor-pointer transition-colors"
              title="在手机端直接切换角色"
            >
              <Users size={11} />
              <span>切换角色</span>
              <ChevronDown size={10} className={isInAppRoleMenuOpen ? 'rotate-180' : ''} />
            </button>

          {isInAppRoleMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#E4E6EB] rounded-md shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95">
              <div className="text-[9px] font-bold text-[#65676B] px-1 pb-1 border-b border-[#E4E6EB]">
                切换用户角色 (对应界面与内容将实时更新)
              </div>
              {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((rKey) => {
                const cfg = ROLE_CONFIGS[rKey];
                const isAct = role === rKey;
                return (
                  <button
                    key={rKey}
                    type="button"
                    onClick={() => {
                      setRole(rKey);
                      setIsInAppRoleMenuOpen(false);
                      if (onRoleChange) onRoleChange(rKey);
                      notify(`已切换至「${cfg.name} · ${cfg.characterName}」(${cfg.title})，对应界面与内容已同步`);
                    }}
                    className={`w-full p-1.5 rounded-xs text-left text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isAct
                        ? 'bg-[#E7F3FF] text-[#1877F2] font-bold'
                        : 'hover:bg-[#F0F2F5] text-[#050505]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img src={cfg.avatar} alt={cfg.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold truncate">{cfg.characterName}</div>
                        <div className="text-[8px] text-[#65676B] truncate">{cfg.name} · {cfg.title}</div>
                      </div>
                    </div>
                    {isAct && <Check size={12} className="text-[#1877F2] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* ================= TOP PERMANENT ACTIONS BAR (2-NAV FOR INSTRUCTOR, 4-NAV FOR OTHERS) ================= */}
      <div className="bg-white p-2 border-b border-[#E4E6EB] shrink-0 shadow-2xs">
        {role === 'instructor' ? (
          <div className="grid grid-cols-2 gap-2 text-center font-bold">
            {/* 1. 电子考勤 (含 实时考勤大厅 与 考勤看板) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('attendance');
                setSelectedCourseForSession(null);
              }}
              className={`py-2 px-2.5 rounded-xs transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                activeTab === 'attendance' || activeTab === 'analytics'
                  ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] font-black shadow-2xs'
                  : 'bg-white text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#1877F2] border-[#E4E6EB]'
              }`}
            >
              <Compass size={18} className={activeTab === 'attendance' || activeTab === 'analytics' ? 'text-[#1877F2] stroke-[2.5]' : ''} />
              <div className="text-left leading-tight">
                <div className="text-[11px] font-bold">电子考勤</div>
                <div className="text-[8px] opacity-75 font-normal">实时考勤 · 考勤看板</div>
              </div>
            </button>

            {/* 2. 我的课程 (含 课程管理 与 课程课表/日历) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('mycourses');
              }}
              className={`py-2 px-2.5 rounded-xs transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                activeTab === 'mycourses' || activeTab === 'badges' || activeTab === 'create'
                  ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] font-black shadow-2xs'
                  : 'bg-white text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#1877F2] border-[#E4E6EB]'
              }`}
            >
              <BookOpen size={18} className={activeTab === 'mycourses' || activeTab === 'badges' || activeTab === 'create' ? 'text-[#1877F2] stroke-[2.5]' : ''} />
              <div className="text-left leading-tight">
                <div className="text-[11px] font-bold">我的课程</div>
                <div className="text-[8px] opacity-75 font-normal">课程列表 · 课程课表</div>
              </div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-bold">
            {/* TAB 1 */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('attendance');
                setSelectedCourseForSession(null);
              }}
              className={`py-1.5 px-1 rounded-xs transition-all cursor-pointer flex flex-col items-center gap-0.5 border ${
                activeTab === 'attendance'
                  ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] font-black shadow-2xs'
                  : 'bg-white text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#1877F2] border-[#E4E6EB]'
              }`}
            >
              <Compass size={17} className={activeTab === 'attendance' ? 'text-[#1877F2] stroke-[2.5]' : ''} />
              <span className="text-[10px]">{ROLE_CONFIGS[role]?.tabNames[0] || '第一栏'}</span>
            </button>

            {/* TAB 2 */}
            <button
              type="button"
              onClick={() => setActiveTab('badges')}
              className={`py-1.5 px-1 rounded-xs transition-all cursor-pointer flex flex-col items-center gap-0.5 border ${
                activeTab === 'badges'
                  ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] font-black shadow-2xs'
                  : 'bg-white text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#1877F2] border-[#E4E6EB]'
              }`}
            >
              <CalendarDays size={17} className={activeTab === 'badges' ? 'text-[#1877F2] stroke-[2.5]' : ''} />
              <span className="text-[10px]">{ROLE_CONFIGS[role]?.tabNames[1] || '第二栏'}</span>
            </button>

            {/* TAB 3 */}
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`py-1.5 px-1 rounded-xs transition-all cursor-pointer flex flex-col items-center gap-0.5 border ${
                activeTab === 'analytics'
                  ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] font-black shadow-2xs'
                  : 'bg-white text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#1877F2] border-[#E4E6EB]'
              }`}
            >
              <TrendingUp size={17} className={activeTab === 'analytics' ? 'text-[#1877F2] stroke-[2.5]' : ''} />
              <span className="text-[10px]">{ROLE_CONFIGS[role]?.tabNames[2] || '第三栏'}</span>
            </button>

            {/* TAB 4 */}
            <button
              type="button"
              onClick={() => setActiveTab('mycourses')}
              className={`py-1.5 px-1 rounded-xs transition-all cursor-pointer flex flex-col items-center gap-0.5 border ${
                activeTab === 'mycourses'
                  ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] font-black shadow-2xs'
                  : 'bg-white text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#1877F2] border-[#E4E6EB]'
              }`}
            >
              <BookOpen size={17} className={activeTab === 'mycourses' ? 'text-[#1877F2] stroke-[2.5]' : ''} />
              <span className="text-[10px]">{ROLE_CONFIGS[role]?.tabNames[3] || '第四栏'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= MAIN IN-PLACE SCROLLABLE CONTENT ================= */}
      <div
        className="flex-1 overflow-y-auto overscroll-y-contain space-y-3 p-3 touch-pan-y pb-28 no-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Role-specific workspace rendering */}
        {role === 'student' ? (
          <StudentWorkspaceView
            activeTab={activeTab}
            showToast={notify}
            lightPoints={lightPoints}
            setLightPoints={setLightPoints}
          />
        ) : role === 'monitor' ? (
          <MonitorWorkspaceView
            activeTab={activeTab}
            showToast={notify}
          />
        ) : role === 'ta' ? (
          <TAWorkspaceView
            activeTab={activeTab}
            showToast={notify}
          />
        ) : role === 'adviser' ? (
          <AdviserWorkspaceView
            activeTab={activeTab}
            showToast={notify}
            counselorName={identityName}
            counselorRankTag={counselorRankTag}
            classList={classList}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        ) : role === 'admin' ? (
          <AdminWorkspaceView
            activeTab={activeTab}
            showToast={notify}
          />
        ) : (
          <>
        {/* TAB 1: 电子考勤 (含 实时考勤大厅 与 考勤看板与统计) */}
        {(activeTab === 'attendance' || activeTab === 'analytics') && (
          <div className="space-y-3">
            {/* 考勤子模块切换栏 (Facebook 直角线框风格) */}
            <div className="bg-white p-1 border border-[#E4E6EB] rounded-xs shadow-2xs flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setAttendanceSubTab('live');
                  if (activeTab === 'analytics') setActiveTab('attendance');
                }}
                className={`flex-1 py-1.5 px-2 rounded-2xs text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  (activeTab !== 'analytics' && attendanceSubTab === 'live')
                    ? 'bg-[#1877F2] text-white shadow-2xs'
                    : 'bg-[#F0F2F5] text-[#65676B] hover:text-[#1877F2] hover:bg-[#E7F3FF]'
                }`}
              >
                <Compass size={14} />
                <span>实时考勤大厅</span>
                <span className={`text-[8.5px] px-1 py-0.2 rounded-2xs ${
                  (activeTab !== 'analytics' && attendanceSubTab === 'live') ? 'bg-white/20 text-white' : 'bg-white text-[#1877F2] border border-[#CED0D4]'
                }`}>
                  空间信标
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAttendanceSubTab('analytics');
                }}
                className={`flex-1 py-1.5 px-2 rounded-2xs text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  (activeTab === 'analytics' || attendanceSubTab === 'analytics')
                    ? 'bg-[#1877F2] text-white shadow-2xs'
                    : 'bg-[#F0F2F5] text-[#65676B] hover:text-[#1877F2] hover:bg-[#E7F3FF]'
                }`}
              >
                <TrendingUp size={14} />
                <span>考勤看板与统计</span>
                <span className={`text-[8.5px] px-1 py-0.2 rounded-2xs ${
                  (activeTab === 'analytics' || attendanceSubTab === 'analytics') ? 'bg-white/20 text-white' : 'bg-white text-[#1877F2] border border-[#CED0D4]'
                }`}>
                  96.8%
                </span>
              </button>
            </div>

            {/* 子视图 1: 实时考勤大厅 */}
            {(activeTab !== 'analytics' && attendanceSubTab === 'live') && (
              <div className="space-y-3">
            {/* 1. COURSES OVERLAPPING SWIPEABLE CARDS SECTION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                  <BookOpen size={14} className="text-[#1877F2]" />
                  <span>本学期课程 ({courses.length})</span>
                </h3>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#65676B]">卡片切换</span>
                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      type="button"
                      onClick={() => setActiveCourseSlideIndex((prev) => (prev > 0 ? prev - 1 : courses.length - 1))}
                      className="w-5 h-5 rounded-xs bg-white hover:bg-gray-100 border border-[#E4E6EB] flex items-center justify-center text-[#1C1E21] cursor-pointer shadow-2xs"
                      title="上一门课程"
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <span className="text-[9px] font-mono text-[#1877F2] font-bold px-1">
                      {activeCourseSlideIndex + 1}/{courses.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveCourseSlideIndex((prev) => (prev < courses.length - 1 ? prev + 1 : 0))}
                      className="w-5 h-5 rounded-xs bg-white hover:bg-gray-100 border border-[#E4E6EB] flex items-center justify-center text-[#1C1E21] cursor-pointer shadow-2xs"
                      title="下一门课程"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Overlapping Slider Deck Container */}
              <div className="relative pt-1">
                {courses.length === 0 ? (
                  <div className="bg-white border border-[#E4E6EB] rounded-md p-4 text-center space-y-3 shadow-2xs">
                    <div className="w-10 h-10 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center mx-auto">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#050505]">暂无授课课程建立记录</h4>
                      <p className="text-[10px] text-[#65676B] mt-0.5 max-w-xs mx-auto">
                        已为您去除预置课程，请从头填写建立第一门授课课程，建立后将自动排入课表并点亮 50m 虚拟考勤信标
                      </p>
                    </div>
                    <button
                      type="button"
                      id="goto-create-course-live-btn"
                      onClick={() => {
                        setActiveTab('mycourses');
                        setCourseSubTab('courses');
                      }}
                      className="px-4 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-xs cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Plus size={14} className="stroke-[3]" />
                      <span>从头填写建立第一门课程</span>
                    </button>
                  </div>
                ) : courses[activeCourseSlideIndex] && (
                  isScrolledDown ? (
                    /* NARROW COLLAPSED SUMMARY CARD */
                    <div
                      onClick={() => setIsScrolledDown(false)}
                      className="bg-white border-2 border-[#1877F2] rounded-xs p-2.5 shadow-xs flex items-center justify-between cursor-pointer animate-in fade-in duration-150"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="p-1 bg-[#E7F3FF] text-[#1877F2] rounded-2xs border border-[#1877F2]/20 shrink-0">
                          <Radio size={12} className="animate-pulse" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-[#1C1E21] truncate">
                              {courses[activeCourseSlideIndex].name}
                            </h4>
                            <span className="text-[8px] px-1 py-0.2 bg-[#E7F3FF] text-[#1877F2] font-bold rounded-2xs border border-[#1877F2]/30 shrink-0">
                              {courses[activeCourseSlideIndex].schedule}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-[#65676B] truncate mt-0.5">
                            {courses[activeCourseSlideIndex].teacher} · {courses[activeCourseSlideIndex].classroom} · {courses[activeCourseSlideIndex].classes.join(', ')} ({courses[activeCourseSlideIndex].totalCount}人)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsScrolledDown(false);
                          }}
                          className="px-2 py-1 bg-[#E7F3FF] text-[#1877F2] text-[9px] font-bold rounded-xs cursor-pointer border border-[#1877F2]/30"
                        >
                          展开详情
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const curr = courses[activeCourseSlideIndex];
                            if (curr) openEditCourseModal(curr);
                          }}
                          className="px-2 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] text-[9px] font-bold rounded-xs cursor-pointer border border-[#E4E6EB] flex items-center gap-0.5"
                        >
                          <Edit3 size={10} className="text-[#1877F2]" />
                          <span>修改</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* EXPANDED FULL COURSE CARD */
                    <div className="bg-white border-2 border-[#1877F2] rounded-xs p-3.5 shadow-xs space-y-2.5 relative z-10 transition-all">
                      {/* Top Highlight Banner for Current Course */}
                      <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="p-1 bg-[#E7F3FF] text-[#1877F2] rounded-xs border border-[#1877F2]/20 shrink-0">
                            <Radio size={13} className="animate-pulse" />
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-[#1C1E21]">
                                {courses[activeCourseSlideIndex].name}
                              </h4>
                              <span className="text-[8px] px-1.5 py-0.2 bg-[#E7F3FF] text-[#1877F2] font-bold rounded-2xs border border-[#1877F2]/30">
                                {courses[activeCourseSlideIndex].groupType === 'large' ? '合班大课' : '小班精讲'}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#65676B] flex items-center gap-1 mt-0.5">
                              <span>{courses[activeCourseSlideIndex].teacher}</span>
                              <span>·</span>
                              <span>{courses[activeCourseSlideIndex].classroom}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] px-2 py-0.5 rounded-xs font-black border ${
                            courses[activeCourseSlideIndex].status === 'ongoing'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-300 ring-2 ring-emerald-400/20 animate-pulse'
                              : 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]/30'
                          }`}>
                            {courses[activeCourseSlideIndex].status === 'ongoing' ? '⚡ 考勤进行中' : '🕒 待上课 (信标待命)'}
                          </span>
                        </div>
                      </div>

                      {/* Multi-layer Course Attribute Matrix */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-xs space-y-0.5">
                          <span className="text-[9px] text-[#65676B] block">排课时间:</span>
                          <span className="font-bold text-[#1C1E21]">{courses[activeCourseSlideIndex].schedule}</span>
                        </div>
                        <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-xs space-y-0.5">
                          <span className="text-[9px] text-[#65676B] block">教学班级 / 人数:</span>
                          <span className="font-bold text-[#1877F2]">
                            {courses[activeCourseSlideIndex].classes.join(', ')} ({courses[activeCourseSlideIndex].totalCount}人)
                          </span>
                        </div>
                        <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-xs space-y-0.5">
                          <span className="text-[9px] text-[#65676B] block">信标围栏 / 半径:</span>
                          <span className="font-mono font-bold text-emerald-600">
                            {courses[activeCourseSlideIndex].beaconRadius} 米虚拟信标 (已挂载)
                          </span>
                        </div>
                        <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-xs space-y-0.5">
                          <span className="text-[9px] text-[#65676B] block">自动在位打卡规则:</span>
                          <span className="font-bold text-[#1C1E21]">30分钟连续在位无感签到</span>
                        </div>
                      </div>

                      {/* Action Launch Bar */}
                      <div className="pt-2 border-t border-[#E4E6EB] flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const curr = courses[activeCourseSlideIndex];
                            if (curr) openEditCourseModal(curr);
                          }}
                          className="px-2.5 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] text-[10px] font-bold rounded-xs cursor-pointer border border-[#E4E6EB] flex items-center gap-1 shrink-0"
                        >
                          <Edit3 size={11} className="text-[#1877F2]" />
                          <span>修改课程</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsAttendanceHallExpanded((prev) => !prev)}
                          className="px-2.5 py-1 text-[10px] font-bold text-[#1877F2] bg-[#E7F3FF] hover:bg-[#DBECFE] rounded-xs border border-[#1877F2]/30 cursor-pointer flex items-center gap-1 shadow-2xs transition-all"
                        >
                          <span>{isAttendanceHallExpanded ? '收起考勤大厅' : '展开考勤大厅'}</span>
                          {isAttendanceHallExpanded ? (
                            <ChevronUp size={12} className="stroke-[2.5]" />
                          ) : (
                            <ChevronDown size={12} className="stroke-[2.5]" />
                          )}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* 2. REAL-TIME ATTENDANCE SESSION HALL (CONDITIONALLY EXPANDED) */}
            {isAttendanceHallExpanded ? (
              <div
                className={`space-y-3 pt-2 border-t-2 border-[#1877F2] animate-in fade-in duration-150 relative transition-all duration-700 ${
                  beaconEnergy.isRadiant ? 'radiant-beacon-breathe-slow' : ''
                }`}
              >
                {/* Radiant Beacon Unlocked (>90%) Immersive Atmosphere Banner & Drifting Ambient Particles */}
                {beaconEnergy.isRadiant && (
                  <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-yellow-400/25 to-amber-500/15 border-2 border-amber-400 rounded-md p-3 shadow-[0_0_30px_rgba(251,191,36,0.35)] animate-in fade-in zoom-in-95 duration-200">
                    {/* Ambient Drifting Sparkles */}
                    <div className="absolute top-1 left-8 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm animate-radiant-sparkle-1 pointer-events-none" />
                    <div className="absolute bottom-2 left-1/3 w-2 h-2 rounded-full bg-yellow-300 shadow-sm animate-radiant-sparkle-2 pointer-events-none" />
                    <div className="absolute top-2 right-12 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm animate-radiant-sparkle-3 pointer-events-none" />
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-300/30 rounded-full blur-xl animate-pulse pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between text-xs gap-2 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 flex items-center justify-center font-black shadow-sm shrink-0">
                          <div className="absolute inset-0 rounded-full border border-amber-500/80 animate-radiant-ring-fast" />
                          <Sparkles size={16} className="animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-black text-amber-900 flex-wrap">
                            <span>🌟 空间信标「璀璨充能」已全域激活 ({currentAttendancePct}%)</span>
                            <span className="text-[8.5px] px-1.5 py-0.2 bg-amber-400 text-amber-950 font-mono font-bold rounded-2xs border border-amber-500 shadow-2xs">
                              全厅黄金呼吸渲染中
                            </span>
                          </div>
                          <p className="text-[9.5px] text-amber-800/90 mt-0.5">
                            50m 空间信标辐射场强满载 · 到课率达标 {currentAttendancePct}% · 考勤大厅 UI 元素进入发光呼吸节奏
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2.5 py-1 bg-amber-400 text-amber-950 text-[9.5px] font-mono font-black rounded-xs border border-amber-500 flex items-center gap-1 shadow-2xs">
                          <Zap size={11} className="fill-amber-900 text-amber-900 animate-bounce" />
                          <span>{currentAttendancePct}% 满充</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`bg-white border p-3 rounded-md shadow-2xs space-y-2.5 transition-all duration-700 ${
                    beaconEnergy.isRadiant
                      ? 'radiant-ui-element-glow border-amber-400/80'
                      : 'border-[#E4E6EB]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2 flex-wrap gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${beaconEnergy.isRadiant ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-ping'}`} />
                      <h3 className="text-xs font-bold text-[#1C1E21]">
                        《{courses[activeCourseSlideIndex]?.name || '数据结构与算法'}》· 200人大课考勤大厅
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-xs border flex items-center gap-1 ${
                          beaconEnergy.isRadiant
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]/30'
                        }`}
                      >
                        {beaconEnergy.isRadiant ? (
                          <>
                            <Sparkles size={11} className="text-amber-500 animate-spin" />
                            <span>璀璨信标共振中</span>
                          </>
                        ) : (
                          <span>实时在位融合中</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* High-Impact Radiant Beacon Energy Charging Reactor Core & Visualizer */}
                  <div
                    className={`p-3 border rounded-md space-y-2.5 transition-all duration-700 relative overflow-hidden ${
                      beaconEnergy.isRadiant
                        ? 'bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.65)]'
                        : 'bg-[#FAFBFD] border-[#E4E6EB]'
                    }`}
                    style={beaconEnergy.isRadiant ? beaconEnergy.pulseStyle : undefined}
                  >
                    {/* Glowing Breathing Ambient Aura and Upward Sparks */}
                    {beaconEnergy.isRadiant && (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-300/35 via-yellow-400/15 to-transparent animate-pulse pointer-events-none" />
                        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-400/35 rounded-full blur-xl animate-ping pointer-events-none" />
                        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-300/35 rounded-full blur-xl animate-ping pointer-events-none" />
                        <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-radiant-sparkle-1 pointer-events-none" />
                        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-yellow-200 rounded-full animate-radiant-sparkle-2 pointer-events-none" />
                      </>
                    )}

                    {/* Top Energy Header & 3D Reactor Display */}
                    <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3">
                        {/* 3D Energetic Beacon Reactor Orb */}
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                          {/* Outer Rotating Energy Ring */}
                          <div
                            className={`absolute inset-0 rounded-full border-2 border-dashed ${
                              beaconEnergy.isRadiant ? 'border-amber-400 animate-radiant-ring' : 'border-[#1877F2]/40 animate-spin'
                            }`}
                          />
                          {/* Inner Reverse Energy Ring */}
                          <div
                            className={`absolute inset-1.5 rounded-full border border-dotted ${
                              beaconEnergy.isRadiant ? 'border-yellow-300 animate-radiant-ring-reverse' : 'border-blue-400/30'
                            }`}
                          />
                          {/* Expanding Radar Wave */}
                          {beaconEnergy.isRadiant && (
                            <div className="absolute inset-0 rounded-full border border-amber-300 animate-radiant-radar pointer-events-none" />
                          )}
                          {/* Glowing Core Orb */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all ${
                              beaconEnergy.isRadiant
                                ? 'bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-200 text-amber-950 ring-2 ring-amber-300/80 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                                : 'bg-[#1877F2] text-white'
                            }`}
                          >
                            <Zap size={14} className={beaconEnergy.isRadiant ? 'fill-amber-950 text-amber-950 animate-bounce' : 'text-white'} />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-black text-[#1C1E21] tracking-tight">
                              RADIANT BEACON 空间能量反应堆
                            </span>
                            <span
                              className={`text-[8px] font-black px-1.5 py-0.2 rounded-full border shadow-2xs ${
                                beaconEnergy.isRadiant
                                  ? 'bg-amber-400 text-amber-950 border-amber-300 animate-pulse'
                                  : 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]/30'
                              }`}
                            >
                              {beaconEnergy.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono mt-0.5">
                            <span className="text-[#65676B] text-[9.5px]">50m 空间微围栏在位:</span>
                            <span className="text-[#1877F2] font-black">应到 200 人</span>
                            <span className="text-[#CED0D4]">/</span>
                            <span className="text-emerald-600 font-black">实到 {Math.min(200, Math.round(200 * (currentAttendancePct / 100)))} 人</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Charge Meter */}
                      <div className="text-right">
                        <span className="text-[8.5px] text-[#65676B] font-bold block">信标实时充能率 (Energy Flux)</span>
                        <div
                          className={`text-base font-black font-mono flex items-center justify-end gap-1 ${
                            beaconEnergy.isRadiant ? 'text-amber-600 animate-pulse' : 'text-[#1877F2]'
                          }`}
                        >
                          {beaconEnergy.isRadiant ? (
                            <Sparkles size={14} className="text-amber-500 animate-spin" />
                          ) : (
                            <Activity size={13} className="text-[#1877F2]" />
                          )}
                          <span>{currentAttendancePct}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Technical Energy Telemetry Matrix (4 micro-monitors) */}
                    <div className="relative z-10 grid grid-cols-4 gap-1.5 text-[8.5px]">
                      <div className={`p-1 rounded-xs border text-center ${beaconEnergy.isRadiant ? 'bg-amber-50/80 border-amber-300/80 text-amber-900' : 'bg-white border-[#E4E6EB] text-[#65676B]'}`}>
                        <div className="text-[7.5px] text-[#65676B]">能量充能状态</div>
                        <div className="font-mono font-black truncate">{beaconEnergy.isRadiant ? '✨ 满载超导' : '⚡ 蓄能中'}</div>
                      </div>
                      <div className={`p-1 rounded-xs border text-center ${beaconEnergy.isRadiant ? 'bg-amber-50/80 border-amber-300/80 text-amber-900' : 'bg-white border-[#E4E6EB] text-[#65676B]'}`}>
                        <div className="text-[7.5px] text-[#65676B]">空间辐射场强</div>
                        <div className="font-mono font-black truncate">{beaconSignalQuality === 'strong' ? '-52 dBm (极佳)' : beaconSignalQuality === 'unstable' ? '-84 dBm (波动)' : '-105 dBm'}</div>
                      </div>
                      <div className={`p-1 rounded-xs border text-center ${beaconEnergy.isRadiant ? 'bg-amber-50/80 border-amber-300/80 text-amber-900' : 'bg-white border-[#E4E6EB] text-[#65676B]'}`}>
                        <div className="text-[7.5px] text-[#65676B]">微围栏共振频</div>
                        <div className="font-mono font-black truncate">2.45 GHz 锁相</div>
                      </div>
                      <div className={`p-1 rounded-xs border text-center ${beaconEnergy.isRadiant ? 'bg-amber-50/80 border-amber-300/80 text-amber-900' : 'bg-white border-[#E4E6EB] text-[#65676B]'}`}>
                        <div className="text-[7.5px] text-[#65676B]">在位自动融合</div>
                        <div className="font-mono font-black truncate">{Math.min(200, Math.round(200 * (currentAttendancePct / 100)))}/200人</div>
                      </div>
                    </div>

                    {/* Progress Bar with High-Energy Traveling Laser Shimmer */}
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center justify-between text-[8.5px]">
                        <span className={`flex items-center gap-1 font-bold ${beaconEnergy.textColor}`}>
                          <Activity size={11} className={beaconEnergy.isRadiant ? 'text-amber-500 animate-pulse' : 'text-[#1877F2] animate-pulse'} />
                          <span>{beaconEnergy.chargeText}</span>
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[8px] text-[#65676B]">
                          <span className={currentAttendancePct >= 30 ? 'text-blue-600 font-bold' : ''}>30% 待机</span>
                          <span>•</span>
                          <span className={currentAttendancePct >= 60 ? 'text-blue-600 font-bold' : ''}>60% 常态</span>
                          <span>•</span>
                          <span className={currentAttendancePct >= 90 ? 'text-amber-600 font-black' : ''}>🌟 90% 璀璨阈值</span>
                        </div>
                      </div>

                      {/* Main Energy Bar */}
                      <div className="w-full h-3.5 bg-[#E4E6EB] rounded-full overflow-hidden p-0.5 bg-white border border-[#E4E6EB] relative shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-700 relative overflow-hidden ${beaconEnergy.barColor}`}
                          style={{ width: `${currentAttendancePct}%` }}
                        >
                          {/* Laser Traveling Shimmer */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-radiant-laser" />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Charge Simulation Controls Bar (一键快速充能与调测试控) */}
                    <div className="relative z-10 pt-1 border-t border-amber-200/50 flex items-center justify-between gap-1 flex-wrap text-[9px]">
                      <span className="text-[#65676B] font-bold flex items-center gap-1">
                        <Sliders size={10} className="text-[#1877F2]" />
                        <span>充能动效调测:</span>
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setBeaconChargeSimulationTier('25')}
                          className={`px-1.5 py-0.5 font-bold rounded-xs border transition-colors cursor-pointer ${
                            beaconChargeSimulationTier === '25'
                              ? 'bg-slate-700 text-white border-slate-800'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                          title="模拟低能待机状态 (25%)"
                        >
                          🪫 25% 待机
                        </button>
                        <button
                          type="button"
                          onClick={() => setBeaconChargeSimulationTier('55')}
                          className={`px-1.5 py-0.5 font-bold rounded-xs border transition-colors cursor-pointer ${
                            beaconChargeSimulationTier === '55'
                              ? 'bg-blue-600 text-white border-blue-700'
                              : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-300'
                          }`}
                          title="模拟常态充能状态 (55%)"
                        >
                          🔋 55% 常态
                        </button>
                        <button
                          type="button"
                          onClick={() => setBeaconChargeSimulationTier('75')}
                          className={`px-1.5 py-0.5 font-bold rounded-xs border transition-colors cursor-pointer ${
                            beaconChargeSimulationTier === '75'
                              ? 'bg-[#1877F2] text-white border-[#1877F2]'
                              : 'bg-white hover:bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]/40'
                          }`}
                          title="模拟高能跃迁状态 (75%)"
                        >
                          ⚡ 75% 跃迁
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBeaconChargeSimulationTier('95');
                            notify('🌟 空间信标充能突破 95%！考勤大厅全景已进入发光呼吸节奏渲染！');
                          }}
                          className={`px-2 py-0.5 font-black rounded-xs border transition-all cursor-pointer shadow-2xs ${
                            beaconChargeSimulationTier === '95'
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 border-amber-500 ring-2 ring-amber-300'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-400'
                          }`}
                          title="模拟璀璨充能 (95%)，触发全考勤大厅发光呼吸渲染"
                        >
                          ✨ 95% 璀璨 (触发全场呼吸)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBeaconChargeSimulationTier('100');
                            notify('🌟 空间信标满额 100% 超导充能！沉浸式教学场域达到极致！');
                          }}
                          className={`px-2 py-0.5 font-black rounded-xs border transition-all cursor-pointer shadow-2xs ${
                            beaconChargeSimulationTier === '100'
                              ? 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-amber-950 border-amber-500 ring-2 ring-amber-300 animate-pulse'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-400'
                          }`}
                          title="模拟 100% 满额超导爆发"
                        >
                          🌟 100% 满充
                        </button>
                        <button
                          type="button"
                          onClick={() => setBeaconChargeSimulationTier('auto')}
                          className={`px-1.5 py-0.5 font-bold rounded-xs border transition-colors cursor-pointer ${
                            beaconChargeSimulationTier === 'auto'
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300'
                          }`}
                          title="联动实际学生考勤状态自动计算"
                        >
                          🔄 联动实到
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* -------------------------------------------------------------
                     Beacon 50m Virtual Geofence Breathing Aperture Showcase
                     信标 50m 虚拟围栏呼吸式光圈互动视窗 (入围栏显著视觉反馈)
                     ------------------------------------------------------------- */}
                  <div
                    className={`relative z-10 bg-white dark:bg-zinc-900 border rounded-md p-3 shadow-2xs space-y-2.5 overflow-hidden transition-all duration-500 ${
                      isApertureSurgeActive
                        ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/20'
                        : beaconEnergy.isRadiant
                        ? 'border-amber-400/80 bg-amber-50/20'
                        : 'border-[#E4E6EB] dark:border-zinc-800'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#E4E6EB] dark:border-zinc-800 pb-2 flex-wrap gap-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            isApertureSurgeActive
                              ? 'bg-emerald-500 text-white animate-pulse'
                              : 'bg-[#E7F3FF] text-[#1877F2]'
                          }`}
                        >
                          <Radio size={13} className={isApertureSurgeActive ? 'animate-spin' : ''} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-black text-[#1C1E21] dark:text-white">
                              50m 空间信标 · 围栏平滑呼吸光圈
                            </span>
                            <span
                              className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full border ${
                                isApertureSurgeActive
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-400 animate-bounce'
                                  : inGeofenceCount > 0
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : 'bg-gray-100 text-gray-700 border-gray-300'
                              }`}
                            >
                              {isApertureSurgeActive
                                ? '⚡ 侦测到入围栏脉冲激增'
                                : inGeofenceCount > 0
                                ? `📡 围栏锁定 (${inGeofenceCount} 人在线)`
                                : '🟢 50m 平滑呼吸守候中'}
                            </span>
                          </div>
                          <span className="text-[8.5px] text-[#65676B] dark:text-zinc-400 block">
                            动态 CSS 弹性呼吸阻尼 · 学生进入 50m 辐射界即刻激发脉冲共振光波
                          </span>
                        </div>
                      </div>

                      {/* Signal & Coordinates Tag */}
                      <div className="text-right text-[8.5px] font-mono">
                        <span className="text-[#65676B] dark:text-zinc-400">场强锁相: </span>
                        <span className="text-emerald-600 font-bold">
                          {isApertureSurgeActive ? '-48 dBm (共振峰值)' : '-62 dBm (常态)'}
                        </span>
                      </div>
                    </div>

                    {/* Central 50m Circular Breathing Aperture Stage */}
                    <div className="relative w-full h-44 bg-gradient-to-b from-[#F0F4F8] to-[#E9EEF5] dark:from-zinc-950 dark:to-zinc-900 rounded-md border border-[#E4E6EB] dark:border-zinc-800 overflow-hidden flex items-center justify-center select-none">
                      {/* Background Micro-grid */}
                      <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                          backgroundImage: 'radial-gradient(circle, #1877F2 1px, transparent 1px)',
                          backgroundSize: '16px 16px',
                        }}
                      />

                      {/* Outer 50m Geofence Boundary (The Breathing Aperture Ring) */}
                      <div
                        className={`absolute w-36 h-36 rounded-full border-2 pointer-events-none flex items-center justify-center ${
                          isApertureSurgeActive
                            ? 'border-emerald-500 beacon-fence-entry-active'
                            : 'border-[#1877F2] beacon-fence-aperture-breathing'
                        }`}
                        style={{
                          transition:
                            'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), border-color 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
                        }}
                        title="50m 虚拟信标空间围栏"
                      >
                        {/* 50m Label Tag */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-800 border border-[#1877F2]/40 text-[#1877F2] dark:text-blue-400 text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                          50m 围栏边界
                        </div>
                      </div>

                      {/* Intermediate 25m Safe Field Circle */}
                      <div className="absolute w-24 h-24 rounded-full border border-dashed border-[#1877F2]/30 pointer-events-none flex items-center justify-center">
                        <span className="absolute -top-2 text-[7px] text-[#1877F2]/60 font-mono">
                          25m 强场区
                        </span>
                      </div>

                      {/* Inner 10m Core Field Circle */}
                      <div className="absolute w-12 h-12 rounded-full border border-dotted border-blue-400/40 pointer-events-none" />

                      {/* Rotating Radar Scanner Sweep */}
                      <div className="absolute w-36 h-36 rounded-full pointer-events-none beacon-radar-sweep overflow-hidden">
                        <div className="w-1/2 h-1/2 bg-gradient-to-br from-transparent to-[#1877F2]/25 origin-bottom-right" />
                      </div>

                      {/* Entry Shockwave Ripples (When student enters geofence) */}
                      {isApertureSurgeActive && (
                        <>
                          <div className="absolute w-28 h-28 rounded-full border-2 border-emerald-400 beacon-aperture-wave pointer-events-none" />
                          <div
                            className="absolute w-28 h-28 rounded-full border border-cyan-400 beacon-aperture-wave pointer-events-none"
                            style={{ animationDelay: '0.6s' }}
                          />
                        </>
                      )}

                      {/* Center Beacon Tower Core */}
                      <div
                        className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                          isApertureSurgeActive
                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white ring-4 ring-emerald-400/50 scale-110 shadow-emerald-500/50'
                            : beaconEnergy.isRadiant
                            ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 ring-2 ring-amber-300 animate-pulse'
                            : 'bg-[#1877F2] text-white'
                        }`}
                        title="50m 空间信标中心发射核心"
                        onClick={() => {
                          setIsApertureSurgeActive(true);
                          soundEffects.playAlertSound();
                          haptics.trigger('heavy');
                          setTimeout(() => setIsApertureSurgeActive(false), 4000);
                          notify('🗼 信标核心已主动激发 50m 高频脉冲声呐！光圈共振放大');
                        }}
                      >
                        <Zap size={14} className={isApertureSurgeActive ? 'animate-bounce' : ''} />
                      </div>

                      {/* Orbiting / In-Geofence Students Visualization Dots */}
                      {students
                        .filter((s) => s.status === 'in_geofence')
                        .slice(0, 5)
                        .map((s, idx) => {
                          // Calculate angular position around center
                          const angle = (idx * (360 / Math.min(5, inGeofenceCount))) * (Math.PI / 180);
                          const radius = 46; // Inside the 50m aperture
                          const x = Math.cos(angle) * radius;
                          const y = Math.sin(angle) * radius;
                          return (
                            <div
                              key={`geo-stu-${s.id}`}
                              className="absolute z-10 flex flex-col items-center pointer-events-auto cursor-pointer animate-in zoom-in-75 duration-300"
                              style={{
                                transform: `translate(${x}px, ${y}px)`,
                              }}
                              onClick={() => {
                                notify(`📍 学员【${s.name}】已在 50m 围栏内（距信标 ${s.geofenceDistanceMeters || 12}m），剩余倒计时 ${s.timerMinutesRemaining || 30} 分钟`);
                              }}
                              title={`学员 ${s.name} 已入围栏`}
                            >
                              <div className="relative">
                                <img
                                  src={s.avatar}
                                  alt={s.name}
                                  className="w-5 h-5 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                                />
                                <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              </div>
                              <span className="text-[7px] font-bold text-emerald-800 dark:text-emerald-300 bg-white/90 dark:bg-zinc-800 px-1 rounded shadow-2xs whitespace-nowrap">
                                {s.name} {s.geofenceDistanceMeters || 12}m
                              </span>
                            </div>
                          );
                        })}
                    </div>

                    {/* Entry Detection Live Banner */}
                    {recentGeofenceDetection && (
                      <div className="flex items-center justify-between p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-[9.5px] animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span className="font-bold truncate">
                            入圈侦测: 【{recentGeofenceDetection.studentName}】距信标{' '}
                            {recentGeofenceDetection.distance}m
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-emerald-700 dark:text-emerald-400 shrink-0 bg-emerald-200/50 px-1 rounded">
                          光圈共振激增 ✓
                        </span>
                      </div>
                    )}

                    {/* Quick Simulation Trigger Actions for Geofence Aperture */}
                    <div className="flex items-center justify-between gap-1 flex-wrap pt-0.5 text-[9px]">
                      <span className="text-[#65676B] dark:text-zinc-400 font-bold flex items-center gap-1">
                        <Sliders size={10} className="text-[#1877F2]" />
                        <span>光圈动效调测:</span>
                      </span>

                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            const candidate = students.find((s) => s.status === 'absent_gray') || students[0];
                            if (candidate) {
                              handleSimulateEnterGeofence(candidate.id);
                            } else {
                              notify('当前暂无可模拟学生');
                            }
                          }}
                          className="px-2 py-0.5 font-bold rounded-xs bg-[#E7F3FF] hover:bg-[#DBECFE] text-[#1877F2] border border-[#1877F2]/40 transition-colors cursor-pointer shadow-2xs"
                          title="模拟单个学生进入 50m 围栏"
                        >
                          🎯 模拟学生入圈 (触发脉冲共振)
                        </button>

                        <button
                          type="button"
                          onClick={handleSimulateBatchEnter}
                          className="px-2 py-0.5 font-bold rounded-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors cursor-pointer shadow-2xs"
                          title="模拟前 6 名学生批量进入 50m 围栏"
                        >
                          👥 批量 6 人入圈
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsApertureSurgeActive(true);
                            soundEffects.playAlertSound();
                            haptics.trigger('heavy');
                            setTimeout(() => setIsApertureSurgeActive(false), 4500);
                            notify('✨ 已手动激发 50m 围栏高频呼吸脉冲！');
                          }}
                          className="px-2 py-0.5 font-bold rounded-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 transition-colors cursor-pointer shadow-2xs"
                          title="主动触发呼吸光圈剧烈脉冲共振"
                        >
                          ⚡ 激发光圈脉冲
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-between gap-1 p-2 rounded-md text-[9.5px] transition-all ${
                      beaconEnergy.isRadiant ? 'bg-amber-50/40 border border-amber-300/80 shadow-2xs' : 'bg-[#FAFBFD] border border-[#E4E6EB]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-[#1C1E21]">
                        {isOnline ? (
                          <Wifi size={12} className="text-emerald-600" />
                        ) : (
                          <WifiOff size={12} className="text-amber-600" />
                        )}
                        <span>网络环境: </span>
                        <strong className={isOnline ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                          {isOnline ? '校园网在线' : '离线断网 (安全沙盒缓存)'}
                        </strong>
                      </span>

                      <span className="text-[#CED0D4]">|</span>

                      <span className="flex items-center gap-1">
                        <Radio size={11} className={beaconSignalQuality === 'strong' ? (beaconEnergy.isRadiant ? 'text-amber-600' : 'text-emerald-600') : beaconSignalQuality === 'unstable' ? 'text-amber-500 animate-pulse' : 'text-rose-500'} />
                        <span className="text-[#65676B]">信标信号:</span>
                        <strong className={beaconSignalQuality === 'strong' ? (beaconEnergy.isRadiant ? 'text-amber-700 font-bold' : 'text-emerald-600') : beaconSignalQuality === 'unstable' ? 'text-amber-600' : 'text-rose-600'}>
                          {beaconSignalQuality === 'strong' ? '强 (-52dBm)' : beaconSignalQuality === 'unstable' ? '微弱波动 (-88dBm)' : '盲区丢失 (-105dBm)'}
                        </strong>
                      </span>

                      {offlineRecords.filter((r) => r.syncStatus === 'pending').length > 0 && (
                        <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 font-bold text-[8.5px] rounded-2xs border border-amber-300 flex items-center gap-1">
                          <Database size={9} />
                          <span>待同步 {offlineRecords.filter((r) => r.syncStatus === 'pending').length} 条</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowOfflineCacheModal(true)}
                        className="px-2 py-0.5 bg-white hover:bg-gray-100 text-[#1877F2] border border-[#CED0D4] text-[9px] font-bold rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Database size={10} />
                        <span>缓存队列 ({offlineRecords.length})</span>
                      </button>
                      <button
                        type="button"
                        disabled={isAutoSyncing || offlineRecords.filter((r) => r.syncStatus === 'pending').length === 0}
                        onClick={triggerAutoSyncToServer}
                        className={`px-2 py-0.5 text-white text-[9px] font-bold rounded-xs flex items-center gap-1 cursor-pointer transition-all ${
                          offlineRecords.filter((r) => r.syncStatus === 'pending').length > 0
                            ? 'bg-[#1877F2] hover:bg-[#166FE5] shadow-2xs'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <RefreshCw size={10} className={isAutoSyncing ? 'animate-spin' : ''} />
                        <span>{isAutoSyncing ? '同步中...' : '同步至服务器'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Attendance Operations Console Toolbar */}
                  <div className="flex items-center justify-between gap-1 pt-1 flex-wrap text-[10px]">
                    <span className="text-[#65676B] font-bold text-[9px] flex items-center gap-1">
                      <Activity size={10} className="text-[#1877F2]" />
                      <span>现场联动控制台:</span>
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsOnline((prev) => !prev)}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded-xs border cursor-pointer ${
                          isOnline
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                        }`}
                        title="切换网络断网/联网状态，检验本地缓存防误判机制"
                      >
                        {isOnline ? '模拟切为断网' : '模拟恢复联网'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBeaconSignalQuality((prev) =>
                            prev === 'strong' ? 'unstable' : prev === 'unstable' ? 'offline' : 'strong'
                          );
                        }}
                        className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-[#1C1E21] text-[9px] font-bold rounded-xs border border-[#CED0D4] cursor-pointer"
                        title="切换信标信号强度"
                      >
                        信号: {beaconSignalQuality === 'strong' ? '稳定' : beaconSignalQuality === 'unstable' ? '微弱' : '盲区'}
                      </button>

                      <button
                        onClick={() => {
                          if (students.length > 0) {
                            handleSimulateEnterGeofence(students[0].id);
                          }
                        }}
                        className="px-1.5 py-0.5 bg-[#E7F3FF] hover:bg-[#DBECFE] text-[#1877F2] text-[9px] font-bold rounded-xs border border-[#1877F2]/30 cursor-pointer"
                      >
                        学生入 50m 围栏
                      </button>
                      <button
                        onClick={() => {
                          const inGeo = students.find((s) => s.status === 'in_geofence');
                          if (inGeo) handleSimulateCheckInComplete(inGeo.id);
                          else handleSimulateBatchCheckIn();
                        }}
                        className="px-1.5 py-0.5 bg-[#42B72A] hover:bg-emerald-600 text-white text-[9px] font-bold rounded-xs cursor-pointer"
                      >
                        满30分钟自动融合
                      </button>
                    </div>
                  </div>
                </div>

                {/* 逃课 / 未到学生名册 (支持多选与批量人工核查/补签) */}
                <div
                  className={`bg-white border p-3 rounded-md shadow-2xs space-y-2.5 transition-all duration-700 ${
                    beaconEnergy.isRadiant
                      ? 'radiant-ui-element-glow border-amber-400/80'
                      : 'border-[#E4E6EB]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2 flex-wrap gap-1.5">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="text-[#F23B6A]" />
                      <span className="text-xs font-bold text-[#050505]">未到课学生名册 (按班级分组)</span>
                      <span className="text-[9.5px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        缺勤未到 {students.filter((s) => s.status === 'absent_gray').length} 人
                      </span>
                    </div>

                    {/* Multi-select Header Toolbar */}
                    <div className="flex items-center gap-1.5">
                      {selectedStudentIds.length > 0 && (
                        <span className="text-[9px] font-bold text-[#1877F2] bg-[#E7F3FF] px-2 py-0.5 rounded-xs border border-[#1877F2]/30">
                          已勾选 {selectedStudentIds.length} 人
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSelectAllStudents(students.filter((s) => s.status === 'absent_gray'))}
                        className="text-[9px] px-2 py-0.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] font-bold rounded-xs border border-[#CED0D4] cursor-pointer transition-colors"
                      >
                        {students.filter((s) => s.status === 'absent_gray').every((s) => selectedStudentIds.includes(s.id))
                          ? '取消全选未到'
                          : '全选未到学生'}
                      </button>
                      {selectedStudentIds.length > 0 && (
                        <button
                          type="button"
                          onClick={openBatchAuditModal}
                          className="text-[9px] px-2.5 py-0.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer shadow-2xs flex items-center gap-1 transition-colors"
                        >
                          <Edit3 size={10} />
                          <span>批量人工核查/补签 ({selectedStudentIds.length})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sticky / Active Batch Quick Actions Bar */}
                  {selectedStudentIds.length > 0 && (
                    <div className="p-2.5 bg-[#F0F7FF] border-2 border-[#1877F2] rounded-md shadow-sm flex items-center justify-between gap-2 flex-wrap animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {selectedStudentIds.length}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#1C1E21]">已选中 {selectedStudentIds.length} 名学生</span>
                          <span className="text-[9px] text-[#65676B] block">可快速执行统一考勤变更或进入详细人工核查模式</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickBatchStatus(
                              'checked_in',
                              '人工补录',
                              '讲师现场批量核验实到并补录出勤，已扣减缺勤'
                            )
                          }
                          className="px-2 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-300 font-bold text-[9.5px] rounded-xs cursor-pointer shadow-2xs flex items-center gap-1"
                          title="批量标记为现场补录实到"
                        >
                          <Check size={11} className="stroke-[3]" />
                          <span>批量补录实到</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickBatchStatus(
                              'leave_approved',
                              '请假销假',
                              '已统一核验病假/事假凭证原件，材料真实合规，准予销假'
                            )
                          }
                          className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[9.5px] rounded-xs cursor-pointer shadow-2xs flex items-center gap-1"
                          title="批量准予请假并自动销假"
                        >
                          <FileText size={11} />
                          <span>批量准假销假</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickBatchStatus(
                              'official_leave',
                              '竞赛公假',
                              '学院竞赛与实践教学中心出具公假公函，已批准公假'
                            )
                          }
                          className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-300 font-bold text-[9.5px] rounded-xs cursor-pointer shadow-2xs flex items-center gap-1"
                          title="批量标记为竞赛/官方活动公假"
                        >
                          <Award size={11} />
                          <span>批量竞赛公假</span>
                        </button>
                        <button
                          type="button"
                          onClick={openBatchAuditModal}
                          className="px-2.5 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-[9.5px] rounded-xs cursor-pointer shadow-2xs flex items-center gap-1"
                        >
                          <Edit3 size={11} />
                          <span>高级统一设置...</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="px-2 py-1 bg-white hover:bg-gray-100 text-[#65676B] border border-[#CED0D4] font-bold text-[9.5px] rounded-xs cursor-pointer"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Grouped by Class with Thin Line Dividers */}
                  <div className="space-y-3 pt-0.5">
                    {Object.entries(
                      students
                        .filter((s: StudentItem) => s.status === 'absent_gray')
                        .reduce((acc: Record<string, StudentItem[]>, stu: StudentItem) => {
                          const cls = stu.className || 'CS101 计科一班';
                          if (!acc[cls]) acc[cls] = [];
                          acc[cls].push(stu);
                          return acc;
                        }, {} as Record<string, StudentItem[]>)
                    ).map(([classNameGroup, classStudents]: [string, StudentItem[]], groupIdx: number) => (
                      <div key={classNameGroup} className={groupIdx > 0 ? 'border-t border-[#E4E6EB] pt-3 mt-3' : ''}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
                            <span>{classNameGroup}</span>
                            <span className="text-[10px] text-[#65676B] font-normal">({classStudents.length}人未到)</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectAllStudents(classStudents)}
                              className="text-[9px] px-1.5 py-0.5 bg-gray-50 hover:bg-gray-100 text-[#1C1E21] font-bold rounded-md border border-[#CED0D4] cursor-pointer transition-colors"
                            >
                              {classStudents.every((s) => selectedStudentIds.includes(s.id)) ? '取消本班勾选' : '勾选本班'}
                            </button>
                            <button
                              type="button"
                              onClick={() => notify(`已向 ${classNameGroup} 辅导员及未到学生发送督学提醒`)}
                              className="text-[9px] px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-md border border-rose-200 cursor-pointer transition-colors"
                            >
                              本班一键催到
                            </button>
                          </div>
                        </div>

                        {/* 学生名单卡片网格：2列整齐布局 */}
                        <div className="grid grid-cols-2 gap-2">
                          {classStudents.map((student) => {
                            const isSelected = selectedStudentIds.includes(student.id);
                            const bubbleConfig = getStatusBubbleConfig(student);

                            return (
                              <div
                                key={student.id}
                                className={`bg-white border rounded-md p-2 transition-all shadow-2xs space-y-1.5 text-left relative overflow-hidden ${
                                  isSelected
                                    ? 'border-[#1877F2] ring-1 ring-[#1877F2] bg-[#F7FAFF]'
                                    : beaconEnergy.isRadiant
                                    ? 'border-amber-300/60 hover:border-amber-500'
                                    : 'border-[#E4E6EB] hover:border-[#1877F2]'
                                }`}
                              >
                                {/* 第一行：勾选框 + 头像 + 姓名/学号 + 状态标签 */}
                                <div className="flex items-start justify-between gap-1">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleSelectStudent(student.id)}
                                      className="w-3.5 h-3.5 rounded-xs border-[#CED0D4] text-[#1877F2] focus:ring-[#1877F2] cursor-pointer shrink-0 mt-0.5"
                                      title="勾选进行批量人工核查/补签"
                                    />

                                    <img
                                      src={student.avatar}
                                      alt={student.name}
                                      className="w-7 h-7 rounded-full object-cover border border-[#E4E6EB] shrink-0"
                                    />

                                    <div className="min-w-0 cursor-pointer" onClick={() => toggleSelectStudent(student.id)}>
                                      <div className="text-[11.5px] font-bold text-[#050505] truncate leading-tight">{student.name}</div>
                                      <div className="text-[8.5px] font-mono text-[#65676B] truncate leading-tight">
                                        {student.studentId || '2024CS08'}
                                      </div>
                                    </div>
                                  </div>

                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs border flex items-center gap-0.5 shrink-0 whitespace-nowrap ${
                                      bubbleConfig.bgColor
                                    } ${bubbleConfig.textColor} ${bubbleConfig.borderColor}`}
                                  >
                                    {bubbleConfig.icon}
                                    <span>{bubbleConfig.text}</span>
                                  </span>
                                </div>

                                {/* 第二行：信标距离与缺席统计 */}
                                <div className="bg-[#F7F8FA] border border-[#E4E6EB] rounded-xs px-1.5 py-1 flex items-center justify-between text-[9px]">
                                  <span className="flex items-center gap-1 text-[#65676B] truncate">
                                    <Compass size={10} className="text-[#1877F2] shrink-0" />
                                    <span>距信标 <strong className="font-mono font-bold text-[#1877F2]">{student.geofenceDistanceMeters >= 1000 ? `${(student.geofenceDistanceMeters / 1000).toFixed(1)}k` : `${student.geofenceDistanceMeters}m`}</strong></span>
                                  </span>
                                  <span className="flex items-center gap-0.5 text-[#65676B] shrink-0 pl-1">
                                    <AlertCircle size={10} className="text-rose-500 shrink-0" />
                                    <span>缺席 <strong className="text-rose-600 font-bold">{student.absentCount || 0}</strong>次</span>
                                  </span>
                                </div>

                                {/* 第三行：操作按钮组 */}
                                <div className="pt-1 border-t border-[#F0F2F5] space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSimulateEnterGeofence(student.id)}
                                    className="w-full py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white border border-[#1877F2] text-[9.5px] font-bold rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                                    title="模拟学生走入 50 米信标围栏"
                                  >
                                    <Radio size={11} />
                                    <span>入圈模拟</span>
                                  </button>

                                  <div className="grid grid-cols-2 gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSimulateOfflineCheckIn(student.id)}
                                      className="py-1 px-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-bold rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-0.5 shadow-2xs"
                                      title="模拟弱网/信标离线打卡并存入本地缓存"
                                    >
                                      <Database size={10} />
                                      <span>离线打卡</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openManualAuditModal(student)}
                                      className="py-1 px-1 bg-white hover:bg-gray-100 text-[#1877F2] border border-[#CED0D4] text-[9px] font-bold rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-0.5 shadow-2xs"
                                      title="单独核查修改状态"
                                    >
                                      <Edit3 size={10} />
                                      <span>修改</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 已准假报备学生名单 (也支持勾选批量修改与悬停查看审核批注) */}
              {students.some((s) => s.status === 'leave_approved' || s.status === 'official_leave' || (s.status === 'checked_in' && s.leaveNote)) && (
                <div className="bg-white border border-[#E4E6EB] p-3 rounded-md shadow-2xs space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2 flex-wrap gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <h4 className="text-xs font-bold text-[#050505] flex items-center gap-1.5">
                        <span>准假报备 / 补录到课学生名单</span>
                        <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-xs border border-emerald-200 font-bold">
                          已同步至考勤看板
                        </span>
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                        共 {students.filter((s) => s.status === 'leave_approved' || s.status === 'official_leave' || (s.status === 'checked_in' && s.leaveNote)).length} 人
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {students
                      .filter((s) => s.status === 'leave_approved' || s.status === 'official_leave' || (s.status === 'checked_in' && s.leaveNote))
                      .map((stu) => {
                        const isSelected = selectedStudentIds.includes(stu.id);
                        const bubbleConfig = getStatusBubbleConfig(stu);

                        return (
                          <div
                            key={`leave-stu-${stu.id}`}
                            className={`p-2 bg-white border rounded-md shadow-2xs transition-colors relative space-y-1.5 text-left overflow-hidden ${
                              isSelected ? 'border-[#1877F2] ring-1 ring-[#1877F2] bg-[#F7FAFF]' : 'border-[#E4E6EB] hover:border-emerald-500'
                            }`}
                          >
                            {/* 第一行：勾选框 + 头像 + 姓名/学号(上下堆叠) + 状态标签 */}
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {/* Selection checkbox */}
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectStudent(stu.id)}
                                  className="w-3.5 h-3.5 rounded-xs border-[#CED0D4] text-[#1877F2] focus:ring-[#1877F2] cursor-pointer shrink-0 mt-0.5"
                                  title="勾选进行批量考勤状态修改"
                                />

                                {/* Avatar */}
                                <img
                                  src={stu.avatar}
                                  alt={stu.name}
                                  className="w-7 h-7 rounded-full object-cover border border-[#E4E6EB] shrink-0"
                                />

                                <div className="min-w-0">
                                  <div className="text-[11.5px] font-bold text-[#050505] truncate leading-tight">{stu.name}</div>
                                  <div className="text-[8.5px] font-mono text-[#65676B] truncate leading-tight">
                                    {stu.studentId || '2024CS08'}
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs border flex items-center gap-0.5 shrink-0 whitespace-nowrap ${
                                  bubbleConfig.bgColor
                                } ${bubbleConfig.textColor} ${bubbleConfig.borderColor}`}
                              >
                                {bubbleConfig.icon}
                                <span>{bubbleConfig.text}</span>
                              </span>
                            </div>

                            {/* 第二行：凭据文字 */}
                            <div className="bg-[#F7F8FA] border border-[#E4E6EB] rounded-xs px-1.5 py-1 text-[9px] text-[#65676B] flex items-center gap-1 truncate">
                              <FileText size={10} className="text-[#65676B] shrink-0" />
                              <span className="truncate">{stu.leaveNote?.hospitalOrOrg || '校医院'} · {stu.leaveNote?.reason || '已审核'}</span>
                            </div>

                            {/* 第三行：操作按钮，整行通栏 */}
                            <div className="pt-1 border-t border-[#F0F2F5]">
                              <button
                                type="button"
                                onClick={() => openManualAuditModal(stu)}
                                className="w-full py-1 bg-white hover:bg-gray-100 text-[#1877F2] border border-[#CED0D4] text-[9.5px] font-bold rounded-xs cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                                title="重新核查状态"
                              >
                                <Edit3 size={10} />
                                <span>重新核查</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* 已签到的学生名册模块 (全员 180 人头像聚合展示加大卡片) */}
              <div className="bg-white border border-[#E4E6EB] p-3.5 rounded-xs shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check size={13} className="stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold text-[#1C1E21]">
                      已签到学生名册 · 全员 180 人无感打卡聚合
                    </span>
                  </div>
                  <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-2xs border border-emerald-200">
                    实到 180 人 / 应到 200 人 (90%)
                  </span>
                </div>

                {/* 班级分类出勤标签 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px]">
                  <div className="bg-[#FAFBFD] p-1.5 rounded-xs border border-[#E4E6EB] flex items-center justify-between">
                    <span className="text-[#65676B]">CS101 计科一班</span>
                    <span className="font-bold text-emerald-700 font-mono">45/45 人</span>
                  </div>
                  <div className="bg-[#FAFBFD] p-1.5 rounded-xs border border-[#E4E6EB] flex items-center justify-between">
                    <span className="text-[#65676B]">CS102 计科二班</span>
                    <span className="font-bold text-emerald-700 font-mono">45/45 人</span>
                  </div>
                  <div className="bg-[#FAFBFD] p-1.5 rounded-xs border border-[#E4E6EB] flex items-center justify-between">
                    <span className="text-[#65676B]">CS103 计科三班</span>
                    <span className="font-bold text-emerald-700 font-mono">45/45 人</span>
                  </div>
                  <div className="bg-[#FAFBFD] p-1.5 rounded-xs border border-[#E4E6EB] flex items-center justify-between">
                    <span className="text-[#65676B]">CS104 计科四班</span>
                    <span className="font-bold text-emerald-700 font-mono">45/45 人</span>
                  </div>
                </div>

                {/* 180 人头像完整堆叠全景展示区 */}
                <div className="bg-[#F6FDF9] p-3 border border-emerald-200/90 rounded-xs space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs font-mono">
                      180
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10.5px] font-bold text-[#1C1E21] flex items-center gap-1">
                        <span>全员已在位无感融合打卡完成</span>
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded-2xs font-semibold">
                          180人全景已展开
                        </span>
                      </div>
                      <div className="text-[8.5px] text-[#65676B]">
                        头像边缘紧密重叠 · 实时信标 50m 自动聚合已生效
                      </div>
                    </div>
                  </div>

                  {/* 全部 180 个头像以高密度多行层叠堆叠完整展现 */}
                  <div className="p-2 bg-white border border-emerald-100 rounded-xs">
                    <div className="flex flex-wrap items-center -space-x-2 space-y-1.5 pt-1 pl-1">
                      {Array.from({ length: 180 }, (_, i) => {
                        const avatarList = [
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                          'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
                          'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
                          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
                          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
                          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
                          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
                          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
                          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
                        ];
                        const avatarUrl = avatarList[i % avatarList.length];
                        return (
                          <div
                            key={`all-chk-${i + 1}`}
                            title={`已打卡到课学员 #${i + 1}`}
                            className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full ring-2 ring-white overflow-hidden bg-gray-100 shadow-2xs shrink-0 transition-transform hover:scale-125 hover:z-20 cursor-pointer relative"
                            onClick={() => notify(`学员 #${i + 1} 50m 无感签到数据正常 (在位时长: 35分)`)}
                          >
                            <img src={avatarUrl} alt={`Student ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsAttendanceHallExpanded(true)}
              className="p-3 bg-white border border-[#E4E6EB] hover:border-[#1877F2] rounded-xs shadow-2xs flex items-center justify-between text-xs cursor-pointer text-[#65676B] transition-all hover:bg-[#FAFBFD]"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-[#1C1E21] text-[11px]">考勤大厅已收起</span>
                <span className="text-[10px] text-[#65676B]">· 200人实时打卡大厅已折叠，点击展开查看在位状态</span>
              </div>
              <span className="text-[10px] text-[#1877F2] font-bold flex items-center gap-0.5 bg-[#E7F3FF] px-2 py-0.5 rounded-2xs border border-[#1877F2]/20">
                <span>展开大厅</span>
                <ChevronDown size={12} />
              </span>
            </div>
          )}
        </div>
      )}

            {/* 子视图 2: 考勤看板与统计 (将考情看板放入 电子考情中) */}
            {(activeTab === 'analytics' || attendanceSubTab === 'analytics') && (
              <AttendanceAnalyticsDashboard
                students={students}
                notify={notify}
                openManualAuditModal={openManualAuditModal}
                getStatusBubbleConfig={getStatusBubbleConfig}
                getStudentTrendData={getStudentTrendData}
              />
            )}
          </div>
        )}

        {/* TAB 2: 我的课程 (含 授课课程管理 与 课程课表与排期日历) */}
        {(activeTab === 'mycourses' || activeTab === 'create' || activeTab === 'badges') && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* 课程子模块切换栏 (Facebook 直角线框风格) */}
            <div className="bg-white p-1 border border-[#E4E6EB] rounded-xs shadow-2xs flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setCourseSubTab('courses');
                  if (activeTab === 'badges') setActiveTab('mycourses');
                }}
                className={`flex-1 py-1.5 px-2 rounded-2xs text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  (activeTab !== 'badges' && courseSubTab === 'courses')
                    ? 'bg-[#1877F2] text-white shadow-2xs'
                    : 'bg-[#F0F2F5] text-[#65676B] hover:text-[#1877F2] hover:bg-[#E7F3FF]'
                }`}
              >
                <BookOpen size={14} />
                <span>授课课程管理</span>
                <span className={`text-[8.5px] px-1 py-0.2 rounded-2xs ${
                  (activeTab !== 'badges' && courseSubTab === 'courses') ? 'bg-white/20 text-white' : 'bg-white text-[#1877F2] border border-[#CED0D4]'
                }`}>
                  {courses.length}门课
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCourseSubTab('schedule');
                }}
                className={`flex-1 py-1.5 px-2 rounded-2xs text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  (activeTab === 'badges' || courseSubTab === 'schedule')
                    ? 'bg-[#1877F2] text-white shadow-2xs'
                    : 'bg-[#F0F2F5] text-[#65676B] hover:text-[#1877F2] hover:bg-[#E7F3FF]'
                }`}
              >
                <CalendarDays size={14} />
                <span>课程课表与日历</span>
                <span className={`text-[8.5px] px-1 py-0.2 rounded-2xs ${
                  (activeTab === 'badges' || courseSubTab === 'schedule') ? 'bg-white/20 text-white' : 'bg-white text-[#1877F2] border border-[#CED0D4]'
                }`}>
                  周历/月历
                </span>
              </button>
            </div>

            {/* 子视图 1: 授课课程管理 */}
            {(activeTab !== 'badges' && courseSubTab === 'courses') && (
              <div className="space-y-3">
            {/* 1. 教师个人名片与教学档案 */}
            <div className="bg-white border border-[#E4E6EB] p-3.5 rounded-xs shadow-2xs space-y-3">
              <div className="flex items-start justify-between border-b border-[#E4E6EB] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                      alt={identityName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#1877F2] shadow-2xs"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#42B72A] border-2 border-white rounded-full" title="在线" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-black text-[#1C1E21]">{identityName} {teacherRankTag}</h3>
                      <span className="text-[9px] text-[#1877F2] bg-[#E7F3FF] px-1.5 py-0.2 rounded-2xs border border-[#1877F2]/30 font-bold">
                        {selectedIdentityType === 'teacher' ? `教师 · ${teacherRankTag}` : `辅导员 · ${counselorRankTag}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#65676B] font-medium">{identityDept}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => setIsIdentityModalOpen(true)}
                    className="text-[9.5px] text-[#1877F2] bg-[#E7F3FF] hover:bg-[#D8EBFF] border border-[#1877F2]/30 px-2 py-0.5 rounded-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Edit3 size={10} />
                    <span>更换身份与标签</span>
                  </button>
                  <span className="text-[8.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-2xs font-bold">
                    已认证入库
                  </span>
                </div>
              </div>

              {/* 教师教工基本信息网格 */}
              <div className="grid grid-cols-2 gap-2 bg-[#FAFBFD] p-2.5 border border-[#E4E6EB] rounded-xs text-[10px]">
                <div className="flex items-center gap-1.5 text-[#65676B]">
                  <span className="font-bold text-[#1C1E21]">教职工号:</span>
                  <span className="font-mono text-[#1877F2] font-bold">{identityStaffId}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#65676B]">
                  <span className="font-bold text-[#1C1E21]">教研办公室:</span>
                  <span className="font-bold text-[#1C1E21]">{identityOffice}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#65676B]">
                  <span className="font-bold text-[#1C1E21]">教工邮箱:</span>
                  <span className="text-[#1877F2] truncate font-mono">zhanglihua@campus.edu.cn</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#65676B]">
                  <span className="font-bold text-[#1C1E21]">办公内线:</span>
                  <span className="font-mono text-[#1C1E21]">021-8834920</span>
                </div>
              </div>

              {/* 教学绩效与光点看板行 */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#E7F3FF]/40 border border-[#1877F2]/20 p-2 rounded-xs">
                  <div className="text-[9px] text-[#65676B] flex items-center justify-center gap-1 font-bold">
                    <Zap size={11} className="text-[#1877F2]" />
                    <span>教学光点</span>
                  </div>
                  <div className="text-sm font-black text-[#1877F2] mt-0.5">{lightPoints} 光点</div>
                  <span className="text-[8px] text-[#65676B]">可兑换信标特权</span>
                </div>

                <div className="bg-[#FAFBFD] border border-[#E4E6EB] p-2 rounded-xs">
                  <div className="text-[9px] text-[#65676B] flex items-center justify-center gap-1 font-bold">
                    <TrendingUp size={11} className="text-emerald-600" />
                    <span>到课达标率</span>
                  </div>
                  <div className="text-sm font-black text-emerald-600 mt-0.5">95.8%</div>
                  <span className="text-[8px] text-[#65676B]">累计 188/196 人次</span>
                </div>

                <div className="bg-[#FAFBFD] border border-[#E4E6EB] p-2 rounded-xs">
                  <div className="text-[9px] text-[#65676B] flex items-center justify-center gap-1 font-bold">
                    <BookOpen size={11} className="text-[#1C1E21]" />
                    <span>主讲课程</span>
                  </div>
                  <div className="text-sm font-black text-[#1C1E21] mt-0.5">{courses.length} 门</div>
                  <span className="text-[8px] text-[#65676B]">本学期在授</span>
                </div>
              </div>

              {/* 个人主页快捷操作按钮 */}
              <div className="flex gap-2 pt-1 border-t border-[#E4E6EB]">
                <button
                  type="button"
                  onClick={() => setIsCreateCourseModalOpen(true)}
                  className="flex-1 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer shadow-2xs text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus size={13} className="stroke-[3]" />
                  <span>新建与添加课程</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(true)}
                  className="px-3 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] font-bold rounded-xs border border-[#E4E6EB] cursor-pointer text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Users size={13} className="text-[#1877F2]" />
                  <span>添加班级名册</span>
                </button>
              </div>
            </div>

            {/* 2. 所授课程模块 (COURSES TAUGHT) */}
            <div className="bg-white border border-[#E4E6EB] p-3 rounded-xs shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-[#1877F2] text-white rounded-2xs shadow-2xs">
                    <BookOpen size={13} />
                  </div>
                  <h4 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                    <span>所授课程</span>
                    <span className="text-[9px] text-[#1877F2] bg-[#E7F3FF] px-1.5 py-0.2 rounded-2xs border border-[#1877F2]/20 font-bold">
                      共 {courses.length} 门课程
                    </span>
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateCourseModalOpen(true)}
                  className="text-[10px] text-[#1877F2] font-bold hover:underline flex items-center gap-0.5 cursor-pointer bg-[#E7F3FF] px-2 py-0.5 rounded-2xs border border-[#1877F2]/20"
                >
                  <Plus size={10} className="stroke-[3]" />
                  <span>新建课程</span>
                </button>
              </div>

              {/* 课程列表卡片 */}
              <div className="space-y-2">
                {courses.length === 0 ? (
                  <CreateCourseFormView
                    isInline
                    currentTeacherName={identityName}
                    currentTeacherRank={teacherRankTag}
                    classList={classList}
                    onSubmitCourse={handleCreateCourseFromScratch}
                    onCancel={onClose}
                  />
                ) : (
                  courses.map((course, cIdx) => (
                  <div
                    key={`course-item-${course.id || cIdx}-${cIdx}`}
                    className="p-2.5 bg-[#FAFBFD] border border-[#E4E6EB] hover:border-[#1877F2] rounded-xs space-y-2 transition-all shadow-2xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1C1E21]">《{course.name}》</span>
                          <span className="text-[8.5px] px-1.5 py-0.2 bg-[#E7F3FF] text-[#1877F2] rounded-2xs border border-[#1877F2]/20 font-bold">
                            {course.groupType === 'large' ? '合班大课' : '小班精讲'}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#65676B] font-mono mt-0.5">
                          {course.schedule} · {course.classroom}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-mono font-black text-[#1877F2]">
                          {course.attendancePct || 93.8}%
                        </span>
                        <span className="block text-[8px] text-[#65676B]">出勤达标率</span>
                      </div>
                    </div>

                    {/* 信标与班级详情条 */}
                    <div className="flex items-center justify-between text-[9px] bg-white p-1.5 border border-[#E4E6EB] rounded-2xs">
                      <span className="text-[#65676B]">
                        授课班级: <strong className="text-[#1C1E21]">{course.classes.join(', ')}</strong>
                      </span>
                      <span className="text-[#1877F2] font-mono font-bold flex items-center gap-0.5">
                        <Radio size={10} className="text-[#1877F2] animate-pulse" />
                        <span>50m 信标生效中</span>
                      </span>
                    </div>

                    {/* 操作按钮栏 */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E4E6EB]/60">
                      <button
                        type="button"
                        onClick={() => openEditCourseModal(course)}
                        className="px-2.5 py-1 bg-white hover:bg-[#F0F2F5] text-[#1C1E21] font-bold rounded-xs cursor-pointer border border-[#E4E6EB] flex items-center gap-1 text-[9.5px] transition-colors"
                      >
                        <Edit3 size={11} className="text-[#1877F2]" />
                        <span>修改课程</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('attendance');
                          setSelectedCourseForSession(course);
                          notify(`已进入《${course.name}》电子考勤大厅`);
                        }}
                        className="px-3 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer text-[9.5px] flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Compass size={11} />
                        <span>电子考勤</span>
                      </button>
                    </div>
                  </div>
                )))}
              </div>
            </div>

            {/* 3. 所带班级与教学班名册 (MENTORED CLASSES) */}
            <div className="bg-white border border-[#E4E6EB] p-3 rounded-xs shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-[#1877F2] text-white rounded-2xs shadow-2xs">
                    <Users size={13} />
                  </div>
                  <h4 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                    <span>所带班级名册</span>
                    <span className="text-[9px] text-[#1877F2] bg-[#E7F3FF] px-1.5 py-0.2 rounded-2xs border border-[#1877F2]/20 font-bold">
                      共 {classList.length} 个教学班
                    </span>
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(true)}
                  className="text-[10px] text-[#1877F2] font-bold hover:underline flex items-center gap-0.5 cursor-pointer bg-[#E7F3FF] px-2 py-0.5 rounded-2xs border border-[#1877F2]/20"
                >
                  <Plus size={10} className="stroke-[3]" />
                  <span>添加班级</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {classList.map((cls) => (
                  <div
                    key={cls.id}
                    className="bg-[#FAFBFD] p-2.5 border border-[#E4E6EB] rounded-xs flex items-center justify-between shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1C1E21]">{cls.name}</span>
                        <span className="text-[8.5px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded-2xs border border-emerald-200 font-bold">
                          在册 {cls.count} 人
                        </span>
                      </div>
                      <div className="text-[9.5px] text-[#65676B]">
                        {cls.dept} · 班主任: {cls.adviser}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('attendance');
                        notify(`已载入 ${cls.name} 名册并开启电子考勤`);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-[#E7F3FF] text-[#1877F2] font-bold text-[9.5px] rounded-xs border border-[#1877F2]/30 cursor-pointer shadow-2xs transition-colors"
                    >
                      考勤排期
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. 课程成就勋章库 & 教学荣誉 (ACHIEVEMENTS & BADGES) */}
            <div className="bg-white border border-[#E4E6EB] p-3 rounded-xs shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-[#1877F2] text-white rounded-2xs shadow-2xs">
                    <Award size={13} />
                  </div>
                  <h4 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                    <span>教学勋章与成就库</span>
                    <span className="text-[9px] text-[#1877F2] bg-[#E7F3FF] px-1.5 py-0.2 rounded-2xs border border-[#1877F2]/20 font-bold">
                      {badges.filter(b => b.isUnlocked).length} / {badges.length} 已点亮
                    </span>
                  </h4>
                </div>
                <span className="text-[9px] text-[#65676B]">点击卡片或“点亮”按钮触发专属荣誉动效</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {badges.map((badge) => {
                  const isAnimating = animatingBadgeId === badge.id;
                  return (
                    <div
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      className={`relative overflow-hidden p-2.5 bg-[#FAFBFD] border rounded-xs text-left cursor-pointer transition-all shadow-2xs group space-y-1.5 ${
                        badge.isUnlocked
                          ? 'border-[#E4E6EB] hover:border-[#1877F2] hover:bg-[#E7F3FF]/30'
                          : 'border-dashed border-gray-300 bg-gray-50/75 opacity-90 hover:opacity-100 hover:border-amber-400'
                      } ${
                        isAnimating
                          ? 'animate-badge-unlock-scale ring-2 ring-amber-400 border-amber-400 bg-amber-50/40 z-20'
                          : ''
                      }`}
                    >
                      {/* 金色光效扫光动画 (Golden Card Sweep on Unlock) */}
                      {isAnimating && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-300/40 to-transparent animate-golden-card-sweep" />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {/* 勋章图标容器 + 金色光圈扩散层 */}
                        <div className="relative flex items-center justify-center">
                          {/* 第一道金色光圈快速扩散 */}
                          {isAnimating && (
                            <div className="absolute w-8 h-8 rounded-full border-2 border-amber-400 bg-radial from-amber-400/40 via-amber-300/20 to-transparent animate-golden-halo-primary pointer-events-none z-10" />
                          )}
                          {/* 第二道金色光圈延时扩散 */}
                          {isAnimating && (
                            <div className="absolute w-8 h-8 rounded-full border border-yellow-300 bg-radial from-yellow-300/25 to-transparent animate-golden-halo-secondary pointer-events-none z-10" />
                          )}

                          {/* 爆发向外的金色星芒微粒 */}
                          {isAnimating && (
                            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                              <span className="absolute text-[10px] animate-golden-sparkle" style={{ '--tx': '16px', '--ty': '-16px' } as React.CSSProperties}>✨</span>
                              <span className="absolute text-[10px] animate-golden-sparkle" style={{ '--tx': '-16px', '--ty': '-14px' } as React.CSSProperties}>🌟</span>
                              <span className="absolute text-[9px] animate-golden-sparkle" style={{ '--tx': '14px', '--ty': '14px' } as React.CSSProperties}>⭐</span>
                              <span className="absolute text-[10px] animate-golden-sparkle" style={{ '--tx': '-14px', '--ty': '14px' } as React.CSSProperties}>✨</span>
                            </div>
                          )}

                          <div
                            className={`w-7 h-7 rounded-2xs flex items-center justify-center text-white shadow-2xs transition-all ${
                              badge.isUnlocked
                                ? `bg-gradient-to-br ${badge.gradient}`
                                : 'bg-gray-300 text-gray-400 grayscale'
                            } ${isAnimating ? 'animate-badge-icon-ignite ring-2 ring-amber-300' : ''}`}
                          >
                            <Award size={14} />
                          </div>
                        </div>

                        <span
                          className={`text-[8px] font-bold px-1.5 py-0.2 rounded-2xs border ${
                            badge.isUnlocked
                              ? 'text-[#1877F2] bg-white border-[#1877F2]/20'
                              : 'text-gray-500 bg-gray-100 border-gray-300'
                          }`}
                        >
                          {badge.category}
                        </span>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-[#1C1E21] group-hover:text-[#1877F2] truncate flex items-center justify-between">
                          <span>{badge.title}</span>
                          {badge.isUnlocked && (
                            <span className="text-[8px] text-amber-500 font-normal">★</span>
                          )}
                        </div>
                        <div className="text-[8.5px] text-[#65676B] line-clamp-1">
                          {badge.shortDesc}
                        </div>
                      </div>

                      {/* 底部点亮状态与操作按钮 */}
                      <div className="flex items-center justify-between text-[8px] pt-1 border-t border-[#E4E6EB]/60">
                        {badge.isUnlocked ? (
                          <>
                            <span className="text-[#65676B] font-mono">{badge.category}</span>
                            <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 size={10} />
                              <span>已点亮</span>
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-amber-600 font-mono font-bold">
                              未解锁 · 75%
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleUnlockBadge(badge.id, e)}
                              className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white font-bold text-[8.5px] rounded-2xs shadow-2xs cursor-pointer flex items-center gap-1 transition-all"
                              title="点击点亮此勋章"
                            >
                              <span>✨</span>
                              <span>点亮勋章</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
              </div>
            )}

            {/* 子视图 2: 课程课表与排期日历 (将课程课表放入我的课程中) */}
            {(activeTab === 'badges' || courseSubTab === 'schedule') && (
              <CourseScheduleTimetable
                courses={courses}
                weeklySchedule={weeklySchedule}
                setWeeklySchedule={setWeeklySchedule}
                selectedScheduleDay={selectedScheduleDay}
                setSelectedScheduleDay={setSelectedScheduleDay}
                selectedCalendarDayNum={selectedCalendarDayNum}
                setSelectedCalendarDayNum={setSelectedCalendarDayNum}
                setIsCreateCourseModalOpen={setIsCreateCourseModalOpen}
                openEditCourseModal={openEditCourseModal}
                notify={notify}
                onQuickAttendance={(course) => {
                  setActiveTab('attendance');
                  setAttendanceSubTab('live');
                  setSelectedCourseForSession(course);
                  notify(`已切换至【${course.name}】实时考勤大厅`);
                }}
                onViewAttendanceRecord={(courseName, dayNum) => {
                  setActiveTab('attendance');
                  notify(`正在查阅 10月${dayNum}日《${courseName}》考勤底册与在位日志`);
                }}
              />
            )}
          </div>
        )}
          </>
        )}

      </div>

      {/* ================= BADGE DETAIL MODAL ================= */}
      {selectedBadge && (() => {
        const isModalBadgeAnimating = animatingBadgeId === selectedBadge.id;
        const currentBadgeInState = badges.find(b => b.id === selectedBadge.id) || selectedBadge;
        const isUnlocked = currentBadgeInState.isUnlocked;

        return (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
            <div
              className={`bg-white border rounded-xs max-w-xs w-full p-3.5 space-y-2.5 shadow-2xl relative text-xs transition-all ${
                isModalBadgeAnimating
                  ? 'animate-badge-unlock-scale border-amber-400 ring-2 ring-amber-400'
                  : 'border-[#E4E6EB]'
              }`}
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-2.5 right-2.5 text-[#65676B] hover:text-[#1C1E21] p-1 cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="text-center pt-1 space-y-1">
                {/* 勋章图标容器 + 金色扩散光圈 (弹窗中同步生效) */}
                <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                  {/* 第一道金色光圈扩散 */}
                  {isModalBadgeAnimating && (
                    <div className="absolute w-12 h-12 rounded-full border-2 border-amber-400 bg-radial from-amber-400/40 via-amber-300/20 to-transparent animate-golden-halo-primary pointer-events-none z-10" />
                  )}
                  {/* 第二道金色光圈延时扩散 */}
                  {isModalBadgeAnimating && (
                    <div className="absolute w-12 h-12 rounded-full border border-yellow-300 bg-radial from-yellow-300/25 to-transparent animate-golden-halo-secondary pointer-events-none z-10" />
                  )}

                  {/* 爆发向外的金色星芒微粒 */}
                  {isModalBadgeAnimating && (
                    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                      <span className="absolute text-[12px] animate-golden-sparkle" style={{ '--tx': '22px', '--ty': '-22px' } as React.CSSProperties}>✨</span>
                      <span className="absolute text-[12px] animate-golden-sparkle" style={{ '--tx': '-22px', '--ty': '-20px' } as React.CSSProperties}>🌟</span>
                      <span className="absolute text-[11px] animate-golden-sparkle" style={{ '--tx': '20px', '--ty': '20px' } as React.CSSProperties}>⭐</span>
                      <span className="absolute text-[12px] animate-golden-sparkle" style={{ '--tx': '-20px', '--ty': '20px' } as React.CSSProperties}>✨</span>
                    </div>
                  )}

                  <div
                    className={`w-10 h-10 rounded-xs flex items-center justify-center text-white shadow-2xs transition-all ${
                      isUnlocked
                        ? `bg-gradient-to-br ${currentBadgeInState.gradient}`
                        : 'bg-gray-300 text-gray-400 grayscale'
                    } ${isModalBadgeAnimating ? 'animate-badge-icon-ignite ring-2 ring-amber-300' : ''}`}
                  >
                    <Award size={20} />
                  </div>
                </div>

                <h3 className="text-xs font-bold text-[#1C1E21]">{currentBadgeInState.title}</h3>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="inline-block px-2 py-0.2 bg-[#E7F3FF] text-[#1877F2] font-bold text-[9px] rounded-xs">
                    {currentBadgeInState.category}
                  </span>
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.2 bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-[9px] rounded-xs">
                      <CheckCircle2 size={10} />
                      <span>已点亮荣膺</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.2 bg-amber-50 text-amber-600 border border-amber-200 font-bold text-[9px] rounded-xs">
                      <span>未解锁 (进度 {currentBadgeInState.progressPct}%)</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-[#F0F2F5] p-2 border border-[#E4E6EB] text-[10px] text-[#65676B] rounded-xs leading-relaxed">
                {currentBadgeInState.pathDescription.overview}
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#1C1E21] block text-[10px]">获取路径:</span>
                <div className="bg-white border border-[#E4E6EB] p-2 rounded-xs text-[9px] space-y-0.5">
                  {currentBadgeInState.pathDescription.steps.map((step, idx) => (
                    <p key={idx}>{step}</p>
                  ))}
                </div>
              </div>

              {/* 当前状态与奖励 */}
              <div className="bg-[#FAFBFD] border border-[#E4E6EB] p-2 rounded-xs space-y-1 text-[9px]">
                <div className="text-[#1877F2] font-bold">
                  {currentBadgeInState.pathDescription.currentStatusText}
                </div>
                <div className="text-[#65676B]">
                  🎁 {currentBadgeInState.pathDescription.reward}
                </div>
              </div>

              {/* 弹窗底部操作栏：支持点亮勋章、重温动效、重置 */}
              <div className="pt-2 border-t border-[#E4E6EB] flex items-center justify-between">
                <div>
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => handleResetBadge(currentBadgeInState.id)}
                      className="text-[9px] text-[#65676B] hover:text-[#1C1E21] underline cursor-pointer"
                      title="重置为未解锁，便于再次测试点亮动效"
                    >
                      重置为未解锁
                    </button>
                  ) : (
                    <span className="text-[9px] text-amber-600 font-bold">
                      达成教学指标即可点亮
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {!isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => handleUnlockBadge(currentBadgeInState.id)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xs shadow-xs text-[11px] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <span>✨</span>
                      <span>点亮勋章</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUnlockBadge(currentBadgeInState.id)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-xs text-[10px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                      title="再次重温点亮光圈扩散与缩放动效"
                    >
                      <span>✨</span>
                      <span>再次点亮体验</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedBadge(null)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-[#1C1E21] font-bold rounded-xs cursor-pointer text-[11px]"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}


      {/* ================= EDIT COURSE MODAL ("修改课程界面，选择按钮交互逻辑都设定为可选项按钮，尽量避免手动填入") ================= */}
      {isEditCourseModalOpen && editingCourse && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white border-2 border-[#1877F2] rounded-xs max-w-md w-full p-4 space-y-3 shadow-2xl relative text-xs my-auto">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-[#1877F2] text-white rounded-2xs">
                  <Edit3 size={14} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1C1E21] text-xs">修改课程参数 (可选项按钮配置)</h3>
                  <p className="text-[9px] text-[#65676B]">直角线框 UI · 点击选项按钮快速切换，避免繁琐手动填入</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCourseModalOpen(false)}
                className="text-[#65676B] hover:text-[#1C1E21] p-1 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedCourse} className="space-y-3 text-[10px]">
              {/* 1. 课程名称选择器 */}
              <div>
                <label className="block text-[#1C1E21] font-bold mb-1">
                  选择 / 切换课程名称 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    '数据结构与算法',
                    '操作系统原理与实验',
                    '数据库系统概论',
                    '人工智能导论与实践',
                    '计算机网络体系结构',
                    '软件工程与系统架构',
                  ].map((cName) => {
                    const isSelected = editCourseName === cName;
                    return (
                      <button
                        key={cName}
                        type="button"
                        onClick={() => setEditCourseName(cName)}
                        className={`p-1.5 text-left rounded-xs border text-[10px] font-bold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] shadow-2xs'
                            : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#1C1E21] hover:border-[#1877F2]/40'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{cName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. 任课教师选择 */}
              <div>
                <label className="block text-[#1C1E21] font-bold mb-1">主讲 / 任课教师</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '张立华 教授 (我)',
                    '李默 副教授',
                    '王建国 教授',
                    '赵敏 讲师',
                    '周晓华 博士',
                  ].map((t, tIdx) => {
                    const isSelected = editTeacher === t;
                    return (
                      <button
                        key={`teacher-opt-${t}-${tIdx}`}
                        type="button"
                        onClick={() => setEditTeacher(t)}
                        className={`px-2.5 py-1 rounded-xs border text-[10px] font-bold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                            : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2]'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. 上课星期与教学周选择 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[#1C1E21] font-bold text-[11px] flex items-center gap-1">
                    <span>排课星期与具体日期：</span>
                    <span className="text-[#1877F2] font-mono text-[9.5px]">
                      已选：{editDay} ({getWeekDayDates(editWeek).find((d) => d.day === editDay)?.monthDayStr})
                    </span>
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-[#65676B]">教学周：</span>
                    <span className="px-1.5 py-0.2 bg-[#E7F3FF] text-[#1877F2] font-bold rounded-2xs text-[9px] border border-[#1877F2]/20">
                      第 {editWeek} 周标识
                    </span>
                  </div>
                </div>

                {/* Week switcher */}
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { week: 7, label: '第 7 周' },
                    { week: 8, label: '第 8 周 (本周)' },
                    { week: 9, label: '第 9 周' },
                    { week: 10, label: '第 10 周' },
                  ].map((w) => {
                    const isSelected = editWeek === w.week;
                    return (
                      <button
                        key={w.week}
                        type="button"
                        onClick={() => setEditWeek(w.week)}
                        className={`py-1 text-center rounded-xs border text-[9px] cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2] font-bold shadow-2xs'
                            : 'bg-[#FAFBFD] text-[#65676B] border-[#E4E6EB] hover:border-[#1877F2]/40'
                        }`}
                      >
                        {w.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getWeekDayDates(editWeek).map((item) => {
                    const isSelected = editDay === item.day;
                    return (
                      <button
                        key={item.day}
                        type="button"
                        onClick={() => setEditDay(item.day)}
                        className={`py-1 px-0.5 text-center rounded-xs border cursor-pointer transition-all flex flex-col items-center justify-center min-h-[42px] ${
                          isSelected
                            ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs font-bold'
                            : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#1C1E21] hover:border-[#1877F2]'
                        }`}
                      >
                        <span className="text-[10px] font-bold leading-tight">{item.day}</span>
                        <span
                          className={`text-[8px] font-mono leading-tight mt-0.5 ${
                            isSelected ? 'text-white/90 font-bold' : 'text-[#65676B]'
                          }`}
                        >
                          {item.dateStr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. 上课时段选择 */}
              <div>
                <label className="block text-[#1C1E21] font-bold mb-1">上课时段</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    '08:00 - 10:00',
                    '10:00 - 12:00',
                    '14:00 - 16:00',
                    '16:00 - 18:00',
                    '19:00 - 21:00',
                  ].map((tm) => {
                    const isSelected = editTime === tm;
                    return (
                      <button
                        key={tm}
                        type="button"
                        onClick={() => setEditTime(tm)}
                        className={`py-1 px-1.5 text-center rounded-xs border text-[9.5px] font-mono font-bold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] shadow-2xs'
                            : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2]'
                        }`}
                      >
                        {tm}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. 授课教室与地标选择 */}
              <div>
                <label className="block text-[#1C1E21] font-bold mb-1">授课教室与实验中心</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    '3-101 计算机实验室',
                    '5-203 嵌入式中心',
                    '2-405 大报告厅',
                    '1-302 软件实验室',
                    '理科楼 3-402 教研室',
                  ].map((rm) => {
                    const isSelected = editClassroom === rm;
                    return (
                      <button
                        key={rm}
                        type="button"
                        onClick={() => setEditClassroom(rm)}
                        className={`p-1.5 text-left rounded-xs border text-[9.5px] font-bold cursor-pointer transition-all truncate ${
                          isSelected
                            ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] shadow-2xs'
                            : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#1C1E21] hover:border-[#1877F2]'
                        }`}
                      >
                        📍 {rm}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. 教学模式与信标半径选择 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#1C1E21] font-bold mb-1">教学规模</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setEditGroupType('small')}
                      className={`py-1 text-center rounded-xs border text-[10px] font-bold cursor-pointer transition-all ${
                        editGroupType === 'small'
                          ? 'bg-[#1877F2] text-white border-[#1877F2]'
                          : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#65676B]'
                      }`}
                    >
                      小班精讲
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditGroupType('large')}
                      className={`py-1 text-center rounded-xs border text-[10px] font-bold cursor-pointer transition-all ${
                        editGroupType === 'large'
                          ? 'bg-[#1877F2] text-white border-[#1877F2]'
                          : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#65676B]'
                      }`}
                    >
                      合班大课
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#1C1E21] font-bold mb-1">50m 虚拟信标半径</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['30', '50', '100'].map((r) => {
                      const isSelected = editBeaconRadius === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setEditBeaconRadius(r)}
                          className={`py-1 text-center rounded-xs border text-[10px] font-bold cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2]'
                              : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#65676B]'
                          }`}
                        >
                          {r}m
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 7. 教学班级多选按钮 */}
              <div>
                <label className="block text-[#1C1E21] font-bold mb-1">关联教学班级 (点击多选)</label>
                <div className="flex flex-wrap gap-1.5">
                  {classList.map((cls) => {
                    const isSelected = editSelectedClasses.includes(cls.name);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (editSelectedClasses.length > 1) {
                              setEditSelectedClasses(editSelectedClasses.filter((c) => c !== cls.name));
                            }
                          } else {
                            setEditSelectedClasses([...editSelectedClasses, cls.name]);
                          }
                        }}
                        className={`px-2 py-1 rounded-xs border text-[10px] font-bold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                            : 'bg-[#FAFBFD] text-[#65676B] border-[#E4E6EB] hover:border-[#1877F2]'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{cls.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 8. 课程教案要点预设 */}
              <div>
                <label className="block text-[#1C1E21] font-bold mb-1">教案与实验要点预设</label>
                <div className="space-y-1">
                  {[
                    '第 8 讲：核心数据结构、平衡二叉树与哈希表实验',
                    '第 9 讲：进程调度算法模拟与多线程死锁排查',
                    '第 10 讲：关系数据库 SQL 优化与事务并发控制',
                  ].map((plan) => {
                    const isSelected = editLessonPlan === plan;
                    return (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setEditLessonPlan(plan)}
                        className={`w-full p-1.5 text-left rounded-xs border text-[9.5px] cursor-pointer transition-all leading-tight ${
                          isSelected
                            ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] font-bold'
                            : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2]'
                        }`}
                      >
                        {isSelected ? '▶ ' : '• '}{plan}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E4E6EB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditCourseModalOpen(false)}
                  className="px-3.5 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] font-bold rounded-xs cursor-pointer text-xs"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer text-xs shadow-2xs flex items-center gap-1"
                >
                  <Check size={13} />
                  <span>保存修改并同步课表</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CALENDAR POPUP MODAL ("点击日历，弹出日历框，点击日期，下面显示相应的课程有到课率，以及未到课学生的 mini 头像聚合列表。点击未授课的日期，显示具体课程卡片。点击页面其余位置退出") ================= */}
      {isCalendarModalOpen && (
        <div
          onClick={() => setIsCalendarModalOpen(false)}
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-[#1877F2] rounded-xs max-w-md w-full p-3.5 space-y-3 shadow-2xl relative text-xs my-auto max-h-[92vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-[#1877F2] text-white rounded-2xs shadow-2xs">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1C1E21] text-xs flex items-center gap-1">
                    <span>2026年10月 · 课程考勤与排期日历</span>
                    <span className="text-[8px] bg-[#E7F3FF] text-[#1877F2] px-1 rounded-2xs border border-[#1877F2]/20 font-normal">
                      直角线框 UI
                    </span>
                  </h3>
                  <p className="text-[9px] text-[#65676B]">点击日期查看到课率与缺勤头像 / 点击空白区域退出</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(false)}
                className="text-[#65676B] hover:text-[#1C1E21] p-1 cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Calendar Month Grid Header & Selector */}
            <div className="bg-[#FAFBFD] border border-[#E4E6EB] p-2 rounded-xs space-y-2 shrink-0">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-[#1877F2] flex items-center gap-1">
                  <CalendarDays size={12} />
                  <span>2026年 10月 (第 8-9 周)</span>
                </span>
                <span className="text-[8px] text-[#65676B]">
                  点击下方日期切换课程卡片
                </span>
              </div>

              {/* Day Name Header */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-[#65676B] border-b border-[#E4E6EB] pb-1">
                <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
              </div>

              {/* Date Buttons Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-[9px]">
                {calendarDaysList.map((item) => {
                  const isSelected = selectedCalendarDayNum === item.num;

                  return (
                    <button
                      key={item.num}
                      type="button"
                      onClick={() => setSelectedCalendarDayNum(item.num)}
                      className={`p-1.5 border rounded-xs flex flex-col items-center justify-between transition-all cursor-pointer relative min-h-[46px] ${
                        isSelected
                          ? 'bg-[#1877F2] text-white border-[#1877F2] font-bold shadow-2xs scale-102 z-10'
                          : item.isTaught
                          ? 'bg-emerald-50/70 border-emerald-200 text-[#1C1E21] hover:border-[#1877F2]'
                          : item.isUpcoming
                          ? 'bg-white border-[#E4E6EB] text-[#1C1E21] hover:border-[#1877F2]'
                          : 'bg-[#FAFBFD] border-slate-100 text-[#65676B]'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold">{item.num}</span>
                      
                      {item.isTaught && (
                        <span className={`text-[7px] font-bold px-0.5 rounded-2xs ${isSelected ? 'bg-white/20 text-white' : 'text-emerald-700 bg-emerald-100'}`}>
                          {item.rate}%
                        </span>
                      )}

                      {item.isUpcoming && (
                        <span className={`text-[7px] ${isSelected ? 'text-white/90' : 'text-[#1877F2]'}`}>
                          待授课
                        </span>
                      )}

                      {!item.isTaught && !item.isUpcoming && (
                        <span className="text-[7px] text-[#65676B] opacity-60">无课</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Details Card */}
            {(() => {
              const currentActiveDay = calendarDaysList.find((d) => d.num === selectedCalendarDayNum) || calendarDaysList[0];

              return (
                <div className="space-y-2 overflow-y-auto flex-1 pr-0.5 text-[10px]">
                  {/* Case A: Conducted course date with attendance rate & absent mini avatar list */}
                  {currentActiveDay.isTaught && (
                    <div className="p-2.5 border-2 border-emerald-500/80 bg-white rounded-xs space-y-2.5 shadow-xs">
                      <div className="flex items-start justify-between border-b border-[#E4E6EB] pb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-emerald-600 text-white font-bold text-[9px] rounded-xs">
                              10月{currentActiveDay.num}日 ({currentActiveDay.weekday})
                            </span>
                            <span className="font-black text-[#1C1E21] text-xs">
                              《{currentActiveDay.course}》
                            </span>
                          </div>
                          <span className="text-[9px] text-[#65676B] font-mono block mt-0.5">
                            {currentActiveDay.time} · {currentActiveDay.room}
                          </span>
                        </div>
                        <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-2xs shrink-0">
                          已完成授课考勤
                        </span>
                      </div>

                      {/* Attendance Rate Section */}
                      <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1C1E21] text-[10px] flex items-center gap-1">
                            <Users size={12} className="text-[#1877F2]" />
                            <span>到课率统计 (实时更新):</span>
                          </span>
                          <span className="font-black text-emerald-600 text-sm font-mono">
                            {currentActiveDay.rate}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-[#E4E6EB] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${currentActiveDay.rate}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[8.5px] text-[#65676B] font-mono pt-0.5">
                          <span>实到 {currentActiveDay.checked} 人 / 应到 {currentActiveDay.total} 人</span>
                          <span className="text-rose-600 font-bold">缺勤 {currentActiveDay.absent.length} 人</span>
                        </div>
                      </div>

                      {/* Absent Students Mini Avatar Stack / Grid */}
                      <div className="bg-rose-50/50 p-2 border border-rose-200/80 rounded-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-800 text-[9.5px] flex items-center gap-1">
                            <AlertCircle size={11} className="text-rose-600" />
                            <span>未到课学生 mini 头像聚合列表 ({currentActiveDay.absent.length}人):</span>
                          </span>
                          {currentActiveDay.absent.length > 0 && (
                            <button
                              type="button"
                              onClick={() => notify(`已向未到课学生及其班主任触发告警通知！`)}
                              className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[8px] rounded-2xs cursor-pointer shadow-2xs"
                            >
                              一键提醒
                            </button>
                          )}
                        </div>

                        {currentActiveDay.absent.length === 0 ? (
                          <div className="p-2 bg-emerald-50 text-emerald-700 font-bold text-[9px] rounded-2xs text-center border border-emerald-200">
                            🎉 完美出勤！全员按时到课（或已全部完成事后假条补签审核），无缺勤学生。
                          </div>
                        ) : (
                          <div className="space-y-1.5 pt-0.5">
                            {/* Avatar Stack Row - Clickable for Manual Audit */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                              {currentActiveDay.absent.map((stu, i) => (
                                <div
                                  key={`modal-absent-${currentActiveDay.num}-${stu.name}-${i}`}
                                  onClick={() => {
                                    const matchedStudent = students.find((s) => s.name === stu.name) || {
                                      id: `cal-stu-${i}`,
                                      name: stu.name,
                                      avatar: stu.avatar,
                                      status: 'absent_gray' as const,
                                      className: 'CS101 计科一班',
                                      studentId: '2024CS08',
                                      beaconRSSI: -88,
                                      geofenceDistanceMeters: 120,
                                      beaconDetectedAt: '',
                                      absentCount: 2,
                                      consecutiveAbsent: 1,
                                    };
                                    setIsCalendarModalOpen(false);
                                    openManualAuditModal(matchedStudent);
                                  }}
                                  className="flex items-center gap-1.5 bg-white hover:bg-rose-50 border border-rose-200 hover:border-[#1877F2] p-1 rounded-xs shrink-0 shadow-2xs cursor-pointer group transition-all"
                                  title="点击进入补签补录模式"
                                >
                                  <div className="relative">
                                    <img
                                      src={stu.avatar}
                                      alt={stu.name}
                                      className="w-6 h-6 rounded-full object-cover border border-rose-400 group-hover:border-[#1877F2]"
                                    />
                                    <span className="absolute -bottom-1 -right-1 p-0.5 bg-[#1877F2] text-white rounded-full text-[6px]">
                                      <Edit3 size={6} />
                                    </span>
                                  </div>
                                  <div className="text-[8.5px]">
                                    <div className="font-bold text-[#1C1E21] group-hover:text-[#1877F2] flex items-center gap-0.5">
                                      <span>{stu.name}</span>
                                      <span className="text-[6.5px] bg-[#E7F3FF] text-[#1877F2] px-0.5 rounded-2xs">补签</span>
                                    </div>
                                    <div className="text-rose-600 font-medium text-[7.5px]">{stu.reason}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Lesson Plan Summary */}
                      <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-xs space-y-0.5">
                        <span className="font-bold text-[#1877F2] text-[9px]">教案要点:</span>
                        <p className="text-[9px] text-[#1C1E21]">{currentActiveDay.plan}</p>
                      </div>

                      {/* Card Action */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#E4E6EB]">
                        <button
                          type="button"
                          onClick={() => {
                            const matched = courses.find((c) => c.name.includes(currentActiveDay.course) || currentActiveDay.course.includes(c.name));
                            if (matched) openEditCourseModal(matched);
                          }}
                          className="px-2.5 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] font-bold rounded-xs cursor-pointer border border-[#E4E6EB] flex items-center gap-1 text-[9px]"
                        >
                          <Edit3 size={11} className="text-[#1877F2]" />
                          <span>修改课程</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsCalendarModalOpen(false);
                            setActiveTab('attendance');
                            const matched = courses.find((c) => c.name.includes(currentActiveDay.course) || currentActiveDay.course.includes(c.name));
                            if (matched) setSelectedCourseForSession(matched);
                            notify(`已调取《${currentActiveDay.course}》考勤记录细节`);
                          }}
                          className="px-3 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer text-[9px] flex items-center gap-1 shadow-2xs"
                        >
                          <span>查看考勤记录</span>
                          <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Case B: Unconducted / Upcoming Course Date */}
                  {currentActiveDay.isUpcoming && (
                    <div className="p-2.5 border-2 border-[#1877F2] bg-white rounded-xs space-y-2 shadow-xs">
                      <div className="flex items-start justify-between border-b border-[#E4E6EB] pb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-[#1877F2] text-white font-bold text-[9px] rounded-xs">
                              10月{currentActiveDay.num}日 ({currentActiveDay.weekday})
                            </span>
                            <span className="font-black text-[#1C1E21] text-xs">
                              《{currentActiveDay.course}》
                            </span>
                          </div>
                          <span className="text-[9px] text-[#65676B] font-mono block mt-0.5">
                            {currentActiveDay.time} · {currentActiveDay.room}
                          </span>
                        </div>
                        <span className="text-[8px] font-bold text-[#1877F2] bg-[#E7F3FF] border border-[#1877F2]/30 px-1.5 py-0.5 rounded-2xs shrink-0">
                          未授课 · 待排课
                        </span>
                      </div>

                      {/* Beacon Status */}
                      <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-xs flex items-center justify-between text-[9px]">
                        <span className="text-[#65676B] font-bold flex items-center gap-1">
                          <Radio size={11} className="text-[#1877F2] animate-pulse" />
                          <span>50m 虚拟信标预设状态:</span>
                        </span>
                        <span className="font-mono text-[#1877F2] font-bold">
                          课前 15 分钟自动开启打卡
                        </span>
                      </div>

                      {/* Lesson Plan Card */}
                      <div className="bg-[#FAFBFD] p-2 border border-[#E4E6EB] rounded-xs space-y-1">
                        <span className="font-bold text-[#1877F2] text-[9px] flex items-center gap-1">
                          <FileText size={11} />
                          <span>具体教案与实验要点:</span>
                        </span>
                        <p className="text-[9px] text-[#1C1E21] leading-tight">
                          {currentActiveDay.plan}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#E4E6EB]">
                        <button
                          type="button"
                          onClick={() => {
                            const matched = courses.find((c) => c.name.includes(currentActiveDay.course) || currentActiveDay.course.includes(c.name));
                            if (matched) {
                              openEditCourseModal(matched);
                            } else {
                              openEditCourseModal({
                                id: `c-${currentActiveDay.num}`,
                                name: currentActiveDay.course,
                                teacher: '张立华 教授',
                                schedule: `每${currentActiveDay.weekday} ${currentActiveDay.time}`,
                                classroom: currentActiveDay.room,
                                groupType: 'small',
                                classes: ['CS101 计科一班'],
                                beaconLat: 31.2304,
                                beaconLng: 121.4737,
                                beaconRadius: 50,
                                status: 'upcoming',
                                attendancePct: 95,
                                checkedCount: 30,
                                totalCount: 32,
                                hasBeaconIcon: true,
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] font-bold rounded-xs cursor-pointer border border-[#E4E6EB] flex items-center gap-1 text-[9px]"
                        >
                          <Edit3 size={11} className="text-[#1877F2]" />
                          <span>修改课程</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsCalendarModalOpen(false);
                            setActiveTab('attendance');
                            const matched = courses.find((c) => c.name.includes(currentActiveDay.course) || currentActiveDay.course.includes(c.name));
                            if (matched) setSelectedCourseForSession(matched);
                            notify(`开启《${currentActiveDay.course}》考勤管理`);
                          }}
                          className="px-3 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer text-[9px] flex items-center gap-1 shadow-2xs"
                        >
                          <span>一键考勤</span>
                          <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Case C: Rest / Unscheduled Day */}
                  {!currentActiveDay.isTaught && !currentActiveDay.isUpcoming && (
                    <div className="p-3 border border-[#E4E6EB] bg-[#FAFBFD] rounded-xs space-y-2 text-center">
                      <div className="text-[11px] font-bold text-[#65676B]">
                        10月{currentActiveDay.num}日 ({currentActiveDay.weekday}) · 本日无教学排课
                      </div>
                      <p className="text-[9.5px] text-[#65676B]">
                        自由教学备课、课题组研讨与学术指导日。
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCalendarModalOpen(false);
                          setIsCreateCourseModalOpen(true);
                        }}
                        className="px-3 py-1 bg-[#1877F2] text-white font-bold rounded-xs text-[9px] cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Plus size={11} />
                        <span>快速添加授课排期</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="pt-2 border-t border-[#E4E6EB] flex items-center justify-between shrink-0">
              <span className="text-[8.5px] text-[#65676B]">
                💡 点击遮罩或背景任意空白位置即可退出日历
              </span>

              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(false)}
                className="px-4 py-1 bg-[#1877F2] text-white font-bold rounded-xs cursor-pointer text-[10px]"
              >
                关闭日历
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ================= TOP RIGHT "+" POPUP MENU CARD ================= */}
      {isAddMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-start justify-end p-3 animate-in fade-in duration-150"
          onClick={() => setIsAddMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-64 bg-white border-2 border-[#1877F2] rounded-xs shadow-2xl p-3 space-y-2.5 mt-28 animate-in slide-in-from-top-2 duration-150 text-[#1C1E21]"
          >
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="font-bold text-xs text-[#1C1E21] flex items-center gap-1.5">
                <Plus size={15} className="text-[#1877F2] stroke-[3]" />
                <span>快捷创建与添加</span>
              </h3>
              <button
                onClick={() => setIsAddMenuOpen(false)}
                className="text-[#65676B] hover:text-[#1C1E21] cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1.5 pt-0.5">
              {/* Option 1: 新建课程 */}
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false);
                  setIsCreateCourseModalOpen(true);
                  notify('进入新建课程与 50m 信标配置页面');
                }}
                className="w-full text-left p-2 rounded-xs border border-[#E4E6EB] hover:border-[#1877F2] bg-[#FAFBFD] hover:bg-[#E7F3FF]/50 transition-all flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xs bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center shrink-0 border border-[#1877F2]/30 font-bold text-xs">
                  1
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#1C1E21] group-hover:text-[#1877F2]">1. 新建课程</div>
                  <div className="text-[10px] text-[#65676B] truncate">进入添加课程页面与 50m 信标配置</div>
                </div>
              </button>

              {/* Option 2: 添加班级 */}
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false);
                  setIsAddClassModalOpen(true);
                }}
                className="w-full text-left p-2 rounded-xs border border-[#E4E6EB] hover:border-[#1877F2] bg-[#FAFBFD] hover:bg-[#E7F3FF]/50 transition-all flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xs bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center shrink-0 border border-[#1877F2]/30 font-bold text-xs">
                  2
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#1C1E21] group-hover:text-[#1877F2]">2. 添加班级</div>
                  <div className="text-[10px] text-[#65676B] truncate">添加并录入新的教学班级与学生名册</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CREATE / ADD COURSE FULL-PAGE VIEW (Facebook Straight-Edge UI, Location & Tower / Beacon Version) ================= */}
      {isCreateCourseModalOpen && (
        <div className="absolute inset-0 z-40 bg-[#F0F2F5] flex flex-col animate-in fade-in duration-150 overflow-hidden select-none">
          {/* Header Bar */}
          <div className="bg-white border-b border-[#E4E6EB] px-3.5 py-2.5 flex items-center justify-between shadow-2xs shrink-0 z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-7 h-7 bg-[#1877F2] text-white rounded-xs flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <TowerControl size={15} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5 truncate">
                    <span>添加课程与灯塔信标</span>
                    <span className="px-1.5 py-0.2 bg-[#E7F3FF] text-[#1877F2] font-mono text-[9px] rounded-2xs border border-[#1877F2]/30 font-bold shrink-0">
                      50m 信标
                    </span>
                  </h2>
                  <p className="text-[9.5px] text-[#65676B] truncate">
                    地图生成灯塔坐标 · 自动考勤打卡
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateCourseModalOpen(false)}
              className="px-2.5 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] font-bold rounded-xs cursor-pointer text-xs border border-[#E4E6EB] shrink-0"
            >
              取消
            </button>
          </div>

          {/* Form Scrollable Body */}
          <form
            onSubmit={handleCreateCourseSubmit}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              
              {/* Card 1: 课程基本信息 */}
              <div className="bg-white border border-[#E4E6EB] rounded-xs p-3 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                  <h3 className="font-bold text-xs text-[#1C1E21] flex items-center gap-1.5">
                    <BookOpen size={14} className="text-[#1877F2]" />
                    <span>1. 课程基本信息与授课属性</span>
                  </h3>
                  <span className="text-[9.5px] text-[#65676B]">必填项与院系设定</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-[#1C1E21] block mb-1">
                      课程名称 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      placeholder="例如: 操作系统原理与实验 / 人工智能前沿实训"
                      className="w-full px-3 py-2 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21] font-bold transition-all"
                      required
                    />
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="text-[9.5px] text-[#65676B]">常用建议:</span>
                      {['数据结构与算法', '数据库系统概论', '计算机网络体系', '机器学习实践'].map((tag, sIdx) => (
                        <button
                          key={`sug-course-${tag}-${sIdx}`}
                          type="button"
                          onClick={() => setNewCourseName(tag)}
                          className="px-1.5 py-0.5 bg-[#FAFBFD] hover:bg-[#E7F3FF] border border-[#E4E6EB] text-[9.5px] text-[#1877F2] rounded-2xs cursor-pointer font-medium transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-[#1C1E21] block mb-1">授课主讲教师</label>
                      <input
                        type="text"
                        value={newCourseTeacher}
                        onChange={(e) => setNewCourseTeacher(e.target.value)}
                        className="w-full px-3 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21] transition-all"
                        placeholder="张立华 教授 (我)"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#1C1E21] block mb-1">开设院系 / 专业</label>
                      <input
                        type="text"
                        value={newCourseDept}
                        onChange={(e) => setNewCourseDept(e.target.value)}
                        className="w-full px-3 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21] transition-all"
                        placeholder="计算机与软件学院"
                      />
                    </div>
                  </div>

                  {(() => {
                    const currentSmallObj = classList.find((c) => selectedClasses.includes(c.name)) || classList[0];
                    const smallCount = currentSmallObj ? currentSmallObj.count : 32;

                    const selTotalCount = selectedClasses.reduce((sum, cName) => {
                      const found = classList.find((c) => c.name === cName);
                      return sum + (found ? found.count : 0);
                    }, 0);

                    const largeCount =
                      selectedClasses.length > 1
                        ? selTotalCount
                        : classList.slice(0, 2).reduce((sum, c) => sum + c.count, 0) || 62;

                    return (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#1C1E21] block">授课规模</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setNewGroupType('small');
                              if (selectedClasses.length > 1) {
                                setSelectedClasses([selectedClasses[0]]);
                              }
                            }}
                            className={`py-2 px-2.5 rounded-xs border text-center font-bold text-xs cursor-pointer transition-all ${
                              newGroupType === 'small'
                                ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] shadow-2xs'
                                : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2]/40'
                            }`}
                          >
                            小班精讲 (单班 {smallCount}人)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewGroupType('large');
                              if (selectedClasses.length < 2 && classList.length >= 2) {
                                setSelectedClasses([classList[0].name, classList[1].name]);
                              }
                            }}
                            className={`py-2 px-2.5 rounded-xs border text-center font-bold text-xs cursor-pointer transition-all ${
                              newGroupType === 'large'
                                ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] shadow-2xs'
                                : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2]/40'
                            }`}
                          >
                            合班大课 (多班 {largeCount}人)
                          </button>
                        </div>

                        {/* 关联教学班级 (显示于授课规模下方) */}
                        <div className="bg-[#FAFBFD] p-2.5 border border-[#E4E6EB] rounded-xs space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-[#1C1E21] flex items-center gap-1.5">
                              <Users size={12} className="text-[#1877F2]" />
                              <span>关联教学班级</span>
                              <span className="text-[9.5px] font-normal text-[#65676B]">
                                ({newGroupType === 'small' ? '单班选定' : '多班联合'})
                              </span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsAddClassModalOpen(true)}
                              className="text-[10px] text-[#1877F2] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Plus size={11} />
                              <span>添加新班级</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {classList.map((cls) => {
                              const isSelected = selectedClasses.includes(cls.name);
                              return (
                                <button
                                  key={cls.id}
                                  type="button"
                                  onClick={() => {
                                    if (newGroupType === 'small') {
                                      setSelectedClasses([cls.name]);
                                    } else {
                                      if (isSelected) {
                                        if (selectedClasses.length > 1) {
                                          setSelectedClasses(selectedClasses.filter((c) => c !== cls.name));
                                        }
                                      } else {
                                        setSelectedClasses([...selectedClasses, cls.name]);
                                      }
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded-xs border text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                                    isSelected
                                      ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                                      : 'bg-white text-[#65676B] border-[#E4E6EB] hover:border-[#1877F2]'
                                  }`}
                                >
                                  {isSelected && <Check size={11} />}
                                  <span>{cls.name}</span>
                                  <span className="text-[9.5px] opacity-80">({cls.count}人)</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Card 2: 授课时间与排课周期 */}
              <div className="bg-white border border-[#E4E6EB] rounded-xs p-3 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#1877F2]" />
                    <h3 className="font-bold text-xs text-[#1C1E21] flex items-center gap-1.5">
                      <span>2. 上课周期与时间节次</span>
                      <span className="px-1.5 py-0.2 bg-[#E7F3FF] text-[#1877F2] font-mono text-[9px] rounded-2xs border border-[#1877F2]/30 font-bold">
                        第 {newCourseWeek} 周标识
                      </span>
                    </h3>
                  </div>
                  <span className="text-[9.5px] text-[#65676B]">自动写入周课表</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* 第几周标识与选择 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-[#1C1E21] flex items-center gap-1">
                        <span>教学周标识与切换：</span>
                        <span className="text-[9.5px] font-bold text-[#1877F2] bg-[#E7F3FF] px-1.5 py-0.2 rounded-2xs border border-[#1877F2]/20">
                          第 {newCourseWeek} 周
                        </span>
                      </label>
                      <span className="text-[9px] text-[#65676B]">
                        2026秋季学期教学周历
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { week: 7, label: '第 7 周', range: '10.05 - 10.11' },
                        { week: 8, label: '第 8 周 (本周)', range: '10.12 - 10.18' },
                        { week: 9, label: '第 9 周 (下周)', range: '10.19 - 10.25' },
                        { week: 10, label: '第 10 周', range: '10.26 - 11.01' },
                      ].map((w) => {
                        const isSelected = newCourseWeek === w.week;
                        return (
                          <button
                            key={w.week}
                            type="button"
                            onClick={() => setNewCourseWeek(w.week)}
                            className={`p-1.5 rounded-xs border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] font-bold shadow-2xs'
                                : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2]/40 hover:bg-white'
                            }`}
                          >
                            <span className="text-[10px] font-bold leading-tight">{w.label}</span>
                            <span className="text-[8px] font-mono opacity-80 mt-0.5">{w.range}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 上课星期及对应具体日期 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-[#1C1E21] flex items-center gap-1">
                        <span>上课星期（对应具体日期）：</span>
                      </label>
                      <span className="text-[9px] text-[#1877F2] font-mono font-bold">
                        已选：{newCourseDay} ({getWeekDayDates(newCourseWeek).find((d) => d.day === newCourseDay)?.monthDayStr})
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {getWeekDayDates(newCourseWeek).map((item) => {
                        const isSelected = newCourseDay === item.day;
                        return (
                          <button
                            key={item.day}
                            type="button"
                            onClick={() => setNewCourseDay(item.day)}
                            className={`py-1.5 px-0.5 text-center rounded-xs border cursor-pointer transition-all flex flex-col items-center justify-center min-h-[46px] ${
                              isSelected
                                ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs font-bold scale-[1.02] z-10'
                                : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#1C1E21] hover:border-[#1877F2] hover:bg-white'
                            }`}
                          >
                            <span className="text-[10.5px] font-bold leading-tight">{item.day}</span>
                            <span
                              className={`text-[8.5px] font-mono leading-tight mt-0.5 ${
                                isSelected ? 'text-white/95 font-bold' : 'text-[#65676B]'
                              }`}
                            >
                              {item.dateStr}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 时间节次 */}
                  <div>
                    <label className="text-[11px] font-bold text-[#1C1E21] block mb-1">时间节次</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {[
                        '08:00 - 10:00',
                        '10:00 - 12:00',
                        '14:00 - 16:00',
                        '16:00 - 18:00',
                        '19:00 - 21:00',
                      ].map((tm) => {
                        const isSelected = newCourseTime === tm;
                        return (
                          <button
                            key={tm}
                            type="button"
                            onClick={() => setNewCourseTime(tm)}
                            className={`py-1.5 px-2 text-center rounded-xs border text-[10px] font-mono font-bold cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] shadow-2xs'
                                : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2]'
                            }`}
                          >
                            {tm}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 选定排课对应具体日期反馈条 */}
                  {(() => {
                    const activeDateInfo = getWeekDayDates(newCourseWeek).find((d) => d.day === newCourseDay);
                    return (
                      <div className="bg-[#FAFBFD] border border-[#E4E6EB] p-2 rounded-xs flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.2 bg-[#E7F3FF] text-[#1877F2] font-bold rounded-2xs border border-[#1877F2]/30 text-[9px]">
                            第 {newCourseWeek} 周标识
                          </span>
                          <span className="font-bold text-[#050505]">
                            具体日期：{activeDateInfo?.fullDateStr} ({newCourseDay})
                          </span>
                          <span className="text-[#65676B] font-mono">
                            节次：{newCourseTime}
                          </span>
                        </div>
                        <span className="text-[9px] text-[#1877F2] font-bold shrink-0">
                          自动写入周课表
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Card 3: 地理位置坐标与 50m 课程灯塔信标 */}
              <div className="bg-white border border-[#1877F2]/60 rounded-xs p-3 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-[#1877F2] text-white rounded-2xs">
                      <TowerControl size={13} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-[#1C1E21] flex items-center gap-1.5">
                        <span>3. 地理位置与 50m 灯塔信标</span>
                      </h3>
                      <p className="text-[9.5px] text-[#65676B]">
                        设定教室标签与具体位置，支持小卡片选点及增加新教室
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAddClassroomModalOpen(true)}
                      className="px-2 py-1 bg-[#E7F3FF] hover:bg-[#DBECFE] text-[#1877F2] border border-[#1877F2]/40 font-bold rounded-xs cursor-pointer flex items-center gap-1 text-[10.5px] shadow-2xs"
                    >
                      <Plus size={11} />
                      <span>增加新教室</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCoordPickerOpen(true)}
                      className="px-2 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] border border-[#E4E6EB] font-bold rounded-xs cursor-pointer flex items-center gap-1 text-[10.5px] shadow-2xs"
                    >
                      <MapPin size={11} />
                      <span>地图选点</span>
                    </button>
                  </div>
                </div>

                {/* 授课教室自定义修改 (移动至卡片上方) */}
                <div className="space-y-2 bg-[#FAFBFD] p-2.5 border border-[#E4E6EB] rounded-xs">
                  <div>
                    <label className="text-[10.5px] font-bold text-[#1C1E21] block mb-1">授课教室与建筑名称</label>
                    <input
                      type="text"
                      value={newCourseRoom}
                      onChange={(e) => setNewCourseRoom(e.target.value)}
                      placeholder="例如: 3-101 计算机教学实验中心"
                      className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21] font-bold transition-all"
                    />
                  </div>

                  {/* 经纬度手动填入 + 围栏半径 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-[#1C1E21] block mb-0.5 flex items-center gap-1">
                        <MapPin size={11} className="text-[#1877F2]" />
                        <span>纬度 (Lat)</span>
                      </label>
                      <input
                        type="text"
                        value={newLat}
                        onChange={(e) => setNewLat(e.target.value)}
                        placeholder="36.0592"
                        className="w-full px-2 py-1 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs font-mono font-bold text-[#1877F2]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#1C1E21] block mb-0.5 flex items-center gap-1">
                        <MapPin size={11} className="text-[#1877F2]" />
                        <span>经度 (Lng)</span>
                      </label>
                      <input
                        type="text"
                        value={newLng}
                        onChange={(e) => setNewLng(e.target.value)}
                        placeholder="103.8343"
                        className="w-full px-2 py-1 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs font-mono font-bold text-[#1877F2]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#1C1E21] block mb-0.5 flex items-center gap-1">
                        <Radio size={11} className="text-[#1877F2]" />
                        <span>信标半径</span>
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {['30', '50', '100'].map((r) => {
                          const isSelected = newBeaconRadius === r;
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setNewBeaconRadius(r)}
                              className={`py-1 text-center rounded-xs border text-[10px] font-bold cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#1877F2] text-white border-[#1877F2]'
                                  : 'bg-white border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2]'
                              }`}
                            >
                              {r}m
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 常用教室小卡片模式 (Classroom Small Card Grid) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#1C1E21] flex items-center gap-1">
                      <School size={12} className="text-[#1877F2]" />
                      <span>授课教室标签 (小卡片模式)</span>
                    </label>
                    <span className="text-[9.5px] text-[#65676B]">点击卡片快速设定位置与坐标</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {classroomPresets.map((cr) => {
                      const isSelected = newCourseRoom === cr.room || (newLat === cr.lat && newLng === cr.lng);
                      return (
                        <div
                          key={cr.id}
                          onClick={() => {
                            setNewCourseRoom(cr.room);
                            setNewLat(cr.lat);
                            setNewLng(cr.lng);
                            notify(`📍 已选择教室【${cr.room}】(${cr.location})`);
                          }}
                          className={`p-2.5 rounded-xs border cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-[#E7F3FF] border-2 border-[#1877F2] text-[#1877F2] shadow-xs'
                              : 'bg-[#FAFBFD] border-[#E4E6EB] hover:border-[#1877F2] text-[#1C1E21]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="font-bold text-xs flex items-center gap-1.5 truncate">
                              <School size={13} className={isSelected ? 'text-[#1877F2]' : 'text-[#65676B]'} />
                              <span className="truncate">{cr.room}</span>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-2xs font-bold shrink-0 ${
                              isSelected ? 'bg-[#1877F2] text-white' : 'bg-[#E4E6EB] text-[#65676B]'
                            }`}>
                              {cr.tag || '教室'}
                            </span>
                          </div>

                          <div className="text-[10px] text-[#65676B] flex items-center gap-1 truncate">
                            <Building size={11} className="text-[#1877F2] shrink-0" />
                            <span className="truncate">{cr.location}</span>
                          </div>

                          <div className="text-[9.5px] font-mono text-[#1877F2] bg-white/90 px-1.5 py-0.5 rounded-2xs border border-[#1877F2]/20 flex items-center justify-between">
                            <span>坐标: {cr.lat}, {cr.lng}</span>
                            {isSelected && <Check size={12} className="text-[#1877F2] font-bold" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 灯塔图标与预览状态卡片 */}
                <div
                  onClick={() => {
                    setIsCoordPickerOpen(true);
                    notify(`📍 已在底部地图选点组件中高亮并聚焦当前灯塔坐标 (${newLat}, ${newLng})`);
                  }}
                  className="bg-[#E7F3FF]/60 border border-[#1877F2]/40 hover:border-[#1877F2] p-2.5 rounded-xs flex items-center justify-between gap-2 cursor-pointer transition-all group shadow-2xs"
                  title="点击在底部地图选点组件中高亮当前坐标位置"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 bg-white border border-[#1877F2]/50 rounded-xs flex items-center justify-center text-lg shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                      🗼
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-[#1C1E21] truncate flex items-center gap-1.5">
                        <span>【灯塔坐标】{newCourseTeacher ? newCourseTeacher.replace(/（我）|\(我\)/g, '').trim() : '张立华'} + {newCourseName || '新课程'}</span>
                        <span className="text-[9px] bg-[#1877F2] text-white px-1.5 py-0.2 rounded-2xs font-bold animate-pulse">点击高亮选点</span>
                      </div>
                      <div className="text-[9.5px] text-[#65676B] font-mono truncate flex items-center gap-1">
                        <MapPin size={10} className="text-[#1877F2]" />
                        <span>{newLat}, {newLng} · {newCourseRoom} · {newBeaconRadius}m 围栏</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCoordPickerOpen(true);
                        notify(`📍 已在底部地图选点组件中高亮当前灯塔坐标 (${newLat}, ${newLng})`);
                      }}
                      className="px-2.5 py-1 bg-[#E7F3FF] hover:bg-[#DBECFE] text-[#1877F2] border border-[#1877F2]/40 font-bold rounded-xs text-[10px] shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <MapPin size={11} />
                      <span>选点高亮</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLightUpBeaconAction();
                      }}
                      className="px-2.5 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer text-[10px] shadow-2xs flex items-center gap-1"
                    >
                      <TowerControl size={11} />
                      <span>测试点亮</span>
                    </button>
                  </div>
                </div>
              </div>



            </div>

            {/* Bottom Action Footer (Clean, never squished) */}
            <div className="bg-white border-t border-[#E4E6EB] px-3.5 py-2.5 shadow-lg shrink-0 space-y-1.5 z-20">
              <div className="text-[9.5px] text-[#65676B] flex items-center gap-1">
                <span>💡 确认保存后将自动同步课表，并在地图生成 50m 虚拟信标灯塔。</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCourseModalOpen(false)}
                  className="px-4 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] font-bold rounded-xs cursor-pointer border border-[#E4E6EB] text-xs whitespace-nowrap"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer shadow-2xs text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <TowerControl size={14} className="animate-pulse shrink-0" />
                  <span className="truncate">同步课表并在地图生成灯塔坐标</span>
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* ================= ADD CLASS MODAL (Facebook Straight-Edge) ================= */}
      {isAddClassModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={() => setIsAddClassModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white border-2 border-[#1877F2] rounded-xs shadow-2xl p-4 space-y-3 animate-in zoom-in-95 duration-150 text-[#1C1E21]"
          >
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="font-bold text-xs text-[#1C1E21] flex items-center gap-1.5">
                <Users size={16} className="text-[#1877F2]" />
                <span>添加教学班级名册</span>
              </h3>
              <button
                onClick={() => setIsAddClassModalOpen(false)}
                className="text-[#65676B] hover:text-[#1C1E21] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const nameTrimmed = newClassName.trim();
                if (!nameTrimmed) return;
                const shortCode = nameTrimmed.split(' ')[0] || nameTrimmed;
                const newClassItem: ClassListItem = {
                  id: `cls-${Date.now()}`,
                  name: nameTrimmed,
                  shortCode: shortCode,
                  count: parseInt(newClassCount, 10) || 32,
                  adviser: newClassAdviser || '张立华 教授',
                  dept: newClassDept || '计算机与软件学院',
                };
                setClassList((prev) => [...prev, newClassItem]);
                setIsAddClassModalOpen(false);
                setNewClassName('');
                notify(`✅ 成功添加班级《${nameTrimmed}》！已加入授课班级栏卡片并关联选课池`);
              }}
              className="space-y-2.5 text-xs"
            >
              <div>
                <label className="text-[11px] font-bold text-[#1C1E21] block mb-1">班级名称 (例如: CS104 计科四班)</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs"
                  placeholder="请输入班级名称 (例如: CS104 计科四班)"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#1C1E21] block mb-1">班级人数</label>
                  <input
                    type="number"
                    value={newClassCount}
                    onChange={(e) => setNewClassCount(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs"
                    placeholder="32"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#1C1E21] block mb-1">班主任 / 导师</label>
                  <input
                    type="text"
                    value={newClassAdviser}
                    onChange={(e) => setNewClassAdviser(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs"
                    placeholder="指导教师"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#1C1E21] block mb-1">所属院系专业</label>
                <input
                  type="text"
                  value={newClassDept}
                  onChange={(e) => setNewClassDept(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs"
                />
              </div>

              <div className="pt-2 border-t border-[#E4E6EB] flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer shadow-2xs text-xs flex items-center justify-center gap-1"
                >
                  <Check size={14} />
                  <span>确认添加班级卡片</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-3 py-2 bg-[#F0F2F5] hover:bg-gray-200 text-[#1C1E21] font-bold rounded-xs border border-[#E4E6EB] cursor-pointer text-xs"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MAP COORDINATE PICKER & 50M GEOFENCE PREVIEW MODAL (Facebook Straight-Edge) ================= */}
      <BeaconMapPreviewModal
        isOpen={isCoordPickerOpen}
        onClose={() => setIsCoordPickerOpen(false)}
        initialLat={parseFloat(newLat) || 36.0592}
        initialLng={parseFloat(newLng) || 103.8343}
        initialRadius={parseInt(newBeaconRadius, 10) || 50}
        initialRoomName={newCourseRoom || '3-101 计算机实验室'}
        courseName={newCourseName || '新课程'}
        teacherName={newCourseTeacher ? newCourseTeacher.replace(/（我）|\(我\)/g, '').trim() : '张立华 教授'}
        showToast={notify}
        onConfirm={(newLatVal, newLngVal, newRadVal, newRoomVal) => {
          setNewLat(newLatVal.toString());
          setNewLng(newLngVal.toString());
          setNewBeaconRadius(newRadVal.toString());
          if (newRoomVal) {
            setNewCourseRoom(newRoomVal);
          }
          notify(`📍 已确认信标选点 (${newLatVal}, ${newLngVal}) 与 ${newRadVal}m 围栏，绑定至 ${newRoomVal || '当前课程'}`);
        }}
      />

      {/* ================= ADD NEW CLASSROOM TAG MODAL (Facebook Straight-Edge UI) ================= */}
      {isAddClassroomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={() => setIsAddClassroomModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white border-2 border-[#1877F2] rounded-xs shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-[#1C1E21]"
          >
            <div className="bg-[#1877F2] text-white px-3.5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs">
                <School size={15} />
                <span>增加新教室标签与坐标</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddClassroomModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCRRoom.trim()) {
                  notify('⚠️ 请填写教室编号/名称');
                  return;
                }
                const newObj = {
                  id: `cr-${Date.now()}`,
                  room: newCRRoom.trim(),
                  location: newCRLocation.trim() || '新教学楼',
                  lat: newCRLat.trim() || '36.0600',
                  lng: newCRLng.trim() || '103.8200',
                  tag: newCRTag.trim() || '新教室',
                };
                setClassroomPresets([...classroomPresets, newObj]);
                setNewCourseRoom(newObj.room);
                setNewLat(newObj.lat);
                setNewLng(newObj.lng);
                setIsAddClassroomModalOpen(false);
                setNewCRRoom('');
                setNewCRLocation('');
                notify(`✅ 已成功添加并关联新教室《${newObj.room}》！`);
              }}
              className="p-3.5 space-y-3 text-xs"
            >
              <div>
                <label className="block text-[#1C1E21] font-bold mb-1 text-[11px]">教室编号/名称 *</label>
                <input
                  type="text"
                  value={newCRRoom}
                  onChange={(e) => setNewCRRoom(e.target.value)}
                  placeholder="例如: 4-201 人工智能实验室"
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21] font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[#1C1E21] font-bold mb-1 text-[11px]">具体位置/建筑物全称</label>
                <input
                  type="text"
                  value={newCRLocation}
                  onChange={(e) => setNewCRLocation(e.target.value)}
                  placeholder="例如: 信息科学与工程学院大楼 4楼"
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21]"
                />
              </div>

              <div>
                <label className="block text-[#1C1E21] font-bold mb-1 text-[11px]">教室标签 (简短)</label>
                <input
                  type="text"
                  value={newCRTag}
                  onChange={(e) => setNewCRTag(e.target.value)}
                  placeholder="例如: AI研讨 / 核心实验室"
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#1C1E21] font-bold mb-1 text-[10px]">纬度 (Lat)</label>
                  <input
                    type="text"
                    value={newCRLat}
                    onChange={(e) => setNewCRLat(e.target.value)}
                    placeholder="36.0600"
                    className="w-full px-2 py-1 border border-[#E4E6EB] rounded-xs font-mono text-xs text-[#1877F2] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#1C1E21] font-bold mb-1 text-[10px]">经度 (Lng)</label>
                  <input
                    type="text"
                    value={newCRLng}
                    onChange={(e) => setNewCRLng(e.target.value)}
                    placeholder="103.8200"
                    className="w-full px-2 py-1 border border-[#E4E6EB] rounded-xs font-mono text-xs text-[#1877F2] font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E6EB]">
                <button
                  type="button"
                  onClick={() => setIsAddClassroomModalOpen(false)}
                  className="px-3 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] font-bold rounded-xs cursor-pointer text-xs"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer text-xs shadow-2xs"
                >
                  确认添加新教室
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MANUAL VERIFICATION & MAKEUP SIGN-IN MODAL (Facebook Straight-Edge UI) ================= */}
      {isManualAuditModalOpen && auditTargetStudent && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setIsManualAuditModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white border-2 border-[#1877F2] rounded-xs shadow-2xl p-4 space-y-3.5 animate-in zoom-in-95 duration-150 text-[#1C1E21] my-auto max-h-[94vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#1877F2] text-white rounded-2xs shadow-2xs">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#1C1E21] flex items-center gap-1.5">
                    <span>考勤人工核查 · 事后假条补签补录</span>
                    <span className="text-[8.5px] bg-[#E7F3FF] text-[#1877F2] px-1.5 py-0.2 rounded-2xs border border-[#1877F2]/20 font-bold">
                      讲师权限
                    </span>
                  </h3>
                  <p className="text-[9.5px] text-[#65676B]">
                    查验学生事后出示的请假条或就医证明，修改状态后将自动同步至考勤看板
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualAuditModalOpen(false)}
                className="text-[#65676B] hover:text-[#1C1E21] p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 text-xs">
              {/* 1. Student Identity Summary */}
              <div className="bg-[#FAFBFD] border border-[#E4E6EB] p-2.5 rounded-xs flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={auditTargetStudent.avatar}
                    alt={auditTargetStudent.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#1877F2] shadow-2xs shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#1C1E21]">{auditTargetStudent.name}</span>
                      <span className="text-[9px] font-mono text-[#65676B] bg-white px-1.5 py-0.2 rounded-2xs border border-[#E4E6EB]">
                        学号: {auditTargetStudent.studentId || '2024CS08'}
                      </span>
                      <span className="text-[9px] text-[#1877F2] bg-[#E7F3FF] px-1.5 py-0.2 rounded-2xs font-bold border border-[#1877F2]/20">
                        {auditTargetStudent.className || 'CS101 计科一班'}
                      </span>
                    </div>
                    <div className="text-[9.5px] text-[#65676B] mt-0.5 flex items-center gap-2">
                      <span className="text-rose-600 font-bold">
                        当前考勤: {auditTargetStudent.status === 'absent_gray' ? '缺勤未到' : auditTargetStudent.status === 'leave_approved' ? '已准假' : '已签到'}
                      </span>
                      <span>·</span>
                      <span>距信标 {auditTargetStudent.geofenceDistanceMeters}m</span>
                      <span>·</span>
                      <span>累计缺席: {auditTargetStudent.absentCount || 0}次</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[8px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-2xs border border-rose-200 font-bold block">
                    待讲师确认
                  </span>
                </div>
              </div>

              {/* 2. Leave Note Verification & Medical Slip Details */}
              <div className="bg-white border border-[#E4E6EB] p-3 rounded-xs space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-1.5">
                  <span className="font-bold text-xs text-[#1C1E21] flex items-center gap-1.5">
                    <FileText size={13} className="text-[#1877F2]" />
                    <span>请假条 / 就医证明核查凭证</span>
                  </span>
                  <span className="text-[9px] text-[#65676B]">学生已提交纸质/电子凭据</span>
                </div>

                {/* Leave Type Selector */}
                <div>
                  <label className="text-[10.5px] font-bold text-[#1C1E21] block mb-1">假条性质类别</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { type: 'sick' as const, label: '🏥 校医院病假', desc: '附诊断证明/发票' },
                      { type: 'personal' as const, label: '📄 辅导员事假', desc: '辅导员签字审批' },
                      { type: 'official' as const, label: '🏆 学科竞赛公假', desc: '学院盖章公函' },
                      { type: 'late_makeup' as const, label: '✍️ 无假条直接补签', desc: '讲师当面补录' },
                    ].map((item) => {
                      const isSelected = auditLeaveType === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => {
                            setAuditLeaveType(item.type);
                            if (item.type === 'sick') {
                              setAuditNewStatus('leave_approved');
                              if (!auditReason) setAuditReason('突发急性肠胃炎，前往校医院门诊就医并遵医嘱静养');
                              if (!auditHospitalOrOrg) setAuditHospitalOrOrg('兰州大学校医院 (急诊科)');
                            } else if (item.type === 'personal') {
                              setAuditNewStatus('leave_approved');
                              if (!auditReason) setAuditReason('家庭突发紧急事由，已报备辅导员签署事假条');
                              if (!auditHospitalOrOrg) setAuditHospitalOrOrg('计算机学院学生工作办公室');
                            } else if (item.type === 'official') {
                              setAuditNewStatus('official_leave');
                              if (!auditReason) setAuditReason('代表学校参加全国大学生程序设计竞赛集训');
                              if (!auditHospitalOrOrg) setAuditHospitalOrOrg('教务处实践教学科');
                            } else {
                              setAuditNewStatus('checked_in');
                              if (!auditReason) setAuditReason('学生因设备网络延迟未能在信标内自动打卡，讲师核实实到后手动补签');
                              if (!auditHospitalOrOrg) setAuditHospitalOrOrg('教学现场核实');
                            }
                          }}
                          className={`p-1.5 rounded-xs border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#E7F3FF] border-2 border-[#1877F2] text-[#1877F2] font-bold shadow-2xs'
                              : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#1C1E21] hover:border-[#1877F2]'
                          }`}
                        >
                          <div className="text-[10px] truncate">{item.label}</div>
                          <div className="text-[8px] text-[#65676B] truncate mt-0.5">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reason & Hospital Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#1C1E21] block mb-0.5">请假/就医证明开具单位</label>
                    <input
                      type="text"
                      value={auditHospitalOrOrg}
                      onChange={(e) => setAuditHospitalOrOrg(e.target.value)}
                      placeholder="例如: 校医院 急诊科 / 辅导员批条"
                      className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#1C1E21] block mb-0.5">假条审批编号 / 医生签章</label>
                    <input
                      type="text"
                      value={auditProofImage ? 'CERT-20261016-088' : 'CERT-20261016-091'}
                      readOnly
                      className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-[#FAFBFD] rounded-xs text-xs font-mono text-[#65676B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#1C1E21] block mb-0.5">请假事由与病情/公假说明</label>
                  <textarea
                    rows={2}
                    value={auditReason}
                    onChange={(e) => setAuditReason(e.target.value)}
                    placeholder="请输入核查确认的请假事由..."
                    className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21]"
                  />
                </div>

                {/* Proof Image Preview */}
                {auditProofImage && (
                  <div className="p-2 bg-[#FAFBFD] border border-[#E4E6EB] rounded-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#1C1E21] flex items-center gap-1">
                        <ImageIcon size={12} className="text-[#1877F2]" />
                        <span>学生出示的假条/诊断报告照片:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsPreviewProofLarge(true)}
                        className="text-[#1877F2] font-bold hover:underline cursor-pointer flex items-center gap-0.5 text-[9.5px]"
                      >
                        <Search size={10} />
                        <span>点击放大核验原图</span>
                      </button>
                    </div>

                    <div
                      onClick={() => setIsPreviewProofLarge(true)}
                      className="relative h-28 rounded-xs overflow-hidden border border-[#E4E6EB] cursor-pointer group bg-slate-900"
                    >
                      <img
                        src={auditProofImage}
                        alt="请假凭证"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        🔍 点击查看大图核验签字与公章
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded-2xs font-mono">
                        已验防伪二维码
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Status Modification Selector (修改考勤状态) */}
              <div className="bg-white border-2 border-[#1877F2]/80 p-3 rounded-xs space-y-2 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-1.5">
                  <span className="font-bold text-xs text-[#1C1E21] flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#1877F2]" />
                    <span>目标考勤状态修改 (同步考勤看板)</span>
                  </span>
                  <span className="text-[8.5px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-2xs border border-emerald-200 font-bold">
                    自动销假 / 补录
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    {
                      status: 'leave_approved' as const,
                      title: '准予事假/病假 (合规请假)',
                      badge: '病/事假已核准',
                      desc: '考勤记为准假销假，不计入旷课逃课',
                      color: 'border-emerald-300 bg-emerald-50/40 text-emerald-900',
                    },
                    {
                      status: 'checked_in' as const,
                      title: '手动补录实到 (现场补签)',
                      badge: '实到 100%',
                      desc: '更改为到课状态，考勤看板实到人数+1',
                      color: 'border-purple-300 bg-purple-50/40 text-purple-900',
                    },
                    {
                      status: 'official_leave' as const,
                      title: '核准公假 (竞赛/公假报备)',
                      badge: '公假报备',
                      desc: '代表学校参赛或公假，计入合规免签',
                      color: 'border-blue-300 bg-blue-50/40 text-blue-900',
                    },
                    {
                      status: 'absent_gray' as const,
                      title: '维持旷课/缺勤状态',
                      badge: '旷课缺勤',
                      desc: '证明不合规或未出示有效证明，维持缺勤',
                      color: 'border-rose-300 bg-rose-50/40 text-rose-900',
                    },
                  ].map((opt) => {
                    const isSelected = auditNewStatus === opt.status;
                    return (
                      <div
                        key={opt.status}
                        onClick={() => setAuditNewStatus(opt.status)}
                        className={`p-2 rounded-xs border cursor-pointer transition-all space-y-0.5 ${
                          isSelected
                            ? 'bg-[#E7F3FF] border-2 border-[#1877F2] shadow-2xs font-bold'
                            : 'bg-[#FAFBFD] border-[#E4E6EB] hover:border-[#1877F2]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className={isSelected ? 'text-[#1877F2]' : 'text-[#1C1E21]'}>{opt.title}</span>
                          <span className={`text-[7.5px] px-1 py-0.2 rounded-2xs border ${opt.color}`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[8.5px] text-[#65676B]">{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Lecturer Audit Remarks */}
              <div>
                <label className="text-[10px] font-bold text-[#1C1E21] block mb-0.5">讲师核查审核批注 (存入学生考勤档案)</label>
                <input
                  type="text"
                  value={auditRemarks}
                  onChange={(e) => setAuditRemarks(e.target.value)}
                  placeholder="例如: 已查验校医院就诊单与辅导员签字假条，予以准假补录。"
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21]"
                />
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="pt-2 border-t border-[#E4E6EB] flex items-center justify-between gap-2 shrink-0">
              <div className="text-[8.5px] text-[#65676B] flex items-center gap-1">
                <Check size={11} className="text-emerald-600" />
                <span>保存后将自动同步更新考勤看板、名册及日历统计</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualAuditModalOpen(false)}
                  className="px-3 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] font-bold rounded-xs cursor-pointer border border-[#E4E6EB] text-xs"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveManualAudit}
                  className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer shadow-2xs text-xs flex items-center gap-1"
                >
                  <Check size={13} />
                  <span>确认修改并同步考勤看板</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= BATCH AUDIT & MAKEUP MODAL (批量人工核查/补签统一修改) ================= */}
      {isBatchAuditModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setIsBatchAuditModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white border-2 border-[#1877F2] rounded-xs shadow-2xl p-4 space-y-3.5 animate-in zoom-in-95 duration-150 text-[#1C1E21] my-auto max-h-[94vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#1877F2] text-white rounded-2xs shadow-2xs">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#1C1E21] flex items-center gap-1.5">
                    <span>批量考勤人工核查与补签</span>
                    <span className="text-[8.5px] bg-[#E7F3FF] text-[#1877F2] px-1.5 py-0.2 rounded-2xs border border-[#1877F2]/20 font-bold">
                      已选中 {selectedStudentIds.length} 名学生
                    </span>
                  </h3>
                  <p className="text-[9.5px] text-[#65676B]">
                    对勾选的多名学生统一核查请假条、补录实到或批量公假报备，实时同步至考勤看板
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchAuditModalOpen(false)}
                className="text-[#65676B] hover:text-[#1C1E21] p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 text-xs">
              {/* 1. Selected Students Summary Chips */}
              <div className="bg-[#FAFBFD] border border-[#E4E6EB] p-2.5 rounded-xs space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-[#1C1E21] flex items-center gap-1">
                    <Users size={12} className="text-[#1877F2]" />
                    <span>本次批量处理的学生名册 ({selectedStudentIds.length}人):</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-rose-600 hover:underline text-[9px] cursor-pointer"
                  >
                    清空重选
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {students
                    .filter((s) => selectedStudentIds.includes(s.id))
                    .map((s) => {
                      const bubble = getStatusBubbleConfig(s);
                      return (
                        <div
                          key={s.id}
                          className="flex items-center gap-1.5 bg-white border border-[#E4E6EB] px-2 py-1 rounded-xs shadow-2xs text-[10px]"
                        >
                          <img
                            src={s.avatar}
                            alt={s.name}
                            className="w-5 h-5 rounded-full object-cover border border-[#E4E6EB]"
                          />
                          <span className="font-bold text-[#050505]">{s.name}</span>
                          <span className="text-[8px] font-mono text-[#65676B]">{s.studentId || '2024CS08'}</span>
                          <span className={`text-[7.5px] px-1 py-0.2 rounded-2xs border ${bubble.bgColor} ${bubble.textColor} ${bubble.borderColor} font-bold`}>
                            {bubble.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSelectStudent(s.id)}
                            className="text-[#65676B] hover:text-rose-600 ml-0.5"
                            title="移出批量列表"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 2. Unified Leave Type & Organization */}
              <div className="bg-white border border-[#E4E6EB] p-3 rounded-xs space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-1.5">
                  <span className="font-bold text-xs text-[#1C1E21] flex items-center gap-1.5">
                    <FileText size={13} className="text-[#1877F2]" />
                    <span>统一证明凭据与假条性质</span>
                  </span>
                  <span className="text-[9px] text-[#65676B]">批量核验登记</span>
                </div>

                {/* Leave Type Selector */}
                <div>
                  <label className="text-[10.5px] font-bold text-[#1C1E21] block mb-1">假条性质类别</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { type: 'sick' as const, label: '🏥 校医院病假', desc: '就医门诊诊断' },
                      { type: 'personal' as const, label: '📄 辅导员事假', desc: '辅导员审批条' },
                      { type: 'official' as const, label: '🏆 学科竞赛公假', desc: '学院公函报备' },
                      { type: 'late_makeup' as const, label: '✍️ 统一现场补录', desc: '讲师核验实到' },
                    ].map((item) => {
                      const isSelected = batchLeaveType === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => {
                            setBatchLeaveType(item.type);
                            if (item.type === 'sick') {
                              setBatchNewStatus('leave_approved');
                              setBatchReason('学生出示校医院门诊诊断证明原件与假条，经任课教师现场核准');
                              setBatchHospitalOrOrg('兰州大学校医院 (门急诊)');
                              setBatchDoctorAdvice('门诊诊断证明完备，建议准予病假销假');
                            } else if (item.type === 'personal') {
                              setBatchNewStatus('leave_approved');
                              setBatchReason('学生出示辅导员签字的事假审批表原件');
                              setBatchHospitalOrOrg('计算机学院学生工作办公室');
                              setBatchDoctorAdvice('事假审批手续齐全，准予销假');
                            } else if (item.type === 'official') {
                              setBatchNewStatus('official_leave');
                              setBatchReason('代表学院参加高校程序设计与学术竞赛，具备正式公函');
                              setBatchHospitalOrOrg('教务处与竞赛实践中心');
                              setBatchDoctorAdvice('符合学校公假参赛豁免考勤要求，准予公假');
                            } else {
                              setBatchNewStatus('checked_in');
                              setBatchReason('因教学实验机房网络延迟未完成信标自动打卡，讲师现场核实全员实到');
                              setBatchHospitalOrOrg('教学实验中心现场');
                              setBatchDoctorAdvice('任课讲师当面核查实到，予以批量补录出勤');
                            }
                          }}
                          className={`p-1.5 rounded-xs border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#E7F3FF] border-2 border-[#1877F2] text-[#1877F2] font-bold shadow-2xs'
                              : 'bg-[#FAFBFD] border-[#E4E6EB] text-[#1C1E21] hover:border-[#1877F2]'
                          }`}
                        >
                          <div className="text-[10px] truncate">{item.label}</div>
                          <div className="text-[8px] text-[#65676B] truncate mt-0.5">{item.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#1C1E21] block mb-0.5">证明开具单位 / 审批部门</label>
                    <input
                      type="text"
                      value={batchHospitalOrOrg}
                      onChange={(e) => setBatchHospitalOrOrg(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21]"
                      placeholder="兰州大学校医院 / 学院学工办"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#1C1E21] block mb-0.5">批复意见 / 审核结论</label>
                    <input
                      type="text"
                      value={batchDoctorAdvice}
                      onChange={(e) => setBatchDoctorAdvice(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#1C1E21] block mb-0.5">统一请假/补录事由说明</label>
                  <textarea
                    rows={2}
                    value={batchReason}
                    onChange={(e) => setBatchReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21]"
                  />
                </div>
              </div>

              {/* 3. Target Status Modification Options */}
              <div className="bg-white border-2 border-[#1877F2]/80 p-3 rounded-xs space-y-2 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-1.5">
                  <span className="font-bold text-xs text-[#1C1E21] flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#1877F2]" />
                    <span>目标统一考勤状态 (将同步覆盖已选 {selectedStudentIds.length} 名学生)</span>
                  </span>
                  <span className="text-[8.5px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-2xs border border-emerald-200 font-bold">
                    实时同步看板
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    {
                      status: 'leave_approved' as const,
                      title: '准予事假/病假 (批量销假)',
                      badge: '病/事假已核准',
                      desc: '状态改为准假，考勤看板自动扣减旷课',
                      color: 'border-emerald-300 bg-emerald-50/40 text-emerald-900',
                    },
                    {
                      status: 'checked_in' as const,
                      title: '统一补录实到 (现场补签)',
                      badge: '实到 +1',
                      desc: '状态改为实到，考勤看板实到总数增加',
                      color: 'border-purple-300 bg-purple-50/40 text-purple-900',
                    },
                    {
                      status: 'official_leave' as const,
                      title: '统一核准公假 (竞赛报备)',
                      badge: '公假免签',
                      desc: '官方活动/竞赛报备，计入合规免签',
                      color: 'border-blue-300 bg-blue-50/40 text-blue-900',
                    },
                    {
                      status: 'absent_gray' as const,
                      title: '维持/标记旷课缺勤',
                      badge: '缺勤警告',
                      desc: '证明不符合要求，维持旷课记录',
                      color: 'border-rose-300 bg-rose-50/40 text-rose-900',
                    },
                  ].map((opt) => {
                    const isSelected = batchNewStatus === opt.status;
                    return (
                      <div
                        key={opt.status}
                        onClick={() => setBatchNewStatus(opt.status)}
                        className={`p-2 rounded-xs border cursor-pointer transition-all space-y-0.5 ${
                          isSelected
                            ? 'bg-[#E7F3FF] border-2 border-[#1877F2] shadow-2xs font-bold'
                            : 'bg-[#FAFBFD] border-[#E4E6EB] hover:border-[#1877F2]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className={isSelected ? 'text-[#1877F2]' : 'text-[#1C1E21]'}>{opt.title}</span>
                          <span className={`text-[7.5px] px-1 py-0.2 rounded-2xs border ${opt.color}`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[8.5px] text-[#65676B]">{opt.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Lecturer Batch Audit Remarks */}
              <div>
                <label className="text-[10px] font-bold text-[#1C1E21] block mb-0.5">
                  讲师批量核查审核批注 (存入每位学生的考勤档案)
                </label>
                <input
                  type="text"
                  value={batchRemarks}
                  onChange={(e) => setBatchRemarks(e.target.value)}
                  placeholder="例如: 已统一核验材料，手续完备真实，准予批量补录销假。"
                  className="w-full px-2.5 py-1.5 border border-[#E4E6EB] bg-white rounded-xs focus:border-[#1877F2] outline-none text-xs text-[#1C1E21]"
                />
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="pt-2 border-t border-[#E4E6EB] flex items-center justify-between gap-2 shrink-0">
              <div className="text-[8.5px] text-[#65676B] flex items-center gap-1">
                <Check size={11} className="text-emerald-600" />
                <span>确认后将批量更新 {selectedStudentIds.length} 名学生并同步考勤看板</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchAuditModalOpen(false)}
                  className="px-3 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] font-bold rounded-xs cursor-pointer border border-[#E4E6EB] text-xs"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveBatchAudit}
                  className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xs cursor-pointer shadow-2xs text-xs flex items-center gap-1"
                >
                  <Check size={13} />
                  <span>确认批量修改 ({selectedStudentIds.length}人)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PROOF IMAGE PREVIEW DIALOG ================= */}
      {isPreviewProofLarge && auditProofImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsPreviewProofLarge(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-[#1877F2] rounded-xs max-w-lg w-full p-4 space-y-3 shadow-2xl relative animate-in zoom-in-95 duration-150 text-[#1C1E21]"
          >
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <div>
                <h3 className="font-bold text-xs text-[#1C1E21] flex items-center gap-1">
                  <span>学生请假条 / 门诊病历原件核验</span>
                  {auditTargetStudent && (
                    <span className="text-[8.5px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded-2xs border border-emerald-200">
                      学生: {auditTargetStudent.name} ({auditTargetStudent.studentId || '2024CS08'})
                    </span>
                  )}
                </h3>
                <p className="text-[9px] text-[#65676B]">开具机构: {auditHospitalOrOrg || '校医院'} · 请假理由: {auditReason}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewProofLarge(false)}
                className="text-[#65676B] hover:text-[#1C1E21] p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-950 rounded-xs overflow-hidden border border-[#E4E6EB] flex items-center justify-center max-h-[65vh]">
              <img
                src={auditProofImage}
                alt="假条大图"
                className="max-h-[60vh] w-auto object-contain rounded-xs shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#E4E6EB] text-xs">
              <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-1">
                <Check size={12} />
                <span>已核验证明印章真实有效</span>
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewProofLarge(false)}
                className="px-4 py-1 bg-[#1877F2] text-white font-bold rounded-xs cursor-pointer text-xs shadow-2xs"
              >
                完成核验返回
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. OFFLINE ATTENDANCE CACHE & SYNC MODAL ("本地缓存打卡记录与断网同步沙盒") */}
      {showOfflineCacheModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E4E6EB] rounded-md shadow-2xl w-full max-w-xl p-4 space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-700 rounded-xs border border-amber-300">
                  <Database size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1C1E21] flex items-center gap-2">
                    <span>本地离线打卡缓存与防误判同步中心</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded-2xs border border-emerald-200">
                      防旷课误判机制已激活
                    </span>
                  </h3>
                  <p className="text-[10px] text-[#65676B]">
                    当学生/教师设备暂时断网或蓝牙信标信号不稳定时，本地沙盒高精度缓存时间戳，网络恢复后原子性同步上报。
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOfflineCacheModal(false)}
                className="text-[#65676B] hover:text-[#1C1E21] p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Network & Local Cache Health Diagnostics */}
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="bg-[#FAFBFD] p-2.5 rounded-xs border border-[#E4E6EB] space-y-1">
                <span className="text-[#65676B] block text-[9px]">当前设备网络状态:</span>
                <span className="font-bold flex items-center gap-1">
                  {isOnline ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Wifi size={12} /> 在线连接 (校园专网)
                    </span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1">
                      <WifiOff size={12} /> 离线弱网 (启用本地沙盒)
                    </span>
                  )}
                </span>
              </div>

              <div className="bg-[#FAFBFD] p-2.5 rounded-xs border border-[#E4E6EB] space-y-1">
                <span className="text-[#65676B] block text-[9px]">蓝牙信标信号强度:</span>
                <span className="font-bold flex items-center gap-1">
                  <Radio size={12} className={beaconSignalQuality === 'strong' ? 'text-emerald-600' : 'text-amber-500 animate-pulse'} />
                  <span className={beaconSignalQuality === 'strong' ? 'text-emerald-600' : 'text-amber-600'}>
                    {beaconSignalQuality === 'strong' ? '稳定 (-62dBm)' : beaconSignalQuality === 'unstable' ? '微弱波动 (-88dBm)' : '盲区丢失 (-105dBm)'}
                  </span>
                </span>
              </div>

              <div className="bg-[#FAFBFD] p-2.5 rounded-xs border border-[#E4E6EB] space-y-1">
                <span className="text-[#65676B] block text-[9px]">离线队列积压 / 状态:</span>
                <span className="font-mono font-black text-[#1877F2]">
                  {offlineRecords.filter((r) => r.syncStatus === 'pending').length} 待同步 / {offlineRecords.length} 总计
                </span>
              </div>
            </div>

            {/* Offline Records Table / List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1C1E21] flex items-center gap-1">
                  <Database size={13} className="text-[#1877F2]" />
                  <span>本地离线打卡记录流水 ({offlineRecords.length} 条)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setOfflineRecords([]);
                      notify('🗑️ 已清空本地离线考勤测试队列缓存。');
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-gray-100 text-gray-500 border border-[#CED0D4] text-[9px] font-bold rounded-xs cursor-pointer"
                  >
                    清空队列
                  </button>
                  <button
                    type="button"
                    disabled={isAutoSyncing || offlineRecords.filter((r) => r.syncStatus === 'pending').length === 0}
                    onClick={triggerAutoSyncToServer}
                    className={`px-3 py-1 text-white text-[10px] font-bold rounded-xs flex items-center gap-1 cursor-pointer shadow-2xs ${
                      offlineRecords.filter((r) => r.syncStatus === 'pending').length > 0
                        ? 'bg-[#1877F2] hover:bg-[#166FE5]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw size={11} className={isAutoSyncing ? 'animate-spin' : ''} />
                    <span>{isAutoSyncing ? '正在批量同步上报...' : '立即同步至教务服务器'}</span>
                  </button>
                </div>
              </div>

              {offlineRecords.length === 0 ? (
                <div className="p-6 text-center bg-[#FAFBFD] border border-dashed border-[#CED0D4] rounded-xs text-[#65676B] text-xs space-y-1">
                  <Database size={24} className="mx-auto text-gray-300" />
                  <p className="font-bold text-[#1C1E21]">本地暂无积压的离线考勤记录</p>
                  <p className="text-[10px]">在弱网或断网环境下点击学生名册的“离线打卡”，记录将自动安全缓存在此处。</p>
                </div>
              ) : (
                <div className="border border-[#E4E6EB] rounded-xs overflow-hidden divide-y divide-[#E4E6EB]">
                  {offlineRecords.map((rec, idx) => (
                    <div
                      key={`${rec.studentId}-${rec.checkInTimestamp}-${idx}`}
                      className="p-2.5 bg-white hover:bg-[#F7F8FA] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-[#1877F2] font-black flex items-center justify-center text-xs border border-[#1877F2]/30 shrink-0">
                          {rec.studentName.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#1C1E21]">{rec.studentName}</span>
                            <span className="text-[8px] bg-gray-100 px-1 py-0.2 rounded-2xs font-mono text-[#65676B] border border-[#E4E6EB]">
                              {rec.courseName}
                            </span>
                            <span
                              className={`text-[8px] px-1.5 py-0.2 rounded-2xs font-bold border ${
                                rec.offlineReason === 'beacon_weak_signal'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {rec.offlineReason === 'beacon_weak_signal' ? '信标弱信号' : '设备断网'}
                            </span>
                          </div>
                          <p className="text-[9px] text-[#65676B] mt-0.5 truncate flex items-center gap-2">
                            <span>打卡时间戳: <strong className="font-mono text-[#1C1E21]">{rec.formattedTime}</strong></span>
                            <span>·</span>
                            <span>信标 RSSI: <strong className="font-mono text-emerald-700">{rec.beaconRssi} dBm</strong></span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rec.syncStatus === 'synced' ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[9px] rounded-2xs border border-emerald-300 flex items-center gap-1">
                            <Check size={10} />
                            <span>已同步服务器</span>
                          </span>
                        ) : rec.syncStatus === 'syncing' ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-[#1877F2] font-bold text-[9px] rounded-2xs border border-[#1877F2]/30 flex items-center gap-1">
                            <RefreshCw size={10} className="animate-spin" />
                            <span>同步中</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[9px] rounded-2xs border border-amber-300 flex items-center gap-1">
                            <Database size={10} />
                            <span>待同步</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Help Tip */}
            <div className="p-2.5 bg-[#F0F7FF] rounded-xs border border-[#1877F2]/30 text-[9.5px] text-[#1C1E21] space-y-1">
              <div className="font-bold text-[#1877F2] flex items-center gap-1">
                <Check size={12} />
                <span>防误判保障机制说明</span>
              </div>
              <p className="text-[#65676B] leading-relaxed">
                考勤引擎采用<strong>「本地硬件晶振时钟打卡 + 离线安全沙盒持久化 + 网络恢复自动补发」</strong>方案。即使教室基站弱电或校园网瞬断，学生签到时间戳仍以进入围栏时的本地高精度硬件记录为准，由后台守护进程自动比对校验，彻底杜绝误判为旷课。
              </p>
            </div>

            <div className="flex items-center justify-end pt-1 border-t border-[#E4E6EB]">
              <button
                type="button"
                onClick={() => setShowOfflineCacheModal(false)}
                className="px-4 py-1.5 bg-[#1877F2] text-white font-bold rounded-xs cursor-pointer text-xs shadow-2xs"
              >
                关闭窗口
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 身份选择与创建弹窗 (进入后从选择身份开始创建，身份选择为：教师和辅导员；教师选择后可选：助教、讲师、副教授、教授标签) */}
      <IdentitySelectionModal
        isOpen={isIdentityModalOpen}
        canCancel={true}
        onClose={() => {
          if (isIdentityCreated) {
            setIsIdentityModalOpen(false);
          } else {
            if (onClose) {
              onClose();
            } else {
              setIsIdentityModalOpen(false);
            }
          }
        }}
        currentProfile={{
          type: selectedIdentityType,
          teacherTag: teacherRankTag,
          counselorTag: counselorRankTag,
          name: identityName,
          staffId: identityStaffId,
          department: identityDept,
          office: identityOffice,
        }}
        onConfirmIdentity={handleConfirmIdentity}
        classList={classList}
        onCreateCourse={(courseData) => {
          handleCreateCourseFromScratch(courseData);
          setIsIdentityModalOpen(false);
        }}
        onCreateClass={(classData) => {
          const newClass = {
            id: `c_${Date.now()}`,
            ...classData,
          };
          setClassList((prev) => [newClass, ...prev]);
          notify(`🏫 负责班级【${classData.name}】建立成功并纳入学籍底册！`);
          setIsIdentityModalOpen(false);
        }}
      />

    </div>
  );
};
