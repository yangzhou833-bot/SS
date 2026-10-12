import React, { useState } from 'react';
import {
  Folder,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Play,
  Plus,
  ChevronRight,
  Receipt,
  FileCheck2,
  CreditCard,
  Camera,
  Layers,
  ArrowUpRight,
  Code2,
  Smartphone,
  ClipboardList,
  CheckCircle2,
  HardDrive,
  Check,
  Send,
  Zap,
  ArrowRight,
} from 'lucide-react';
import {
  PhotoAlbum,
  DocumentFolder,
  AICategoryType,
  AI_CATEGORIES,
  ActivityTimelineItem,
  ActionFlowItem,
  DocumentAsset,
  heuristicClassifyAsset,
} from '../../data/documentCenterData';
import { DocumentTimelineFeed } from './DocumentTimelineFeed';

interface DocumentDashboardViewProps {
  userAlbums?: PhotoAlbum[];
  groupSyncedAlbums?: PhotoAlbum[];
  userFolders?: DocumentFolder[];
  groupSyncedFolders?: DocumentFolder[];
  timelineActivities?: ActivityTimelineItem[];
  actionFlows?: ActionFlowItem[];
  unclassifiedAssets?: DocumentAsset[];
  onOpenAlbum: (album: PhotoAlbum) => void;
  onOpenFolder: (folder: DocumentFolder) => void;
  onSelectAICategory: (cat: AICategoryType) => void;
  onTriggerFlow: (flow: ActionFlowItem) => void;
  onCreateNewFlow: () => void;
  onCreateNewAlbum: () => void;
  onCreateNewFolder: () => void;
  onOpenGroupAssets: (convId: string, groupName: string, avatar?: string) => void;
  onOpenAiAutoArchive: () => void;
  onNavigateToTab: (tab: 'categories' | 'flows' | 'files') => void;
  onPreviewAsset?: (asset: DocumentAsset) => void;
  onConfirmAutoArchive?: (mappings: { assetId: string; targetCategory: AICategoryType }[]) => void;
  onShowToast?: (msg: string) => void;
}

