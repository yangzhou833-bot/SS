import React, { useState, useEffect } from 'react';
import { X, Link2, Check, Globe, Shield, Users } from 'lucide-react';
import { TeamDocItem, MemberPermission } from './types';

interface DocShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: TeamDocItem;
  onUpdatePermissions: (docId: string, permissions: MemberPermission[], linkEnabled: boolean, linkAccess: 'view' | 'comment' | 'edit') => void;
  showToast: (msg: string) => void;
}

export const DocShareModal: React.FC<DocShareModalProps> = ({
  isOpen,
  onClose,
  doc,
  onUpdatePermissions,
  showToast,
}) => {
  const [permissions, setPermissions] = useState<MemberPermission[]>(doc.permissions || []);
  const [isLinkEnabled, setIsLinkEnabled] = useState<boolean>(doc.isLinkSharingEnabled ?? true);
  const [linkAccess, setLinkAccess] = useState<'view' | 'comment' | 'edit'>(doc.linkAccess || 'view');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (doc) {
      setPermissions(doc.permissions || []);
      setIsLinkEnabled(doc.isLinkSharingEnabled ?? true);
      setLinkAccess(doc.linkAccess || 'view');
    }
  }, [doc?.id]);

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

  const handleAccessChange = (memberId: string, newAccess: 'view' | 'comment' | 'edit') => {
    const updated = permissions.map((m) => (m.id === memberId ? { ...m, access: newAccess } : m));
    setPermissions(updated);
    onUpdatePermissions(doc.id, updated, isLinkEnabled, linkAccess);
    showToast(`已更新协作者权限为：${newAccess === 'edit' ? '可编辑' : newAccess === 'comment' ? '可评论' : '仅查看'}`);
  };

  const handleToggleLink = () => {
    const next = !isLinkEnabled;
    setIsLinkEnabled(next);
    onUpdatePermissions(doc.id, permissions, next, linkAccess);
    showToast(next ? '已开启公开链接访问 (演示状态)' : '已关闭公开链接访问');
  };

  const handleLinkAccessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as 'view' | 'comment' | 'edit';
    setLinkAccess(next);
    onUpdatePermissions(doc.id, permissions, isLinkEnabled, next);
    showToast(`链接访问权限已变更为：${next === 'edit' ? '可编辑' : next === 'comment' ? '可评论' : '仅查看'}`);
  };

  const handleCopyLink = () => {
    setCopied(true);
    showToast(`🔗 已复制文档分享链接至剪贴板（原型演示）：https://stellar.app/docs/${doc.id}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="分享文档协作权限"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white border border-[#E4E6EB] rounded-md shadow-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E6EB] bg-[#FAFAFA]">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{doc.icon}</span>
            <div>
              <h3 className="text-sm font-bold text-[#1C1E21] line-clamp-1">
                分享与协作者权限 · {doc.title}
              </h3>
              <p className="text-[11px] text-[#65676B]">
                空间：{doc.spaceName} · 原型演示数据
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭分享窗口"
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#65676B] hover:text-[#1C1E21] hover:bg-[#E4E6EB] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Link Sharing Option */}
          <div className="p-3 bg-white border border-[#E4E6EB] rounded-md space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-md bg-blue-50 text-[#1877F2] flex items-center justify-center">
                  <Globe size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1C1E21]">链接访问开关</div>
                  <div className="text-[11px] text-[#65676B]">拥有链接的小组成员可以直接访问</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isLinkEnabled}
                onClick={handleToggleLink}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isLinkEnabled ? 'bg-[#1877F2]' : 'bg-[#E4E6EB]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    isLinkEnabled ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {isLinkEnabled && (
              <div className="flex items-center justify-between pt-2 border-t border-[#E4E6EB] text-xs">
                <span className="text-[#65676B] text-[11px]">链接默认权限：</span>
                <select
                  value={linkAccess}
                  onChange={handleLinkAccessChange}
                  className="px-2 py-1 text-xs border border-[#E4E6EB] rounded-md bg-white text-[#1C1E21] focus:outline-none focus:border-[#1877F2]"
                >
                  <option value="view">仅查看 (Viewer)</option>
                  <option value="comment">可评论 (Commenter)</option>
                  <option value="edit">可编辑 (Editor)</option>
                </select>
              </div>
            )}
          </div>

          {/* Members List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1C1E21] flex items-center space-x-1.5">
                <Users size={14} className="text-[#1877F2]" />
                <span>协作成员权限列表 ({permissions.length})</span>
              </span>
              <span className="text-[10px] text-[#65676B]">更改立即生效</span>
            </div>

            <div className="space-y-2">
              {permissions.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 bg-white border border-[#E4E6EB] rounded-md hover:border-[#1877F2]/50 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-[#E4E6EB] shrink-0"
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-[#1C1E21] truncate">{m.name}</div>
                      <div className="text-[10px] text-[#65676B] truncate">{m.role}</div>
                    </div>
                  </div>

                  <select
                    value={m.access}
                    onChange={(e) => handleAccessChange(m.id, e.target.value as 'view' | 'comment' | 'edit')}
                    className="px-2 py-1 text-xs border border-[#E4E6EB] rounded-md bg-white text-[#1C1E21] focus:outline-none focus:border-[#1877F2] shrink-0"
                  >
                    <option value="view">仅查看</option>
                    <option value="comment">可评论</option>
                    <option value="edit">可编辑</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E4E6EB] bg-[#FAFAFA]">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold border border-[#E4E6EB] bg-white hover:bg-gray-50 text-[#1C1E21] rounded-md transition-colors"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Link2 size={14} className="text-[#1877F2]" />}
            <span>{copied ? '已复制' : '复制链接'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-md shadow-2xs transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
