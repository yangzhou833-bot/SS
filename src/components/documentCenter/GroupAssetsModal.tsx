import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Download,
  Search,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Mic,
  Calendar,
  Layers,
  Filter,
  CheckCircle2,
  Share2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { DocumentAsset } from '../../data/documentCenterData';

interface GroupAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  groupAvatar?: string;
  groupSourceId?: string;
  assets: DocumentAsset[];
  onPreviewAsset: (asset: DocumentAsset) => void;
  onShowToast?: (msg: string) => void;
  showToast?: (msg: string) => void;
}

type GroupAssetTab = 'all' | 'photos' | 'docs' | 'links' | 'voice';

export const GroupAssetsModal: React.FC<GroupAssetsModalProps> = ({
  isOpen,
  onClose,
  groupName,
  groupAvatar,
  groupSourceId,
  assets,
  onPreviewAsset,
  onShowToast,
  showToast,
}) => {
  const triggerToast = (msg: string) => {
    if (onShowToast) onShowToast(msg);
    else if (showToast) showToast(msg);
  };
  const [activeTab, setActiveTab] = useState<GroupAssetTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      // Tab filter
      if (activeTab === 'photos' && item.type !== 'photo') return false;
      if (activeTab === 'docs' && item.type !== 'document') return false;
      if (activeTab === 'links' && item.type !== 'link') return false;
      if (activeTab === 'voice' && item.type !== 'voice') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesAuthor = item.author?.toLowerCase().includes(q) || false;
        const matchesTags = item.aiTags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchesTitle && !matchesAuthor && !matchesTags) return false;
      }
      return true;
    });
  }, [assets, activeTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: assets.length,
      photos: assets.filter((a) => a.type === 'photo').length,
      docs: assets.filter((a) => a.type === 'document').length,
      links: assets.filter((a) => a.type === 'link').length,
      voice: assets.filter((a) => a.type === 'voice').length,
    };
  }, [assets]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchDownload = () => {
    const count = selectedAssetIds.length > 0 ? selectedAssetIds.length : filteredAssets.length;
    triggerToast(`已为群聊「${groupName}」启动 ${count} 项资产批量打包下载 📦`);
    setSelectedAssetIds([]);
    setIsMultiSelectMode(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F0F2F5] flex flex-col font-sans animate-in slide-in-from-right duration-200">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 pt-10 pb-3 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] flex items-center justify-center cursor-pointer shrink-0 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="relative shrink-0">
            <img
              src={
                groupAvatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
              }
              alt={groupName}
              className="w-10 h-10 rounded-xl object-cover border border-gray-200 shadow-2xs"
            />
            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-blue-500 text-[9px] font-bold text-white rounded-md ring-2 ring-white">
              群同步
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-black text-[#050505] truncate">{groupName}</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-[#1877F2] font-bold shrink-0">
                群聊资产中心
              </span>
            </div>
            <p className="text-[11px] text-[#65676B] truncate">
              提取群聊历史全部文件、相片与音视频 · 共 {assets.length} 项资产
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              if (isMultiSelectMode) setSelectedAssetIds([]);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isMultiSelectMode
                ? 'bg-[#1877F2] text-white shadow-2xs'
                : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505]'
            }`}
          >
            {isMultiSelectMode ? `已选 (${selectedAssetIds.length})` : '批量操作'}
          </button>

          <button
            type="button"
            onClick={handleBatchDownload}
            className="px-3.5 py-1.5 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1 shadow-2xs cursor-pointer transition-colors"
          >
            <Download size={13} />
            <span>{selectedAssetIds.length > 0 ? '下载选中' : '全部导出'}</span>
          </button>
        </div>
      </header>

      {/* Sub-header Filter Tabs & Search Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 space-y-2.5 shrink-0 shadow-2xs">
        {/* Tab Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'all'
                ? 'bg-[#1877F2] text-white shadow-2xs'
                : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B]'
            }`}
          >
            <Layers size={13} />
            <span>全部 ({counts.all})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'photos'
                ? 'bg-[#1877F2] text-white shadow-2xs'
                : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B]'
            }`}
          >
            <ImageIcon size={13} />
            <span>相片视频 ({counts.photos})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'docs'
                ? 'bg-[#1877F2] text-white shadow-2xs'
                : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B]'
            }`}
          >
            <FileText size={13} />
            <span>文档资料 ({counts.docs})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'links'
                ? 'bg-[#1877F2] text-white shadow-2xs'
                : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B]'
            }`}
          >
            <LinkIcon size={13} />
            <span>网页链接 ({counts.links})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'voice'
                ? 'bg-[#1877F2] text-white shadow-2xs'
                : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B]'
            }`}
          >
            <Mic size={13} />
            <span>语音要点 ({counts.voice})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`在「${groupName}」历史资产中快速搜索文件名、发送者或标签...`}
            className="w-full pl-8.5 pr-4 py-1.5 rounded-xl bg-[#F0F2F5] text-xs text-[#050505] placeholder-[#65676B] outline-none border border-transparent focus:border-[#1877F2] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* Asset Grid & List Content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-5xl w-full mx-auto custom-scrollbar space-y-4">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2 text-gray-300">
              <Filter size={20} />
            </div>
            <p className="text-xs font-bold">暂无匹配的群聊资产</p>
            <p className="text-[11px] mt-1 text-gray-400">在群聊中发送照片、文件或链接后将实时在此自动提取</p>
          </div>
        ) : (
          <>
            {/* Photos section if present */}
            {(activeTab === 'all' || activeTab === 'photos') && (
              <div>
                {activeTab === 'all' && (
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
                      <ImageIcon size={14} className="text-[#1877F2]" />
                      <span>群聊照片与图片 ({filteredAssets.filter((a) => a.type === 'photo').length})</span>
                    </h4>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {filteredAssets
                    .filter((a) => a.type === 'photo')
                    .map((photo) => {
                      const isSelected = selectedAssetIds.includes(photo.id);
                      return (
                        <div
                          key={photo.id}
                          onClick={() => {
                            if (isMultiSelectMode) {
                              toggleSelect(photo.id, {} as any);
                            } else {
                              onPreviewAsset(photo);
                            }
                          }}
                          className={`relative group rounded-xl overflow-hidden bg-gray-100 border transition-all cursor-pointer aspect-square ${
                            isSelected
                              ? 'border-[#1877F2] ring-2 ring-[#1877F2]'
                              : 'border-gray-200/80 hover:border-[#1877F2]'
                          }`}
                        >
                          <img
                            src={photo.url || photo.thumbnail}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />

                          {/* Multi select checkbox */}
                          {isMultiSelectMode && (
                            <button
                              type="button"
                              onClick={(e) => toggleSelect(photo.id, e)}
                              className={`absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center z-10 transition-all ${
                                isSelected
                                  ? 'bg-[#1877F2] text-white shadow-xs'
                                  : 'bg-black/40 text-white/80 hover:bg-black/60'
                              }`}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}

                          {/* Date & Title Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white">
                            <span className="text-[11px] font-bold truncate">{photo.title}</span>
                            <div className="flex items-center justify-between text-[9px] opacity-80 mt-0.5">
                              <span>{photo.author || '群成员'}</span>
                              <span>{photo.date}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Documents section */}
            {(activeTab === 'all' || activeTab === 'docs') && (
              <div className="space-y-2 pt-2">
                {activeTab === 'all' && (
                  <h4 className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
                    <FileText size={14} className="text-[#1877F2]" />
                    <span>群聊文档与表格 ({filteredAssets.filter((a) => a.type === 'document').length})</span>
                  </h4>
                )}

                <div className="space-y-2">
                  {filteredAssets
                    .filter((a) => a.type === 'document')
                    .map((doc) => {
                      const isSelected = selectedAssetIds.includes(doc.id);
                      return (
                        <div
                          key={doc.id}
                          onClick={() => {
                            if (isMultiSelectMode) {
                              toggleSelect(doc.id, {} as any);
                            } else {
                              onPreviewAsset(doc);
                            }
                          }}
                          className={`p-3.5 rounded-2xl bg-white border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'border-[#1877F2] ring-2 ring-[#1877F2]'
                              : 'border-gray-200/80 hover:border-[#1877F2] shadow-2xs hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            {isMultiSelectMode && (
                              <button
                                type="button"
                                onClick={(e) => toggleSelect(doc.id, e)}
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                  isSelected
                                    ? 'bg-[#1877F2] text-white shadow-xs'
                                    : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                }`}
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            )}

                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
                              <FileText size={20} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <h4 className="text-xs font-bold text-[#050505] truncate">{doc.title}</h4>
                                {doc.fileExtension && (
                                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-md bg-gray-100 font-mono text-gray-600 font-bold shrink-0">
                                    {doc.fileExtension}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#65676B] flex items-center space-x-1.5 mt-0.5">
                                <span>大小：{doc.size || '1.8 MB'}</span>
                                <span>·</span>
                                <span>发送者：{doc.author || '群成员'}</span>
                                <span>·</span>
                                <span>{doc.date}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPreviewAsset(doc);
                              }}
                              className="px-2.5 py-1 rounded-full bg-[#F0F2F5] hover:bg-blue-50 hover:text-[#1877F2] text-xs font-bold text-gray-700 transition-colors"
                            >
                              预览
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerToast(`正在下载文件：${doc.title}`);
                              }}
                              className="w-7 h-7 rounded-full bg-[#F0F2F5] hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                            >
                              <Download size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Links and Voice sections if needed */}
            {(activeTab === 'all' || activeTab === 'links') &&
              filteredAssets.some((a) => a.type === 'link') && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
                    <LinkIcon size={14} className="text-[#1877F2]" />
                    <span>群聊分享链接</span>
                  </h4>
                  {filteredAssets
                    .filter((a) => a.type === 'link')
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => triggerToast(`正在打开外链：${item.title}`)}
                        className="p-3 rounded-2xl bg-white border border-gray-200/80 shadow-2xs hover:border-[#1877F2] flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                            <LinkIcon size={18} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#050505] truncate">{item.title}</h4>
                            <p className="text-[10px] text-[#1877F2] truncate">{item.url || 'https://stellar.im/group-link'}</p>
                          </div>
                        </div>
                        <ExternalLink size={14} className="text-gray-400 shrink-0 ml-2" />
                      </div>
                    ))}
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};
