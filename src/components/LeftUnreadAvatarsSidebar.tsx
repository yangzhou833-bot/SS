import React, { useState } from 'react';
import { Heart, X, Send, MessageCircle } from 'lucide-react';

export interface UnreadFriendMessage {
  friendId: string;
  friendName: string;
  avatar: string;
  messageText: string;
  emojis?: string;
  unreadCount: number;
  batteryLevel: number;
  likesCount?: number;
  locationName?: string;
}

interface LeftUnreadAvatarsSidebarProps {
  unreadMessages: UnreadFriendMessage[];
  activeFriendId: string | null;
  onSelectFriend: (friendId: string | null) => void;
  onSendQuickReply?: (friendId: string, replyText: string) => void;
  className?: string;
}

export const LeftUnreadAvatarsSidebar: React.FC<LeftUnreadAvatarsSidebarProps> = ({
  unreadMessages,
  activeFriendId,
  onSelectFriend,
  onSendQuickReply,
  className = '',
}) => {
  const [isStacked, setIsStacked] = useState<boolean>(true);
  const [replyInput, setReplyInput] = useState<string>('');
  const [likesMap, setLikesMap] = useState<Record<string, { count: number; liked: boolean }>>({
    f1: { count: 3, liked: false },
    f2: { count: 2, liked: false },
    f5: { count: 5, liked: false },
    'fam-2': { count: 8, liked: false },
  });

  const handleLike = (e: React.MouseEvent, friendId: string) => {
    e.stopPropagation();
    setLikesMap((prev) => {
      const current = prev[friendId] || { count: 3, liked: false };
      return {
        ...prev,
        [friendId]: {
          count: current.liked ? current.count - 1 : current.count + 1,
          liked: !current.liked,
        },
      };
    });
  };

  const activeFriend = unreadMessages.find((m) => m.friendId === activeFriendId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeFriendId) return;
    if (onSendQuickReply) {
      onSendQuickReply(activeFriendId, replyInput.trim());
    }
    setReplyInput('');
  };

  return (
    <aside
      aria-label="未读消息好友侧边栏"
      className={`absolute top-20 left-2.5 z-35 flex flex-col items-start select-none pointer-events-auto ${className}`}
    >
      <style>{`
        @keyframes appleMapSpringLeft {
          0% {
            opacity: 0;
            transform: translate3d(-12px, 0, 0) scale(0.4);
          }
          65% {
            opacity: 1;
            transform: translate3d(4px, 0, 0) scale(1.04);
          }
          85% {
            transform: translate3d(-1px, 0, 0) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        .apple-spring-sidebar {
          will-change: transform, opacity;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
      `}</style>

      {/* STACKED MODE TOGGLE BUTTON / EXPANDED LIST */}
      {isStacked ? (
        /* 1. 头像堆叠 模式 (Avatar Stack Pile) */
        <div className="relative group flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsStacked(false)}
            className="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
            title="点击展开好友头像"
          >
            {/* Overlapping Stacked Avatars */}
            <div className="relative w-12 h-16 flex flex-col items-center">
              {unreadMessages.slice(0, 3).map((item, index) => (
                <div
                  key={`stack-${item.friendId}-${index}`}
                  style={{
                    top: `${index * 10}px`,
                    zIndex: 30 - index,
                    scale: `${1 - index * 0.08}`,
                  }}
                  className="absolute w-11 h-11 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-100 transition-all"
                >
                  <img src={item.avatar} alt={item.friendName} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Combined Unread Total Badge */}
            <div className="absolute -top-1 -right-1 z-40 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
              {unreadMessages.reduce((sum, m) => sum + m.unreadCount, 0)}
            </div>

            <span className="mt-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-xs">
              展开
            </span>
          </button>
        </div>
      ) : (
        /* 2. 点击后展开 纵向排列 (Expanded Vertical List) */
        <div className="flex flex-col items-start space-y-3.5">
          {/* Stack Collapse Button Header */}
          <button
            type="button"
            onClick={() => {
              setIsStacked(true);
              onSelectFriend(null);
            }}
            className="text-[10px] font-bold text-gray-500 hover:text-gray-900 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-xs border border-gray-200 cursor-pointer mb-1 transition-transform hover:scale-105"
            title="收起头像堆叠"
          >
            ▲ 收起堆叠
          </button>

          {unreadMessages.map((item, index) => {
            const isOpen = activeFriendId === item.friendId;
            const likeInfo = likesMap[item.friendId] || { count: item.likesCount || 3, liked: false };

            return (
              <div key={`expanded-${item.friendId}-${index}`} className="relative flex items-center group">
                {/* Avatar Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isOpen) {
                      onSelectFriend(null);
                    } else {
                      onSelectFriend(item.friendId);
                    }
                  }}
                  className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none shrink-0"
                  title={`点击查看 ${item.friendName} 的动态`}
                >
                  <div
                    className={`relative w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden bg-gray-100 transition-all ${
                      isOpen ? 'ring-3 ring-[#1877F2] scale-105' : 'hover:ring-2 hover:ring-blue-300'
                    }`}
                  >
                    <img src={item.avatar} alt={item.friendName} className="w-full h-full object-cover" />
                  </div>

                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-xs border border-emerald-500/80 rounded-full px-1 py-[0.5px] shadow-xs flex items-center space-x-0.5 min-w-[28px] justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8.5px] font-mono font-extrabold text-emerald-950 leading-none">
                      {item.batteryLevel}%
                    </span>
                  </div>

                  {!isOpen && item.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 z-30 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                      {item.unreadCount}
                    </div>
                  )}
                </button>

                {/* Expanded Speech Bubble (No large card, clean popover) */}
                {isOpen && (
                  <div
                    style={{
                      animation: 'appleMapSpringLeft 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                      transformOrigin: 'left center',
                    }}
                    className="absolute left-15 top-1/2 -translate-y-1/2 z-40 bg-[#FFFFFF] text-[#050505] min-w-[160px] max-w-[240px] px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-start text-left"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFriend(null);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-900/80 hover:bg-black text-white flex items-center justify-center text-xs shadow-md transition-transform hover:scale-110 cursor-pointer z-50"
                      title="关闭"
                    >
                      <X size={12} />
                    </button>

                    <div className="absolute -left-[10px] top-1/2 -translate-y-1/2 flex items-center z-10 pointer-events-none">
                      <svg
                        width="11"
                        height="20"
                        viewBox="0 0 11 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        shapeRendering="geometricPrecision"
                        className="text-white drop-shadow-[-2px_0_3px_rgba(0,0,0,0.03)]"
                      >
                        <path
                          d="M11 0C4.925 0 0 4.477 0 10C0 15.523 4.925 20 11 20V0Z"
                          fill="#FFFFFF"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </div>

                    <span className="text-xs font-black text-gray-900 mb-0.5 truncate">{item.friendName}</span>
                    <p className="text-xs font-semibold text-[#1c1e21] leading-relaxed break-words whitespace-pre-wrap">
                      {item.messageText}
                    </p>

                    <div className="mt-2 pt-1.5 border-t border-gray-100/80 w-full flex items-center justify-between text-xs">
                      {item.emojis && <span className="text-sm select-none tracking-wider">{item.emojis}</span>}
                      <button
                        type="button"
                        onClick={(e) => handleLike(e, item.friendId)}
                        className={`ml-auto flex items-center space-x-1 px-2 py-0.5 rounded-full border text-[10px] font-bold transition-transform hover:scale-105 cursor-pointer ${
                          likeInfo.liked
                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-rose-50'
                        }`}
                      >
                        <Heart size={11} className={likeInfo.liked ? 'fill-rose-500 text-rose-500' : ''} />
                        <span>{likeInfo.count}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 快捷回复栏窗口 (Quick Reply Window Displayed at Bottom) */}
      {/* ========================================================================= */}
      {activeFriend && (
        <div className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto bg-[#FFFFFF]/98 backdrop-blur-xl border border-gray-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.14)] rounded-2xl p-3 flex flex-col space-y-2 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-gray-800">
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#1877F2] animate-pulse" />
              <span>快捷回复 {activeFriend.friendName}</span>
            </div>
            <button
              type="button"
              onClick={() => onSelectFriend(null)}
              className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendReply} className="flex items-center space-x-2">
            <input
              type="text"
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder={`发消息给 ${activeFriend.friendName.split(' ')[0]}...`}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-100 rounded-full outline-none focus:ring-1 focus:ring-[#1877F2] text-gray-900 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={!replyInput.trim()}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                replyInput.trim()
                  ? 'bg-[#1877F2] text-white shadow-xs hover:bg-[#166fe5]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={13} className="ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
};
