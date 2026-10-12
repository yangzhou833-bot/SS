import React, { useState } from 'react';
import {
  ArrowLeft,
  Image as ImageIcon,
  Camera,
  Mic,
  MapPin,
  CheckSquare,
  X,
  Play,
  Pause,
  Trash2,
  Check,
  Plus,
} from 'lucide-react';

export type NoteBlockType = 'text' | 'image' | 'voice' | 'location' | 'todo';

export interface NoteBlock {
  id: string;
  type: NoteBlockType;
  text?: string;
  imageUrl?: string;
  audioDuration?: string;
  locationName?: string;
  todoChecked?: boolean;
}

interface ImmersiveAddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: { title: string; blocks: NoteBlock[] }) => void;
}

export const ImmersiveAddNoteModal: React.FC<ImmersiveAddNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<NoteBlock[]>([
    { id: 'initial-text', type: 'text', text: '' },
  ]);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasContent = title.trim().length > 0 || blocks.some((b) => (b.text && b.text.trim().length > 0) || b.type !== 'text');

  const handleSave = () => {
    if (!hasContent) return;
    onSave({
      title: title.trim() || '无标题笔记',
      blocks,
    });
    onClose();
  };

  // Add new block to flow
  const addBlock = (type: NoteBlockType, extraData: Partial<NoteBlock> = {}) => {
    const newBlock: NoteBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      ...extraData,
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const updateBlockText = (id: string, text: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, text } : b))
    );
  };

  const toggleTodo = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, todoChecked: !b.todoChecked } : b))
    );
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  // Action handlers
  const handleAddImage = () => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800',
    ];
    const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    addBlock('image', { imageUrl: randomImg, text: '现场风景记录' });
  };

  const handleAddCamera = () => {
    addBlock('image', {
      imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800',
      text: '刚刚拍摄的照片',
    });
  };

  const handleAddVoice = () => {
    addBlock('voice', { audioDuration: '0:18"', text: '语音笔记录音' });
  };

  const handleAddLocation = () => {
    addBlock('location', { locationName: '📍 兰州市城关区东方红广场' });
  };

  const handleAddTodo = () => {
    addBlock('todo', { text: '', todoChecked: false });
  };

  return (
    <div
      id="immersive-add-note-modal"
      className="fixed inset-0 z-50 bg-[#FFFFFF] flex flex-col font-sans select-none animate-in fade-in zoom-in-95 duration-200"
    >
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION BAR (微信/Meta 风格：全屏无底下切割线) */}
      {/* ========================================================================= */}
      <header className="w-full px-4 pt-12 pb-3 bg-[#FFFFFF] flex items-center justify-between z-20 shrink-0">
        {/* Left: Pill Back Arrow Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-gray-100/80 hover:bg-gray-200 text-[#65676B] flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          aria-label="返回"
          title="返回"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>

        {/* Center: Title Header */}
        <h1 className="text-base font-bold text-[#050505] tracking-tight">添加笔记</h1>

        {/* Right: Meta Blue Pill Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasContent}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
            hasContent
              ? 'bg-[#1877F2] text-white shadow-sm hover:bg-[#166fe5] active:scale-95'
              : 'bg-[#E4E6EB] text-[#8A8D91] cursor-not-allowed'
          }`}
        >
          保存
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT EDITOR AREA (全面沉浸排版：纯白无卡片) */}
      {/* ========================================================================= */}
      <main className="flex-1 overflow-y-auto px-6 pt-4 pb-28 space-y-4 max-w-2xl mx-auto w-full no-scrollbar">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入标题..."
          className="w-full text-2xl font-black text-[#050505] placeholder-[#8A8D91] bg-transparent border-none outline-none tracking-tight py-1"
        />

        {/* Dividing Subtle Space (No harsh line) */}
        <div className="h-1" />

        {/* Rich Blocks Container */}
        <div className="space-y-4">
          {blocks.map((block) => (
            <div key={block.id} className="relative group">
              {/* --- TEXT BLOCK --- */}
              {block.type === 'text' && (
                <div className="relative flex items-start">
                  <textarea
                    rows={Math.max(2, (block.text || '').split('\n').length)}
                    value={block.text || ''}
                    onChange={(e) => updateBlockText(block.id, e.target.value)}
                    placeholder="输入正文..."
                    className="w-full text-sm font-normal text-[#1c1e21] placeholder-[#8A8D91] bg-transparent border-none outline-none resize-none leading-relaxed tracking-normal"
                  />
                  {blocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 text-gray-400 hover:text-rose-500 cursor-pointer"
                      title="删除此段落"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* --- IMAGE BLOCK (以实际尺寸内嵌显示) --- */}
              {block.type === 'image' && (
                <div className="relative my-2 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-2xs group/img">
                  <img
                    src={block.imageUrl}
                    alt="笔记图片"
                    className="w-full max-h-[360px] object-cover rounded-2xl"
                  />
                  {/* Delete Overlay */}
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-md"
                    title="删除图片"
                  >
                    <X size={14} />
                  </button>
                  {/* Optional Image Caption */}
                  <input
                    type="text"
                    value={block.text || ''}
                    onChange={(e) => updateBlockText(block.id, e.target.value)}
                    placeholder="添加图片备注..."
                    className="w-full px-3.5 py-2 text-xs text-[#65676B] bg-white/90 placeholder-[#8A8D91] outline-none border-t border-gray-100"
                  />
                </div>
              )}

              {/* --- VOICE BLOCK (带播放按钮的短圆角条) --- */}
              {block.type === 'voice' && (
                <div className="my-2.5 inline-flex items-center space-x-3 bg-gray-100/80 hover:bg-gray-100 rounded-full px-4 py-2 border border-gray-200/60 max-w-xs transition-all">
                  <button
                    type="button"
                    onClick={() =>
                      setPlayingVoiceId(playingVoiceId === block.id ? null : block.id)
                    }
                    className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer shrink-0"
                  >
                    {playingVoiceId === block.id ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                  </button>

                  <div className="flex items-center space-x-1.5 flex-1">
                    {/* Simulated Voice Waveform Bars */}
                    <div className="flex items-center space-x-0.5 h-4">
                      <div className="w-0.5 h-3 bg-blue-500 rounded-full animate-pulse" />
                      <div className="w-0.5 h-4 bg-blue-600 rounded-full" />
                      <div className="w-0.5 h-2 bg-blue-400 rounded-full" />
                      <div className="w-0.5 h-3.5 bg-blue-500 rounded-full" />
                      <div className="w-0.5 h-2.5 bg-blue-400 rounded-full" />
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-700">
                      {block.audioDuration || '0:12"'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="p-1 text-gray-400 hover:text-rose-500 cursor-pointer transition-colors"
                    title="删除语音"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}

              {/* --- LOCATION BLOCK (地点名称和微缩地图占位) --- */}
              {block.type === 'location' && (
                <div className="my-2.5 flex items-center justify-between bg-gray-50 border border-gray-200/80 rounded-2xl p-3 space-x-3">
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#050505] truncate">
                        {block.locationName || '📍 兰州市城关区东方红广场'}
                      </span>
                      <span className="text-[10px] text-[#65676B]">实时定位节点</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-500 cursor-pointer transition-colors"
                    title="移除位置"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* --- TODO CHECKLIST BLOCK (勾选框列表) --- */}
              {block.type === 'todo' && (
                <div className="my-1.5 flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={() => toggleTodo(block.id)}
                    className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                      block.todoChecked
                        ? 'bg-[#1877F2] border-[#1877F2] text-white'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {block.todoChecked && <Check size={13} strokeWidth={3} />}
                  </button>

                  <input
                    type="text"
                    value={block.text || ''}
                    onChange={(e) => updateBlockText(block.id, e.target.value)}
                    placeholder="待办事项..."
                    className={`w-full text-xs sm:text-sm bg-transparent outline-none border-none py-1 transition-colors ${
                      block.todoChecked
                        ? 'line-through text-gray-400 font-normal'
                        : 'text-[#1c1e21] font-medium'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="p-1 text-gray-300 hover:text-rose-500 cursor-pointer transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM FLOATING TOOLBAR (微信/Meta 药丸按钮水平滑块) */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-6 left-0 right-0 z-30 flex justify-center pointer-events-none px-4">
        <div className="pointer-events-auto bg-[#FFFFFF] border border-gray-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-full px-3.5 py-2 flex items-center space-x-2 sm:space-x-2.5 overflow-x-auto max-w-full no-scrollbar">
          {/* 相册按钮 */}
          <button
            type="button"
            onClick={handleAddImage}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#65676B] text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            title="插入图片"
          >
            <ImageIcon size={15} strokeWidth={1.8} />
            <span>图片</span>
          </button>

          {/* 相机按钮 */}
          <button
            type="button"
            onClick={handleAddCamera}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#65676B] text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            title="拍摄"
          >
            <Camera size={15} strokeWidth={1.8} />
            <span>拍摄</span>
          </button>

          {/* 语音按钮 */}
          <button
            type="button"
            onClick={handleAddVoice}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#65676B] text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            title="录制语音"
          >
            <Mic size={15} strokeWidth={1.8} />
            <span>语音</span>
          </button>

          {/* 定位按钮 */}
          <button
            type="button"
            onClick={handleAddLocation}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#65676B] text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            title="添加位置"
          >
            <MapPin size={15} strokeWidth={1.8} />
            <span>位置</span>
          </button>

          {/* 待办清单按钮 */}
          <button
            type="button"
            onClick={handleAddTodo}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#65676B] text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            title="待办清单"
          >
            <CheckSquare size={15} strokeWidth={1.8} />
            <span>待办</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
