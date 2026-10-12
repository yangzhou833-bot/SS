import React, { useState, useEffect, useMemo } from 'react';
import { Friend } from '../types';
import { getWeatherByLocationName } from '../utils/weatherEngine';
import { ClayCarAvatarWithHearts } from './ClayCarAvatarWithHearts';
import { AvatarWithOrbitStickers } from './AvatarWithOrbitStickers';
import { INITIAL_USER_STICKERS } from '../data/stickerData';
import { LabelSticker } from '../types';
import { getFriendSpeechNoteDetail } from '../utils/friendSpeechNotes';
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  UserCheck,
  MessageCircle,
  MapPin,
  Home,
  Calendar,
  GraduationCap,
  Compass,
  Share2,
  Bookmark,
  Heart,
  Sparkles,
  Users,
  Image as ImageIcon,
  Check,
  Send,
  Phone,
  Video,
  Clock,
  Tag,
  Edit3,
} from 'lucide-react';

interface FriendProfileModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (friendId: string) => void;
}

interface FriendPostComment {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

interface FriendPostLiker {
  id: string;
  name: string;
  avatar: string;
  time: string;
}

interface FriendPostItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  targetName?: string;
  time: string;
  content: string;
  image?: string;
  locationName?: string;
  likes: number;
  isLiked?: boolean;
  likers: FriendPostLiker[];
  comments: FriendPostComment[];
}

