import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DiscoverPost } from '../types';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Clock,
  Flame,
  Users,
  X,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  Navigation,
  CheckCircle2,
  Sparkles,
  Bookmark,
  MoreHorizontal,
  FileText,
  Plus,
  Home,
  UserPlus,
  Check,
  Edit3,
  Images,
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  Copy,
  Database,
  BarChart3,
  Kanban,
  Bug,
  BookOpen,
  FileCode2,
  Cpu,
  Radio,
  Compass,
  Terminal,
  Zap
} from 'lucide-react';
import {
  ActivityCreationUiState,
  SUB_TYPE_CONFIG,
  NODE_TYPE_CONFIG,
  NodeType,
  ActivitySubType,
  ActivityMajorType
} from './ActivityCreationModal';
import {
  FamilyGroupData,
  FamilyMember,
  PRESET_FAMILY_AVATARS,
  FamilyGroupModal
} from './FamilyGroupModal';
import { SkillItem, INITIAL_SKILLS } from '../data/skillsData';
import { SkillOperationModal } from './skills/SkillOperationModal';
import { EBookReaderApp } from './skills/EBookReaderApp';
import { CityCostOfLivingApp } from './skills/CityCostOfLivingApp';
import { PostMediaGrid } from './FeedMediaGrid';
import { XThemedLikeButton } from './common/XThemedLikeButton';
import { AnimatedCommentButton } from './common/AnimatedCommentButton';
import { UnifiedShareButton } from './common/UnifiedShareButton';
import { getActiveRoleId, joinSharedActivityInStore } from '../data/dualRoleStore';
import { soundEffects } from '../utils/soundEffects';

export type { FamilyGroupData, FamilyMember };
export { PRESET_FAMILY_AVATARS };

