import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  MoreHorizontal,
  Plus,
  Sparkles,
  FileText,
  FileUp,
  Globe,
  Youtube,
  FileCode,
  CheckSquare,
  Clock,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Send,
  AtSign,
  MessageSquare,
  Share2,
  Download,
  Tag,
  Check,
  BrainCircuit,
  Layout,
  Sliders,
  ChevronRight,
  ChevronDown,
  Sparkle,
  Calendar,
  X,
  ListTodo,
  ExternalLink,
  StickyNote,
  ThumbsUp,
  GitBranch,
  Compass,
  Users,
  History,
  Activity,
  Palette,
  MousePointer,
  Hand,
  RotateCcw,
} from 'lucide-react';
import { UnifiedShareButton } from './common/UnifiedShareButton';
import { soundEffects } from '../utils/soundEffects';

interface StellarWorkspacePageProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string) => void;
}

// Data Types for 源流画布工作台 & 小组思维导图融合
export interface SourceCardItem {
  id: string;
  title: string;
  type: 'pdf' | 'web' | 'video' | 'audio' | 'text';
  summary: string;
  sourceUrl?: string;
  tags: string[];
  time: string;
}

export interface NodeComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export interface CanvasNode {
  id: string;
  type: 'source' | 'map' | 'doc' | 'action' | 'sticky';
  title: string;
  content: string;
  parentId?: string;
  sourceCardId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tags?: string[];
  isCollapsed?: boolean;
  // Mindmap & Sticky specific
  stickyColor?: 'yellow' | 'blue' | 'green' | 'purple';
  author?: string;
  votes?: number;
  status?: 'done' | 'wip' | 'planned';
  comments?: NodeComment[];
  // Action specific
  dueDate?: string;
  assignee?: string;
  isCompleted?: boolean;
  priority?: 'high' | 'medium' | 'low';
  // Doc specific
  markdown?: string;
}

export interface NodeConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

export interface LiveCursor {
  id: string;
  name: string;
  avatar: string;
  color: string;
  x: number;
  y: number;
}

// Initial Preset Sources
const PRESET_SOURCES: SourceCardItem[] = [
  {
    id: 'src-1',
    title: 'Mapify & Buildin 融合分析研报.pdf',
    type: 'pdf',
    summary: '分析了 Mapify 的一键转换能力与 Buildin 的 Workspace 知识库深度的结合点。',
    sourceUrl: 'https://stellar.vance.io/docs/mapify-buildin-paper.pdf',
    tags: ['PDF研报', '内容摄取', 'AI导图'],
    time: '10分钟前',
  },
  {
    id: 'src-2',
    title: 'Stellar 地图社交与无限画布产品规划.web',
    type: 'web',
    summary: '结合 Zenly 地图社交与源流工作台，实现从空间定位到知识协作的无缝落地。',
    sourceUrl: 'https://stellar.vance.io/workspace-spec',
    tags: ['网页剪藏', '产品规划', '无限画布'],
    time: '1小时前',
  },
  {
    id: 'src-3',
    title: '团队架构与算法调度会议纪要.audio',
    type: 'video',
    summary: '提炼自 45 分钟语音讨论：关于空间数据索引与 Canvas 节点实时调度的技术方案。',
    tags: ['语音转录', '架构设计'],
    time: '3小时前',
  },
];

