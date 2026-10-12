import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { createManagedMap, destroyManagedMap } from '../map/managedMap';
import 'leaflet/dist/leaflet.css';
import {
  ChevronLeft,
  Plus,
  Heart,
  MapPin,
  Bell,
  Clock,
  Activity,
  Trash2,
  Settings,
  X,
  Users,
  Check,
  AlertTriangle,
  FileText,
  Sliders,
  User,
  Shield,
  Siren,
  TrendingUp,
  BarChart2,
  Lock,
  Zap,
  Info,
  Radio,
  Phone,
  Navigation,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Eye,
  EyeOff,
  MessageSquare,
  Sparkles,
  Pill,
  Battery,
  BatteryCharging,
  Crosshair,
  Compass,
  ShieldCheck,
  Volume2,
  Layers,
  Route,
  Footprints,
  PhoneCall,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  HeartPulse,
  Navigation2,
  Send,
  Share2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { FamilyGroupData } from './DiscoverView';
import { GeofenceScheduleModal } from './family_care/GeofenceScheduleModal';
import { FamilyMemberCardDrawer } from './family_care/FamilyMemberCardDrawer';
import { TodayTrajectoryTimeline, TrajectoryNode } from './family_care/TodayTrajectoryTimeline';
import { FamilyHistoryTrajectoryView } from './family_care/FamilyHistoryTrajectoryView';
import { FamilySafetyAlertsFeed } from './family_care/FamilySafetyAlertsFeed';
import { FamilyGeofenceManager } from './family_care/FamilyGeofenceManager';
import { FamilyInteractionsModule } from './family_care/FamilyInteractionsModule';
import { FamilyMemberManagementModal } from './family_care/FamilyMemberManagementModal';
import { FamilyPrivacyPermissionsModal } from './family_care/FamilyPrivacyPermissionsModal';
import { FamilyAssemblyCardModal } from './family_care/FamilyAssemblyCardModal';
import { WardCareDetailModal } from './family_care/WardCareDetailModal';
import { Friend } from '../types';

// =========================================================================
// TYPES & DATA CONTRACTS
// =========================================================================
export interface CareMember {
  id: string;
  name: string;
  relation: string;
  avatar: string;
  type: 'child' | 'elderly' | 'adult';
  status: 'safe' | 'warning' | 'danger' | 'offline';
  statusText: string;
  battery: number;
  isCharging?: boolean;
  locationName: string;
  address: string;
  lastActive: string;
  stayDuration: string;
  gpsAccuracy: string;
  steps: number;
  stepTarget: number;
  heartRate: number;
  spO2: number;
  sleepHours: number;
  bodyPosture: '正常行走' | '轻微活动' | '平稳静坐' | '疑似异常跌落';
  role?: string;
  locationVisibility?: string;
  healthNotes?: string;
  emergencyAllergies?: string;
  bloodType?: string;
  deviceId?: string;
  deviceName?: string;
  coords: { x: number; y: number };
  medications?: {
    id: string;
    name: string;
    genericName?: string;
    time: string;
    dosage: string;
    instructions?: string;
    period?: 'morning' | 'noon' | 'evening' | 'night';
    taken: boolean;
    takenAt?: string;
  }[];
}

export interface Geofence {
  id: string;
  name: string;
  category: 'home' | 'school' | 'park' | 'temporary' | 'night';
  categoryName: string;
  type: 'circle' | 'polygon';
  coords: { x: number; y: number; r: number };
  membersInside: string[];
  schedule: string;
  schedulePreset?: 'all_day' | 'school_workdays' | 'morning_evening' | 'night_sleep' | 'custom';
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string;
  notifyOnExit: boolean;
  notifyOnEnter: boolean;
  isActive: boolean;
}

export interface DangerZone {
  id: string;
  name: string;
  type: 'official' | 'crowdsourced';
  category: 'water' | 'construction' | 'traffic' | 'desolate';
  categoryName: string;
  coords: { x: number; y: number; r: number };
  severity: 'high' | 'medium' | 'low';
  severityName: string;
  reason: string;
}

export interface Rescuer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  distance: string;
  isCertified: boolean;
  status: 'idle' | 'en_route' | 'arrived';
  coords: { x: number; y: number };
  eta: string;
  phone: string;
}

export interface EmergencyFacility {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'pharmacy';
  distance: string;
  coords: { x: number; y: number };
  address: string;
  phone: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  priority: string;
  avatar: string;
  distance: string;
  distanceMeters: number;
  locationName: string;
  lastSync: string;
  isOnline: boolean;
}

interface FamilyCareMonitorPageProps {
  isOpen: boolean;
  onClose: () => void;
  familyGroup: FamilyGroupData | null;
  onOpenSettings?: () => void;
  onExitFamilyCare?: () => void;
  onDisbandFamilyGroup?: () => void;
  timeRange?: 'realtime' | 'today' | 'history';
  setTimeRange?: (range: 'realtime' | 'today' | 'history') => void;
  isManagementModalOpen?: boolean;
  setIsManagementModalOpen?: (open: boolean) => void;
}

