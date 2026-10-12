// ============================================================================
// Stellar Document Center (文档中心) Data Models & Mock Store
// Supports Dual-Source (Group-Sync Auto & User Manual), AI Smart Classification,
// Quick-Save interaction, Favorites, Notes, Albums, and Documents.
// ============================================================================

export type AICategoryType =
  | 'invoices'
  | 'contracts'
  | 'certificates'
  | 'meetings'
  | 'travel'
  | 'inspiration'
  | 'projects'
  | 'screenshots';

export interface DocumentAsset {
  id: string;
  title: string;
  type: 'photo' | 'document' | 'voice' | 'link' | 'note';
  url?: string;
  size?: string;
  source: {
    type: 'group' | 'direct' | 'manual';
    name: string;
    avatar?: string;
    conversationId?: string;
  };
  date: string;
  timestamp: number;
  aiCategory: AICategoryType;
  aiTags: string[];
  targetAlbumId?: string;
  targetFolderId?: string;
  isFavorite?: boolean;
  thumbnail?: string;
  author?: string;
  duration?: number;
  fileExtension?: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'zip' | 'jpg' | 'png' | 'txt' | 'md';
  description?: string;
  previewData?: {
    pdfPages?: number;
    sheetRows?: { id: number; col1: string; col2: string; col3: string; col4: string; status?: string }[];
    docContent?: string;
    ocrText?: string;
    invoiceAmount?: string;
    invoiceNo?: string;
    invoiceDate?: string;
    contractParty?: string;
    contractStatus?: string;
    certificateIssuer?: string;
    validUntil?: string;
    exif?: {
      camera: string;
      lens: string;
      iso: string;
      shutter: string;
      aperture: string;
      resolution: string;
      location: string;
    };
  };
}

export interface PhotoAlbum {
  id: string;
  name: string;
  coverUrl: string;
  isGroupSync: boolean;
  groupSourceId?: string;
  groupAvatar?: string;
  photoCount: number;
  newItemsCount?: number; // Newly added files count (badge in top-right)
  createdDate: string;
  description?: string;
  tags?: string[];
  photos: DocumentAsset[];
}

export interface DocumentFolder {
  id: string;
  name: string;
  coverUrl?: string;
  isGroupSync: boolean;
  groupSourceId?: string;
  groupAvatar?: string;
  fileCount: number;
  newItemsCount?: number; // Newly added files count (badge in top-right)
  color?: string;
  createdDate: string;
  description?: string;
  tags?: string[];
  files: DocumentAsset[];
}

export interface NoteScheduleData {
  eventDate: string;
  timeRange: string;
  locationName: string;
  reminder: string;
  agenda: { time: string; title: string; status?: 'done' | 'pending' }[];
  participants: { name: string; avatar: string; role?: string }[];
  calendarSynced?: boolean;
}

export interface NoteLocationData {
  name: string;
  address: string;
  lat: number;
  lng: number;
  mapImageUrl?: string;
  distance?: string;
  transportSuggestion?: string;
  checkInCount?: number;
  openHours?: string;
  tags?: string[];
}

export interface NoteImageData {
  images: { url: string; title?: string; size?: string; exif?: string; caption?: string }[];
  gridStyle?: 'masonry' | 'grid' | 'carousel';
  totalPhotosCount?: number;
  resolutionInfo?: string;
}

export interface NoteTextData {
  paragraphs: string[];
  quotes?: string[];
  readingTimeMinutes?: number;
  wordCount?: number;
  markdownHighlights?: string[];
  author?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  emoji: string;
  date: string;
  theme: 'pink' | 'blue' | 'yellow' | 'purple' | 'green';
  isPinned?: boolean;
  tags: string[];
  updatedAt?: string;
  // Dynamic Thematic Content Types: schedule, location, image, text
  contentType?: 'schedule' | 'location' | 'image' | 'text';
  scheduleData?: NoteScheduleData;
  locationData?: NoteLocationData;
  imageData?: NoteImageData;
  textData?: NoteTextData;
}

export interface FavoriteItem {
  id: string;
  type: 'chat_snippet' | 'photo' | 'document' | 'voice' | 'link';
  title: string;
  content: string;
  sourceName: string;
  sourceAvatar: string;
  date: string;
  tags: string[];
  mediaUrl?: string;
  fileSize?: string;
}

// AI Classification Category Metadata
export interface AICategoryMeta {
  id: AICategoryType;
  title: string;
  subtitle: string;
  iconName: string;
  badgeLabel: string;
  color: string;
  bgGradient: string;
  badgeCount: number;
  coverImage: string;
  tags: string[];
  targetType: 'folder' | 'album';
  suggestedTargetName: string;
}

