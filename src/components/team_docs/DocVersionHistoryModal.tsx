import React, { useEffect } from 'react';
import { X, History, RotateCcw, Clock, CheckCircle2, User } from 'lucide-react';
import { TeamDocItem, DocVersion } from './types';

interface DocVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: TeamDocItem;
  onRestoreVersion: (docId: string, version: DocVersion) => void;
  showToast: (msg: string) => void;
}

export const DocVersionHistoryModal: React.FC<DocVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  doc,
  onRestoreVersion,
  showToast,
}) => {
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

  const versions: DocVersion[] = doc.versions && doc.versions.length > 0 ? doc.versions : [
    {
      id: 'v-default-3',
      versionNumber: 'v1.2 (当前版本)',
      author: 'Alex Mercer (我)',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      time: '刚刚 (2026-09-07 10:45)',
      summary: '增补表格与执行指引',
      blocksSnapshot: doc.blocks || [],
    },
    {
      id: 'v-default-2',
      versionNumber: 'v1.1',
      author: 'Sarah Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      time: '昨天 15:20',
      summary: '更新行前待办核验清单与打卡点校准项',
      blocksSnapshot: doc.blocks?.slice(0, 5) || [],
    },
    {
      id: 'v-default-1',
      versionNumber: 'v1.0 (初始版本)',
      author: 'Alex Mercer',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      time: '2026-09-01 09:00',
      summary: '创建文档初始大纲与结构',
      blocksSnapshot: doc.blocks?.slice(0, 3) || [],
    },
  ];

  const handleRestore = (ver: DocVersion) => {
    onRestoreVersion(doc.id, ver);
    showToast(`⏱️ 已成功恢复至版本【${ver.versionNumber}】并更新最后编辑时间`);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="查看与恢复版本历史"
      className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white border border-[#E4E6EB] rounded-md shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E6EB] bg-[#FAFAFA]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 text-[#1877F2] flex items-center justify-center">
              <History size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1E21] line-clamp-1">
                版本历史记录 · {doc.title}
              </h3>
              <p className="text-[11px] text-[#65676B]">
                共 {versions.length} 个历史还原点 · 原型演示数据
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭版本历史窗口"
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#65676B] hover:text-[#1C1E21] hover:bg-[#E4E6EB] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Timeline body */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {versions.map((ver, idx) => {
            const isCurrent = idx === 0;
            return (
              <div
                key={ver.id}
                className={`p-4 rounded-md border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/20 border-[#1877F2]/40 shadow-2xs'
                    : 'bg-white border-[#E4E6EB] hover:border-[#1877F2]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-[#1C1E21]">{ver.versionNumber}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#1877F2] text-white rounded-md">
                        当前展示版本
                      </span>
                    )}
                  </div>
                  {!isCurrent && (
                    <button
                      onClick={() => handleRestore(ver)}
                      className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-[#1877F2] border border-[#1877F2]/30 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <RotateCcw size={12} />
                      <span>恢复此版本</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-2 text-xs text-[#65676B]">
                  <img
                    src={ver.authorAvatar}
                    alt={ver.author}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-[#E4E6EB]"
                  />
                  <span>{ver.author}</span>
                  <span>·</span>
                  <span className="flex items-center space-x-1">
                    <Clock size={11} />
                    <span>{ver.time}</span>
                  </span>
                </div>

                <div className="mt-2 text-xs text-[#1C1E21] bg-white/80 p-2 border border-[#E4E6EB] rounded-md font-sans">
                  {ver.summary}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E4E6EB] bg-[#FAFAFA] text-xs text-[#65676B]">
          <span>提示：恢复历史版本不会覆盖其他分支讨论与评论</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-white hover:bg-gray-50 border border-[#E4E6EB] text-[#1C1E21] rounded-md transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
