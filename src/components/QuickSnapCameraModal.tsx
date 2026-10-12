import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, RefreshCw, Zap, ZapOff, Send, Image as ImageIcon, Sparkles, Check, RotateCcw } from 'lucide-react';
import { Friend } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';

interface QuickSnapCameraModalProps {
  isOpen: boolean;
  friend?: Friend | null;
  onClose: () => void;
  onSendSnap: (photoUrl: string, caption?: string) => void;
}

const PRESET_SNAPSHOTS = [
  {
    name: '街景余晖',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: '咖啡时刻',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: '自拍微笑',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: '城市天际',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
  },
];

export const QuickSnapCameraModal: React.FC<QuickSnapCameraModalProps> = ({
  isOpen,
  friend,
  onClose,
  onSendSnap,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasStream, setHasStream] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState(0);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isFlashFired, setIsFlashFired] = useState(false);
  const [filterStyle, setFilterStyle] = useState<'normal' | 'warm' | 'cool' | 'vintage'>('normal');

  // Start / Stop Camera Stream
  useEffect(() => {
    if (!isOpen) {
      setCapturedImage(null);
      setCaption('');
      return;
    }

    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facingMode,
              width: { ideal: 1080 },
              height: { ideal: 1440 },
            },
            audio: false,
          });
          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setHasStream(true);
            setStreamError(false);
          }
        } else {
          setStreamError(true);
        }
      } catch (err) {
        console.log('Webcam not accessible or permission denied, using simulated viewfinder:', err);
        setStreamError(true);
        setHasStream(false);
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  if (!isOpen || !friend) return null;

  // Capture current frame
  const handleTakeShutter = () => {
    soundEffects.playShutterSound();
    haptics.trigger('success');

    setIsFlashFired(true);
    setTimeout(() => setIsFlashFired(false), 250);

    if (hasStream && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 960;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        return;
      }
    }

    // Fallback to preset snapshot
    setCapturedImage(PRESET_SNAPSHOTS[activePresetIndex].url);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCapturedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Send photo
  const handleConfirmSend = () => {
    if (!capturedImage) return;
    onSendSnap(capturedImage, caption);
  };

  // Retake photo / Cancel preview
  const handleRetake = () => {
    setCapturedImage(null);
    setCaption('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black flex flex-col justify-between overflow-hidden select-none"
      >
        {/* Flash overlay */}
        {isFlashFired && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none opacity-90 transition-opacity" />
        )}

        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* ======================= VIEW 1: PREVIEW & CONFIRM SEND ======================= */}
        {capturedImage ? (
          <div className="relative flex-1 flex flex-col justify-between bg-black text-white p-4">
            {/* Top Bar on Preview */}
            <div className="flex items-center justify-between z-20 pt-3">
              <button
                onClick={handleRetake}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white hover:bg-white/30 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>重拍</span>
              </button>

              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-medium">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>发送给 {friend.name}</span>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Photo Preview Container */}
            <div className="relative flex-1 my-3 rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-white/10 flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured snap"
                className={`w-full h-full object-cover ${
                  filterStyle === 'warm'
                    ? 'sepia-[0.3] brightness-105'
                    : filterStyle === 'cool'
                    ? 'hue-rotate-15 contrast-105'
                    : filterStyle === 'vintage'
                    ? 'grayscale-[0.4] contrast-125'
                    : ''
                }`}
              />

              {/* Watermark badge */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white flex items-center space-x-1.5 border border-white/20 shadow-md">
                <Sparkles size={12} className="text-amber-400" />
                <span>📍 实时速拍 · 兰州</span>
                <span className="text-white/60 text-[10px]">刚刚</span>
              </div>

              {/* Filter Switcher Overlay */}
              <div className="absolute top-3 right-3 flex flex-col space-y-1.5">
                {(['normal', 'warm', 'cool', 'vintage'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterStyle(f)}
                    className={`px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border transition-all ${
                      filterStyle === f
                        ? 'bg-[#1877F2] text-white border-white/40 shadow-md'
                        : 'bg-black/40 text-white/80 border-white/10 hover:bg-black/60'
                    }`}
                  >
                    {f === 'normal' ? '原图' : f === 'warm' ? '暖阳' : f === 'cool' ? '清冷' : '复古'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Caption Input */}
            <div className="mb-3 px-1">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={`给 ${friend.name} 留句话吧...（选填）`}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-hidden focus:ring-2 focus:ring-[#1877F2]"
              />
            </div>

            {/* Bottom Action Row: 取消 & 发送按钮 */}
            <div className="grid grid-cols-2 gap-3 pb-2">
              <button
                onClick={onClose}
                className="py-3.5 px-4 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-98 text-white font-bold text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-white/10"
              >
                <X size={16} />
                <span>取消</span>
              </button>

              <button
                onClick={handleConfirmSend}
                className="py-3.5 px-4 rounded-2xl bg-[#1877F2] hover:bg-blue-600 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-[0_8px_24px_rgba(24,119,242,0.45)] transition-all cursor-pointer ring-2 ring-white/20"
              >
                <Send size={16} />
                <span>发送给好友</span>
              </button>
            </div>
          </div>
        ) : (
          /* ======================= VIEW 2: CAMERA VIEWFINDER ======================= */
          <div className="relative flex-1 flex flex-col justify-between p-4 text-white">
            {/* Top Camera Controls */}
            <div className="flex items-center justify-between z-20 pt-3">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors cursor-pointer"
                title="取消并退出相机"
              >
                <X size={20} />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFlashEnabled((prev) => !prev)}
                  className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer ${
                    flashEnabled ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30' : 'bg-white/15 text-white'
                  }`}
                  title="闪光灯"
                >
                  {flashEnabled ? <Zap size={18} /> : <ZapOff size={18} />}
                </button>

                <button
                  onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
                  className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors cursor-pointer"
                  title="翻转前后镜头"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            {/* Viewfinder Center Area */}
            <div className="relative flex-1 my-3 rounded-3xl overflow-hidden bg-gray-900 border border-white/10 flex items-center justify-center shadow-2xl">
              {hasStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              ) : (
                /* Simulated Viewfinder Scene when real hardware stream is not active */
                <div className="relative w-full h-full bg-gray-950 flex items-center justify-center">
                  <img
                    src={PRESET_SNAPSHOTS[activePresetIndex].url}
                    alt="Viewfinder"
                    className="w-full h-full object-cover brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

                  {/* Preset Scene Switcher Chips */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-center space-x-2">
                    {PRESET_SNAPSHOTS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePresetIndex(idx)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md transition-all cursor-pointer ${
                          activePresetIndex === idx
                            ? 'bg-white text-black shadow-md'
                            : 'bg-black/40 text-white/80 hover:bg-black/60'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Viewfinder Focus Reticle & Grid */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border border-white/30 rounded-2xl flex items-center justify-center">
                  <div className="w-3 h-3 border border-amber-400/80 rounded-full" />
                </div>
              </div>

              {/* Location Watermark Tag */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center space-x-1.5 border border-white/15">
                <Camera size={13} className="text-[#1877F2]" />
                <span>实时速拍镜头 · {friend.name}</span>
              </div>
            </div>

            {/* Bottom Shutter Controls */}
            <div className="flex items-center justify-around py-4">
              {/* Photo album import */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
                title="从相册选择照片"
              >
                <ImageIcon size={20} />
              </button>

              {/* Giant Circular Shutter Button */}
              <button
                onClick={handleTakeShutter}
                className="relative w-20 h-20 rounded-full p-1.5 bg-white/20 border-2 border-white flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                title="按下拍照"
              >
                <div className="w-full h-full rounded-full bg-white active:bg-gray-200 transition-colors flex items-center justify-center" />
              </button>

              {/* Close / Cancel Button */}
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
                title="取消"
              >
                <span className="text-xs font-bold">取消</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
