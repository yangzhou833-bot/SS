import {
  LifePlace,
  LifePlaceCategory,
  LifePlaceVisit,
  LifePlaceEncounterFriend,
  LifePlaceShareTarget,
} from '../types';
import { calculateLatLngDistanceMeters } from '../utils/geoUtils';
import { USER_LOCATION } from './mockData';

export const LIFE_PLACE_CATEGORIES: {
  key: LifePlaceCategory;
  label: string;
  icon: string;
  color: string;
  gradient: string;
}[] = [
  { key: 'cafe', label: '咖啡馆', icon: '☕', color: '#F2A65A', gradient: 'from-amber-500 to-orange-600' },
  { key: 'food', label: '美食餐厅', icon: '🍜', color: '#EF4444', gradient: 'from-rose-500 to-red-600' },
  { key: 'nature', label: '公园绿地', icon: '🌳', color: '#10B981', gradient: 'from-emerald-500 to-teal-600' },
  { key: 'viewpoint', label: '观景点', icon: '🌅', color: '#8B5CF6', gradient: 'from-violet-500 to-purple-600' },
  { key: 'home', label: '住宅驻地', icon: '🏠', color: '#1877F2', gradient: 'from-blue-500 to-indigo-600' },
  { key: 'music', label: '黑胶音乐', icon: '🎧', color: '#EC4899', gradient: 'from-pink-500 to-rose-600' },
  { key: 'fitness', label: '运动健身', icon: '🏋️', color: '#06B6D4', gradient: 'from-cyan-500 to-blue-600' },
  { key: 'study', label: '书店自习', icon: '📚', color: '#F59E0B', gradient: 'from-amber-400 to-yellow-600' },
  { key: 'bar', label: '小酌酒馆', icon: '🍸', color: '#6366F1', gradient: 'from-indigo-500 to-purple-600' },
  { key: 'secret', label: '秘密据点', icon: '✨', color: '#A855F7', gradient: 'from-purple-500 to-fuchsia-600' },
  { key: 'shopping', label: '探店购物', icon: '🛍️', color: '#14B8A6', gradient: 'from-teal-500 to-emerald-600' },
  { key: 'other', label: '生活其他', icon: '📍', color: '#64748B', gradient: 'from-slate-500 to-gray-600' },
];

