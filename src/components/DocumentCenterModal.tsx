import React, { useState, useMemo } from 'react';
import {
  Folder,
  Image as ImageIcon,
  FileText,
  Bookmark,
  Search,
  Plus,
  ArrowLeft,
  X,
  Sparkles,
  Download,
  Share2,
  Check,
  ChevronRight,
  Filter,
  Users,
  User,
  SlidersHorizontal,
  Calendar,
  Clock,
  Eye,
  Trash2,
  Edit3,
  Tag,
  CheckSquare,
  FileCheck2,
  Receipt,
  Smartphone,
  Code2,
  FolderPlus,
  ImagePlus,
  FileUp,
  MoreVertical,
  ExternalLink,
  LayoutList,
  Copy,
  Info,
  Maximize2,
  Lock,
  Layers,
  Heart,
  FileCode,
  FileSpreadsheet,
  File,
  CheckCircle2,
  Paperclip,
  CreditCard,
  Camera,
  ClipboardList,
  FolderSync,
  Grid,
  List,
  Home,
  LayoutGrid,
  Zap,
  Pin,
  RotateCw,
  Send,
  Sliders,
  Crop,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DocumentAsset,
  PhotoAlbum,
  DocumentFolder,
  NoteItem,
  FavoriteItem,
  AICategoryType,
  AI_CATEGORIES,
  INITIAL_USER_ALBUMS,
  INITIAL_USER_FOLDERS,
  INITIAL_DOCUMENT_NOTES,
  INITIAL_FAVORITES,
} from '../data/documentCenterData';
import { ChatConversation } from '../types';
import { GroupAssetsModal } from './documentCenter/GroupAssetsModal';
import { DocumentQuickPreviewModal } from './documentCenter/DocumentQuickPreviewModal';
import {
  AdvancedFilterToolbar,
  FilterState,
  TimeFilterType,
  FileTypeFilter,
  SortOrderType,
} from './documentCenter/AdvancedFilterToolbar';
import { AiAutoArchiveModal } from './documentCenter/AiAutoArchiveModal';
import { NoteThematicViewModal } from './documentCenter/NoteThematicViewModal';
import { GoodNotesNoteModal } from './GoodNotesNoteModal';

interface DocumentCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
  showToast: (msg: string) => void;
  // Shared user custom collections that can be updated from Chat quick-save
  userAlbums: PhotoAlbum[];
  setUserAlbums: React.Dispatch<React.SetStateAction<PhotoAlbum[]>>;
  userFolders: DocumentFolder[];
  setUserFolders: React.Dispatch<React.SetStateAction<DocumentFolder[]>>;
}

