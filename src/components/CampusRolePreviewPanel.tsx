import React, { useState, useEffect } from 'react';
import {
  Compass,
  GraduationCap,
  Shield,
  Users,
  Award,
  Check,
  ArrowRight,
  LogIn,
  LogOut,
  SlidersHorizontal,
  Calendar,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Maximize2,
  X,
  FileSpreadsheet,
  Info,
  CheckCircle2,
  UserCheck,
  Radio,
  Building2,
  Sparkles,
  MapPin,
  Heart,
  ShieldAlert,
  Flame,
  Camera,
  Activity,
  User,
  RotateCcw,
  ListChecks,
} from 'lucide-react';
import { UserRole } from './skills/CourseManagementApp';
import { DualRoleVerificationModal } from './DualRoleVerificationModal';
import {
  DualRoleId,
  getActiveRoleId,
  setActiveRoleId,
  getSharedState,
  getRoleProfile,
  resetAllDualRoleMemory,
  subscribeDualRoleStore,
} from '../data/dualRoleStore';

export interface CampusRoleItem {
  id: string;
  appRole?: UserRole; // Mapping to CourseManagementApp UserRole (if teaching)
  category: 'teaching' | 'social' | 'family' | 'team' | 'all';
  name: string; // 角色通用代号
  title: string; // 职务 / 身份
  characterName: string; // 演示人物姓名
  characterId: string; // 工号/学号/UID
  avatar: string;
  dept: string; // 所属部门 / 圈子 / 家庭组
  badgeText: string;
  badgeColorClass: string;
  description: string;
  interfaceHighlights: string; // 切换后看到的相应界面和内容说明
  permissions: string[];
  targetModule: 'course_app' | 'home_map' | 'family_care' | 'teams_hub' | 'discover';
  defaultTab?: 'attendance' | 'create' | 'analytics' | 'badges' | 'mycourses';
  note?: string;
  emoji?: string;
  theme?: string;
}

