import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, X, Sparkles, Calendar, Users, Plus, Trash2,
  Check, Camera, AlertTriangle, MapPin, ChevronRight, Pencil, Send
} from 'lucide-react';
import { getActiveRoleId, publishSharedActivityInStore } from '../data/dualRoleStore';
import type { Friend, MapLocation } from '../types';
import { USER_LOCATION } from '../data/mockData';
import { CoordinatePicker } from './CoordinatePicker';
import { activityTimeError, shanghaiTimestamp, validClock, validCoordinates } from '../utils/creationValidation';

// ==========================================
// 1. 数据模型定义 (Data Models)
// ==========================================

export enum ActivityMajorType {
  SPORTS = 'SPORTS',
  TRAVEL = 'TRAVEL',
  SOCIAL = 'SOCIAL',
  FAMILY = 'FAMILY',
  CULTURE = 'CULTURE'
}

export const MAJOR_TYPE_LABELS: Record<ActivityMajorType, { display: string; icon: string }> = {
  [ActivityMajorType.SPORTS]: { display: '体育与户外', icon: '🏃' },
  [ActivityMajorType.TRAVEL]: { display: '旅行度假', icon: '🏔️' },
  [ActivityMajorType.SOCIAL]: { display: '同城兴趣', icon: '☕' },
  [ActivityMajorType.FAMILY]: { display: '亲子家庭', icon: '🧸' },
  [ActivityMajorType.CULTURE]: { display: '文化生活', icon: '📚' }
};

export enum ActivitySubType {
  // 体育与户外
  HIKING = 'HIKING',
  CYCLING = 'CYCLING',
  RUNNING = 'RUNNING',
  BALL_GAMES = 'BALL_GAMES',
  WATER_SPORTS = 'WATER_SPORTS',
  SKIING = 'SKIING',
  // 旅行度假
  SELF_DRIVING = 'SELF_DRIVING',
  RV_CAMPING = 'RV_CAMPING',
  BACKPACKING = 'BACKPACKING',
  STUDY_TOUR = 'STUDY_TOUR',
  // 同城兴趣
  BOARD_GAMES = 'BOARD_GAMES',
  KTV = 'KTV',
  EXHIBITION = 'EXHIBITION',
  MUSIC_FEST = 'MUSIC_FEST',
  FOODIE = 'FOODIE',
  PET_PARTY = 'PET_PARTY',
  // 亲子家庭
  FAMILY_HIKE = 'FAMILY_HIKE',
  NATURE_EDU = 'NATURE_EDU',
  AMUSEMENT = 'AMUSEMENT',
  PARENT_CHILD = 'PARENT_CHILD',
  // 文化生活
  READING = 'READING',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  PAINTING = 'PAINTING',
  BAKING = 'BAKING'
}

export const SUB_TYPE_CONFIG: Record<ActivitySubType, { parent: ActivityMajorType; display: string }> = {
  // 体育与户外
  [ActivitySubType.HIKING]: { parent: ActivityMajorType.SPORTS, display: '徒步登山' },
  [ActivitySubType.CYCLING]: { parent: ActivityMajorType.SPORTS, display: '城市骑行' },
  [ActivitySubType.RUNNING]: { parent: ActivityMajorType.SPORTS, display: '长跑健身' },
  [ActivitySubType.BALL_GAMES]: { parent: ActivityMajorType.SPORTS, display: '球类竞技' },
  [ActivitySubType.WATER_SPORTS]: { parent: ActivityMajorType.SPORTS, display: '水上运动' },
  [ActivitySubType.SKIING]: { parent: ActivityMajorType.SPORTS, display: '冰雪运动' },

  // 旅行度假
  [ActivitySubType.SELF_DRIVING]: { parent: ActivityMajorType.TRAVEL, display: '自驾出游' },
  [ActivitySubType.RV_CAMPING]: { parent: ActivityMajorType.TRAVEL, display: '房车露营' },
  [ActivitySubType.BACKPACKING]: { parent: ActivityMajorType.TRAVEL, display: '背包徒步' },
  [ActivitySubType.STUDY_TOUR]: { parent: ActivityMajorType.TRAVEL, display: '研学旅行' },

  // 同城兴趣
  [ActivitySubType.BOARD_GAMES]: { parent: ActivityMajorType.SOCIAL, display: '桌游剧本杀' },
  [ActivitySubType.KTV]: { parent: ActivityMajorType.SOCIAL, display: '唱K聚会' },
  [ActivitySubType.EXHIBITION]: { parent: ActivityMajorType.SOCIAL, display: '看展看剧' },
  [ActivitySubType.MUSIC_FEST]: { parent: ActivityMajorType.SOCIAL, display: '音乐节' },
  [ActivitySubType.FOODIE]: { parent: ActivityMajorType.SOCIAL, display: '美食探店' },
  [ActivitySubType.PET_PARTY]: { parent: ActivityMajorType.SOCIAL, display: '宠物聚会' },

  // 亲子家庭
  [ActivitySubType.FAMILY_HIKE]: { parent: ActivityMajorType.FAMILY, display: '亲子徒步' },
  [ActivitySubType.NATURE_EDU]: { parent: ActivityMajorType.FAMILY, display: '自然科普' },
  [ActivitySubType.AMUSEMENT]: { parent: ActivityMajorType.FAMILY, display: '乐园游乐' },
  [ActivitySubType.PARENT_CHILD]: { parent: ActivityMajorType.FAMILY, display: '周末溜娃' },

  // 文化生活
  [ActivitySubType.READING]: { parent: ActivityMajorType.CULTURE, display: '阅读会' },
  [ActivitySubType.PHOTOGRAPHY]: { parent: ActivityMajorType.CULTURE, display: '摄影采风' },
  [ActivitySubType.PAINTING]: { parent: ActivityMajorType.CULTURE, display: '绘画写生' },
  [ActivitySubType.BAKING]: { parent: ActivityMajorType.CULTURE, display: '手作烘焙' }
};

