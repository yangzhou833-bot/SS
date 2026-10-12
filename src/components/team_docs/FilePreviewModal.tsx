import React, { useState, useEffect } from 'react';
import { X, Download, Star, Trash2, Edit3, FolderInput, FileText, Check, AlertCircle } from 'lucide-react';
import { TeamDocItem } from './types';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: TeamDocItem | null;
  onToggleFavorite: (id: string) => void;
  onDeleteToTrash: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  showToast: (msg: string) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  onToggleFavorite,
  onDeleteToTrash,
  onRename,
  showToast,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (file) {
      setNewTitle(file.title);
      setIsRenaming(false);
    }
  }, [file?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const handleDownload = () => {
    showToast(`📥 开始下载文件【${file.title}】（大小：${file.size || '2.4 MB'} · 原型演示）`);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onRename(file.id, newTitle.trim());
    setIsRenaming(false);
    showToast(`✏️ 文件已重命名为【${newTitle.trim()}】`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="附件文件详情与预览"
      className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white border border-[#E4E6EB] rounded-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E6EB] bg-[#FAFAFA]">
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <span className="text-2xl shrink-0">{file.icon}</span>
            <div className="min-w-0">
              {isRenaming ? (
                <form onSubmit={handleSaveRename} className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="px-2 py-0.5 text-sm border border-[#1877F2] rounded-md focus:outline-none"
                    autoFocus
                  />
                  <button type="submit" className="p-1 bg-[#1877F2] text-white rounded-md">
                    <Check size={12} />
                  </button>
                </form>
              ) : (
                <h3 className="text-sm font-bold text-[#1C1E21] truncate flex items-center space-x-2">
                  <span>{file.title}</span>
                  <button
                    onClick={() => setIsRenaming(true)}
                    className="text-[#65676B] hover:text-[#1877F2]"
                    title="重命名文件"
                  >
                    <Edit3 size={13} />
                  </button>
                </h3>
              )}
              <p className="text-[11px] text-[#65676B]">
                归属空间：{file.spaceName} · {file.size || '2.4 MB'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭预览"
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#65676B] hover:text-[#1C1E21] hover:bg-[#E4E6EB] transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Preview Canvas */}
        <div className="p-6 flex flex-col items-center justify-center bg-gray-50/50 border-b border-[#E4E6EB] min-h-[180px] text-center">
          <div className="w-16 h-16 rounded-md bg-white border border-[#E4E6EB] flex items-center justify-center shadow-2xs text-3xl mb-3">
            {file.icon}
          </div>
          <div className="text-xs font-bold text-[#1C1E21]">{file.title}</div>
          <div className="text-[11px] text-[#65676B] mt-1">
            文件大小：{file.size || '2.4 MB'} · 格式类型：压缩包 / 附件资料
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-md shadow-2xs transition-colors"
            >
              <Download size={14} />
              <span>下载文件</span>
            </button>
            <button
              onClick={() => {
                onToggleFavorite(file.id);
                showToast(file.isFavorite ? '已取消收藏' : '⭐ 已加入我的收藏');
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 border text-xs font-semibold rounded-md transition-colors ${
                file.isFavorite
                  ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                  : 'border-[#E4E6EB] bg-white hover:bg-gray-50 text-[#1C1E21]'
              }`}
            >
              <Star size={14} className={file.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''} />
              <span>{file.isFavorite ? '已收藏' : '收藏'}</span>
            </button>
          </div>
        </div>

        {/* File Metadata Grid */}
        <div className="p-5 grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-white border border-[#E4E6EB] rounded-md">
            <div className="text-[10px] text-[#65676B]">上传人员</div>
            <div className="font-semibold text-[#1C1E21] mt-0.5">{file.updatedBy}</div>
          </div>
          <div className="p-2.5 bg-white border border-[#E4E6EB] rounded-md">
            <div className="text-[10px] text-[#65676B]">更新时间</div>
            <div className="font-semibold text-[#1C1E21] mt-0.5">{file.updatedAt}</div>
          </div>
          <div className="p-2.5 bg-white border border-[#E4E6EB] rounded-md">
            <div className="text-[10px] text-[#65676B]">文件类型</div>
            <div className="font-semibold text-[#1C1E21] mt-0.5">ZIP 档案压缩包</div>
          </div>
          <div className="p-2.5 bg-white border border-[#E4E6EB] rounded-md">
            <div className="text-[10px] text-[#65676B]">所属空间分类</div>
            <div className="font-semibold text-[#1C1E21] mt-0.5">{file.spaceCategory === 'team' ? '团队空间' : '个人空间'}</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E4E6EB] bg-[#FAFAFA]">
          <button
            onClick={() => {
              onDeleteToTrash(file.id);
              showToast('🗑️ 已将文件移动到回收站（可在回收站恢复）');
              onClose();
            }}
            className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} />
            <span>移入回收站</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-white border border-[#E4E6EB] text-[#1C1E21] hover:bg-gray-50 rounded-md transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
