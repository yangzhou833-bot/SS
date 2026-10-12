import React, { useState } from 'react';
import { X, Heart, MessageCircle, Share2, MapPin, Music, Send } from 'lucide-react';

export interface InstagramVideoData {
  id: string;
  videoUrl: string;
  authorName: string;
  authorAvatar: string;
  caption: string;
  location: string;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
}

interface InstagramVideoModalProps {
  isOpen: boolean;
  story: InstagramVideoData | null;
  onClose: () => void;
  onLike?: (id: string) => void;
  onComment?: (id: string, text: string) => void;
  showToast?: (msg: string) => void;
}

export const InstagramVideoModal: React.FC<InstagramVideoModalProps> = ({
  isOpen,
  story,
  onClose,
  onLike,
  onComment,
  showToast,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [likes, setLikes] = useState(story?.likesCount || 128);
  const [isLiked, setIsLiked] = useState(story?.isLiked || false);
  const [comments, setComments] = useState<Array<{ id: string; authorName: string; authorAvatar: string; text: string }>>([
    { id: 'c1', authorName: 'Sarah Chen', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', text: '这个快拍太酷了吧！📍' },
    { id: 'c2', authorName: 'Alex Mercer', authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', text: '坐标在哪里呀，我也想去打卡🔥' },
  ]);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);

  if (!isOpen || !story) return null;

  const handleLikeClick = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
      if (showToast) showToast('已点赞该快拍 ❤️');
    }
    if (onLike) onLike(story.id);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newComment = {
      id: `comment-${Date.now()}`,
      authorName: '我',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      text: commentInput.trim(),
    };
    setComments((prev) => [newComment, ...prev]);
    if (onComment) onComment(story.id, commentInput.trim());
    setCommentInput('');
    if (showToast) showToast('评论发送成功 💬');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between font-sans select-none animate-in fade-in duration-200 overflow-hidden">
      {/* Background Video (Fullscreen IG style) */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <video
          src={story.videoUrl}
          autoPlay
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Subtle Dark Vignette / Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />
      </div>

      {/* Top Header */}
      <div className="relative z-20 px-5 pt-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <img
            src={story.authorAvatar}
            alt={story.authorName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1877F2] shadow-md"
          />
          <div>
            <div className="text-xs font-black tracking-tight flex items-center space-x-1.5">
              <span>{story.authorName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-[10px] text-gray-300 flex items-center space-x-1">
              <MapPin size={10} className="text-rose-400" />
              <span className="truncate max-w-[160px]">{story.location}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer"
          title="关闭"
        >
          <X size={18} />
        </button>
      </div>

      {/* Bottom Content & Instagram Style Right Action Stack */}
      <div className="relative z-20 p-5 flex items-end justify-between">
        {/* Left: Caption & Music */}
        <div className="space-y-2 max-w-[70%]">
          <div className="flex items-center space-x-1 text-white/90 text-xs font-medium bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full w-fit">
            <Music size={11} className="text-pink-400 animate-spin" />
            <span className="truncate">原声 - {story.authorName} 的快拍</span>
          </div>
          <p className="text-xs text-white font-normal drop-shadow-md leading-relaxed">
            {story.caption || '记录此刻的美好与灵感瞬间 🌟'}
          </p>
        </div>

        {/* Right: Instagram Style Action Buttons Stack (Like, Comment, Share) */}
        <div className="flex flex-col items-center space-y-4">
          {/* Like Button */}
          <button
            onClick={handleLikeClick}
            className="flex flex-col items-center group cursor-pointer"
            title="点赞"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-transform group-hover:scale-110 shadow-lg ${isLiked ? 'bg-rose-500 text-white' : 'bg-black/40 text-white'}`}>
              <Heart size={22} className={isLiked ? 'fill-white stroke-rose-500' : ''} />
            </div>
            <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">{likes}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowCommentsDrawer(true)}
            className="flex flex-col items-center group cursor-pointer"
            title="评论"
          >
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 shadow-lg transition-transform">
              <MessageCircle size={22} />
            </div>
            <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">{comments.length}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => {
              if (showToast) showToast('快拍链接已复制，分享给好友吧！ ✈️');
            }}
            className="flex flex-col items-center group cursor-pointer"
            title="分享"
          >
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 shadow-lg transition-transform">
              <Share2 size={20} />
            </div>
            <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">分享</span>
          </button>
        </div>
      </div>

      {/* Comments Drawer (if opened) */}
      {showCommentsDrawer && (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-[#121212]/95 backdrop-blur-2xl rounded-t-3xl border-t border-white/10 p-4 max-h-[60vh] flex flex-col animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-black text-white">评论 ({comments.length})</span>
            <button
              onClick={() => setShowCommentsDrawer(false)}
              className="text-gray-400 hover:text-white p-1 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start space-x-2.5">
                <img src={c.authorAvatar} alt={c.authorName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-gray-300">{c.authorName}</div>
                  <div className="text-xs text-white">{c.text}</div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendComment} className="pt-2 flex items-center space-x-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="说点什么..."
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 rounded-full bg-[#1877F2] text-white hover:bg-[#166fe5] cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