export const INITIAL_LIFE_PLACES: LifePlace[] = [
  {
    id: 'p_1001',
    name: 'Leonie Bakery · 慢烘焙咖啡馆',
    category: 'cafe',
    icon: '☕',
    color: '#F2A65A',
    lat: 36.0612,
    lng: 103.8368,
    createdBy: {
      id: 'me',
      name: '我 (Alexia)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      isMe: true,
    },
    createdAt: '2025-03-12T09:20:00Z',
    createdByMe: true,
    source: 'self',
    tags: ['安静舒适', 'Wi-Fi稳定', '手冲单品', '阳光露台'],
    privacy: 'friends_only',
    note: '城关区最安静的露台手冲咖啡，采光极佳。常来这里写代码、整理周报和读纸质书，手冲耶加雪菲风味绝佳。',
    photos: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600',
    ],
    distanceKm: 0.35,
    direction: '东北方向',
    isSaved: true,
    memory: {
      visitCount: 12,
      totalDwellMinutes: 560,
      avgStayMinutes: 47,
      firstVisitAt: '2025-03-15T08:40:00Z',
      lastVisitAt: '2026-06-01T12:17:00Z',
      currentlyHere: false,
      currentDwellMinutes: 0,
      visitSparklineWeeks: [1, 2, 0, 3, 1, 2, 2, 1],
      dominantMood: '😄',
      visits: [
        {
          id: 'v_101',
          date: '2026-06-01',
          arrival: '12:17',
          departure: '13:02',
          minutes: 45,
          mood: '😄',
          metFriends: ['u_002'],
          note: '午休来喝了冰美式，偶遇 Aria 讨论了周末徒步计划',
          photos: [
            'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600',
          ],
        },
        {
          id: 'v_102',
          date: '2026-05-24',
          arrival: '15:10',
          departure: '16:30',
          minutes: 80,
          mood: '☕',
          metFriends: ['u_002', 'u_003'],
          note: '三人露台下午茶，阳光正好',
        },
        {
          id: 'v_103',
          date: '2026-05-18',
          arrival: '09:30',
          departure: '10:45',
          minutes: 75,
          mood: '✨',
          metFriends: ['u_004'],
          note: '早起阅读，点了招牌可颂',
        },
        {
          id: 'v_104',
          date: '2026-05-09',
          arrival: '14:00',
          departure: '15:10',
          minutes: 70,
          mood: '💻',
          metFriends: ['u_002'],
          note: '深度工作 1 小时，写完了交互提案',
        },
      ],
    },
    encounters: {
      friendCount: 3,
      totalEncounters: 7,
      friends: [
        {
          id: 'u_002',
          name: 'Aria (薛梦)',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
          closeness: 'bff',
          encounterCount: 3,
          lastEncounterAt: '2026-06-01 12:30',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-06-01',
              from: '12:20',
              to: '13:00',
              myStayMinutes: 45,
              theirStayMinutes: 40,
              overlapMinutes: 40,
              myLocation: { lat: 36.0612, lng: 103.8368 },
              theirLocation: { lat: 36.0613, lng: 103.8367 },
            },
            {
              date: '2026-05-24',
              from: '15:20',
              to: '16:15',
              myStayMinutes: 80,
              theirStayMinutes: 55,
              overlapMinutes: 55,
              myLocation: { lat: 36.0612, lng: 103.8368 },
              theirLocation: { lat: 36.0611, lng: 103.8369 },
            },
            {
              date: '2026-05-09',
              from: '14:15',
              to: '15:00',
              myStayMinutes: 70,
              theirStayMinutes: 60,
              overlapMinutes: 45,
              myLocation: { lat: 36.0612, lng: 103.8368 },
              theirLocation: { lat: 36.0612, lng: 103.8368 },
            },
          ],
        },
        {
          id: 'u_003',
          name: 'Noah (林澈)',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
          closeness: 'close',
          encounterCount: 2,
          lastEncounterAt: '2026-05-24 15:40',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-05-24',
              from: '15:30',
              to: '16:20',
              myStayMinutes: 80,
              theirStayMinutes: 50,
              overlapMinutes: 50,
            },
            {
              date: '2026-04-12',
              from: '11:00',
              to: '11:35',
              myStayMinutes: 60,
              theirStayMinutes: 35,
              overlapMinutes: 35,
            },
          ],
        },
        {
          id: 'u_004',
          name: 'Lucas (陈予涵)',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
          closeness: 'friend',
          encounterCount: 2,
          lastEncounterAt: '2026-05-18 10:10',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-05-18',
              from: '09:50',
              to: '10:40',
              myStayMinutes: 75,
              theirStayMinutes: 50,
              overlapMinutes: 50,
            },
            {
              date: '2026-03-29',
              from: '16:00',
              to: '16:30',
              myStayMinutes: 60,
              theirStayMinutes: 30,
              overlapMinutes: 30,
            },
          ],
        },
      ],
    },
    visitors: {
      friendsWhoVisit: [
        { id: 'u_002', name: 'Aria (薛梦)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300', visitCount: 15, visible: true },
        { id: 'u_003', name: 'Noah (林澈)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', visitCount: 8, visible: true },
        { id: 'u_004', name: 'Lucas (陈予涵)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', visitCount: 6, visible: true },
        { id: 'u_005', name: 'Elena (苏微)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300', visitCount: 4, visible: true },
      ],
      popularByWeekdayHour: [
        [0, 0, 0, 1, 2, 1, 0],
        [0, 1, 2, 3, 2, 1, 0],
        [0, 1, 2, 2, 2, 1, 0],
        [0, 1, 3, 3, 2, 1, 0],
        [0, 2, 3, 4, 3, 2, 1],
        [1, 3, 5, 5, 4, 3, 2], // Saturday peak
        [1, 3, 4, 4, 3, 2, 1], // Sunday
      ],
    },
    sharing: {
      forwardedTo: [
        {
          userId: 'u_002',
          userName: 'Aria (薛梦)',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
          mode: 'added_to_map',
          shareVisitCount: true,
          sharePhotos: true,
          shareEncounters: false,
          shareNotes: true,
          at: '2026-05-10 14:00',
        },
      ],
      revocable: true,
    },
  },
  {
    id: 'p_1002',
    name: '白塔山观景台 · 黄河晚霞秘密基地',
    category: 'viewpoint',
    icon: '🌅',
    color: '#8B5CF6',
    lat: 36.0685,
    lng: 103.8290,
    createdBy: {
      id: 'u_002',
      name: 'Aria (薛梦)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
      isMe: false,
    },
    createdAt: '2025-04-05T17:30:00Z',
    createdByMe: false,
    source: 'forwarded',
    tags: ['落日全景', '黄河风情', '夜景机位', '避开人流'],
    privacy: 'friends_only',
    note: '每次傍晚在这里看中山桥与黄河两岸落日灯火，微风拂面非常治愈。二号拐角处的石凳视野最佳。',
    photos: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600',
    ],
    distanceKm: 1.15,
    direction: '西北方向',
    isSaved: true,
    memory: {
      visitCount: 8,
      totalDwellMinutes: 340,
      avgStayMinutes: 42,
      firstVisitAt: '2025-04-10T18:10:00Z',
      lastVisitAt: '2026-05-30T19:20:00Z',
      currentlyHere: false,
      currentDwellMinutes: 0,
      visitSparklineWeeks: [0, 1, 2, 1, 0, 2, 1, 1],
      dominantMood: '🌅',
      visits: [
        {
          id: 'v_201',
          date: '2026-05-30',
          arrival: '19:00',
          departure: '19:50',
          minutes: 50,
          mood: '🌅',
          metFriends: ['u_002'],
          note: '黄河初夏晚霞极其壮观，粉紫色的天幕',
        },
        {
          id: 'v_202',
          date: '2026-05-15',
          arrival: '18:40',
          departure: '19:25',
          minutes: 45,
          mood: '📸',
          metFriends: ['u_002', 'u_005'],
          note: '带了微单拍延时摄影，遇到 Elena',
        },
      ],
    },
    encounters: {
      friendCount: 2,
      totalEncounters: 5,
      friends: [
        {
          id: 'u_002',
          name: 'Aria (薛梦)',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
          closeness: 'bff',
          encounterCount: 4,
          lastEncounterAt: '2026-05-30 19:15',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-05-30',
              from: '19:05',
              to: '19:45',
              myStayMinutes: 50,
              theirStayMinutes: 45,
              overlapMinutes: 40,
            },
          ],
        },
        {
          id: 'u_005',
          name: 'Elena (苏微)',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
          closeness: 'friend',
          encounterCount: 1,
          lastEncounterAt: '2026-05-15 18:50',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-05-15',
              from: '18:45',
              to: '19:15',
              myStayMinutes: 45,
              theirStayMinutes: 30,
              overlapMinutes: 30,
            },
          ],
        },
      ],
    },
    visitors: {
      friendsWhoVisit: [
        { id: 'u_002', name: 'Aria (薛梦)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300', visitCount: 19, visible: true },
        { id: 'u_005', name: 'Elena (苏微)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300', visitCount: 7, visible: true },
      ],
      popularByWeekdayHour: [
        [0, 0, 0, 0, 2, 4, 1],
        [0, 0, 0, 0, 2, 4, 1],
        [0, 0, 0, 0, 2, 5, 1],
        [0, 0, 0, 0, 3, 5, 1],
        [0, 0, 0, 0, 4, 6, 2],
        [0, 1, 2, 3, 5, 7, 3], // Saturday
        [0, 1, 2, 3, 5, 6, 2], // Sunday
      ],
    },
    sharing: {
      forwardedTo: [],
      revocable: false,
    },
  },
  {
    id: 'p_1003',
    name: 'Midnight Vinyl · 黑胶唱片与深夜威士忌',
    category: 'music',
    icon: '🎧',
    color: '#EC4899',
    lat: 36.0545,
    lng: 103.8395,
    createdBy: {
      id: 'me',
      name: '我 (Alexia)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      isMe: true,
    },
    createdAt: '2025-01-20T20:00:00Z',
    createdByMe: true,
    source: 'self',
    tags: ['爵士黑胶', '深夜小酌', '沉浸听歌', '私密低光'],
    privacy: 'friends_only',
    note: '老式黑胶唱机放着 Bill Evans，无酒精特调和单麦芽威士忌都很专业。夜间灵感充电站。',
    photos: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
    ],
    distanceKm: 0.65,
    direction: '东南方向',
    isSaved: true,
    memory: {
      visitCount: 18,
      totalDwellMinutes: 1120,
      avgStayMinutes: 62,
      firstVisitAt: '2025-01-22T21:30:00Z',
      lastVisitAt: '2026-05-28T22:15:00Z',
      currentlyHere: false,
      currentDwellMinutes: 0,
      visitSparklineWeeks: [2, 3, 1, 2, 4, 2, 2, 2],
      dominantMood: '🌙',
      visits: [
        {
          id: 'v_301',
          date: '2026-05-28',
          arrival: '21:30',
          departure: '23:00',
          minutes: 90,
          mood: '🍸',
          metFriends: ['u_003'],
          note: '听了整张 Miles Davis 的经典专辑，聊天很投缘',
        },
      ],
    },
    encounters: {
      friendCount: 3,
      totalEncounters: 11,
      friends: [
        {
          id: 'u_003',
          name: 'Noah (林澈)',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
          closeness: 'close',
          encounterCount: 6,
          lastEncounterAt: '2026-05-28 22:00',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-05-28',
              from: '21:45',
              to: '22:50',
              myStayMinutes: 90,
              theirStayMinutes: 65,
              overlapMinutes: 65,
            },
          ],
        },
        {
          id: 'u_004',
          name: 'Lucas (陈予涵)',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
          closeness: 'friend',
          encounterCount: 3,
          lastEncounterAt: '2026-05-12 22:30',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-05-12',
              from: '21:30',
              to: '22:40',
              myStayMinutes: 80,
              theirStayMinutes: 70,
              overlapMinutes: 70,
            },
          ],
        },
        {
          id: 'u_002',
          name: 'Aria (薛梦)',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
          closeness: 'bff',
          encounterCount: 2,
          lastEncounterAt: '2026-04-18 21:50',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-04-18',
              from: '21:10',
              to: '22:15',
              myStayMinutes: 75,
              theirStayMinutes: 65,
              overlapMinutes: 65,
            },
          ],
        },
      ],
    },
    visitors: {
      friendsWhoVisit: [
        { id: 'u_003', name: 'Noah (林澈)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', visitCount: 16, visible: true },
        { id: 'u_004', name: 'Lucas (陈予涵)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', visitCount: 9, visible: true },
        { id: 'u_002', name: 'Aria (薛梦)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300', visitCount: 6, visible: true },
      ],
      popularByWeekdayHour: [
        [0, 0, 0, 0, 0, 2, 4],
        [0, 0, 0, 0, 0, 2, 4],
        [0, 0, 0, 0, 0, 3, 5],
        [0, 0, 0, 0, 0, 3, 5],
        [0, 0, 0, 0, 1, 5, 7], // Friday night
        [0, 0, 0, 0, 1, 6, 8], // Saturday night
        [0, 0, 0, 0, 0, 3, 4],
      ],
    },
    sharing: {
      forwardedTo: [
        {
          userId: 'u_003',
          userName: 'Noah (林澈)',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
          mode: 'added_to_map',
          shareVisitCount: true,
          sharePhotos: true,
          shareEncounters: true,
          shareNotes: true,
          at: '2026-04-01 18:00',
        },
      ],
      revocable: true,
    },
  },
  {
    id: 'p_1004',
    name: '水车博览园 · 滨河晨跑折返点',
    category: 'nature',
    icon: '🌳',
    color: '#10B981',
    lat: 36.0640,
    lng: 103.8450,
    createdBy: {
      id: 'me',
      name: '我 (Alexia)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      isMe: true,
    },
    createdAt: '2025-02-10T07:15:00Z',
    createdByMe: true,
    source: 'self',
    tags: ['晨跑路线', '黄河柳荫', '空气清新', '体能打卡'],
    privacy: 'public',
    note: '每周二/四晨跑 5 公里必经的拉伸折返点，河边柳树成荫，早晨有清凉的水汽。',
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600',
    ],
    distanceKm: 1.1,
    direction: '东北方向',
    isSaved: false,
    memory: {
      visitCount: 26,
      totalDwellMinutes: 840,
      avgStayMinutes: 32,
      firstVisitAt: '2025-02-12T07:30:00Z',
      lastVisitAt: '2026-05-31T07:45:00Z',
      currentlyHere: false,
      currentDwellMinutes: 0,
      visitSparklineWeeks: [3, 4, 3, 4, 3, 3, 3, 3],
      dominantMood: '🏃‍♀️',
      visits: [
        {
          id: 'v_401',
          date: '2026-05-31',
          arrival: '07:15',
          departure: '07:45',
          minutes: 30,
          mood: '🏃‍♀️',
          metFriends: ['u_005'],
          note: '完成 6km 晨跑配速 5:20',
        },
      ],
    },
    encounters: {
      friendCount: 1,
      totalEncounters: 5,
      friends: [
        {
          id: 'u_005',
          name: 'Elena (苏微)',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
          closeness: 'friend',
          encounterCount: 5,
          lastEncounterAt: '2026-05-31 07:30',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-05-31',
              from: '07:20',
              to: '07:45',
              myStayMinutes: 30,
              theirStayMinutes: 25,
              overlapMinutes: 25,
            },
          ],
        },
      ],
    },
    visitors: {
      friendsWhoVisit: [
        { id: 'u_005', name: 'Elena (苏微)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300', visitCount: 18, visible: true },
        { id: 'u_004', name: 'Lucas (陈予涵)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', visitCount: 11, visible: true },
      ],
      popularByWeekdayHour: [
        [3, 1, 0, 0, 0, 1, 0],
        [4, 1, 0, 0, 0, 1, 0],
        [3, 1, 0, 0, 0, 1, 0],
        [4, 1, 0, 0, 0, 1, 0],
        [3, 1, 0, 0, 0, 1, 0],
        [5, 3, 1, 0, 0, 2, 0], // Saturday morning
        [5, 3, 1, 0, 0, 2, 0], // Sunday morning
      ],
    },
    sharing: {
      forwardedTo: [],
      revocable: false,
    },
  },
  {
    id: 'p_1005',
    name: '林澈的设计工作室与私享茶室',
    category: 'home',
    icon: '🏠',
    color: '#1877F2',
    lat: 36.0520,
    lng: 103.8260,
    createdBy: {
      id: 'u_003',
      name: 'Noah (林澈)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      isMe: false,
    },
    createdAt: '2025-03-01T10:00:00Z',
    createdByMe: false,
    source: 'forwarded',
    tags: ['密友据点', '极简空间', '白茶功夫茶', '产品脑暴'],
    privacy: 'friends_only',
    note: '林澈的工作室，有很棒的自然采光和大茶台，我们经常在这里做原型评审和周末小聚。',
    photos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
    ],
    distanceKm: 1.1,
    direction: '西南方向',
    isSaved: true,
    memory: {
      visitCount: 5,
      totalDwellMinutes: 280,
      avgStayMinutes: 56,
      firstVisitAt: '2025-03-10T14:30:00Z',
      lastVisitAt: '2026-05-20T16:00:00Z',
      currentlyHere: false,
      currentDwellMinutes: 0,
      visitSparklineWeeks: [0, 1, 0, 1, 0, 1, 1, 1],
      dominantMood: '🍵',
      visits: [
        {
          id: 'v_501',
          date: '2026-05-20',
          arrival: '14:30',
          departure: '16:00',
          minutes: 90,
          mood: '🍵',
          metFriends: ['u_003', 'u_002'],
          note: '讨论了新版地图生活图层的设计细节',
        },
      ],
    },
    encounters: {
      friendCount: 2,
      totalEncounters: 6,
      friends: [
        {
          id: 'u_003',
          name: 'Noah (林澈)',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
          closeness: 'close',
          encounterCount: 5,
          lastEncounterAt: '2026-05-20 15:00',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-05-20',
              from: '14:30',
              to: '16:00',
              myStayMinutes: 90,
              theirStayMinutes: 120,
              overlapMinutes: 90,
            },
          ],
        },
        {
          id: 'u_002',
          name: 'Aria (薛梦)',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
          closeness: 'bff',
          encounterCount: 2,
          lastEncounterAt: '2026-05-20 15:30',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-05-20',
              from: '14:45',
              to: '15:50',
              myStayMinutes: 90,
              theirStayMinutes: 65,
              overlapMinutes: 65,
            },
          ],
        },
      ],
    },
    visitors: {
      friendsWhoVisit: [
        { id: 'u_003', name: 'Noah (林澈)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', visitCount: 45, visible: true },
        { id: 'u_002', name: 'Aria (薛梦)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300', visitCount: 12, visible: true },
      ],
      popularByWeekdayHour: [
        [0, 1, 2, 3, 2, 0, 0],
        [0, 1, 2, 3, 2, 0, 0],
        [0, 1, 3, 3, 2, 0, 0],
        [0, 1, 2, 3, 2, 0, 0],
        [0, 1, 3, 4, 3, 0, 0],
        [0, 2, 4, 5, 4, 1, 0],
        [0, 2, 3, 4, 3, 1, 0],
      ],
    },
    sharing: {
      forwardedTo: [],
      revocable: false,
    },
  },
  {
    id: 'p_1006',
    name: '老饕牛肉面与甜醅子私房小馆',
    category: 'food',
    icon: '🍜',
    color: '#EF4444',
    lat: 36.0580,
    lng: 103.8285,
    createdBy: {
      id: 'me',
      name: '我 (Alexia)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      isMe: true,
    },
    createdAt: '2025-01-15T11:00:00Z',
    createdByMe: true,
    source: 'self',
    tags: ['地道风味', '老字号', '甜醅子奶茶', '二细多辣'],
    privacy: 'public',
    note: '汤头浓郁醇厚，辣椒油特别香！每次家人或者外地朋友来兰州，必带他们来这里打卡一清二白三红四绿。',
    photos: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600',
    ],
    distanceKm: 0.55,
    direction: '正西方向',
    isSaved: true,
    memory: {
      visitCount: 15,
      totalDwellMinutes: 420,
      avgStayMinutes: 28,
      firstVisitAt: '2025-01-16T12:00:00Z',
      lastVisitAt: '2026-05-26T12:30:00Z',
      currentlyHere: false,
      currentDwellMinutes: 0,
      visitSparklineWeeks: [2, 2, 1, 3, 2, 2, 1, 2],
      dominantMood: '😋',
      visits: [
        {
          id: 'v_601',
          date: '2026-05-26',
          arrival: '12:10',
          departure: '12:40',
          minutes: 30,
          mood: '😋',
          metFriends: ['fam-1'],
          note: '和爸爸一起吃了二细和凉拌牛腱肉',
        },
      ],
    },
    encounters: {
      friendCount: 2,
      totalEncounters: 7,
      friends: [
        {
          id: 'fam-1',
          name: '爸爸 (父亲)',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
          closeness: 'family',
          encounterCount: 4,
          lastEncounterAt: '2026-05-26 12:20',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-05-26',
              from: '12:10',
              to: '12:40',
              myStayMinutes: 30,
              theirStayMinutes: 30,
              overlapMinutes: 30,
            },
          ],
        },
        {
          id: 'u_002',
          name: 'Aria (薛梦)',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
          closeness: 'bff',
          encounterCount: 3,
          lastEncounterAt: '2026-04-20 12:45',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-04-20',
              from: '12:15',
              to: '12:50',
              myStayMinutes: 35,
              theirStayMinutes: 35,
              overlapMinutes: 35,
            },
          ],
        },
      ],
    },
    visitors: {
      friendsWhoVisit: [
        { id: 'fam-1', name: '爸爸 (父亲)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300', visitCount: 22, visible: true },
        { id: 'u_002', name: 'Aria (薛梦)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300', visitCount: 14, visible: true },
      ],
      popularByWeekdayHour: [
        [0, 1, 4, 1, 0, 0, 0],
        [0, 1, 4, 1, 0, 0, 0],
        [0, 1, 5, 1, 0, 0, 0],
        [0, 1, 4, 1, 0, 0, 0],
        [0, 1, 5, 2, 0, 0, 0],
        [0, 2, 6, 2, 0, 0, 0], // Sat lunch rush
        [0, 2, 5, 2, 0, 0, 0],
      ],
    },
    sharing: {
      forwardedTo: [],
      revocable: false,
    },
  },
  {
    id: 'p_1007',
    name: '西西弗书店 · 静音阅读自习区',
    category: 'study',
    icon: '📚',
    color: '#F59E0B',
    lat: 36.0570,
    lng: 103.8415,
    createdBy: {
      id: 'me',
      name: '我 (Alexia)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      isMe: true,
    },
    createdAt: '2025-02-28T14:00:00Z',
    createdByMe: true,
    source: 'self',
    tags: ['静音自习', '新书首发', '暖色阅读灯', '插座充足'],
    privacy: 'friends_only',
    note: '选品很棒的书店，静音自习桌有独立台灯和电源，周末适合沉浸式看书两个小时。',
    photos: [
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600',
    ],
    distanceKm: 0.7,
    direction: '东南方向',
    isSaved: false,
    memory: {
      visitCount: 9,
      totalDwellMinutes: 490,
      avgStayMinutes: 54,
      firstVisitAt: '2025-03-02T15:00:00Z',
      lastVisitAt: '2026-05-22T16:30:00Z',
      currentlyHere: false,
      currentDwellMinutes: 0,
      visitSparklineWeeks: [1, 1, 2, 1, 1, 0, 2, 1],
      dominantMood: '📖',
      visits: [
        {
          id: 'v_701',
          date: '2026-05-22',
          arrival: '15:00',
          departure: '16:30',
          minutes: 90,
          mood: '📖',
          metFriends: ['u_005'],
          note: '翻阅了《交互设计沉思录》，记录了3条灵感',
        },
      ],
    },
    encounters: {
      friendCount: 1,
      totalEncounters: 3,
      friends: [
        {
          id: 'u_005',
          name: 'Elena (苏微)',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
          closeness: 'friend',
          encounterCount: 3,
          lastEncounterAt: '2026-05-22 15:40',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-05-22',
              from: '15:10',
              to: '16:15',
              myStayMinutes: 90,
              theirStayMinutes: 70,
              overlapMinutes: 65,
            },
          ],
        },
      ],
    },
    visitors: {
      friendsWhoVisit: [
        { id: 'u_005', name: 'Elena (苏微)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300', visitCount: 12, visible: true },
      ],
      popularByWeekdayHour: [
        [0, 0, 1, 2, 2, 1, 0],
        [0, 0, 1, 2, 2, 1, 0],
        [0, 0, 1, 2, 2, 1, 0],
        [0, 0, 1, 2, 2, 1, 0],
        [0, 0, 1, 3, 3, 2, 0],
        [0, 1, 3, 4, 4, 3, 0],
        [0, 1, 3, 4, 4, 2, 0],
      ],
    },
    sharing: {
      forwardedTo: [],
      revocable: false,
    },
  },
  {
    id: 'p_1008',
    name: '城市脉动攀岩与体能训练馆',
    category: 'fitness',
    icon: '🏋️',
    color: '#06B6D4',
    lat: 36.0515,
    lng: 103.8340,
    createdBy: {
      id: 'u_004',
      name: 'Lucas (陈予涵)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      isMe: false,
    },
    createdAt: '2025-03-20T18:00:00Z',
    createdByMe: false,
    source: 'forwarded',
    tags: ['室内抱石', '力量核心', '氛围热烈', '装备齐全'],
    privacy: 'friends_only',
    note: '陈予涵推荐的抱石馆，定线每周更新，教练很专业，放的电子音乐也很带感。',
    photos: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600',
    ],
    distanceKm: 0.85,
    direction: '正南方向',
    isSaved: true,
    memory: {
      visitCount: 7,
      totalDwellMinutes: 450,
      avgStayMinutes: 64,
      firstVisitAt: '2025-03-25T19:00:00Z',
      lastVisitAt: '2026-05-19T20:15:00Z',
      currentlyHere: false,
      currentDwellMinutes: 0,
      visitSparklineWeeks: [1, 1, 1, 0, 1, 1, 1, 1],
      dominantMood: '💪',
      visits: [
        {
          id: 'v_801',
          date: '2026-05-19',
          arrival: '19:00',
          departure: '20:15',
          minutes: 75,
          mood: '💪',
          metFriends: ['u_004'],
          note: '磕下了 V3 难度的仰角线路，核心酸爽',
        },
      ],
    },
    encounters: {
      friendCount: 1,
      totalEncounters: 4,
      friends: [
        {
          id: 'u_004',
          name: 'Lucas (陈予涵)',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
          closeness: 'friend',
          encounterCount: 4,
          lastEncounterAt: '2026-05-19 19:40',
          overlapWindowMinutes: 30,
          encounters: [
            {
              date: '2026-05-19',
              from: '19:10',
              to: '20:10',
              myStayMinutes: 75,
              theirStayMinutes: 90,
              overlapMinutes: 60,
            },
          ],
        },
      ],
    },
    visitors: {
      friendsWhoVisit: [
        { id: 'u_004', name: 'Lucas (陈予涵)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', visitCount: 24, visible: true },
      ],
      popularByWeekdayHour: [
        [0, 0, 0, 0, 1, 4, 3],
        [0, 0, 0, 0, 1, 4, 3],
        [0, 0, 0, 0, 1, 4, 3],
        [0, 0, 0, 0, 1, 4, 3],
        [0, 0, 0, 0, 1, 5, 4],
        [0, 1, 2, 3, 3, 5, 2],
        [0, 1, 2, 3, 3, 4, 1],
      ],
    },
    sharing: {
      forwardedTo: [],
      revocable: false,
    },
  },
];

