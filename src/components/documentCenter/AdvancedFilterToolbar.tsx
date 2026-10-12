import React, { useState } from 'react';
import {
  Filter,
  Calendar,
  Layers,
  ArrowUpDown,
  Users,
  Grid,
  List,
  RotateCcw,
  ChevronDown,
  Sparkles,
  Check,
} from 'lucide-react';

export type TimeFilterType = 'all' | 'today' | '7days' | '30days' | 'year';
export type FileTypeFilter = 'all' | 'photo' | 'document' | 'pdf' | 'excel' | 'note' | 'link';
export type SortOrderType = 'time_desc' | 'time_asc' | 'name_asc' | 'size_desc';
export type ViewModeType = 'grid' | 'list';

export interface FilterState {
  time: TimeFilterType;
  fileType: FileTypeFilter;
  sourceGroup: string; // 'all' | 'personal' | conversationId
  sortOrder: SortOrderType;
  viewMode: ViewModeType;
}

interface AdvancedFilterToolbarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableGroups: { id: string; name: string; avatar: string }[];
  totalResultCount: number;
}

export const AdvancedFilterToolbar: React.FC<AdvancedFilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableGroups,
  totalResultCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isFiltered =
    filters.time !== 'all' ||
    filters.fileType !== 'all' ||
    filters.sourceGroup !== 'all' ||
    filters.sortOrder !== 'time_desc';

  const timeOptions: { label: string; value: TimeFilterType }[] = [
    { label: '全部时间', value: 'all' },
    { label: '今天', value: 'today' },
    { label: '近 7 天', value: '7days' },
    { label: '近 30 天', value: '30days' },
    { label: '本年度', value: 'year' },
  ];

  const sortOptions: { label: string; value: SortOrderType }[] = [
    { label: '🕒 最近上传 (最新)', value: 'time_desc' },
    { label: '📅 最早创建 (正序)', value: 'time_asc' },
    { label: '🔤 名称字母 (A-Z)', value: 'name_asc' },
    { label: '📦 文件大小 (大到小)', value: 'size_desc' },
  ];

  const typeOptions: { label: string; value: FileTypeFilter }[] = [
    { label: '全部类型', value: 'all' },
    { label: '🖼️ 图片相册', value: 'photo' },
    { label: '📑 PDF 文件', value: 'pdf' },
    { label: '📄 常用文档', value: 'document' },
    { label: '📊 表格数据', value: 'excel' },
    { label: '📝 随手笔记', value: 'note' },
    { label: '🔗 网页链接', value: 'link' },
  ];

  return (
    <div className="bg-white border-b border-gray-200/80 px-4 py-2 text-xs font-sans transition-all">
      {/* Primary Toolbar Row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
        {/* Left Filter Triggers */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-3 py-1.5 rounded-full font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isExpanded || isFiltered
                ? 'bg-[#1877F2] text-white shadow-2xs'
                : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505]'
            }`}
          >
            <Filter size={12} />
            <span>高级筛选</span>
            {isFiltered && (
              <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white"></span>
            )}
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Quick Time Pills */}
          <div className="hidden sm:flex items-center space-x-1 pl-1">
            {timeOptions.slice(0, 3).map((t) => (
              <button
                key={`quick-time-${t.value}`}
                type="button"
                onClick={() => onFilterChange({ time: t.value })}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  filters.time === t.value
                    ? 'bg-blue-50 text-[#1877F2]'
                    : 'text-[#65676B] hover:bg-[#F0F2F5]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Group Source Dropdown Selector */}
          <div className="relative">
            <select
              value={filters.sourceGroup}
              onChange={(e) => onFilterChange({ sourceGroup: e.target.value })}
              className="px-2.5 py-1.5 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-xs font-bold text-[#050505] outline-none cursor-pointer border-none pr-6 appearance-none"
            >
              <option value="all">👥 全部群组与个人</option>
              <option value="personal">👤 个人专属</option>
              {availableGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  💬 {g.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>

          {/* Reset button if filtered */}
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              title="重置所有筛选条件"
              className="px-2 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RotateCcw size={11} />
              <span>重置</span>
            </button>
          )}
        </div>

        {/* Right Sort & View Mode Switcher */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[11px] text-[#65676B] hidden md:inline">
            共 {totalResultCount} 条
          </span>

          {/* Sort selector */}
          <div className="relative">
            <select
              value={filters.sortOrder}
              onChange={(e) => onFilterChange({ sortOrder: e.target.value as SortOrderType })}
              className="px-2.5 py-1.5 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-xs font-bold text-[#050505] outline-none cursor-pointer border-none pr-6 appearance-none"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ArrowUpDown
              size={11}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F0F2F5] rounded-full p-0.5">
            <button
              type="button"
              onClick={() => onFilterChange({ viewMode: 'grid' })}
              title="网格视图"
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                filters.viewMode === 'grid'
                  ? 'bg-white text-[#1877F2] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Grid size={13} />
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ viewMode: 'list' })}
              title="列表视图"
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                filters.viewMode === 'list'
                  ? 'bg-white text-[#1877F2] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <List size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Multi-dimension Filter Matrix */}
      {isExpanded && (
        <div className="pt-2.5 pb-1 mt-2 border-t border-gray-100 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* File Types Row */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#65676B] shrink-0 w-16">文件类型：</span>
            <div className="flex items-center flex-wrap gap-1">
              {typeOptions.map((t) => (
                <button
                  key={`type-opt-${t.value}`}
                  type="button"
                  onClick={() => onFilterChange({ fileType: t.value })}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    filters.fileType === t.value
                      ? 'bg-[#1877F2] text-white shadow-2xs'
                      : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Filter Row */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#65676B] shrink-0 w-16">时间跨度：</span>
            <div className="flex items-center flex-wrap gap-1">
              {timeOptions.map((t) => (
                <button
                  key={`full-time-${t.value}`}
                  type="button"
                  onClick={() => onFilterChange({ time: t.value })}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    filters.time === t.value
                      ? 'bg-[#1877F2] text-white shadow-2xs'
                      : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
