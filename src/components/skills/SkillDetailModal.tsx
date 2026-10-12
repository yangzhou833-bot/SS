import React, { useState } from 'react';
import {
  X,
  Star,
  GitFork,
  Check,
  Zap,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  Copy,
  BookOpen,
  FileCode,
  Sliders,
  History,
  GraduationCap,
  TrendingUp,
  BookMarked,
  Layers,
  Database,
  BarChart3,
  Kanban,
  Bug,
  FileCode2,
  Radio,
  Compass,
  Cpu
} from 'lucide-react';
import { SkillItem, SkillConfigItem } from '../../data/skillsData';

interface SkillDetailModalProps {
  skill: SkillItem;
  onClose: () => void;
  onToggleInstall: (skill: SkillItem) => void;
  onToggleEnable: (skill: SkillItem) => void;
  onStar: (skill: SkillItem) => void;
  onOpenPlayground: (skill: SkillItem) => void;
  onOpenConfig: (skill: SkillItem) => void;
  onPracticeExp?: (skill: SkillItem) => void;
  showToast: (msg: string) => void;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({
  skill,
  onClose,
  onToggleInstall,
  onToggleEnable,
  onStar,
  onOpenPlayground,
  onOpenConfig,
  onPracticeExp,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'readme' | 'mastery' | 'config' | 'capabilities' | 'releases'>('readme');
  const [copiedInstallCmd, setCopiedInstallCmd] = useState(false);

  const installCommand = `npx stellar-skills install @${skill.repoName}`;

  const handleCopyInstallCmd = () => {
    navigator.clipboard.writeText(installCommand);
    setCopiedInstallCmd(true);
    showToast('📋 已复制 CLI 安装命令至剪贴板！');
    setTimeout(() => setCopiedInstallCmd(false), 2000);
  };

  const getSkillIcon = () => {
    const size = 20;
    switch (skill.iconName) {
      case 'database':
        return <Database size={size} className="text-[#1877F2]" />;
      case 'bar-chart':
        return <BarChart3 size={size} className="text-[#00A400]" />;
      case 'kanban':
        return <Kanban size={size} className="text-[#FA383E]" />;
      case 'bug':
        return <Bug size={size} className="text-[#D29922]" />;
      case 'book-open':
        return <BookOpen size={size} className="text-[#58A6FF]" />;
      case 'file-code':
        return <FileCode2 size={size} className="text-[#A371F7]" />;
      case 'sparkles':
        return <Sparkles size={size} className="text-[#F6851B]" />;
      case 'radar':
        return <Radio size={size} className="text-[#3FB950]" />;
      case 'compass':
        return <Compass size={size} className="text-[#58A6FF]" />;
      default:
        return <Cpu size={size} className="text-[#1877F2]" />;
    }
  };

  const isSkillActive = skill.isInstalled && skill.isEnabled;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm animate-fade-in font-sans">
      <div className={`bg-white border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
        isSkillActive
          ? 'border-[#1877F2] animate-meta-breathe shadow-lg'
          : 'border-[#E4E6EB]'
      }`}>
        {/* Modal Top Navbar */}
        <div className="bg-white px-4 sm:px-6 py-3.5 border-b border-[#E4E6EB] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${
              isSkillActive
                ? 'bg-[#E7F3FF] border-[#1877F2] animate-meta-icon-pulse'
                : 'bg-[#F0F2F5] border-[#E4E6EB]'
            }`}>
              {getSkillIcon()}
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-[#65676B] font-semibold">{skill.author}</span>
              <span className="text-xs text-[#CED0D4]">/</span>
              <span className="text-sm font-bold text-[#050505] truncate">{skill.displayName}</span>
              {skill.isVerified && (
                <span title="官方学术认证"><ShieldCheck size={15} className="text-[#1877F2] shrink-0" /></span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onStar(skill)}
              className="px-3 py-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Star size={13} className="text-[#F7941E]" />
              <span>{skill.stars}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#65676B] hover:text-[#050505] rounded-full hover:bg-[#F0F2F5] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Header Banner */}
        <div className="bg-[#F0F2F5]/50 px-4 sm:px-6 py-3.5 border-b border-[#E4E6EB] flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 max-w-lg">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#050505]">{skill.displayName}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/20 font-bold">
                {skill.category}
              </span>
            </div>
            <p className="text-xs text-[#65676B] leading-relaxed">{skill.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {skill.isInstalled ? (
              <>
                <button
                  onClick={() => onOpenPlayground(skill)}
                  className="px-3 py-1.5 bg-[#E7F3FF] hover:bg-[#DBECFE] text-[#1877F2] border border-[#1877F2]/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                >
                  {skill.id === 'skill-ebook' ? (
                    <BookOpen size={14} />
                  ) : skill.id === 'skill-city-cost-of-living' ? (
                    <BarChart3 size={14} />
                  ) : (
                    <Terminal size={14} />
                  )}
                  <span>
                    {skill.id === 'skill-ebook' || skill.id === 'skill-city-cost-of-living'
                      ? '进入产品首页'
                      : '交互沙盒'}
                  </span>
                </button>

                <button
                  onClick={() => onOpenConfig(skill)}
                  className="px-3 py-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings size={14} />
                  <span>配置</span>
                </button>

                <button
                  onClick={() => onToggleEnable(skill)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs ${
                    isSkillActive
                      ? 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
                      : 'bg-[#E4E6EB] text-[#050505] hover:bg-[#D8DADF]'
                  }`}
                >
                  <Zap size={13} className={isSkillActive ? "fill-white" : ""} />
                  <span>{isSkillActive ? '已激活 (课程可用)' : '未激活 (点击装载)'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onToggleInstall(skill)}
                className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Zap size={14} />
                <span>安装并激活</span>
              </button>
            )}
          </div>
        </div>

        {/* CLI Quick Clone Strip */}
        <div className="bg-white px-4 sm:px-6 py-2 border-b border-[#E4E6EB] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0 text-[#65676B]">
            <span className="text-[#1877F2] font-black">$</span>
            <span className="truncate text-[#050505] font-mono">{installCommand}</span>
          </div>

          <button
            onClick={handleCopyInstallCmd}
            className="px-2.5 py-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#1877F2] rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
          >
            {copiedInstallCmd ? <Check size={12} className="text-[#31A24C]" /> : <Copy size={12} />}
            <span>{copiedInstallCmd ? '已复制' : '复制命令'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white px-4 sm:px-6 pt-2 border-b border-[#E4E6EB] flex items-center gap-2 text-xs font-semibold overflow-x-auto no-scrollbar">
          {[
            { id: 'readme', label: 'SKILL.md / 详情', icon: BookOpen },
            { id: 'mastery', label: `熟练度与课程 (${skill.mastery.percentage}%)`, icon: GraduationCap },
            { id: 'capabilities', label: `能力钩子 (${skill.capabilities.length})`, icon: Sparkles },
            { id: 'config', label: '参数 Schema', icon: Sliders },
            { id: 'releases', label: '版本日志', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#E7F3FF] text-[#1877F2] font-bold border-b-2 border-[#1877F2]'
                    : 'text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#050505]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs leading-relaxed bg-[#F0F2F5]/30">
          
          {/* Tab 1: Readme Viewer */}
          {activeTab === 'readme' && (
            <div className="space-y-4">
              {/* Quick Info Box */}
              <div className="p-4 bg-white border border-[#E4E6EB] rounded-2xl space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#050505]">
                    <BookMarked size={16} className="text-[#1877F2]" />
                    <span>使用说明与任务接入</span>
                  </div>
                  <span className="text-xs font-semibold text-[#1877F2] bg-[#E7F3FF] px-2.5 py-0.5 rounded-full border border-[#1877F2]/20">
                    Lv.{skill.mastery.level} · {skill.mastery.tierTitle}
                  </span>
                </div>
                <p className="text-xs text-[#65676B] leading-relaxed">
                  {skill.usageGuide}
                </p>

                <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-[#65676B] mr-1">适用课程任务：</span>
                  {skill.courseTasks.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10.5px] px-2 py-0.5 rounded-md bg-[#F0F2F5] text-[#050505] border border-[#E4E6EB]"
                    >
                      🎯 {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Formatted Markdown Content */}
              <div className="bg-white border border-[#E4E6EB] rounded-2xl p-4 sm:p-6 space-y-4 font-sans shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB] text-xs text-[#65676B]">
                  <span className="flex items-center gap-1.5 text-[#050505] font-bold">
                    <FileCode size={14} className="text-[#1877F2]" />
                    <span>SKILL.md</span>
                  </span>
                  <span>{skill.readme.length} bytes · Markdown</span>
                </div>

                <div className="prose max-w-none text-xs space-y-3 text-[#050505]">
                  <pre className="p-3.5 bg-[#F0F2F5] rounded-xl border border-[#E4E6EB] overflow-x-auto text-[11px] font-mono text-[#050505] leading-relaxed whitespace-pre-wrap">
                    {skill.readme}
                  </pre>
                </div>

                {/* Tags */}
                <div className="pt-3 border-t border-[#E4E6EB] flex flex-wrap items-center gap-1.5">
                  <span className="text-[#65676B] text-[11px] mr-1">Tags:</span>
                  {skill.tags.map((t, tIdx) => (
                    <span
                      key={`skill-tag-${t}-${tIdx}`}
                      className="text-[10.5px] bg-[#E7F3FF] text-[#1877F2] px-2.5 py-0.5 rounded-full border border-[#1877F2]/20 font-semibold"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Mastery & Course Tasks */}
          {activeTab === 'mastery' && (
            <div className="space-y-4">
              <div className="p-5 bg-white border border-[#E4E6EB] rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#050505] flex items-center gap-2">
                      <GraduationCap size={16} className="text-[#1877F2]" />
                      <span>星航者学术技能树熟练度</span>
                    </h4>
                    <p className="text-xs text-[#65676B] mt-0.5">
                      熟练度越高，在后续实验任务中的自动化推演速度与准确率加成越强。
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-[#1877F2]">
                      Lv.{skill.mastery.level} / {skill.mastery.maxLevel}
                    </div>
                    <div className="text-[11px] text-[#65676B]">{skill.mastery.tierTitle}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#65676B]">当前掌握度 (EXP)</span>
                    <span className="text-[#1877F2] font-bold">
                      {skill.mastery.exp} / {skill.mastery.maxExp} XP ({skill.mastery.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#E4E6EB] rounded-full overflow-hidden p-0.5 flex items-center">
                    <div
                      className="h-full rounded-full bg-[#1877F2] transition-all duration-500"
                      style={{ width: `${skill.mastery.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E4E6EB] flex items-center justify-between">
                  <span className="text-xs text-[#65676B]">
                    已在【学海灯塔】课程体系中累计调用 24 次
                  </span>
                  <button
                    onClick={() => onPracticeExp?.(skill)}
                    className="px-3.5 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                  >
                    <TrendingUp size={13} />
                    <span>+15 XP 模拟演练提升</span>
                  </button>
                </div>
              </div>

              {/* Supported Course Tasks Card */}
              <div className="p-4 bg-white border border-[#E4E6EB] rounded-2xl space-y-3 shadow-xs">
                <h5 className="font-bold text-xs text-[#050505]">
                  📚 适用后续课程任务与实验列表：
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {skill.courseTasks.map((task, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="text-[#050505]">🎯 {task}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7F3FF] text-[#1877F2] font-bold">
                        可协同
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Capabilities Checklist */}
          {activeTab === 'capabilities' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#050505]">
                ⚡ 该 Skill 提供的核心系统能力与钩子 (Capabilities & Hooks)：
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {skill.capabilities.map((cap, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white border border-[#E4E6EB] rounded-xl flex items-start gap-2.5 shadow-2xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#E7F3FF] border border-[#1877F2]/30 flex items-center justify-center text-[#1877F2] shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <h5 className="font-bold text-[#050505] text-xs">{cap}</h5>
                      <span className="text-[10.5px] text-[#65676B]">
                        系统已挂载为原生事件处理器，支持在地图和消息流中自动触发。
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Configuration Schema */}
          {activeTab === 'config' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#050505]">
                  ⚙️ 技能参数配置表 (Configuration Schema)
                </h4>
                <button
                  onClick={() => onOpenConfig(skill)}
                  className="px-3 py-1 bg-[#E7F3FF] hover:bg-[#DBECFE] text-[#1877F2] rounded-lg border border-[#1877F2]/20 text-[11px] font-bold cursor-pointer"
                >
                  进入可视化编辑器
                </button>
              </div>

              <div className="bg-white border border-[#E4E6EB] rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F0F2F5] border-b border-[#E4E6EB] text-[#65676B] font-semibold text-[11px]">
                      <th className="p-2.5">Key</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Current Value</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E6EB] text-[11px]">
                    {Object.entries(skill.config).map(([key, cfg]: [string, SkillConfigItem]) => (
                      <tr key={key} className="hover:bg-[#F0F2F5]/50">
                        <td className="p-2.5 font-bold text-[#1877F2] font-mono">{key}</td>
                        <td className="p-2.5 text-[#F7941E] font-mono">{cfg.type}</td>
                        <td className="p-2.5 text-[#31A24C] font-mono font-bold">
                          {typeof cfg.value === 'boolean' ? (cfg.value ? 'true' : 'false') : String(cfg.value)}
                        </td>
                        <td className="p-2.5 text-[#65676B] text-xs">{cfg.description || cfg.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Releases & Logs */}
          {activeTab === 'releases' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-white border border-[#E4E6EB] rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1877F2] text-sm flex items-center gap-1.5">
                    <span>{skill.version} (Latest Release)</span>
                  </span>
                  <span className="text-[#65676B] text-[11px]">{skill.updatedAt}</span>
                </div>
                <p className="text-[#65676B] text-xs leading-relaxed">
                  - 升级 Facebook 视觉规范与 2s 呼吸灯动画<br />
                  - 支持与星航者技能树名片联动，自动统计掌握度与课程任务加成<br />
                  - 优化运算效率，降低主线程占用 22%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-4 sm:px-6 py-3 border-t border-[#E4E6EB] flex items-center justify-between text-xs text-[#65676B]">
          <div className="flex items-center gap-3">
            <span>License: <strong className="text-[#050505]">{skill.license}</strong></span>
            <span>Language: <strong className="text-[#050505]">{skill.language}</strong></span>
            <span>Downloads: <strong className="text-[#050505]">{skill.downloads.toLocaleString()}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] rounded-lg font-bold cursor-pointer"
          >
            关闭
          </button>
        </div>

      </div>
    </div>
  );
};
