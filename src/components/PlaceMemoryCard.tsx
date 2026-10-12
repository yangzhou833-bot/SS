import React, { useState } from 'react';
import {
  LifePlace,
  LifePlaceEncounterFriend,
  LifePlaceVisit,
} from '../types';
import {
  formatDurationHoursMins,
  getRelativeCreationTime,
  lifeLayerStore,
  LIFE_PLACE_CATEGORIES,
} from '../data/lifeLayerStore';
import {
  X,
  MapPin,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  Navigation,
  Sparkles,
  Users,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  MoreVertical,
  Check,
  Flame,
  Award,
  Shield,
  Heart,
  ExternalLink,
  Camera,
  MessageSquare,
  Smile,
  Compass,
  ArrowRight,
  TrendingUp,
  Sliders,
  Layers,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';
import { UnifiedShareButton } from './common/UnifiedShareButton';

interface PlaceMemoryCardProps {
  place: LifePlace;
  onClose: () => void;
  onNavigate?: (place: LifePlace) => void;
  onForward?: (place: LifePlace) => void;
  onShareLifePlace?: (place: LifePlace) => void;
  onPlanMeetup?: (place: LifePlace) => void;
  onEditPlace?: (place: LifePlace) => void;
  showToast?: (msg: string) => void;
}

export const PlaceMemoryCard: React.FC<PlaceMemoryCardProps> = ({
  place,
  onClose,
  onNavigate,
  onForward,
  onShareLifePlace,
  onPlanMeetup,
  onEditPlace,
  showToast,
}) => {
  const [currentPlace, setCurrentPlace] = useState<LifePlace>(place);
  const [activeTab, setActiveTab] = useState<'memory' | 'architecture' | 'encounters' | 'timeline'>('memory');
  const [selectedEncounterFriend, setSelectedEncounterFriend] = useState<LifePlaceEncounterFriend | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(currentPlace.note || '');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
  const [newVisitMinutes, setNewVisitMinutes] = useState(45);
  const [newVisitMood, setNewVisitMood] = useState('😄');
  const [newVisitNote, setNewVisitNote] = useState('');

  // Handle Share Life Place
  const handleShare = () => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    if (onShareLifePlace) {
      onShareLifePlace(currentPlace);
    } else if (onForward) {
      onForward(currentPlace);
    }
  };

  // Handle Save / Bookmark
  const handleToggleSave = () => {
    const nextSaved = lifeLayerStore.toggleSavePlace(currentPlace.id);
    setCurrentPlace((prev) => ({ ...prev, isSaved: nextSaved }));
    haptics.trigger('light');
    soundEffects.playTapSound();
    if (showToast) {
      showToast(nextSaved ? `⭐️ 已收藏地点「${currentPlace.name}」` : `已取消收藏「${currentPlace.name}」`);
    }
  };

  // Handle Save Note
  const handleSaveNote = () => {
    const updated = lifeLayerStore.updatePlace(currentPlace.id, { note: noteText });
    if (updated) setCurrentPlace(updated);
    setIsEditingNote(false);
    haptics.trigger('light');
    soundEffects.playSuccessSound();
    if (showToast) showToast('📝 地点心绪笔记已更新');
  };

  // Handle Add Visit
  const handleAddManualVisit = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const arrivalStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    lifeLayerStore.addVisit(currentPlace.id, {
      date: dateStr,
      arrival: arrivalStr,
      departure: null,
      minutes: newVisitMinutes,
      mood: newVisitMood,
      note: newVisitNote.trim() || undefined,
    });

    const refreshed = lifeLayerStore.getPlaceById(currentPlace.id);
    if (refreshed) setCurrentPlace(refreshed);

    setIsAddVisitModalOpen(false);
    setNewVisitNote('');
    haptics.trigger('medium');
    soundEffects.playSuccessSound();
    if (showToast) showToast(`✨ 已成功记录本次打卡（+${newVisitMinutes}分钟）！`);
  };

  // Handle Delete Place
  const handleDeletePlace = () => {
    if (confirm(`确定要从生活图层中删除地点「${currentPlace.name}」吗？`)) {
      lifeLayerStore.deletePlace(currentPlace.id);
      haptics.trigger('medium');
      if (showToast) showToast(`已删除地点「${currentPlace.name}」`);
      onClose();
    }
  };

  const categoryMeta = LIFE_PLACE_CATEGORIES.find((c) => c.key === currentPlace.category) || LIFE_PLACE_CATEGORIES[0];
  const relativeCreation = getRelativeCreationTime(currentPlace.createdAt);

  return (
    <div className="fixed inset-0 z-[160] flex flex-col justify-end pointer-events-none select-none font-sans">
      {/* Scrim Overlay */}
      <div
        role="button"
        tabIndex={0}
        aria-label="关闭地点记忆卡"
        onClick={() => {
          haptics.trigger('light');
          onClose();
        }}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto transition-opacity duration-300 animate-in fade-in"
      />

      {/* Main Drawer Bottom Sheet */}
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-t-2xl shadow-2xl border-t border-[#E4E6EB] pointer-events-auto max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 ease-out">
        {/* Drag Handle & Top Controls */}
        <div className="pt-2.5 pb-1 flex flex-col items-center shrink-0 border-b border-[#F0F2F5] relative bg-white">
          <div className="w-10 h-1 rounded-full bg-[#CED0D4] mb-1.5" />
          
          <div className="w-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentPlace.color }}
              />
              <span className="text-[11px] font-bold text-[#65676B] tracking-wider uppercase">
                Stellar · 生活图层地点记忆
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleToggleSave}
                className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                  currentPlace.isSaved
                    ? 'bg-amber-50 text-amber-500 border-amber-300'
                    : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] border-[#E4E6EB]'
                }`}
                title={currentPlace.isSaved ? '已收藏' : '收藏地点'}
              >
                <Bookmark size={15} className={currentPlace.isSaved ? 'fill-amber-500' : ''} />
              </button>

              <UnifiedShareButton
                onClick={handleShare}
                showLabel={false}
                size={15}
                variant="icon-only"
                title="转发与分享给好友"
                className="p-1.5 rounded-md bg-[#F0F2F5] hover:bg-[#EBF7EE] text-[#31A24C] border border-[#E4E6EB]"
              />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="p-1.5 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] border border-[#E4E6EB] cursor-pointer transition-colors"
                  title="更多设置"
                >
                  <MoreVertical size={15} />
                </button>

                {/* More Dropdown Menu */}
                {isMoreMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E4E6EB] rounded-md shadow-lg py-1 z-50 animate-in fade-in zoom-in-95">
                    {onEditPlace && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          onEditPlace(currentPlace);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium text-[#1C1E21] hover:bg-[#F0F2F5] flex items-center gap-2 cursor-pointer"
                      >
                        <Edit3 size={13} className="text-[#1877F2]" />
                        <span>编辑地点与分类</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setIsAddVisitModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-[#1C1E21] hover:bg-[#F0F2F5] flex items-center gap-2 cursor-pointer"
                    >
                      <Plus size={13} className="text-emerald-600" />
                      <span>补录今日打卡</span>
                    </button>
                    <div className="my-1 border-t border-[#F0F2F5]" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        handleDeletePlace();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>删除地点</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  haptics.trigger('light');
                  onClose();
                }}
                className="p-1.5 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] border border-[#E4E6EB] cursor-pointer ml-1"
                title="关闭"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          
          {/* 4.1 Header (Fixed details) */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {/* Large Category Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-xs border border-black/5"
                  style={{ backgroundColor: `${currentPlace.color}25` }}
                >
                  <span>{currentPlace.icon}</span>
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10.5px] font-bold"
                      style={{ backgroundColor: `${currentPlace.color}20`, color: currentPlace.color }}
                    >
                      {categoryMeta.label}
                    </span>
                    <span className="text-[10px] text-[#8A8D91] font-mono">
                      {currentPlace.privacy === 'public' ? '公开地点' : currentPlace.privacy === 'friends_only' ? '仅好友可见' : '仅自己私密'}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-[#1C1E21] leading-snug">
                    {currentPlace.name}
                  </h2>
                </div>
              </div>

              {/* Navigate button */}
              <button
                type="button"
                onClick={() => {
                  haptics.trigger('light');
                  soundEffects.playTapSound();
                  if (onNavigate) onNavigate(currentPlace);
                }}
                className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-md shadow-2xs flex items-center gap-1 cursor-pointer shrink-0 transition-all active:scale-95"
              >
                <Navigation size={13} />
                <span>导航</span>
              </button>
            </div>

            {/* Creator and Distance Row */}
            <div className="flex items-center justify-between text-xs text-[#65676B] bg-[#F7F8FA] px-3 py-2 rounded-md border border-[#E4E6EB]">
              <div className="flex items-center gap-1.5 min-w-0">
                <img
                  src={currentPlace.createdBy.avatar}
                  alt={currentPlace.createdBy.name}
                  className="w-5 h-5 rounded-full object-cover border border-[#E4E6EB] shrink-0"
                />
                <span className="truncate font-medium text-[#1C1E21]">
                  {currentPlace.createdBy.isMe ? '我' : currentPlace.createdBy.name}
                </span>
                <span className="text-[11px] text-[#8A8D91]">
                  创建于 {currentPlace.createdAt.split('T')[0]} ({relativeCreation})
                </span>
              </div>

              <div className="text-right shrink-0 font-mono font-bold text-[#1877F2] text-[11px]">
                {currentPlace.distanceKm !== undefined ? `${currentPlace.distanceKm} km · ${currentPlace.direction}` : ''}
              </div>
            </div>

            {/* User Tags */}
            {currentPlace.tags && currentPlace.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {currentPlace.tags.map((tag, idx) => (
                  <span
                    key={`place-tag-${tag}-${idx}`}
                    className="px-2 py-0.5 bg-[#F0F2F5] text-[#65676B] text-[10.5px] rounded-md font-medium border border-[#E4E6EB]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Navigation Tab Bar */}
            <div className="flex items-center gap-1 bg-[#F0F2F5] p-1 rounded-lg border border-[#E4E6EB] mt-2">
              <button
                type="button"
                onClick={() => {
                  haptics.trigger('selection');
                  setActiveTab('memory');
                }}
                className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'memory'
                    ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                    : 'text-[#65676B] hover:text-[#1C1E21]'
                }`}
              >
                <Flame size={12} />
                <span>记忆总览</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.trigger('selection');
                  setActiveTab('architecture');
                }}
                className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'architecture'
                    ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                    : 'text-[#65676B] hover:text-[#1C1E21]'
                }`}
              >
                <Layers size={12} />
                <span>核心功能与架构</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.trigger('selection');
                  setActiveTab('encounters');
                }}
                className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'encounters'
                    ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                    : 'text-[#65676B] hover:text-[#1C1E21]'
                }`}
              >
                <Sparkles size={12} />
                <span>好友相遇</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.trigger('selection');
                  setActiveTab('timeline');
                }}
                className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'timeline'
                    ? 'bg-white text-[#1877F2] shadow-2xs border border-[#E4E6EB]'
                    : 'text-[#65676B] hover:text-[#1C1E21]'
                }`}
              >
                <Clock size={12} />
                <span>时光时间线</span>
              </button>
            </div>
          </div>

          {/* TAB 1: 记忆总览 (Memory Stats & Photos) */}
          {activeTab === 'memory' && (
            <>
              {/* Quick Architecture Callout Banner */}
              <div 
                role="button"
                tabIndex={0}
                onClick={() => {
                  haptics.trigger('light');
                  setActiveTab('architecture');
                }}
                onKeyDown={(e) => e.key === 'Enter' && setActiveTab('architecture')}
                className="p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-[#1877F2]/30 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#1877F2] transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                    <Layers size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#1C1E21]">生活图层核心功能与架构实现</span>
                      <span className="px-1.5 py-0.2 bg-[#1877F2] text-white text-[9px] font-bold rounded">5大规范</span>
                    </div>
                    <p className="text-[10px] text-[#65676B] truncate mt-0.5">
                      生活图层图钉 · 地点记忆卡 · 转发导入 · 创建编辑 · 图层筛选
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#1877F2] shrink-0" />
              </div>

              {/* 4.2 Memory Stats (Three-Tile Metric Row + 8-Week Sparkline) */}
              <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                    <Flame size={14} className="text-[#1877F2]" />
                    <span>地点记忆总览 (Memory Stats)</span>
                  </h3>
                  <span className="text-[10px] text-[#8A8D91] font-mono">累计记录</span>
                </div>

                {/* 3-Tile Row */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Tile 1: Visits */}
                  <div className="bg-[#F7F8FA] border border-[#E4E6EB] rounded-lg p-2.5 text-center flex flex-col justify-between">
                    <span className="text-[10px] text-[#8A8D91]">打卡频次</span>
                    <div className="my-1">
                      <span className="text-lg font-extrabold text-[#1877F2] font-mono">
                        {currentPlace.memory.visitCount}
                      </span>
                      <span className="text-[11px] font-bold text-[#1C1E21] ml-0.5">次</span>
                    </div>
                    <span className="text-[9.5px] text-[#65676B] truncate">常来打卡地</span>
                  </div>

                  {/* Tile 2: Total Dwell Time */}
                  <div className="bg-[#F7F8FA] border border-[#E4E6EB] rounded-lg p-2.5 text-center flex flex-col justify-between">
                    <span className="text-[10px] text-[#8A8D91]">累计驻留</span>
                    <div className="my-1">
                      <span className="text-sm font-extrabold text-[#1C1E21] font-mono">
                        {formatDurationHoursMins(currentPlace.memory.totalDwellMinutes)}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-[#65676B] truncate">
                      均次 {currentPlace.memory.avgStayMinutes}min
                    </span>
                  </div>

                  {/* Tile 3: First & Last Visit */}
                  <div className="bg-[#F7F8FA] border border-[#E4E6EB] rounded-lg p-2.5 text-center flex flex-col justify-between">
                    <span className="text-[10px] text-[#8A8D91]">初访 / 最近</span>
                    <div className="my-1 text-[11px] font-bold text-[#1C1E21]">
                      {currentPlace.memory.lastVisitAt.split('T')[0].slice(5)}
                    </div>
                    <span className="text-[9.5px] text-[#65676B] truncate">
                      首次 {currentPlace.memory.firstVisitAt.split('T')[0].slice(5)}
                    </span>
                  </div>
                </div>

                {/* 8-Week Sparkline Rhythms */}
                <div className="pt-2 border-t border-[#F0F2F5] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-[#8A8D91]">
                    <span className="flex items-center gap-1 font-medium">
                      <TrendingUp size={11} className="text-[#1877F2]" />
                      <span>近 8 周到访节奏 (Visit Sparkline)</span>
                    </span>
                    <span className="font-mono text-[#1877F2] font-bold">
                      活跃度良好
                    </span>
                  </div>

                  {/* Micro Bar Columns */}
                  <div className="flex items-end justify-between gap-1.5 h-9 pt-1 px-1 bg-[#F7F8FA] rounded-md border border-[#E4E6EB]">
                    {currentPlace.memory.visitSparklineWeeks.map((cnt, idx) => {
                      const maxH = Math.max(...currentPlace.memory.visitSparklineWeeks, 4);
                      const barHeight = Math.max(12, Math.round((cnt / maxH) * 28));
                      return (
                        <div key={`sparkline-col-${idx}`} className="flex-1 flex flex-col items-center gap-0.5 group">
                          <div
                            className={`w-full max-w-[14px] rounded-t-xs transition-all duration-300 ${
                              cnt > 0 ? 'bg-[#1877F2] group-hover:bg-[#166FE5]' : 'bg-[#CED0D4]'
                            }`}
                            style={{ height: `${barHeight}px` }}
                          />
                          <span className="text-[8px] font-mono text-[#8A8D91]">
                            {cnt > 0 ? cnt : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4.5 Photo Wall & Notes */}
              <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                    <Camera size={14} className="text-[#1877F2]" />
                    <span>照片墙与心绪备忘 (Photos & Note)</span>
                  </h3>
                  <span className="text-xs text-amber-600 font-medium">
                    主导心绪 {currentPlace.memory.dominantMood}
                  </span>
                </div>

                {/* Photo Strip */}
                {currentPlace.photos && currentPlace.photos.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {currentPlace.photos.map((photoUrl, idx) => (
                      <div
                        key={`place-photo-${idx}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedPhoto(photoUrl)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedPhoto(photoUrl)}
                        className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0 border border-[#E4E6EB] cursor-pointer group hover:scale-[1.02] transition-transform"
                      >
                        <img
                          src={photoUrl}
                          alt={`地点照片 ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-1">
                          <span className="text-[9px] text-white font-mono">打卡镜头 #{idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Memory Note Quote Card */}
                <div className="bg-[#FAF8F5] border border-[#E8DFD3] rounded-lg p-3 relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10.5px] font-bold text-[#8C6D46] flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>为什么喜欢这里 (Why I Love This Place)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingNote(!isEditingNote)}
                      className="text-[10px] text-[#1877F2] font-bold hover:underline cursor-pointer"
                    >
                      {isEditingNote ? '取消' : '编辑笔记'}
                    </button>
                  </div>

                  {isEditingNote ? (
                    <div className="space-y-2 mt-1">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows={3}
                        className="w-full p-2 text-xs text-[#1C1E21] bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-md outline-none resize-none font-sans"
                        placeholder="写下关于这里的记忆与推荐理由..."
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsEditingNote(false)}
                          className="px-2.5 py-1 text-xs text-[#65676B] bg-[#F0F2F5] rounded-md cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNote}
                          className="px-3 py-1 text-xs font-bold text-white bg-[#1877F2] rounded-md shadow-2xs cursor-pointer"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <blockquote className="text-xs text-[#4E3E2C] italic leading-relaxed">
                      “{currentPlace.note || '点击右上角添加关于此处的专属私人记忆与推荐理由。'}”
                    </blockquote>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: 核心功能与架构实现 (Full 5-Subsystem Architecture View) */}
          {activeTab === 'architecture' && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Architecture Header Banner */}
              <div className="p-3 bg-white border border-[#E4E6EB] rounded-xl shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#1877F2] text-white flex items-center justify-center">
                      <Layers size={14} />
                    </div>
                    <h3 className="text-xs font-bold text-[#1C1E21]">核心功能与架构实现</h3>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-[#1877F2] font-bold px-2 py-0.5 rounded border border-blue-200">
                    5 大核心子系统
                  </span>
                </div>
                <p className="text-[11px] text-[#65676B] leading-relaxed">
                  Stellar 生活图层 (Life Layer) 与地点记忆卡 (Place-Memory Card) 全栈架构设计与功能实现规范：
                </p>
              </div>

              {/* 1. 生活图层与地点图标 (Life Layer Place Icons) */}
              <div className="p-3.5 bg-white border border-[#E4E6EB] rounded-xl shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <h4 className="text-xs font-bold text-[#1C1E21]">
                      生活图层与地点图标 (Life Layer Place Icons)
                    </h4>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    已实现
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#4B4C4F] leading-relaxed">
                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2]" />
                      <span>图层整合：</span>
                    </div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      在地图图层控制器（<code className="text-[#1877F2] bg-white px-1 py-0.2 rounded border border-[#E4E6EB]">MapLayerControlDrawer</code>）与底部快捷栏中新增 <b>生活图层（life_layer / places）</b>。
                    </p>
                  </div>

                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2]" />
                      <span>直角线框与分类图钉：</span>
                    </div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      各类生活地点具备独立专属色彩（如咖啡馆 <span className="font-mono font-bold text-[#F2A65A]">#F2A65A</span>、私房美食 <span className="font-mono font-bold text-[#EF8837]">#EF8837</span>、隐秘据点 <span className="font-mono font-bold text-[#A855F7]">#A855F7</span>、观景台 <span className="font-mono font-bold text-[#10B981]">#10B981</span>、音乐黑胶 <span className="font-mono font-bold text-[#EC4899]">#EC4899</span> 等）。
                    </p>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      图钉展示分类 Emoji、创建者迷你微缩头像，底部悬挂名称与实时距离铭牌。
                    </p>
                  </div>

                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2]" />
                      <span>两段式点击交互 (Tap Sequence)：</span>
                    </div>
                    <ul className="text-[11px] text-[#65676B] pl-4 list-disc space-y-0.5">
                      <li><b>初次轻触</b>：平滑将地图视角居中至图钉，在图钉上方弹出气泡式 <b>悬浮铭牌（FloatingPlaceNameplate）</b>，展示地点名称、创建者头像与相对创建时间（如「3个月前」）。</li>
                      <li><b>再次点击 / 点击铭牌</b>：展开全屏式 <b>地点记忆卡（PlaceMemoryCard）</b> 底部抽屉。</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 2. 地点记忆卡 (Place-Memory Card) */}
              <div className="p-3.5 bg-white border border-[#E4E6EB] rounded-xl shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <h4 className="text-xs font-bold text-[#1C1E21]">
                      地点记忆卡 (Place-Memory Card)
                    </h4>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    已实现
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#4B4C4F] leading-relaxed">
                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 头部与概览：</div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      包含地点分类图标、名称、坐标距离、自定义标签与创建者信息。
                    </p>
                  </div>

                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 三大核心量化指标：</div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      <b>总到访次数</b>、<b>累计驻留时长</b>、<b>过去 8 周到访频次火花趋势图（Sparkline）</b>。
                    </p>
                  </div>

                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 好友共存相遇时光 (Co-presence Encounter)：</div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      记录与哪位好友曾在此处时空重合相遇（如与薛梦 3 次共处 185 分钟）。展示重叠时长、亲密度标签与相遇详情弹窗。
                    </p>
                  </div>

                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 记忆时间轴与照片墙 (Memory Timeline & Photos)：</div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      垂直时间轴记录历史每次到访的具体日期、到达/离开时刻、驻留分钟与心情 Emoji；支持多图相册预览与个性感悟备忘。
                    </p>
                  </div>

                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 底部行动控制台：</div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      支持 <b>一键导航</b>、<b>地点转发分享</b>、<b>发起聚会</b> 与 <b>编辑/管理地点</b>。
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. 地点转发与导入 (Place Forward Sheet) */}
              <div className="p-3.5 bg-white border border-[#E4E6EB] rounded-xl shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white text-[11px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <h4 className="text-xs font-bold text-[#1C1E21]">
                      地点转发与导入 (Place Forward Sheet)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => onForward && onForward(currentPlace)}
                    className="text-[10px] text-[#1877F2] font-bold bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 cursor-pointer"
                  >
                    立即体验转发
                  </button>
                </div>

                <div className="space-y-2 text-xs text-[#4B4C4F] leading-relaxed">
                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 多选好友与搜索：</div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      支持一键勾选多位好友进行转发。
                    </p>
                  </div>

                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 精细化隐私分享范围：</div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      可自由勾选是否同步共享「到访记录」、「照片相册」、「好友相遇记录」与「私密备注」。
                    </p>
                  </div>

                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 双重发送模式：</div>
                    <ul className="text-[11px] text-[#65676B] pl-4 list-disc space-y-0.5">
                      <li><b>单次发送至私聊</b>（以卡片消息形式发送）。</li>
                      <li><b>同步添加到对方生活图层</b>（直接将该地点标记写入对方的生活地图）。</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 4. 创建与编辑地点 (Create / Edit Life Place) */}
              <div className="p-3.5 bg-white border border-[#E4E6EB] rounded-xl shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white text-[11px] font-bold flex items-center justify-center">
                      4
                    </span>
                    <h4 className="text-xs font-bold text-[#1C1E21]">
                      创建与编辑地点 (Create / Edit Life Place)
                    </h4>
                  </div>
                  {onEditPlace && (
                    <button
                      type="button"
                      onClick={() => onEditPlace(currentPlace)}
                      className="text-[10px] text-[#1877F2] font-bold bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 cursor-pointer"
                    >
                      编辑本地点
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs text-[#4B4C4F] leading-relaxed">
                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 快捷创建入口：</div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      支持在地图筛选栏一键点击「新增地点」或长按地图选点创建。
                    </p>
                  </div>

                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 丰富配置项：</div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      名称、分类挑选、自定义标签、初始到访打卡记录、心情 Emoji 与照片上传。
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. 顶部图层筛选栏 (Life Layer Filter Bar) */}
              <div className="p-3.5 bg-white border border-[#E4E6EB] rounded-xl shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white text-[11px] font-bold flex items-center justify-center">
                      5
                    </span>
                    <h4 className="text-xs font-bold text-[#1C1E21]">
                      顶部图层筛选栏 (Life Layer Filter Bar)
                    </h4>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    已实现
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#4B4C4F] leading-relaxed">
                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 分类快速过滤：</div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      支持分类快速过滤（全部 / 咖啡 / 美食 / 自然 / 观景 / 据点 / 音乐 / 运动等）。
                    </p>
                  </div>

                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 创建者维度切换：</div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      支持创建者维度切换（全部地点 / 我创建的 / 好友分享的）。
                    </p>
                  </div>

                  <div className="p-2 bg-[#F7F8FA] rounded-lg border border-[#E4E6EB] space-y-1">
                    <div className="font-bold text-[#1C1E21]">✦ 社交共存快速过滤：</div>
                    <p className="text-[11px] text-[#65676B] pl-2.5">
                      支持「仅看与好友相遇共存地点」一键快速过滤。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 好友相遇 (Encounters) */}
          {activeTab === 'encounters' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* 4.3 Encounter Memory (Co-presence Signature Module) */}
              <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                      <Sparkles size={12} />
                    </div>
                    <h3 className="text-xs font-bold text-[#1C1E21]">
                      共存相遇记忆 (Co-presence Encounter)
                    </h3>
                  </div>
                  <span className="text-[10.5px] font-bold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {currentPlace.encounters.friendCount} 位好友 · {currentPlace.encounters.totalEncounters} 次相遇
                  </span>
                </div>

                {/* Headline summary */}
                <p className="text-xs text-[#65676B] leading-relaxed">
                  你曾在此地与 <b className="text-[#1C1E21]">{currentPlace.encounters.friendCount} 位好友</b> 偶遇或同行，累计共存时空重合 <b className="text-[#1877F2] font-mono">{currentPlace.encounters.totalEncounters} 次</b>。
                </p>

                {/* Friend Encounter Rows */}
                {currentPlace.encounters.friends.length > 0 ? (
                  <div className="space-y-2">
                    {currentPlace.encounters.friends.map((friend) => (
                      <div
                        key={friend.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          haptics.trigger('light');
                          setSelectedEncounterFriend(friend);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedEncounterFriend(friend)}
                        className="p-2.5 rounded-lg bg-[#F7F8FA] hover:bg-[#EDF2F7] border border-[#E4E6EB] flex items-center justify-between gap-2.5 cursor-pointer transition-all active:scale-98 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#E4E6EB]"
                            />
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#1877F2] border border-white flex items-center justify-center text-[8px] font-bold text-white">
                              {friend.encounterCount}
                            </span>
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-[#1C1E21] truncate">
                                {friend.name}
                              </h4>
                              <span className="text-[9px] px-1.5 py-0.2 bg-white rounded border border-[#E4E6EB] text-[#65676B] font-medium">
                                {friend.closeness === 'bff' ? '密友' : friend.closeness === 'family' ? '家人' : '好友'}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-[#65676B] truncate">
                              共相遇 <b className="text-[#1877F2] font-mono">{friend.encounterCount}</b> 次 · 最近 {friend.lastEncounterAt}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[#1877F2] text-xs font-bold shrink-0">
                          <span className="text-[10.5px]">相遇详情</span>
                          <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Empty state */
                  <div className="py-6 px-4 bg-[#F7F8FA] rounded-lg border border-dashed border-[#CED0D4] text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
                      <Sparkles size={16} />
                    </div>
                    <p className="text-xs text-[#65676B]">
                      你尚未在此处与好友相遇过 — 常来这里探索，或邀请朋友一同前往吧。
                    </p>
                    <UnifiedShareButton
                      onClick={handleShare}
                      label="分享给好友"
                      size={12}
                      variant="outline"
                      title="分享给好友"
                    />
                  </div>
                )}
              </div>

              {/* 4.6 Place Visitors (Social Leaderboard & Meetup) */}
              <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                    <Users size={14} className="text-[#1877F2]" />
                    <span>也常来这里的好友 (Visitor Leaderboard)</span>
                  </h3>
                  <span className="text-[10px] text-[#8A8D91]">好友榜</span>
                </div>

                {currentPlace.visitors.friendsWhoVisit.length > 0 ? (
                  <div className="space-y-2">
                    {currentPlace.visitors.friendsWhoVisit.map((visitor, idx) => (
                      <div
                        key={visitor.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#F7F8FA] border border-[#E4E6EB]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-4 text-center font-mono font-bold text-xs text-[#8A8D91]">
                            #{idx + 1}
                          </span>
                          <img
                            src={visitor.avatar}
                            alt={visitor.name}
                            className="w-6 h-6 rounded-full object-cover border border-[#E4E6EB]"
                          />
                          <span className="text-xs font-medium text-[#1C1E21] truncate">
                            {visitor.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold font-mono text-[#1877F2]">
                          {visitor.visitCount} 次到访
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#65676B] text-center py-2">暂无其他好友公开打卡记录</p>
                )}

                {/* Meetup Action Box */}
                <div className="p-3 bg-[#E7F3FF] border border-[#1877F2]/30 rounded-lg flex items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-[#1877F2]">发起此处同城邀约</h4>
                    <p className="text-[10.5px] text-[#65676B] truncate">一键呼叫好友在此碰头或发起探索活动</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.trigger('medium');
                      soundEffects.playSuccessSound();
                      if (onPlanMeetup) onPlanMeetup(currentPlace);
                    }}
                    className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-md shadow-2xs shrink-0 cursor-pointer active:scale-95"
                  >
                    发起活动
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 时光足迹 (Timeline) */}
          {activeTab === 'timeline' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* 4.4 Memory Timeline (Visit Records) */}
              <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                    <Clock size={14} className="text-[#1877F2]" />
                    <span>时光足迹时间线 (Memory Timeline)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddVisitModalOpen(true)}
                    className="text-[10.5px] font-bold text-[#1877F2] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>补录足迹</span>
                  </button>
                </div>

                <div className="relative pl-4 space-y-3 border-l-2 border-[#E4E6EB] ml-2">
                  {currentPlace.memory.visits.map((visit) => (
                    <div key={visit.id} className="relative group">
                      {/* Dot */}
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#1877F2] border-2 border-white shadow-2xs" />

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#1C1E21]">{visit.date}</span>
                            <span className="text-[10.5px] text-[#8A8D91] font-mono">
                              {visit.arrival} {visit.departure ? `- ${visit.departure}` : '(当前在场)'}
                            </span>
                          </div>
                          <span className="text-xs">{visit.mood}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#65676B]">
                          <span className="bg-[#F0F2F5] px-1.5 py-0.2 rounded font-mono text-[10px]">
                            驻留 {visit.minutes} 分钟
                          </span>
                          {visit.note && <span className="truncate">{visit.note}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 4.7 Bottom Action Bar (Fixed) */}
        <div className="p-3 bg-white border-t border-[#E4E6EB] shrink-0 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              haptics.trigger('light');
              soundEffects.playTapSound();
              if (onNavigate) onNavigate(currentPlace);
            }}
            className="flex-1 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-md shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
          >
            <Navigation size={14} />
            <span>路线导航</span>
          </button>

          <UnifiedShareButton
            onClick={handleShare}
            label="转发分享"
            size={14}
            variant="action-bar"
            className="flex-1 py-2 bg-[#F0F2F5] hover:bg-[#EBF7EE] text-[#31A24C] font-bold text-xs rounded-md border border-[#E4E6EB] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
            title="转发分享"
          />

          <button
            type="button"
            onClick={() => setIsAddVisitModalOpen(true)}
            className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] font-bold text-xs rounded-md border border-[#E4E6EB] flex items-center justify-center gap-1 cursor-pointer active:scale-98"
            title="打卡补录"
          >
            <Plus size={14} className="text-emerald-600" />
            <span>打卡</span>
          </button>
        </div>
      </div>

      {/* Encounter Detail Sub-Sheet Modal */}
      {selectedEncounterFriend && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs pointer-events-auto">
          <div className="bg-white border border-[#E4E6EB] rounded-xl max-w-md w-full p-4 space-y-3.5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
              <div className="flex items-center gap-2">
                <img
                  src={selectedEncounterFriend.avatar}
                  alt={selectedEncounterFriend.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#E4E6EB]"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#1C1E21]">
                    与 {selectedEncounterFriend.name} 的相遇详情
                  </h4>
                  <span className="text-[10px] text-[#8A8D91]">
                    共存窗口 30 分钟内自动判定
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEncounterFriend(null)}
                className="p-1 text-[#8A8D91] hover:text-[#1C1E21] rounded-md cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Encounter List */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {selectedEncounterFriend.encounters.map((enc, idx) => (
                <div key={`enc-item-${enc.date}-${idx}`} className="p-3 bg-[#F7F8FA] border border-[#E4E6EB] rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1C1E21]">
                    <span>相遇 #{idx + 1} · {enc.date}</span>
                    <span className="text-[10.5px] font-mono text-[#1877F2]">
                      重合 {enc.overlapMinutes} 分钟
                    </span>
                  </div>

                  {/* Overlap Visual Timeline Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#65676B]">
                      <span>我的驻留：{enc.myStayMinutes}m</span>
                      <span>对方驻留：{enc.theirStayMinutes}m</span>
                    </div>
                    <div className="w-full h-2 bg-[#E4E6EB] rounded-full overflow-hidden flex">
                      <div className="w-1/4 bg-blue-300 h-full" />
                      <div className="w-1/2 bg-[#1877F2] h-full" title="共存重合区间" />
                      <div className="w-1/4 bg-purple-300 h-full" />
                    </div>
                    <div className="flex justify-between text-[9px] text-[#8A8D91] font-mono">
                      <span>{enc.from} 开始</span>
                      <span className="font-bold text-[#1877F2]">时空重合区</span>
                      <span>{enc.to} 离开</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedEncounterFriend(null)}
              className="w-full py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1C1E21] font-bold text-xs rounded-md cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Photo Lightbox Preview */}
      {selectedPhoto && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelectedPhoto(null)}
          onKeyDown={(e) => e.key === 'Escape' && setSelectedPhoto(null)}
          className="fixed inset-0 z-[190] bg-black/85 flex items-center justify-center p-4 cursor-pointer pointer-events-auto"
        >
          <div className="relative max-w-xl max-h-[85vh] rounded-lg overflow-hidden">
            <img src={selectedPhoto} alt="照片全屏预览" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Add Manual Visit Modal */}
      {isAddVisitModalOpen && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs pointer-events-auto">
          <div className="bg-white border border-[#E4E6EB] rounded-xl max-w-sm w-full p-4 space-y-3 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
              <h4 className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                <Clock size={14} className="text-[#1877F2]" />
                <span>补录到访记录 · {currentPlace.name}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddVisitModalOpen(false)}
                className="p-1 text-[#8A8D91] hover:text-[#1C1E21]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-[11px] font-bold text-[#65676B]">
                本次驻留时长 (分钟)：{newVisitMinutes} 分钟
              </label>
              <input
                type="range"
                min="10"
                max="240"
                step="5"
                value={newVisitMinutes}
                onChange={(e) => setNewVisitMinutes(parseInt(e.target.value, 10))}
                className="w-full accent-[#1877F2]"
              />

              <label className="block text-[11px] font-bold text-[#65676B] pt-1">
                当时的心境状态：
              </label>
              <div className="flex items-center gap-2">
                {['😄', '☕', '✨', '🏃‍♀️', '📸', '🍸', '💪', '📖'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setNewVisitMood(m)}
                    className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border cursor-pointer ${
                      newVisitMood === m ? 'bg-[#E7F3FF] border-[#1877F2] scale-105' : 'bg-[#F7F8FA] border-[#E4E6EB]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <label className="block text-[11px] font-bold text-[#65676B] pt-1">
                到访随笔 / 心情备注：
              </label>
              <input
                type="text"
                value={newVisitNote}
                onChange={(e) => setNewVisitNote(e.target.value)}
                placeholder="例如：和朋友小聚、阅读、晨跑..."
                className="w-full p-2 bg-white border border-[#E4E6EB] focus:border-[#1877F2] rounded-md outline-none text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#F0F2F5]">
              <button
                type="button"
                onClick={() => setIsAddVisitModalOpen(false)}
                className="px-3 py-1.5 bg-[#F0F2F5] text-[#65676B] font-bold text-xs rounded-md"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleAddManualVisit}
                className="px-4 py-1.5 bg-[#1877F2] text-white font-bold text-xs rounded-md shadow-2xs"
              >
                确认记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
