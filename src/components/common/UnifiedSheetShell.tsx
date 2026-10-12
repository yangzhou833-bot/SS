import React, { useEffect, ReactNode, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'motion/react';

interface UnifiedSheetShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: 'compact' | 'half' | 'full';
}

export const UnifiedSheetShell: React.FC<UnifiedSheetShellProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  height = 'half',
}) => {
  const heightClasses = {
    compact: 'h-[40vh]',
    half: 'h-[70vh]',
    full: 'h-[90vh]',
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] pointer-events-auto"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className={`relative w-full bg-white rounded-t-2xl border-t border-x border-[#E4E6EB] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex flex-col pointer-events-auto overflow-hidden z-10 ${heightClasses[height]} pb-[env(safe-area-inset-bottom)]`}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-[#CED0D4] rounded-full mt-2 mb-1.5 mx-auto shrink-0 touch-none" />
            
            {/* Header */}
            <div className="px-4 py-2 flex items-center justify-between shrink-0 border-b border-[#E4E6EB]">
              <div className="min-w-0 pr-4">
                <h3 className="text-sm font-black text-[#050505] tracking-tight truncate">{title}</h3>
                {subtitle && <p className="text-[10px] text-[#65676B] font-medium mt-0.5 truncate">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-[#65676B] transition-colors cursor-pointer shrink-0"
              >
                <span className="sr-only">关闭</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