// =========================================================================
// MAP CARTOGRAPHY & COORDINATE TRANSFORMATION
// =========================================================================
const FAMILY_MAP_ORIGIN = { lat: 36.0592, lng: 103.8343 };

export const coordsToLatLng = (coords?: { x: number; y: number } | null): [number, number] => {
  if (!coords || typeof coords.x !== 'number' || typeof coords.y !== 'number' || isNaN(coords.x) || isNaN(coords.y)) {
    return [FAMILY_MAP_ORIGIN.lat, FAMILY_MAP_ORIGIN.lng];
  }
  const lng = FAMILY_MAP_ORIGIN.lng + ((coords.x - 50) / 50) * 0.0085;
  const lat = FAMILY_MAP_ORIGIN.lat - ((coords.y - 50) / 50) * 0.0065;
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return [FAMILY_MAP_ORIGIN.lat, FAMILY_MAP_ORIGIN.lng];
  }
  return [lat, lng];
};

export const latLngToCoords = (lat: number, lng: number): { x: number; y: number } => {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return { x: 50, y: 50 };
  }
  const x = Math.max(0, Math.min(100, 50 + ((lng - FAMILY_MAP_ORIGIN.lng) / 0.0085) * 50));
  const y = Math.max(0, Math.min(100, 50 - ((lat - FAMILY_MAP_ORIGIN.lat) / 0.0065) * 50));
  return { x: Math.round(x), y: Math.round(y) };
};

export const getFamilyMemberAsFriend = (member: CareMember): Friend => {
  const latLng = coordsToLatLng(member.coords);
  return {
    id: member.id,
    name: member.name,
    avatar: member.avatar,
    status: member.statusText,
    locationName: member.locationName,
    lat: typeof latLng[0] === 'number' && !isNaN(latLng[0]) ? latLng[0] : FAMILY_MAP_ORIGIN.lat,
    lng: typeof latLng[1] === 'number' && !isNaN(latLng[1]) ? latLng[1] : FAMILY_MAP_ORIGIN.lng,
    x: member.coords?.x ?? 50,
    y: member.coords?.y ?? 50,
    distance: `距你 1.2km 东南`,
    battery: member.battery,
    lastUpdated: member.lastActive,
    isOnline: member.status !== 'offline',
    relationship: 'family',
    isFamily: true,
    activityState: member.status === 'danger' ? 'moving' : member.bodyPosture === '正常行走' ? 'moving' : 'idle',
    mood: member.type === 'elderly' ? '👵' : member.type === 'child' ? '🎒' : '👨',
    stayDuration: member.stayDuration,
    speed: member.type === 'child' ? '12 km/h' : '0 km/h',
  };
};

export const getFamilyMemberTrajectoryPayload = (member: CareMember): any => {
  return {
    user: {
      id: member.id,
      nickname: member.name,
      online: member.status !== 'offline',
      lastSeenAt: member.lastActive,
      battery: member.battery,
      currentPoi: member.locationName,
    },
    today: {
      stats: { distanceKm: 4.8, moveMinutes: 45, steps: member.steps },
    },
  };
};

