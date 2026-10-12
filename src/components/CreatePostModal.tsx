import React, { useState } from 'react';
import {
  X,
  MapPin,
  Globe,
  Lock,
  AtSign,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  Check,
  Users,
  Search,
  UserCheck,
  ArrowLeft,
  Sparkles,
  Camera,
} from 'lucide-react';

export interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPost: (
    content: string,
    location: string,
    images?: string[],
    privacy?: string,
    taggedFriends?: string[],
    postType?: 'moment' | 'star'
  ) => void;
  showToast?: (msg: string) => void;
}

// Preset gallery photos for user selection (supports up to 9 photos selection)
const PRESET_GALLERY_PHOTOS = [
  { id: 'g1', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800', title: '极客脑暴讨论' },
  { id: 'g2', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800', title: 'Stellar 灵感记录' },
  { id: 'g3', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800', title: '前端架构草图' },
  { id: 'g4', url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=800', title: '午后精品手冲咖啡' },
  { id: 'g5', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800', title: '阿那亚日落海岸' },
  { id: 'g6', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800', title: '城市灯火夜景' },
  { id: 'g7', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800', title: '湖畔公路骑行' },
  { id: 'g8', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800', title: '蔚蓝海浪沙滩' },
  { id: 'g9', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800', title: '自驾公路旅行' },
  { id: 'g10', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800', title: '雪山云海晨光' },
  { id: 'g11', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800', title: '星空露营银河' },
  { id: 'g12', url: 'https://images.unsplash.com/photo-1542744094-24638ea0b343?auto=format&fit=crop&q=80&w=800', title: '林荫跑道夜跑' },
];

// Preset locations
const PRESET_LOCATIONS = [
  { id: 'loc0', name: '不显示位置', detail: '不包含地理定位信息' },
  { id: 'loc1', name: '甘肃省兰州市城关区东方红广场', detail: '广场南路101号 · 100m' },
  { id: 'loc2', name: 'Stellar 极客研发实验室', detail: '高新技术产业开发区创新大厦B座 · 300m' },
  { id: 'loc3', name: '朝阳公园·三里屯商圈', detail: '北京市朝阳区 · 热门地标' },
  { id: 'loc4', name: '阿那亚海边礼堂及社区', detail: '河北省秦皇岛市昌黎县黄金海岸' },
];

// Privacy Options
const PRIVACY_OPTIONS = [
  { id: 'public', name: '公开', desc: '所有人可见，展示在动态圈', icon: Globe },
  { id: 'friends', name: '仅好友', desc: '仅您的 Stellar 好友可见', icon: Users },
  { id: 'group', name: '家庭小组', desc: '仅对“Stellar 家庭组”成员可见', icon: UserCheck },
  { id: 'private', name: '仅自己可见', desc: '私密存念，仅个人可见', icon: Lock },
];

// Mock Friends to Tag
const MOCK_FRIENDS = [
  { id: 'f1', name: 'Sarah Jenkins', role: 'UI 设计总监', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { id: 'f2', name: 'Alex Rivera', role: '前端架构师', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { id: 'f3', name: 'Marcus Vance', role: '极客小组负责人', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
  { id: 'f4', name: 'Emily Zhang', role: '产品经理', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onAddPost,
  showToast,
}) => {
  const [postType, setPostType] = useState<'moment' | 'star'>('moment');
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([
    PRESET_GALLERY_PHOTOS[0].url,
  ]);
  const [selectedLocation, setSelectedLocation] = useState('甘肃省兰州市城关区东方红广场');
  const [selectedPrivacy, setSelectedPrivacy] = useState('公开');
  const [taggedFriends, setTaggedFriends] = useState<string[]>(['Sarah Jenkins']);

  // Active Bottom Sheet
  const [activeSheet, setActiveSheet] = useState<'none' | 'location' | 'privacy' | 'tag' | 'album'>('none');
  const [locationSearch, setLocationSearch] = useState('');

  if (!isOpen) return null;

  const canPublish = content.trim().length > 0 || selectedImages.length > 0;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;

    // Ensure star cards have at least one photo
    let finalImages = [...selectedImages];
    if (postType === 'star' && finalImages.length === 0) {
      finalImages = [PRESET_GALLERY_PHOTOS[0].url];
    }

    onAddPost(content, selectedLocation, finalImages, selectedPrivacy, taggedFriends, postType);
    if (showToast) {
      showToast(
        postType === 'star'
          ? '星片发布成功！已呈现在地图与个人资料中 🌠'
          : '动态已成功发布至 Stellar 朋友圈 🌟'
      );
    }
    setContent('');
    setSelectedImages([]);
    onClose();
  };

  const handleToggleImage = (url: string) => {
    if (selectedImages.includes(url)) {
      setSelectedImages((prev) => prev.filter((u) => u !== url));
    } else {
      if (selectedImages.length >= 9) return;
      setSelectedImages((prev) => [...prev, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleTagFriend = (name: string) => {
    if (taggedFriends.includes(name)) {
      setTaggedFriends((prev) => prev.filter((f) => f !== name));
    } else {
      setTaggedFriends((prev) => [...prev, name]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F0F2F5] flex flex-col font-sans select-none animate-in fade-in duration-200 overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION HEADER (FULLSCREEN MODE) */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-[#E4E6EB] px-4 py-2.5 flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] flex items-center justify-center cursor-pointer transition-colors"
            title="取消返回"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Segment Selector: 发布动态 / 发布星片 */}
          <div className="flex bg-[#F0F2F5] p-1 rounded-full space-x-1">
            <button
              type="button"
              onClick={() => setPostType('moment')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                postType === 'moment'
                  ? 'bg-white text-[#1877F2] shadow-xs'
                  : 'text-[#65676B] hover:text-[#050505]'
              }`}
            >
              发布动态
            </button>
            <button
              type="button"
              onClick={() => setPostType('star')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                postType === 'star'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'text-[#65676B] hover:text-[#050505]'
              }`}
            >
              <Sparkles size={13} />
              <span>发布星片</span>
            </button>
          </div>
        </div>

        {/* Action Button: Facebook Blue Pill Button */}
        <button
          type="button"
          onClick={handlePublish}
          disabled={!canPublish}
          className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs flex items-center space-x-1 ${
            canPublish
              ? 'bg-[#1877F2] hover:bg-[#166fe5] text-white cursor-pointer active:scale-95 shadow-md'
              : 'bg-[#E4E6EB] text-[#8A8D91] cursor-not-allowed'
          }`}
        >
          <span>{postType === 'star' ? '发布星片' : '发布'}</span>
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 2. FULLSCREEN MAIN SCROLLING VIEW (SMOOTH KEYBOARD RESPONSIVE) */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* Star Card Notice Banner */}
        {postType === 'star' && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-2xl shadow-xs flex items-center space-x-2 text-xs font-medium animate-in fade-in zoom-in-98">
            <Sparkles size={18} className="shrink-0 text-amber-300" />
            <div>
              <span className="font-bold">星片发布模式：</span>
              发布后将在地图对应坐标显示为树立长方形照片（左上角展示您的头像），并在个人主页生成时间轴卡片！
            </div>
          </div>
        )}

        {/* TEXT INPUT AREA */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'star'
                ? "输入这段记忆星片的故事与感悟..."
                : "分享此刻的心情与足迹..."
            }
            rows={5}
            className="w-full text-sm font-normal text-[#050505] leading-relaxed resize-none outline-none placeholder-[#65676B] font-sans"
            autoFocus
          />
        </div>

        {/* MEDIA GRID AREA (3x3 Responsive Grid up to 9 items) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#050505]">图片 / 视频媒体 (3x3 网格)</span>
            <span className="text-[11px] font-semibold text-[#65676B]">
              已选 {selectedImages.length}/9
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Selected Images Cell with Delete Icon */}
            {selectedImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-2xs group"
              >
                <img
                  src={imgUrl}
                  alt={`selected-${idx}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                />

                {/* Delete Icon (Small 'x' in top-right corner) */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-transform hover:scale-110 z-10"
                  title="移除图片"
                >
                  <X size={13} />
                </button>
              </div>
            ))}

            {/* Add Media Cell (Large '+' Button) */}
            {selectedImages.length < 9 && (
              <button
                type="button"
                onClick={() => setActiveSheet('album')}
                className="aspect-square bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-95 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-[#65676B] transition-all cursor-pointer group"
              >
                <Plus size={24} className="text-[#1877F2] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold mt-1 text-[#65676B]">添加媒体</span>
              </button>
            )}
          </div>
        </div>

        {/* POST CONFIGURATION SETTINGS (Clean White Card List) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden divide-y divide-gray-100">
          {/* Row 1: Location (所在位置) */}
          <div
            onClick={() => setActiveSheet('location')}
            className="p-3.5 flex items-center justify-between hover:bg-[#F0F2F5]/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#050505]">所在位置</div>
                <div className="text-[11px] font-semibold text-[#1877F2] truncate mt-0.5">
                  {selectedLocation}
                </div>
              </div>
            </div>

            <ChevronRight size={18} className="text-[#8A8D91] group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>

          {/* Row 2: Privacy (谁可以看) */}
          <div
            onClick={() => setActiveSheet('privacy')}
            className="p-3.5 flex items-center justify-between hover:bg-[#F0F2F5]/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
                <Globe size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#050505]">谁可以看</div>
                <div className="text-[11px] font-semibold text-[#65676B] truncate mt-0.5">
                  {selectedPrivacy}
                </div>
              </div>
            </div>

            <ChevronRight size={18} className="text-[#8A8D91] group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>

          {/* Row 3: Tag People (提醒谁看) */}
          <div
            onClick={() => setActiveSheet('tag')}
            className="p-3.5 flex items-center justify-between hover:bg-[#F0F2F5]/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
                <AtSign size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#050505]">提醒谁看</div>
                <div className="text-[11px] font-semibold text-[#65676B] truncate mt-0.5">
                  {taggedFriends.length > 0 ? `已选择 ${taggedFriends.length} 位好友` : '未选择'}
                </div>
              </div>
            </div>

            <ChevronRight size={18} className="text-[#8A8D91] group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE BOTTOM SHEETS FOR SUB-SELECTION */}
      {/* ========================================================================= */}

      {/* 1. Photo Picker Bottom Sheet */}
      {activeSheet === 'album' && (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-white rounded-t-[24px] shadow-2xl p-4 border-t border-gray-200 animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col max-w-2xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
              <ImageIcon size={15} className="text-[#1877F2]" />
              <span>选择图库照片 (最多 9 张)</span>
            </h3>
            <button
              type="button"
              onClick={() => setActiveSheet('none')}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="py-3 grid grid-cols-3 gap-2 overflow-y-auto custom-scrollbar max-h-[300px]">
            {PRESET_GALLERY_PHOTOS.map((photo) => {
              const isSelected = selectedImages.includes(photo.url);
              return (
                <div
                  key={photo.id}
                  onClick={() => handleToggleImage(photo.url)}
                  className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                    isSelected ? 'border-[#1877F2] scale-95 shadow-md' : 'border-transparent hover:opacity-90'
                  }`}
                >
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setActiveSheet('none')}
            className="w-full py-2.5 bg-[#1877F2] text-white font-bold rounded-full text-xs shadow-xs hover:bg-[#166fe5] cursor-pointer mt-2"
          >
            确定选定 ({selectedImages.length} 张)
          </button>
        </div>
      )}

      {/* 2. Location Selector Bottom Sheet */}
      {activeSheet === 'location' && (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-white rounded-t-[24px] shadow-2xl p-4 border-t border-gray-200 animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col max-w-2xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
              <MapPin size={15} className="text-[#1877F2]" />
              <span>选择所在位置</span>
            </h3>
            <button
              type="button"
              onClick={() => setActiveSheet('none')}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="py-2">
            <div className="flex items-center space-x-2 bg-[#F0F2F5] px-3 py-2 rounded-xl border border-gray-200">
              <Search size={14} className="text-[#65676B]" />
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="搜索附近地标或位置..."
                className="bg-transparent text-xs text-[#050505] outline-none w-full"
              />
            </div>
          </div>

          <div className="py-2 space-y-1.5 overflow-y-auto custom-scrollbar max-h-[280px]">
            {PRESET_LOCATIONS.filter((l) =>
              l.name.toLowerCase().includes(locationSearch.toLowerCase())
            ).map((loc) => (
              <div
                key={loc.id}
                onClick={() => {
                  setSelectedLocation(loc.name);
                  setActiveSheet('none');
                }}
                className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                  selectedLocation === loc.name
                    ? 'bg-blue-50/80 border border-[#1877F2]/30'
                    : 'hover:bg-[#F0F2F5]'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-[#050505]">{loc.name}</div>
                  <div className="text-[10px] text-[#65676B]">{loc.detail}</div>
                </div>
                {selectedLocation === loc.name && <Check size={16} className="text-[#1877F2]" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Privacy Selector Bottom Sheet */}
      {activeSheet === 'privacy' && (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-white rounded-t-[24px] shadow-2xl p-4 border-t border-gray-200 animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col max-w-2xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
              <Globe size={15} className="text-[#1877F2]" />
              <span>谁可以看</span>
            </h3>
            <button
              type="button"
              onClick={() => setActiveSheet('none')}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="py-2 space-y-2 overflow-y-auto custom-scrollbar max-h-[300px]">
            {PRIVACY_OPTIONS.map((opt) => {
              const IconComp = opt.icon;
              const isSel = selectedPrivacy === opt.name;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    setSelectedPrivacy(opt.name);
                    setActiveSheet('none');
                  }}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${
                    isSel ? 'border-[#1877F2] bg-blue-50/70 shadow-2xs' : 'border-gray-200 hover:bg-[#F0F2F5]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1877F2] flex items-center justify-center">
                      <IconComp size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#050505]">{opt.name}</div>
                      <div className="text-[10px] text-[#65676B]">{opt.desc}</div>
                    </div>
                  </div>
                  {isSel && <Check size={16} className="text-[#1877F2]" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Tag Friends Bottom Sheet */}
      {activeSheet === 'tag' && (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-white rounded-t-[24px] shadow-2xl p-4 border-t border-gray-200 animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col max-w-2xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-xs font-black text-[#050505] flex items-center space-x-1.5">
              <AtSign size={15} className="text-[#1877F2]" />
              <span>提醒谁看 (选择好友)</span>
            </h3>
            <button
              type="button"
              onClick={() => setActiveSheet('none')}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="py-2 space-y-2 overflow-y-auto custom-scrollbar max-h-[280px]">
            {MOCK_FRIENDS.map((friend) => {
              const isTagged = taggedFriends.includes(friend.name);
              return (
                <div
                  key={friend.id}
                  onClick={() => handleToggleTagFriend(friend.name)}
                  className={`p-2.5 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${
                    isTagged ? 'border-[#1877F2] bg-blue-50/60' : 'border-gray-200 hover:bg-[#F0F2F5]'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-9 h-9 rounded-full object-cover border border-gray-200"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#050505]">{friend.name}</div>
                      <div className="text-[10px] text-[#65676B]">{friend.role}</div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isTagged ? 'bg-[#1877F2] border-[#1877F2] text-white' : 'border-gray-300'
                    }`}
                  >
                    {isTagged && <Check size={12} />}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setActiveSheet('none')}
            className="w-full py-2.5 bg-[#1877F2] text-white font-bold rounded-full text-xs shadow-xs hover:bg-[#166fe5] cursor-pointer mt-2"
          >
            确定选择 ({taggedFriends.length} 人)
          </button>
        </div>
      )}
    </div>
  );
};
