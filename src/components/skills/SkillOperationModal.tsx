import React, { useState } from 'react';
import {
  X,
  Play,
  Terminal,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Send,
  Zap,
  Sliders,
  Radio,
  FileCode2,
  Database,
  BarChart3,
  Kanban,
  Bug,
  BookOpen,
  Cpu,
  Compass,
  GraduationCap,
  TrendingUp,
  Settings,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SkillItem } from '../../data/skillsData';
import { CourseManagementApp } from './CourseManagementApp';
import { EBookReaderApp } from './EBookReaderApp';
import { CityCostOfLivingApp } from './CityCostOfLivingApp';

interface SkillOperationModalProps {
  skill: SkillItem;
  onClose: () => void;
  showToast: (msg: string) => void;
  onPracticeExp?: (skill: SkillItem, e?: React.MouseEvent) => void;
  onToggleEnable?: (skill: SkillItem, e?: React.MouseEvent) => void;
  onNavigateToStellar?: () => void;
  onNavigateToMapLocation?: (loc: { lat: number; lng: number; name?: string }) => void;
}

export const SkillOperationModal: React.FC<SkillOperationModalProps> = ({
  skill,
  onClose,
  showToast,
  onPracticeExp,
  onToggleEnable,
  onNavigateToStellar,
  onNavigateToMapLocation,
}) => {
  // Directly render full product apps without operation workbench modal
  if (skill.id === 'skill-ebook' || skill.id.includes('ebook') || skill.displayName.includes('电子书')) {
    return <EBookReaderApp onClose={onClose} showToast={showToast} />;
  }
  if (skill.id === 'skill-city-cost-of-living' || skill.id.includes('city-cost') || skill.id.includes('cost-of-living') || skill.displayName.includes('生活成本')) {
    return <CityCostOfLivingApp onClose={onClose} showToast={showToast} />;
  }

  const [activeTab, setActiveTab] = useState<'workbench' | 'mastery' | 'config'>('workbench');
  const [isRunning, setIsRunning] = useState(false);
  const [configState, setConfigState] = useState(skill.config);

  // Preset smart payloads based on skill
  const getInitialPayload = () => {
    switch (skill.id) {
      case 'skill-data-analysis':
        return '{"dataset": "近代物理实验_弗兰克赫兹实验.csv", "operations": ["clean_outliers", "chi_square_test", "poly_regression"], "confidenceInterval": 0.95}';
      case 'skill-academic-chart':
        return '{"chartType": "multi_axis_errorbar", "journalStyle": "Nature_Physics", "dpi": 600, "showStdDev": true, "theme": "academic_clean"}';
      case 'skill-project-manage':
        return '{"projectName": "微纳卫星姿轨控制系统大作业", "wbsNodes": 6, "teamMembers": ["Alexia", "林浩", "陈博士"], "autoGantt": true}';
      case 'skill-code-debug':
        return '{"language": "python3", "codeSnippet": "def solve_nav_matrix(A, b):\n    import numpy as np\n    return np.linalg.inv(A) @ b # Check numerical stability", "checkMemoryLeak": true}';
      case 'skill-literature-review':
        return '{"query": "DeepSeek R1 reasoning on dynamic spatial graphs", "topK": 5, "extractMatrix": ["Problem", "Method", "Benchmark", "Future"]}';
      case 'skill-paper-typeset':
        return '{"template": "IEEE_Transactions_two_column", "compileEngine": "XeLaTeX", "autoFixCitations": true, "checkEquationNumbering": true}';
      case 'skill-spatial-radar':
        return '{"centerLat": 36.0611, "centerLng": 103.8343, "scanRadiusMeters": 3000, "filterTags": ["friends", "landmarks"]}';
      case 'skill-gemini-agent':
        return '请帮我规划从兰州大学到黄河风情线的一日学术与浪漫漫步路线，推荐 3 个适合拍照的小众地标。';
      case 'skill-ebook':
        return '{"action": "AI_CHAPTER_SUMMARY", "bookTitle": "深入理解计算机系统 (CS:APP)", "chapter": "第9章: 虚拟内存", "extractKeyPoints": true}';
      case 'skill-city-cost-of-living':
        return '{"baseCity": "兰州", "targetCity": "北京", "salary": 7000, "lifestyle": "白领适中型", "includeRent": true}';
      default:
        return `{"action": "RUN_TASK", "skillId": "${skill.id}", "timestamp": ${Date.now()}}`;
    }
  };

  const [inputPayload, setInputPayload] = useState<string>(getInitialPayload());

  const [logs, setLogs] = useState<Array<{ type: 'info' | 'warn' | 'success' | 'data'; text: string; time: string }>>([
    {
      type: 'info',
      text: `[SYSTEM] 正在挂载技能管道 @${skill.repoName} (v${skill.version})...`,
      time: new Date().toLocaleTimeString(),
    },
    {
      type: 'success',
      text: `[READY] 技能已激活并装载至课程任务 Deck。2s 周期呼吸灯状态正常。`,
      time: new Date().toLocaleTimeString(),
    },
    {
      type: 'data',
      text: `[ENV] 运行时环境：WebAssembly + Pyodide AST Engine | 熟练度：Lv.${skill.mastery.level} (${skill.mastery.tierTitle})`,
      time: new Date().toLocaleTimeString(),
    },
  ]);

  const getSkillIcon = (size = 24) => {
    const props = { size, className: "transition-transform group-hover:scale-110" };
    switch (skill.iconName) {
      case 'database':
        return <Database {...props} className="text-[#1877F2]" />;
      case 'bar-chart':
        return <BarChart3 {...props} className="text-[#00A400]" />;
      case 'kanban':
        return <Kanban {...props} className="text-[#FA383E]" />;
      case 'bug':
        return <Bug {...props} className="text-[#D29922]" />;
      case 'book-open':
        return <BookOpen {...props} className="text-[#58A6FF]" />;
      case 'file-code':
        return <FileCode2 {...props} className="text-[#A371F7]" />;
      case 'sparkles':
        return <Sparkles {...props} className="text-[#F6851B]" />;
      case 'radar':
        return <Radio {...props} className="text-[#3FB950]" />;
      case 'compass':
        return <Compass {...props} className="text-[#58A6FF]" />;
      default:
        return <Cpu {...props} className="text-[#1877F2]" />;
    }
  };

  const handleRunSkill = () => {
    setIsRunning(true);
    const now = new Date().toLocaleTimeString();

    setLogs((prev) => [
      ...prev,
      {
        type: 'info',
        text: `[EXEC] 正在向【${skill.displayName}】工作节点分发指令...`,
        time: now,
      },
    ]);

    setTimeout(() => {
      let resultText = '';
      if (skill.id === 'skill-data-analysis') {
        resultText = `📊 【数据分析与清洗报告】：\n` +
          `• 样本总量：1,024 个观测值 | 异常值剔除：14 个 (3-Sigma 准则)\n` +
          `• 线性拟合度 R² = 0.9892 | 卡方拟合度 p-value = 0.0001 (显著)\n` +
          `• 回归方程：y = 1.482x + 0.104 (已生成参数置信带 95%)`;
      } else if (skill.id === 'skill-academic-chart') {
        resultText = `📈 【Nature 规范科研图表生成就绪】：\n` +
          `• 图表类型：双 Y 轴散点拟合 + 误差棒 (Error Bars)\n` +
          `• 配色规范：Nature Physics 经典对比色 (DPI: 600, PDF 矢量格式)\n` +
          `• 导出状态：已缓存至本地画板，支持一键嵌入 LaTeX 论文`;
      } else if (skill.id === 'skill-project-manage') {
        resultText = `📋 【敏捷项目进度甘特图已平衡】：\n` +
          `• WBS 关键路径识别完成：共 6 个里程碑节点\n` +
          `• 风险预警：节点 3（姿态动力学矩阵测试）工期偏紧，建议增配 1 人\n` +
          `• 协同状态：已向团队成员 Alexia, 林浩 分发课程任务工单`;
      } else if (skill.id === 'skill-code-debug') {
        resultText = `🐛 【代码剖析与静态 AST 审查】：\n` +
          `• 算法时间复杂度评估：O(N³) -> 建议改用 np.linalg.solve(A, b) 优化为 O(N²)\n` +
          `• 数值稳定性告警：矩阵 A 条件数较大 (Cond=1.4e6)，已推荐吉洪诺夫正则化\n` +
          `• 单元测试：12/12 用例全绿通过`;
      } else if (skill.id === 'skill-literature-review') {
        resultText = `📚 【文献综述矩阵分析】：\n` +
          `• 已检索顶级期刊与 arXiv 论文 5 篇\n` +
          `• 关键贡献对比表与引用关系图谱已生成\n` +
          `• BibTeX 格式已自动校对并导出至工作区`;
      } else if (skill.id === 'skill-paper-typeset') {
        resultText = `📜 【LaTeX 编译流水线完成】：\n` +
          `• 引擎：XeLaTeX v2024 | 模板：IEEE Transactions\n` +
          `• 公式纠错：已自动修复 2 处未闭合角标 \\mathbf{x}_{i}\n` +
          `• PDF 预览生成就绪 (共 6 页，无 Overfull \\hbox 告警)`;
      } else if (skill.id === 'skill-spatial-radar') {
        resultText = `📡 【空间雷达扫描完成】：\n` +
          `• 探测范围：3000m | 发现活跃星友：4 人 | 热门打卡点：2 处\n` +
          `• 林浩 (兄弟) 距离 480m (金城关博览园)\n` +
          `• 发现 1 个隐藏引力盲盒：中山铁桥北广场 (剩余 42 分钟)`;
      } else if (skill.id === 'skill-ebook') {
        resultText = `📖 【电子书 AI 伴读与章节提要】：\n` +
          `• 研读著作：《深入理解计算机系统 (CS:APP)》第 9 章\n` +
          `• 核心洞察：虚拟内存三大功能（地址保护、内存缓存、简化链接）\n` +
          `• 重点提炼：多级页表稀疏寻址机制与 TLB 硬件快表加速，命中率达 99.2%\n` +
          `• 划线笔记：已自动归档 2 条金句至您的“我的笔记”书签库！`;
      } else if (skill.id === 'skill-city-cost-of-living') {
        resultText = `🏙️ 【双城生活成本深度对比报告】：\n` +
          `• 基准城市：兰州 (月均开销 ¥3,800) vs 对比城市：北京 (月均开销 ¥8,500)\n` +
          `• 综合成本差额：+123.7% (其中核心商圈房租高出 +213%)\n` +
          `• 薪资平价建议：在兰州税后 ¥7,000，在北京需达到税后 ¥15,650 才能维持同等品质生活与储蓄率！\n` +
          `• 餐饮与交通：便当均价 +94%，地铁月通勤开支高出 +133%`;
      } else {
        resultText = `⚡ 技能【${skill.displayName}】执行完毕 (Return Code: 0)。任务结果已同步至课程控制台！`;
      }

      setLogs((prev) => [
        ...prev,
        {
          type: 'success',
          text: resultText,
          time: new Date().toLocaleTimeString(),
        },
      ]);
      setIsRunning(false);
      showToast(`⚡ 技能【${skill.displayName}】执行完成，已记录实战成效！`);
    }, 1100);
  };

  const handleClearLogs = () => {
    setLogs([
      {
        type: 'info',
        text: `[CLEAR] 终端日志已清空。随时可执行下一组指令。`,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.time}] ${l.text}`).join('\n');
    navigator.clipboard?.writeText(text);
    showToast('📋 执行日志已复制到剪贴板！');
  };

  const isSkillActive = skill.isInstalled && skill.isEnabled;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in">
      <div className="bg-[#0D1117] text-[#C9D1D9] border-2 border-[#1877F2]/60 w-full max-w-2xl max-h-[92vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Top Meta Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1877F2]/15 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header Banner with 2s Meta Breathing Aura */}
        <div className="bg-[#161B22] px-4 sm:px-5 py-3.5 border-b border-[#30363D] flex items-center justify-between gap-3 shrink-0 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* 72px / 48px Breathing Icon */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 shrink-0 ${
                isSkillActive
                  ? 'bg-[#1877F2]/20 border-[#1877F2] animate-meta-breathe shadow-[0_0_16px_rgba(24,119,242,0.4)]'
                  : 'bg-[#21262D] border-[#30363D]'
              }`}
            >
              <div className={isSkillActive ? 'animate-meta-icon-pulse' : ''}>
                {getSkillIcon(24)}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-[#F0F6FC] truncate">
                  {skill.displayName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1877F2]/20 text-[#58A6FF] border border-[#1877F2]">
                  Lv.{skill.mastery.level} · {skill.mastery.tierTitle}
                </span>
                {skill.isVerified && (
                  <span title="官方学术认证"><ShieldCheck size={14} className="text-[#1877F2] shrink-0" /></span>
                )}
              </div>

              <p className="text-xs text-[#8B949E] truncate mt-0.5">
                {skill.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                onToggleEnable?.(skill);
                showToast(isSkillActive ? `⏸️ 已暂停技能【${skill.displayName}】` : `⚡ 呼吸光效已激活！技能【${skill.displayName}】已恢复装载 🌠`);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSkillActive
                  ? 'bg-[#1877F2] text-white border border-[#1877F2] shadow-[0_0_10px_rgba(24,119,242,0.4)]'
                  : 'bg-[#21262D] text-[#8B949E] border border-[#30363D] hover:text-white'
              }`}
            >
              <Zap size={13} className={isSkillActive ? "fill-white" : ""} />
              <span className="hidden sm:inline">{isSkillActive ? '协同生效中' : '点击激活'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8B949E] hover:text-white rounded-xl hover:bg-[#30363D] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#161B22]/80 px-4 pt-2 border-b border-[#30363D] flex items-center gap-4 text-xs font-semibold shrink-0">
          {[
            { id: 'workbench', label: '⚡ 任务执行台 (Workbench)', icon: Terminal },
            { id: 'mastery', label: '📈 技能熟练度 (+XP)', icon: GraduationCap },
            { id: 'config', label: '⚙️ 运行参数配置', icon: Settings },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#1877F2] text-[#58A6FF] font-bold'
                    : 'border-transparent text-[#8B949E] hover:text-[#C9D1D9]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2. Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: 任务执行台 (Workbench) */}
          {activeTab === 'workbench' && (
            <div className="space-y-3.5">
              {skill.id === 'skill-course-management' ? (
                <div className="flex flex-col items-center">
                  <div className="w-full text-xs text-[#8B949E] mb-2 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-1.5 text-[#58A6FF] font-bold">
                      <Sparkles size={14} />
                      <span>高校教学管理 Mini-App 体验界面 (Facebook 规范)</span>
                    </span>
                    <span className="text-[10px] bg-[#1877F2]/20 text-[#58A6FF] px-2 py-0.5 rounded border border-[#1877F2]/40">
                      Mobile Preview
                    </span>
                  </div>
                  <CourseManagementApp onClose={onClose} showToast={showToast} />
                </div>
              ) : (
                <>
                  {/* Payload input and quick trigger */}
                  <div className="bg-[#161B22] p-3 rounded-2xl border border-[#30363D] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#E6EDF3]">
                        <Terminal size={14} className="text-[#58A6FF]" />
                        <span>输入实战任务参数 / 数据源指令：</span>
                      </div>

                      <button
                        onClick={handleRunSkill}
                        disabled={isRunning}
                        className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(24,119,242,0.4)] cursor-pointer active:scale-95 transition-all"
                      >
                        <Play size={13} fill="white" />
                        <span>{isRunning ? '正在运算中...' : '执行任务 (Run)'}</span>
                      </button>
                    </div>

                    <textarea
                      value={inputPayload}
                      onChange={(e) => setInputPayload(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-[#0D1117] border border-[#30363D] focus:border-[#1877F2] rounded-xl text-xs text-[#79C0FF] font-mono focus:outline-none resize-none"
                      placeholder="输入 JSON 数据或自然语言任务需求..."
                    />

                    {/* Course Tasks quick tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-[#8B949E]">推荐适用场景:</span>
                      {skill.courseTasks.map((task, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInputPayload(`{"taskTitle": "${task}", "autoExecute": true, "timestamp": ${Date.now()}}`);
                            showToast(`🎯 已填入适用任务【${task}】预设参数！`);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] transition-colors cursor-pointer truncate max-w-[200px]"
                        >
                          🎯 {task}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Console Logs Panel */}
                  <div className="bg-[#010409] rounded-2xl border border-[#30363D] overflow-hidden flex flex-col">
                    <div className="bg-[#161B22] px-3.5 py-2 border-b border-[#30363D] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3FB950] animate-ping" />
                        <span className="font-mono text-[#8B949E] text-[11px]">Worker Console (Real-time)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyLogs}
                          className="text-[11px] text-[#8B949E] hover:text-[#58A6FF] flex items-center gap-1 cursor-pointer"
                          title="复制日志"
                        >
                          <Copy size={12} />
                          <span>复制</span>
                        </button>
                        <button
                          onClick={handleClearLogs}
                          className="text-[11px] text-[#8B949E] hover:text-white flex items-center gap-1 cursor-pointer"
                          title="清空控制台"
                        >
                          <RotateCcw size={12} />
                          <span>清空</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2 font-mono text-[11px] max-h-52 overflow-y-auto leading-relaxed select-text">
                      {logs.map((log, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-[#8B949E] shrink-0 text-[10px]">{log.time}</span>
                          <div
                            className={`whitespace-pre-wrap ${
                              log.type === 'data'
                                ? 'text-[#79C0FF]'
                                : log.type === 'warn'
                                ? 'text-[#D29922]'
                                : log.type === 'success'
                                ? 'text-[#3FB950] font-bold'
                                : 'text-[#C9D1D9]'
                            }`}
                          >
                            {log.text}
                          </div>
                        </div>
                      ))}

                      {isRunning && (
                        <div className="flex items-center gap-2 text-[#58A6FF] animate-pulse">
                          <span className="text-[#8B949E] text-[10px]">{new Date().toLocaleTimeString()}</span>
                          <span>[RUNNING] 正在调度学术计算流水线...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: 技能熟练度与成长 (+XP) */}
          {activeTab === 'mastery' && (
            <div className="space-y-4">
              <div className="bg-[#161B22] p-4 rounded-2xl border border-[#30363D] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-[#1877F2]" />
                    <span className="text-sm font-bold text-[#E6EDF3]">
                      熟练度等级体系 (Skill Mastery Tier)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#58A6FF]">
                    {skill.mastery.exp} / {skill.mastery.maxExp} XP
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#8B949E]">
                    <span>当前段位：<strong className="text-[#58A6FF]">{skill.mastery.tierTitle}</strong></span>
                    <span className="font-mono">{skill.mastery.percentage}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-[#21262D] rounded-full overflow-hidden p-0.5 border border-[#30363D]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1877F2] to-[#58A6FF] transition-all duration-500 shadow-[0_0_10px_rgba(24,119,242,0.6)]"
                      style={{ width: `${skill.mastery.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[#8B949E]">
                    通过演练或完成课程大作业可持续积累经验
                  </span>

                  <button
                    onClick={(e) => {
                      onPracticeExp?.(skill, e);
                    }}
                    className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-[#58A6FF] hover:text-white rounded-xl text-xs font-bold font-mono transition-all border border-[#1877F2]/40 flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                  >
                    <TrendingUp size={13} />
                    <span>+15 XP 模拟演练</span>
                  </button>
                </div>
              </div>

              {/* Course Integration List */}
              <div className="bg-[#161B22] p-4 rounded-2xl border border-[#30363D] space-y-2.5">
                <h4 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                  <Award size={14} className="text-[#3FB950]" />
                  <span>已绑定的课程与科研任务流水线</span>
                </h4>

                <div className="space-y-2">
                  {skill.courseTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#0D1117] rounded-xl border border-[#30363D] flex items-center justify-between text-xs"
                    >
                      <span className="text-[#C9D1D9]">🎯 {task}</span>
                      <span className="text-[10px] font-mono text-[#3FB950] bg-[#3FB950]/15 px-2 py-0.5 rounded-full">
                        协同在线
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 参数配置 (Config) */}
          {activeTab === 'config' && (
            <div className="bg-[#161B22] p-4 rounded-2xl border border-[#30363D] space-y-3.5">
              <h4 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                <Settings size={14} className="text-[#58A6FF]" />
                <span>运行时参数与自动化策略配置</span>
              </h4>

              <div className="space-y-3 text-xs">
                {Object.entries(configState).map(([key, rawVal]) => {
                  const val = rawVal as any;
                  return (
                    <div
                      key={key}
                      className="p-3 bg-[#0D1117] rounded-xl border border-[#30363D] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-[#E6EDF3] font-bold">{val.label || key}</div>
                        <div className="text-[11px] text-[#8B949E] mt-0.5">
                          {val.description || (val.type === 'boolean'
                            ? '控制是否在课程任务启动时默认挂载'
                            : val.type === 'number'
                            ? '控制参数阈值与采样步长'
                            : '格式与策略参数')}
                        </div>
                      </div>

                      {val.type === 'boolean' ? (
                        <button
                          onClick={() => {
                            const next = !val.value;
                            setConfigState((prev) => ({
                              ...prev,
                              [key]: { ...(prev[key] as any), value: next }
                            }));
                            showToast(`⚙️ 已更新参数 ${val.label || key} -> ${next}`);
                          }}
                          className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                            val.value ? 'bg-[#1877F2] justify-end' : 'bg-[#21262D] justify-start'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                        </button>
                      ) : (
                        <input
                          type={val.type === 'number' ? 'number' : 'text'}
                          value={val.value ?? ''}
                          onChange={(e) => {
                            const v = val.type === 'number' ? Number(e.target.value) : e.target.value;
                            setConfigState((prev) => ({
                              ...prev,
                              [key]: { ...(prev[key] as any), value: v }
                            }));
                          }}
                          className="w-28 bg-[#161B22] border border-[#30363D] rounded-lg px-2 py-1 text-xs text-[#79C0FF] font-mono text-right outline-none focus:border-[#1877F2]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* 3. Footer */}
        <div className="bg-[#161B22] px-4 py-3 border-t border-[#30363D] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#8B949E]">
            <span className="w-2 h-2 rounded-full bg-[#1877F2] animate-ping" />
            <span>2s 呼吸灯光效生效中</span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToStellar && (
              <button
                onClick={() => {
                  onNavigateToStellar();
                  onClose();
                }}
                className="px-3 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-[#58A6FF] rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>前往星航者技能库</span>
                <ArrowRight size={13} />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl font-bold cursor-pointer transition-all"
            >
              完成操作
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