// =========================================================================
// MOCK DATA: 6 FAMILY MEMBERS (Requirement Section III & XI)
// =========================================================================
const INITIAL_MEMBERS: CareMember[] = [
  {
    id: 'm1',
    name: '王淑珍 (妈妈)',
    relation: '妈妈',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    type: 'adult',
    status: 'safe',
    statusText: '在家 · 已停留 32 分钟',
    battery: 82,
    isCharging: false,
    locationName: '位于家中 · 已停留 32 分钟',
    address: '北京市朝阳区阳光家园2号楼1201',
    lastActive: '09:42',
    stayDuration: '已停留 32 分钟',
    gpsAccuracy: '5m',
    steps: 5400,
    stepTarget: 8000,
    heartRate: 72,
    spO2: 98,
    sleepHours: 7.5,
    bodyPosture: '平稳静坐',
    role: '协同监护人',
    locationVisibility: '仅家庭管理员可见',
    coords: { x: 48, y: 50 },
  },
  {
    id: 'm2',
    name: '郭建国 (爸爸)',
    relation: '爸爸',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    type: 'adult',
    status: 'safe',
    statusText: '驾车中 · 距离家 3.4 km',
    battery: 65,
    isCharging: true,
    locationName: '滨河大道西段 · 驾车中',
    address: '北京市朝阳区滨河大道102号',
    lastActive: '2分钟前',
    stayDuration: '行驶中 (车速 45 km/h)',
    gpsAccuracy: '4m',
    steps: 7200,
    stepTarget: 10000,
    heartRate: 78,
    spO2: 99,
    sleepHours: 6.8,
    bodyPosture: '平稳静坐',
    role: '协同监护人',
    locationVisibility: '全家庭成员可见',
    coords: { x: 65, y: 35 },
  },
  {
    id: 'm3',
    name: '郭欣怡 (女儿)',
    relation: '女儿',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    type: 'child',
    status: 'safe',
    statusText: '学校附近 · 12 分钟前更新',
    battery: 92,
    isCharging: false,
    locationName: '朝阳第一小学北门',
    address: '北京市朝阳区文昌路8号校门',
    lastActive: '12分钟前',
    stayDuration: '已停留 15分钟',
    gpsAccuracy: '6m',
    steps: 8900,
    stepTarget: 10000,
    heartRate: 85,
    spO2: 99,
    sleepHours: 8.5,
    bodyPosture: '正常行走',
    role: '被监护成员',
    locationVisibility: '仅监护人可见',
    coords: { x: 30, y: 30 },
  },
  {
    id: 'm4',
    name: '郭小宇 (儿子)',
    relation: '儿子',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    type: 'child',
    status: 'warning',
    statusText: '步行中 · 预计 8 分钟到家',
    battery: 18,
    isCharging: false,
    locationName: '文昌路绿道 · 步行中',
    address: '北京市朝阳区文昌路绿道45号',
    lastActive: '刚刚',
    stayDuration: '移动中 (距家 860m)',
    gpsAccuracy: '3m',
    steps: 9500,
    stepTarget: 10000,
    heartRate: 90,
    spO2: 98,
    sleepHours: 8.0,
    bodyPosture: '正常行走',
    role: '被监护成员',
    locationVisibility: '仅监护人可见',
    coords: { x: 55, y: 62 },
  },
  {
    id: 'm5',
    name: '郭星河 (我)',
    relation: '我 · 管理员',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    type: 'adult',
    status: 'safe',
    statusText: '在线 · 当前位于东方红广场',
    battery: 95,
    isCharging: false,
    locationName: '东方红广场中心',
    address: '北京市朝阳区东方红广场中央喷泉',
    lastActive: '在线',
    stayDuration: '已停留 20分钟',
    gpsAccuracy: '2m',
    steps: 10200,
    stepTarget: 10000,
    heartRate: 74,
    spO2: 99,
    sleepHours: 7.2,
    bodyPosture: '正常行走',
    role: '家庭管理员',
    locationVisibility: '全家庭成员可见',
    coords: { x: 50, y: 45 },
  },
  {
    id: 'm6',
    name: '陈秀英 (外婆)',
    relation: '外婆 / 重点看护',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    type: 'elderly',
    status: 'safe',
    statusText: '在控 · 阳光家园安全区内',
    battery: 88,
    isCharging: false,
    locationName: '阳光家园北区绿道旁',
    address: '北京市朝阳区阳光大道18号北门',
    lastActive: '1分钟前',
    stayDuration: '已停留 42分钟',
    gpsAccuracy: '3m',
    steps: 4280,
    stepTarget: 6000,
    heartRate: 72,
    spO2: 98,
    sleepHours: 7.5,
    bodyPosture: '正常行走',
    role: '被监护成员',
    locationVisibility: '仅家庭管理员可见',
    coords: { x: 38, y: 52 },
  },
];

const INITIAL_GEOFENCES: Geofence[] = [
  {
    id: 'g1',
    name: '阳光家园家庭安全区',
    category: 'home',
    categoryName: '家庭住址',
    type: 'circle',
    coords: { x: 48, y: 50, r: 35 },
    membersInside: ['m1', 'm2', 'm5'],
    schedule: '每日全天 00:00 - 24:00 (全天布控)',
    notifyOnExit: true,
    notifyOnEnter: true,
    isActive: true,
  },
  {
    id: 'g2',
    name: '朝阳第一小学校园围栏',
    category: 'school',
    categoryName: '学校',
    type: 'circle',
    coords: { x: 30, y: 30, r: 25 },
    membersInside: ['m3'],
    schedule: '周一至周五 07:45 - 17:30 (校园守护)',
    notifyOnExit: true,
    notifyOnEnter: true,
    isActive: true,
  },
  {
    id: 'g3',
    name: 'CBD科技园工作安全区',
    category: 'park',
    categoryName: '工作地点',
    type: 'circle',
    coords: { x: 65, y: 35, r: 30 },
    membersInside: ['m2'],
    schedule: '工作日 08:30 - 18:30',
    notifyOnExit: false,
    notifyOnEnter: true,
    isActive: true,
  },
];

const INITIAL_DANGER_ZONES: DangerZone[] = [
  {
    id: 'd1',
    name: '文昌路施工低照明路段',
    type: 'crowdsourced',
    category: 'construction',
    categoryName: '施工隐患',
    coords: { x: 26, y: 70, r: 20 },
    severity: 'medium',
    severityName: '中危 🟡',
    reason: '无路灯高坑洼路面，夜间出行易跌跤。',
  },
  {
    id: 'd2',
    name: '滨河西路交汇急弯盲区',
    type: 'official',
    category: 'traffic',
    categoryName: '交通复杂',
    coords: { x: 72, y: 28, r: 22 },
    severity: 'high',
    severityName: '高危 🔴',
    reason: '无红绿灯车流盲区，儿童切勿横穿。',
  },
];

