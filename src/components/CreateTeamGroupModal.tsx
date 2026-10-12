import React, { useState, useRef } from 'react';
import {
  X,
  Users,
  Camera,
  Upload,
  Check,
  Search,
  Sparkles,
  MapPin,
  Clock,
  Shield,
  Tag,
  FileText,
  UserCheck,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';

export interface NewGroupData {
  id: string;
  name: string;
  subtitle: string;
  thumbnail: string;
  adminAvatar: string;
  adminName: string;
  attribute: string;
  city: string;
  memberComposition: string;
  timeLabel: string;
  members: string[];
  totalMembersCount: number;
  role: string;
  isPinned: boolean;
  category: 'Your Teams' | 'For You' | 'Discover';
}

interface FriendOption {
  id: string;
  name: string;
  avatar: string;
  roleTitle: string;
  city: string;
  status: 'online' | 'busy' | 'offline';
}

const PRESET_AVATARS = [
  {
    id: 'tech-1',
    label: '科技研发',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'design-1',
    label: '视觉美学',
    url: 'https://images.unsplash.com/photo-1542744094-24638ea0b343?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'growth-1',
    label: '商业增长',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'ai-1',
    label: 'AI 实验室',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'outdoor-1',
    label: '户外探险',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'music-1',
    label: '艺术音乐',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'study-1',
    label: '读书学术',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'social-1',
    label: '密友聚会',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=300',
  },
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
];

const CANDIDATE_FRIENDS: FriendOption[] = [
  {
    id: 'f_alex',
    name: 'Alex Mercer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    roleTitle: '架构师 / 资深研发',
    city: '北京市',
    status: 'online',
  },
  {
    id: 'f_sarah',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    roleTitle: 'UI/UX 视觉设计师',
    city: '深圳市',
    status: 'online',
  },
  {
    id: 'f_lucas',
    name: 'Lucas Zhao',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    roleTitle: '增长黑客 / 运营经理',
    city: '上海市',
    status: 'busy',
  },
  {
    id: 'f_mia',
    name: 'Mia Wang',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    roleTitle: 'AI 算法研究员',
    city: '杭州市',
    status: 'online',
  },
  {
    id: 'f_david',
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    roleTitle: '全栈工程师',
    city: '北京市',
    status: 'offline',
  },
  {
    id: 'f_elena',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    roleTitle: '产品策略顾问',
    city: '成都市',
    status: 'online',
  },
  {
    id: 'f_victor',
    name: 'Victor Vance',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    roleTitle: '数据科学家',
    city: '广州市',
    status: 'busy',
  },
];

const ATTRIBUTE_SUGGESTIONS = [
  '核心架构与研发',
  'UI设计与视觉美学',
  '商业增长与数据黑客',
  '人工智能与大模型',
  '前沿产品与体验',
  '同城生活与活动',
  '读书学术研讨',
];

const CITIES = ['北京市', '上海市', '深圳市', '杭州市', '广州市', '成都市', '武汉市', '兰州市'];

interface CreateTeamGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTeam: (newTeam: NewGroupData) => void;
  showToast: (msg: string) => void;
}

