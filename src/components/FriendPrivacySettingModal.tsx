import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ghost, ShieldCheck, Eye, EyeOff, Radio, VolumeX, Check, X, Sparkles } from 'lucide-react';
import { Friend } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

export type FriendLocationPrivacyLevel = 'precise' | 'blurred' | 'ghost';

interface FriendPrivacySettingModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string) => void;
  onUpdatePrivacy?: (friendId: string, level: FriendLocationPrivacyLevel) => void;
}

export const FriendPrivacySettingModal: React.FC<FriendPrivacySettingModalProps> = ({
  friend,
  isOpen,
  onClose,
  showToast,
  onUpdatePrivacy,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<FriendLocationPrivacyLevel>('blurred');
  const [hideTrajectory, setHideTrajectory] = useState<boolean>(true);
  const [muteNotifications, setMuteNotifications] = useState<boolean>(false);
  const [duration, setDuration] = useState<'always' | '2h' | '24h'>('always');

  if (!isOpen || !friend) return null;

  const handleSave = () => {
    haptics.trigger('medium');
    soundEffects.playTapSound();

    if (onUpdatePrivacy) {
      onUpdatePrivacy(friend.id, selectedLevel);
    }

    const levelText =
      selectedLevel === 'ghost'
        ? '幽灵完全隐身'
        : selectedLevel === 'blurred'
        ? '500m 模糊范围'
        : '精确实时定位';

    if (showToast) {
      showToast(`🔒 已更新针对【${friend.name}】的隐私策略：${levelText}`);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 select-none pointer-events-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/55 backdrop-blur-xs"
        />

        {/* Facebook Straight-Edge Line Frame Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[340px] bg-white border border-[#E4E6EB] rounded-md shadow-xl overflow-hidden z-10 flex flex-col text-[#050505]"
        >
          {/* Header */}
          <div className="p-3 border-b border-[#E4E6EB] bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB]"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                  <Ghost size={10} />
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#050505] flex items-center gap-1">
                  <span>对【{friend.name}】隐身与隐私</span>
                </h3>
                <p className="text-[10px] text-[#65676B]">配置该好友对您的可见精度与位置权限</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md hover:bg-gray-100 active:scale-95 text-[#65676B] flex items-center justify-center transition-colors cursor-pointer"
              title="关闭"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Options */}
          <div className="p-3 space-y-2.5 max-h-[70vh] overflow-y-auto">
            {/* Level 1: 精确位置 */}
            <div
              onClick={() => setSelectedLevel('precise')}
              className={`p-2.5 border rounded-md cursor-pointer transition-all flex items-start space-x-2.5 ${
                selectedLevel === 'precise'
                  ? 'border-[#1877F2] bg-blue-50/50 shadow-2xs'
                  : 'border-[#E4E6EB] hover:border-[#1877F2]/40 bg-white'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  selectedLevel === 'precise'
                    ? 'border-[#1877F2] bg-[#1877F2] text-white'
                    : 'border-gray-400 bg-white'
                }`}
              >
                {selectedLevel === 'precise' && <Check size={11} strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#050505] flex items-center gap-1">
                    <Eye size={12} className="text-[#1877F2]" />
                    <span>精确位置 (Precise)</span>
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    完全透明
                  </span>
                </div>
                <p className="text-[10px] text-[#65676B] mt-0.5 leading-relaxed">
                  向 {friend.name} 展示您亚米级的精准 GPS 经纬度、实时行进速度与移动状态。
                </p>
              </div>
            </div>

            {/* Level 2: 模糊范围 (推荐) */}
            <div
              onClick={() => setSelectedLevel('blurred')}
              className={`p-2.5 border rounded-md cursor-pointer transition-all flex items-start space-x-2.5 ${
                selectedLevel === 'blurred'
                  ? 'border-[#1877F2] bg-blue-50/50 shadow-2xs'
                  : 'border-[#E4E6EB] hover:border-[#1877F2]/40 bg-white'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  selectedLevel === 'blurred'
                    ? 'border-[#1877F2] bg-[#1877F2] text-white'
                    : 'border-gray-400 bg-white'
                }`}
              >
                {selectedLevel === 'blurred' && <Check size={11} strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#050505] flex items-center gap-1">
                    <Radio size={12} className="text-amber-500" />
                    <span>模糊范围圈 (500m 偏移)</span>
                  </span>
                  <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                    推荐保护
                  </span>
                </div>
                <p className="text-[10px] text-[#65676B] mt-0.5 leading-relaxed">
                  隐藏具体门牌号与常住居所，在周边街区生成 500m 半径的模糊光晕。
                </p>
              </div>
            </div>

            {/* Level 3: 幽灵隐身 */}
            <div
              onClick={() => setSelectedLevel('ghost')}
              className={`p-2.5 border rounded-md cursor-pointer transition-all flex items-start space-x-2.5 ${
                selectedLevel === 'ghost'
                  ? 'border-[#1877F2] bg-blue-50/50 shadow-2xs'
                  : 'border-[#E4E6EB] hover:border-[#1877F2]/40 bg-white'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  selectedLevel === 'ghost'
                    ? 'border-[#1877F2] bg-[#1877F2] text-white'
                    : 'border-gray-400 bg-white'
                }`}
              >
                {selectedLevel === 'ghost' && <Check size={11} strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#050505] flex items-center gap-1">
                    <Ghost size={12} className="text-purple-600" />
                    <span>幽灵模式 (冻结隐身)</span>
                  </span>
                  <span className="text-[9px] font-semibold text-purple-600 bg-purple-50 px-1 py-0.2 rounded border border-purple-200">
                    完全不可见
                  </span>
                </div>
                <p className="text-[10px] text-[#65676B] mt-0.5 leading-relaxed">
                  位置冻结在离线最后驻留点，对方不会收到任何您开启隐身的提示。
                </p>
              </div>
            </div>

            {/* Additional Toggles */}
            <div className="pt-1 border-t border-[#E4E6EB] space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-[11px] text-[#050505] font-semibold flex items-center gap-1.5">
                  <EyeOff size={13} className="text-gray-500" />
                  <span>隐藏历史移动轨迹折线</span>
                </span>
                <input
                  type="checkbox"
                  checked={hideTrajectory}
                  onChange={(e) => setHideTrajectory(e.target.checked)}
                  className="rounded text-[#1877F2] focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-[11px] text-[#050505] font-semibold flex items-center gap-1.5">
                  <VolumeX size={13} className="text-gray-500" />
                  <span>静音该好友互动提醒与碰一碰</span>
                </span>
                <input
                  type="checkbox"
                  checked={muteNotifications}
                  onChange={(e) => setMuteNotifications(e.target.checked)}
                  className="rounded text-[#1877F2] focus:ring-0 cursor-pointer"
                />
              </label>
            </div>

            {/* Duration Selector */}
            <div className="pt-1 border-t border-[#E4E6EB]">
              <span className="text-[10px] font-bold text-[#65676B] block mb-1.5">生效时限：</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: '2h', label: '2 小时' },
                    { id: '24h', label: '24 小时' },
                    { id: 'always', label: '一直持续' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDuration(item.id)}
                    className={`py-1 text-[10px] font-bold border rounded-md transition-colors cursor-pointer text-center ${
                      duration === item.id
                        ? 'border-[#1877F2] bg-[#1877F2] text-white'
                        : 'border-[#E4E6EB] bg-gray-50 text-[#65676B] hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-2.5 border-t border-[#E4E6EB] bg-gray-50 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-[#65676B] hover:text-[#050505] rounded-md transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#1877F2] hover:bg-blue-600 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer flex items-center space-x-1"
            >
              <ShieldCheck size={14} />
              <span>保存隐私设置</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
