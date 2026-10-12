import { LabelSticker, Friend, NotificationItem, ProfileData } from '../types';

export type DualRoleId = 'roleA' | 'roleB';

export interface UserRoleProfile {
  id: DualRoleId;
  userId: string;
  name: string;
  phoneLabel: string;
  operatorName: string;
  avatar: string;
  mood: string;
  battery: number;
  behaviorStatus: string;
  stayDuration?: string;
  speechBubbleText: string;
  bubbleTheme?: string;
  ghostMode: boolean;
  stickers: LabelSticker[];
  hideStickers: boolean;
  profileData: ProfileData;
  notifications: NotificationItem[];
  todayTimeline: {
    id: string;
    time: string;
    title: string;
    distance: string;
    steps: number;
    transport: string;
    duration?: string;
  }[];
  historyList: {
    id: string;
    date: string;
    summary: string;
    distance: string;
    placesCount: number;
  }[];
  unreadCount: number;
}

export interface SharedEvent {
  id: string;
  actorId: DualRoleId;
  targetId: DualRoleId;
  type: 'friend_request' | 'friend_accept' | 'friend_decline' | 'sticker_like' | 'chat_message' | 'poke' | 'location_share_request' | 'location_share_start' | 'location_share_stop' | 'activity_publish' | 'activity_join';
  payload?: any;
  timestamp: string;
  readBy: DualRoleId[];
}

export interface PublishedSharedActivity {
  id: string;
  publisherId: DualRoleId;
  publisherName: string;
  publisherAvatar: string;
  title: string;
  time: string;
  location: string;
  lat: number;
  lng: number;
  category: string;
  participants: DualRoleId[];
  createdAt: string;
}

export interface SharedLocationSharingState {
  active: boolean;
  initiatorId: DualRoleId;
  duration: string; // '1h' | 'today' | 'always'
  startedAt: number;
}

export interface ChecklistStep {
  step: number;
  id: string;
  name: string;
  instruction: string;
  done: boolean;
  completedAt?: string;
}

export interface SharedState {
  friendship: 'none' | 'pending_A_to_B' | 'pending_B_to_A' | 'friends' | 'declined';
  events: SharedEvent[];
  locationSharing: SharedLocationSharingState | null;
  activities: PublishedSharedActivity[];
  checklist: ChecklistStep[];
}

const STORAGE_KEY_ROLE_A = 'stellar_roleA';
const STORAGE_KEY_ROLE_B = 'stellar_roleB';
const STORAGE_KEY_SHARED = 'stellar_shared';
const STORAGE_KEY_ACTIVE_ROLE = 'stellar_active_role';

export const INITIAL_CHECKLIST: ChecklistStep[] = [
  { step: 1, id: 'add_friend', name: '添加好友全链路', instruction: 'Role A 搜索并发送好友申请 → 切换 Role B 接收并同意申请', done: false },
  { step: 2, id: 'map_display', name: '地图与头像角标', instruction: '在地图上查看对方头像（四角角标 + 气泡 + 电池与行为）', done: false },
  { step: 3, id: 'sticker_like', name: '抠图标签贴纸点赞', instruction: '点击对方头像环绕的抠图贴纸点赞 (❤️ +1，推送点赞通知)', done: false },
  { step: 4, id: 'profile_card', name: '个人资料卡片展开', instruction: '地图点击头像放大展开 Orbit 贴纸，上拉 Profile 资料卡片', done: false },
  { step: 5, id: 'chat_poke', name: '私聊与拍一拍互动', instruction: '发送聊天消息或拍一拍互动，接收未读红点与震动反馈', done: false },
  { step: 6, id: 'location_sharing', name: '实时位置双向共享', instruction: '发起位置共享 (1小时/今天/永久) → 同意后卡片与顶部显示共享状态', done: false },
  { step: 7, id: 'publish_activity', name: '发布与赴约同城活动', instruction: 'Role A 发布同城活动并邀请 → 切换 Role B 接收邀请并一键赴约', done: false },
  { step: 8, id: 'notifications', name: '事件驱动通知系统', instruction: '打开消息中心，查看跨用户点赞、活动邀请、好友申请通知', done: false },
  { step: 9, id: 'tracks_history', name: '足迹与 7 天历史', instruction: '在 Profile 或资料卡片中查看本日轨迹分段与 7 天历史记录', done: false },
  { step: 10, id: 'ghost_mode', name: '隐身/隐私模式测试', instruction: '开启隐身模式，对方看到的地图数据降级', done: false },
];

