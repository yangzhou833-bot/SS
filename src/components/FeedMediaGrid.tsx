import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { LikedUser } from './DiscoverView';

interface PostMediaGridProps {
  images: string[];
  cornerLikers?: LikedUser[];
  onOpenImage?: (index: number) => void;
}

export const PostMediaGrid: React.FC<PostMediaGridProps> = ({
  images,
  cornerLikers = [],
  onOpenImage,
}) => {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // Touch & Swipe gesture handling state
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);

  // Max 9 images
  const displayImages = (images || []).slice(0, 9);
  const count = displayImages.length;

  const handleImageClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    if (onOpenImage) {
      onOpenImage(idx);
    } else {
      setViewerIndex(idx);
      setSwipeOffset(0);
    }
  };

  const nextImage = () => {
    if (viewerIndex !== null) {
      setViewerIndex((viewerIndex + 1) % displayImages.length);
      setSwipeOffset(0);
    }
  };

  const prevImage = () => {
    if (viewerIndex !== null) {
      setViewerIndex((viewerIndex - 1 + displayImages.length) % displayImages.length);
      setSwipeOffset(0);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (viewerIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setViewerIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerIndex, displayImages.length]);

  // Touch gesture handlers for mobile & mouse drag for desktop
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    touchEndXRef.current = e.touches[0].clientX;
    const diff = touchEndXRef.current - touchStartXRef.current;
    // Dampen drag
    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const diff = touchEndXRef.current - touchStartXRef.current;
      const minSwipeDistance = 45; // threshold
      if (diff < -minSwipeDistance) {
        // Swiped left -> next photo
        nextImage();
      } else if (diff > minSwipeDistance) {
        // Swiped right -> prev photo
        prevImage();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    setSwipeOffset(0);
  };

  // Mouse Drag handlers for desktop swipe emulation
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartXRef.current = e.clientX;
    touchEndXRef.current = e.clientX;
    setIsSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping || touchStartXRef.current === null) return;
    touchEndXRef.current = e.clientX;
    const diff = touchEndXRef.current - touchStartXRef.current;
    setSwipeOffset(diff);
  };

  const handleMouseUp = () => {
    if (isSwiping) {
      handleTouchEnd();
    }
  };

  const renderCornerLikers = () => {
    if (!cornerLikers || cornerLikers.length === 0) return null;
    const likersToShow = cornerLikers.slice(0, 5);

    return (
      <div
        className="absolute bottom-2 right-2 z-10 w-24 h-16 select-none pointer-events-none"
        title="点赞的好友"
      >
        {likersToShow.map((liker, lIdx) => {
          const irregularOffsets = [
            { bottom: '6px', right: '6px', size: 'w-5 h-5', zIndex: 'z-20' },
            { bottom: '22px', right: '26px', size: 'w-4 h-4', zIndex: 'z-10' },
            { bottom: '2px', right: '34px', size: 'w-4.5 h-4.5', zIndex: 'z-15' },
            { bottom: '24px', right: '2px', size: 'w-4.5 h-4.5', zIndex: 'z-18' },
            { bottom: '36px', right: '16px', size: 'w-3.5 h-3.5', zIndex: 'z-12' },
          ];
          const pos = irregularOffsets[lIdx % irregularOffsets.length];
          return (
            <div
              key={`liker-${liker.id || lIdx}-${lIdx}`}
              style={{ bottom: pos.bottom, right: pos.right }}
              className={`absolute ${pos.zIndex}`}
            >
              <div className="relative">
                <img
                  src={liker.avatar}
                  alt={liker.name}
                  className={`${pos.size} rounded-full object-cover shrink-0 shadow-2xs ring-1 ring-white/90`}
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 text-white rounded-full flex items-center justify-center ring-1 ring-white shadow-2xs">
                  <Heart size={6} className="fill-white stroke-none" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Structured Grid Layouts (2-9 Photos optimization)
  const renderGridContent = () => {
    // 1 Image: Full width 16:9 banner
    if (count === 1) {
      return (
        <div
          onClick={(e) => handleImageClick(e, 0)}
          className="w-full aspect-[16/9] max-h-[380px] bg-slate-950 relative overflow-hidden group cursor-pointer"
        >
          <img
            src={displayImages[0]}
            alt="Dynamic photo 1"
            className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
          />
          {renderCornerLikers()}
        </div>
      );
    }

    // 2 Images: 2 columns, 1 row
    if (count === 2) {
      return (
        <div className="relative w-full grid grid-cols-2 gap-1.5 bg-white p-1">
          {displayImages.map((img, i) => (
            <div
              key={`g2-${i}`}
              onClick={(e) => handleImageClick(e, i)}
              className="relative aspect-square rounded-md overflow-hidden bg-slate-100 cursor-pointer group border border-[#E4E6EB]"
            >
              <img
                src={img}
                alt={`Dynamic photo ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          ))}
          {renderCornerLikers()}
        </div>
      );
    }

    // 3 Images: 3 columns, 1 row
    if (count === 3) {
      return (
        <div className="relative w-full grid grid-cols-3 gap-1.5 bg-white p-1">
          {displayImages.map((img, i) => (
            <div
              key={`g3-${i}`}
              onClick={(e) => handleImageClick(e, i)}
              className="relative aspect-square rounded-md overflow-hidden bg-slate-100 cursor-pointer group border border-[#E4E6EB]"
            >
              <img
                src={img}
                alt={`Dynamic photo ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          ))}
          {renderCornerLikers()}
        </div>
      );
    }

    // 4 Images: 2x2 grid (classic clean layout)
    if (count === 4) {
      return (
        <div className="relative w-full max-w-[340px] grid grid-cols-2 gap-1.5 bg-[#FFFFFF] p-1">
          {displayImages.map((img, i) => (
            <div
              key={`g4-${i}`}
              onClick={(e) => handleImageClick(e, i)}
              className="relative aspect-square rounded-md overflow-hidden bg-slate-100 cursor-pointer group border border-[#E4E6EB]"
            >
              <img
                src={img}
                alt={`Dynamic photo ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          ))}
          {renderCornerLikers()}
        </div>
      );
    }

    // 5 to 9 images: 3-column grid matrix
    return (
      <div className="relative w-full grid grid-cols-3 gap-1.5 bg-white p-1">
        {displayImages.map((img, i) => (
          <div
            key={`g9-${i}`}
            onClick={(e) => handleImageClick(e, i)}
            className="relative aspect-square rounded-md overflow-hidden bg-slate-100 cursor-pointer group border border-[#E4E6EB]"
          >
            <img
              src={img}
              alt={`Dynamic photo ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        ))}
        {renderCornerLikers()}
      </div>
    );
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full relative select-none">
      {renderGridContent()}

      {/* Fullscreen Photo Lightbox Modal with Swipe Gesture Support */}
      {viewerIndex !== null && (
        <div
          onClick={() => setViewerIndex(null)}
          className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5 animate-in fade-in duration-200 select-none"
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-between text-white z-20 px-2 py-2"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                {viewerIndex + 1} / {displayImages.length}
              </span>
              <span className="text-[11px] text-white/70 hidden sm:inline-block">
                支持左右滑动或点击箭头切换
              </span>
            </div>
            <button
              onClick={() => setViewerIndex(null)}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer transition-colors border border-white/20"
              title="关闭预览"
            >
              <X size={18} />
            </button>
          </div>

          {/* Interactive Image Display Area with Touch & Mouse Swipe Handlers */}
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="relative flex-1 w-full max-w-4xl flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing py-2"
          >
            <div
              className="relative flex items-center justify-center transition-transform duration-100 ease-out"
              style={{
                transform: `translateX(${swipeOffset}px)`,
              }}
            >
              <img
                src={displayImages[viewerIndex]}
                alt={`Full view ${viewerIndex + 1}`}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl pointer-events-none"
              />
            </div>

            {/* Left Button */}
            {displayImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-all border border-white/20 hover:scale-105 active:scale-95 z-20"
                title="上一张"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Right Button */}
            {displayImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-all border border-white/20 hover:scale-105 active:scale-95 z-20"
                title="下一张"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {displayImages.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-2 py-2 px-3 overflow-x-auto no-scrollbar max-w-full z-20 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-md"
            >
              {displayImages.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setViewerIndex(idx);
                    setSwipeOffset(0);
                  }}
                  className={`w-12 h-12 rounded-md overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${
                    idx === viewerIndex
                      ? 'border-[#1877F2] scale-105 ring-2 ring-[#1877F2]/40 shadow-lg opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-90'
                  }`}
                >
                  <img
                    src={thumb}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