export const AI_CATEGORIES: AICategoryMeta[] = [
  {
    id: 'invoices',
    title: '发票与报销',
    subtitle: '电子发票 · 餐饮报销 · 出行收据 · 票据凭证',
    iconName: 'Receipt',
    badgeLabel: '票据凭证',
    color: '#059669',
    bgGradient: 'from-emerald-500 to-teal-600',
    badgeCount: 7,
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
    tags: ['增值税发票', '差旅打车', '团队餐饮', '财务报销'],
    targetType: 'folder',
    suggestedTargetName: '🧾 财务发票与报销凭证归档',
  },
  {
    id: 'contracts',
    title: '合同与协议',
    subtitle: 'PDF 签署协议 · 保密 NDA · 合作备忘 · 劳务合同',
    iconName: 'FileCheck2',
    badgeLabel: '法律文件',
    color: '#D97706',
    bgGradient: 'from-amber-500 to-orange-600',
    badgeCount: 5,
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=400',
    tags: ['项目合同', '签字生效', 'NDA保密', '法律备忘'],
    targetType: 'folder',
    suggestedTargetName: '📜 法律合同与签署协议归档',
  },
  {
    id: 'certificates',
    title: '证件与资质',
    subtitle: '身份证复印件 · 营业执照 · 驾驶证 · 资质证书',
    iconName: 'CreditCard',
    badgeLabel: '身份资质',
    color: '#3B82F6',
    bgGradient: 'from-blue-600 to-indigo-600',
    badgeCount: 4,
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400',
    tags: ['身份证件', '营业执照', '实名认证', '驾驶许可'],
    targetType: 'folder',
    suggestedTargetName: '🪪 个人与企业证件资质档案',
  },
  {
    id: 'meetings',
    title: '会议纪要',
    subtitle: '周会纪要 · 架构评审 · 待办决议 · 访谈记录',
    iconName: 'ClipboardList',
    badgeLabel: '议程纪要',
    color: '#8B5CF6',
    bgGradient: 'from-purple-600 to-violet-700',
    badgeCount: 6,
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400',
    tags: ['技术周会', '架构评审', '决议待办', '会议录音'],
    targetType: 'folder',
    suggestedTargetName: '📝 会议纪要与决策行动项',
  },
  {
    id: 'travel',
    title: '旅行与聚会',
    subtitle: '黄河夜游 · 漫游打卡 · 好友聚会 · 露营生活',
    iconName: 'Camera',
    badgeLabel: '生活回忆',
    color: '#E11D48',
    bgGradient: 'from-rose-500 to-pink-600',
    badgeCount: 16,
    coverImage: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=400',
    tags: ['黄河夜游', '聚会合照', '车队打卡', '生活写意'],
    targetType: 'album',
    suggestedTargetName: '📸 同城漫游与旅行足迹精选',
  },
  {
    id: 'inspiration',
    title: '设计与灵感',
    subtitle: 'Facebook 纯白规范 · 视觉色彩 · 摄影构图',
    iconName: 'Sparkles',
    badgeLabel: '视觉灵感',
    color: '#0284C7',
    bgGradient: 'from-cyan-500 to-blue-600',
    badgeCount: 9,
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400',
    tags: ['UI设计稿', '视觉配色', '摄影海报', '灵感看板'],
    targetType: 'album',
    suggestedTargetName: '🎨 视觉设计与产品灵感图库',
  },
  {
    id: 'projects',
    title: '工程与代码',
    subtitle: '技术白皮书 · 架构图 · 源码压缩包 · API规范',
    iconName: 'Code2',
    badgeLabel: '技术白皮书',
    color: '#6366F1',
    bgGradient: 'from-indigo-500 to-slate-700',
    badgeCount: 8,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400',
    tags: ['React 19架构', '高精度定位', 'API规范', '部署清单'],
    targetType: 'folder',
    suggestedTargetName: '💻 系统架构与工程源码资料',
  },
  {
    id: 'screenshots',
    title: '截图速查',
    subtitle: '界面快照 · 聊天截屏 · 交易记录 · 配置参数',
    iconName: 'Smartphone',
    badgeLabel: '截屏快照',
    color: '#1877F2',
    bgGradient: 'from-blue-500 to-indigo-600',
    badgeCount: 11,
    coverImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=400',
    tags: ['UI截图', '支付快照', '配置参数', '高频查阅'],
    targetType: 'album',
    suggestedTargetName: '📱 常用截图与屏幕快照相册',
  },
];

// Initial Manual User-Created Albums
export const INITIAL_USER_ALBUMS: PhotoAlbum[] = [
  {
    id: 'user-album-1',
    name: '📸 兰州黄河风情街拍精选',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400',
    isGroupSync: false,
    photoCount: 12,
    newItemsCount: 3,
    createdDate: '2026-08-15',
    description: '个人在黄河风情线、中山桥、白塔山拍摄的胶片与高清风景照片。',
    tags: ['个人收藏', '黄河街拍', '风景摄影'],
    photos: [
      {
        id: 'photo-u1',
        title: '中山桥晚霞与黄河波光.jpg',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
        size: '4.2 MB',
        source: { type: 'manual', name: '个人相册' },
        date: '2026-08-15 19:40',
        timestamp: Date.now() - 3 * 86400000,
        aiCategory: 'travel',
        aiTags: ['中山桥', '晚霞', '黄河', '风景摄影'],
        targetAlbumId: 'user-album-1',
        fileExtension: 'jpg',
        description: '傍晚中山桥在黄河浪涛映衬下的金黄色晚霞余晖',
        previewData: {
          ocrText: '中山铁桥 · 兰州市第一名胜\n拍摄时间: 2026-08-15 19:40:12\n经纬度: 36.0664° N, 103.8166° E',
          exif: {
            camera: 'Sony Alpha 7R V',
            lens: 'FE 24-70mm F2.8 GM II',
            iso: '100',
            shutter: '1/250s',
            aperture: 'f/4.0',
            resolution: '9504 × 6336 (61 MP)',
            location: '甘肃省兰州市城关区中山桥北侧观景台',
          },
        },
      },
      {
        id: 'photo-u2',
        title: '白塔山俯瞰全城晨曦.jpg',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
        size: '3.8 MB',
        source: { type: 'manual', name: '个人相册' },
        date: '2026-08-14 06:30',
        timestamp: Date.now() - 4 * 86400000,
        aiCategory: 'travel',
        aiTags: ['全景', '晨曦', '白塔山'],
        targetAlbumId: 'user-album-1',
        fileExtension: 'jpg',
        previewData: {
          ocrText: '白塔山晨曦日出全景 俯瞰黄河穿城而过',
          exif: {
            camera: 'Fujifilm X-T5',
            lens: 'XF 16-80mm F4 R OIS WR',
            iso: '160',
            shutter: '1/500s',
            aperture: 'f/5.6',
            resolution: '7728 × 5152 (40 MP)',
            location: '兰州白塔山公园主峰',
          },
        },
      },
      {
        id: 'photo-u3',
        title: '金城关仿古建筑红墙夜景.jpg',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200',
        size: '5.1 MB',
        source: { type: 'manual', name: '个人相册' },
        date: '2026-08-12 21:15',
        timestamp: Date.now() - 6 * 86400000,
        aiCategory: 'inspiration',
        aiTags: ['古建筑', '夜景', '金城关'],
        targetAlbumId: 'user-album-1',
        fileExtension: 'jpg',
        previewData: {
          ocrText: '金城关仿古文化博览园\n仿明清秦砖汉瓦彩画古韵',
          exif: {
            camera: 'iPhone 17 Pro Max',
            lens: '24mm 1x Main Camera',
            iso: '400',
            shutter: '1/30s (Night Mode 2s)',
            aperture: 'f/1.78',
            resolution: '8064 × 6048 (48 MP ProRAW)',
            location: '金城关文化博览园南门',
          },
        },
      },
    ],
  },
  {
    id: 'user-album-2',
    name: '☕ 周末咖啡与探店日志',
    coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400',
    isGroupSync: false,
    photoCount: 8,
    newItemsCount: 2,
    createdDate: '2026-08-10',
    description: '兰州特色手冲咖啡馆与文创甜品店随手拍。',
    tags: ['咖啡探店', '手冲特调', '慢生活'],
    photos: [
      {
        id: 'photo-u4',
        title: '浅烘焙耶加雪菲手冲特写.jpg',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200',
        size: '3.3 MB',
        source: { type: 'manual', name: '个人相册' },
        date: '2026-08-10 15:30',
        timestamp: Date.now() - 8 * 86400000,
        aiCategory: 'inspiration',
        aiTags: ['手冲咖啡', '耶加雪菲', '拉花'],
        targetAlbumId: 'user-album-2',
        fileExtension: 'jpg',
        previewData: {
          ocrText: 'SPECIALTY COFFEE LAB\nETHIOPIA YIRGACHEFFE G1\nFloral · Citrus · Bergamot',
          exif: {
            camera: 'Leica Q3',
            lens: 'Summilux 28mm f/1.7 ASPH',
            iso: '200',
            shutter: '1/160s',
            aperture: 'f/2.0',
            resolution: '9520 × 6336 (60 MP)',
            location: '城关区雁滩高新咖啡街区',
          },
        },
      },
    ],
  },
];

