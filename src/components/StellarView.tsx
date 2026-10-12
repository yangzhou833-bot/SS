import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Sparkles,
  Search,
  Plus,
  Compass,
  Zap,
  Star,
  Check,
  Terminal,
  BookOpen,
  Grid,
  List,
  LayoutGrid,
  Orbit,
  Package,
  Activity,
  GraduationCap,
  BarChart3,
  Kanban,
  FileCode2,
  Users,
  Calendar,
  Heart,
  Briefcase,
  Plane,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Radar,
  Download,
  Info,
  TrendingUp,
  Newspaper,
  Pause,
  Play
} from 'lucide-react';
import { Friend, PlanetItem } from '../types';
import { SkillItem, INITIAL_SKILLS } from '../data/skillsData';
import { SkillDetailModal } from './skills/SkillDetailModal';
import { SkillPlayground } from './skills/SkillPlayground';
import { SkillConfigModal } from './skills/SkillConfigModal';
import { CreateSkillModal } from './skills/CreateSkillModal';
import { CourseManagementApp } from './skills/CourseManagementApp';
import { FamilyCareMonitorPage } from './FamilyCareMonitorPage';
import { FamilyCareSettingsModal } from './family_care/FamilyCareSettingsModal';
import { PlanetDetailPage } from './PlanetDetailPage';
import { FamilyGroupData } from './FamilyGroupModal';
import { EBookReaderApp } from './skills/EBookReaderApp';
import { CityCostOfLivingApp } from './skills/CityCostOfLivingApp';

interface StellarViewProps {
  isDarkMode?: boolean;
  friends?: Friend[];
  planets: PlanetItem[];
  familyGroup?: FamilyGroupData | null;
  onOpenFamilyCare?: () => void;
  onOpenFamilyModal?: () => void;
  onUpdatePlanet: (updated: PlanetItem) => void;
  showToast: (msg: string) => void;
  onNavigateToMapLocation?: (location: { lat: number; lng: number; name?: string }) => void;
  initialUnboxingPlanetId?: string | null;
  onClearTargetUnboxId?: () => void;
  skills?: SkillItem[];
  onToggleSkillInstall?: (skill: SkillItem, e?: React.MouseEvent) => void;
  onToggleSkillEnable?: (skill: SkillItem, e?: React.MouseEvent) => void;
  onStarSkill?: (skill: SkillItem, e?: React.MouseEvent) => void;
  onPracticeSkillExp?: (skill: SkillItem, e?: React.MouseEvent) => void;
  onEquipAllCoreSkills?: () => void;
  onOpenCourseApp?: () => void;
  onBack?: () => void;
}

export interface SkillNewsItem {
  id: string;
  badge: string;
  badgeClass: string;
  title: string;
  summary: string;
  imageUrl: string;
  publishTime: string;
  author: string;
  views: string;
  skillId: string;
  categoryTag: string;
}

const SKILL_NEWS_ITEMS: SkillNewsItem[] = [
  {
    id: 'news-ebook-reader',
    badge: '阅读工具',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    title: 'Stellar 星阅：书籍与漫画，白昼纸感 · 黑夜漫游',
    summary: '书籍、漫画与笔记集中管理，纸感白昼与深空黑夜延续同一阅读位置。导入 EPUB、TXT 或漫画，打开即可继续。',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    publishTime: '刚刚',
    author: 'Stellar 读书会',
    views: '3.8w 阅读',
    skillId: 'skill-ebook',
    categoryTag: '知识与阅读',
  },
  {
    id: 'news-city-cost',
    badge: '实用精算',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    title: '全国重点城市生活成本与薪酬平价换算发布：异地求职与生活开销决策中枢',
    summary: '汇聚全国超一线、新一线及重点省会房租、餐饮、通勤等高频物价，一键换算异地同品质薪资平价，科学规避择业成本陷阱。',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
    publishTime: '刚刚',
    author: '城市经济智库',
    views: '5.2w 阅读',
    skillId: 'skill-city-cost-of-living',
    categoryTag: '生活与消费',
  },
  {
    id: 'news-gemini-25',
    badge: '重磅首发',
    badgeClass: 'bg-[#E7F3FF] text-[#1877F2] border border-[#1877F2]/20',
    title: 'Gemini 2.5 多模态空间智能中枢上线：毫秒级图文识别与拓扑路线决策',
    summary: '基于 Google GenAI 最新多模态模型，手机镜头对准物理实验装置或建筑场景，即可瞬间生成原理拆解与拓扑路线方案。',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    publishTime: '5分钟前',
    author: 'Stellar AI Lab',
    views: '1.8w 阅读',
    skillId: 'skill-gemini-spatial',
    categoryTag: 'AI 智能体',
  },
  {
    id: 'news-happy-family',
    badge: '热点关怀',
    badgeClass: 'bg-rose-50 text-rose-600 border border-rose-200',
    title: '家庭看护 2.1 亲情守护中枢：全家生理健康监控与多端无缝协同',
    summary: '全家智能守护再升级！老人生理指标异动秒级警报、长辈用药卡片倒计时及多端无缝联动，打造温暖数字家庭中枢。',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600',
    publishTime: '20分钟前',
    author: '亲情守护团队',
    views: '2.4w 阅读',
    skillId: 'skill-happy-family',
    categoryTag: '社交与协作',
  },
  {
    id: 'news-travel-pro',
    badge: '体验升级',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    title: 'Travel Pro 智能行程规划：多源地图算法联动与拥堵流向动态避险',
    summary: '输入目的地与游玩天数，AI 将自动融合实时高德/Google 交通数据与景点流向热度，生成高精度防拥堵行程表。',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=600',
    publishTime: '1小时前',
    author: '地图空间组',
    views: '1.1w 阅读',
    skillId: 'skill-travel-pro',
    categoryTag: '空间与地图',
  },
  {
    id: 'news-course-mgr',
    badge: '生态快讯',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    title: '高校智能排课与电子考勤 v3.5：地理围栏无感打卡与作业智能初审',
    summary: '教学全流程管理再优化，结合高精地理围栏考勤识别、PRD 规范排课与 AI 学术作业结构化批改辅助。',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600',
    publishTime: '3小时前',
    author: '学术效率组',
    views: '9.5k 阅读',
    skillId: 'skill-university-course',
    categoryTag: '学术与效率',
  },
  {
    id: 'news-stellar-library',
    badge: '典籍文献',
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    title: 'Stellar 数字典籍与期刊数据库：海量学术文献沉浸式 XR 检索空间',
    summary: '收录海量全球权威文献与典籍，支持 PDF 公式高清高亮标注与跨模态文本摘要，打造下一代科研与教学文献终端。',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=600',
    publishTime: '5小时前',
    author: '典籍资源部',
    views: '8.3k 阅读',
    skillId: 'skill-stellar-library',
    categoryTag: '视听与沉浸',
  },
];

