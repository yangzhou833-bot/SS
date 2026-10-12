import React, { useState } from 'react';
import {
  Send,
  Calendar,
  Bell,
  ScanLine,
  FolderCheck,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Tag,
  ShieldCheck,
  Camera,
  Layers,
  Sparkles,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Folder,
  Receipt,
  FileCheck2,
  CreditCard,
  ClipboardList,
  Code2,
  Smartphone,
  ArrowUpRight,
  Zap,
  Check,
} from 'lucide-react';
import {
  ActionFlowItem,
  ActionFlowCard,
  PhotoAlbum,
  DocumentFolder,
  DocumentAsset,
  AICategoryType,
  AI_CATEGORIES,
} from '../../data/documentCenterData';

interface DocumentActionFlowViewProps {
  flows: ActionFlowItem[];
  userAlbums: PhotoAlbum[];
  userFolders: DocumentFolder[];
  allAssets?: DocumentAsset[];
  unclassifiedAssets?: DocumentAsset[];
  activeFlow?: ActionFlowItem | null;
  onExecuteFlow: (flow: ActionFlowItem, targetAsset?: DocumentAsset) => void;
  onSaveFlow: (flow: ActionFlowItem) => void;
  onSelectAICategory?: (cat: AICategoryType) => void;
  onOpenAiAutoArchive?: () => void;
  onClose?: () => void;
  onShowToast?: (msg: string) => void;
  showToast?: (msg: string) => void;
}