// Initial Manual User-Created Document Folders
export const INITIAL_USER_FOLDERS: DocumentFolder[] = [
  {
    id: 'user-folder-1',
    name: '💼 个人工作与合同归档',
    coverUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=400',
    isGroupSync: false,
    fileCount: 6,
    newItemsCount: 4,
    color: '#1877F2',
    createdDate: '2026-08-01',
    description: '存储保密协议、技术劳务合同及个人履历文档。',
    tags: ['个人重要', '工作档案', '合同签署'],
    files: [
      {
        id: 'doc-u1',
        title: 'Stellar_定位系统架构设计白皮书_v3.2.pdf',
        type: 'document',
        size: '4.8 MB',
        source: { type: 'manual', name: '个人归档' },
        date: '2026-08-17',
        timestamp: Date.now() - 1 * 86400000,
        aiCategory: 'projects',
        aiTags: ['系统架构', '高精定位', '白皮书'],
        targetFolderId: 'user-folder-1',
        author: 'Alex Mercer',
        fileExtension: 'pdf',
        previewData: {
          pdfPages: 16,
          docContent: `# Stellar 实时空间智能与地理围栏架构白皮书\n\n## 1. 架构总览\nStellar 采用分布式 WebSocket 边云协同架构，结合移动端传感器融合算法（IMU + GNSS + 室内蓝牙基站），实现亚米级低功耗连续定位。\n\n## 2. 核心技术指标\n- **位置同步延迟**：< 45ms（端到端）\n- **定位精度**：室外 0.8 米 / 室内 1.5 米\n- **设备功耗**：每小时电池消耗 < 1.2%\n- **离线轨迹缓存**：本地 SQLite 加密持久化存储，支持断网重连自愈。\n\n## 3. 隐私与隐身模式机制\n当用户触发【隐身模式 (Stealth Mode)】时，服务端立即停止广播实时经纬度，并将状态无缝回退为模糊城市级标识。`,
        },
      },
      {
        id: 'doc-u2',
        title: '2026年度技术研发保密协议_NDA_已签署.pdf',
        type: 'document',
        size: '1.2 MB',
        source: { type: 'manual', name: '个人归档' },
        date: '2026-08-14',
        timestamp: Date.now() - 4 * 86400000,
        aiCategory: 'contracts',
        aiTags: ['保密协议', '法务签署', 'NDA'],
        targetFolderId: 'user-folder-1',
        author: '法务合规部',
        fileExtension: 'pdf',
        previewData: {
          pdfPages: 6,
          contractParty: 'Stellar Technology Ltd. & Alex Mercer',
          contractStatus: '双方已电子签署 · 存证有效',
          validUntil: '2029-08-14',
          docContent: `# 商业技术保密与知识产权归属协议 (NDA)\n\n**甲方**：Stellar Technology Ltd. (以下简称“甲方”)\n**乙方**：Alex Mercer (以下简称“乙方”)\n\n### 第一条 保密信息范围\n本协议所称“保密信息”指乙方在履行职务或合作过程中知悉的全部商业秘密、源码架构、算法模型、用户地理数据拓扑及未公开的专利技术。\n\n### 第二条 双方权利与义务\n1. 乙方承诺对上述保密信息承担严格保密义务，未经甲方书面许可不得向任何第三方披露或自用。\n2. 电子签名经过区块链时间戳存证，具有完全同等法律效力。\n\n【甲方签署盖章】：Stellar Tech Legal Seal (已核验)\n【乙方签署确认】：Alex Mercer (已实名签署)`,
        },
      },
      {
        id: 'doc-u3',
        title: '8月份出差兰州财务报销电子发票汇总.xlsx',
        type: 'document',
        size: '860 KB',
        source: { type: 'manual', name: '个人归档' },
        date: '2026-08-16',
        timestamp: Date.now() - 2 * 86400000,
        aiCategory: 'invoices',
        aiTags: ['财务报销', '电子发票', '差旅汇总'],
        targetFolderId: 'user-folder-1',
        author: '财务审核组',
        fileExtension: 'xlsx',
        previewData: {
          invoiceAmount: '¥ 3,485.50',
          invoiceNo: 'FP-20260816-8921',
          invoiceDate: '2026-08-16',
          sheetRows: [
            { id: 1, col1: '2026-08-12', col2: '兰州中川机场往返高铁客票', col3: '¥ 120.00', col4: '交通费', status: '已核销' },
            { id: 2, col1: '2026-08-13', col2: '皇冠假日酒店住宿（3晚）', col3: '¥ 1,860.00', col4: '住宿费', status: '已核销' },
            { id: 3, col1: '2026-08-14', col2: '金城关极客开发者交流晚宴', col3: '¥ 980.50', col4: '餐饮招待', status: '已核销' },
            { id: 4, col1: '2026-08-15', col2: '同城漫游会打车与物料采购', col3: '¥ 525.00', col4: '公杂费', status: '待终审' },
          ],
        },
      },
      {
        id: 'doc-u6',
        title: '高级系统架构师专业技术资格认证证书.pdf',
        type: 'document',
        size: '2.1 MB',
        source: { type: 'manual', name: '个人归档' },
        date: '2026-08-08',
        timestamp: Date.now() - 10 * 86400000,
        aiCategory: 'certificates',
        aiTags: ['资质证书', '架构师', '资格认证'],
        targetFolderId: 'user-folder-1',
        author: '工信部信息化鉴定中心',
        fileExtension: 'pdf',
        previewData: {
          pdfPages: 2,
          certificateIssuer: '全国计算机技术与软件专业技术资格（水平）考试办公室',
          validUntil: '永久有效',
          docContent: `# 中华人民共和国专业技术人员职业资格证书\n\n**持证人**：Alex Mercer\n**资格名称**：系统分析师 / 系统架构设计师 (高级)\n**证书编号**：ZJ-2026-08-998812\n**签发机关**：人力资源和社会保障部 · 工业和信息化部\n\n本证书表明持有人通过国家统一考试，具备高级系统架构设计与复杂分布式软件工程管理能力。`,
        },
      },
    ],
  },
  {
    id: 'user-folder-2',
    name: '📑 技术方案与设计文档',
    coverUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400',
    isGroupSync: false,
    fileCount: 9,
    newItemsCount: 3,
    color: '#7C3AED',
    createdDate: '2026-08-05',
    description: 'React 19, Facebook Design System, 实时音视频规范。',
    tags: ['技术方案', '设计指南', '前端架构'],
    files: [
      {
        id: 'doc-u4',
        title: 'Facebook_Design_System_视觉规范指南_2026.pdf',
        type: 'document',
        size: '12.5 MB',
        source: { type: 'manual', name: '个人归档' },
        date: '2026-08-11',
        timestamp: Date.now() - 7 * 86400000,
        aiCategory: 'inspiration',
        aiTags: ['UI规范', 'Facebook设计', '纯白质感'],
        targetFolderId: 'user-folder-2',
        author: 'Meta UI Team',
        fileExtension: 'pdf',
        previewData: {
          pdfPages: 24,
          docContent: `# Facebook Design System 2026 规范指南\n\n## 1. 纯白无边距设计美学 (Flat White Canvas)\n- 移除厚重卡片与深色投影，以纯净背景搭配 1px 细微柔和分割线 (#F0F2F5)。\n- 交互组件采用触觉波纹扩散反馈 (Ripple feedback)。\n\n## 2. 空间节奏与圆角数学比例\n- 内外圆角严格遵循公式：\`InnerRadius = OuterRadius - Padding\`\n- 核心主操作使用标准品牌蓝 (#1877F2)。`,
        },
      },
      {
        id: 'doc-u5',
        title: 'Stellar_WebSocket实时双向通信协议规范.docx',
        type: 'document',
        size: '2.4 MB',
        source: { type: 'manual', name: '个人归档' },
        date: '2026-08-09',
        timestamp: Date.now() - 9 * 86400000,
        aiCategory: 'projects',
        aiTags: ['WebSocket', '通信协议', '实时数据'],
        targetFolderId: 'user-folder-2',
        author: '研发架构组',
        fileExtension: 'docx',
        previewData: {
          docContent: `# Stellar 实时 WebSocket 协议规范 v2.4\n\n### 消息帧结构\n\`\`\`json\n{\n  "version": "2.4",\n  "type": "LOCATION_PING",\n  "senderId": "usr_9981",\n  "payload": {\n    "lat": 36.0611,\n    "lng": 103.8343,\n    "altitude": 1520.4,\n    "speed": 1.2,\n    "bearing": 88.5\n  },\n  "timestamp": 1787038100\n}\n\`\`\`\n\n支持心跳保活机制（Ping 30s / Timeout 90s）及自适应退避重连。`,
        },
      },
    ],
  },
  {
    id: 'user-folder-3',
    name: '🛠️ 系统设计与 AI Studio 建设日志',
    coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400',
    isGroupSync: false,
    fileCount: 2,
    newItemsCount: 2,
    color: '#1877F2',
    createdDate: '2026-08-20',
    description: 'Google AI Studio 系统全景功能及历次重构、编译纠错日志备份。',
    tags: ['系统规格', '构建日志', 'AI重构手册'],
    files: [
      {
        id: 'doc-u7',
        title: 'Stellar_OS_全景系统设计与构建规格书.pdf',
        type: 'document',
        size: '1.8 MB',
        source: { type: 'manual', name: '系统生成' },
        date: '2026-08-20',
        timestamp: Date.now(),
        aiCategory: 'projects',
        aiTags: ['系统规格', '功能全景', 'PDF'],
        targetFolderId: 'user-folder-3',
        author: 'Google AI Studio',
        fileExtension: 'pdf',
        previewData: {
          pdfPages: 8,
          docContent: `# Stellar OS 全景系统设计与构建规格书\n\n## 1. 业务系统规格\n- **地图微空间聚类**：甘肃省市两级高精自适应定位聚合，支持自定义雷达地标标签渲染。\n- **即时加密通讯系统**：支持阅后即焚、富媒体传输、全屏级 Emoji 飞散炸弹动效。\n- **监护人生命线系统**：Geofences 连续电子围栏与危机对讲，危机搜救底图协同。\n- **文档与媒体中心**：AI Smart Organizer 智能发票、NDA 合同归档过滤及 GoodNotes 草稿笔记本。`
        }
      },
      {
        id: 'doc-u8',
        title: 'AI_Studio_编译纠错与系统优化历史.docx',
        type: 'document',
        size: '640 KB',
        source: { type: 'manual', name: '系统生成' },
        date: '2026-08-20',
        timestamp: Date.now(),
        aiCategory: 'projects',
        aiTags: ['纠错日志', 'React19', '构建历史'],
        targetFolderId: 'user-folder-3',
        author: 'Google AI Studio',
        fileExtension: 'docx',
        previewData: {
          docContent: `# Google AI Studio 编译纠错与系统优化历史\n\n### 历史 1：处理 Map 命名空间冲突\n- **起因**：引入谷歌地图后 new Map 与 React-Google-Maps 组件产生命名遮蔽。\n- **重构**：全局显式指定 globalThis.Map 分类实例。\n\n### 历史 2：对齐 EXIF 图像与日程 TS 元数据签名\n- **起因**：部分图片缺失 EXIF 或笔记 Agenda 字段，读取产生空指针异常。\n- **重构**：提供空安全 fallback 渲染防护。\n\n### 历史 3：解决 React 19 Expected Static Flag 核心编译崩溃\n- **起因**：在 FamilyCareMonitorPage 与 GoodNotesNoteModal 头部的条件式提前返回导致 Hook 执行顺序违规。\n- **重构**：将 early-return 剥离至钩子声明底端，维持钩子生命周期完全一致。`
        }
      }
    ]
  },
];

