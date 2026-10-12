import React, { useState } from 'react';
import { useDialogFocus } from '../utils/useDialogFocus';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, QrCode, UserPlus, Check, Sparkles, Phone, ShieldCheck, ArrowLeft, Send } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string) => void;
  onAddNotification?: (title: string, content: string, type: 'message' | 'like' | 'system' | 'radar') => void;
}

interface CandidateUser {
  id: string;
  name: string;
  stellarId: string;
  phone: string;
  avatar: string;
  bio: string;
  distance: string;
  mutualFriends: number;
}

const MOCK_CANDIDATES: CandidateUser[] = [
  {
    id: 'c1',
    name: '沈云舟 (Skyline)',
    stellarId: 'stellar_shen',
    phone: '138****8812',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    bio: '户外徒步 | 极客骑行爱好者 🚴‍♂️',
    distance: '300m',
    mutualFriends: 5,
  },
  {
    id: 'c2',
    name: '周亦冉 (Aria)',
    stellarId: 'stellar_aria',
    phone: '186****9011',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    bio: 'Post-Rock / 独立摄影师 📸',
    distance: '1.2km',
    mutualFriends: 8,
  },
  {
    id: 'c3',
    name: '高天赐 (Atlas)',
    stellarId: 'stellar_atlas',
    phone: '177****3321',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    bio: '全栈开发工程师 & 云架构师 ⚡',
    distance: '2.5km',
    mutualFriends: 3,
  },
];

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  isOpen,
  onClose,
  showToast,
  onAddNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'scan'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<CandidateUser | null>(null);
  const [applyNote, setApplyNote] = useState('你好，我是 Alexia，在 Stellar 雷达上关注到你，想加个好友！');
  const [sentUserIds, setSentUserIds] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const dialog = useDialogFocus(isOpen, () => selectedUser ? setSelectedUser(null) : onClose());

  if (!isOpen) return null;

  const filteredCandidates = MOCK_CANDIDATES.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.stellarId.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  const handleSendRequest = () => {
    if (!selectedUser) return;
    haptics.trigger('medium');
    soundEffects.playTapSound();

    setSentUserIds((prev) => [...prev, selectedUser.id]);
    const targetName = selectedUser.name;
    setSelectedUser(null);

    if (showToast) {
      showToast(`已向 ${targetName} 发送好友申请 📩`);
    }
    if (onAddNotification) {
      onAddNotification(
        '好友申请已发送',
        `您向 ${targetName} 发送了好友申请："${applyNote.slice(0, 20)}..."`,
        'system'
      );
    }
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    haptics.trigger('light');
    setTimeout(() => {
      setIsScanning(false);
      const scanned = MOCK_CANDIDATES[0];
      setSelectedUser(scanned);
      if (showToast) showToast('🎉 二维码扫描成功！获取到用户名片');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Main Container */}
      <div ref={dialog} role="dialog" aria-modal="true" aria-label="添加好友" tabIndex={-1} className="relative w-full max-h-[calc(100dvh-24px)] max-w-[380px] bg-white rounded-xl shadow-2xl border border-[#E4E6EB] overflow-hidden flex flex-col z-10 [&_button]:min-h-11 [&_input]:min-h-11 [&_input]:text-base [&_textarea]:text-base animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-[#E4E6EB] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1877F2] flex items-center justify-center border border-blue-100">
              <UserPlus size={16} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#050505] leading-tight">添加好友</h3>
              <p className="text-[10px] text-[#65676B]">搜索昵称、账号、手机号或扫码添加</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-[#65676B] transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1.5 bg-[#F0F2F5] border-b border-[#E4E6EB] gap-1">
          <button
            onClick={() => {
              setActiveTab('search');
              haptics.trigger('light');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                : 'text-[#65676B] hover:text-[#050505]'
            }`}
          >
            <Search size={14} />
            <span>账号 / 手机号搜索</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('scan');
              haptics.trigger('light');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'scan'
                ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                : 'text-[#65676B] hover:text-[#050505]'
            }`}
          >
            <QrCode size={14} />
            <span>扫描二维码</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3 min-h-0 flex-1 overflow-y-auto space-y-3">
          {activeTab === 'search' ? (
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-[#65676B]" />
                <input
                  type="text"
                  placeholder="输入昵称、Stellar号或手机号..."
                  aria-label="搜索好友昵称、账号或手机号"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-[#F0F2F5] rounded-lg text-xs text-[#050505] placeholder-[#65676B] border border-transparent focus:border-[#1877F2] focus:bg-white outline-none transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="清空好友搜索"
                    className="absolute right-0 top-0 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Candidates List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#65676B] flex items-center justify-between">
                  <span>推荐好友 / 搜索结果</span>
                  <span className="text-[10px] text-[#1877F2]">雷达实况匹配</span>
                </div>

                {filteredCandidates.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#65676B]">
                    未找到与 "{searchQuery}" 匹配的用户
                  </div>
                ) : (
                  filteredCandidates.map((user) => {
                    const isSent = sentUserIds.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        className="p-2.5 rounded-lg bg-white border border-[#E4E6EB] hover:border-[#1877F2]/50 shadow-2xs flex items-center justify-between gap-2 transition-all"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-[#E4E6EB] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1">
                              <h4 className="text-xs font-bold text-[#050505] truncate">{user.name}</h4>
                            </div>
                            <p className="text-[10px] text-[#65676B] truncate mt-0.5">{user.bio}</p>
                            <p className="text-[9.5px] text-gray-400 font-mono">ID: {user.stellarId}</p>
                          </div>
                        </div>

                        {isSent ? (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-md text-[11px] font-bold shrink-0 flex items-center gap-1 border border-gray-200">
                            <Check size={12} className="text-emerald-500" />
                            已申请
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              haptics.trigger('light');
                            }}
                            className="px-2.5 py-1.5 bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white rounded-md text-[11px] font-bold shrink-0 cursor-pointer shadow-2xs transition-all flex items-center gap-1"
                          >
                            <UserPlus size={12} />
                            添加
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* Scan QR Code Tab */
            <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
              <div className="relative w-44 h-44 rounded-xl border-2 border-dashed border-[#1877F2] bg-blue-50/50 flex flex-col items-center justify-center overflow-hidden">
                {isScanning ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 border-3 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-[#1877F2]">扫描中...</span>
                  </div>
                ) : (
                  <>
                    <QrCode size={64} className="text-[#1877F2]/80 mb-2" />
                    <span className="text-xs font-bold text-[#050505]">对准用户的 Stellar 二维码</span>
                    <span className="text-[10px] text-[#65676B] mt-0.5">或导入相册照片识别</span>
                  </>
                )}
              </div>

              <button
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="w-full py-2 bg-[#1877F2] hover:bg-blue-600 active:scale-98 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>模拟相机扫码添加</span>
              </button>
            </div>
          )}
        </div>

        {/* Application Reason Sub-modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              data-dialog-focus-scope role="dialog" aria-modal="true" aria-label="发送好友申请"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 bg-white z-20 p-4 flex flex-col min-h-0 overflow-y-auto justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-2 mb-3">
                  <button
                    autoFocus
                    onClick={() => setSelectedUser(null)}
                    className="flex items-center text-xs font-bold text-[#1877F2] gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    返回
                  </button>
                  <span className="text-xs font-bold text-[#050505]">发送好友申请</span>
                  <div className="w-8" />
                </div>

                <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-[#F0F2F5] border border-[#E4E6EB] mb-3">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-white"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#050505]">{selectedUser.name}</h4>
                    <p className="text-[10px] text-[#65676B]">ID: {selectedUser.stellarId}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="friend-application-note" className="text-[11px] font-bold text-[#050505]">验证申请说明：</label>
                  <textarea
                    id="friend-application-note"
                    rows={3}
                    value={applyNote}
                    onChange={(e) => setApplyNote(e.target.value)}
                    className="w-full p-2.5 bg-[#F0F2F5] rounded-lg text-xs text-[#050505] border border-[#E4E6EB] focus:border-[#1877F2] focus:bg-white outline-none resize-none font-medium"
                    placeholder="填写申请验证信息..."
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4E6EB] flex gap-2">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSendRequest}
                  className="flex-1 py-2 bg-[#1877F2] hover:bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Send size={13} />
                  发送申请
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
