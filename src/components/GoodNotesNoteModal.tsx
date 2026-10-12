import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  Mic,
  MapPin,
  Paperclip,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Grid,
  FileText,
  Download,
  Share2,
  ListCheck,
  Type,
  Maximize2,
} from 'lucide-react';

export interface GoodNotesNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (newNote: {
    title: string;
    content: string;
    paperTemplate: string;
    attachments: {
      images: { id: string; url: string; caption: string; scale: number; rotation: number }[];
      audio: { id: string; title: string; duration: string; transcript: string } | null;
      locations: { id: string; name: string; address: string; coords: string; time: string }[];
      documents: { id: string; name: string; size: string; type: string }[];
    };
  }) => void;
  showToast?: (msg: string) => void;
}

export const GoodNotesNoteModal: React.FC<GoodNotesNoteModalProps> = ({
  isOpen,
  onClose,
  onSaveNote,
  showToast,
}) => {
  // Note State
  const [noteTitle, setNoteTitle] = useState('Stellar 灵感全屏手记');
  const [noteSubtitle, setNoteSubtitle] = useState('— GoodNotes 扁平化无界笔记模式 —');
  const [noteContent, setNoteContent] = useState(
    '1. 扁平化无界手记空间：专注文本与多媒体表达，移除冗余的绘图画布擦除逻辑。\n2. 多维层级文本编辑器：支持标题、副标题、列表清单与高亮标注。\n3. 可缩放媒体模块：支持精准图片比例调节、GPS 定位打卡与文档随手附带。'
  );
  const [paperTemplate, setPaperTemplate] = useState<'grid' | 'ruled' | 'blank' | 'dot'>('grid');

  // Interactive Checklist State
  const [todoItems, setTodoItems] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: 't1', text: '完成 Stellar 首页地图 UserPopover 与手记弹窗重构', done: true },
    { id: 't2', text: '优化图片模块按需比例缩放与旋转预览', done: true },
    { id: 't3', text: '平铺化 CalendarView 活动排期列表样式', done: false },
  ]);

  // Images State
  const [images, setImages] = useState<
    { id: string; url: string; caption: string; scale: number; rotation: number }[]
  >([
    {
      id: 'img1',
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000',
      caption: 'Stellar 团队极客研讨灵感看板现场',
      scale: 1.0,
      rotation: 0,
    },
  ]);

  // Location Tag State
  const [locations, setLocations] = useState([
    {
      id: 'loc1',
      name: '兰州市城关区东方红广场',
      address: '甘肃省兰州市城关区广场南路101号',
      coords: '36.0594° N, 103.8263° E',
      time: '15:30 打卡',
    },
  ]);

  // Image Zoom Controls
  const handleScaleChange = (id: string, delta: number) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, scale: Math.min(2.5, Math.max(0.5, img.scale + delta)) } : img
      )
    );
  };

  const handleRotateChange = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img))
    );
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (showToast) showToast('已移除关联图片');
  };

  const handleToggleTodo = (id: string) => {
    setTodoItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleSave = () => {
    onSaveNote({
      title: noteTitle,
      content: `${noteSubtitle}\n\n${noteContent}`,
      paperTemplate,
      attachments: {
        images,
        audio: null,
        locations,
        documents: [],
      },
    });
    if (showToast) showToast('🎉 GoodNotes 全屏手记已成功保存');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F6] text-[#1c1e21] flex flex-col font-sans overflow-hidden animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION BAR (Full-screen Flat Header) */}
      {/* ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 shrink-0 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-[#050505] transition-all cursor-pointer"
            title="关闭手记"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="text-base sm:text-lg font-extrabold text-[#050505] bg-transparent outline-none focus:ring-1 focus:ring-[#1877F2] rounded px-1 -ml-1 transition-all max-w-[200px] sm:max-w-[320px] truncate"
              placeholder="无标题手记"
            />
            <p className="text-[10px] text-gray-500 font-medium">GoodNotes 极简扁平化模式</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Template Selector */}
          <div className="hidden sm:flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            {(['grid', 'ruled', 'blank', 'dot'] as const).map((tmpl, idx) => (
              <button
                key={`${tmpl}-${idx}`}
                type="button"
                onClick={() => setPaperTemplate(tmpl)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold capitalize transition-all cursor-pointer ${
                  paperTemplate === tmpl ? 'bg-white text-[#1877F2] shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tmpl === 'grid' && '方格'}
                {tmpl === 'ruled' && '横线'}
                {tmpl === 'blank' && '纯白'}
                {tmpl === 'dot' && '点阵'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              if (showToast) showToast('已将 GoodNotes 手记导出为 PDF / 图像');
            }}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
            title="导出手记"
          >
            <Download size={16} />
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="py-1.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white font-bold rounded-full text-xs flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
          >
            <Check size={15} />
            <span>保存</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BODY NOTE CANVAS (Full-screen Flat Editor Area with Paper Texture) */}
      {/* ========================================================================= */}
      <div
        className={`flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar relative ${
          paperTemplate === 'grid'
            ? 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]'
            : paperTemplate === 'ruled'
              ? 'bg-[linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] [background-size:100%_28px]'
              : paperTemplate === 'dot'
                ? 'bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:20px_20px]'
                : 'bg-[#FAF9F6]'
        }`}
      >
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-200/80 p-6 sm:p-10 space-y-6">
          {/* Title & Subtitle Hierarchy */}
          <div className="border-b border-gray-200 pb-4 space-y-2">
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full text-2xl sm:text-3xl font-extrabold text-[#050505] bg-transparent outline-none placeholder-gray-300"
              placeholder="输入手记主标题..."
            />
            <input
              type="text"
              value={noteSubtitle}
              onChange={(e) => setNoteSubtitle(e.target.value)}
              className="w-full text-sm font-bold text-[#1877F2] bg-transparent outline-none placeholder-gray-300"
              placeholder="输入副标题/分类标注..."
            />
          </div>

          {/* Interactive Checklist Block */}
          <div className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
              <ListCheck size={15} className="text-[#1877F2]" />
              <span>灵感与任务清单</span>
            </div>
            <div className="space-y-1.5">
              {todoItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleTodo(item.id)}
                  className="flex items-center space-x-2.5 cursor-pointer group hover:bg-white p-1.5 rounded-lg transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      item.done
                        ? 'bg-[#1877F2] border-[#1877F2] text-white'
                        : 'border-gray-300 group-hover:border-[#1877F2]'
                    }`}
                  >
                    {item.done && <Check size={12} className="stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs font-medium transition-all ${
                      item.done ? 'line-through text-gray-400' : 'text-[#050505]'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Paragraph Body Textarea */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
              <Type size={14} />
              <span>正文内容</span>
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={6}
              className="w-full text-sm text-[#050505] leading-relaxed bg-transparent outline-none resize-none placeholder-gray-400 font-normal"
              placeholder="在这里开始书写您的灵感手记..."
            />
          </div>

          {/* Optimized Scalable Image Modules Section */}
          {images.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
                  <ImageIcon size={15} className="text-[#1877F2]" />
                  <span>附带图片模块 ({images.length})</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col items-center space-y-2 overflow-hidden shadow-2xs group"
                  >
                    {/* Scale Action Toolbar */}
                    <div className="w-full flex items-center justify-between text-xs px-1">
                      <span className="text-[10px] font-mono font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {Math.round(img.scale * 100)}%
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleScaleChange(img.id, -0.1)}
                          className="w-6 h-6 rounded bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 cursor-pointer"
                          title="缩小"
                        >
                          <ZoomOut size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleScaleChange(img.id, 0.1)}
                          className="w-6 h-6 rounded bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 cursor-pointer"
                          title="放大"
                        >
                          <ZoomIn size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRotateChange(img.id)}
                          className="w-6 h-6 rounded bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 cursor-pointer"
                          title="旋转 90°"
                        >
                          <RotateCw size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="w-6 h-6 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center cursor-pointer ml-1"
                          title="移除图片"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Scalable Image Container */}
                    <div className="w-full h-44 bg-gray-200/50 rounded-lg overflow-hidden flex items-center justify-center relative">
                      <img
                        src={img.url}
                        alt="Note Attachment"
                        style={{
                          transform: `scale(${img.scale}) rotate(${img.rotation}deg)`,
                          transition: 'transform 0.2s ease-out',
                        }}
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    </div>

                    {/* Caption Input */}
                    <input
                      type="text"
                      value={img.caption}
                      onChange={(e) => {
                        const val = e.target.value;
                        setImages((prev) =>
                          prev.map((i) => (i.id === img.id ? { ...i, caption: val } : i))
                        );
                      }}
                      className="w-full text-[11px] text-gray-600 text-center bg-transparent outline-none border-b border-dashed border-gray-300 focus:border-[#1877F2]"
                      placeholder="添加图片说明..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attached GPS Location Tag Section */}
          {locations.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-700 mb-2">
                <MapPin size={15} className="text-rose-500" />
                <span>实时定位打卡</span>
              </div>
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="bg-rose-50/60 border border-rose-100 rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#050505]">{loc.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{loc.address} · {loc.time}</p>
                  </div>
                  <span className="text-[10px] font-mono text-rose-600 font-bold bg-white px-2 py-0.5 rounded border border-rose-200">
                    GPS 锁定
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