// Initial Notes with Multi-Thematic Content: Schedule, Location, Image, Text
export const INITIAL_DOCUMENT_NOTES: NoteItem[] = [
  {
    id: 'note-schedule-1',
    title: '黄河外滩骑行与夜游摄影日程安排',
    content: '黄河风情线周末团队骑行与夜景摄影采风活动日程安排表，包含集合、分段补给与无人机航拍时间节点。',
    category: '日程安排',
    emoji: '📅',
    date: '2026-08-18',
    theme: 'blue',
    isPinned: true,
    tags: ['日程', '骑行活动', '时间线', '活动日历'],
    updatedAt: '今天 09:15',
    contentType: 'schedule',
    scheduleData: {
      eventDate: '2026年8月22日 (周六)',
      timeRange: '15:30 - 21:30',
      locationName: '甘肃省兰州市城关区中山铁桥北广场',
      reminder: '活动前 30 分钟系统推送提醒',
      calendarSynced: true,
      agenda: [
        { time: '15:30 - 16:00', title: '中山铁桥北侧观景台集合、设备调试与安全简报', status: 'done' },
        { time: '16:00 - 17:30', title: '黄河风情线骑行绿道第一段 (中山桥 -> 金城关仿古博览园)', status: 'done' },
        { time: '17:30 - 18:30', title: '白塔山公园半山腰露营咖啡手冲补给与全景观光', status: 'pending' },
        { time: '19:00 - 20:30', title: '黄河夕阳晚霞与落日无人机 4K 原图航拍采风', status: 'pending' },
        { time: '20:30 - 21:30', title: '金城关夜市地道美食聚餐与摄影原片互传归档', status: 'pending' },
      ],
      participants: [
        { name: 'RicardoZhan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', role: '领队 / 发起人' },
        { name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', role: '摄影师' },
        { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', role: '后勤补给' },
        { name: 'Lucas Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150', role: '安全员' },
      ],
    },
  },
  {
    id: 'note-location-1',
    title: '兰州金城关仿古文化博览园精准定位与打卡指南',
    content: '金城关仿古文化博览园地处白塔山南麓，依山临河，气势雄伟。本条定位笔记详细记录了最佳拍摄机位、经纬度与交通指引。',
    category: '地点定位',
    emoji: '📍',
    date: '2026-08-17',
    theme: 'purple',
    isPinned: true,
    tags: ['地理定位', '经纬度', '打卡点', '交通导航'],
    updatedAt: '昨天 17:40',
    contentType: 'location',
    locationData: {
      name: '兰州金城关仿古文化博览园',
      address: '甘肃省兰州市城关区北滨河中路金城关公园内 (白塔山公园西侧)',
      lat: 36.0668,
      lng: 103.8162,
      mapImageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800',
      distance: '距当前位置 1.8 km',
      transportSuggestion: '推荐公共交通：公交 20路/131路至白塔山公园站下车步行 200 米；自驾可停放于北滨河中路地下停车场。',
      checkInCount: 1420,
      openHours: '全天开放 (内部博物馆 09:00 - 17:00)',
      tags: ['历史古迹', '夜景机位', '黄河地标', '仿明清建筑'],
    },
  },
  {
    id: 'note-image-1',
    title: '黄河风情线落日晚霞与胶片街拍图集',
    content: '收录 2026 年 8 月中旬在黄河两岸拍摄的 4K 超清晚霞倒影、铁桥流光与胶片色调街拍原片，支持查看完整 EXIF 参数。',
    category: '影像图集',
    emoji: '🖼️',
    date: '2026-08-16',
    theme: 'pink',
    isPinned: false,
    tags: ['摄影图集', '高清画廊', 'EXIF参数', '原图展示'],
    updatedAt: '2天前',
    contentType: 'image',
    imageData: {
      totalPhotosCount: 6,
      resolutionInfo: 'Sony A7R5 / 6100万像素 ProRAW 原片',
      gridStyle: 'grid',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
          title: '中山铁桥金黄余晖.jpg',
          size: '4.8 MB',
          exif: '24mm · f/4.0 · 1/250s · ISO 100',
          caption: '傍晚中山桥在黄河浪涛映衬下的金黄色晚霞余晖',
        },
        {
          url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000',
          title: '白塔山晨曦全景.jpg',
          size: '5.2 MB',
          exif: '35mm · f/5.6 · 1/500s · ISO 160',
          caption: '白塔山晨曦日出全景，俯瞰黄河穿城而过',
        },
        {
          url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1000',
          title: '金城关仿古红墙夜景.jpg',
          size: '6.1 MB',
          exif: '50mm · f/1.8 · 1/60s · ISO 400',
          caption: '仿明清秦砖汉瓦古建筑在灯光映照下的静谧质感',
        },
        {
          url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1000',
          title: '黄河畔手冲咖啡随手拍.jpg',
          size: '3.6 MB',
          exif: '85mm · f/2.0 · 1/320s · ISO 200',
          caption: '滨河步道咖啡馆窗外的落叶与悠闲午后',
        },
      ],
    },
  },
  {
    id: 'note-text-1',
    title: 'Stellar 极简交互与 Facebook 风格架构设计规范',
    content: '深入探讨 Facebook 纯净平铺设计语言在移动端现代社交系统中的落地实践，以及如何去除 AI Slop 建立优雅的设计秩序。',
    category: '设计规范',
    emoji: '📝',
    date: '2026-08-15',
    theme: 'green',
    isPinned: false,
    tags: ['文字内容', '设计规范', 'Facebook风格', '架构思想'],
    updatedAt: '3天前',
    contentType: 'text',
    textData: {
      author: 'RicardoZhan · UI/UX 架构师',
      readingTimeMinutes: 4,
      wordCount: 1280,
      paragraphs: [
        '### 1. 纯白无边距设计美学 (Flat White Canvas)',
        '彻底移除厚重深色渐变与多层嵌套卡片，以清爽纯白底色 (#FFFFFF) 搭配 1px 细微极浅灰色微边框 (#F0F2F5)。每一个视觉元素都要有明确的信息承载目的，杜绝任何无意义的装饰性阴影。',
        '### 2. 空间节奏与圆角数学比例',
        '圆角嵌套严格遵循数学定理：Inside Corner Radius = Outside Corner Radius - Distance Between the Two (Padding)。当外部卡片圆角为 24px、内边距为 8px 时，内部按钮圆角精确计算为 16px，实现视觉光学平衡。',
        '### 3. 数据呈现与响应规范',
        '所有列表支持手势快速惯性滑动与平滑淡入动效。核心操作保持单手黄金触控区内（最低 44px 触控热区）。按钮文字保证单行排版，拒绝换行与不雅截断。',
        '### 4. 个人资产置顶与管理效率',
        '个人自主创建的相册与文档目录在所有视图中享有最高渲染权重，强制置顶于群聊自动同步内容之前，让用户在 1 秒内找到自己的重要私有资产。',
      ],
      quotes: [
        '“真正的设计工匠精神，在于用纯粹的排版、间距与色彩节奏传递秩序，而不是依靠堆砌特效。”',
      ],
      markdownHighlights: [
        '严格遵守 WCAG AA 对比度标准（正文 4.5:1 以上）',
        '水平操作栏与圆形图标规范统一',
        '动态响应式微动画反馈（Active scale-95%）',
      ],
    },
  },
];

