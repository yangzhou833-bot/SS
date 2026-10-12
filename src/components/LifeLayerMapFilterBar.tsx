import React from 'react';
import { LifePlaceCategory } from '../types';
import { LIFE_PLACE_CATEGORIES } from '../data/lifeLayerStore';
import { Sparkles, Plus, Filter, User, Users, MapPin, X } from 'lucide-react';
import { haptics } from '../utils/haptics';

export interface LifeLayerFilterState {
  category: LifePlaceCategory | 'all';
  creator: 'all' | 'mine' | 'friends';
  onlyTogether: boolean; // "Places we've been to together"
}

interface LifeLayerMapFilterBarProps {
  filterState: LifeLayerFilterState;
  onChangeFilter: (next: LifeLayerFilterState) => void;
  onOpenCreate: () => void;
  activeCount: number;
  totalCount: number;
}

export const LifeLayerMapFilterBar: React.FC<LifeLayerMapFilterBarProps> = ({
  filterState,
  onChangeFilter,
  onOpenCreate,
  activeCount,
  totalCount,
}) => {
  const handleCategorySelect = (catKey: LifePlaceCategory | 'all') => {
    haptics.trigger('light');
    onChangeFilter({
      ...filterState,
      category: catKey,
    });
  };

  const handleCreatorSelect = (creator: 'all' | 'mine' | 'friends') => {
    haptics.trigger('light');
    onChangeFilter({
      ...filterState,
      creator,
    });
  };

  const handleTogetherToggle = () => {
    haptics.trigger('light');
    onChangeFilter({
      ...filterState,
      onlyTogether: !filterState.onlyTogether,
    });
  };

  const isFiltered = filterState.category !== 'all' || filterState.creator !== 'all' || filterState.onlyTogether;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-3 bg-white/95 backdrop-blur-md border-b border-[#E4E6EB] shadow-2xs select-none scrollbar-none text-xs">
      {/* Layer Badge and Count */}
      <div className="flex items-center gap-1 shrink-0 pr-1.5 border-r border-[#E4E6EB]">
        <span className="w-2 h-2 rounded-full bg-[#1877F2] animate-pulse" />
        <span className="font-bold text-[#1C1E21] text-[11px]">生活图层</span>
        <span className="text-[10px] font-mono text-[#8A8D91] bg-[#F0F2F5] px-1.5 py-0.2 rounded-full">
          {activeCount}/{totalCount}
        </span>
      </div>

      {/* "Places We've Been to Together" Signature Co-presence Filter */}
      <button
        type="button"
        onClick={handleTogetherToggle}
        className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 flex items-center gap-1 border transition-all cursor-pointer ${
          filterState.onlyTogether
            ? 'bg-amber-50 text-amber-800 border-amber-400 shadow-2xs scale-105'
            : 'bg-[#F7F8FA] hover:bg-[#EDF2F7] text-[#65676B] border-[#E4E6EB]'
        }`}
      >
        <Sparkles size={11} className={filterState.onlyTogether ? 'text-amber-500 fill-amber-400' : 'text-[#8A8D91]'} />
        <span>共同相遇记忆</span>
      </button>

      {/* Creator Filter */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => handleCreatorSelect('all')}
          className={`px-2 py-1 rounded-md text-[11px] font-medium border cursor-pointer ${
            filterState.creator === 'all'
              ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]/40 font-bold'
              : 'bg-[#F7F8FA] text-[#65676B] border-[#E4E6EB]'
          }`}
        >
          全部来源
        </button>
        <button
          type="button"
          onClick={() => handleCreatorSelect('mine')}
          className={`px-2 py-1 rounded-md text-[11px] font-medium border flex items-center gap-0.5 cursor-pointer ${
            filterState.creator === 'mine'
              ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]/40 font-bold'
              : 'bg-[#F7F8FA] text-[#65676B] border-[#E4E6EB]'
          }`}
        >
          <User size={10} />
          <span>由我创建</span>
        </button>
        <button
          type="button"
          onClick={() => handleCreatorSelect('friends')}
          className={`px-2 py-1 rounded-md text-[11px] font-medium border flex items-center gap-0.5 cursor-pointer ${
            filterState.creator === 'friends'
              ? 'bg-[#E7F3FF] text-[#1877F2] border-[#1877F2]/40 font-bold'
              : 'bg-[#F7F8FA] text-[#65676B] border-[#E4E6EB]'
          }`}
        >
          <Users size={10} />
          <span>好友分享</span>
        </button>
      </div>

      <div className="w-[1px] h-4 bg-[#E4E6EB] shrink-0" />

      {/* Category Pills */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => handleCategorySelect('all')}
          className={`px-2 py-1 rounded-md text-[11px] border cursor-pointer ${
            filterState.category === 'all'
              ? 'bg-[#1877F2] text-white border-[#1877F2] font-bold shadow-2xs'
              : 'bg-[#F7F8FA] text-[#65676B] border-[#E4E6EB] hover:bg-[#EDF2F7]'
          }`}
        >
          全部分类
        </button>

        {LIFE_PLACE_CATEGORIES.map((cat) => {
          const isSelected = filterState.category === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleCategorySelect(cat.key)}
              className={`px-2 py-1 rounded-md text-[11px] border flex items-center gap-1 shrink-0 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white border-[#1877F2] text-[#1877F2] font-bold shadow-2xs'
                  : 'bg-[#F7F8FA] text-[#65676B] border-[#E4E6EB] hover:bg-[#EDF2F7]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Reset Filter Button if active */}
      {isFiltered && (
        <button
          type="button"
          onClick={() => {
            haptics.trigger('light');
            onChangeFilter({ category: 'all', creator: 'all', onlyTogether: false });
          }}
          className="p-1 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#8A8D91] hover:text-[#1C1E21] text-[10px] flex items-center gap-0.5 shrink-0 cursor-pointer"
          title="重置筛选"
        >
          <X size={11} />
          <span>重置</span>
        </button>
      )}

      {/* Add Place Shortcut */}
      <button
        type="button"
        onClick={() => {
          haptics.trigger('light');
          onOpenCreate();
        }}
        className="ml-auto px-2.5 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white text-[11px] font-bold rounded-md shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
      >
        <Plus size={12} />
        <span>添加地点</span>
      </button>
    </div>
  );
};
