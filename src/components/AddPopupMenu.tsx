import React, { useEffect } from 'react';
import {
  CalendarPlus,
  CalendarRange,
  Camera,
  MapPinPlus,
  UserPlus,
  Users,
  NotebookPen,
  SquarePen,
  Orbit,
  X,
  Sparkles,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';

export type ActionKey =
  | 'create-group'
  | 'create-schedule'
  | 'create-activity'
  | 'create-snapshot'
  | 'create-map-anchor'
  | 'add-friend'
  | 'create-note'
  | 'publish-post'
  | 'explore-planets';

interface AddPopupMenuProps {
  isOpen: boolean;
  currentTab: 'home' | 'chat' | 'teams' | 'discover' | 'stellar' | 'profile' | 'calendar';
  onClose: () => void;
  onSelectAction: (actionKey: ActionKey) => void;
  onOpenGuide?: () => void;
}

export const pageCreateActions: Record<string, ActionKey[]> = {
  home: [
    'create-group',
    'create-schedule',
    'create-activity',
    'create-snapshot',
    'create-map-anchor',
  ],
  chat: [
    'add-friend',
    'create-note',
  ],
  discover: [
    'publish-post',
    'explore-planets',
  ],
};

interface MenuItemConfig {
  id: ActionKey;
  label: string;
  desc: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}

const ACTION_CONFIGS: Record<ActionKey, MenuItemConfig> = {
  'create-group': {
    id: 'create-group',
    label: '添加小组',
    desc: '组建团队/兴趣小组 · 管理员查阅活动全员定位与轨迹',
    icon: <Users size={18} className="stroke-[2.2]" />,
    colorClass: 'text-[#1877F2]',
    bgClass: 'bg-blue-50 border-blue-200',
  },
  'create-schedule': {
    id: 'create-schedule',
    label: '创建日程',
    desc: '普通 / 航班日程 · 5步确认地图锚点与状态',
    icon: <CalendarPlus size={18} className="stroke-[2.2]" />,
    colorClass: 'text-[#1877F2]',
    bgClass: 'bg-blue-50 border-blue-200',
  },
  'create-activity': {
    id: 'create-activity',
    label: '创建活动',
    desc: '发起多人聚会 · 户外露营与电子围栏',
    icon: <CalendarRange size={18} className="stroke-[2.2]" />,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50 border-amber-200',
  },
  'create-snapshot': {
    id: 'create-snapshot',
    label: '创建快拍',
    desc: '拍摄照片星片或地图短视频',
    icon: <Camera size={18} className="stroke-[2.2]" />,
    colorClass: 'text-rose-500',
    bgClass: 'bg-rose-50 border-rose-200',
  },
  'create-map-anchor': {
    id: 'create-map-anchor',
    label: '创建地图锚点',
    desc: '在地图精准标记自定义图钉与生活地点',
    icon: <MapPinPlus size={18} className="stroke-[2.2]" />,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 border-emerald-200',
  },
  'add-friend': {
    id: 'add-friend',
    label: '添加好友',
    desc: '搜索昵称 / Stellar号 / 手机号或扫码',
    icon: <UserPlus size={18} className="stroke-[2.2]" />,
    colorClass: 'text-[#1877F2]',
    bgClass: 'bg-blue-50 border-blue-200',
  },
  'create-note': {
    id: 'create-note',
    label: '创建笔记',
    desc: '关联好友或聊天 · 个人私密随手记',
    icon: <NotebookPen size={18} className="stroke-[2.2]" />,
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50 border-purple-200',
  },
  'publish-post': {
    id: 'publish-post',
    label: '发布动态',
    desc: '图文 / 视频 / 地点动态发布至信息流',
    icon: <SquarePen size={18} className="stroke-[2.2]" />,
    colorClass: 'text-[#1877F2]',
    bgClass: 'bg-blue-50 border-blue-200',
  },
  'explore-planets': {
    id: 'explore-planets',
    label: '探索星球',
    desc: '探索热门主题、推荐星球与宇宙节点',
    icon: <Orbit size={18} className="stroke-[2.2]" />,
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50 border-indigo-200',
  },
};

export const AddPopupMenu: React.FC<AddPopupMenuProps> = ({
  isOpen,
  currentTab,
  onClose,
  onSelectAction,
  onOpenGuide,
}) => {
  // ESC Key Dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Resolve actions based on current tab
  const normalizedTab = ['home', 'chat', 'discover'].includes(currentTab)
    ? currentTab
    : currentTab === 'stellar'
    ? 'discover'
    : currentTab === 'profile' || currentTab === 'teams'
    ? 'chat'
    : 'home';

  const actionKeys = pageCreateActions[normalizedTab] || pageCreateActions.home;
  const menuItems = actionKeys.map((key) => ACTION_CONFIGS[key]).filter(Boolean);

  const handleItemClick = (key: ActionKey) => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    onClose();
    onSelectAction(key);
  };

  const isHome = normalizedTab === 'home';

  // 4 Core Circular Action Items for Map Creation
  const coreCircleActions: ActionKey[] = [
    'create-schedule',
    'create-activity',
    'create-snapshot',
    'create-map-anchor',
  ];

  return (
    <div className="fixed inset-0 z-[300] select-none font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Desktop Menu: Positioned under topbar '+' button */}
      <div className="hidden sm:block absolute top-13 right-3 w-[260px] bg-white border border-[#E4E6EB] rounded-xl shadow-xl p-2 z-10 animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none motion-reduce:transform-none">
        {/* Header Bar */}
        <div className="px-2 py-1.5 border-b border-[#E4E6EB] flex items-center justify-between bg-gray-50/80 rounded-t-lg mb-2">
          <span className="text-[11px] font-bold text-[#050505] tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2]" />
            <span>地图快捷操作</span>
          </span>
          <button
            onClick={onClose}
            className="w-5 h-5 rounded-full hover:bg-gray-200 flex items-center justify-center text-[#65676B] transition-colors cursor-pointer"
            title="关闭菜单"
            aria-label="关闭菜单"
          >
            <X size={12} />
          </button>
        </div>

        {/* 4 Core Circular Icons Row (For Home Map Tab) */}
        {isHome && (
          <div className="mb-2 pb-2 border-b border-[#E4E6EB]">
            <div className="text-[10px] font-bold text-[#65676B] px-1 mb-1.5 flex items-center justify-between">
              <span>核心创作</span>
              {onOpenGuide && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGuide();
                  }}
                  className="text-[10px] text-[#1877F2] hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                >
                  <Sparkles size={10} />
                  <span>新手指引</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {coreCircleActions.map((key) => {
                const item = ACTION_CONFIGS[key];
                return (
                  <button
                    key={`dt-circ-${key}`}
                    type="button"
                    onClick={() => handleItemClick(key)}
                    className="flex flex-col items-center p-1 rounded-lg hover:bg-gray-50 cursor-pointer group transition-transform active:scale-95"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${item.bgClass} ${item.colorClass} border flex items-center justify-center shadow-xs group-hover:scale-108 transition-transform`}
                    >
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold text-[#050505] group-hover:text-[#1877F2] mt-1 line-clamp-1 leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action List */}
        <div className="space-y-0.5 max-h-[260px] overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={`dt-menu-${item.id}`}
              onClick={() => handleItemClick(item.id)}
              className="w-full flex items-center space-x-2.5 px-2 py-1.5 min-h-[38px] rounded-md hover:bg-[#F0F2F5] active:bg-[#E4E6EB] transition-all cursor-pointer group text-left border border-transparent hover:border-[#E4E6EB]"
            >
              <div
                className={`w-6.5 h-6.5 rounded-full ${item.bgClass} ${item.colorClass} flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#050505] group-hover:text-[#1877F2] transition-colors leading-tight">
                  {item.label}
                </div>
                <div className="text-[9.5px] text-[#65676B] truncate leading-tight mt-0.5">
                  {item.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu: Bottom Action Sheet */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-10 bg-white rounded-t-2xl border-t border-[#E4E6EB] shadow-2xl p-3 pb-6 animate-in slide-in-from-bottom duration-200 motion-reduce:animate-none">
        {/* Handle bar & Header */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2" />
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E4E6EB] px-1">
          <span className="text-xs font-bold text-[#050505]">地图快捷创作菜单</span>
          <div className="flex items-center gap-2">
            {onOpenGuide && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGuide();
                }}
                className="text-[11px] text-[#1877F2] font-bold flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 cursor-pointer"
              >
                <Sparkles size={11} />
                <span>功能指引</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-[#F0F2F5] flex items-center justify-center text-[#65676B] cursor-pointer"
              aria-label="关闭"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* 4 Core Circular Icons in Mobile View */}
        {isHome && (
          <div className="mb-3 p-2.5 rounded-xl bg-gray-50/80 border border-[#E4E6EB]">
            <div className="text-[10.5px] font-bold text-[#65676B] mb-2 px-0.5">
              核心创作（点击快速发起）：
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {coreCircleActions.map((key) => {
                const item = ACTION_CONFIGS[key];
                return (
                  <button
                    key={`mb-circ-${key}`}
                    type="button"
                    onClick={() => handleItemClick(key)}
                    className="flex flex-col items-center cursor-pointer group active:scale-95"
                  >
                    <div
                      className={`w-12 h-12 rounded-full ${item.bgClass} ${item.colorClass} border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-1`}
                    >
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-black text-[#050505] leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Items List */}
        <div className="space-y-1 max-h-[40vh] overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={`mb-menu-${item.id}`}
              onClick={() => handleItemClick(item.id)}
              className="w-full flex items-center space-x-3 px-3 py-2 min-h-[42px] rounded-lg bg-[#F0F2F5]/80 active:bg-[#E4E6EB] transition-colors cursor-pointer text-left border border-[#E4E6EB]"
            >
              <div
                className={`w-7 h-7 rounded-full ${item.bgClass} ${item.colorClass} flex items-center justify-center shrink-0 border`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#050505]">{item.label}</div>
                <div className="text-[10px] text-[#65676B] truncate mt-0.5">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
