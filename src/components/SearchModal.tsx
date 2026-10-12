import React, { useState } from 'react';
import { useDialogFocus } from '../utils/useDialogFocus';
import { X, Search, MapPin, Sparkles, Navigation, ShieldCheck } from 'lucide-react';
import { Friend } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  onSelectFriend?: (friend: Friend) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, friends, onSelectFriend }) => {
  const [query, setQuery] = useState('');
  const dialog = useDialogFocus(isOpen, onClose);

  if (!isOpen) return null;

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      (f.locationName && f.locationName.toLowerCase().includes(query.toLowerCase())) ||
      (f.status && f.status.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (friend: Friend) => {
    if (onSelectFriend) {
      onSelectFriend(friend);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div ref={dialog} role="dialog" aria-modal="true" aria-label="搜索好友" tabIndex={-1} className="relative w-full max-h-[calc(100dvh-96px)] max-w-[360px] bg-white border border-[#E4E6EB] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in slide-in-from-top-2 duration-200">
        {/* Search Input Header */}
        <div className="p-3 shrink-0 border-b border-[#E4E6EB] flex items-center space-x-2 bg-white">
          <Search size={18} className="text-[#1877F2] ml-1 shrink-0" />
          <input
            type="text"
            aria-label="搜索好友姓名、地点或状态"
            placeholder="输入好友姓名快速查找并定位..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 min-w-0 min-h-11 bg-transparent text-base font-medium text-[#050505] placeholder-[#65676B] outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229 && filteredFriends.length > 0) {
                handleSelect(filteredFriends[0]);
              } else if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
              }
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#65676B] hover:text-[#050505] text-xs font-bold px-2 min-h-11"
            >
              清空
            </button>
          )}
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-[#65676B] cursor-pointer transition-all active:scale-95 shrink-0"
            aria-label="关闭搜索"
          >
            <X size={15} />
          </button>
        </div>

        {/* Quick Suggestions / Filter Chips */}
        <div className="px-3 py-1.5 shrink-0 bg-[#F0F2F5]/60 border-b border-[#E4E6EB] flex items-center space-x-1.5 overflow-x-auto scrollbar-none text-[10px] text-[#65676B]">
          <span className="font-bold shrink-0">快捷建议:</span>
          {friends.slice(0, 4).map((f) => (
            <button
              key={f.id}
              onClick={() => setQuery(f.name)}
              className="px-2 py-0.5 min-h-11 rounded-full bg-white hover:bg-[#E4E6EB] border border-[#E4E6EB] text-[#050505] font-semibold whitespace-nowrap cursor-pointer transition-all"
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[10px] font-black text-[#65676B] uppercase tracking-wider flex items-center justify-between">
            <span>好友与全域看护目标 ({filteredFriends.length})</span>
            <span className="text-[9px] text-[#1877F2] font-semibold">点击跳转并锁定位置</span>
          </div>

          {filteredFriends.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#65676B] space-y-1">
              <p>未找到与 "{query}" 匹配的好友</p>
              <p className="text-[10px] text-gray-400">请尝试搜索其它姓名如 "Sarah"、"Mia"、"爸爸"</p>
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <div
                key={friend.id}
                role="button" tabIndex={0} aria-label={`定位好友 ${friend.name}`}
                onKeyDown={event => { if (event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) { event.preventDefault(); handleSelect(friend); } }}
                onClick={() => handleSelect(friend)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-[#F0F2F5] active:bg-[#E4E6EB] border border-transparent hover:border-[#E4E6EB] transition-all cursor-pointer group"
              >
                <div className="relative shrink-0">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E4E6EB] group-hover:ring-[#1877F2] transition-all"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      friend.status === 'offline' ? 'bg-gray-400' : 'bg-emerald-500'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#050505] truncate flex items-center gap-1">
                      <span>{friend.name}</span>
                      {friend.isCloseFriend && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1 rounded">
                          密友
                        </span>
                      )}
                      {(friend.isFamily || friend.id.startsWith('fam-')) && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1 rounded flex items-center gap-0.5">
                          <ShieldCheck size={10} />
                          家人
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-[#1877F2] font-black">{friend.distance}</span>
                  </div>
                  <p className="text-[10.5px] text-[#65676B] truncate flex items-center space-x-1 mt-0.5">
                    <MapPin size={11} className="text-[#1877F2] shrink-0" />
                    <span>{friend.locationName || '兰州市城关区'}</span>
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(friend);
                  }}
                  className="px-2.5 py-1 min-h-11 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-[10.5px] font-bold flex items-center space-x-1 shadow-2xs transition-all active:scale-95 shrink-0"
                >
                  <Navigation size={11} />
                  <span>锁定</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Scanner Button */}
        <div className="p-2 shrink-0 bg-[#F0F2F5]/80 border-t border-[#E4E6EB]">
          <button
            onClick={() => {
              if (filteredFriends.length > 0) {
                handleSelect(filteredFriends[0]);
              }
            }}
            disabled={filteredFriends.length === 0}
            className="w-full min-h-11 py-2 bg-white disabled:opacity-45 disabled:cursor-not-allowed hover:bg-[#F0F2F5] text-[#1877F2] border border-[#E4E6EB] rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-98 shadow-2xs"
          >
            <Sparkles size={14} />
            <span>全域地图雷达定位</span>
          </button>
        </div>
      </div>
    </div>
  );
};
