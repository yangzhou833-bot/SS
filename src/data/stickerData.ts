import { LabelSticker } from '../types';

export const INITIAL_USER_STICKERS: LabelSticker[] = [
  {
    id: 'st_01',
    cutoutUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200',
    sourcePhotoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
    label: '吃货 Foodie',
    border: { color: '#FFFFFF', widthPx: 3, style: 'solid' },
    sizePx: 48,
    likes: 18,
    likedByMe: true,
    recentLikers: [
      { userId: 'u_002', userName: 'Alex', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '5分钟前' },
      { userId: 'u_003', userName: 'Sarah', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '18分钟前' },
      { userId: 'u_004', userName: 'Elena', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', time: '1小时前' },
    ],
    orbit: { angleDeg: 35, radiusPx: 86, phase: 0.0 },
    hidden: false,
    createdAt: '2025-06-01T09:00:00',
  },
  {
    id: 'st_02',
    cutoutUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=200',
    sourcePhotoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=400',
    label: '骑行破风 🚴',
    border: { color: '#1877F2', widthPx: 3, style: 'solid' },
    sizePx: 46,
    likes: 24,
    likedByMe: false,
    recentLikers: [
      { userId: 'u_005', userName: 'David', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150', time: '30分钟前' },
      { userId: 'u_006', userName: 'Lucas', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', time: '2小时前' },
    ],
    orbit: { angleDeg: 145, radiusPx: 92, phase: 0.3 },
    hidden: false,
    createdAt: '2025-06-02T14:30:00',
  },
  {
    id: 'st_03',
    cutoutUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=200',
    sourcePhotoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
    label: '咖啡不离手 ☕',
    border: { color: '#FFFFFF', widthPx: 3, style: 'glow' },
    sizePx: 44,
    likes: 31,
    likedByMe: true,
    recentLikers: [
      { userId: 'u_007', userName: 'Hui Zhang', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', time: '10分钟前' },
      { userId: 'u_002', userName: 'Alex', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '45分钟前' },
      { userId: 'u_008', userName: 'Chloe', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', time: '3小时前' },
    ],
    orbit: { angleDeg: 270, radiusPx: 88, phase: 0.6 },
    hidden: false,
    createdAt: '2025-06-03T18:00:00',
  },
  {
    id: 'st_04',
    cutoutUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200',
    sourcePhotoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
    label: '吉他手 🎸',
    border: { color: '#FFB800', widthPx: 3, style: 'solid' },
    sizePx: 48,
    likes: 15,
    likedByMe: false,
    recentLikers: [
      { userId: 'u_003', userName: 'Sarah', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '1天前' },
    ],
    orbit: { angleDeg: 330, radiusPx: 94, phase: 0.9 },
    hidden: false,
    createdAt: '2025-06-04T11:20:00',
  },
];

export const PRESET_CUTOUT_STOCK = [
  {
    id: 'stock_foodie',
    label: '吃货狂热 🍔',
    cutoutUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200',
    sourcePhotoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
    borderColor: '#FFFFFF',
    borderStyle: 'solid' as const,
  },
  {
    id: 'stock_bike',
    label: '骑行先锋 🚴',
    cutoutUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=200',
    sourcePhotoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=400',
    borderColor: '#1877F2',
    borderStyle: 'solid' as const,
  },
  {
    id: 'stock_coffee',
    label: '咖啡续命 ☕',
    cutoutUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=200',
    sourcePhotoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
    borderColor: '#FFFFFF',
    borderStyle: 'glow' as const,
  },
  {
    id: 'stock_guitar',
    label: '摇滚灵魂 🎸',
    cutoutUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200',
    sourcePhotoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
    borderColor: '#FF5722',
    borderStyle: 'solid' as const,
  },
  {
    id: 'stock_cat',
    label: '猫主子 🐱',
    cutoutUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200',
    sourcePhotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
    borderColor: '#FFB800',
    borderStyle: 'glow' as const,
  },
  {
    id: 'stock_game',
    label: '电竞选手 🎮',
    cutoutUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=200',
    sourcePhotoUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=400',
    borderColor: '#9C27B0',
    borderStyle: 'dashed' as const,
  },
  {
    id: 'stock_nightowl',
    label: '夜猫子 🌙',
    cutoutUrl: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&q=80&w=200',
    sourcePhotoUrl: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&q=80&w=400',
    borderColor: '#3F51B5',
    borderStyle: 'glow' as const,
  },
  {
    id: 'stock_photographer',
    label: '野生摄影师 📸',
    cutoutUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200',
    sourcePhotoUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400',
    borderColor: '#00C853',
    borderStyle: 'solid' as const,
  },
];

// Calculate automatic circular orbit distribution angles for N stickers
export function calculateOrbitAngles(count: number, baseAngleDeg: number = 30): number[] {
  if (count <= 0) return [];
  if (count === 1) return [45];
  if (count === 2) return [45, 225];
  if (count === 3) return [30, 150, 270];
  if (count === 4) return [40, 140, 220, 320];
  if (count === 5) return [30, 100, 170, 240, 310];
  return [30, 90, 150, 210, 270, 330];
}