export const DEFAULT_ROLE_A: UserRoleProfile = {
  id: 'roleA',
  userId: 'u_001',
  name: 'Role A (Alexia)',
  phoneLabel: '我的手机 (My Phone)',
  operatorName: 'Alexia Vance',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  mood: '😄',
  battery: 88,
  behaviorStatus: '🚴 骑行中 32km/h',
  speechBubbleText: '准备去世纪公园参加夜骑 🚴',
  bubbleTheme: '#1877F2',
  ghostMode: false,
  stickers: [
    {
      id: 'st_a1',
      cutoutUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=150',
      label: '吃货 Foodie',
      border: { color: '#FFFFFF', widthPx: 3, style: 'solid' },
      sizePx: 48,
      likes: 6,
      likedByMe: false,
      recentLikers: [
        { userId: 'u_002', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' }
      ],
      orbit: { angleDeg: 30, radiusPx: 82, phase: 0.1 },
      hidden: false,
      createdAt: '2026-09-01T10:00:00',
    },
    {
      id: 'st_a2',
      cutoutUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=150',
      label: '极客骑行',
      border: { color: '#1877F2', widthPx: 3, style: 'solid' },
      sizePx: 48,
      likes: 12,
      likedByMe: false,
      recentLikers: [],
      orbit: { angleDeg: 150, radiusPx: 85, phase: 0.4 },
      hidden: false,
      createdAt: '2026-09-02T12:00:00',
    }
  ],
  hideStickers: false,
  profileData: {
    operatorName: 'Alexia Vance',
    operatorId: 'stellar_alexia',
    operatorBio: '在线',
    moodStatus: '在线',
    signature: '准备去世纪公园参加夜骑 🚴',
    aboutYou: '热爱骑行与地图探索。Role A (我的手机视角)。',
    pinnedDetail: '数字内容创作者',
    category: '户外运动 · 骑行者',
    isAICreator: false,
    currentCity: '甘肃省兰州市城关区',
    hometown: '甘肃省天水市',
    birthday: '1996-10-12',
    relationshipStatus: '单身',
    familyStatus: '未绑定',
    gender: '女性',
    languages: '中文, 英语',
    websiteLink: 'https://stellar.vance.io',
    workExperience: 'Stellar 地图探索工作室',
    educationHistory: '兰州大学 · 计算机',
    hobbies: '骑行, 摄影',
    interestsMusic: 'Post-Rock',
    interestsTV: '',
    interestsMovie: '',
    interestsGame: '',
    interestsSports: '',
    travelPlaces: '',
    socialMedia: '',
    phoneNumber: '+86 181 9097 2878',
    emailAddress: 'alexia@stellar.io',
    promoMaterials: '',
  },
  notifications: [],
  todayTimeline: [
    { id: 't1', time: '08:30 - 09:15', title: '早晨漫游 · 兰州黄河风情线', distance: '3.2 km', steps: 4200, transport: '步行' },
    { id: 't2', time: '14:00 - 15:30', title: '极客骑行 · 读者大道', distance: '12.8 km', steps: 0, transport: '骑行' },
  ],
  historyList: [
    { id: 'h1', date: '2026-09-02', summary: '黄河大桥漫步与打卡', distance: '5.6 km', placesCount: 3 },
  ],
  unreadCount: 0,
};

export const DEFAULT_ROLE_B: UserRoleProfile = {
  id: 'roleB',
  userId: 'u_002',
  name: 'Role B (Liam)',
  phoneLabel: "好友的手机 (Friend's Phone)",
  operatorName: 'Liam (好友)',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  mood: '😎',
  battery: 92,
  behaviorStatus: '📍 停留 45 分钟 · 读者咖啡馆',
  stayDuration: '停留 45 分钟',
  speechBubbleText: '在读者咖啡馆喝下午茶 ☕',
  bubbleTheme: '#10B981',
  ghostMode: false,
  stickers: [
    {
      id: 'st_b1',
      cutoutUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=150',
      label: '咖啡狂热 ☕',
      border: { color: '#10B981', widthPx: 3, style: 'solid' },
      sizePx: 48,
      likes: 8,
      likedByMe: false,
      recentLikers: [],
      orbit: { angleDeg: 70, radiusPx: 80, phase: 0.2 },
      hidden: false,
      createdAt: '2026-09-01T11:00:00',
    }
  ],
  hideStickers: false,
  profileData: {
    operatorName: 'Liam (好友)',
    operatorId: 'stellar_liam',
    operatorBio: '在线',
    moodStatus: '在线',
    signature: '在读者咖啡馆喝下午茶 ☕',
    aboutYou: '咖啡爱好者，摄影达人。Role B (好友手机视角)。',
    pinnedDetail: '独立摄影师',
    category: '生活方式 · 摄影',
    isAICreator: false,
    currentCity: '甘肃省兰州市城关区',
    hometown: '甘肃省兰州市',
    birthday: '1998-05-20',
    relationshipStatus: '单身',
    familyStatus: '未绑定',
    gender: '男性',
    languages: '中文',
    websiteLink: '',
    workExperience: '读者文化生活馆',
    educationHistory: '西北师范大学 · 艺术设计',
    hobbies: '咖啡, 摄影',
    interestsMusic: 'Jazz',
    interestsTV: '',
    interestsMovie: '',
    interestsGame: '',
    interestsSports: '',
    travelPlaces: '',
    socialMedia: '',
    phoneNumber: '+86 189 0000 1234',
    emailAddress: 'liam@stellar.io',
    promoMaterials: '',
  },
  notifications: [],
  todayTimeline: [
    { id: 'tb1', time: '10:00 - 11:30', title: '下午茶打卡 · 读者咖啡馆', distance: '1.5 km', steps: 2100, transport: '步行' },
  ],
  historyList: [],
  unreadCount: 0,
};

export const INITIAL_SHARED_STATE: SharedState = {
  friendship: 'none', // Start from zero relationship per requirements
  events: [],
  locationSharing: null,
  activities: [],
  checklist: INITIAL_CHECKLIST,
};

// Listeners for pub/sub reactivity across components
type StoreListener = () => void;
const listeners: Set<StoreListener> = new Set();

export function subscribeDualRoleStore(listener: StoreListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyStoreChange() {
  listeners.forEach((l) => l());
}

// Window storage listener for cross-tab or storage updates
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (
      e.key === STORAGE_KEY_ROLE_A ||
      e.key === STORAGE_KEY_ROLE_B ||
      e.key === STORAGE_KEY_SHARED ||
      e.key === STORAGE_KEY_ACTIVE_ROLE
    ) {
      notifyStoreChange();
    }
  });
}