// Initial Favorites
export const INITIAL_FAVORITES: FavoriteItem[] = [
  {
    id: 'fav-1',
    type: 'chat_snippet',
    title: 'Alex 关于高精度地图定位的研发方案讨论',
    content: '前端采用 WebWorker 异步计算大地坐标投影，结合移动端传感器姿态角做航向平滑，彻底解决室内外切换抖动问题。',
    sourceName: '小组 · 极客开发营',
    sourceAvatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=300',
    date: '2026-08-18 10:20',
    tags: ['研发灵感', '极客群聊', '重要讨论'],
  },
  {
    id: 'fav-2',
    type: 'photo',
    title: '金城关黄河外滩全景日落原图',
    content: '拍摄于黄河风情线金城关外滩，原画级 4K 霞光漫射。',
    sourceName: '金城关同城漫游会',
    sourceAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    date: '2026-08-17 19:45',
    tags: ['摄影精选', '黄河日落'],
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'fav-3',
    type: 'document',
    title: 'Stellar_定位系统架构设计白皮书_v3.2.pdf',
    content: '包含完整的微服务拓扑图、地理围栏触发策略与离线缓存机制。',
    sourceName: 'Alex Mercer',
    sourceAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    date: '2026-08-15 14:10',
    tags: ['技术白皮书', '核心资料'],
    fileSize: '4.8 MB',
  },
  {
    id: 'fav-4',
    type: 'link',
    title: 'Facebook Design System — Foundations & Guidelines',
    content: 'https://design.facebook.com/guidelines/typography-and-spacing',
    sourceName: 'Sarah Chen',
    sourceAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    date: '2026-08-12 11:30',
    tags: ['设计规范', '官方链接'],
  },
];

