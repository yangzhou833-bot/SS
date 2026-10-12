import React from 'react';
import {
  Upload,
  FolderInput,
  Star,
  Sparkles,
  Share2,
  FileCheck,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { ActivityTimelineItem } from '../../data/documentCenterData';

interface DocumentTimelineFeedProps {
  activities: ActivityTimelineItem[];
  onSelectActivity?: (activity: ActivityTimelineItem) => void;
  maxItems?: number;
}

export const DocumentTimelineFeed: React.FC<DocumentTimelineFeedProps> = ({
  activities = [],
  onSelectActivity,
  maxItems = 5,
}) => {
  const displayItems = (activities || []).slice(0, maxItems);

  const getActionIcon = (type: ActivityTimelineItem['type']) => {
    switch (type) {
      case 'upload':
        return <Upload size={13} className="text-[#1877F2]" />;
      case 'move':
        return <FolderInput size={13} className="text-[#42B72A]" />;
      case 'star':
        return <Star size={13} className="text-[#F7B928] fill-[#F7B928]" />;
      case 'ai_archive':
        return <Sparkles size={13} className="text-[#9333EA]" />;
      case 'share':
        return <Share2 size={13} className="text-[#1877F2]" />;
      case 'ocr':
        return <FileCheck size={13} className="text-[#FA383E]" />;
      default:
        return <Clock size={13} className="text-gray-500" />;
    }
  };

  const getActionBadgeBg = (type: ActivityTimelineItem['type']) => {
    switch (type) {
      case 'upload':
        return 'bg-blue-50 border-blue-100';
      case 'move':
        return 'bg-green-50 border-green-100';
      case 'star':
        return 'bg-amber-50 border-amber-100';
      case 'ai_archive':
        return 'bg-purple-50 border-purple-100';
      case 'share':
        return 'bg-sky-50 border-sky-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="space-y-3.5 relative">
      {displayItems.map((item, idx) => {
        const isLast = idx === displayItems.length - 1;

        return (
          <div
            key={item.id}
            onClick={() => onSelectActivity?.(item)}
            className="group relative flex items-start space-x-3.5 cursor-pointer"
          >
            {/* Timeline Vertical Connecting Line */}
            {!isLast && (
              <div
                className="absolute left-5 top-10 bottom-0 w-[2px] bg-gray-200/90 -ml-[1px]"
                aria-hidden="true"
              />
            )}

            {/* User Avatar with Mini Action Badge */}
            <div className="relative shrink-0 z-10">
              <img
                src={item.userAvatar}
                alt={item.userName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-2xs group-hover:ring-[#1877F2]/40 transition-all"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-white flex items-center justify-center shadow-2xs ${getActionBadgeBg(
                  item.type
                )}`}
              >
                {getActionIcon(item.type)}
              </div>
            </div>

            {/* Activity Info Content */}
            <div className="flex-1 min-w-0 pt-0.5 pb-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-[13px] font-bold text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                  {item.userName}
                </h4>
                <span className="text-[11px] font-medium text-[#65676B] shrink-0">
                  {item.timeAgo}
                </span>
              </div>

              <p className="text-xs text-[#65676B] mt-0.5 leading-relaxed break-words">
                {item.actionText}
              </p>

              {item.targetName && (
                <div className="mt-1.5 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-gray-100 group-hover:bg-blue-50 text-[11px] font-medium text-gray-700 group-hover:text-[#1877F2] transition-colors">
                  <span className="truncate max-w-[200px]">{item.targetName}</span>
                  <ChevronRight size={12} className="shrink-0 opacity-60" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
