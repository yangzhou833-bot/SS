import React, { useState, useEffect } from 'react';
import { SimulatedMapActivity } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

export interface FloatingActivityVibesProps {
  activity: SimulatedMapActivity | null;
  onSelectActivity?: (activity: SimulatedMapActivity) => void;
  className?: string;
}

interface FloatingVibeItem {
  id: string;
  side: 'left' | 'right';
  emoji: string;
  text?: string;
  leftOffset: number; // percentage or px
  bottomOffset: number;
  duration: number;
  delay: number;
  size: number;
}

export const FloatingActivityVibes: React.FC<FloatingActivityVibesProps> = ({
  activity,
  onSelectActivity,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [poppedIds, setPoppedIds] = useState<Set<string>>(new Set());
  const [vibeScore, setVibeScore] = useState(88);
  const [floatingItems, setFloatingItems] = useState<FloatingVibeItem[]>([]);

  // Generate dynamic contextual floating items based on active activity category
  useEffect(() => {
    if (!activity) {
      setFloatingItems([]);
      return;
    }

    const arrivedFriends = activity.participants?.filter((p) => p.status === 'arrived') || [];
    const movingFriends = activity.participants?.filter((p) => p.status === 'on_the_way' || p.status === 'departed') || [];

    const category = activity.category || '聚会';
    const isSports = category.includes('运动') || category.includes('足球') || category.includes('骑行');
    const isCamping = category.includes('露营') || category.includes('户外');
    const isFoodOrCafe = category.includes('咖啡') || category.includes('美食');

    const emojiPool = isSports
      ? ['⚽', '🏃', '🔥', '🏆', '🥇', '⚡', '🎉', '🥤']
      : isCamping
      ? ['⛺', '🌲', '🔥', '🌌', '🍢', '🍻', '🎈', '✨']
      : isFoodOrCafe
      ? ['☕', '🍰', '🍕', '✨', '📖', '🥂', '🎉', '🧁']
      : ['🎈', '🎉', '🍻', '🍕', '🎵', '🕺', '🔥', '✨', '💃', '🥂'];

    const tagPool = [
      `🔥 ${activity.title.split('·')[0].slice(0, 8)}`,
      `🎉 ${arrivedFriends.length}人已到场汇合`,
      movingFriends[0] ? `🚗 ${movingFriends[0].name.split(' ')[0]} ${movingFriends[0].speedKmh || 40}km/h 赶来` : `✨ 实时聚合中`,
      `⚡ 热度 +${vibeScore}`,
      `🎈 正在进行`,
      `🥂 现场打卡`,
    ];

    const items: FloatingVibeItem[] = [];

    // Left stream (3 to 5 floating items)
    for (let i = 0; i < 4; i++) {
      items.push({
        id: `left-${i}-${Date.now()}`,
        side: 'left',
        emoji: emojiPool[i % emojiPool.length],
        text: i % 2 === 1 ? tagPool[i % tagPool.length] : undefined,
        leftOffset: 12 + (i % 3) * 6,
        bottomOffset: 120 + i * 90,
        duration: 4.5 + (i % 3) * 0.8,
        delay: i * 0.9,
        size: i % 2 === 0 ? 28 : 22,
      });
    }

    // Right stream (3 to 5 floating items)
    for (let i = 0; i < 4; i++) {
      items.push({
        id: `right-${i}-${Date.now()}`,
        side: 'right',
        emoji: emojiPool[(i + 3) % emojiPool.length],
        text: i % 2 === 0 ? tagPool[(i + 2) % tagPool.length] : undefined,
        leftOffset: 12 + (i % 3) * 6,
        bottomOffset: 140 + i * 95,
        duration: 4.8 + (i % 3) * 0.7,
        delay: i * 1.1 + 0.4,
        size: i % 2 === 1 ? 30 : 24,
      });
    }

    setFloatingItems(items);
  }, [activity, vibeScore]);

  if (!activity || !isVisible) {
    return (
      <div className={`fixed bottom-24 right-3 z-35 pointer-events-auto ${className}`}>
        {activity && (
          <button
            type="button"
            onClick={() => {
              haptics.trigger('light');
              soundEffects.playTapSound();
              setIsVisible(true);
            }}
            className="px-2.5 py-1.5 bg-white/90 backdrop-blur-md rounded-md border border-[#E4E6EB] shadow-xs text-[10px] font-bold text-[#1877F2] flex items-center gap-1 hover:bg-blue-50 transition-all cursor-pointer"
            title="展开活动现场飘动氛围"
          >
            <Sparkles size={12} className="text-amber-500 animate-spin-slow" />
            <span>开启活动氛围</span>
          </button>
        )}
      </div>
    );
  }

  const handlePopVibe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.trigger('light');
    soundEffects.playTapSound();
    setPoppedIds((prev) => new Set([...prev, id]));
    setVibeScore((prev) => prev + 1);
  };

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-35 overflow-hidden select-none ${className}`}
      aria-label="活动实时氛围表情流"
    >
      {/* 顶部活动氛围热度小浮标 (Facebook 直角线框风格) */}
      <div className="absolute top-18 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2">
        <div
          onClick={() => onSelectActivity?.(activity)}
          className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-md border border-[#E4E6EB] shadow-2xs flex items-center gap-2 cursor-pointer hover:border-[#1877F2] transition-all group"
          title={`查看当前活动「${activity.title}」`}
        >
          <span className="text-sm">{activity.icon}</span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-[#050505] truncate max-w-[120px]">
                {activity.title.split('·')[0]}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            </div>
            <span className="text-[8.5px] font-semibold text-[#1877F2]">
              🔥 活动进行中 · 氛围热度 {vibeScore}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              haptics.trigger('light');
              soundEffects.playTapSound();
              setIsVisible(false);
            }}
            className="ml-1 p-0.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            title="关闭氛围飘动"
          >
            <EyeOff size={11} />
          </button>
        </div>
      </div>

      {/* 左侧活动符号与表情飘动流 */}
      <div className="absolute left-2 sm:left-4 inset-y-0 w-28 pointer-events-none">
        {floatingItems
          .filter((item) => item.side === 'left' && !poppedIds.has(item.id))
          .map((item) => (
            <div
              key={`left-vibe-${item.id}`}
              onClick={(e) => handlePopVibe(item.id, e)}
              className="absolute pointer-events-auto cursor-pointer animate-float-stream-left hover:scale-125 transition-transform"
              style={{
                bottom: `${item.bottomOffset}px`,
                left: `${item.leftOffset}px`,
                animationDuration: `${item.duration}s`,
                animationDelay: `${item.delay}s`,
              }}
              title="点击互动升温"
            >
              {item.text ? (
                <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-[#E4E6EB] shadow-xs flex items-center gap-1.5 text-[10px] font-bold text-gray-800 whitespace-nowrap hover:border-[#1877F2] active:scale-95 transition-all">
                  <span className="text-sm">{item.emoji}</span>
                  <span className="text-[9px]">{item.text}</span>
                </div>
              ) : (
                <div
                  className="filter drop-shadow-md active:scale-90 transition-transform flex items-center justify-center"
                  style={{ fontSize: `${item.size}px` }}
                >
                  {item.emoji}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* 右侧活动符号与表情飘动流 */}
      <div className="absolute right-2 sm:right-4 inset-y-0 w-28 pointer-events-none">
        {floatingItems
          .filter((item) => item.side === 'right' && !poppedIds.has(item.id))
          .map((item) => (
            <div
              key={`right-vibe-${item.id}`}
              onClick={(e) => handlePopVibe(item.id, e)}
              className="absolute pointer-events-auto cursor-pointer animate-float-stream-right hover:scale-125 transition-transform"
              style={{
                bottom: `${item.bottomOffset}px`,
                right: `${item.leftOffset}px`,
                animationDuration: `${item.duration}s`,
                animationDelay: `${item.delay}s`,
              }}
              title="点击互动升温"
            >
              {item.text ? (
                <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-[#E4E6EB] shadow-xs flex items-center gap-1.5 text-[10px] font-bold text-gray-800 whitespace-nowrap hover:border-[#1877F2] active:scale-95 transition-all">
                  <span className="text-sm">{item.emoji}</span>
                  <span className="text-[9px]">{item.text}</span>
                </div>
              ) : (
                <div
                  className="filter drop-shadow-md active:scale-90 transition-transform flex items-center justify-center"
                  style={{ fontSize: `${item.size}px` }}
                >
                  {item.emoji}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
