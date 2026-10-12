import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Clock,
  Star,
  Users,
  Trash2,
  Folder,
  FolderPlus,
  FileText,
  File,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Share2,
  Download,
  Eye,
  Tag,
  Calendar,
  X,
  Sparkles,
  Database,
  CheckSquare,
  BookOpen,
  Briefcase,
  User,
  Upload,
  RotateCcw,
  SlidersHorizontal,
  FolderGit2,
} from 'lucide-react';
import { TeamDocItem, DocType, FilterOptions } from './types';
import { INITIAL_DOCS } from './initialDocsData';
import { DocEditorModal } from './DocEditorModal';
import { FilePreviewModal } from './FilePreviewModal';
import { DocShareModal } from './DocShareModal';

interface StellarDocumentWorkspaceProps {
  onBack: () => void;
  groupName?: string;
  showToast: (msg: string) => void;
}

export const StellarDocumentWorkspace: React.FC<StellarDocumentWorkspaceProps> = ({
  onBack,
  groupName = '城市探索组',
  showToast,
}) => {
  // Docs dataset in memory
  const [docs, setDocs] = useState<TeamDocItem[]>(() => INITIAL_DOCS);

  // Active navigation section
  // 'recent' | 'favorites' | 'shared' | 'trash' | 'team:城市探索组' | 'team:项目资料库' | 'personal:我的文档'
  const [activeNav, setActiveNav] = useState<string>(`team:${groupName}`);

  // View mode: list vs grid
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Search keyword (matches title, tags, content)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filters
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Tree expanded state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    teamRoot: true,
    personalRoot: true,
    folderDocs: true,
  });

  // Mobile column active tab: 'nav' | 'tree' | 'content'
  const [mobileTab, setMobileTab] = useState<'nav' | 'tree' | 'content'>('content');

  // Create menu dropdown
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  // Active viewing/editing item
  const [activeDocForEdit, setActiveDocForEdit] = useState<TeamDocItem | null>(null);
  const [activeFileForPreview, setActiveFileForPreview] = useState<TeamDocItem | null>(null);
  const [shareModalDoc, setShareModalDoc] = useState<TeamDocItem | null>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setIsNewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered & Searched docs
  const filteredDocs = useMemo(() => {
    return docs.filter((item) => {
      // Trash filtering
      if (activeNav === 'trash') {
        if (!item.isDeleted) return false;
      } else {
        if (item.isDeleted) return false;

        // Navigation filters
        if (activeNav === 'favorites' && !item.isFavorite) return false;
        if (activeNav === 'shared' && item.spaceCategory !== 'team') return false;
        if (activeNav.startsWith('team:')) {
          const targetSpace = activeNav.replace('team:', '');
          if (item.spaceCategory !== 'team' || item.spaceName !== targetSpace) return false;
        }
        if (activeNav.startsWith('personal:')) {
          if (item.spaceCategory !== 'personal') return false;
        }
      }

      // Manual filters
      if (filters.space && item.spaceName !== filters.space) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.tag && !item.tags?.includes(filters.tag)) return false;
      if (filters.member && item.updatedBy !== filters.member) return false;

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        const matchBlocks = item.blocks?.some(
          (b) =>
            b.content.toLowerCase().includes(q) ||
            b.columnLeft?.toLowerCase().includes(q) ||
            b.columnRight?.toLowerCase().includes(q)
        );
        const matchDb = item.databaseRows?.some((r) => r.task.toLowerCase().includes(q));
        if (!matchTitle && !matchTags && !matchBlocks && !matchDb) return false;
      }

      return true;
    });
  }, [docs, activeNav, filters, searchQuery]);

  // Active filter count
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleToggleTree = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleCreateNew = (type: DocType) => {
    setIsNewMenuOpen(false);
    const spaceCategory = activeNav.startsWith('personal') ? 'personal' : 'team';
    const spaceName = activeNav.startsWith('personal')
      ? '我的文档'
      : activeNav.startsWith('team:')
      ? activeNav.replace('team:', '')
      : groupName;

    const newId = `doc-${Date.now()}`;
    let newDoc: TeamDocItem;

    if (type === 'file') {
      newDoc = {
        id: newId,
        title: '新上传项目资源包.zip',
        type: 'file',
        spaceCategory,
        spaceName,
        icon: '📦',
        updatedAt: '刚刚上传',
        updatedBy: 'Alex Mercer (我)',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        collaborators: [],
        tags: ['资源', '附件'],
        size: '3.6 MB',
        isFavorite: false,
      };
      setDocs((prev) => [newDoc, ...prev]);
      setActiveFileForPreview(newDoc);
      showToast('📤 已上传文件【新上传项目资源包.zip】并加入当前空间');
    } else if (type === 'folder') {
      newDoc = {
        id: newId,
        title: '新文件夹 · 资料归档',
        type: 'folder',
        spaceCategory,
        spaceName,
        icon: '📁',
        updatedAt: '刚刚创建',
        updatedBy: 'Alex Mercer (我)',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        collaborators: [],
        tags: ['文件夹'],
      };
      setDocs((prev) => [newDoc, ...prev]);
      showToast('📁 已创建新文件夹【新文件夹 · 资料归档】');
    } else {
      const titleMap: Record<DocType, string> = {
        page: '无标题空白页面',
        meeting_notes: '团队协作周会纪要',
        project_plan: '城市探索新路线项目方案',
        todo_list: '重点事项执行清单',
        knowledge_base: '团队新知识库专题',
        database: '新建项目进度与预算数据库',
        file: '附件文件',
        folder: '文件夹',
      };
      const iconMap: Record<DocType, string> = {
        page: '📄',
        meeting_notes: '📝',
        project_plan: '🚀',
        todo_list: '✅',
        knowledge_base: '📚',
        database: '📊',
        file: '📎',
        folder: '📁',
      };

      newDoc = {
        id: newId,
        title: titleMap[type],
        type,
        spaceCategory,
        spaceName,
        icon: iconMap[type],
        updatedAt: '刚刚编辑',
        updatedBy: 'Alex Mercer (我)',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        collaborators: [
          {
            id: 'c-1',
            name: 'Alex Mercer',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            role: '组长',
            isOnline: true,
          },
        ],
        tags: [type === 'database' ? '数据库' : '草稿'],
        blocks: [
          {
            id: `b-${Date.now()}-1`,
            type: 'h1',
            content: titleMap[type],
          },
          {
            id: `b-${Date.now()}-2`,
            type: 'paragraph',
            content: '在此输入内容正文，支持段落、清单、表格、代码及双栏排版。',
          },
        ],
        databaseRows:
          type === 'database'
            ? [
                {
                  id: 'r-new-1',
                  task: '项目阶段1：需求确认',
                  owner: {
                    name: 'Alex Mercer (我)',
                    avatar:
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
                  },
                  status: '进行中',
                  dueDate: '2026-09-25',
                  tag: '核心任务',
                  budget: '¥ 1,200',
                },
              ]
            : undefined,
      };

      setDocs((prev) => [newDoc, ...prev]);
      setActiveDocForEdit(newDoc);
      showToast(`✨ 已创建【${titleMap[type]}】并自动打开编辑器`);
    }
  };

  const handleUpdateDoc = (updated: TeamDocItem) => {
    setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    if (activeDocForEdit && activeDocForEdit.id === updated.id) {
      setActiveDocForEdit(updated);
    }
  };

  const handleDeleteToTrash = (docId: string) => {
    setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, isDeleted: true } : d)));
    showToast('🗑️ 已移入回收站（可随时恢复）');
  };

  const handleRestoreFromTrash = (docId: string) => {
    setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, isDeleted: false } : d)));
    showToast('♻️ 已从回收站恢复该文档');
  };

  const handleToggleFavorite = (docId: string) => {
    setDocs((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          const next = !d.isFavorite;
          showToast(next ? '⭐ 已加入我的收藏' : '已取消收藏');
          return { ...d, isFavorite: next };
        }
        return d;
      })
    );
  };

  const handleRenameDoc = (docId: string, newTitle: string) => {
    setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, title: newTitle } : d)));
  };

  const handleOpenItem = (item: TeamDocItem) => {
    if (item.type === 'file') {
      setActiveFileForPreview(item);
    } else if (item.type === 'folder') {
      showToast(`📁 已展开并进入文件夹【${item.title}】`);
    } else {
      setActiveDocForEdit(item);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white text-[#1C1E21] font-sans select-none overflow-hidden">
      {/* 1. TOP HEADER (Stellar straight-edge bar) */}
      <div className="h-14 px-4 border-b border-[#E4E6EB] bg-white flex items-center justify-between shrink-0 select-none">
        {/* Left: Back to Group & Space Name */}
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          <button
            onClick={onBack}
            aria-label="返回小组详情"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md border border-[#E4E6EB] hover:border-[#1877F2] hover:bg-blue-50/40 text-xs font-semibold text-[#1C1E21] transition-colors shrink-0"
          >
            <ArrowLeft size={14} className="text-[#1877F2]" />
            <span>返回小组</span>
          </button>

          <div className="h-4 w-px bg-[#E4E6EB] hidden sm:block shrink-0" />

          <div className="flex items-center space-x-2 truncate">
            <h1 className="text-sm font-black text-[#1C1E21] truncate flex items-center space-x-1.5">
              <span>Stellar 文档空间</span>
              <span className="hidden sm:inline text-xs text-[#65676B] font-normal">
                · {groupName}
              </span>
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-[#1877F2] border border-[#1877F2]/20 rounded-md shrink-0">
              原型演示数据
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-label="搜索文档与正文关键字"
            className={`p-2 rounded-md border transition-colors ${
              isSearchOpen || searchQuery
                ? 'border-[#1877F2] text-[#1877F2] bg-blue-50/30'
                : 'border-[#E4E6EB] text-[#65676B] hover:text-[#1C1E21] hover:bg-gray-50'
            }`}
          >
            <Search size={15} />
          </button>

          {/* Filter Trigger */}
          <button
            onClick={() => setIsFilterPanelOpen((prev) => !prev)}
            aria-label="筛选空间类型与标签"
            className={`flex items-center space-x-1 p-2 sm:px-2.5 sm:py-1.5 rounded-md border text-xs font-semibold transition-colors ${
              isFilterPanelOpen || activeFilterCount > 0
                ? 'border-[#1877F2] text-[#1877F2] bg-blue-50/30'
                : 'border-[#E4E6EB] text-[#65676B] hover:text-[#1C1E21] hover:bg-gray-50'
            }`}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">筛选</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-[#1877F2] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle: List vs Grid */}
          <div className="hidden sm:inline-flex rounded-md border border-[#E4E6EB] p-0.5 bg-gray-50">
            <button
              onClick={() => setViewMode('list')}
              aria-label="切换列表视图"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-[#1877F2] border border-[#E4E6EB] shadow-2xs'
                  : 'text-[#65676B] hover:text-[#1C1E21]'
              }`}
            >
              <ListIcon size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              aria-label="切换网格视图"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-[#1877F2] border border-[#E4E6EB] shadow-2xs'
                  : 'text-[#65676B] hover:text-[#1C1E21]'
              }`}
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          {/* Member Avatars Group */}
          <div className="hidden lg:flex items-center -space-x-2 pl-2">
            {[
              {
                name: 'Alex Mercer',
                avatar:
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
              },
              {
                name: 'Sarah Chen',
                avatar:
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
              },
              {
                name: 'Lucas Zhao',
                avatar:
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
              },
            ].map((m, i) => (
              <img
                key={i}
                src={m.avatar}
                alt={m.name}
                referrerPolicy="no-referrer"
                title={m.name}
                className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-[#E4E6EB]"
              />
            ))}
          </div>

          {/* New Button with Dropdown Menu */}
          <div className="relative" ref={newMenuRef}>
            <button
              onClick={() => setIsNewMenuOpen((prev) => !prev)}
              aria-label="新建页面或文件"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-md text-xs font-bold shadow-2xs transition-colors"
            >
              <Plus size={14} />
              <span>新建</span>
            </button>

            {isNewMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-[#E4E6EB] rounded-md shadow-xl py-1.5 z-30 text-xs text-[#1C1E21] animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  新建页面与模板
                </div>
                <button
                  onClick={() => handleCreateNew('page')}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
                >
                  <FileText size={15} className="text-[#1877F2]" />
                  <span>空白页面</span>
                </button>
                <button
                  onClick={() => handleCreateNew('meeting_notes')}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
                >
                  <Clock size={15} className="text-[#1877F2]" />
                  <span>会议纪要</span>
                </button>
                <button
                  onClick={() => handleCreateNew('project_plan')}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
                >
                  <Briefcase size={15} className="text-[#1877F2]" />
                  <span>项目方案</span>
                </button>
                <button
                  onClick={() => handleCreateNew('todo_list')}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
                >
                  <CheckSquare size={15} className="text-[#1877F2]" />
                  <span>任务清单</span>
                </button>
                <button
                  onClick={() => handleCreateNew('knowledge_base')}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
                >
                  <BookOpen size={15} className="text-[#1877F2]" />
                  <span>知识库</span>
                </button>
                <button
                  onClick={() => handleCreateNew('database')}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
                >
                  <Database size={15} className="text-[#1877F2]" />
                  <span>数据库页面</span>
                </button>
                <div className="border-t border-[#E4E6EB] my-1" />
                <button
                  onClick={() => handleCreateNew('file')}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors font-semibold"
                >
                  <Upload size={15} className="text-[#1877F2]" />
                  <span>上传文件 (ZIP/PDF)</span>
                </button>
                <button
                  onClick={() => handleCreateNew('folder')}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors font-semibold"
                >
                  <FolderPlus size={15} className="text-[#1877F2]" />
                  <span>新建文件夹</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH BAR (Toggleable) */}
      {isSearchOpen && (
        <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#E4E6EB] flex items-center space-x-2 shrink-0 animate-in fade-in duration-100">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文档标题、正文关键字 (例如输入“路线”)..."
            className="flex-1 bg-white border border-[#E4E6EB] rounded-md px-3 py-1.5 text-xs text-[#1C1E21] focus:outline-none focus:border-[#1877F2]"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#65676B] hover:text-[#1C1E21] px-2 py-1"
            >
              清空
            </button>
          )}
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-md"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* FILTER DRAWER / BAR */}
      {isFilterPanelOpen && (
        <div className="px-4 py-3 bg-gray-50 border-b border-[#E4E6EB] shrink-0 text-xs animate-in fade-in duration-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Space filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[#65676B] font-semibold">空间:</span>
              <select
                value={filters.space || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, space: e.target.value || undefined }))}
                className="px-2 py-1 bg-white border border-[#E4E6EB] rounded-md text-xs focus:outline-none focus:border-[#1877F2]"
              >
                <option value="">全部空间</option>
                <option value="城市探索组">城市探索组</option>
                <option value="项目资料库">项目资料库</option>
                <option value="我的文档">我的文档</option>
              </select>
            </div>

            {/* Type filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[#65676B] font-semibold">类型:</span>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value || undefined }))}
                className="px-2 py-1 bg-white border border-[#E4E6EB] rounded-md text-xs focus:outline-none focus:border-[#1877F2]"
              >
                <option value="">全部类型</option>
                <option value="page">标准页面</option>
                <option value="meeting_notes">会议纪要</option>
                <option value="knowledge_base">知识库</option>
                <option value="database">数据库</option>
                <option value="file">附件文件</option>
              </select>
            </div>

            {/* Tag filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[#65676B] font-semibold">标签:</span>
              <select
                value={filters.tag || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value || undefined }))}
                className="px-2 py-1 bg-white border border-[#E4E6EB] rounded-md text-xs focus:outline-none focus:border-[#1877F2]"
              >
                <option value="">全部标签</option>
                <option value="路线/地标">路线/地标</option>
                <option value="团队指南">团队指南</option>
                <option value="复盘">复盘</option>
                <option value="预算">预算</option>
                <option value="个人">个人</option>
              </select>
            </div>

            {/* Member filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[#65676B] font-semibold">成员:</span>
              <select
                value={filters.member || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, member: e.target.value || undefined }))}
                className="px-2 py-1 bg-white border border-[#E4E6EB] rounded-md text-xs focus:outline-none focus:border-[#1877F2]"
              >
                <option value="">全部成员</option>
                <option value="Alex Mercer (我)">Alex Mercer (我)</option>
                <option value="Sarah Chen">Sarah Chen</option>
                <option value="Lucas Zhao">Lucas Zhao</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({})}
                className="text-xs text-red-600 hover:underline font-semibold ml-auto"
              >
                重置所有筛选
              </button>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE FILTER CHIPS */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="px-4 py-1.5 bg-blue-50/40 border-b border-[#E4E6EB] flex flex-wrap items-center gap-1.5 text-[11px] shrink-0">
          <span className="text-[#65676B]">已生效条件：</span>
          {searchQuery && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white border border-[#E4E6EB] rounded-md text-[#1877F2] font-semibold">
              <span>关键词: "{searchQuery}"</span>
              <X size={11} className="cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          )}
          {filters.space && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white border border-[#E4E6EB] rounded-md text-[#1877F2]">
              <span>空间: {filters.space}</span>
              <X
                size={11}
                className="cursor-pointer"
                onClick={() => setFilters((p) => ({ ...p, space: undefined }))}
              />
            </span>
          )}
          {filters.type && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white border border-[#E4E6EB] rounded-md text-[#1877F2]">
              <span>类型: {filters.type}</span>
              <X
                size={11}
                className="cursor-pointer"
                onClick={() => setFilters((p) => ({ ...p, type: undefined }))}
              />
            </span>
          )}
          {filters.tag && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white border border-[#E4E6EB] rounded-md text-[#1877F2]">
              <span>标签: {filters.tag}</span>
              <X
                size={11}
                className="cursor-pointer"
                onClick={() => setFilters((p) => ({ ...p, tag: undefined }))}
              />
            </span>
          )}
          <span className="text-[#65676B] ml-2">找到 {filteredDocs.length} 条结果</span>
        </div>
      )}

      {/* MOBILE COLUMN SELECTOR TAB (for < 768px screens) */}
      <div className="flex md:hidden border-b border-[#E4E6EB] bg-[#FAFAFA] text-xs font-semibold shrink-0">
        <button
          onClick={() => setMobileTab('nav')}
          className={`flex-1 py-2 text-center transition-colors border-b-2 ${
            mobileTab === 'nav'
              ? 'border-[#1877F2] text-[#1877F2] bg-white'
              : 'border-transparent text-[#65676B]'
          }`}
        >
          空间导航
        </button>
        <button
          onClick={() => setMobileTab('tree')}
          className={`flex-1 py-2 text-center transition-colors border-b-2 ${
            mobileTab === 'tree'
              ? 'border-[#1877F2] text-[#1877F2] bg-white'
              : 'border-transparent text-[#65676B]'
          }`}
        >
          页面树
        </button>
        <button
          onClick={() => setMobileTab('content')}
          className={`flex-1 py-2 text-center transition-colors border-b-2 ${
            mobileTab === 'content'
              ? 'border-[#1877F2] text-[#1877F2] bg-white'
              : 'border-transparent text-[#65676B]'
          }`}
        >
          内容列表 ({filteredDocs.length})
        </button>
      </div>

      {/* 2. THREE-COLUMN INFORMATION ARCHITECTURE BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: 空间导航 (Space Navigation) */}
        <div
          className={`${
            mobileTab === 'nav' ? 'flex' : 'hidden'
          } md:flex flex-col w-full md:w-56 lg:w-60 border-r border-[#E4E6EB] bg-[#FAFAFA] shrink-0 overflow-y-auto p-3 space-y-4`}
        >
          {/* Quick Sections */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              快速访问
            </div>
            <button
              onClick={() => {
                setActiveNav('recent');
                setMobileTab('content');
              }}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                activeNav === 'recent'
                  ? 'bg-white text-[#1877F2] font-bold border border-[#E4E6EB] shadow-2xs'
                  : 'text-[#1C1E21] hover:bg-[#E4E6EB]/60'
              }`}
            >
              <Clock size={14} className="text-[#1877F2]" />
              <span>最近编辑</span>
            </button>
            <button
              onClick={() => {
                setActiveNav('favorites');
                setMobileTab('content');
              }}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                activeNav === 'favorites'
                  ? 'bg-white text-[#1877F2] font-bold border border-[#E4E6EB] shadow-2xs'
                  : 'text-[#1C1E21] hover:bg-[#E4E6EB]/60'
              }`}
            >
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span>我的收藏</span>
            </button>
            <button
              onClick={() => {
                setActiveNav('shared');
                setMobileTab('content');
              }}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                activeNav === 'shared'
                  ? 'bg-white text-[#1877F2] font-bold border border-[#E4E6EB] shadow-2xs'
                  : 'text-[#1C1E21] hover:bg-[#E4E6EB]/60'
              }`}
            >
              <Share2 size={14} className="text-[#1877F2]" />
              <span>共享给我</span>
            </button>
            <button
              onClick={() => {
                setActiveNav('trash');
                setMobileTab('content');
              }}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                activeNav === 'trash'
                  ? 'bg-white text-red-600 font-bold border border-[#E4E6EB] shadow-2xs'
                  : 'text-[#1C1E21] hover:bg-[#E4E6EB]/60'
              }`}
            >
              <Trash2 size={14} className="text-red-500" />
              <span>回收站</span>
            </button>
          </div>

          {/* Team Spaces */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <span>团队空间</span>
              <Users size={12} />
            </div>
            <button
              onClick={() => {
                setActiveNav('team:城市探索组');
                setMobileTab('content');
              }}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                activeNav === 'team:城市探索组'
                  ? 'bg-white text-[#1877F2] font-bold border border-[#E4E6EB] shadow-2xs'
                  : 'text-[#1C1E21] hover:bg-[#E4E6EB]/60'
              }`}
            >
              <span className="text-sm">🧭</span>
              <span className="truncate">城市探索组 (当前)</span>
            </button>
            <button
              onClick={() => {
                setActiveNav('team:项目资料库');
                setMobileTab('content');
              }}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                activeNav === 'team:项目资料库'
                  ? 'bg-white text-[#1877F2] font-bold border border-[#E4E6EB] shadow-2xs'
                  : 'text-[#1C1E21] hover:bg-[#E4E6EB]/60'
              }`}
            >
              <span className="text-sm">📁</span>
              <span className="truncate">项目资料库</span>
            </button>
          </div>

          {/* Personal Spaces */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <span>个人空间</span>
              <User size={12} />
            </div>
            <button
              onClick={() => {
                setActiveNav('personal:我的文档');
                setMobileTab('content');
              }}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                activeNav === 'personal:我的文档'
                  ? 'bg-white text-[#1877F2] font-bold border border-[#E4E6EB] shadow-2xs'
                  : 'text-[#1C1E21] hover:bg-[#E4E6EB]/60'
              }`}
            >
              <span className="text-sm">💡</span>
              <span className="truncate">我的文档</span>
            </button>
          </div>
        </div>

        {/* COLUMN 2: 页面树 (Page Tree) */}
        <div
          className={`${
            mobileTab === 'tree' ? 'flex' : 'hidden'
          } md:flex flex-col w-full md:w-64 lg:w-72 border-r border-[#E4E6EB] bg-white shrink-0 overflow-y-auto p-3`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E4E6EB]">
            <span className="text-xs font-bold text-[#1C1E21] flex items-center space-x-1.5">
              <FolderGit2 size={14} className="text-[#1877F2]" />
              <span>目录页面树</span>
            </span>
            <span className="text-[10px] text-[#65676B] bg-gray-100 px-1.5 py-0.5 rounded-md">
              支持嵌套
            </span>
          </div>

          {/* Tree hierarchy */}
          <div className="space-y-1 text-xs">
            {/* Team Root */}
            <div>
              <div
                onClick={() => handleToggleTree('teamRoot')}
                className="flex items-center space-x-1.5 p-1.5 rounded-md hover:bg-gray-50 cursor-pointer font-bold text-[#1C1E21]"
              >
                {expandedNodes['teamRoot'] ? (
                  <ChevronDown size={14} className="text-gray-400" />
                ) : (
                  <ChevronRight size={14} className="text-gray-400" />
                )}
                <Folder size={14} className="text-[#1877F2]" />
                <span className="truncate">城市探索组工作空间</span>
              </div>

              {expandedNodes['teamRoot'] && (
                <div className="pl-4 space-y-1 border-l border-[#E4E6EB] ml-3 mt-1">
                  {docs
                    .filter((d) => !d.isDeleted && d.spaceCategory === 'team')
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          handleOpenItem(item);
                          setMobileTab('content');
                        }}
                        className="flex items-center justify-between p-1.5 rounded-md hover:bg-blue-50/50 cursor-pointer text-[#1C1E21] group transition-colors"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="text-sm shrink-0">{item.icon}</span>
                          <span className="truncate text-xs font-medium">{item.title}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 shrink-0">
                          {item.updatedAt}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Personal Root */}
            <div className="pt-2">
              <div
                onClick={() => handleToggleTree('personalRoot')}
                className="flex items-center space-x-1.5 p-1.5 rounded-md hover:bg-gray-50 cursor-pointer font-bold text-[#1C1E21]"
              >
                {expandedNodes['personalRoot'] ? (
                  <ChevronDown size={14} className="text-gray-400" />
                ) : (
                  <ChevronRight size={14} className="text-gray-400" />
                )}
                <Folder size={14} className="text-[#1877F2]" />
                <span className="truncate">个人知识库空间</span>
              </div>

              {expandedNodes['personalRoot'] && (
                <div className="pl-4 space-y-1 border-l border-[#E4E6EB] ml-3 mt-1">
                  {docs
                    .filter((d) => !d.isDeleted && d.spaceCategory === 'personal')
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          handleOpenItem(item);
                          setMobileTab('content');
                        }}
                        className="flex items-center justify-between p-1.5 rounded-md hover:bg-blue-50/50 cursor-pointer text-[#1C1E21] group transition-colors"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="text-sm shrink-0">{item.icon}</span>
                          <span className="truncate text-xs font-medium">{item.title}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 shrink-0">
                          {item.updatedAt}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: 内容列表 (Content List) */}
        <div
          className={`${
            mobileTab === 'content' ? 'flex' : 'hidden'
          } md:flex flex-col flex-1 bg-[#FAFAFA] overflow-y-auto p-4`}
        >
          {/* Section Subhead & Quick Stats */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E4E6EB]">
            <div>
              <h2 className="text-sm font-bold text-[#1C1E21]">
                {activeNav === 'recent'
                  ? '最近编辑与更新'
                  : activeNav === 'favorites'
                  ? '我的收藏夹'
                  : activeNav === 'shared'
                  ? '共享给我的资料'
                  : activeNav === 'trash'
                  ? '回收站（已删除文档）'
                  : activeNav.replace('team:', '').replace('personal:', '')}
              </h2>
              <p className="text-[11px] text-[#65676B]">
                共 {filteredDocs.length} 项资料 · 原型演示数据
              </p>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex sm:hidden items-center space-x-1 border border-[#E4E6EB] rounded-md p-0.5 bg-white">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'text-[#1877F2]' : 'text-[#65676B]'}`}
              >
                <ListIcon size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'text-[#1877F2]' : 'text-[#65676B]'}`}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          {/* Empty State */}
          {filteredDocs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-[#65676B]">
              <div className="w-14 h-14 rounded-md bg-white border border-[#E4E6EB] flex items-center justify-center text-gray-400 mb-3 shadow-2xs">
                <Search size={24} />
              </div>
              <div className="text-sm font-bold text-[#1C1E21]">未找到匹配的文档或文件</div>
              <p className="text-xs text-[#65676B] max-w-sm mt-1">
                请尝试更换搜索关键字，或清除筛选条件查看全部演示资料。
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({});
                }}
                className="mt-4 px-3 py-1.5 text-xs font-semibold bg-[#1877F2] text-white rounded-md shadow-2xs"
              >
                重置搜索与筛选
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="bg-white border border-[#E4E6EB] rounded-md shadow-2xs overflow-hidden divide-y divide-[#E4E6EB]">
              {filteredDocs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className="p-3 hover:bg-blue-50/20 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  {/* Left: Icon & Title & Tags */}
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#1C1E21] group-hover:text-[#1877F2] transition-colors truncate">
                          {item.title}
                        </span>
                        {item.type === 'database' && (
                          <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-md shrink-0">
                            数据库 ({item.databaseRows?.length || 12} 条)
                          </span>
                        )}
                        {item.type === 'file' && (
                          <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-gray-100 text-[#65676B] border border-[#E4E6EB] rounded-md shrink-0">
                            {item.size || '2.4 MB'}
                          </span>
                        )}
                        {(item.commentsCount || 0) > 0 && (
                          <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-blue-50 text-[#1877F2] rounded-md border border-[#1877F2]/20 shrink-0">
                            💬 {item.commentsCount}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-[#65676B]">
                        <span>{item.spaceName}</span>
                        <span>·</span>
                        <span>{item.updatedAt}</span>
                        <span>·</span>
                        <span>{item.updatedBy}</span>
                        {(item.tags || []).map((t, tIdx) => (
                          <span
                            key={`item-tag-${t}-${tIdx}`}
                            className="px-1.5 py-0.2 bg-gray-50 text-[#65676B] rounded-md border border-[#E4E6EB] text-[10px]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Collaborators & Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Collaborator avatars */}
                    <div className="hidden sm:flex items-center -space-x-1.5 mr-2">
                      {(item.collaborators || []).slice(0, 3).map((c, cIdx) => (
                        <img
                          key={`collab-${c.id || cIdx}-${cIdx}`}
                          src={c.avatar}
                          alt={c.name}
                          referrerPolicy="no-referrer"
                          title={c.name}
                          className="w-5 h-5 rounded-full object-cover border border-white ring-1 ring-[#E4E6EB]"
                        />
                      ))}
                    </div>

                    {/* Trash mode: Restore button */}
                    {activeNav === 'trash' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreFromTrash(item.id);
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-green-50 border border-green-300 text-green-700 text-xs font-semibold rounded-md hover:bg-green-100 transition-colors"
                      >
                        <RotateCcw size={12} />
                        <span>恢复</span>
                      </button>
                    ) : (
                      <>
                        {/* Favorite button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item.id);
                          }}
                          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
                            item.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Star size={14} className={item.isFavorite ? 'fill-yellow-500' : ''} />
                        </button>

                        {/* Share trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareModalDoc(item);
                          }}
                          className="p-1.5 text-gray-400 hover:text-[#1877F2] hover:bg-blue-50 rounded-md transition-colors"
                          title="分享权限"
                        >
                          <Share2 size={14} />
                        </button>

                        {/* Delete to trash */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteToTrash(item.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="移入回收站"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDocs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className="p-3.5 bg-white border border-[#E4E6EB] rounded-md shadow-2xs hover:border-[#1877F2] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item.id);
                          }}
                          className={`p-1 rounded ${item.isFavorite ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          <Star size={13} className={item.isFavorite ? 'fill-yellow-500' : ''} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xs font-bold text-[#1C1E21] group-hover:text-[#1877F2] mt-2 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#65676B] mt-1 line-clamp-2">
                      {item.type === 'database'
                        ? '包含 12 条任务记录的综合预算与物资分配数据库'
                        : item.type === 'file'
                        ? `附件资源包 (${item.size || '2.4 MB'})`
                        : item.blocks?.[1]?.content || '协作知识文档'}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E4E6EB] flex items-center justify-between text-[10px] text-[#65676B]">
                    <span>{item.updatedAt}</span>
                    <span className="font-semibold text-[#1877F2]">{item.spaceName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. MODALS AND DRAWERS */}
      <DocEditorModal
        isOpen={Boolean(activeDocForEdit)}
        onClose={() => setActiveDocForEdit(null)}
        doc={activeDocForEdit}
        onUpdateDoc={handleUpdateDoc}
        onDeleteDoc={handleDeleteToTrash}
        showToast={showToast}
      />

      <FilePreviewModal
        isOpen={Boolean(activeFileForPreview)}
        onClose={() => setActiveFileForPreview(null)}
        file={activeFileForPreview}
        onToggleFavorite={handleToggleFavorite}
        onDeleteToTrash={handleDeleteToTrash}
        onRename={handleRenameDoc}
        showToast={showToast}
      />

      {shareModalDoc && (
        <DocShareModal
          isOpen={Boolean(shareModalDoc)}
          onClose={() => setShareModalDoc(null)}
          doc={shareModalDoc}
          onUpdatePermissions={(docId, permissions, linkEnabled, linkAccess) => {
            const updated = {
              ...shareModalDoc,
              permissions,
              isLinkSharingEnabled: linkEnabled,
              linkAccess,
            };
            handleUpdateDoc(updated);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};
