import React, { useState } from 'react';
import {
  Star,
  GitFork,
  Check,
  Zap,
  Terminal,
  Settings,
  ShieldCheck,
  Sparkles,
  Database,
  BarChart3,
  Kanban,
  Bug,
  BookOpen,
  FileCode2,
  Cpu,
  Radio,
  Compass,
  GraduationCap,
  TrendingUp,
  Clock,
  ChevronRight,
  BookMarked,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { SkillItem } from '../../data/skillsData';

interface SkillCardProps {
  skill: SkillItem;
  onSelect: (skill: SkillItem) => void;
  onToggleInstall: (skill: SkillItem, e: React.MouseEvent) => void;
  onToggleEnable: (skill: SkillItem, e: React.MouseEvent) => void;
  onStar: (skill: SkillItem, e: React.MouseEvent) => void;
  onOpenPlayground: (skill: SkillItem, e: React.MouseEvent) => void;
  onOpenConfig: (skill: SkillItem, e: React.MouseEvent) => void;
  onPracticeExp?: (skill: SkillItem, e: React.MouseEvent) => void;
  showToast?: (msg: string) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  onSelect,
  onToggleInstall,
  onToggleEnable,
  onStar,
  onOpenPlayground,
  onOpenConfig,
  onPracticeExp,
  showToast,
}) => {
  const isAvailable = skill.isAvailable !== false; // Only 高校课程管理 is available
  const isStellarLibrary = skill.displayName.includes('stellar 图书世界') || skill.id === 'skill-stellar-library';

  const handleCardClick = (e: React.MouseEvent) => {
    if (isStellarLibrary) {
      showToast?.('🚀 stellar 图书世界正在开发中，敬请期待！');
      return;
    }
    if (!isAvailable) {
      showToast?.(`🚧 【${skill.displayName}】正在开发中，敬请期待！`);
      return;
    }
    onSelect(skill);
  };

  const getSkillIcon = () => {
    const size = 18;
    const props = { size, className: "transition-transform group-hover:scale-105" };
    switch (skill.iconName) {
      case 'database':
        return <Database {...props} className="text-[#1877F2]" />;
      case 'bar-chart':
        return <BarChart3 {...props} className="text-[#31A24C]" />;
      case 'kanban':
        return <Kanban {...props} className="text-[#FA383E]" />;
      case 'bug':
        return <Bug {...props} className="text-[#F7941E]" />;
      case 'book-open':
        return <BookOpen {...props} className="text-[#1877F2]" />;
      case 'file-code':
        return <FileCode2 {...props} className="text-[#A371F7]" />;
      case 'sparkles':
        return <Sparkles {...props} className="text-[#F6851B]" />;
      case 'radar':
        return <Radio {...props} className="text-[#31A24C]" />;
      case 'compass':
        return <Compass {...props} className="text-[#1877F2]" />;
      default:
        return <BookOpen {...props} className="text-[#1877F2]" />;
    }
  };

  const isSkillActive = isAvailable && skill.isInstalled && skill.isEnabled;

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white border border-[#E4E6EB] rounded-none sm:rounded-md transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
        isSkillActive
          ? 'border-l-4 border-l-[#1877F2] bg-[#F7F9FC]'
          : 'hover:border-[#1877F2]/50 hover:bg-[#FAFAFA]'
      }`}
    >
      {/* Top Meta Line Header Row: Exactly 56px height specification (#E4E6EB divider) */}
      <div className="h-[56px] min-h-[56px] px-4 flex items-center justify-between border-b border-[#E4E6EB] bg-[#FAFAFA] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* 36x36 Icon Frame */}
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
              isSkillActive
                ? 'bg-[#E7F3FF] border-[#1877F2]/40'
                : 'bg-white border-[#E4E6EB]'
            }`}
          >
            {getSkillIcon()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-[#65676B] font-sans">
              <span className="font-semibold text-[#050505] truncate max-w-[120px]">{skill.author}</span>
              <span>·</span>
              <span className="text-[#65676B]">{skill.category}</span>
            </div>
            <h3 className="text-sm font-bold text-[#050505] group-hover:text-[#1877F2] transition-colors leading-tight truncate flex items-center gap-1">
              <span className="truncate">{skill.displayName}</span>
              {skill.isVerified && (
                <span title="官方认证"><ShieldCheck size={14} className="text-[#1877F2] shrink-0" /></span>
              )}
            </h3>
          </div>
        </div>

        {/* Status Pill Badge */}
        <div className="shrink-0">
          {isAvailable ? (
            <span className="px-2.5 py-1 rounded-full bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/30 text-[11px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] animate-ping" />
              可使用
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB] text-[11px] font-semibold flex items-center gap-1">
              <Clock size={11} className="text-[#65676B]" />
              正在开发中
            </span>
          )}
        </div>
      </div>

      {/* Card Body Section - Facebook Rectangular Group Card Style */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        {/* Tagline */}
        <p className="text-xs text-[#65676B] leading-relaxed line-clamp-2">
          {skill.tagline}
        </p>

        {/* Available Skill: Mastery / Progress track */}
        {isAvailable ? (
          <div className="p-2.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-sm space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-[#050505]">
                <GraduationCap size={13} className="text-[#1877F2]" />
                <span>全流程学期协同</span>
                <span className="px-1.5 py-0.2 rounded bg-[#E7F3FF] text-[#1877F2] text-[10px]">
                  Lv.5 · {skill.mastery.tierTitle}
                </span>
              </div>
              <span className="text-xs font-bold text-[#1877F2]">98%</span>
            </div>

            <div className="w-full h-1.5 bg-[#E4E6EB] rounded-full overflow-hidden">
              <div className="h-full bg-[#1877F2] rounded-full w-[98%]" />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#65676B] pt-0.5">
              <span>关联大纲解析与作业倒排</span>
              <span className="text-[#1877F2] font-semibold">协同就绪</span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-[#FAFAFA] border border-[#E4E6EB] rounded-sm text-[11px] text-[#65676B] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-[#65676B]" />
              <span>开发准备中 (Coming Soon)</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-[#F0F2F5] text-[#65676B] rounded border border-[#E4E6EB] font-mono">
              v1.0.0-dev
            </span>
          </div>
        )}

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {skill.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 bg-[#F0F2F5] text-[#65676B] border border-[#E4E6EB] rounded-none font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer Row: 1px top grey divider (#E4E6EB) */}
      <div className="px-4 py-2.5 bg-[#FAFAFA] border-t border-[#E4E6EB] flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-[11px] text-[#65676B]">
          <span className="flex items-center gap-1 font-medium text-[#050505]">
            <span className="w-2 h-2 rounded-full bg-[#3178C6]" />
            {skill.language}
          </span>
          <span className="flex items-center gap-1">
            <Star size={12} className="text-[#F7941E]" />
            {skill.stars}
          </span>
        </div>

        <div>
          {isAvailable ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPlayground(skill, e);
              }}
              className="px-3 py-1 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-sm text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              {skill.id === 'skill-ebook' ? (
                <BookOpen size={12} />
              ) : skill.id === 'skill-city-cost-of-living' ? (
                <BarChart3 size={12} />
              ) : (
                <Terminal size={12} />
              )}
              <span>
                {skill.id === 'skill-ebook' || skill.id === 'skill-city-cost-of-living'
                  ? '进入产品首页'
                  : '操作协同沙盒'}
              </span>
            </button>
          ) : (
            <button
              onClick={handleCardClick}
              className="px-3 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] font-semibold rounded-sm text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>查看进度</span>
              <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
