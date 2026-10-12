import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  X,
  Search,
  FolderPlus,
  FilePlus,
  Sparkles,
  Download,
  Share2,
  Check,
  ChevronRight,
  Eye,
  Calendar,
  Clock,
  Folder,
  Tag,
  ArrowLeft,
  MoreVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  emoji: string;
  date: string;
  theme: 'pink' | 'blue' | 'yellow' | 'purple' | 'green';
  isPinned?: boolean;
}

export interface PhotoAlbum {
  id: string;
  name: string;
  coverUrl: string;
  photoCount: number;
  createdDate: string;
  description?: string;
  photos: {
    id: string;
    url: string;
    title: string;
    uploadedAt: string;
  }[];
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'docx' | 'pdf' | 'xlsx' | 'txt' | 'md';
  size: string;
  lastModified: string;
  author: string;
  content: string;
  tags: string[];
}

interface TextCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

// Initial Mock Data for Notes, Albums, and Documents
const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Stellar 产品设计核心灵感',
    content: '1. Facebook-style 平铺布局，去除冗余卡片；2. 底部导航栏与主控制中心全圆角图标化；3. 语音气泡动画与 AI 转文字秒级响应。',
    category: '产品灵感',
    emoji: '💡',
    date: '2026-08-18',
    theme: 'pink',
    isPinned: true,
  },
  {
    id: 'note-2',
    title: '同城出游活动招募要点',
    content: '兰州金城关博览园集合，预估 12 人参与，费用 AA 制。准备无人机航拍与便携露营咖啡机。',
    category: '活动策划',
    emoji: '☕',
    date: '2026-08-16',
    theme: 'blue',
  },
  {
    id: 'note-3',
    title: '极客车队技术分享会议',
    content: '讨论 React 19 渲染流与智能地图图层性能优化，重点解决 60fps 滑动帧率体验。',
    category: '技术笔记',
    emoji: '🚀',
    date: '2026-08-14',
    theme: 'yellow',
  },
];

const INITIAL_ALBUMS: PhotoAlbum[] = [
  {
    id: 'album-1',
    name: '兰州黄河风情线影集',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
    photoCount: 4,
    createdDate: '2026-08-10',
    description: '记录兰州中山桥与黄河夜景的惬意时光',
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
        title: '黄河白塔山夕阳',
        uploadedAt: '2026-08-10 18:30',
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=800',
        title: '中山桥灯光秀',
        uploadedAt: '2026-08-10 20:15',
      },
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800',
        title: '羊皮筏子过黄河',
        uploadedAt: '2026-08-11 14:20',
      },
      {
        id: 'p4',
        url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800',
        title: '黄河母亲雕塑聚会合照',
        uploadedAt: '2026-08-12 09:45',
      },
    ],
  },
  {
    id: 'album-2',
    name: 'Stellar UI 界面设计参考图库',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    photoCount: 3,
    createdDate: '2026-08-01',
    description: 'Facebook 风格视觉设计规范与组件灵感集',
    photos: [
      {
        id: 'p20',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        title: '高对比度圆角设计规范',
        uploadedAt: '2026-08-01 10:00',
      },
      {
        id: 'p21',
        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
        title: '地图图层与悬浮面板组件',
        uploadedAt: '2026-08-02 11:30',
      },
      {
        id: 'p22',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
        title: '实时位置图标与粒子光效',
        uploadedAt: '2026-08-05 16:20',
      },
    ],
  },
];

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: '2026第三季度社群出游规划方案.docx',
    type: 'docx',
    size: '2.4 MB',
    lastModified: '2026-08-17 16:40',
    author: 'Rarcardo Zhan',
    content: '一、活动主题：兰州黄河风情线同城骑行与露营\n二、行程安排：\n1. 09:00 - 10:00 金城关集结与安检\n2. 10:30 - 12:00 沿着滨河路骑行至黄河大观\n3. 12:30 - 15:00 草坪露营、手冲咖啡与吉他弹唱\n三、物资清单：露营帐篷、充电宝、急救药箱、折叠椅。',
    tags: ['活动方案', '出游', '规划'],
  },
  {
    id: 'doc-2',
    name: 'Stellar 全平台通信协议规范.pdf',
    type: 'pdf',
    size: '5.8 MB',
    lastModified: '2026-08-15 11:20',
    author: 'Alex Mercer',
    content: 'Stellar 移动端与 Web 端即时通讯 Protocol v3.2：\n1. 消息送达与已读状态双向确认机制；\n2. 阅后即焚加密信道建立规范；\n3. 逐条转发与批量统一转发数据包处理逻辑；\n4. 地图实时位置高频更新流算法。',
    tags: ['技术文档', '架构', 'PDF'],
  },
  {
    id: 'doc-3',
    name: '出游预算与费用AA明细表.xlsx',
    type: 'xlsx',
    size: '1.1 MB',
    lastModified: '2026-08-12 09:15',
    author: 'Sarah Chen',
    content: '费用明细：\n1. 场地租用与餐食采购：￥1,280\n2. 户外装备租借：￥450\n3. 饮用水与零食甜点：￥320\n人均应付：￥170 / 人 (实到 12 人)。',
    tags: ['财务', '预算', '表格'],
  },
];

