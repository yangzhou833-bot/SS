import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Friend } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

export interface QuickFriendsLocationBarProps {
  friends: Friend[];
  selectedFriendId?: string | null;
  onSelectFriend: (friend: Friend) => void;
  onClose?: () => void;
  className?: string;
}

export const QuickFriendsLocationBar: React.FC<QuickFriendsLocationBarProps> = ({
  friends,
  selectedFriendId,
  onSelectFriend,
  onClose,
  className = '',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll selected avatar into view
  React.useEffect(() => {
    if (!selectedFriendId || !scrollContainerRef.current) return;
    const selectedEl = scrollContainerRef.current.querySelector<HTMLElement>(`[data-friend-id="${selectedFriendId}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedFriendId]);

  // Sort friends: online friends first, then by distance
  const sortedFriends = React.useMemo(() => {
    return [...friends].sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      const parseDist = (d?: string) => {
        if (!d) return 999999;
        if (d.includes('km')) return parseFloat(d) * 1000;
        if (d.includes('m')) return parseFloat(d);
        return 999999;
      };
      return parseDist(a.distance) - parseDist(b.distance);
    });
  }, [friends]);

  return (
    <div
      className={`relative z-30 select-none pointer-events-auto w-full flex items-center gap-2 ${className}`}
      aria-label="在线好友位置快捷查看"
    >
      {/* 水平可滑动头像与信息列表 (完全去除两端阴影遮罩) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sortedFriends.map((friend, idx) => {
          const isSelected = selectedFriendId === friend.id;
          return (
            <motion.button
              key={`qf-${friend.id || idx}-${idx}`}
              data-friend-id={friend.id}
              type="button"
              initial={{ opacity: 0, scale: 0.65, y: 8 }}
              animate={{ opacity: 1, scale: isSelected ? 1.05 : 1, y: 0 }}
              whileHover={{ scale: isSelected ? 1.08 : 1.03 }}
              whileTap={{ scale: 0.94 }}
              transition={{
                type: 'spring',
                stiffness: 440,
                damping: 24,
                mass: 0.8,
                delay: Math.min(idx * 0.045, 0.3),
              }}
              onClick={() => {
                haptics.trigger('light');
                soundEffects.playTapSound();
                onSelectFriend(friend);
              }}
              className={`flex flex-col items-center shrink-0 cursor-pointer group select-none ${
                isSelected ? '' : 'opacity-95 hover:opacity-100'
              }`}
              title={`定位好友「${friend.name}」（距离 ${friend.distance || '附近'}）`}
            >
              {/* 好友头像 */}
              <div className="relative w-11 h-11">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className={`w-full h-full object-cover rounded-full p-[1.5px] bg-white dark:bg-zinc-800 transition-all ${
                    isSelected
                      ? 'ring-2.5 ring-[#1877F2]'
                      : friend.isOnline
                      ? 'ring-2 ring-emerald-500 hover:ring-[#1877F2]'
                      : 'ring-1.5 ring-gray-300 dark:ring-zinc-600'
                  }`}
                />

                {/* 在线指示小绿点 */}
                {friend.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                )}
              </div>

              {/* 名称与距离 */}
              <div className="flex flex-col items-center mt-1 text-center max-w-[64px]">
                <span
                  className={`text-[11px] font-bold leading-tight truncate w-full ${
                    isSelected ? 'text-[#1877F2]' : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {friend.name.split(' ')[0]}
                </span>
                <span className="text-[9.5px] font-bold text-gray-700 dark:text-gray-300 leading-tight">
                  {friend.distance || '附近'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