// Memory Getters / Setters
export function getActiveRoleId(): DualRoleId {
  if (typeof window === 'undefined') return 'roleA';
  return (localStorage.getItem(STORAGE_KEY_ACTIVE_ROLE) as DualRoleId) || 'roleA';
}

export function setActiveRoleId(roleId: DualRoleId) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ACTIVE_ROLE, roleId);
  notifyStoreChange();
}

export function getRoleProfile(roleId: DualRoleId): UserRoleProfile {
  if (typeof window === 'undefined') {
    return roleId === 'roleA' ? DEFAULT_ROLE_A : DEFAULT_ROLE_B;
  }
  const key = roleId === 'roleA' ? STORAGE_KEY_ROLE_A : STORAGE_KEY_ROLE_B;
  const raw = localStorage.getItem(key);
  if (!raw) {
    const initial = roleId === 'roleA' ? DEFAULT_ROLE_A : DEFAULT_ROLE_B;
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    return roleId === 'roleA' ? DEFAULT_ROLE_A : DEFAULT_ROLE_B;
  }
}

export function saveRoleProfile(profile: UserRoleProfile) {
  if (typeof window === 'undefined') return;
  const key = profile.id === 'roleA' ? STORAGE_KEY_ROLE_A : STORAGE_KEY_ROLE_B;
  localStorage.setItem(key, JSON.stringify(profile));
  notifyStoreChange();
}