export const TextCenterModal: React.FC<TextCenterModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'albums' | 'documents'>('notes');

  // Local state for Notes, Albums, Documents
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [albums, setAlbums] = useState<PhotoAlbum[]>(INITIAL_ALBUMS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);

  const [searchQuery, setSearchQuery] = useState('');

  // Creation Modals & Forms
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('个人随笔');
  const [newNoteEmoji, setNewNoteEmoji] = useState('📝');
  const [newNoteTheme, setNewNoteTheme] = useState<'pink' | 'blue' | 'yellow' | 'purple' | 'green'>('pink');

  // Create Album Modal State ("自己建立命名相册")
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [newAlbumCoverUrl, setNewAlbumCoverUrl] = useState('');

  // Active Album Inspection & Add Photo
  const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum | null>(null);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Rename Album Modal
  const [showRenameAlbumModal, setShowRenameAlbumModal] = useState(false);
  const [renameAlbumTarget, setRenameAlbumTarget] = useState<PhotoAlbum | null>(null);
  const [renamedAlbumName, setRenamedAlbumName] = useState('');

  // Create Document Modal State ("自己建立命名文档名称")
  const [showCreateDocModal, setShowCreateDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<'docx' | 'pdf' | 'xlsx' | 'txt' | 'md'>('docx');
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocTags, setNewDocTags] = useState('文档, 笔记');

  // Preview / Edit Document Modal
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [showRenameDocModal, setShowRenameDocModal] = useState(false);
  const [renameDocTarget, setRenameDocTarget] = useState<DocumentItem | null>(null);
  const [renamedDocName, setRenamedDocName] = useState('');

  // Lightbox for Photos
  const [lightboxPhotoUrl, setLightboxPhotoUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handler: Create Note
  const handleSaveNewNote = () => {
    if (!newNoteTitle.trim()) {
      showToast('请输入笔记标题');
      return;
    }
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim() || '暂无详细内容',
      category: newNoteCategory.trim() || '未分类',
      emoji: newNoteEmoji || '📝',
      date: new Date().toISOString().split('T')[0],
      theme: newNoteTheme,
    };
    setNotes([newNote, ...notes]);
    setShowCreateNoteModal(false);
    setNewNoteTitle('');
    setNewNoteContent('');
    showToast('已新建笔记 🎉');
  };

  // Handler: Delete Note
  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    showToast('已删除笔记');
  };

  // Handler: Create Album ("自己建立命名相册")
  const handleSaveNewAlbum = () => {
    if (!newAlbumName.trim()) {
      showToast('请输入相册名称');
      return;
    }
    const defaultCover = newAlbumCoverUrl.trim() || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600';
    const newAlbum: PhotoAlbum = {
      id: `album-${Date.now()}`,
      name: newAlbumName.trim(),
      coverUrl: defaultCover,
      photoCount: 1,
      createdDate: new Date().toISOString().split('T')[0],
      description: newAlbumDescription.trim() || '自定义建立的专属相册',
      photos: [
        {
          id: `p-${Date.now()}`,
          url: defaultCover,
          title: '相册封面照片',
          uploadedAt: '刚刚',
        },
      ],
    };
    setAlbums([newAlbum, ...albums]);
    setShowCreateAlbumModal(false);
    setNewAlbumName('');
    setNewAlbumDescription('');
    setNewAlbumCoverUrl('');
    showToast(`已创建专属命名相册「${newAlbum.name}」🎉`);
  };

  // Handler: Rename Album
  const handleSaveRenameAlbum = () => {
    if (!renameAlbumTarget || !renamedAlbumName.trim()) return;
    const updatedName = renamedAlbumName.trim();
    setAlbums((prev) =>
      prev.map((a) => (a.id === renameAlbumTarget.id ? { ...a, name: updatedName } : a))
    );
    if (selectedAlbum && selectedAlbum.id === renameAlbumTarget.id) {
      setSelectedAlbum({ ...selectedAlbum, name: updatedName });
    }
    setShowRenameAlbumModal(false);
    setRenameAlbumTarget(null);
    setRenamedAlbumName('');
    showToast(`相册名称已重命名为「${updatedName}」`);
  };

  // Handler: Delete Album
  const handleDeleteAlbum = (id: string) => {
    setAlbums(albums.filter((a) => a.id !== id));
    if (selectedAlbum?.id === id) {
      setSelectedAlbum(null);
    }
    showToast('已删除相册');
  };

  // Handler: Add Photo to Selected Album
  const handleAddPhotoToAlbum = () => {
    if (!selectedAlbum) return;
    const photoUrl = newPhotoUrl.trim() || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800';
    const photoTitle = newPhotoTitle.trim() || '新增精彩相片';
    const newPhoto = {
      id: `photo-${Date.now()}`,
      url: photoUrl,
      title: photoTitle,
      uploadedAt: '刚刚',
    };
    const updatedPhotos = [newPhoto, ...selectedAlbum.photos];
    const updatedAlbum: PhotoAlbum = {
      ...selectedAlbum,
      photoCount: updatedPhotos.length,
      coverUrl: photoUrl,
      photos: updatedPhotos,
    };

    setSelectedAlbum(updatedAlbum);
    setAlbums((prev) => prev.map((a) => (a.id === updatedAlbum.id ? updatedAlbum : a)));
    setShowAddPhotoModal(false);
    setNewPhotoTitle('');
    setNewPhotoUrl('');
    showToast('已向相册中添加照片 📷');
  };

  // Handler: Create Document ("自己建立命名文档名称")
  const handleSaveNewDoc = () => {
    let name = newDocName.trim();
    if (!name) {
      showToast('请输入文档名称');
      return;
    }
    // Append extension if missing
    if (!name.includes('.')) {
      name = `${name}.${newDocType}`;
    }

    const tagList = newDocTags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name,
      type: newDocType,
      size: '1.2 MB',
      lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16),
      author: '我 (Alexia)',
      content: newDocContent.trim() || '暂无文档正文',
      tags: tagList.length > 0 ? tagList : ['自定义文档'],
    };

    setDocuments([newDoc, ...documents]);
    setShowCreateDocModal(false);
    setNewDocName('');
    setNewDocContent('');
    showToast(`已成功创建命名文档「${name}」📄`);
  };

  // Handler: Rename Document
  const handleSaveRenameDoc = () => {
    if (!renameDocTarget || !renamedDocName.trim()) return;
    let updatedName = renamedDocName.trim();
    if (!updatedName.includes('.')) {
      updatedName = `${updatedName}.${renameDocTarget.type}`;
    }
    setDocuments((prev) =>
      prev.map((d) => (d.id === renameDocTarget.id ? { ...d, name: updatedName } : d))
    );
    if (selectedDoc && selectedDoc.id === renameDocTarget.id) {
      setSelectedDoc({ ...selectedDoc, name: updatedName });
    }
    setShowRenameDocModal(false);
    setRenameDocTarget(null);
    setRenamedDocName('');
    showToast(`文档名称已修改为「${updatedName}」`);
  };

  // Handler: Delete Document
  const handleDeleteDoc = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
    showToast('已删除文档');
  };

  // Filtered Items
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAlbums = albums.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredDocs = documents.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[92vh] sm:h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 font-sans">
        
        {/* ================================================================= */}
        {/* 1. TOP HEADER (Title + Module Tabs + Back/Close) */}
        {/* ================================================================= */}
        <div className="px-4 py-3 bg-white border-b border-gray-200/80 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-[#050505] tracking-tight flex items-center space-x-1.5">
                <span>文本中心</span>
                <span className="px-2 py-0.5 bg-blue-50 text-[#1877F2] text-[10px] font-extrabold rounded-full border border-blue-100">
                  资源枢纽
                </span>
              </h2>
              <p className="text-[11px] text-[#65676B]">笔记 · 相册 · 文档 自定义管理与归档</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 flex items-center justify-center text-gray-600 transition-all cursor-pointer"
            title="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3 MAJOR MODULE TABS (笔记 · 相册 · 文档) */}
        <div className="px-3 py-2 bg-[#F0F2F5]/80 border-b border-gray-200/70 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1.5 flex-1 max-w-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('notes');
                setSelectedAlbum(null);
                setSelectedDoc(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'notes'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText size={14} />
              <span>笔记 ({notes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('albums');
                setSelectedDoc(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'albums'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ImageIcon size={14} />
              <span>相册 ({albums.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('documents');
                setSelectedAlbum(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'documents'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FilePlus size={14} />
              <span>文档 ({documents.length})</span>
            </button>
          </div>

          {/* Action Trigger Button corresponding to Active Tab */}
          {activeTab === 'notes' && (
            <button
              type="button"
              onClick={() => setShowCreateNoteModal(true)}
              className="h-8 px-3 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1 transition-all active:scale-95 shadow-xs cursor-pointer shrink-0 ml-2"
            >
              <Plus size={15} />
              <span>新建笔记</span>
            </button>
          )}

          {activeTab === 'albums' && (
            <button
              type="button"
              onClick={() => setShowCreateAlbumModal(true)}
              className="h-8 px-3 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1 transition-all active:scale-95 shadow-xs cursor-pointer shrink-0 ml-2"
              title="建立命名相册"
            >
              <FolderPlus size={15} />
              <span>新建命名相册</span>
            </button>
          )}

          {activeTab === 'documents' && (
            <button
              type="button"
              onClick={() => setShowCreateDocModal(true)}
              className="h-8 px-3 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1 transition-all active:scale-95 shadow-xs cursor-pointer shrink-0 ml-2"
              title="建立命名文档"
            >
              <FilePlus size={15} />
              <span>新建命名文档</span>
            </button>
          )}
        </div>

        {/* Search Bar inside Text Center */}
        <div className="px-4 py-2 bg-white border-b border-gray-100 shrink-0">
          <div className="bg-[#F0F2F5] rounded-full px-3.5 py-1.5 flex items-center space-x-2">
            <Search size={14} className="text-gray-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'notes'
                  ? '搜索笔记标题、灵感内容或标签...'
                  : activeTab === 'albums'
                  ? '搜索自建命名相册...'
                  : '搜索自建命名文档及文件正文...'
              }
              className="bg-transparent text-xs text-[#050505] placeholder-gray-500 outline-none flex-1 min-w-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-gray-500 hover:text-gray-800 bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. TAB MODULE CONTENT AREA */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4 custom-scrollbar">
          
          {/* --------------------------------------------------------------- */}
          {/* MODULE 1: 笔记 (Notes Module) */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'notes' && (
            <div>
              {filteredNotes.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <FileText size={42} className="text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-500">暂无匹配的笔记</p>
                  <p className="text-[11px] text-gray-400 mt-1">点击右上角“新建笔记”记录您的随时灵感</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-base select-none">{note.emoji}</span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#1877F2] border border-blue-100">
                              {note.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">{note.date}</span>
                        </div>

                        <h3 className="text-xs font-black text-[#050505] mb-1 group-hover:text-[#1877F2] transition-colors">
                          {note.title}
                        </h3>

                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 font-normal">
                          {note.content}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                          <Sparkles size={11} className="text-amber-500" />
                          <span>便签视图已同步</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer p-1 rounded-full hover:bg-rose-50"
                          title="删除笔记"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* MODULE 2: 相册 (Albums Module - 支持用户自己建立命名相册) */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'albums' && (
            <div>
              {!selectedAlbum ? (
                /* Albums Overview List / Grid */
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black text-[#050505] flex items-center space-x-1">
                      <Folder size={14} className="text-[#1877F2]" />
                      <span>自建命名相册中心</span>
                    </h3>
                    <span className="text-[11px] text-[#65676B]">共 {albums.length} 个自定义相册</span>
                  </div>

                  {filteredAlbums.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <ImageIcon size={42} className="text-gray-300 mb-2" />
                      <p className="text-xs font-bold text-gray-500">暂无自定义相册</p>
                      <button
                        type="button"
                        onClick={() => setShowCreateAlbumModal(true)}
                        className="mt-3 px-4 py-1.5 rounded-full bg-[#1877F2] text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-blue-600"
                      >
                        新建专属命名相册
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredAlbums.map((album) => (
                        <div
                          key={album.id}
                          onClick={() => setSelectedAlbum(album)}
                          className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                        >
                          <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                            <img
                              src={album.coverUrl}
                              alt={album.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {album.photoCount} 张
                            </div>
                          </div>

                          <div className="p-2.5">
                            <h4 className="text-xs font-bold text-[#050505] group-hover:text-[#1877F2] transition-colors truncate">
                              {album.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                              创建于 {album.createdDate}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Album Detail Inspection View (Photos inside album) */
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setSelectedAlbum(null)}
                      className="flex items-center space-x-1.5 text-xs font-bold text-[#1877F2] hover:underline cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      <span>返回相册列表</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRenameAlbumTarget(selectedAlbum);
                          setRenamedAlbumName(selectedAlbum.name);
                          setShowRenameAlbumModal(true);
                        }}
                        className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#050505] flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit3 size={12} />
                        <span>重命名</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAddPhotoModal(true)}
                        className="px-3 py-1 rounded-full bg-[#1877F2] text-white text-xs font-bold flex items-center space-x-1 cursor-pointer hover:bg-blue-600 shadow-xs"
                      >
                        <Plus size={13} />
                        <span>添加照片</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAlbum(selectedAlbum.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full cursor-pointer"
                        title="删除相册"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Selected Album Title Info */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
                    <h3 className="text-sm font-black text-[#050505] flex items-center space-x-2">
                      <span className="text-[#1877F2]">📁</span>
                      <span>相册名称：{selectedAlbum.name}</span>
                    </h3>
                    {selectedAlbum.description && (
                      <p className="text-xs text-gray-500 mt-1">{selectedAlbum.description}</p>
                    )}
                  </div>

                  {/* Photo Grid inside Album */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {selectedAlbum.photos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setLightboxPhotoUrl(photo.url)}
                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer group shadow-2xs"
                      >
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white">
                          <span className="text-xs font-bold truncate">{photo.title}</span>
                          <span className="text-[9px] text-gray-300 font-mono">{photo.uploadedAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* MODULE 3: 文档 (Documents Module - 支持用户自己建立命名文档) */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'documents' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-[#050505] flex items-center space-x-1">
                  <FilePlus size={14} className="text-[#1877F2]" />
                  <span>自建命名文档中心</span>
                </h3>
                <span className="text-[11px] text-[#65676B]">共 {documents.length} 份文件</span>
              </div>

              {filteredDocs.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <FileText size={42} className="text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-500">暂无自定义文档</p>
                  <button
                    type="button"
                    onClick={() => setShowCreateDocModal(true)}
                    className="mt-3 px-4 py-1.5 rounded-full bg-[#1877F2] text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-blue-600"
                  >
                    新建专属命名文档
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-2xs hover:border-[#1877F2]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-2xs ${
                            doc.type === 'pdf'
                              ? 'bg-rose-500'
                              : doc.type === 'docx'
                              ? 'bg-blue-600'
                              : doc.type === 'xlsx'
                              ? 'bg-emerald-600'
                              : 'bg-indigo-600'
                          }`}
                        >
                          {doc.type.toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-[#050505] group-hover:text-[#1877F2] transition-colors truncate">
                            {doc.name}
                          </h4>

                          <div className="flex items-center space-x-3 text-[10px] text-gray-500 mt-1">
                            <span>大小: {doc.size}</span>
                            <span>·</span>
                            <span>修改时间: {doc.lastModified}</span>
                            <span>·</span>
                            <span>创建人: {doc.author}</span>
                          </div>

                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {doc.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1877F2] hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <Eye size={12} />
                          <span>查看正文</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRenameDocTarget(doc);
                            setRenamedDocName(doc.name);
                            setShowRenameDocModal(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-[#1877F2] hover:bg-gray-100 rounded-full cursor-pointer"
                          title="重命名文档名称"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full cursor-pointer"
                          title="删除文档"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ================================================================= */}
        {/* MODALS: Create Note, Create Album, Create Doc, Rename Modals      */}
        {/* ================================================================= */}

        {/* Modal 1: Create Note */}
        {showCreateNoteModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
              <h3 className="text-sm font-black text-[#050505] mb-3 flex items-center space-x-2">
                <FileText size={18} className="text-[#1877F2]" />
                <span>新建个人笔记 / 灵感</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">笔记标题</label>
                  <input
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="例如：Stellar UI 设计规范..."
                    className="w-full bg-[#F0F2F5] px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">分类标签</label>
                  <input
                    type="text"
                    value={newNoteCategory}
                    onChange={(e) => setNewNoteCategory(e.target.value)}
                    placeholder="例如：产品灵感 / 活动策划 / 会议纪要"
                    className="w-full bg-[#F0F2F5] px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">笔记正文</label>
                  <textarea
                    rows={4}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="输入笔记正文细节..."
                    className="w-full bg-[#F0F2F5] p-3 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2] resize-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateNoteModal(false)}
                  className="px-4 py-2 rounded-full bg-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewNote}
                  className="px-5 py-2 rounded-full bg-[#1877F2] text-white text-xs font-bold shadow-xs hover:bg-blue-600 cursor-pointer"
                >
                  保存笔记
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Create Custom Named Album ("自己建立命名相册") */}
        {showCreateAlbumModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
              <h3 className="text-sm font-black text-[#050505] mb-1 flex items-center space-x-2">
                <FolderPlus size={18} className="text-[#1877F2]" />
                <span>新建专属命名相册</span>
              </h3>
              <p className="text-[11px] text-gray-500 mb-3">为您的专属生活影集或项目图库命名并创建分类</p>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">相册名称 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    placeholder="例如：2026兰州黄河旅行影集..."
                    className="w-full bg-[#F0F2F5] px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">相册描述（可选）</label>
                  <input
                    type="text"
                    value={newAlbumDescription}
                    onChange={(e) => setNewAlbumDescription(e.target.value)}
                    placeholder="例如：记录黄河夜景与好友聚会照片..."
                    className="w-full bg-[#F0F2F5] px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">封面图片链接（可选）</label>
                  <input
                    type="text"
                    value={newAlbumCoverUrl}
                    onChange={(e) => setNewAlbumCoverUrl(e.target.value)}
                    placeholder="粘贴 Image URL 或留空使用默认极光封面"
                    className="w-full bg-[#F0F2F5] px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2]"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAlbumModal(false)}
                  className="px-4 py-2 rounded-full bg-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewAlbum}
                  className="px-5 py-2 rounded-full bg-[#1877F2] text-white text-xs font-bold shadow-xs hover:bg-blue-600 cursor-pointer"
                >
                  建立相册
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Rename Album */}
        {showRenameAlbumModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
              <h3 className="text-sm font-black text-[#050505] mb-2">重命名相册名称</h3>
              <input
                type="text"
                value={renamedAlbumName}
                onChange={(e) => setRenamedAlbumName(e.target.value)}
                className="w-full bg-[#F0F2F5] px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2]"
              />
              <div className="mt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRenameAlbumModal(false)}
                  className="px-4 py-1.5 rounded-full bg-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveRenameAlbum}
                  className="px-5 py-1.5 rounded-full bg-[#1877F2] text-white text-xs font-bold hover:bg-blue-600 cursor-pointer"
                >
                  确认修改
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 4: Add Photo to Selected Album */}
        {showAddPhotoModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
              <h3 className="text-sm font-black text-[#050505] mb-3 flex items-center space-x-2">
                <ImageIcon size={18} className="text-[#1877F2]" />
                <span>向「{selectedAlbum?.name}」添加照片</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">照片描述 / 标题</label>
                  <input
                    type="text"
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    placeholder="例如：黄河露营小聚合照..."
                    className="w-full bg-[#F0F2F5] px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">照片 URL 链接</label>
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="粘贴 Unsplash / 图片链接..."
                    className="w-full bg-[#F0F2F5] px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2]"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddPhotoModal(false)}
                  className="px-4 py-2 rounded-full bg-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleAddPhotoToAlbum}
                  className="px-5 py-2 rounded-full bg-[#1877F2] text-white text-xs font-bold shadow-xs hover:bg-blue-600 cursor-pointer"
                >
                  添加至相册
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 5: Create Custom Named Document ("自己建立命名文档名称") */}
        {showCreateDocModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
              <h3 className="text-sm font-black text-[#050505] mb-1 flex items-center space-x-2">
                <FilePlus size={18} className="text-[#1877F2]" />
                <span>新建专属命名文档</span>
              </h3>
              <p className="text-[11px] text-gray-500 mb-3">支持自定义文档名称、格式后缀与详细归档正文</p>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">文档名称 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="例如：2026第三季度产品路线图.docx..."
                    className="w-full bg-[#F0F2F5] px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">文档格式类型</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as any)}
                      className="w-full bg-[#F0F2F5] px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2]"
                    >
                      <option value="docx">Word (.docx)</option>
                      <option value="pdf">PDF (.pdf)</option>
                      <option value="xlsx">Excel (.xlsx)</option>
                      <option value="txt">文本 (.txt)</option>
                      <option value="md">Markdown (.md)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">标签分类</label>
                    <input
                      type="text"
                      value={newDocTags}
                      onChange={(e) => setNewDocTags(e.target.value)}
                      placeholder="逗号分隔，如: 需求, 架构"
                      className="w-full bg-[#F0F2F5] px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">文档正文与记录内容</label>
                  <textarea
                    rows={4}
                    value={newDocContent}
                    onChange={(e) => setNewDocContent(e.target.value)}
                    placeholder="输入文档的详细内容、条款或方案概述..."
                    className="w-full bg-[#F0F2F5] p-3 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2] resize-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDocModal(false)}
                  className="px-4 py-2 rounded-full bg-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewDoc}
                  className="px-5 py-2 rounded-full bg-[#1877F2] text-white text-xs font-bold shadow-xs hover:bg-blue-600 cursor-pointer"
                >
                  建立文档
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 6: Rename Document */}
        {showRenameDocModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
              <h3 className="text-sm font-black text-[#050505] mb-2">修改文档名称</h3>
              <input
                type="text"
                value={renamedDocName}
                onChange={(e) => setRenamedDocName(e.target.value)}
                className="w-full bg-[#F0F2F5] px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#1877F2]"
              />
              <div className="mt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRenameDocModal(false)}
                  className="px-4 py-1.5 rounded-full bg-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveRenameDoc}
                  className="px-5 py-1.5 rounded-full bg-[#1877F2] text-white text-xs font-bold hover:bg-blue-600 cursor-pointer"
                >
                  确认修改
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 7: View Document Content Modal */}
        {selectedDoc && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0 ${
                      selectedDoc.type === 'pdf'
                        ? 'bg-rose-500'
                        : selectedDoc.type === 'docx'
                        ? 'bg-blue-600'
                        : selectedDoc.type === 'xlsx'
                        ? 'bg-emerald-600'
                        : 'bg-indigo-600'
                    }`}
                  >
                    {selectedDoc.type.toUpperCase()}
                  </div>
                  <h3 className="text-xs font-black text-[#050505] truncate">{selectedDoc.name}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 text-xs leading-relaxed text-gray-800 font-mono whitespace-pre-wrap custom-scrollbar bg-gray-50 p-3 rounded-xl border border-gray-200 my-3">
                {selectedDoc.content}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] shrink-0">
                <span className="text-gray-500">作者: {selectedDoc.author} · {selectedDoc.size}</span>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`已开始导出文档「${selectedDoc.name}」`);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#1877F2] text-white text-xs font-bold flex items-center space-x-1 hover:bg-blue-600 shadow-xs cursor-pointer"
                >
                  <Download size={13} />
                  <span>导出文件</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 8: Lightbox Photo Viewer */}
        {lightboxPhotoUrl && (
          <div
            onClick={() => setLightboxPhotoUrl(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
          >
            <img
              src={lightboxPhotoUrl}
              alt="Photo Large View"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}

      </div>
    </div>
  );
};