export const FamilyAvatarCollage: React.FC<{
  members?: FamilyMember[];
  fallbackAvatar?: string;
  className?: string;
}> = ({ members, fallbackAvatar, className = 'w-full h-full' }) => {
  const defaultMemberAvatars = [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
  ];

  const validAvatars = members && members.length > 0
    ? members.map((m, idx) => m.avatar || defaultMemberAvatars[idx % defaultMemberAvatars.length])
    : defaultMemberAvatars;

  const displayList = (validAvatars.length >= 4
    ? validAvatars.slice(0, 4)
    : [...validAvatars, ...defaultMemberAvatars.slice(validAvatars.length, 4)]
  ).slice(0, 4);

  return (
    <div className={`relative ${className} rounded-full overflow-hidden bg-slate-100 grid grid-cols-2 grid-rows-2 gap-[1px] p-[1px]`}>
      {displayList.map((src, idx) => (
        <div key={idx} className="w-full h-full overflow-hidden relative bg-slate-200">
          <img
            src={src}
            alt={`Family member ${idx + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export type HotCardKind = 'activity' | 'geotagged_photo';

export interface StoryCardData {
  id: string;
  kind: HotCardKind;
  coverUrl: string;
  title: string;
  // Form 1: Activity Card
  organizerName?: string;
  organizerAvatar?: string;
  participantAvatars?: string[];
  activityData?: ActivityCreationUiState;
  isUserCreated?: boolean;
  isLatest?: boolean;

  // Form 2: Geotagged-Photo Anchor Card
  photos?: string[];
  userMiniAvatar?: string;
  userName?: string;
  locationName?: string;
  feedPostId?: string;
}

export interface GroupCircleData {
  id: string;
  isFamily: boolean;
  avatarUrl: string;
  name: string;
  hasNewActivity: boolean;
}

export interface FeedCommentData {
  id: string;
  userAvatar: string;
  userName: string;
  content: string;
  timestamp: string;
}

export interface LikedUser {
  id: string;
  name: string;
  avatar: string;
  time: string;
  isNewest?: boolean;
}

export interface DetailedFeedPost {
  id: string;
  userAvatar: string;
  userName: string;
  date: string;
  location?: string;
  weather?: string;
  content: string;
  mediaUrl?: string;
  images?: string[];
  likes: number;
  isLiked?: boolean;
  comments: FeedCommentData[];
  likers: LikedUser[];
}

const DEFAULT_ACTIVITY_1: ActivityCreationUiState = {
  majorType: ActivityMajorType.SPORTS,
  subType: ActivitySubType.CYCLING,
  title: '雁栖湖45km骑行拉练',
  coverImageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400',
  startTime: '本周六 08:30',
  endTime: '本周六 16:00',
  deadlineTime: '本周五 20:00',
  maxParticipants: 15,
  minParticipants: 5,
  feeType: 'AA制',
  fixedFee: 0,
  startPoint: '雁栖湖景区大门',
  endPoint: '雁栖湖景区大门',
  itineraryNodes: [
    { id: 'act1-n1', day: 1, time: '08:30', title: '雁栖湖景区大门集合', nodeType: NodeType.START_POINT },
    { id: 'act1-n2', day: 1, time: '10:30', title: '湖东路线15km补给点', nodeType: NodeType.REST_STOP },
    { id: 'act1-n3', day: 1, time: '12:30', title: '环湖骑行终点集结', nodeType: NodeType.END_POINT }
  ],
  description: '经典雁栖湖环湖骑行，包含2个陡坡拉练节点，配有跟车保障与安全备用补给包。',
  equipmentTips: '请自备公路车/山地车及头盔',
  visibility: '公开',
  isApprovalRequired: false,
  isElectronicFenceEnabled: true,
  trackingWindowBeforeMinutes: 30,
  showParticipantLocationAndDistance: true,
  showParticipantNavigationRoute: true,
  enableArrivalAggregationAnimation: true,
  enableFloatingActivityVibes: true,
  isFormValid: true,
  errorMessages: {}
};

const DEFAULT_ACTIVITY_2: ActivityCreationUiState = {
  majorType: ActivityMajorType.SPORTS,
  subType: ActivitySubType.RUNNING,
  title: '奥森周末10km夜跑拉练',
  coverImageUrl: 'https://images.unsplash.com/photo-1542744094-24638ea0b343?auto=format&fit=crop&q=80&w=400',
  startTime: '周日 19:00',
  endTime: '周日 21:00',
  deadlineTime: '周日 18:00',
  maxParticipants: 20,
  minParticipants: 4,
  feeType: '免费',
  fixedFee: 0,
  startPoint: '奥森南门',
  endPoint: '奥森南门',
  itineraryNodes: [
    { id: 'act2-n1', day: 1, time: '19:00', title: '奥森南门地铁出站口集合', nodeType: NodeType.START_POINT },
    { id: 'act2-n2', day: 1, time: '20:15', title: '终点拉伸与补水', nodeType: NodeType.END_POINT }
  ],
  description: '奥林匹克森林公园南园环线，配速 5:30/km，欢迎夜跑爱好者一起提速！',
  equipmentTips: '穿舒适跑鞋',
  visibility: '公开',
  isApprovalRequired: false,
  isElectronicFenceEnabled: false,
  trackingWindowBeforeMinutes: 30,
  showParticipantLocationAndDistance: true,
  showParticipantNavigationRoute: true,
  enableArrivalAggregationAnimation: true,
  enableFloatingActivityVibes: true,
  isFormValid: true,
  errorMessages: {}
};

const INITIAL_STORIES: StoryCardData[] = [
  {
    id: 's1',
    kind: 'activity',
    coverUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400',
    title: '雁栖湖45km骑行',
    organizerName: 'Hui Zhang',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    participantAvatars: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
    ],
    activityData: DEFAULT_ACTIVITY_1
  },
  {
    id: 's2',
    kind: 'geotagged_photo',
    coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400',
    photos: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1476514525535-ce74f45814d0?auto=format&fit=crop&q=80&w=400'
    ],
    title: '阿那亚礼堂打卡',
    userMiniAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    userName: 'Sarah',
    locationName: '阿那亚礼堂',
    feedPostId: 'f1'
  },
  {
    id: 's3',
    kind: 'activity',
    coverUrl: 'https://images.unsplash.com/photo-1542744094-24638ea0b343?auto=format&fit=crop&q=80&w=400',
    title: '奥森周末10km夜跑',
    organizerName: 'Alex Mercer',
    organizerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    participantAvatars: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150'
    ],
    activityData: DEFAULT_ACTIVITY_2
  },
  {
    id: 's4',
    kind: 'geotagged_photo',
    coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
    photos: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400'
    ],
    title: '四姑娘山长坪沟',
    userMiniAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    userName: 'Elena',
    locationName: '四姑娘山',
    feedPostId: 'f2'
  }
];

const INITIAL_CIRCLES: GroupCircleData[] = [
  { id: 'c1', isFamily: true, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', name: '徒步核心组', hasNewActivity: true },
  { id: 'c2', isFamily: false, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', name: 'UI设计公会', hasNewActivity: true },
  { id: 'c3', isFamily: true, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', name: '极客车队', hasNewActivity: false },
  { id: 'c4', isFamily: false, avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', name: '山地自行车', hasNewActivity: true },
  { id: 'c5', isFamily: false, avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150', name: '夜游跑团', hasNewActivity: false }
];

const INITIAL_DETAILED_POSTS: DetailedFeedPost[] = [
  {
    id: 'f-9photos',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    userName: 'Sarah Chen',
    date: '5分钟前',
    location: '秦皇岛 · 阿那亚黄金海岸',
    content: '阿那亚秋日漫步九图 🌊 从日出孤独图书馆到黄昏礼堂，沙滩海风与艺术展览，每一帧都是治愈系的电影感画面！✨',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800'
    ],
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
    likes: 86,
    isLiked: true,
    likers: [
      { id: 'lk-901', name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '刚刚' },
      { id: 'lk-902', name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', time: '刚刚' },
      { id: 'lk-903', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', time: '刚刚' },
      { id: 'lk-904', name: 'David Miller', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', time: '刚刚' }
    ],
    comments: [
      { id: 'cm-91', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', userName: 'Alex Mercer', content: '九宫格构图绝了！尤其是第5张星空露营视角 📸', timestamp: '2分钟前' },
      { id: 'cm-92', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', userName: 'Hui Zhang', content: '海边风大不大？下周准备带无人机过去航拍！', timestamp: '1分钟前' }
    ]
  },
  {
    id: 'f-4photos',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    userName: 'Elena Rostova',
    date: '25分钟前',
    location: '静安区 · 自家手冲咖啡角',
    content: '今日四宫格自制下午茶 ☕ 埃塞俄比亚花魁水洗浅烘，搭配自制巴斯克芝士蛋糕与新鲜浆果，享受慢生活节奏。',
    images: [
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800'
    ],
    mediaUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=800',
    likes: 42,
    isLiked: false,
    likers: [
      { id: 'lk-401', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '10分钟前' },
      { id: 'lk-402', name: 'David Miller', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', time: '5分钟前' }
    ],
    comments: [
      { id: 'cm-41', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', userName: 'Sarah Chen', content: '研磨度和水温参数是多少呀？', timestamp: '15分钟前' }
    ]
  },
  {
    id: 'f-6photos',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    userName: 'Alex Mercer',
    date: '40分钟前',
    location: '海北藏族自治州 · 青海湖环湖东路',
    content: '六图连发！环青海湖360km骑行记录，蓝天白云、雪山圣湖与无际草原。在大自然面前所有的代码烦恼都烟消云散了 🚴‍♂️🏔️',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542744094-24638ea0b343?auto=format&fit=crop&q=80&w=800'
    ],
    mediaUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
    likes: 65,
    isLiked: true,
    likers: [
      { id: 'lk-601', name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', time: '30分钟前' }
    ],
    comments: [
      { id: 'cm-61', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', userName: 'Hui Zhang', content: '高海拔骑行注意补水和防晒！', timestamp: '20分钟前' }
    ]
  },
  {
    id: 'f1',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    userName: 'Hui Zhang',
    date: '1小时前',
    location: '怀柔区 · 雁栖湖示范区',
    content: '今天跟极客车队的小伙伴一起完成了 45km 的雁栖湖拉练！今天天气极佳，平均速度保持在 24.5km/h，大家协作配合太默契了！👍',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542744094-24638ea0b343?auto=format&fit=crop&q=80&w=800'
    ],
    mediaUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
    likes: 38,
    isLiked: true,
    likers: [
      { id: 'lk-101', name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '10:00' },
      { id: 'lk-102', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '10:05' },
      { id: 'lk-103', name: 'David Miller', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', time: '10:10' },
      { id: 'lk-104', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', time: '10:15' }
    ],
    comments: [
      { id: 'cm1', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', userName: 'Alex Mercer', content: '下周末安排百里画廊路线，有人一起报名吗？', timestamp: '8分钟前' },
      { id: 'cm2', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', userName: 'Sarah Chen', content: '拍的照片真棒！路书轨迹文件能分享一下吗？', timestamp: '5分钟前' }
    ]
  },
  {
    id: 'f2',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    userName: 'David Miller',
    date: '2小时前',
    location: '深圳市南山区 · 科技园 A座',
    content: 'Stellar 分布式服务路由算法 v2.0 已提 PR！重构了核心 RPC 服务调度和节点负载均衡逻辑，欢迎小组各架构师协同 Review。',
    images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    ],
    mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    likes: 52,
    isLiked: false,
    likers: [
      { id: 'lk-201', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '09:10' },
      { id: 'lk-202', name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '09:15' }
    ],
    comments: [
      { id: 'cm3', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', userName: 'Hui Zhang', content: 'LGTM！高并发测试指标表现十分稳定。', timestamp: '30分钟前' }
    ]
  }
];

interface DiscoverViewProps {
  isDarkMode?: boolean;
  posts?: DiscoverPost[];
  publishedActivities?: ActivityCreationUiState[];
  onLikePost?: (postId: string) => void;
  onOpenFriendProfile?: (friendId: string) => void;
  familyGroup?: FamilyGroupData | null;
  onOpenFamilyModal?: () => void;
  onOpenFamilyCare?: () => void;
  onSaveFamilyGroup?: (data: FamilyGroupData) => void;
  onRemoveFamilyGroup?: () => void;
  onShowToast?: (msg: string) => void;
  onOpenPlanetUniverse?: () => void;
  skills?: SkillItem[];
  onPracticeSkillExp?: (skill: SkillItem, e?: React.MouseEvent) => void;
  onToggleSkillEnable?: (skill: SkillItem, e?: React.MouseEvent) => void;
  onOpenStellarTab?: () => void;
  onOpenCourseApp?: () => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  isDarkMode = false,
  posts = [],
  publishedActivities = [],
  onLikePost,
  onOpenFriendProfile,
  familyGroup: propFamilyGroup,
  onOpenFamilyModal,
  onOpenFamilyCare,
  onSaveFamilyGroup,
  onRemoveFamilyGroup,
  onShowToast,
  onOpenPlanetUniverse,
  skills = INITIAL_SKILLS,
  onPracticeSkillExp,
  onToggleSkillEnable,
  onOpenStellarTab,
  onOpenCourseApp,
}) => {
  const [feedPosts, setFeedPosts] = useState<DetailedFeedPost[]>(() => {
    if (posts && posts.length > 0) {
      const convertedPropPosts: DetailedFeedPost[] = posts.map((p) => ({
        id: p.id,
        userAvatar: p.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        userName: p.authorName || 'Alexia Vance',
        date: p.time || '刚刚',
        location: p.location,
        weather: p.weather || '⛅ 16°C 晴',
        content: p.content || '',
        mediaUrl: p.image,
        images: p.images || (p.image ? [p.image] : []),
        likes: p.likes || 0,
        isLiked: p.likedByMe,
        comments: (p.commentsList || []).map((c) => ({
          id: c.id,
          userAvatar: c.userAvatar,
          userName: c.userName,
          content: c.content,
          timestamp: c.time,
        })),
        likers: [
          { id: `lk-1-${p.id}`, name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '刚刚' },
          { id: `lk-2-${p.id}`, name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '刚刚' }
        ],
      }));
      // Merge unique
      const existingIds = new Set(convertedPropPosts.map((cp) => cp.id));
      const filteredInitial = INITIAL_DETAILED_POSTS.filter((ip) => !existingIds.has(ip.id));
      return [...convertedPropPosts, ...filteredInitial];
    }
    return INITIAL_DETAILED_POSTS;
  });

  // Sync when posts prop updates
  React.useEffect(() => {
    if (posts && posts.length > 0) {
      const convertedPropPosts: DetailedFeedPost[] = posts.map((p) => ({
        id: p.id,
        userAvatar: p.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        userName: p.authorName || 'Alexia Vance',
        date: p.time || '刚刚',
        location: p.location,
        weather: p.weather || '⛅ 16°C 晴',
        content: p.content || '',
        mediaUrl: p.image,
        images: p.images || (p.image ? [p.image] : []),
        likes: p.likes || 0,
        isLiked: p.likedByMe,
        comments: (p.commentsList || []).map((c) => ({
          id: c.id,
          userAvatar: c.userAvatar,
          userName: c.userName,
          content: c.content,
          timestamp: c.time,
        })),
        likers: [
          { id: `lk-1-${p.id}`, name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '刚刚' },
          { id: `lk-2-${p.id}`, name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '刚刚' }
        ],
      }));
      const existingIds = new Set(convertedPropPosts.map((cp) => cp.id));
      const filteredInitial = INITIAL_DETAILED_POSTS.filter((ip) => !existingIds.has(ip.id));
      setFeedPosts([...convertedPropPosts, ...filteredInitial]);
    }
  }, [posts]);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [justCommentedPostId, setJustCommentedPostId] = useState<string | null>(null);
  const [selectedActivityForPreview, setSelectedActivityForPreview] = useState<ActivityCreationUiState | null>(null);
  const [cardPhotoIndexes, setCardPhotoIndexes] = useState<Record<string, number>>({});
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set(['f1']));
  const [animatingBookmarkPostId, setAnimatingBookmarkPostId] = useState<string | null>(null);
  const [forwardingPost, setForwardingPost] = useState<DetailedFeedPost | null>(null);
  const [selectedSkillForOperation, setSelectedSkillForOperation] = useState<SkillItem | null>(null);
  const [isEBookAppOpen, setIsEBookAppOpen] = useState(false);
  const [isCityCostAppOpen, setIsCityCostAppOpen] = useState(false);

  // Active skills that have been enabled and equipped (filter out happy skill so dedicated 家庭看护 module handles family care)
  const activeSkills = skills.filter(
    (s) => s.isInstalled && s.isEnabled && s.id !== 'skill-happy-family' && !s.id.includes('happy')
  );

  const renderDiscoverSkillIcon = (iconName: string) => {
    const size = 26;
    switch (iconName) {
      case 'database':
        return <Database size={size} className="text-[#1877F2]" />;
      case 'bar-chart':
        return <BarChart3 size={size} className="text-[#00A400]" />;
      case 'kanban':
        return <Kanban size={size} className="text-[#FA383E]" />;
      case 'bug':
        return <Bug size={size} className="text-[#D29922]" />;
      case 'book-open':
        return <BookOpen size={size} className="text-[#58A6FF]" />;
      case 'file-code':
        return <FileCode2 size={size} className="text-[#A371F7]" />;
      case 'sparkles':
        return <Sparkles size={size} className="text-[#F6851B]" />;
      case 'radar':
        return <Radio size={size} className="text-[#3FB950]" />;
      case 'compass':
        return <Compass size={size} className="text-[#58A6FF]" />;
      default:
        return <Cpu size={size} className="text-[#1877F2]" />;
    }
  };

  const toggleBookmark = (postId: string) => {
    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        soundEffects.playTapSound();
        if (onShowToast) onShowToast('已从「文档与资产 · 收藏夹」中移除');
      } else {
        next.add(postId);
        soundEffects.playBookmarkSound();
        setAnimatingBookmarkPostId(postId);
        setTimeout(() => {
          setAnimatingBookmarkPostId((curr) => (curr === postId ? null : curr));
        }, 750);
        if (onShowToast) onShowToast('⭐️ 已收藏该动态，已归入「文档与资产 · 收藏夹」');
      }
      return next;
    });
  };

  // 本地家庭小组 State (作为 prop 未传入时的 fallback)
  const [localFamilyGroup, setLocalFamilyGroup] = useState<FamilyGroupData | null>(null);
  const [localShowFamilyModal, setLocalShowFamilyModal] = useState<boolean>(false);

  const familyGroup = propFamilyGroup !== undefined ? propFamilyGroup : localFamilyGroup;

  const handleOpenFamilyModal = () => {
    if (familyGroup?.isSet && onOpenFamilyCare) {
      onOpenFamilyCare();
      return;
    }
    if (onOpenFamilyModal) {
      onOpenFamilyModal();
    } else {
      setLocalShowFamilyModal(true);
    }
  };

  // Convert user published activities to Story Cards for Hot (热门)
  const userStoryCards: StoryCardData[] = publishedActivities.map((act, idx) => {
    return {
      id: `user-act-story-${idx}`,
      kind: 'activity',
      coverUrl: act.coverImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
      title: act.title || '同城户外活动',
      organizerName: '我 (Alexia)',
      organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      participantAvatars: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
      ],
      isUserCreated: true,
      isLatest: idx === 0,
      activityData: act
    };
  });

  const allStoryCards = [...userStoryCards, ...INITIAL_STORIES];

  const toggleLike = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          let newLikers = [...p.likers];
          if (isLiked) {
            newLikers = newLikers.map((l) => ({ ...l, isNewest: false }));
            newLikers.push({
              id: `lk-me-${Date.now()}`,
              name: '我 (Alexia)',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
              time: '刚刚',
              isNewest: true,
            });
          } else {
            newLikers = newLikers.filter((l) => l.name !== '我 (Alexia)');
            if (newLikers.length > 0) {
              newLikers[newLikers.length - 1].isNewest = true;
            }
          }

          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
            likers: newLikers,
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const newComment: FeedCommentData = {
      id: `cm-${Date.now()}`,
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      userName: '我 (Alexia)',
      content: text,
      timestamp: '刚刚'
    };

    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newComment]
          };
        }
        return p;
      })
    );

    setCommentInputs({ ...commentInputs, [postId]: '' });

    // 触发评论图标变蓝波纹与微粒动效
    setJustCommentedPostId(postId);
    setTimeout(() => {
      setJustCommentedPostId((curr) => (curr === postId ? null : curr));
    }, 1200);
  };

  const [isHotExpanded, setIsHotExpanded] = useState(false);
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);

  return (
    <div onClick={(event) => { if (!(event.target as HTMLElement).closest('[data-post-menu]')) setOpenPostMenuId(null); }} onKeyDown={(event) => { if (event.key === 'Escape') setOpenPostMenuId(null); }} className="w-full h-full bg-white dark:bg-black text-[#050505] dark:text-white flex flex-col select-none overflow-y-auto no-scrollbar pb-6 divide-y divide-gray-200/90 dark:divide-zinc-800">
      
      {/* 2. HOT SECTION (热门) 横向滑动段落 */}
      <div className="bg-white dark:bg-black p-3.5">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center space-x-1.5">
            <Flame size={16} className="text-orange-500 fill-orange-500" />
            <span className="text-xs font-bold text-[#050505] dark:text-white">热门</span>
            {publishedActivities.length > 0 && (
              <span className="flex items-center space-x-1 px-2 py-0.5 text-[9px] font-black bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 text-white rounded-full shadow-xs animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>最新活动 ({publishedActivities.length})</span>
              </span>
            )}
          </div>
          <button type="button" aria-expanded={isHotExpanded} aria-controls="discover-hot-stories" onClick={() => setIsHotExpanded((value) => !value)} className="min-h-11 px-2 text-xs font-semibold text-[#1877F2] dark:text-blue-400 cursor-pointer hover:underline focus-visible:outline-2 focus-visible:outline-blue-500">
            {isHotExpanded ? '收起' : '查看更多'}
          </button>
        </div>

        {/* 热门卡片横向滚动列表 */}
        <div id="discover-hot-stories" className={isHotExpanded ? "flex flex-wrap justify-center gap-3 py-2 px-1" : "flex gap-3 overflow-x-auto no-scrollbar py-2 px-1"}>
          {allStoryCards.map((story, sIdx) => {
            const isActivity = story.kind === 'activity';
            const photosList = story.photos && story.photos.length > 0 ? story.photos : [story.coverUrl];
            const hasMultiplePhotos = !isActivity && photosList.length > 1;
            const activePhotoIdx = !isActivity ? ((cardPhotoIndexes[story.id] || 0) % photosList.length) : 0;

            const middleStackPhoto = photosList.length > 1 ? photosList[(activePhotoIdx + 1) % photosList.length] : null;
            const backStackPhoto = photosList.length > 2 ? photosList[(activePhotoIdx + 2) % photosList.length] : null;

            return (
              <div
                key={`story-${story.id}-${sIdx}`}
                role="button"
                tabIndex={0}
                aria-label={`查看${story.kind === 'activity' ? '活动' : '星片'}：${story.title}`}
                onKeyDown={(event) => {
                  if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    event.currentTarget.click();
                  }
                }}
                onClick={() => {
                  if (isActivity) {
                    if (story.activityData) {
                      setSelectedActivityForPreview(story.activityData);
                    }
                  } else {
                    // Geotagged-Photo: Enters friend user post / scrolls to post
                    if (story.feedPostId) {
                      const el = document.getElementById(`feed-post-${story.feedPostId}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ring-2', 'ring-[#1877F2]', 'shadow-lg', 'transition-all', 'duration-500');
                        setTimeout(() => {
                          el.classList.remove('ring-2', 'ring-[#1877F2]', 'shadow-lg');
                        }, 2000);
                      } else if (onOpenFriendProfile && story.userName) {
                        onOpenFriendProfile(story.userName);
                      } else {
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }
                    } else if (onOpenFriendProfile && story.userName) {
                      onOpenFriendProfile(story.userName);
                    }
                  }
                }}
                className="flex flex-col items-center shrink-0 group cursor-pointer select-none my-0.5 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-4"
              >
                <div className="relative w-30 h-42">
                  {/* 🌟 多张照片堆叠倾斜背景层 1 (最底层: 顺时针 6° 旋转 + 偏移) */}
                {hasMultiplePhotos && backStackPhoto && (
                  <motion.div
                    key={`back-${story.id}-${(activePhotoIdx + 2) % photosList.length}`}
                    initial={{ scale: 0.9, rotate: 3, opacity: 0.5 }}
                    animate={{ scale: 0.94, rotate: 6, opacity: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 rounded-2xl overflow-hidden border border-white/60 shadow-md origin-bottom-right group-hover:rotate-12 group-hover:translate-x-3.5 group-hover:-translate-y-2.5 transition-all duration-300 opacity-80 bg-gray-900 pointer-events-none"
                  >
                    <img
                      src={backStackPhoto}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" />
                  </motion.div>
                )}

                {/* 🌟 多张照片堆叠倾斜背景层 2 (中间层: 逆时针 -5° 旋转 + 偏移) */}
                {hasMultiplePhotos && middleStackPhoto && (
                  <motion.div
                    key={`middle-${story.id}-${(activePhotoIdx + 1) % photosList.length}`}
                    initial={{ scale: 0.93, rotate: -2, opacity: 0.7 }}
                    animate={{ scale: 0.97, rotate: -5, opacity: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 rounded-2xl overflow-hidden border border-white/70 shadow-md origin-bottom-left group-hover:-rotate-9 group-hover:-translate-x-3 group-hover:-translate-y-2 transition-all duration-300 opacity-90 bg-gray-900 pointer-events-none"
                  >
                    <img
                      src={middleStackPhoto}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]" />
                  </motion.div>
                )}

                {/* 前置顶层卡片 */}
                <div
                  className={`relative w-full h-full rounded-2xl overflow-hidden bg-gray-900 shadow-sm border transition-all duration-300 active:scale-98 ${
                    hasMultiplePhotos ? 'group-hover:-translate-y-1 group-hover:shadow-lg' : ''
                  } ${
                    story.isLatest
                      ? 'border-rose-500 ring-2 ring-rose-500/60 shadow-rose-200'
                      : story.isUserCreated
                        ? 'border-[#1877F2] ring-2 ring-[#1877F2]/40'
                        : 'border-[#E4E6EB]'
                  }`}
                >
                  {/* Animated Main Background photo */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${story.id}-photo-${activePhotoIdx}`}
                      initial={{ opacity: 0.5, scale: 0.96 }}
                      animate={{ opacity: 0.95, scale: 1 }}
                      exit={{ opacity: 0.4, scale: 0.96 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      src={photosList[activePhotoIdx]}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </AnimatePresence>

                  {/* Card overlay according to card form type */}
                  {isActivity ? (
                    /* ------------------ Form 1: Activity Card (发布的活动/用户可见活动) ------------------ */
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 p-2.5 flex flex-col justify-between">
                      {/* Top-left: Activity Name & Organizer */}
                      <div>
                        <p className="text-[10.5px] font-bold text-white leading-tight line-clamp-2 drop-shadow-xs">
                          {story.title}
                        </p>
                        <p className="text-[8.5px] font-semibold text-amber-300/95 truncate mt-0.5">
                          发起人: {story.organizerName || '团队领队'}
                        </p>
                      </div>

                      {/* Bottom-left: Participating Friends Stacked Avatars */}
                      <div>
                        <span className="text-[7.5px] text-gray-300 font-semibold block mb-0.5">
                          已报名好友:
                        </span>
                        <div className="flex -space-x-1.5 items-center">
                          {story.participantAvatars?.map((avUrl, pIdx) => (
                            <img
                              key={pIdx}
                              src={avUrl}
                              alt="Participant"
                              className="w-4.5 h-4.5 rounded-full ring-1 ring-white object-cover shadow-2xs"
                            />
                          ))}
                          {story.isUserCreated && (
                            <span className="w-4.5 h-4.5 rounded-full bg-amber-500 text-white text-[8px] font-black flex items-center justify-center ring-1 ring-white shadow-2xs">
                              +
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ------------------ Form 2: Geotagged-Photo Anchor Card (锚点照片) ------------------ */
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45 p-2 flex flex-col justify-between">
                      {/* Top bar: Left publisher mini avatar, Right multi-photo badge */}
                      <div className="flex items-center justify-between w-full">
                        <div
                          onClick={(e) => {
                            if (onOpenFriendProfile && story.userName) {
                              e.stopPropagation();
                              onOpenFriendProfile(story.userName);
                            }
                          }}
                          className="flex items-center space-x-1 bg-black/55 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/30 shadow-xs cursor-pointer hover:bg-black/75 transition-colors"
                          title={`查看 ${story.userName || '用户'} 资料`}
                        >
                          <img
                            src={story.userMiniAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                            alt={story.userName || '用户'}
                            className="w-4 h-4 rounded-full object-cover ring-1 ring-white shrink-0"
                          />
                          <span className="text-[8.5px] font-extrabold text-white truncate max-w-[48px]">
                            {story.userName || '用户'}
                          </span>
                        </div>

                        {hasMultiplePhotos && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardPhotoIndexes((prev) => ({
                                ...prev,
                                [story.id]: (activePhotoIdx + 1) % photosList.length
                              }));
                            }}
                            className="flex items-center space-x-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-1.5 py-0.5 rounded-full text-[8px] font-black border border-white/30 shadow-xs animate-pulse hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                            title="点击切换照片"
                          >
                            <Images size={8.5} className="text-white shrink-0" />
                            <span>{activePhotoIdx + 1}/{photosList.length}</span>
                          </button>
                        )}
                      </div>

                      {/* Photo Switching Arrows (Left / Right) */}
                      {hasMultiplePhotos && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardPhotoIndexes((prev) => ({
                                ...prev,
                                [story.id]: (activePhotoIdx - 1 + photosList.length) % photosList.length
                              }));
                            }}
                            className="absolute left-1 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 text-white flex items-center justify-center opacity-100 transition-opacity hover:bg-black/70 cursor-pointer shadow-xs z-10"
                            title="上一张"
                          >
                            <ChevronLeft size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardPhotoIndexes((prev) => ({
                                ...prev,
                                [story.id]: (activePhotoIdx + 1) % photosList.length
                              }));
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 text-white flex items-center justify-center opacity-100 transition-opacity hover:bg-black/70 cursor-pointer shadow-xs z-10"
                            title="下一张"
                          >
                            <ChevronRight size={11} />
                          </button>
                        </>
                      )}

                      {/* Bottom row: Dot indicators and Location Badge */}
                      <div className="w-full flex items-center justify-between">
                        {/* Dot indicators */}
                        {hasMultiplePhotos ? (
                          <div className="flex space-x-0.5 items-center">
                            {photosList.map((_, pIdx) => (
                              <span
                                key={pIdx}
                                aria-hidden="true"
                                className={`h-1 rounded-full transition-colors ${pIdx === activePhotoIdx ? 'w-2.5 bg-amber-400' : 'w-1 bg-white/60'}`}
                              />
                            ))}
                          </div>
                        ) : (
                          <div />
                        )}

                        {/* Bottom-right: Location Icon / Geotag Badge */}
                        <div className="self-end flex items-center space-x-1 bg-black/60 backdrop-blur-xs text-white px-1.5 py-0.5 rounded-full text-[8px] font-extrabold border border-white/25 shadow-2xs shrink-0 ml-auto">
                          <MapPin size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                          <span className="truncate max-w-[52px] text-amber-100">{story.locationName}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                </div>

                {/* 类别文字标签：活动显示“活动”缩小字，Geotagged-Photo 下方显示“星片” */}
                <div className="mt-1.5 flex items-center justify-center">
                  <span
                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full transition-all ${
                      isActivity
                        ? 'text-[#1877F2] bg-[#E7F3FF]'
                        : 'text-amber-800 bg-amber-50 border border-amber-200/60'
                    }`}
                  >
                    {isActivity ? '活动' : '星片'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. FEED POSTS - INSTAGRAM STYLE COMPACT FEED DIVIDED BY 1PX SOLID LINES */}
      <div className="w-full bg-white dark:bg-black divide-y divide-[#E4E6EB] dark:divide-zinc-800 border-t border-[#E4E6EB] dark:border-zinc-800">
        {feedPosts.map((post, postIdx) => {
          // Up to 8 likers displayed in bottom right corner of image in irregular non-stacked aggregated ring
          const cornerLikers = post.likers.slice(0, 8);

          return (
            <div
              key={`disc-post-${post.id}-${postIdx}`}
              id={`feed-post-${post.id}`}
              className="w-full bg-white dark:bg-black transition-colors border-b border-solid border-[#E4E6EB] dark:border-zinc-700 last:border-b-0"
            >
              {/* Header (Full Width Instagram Header) */}
              <div className="p-3 flex items-center justify-between border-b border-gray-100/60 dark:border-zinc-800">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={post.userAvatar}
                    alt={post.userName}
                    onClick={() => onOpenFriendProfile && onOpenFriendProfile(post.userName)}
                    className="w-8.5 h-8.5 rounded-full object-cover ring-1 ring-gray-200 dark:ring-zinc-700 border border-white dark:border-zinc-800 cursor-pointer hover:opacity-85 transition-opacity"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4
                        onClick={() => onOpenFriendProfile && onOpenFriendProfile(post.userName)}
                        className="text-xs font-bold text-[#050505] dark:text-white hover:underline cursor-pointer"
                      >
                        {post.userName}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-[#65676B] dark:text-zinc-400 font-light">
                      <span className="flex items-center shrink-0">
                        <Clock size={10} className="inline mr-0.5 opacity-70 shrink-0" />
                        <span>{post.date}</span>
                      </span>
                      {post.location && (
                        <span className="flex items-center space-x-0.5 text-gray-400 font-light shrink min-w-0">
                          <span className="opacity-50">·</span>
                          <MapPin size={10} className="inline text-[#1877F2] shrink-0" />
                          <span className="font-light tracking-tight truncate max-w-[120px]">{post.location}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-0.5 text-[#65676B] font-light shrink-0">
                        <span className="opacity-50 text-gray-400">·</span>
                        <span className="text-[10px] select-none leading-none">⛅</span>
                        <span className="font-light tracking-tight">
                          {post.weather || '16°C 晴'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div data-post-menu className="relative flex items-center space-x-2">
                  <button type="button" aria-label="打开动态更多操作" aria-expanded={openPostMenuId === post.id} aria-controls={`post-actions-${post.id}`} title="打开动态更多操作" onClick={() => setOpenPostMenuId((id) => id === post.id ? null : post.id)} className="w-11 h-11 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500">
                    <MoreHorizontal size={20} className="mx-auto" />
                  </button>
                  {openPostMenuId === post.id && (
                    <div id={`post-actions-${post.id}`} className="absolute right-0 top-full z-20 min-w-36 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1 shadow-lg" onKeyDown={(event) => { if (event.key === 'Escape') setOpenPostMenuId(null); }}>
                      <button type="button" onClick={() => { toggleBookmark(post.id); setOpenPostMenuId(null); }} className="w-full min-h-11 px-3 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">{savedPostIds.has(post.id) ? '取消收藏' : '收藏动态'}</button>
                      <button type="button" onClick={() => { setForwardingPost(post); setOpenPostMenuId(null); }} className="w-full min-h-11 px-3 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">转发动态</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Post Content Text - Larger font distinguishing the topic clearly */}
              <div className="px-3.5 pt-2.5 pb-2">
                <p className="text-[13.5px] sm:text-sm text-[#050505] dark:text-zinc-100 leading-relaxed whitespace-pre-line font-medium tracking-tight">
                  {post.content}
                </p>
              </div>

              {/* Media Image(s) / Multi-Photo Grid (up to 9 photos) with Irregular Scatter Corner Likers */}
              {(() => {
                const postImages = post.images && post.images.length > 0 ? post.images : (post.mediaUrl ? [post.mediaUrl] : []);
                if (postImages.length === 0) return null;
                return (
                  <PostMediaGrid
                    images={postImages}
                    cornerLikers={cornerLikers}
                  />
                );
              })()}

              {/* Action Bar (Real-Time Counts: Like "15赞", Comment "12条", Share) */}
              <div className="px-3.5 pt-2.5 pb-2 flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  {/* 点赞图标 + 15赞 (X-Themed 60fps 爆炸粒子点赞动效) */}
                  <XThemedLikeButton
                    isLiked={Boolean(post.isLiked)}
                    likesCount={post.likes}
                    onToggle={() => toggleLike(post.id)}
                    size={19}
                    labelSuffix="赞"
                  />

                  {/* 评论图标 + 12条 (评论后变蓝并伴随 60fps 涟漪微粒与气泡弹跳动效) */}
                  {(() => {
                    const hasUserCommented = post.comments.some(
                      (c) =>
                        c.userName === '我' ||
                        c.userName.includes('我') ||
                        c.userName.includes('Alexia') ||
                        c.userName.includes('Rarcardo') ||
                        c.userName === '你'
                    );
                    return (
                      <AnimatedCommentButton
                        commentsCount={post.comments.length}
                        hasUserCommented={hasUserCommented}
                        isJustCommented={justCommentedPostId === post.id}
                        size={19}
                        onClick={() => {
                          const inputEl = document.getElementById(`comment-input-${post.id}`);
                          if (inputEl) inputEl.focus();
                        }}
                      />
                    );
                  })()}

                  {/* 统一绿色微交互动效与音效分享按钮 (不与点赞、评论、收藏冲突) */}
                  <UnifiedShareButton
                    onClick={() => setForwardingPost(post)}
                    label="转发"
                    size={19}
                    variant="action-bar"
                    title="转发分享给好友"
                  />
                </div>

                <button
                  onClick={() => toggleBookmark(post.id)}
                  className="relative w-11 h-11 text-[#050505] dark:text-white hover:text-amber-500 transition-all cursor-pointer group flex items-center justify-center select-none"
                  title={savedPostIds.has(post.id) ? '已收藏' : '收藏'}
                  aria-label={savedPostIds.has(post.id) ? '取消收藏' : '收藏'}
                >
                  <motion.div
                    animate={
                      animatingBookmarkPostId === post.id
                        ? { scale: [1, 1.45, 0.88, 1.15, 1], rotate: [0, 16, -10, 4, 0] }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{ duration: 0.52, ease: 'easeOut' }}
                    className="flex items-center justify-center"
                  >
                    <Bookmark
                      size={19}
                      className={`transition-colors group-active:scale-125 ${
                        savedPostIds.has(post.id)
                          ? 'fill-amber-500 text-amber-500 filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.35)]'
                          : 'text-[#050505] dark:text-white'
                      }`}
                    />
                  </motion.div>

                  {/* Sparkling Star Particle Burst Effect on Bookmark */}
                  <AnimatePresence>
                    {animatingBookmarkPostId === post.id && (
                      <motion.span
                        key={`bookmark-burst-${post.id}`}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none flex items-center justify-center"
                      >
                        <motion.span
                          initial={{ scale: 0.2, opacity: 0.9 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 0.55, ease: 'easeOut' }}
                          className="absolute w-5 h-5 rounded-full border border-amber-400"
                        />
                        {[0, 60, 120, 180, 240, 300].map((deg) => (
                          <motion.span
                            key={deg}
                            initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                            animate={{
                              opacity: [1, 1, 0],
                              x: Math.cos((deg * Math.PI) / 180) * 16,
                              y: Math.sin((deg * Math.PI) / 180) * 16,
                              scale: [0.5, 1.1, 0.3],
                            }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="absolute text-[8px] text-amber-500 font-bold leading-none select-none"
                          >
                            ✦
                          </motion.span>
                        ))}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* Latest Liker Summary - Smaller and thinner font */}
              {post.likers.length > 0 && (
                <div className="px-3.5 text-[9.5px] text-[#65676B] mb-1 font-light tracking-tight">
                  由 <span className="font-normal text-gray-800 dark:text-zinc-200 hover:underline cursor-pointer" onClick={() => onOpenFriendProfile && onOpenFriendProfile(post.likers[post.likers.length - 1].name)}>{post.likers[post.likers.length - 1].name}</span> 等 <span className="font-normal text-gray-800 dark:text-zinc-200">{post.likes} 人</span> 赞过
                </div>
              )}

              {/* Clean Instagram Plain Text Comments (纯文字与表情符号显示，无聊天气泡) */}
              <div className="px-3.5 pb-2.5 space-y-1.5">
                {post.comments.map((comment, cIdx) => (
                  <div key={`disc-comment-${comment.id}-${cIdx}`} className="leading-snug flex items-start justify-between py-0.5 group">
                    <div className="flex items-start space-x-1.5 text-[#050505] dark:text-zinc-100 min-w-0 flex-1">
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        onClick={() => onOpenFriendProfile && onOpenFriendProfile(comment.userName)}
                        className="w-4 h-4 rounded-full object-cover shrink-0 ring-1 ring-gray-200 border border-white mt-[1px] cursor-pointer hover:opacity-85"
                      />
                      <div className="leading-snug min-w-0">
                        <span
                          onClick={() => onOpenFriendProfile && onOpenFriendProfile(comment.userName)}
                          className="text-xs font-semibold text-[#050505] dark:text-zinc-100 mr-1.5 hover:underline cursor-pointer align-baseline"
                        >
                          {comment.userName}
                        </span>
                        <span className="text-xs font-normal text-gray-700 dark:text-zinc-300 leading-relaxed align-baseline">
                          {comment.content}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-400 shrink-0 ml-2 pt-0.5 font-light">{comment.timestamp}</span>
                  </div>
                ))}

                {/* Clean Comment Input Field (Subtle dotted line border) */}
                <div className="flex items-center space-x-2 pt-2 border-t border-dotted border-[#E4E6EB] dark:border-zinc-700/60 mt-1.5">
                  <input
                    id={`comment-input-${post.id}`}
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    placeholder="添加评论..."
                    aria-label={`评论 ${post.userName} 的动态`}
                    className="min-w-0 flex-1 min-h-11 text-sm text-[#050505] dark:text-zinc-100 placeholder-gray-500 dark:placeholder-zinc-400 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg bg-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddComment(post.id);
                    }}
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    disabled={!commentInputs[post.id]?.trim()}
                    className={`min-h-11 min-w-11 text-xs font-bold cursor-pointer transition-colors ${
                      commentInputs[post.id]?.trim()
                        ? 'text-[#1877F2] hover:text-blue-700'
                        : 'text-gray-300'
                    }`}
                  >
                    发布
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL: 热门切片活动路书详情预览 Modal */}
      {selectedActivityForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-md bg-[#F0F2F5] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-200 animate-in zoom-in-95 duration-150">
            {/* Header image */}
            <div className="relative h-44 w-full bg-slate-900 shrink-0">
              <img
                src={selectedActivityForPreview.coverImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800'}
                alt="Activity Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 bg-[#1877F2] text-white text-[10px] font-extrabold rounded-full">
                    {selectedActivityForPreview.subType ? SUB_TYPE_CONFIG[selectedActivityForPreview.subType]?.display : '热门切片活动'}
                  </span>
                  <button
                    onClick={() => setSelectedActivityForPreview(null)}
                    className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white leading-tight drop-shadow-md">
                    {selectedActivityForPreview.title}
                  </h3>
                  <p className="text-[11px] text-gray-200 mt-1 flex items-center space-x-2">
                    <span>📍 {selectedActivityForPreview.startPoint} ➔ {selectedActivityForPreview.endPoint}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3">
              {/* Stats card */}
              <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">招募人数</span>
                  <span className="text-xs font-extrabold text-[#050505]">
                    {selectedActivityForPreview.minParticipants}-{selectedActivityForPreview.maxParticipants}人
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">费用模式</span>
                  <span className="text-xs font-extrabold text-[#1877F2]">
                    {selectedActivityForPreview.feeType}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">查看权限</span>
                  <span className="text-xs font-extrabold text-emerald-600">
                    {selectedActivityForPreview.visibility}
                  </span>
                </div>
              </div>

              {/* Time info */}
              <div className="bg-white p-3 rounded-2xl border border-gray-200/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-xs">
                  <Calendar size={14} className="text-[#1877F2]" />
                  <span className="font-bold text-[#050505]">活动开始：{selectedActivityForPreview.startTime || '时间未定'}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Clock size={14} className="text-amber-500" />
                  <span>报名截止：{selectedActivityForPreview.deadlineTime || '满员即止'}</span>
                </div>
              </div>

              {/* Itinerary Timeline Roadmap */}
              {selectedActivityForPreview.itineraryNodes && selectedActivityForPreview.itineraryNodes.length > 0 && (
                <div className="bg-white p-3 rounded-2xl border border-gray-200/80 space-y-2">
                  <span className="text-xs font-bold text-[#050505] block border-b border-gray-100 pb-1.5">
                    🗺️ 活动行程路书时间轴 ({selectedActivityForPreview.itineraryNodes.length}个节点)
                  </span>

                  <div className="relative pl-3 space-y-2 border-l-2 border-blue-200 ml-1">
                    {selectedActivityForPreview.itineraryNodes.map((node, nIdx) => {
                      const typeConf = (node.nodeType && NODE_TYPE_CONFIG[node.nodeType as NodeType])
                        ? NODE_TYPE_CONFIG[node.nodeType as NodeType]
                        : { display: '节点', colorBg: 'bg-blue-100', colorText: 'text-[#1877F2]', icon: '📍' };
                      return (
                        <div key={`itin-node-${node.id || nIdx}-${nIdx}`} className="relative text-xs">
                          <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-white border-2 border-[#1877F2]" />
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[9px] font-extrabold px-1 bg-blue-100 text-[#1877F2] rounded">
                              Day {node.day} {node.time}
                            </span>
                            <span className={`text-[9px] font-bold px-1 rounded ${typeConf.colorBg} ${typeConf.colorText}`}>
                              {typeConf.display}
                            </span>
                          </div>
                          <p className="font-bold text-[#050505] mt-0.5">{node.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedActivityForPreview.description && (
                <div className="bg-white p-3 rounded-2xl border border-gray-200/80 space-y-1">
                  <span className="text-xs font-bold text-[#050505] block">活动招募计划说明</span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {selectedActivityForPreview.description}
                  </p>
                </div>
              )}

              {/* Electronic Fence Security */}
              <div className="bg-blue-50/80 p-2.5 rounded-2xl border border-blue-200 flex items-center justify-between text-xs text-[#1877F2]">
                <div className="flex items-center space-x-1.5 font-bold">
                  <ShieldCheck size={16} />
                  <span>电子围栏及实时位置共享状态：</span>
                </div>
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {selectedActivityForPreview.isElectronicFenceEnabled ? '已开启告警' : '未开启'}
                </span>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-gray-500">发起人：{allStoryCards.find((story) => story.activityData === selectedActivityForPreview)?.organizerName || '活动发起人'}</span>
              <button
                onClick={() => {
                  const activeRoleId = getActiveRoleId();
                  if (selectedActivityForPreview?.id) {
                    joinSharedActivityInStore(activeRoleId, selectedActivityForPreview.id);
                  }
                  if (onShowToast) {
                    onShowToast('🎉 报名成功！已成功将活动同步至您的双角色日程');
                  }
                  setSelectedActivityForPreview(null);
                }}
                className="px-5 py-2 bg-[#1877F2] hover:bg-blue-600 text-white font-extrabold rounded-2xl text-xs transition-colors cursor-pointer shadow-md"
              >
                🚀 报名加入活动
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 添加/设置家庭小组 Modal (Standalone fallback when not controlled by App) */}
      <FamilyGroupModal
        isOpen={localShowFamilyModal}
        onClose={() => setLocalShowFamilyModal(false)}
        familyGroup={familyGroup}
        onSaveFamilyGroup={(data) => {
          if (onSaveFamilyGroup) {
            onSaveFamilyGroup(data);
          } else {
            setLocalFamilyGroup(data);
          }
        }}
        onRemoveFamilyGroup={() => {
          if (onRemoveFamilyGroup) {
            onRemoveFamilyGroup();
          } else {
            setLocalFamilyGroup(null);
          }
        }}
      />

      {/* MODAL: 转发与分享卡片抽屉 (好友转发 + 微信/邮件/彩信/链接) */}
      <AnimatePresence>
        {forwardingPost && (
          <div className="fixed inset-0 z-[920] flex items-end justify-center bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl border-t border-[#CED0D4]/80 flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-[#E4E6EB] flex items-center justify-between bg-[#F8F9FA]">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center">
                    <Share2 size={13} />
                  </div>
                  <span className="text-xs font-black text-[#050505]">转发动态</span>
                </div>
                <button
                  onClick={() => setForwardingPost(null)}
                  className="w-7 h-7 rounded-full bg-gray-200/80 hover:bg-gray-300 flex items-center justify-center text-[#65676B] cursor-pointer transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto no-scrollbar">
                {/* Post Summary Preview Card */}
                <div className="bg-[#F0F2F5] p-3 rounded-2xl border border-[#CED0D4]/70 flex items-start space-x-3">
                  <img
                    src={forwardingPost.userAvatar}
                    alt={forwardingPost.userName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-white"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-[#050505]">{forwardingPost.userName}</span>
                      <span className="text-[10px] text-[#65676B]">· {forwardingPost.date}</span>
                    </div>
                    <p className="text-[11px] text-[#050505] line-clamp-2 mt-0.5 leading-snug font-normal">
                      {forwardingPost.content}
                    </p>
                  </div>
                  {forwardingPost.mediaUrl && (
                    <img
                      src={forwardingPost.mediaUrl}
                      alt="Thumbnail"
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white shadow-2xs"
                    />
                  )}
                </div>

                {/* Section 1: 转发给好友 (Stellar 好友快捷发送) */}
                <div>
                  <div className="text-[11px] font-bold text-[#65676B] mb-2 px-1 flex items-center justify-between">
                    <span>转发给好友</span>
                    <span className="text-[10px] text-[#1877F2]">原型转发演示</span>
                  </div>
                  <div className="flex space-x-3 overflow-x-auto no-scrollbar py-1 px-1">
                    {[
                      { name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
                      { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
                      { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150' },
                      { name: 'David Miller', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' },
                      { name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
                      { name: 'Liam Wilson', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150' },
                    ].map((friend, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (onShowToast) onShowToast(`原型演示：向【${friend.name}】转发动态，尚未发送`);
                          setForwardingPost(null);
                        }}
                        className="flex flex-col items-center space-y-1 shrink-0 group cursor-pointer"
                      >
                        <div className="relative">
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1877F2]/30 group-hover:ring-[#1877F2] transition-all group-hover:scale-105"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#1877F2] text-white rounded-full flex items-center justify-center shadow-xs shrink-0">
                            <Send size={11} className="shrink-0" />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#050505] truncate max-w-[56px] text-center">
                          {friend.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 2: 分享到其他平台应用 (微信、邮件、彩信、复制链接) */}
                <div>
                  <div className="text-[11px] font-bold text-[#65676B] mb-2.5 px-1">
                    分享至其他平台应用
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {/* 微信 */}
                    <button
                      onClick={() => {
                        if (onShowToast) onShowToast('原型演示：微信分享入口，尚未调用微信');
                        setForwardingPost(null);
                      }}
                      className="flex flex-col items-center space-y-1.5 p-2 rounded-2xl hover:bg-[#F0F2F5] transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#07C160]/10 text-[#07C160] border border-[#07C160]/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#07C160] group-hover:text-white transition-all shadow-2xs">
                        <MessageCircle size={22} className="fill-current" />
                      </div>
                      <span className="text-[10.5px] font-bold text-[#050505]">微信</span>
                    </button>

                    {/* 邮件 */}
                    <button
                      onClick={() => {
                        if (onShowToast) onShowToast('原型演示：邮件分享入口，尚未创建邮件');
                        setForwardingPost(null);
                      }}
                      className="flex flex-col items-center space-y-1.5 p-2 rounded-2xl hover:bg-[#F0F2F5] transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1877F2] border border-blue-200 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#1877F2] group-hover:text-white transition-all shadow-2xs">
                        <Mail size={20} />
                      </div>
                      <span className="text-[10.5px] font-bold text-[#050505]">邮件</span>
                    </button>

                    {/* 彩信 */}
                    <button
                      onClick={() => {
                        if (onShowToast) onShowToast('原型演示：短信分享入口，尚未发送');
                        setForwardingPost(null);
                      }}
                      className="flex flex-col items-center space-y-1.5 p-2 rounded-2xl hover:bg-[#F0F2F5] transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-2xs">
                        <MessageSquare size={20} />
                      </div>
                      <span className="text-[10.5px] font-bold text-[#050505]">彩信</span>
                    </button>

                    {/* 复制链接 */}
                    <button
                      onClick={() => {
                        if (onShowToast) onShowToast('原型演示：动态链接复制入口，尚未写入剪贴板');
                        setForwardingPost(null);
                      }}
                      className="flex flex-col items-center space-y-1.5 p-2 rounded-2xl hover:bg-[#F0F2F5] transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100 text-[#050505] border border-gray-300 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#050505] group-hover:text-white transition-all shadow-2xs">
                        <LinkIcon size={20} />
                      </div>
                      <span className="text-[10.5px] font-bold text-[#050505]">复制链接</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Skill Operation Modal / Playground Workspace */}
      <AnimatePresence>
        {selectedSkillForOperation && (
          <SkillOperationModal
            skill={selectedSkillForOperation}
            onClose={() => setSelectedSkillForOperation(null)}
            showToast={onShowToast || (() => {})}
            onPracticeExp={onPracticeSkillExp}
            onToggleEnable={onToggleSkillEnable}
            onNavigateToStellar={onOpenStellarTab}
          />
        )}
      </AnimatePresence>

      {/* Direct E-Book Reader Product App */}
      {isEBookAppOpen && (
        <EBookReaderApp
          isDarkMode={isDarkMode}
          onClose={() => setIsEBookAppOpen(false)}
          showToast={onShowToast || (() => {})}
        />
      )}

      {/* Direct City Cost of Living Product App */}
      {isCityCostAppOpen && (
        <CityCostOfLivingApp
          onClose={() => setIsCityCostAppOpen(false)}
          showToast={onShowToast || (() => {})}
        />
      )}

    </div>
  );
};