export const DocumentCenterModal: React.FC<DocumentCenterModalProps> = ({
  isOpen,
  onClose,
  conversations,
  showToast,
  userAlbums,
  setUserAlbums,
  userFolders,
  setUserFolders,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'notes' | 'albums' | 'documents'>('albums');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileTypeFilter, setSelectedFileTypeFilter] = useState<'all' | 'photo' | 'document' | 'pdf' | 'note'>('all');
  const [selectedSourceGroupFilter, setSelectedSourceGroupFilter] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Sub-filter for Albums & Documents (All / Group Synced / User Created)
  const [sourceCategoryFilter, setSourceCategoryFilter] = useState<'all' | 'group_sync' | 'user_created'>('all');

  // Advanced Multi-Dimensional Filter State
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    time: 'all',
    fileType: 'all',
    sourceGroup: 'all',
    sortOrder: 'time_desc',
    viewMode: 'grid',
  });

  // Group Assets Modal State (when clicking any group-synced album or folder)
  const [activeGroupAssetModal, setActiveGroupAssetModal] = useState<{
    groupName: string;
    groupAvatar?: string;
    groupSourceId?: string;
    assets: DocumentAsset[];
  } | null>(null);

  // Auto Archive Modal State
  const [isAutoArchiveModalOpen, setIsAutoArchiveModalOpen] = useState(false);

  // Quick Preview Asset State (Rich multi-tab preview engine)
  const [quickPreviewAsset, setQuickPreviewAsset] = useState<DocumentAsset | null>(null);

  // AI Smart Category Modal
  const [selectedAICategory, setSelectedAICategory] = useState<AICategoryType | null>(null);
  const [selectedAIAssetIds, setSelectedAIAssetIds] = useState<string[]>([]);
  const [isSmartOrganizeModalOpen, setIsSmartOrganizeModalOpen] = useState(false);
  const [targetOrganizeCollectionId, setTargetOrganizeCollectionId] = useState<string>('');

  // Selected Album / Folder Details Modal
  const [activeAlbumDetails, setActiveAlbumDetails] = useState<PhotoAlbum | null>(null);
  const [activeFolderDetails, setActiveFolderDetails] = useState<DocumentFolder | null>(null);
  const [albumViewMode, setAlbumViewMode] = useState<'preview' | 'large'>('preview');

  // Full-Screen Photo Viewer & Editor State
  const [fullScreenPhotoAsset, setFullScreenPhotoAsset] = useState<DocumentAsset | null>(null);
  const [photoFilter, setPhotoFilter] = useState<'none' | 'vivid' | 'film' | 'bw' | 'warm'>('none');
  const [photoRotation, setPhotoRotation] = useState<number>(0);
  const [photoCaption, setPhotoCaption] = useState<string>('');
  const [showExifInfo, setShowExifInfo] = useState<boolean>(false);

  // Asset Forwarding Modal State
  const [forwardModalAsset, setForwardModalAsset] = useState<DocumentAsset | null>(null);
  const [forwardSearchQuery, setForwardSearchQuery] = useState<string>('');
  const [selectedForwardTargetId, setSelectedForwardTargetId] = useState<string>('');

  // Lightbox & Document Reader state
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentAsset | null>(null);

  // Notes state
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_DOCUMENT_NOTES);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [selectedThematicNote, setSelectedThematicNote] = useState<NoteItem | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteTitleInput, setNoteTitleInput] = useState('');
  const [noteContentInput, setNoteContentInput] = useState('');
  const [noteCategoryInput, setNoteCategoryInput] = useState('个人记录');
  const [noteThemeInput, setNoteThemeInput] = useState<'pink' | 'blue' | 'yellow' | 'purple' | 'green'>('pink');

  // Favorites state
  const [favorites, setFavorites] = useState<FavoriteItem[]>(INITIAL_FAVORITES);
  const [favoriteCategoryFilter, setFavoriteCategoryFilter] = useState<'all' | 'chat_snippet' | 'photo' | 'document' | 'voice' | 'link'>('all');

  // Create User Album Modal
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumCover, setNewAlbumCover] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');

  // Create User Folder Modal
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#1877F2');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // --------------------------------------------------------------------------
  // Auto-generate Group Synced Albums and Folders from Conversations
  // --------------------------------------------------------------------------
  const groupSyncedAlbums: PhotoAlbum[] = useMemo(() => {
    return conversations
      .filter((c) => c.isGroup || c.messages.some((m) => m.type === 'image' || m.imageUrl))
      .map((conv) => {
        // Extract all photo messages sent in this group
        const groupPhotos: DocumentAsset[] = conv.messages
          .filter((m) => m.type === 'image' || !!m.imageUrl)
          .map((m, idx) => ({
            id: `gp-${conv.id}-${m.id || idx}`,
            title: `${conv.friendName} 共享图片_${idx + 1}`,
            type: 'photo',
            url: m.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
            size: '2.4 MB',
            source: {
              type: 'group',
              name: conv.friendName,
              avatar: conv.avatar,
              conversationId: conv.id,
            },
            date: m.timestamp || '2026-08-18',
            timestamp: m.createdAt || Date.now(),
            aiCategory: (idx % 3 === 0 ? 'travel' : idx % 3 === 1 ? 'inspiration' : 'screenshots') as AICategoryType,
            aiTags: [conv.friendName, '群聊同步', '原图'],
            targetAlbumId: `group-album-${conv.id}`,
            fileExtension: 'jpg',
          }));

        // Provide fallback photos if none sent yet to showcase auto-sync
        const defaultPhotos: DocumentAsset[] =
          groupPhotos.length > 0
            ? groupPhotos
            : [
                {
                  id: `gphoto-demo-${conv.id}-1`,
                  title: `${conv.friendName} 聚会合影`,
                  type: 'photo',
                  url: conv.avatar || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=600',
                  size: '3.1 MB',
                  source: { type: 'group', name: conv.friendName, avatar: conv.avatar, conversationId: conv.id },
                  date: '2026-08-18',
                  timestamp: Date.now(),
                  aiCategory: 'travel',
                  aiTags: [conv.friendName, '群合照', '高清'],
                  targetAlbumId: `group-album-${conv.id}`,
                  fileExtension: 'jpg',
                },
                {
                  id: `gphoto-demo-${conv.id}-2`,
                  title: `${conv.friendName} 现场分享`,
                  type: 'photo',
                  url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
                  size: '2.8 MB',
                  source: { type: 'group', name: conv.friendName, avatar: conv.avatar, conversationId: conv.id },
                  date: '2026-08-17',
                  timestamp: Date.now() - 86400000,
                  aiCategory: 'inspiration',
                  aiTags: [conv.friendName, '现场照片'],
                  targetAlbumId: `group-album-${conv.id}`,
                  fileExtension: 'jpg',
                },
              ];

        return {
          id: `group-album-${conv.id}`,
          name: conv.friendName,
          coverUrl: conv.avatar || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=300',
          isGroupSync: true,
          groupSourceId: conv.id,
          groupAvatar: conv.avatar,
          photoCount: defaultPhotos.length,
          createdDate: '2026-08-12',
          description: `本相册由群聊【${conv.friendName}】自动生成，该群聊内发送的所有图片将自动归档于此。`,
          tags: ['群聊同步', '自动归档', conv.friendName],
          photos: defaultPhotos,
        };
      });
  }, [conversations]);

  const groupSyncedFolders: DocumentFolder[] = useMemo(() => {
    return conversations
      .filter((c) => c.isGroup || c.messages.some((m) => m.type === 'file' || m.fileData))
      .map((conv) => {
        const groupFiles: DocumentAsset[] = conv.messages
          .filter((m) => m.type === 'file' || !!m.fileData)
          .map((m, idx) => ({
            id: `gf-${conv.id}-${m.id || idx}`,
            title: m.fileData?.name || `${conv.friendName}_附件_${idx + 1}.pdf`,
            type: 'document',
            size: m.fileData?.size || '1.8 MB',
            source: {
              type: 'group',
              name: conv.friendName,
              avatar: conv.avatar,
              conversationId: conv.id,
            },
            date: m.timestamp || '2026-08-18',
            timestamp: m.createdAt || Date.now(),
            aiCategory: (idx % 2 === 0 ? 'contracts' : 'projects') as AICategoryType,
            aiTags: [conv.friendName, '群文件', '自动同步'],
            targetFolderId: `group-folder-${conv.id}`,
            author: m.senderName || '群成员',
            fileExtension: 'pdf',
          }));

        const defaultFiles: DocumentAsset[] =
          groupFiles.length > 0
            ? groupFiles
            : [
                {
                  id: `gdoc-demo-${conv.id}-1`,
                  title: `${conv.friendName}_活动议程与方案.pdf`,
                  type: 'document',
                  size: '2.1 MB',
                  source: { type: 'group', name: conv.friendName, avatar: conv.avatar, conversationId: conv.id },
                  date: '2026-08-18',
                  timestamp: Date.now(),
                  aiCategory: 'projects',
                  aiTags: [conv.friendName, '活动方案'],
                  targetFolderId: `group-folder-${conv.id}`,
                  author: conv.friendName,
                  fileExtension: 'pdf',
                },
                {
                  id: `gdoc-demo-${conv.id}-2`,
                  title: `${conv.friendName}_成员通讯录与值班表.xlsx`,
                  type: 'document',
                  size: '640 KB',
                  source: { type: 'group', name: conv.friendName, avatar: conv.avatar, conversationId: conv.id },
                  date: '2026-08-17',
                  timestamp: Date.now() - 86400000,
                  aiCategory: 'invoices',
                  aiTags: [conv.friendName, '通讯录'],
                  targetFolderId: `group-folder-${conv.id}`,
                  author: '管理员',
                  fileExtension: 'xlsx',
                },
              ];

        return {
          id: `group-folder-${conv.id}`,
          name: `${conv.friendName} 共享文档`,
          coverUrl: conv.avatar || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400',
          isGroupSync: true,
          groupSourceId: conv.id,
          groupAvatar: conv.avatar,
          fileCount: defaultFiles.length,
          color: '#1877F2',
          createdDate: '2026-08-12',
          description: `本文件夹由群聊【${conv.friendName}】自动生成，该群聊内发送的所有文档文件将自动归档于此。`,
          tags: ['群聊文档', '自动同步', conv.friendName],
          files: defaultFiles,
        };
      });
  }, [conversations]);

  // Track viewed albums and folders so badges disappear once opened
  const [viewedAlbumIds, setViewedAlbumIds] = useState<Set<string>>(() => new Set());
  const [viewedFolderIds, setViewedFolderIds] = useState<Set<string>>(() => new Set());

  const markAlbumViewed = (albumId: string) => {
    setViewedAlbumIds((prev) => {
      if (prev.has(albumId)) return prev;
      const next = new Set(prev);
      next.add(albumId);
      return next;
    });
  };

  const markFolderViewed = (folderId: string) => {
    setViewedFolderIds((prev) => {
      if (prev.has(folderId)) return prev;
      const next = new Set(prev);
      next.add(folderId);
      return next;
    });
  };

  // Merge All Albums & Folders
  const allAlbums = useMemo(() => [...userAlbums, ...groupSyncedAlbums], [userAlbums, groupSyncedAlbums]);
  const allFolders = useMemo(() => [...userFolders, ...groupSyncedFolders], [userFolders, groupSyncedFolders]);

  // Newly added items badge calculation (numerical values; disappears when viewed or 0)
  const tabNewCounts = useMemo(() => {
    const favNew = 3;
    const notesNew = 4;
    const albumsNew = allAlbums.reduce(
      (sum, a) => sum + (viewedAlbumIds.has(a.id) ? 0 : (a.newItemsCount !== undefined ? a.newItemsCount : (a.isGroupSync ? 2 : 3))),
      0
    );
    const docsNew = allFolders.reduce(
      (sum, f) => sum + (viewedFolderIds.has(f.id) ? 0 : (f.newItemsCount !== undefined ? f.newItemsCount : (f.isGroupSync ? 2 : 4))),
      0
    );
    return {
      favorites: favNew,
      notes: notesNew,
      albums: albumsNew,
      documents: docsNew,
    };
  }, [allAlbums, allFolders, viewedAlbumIds, viewedFolderIds]);

  // Available groups for toolbar selector
  const availableGroups = useMemo(() => {
    return conversations
      .filter((c) => c.isGroup || c.messages.some((m) => m.type === 'image' || m.type === 'file'))
      .map((c) => ({
        id: c.id,
        name: c.friendName,
        avatar: c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      }));
  }, [conversations]);

  // Helper to extract ALL media assets from a group chat history
  const getGroupAssets = (convId: string, groupName: string, groupAvatar?: string): DocumentAsset[] => {
    const conv = conversations.find((c) => c.id === convId);
    const photos = groupSyncedAlbums.find((a) => a.groupSourceId === convId)?.photos || [];
    const files = groupSyncedFolders.find((f) => f.groupSourceId === convId)?.files || [];

    const extraAssets: DocumentAsset[] = [];
    if (conv) {
      conv.messages.forEach((m, idx) => {
        if (m.type === 'audio' || m.audioUrl) {
          extraAssets.push({
            id: `gva-${conv.id}-${m.id || idx}`,
            title: `语音留言 (${m.audioDuration || 6}秒)`,
            type: 'voice',
            size: '240 KB',
            source: { type: 'group', name: groupName, avatar: groupAvatar, conversationId: conv.id },
            date: m.timestamp || '2026-08-18',
            timestamp: m.createdAt || Date.now(),
            aiCategory: 'meetings',
            aiTags: ['语音留言', '会议记录', groupName],
            author: m.senderName || '群成员',
            duration: m.audioDuration || 6,
          });
        } else if (m.text && (m.text.includes('http://') || m.text.includes('https://'))) {
          extraAssets.push({
            id: `glink-${conv.id}-${m.id || idx}`,
            title: m.text.length > 32 ? m.text.slice(0, 32) + '...' : m.text,
            type: 'link',
            url: m.text,
            size: '15 KB',
            source: { type: 'group', name: groupName, avatar: groupAvatar, conversationId: conv.id },
            date: m.timestamp || '2026-08-18',
            timestamp: m.createdAt || Date.now(),
            aiCategory: 'inspiration',
            aiTags: ['网页链接', '群分享', groupName],
            author: m.senderName || '群成员',
          });
        }
      });
    }

    return [...photos, ...files, ...extraAssets];
  };

  // Aggregate All Assets for AI Classification & Global Search
  const allAssets = useMemo(() => {
    const assets: DocumentAsset[] = [];
    allAlbums.forEach((a) => assets.push(...a.photos));
    allFolders.forEach((f) => assets.push(...f.files));
    return assets;
  }, [allAlbums, allFolders]);

  // Helper function to check time filtering
  const matchesTimeFilter = (timestamp?: number, dateStr?: string) => {
    if (advancedFilters.time === 'all') return true;
    const now = Date.now();
    const itemTime = timestamp || (dateStr ? new Date(dateStr).getTime() : now);
    if (advancedFilters.time === 'today') return now - itemTime <= 86400000;
    if (advancedFilters.time === '7days') return now - itemTime <= 7 * 86400000;
    if (advancedFilters.time === '30days') return now - itemTime <= 30 * 86400000;
    if (advancedFilters.time === 'year') return now - itemTime <= 365 * 86400000;
    return true;
  };

  // Filtered Albums with multi-dimensional toolbar filters
  const filteredAlbums = useMemo(() => {
    let result = allAlbums.filter((album) => {
      if (sourceCategoryFilter === 'group_sync' && !album.isGroupSync) return false;
      if (sourceCategoryFilter === 'user_created' && album.isGroupSync) return false;

      // Source group filter
      if (advancedFilters.sourceGroup === 'personal' && album.isGroupSync) return false;
      if (
        advancedFilters.sourceGroup !== 'all' &&
        advancedFilters.sourceGroup !== 'personal' &&
        album.groupSourceId !== advancedFilters.sourceGroup
      )
        return false;

      // File type filter
      if (
        advancedFilters.fileType !== 'all' &&
        advancedFilters.fileType !== 'photo'
      )
        return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = album.name.toLowerCase().includes(q);
        const matchTag = album.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchTag) return false;
      }
      return true;
    });

    // Sorting (Personal / User-created collections prioritized and pinned at front)
    result = [...result].sort((a, b) => {
      if (a.isGroupSync !== b.isGroupSync) {
        return a.isGroupSync ? 1 : -1;
      }
      if (advancedFilters.sortOrder === 'name_asc') return a.name.localeCompare(b.name);
      if (advancedFilters.sortOrder === 'size_desc') return b.photoCount - a.photoCount;
      if (advancedFilters.sortOrder === 'time_asc') return a.createdDate.localeCompare(b.createdDate);
      return b.createdDate.localeCompare(a.createdDate);
    });

    return result;
  }, [allAlbums, sourceCategoryFilter, searchQuery, advancedFilters]);

  // Filtered Folders with multi-dimensional toolbar filters
  const filteredFolders = useMemo(() => {
    let result = allFolders.filter((folder) => {
      if (sourceCategoryFilter === 'group_sync' && !folder.isGroupSync) return false;
      if (sourceCategoryFilter === 'user_created' && folder.isGroupSync) return false;

      // Source group filter
      if (advancedFilters.sourceGroup === 'personal' && folder.isGroupSync) return false;
      if (
        advancedFilters.sourceGroup !== 'all' &&
        advancedFilters.sourceGroup !== 'personal' &&
        folder.groupSourceId !== advancedFilters.sourceGroup
      )
        return false;

      // File type filter
      if (
        advancedFilters.fileType !== 'all' &&
        advancedFilters.fileType !== 'document' &&
        advancedFilters.fileType !== 'pdf' &&
        advancedFilters.fileType !== 'excel'
      )
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = folder.name.toLowerCase().includes(q);
        const matchTag = folder.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchTag) return false;
      }
      return true;
    });

    // Sorting (Personal / User-created folders prioritized and pinned at front)
    result = [...result].sort((a, b) => {
      if (a.isGroupSync !== b.isGroupSync) {
        return a.isGroupSync ? 1 : -1;
      }
      if (advancedFilters.sortOrder === 'name_asc') return a.name.localeCompare(b.name);
      if (advancedFilters.sortOrder === 'size_desc') return b.fileCount - a.fileCount;
      if (advancedFilters.sortOrder === 'time_asc') return a.createdDate.localeCompare(b.createdDate);
      return b.createdDate.localeCompare(a.createdDate);
    });

    return result;
  }, [allFolders, sourceCategoryFilter, searchQuery, advancedFilters]);

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    if (advancedFilters.fileType !== 'all' && advancedFilters.fileType !== 'note') {
      return [];
    }

    let result = notes.filter((n) => {
      if (!matchesTimeFilter(undefined, n.date)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (advancedFilters.sortOrder === 'name_asc') return a.title.localeCompare(b.title);
      if (advancedFilters.sortOrder === 'time_asc') return a.date.localeCompare(b.date);
      return b.date.localeCompare(a.date);
    });

    return result;
  }, [notes, searchQuery, advancedFilters]);

  // Filtered Favorites
  const filteredFavorites = useMemo(() => {
    let result = favorites.filter((f) => {
      if (favoriteCategoryFilter !== 'all' && f.type !== favoriteCategoryFilter) return false;

      if (advancedFilters.fileType !== 'all') {
        if (advancedFilters.fileType === 'photo' && f.type !== 'photo') return false;
        if (advancedFilters.fileType === 'document' && f.type !== 'document') return false;
        if (advancedFilters.fileType === 'link' && f.type !== 'link') return false;
      }

      if (!matchesTimeFilter(undefined, f.date)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          f.title.toLowerCase().includes(q) ||
          f.content.toLowerCase().includes(q) ||
          f.sourceName.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (advancedFilters.sortOrder === 'name_asc') return a.title.localeCompare(b.title);
      if (advancedFilters.sortOrder === 'time_asc') return a.date.localeCompare(b.date);
      return b.date.localeCompare(a.date);
    });

    return result;
  }, [favorites, favoriteCategoryFilter, searchQuery, advancedFilters]);

  // AI Assets grouped by category
  const aiCategorizedAssets = useMemo(() => {
    if (!selectedAICategory) return [];
    return allAssets.filter((asset) => asset.aiCategory === selectedAICategory);
  }, [allAssets, selectedAICategory]);

  // Unclassified assets suitable for One-Click Auto Archive
  const unclassifiedAssets = useMemo(() => {
    return allAssets.filter(
      (a) =>
        a.aiCategory === 'invoices' ||
        a.aiCategory === 'contracts' ||
        a.aiCategory === 'certificates' ||
        a.aiCategory === 'meetings' ||
        a.aiCategory === 'travel'
    );
  }, [allAssets]);

  // Auto Archive Execution Handler
  const handleConfirmAutoArchive = (mappings: { assetId: string; targetCategory: AICategoryType }[]) => {
    mappings.forEach(({ assetId, targetCategory }) => {
      const asset = allAssets.find((a) => a.id === assetId);
      if (!asset) return;

      const catMeta = AI_CATEGORIES.find((c) => c.id === targetCategory);
      if (!catMeta) return;

      if (catMeta.targetType === 'album') {
        setUserAlbums((prev) => {
          const targetName = catMeta.suggestedTargetName;
          const existing = prev.find((a) => a.name === targetName);
          if (existing) {
            return prev.map((a) =>
              a.id === existing.id
                ? {
                    ...a,
                    photoCount: a.photoCount + 1,
                    photos: [asset, ...a.photos.filter((p) => p.id !== asset.id)],
                  }
                : a
            );
          } else {
            const newAlb: PhotoAlbum = {
              id: `user-album-auto-${targetCategory}-${Date.now()}`,
              name: targetName,
              coverUrl: asset.url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400',
              isGroupSync: false,
              photoCount: 1,
              createdDate: new Date().toISOString().slice(0, 10),
              description: `由 Stellar AI 一键智能归档生成的【${targetName}】相册`,
              tags: [catMeta.title, 'AI智能归档'],
              photos: [asset],
            };
            return [newAlb, ...prev];
          }
        });
      } else {
        setUserFolders((prev) => {
          const targetName = catMeta.suggestedTargetName;
          const existing = prev.find((f) => f.name === targetName);
          if (existing) {
            return prev.map((f) =>
              f.id === existing.id
                ? {
                    ...f,
                    fileCount: f.fileCount + 1,
                    files: [asset, ...f.files.filter((fl) => fl.id !== asset.id)],
                  }
                : f
            );
          } else {
            const newFld: DocumentFolder = {
              id: `user-fld-auto-${targetCategory}-${Date.now()}`,
              name: targetName,
              isGroupSync: false,
              fileCount: 1,
              color: catMeta.color,
              createdDate: new Date().toISOString().slice(0, 10),
              description: `由 Stellar AI 一键智能归档生成的【${targetName}】文件夹`,
              tags: [catMeta.title, 'AI智能归档'],
              files: [asset],
            };
            return [newFld, ...prev];
          }
        });
      }
    });
  };

  // Handle Smart Organize (Batch Move AI recognized items into User Album / Folder)
  const handleExecuteSmartOrganize = () => {
    if (!targetOrganizeCollectionId) {
      showToast('请选择目标个人相册或文件夹 📁');
      return;
    }

    const itemsToMove = aiCategorizedAssets.filter((a) =>
      selectedAIAssetIds.length === 0 || selectedAIAssetIds.includes(a.id)
    );

    // Check if target is album or folder
    const targetAlbum = userAlbums.find((a) => a.id === targetOrganizeCollectionId);
    const targetFolder = userFolders.find((f) => f.id === targetOrganizeCollectionId);

    if (targetAlbum) {
      setUserAlbums((prev) =>
        prev.map((alb) =>
          alb.id === targetAlbum.id
            ? {
                ...alb,
                photoCount: alb.photoCount + itemsToMove.length,
                photos: [...itemsToMove, ...alb.photos],
              }
            : alb
        )
      );
      showToast(`🎉 智能归档成功！已将 ${itemsToMove.length} 项文件移入相册【${targetAlbum.name}】`);
    } else if (targetFolder) {
      setUserFolders((prev) =>
        prev.map((fld) =>
          fld.id === targetFolder.id
            ? {
                ...fld,
                fileCount: fld.fileCount + itemsToMove.length,
                files: [...itemsToMove, ...fld.files],
              }
            : fld
        )
      );
      showToast(`🎉 智能归档成功！已将 ${itemsToMove.length} 项文件移入文件夹【${targetFolder.name}】`);
    }

    setIsSmartOrganizeModalOpen(false);
    setSelectedAIAssetIds([]);
  };

  // Handle Note Save
  const handleSaveNote = () => {
    if (!noteTitleInput.trim()) {
      showToast('请输入笔记标题 📝');
      return;
    }

    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? {
                ...n,
                title: noteTitleInput,
                content: noteContentInput,
                category: noteCategoryInput,
                theme: noteThemeInput,
                updatedAt: '刚刚编辑',
              }
            : n
        )
      );
      showToast('✅ 笔记更新成功');
    } else {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        title: noteTitleInput,
        content: noteContentInput,
        category: noteCategoryInput,
        emoji: '📌',
        date: new Date().toISOString().slice(0, 10),
        theme: noteThemeInput,
        isPinned: false,
        tags: [noteCategoryInput],
        updatedAt: '刚刚创建',
      };
      setNotes((prev) => [newNote, ...prev]);
      showToast('🎉 新建笔记成功');
    }

    setIsCreatingNote(false);
    setEditingNote(null);
    setNoteTitleInput('');
    setNoteContentInput('');
  };

  // Handle Create User Album
  const handleCreateUserAlbum = () => {
    if (!newAlbumName.trim()) {
      showToast('请输入相册名称 📸');
      return;
    }

    const newAlbum: PhotoAlbum = {
      id: `user-album-${Date.now()}`,
      name: newAlbumName.trim(),
      coverUrl: newAlbumCover,
      isGroupSync: false,
      photoCount: 0,
      createdDate: new Date().toISOString().slice(0, 10),
      description: newAlbumDesc || '个人创建的自定义相册',
      tags: ['个人相册'],
      photos: [],
    };

    setUserAlbums((prev) => [newAlbum, ...prev]);
    showToast(`✅ 已创建个人相册【${newAlbumName}】`);
    setIsCreateAlbumOpen(false);
    setNewAlbumName('');
    setNewAlbumDesc('');
  };

  // Handle Create User Folder
  const handleCreateUserFolder = () => {
    if (!newFolderName.trim()) {
      showToast('请输入文件夹名称 📁');
      return;
    }

    const newFolder: DocumentFolder = {
      id: `user-folder-${Date.now()}`,
      name: newFolderName.trim(),
      coverUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=400',
      isGroupSync: false,
      fileCount: 0,
      color: newFolderColor,
      createdDate: new Date().toISOString().slice(0, 10),
      description: newFolderDesc || '个人创建的自定义文档文件夹',
      tags: ['个人文档'],
      files: [],
    };

    setUserFolders((prev) => [newFolder, ...prev]);
    showToast(`✅ 已创建个人文件夹【${newFolderName}】`);
    setIsCreateFolderOpen(false);
    setNewFolderName('');
    setNewFolderDesc('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F0F2F5] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      {/* ===================================================================== */}
      {/* 1. TOP GLOBAL NAVIGATION HEADER (Facebook White/Clean Design)        */}
      {/* ===================================================================== */}
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-200/80 dark:border-zinc-700/80 px-4 pt-10 pb-3.5 shadow-2xs shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 active:scale-95 text-[#050505] dark:text-zinc-100 flex items-center justify-center transition-all cursor-pointer"
              title="返回"
            >
              <ArrowLeft size={19} className="stroke-[1.8]" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#050505] dark:text-zinc-100 tracking-tight">
                文档与资产
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isFilterDropdownOpen ? 'bg-[#1877F2] text-white shadow-xs' : 'bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 text-[#050505] dark:text-zinc-100'
              }`}
              title="多维搜索与筛选"
            >
              <SlidersHorizontal size={17} className="stroke-[1.8]" />
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="max-w-4xl mx-auto mt-3">
          <div className="bg-[#F0F2F5] dark:bg-zinc-950 rounded-full px-3.5 py-2 flex items-center space-x-2 border border-transparent focus-within:border-[#1877F2] focus-within:bg-white transition-all">
            <Search size={16} className="text-[#65676B] dark:text-zinc-300 shrink-0 stroke-[1.8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文件名、群聊来源、标签、笔记关键词..."
              aria-label="搜索文档与资产"
              className="min-h-11 bg-transparent text-sm text-[#050505] dark:text-zinc-100 placeholder-[#65676B] outline-none flex-1 min-w-0 font-normal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="清空资产搜索"
                className="w-11 h-11 rounded-full bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 text-gray-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Optional Filter Panel Dropdown */}
        {isFilterDropdownOpen && (
          <div className="max-w-4xl mx-auto mt-2.5 p-3 bg-[#F0F2F5] dark:bg-zinc-950 rounded-2xl border border-gray-200/80 dark:border-zinc-700/80 animate-in fade-in duration-150 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#050505] dark:text-zinc-100">
              <label htmlFor="document-source-group">筛选来源群聊：</label>
              <select
                id="document-source-group"
                value={selectedSourceGroupFilter}
                onChange={(e) => setSelectedSourceGroupFilter(e.target.value)}
                className="min-h-11 min-w-0 max-w-[65%] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-[#050505] dark:text-zinc-100 outline-none"
              >
                <option value="all">全部群聊与好友</option>
                {conversations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.friendName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 4 CORE TABS SEGMENTED CONTROL: 收藏 / 笔记 / 相册 / 文档 (圆形图标 + 下方名字 + 右上角简单数字小圆标) */}
        <div className="max-w-4xl mx-auto mt-3.5 pt-0.5 flex items-center justify-around">
          {[
            { key: 'favorites', label: '收藏', icon: Bookmark, unreadCount: tabNewCounts.favorites, totalCount: favorites.length },
            { key: 'notes', label: '笔记', icon: FileText, unreadCount: tabNewCounts.notes, totalCount: notes.length },
            { key: 'albums', label: '相册', icon: ImageIcon, unreadCount: tabNewCounts.albums, totalCount: allAlbums.length },
            { key: 'documents', label: '文档', icon: Folder, unreadCount: tabNewCounts.documents, totalCount: allFolders.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className="group flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer select-none active:scale-95 touch-manipulation"
              >
                {/* Circular Button Container with Badge at Top-Right */}
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#1877F2] text-white ring-4 ring-[#1877F2]/15 shadow-sm scale-105'
                        : 'bg-[#F0F2F5] dark:bg-zinc-950 text-[#65676B] dark:text-zinc-300 group-hover:bg-[#E4E6EB] dark:group-hover:bg-zinc-800 group-hover:text-[#050505] dark:group-hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="stroke-[1.5]" />
                  </div>

                  {/* Simple Numerical Round Badge at Top-Right Corner (disappears when 0) */}
                  {tab.unreadCount > 0 && (
                    <span
                      className={`absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-2xs border-2 border-white ${
                        isActive
                          ? 'bg-[#1877F2] text-white ring-1 ring-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {tab.unreadCount}
                    </span>
                  )}
                </div>

                {/* Slender text label underneath */}
                <span
                  className={`text-xs mt-1.5 transition-colors tracking-tight font-normal ${
                    isActive ? 'text-[#1877F2] font-semibold' : 'text-[#65676B] dark:text-zinc-300 group-hover:text-[#050505] dark:group-hover:text-white'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Advanced Multi-Dimensional Filter Toolbar */}
        <div className="max-w-4xl mx-auto mt-2">
          <AdvancedFilterToolbar
            filters={advancedFilters}
            onFilterChange={(newF) => setAdvancedFilters((prev) => ({ ...prev, ...newF }))}
            onResetFilters={() =>
              setAdvancedFilters({
                time: 'all',
                fileType: 'all',
                sourceGroup: 'all',
                sortOrder: 'time_desc',
                viewMode: 'grid',
              })
            }
            availableGroups={availableGroups}
            totalResultCount={
              activeTab === 'albums'
                ? filteredAlbums.length
                : activeTab === 'documents'
                ? filteredFolders.length
                : activeTab === 'notes'
                ? filteredNotes.length
                : filteredFavorites.length
            }
          />
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. MAIN SCROLLABLE CONTENT BODY                                      */}
      {/* ===================================================================== */}
      <main className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto space-y-5 custom-scrollbar pb-10">
        {/* TAB 1: ALBUMS (相册 - 双源：群聊自动同步 + 用户手动创建)           */}
        {activeTab === 'albums' && (
          <section className="space-y-3.5">
            {/* Sub-Filter Controls & Action Button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                {[
                  { key: 'all', label: '全部', icon: LayoutGrid },
                  { key: 'group_sync', label: '群聊', icon: Users },
                  { key: 'user_created', label: '个人', icon: User },
                ].map((f) => {
                  const Icon = f.icon;
                  const isActive = sourceCategoryFilter === f.key;
                  return (
                    <button
                      key={`src-cat-1-${f.key}`}
                      type="button"
                      onClick={() => setSourceCategoryFilter(f.key as any)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 touch-manipulation ${
                        isActive
                          ? 'bg-[#1877F2] text-white shadow-xs'
                          : 'bg-white dark:bg-zinc-900 text-[#65676B] dark:text-zinc-300 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 hover:text-[#050505] dark:hover:text-white border border-gray-200/80 dark:border-zinc-700/80'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          isActive ? 'text-white' : 'text-[#65676B] dark:text-zinc-300'
                        }`}
                      >
                        <Icon size={12} className="stroke-[2]" />
                      </div>
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Top Action Relocated Here: 新建相册 */}
              <button
                type="button"
                onClick={() => setIsCreateAlbumOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus size={15} className="stroke-[2.2]" />
                <span>新建相册</span>
              </button>
            </div>

            {/* Albums Grid (2 items per row, enlarged & spacious) */}
            <div className="grid grid-cols-2 gap-3.5">
              {filteredAlbums.map((album) => {
                const unreadCount = viewedAlbumIds.has(album.id)
                  ? 0
                  : album.newItemsCount !== undefined
                  ? album.newItemsCount
                  : album.isGroupSync
                  ? 2
                  : 3;

                return (
                  <div
                    key={album.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`打开相册：${album.name}`}
                    onKeyDown={(event) => {
                      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        event.currentTarget.click();
                      }
                    }}
                    onClick={() => {
                      markAlbumViewed(album.id);
                      setActiveAlbumDetails(album);
                    }}
                    className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-gray-200/80 dark:border-zinc-700/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col active:scale-[0.98]"
                  >
                    {/* Album Cover */}
                    <div className="h-36 sm:h-40 w-full relative bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                      <img
                        src={album.coverUrl}
                        alt={album.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top-Left: User Avatar (for user-created) or Group Avatar (for group sync) WITHOUT bubble background */}
                      {album.isGroupSync ? (
                        <img
                          src={album.groupAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                          alt="Group"
                          className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full object-cover ring-2 ring-white shadow-xs"
                          title="群聊同步相册"
                        />
                      ) : (
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                          alt="User"
                          className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full object-cover ring-2 ring-white shadow-xs"
                          title="个人自建相册"
                        />
                      )}

                      {/* Top-Right Corner: Simple small round numerical badge (disappears once viewed) */}
                      {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs">
                          {unreadCount}
                        </span>
                      )}

                      {/* Bottom-Right Corner: Content photo count WITHOUT background bubble */}
                      <span className="absolute bottom-2 right-2.5 text-white text-xs font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] font-sans">
                        {album.photoCount} 张
                      </span>
                    </div>

                    {/* Album Info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#050505] dark:text-zinc-100 truncate group-hover:text-[#1877F2] transition-colors">
                          {album.name}
                        </h3>
                        <p className="text-xs text-[#65676B] dark:text-zinc-300 line-clamp-1 mt-0.5">
                          {album.description || '暂无描述'}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 dark:text-zinc-400">
                        <span className="truncate">{album.createdDate}</span>
                        <span className="font-semibold text-[#1877F2] flex items-center space-x-0.5 group-hover:underline shrink-0 ml-1 whitespace-nowrap">
                          <span>{album.isGroupSync ? '群资产' : '浏览'}</span>
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* TAB 2: DOCUMENTS (文档 - 双源：群聊自动同步 + 用户手动创建)         */}
        {/* =================================================================== */}
        {activeTab === 'documents' && (
          <section className="space-y-3.5">
            {/* Sub-Filter Controls & Action Button (全部 / 群聊 / 个人 + 新建文件夹) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                {[
                  { key: 'all', label: '全部', icon: LayoutGrid },
                  { key: 'group_sync', label: '群聊', icon: Users },
                  { key: 'user_created', label: '个人', icon: User },
                ].map((f) => {
                  const Icon = f.icon;
                  const isActive = sourceCategoryFilter === f.key;
                  return (
                    <button
                      key={`src-cat-2-${f.key}`}
                      type="button"
                      onClick={() => setSourceCategoryFilter(f.key as any)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 touch-manipulation ${
                        isActive
                          ? 'bg-[#1877F2] text-white shadow-xs'
                          : 'bg-white dark:bg-zinc-900 text-[#65676B] dark:text-zinc-300 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 hover:text-[#050505] dark:hover:text-white border border-gray-200/80 dark:border-zinc-700/80'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          isActive ? 'text-white' : 'text-[#65676B] dark:text-zinc-300'
                        }`}
                      >
                        <Icon size={12} className="stroke-[2]" />
                      </div>
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Top Action Relocated Here: 新建文件夹 */}
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus size={15} className="stroke-[2.2]" />
                <span>新建文件夹</span>
              </button>
            </div>

            {/* Folders Grid (Enlarged & Adjusted to 2 Folders per row - 一排两个文件夹) */}
            <div className="grid grid-cols-2 gap-3.5">
              {filteredFolders.map((folder) => {
                const unreadCount = viewedFolderIds.has(folder.id)
                  ? 0
                  : folder.newItemsCount !== undefined
                  ? folder.newItemsCount
                  : folder.isGroupSync
                  ? 2
                  : 4;

                const folderCover =
                  folder.coverUrl ||
                  (folder.isGroupSync
                    ? 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400'
                    : 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=400');

                return (
                  <div
                    key={folder.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`打开文件夹：${folder.name}`}
                    onKeyDown={(event) => {
                      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        event.currentTarget.click();
                      }
                    }}
                    onClick={() => {
                      markFolderViewed(folder.id);
                      setActiveFolderDetails(folder);
                    }}
                    className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-gray-200/80 dark:border-zinc-700/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col active:scale-[0.98]"
                  >
                    {/* Folder Cover */}
                    <div className="h-36 sm:h-40 w-full relative bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                      <img
                        src={folderCover}
                        alt={folder.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Subtle Top & Bottom Gradient for high legibility */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />

                      {/* Top-Left: Group/Team Avatar + Distinction Tag (群聊/小组/个人) + Group/Team Name */}
                      <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 max-w-[78%]">
                        <img
                          src={
                            folder.isGroupSync
                              ? folder.groupAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                          }
                          alt="Avatar"
                          className="w-6 h-6 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
                          title={folder.isGroupSync ? '群聊/小组头像' : '个人头像'}
                        />
                        <div className="flex items-center space-x-1 min-w-0 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-full ring-1 ring-white/30">
                          <span
                            className={`text-[9px] font-black px-1 py-0.2 rounded text-white shrink-0 ${
                              folder.isGroupSync
                                ? (folder.name.includes('组') || folder.tags?.some((t) => t.includes('组') || t.includes('团队')))
                                  ? 'bg-indigo-500'
                                  : 'bg-[#1877F2]'
                                : 'bg-amber-500'
                            }`}
                          >
                            {folder.isGroupSync
                              ? (folder.name.includes('组') || folder.tags?.some((t) => t.includes('组') || t.includes('团队')))
                                ? '小组'
                                : '群聊'
                              : '个人'}
                          </span>
                          <span className="text-[10.5px] font-bold text-white truncate max-w-[85px]">
                            {folder.isGroupSync
                              ? folder.name.replace(' 共享文档', '').replace(' 共享', '').replace(' 文档', '')
                              : '个人专属'}
                          </span>
                        </div>
                      </div>

                      {/* Top-Right Corner: Simple small round numerical badge (disappears once viewed) */}
                      {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs">
                          {unreadCount}
                        </span>
                      )}

                      {/* Bottom-Right Corner: Content document count WITHOUT background bubble */}
                      <span className="absolute bottom-2 right-2.5 text-white text-xs font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] font-sans">
                        {folder.fileCount} 份文档
                      </span>
                    </div>

                    {/* Folder Info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#050505] dark:text-zinc-100 truncate group-hover:text-[#1877F2] transition-colors">
                          {folder.name}
                        </h3>
                        <p className="text-xs text-[#65676B] dark:text-zinc-300 line-clamp-1 mt-0.5">
                          {folder.description || '暂无描述'}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 dark:text-zinc-400">
                        <span className="truncate">{folder.createdDate}</span>
                        <span className="font-semibold text-[#1877F2] flex items-center space-x-0.5 group-hover:underline shrink-0 ml-1 whitespace-nowrap">
                          <span>{folder.isGroupSync ? '群资产' : '浏览'}</span>
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* TAB 3: NOTES (笔记 - 富文本备忘录与随手记)                         */}
        {/* =================================================================== */}
        {activeTab === 'notes' && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#050505] dark:text-zinc-100">
                我的笔记备忘 ({filteredNotes.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditingNote(null);
                  setNoteTitleInput('');
                  setNoteContentInput('');
                  setIsCreatingNote(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus size={15} className="stroke-[2.2]" />
                <span>创建笔记</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {filteredNotes.map((note) => {
                const themeBg =
                  note.theme === 'pink'
                    ? 'bg-rose-50/80 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900'
                    : note.theme === 'blue'
                    ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900'
                    : note.theme === 'yellow'
                    ? 'bg-amber-50/80 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900'
                    : note.theme === 'purple'
                    ? 'bg-purple-50/80 dark:bg-purple-950/60 border-purple-100 dark:border-purple-900'
                    : 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900';

                const themeTag =
                  note.contentType === 'schedule'
                    ? { label: '📅 日程', color: 'bg-indigo-100 text-indigo-700' }
                    : note.contentType === 'location'
                    ? { label: '📍 定位', color: 'bg-emerald-100 text-emerald-700' }
                    : note.contentType === 'image'
                    ? { label: '🖼️ 图集', color: 'bg-amber-100 text-amber-700' }
                    : { label: '📝 纪要', color: 'bg-blue-100 text-blue-700' };

                return (
                  <div
                    key={note.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`打开笔记：${note.title}`}
                    onKeyDown={(event) => {
                      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        event.currentTarget.click();
                      }
                    }}
                    onClick={() => {
                      setSelectedThematicNote(note);
                    }}
                    className={`rounded-3xl p-4 border shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${themeBg} active:scale-[0.99] group`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <span className="text-base">{note.emoji}</span>
                          {note.isPinned && (
                            <span className="text-[10px] font-extrabold bg-[#1877F2] text-white px-2 py-0.5 rounded-full shadow-2xs">
                              置顶
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${themeTag.color}`}>
                            {themeTag.label}
                          </span>
                        </div>

                        {/* Actions: Edit & Share */}
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNote(note);
                              setNoteTitleInput(note.title);
                              setNoteContentInput(note.content);
                              setNoteCategoryInput(note.category);
                              setNoteThemeInput(note.theme);
                              setIsCreatingNote(true);
                            }}
                            className="w-6 h-6 rounded-full bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#1877F2] flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
                            title="编辑笔记"
                          >
                            <Edit3 size={11} className="stroke-[2]" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast(`原型演示：笔记【${note.title}】分享入口，尚未发送`);
                            }}
                            className="w-6 h-6 rounded-full bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#1877F2] flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
                            title="分享笔记"
                          >
                            <Share2 size={11} className="stroke-[2]" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xs font-black text-[#050505] dark:text-zinc-100 line-clamp-1 mb-1 group-hover:text-[#1877F2] transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-[11px] text-gray-700 dark:text-zinc-200 whitespace-pre-wrap line-clamp-3 leading-relaxed font-sans">
                        {note.content}
                      </p>

                      {/* Small thumbnail preview if note has images or location */}
                      {note.contentType === 'image' && note.imageData && note.imageData.images && note.imageData.images.length > 0 && (
                        <div className="mt-2 flex items-center space-x-1 overflow-hidden rounded-xl">
                          {note.imageData.images.slice(0, 3).map((img, i) => (
                            <img key={`thumb-${note.id || 'note'}-${i}`} src={img.url} alt="Thumb" className="w-12 h-12 rounded-lg object-cover" />
                          ))}
                        </div>
                      )}

                      {note.contentType === 'schedule' && note.scheduleData && (
                        <div className="mt-2 bg-white/80 dark:bg-zinc-900/80 rounded-xl p-2 text-[10px] text-indigo-800 border border-indigo-100 flex items-center justify-between">
                          <span className="font-bold truncate">⏰ {note.scheduleData.eventDate} {note.scheduleData.timeRange}</span>
                          <span className="shrink-0 font-medium text-gray-500 dark:text-zinc-400">{note.scheduleData.locationName}</span>
                        </div>
                      )}

                      {note.contentType === 'location' && note.locationData && (
                        <div className="mt-2 bg-white/80 dark:bg-zinc-900/80 rounded-xl p-2 text-[10px] text-emerald-800 border border-emerald-100 flex items-center justify-between">
                          <span className="font-bold truncate">📍 {note.locationData.address}</span>
                          <span className="shrink-0 font-medium text-emerald-600">导航 ›</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-gray-500 dark:text-zinc-400">
                      <span>{note.updatedAt || note.date}</span>
                      <span className="font-bold text-[#050505]/70 dark:text-zinc-300 bg-white/80 dark:bg-zinc-900/80 px-2 py-0.5 rounded-full">
                        {note.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* TAB 4: FAVORITES (收藏 - 消息/图片/文档/链接/语音)                  */}
        {/* =================================================================== */}
        {activeTab === 'favorites' && (
          <section className="space-y-3">
            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {[
                { key: 'all', label: '全部收藏' },
                { key: 'chat_snippet', label: '💬 聊天片段' },
                { key: 'photo', label: '🖼️ 图片照片' },
                { key: 'document', label: '📄 文档文件' },
                { key: 'link', label: '🔗 链接' },
              ].map((f) => (
                <button
                  key={`fav-cat-${f.key}`}
                  type="button"
                  onClick={() => setFavoriteCategoryFilter(f.key as any)}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    favoriteCategoryFilter === f.key
                      ? 'bg-[#1877F2] text-white shadow-2xs'
                      : 'bg-white dark:bg-zinc-900 text-[#65676B] dark:text-zinc-300 hover:text-[#050505] dark:hover:text-white border border-gray-200 dark:border-zinc-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Favorites List */}
            <div className="space-y-2.5">
              {filteredFavorites.map((fav) => (
                <div
                  key={fav.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-200/80 dark:border-zinc-700/80 shadow-2xs hover:shadow-xs transition-all flex flex-col space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={fav.sourceAvatar}
                        alt={fav.sourceName}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200 shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#050505] dark:text-zinc-100">{fav.sourceName}</h4>
                        <span className="text-[10px] text-[#65676B] dark:text-zinc-300">{fav.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Favorite Share Button (收藏内容增加分享按钮) */}
                      <button
                        type="button"
                        onClick={() => {
                          showToast(`原型演示：收藏【${fav.title}】分享入口，尚未发送`);
                        }}
                        className="w-7 h-7 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-[#1877F2] flex items-center justify-center text-gray-600 dark:text-zinc-300 cursor-pointer transition-all active:scale-95"
                        title="分享收藏"
                      >
                        <Share2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(fav.content);
                            showToast('内容已复制到剪贴板 📋');
                          } catch {
                            showToast('复制未完成，请重试');
                          }
                        }}
                        className="w-7 h-7 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300 cursor-pointer transition-all active:scale-95"
                        title="复制"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFavorites((prev) => prev.filter((item) => item.id !== fav.id));
                          showToast('已取消收藏');
                        }}
                        className="w-7 h-7 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-rose-100 dark:hover:bg-rose-950 hover:text-rose-600 flex items-center justify-center text-gray-600 dark:text-zinc-300 cursor-pointer transition-all active:scale-95"
                        title="取消收藏"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-[#050505] dark:text-zinc-100 mb-1">{fav.title}</h3>
                    <p className="text-xs text-gray-700 dark:text-zinc-200 leading-relaxed font-sans">{fav.content}</p>
                  </div>

                  {fav.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden max-h-48 max-w-sm mt-2 border border-gray-100">
                      <img
                        src={fav.mediaUrl}
                        alt="Favorite Media"
                        onClick={() => setLightboxImageUrl(fav.mediaUrl || null)}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-1.5 pt-1">
                    {fav.tags.map((tag, tIdx) => (
                      <span
                        key={`${tag}-${tIdx}`}
                        className="text-[10px] font-bold bg-[#F0F2F5] dark:bg-zinc-950 text-[#65676B] dark:text-zinc-300 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ===================================================================== */}
      {/* 4. MODALS & BOTTOM SHEETS                                             */}
      {/* ===================================================================== */}

      {/* AI Smart Category Inspector Modal */}
      {selectedAICategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 overflow-hidden font-sans">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#1877F2] to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#050505] dark:text-zinc-100">
                    {AI_CATEGORIES.find((c) => c.id === selectedAICategory)?.title}
                  </h3>
                  <p className="text-[11px] text-[#65676B] dark:text-zinc-300">
                    AI 自动识别共 {aiCategorizedAssets.length} 项文件
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSmartOrganizeModalOpen(true)}
                  disabled={aiCategorizedAssets.length === 0}
                  className="px-3 py-1.5 rounded-full bg-[#1877F2] hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1"
                >
                  <FolderPlus size={13} />
                  <span>一键智能归档</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAICategory(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Assets List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2 custom-scrollbar">
              {aiCategorizedAssets.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-zinc-400 text-xs">
                  此分类下暂无已识别的文件
                </div>
              ) : (
                aiCategorizedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 rounded-2xl bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-blue-50/60 dark:hover:bg-blue-950/60 border border-gray-100 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {asset.type === 'photo' ? (
                        <img
                          src={asset.url}
                          alt={asset.title}
                          onClick={() => setLightboxImageUrl(asset.url || null)}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-gray-200 shrink-0 cursor-pointer hover:opacity-90"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#050505] dark:text-zinc-100 truncate">{asset.title}</h4>
                        <p className="text-[10px] text-[#65676B] dark:text-zinc-300 flex items-center space-x-1.5 mt-0.5">
                          <span>来自：{asset.source?.name || '私聊/群聊'}</span>
                          <span>·</span>
                          <span>{asset.size || '2.1 MB'}</span>
                          <span>·</span>
                          <span>{asset.date}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {asset.type === 'photo' ? (
                        <button
                          type="button"
                          onClick={() => setLightboxImageUrl(asset.url || null)}
                          className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 text-xs font-bold text-[#1877F2] shadow-2xs hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer flex items-center space-x-1"
                        >
                          <Eye size={12} />
                          <span>查看</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPreviewDocument(asset)}
                          className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 text-xs font-bold text-[#1877F2] shadow-2xs hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer flex items-center space-x-1"
                        >
                          <Eye size={12} />
                          <span>预览</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Smart Organize Selector Modal (智能归档至个人文件夹/相册) */}
      {isSmartOrganizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black text-[#050505] dark:text-zinc-100">一键智能归档</h3>
              <button
                type="button"
                onClick={() => setIsSmartOrganizeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-[#65676B] dark:text-zinc-300 my-3">
              选择需要存入的目标个人相册或文件夹：
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 max-h-60">
              <div className="text-[11px] font-black text-gray-500 dark:text-zinc-400">个人相册：</div>
              {userAlbums.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => setTargetOrganizeCollectionId(alb.id)}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    targetOrganizeCollectionId === alb.id
                      ? 'bg-blue-50 dark:bg-blue-950 border-[#1877F2] shadow-2xs'
                      : 'bg-[#F0F2F5] dark:bg-zinc-950 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={alb.coverUrl}
                      alt={alb.name}
                      className="w-8 h-8 rounded-xl object-cover"
                    />
                    <span className="text-xs font-bold text-[#050505] dark:text-zinc-100">{alb.name}</span>
                  </div>
                  {targetOrganizeCollectionId === alb.id && (
                    <CheckCircle2 size={16} className="text-[#1877F2]" />
                  )}
                </div>
              ))}

              <div className="text-[11px] font-black text-gray-500 dark:text-zinc-400 mt-3">个人文档文件夹：</div>
              {userFolders.map((fld) => (
                <div
                  key={fld.id}
                  onClick={() => setTargetOrganizeCollectionId(fld.id)}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    targetOrganizeCollectionId === fld.id
                      ? 'bg-blue-50 dark:bg-blue-950 border-[#1877F2] shadow-2xs'
                      : 'bg-[#F0F2F5] dark:bg-zinc-950 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Folder size={18} className="text-[#1877F2]" />
                    <span className="text-xs font-bold text-[#050505] dark:text-zinc-100">{fld.name}</span>
                  </div>
                  {targetOrganizeCollectionId === fld.id && (
                    <CheckCircle2 size={16} className="text-[#1877F2]" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsSmartOrganizeModalOpen(false)}
                className="px-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold text-gray-600 dark:text-zinc-300"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleExecuteSmartOrganize}
                className="px-5 py-2 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1"
              >
                <Check size={14} />
                <span>确认归档</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Album Details Modal (Timeline & Enlarged Photos / Preview Grid & Sender Info) */}
      {activeAlbumDetails && (
        <div className="fixed inset-0 z-50 bg-[#F0F2F5] dark:bg-zinc-950 flex flex-col font-sans animate-in slide-in-from-right duration-200">
          <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 px-4 pt-10 pb-3 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setActiveAlbumDetails(null)}
                className="w-11 h-11 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 text-[#050505] dark:text-zinc-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-black text-[#050505] dark:text-zinc-100">{activeAlbumDetails.name}</h3>
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    +{activeAlbumDetails.newItemsCount || (activeAlbumDetails.isGroupSync ? 2 : 3)} 新增照片
                  </span>
                </div>
                <p className="text-[11px] text-[#65676B] dark:text-zinc-300">
                  {activeAlbumDetails.isGroupSync ? '群聊自动同步相册' : '个人专属相册'} · 时间轴降序排列 · {activeAlbumDetails.photos.length} 张照片
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Preview vs Large Mode Switch Toggle */}
              <div className="flex items-center space-x-1 bg-[#F0F2F5] dark:bg-zinc-950 p-1 rounded-full border border-gray-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setAlbumViewMode('preview')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                    albumViewMode === 'preview'
                      ? 'bg-white dark:bg-zinc-900 text-[#1877F2] shadow-2xs font-black'
                      : 'text-[#65676B] dark:text-zinc-300 hover:text-[#050505] dark:hover:text-white'
                  }`}
                >
                  <Grid size={13} />
                  <span>预览模式</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAlbumViewMode('large')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                    albumViewMode === 'large'
                      ? 'bg-white dark:bg-zinc-900 text-[#1877F2] shadow-2xs font-black'
                      : 'text-[#65676B] dark:text-zinc-300 hover:text-[#050505] dark:hover:text-white'
                  }`}
                >
                  <LayoutList size={13} />
                  <span>大图模式</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => showToast('已启动相册批量下载 ⬇️')}
                className="px-3 py-1.5 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 text-xs font-bold text-[#050505] dark:text-zinc-100 flex items-center space-x-1 cursor-pointer"
              >
                <Download size={13} />
                <span className="hidden sm:inline">下载全部</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto space-y-6 custom-scrollbar">
            {activeAlbumDetails.photos.length === 0 ? (
              <div className="text-center py-20 text-gray-500 dark:text-zinc-400 text-xs">
                相册内暂无照片，在聊天中发送或点击快捷存入即可添加
              </div>
            ) : (
              (() => {
                // Group photos by date timeline
                const sorted = [...activeAlbumDetails.photos].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                const timelineGroups: { dateLabel: string; items: DocumentAsset[] }[] = [];
                sorted.forEach((photo) => {
                  const label = photo.date || '最近上传';
                  let group = timelineGroups.find((g) => g.dateLabel === label);
                  if (!group) {
                    group = { dateLabel: label, items: [] };
                    timelineGroups.push(group);
                  }
                  group.items.push(photo);
                });

                return timelineGroups.map((group, groupIdx) => (
                  <div key={`photo-group-${groupIdx}`} className="relative pl-6 border-l-2 border-blue-200 space-y-3">
                    {/* Timeline Node Badge */}
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-[#1877F2] ring-4 ring-blue-100 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-zinc-900" />
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-black text-[#050505] dark:text-zinc-100 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-700 shadow-2xs flex items-center space-x-1">
                        <Clock size={12} className="text-[#1877F2]" />
                        <span>{group.dateLabel}</span>
                      </span>
                      <span className="text-[10px] text-[#65676B] dark:text-zinc-300 font-semibold">
                        ({group.items.length} 张照片)
                      </span>
                    </div>

                    {albumViewMode === 'preview' ? (
                      /* Preview Mode: Small Photo Grid + Timeline */
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {group.items.map((photo, photoIdx) => {
                          const senderAvatar = photo.source?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';
                          const senderName = photo.source?.name || photo.author || '群成员';

                          return (
                            <div
                              key={`photo-grid-${photo.id}-${photoIdx}`}
                              onClick={() => {
                                setFullScreenPhotoAsset(photo);
                                setPhotoFilter('none');
                                setPhotoRotation(0);
                                setPhotoCaption(photo.title);
                              }}
                              className="group relative rounded-xl overflow-hidden bg-gray-900 aspect-square cursor-pointer shadow-2xs hover:shadow-md transition-all border border-gray-100"
                            >
                              {/* Small Thumbnail Image */}
                              <img
                                src={photo.url}
                                alt={photo.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />

                              {/* Top Sender Badge Overlay */}
                              <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                                <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded-full text-white">
                                  <img src={senderAvatar} alt={senderName} className="w-3.5 h-3.5 rounded-full object-cover" />
                                  <span className="text-[9px] font-bold truncate max-w-[60px]">{senderName}</span>
                                </div>
                              </div>

                              {/* Bottom Caption Overlay */}
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                                <div className="text-[10.5px] font-bold truncate leading-tight">{photo.title}</div>
                                <div className="flex items-center justify-between text-[9px] text-gray-300 mt-0.5">
                                  <span>{photo.date}</span>
                                  <span className="flex items-center space-x-1">
                                    <Maximize2 size={11} className="shrink-0" />
                                    <span>放大</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Flat Feed Discovery-Style Photo Stream (No Cards) */
                      <div className="space-y-4 divide-y divide-gray-100">
                        {group.items.map((photo, photoIdx) => {
                          const senderAvatar = photo.source?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';
                          const senderName = photo.source?.name || photo.author || '群成员';

                          return (
                            <div
                              key={`photo-stream-${photo.id}-${photoIdx}`}
                              className="pt-4 first:pt-0 space-y-2.5 group"
                            >
                              {/* Sender Info Header (Flat, Discovery Style) */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  <img
                                    src={senderAvatar}
                                    alt={senderName}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-[#050505] dark:text-zinc-100 truncate">{senderName}</div>
                                    <div className="text-[10px] text-[#65676B] dark:text-zinc-300 flex items-center space-x-1">
                                      <span>发送于 {photo.date}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-[#1877F2] shrink-0 border border-blue-100">
                                  {photo.source?.type === 'group' ? '群聊同步' : '个人作品'}
                                </span>
                              </div>

                              {/* Flat Photo Banner Display */}
                              <div
                                onClick={() => {
                                  setFullScreenPhotoAsset(photo);
                                  setPhotoFilter('none');
                                  setPhotoRotation(0);
                                  setPhotoCaption(photo.title);
                                }}
                                className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-900 cursor-pointer"
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.title}
                                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3.5 flex flex-col justify-between text-white">
                                  <div className="flex justify-end">
                                    <span className="bg-black/60 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                                      <Maximize2 size={11} />
                                      <span>点击全屏/编辑</span>
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold truncate">{photo.title}</p>
                                    <p className="text-[10px] text-gray-300">点击进入全屏修图 & 转发</p>
                                  </div>
                                </div>
                              </div>

                              {/* Flat Action Toolbar with Circular Icon Button Combos */}
                              <div className="flex items-center justify-between pt-1">
                                <div className="min-w-0 pr-2">
                                  <div className="text-xs font-bold text-[#050505] dark:text-zinc-100 truncate">{photo.title}</div>
                                  <div className="text-[10px] text-[#65676B] dark:text-zinc-300">{photo.size || '2.4 MB'}</div>
                                </div>

                                {/* Circular Icon Button Combo */}
                                <div className="flex items-center space-x-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFullScreenPhotoAsset(photo);
                                      setPhotoFilter('none');
                                      setPhotoRotation(0);
                                      setPhotoCaption(photo.title);
                                    }}
                                    className="w-11 h-11 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#1877F2] hover:text-white text-[#050505] dark:text-zinc-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                    title="全屏大图与编辑"
                                  >
                                    <Maximize2 size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setForwardModalAsset(photo);
                                    }}
                                    className="w-11 h-11 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#1877F2] hover:text-white text-[#050505] dark:text-zinc-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                    title="转发照片"
                                  >
                                    <Share2 size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      showToast(`已将【${photo.title}】存入收藏 🌟`);
                                    }}
                                    className="w-11 h-11 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-amber-500 hover:text-white text-[#050505] dark:text-zinc-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                    title="收藏"
                                  >
                                    <Bookmark size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      showToast(`正在下载原图：${photo.title} ⬇️`);
                                    }}
                                    className="w-11 h-11 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-emerald-600 hover:text-white text-[#050505] dark:text-zinc-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                    title="下载"
                                  >
                                    <Download size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ));
              })()
            )}
          </div>
        </div>
      )}

      {/* Folder Details Modal (Timeline & Documents & Sender Avatars) */}
      {activeFolderDetails && (
        <div className="fixed inset-0 z-50 bg-[#F0F2F5] dark:bg-zinc-950 flex flex-col font-sans animate-in slide-in-from-right duration-200">
          <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 px-4 pt-10 pb-3 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setActiveFolderDetails(null)}
                className="w-11 h-11 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 text-[#050505] dark:text-zinc-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-black text-[#050505] dark:text-zinc-100">{activeFolderDetails.name}</h3>
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    +{activeFolderDetails.newItemsCount || (activeFolderDetails.isGroupSync ? 2 : 4)} 新增文件
                  </span>
                </div>
                <p className="text-[11px] text-[#65676B] dark:text-zinc-300">
                  {activeFolderDetails.isGroupSync ? '群聊自动同步文档' : '个人专属文档'} · 时间轴降序 · {activeFolderDetails.files.length} 份文档
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline-flex bg-blue-50 dark:bg-blue-950 text-[#1877F2] text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
                时间轴视图 ⏱️
              </span>
              <button
                type="button"
                onClick={() => showToast('已打包下载文件夹内容 📦')}
                className="px-3 py-1.5 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 text-xs font-bold text-[#050505] dark:text-zinc-100 flex items-center space-x-1 cursor-pointer"
              >
                <Download size={13} />
                <span>全部下载</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto space-y-6 custom-scrollbar">
            {activeFolderDetails.files.length === 0 ? (
              <div className="text-center py-20 text-gray-500 dark:text-zinc-400 text-xs">
                文件夹内暂无文档文件
              </div>
            ) : (
              (() => {
                const sorted = [...activeFolderDetails.files].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                const timelineGroups: { dateLabel: string; items: DocumentAsset[] }[] = [];
                sorted.forEach((file) => {
                  const label = file.date || '最近上传';
                  let group = timelineGroups.find((g) => g.dateLabel === label);
                  if (!group) {
                    group = { dateLabel: label, items: [] };
                    timelineGroups.push(group);
                  }
                  group.items.push(file);
                });

                return timelineGroups.map((group, groupIdx) => (
                  <div key={`file-group-${groupIdx}`} className="relative pl-6 border-l-2 border-blue-200 space-y-3">
                    {/* Timeline Node Badge */}
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-[#1877F2] ring-4 ring-blue-100 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-zinc-900" />
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-black text-[#050505] dark:text-zinc-100 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-700 shadow-2xs flex items-center space-x-1">
                        <Clock size={12} className="text-[#1877F2]" />
                        <span>{group.dateLabel}</span>
                      </span>
                      <span className="text-[10px] text-[#65676B] dark:text-zinc-300 font-semibold">
                        ({group.items.length} 份文档)
                      </span>
                    </div>

                    {/* Flat Feed Discovery-Style Document Stream (No Cards) */}
                    <div className="space-y-1 divide-y divide-gray-100">
                      {group.items.map((file, fileIdx) => {
                        const senderAvatar = file.source?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';
                        const senderName = file.source?.name || file.author || '成员';

                        return (
                          <div
                            key={`file-${file.id}-${fileIdx}`}
                            onClick={() => setQuickPreviewAsset(file)}
                            className="py-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer group gap-3 hover:bg-gray-50/80 dark:hover:bg-zinc-800/80 px-2 rounded-xl transition-colors"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              {/* Sender Avatar + Document Badge */}
                              <div className="relative shrink-0">
                                <img
                                  src={senderAvatar}
                                  alt={senderName}
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 shadow-2xs"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[8px] font-bold">
                                  📄
                                </div>
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-xs font-black text-[#050505] dark:text-zinc-100 truncate group-hover:text-[#1877F2] transition-colors">
                                    {file.title}
                                  </h4>
                                  <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[#1877F2] shrink-0 border border-blue-100">
                                    {(file as any).fileType || file.type || 'PDF'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#65676B] dark:text-zinc-300 flex items-center space-x-2 mt-0.5">
                                  <span className="font-semibold text-[#050505] dark:text-zinc-100">发送人：{senderName}</span>
                                  <span>·</span>
                                  <span>大小：{file.size || '1.8 MB'}</span>
                                  <span>·</span>
                                  <span>发送时间：{file.date}</span>
                                </p>
                              </div>
                            </div>

                            {/* Circular Icon Button Combination Toolbar */}
                            <div className="flex items-center space-x-2 justify-end shrink-0 pt-2 sm:pt-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuickPreviewAsset(file);
                                }}
                                className="w-11 h-11 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#1877F2] hover:text-white text-[#050505] dark:text-zinc-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                title="快速预览"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForwardModalAsset(file);
                                }}
                                className="w-11 h-11 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#1877F2] hover:text-white text-[#050505] dark:text-zinc-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                title="转发文档"
                              >
                                <Share2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showToast(`已将【${file.title}】存入收藏 🌟`);
                                }}
                                className="w-11 h-11 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-amber-500 hover:text-white text-[#050505] dark:text-zinc-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                title="收藏"
                              >
                                <Bookmark size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showToast(`正在下载文档：${file.title}`);
                                }}
                                className="w-11 h-11 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-emerald-600 hover:text-white text-[#050505] dark:text-zinc-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                                title="下载"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </div>
      )}

      {/* Full-Screen Photo Viewer & Editor Modal */}
      {fullScreenPhotoAsset && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col font-sans text-white animate-in zoom-in-95 duration-200">
          {/* Top Bar */}
          <header className="px-4 py-3 bg-black/60 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setFullScreenPhotoAsset(null)}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-center space-x-2.5">
                <img
                  src={fullScreenPhotoAsset.source?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                  alt="Sender"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-white/30"
                />
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">{fullScreenPhotoAsset.title}</h3>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-400">
                    发送人：{fullScreenPhotoAsset.source?.name || fullScreenPhotoAsset.author || '成员'} · {fullScreenPhotoAsset.date}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setForwardModalAsset(fullScreenPhotoAsset)}
                className="px-3 py-1.5 rounded-full bg-[#1877F2] hover:bg-blue-600 text-xs font-bold text-white flex items-center space-x-1 cursor-pointer transition-all shadow-md active:scale-95"
              >
                <Share2 size={13} />
                <span>转发照片</span>
              </button>
              <button
                type="button"
                onClick={() => showToast(`已保存并下载修图：${fullScreenPhotoAsset.title}`)}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Download size={13} />
                <span>保存照片</span>
              </button>
            </div>
          </header>

          {/* Center Image Preview with Dynamic Filter & Rotation */}
          <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
            <img
              src={fullScreenPhotoAsset.url}
              alt={fullScreenPhotoAsset.title}
              style={{
                filter:
                  photoFilter === 'vivid'
                    ? 'saturate(1.5) contrast(1.1)'
                    : photoFilter === 'film'
                    ? 'sepia(0.35) contrast(1.15) brightness(0.95)'
                    : photoFilter === 'bw'
                    ? 'grayscale(1) contrast(1.2)'
                    : photoFilter === 'warm'
                    ? 'sepia(0.25) hue-rotate(-15deg) saturate(1.2)'
                    : 'none',
                transform: `rotate(${photoRotation}deg)`,
              }}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"
            />

            {/* EXIF Info Popover Overlay */}
            {showExifInfo && (
              <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-xs space-y-2 text-gray-200 w-64 shadow-2xl animate-in fade-in duration-150">
                <div className="font-bold text-white border-b border-white/10 pb-1 flex items-center justify-between">
                  <span>📸 照片 EXIF 信息</span>
                  <button onClick={() => setShowExifInfo(false)} className="text-gray-500 dark:text-zinc-400 hover:text-white">
                    <X size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className="text-gray-500 dark:text-zinc-400">设备:</span>
                  <span>iPhone 15 Pro</span>
                  <span className="text-gray-500 dark:text-zinc-400">焦距:</span>
                  <span>24mm f/1.88</span>
                  <span className="text-gray-500 dark:text-zinc-400">快门:</span>
                  <span>1/250s</span>
                  <span className="text-gray-500 dark:text-zinc-400">ISO:</span>
                  <span>50</span>
                  <span className="text-gray-500 dark:text-zinc-400">分辨率:</span>
                  <span>4032 × 3024</span>
                  <span className="text-gray-500 dark:text-zinc-400">色彩空间:</span>
                  <span>Display P3</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Edit Toolbar */}
          <footer className="px-4 py-3 bg-black/80 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
            {/* Filter Selector */}
            <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full custom-scrollbar pb-1 md:pb-0">
              <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold mr-1 shrink-0">滤镜:</span>
              {[
                { key: 'none', label: '原图' },
                { key: 'vivid', label: '鲜艳' },
                { key: 'film', label: '胶片' },
                { key: 'bw', label: '黑白' },
                { key: 'warm', label: '暖阳' },
              ].map((f) => (
                <button
                  key={`photo-filter-${f.key}`}
                  type="button"
                  onClick={() => setPhotoFilter(f.key as any)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    photoFilter === f.key
                      ? 'bg-[#1877F2] text-white shadow-md'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Quick Editing Actions */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPhotoRotation((prev) => (prev + 90) % 360)}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center space-x-1 cursor-pointer transition-colors"
                title="顺时针旋转90度"
              >
                <RotateCw size={13} />
                <span>旋转</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExifInfo(!showExifInfo)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors ${
                  showExifInfo ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Info size={13} />
                <span>信息</span>
              </button>

              {/* Forward Button in Toolbar */}
              <button
                type="button"
                onClick={() => setForwardModalAsset(fullScreenPhotoAsset)}
                className="px-4 py-1.5 rounded-full bg-[#1877F2] hover:bg-blue-600 text-xs font-bold text-white flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 shadow-md"
              >
                <Share2 size={13} />
                <span>转发至聊天</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* Asset Forward Modal */}
      {forwardModalAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col font-sans">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-[#1877F2] flex items-center justify-center">
                  <Share2 size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#050505] dark:text-zinc-100">转发资产</h3>
                  <p className="text-[10px] text-[#65676B] dark:text-zinc-300">选择要转发至的群聊或好友</p>
                </div>
              </div>
              <button
                onClick={() => setForwardModalAsset(null)}
                className="w-7 h-7 rounded-full bg-gray-200/80 hover:bg-gray-300 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Selected Asset Preview Snippet */}
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/60 border-b border-blue-100/50 flex items-center space-x-3">
              {forwardModalAsset.type === 'photo' && forwardModalAsset.url ? (
                <img src={forwardModalAsset.url} alt="Thumbnail" className="w-10 h-10 rounded-xl object-cover shrink-0 border" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1877F2] flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#050505] dark:text-zinc-100 truncate">{forwardModalAsset.title}</div>
                <div className="text-[10px] text-[#65676B] dark:text-zinc-300">大小：{forwardModalAsset.size || '2.0 MB'}</div>
              </div>
            </div>

            {/* Target Search Box */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-500 dark:text-zinc-400" />
                <input
                  type="text"
                  placeholder="搜索好友或群聊名称..."
                  value={forwardSearchQuery}
                  onChange={(e) => setForwardSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 text-xs focus:outline-none focus:ring-2 focus:ring-[#1877F2] border-none"
                />
              </div>
            </div>

            {/* Contact / Group List */}
            <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {[
                { id: 'c1', name: '兰州同城漫游小队', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150', isGroup: true },
                { id: 'c2', name: '家族亲友交流群', avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=150', isGroup: true },
                { id: 'c3', name: 'Sophia Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', isGroup: false },
                { id: 'c4', name: 'Mark Zhang', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', isGroup: false },
                { id: 'c5', name: 'UI产品设计组', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=150', isGroup: true },
              ]
                .filter((c) => c.name.toLowerCase().includes(forwardSearchQuery.toLowerCase()))
                .map((target) => (
                  <div
                    key={target.id}
                    onClick={() => {
                      showToast(`原型演示：向 ${target.name} 转发【${forwardModalAsset.title}】，尚未发送`);
                      setForwardModalAsset(null);
                    }}
                    className="p-2.5 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={target.avatar} alt={target.name} className="w-11 h-11 rounded-full object-cover border" />
                      <div>
                        <div className="text-xs font-bold text-[#050505] dark:text-zinc-100 group-hover:text-[#1877F2] transition-colors">{target.name}</div>
                        <div className="text-[10px] text-[#65676B] dark:text-zinc-300">{target.isGroup ? '群聊' : '好友联系人'}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 text-gray-700 dark:text-zinc-200 group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                      发送
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Group Chat Synced Assets Modal */}
      {activeGroupAssetModal && (
        <GroupAssetsModal
          isOpen={!!activeGroupAssetModal}
          onClose={() => setActiveGroupAssetModal(null)}
          groupName={activeGroupAssetModal.groupName}
          groupAvatar={activeGroupAssetModal.groupAvatar}
          groupSourceId={activeGroupAssetModal.groupSourceId}
          assets={activeGroupAssetModal.assets}
          onPreviewAsset={(asset) => setQuickPreviewAsset(asset)}
          onShowToast={showToast}
        />
      )}

      {/* Universal Quick Preview Modal with Rich Specialized Layouts */}
      {quickPreviewAsset && (
        <DocumentQuickPreviewModal
          asset={quickPreviewAsset}
          onClose={() => setQuickPreviewAsset(null)}
          onShowToast={showToast}
          onSaveToPersonalAlbum={(asset, albumId) => {
            setUserAlbums((prev) =>
              prev.map((a) =>
                a.id === albumId
                  ? {
                      ...a,
                      photoCount: a.photoCount + 1,
                      photos: [asset, ...a.photos.filter((p) => p.id !== asset.id)],
                    }
                  : a
              )
            );
            showToast('已成功存入指定个人相册 📸');
          }}
          onSaveToPersonalFolder={(asset, folderId) => {
            setUserFolders((prev) =>
              prev.map((f) =>
                f.id === folderId
                  ? {
                      ...f,
                      fileCount: f.fileCount + 1,
                      files: [asset, ...f.files.filter((fl) => fl.id !== asset.id)],
                    }
                  : f
              )
            );
            showToast('已成功存入指定个人文件夹 📁');
          }}
          userAlbums={userAlbums}
          userFolders={userFolders}
        />
      )}

      {/* AI One-Click Auto Archive Modal */}
      {isAutoArchiveModalOpen && (
        <AiAutoArchiveModal
          isOpen={isAutoArchiveModalOpen}
          onClose={() => setIsAutoArchiveModalOpen(false)}
          unclassifiedAssets={unclassifiedAssets}
          onConfirmArchive={handleConfirmAutoArchive}
          onShowToast={showToast}
        />
      )}

      {/* GoodNotes Style Note Editor Modal */}
      {isCreatingNote && (
        <GoodNotesNoteModal
          isOpen={isCreatingNote}
          onClose={() => setIsCreatingNote(false)}
          onSaveNote={(newNote) => {
            const createdNoteItem: NoteItem = {
              id: `gn_${Date.now()}`,
              title: newNote.title,
              content: newNote.content,
              category: 'GoodNotes手记',
              emoji: '📑',
              date: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
              updatedAt: '刚刚',
              tags: ['GoodNotes', newNote.paperTemplate, '全屏无界画布'],
              theme: 'blue',
              isPinned: true,
              contentType: newNote.attachments.audio
                ? 'schedule'
                : newNote.attachments.images.length > 0
                ? 'image'
                : 'text',
            };
            setNotes((prev) => [createdNoteItem, ...prev]);
            setIsCreatingNote(false);
          }}
          showToast={showToast}
        />
      )}

      {/* Create User Album Modal */}
      {isCreateAlbumOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black text-[#050505] dark:text-zinc-100">创建个人相册</h3>
              <button
                type="button"
                onClick={() => setIsCreateAlbumOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300"
              >
                <X size={15} />
              </button>
            </div>

            <div className="py-3 space-y-3">
              <div>
                <label className="text-xs font-bold text-[#050505] dark:text-zinc-100 block mb-1">相册名称</label>
                <input
                  type="text"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="例如：📸 兰州街拍精选"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F0F2F5] dark:bg-zinc-950 text-xs text-[#050505] dark:text-zinc-100 outline-none border border-transparent focus:border-[#1877F2]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#050505] dark:text-zinc-100 block mb-1">相册描述</label>
                <textarea
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  placeholder="添加相册描述..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F0F2F5] dark:bg-zinc-950 text-xs text-[#050505] dark:text-zinc-100 outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreateAlbumOpen(false)}
                className="px-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-bold text-gray-600 dark:text-zinc-300"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateUserAlbum}
                className="px-5 py-2 rounded-full bg-[#1877F2] text-white text-xs font-bold shadow-xs"
              >
                立即创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Folder Modal */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black text-[#050505] dark:text-zinc-100">创建个人文档文件夹</h3>
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300"
              >
                <X size={15} />
              </button>
            </div>

            <div className="py-3 space-y-3">
              <div>
                <label className="text-xs font-bold text-[#050505] dark:text-zinc-100 block mb-1">文件夹名称</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="例如：💼 个人合同与资料"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F0F2F5] dark:bg-zinc-950 text-xs text-[#050505] dark:text-zinc-100 outline-none border border-transparent focus:border-[#1877F2]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#050505] dark:text-zinc-100 block mb-1">文件夹描述</label>
                <textarea
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="添加文件夹用途描述..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F0F2F5] dark:bg-zinc-950 text-xs text-[#050505] dark:text-zinc-100 outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(false)}
                className="px-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-bold text-gray-600 dark:text-zinc-300"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateUserFolder}
                className="px-5 py-2 rounded-full bg-[#1877F2] text-white text-xs font-bold shadow-xs"
              >
                立即创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Fullscreen View */}
      {lightboxImageUrl && (
        <div
          onClick={() => setLightboxImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
        >
          <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
            <a
              href={lightboxImageUrl}
              download="photo.jpg"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
            >
              <Download size={18} />
            </a>
            <button
              type="button"
              onClick={() => setLightboxImageUrl(null)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div onClick={(e) => e.stopPropagation()} className="max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
            <img src={lightboxImageUrl} alt="Full view" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* Document Reader Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2.5">
                <FileText size={20} className="text-[#1877F2]" />
                <h3 className="text-xs font-black text-[#050505] dark:text-zinc-100 truncate max-w-[280px]">
                  {previewDocument.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300"
              >
                <X size={15} />
              </button>
            </div>

            <div className="py-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 bg-[#F0F2F5] dark:bg-zinc-950 rounded-2xl space-y-1.5 text-xs text-[#65676B] dark:text-zinc-300">
                <div><span className="font-bold text-[#050505] dark:text-zinc-100">文件大小：</span>{previewDocument.size || '1.8 MB'}</div>
                <div><span className="font-bold text-[#050505] dark:text-zinc-100">来源：</span>{previewDocument.source?.name || '私聊/群聊'}</div>
                <div><span className="font-bold text-[#050505] dark:text-zinc-100">AI 识别分类：</span>{previewDocument.aiCategory}</div>
                <div><span className="font-bold text-[#050505] dark:text-zinc-100">归档时间：</span>{previewDocument.date}</div>
              </div>

              <div className="p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl text-xs text-gray-800 leading-relaxed font-mono">
                <div className="text-center font-bold text-sm mb-3 text-[#050505] dark:text-zinc-100 font-sans">
                  {previewDocument.title}
                </div>
                <p className="mb-2">【Stellar 云端文档实时预览】</p>
                <p className="text-gray-600 dark:text-zinc-300">
                  本文档已通过高精度加密同步至文档中心。支持跨平台多端在线查阅、权限分享与批注导出。
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="px-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-bold text-gray-600 dark:text-zinc-300"
              >
                关闭
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`正在下载：${previewDocument.title}`);
                  setPreviewDocument(null);
                }}
                className="px-5 py-2 rounded-full bg-[#1877F2] text-white text-xs font-bold shadow-xs flex items-center space-x-1"
              >
                <Download size={14} />
                <span>下载文件</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thematic Note View Modal (支持日程、定位、图片、文字 4大主题形态) */}
      <NoteThematicViewModal
        note={selectedThematicNote}
        isOpen={!!selectedThematicNote}
        onClose={() => setSelectedThematicNote(null)}
        onEditNote={(n) => {
          setSelectedThematicNote(null);
          setEditingNote(n);
          setNoteTitleInput(n.title);
          setNoteContentInput(n.content);
          setNoteCategoryInput(n.category);
          setNoteThemeInput(n.theme);
          setIsCreatingNote(true);
        }}
        onDeleteNote={(nId) => {
          setNotes((prev) => prev.filter((item) => item.id !== nId));
          setSelectedThematicNote(null);
          showToast('笔记已从文档中心删除 🗑️');
        }}
        onTogglePinNote={(nId) => {
          setNotes((prev) =>
            prev.map((item) =>
              item.id === nId ? { ...item, isPinned: !item.isPinned } : item
            )
          );
          if (selectedThematicNote && selectedThematicNote.id === nId) {
            setSelectedThematicNote({
              ...selectedThematicNote,
              isPinned: !selectedThematicNote.isPinned,
            });
          }
        }}
        showToast={showToast}
      />
    </div>
  );
};