// Activity Timeline Models & Mock Data
export interface ActivityTimelineItem {
  id: string;
  userName: string;
  userAvatar: string;
  actionText: string;
  timeAgo: string;
  timestamp: number;
  type: 'upload' | 'move' | 'star' | 'ai_archive' | 'share' | 'ocr';
  targetName?: string;
  details?: string;
}

export const INITIAL_TIMELINE_ACTIVITIES: ActivityTimelineItem[] = [
  {
    id: 'act-1',
    userName: 'Richard Wagner',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    actionText: '上传了 2 张现场原图至【群相册 · 极客开发营】',
    timeAgo: '刚刚 (A few seconds ago)',
    timestamp: Date.now() - 15000,
    type: 'upload',
    targetName: '群相册 · 极客开发营',
  },
  {
    id: 'act-2',
    userName: '我 (Alexia)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    actionText: '移动了 3 份增值税发票至【财务报销与票据】文件夹',
    timeAgo: '12 分钟前',
    timestamp: Date.now() - 12 * 60 * 1000,
    type: 'move',
    targetName: '财务报销与票据',
  },
  {
    id: 'act-3',
    userName: 'Anna Schulz',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    actionText: '收藏了技术方案《高精度定位架构白皮书》',
    timeAgo: '39 分钟前',
    timestamp: Date.now() - 39 * 60 * 1000,
    type: 'star',
    targetName: '高精度定位架构白皮书',
  },
  {
    id: 'act-4',
    userName: 'AI 智能引擎',
    userAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
    actionText: '自动解析并归档了【金城关漫游会】中的 4 份出行凭证',
    timeAgo: '1 小时前',
    timestamp: Date.now() - 60 * 60 * 1000,
    type: 'ai_archive',
    targetName: '旅行与出行打卡',
  },
  {
    id: 'act-5',
    userName: 'Brian Schulz',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    actionText: '分享了合同《年度商业云服务协议_盖章版.pdf》',
    timeAgo: '2 小时前',
    timestamp: Date.now() - 120 * 60 * 1000,
    type: 'share',
    targetName: '年度商业云服务协议',
  },
];