// Initial Canvas Nodes (Integrated with Group Brainstorm Nodes)
const PRESET_NODES: CanvasNode[] = [
  {
    id: 'node-src-1',
    type: 'source',
    title: '源文件: Mapify & Buildin 融合研报',
    content: '核心摘要: 结合 Mapify 快速理解与 Buildin 结构化沉淀，建立源内容->导图->文档->任务链路。',
    sourceCardId: 'src-1',
    x: 60,
    y: 120,
    width: 280,
    height: 140,
    tags: ['源数据卡片'],
  },
  {
    id: 'node-map-1',
    type: 'map',
    title: '小组脑图核心：源流画布操作系统',
    content: '打破“死导图”与“死文档”割裂状态，构建四维对象流与无限空间交互。',
    parentId: 'node-src-1',
    x: 400,
    y: 100,
    width: 270,
    height: 130,
    tags: ['思维导图', '根节点'],
    votes: 8,
    status: 'done',
    comments: [
      { id: 'c1', author: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', text: '已审核核心框架，符合直角 UI 规范。', time: '10:15' }
    ]
  },
  {
    id: 'node-map-1-1',
    type: 'map',
    title: '1. 内容摄取器 (Source Ingestion)',
    content: '支持 PDF/网页/音视频一键提取摘要，自动解析结构并生成思维导图树。',
    parentId: 'node-map-1',
    x: 720,
    y: 40,
    width: 260,
    height: 120,
    tags: ['摄取引擎'],
    votes: 4,
    status: 'done',
  },
  {
    id: 'node-map-1-2',
    type: 'map',
    title: '2. 结构化文档 (Doc Blocks)',
    content: '导图节点一键转为富文本文档大纲，段落改动可实时双向回写脑图。',
    parentId: 'node-map-1',
    x: 720,
    y: 190,
    width: 260,
    height: 120,
    tags: ['文档转化'],
    votes: 6,
    status: 'wip',
  },
  {
    id: 'node-doc-1',
    type: 'doc',
    title: '文档：源流画布功能规格书 (PRD)',
    content: '## 1. 产品概述\n源流画布工作台是一个把 Buildin 的深度与 Mapify 的转图结合的空间操作系统...',
    markdown: `## 1. 产品概述
源流画布工作台是一个把 Buildin 的工作区深度与 Mapify 的内容转导图能力结合的空间操作系统。

### 核心特性
- **内容摄取**: 拖入 PDF / 网页 / 视频 / 音频自动生成导图
- **无限画布**: 拖拽平移、缩放与四类核心对象联动
- **双向同步**: 导图分支变文档，文档段落回写脑图
- **任务推进**: 节点挂载截止提醒与团队 @mention`,
    parentId: 'node-map-1-2',
    x: 1040,
    y: 180,
    width: 300,
    height: 170,
    tags: ['PRD文档', '可编辑'],
  },
  {
    id: 'node-act-1',
    type: 'action',
    title: '任务：完成源流画布算法与 UI 对接',
    content: '配合地图社交主线，将源流工作台入口集成至侧滑栏，并完成四类节点连线。',
    parentId: 'node-doc-1',
    x: 1040,
    y: 380,
    width: 280,
    height: 140,
    tags: ['开发任务'],
    dueDate: '2026-08-25',
    assignee: 'Alex Mercer',
    isCompleted: false,
    priority: 'high',
  },
  {
    id: 'node-sticky-1',
    type: 'sticky',
    title: '小组贴便签',
    content: '📌 @Sarah Chen: 主干分支已锁定并开启 Straight-Edge 细线框引擎回归测试，请全员核查！',
    x: 400,
    y: 270,
    width: 220,
    height: 110,
    stickyColor: 'yellow',
    author: 'Sarah Chen',
  },
  {
    id: 'node-sticky-2',
    type: 'sticky',
    title: '小组贴便签',
    content: '💡 @Hui Zhang: 已评估重构周期，预计需要 3 天即可完成全部 straight-edge straight lines 替换。',
    x: 720,
    y: 340,
    width: 220,
    height: 110,
    stickyColor: 'blue',
    author: 'Hui Zhang',
  },
];

const PRESET_CONNECTIONS: NodeConnection[] = [
  { id: 'c-1', fromId: 'node-src-1', toId: 'node-map-1', label: 'AI 解析生成' },
  { id: 'c-2', fromId: 'node-map-1', toId: 'node-map-1-1', label: '解构模块 A' },
  { id: 'c-3', fromId: 'node-map-1', toId: 'node-map-1-2', label: '解构模块 B' },
  { id: 'c-4', fromId: 'node-map-1-2', toId: 'node-doc-1', label: '转为文档' },
  { id: 'c-5', fromId: 'node-doc-1', toId: 'node-act-1', label: '衍生任务' },
];

export const StellarWorkspacePage: React.FC<StellarWorkspacePageProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'canvas' | 'sources' | 'tasks'>('canvas');
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [activeMindMapView, setActiveMindMapView] = useState<'canvas' | 'note' | 'outline'>('canvas');
  const [canvasGridStyle, setCanvasGridStyle] = useState<'dots' | 'grid' | 'clean'>('dots');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // Ingestion Sources State
  const [sources, setSources] = useState<SourceCardItem[]>(PRESET_SOURCES);
  const [newInputText, setNewInputText] = useState('');
  const [inputType, setInputType] = useState<'pdf' | 'web' | 'text'>('web');
  const [isIngesting, setIsIngesting] = useState(false);

  // Infinite Canvas State
  const [nodes, setNodes] = useState<CanvasNode[]>(PRESET_NODES);
  const [connections, setConnections] = useState<NodeConnection[]>(PRESET_CONNECTIONS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-map-1');
  
  // Sticky Note Creation State
  const [showAddStickyModal, setShowAddStickyModal] = useState(false);
  const [newStickyText, setNewStickyText] = useState('');
  const [newStickyColor, setNewStickyColor] = useState<'yellow' | 'blue' | 'green' | 'purple'>('yellow');

  // Multi-person Co-Creation Workflow State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestAssignee, setRequestAssignee] = useState('m_admin');
  const [requestMessage, setRequestMessage] = useState('请协助排查地图定位算法与线框图样式对齐...');
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted' | 'reviewed'>('none');

  // Simulated Live Collaborators
  const [liveCursors, setLiveCursors] = useState<LiveCursor[]>([
    { id: 'c1', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', color: '#1877F2', x: 420, y: 150 },
    { id: 'c2', name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', color: '#2ECC71', x: 750, y: 80 },
  ]);

  // Version History Tracker
  const [versionHistory] = useState([
    { id: 'v3', ver: 'V4.2', time: '10:30', desc: '融合小组思维导图，支持便签与多人共创指派', updater: 'Sarah Chen' },
    { id: 'v2', ver: 'V4.1', time: '09:45', desc: '新增富文本文档块与任务节点双向挂载', updater: 'Hui Zhang' },
    { id: 'v1', ver: 'V4.0', time: '昨天', desc: '初始化基于 Straight-Edge 线框视觉的源流画布', updater: 'Alex Mercer' },
  ]);

  // Canvas Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Dragging on Canvas
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const nodeDragStartRef = useRef<{ x: number; y: number; nodeX: number; nodeY: number }>({
    x: 0,
    y: 0,
    nodeX: 0,
    nodeY: 0,
  });

  // AI Assistant Inspector State
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [comments, setComments] = useState<
    { id: string; nodeId: string; author: string; text: string; time: string }[]
  >([
    {
      id: 'cm-1',
      nodeId: 'node-doc-1',
      author: 'Alexia',
      text: '已将设计文档与源流工作台融合指令同步至该 Block 📝',
      time: '10:30',
    },
  ]);
  const [newCommentInput, setNewCommentInput] = useState('');

  // Selected Template Mode
  const [activeTemplate, setActiveTemplate] = useState<'default' | 'research' | 'prd' | 'task'>('prd');

  if (!isOpen) return null;

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
  };

  // Selected Node Object
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Handle Canvas Drag (Pan)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-node-card')) return;
    setIsDraggingCanvas(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    } else if (draggingNodeId) {
      const dx = (e.clientX - nodeDragStartRef.current.x) / zoom;
      const dy = (e.clientY - nodeDragStartRef.current.y) / zoom;
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === draggingNodeId) {
            return {
              ...node,
              x: Math.max(10, nodeDragStartRef.current.nodeX + dx),
              y: Math.max(10, nodeDragStartRef.current.nodeY + dy),
            };
          }
          return node;
        })
      );
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggingNodeId(null);
  };

  // Node Drag Handle Start
  const handleNodeMouseDown = (e: React.MouseEvent, node: CanvasNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);
    nodeDragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };
  };

  // Feature 1: Add new Source & auto-convert to MindMap
  const handleAddSource = () => {
    if (!newInputText.trim()) return;
    setIsIngesting(true);
    notify('⚡ 源流 AI 摄取引擎正在解析内容...');

    setTimeout(() => {
      const newSourceId = `src-${Date.now()}`;
      const newSourceTitle =
        inputType === 'pdf'
          ? `论文: ${newInputText.slice(0, 20)}.pdf`
          : inputType === 'web'
          ? `网页剪藏: ${newInputText.slice(0, 25)}`
          : `文本笔记: ${newInputText.slice(0, 20)}`;

      const newSrc: SourceCardItem = {
        id: newSourceId,
        title: newSourceTitle,
        type: inputType,
        summary: `AI 提取摘要: 核心围绕“${newInputText.slice(0, 30)}”展开，生成 3 个主题解构。`,
        sourceUrl: inputType === 'web' ? newInputText : undefined,
        tags: ['新导入', 'AI已提炼'],
        time: '刚刚',
      };

      setSources((prev) => [newSrc, ...prev]);

      // Create new Nodes on Canvas automatically
      const sourceNodeId = `node-src-${Date.now()}`;
      const rootMapNodeId = `node-map-${Date.now()}`;

      const spawnX = 80;
      const spawnY = Math.max(...nodes.map((n) => n.y), 100) + 160;

      const newSourceNode: CanvasNode = {
        id: sourceNodeId,
        type: 'source',
        title: `源文件: ${newSourceTitle}`,
        content: newSrc.summary,
        sourceCardId: newSourceId,
        x: spawnX,
        y: spawnY,
        width: 280,
        height: 130,
        tags: ['源内容'],
      };

      const newRootMapNode: CanvasNode = {
        id: rootMapNodeId,
        type: 'map',
        title: `思维大纲：${newSourceTitle.replace(/(源文件:|论文:|网页剪藏:)/, '')}`,
        content: 'AI 智能解构导图：自动拆解为概念定义、核心要点与执行建议。',
        parentId: sourceNodeId,
        x: spawnX + 340,
        y: spawnY,
        width: 270,
        height: 130,
        tags: ['AI导图根'],
      };

      const newConn: NodeConnection = {
        id: `c-${Date.now()}`,
        fromId: sourceNodeId,
        toId: rootMapNodeId,
        label: '一键生成导图',
      };

      setNodes((prev) => [...prev, newSourceNode, newRootMapNode]);
      setConnections((prev) => [...prev, newConn]);
      setSelectedNodeId(rootMapNodeId);

      setNewInputText('');
      setIsIngesting(false);
      notify('✨ 已完成内容提取并自动生成思维导图卡片！');
    }, 800);
  };

  // Feature 2: Expand Node using AI
  const handleAiExpandNode = (targetNode: CanvasNode) => {
    setIsAiThinking(true);
    notify(`✨ AI 智脑正在拓展【${targetNode.title}】的分支节点...`);

    setTimeout(() => {
      const childNodeId = `node-map-${Date.now()}`;
      const newNode: CanvasNode = {
        id: childNodeId,
        type: 'map',
        title: `延伸观点：${targetNode.title.slice(0, 10)} 的深度洞察`,
        content: '基于大语言模型分析，该要点在实际产品落地中需关注空间交互与数据实时性。',
        parentId: targetNode.id,
        x: targetNode.x + 320,
        y: targetNode.y + Math.floor(Math.random() * 80) - 40,
        width: 260,
        height: 120,
        tags: ['AI延伸'],
      };

      const newConn: NodeConnection = {
        id: `c-${Date.now()}`,
        fromId: targetNode.id,
        toId: childNodeId,
        label: 'AI 追问扩展',
      };

      setNodes((prev) => [...prev, newNode]);
      setConnections((prev) => [...prev, newConn]);
      setSelectedNodeId(childNodeId);
      setIsAiThinking(false);
      notify('💡 已成功向外延伸新的导图节点！');
    }, 600);
  };

  // Feature 3: Convert Map Node to Doc Block
  const handleConvertToDoc = (mapNode: CanvasNode) => {
    const docNodeId = `node-doc-${Date.now()}`;
    const newDocNode: CanvasNode = {
      id: docNodeId,
      type: 'doc',
      title: `文档方案：${mapNode.title}`,
      content: mapNode.content,
      markdown: `## ${mapNode.title}\n\n${mapNode.content}\n\n### 详细说明\n1. 本文档节点由导图分支一键转换而来。\n2. 支持在源流工作台中进行富文本写作与编辑。\n3. 段落更新可回写至无限画布。`,
      parentId: mapNode.id,
      x: mapNode.x + 320,
      y: mapNode.y + 20,
      width: 290,
      height: 160,
      tags: ['结构化文档'],
    };

    const newConn: NodeConnection = {
      id: `c-${Date.now()}`,
      fromId: mapNode.id,
      toId: docNodeId,
      label: '生成文档',
    };

    setNodes((prev) => [...prev, newDocNode]);
    setConnections((prev) => [...prev, newConn]);
    setSelectedNodeId(docNodeId);
    notify('📑 已由脑图分支成功生成结构化文档块！');
  };

  // Feature 4: Convert Doc/Map Node to Action Task
  const handleConvertToAction = (sourceNode: CanvasNode) => {
    const actNodeId = `node-act-${Date.now()}`;
    const newActNode: CanvasNode = {
      id: actNodeId,
      type: 'action',
      title: `任务: 跟进【${sourceNode.title.slice(0, 14)}】`,
      content: `请跟进落地: ${sourceNode.content}`,
      parentId: sourceNode.id,
      x: sourceNode.x + 320,
      y: sourceNode.y + 40,
      width: 270,
      height: 140,
      tags: ['衍生任务'],
      dueDate: '2026-08-28',
      assignee: 'Alexia Vance',
      isCompleted: false,
      priority: 'medium',
    };

    const newConn: NodeConnection = {
      id: `c-${Date.now()}`,
      fromId: sourceNode.id,
      toId: actNodeId,
      label: '挂载任务',
    };

    setNodes((prev) => [...prev, newActNode]);
    setConnections((prev) => [...prev, newConn]);
    setSelectedNodeId(actNodeId);
    notify('⏱️ 已成功衍生可调度的动作节点！');
  };

  // Feature 5: Toggle Task Completion
  const handleToggleTaskComplete = (nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId && n.type === 'action');
    if (!targetNode) return;
    const nextCompleted = !targetNode.isCompleted;
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId && n.type === 'action' ? { ...n, isCompleted: nextCompleted } : n))
    );
    notify(nextCompleted ? '🎉 任务已标记为完成！' : 'ℹ️ 任务已重置为未完成');
  };

  // Feature 6: Vote Node Consensus (从小组思维导图融合)
  const handleVoteNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const currentVotes = n.votes || 0;
          return { ...n, votes: currentVotes + 1 };
        }
        return n;
      })
    );
    notify('👍 成功为此脑图决策投下 1 票赞成票！');
  };

  // Feature 7: Add Sticky Note (贴便签)
  const handleAddStickyNode = () => {
    if (!newStickyText.trim()) return;
    const newStickyId = `node-sticky-${Date.now()}`;
    const newStickyNode: CanvasNode = {
      id: newStickyId,
      type: 'sticky',
      title: '小组贴便签',
      content: newStickyText,
      x: -pan.x + 350,
      y: -pan.y + 220,
      width: 220,
      height: 110,
      stickyColor: newStickyColor,
      author: 'Hui Zhang',
      tags: ['小组便签'],
    };

    setNodes((prev) => [...prev, newStickyNode]);
    setSelectedNodeId(newStickyId);
    setNewStickyText('');
    setShowAddStickyModal(false);
    notify('📌 便签贴纸已挂载至无限画布！');
  };

  // Feature 8: Send Co-creation Task Request (发起多人共创指派)
  const handleSendCoCreationRequest = () => {
    if (!requestMessage.trim()) return;
    setRequestStatus('pending');
    setIsRequestModalOpen(false);
    notify('🚀 已成功派发小组思维导图共创诉求！正在连线协同成员...');

    // Simulate collaborator接单
    setTimeout(() => {
      setRequestStatus('accepted');
      notify('🎨 小组成员已接受指派并接入画布！正在协同编辑节点...');
      setTimeout(() => {
        setRequestStatus('reviewed');
        notify('💡 协同成员已完成二次修改，待您评审采纳！');
      }, 4000);
    }, 2500);
  };

  // Delete Node
  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) => prev.filter((c) => c.fromId !== nodeId && c.toId !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    notify('🗑️ 节点及其关联线已从画布移除');
  };

  // Add Comment
  const handleAddComment = () => {
    if (!newCommentInput.trim() || !selectedNodeId) return;
    const newCm = {
      id: `cm-${Date.now()}`,
      nodeId: selectedNodeId,
      author: 'Alexia',
      text: newCommentInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setComments((prev) => [...prev, newCm]);
    setNewCommentInput('');
    notify('💬 评论已成功同步至节点协作流');
  };

  // Auto Layout
  const handleAutoLayout = () => {
    notify('⚡ 已对无限画布节点完成层次结构重拍');
    setPan({ x: 40, y: 40 });
    setZoom(1);
  };

  return (
    <div
      id="stellar-workspace-page"
      ref={workspaceRef}
      style={{ containerType: 'inline-size', containerName: 'stellar-workspace' }}
      className="fixed inset-0 z-50 bg-[#F0F2F5] dark:bg-zinc-950 flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-150"
    >
      <style>{`
        @container stellar-workspace (max-width: 700px) {
          .workspace-document-layout { flex-direction: column; overflow-y: auto; padding: 12px; gap: 12px; }
          .workspace-document-sidebar { width: 100%; overflow: visible; }
          .workspace-document-main { flex: none; width: 100%; padding: 16px; overflow: visible; }
          .workspace-document-main > div:first-child { flex-wrap: wrap; gap: 12px; }
          .workspace-document-main h2, .workspace-document-main h3 { overflow-wrap: anywhere; }
          .workspace-drawer { max-width: calc(100% - 32px); }
        }
      `}</style>
      {/* 1. Header Navigation Bar - Double Tier Facebook Straight-Edge UX System */}
      <header className="bg-white dark:bg-zinc-900 border-b border-[#E4E6EB] dark:border-zinc-700 z-30 shrink-0 shadow-2xs">
        {/* Top Header Row */}
        <div className="pt-[calc(8px+var(--sat,0px))] pb-2 px-3 flex items-center justify-between border-b border-[#F0F2F5]">
          <div className="flex items-center space-x-2.5 min-w-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="返回地图"
              className="w-11 h-11 rounded-full bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 text-[#050505] dark:text-zinc-100 flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-95"
              title="返回地图"
            >
              <ArrowLeft size={18} strokeWidth={2.2} />
            </button>

            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-[#1877F2] text-white flex items-center justify-center shadow-2xs shrink-0">
                <Compass size={16} />
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-sm font-bold text-[#050505] dark:text-zinc-100 tracking-tight truncate">
                    源流无限画布工作台
                  </h1>
                  <span className="px-1 py-0.2 text-[8px] font-bold bg-[#1877F2]/10 text-[#1877F2] rounded-xs border border-[#1877F2]/20 shrink-0">
                    CANVAS
                  </span>
                </div>
                <p className="text-[10px] text-[#65676B] dark:text-zinc-300 font-medium truncate">
                  空间可视化协同 · 脑图/便签/笔记
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <UnifiedShareButton
              onClick={() => notify('原型演示：工作台分享入口，尚未复制链接')}
              showLabel={false}
              size={15}
              variant="icon-only"
              className="w-7 h-7 rounded-md bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#EBF7EE] text-[#31A24C] flex items-center justify-center transition-colors shadow-2xs border border-[#E4E6EB] dark:border-zinc-700"
              title="分享工作台"
            />
          </div>
        </div>

        {/* Bottom Sub-Nav Navigation Bar (Top Function Option Navigation Bar - 上方功能选项导航栏) */}
        <div className="px-3 py-1.5 flex items-center justify-between space-x-2 overflow-x-auto no-scrollbar scroll-smooth">
          {/* Group 1: 核心视角切换 Tab 组 */}
          <div className="flex items-center space-x-1 bg-[#F0F2F5] dark:bg-zinc-950 p-0.5 rounded-md border border-[#E4E6EB] dark:border-zinc-700 shrink-0 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveMindMapView('canvas')}
              className={`min-h-11 px-2.5 py-1 rounded-xs flex items-center space-x-1 cursor-pointer transition-all ${
                activeMindMapView === 'canvas' ? 'bg-[#1877F2] text-white shadow-2xs font-extrabold' : 'text-[#65676B] dark:text-zinc-300 hover:text-[#050505] dark:hover:text-white'
              }`}
            >
              <Compass size={13} />
              <span>无限画布</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMindMapView('note')}
              className={`min-h-11 px-2.5 py-1 rounded-xs flex items-center space-x-1 cursor-pointer transition-all ${
                activeMindMapView === 'note' ? 'bg-[#1877F2] text-white shadow-2xs font-extrabold' : 'text-[#65676B] dark:text-zinc-300 hover:text-[#050505] dark:hover:text-white'
              }`}
            >
              <FileText size={13} />
              <span>笔记模式</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMindMapView('outline')}
              className={`min-h-11 px-2.5 py-1 rounded-xs flex items-center space-x-1 cursor-pointer transition-all ${
                activeMindMapView === 'outline' ? 'bg-[#1877F2] text-white shadow-2xs font-extrabold' : 'text-[#65676B] dark:text-zinc-300 hover:text-[#050505] dark:hover:text-white'
              }`}
            >
              <GitBranch size={13} />
              <span>拓扑大纲</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#E4E6EB] shrink-0 hidden sm:block" />

          {/* Group 2: 功能抽屉与协同面板 */}
          <div className="flex items-center space-x-1.5 shrink-0 text-xs">
            <button
              type="button"
              aria-expanded={leftSidebarOpen}
              onClick={() => {
                if (!leftSidebarOpen && (workspaceRef.current?.clientWidth || 0) <= 700) setRightSidebarOpen(false);
                setLeftSidebarOpen((prev) => !prev);
              }}
              className={`min-h-11 px-2.5 py-1 rounded-md border text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors shrink-0 ${
                leftSidebarOpen
                  ? 'bg-[#1877F2] text-white border-[#1877F2]'
                  : 'bg-white dark:bg-zinc-900 text-[#050505] dark:text-zinc-100 border-[#E4E6EB] dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
              }`}
            >
              <FileUp size={13} />
              <span>源内容库 ({sources.length})</span>
            </button>

            <button
              type="button"
              aria-expanded={rightSidebarOpen}
              onClick={() => {
                if (!rightSidebarOpen && (workspaceRef.current?.clientWidth || 0) <= 700) setLeftSidebarOpen(false);
                setRightSidebarOpen((prev) => !prev);
              }}
              className={`min-h-11 px-2.5 py-1 rounded-md border text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors shrink-0 ${
                rightSidebarOpen
                  ? 'bg-[#1877F2] text-white border-[#1877F2]'
                  : 'bg-white dark:bg-zinc-900 text-[#050505] dark:text-zinc-100 border-[#E4E6EB] dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Sparkles size={13} />
              <span>AI 属性面板</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="min-h-11 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-md flex items-center space-x-1 transition-all shadow-2xs cursor-pointer shrink-0 active:scale-95"
            >
              <Users size={13} />
              <span>发起共创</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex w-full relative overflow-hidden">
        {activeMindMapView === 'note' ? (
          /* NOTE MODE VIEW (思维导图一键转换为结构化笔记模式) */
          <div className="workspace-document-layout flex-1 min-w-0 flex bg-[#F0F2F5] dark:bg-zinc-950 overflow-hidden p-4 gap-4">
            {/* Note Mode Left Outline Sidebar */}
            <div className="workspace-document-sidebar w-80 bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-2xs p-4 flex flex-col space-y-4 overflow-y-auto shrink-0">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB] dark:border-zinc-700">
                <div className="flex items-center space-x-2">
                  <FileText className="text-[#1877F2]" size={18} />
                  <h3 className="text-xs font-bold text-[#050505] dark:text-zinc-100 uppercase tracking-wide">
                    思维导图笔记大纲
                  </h3>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  双向同步
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-[#65676B] dark:text-zinc-300 mb-2">
                  点击左侧目录可定位并编辑思维导图各分支笔记：
                </p>
                {nodes.map((nd, idx) => (
                  <div
                    key={`side-nd-${nd.id}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        event.currentTarget.click();
                      }
                    }}
                    onClick={() => {
                      setSelectedNodeId(nd.id);
                      notify(`已选中笔记段落【${nd.title}】`);
                    }}
                    className={`p-2 rounded-xs border text-xs cursor-pointer transition-all ${
                      selectedNodeId === nd.id
                        ? 'bg-blue-50/60 dark:bg-blue-950/60 border-[#1877F2] text-[#1877F2] font-bold'
                        : 'bg-white dark:bg-zinc-900 border-[#E4E6EB] dark:border-zinc-700 text-[#050505] dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="text-[10px] font-mono font-bold text-[#1877F2]">#{idx + 1}</span>
                      <span className="truncate">{nd.title}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Add Sticky Note inside Note Mode */}
              <div className="pt-3 border-t border-[#E4E6EB] dark:border-zinc-700 space-y-2">
                <span className="text-xs font-bold text-[#050505] dark:text-zinc-100">便签贴汇总</span>
                <div className="space-y-1.5">
                  {nodes.filter(n => n.type === 'sticky').map(st => (
                    <div key={st.id} className="p-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 rounded-xs text-[11px] text-amber-900 leading-snug">
                      📌 {st.content}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddStickyModal(true)}
                  className="w-full py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <StickyNote size={13} />
                  <span>+ 增加便签贴</span>
                </button>
              </div>
            </div>

            {/* Note Mode Right Main Markdown/Document Area */}
            <div className="workspace-document-main flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-2xs p-6 overflow-y-auto space-y-6">
              {/* Note Header Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/40 border border-[#1877F2]/20 rounded-md flex items-center justify-between shadow-2xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-[#1877F2] text-white text-[10px] font-bold rounded">
                      一键笔记模式
                    </span>
                    <h2 className="text-sm font-bold text-[#050505] dark:text-zinc-100">
                      【源流画布】思维导图提炼富文本长笔记
                    </h2>
                  </div>
                  <p className="text-xs text-[#65676B] dark:text-zinc-300 mt-1">
                    当前笔记由无限画布中的思维导图分支与便签贴自动编译生成，段落修改实时回写画布节点。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMindMapView('canvas')}
                  className="px-3 py-1.5 bg-[#1877F2] text-white text-xs font-bold rounded-md flex items-center space-x-1 cursor-pointer hover:bg-[#166FE5] shadow-2xs active:scale-95 shrink-0"
                >
                  <Compass size={14} />
                  <span>切回无限画布</span>
                </button>
              </div>

              {/* Main Note Markdown Article Render */}
              <div className="space-y-6 font-sans">
                {nodes.map((nd, idx) => (
                  <div
                    key={`sec-nd-${nd.id}`}
                    id={`note-sec-${nd.id}`}
                    className={`p-4 border rounded-md transition-all ${
                      selectedNodeId === nd.id
                        ? 'border-[#1877F2] ring-2 ring-[#1877F2]/20 bg-blue-50/10 dark:bg-blue-950/30'
                        : 'border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/40 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0F2F5]">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-[#1877F2]">§ {idx + 1}</span>
                        <h3 className="text-sm font-bold text-[#050505] dark:text-zinc-100">{nd.title}</h3>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                          nd.type === 'map' ? 'bg-blue-100 text-[#1877F2]' :
                          nd.type === 'doc' ? 'bg-emerald-100 text-emerald-800' :
                          nd.type === 'sticky' ? 'bg-yellow-100 text-yellow-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {nd.type === 'map' ? '思维导图' : nd.type === 'sticky' ? '便签贴' : nd.type === 'doc' ? '文档块' : '任务节点'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedNodeId(nd.id);
                            setActiveMindMapView('canvas');
                            setPan({ x: -nd.x + 300, y: -nd.y + 200 });
                            notify(`已在中在画布中定位【${nd.title}】`);
                          }}
                          className="text-xs font-bold text-[#1877F2] hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <span>画布定位</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 text-xs text-[#050505] dark:text-zinc-100 leading-relaxed">
                      <p className="bg-[#FAFBFD] p-3 border border-[#E4E6EB] dark:border-zinc-700 rounded-xs font-medium">
                        {nd.content}
                      </p>
                      {nd.markdown && (
                        <div className="p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xs font-mono text-[11px] whitespace-pre-wrap text-gray-700 dark:text-zinc-200">
                          {nd.markdown}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeMindMapView === 'outline' ? (
          /* OUTLINE & TOPOLOGY WORKFLOW VIEW */
          <div className="workspace-document-layout flex-1 min-w-0 flex bg-[#F0F2F5] dark:bg-zinc-950 overflow-hidden p-4 gap-4">
            {/* Outline Left Panel: Collaboration & Version Traceability */}
            <div className="workspace-document-sidebar w-80 bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-2xs p-4 flex flex-col space-y-4 overflow-y-auto shrink-0">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#E4E6EB] dark:border-zinc-700">
                <GitBranch className="text-[#1877F2]" size={18} />
                <h3 className="text-xs font-bold text-[#050505] dark:text-zinc-100 uppercase tracking-wide">
                  小组思维导图共创工作流
                </h3>
              </div>

              {/* Co-Creation Status Card */}
              <div className="bg-[#F0F2F5]/80 dark:bg-zinc-950/80 border border-[#E4E6EB] dark:border-zinc-700 rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#050505] dark:text-zinc-100">共创指派状态</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    requestStatus === 'none' ? 'bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200' :
                    requestStatus === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    requestStatus === 'accepted' ? 'bg-blue-100 text-[#1877F2]' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {requestStatus === 'none' && '尚未发起'}
                    {requestStatus === 'pending' && '指派连线中...'}
                    {requestStatus === 'accepted' && '协同成员已接入编辑'}
                    {requestStatus === 'reviewed' && '修改完成 (待评审提交)'}
                  </span>
                </div>

                <p className="text-[11px] text-[#65676B] dark:text-zinc-300">
                  {requestStatus === 'none' ? '可点击顶部“发起共创指派”，将脑图子节点任务推派给小组成员。' : requestMessage}
                </p>

                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(true)}
                  className="w-full py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-xs cursor-pointer transition-colors"
                >
                  {requestStatus === 'none' ? '发起小组脑图指派' : '更新指派诉求'}
                </button>
              </div>

              {/* Version Traceability History Log */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#050505] dark:text-zinc-100">
                  <div className="flex items-center space-x-1">
                    <History size={14} className="text-[#1877F2]" />
                    <span>大纲版本追溯</span>
                  </div>
                  <span className="text-[10px] text-[#65676B] dark:text-zinc-300">3 个版本历史</span>
                </div>

                <div className="space-y-2">
                  {versionHistory.map((vh) => (
                    <div key={vh.id} className="p-2.5 bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded-md text-xs space-y-1 hover:border-[#1877F2]/40 transition-colors">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#1877F2]">{vh.ver}</span>
                        <span className="text-[10px] text-[#65676B] dark:text-zinc-300">{vh.time} · @{vh.updater}</span>
                      </div>
                      <p className="text-[#050505] dark:text-zinc-100 text-[11px]">{vh.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Outline Right Main Tree View */}
            <div className="workspace-document-main flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-2xs p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB] dark:border-zinc-700">
                <div>
                  <h2 className="text-sm font-bold text-[#050505] dark:text-zinc-100">拓扑结构大纲 view</h2>
                  <p className="text-xs text-[#65676B] dark:text-zinc-300">清晰显示节点父子归属、决策赞同票数与完成进度</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMindMapView('canvas')}
                  className="px-3 py-1.5 bg-[#1877F2] text-white text-xs font-bold rounded-md flex items-center space-x-1 cursor-pointer hover:bg-[#166FE5]"
                >
                  <Compass size={14} />
                  <span>定位至无限画布</span>
                </button>
              </div>

              <div className="space-y-3 font-sans">
                {nodes.map((n, idx) => (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        event.currentTarget.click();
                      }
                    }}
                    onClick={() => {
                      setSelectedNodeId(n.id);
                      setActiveMindMapView('canvas');
                      setPan({ x: -n.x + 300, y: -n.y + 200 });
                      notify(`已定位至节点【${n.title}】`);
                    }}
                    className={`p-3 border rounded-md cursor-pointer transition-all ${
                      n.id === selectedNodeId ? 'border-[#1877F2] bg-blue-50/30 dark:bg-blue-950/30 ring-1 ring-[#1877F2]/30' : 'border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/60 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-[#1877F2]">#{idx + 1}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                          n.type === 'map' ? 'bg-blue-100 text-[#1877F2]' :
                          n.type === 'doc' ? 'bg-emerald-100 text-emerald-800' :
                          n.type === 'sticky' ? 'bg-yellow-100 text-yellow-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {n.type}
                        </span>
                        <h4 className="text-xs font-bold text-[#050505] dark:text-zinc-100">{n.title}</h4>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] font-bold">
                        {n.votes !== undefined && (
                          <span className="text-[#1877F2] flex items-center space-x-0.5">
                            <ThumbsUp size={12} />
                            <span>{n.votes}</span>
                          </span>
                        )}
                        <ChevronRight size={14} className="text-[#65676B] dark:text-zinc-300" />
                      </div>
                    </div>
                    <p className="text-xs text-[#65676B] dark:text-zinc-300 mt-1 line-clamp-2">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* INFINITE CANVAS VIEW (Original canvas structure) */
          <>
            {/* LEFT PANEL: Content Ingestion / Source Cards (Floating Drawer UX) */}
        {leftSidebarOpen && (
          <aside className="workspace-drawer absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-zinc-900 border-r border-[#E4E6EB] dark:border-zinc-700 flex flex-col z-40 shadow-lg animate-in slide-in-from-left duration-150 shrink-0">
            {/* Panel Title */}
            <div className="p-3 border-b border-[#E4E6EB] dark:border-zinc-700 bg-[#F0F2F5]/80 dark:bg-zinc-950/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileUp size={16} className="text-[#1877F2]" />
                <span className="text-xs font-bold text-[#050505] dark:text-zinc-100 uppercase tracking-wide">
                  源内容摄取器 (SOURCES)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLeftSidebarOpen(false)}
                aria-label="关闭面板"
                className="w-11 h-11 rounded bg-gray-200/60 dark:bg-zinc-800/60 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
                title="关闭源内容栏"
              >
                <X size={14} />
              </button>
            </div>

            {/* Quick Ingestion Form */}
            <div className="p-3 border-b border-[#E4E6EB] dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-2">
              <div className="flex items-center space-x-1 bg-[#F0F2F5] dark:bg-zinc-950 p-1 rounded-md border border-[#E4E6EB] dark:border-zinc-700 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setInputType('web')}
                  className={`flex-1 py-1 rounded-xs flex items-center justify-center space-x-1 cursor-pointer ${
                    inputType === 'web' ? 'bg-white dark:bg-zinc-900 text-[#1877F2] shadow-2xs' : 'text-[#65676B] dark:text-zinc-300'
                  }`}
                >
                  <Globe size={12} />
                  <span>网页/链接</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('pdf')}
                  className={`flex-1 py-1 rounded-xs flex items-center justify-center space-x-1 cursor-pointer ${
                    inputType === 'pdf' ? 'bg-white dark:bg-zinc-900 text-[#1877F2] shadow-2xs' : 'text-[#65676B] dark:text-zinc-300'
                  }`}
                >
                  <FileCode size={12} />
                  <span>PDF/文档</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('text')}
                  className={`flex-1 py-1 rounded-xs flex items-center justify-center space-x-1 cursor-pointer ${
                    inputType === 'text' ? 'bg-white dark:bg-zinc-900 text-[#1877F2] shadow-2xs' : 'text-[#65676B] dark:text-zinc-300'
                  }`}
                >
                  <FileText size={12} />
                  <span>速记文本</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={newInputText}
                  onChange={(e) => setNewInputText(e.target.value)}
                  placeholder={
                    inputType === 'web'
                      ? '粘贴 URL 或网页链接...'
                      : inputType === 'pdf'
                      ? '拖入或输入 PDF 文档标题/摘要...'
                      : '粘贴会议记录或长文本...'
                  }
                  className="w-full text-xs p-2.5 bg-[#F0F2F5] dark:bg-zinc-950 border border-[#E4E6EB] dark:border-zinc-700 rounded-md focus:outline-none focus:border-[#1877F2] focus:bg-white resize-none h-16 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleAddSource}
                disabled={isIngesting || !newInputText.trim()}
                className="w-full py-2 bg-[#1877F2] hover:bg-[#166FE5] disabled:bg-[#1877F2]/40 text-white text-xs font-bold rounded-md flex items-center justify-center space-x-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
              >
                <Sparkles size={14} />
                <span>{isIngesting ? '正在解析并转换...' : '一键抓取并生成导图'}</span>
              </button>
            </div>

            {/* Source Card List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#F0F2F5]/30">
              <div className="text-[10px] font-bold text-[#65676B] dark:text-zinc-300 flex items-center justify-between px-0.5">
                <span>已摄取的源文件 ({sources.length})</span>
                <span>按更新时间</span>
              </div>

              {sources.map((src) => (
                <div
                  key={src.id}
                  className="bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/60 rounded-md p-2.5 shadow-2xs transition-all group relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-1.5">
                      {src.type === 'pdf' ? (
                        <FileCode size={15} className="text-red-500 shrink-0" />
                      ) : src.type === 'web' ? (
                        <Globe size={15} className="text-[#1877F2] shrink-0" />
                      ) : (
                        <Youtube size={15} className="text-purple-500 shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-[#050505] dark:text-zinc-100 line-clamp-1 leading-snug">
                        {src.title}
                      </h4>
                    </div>
                    <span className="text-[9px] text-[#65676B] dark:text-zinc-300 shrink-0">{src.time}</span>
                  </div>

                  <p className="text-[11px] text-[#65676B] dark:text-zinc-300 mt-1.5 line-clamp-2 leading-relaxed">
                    {src.summary}
                  </p>

                  <div className="mt-2 pt-2 border-t border-[#F0F2F5] flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {src.tags.map((tg, idx) => (
                        <span
                          key={`src-tag-${idx}`}
                          className="text-[9px] px-1 py-0.5 bg-[#F0F2F5] dark:bg-zinc-950 text-[#65676B] dark:text-zinc-300 font-semibold rounded-xs"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        // Find node on canvas or notify
                        const targetNode = nodes.find((n) => n.sourceCardId === src.id);
                        if (targetNode) {
                          setSelectedNodeId(targetNode.id);
                          setPan({ x: -targetNode.x + 200, y: -targetNode.y + 150 });
                          notify(`已定位至画布上的源节点【${src.title}】`);
                        } else {
                          notify('可在画布上右键添加或生成该源卡片');
                        }
                      }}
                      className="text-[10px] font-bold text-[#1877F2] hover:underline flex items-center space-x-0.5 cursor-pointer"
                    >
                      <span>画布定位</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* CENTER PANEL: Infinite Canvas (Buildin + Endless Canvas) */}
        <main
          className="flex-1 h-full relative bg-[#F0F2F5] dark:bg-zinc-950 overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        >
          {/* Subtle Grid Pattern Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
              backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
          />

          {/* BOTTOM OPERATION BAR (下方操作栏) - Fixed at canvas bottom */}
          <div className="absolute bottom-3 left-3 right-3 z-30 bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 p-1.5 rounded-md shadow-md flex items-center justify-between space-x-2 overflow-x-auto no-scrollbar scroll-smooth">
            {/* Left Action Buttons */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const newId = `node-map-${Date.now()}`;
                  const newNode: CanvasNode = {
                    id: newId,
                    type: 'map',
                    title: '思维导图节点',
                    content: '可填入导图分支内容，可在右侧通过 AI 继续延伸。',
                    x: -pan.x + 300,
                    y: -pan.y + 200,
                    width: 250,
                    height: 120,
                    tags: ['思维导图'],
                  };
                  setNodes((prev) => [...prev, newNode]);
                  setSelectedNodeId(newId);
                  notify('已在无限画布中填入思维导图 🧠');
                }}
                className="px-2.5 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-xs flex items-center space-x-1 cursor-pointer transition-all active:scale-95 shadow-2xs shrink-0"
              >
                <BrainCircuit size={14} />
                <span>填入思维导图</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddStickyModal(true)}
                className="px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-xs flex items-center space-x-1 cursor-pointer transition-all active:scale-95 shadow-2xs shrink-0"
                title="增加便签贴"
              >
                <StickyNote size={14} />
                <span>增加便签贴</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMindMapView('note');
                  notify('已一键将思维导图切换为笔记模式 📝');
                }}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xs flex items-center space-x-1 cursor-pointer transition-all active:scale-95 shadow-2xs shrink-0"
                title="一键切换成笔记模式"
              >
                <FileText size={14} />
                <span>一键转笔记模式</span>
              </button>

              <button
                type="button"
                onClick={handleAutoLayout}
                className="px-2.5 py-1.5 bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 text-[#050505] dark:text-zinc-100 text-xs font-bold rounded-xs flex items-center space-x-1 cursor-pointer transition-colors shrink-0"
                title="自动调整布局"
              >
                <Layout size={14} />
                <span className="hidden sm:inline">整齐排列</span>
              </button>
            </div>

            {/* Right Canvas Info & Zoom Controls */}
            <div className="flex items-center space-x-2 shrink-0 border-l border-[#E4E6EB] dark:border-zinc-700 pl-2 text-xs text-[#65676B] dark:text-zinc-300 font-bold">
              <span className="hidden md:inline">节点数: {nodes.length}</span>
              <span className="hidden md:inline">·</span>
              <span>缩放: {Math.round(zoom * 100)}%</span>

              <div className="flex items-center space-x-0.5 bg-[#F0F2F5] dark:bg-zinc-950 p-0.5 rounded border border-[#E4E6EB] dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                  className="p-1 text-[#050505] dark:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded cursor-pointer transition-colors"
                  title="缩小"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                  className="p-1 text-[#050505] dark:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded cursor-pointer transition-colors"
                  title="放大"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 20, y: 20 });
                  }}
                  className="p-1 text-[#050505] dark:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded cursor-pointer transition-colors"
                  title="重置视角"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Viewport Transformation Layer */}
          <div
            className="absolute inset-0 origin-top-left transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* SVG Connecting Lines Layer */}
            <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none z-0">
              {connections.map((conn) => {
                const fromNode = nodes.find((n) => n.id === conn.fromId);
                const toNode = nodes.find((n) => n.id === conn.toId);
                if (!fromNode || !toNode) return null;

                const startX = fromNode.x + fromNode.width;
                const startY = fromNode.y + fromNode.height / 2;
                const endX = toNode.x;
                const endY = toNode.y + toNode.height / 2;

                const controlX1 = startX + (endX - startX) / 2;
                const controlY1 = startY;
                const controlX2 = startX + (endX - startX) / 2;
                const controlY2 = endY;

                const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;

                return (
                  <g key={`node-conn-${conn.id}`}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={
                        toNode.type === 'doc'
                          ? '#10B981'
                          : toNode.type === 'action'
                          ? '#F59E0B'
                          : '#1877F2'
                      }
                      strokeWidth="2"
                      strokeDasharray={toNode.type === 'action' ? '4,4' : 'none'}
                      opacity="0.8"
                    />
                    {conn.label && (
                      <text
                        x={(startX + endX) / 2}
                        y={(startY + endY) / 2 - 6}
                        fill="#65676B"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="bg-white dark:bg-zinc-900 px-1"
                      >
                        {conn.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Live Collaborator Cursors Layer */}
            {liveCursors.map((cur) => (
              <div
                key={cur.id}
                style={{ left: `${cur.x}px`, top: `${cur.y}px` }}
                className="absolute z-30 pointer-events-none transition-all duration-300 flex items-center space-x-1"
              >
                <MousePointer size={16} fill={cur.color} color={cur.color} className="drop-shadow-xs" />
                <span
                  style={{ backgroundColor: cur.color }}
                  className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-xs shadow-xs tracking-tight"
                >
                  {cur.name}
                </span>
              </div>
            ))}

            {/* Render Renderable Nodes on Canvas */}
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;

              // Render Sticky Note Card Style
              if (node.type === 'sticky') {
                const bgMap = {
                  yellow: 'bg-[#FEF08A] border-[#FDE047] text-[#854D0E]',
                  blue: 'bg-[#BAE6FD] border-[#7DD3FC] text-[#075985]',
                  green: 'bg-[#BBF7D0] border-[#86EFAC] text-[#166534]',
                  purple: 'bg-[#E9D5FF] border-[#D8B4FE] text-[#6B21A8]',
                };
                const colorClass = bgMap[node.stickyColor || 'yellow'];

                return (
                  <div
                    key={`sticky-canvas-${node.id}`}
                    id={`canvas-node-${node.id}`}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      width: `${node.width}px`,
                    }}
                    onMouseDown={(e) => handleNodeMouseDown(e, node)}
                    className={`canvas-node-card absolute z-10 border rounded-md shadow-xs transition-all cursor-move p-3 space-y-2 ${colorClass} ${
                      isSelected ? 'ring-2 ring-[#1877F2] shadow-md scale-102' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-black/10">
                      <div className="flex items-center space-x-1">
                        <StickyNote size={13} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {node.author || '小组成员便签'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                        className="p-0.5 hover:bg-black/10 rounded-xs text-gray-700 dark:text-zinc-200 transition-colors cursor-pointer"
                        title="移除便签"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <p className="text-xs font-semibold leading-relaxed break-words">
                      {node.content}
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={`map-canvas-${node.id}`}
                  id={`canvas-node-${node.id}`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`,
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  className={`canvas-node-card absolute z-10 bg-white dark:bg-zinc-900 border rounded-md shadow-xs transition-shadow cursor-move ${
                    isSelected
                      ? 'border-[#1877F2] ring-2 ring-[#1877F2]/20 shadow-md'
                      : 'border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/50'
                  }`}
                >
                  {/* Card Header by Node Type */}
                  <div
                    className={`px-3 py-2 border-b flex items-center justify-between rounded-t-md ${
                      node.type === 'source'
                        ? 'bg-blue-50 dark:bg-blue-950 border-blue-100 text-[#1877F2]'
                        : node.type === 'map'
                        ? 'bg-[#F0F2F5] dark:bg-zinc-950 border-[#E4E6EB] dark:border-zinc-700 text-[#050505] dark:text-zinc-100'
                        : node.type === 'doc'
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-100 text-emerald-700'
                        : 'bg-amber-50 dark:bg-amber-950 border-amber-100 text-amber-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      {node.type === 'source' && <Globe size={14} />}
                      {node.type === 'map' && <Sparkles size={14} className="text-[#1877F2]" />}
                      {node.type === 'doc' && <FileText size={14} />}
                      {node.type === 'action' && <CheckSquare size={14} />}
                      <span className="text-xs font-bold truncate">{node.title}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                        className="p-1 hover:bg-black/10 rounded-xs text-gray-500 dark:text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="删除节点"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-[#050505] dark:text-zinc-100 leading-relaxed line-clamp-3">
                      {node.content}
                    </p>

                    {/* Action Task Special Info */}
                    {node.type === 'action' && (
                      <div className="pt-2 border-t border-[#F0F2F5] flex items-center justify-between text-[10px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTaskComplete(node.id);
                          }}
                          className={`flex items-center space-x-1 font-bold px-2 py-1 rounded border cursor-pointer transition-colors ${
                            node.isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200'
                          }`}
                        >
                          <Check size={12} />
                          <span>{node.isCompleted ? '已完成' : '待办跟进'}</span>
                        </button>

                        <div className="flex items-center space-x-1 text-[#65676B] dark:text-zinc-300">
                          <Clock size={11} />
                          <span>{node.dueDate || '无截止'}</span>
                        </div>
                      </div>
                    )}

                    {/* Quick Action Bar per Node */}
                    <div className="pt-2 border-t border-[#F0F2F5] flex items-center justify-between text-[10px] font-bold text-[#65676B] dark:text-zinc-300">
                      <div className="flex items-center space-x-1">
                        {node.type === 'map' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVoteNode(node.id);
                            }}
                            className="flex items-center space-x-0.5 bg-blue-50 dark:bg-blue-950 text-[#1877F2] hover:bg-blue-100 px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors border border-blue-200"
                            title="投赞同票"
                          >
                            <ThumbsUp size={10} />
                            <span>{node.votes || 0}</span>
                          </button>
                        )}
                        {node.tags?.map((t, idx) => (
                          <span
                            key={`node-tag-${idx}`}
                            className="bg-[#F0F2F5] dark:bg-zinc-950 px-1.5 py-0.5 rounded text-[9px]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Convert Node Buttons */}
                      <div className="flex items-center space-x-1">
                        {node.type === 'map' && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAiExpandNode(node);
                              }}
                              className="px-1.5 py-0.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] rounded cursor-pointer transition-colors"
                              title="AI延伸"
                            >
                              + AI延伸
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConvertToDoc(node);
                                setActiveMindMapView('note');
                              }}
                              className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded cursor-pointer transition-colors"
                              title="思维导图一键切换成笔记模式"
                            >
                              一键转笔记
                            </button>
                          </>
                        )}

                        {node.type === 'doc' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConvertToAction(node);
                            }}
                            className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded cursor-pointer transition-colors"
                          >
                            + 任务
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* RIGHT PANEL: AI Inspector, Property Editor & Node Collaboration (Floating Drawer UX) */}
        {rightSidebarOpen && (
          <aside className="workspace-drawer absolute top-0 bottom-0 right-0 w-80 max-w-[85vw] bg-white dark:bg-zinc-900 border-l border-[#E4E6EB] dark:border-zinc-700 flex flex-col z-40 shadow-lg animate-in slide-in-from-right duration-150 shrink-0">
            {/* Panel Header */}
            <div className="p-3 border-b border-[#E4E6EB] dark:border-zinc-700 bg-[#F0F2F5]/80 dark:bg-zinc-950/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BrainCircuit size={16} className="text-[#1877F2]" />
                <span className="text-xs font-bold text-[#050505] dark:text-zinc-100 uppercase tracking-wide">
                  AI 智脑 & 属性面板
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRightSidebarOpen(false)}
                aria-label="关闭面板"
                className="w-11 h-11 rounded bg-gray-200/60 dark:bg-zinc-800/60 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
                title="关闭属性面板"
              >
                <X size={14} />
              </button>
            </div>

            {selectedNode ? (
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Node Details Box */}
                <div className="bg-[#F0F2F5]/50 dark:bg-zinc-950/50 border border-[#E4E6EB] dark:border-zinc-700 rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#65676B] dark:text-zinc-300 uppercase">
                      选中节点ID: {selectedNode.id}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#1877F2] text-white rounded">
                      {selectedNode.type.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#65676B] dark:text-zinc-300 block mb-1">
                      节点标题
                    </label>
                    <input
                      type="text"
                      value={selectedNode.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes((prev) =>
                          prev.map((n) => (n.id === selectedNode.id ? { ...n, title: val } : n))
                        );
                      }}
                      className="w-full text-xs font-bold p-2 bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded focus:outline-none focus:border-[#1877F2]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#65676B] dark:text-zinc-300 block mb-1">
                      节点描述 / 内容
                    </label>
                    <textarea
                      value={selectedNode.content}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes((prev) =>
                          prev.map((n) => (n.id === selectedNode.id ? { ...n, content: val } : n))
                        );
                      }}
                      className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded focus:outline-none focus:border-[#1877F2] resize-none h-20"
                    />
                  </div>

                  {/* Doc Markdown Editor Preview if type is 'doc' */}
                  {selectedNode.type === 'doc' && selectedNode.markdown && (
                    <div className="pt-2 border-t border-[#E4E6EB] dark:border-zinc-700">
                      <label className="text-[10px] font-bold text-emerald-700 block mb-1">
                        文档 Rich Markdown (双向同步)
                      </label>
                      <textarea
                        value={selectedNode.markdown}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === selectedNode.id ? { ...n, markdown: val } : n
                            )
                          );
                        }}
                        className="w-full text-[11px] font-mono p-2 bg-[#F0F2F5] dark:bg-zinc-950 border border-[#E4E6EB] dark:border-zinc-700 rounded focus:outline-none resize-none h-28"
                      />
                    </div>
                  )}
                </div>

                {/* AI Prompts Assistant Bar */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-1 text-xs font-bold text-[#050505] dark:text-zinc-100">
                    <Sparkles size={14} className="text-[#1877F2]" />
                    <span>针对此节点的 AI 智能动作</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAiExpandNode(selectedNode)}
                      disabled={isAiThinking}
                      className="p-2 bg-white dark:bg-zinc-900 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 rounded text-left transition-all cursor-pointer group"
                    >
                      <div className="text-[11px] font-bold text-[#050505] dark:text-zinc-100 flex items-center space-x-1">
                        <Sparkle size={12} className="text-[#1877F2]" />
                        <span>继续向下延伸</span>
                      </div>
                      <p className="text-[9px] text-[#65676B] dark:text-zinc-300 mt-0.5">
                        自动推导 2 个子观点
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConvertToDoc(selectedNode)}
                      className="p-2 bg-white dark:bg-zinc-900 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 rounded text-left transition-all cursor-pointer"
                    >
                      <div className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
                        <FileText size={12} />
                        <span>提炼 PRD 章节</span>
                      </div>
                      <p className="text-[9px] text-[#65676B] dark:text-zinc-300 mt-0.5">
                        生成结构化 Markdown
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConvertToAction(selectedNode)}
                      className="p-2 bg-white dark:bg-zinc-900 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 rounded text-left transition-all cursor-pointer"
                    >
                      <div className="text-[11px] font-bold text-amber-700 flex items-center space-x-1">
                        <ListTodo size={12} />
                        <span>衍生团队任务</span>
                      </div>
                      <p className="text-[9px] text-[#65676B] dark:text-zinc-300 mt-0.5">
                        设置截止与跟进人
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundEffects.playShareSound();
                        notify('原型演示：节点摘要导出入口，尚未写入剪贴板');
                      }}
                      className="p-2 bg-white dark:bg-zinc-900 hover:bg-[#EBF7EE] border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#31A24C]/40 rounded text-left transition-all cursor-pointer group"
                    >
                      <div className="text-[11px] font-bold text-[#050505] dark:text-zinc-100 group-hover:text-[#31A24C] flex items-center space-x-1 transition-colors">
                        <Share2 size={12} className="text-[#31A24C]" />
                        <span>一键导出摘要</span>
                      </div>
                      <p className="text-[9px] text-[#65676B] dark:text-zinc-300 mt-0.5">
                        卡片/文本多端同步
                      </p>
                    </button>
                  </div>
                </div>

                {/* Team Collaboration & Comments Thread */}
                <div className="space-y-2 pt-2 border-t border-[#E4E6EB] dark:border-zinc-700">
                  <div className="flex items-center justify-between text-xs font-bold text-[#050505] dark:text-zinc-100">
                    <div className="flex items-center space-x-1">
                      <MessageSquare size={14} className="text-[#1877F2]" />
                      <span>节点协作与讨论</span>
                    </div>
                    <span className="text-[10px] text-[#65676B] dark:text-zinc-300">
                      {comments.filter((c) => c.nodeId === selectedNode.id).length} 条
                    </span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {comments
                      .filter((c) => c.nodeId === selectedNode.id)
                      .map((cm) => (
                        <div
                          key={cm.id}
                          className="p-2 bg-[#F0F2F5] dark:bg-zinc-950 border border-[#E4E6EB] dark:border-zinc-700 rounded text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-[#65676B] dark:text-zinc-300">
                            <span className="text-[#1877F2]">@{cm.author}</span>
                            <span>{cm.time}</span>
                          </div>
                          <p className="text-[#050505] dark:text-zinc-100">{cm.text}</p>
                        </div>
                      ))}
                  </div>

                  <div className="flex items-center space-x-1 pt-1">
                    <input
                      type="text"
                      value={newCommentInput}
                      onChange={(e) => setNewCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      placeholder="发送想法或 @mention 团队成员..."
                      className="flex-1 text-xs p-2 bg-[#F0F2F5] dark:bg-zinc-950 border border-[#E4E6EB] dark:border-zinc-700 rounded focus:outline-none focus:border-[#1877F2]"
                    />
                    <button
                      type="button"
                      onClick={handleAddComment}
                      className="p-2 bg-[#1877F2] text-white rounded hover:bg-[#166FE5] cursor-pointer"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#65676B] dark:text-zinc-300">
                <Layers size={32} className="text-gray-300 mb-2" />
                <p className="text-xs font-bold text-[#050505] dark:text-zinc-100">未选中任何节点</p>
                <p className="text-[11px] mt-1">在无限画布上点击任意卡片节点，即可调出 AI 追问与属性协作面板。</p>
              </div>
            )}
          </aside>
        )}
          </>
        )}
      </div>

      {/* MODAL 1: Sticky Note Creation (贴便签) */}
      {showAddStickyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-lg w-full max-w-sm p-4 space-y-3 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB] dark:border-zinc-700">
              <div className="flex items-center space-x-1.5 font-bold text-[#050505] dark:text-zinc-100">
                <StickyNote size={16} className="text-yellow-600" />
                <span className="text-sm">贴小组便签</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStickyModal(false)}
                className="p-1 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 rounded text-gray-500 dark:text-zinc-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#65676B] dark:text-zinc-300 block mb-1">
                便签颜色 (Theme)
              </label>
              <div className="flex items-center space-x-2">
                {(['yellow', 'blue', 'green', 'purple'] as const).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewStickyColor(col)}
                    className={`w-7 h-7 rounded-md cursor-pointer transition-transform ${
                      col === 'yellow' ? 'bg-[#FEF08A] border-[#FDE047]' :
                      col === 'blue' ? 'bg-[#BAE6FD] border-[#7DD3FC]' :
                      col === 'green' ? 'bg-[#BBF7D0] border-[#86EFAC]' : 'bg-[#E9D5FF] border-[#D8B4FE]'
                    } border-2 ${newStickyColor === col ? 'scale-110 ring-2 ring-[#1877F2]' : 'opacity-70'}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#65676B] dark:text-zinc-300 block mb-1">
                便签内容
              </label>
              <textarea
                value={newStickyText}
                onChange={(e) => setNewStickyText(e.target.value)}
                placeholder="例如：📌 @Sarah Chen 已锁定主干分支，正在跑 CI 测试..."
                className="w-full text-xs p-2.5 bg-[#F0F2F5] dark:bg-zinc-950 border border-[#E4E6EB] dark:border-zinc-700 rounded-md focus:outline-none focus:border-[#1877F2] resize-none h-20"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddStickyModal(false)}
                className="flex-1 py-1.5 bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 text-[#050505] dark:text-zinc-100 text-xs font-bold rounded-md cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleAddStickyNode}
                className="flex-1 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-md cursor-pointer transition-colors shadow-2xs"
              >
                贴入画布
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Co-Creation Assignee Request (发起多人共创指派) */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-lg w-full max-w-md p-4 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB] dark:border-zinc-700">
              <div className="flex items-center space-x-2 font-bold text-[#050505] dark:text-zinc-100">
                <Users size={18} className="text-[#1877F2]" />
                <span className="text-sm">发起小组思维导图共创指派</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 rounded text-gray-500 dark:text-zinc-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#65676B] dark:text-zinc-300 block mb-1">
                  选择指派的小组协作者
                </label>
                <select
                  value={requestAssignee}
                  onChange={(e) => setRequestAssignee(e.target.value)}
                  className="w-full text-xs font-bold p-2 bg-[#F0F2F5] dark:bg-zinc-950 border border-[#E4E6EB] dark:border-zinc-700 rounded-md focus:outline-none focus:border-[#1877F2]"
                >
                  <option value="m_admin">Sarah Chen (UI设计与视觉总监)</option>
                  <option value="m_owner">Alex Mercer (核心架构师)</option>
                  <option value="m_member1">Hui Zhang (高级前端工程师)</option>
                  <option value="m_member2">Mia Wang (AI 算法科学家)</option>
                  <option value="m_member3">Lucas Zhao (增长黑客与运营)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#65676B] dark:text-zinc-300 block mb-1">
                  共创要求 & 协同描述
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="请输入需要对方协助补充的脑图分支、PRD段落或任务代码要求..."
                  className="w-full text-xs p-2.5 bg-[#F0F2F5] dark:bg-zinc-950 border border-[#E4E6EB] dark:border-zinc-700 rounded-md focus:outline-none focus:border-[#1877F2] resize-none h-24"
                />
              </div>

              <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/60 border border-blue-100 rounded-md text-[11px] text-[#1877F2] flex items-start space-x-1.5">
                <Sparkles size={14} className="shrink-0 mt-0.5" />
                <span>发送后，小组成员将收到 P2P 协同信号，并以实时光标接入当前源流工作台进行共创。</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-[#E4E6EB] dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="flex-1 py-1.5 bg-[#F0F2F5] dark:bg-zinc-950 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 text-[#050505] dark:text-zinc-100 text-xs font-bold rounded-md cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSendCoCreationRequest}
                className="flex-1 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-md cursor-pointer transition-colors shadow-2xs"
              >
                立即派发协同
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Co-creation Request Modal */}
    </div>
  );
};
