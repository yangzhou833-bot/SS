import React, { useState, useEffect } from 'react';
import { X, Camera, Video, MapPin, Send, Sparkles, Image as ImageIcon } from 'lucide-react';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendStory: (type: 'photo' | 'video', mediaUrl: string, caption: string, location: string) => void;
  showToast?: (msg: string) => void;
  initialLocation?: string;
}

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
];

const SAMPLE_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lights-41642-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1186-large.mp4',
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  onSendStory,
  showToast,
  initialLocation,
}) => {
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [mediaUrl, setMediaUrl] = useState<string>(SAMPLE_PHOTOS[0]);
  const [caption, setCaption] = useState<string>('');
  const [location, setLocation] = useState<string>(initialLocation || '甘肃省兰州市城关区东方红广场');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && initialLocation) {
      setLocation(initialLocation);
    }
  }, [isOpen, initialLocation]);

  if (!isOpen) return null;

  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      if (mediaType === 'photo') {
        const randomPhoto = SAMPLE_PHOTOS[Math.floor(Math.random() * SAMPLE_PHOTOS.length)];
        setMediaUrl(randomPhoto);
        if (showToast) showToast('快拍照片抓拍成功！ 📸');
      } else {
        const randomVideo = SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
        setMediaUrl(randomVideo);
        if (showToast) showToast('快拍短视频录制成功！ 🎥');
      }
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendStory(mediaType, mediaUrl, caption, location);
    if (showToast) {
      showToast(
        mediaType === 'photo'
          ? '照片快拍发送成功！已作为星片展示 🌠'
          : '视频快拍发送成功！地图定位已生成圆形视频播放圈 ⭕'
      );
    }
    setCaption('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans select-none animate-in fade-in duration-200">
      {/* Facebook Straight-Edge Line Frame Modal Container */}
      <div className="relative w-full max-w-md bg-white border border-[#E4E6EB] rounded-md shadow-lg overflow-hidden flex flex-col">
        {/* Header (Facebook Blue Style Header) */}
        <div className="px-4 py-3 bg-[#F0F2F5] border-b border-[#E4E6EB] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center">
              <Camera size={15} />
            </div>
            <div>
              <div className="text-xs font-black text-[#050505]">创建地图快拍 (Story)</div>
              <div className="text-[10px] text-[#65676B]">分享你这一刻的地图瞬间与随拍</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-white border border-[#CCD0D5] hover:bg-gray-100 flex items-center justify-center text-[#65676B] hover:text-[#050505] transition-colors cursor-pointer"
            title="关闭"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Location Bar */}
          <div className="bg-[#F0F2F5] border border-[#E4E6EB] rounded-md p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-[#050505] font-bold truncate">
              <MapPin size={14} className="text-rose-500 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            <span className="text-[10px] bg-blue-50 text-[#1877F2] font-black px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
              地图锚点
            </span>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMediaType('photo');
                setMediaUrl(SAMPLE_PHOTOS[0]);
              }}
              className={`py-2 px-3 rounded-md text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                mediaType === 'photo'
                  ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-xs'
                  : 'bg-white text-[#65676B] border-[#E4E6EB] hover:border-[#1877F2] hover:text-[#1877F2]'
              }`}
            >
              <Camera size={14} />
              <span>照片快拍 (星片)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMediaType('video');
                setMediaUrl(SAMPLE_VIDEOS[0]);
              }}
              className={`py-2 px-3 rounded-md text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                mediaType === 'video'
                  ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-xs'
                  : 'bg-white text-[#65676B] border-[#E4E6EB] hover:border-[#1877F2] hover:text-[#1877F2]'
              }`}
            >
              <Video size={14} />
              <span>视频快拍 (播放圈)</span>
            </button>
          </div>

          {/* Media Preview Box */}
          <div className="relative w-full aspect-video bg-gray-900 rounded-md overflow-hidden border border-[#E4E6EB] shadow-xs group">
            {mediaType === 'photo' ? (
              <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            )}

            {/* Re-capture Button Overlay */}
            <button
              type="button"
              onClick={handleCapture}
              disabled={isCapturing}
              className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-white/95 hover:bg-white text-[#050505] rounded-md border border-[#E4E6EB] text-xs font-bold shadow-md flex items-center space-x-1 transition-all cursor-pointer hover:border-[#1877F2]"
            >
              <Sparkles size={13} className="text-[#1877F2]" />
              <span>{isCapturing ? '拍摄中...' : '抓拍新快拍'}</span>
            </button>
          </div>

          {/* Caption Input */}
          <div className="space-y-1">
            <label className="text-xs font-black text-[#050505] flex items-center justify-between">
              <span>快拍描述 / 这一刻的心情</span>
              <span className="text-[10px] text-[#65676B]">选填</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="分享你现在正在做的事..."
              className="w-full px-3 py-2 bg-white border border-[#CCD0D5] hover:border-[#1877F2] focus:border-[#1877F2] rounded-md text-xs text-[#050505] placeholder-[#8A8D91] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Footer Submit Button */}
        <div className="p-3 bg-[#F0F2F5] border-t border-[#E4E6EB] flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166fe5] active:scale-98 text-white font-black text-xs rounded-md border border-[#1877F2] shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
          >
            <Send size={14} />
            <span>发布至地图 ({mediaType === 'photo' ? '星片模式' : '视频环模式'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