export enum NodeType {
  START_POINT = 'START_POINT',
  END_POINT = 'END_POINT',
  SCENIC_SPOT = 'SCENIC_SPOT',
  HOTEL = 'HOTEL',
  RESTAURANT = 'RESTAURANT',
  REST_STOP = 'REST_STOP'
}

export const NODE_TYPE_CONFIG: Record<
  NodeType,
  { display: string; colorBg: string; colorText: string; icon: string }
> = {
  [NodeType.START_POINT]: { display: '起点', colorBg: 'bg-emerald-100', colorText: 'text-emerald-700', icon: '🚩' },
  [NodeType.SCENIC_SPOT]: { display: '景点', colorBg: 'bg-sky-100', colorText: 'text-sky-700', icon: '🌄' },
  [NodeType.HOTEL]: { display: '酒店', colorBg: 'bg-amber-100', colorText: 'text-amber-800', icon: '🏨' },
  [NodeType.RESTAURANT]: { display: '餐厅', colorBg: 'bg-orange-100', colorText: 'text-orange-700', icon: '🍱' },
  [NodeType.REST_STOP]: { display: '休息站', colorBg: 'bg-purple-100', colorText: 'text-purple-700', icon: '☕' },
  [NodeType.END_POINT]: { display: '终点', colorBg: 'bg-rose-100', colorText: 'text-rose-700', icon: '🏁' }
};

export interface ItineraryNode {
  id: string;
  day: number; // Day 1, Day 2...
  time: string; // "09:00"
  title: string; // 地点/项目名称
  nodeType: NodeType;
  latLng?: { lat: number; lng: number } | null;
}

export interface ActivityCreationUiState {
  id?: string;
  lat?: number;
  lng?: number;
  originLocation?: MapLocation;
  venueLocation?: MapLocation;
  // 步骤1：分类
  majorType: ActivityMajorType | null;
  subType: ActivitySubType | null;
  // 步骤2：基础资料
  title: string;
  coverImageUrl: string | null;
  startTime: string;
  endTime: string;
  deadlineTime: string;
  // 步骤3：人数与费用
  maxParticipants: number;
  minParticipants: number;
  feeType: '免费' | 'AA制' | '固定费用';
  fixedFee: number;
  // 步骤4：行程路线 (路书)
  startPoint: string;
  endPoint: string;
  itineraryNodes: ItineraryNode[];
  invitedFriendIds?: string[];
  participantRoles?: Record<string, string>;
  // 步骤5：活动详情
  description: string;
  equipmentTips: string;
  // 步骤6：安全与权限与实时轨迹设置
  visibility: '公开' | '仅好友可见' | '仅小组成员' | '仅参与者' | '仅自己';
  isApprovalRequired: boolean;
  isElectronicFenceEnabled: boolean;
  trackingWindowBeforeMinutes: number; // 默认活动前半小时 (30)
  showParticipantLocationAndDistance: boolean; // 显示参加活动好友的定位与离活动距离 (默认true)
  showParticipantNavigationRoute: boolean; // 显示参加活动所有人员的导航路线与实时速度、到达时间 (默认true)
  enableArrivalAggregationAnimation: boolean; // 到活动地点后产生加入活动动效，聚合动画 (默认true)
  enableFloatingActivityVibes: boolean; // 活动期间主界面两侧活动符号表情与标签飘动 (默认true)
  isMemberArrivalAlertEnabled?: boolean; // 组员进入集合点提醒发起人 (默认true)
  arrivalDistanceThresholdMeters?: number; // 围栏判定距离阈值 (默认100米)
  autoCheckInOnArrival?: boolean; // 到达自动完成活动签到 (默认true)
  // 表单校验状态
  isFormValid: boolean;
  errorMessages: Record<string, string>;
}

// 预设封面图供极速挑选
const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800', // 团队户外
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800', // 山川自驾
  'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&q=80&w=800', // 露营帐篷
  'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800', // 骑行竞技
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800'  // 亲子欢聚
];

// 默认未填写状态
const DEFAULT_EMPTY_STATE: ActivityCreationUiState = {
  majorType: null,
  subType: null,
  title: '',
  coverImageUrl: null,
  startTime: '',
  endTime: '',
  deadlineTime: '',
  maxParticipants: 10,
  minParticipants: 2,
  feeType: '免费',
  fixedFee: 0,
  startPoint: '',
  endPoint: '',
  itineraryNodes: [],
  invitedFriendIds: [],
  participantRoles: { me: '组织者' },
  description: '',
  equipmentTips: '',
  visibility: '公开',
  isApprovalRequired: false,
  isElectronicFenceEnabled: true,
  trackingWindowBeforeMinutes: 30, // 默认设置：活动前半小时
  showParticipantLocationAndDistance: true, // 默认显示参加活动好友的定位与离活动距离
  showParticipantNavigationRoute: true, // 默认显示所有参会人员的导航路线与实时速度、到场时间
  enableArrivalAggregationAnimation: true, // 默认到场产生加入活动聚合动效
  enableFloatingActivityVibes: true, // 默认活动期间两侧表情标签飘动
  isMemberArrivalAlertEnabled: true, // 默认开启组员到达提醒
  arrivalDistanceThresholdMeters: 100, // 默认100米
  autoCheckInOnArrival: true, // 默认自动签到
  isFormValid: false,
  errorMessages: {}
};

