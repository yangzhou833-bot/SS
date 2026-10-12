import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Check,
  Send,
  MapPin,
  ArrowLeft,
  Users,
  CheckSquare,
  Square,
  Navigation,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Friend } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

export interface LocationShareData {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  isLive?: boolean;
  batteryLevel?: number;
  frequencyTag?: string;
}

interface ShareLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationData: LocationShareData | null;
  friends: Friend[];
  onConfirmShare: (friendIds: string[], locationData: LocationShareData) => void;
}

export const ShareLocationModal: React.FC<ShareLocationModalProps> = ({
  isOpen,
  onClose,
  locationData,
  friends,
  onConfirmShare,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Filtered friends list
  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return friends;
    const term = searchTerm.toLowerCase();
    return friends.filter(
      (f) =>
        (f.name || '').toLowerCase().includes(term) ||
        (f.relationship || '').toLowerCase().includes(term) ||
        (f.statusText || '').toLowerCase().includes(term)
    );
  }, [friends, searchTerm]);

  if (!isOpen || !locationData) return null;

  const isAllFilteredSelected =
    filteredFriends.length > 0 &&
    filteredFriends.every((f) => selectedFriendIds.includes(f.id));

  const handleToggleFriend = (friendId: string) => {
    soundEffects.playTapSound();
    haptics.trigger('light');
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleToggleSelectAll = () => {
    soundEffects.playTapSound();
    haptics.trigger('medium');
    if (isAllFilteredSelected) {
      const filteredIds = new Set(filteredFriends.map((f) => f.id));
      setSelectedFriendIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const newIds = new Set([
        ...selectedFriendIds,
        ...filteredFriends.map((f) => f.id),
      ]);
      setSelectedFriendIds(Array.from(newIds));
    }
  };

  const handleSend = () => {
    if (selectedFriendIds.length === 0 || isSending) return;
    setIsSending(true);
    soundEffects.playSuccessSound();
    haptics.trigger('success');

    setTimeout(() => {
      onConfirmShare(selectedFriendIds, locationData);
      setIsSending(false);
      setSelectedFriendIds([]);
      onClose();
    }, 280);
  };

  return (
    <div
      className="absolute inset-0 z-[250] bg-white flex flex-col overflow-hidden animate-in fade-in duration-150 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header Bar */}
      <div className="pt-2.5 pb-2.5 px-3.5 border-b border-[#E4E6EB] bg-white flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-[#F0F2F5] active:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
            title="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="font-bold text-sm text-[#050505] flex items-center space-x-1.5">
              <span>{locationData.isLive ? '分享即时定位给好友' : '分享常去地点给好友'}</span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#E7F3FF] text-[#1877F2] rounded border border-[#1877F2]/20">
                可多选
              </span>
            </h3>
            <p className="text-[11px] text-[#65676B]">
              以结构化卡片形式发送至所选好友私聊
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Top Header Quick Confirm & Send Button */}
          <button
            type="button"
            disabled={selectedFriendIds.length === 0 || isSending}
            onClick={handleSend}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1 ${
              selectedFriendIds.length > 0 && !isSending
                ? 'bg-[#1877F2] hover:bg-[#166FE5] text-white active:scale-95 shadow-2xs cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            <Send size={12} />
            <span>
              确认发送
              {selectedFriendIds.length > 0
                ? ` (${selectedFriendIds.length})`
                : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-[#F0F2F5] active:bg-[#E4E6EB] text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Location Preview Card (Facebook straight line border style) */}
      <div className="p-3 bg-[#F0F2F5] shrink-0 border-b border-[#E4E6EB]">
        <div className="p-2.5 bg-white border border-[#E4E6EB] rounded-md flex items-center space-x-3 shadow-2xs">
          <div
            className={`w-10 h-10 rounded-md flex items-center justify-center text-xl shrink-0 border ${
              locationData.isLive
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20'
            }`}
          >
            {locationData.isLive ? <Radio size={20} className="animate-pulse" /> : <MapPin size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <h4 className="font-bold text-xs text-[#050505] truncate">
                {locationData.name}
              </h4>
              {locationData.isLive ? (
                <span className="shrink-0 text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-600 font-bold rounded border border-emerald-200">
                  即时定位
                </span>
              ) : locationData.frequencyTag ? (
                <span className="shrink-0 text-[10px] px-1.5 py-0.2 bg-[#E7F3FF] text-[#1877F2] font-bold rounded border border-[#1877F2]/20">
                  {locationData.frequencyTag}
                </span>
              ) : (
                <span className="shrink-0 text-[10px] px-1 py-0.2 bg-[#F0F2F5] text-[#65676B] rounded border border-[#CED0D5]">
                  常去地点
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[10.5px] text-[#65676B] mt-0.5 truncate">
              <span className="truncate">{locationData.address || `${locationData.lat.toFixed(4)}°N, ${locationData.lng.toFixed(4)}°E`}</span>
              {locationData.isLive && (
                <span className="text-emerald-600 font-medium shrink-0 flex items-center space-x-0.5">
                  <span>•</span>
                  <span>高精度GPS 准确定位</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Multi-Select Controller Bar */}
      <div className="p-2.5 bg-white border-b border-[#E4E6EB] space-y-2 shrink-0">
        {/* Search Bar */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]"
          />
          <input
            type="text"
            placeholder="搜索好友姓名、备注或关系..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F0F2F5] border border-[#E4E6EB] focus:border-[#1877F2] focus:bg-white rounded-md outline-none text-[#050505] placeholder-[#65676B] transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Selection Count & Select-All Pill */}
        <div className="flex items-center justify-between pt-0.5 text-xs">
          <div className="flex items-center space-x-1 text-[#65676B]">
            <Users size={13} className="text-[#1877F2]" />
            <span className="text-[11px] font-medium">
              已选中{' '}
              <strong className="text-[#1877F2] font-bold">
                {selectedFriendIds.length}
              </strong>{' '}
              位好友
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-bold text-[#1877F2] hover:bg-[#E7F3FF] active:scale-95 transition-all cursor-pointer"
          >
            {isAllFilteredSelected ? (
              <>
                <CheckSquare size={13} />
                <span>取消全选</span>
              </>
            ) : (
              <>
                <Square size={13} />
                <span>全选 ({filteredFriends.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Friends Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar bg-[#F7F8FA]">
        {filteredFriends.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#65676B] flex flex-col items-center justify-center space-y-2">
            <Search size={28} className="text-gray-300" />
            <p className="font-semibold">没有找到匹配的好友</p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-[11px] text-[#1877F2] font-bold hover:underline"
              >
                清除搜索条件
              </button>
            )}
          </div>
        ) : (
          filteredFriends.map((friend) => {
            const isSelected = selectedFriendIds.includes(friend.id);
            return (
              <div
                key={friend.id}
                onClick={() => handleToggleFriend(friend.id)}
                className={`p-2.5 rounded-md flex items-center justify-between cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-white border-[#1877F2] shadow-xs ring-1 ring-[#1877F2]/30'
                    : 'bg-white border-[#E4E6EB] hover:border-[#CED0D5] hover:bg-white/80'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 border ${
                      isSelected
                        ? 'bg-[#1877F2] border-[#1877F2] text-white shadow-2xs'
                        : 'border-[#CED0D5] bg-white hover:border-[#1877F2]'
                    }`}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                  </div>

                  {/* Avatar with status */}
                  <div className="relative shrink-0">
                    <img
                      src={
                        friend.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
                      }
                      alt={friend.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#E4E6EB]"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        friend.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>

                  {/* Friend Information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <h5 className="font-bold text-xs text-[#050505] truncate">
                        {friend.name}
                      </h5>
                      {friend.relationship && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#F0F2F5] text-[#65676B] rounded border border-[#E4E6EB] shrink-0">
                          {friend.relationship}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#65676B] truncate mt-0.5">
                      {friend.statusText || (friend.isOnline ? '在线' : '离线')}
                    </p>
                  </div>
                </div>

                {/* Selection state badge */}
                <div className="shrink-0 ml-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-[#E7F3FF] text-[#1877F2]'
                        : 'text-gray-400'
                    }`}
                  >
                    {isSelected ? '已选择' : '未选'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Fixed Bottom Action Bar with clear Confirm and Send Button */}
      <div className="p-3.5 pb-[calc(18px+var(--sab,0px))] border-t border-[#E4E6EB] bg-white flex items-center justify-between space-x-3 shrink-0 shadow-lg z-20">
        <div className="text-xs text-[#65676B] min-w-0 truncate">
          {selectedFriendIds.length > 0 ? (
            <span className="truncate">
              已选择{' '}
              <strong className="text-[#1877F2] font-bold">
                {selectedFriendIds.length}
              </strong>{' '}
              位好友
            </span>
          ) : (
            <span className="text-gray-400 text-[11px]">请在上方勾选好友</span>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-md text-xs font-bold text-[#65676B] bg-[#F0F2F5] hover:bg-[#E4E6EB] transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            id="share-location-confirm-send-btn"
            disabled={selectedFriendIds.length === 0 || isSending}
            onClick={handleSend}
            className={`px-5 py-2 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md ${
              selectedFriendIds.length > 0 && !isSending
                ? 'bg-[#1877F2] hover:bg-[#166FE5] text-white cursor-pointer active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            {isSending ? (
              <span>发送中...</span>
            ) : (
              <>
                <Send size={13} />
                <span>
                  确认发送
                  {selectedFriendIds.length > 0
                    ? ` (${selectedFriendIds.length})`
                    : ''}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
