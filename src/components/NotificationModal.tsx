import React from 'react';
import { X, Bell, MessageCircle, Shield, CheckCircle, Calendar, MapPin, Clock } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between pt-[56px] pb-[70px] pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={onClose} />

      {/* Card connecting top and bottom nav bars */}
      <div className="relative w-full h-full max-w-lg mx-auto bg-white border-y sm:border sm:rounded-md border-[#E4E6EB] shadow-lg flex flex-col z-10 pointer-events-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between bg-[#F0F2F5]/90 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#1877F2]">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="font-bold text-[#050505] text-sm">通知与动态中心</h3>
              <p className="text-[10px] text-[#65676B]">实时接收好友动态、活动日程、家常菜分享及系统广播</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#1877F2] hover:underline font-semibold cursor-pointer px-2 py-1"
            >
              全部已读
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-[#65676B] cursor-pointer"
              aria-label="关闭通知"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Extended Scrollable Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E4E6EB] custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#65676B]">暂无新通知</div>
          ) : (
            notifications.map((item) => {
              const isCal = item.title.includes('日程') || item.title.includes('活动');
              const isFood = item.title.includes('家常菜') || item.content.includes('家常菜');
              const categoryLabel = isFood ? '家常菜 · 生活' : isCal ? '活动日程' : item.type === 'radar' ? '雷达动态' : item.type === 'message' ? '即时私信' : '系统广播';
              const categoryColor = isFood ? 'bg-amber-100 text-amber-800' : isCal ? 'bg-blue-100 text-blue-700' : item.type === 'radar' ? 'bg-emerald-100 text-emerald-700' : item.type === 'message' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700';

              return (
                <div
                  key={`notif-${item.id}`}
                  className={`p-3.5 hover:bg-[#F0F2F5]/70 transition-colors flex space-x-3 ${
                    !item.read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="shrink-0 pt-0.5">
                    {isFood ? (
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-2xs">
                        <span className="text-base">🍲</span>
                      </div>
                    ) : isCal ? (
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-[#1877F2] flex items-center justify-center shadow-2xs">
                        <Calendar size={18} />
                      </div>
                    ) : item.type === 'message' ? (
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-[#1877F2] flex items-center justify-center">
                        <MessageCircle size={18} />
                      </div>
                    ) : item.type === 'radar' ? (
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Shield size={18} />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <CheckCircle size={18} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-[#050505]">{item.title}</h4>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold ${categoryColor}`}>
                          {categoryLabel}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#65676B] shrink-0 flex items-center space-x-1">
                        <Clock size={10} />
                      </span>
                    </div>
                    {/* More detailed content info */}
                    <p className="text-[11.5px] text-[#333333] leading-relaxed mt-1">
                      {item.content}
                    </p>
                    <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-[#65676B]">
                      <span className="flex items-center space-x-1">
                        <MapPin size={10} className="text-[#1877F2]" />
                        <span>金城兰州 · 核心商圈/生活圈</span>
                      </span>
                      <span>•</span>
                      <span className="text-[#1877F2] font-medium">状态：已同步到实时地图</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F0F2F5]/90 border-t border-[#E4E6EB] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#65676B]">共 {notifications.length} 条详细动态与通知记录</span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-md text-xs transition-colors cursor-pointer shadow-xs"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
