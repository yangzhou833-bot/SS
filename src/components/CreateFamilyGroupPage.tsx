import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  MoreHorizontal,
  Search,
  Link2,
  Users,
  ChevronRight,
  Plus,
  Check,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Smile,
} from 'lucide-react';
import { FamilyGroupData } from './FamilyGroupModal';

export interface FamilyMemberCard {
  id: string;
  name: string;
  avatar: string;
  bgColor?: string;
  rotation?: string;
  location?: string;
  status?: string;
}

interface CreateFamilyGroupPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  onSaveFamilyGroup?: (data: FamilyGroupData) => void;
}

// 预设槽位位置和微旋转角度 (营造错落有致的卡片布局)
const SLOT_POSITIONS = [
  { className: 'left-2 top-2', rotation: '-rotate-3' },
  { className: 'left-[112px] top-0', rotation: 'rotate-2' },
  { className: 'right-3 top-2', rotation: 'rotate-3' },
  { className: 'left-14 bottom-1', rotation: '-rotate-4' },
  { className: 'right-12 bottom-0', rotation: 'rotate-3' },
];

export const CreateFamilyGroupPage: React.FC<CreateFamilyGroupPageProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSaveFamilyGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [justAddedMemberId, setJustAddedMemberId] = useState<string | null>(null);
  const [isSlotContainerPulsing, setIsSlotContainerPulsing] = useState(false);

  // 控制上半部分“家庭守护计划”的显示与淡出折叠
  const [isHeroPlanCollapsed, setIsHeroPlanCollapsed] = useState(false);
  const touchStartYRef = useRef<number | null>(null);

  // 现有家庭小组成员（显示好友名与头像卡片）
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberCard[]>([
    {
      id: 'm1',
      name: '陈建国',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      bgColor: 'bg-amber-400',
      rotation: '-rotate-3',
      location: '朝阳公园 · 在家',
      status: '🟢 在线',
    },
    {
      id: 'm2',
      name: '王叔叔',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      bgColor: 'bg-orange-500',
      rotation: 'rotate-2',
      location: '国贸中心 · 停留 1h',
      status: '📍 停留',
    },
    {
      id: 'm3',
      name: '林浩 (兄弟)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      bgColor: 'bg-emerald-100',
      rotation: 'rotate-3',
      location: '学院路 · 移动中',
      status: '🚗 45km/h',
    },
    {
      id: 'm4',
      name: '张伟',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      bgColor: 'bg-blue-100',
      rotation: '-rotate-4',
      location: '西单大悦城 · 附近',
      status: '⚡ 活跃',
    },
  ]);

  const [showPayUpgradeModal, setShowPayUpgradeModal] = useState(false);
  const [showGeneratedBadgeModal, setShowGeneratedBadgeModal] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState('Stellar 幸福家庭组');

  // 通讯录好友列表
  const contacts = [
    {
      id: 'c1',
      name: '张伟',
      relation: '来自通讯录',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      phone: '138****8899',
    },
    {
      id: 'c2',
      name: '李娜',
      relation: '来自通讯录',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      phone: '139****1234',
    },
    {
      id: 'c3',
      name: '王芳',
      relation: '来自通讯录',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      phone: '137****5678',
    },
    {
      id: 'c4',
      name: '周晓明',
      relation: '来自通讯录',
      avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=150',
      phone: '136****9988',
    },
  ];

  const filteredContacts = contacts.filter((c) =>
    (c?.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c?.phone && c.phone.includes(searchQuery))
  );

  // 添加好友到家庭小组成员卡片，并保留一个增加图标
  const handleAddMember = (name: string, avatar: string) => {
    if (familyMembers.length >= 4) {
      setShowPayUpgradeModal(true);
      if (onSuccess) {
        onSuccess(`当前 4 个免费名额已满，可升级尊享计划付费添加更多成员`);
      }
      return;
    }
    const newId = `m-${Date.now()}`;
    const newMember: FamilyMemberCard = {
      id: newId,
      name,
      avatar,
      bgColor: 'bg-indigo-300',
      rotation: familyMembers.length % 2 === 0 ? '-rotate-3' : 'rotate-3',
      location: '刚刚加入',
      status: '🟢 在线',
    };

    // 触发槽位容器与新卡片的入场动效反馈
    setJustAddedMemberId(newId);
    setIsSlotContainerPulsing(true);
    setTimeout(() => setJustAddedMemberId(null), 1200);
    setTimeout(() => setIsSlotContainerPulsing(false), 500);

    setFamilyMembers((prev) => [...prev, newMember]);
    if (onSuccess) {
      onSuccess(`已将 ${name} 添加至家庭小组`);
    }
  };

  const handleInvite = (contact: { id: string; name: string; avatar: string }) => {
    if (familyMembers.length >= 4) {
      setShowPayUpgradeModal(true);
      if (onSuccess) {
        onSuccess(`当前 4 个免费名额已满，可升级尊享计划付费添加更多成员`);
      }
      return;
    }
    setInvitedMap((prev) => ({
      ...prev,
      [contact.id]: true,
    }));
    // 新加入的人直接显示卡片，并一直保留一个增加图标
    handleAddMember(contact.name, contact.avatar);
    if (onSuccess) {
      onSuccess(`已向 ${contact.name} 发送家庭守护邀请短信`);
    }
  };

  const handleCopyLink = () => {
    const inviteUrl = 'https://stellar.app/family/join?token=st_fam_883921';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
    }
    setCopiedLink(true);
    if (onSuccess) {
      onSuccess('家庭邀请专属链接已复制到剪贴板 🔗');
    }
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 点击确认按钮生成图标头像
  const handleConfirmAndGenerateBadge = () => {
    setShowGeneratedBadgeModal(true);
  };

  // 保存并应用生成的家庭图标与计划
  const handleSaveAndActivateGroup = () => {
    setShowGeneratedBadgeModal(false);
    if (onSaveFamilyGroup) {
      onSaveFamilyGroup({
        isSet: true,
        name: groupNameInput,
        avatarUrl: familyMembers[0]?.avatar || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=200',
        members: familyMembers.map((m) => ({
          id: m.id,
          name: m.name,
          relation: '家人',
          avatar: m.avatar,
        })),
      });
    }
    if (onSuccess) {
      onSuccess('🎉 家庭专属图标已成功生成！已为您开启全天候实时守护。');
    }
    onClose();
  };

  // 手势监听：用户在页面向上滑动时收起上半部分
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStartYRef.current - currentY;
    if (diff > 25 && !isHeroPlanCollapsed) {
      setIsHeroPlanCollapsed(true);
      touchStartYRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 15 && !isHeroPlanCollapsed) {
      setIsHeroPlanCollapsed(true);
    }
  };

  if (!isOpen) return null;

  // 最多可容纳 4 位被邀请成员 + 1 个添加卡片槽位
  const remainingSlots = 4 - familyMembers.length;

  return (
    <div
      id="create-family-group-page"
      className="absolute inset-0 z-[920] bg-[#FFFFFF] flex flex-col overflow-hidden select-none animate-in fade-in slide-in-from-right-4 duration-200"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onWheel={handleWheel}
    >
      {/* ================================================================= */}
      {/* 1. 顶部导航栏 (位置同轨，高度对齐标准 h-14 导航栏) */}
      {/* ================================================================= */}
      <div className="h-14 px-3.5 bg-white flex items-center justify-between border-b border-[#E4E6EB]/80 shrink-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <button
          onClick={onClose}
          className="flex items-center space-x-1.5 py-1 px-2 -ml-1 rounded-xl text-[#050505] hover:bg-[#F0F2F5] active:bg-[#E4E6EB] transition-colors cursor-pointer"
          title="返回"
        >
          <ArrowLeft size={22} className="stroke-[2.2] text-[#050505]" />
          <span className="text-[17px] font-semibold tracking-tight text-[#050505]">返回</span>
        </button>

        <div className="flex items-center space-x-1">
          {/* 折叠后可快速展开上半部分的提示胶囊 */}
          {isHeroPlanCollapsed && (
            <button
              onClick={() => setIsHeroPlanCollapsed(false)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#F0F2F5] hover:bg-blue-50 text-[11.5px] font-bold text-[#1877F2] transition-all cursor-pointer mr-1"
            >
              <ChevronDown size={13} className="stroke-[2.5]" />
              <span>守护计划</span>
            </button>
          )}

          <button
            onClick={() => {
              if (onSuccess) onSuccess('正在打开家庭小组更多设置...');
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#050505] hover:bg-[#F0F2F5] active:bg-[#E4E6EB] transition-colors cursor-pointer"
            title="更多操作"
          >
            <MoreHorizontal size={20} className="stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* 滚动内容区 */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar pb-8 transition-all"
        onScroll={(e) => {
          if (e.currentTarget.scrollTop > 30 && !isHeroPlanCollapsed) {
            setIsHeroPlanCollapsed(true);
          }
        }}
      >
        {/* ================================================================= */}
        {/* ★ 上半部分：家庭守护计划 (中文温暖主题 + 长方形地图模拟) */}
        {/* 点击加号或上滑后淡化消失，无缝展示下方的核心操作界面 */}
        {/* ================================================================= */}
        <div
          className={`transition-all duration-300 ease-out overflow-hidden ${
            isHeroPlanCollapsed
              ? 'max-h-0 opacity-0 -translate-y-6 pointer-events-none'
              : 'max-h-[380px] opacity-100 translate-y-0'
          }`}
        >
          <div className="pt-3 px-5 pb-2 text-center flex flex-col items-center">
            {/* 中文主题与温暖文案 */}
            <div className="flex items-center space-x-1.5 justify-center">
              <ShieldCheck size={22} className="text-[#1877F2] shrink-0" />
              <h2 className="text-[23px] font-black text-[#050505] tracking-tight">
                家庭守护计划
              </h2>
            </div>
            <p className="text-[12.5px] text-[#65676B] max-w-[310px] leading-relaxed mt-1 font-normal mx-auto">
              每一份牵挂都有温度，每一次奔赴皆有守护。包含 5 个 Stellar 尊享账户，跨越距离实时守护挚爱家人的每一刻平安与健康。
            </p>

            {/* 模拟长方形地图 (Rectangular Map Interface) */}
            <div
              onClick={() => {
                setIsHeroPlanCollapsed(true);
                if (onSuccess) onSuccess('正在展开家庭成员管理...');
              }}
              className="relative w-full max-w-[335px] h-[160px] mt-2.5 rounded-2xl bg-[#E8F0FE]/90 border border-[#D2E3FC] shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group"
              title="点击切换到详细操作界面"
            >
              {/* 地图道路与网格背景纹理 */}
              <div className="absolute inset-0 bg-[#E8F0FE] opacity-90">
                {/* 城市绿地与公园色块 */}
                <div className="absolute top-2 left-3 w-28 h-16 rounded-xl bg-[#CEEAD6]/70 border border-[#A8DAB5]/60" />
                <div className="absolute bottom-2 right-4 w-32 h-14 rounded-xl bg-[#CEEAD6]/60 border border-[#A8DAB5]/50" />
                
                {/* 模拟河流或水系 */}
                <div className="absolute -top-4 right-16 w-12 h-44 bg-[#C2E7FF]/70 rotate-25 rounded-full blur-[0.5px]" />

                {/* 道路网格线条 */}
                <div className="absolute top-8 left-0 right-0 h-[3px] bg-white shadow-xs" />
                <div className="absolute top-20 left-0 right-0 h-[4px] bg-[#FEEFC3] border-y border-[#FDD663] shadow-xs" />
                <div className="absolute top-0 bottom-0 left-24 w-[3px] bg-white shadow-xs" />
                <div className="absolute top-0 bottom-0 right-28 w-[3px] bg-white shadow-xs" />
                <div className="absolute top-28 left-0 right-0 h-[2px] bg-white/90" />

                {/* 守护安全范围圈 (虚线光晕) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-28 rounded-full border-2 border-dashed border-[#1877F2]/40 bg-blue-500/5 animate-pulse" />
              </div>

              {/* 地图右上角状态标识 */}
              <div className="absolute top-2 right-2.5 z-10 flex items-center space-x-1 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-blue-200/80 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-bold text-[#1877F2]">实时守护中</span>
              </div>

              {/* 地图上的家人头像标记点 */}
              {/* 标记点 1 (左上) */}
              <div className="absolute left-6 top-5 z-10 flex flex-col items-center group-hover:scale-105 transition-transform">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full ring-2 ring-white shadow-md overflow-hidden bg-amber-400">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
                      alt="陈建国"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 ring-1 ring-white rounded-full" />
                </div>
                <span className="bg-white/95 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-[#050505] shadow-xs mt-0.5">
                  陈建国 · 在家
                </span>
              </div>

              {/* 标记点 2 (右上) */}
              <div className="absolute right-7 top-7 z-10 flex flex-col items-center group-hover:scale-105 transition-transform">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full ring-2 ring-white shadow-md overflow-hidden bg-orange-500">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                      alt="王叔叔"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 ring-1 ring-white rounded-full" />
                </div>
                <span className="bg-white/95 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-[#050505] shadow-xs mt-0.5">
                  王叔叔 · 停留
                </span>
              </div>

              {/* 标记点 3 (左下) */}
              <div className="absolute left-16 bottom-3 z-10 flex flex-col items-center group-hover:scale-105 transition-transform">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full ring-2 ring-white shadow-md overflow-hidden bg-emerald-100">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                      alt="林浩"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 ring-1 ring-white rounded-full" />
                </div>
                <span className="bg-white/95 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-[#050505] shadow-xs mt-0.5">
                  林浩 · 移动中
                </span>
              </div>

              {/* 中间核心加号互动 Pin (点击立即淡化收起并进入配置) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHeroPlanCollapsed(true);
                    if (onSuccess) onSuccess('已进入家庭成员配置界面');
                  }}
                  className="w-9 h-9 rounded-full bg-white text-[#1877F2] ring-3 ring-blue-400/80 shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center transition-all cursor-pointer group"
                >
                  <Plus size={20} className="stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>

              {/* 底部上滑微提示 */}
              <div className="absolute bottom-1 right-2.5 z-10 text-[9px] font-semibold text-[#1877F2] flex items-center space-x-0.5">
                <span>点击或上滑配置</span>
                <ChevronDown size={11} className="stroke-[2.5]" />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E4E6EB] to-transparent my-1" />
        </div>

        {/* ================================================================= */}
        {/* 2. 现有操作界面：头部信息区 (文案去除“免费”二字，紧凑排版) */}
        {/* ================================================================= */}
        <div className="pt-3 px-5 pb-1">
          <h1 className="text-[24px] font-extrabold text-[#050505] tracking-tight leading-snug">
            Stellar 家庭小组
          </h1>
          <p className="text-[13.5px] text-[#65676B] leading-relaxed mt-1 font-normal">
            邀请最多 4 位家庭成员加入高级账户，实时共享位置与安全提醒。当前剩余 {Math.max(0, remainingSlots)} 个名额。
          </p>
        </div>

        {/* ================================================================= */}
        {/* 3. 角色占位网格 (一直保留一个增加图标，新加入的人直接显示卡片，显示好友名) */}
        {/* ================================================================= */}
        <div className="relative w-full pt-3 pb-2 px-4 flex items-center justify-center min-h-[220px]">
          {/* 装饰性柔光底色 */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/25 via-transparent to-transparent pointer-events-none" />

          {/* 错落卡片散开布局：带平滑缩放反馈与轻微弹性动画 */}
          <div
            className={`relative w-full max-w-[340px] h-[215px] mx-auto transition-transform duration-300 ease-out ${
              isSlotContainerPulsing ? 'scale-[1.04]' : 'scale-100'
            }`}
          >
            {/* 已加入成员卡片：显示真实头像与好友名 */}
            {familyMembers.map((member, index) => {
              const pos = SLOT_POSITIONS[index] || SLOT_POSITIONS[0];
              const isJustAdded = member.id === justAddedMemberId;
              return (
                <div
                  key={member.id}
                  className={`absolute ${pos.className} flex flex-col items-center group transition-all duration-300 ease-out ${
                    isJustAdded ? 'animate-in zoom-in-75 fade-in duration-300' : 'active:scale-95'
                  }`}
                >
                  <div
                    className={`w-[66px] h-[78px] rounded-[22px] p-0.5 shadow-md group-hover:shadow-xl transition-all duration-300 overflow-hidden ${pos.rotation} ${
                      member.bgColor || 'bg-amber-400'
                    } ring-2 ring-white/90 ${isJustAdded ? 'ring-4 ring-[#1877F2] shadow-blue-500/30' : ''}`}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-[20px]"
                    />
                  </div>
                  {/* 下方显示好友名 */}
                  <span className="text-[12px] font-bold text-[#050505] mt-1.5 truncate max-w-[72px] text-center">
                    {member.name}
                  </span>
                </div>
              );
            })}

            {/* 一直保留一个增加图标 (+号卡片)：4个免费名额满时点击触发付费添加提醒 */}
            <div
              onClick={() => {
                if (familyMembers.length >= 4) {
                  setShowPayUpgradeModal(true);
                  if (onSuccess) {
                    onSuccess('当前 4 个名额已满，可开通尊享计划付费添加');
                  }
                  return;
                }
                // 点击加号快速从通讯录添加下一位好友
                const uninvited = contacts.find((c) => !familyMembers.some((m) => m?.name && c?.name && m.name.includes(c.name)));
                if (uninvited) {
                  handleInvite(uninvited);
                } else {
                  handleAddMember(`家庭成员 ${familyMembers.length + 1}`, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250');
                }
              }}
              className={`absolute ${SLOT_POSITIONS[Math.min(familyMembers.length, 4)]?.className || 'right-12 bottom-0'} flex flex-col items-center cursor-pointer group transition-all duration-200 hover:scale-105 active:scale-90`}
              title={familyMembers.length >= 4 ? '名额已满，点击付费添加成员' : '点击添加家庭成员'}
            >
              {/* 增加图标卡片：只显示加号，无文字，支持动态变色与边框 */}
              <div
                className={`w-[66px] h-[78px] rounded-[22px] shadow-xs group-hover:shadow-md transition-all duration-200 flex items-center justify-center bg-white ${
                  familyMembers.length >= 4
                    ? 'border-2 border-dashed border-[#1877F2] text-[#1877F2]'
                    : 'border-2 border-[#F97316] text-[#F97316]'
                } ${SLOT_POSITIONS[Math.min(familyMembers.length, 4)]?.rotation || 'rotate-3'}`}
              >
                <Plus size={28} className="stroke-[2.8] group-hover:rotate-90 transition-transform duration-300" />
              </div>
              {/* 槽位下方提示 */}
              <span className={`text-[12px] font-semibold mt-1.5 transition-colors ${
                familyMembers.length >= 4
                  ? 'text-[#1877F2] group-hover:underline'
                  : 'text-[#65676B] group-hover:text-[#F97316]'
              }`}>
                {familyMembers.length >= 4 ? '付费添加' : '添加成员'}
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ★ 增加确认按钮 (点击后生成图标头像) */}
        {/* ================================================================= */}
        <div className="px-5 pt-2 pb-3 flex justify-center">
          <button
            type="button"
            onClick={handleConfirmAndGenerateBadge}
            className="w-full max-w-[325px] py-2.5 px-4 rounded-full bg-gradient-to-r from-[#1877F2] to-[#0866FF] hover:from-[#166FE5] hover:to-[#005CE6] text-white font-bold text-[14px] shadow-md shadow-blue-500/25 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Sparkles size={17} className="stroke-[2.2] animate-pulse" />
            <span>确认家庭成员并生成守护图标</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* 4. 添加与搜索区 (左标题说明 + 右圆角药丸搜索框) */}
        {/* ================================================================= */}
        <div className="pt-3 px-5 pb-3">
          <div className="flex items-center justify-between gap-3">
            {/* 左侧说明 */}
            <div className="flex-1">
              <h2 className="text-[18px] font-bold text-[#050505] tracking-tight">
                添加成员
              </h2>
              <p className="text-[12.5px] text-[#65676B] mt-0.5">
                成员接受邀请后，您将收到通知。
              </p>
            </div>

            {/* 右侧圆角药丸搜索框 */}
            <div className="relative shrink-0 w-[140px]">
              <div className="p-0.5 rounded-full bg-gradient-to-r from-blue-300 via-pink-200 to-amber-200 shadow-2xs">
                <div className="flex items-center bg-white/95 backdrop-blur-md rounded-full px-2.5 py-1.5">
                  <Search size={14} className="text-[#1877F2] mr-1.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索成员"
                    className="w-full bg-transparent text-[12px] text-[#050505] placeholder-[#65676B] outline-none font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 5. 邀请列表区 (链接邀请项 + 通讯录邀请项) */}
        {/* ================================================================= */}
        <div className="px-3.5 space-y-1 divide-y divide-[#E4E6EB]/50 border-t border-[#E4E6EB]/60 pt-2">
          {/* 列表项 1：通过链接邀请 */}
          <div
            onClick={handleCopyLink}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F0F2F5] active:bg-[#E4E6EB]/70 transition-colors cursor-pointer group select-none"
          >
            <div className="flex items-center space-x-3.5">
              {/* 左侧链接圆形图标 */}
              <div className="w-11 h-11 rounded-full bg-[#F0F2F5] group-hover:bg-blue-50 text-[#050505] group-hover:text-[#1877F2] flex items-center justify-center transition-colors shrink-0">
                <Link2 size={20} className="stroke-[2.2]" />
              </div>

              {/* 标题与副标题 */}
              <div>
                <h4 className="text-[15px] font-bold text-[#050505] group-hover:text-[#1877F2] transition-colors leading-snug">
                  通过链接邀请
                </h4>
                <p className="text-[12.5px] text-[#65676B] leading-tight mt-0.5">
                  发送链接邀请成员加入家庭小组
                </p>
              </div>
            </div>

            {/* 右侧跳转箭头 / 复制状态 */}
            <div className="flex items-center space-x-1 shrink-0 text-[#65676B] group-hover:text-[#1877F2]">
              {copiedLink ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                  <Check size={14} />
                  <span>已复制</span>
                </span>
              ) : (
                <ChevronRight size={18} />
              )}
            </div>
          </div>

          {/* 列表项 2及其他：来自通讯录的联系人 */}
          {filteredContacts.map((contact) => {
            const isAdded = familyMembers.some((m) => m?.name && contact?.name && m.name.includes(contact.name));
            const isInvited = invitedMap[contact.id] || isAdded;
            return (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F0F2F5] transition-colors group select-none"
              >
                <div className="flex items-center space-x-3.5">
                  {/* 联系人头像 / 通讯录图标 */}
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* 小通讯录角标 */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-xs border border-gray-100">
                      <div className="w-4.5 h-4.5 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-[8px] shrink-0">
                        <Users size={11} className="shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* 姓名与来源 */}
                  <div>
                    <h4 className="text-[15px] font-bold text-[#050505] leading-snug">
                      {contact.name}
                    </h4>
                    <p className="text-[12.5px] text-[#65676B] leading-tight mt-0.5">
                      {contact.relation}
                    </p>
                  </div>
                </div>

                {/* 右侧 Facebook 纯蓝胶囊邀请按钮 */}
                <button
                  type="button"
                  onClick={() => handleInvite(contact)}
                  disabled={isInvited}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all shadow-xs cursor-pointer ${
                    isInvited
                      ? 'bg-[#E4E6EB] text-[#65676B] cursor-default'
                      : 'bg-[#1877F2] hover:bg-[#166FE5] active:scale-95 text-white'
                  }`}
                >
                  {isInvited ? '已加入' : '邀请'}
                </button>
              </div>
            );
          })}
        </div>

        {/* 底部保障说明卡片 (Meta Family Safety Note) */}
        <div className="mx-4 mt-5 p-3.5 rounded-2xl bg-[#F0F2F5]/70 border border-gray-200/60 flex items-start space-x-3">
          <ShieldCheck size={20} className="text-[#1877F2] shrink-0 mt-0.5" />
          <div className="text-xs text-[#65676B] leading-relaxed">
            <span className="font-bold text-[#050505]">安全与隐私保障：</span>
            只有家庭成员互相同意后，才会向已授权的家庭守护星同步实时地理位置与 SOS 紧急预警求助。
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* ★ 生成图标头像完成确认弹窗 (展示合成的家庭专属守护头像) */}
      {/* ================================================================= */}
      {showGeneratedBadgeModal && (
        <div className="absolute inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[28px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col space-y-4 text-center">
            {/* 顶栏图标 */}
            <div className="relative mx-auto mt-1">
              {/* 动态合成 4 宫格家庭专属图标头像 */}
              <div className="w-24 h-24 rounded-[26px] p-1.5 bg-gradient-to-tr from-blue-500 via-indigo-500 to-amber-400 shadow-xl shadow-blue-500/25 ring-4 ring-white relative flex items-center justify-center overflow-hidden">
                <div className="grid grid-cols-2 gap-1 w-full h-full rounded-[20px] overflow-hidden bg-white">
                  {familyMembers.slice(0, 4).map((member, i) => (
                    <img
                      key={member.id || i}
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ))}
                </div>

                {/* 中心守护发光小徽章 */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white p-0.5 shadow-md">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white">
                    <ShieldCheck size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-50 text-[#1877F2] text-xs font-bold mb-1.5">
                <Sparkles size={13} />
                <span>专属守护徽章已生成</span>
              </div>
              <h3 className="text-[20px] font-black text-[#050505] tracking-tight">
                家庭守护小组创建就绪
              </h3>
              <p className="text-[13px] text-[#65676B] mt-1 leading-relaxed">
                已为 <strong className="text-[#050505]">{familyMembers.length} 位成员</strong> 生成多合一专属家庭群头像，全天候守护雷达已就绪。
              </p>
            </div>

            {/* 小组名称编辑 */}
            <div className="bg-[#F0F2F5] rounded-2xl px-3.5 py-2.5 flex items-center space-x-2 text-left">
              <Smile size={18} className="text-[#1877F2] shrink-0" />
              <input
                type="text"
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
                className="w-full bg-transparent text-[13.5px] font-bold text-[#050505] outline-none"
                placeholder="输入家庭小组名称"
              />
            </div>

            {/* 底部按钮 */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSaveAndActivateGroup}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#1877F2] to-[#0866FF] hover:from-[#166FE5] hover:to-[#005CE6] text-white font-bold text-[15px] shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                应用并开启守护
              </button>

              <button
                type="button"
                onClick={() => setShowGeneratedBadgeModal(false)}
                className="w-full py-2 rounded-full text-[#65676B] hover:bg-[#F0F2F5] font-semibold text-[13.5px] cursor-pointer transition-colors"
              >
                返回继续调整成员
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 付费添加 / 尊享家庭计划升级弹窗 (Facebook / Meta 风格模态卡片) */}
      {/* ================================================================= */}
      {showPayUpgradeModal && (
        <div className="absolute inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl animate-in slide-in-from-bottom-6 duration-200 flex flex-col space-y-4">
            {/* 顶栏图标与标题 */}
            <div className="text-center pt-2">
              <div className="w-13 h-13 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-[20px] font-black text-[#050505] tracking-tight">
                解锁更多家庭守护名额
              </h3>
              <p className="text-[13px] text-[#65676B] mt-1.5 leading-relaxed">
                当前 4 位免费名额已满。开通 <span className="text-[#1877F2] font-semibold">Stellar 尊享家庭版</span>，守护每一位家人。
              </p>
            </div>

            {/* 权益清单 */}
            <div className="bg-[#F0F2F5]/80 rounded-2xl p-3.5 space-y-2 text-xs text-[#050505] font-medium">
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-[#1877F2] shrink-0 stroke-[2.5]" />
                <span>最多可同时添加 <strong className="text-[#1877F2]">10 位</strong> 家庭与亲友成员</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-[#1877F2] shrink-0 stroke-[2.5]" />
                <span>24 小时高精度历史移动轨迹与滞留预警</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-[#1877F2] shrink-0 stroke-[2.5]" />
                <span>紧急 SOS 一键跨端多级联动报警</span>
              </div>
            </div>

            {/* 价格方案选项 */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl border-2 border-[#1877F2] bg-blue-50/50 flex flex-col items-center text-center cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#1877F2] text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
                  推荐
                </div>
                <span className="text-xs text-[#65676B] font-semibold">年度尊享</span>
                <span className="text-lg font-black text-[#050505] mt-0.5">¥98<span className="text-[10px] font-normal text-[#65676B]">/年</span></span>
                <span className="text-[10px] text-[#1877F2] font-bold mt-0.5">相当于 ¥8.1/月</span>
              </div>

              <div className="p-3 rounded-2xl border border-[#E4E6EB] hover:border-gray-400 bg-white flex flex-col items-center text-center cursor-pointer">
                <span className="text-xs text-[#65676B] font-semibold">连续包月</span>
                <span className="text-lg font-black text-[#050505] mt-0.5">¥12<span className="text-[10px] font-normal text-[#65676B]">/月</span></span>
                <span className="text-[10px] text-[#65676B] mt-0.5">随时可取消</span>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setShowPayUpgradeModal(false);
                  // 模拟付费成功后扩容名额并添加成员
                  const newMember: FamilyMemberCard = {
                    id: `m-${Date.now()}`,
                    name: '李娜 (新加入)',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
                    bgColor: 'bg-rose-300',
                    rotation: 'rotate-2',
                    location: '刚刚加入',
                    status: '🟢 在线',
                  };
                  setFamilyMembers((prev) => [...prev, newMember]);
                  if (onSuccess) {
                    onSuccess('🎉 已成功升级 Stellar 尊享家庭版，名额已扩容至 10 人！');
                  }
                }}
                className="w-full py-3 rounded-full bg-[#1877F2] hover:bg-[#166FE5] active:scale-[0.98] text-white font-bold text-[15px] shadow-md shadow-blue-500/20 cursor-pointer transition-all"
              >
                立即付费升级并添加
              </button>

              <button
                onClick={() => setShowPayUpgradeModal(false)}
                className="w-full py-2.5 rounded-full text-[#65676B] hover:bg-[#F0F2F5] font-semibold text-[14px] cursor-pointer transition-colors"
              >
                稍后再说
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