const SAMPLE_LIKERS: FriendPostLiker[] = [
  { id: 'lk1', name: 'Hui Zhang', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', time: '5分钟前' },
  { id: 'lk2', name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', time: '12分钟前' },
  { id: 'lk3', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '20分钟前' },
  { id: 'lk4', name: 'Elena', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', time: '35分钟前' },
  { id: 'lk5', name: 'David', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150', time: '1小时前' },
  { id: 'lk6', name: 'Chloe', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', time: '2小时前' },
  { id: 'lk7', name: 'Kevin', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150', time: '3小时前' },
  { id: 'lk8', name: 'Sophia', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', time: '4小时前' },
];

// 8-Avatar Irregular Scatter Ring Component for Likes / Comments Aggregation
const ScatterLikesRing: React.FC<{ likesCount: number; commentsCount: number }> = ({
  likesCount,
  commentsCount,
}) => {
  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
  ];

  const scatterOffsets = [
    { x: -48, y: -20 },
    { x: -16, y: -45 },
    { x: 20, y: -40 },
    { x: 45, y: -14 },
    { x: 40, y: 20 },
    { x: 10, y: 44 },
    { x: -24, y: 38 },
    { x: -46, y: 10 },
  ];

  return (
    <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {sampleAvatars.map((url, idx) => {
          const offset = scatterOffsets[idx % scatterOffsets.length];
          return (
            <div
              key={`scatter-${idx}`}
              className="absolute w-5 h-5 rounded-full ring-2 ring-white shadow-md overflow-hidden bg-white hover:scale-125 transition-transform cursor-pointer"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }}
            >
              <img src={url} alt={`Liker ${idx}`} className="w-full h-full object-cover" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full flex items-center justify-center text-white text-[6px] ring-1 ring-white">
                ❤️
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col text-[10px] font-bold text-white drop-shadow-md">
        <span className="text-rose-400 flex items-center space-x-1">
          <Heart size={11} className="fill-rose-500 text-rose-500" />
          <span>{likesCount}赞</span>
        </span>
        <span className="text-gray-200">{commentsCount}条评论</span>
      </div>
    </div>
  );
};

export const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  friend,
  isOpen,
  onClose,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'together' | 'about'>('together');
  const [isPoking, setIsPoking] = useState(false);
  const [pokeToast, setPokeToast] = useState<string | null>(null);
  const [isCloseFriend, setIsCloseFriend] = useState(false);
  const [remarkName, setRemarkName] = useState<string>('');
  const [isEditingRemark, setIsEditingRemark] = useState<boolean>(false);
  const [inputRemark, setInputRemark] = useState<string>('');

  useEffect(() => {
    if (friend) {
      setRemarkName(friend.remark || '');
      setInputRemark(friend.remark || '');
    }
  }, [friend?.id, friend?.remark]);

  // ADD: State for Shared Moments / Together History (共同时光与记录)
  const [isAddingMoment, setIsAddingMoment] = useState(false);
  const [newActivityType, setNewActivityType] = useState('💕 浪漫约会与羽毛球');
  const [newLocation, setNewLocation] = useState('东方红广场');
  const [newDuration, setNewDuration] = useState('1小时');
  const [newNote, setNewNote] = useState('');

  const isLoverRelation = friend?.relationship === ('lover' as any) || friend?.id === 'f1' || friend?.name.includes('薛梦');
  const isFamilyRelation = friend?.relationship === 'family' || friend?.isFamily || friend?.id.startsWith('fam-');

  // Orbiting Avatar Frame Ring Bubbles array depending on relationship
  const orbitBubbles = useMemo(() => {
    if (isLoverRelation) {
      return ['💕', '💖', '💗', '💓', '✨', '❤️', '🌸', '💫'];
    }
    if (isFamilyRelation) {
      return ['🏠', '❤️', '🛡️', '🍲', '✨', '🌟', '☕', '🍃'];
    }
    return ['🏃‍♂️', '⚽', '🎾', '☕', '🚴', '🏀', '🎵', '⚡'];
  }, [isLoverRelation, isFamilyRelation]);

  // Shared moments initial mock seed per friend type
  const [togetherMoments, setTogetherMoments] = useState(() => {
    if (isLoverRelation) {
      return [
        {
          id: 'tm1',
          date: '今天 12:30',
          location: '东方红广场',
          activityType: '💕 浪漫约会与羽毛球',
          duration: '陪伴 52 分钟',
          bubbles: ['💕', '💖', '💗', '🏃‍♂️', '🎾'],
          note: '在城关区东方红广场一起打羽毛球，两个人头像周围都冒着粉色爱心与运动活力气泡！',
          image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600',
          likes: 18,
        },
        {
          id: 'tm2',
          date: '8月24日 19:30',
          location: '阿那亚礼堂',
          activityType: '🌅 落日飞驰与海边散步',
          duration: '陪伴 2.5 小时',
          bubbles: ['💕', '✨', '💗', '🌊', '🌅'],
          note: '海边的落日特别温暖，两个人并肩走在沙滩上，记录下绝美的共同时光。',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
          likes: 32,
        },
        {
          id: 'tm3',
          date: '8月20日 15:00',
          location: '中央音乐学院',
          activityType: '🎹 钢琴合奏与琴房交谈',
          duration: '陪伴 1.8 小时',
          bubbles: ['🎵', '🎹', '💖', '✨'],
          note: '探讨了四手联弹的新曲目，琴音流转间充满了无言的默契。',
          image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&q=80&w=600',
          likes: 25,
        },
      ];
    }
    if (isFamilyRelation) {
      return [
        {
          id: 'tm1',
          date: '今天 10:00',
          location: '华中温泉花园',
          activityType: '🏠 家庭露营茶话会',
          duration: '陪伴 2.0 小时',
          bubbles: ['🏠', '❤️', '🛡️', '☕', '✨'],
          note: '全家在花园小院泡茶聊天，享受温馨宁静的阳光，头像周围冒出守护爱心气泡。',
          image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=600',
          likes: 20,
        },
        {
          id: 'tm2',
          date: '8月21日 12:00',
          location: '兰州饭店',
          activityType: '🍲 团圆家宴聚餐',
          duration: '陪伴 1.5 小时',
          bubbles: ['🍲', '❤️', '🏠', '🌟'],
          note: '正宗兰州牛肉面与手抓羊肉，温馨氛围满满。',
          likes: 15,
        },
      ];
    }
    return [
      {
        id: 'tm1',
        date: '今天 12:00',
        location: '东方红广场',
        activityType: '🏃‍♂️ 5km 约跑与羽毛球',
        duration: '陪伴 45 分钟',
        bubbles: ['🏃‍♂️', '⚽', '🎾', '🚴', '⚡'],
        note: '和好友一起在广场运动打卡，两个人头像周围都冒出了运动图标气泡！',
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=600',
        likes: 12,
      },
      {
        id: 'tm2',
        date: '8月22日 14:00',
        location: '极客咖啡工坊',
        activityType: '☕ 代码周记与下午茶',
        duration: '陪伴 3.0 小时',
        bubbles: ['☕', '💻', '✨', '💡'],
        note: '一起交流了架构设计与灵感，效率翻倍！',
        likes: 19,
      },
    ];
  });

  // Derived friend regional weather
  const friendWeather = friend ? getWeatherByLocationName(friend.locationName || '', friend.lat, friend.lng) : { emoji: "☀️", temp: "27°C", regionName: "兰州", condition: "晴" };

  // Generate weather background simulation particles
  const weatherParticles = useMemo(() => {
    if (!friendWeather) return [];
    const condition = friendWeather.condition || "";
    const isRain = condition.includes("雨");
    const isSnow = condition.includes("雪");
    if (!isRain && !isSnow) return [];

    const list = [];
    const count = 35; // optimal quantity for performance and fluidity
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 4}s`,
        duration: isRain ? `${0.8 + Math.random() * 0.8}s` : `${4 + Math.random() * 4}s`,
        size: isRain ? undefined : `${2 + Math.random() * 4}px`,
        opacity: 0.3 + Math.random() * 0.6,
      });
    }
    return list;
  }, [friendWeather?.condition]);

  const [posts, setPosts] = useState<FriendPostItem[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [friendStickers, setFriendStickers] = useState<LabelSticker[]>(() => {
    return (friend?.stickers && friend.stickers.length > 0)
      ? friend.stickers
      : INITIAL_USER_STICKERS.slice(0, 4);
  });

  useEffect(() => {
    if (friend?.stickers && friend.stickers.length > 0) {
      setFriendStickers(friend.stickers);
    } else {
      setFriendStickers(INITIAL_USER_STICKERS.slice(0, 4));
    }
  }, [friend]);

  const handleLikeFriendSticker = (stickerId: string) => {
    setFriendStickers((prev) =>
      prev.map((s) => {
        if (s.id === stickerId) {
          const myUser = {
            id: 'my-user',
            name: '我',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
            likedAt: '刚刚',
            reactionEmoji: '❤️',
          };
          return {
            ...s,
            likes: s.likes + 1,
            isLikedByMe: true,
            likedByMe: true,
            likers: [myUser, ...s.likers.filter((l) => l.id !== 'my-user')],
          };
        }
        return s;
      })
    );
  };

  useEffect(() => {
    if (isOpen && friend) {
      if (friend.name.includes('薛梦') || friend.name.includes('Sarah')) {
        setIsCloseFriend(true);
      } else {
        setIsCloseFriend(false);
      }
      const name = friend.profileDetail?.chineseName || friend.name;
      const defaultPosts: FriendPostItem[] = [
        {
          id: 'fp1',
          authorName: name,
          authorAvatar: friend.avatar,
          time: '10分钟前',
          content: `阿那亚礼堂的落日余晖，和大家一起跑完5km非常尽兴！🌅✨ 下周末计划四姑娘山徒步，有人组队吗？`,
          image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
          locationName: '阿那亚礼堂',
          likes: 28,
          isLiked: false,
          likers: SAMPLE_LIKERS,
          comments: [
            {
              id: 'c1',
              userName: 'Hui Zhang',
              userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
              content: '风景太棒了！下周末算我一个 🏃‍♂️',
              timestamp: '8分钟前',
            },
            {
              id: 'c2',
              userName: 'Alex Mercer',
              userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
              content: '已报名组队！',
              timestamp: '5分钟前',
            },
          ],
        },
        {
          id: 'fp2',
          authorName: "Mick O'Connor",
          authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
          targetName: name,
          time: '7月7日',
          content: `把 1 张新照片添加到 ${name} 的时间线`,
          image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&q=80&w=800',
          locationName: '中央音乐学院',
          likes: 42,
          isLiked: true,
          likers: SAMPLE_LIKERS,
          comments: [
            {
              id: 'c3',
              userName: 'Sarah',
              userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
              content: '合照拍得好好看！✨',
              timestamp: '7月7日',
            },
          ],
        },
      ];
      setPosts(defaultPosts);
    }
  }, [isOpen, friend?.id, friend?.name, friend?.profileDetail?.chineseName]);

  const isLover = Boolean(friend?.name.includes('薛梦') || friend?.name.includes('Sarah') || isCloseFriend);
  const isDrivingState = Boolean((friend?.activity === 'driving' || (friend?.speed && friend?.speed !== '0 km/h')) && isLover);
  const [showCarAvatarMode, setShowCarAvatarMode] = useState<boolean>(false);

  useEffect(() => {
    if (isDrivingState) {
      setShowCarAvatarMode(true);
    }
  }, [isDrivingState]);

  if (!isOpen || !friend) return null;

  const detail = friend.profileDetail || {
    chineseName: friend.name,
    coverImage:
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=1000',
    friendsCount: '3,229',
    postsCount: '547',
    bio: 'Pianist, Amateur Novelist, Fitness Enthusiast, Anime Fan, Jazz Music lover',
    hometown: '河南省 郑州市',
    currentCity: '河南省 郑州市',
    education: '中央音乐学院 Central Conservatory of Music',
    educationYear: '2012 届',
    birthday: '11月15日',
    gender: '女性',
  };

  const baseName = detail.chineseName || friend.name;
  const displayName = remarkName ? `${baseName} (${remarkName})` : baseName;

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextIsLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextIsLiked,
            likes: nextIsLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `c_${Date.now()}`,
                userName: '我',
                userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
                content: text,
                timestamp: '刚刚',
              },
            ],
          };
        }
        return p;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handlePoke = () => {
    setIsPoking(true);
    setPokeToast(`👉 你戳了戳 ${displayName}！对方设备已收到震动提醒`);
    setTimeout(() => setIsPoking(false), 600);
    setTimeout(() => setPokeToast(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F0F2F5] flex flex-col select-none overflow-y-auto animate-in fade-in duration-150 font-sans">
      {/* Facebook Cover Image Banner & Top Navigation */}
      <div className="relative h-64 bg-gradient-to-b from-[#8CCDF0] via-[#C4E8FA] to-[#E4F5FD] shrink-0 overflow-hidden">
        {/* Dynamic Live Weather Simulation Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <style>{`
            .animate-rain-drop {
              animation: weather-rain linear infinite;
            }
            .animate-snow-flake {
              animation: weather-snow linear infinite;
            }
            @keyframes weather-rain {
              0% { transform: translateY(-50px) rotate(15deg); opacity: 0; }
              10% { opacity: 0.7; }
              90% { opacity: 0.7; }
              100% { transform: translateY(250px) rotate(15deg); opacity: 0; }
            }
            @keyframes weather-snow {
              0% { transform: translateY(-20px) translateX(-10px) rotate(0deg); opacity: 0; }
              10% { opacity: 0.8; }
              90% { opacity: 0.8; }
              100% { transform: translateY(250px) translateX(20px) rotate(360deg); opacity: 0; }
            }
          `}</style>

          {/* Conditional Background Color Overlays */}
          {friendWeather.condition.includes("雨") && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#374151] via-[#4b5563] to-[#6b7280]" />
          )}
          {friendWeather.condition.includes("雪") && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#d1d5db] via-[#e5e7eb] to-[#f9fafb]" />
          )}
          {friendWeather.condition.includes("云") && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#9ca3af] via-[#cbd5e1] to-[#f8fafc]" />
          )}

          {/* Particle Elements */}
          {friendWeather.condition.includes("雨") && weatherParticles.map((p) => (
            <div
              key={`rain-${p.id}`}
              className="absolute w-[1.5px] h-10 bg-blue-300/70 rounded-full animate-rain-drop"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                opacity: p.opacity,
              }}
            />
          ))}

          {friendWeather.condition.includes("雪") && weatherParticles.map((p) => (
            <div
              key={`snow-${p.id}`}
              className="absolute bg-white rounded-full animate-snow-flake"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                width: p.size,
                height: p.size,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        {/* Decorative Floating Decals (更外围的渐变空域氛围贴纸) - Hidden if raining or snowing to stay elegant */}
        {!friendWeather.condition.includes("雨") && !friendWeather.condition.includes("雪") && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* Sun (☀️) */}
            <div className="absolute top-[10%] left-[10%] text-3xl opacity-85 animate-[bounce_6s_infinite_ease-in-out]">☀️</div>
            {/* Rainbow (🌈) */}
            <div className="absolute top-[40%] left-[3%] text-4xl opacity-50 animate-[pulse_4s_infinite_ease-in-out]">🌈</div>
            {/* Cloud (☁️) */}
            <div className="absolute top-[20%] right-[35%] text-4xl opacity-60 animate-[bounce_7s_infinite_ease-in-out] [animation-delay:1s]">☁️</div>
            {/* Sparkles (✨) */}
            <div className="absolute top-[15%] right-[20%] text-2xl opacity-80 animate-[pulse_3s_infinite_ease-in-out] [animation-delay:0.5s]">✨</div>
            {/* Heart (❤️) */}
            <div className="absolute top-[60%] right-[40%] text-2xl opacity-75 animate-[bounce_5s_infinite_ease-in-out] [animation-delay:2s]">❤️</div>
            {/* Clover (🍀) */}
            <div className="absolute top-[70%] left-[30%] text-2xl opacity-80 animate-[pulse_5s_infinite_ease-in-out] [animation-delay:1.5s]">🍀</div>
          </div>
        )}

        {/* Top Floating Control Bar (Moved down to avoid telecom navigation bar and status bar) */}
        <div className="absolute top-10 left-3 right-3 flex items-center justify-between z-40">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/35 hover:bg-white/50 border border-white/40 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
            title="返回"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Top-Right Action Row (Phone, Video, Clock, More) */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setPokeToast("📞 正在发起语音通话...");
                setTimeout(() => setPokeToast(null), 2500);
              }}
              className="w-9 h-9 rounded-full bg-white/35 hover:bg-white/50 border border-white/40 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
              title="语音通话"
            >
              <Phone size={16} />
            </button>
            <button
              onClick={() => {
                setPokeToast("📹 正在发起视频连线...");
                setTimeout(() => setPokeToast(null), 2500);
              }}
              className="w-9 h-9 rounded-full bg-white/35 hover:bg-white/50 border border-white/40 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
              title="视频连线"
            >
              <Video size={16} />
            </button>
            <button
              onClick={() => {
                setPokeToast("⏰ 正在打开守护管理中心...");
                setTimeout(() => setPokeToast(null), 2500);
              }}
              className="w-9 h-9 rounded-full bg-white/35 hover:bg-white/50 border border-white/40 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
              title="管理中心"
            >
              <Clock size={16} />
            </button>
            <button
              onClick={() => {
                setPokeToast("✨ 打开了密友更多选项");
                setTimeout(() => setPokeToast(null), 2500);
              }}
              className="w-9 h-9 rounded-full bg-white/35 hover:bg-white/50 border border-white/40 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
              title="更多操作"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Sync Weather Badge at Top-Right - moved down to top-22 */}
        <div 
          className="absolute right-3 top-22 flex items-center space-x-2 bg-black/30 hover:bg-black/50 border border-white/30 backdrop-blur-md px-3 py-1 rounded-full text-white shadow-sm z-30 select-none cursor-pointer transition-all hover:scale-105 active:scale-95"
          title={`${friend.name} 所在 IP 的同步天气: ${friendWeather.regionName} ${friendWeather.condition} ${friendWeather.temp}`}
          onClick={() => {
            setPokeToast(`📍 ${friend.name} 所在 IP (${friendWeather.regionName})天气同步：${friendWeather.emoji} ${friendWeather.condition} · ${friendWeather.temp}`);
            setTimeout(() => setPokeToast(null), 3000);
          }}
        >
          <span className="text-base filter drop-shadow-sm animate-[pulse_3s_infinite_ease-in-out]">{friendWeather.emoji}</span>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[9px] font-black">{friendWeather.regionName}</span>
            <span className="text-[7px] font-extrabold opacity-95">{friendWeather.condition} · {friendWeather.temp}</span>
          </div>
        </div>
      </div>

      {/* Facebook Profile Header Info Block */}
      <div className="bg-white px-4 pt-0 pb-5 border-b border-gray-200/80 shrink-0">
        
        {/* Overlapping Avatar with beautiful layout */}
        <div className="flex flex-col items-center relative -mt-16 mb-5 select-none w-full">
          
          {/* Avatar Container with Stickers and Speeches */}
          <div className="relative shrink-0">
            
            {/* 头像发言气泡: 仅在小车模式下独立展示，标准头像模式下由 AvatarWithOrbitStickers 统一优雅渲染，杜绝双层气泡互相重叠 */}
            {showCarAvatarMode && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-xl shadow-md border border-gray-100 flex items-center space-x-1.5 whitespace-nowrap z-30 select-none animate-[bounce_4s_infinite_ease-in-out]">
                <span className="text-[11px] font-bold text-gray-700">
                  {detail.bio ? `“${detail.bio.slice(0, 18)}...”` : "正在星空下漫步 🌌"}
                </span>
                {/* Down Arrow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45" />
              </div>
            )}

            {/* Radial Giant Bubbleless Stickers (头尾、四周自然呼吸的表情) */}
            <div className="absolute inset-0 pointer-events-none select-none z-10">
              {/* Sticker 1: 🎵 */}
              <div className="absolute -top-3 -left-12 text-4xl animate-[bounce_4s_infinite_ease-in-out] [animation-delay:0s]">🎵</div>
              {/* Sticker 2: 🎹 */}
              <div className="absolute -top-5 -right-12 text-4xl animate-[bounce_5s_infinite_ease-in-out] [animation-delay:0.7s]">🎹</div>
              {/* Sticker 3: ✨ */}
              <div className="absolute -bottom-4 -left-14 text-4xl animate-[pulse_3s_infinite_ease-in-out] [animation-delay:1.2s]">✨</div>
              {/* Sticker 4: 🌌 */}
              <div className="absolute -bottom-5 -right-14 text-4xl animate-[pulse_4s_infinite_ease-in-out] [animation-delay:0.3s]">🌌</div>
              {/* Sticker 5: 📝 shifted to avoid overlap */}
              <div className="absolute top-20 -left-16 text-4xl animate-[bounce_6s_infinite_ease-in-out] [animation-delay:1.8s]">📝</div>
              {/* Sticker 6: 跑 */}
              <div className="absolute top-12 -right-16 text-4xl animate-[bounce_4.5s_infinite_ease-in-out] [animation-delay:0.9s]">🏃‍♂️</div>
            </div>

            {/* Avatar Image Frame (Supports standard avatar with RealMoji Stickers & 1:1 Clay Car + Hearts) */}
            <div className="relative z-20 my-1">
              {showCarAvatarMode ? (
                <div className="relative flex items-center justify-center my-2 scale-90 sm:scale-100">
                  <ClayCarAvatarWithHearts
                    avatarUrl={friend.avatar}
                    avatarAlt={displayName}
                    size="md"
                    speedText={friend.speed || '42 km/h 🚗'}
                    isDriving={true}
                    onClick={() => {
                      setPokeToast("🚗 薛梦正在驾车奔赴你的位置，车速 42 km/h！💖");
                      setTimeout(() => setPokeToast(null), 2500);
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <AvatarWithOrbitStickers
                    avatarUrl={friend.avatar}
                    userName={displayName}
                    mood={getFriendSpeechNoteDetail(friend as any).emoji || friend.moodEmoji || '✨'}
                    battery={friend.batteryLevel ?? 88}
                    behaviorStatus={friend.behaviorStatus || '在线'}
                    relationship={isCloseFriend ? 'close' : isLover ? 'family' : undefined}
                    speechBubbleText={friend.profileDetail?.signature ? friend.profileDetail.signature.slice(0, 16) : (friend.statusText || getFriendSpeechNoteDetail(friend as any).cleanText)}
                    bubbleTheme={getFriendSpeechNoteDetail(friend as any).theme.id}
                    bubbleEmoji={getFriendSpeechNoteDetail(friend as any).emoji}
                    stickers={friendStickers}
                    size="lg"
                    isInteractive={true}
                    isEditable={false}
                    onLikeSticker={handleLikeFriendSticker}
                    onShowToast={(msg) => {
                      setPokeToast(msg);
                      setTimeout(() => setPokeToast(null), 2500);
                    }}
                  />
                </div>
              )}
            </div>

            {/* If Lover, provide 1:1 Clay Car toggle button */}
            {isLover && (
              <button
                type="button"
                onClick={() => setShowCarAvatarMode(!showCarAvatarMode)}
                className="mt-2 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs z-30"
              >
                <span>🚗</span>
                <span>{showCarAvatarMode ? '切换为标准头像' : '1:1 汽车爱心气泡动效'}</span>
              </button>
            )}

            {/* Avatar Live Status Badge */}
            <div className="absolute bottom-1 right-2 z-30 flex items-center bg-white border border-white rounded-full px-2 py-0.5 shadow-md">
              <span className="relative flex h-2 w-2 mr-1">
                {friend.isOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
                )}
              </span>
              <span className="text-[9px] font-extrabold text-gray-700 tracking-tight">
                {friend.isOnline ? "在线" : "离线"}
              </span>
            </div>

            {/* 心情语音气泡 (Voice Player Bubble) safe placement below avatar */}
            <div 
              onClick={() => {
                setPokeToast("🔊 心情语音正在播放: 「好想去森林露营呀...🌲⛺」");
                setTimeout(() => setPokeToast(null), 3000);
              }}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-[#1877F2] text-white px-3 py-1 rounded-full shadow-md flex items-center space-x-1.5 whitespace-nowrap z-30 cursor-pointer hover:scale-105 active:scale-95 transition-all select-none border border-blue-400"
            >
              {/* Up arrow pointing to avatar */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45" />
              <span className="text-xs">🔊</span>
              <span className="text-[10px] font-extrabold tracking-tight">心情语音 12"</span>
              <div className="flex items-center space-x-0.5">
                <span className="w-0.5 h-2 bg-white/70 rounded-full animate-pulse" />
                <span className="w-0.5 h-3 bg-white rounded-full animate-pulse [animation-delay:0.2s]" />
                <span className="w-0.5 h-1.5 bg-white/50 rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>

          </div>
        </div>

        {/* Profile Name & Remark Button */}
        <div className="text-center mt-12 flex flex-col items-center">
          <div className="flex items-center justify-center space-x-2 flex-wrap gap-y-1">
            <h1 className="text-2xl font-extrabold text-[#050505] tracking-tight flex items-center gap-1.5">
              <span>{displayName}</span>
            </h1>

            {!isEditingRemark && (
              <button
                onClick={() => {
                  setInputRemark(remarkName);
                  setIsEditingRemark(true);
                }}
                className="px-2.5 py-1 rounded-full bg-[#F0F2F5] hover:bg-[#1877F2] hover:text-white text-[#65676B] transition-all cursor-pointer text-xs font-bold flex items-center space-x-1 border border-[#E4E6EB] active:scale-95 shadow-2xs group"
                title="设置/修改好友备注"
              >
                <Tag size={13} className="text-[#1877F2] group-hover:text-white transition-colors" />
                <span>{remarkName ? '修改备注' : '设置备注'}</span>
              </button>
            )}
          </div>

          {/* Inline Remark Edit Form */}
          {isEditingRemark && (
            <div className="mt-2.5 flex items-center space-x-2 bg-blue-50/90 p-2 rounded-xl border border-blue-200/90 shadow-sm animate-in fade-in zoom-in-95">
              <input
                type="text"
                placeholder="填写备注名称..."
                value={inputRemark}
                onChange={(e) => setInputRemark(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const trimmed = inputRemark.trim();
                    setRemarkName(trimmed);
                    if (friend) friend.remark = trimmed;
                    setIsEditingRemark(false);
                    setPokeToast(trimmed ? `已将备注设置为: 「${trimmed}」` : '已清除备注');
                    setTimeout(() => setPokeToast(null), 2500);
                  }
                }}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-[#050505] outline-none focus:border-[#1877F2] w-40 font-medium"
                autoFocus
              />
              <button
                onClick={() => {
                  const trimmed = inputRemark.trim();
                  setRemarkName(trimmed);
                  if (friend) friend.remark = trimmed;
                  setIsEditingRemark(false);
                  setPokeToast(trimmed ? `已将备注设置为: 「${trimmed}」` : '已清除备注');
                  setTimeout(() => setPokeToast(null), 2500);
                }}
                className="bg-[#1877F2] hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setInputRemark(remarkName);
                  setIsEditingRemark(false);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                取消
              </button>
            </div>
          )}
        </div>

        {/* Facebook Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={handlePoke}
            className={`bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] border border-[#CED0D4] font-bold text-xs py-2 px-3 rounded-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              isPoking ? 'scale-110 bg-blue-100 border-[#1877F2]' : ''
            }`}
            title="戳一戳好友"
          >
            <span className="text-xs">👉</span>
            <span>戳一戳</span>
          </button>

          <button className="bg-white border border-[#E4E6EB] hover:border-[#CED0D4] text-[#1C1E21] font-bold text-xs py-2 px-3 rounded-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer">
            <UserCheck size={14} className="text-[#1877F2] shrink-0" />
            <span>已是好友</span>
          </button>

          <button
            onClick={() => {
              const nextState = !isCloseFriend;
              setIsCloseFriend(nextState);
              setPokeToast(
                nextState
                  ? `已将 ${displayName} 添加为密友 💖`
                  : `已取消 ${displayName} 的密友标记`
              );
              setTimeout(() => setPokeToast(null), 2500);
            }}
            className={`font-bold text-xs py-2 px-3 rounded-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer border ${
              isCloseFriend
                ? 'bg-rose-50 text-rose-600 border-rose-200/90 shadow-2xs'
                : 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500 shadow-xs'
            }`}
            title={isCloseFriend ? "点击取消密友状态" : "点击添加为密友"}
          >
            <Heart size={14} className={`shrink-0 ${isCloseFriend ? "fill-rose-500 text-rose-500" : "fill-white text-white"}`} />
            <span>{isCloseFriend ? "已是密友" : "加为密友"}</span>
          </button>

          <button
            onClick={() => {
              if (onSendMessage) {
                onSendMessage(friend.id);
                onClose();
              }
            }}
            className="bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs py-2 px-3 rounded-md flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer border border-[#1877F2]"
          >
            <MessageCircle size={14} className="shrink-0" />
            <span>发消息</span>
          </button>
        </div>
      </div>

      {/* Facebook Horizontal Navigation Tabs */}
      <div className="bg-white border-b border-gray-200/80 px-4 flex items-center space-x-5 text-xs font-bold text-[#65676B] shrink-0 sticky top-0 z-20 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('together')}
          className={`py-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'together'
              ? 'border-pink-500 text-pink-600 font-extrabold'
              : 'border-transparent hover:text-[#050505]'
          }`}
        >
          <span>{isLoverRelation ? "共同历史记录 💕" : isFamilyRelation ? "陪伴历史记录 🏠" : "共同历史记录 🏃‍♂️"}</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-[#1877F2] text-[#1877F2]'
              : 'border-transparent hover:text-[#050505]'
          }`}
        >
          动态
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`py-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === 'about'
              ? 'border-[#1877F2] text-[#1877F2]'
              : 'border-transparent hover:text-[#050505]'
          }`}
        >
          关于
        </button>
      </div>

      {/* ADD: Shared Moments / Together History Tab Content */}
      {activeTab === 'together' && (
        <div className="bg-[#F0F2F5] p-3.5 space-y-3.5 pb-16 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className={`p-4 rounded-2xl shadow-sm text-white relative overflow-hidden ${
            isLoverRelation
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500'
              : isFamilyRelation
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600'
          }`}>
            <div className="absolute right-2 top-2 text-6xl opacity-20 select-none pointer-events-none">
              {isLoverRelation ? '💕' : isFamilyRelation ? '🏠' : '🏃‍♂️'}
            </div>
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider opacity-90 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full inline-block">
                {isLoverRelation ? '浪漫羁绊记录' : isFamilyRelation ? '家庭守护档案' : '好友共同记录'}
              </span>
              <h2 className="text-lg font-black tracking-tight">
                和 {displayName} 的共同时光
              </h2>
              <p className="text-[11px] opacity-95 leading-relaxed">
                {isLoverRelation
                  ? '记录你们在同一个地点的每一份浪漫、悸动与陪伴，每一次相遇头像周围都会冒出爱心气泡 💕'
                  : isFamilyRelation
                  ? '记录全家同地点陪伴的温馨时光，每一刻都有守护的温度 🏠'
                  : '记录和好友一起运动、咖啡、打卡的充实记录，同地点时头像冒出活力图标 🏃‍♂️'}
              </p>
            </div>
          </div>

          {/* Cumulative Statistics Overview Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-3 rounded-2xl border border-[#E4E6EB] shadow-2xs text-center flex flex-col items-center justify-center">
              <span className="text-xl mb-0.5">{isLoverRelation ? '💖' : isFamilyRelation ? '⏱️' : '🏃‍♂️'}</span>
              <span className="text-[10px] text-gray-500 font-bold">累计陪伴</span>
              <span className="text-xs font-black text-gray-900 mt-0.5">
                {isLoverRelation ? '128 小时' : isFamilyRelation ? '350 小时' : '48 小时'}
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-[#E4E6EB] shadow-2xs text-center flex flex-col items-center justify-center">
              <span className="text-xl mb-0.5">📌</span>
              <span className="text-[10px] text-gray-500 font-bold">共同打卡</span>
              <span className="text-xs font-black text-gray-900 mt-0.5">
                {togetherMoments.length + 15} 次
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-[#E4E6EB] shadow-2xs text-center flex flex-col items-center justify-center">
              <span className="text-xl mb-0.5">✨</span>
              <span className="text-[10px] text-gray-500 font-bold">默契指数</span>
              <span className="text-xs font-black text-pink-600 mt-0.5">
                {isLoverRelation ? '99% 💕' : isFamilyRelation ? '100% 🏠' : '95% ⚡'}
              </span>
            </div>
          </div>

          {/* Current Same Location Live Status Badge if applicable */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl shadow-2xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl animate-bounce">📍</span>
              <div className="flex flex-col">
                <span className="text-xs font-black text-amber-900">
                  当前在同一地点相聚中！
                </span>
                <span className="text-[10px] text-amber-700 font-medium">
                  城关区 东方红广场 · 头像四周正在冒出{isLoverRelation ? '爱心' : isFamilyRelation ? '温暖' : '运动'}气泡
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsAddingMoment((prev) => !prev)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10.5px] px-2.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              {isAddingMoment ? '取消记录' : '+ 记录今日相会'}
            </button>
          </div>

          {/* Add Moment Form Modal/Inline */}
          {isAddingMoment && (
            <div className="bg-white p-4 rounded-2xl border border-pink-200 shadow-md space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-xs font-extrabold text-gray-900 flex items-center space-x-1">
                <span>📸</span>
                <span>打卡记录与 {displayName} 的今日共同时光</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">活动主题与气泡图标</label>
                  <select
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 font-bold outline-none"
                  >
                    <option value="💕 浪漫约会 (冒爱心气泡)">💕 浪漫约会 (冒爱心气泡)</option>
                    <option value="🏃‍♂️ 运动打卡 (冒活力图标)">🏃‍♂️ 运动打卡 (冒活力图标)</option>
                    <option value="☕ 咖啡休闲 (冒休闲气泡)">☕ 咖啡休闲 (冒休闲气泡)</option>
                    <option value="🏠 家庭团聚 (冒守护气泡)">🏠 家庭团聚 (冒守护气泡)</option>
                    <option value="🎹 音乐艺术 (冒音符气泡)">🎹 音乐艺术 (冒音符气泡)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">相聚地点</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 font-bold outline-none"
                      placeholder="地点名称"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">相聚时长</label>
                    <input
                      type="text"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 font-bold outline-none"
                      placeholder="如: 1.5小时"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">回忆感悟 / 心情备忘</label>
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 outline-none resize-none"
                    placeholder="记录下这一刻的美好细节吧..."
                  />
                </div>

                <button
                  onClick={() => {
                    if (!newNote.trim()) {
                      setPokeToast("请输入一点心情备忘文本哦~");
                      setTimeout(() => setPokeToast(null), 2000);
                      return;
                    }
                    const newEntry = {
                      id: `tm_${Date.now()}`,
                      date: '刚刚',
                      location: newLocation || '东方红广场',
                      activityType: newActivityType,
                      duration: `陪伴 ${newDuration || '1小时'}`,
                      bubbles: isLoverRelation ? ['💕', '💖', '💗', '✨'] : isFamilyRelation ? ['🏠', '❤️', '🛡️'] : ['🏃‍♂️', '⚽', '🎾'],
                      note: newNote,
                      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600',
                      likes: 1,
                    };
                    setTogetherMoments((prev) => [newEntry, ...prev]);
                    setIsAddingMoment(false);
                    setNewNote('');
                    setPokeToast("🎉 已成功保存共同时光记录！已加入好友时光历史");
                    setTimeout(() => setPokeToast(null), 2500);
                  }}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  保存并生成共同时光卡片 ✨
                </button>
              </div>
            </div>
          )}

          {/* Moments Timeline History Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-800 flex items-center justify-between px-1">
              <span className="flex items-center space-x-1">
                <span>📜</span>
                <span>共同历史记录 · 相遇地点与时间回忆卡片 ({togetherMoments.length})</span>
              </span>
              <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">回忆积累中</span>
            </h3>

            {togetherMoments.map((m, mIdx) => (
              <div
                key={`together-moment-${m.id}-${mIdx}`}
                className="bg-white rounded-2xl border border-[#E4E6EB] p-3.5 shadow-2xs space-y-2.5 relative overflow-hidden group hover:border-pink-300 transition-all"
              >
                {/* Top Meta Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-extrabold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                      {m.activityType}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {m.duration}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">{m.date}</span>
                </div>

                {/* Location & Avatar Orbit Bubbles Preview Tag */}
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                  <div className="flex items-center space-x-1 text-gray-800">
                    <MapPin size={12} className="text-[#1877F2] shrink-0" />
                    <span>{m.location}</span>
                  </div>

                  {/* Floating Orbit Bubbles preview */}
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-pink-50 to-purple-50 px-2 py-0.5 rounded-full border border-pink-100/80">
                    <span className="text-[9px] text-pink-600 font-bold">冒气泡:</span>
                    <div className="flex items-center space-x-0.5 text-xs">
                      {m.bubbles.map((b, i) => (
                        <span key={`moment-bubble-${m.id}-${i}`} className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Note Description */}
                <p className="text-xs text-gray-800 leading-relaxed font-medium">
                  {m.note}
                </p>

                {/* Photo Image Attachment if available */}
                {m.image && (
                  <div className="rounded-xl overflow-hidden max-h-48 bg-gray-100 border border-gray-100">
                    <img src={m.image} alt="Moment Photo" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Bottom Footer Like Action */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
                  <span className="text-[10px] text-gray-400">已沉淀为专属记忆</span>
                  <button
                    onClick={() => {
                      setTogetherMoments((prev) =>
                        prev.map((item) => (item.id === m.id ? { ...item, likes: item.likes + 1 } : item))
                      );
                    }}
                    className="flex items-center space-x-1 text-pink-600 font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Heart size={13} className="fill-pink-500 stroke-pink-500" />
                    <span>{m.likes} 点赞</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facebook Timeline Tab Content */}
      {activeTab === 'timeline' && (
        <div className="space-y-2 pb-12">
          {/* Timeline Feed Posts (Fully matching DiscoverView's Instagram/Facebook design) */}
          <div className="divide-y divide-gray-200/80 border-t border-b border-gray-200/80 bg-white">
            {posts.map((post, postIdx) => (
              <div key={`profile-post-${post.id}-${postIdx}`} className="py-4">
                {/* Post Header */}
                <div className="px-4 flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#050505]">
                        <span>{post.authorName}</span>
                        {post.targetName && (
                          <span className="text-gray-500 font-normal">
                            {' '}▶{' '}<strong className="text-[#050505]">{post.targetName}</strong>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#65676B] flex items-center space-x-1.5 mt-0.5 font-light">
                        <span>{post.time}</span>
                        {post.locationName && (
                          <>
                            <span className="opacity-50">·</span>
                            <span className="text-gray-400 font-light flex items-center space-x-0.5">
                              <MapPin size={10} className="text-[#1877F2] shrink-0" />
                              <span className="font-light tracking-tight">{post.locationName}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button className="text-gray-400 hover:text-gray-700 cursor-pointer">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                {/* Post Content Text */}
                <p className="px-4 text-xs text-[#050505] leading-relaxed mb-3">
                  {post.content}
                </p>

                {/* Media Image with Bottom-Right Scatter Ring Aggregation */}
                {post.image && (
                  <div className="relative bg-gray-100 overflow-hidden mb-3">
                    <img
                      src={post.image}
                      alt="Post Media"
                      className="w-full h-auto max-h-[420px] object-cover"
                    />

                    {/* Bottom-Right Irregular Scatter Corner Likers with Mini Heart Badges */}
                    {post.likers && post.likers.length > 0 && (
                      <div
                        className="absolute bottom-2 right-2 z-10 w-24 h-16 select-none pointer-events-none"
                        title="点赞的好友"
                      >
                        {post.likers.map((liker, lIdx) => {
                          const irregularOffsets = [
                            { bottom: '6px', right: '6px', size: 'w-5 h-5', zIndex: 'z-20' },
                            { bottom: '22px', right: '26px', size: 'w-4 h-4', zIndex: 'z-10' },
                            { bottom: '2px', right: '34px', size: 'w-4.5 h-4.5', zIndex: 'z-15' },
                            { bottom: '24px', right: '2px', size: 'w-4.5 h-4.5', zIndex: 'z-18' },
                            { bottom: '36px', right: '16px', size: 'w-3.5 h-3.5', zIndex: 'z-12' },
                          ];
                          const pos = irregularOffsets[lIdx % irregularOffsets.length];
                          return (
                            <div
                              key={`post-liker-${post.id}-${liker.id || lIdx}-${lIdx}`}
                              style={{ bottom: pos.bottom, right: pos.right }}
                              className={`absolute ${pos.zIndex}`}
                            >
                              <div className="relative">
                                <img
                                  src={liker.avatar}
                                  alt={liker.name}
                                  className={`${pos.size} rounded-full object-cover shrink-0 shadow-2xs ring-1 ring-white/90`}
                                />
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 text-white rounded-full flex items-center justify-center ring-1 ring-white shadow-2xs">
                                  <Heart size={6} className="fill-white stroke-none" />
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions & Reactions Row */}
                <div className="px-4">
                  {/* Action Bar Buttons */}
                  <div className="flex items-center justify-between pt-1 pb-2 border-b border-gray-100 text-gray-600">
                    <div className="flex items-center space-x-5">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center space-x-1 text-xs font-bold transition-all cursor-pointer ${
                          post.isLiked ? 'text-rose-500 scale-105' : 'hover:text-gray-900'
                        }`}
                      >
                        <Heart
                          size={18}
                          className={post.isLiked ? 'fill-rose-500 text-rose-500' : ''}
                        />
                        <span>{post.likes}</span>
                      </button>

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
                          <button
                            onClick={() => {
                              const inputEl = document.getElementById(`profile-comment-input-${post.id}`);
                              if (inputEl) inputEl.focus();
                            }}
                            className={`flex items-center space-x-1 text-xs font-bold transition-all cursor-pointer ${
                              hasUserCommented ? 'text-[#1877F2]' : 'hover:text-gray-900'
                            }`}
                          >
                            <MessageCircle
                              size={18}
                              className={hasUserCommented ? 'fill-[#1877F2] text-[#1877F2]' : ''}
                            />
                            <span>{post.comments.length}</span>
                          </button>
                        );
                      })()}

                      <button className="hover:text-gray-900 cursor-pointer">
                        <Share2 size={18} />
                      </button>
                    </div>

                    <button className="hover:text-gray-900 cursor-pointer">
                      <Bookmark size={18} />
                    </button>
                  </div>

                  {/* Likers Text Summary */}
                  <div className="py-2 text-[11px] font-bold text-[#65676B]">
                    由 <span className="text-[#050505]">Hui Zhang</span> 等{' '}
                    <span className="text-[#050505]">{post.likes} 人</span> 赞过
                  </div>

                  {/* Comments List (Plain text style, matching DiscoverView standard) */}
                  <div className="space-y-1.5 mt-1">
                    {post.comments.map((comm, cIdx) => (
                      <div key={`post-comm-${post.id}-${comm.id}-${cIdx}`} className="text-xs leading-snug flex items-start justify-between py-0.5 group">
                        <div className="flex items-start space-x-1.5 text-[#050505]">
                          <img
                            src={comm.userAvatar}
                            alt={comm.userName}
                            className="w-4.5 h-4.5 rounded-full object-cover shrink-0 ring-1 ring-gray-200 border border-white mt-0.5"
                          />
                          <div className="text-xs text-[#050505]">
                            <span className="font-bold text-[#050505] mr-1.5 hover:underline cursor-pointer">
                              {comm.userName}
                            </span>
                            <span className="text-[#1C1E21]">{comm.content}</span>
                          </div>
                        </div>
                        <span className="text-[9.5px] text-gray-400 shrink-0 ml-2 pt-0.5 font-normal">{comm.timestamp}</span>
                      </div>
                    ))}
                  </div>

                  {/* Inline Comment Input Box (Subtle dotted line border) */}
                  <div className="mt-3 flex items-center space-x-2 pt-2 border-t border-dotted border-[#E4E6EB] dark:border-zinc-700/60">
                    <input
                      id={`profile-comment-input-${post.id}`}
                      type="text"
                      placeholder="添加评论..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      className="flex-1 bg-gray-100 text-xs px-3 py-1.5 rounded-full outline-none text-[#050505] placeholder-gray-400"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="text-[#1877F2] font-bold text-xs px-2 cursor-pointer hover:opacity-80"
                    >
                      发布
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facebook "关于" Tab Content */}
      {activeTab === 'about' && (
        <div className="bg-white p-4 space-y-4">
          <h2 className="text-base font-extrabold text-[#050505]">关于</h2>

          {/* 个人简介 Card (全量移至关于页面最顶端) */}
          <div className="bg-[#F0F2F5]/70 p-4 rounded-2xl border border-[#E4E6EB] space-y-3 shadow-2xs">
            <h3 className="text-sm font-extrabold text-[#050505]">个人简介</h3>

            <div className="space-y-2.5 text-xs text-[#050505]">
              {/* 心情表情 & 状态 */}
              <div className="flex items-center space-x-3 text-[#65676B]">
                <Sparkles size={16} className="text-[#1877F2] shrink-0" />
                <span>心情表情: <strong className="text-[#050505]">{friend.mood || "🎵 正在优雅演奏钢琴中"}</strong></span>
              </div>

              {/* 实时定位 */}
              <div className="flex items-center space-x-3 text-[#65676B]">
                <MapPin size={16} className="text-[#1877F2] shrink-0" />
                <span>地图定位: <strong className="text-[#050505]">{friend.locationName || detail.currentCity || "河南省 郑州市"}</strong></span>
              </div>

              {/* 现居地 */}
              {detail.currentCity && (
                <div className="flex items-center space-x-3 text-[#65676B]">
                  <Home size={16} className="text-[#65676B] shrink-0" />
                  <span>现居地: <strong className="text-[#050505]">{detail.currentCity}</strong></span>
                </div>
              )}

              {/* 来自与 IP 属地 */}
              {detail.hometown && (
                <div className="flex items-center space-x-3 text-[#65676B]">
                  <Compass size={16} className="text-[#65676B] shrink-0" />
                  <span>来自 / IP属地: <strong className="text-[#050505]">{detail.hometown} (IP: {detail.hometown.split(' ')[0] || '河南省'})</strong></span>
                </div>
              )}

              {/* 教育 */}
              {detail.education && (
                <div className="flex items-center space-x-3 text-[#65676B]">
                  <GraduationCap size={16} className="text-[#65676B] shrink-0" />
                  <span>就读学校: <strong className="text-[#050505]">{detail.education}</strong> ({detail.educationYear})</span>
                </div>
              )}

              {/* 生日 */}
              {detail.birthday && (
                <div className="flex items-center space-x-3 text-[#65676B]">
                  <Calendar size={16} className="text-[#65676B] shrink-0" />
                  <span>生日日期: <strong className="text-[#050505]">{detail.birthday}</strong></span>
                </div>
              )}
            </div>

            {/* Tag Badges for personal details */}
            <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-gray-200/80 select-none">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100/60 shadow-2xs">
                ♀️ 性别: {detail.gender || '女性'}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/60 shadow-2xs">
                📍 IP属地: {detail.hometown?.split(' ')?.pop() || '郑州'}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100/60 shadow-2xs">
                🎓 学历: 本科硕士在读
              </span>
              {['钢琴演奏 🎹', '业余小说 📝', '健身达人 🏋️', '动漫迷 🌸', '爵士乐 🎵'].map((hobby, index) => {
                const colors = [
                  'bg-pink-50 text-pink-600 border-pink-100/60',
                  'bg-amber-50 text-amber-600 border-amber-100/60',
                  'bg-indigo-50 text-indigo-600 border-indigo-100/60',
                  'bg-purple-50 text-purple-600 border-purple-100/60',
                  'bg-sky-50 text-sky-600 border-sky-100/60',
                ];
                const colorClass = colors[index % colors.length];
                return (
                  <span key={`${hobby}-${index}`} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-2xs ${colorClass}`}>
                    ✨ {hobby}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 divide-y divide-gray-100 text-xs">
            {/* 个人简介与个性签名 */}
            <div className="pt-1 space-y-2">
              <h3 className="font-bold text-[#65676B] flex items-center space-x-1.5">
                <Sparkles size={16} className="text-amber-500" />
                <span>个人简介 & 个性签名</span>
              </h3>
              <div className="bg-[#F0F2F5] p-3.5 rounded-xl border border-[#E4E6EB] text-[#050505] leading-relaxed font-medium shadow-2xs">
                {detail.bio || '暂无个人简介'}
              </div>
            </div>

            <div className="pt-3 space-y-3">
              <h3 className="font-bold text-[#65676B]">工作与学历</h3>
              <div className="flex items-center space-x-3">
                <GraduationCap size={18} className="text-[#1877F2]" />
                <div>
                  <p className="font-bold text-[#050505]">{detail.education}</p>
                  <p className="text-[#65676B] text-[11px]">{detail.educationYear}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <h3 className="font-bold text-[#65676B]">居住过的地方</h3>
              <div className="flex items-center space-x-3">
                <Home size={18} className="text-[#1877F2]" />
                <div>
                  <p className="font-bold text-[#050505]">{detail.currentCity}</p>
                  <p className="text-[#65676B] text-[11px]">现居地</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-[#1877F2]" />
                <div>
                  <p className="font-bold text-[#050505]">{detail.hometown}</p>
                  <p className="text-[#65676B] text-[11px]">家乡</p>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <h3 className="font-bold text-[#65676B]">基本信息</h3>
              <div className="flex items-center space-x-3">
                <Calendar size={18} className="text-[#1877F2]" />
                <div>
                  <p className="font-bold text-[#050505]">{detail.birthday}</p>
                  <p className="text-[#65676B] text-[11px]">生日</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Poke Notification Toast */}
      {pokeToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#050505]/90 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 flex items-center space-x-1.5">
          <span>{pokeToast}</span>
        </div>
      )}
    </div>
  );
};
