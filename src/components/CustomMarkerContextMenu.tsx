import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Edit3, 
  Camera, 
  Trash2, 
  Navigation, 
  Share2, 
  X, 
  MapPin, 
  Sparkles,
  Plus
} from 'lucide-react';
import { CustomMapMarker } from '../types';

interface CustomMarkerContextMenuProps {
  isOpen: boolean;
  marker: CustomMapMarker | null;
  position?: { x: number; y: number } | null;
  onClose: () => void;
  onEdit: (marker: CustomMapMarker) => void;
  onAddPhotos: (marker: CustomMapMarker) => void;
  onNavigate: (marker: CustomMapMarker) => void;
  onShare: (marker: CustomMapMarker) => void;
  onDelete: (markerId: string) => void;
}

export const CustomMarkerContextMenu: React.FC<CustomMarkerContextMenuProps> = ({
  isOpen,
  marker,
  position,
  onClose,
  onEdit,
  onAddPhotos,
  onNavigate,
  onShare,
  onDelete,
}) => {
  if (!isOpen || !marker) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[95] flex items-center justify-center select-none pointer-events-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          onClick={onClose}
        />

        {/* Facebook/Meta Design High Corner Radius Modal / Context Card */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="relative w-80 bg-white rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.3)] border border-gray-100 p-4 z-10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Preview Banner */}
          <div className="flex items-center space-x-3 pb-3 border-b border-[#F0F2F5]">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shrink-0 shadow-xs ring-2 ring-blue-100">
              <span>{marker.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-[#1877F2] bg-blue-50 px-1.5 py-0.2 rounded-md">
                  我的标记
                </span>
                <span className="text-[10px] text-gray-400">
                  {marker.photos?.length ? `${marker.photos.length}张照片` : '暂无照片'}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-[#050505] truncate mt-0.5">
                {marker.title}
              </h4>
              <p className="text-[11px] text-[#65676B] truncate flex items-center space-x-1">
                <MapPin size={10} className="text-rose-500 shrink-0" />
                <span>{marker.address || '兰州市城关区'}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] flex items-center justify-center cursor-pointer shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          {/* Context Menu Actions List */}
          <div className="py-2 space-y-1">
            {/* 1. Add Photos */}
            <button
              onClick={() => {
                onClose();
                onAddPhotos(marker);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl hover:bg-blue-50/70 text-[#050505] hover:text-[#1877F2] transition-colors cursor-pointer group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                <Camera size={18} strokeWidth={2.2} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-extrabold">补充照片 / 拍摄记录</div>
                <div className="text-[10px] text-[#65676B]">连续拍摄多张并同步至时间轴</div>
              </div>
              <Plus size={14} className="text-[#1877F2]" />
            </button>

            {/* 2. Edit Info */}
            <button
              onClick={() => {
                onClose();
                onEdit(marker);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl hover:bg-[#F0F2F5] text-[#050505] transition-colors cursor-pointer group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Edit3 size={17} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-extrabold">修改标题与备注</div>
                <div className="text-[10px] text-[#65676B]">更改名称、心情或自定义备忘</div>
              </div>
            </button>

            {/* 3. Navigate */}
            <button
              onClick={() => {
                onClose();
                onNavigate(marker);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl hover:bg-[#F0F2F5] text-[#050505] transition-colors cursor-pointer group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Navigation size={17} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-extrabold">导航至该标记点</div>
                <div className="text-[10px] text-[#65676B]">规划最佳路线并开启实时导航</div>
              </div>
            </button>

            {/* 4. Share to friends */}
            <button
              onClick={() => {
                onClose();
                onShare(marker);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl hover:bg-[#F0F2F5] text-[#050505] transition-colors cursor-pointer group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Share2 size={17} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-extrabold">分享相册给好友</div>
                <div className="text-[10px] text-[#65676B]">发送标记与照片墙至好友对话</div>
              </div>
            </button>

            <div className="h-px bg-gray-100 my-1" />

            {/* 5. Delete Marker */}
            <button
              onClick={() => {
                onClose();
                onDelete(marker.id);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Trash2 size={17} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-extrabold">删除此标记</div>
                <div className="text-[10px] text-rose-400">从我的生活图层中移除</div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