export const CreateTeamGroupModal: React.FC<CreateTeamGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateTeam,
  showToast,
}) => {
  const [currentStep, setCurrentStep] = useState<'info' | 'avatar' | 'members'>('info');

  // Form Fields
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0]);
  const [attribute, setAttribute] = useState(ATTRIBUTE_SUGGESTIONS[0]);
  const [city, setCity] = useState('北京市');
  const [timeLabel, setTimeLabel] = useState('周一至周五 09:00 - 18:00');
  const [permission, setPermission] = useState<'public' | 'private'>('public');

  // Member selection
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([
    'f_alex',
    'f_sarah',
  ]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRoles, setMemberRoles] = useState<{ [id: string]: string }>({
    f_alex: '架构师',
    f_sarah: 'UI设计总监',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedAvatar(event.target.result as string);
          showToast('已成功上传并设为小组自定义头像 📷');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSelectMember = (friendId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const handleSelectAllMembers = () => {
    if (selectedMemberIds.length === CANDIDATE_FRIENDS.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(CANDIDATE_FRIENDS.map((f) => f.id));
    }
  };

  const handleSubmitCreation = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast('⚠️ 请输入小组名称');
      setCurrentStep('info');
      return;
    }

    const selectedFriends = CANDIDATE_FRIENDS.filter((f) => selectedMemberIds.includes(f.id));
    const memberAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', // Me
      ...selectedFriends.map((f) => f.avatar),
    ];

    const totalCount = selectedFriends.length + 1; // Me + invited
    const composition =
      totalCount <= 2
        ? `发起人 (1) + 组员 (${selectedFriends.length})`
        : `组长 (1) + 核心协作 (${Math.max(1, Math.floor(selectedFriends.length / 2))}) + 组员 (${Math.max(1, Math.ceil(selectedFriends.length / 2))})`;

    const newTeam: NewGroupData = {
      id: `team-${Date.now()}`,
      name: trimmedName,
      subtitle: subtitle.trim() || '携手并进，共创高价值创意与协作成果',
      thumbnail: selectedCover,
      adminAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      adminName: '我 (Alexia)',
      attribute: attribute || '核心协作工会',
      city: city || '北京市',
      memberComposition: composition,
      timeLabel: timeLabel || '随时在线沟通',
      members: memberAvatars,
      totalMembersCount: totalCount,
      role: 'Admin',
      isPinned: true,
      category: 'Your Teams',
    };

    onCreateTeam(newTeam);
    showToast(`🎉 小组【${trimmedName}】创建成功，已直接为您开启小组操作工作台！`);
    onClose();
  };

  const filteredFriends = CANDIDATE_FRIENDS.filter((f) => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.roleTitle.toLowerCase().includes(q) ||
      f.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-md border border-[#E4E6EB] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] text-[#050505]">
        {/* 1. Header (Facebook Straight-Edge UI Header) */}
        <div className="px-5 py-3.5 bg-white border-b border-[#E4E6EB] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-[#1877F2] text-white flex items-center justify-center font-bold shadow-2xs">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#050505] tracking-tight">
                创建与配置新小组
              </h2>
              <p className="text-[10px] text-[#65676B] font-medium">
                从头像选择、基本信息到组员邀请，一站式完成小组工作台初始化
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-[#65676B] hover:text-[#050505] transition-colors cursor-pointer"
            title="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Step Progress Bar - Hidden during group registration per design requirement */}

        {/* 3. Main Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* STEP 1: Basic Information */}
          {currentStep === 'info' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Group Name Input */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold text-[#050505]">
                  <span className="flex items-center space-x-1">
                    <span className="text-rose-500">*</span>
                    <span>小组名称</span>
                  </span>
                  <span className="text-[10px] text-[#8A8D91] font-normal">
                    {name.length}/25 字
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={25}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：AI 前沿工程实验室 / 设计系统视觉工会..."
                  className="w-full px-3.5 py-2.5 bg-white rounded-md border border-[#E4E6EB] focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 outline-none text-xs font-bold text-[#050505] transition-all"
                  autoFocus
                />
              </div>

              {/* Subtitle / Purpose */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#050505]">
                  小组定位与简介
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="描述小组的核心使命、协作目标或日常交流内容..."
                  className="w-full px-3.5 py-2 bg-white rounded-md border border-[#E4E6EB] focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 outline-none text-xs font-medium text-[#050505] transition-all resize-none"
                />
              </div>

              {/* Attribute Tags */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#050505]">
                  小组属性标签
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ATTRIBUTE_SUGGESTIONS.map((tag, tIdx) => (
                    <button
                      key={`attr-${tag}-${tIdx}`}
                      type="button"
                      onClick={() => setAttribute(tag)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                        attribute === tag
                          ? 'bg-[#1877F2] border-[#1877F2] text-white shadow-2xs'
                          : 'bg-white border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2]/60 hover:text-[#1877F2]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* City & Time Label Row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-1 text-xs font-bold text-[#050505]">
                    <MapPin size={13} className="text-[#1877F2]" />
                    <span>归属城市</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-md border border-[#E4E6EB] focus:border-[#1877F2] outline-none text-xs font-bold text-[#050505]"
                  >
                    {CITIES.map((c, cIdx) => (
                      <option key={`city-${c}-${cIdx}`} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center space-x-1 text-xs font-bold text-[#050505]">
                    <Clock size={13} className="text-amber-500" />
                    <span>交流频次 / 时间</span>
                  </label>
                  <input
                    type="text"
                    value={timeLabel}
                    onChange={(e) => setTimeLabel(e.target.value)}
                    placeholder="例如：工作日 09:00-18:00"
                    className="w-full px-3 py-2 bg-white rounded-md border border-[#E4E6EB] focus:border-[#1877F2] outline-none text-xs font-medium text-[#050505]"
                  />
                </div>
              </div>

              {/* Permission & Privacy */}
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center space-x-1 text-xs font-bold text-[#050505]">
                  <Shield size={13} className="text-emerald-500" />
                  <span>访问与加入权限</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setPermission('public')}
                    className={`p-2.5 rounded-md border cursor-pointer transition-all flex items-center space-x-2.5 ${
                      permission === 'public'
                        ? 'border-[#1877F2] bg-blue-50/50'
                        : 'border-[#E4E6EB] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        permission === 'public'
                          ? 'border-[#1877F2] bg-[#1877F2] text-white'
                          : 'border-[#CED0D5]'
                      }`}
                    >
                      {permission === 'public' && <Check size={10} className="stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#050505]">公开小组</p>
                      <p className="text-[10px] text-[#65676B]">所有成员均可探索并查看</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setPermission('private')}
                    className={`p-2.5 rounded-md border cursor-pointer transition-all flex items-center space-x-2.5 ${
                      permission === 'private'
                        ? 'border-[#1877F2] bg-blue-50/50'
                        : 'border-[#E4E6EB] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        permission === 'private'
                          ? 'border-[#1877F2] bg-[#1877F2] text-white'
                          : 'border-[#CED0D5]'
                      }`}
                    >
                      {permission === 'private' && <Check size={10} className="stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#050505]">私密协作组</p>
                      <p className="text-[10px] text-[#65676B]">仅限受邀组员进入</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Avatar & Cover Selection */}
          {currentStep === 'avatar' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Live Preview Card */}
              <div className="p-3 bg-[#F0F2F5] rounded-md border border-[#E4E6EB] space-y-2">
                <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wider">
                  实时卡片展示效果预览
                </p>
                <div className="bg-white rounded-md border border-[#E4E6EB] overflow-hidden shadow-xs flex flex-col">
                  <div className="relative h-28 w-full">
                    <img
                      src={selectedCover}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={selectedAvatar}
                          alt="Avatar"
                          className="w-10 h-10 rounded-md border-2 border-white object-cover shadow-md"
                        />
                        <div className="text-white">
                          <h4 className="text-xs font-extrabold drop-shadow">
                            {name || '未命名新小组'}
                          </h4>
                          <span className="text-[9px] bg-white/30 backdrop-blur-xs px-1.5 py-0.2 rounded font-bold">
                            {attribute}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] text-white/90 font-medium">{city}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Avatar Selection */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#050505]">
                    精选小组头像
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-[#1877F2] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Upload size={12} />
                    <span>上传本地自定义头像</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleCustomAvatarUpload}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_AVATARS.map((item) => {
                    const isSelected = selectedAvatar === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedAvatar(item.url)}
                        className={`p-1.5 rounded-md border text-center cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#1877F2] bg-blue-50/60 ring-2 ring-[#1877F2]/30'
                            : 'border-[#E4E6EB] bg-white hover:border-[#1877F2]/50'
                        }`}
                      >
                        <div className="relative w-full aspect-square rounded-md overflow-hidden mb-1">
                          <img
                            src={item.url}
                            alt={item.label}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-[#1877F2] text-white rounded-full flex items-center justify-center shadow-xs">
                              <Check size={10} className="stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-[#050505] truncate block">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cover Selection */}
              <div className="space-y-2 pt-2 border-t border-[#E4E6EB]">
                <label className="block text-xs font-bold text-[#050505]">
                  小组封面背景 (Cover Banner)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_COVERS.map((coverUrl, idx) => {
                    const isSelected = selectedCover === coverUrl;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedCover(coverUrl)}
                        className={`h-16 rounded-md border overflow-hidden relative cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#1877F2] ring-2 ring-[#1877F2]/40'
                            : 'border-[#E4E6EB] opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={coverUrl}
                          alt="cover"
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#1877F2] text-white rounded-full flex items-center justify-center shadow-xs">
                            <Check size={10} className="stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Invite Members */}
          {currentStep === 'members' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Member Search & Action Row */}
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative flex items-center">
                  <Search size={14} className="absolute left-3 text-[#8A8D91]" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="搜索好友姓名、专业或所在城市..."
                    className="w-full pl-8 pr-3 py-2 bg-white rounded-md border border-[#E4E6EB] focus:border-[#1877F2] outline-none text-xs font-medium text-[#050505]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllMembers}
                  className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] text-xs font-bold rounded-md transition-colors cursor-pointer shrink-0"
                >
                  {selectedMemberIds.length === CANDIDATE_FRIENDS.length ? '取消全选' : '一键全选'}
                </button>
              </div>

              {/* Members Selection List (Compact view with small avatar icons showing more members) */}
              <div className="space-y-1.5 border border-[#E4E6EB] rounded-md p-1.5 bg-[#FAFAFA] max-h-[380px] overflow-y-auto">
                {/* Admin Self Item */}
                <div className="p-1.5 px-2 bg-blue-50/70 border border-blue-200/80 rounded-md flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                      alt="Me"
                      className="w-6.5 h-6.5 rounded-full object-cover ring-2 ring-[#1877F2] shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-extrabold text-[#050505]">我 (Alexia)</span>
                        <span className="text-[9px] bg-[#1877F2] text-white px-1.5 py-0.2 rounded font-bold">
                          小组长 (Owner)
                        </span>
                      </div>
                      <p className="text-[10px] text-[#65676B]">创建者 · 拥有最高协作与管理权限</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-md bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                    <Check size={10} className="stroke-[3]" />
                  </div>
                </div>

                {/* Candidate Friends */}
                {filteredFriends.map((friend) => {
                  const isSelected = selectedMemberIds.includes(friend.id);
                  return (
                    <div
                      key={friend.id}
                      onClick={() => toggleSelectMember(friend.id)}
                      className={`p-1.5 px-2 rounded-md border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-white border-[#1877F2] shadow-2xs'
                          : 'bg-white border-[#E4E6EB] hover:bg-[#F0F2F5]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-6.5 h-6.5 rounded-full object-cover"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1.5 ring-white ${
                              friend.status === 'online'
                                ? 'bg-emerald-500'
                                : friend.status === 'busy'
                                ? 'bg-amber-500'
                                : 'bg-gray-400'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-[#050505] truncate">
                              {friend.name}
                            </span>
                            <span className="text-[9px] text-[#8A8D91] truncate font-medium">
                              · {friend.city}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#65676B] truncate font-medium">
                            {friend.roleTitle}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-[#1877F2] border-[#1877F2] text-white'
                            : 'border-[#CED0D5] bg-white'
                        }`}
                      >
                        {isSelected && <Check size={10} className="stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Summary Pill */}
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-md flex items-center justify-between text-xs font-bold text-[#1877F2]">
                <div className="flex items-center space-x-2">
                  <UserCheck size={16} />
                  <span>
                    当前已包含 {selectedMemberIds.length + 1} 位成员（组长 1 + 邀请 {selectedMemberIds.length}）
                  </span>
                </div>
                <span className="text-[10px] text-[#65676B] font-medium">
                  创建后可在小组设置中随时增删或转让
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Footer Actions (Facebook Blue Buttons) */}
        <div className="px-5 py-3.5 bg-[#F0F2F5] border-t border-[#E4E6EB] flex items-center justify-between shrink-0">
          <div>
            {currentStep !== 'info' ? (
              <button
                type="button"
                onClick={() =>
                  setCurrentStep(currentStep === 'members' ? 'avatar' : 'info')
                }
                className="px-4 py-2 rounded-md text-xs font-bold text-[#65676B] hover:bg-[#E4E6EB] transition-colors cursor-pointer"
              >
                上一步
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-xs font-bold text-[#65676B] hover:bg-[#E4E6EB] transition-colors cursor-pointer"
              >
                取消
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            {currentStep !== 'members' ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 'info' && !name.trim()) {
                    showToast('⚠️ 请先输入小组名称');
                    return;
                  }
                  setCurrentStep(currentStep === 'info' ? 'avatar' : 'members');
                }}
                className="px-5 py-2 rounded-md text-xs font-bold bg-[#1877F2] hover:bg-[#166FE5] text-white shadow-2xs transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>下一步</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitCreation}
                className="px-5 py-2 rounded-md text-xs font-extrabold bg-[#1877F2] hover:bg-[#166FE5] text-white shadow-sm transition-all cursor-pointer flex items-center space-x-1.5 active:scale-98"
              >
                <Sparkles size={14} />
                <span>立即创建并进入小组操作页面</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
