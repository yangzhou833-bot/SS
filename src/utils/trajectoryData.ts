import { TrajectoryPoint, FriendTrajectory, Friend } from '../types';

export const formatTimeHour = (hour: number): string => {
  const h = Math.floor(Math.max(0, Math.min(24, hour)));
  const m = Math.floor((hour - Math.floor(hour)) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const generateFriend24hTrajectory = (friend: Friend): TrajectoryPoint[] => {
  const baseLat = typeof friend.lat === 'number' && !isNaN(friend.lat) ? friend.lat : 36.0610;
  const baseLng = typeof friend.lng === 'number' && !isNaN(friend.lng) ? friend.lng : 103.8320;
  const friendName = friend.name.split(' ')[0] || friend.name;

  return [
    {
      id: `traj-${friend.id}-1`,
      lat: Number((baseLat - 0.0035).toFixed(4)),
      lng: Number((baseLng - 0.0042).toFixed(4)),
      timeHour: 0,
      timeLabel: '00:00',
      locationName: `【${friendName}】温馨住所 · 晚安深度守护 🏠`,
      speedKmh: 0,
      transportMode: 'stationary',
      isStayPoint: true,
      stayDurationMinutes: 450,
      note: '夜间睡眠静止 · 信号良好',
    },
    {
      id: `traj-${friend.id}-2`,
      lat: Number((baseLat - 0.0028).toFixed(4)),
      lng: Number((baseLng - 0.0022).toFixed(4)),
      timeHour: 7.5,
      timeLabel: '07:30',
      locationName: '家门口 阳光早餐风味小吃街 🥣',
      speedKmh: 4.2,
      transportMode: 'walking',
      isStayPoint: true,
      stayDurationMinutes: 25,
      note: '晨间散步就餐',
    },
    {
      id: `traj-${friend.id}-3`,
      lat: Number((baseLat - 0.0012).toFixed(4)),
      lng: Number((baseLng + 0.0018).toFixed(4)),
      timeHour: 9.2,
      timeLabel: '09:12',
      locationName: '城市林荫大道 · 通勤快线 🚗',
      speedKmh: 36,
      transportMode: 'car',
      isStayPoint: false,
      note: '驾车平稳通行中',
    },
    {
      id: `traj-${friend.id}-4`,
      lat: Number((baseLat + 0.0024).toFixed(4)),
      lng: Number((baseLng + 0.0032).toFixed(4)),
      timeHour: 11.5,
      timeLabel: '11:30',
      locationName: '创新科技园区 · 创客空间工坊 💼',
      speedKmh: 0,
      transportMode: 'stationary',
      isStayPoint: true,
      stayDurationMinutes: 90,
      note: '专注办公研讨',
    },
    {
      id: `traj-${friend.id}-5`,
      lat: Number((baseLat + 0.0015).toFixed(4)),
      lng: Number((baseLng + 0.0012).toFixed(4)),
      timeHour: 13.8,
      timeLabel: '13:48',
      locationName: '转角精品手冲咖啡空间 ☕',
      speedKmh: 0,
      transportMode: 'stationary',
      isStayPoint: true,
      stayDurationMinutes: 60,
      note: '午后慢享香浓咖啡',
    },
    {
      id: `traj-${friend.id}-6`,
      lat: Number((baseLat + 0.0006).toFixed(4)),
      lng: Number((baseLng + 0.0045).toFixed(4)),
      timeHour: 16.5,
      timeLabel: '16:30',
      locationName: '黄河风情线 生态绿道公园 🌿',
      speedKmh: 4.8,
      transportMode: 'walking',
      isStayPoint: true,
      stayDurationMinutes: 50,
      note: '漫步河畔享受微风',
    },
    {
      id: `traj-${friend.id}-7`,
      lat: Number((baseLat - 0.0008).toFixed(4)),
      lng: Number((baseLng + 0.0005).toFixed(4)),
      timeHour: 19.2,
      timeLabel: '19:12',
      locationName: '热闹夜市 美食餐饮步行街 🍜',
      speedKmh: 0,
      transportMode: 'stationary',
      isStayPoint: true,
      stayDurationMinutes: 80,
      note: '晚餐聚餐打卡',
    },
    {
      id: `traj-${friend.id}-8`,
      lat: Number((baseLat - 0.0002).toFixed(4)),
      lng: Number((baseLng - 0.0015).toFixed(4)),
      timeHour: 21.5,
      timeLabel: '21:30',
      locationName: '沿河林荫小道 · 晚风夜骑 🚲',
      speedKmh: 14.5,
      transportMode: 'bicycle',
      isStayPoint: false,
      note: '骑行回程中',
    },
    {
      id: `traj-${friend.id}-9`,
      lat: Number(baseLat.toFixed(4)),
      lng: Number(baseLng.toFixed(4)),
      timeHour: 24.0,
      timeLabel: '24:00 (实时)',
      locationName: friend.locationName || `【${friendName}】当前实时在线坐标 📍`,
      speedKmh: 0,
      transportMode: 'stationary',
      isStayPoint: true,
      note: '当前实时坐标',
    },
  ];
};

export interface InterpolatedTrajectoryState {
  lat: number;
  lng: number;
  timeHour: number;
  timeLabel: string;
  locationName: string;
  speedKmh: number;
  transportMode: 'walking' | 'car' | 'bicycle' | 'stationary';
  isStayPoint: boolean;
  note?: string;
  progressPercent: number;
}

export const interpolateFriendTrajectory = (
  points: TrajectoryPoint[],
  timeHour: number
): InterpolatedTrajectoryState => {
  if (!points || points.length === 0) {
    return {
      lat: 36.0610,
      lng: 103.8320,
      timeHour: 0,
      timeLabel: '00:00',
      locationName: '未知位置',
      speedKmh: 0,
      transportMode: 'stationary',
      isStayPoint: true,
      progressPercent: 0,
    };
  }

  const clampedHour = Math.max(0, Math.min(24, timeHour));
  const timeLabel = formatTimeHour(clampedHour);

  if (clampedHour <= points[0].timeHour) {
    const p = points[0];
    return {
      lat: p.lat,
      lng: p.lng,
      timeHour: clampedHour,
      timeLabel,
      locationName: p.locationName,
      speedKmh: p.speedKmh,
      transportMode: p.transportMode,
      isStayPoint: Boolean(p.isStayPoint),
      note: p.note,
      progressPercent: 0,
    };
  }

  const lastPoint = points[points.length - 1];
  if (clampedHour >= lastPoint.timeHour) {
    return {
      lat: lastPoint.lat,
      lng: lastPoint.lng,
      timeHour: clampedHour,
      timeLabel,
      locationName: lastPoint.locationName,
      speedKmh: lastPoint.speedKmh,
      transportMode: lastPoint.transportMode,
      isStayPoint: Boolean(lastPoint.isStayPoint),
      note: lastPoint.note,
      progressPercent: 100,
    };
  }

  // Find bounding segment
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (clampedHour >= p1.timeHour && clampedHour <= p2.timeHour) {
      const segmentDuration = p2.timeHour - p1.timeHour;
      const t = segmentDuration > 0 ? (clampedHour - p1.timeHour) / segmentDuration : 0;
      const lat = p1.lat + (p2.lat - p1.lat) * t;
      const lng = p1.lng + (p2.lng - p1.lng) * t;
      const speedKmh = Math.round(p1.speedKmh + (p2.speedKmh - p1.speedKmh) * t);
      const locationName = t > 0.65 ? p2.locationName : p1.locationName;
      const transportMode = p1.speedKmh > 0 ? p1.transportMode : p2.transportMode;
      const isStayPoint = t < 0.25 ? Boolean(p1.isStayPoint) : t > 0.75 ? Boolean(p2.isStayPoint) : false;
      const progressPercent = Math.round((clampedHour / 24) * 100);

      return {
        lat,
        lng,
        timeHour: clampedHour,
        timeLabel,
        locationName,
        speedKmh,
        transportMode,
        isStayPoint,
        note: p1.note || p2.note,
        progressPercent,
      };
    }
  }

  return {
    lat: lastPoint.lat,
    lng: lastPoint.lng,
    timeHour: clampedHour,
    timeLabel,
    locationName: lastPoint.locationName,
    speedKmh: lastPoint.speedKmh,
    transportMode: lastPoint.transportMode,
    isStayPoint: Boolean(lastPoint.isStayPoint),
    note: lastPoint.note,
    progressPercent: 100,
  };
};

export const MOCK_24H_TRAJECTORY_POINTS: TrajectoryPoint[] = [
  {
    id: 'tp-1',
    lat: 36.0611,
    lng: 103.8343,
    timeHour: 0,
    timeLabel: '00:00',
    locationName: '城关区 南滨河路 温暖住所 🏠',
    speedKmh: 0,
    transportMode: 'stationary',
    isStayPoint: true,
    stayDurationMinutes: 480,
    note: '深度睡眠监测中 · 守护已接管',
  },
  {
    id: 'tp-2',
    lat: 36.0618,
    lng: 103.8360,
    timeHour: 7.5,
    timeLabel: '07:30',
    locationName: '家门口 早餐小吃街 🥣',
    speedKmh: 4,
    transportMode: 'walking',
    isStayPoint: true,
    stayDurationMinutes: 20,
    note: '晨间散步用餐',
  },
  {
    id: 'tp-3',
    lat: 36.0585,
    lng: 103.8385,
    timeHour: 8.5,
    timeLabel: '08:30',
    locationName: '南滨河东路 晨游地段 🚗',
    speedKmh: 28,
    transportMode: 'car',
    note: '驾车沿黄河风情线快速通行',
  },
  {
    id: 'tp-4',
    lat: 36.0560,
    lng: 103.8420,
    timeHour: 10.2,
    timeLabel: '10:12',
    locationName: '东方红广场 漫漫咖啡中心 ☕',
    speedKmh: 0,
    transportMode: 'stationary',
    isStayPoint: true,
    stayDurationMinutes: 75,
    note: '与 Mia 共享精品手冲咖啡',
    intersectingFriendId: 'friend-2',
    intersectingFriendName: 'Mia',
  },
  {
    id: 'tp-5',
    lat: 36.0592,
    lng: 103.8480,
    timeHour: 12.0,
    timeLabel: '12:00',
    locationName: '甘肃省博物馆 / 文化空间 🏛️',
    speedKmh: 12,
    transportMode: 'bicycle',
    isStayPoint: true,
    stayDurationMinutes: 90,
    note: '打卡星片展览',
  },
  {
    id: 'tp-6',
    lat: 36.0630,
    lng: 103.8550,
    timeHour: 14.5,
    timeLabel: '14:30',
    locationName: '兰州黄河铁桥 (中山桥) 🌉',
    speedKmh: 35,
    transportMode: 'car',
    isStayPoint: true,
    stayDurationMinutes: 45,
    note: '与 Sarah 轨迹重合打卡合影',
    intersectingFriendId: 'friend-1',
    intersectingFriendName: 'Sarah',
  },
  {
    id: 'tp-7',
    lat: 36.0605,
    lng: 103.8412,
    timeHour: 18.0,
    timeLabel: '18:00',
    locationName: '兰州西站 交通枢纽 🚄',
    speedKmh: 18,
    transportMode: 'car',
    note: '顺路接送好友',
  },
  {
    id: 'tp-8',
    lat: 36.0610,
    lng: 103.8320,
    timeHour: 24.0,
    timeLabel: '24:00 (现在)',
    locationName: '城关区 东方红广场 实时守护点 📍',
    speedKmh: 0,
    transportMode: 'stationary',
    isStayPoint: true,
    note: '当前实时坐标归巢',
  },
];

export const MOCK_FRIEND_TRAJECTORIES: FriendTrajectory[] = [
  {
    friendId: 'friend-1',
    friendName: 'Sarah',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    color: '#EC4899',
    points: [
      { lat: 36.0680, lng: 103.8600, timeHour: 10.0, locationName: '城关区黄河风情线' },
      { lat: 36.0630, lng: 103.8550, timeHour: 14.5, locationName: '中山桥 (与 Alexia 交汇)' },
      { lat: 36.0610, lng: 103.8380, timeHour: 19.0, locationName: '正宁路夜市' },
    ],
  },
  {
    friendId: 'friend-2',
    friendName: 'Mia',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    color: '#8B5CF6',
    points: [
      { lat: 36.0520, lng: 103.8200, timeHour: 0.0, locationName: '兰州大学城' },
      { lat: 36.0560, lng: 103.8420, timeHour: 10.2, locationName: '漫漫咖啡馆 (与 Alexia 喝咖啡)' },
      { lat: 36.0580, lng: 103.8450, timeHour: 16.0, locationName: '图书天地' },
    ],
  },
  {
    friendId: 'fam-1',
    friendName: '爸爸',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    color: '#10B981',
    points: [
      { lat: 36.0611, lng: 103.8343, timeHour: 0.0, locationName: '家庭安全守护点' },
      { lat: 36.0620, lng: 103.8310, timeHour: 12.0, locationName: '安全巡航区域' },
      { lat: 36.0600, lng: 103.8330, timeHour: 22.0, locationName: '安宁区看护中枢' },
    ],
  },
];