export function getSharedState(): SharedState {
  if (typeof window === 'undefined') return INITIAL_SHARED_STATE;
  const raw = localStorage.getItem(STORAGE_KEY_SHARED);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify(INITIAL_SHARED_STATE));
    return INITIAL_SHARED_STATE;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return INITIAL_SHARED_STATE;
    }
    if (!Array.isArray(parsed.checklist) || parsed.checklist.length === 0) {
      parsed.checklist = INITIAL_CHECKLIST;
    }
    if (!Array.isArray(parsed.events)) {
      parsed.events = [];
    }
    if (!Array.isArray(parsed.activities)) {
      parsed.activities = [];
    }
    return parsed;
  } catch (err) {
    return INITIAL_SHARED_STATE;
  }
}

export function saveSharedState(shared: SharedState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify(shared));
  notifyStoreChange();
}

export function markChecklistStepDone(stepNumber: number) {
  const shared = getSharedState();
  const updatedChecklist = shared.checklist.map((item) => {
    if (item.step === stepNumber) {
      return {
        ...item,
        done: true,
        completedAt: item.completedAt || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    }
    return item;
  });
  saveSharedState({
    ...shared,
    checklist: updatedChecklist,
  });
}

export function resetAllDualRoleMemory() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ROLE_A, JSON.stringify(DEFAULT_ROLE_A));
  localStorage.setItem(STORAGE_KEY_ROLE_B, JSON.stringify(DEFAULT_ROLE_B));
  localStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify(INITIAL_SHARED_STATE));
  localStorage.setItem(STORAGE_KEY_ACTIVE_ROLE, 'roleA');
  notifyStoreChange();
}

// Action Dispatchers for Dual User Loop
export function sendFriendRequest(actorId: DualRoleId) {
  const shared = getSharedState();
  const targetId: DualRoleId = actorId === 'roleA' ? 'roleB' : 'roleA';
  const newFriendship = actorId === 'roleA' ? 'pending_A_to_B' : 'pending_B_to_A';

  const actorProfile = getRoleProfile(actorId);
  const targetProfile = getRoleProfile(targetId);

  const newEvent: SharedEvent = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId,
    targetId,
    type: 'friend_request',
    timestamp: '刚刚',
    readBy: [actorId],
  };

  // Add notification to target profile
  const newNotif: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: '好友申请',
    content: `${actorProfile.operatorName} 请求添加你为好友`,
    time: '刚刚',
    type: 'message',
    read: false,
  };

  targetProfile.notifications = [newNotif, ...targetProfile.notifications];
  targetProfile.unreadCount += 1;
  saveRoleProfile(targetProfile);

  saveSharedState({
    ...shared,
    friendship: newFriendship,
    events: [newEvent, ...shared.events],
  });
}

