import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle2, MessageSquare, AtSign, Check, RotateCcw } from 'lucide-react';
import { DocComment } from './types';

interface DocCommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comments: DocComment[];
  docTitle: string;
  onAddComment: (content: string) => void;
  onToggleResolve: (commentId: string) => void;
  showToast: (msg: string) => void;
}

export const DocCommentsDrawer: React.FC<DocCommentsDrawerProps> = ({
  isOpen,
  onClose,
  comments,
  docTitle,
  onAddComment,
  onToggleResolve,
  showToast,
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unresolved'>('all');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredComments = comments.filter((c) => (filterMode === 'unresolved' ? !c.resolved : true));

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText.trim());
    setNewCommentText('');
    showToast('💬 已提交评论');
  };

  const handleMention = (name: string) => {
    setNewCommentText((prev) => `${prev}@${name} `);
    setShowMentionMenu(false);
    inputRef.current?.focus();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="文档协同评论"
      className="fixed inset-0 z-[125] flex justify-end bg-black/40 backdrop-blur-[2px] transition-opacity"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-96 max-w-full bg-white h-full border-l border-[#E4E6EB] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E4E6EB] bg-[#FAFAFA] shrink-0">
          <div className="flex items-center space-x-2">
            <MessageSquare size={16} className="text-[#1877F2]" />
            <div>
              <h3 className="text-xs font-bold text-[#1C1E21] flex items-center space-x-1.5">
                <span>协作批注与讨论</span>
                <span className="px-1.5 py-0.2 text-[10px] bg-blue-50 text-[#1877F2] rounded-md font-semibold border border-[#1877F2]/20">
                  {comments.length}
                </span>
              </h3>
              <p className="text-[10px] text-[#65676B] line-clamp-1">{docTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭评论抽屉"
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#65676B] hover:text-[#1C1E21] hover:bg-[#E4E6EB] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#E4E6EB] bg-white text-xs shrink-0">
          <span className="text-[11px] text-[#65676B]">显示筛选：</span>
          <div className="inline-flex rounded-md border border-[#E4E6EB] p-0.5 bg-gray-50">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                filterMode === 'all'
                  ? 'bg-white text-[#1877F2] font-bold shadow-2xs border border-[#E4E6EB]'
                  : 'text-[#65676B] hover:text-[#1C1E21]'
              }`}
            >
              全部 ({comments.length})
            </button>
            <button
              onClick={() => setFilterMode('unresolved')}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                filterMode === 'unresolved'
                  ? 'bg-white text-[#1877F2] font-bold shadow-2xs border border-[#E4E6EB]'
                  : 'text-[#65676B] hover:text-[#1C1E21]'
              }`}
            >
              待解决 ({comments.filter((c) => !c.resolved).length})
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {filteredComments.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
              暂无匹配的讨论内容
            </div>
          ) : (
            filteredComments.map((c, idx) => (
              <div
                key={`comment-${c.id || idx}-${idx}`}
                className={`p-3 rounded-md border transition-all ${
                  c.resolved
                    ? 'bg-gray-50/70 border-dashed border-gray-200 opacity-75'
                    : 'bg-white border-[#E4E6EB] shadow-2xs hover:border-[#1877F2]/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={c.avatar}
                      alt={c.author}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover border border-[#E4E6EB]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#1C1E21]">{c.author}</span>
                      <span className="text-[10px] text-[#65676B] ml-2">{c.time}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onToggleResolve(c.id);
                      showToast(c.resolved ? '已重新激活评论' : '✅ 已将该评论标记为已解决');
                    }}
                    title={c.resolved ? '重新开启此讨论' : '标记为此问题已解决'}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors flex items-center space-x-1 ${
                      c.resolved
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-[#E4E6EB] hover:border-green-500 hover:text-green-600 text-[#65676B]'
                    }`}
                  >
                    {c.resolved ? (
                      <>
                        <RotateCcw size={10} />
                        <span>已解决</span>
                      </>
                    ) : (
                      <>
                        <Check size={10} />
                        <span>解决</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-2 text-xs text-[#1C1E21] leading-relaxed break-words">
                  {c.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-[#E4E6EB] bg-[#FAFAFA] shrink-0 relative">
          {showMentionMenu && (
            <div className="absolute bottom-full left-3 mb-1 bg-white border border-[#E4E6EB] rounded-md shadow-md p-1.5 text-xs w-48 z-10">
              <div className="text-[10px] text-gray-400 px-2 py-1">提及协作者 (@)</div>
              {['Sarah Chen', 'Alex Mercer', 'Lucas Zhao', 'Elena Rostova'].map((name, mIdx) => (
                <button
                  key={`mention-${name}-${mIdx}`}
                  type="button"
                  onClick={() => handleMention(name)}
                  className="w-full text-left px-2 py-1.5 hover:bg-blue-50 hover:text-[#1877F2] rounded-md transition-colors"
                >
                  @{name}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-2">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setShowMentionMenu((prev) => !prev)}
                className="p-1.5 text-gray-500 hover:text-[#1877F2] hover:bg-white border border-transparent hover:border-[#E4E6EB] rounded-md transition-colors"
                title="提及团队成员"
              >
                <AtSign size={14} />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="添加协作评论或输入 @ 提及成员..."
                className="flex-1 px-3 py-1.5 text-xs border border-[#E4E6EB] rounded-md bg-white text-[#1C1E21] focus:outline-none focus:border-[#1877F2]"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className={`p-1.5 rounded-md text-white transition-colors ${
                  newCommentText.trim()
                    ? 'bg-[#1877F2] hover:bg-[#166FE5] cursor-pointer'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                title="发送评论"
              >
                <Send size={13} />
              </button>
            </div>
            <div className="text-[10px] text-[#65676B] px-1">
              按 Enter 发送 · 原型演示数据
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
