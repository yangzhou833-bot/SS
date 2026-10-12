import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, MapPin, Sparkles, Navigation, Trash2, Edit3, Share2, Layers, Camera, Image, Plus } from 'lucide-react';
import { CustomMapMarker, CustomMarkerPhoto } from '../types';

interface CustomMarkerCreationModalProps {
  isOpen: boolean;
  coord?: { lat: number; lng: number };
  lat?: number;
  lng?: number;
  approxAddress?: string;
  existingMarkers?: CustomMapMarker[];
  onClose: () => void;
  onConfirm?: (markerData: Omit<CustomMapMarker, 'id' | 'createdAt'>) => void;
  onConfirmCreate?: (markerData: Omit<CustomMapMarker, 'id' | 'createdAt'>) => void;
}

// 严格按照分类定义的图标集合
const ICON_CATEGORIES = [
  {
    key: 'building',
    label: '建筑类',
    icons: [
      { emoji: '🏠', name: '标准房屋', defaultTitle: '我的温馨小屋' },
      { emoji: '🏢', name: '公寓大厦', defaultTitle: '常住公寓' },
      { emoji: '🏬', name: '商业办公楼', defaultTitle: '工作办公地点' },
      { emoji: '🛖', name: '特色小木屋', defaultTitle: '休假小木屋' },
      { emoji: '🏟️', name: '体育场馆', defaultTitle: '运动健身球馆' },
      { emoji: '🏡', name: '庭院别墅', defaultTitle: '独栋小院' },
      { emoji: '🏪', name: '便利店', defaultTitle: '24H便利店' },
      { emoji: '🏰', name: '城堡庄园', defaultTitle: '打卡梦幻城堡' },
      { emoji: '🏨', name: '度假酒店', defaultTitle: '入住酒店' },
    ],
  },
  {
    key: 'food',
    label: '美食类',
    icons: [
      { emoji: '🍽️', name: '西餐料理', defaultTitle: '私享西餐厅' },
      { emoji: '☕️', name: '咖啡馆', defaultTitle: '我在精品咖啡馆' },
      { emoji: '🍕', name: '披萨意面', defaultTitle: '意式披萨工坊' },
      { emoji: '🍣', name: '日料寿司', defaultTitle: '深夜日料居酒屋' },
      { emoji: '🥩', name: '炭火烤肉', defaultTitle: '极炙烤肉店' },
      { emoji: '🍔', name: '美式汉堡', defaultTitle: '手作汉堡店' },
      { emoji: '🍜', name: '拉面小吃', defaultTitle: '兰州牛肉拉面馆' },
      { emoji: '🧋', name: '奶茶甜品', defaultTitle: '下午茶奶茶铺' },
      { emoji: '🍻', name: '小酒馆', defaultTitle: '精酿啤酒小馆' },
      { emoji: '🥐', name: '烘焙面包', defaultTitle: '法式面包烘焙坊' },
    ],
  },
  {
    key: 'life',
    label: '生活类',
    icons: [
      { emoji: '🛍️', name: '购物商场', defaultTitle: '周末逛街商场' },
      { emoji: '🎬', name: '影院剧场', defaultTitle: '万达影城观影' },
      { emoji: '🌳', name: '公园绿地', defaultTitle: '心动漫步公园' },
      { emoji: '🏥', name: '医院诊所', defaultTitle: '附近医疗中心' },
      { emoji: '🏫', name: '学校学府', defaultTitle: '母校校园' },
      { emoji: '🏋️', name: '健身俱乐部', defaultTitle: '日常打卡健身房' },
      { emoji: '⛺️', name: '露营营地', defaultTitle: '星空户外露营地' },
      { emoji: '📚', name: '书店图书馆', defaultTitle: '静心阅读书店' },
      { emoji: '⛽️', name: '加油充电', defaultTitle: '车辆补给站' },
      { emoji: '🚉', name: '轨道交通', defaultTitle: '地铁/城际枢纽' },
    ],
  },
];

const PRESET_PHOTO_OPTIONS = [
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
];