// Automation Action Flow Models & Mock Data (Translate Reference Screen 3)
export interface ActionFlowCard {
  id: string;
  type: 'notification' | 'ocr' | 'sync' | 'tag' | 'move' | 'voice' | 'filter';
  title: string;
  detail: string;
  iconName: string;
  badgeColor?: string;
}

export interface ActionFlowItem {
  id: string;
  title: string;
  emoji: string;
  description: string;
  isEnabled: boolean;
  color: string;
  triggerWhen: {
    title: string;
    source: string;
    senderName?: string;
    senderAvatar?: string;
    filePattern?: string;
    iconName: string;
  };
  conditionAnd: {
    title: string;
    conditionText: string;
    targetDestinationName: string;
    targetDestinationType: 'folder' | 'album';
    iconName: string;
    extraCards?: ActionFlowCard[];
  };
  actionsThen: ActionFlowCard[];
}

export const INITIAL_ACTION_FLOWS: ActionFlowItem[] = [
  {
    id: 'flow-auto-invoice',
    title: '发票自动归档 Flow',
    emoji: '🧾',
    description: '群聊收到 PDF 发票或报销单据时，自动提取金额并移至财务文件夹',
    isEnabled: true,
    color: '#1877F2',
    triggerWhen: {
      title: 'When 收到新文件',
      source: '群聊或私聊中接收到新文档或附件',
      senderName: 'Brian Schulz 或任意群成员',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      filePattern: '包含"发票"、"收据"或格式为 PDF/OFD',
      iconName: 'Send',
    },
    conditionAnd: {
      title: 'And 满足分类条件',
      conditionText: 'AI 语义识别为【发票与报销】，文件大小 < 20MB',
      targetDestinationName: '财务报销与票据 (文件夹)',
      targetDestinationType: 'folder',
      iconName: 'Calendar',
      extraCards: [
        {
          id: 'cond-2',
          type: 'filter',
          title: '文件标签判定',
          detail: '自动附带 #发票 #已核验 #群聊同步 标签',
          iconName: 'Tag',
        },
      ],
    },
    actionsThen: [
      {
        id: 'act-then-1',
        type: 'notification',
        title: '发送即时系统推送',
        detail: '发送通知：“已自动归档 发票至【财务报销与票据】”',
        iconName: 'Bell',
        badgeColor: '#1877F2',
      },
      {
        id: 'act-then-2',
        type: 'ocr',
        title: '执行 OCR 结构化提取',
        detail: '提取发票代码、发票号码、含税金额及开票日期',
        iconName: 'ScanLine',
        badgeColor: '#F7B928',
      },
      {
        id: 'act-then-3',
        type: 'move',
        title: '移动并同步到云盘',
        detail: '无损存储到 Personal Cloud Vault 并在群聊打标“已归档”',
        iconName: 'FolderCheck',
        badgeColor: '#42B72A',
      },
    ],
  },
  {
    id: 'flow-group-photos',
    title: '群相册原图同步 Flow',
    emoji: '📸',
    description: '群聊发送的高清原图自动汇聚到对应的群专属相册',
    isEnabled: true,
    color: '#42B72A',
    triggerWhen: {
      title: 'When 收到群图片',
      source: '群聊【极客开发营】或【金城关漫游会】发送图片',
      senderName: '群成员现场分享',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      filePattern: 'JPG / PNG / WEBP 原图或实况照片',
      iconName: 'Image',
    },
    conditionAnd: {
      title: 'And 目标相册选择',
      conditionText: '自动匹配对应群组专属相册，免去手动建册',
      targetDestinationName: '极客开发营 现场相册 (相册)',
      targetDestinationType: 'album',
      iconName: 'Layers',
    },
    actionsThen: [
      {
        id: 'act-then-p1',
        type: 'tag',
        title: '提取 EXIF 摄影参数',
        detail: '读取快门、光圈、ISO、镜头与 GPS 拍摄地点信息',
        iconName: 'Camera',
        badgeColor: '#9333EA',
      },
      {
        id: 'act-then-p2',
        type: 'sync',
        title: '生成高清缩略图与原图备份',
        detail: '极速生成 4K 预览流，并存入个人媒体库',
        iconName: 'CloudUpload',
        badgeColor: '#1877F2',
      },
    ],
  },
  {
    id: 'flow-contract-seal',
    title: '商务合同签署归档 Flow',
    emoji: '📑',
    description: '自动标记合同甲乙方、签署有效期限并建立保密档案',
    isEnabled: false,
    color: '#9333EA',
    triggerWhen: {
      title: 'When 收到电子合同',
      source: '商务沟通私聊或项目工作群',
      senderName: 'Anna Schulz 或项目负责人',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      filePattern: '包含"合同"、"协议"或"NDA"的 PDF 文档',
      iconName: 'FileText',
    },
    conditionAnd: {
      title: 'And 安全保密归类',
      conditionText: '进入高安全密级【商务合同与法务】文件夹',
      targetDestinationName: '商务合同与法务 (文件夹)',
      targetDestinationType: 'folder',
      iconName: 'ShieldCheck',
    },
    actionsThen: [
      {
        id: 'act-then-c1',
        type: 'tag',
        title: 'AI 提取签署方与履约节点',
        detail: '识别合同生效日、截止日、甲乙方公章状态',
        iconName: 'FileCheck',
        badgeColor: '#9333EA',
      },
      {
        id: 'act-then-c2',
        type: 'notification',
        title: '设置到期提醒日程',
        detail: '在到期前 30 天向我发送日程提醒通知',
        iconName: 'CalendarCheck',
        badgeColor: '#FA383E',
      },
    ],
  },
];