interface ActivityCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessPublish?: (activityData: ActivityCreationUiState) => void;
  showToast?: (message: string) => void;
  initialLocation?: { name?: string; address?: string; lat?: number; lng?: number };
  initialActivity?: ActivityCreationUiState;
  friends?: Friend[];
}

const STEP_LABELS = ['活动', '路线', '成员', '确认'];
const PARTICIPANT_ROLES = ['组织者', '领骑', '补给', '摄影', '成员'];
const QUICK_TYPES = [
  { type: ActivitySubType.CYCLING, icon: '🚲', label: '骑行' },
  { type: ActivitySubType.HIKING, icon: '🥾', label: '徒步' },
  { type: ActivitySubType.FOODIE, icon: '☕', label: '聚餐 · 咖啡' },
  { type: ActivitySubType.READING, icon: '📖', label: '读书' }
];

function validateActivity(state: ActivityCreationUiState) {
  const errors: Record<string, string> = {};
  if (!state.title.trim()) errors.title = '请填写活动名称';
  else if (state.title.trim().length > 50) errors.title = '活动名称最多 50 个字';
  if (!state.majorType || !state.subType || SUB_TYPE_CONFIG[state.subType]?.parent !== state.majorType) errors.category = '请选择活动类型';
  const timeError = activityTimeError(state.startTime, state.endTime, state.deadlineTime);
  if (timeError) errors.time = timeError;
  if (!state.originLocation?.name.trim() || !validCoordinates(state.originLocation)) errors.origin = '请选择有效的集合位置';
  if (!state.venueLocation?.name.trim() || !validCoordinates(state.venueLocation)) errors.venue = '请选择有效的活动举办位置';
  if (state.itineraryNodes.some(node => !node.title.trim() || !Number.isInteger(node.day) || node.day < 1 || !validClock(node.time) || !validCoordinates(node.latLng))) errors.itinerary = '请为每个途经点填写时间，并确认地图坐标';
  if (!timeError && !errors.itinerary) {
    const firstDay = shanghaiTimestamp(`${state.startTime.slice(0, 10)} 00:00`);
    if (state.itineraryNodes.some(node => {
      const [hours, minutes] = node.time.split(':').map(Number);
      const at = firstDay + ((node.day - 1) * 1440 + hours * 60 + minutes) * 60000;
      return at < shanghaiTimestamp(state.startTime) || at > shanghaiTimestamp(state.endTime);
    })) errors.itinerary = '途经点时间须在活动开始与结束之间，请检查第几天和计划时间';
  }
  if (!Number.isInteger(state.minParticipants) || state.minParticipants < 1) errors.minParticipants = '最低成团人数必须是大于 0 的整数';
  if (!Number.isInteger(state.maxParticipants) || state.maxParticipants < state.minParticipants) errors.maxParticipants = '人数上限不能低于最低成团人数';
  if (state.feeType === '固定费用' && (!Number.isFinite(state.fixedFee) || state.fixedFee <= 0)) errors.fixedFee = '请填写大于 0 的费用';
  return errors;
}

function errorStep(key: string) {
  if (['origin', 'venue', 'itinerary'].includes(key)) return 2;
  if (['minParticipants', 'maxParticipants', 'fixedFee', 'invitedFriendIds'].includes(key)) return 3;
  return 1;
}