export const CustomMarkerCreationModal: React.FC<CustomMarkerCreationModalProps> = ({
  isOpen,
  coord,
  lat,
  lng,
  approxAddress,
  existingMarkers = [],
  onClose,
  onConfirm,
  onConfirmCreate,
}) => {
  const [selectedIcon, setSelectedIcon] = useState('☕️');
  const [selectedCategory, setSelectedCategory] = useState<'building' | 'food' | 'life'>('food');
  const [title, setTitle] = useState('我在 隅田川精品咖啡馆');
  const [note, setNote] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState<string>('');

  if (!isOpen) return null;

  const targetLat = lat !== undefined ? lat : (coord?.lat || 36.0618);
  const targetLng = lng !== undefined ? lng : (coord?.lng || 103.8210);

  const handleSelectIconItem = (item: { emoji: string; name: string; defaultTitle: string }, catKey: 'building' | 'food' | 'life') => {
    setSelectedIcon(item.emoji);
    setSelectedCategory(catKey);
    setTitle(item.defaultTitle);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAttachedPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const isHome = selectedIcon === '🏠' || selectedIcon === '🏡';
    if (isHome) {
      const existingHomes = existingMarkers.filter(m => m.isHome || m.icon === '🏠' || m.icon === '🏡');
      if (existingHomes.length >= 2) {
        alert('家庭 HOME 图标最多只能设置 2 个，如需添加新家庭地址请先删除已有家庭图标。');
        return;
      }
    }

    const finalTitle = title.trim() || (isHome ? '我的温馨家园' : '我的专属标记');
    const categoryLabel = 
      selectedCategory === 'building' ? '建筑 · 空间' :
      selectedCategory === 'food' ? '美食 · 赏味' : '生活 · 休闲';

    const photosList: CustomMarkerPhoto[] = [];
    if (attachedPhoto) {
      photosList.push({
        id: `p-${Date.now()}`,
        url: attachedPhoto,
        timestamp: Date.now(),
        timeString: '刚刚',
        caption: photoCaption.trim() || '打卡第一张照片 📸',
        authorName: 'Alexia (我)',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      });
    }

    const payload = {
      lat: targetLat,
      lng: targetLng,
      icon: selectedIcon,
      category: selectedCategory,
      categoryLabel,
      title: finalTitle,
      address: approxAddress || '兰州市城关区 · 核心商圈',
      timeString: '刚刚',
      note: note.trim() || undefined,
      authorName: 'Alexia (我)',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      photos: photosList.length > 0 ? photosList : undefined,
      isHome: isHome ? true : undefined,
    };

    if (onConfirm) {
      onConfirm(payload);
    } else if (onConfirmCreate) {
      onConfirmCreate(payload);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[95] flex items-end justify-center select-none">
        {/* Semi-transparent Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={onClose}
        />

        {/* Bottom Pill Sheet (Meta / Facebook Design System: Pure white, rounded-t-[28px], 0 bubble) */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative w-full max-w-lg bg-white rounded-t-[28px] shadow-[0_-12px_40px_rgba(0,0,0,0.18)] border-t border-gray-100 z-10 overflow-hidden flex flex-col max-h-[88vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Pill Drag Handle */}
          <div className="pt-3 pb-1 flex justify-center">
            <div className="w-12 h-1.5 bg-[#CED0D4] rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 pt-1 pb-3 flex items-center justify-between border-b border-[#F0F2F5]">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center">
                <MapPin size={18} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#050505]">
                  创建我的标记
                </h3>
                <p className="text-[11px] text-[#65676B] flex items-center space-x-1">
                  <span>坐标已定格 · 自动归类至</span>
                  <span className="font-bold text-[#1877F2] bg-blue-50 px-1.5 py-0.2 rounded-md">
                    生活图层
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-95 text-[#65676B] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable Icon Picker Grid */}
          <div className="px-5 py-4 overflow-y-auto space-y-4 flex-1">
            {/* Category Rows */}
            {ICON_CATEGORIES.map((category) => (
              <div key={category.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#65676B] tracking-wide">
                    {category.label}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {category.icons.length} 个图标
                  </span>
                </div>

                {/* Flat Multi-column Grid of Pure Circle Icon Buttons without bubbles */}
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2.5">
                  {category.icons.map((item) => {
                    const isSelected = selectedIcon === item.emoji;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleSelectIconItem(item, category.key as any)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer relative select-none ${
                          isSelected
                            ? 'bg-blue-50 ring-2 ring-[#1877F2] shadow-[0_4px_12px_rgba(24,119,242,0.25)] scale-105'
                            : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] hover:scale-105'
                        }`}
                        title={item.name}
                      >
                        <span className="text-2xl filter drop-shadow-xs">{item.emoji}</span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1877F2] text-white rounded-full flex items-center justify-center shadow-xs text-[9px] font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Photo Capture & Upload Section */}
            <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#050505] flex items-center space-x-1.5">
                  <Camera size={13} className="text-[#1877F2]" />
                  <span>拍照与打卡照片（支持时间轴查看）</span>
                </span>
                <span className="text-[10px] text-gray-400">可选</span>
              </div>

              {attachedPhoto ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black/5">
                  <img src={attachedPhoto} alt="Marker Preview" className="w-full h-36 object-cover" />
                  <button
                    onClick={() => setAttachedPhoto(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer shadow-md transition-transform active:scale-90"
                    title="移除照片"
                  >
                    <X size={14} />
                  </button>
                  <div className="p-2 bg-white/95 backdrop-blur-xs border-t border-gray-100">
                    <input
                      type="text"
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      placeholder="写下这张照片的专属说明/心情..."
                      className="w-full text-xs text-[#050505] placeholder-[#8A8D91] bg-transparent focus:outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 bg-white hover:bg-blue-50/50 border border-dashed border-gray-300 hover:border-[#1877F2] rounded-xl cursor-pointer transition-all active:scale-98">
                      <Camera size={15} className="text-[#1877F2]" />
                      <span className="text-xs font-bold text-[#1877F2]">立即拍照 / 上传图片</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Preset quick snaps */}
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-0.5">
                    <span className="text-[10px] text-gray-400 shrink-0">预设样张:</span>
                    {PRESET_PHOTO_OPTIONS.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setAttachedPhoto(url);
                          setPhotoCaption('在此地记录下了美好瞬间 ✨');
                        }}
                        className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 border-transparent hover:border-[#1877F2] hover:scale-105 transition-all cursor-pointer shadow-2xs"
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generated Miniature White Preview Card */}
            <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-200/80 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#65676B] uppercase tracking-wider">
                  标记卡片预览
                </span>
                <span className="text-[10px] text-[#1877F2] font-semibold flex items-center space-x-1">
                  <Sparkles size={11} />
                  <span>生活图层专属</span>
                </span>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-start space-x-3">
                {/* Avatar-sized circle with selected icon */}
                <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-200/60 flex items-center justify-center text-2xl shrink-0 shadow-xs ring-2 ring-white">
                  <span>{selectedIcon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title & Edit */}
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="输入标记标题..."
                      className="w-full text-sm font-bold text-[#050505] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#1877F2] focus:outline-hidden py-0.5"
                    />
                    <Edit3 size={14} className="text-gray-400 ml-1 shrink-0" />
                  </div>

                  <p className="text-[11px] text-[#65676B] truncate mt-1 flex items-center space-x-1">
                    <MapPin size={11} className="text-rose-500 shrink-0" />
                    <span>{approxAddress || '兰州市城关区 · 东方红广场附近'}</span>
                  </p>
                </div>
              </div>

              {/* Optional Note Field */}
              <div>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="添加专属备注或心情（例如：每周必来的秘密基地，选填）..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#050505] placeholder-[#8A8D91] focus:outline-hidden focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2]"
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Footer (Meta / Facebook Blue Button) */}
          <div className="p-4 bg-white border-t border-[#F0F2F5] grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-98 text-[#050505] font-bold text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <X size={16} />
              <span>取消</span>
            </button>

            <button
              id="confirm-save-custom-marker-btn"
              onClick={handleSave}
              className="py-3 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] active:scale-98 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-[0_4px_16px_rgba(24,119,242,0.35)] transition-all cursor-pointer"
            >
              <Check size={16} strokeWidth={2.5} />
              <span>生成并保存标记</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
