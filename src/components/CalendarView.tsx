import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Clock,
  Navigation,
  Bell,
  Calendar as CalendarIcon,
  CheckCircle2,
  Users,
  MessageCircle,
  Share2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Download,
  CloudSun,
  Edit3,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  X,
  FileText,
  Sun,
  ChevronDown,
  ChevronUp,
  Compass,
  Zap,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import { NotificationItem, Schedule } from '../types';
import { dateKey, scheduleDateParts } from '../utils/lifePlanning';
import { FlightThreeStageCards } from './FlightThreeStageCards';
import { DEFAULT_DEMO_FLIGHT_SCHEDULE } from '../utils/flightAdapter';
import { ActivityCreationUiState } from './ActivityCreationModal';

export interface FriendTransitStatus {
  id: string;
  name: string;
  avatar: string;
  status: 'arrived' | 'on_the_way' | 'departed' | 'preparing';
  statusText: string;
}

export interface ActivityCreator {
  name: string;
  avatar: string;
  roleText: string;
  verified?: boolean;
}

export interface CalendarSubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface CalendarActivityItem {
  id: string;
  title: string;
  type: string;
  category: 'tech' | 'art' | 'lifestyle' | 'sports' | 'work';
  categoryColor: string;
  categoryIcon: string;
  dateStr: string; // e.g. "2026-08-17"
  time: string;
  startTime: string; // e.g. "15:30"
  endTime: string;
  targetTime: string;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  creator: ActivityCreator;
  friendTransitStatuses: FriendTransitStatus[];
  isReminderSet: boolean;
  advanceMinutes: number;
  description: string;
  subTasks?: CalendarSubTask[];
  weatherInfo?: {
    icon: string;
    temp: string;
    condition: string;
  };
}