/**
 * Heuristic AI classification algorithm to classify raw chat files into smart categories
 */
export function heuristicClassifyAsset(asset: {
  title: string;
  fileExtension?: string;
  type?: string;
  url?: string;
}): {
  category: AICategoryType;
  confidence: number;
  reason: string;
  targetName: string;
  targetType: 'folder' | 'album';
} {
  const t = (asset.title || '').toLowerCase();
  const ext = (asset.fileExtension || '').toLowerCase();

  if (
    t.includes('发票') ||
    t.includes('报销') ||
    t.includes('收据') ||
    t.includes('账单') ||
    t.includes('invoice') ||
    t.includes('receipt') ||
    t.includes('票据') ||
    t.includes('专票') ||
    t.includes('普票')
  ) {
    return {
      category: 'invoices',
      confidence: 0.98,
      reason: '匹配发票、报销与增值税专票关键字',
      targetName: '🧾 财务发票与报销凭证归档',
      targetType: 'folder',
    };
  }

  if (
    t.includes('合同') ||
    t.includes('协议') ||
    t.includes('nda') ||
    t.includes('协议书') ||
    t.includes('意向书') ||
    t.includes('签约') ||
    t.includes('contract') ||
    t.includes('agreement')
  ) {
    return {
      category: 'contracts',
      confidence: 0.96,
      reason: '识别法律合同与商务签署协议',
      targetName: '📜 法律合同与签署协议归档',
      targetType: 'folder',
    };
  }

  if (
    t.includes('身份证') ||
    t.includes('证件') ||
    t.includes('营业执照') ||
    t.includes('执照') ||
    t.includes('驾驶证') ||
    t.includes('护照') ||
    t.includes('资质') ||
    t.includes('证书') ||
    t.includes('passport') ||
    t.includes('id_card')
  ) {
    return {
      category: 'certificates',
      confidence: 0.97,
      reason: '检测身份证明与企业资质证明',
      targetName: '🪪 个人与企业证件资质档案',
      targetType: 'folder',
    };
  }

  if (
    t.includes('纪要') ||
    t.includes('会议') ||
    t.includes('周会') ||
    t.includes('决议') ||
    t.includes('访谈') ||
    t.includes('meeting') ||
    t.includes('minutes')
  ) {
    return {
      category: 'meetings',
      confidence: 0.93,
      reason: '提炼会议讨论记录与行动清单',
      targetName: '📝 会议纪要与决策行动项',
      targetType: 'folder',
    };
  }

  if (
    t.includes('代码') ||
    t.includes('源码') ||
    t.includes('架构') ||
    t.includes('白皮书') ||
    t.includes('api') ||
    t.includes('sdk') ||
    ext === 'zip' ||
    ext === 'ts' ||
    ext === 'tsx' ||
    ext === 'json'
  ) {
    return {
      category: 'projects',
      confidence: 0.95,
      reason: '系统工程架构与源码资料包',
      targetName: '💻 系统架构与工程源码资料',
      targetType: 'folder',
    };
  }

  if (
    t.includes('截图') ||
    t.includes('截屏') ||
    t.includes('screenshot') ||
    t.includes('快照')
  ) {
    return {
      category: 'screenshots',
      confidence: 0.96,
      reason: '检测到屏幕快照与操作截屏',
      targetName: '📱 常用截图与屏幕快照相册',
      targetType: 'album',
    };
  }

  if (
    t.includes('设计') ||
    t.includes('灵感') ||
    t.includes('配色') ||
    t.includes('海报') ||
    t.includes('ui') ||
    t.includes('figma') ||
    t.includes('design')
  ) {
    return {
      category: 'inspiration',
      confidence: 0.92,
      reason: '视觉设计灵感与排版构图素材',
      targetName: '🎨 视觉设计与产品灵感图库',
      targetType: 'album',
    };
  }

  if (asset.type === 'photo' || ext === 'jpg' || ext === 'png' || ext === 'webp') {
    return {
      category: 'travel',
      confidence: 0.89,
      reason: '高清摄影图与同城生活足迹',
      targetName: '📸 同城漫游与旅行足迹精选',
      targetType: 'album',
    };
  }

  return {
    category: 'meetings',
    confidence: 0.85,
    reason: '通用文档智能归纳',
    targetName: '📁 默认归档文件夹',
    targetType: 'folder',
  };
}

