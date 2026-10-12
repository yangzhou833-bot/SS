import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Trash2, 
  Edit3, 
  Share2, 
  Sparkles, 
  Check, 
  Clock, 
  Camera, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Calendar,
  Image as ImageIcon,
  RotateCcw,
  Send,
  Film,
  Play,
  Layers,
  MessageCircle
} from 'lucide-react';
import { CustomMapMarker, CustomMarkerPhoto } from '../types';

interface CustomMarkerDetailCardProps {
  marker: CustomMapMarker | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (updated: CustomMapMarker) => void;
  onNavigate: (marker: CustomMapMarker) => void;
  onShare?: (marker: CustomMapMarker) => void;
}

const PRESET_NEW_PHOTOS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800'
];

export const CustomMarkerDetailCard: React.FC<CustomMarkerDetailCardProps> = ({
  marker,
  onClose,
  onDelete,
  onUpdate,
  onNavigate,
  onShare,
}) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'details' | 'timeline' | 'architecture'>('photos');
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  // Photo / Video Capture & Multi-batching states
  const [showAddPhotoSheet, setShowAddPhotoSheet] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<Array<{ url: string; isVideo?: boolean }>>([]);
  const [batchCaption, setBatchCaption] = useState('');
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Viewing Lightbox State
  const [viewingPhoto, setViewingPhoto] = useState<CustomMarkerPhoto | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoWallRef = useRef<HTMLDivElement | null>(null);

  // Reset internal states cleanly whenever marker changes
  useEffect(() => {
    if (marker) {
      setTitle(marker.title || '');
      setNote(marker.note || '');
      setIsEditing(false);
      setShowAddPhotoSheet(false);
      setPendingPhotos([]);
      setBatchCaption('');
      setViewingPhoto(null);
      setActiveTab('photos');
    }
  }, [marker?.id]);

  if (!marker) return null;

  // Sorted timeline photos (newest first)
  const photos = [...(marker.photos || [])].sort((a, b) => b.timestamp - a.timestamp);

  const handleSaveEdit = () => {
    onUpdate({
      ...marker,
      title: title.trim() || marker.title,
      note: note.trim() || undefined,
    });
    setIsEditing(false);
  };

  // Add multiple files via file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const isVideo = file.type.startsWith('video');
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setPendingPhotos((prev) => [...prev, { url: reader.result as string, isVideo }]);
          }
        };
        reader.readAsDataURL(file);
      });
      // reset file input
      e.target.value = '';
    }
  };

  const handleAddPresetPhoto = (url: string) => {
    setPendingPhotos((prev) => [...prev, { url, isVideo: false }]);
  };

  const handleRemovePendingPhoto = (index: number) => {
    setPendingPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (activePreviewIndex >= next.length) {
        setActivePreviewIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const handleRetakePhotos = () => {
    setPendingPhotos([]);
    setBatchCaption('');
    setActivePreviewIndex(0);
    // trigger file picker again for immediate retake
    fileInputRef.current?.click();
  };

  const handleConfirmSendBatch = () => {
    if (pendingPhotos.length === 0) return;

    const now = Date.now();
    const newItems: CustomMarkerPhoto[] = pendingPhotos.map((item, idx) => ({
      id: `p-${now}-${idx}`,
      url: item.url,
      timestamp: now + idx,
      timeString: '刚刚',
      caption: batchCaption.trim() || (idx === 0 ? '打卡留念，记录美好瞬间 ✨' : undefined),
      authorName: '我 (Alexia)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      isVideo: item.isVideo,
    }));

    const updatedPhotos = [...newItems, ...(marker.photos || [])];
    onUpdate({
      ...marker,
      photos: updatedPhotos,
    });

    setPendingPhotos([]);
    setBatchCaption('');
    setShowAddPhotoSheet(false);
  };

  const handleDeletePhoto = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedPhotos = (marker.photos || []).filter((p) => p.id !== photoId);
    onUpdate({
      ...marker,
      photos: updatedPhotos.length > 0 ? updatedPhotos : undefined,
    });
    if (viewingPhoto?.id === photoId) {
      setViewingPhoto(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center select-none pointer-events-none p-0">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/35 pointer-events-auto backdrop-blur-[1.5px]"
          onClick={onClose}
        />

        {/* Flat Compact White Card - Reduced Height (1/3 smaller) & Flush to Left/Right Phone Edges */}
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="relative w-full bg-white rounded-t-2xl sm:rounded-t-3xl rounded-b-none shadow-[0_-8px_32px_rgba(0,0,0,0.18)] border-t border-[#E4E6EB] pointer-events-auto z-10 overflow-hidden max-h-[50vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Grab Handle */}
          <div className="pt-2 pb-1 flex justify-center bg-white">
            <div className="w-10 h-1 bg-[#CED0D4] rounded-full" />
          </div>

          {/* TOP CONTENT NAVIGATION BAR (卡片顶部导航按钮，将内容拆分) */}
          <div className="px-3 py-1.5 border-b border-[#E4E6EB] bg-white flex items-center justify-between gap-2">
            {/* Split Navigation Buttons */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar flex-1">
              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md flex items-center space-x-1 transition-all cursor-pointer border shrink-0 ${
                  activeTab === 'photos'
                    ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                    : 'bg-[#F0F2F5] text-[#65676B] border-transparent hover:border-[#CCD0D5] hover:text-[#050505]'
                }`}
              >
                <Camera size={12} className={activeTab === 'photos' ? 'text-white' : 'text-[#1877F2]'} />
                <span>时光相册</span>
                <span className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
                  activeTab === 'photos' ? 'bg-white/20 text-white' : 'bg-white text-[#1877F2]'
                }`}>
                  {photos.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md flex items-center space-x-1 transition-all cursor-pointer border shrink-0 ${
                  activeTab === 'details'
                    ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                    : 'bg-[#F0F2F5] text-[#65676B] border-transparent hover:border-[#CCD0D5] hover:text-[#050505]'
                }`}
              >
                <MapPin size={12} className={activeTab === 'details' ? 'text-white' : 'text-[#1877F2]'} />
                <span>地点详情</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('timeline')}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md flex items-center space-x-1 transition-all cursor-pointer border shrink-0 ${
                  activeTab === 'timeline'
                    ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                    : 'bg-[#F0F2F5] text-[#65676B] border-transparent hover:border-[#CCD0D5] hover:text-[#050505]'
                }`}
              >
                <Clock size={12} className={activeTab === 'timeline' ? 'text-white' : 'text-[#1877F2]'} />
                <span>历史足迹</span>
                <span className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
                  activeTab === 'timeline' ? 'bg-white/20 text-white' : 'bg-white text-[#65676B]'
                }`}>
                  {photos.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('architecture')}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md flex items-center space-x-1 transition-all cursor-pointer border shrink-0 ${
                  activeTab === 'architecture'
                    ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                    : 'bg-[#F0F2F5] text-[#65676B] border-transparent hover:border-[#CCD0D5] hover:text-[#050505]'
                }`}
              >
                <Layers size={12} className={activeTab === 'architecture' ? 'text-white' : 'text-[#1877F2]'} />
                <span>核心功能与架构</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="关闭卡片"
            >
              <X size={14} />
            </button>
          </div>

          {/* MAIN TAB CONTENT AREA (根据顶部导航拆分后的精简视图) */}
          <div className="flex-1 overflow-y-auto px-3.5 py-2.5 bg-white space-y-2 custom-scrollbar">
            {/* TAB 1: 时光相册与记录墙 */}
            {activeTab === 'photos' && (
              <div className="space-y-2">
                {/* Life Layer Coordinate Callout Banner */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveTab('architecture')}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveTab('architecture')}
                  className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-[#1877F2]/30 rounded-lg flex items-center justify-between cursor-pointer hover:border-[#1877F2] transition-colors"
                >
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#1877F2] shrink-0" />
                    <span className="text-[11px] font-bold text-[#1C1E21] truncate">
                      生活图层 (Life Layer) 专属坐标 · 核心功能与架构已就绪
                    </span>
                  </div>
                  <span className="text-[10px] text-[#1877F2] font-bold shrink-0 ml-1">查看5大规范 &gt;</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11.5px] font-black text-[#050505]">
                      {marker.title} · 打卡相册
                    </span>
                    <span className="text-[9.5px] font-bold text-[#1877F2] bg-blue-50 px-1.5 py-0.2 rounded-md">
                      {photos.length} 张记录
                    </span>
                  </div>

                  <button
                    id="open-camera-flow-btn"
                    onClick={() => {
                      setPendingPhotos([]);
                      setShowAddPhotoSheet(true);
                    }}
                    className="px-2.5 py-1 bg-[#1877F2] hover:bg-[#166FE5] active:scale-95 text-white font-extrabold text-[10.5px] rounded-md flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus size={11} strokeWidth={2.5} />
                    <span>拍照 / 上传</span>
                  </button>
                </div>

                {/* Horizontal Photo Strip / Wall */}
                {photos.length > 0 ? (
                  <div 
                    ref={photoWallRef}
                    className="flex space-x-2 overflow-x-auto py-1 snap-x scrollbar-none"
                  >
                    {photos.map((photo) => (
                      <div
                        key={`wall-photo-${photo.id}`}
                        onClick={() => setViewingPhoto(photo)}
                        className="group relative shrink-0 w-24 h-24 sm:w-26 sm:h-26 rounded-md overflow-hidden bg-gray-100 border border-[#E4E6EB] shadow-2xs snap-start cursor-pointer transition-transform duration-150 hover:scale-102"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Marker photo'}
                          className="w-full h-full object-cover"
                        />

                        {/* Video Play Badge */}
                        {photo.isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                            <div className="w-6 h-6 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md">
                              <Play size={11} className="fill-black ml-0.5" />
                            </div>
                          </div>
                        )}

                        {/* Floating timestamp pill */}
                        <div className="absolute bottom-1 left-1 right-1 bg-black/65 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm truncate flex items-center justify-between">
                          <span className="truncate">{photo.timeString}</span>
                          {photo.caption && <span className="opacity-80 ml-0.5">💬</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setPendingPhotos([]);
                      setShowAddPhotoSheet(true);
                    }}
                    className="py-4 px-3 bg-[#F7F8FA] border border-dashed border-[#CCD0D5] hover:border-[#1877F2] rounded-md flex items-center justify-center space-x-2.5 cursor-pointer transition-all hover:bg-blue-50/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center">
                      <Camera size={16} />
                    </div>
                    <div className="text-left">
                      <span className="text-[11.5px] font-bold text-[#050505] block">暂无打卡照片</span>
                      <span className="text-[10px] text-[#65676B] block">点击即刻拍照或添加多张，同步至好友时间轴</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: 地点详情与备注 */}
            {activeTab === 'details' && (
              <div className="space-y-2.5">
                <div className="flex items-start space-x-2.5">
                  {/* Large Emoji Badge */}
                  <div className="w-10 h-10 rounded-md bg-[#F0F7FF] border border-[#1877F2]/20 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                    <span className="leading-none">{marker.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    {isEditing ? (
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-xs font-black text-[#050505] bg-gray-50 border border-[#1877F2] rounded-md px-2 py-1 focus:outline-hidden"
                        placeholder="输入标记名称..."
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-xs sm:text-sm font-black text-[#050505] truncate">
                          {marker.title}
                        </h3>
                        <span className="text-[9px] font-bold text-[#1877F2] bg-[#E7F3FF] px-1.5 py-0.2 rounded-md shrink-0">
                          生活图层 · 坐标
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1 text-[10.5px] text-[#65676B] truncate">
                      <MapPin size={11} className="text-rose-500 shrink-0" />
                      <span className="truncate">{marker.address || '兰州市城关区东方红广场南侧·步行街12号'}</span>
                      <span className="text-gray-300">·</span>
                      <span className="shrink-0">{marker.timeString || '刚刚'}</span>
                    </div>
                  </div>
                </div>

                {/* Metric Summary (到访与驻留) */}
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="bg-[#F7F8FA] border border-[#E4E6EB] p-2 rounded-lg text-center">
                    <div className="text-[9.5px] text-[#65676B]">到访次数</div>
                    <div className="text-xs font-black text-[#1877F2] mt-0.5 font-mono">{photos.length + 3} 次</div>
                  </div>
                  <div className="bg-[#F7F8FA] border border-[#E4E6EB] p-2 rounded-lg text-center">
                    <div className="text-[9.5px] text-[#65676B]">累计驻留</div>
                    <div className="text-xs font-black text-[#1C1E21] mt-0.5 font-mono">3.8 小时</div>
                  </div>
                  <div className="bg-[#F7F8FA] border border-[#E4E6EB] p-2 rounded-lg text-center">
                    <div className="text-[9.5px] text-[#65676B]">好友相遇</div>
                    <div className="text-xs font-black text-amber-600 mt-0.5 font-mono">2 位好友</div>
                  </div>
                </div>

                {/* Note / Mood Memo */}
                {isEditing ? (
                  <div className="space-y-1">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="编辑备注或心情..."
                      rows={2}
                      className="w-full text-[11px] text-[#050505] bg-gray-50 border border-[#E4E6EB] rounded-md p-2 focus:outline-hidden focus:border-[#1877F2]"
                    />
                  </div>
                ) : marker.note ? (
                  <div className="bg-[#FAF8F5] p-2.5 rounded-md border border-[#E8DFD3] text-[11px] text-[#4E3E2C] leading-relaxed">
                    💭 "{marker.note}"
                  </div>
                ) : (
                  <div className="bg-[#F7F8FA] p-2.5 rounded-md border border-[#E4E6EB] text-[11px] text-[#8A8D91] italic">
                    暂无文字备注，可点击下方「编辑」进行添加。
                  </div>
                )}

                {/* Jump to 5 Architecture Features */}
                <button
                  type="button"
                  onClick={() => setActiveTab('architecture')}
                  className="w-full py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-[#1877F2] font-bold text-[10.5px] rounded-md border border-blue-200 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <Layers size={12} />
                    <span>查看生活图层 5 大核心功能与架构实现</span>
                  </span>
                  <span>&gt;</span>
                </button>
              </div>
            )}

            {/* TAB 3: 历史足迹时间轴 */}
            {activeTab === 'timeline' && (
              <div className="space-y-1.5">
                <div className="text-[10.5px] font-extrabold text-[#65676B] flex items-center space-x-1">
                  <Clock size={11} className="text-[#1877F2]" />
                  <span>历史打卡足迹记录</span>
                </div>

                {photos.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-0.5 custom-scrollbar">
                    {photos.map((photo) => (
                      <div
                        key={`timeline-photo-${photo.id}`}
                        onClick={() => setViewingPhoto(photo)}
                        className="flex items-center space-x-2 p-1.5 rounded-md bg-[#F7F8FA] hover:bg-[#F0F2F5] border border-[#E4E6EB] transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 bg-gray-100 relative border border-[#E4E6EB]">
                          <img src={photo.url} alt="Thumb" className="w-full h-full object-cover" />
                          {photo.isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play size={10} className="fill-white text-white shrink-0" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#050505] truncate">
                              {photo.authorName || 'Alexia (我)'}
                            </span>
                            <span className="text-[9px] text-[#65676B]">
                              {photo.timeString}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#65676B] truncate mt-0.5">
                            {photo.caption || '打卡留念'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-[10.5px] text-[#65676B] bg-[#F7F8FA] rounded-md border border-[#E4E6EB]">
                    暂无足迹记录
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: 核心功能与架构实现 */}
            {activeTab === 'architecture' && (
              <div className="space-y-2.5 pb-2">
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers size={14} className="text-[#1877F2]" />
                    <span className="text-[11.5px] font-black text-[#1C1E21]">生活图层核心功能与架构实现</span>
                  </div>
                  <span className="text-[9.5px] font-bold text-[#1877F2] bg-white px-1.5 py-0.5 rounded border border-blue-200">
                    5大子系统
                  </span>
                </div>

                {/* 1. 生活图层与地点图标 */}
                <div className="p-2.5 bg-[#F7F8FA] border border-[#E4E6EB] rounded-lg space-y-1.5 text-[11px]">
                  <div className="font-bold text-[#1C1E21] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                    <span>生活图层与地点图标 (Life Layer Place Icons)</span>
                  </div>
                  <ul className="text-[#65676B] pl-4 list-disc space-y-0.5 text-[10.5px]">
                    <li><b>图层整合</b>：在地图图层控制器与底部快捷栏中新增生活图层（life_layer / places）。</li>
                    <li><b>直角线框与分类图钉</b>：各类生活地点具备独立专属色彩（如咖啡馆 #F2A65A、私房美食 #EF8837、隐秘据点 #A855F7、观景台 #10B981、音乐黑胶 #EC4899 等）。图钉展示分类 Emoji、创建者微缩头像及名称距离铭牌。</li>
                    <li><b>两段式点击交互</b>：初次轻触平滑居中弹出悬浮铭牌（FloatingPlaceNameplate），再次点击展开全屏式地点记忆卡（PlaceMemoryCard）。</li>
                  </ul>
                </div>

                {/* 2. 地点记忆卡 */}
                <div className="p-2.5 bg-[#F7F8FA] border border-[#E4E6EB] rounded-lg space-y-1.5 text-[11px]">
                  <div className="font-bold text-[#1C1E21] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                    <span>地点记忆卡 (Place-Memory Card)</span>
                  </div>
                  <ul className="text-[#65676B] pl-4 list-disc space-y-0.5 text-[10.5px]">
                    <li><b>头部与概览</b>：包含地点分类图标、名称、坐标距离、自定义标签与创建者信息。</li>
                    <li><b>三大核心量化指标</b>：总到访次数、累计驻留时长、过去 8 周到访频次火花趋势图（Sparkline）。</li>
                    <li><b>好友共存相遇时光</b>：记录与哪位好友曾在此处时空重合相遇（如与薛梦 3 次共处 185 分钟），展示重叠时长、亲密度标签与相遇详情。</li>
                    <li><b>记忆时间轴与照片墙</b>：垂直时间轴记录历史每次到访的具体日期、到达/离开时刻、驻留分钟与心情 Emoji；支持多图相册预览与个性感悟备忘。</li>
                    <li><b>底部行动控制台</b>：支持一键导航、地点转发分享、发起聚会与编辑/管理地点。</li>
                  </ul>
                </div>

                {/* 3. 地点转发与导入 */}
                <div className="p-2.5 bg-[#F7F8FA] border border-[#E4E6EB] rounded-lg space-y-1.5 text-[11px]">
                  <div className="font-bold text-[#1C1E21] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white text-[10px] font-bold flex items-center justify-center">3</span>
                    <span>地点转发与导入 (Place Forward Sheet)</span>
                  </div>
                  <ul className="text-[#65676B] pl-4 list-disc space-y-0.5 text-[10.5px]">
                    <li><b>多选好友与搜索</b>：支持一键勾选多位好友进行转发。</li>
                    <li><b>精细化隐私分享范围</b>：可自由勾选是否同步共享到访记录、照片相册、好友相遇记录与私密备注。</li>
                    <li><b>双重发送模式</b>：单次发送至私聊（以卡片消息形式发送）；同步添加到对方生活图层（直接写入对方生活地图）。</li>
                  </ul>
                </div>

                {/* 4. 创建与编辑地点 */}
                <div className="p-2.5 bg-[#F7F8FA] border border-[#E4E6EB] rounded-lg space-y-1.5 text-[11px]">
                  <div className="font-bold text-[#1C1E21] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white text-[10px] font-bold flex items-center justify-center">4</span>
                    <span>创建与编辑地点 (Create / Edit Life Place)</span>
                  </div>
                  <ul className="text-[#65676B] pl-4 list-disc space-y-0.5 text-[10.5px]">
                    <li><b>快捷创建入口</b>：支持在地图筛选栏一键点击「新增地点」或长按地图选点创建。</li>
                    <li><b>丰富配置项</b>：名称、分类挑选、自定义标签、初始到访打卡记录、心情 Emoji 与照片上传。</li>
                  </ul>
                </div>

                {/* 5. 顶部图层筛选栏 */}
                <div className="p-2.5 bg-[#F7F8FA] border border-[#E4E6EB] rounded-lg space-y-1.5 text-[11px]">
                  <div className="font-bold text-[#1C1E21] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white text-[10px] font-bold flex items-center justify-center">5</span>
                    <span>顶部图层筛选栏 (Life Layer Filter Bar)</span>
                  </div>
                  <ul className="text-[#65676B] pl-4 list-disc space-y-0.5 text-[10.5px]">
                    <li><b>分类快速过滤</b>：支持分类快速过滤（全部 / 咖啡 / 美食 / 自然 / 观景 / 据点 / 音乐 / 运动等）。</li>
                    <li><b>创建者维度切换</b>：支持全部地点 / 我创建的 / 好友分享的切换。</li>
                    <li><b>社交共存快速过滤</b>：支持「仅看与好友相遇共存地点」一键快速过滤。</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM ACTION BAR (Facebook 蓝白经典操作条) */}
          <div className="p-2.5 border-t border-[#E4E6EB] bg-white flex items-center space-x-1.5">
            {isEditing ? (
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold rounded-md text-xs flex items-center justify-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Check size={13} strokeWidth={2.5} />
                <span>保存修改</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate(marker)}
                  className="flex-1 py-2 bg-[#1877F2] hover:bg-[#166FE5] active:scale-98 text-white font-extrabold rounded-md text-xs flex items-center justify-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Navigation size={12} className="fill-white" />
                  <span>导航路线</span>
                </button>

                <button
                  onClick={() => {
                    setPendingPhotos([]);
                    setShowAddPhotoSheet(true);
                  }}
                  className="py-2 px-2.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-98 text-[#050505] font-bold rounded-md text-xs flex items-center space-x-1 transition-all cursor-pointer border border-[#E4E6EB]"
                >
                  <Camera size={12} className="text-[#1877F2]" />
                  <span>拍照</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('details');
                    setIsEditing(true);
                  }}
                  className="py-2 px-2.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-98 text-[#050505] font-bold rounded-md text-xs flex items-center space-x-1 transition-all cursor-pointer border border-[#E4E6EB]"
                  title="编辑标题与备注"
                >
                  <Edit3 size={12} />
                  <span>编辑</span>
                </button>

                {onShare && (
                  <button
                    onClick={() => onShare(marker)}
                    className="py-2 px-2.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-98 text-[#050505] font-bold rounded-md text-xs flex items-center space-x-1 transition-all cursor-pointer border border-[#E4E6EB]"
                    title="分享给好友"
                  >
                    <Share2 size={12} />
                  </button>
                )}

                <button
                  onClick={() => onDelete(marker.id)}
                  className="py-2 px-2.5 bg-rose-50 hover:bg-rose-100 active:scale-98 text-rose-600 font-bold rounded-md text-xs flex items-center space-x-1 transition-all cursor-pointer border border-rose-200"
                  title="删除该标记"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* 4. CAMERA & MULTI-PHOTO BATCH CAPTURE MODAL (拍照完成预览 + 重拍 + 连续添加+ + 确认发送) */}
        {showAddPhotoSheet && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs pointer-events-auto select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl border border-gray-100 space-y-3"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center">
                    <Camera size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#050505]">
                      {pendingPhotos.length > 0 ? `已拍摄 ${pendingPhotos.length} 张照片` : '拍摄或添加照片'}
                    </h4>
                    <p className="text-[10px] text-[#65676B]">连续添加并发送至好友时间轴</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddPhotoSheet(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Hidden File Input (supports multiple & camera) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* PREVIEW OF CAPTURED PHOTOS WITH + BUTTON */}
              {pendingPhotos.length > 0 ? (
                <div className="space-y-2.5">
                  {/* Big Active Preview */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-inner">
                    {pendingPhotos[activePreviewIndex]?.isVideo ? (
                      <video
                        src={pendingPhotos[activePreviewIndex]?.url}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img 
                        src={pendingPhotos[activePreviewIndex]?.url} 
                        alt="Captured preview" 
                        className="w-full h-full object-contain"
                      />
                    )}
                    <button
                      onClick={() => handleRemovePendingPhoto(activePreviewIndex)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center shadow-md cursor-pointer transition-colors z-10"
                      title="移除此张"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {/* Horizontal Thumbnails Strip with "+" Button for Continuous Adding */}
                  <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
                    {pendingPhotos.map((item, idx) => (
                      <button
                        key={`pending-photo-${idx}`}
                        onClick={() => setActivePreviewIndex(idx)}
                        className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activePreviewIndex === idx ? 'border-[#1877F2] scale-105 shadow-sm' : 'border-transparent opacity-70'
                        }`}
                      >
                        <img src={item.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] px-1 rounded-sm">
                          {idx + 1}
                        </span>
                      </button>
                    ))}

                    {/* Continuous "+" Add Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-12 h-12 rounded-xl border-2 border-dashed border-[#1877F2] hover:bg-blue-50 text-[#1877F2] shrink-0 flex flex-col items-center justify-center cursor-pointer transition-colors"
                      title="继续添加照片"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      <span className="text-[8.5px] font-extrabold mt-0.5">加一张</span>
                    </button>
                  </div>

                  {/* Caption Input */}
                  <input
                    type="text"
                    value={batchCaption}
                    onChange={(e) => setBatchCaption(e.target.value)}
                    placeholder="写下这组照片的心情或打卡备注..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#050505] focus:outline-hidden focus:border-[#1877F2]"
                  />

                  {/* Action Buttons: 重拍 & 确认发送 */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleRetakePhotos}
                      className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-98 text-xs font-extrabold text-gray-700 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>重拍</span>
                    </button>

                    <button
                      onClick={handleConfirmSendBatch}
                      className="py-2.5 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] active:scale-98 text-xs font-extrabold text-white flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                    >
                      <Send size={13} />
                      <span>确认发送 ({pendingPhotos.length})</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Camera / Album Trigger Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center py-6 px-4 bg-[#F8F9FA] hover:bg-blue-50/50 border-2 border-dashed border-gray-300 hover:border-[#1877F2] rounded-2xl cursor-pointer transition-all"
                  >
                    <div className="w-11 h-11 rounded-full bg-white text-[#1877F2] flex items-center justify-center shadow-xs mb-1.5">
                      <Camera size={22} />
                    </div>
                    <span className="text-xs font-extrabold text-[#1877F2]">点击拍摄 / 从手机相册选取</span>
                    <span className="text-[10px] text-[#65676B] mt-0.5">支持连拍多张照片或短视频</span>
                  </div>

                  {/* Quick Preset Snaps */}
                  <div className="space-y-1.5">
                    <span className="text-[10.5px] font-extrabold text-gray-500">或选择精选实景样张连续添加：</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PRESET_NEW_PHOTOS.slice(0, 6).map((url, idx) => (
                        <button
                          key={`preset-photo-${idx}`}
                          onClick={() => handleAddPresetPhoto(url)}
                          className="h-16 rounded-xl overflow-hidden border-2 border-transparent hover:border-[#1877F2] active:scale-95 transition-all cursor-pointer relative group"
                        >
                          <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Plus size={16} strokeWidth={3} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* 5. FULLSCREEN PHOTO LIGHTBOX VIEWER */}
        {viewingPhoto && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-4 pointer-events-auto backdrop-blur-md select-none">
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white pt-2 px-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/40">
                  <img
                    src={viewingPhoto.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt="Author"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{viewingPhoto.authorName || 'Alexia (我)'}</h4>
                  <p className="text-[10px] text-white/70">{viewingPhoto.timeString}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleDeletePhoto(viewingPhoto.id, e)}
                  className="p-2 rounded-full bg-white/10 hover:bg-rose-500/80 text-white transition-colors cursor-pointer"
                  title="删除该照片"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setViewingPhoto(null)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Photo / Video Center */}
            <div className="flex-1 flex items-center justify-center p-2">
              {viewingPhoto.isVideo ? (
                <video
                  src={viewingPhoto.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
                />
              ) : (
                <img
                  src={viewingPhoto.url}
                  alt={viewingPhoto.caption || 'Fullscreen photo'}
                  className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
                />
              )}
            </div>

            {/* Bottom Caption & Location */}
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-3 text-white max-w-md mx-auto w-full border border-white/10 space-y-1">
              <p className="text-xs font-medium leading-relaxed">
                {viewingPhoto.caption || '未填写描述'}
              </p>
              <div className="flex items-center space-x-1 text-[10px] text-white/60">
                <MapPin size={10} className="text-rose-400" />
                <span>{marker.title} · {marker.address}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