export const CAMPUS_ROLES: CampusRoleItem[] = [
  // 1. 高校教学体系角色 (Higher Education & Teaching)
  {
    id: 'instructor',
    appRole: 'instructor',
    category: 'teaching',
    name: '领航员',
    title: '任课教师 / 课程负责人',
    characterName: '张立华 教授',
    characterId: 'TEA-202488',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    dept: '计算机科学与技术学院',
    badgeText: '空间灯塔 · 电子考勤',
    badgeColorClass: 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]',
    description: '创建课程排课、开启电子考勤、点亮空间蓝牙/GPS灯塔、实时点名复核',
    interfaceHighlights: '👉 界面: 空间灯塔控制 · 电子考勤大厅 · 课程排课日历 · 考勤报表',
    permissions: ['创建/编辑课程', '点亮考勤空间灯塔', '发起电子考勤', '处理人工核查补签', '导出考勤报表'],
    targetModule: 'course_app',
    defaultTab: 'attendance',
  },
  {
    id: 'ta',
    appRole: 'ta',
    category: 'teaching',
    name: '副领航员',
    title: '课程助教 / 实验员',
    characterName: '王助教 (硕士生)',
    characterId: 'TA-202401',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    dept: '高级算法与AI课程组',
    badgeText: '教务协助 · 假条审核',
    badgeColorClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    description: '协助授课老师管理考勤、审核学生病假事假凭据、弱网离线打卡缓存同步',
    interfaceHighlights: '👉 界面: 假条凭证待审箱 · 弱网离线缓存同步器 · 课堂答疑协查',
    permissions: ['查看课程到课状态', '审核学生请假凭据', '同步离线打卡缓存', '发送课堂答疑通知'],
    targetModule: 'course_app',
    defaultTab: 'badges',
  },
  {
    id: 'adviser',
    appRole: 'adviser',
    category: 'teaching',
    name: '星区守护者',
    title: '院系辅导员 / 团委书记',
    characterName: '李辅导员',
    characterId: 'ADV-2019',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    dept: '计算机科学学院 · 学工办',
    badgeText: '学籍底册 · 全院预警',
    badgeColorClass: 'bg-indigo-50 text-indigo-700 border-indigo-300',
    description: '维护本院系学生底册与班级目录、审批跨周长期病假事假、监测全院出勤预警',
    interfaceHighlights: '👉 界面: 出勤红线预警看板 · 跨周请假终审 · 班级学生管理(小方块卡片/Stellar代码/二维码加入)',
    permissions: ['管理全院学籍目录', '跨周长期请假终审', '查看全院缺勤红线', '下发辅导预警通知'],
    targetModule: 'course_app',
    defaultTab: 'attendance',
  },
  {
    id: 'monitor',
    appRole: 'monitor',
    category: 'teaching',
    name: '班级守护者',
    title: '小班班长 / 团支书',
    characterName: '赵班长 (计科2401)',
    characterId: '2024CS0801',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    dept: '计科2024级一班 (32人)',
    badgeText: '小班协查 · 一键催到',
    badgeColorClass: 'bg-amber-50 text-amber-800 border-amber-300',
    description: '现场协助老师组织考勤、实时查看未入圈名单、一键呼叫催到、协助补签核对',
    interfaceHighlights: '👉 界面: 班级实时考勤大屏 · 一键催到通道 · 现场目视复核证明',
    permissions: ['查看本班实时考勤', '一键催促未入圈学生', '向老师提交到课复核', '组织小班课业分组'],
    targetModule: 'course_app',
    defaultTab: 'attendance',
  },
  {
    id: 'student',
    appRole: 'student',
    category: 'teaching',
    name: '星航者',
    title: '选课学生 / 学员',
    characterName: '陈星航 (本科生)',
    characterId: '2024CS0805',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    dept: '计科2024级一班',
    badgeText: '信标入圈 · 课表成长',
    badgeColorClass: 'bg-sky-50 text-sky-700 border-sky-300',
    description: '进入教室50m微围栏蓝牙/GPS打卡、弱网离线打卡、提交请假条与病历、查看课程徽章',
    interfaceHighlights: '👉 界面: 空间信标打卡卡片 · 学生在线请假单 · 个人课表 · 成长徽章',
    permissions: ['50m信标微围栏签到', '提交请假申请与凭据', '查看个人课程表', '收集学习成长徽章'],
    targetModule: 'course_app',
    defaultTab: 'attendance',
  },
  {
    id: 'admin',
    appRole: 'admin',
    category: 'teaching',
    name: '星系管理员',
    title: '校教务处处级管理者',
    characterName: '林教务长',
    characterId: 'ADM-0001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    dept: '学校教务处 · 教学运行科',
    badgeText: '校级全局 · 学情看板',
    badgeColorClass: 'bg-purple-50 text-purple-700 border-purple-300',
    description: '管理全校星系院系星区架构、统筹全校教学周历、查看全校实时考勤与出勤大数据',
    interfaceHighlights: '👉 界面: 全校教学运行驾驶舱 · 学院到课率横向对比 · 教学周历',
    permissions: ['全校星系/院系数据配置', '统一教学周历与作息', '全校出勤率大数据总览', '系统全局权限审计'],
    targetModule: 'course_app',
    defaultTab: 'attendance',
  },

  // 2. 社交地图与探索体系角色 (Social Map & Exploration)
  {
    id: 'alex_explorer',
    category: 'social',
    name: '探索领航员',
    title: '城市探索者 / 摄影师 (我)',
    characterName: 'Alex Mercer',
    characterId: 'ST-88902',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    dept: '城市生活探索组 · 上海/兰州',
    badgeText: '实时地图 · 迷雾探索',
    badgeColorClass: 'bg-blue-50 text-blue-700 border-blue-300',
    description: '探索现实世界地图、查看实时好友位置气泡与动态、Zenly迷雾探索、灵动岛飞行与运动状态',
    interfaceHighlights: '👉 界面: 实时好友地图 · Zenly迷雾足迹 · 灵动岛航旅/运动卡片 · 生活锚点标记',
    permissions: ['好友实时位置定位', '地图迷雾探索与点亮', '灵动岛状态实时更新', '发布生活地图锚点'],
    targetModule: 'home_map',
    note: '音乐不停，分享不止...',
    emoji: '😜',
    theme: 'pink',
  },
  {
    id: 'friend_liam',
    category: 'social',
    name: '好友互动视角',
    title: '密友 / 音乐制作人 (Liam)',
    characterName: 'Liam (好友互动视角)',
    characterId: 'FR-LIAM-2026',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    dept: '东方红广场卡座 (950m)',
    badgeText: '好友视角 · 双向敲门 · 便签互发',
    badgeColorClass: 'bg-purple-50 text-purple-700 border-purple-300',
    description: '一键切换为好友 Liam 视角！向主号 Alex 发送私聊、发起密友敲门（咚咚咚）、双向碰一碰、查看 Alex 实时便签与真人照片贴纸',
    interfaceHighlights: '👉 界面: 好友 Liam 视角地图 · 给「Alex (我)」敲门/发消息 · 便签与贴纸互动 · 密友心动连线',
    permissions: ['好友视角双向聊天', '向主号发起密友敲门', '查看主号便签与贴纸', '测试碰一碰与足迹'],
    targetModule: 'home_map',
    note: '新歌混音完成！今晚黄河边兜风见 🎧',
    emoji: '🎧',
    theme: '#8b5cf6',
  },
  {
    id: 'friend_sarah',
    category: 'social',
    name: '密友探索者',
    title: '密友 / 独立摄影师 (Sarah)',
    characterName: 'Sarah Chen (薛梦)',
    characterId: 'FR-SARAH-2026',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    dept: '城市摄影密友圈 (150m)',
    badgeText: '贴纸点赞 · 高精足迹 · 即时私信',
    badgeColorClass: 'bg-pink-50 text-pink-700 border-pink-300',
    description: '切换为好友 Sarah 视角！与 Alex 共享实时高精位置、给 Alex 头像贴纸点赞、查看两人距离雷达与私信对话',
    interfaceHighlights: '👉 界面: Sarah 好友视角地图 · 私信聊天对话框 · 头像贴纸互动 · 距离测算雷达',
    permissions: ['好友视角双向交互', '点赞主号头像贴纸', '共享实时高精位置', '发送照片与位置卡片'],
    targetModule: 'home_map',
    note: '中山桥夜景绝美，快来看！📸',
    emoji: '📸',
    theme: '#ec4899',
  },
  {
    id: 'lover_guardian',
    category: 'social',
    name: '情侣守护者',
    title: '专属亲密伴侣',
    characterName: '林语嫣 (专属情侣)',
    characterId: 'LOVE-520',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    dept: '甜蜜情侣专属空间',
    badgeText: '心动连线 · 亲密轨迹',
    badgeColorClass: 'bg-rose-50 text-rose-700 border-rose-300',
    description: '专属情侣心动距离测算、情侣实时轨迹连线、双人专属星片相册与震动互动',
    interfaceHighlights: '👉 界面: 情侣空间心动连线 · 专属伴侣实时定位 · 爱心互动震动 · 双人私密星片',
    permissions: ['情侣专属实时连线', '双人相聚心动测距', '伴侣电量与轨迹查看', '情侣专属星片记录'],
    targetModule: 'home_map',
    note: '今天也超级想你 ❤️',
    emoji: '💖',
    theme: '#f43f5e',
  },
  {
    id: 'sofia_creator',
    category: 'social',
    name: '潮流创作者',
    title: '街拍博主 / 达人',
    characterName: 'Sofia Chen',
    characterId: 'CR-9921',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    dept: '潮流星片创作者联盟',
    badgeText: '星片发现 · 地标打卡',
    badgeColorClass: 'bg-orange-50 text-orange-700 border-orange-300',
    description: '发现广场探索高赞星片、热门地标打卡、即时社群聊天与短视频快拍发布',
    interfaceHighlights: '👉 界面: 发现广场精选星片 · 地理位置标签打卡 · 即时群聊 · 互动点赞评论',
    permissions: ['发布高精度地图星片', '创建热门地标打卡点', '参与发现广场互动', '社群即时消息互动'],
    targetModule: 'discover',
  },

  // 3. 家庭关怀与安全守护体系角色 (Family Care & Safe Guardian)
  {
    id: 'family_guardian',
    category: 'family',
    name: '家庭守护者',
    title: '家庭管理员 / 家长',
    characterName: '陈立强 (父亲)',
    characterId: 'FAM-001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    dept: '幸福家庭守护组 (4人)',
    badgeText: '家庭守护舱 · 安全围栏',
    badgeColorClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    description: '管理家庭关怀中心、设置老人与儿童安全电子围栏、实时查看电量与步数、SOS紧急求助响应',
    interfaceHighlights: '👉 界面: 家庭守护舱看板 · 家人实时定位与安全状态 · 电子围栏进出告警 · SOS快速联动',
    permissions: ['管理家庭成员底册', '设置安全电子围栏', '接收离家/到家通知', '响应SOS紧急求助'],
    targetModule: 'family_care',
  },
  {
    id: 'family_ward',
    category: 'family',
    name: '家庭被守护者',
    title: '孩童学生 / 被守护成员',
    characterName: '小航 (家庭组员)',
    characterId: 'FAM-004',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    dept: '幸福家庭守护组',
    badgeText: '亲情定位 · 步数同步',
    badgeColorClass: 'bg-teal-50 text-teal-700 border-teal-300',
    description: '亲情定位实时同步、每日安全步数打卡、低电量自动向家长提醒、一键SOS安全呼叫',
    interfaceHighlights: '👉 界面: 亲情安全打卡 · 每日步数同步卡片 · 低电量守护 · 一键紧急求助',
    permissions: ['实时位置向家人共享', '同步健康步数与电量', '触发SOS紧急求助', '接收家长安全叮嘱'],
    targetModule: 'family_care',
  },

  // 4. 户外活动与团队小组角色 (Team & Outdoor Activity)
  {
    id: 'team_leader',
    category: 'team',
    name: '户外骑行领队',
    title: '团队创建者 / 领队',
    characterName: '李浩 (队长)',
    characterId: 'TM-801',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    dept: '追风骑行俱乐部 (18人)',
    badgeText: '团队集结 · 车队追踪',
    badgeColorClass: 'bg-blue-50 text-blue-700 border-blue-300',
    description: '创建团队小组、设置集结点电子围栏、实时监控车队所有成员行进速度与ETA、团队公告发令',
    interfaceHighlights: '👉 界面: 小组地图全员轨迹 · 电子围栏集结打卡 · 成员速度/ETA仪表盘 · 团队指令广播',
    permissions: ['创建与管理小组', '设置活动空间电子围栏', '查阅全员实时定位与轨迹', '发布车队调度公告'],
    targetModule: 'teams_hub',
  },
  {
    id: 'team_member',
    category: 'team',
    name: '户外团队成员',
    title: '骑行队员 / 组员',
    characterName: '周子轩 (队员)',
    characterId: 'TM-812',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
    dept: '追风骑行俱乐部',
    badgeText: '车队跟车 · 组员共享',
    badgeColorClass: 'bg-cyan-50 text-cyan-700 border-cyan-300',
    description: '加入小组车队实时跟车、查看领队与同行队友实时相对位置、共享轨迹、紧急队友求助',
    interfaceHighlights: '👉 界面: 组员实时跟车视角 · 集结点打卡 · 队员相互距离雷达 · 组内对讲交流',
    permissions: ['共享行进位置与速度', '打卡集结点电子围栏', '查看队友相对位置', '组内实时互动'],
    targetModule: 'home_map',
  },
];

