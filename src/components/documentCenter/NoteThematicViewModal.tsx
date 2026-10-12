import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Image as ImageIcon,
  FileText,
  Clock,
  Navigation,
  Copy,
  Share2,
  Bookmark,
  CheckCircle2,
  Circle,
  Users,
  Camera,
  Download,
  Maximize2,
  Tag,
  Edit3,
  Trash2,
  Pin,
  Sparkles,
  ExternalLink,
  Info,
  CalendarPlus,
  Bell,
  Sliders,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NoteItem, NoteScheduleData, NoteLocationData, NoteImageData, NoteTextData } from '../../data/documentCenterData';

interface NoteThematicViewModalProps {
  note: NoteItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEditNote?: (note: NoteItem) => void;
  onDeleteNote?: (noteId: string) => void;
  onTogglePinNote?: (noteId: string) => void;
  showToast: (msg: string) => void;
}

export const NoteThematicViewModal: React.FC<NoteThematicViewModalProps> = ({
  note,
  isOpen,
  onClose,
  onEditNote,
  onDeleteNote,
  onTogglePinNote,
  showToast,
}) => {
  // Active sub-theme tab (defaults to note's defined contentType or 'text')
  const [activeThemeTab, setActiveThemeTab] = useState<'schedule' | 'location' | 'image' | 'text'>(
    note?.contentType || 'text'
  );

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isCalendarAdded, setIsCalendarAdded] = useState(note?.scheduleData?.calendarSynced || false);

  useEffect(() => {
    if (note) {
      setActiveThemeTab(note.contentType || 'text');
      setIsCalendarAdded(note.scheduleData?.calendarSynced || false);
    }
  }, [note?.id]);

  const themeAccentColors = {
    pink: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', active: 'bg-rose-500 text-white' },
    blue: { bg: 'bg-blue-50', text: 'text-[#1877F2]', border: 'border-blue-200', active: 'bg-[#1877F2] text-white' },
    yellow: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', active: 'bg-amber-500 text-white' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', active: 'bg-purple-600 text-white' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', active: 'bg-emerald-600 text-white' },
  };

  const currentTheme = themeAccentColors[note?.theme || 'blue'] || themeAccentColors.blue;

  // Handle Copy Coordinate or Text
  const handleCopy = (textToCopy: string, label: string) => {
    navigator.clipboard?.writeText(textToCopy);
    showToast(`已复制${label}到剪贴板 📋`);
  };

  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#050505]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header with Note Title & Action Buttons */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <span className="text-2xl shrink-0">{note.emoji || '📝'}</span>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${currentTheme.bg} ${currentTheme.text}`}>
                  {note.category}
                </span>
                {note.isPinned && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-bold flex items-center space-x-0.5">
                    <Pin size={10} className="fill-amber-600" />
                    <span>置顶</span>
                  </span>
                )}
                <span className="text-[11px] text-gray-400 font-sans">{note.date}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#050505] truncate tracking-tight mt-0.5">
                {note.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {onTogglePinNote && (
              <button
                type="button"
                onClick={() => {
                  onTogglePinNote(note.id);
                  showToast(note.isPinned ? '已取消置顶' : '已置顶该笔记 📌');
                }}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  note.isPinned ? 'bg-amber-100 text-amber-600' : 'hover:bg-gray-100 text-gray-500'
                }`}
                title={note.isPinned ? '取消置顶' : '置顶笔记'}
              >
                <Pin size={15} className={note.isPinned ? 'fill-amber-600' : ''} />
              </button>
            )}

            {onEditNote && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditNote(note);
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                title="编辑笔记"
              >
                <Edit3 size={15} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
              title="关闭"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Thematic Content Selector Switcher (日程 / 定位 / 图片 / 文字 4大主题内面展示) */}
        <div className="px-5 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-gray-500 shrink-0 flex items-center space-x-1">
            <Sliders size={13} />
            <span>主题内容内面：</span>
          </span>

          <div className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border border-gray-200/80 shadow-2xs">
            {[
              { key: 'schedule', label: '日程内容', icon: Calendar, hasData: !!note.scheduleData },
              { key: 'location', label: '定位内容', icon: MapPin, hasData: !!note.locationData },
              { key: 'image', label: '图片内容', icon: ImageIcon, hasData: !!note.imageData },
              { key: 'text', label: '文字内容', icon: FileText, hasData: true },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeThemeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveThemeTab(tab.key as any)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#1877F2] text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={13} className="stroke-[2.2]" />
                  <span>{tab.label}</span>
                  {tab.hasData && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-white' : 'bg-[#1877F2]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Thematic Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* ================================================================= */}
          {/* THEME 1: 日程内容页面 (Schedule / Event Theme View)               */}
          {/* ================================================================= */}
          {activeThemeTab === 'schedule' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Event Date & Summary Banner Card */}
              <div className="p-4.5 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Calendar size={22} className="text-white" />
                    </div>
                    <div>
                      <span className="text-[11px] text-blue-100 font-bold uppercase tracking-wider">日程时间节点</span>
                      <h3 className="text-base font-black">
                        {note.scheduleData?.eventDate || '2026年8月22日 (周六)'}
                      </h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
                    {note.scheduleData?.timeRange || '15:30 - 21:30'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs text-blue-50">
                  <div className="flex items-center space-x-1 truncate max-w-[70%]">
                    <MapPin size={13} className="shrink-0" />
                    <span className="truncate">
                      {note.scheduleData?.locationName || '甘肃省兰州市城关区中山铁桥北广场'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <Bell size={13} />
                    <span>{note.scheduleData?.reminder || '活动前30分钟提醒'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add to Calendar & Invite */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCalendarAdded(!isCalendarAdded);
                    showToast(isCalendarAdded ? '已从活动日历移除' : '已成功同步至系统活动日历 🗓️');
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    isCalendarAdded
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#1877F2] text-white hover:bg-blue-600 shadow-2xs'
                  }`}
                >
                  <CalendarPlus size={15} />
                  <span>{isCalendarAdded ? '✓ 已同步至活动日历' : '一键同步到活动日历'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('已生成日程邀请海报，可转发至好友群聊 📤')}
                  className="py-2.5 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Share2 size={14} />
                  <span>转发日程</span>
                </button>
              </div>

              {/* Schedule Timeline Agenda */}
              <div className="p-4 rounded-3xl bg-gray-50/80 border border-gray-100 space-y-3">
                <h4 className="text-xs font-black text-[#050505] uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock size={14} className="text-[#1877F2]" />
                  <span>活动阶段时间线与分工</span>
                </h4>

                <div className="space-y-3 pl-2 border-l-2 border-blue-200 ml-2">
                  {(
                    note.scheduleData?.agenda || [
                      { time: '15:30 - 16:00', title: '中山铁桥集合调试设备与安全简报', status: 'done' },
                      { time: '16:00 - 17:30', title: '黄河风情线绿道骑行 (中山桥 -> 金城关)', status: 'done' },
                      { time: '17:30 - 18:30', title: '白塔山露营手冲咖啡与全景观景', status: 'pending' },
                      { time: '19:00 - 20:30', title: '黄河夕阳晚霞与落日 4K 航拍采风', status: 'pending' },
                      { time: '20:30 - 21:30', title: '金城关夜市地道美食聚餐与原片互传', status: 'pending' },
                    ]
                  ).map((item, idx) => (
                    <div key={idx} className="relative pl-4 space-y-0.5">
                      <div
                        className={`absolute -left-[13px] top-0.5 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center ${
                          item.status === 'done' ? 'border-emerald-500 text-emerald-500' : 'border-blue-400 text-blue-400'
                        }`}
                      >
                        {item.status === 'done' ? <CheckCircle2 size={11} className="shrink-0" /> : <Circle size={11} className="shrink-0" />}
                      </div>
                      <span className="text-[11px] font-bold text-[#1877F2]">{item.time}</span>
                      <p className="text-xs font-semibold text-[#050505] leading-relaxed">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Participants list */}
              <div className="p-4 rounded-3xl bg-gray-50/80 border border-gray-100 space-y-2.5">
                <h4 className="text-xs font-black text-[#050505] uppercase tracking-wider flex items-center space-x-1.5">
                  <Users size={14} className="text-[#1877F2]" />
                  <span>参与成员 (4人已确认)</span>
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    note.scheduleData?.participants || [
                      { name: 'RicardoZhan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120', role: '领队 / 发起人' },
                      { name: 'Alex Mercer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120', role: '摄影师' },
                      { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', role: '后勤补给' },
                      { name: 'Lucas Vance', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120', role: '安全员' },
                    ]
                  ).map((p, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5 p-2 bg-white rounded-2xl border border-gray-200/80">
                      <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-100" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#050505] block truncate">{p.name}</span>
                        <span className="text-[10px] text-gray-500 font-normal">{p.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* THEME 2: 定位内容页面 (Location / Geographic Map Theme View)       */}
          {/* ================================================================= */}
          {activeThemeTab === 'location' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Location Card with Map Preview */}
              <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 shadow-2xs group">
                <div className="h-44 sm:h-48 w-full bg-slate-800 relative overflow-hidden">
                  <img
                    src={
                      note.locationData?.mapImageUrl ||
                      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800'
                    }
                    alt="Map Location"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Pulsing Pin Marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg ring-4 ring-white/50 animate-bounce">
                      <MapPin size={22} className="fill-white text-transparent" />
                    </div>
                    <span className="mt-1 px-2.5 py-0.5 rounded-full bg-black/75 text-white text-[11px] font-bold backdrop-blur-md">
                      {note.locationData?.name || '兰州金城关仿古文化博览园'}
                    </span>
                  </div>

                  {/* Distance badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-[#1877F2] text-xs font-bold shadow-2xs backdrop-blur-md flex items-center space-x-1">
                    <Navigation size={12} className="rotate-45" />
                    <span>{note.locationData?.distance || '距当前 1.8 km'}</span>
                  </div>
                </div>

                {/* Location Details Info */}
                <div className="p-4 bg-white space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-[#050505]">
                      {note.locationData?.name || '兰州金城关仿古文化博览园'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {note.locationData?.address || '甘肃省兰州市城关区北滨河中路金城关公园内 (白塔山公园西侧)'}
                    </p>
                  </div>

                  {/* Coordinates & Quick Copy */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-gray-500 text-[11px]">经纬度坐标:</span>
                      <span className="font-mono font-bold text-[#050505]">
                        {note.locationData?.lat || 36.0668}° N, {note.locationData?.lng || 103.8162}° E
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `${note.locationData?.lat || 36.0668}, ${note.locationData?.lng || 103.8162}`,
                          '经纬度'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-xs font-bold text-[#1877F2] flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy size={11} />
                      <span>复制</span>
                    </button>
                  </div>

                  {/* Transport & Open hours */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-blue-50/60 rounded-2xl text-blue-900 border border-blue-100 space-y-1">
                      <span className="font-bold flex items-center space-x-1 text-[#1877F2]">
                        <Navigation size={12} />
                        <span>交通与出行建议：</span>
                      </span>
                      <p className="text-[11.5px] leading-relaxed text-gray-700">
                        {note.locationData?.transportSuggestion ||
                          '推荐公共交通：公交 20路/131路至白塔山公园站下车步行 200 米；自驾可停放于北滨河中路地下停车场。'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-gray-600 px-1 pt-1">
                      <span>开放时间：{note.locationData?.openHours || '全天开放 (博物馆 09:00-17:00)'}</span>
                      <span>累计打卡：{note.locationData?.checkInCount || 1420} 次</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => showToast('已启动高精度路线导航 🧭')}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs active:scale-98"
                >
                  <Navigation size={15} />
                  <span>一键导航前往</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('已在当前地理位置完成打卡打标 📍')}
                  className="py-3 px-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-emerald-200"
                >
                  <MapPin size={15} />
                  <span>打卡标记</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* THEME 3: 图片内容页面 (Photo / Gallery Theme View)                */}
          {/* ================================================================= */}
          {activeThemeTab === 'image' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Photo Resolution & Camera EXIF Info Card */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Camera size={16} className="text-[#1877F2]" />
                  <div>
                    <span className="font-bold text-[#050505]">
                      {note.imageData?.resolutionInfo || 'Sony A7R5 · 6100万像素 ProRAW 原片'}
                    </span>
                    <span className="text-gray-500 block text-[10.5px]">
                      共 {note.imageData?.images.length || 4} 张高清影像
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => showToast('已开始打包下载全套 4K 摄影原片 💾')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-xs font-bold text-[#1877F2] flex items-center space-x-1 cursor-pointer shadow-2xs"
                >
                  <Download size={12} />
                  <span>打包下载</span>
                </button>
              </div>

              {/* Photo Gallery Grid */}
              <div className="grid grid-cols-2 gap-3">
                {(
                  note.imageData?.images || [
                    {
                      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
                      title: '中山铁桥金黄余晖.jpg',
                      size: '4.8 MB',
                      exif: '24mm · f/4.0 · 1/250s · ISO 100',
                      caption: '傍晚中山桥在黄河浪涛映衬下的金黄色晚霞余晖',
                    },
                    {
                      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
                      title: '白塔山晨曦全景.jpg',
                      size: '5.2 MB',
                      exif: '35mm · f/5.6 · 1/500s · ISO 160',
                      caption: '白塔山晨曦日出全景，俯瞰黄河穿城而过',
                    },
                    {
                      url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
                      title: '金城关仿古红墙夜景.jpg',
                      size: '6.1 MB',
                      exif: '50mm · f/1.8 · 1/60s · ISO 400',
                      caption: '仿明清秦砖汉瓦古建筑在灯光映照下的静谧质感',
                    },
                    {
                      url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
                      title: '黄河畔手冲咖啡随手拍.jpg',
                      size: '3.6 MB',
                      exif: '85mm · f/2.0 · 1/320s · ISO 200',
                      caption: '滨河步道咖啡馆窗外的落叶与悠闲午后',
                    },
                  ]
                ).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="h-36 sm:h-40 w-full relative bg-gray-100 overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[9.5px] font-mono backdrop-blur-md">
                        {img.size || '4.2 MB'}
                      </span>
                    </div>

                    <div className="p-2.5 space-y-1">
                      <h5 className="text-xs font-bold text-[#050505] truncate">{img.title}</h5>
                      <span className="text-[10px] text-gray-500 font-mono block truncate">{img.exif}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* THEME 4: 文字内容页面 (Rich Text / Document Theme View)            */}
          {/* ================================================================= */}
          {activeThemeTab === 'text' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200 font-sans text-gray-800">
              {/* Article Meta / Reading Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
                <span>作者：{note.textData?.author || 'RicardoZhan'}</span>
                <span>
                  字数：{note.textData?.wordCount || 860} 字 · 预计阅读 {note.textData?.readingTimeMinutes || 3} 分钟
                </span>
              </div>

              {/* Quote Block if available */}
              {note.textData?.quotes && note.textData.quotes.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border-l-4 border-[#1877F2] text-xs font-medium text-blue-950 italic leading-relaxed">
                  {note.textData.quotes[0]}
                </div>
              )}

              {/* Paragraphs with Structured Typography */}
              <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-gray-700">
                {note.textData?.paragraphs ? (
                  note.textData.paragraphs.map((p, idx) => {
                    if (p.startsWith('### ')) {
                      return (
                        <h4 key={idx} className="text-sm font-black text-[#050505] pt-2 border-b border-gray-100 pb-1">
                          {p.replace('### ', '')}
                        </h4>
                      );
                    }
                    return <p key={idx}>{p}</p>;
                  })
                ) : (
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-[#050505]">
                    {note.content}
                  </div>
                )}
              </div>

              {/* Markdown Key Highlights */}
              {note.textData?.markdownHighlights && (
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1.5 text-xs">
                  <span className="font-bold text-[#050505] flex items-center space-x-1">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>核心规范要点：</span>
                  </span>
                  <ul className="space-y-1 pl-4 list-disc text-gray-600">
                    {note.textData.markdownHighlights.map((hl, idx) => (
                      <li key={idx}>{hl}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-3.5 border-t border-gray-100 bg-gray-50/90 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-gray-500">
            <span>标签：</span>
            <div className="flex items-center space-x-1 overflow-x-auto max-w-[240px] no-scrollbar">
              {note.tags.map((t, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] font-semibold text-gray-600 whitespace-nowrap">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleCopy(note.content, '笔记正文')}
              className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Copy size={12} />
              <span>复制正文</span>
            </button>

            {onDeleteNote && (
              <button
                type="button"
                onClick={() => {
                  onDeleteNote(note.id);
                  onClose();
                  showToast('已删除该笔记 🗑️');
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Trash2 size={12} />
                <span>删除</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