export const DocumentDashboardView: React.FC<DocumentDashboardViewProps> = ({
  userAlbums = [],
  groupSyncedAlbums = [],
  userFolders = [],
  groupSyncedFolders = [],
  timelineActivities = [],
  actionFlows = [],
  unclassifiedAssets = [],
  onOpenAlbum,
  onOpenFolder,
  onSelectAICategory,
  onTriggerFlow,
  onCreateNewFlow,
  onCreateNewAlbum,
  onCreateNewFolder,
  onOpenGroupAssets,
  onOpenAiAutoArchive,
  onNavigateToTab,
  onPreviewAsset,
  onConfirmAutoArchive,
  onShowToast,
}) => {
  const [archivedAssetIds, setArchivedAssetIds] = useState<string[]>([]);
  const [isBatchArchiving, setIsBatchArchiving] = useState(false);

  const triggerToast = (msg: string) => {
    if (onShowToast) {
      onShowToast(msg);
    }
  };

  // Heuristic classified items for the flat list view
  const pendingFiles = React.useMemo(() => {
    return unclassifiedAssets.map((asset) => {
      const heuristic = heuristicClassifyAsset({
        title: asset.title,
        fileExtension: asset.fileExtension,
        type: asset.type,
        url: asset.url,
      });
      return {
        ...asset,
        heuristic,
        isArchived: archivedAssetIds.includes(asset.id),
      };
    });
  }, [unclassifiedAssets, archivedAssetIds]);

  const remainingPendingFiles = pendingFiles.filter((f) => !f.isArchived);

  // Handle single item archive
  const handleArchiveSingle = (assetId: string, targetCategory: AICategoryType, title: string) => {
    setArchivedAssetIds((prev) => [...prev, assetId]);
    if (onConfirmAutoArchive) {
      onConfirmAutoArchive([{ assetId, targetCategory }]);
    }
    triggerToast(`已成功归档「${title}」至对应智能分类 ✨`);
  };

  // Handle batch one-click archive
  const handleBatchArchive = () => {
    if (remainingPendingFiles.length === 0) {
      triggerToast('暂无待归档文件');
      return;
    }
    setIsBatchArchiving(true);
    const mappings = remainingPendingFiles.map((f) => ({
      assetId: f.id,
      targetCategory: f.heuristic.category,
    }));
    const newArchivedIds = remainingPendingFiles.map((f) => f.id);

    setTimeout(() => {
      setArchivedAssetIds((prev) => [...prev, ...newArchivedIds]);
      if (onConfirmAutoArchive) {
        onConfirmAutoArchive(mappings);
      }
      setIsBatchArchiving(false);
      triggerToast(`🎉 成功一键归档 ${remainingPendingFiles.length} 份聊天文件！`);
    }, 600);
  };

  // Category Icon helper with high visual recognizability & contrast
  const renderCategoryIcon = (catId: AICategoryType, size = 18) => {
    switch (catId) {
      case 'invoices':
        return <Receipt size={size} className="stroke-[2.2]" />;
      case 'contracts':
        return <FileCheck2 size={size} className="stroke-[2.2]" />;
      case 'certificates':
        return <CreditCard size={size} className="stroke-[2.2]" />;
      case 'meetings':
        return <ClipboardList size={size} className="stroke-[2.2]" />;
      case 'travel':
        return <Camera size={size} className="stroke-[2.2]" />;
      case 'inspiration':
        return <Sparkles size={size} className="stroke-[2.2]" />;
      case 'projects':
        return <Code2 size={size} className="stroke-[2.2]" />;
      case 'screenshots':
        return <Smartphone size={size} className="stroke-[2.2]" />;
      default:
        return <Folder size={size} className="stroke-[2.2]" />;
    }
  };

  // Category Color Scheme helper
  const getCategoryColorStyles = (catId: AICategoryType) => {
    switch (catId) {
      case 'invoices':
        return {
          bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          badge: 'bg-emerald-100 text-emerald-800',
          gradient: 'from-emerald-500 to-teal-600',
        };
      case 'contracts':
        return {
          bg: 'bg-amber-50 text-amber-600 border-amber-100',
          badge: 'bg-amber-100 text-amber-800',
          gradient: 'from-amber-500 to-orange-600',
        };
      case 'certificates':
        return {
          bg: 'bg-blue-50 text-[#1877F2] border-blue-100',
          badge: 'bg-blue-100 text-[#1877F2]',
          gradient: 'from-blue-600 to-indigo-600',
        };
      case 'meetings':
        return {
          bg: 'bg-purple-50 text-purple-600 border-purple-100',
          badge: 'bg-purple-100 text-purple-800',
          gradient: 'from-purple-500 to-indigo-600',
        };
      case 'travel':
        return {
          bg: 'bg-rose-50 text-rose-600 border-rose-100',
          badge: 'bg-rose-100 text-rose-800',
          gradient: 'from-rose-500 to-pink-600',
        };
      case 'inspiration':
        return {
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-100',
          badge: 'bg-cyan-100 text-cyan-800',
          gradient: 'from-cyan-500 to-blue-600',
        };
      case 'projects':
        return {
          bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          badge: 'bg-indigo-100 text-indigo-800',
          gradient: 'from-indigo-600 to-violet-700',
        };
      case 'screenshots':
        return {
          bg: 'bg-sky-50 text-sky-600 border-sky-100',
          badge: 'bg-sky-100 text-sky-800',
          gradient: 'from-sky-500 to-blue-600',
        };
      default:
        return {
          bg: 'bg-gray-50 text-gray-700 border-gray-100',
          badge: 'bg-gray-100 text-gray-800',
          gradient: 'from-gray-600 to-gray-800',
        };
    }
  };

  // Combine items for Quick Access
  const quickAccessItems = React.useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      type: 'album' | 'folder' | 'group_album' | 'group_folder';
      count: number;
      cover?: string;
      color?: string;
      dotColor: string;
      badgeText?: string;
      iconType: 'album' | 'folder' | 'group';
      groupAvatar?: string;
      groupSourceId?: string;
      rawAlbum?: PhotoAlbum;
      rawFolder?: DocumentFolder;
    }> = [];

    // Add prominent group albums
    groupSyncedAlbums.slice(0, 3).forEach((a) => {
      items.push({
        id: a.id,
        name: a.name,
        type: 'group_album',
        count: a.photoCount,
        cover: a.coverUrl,
        dotColor: '#FF6B00',
        badgeText: '群相册',
        iconType: 'group',
        groupAvatar: a.groupAvatar,
        groupSourceId: a.groupSourceId,
        rawAlbum: a,
      });
    });

    // Add user custom albums
    userAlbums.slice(0, 2).forEach((a) => {
      items.push({
        id: a.id,
        name: a.name,
        type: 'album',
        count: a.photoCount,
        cover: a.coverUrl,
        dotColor: '#9333EA',
        badgeText: '个人',
        iconType: 'album',
        rawAlbum: a,
      });
    });

    // Add user folders
    userFolders.slice(0, 3).forEach((f) => {
      items.push({
        id: f.id,
        name: f.name,
        type: 'folder',
        count: f.fileCount,
        color: f.color || '#1877F2',
        dotColor: '#1877F2',
        badgeText: '个人分类',
        iconType: 'folder',
        rawFolder: f,
      });
    });

    // Add group synced folders
    groupSyncedFolders.slice(0, 2).forEach((f) => {
      items.push({
        id: f.id,
        name: f.name,
        type: 'group_folder',
        count: f.fileCount,
        color: f.color || '#42B72A',
        dotColor: '#42B72A',
        badgeText: '群文档',
        iconType: 'group',
        groupAvatar: f.groupAvatar,
        groupSourceId: f.groupSourceId,
        rawFolder: f,
      });
    });

    return items;
  }, [userAlbums, groupSyncedAlbums, userFolders, groupSyncedFolders]);

  return (
    <div className="space-y-6 pb-12 pt-1 px-1">
      {/* =================================================================== */}
      {/* 1. TOP HEADER (Screen 1 Reference: 早安 Alexia / 状态胶囊)         */}
      {/* =================================================================== */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#050505] tracking-tight">
              早安，Alexia
            </h1>
            <p className="text-xs font-medium text-[#65676B] flex items-center space-x-1.5">
              <span>今日自动同步 8 份文件与媒体</span>
              <span>·</span>
              <span>☁️ 21°C 晴朗</span>
            </p>
          </div>

          <div className="relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
              alt="Alexia"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1877F2]/20 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#42B72A] ring-2 ring-white" />
          </div>
        </div>

        {/* AI Classification Quick Filter Badges */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-black text-[#050505]">
              <Sparkles size={15} className="text-[#1877F2]" />
              <span>AI 语义智能分类速选</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('flows')}
              className="text-[11px] font-bold text-[#1877F2] hover:text-[#166FE5] flex items-center space-x-0.5 cursor-pointer"
            >
              <span>进入自动化工作流</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          {/* Horizontally scrollable AI category tags */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            {AI_CATEGORIES.map((cat) => {
              const styles = getCategoryColorStyles(cat.id);
              return (
                <button
                  key={`top-ai-cat-${cat.id}`}
                  type="button"
                  onClick={() => onSelectAICategory(cat.id)}
                  className={`shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white hover:bg-blue-50/80 transition-all border border-gray-200/80 hover:border-[#1877F2]/40 shadow-2xs cursor-pointer group`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${styles.bg}`}>
                    {renderCategoryIcon(cat.id, 12)}
                  </div>
                  <span className="text-xs font-bold text-[#050505] group-hover:text-[#1877F2] transition-colors">
                    {cat.title}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${styles.badge}`}>
                    {cat.badgeCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. AI 智能分类与一键归档模块 (Flat List + High Recognizability Icons) */}
      {/* =================================================================== */}
      <section className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
        {/* Module Header with Batch Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1877F2] to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-[#050505] tracking-tight">
                  AI 智能分类与一键归档
                </h2>
                <span className="text-[10px] bg-blue-50 text-[#1877F2] font-black px-2 py-0.5 rounded-full border border-blue-100">
                  启发式智能引擎
                </span>
              </div>
              <p className="text-xs font-medium text-[#65676B] mt-0.5">
                自动捕获聊天中的未分类发票、合同、证件及媒体，按内容类型即时聚合
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleBatchArchive}
              disabled={isBatchArchiving || remainingPendingFiles.length === 0}
              className={`px-4 py-2 rounded-full text-xs font-black flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                remainingPendingFiles.length > 0
                  ? 'bg-gradient-to-r from-[#1877F2] to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isBatchArchiving ? (
                <>
                  <Sparkles size={14} className="animate-spin" />
                  <span>正在启发式归类...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>一键全部归档</span>
                  {remainingPendingFiles.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-white text-[#1877F2] text-[10px] font-black flex items-center justify-center">
                      {remainingPendingFiles.length}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* 8 Smart Category Recognizable Grid Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {AI_CATEGORIES.map((cat) => {
            const styles = getCategoryColorStyles(cat.id);
            return (
              <div
                key={`grid-ai-cat-${cat.id}`}
                onClick={() => onSelectAICategory(cat.id)}
                className="group p-3 rounded-2xl bg-[#F0F2F5]/80 hover:bg-white border border-transparent hover:border-[#1877F2]/40 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center space-x-3"
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs shrink-0 transition-transform group-hover:scale-105 ${styles.bg}`}
                >
                  {renderCategoryIcon(cat.id, 20)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-[#050505] group-hover:text-[#1877F2] transition-colors truncate">
                      {cat.title}
                    </h4>
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${styles.badge}`}>
                      {cat.badgeCount}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#65676B] truncate mt-0.5">
                    {cat.tags.slice(0, 2).join(' · ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 平铺式列表呈现 (Tiled Flat List of Captured Unclassified Files) */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
              <span>待归档聊天文件列表</span>
              <span className="text-[10px] text-gray-500 font-normal">
                ({remainingPendingFiles.length} 份待处理)
              </span>
            </h3>
            <span className="text-[11px] text-[#65676B]">基于文件名、扩展名与内容启发式预判</span>
          </div>

          {remainingPendingFiles.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#F0F2F5]/60 text-center space-y-2 border border-dashed border-gray-200">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Check size={20} className="stroke-[2.5]" />
              </div>
              <p className="text-xs font-bold text-[#050505]">所有聊天捕获文件均已完成归档！</p>
              <p className="text-[11px] text-gray-500">
                群聊或私聊中新发送的发票、合同与证件将自动在此聚合
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {remainingPendingFiles.map((file) => {
                const styles = getCategoryColorStyles(file.heuristic.category);
                const isPhoto = file.type === 'photo';

                return (
                  <div
                    key={file.id}
                    className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Left: Icon / Thumbnail + Info */}
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {isPhoto && file.url ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-gray-200 shrink-0 shadow-2xs">
                          <img
                            src={file.url}
                            alt={file.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${styles.bg}`}
                        >
                          {renderCategoryIcon(file.heuristic.category, 22)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4
                            onClick={() => onPreviewAsset && onPreviewAsset(file)}
                            className="text-xs font-black text-[#050505] truncate hover:text-[#1877F2] cursor-pointer transition-colors"
                          >
                            {file.title}
                          </h4>
                          <span
                            className={`text-[9.5px] px-2 py-0.5 rounded-full font-black flex items-center space-x-1 shrink-0 ${styles.badge}`}
                          >
                            <span>{file.heuristic.targetName.split(' ')[0]}</span>
                            <span>{Math.round(file.heuristic.confidence * 100)}%</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-[#65676B] mt-1 font-medium">
                          <span className="flex items-center space-x-1">
                            <Send size={10} className="text-gray-400" />
                            <span>来源：{file.source?.name || '微信群聊'}</span>
                          </span>
                          <span>·</span>
                          <span>大小：{file.size || '1.8 MB'}</span>
                          <span>·</span>
                          <span>目标：{file.heuristic.targetName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onPreviewAsset && onPreviewAsset(file)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#F0F2F5] hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                      >
                        预览
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleArchiveSingle(file.id, file.heuristic.category, file.title)
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-[#1877F2] text-[#1877F2] hover:text-white text-xs font-black transition-all flex items-center space-x-1 cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <span>立即归档</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. 常用文件夹与相册 (Favorite Folders & Albums)                    */}
      {/* =================================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-black text-[#050505] tracking-tight">
            常用文件夹与相册
          </h2>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => onNavigateToTab('categories')}
              className="text-xs font-bold text-[#1877F2] hover:underline flex items-center mr-1 cursor-pointer"
            >
              全部目录
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              onClick={onCreateNewAlbum}
              className="w-7 h-7 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              title="新建相册"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* High-radius card grid with pure white backgrounds (#FFFFFF) & crisp contrast */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {quickAccessItems.map((item) => {
            const isGroup = item.iconType === 'group';

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.rawAlbum) {
                    if (item.rawAlbum.isGroupSync && item.groupSourceId) {
                      onOpenGroupAssets(item.groupSourceId, item.name, item.groupAvatar);
                    } else {
                      onOpenAlbum(item.rawAlbum);
                    }
                  } else if (item.rawFolder) {
                    if (item.rawFolder.isGroupSync && item.groupSourceId) {
                      onOpenGroupAssets(item.groupSourceId, item.name, item.groupAvatar);
                    } else {
                      onOpenFolder(item.rawFolder);
                    }
                  }
                }}
                className="group relative p-4 rounded-3xl bg-white border border-gray-200/80 hover:border-[#1877F2]/50 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[125px]"
              >
                {/* Top Row: Icon + Status Dot */}
                <div className="flex items-start justify-between">
                  <div className="relative">
                    {isGroup && item.groupAvatar ? (
                      <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-blue-100 shadow-2xs">
                        <img
                          src={item.groupAvatar}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : item.type === 'album' ? (
                      <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs border border-purple-100">
                        <ImageIcon size={22} className="stroke-[2.2]" />
                      </div>
                    ) : (
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-2xs"
                        style={{ backgroundColor: item.color || '#1877F2' }}
                      >
                        <Folder size={22} className="stroke-[2.2]" />
                      </div>
                    )}

                    {/* Group Avatar Mask Overlay Badge */}
                    {isGroup && (
                      <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-black ring-2 ring-white shadow-2xs">
                        群聊
                      </div>
                    )}
                  </div>

                  {/* Status Indicator Dot */}
                  <div className="flex items-center space-x-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-2xs"
                      style={{ backgroundColor: item.dotColor }}
                    />
                  </div>
                </div>

                {/* Bottom Row: Name + File Count */}
                <div className="mt-3">
                  <h4 className="text-xs font-black text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-[#65676B] font-semibold mt-0.5 flex items-center justify-between">
                    <span>
                      {item.count} {item.type.includes('album') ? '张相片' : '份文件'}
                    </span>
                    <span
                      className={`text-[9.5px] px-1.5 py-0.2 rounded-md font-bold ${
                        isGroup
                          ? 'bg-blue-50 text-[#1877F2]'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.badgeText}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. 常用自动化规则 (Favorite Flows)                                 */}
      {/* =================================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-black text-[#050505] tracking-tight">
              常用自动化规则
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1877F2] text-[10px] font-black border border-blue-100">
              智能工作流
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => onNavigateToTab('flows')}
              className="text-xs font-bold text-[#1877F2] hover:underline flex items-center mr-1 cursor-pointer"
            >
              全部工作流
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              onClick={onCreateNewFlow}
              className="w-7 h-7 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              title="新建规则"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Horizontally scrollable Flow pills */}
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar pb-1">
          {actionFlows.map((flow) => {
            return (
              <div
                key={flow.id}
                onClick={() => onTriggerFlow(flow)}
                className="shrink-0 flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-white border border-gray-200/80 hover:border-[#1877F2] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shadow-2xs shrink-0 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: flow.color }}
                >
                  <Play size={13} className="fill-current ml-0.5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-[#050505] group-hover:text-[#1877F2] transition-colors flex items-center space-x-1">
                    <span>{flow.title}</span>
                    <span>{flow.emoji}</span>
                  </div>
                  <p className="text-[10px] text-[#65676B] font-medium truncate max-w-[140px]">
                    {flow.triggerWhen.title}
                  </p>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={onCreateNewFlow}
            className="shrink-0 flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200/80 hover:bg-blue-100/80 text-[#1877F2] text-xs font-black transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>新建规则</span>
          </button>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. 同步动态时间轴 (Timeline & Activity Feed)                       */}
      {/* =================================================================== */}
      <section className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-black text-[#050505] tracking-tight">
              同步动态时间轴
            </h2>
            <span className="w-2 h-2 rounded-full bg-[#42B72A] animate-pulse" />
          </div>
          <span className="text-xs font-medium text-[#65676B]">实时动态记录</span>
        </div>

        <DocumentTimelineFeed activities={timelineActivities} maxItems={5} />
      </section>
    </div>
  );
};
