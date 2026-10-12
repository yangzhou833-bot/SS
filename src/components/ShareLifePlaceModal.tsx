import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Check,
  Share2,
  Sparkles,
  MapPin,
  ArrowLeft,
  Users,
  CheckSquare,
  Square,
  Send,
} from 'lucide-react';
import { Friend, LifePlace } from '../types';
import { LIFE_PLACE_CATEGORIES } from '../data/lifeLayerStore';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

interface ShareLifePlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: LifePlace | null;
  friends: Friend[];
  onConfirmShare: (friendIds: string[], place: LifePlace) => void;
}

export const ShareLifePlaceModal: React.FC<ShareLifePlaceModalProps> = ({
  isOpen,
  onClose,
  place,
  friends,
  onConfirmShare,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Filtered friends list
  const filteredFriends = useMemo(() => {
    const list = friends.filter((f) => f.id !== 'me');
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (f) =>
        (f.name || '').toLowerCase().includes(term) ||
        (f.relationship || '').toLowerCase().includes(term) ||
        (f.statusText || '').toLowerCase().includes(term) ||
        (f.locationName || '').toLowerCase().includes(term)
    );
  }, [friends, searchTerm]);

  if (!isOpen || !place) return null;

  const isAllFilteredSelected =
    filteredFriends.length > 0 &&
    filteredFriends.every((f) => selectedFriendIds.includes(f.id));

  const categoryMeta =
    LIFE_PLACE_CATEGORIES.find((c) => c.key === place.category) || {
      key: 'other',
      label: '生活地点',
      icon: place.icon || '📍',
      color: place.color || '#1877F2',
      gradient: 'from-blue-500 to-indigo-600',
    };

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
      onConfirmShare(selectedFriendIds, place);
      setIsSending(false);
      setSelectedFriendIds([]);
      onClose();
    }, 280);
  };

  return (
    <div
      className="fixed inset-0 z-[250] bg-white dark:bg-[#18191A] flex flex-col overflow-hidden animate-in fade-in duration-150 select-none font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header Bar */}
      <div className="pt-2.5 pb-2.5 px-3.5 border-b border-[#E4E6EB] dark:border-zinc-800 bg-white dark:bg-[#242526] flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 active:bg-[#E4E6EB] text-[#050505] dark:text-[#E4E6EB] flex items-center justify-center transition-colors cursor-pointer"
            title="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="font-bold text-sm text-[#050505] dark:text-[#E4E6EB] flex items-center space-x-1.5">
              <span>分享生活坐标给好友</span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#E7F3FF] dark:bg-blue-950/40 text-[#1877F2] rounded border border-[#1877F2]/20">
                可多选
              </span>
            </h3>
            <p className="text-[10.5px] text-[#65676B] dark:text-zinc-400">
              好友收到后可在私聊中查看并一键设为自己的生活坐标
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-md hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 text-[#65676B] dark:text-zinc-400 hover:text-[#050505] dark:hover:text-[#E4E6EB] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Place Preview Card (Facebook Straight-Edge Line Frame UI System) */}
      <div className="p-3 bg-[#F7F8FA] dark:bg-zinc-900 border-b border-[#E4E6EB] dark:border-zinc-800 shrink-0">
        <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-zinc-700 rounded-md p-3 shadow-2xs flex items-center space-x-3">
          {/* Category Icon Badge */}
          <div
            className="w-12 h-12 rounded-md flex items-center justify-center text-2xl shrink-0 shadow-2xs border border-[#E4E6EB] dark:border-zinc-700"
            style={{ backgroundColor: `${categoryMeta.color}18` }}
          >
            <span>{place.icon || categoryMeta.icon}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-[11px] text-[#1877F2]">
                生活坐标
              </span>
              <span
                className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-sm border"
                style={{
                  backgroundColor: `${categoryMeta.color}15`,
                  color: categoryMeta.color,
                  borderColor: `${categoryMeta.color}35`,
                }}
              >
                {categoryMeta.label}
              </span>
              {place.distanceKm !== undefined && (
                <span className="text-[10px] font-mono text-[#65676B] dark:text-zinc-400">
                  {place.distanceKm} km · {place.direction || '城关区'}
                </span>
              )}
            </div>

            <h4 className="mt-0.5 font-extrabold text-sm text-[#050505] dark:text-[#E4E6EB] truncate">
              {place.name}
            </h4>

            <div className="mt-1 flex items-center space-x-1 text-[#65676B] dark:text-zinc-400 text-[11px] truncate">
              <MapPin size={11} className="text-[#1877F2] shrink-0" />
              <span className="truncate">
                {place.address || '甘肃省兰州市城关区'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Multi-Select Operations */}
      <div className="p-3 bg-white dark:bg-[#242526] border-b border-[#E4E6EB] dark:border-zinc-800 space-y-2 shrink-0">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8D91]"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索好友姓名、备注、亲友标签..."
            className="w-full bg-[#F0F2F5] dark:bg-zinc-800 text-[#050505] dark:text-[#E4E6EB] placeholder-[#8A8D91] text-xs rounded-md pl-8 pr-3 py-1.5 border border-[#E4E6EB] dark:border-zinc-700 outline-none focus:border-[#1877F2] focus:bg-white dark:focus:bg-zinc-800 transition-all"
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="flex items-center space-x-1.5 text-[#1877F2] hover:text-[#166FE5] font-bold cursor-pointer transition-colors active:scale-98"
          >
            {isAllFilteredSelected ? (
              <CheckSquare size={14} className="stroke-[2.5]" />
            ) : (
              <Square size={14} />
            )}
            <span>{isAllFilteredSelected ? '取消全选' : '全选所有好友'}</span>
          </button>

          <span className="text-[11px] text-[#65676B] dark:text-zinc-400">
            已选择{' '}
            <strong className="text-[#1877F2] font-black">
              {selectedFriendIds.length}
            </strong>{' '}
            位好友
          </span>
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#F0F2F5] dark:divide-zinc-800">
        {filteredFriends.length === 0 ? (
          <div className="p-8 text-center text-[#8A8D91] text-xs">
            <Users size={32} className="mx-auto mb-2 opacity-40 text-[#1877F2]" />
            <p>未找到符合条件的好友</p>
          </div>
        ) : (
          filteredFriends.map((f) => {
            const isSelected = selectedFriendIds.includes(f.id);
            return (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                onClick={() => handleToggleFriend(f.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleToggleFriend(f.id)}
                className={`p-3 flex items-center justify-between hover:bg-[#F0F2F5]/60 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <img
                      src={f.avatar}
                      alt={f.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB] dark:border-zinc-700"
                    />
                    {f.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-xs text-[#050505] dark:text-[#E4E6EB] truncate">
                        {f.name}
                      </span>
                      {f.relationship && (
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-[#E7F3FF] dark:bg-blue-950/40 text-[#1877F2] font-bold border border-[#1877F2]/20 shrink-0">
                          {f.relationship}
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-[#65676B] dark:text-zinc-400 truncate mt-0.5">
                      {f.locationName ? `📍 ${f.locationName}` : f.statusText || '在线'}
                      {f.distance ? ` · ${f.distance}` : ''}
                    </p>
                  </div>
                </div>

                {/* Straight-edge Facebook Style Checkbox */}
                <div
                  className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all shrink-0 ml-2 ${
                    isSelected
                      ? 'bg-[#1877F2] border-[#1877F2] text-white shadow-xs'
                      : 'border-[#CED0D4] dark:border-zinc-600 bg-white dark:bg-zinc-800'
                  }`}
                >
                  {isSelected && <Check size={13} className="stroke-[3]" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Floating Bar */}
      <div className="p-3 bg-white dark:bg-[#242526] border-t border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0 shadow-lg">
        <div className="text-xs text-[#65676B] dark:text-zinc-400">
          已选：
          <span className="font-extrabold text-[#1877F2]">
            {selectedFriendIds.length}
          </span>{' '}
          人
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={selectedFriendIds.length === 0 || isSending}
          className={`flex-1 max-w-[200px] py-2 px-4 rounded-md font-bold text-xs flex items-center justify-center space-x-1.5 shadow-2xs transition-all ${
            selectedFriendIds.length === 0 || isSending
              ? 'bg-[#E4E6EB] dark:bg-zinc-800 text-[#8A8D91] cursor-not-allowed opacity-60'
              : 'bg-[#1877F2] hover:bg-[#166FE5] text-white cursor-pointer active:scale-98'
          }`}
        >
          <Send size={13} />
          <span>
            {isSending
              ? '正在发送...'
              : `发送分享 (${selectedFriendIds.length})`}
          </span>
        </button>
      </div>
    </div>
  );
};
