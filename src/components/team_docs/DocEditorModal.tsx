import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  X,
  Share2,
  MessageSquare,
  History,
  MoreHorizontal,
  Star,
  Plus,
  CheckSquare,
  Square,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Type,
  Quote,
  Code,
  Minus,
  Table as TableIcon,
  Paperclip,
  Columns,
  Trash2,
  Copy,
  FolderInput,
  Tag,
  Edit3,
  Check,
  ChevronRight,
  Eye,
  Filter,
  Kanban,
  TableProperties,
} from 'lucide-react';
import { TeamDocItem, DocBlock, BlockType, DatabaseRowItem, DocVersion, MemberPermission } from './types';
import { DocShareModal } from './DocShareModal';
import { DocCommentsDrawer } from './DocCommentsDrawer';
import { DocVersionHistoryModal } from './DocVersionHistoryModal';
import { FilePreviewModal } from './FilePreviewModal';

interface DocEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: TeamDocItem | null;
  onUpdateDoc: (updatedDoc: TeamDocItem) => void;
  onDeleteDoc: (docId: string) => void;
  showToast: (msg: string) => void;
}

export const DocEditorModal: React.FC<DocEditorModalProps> = ({
  isOpen,
  onClose,
  doc,
  onUpdateDoc,
  onDeleteDoc,
  showToast,
}) => {
  // Local editor states
  const [title, setTitle] = useState(doc?.title || '');
  const [icon, setIcon] = useState(doc?.icon || '📄');
  const [blocks, setBlocks] = useState<DocBlock[]>(doc?.blocks || []);
  const [databaseRows, setDatabaseRows] = useState<DatabaseRowItem[]>(doc?.databaseRows || []);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isFavorite, setIsFavorite] = useState(Boolean(doc?.isFavorite));

  // Sub-dialog states
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isAddBlockMenuOpen, setIsAddBlockMenuOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<TeamDocItem | null>(null);

  // Database view modes: 'table' | 'kanban'
  const [dbViewMode, setDbViewMode] = useState<'table' | 'kanban'>('table');
  const [dbStatusFilter, setDbStatusFilter] = useState<string>('all');
  const [dbOwnerFilter, setDbOwnerFilter] = useState<string>('all');

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const addBlockMenuRef = useRef<HTMLDivElement>(null);

  // Sync when doc prop changes
  useEffect(() => {
    if (doc) {
      setTitle(doc.title);
      setIcon(doc.icon);
      setBlocks(doc.blocks || []);
      setDatabaseRows(doc.databaseRows || []);
      setIsFavorite(Boolean(doc.isFavorite));
    }
  }, [doc?.id]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddBlockMenuOpen) setIsAddBlockMenuOpen(false);
        else if (isMoreMenuOpen) setIsMoreMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddBlockMenuOpen, isMoreMenuOpen]);

  // Auto save simulation
  const triggerAutoSave = (newBlocks: DocBlock[], newRows?: DatabaseRowItem[], newTitle?: string) => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      const updated: TeamDocItem = {
        ...doc,
        title: newTitle !== undefined ? newTitle : title,
        icon,
        blocks: newBlocks,
        databaseRows: newRows !== undefined ? newRows : databaseRows,
        isFavorite,
        updatedAt: '刚刚编辑',
      };
      onUpdateDoc(updated);
    }, 400);
  };

  const handleTitleChange = (newVal: string) => {
    setTitle(newVal);
    triggerAutoSave(blocks, databaseRows, newVal);
  };

  const handleToggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    onUpdateDoc({ ...doc, isFavorite: next });
    showToast(next ? '⭐ 已添加至我的收藏' : '已取消收藏');
  };

  // Block manipulations
  const handleToggleTodo = (blockId: string) => {
    const next = blocks.map((b) => (b.id === blockId ? { ...b, checked: !b.checked } : b));
    setBlocks(next);
    triggerAutoSave(next);
  };

  const handleBlockContentChange = (blockId: string, content: string) => {
    const next = blocks.map((b) => (b.id === blockId ? { ...b, content } : b));
    setBlocks(next);
    triggerAutoSave(next);
  };

  const handleInsertBlock = (type: BlockType) => {
    const newBlock: DocBlock = {
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      content:
        type === 'h1'
          ? '新的一级标题'
          : type === 'h2'
          ? '新的二级标题'
          : type === 'todo'
          ? '新增待办任务事项'
          : type === 'bullet'
          ? '无序项目要点'
          : type === 'numbered'
          ? '1. 编号清单项'
          : type === 'quote'
          ? '这是一段团队协作指引引用。'
          : type === 'code'
          ? '// 在此输入代码或命令行参数\nconst location = { lat: 36.0610, lng: 103.8320 };'
          : type === 'divider'
          ? ''
          : type === 'table'
          ? ''
          : type === 'columns'
          ? ''
          : type === 'attachment'
          ? '城市探索路线坐标点数据包.kml'
          : '新的段落文本内容...',
      checked: false,
      tableData:
        type === 'table'
          ? [
              ['项目阶段', '负责人', '状态'],
              ['初筛路线', 'Alex Mercer', '进行中'],
              ['安全复核', 'Lucas Zhao', '待排期'],
            ]
          : undefined,
      columnLeft: type === 'columns' ? '左侧分栏：任务要求与执行步骤' : undefined,
      columnRight: type === 'columns' ? '右侧分栏：验收标准与配合组员' : undefined,
      fileMeta:
        type === 'attachment'
          ? {
              name: '城市探索路线坐标点数据包.kml',
              size: '1.2 MB',
              type: 'KML地理轨迹',
              uploader: 'Alex Mercer',
              date: '2026-09-07',
            }
          : undefined,
    };

    const next = [...blocks, newBlock];
    setBlocks(next);
    triggerAutoSave(next);
    setIsAddBlockMenuOpen(false);
    showToast(`➕ 已添加【${getBlockTypeName(type)}】块`);
  };

  const handleDeleteBlock = (blockId: string) => {
    const next = blocks.filter((b) => b.id !== blockId);
    setBlocks(next);
    triggerAutoSave(next);
    showToast('已移除该内容块');
  };

  const handleUpdateTableCell = (blockId: string, rIdx: number, cIdx: number, val: string) => {
    const next = blocks.map((b) => {
      if (b.id === blockId && b.tableData) {
        const newTable = b.tableData.map((row, ri) =>
          ri === rIdx ? row.map((cell, ci) => (ci === cIdx ? val : cell)) : [...row]
        );
        return { ...b, tableData: newTable };
      }
      return b;
    });
    setBlocks(next);
    triggerAutoSave(next);
  };

  const handleAddTableRow = (blockId: string) => {
    const next = blocks.map((b) => {
      if (b.id === blockId && b.tableData) {
        const colCount = b.tableData[0]?.length || 3;
        const newRow = Array(colCount).fill('新增单元格');
        return { ...b, tableData: [...b.tableData, newRow] };
      }
      return b;
    });
    setBlocks(next);
    triggerAutoSave(next);
    showToast('已为表格添加一行');
  };

  // Database manipulation
  const handleAddDatabaseRow = () => {
    const newRow: DatabaseRowItem = {
      id: `row-${Date.now()}`,
      task: '新录入任务事项与预算预算支出',
      owner: {
        name: 'Alex Mercer (我)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      },
      status: '未开始',
      dueDate: '2026-09-20',
      tag: '预算明细',
      budget: '¥ 1,000',
    };
    const next = [newRow, ...databaseRows];
    setDatabaseRows(next);
    triggerAutoSave(blocks, next);
    showToast('已在数据库中新增一条记录');
  };

  const handleUpdateDatabaseRowStatus = (rowId: string, status: '未开始' | '进行中' | '已完成') => {
    const next = databaseRows.map((r) => (r.id === rowId ? { ...r, status } : r));
    setDatabaseRows(next);
    triggerAutoSave(blocks, next);
    showToast(`已变更状态为【${status}】`);
  };

  const handleUpdateDatabaseCell = (rowId: string, field: keyof DatabaseRowItem, value: any) => {
    const next = databaseRows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r));
    setDatabaseRows(next);
    triggerAutoSave(blocks, next);
  };

  // Restore version handler
  const handleRestoreVersion = (docId: string, version: DocVersion) => {
    if (version.blocksSnapshot && version.blocksSnapshot.length > 0) {
      setBlocks(version.blocksSnapshot);
      triggerAutoSave(version.blocksSnapshot);
    } else {
      triggerAutoSave(blocks);
    }
  };

  // Add Comment handler
  const handleAddComment = (content: string) => {
    const newComment = {
      id: `cm-${Date.now()}`,
      author: 'Alex Mercer (我)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      time: '刚刚',
      content,
      resolved: false,
    };
    const nextComments = [newComment, ...(doc.comments || [])];
    const updated = {
      ...doc,
      comments: nextComments,
      commentsCount: nextComments.length,
    };
    onUpdateDoc(updated);
  };

  const handleToggleResolveComment = (commentId: string) => {
    const nextComments = (doc.comments || []).map((c) =>
      c.id === commentId ? { ...c, resolved: !c.resolved } : c
    );
    const updated = { ...doc, comments: nextComments };
    onUpdateDoc(updated);
  };

  function getBlockTypeName(type: BlockType) {
    switch (type) {
      case 'paragraph':
        return '正文段落';
      case 'h1':
        return '一级标题';
      case 'h2':
        return '二级标题';
      case 'todo':
        return '待办事项';
      case 'bullet':
        return '无序列表';
      case 'numbered':
        return '编号列表';
      case 'quote':
        return '引用标注';
      case 'code':
        return '代码块';
      case 'divider':
        return '分割线';
      case 'table':
        return '行列表格';
      case 'columns':
        return '双栏排版';
      case 'attachment':
        return '文件附件';
      default:
        return '内容块';
    }
  }

  // Filtered database rows
  const filteredDbRows = databaseRows.filter((r) => {
    if (dbStatusFilter !== 'all' && r.status !== dbStatusFilter) return false;
    if (dbOwnerFilter !== 'all' && r.owner.name !== dbOwnerFilter) return false;
    return true;
  });

  if (!isOpen || !doc) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="文档页面编辑器"
      className="fixed inset-0 z-[110] bg-white flex flex-col overflow-hidden text-[#1C1E21]"
    >
      {/* Top Navbar */}
      <div className="h-13 px-4 border-b border-[#E4E6EB] bg-white flex items-center justify-between shrink-0 select-none">
        {/* Left: Back & Breadcrumb */}
        <div className="flex items-center space-x-2 min-w-0 pr-2">
          <button
            onClick={onClose}
            aria-label="返回文档列表"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md border border-[#E4E6EB] hover:border-[#1877F2] hover:bg-blue-50/40 text-xs font-semibold text-[#1C1E21] transition-colors shrink-0"
          >
            <ArrowLeft size={14} className="text-[#1877F2]" />
            <span className="hidden sm:inline">返回空间</span>
          </button>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center space-x-1 text-xs text-[#65676B] truncate">
            <span>{doc.spaceCategory === 'team' ? '团队空间' : '个人空间'}</span>
            <ChevronRight size={12} className="text-gray-400" />
            <span className="font-semibold text-[#1C1E21]">{doc.spaceName}</span>
            <ChevronRight size={12} className="text-gray-400" />
            <span className="truncate max-w-[140px] text-gray-400">{title}</span>
          </div>

          {/* Save Status Badge */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-gray-50 border border-[#E4E6EB] text-[10px] text-[#65676B] shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-green-500' : 'bg-amber-500 animate-ping'}`} />
            <span>{saveStatus === 'saved' ? '已保存' : '保存中...'}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Collaborator Avatars */}
          <div className="hidden sm:flex items-center -space-x-1.5 mr-2">
            {(doc.collaborators || []).slice(0, 3).map((c, idx) => (
              <div key={`collab-${c.id || idx}-${idx}`} className="relative" title={`${c.name} (${c.role || '协作者'})`}>
                <img
                  src={c.avatar}
                  alt={c.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border-2 border-white"
                />
                {c.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 ring-1 ring-white" />
                )}
              </div>
            ))}
          </div>

          {/* Favorite */}
          <button
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? '取消收藏' : '收藏文档'}
            className={`p-1.5 rounded-md border transition-colors ${
              isFavorite
                ? 'border-yellow-300 bg-yellow-50 text-yellow-600'
                : 'border-[#E4E6EB] text-[#65676B] hover:text-[#1C1E21] hover:bg-gray-50'
            }`}
          >
            <Star size={15} className={isFavorite ? 'fill-yellow-500' : ''} />
          </button>

          {/* Comments Trigger */}
          <button
            onClick={() => setIsCommentsOpen(true)}
            aria-label="打开评论讨论"
            className="flex items-center space-x-1 px-2.5 py-1.5 border border-[#E4E6EB] rounded-md text-xs font-semibold text-[#1C1E21] hover:bg-gray-50 transition-colors"
          >
            <MessageSquare size={14} className="text-[#1877F2]" />
            <span className="hidden sm:inline">评论</span>
            {(doc.comments?.length || 0) > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-blue-50 text-[#1877F2] font-bold rounded-md border border-[#1877F2]/20">
                {doc.comments?.length}
              </span>
            )}
          </button>

          {/* Share Button */}
          <button
            onClick={() => setIsShareOpen(true)}
            aria-label="分享与权限设置"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-md text-xs font-bold shadow-2xs transition-colors"
          >
            <Share2 size={13} />
            <span>分享</span>
          </button>

          {/* More Actions Menu */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              aria-label="更多操作"
              className="p-1.5 rounded-md border border-[#E4E6EB] hover:bg-gray-50 text-[#65676B] hover:text-[#1C1E21] transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-[#E4E6EB] rounded-md shadow-lg py-1 z-20 text-xs text-[#1C1E21] animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsHistoryOpen(true);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
                >
                  <History size={14} />
                  <span>查看版本历史</span>
                </button>
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    showToast('🏷️ 已为文档添加标签【路线/重点】');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
                >
                  <Tag size={14} />
                  <span>添加标签</span>
                </button>
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    showToast('📂 已将页面复制到【项目资料库】副本');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
                >
                  <Copy size={14} />
                  <span>复制页面</span>
                </button>
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    showToast('🚚 已移动到【项目资料库】');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
                >
                  <FolderInput size={14} />
                  <span>移动到其他空间</span>
                </button>
                <div className="border-t border-[#E4E6EB] my-1" />
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onDeleteDoc(doc.id);
                    onClose();
                    showToast('🗑️ 已将页面移入回收站（可随时恢复）');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-red-50 text-red-600 text-left transition-colors font-semibold"
                >
                  <Trash2 size={14} />
                  <span>移入回收站</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 overflow-y-auto px-4 py-8 max-w-4xl w-full mx-auto">
        {/* Title Header with Icon */}
        <div className="mb-6 group">
          <div className="flex items-center space-x-3 mb-2">
            <button
              onClick={() => {
                const emojis = ['🧭', '📝', '📚', '💡', '📊', '🚀', '⭐', '🗺️', '📌'];
                const nextEmoji = emojis[(emojis.indexOf(icon) + 1) % emojis.length];
                setIcon(nextEmoji);
                onUpdateDoc({ ...doc, icon: nextEmoji });
              }}
              className="w-10 h-10 rounded-md border border-[#E4E6EB] hover:border-[#1877F2] bg-gray-50 flex items-center justify-center text-2xl transition-colors shadow-2xs"
              title="点击切换图标"
            >
              {icon}
            </button>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-gray-100 text-[#65676B] rounded-md border border-[#E4E6EB]">
                {doc.spaceCategory === 'team' ? '团队空间' : '个人空间'}
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-[#1877F2] rounded-md border border-[#1877F2]/20">
                {doc.spaceName}
              </span>
              {(doc.tags || []).map((t, tIdx) => (
                <span
                  key={`doc-tag-${t}-${tIdx}`}
                  className="px-2 py-0.5 text-[11px] bg-gray-50 text-[#65676B] rounded-md border border-[#E4E6EB]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Editable Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="无标题页面"
            className="w-full text-2xl sm:text-3xl font-black text-[#1C1E21] border-b border-transparent hover:border-[#E4E6EB] focus:border-[#1877F2] pb-1 focus:outline-none transition-colors"
          />

          <div className="flex items-center space-x-3 mt-2 text-xs text-[#65676B]">
            <span>最后编辑：{doc.updatedBy}</span>
            <span>·</span>
            <span>{doc.updatedAt}</span>
            <span>·</span>
            <span className="text-[#1877F2] font-semibold">原型演示数据</span>
          </div>
        </div>

        {/* DATABASE VIEW (If doc is database type) */}
        {doc.type === 'database' && (
          <div className="mb-8 p-4 bg-white border border-[#E4E6EB] rounded-md shadow-2xs">
            {/* Database Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E4E6EB]">
              <div className="flex items-center space-x-1.5">
                <div className="inline-flex rounded-md border border-[#E4E6EB] p-0.5 bg-gray-50">
                  <button
                    onClick={() => setDbViewMode('table')}
                    className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-md font-semibold transition-colors ${
                      dbViewMode === 'table'
                        ? 'bg-white text-[#1877F2] border border-[#E4E6EB] shadow-2xs'
                        : 'text-[#65676B] hover:text-[#1C1E21]'
                    }`}
                  >
                    <TableProperties size={13} />
                    <span>表格视图</span>
                  </button>
                  <button
                    onClick={() => setDbViewMode('kanban')}
                    className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-md font-semibold transition-colors ${
                      dbViewMode === 'kanban'
                        ? 'bg-white text-[#1877F2] border border-[#E4E6EB] shadow-2xs'
                        : 'text-[#65676B] hover:text-[#1C1E21]'
                    }`}
                  >
                    <Kanban size={13} />
                    <span>看板视图</span>
                  </button>
                </div>

                {/* Filters */}
                <select
                  value={dbStatusFilter}
                  onChange={(e) => setDbStatusFilter(e.target.value)}
                  className="px-2 py-1 text-xs border border-[#E4E6EB] rounded-md bg-white text-[#1C1E21] focus:outline-none focus:border-[#1877F2]"
                >
                  <option value="all">全部状态</option>
                  <option value="未开始">未开始</option>
                  <option value="进行中">进行中</option>
                  <option value="已完成">已完成</option>
                </select>

                <select
                  value={dbOwnerFilter}
                  onChange={(e) => setDbOwnerFilter(e.target.value)}
                  className="px-2 py-1 text-xs border border-[#E4E6EB] rounded-md bg-white text-[#1C1E21] focus:outline-none focus:border-[#1877F2]"
                >
                  <option value="all">全部负责人</option>
                  <option value="Sarah Chen">Sarah Chen</option>
                  <option value="Lucas Zhao">Lucas Zhao</option>
                  <option value="Alex Mercer">Alex Mercer</option>
                  <option value="Elena Rostova">Elena Rostova</option>
                </select>
              </div>

              <button
                onClick={handleAddDatabaseRow}
                className="flex items-center space-x-1 px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-md shadow-2xs transition-colors"
              >
                <Plus size={13} />
                <span>新增一行记录</span>
              </button>
            </div>

            {/* Table View */}
            {dbViewMode === 'table' && (
              <div className="overflow-x-auto border border-[#E4E6EB] rounded-md">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E4E6EB] text-[#65676B] font-semibold">
                      <th className="p-2.5">任务内容</th>
                      <th className="p-2.5">负责人</th>
                      <th className="p-2.5">执行状态</th>
                      <th className="p-2.5">截止日期</th>
                      <th className="p-2.5">项目标签</th>
                      <th className="p-2.5">预算金额</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E6EB]">
                    {filteredDbRows.map((row) => (
                      <tr key={row.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="p-2.5 font-medium text-[#1C1E21]">
                          <input
                            type="text"
                            value={row.task}
                            onChange={(e) => handleUpdateDatabaseCell(row.id, 'task', e.target.value)}
                            className="w-full bg-transparent hover:border-b border-[#1877F2] focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center space-x-1.5">
                            <img
                              src={row.owner.avatar}
                              alt={row.owner.name}
                              referrerPolicy="no-referrer"
                              className="w-5 h-5 rounded-full object-cover border border-[#E4E6EB]"
                            />
                            <span>{row.owner.name}</span>
                          </div>
                        </td>
                        <td className="p-2.5">
                          <select
                            value={row.status}
                            onChange={(e) =>
                              handleUpdateDatabaseRowStatus(
                                row.id,
                                e.target.value as '未开始' | '进行中' | '已完成'
                              )
                            }
                            className={`px-2 py-0.5 text-xs font-semibold rounded-md border focus:outline-none ${
                              row.status === '已完成'
                                ? 'bg-green-50 text-green-700 border-green-300'
                                : row.status === '进行中'
                                ? 'bg-blue-50 text-[#1877F2] border-[#1877F2]/40'
                                : 'bg-gray-50 text-gray-600 border-gray-300'
                            }`}
                          >
                            <option value="未开始">未开始</option>
                            <option value="进行中">进行中</option>
                            <option value="已完成">已完成</option>
                          </select>
                        </td>
                        <td className="p-2.5 text-[#65676B]">{row.dueDate}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 bg-gray-100 text-[#65676B] rounded-md border border-[#E4E6EB]">
                            {row.tag}
                          </span>
                        </td>
                        <td className="p-2.5 font-semibold text-[#1C1E21]">{row.budget || '¥ 0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Kanban View */}
            {dbViewMode === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['未开始', '进行中', '已完成'] as const).map((colStatus) => {
                  const itemsInCol = filteredDbRows.filter((r) => r.status === colStatus);
                  return (
                    <div
                      key={colStatus}
                      className="p-3 bg-gray-50/70 border border-[#E4E6EB] rounded-md flex flex-col space-y-2.5"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
                        <span className="text-xs font-bold text-[#1C1E21] flex items-center space-x-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              colStatus === '已完成'
                                ? 'bg-green-500'
                                : colStatus === '进行中'
                                ? 'bg-[#1877F2]'
                                : 'bg-gray-400'
                            }`}
                          />
                          <span>{colStatus}</span>
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-white border border-[#E4E6EB] rounded-md text-[#65676B]">
                          {itemsInCol.length}
                        </span>
                      </div>

                      <div className="space-y-2 flex-1">
                        {itemsInCol.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 bg-white border border-[#E4E6EB] rounded-md shadow-2xs hover:border-[#1877F2]/50 transition-colors"
                          >
                            <div className="text-xs font-bold text-[#1C1E21]">{item.task}</div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E4E6EB] text-[11px] text-[#65676B]">
                              <div className="flex items-center space-x-1.5">
                                <img
                                  src={item.owner.avatar}
                                  alt={item.owner.name}
                                  referrerPolicy="no-referrer"
                                  className="w-4 h-4 rounded-full object-cover border border-[#E4E6EB]"
                                />
                                <span>{item.owner.name}</span>
                              </div>
                              <span className="font-semibold text-[#1C1E21]">{item.budget}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BLOCK EDITOR CANVAS */}
        <div className="space-y-3">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="group relative p-2 -mx-2 rounded-md hover:bg-gray-50/70 transition-colors"
            >
              {/* Block delete button (on hover) */}
              <button
                onClick={() => handleDeleteBlock(block.id)}
                className="opacity-0 group-hover:opacity-100 absolute -left-7 top-2.5 text-gray-400 hover:text-red-500 transition-opacity p-1 rounded-md"
                title="删除该内容块"
              >
                <Trash2 size={13} />
              </button>

              {/* Block Renderings */}
              {block.type === 'h1' && (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                  className="w-full text-xl sm:text-2xl font-black text-[#1C1E21] bg-transparent focus:outline-none border-b border-transparent focus:border-[#1877F2]"
                />
              )}

              {block.type === 'h2' && (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                  className="w-full text-lg sm:text-xl font-bold text-[#1C1E21] bg-transparent focus:outline-none border-b border-transparent focus:border-[#1877F2] mt-2"
                />
              )}

              {block.type === 'paragraph' && (
                <textarea
                  value={block.content}
                  onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                  rows={2}
                  className="w-full text-sm leading-relaxed text-[#1C1E21] bg-transparent focus:outline-none resize-none border border-transparent focus:border-[#E4E6EB] rounded-md p-1"
                />
              )}

              {block.type === 'todo' && (
                <div className="flex items-start space-x-2.5 py-1">
                  <button
                    onClick={() => handleToggleTodo(block.id)}
                    aria-label="切换待办状态"
                    className="mt-0.5 text-[#1877F2] transition-colors shrink-0"
                  >
                    {block.checked ? (
                      <CheckSquare size={17} className="text-[#1877F2]" />
                    ) : (
                      <Square size={17} className="text-gray-400 hover:text-[#1877F2]" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                    className={`flex-1 text-sm bg-transparent focus:outline-none border-b border-transparent focus:border-[#1877F2] ${
                      block.checked ? 'line-through text-gray-400' : 'text-[#1C1E21]'
                    }`}
                  />
                </div>
              )}

              {block.type === 'bullet' && (
                <div className="flex items-start space-x-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] mt-2 shrink-0" />
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                    className="flex-1 text-sm text-[#1C1E21] bg-transparent focus:outline-none border-b border-transparent focus:border-[#1877F2]"
                  />
                </div>
              )}

              {block.type === 'numbered' && (
                <div className="flex items-start space-x-2 py-0.5">
                  <span className="text-xs font-bold text-[#1877F2] mt-0.5 shrink-0">#</span>
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                    className="flex-1 text-sm text-[#1C1E21] bg-transparent focus:outline-none border-b border-transparent focus:border-[#1877F2]"
                  />
                </div>
              )}

              {block.type === 'quote' && (
                <div className="border-l-4 border-[#1877F2] pl-3 py-1 bg-blue-50/20 rounded-r-md">
                  <textarea
                    value={block.content}
                    onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                    rows={2}
                    className="w-full text-xs italic text-[#1C1E21] bg-transparent focus:outline-none resize-none font-serif"
                  />
                </div>
              )}

              {block.type === 'code' && (
                <div className="p-3 bg-gray-900 text-gray-100 rounded-md font-mono text-xs overflow-x-auto">
                  <textarea
                    value={block.content}
                    onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                    rows={3}
                    className="w-full bg-transparent text-emerald-400 focus:outline-none resize-none"
                  />
                </div>
              )}

              {block.type === 'divider' && (
                <div className="py-2">
                  <hr className="border-t border-[#E4E6EB]" />
                </div>
              )}

              {block.type === 'table' && (
                <div className="border border-[#E4E6EB] rounded-md overflow-hidden bg-white shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <tbody>
                        {(block.tableData || []).map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className={`border-b border-[#E4E6EB] ${
                              rIdx === 0 ? 'bg-[#FAFAFA] font-bold text-[#1C1E21]' : 'hover:bg-gray-50'
                            }`}
                          >
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2 border-r border-[#E4E6EB] last:border-r-0">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) =>
                                    handleUpdateTableCell(block.id, rIdx, cIdx, e.target.value)
                                  }
                                  className="w-full bg-transparent focus:outline-none"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2 bg-gray-50 flex justify-end border-t border-[#E4E6EB]">
                    <button
                      onClick={() => handleAddTableRow(block.id)}
                      className="text-xs text-[#1877F2] font-semibold hover:underline flex items-center space-x-1"
                    >
                      <Plus size={12} />
                      <span>添加一行</span>
                    </button>
                  </div>
                </div>
              )}

              {block.type === 'columns' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50/60 border border-[#E4E6EB] rounded-md">
                  <div className="p-2.5 bg-white border border-[#E4E6EB] rounded-md">
                    <div className="text-[10px] text-[#1877F2] font-bold mb-1">左栏内容</div>
                    <textarea
                      value={block.columnLeft}
                      onChange={(e) => {
                        const next = blocks.map((b) =>
                          b.id === block.id ? { ...b, columnLeft: e.target.value } : b
                        );
                        setBlocks(next);
                        triggerAutoSave(next);
                      }}
                      rows={2}
                      className="w-full text-xs bg-transparent focus:outline-none resize-none"
                    />
                  </div>
                  <div className="p-2.5 bg-white border border-[#E4E6EB] rounded-md">
                    <div className="text-[10px] text-[#1877F2] font-bold mb-1">右栏内容</div>
                    <textarea
                      value={block.columnRight}
                      onChange={(e) => {
                        const next = blocks.map((b) =>
                          b.id === block.id ? { ...b, columnRight: e.target.value } : b
                        );
                        setBlocks(next);
                        triggerAutoSave(next);
                      }}
                      rows={2}
                      className="w-full text-xs bg-transparent focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {block.type === 'attachment' && (
                <div className="flex items-center justify-between p-3 bg-white border border-[#E4E6EB] rounded-md shadow-2xs hover:border-[#1877F2]/50 transition-colors">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-md bg-blue-50 text-[#1877F2] flex items-center justify-center font-bold text-sm">
                      <Paperclip size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1C1E21]">{block.fileMeta?.name || block.content}</div>
                      <div className="text-[10px] text-[#65676B]">
                        {block.fileMeta?.size || '1.8 MB'} · 上传者：{block.fileMeta?.uploader || 'Alex Mercer'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPreviewAttachment({
                        id: `att-${block.id}`,
                        title: block.fileMeta?.name || block.content,
                        type: 'file',
                        spaceCategory: doc.spaceCategory,
                        spaceName: doc.spaceName,
                        icon: '📎',
                        updatedAt: '最近',
                        updatedBy: block.fileMeta?.uploader || 'Alex Mercer',
                        authorAvatar: doc.authorAvatar,
                        collaborators: [],
                        tags: ['附件'],
                        size: block.fileMeta?.size || '1.8 MB',
                      });
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-[#1877F2] border border-[#1877F2]/30 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <Eye size={12} />
                    <span>预览文件</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Content Button & Dropdown */}
        <div className="mt-6 pt-4 border-t border-dashed border-[#E4E6EB] relative" ref={addBlockMenuRef}>
          <button
            onClick={() => setIsAddBlockMenuOpen((prev) => !prev)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-[#E4E6EB] hover:border-[#1877F2] hover:bg-blue-50 text-xs font-semibold text-[#1877F2] transition-colors"
          >
            <Plus size={14} />
            <span>+ 添加内容块 (段落/清单/表格/分栏)</span>
          </button>

          {isAddBlockMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-[#E4E6EB] rounded-md shadow-xl p-2 z-20 grid grid-cols-2 gap-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => handleInsertBlock('paragraph')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
              >
                <Type size={14} className="text-[#1877F2]" />
                <span>正文段落</span>
              </button>
              <button
                onClick={() => handleInsertBlock('h1')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
              >
                <Heading1 size={14} className="text-[#1877F2]" />
                <span>一级标题</span>
              </button>
              <button
                onClick={() => handleInsertBlock('h2')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
              >
                <Heading2 size={14} className="text-[#1877F2]" />
                <span>二级标题</span>
              </button>
              <button
                onClick={() => handleInsertBlock('todo')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
              >
                <CheckSquare size={14} className="text-[#1877F2]" />
                <span>待办清单</span>
              </button>
              <button
                onClick={() => handleInsertBlock('bullet')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
              >
                <List size={14} className="text-[#1877F2]" />
                <span>项目符号</span>
              </button>
              <button
                onClick={() => handleInsertBlock('numbered')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
              >
                <ListOrdered size={14} className="text-[#1877F2]" />
                <span>编号列表</span>
              </button>
              <button
                onClick={() => handleInsertBlock('quote')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
              >
                <Quote size={14} className="text-[#1877F2]" />
                <span>引用批注</span>
              </button>
              <button
                onClick={() => handleInsertBlock('code')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
              >
                <Code size={14} className="text-[#1877F2]" />
                <span>代码块</span>
              </button>
              <button
                onClick={() => handleInsertBlock('table')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
              >
                <TableIcon size={14} className="text-[#1877F2]" />
                <span>行列表格</span>
              </button>
              <button
                onClick={() => handleInsertBlock('columns')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
              >
                <Columns size={14} className="text-[#1877F2]" />
                <span>两栏排版</span>
              </button>
              <button
                onClick={() => handleInsertBlock('attachment')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
              >
                <Paperclip size={14} className="text-[#1877F2]" />
                <span>文件附件</span>
              </button>
              <button
                onClick={() => handleInsertBlock('divider')}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 hover:text-[#1877F2] text-left transition-colors"
              >
                <Minus size={14} className="text-[#1877F2]" />
                <span>分隔横线</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUB-MODALS */}
      <DocShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        doc={doc}
        onUpdatePermissions={(docId, permissions, linkEnabled, linkAccess) => {
          const updated = {
            ...doc,
            permissions,
            isLinkSharingEnabled: linkEnabled,
            linkAccess,
          };
          onUpdateDoc(updated);
        }}
        showToast={showToast}
      />

      <DocCommentsDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        comments={doc.comments || []}
        docTitle={doc.title}
        onAddComment={handleAddComment}
        onToggleResolve={handleToggleResolveComment}
        showToast={showToast}
      />

      <DocVersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        doc={doc}
        onRestoreVersion={handleRestoreVersion}
        showToast={showToast}
      />

      <FilePreviewModal
        isOpen={Boolean(previewAttachment)}
        onClose={() => setPreviewAttachment(null)}
        file={previewAttachment}
        onToggleFavorite={() => {}}
        onDeleteToTrash={() => {}}
        onRename={() => {}}
        showToast={showToast}
      />
    </div>
  );
};