export const DocumentActionFlowView: React.FC<DocumentActionFlowViewProps> = ({
  flows,
  userAlbums,
  userFolders,
  allAssets = [],
  unclassifiedAssets = [],
  activeFlow,
  onExecuteFlow,
  onSaveFlow,
  onSelectAICategory,
  onOpenAiAutoArchive,
  onClose,
  onShowToast,
  showToast,
}) => {
  const triggerToast = (msg: string) => {
    if (onShowToast) onShowToast(msg);
    else if (showToast) showToast(msg);
  };

  // Current editing / active flow (defaults to the first one or activeFlow)
  const [selectedFlow, setSelectedFlow] = useState<ActionFlowItem>(
    activeFlow || flows[0]
  );

  // Form states for customizing the Flow
  const [flowTitle, setFlowTitle] = useState(selectedFlow?.title || '新建智能归档工作流');
  const [triggerSource, setTriggerSource] = useState(
    selectedFlow?.triggerWhen?.source || '群聊或私聊中接收到新文档或附件'
  );
  const [senderName, setSenderName] = useState(
    selectedFlow?.triggerWhen?.senderName || 'Brian Schulz 或任意群成员'
  );
  const [conditionText, setConditionText] = useState(
    selectedFlow?.conditionAnd?.conditionText || 'AI 语义识别为【发票与报销】，文件大小 < 20MB'
  );
  const [targetDestination, setTargetDestination] = useState(
    selectedFlow?.conditionAnd?.targetDestinationName || '财务报销与票据 (文件夹)'
  );
  const [extraCards, setExtraCards] = useState<ActionFlowCard[]>(
    selectedFlow?.conditionAnd?.extraCards || []
  );
  const [thenActions, setThenActions] = useState<ActionFlowCard[]>(
    selectedFlow?.actionsThen || []
  );

  // Synchronize when selectedFlow changes
  const handleSelectFlow = (flow: ActionFlowItem) => {
    setSelectedFlow(flow);
    setFlowTitle(flow.title);
    setTriggerSource(flow.triggerWhen.source);
    setSenderName(flow.triggerWhen.senderName || '群成员');
    setConditionText(flow.conditionAnd.conditionText);
    setTargetDestination(flow.conditionAnd.targetDestinationName);
    setExtraCards(flow.conditionAnd.extraCards || []);
    setThenActions(flow.actionsThen || []);
  };

  // Add custom "And" card
  const handleAddAndCard = (type: 'tag' | 'size' | 'time') => {
    const newCard: ActionFlowCard = {
      id: `and-card-${Date.now()}`,
      type: 'filter',
      title:
        type === 'tag'
          ? '自动添加分类标签'
          : type === 'size'
          ? '文件体积阈值过滤'
          : '时间范围限制',
      detail:
        type === 'tag'
          ? '自动注入 #群聊原图 #AI解析 #已校验'
          : type === 'size'
          ? '仅当文件小于 100MB 时执行自动下载'
          : '仅在工作时间 (09:00 - 18:00) 静默执行',
      iconName: type === 'tag' ? 'Tag' : 'Filter',
    };
    setExtraCards([...extraCards, newCard]);
    triggerToast('已添加过滤条件卡片');
  };

  // Add custom "Then" card
  const handleAddThenCard = (type: 'notification' | 'ocr' | 'sync') => {
    const newCard: ActionFlowCard = {
      id: `then-card-${Date.now()}`,
      type: type === 'ocr' ? 'ocr' : type === 'sync' ? 'sync' : 'notification',
      title:
        type === 'ocr'
          ? 'OCR 智能提取文本与元数据'
          : type === 'sync'
          ? '全量备份至个人云盘空间'
          : '发送桌面与移动端即时推送',
      detail:
        type === 'ocr'
          ? '识别票据金额、合同签署章、身份证号'
          : type === 'sync'
          ? '自动保留原始高保真文件，永不过期'
          : '在归档完成后推送通知并在群中打标',
      iconName: type === 'ocr' ? 'ScanLine' : type === 'sync' ? 'FolderCheck' : 'Bell',
      badgeColor: type === 'ocr' ? '#F7B928' : type === 'sync' ? '#42B72A' : '#1877F2',
    };
    setThenActions([...thenActions, newCard]);
    triggerToast('已添加执行动作卡片');
  };

  // Save current flow
  const handleSaveCurrentFlow = () => {
    const updated: ActionFlowItem = {
      ...selectedFlow,
      title: flowTitle,
      triggerWhen: {
        ...selectedFlow.triggerWhen,
        source: triggerSource,
        senderName: senderName,
      },
      conditionAnd: {
        ...selectedFlow.conditionAnd,
        conditionText: conditionText,
        targetDestinationName: targetDestination,
        extraCards: extraCards,
      },
      actionsThen: thenActions,
    };
    onSaveFlow(updated);
    triggerToast(`已保存自动化规则【${flowTitle}】`);
  };

  // Category Icon helper
  const renderCategoryIcon = (catId: AICategoryType) => {
    switch (catId) {
      case 'invoices':
        return <Receipt size={16} />;
      case 'contracts':
        return <FileCheck2 size={16} />;
      case 'certificates':
        return <CreditCard size={16} />;
      case 'meetings':
        return <ClipboardList size={16} />;
      case 'travel':
        return <Camera size={16} />;
      case 'inspiration':
        return <Sparkles size={16} />;
      case 'projects':
        return <Code2 size={16} />;
      case 'screenshots':
        return <Smartphone size={16} />;
      default:
        return <Sparkles size={16} />;
    }
  };

  return (
    <div className="space-y-6 pb-12 pt-1 px-1 max-w-2xl mx-auto">
      {/* =================================================================== */}
      {/* 1. AI 智能分类聚类模块 (从 All Files 移动至自动化页面)                */}
      {/* =================================================================== */}
      <section className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1877F2] to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-[#050505] tracking-tight">
                  AI 智能分类聚类中心
                </h2>
                <span className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                  8 大聚类
                </span>
              </div>
              <p className="text-xs font-medium text-[#65676B] mt-0.5">
                基于内容语义与文件特征，自动聚类发票、合同、证件、纪要与媒体
              </p>
            </div>
          </div>

          {onOpenAiAutoArchive && (
            <button
              type="button"
              onClick={onOpenAiAutoArchive}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#1877F2] to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-black shadow-xs cursor-pointer flex items-center space-x-1.5 transition-all"
            >
              <Sparkles size={13} />
              <span>一键智能归档</span>
              {unclassifiedAssets.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-300 text-[#050505] text-[10px] font-black flex items-center justify-center">
                  {unclassifiedAssets.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* AI Cluster Visual Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {AI_CATEGORIES.map((cat) => {
            const matchedCount = allAssets.filter((a) => a.aiCategory === cat.id).length;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectAICategory && onSelectAICategory(cat.id)}
                className="group relative rounded-2xl p-3 bg-[#F0F2F5]/80 hover:bg-blue-50/70 border border-transparent hover:border-[#1877F2]/40 transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xs active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cat.bgGradient} text-white flex items-center justify-center shadow-xs`}
                  >
                    {renderCategoryIcon(cat.id)}
                  </div>
                  <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-full text-[#050505] shadow-2xs border border-gray-100">
                    {matchedCount || cat.badgeCount} 项
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-black text-[#050505] group-hover:text-[#1877F2] transition-colors truncate">
                    {cat.title}
                  </h3>
                  <p className="text-[10px] text-[#65676B] truncate mt-0.5">
                    {cat.tags.slice(0, 2).join(' · ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. 自动化规则编辑器 (Action Flow Automation Rules)                 */}
      {/* =================================================================== */}
      <section className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-2xl bg-blue-50 text-[#1877F2] flex items-center justify-center">
              <Zap size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-[#050505] tracking-tight">
                自动化动作流规则
              </h2>
              <p className="text-[11px] text-[#65676B]">配置“当触发 ➔ 并且满足条件 ➔ 那么自动执行”</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                handleSaveCurrentFlow();
                onExecuteFlow(selectedFlow);
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
            >
              <span>立即运行 Flow</span>
              <Play size={11} className="fill-current ml-0.5" />
            </button>
          </div>
        </div>

        {/* Flow Templates Switcher Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          {flows.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleSelectFlow(f)}
              className={`shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                selectedFlow.id === f.id
                  ? 'bg-blue-50 text-[#1877F2] border-[#1877F2] shadow-2xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{f.emoji}</span>
              <span>{f.title}</span>
            </button>
          ))}
        </div>

        {/* STEP 1: 当... (When... 触发源与事件) */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-black text-[#050505] uppercase tracking-wider px-1 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>当... (触发源与事件)</span>
          </label>

          <div className="p-4 rounded-2xl bg-[#F0F2F5]/70 border border-gray-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-[#42B72A] flex items-center justify-center shrink-0 shadow-2xs border border-green-100">
                <Send size={18} />
              </div>

              <div className="min-w-0">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                  聊天与文件接收触发器
                </div>
                <div className="text-xs font-bold text-[#050505] truncate mt-0.5">
                  {triggerSource}
                </div>
                <div className="text-[11px] text-[#65676B] truncate">
                  发送人：{senderName}
                </div>
              </div>
            </div>

            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-black shrink-0">
              监听中
            </span>
          </div>
        </div>

        {/* STEP 2: 并且... (And... 识别过滤与归档目标) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-black text-[#050505] uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
              <span>并且... (识别过滤与归类目标)</span>
            </label>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => handleAddAndCard('tag')}
                className="text-[11px] font-bold text-[#1877F2] hover:underline cursor-pointer"
              >
                + 添加标签过滤
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F0F2F5]/70 border border-gray-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-[#1877F2]" />
                <span className="text-xs font-bold text-[#050505]">智能语义识别条件</span>
              </div>
              <span className="text-[10px] font-bold text-gray-500">自动解析</span>
            </div>

            <input
              type="text"
              value={conditionText}
              onChange={(e) => setConditionText(e.target.value)}
              className="w-full text-xs font-bold text-[#050505] bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#1877F2]"
              placeholder="输入识别匹配条件..."
            />

            <div className="pt-1 flex items-center justify-between text-xs font-bold text-[#050505]">
              <span className="text-gray-500 text-[11px]">目标归档目录：</span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1877F2]">
                {targetDestination}
              </span>
            </div>

            {/* Extra condition cards */}
            {extraCards.map((card, idx) => (
              <div
                key={card.id}
                className="p-2.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[#050505]">{card.title}</div>
                  <div className="text-[10px] text-gray-500">{card.detail}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setExtraCards(extraCards.filter((_, i) => i !== idx))}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 3: 那么... (Then... 自动化执行动作) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-black text-[#050505] uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>那么... (自动化执行动作)</span>
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleAddThenCard('ocr')}
                className="text-[11px] font-bold text-[#1877F2] hover:underline cursor-pointer"
              >
                + OCR提取
              </button>
              <span className="text-gray-300">·</span>
              <button
                type="button"
                onClick={() => handleAddThenCard('notification')}
                className="text-[11px] font-bold text-[#1877F2] hover:underline cursor-pointer"
              >
                + 系统推送
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {thenActions.map((action, idx) => (
              <div
                key={`flow-action-${action.id || idx}-${idx}`}
                className="p-3 rounded-2xl bg-[#F0F2F5]/70 border border-gray-200/80 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: action.badgeColor || '#1877F2' }}
                  >
                    {action.type === 'ocr' ? (
                      <ScanLine size={16} />
                    ) : action.type === 'notification' ? (
                      <Bell size={16} />
                    ) : (
                      <FolderCheck size={16} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#050505] truncate">{action.title}</h4>
                    <p className="text-[10px] text-[#65676B] truncate">{action.detail}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setThenActions(thenActions.filter((_, i) => i !== idx))}
                  className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSaveCurrentFlow}
            className="w-full py-2.5 rounded-2xl bg-gray-100 hover:bg-[#1877F2] hover:text-white text-gray-800 text-xs font-black transition-all cursor-pointer"
          >
            保存此自动化工作流配置
          </button>
        </div>
      </section>
    </div>
  );
};