interface CampusRolePreviewPanelProps {
  isLoggedIn: boolean;
  currentActiveRole: string;
  isCourseAppOpen: boolean;
  onSelectRoleAndLogin: (role: CampusRoleItem) => void;
  onOpenCourseApp: (tab?: 'attendance' | 'create' | 'analytics' | 'badges' | 'mycourses', role?: UserRole) => void;
  onCloseCourseApp: () => void;
  onToggleLoginState: () => void;
  onNavigateModule?: (targetModule: 'course_app' | 'home_map' | 'family_care' | 'teams_hub' | 'discover') => void;
}

export const CampusRolePreviewPanel: React.FC<CampusRolePreviewPanelProps> = ({
  isLoggedIn,
  currentActiveRole,
  isCourseAppOpen,
  onSelectRoleAndLogin,
  onOpenCourseApp,
  onCloseCourseApp,
  onToggleLoginState,
  onNavigateModule,
}) => {
  // Docking position: 'left' or 'right' (Default to 'left')
  const [dockPosition, setDockPosition] = useState<'left' | 'right'>('left');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(currentActiveRole || 'instructor');
  useEffect(() => {
    setSelectedRoleId(currentActiveRole || 'instructor');
  }, [currentActiveRole]);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const [activeDualRole, setActiveDualRole] = useState<DualRoleId>(getActiveRoleId());
  const [sharedState, setSharedState] = useState(getSharedState());

  useEffect(() => {
    const unsubscribe = subscribeDualRoleStore(() => {
      setActiveDualRole(getActiveRoleId());
      setSharedState(getSharedState());
    });
    return unsubscribe;
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'teaching' | 'social' | 'family' | 'team'>('all');

  const activeRoleObj = CAMPUS_ROLES.find((r) => r.id === selectedRoleId) || CAMPUS_ROLES[0];

  const profileA = getRoleProfile('roleA');
  const profileB = getRoleProfile('roleB');
  const completedChecklistCount = (sharedState?.checklist || []).filter((c) => c.done).length;

  const handleRoleCardClick = (role: CampusRoleItem) => {
    setSelectedRoleId(role.id);
    onSelectRoleAndLogin(role);
    if (role.targetModule === 'course_app') {
      onOpenCourseApp(role.defaultTab || 'attendance', role.appRole);
    } else if (onNavigateModule) {
      onNavigateModule(role.targetModule);
    }
  };

  const handleSwitchDualRole = (targetRole: DualRoleId) => {
    setActiveRoleId(targetRole);
    const targetCampusRole = targetRole === 'roleA'
      ? (CAMPUS_ROLES.find((r) => r.id === 'alex_explorer') || CAMPUS_ROLES[0])
      : (CAMPUS_ROLES.find((r) => r.id === 'friend_liam') || CAMPUS_ROLES[0]);
    
    setSelectedRoleId(targetCampusRole.id);
    onSelectRoleAndLogin(targetCampusRole);
    if (onNavigateModule) onNavigateModule('home_map');
  };

  const filteredRoles = selectedCategory === 'all'
    ? CAMPUS_ROLES
    : CAMPUS_ROLES.filter((r) => r.category === selectedCategory);

  return (
    <>
      {/* ================= DESKTOP USER ROLE SWITCHER FLOATING PANEL ================= */}
      <aside
        id="campus-role-switcher-selector"
        className={`hidden lg:flex fixed top-1/2 -translate-y-1/2 z-40 transition-all duration-300 select-none ${
          dockPosition === 'left'
            ? 'left-3 xl:left-8'
            : 'right-3 xl:right-8'
        }`}
        style={{ maxHeight: '92vh' }}
      >
        {isCollapsed ? (
          /* Mini Collapsed Pill */
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="bg-white border border-[#E4E6EB] hover:border-[#1877F2] text-[#050505] p-3 rounded-md shadow-md flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-105"
            title="展开「多角色切换」面板"
          >
            <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <Users size={16} />
            </div>
            <span className="text-[11px] font-bold text-[#1877F2] [writing-mode:vertical-rl] tracking-widest">
              角色切换
            </span>
            <Maximize2 size={13} className="text-[#65676B]" />
          </button>
        ) : (
          /* Expanded Facebook Straight-Edge Line Frame Panel */
          <div className="w-[310px] xl:w-[340px] max-h-[92vh] min-h-0 bg-white border border-[#E4E6EB] rounded-md shadow-md flex flex-col overflow-hidden text-[#050505]">
            {/* Header with Title and Controls */}
            <div className="p-3 border-b border-[#E4E6EB] bg-[#F7F8FA] space-y-1.5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-xs bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                    <Users size={13} />
                  </div>
                  <h3 className="text-[13px] font-bold text-[#050505] tracking-tight">
                    用户多角色切换
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  {/* Toggle Dock to Left / Right */}
                  <button
                    type="button"
                    onClick={() => setDockPosition((pos) => (pos === 'left' ? 'right' : 'left'))}
                    className="p-1 text-[#65676B] hover:text-[#1877F2] hover:bg-white rounded-xs border border-transparent hover:border-[#E4E6EB] transition-colors cursor-pointer text-[10px] flex items-center gap-0.5"
                    title={`切换停靠在画布${dockPosition === 'left' ? '右侧' : '左侧'}`}
                  >
                    {dockPosition === 'left' ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    <span className="text-[9px] font-mono font-bold">{dockPosition === 'left' ? '靠右' : '靠左'}</span>
                  </button>

                  {/* Collapse Button */}
                  <button
                    type="button"
                    onClick={() => setIsCollapsed(true)}
                    className="p-1 text-[#65676B] hover:text-[#050505] hover:bg-white rounded-xs border border-transparent hover:border-[#E4E6EB] transition-colors cursor-pointer"
                    title="最小化面板"
                  >
                    <Minimize2 size={13} />
                  </button>
                </div>
              </div>

              {/* Dual Role Interaction Quick Switcher Banner */}
              <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xs space-y-1.5 my-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1877F2] text-[11px] flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>双角色跨设备验证</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowVerificationModal(true)}
                    className="px-2 py-0.5 bg-[#1877F2] text-white rounded-xs font-bold text-[9.5px] hover:bg-blue-600 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ListChecks size={11} />
                    <span>验证清单 ({completedChecklistCount}/10)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSwitchDualRole('roleA')}
                    className={`p-1.5 rounded-xs border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeDualRole === 'roleA'
                        ? 'bg-white border-[#1877F2] ring-1 ring-[#1877F2] shadow-2xs'
                        : 'bg-white/80 border-[#E4E6EB] hover:border-[#1877F2]'
                    }`}
                  >
                    <img src={profileA.avatar} alt="Role A" className="w-5 h-5 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-[10px] text-[#050505] truncate">Role A (我)</div>
                      <div className="text-[8.5px] text-[#65676B] truncate">我的手机 Perspective</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchDualRole('roleB')}
                    className={`p-1.5 rounded-xs border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeDualRole === 'roleB'
                        ? 'bg-white border-emerald-500 ring-1 ring-emerald-500 shadow-2xs'
                        : 'bg-white/80 border-[#E4E6EB] hover:border-emerald-500'
                    }`}
                  >
                    <img src={profileB.avatar} alt="Role B" className="w-5 h-5 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-[10px] text-[#050505] truncate">Role B (好友)</div>
                      <div className="text-[8.5px] text-[#65676B] truncate">好友手机 Perspective</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sub-label banner */}
              <div className="flex items-center justify-between text-[9.5px]">
                <span className="px-1.5 py-0.5 bg-[#E7F3FF] text-[#1877F2] font-bold rounded-xs border border-[#1877F2]/30">
                  全生态 {CAMPUS_ROLES.length} 大多角色体系
                </span>
                <span className="text-[#65676B] text-[9px]">
                  点击即刻切换对应身份与界面
                </span>
              </div>

              {/* Multi-System Category Filter Chips */}
              <div className="grid grid-cols-5 gap-1 pt-1 text-center text-[9px] font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`py-0.8 px-0.5 rounded-xs border cursor-pointer transition-colors truncate ${
                    selectedCategory === 'all'
                      ? 'bg-[#1877F2] text-white border-[#1877F2]'
                      : 'bg-white text-[#65676B] hover:bg-[#F0F2F5] border-[#E4E6EB]'
                  }`}
                >
                  全部({CAMPUS_ROLES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('teaching')}
                  className={`py-0.8 px-0.5 rounded-xs border cursor-pointer transition-colors truncate ${
                    selectedCategory === 'teaching'
                      ? 'bg-[#1877F2] text-white border-[#1877F2]'
                      : 'bg-white text-[#65676B] hover:bg-[#F0F2F5] border-[#E4E6EB]'
                  }`}
                >
                  高校教学
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('social')}
                  className={`py-0.8 px-0.5 rounded-xs border cursor-pointer transition-colors truncate ${
                    selectedCategory === 'social'
                      ? 'bg-[#1877F2] text-white border-[#1877F2]'
                      : 'bg-white text-[#65676B] hover:bg-[#F0F2F5] border-[#E4E6EB]'
                  }`}
                >
                  社交探索
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('family')}
                  className={`py-0.8 px-0.5 rounded-xs border cursor-pointer transition-colors truncate ${
                    selectedCategory === 'family'
                      ? 'bg-[#1877F2] text-white border-[#1877F2]'
                      : 'bg-white text-[#65676B] hover:bg-[#F0F2F5] border-[#E4E6EB]'
                  }`}
                >
                  家庭关怀
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('team')}
                  className={`py-0.8 px-0.5 rounded-xs border cursor-pointer transition-colors truncate ${
                    selectedCategory === 'team'
                      ? 'bg-[#1877F2] text-white border-[#1877F2]'
                      : 'bg-white text-[#65676B] hover:bg-[#F0F2F5] border-[#E4E6EB]'
                  }`}
                >
                  户外团队
                </button>
              </div>
            </div>

            {/* Current Mobile Status Banner */}
            <div className="px-3 py-1.5 bg-[#F0F2F5] border-b border-[#E4E6EB] flex items-center justify-between text-[10.5px]">
              <span className="text-[#65676B] flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>手机状态: <strong className="text-[#050505]">{isLoggedIn ? '已登录星图' : '登录/鉴权页'}</strong></span>
              </span>

              <button
                type="button"
                onClick={onToggleLoginState}
                className="text-[#1877F2] hover:underline font-bold text-[10px] cursor-pointer flex items-center gap-0.5"
                title={isLoggedIn ? '退出并返回手机端登录页面演示' : '一键快速进入星图主界面'}
              >
                {isLoggedIn ? <LogOut size={11} /> : <LogIn size={11} />}
                <span>{isLoggedIn ? '重返登录页' : '直接进主页'}</span>
              </button>
            </div>

            {/* Scrollable Role List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2 max-h-[46vh]">
              <div className="text-[10px] font-bold text-[#65676B] px-0.5 flex items-center justify-between">
                <span>点击角色即刻进入对应界面与内容:</span>
                <span className="text-[9px] text-[#1877F2] font-normal">点击卡片直达</span>
              </div>

              {filteredRoles.map((role, rIdx) => {
                const isCurrent = selectedRoleId === role.id;
                return (
                  <div
                    key={`role_${role.id}_${rIdx}`}
                    onClick={() => handleRoleCardClick(role)}
                    className={`p-2 rounded-md border transition-all cursor-pointer text-left relative ${
                      isCurrent
                        ? 'border-[#1877F2] ring-1 ring-[#1877F2] bg-[#F7FAFF]'
                        : 'border-[#E4E6EB] bg-white hover:border-[#1877F2]'
                    }`}
                  >
                    {/* Header line: Avatar + Name + System Tag */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={role.avatar}
                          alt={role.characterName}
                          className="w-8 h-8 rounded-full object-cover border border-[#E4E6EB] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 leading-tight">
                            <span className="text-[12px] font-bold text-[#050505] truncate">{role.characterName}</span>
                            <span className="text-[9px] font-bold text-[#1877F2] bg-blue-50 px-1 py-0.2 rounded-xs border border-blue-200 shrink-0">
                              {role.name}
                            </span>
                          </div>
                          <div className="text-[9px] text-[#65676B] truncate leading-tight mt-0.5">
                            {role.title} · {role.characterId}
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="p-0.5 bg-[#1877F2] text-white rounded-full shrink-0" title="当前激活角色">
                          <Check size={11} className="stroke-[3]" />
                        </span>
                      )}
                    </div>

                    {/* Department and highlight badge */}
                    <div className="mt-1.5 flex items-center justify-between text-[9px]">
                      <span className="text-[#65676B] truncate max-w-[170px]">{role.dept}</span>
                      <span className={`px-1 py-0.2 rounded-xs border text-[8.5px] font-bold ${role.badgeColorClass} shrink-0`}>
                        {role.badgeText}
                      </span>
                    </div>

                    {/* Duty Description */}
                    <p className="mt-1 text-[9.5px] text-[#65676B] line-clamp-1 leading-tight">
                      {role.description}
                    </p>

                    {/* What Interface and Content this role sees */}
                    <div className="mt-1 p-1 bg-[#F0F2F5] border border-[#E4E6EB] rounded-xs text-[9px] text-[#1877F2] font-medium leading-tight">
                      {role.interfaceHighlights}
                    </div>

                    {/* Quick action button inside card */}
                    <div className="mt-1.5 pt-1.5 border-t border-[#F0F2F5] flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleCardClick(role);
                        }}
                        className="w-full py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white border border-[#1877F2] rounded-xs text-[9.5px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                        title="点击即刻切换此角色并看对应界面"
                      >
                        <LogIn size={11} />
                        <span>切换为此角色并进入对应界面</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Workbench Shortcuts Footer */}
            <div className="p-2.5 border-t border-[#E4E6EB] bg-[#F7F8FA] space-y-1.5 shrink-0">
              <div className="text-[10px] font-bold text-[#65676B] px-0.5 flex items-center justify-between">
                <span>手机端核心场景直达:</span>
                <button
                  type="button"
                  onClick={() => setShowMatrixModal(true)}
                  className="text-[#1877F2] hover:underline flex items-center gap-0.5 text-[9px] font-bold cursor-pointer"
                  title="查看多角色体系与权限矩阵说明"
                >
                  <FileSpreadsheet size={10} />
                  <span>权限矩阵</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {/* 1. 高校教学管理 (Click to open Teaching module) */}
                <button
                  type="button"
                  onClick={() => onOpenCourseApp('attendance', activeRoleObj.appRole || 'instructor')}
                  className={`py-1.5 px-2 rounded-xs text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs ${
                    isCourseAppOpen
                      ? 'bg-[#1877F2] text-white border border-[#1877F2]'
                      : 'bg-white hover:bg-[#E7F3FF] hover:border-[#1877F2] text-[#050505] hover:text-[#1877F2] border border-[#E4E6EB]'
                  }`}
                  title="点击直接进入高校教学管理页面"
                >
                  <GraduationCap size={12} className={isCourseAppOpen ? 'text-white' : 'text-[#1877F2]'} />
                  <span>高校教学管理</span>
                </button>

                {/* 2. 地图与社交主页 */}
                <button
                  type="button"
                  onClick={() => {
                    onCloseCourseApp();
                    if (onNavigateModule) onNavigateModule('home_map');
                  }}
                  className="py-1.5 px-2 bg-white hover:bg-[#E7F3FF] hover:border-[#1877F2] text-[#050505] hover:text-[#1877F2] border border-[#E4E6EB] rounded-xs text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                  title="回到手机端主页地图与好友探索"
                >
                  <MapPin size={12} className="text-[#1877F2]" />
                  <span>地图主页</span>
                </button>

                {/* 3. 家庭守护舱 */}
                <button
                  type="button"
                  onClick={() => {
                    onCloseCourseApp();
                    if (onNavigateModule) onNavigateModule('family_care');
                  }}
                  className="py-1.5 px-2 bg-white hover:bg-emerald-50 hover:border-emerald-500 text-[#050505] hover:text-emerald-700 border border-[#E4E6EB] rounded-xs text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                  title="在手机中打开家庭守护舱"
                >
                  <Shield size={12} className="text-emerald-600" />
                  <span>家庭守护舱</span>
                </button>

                {/* 4. 小组与团队活动 */}
                <button
                  type="button"
                  onClick={() => {
                    onCloseCourseApp();
                    if (onNavigateModule) onNavigateModule('teams_hub');
                  }}
                  className="py-1.5 px-2 bg-white hover:bg-amber-50 hover:border-amber-500 text-[#050505] hover:text-amber-700 border border-[#E4E6EB] rounded-xs text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                  title="在手机中打开团队小组与户外活动"
                >
                  <Users size={12} className="text-amber-600" />
                  <span>小组与活动</span>
                </button>
              </div>

              {/* 5. 快速好友双向视角一键切换 (Quick Friend Perspective Switcher) */}
              <button
                type="button"
                onClick={() => {
                  onCloseCourseApp();
                  const targetFriendRole = selectedRoleId === 'friend_liam' 
                    ? (CAMPUS_ROLES.find((r) => r.id === 'alex_explorer') || CAMPUS_ROLES[0])
                    : (CAMPUS_ROLES.find((r) => r.id === 'friend_liam') || CAMPUS_ROLES[0]);
                  handleRoleCardClick(targetFriendRole);
                }}
                className="w-full py-1.5 px-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xs text-[10.5px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                title="一键切换至好友 Liam 视角，与主用户 Alex 进行双向交互测试"
              >
                <Sparkles size={13} className="animate-spin text-yellow-300" />
                <span>{selectedRoleId === 'friend_liam' ? '🔁 切换回我 (Alex 主视角)' : '👥 一键切换好友视角 (Liam 交互)'}</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ================= ROLE PERMISSION MATRIX MODAL ================= */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E6EB] rounded-md shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 text-[#050505]">
            {/* Modal Header */}
            <div className="p-3.5 border-b border-[#E4E6EB] bg-[#F7F8FA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-xs bg-[#1877F2] text-white flex items-center justify-center">
                  <FileSpreadsheet size={15} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#050505]">Stellar 全生态多角色体系与权限矩阵</h4>
                  <p className="text-[10px] text-[#65676B]">包含高校教学管理、社交探索、家庭关怀与户外团队 4 大体系多角色</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                aria-label="关闭角色权限矩阵"
                className="w-11 h-11 shrink-0 flex items-center justify-center hover:bg-gray-200 rounded-xs text-[#65676B] hover:text-[#050505] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content Table */}
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
              <div className="space-y-2">
                <h5 className="font-bold text-[#050505] flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-[#1877F2]" />
                  <span>一、高校教学管理角色体系 (6大角色)</span>
                </h5>
                <div className="overflow-x-auto border border-[#E4E6EB] rounded-xs">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-[#F7F8FA] border-b border-[#E4E6EB] text-[#65676B]">
                      <tr>
                        <th className="p-2">角色代号</th>
                        <th className="p-2">校园实体职务</th>
                        <th className="p-2">空间信标/考勤权限</th>
                        <th className="p-2">核心界面与功能</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E6EB]">
                      <tr>
                        <td className="p-2 font-bold text-[#1877F2]">领航员</td>
                        <td className="p-2">任课教师 / 课程负责人</td>
                        <td className="p-2">点亮空间灯塔 / 开启电子考勤</td>
                        <td className="p-2 text-[#65676B]">空间灯塔控制 · 电子考勤大厅 · 课程排课日历</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-emerald-700">副领航员</td>
                        <td className="p-2">课程助教 / 实验员</td>
                        <td className="p-2">假条凭据审核 / 弱网同步</td>
                        <td className="p-2 text-[#65676B]">假条凭证待审箱 · 弱网离线缓存同步器</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-indigo-700">星区守护者</td>
                        <td className="p-2">院系辅导员 / 团委书记</td>
                        <td className="p-2">全院出勤红线预警 / 学籍底册</td>
                        <td className="p-2 text-[#65676B]">出勤红线预警看板 · 跨周请假终审 · 班级学生管理</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-amber-800">班级守护者</td>
                        <td className="p-2">小班班长 / 团支书</td>
                        <td className="p-2">小班实时考勤 / 一键催到</td>
                        <td className="p-2 text-[#65676B]">班级实时考勤大屏 · 一键催到通道 · 目视复核证明</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-sky-700">星航者</td>
                        <td className="p-2">选课学生 / 学员</td>
                        <td className="p-2">50m信标打卡 / 请假单</td>
                        <td className="p-2 text-[#65676B]">空间信标打卡卡片 · 学生在线请假单 · 个人课表</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-purple-700">星系管理员</td>
                        <td className="p-2">校教务处处级管理者</td>
                        <td className="p-2">全校学情看板 / 教学周历</td>
                        <td className="p-2 text-[#65676B]">全校教学运行驾驶舱 · 学院到课率横向对比</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-[#050505] flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-600" />
                  <span>二、社交探索、家庭关怀与户外团队角色体系</span>
                </h5>
                <div className="overflow-x-auto border border-[#E4E6EB] rounded-xs">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-[#F7F8FA] border-b border-[#E4E6EB] text-[#65676B]">
                      <tr>
                        <th className="p-2">体系模块</th>
                        <th className="p-2">演示人物 / 身份</th>
                        <th className="p-2">特色权限与能力</th>
                        <th className="p-2">核心界面与功能</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E6EB]">
                      <tr>
                        <td className="p-2 font-bold text-blue-700">社交地图</td>
                        <td className="p-2">Alex Mercer (探索领航员)</td>
                        <td className="p-2">迷雾探索 / 灵动状态</td>
                        <td className="p-2 text-[#65676B]">实时好友地图 · Zenly迷雾足迹 · 灵动岛航旅</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-purple-700">好友互动</td>
                        <td className="p-2">Liam (密友/音乐制作人)</td>
                        <td className="p-2">好友视角 / 双向敲门 / 便签互动</td>
                        <td className="p-2 text-[#65676B]">好友视角地图 · 给Alex发消息与敲门 · 贴纸点赞</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-pink-700">密友探索</td>
                        <td className="p-2">Sarah Chen (独立摄影师)</td>
                        <td className="p-2">足迹重叠 / 贴纸互动 / 距离雷达</td>
                        <td className="p-2 text-[#65676B]">Sarah视角地图 · 私信聊天对话框 · 高精位置共享</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-rose-700">情侣守护</td>
                        <td className="p-2">林语嫣 (专属亲密伴侣)</td>
                        <td className="p-2">情侣连线 / 心动测距</td>
                        <td className="p-2 text-[#65676B]">专属情侣空间 · 伴侣实时轨迹 · 双人星片</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-emerald-700">家庭关怀</td>
                        <td className="p-2">陈立强 (家庭守护者/父亲)</td>
                        <td className="p-2">安全围栏 / SOS响应</td>
                        <td className="p-2 text-[#65676B]">家庭守护舱看板 · 家人实时定位 · 围栏告警</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-amber-700">户外团队</td>
                        <td className="p-2">李浩 (骑行领队/队长)</td>
                        <td className="p-2">团队集结围栏 / 车队追踪</td>
                        <td className="p-2 text-[#65676B]">小组地图全员轨迹 · 成员速度/ETA仪表盘</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#E4E6EB] bg-[#F7F8FA] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xs font-bold text-xs cursor-pointer"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dual Role Verification Checklist Modal */}
      <DualRoleVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSwitchRole={handleSwitchDualRole}
      />
    </>
  );
};