const INITIAL_FACILITIES: EmergencyFacility[] = [
  { id: 'f1', name: '朝阳第一医院 (三甲急救)', type: 'hospital', distance: '420m', coords: { x: 28, y: 20 }, address: '工体东路14号', phone: '010-120' },
  { id: 'f2', name: '麦子店治安派出所', type: 'police', distance: '650m', coords: { x: 62, y: 18 }, address: '麦子店街3号', phone: '010-110' },
  { id: 'f3', name: '社区智慧 AED 便民站', type: 'pharmacy', distance: '210m', coords: { x: 48, y: 58 }, address: '阳光大道12号', phone: '010-65882233' },
];

export const FamilyCareMonitorPage: React.FC<FamilyCareMonitorPageProps> = ({
  isOpen,
  onClose,
  familyGroup,
  onOpenSettings,
  onExitFamilyCare,
  onDisbandFamilyGroup,
  timeRange: controlledTimeRange,
  setTimeRange: controlledSetTimeRange,
  isManagementModalOpen: controlledManagementModalOpen,
  setIsManagementModalOpen: controlledSetManagementModalOpen,
}) => {
  const [members, setMembers] = useState<CareMember[]>(INITIAL_MEMBERS);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('m1');
  const [geofences, setGeofences] = useState<Geofence[]>(INITIAL_GEOFENCES);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>(INITIAL_DANGER_ZONES);
  const [facilities] = useState<EmergencyFacility[]>(INITIAL_FACILITIES);

  // Core state options
  const [internalTimeRange, setInternalTimeRange] = useState<'realtime' | 'today' | 'history'>('realtime');
  const timeRange = controlledTimeRange !== undefined ? controlledTimeRange : internalTimeRange;
  const setTimeRange = controlledSetTimeRange || setInternalTimeRange;

  const [isMemberCardOpen, setIsMemberCardOpen] = useState(false);
  const [internalManagementModalOpen, setInternalManagementModalOpen] = useState(false);
  const isManagementModalOpen = controlledManagementModalOpen !== undefined ? controlledManagementModalOpen : internalManagementModalOpen;
  const setIsManagementModalOpen = controlledSetManagementModalOpen || setInternalManagementModalOpen;
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isAssemblyModalOpen, setIsAssemblyModalOpen] = useState(false);
  const [isWardDetailOpen, setIsWardDetailOpen] = useState(false);
  const [wardDetailMember, setWardDetailMember] = useState<CareMember | null>(null);
  const [homeSafetyStatus, setHomeSafetyStatus] = useState<'safe' | 'warning' | 'danger' | 'offline'>('safe');
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  const [isMyLocationPaused, setIsMyLocationPaused] = useState(false);

  // System toast notification
  const [toastAlert, setToastAlert] = useState<{ text: string; type?: 'info' | 'warning' | 'emergency' | 'success' } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const membersLayerRef = useRef<L.LayerGroup | null>(null);

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  const triggerToast = (text: string, type: 'info' | 'warning' | 'emergency' | 'success' = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastAlert({ text, type });
    toastTimerRef.current = setTimeout(() => {
      setToastAlert(null);
    }, 2200);
  };

  const handleSelectTrajectoryNode = useCallback((node: TrajectoryNode) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coordsToLatLng(node.coords), 16.5, { duration: 0.5 });
    }
  }, []);

  const handleFocusTrajectoryMember = useCallback((m: CareMember) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coordsToLatLng(m.coords), 16.5, { duration: 0.5 });
    }
  }, []);

  // Map Initialization
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;
    const container = mapContainerRef.current;

    if (!mapInstanceRef.current) {
      const centerLatLng = coordsToLatLng(selectedMember?.coords || { x: 50, y: 50 });
      const map = createManagedMap(container, {
        center: centerLatLng,
        zoom: 15,
        zoomControl: false,
        attributionControl: true, // OSM 瓦片保留署名
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      membersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      membersLayerRef.current?.clearLayers();
      membersLayerRef.current = null;
      const instance = mapInstanceRef.current;
      mapInstanceRef.current = null;
      destroyManagedMap(container, instance);
    };
  }, [isOpen]);

  // Sync Map Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !membersLayerRef.current) return;

    membersLayerRef.current.clearLayers();

    // 1. Geofences
    geofences.forEach((fence) => {
      if (!fence.isActive) return;
      const circle = L.circle(coordsToLatLng(fence.coords), {
        radius: fence.coords.r * 6.0,
        color: '#1877F2',
        weight: 1.8,
        dashArray: '6, 4',
        fillColor: '#1877F2',
        fillOpacity: 0.1,
      });
      circle.on('click', () => {
        triggerToast(`🛡️ 安全围栏【${fence.name}】：布控规则 ${fence.schedule}`);
      });
      membersLayerRef.current?.addLayer(circle);
    });

    // 2. Member Markers
    members.forEach((m) => {
      const isSelected = m.id === selectedMemberId;
      const isSOS = m.status === 'danger';
      const isWarning = m.status === 'warning';

      // Member trajectory colors
      const memberColor = m.id === 'm1' ? '#1877F2' : m.id === 'm2' ? '#31A24C' : m.id === 'm3' ? '#F59E0B' : '#1877F2';

      const customHtml = `
        <div class="relative flex flex-col items-center cursor-pointer select-none -translate-x-1/2 -translate-y-1/2 group">
          ${isSOS ? '<span class="absolute -inset-3 rounded-full bg-red-600/40 animate-ping"></span>' : ''}
          ${isWarning ? '<span class="absolute -inset-2 rounded-full bg-amber-500/30 animate-pulse"></span>' : ''}
          
          <div class="p-0.5 bg-white border-2 rounded-md shadow-xs relative transition-transform ${
            isSelected ? 'scale-115 ring-2 ring-[#1877F2]' : 'group-hover:scale-105'
          }" style="border-color: ${isSOS ? '#FA3B30' : isWarning ? '#F59E0B' : memberColor}">
            <img 
              src="${m.avatar}" 
              alt="${m.name}" 
              class="w-6 h-6 rounded-xs object-cover"
              referrerpolicy="no-referrer"
            />
            <span class="absolute -top-1.5 -right-1.5 text-[6.5px] font-bold px-0.5 py-0.1 rounded-full text-white shadow-2xs ${
              m.battery > 50 ? 'bg-[#31A24C]' : m.battery > 20 ? 'bg-amber-500' : 'bg-[#FA3B30]'
            }">
              ${m.battery}%
            </span>
          </div>

          <div class="py-0.2 px-1 text-[7.5px] font-bold shadow-2xs mt-0.5 whitespace-nowrap rounded-md text-white ${
            isSOS ? 'bg-[#FA3B30] animate-bounce' : isWarning ? 'bg-amber-500' : 'bg-[#050505]'
          }">
            ${m.name.split(' ')[0]}
          </div>
        </div>
      `;

      const marker = L.marker(coordsToLatLng(m.coords), {
        icon: L.divIcon({
          html: customHtml,
          className: 'custom-leaflet-member-marker',
          iconSize: [42, 50],
          iconAnchor: [21, 25],
        }),
      });

      marker.on('click', () => {
        setSelectedMemberId(m.id);
        setIsMemberCardOpen(true);
        mapInstanceRef.current?.flyTo(coordsToLatLng(m.coords), 16.5, { duration: 0.5 });
        triggerToast(`👤 展开成员卡片：${m.name} (${m.statusText})`);
      });

      membersLayerRef.current?.addLayer(marker);
    });
  }, [isOpen, members, selectedMemberId, geofences]);

  // SOS Simulation Trigger
  const handleTriggerSOS = () => {
    setSelectedMemberId('m4');
    setMembers((prev) =>
      prev.map((m) =>
        m.id === 'm4'
          ? {
              ...m,
              status: 'danger',
              statusText: '🚨 跌落SOS感应触发！一键紧急广播中！',
              bodyPosture: '疑似异常跌落',
            }
          : m
      )
    );
    setIsMemberCardOpen(true);
    triggerToast('🆘 SOS 求助告警已向全家庭及急救服务广播，地图已切换救援模式！', 'emergency');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coordsToLatLng({ x: 55, y: 62 }), 17, { duration: 0.6 });
    }
  };

  // Fit all members on map
  const handleFitAllMembers = () => {
    if (!mapInstanceRef.current) return;
    const points = members.map((m) => coordsToLatLng(m.coords));
    const bounds = L.latLngBounds(points);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    triggerToast('全员重置视角：在地图中展示全域 6 位家庭成员');
  };

  if (!isOpen) return null;

  return (
    <div className="stellar-family-care absolute top-[calc(56px+var(--sat,0px))] bottom-0 left-0 right-0 z-40 bg-[#F0F2F5] text-[#050505] dark:text-white flex flex-col font-sans overflow-hidden select-none border-x border-[#E4E6EB]">
      {/* Header Bar */}
      <div className="bg-white border-b border-[#E4E6EB] px-3.5 py-2 flex items-center justify-between z-40">
        <h2 className="text-[13.5px] font-bold text-[#050505]">Stellar 家庭看护</h2>
        <div className="flex items-center gap-1.5 text-[10.5px] text-[#65676B]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>实时守护运行中</span>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastAlert && (
        <div className="absolute top-3 left-3 right-3 z-50 p-2.5 shadow-md flex items-start gap-2.5 border-l-4 transition-all duration-300 animate-in fade-in bg-white rounded-md border-[#E4E6EB] border-l-[#1877F2]">
          <div className="mt-0.5 shrink-0">
            {toastAlert.type === 'emergency' ? (
              <Siren size={16} className="text-[#FA3B30] animate-bounce" />
            ) : toastAlert.type === 'warning' ? (
              <AlertTriangle size={16} className="text-amber-500" />
            ) : (
              <ShieldCheck size={16} className="text-[#31A24C]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] font-bold text-[#050505]">
              {toastAlert.type === 'emergency' ? '红色应急广播触发' : '家庭守护舱通知'}
            </h4>
            <p className="text-[10px] text-[#65676B] mt-0.5">{toastAlert.text}</p>
          </div>
          <button type="button" onClick={() => setToastAlert(null)} aria-label="关闭家庭通知" className="w-11 h-11 shrink-0 flex items-center justify-center text-[#65676B]">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col min-h-0">
        {/* 三、家庭成员实时地图 (Section III) */}
        <div className="family-care-map relative flex-1 bg-gray-200 min-h-[220px]">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

          {/* Map Overlay Badge */}
          <div className="absolute top-2 left-2 z-10 bg-white/95 px-2 py-1 rounded-md border border-[#E4E6EB] shadow-2xs text-[10px] font-bold text-[#050505] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#31A24C] animate-pulse" />
            <span>实时看护图层 · 6 成员在线已同步</span>
          </div>
        </div>

        {/* Dynamic Panels based on TimeRange or State */}
        <div className="family-care-overview min-h-0 p-3 bg-white border-t border-[#E4E6EB] max-h-[45vh] overflow-y-auto space-y-3">
          {timeRange === 'realtime' && (
            <>
              {/* 1. 家庭安全摘要 (Section II & Section XIII) */}
              <div className="bg-[#F0F2F5] border border-[#E4E6EB] rounded-md p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-[#050505]">Stellar 幸福家庭组 · 安全总摘要</h3>
                    <p className="text-[10px] text-[#65676B]">最近同步更新：09:42 · 北斗定位网络在线</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${
                    homeSafetyStatus === 'danger' ? 'bg-red-50 text-[#FA3B30] border-red-200' :
                    homeSafetyStatus === 'warning' ? 'bg-amber-50 text-[#F59E0B] border-amber-200' :
                    homeSafetyStatus === 'offline' ? 'bg-gray-100 text-[#65676B] border-gray-300' :
                    'bg-emerald-50 text-[#31A24C] border-emerald-200'
                  }`}>
                    {homeSafetyStatus === 'danger' ? '🚨 存在紧急情况' :
                     homeSafetyStatus === 'warning' ? '⚠️ 1位成员需要关注' :
                     homeSafetyStatus === 'offline' ? '📡 暂无最新定位' :
                     '🟢 当前全员安全'}
                  </span>
                </div>

                {/* 4 Core Status Switcher (Section XIII) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setHomeSafetyStatus('safe');
                      triggerToast('状态切换为【当前安全】：查看家庭全员卡片');
                    }}
                    className={`p-1.5 rounded border text-left cursor-pointer transition-all ${
                      homeSafetyStatus === 'safe' ? 'bg-white border-[#31A24C] shadow-2xs font-bold text-[#31A24C]' : 'bg-white border-[#E4E6EB] text-[#050505] hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#31A24C]" />
                      当前安全
                    </p>
                    <p className="text-[9.5px] text-[#65676B] mt-0.5">查看家庭成员 &rarr;</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHomeSafetyStatus('warning');
                      triggerToast('状态切换为【需要关注】：1位成员有异常提醒');
                    }}
                    className={`p-1.5 rounded border text-left cursor-pointer transition-all ${
                      homeSafetyStatus === 'warning' ? 'bg-white border-[#F59E0B] shadow-2xs font-bold text-[#F59E0B]' : 'bg-white border-[#E4E6EB] text-[#050505] hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      需要关注
                    </p>
                    <p className="text-[9.5px] text-[#65676B] mt-0.5">查看重要提醒 &rarr;</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHomeSafetyStatus('danger');
                      handleTriggerSOS();
                    }}
                    className={`p-1.5 rounded border text-left cursor-pointer transition-all ${
                      homeSafetyStatus === 'danger' ? 'bg-white border-[#FA3B30] shadow-2xs font-bold text-[#FA3B30]' : 'bg-white border-[#E4E6EB] text-[#050505] hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FA3B30] animate-ping" />
                      紧急情况
                    </p>
                    <p className="text-[9.5px] text-[#65676B] mt-0.5">联系成员 / 查看地图</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHomeSafetyStatus('offline');
                      triggerToast('状态切换为【暂无最新定位】：正在呼叫终端并展示最后轨迹');
                    }}
                    className={`p-1.5 rounded border text-left cursor-pointer transition-all ${
                      homeSafetyStatus === 'offline' ? 'bg-white border-[#65676B] shadow-2xs font-bold text-[#65676B]' : 'bg-white border-[#E4E6EB] text-[#050505] hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#65676B]" />
                      暂无定位
                    </p>
                    <p className="text-[9.5px] text-[#65676B] mt-0.5">查看最后已知位置</p>
                  </button>
                </div>
              </div>

              {/* Member Selection Pills */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#050505]">
                  <span>家庭成员状态列表 (点击可在地图聚焦并查看详情)</span>
                  <button
                    type="button"
                    onClick={() => setIsManagementModalOpen(true)}
                    className="text-[10px] text-[#1877F2] font-semibold hover:underline"
                  >
                    管理成员角色 &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {members.map((m) => {
                    const isSelected = m.id === selectedMemberId;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMemberId(m.id);
                          setIsMemberCardOpen(true);
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.flyTo(coordsToLatLng(m.coords), 16.5, { duration: 0.5 });
                          }
                        }}
                        className={`p-2 rounded-md border cursor-pointer flex items-center gap-2 transition-all ${
                          isSelected ? 'bg-blue-50/80 border-[#1877F2] shadow-2xs' : 'bg-gray-50 border-[#E4E6EB] hover:bg-gray-100'
                        }`}
                      >
                        <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover border" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-[#050505] truncate">{m.name}</p>
                          <p className="text-[9.5px] text-[#65676B] truncate">{m.statusText}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 七、家庭安全提醒 (Section VIII) */}
              <FamilySafetyAlertsFeed
                members={members}
                onViewMapCoords={(coords) => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo(coordsToLatLng(coords), 16.5, { duration: 0.5 });
                  }
                }}
                onViewMemberTrajectory={(mId) => {
                  setSelectedMemberId(mId);
                  setTimeRange('today');
                }}
                onContactMember={(mId) => {
                  const m = members.find((x) => x.id === mId);
                  triggerToast(`正在拨打【${m?.name || '成员'}】的应急守护电话...`);
                }}
              />

              {/* 九、家庭安全围栏 (Section IX) */}
              <FamilyGeofenceManager
                geofences={geofences}
                members={members}
                onToggleGeofence={(fId) => {
                  setGeofences((prev) => prev.map((g) => (g.id === fId ? { ...g, isActive: !g.isActive } : g)));
                  triggerToast('围栏设置已同步更新');
                }}
                onEditSchedule={(f) => setEditingGeofence(f)}
                onCreateGeofence={() => triggerToast('创建围栏原型演示：地图选点尚未接入')}
                onFocusGeofence={(f) => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo(coordsToLatLng(f.coords), 16, { duration: 0.5 });
                  }
                }}
              />

              {/* 十、家庭互动与共同活动 (Section X) */}
              <FamilyInteractionsModule
                members={members}
                onInitiateAssembly={() => setIsAssemblyModalOpen(true)}
                onShareMyLocation={() => triggerToast('分享位置原型演示，尚未发送到家庭群')}
                onCreatePlan={() => triggerToast('家庭计划原型演示，创建入口尚未接入')}
                onSendToGroupChat={() => triggerToast('家庭群聊原型演示，聊天入口尚未接入')}
                onViewJointTrajectory={() => triggerToast('共同足迹原型演示，轨迹图层尚未接入')}
              />
            </>
          )}

          {timeRange === 'today' && (
            <TodayTrajectoryTimeline
              member={selectedMember}
              onSelectNode={handleSelectTrajectoryNode}
              onFocusMember={handleFocusTrajectoryMember}
              onShowAllMembers={handleFitAllMembers}
              onToggleTrajectoryVisibility={(v) => triggerToast(v ? '轨迹显隐原型演示，尚未更新地图' : '轨迹显隐原型演示，尚未更新地图')}
            />
          )}

          {timeRange === 'history' && (
            <FamilyHistoryTrajectoryView selectedMember={selectedMember} />
          )}
        </div>
      </div>

      {/* 十三、家庭监护快捷操作区 (Fixed Bottom Bar - Section XIII) */}
      <div className="bg-white border-t border-[#E4E6EB] p-2 grid grid-cols-6 gap-1 shrink-0 select-none shadow-lg z-30">
        <button
          type="button"
          onClick={handleFitAllMembers}
          className="flex flex-col items-center justify-center min-h-11 p-1.5 rounded bg-gray-50 hover:bg-blue-50 text-[#050505] transition-all cursor-pointer"
        >
          <Users size={15} className="text-[#1877F2] mb-0.5" />
          <span className="text-[9.5px] font-bold">全部成员</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTimeRange('today');
            triggerToast('已展开【今日轨迹】查看时间轴');
          }}
          className="flex flex-col items-center justify-center min-h-11 p-1.5 rounded bg-gray-50 hover:bg-amber-50 text-[#050505] transition-all cursor-pointer"
        >
          <Route size={15} className="text-[#F59E0B] mb-0.5" />
          <span className="text-[9.5px] font-bold">今日轨迹</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAssemblyModalOpen(true)}
          className="flex flex-col items-center justify-center min-h-11 p-1.5 rounded bg-gray-50 hover:bg-blue-50 text-[#050505] transition-all cursor-pointer"
        >
          <Navigation size={15} className="text-[#1877F2] mb-0.5" />
          <span className="text-[9.5px] font-bold">家庭集合</span>
        </button>

        <button
          type="button"
          onClick={() => triggerToast('创建围栏原型演示：地图选点尚未接入')}
          className="flex flex-col items-center justify-center min-h-11 p-1.5 rounded bg-gray-50 hover:bg-emerald-50 text-[#050505] transition-all cursor-pointer"
        >
          <Shield size={15} className="text-[#31A24C] mb-0.5" />
          <span className="text-[9.5px] font-bold">创建围栏</span>
        </button>

        <button
          type="button"
          onClick={() => setIsPrivacyModalOpen(true)}
          className="flex flex-col items-center justify-center min-h-11 p-1.5 rounded bg-gray-50 hover:bg-purple-50 text-[#050505] transition-all cursor-pointer"
        >
          <Sliders size={15} className="text-purple-600 mb-0.5" />
          <span className="text-[9.5px] font-bold">设置提醒</span>
        </button>

        <button
          type="button"
          onClick={handleTriggerSOS}
          className="flex flex-col items-center justify-center min-h-11 p-1.5 rounded bg-red-50 hover:bg-red-100 text-[#FA3B30] border border-red-200 transition-all cursor-pointer animate-pulse"
        >
          <Siren size={15} className="text-[#FA3B30] mb-0.5" />
          <span className="text-[9.5px] font-bold">SOS 求助</span>
        </button>
      </div>

      {/* 四、家庭成员监护卡片 Drawer (Section IV & V) */}
      <FamilyMemberCardDrawer
        member={selectedMember}
        isOpen={isMemberCardOpen}
        onClose={() => setIsMemberCardOpen(false)}
        onSendMessage={(m) => triggerToast(`即刻与【${m.name}】建立点对点加密对话`)}
        onCallMember={(m) => triggerToast(`正在呼叫【${m.name}】的声音守护抓取通道...`)}
        onViewTodayTrajectory={(m) => {
          setIsMemberCardOpen(false);
          setTimeRange('today');
        }}
        onSetArrivalAlert={(m) => triggerToast(`已为【${m.name}】开启自动到达/离开提醒`)}
        onOpenDetails={(m) => {
          setWardDetailMember(m);
          setIsWardDetailOpen(true);
        }}
      />

      {/* 独立监护详情 Modal (老人/小孩) */}
      <WardCareDetailModal
        member={wardDetailMember || selectedMember}
        isOpen={isWardDetailOpen}
        onClose={() => setIsWardDetailOpen(false)}
        onCallMember={(m) => triggerToast(`正在拨打【${m.name}】的电话...`)}
        onSendMessage={(m) => triggerToast(`已发送问候消息给【${m.name}】`)}
      />

      {/* 十一、家庭看护设置与成员管理 (Section XI) */}
      <FamilyMemberManagementModal
        isOpen={isManagementModalOpen}
        onClose={() => setIsManagementModalOpen(false)}
        members={members}
        onUpdateMemberRole={(mId, newRole) => {
          setMembers((prev) => prev.map((m) => (m.id === mId ? { ...m, role: newRole } : m)));
          triggerToast('成员角色调整成功');
        }}
        onToggleLocationPause={(mId) => triggerToast('已暂停该成员的定位自动抓取')}
        onRemoveMember={(mId) => {
          setMembers((prev) => prev.filter((m) => m.id !== mId));
          triggerToast('成员已从幸福家庭组移出');
        }}
        onInviteMember={() => triggerToast('已生成家庭邀请口令：STELLAR-FAMILY-888')}
        onExitFamilyCare={() => {
          setIsManagementModalOpen(false);
          if (onExitFamilyCare) {
            onExitFamilyCare();
          } else {
            onClose();
          }
        }}
        onDisbandFamilyGroup={() => {
          setIsManagementModalOpen(false);
          if (onDisbandFamilyGroup) {
            onDisbandFamilyGroup();
          } else {
            onClose();
          }
        }}
      />

      {/* 十二、权限与隐私 Modals (Section XII) */}
      <FamilyPrivacyPermissionsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        isMyLocationPaused={isMyLocationPaused}
        onTogglePauseMyLocation={() => {
          setIsMyLocationPaused(!isMyLocationPaused);
          triggerToast(!isMyLocationPaused ? '已开启隐身模式（暂停位置更新）' : '已恢复常态位置共享');
        }}
      />

      {/* 十三、家庭集合 Modals (Section XIII) */}
      <FamilyAssemblyCardModal
        isOpen={isAssemblyModalOpen}
        onClose={() => setIsAssemblyModalOpen(false)}
        members={members}
        onConfirmSendInvitations={() => {
          setIsAssemblyModalOpen(false);
          triggerToast('🎉 家庭集合邀请已群发至全员微信及 Stellar 动态通知！', 'success');
        }}
      />

      {/* 围栏时间安排设置 Modal */}
      <GeofenceScheduleModal
        geofence={editingGeofence}
        isOpen={!!editingGeofence}
        onClose={() => setEditingGeofence(null)}
        onSave={(updated) => {
          setGeofences((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
          setEditingGeofence(null);
          triggerToast(`已成功保存【${updated.name}】的规则与布防时段`);
        }}
      />
    </div>
  );
};
