import React, { useState } from 'react';
import { Friend, LifePlace, LifePlaceShareTarget } from '../types';
import { lifeLayerStore, LIFE_PLACE_CATEGORIES } from '../data/lifeLayerStore';
import {
  X,
  Search,
  Check,
  Share2,
  Lock,
  Eye,
  Camera,
  Flame,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Send,
  MapPin,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';

interface PlaceForwardModalProps {
  place: LifePlace;
  friends: Friend[];
  onClose: () => void;
  onForwardComplete?: (targets: LifePlaceShareTarget[]) => void;
  showToast?: (msg: string) => void;
}

export const PlaceForwardModal: React.FC<PlaceForwardModalProps> = ({
  place,
  friends,
  onClose,
  onForwardComplete,
  showToast,
}) => {
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shareMode, setShareMode] = useState<'send_once' | 'added_to_map'>('added_to_map');
  
  // Data Scope Toggles
  const [shareVisitCount, setShareVisitCount] = useState(true);
  const [sharePhotos, setSharePhotos] = useState(true);
  const [shareEncounters, setShareEncounters] = useState(false); // DEFAULT OFF FOR PRIVACY!
  const [shareNotes, setShareNotes] = useState(true);

  // Frequent places for quick shortcut
  const allPlaces = lifeLayerStore.getPlaces();
  const frequentPlaces = allPlaces.slice(0, 4);
  const [activePlace, setActivePlace] = useState<LifePlace>(place);

  const toggleFriend = (id: string) => {
    haptics.trigger('light');
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFriends = friends.filter((f) => {
    if (f.id === 'me') return false;
    const q = searchQuery.toLowerCase();
    return f.name.toLowerCase().includes(q) || (f.locationName && f.locationName.toLowerCase().includes(q));
  });

  const handleSend = () => {
    if (selectedFriendIds.length === 0) {
      if (showToast) showToast('请至少选择一位好友');
      return;
    }

    const now = new Date().toISOString();
    const targets: LifePlaceShareTarget[] = selectedFriendIds.map((id) => {
      const f = friends.find((item) => item.id === id);
      return {
        userId: id,
        userName: f?.name || '好友',
        avatar: f?.avatar,
        mode: shareMode,
        shareVisitCount,
        sharePhotos,
        shareEncounters,
        shareNotes,
        at: now,
      };
    });

    lifeLayerStore.forwardPlace(activePlace.id, targets);

    haptics.trigger('medium');
    soundEffects.playSuccessSound();
    if (showToast) {
      showToast(
        shareMode === 'added_to_map'
          ? `🗺️ 已将「${activePlace.name}」导入至 ${selectedFriendIds.length} 位好友的生活图层！`
          : `💬 已通过聊天卡片将「${activePlace.name}」发送给 ${selectedFriendIds.length} 位好友！`
      );
    }
    if (onForwardComplete) onForwardComplete(targets);
    onClose();
  };

  const categoryMeta = LIFE_PLACE_CATEGORIES.find((c) => c.key === activePlace.category) || LIFE_PLACE_CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none font-sans">
      <div className="bg-white border border-[#E4E6EB] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-3.5 border-b border-[#F0F2F5] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E7F3FF] border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2]">
              <Share2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1E21]">转发与分享地点 (Forward Place)</h3>
              <p className="text-[10px] text-[#65676B]">让好友在他们的生活图层中同步发现你的宝藏地点</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#F0F2F5] text-[#8A8D91] hover:text-[#1C1E21] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Quick Frequent Places Shortcut */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-bold text-[#65676B]">我的常去地点快捷切换：</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {frequentPlaces.map((fp) => (
                <button
                  key={fp.id}
                  type="button"
                  onClick={() => setActivePlace(fp)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer transition-all ${
                    activePlace.id === fp.id
                      ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2] shadow-2xs'
                      : 'bg-[#F7F8FA] border-[#E4E6EB] text-[#1C1E21] hover:bg-[#EDF2F7]'
                  }`}
                >
                  <span>{fp.icon}</span>
                  <span className="truncate max-w-[110px]">{fp.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Place Preview Card */}
          <div className="p-3 bg-[#F7F8FA] border border-[#E4E6EB] rounded-xl space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 shadow-2xs"
                  style={{ backgroundColor: `${activePlace.color}25` }}
                >
                  {activePlace.icon}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#1C1E21] truncate">{activePlace.name}</h4>
                  <span className="text-[10px] text-[#65676B]">
                    {categoryMeta.label} · 打卡 {activePlace.memory.visitCount} 次 · 均留 {activePlace.memory.avgStayMinutes}min
                  </span>
                </div>
              </div>

              {activePlace.distanceKm !== undefined && (
                <span className="text-[10px] font-mono text-[#1877F2] font-bold shrink-0">
                  {activePlace.distanceKm} km · {activePlace.direction}
                </span>
              )}
            </div>

            {activePlace.note && (
              <p className="text-[11px] text-[#65676B] italic bg-white p-2 rounded-md border border-[#E4E6EB] line-clamp-2">
                “{activePlace.note}”
              </p>
            )}
          </div>

          {/* Share Mode Switch */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#1C1E21]">发送方式：</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShareMode('added_to_map')}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between cursor-pointer transition-all ${
                  shareMode === 'added_to_map'
                    ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2]'
                    : 'bg-[#F7F8FA] border-[#E4E6EB] text-[#65676B] hover:bg-[#EDF2F7]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold">加入对方生活图层</span>
                  {shareMode === 'added_to_map' && <Check size={14} />}
                </div>
                <span className="text-[9.5px] leading-tight opacity-85">
                  对方地图上直接渲染该地点（带你的微标）
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShareMode('send_once')}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between cursor-pointer transition-all ${
                  shareMode === 'send_once'
                    ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2]'
                    : 'bg-[#F7F8FA] border-[#E4E6EB] text-[#65676B] hover:bg-[#EDF2F7]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold">单次聊天卡片</span>
                  {shareMode === 'send_once' && <Check size={14} />}
                </div>
                <span className="text-[9.5px] leading-tight opacity-85">
                  仅在私聊对话框中发送地点预览卡片
                </span>
              </button>
            </div>
          </div>

          {/* Data Scope Toggles (Privacy-first) */}
          <div className="p-3 bg-white border border-[#E4E6EB] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1C1E21] flex items-center gap-1">
                <ShieldCheck size={13} className="text-[#1877F2]" />
                <span>包含的数据范围 (Data Scope Toggles)</span>
              </span>
              <span className="text-[9.5px] text-[#8A8D91]">隐私安全可控</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center justify-between p-2 rounded-md bg-[#F7F8FA] border border-[#E4E6EB] cursor-pointer">
                <span className="text-[11px] font-medium text-[#1C1E21]">到访次数及均留</span>
                <input
                  type="checkbox"
                  checked={shareVisitCount}
                  onChange={(e) => setShareVisitCount(e.target.checked)}
                  className="accent-[#1877F2]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-md bg-[#F7F8FA] border border-[#E4E6EB] cursor-pointer">
                <span className="text-[11px] font-medium text-[#1C1E21]">地点照片墙</span>
                <input
                  type="checkbox"
                  checked={sharePhotos}
                  onChange={(e) => setSharePhotos(e.target.checked)}
                  className="accent-[#1877F2]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-md bg-[#F7F8FA] border border-[#E4E6EB] cursor-pointer">
                <span className="text-[11px] font-medium text-[#1C1E21]">心得笔记</span>
                <input
                  type="checkbox"
                  checked={shareNotes}
                  onChange={(e) => setShareNotes(e.target.checked)}
                  className="accent-[#1877F2]"
                />
              </label>

              {/* Encounter toggle - default OFF */}
              <label className="flex items-center justify-between p-2 rounded-md bg-amber-50/60 border border-amber-200 cursor-pointer">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-amber-900">共存相遇详情</span>
                  <span className="text-[8px] px-1 bg-amber-200 text-amber-900 rounded font-bold">保密</span>
                </div>
                <input
                  type="checkbox"
                  checked={shareEncounters}
                  onChange={(e) => setShareEncounters(e.target.checked)}
                  className="accent-[#1877F2]"
                />
              </label>
            </div>

            {!shareEncounters && (
              <p className="text-[10px] text-[#8A8D91] leading-tight">
                🔒 隐私保护：默认不分享曾在此处与哪些好友相遇的记录。
              </p>
            )}
          </div>

          {/* Select Friends Multi-select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1C1E21]">选择接收好友 ({selectedFriendIds.length} 人已选)：</span>
              {selectedFriendIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFriendIds([])}
                  className="text-[10px] text-[#1877F2] font-bold hover:underline"
                >
                  清空
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-[#8A8D91]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索好友昵称或位置..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#F0F2F5] border border-[#E4E6EB] focus:border-[#1877F2] rounded-lg text-xs outline-none"
              />
            </div>

            {/* Friends list */}
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {filteredFriends.map((friend) => {
                const isSelected = selectedFriendIds.includes(friend.id);
                return (
                  <div
                    key={friend.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleFriend(friend.id)}
                    onKeyDown={(e) => e.key === 'Enter' && toggleFriend(friend.id)}
                    className={`p-2 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#E7F3FF] border-[#1877F2]'
                        : 'bg-white hover:bg-[#F7F8FA] border-[#E4E6EB]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-7 h-7 rounded-full object-cover border border-[#E4E6EB] shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#1C1E21] truncate">{friend.name}</h4>
                        <span className="text-[10px] text-[#8A8D91] truncate block">
                          {friend.locationName || '附近在线'}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#1877F2] border-[#1877F2] text-white'
                          : 'border-[#CED0D4] bg-white'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#FAFBFD] border-t border-[#E4E6EB] shrink-0 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] font-bold text-xs rounded-md cursor-pointer"
          >
            取消
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={selectedFriendIds.length === 0}
            className={`px-5 py-2 font-bold text-xs rounded-md shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFriendIds.length > 0
                ? 'bg-[#1877F2] hover:bg-[#166FE5] text-white active:scale-95'
                : 'bg-[#CED0D4] text-[#8A8D91] cursor-not-allowed'
            }`}
          >
            <Send size={13} />
            <span>确认发送 ({selectedFriendIds.length})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
