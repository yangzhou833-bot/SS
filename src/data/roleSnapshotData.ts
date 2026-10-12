import { LabelSticker, Friend, NotificationItem, ProfileData } from '../types';
import { INITIAL_USER_STICKERS } from './stickerData';
import { INITIAL_FRIENDS } from './mockData';

export type RoleId = 'new_user' | 'veteran_user';

export interface RoleSnapshot {
  roleId: RoleId;
  roleName: string;
  roleSubtitle: string;
  roleBadge: string;
  roleTag: string;
  operatorName: string;
  avatar: string;
  mood: string;
  battery: number;
  behaviorStatus: string;
  stayDuration?: string;
  speechBubbleText: string;
  bubbleTheme?: string;
  profileData: ProfileData;
  stickers: LabelSticker[];
  hideStickers: boolean;
  friends: Friend[];
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
  streakDays: number;
  unreadCount: number;
}

export const INITIAL_NEW_USER_SNAPSHOT: RoleSnapshot = {
  roleId: 'new_user',
  roleName: '新用户 (萌新探索者)',
  roleSubtitle: 'Empty data · 初始空数据与新手旅程',
  roleBadge: '🌱 萌新首发',
  roleTag: '初来乍到',
  operatorName: 'Alexia (新用户)',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  mood: '🙂',
  battery: 100,
  behaviorStatus: '刚刚到达 · 萌新启航',
  speechBubbleText: '开始你的 Stellar 之旅吧',
  bubbleTheme: '',
  profileData: {
    operatorName: 'Alexia (新用户)',
    operatorId: 'stellar_new_user',
    operatorBio: '刚刚降落 Stellar 宇宙，正在探索中 🌱',
    moodStatus: '在线',
    signature: '点击气泡设置个性签名',
    aboutYou: '这是我的第一个 Stellar 账号，快来加我好友一起探索地图吧！',
    pinnedDetail: '萌新探索者',
    category: '新手探索者',
    isAICreator: false,
    currentCity: '甘肃省兰州市',
    hometown: '甘肃省兰州市',
    birthday: '2026-01-01',
    relationshipStatus: '保密',
    familyStatus: '未绑定',
    gender: '保密',
    languages: '中文',
    websiteLink: '',
    workExperience: '',
    educationHistory: '',
    hobbies: '探索地图',
    interestsMusic: '',
    interestsTV: '',
    interestsMovie: '',
    interestsGame: '',
    interestsSports: '',
    travelPlaces: '',
    socialMedia: '',
    phoneNumber: '',
    emailAddress: '',
    promoMaterials: '',
  },
  stickers: [],
  hideStickers: false,
  friends: [], // Empty for new user
  notifications: [], // Empty inbox
  todayTimeline: [], // Empty timeline
  historyList: [], // Empty history
  streakDays: 0,
  unreadCount: 0,
};

export const INITIAL_VETERAN_USER_SNAPSHOT: RoleSnapshot = {
  roleId: 'veteran_user',
  roleName: '老用户 (资深探索官)',
  roleSubtitle: 'Full data · 满载数据与丰富互动',
  roleBadge: '🌟 资深探索官',
  roleTag: '核心活跃',
  operatorName: 'Alexia Vance',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  mood: '😄',
  battery: 78,
  behaviorStatus: '🚴 骑行中 45km/h · 停留45分',
  stayDuration: '停留 45 分钟',
  speechBubbleText: '今天也要元气满满！',
  bubbleTheme: '#1877F2',
  profileData: {
    operatorName: 'Alexia Vance',
    operatorId: 'stellar_alexia',
    operatorBio: '在线',
    moodStatus: '在线',
    signature: '今天也要元气满满！',
    aboutYou: '热爱户外骑行、摄影与地图探索。在 Stellar 已记录超过 500 公里足迹。',
    pinnedDetail: '数字内容创作者',
    category: '数字内容创作者 · 运动员',
    isAICreator: false,
    currentCity: '甘肃省兰州市城关区',
    hometown: '甘肃省天水市',
    birthday: '1996-10-12',
    relationshipStatus: '单身',
    familyStatus: '陈建国 (父亲)',
    gender: '男性',
    languages: '中文 (普通话), 英语',
    websiteLink: 'https://stellar.vance.io',
    workExperience: 'Stellar 地图探索及安全控制工作室',
    educationHistory: '兰州大学 · 计算机科学与技术',
    hobbies: 'DotA 2, 徒步登山, 摄影, 骑行',
    interestsMusic: 'Post-Rock, Ambient, Electronic',
    interestsTV: '黑客军团 (Mr. Robot), 硅谷',
    interestsMovie: '黑客帝国, 星际穿越',
    interestsGame: 'DotA 2, Cyberpunk 2077',
    interestsSports: '极客自行车队, 越野跑',
    travelPlaces: '青海湖, 祁连山, 麦积山石窟',
    socialMedia: 'stellar_alexia_social',
    phoneNumber: '+86 181 9097 2878',
    emailAddress: 'alexia.vance@stellar.net',
    promoMaterials: 'https://youtube.com/stellar_showcase',
  },
  stickers: INITIAL_USER_STICKERS,
  hideStickers: false,
  friends: INITIAL_FRIENDS,
  notifications: [
    {
      id: 'notif_1',
      title: '贴纸点赞',
      content: 'Sarah 赞了你的「吃货 Foodie」标签贴纸 ❤️',
      time: '2分钟前',
      read: false,
      type: 'like',
    },
    {
      id: 'notif_2',
      title: '实时位置共享',
      content: 'Alex 正在向你共享骑行位置 (车速 45km/h 🚴)',
      time: '15分钟前',
      read: false,
      type: 'radar',
    },
    {
      id: 'notif_3',
      title: '同城活动提醒',
      content: '「周六星空夜骑活动」即将开始，已有 8 位好友报名',
      time: '1小时前',
      read: false,
      type: 'system',
    },
  ],
  todayTimeline: [
    {
      id: 't1',
      time: '08:15 - 09:00',
      title: '早晨漫游 · 世纪公园绿道',
      distance: '3.6 km',
      steps: 4500,
      transport: '骑行 🚴',
      duration: '45 分钟',
    },
    {
      id: 't2',
      time: '09:30 - 11:45',
      title: 'Leonie Bakery 咖啡烘焙坊',
      distance: '0.8 km',
      steps: 920,
      transport: '步行 🚶',
      duration: '2 小时 15 分',
    },
    {
      id: 't3',
      time: '13:00 - 15:30',
      title: '星图创意工坊交流会',
      distance: '4.0 km',
      steps: 700,
      transport: '自驾 🚗',
      duration: '2 小时 30 分',
    },
  ],
  historyList: [
    { id: 'h1', date: '昨天 (周四)', summary: '城市漫步与咖啡探索', distance: '6.8 km', placesCount: 4 },
    { id: 'h2', date: '前天 (周三)', summary: '黄浦滨江夜骑巡航', distance: '12.4 km', placesCount: 2 },
    { id: 'h3', date: '5月28日 (周二)', summary: '高校园区与书店探访', distance: '4.2 km', placesCount: 3 },
    { id: 'h4', date: '5月27日 (周一)', summary: '通勤与商圈停留', distance: '8.1 km', placesCount: 5 },
    { id: 'h5', date: '5月26日 (周日)', summary: '郊野公园露营足迹', distance: '15.6 km', placesCount: 3 },
  ],
  streakDays: 6,
  unreadCount: 3,
};
