import { PLACE_INTENTS, placeIntent, type PlaceIntent } from '../utils/lifePlanning';
import React, { useState } from 'react';
import { useDialogFocus } from '../utils/useDialogFocus';
import { LifePlace, LifePlaceCategory } from '../types';
import {
  LIFE_PLACE_CATEGORIES,
  lifeLayerStore,
} from '../data/lifeLayerStore';
import { calculateLatLngDistanceMeters } from '../utils/geoUtils';
import { USER_LOCATION } from '../data/mockData';
import {
  X,
  MapPin,
  Sparkles,
  Camera,
  Check,
  AlertCircle,
  Tag,
  Lock,
  Globe,
  Users,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { soundEffects } from '../utils/soundEffects';
import { CoordinatePicker } from './CoordinatePicker';
import { validCoordinates } from '../utils/creationValidation';

interface CreateLifePlaceModalProps {
  initialLocation?: { lat: number; lng: number; name?: string };
  editPlace?: LifePlace | null;
  onClose: () => void;
  onCreated?: (place: LifePlace) => void;
  showToast?: (msg: string) => void;
}

export const CreateLifePlaceModal: React.FC<CreateLifePlaceModalProps> = ({
  initialLocation,
  editPlace,
  onClose,
  onCreated,
  showToast,
}) => {
  const dialog = useDialogFocus(true, onClose);
  const isEditing = !!editPlace;
  const [name, setName] = useState(editPlace?.name || initialLocation?.name || '');
  const [category, setCategory] = useState<LifePlaceCategory>(editPlace?.category || 'cafe');
  const [intent,setIntent] = useState<PlaceIntent>(editPlace ? placeIntent(editPlace) : 'frequent');
  const [lat,setLat] = useState(editPlace?.lat ?? initialLocation?.lat ?? USER_LOCATION.lat);
  const [lng,setLng] = useState(editPlace?.lng ?? initialLocation?.lng ?? USER_LOCATION.lng);
  const [positionConfirmed, setPositionConfirmed] = useState(Boolean(editPlace && validCoordinates(editPlace)));
  const [note, setNote] = useState(editPlace?.note || '');
  const [tagsInput, setTagsInput] = useState(editPlace?.tags?.join(' ') || '常去 自习 露台');
  const [privacy, setPrivacy] = useState<'public' | 'friends_only' | 'private'>(editPlace?.privacy || 'friends_only');
  const [photoUrlInput, setPhotoUrlInput] = useState(editPlace?.photos?.[0] || '');

  const targetCoords = {lat,lng};

  // Duplicate Check within 60 meters
  const existingPlaces = lifeLayerStore.getPlaces();
  const nearbyDuplicate = !isEditing
    ? existingPlaces.find((p) => {
        const dist = calculateLatLngDistanceMeters(targetCoords.lat, targetCoords.lng, p.lat, p.lng);
        return dist < 60;
      })
    : null;

  const currentCategoryMeta = LIFE_PLACE_CATEGORIES.find((c) => c.key === category) || LIFE_PLACE_CATEGORIES[0];

  const handleSave = () => {
    if (!name.trim()) {
      if (showToast) showToast('请输入地点名称');
      return;
    }

    if (!validCoordinates(targetCoords) || !positionConfirmed) { showToast?.('请先选择并确认生活坐标的位置'); return; }
    const tags = tagsInput
      .split(/[\s,，]+/)
      .map((t) => t.replace(/^#/, '').trim())
      .filter(Boolean);

    const photos = photoUrlInput.trim()
      ? [photoUrlInput.trim()]
      : editPlace?.photos || [
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600',
        ];

    if (isEditing && editPlace) {
      const updated = lifeLayerStore.updatePlace(editPlace.id, {
        name: name.trim(),
        category, intent, lat, lng,
        icon: currentCategoryMeta.icon,
        color: currentCategoryMeta.color,
        note: note.trim() || undefined,
        tags,
        privacy,
        photos,
      });

      haptics.trigger('medium');
      soundEffects.playSuccessSound();
      if (showToast) showToast(`✅ 地点「${name.trim()}」修改成功！`);
      if (onCreated && updated) onCreated(updated);
    } else {
      const newPlace = lifeLayerStore.addPlace({
        name: name.trim(),
        category, intent,
        icon: currentCategoryMeta.icon,
        color: currentCategoryMeta.color,
        lat: targetCoords.lat,
        lng: targetCoords.lng,
        createdBy: {
          id: 'me',
          name: '我 (Alexia)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          isMe: true,
        },
        createdByMe: true,
        source: 'self',
        tags,
        privacy,
        note: note.trim() || undefined,
        photos,
      });

      haptics.trigger('medium');
      soundEffects.playSuccessSound();
      if (showToast) showToast(`📍 成功在生活图层中点亮「${name.trim()}」！`);
      if (onCreated) onCreated(newPlace);
    }

    onClose();
  };

  return (
    <div className="map-creation-dialog fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none font-sans">
      <div ref={dialog} role="dialog" aria-modal="true" aria-label={isEditing ? "编辑生活坐标" : "添加生活坐标"} tabIndex={-1} className="bg-white border border-[#E4E6EB] rounded-md max-w-md w-full max-h-[calc(100dvh-32px)] [&_button]:min-h-11 [&_input]:min-h-11 [&_input]:text-base [&_textarea]:text-base flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-3.5 border-b border-[#F0F2F5] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-md flex items-center justify-center text-lg shadow-2xs"
              style={{ backgroundColor: `${currentCategoryMeta.color}25` }}
            >
              {currentCategoryMeta.icon}
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#1C1E21]">
                {isEditing ? '编辑生活坐标' : '添加生活坐标'}
              </h3>
              <p className="text-[10px] text-[#65676B]">
                {validCoordinates(targetCoords) ? `${targetCoords.lat.toFixed(4)}, ${targetCoords.lng.toFixed(4)}` : '位置待确认'} · 记录真实生活印记
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="关闭生活坐标设置"
            className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-[#F0F2F5] text-[var(--stellar-muted)] hover:text-[#1C1E21] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 text-xs">
          
          {/* Nearby duplicate warning */}
          {nearbyDuplicate && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-md flex items-start gap-2 text-amber-900">
              <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-bold">附近发现已有相似地点：</span>
                <p className="text-[11px] leading-tight">
                  「{nearbyDuplicate.name}」距离当前选点不足 60 米，建议确认是否为同一处。
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5"><label className="block font-bold text-[#1C1E21]">这个地方对我来说</label><div className="flex gap-2">{PLACE_INTENTS.map(item => <button type="button" key={item.id} aria-pressed={intent===item.id} onClick={() => setIntent(item.id)} className={`flex-1 py-2 border rounded-md ${intent===item.id ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2]' : 'border-[#E4E6EB]'}`}>{item.label}</button>)}</div></div>
          <CoordinatePicker label="生活坐标位置" description="选择名称与精确位置，再设定分类和谁可以看见。" value={{name,lat,lng}} confirmed={positionConfirmed} onChange={(location,confirmed) => {setName(location.name);setLat(location.lat);setLng(location.lng);setPositionConfirmed(confirmed);}}/>
          {/* Category Picker (12 Categories) */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#1C1E21]">地点分类与图标风格</label>
            <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {LIFE_PLACE_CATEGORIES.map((cat) => {
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      haptics.trigger('light');
                      setCategory(cat.key);
                    }}
                    className={`p-1.5 rounded-md border text-center flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#E7F3FF] border-[#1877F2] shadow-2xs scale-[1.02]'
                        : 'bg-[var(--stellar-surface-soft)] border-[#E4E6EB] hover:bg-[#EDF2F7]'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className={`text-[10px] truncate ${isSelected ? 'font-bold text-[#1877F2]' : 'text-[#65676B]'}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Level */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[#1C1E21]">隐私可见范围</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { key: 'friends_only', label: '仅好友可见', icon: Users, desc: '好友地图可查看' },
                { key: 'public', label: '公开探索', icon: Globe, desc: '全城居民可见' },
                { key: 'private', label: '仅自己可见', icon: Lock, desc: '私密秘密据点' },
              ].map((p) => {
                const isSelected = privacy === p.key;
                const IconComp = p.icon;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPrivacy(p.key as any)}
                    className={`p-2 rounded-md border text-left flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#E7F3FF] border-[#1877F2] text-[#1877F2]'
                        : 'bg-[var(--stellar-surface-soft)] border-[#E4E6EB] text-[#65676B] hover:bg-[#EDF2F7]'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-[11px] mb-0.5">
                      <IconComp size={12} />
                      <span>{p.label}</span>
                    </div>
                    <span className="text-[9px] opacity-80">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label htmlFor="life-place-tags" className="block font-bold text-[#1C1E21]">自定义标签 (空格分隔)</label>
            <input id="life-place-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="例如：手冲单品 安静 Wi-Fi 阳光露台"
              className="w-full p-2 bg-[var(--stellar-surface-soft)] border border-[#E4E6EB] focus:border-[#1877F2] rounded-md text-xs text-[var(--stellar-surface-ink)] outline-none"
            />
          </div>

          {/* Personal Note */}
          <div className="space-y-1">
            <label htmlFor="life-place-note" className="block font-bold text-[#1C1E21]">为什么喜欢这里 / 记忆随笔</label>
            <textarea id="life-place-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="写下关于这里的专属私人回忆或推荐心得..."
              className="w-full p-2 bg-[var(--stellar-surface-soft)] border border-[#E4E6EB] focus:border-[#1877F2] rounded-md text-xs text-[var(--stellar-surface-ink)] outline-none resize-none font-sans"
            />
          </div>

          {/* Photo Url */}
          <div className="space-y-1">
            <label htmlFor="life-place-photo" className="block font-bold text-[#1C1E21] flex items-center justify-between">
              <span>地点照片 (Unsplash / 网络图片)</span>
              <span className="text-[10px] text-[var(--stellar-muted)] font-normal">可选</span>
            </label>
            <input
              type="text"
              id="life-place-photo"
              value={photoUrlInput}
              onChange={(e) => setPhotoUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2 bg-[var(--stellar-surface-soft)] border border-[#E4E6EB] focus:border-[#1877F2] rounded-md text-xs text-[var(--stellar-surface-ink)] outline-none"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[var(--stellar-surface-soft)] border-t border-[#E4E6EB] shrink-0 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] font-bold text-xs rounded-md cursor-pointer"
          >
            取消
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || !validCoordinates(targetCoords) || !positionConfirmed}
            className={`px-5 py-2 font-bold text-xs rounded-md shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer ${
              name.trim() && validCoordinates(targetCoords) && positionConfirmed
                ? 'bg-[#1877F2] hover:bg-[#166FE5] text-white active:scale-95'
                : 'bg-[#CED0D4] text-[var(--stellar-muted)] cursor-not-allowed'
            }`}
          >
            <Check size={13} />
            <span>{isEditing ? '保存修改' : '点亮地点'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