export function respondFriendRequest(actorId: DualRoleId, accept: boolean) {
  const shared = getSharedState();
  const targetId: DualRoleId = actorId === 'roleA' ? 'roleB' : 'roleA';
  const newFriendship = accept ? 'friends' : 'declined';

  const actorProfile = getRoleProfile(actorId);
  const targetProfile = getRoleProfile(targetId);

  const newEvent: SharedEvent = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId,
    targetId,
    type: accept ? 'friend_accept' : 'friend_decline',
    timestamp: '刚刚',
    readBy: [actorId],
  };

  const newNotif: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: accept ? '好友申请通过' : '好友申请结果',
    content: accept
      ? `${actorProfile.operatorName} 同意了你的好友申请，现在可以在地图上互相查看实时位置！`
      : `${actorProfile.operatorName} 暂未接收好友申请`,
    time: '刚刚',
    type: accept ? 'system' : 'message',
    read: false,
  };

  targetProfile.notifications = [newNotif, ...targetProfile.notifications];
  targetProfile.unreadCount += 1;
  saveRoleProfile(targetProfile);

  saveSharedState({
    ...shared,
    friendship: newFriendship,
    events: [newEvent, ...shared.events],
  });

  if (accept) {
    markChecklistStepDone(1); // Step 1 Add Friends done!
  }
}

export function likeUserStickerInStore(actorId: DualRoleId, targetId: DualRoleId, stickerId: string) {
  const targetProfile = getRoleProfile(targetId);
  const actorProfile = getRoleProfile(actorId);

  let liked = false;
  targetProfile.stickers = targetProfile.stickers.map((st) => {
    if (st.id === stickerId) {
      liked = !st.likedByMe;
      const newLikes = liked ? st.likes + 1 : Math.max(0, st.likes - 1);
      const existingLikers = st.recentLikers || [];
      const updatedLikers = liked
        ? [{ userId: actorProfile.userId, avatarUrl: actorProfile.avatar }, ...existingLikers.filter((u) => u.userId !== actorProfile.userId)].slice(0, 3)
        : existingLikers.filter((u) => u.userId !== actorProfile.userId);

      return {
        ...st,
        likes: newLikes,
        likedByMe: liked,
        recentLikers: updatedLikers,
      };
    }
    return st;
  });

  saveRoleProfile(targetProfile);

  if (liked && actorId !== targetId) {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: '贴纸点赞 ❤️',
      content: `${actorProfile.operatorName} 赞了你的抠图标签贴纸`,
      time: '刚刚',
      type: 'like',
      read: false,
    };
    targetProfile.notifications = [newNotif, ...targetProfile.notifications];
    targetProfile.unreadCount += 1;
    saveRoleProfile(targetProfile);
  }

  markChecklistStepDone(3); // Step 3 Sticker like done!
}

export function sendChatMessageOrPoke(actorId: DualRoleId, targetId: DualRoleId, content: string, isPoke: boolean = false) {
  const actorProfile = getRoleProfile(actorId);
  const targetProfile = getRoleProfile(targetId);

  const notifTitle = isPoke ? '👉 拍一拍提醒' : '💬 新私聊消息';
  const notifContent = isPoke ? `${actorProfile.operatorName} 拍了拍你：${content || '你今天真棒！'}` : `${actorProfile.operatorName}: ${content}`;

  const newNotif: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: notifTitle,
    content: notifContent,
    time: '刚刚',
    type: 'message',
    read: false,
  };

  targetProfile.notifications = [newNotif, ...targetProfile.notifications];
  targetProfile.unreadCount += 1;
  saveRoleProfile(targetProfile);

  const shared = getSharedState();
  const newEvent: SharedEvent = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId,
    targetId,
    type: isPoke ? 'poke' : 'chat_message',
    payload: { content },
    timestamp: '刚刚',
    readBy: [actorId],
  };

  saveSharedState({
    ...shared,
    events: [newEvent, ...shared.events],
  });

  markChecklistStepDone(5); // Step 5 Chat & Poke done!
}