export const ActivityCreationModal: React.FC<ActivityCreationModalProps> = ({
  isOpen, onClose, onSuccessPublish, showToast, initialLocation, initialActivity, friends = []
}) => {
  const [formState, setFormState] = useState<ActivityCreationUiState>(DEFAULT_EMPTY_STATE);
  const [step, setStep] = useState(1);
  const [ready, setReady] = useState(false);
  const [sameVenue, setSameVenue] = useState(true);
  const [originConfirmed, setOriginConfirmed] = useState(false);
  const [venueConfirmed, setVenueConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCovers, setShowCovers] = useState(false);
  const [nodeEditor, setNodeEditor] = useState<ItineraryNode | null>(null);
  const [nodeConfirmed, setNodeConfirmed] = useState(false);
  const [nodeError, setNodeError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const errorSummary = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const published = useRef(false);
  const publishingGuard = useRef(false);
  const availableFriends = friends.filter(friend => !friend.isMe && friend.id !== 'me');
  const invitedIds = formState.invitedFriendIds || [];
  const draftKey = initialActivity?.id ? `stellar_activity_draft:${initialActivity.id}` : 'stellar_activity_draft';

  useEffect(() => {
    if (!isOpen) { setReady(false); return; }
    let next: ActivityCreationUiState = { ...DEFAULT_EMPTY_STATE, itineraryNodes: [], invitedFriendIds: [], participantRoles: { me: '组织者' } };
    if (initialActivity) next = { ...next, ...initialActivity };
    else {
      try {
        const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
        if (draft && typeof draft.title === 'string' && Array.isArray(draft.itineraryNodes)) next = { ...next, ...draft };
      } catch { /* An invalid saved draft leaves the new activity form available. */ }
      if (validCoordinates(initialLocation as MapLocation)) next.venueLocation = { name: initialLocation?.name || '地图选点', address: initialLocation?.address, lat: initialLocation!.lat!, lng: initialLocation!.lng! };
    }
    const sharedPoint = !next.originLocation || Boolean(next.venueLocation && next.originLocation.lat === next.venueLocation.lat && next.originLocation.lng === next.venueLocation.lng && next.originLocation.name === next.venueLocation.name);
    next.venueLocation ||= { name: '', ...USER_LOCATION };
    next.originLocation = sharedPoint ? { ...next.venueLocation } : next.originLocation;
    next.startPoint = next.originLocation?.name || '';
    next.endPoint = next.venueLocation.name;
    next.errorMessages = validateActivity(next);
    next.isFormValid = Object.keys(next.errorMessages).length === 0;
    setFormState(next);
    setSameVenue(sharedPoint);
    setStep(1);
    setOriginConfirmed(false);
    setVenueConfirmed(false);
    setErrors({});
    setNodeEditor(null);
    setShowCovers(false);
    published.current = false;
    publishingGuard.current = false;
    setPublishing(false);
    setReady(true);
  }, [isOpen, initialActivity]);

  useEffect(() => {
    if (!isOpen || !ready || published.current) return;
    try { localStorage.setItem(draftKey, JSON.stringify(formState)); }
    catch { setErrors(previous => ({ ...previous, draft: '草稿未能保存，请释放浏览器存储空间后重试' })); }
  }, [isOpen, ready, formState, draftKey]);

  useEffect(() => {
    if (!isOpen) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => { previousFocus.current?.focus(); };
  }, [isOpen]);

  useEffect(() => { if (Object.keys(errors).length) errorSummary.current?.focus(); }, [errors]);

  useEffect(() => {
    if (!isOpen || (!showCovers && !nodeEditor)) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLElement>('.activity-create-subdialog button')?.focus();
    return () => { previous?.focus(); };
  }, [isOpen, showCovers, Boolean(nodeEditor)]);

  const updateState = (patch: Partial<ActivityCreationUiState>) => {
    setFormState(previous => {
      const next = { ...previous, ...patch };
      const errorMessages = validateActivity(next);
      return { ...next, errorMessages, isFormValid: Object.keys(errorMessages).length === 0 };
    });
    setErrors({});
  };

  const saveDraft = () => {
    try { localStorage.setItem(draftKey, JSON.stringify(formState)); showToast?.('草稿已保存'); return true; }
    catch { setErrors({ draft: '草稿未能保存，请释放浏览器存储空间后重试' }); return false; }
  };
  const close = () => { if (!publishing && saveDraft()) onClose(); };
  const chooseType = (subType: ActivitySubType) => updateState({ subType, majorType: SUB_TYPE_CONFIG[subType].parent });
  const locationChange = (location: MapLocation, confirmed: boolean) => {
    updateState({ venueLocation: location, endPoint: location.name, ...(sameVenue ? { originLocation: { ...location }, startPoint: location.name } : {}) });
    setVenueConfirmed(confirmed);
    if (sameVenue) setOriginConfirmed(confirmed);
  };
  const toggleSameVenue = (checked: boolean) => {
    setSameVenue(checked);
    if (checked && formState.venueLocation) {
      updateState({ originLocation: { ...formState.venueLocation }, startPoint: formState.venueLocation.name });
      setOriginConfirmed(venueConfirmed);
    } else setOriginConfirmed(false);
  };
  const allErrors = () => {
    const result = validateActivity(formState);
    if (!originConfirmed) result.origin = '请确认集合位置';
    if (!venueConfirmed) result.venue = '请确认活动举办位置';
    if (invitedIds.some(id => !availableFriends.some(friend => friend.id === id))) result.invitedFriendIds = '请移除已不在好友列表中的邀请';
    if (invitedIds.length + 1 > formState.maxParticipants) result.maxParticipants = '人数上限不能低于组织者与已邀请好友的总人数';
    return result;
  };
  const nextStep = () => {
    const relevant = Object.fromEntries(Object.entries(allErrors()).filter(([key]) => errorStep(key) === step));
    if (Object.keys(relevant).length) setErrors(relevant);
    else { setErrors({}); setStep(value => Math.min(value + 1, 4)); }
  };
  const openNode = (node?: ItineraryNode) => {
    setNodeEditor(node ? { ...node } : { id: `node-${Date.now()}`, day: 1, time: formState.startTime.slice(11, 16) || '10:00', title: '', nodeType: NodeType.SCENIC_SPOT, latLng: formState.venueLocation ? { lat: formState.venueLocation.lat, lng: formState.venueLocation.lng } : null });
    setNodeConfirmed(Boolean(node && validCoordinates(node.latLng)));
    setNodeError('');
  };
  const saveNode = () => {
    if (!nodeEditor) return;
    if (!nodeEditor.title.trim() || !Number.isInteger(nodeEditor.day) || nodeEditor.day < 1 || !validClock(nodeEditor.time) || !validCoordinates(nodeEditor.latLng) || !nodeConfirmed) {
      setNodeError('请填写途经点名称、有效的日期和时间，并确认地图坐标');
      return;
    }
    const node = { ...nodeEditor, title: nodeEditor.title.trim() };
    updateState({ itineraryNodes: [...formState.itineraryNodes.filter(item => item.id !== node.id), node].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time)) });
    setNodeEditor(null);
  };
  const toggleInvite = (id: string) => {
    const selected = invitedIds.includes(id);
    const participantRoles = { ...formState.participantRoles, me: '组织者' };
    if (selected) delete participantRoles[id];
    else participantRoles[id] = '成员';
    updateState({ invitedFriendIds: selected ? invitedIds.filter(item => item !== id) : [...invitedIds, id], participantRoles });
  };
  const publish = () => {
    if (publishingGuard.current) return;
    const foundErrors = allErrors();
    if (Object.keys(foundErrors).length) { setErrors(foundErrors); return; }
    publishingGuard.current = true;
    setPublishing(true);
    const finalized: ActivityCreationUiState = {
      ...formState, id: formState.id || `act-user-${Date.now()}`, title: formState.title.trim(),
      startPoint: formState.originLocation!.name, endPoint: formState.venueLocation!.name,
      lat: formState.venueLocation!.lat, lng: formState.venueLocation!.lng,
      startTime: formState.startTime.replace('T', ' '), endTime: formState.endTime.replace('T', ' '), deadlineTime: formState.deadlineTime.replace('T', ' '),
      participantRoles: { ...formState.participantRoles, me: '组织者' },
      isFormValid: true, errorMessages: {}
    };
    try {
      publishSharedActivityInStore(getActiveRoleId(), { id: finalized.id, title: finalized.title, location: finalized.venueLocation!.name, time: finalized.startTime, lat: finalized.lat, lng: finalized.lng });
      onSuccessPublish?.(finalized);
      published.current = true;
      localStorage.removeItem(draftKey);
      showToast?.(initialActivity?.id ? '活动已更新' : '活动已发布到地图');
      onClose();
    } catch {
      setFormState(finalized);
      setErrors({ publish: '活动暂未发布成功，内容已保留，请重试' });
      publishingGuard.current = false;
      setPublishing(false);
    }
  };
  const fieldError = (key: string) => errors[key] ? <p id={`activity-error-${key}`} className="activity-create-error">{errors[key]}</p> : null;
  const timeLabel = formState.startTime ? `${formState.startTime.replace('T', ' ')} → ${formState.endTime.replace('T', ' ') || '待设置结束'}` : '设置开始与结束时间';
  const nodeLocation: MapLocation | undefined = nodeEditor ? { name: nodeEditor.title, lat: nodeEditor.latLng?.lat ?? Number.NaN, lng: nodeEditor.latLng?.lng ?? Number.NaN } : undefined;

  if (!isOpen) return null;
  return <div className="activity-create-overlay map-creation-dialog">
    <button type="button" className="activity-create-backdrop" aria-label="保存草稿并关闭活动设置" onClick={close} disabled={publishing}/>
    <div className="activity-create-sheet" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="activity-create-heading" tabIndex={-1} onKeyDown={event => {
      if (event.key === 'Escape') { event.stopPropagation(); if (nodeEditor) setNodeEditor(null); else if (showCovers) setShowCovers(false); else close(); }
      if (event.key === 'Tab') {
        const focusScope = dialog.current?.querySelector<HTMLElement>('.activity-create-subdialog') || dialog.current!;
        const items = [...focusScope.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')].filter(item => !item.closest('details:not([open])') || item.tagName === 'SUMMARY');
        const first = items[0], last = items.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }}>
      <div className="activity-create-handle" aria-hidden="true"/>
      <header className="activity-create-header">
        <div><h2 id="activity-create-heading"><Sparkles size={22} aria-hidden="true"/>{initialActivity?.id ? '编辑活动' : '发起活动'}</h2><p>在地图上集合，把计划变成共同的回忆</p></div>
        <button type="button" className="activity-create-icon" aria-label="保存草稿并关闭" onClick={close} disabled={publishing}><X size={22}/></button>
      </header>
      <nav className="activity-create-steps" aria-label="活动创建步骤">{STEP_LABELS.map((label, index) => <button key={`step-${label}-${index}`} type="button" aria-current={step === index + 1 ? 'step' : undefined} onClick={() => { setStep(index + 1); setErrors({}); }}><span>{index + 1}</span>{label}</button>)}</nav>
      <main className="activity-create-body">
        {Object.keys(errors).length > 0 && <div className="activity-create-error-summary" role="alert" tabIndex={-1} ref={errorSummary}><strong><AlertTriangle size={18} aria-hidden="true"/>请完善以下内容</strong><ul>{Object.entries(errors).map(([key, message]) => <li key={key}><button type="button" onClick={() => { if (!['draft', 'publish'].includes(key)) setStep(errorStep(key)); }}>{message}<ChevronRight size={15} aria-hidden="true"/></button></li>)}</ul></div>}
        {step === 1 && <section aria-label="活动基础设置" className="activity-create-section">
          <div className="activity-create-title-card">
            <button type="button" className="activity-create-cover" aria-label="选择活动封面" onClick={() => setShowCovers(true)}>{formState.coverImageUrl ? <img src={formState.coverImageUrl} alt="活动封面"/> : <><Camera size={26}/><span>添加封面</span></>}<span className="activity-create-cover-edit"><Camera size={14}/></span></button>
            <label htmlFor="activity-title">活动名称<input id="activity-title" value={formState.title} maxLength={50} placeholder="例如：城市日落骑行" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'activity-error-title' : undefined} onChange={event => updateState({ title: event.target.value })}/><small>{formState.title.length}/50</small>{fieldError('title')}</label>
          </div>
          <div className="activity-create-chips" aria-label="活动类型快捷选择">{QUICK_TYPES.map(item => <button type="button" key={item.type} aria-pressed={formState.subType === item.type} onClick={() => chooseType(item.type)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}</div>
          <details className="activity-create-fold"><summary>更多活动类型<span>{formState.subType ? SUB_TYPE_CONFIG[formState.subType].display : '请选择'}<ChevronRight size={16}/></span></summary><div className="activity-create-chips">{Object.values(ActivityMajorType).map(type => <button type="button" key={type} aria-pressed={formState.majorType === type} onClick={() => chooseType(Object.values(ActivitySubType).find(item => SUB_TYPE_CONFIG[item].parent === type)!)}>{MAJOR_TYPE_LABELS[type].icon} {MAJOR_TYPE_LABELS[type].display}</button>)}</div>{formState.majorType && <div className="activity-create-chips">{Object.values(ActivitySubType).filter(type => SUB_TYPE_CONFIG[type].parent === formState.majorType).map(type => <button type="button" key={type} aria-pressed={formState.subType === type} onClick={() => chooseType(type)}>{SUB_TYPE_CONFIG[type].display}</button>)}</div>}</details>
          {fieldError('category')}
          <details className="activity-create-fold" open><summary><span><Calendar size={18}/>活动时间</span></summary><div className="activity-create-fields"><label htmlFor="activity-start">开始时间<input id="activity-start" type="datetime-local" value={formState.startTime.replace(' ', 'T')} aria-invalid={Boolean(errors.time)} aria-describedby={errors.time ? 'activity-error-time' : undefined} onChange={event => updateState({ startTime: event.target.value })}/></label><label htmlFor="activity-end">结束时间<input id="activity-end" type="datetime-local" value={formState.endTime.replace(' ', 'T')} aria-invalid={Boolean(errors.time)} onChange={event => updateState({ endTime: event.target.value })}/></label></div><label htmlFor="activity-deadline">报名截止时间 · 选填<input id="activity-deadline" type="datetime-local" value={formState.deadlineTime.replace(' ', 'T')} onChange={event => updateState({ deadlineTime: event.target.value })}/></label><p className="activity-create-hint">跨日活动请为结束时间选择相应日期。</p>{fieldError('time')}</details>
          <div className="activity-create-setting-cards"><button type="button" onClick={() => setStep(2)}><MapPin size={20}/><span>集合 / 举办地点<strong>{formState.venueLocation?.name || '去地图选点'}</strong></span><ChevronRight size={16}/></button><button type="button" onClick={() => setStep(3)}><Users size={20}/><span>邀请与分工<strong>{invitedIds.length ? `已选 ${invitedIds.length} 位好友` : '邀请好友一起加入'}</strong></span><ChevronRight size={16}/></button></div>
          <details className="activity-create-fold"><summary>活动说明与装备<span>选填<ChevronRight size={16}/></span></summary><label htmlFor="activity-description">活动说明<textarea id="activity-description" rows={3} placeholder="分享活动安排、参与要求或想一起做的事" value={formState.description} onChange={event => updateState({ description: event.target.value })}/></label><label htmlFor="activity-equipment">装备提醒<textarea id="activity-equipment" rows={2} placeholder="例如：头盔、水、充电宝" value={formState.equipmentTips} onChange={event => updateState({ equipmentTips: event.target.value })}/></label></details>
        </section>}
        {step === 2 && <section aria-label="活动路线设置" className="activity-create-section">
          <div className="activity-create-intro"><h3>先选地点，再安排路线</h3><p>移动地图，将图钉对准实际位置；请核对地点名称并确认。</p></div>
          <CoordinatePicker label="活动举办位置" description="活动的主要场地或行程目的地。" value={formState.venueLocation} confirmed={venueConfirmed} onChange={locationChange}/>{fieldError('venue')}
          <label className="activity-create-toggle"><span>集合与举办位置相同<small>确认举办位置后，同步确认集合位置</small></span><input type="checkbox" checked={sameVenue} onChange={event => toggleSameVenue(event.target.checked)}/></label>
          {!sameVenue && <CoordinatePicker label="发起 / 集合位置" description="好友先在这里集合，再一起前往活动地点。" value={formState.originLocation} confirmed={originConfirmed} onChange={(location, confirmed) => { updateState({ originLocation: location, startPoint: location.name }); setOriginConfirmed(confirmed); }}/>}{fieldError('origin')}
          <div className="activity-create-route-plan"><h3>路线计划 <small>地点示意</small></h3><ol><li><span className="activity-create-route-dot">起</span><div><strong>{formState.originLocation?.name || '待选择集合点'}</strong><small>集合出发</small></div></li>{formState.itineraryNodes.map(node => <li key={node.id}><span className="activity-create-route-dot">{NODE_TYPE_CONFIG[node.nodeType]?.icon || '📍'}</span><div><strong>{node.title}</strong><small>第 {node.day} 天 · {node.time} · {validCoordinates(node.latLng) ? '坐标已设定' : '需要确认坐标'}</small></div><button type="button" className="activity-create-icon" aria-label={`编辑途经点 ${node.title}`} onClick={() => openNode(node)}><Pencil size={18}/></button><button type="button" className="activity-create-icon" aria-label={`删除途经点 ${node.title}`} onClick={() => updateState({ itineraryNodes: formState.itineraryNodes.filter(item => item.id !== node.id) })}><Trash2 size={18}/></button></li>)}<li><span className="activity-create-route-dot">终</span><div><strong>{formState.venueLocation?.name || '待选择活动地点'}</strong><small>活动举办位置</small></div></li></ol><button type="button" className="activity-create-secondary" onClick={() => openNode()}><Plus size={18}/>添加途经点</button><p className="activity-create-hint">这里保存途经坐标；实际道路路线在发布后通过导航规划。</p>{fieldError('itinerary')}</div>
        </section>}
        {step === 3 && <section aria-label="活动成员设置" className="activity-create-section">
          <div className="activity-create-intro"><h3>邀请好友，分工一起完成</h3><p>你是组织者。被邀请的好友会在加入后成为活动成员。</p></div>
          <div className="activity-create-organizer"><Users size={20}/><strong>我</strong><span>组织者</span></div>
          <div className="activity-create-friends">{availableFriends.map(friend => {
            const selected = invitedIds.includes(friend.id);
            return <div className="activity-create-friend" key={friend.id}><button type="button" aria-pressed={selected} aria-label={`${selected ? '取消邀请' : '邀请'} ${friend.name}`} onClick={() => toggleInvite(friend.id)}><img src={friend.avatar} alt=""/><strong>{friend.name}</strong><span className="activity-create-selection">{selected ? <Check size={16}/> : <Plus size={16}/>}</span></button>{selected && <label>分工<select aria-label={`${friend.name}的活动分工`} value={formState.participantRoles?.[friend.id] || '成员'} onChange={event => updateState({ participantRoles: { ...formState.participantRoles, [friend.id]: event.target.value, me: '组织者' } })}>{PARTICIPANT_ROLES.map(role => <option key={role}>{role}</option>)}</select></label>}</div>;
          })}{availableFriends.length === 0 && <p className="activity-create-empty">当前没有可邀请的好友，你仍可先发布活动。</p>}{invitedIds.filter(id => !availableFriends.some(friend => friend.id === id)).map(id => <div className="activity-create-organizer" key={id}><span>草稿中的好友已不在好友列表</span><button type="button" className="activity-create-icon" aria-label="移除已失效邀请" onClick={() => toggleInvite(id)}><X size={18}/></button></div>)}</div>
          <p className="activity-create-hint">已选择 {invitedIds.length} 位好友；邀请不代表已确认参加。</p>
          <details className="activity-create-fold"><summary>人数与费用<span>{formState.feeType}<ChevronRight size={16}/></span></summary><div className="activity-create-fields"><label htmlFor="activity-min">最低成团人数<input id="activity-min" type="number" min={1} step={1} value={Number.isFinite(formState.minParticipants) ? formState.minParticipants : ''} aria-invalid={Boolean(errors.minParticipants)} onChange={event => updateState({ minParticipants: event.target.value ? Number(event.target.value) : Number.NaN })}/>{fieldError('minParticipants')}</label><label htmlFor="activity-max">人数上限<input id="activity-max" type="number" min={1} step={1} value={Number.isFinite(formState.maxParticipants) ? formState.maxParticipants : ''} aria-invalid={Boolean(errors.maxParticipants)} onChange={event => updateState({ maxParticipants: event.target.value ? Number(event.target.value) : Number.NaN })}/>{fieldError('maxParticipants')}</label></div><label htmlFor="activity-fee-type">费用方式<select id="activity-fee-type" value={formState.feeType} onChange={event => updateState({ feeType: event.target.value as ActivityCreationUiState['feeType'] })}>{['免费', 'AA制', '固定费用'].map(type => <option key={type}>{type}</option>)}</select></label>{formState.feeType === '固定费用' && <label htmlFor="activity-fee">每人费用（元）<input id="activity-fee" type="number" min={0.01} step={0.01} value={Number.isFinite(formState.fixedFee) ? formState.fixedFee : ''} aria-invalid={Boolean(errors.fixedFee)} onChange={event => updateState({ fixedFee: event.target.value ? Number(event.target.value) : Number.NaN })}/>{fieldError('fixedFee')}</label>}</details>
        </section>}
        {step === 4 && <section aria-label="活动发布确认" className="activity-create-section">
          <div className="activity-create-review"><div className="activity-create-review-heading">{formState.coverImageUrl && <img src={formState.coverImageUrl} alt="活动封面"/>}<div><small>{formState.subType ? SUB_TYPE_CONFIG[formState.subType].display : '待选择类型'}</small><h3>{formState.title || '未命名活动'}</h3><span>{formState.feeType}{formState.feeType === '固定费用' ? ` · ¥${formState.fixedFee}/人` : ''}</span></div></div><p><Calendar size={18}/><span>{timeLabel}</span></p><p><MapPin size={18}/><span>{formState.originLocation?.name || '待选集合点'} → {formState.venueLocation?.name || '待选举办地点'}<small>{formState.itineraryNodes.length} 个途经点 · {originConfirmed && venueConfirmed ? '位置已确认' : '位置尚未确认'}</small></span></p><p><Users size={18}/><span>我 · 组织者{availableFriends.filter(friend => invitedIds.includes(friend.id)).map(friend => <small key={friend.id}>{friend.name} · {formState.participantRoles?.[friend.id] || '成员'}（待加入）</small>)}<small>{formState.minParticipants} 人成团 · 最多 {formState.maxParticipants} 人</small></span></p>{formState.description && <p>{formState.description}</p>}{formState.equipmentTips && <p><strong>装备提醒</strong><span>{formState.equipmentTips}</span></p>}<button type="button" className="activity-create-secondary" onClick={() => setStep(1)}><Pencil size={17}/>返回修改</button></div>
          <details className="activity-create-fold"><summary>可见范围与活动设置<span>{formState.visibility}<ChevronRight size={16}/></span></summary><label htmlFor="activity-visibility">谁能看到活动<select id="activity-visibility" value={formState.visibility} onChange={event => updateState({ visibility: event.target.value as ActivityCreationUiState['visibility'] })}>{['公开', '仅好友可见', '仅小组成员', '仅参与者', '仅自己'].map(value => <option key={value}>{value}</option>)}</select></label>{([
            ['isApprovalRequired', '参加前需要审批'], ['isElectronicFenceEnabled', '活动地点到达检测'], ['showParticipantLocationAndDistance', '显示成员位置与距离'], ['showParticipantNavigationRoute', '显示成员前往路线'], ['enableArrivalAggregationAnimation', '到达动效'], ['enableFloatingActivityVibes', '地图活动氛围'], ['isMemberArrivalAlertEnabled', '成员到达时提醒我'], ['autoCheckInOnArrival', '到达后自动签到']
          ] as const).map(([key, label]) => <label className="activity-create-toggle" key={key}><span>{label}</span><input type="checkbox" checked={Boolean(formState[key])} onChange={event => updateState({ [key]: event.target.checked })}/></label>)}<div className="activity-create-fields"><label htmlFor="activity-tracking">活动前开始共享位置<select id="activity-tracking" value={formState.trackingWindowBeforeMinutes} onChange={event => updateState({ trackingWindowBeforeMinutes: Number(event.target.value) })}>{[0, 15, 30, 60].map(value => <option key={value} value={value}>{value === 0 ? '活动开始时' : `提前 ${value} 分钟`}</option>)}</select></label><label htmlFor="activity-arrival">到达检测范围<select id="activity-arrival" value={formState.arrivalDistanceThresholdMeters ?? 100} onChange={event => updateState({ arrivalDistanceThresholdMeters: Number(event.target.value) })}>{[100, 200, 500].map(value => <option key={value} value={value}>{value} 米</option>)}</select></label></div></details>
          <p className="activity-create-hint">发布后在地图主页展示活动，日程与出发提醒会沿用现有设置。</p>
        </section>}
      </main>
      <footer className="activity-create-footer"><button type="button" className="activity-create-secondary" onClick={() => step > 1 ? (setStep(step - 1), setErrors({})) : saveDraft()} disabled={publishing}>{step > 1 ? <><ArrowLeft size={18}/>上一步</> : '保存草稿'}</button><button type="button" className="activity-create-primary" onClick={step === 4 ? publish : nextStep} disabled={publishing}>{step === 4 ? <><Send size={19}/>{publishing ? '正在发布…' : initialActivity?.id ? '确认并更新' : '确认并发布'}</> : <>下一步<ChevronRight size={18}/></>}</button></footer>
      {showCovers && <div className="activity-create-subdialog" role="dialog" aria-modal="true" aria-label="选择活动封面"><div className="activity-create-subheader"><h3>选择封面</h3><button type="button" className="activity-create-icon" aria-label="关闭封面选择" onClick={() => setShowCovers(false)}><X size={21}/></button></div><div className="activity-create-cover-grid">{PRESET_COVERS.map((url, index) => <button type="button" key={url} aria-label={`选择封面 ${index + 1}`} aria-pressed={formState.coverImageUrl === url} onClick={() => { updateState({ coverImageUrl: url }); setShowCovers(false); }}><img src={url} alt={`活动封面 ${index + 1}`} loading="lazy"/>{formState.coverImageUrl === url && <Check size={21}/>}</button>)}</div><button type="button" className="activity-create-secondary" onClick={() => { updateState({ coverImageUrl: null }); setShowCovers(false); }}>不使用封面</button></div>}
      {nodeEditor && <div className="activity-create-subdialog" role="dialog" aria-modal="true" aria-label="途经点设置"><div className="activity-create-subheader"><h3>{formState.itineraryNodes.some(node => node.id === nodeEditor.id) ? '编辑途经点' : '添加途经点'}</h3><button type="button" className="activity-create-icon" aria-label="取消途经点设置" onClick={() => setNodeEditor(null)}><X size={21}/></button></div>{nodeError && <p role="alert" className="activity-create-error">{nodeError}</p>}<div className="activity-create-fields"><label htmlFor="activity-node-day">第几天<input id="activity-node-day" type="number" min={1} step={1} value={Number.isFinite(nodeEditor.day) ? nodeEditor.day : ''} onChange={event => setNodeEditor({ ...nodeEditor, day: event.target.value ? Number(event.target.value) : Number.NaN })}/></label><label htmlFor="activity-node-time">计划时间<input id="activity-node-time" type="time" value={nodeEditor.time} onChange={event => setNodeEditor({ ...nodeEditor, time: event.target.value })}/></label></div><label htmlFor="activity-node-type">地点类型<select id="activity-node-type" value={nodeEditor.nodeType} onChange={event => setNodeEditor({ ...nodeEditor, nodeType: event.target.value as NodeType })}>{Object.values(NodeType).map(type => <option value={type} key={type}>{NODE_TYPE_CONFIG[type].display}</option>)}</select></label><CoordinatePicker label="途经点位置" value={nodeLocation} confirmed={nodeConfirmed} onChange={(location, confirmed) => { setNodeEditor({ ...nodeEditor, title: location.name, latLng: { lat: location.lat, lng: location.lng } }); setNodeConfirmed(confirmed); setNodeError(''); }}/><button type="button" className="activity-create-primary" onClick={saveNode}><Check size={19}/>保存途经点</button></div>}
    </div>
  </div>;
};
