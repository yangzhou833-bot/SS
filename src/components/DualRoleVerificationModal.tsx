import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Circle,
  RotateCcw,
  UserCheck,
  User,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  X,
  Send,
  Heart,
  MapPin,
  Calendar,
  MessageSquare,
  Radio,
  EyeOff,
  Bell,
  Layers,
  Phone,
  RefreshCw,
} from 'lucide-react';
import {
  DualRoleId,
  ChecklistStep,
  getSharedState,
  getActiveRoleId,
  setActiveRoleId,
  resetAllDualRoleMemory,
  subscribeDualRoleStore,
  getRoleProfile,
  sendFriendRequest,
  respondFriendRequest,
  likeUserStickerInStore,
  sendChatMessageOrPoke,
  startLocationSharingInStore,
  publishSharedActivityInStore,
  joinSharedActivityInStore,
  markChecklistStepDone,
} from '../data/dualRoleStore';

interface DualRoleVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRole: (roleId: DualRoleId) => void;
  showToast?: (msg: string) => void;
}

export const DualRoleVerificationModal: React.FC<DualRoleVerificationModalProps> = ({
  isOpen,
  onClose,
  onSwitchRole,
  showToast,
}) => {
  const [activeRole, setActiveRole] = useState<DualRoleId>(getActiveRoleId());
  const [sharedState, setSharedState] = useState(getSharedState());

  useEffect(() => {
    const unsubscribe = subscribeDualRoleStore(() => {
      setActiveRole(getActiveRoleId());
      setSharedState(getSharedState());
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const profileA = getRoleProfile('roleA');
  const profileB = getRoleProfile('roleB');

  const completedCount = sharedState.checklist.filter((c) => c.done).length;
  const progressPercent = Math.round((completedCount / sharedState.checklist.length) * 100);

  const handleToggleRole = (target: DualRoleId) => {
    setActiveRoleId(target);
    onSwitchRole(target);
    if (showToast) {
      showToast(`已无缝切换视角至: ${target === 'roleA' ? 'Role A (我的手机)' : 'Role B (好友手机)'}`);
    }
  };

  const handleResetData = () => {
    if (confirm('确定重置所有双角色对话、好友关系、点赞与跨用户记忆吗？测试将回到“从添加好友开始”初始状态。')) {
      resetAllDualRoleMemory();
      if (showToast) {
        showToast('🔄 已重置双角色交互记忆！关系已归零');
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-[#050505] dark:text-[#E4E6EB]"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50 dark:from-zinc-900 dark:to-zinc-900">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-black shadow-md">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center space-x-1.5">
                  <span>双角色交互验证清单</span>
                  <span className="text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950 text-[#1877F2] px-2 py-0.5 rounded-full">
                    {completedCount} / {sharedState.checklist.length}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Dual-User Interaction Verification (Role A & Role B)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Current Role Selector Bar */}
          <div className="px-5 py-3 bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 dark:text-zinc-300">
              当前切换设备视角:
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleToggleRole('roleA')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeRole === 'roleA'
                    ? 'bg-[#1877F2] text-white shadow-sm scale-102'
                    : 'bg-white dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 border border-gray-200 dark:border-zinc-600'
                }`}
              >
                <img src={profileA.avatar} alt="A" className="w-4 h-4 rounded-full object-cover" />
                <span>Role A (我的手机)</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleRole('roleB')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeRole === 'roleB'
                    ? 'bg-emerald-600 text-white shadow-sm scale-102'
                    : 'bg-white dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 border border-gray-200 dark:border-zinc-600'
                }`}
              >
                <img src={profileB.avatar} alt="B" className="w-4 h-4 rounded-full object-cover" />
                <span>Role B (好友手机)</span>
              </button>
            </div>
          </div>

          {/* Progress Bar Header */}
          <div className="px-5 py-3 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-700 dark:text-zinc-300">10 步全链路交互测试进度</span>
              <span className="text-[#1877F2] font-mono">{progressPercent}% 完成</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-[#1877F2] to-emerald-500 rounded-full"
              />
            </div>
          </div>

          {/* Checklist Scroll Area */}
          <div className="p-5 overflow-y-auto space-y-3 flex-1">
            {sharedState.checklist.map((item, cIdx) => (
              <div
                key={`chk_${item.id}_${item.step}_${cIdx}`}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.done
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : 'bg-white dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2.5">
                    {item.done ? (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle size={18} className="text-gray-300 dark:text-zinc-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-gray-400 dark:text-zinc-500">
                          0{item.step}
                        </span>
                        <h4
                          className={`text-sm font-bold ${
                            item.done
                              ? 'text-emerald-900 dark:text-emerald-200'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        {item.instruction}
                      </p>
                    </div>
                  </div>

                  {item.done && item.completedAt && (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md shrink-0">
                      {item.completedAt}
                    </span>
                  )}
                </div>

                {/* Quick Test Trigger Buttons */}
                <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200 dark:border-zinc-700/60 flex items-center justify-end space-x-2">
                  {item.step === 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (sharedState.friendship === 'none') {
                          sendFriendRequest(activeRole);
                          if (showToast) showToast('已发送好友申请！切换到另一个角色同意申请');
                        } else if (sharedState.friendship.startsWith('pending')) {
                          respondFriendRequest(activeRole, true);
                          if (showToast) showToast('已同意好友申请！两方建立好友关系 🎉');
                        } else {
                          if (showToast) showToast('好友关系已建立，步骤 1 完成！');
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-[#1877F2] text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      {sharedState.friendship === 'none'
                        ? '快速模拟: 发送好友申请'
                        : sharedState.friendship.startsWith('pending')
                        ? '快速模拟: 同意好友申请'
                        : '已连通好友'}
                    </button>
                  )}

                  {item.step === 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        const target: DualRoleId = activeRole === 'roleA' ? 'roleB' : 'roleA';
                        const targetP = getRoleProfile(target);
                        if (targetP.stickers.length > 0) {
                          likeUserStickerInStore(activeRole, target, targetP.stickers[0].id);
                          if (showToast) showToast(`已赞了 ${targetP.operatorName} 的贴纸 ❤️`);
                        } else {
                          if (showToast) showToast('对方暂无贴纸，请先在 ProfileView 创建抠图贴纸');
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors cursor-pointer"
                    >
                      快速模拟: 贴纸点赞 ❤️
                    </button>
                  )}

                  {item.step === 5 && (
                    <button
                      type="button"
                      onClick={() => {
                        const target: DualRoleId = activeRole === 'roleA' ? 'roleB' : 'roleA';
                        sendChatMessageOrPoke(activeRole, target, '你今天有空去夜骑吗？🚴', false);
                        if (showToast) showToast('已发送聊天消息，对方收到未读红点');
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      快速模拟: 发送私聊消息 💬
                    </button>
                  )}

                  {item.step === 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        startLocationSharingInStore(activeRole, '1h');
                        if (showToast) showToast('已开启 1 小时实时位置共享！');
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
                    >
                      快速模拟: 开启位置共享 📍
                    </button>
                  )}

                  {item.step === 7 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (sharedState.activities.length === 0) {
                          publishSharedActivityInStore(activeRole, {
                            title: '周六星空夜骑与黄河咖啡',
                            location: '兰州黄河风情线 ☕',
                            time: '本周六 19:30',
                          });
                          if (showToast) showToast('已发布同城活动并邀请好友！切换角色体验一键赴约');
                        } else {
                          joinSharedActivityInStore(activeRole, sharedState.activities[0].id);
                          if (showToast) showToast('已一键赴约同城活动！');
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      {sharedState.activities.length === 0 ? '快速模拟: 发布同城活动' : '快速模拟: 一键赴约活动'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      markChecklistStepDone(item.step);
                      if (showToast) showToast(`已标记步骤 0${item.step} 为已完成`);
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-white underline cursor-pointer"
                  >
                    手动标记完成
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Reset Button */}
          <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetData}
              className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-100 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>重置双角色记忆 (从添加好友开始)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#1877F2] text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors cursor-pointer"
            >
              继续测试
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
