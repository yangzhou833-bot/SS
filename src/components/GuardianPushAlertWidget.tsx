import React, { useEffect, useState } from 'react';
import { ShieldAlert, ChevronRight, X } from 'lucide-react';

export interface GuardianAlertData {
  id: string;
  senderName: string;
  senderAvatar: string;
  role: string;
  message: string;
  conversationId: string;
  time: string;
}

interface GuardianPushAlertWidgetProps {
  alert: GuardianAlertData | null;
  onDismiss: () => void;
  onClickAlert: (alert: GuardianAlertData) => void;
}

export const GuardianPushAlertWidget: React.FC<GuardianPushAlertWidgetProps> = ({
  alert,
  onDismiss,
  onClickAlert,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [alert]);

  if (!alert || !isVisible) return null;

  return (
    <div className="absolute left-3 top-24 z-50 flex items-start gap-2.5 max-w-[290px] animate-in slide-in-from-left duration-300">
      {/* 3D Volumetric Guardian Avatar with Red-Orange Emergency Pulse & Deep Shadow */}
      <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => onClickAlert(alert)}>
        <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full blur-md opacity-80 animate-pulse"></div>
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-[0_15px_35px_rgba(239,68,68,0.5)] transform transition-transform duration-200 group-hover:scale-105">
          <img
            src={alert.senderAvatar}
            alt={alert.senderName}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Safety Shield Badge */}
        <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow-lg border border-white">
          <ShieldAlert className="w-3 h-3 animate-bounce" />
        </div>
      </div>

      {/* 3D Speech Bubble (Push Ad Style with Rich Shadows & Depth) */}
      <div
        onClick={() => onClickAlert(alert)}
        className="relative flex-1 bg-gradient-to-br from-red-950/95 via-gray-900/95 to-gray-950/95 text-white rounded-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_25px_rgba(239,68,68,0.3)] border border-red-500/40 backdrop-blur-xl cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-95 group"
      >
        {/* Left Arrow Pointer towards avatar */}
        <div className="absolute -left-2 top-4 w-3 h-3 bg-red-950 border-l border-t border-red-500/40 transform -rotate-45"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-red-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              {alert.senderName} ({alert.role})
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="text-gray-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
            title="忽略"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alert Body Text */}
        <p className="text-xs leading-relaxed text-gray-100 font-medium line-clamp-3 mb-2">
          {alert.message}
        </p>

        {/* Footer Click Prompt */}
        <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px] text-red-300 font-semibold">
          <span className="flex items-center gap-1">
            点击自动转入聊天并记录
          </span>
          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
