import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  LogOut,
  Code,
  Check,
  Eye,
  Layers,
  MapPin,
  User,
  MessageCircle,
  Calendar,
  Compass,
  X,
  Copy,
} from 'lucide-react';
import { RoleId, RoleSnapshot } from '../data/roleSnapshotData';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

interface SideRoleBarProps {
  currentRole: RoleId;
  onSwitchRole: (roleId: RoleId) => void;
  onResetRoleData: () => void;
  onLogout: () => void;
  onNavigateTab?: (tab: 'home' | 'chat' | 'teams' | 'discover' | 'stellar' | 'profile' | 'calendar') => void;
  currentSnapshot?: RoleSnapshot;
  onShowToast?: (msg: string) => void;
}

export const SideRoleBar: React.FC<SideRoleBarProps> = ({
  currentRole,
  onSwitchRole,
  onResetRoleData,
  onLogout,
  onNavigateTab,
  currentSnapshot,
  onShowToast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [activeDevTab, setActiveDevTab] = useState<'jump' | 'json'>('jump');
  const [copiedJson, setCopiedJson] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      setShowDevModal(true);
      soundEffects.playTapSound();
      haptics.trigger('warning');
      onShowToast?.('🛠️ 开发者模式：已呼出快照检查与直达菜单');
    }, 700);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleCopyJson = () => {
    if (currentSnapshot) {
      navigator.clipboard.writeText(JSON.stringify(currentSnapshot, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
      onShowToast?.('✅ 当前角色 JSON 数据快照已复制到剪贴板');
    }
  };

  return (
    <>
      {/* Persistent Floating Left Multi-Role Switcher Bar (Left-aligned, vertically centered) */}
      <div
        className="fixed left-2 top-1/2 -translate-y-1/2 z-90 select-none flex items-center font-sans"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        <motion.div
          layout
          className={`bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-[#E4E6EB] dark:border-zinc-700 shadow-xl rounded-lg overflow-hidden transition-all duration-300 flex flex-col items-center p-1.5 ${
            isExpanded ? 'w-48' : 'w-12'
          }`}
        >
          {/* Header / Expand & Collapse Toggle Button */}
          <div className="w-full flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-100 dark:border-zinc-800">
            {isExpanded ? (
              <span className="text-[10px] font-black text-[#1877F2] dark:text-blue-400 pl-1 uppercase tracking-wider flex items-center space-x-1">
                <span>👥 常用多角色</span>
              </span>
            ) : (
              <span className="w-full text-center text-[9px] font-black text-[#1877F2]">
                切换
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setIsExpanded((prev) => !prev);
                soundEffects.playTapSound();
                haptics.trigger('light');
              }}
              className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              title={isExpanded ? '收起多角色列表' : '展开左侧多角色列表 (长按打开开发者菜单)'}
            >
              {isExpanded ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>

          {/* Quick Role Selection List Title when Expanded */}
          {isExpanded && (
            <div className="w-full px-1 mb-1 text-[10px] font-bold text-[#65676B] dark:text-zinc-400 flex items-center justify-between">
              <span>点击直接秒切角色</span>
              <span className="text-[9px] bg-blue-50 text-[#1877F2] px-1 rounded font-mono">2 个身份</span>
            </div>
          )}

          {/* Role 1: New User Button (萌新探索者) */}
          <button
            type="button"
            onClick={() => {
              if (currentRole !== 'new_user') {
                onSwitchRole('new_user');
              }
            }}
            className={`w-full p-1.5 rounded-md flex items-center transition-all cursor-pointer mb-1.5 group relative ${
              currentRole === 'new_user'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-black shadow-2xs'
                : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-transparent'
            }`}
            title="萌新探索者 (初始空数据)"
          >
            <div className="relative shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-400 bg-white shadow-2xs">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                alt="New User"
                className="w-full h-full object-cover grayscale-20"
              />
              <span className="absolute -bottom-0.5 -right-0.5 text-[9px]">🌱</span>
            </div>

            {isExpanded ? (
              <div className="ml-2 text-left truncate flex-1">
                <div className="text-[11px] font-bold leading-tight flex items-center justify-between">
                  <span className="truncate">🌱 萌新探索者</span>
                  {currentRole === 'new_user' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  )}
                </div>
                <div className="text-[9px] text-[#65676B] dark:text-zinc-400 truncate mt-0.5">
                  Account A · 空数据
                </div>
              </div>
            ) : (
              currentRole === 'new_user' && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse" />
              )
            )}
          </button>

          {/* Role 2: Veteran User Button (资深探索官) */}
          <button
            type="button"
            onClick={() => {
              if (currentRole !== 'veteran_user') {
                onSwitchRole('veteran_user');
              }
            }}
            className={`w-full p-1.5 rounded-md flex items-center transition-all cursor-pointer mb-2 group relative ${
              currentRole === 'veteran_user'
                ? 'bg-blue-50 dark:bg-blue-950/50 border-2 border-[#1877F2] text-[#1877F2] dark:text-blue-200 font-black shadow-2xs'
                : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-transparent'
            }`}
            title="资深探索官 (满载数据与互动)"
          >
            <div className="relative shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-[#1877F2] bg-white shadow-2xs">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                alt="Veteran User"
                className="w-full h-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 text-[9px]">🌟</span>
            </div>

            {isExpanded ? (
              <div className="ml-2 text-left truncate flex-1">
                <div className="text-[11px] font-bold leading-tight flex items-center justify-between">
                  <span className="truncate">🌟 资深探索官</span>
                  {currentRole === 'veteran_user' && (
                    <span className="w-2 h-2 rounded-full bg-[#1877F2] animate-pulse shrink-0" />
                  )}
                </div>
                <div className="text-[9px] text-[#65676B] dark:text-zinc-400 truncate mt-0.5">
                  Account B · 满载数据
                </div>
              </div>
            ) : (
              currentRole === 'veteran_user' && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#1877F2] rounded-full border-2 border-white dark:border-zinc-900 animate-pulse" />
              )
            )}
          </button>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 dark:bg-zinc-800 my-1" />

          {/* Reset Snapshot Button */}
          <button
            type="button"
            onClick={() => {
              onResetRoleData();
              soundEffects.playTapSound();
              haptics.trigger('medium');
            }}
            className="w-full p-1.5 rounded-md hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-400 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-left my-0.5"
            title="重置当前角色数据快照"
          >
            <RotateCcw size={14} className="shrink-0" />
            {isExpanded && <span className="text-[11px] font-bold truncate">重置当前角色快照</span>}
          </button>

          {/* Return to Login Screen Button */}
          <button
            type="button"
            onClick={() => {
              onLogout();
              soundEffects.playTapSound();
              haptics.trigger('light');
            }}
            className="w-full p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-[#65676B] dark:text-zinc-400 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-left my-0.5"
            title="返回登录选择页"
          >
            <LogOut size={14} className="shrink-0" />
            {isExpanded && <span className="text-[11px] font-bold truncate">退出/切换账号</span>}
          </button>

          {/* Developer Menu Trigger */}
          <button
            type="button"
            onClick={() => setShowDevModal(true)}
            className="w-full p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 text-[#1877F2] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-left mt-0.5"
            title="长按或点击打开开发者调试工具"
          >
            <Code size={14} className="shrink-0" />
            {isExpanded && <span className="text-[11px] font-bold truncate">开发者数据检查</span>}
          </button>
        </motion.div>
      </div>

      {/* Developer Test Modal (Screen Jumps & Raw JSON Snapshot Inspector) */}
      <AnimatePresence>
        {showDevModal && (
          <div className="fixed inset-0 z-99 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded-lg max-w-md w-full shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              {/* Modal Header */}
              <div className="px-4 py-3 bg-[#F0F2F5] dark:bg-zinc-800/80 border-b border-[#E4E6EB] dark:border-zinc-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-[#1877F2] text-white flex items-center justify-center">
                    <Code size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#050505] dark:text-white">
                      开发者测试钩子 · Developer Menu
                    </h3>
                    <p className="text-[10px] text-[#65676B] dark:text-zinc-400">
                      当前角色: <strong className="text-[#1877F2]">{currentRole === 'new_user' ? '新用户 (空数据)' : '老用户 (满数据)'}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDevModal(false)}
                  className="w-7 h-7 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Subtabs: Screen Jump vs JSON Snapshot */}
              <div className="flex border-b border-[#E4E6EB] dark:border-zinc-700 px-4 pt-2 bg-white dark:bg-zinc-900">
                <button
                  onClick={() => setActiveDevTab('jump')}
                  className={`px-3 py-2 text-xs font-black border-b-2 transition-colors cursor-pointer mr-4 ${
                    activeDevTab === 'jump'
                      ? 'border-[#1877F2] text-[#1877F2]'
                      : 'border-transparent text-[#65676B] hover:text-[#050505]'
                  }`}
                >
                  🚀 界面快捷跳转
                </button>
                <button
                  onClick={() => setActiveDevTab('json')}
                  className={`px-3 py-2 text-xs font-black border-b-2 transition-colors cursor-pointer ${
                    activeDevTab === 'json'
                      ? 'border-[#1877F2] text-[#1877F2]'
                      : 'border-transparent text-[#65676B] hover:text-[#050505]'
                  }`}
                >
                  📊 检查当前角色 JSON 快照
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {activeDevTab === 'jump' ? (
                  <div className="space-y-3">
                    <p className="text-xs text-[#65676B] dark:text-zinc-400 font-medium">
                      点击直达目标模块，测试各角色在不同界面下的状态渲染：
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          onNavigateTab?.('home');
                          setShowDevModal(false);
                          onShowToast?.('已跳转至地图主页');
                        }}
                        className="p-2.5 bg-gray-50 dark:bg-zinc-800 hover:bg-blue-50 border border-gray-200 dark:border-zinc-700 hover:border-[#1877F2] rounded-md text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-[#050505] dark:text-white group-hover:text-[#1877F2]">
                          <MapPin size={14} className="text-[#1877F2]" />
                          <span>地图主页 (Map)</span>
                        </div>
                        <div className="text-[10px] text-[#65676B] mt-0.5">
                          查看自己与好友地图位置
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigateTab?.('profile');
                          setShowDevModal(false);
                          onShowToast?.('已跳转至个人主页 (My Page)');
                        }}
                        className="p-2.5 bg-gray-50 dark:bg-zinc-800 hover:bg-blue-50 border border-gray-200 dark:border-zinc-700 hover:border-[#1877F2] rounded-md text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-[#050505] dark:text-white group-hover:text-[#1877F2]">
                          <User size={14} className="text-[#1877F2]" />
                          <span>个人主页 (My Page)</span>
                        </div>
                        <div className="text-[10px] text-[#65676B] mt-0.5">
                          测试贴纸环与足迹空状态
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigateTab?.('chat');
                          setShowDevModal(false);
                          onShowToast?.('已跳转至消息与聊天');
                        }}
                        className="p-2.5 bg-gray-50 dark:bg-zinc-800 hover:bg-blue-50 border border-gray-200 dark:border-zinc-700 hover:border-[#1877F2] rounded-md text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-[#050505] dark:text-white group-hover:text-[#1877F2]">
                          <MessageCircle size={14} className="text-[#1877F2]" />
                          <span>聊天会话 (Chat)</span>
                        </div>
                        <div className="text-[10px] text-[#65676B] mt-0.5">
                          好友消息与信箱列表
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigateTab?.('discover');
                          setShowDevModal(false);
                          onShowToast?.('已跳转至发现动态');
                        }}
                        className="p-2.5 bg-gray-50 dark:bg-zinc-800 hover:bg-blue-50 border border-gray-200 dark:border-zinc-700 hover:border-[#1877F2] rounded-md text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-[#050505] dark:text-white group-hover:text-[#1877F2]">
                          <Compass size={14} className="text-[#1877F2]" />
                          <span>发现探索 (Discover)</span>
                        </div>
                        <div className="text-[10px] text-[#65676B] mt-0.5">
                          同城动态与热门足迹
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNavigateTab?.('calendar');
                          setShowDevModal(false);
                          onShowToast?.('已跳转至日程日历');
                        }}
                        className="p-2.5 bg-gray-50 dark:bg-zinc-800 hover:bg-blue-50 border border-gray-200 dark:border-zinc-700 hover:border-[#1877F2] rounded-md text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-[#050505] dark:text-white group-hover:text-[#1877F2]">
                          <Calendar size={14} className="text-[#1877F2]" />
                          <span>活动日程 (Calendar)</span>
                        </div>
                        <div className="text-[10px] text-[#65676B] mt-0.5">
                          查看已同步的活动事件
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onLogout();
                          setShowDevModal(false);
                        }}
                        className="p-2.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 rounded-md text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                          <LogOut size={14} />
                          <span>登录选择页 (Login)</span>
                        </div>
                        <div className="text-[10px] text-rose-600/80 mt-0.5">
                          回到双卡片登录体验
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#050505] dark:text-white">
                        Raw Snapshot Data
                      </span>
                      <button
                        onClick={handleCopyJson}
                        className="px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-xs font-bold text-gray-700 dark:text-zinc-200 rounded-md flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        {copiedJson ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        <span>{copiedJson ? '已复制' : '复制 JSON'}</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-gray-900 text-emerald-400 rounded-md text-[10px] font-mono overflow-x-auto max-h-72 leading-relaxed">
                      {JSON.stringify(currentSnapshot, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-2.5 bg-[#F0F2F5] dark:bg-zinc-800/80 border-t border-[#E4E6EB] dark:border-zinc-700 flex justify-end">
                <button
                  onClick={() => setShowDevModal(false)}
                  className="px-4 py-1.5 bg-[#1877F2] text-white text-xs font-bold rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