const LOCAL_STORAGE_KEY = 'stellar-life-layer-places-v1';

class LifeLayerStore {
  private places: LifePlace[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadPlaces();
  }

  private loadPlaces() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.places = parsed;
          this.recalculateDistances();
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse life places from localStorage', e);
    }
    this.places = INITIAL_LIFE_PLACES;
    this.recalculateDistances();
    this.savePlaces();
  }

  private savePlaces() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.places));
    } catch (e) {
      console.error('Failed to save life places', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getPlaces(): LifePlace[] {
    return this.places;
  }

  public getPlaceById(id: string): LifePlace | undefined {
    return this.places.find((p) => p.id === id);
  }

  public recalculateDistances(userCoord: { lat: number; lng: number } = USER_LOCATION) {
    this.places = this.places.map((place) => {
      const meters = calculateLatLngDistanceMeters(userCoord.lat, userCoord.lng, place.lat, place.lng);
      const km = Math.round((meters / 1000) * 100) / 100;
      
      const dLat = place.lat - userCoord.lat;
      const dLng = place.lng - userCoord.lng;
      let direction = '附近';
      if (Math.abs(dLat) > Math.abs(dLng) * 2) {
        direction = dLat > 0 ? '正北方向' : '正南方向';
      } else if (Math.abs(dLng) > Math.abs(dLat) * 2) {
        direction = dLng > 0 ? '正东方向' : '正西方向';
      } else {
        const nS = dLat > 0 ? '北' : '南';
        const eW = dLng > 0 ? '东' : '西';
        direction = `${dLat > 0 ? '东北' : '西南'}方向`;
        if (nS === '北' && eW === '东') direction = '东北方向';
        if (nS === '北' && eW === '西') direction = '西北方向';
        if (nS === '南' && eW === '东') direction = '东南方向';
        if (nS === '南' && eW === '西') direction = '西南方向';
      }

      return {
        ...place,
        distanceKm: km,
        direction,
      };
    });
  }

  public addPlace(placeData: Omit<LifePlace, 'id' | 'createdAt' | 'memory' | 'encounters' | 'visitors' | 'sharing'> & Partial<Pick<LifePlace, 'memory' | 'encounters' | 'visitors' | 'sharing'>>): LifePlace {
    const id = `p_${Date.now()}`;
    const now = new Date().toISOString();
    
    const newPlace: LifePlace = {
      ...placeData,
      id,
      createdAt: now,
      memory: placeData.memory || {
        visitCount: 1,
        totalDwellMinutes: 30,
        avgStayMinutes: 30,
        firstVisitAt: now,
        lastVisitAt: now,
        currentlyHere: false,
        currentDwellMinutes: 0,
        visitSparklineWeeks: [1, 0, 0, 0, 0, 0, 0, 0],
        dominantMood: '✨',
        visits: [
          {
            id: `v_${Date.now()}`,
            date: now.split('T')[0],
            arrival: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            departure: null,
            minutes: 30,
            mood: '✨',
            note: placeData.note || '创建并初次探索此地',
          },
        ],
      },
      encounters: placeData.encounters || {
        friendCount: 0,
        totalEncounters: 0,
        friends: [],
      },
      visitors: placeData.visitors || {
        friendsWhoVisit: [],
        popularByWeekdayHour: [
          [0, 0, 1, 2, 1, 0, 0],
          [0, 0, 1, 2, 1, 0, 0],
          [0, 0, 1, 2, 1, 0, 0],
          [0, 0, 1, 2, 1, 0, 0],
          [0, 1, 2, 3, 2, 1, 0],
          [0, 2, 3, 4, 3, 2, 0],
          [0, 2, 3, 3, 2, 1, 0],
        ],
      },
      sharing: placeData.sharing || {
        forwardedTo: [],
        revocable: true,
      },
    };

    this.places = [newPlace, ...this.places];
    this.recalculateDistances();
    this.savePlaces();
    return newPlace;
  }

  public updatePlace(id: string, updates: Partial<LifePlace>): LifePlace | undefined {
    const idx = this.places.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;

    const updated = {
      ...this.places[idx],
      ...updates,
    };
    this.places[idx] = updated;
    this.recalculateDistances();
    this.savePlaces();
    return updated;
  }

  public deletePlace(id: string): boolean {
    const prevLen = this.places.length;
    this.places = this.places.filter((p) => p.id !== id);
    if (this.places.length !== prevLen) {
      this.savePlaces();
      return true;
    }
    return false;
  }

  public toggleSavePlace(id: string): boolean {
    const place = this.getPlaceById(id);
    if (!place) return false;
    const isSaved = !place.isSaved;
    this.updatePlace(id, { isSaved });
    return isSaved;
  }

  public addVisit(placeId: string, visit: Omit<LifePlaceVisit, 'id'>) {
    const place = this.getPlaceById(placeId);
    if (!place) return;

    const newVisitId = `v_${Date.now()}`;
    const newVisit: LifePlaceVisit = {
      ...visit,
      id: newVisitId,
    };

    const newVisits = [newVisit, ...place.memory.visits];
    const newCount = place.memory.visitCount + 1;
    const newTotalMinutes = place.memory.totalDwellMinutes + visit.minutes;
    const newAvgMinutes = Math.round(newTotalMinutes / newCount);

    const sparkline = [...place.memory.visitSparklineWeeks];
    sparkline[sparkline.length - 1] = (sparkline[sparkline.length - 1] || 0) + 1;

    this.updatePlace(placeId, {
      memory: {
        ...place.memory,
        visitCount: newCount,
        totalDwellMinutes: newTotalMinutes,
        avgStayMinutes: newAvgMinutes,
        lastVisitAt: new Date().toISOString(),
        visitSparklineWeeks: sparkline,
        visits: newVisits,
      },
    });
  }

  public forwardPlace(placeId: string, shareTargets: LifePlaceShareTarget[]) {
    const place = this.getPlaceById(placeId);
    if (!place) return;

    const updatedForwarded = [...place.sharing.forwardedTo, ...shareTargets];
    this.updatePlace(placeId, {
      sharing: {
        ...place.sharing,
        forwardedTo: updatedForwarded,
      },
    });
  }

  public revokeForward(placeId: string, userId: string) {
    const place = this.getPlaceById(placeId);
    if (!place) return;

    const filtered = place.sharing.forwardedTo.filter((s) => s.userId !== userId);
    this.updatePlace(placeId, {
      sharing: {
        ...place.sharing,
        forwardedTo: filtered,
      },
    });
  }

  /**
   * One-click adopt / set friend's shared life place as user's own life place
   */
  public adoptPlaceAsMyOwn(place: LifePlace): { success: boolean; place: LifePlace; alreadyExists: boolean } {
    // Check if place with matching id or identical coords/name already exists in user's places
    const existing = this.places.find(
      (p) =>
        p.id === place.id ||
        (p.name === place.name &&
          Math.abs(p.lat - place.lat) < 0.0001 &&
          Math.abs(p.lng - place.lng) < 0.0001)
    );

    if (existing) {
      const updated = this.updatePlace(existing.id, { isSaved: true, source: 'self' });
      return { success: true, place: updated || existing, alreadyExists: true };
    }

    const now = new Date().toISOString();
    const adoptedPlace: LifePlace = {
      ...place,
      id: `p_adopt_${Date.now()}`,
      createdAt: now,
      createdBy: {
        id: 'me',
        name: '我 (Alexia)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        isMe: true,
      },
      createdByMe: true,
      source: 'imported',
      isSaved: true,
      memory: {
        visitCount: 1,
        totalDwellMinutes: 35,
        avgStayMinutes: 35,
        firstVisitAt: now,
        lastVisitAt: now,
        currentlyHere: false,
        currentDwellMinutes: 0,
        visitSparklineWeeks: [1, 0, 0, 0, 0, 0, 0, 0],
        dominantMood: '✨',
        visits: [
          {
            id: `v_${Date.now()}`,
            date: now.split('T')[0],
            arrival: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            departure: null,
            minutes: 35,
            mood: '✨',
            note: `通过好友「${place.createdBy?.name || '好友'}」的分享，一键设为我的生活坐标！`,
          },
        ],
      },
      encounters: {
        friendCount: place.createdBy && !place.createdBy.isMe ? 1 : 0,
        totalEncounters: 1,
        friends:
          place.createdBy && !place.createdBy.isMe
            ? [
                {
                  id: place.createdBy.id,
                  name: place.createdBy.name,
                  avatar: place.createdBy.avatar,
                  closeness: 'friend',
                  encounterCount: 1,
                  lastEncounterAt: now,
                  overlapWindowMinutes: 30,
                  encounters: [],
                },
              ]
            : [],
      },
      sharing: {
        forwardedTo: [],
        revocable: true,
      },
    };

    this.places = [adoptedPlace, ...this.places];
    this.recalculateDistances();
    this.savePlaces();
    return { success: true, place: adoptedPlace, alreadyExists: false };
  }

  /**
   * Check if a given place is already adopted or owned in my personal life places
   */
  public isAdoptedOrOwned(place: { id?: string; name?: string; lat?: number; lng?: number }): boolean {
    return this.places.some(
      (p) =>
        (place.id && p.id === place.id) ||
        (place.name && p.name === place.name) ||
        (place.lat !== undefined &&
          place.lng !== undefined &&
          Math.abs(p.lat - place.lat) < 0.0001 &&
          Math.abs(p.lng - place.lng) < 0.0001)
    );
  }

  public resetToDefault() {
    this.places = INITIAL_LIFE_PLACES;
    this.recalculateDistances();
    this.savePlaces();
  }
}

export const lifeLayerStore = new LifeLayerStore();

export const getRelativeCreationTime = (isoString: string): string => {
  try {
    const created = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天创建';
    if (diffDays === 1) return '昨天创建';
    if (diffDays < 7) return `${diffDays} 天前创建`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前创建`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前创建`;
    return `${Math.floor(diffDays / 365)} 年前创建`;
  } catch {
    return '近期创建';
  }
};

export const formatDurationHoursMins = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours} h ${mins} m`;
  if (hours > 0) return `${hours} 小时`;
  return `${mins} 分钟`;
};