export function startLocationSharingInStore(actorId: DualRoleId, duration: string) {
  const shared = getSharedState();
  const targetId: DualRoleId = actorId === 'roleA' ? 'roleB' : 'roleA';
  const actorProfile = getRoleProfile(actorId);
  const targetProfile = getRoleProfile(targetId);

  const locationState: SharedLocationSharingState = {
    active: true,
    initiatorId: actorId,
    duration,
    startedAt: Date.now(),
  };

  const newNotif: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: '实时位置共享',
    content: `${actorProfile.operatorName} 已对你开启实时位置共享 (${duration === '1h' ? '1小时' : duration === 'today' ? '直到今天结束' : '永久'})`,
    time: '刚刚',
    type: 'radar',
    read: false,
  };

  targetProfile.notifications = [newNotif, ...targetProfile.notifications];
  targetProfile.unreadCount += 1;
  saveRoleProfile(targetProfile);

  saveSharedState({
    ...shared,
    locationSharing: locationState,
  });

  markChecklistStepDone(6); // Step 6 Location sharing done!
}

export function stopLocationSharingInStore() {
  const shared = getSharedState();
  saveSharedState({
    ...shared,
    locationSharing: null,
  });
}

export function publishSharedActivityInStore(actorId: DualRoleId, activityData: { id?: string; title: string; location: string; time: string; lat?: number; lng?: number }) {
  const shared = getSharedState();
  const targetId: DualRoleId = actorId === 'roleA' ? 'roleB' : 'roleA';
  const actorProfile = getRoleProfile(actorId);
  const targetProfile = getRoleProfile(targetId);

  const existingActivity = shared.activities.find(activity => activity.id === activityData.id);
  const newActivity: PublishedSharedActivity = {
    id: activityData.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    publisherId: existingActivity?.publisherId || actorId,
    publisherName: existingActivity?.publisherName || actorProfile.operatorName,
    publisherAvatar: existingActivity?.publisherAvatar || actorProfile.avatar,
    title: activityData.title || '周六星空夜骑与咖啡聚会',
    time: activityData.time || '本周六 19:30',
    location: activityData.location || '世纪公园 · 兰州黄河风情线',
    lat: activityData.lat ?? 36.0612,
    lng: activityData.lng ?? 103.8343,
    category: '同城骑行',
    participants: existingActivity?.participants || [actorId],
    createdAt: existingActivity?.createdAt || new Date().toISOString(),
  };

  const newNotif: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: '📅 同城活动邀请',
    content: `${actorProfile.operatorName} 发布了同城活动「${newActivity.title}」，邀请你一键赴约！`,
    time: '刚刚',
    type: 'system',
    read: false,
  };

  targetProfile.notifications = [newNotif, ...targetProfile.notifications];
  targetProfile.unreadCount += 1;
  saveRoleProfile(targetProfile);

  saveSharedState({
    ...shared,
    activities: [newActivity, ...shared.activities.filter(activity => activity.id !== newActivity.id)],
  });

  markChecklistStepDone(7); // Step 7 Publish activity done!
}

export function joinSharedActivityInStore(actorId: DualRoleId, activityId: string) {
  const shared = getSharedState();
  if (!shared.activities.some(activity => activity.id === activityId)) return false;
  const actorProfile = getRoleProfile(actorId);

  const updatedActivities = shared.activities.map((act) => {
    if (act.id === activityId) {
      if (!act.participants.includes(actorId)) {
        const newParticipants = [...act.participants, actorId];

        // Notify publisher if not self
        if (act.publisherId !== actorId) {
          const publisherProfile = getRoleProfile(act.publisherId);
          const newNotif: NotificationItem = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            title: '🎉 伙伴已赴约',
            content: `${actorProfile.operatorName} 一键加入了你发布的同城活动「${act.title}」！`,
            time: '刚刚',
            type: 'system',
            read: false,
          };
          publisherProfile.notifications = [newNotif, ...publisherProfile.notifications];
          publisherProfile.unreadCount += 1;
          saveRoleProfile(publisherProfile);
        }

        return {
          ...act,
          participants: newParticipants,
        };
      }
    }
    return act;
  });

  saveSharedState({
    ...shared,
    activities: updatedActivities,
  });

  markChecklistStepDone(7); // Step 7 Join activity done!
  return true;
}