export const StellarView: React.FC<StellarViewProps> = ({
  isDarkMode = false,
  friends = [],
  planets,
  familyGroup,
  onOpenFamilyCare,
  onOpenFamilyModal,
  onUpdatePlanet,
  showToast,
  onNavigateToMapLocation,
  initialUnboxingPlanetId,
  onClearTargetUnboxId,
  skills: propSkills,
  onToggleSkillInstall,
  onToggleSkillEnable,
  onStarSkill,
  onPracticeSkillExp,
  onEquipAllCoreSkills,
  onOpenCourseApp,
  onBack,
}) => {
  // Skills State
  const [localSkills, setLocalSkills] = useState<SkillItem[]>(INITIAL_SKILLS);
  const skills = propSkills || localSkills;

  // Tag Filter & Search State
  const [selectedTag, setSelectedTag] = useState<string>('mine');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Selected Skill
  const [selectedSkillForDetail, setSelectedSkillForDetail] = useState<SkillItem | null>(null);
  const [selectedSkillForPlayground, setSelectedSkillForPlayground] = useState<SkillItem | null>(null);
  const [selectedSkillForConfig, setSelectedSkillForConfig] = useState<SkillItem | null>(null);
  const [isCreateSkillOpen, setIsCreateSkillOpen] = useState(false);

  // Full Mini-App Overlays
  const [isFamilyCareOpen, setIsFamilyCareOpen] = useState(false);
  const [isFamilyCareSettingsOpen, setIsFamilyCareSettingsOpen] = useState(false);
  const [isCourseAppOpen, setIsCourseAppOpen] = useState(false);
  const [isCourseBlankPageOpen, setIsCourseBlankPageOpen] = useState(false);
  const [isEBookAppOpen, setIsEBookAppOpen] = useState(false);
  const [isCityCostAppOpen, setIsCityCostAppOpen] = useState(false);

  // Layout View Mode: Grid vs List ("方块排列" vs "列表排列")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Planet Modal
  const [selectedPlanetForDetail, setSelectedPlanetForDetail] = useState<PlanetItem | null>(null);

  // Active Skills
  const activeSkills = useMemo(() => skills.filter((s) => s.isInstalled && s.isEnabled), [skills]);

  // Featured & High-Frequency Skills for Carousel Push Banner in "全部" Tab
  const hotFeaturedSkills = useMemo(() => {
    return skills
      .slice()
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [skills]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isNewsPaused, setIsNewsPaused] = useState(false);
  const [isNewsHovered, setIsNewsHovered] = useState(false);
  const [isNewsFocused, setIsNewsFocused] = useState(false);
  const reduceMotion = useReducedMotion();

  // Auto-slide Timer for Dynamic News Banner (3.8s, pauses on hover)
  useEffect(() => {
    if (selectedTag !== 'all' || isNewsPaused || isNewsHovered || isNewsFocused || reduceMotion || SKILL_NEWS_ITEMS.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SKILL_NEWS_ITEMS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [selectedTag, isNewsPaused, isNewsHovered, isNewsFocused, reduceMotion]);

  const currentNews = SKILL_NEWS_ITEMS[currentSlideIndex] || SKILL_NEWS_ITEMS[0];

  // Apple UI Style Color Gradient Theme Definition for Skill Cards
  interface AppleCardTheme {
    bgGradient: string;
    borderColor: string;
    hoverBorder: string;
    iconBg: string;
    accentText: string;
    versionBadge: string;
    tagClass: string;
  }

  const getAppleSkillCardTheme = (skill: SkillItem, index: number): AppleCardTheme => {
    const id = skill.id || '';
    const name = skill.displayName || '';

    // 1. Family Care (暖橙珊瑚/活力粉渐变 - Apple Warm Sunset)
    if (id === 'skill-happy-family' || id.includes('family') || name.includes('家庭') || name.includes('看护')) {
      return {
        bgGradient: 'bg-gradient-to-br from-[#FFF7ED] via-[#FFF1F2] to-[#FDF4FF] dark:from-[#341A12]/85 dark:via-[#30141D]/75 dark:to-[#261226]/60',
        borderColor: 'border-[#FF9500]/30 dark:border-[#FF9500]/35',
        hoverBorder: 'hover:border-[#FF9500] hover:shadow-[0_8px_24px_rgba(255,149,0,0.18)]',
        iconBg: 'bg-gradient-to-br from-[#FF9500] via-[#FF5E3A] to-[#FF2D55] text-white shadow-md shadow-orange-500/25',
        accentText: 'text-[#FF9500] dark:text-[#FFA028]',
        versionBadge: 'bg-[#FF9500]/10 text-[#EA580C] dark:text-[#FFA028] border border-[#FF9500]/25',
        tagClass: 'bg-white/80 dark:bg-white/10 text-[#C2410C] dark:text-[#FFB340] border border-[#FF9500]/20 backdrop-blur-xs',
      };
    }

    // 2. Academic / Teaching (薄荷青翠/湖水碧绿渐变 - Apple Mint Emerald)
    if (id === 'skill-course-management' || id.includes('course') || name.includes('高校') || name.includes('教学')) {
      return {
        bgGradient: 'bg-gradient-to-br from-[#ECFDF5] via-[#F0FDF4] to-[#EFF6FF] dark:from-[#0B2C1B]/85 dark:via-[#092823]/75 dark:to-[#0A2234]/60',
        borderColor: 'border-[#34C759]/30 dark:border-[#34C759]/35',
        hoverBorder: 'hover:border-[#34C759] hover:shadow-[0_8px_24px_rgba(52,199,89,0.18)]',
        iconBg: 'bg-gradient-to-br from-[#34C759] via-[#30B0C7] to-[#007AFF] text-white shadow-md shadow-emerald-500/25',
        accentText: 'text-[#34C759] dark:text-[#4CD964]',
        versionBadge: 'bg-[#34C759]/10 text-[#16A34A] dark:text-[#4CD964] border border-[#34C759]/25',
        tagClass: 'bg-white/80 dark:bg-white/10 text-[#15803D] dark:text-[#4CD964] border border-[#34C759]/20 backdrop-blur-xs',
      };
    }

    // 3. EBook / Reading (典雅紫罗兰/深邃靛紫渐变 - Apple Royal Purple)
    if (id === 'skill-ebook' || id.includes('ebook') || name.includes('电子书') || name.includes('阅读')) {
      return {
        bgGradient: 'bg-gradient-to-br from-[#FAF5FF] via-[#F5F3FF] to-[#EDE9FE] dark:from-[#26133C]/85 dark:via-[#201235]/75 dark:to-[#191130]/60',
        borderColor: 'border-[#AF52DE]/30 dark:border-[#AF52DE]/35',
        hoverBorder: 'hover:border-[#AF52DE] hover:shadow-[0_8px_24px_rgba(175,82,222,0.18)]',
        iconBg: 'bg-gradient-to-br from-[#AF52DE] via-[#7B42BC] to-[#5856D6] text-white shadow-md shadow-purple-500/25',
        accentText: 'text-[#AF52DE] dark:text-[#BF5AF2]',
        versionBadge: 'bg-[#AF52DE]/10 text-[#9333EA] dark:text-[#BF5AF2] border border-[#AF52DE]/25',
        tagClass: 'bg-white/80 dark:bg-white/10 text-[#7E22CE] dark:text-[#BF5AF2] border border-[#AF52DE]/20 backdrop-blur-xs',
      };
    }

    // 4. City Cost of Living (苹果经典系统蓝/科技天青渐变 - Apple System Azure)
    if (id === 'skill-city-cost-of-living' || id.includes('cost-of-living') || id.includes('city-cost') || name.includes('生活成本') || name.includes('城市')) {
      return {
        bgGradient: 'bg-gradient-to-br from-[#EFF6FF] via-[#F0F7FF] to-[#E0F2FE] dark:from-[#0E223D]/85 dark:via-[#0F2039]/75 dark:to-[#0C2436]/60',
        borderColor: 'border-[#007AFF]/30 dark:border-[#007AFF]/35',
        hoverBorder: 'hover:border-[#007AFF] hover:shadow-[0_8px_24px_rgba(0,122,255,0.18)]',
        iconBg: 'bg-gradient-to-br from-[#007AFF] via-[#30B0C7] to-[#5856D6] text-white shadow-md shadow-blue-500/25',
        accentText: 'text-[#007AFF] dark:text-[#409CFF]',
        versionBadge: 'bg-[#007AFF]/10 text-[#2563EB] dark:text-[#409CFF] border border-[#007AFF]/25',
        tagClass: 'bg-white/80 dark:bg-white/10 text-[#1D4ED8] dark:text-[#409CFF] border border-[#007AFF]/20 backdrop-blur-xs',
      };
    }

    // 5. Office (办公协同 - 蔚蓝靛紫)
    if (id === 'skill-office' || id.includes('office') || name.includes('办公')) {
      return {
        bgGradient: 'bg-gradient-to-br from-[#F0F4FF] via-[#F5F3FF] to-[#F1F5F9] dark:from-[#13203A]/85 dark:via-[#191636]/75 dark:to-[#141B2E]/60',
        borderColor: 'border-[#5856D6]/30 dark:border-[#5856D6]/35',
        hoverBorder: 'hover:border-[#5856D6] hover:shadow-[0_8px_24px_rgba(88,86,214,0.18)]',
        iconBg: 'bg-gradient-to-br from-[#5856D6] via-[#007AFF] to-[#30B0C7] text-white shadow-md shadow-indigo-500/25',
        accentText: 'text-[#5856D6] dark:text-[#5E5CE6]',
        versionBadge: 'bg-[#5856D6]/10 text-[#4F46E5] dark:text-[#5E5CE6] border border-[#5856D6]/25',
        tagClass: 'bg-white/80 dark:bg-white/10 text-[#4338CA] dark:text-[#5E5CE6] border border-[#5856D6]/20 backdrop-blur-xs',
      };
    }

    // 6. Travel (旅行探索 - 湖青翡翠)
    if (id === 'skill-travel' || id.includes('travel') || name.includes('旅行')) {
      return {
        bgGradient: 'bg-gradient-to-br from-[#ECFEFF] via-[#F0FDFA] to-[#F0FDF4] dark:from-[#09292D]/85 dark:via-[#092625]/75 dark:to-[#0A221C]/60',
        borderColor: 'border-[#30B0C7]/30 dark:border-[#30B0C7]/35',
        hoverBorder: 'hover:border-[#30B0C7] hover:shadow-[0_8px_24px_rgba(48,176,199,0.18)]',
        iconBg: 'bg-gradient-to-br from-[#30B0C7] via-[#34C759] to-[#007AFF] text-white shadow-md shadow-cyan-500/25',
        accentText: 'text-[#30B0C7] dark:text-[#64D2FF]',
        versionBadge: 'bg-[#30B0C7]/10 text-[#0891B2] dark:text-[#64D2FF] border border-[#30B0C7]/25',
        tagClass: 'bg-white/80 dark:bg-white/10 text-[#0E7490] dark:text-[#64D2FF] border border-[#30B0C7]/20 backdrop-blur-xs',
      };
    }

    // Fallback dynamic gradient sets
    const fallbacks: AppleCardTheme[] = [
      {
        bgGradient: 'bg-gradient-to-br from-[#FFF7ED] via-[#FFF1F2] to-[#FDF4FF] dark:from-[#341A12]/85 dark:via-[#30141D]/75 dark:to-[#261226]/60',
        borderColor: 'border-[#FF9500]/30 dark:border-[#FF9500]/35',
        hoverBorder: 'hover:border-[#FF9500] hover:shadow-[0_8px_24px_rgba(255,149,0,0.18)]',
        iconBg: 'bg-gradient-to-br from-[#FF9500] via-[#FF5E3A] to-[#FF2D55] text-white shadow-md shadow-orange-500/25',
        accentText: 'text-[#FF9500] dark:text-[#FFA028]',
        versionBadge: 'bg-[#FF9500]/10 text-[#EA580C] dark:text-[#FFA028] border border-[#FF9500]/25',
        tagClass: 'bg-white/80 dark:bg-white/10 text-[#C2410C] dark:text-[#FFB340] border border-[#FF9500]/20 backdrop-blur-xs',
      },
      {
        bgGradient: 'bg-gradient-to-br from-[#ECFDF5] via-[#F0FDF4] to-[#EFF6FF] dark:from-[#0B2C1B]/85 dark:via-[#092823]/75 dark:to-[#0A2234]/60',
        borderColor: 'border-[#34C759]/30 dark:border-[#34C759]/35',
        hoverBorder: 'hover:border-[#34C759] hover:shadow-[0_8px_24px_rgba(52,199,89,0.18)]',
        iconBg: 'bg-gradient-to-br from-[#34C759] via-[#30B0C7] to-[#007AFF] text-white shadow-md shadow-emerald-500/25',
        accentText: 'text-[#34C759] dark:text-[#4CD964]',
        versionBadge: 'bg-[#34C759]/10 text-[#16A34A] dark:text-[#4CD964] border border-[#34C759]/25',
        tagClass: 'bg-white/80 dark:bg-white/10 text-[#15803D] dark:text-[#4CD964] border border-[#34C759]/20 backdrop-blur-xs',
      },
      {
        bgGradient: 'bg-gradient-to-br from-[#FAF5FF] via-[#F5F3FF] to-[#EDE9FE] dark:from-[#26133C]/85 dark:via-[#201235]/75 dark:to-[#191130]/60',
        borderColor: 'border-[#AF52DE]/30 dark:border-[#AF52DE]/35',
        hoverBorder: 'hover:border-[#AF52DE] hover:shadow-[0_8px_24px_rgba(175,82,222,0.18)]',
        iconBg: 'bg-gradient-to-br from-[#AF52DE] via-[#7B42BC] to-[#5856D6] text-white shadow-md shadow-purple-500/25',
        accentText: 'text-[#AF52DE] dark:text-[#BF5AF2]',
        versionBadge: 'bg-[#AF52DE]/10 text-[#9333EA] dark:text-[#BF5AF2] border border-[#AF52DE]/25',
        tagClass: 'bg-white/80 dark:bg-white/10 text-[#7E22CE] dark:text-[#BF5AF2] border border-[#AF52DE]/20 backdrop-blur-xs',
      },
      {
        bgGradient: 'bg-gradient-to-br from-[#EFF6FF] via-[#F0F7FF] to-[#E0F2FE] dark:from-[#0E223D]/85 dark:via-[#0F2039]/75 dark:to-[#0C2436]/60',
        borderColor: 'border-[#007AFF]/30 dark:border-[#007AFF]/35',
        hoverBorder: 'hover:border-[#007AFF] hover:shadow-[0_8px_24px_rgba(0,122,255,0.18)]',
        iconBg: 'bg-gradient-to-br from-[#007AFF] via-[#30B0C7] to-[#5856D6] text-white shadow-md shadow-blue-500/25',
        accentText: 'text-[#007AFF] dark:text-[#409CFF]',
        versionBadge: 'bg-[#007AFF]/10 text-[#2563EB] dark:text-[#409CFF] border border-[#007AFF]/25',
        tagClass: 'bg-white/80 dark:bg-white/10 text-[#1D4ED8] dark:text-[#409CFF] border border-[#007AFF]/20 backdrop-blur-xs',
      },
    ];

    return fallbacks[index % fallbacks.length];
  };

  const USER_AVATAR_URL = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150";

  // Skill Card Icon Mapping with Apple squircle style
  const renderCardIcon = (skill: SkillItem, theme?: AppleCardTheme) => {
    // If skill has custom author avatar (e.g. from GitHub/author)
    if (skill.authorAvatar) {
      return (
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border border-black/5 dark:border-white/10 p-[2px] bg-white/90 dark:bg-zinc-800 shrink-0 shadow-sm overflow-hidden backdrop-blur-xs">
          <img
            src={skill.authorAvatar}
            alt={skill.displayName}
            className="w-full h-full rounded-[14px] object-cover shrink-0"
          />
        </div>
      );
    }

    const id = skill.id;
    const iconContainerClass = `w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${
      theme ? theme.iconBg : 'bg-gradient-to-br from-[#007AFF] to-[#5856D6] shadow-md shadow-blue-500/25'
    }`;

    if (id === 'skill-happy-family' || id.includes('family')) {
      return (
        <div className={iconContainerClass}>
          <Heart size={21} fill="white" />
        </div>
      );
    }
    if (id === 'skill-office' || id.includes('office')) {
      return (
        <div className={iconContainerClass}>
          <Briefcase size={21} />
        </div>
      );
    }
    if (id === 'skill-events' || id.includes('events')) {
      return (
        <div className={iconContainerClass}>
          <Calendar size={21} />
        </div>
      );
    }
    if (id === 'skill-travel' || id.includes('travel')) {
      return (
        <div className={iconContainerClass}>
          <Plane size={21} />
        </div>
      );
    }
    if (id === 'skill-ebook' || id.includes('ebook') || skill.displayName.includes('电子书')) {
      return (
        <div className={iconContainerClass}>
          <BookOpen size={21} />
        </div>
      );
    }
    if (id === 'skill-city-cost-of-living' || id.includes('cost-of-living') || id.includes('city-cost') || skill.displayName.includes('生活成本')) {
      return (
        <div className={iconContainerClass}>
          <BarChart3 size={21} />
        </div>
      );
    }
    if (id === 'skill-course-management' || id.includes('course') || skill.displayName.includes('高校课程') || skill.displayName.includes('高校教学')) {
      return (
        <div className={iconContainerClass}>
          <BookOpen size={21} />
        </div>
      );
    }
    if (id === 'skill-stellar-library' || id.includes('library')) {
      return (
        <div className={iconContainerClass}>
          <Package size={21} />
        </div>
      );
    }
    if (id === 'skill-latex-paper' || id.includes('latex')) {
      return (
        <div className={iconContainerClass}>
          <FileCode2 size={21} />
        </div>
      );
    }
    if (id === 'skill-spatial-radar' || id.includes('radar')) {
      return (
        <div className={iconContainerClass}>
          <Radar size={21} />
        </div>
      );
    }
    if (id === 'skill-gemini-agent' || id.includes('gemini')) {
      return (
        <div className={iconContainerClass}>
          <Sparkles size={21} fill="white" />
        </div>
      );
    }
    if (id === 'skill-lighthouse-engine' || id.includes('lighthouse')) {
      return (
        <div className={iconContainerClass}>
          <Compass size={21} />
        </div>
      );
    }

    return (
      <div className={iconContainerClass}>
        <Sparkles size={21} />
      </div>
    );
  };

  // Status Label rendering (Apple SF style pill badge)
  const renderStatusBadge = (statusText?: string, isInstalled?: boolean) => {
    if (isInstalled || statusText === 'Active' || statusText === '已激活') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-white/70 dark:bg-black/30 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
          <span>Active</span>
        </span>
      );
    }
    if (statusText === 'In Dev' || statusText === '正在开发中') {
      return (
        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-600 dark:text-amber-400 bg-white/70 dark:bg-black/30 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0 backdrop-blur-xs">
          <span>In Dev</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/10 px-2 py-0.5 rounded-full shrink-0">
        <span>未开通</span>
      </span>
    );
  };

  // Action handler to open Family Care Hub (unified with DiscoverView)
  const handleOpenFamilyHub = () => {
    if (onOpenFamilyCare) {
      onOpenFamilyCare();
    } else {
      setIsFamilyCareOpen(true);
    }
  };

  // Card click handler: Clicking Happy Family directly opens Family Care Monitor homepage
  const handleCardClick = (skill: SkillItem) => {
    if (skill.id === 'skill-happy-family') {
      handleOpenFamilyHub();
      return;
    }
    if (skill.id === 'skill-ebook') {
      setIsEBookAppOpen(true);
      return;
    }
    if (skill.id === 'skill-city-cost-of-living') {
      setIsCityCostAppOpen(true);
      return;
    }
    if (skill.id === 'skill-course-management' || skill.displayName.includes('高校课程管理') || skill.displayName.includes('高校教学管理')) {
      if ((!skill.isInstalled || !skill.isEnabled) && onToggleSkillEnable) {
        onToggleSkillEnable(skill);
      }
      if (onOpenCourseApp) {
        onOpenCourseApp();
      } else {
        setIsCourseAppOpen(true);
      }
      return;
    }
    if (skill.statusText === 'Coming Soon') {
      showToast(`🚧 【${skill.displayName}】即将上线，敬请期待！`);
      return;
    }
    if (skill.id === 'skill-stellar-library' || skill.statusText === 'In Dev' || skill.statusText === '正在开发中') {
      showToast(`🚀 【${skill.displayName}】正在开发中，敬请期待！`);
      return;
    }
    setSelectedSkillForDetail(skill);
  };

  // Filter skills: Show all skills in library, filter by mine or category tags
  const displayedSkills = useMemo(() => {
    let result = skills;
    if (selectedTag === 'mine') {
      result = result.filter((s) => s.isInstalled && s.isEnabled);
    }

    // Tag Filter
    if (selectedTag !== 'mine' && selectedTag !== 'all') {
      result = result.filter((skill) => {
        if (selectedTag === 'office') {
          return (
            skill.id.includes('office') ||
            skill.tags.includes('office') ||
            skill.category.includes('办公') ||
            skill.displayName.toLowerCase().includes('office')
          );
        }
        if (selectedTag === 'travel') {
          return (
            skill.id.includes('travel') ||
            skill.tags.includes('travel') ||
            skill.category.includes('地图') ||
            skill.displayName.toLowerCase().includes('travel') ||
            skill.id.includes('city') ||
            skill.displayName.includes('城市') ||
            skill.displayName.includes('生活成本')
          );
        }
        if (selectedTag === 'gathering') {
          return (
            skill.id.includes('data') ||
            skill.tags.includes('data') ||
            skill.displayName.includes('数据') ||
            skill.displayName.includes('采集') ||
            skill.id.includes('events')
          );
        }
        if (selectedTag === 'knowledge') {
          return (
            skill.id.includes('library') ||
            skill.tags.includes('library') ||
            skill.displayName.includes('图书') ||
            skill.displayName.includes('知识') ||
            skill.id.includes('latex') ||
            skill.id.includes('ebook') ||
            skill.displayName.includes('电子书')
          );
        }
        if (selectedTag === 'academic') {
          return (
            skill.id.includes('course') ||
            skill.tags.includes('course') ||
            skill.displayName.includes('课程') ||
            skill.displayName.includes('高校') ||
            skill.id.includes('lighthouse')
          );
        }
        if (selectedTag === 'family') {
          return (
            skill.id.includes('family') ||
            skill.tags.includes('family') ||
            skill.displayName.includes('家庭')
          );
        }
        return true;
      });
    }

    // Search query filter ("增加搜索栏")
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (skill) =>
          skill.displayName.toLowerCase().includes(q) ||
          skill.tagline.toLowerCase().includes(q) ||
          skill.category.toLowerCase().includes(q) ||
          skill.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [skills, selectedTag, searchQuery]);

  // Handler to clear/delete all active skills ("删除我的所有技能")
  const handleClearAllSkills = () => {
    setLocalSkills((prev) => prev.map((s) => ({ ...s, isInstalled: false, isEnabled: false })));
    showToast('🗑️ 已删除我的所有已开通技能');
  };

  // Handler to restore default skills
  const handleRestoreDefaultSkills = () => {
    setLocalSkills(INITIAL_SKILLS);
    showToast('✨ 已恢复默认开通技能组件库');
  };

  // Featured hero skill item (Happy Family)
  const heroSkill = useMemo(() => {
    return skills.find((s) => s.id === 'skill-happy-family') || skills[0];
  }, [skills]);

  // Grid skill items
  const gridSkills = useMemo(() => {
    if (selectedTag === 'mine') {
      return displayedSkills;
    }
    return displayedSkills.filter((s) => s.id !== heroSkill?.id);
  }, [displayedSkills, heroSkill, selectedTag]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black text-[#050505] dark:text-white select-none overflow-hidden font-sans">
      {/* 2. QUICK TAG SEARCH FILTER BUTTONS (分类导航栏) */}
      <div className="bg-white dark:bg-black border-b border-[#E4E6EB] dark:border-zinc-800 px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs shrink-0 shadow-2xs z-10">
        {[
          { id: 'mine', label: '我的' },
          { id: 'all', label: '全部' },
          { id: 'office', label: '办公' },
          { id: 'travel', label: '旅行' },
          { id: 'gathering', label: '采集' },
          { id: 'knowledge', label: '知识/图书' },
          { id: 'academic', label: '高校课程' },
          { id: 'family', label: '幸福家庭' },
        ].map((tag) => (
          <button
            key={tag.id}
            aria-pressed={selectedTag === tag.id}
            onClick={() => setSelectedTag(tag.id)}
            className={`min-h-11 px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 shadow-2xs ${
              selectedTag === tag.id
                ? 'bg-[#1877F2] text-white'
                : 'bg-[#F0F2F5] dark:bg-zinc-900 text-[#65676B] dark:text-zinc-400 hover:bg-[#E4E6EB] dark:hover:bg-zinc-800 hover:text-[#050505] dark:hover:text-white'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* MAIN SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pb-24 pt-0 space-y-3 bg-white dark:bg-black">
        
        {/* 1. TOP SEAMLESS INTEGRATED NEWS TICKER MODULE FOR "ALL" (全部) TAB: NON-CARD FULL-WIDTH NEWS TICKER (贯穿式新闻推送模块+图片+文字) */}
        {selectedTag === 'all' && (
          <div className="w-full border-b border-[#E4E6EB] dark:border-zinc-800 bg-[#FAFBFD]/80 dark:bg-zinc-900/80 py-2.5 px-4 transition-all mb-1">
            <div
              onMouseEnter={() => setIsNewsHovered(true)}
              onMouseLeave={() => setIsNewsHovered(false)}
              onFocus={() => setIsNewsFocused(true)}
              onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsNewsFocused(false); }}
              className="max-w-5xl mx-auto flex flex-col gap-2"
            >
              {/* Seamless Rolling Content: Image + Text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentNews.id}
                  initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 py-1"
                >
                  {/* Image Cover */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`查看快讯：${currentNews.title}`}
                    onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); } }}
                    onClick={() => {
                      const matchedSkill = skills.find((s) => s.id === currentNews.skillId);
                      if (matchedSkill) handleCardClick(matchedSkill);
                    }}
                    className="w-full sm:w-44 md:w-52 h-32 sm:h-28 rounded-md overflow-hidden shrink-0 border border-[#E4E6EB] relative group/img cursor-pointer"
                  >
                    <img
                      src={currentNews.imageUrl}
                      alt={currentNews.title}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 flex-wrap max-w-[90%]">
                      <span className="px-1.5 py-0.5 rounded-xs bg-black/70 backdrop-blur-xs text-white font-mono text-[9px] font-bold flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>生态快讯</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded-xs bg-[#1877F2] text-white text-[9px] font-bold shrink-0">
                        {currentNews.categoryTag}
                      </span>
                    </div>

                    <span className="absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded-xs bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold truncate">
                      {currentNews.title}
                    </span>
                  </div>

                  {/* News Text Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xs ${currentNews.badgeClass}`}>
                        {currentNews.badge}
                      </span>
                      <span className="text-[11px] font-bold text-[#1877F2]">
                        {currentNews.author}
                      </span>
                      <span className="text-xs text-[#65676B] dark:text-zinc-400 font-mono">
                        • {currentNews.publishTime}
                      </span>
                    </div>

                    <h3
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); } }}
                      onClick={() => {
                        const matchedSkill = skills.find((s) => s.id === currentNews.skillId);
                        if (matchedSkill) handleCardClick(matchedSkill);
                      }}
                      className="text-sm sm:text-base font-bold text-[#050505] dark:text-zinc-100 hover:text-[#1877F2] dark:hover:text-blue-400 transition-colors cursor-pointer leading-snug line-clamp-2"
                    >
                      {currentNews.title}
                    </h3>

                    <p className="text-xs text-[#65676B] dark:text-zinc-300 leading-relaxed line-clamp-2 font-medium">
                      {currentNews.summary}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap text-xs">
                      <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] text-[#65676B] font-medium flex-wrap">
                        <span className="flex items-center gap-1 text-[#050505] dark:text-zinc-100 font-semibold">
                          <Users size={12} className="text-[#1877F2] shrink-0" />
                          <span>开通数 9.5k+</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                          <span className="font-mono text-[10px]">4.9</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-[#65676B]">
                          <TrendingUp size={12} className="text-[#1877F2] shrink-0" />
                          <span>{currentNews.views}</span>
                        </span>
                        <span>•</span>
                        <span className="text-[#1877F2] font-semibold">推广介绍</span>
                      </div>

                      <button
                        onClick={() => {
                          const matchedSkill = skills.find((s) => s.id === currentNews.skillId);
                          if (matchedSkill) handleCardClick(matchedSkill);
                        }}
                        className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-md shadow-2xs transition-all flex items-center gap-1 cursor-pointer ml-auto"
                      >
                        <span>查阅详情</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Ticker Bottom Bar */}
              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#E4E6EB]/60 text-xs">
                <div className="min-w-0 flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {SKILL_NEWS_ITEMS.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => { setCurrentSlideIndex(idx); setIsNewsPaused(true); }}
                      className={`min-h-11 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                        currentSlideIndex === idx
                          ? 'bg-[#1877F2] text-white shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 text-[#65676B] dark:text-zinc-300 hover:bg-[#F0F2F5] dark:hover:bg-zinc-700 hover:text-[#050505] dark:hover:text-white'
                      }`}
                    >
                      <span>{item.badge}</span>
                      <span className="opacity-80">· {item.title.slice(0, 4)}...</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" aria-label={reduceMotion ? '减少动态模式，自动轮播已关闭' : isNewsPaused ? '播放快讯轮播' : '暂停快讯轮播'} aria-pressed={Boolean(isNewsPaused || reduceMotion)} disabled={Boolean(reduceMotion)} onClick={() => setIsNewsPaused((paused) => !paused)} className="w-11 h-11 rounded-full flex items-center justify-center text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-blue-500">
                    {isNewsPaused || reduceMotion ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                  <span className="text-xs tabular-nums text-gray-600 dark:text-zinc-300" aria-label={`第 ${currentSlideIndex + 1} 条，共 ${SKILL_NEWS_ITEMS.length} 条快讯`}>{currentSlideIndex + 1}/{SKILL_NEWS_ITEMS.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* LOWER SKILL GRID / LIST (技能组件库 - 苹果风格彩色渐变卡片) */}
        <div className="px-4 max-w-5xl mx-auto space-y-3.5 pt-1">
          <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
            <h3 className="text-xs font-bold text-[#1C1C1E] dark:text-[#F2F2F7] uppercase tracking-wider flex items-center gap-1.5">
              <Grid size={14} className="text-[#007AFF]" />
              <span>技能组件库 (SKILL MODULES)</span>
            </h3>

            {/* 排列选项：苹果分段控制器 */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#8E8E93] font-semibold hidden sm:inline">
                {displayedSkills.length} 个可用模块
              </span>
              <div className="flex items-center gap-0.5 bg-[#767680]/12 dark:bg-[#767680]/24 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  aria-label="方块排列"
                  className={`w-11 h-11 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-zinc-800 text-[#007AFF] shadow-xs'
                      : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                  }`}
                  title="方块排列"
                >
                  <LayoutGrid size={13} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  aria-label="列表排列"
                  className={`w-11 h-11 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-zinc-800 text-[#007AFF] shadow-xs'
                      : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                  }`}
                  title="列表排列"
                >
                  <List size={13} />
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'grid' ? (
            /* Apple UI Style Grid Cards: 2 cards per row with colorful gradient backgrounds */
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
              {displayedSkills.map((skill, index) => {
                const theme = getAppleSkillCardTheme(skill, index);

                return (
                  <div
                    key={`grid-skill-${skill.id}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`打开技能：${skill.displayName}`}
                    onKeyDown={(event) => {
                      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        handleCardClick(skill);
                      }
                    }}
                    onClick={() => handleCardClick(skill)}
                    className={`w-full min-h-[184px] ${theme.bgGradient} rounded-2xl sm:rounded-[22px] p-3 sm:p-3.5 border ${theme.borderColor} ${theme.hoverBorder} shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer group flex flex-col gap-3 relative overflow-hidden backdrop-blur-md`}
                  >
                    {/* Top ambient glass highlight */}
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-40 blur-2xl -mr-6 -mt-6 bg-white dark:bg-white/10" />

                    {/* Top: Icon & Header */}
                    <div className="space-y-1.5 relative z-10">
                      <div className="flex items-start gap-2.5 min-w-0">
                        {renderCardIcon(skill, theme)}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-[13.5px] font-bold text-gray-900 dark:text-white group-hover:opacity-90 transition-opacity line-clamp-2 tracking-tight">
                            {skill.displayName}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full ${theme.versionBadge}`}>
                              {skill.version || 'v1.0.0'}
                            </span>
                            {renderStatusBadge(skill.statusText, skill.isInstalled)}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed font-normal pt-0.5">
                        {skill.tagline || skill.description}
                      </p>
                    </div>

                    {/* Bottom: Meta Tag & Rating */}
                    <div className="mt-auto shrink-0 pt-1.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] min-w-0 relative z-10">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold shrink-0 truncate max-w-[80px] ${theme.tagClass}`}>
                        {skill.category}
                      </span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-0.5 shrink-0">
                        <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                        <span className="font-mono text-[9.5px] font-bold">{skill.stars}</span>
                        <ChevronRight size={12} className={`${theme.accentText} group-hover:translate-x-0.5 transition-transform shrink-0`} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Apple UI Style List View Mode */
            <div className="flex flex-col gap-2.5">
              {displayedSkills.map((skill, index) => {
                const theme = getAppleSkillCardTheme(skill, index);

                return (
                  <div
                    key={`list-skill-${skill.id}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`打开技能：${skill.displayName}`}
                    onKeyDown={(event) => {
                      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        handleCardClick(skill);
                      }
                    }}
                    onClick={() => handleCardClick(skill)}
                    className={`w-full ${theme.bgGradient} rounded-2xl p-3 sm:p-3.5 border ${theme.borderColor} ${theme.hoverBorder} shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden backdrop-blur-md`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 relative z-10">
                      {renderCardIcon(skill, theme)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:opacity-90 transition-opacity line-clamp-2 tracking-tight">
                            {skill.displayName}
                          </h4>
                          <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full ${theme.versionBadge}`}>
                            {skill.version || 'v1.0.0'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${theme.tagClass}`}>
                            {skill.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed font-normal mt-0.5">
                          {skill.tagline || skill.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center relative z-10">
                      <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-0.5 shrink-0">
                        <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                        <span className="font-mono text-[9.5px] font-bold">{skill.stars}</span>
                      </span>
                      {renderStatusBadge(skill.statusText, skill.isInstalled)}
                      <ChevronRight size={14} className={`${theme.accentText} group-hover:translate-x-0.5 transition-transform shrink-0`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* MODALS INTEGRATION */}

      {/* 1. Skill Detail Modal */}
      {selectedSkillForDetail && (
        <SkillDetailModal
          skill={selectedSkillForDetail}
          onClose={() => setSelectedSkillForDetail(null)}
          onToggleInstall={(s) => {
            if (onToggleSkillInstall) onToggleSkillInstall(s);
            else {
              setLocalSkills((prev) =>
                prev.map((item) =>
                  item.id === s.id ? { ...item, isInstalled: !item.isInstalled } : item
                )
              );
            }
          }}
          onToggleEnable={(s) => {
            if (onToggleSkillEnable) onToggleSkillEnable(s);
            else {
              setLocalSkills((prev) =>
                prev.map((item) =>
                  item.id === s.id ? { ...item, isEnabled: !item.isEnabled } : item
                )
              );
            }
          }}
          onStar={(s) => {
            if (onStarSkill) onStarSkill(s);
            else {
              setLocalSkills((prev) =>
                prev.map((item) =>
                  item.id === s.id ? { ...item, stars: item.stars + 1 } : item
                )
              );
            }
          }}
          onOpenPlayground={(s) => {
            setSelectedSkillForDetail(null);
            if (s.id === 'skill-ebook') {
              setIsEBookAppOpen(true);
            } else if (s.id === 'skill-city-cost-of-living') {
              setIsCityCostAppOpen(true);
            } else {
              setSelectedSkillForPlayground(s);
            }
          }}
          onOpenConfig={(s) => {
            setSelectedSkillForDetail(null);
            setSelectedSkillForConfig(s);
          }}
          showToast={showToast}
        />
      )}

      {/* 2. Skill Playground Modal */}
      {selectedSkillForPlayground && (
        <SkillPlayground
          skill={selectedSkillForPlayground}
          onClose={() => setSelectedSkillForPlayground(null)}
          showToast={showToast}
        />
      )}

      {/* 3. Skill Config Modal */}
      {selectedSkillForConfig && (
        <SkillConfigModal
          skill={selectedSkillForConfig}
          onClose={() => setSelectedSkillForConfig(null)}
          onSaveConfig={(skillId, newConfig) => {
            setLocalSkills((prev) =>
              prev.map((s) => (s.id === skillId ? { ...s, config: newConfig } : s))
            );
            showToast(`⚙️ 技能【${selectedSkillForConfig.displayName}】配置已成功保存`);
            setSelectedSkillForConfig(null);
          }}
          showToast={showToast}
        />
      )}

      {/* 4. Create Skill Modal */}
      {isCreateSkillOpen && (
        <CreateSkillModal
          onClose={() => setIsCreateSkillOpen(false)}
          onPublish={(newSkill) => {
            setLocalSkills((prev) => [newSkill, ...prev]);
            showToast(`🎉 成功创建并发布新技能【${newSkill.displayName}】！`);
            setIsCreateSkillOpen(false);
          }}
          showToast={showToast}
        />
      )}

      {/* 5. Planet Detail Page Modal */}
      {selectedPlanetForDetail && (
        <PlanetDetailPage
          planet={selectedPlanetForDetail}
          onBack={() => setSelectedPlanetForDetail(null)}
          onUpdatePlanet={onUpdatePlanet}
          showToast={showToast}
          onNavigateToMapLocation={onNavigateToMapLocation}
        />
      )}

      {/* 6. Family Care Monitor Overlay (Stellar 家庭看护主页) */}
      {isFamilyCareOpen && (
        <FamilyCareMonitorPage
          isOpen={isFamilyCareOpen}
          onClose={() => setIsFamilyCareOpen(false)}
          onOpenSettings={() => setIsFamilyCareSettingsOpen(true)}
          onExitFamilyCare={() => {
            setIsFamilyCareSettingsOpen(false);
            setIsFamilyCareOpen(false);
            showToast("已退出家庭看护，返回登录界面");
          }}
          onDisbandFamilyGroup={() => {
            setIsFamilyCareSettingsOpen(false);
            setIsFamilyCareOpen(false);
            showToast("家庭看护群已一键解散，已重置回到家庭看护登录初始界面");
          }}
          familyGroup={null}
        />
      )}

      {isFamilyCareSettingsOpen && (
        <FamilyCareSettingsModal
          isOpen={isFamilyCareSettingsOpen}
          onClose={() => setIsFamilyCareSettingsOpen(false)}
          onExitFamilyCare={() => {
            setIsFamilyCareSettingsOpen(false);
            setIsFamilyCareOpen(false);
            showToast("已退出家庭看护，返回登录界面");
          }}
          onDisbandFamilyGroup={() => {
            setIsFamilyCareSettingsOpen(false);
            setIsFamilyCareOpen(false);
            showToast("家庭看护群已一键解散，已重置回到家庭看护登录初始界面");
          }}
        />
      )}

      {/* 7. Course Management Mini App Overlay */}
      {isCourseAppOpen && (
        <div className="fixed inset-0 z-50 bg-[#F0F2F5] flex flex-col animate-in fade-in duration-200 overflow-hidden">
          <CourseManagementApp
            onClose={() => setIsCourseAppOpen(false)}
            showToast={showToast}
          />
        </div>
      )}

      {/* 8. Course Management Blank Page Overlay ("点击后进入空白页，我进行下一步操作。") */}
      {isCourseBlankPageOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-200">
          <header className="bg-white border-b border-[#E4E6EB] px-4 py-3 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCourseBlankPageOpen(false)}
                className="p-1.5 rounded-md hover:bg-[#F0F2F5] text-[#050505] transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
              >
                <ChevronLeft size={18} />
                <span>返回技能星图</span>
              </button>
              <span className="text-[#CBD5E1]">|</span>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#050505]">高校教学管理</h2>
                <span className="text-[10px] font-bold text-[#1877F2] bg-[#E7F3FF] px-2 py-0.5 rounded-full border border-[#1877F2]/20">
                  办公
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#65676B] font-medium hidden sm:inline">
                工作台空白页面
              </span>
              <button
                onClick={() => setIsCourseBlankPageOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-[#050505] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#FAFBFD]">
            <div className="w-16 h-16 rounded-2xl bg-[#E7F3FF] border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2] mb-4 shadow-2xs">
              <BookOpen size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#050505] mb-1">高校教学管理 — 空白操作页</h3>
            <p className="text-xs text-[#65676B] max-w-md leading-relaxed mb-6">
              已成功进入空白操作页面，状态已就绪。您随时可以在此页面进行下一步指令操作与模块搭建。
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => showToast('✨ 空白工作页就绪，等待进一步指令/操作')}
                className="px-4 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold rounded-md shadow-2xs transition-all cursor-pointer"
              >
                进行下一步操作
              </button>
              <button
                onClick={() => setIsCourseBlankPageOpen(false)}
                className="px-4 py-2 bg-white border border-[#E4E6EB] hover:bg-[#F0F2F5] text-[#050505] text-xs font-bold rounded-md transition-all cursor-pointer"
              >
                返回技能库
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. E-Book Reader App Overlay */}
      {isEBookAppOpen && (
        <EBookReaderApp
          isDarkMode={isDarkMode}
          onClose={() => setIsEBookAppOpen(false)}
          showToast={showToast}
        />
      )}

      {/* 10. City Cost of Living App Overlay */}
      {isCityCostAppOpen && (
        <CityCostOfLivingApp
          onClose={() => setIsCityCostAppOpen(false)}
          showToast={showToast}
        />
      )}

    </div>
  );
};