interface CalendarViewProps {
  focusDate?: string;
  onBack?: () => void;
  onNavigateToLocation?: (locationName: string, lat: number, lng: number, scheduleId?: string) => void;
  onAddNotification?: (notification: NotificationItem) => void;
  showToast?: (msg: string) => void;
  publishedActivities?: ActivityCreationUiState[];
  schedules?: Schedule[];
  onSelectSchedule?: (schedule: Schedule) => void;
  onOpenScheduleCreation?: (date?: string) => void;
  onShareActivity?: (activity: any) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  focusDate,
  onBack,
  onNavigateToLocation,
  onAddNotification,
  showToast,
  publishedActivities = [],
  schedules = [],
  onSelectSchedule,
  onOpenScheduleCreation,
  onShareActivity,
}) => {
  // Calendar View Fold state: folded = compact week strip, unfolded = full 31 days
  const [isCalendarFolded, setIsCalendarFolded] = useState<boolean>(false);

  const todayKey = dateKey();
  const today = new Date(`${todayKey}T12:00:00+08:00`);
  // Year & Month Selection
  const [calendarYear, setCalendarYear] = useState<number>(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(today.getMonth() + 1);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(focusDate || todayKey);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('act-1');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showFlightModal, setShowFlightModal] = useState<boolean>(false);

  // Quick Inline Creator Form State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [quickTitle, setQuickTitle] = useState<string>('');
  const [quickCategory, setQuickCategory] = useState<'tech' | 'art' | 'lifestyle' | 'sports' | 'work'>('tech');
  const [quickTime, setQuickTime] = useState<string>('15:30');
  const [quickLocation, setQuickLocation] = useState<string>('Stellar 研发中心·7层');

  // Customizable Shortcut Activity Cards State
  const [shortcutCards, setShortcutCards] = useState<Array<{ id: string; label: string; cat: 'tech' | 'art' | 'lifestyle' | 'sports' | 'work' }>>([
    { id: 'sc-1', label: '💻 架构研讨', cat: 'tech' },
    { id: 'sc-2', label: '💼 OKR复盘', cat: 'work' },
    { id: 'sc-3', label: '☕ 咖啡品鉴', cat: 'lifestyle' },
    { id: 'sc-4', label: '🚴 傍晚骑行', cat: 'sports' },
  ]);

  // Handle opening schedule creation modal for a date
  const handleOpenAddForDate = (targetDateStr?: string) => {
    if (targetDateStr) {
      setSelectedDateFilter(targetDateStr);
    }
    if (onOpenScheduleCreation) {
      onOpenScheduleCreation(targetDateStr || selectedDateFilter || todayKey);
    } else {
      setIsAddCardModalOpen(true);
    }
  };

  // Quick Add Query Confirmation Modal State ("快速添加时候，先询问是否有修改内容")
  const [isAskQuickAddModalOpen, setIsAskQuickAddModalOpen] = useState<boolean>(false);
  const [pendingQuickCard, setPendingQuickCard] = useState<{ label: string; title: string; cat: 'tech' | 'art' | 'lifestyle' | 'sports' | 'work' } | null>(null);

  // Lightweight Suggested Card Modal State ("添加卡片添加建议卡片内容 只填入卡片主题")
  const [isAddSuggestedCardModalOpen, setIsAddSuggestedCardModalOpen] = useState<boolean>(false);
  const [suggestedCardTitle, setSuggestedCardTitle] = useState<string>('');
  const [suggestedCardCat, setSuggestedCardCat] = useState<'tech' | 'art' | 'lifestyle' | 'sports' | 'work'>('lifestyle');

  // Rich Add Card Modal State (时间范围、地点、地图标注、邀请参与人员、是否生成地图坐标)
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState<boolean>(false);
  const [newCardTitle, setNewCardTitle] = useState<string>('');
  const [newCardCat, setNewCardCat] = useState<'tech' | 'art' | 'lifestyle' | 'sports' | 'work'>('tech');
  const [cardStartTime, setCardStartTime] = useState<string>('14:00');
  const [cardEndTime, setCardEndTime] = useState<string>('16:30');
  const [cardLocation, setCardLocation] = useState<string>('黄河风情线滨河大厦 · 咖啡厅');
  const [generateMapCoords, setGenerateMapCoords] = useState<boolean>(true);
  const [advanceNoticeHours, setAdvanceNoticeHours] = useState<number>(12); // 系统预设时间为活动前 12 小时
  const [selectedCoordIndex, setSelectedCoordIndex] = useState<number>(3);
  const [invitedFriendIds, setInvitedFriendIds] = useState<string[]>(['f1', 'f2']);
  const [customFriendInput, setCustomFriendInput] = useState<string>('');

  // Previous Cards Locations State (使用的历史卡片地点)
  const [previousCardsLocations, setPreviousCardsLocations] = useState([
    { id: 'prev-1', cardTitle: '☕ 咖啡品鉴', name: '黄河风情线滨河大厦 · 咖啡厅', address: '甘肃省兰州市城关区南滨河东路522号', lat: 36.0650, lng: 103.8320 },
    { id: 'prev-2', cardTitle: '💻 架构研讨', name: 'Stellar 研发中心 · 8层研讨厅', address: '甘肃省兰州市城关区高新技术产业开发区创新大厦808室', lat: 36.0412, lng: 103.8550 },
    { id: 'prev-3', cardTitle: '💼 OKR复盘', name: '兰州中心商业广场 · 3层会议中心', address: '甘肃省兰州市七里河区西津东路1号', lat: 36.0610, lng: 103.8210 },
  ]);

  // Map Location Presets Data State (可供在地图上选择的定位标注点，支持删除多余标注点)
  const [mapLocationPresets, setMapLocationPresets] = useState([
    { id: 'loc-1', name: 'Stellar 研发中心', address: '甘肃省兰州市城关区高新技术产业开发区创新大厦808室', lat: 36.0412, lng: 103.8550 },
    { id: 'loc-2', name: '兰州中心商业广场', address: '甘肃省兰州市七里河区西津东路1号', lat: 36.0610, lng: 103.8210 },
    { id: 'loc-3', name: '万达广场高新店', address: '甘肃省兰州市城关区天水北路', lat: 36.0450, lng: 103.8760 },
    { id: 'loc-4', name: '黄河风情线滨河大厦', address: '甘肃省兰州市城关区南滨河东路522号', lat: 36.0650, lng: 103.8320 },
  ]);

  // Handle deleting redundant map location preset
  const handleDeleteMapPreset = (id: string, name: string) => {
    setMapLocationPresets((prev) => prev.filter((item) => item.id !== id));
    if (showToast) showToast(`已删除多余的地图标注点【${name}】🗑️`);
  };

  // Handle deleting previous card location
  const handleDeletePreviousLocation = (id: string, name: string) => {
    setPreviousCardsLocations((prev) => prev.filter((item) => item.id !== id));
    if (showToast) showToast(`已清理历史卡片地点【${name}】🗑️`);
  };

  // Available Invited Friends Data
  const AVAILABLE_FRIENDS_LIST = [
    { id: 'f1', name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', role: '前端架构师' },
    { id: 'f2', name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', role: '产品总监' },
    { id: 'f3', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', role: '视觉设计师' },
    { id: 'f4', name: 'Emily Zhang', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', role: 'AI 交互师' },
    { id: 'f5', name: 'David Chen', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', role: '全栈工程师' },
  ];

  // Real-time ticking for countdown
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Activities Data
  const [activitiesList, setActivitiesList] = useState<CalendarActivityItem[]>([
    {
      id: 'act-1',
      title: 'Stellar 前端架构研讨会',
      type: '技术沙龙',
      category: 'tech',
      categoryColor: '#1877F2',
      categoryIcon: '💻',
      dateStr: '2026-08-17',
      time: '今天 15:30 - 18:00',
      startTime: '15:30',
      endTime: '18:00',
      targetTime: '2026-08-17T15:30:00',
      locationName: 'Stellar 研发实验室·8层研讨厅',
      address: '兰州市城关区高新技术产业开发区创新大厦B座808室',
      lat: 36.0412,
      lng: 103.855,
      distanceKm: 0.8,
      creator: {
        name: 'Alexia (我)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        roleText: '架构发起人',
      },
      friendTransitStatuses: [
        { id: 'f1', name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', status: 'arrived', statusText: '已在会场' },
        { id: 'f2', name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', status: 'on_the_way', statusText: '电梯上升中' },
        { id: 'f3', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', status: 'departed', statusText: '骑行中' },
      ],
      isReminderSet: true,
      advanceMinutes: 30,
      description: '全屏手记交互重构、地图自定义 Popover 与多维度活动排期数据对接。',
      subTasks: [
        { id: 'st1', text: '完成 Leaflet Popover 直角线框重构', completed: true },
        { id: 'st2', text: '打通日历排期与文档手记双向互联', completed: true },
        { id: 'st3', text: '联调密友实时交通雷达状态广播', completed: false },
      ],
      weatherInfo: {
        icon: '☀️',
        temp: '26°C',
        condition: '晴朗',
      },
    },
    {
      id: 'act-2',
      title: '阿那亚日落看护与音乐特辑',
      type: '艺术聚会',
      category: 'art',
      categoryColor: '#8B5CF6',
      categoryIcon: '🎵',
      dateStr: '2026-08-17',
      time: '今天 19:00 - 21:30',
      startTime: '19:00',
      endTime: '21:30',
      targetTime: '2026-08-17T19:00:00',
      locationName: '阿那亚海边礼堂前广场',
      address: '河北省秦皇岛市昌黎县黄金海岸',
      lat: 39.6382,
      lng: 119.3211,
      distanceKm: 2.4,
      creator: {
        name: 'Emily Zhang',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        roleText: '活动主理人',
      },
      friendTransitStatuses: [
        { id: 'f4', name: 'Emily Zhang', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', status: 'arrived', statusText: '已在现场试音' },
        { id: 'f5', name: 'David Lin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150', status: 'on_the_way', statusText: '驾车前往' },
      ],
      isReminderSet: true,
      advanceMinutes: 30,
      description: '日落时分看护组聚会，提供现场实时声浪同步与心率健康监测。',
      subTasks: [
        { id: 'st4', text: '准备现场声学采集设备', completed: true },
        { id: 'st5', text: '同步心率健康预警通道', completed: false },
      ],
      weatherInfo: {
        icon: '⛅',
        temp: '23°C',
        condition: '海风',
      },
    },
    {
      id: 'act-3',
      title: '东方红广场精品手冲咖啡品鉴',
      type: '休闲生活',
      category: 'lifestyle',
      categoryColor: '#F59E0B',
      categoryIcon: '☕',
      dateStr: '2026-08-18',
      time: '明天 10:00 - 12:00',
      startTime: '10:00',
      endTime: '12:00',
      targetTime: '2026-08-18T10:00:00',
      locationName: '东方红广场·三里屯咖啡角',
      address: '甘肃省兰州市城关区广场南路101号',
      lat: 36.0594,
      lng: 103.8263,
      distanceKm: 0.1,
      creator: {
        name: 'Sarah Jenkins',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        roleText: '咖啡师',
      },
      friendTransitStatuses: [
        { id: 'f1', name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', status: 'preparing', statusText: '准备咖啡豆' },
      ],
      isReminderSet: false,
      advanceMinutes: 15,
      description: '邀请极客密友与看护组共品埃塞俄比亚瑰夏咖啡。',
      subTasks: [
        { id: 'st6', text: '挑选浅烘瑰夏豆豆单', completed: true },
      ],
      weatherInfo: {
        icon: '🌤️',
        temp: '22°C',
        condition: '多云',
      },
    },
    {
      id: 'act-4',
      title: '黄河风情线傍晚公路骑行',
      type: '户外运动',
      category: 'sports',
      categoryColor: '#10B981',
      categoryIcon: '🚴',
      dateStr: '2026-08-19',
      time: '周三 18:00 - 20:30',
      startTime: '18:00',
      endTime: '20:30',
      targetTime: '2026-08-19T18:00:00',
      locationName: '中山桥北岸骑行绿道驿站',
      address: '兰州市安宁区北滨河中路520号',
      lat: 36.0645,
      lng: 103.8162,
      distanceKm: 3.2,
      creator: {
        name: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        roleText: '骑行领队',
      },
      friendTransitStatuses: [
        { id: 'f3', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', status: 'preparing', statusText: '检查车况' },
      ],
      isReminderSet: true,
      advanceMinutes: 30,
      description: '沿黄河风情线 18km 休闲骑行，佩戴 Stellar 实时定位与组队雷达。',
      subTasks: [
        { id: 'st7', text: '提前充满骑行码表与车灯', completed: false },
        { id: 'st8', text: '开启组队轨迹共享', completed: false },
      ],
      weatherInfo: {
        icon: '🌅',
        temp: '25°C',
        condition: '微风',
      },
    },
    {
      id: 'act-5',
      title: '季度团队 OKR 评审与复盘会',
      type: '团队协作',
      category: 'work',
      categoryColor: '#3B82F6',
      categoryIcon: '💼',
      dateStr: '2026-08-21',
      time: '周五 14:00 - 16:30',
      startTime: '14:00',
      endTime: '16:30',
      targetTime: '2026-08-21T14:00:00',
      locationName: '创新大厦 12F 视频会议中心',
      address: '兰州市城关区高新技术产业开发区创新大厦A座1201',
      lat: 36.0415,
      lng: 103.856,
      distanceKm: 0.8,
      creator: {
        name: 'Alexia (我)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        roleText: '项目负责人',
      },
      friendTransitStatuses: [
        { id: 'f2', name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', status: 'preparing', statusText: '整理大屏' },
        { id: 'f1', name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', status: 'preparing', statusText: '准备文稿' },
      ],
      isReminderSet: true,
      advanceMinutes: 15,
      description: 'Q3 核心研发指标推进复盘与架构技术债消除讨论。',
      subTasks: [
        { id: 'st9', text: '导出各模块性能评测对比图', completed: true },
      ],
      weatherInfo: {
        icon: '🌤️',
        temp: '24°C',
        condition: '晴',
      },
    },
    {
      id: 'act-6',
      title: 'Pocket Cal 日历发布',
      type: '技术沙龙',
      category: 'tech',
      categoryColor: '#1877F2',
      categoryIcon: '🚀',
      dateStr: '2026-08-01',
      time: '10:00 - 11:30',
      startTime: '10:00',
      endTime: '11:30',
      targetTime: '2026-08-01T10:00:00',
      locationName: 'Stellar 主会议厅',
      address: '创新大厦8层',
      lat: 36.0412,
      lng: 103.855,
      distanceKm: 0.8,
      creator: { name: 'Alexia (我)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', roleText: '发布者' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 15,
      description: 'Pocket Cal 极简线框日历排期模块全面上线。',
    },
    {
      id: 'act-7',
      title: '晨间漫步灵感收集',
      type: '休闲生活',
      category: 'lifestyle',
      categoryColor: '#F59E0B',
      categoryIcon: '🚶',
      dateStr: '2026-08-04',
      time: '08:00 - 09:00',
      startTime: '08:00',
      endTime: '09:00',
      targetTime: '2026-08-04T08:00:00',
      locationName: '五泉山公园南门',
      address: '兰州市城关区五泉南路',
      lat: 36.035,
      lng: 103.83,
      distanceKm: 1.5,
      creator: { name: 'Alexia (我)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', roleText: '发起人' },
      friendTransitStatuses: [],
      isReminderSet: false,
      advanceMinutes: 15,
      description: '晨间徒步思考产品交互细节。',
    },
    {
      id: 'act-8',
      title: '极客晨读研讨',
      type: '技术沙龙',
      category: 'tech',
      categoryColor: '#1877F2',
      categoryIcon: '📖',
      dateStr: '2026-08-04',
      time: '09:30 - 10:30',
      startTime: '09:30',
      endTime: '10:30',
      targetTime: '2026-08-04T09:30:00',
      locationName: '创新大厦咖啡厅',
      address: '城关区创新大厦1层',
      lat: 36.0412,
      lng: 103.855,
      distanceKm: 0.8,
      creator: { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', roleText: '领读者' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 15,
      description: '精读分布式系统与端侧协同论文。',
    },
    {
      id: 'act-9',
      title: '界面组件联调',
      type: '团队协作',
      category: 'work',
      categoryColor: '#3B82F6',
      categoryIcon: '💻',
      dateStr: '2026-08-05',
      time: '14:00 - 17:00',
      startTime: '14:00',
      endTime: '17:00',
      targetTime: '2026-08-05T14:00:00',
      locationName: '7F 开放工位',
      address: '创新大厦7层',
      lat: 36.0412,
      lng: 103.855,
      distanceKm: 0.8,
      creator: { name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', roleText: '负责人' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 30,
      description: '优化日历线框样式与动画过渡。',
    },
    {
      id: 'act-10',
      title: '密友周例会',
      type: '团队协作',
      category: 'work',
      categoryColor: '#3B82F6',
      categoryIcon: '👥',
      dateStr: '2026-08-06',
      time: '10:00 - 11:00',
      startTime: '10:00',
      endTime: '11:00',
      targetTime: '2026-08-06T10:00:00',
      locationName: '云端会议室',
      address: '在线视频会议',
      lat: 36.0412,
      lng: 103.855,
      distanceKm: 0,
      creator: { name: 'Alexia (我)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', roleText: '主持人' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 10,
      description: '同步各看护群与活动群周报。',
    },
    {
      id: 'act-11',
      title: '模块性能压测',
      type: '技术沙龙',
      category: 'tech',
      categoryColor: '#1877F2',
      categoryIcon: '⚡',
      dateStr: '2026-08-08',
      time: '15:00 - 17:30',
      startTime: '15:00',
      endTime: '17:30',
      targetTime: '2026-08-08T15:00:00',
      locationName: '服务器机房',
      address: '创新大厦B座B1层',
      lat: 36.0412,
      lng: 103.855,
      distanceKm: 0.8,
      creator: { name: 'David Chen', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', roleText: '压测专员' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 20,
      description: '完成千万级轨迹与点位高并发渲染压测。',
    },
    {
      id: 'act-12',
      title: '滨河公路长跑',
      type: '户外运动',
      category: 'sports',
      categoryColor: '#10B981',
      categoryIcon: '🏃',
      dateStr: '2026-08-09',
      time: '07:00 - 08:30',
      startTime: '07:00',
      endTime: '08:30',
      targetTime: '2026-08-09T07:00:00',
      locationName: '南滨河东路绿道',
      address: '城关区南滨河东路',
      lat: 36.065,
      lng: 103.832,
      distanceKm: 1.2,
      creator: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', roleText: '领跑员' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 30,
      description: '10公里耐力慢跑训练。',
    },
    {
      id: 'act-13',
      title: 'AI 自动化调度',
      type: '技术沙龙',
      category: 'tech',
      categoryColor: '#1877F2',
      categoryIcon: '🤖',
      dateStr: '2026-08-10',
      time: '11:00 - 12:00',
      startTime: '11:00',
      endTime: '12:00',
      targetTime: '2026-08-10T11:00:00',
      locationName: 'AI 算法实验室',
      address: '创新大厦902室',
      lat: 36.0412,
      lng: 103.855,
      distanceKm: 0.8,
      creator: { name: 'Emily Zhang', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', roleText: '研究员' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 15,
      description: '接入日程智能识别与冲突预警系统。',
    },
    {
      id: 'act-14',
      title: '官网静态部署',
      type: '技术沙龙',
      category: 'tech',
      categoryColor: '#1877F2',
      categoryIcon: '🌐',
      dateStr: '2026-08-12',
      time: '14:00 - 15:30',
      startTime: '14:00',
      endTime: '15:30',
      targetTime: '2026-08-12T14:00:00',
      locationName: '研发工作站',
      address: '创新大厦808',
      lat: 36.0412,
      lng: 103.855,
      distanceKm: 0.8,
      creator: { name: 'Alexia (我)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', roleText: '负责人' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 15,
      description: '完成全球 CDN 静态加速与 SSR 预热。',
    },
    {
      id: 'act-15',
      title: '修复导航栏与贴合',
      type: '技术沙龙',
      category: 'tech',
      categoryColor: '#1877F2',
      categoryIcon: '🛠️',
      dateStr: '2026-08-13',
      time: '16:00 - 17:30',
      startTime: '16:00',
      endTime: '17:30',
      targetTime: '2026-08-13T16:00:00',
      locationName: '前端研讨区',
      address: '创新大厦8层',
      lat: 36.0412,
      lng: 103.855,
      distanceKm: 0.8,
      creator: { name: 'Alexia (我)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', roleText: '工程师' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 15,
      description: '完成底部操作盘贴合与对讲凸起按钮优化。',
    },
    {
      id: 'act-16',
      title: '品牌视觉交付',
      type: '艺术聚会',
      category: 'art',
      categoryColor: '#8B5CF6',
      categoryIcon: '🎨',
      dateStr: '2026-08-14',
      time: '10:30 - 12:00',
      startTime: '10:30',
      endTime: '12:00',
      targetTime: '2026-08-14T10:30:00',
      locationName: '设计工坊',
      address: '创新大厦5层',
      lat: 36.0412,
      lng: 103.855,
      distanceKm: 0.8,
      creator: { name: 'Emily Zhang', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', roleText: '视觉主管' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 15,
      description: '交付 Facebook 经典蓝白直角设计规范资产包。',
    },
    {
      id: 'act-17',
      title: '户外徒步与星空观测',
      type: '户外运动',
      category: 'sports',
      categoryColor: '#10B981',
      categoryIcon: '⛺',
      dateStr: '2026-08-15',
      time: '17:00 - 22:00',
      startTime: '17:00',
      endTime: '22:00',
      targetTime: '2026-08-15T17:00:00',
      locationName: '兴隆山国家森林公园',
      address: '兰州市榆中县兴隆山',
      lat: 35.795,
      lng: 104.045,
      distanceKm: 35.0,
      creator: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', roleText: '向导' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 60,
      description: '夏夜星空观测与山野露营。',
    },
    {
      id: 'act-18',
      title: '采购实验器材',
      type: '休闲生活',
      category: 'lifestyle',
      categoryColor: '#F59E0B',
      categoryIcon: '🛍️',
      dateStr: '2026-08-16',
      time: '13:00 - 15:00',
      startTime: '13:00',
      endTime: '15:00',
      targetTime: '2026-08-16T13:00:00',
      locationName: '兰州中心数码城',
      address: '七里河区西津东路1号',
      lat: 36.061,
      lng: 103.821,
      distanceKm: 3.5,
      creator: { name: 'David Chen', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', roleText: '采购员' },
      friendTransitStatuses: [],
      isReminderSet: false,
      advanceMinutes: 30,
      description: '选购现场声学传感器与对讲耳机。',
    },
    {
      id: 'act-19',
      title: '移动端适配验收',
      type: '技术沙龙',
      category: 'tech',
      categoryColor: '#1877F2',
      categoryIcon: '📱',
      dateStr: '2026-08-24',
      time: '15:00 - 16:30',
      startTime: '15:00',
      endTime: '16:30',
      targetTime: '2026-08-24T15:00:00',
      locationName: '移动测试实验室',
      address: '创新大厦8层',
      lat: 36.0412,
      lng: 103.855,
      distanceKm: 0.8,
      creator: { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', roleText: '测试主管' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 15,
      description: '针对 iPhone 17 Pro Plus 及全尺寸屏幕真机适配测试。',
    },
    {
      id: 'act-20',
      title: '团队露营篝火夜',
      type: '户外运动',
      category: 'sports',
      categoryColor: '#10B981',
      categoryIcon: '🔥',
      dateStr: '2026-08-28',
      time: '18:00 - 22:00',
      startTime: '18:00',
      endTime: '22:00',
      targetTime: '2026-08-28T18:00:00',
      locationName: '仁寿山露营基地',
      address: '安宁区安宁西路',
      lat: 36.105,
      lng: 103.705,
      distanceKm: 12.0,
      creator: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', roleText: '领队' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 60,
      description: '月底团队户外放松与星空音乐派对。',
    },
    {
      id: 'act-21',
      title: '月度技术沙龙与总结',
      type: '技术沙龙',
      category: 'tech',
      categoryColor: '#1877F2',
      categoryIcon: '💡',
      dateStr: '2026-08-30',
      time: '14:30 - 17:00',
      startTime: '14:30',
      endTime: '17:00',
      targetTime: '2026-08-30T14:30:00',
      locationName: '创新大厦 808 厅',
      address: '创新大厦8层',
      lat: 36.0412,
      lng: 103.855,
      distanceKm: 0.8,
      creator: { name: 'Alexia (我)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', roleText: '架构师' },
      friendTransitStatuses: [],
      isReminderSet: true,
      advanceMinutes: 30,
      description: '回顾全月核心产品迭代与下月规划。',
    },
  ]);

  // Sync published activities from ActivityCreationModal
  useEffect(() => {
    if (publishedActivities && publishedActivities.length > 0) {
      const converted: CalendarActivityItem[] = publishedActivities.map((act, idx) => {
        const cat: 'tech' | 'art' | 'lifestyle' | 'sports' | 'work' =
          act.majorType === 'SPORTS' ? 'sports' : act.majorType === 'TRAVEL' ? 'lifestyle' : act.majorType === 'CULTURE' ? 'art' : 'lifestyle';
        const catColor = cat === 'sports' ? '#10B981' : cat === 'lifestyle' ? '#F59E0B' : '#8B5CF6';
        const icon = act.subType === 'CYCLING' ? '🚴‍♂️' : act.subType === 'RUNNING' ? '🏃‍♂️' : act.subType === 'CAMPING' ? '⛺️' : '🔥';
        
        return {
          id: act.id || `user-cal-act-${act.title || 'act'}-${idx}`,
          title: act.title || '同城活动',
          type: '同城社群',
          category: cat,
          categoryColor: catColor,
          categoryIcon: icon,
          dateStr: /^\d{4}-\d{2}-\d{2}/.test(act.startTime || '') ? act.startTime.slice(0,10) : todayKey,
          time: `${act.startTime || '今天 15:00'} - ${act.endTime || '18:00'}`,
          startTime: act.startTime || '15:00',
          endTime: act.endTime || '18:00',
          targetTime: /^\d{4}-\d{2}-\d{2}/.test(act.startTime || '') ? act.startTime : `${todayKey}T${act.startTime || '15:00'}:00+08:00`,
          locationName: act.startPoint || '东方红广场',
          address: act.startPoint || '东方红广场',
          lat: act.lat ?? 36.0620,
          lng: act.lng ?? 103.8080,
          distanceKm: 0.5,
          creator: {
            name: 'Alexia (我)',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
            roleText: '发起人',
            verified: true,
          },
          friendTransitStatuses: [
            { id: 'fs1', name: 'Alexia (我)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', status: 'arrived', statusText: '已到达' },
            { id: 'fs2', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', status: 'on_the_way', statusText: '赶往中 · 约10分' }
          ],
          isReminderSet: true,
          advanceMinutes: 30,
          description: act.description || '快来加入我们一起活动！',
          subTasks: (act.itineraryNodes || []).map((n) => ({
            id: n.id,
            text: `[Day ${n.day} ${n.time}] ${n.title}`,
            completed: false
          }))
        };
      });

      setActivitiesList((prev) => {
        const existingIds = new Set(converted.map((c) => c.id));
        const filteredPrev = (prev || []).filter((p) => !existingIds.has(p.id));
        return [...converted, ...filteredPrev];
      });

      if (converted.length > 0) {
        setSelectedActivityId(converted[0].id);
      }
    }
  }, [publishedActivities]);

  const syncedScheduleIds = useRef(new Set<string>());
  useEffect(() => {
    if (!focusDate) return;
    const date = new Date(`${focusDate}T12:00:00+08:00`);
    setCalendarYear(date.getFullYear());
    setCalendarMonth(date.getMonth() + 1);
    setSelectedDateFilter(focusDate);
  }, [focusDate]);

  // Sync user created schedules into CalendarView list
  useEffect(() => {
    {
      const convertedScheds: CalendarActivityItem[] = schedules.filter(sched => sched.status !== 'cancelled').map((sched) => {
        const parts = scheduleDateParts(sched);
        const isFlight = sched.type === 'flight' && !!sched.flight;
        const fl = sched.flight;
        const title = isFlight ? `✈️ 航班 ${fl!.flightNumber} (${fl!.departureAirport.split('国际')[0]} → ${fl!.arrivalAirport.split('国际')[0]})` : `${sched.icon || '📌'} ${sched.title}`;

        return {
          id: sched.id,
          title,
          type: isFlight ? '航班行程' : '个人日程',
          category: isFlight ? 'work' : 'lifestyle',
          categoryColor: sched.color || '#1877F2',
          categoryIcon: sched.icon || '📅',
          dateStr: parts.date,
          time: `${parts.start} - ${parts.end}`,
          startTime: parts.start,
          endTime: parts.end,
          targetTime: sched.startAt,
          locationName: sched.location.name,
          address: sched.location.address || sched.location.name,
          lat: sched.location.latitude,
          lng: sched.location.longitude,
          distanceKm: 0.5,
          creator: {
            name: 'Alexia (我)',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
            roleText: '日程发起人',
          },
          friendTransitStatuses: [
            { id: 'me', name: 'Alexia (我)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', status: 'arrived', statusText: isFlight ? `航班状态: ${fl!.statusText}` : '已确认日程' },
          ],
          isReminderSet: sched.reminder?.enabled ?? sched.reminders.length > 0,
          advanceMinutes: sched.reminder?.advanceMinutes ?? sched.reminders[0] ?? 30,
          description: sched.description || sched.note || (isFlight ? `航班号: ${fl!.flightNumber} | 登机口: ${fl!.departureGate || '待定'}` : '个人日常规划与出行日程。'),
        };
      });

      setActivitiesList((prev) => {
        const filteredPrev = (prev || []).filter((p) => !syncedScheduleIds.current.has(p.id));
        syncedScheduleIds.current = new Set(convertedScheds.map(s => s.id));
        return [...convertedScheds, ...filteredPrev];
      });
    }
  }, [schedules]);

  // Joined Map
  const [isJoinedMap, setIsJoinedMap] = useState<Record<string, boolean>>({
    'act-1': true,
    'act-2': true,
    'act-3': false,
    'act-4': true,
    'act-5': true,
  });

  // Reminders Map
  const [reminders, setReminders] = useState<Record<string, boolean>>({
    'act-1': true,
    'act-2': true,
    'act-3': false,
    'act-4': true,
    'act-5': true,
  });

  // Advance Minutes
  const [advanceMinutesMap, setAdvanceMinutesMap] = useState<Record<string, number>>({
    'act-1': 30,
    'act-2': 30,
    'act-3': 15,
    'act-4': 30,
    'act-5': 15,
  });

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarMonth(1);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date(`${dateKey()}T12:00:00+08:00`);
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth() + 1);
    setSelectedDateFilter(dateKey());
    setSelectedActivityId('act-1');
    if (showToast) showToast('已快速定位到今天 📅');
  };

  // Activities for the specifically selected date
  const dateSpecificActivities = selectedDateFilter
    ? (activitiesList || []).filter((a) => a.dateStr === selectedDateFilter)
    : (activitiesList || []);

  const activeActivity = selectedDateFilter
    ? (dateSpecificActivities.find((a) => a.id === selectedActivityId) || dateSpecificActivities[0] || null)
    : ((activitiesList || []).find((a) => a.id === selectedActivityId) || activitiesList[0] || null);

  // Countdown calculations
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  if (activeActivity) {
    const targetDate = new Date(activeActivity.targetTime);
    let diffMs = targetDate.getTime() - currentTime.getTime();
    if (diffMs <= 0) diffMs = 3600000 * 2.5; // fallback positive countdown
    hours = Math.floor(diffMs / (1000 * 60 * 60));
    minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  }

  // Toggle Sub-task completion
  const handleToggleSubTask = (activityId: string, taskId: string) => {
    setActivitiesList((prev) =>
      prev.map((act) => {
        if (act.id === activityId && act.subTasks) {
          return {
            ...act,
            subTasks: act.subTasks.map((st) =>
              st.id === taskId ? { ...st, completed: !st.completed } : st
            ),
          };
        }
        return act;
      })
    );
    if (showToast) showToast('已更新手记任务状态 ✓');
  };

  // Toggle Reminder
  const toggleReminder = (id: string) => {
    setReminders((prev) => {
      const next = !prev[id];
      if (showToast) showToast(next ? '⏰ 闹铃提醒已开启' : '🔕 闹铃已关闭');
      if (next && onAddNotification) {
        const act = activitiesList.find((a) => a.id === id);
        if (act) {
          onAddNotification({
            id: `cal-notif-${Date.now()}`,
            title: `【活动闹铃】${act.title}`,
            content: `由 ${act.creator.name} 发起的日程将于 ${act.startTime} 开始，地点：${act.locationName}`,
            time: '刚刚',
            type: 'radar',
            read: false,
          });
        }
      }
      return { ...prev, [id]: next };
    });
  };

  const setAdvanceMinutes = (id: string, mins: number) => {
    setAdvanceMinutesMap((prev) => ({ ...prev, [id]: mins }));
    if (showToast) showToast(`已设置提前 ${mins} 分钟闹铃提醒 ⏱️`);
  };

  // Quick Preset Add Schedule
  const handleQuickAddEvent = (titleOverride?: string) => {
    const finalTitle = (titleOverride || quickTitle).trim();
    if (!finalTitle) {
      if (showToast) showToast('请输入日程名称 ✍️');
      return;
    }

    const categoryIcons: Record<string, string> = {
      tech: '💻',
      art: '🎵',
      lifestyle: '☕',
      sports: '🚴',
      work: '💼',
    };

    const categoryColors: Record<string, string> = {
      tech: '#1877F2',
      art: '#8B5CF6',
      lifestyle: '#F59E0B',
      sports: '#10B981',
      work: '#3B82F6',
    };

    const categoryLabels: Record<string, string> = {
      tech: '技术研讨',
      art: '艺术聚会',
      lifestyle: '休闲生活',
      sports: '运动健身',
      work: '团队协作',
    };

    const targetDate = selectedDateFilter || todayKey;
    const newAct: CalendarActivityItem = {
      id: `act-${Date.now()}`,
      title: finalTitle,
      type: categoryLabels[quickCategory] || '团队活动',
      category: quickCategory,
      categoryColor: categoryColors[quickCategory] || '#1877F2',
      categoryIcon: categoryIcons[quickCategory] || '📌',
      dateStr: targetDate,
      time: `${targetDate === todayKey ? '今天 ' : ''}${quickTime} - 结束`,
      startTime: quickTime,
      endTime: '18:00',
      targetTime: `${targetDate}T${quickTime}:00`,
      locationName: quickLocation.trim() || 'Stellar 研发中心',
      address: '甘肃省兰州市城关区高新技术产业开发区',
      lat: 36.0412 + (Math.random() - 0.5) * 0.01,
      lng: 103.855 + (Math.random() - 0.5) * 0.01,
      distanceKm: 0.8,
      creator: {
        name: 'Alexia (我)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        roleText: '活动发起人',
      },
      friendTransitStatuses: [
        {
          id: 'f1',
          name: 'Sarah Jenkins',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
          status: 'preparing',
          statusText: '已受邀',
        },
      ],
      isReminderSet: true,
      advanceMinutes: 15,
      description: '快捷新增的日程排期。',
      subTasks: [
        { id: `st-${Date.now()}-1`, text: '准时参会并携带相关资料', completed: false },
      ],
      weatherInfo: {
        icon: '🌤️',
        temp: '25°C',
        condition: '晴',
      },
    };

    setActivitiesList((prev) => [newAct, ...prev]);
    setIsJoinedMap((prev) => ({ ...prev, [newAct.id]: true }));
    setReminders((prev) => ({ ...prev, [newAct.id]: true }));
    setAdvanceMinutesMap((prev) => ({ ...prev, [newAct.id]: 15 }));
    setSelectedActivityId(newAct.id);
    setQuickTitle('');
    setIsQuickAddOpen(false);
    if (showToast) showToast(`⚡ 已成功将【${finalTitle}】添加到 ${targetDate}！`);
  };

  // Handle clicking on shortcut card -> Opens query confirmation modal ("先询问是否有修改内容")
  const handleShortcutCardClick = (preset: { id: string; label: string; cat: 'tech' | 'art' | 'lifestyle' | 'sports' | 'work' }) => {
    const cleanTitle = preset.label.replace(/^[^\s]+\s*/, '');
    const title = cleanTitle || preset.label;
    setPendingQuickCard({ label: preset.label, title, cat: preset.cat });
    setIsAskQuickAddModalOpen(true);
  };

  // Direct fast add when user confirms no modifications needed
  const handleConfirmDirectAdd = () => {
    if (!pendingQuickCard) return;
    setQuickCategory(pendingQuickCard.cat);
    handleQuickAddEvent(pendingQuickCard.title);
    setIsAskQuickAddModalOpen(false);
    setPendingQuickCard(null);
  };

  // Handle Lightweight Suggested Card Creation ("添加建议卡片内容 · 只填入卡片主题")
  const handleCreateSuggestedCard = () => {
    const title = suggestedCardTitle.trim();
    if (!title) {
      if (showToast) showToast('请填入卡片主题名称！');
      return;
    }

    const catIcons: Record<string, string> = {
      tech: '💻',
      work: '💼',
      lifestyle: '☕',
      sports: '🚴',
      art: '🎵',
    };
    const icon = catIcons[suggestedCardCat] || '💡';
    const cardLabel = `${icon} ${title}`;

    // 1. Add to shortcut cards bar if not already present
    setShortcutCards((prev) => {
      if (prev.some((c) => c.label === cardLabel)) return prev;
      return [...prev, { id: `sc-${Date.now()}`, label: cardLabel, cat: suggestedCardCat }];
    });

    // 2. Add as schedule to the currently selected date
    handleQuickAddEvent(title);

    // 3. Close & Reset
    setSuggestedCardTitle('');
    setIsAddSuggestedCardModalOpen(false);
    if (showToast) showToast(`✨ 已添加建议卡片【${cardLabel}】并快捷排期到 ${selectedDateFilter || '当日'}！`);
  };

  // Open rich card editor when user wants to modify details before adding
  const handleConfirmEditDetailsBeforeAdd = () => {
    if (!pendingQuickCard) return;
    setNewCardTitle(pendingQuickCard.title);
    setNewCardCat(pendingQuickCard.cat);
    setIsAskQuickAddModalOpen(false);
    setIsAddCardModalOpen(true);
  };

  // Save/Create Card with detailed parameters (时间范围、地点、地图标注、邀请参与人员、是否生成地图坐标)
  const handleCreateCustomCard = () => {
    const title = newCardTitle.trim() || '新建活动卡片';
    const catIcons: Record<string, string> = {
      tech: '💻',
      work: '💼',
      lifestyle: '☕',
      sports: '🚴',
      art: '🎵',
    };
    const icon = catIcons[newCardCat] || '🌟';
    const cardLabel = `${icon} ${title}`;

    // 1. Add to shortcut cards list if not present
    const cardExists = shortcutCards.some((sc) => sc.label === cardLabel);
    if (!cardExists) {
      setShortcutCards((prev) => [...prev, { id: `card-${Date.now()}`, label: cardLabel, cat: newCardCat }]);
    }

    // 2. Build invited friends list
    const selectedFriends = AVAILABLE_FRIENDS_LIST.filter((f) => invitedFriendIds.includes(f.id)).map((f) => ({
      id: f.id,
      name: f.name,
      avatar: f.avatar,
      status: 'preparing' as const,
      statusText: '已受邀',
    }));

    if (customFriendInput.trim()) {
      selectedFriends.push({
        id: `custom-${Date.now()}`,
        name: customFriendInput.trim(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        status: 'preparing' as const,
        statusText: '已受邀',
      });
    }

    // 3. Location & Map coords
    const chosenLocPreset = mapLocationPresets[selectedCoordIndex] || mapLocationPresets[0] || { name: '自定义地点', lat: 36.065, lng: 103.832, address: '兰州市城关区' };
    const finalLocationName = cardLocation.trim() || chosenLocPreset.name;
    const finalLat = generateMapCoords ? chosenLocPreset.lat : 0;
    const finalLng = generateMapCoords ? chosenLocPreset.lng : 0;

    // 4. Create Activity Item
    const targetDate = selectedDateFilter || todayKey;
    const categoryColors: Record<string, string> = {
      tech: '#1877F2',
      art: '#8B5CF6',
      lifestyle: '#F59E0B',
      sports: '#10B981',
      work: '#3B82F6',
    };
    const categoryLabels: Record<string, string> = {
      tech: '技术研讨',
      art: '艺术聚会',
      lifestyle: '休闲生活',
      sports: '运动健身',
      work: '团队协作',
    };

    const newAct: CalendarActivityItem = {
      id: `act-${Date.now()}`,
      title: title,
      type: categoryLabels[newCardCat] || '团队活动',
      category: newCardCat,
      categoryColor: categoryColors[newCardCat] || '#1877F2',
      categoryIcon: icon,
      dateStr: targetDate,
      time: `${targetDate === todayKey ? '今天 ' : ''}${cardStartTime} - ${cardEndTime}`,
      startTime: cardStartTime,
      endTime: cardEndTime,
      targetTime: `${targetDate}T${cardStartTime}:00`,
      locationName: finalLocationName,
      address: chosenLocPreset.address,
      lat: finalLat,
      lng: finalLng,
      distanceKm: generateMapCoords ? 1.2 : 0,
      creator: {
        name: 'Alexia (我)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        roleText: '活动发起人',
      },
      friendTransitStatuses: selectedFriends,
      isReminderSet: true,
      advanceMinutes: 30,
      description: `设定时间段: ${cardStartTime} ~ ${cardEndTime}，包含 ${selectedFriends.length} 位受邀人员。`,
      subTasks: [
        { id: `st-${Date.now()}-1`, text: '发送日程提醒给受邀好友', completed: true },
        { id: `st-${Date.now()}-2`, text: '准备会议或活动相关资料', completed: false },
      ],
      weatherInfo: {
        icon: '🌤️',
        temp: '26°C',
        condition: '晴朗',
      },
    };

    setActivitiesList((prev) => [newAct, ...prev]);
    setIsJoinedMap((prev) => ({ ...prev, [newAct.id]: true }));
    setReminders((prev) => ({ ...prev, [newAct.id]: true }));
    setAdvanceMinutesMap((prev) => ({ ...prev, [newAct.id]: 30 }));
    setSelectedActivityId(newAct.id);

    setIsAddCardModalOpen(false);
    setNewCardTitle('');
    setCustomFriendInput('');
    if (showToast) {
      showToast(`⚡ 已完成【${cardLabel}】日程排期创建 (${generateMapCoords ? '含GPS地图坐标' : '纯文本地址'})！`);
    }
  };

  const isReminded = activeActivity ? (reminders[activeActivity.id] ?? true) : false;
  const isJoined = activeActivity ? (isJoinedMap[activeActivity.id] ?? true) : false;
  const activeAdvanceMin = activeActivity ? advanceMinutesMap[activeActivity.id] || 30 : 30;

  // Scroll and swipe handling to auto-fold calendar on scroll up
  const touchStartYRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    if (currentScrollTop > 25) {
      setIsCalendarFolded(true);
    } else if (currentScrollTop <= 5) {
      setIsCalendarFolded(false);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const deltaY = e.touches[0].clientY - touchStartYRef.current;
    if (deltaY < -25) {
      // Swiped up -> shrink to week calendar
      setIsCalendarFolded(true);
      touchStartYRef.current = null;
    } else if (deltaY > 25) {
      // Swiped down -> expand to month calendar if near top
      const currentScrollTop = scrollContainerRef.current?.scrollTop || 0;
      if (currentScrollTop <= 15) {
        setIsCalendarFolded(false);
        touchStartYRef.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
  };

  return (
    <div className="w-full h-full bg-[#F0F2F5] dark:bg-black flex flex-col font-sans select-none overflow-hidden text-[#050505] dark:text-white">
      {/* ========================================================================= */}
      {/* 1. SCROLLABLE CONTAINER: NO SQUISHING, OPTIMIZED SCROLLING                */}
      {/* ========================================================================= */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-y-auto px-2.5 sm:px-3 py-2.5 pb-12 space-y-2.5 custom-scrollbar"
      >
        {/* ======================================================================= */}
        {/* 2. STRAIGHT-EDGE FACEBOOK CALENDAR CARD (POCKET CAL LIST MODE)          */}
        {/* ======================================================================= */}
        <div 
          id="calendar-month-picker-card"
          className="bg-white dark:bg-zinc-950 border border-[#E4E6EB] dark:border-zinc-800 p-2 sm:p-2.5 shadow-2xs space-y-2 rounded-md transition-all duration-300"
        >
          {/* Month Header Controller & Quick Controls */}
          <div className="flex items-center justify-between border-b border-[#E4E6EB] dark:border-zinc-800 pb-1.5">
            <div className="flex items-center space-x-1 shrink-0">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-11 h-11 bg-[#F0F2F5] dark:bg-zinc-900 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 flex items-center justify-center text-[#1877F2] cursor-pointer active:scale-95 rounded-md shrink-0"
                  title="返回上一页"
                  aria-label="返回"
                >
                  <ArrowLeft size={18} strokeWidth={2.5} />
                </button>
              )}
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-11 h-11 bg-[#F0F2F5] hover:bg-[#E4E6EB] border border-[#E4E6EB] flex items-center justify-center text-[#050505] cursor-pointer active:scale-95 rounded-md shrink-0"
                  aria-label="上个月"
                  title="上个月"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="px-1 flex items-baseline space-x-1 shrink-0">
                  <span className="text-xs sm:text-[13px] font-black text-[#050505] tracking-tight whitespace-nowrap">
                    {calendarYear}年 {calendarMonth}月
                  </span>
                  <span className="text-[8px] sm:text-[8.5px] font-bold text-[#65676B] tracking-wider uppercase whitespace-nowrap">
                    {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][calendarMonth - 1]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-11 h-11 bg-[#F0F2F5] hover:bg-[#E4E6EB] border border-[#E4E6EB] flex items-center justify-center text-[#050505] cursor-pointer active:scale-95 rounded-md shrink-0"
                  aria-label="下个月"
                  title="下个月"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Labels Header (Pocket Cal style) */}
          <div className="grid grid-cols-7 gap-1 text-center text-[9.5px] font-black text-[#65676B] dark:text-zinc-400 bg-[#F7F8FA] dark:bg-zinc-900 py-1 border border-[#E4E6EB] dark:border-zinc-800 rounded-md">
            <span>SUN 日</span>
            <span>MON 一</span>
            <span>TUE 二</span>
            <span>WED 三</span>
            <span>THU 四</span>
            <span>FRI 五</span>
            <span>SAT 六</span>
          </div>

          {/* Calendar Grid (Pocket Cal style: Activities in frames with small text & bullets, blank days empty) */}
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              if (isCalendarFolded) {
                // Folded Mode: Render only 7 days of the currently selected week
                const refDate = new Date(selectedDateFilter || `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-17`);
                const dayOfWeek = refDate.getDay();
                const weekCells = [];
                for (let i = 0; i < 7; i++) {
                  const d = new Date(refDate);
                  d.setDate(refDate.getDate() - dayOfWeek + i);
                  const y = d.getFullYear();
                  const m = d.getMonth() + 1;
                  const dayNum = d.getDate();
                  const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const matchedActivities = activitiesList.filter(
                    (a) =>
                      a.dateStr === dateStr &&
                      (!selectedCategoryFilter || selectedCategoryFilter === 'all' || a.category === selectedCategoryFilter)
                  );
                  const hasActivity = matchedActivities.length > 0;
                  const isSelected = selectedDateFilter === dateStr;
                  const isToday = dateStr === todayKey;

                  weekCells.push(
                    <button
                      key={`week-grid-cell-${dateStr}-${dayNum}`}
                      type="button"
                      aria-label={`${dateStr}，${matchedActivities.length}个日程`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (isSelected && !hasActivity) {
                          handleOpenAddForDate(dateStr);
                        } else {
                          setSelectedDateFilter(dateStr);
                          if (matchedActivities.length > 0) {
                            setSelectedActivityId(matchedActivities[0].id);
                          }
                        }
                      }}
                      className={`h-[48px] p-0.5 sm:p-1 rounded-md border transition-all cursor-pointer flex flex-col justify-between text-left select-none relative group ${
                        isSelected
                          ? 'bg-[#F0F7FF] border-2 border-[#1877F2] ring-2 ring-[#1877F2]/20 shadow-xs'
                          : hasActivity
                          ? 'bg-white border-[#CCD0D5] hover:border-[#1877F2] hover:bg-[#F7F8FA] shadow-2xs'
                          : 'bg-transparent border-transparent hover:border-[#E4E6EB] hover:bg-[#F7F8FA]'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span
                          className={`text-[10px] leading-none ${
                            isSelected
                              ? 'font-black text-[#1877F2]'
                              : hasActivity
                              ? 'font-bold text-[#050505]'
                              : 'font-medium text-[#65676B]'
                          }`}
                        >
                          {dayNum}
                        </span>
                        {isToday && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#1877F2] ring-2 ring-[#1877F2]/20"
                            title={`今天 (${todayKey})`}
                          />
                        )}
                      </div>

                      {hasActivity ? (
                        <div className="w-full flex-1 flex flex-col justify-start gap-0.5 overflow-hidden">
                          {matchedActivities.slice(0, 1).map((act, aIdx) => (
                            <div
                              key={`week-act-${act.id}-${aIdx}`}
                              className="w-full flex items-center space-x-0.5 text-[9px] leading-tight text-[#1C1E21] truncate font-medium"
                              title={act.title}
                            >
                              <span
                                style={{ color: act.categoryColor || '#1877F2' }}
                                className="text-[7px] font-black shrink-0 leading-none"
                              >
                                ▪
                              </span>
                              <span className="truncate">
                                {act.title.replace(/^(Stellar|季度团队|阿那亚|黄河风情线|东方红广场|Pocket Cal)\s*/, '') || act.title}
                              </span>
                            </div>
                          ))}
                          {matchedActivities.length > 1 && (
                            <span className="text-[7px] text-[#1877F2] font-black leading-none pl-0.5">
                              +{matchedActivities.length - 1} 更多
                            </span>
                          )}
                        </div>
                      ) : isSelected ? (
                        <div className="w-full flex-1 flex items-center justify-center">
                          <div className="w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-2xs">
                            <Plus size={9} strokeWidth={3} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1" />
                      )}
                    </button>
                  );
                }
                return weekCells;
              }

              // Full Month Mode (Compact height h-[48px])
              const firstDayIndex = new Date(calendarYear, calendarMonth - 1, 1).getDay();
              const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
              const daysInPrevMonth = new Date(calendarYear, calendarMonth - 1, 0).getDate();
              const totalGridCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

              const cells = [];

              // Leading previous month days
              for (let i = 0; i < firstDayIndex; i++) {
                const prevDayNum = daysInPrevMonth - firstDayIndex + 1 + i;
                cells.push(
                  <div
                    key={`prev-month-day-${prevDayNum}-${i}`}
                    className="h-[48px] p-0.5 sm:p-1 rounded-md border border-transparent bg-transparent flex flex-col justify-start text-left select-none opacity-30"
                  >
                    <span className="text-[10px] font-semibold text-[#8A8D91] leading-none">
                      {prevDayNum}
                    </span>
                  </div>
                );
              }

              // Current month days
              for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const matchedActivities = activitiesList.filter(
                  (a) =>
                    a.dateStr === dateStr &&
                    (!selectedCategoryFilter || selectedCategoryFilter === 'all' || a.category === selectedCategoryFilter)
                );
                const hasActivity = matchedActivities.length > 0;
                const isSelected = selectedDateFilter === dateStr;
                const isToday = dateStr === todayKey;

                cells.push(
                  <button
                    key={`cal-grid-cell-${dateStr}-${dayNum}`}
                    type="button"
                    aria-label={`${dateStr}，${matchedActivities.length}个日程`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      if (isSelected && !hasActivity) {
                        handleOpenAddForDate(dateStr);
                      } else {
                        setSelectedDateFilter(dateStr);
                        if (matchedActivities.length > 0) {
                          setSelectedActivityId(matchedActivities[0].id);
                        }
                      }
                    }}
                    className={`h-[48px] p-0.5 sm:p-1 rounded-md border transition-all cursor-pointer flex flex-col justify-between text-left select-none relative group ${
                      isSelected
                        ? 'bg-[#F0F7FF] border-2 border-[#1877F2] ring-2 ring-[#1877F2]/20 shadow-xs'
                        : hasActivity
                        ? 'bg-white border-[#CCD0D5] hover:border-[#1877F2] hover:bg-[#F7F8FA] shadow-2xs'
                        : 'bg-transparent border-transparent hover:border-[#E4E6EB] hover:bg-[#F7F8FA]'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="w-full flex items-center justify-between">
                      <span
                        className={`text-[10px] leading-none ${
                          isSelected
                            ? 'font-black text-[#1877F2]'
                            : hasActivity
                            ? 'font-bold text-[#050505]'
                            : 'font-medium text-[#65676B]'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {isToday && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#1877F2] ring-2 ring-[#1877F2]/20"
                          title={`今天 (${todayKey})`}
                        />
                      )}
                    </div>

                    {/* Activities List or Blank Day Center Plus */}
                    {hasActivity ? (
                      <div className="w-full flex-1 flex flex-col justify-start gap-0.5 overflow-hidden">
                        {matchedActivities.slice(0, 1).map((act, aIdx) => (
                          <div
                            key={`grid-act-${act.id}-${aIdx}`}
                            className="w-full flex items-center space-x-0.5 text-[9px] leading-tight text-[#1C1E21] truncate font-medium"
                            title={act.title}
                          >
                            <span
                              style={{ color: act.categoryColor || '#1877F2' }}
                              className="text-[7px] font-black shrink-0 leading-none"
                            >
                              ▪
                            </span>
                            <span className="truncate">
                              {act.title.replace(/^(Stellar|季度团队|阿那亚|黄河风情线|东方红广场|Pocket Cal)\s*/, '') || act.title}
                            </span>
                          </div>
                        ))}
                        {matchedActivities.length > 1 && (
                          <span className="text-[7px] text-[#1877F2] font-black leading-none pl-0.5">
                            +{matchedActivities.length - 1} 更多
                          </span>
                        )}
                      </div>
                    ) : isSelected ? (
                      <div className="w-full flex-1 flex items-center justify-center">
                        <div 
                          className="w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-2xs group-hover:scale-110 active:scale-95 transition-transform"
                          title="再次点击进入日历添加操作"
                        >
                          <Plus size={9} strokeWidth={3} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1" />
                    )}
                  </button>
                );
              }

              // Trailing next month days
              const currentFilled = firstDayIndex + daysInMonth;
              for (let i = currentFilled; i < totalGridCells; i++) {
                const nextDayNum = i - currentFilled + 1;
                cells.push(
                  <div
                    key={`next-month-day-${nextDayNum}-${i}`}
                    className="h-[48px] p-0.5 sm:p-1 rounded-md border border-transparent bg-transparent flex flex-col justify-start text-left select-none opacity-30"
                  >
                    <span className="text-[10px] font-semibold text-[#8A8D91] leading-none">
                      {nextDayNum}
                    </span>
                  </div>
                );
              }

              return cells;
            })()}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 4. COMPACT, COMPRESSED & HIGH-DENSITY ACTIVITY DETAIL CARD              */}
        {/* ======================================================================= */}
        {activeActivity ? (
          <div 
            id="activity-detail-card-frame"
            className="bg-white dark:bg-zinc-950 border border-[#E4E6EB] dark:border-zinc-800 p-2.5 shadow-2xs space-y-2 rounded-none"
          >
            {/* Row 1: Header - Title, Type Tag, Weather, Creator */}
            <div className="flex items-center justify-between border-b border-[#E4E6EB] dark:border-zinc-800 pb-2">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-none bg-[#E7F3FF] dark:bg-blue-950/60 text-[#1877F2] flex items-center justify-center text-sm shrink-0 border border-[#1877F2]/30 shadow-2xs">
                  {activeActivity.categoryIcon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="text-xs sm:text-[13px] font-black text-[#050505] dark:text-white truncate">
                      {activeActivity.title}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 bg-[#E7F3FF] dark:bg-blue-950/60 text-[#1877F2] font-bold border border-[#1877F2]/30 shrink-0">
                      {activeActivity.type}
                    </span>
                  </div>
                  <div className="text-[9.5px] text-[#65676B] dark:text-zinc-400 flex items-center space-x-1.5 mt-0.5">
                    <span className="font-semibold text-[#050505] dark:text-zinc-300">📅 {activeActivity.time}</span>
                    {activeActivity.weatherInfo && (
                      <span className="text-[9px] text-[#65676B] dark:text-zinc-400 bg-[#F0F2F5] dark:bg-zinc-900 px-1 border border-[#E4E6EB] dark:border-zinc-800">
                        {activeActivity.weatherInfo.icon} {activeActivity.weatherInfo.temp}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Creator Chip */}
              <div className="flex items-center space-x-1 shrink-0 bg-[#F0F2F5] border border-[#E4E6EB] px-1.5 py-0.5">
                <img
                  src={activeActivity.creator.avatar}
                  alt={activeActivity.creator.name}
                  className="w-4 h-4 rounded-none object-cover border border-[#E4E6EB]"
                />
                <span className="text-[9.5px] font-bold text-[#050505] max-w-[65px] truncate">
                  {activeActivity.creator.name}
                </span>
              </div>
            </div>

            {/* Row 2: Two-Column Compact Grid (Countdown Ribbon + Location Navigation) */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* Left Column: Countdown & Alarm Bar */}
              <div className="p-1.5 bg-[#F7F8FA] border border-[#E4E6EB] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Clock size={11} className="text-amber-600" />
                    <span className="text-[9px] font-bold text-[#65676B]">倒计时</span>
                  </div>
                  <span className="font-mono text-xs font-black text-[#050505] tracking-wide">
                    {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#E4E6EB]">
                  <span className="text-[8.5px] text-[#65676B]">提前闹铃:</span>
                  <div className="flex items-center space-x-0.5">
                    {[5, 15, 30].map((mins, mIdx) => (
                      <button
                        key={`adv-min-${mins}-${mIdx}`}
                        type="button"
                        onClick={() => setAdvanceMinutes(activeActivity.id, mins)}
                        className={`px-1 py-0.2 text-[8.5px] font-bold transition-all cursor-pointer border ${
                          activeAdvanceMin === mins
                            ? 'bg-[#1877F2] text-white border-[#1877F2]'
                            : 'bg-white text-[#65676B] border-[#E4E6EB] hover:border-[#1877F2]'
                        }`}
                      >
                        {mins}分
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Location & 1-Click Navigation */}
              <div 
                id="activity-location-card"
                onClick={() => {
                  if (onNavigateToLocation) {
                    onNavigateToLocation(activeActivity.locationName, activeActivity.lat, activeActivity.lng, schedules.some(s => s.id === activeActivity.id) ? activeActivity.id : undefined);
                  }
                }}
                className="p-1.5 bg-[#F7F8FA] border border-[#E4E6EB] hover:border-[#1877F2] flex flex-col justify-between cursor-pointer group transition-colors"
                title="点击在地图上锁定导航"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 truncate">
                    <MapPin size={11} className="text-rose-600 shrink-0" />
                    <span className="text-[10px] font-bold text-[#050505] truncate group-hover:text-[#1877F2]">
                      {activeActivity.locationName}
                    </span>
                  </div>
                  <Navigation size={10} className="text-[#1877F2] shrink-0" />
                </div>
                <div className="text-[8.5px] text-[#65676B] truncate mt-1 pt-1 border-t border-[#E4E6EB]">
                  距您 {activeActivity.distanceKm}km · {activeActivity.address}
                </div>
              </div>
            </div>

            {/* Row 3: Companion Friends Transit Radar */}
            <div className="p-1.5 bg-[#F7F8FA] border border-[#E4E6EB] space-y-1">
              <div className="flex items-center justify-between text-[9px] font-bold text-[#65676B]">
                <span className="flex items-center space-x-1">
                  <Users size={11} className="text-[#1877F2]" />
                  <span>同行密友交通雷达</span>
                </span>
                <span className="text-[#1877F2] font-semibold">{activeActivity.friendTransitStatuses.length}人在途</span>
              </div>
              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
                {activeActivity.friendTransitStatuses.map((f, fIdx) => (
                  <div
                    key={`transit-${activeActivity.id}-${f.id || fIdx}-${fIdx}`}
                    className="flex items-center space-x-1 bg-white border border-[#E4E6EB] px-1.5 py-0.5 shrink-0"
                  >
                    <img src={f.avatar} alt={f.name} className="w-3.5 h-3.5 rounded-none object-cover border border-[#E4E6EB]" />
                    <span className="text-[9.5px] font-bold text-[#050505]">{f.name}</span>
                    <span className="text-[8.5px] text-[#1877F2] font-semibold">({f.statusText})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 4: Description & Subtasks (Compressed) */}
            <div className="p-1.5 bg-[#F7F8FA] border border-[#E4E6EB] space-y-1.5">
              <div className="flex items-start space-x-1">
                <span className="text-[11px]">📝</span>
                <p className="text-[9.5px] font-medium text-[#050505] leading-normal">
                  {activeActivity.description}
                </p>
              </div>

              {activeActivity.subTasks && activeActivity.subTasks.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-[#E4E6EB]">
                  <div className="flex items-center justify-between text-[9px] font-bold text-[#65676B]">
                    <span>手记要点与备忘</span>
                    <span className="text-[#1877F2]">
                      {(activeActivity.subTasks || []).filter((t) => t.completed).length}/{activeActivity.subTasks.length} 完成
                    </span>
                  </div>
                  <div className="space-y-1">
                    {activeActivity.subTasks.map((task, tIdx) => (
                      <div
                        key={`task-${activeActivity.id}-${task.id || tIdx}-${tIdx}`}
                        onClick={() => handleToggleSubTask(activeActivity.id, task.id)}
                        className="flex items-center space-x-1.5 cursor-pointer bg-white border border-[#E4E6EB] px-1.5 py-1 hover:border-[#1877F2] transition-colors"
                      >
                        {task.completed ? (
                          <CheckSquare size={12} className="text-[#1877F2] shrink-0" />
                        ) : (
                          <Square size={12} className="text-[#65676B] shrink-0" />
                        )}
                        <span
                          className={`text-[9.5px] truncate ${
                            task.completed ? 'line-through text-[#65676B]' : 'text-[#050505] font-medium'
                          }`}
                        >
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Row 5: 5 Compact Straight-Edge Action Buttons */}
            <div className="grid grid-cols-5 gap-1 pt-0.5">
              {/* 1. Join / Enrolled */}
              <button
                type="button"
                id="btn-calendar-join"
                onClick={() => {
                  setIsJoinedMap((prev) => {
                    const next = !prev[activeActivity.id];
                    if (showToast) showToast(next ? '🎉 已成功报名此活动！' : '已取消报名');
                    return { ...prev, [activeActivity.id]: next };
                  });
                }}
                className={`py-1.5 flex flex-col items-center justify-center border text-[9.5px] font-bold cursor-pointer transition-all active:scale-95 ${
                  isJoined
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-[#1877F2] text-white border-[#1877F2]'
                }`}
              >
                <CheckCircle2 size={12} className="mb-0.5 stroke-[2.5]" />
                <span>{isJoined ? '已加入' : '报名'}</span>
              </button>

              {/* 2. Toggle Alarm */}
              <button
                type="button"
                id="btn-calendar-alarm"
                onClick={() => toggleReminder(activeActivity.id)}
                className={`py-1.5 flex flex-col items-center justify-center border text-[9.5px] font-bold cursor-pointer transition-all active:scale-95 ${
                  isReminded
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-[#F0F2F5] text-[#65676B] border-[#E4E6EB]'
                }`}
              >
                <Bell size={12} className="mb-0.5 stroke-[2.5]" />
                <span>{isReminded ? '闹铃开' : '无闹铃'}</span>
              </button>

              {/* 3. Navigate on Map */}
              <button
                type="button"
                id="btn-calendar-navigate"
                onClick={() => {
                  if (onNavigateToLocation) {
                    onNavigateToLocation(activeActivity.locationName, activeActivity.lat, activeActivity.lng, schedules.some(s => s.id === activeActivity.id) ? activeActivity.id : undefined);
                  }
                }}
                className="py-1.5 flex flex-col items-center justify-center bg-white hover:bg-[#E7F3FF] text-[#1877F2] border border-[#E4E6EB] hover:border-[#1877F2] text-[9.5px] font-bold cursor-pointer transition-all active:scale-95"
              >
                <Navigation size={12} className="mb-0.5 stroke-[2.5]" />
                <span>导航</span>
              </button>

              {/* 4. Contact Host */}
              <button
                type="button"
                id="btn-calendar-contact"
                onClick={() => {
                  if (showToast) showToast(`💬 正在连线主理人【${activeActivity.creator.name}】...`);
                }}
                className="py-1.5 flex flex-col items-center justify-center bg-white hover:bg-[#F0F2F5] text-[#8B5CF6] border border-[#E4E6EB] hover:border-[#8B5CF6] text-[9.5px] font-bold cursor-pointer transition-all active:scale-95"
              >
                <MessageCircle size={12} className="mb-0.5 stroke-[2.5]" />
                <span>联系主理</span>
              </button>

              {/* 5. Share Card */}
              <button
                type="button"
                id="btn-calendar-share"
                onClick={() => {
                  if (onShareActivity) {
                    onShareActivity({
                      id: activeActivity.id,
                      title: activeActivity.title,
                      category: activeActivity.category,
                      color: activeActivity.categoryColor,
                      icon: activeActivity.categoryIcon,
                      date: activeActivity.dateStr,
                      startTime: activeActivity.startTime,
                      locationName: activeActivity.locationName,
                      address: activeActivity.address,
                      lat: activeActivity.lat,
                      lng: activeActivity.lng,
                      description: activeActivity.description,
                      participants: activeActivity.friendTransitStatuses.map((f) => ({
                        id: f.id,
                        name: f.name,
                        avatar: f.avatar,
                        status: 'joined',
                      })),
                    });
                  } else {
                    if (showToast) showToast(`🔗 活动【${activeActivity.title}】分享卡片海报已生成并复制！`);
                  }
                }}
                className="py-1.5 flex flex-col items-center justify-center bg-white hover:bg-[#E7F3FF] text-[#1877F2] border border-[#E4E6EB] hover:border-[#1877F2] text-[9.5px] font-bold cursor-pointer transition-all active:scale-95"
              >
                <Share2 size={12} className="mb-0.5 stroke-[2.5]" />
                <span>分享卡片</span>
              </button>
            </div>

            {/* Bottom New Schedule Button when viewing activity detail */}
            <div className="pt-2 border-t border-[#E4E6EB] flex items-center justify-between">
              <span className="text-[10px] text-[#65676B] font-bold flex items-center gap-1">
                <CalendarIcon size={12} className="text-[#1877F2]" />
                <span>目标日期：<strong className="text-[#1877F2]">{selectedDateFilter || todayKey}</strong></span>
              </span>
              <button
                type="button"
                id="btn-calendar-add-schedule-bottom"
                onClick={() => setIsAddCardModalOpen(true)}
                className="px-2.5 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white text-[10.5px] font-bold rounded-none inline-flex items-center space-x-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
              >
                <Plus size={12} strokeWidth={2.5} />
                <span>在该日期新建日程</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-950 border border-[#E4E6EB] dark:border-zinc-800 p-6 shadow-2xs text-center space-y-3 rounded-none">
            <div className="w-10 h-10 bg-[#F0F2F5] dark:bg-zinc-900 text-[#65676B] dark:text-zinc-400 rounded-none flex items-center justify-center mx-auto border border-[#E4E6EB] dark:border-zinc-800">
              <CalendarIcon size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-[#050505] dark:text-white">
                {selectedDateFilter ? `【${selectedDateFilter}】暂无活动内容` : '暂无活动排期'}
              </h4>
              <p className="text-[11px] text-[#65676B] dark:text-zinc-400 max-w-xs mx-auto">
                该日期下尚未安排任何研讨、聚会或活动。您可以点击下方按钮快捷新增日程。
              </p>
            </div>
            <div className="pt-1">
              <button
                type="button"
                id="btn-calendar-add-schedule-empty"
                onClick={() => setIsAddCardModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-none inline-flex items-center space-x-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>在该日期新建日程</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 1. MODAL: QUICK ADD QUERY CONFIRMATION ("快速添加时候，先询问是否有修改内容") */}
      {/* ===================================================================== */}
      {isAskQuickAddModalOpen && pendingQuickCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white border border-[#E4E6EB] w-full max-w-sm p-4 space-y-3.5 shadow-xl rounded-none">
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <h3 className="text-xs font-black text-[#050505] flex items-center gap-1.5">
                <Zap size={15} className="text-[#1877F2]" />
                <span>快捷添加日程确认</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAskQuickAddModalOpen(false)}
                className="text-[#65676B] hover:text-[#050505] p-1 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#F0F2F5] border border-[#E4E6EB] space-y-1.5">
                <div className="text-[11px] font-bold text-[#050505] flex items-center justify-between">
                  <span>即将排期卡片：</span>
                  <span className="px-1.5 py-0.5 bg-[#1877F2] text-white text-[10px] font-bold rounded-none">
                    {pendingQuickCard.label}
                  </span>
                </div>
                <p className="text-[10px] text-[#65676B]">
                  目标日期：<span className="font-bold text-[#1877F2]">{selectedDateFilter || todayKey}</span>
                </p>
                <div className="text-[10px] text-[#65676B] pt-1 border-t border-[#E4E6EB] space-y-0.5">
                  <div>⏱️ 默认时间：14:00 ~ 16:30</div>
                  <div>📍 默认地点：Stellar 研发中心 · 8层研讨厅</div>
                  <div>👥 默认人员：Sarah Jenkins, Marcus Vance</div>
                </div>
              </div>

              <p className="text-center font-bold text-[#050505] text-[11px] pt-1">
                请问该日程是否有修改内容？
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E4E6EB]">
              <button
                type="button"
                onClick={handleConfirmDirectAdd}
                className="px-2.5 py-2 text-xs font-bold text-[#1877F2] bg-[#E7F3FF] hover:bg-[#D4E8FF] border border-[#1877F2]/40 shadow-2xs cursor-pointer active:scale-95 transition-all text-center"
              >
                直接快速添加
              </button>
              <button
                type="button"
                onClick={handleConfirmEditDetailsBeforeAdd}
                className="px-2.5 py-2 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] border border-[#1877F2] shadow-2xs cursor-pointer active:scale-95 transition-all text-center flex items-center justify-center gap-1"
              >
                <Edit3 size={12} />
                <span>修改详情后添加</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1.5 MODAL: ADD SUGGESTED CARD ("添加卡片添加建议卡片内容 只填入卡片主题") */}
      {/* ===================================================================== */}
      {isAddSuggestedCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white border border-[#E4E6EB] w-full max-w-sm p-4 space-y-3.5 shadow-xl rounded-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2">
              <div>
                <h3 className="text-sm font-black text-[#050505] flex items-center gap-1.5">
                  <Plus size={16} className="text-[#1877F2]" />
                  <span>添加建议卡片</span>
                </h3>
                <p className="text-[10px] text-[#1877F2] font-bold">
                  建议卡片内容 · 只需填入卡片主题
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSuggestedCardModalOpen(false)}
                className="text-[#65676B] hover:text-[#050505] p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Target Date Banner */}
            <div className="bg-[#E7F3FF] border border-[#1877F2]/30 p-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#65676B]">
                当日排期日期：<strong className="text-[#1877F2] text-xs font-black">{selectedDateFilter || todayKey}</strong>
              </span>
              <span className="px-1.5 py-0.5 bg-[#1877F2] text-white text-[9px] font-bold">
                快捷新建
              </span>
            </div>

            {/* Form Fields: Only Fill In Card Theme */}
            <div className="space-y-3 text-xs">
              {/* Card Title Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#050505] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Tag size={12} className="text-[#1877F2]" />
                    <span>卡片主题 / 日程名称</span>
                  </span>
                  <span className="text-[9.5px] font-bold text-red-500">* 必填 (只填主题)</span>
                </label>
                <input
                  type="text"
                  value={suggestedCardTitle}
                  onChange={(e) => setSuggestedCardTitle(e.target.value)}
                  placeholder="只填入卡片主题，如：🎾 网球打卡 / 🚴 傍晚骑行"
                  className="w-full px-2.5 py-2 bg-[#F0F2F5] border border-[#E4E6EB] focus:border-[#1877F2] outline-none text-xs font-bold text-[#050505]"
                  autoFocus
                />

                {/* Quick Theme Suggestion Chips */}
                <div className="pt-1">
                  <span className="text-[9.5px] font-bold text-[#65676B] block mb-1">点选快捷建议主题：</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      '🎾 网球打卡',
                      '📖 读书分享',
                      '🎨 艺术特展',
                      '🏕️ 露营野餐',
                      '💻 架构研讨',
                      '☕ 咖啡品鉴',
                    ].map((sample, sIdx) => (
                      <button
                        key={`sample-chip-${sample}-${sIdx}`}
                        type="button"
                        onClick={() => {
                          const cleanName = sample.replace(/^[^\s]+\s*/, '');
                          setSuggestedCardTitle(cleanName);
                        }}
                        className="px-1.5 py-0.5 bg-white hover:bg-[#E7F3FF] hover:text-[#1877F2] border border-[#E4E6EB] text-[9.5px] font-semibold text-[#050505] cursor-pointer transition-colors"
                      >
                        + {sample}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Icon Selector */}
              <div className="space-y-1 pt-1 border-t border-[#E4E6EB]">
                <span className="text-[10px] font-bold text-[#65676B]">选择分类 (决定代表图标)：</span>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { cat: 'tech' as const, label: '💻 技术' },
                    { cat: 'work' as const, label: '💼 工作' },
                    { cat: 'lifestyle' as const, label: '☕ 休闲' },
                    { cat: 'sports' as const, label: '🚴 运动' },
                    { cat: 'art' as const, label: '🎵 艺术' },
                  ].map((item, iIdx) => (
                    <button
                      key={`sug-cat-${item.cat}-${iIdx}`}
                      type="button"
                      onClick={() => setSuggestedCardCat(item.cat)}
                      className={`py-1 text-[10px] font-bold border transition-colors cursor-pointer text-center ${
                        suggestedCardCat === item.cat
                          ? 'bg-[#1877F2] text-white border-[#1877F2]'
                          : 'bg-[#F0F2F5] text-[#65676B] border-[#E4E6EB] hover:bg-gray-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-1.5 pt-2 border-t border-[#E4E6EB]">
              <button
                type="button"
                onClick={handleCreateSuggestedCard}
                className="w-full py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-black shadow-2xs cursor-pointer active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>确认添加建议卡片并排期</span>
              </button>

              <div className="flex items-center justify-between text-[10px] pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddSuggestedCardModalOpen(false)}
                  className="text-[#65676B] hover:text-[#050505] font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewCardTitle(suggestedCardTitle);
                    setNewCardCat(suggestedCardCat);
                    setIsAddSuggestedCardModalOpen(false);
                    setIsAddCardModalOpen(true);
                  }}
                  className="text-[#1877F2] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>完善更多属性 (时间/地点/人员)</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. MODAL: RICH ADD/EDIT CARD & SCHEDULE (时间范围、地点、地图标注、邀请人员、生成坐标) */}
      {/* ===================================================================== */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-[#E4E6EB] w-full max-w-md p-4 space-y-3.5 shadow-xl rounded-none max-h-[92vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2 shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#050505] flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#1877F2]" />
                  <span>添加日程</span>
                </h3>
                <p className="text-[10px] text-[#65676B] font-medium">
                  设定目标日期的活动与排期属性
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCardModalOpen(false)}
                className="text-[#65676B] hover:text-[#050505] p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <div className="space-y-3 text-xs overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {/* 当日大字体日期展示区 */}
              <div className="bg-[#E7F3FF] border border-[#1877F2]/40 p-2.5 flex items-center justify-between shadow-2xs">
                <div>
                  <div className="text-[10px] font-bold text-[#65676B] flex items-center gap-1">
                    <CalendarIcon size={12} className="text-[#1877F2]" />
                    <span>当日排期日期：</span>
                  </div>
                  <div className="text-xl font-black text-[#1877F2] tracking-tight leading-tight mt-0.5">
                    {selectedDateFilter || todayKey}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end justify-center">
                  <span className="px-2 py-0.5 bg-[#1877F2] text-white text-[10px] font-black rounded-none shadow-2xs">
                    当日日期
                  </span>
                  <span className="text-[9.5px] text-[#65676B] font-bold mt-1">
                    星期六 · 正常活动排期
                  </span>
                </div>
              </div>

              {/* 1. 卡片主体名称 & 分类 (设为活动的代表图标) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10.5px] font-extrabold text-[#050505] flex items-center gap-1">
                    <Tag size={12} className="text-[#1877F2]" />
                    <span>卡片主体名称 / 日程主题</span>
                  </label>
                  <span className="text-[9px] font-bold text-[#1877F2]">
                    设为活动的代表图标 🌟
                  </span>
                </div>
                <input
                  type="text"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="例如: 💻 架构研讨、☕ 咖啡品鉴、网球打卡..."
                  className="w-full px-2.5 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] focus:border-[#1877F2] outline-none text-xs font-semibold text-[#050505]"
                  autoFocus
                />
                <div className="space-y-1 pt-0.5">
                  <div className="text-[9.5px] font-bold text-[#65676B] flex items-center justify-between">
                    <span>选择分类 (自动设为代表图标)：</span>
                    <span className="text-[#1877F2] font-extrabold">
                      当前代表图标: {newCardCat === 'tech' ? '💻 技术' : newCardCat === 'work' ? '💼 工作' : newCardCat === 'lifestyle' ? '☕ 休闲' : newCardCat === 'sports' ? '🚴 运动' : '🎵 艺术'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { cat: 'tech' as const, label: '💻 技术' },
                      { cat: 'work' as const, label: '💼 工作' },
                      { cat: 'lifestyle' as const, label: '☕ 休闲' },
                      { cat: 'sports' as const, label: '🚴 运动' },
                      { cat: 'art' as const, label: '🎵 艺术' },
                    ].map((item, iIdx) => (
                      <button
                        key={`new-cat-${item.cat}-${iIdx}`}
                        type="button"
                        onClick={() => setNewCardCat(item.cat)}
                        className={`py-1 text-[10px] font-bold border transition-all cursor-pointer text-center ${
                          newCardCat === item.cat
                            ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                            : 'bg-[#F0F2F5] text-[#65676B] border-[#E4E6EB] hover:bg-gray-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. 时间范围选择 (时间选择时，上下午联动) */}
              <div className="space-y-1.5 p-2.5 bg-[#F7F8FA] border border-[#E4E6EB]">
                {(() => {
                  const startHour = parseInt(cardStartTime.split(':')[0] || '14', 10);
                  const activePeriodLabel = startHour < 12 ? '上午' : startHour < 18 ? '下午' : '晚间';
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <label className="text-[10.5px] font-extrabold text-[#050505] flex items-center gap-1">
                          <Clock size={12} className="text-[#1877F2]" />
                          <span>时间范围选择</span>
                        </label>
                        <span className="text-[9px] font-bold text-[#1877F2] px-1.5 py-0.5 bg-[#E7F3FF] border border-[#1877F2]/30">
                          ⚡ 上下午时间联动 ({activePeriodLabel}段)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9.5px] font-bold text-[#65676B] block mb-0.5">开始时间</span>
                          <input
                            type="time"
                            value={cardStartTime}
                            onChange={(e) => setCardStartTime(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-[#E4E6EB] focus:border-[#1877F2] text-xs font-bold text-[#050505]"
                          />
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-[#65676B] block mb-0.5">结束时间</span>
                          <input
                            type="time"
                            value={cardEndTime}
                            onChange={(e) => setCardEndTime(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-[#E4E6EB] focus:border-[#1877F2] text-xs font-bold text-[#050505]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#65676B] pt-1 border-t border-[#E4E6EB]/60">
                        <span className="font-bold text-[#050505]">快捷时段 preset (联动设定)：</span>
                        <div className="flex items-center space-x-1">
                          {[
                            { start: '09:00', end: '11:30', label: '上午' },
                            { start: '14:00', end: '17:00', label: '下午' },
                            { start: '19:00', end: '21:30', label: '晚间' },
                          ].map((t, tIdx) => {
                            const isSelected = activePeriodLabel === t.label;
                            return (
                              <button
                                key={`period-${t.label}-${tIdx}`}
                                type="button"
                                onClick={() => {
                                  setCardStartTime(t.start);
                                  setCardEndTime(t.end);
                                }}
                                className={`px-2 py-0.5 text-[9.5px] font-bold border transition-all ${
                                  isSelected
                                    ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                                    : 'bg-white text-[#050505] border-[#E4E6EB] hover:border-[#1877F2]'
                                }`}
                              >
                                {t.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* 3. 地点与地图标注选择 (删除多余的标注点) */}
              <div className="space-y-2 p-2.5 bg-[#F7F8FA] border border-[#E4E6EB]">
                <div className="flex items-center justify-between">
                  <label className="text-[10.5px] font-extrabold text-[#050505] flex items-center gap-1">
                    <MapPin size={12} className="text-[#1877F2]" />
                    <span>地点输入与地图标注选择</span>
                  </label>
                  <span className="text-[9px] font-bold text-[#1877F2] px-1.5 py-0.5 bg-[#E7F3FF] border border-[#1877F2]/30">
                    📍 实时地图响应定位
                  </span>
                </div>

                {/* 地址输入 & 实时响应定位 */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={cardLocation}
                    onChange={(e) => setCardLocation(e.target.value)}
                    placeholder="输入详细地址（地图实时响应定位）或选下方卡片"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E4E6EB] focus:border-[#1877F2] text-xs font-semibold text-[#050505]"
                  />
                  {cardLocation.trim() && (
                    <div className="text-[9px] text-[#1877F2] font-bold bg-[#E7F3FF] p-1 border border-[#1877F2]/20 flex items-center gap-1">
                      <Compass size={11} className="animate-spin" />
                      <span>地图响应匹配定位：【{cardLocation}】→ GPS ({mapLocationPresets[selectedCoordIndex]?.lat || '36.065'}, {mapLocationPresets[selectedCoordIndex]?.lng || '103.832'})</span>
                    </div>
                  )}
                </div>

                {/* 也可以使用之前的卡片地点 */}
                {previousCardsLocations.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-[#E4E6EB]/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-bold text-[#65676B] flex items-center gap-1">
                        <Tag size={10} className="text-[#1877F2]" />
                        <span>也可以使用之前的卡片地点：</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {previousCardsLocations.map((prevCard, pIdx) => (
                        <div
                          key={`prev-card-${prevCard.id}-${pIdx}`}
                          className="inline-flex items-center bg-white border border-[#E4E6EB] text-[#050505] text-[9.5px] font-semibold"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setCardLocation(prevCard.name);
                              const matchedIdx = mapLocationPresets.findIndex((p) => p.name.includes(prevCard.name.split('·')[0]));
                              if (matchedIdx !== -1) setSelectedCoordIndex(matchedIdx);
                            }}
                            className="px-2 py-1 hover:bg-[#E7F3FF] hover:text-[#1877F2] transition-colors cursor-pointer flex items-center gap-1"
                            title={prevCard.address}
                          >
                            <span>{prevCard.cardTitle}</span>
                            <span className="text-[#65676B]">({prevCard.name.split('·')[0].trim()})</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePreviousLocation(prevCard.id, prevCard.cardTitle);
                            }}
                            className="px-1 py-1 text-[#94A3B8] hover:text-red-500 border-l border-[#E4E6EB] transition-colors cursor-pointer"
                            title="删除该历史地点"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 地图标注及预设点 (支持删除多余的标注点) */}
                <div className="space-y-1.5 pt-1 border-t border-[#E4E6EB]/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-bold text-[#65676B]">可供在地图上选择的定位标注点：</span>
                    <span className="text-[8.5px] font-extrabold text-red-500 bg-red-50 px-1 py-0.5 border border-red-200">
                      ✕ 点击右上角移除多余标注点
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {mapLocationPresets.map((loc, idx) => {
                      const isLocSelected = selectedCoordIndex === idx;
                      return (
                        <div
                          key={`map-preset-${loc.id}-${idx}`}
                          className={`relative group p-1.5 border transition-all ${
                            isLocSelected
                              ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2]'
                              : 'bg-white border-[#E4E6EB] hover:bg-gray-50 text-[#050505]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCoordIndex(idx);
                              setCardLocation(loc.name);
                            }}
                            className="w-full text-left cursor-pointer"
                          >
                            <div className="text-[10px] font-extrabold truncate pr-4 flex items-center gap-1">
                              <MapPin size={10} className={isLocSelected ? 'text-[#1877F2]' : 'text-[#65676B]'} />
                              <span>{loc.name.split('·')[0]}</span>
                            </div>
                            <div className="text-[8.5px] text-[#65676B] truncate pl-3">
                              GPS: {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
                            </div>
                          </button>

                          {/* 删除多余的标注点按钮 */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMapPreset(loc.id, loc.name);
                            }}
                            className="absolute top-1 right-1 p-0.5 text-[#94A3B8] hover:text-red-600 hover:bg-red-50 rounded-none transition-colors cursor-pointer"
                            title="删除多余的标注点"
                          >
                            <X size={11} strokeWidth={2.5} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. 邀请活动参与人员 */}
              <div className="space-y-1.5 p-2.5 bg-[#F7F8FA] border border-[#E4E6EB]">
                <label className="block text-[10.5px] font-extrabold text-[#050505] flex items-center gap-1">
                  <Users size={12} className="text-[#1877F2]" />
                  <span>邀请活动参与人员 选项 ({invitedFriendIds.length} 人已选)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                  {AVAILABLE_FRIENDS_LIST.map((friend, fIdx) => {
                    const isChecked = invitedFriendIds.includes(friend.id);
                    return (
                      <button
                        key={`avail-friend-${friend.id}-${fIdx}`}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setInvitedFriendIds((prev) => prev.filter((id) => id !== friend.id));
                          } else {
                            setInvitedFriendIds((prev) => [...prev, friend.id]);
                          }
                        }}
                        className={`p-1.5 flex items-center justify-between border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2]'
                            : 'bg-white border-[#E4E6EB] hover:bg-gray-50 text-[#050505]'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-5 h-5 rounded-full object-cover shrink-0 border border-[#E4E6EB]"
                          />
                          <div className="text-left min-w-0">
                            <div className="text-[10px] font-bold truncate">{friend.name}</div>
                            <div className="text-[8.5px] text-[#65676B] truncate">{friend.role}</div>
                          </div>
                        </div>
                        <div
                          className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-[#1877F2] border-[#1877F2] text-white' : 'border-[#CBD5E1]'
                          }`}
                        >
                          {isChecked && <Check size={10} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="pt-1 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customFriendInput}
                    onChange={(e) => setCustomFriendInput(e.target.value)}
                    placeholder="输入其他参会人员姓名..."
                    className="flex-1 px-2 py-1 bg-white border border-[#E4E6EB] focus:border-[#1877F2] text-[10px] font-medium"
                  />
                </div>
              </div>

              {/* 5. 是否生成地图坐标 & 提前提醒与透明连接线 */}
              <div className="p-2.5 bg-[#E7F3FF] border border-[#1877F2]/40 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-[10.5px] font-extrabold text-[#050505] flex items-center gap-1">
                      <Compass size={13} className="text-[#1877F2]" />
                      <span>生成地图活动坐标与透明连接线</span>
                    </div>
                    <p className="text-[9px] text-[#65676B]">
                      {generateMapCoords
                        ? `已勾选开启，保存后将绑定 GPS (${mapLocationPresets[selectedCoordIndex]?.lat || '36.065'}, ${mapLocationPresets[selectedCoordIndex]?.lng || '103.832'})`
                        : '已关闭坐标关联，活动将仅保留文本地址信息'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGenerateMapCoords(!generateMapCoords)}
                    className={`px-3 py-1 text-[10px] font-extrabold border shadow-2xs cursor-pointer transition-all ${
                      generateMapCoords
                        ? 'bg-[#1877F2] text-white border-[#1877F2]'
                        : 'bg-white text-[#65676B] border-[#CBD5E1] hover:bg-gray-100'
                    }`}
                  >
                    {generateMapCoords ? '✓ 已生成坐标' : '✕ 仅文本'}
                  </button>
                </div>

                {/* 提前提醒时间选择（系统预设12小时） */}
                {generateMapCoords && (
                  <div className="space-y-1.5 pt-1.5 border-t border-[#1877F2]/20">
                    <div className="flex items-center justify-between text-[9.5px]">
                      <span className="font-bold text-[#050505] flex items-center gap-1">
                        <Clock size={11} className="text-[#1877F2]" />
                        <span>提前提醒与地图生成时间设定：</span>
                      </span>
                      <span className="font-bold text-[#1877F2]">系统默认：前 12 小时</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { hours: 2, label: '前 2 小时' },
                        { hours: 6, label: '前 6 小时' },
                        { hours: 12, label: '前 12 小时 (预设)' },
                        { hours: 24, label: '前 24 小时' },
                      ].map((item, hIdx) => (
                        <button
                          key={`notice-hr-${item.hours}-${hIdx}`}
                          type="button"
                          onClick={() => setAdvanceNoticeHours(item.hours)}
                          className={`py-1 text-[9px] font-bold border transition-all cursor-pointer text-center ${
                            advanceNoticeHours === item.hours
                              ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                              : 'bg-white text-[#050505] border-[#E4E6EB] hover:bg-gray-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* 透明连接线预览 */}
                    <div className="p-2 bg-white/90 border border-dashed border-[#1877F2]/50 text-[9.5px] text-[#050505] space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#1877F2]">
                        <span className="flex items-center gap-1">
                          📍 当前用户位置
                        </span>
                        <span className="border-t-2 border-dashed border-[#1877F2] flex-1 mx-2 opacity-60"></span>
                        <span className="text-[8.5px] bg-[#1877F2]/10 px-1 py-0.5 border border-[#1877F2]/30 text-[#1877F2]">
                          透明路线连接线 (活动前 {advanceNoticeHours} 小时自动生成)
                        </span>
                        <span className="border-t-2 border-dashed border-[#1877F2] flex-1 mx-2 opacity-60"></span>
                        <span className="flex items-center gap-1">
                          🚩 活动地点坐标
                        </span>
                      </div>
                      <p className="text-[8.5px] text-[#65676B] leading-tight pt-0.5">
                        系统将于活动开展前 <strong className="text-[#1877F2]">{advanceNoticeHours} 小时</strong> 在地图上生成专属活动坐标，并形成一条透明高亮的轨迹连接线，同步向 <strong className="text-[#050505]">{invitedFriendIds.length} 位</strong> 受邀成员推送行程提醒通知。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E4E6EB] shrink-0">
              <button
                type="button"
                onClick={() => setIsAddCardModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-[#65676B] bg-[#F0F2F5] hover:bg-gray-200 border border-[#E4E6EB] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateCustomCard}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] border border-[#1877F2] shadow-2xs cursor-pointer active:scale-95 transition-all flex items-center gap-1"
              >
                <Check size={13} strokeWidth={2.5} />
                <span>确认添加并生成日程</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flight Three Stage Status Modal */}
      {showFlightModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-[1100px] relative pt-6">
            <button
              type="button"
              onClick={() => setShowFlightModal(false)}
              className="absolute top-0 right-0 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 border border-gray-600 transition-all cursor-pointer z-50"
              title="关闭"
            >
              <X size={18} />
            </button>
            <FlightThreeStageCards
              flight={DEFAULT_DEMO_FLIGHT_SCHEDULE}
              onLocateStage={(stage) => {
                setShowFlightModal(false);
                if (showToast) showToast(`已定位至航班阶段【${stage}】`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
