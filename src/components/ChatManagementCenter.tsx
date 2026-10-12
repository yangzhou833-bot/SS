import React, { useState } from "react";
import {
  ArrowLeft,
  MoreVertical,
  Pin,
  VolumeX,
  Trash2,
  Share2,
  Forward,
  Layers,
  Bookmark,
  FileText,
  Image as ImageIcon,
  Calendar,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Clock,
  X,
  Eye,
  Search,
  Filter,
  Database,
  Grid,
  MapPin,
  Users,
  Check,
} from "lucide-react";

// Mock contacts list for multi-person forwarding
const FORWARD_FRIEND_LIST = [
  {
    id: "f1",
    name: "Sarah Chen (薛梦)",
    role: "UI设计师 · Facebook团队",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    status: "在线",
  },
  {
    id: "f2",
    name: "Alex Mercer",
    role: "全栈工程师 · 架构组",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    status: "在线",
  },
  {
    id: "f6",
    name: "Lucas Zhao",
    role: "后端架构师 · 云原生",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    status: "忙碌",
  },
  {
    id: "f5",
    name: "Mia Wang",
    role: "高级产品经理",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
    status: "在线",
  },
  {
    id: "f4",
    name: "David Chen",
    role: "数据库专家 · DBA",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    status: "在线",
  },
  {
    id: "f7",
    name: "Jessica Taylor",
    role: "增长运营总监",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    status: "离线",
  },
  {
    id: "g1",
    name: "AI 交互技术研发群",
    role: "群聊 · 32位成员",
    avatar:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=150",
    isGroup: true,
  },
  {
    id: "g2",
    name: "硅谷同城出游交流群",
    role: "群聊 · 156位成员",
    avatar:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=150",
    isGroup: true,
  },
];

interface ChatManagementCenterProps {
  chatName: string;
  chatAvatar: string;
  isGroup?: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
  showToast?: (msg: string) => void;
  onOpenDocumentAssets?: () => void;
}

interface TimelineMessage {
  id: string;
  senderName: string;
  senderId: string;
  senderAvatar: string;
  time: string;
  text: string;
  mention?: { name: string; avatar: string };
}

interface TimelineGroup {
  id: string;
  date: string;
  rawDate: string; // e.g. '2026-08-15'
  messages: TimelineMessage[];
  images: {
    url: string;
    senderName: string;
    senderAvatar: string;
    time: string;
  }[];
  files: {
    name: string;
    size: string;
    type: string;
    senderName: string;
    senderAvatar: string;
    time: string;
  }[];
}

export const ChatManagementCenter: React.FC<ChatManagementCenterProps> = ({
  chatName,
  chatAvatar,
  isGroup = true,
  onClose,
  onShowToast: propOnShowToast,
  showToast: propShowToast,
  onOpenDocumentAssets,
}) => {
  const onShowToast = (msg: string) => {
    if (propOnShowToast) propOnShowToast(msg);
    else if (propShowToast) propShowToast(msg);
    else console.log(msg);
  };
  const [isPinned, setIsPinned] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "media" | "files">("all");

  // Notion-like features state & Calendar Year/Month/Day Picker & Multi-selection / Range
  const [showMicroCalendar, setShowMicroCalendar] = useState(true);
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false);
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(8);
  const [calendarDay, setCalendarDay] = useState(15);
  const [calendarSelectionMode, setCalendarSelectionMode] = useState<"single" | "multi" | "range">("single");
  const [selectedMultiDates, setSelectedMultiDates] = useState<string[]>([]);
  const [dateRangeStart, setDateRangeStart] = useState<string | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<string | null>(null);
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all"); // 'all', 'mention', 'file', 'image'

  // Forwarding State (逐条转发 / 统一转发多选好友)
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardMode, setForwardMode] = useState<"single" | "combined">("single");
  const [selectedForwardIds, setSelectedForwardIds] = useState<string[]>([]);
  const [forwardSearchQuery, setForwardSearchQuery] = useState("");
  const [isSendingForward, setIsSendingForward] = useState(false);
  const [forwardProgress, setForwardProgress] = useState({ current: 0, total: 0, currentName: "" });

  const handleOpenForward = (mode: "single" | "combined") => {
    setForwardMode(mode);
    setSelectedForwardIds([]);
    setForwardSearchQuery("");
    setIsSendingForward(false);
    setShowForwardModal(true);
  };

  const toggleSelectFriend = (id: string) => {
    if (isSendingForward) return;
    setSelectedForwardIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAllFriends = () => {
    if (isSendingForward) return;
    if (selectedForwardIds.length === FORWARD_FRIEND_LIST.length) {
      setSelectedForwardIds([]);
    } else {
      setSelectedForwardIds(FORWARD_FRIEND_LIST.map((f) => f.id));
    }
  };

  const handleConfirmForward = () => {
    if (selectedForwardIds.length === 0) {
      onShowToast("请至少选择一位好友或群聊进行转发");
      return;
    }

    const selectedFriends = FORWARD_FRIEND_LIST.filter((f) =>
      selectedForwardIds.includes(f.id),
    );

    setIsSendingForward(true);
    let step = 0;

    const interval = setInterval(() => {
      if (step < selectedFriends.length) {
        setForwardProgress({
          current: step + 1,
          total: selectedFriends.length,
          currentName: selectedFriends[step].name.split(" ")[0],
        });
        step++;
      } else {
        clearInterval(interval);
        const namesStr = selectedFriends.map((f) => f.name.split(" ")[0]).join("、");
        const modeText = forwardMode === "single" ? "逐条转发" : "合并统一转发";
        
        onShowToast(
          `✅ 转发成功！已成功将聊天内容以【${modeText}】循环发送至 ${selectedFriends.length} 个目标会话（${namesStr}）`
        );
        setIsSendingForward(false);
        setShowForwardModal(false);
      }
    }, 280);
  };

  // Touch swipe handling to return on left/right swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    // Horizontal swipe (left or right) > 50px returns to chat
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      onShowToast("已向左滑动，返回聊天界面");
      onClose();
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Expanded/Collapsed state per date group
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({
    "t-1": true,
    "t-2": true,
    "t-3": true,
  });

  const [highlightedSenderId, setHighlightedSenderId] = useState<string | null>(
    null,
  );

  // Full-screen Image Preview State
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  // File Preview State
  const [previewFileModal, setPreviewFileModal] = useState<{
    name: string;
    size: string;
    senderName: string;
    time: string;
  } | null>(null);

  const toggleDateExpand = (id: string) => {
    setExpandedDates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 100+ Simulated Messages & Timeline Groups (Notion Database Simulation)
  const timelineGroups: TimelineGroup[] = [
    {
      id: "t-1",
      date: "2026年8.15 星期六",
      rawDate: "2026-08-15",
      messages: [
        {
          id: "m-100",
          senderId: "f2",
          senderName: "Alex Mercer",
          senderAvatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
          time: "08:00",
          text: "@Sarah 请确认一下今天上午的 UI 视觉规范更新进度。",
          mention: {
            name: "Sarah Chen",
            avatar:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
          },
        },
        {
          id: "m-101",
          senderId: "f1",
          senderName: "Sarah Chen",
          senderAvatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
          time: "08:05",
          text: "@Alex 收到！Facebook 经典白灰设计规范已全部对齐。",
          mention: {
            name: "Alex Mercer",
            avatar:
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
          },
        },
        {
          id: "m-102",
          senderId: "f6",
          senderName: "Lucas Zhao",
          senderAvatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
          time: "08:12",
          text: "后端 API 缓存层已经优化完毕，响应速度提升了 40%。",
        },
        {
          id: "m-103",
          senderId: "me",
          senderName: "我",
          senderAvatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
          time: "08:15",
          text: "@Lucas Zhao 赞！缓存命中率有没有做监控面板？",
          mention: {
            name: "Lucas Zhao",
            avatar:
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
          },
        },
        {
          id: "m-104",
          senderId: "f6",
          senderName: "Lucas Zhao",
          senderAvatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
          time: "08:18",
          text: "有的，Prometheus 已经接入。",
        },
        {
          id: "m-105",
          senderId: "f5",
          senderName: "Mia Wang",
          senderAvatar:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
          time: "08:22",
          text: "@Sarah Chen 刚才发你的设计稿源文件查收一下。",
          mention: {
            name: "Sarah Chen",
            avatar:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
          },
        },
        {
          id: "m-106",
          senderId: "f1",
          senderName: "Sarah Chen",
          senderAvatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
          time: "08:25",
          text: "已收到，排版非常精致！",
        },
      ],
      images: [
        {
          url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
          senderName: "Sarah Jenkins",
          senderAvatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
          time: "09:44",
        },
        {
          url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600",
          senderName: "Alex Mercer",
          senderAvatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
          time: "09:43",
        },
      ],
      files: [
        {
          name: "Stellar_UI_Specification_v2.4.pdf",
          size: "4.8 MB",
          type: "PDF",
          senderName: "Sarah Jenkins",
          senderAvatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
          time: "09:46",
        },
      ],
    },
    {
      id: "t-2",
      date: "2026年8.14 星期五",
      rawDate: "2026-08-14",
      messages: [
        {
          id: "m-201",
          senderId: "f2",
          senderName: "Alex Mercer",
          senderAvatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
          time: "14:10",
          text: "@Lucas Zhao 接口联调进展如何？",
          mention: {
            name: "Lucas Zhao",
            avatar:
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
          },
        },
        {
          id: "m-202",
          senderId: "f6",
          senderName: "Lucas Zhao",
          senderAvatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
          time: "14:15",
          text: "全部接口已经测试通过，无 500 报错。",
        },
        {
          id: "m-203",
          senderId: "f4",
          senderName: "David Chen",
          senderAvatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
          time: "18:20",
          text: "这是最新的后端 API 数据库设计说明书。",
        },
      ],
      images: [
        {
          url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600",
          senderName: "David Chen",
          senderAvatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
          time: "18:19",
        },
      ],
      files: [
        {
          name: "Stellar_API_Specification_v3.pdf",
          size: "5.2 MB",
          type: "PDF",
          senderName: "David Chen",
          senderAvatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
          time: "18:21",
        },
        {
          name: "UI_Design_System_Tokens.json",
          size: "340 KB",
          type: "JSON",
          senderName: "David Chen",
          senderAvatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
          time: "18:25",
        },
      ],
    },
    {
      id: "t-3",
      date: "2026年8.13 星期四",
      rawDate: "2026-08-13",
      messages: [
        {
          id: "m-301",
          senderId: "f1",
          senderName: "Sarah Chen",
          senderAvatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
          time: "10:00",
          text: "@所有人 记得提交本周个人周报与 OKR 进展。",
        },
        {
          id: "m-302",
          senderId: "f5",
          senderName: "Mia Wang",
          senderAvatar:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
          time: "10:05",
          text: "已提交，请查阅。",
        },
      ],
      images: [
        {
          url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600",
          senderName: "Mia Wang",
          senderAvatar:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
          time: "10:12",
        },
      ],
      files: [
        {
          name: "Sprint_Planning_Q3.xlsx",
          size: "1.2 MB",
          type: "XLSX",
          senderName: "Sarah Chen",
          senderAvatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
          time: "10:15",
        },
      ],
    },
  ];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-3 select-none animate-in fade-in duration-200"
    >
      {/* Simulated Phone Frame in White UI Design */}
      <div className="relative w-full h-full max-h-[100dvh] sm:max-h-[880px] sm:w-[412px] sm:rounded-[48px] bg-[#F0F2F5] text-[#050505] flex flex-col overflow-hidden sm:ring-8 sm:ring-gray-300/60 shadow-2xl">
        {/* Dynamic Island / Status Bar */}
        <div className="hidden sm:flex items-center justify-between px-7 pt-3.5 pb-1 text-xs font-semibold text-[#050505] shrink-0 bg-white">
          <span>09:41</span>
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-neutral-800 rounded-full mr-2"></div>
            <div className="w-2.5 h-2.5 bg-neutral-800 rounded-full"></div>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px]">
            <span>5G</span>
            <div className="w-5 h-2.5 border border-[#050505] rounded-xs p-0.5 flex items-center">
              <div className="w-full h-full bg-[#050505] rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Header Navigation (White UI) */}
        <div className="px-4 py-2.5 bg-white border-b border-[#CED0D4] flex items-center justify-between shrink-0 shadow-xs">
          <button
            onClick={() => {
              onShowToast("返回聊天界面");
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#F0F2F5] hover:bg-gray-200 flex items-center justify-center text-[#050505] transition-colors cursor-pointer shrink-0"
            title="返回聊天 (支持向左滑动返回)"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex flex-col items-center mx-1 truncate">
            <h2 className="text-xs sm:text-sm font-black text-[#050505] truncate max-w-[150px]">
              {chatName}
            </h2>
            <span className="text-[9.5px] text-[#65676B] truncate">
              聊天管理中心 · Notion 数据库时间轴
            </span>
          </div>

          {/* Calendar & Filter Buttons moved UP to Top Navigation Bar */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => setShowMicroCalendar(!showMicroCalendar)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                showMicroCalendar
                  ? "bg-[#1877F2] text-white border-[#1877F2]"
                  : "bg-[#F0F2F5] text-[#1877F2] border-[#CED0D4]/60 hover:bg-gray-200"
              }`}
              title="切换日历视图"
            >
              <Calendar size={12} />
              <span>日历</span>
            </button>

            <button
              onClick={() => {
                if (onOpenDocumentAssets) {
                  onOpenDocumentAssets();
                } else if (onShowToast) {
                  onShowToast("已打开聊天【文档与资产】中心");
                }
              }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#F0F2F5] hover:bg-blue-50 text-xs font-bold text-[#1877F2] border border-[#CED0D4]/60 cursor-pointer transition-colors"
              title="查看文档与资产"
            >
              <FileText size={12} />
              <span>文档与资产</span>
            </button>
          </div>
        </div>

        {/* Compact Line Calendar Container */}
        {showMicroCalendar && (
          <div className="px-3 py-2 bg-white border-b border-[#CED0D4] shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-2xs space-y-1.5 text-xs">
              {/* Calendar Header Row: Top-Left Year/Month Select, Top-Right Single/Multi/Range Mode Buttons */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                {/* Top-Left: Year & Month selects */}
                <div className="flex items-center space-x-1">
                  <Database size={12} className="text-[#1877F2] shrink-0" />
                  <select
                    value={calendarYear}
                    onChange={(e) => setCalendarYear(Number(e.target.value))}
                    className="bg-[#F0F2F5] text-[11px] font-bold text-[#050505] px-1.5 py-0.5 rounded border border-[#CED0D4]/60 focus:outline-none cursor-pointer"
                  >
                    <option value={2026}>2026年</option>
                    <option value={2025}>2025年</option>
                    <option value={2024}>2024年</option>
                  </select>
                  <select
                    value={calendarMonth}
                    onChange={(e) => setCalendarMonth(Number(e.target.value))}
                    className="bg-[#F0F2F5] text-[11px] font-bold text-[#050505] px-1 py-0.5 rounded border border-[#CED0D4]/60 focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {m}月
                      </option>
                    ))}
                  </select>
                </div>

                {/* Top-Right: Selection Mode Toggles */}
                <div className="flex items-center space-x-0.5 bg-[#F0F2F5] p-0.5 rounded-lg border border-[#CED0D4]/60 text-[9.5px]">
                  <button
                    onClick={() => {
                      setCalendarSelectionMode("single");
                      setSelectedMultiDates([]);
                      setDateRangeStart(null);
                      setDateRangeEnd(null);
                      onShowToast("模式: 单选日期");
                    }}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      calendarSelectionMode === "single"
                        ? "bg-[#1877F2] text-white shadow-xs"
                        : "text-[#65676B] hover:text-[#050505]"
                    }`}
                  >
                    单选日期
                  </button>
                  <button
                    onClick={() => {
                      setCalendarSelectionMode("multi");
                      setSelectedDateFilter(null);
                      setDateRangeStart(null);
                      setDateRangeEnd(null);
                      onShowToast("模式: 多选多日");
                    }}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      calendarSelectionMode === "multi"
                        ? "bg-[#1877F2] text-white shadow-xs"
                        : "text-[#65676B] hover:text-[#050505]"
                    }`}
                  >
                    多选多日
                  </button>
                  <button
                    onClick={() => {
                      setCalendarSelectionMode("range");
                      setSelectedDateFilter(null);
                      setSelectedMultiDates([]);
                      onShowToast("模式: 时间跨度");
                    }}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      calendarSelectionMode === "range"
                        ? "bg-[#1877F2] text-white shadow-xs"
                        : "text-[#65676B] hover:text-[#050505]"
                    }`}
                  >
                    时间跨度
                  </button>
                </div>
              </div>

              {/* Line Calendar Grid (Compact month grid or week grid on scroll) */}
              <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200 text-center text-[10.5px]">
                <div className="grid grid-cols-7 bg-gray-50 font-bold text-[#65676B] divide-x divide-gray-200">
                  {["日", "一", "二", "三", "四", "五", "六"].map((d, i) => (
                    <span key={`cal-head-${i}`} className="py-0.5">
                      {d}
                    </span>
                  ))}
                </div>

                {!isCalendarCollapsed ? (
                  /* Full Month Grid (31 Days) */
                  <div className="grid grid-cols-7 divide-x divide-gray-200">
                    {Array.from({ length: 31 }, (_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${calendarYear}-${calendarMonth < 10 ? "0" + calendarMonth : calendarMonth}-${dayNum < 10 ? "0" + dayNum : dayNum}`;
                      const hasData = [
                        "2026-08-15",
                        "2026-08-14",
                        "2026-08-13",
                      ].includes(dateStr);

                      let isSelected = false;
                      if (calendarSelectionMode === "single") {
                        isSelected = selectedDateFilter === dateStr;
                      } else if (calendarSelectionMode === "multi") {
                        isSelected = selectedMultiDates.includes(dateStr);
                      } else if (calendarSelectionMode === "range") {
                        if (dateRangeStart && dateRangeEnd) {
                          isSelected = dateStr >= dateRangeStart && dateStr <= dateRangeEnd;
                        } else if (dateRangeStart) {
                          isSelected = dateStr === dateRangeStart;
                        }
                      }

                      return (
                        <button
                          key={`cal-grid-${i}-${dateStr}`}
                          onClick={() => {
                            setCalendarDay(dayNum);
                            if (calendarSelectionMode === "single") {
                              setSelectedDateFilter(dateStr);
                              onShowToast(`已定位到 ${dateStr}`);
                            } else if (calendarSelectionMode === "multi") {
                              setSelectedMultiDates((prev) =>
                                prev.includes(dateStr)
                                  ? prev.filter((d) => d !== dateStr)
                                  : [...prev, dateStr],
                              );
                              onShowToast(`多选已更新: ${dateStr}`);
                            } else if (calendarSelectionMode === "range") {
                              if (!dateRangeStart || (dateRangeStart && dateRangeEnd)) {
                                setDateRangeStart(dateStr);
                                setDateRangeEnd(null);
                                onShowToast(`跨度起点: ${dateStr}`);
                              } else {
                                if (dateStr < dateRangeStart) {
                                  setDateRangeStart(dateStr);
                                  setDateRangeEnd(null);
                                  onShowToast(`跨度起点: ${dateStr}`);
                                } else {
                                  setDateRangeEnd(dateStr);
                                  onShowToast(`跨度范围: ${dateRangeStart} ~ ${dateStr}`);
                                }
                              }
                            }
                          }}
                          className={`py-1 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-blue-50/50 ${
                            isSelected
                              ? "bg-[#1877F2] text-white font-bold"
                              : hasData
                                ? "bg-blue-50/80 text-[#1877F2] font-semibold"
                                : "text-[#050505]"
                          }`}
                        >
                          <span className="text-[10px] leading-none">{dayNum}</span>
                          {hasData && (
                            <span
                              className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-[#1877F2]"}`}
                            ></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Week Calendar Grid (周日历形状 - 7 Days) */
                  <div className="grid grid-cols-7 divide-x divide-gray-200 bg-blue-50/30 animate-in fade-in duration-200">
                    {[12, 13, 14, 15, 16, 17, 18].map((dayNum) => {
                      const dateStr = `${calendarYear}-${calendarMonth < 10 ? "0" + calendarMonth : calendarMonth}-${dayNum < 10 ? "0" + dayNum : dayNum}`;
                      const hasData = [
                        "2026-08-15",
                        "2026-08-14",
                        "2026-08-13",
                      ].includes(dateStr);
                      let isSelected = false;
                      if (calendarSelectionMode === "single") {
                        isSelected = selectedDateFilter === dateStr;
                      } else if (calendarSelectionMode === "multi") {
                        isSelected = selectedMultiDates.includes(dateStr);
                      } else if (calendarSelectionMode === "range") {
                        if (dateRangeStart && dateRangeEnd) {
                          isSelected = dateStr >= dateRangeStart && dateStr <= dateRangeEnd;
                        } else if (dateRangeStart) {
                          isSelected = dateStr === dateRangeStart;
                        }
                      }

                      return (
                        <button
                          key={`week-day-${dayNum}`}
                          onClick={() => {
                            setCalendarDay(dayNum);
                            if (calendarSelectionMode === "single") {
                              setSelectedDateFilter(dateStr);
                              onShowToast(`已定位到 ${dateStr}`);
                            }
                          }}
                          className={`py-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#1877F2] text-white font-bold shadow-xs"
                              : hasData
                                ? "bg-blue-100/80 text-[#1877F2] font-semibold"
                                : "text-[#050505]"
                          }`}
                        >
                          <span className="text-[10.5px] font-bold">{dayNum}</span>
                          {hasData && (
                            <span
                              className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-[#1877F2]"}`}
                            ></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Row: Reset Filter Button on Bottom-Left */}
              <div className="flex items-center justify-between text-[10px] text-[#65676B] px-0.5 pt-0.5">
                <button
                  onClick={() => {
                    setSelectedDateFilter(null);
                    setSelectedMultiDates([]);
                    setDateRangeStart(null);
                    setDateRangeEnd(null);
                    onShowToast("已重置所有日期筛选");
                  }}
                  className="text-[#1877F2] font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>重置筛选</span>
                </button>

                <span className="text-[9.5px] truncate max-w-[210px] text-right">
                  {calendarSelectionMode === "single"
                    ? `选择: ${selectedDateFilter || "全部"}`
                    : calendarSelectionMode === "multi"
                      ? `多选: ${selectedMultiDates.length > 0 ? selectedMultiDates.map((d) => d.slice(5)).join(",") : "全选"}`
                      : `跨度: ${dateRangeStart || "起点"} ~ ${dateRangeEnd || "终点"}`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 同城群友 (City Group Members Map) */}
        {isGroup && showMap && (
          <div className="bg-white border-b border-[#CED0D4] p-4 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#050505] flex items-center">
                <MapPin size={16} className="text-[#1877F2] mr-1.5" />
                同城群友分布
              </h3>
              <span className="text-[11px] text-[#65676B] font-medium">
                8 人在附近
              </span>
            </div>
            <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
              {/* Using a stylized map background image */}
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
                alt="Map Distribution"
                className="w-full h-full object-cover opacity-80"
              />
              {/* Overlay avatars to simulate map markers */}
              <div className="absolute top-4 left-[20%] w-6 h-6 rounded-full border-2 border-white overflow-hidden shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                  alt="member"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full border-2 border-white overflow-hidden shadow-md -translate-x-1/2 -translate-y-1/2">
                <img
                  src={chatAvatar}
                  alt="member"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-5 right-[25%] w-6 h-6 rounded-full border-2 border-white overflow-hidden shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150"
                  alt="member"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-8 right-[15%] w-6 h-6 rounded-full border-2 border-white overflow-hidden shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=150"
                  alt="member"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* View Full Map Button */}
              <button
                onClick={() => onShowToast("正在打开详细同城地图...")}
                className="absolute bottom-2 right-2 px-2.5 py-1 bg-white/90 backdrop-blur text-[10px] font-bold text-[#050505] rounded-lg shadow-sm hover:bg-white transition-colors cursor-pointer flex items-center"
              >
                查看完整地图
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher (时间轴收纳流 导航栏 - 圆形图标按钮设计) */}
        <div className="px-2.5 py-2 bg-white border-b border-[#CED0D4] flex items-center justify-around shrink-0 z-20 shadow-2xs">
          <button
            onClick={() => {
              setActiveTab("all");
              onShowToast("已切换至：时间轴收纳流");
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-[#1877F2] text-white shadow-xs font-bold ring-2 ring-blue-300/40"
                : "bg-[#F0F2F5] text-[#65676B] hover:bg-gray-200"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                activeTab === "all"
                  ? "bg-white text-[#1877F2]"
                  : "bg-white text-[#1877F2] shadow-2xs"
              }`}
            >
              <Clock size={13} />
            </div>
            <span className="text-xs font-bold whitespace-nowrap">
              时间轴收纳流 (100条)
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("media");
              onShowToast("已切换至：多媒体相册");
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "media"
                ? "bg-[#1877F2] text-white shadow-xs font-bold ring-2 ring-blue-300/40"
                : "bg-[#F0F2F5] text-[#65676B] hover:bg-gray-200"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                activeTab === "media"
                  ? "bg-white text-[#1877F2]"
                  : "bg-white text-[#1877F2] shadow-2xs"
              }`}
            >
              <ImageIcon size={13} />
            </div>
            <span className="text-xs font-bold whitespace-nowrap">相册</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("files");
              onShowToast("已切换至：文件柜");
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "files"
                ? "bg-[#1877F2] text-white shadow-xs font-bold ring-2 ring-blue-300/40"
                : "bg-[#F0F2F5] text-[#65676B] hover:bg-gray-200"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                activeTab === "files"
                  ? "bg-white text-[#1877F2]"
                  : "bg-white text-[#1877F2] shadow-2xs"
              }`}
            >
              <FileText size={13} />
            </div>
            <span className="text-xs font-bold whitespace-nowrap">文件柜</span>
          </button>
        </div>

        {/* Scrollable Content Area - Compact Discover-Style Layout */}
        <div
          onScroll={(e) => {
            if (e.currentTarget.scrollTop > 30) {
              setIsCalendarCollapsed(true);
            } else if (e.currentTarget.scrollTop < 10) {
              setIsCalendarCollapsed(false);
            }
          }}
          className="flex-1 overflow-y-auto bg-white"
        >
          {/* TAB 1: Timeline Stream with Foldable Storage Shelf & Compact Dividers */}
          {activeTab === "all" && (
            <div className="relative divide-y divide-gray-100">
              {timelineGroups
                .filter((g) => {
                  if (calendarSelectionMode === "single") {
                    return !selectedDateFilter || g.rawDate === selectedDateFilter;
                  }
                  if (calendarSelectionMode === "multi") {
                    return (
                      selectedMultiDates.length === 0 ||
                      selectedMultiDates.includes(g.rawDate)
                    );
                  }
                  if (calendarSelectionMode === "range") {
                    if (!dateRangeStart) return true;
                    if (!dateRangeEnd) return g.rawDate >= dateRangeStart;
                    return g.rawDate >= dateRangeStart && g.rawDate <= dateRangeEnd;
                  }
                  return true;
                })
                .map((group) => {
                  const isExpanded = !!expandedDates[group.id];

                  // Filter messages based on search query and filter tag
                  const filteredMessages = group.messages.filter((msg) => {
                    const matchesSearch =
                      !searchQuery ||
                      msg.text
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      msg.senderName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                    const matchesTag =
                      filterTag === "all" ||
                      (filterTag === "mention" && !!msg.mention);
                    return matchesSearch && matchesTag;
                  });

                  if (
                    filteredMessages.length === 0 &&
                    group.messages.length > 0 &&
                    searchQuery
                  ) {
                    return null;
                  }

                  return (
                    <div key={group.id} className="bg-white">
                      {/* Date Header Strip displaying active date / date range */}
                      <div className="flex items-center justify-between px-3.5 py-1.5 bg-gray-50/90 border-y border-gray-200 sticky top-0 z-10 shadow-2xs backdrop-blur-xs">
                        <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                          <div className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center text-white shrink-0">
                            <Calendar size={11} className="shrink-0" />
                          </div>
                          <span className="text-xs font-black text-[#050505] tracking-tight truncate">
                            {calendarSelectionMode === "range" &&
                            dateRangeStart &&
                            dateRangeEnd
                              ? `${dateRangeStart} 至 ${dateRangeEnd} (跨度日期)`
                              : calendarSelectionMode === "multi" &&
                                  selectedMultiDates.length > 0
                                ? `已选 ${selectedMultiDates.length} 日: (${selectedMultiDates.map((d) => d.slice(5)).join(", ")})`
                                : selectedDateFilter
                                  ? `${selectedDateFilter} 消息记录`
                                  : group.date}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleDateExpand(group.id)}
                          className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-[10.5px] font-bold text-[#1877F2] transition-colors cursor-pointer shadow-2xs shrink-0 ml-2"
                        >
                          <span>
                            {isExpanded ? "收起相册文件" : "展开收纳架"}
                          </span>
                          {isExpanded ? (
                            <ChevronDown size={12} />
                          ) : (
                            <ChevronRight size={12} />
                          )}
                        </button>
                      </div>

                      {/* Tightly Packed Message Records (No Timeline Margin) */}
                      <div className="divide-y divide-gray-100">
                        {filteredMessages.map((msg) => {
                          const isHighlighted =
                            highlightedSenderId === msg.senderId;
                          return (
                            <div
                              key={msg.id}
                              className={`flex items-start space-x-2.5 px-3.5 py-2.5 transition-colors ${
                                isHighlighted
                                  ? "bg-blue-50/50"
                                  : "hover:bg-gray-50/60"
                              }`}
                            >
                              {/* Sender Avatar */}
                              <img
                                src={msg.senderAvatar || chatAvatar}
                                alt={msg.senderName}
                                onClick={() => {
                                  setHighlightedSenderId(
                                    isHighlighted ? null : msg.senderId,
                                  );
                                  onShowToast(
                                    isHighlighted
                                      ? "已取消发送者高亮"
                                      : `已高亮 ${msg.senderName} 的全部记录`,
                                  );
                                }}
                                className={`w-8 h-8 rounded-full object-cover ring-2 cursor-pointer transition-all shrink-0 hover:scale-105 ${
                                  isHighlighted
                                    ? "ring-[#1877F2] shadow-md shadow-blue-500/30 scale-105"
                                    : "ring-gray-100"
                                }`}
                                title={`点击高亮 ${msg.senderName} 的所有消息`}
                              />

                              {/* Message Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span
                                    className={`text-xs font-bold ${
                                      isHighlighted
                                        ? "text-[#1877F2]"
                                        : "text-[#050505]"
                                    }`}
                                  >
                                    {msg.senderName}
                                  </span>
                                  <span className="text-[10px] text-[#65676B] flex items-center space-x-1">
                                    <Clock size={10} />
                                    <span>{msg.time}</span>
                                  </span>
                                </div>

                                {/* @Mentions displaying as: @ + mini avatar + name + message text */}
                                <div className="text-xs text-[#050505] leading-relaxed font-normal">
                                  {msg.mention ? (
                                    <div className="flex items-center flex-wrap gap-1">
                                      <span className="inline-flex items-center space-x-0.5 bg-blue-50 border border-blue-200/80 rounded px-1.5 py-0.5 text-[10.5px] font-bold text-[#1877F2] align-middle shrink-0">
                                        <span>@</span>
                                        <img
                                          src={msg.mention.avatar}
                                          alt={msg.mention.name}
                                          className="w-3.5 h-3.5 rounded-full object-cover inline-block"
                                        />
                                        <span>{msg.mention.name}</span>
                                      </span>
                                      <span>
                                        {msg.text.startsWith(
                                          `@${msg.mention.name}`,
                                        )
                                          ? msg.text
                                              .slice(
                                                `@${msg.mention.name}`.length,
                                              )
                                              .trim()
                                          : msg.text}
                                      </span>
                                    </div>
                                  ) : (
                                    <span>{msg.text}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Foldable Storage Shelf: Media & Files under this date */}
                      {!isExpanded ? (
                        <div className="pl-12 flex items-center space-x-3 text-xs text-[#65676B]">
                          <div className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-lg border border-[#CED0D4]/60 shadow-xs">
                            <ImageIcon size={13} className="text-[#1877F2]" />
                            <span>{group.images.length} 张图片</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-lg border border-[#CED0D4]/60 shadow-xs">
                            <FileText size={13} className="text-purple-600" />
                            <span>{group.files.length} 个文件柜档案</span>
                          </div>
                          <span
                            className="text-[10px] text-[#1877F2] font-semibold cursor-pointer hover:underline"
                            onClick={() => toggleDateExpand(group.id)}
                          >
                            点击展开 🔽
                          </span>
                        </div>
                      ) : (
                        /* Expanded State: Vertical Portrait Photo Thumbnails & Rectangular Files */
                        <div className="pl-12 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                          {/* 1. Image Gallery with Vertical Portrait Rectangles */}
                          {group.images.length > 0 &&
                            filterTag !== "mention" && (
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-[#65676B]">
                                  当日相册快照 (竖立长方形)
                                </span>
                                <div className="grid grid-cols-2 gap-3">
                                  {group.images.map((img, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      onClick={() =>
                                        setPreviewImageUrl(img.url)
                                      }
                                      className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#CED0D4] bg-white relative group cursor-pointer shadow-xs hover:border-[#1877F2] transition-all"
                                    >
                                      <img
                                        src={img.url}
                                        alt="date-media"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />

                                      {/* Bottom-left overlay with sender avatar and exact time */}
                                      <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-xl bg-black/60 backdrop-blur-xs flex items-center space-x-1.5 text-white">
                                        <img
                                          src={img.senderAvatar}
                                          alt={img.senderName}
                                          className="w-5 h-5 rounded-full object-cover ring-1 ring-white/80 shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                          <p className="text-[10px] font-bold truncate">
                                            {img.senderName}
                                          </p>
                                          <p className="text-[9px] text-gray-200">
                                            {img.time}
                                          </p>
                                        </div>
                                        <Eye
                                          size={12}
                                          className="text-white shrink-0 opacity-80 group-hover:opacity-100"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* 2. File List Rectangular Cards */}
                          {group.files.length > 0 &&
                            filterTag !== "mention" && (
                              <div className="space-y-2 pt-1 relative">
                                {/* Thin vertical timeline line for file cabinet */}
                                <div className="absolute left-2.5 top-6 bottom-2 w-0.5 bg-[#CED0D4]"></div>

                                <span className="text-[11px] font-bold text-[#65676B] pl-5">
                                  当日共享文件档案
                                </span>
                                <div className="space-y-2 pl-5">
                                  {group.files.map((file, fileIdx) => (
                                    <div
                                      key={fileIdx}
                                      onClick={() => setPreviewFileModal(file)}
                                      className="bg-white border border-[#CED0D4] rounded-2xl p-3 flex items-center justify-between shadow-xs hover:border-[#1877F2] transition-colors cursor-pointer group"
                                    >
                                      <div className="flex items-center space-x-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                          <FileText size={18} />
                                        </div>
                                        <div className="min-w-0">
                                          <h5 className="text-xs font-bold text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                                            {file.name}
                                          </h5>
                                          <div className="flex items-center space-x-2 mt-1">
                                            <img
                                              src={file.senderAvatar}
                                              alt={file.senderName}
                                              className="w-4 h-4 rounded-full object-cover ring-1 ring-[#CED0D4]"
                                            />
                                            <span className="text-[10px] text-[#65676B]">
                                              {file.senderName} · {file.size} ·{" "}
                                              {file.time}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onShowToast(
                                            `正在下载文件: ${file.name}`,
                                          );
                                        }}
                                        className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-[#1877F2] hover:text-white text-[#050505] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2 shadow-xs"
                                        title="下载文件"
                                      >
                                        <Download size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* TAB 2: Media Album (Vertical Portrait Rectangles with Bottom-Left Avatar & Time) */}
          {activeTab === "media" && (
            <div className="space-y-3 relative pl-6">
              {/* AI-Style Translucent Dotted Dashed Time Slider on the Left */}
              <div className="absolute left-0 top-4 bottom-4 w-4 flex flex-col items-center justify-center z-20 group/slider pointer-events-auto">
                <div
                  className="w-1.5 h-full bg-gradient-to-b from-[#1877F2]/10 via-[#1877F2]/40 to-[#1877F2]/10 rounded-full border-l border-r border-dashed border-[#1877F2]/60 relative cursor-pointer shadow-xs"
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const pct = Math.max(0, Math.min(1, y / rect.height));
                    if (pct < 0.33) {
                      onShowToast("相册时间轴定位：今天 09:44");
                    } else if (pct < 0.66) {
                      onShowToast("相册时间轴定位：昨天 18:19");
                    } else {
                      onShowToast("相册时间轴定位：前天 14:12");
                    }
                  }}
                  title="滑动相册时间轴"
                >
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#1877F2] shadow-[0_0_12px_#1877F2] ring-2 ring-white animate-pulse flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#65676B]">
                  全部多媒体相册 (4)
                </span>
                <span className="text-xs font-bold text-[#1877F2] cursor-pointer">
                  竖屏长方形展示
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=500",
                    senderName: "Sarah Jenkins",
                    senderAvatar:
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
                    time: "昨天 09:44",
                  },
                  {
                    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=500",
                    senderName: "Alex Mercer",
                    senderAvatar:
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
                    time: "昨天 09:43",
                  },
                  {
                    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=500",
                    senderName: "David Chen",
                    senderAvatar:
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
                    time: "前天 18:19",
                  },
                  {
                    url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=500",
                    senderName: "Sarah Jenkins",
                    senderAvatar:
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
                    time: "前天 14:12",
                  },
                ].map((item, idx) => (
                  <div
                    key={`alb-item-${idx}`}
                    onClick={() => setPreviewImageUrl(item.url)}
                    className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#CED0D4] bg-white relative group cursor-pointer shadow-xs hover:border-[#1877F2] transition-all"
                  >
                    <img
                      src={item.url}
                      alt={`album-${idx}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />

                    {/* Bottom-left overlay with sender avatar and exact time */}
                    <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-xl bg-black/60 backdrop-blur-xs flex items-center space-x-1.5 text-white">
                      <img
                        src={item.senderAvatar}
                        alt={item.senderName}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-white/80 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold truncate">
                          {item.senderName}
                        </p>
                        <p className="text-[9px] text-gray-200">{item.time}</p>
                      </div>
                      <Eye
                        size={12}
                        className="text-white shrink-0 opacity-80 group-hover:opacity-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: File Vault (With Left Thin Timeline Line & Interactive Slider) */}
          {activeTab === "files" && (
            <div className="space-y-3 relative pl-6">
              {/* AI-Style Translucent Dotted Dashed Time Slider on the Left */}
              <div className="absolute left-0 top-4 bottom-4 w-4 flex flex-col items-center justify-center z-20 group/slider pointer-events-auto">
                <div
                  className="w-1.5 h-full bg-gradient-to-b from-[#1877F2]/10 via-[#1877F2]/40 to-[#1877F2]/10 rounded-full border-l border-r border-dashed border-[#1877F2]/60 relative cursor-pointer shadow-xs"
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const pct = Math.max(0, Math.min(1, y / rect.height));
                    if (pct < 0.5) {
                      onShowToast("文件柜时间轴定位：今天 09:46");
                    } else {
                      onShowToast("文件柜时间轴定位：昨天 18:25");
                    }
                  }}
                  title="滑动文件柜时间轴"
                >
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#1877F2] shadow-[0_0_12px_#1877F2] ring-2 ring-white animate-pulse flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#65676B]">
                  群组共享文件柜 (3)
                </span>
                <span
                  onClick={() => onShowToast("请选择本地文件进行上传")}
                  className="text-xs font-bold text-[#1877F2] cursor-pointer hover:underline"
                >
                  + 上传文件
                </span>
              </div>

              {/* File Vault with Left Vertical Thin Timeline Line */}
              <div className="relative pl-6 space-y-3">
                {/* Thin vertical timeline line on the left */}
                <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-[#CED0D4]"></div>

                {[
                  {
                    name: "Stellar_UI_Specification_v2.4.pdf",
                    size: "4.8 MB",
                    time: "今天 09:46",
                    sender: "Sarah Jenkins",
                    avatar:
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
                  },
                  {
                    name: "Stellar_API_Specification_v3.pdf",
                    size: "5.2 MB",
                    time: "昨天 18:21",
                    sender: "David Chen",
                    avatar:
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
                  },
                  {
                    name: "UI_Design_System_Tokens.json",
                    size: "340 KB",
                    time: "昨天 18:25",
                    sender: "David Chen",
                    avatar:
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
                  },
                ].map((file, idx) => (
                  <div
                    key={`file-item-${idx}`}
                    onClick={() =>
                      setPreviewFileModal({
                        name: file.name,
                        size: file.size,
                        senderName: file.sender,
                        time: file.time,
                      })
                    }
                    className="bg-white border border-[#CED0D4] rounded-2xl p-3 flex items-center justify-between shadow-xs hover:border-[#1877F2] transition-colors cursor-pointer group relative z-10"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#050505] truncate group-hover:text-[#1877F2] transition-colors">
                          {file.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <img
                            src={file.avatar}
                            alt={file.sender}
                            className="w-4 h-4 rounded-full object-cover ring-1 ring-[#CED0D4]"
                          />
                          <span className="text-[10px] text-[#65676B]">
                            {file.sender} · {file.size} · {file.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowToast(`正在下载文件: ${file.name}`);
                      }}
                      className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-[#1877F2] hover:text-white text-[#050505] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2 shadow-xs"
                      title="下载文件"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Main Navigation Bar */}
        <div className="bg-white border-t border-[#CED0D4] px-2 sm:px-4 py-2.5 flex items-center justify-around shrink-0 z-30 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => {
              onShowToast("返回聊天界面");
              onClose();
            }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#F0F2F5] text-[#050505] group-hover:bg-blue-50 group-hover:text-[#1877F2] transition-all flex items-center justify-center shadow-2xs shrink-0">
              <ArrowLeft size={18} />
            </div>
            <span className="text-[10px] text-[#65676B] font-medium mt-1">
              返回聊天
            </span>
          </button>

          <button
            onClick={() => handleOpenForward("single")}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#F0F2F5] text-[#050505] group-hover:bg-[#1877F2] group-hover:text-white transition-all flex items-center justify-center shadow-2xs shrink-0">
              <Forward size={18} />
            </div>
            <span className="text-[10px] text-[#65676B] font-medium mt-1">
              逐条转发
            </span>
          </button>

          <button
            onClick={() => handleOpenForward("combined")}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#F0F2F5] text-[#050505] group-hover:bg-[#1877F2] group-hover:text-white transition-all flex items-center justify-center shadow-2xs shrink-0">
              <Layers size={18} />
            </div>
            <span className="text-[10px] text-[#65676B] font-medium mt-1">
              统一转发
            </span>
          </button>

          <button
            onClick={() => {
              onShowToast("已成功同步存入 Notion 个人笔记");
            }}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#F0F2F5] text-[#050505] group-hover:bg-[#1877F2] group-hover:text-white transition-all flex items-center justify-center shadow-2xs shrink-0">
              <Bookmark size={18} />
            </div>
            <span className="text-[10px] text-[#65676B] font-medium mt-1">
              存入笔记
            </span>
          </button>

          <button
            onClick={() => setShowPdfExportModal(true)}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white hover:bg-blue-600 transition-all flex items-center justify-center shadow-xs shrink-0">
              <Download size={18} />
            </div>
            <span className="text-[10px] text-[#1877F2] font-bold mt-1">
              导出PDF
            </span>
          </button>
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="py-2.5 bg-white flex items-center justify-center shrink-0 border-t border-[#CED0D4]/60">
          <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Friend Selection Modal for Forwarding (逐条转发 / 统一转发多选好友) */}
      {showForwardModal && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#CED0D4] flex flex-col max-h-[85vh] overflow-hidden relative">
            {/* Sending Loading Overlay */}
            {isSendingForward && (
              <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-full border-3 border-[#1877F2] border-t-transparent animate-spin mb-3"></div>
                <h4 className="text-sm font-black text-[#050505] mb-1">
                  正在循环发送聊天内容...
                </h4>
                <p className="text-xs text-[#1877F2] font-bold">
                  目标 ({forwardProgress.current}/{forwardProgress.total})：{forwardProgress.currentName}
                </p>
                <div className="w-48 h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-[#1877F2] transition-all duration-300 rounded-full"
                    style={{
                      width: `${(forwardProgress.current / forwardProgress.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Modal Header */}
            <div className="px-4 py-3 bg-white border-b border-[#CED0D4] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center font-bold shrink-0">
                  {forwardMode === "single" ? (
                    <Forward size={16} />
                  ) : (
                    <Layers size={16} />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#050505]">
                    {forwardMode === "single"
                      ? "逐条转发消息"
                      : "合并统一转发消息"}
                  </h3>
                  <p className="text-[10px] text-[#65676B]">
                    勾选多个目标好友或群聊，点击后循环推送到所有会话
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForwardModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#65676B] transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Bar & Quick Select Bar */}
            <div className="p-3 bg-[#F0F2F5] border-b border-[#CED0D4]/60 space-y-2 shrink-0">
              <div className="flex items-center bg-white rounded-full px-3 py-1.5 border border-[#CED0D4]/60 shadow-2xs">
                <Search size={14} className="text-[#65676B] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="搜索好友或群聊名称..."
                  value={forwardSearchQuery}
                  onChange={(e) => setForwardSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#050505] focus:outline-none"
                />
                {forwardSearchQuery && (
                  <button
                    onClick={() => setForwardSearchQuery("")}
                    className="text-[#65676B] hover:text-[#050505] w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] px-1">
                <span className="text-[#65676B]">
                  已选择{" "}
                  <strong className="text-[#1877F2] font-black">
                    {selectedForwardIds.length}
                  </strong>{" "}
                  位联系人
                </span>
                <button
                  onClick={handleSelectAllFriends}
                  className="text-[#1877F2] font-bold hover:underline cursor-pointer"
                >
                  {selectedForwardIds.length === FORWARD_FRIEND_LIST.length
                    ? "取消全选"
                    : "全选好友"}
                </button>
              </div>
            </div>

            {/* Friends & Groups Selection List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-white p-1">
              {FORWARD_FRIEND_LIST.filter(
                (f) =>
                  f.name
                    .toLowerCase()
                    .includes(forwardSearchQuery.toLowerCase()) ||
                  f.role
                    .toLowerCase()
                    .includes(forwardSearchQuery.toLowerCase()),
              ).map((friend) => {
                const isSelected = selectedForwardIds.includes(friend.id);
                return (
                  <div
                    key={`fwd-list-${friend.id}`}
                    onClick={() => toggleSelectFriend(friend.id)}
                    className={`flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer rounded-xl my-0.5 ${
                      isSelected ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {/* Round Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "bg-[#1877F2] border-[#1877F2] text-white shadow-2xs"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>

                      {/* Avatar */}
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
                      />

                      {/* Friend Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-xs font-bold text-[#050505] truncate">
                            {friend.name}
                          </h4>
                          {friend.status && (
                            <span
                              className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                                friend.status === "在线"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {friend.status}
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-[#65676B] truncate">
                          {friend.role}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Avatars Horizontal Strip */}
            {selectedForwardIds.length > 0 && (
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center space-x-2 overflow-x-auto shrink-0">
                {FORWARD_FRIEND_LIST.filter((f) =>
                  selectedForwardIds.includes(f.id),
                ).map((friend) => (
                  <div
                    key={`fwd-strip-${friend.id}`}
                    className="relative shrink-0 group"
                    title={friend.name}
                  >
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-[#1877F2]"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectFriend(friend.id);
                      }}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-[#CED0D4] flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setShowForwardModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#050505] rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmForward}
                disabled={selectedForwardIds.length === 0}
                className={`flex-1 py-2.5 bg-[#1877F2] text-white rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md ${
                  selectedForwardIds.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-600 active:scale-98"
                }`}
              >
                <Forward size={15} />
                <span>
                  确认转发 ({selectedForwardIds.length}人)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 select-none">
          <div className="absolute top-4 right-4 flex items-center space-x-3">
            <button
              onClick={() => {
                onShowToast("图片已开始下载原图");
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#1877F2] text-white rounded-full font-bold text-xs shadow-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <Download size={16} />
              <span>下载原图</span>
            </button>
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <div className="max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-neutral-900">
            <img
              src={previewImageUrl}
              alt="Full Preview"
              className="max-w-full max-h-[80vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFileModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-[#CED0D4] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText size={24} className="text-[#1877F2]" />
                <h3 className="text-sm font-black text-[#050505]">
                  文件预览详情
                </h3>
              </div>
              <button
                onClick={() => setPreviewFileModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#65676B] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="bg-[#F0F2F5] p-3 rounded-xl space-y-1">
              <p className="text-xs font-bold text-[#050505] break-all">
                {previewFileModal.name}
              </p>
              <p className="text-[11px] text-[#65676B]">
                大小：{previewFileModal.size}
              </p>
              <p className="text-[11px] text-[#65676B]">
                发送人：{previewFileModal.senderName} ({previewFileModal.time})
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  onShowToast(`正在下载文件: ${previewFileModal.name}`);
                  setPreviewFileModal(null);
                }}
                className="flex-1 py-2.5 bg-[#1877F2] hover:bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Download size={14} />
                <span>立即下载文件</span>
              </button>
              <button
                onClick={() => {
                  onShowToast("文件在线预览已在浏览器新标签打开");
                  setPreviewFileModal(null);
                }}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#050505] rounded-full text-xs font-bold flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
              >
                <ExternalLink size={14} />
                <span>预览</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Modal (Facebook Discover Stream Flat Layout - 无卡片模块，平铺式展示，包含原图照片) */}
      {showPdfExportModal && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#CED0D4] space-y-0 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#CED0D4] px-4 py-3 bg-white shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-black shrink-0">
                  f
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#050505]">
                    聊天记录 PDF 导出预览 (发现流平铺式)
                  </h3>
                  <p className="text-[10px] text-[#65676B]">
                    摒弃卡片模块 · Facebook 发现页规范平铺布局 · 原图照片展示
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPdfExportModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#65676B] cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Meta Info Banner */}
            <div className="px-4 py-2.5 bg-[#F0F2F5] border-b border-[#CED0D4]/60 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="font-extrabold text-[#050505]">
                  【{chatName}】
                </span>
                <span className="text-[10.5px] text-[#65676B]">
                  · 100条消息与媒体归档
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#1877F2] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                2026-08-18 导出
              </span>
            </div>

            {/* Main Body - Facebook Discover Stream Flat Layout (No Card Containers) */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="divide-y divide-gray-100 bg-white">
                {timelineGroups.map((g) => (
                  <div key={g.id} className="bg-white">
                    {/* Date Divider Strip */}
                    <div className="bg-[#F0F2F5] border-y border-gray-200/80 px-4 py-2 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
                      <div className="flex items-center space-x-2">
                        <Calendar size={13} className="text-[#1877F2]" />
                        <span className="text-xs font-black text-[#050505]">
                          ------------ {g.rawDate.replace("-", "年").replace("-", "月")}日 ({g.date.split(" ")[1] || "星期"}) ------------
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#65676B]">
                        {g.messages.length}条记录
                      </span>
                    </div>

                    {/* Stream Messages (Flat Rows, No Card Boxes) */}
                    <div className="divide-y divide-gray-100">
                      {g.messages.map((m) => (
                        <div
                          key={m.id}
                          className="px-4 py-3 flex items-start space-x-3 hover:bg-gray-50/50 transition-colors"
                        >
                          <img
                            src={m.senderAvatar}
                            alt={m.senderName}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-gray-200 shadow-2xs"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-xs font-bold text-[#050505]">
                                  {m.senderName}
                                </span>
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-gray-100 text-[#65676B] font-semibold">
                                  {m.senderId === "f1"
                                    ? "UI设计师"
                                    : m.senderId === "f2"
                                    ? "全栈架构"
                                    : m.senderId === "f6"
                                    ? "后端专家"
                                    : "群成员"}
                                </span>
                              </div>
                              <span className="text-[10.5px] text-[#65676B] font-medium">
                                {m.time}
                              </span>
                            </div>

                            {/* Mention Tag Pill */}
                            {m.mention && (
                              <span className="inline-flex items-center space-x-1 bg-blue-50 border border-blue-200/80 rounded-full px-2 py-0.5 text-[10px] font-bold text-[#1877F2] mr-1.5 align-middle">
                                <span>@</span>
                                <img
                                  src={m.mention.avatar}
                                  alt={m.mention.name}
                                  className="w-3 h-3 rounded-full object-cover inline-block"
                                />
                                <span>{m.mention.name}</span>
                              </span>
                            )}

                            <span className="text-xs text-[#050505] leading-relaxed font-normal">
                              {m.mention &&
                              m.text.startsWith(`@${m.mention.name}`)
                                ? m.text
                                    .slice(`@${m.mention.name}`.length)
                                    .trim()
                                : m.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Original Photo Images Section Corresponding to Date Group */}
                    {g.images && g.images.length > 0 && (
                      <div className="px-4 py-3 bg-[#F8F9FA] border-t border-gray-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-[#050505] flex items-center space-x-1.5">
                            <ImageIcon size={13} className="text-[#1877F2]" />
                            <span>对应日期原图照片 ({g.images.length}张)</span>
                          </span>
                          <span className="text-[10px] text-[#65676B]">点击看大图</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {g.images.map((img, i) => (
                            <div
                              key={`pdf-img-${i}`}
                              onClick={() => setPreviewImageUrl(img.url)}
                              className="relative rounded-xl overflow-hidden border border-[#CED0D4] shadow-2xs group cursor-pointer aspect-[4/3] bg-gray-100 hover:border-[#1877F2] transition-all"
                            >
                              <img
                                src={img.url}
                                alt={`PDF-Export-Photo-${i}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-[10px]">
                                <div className="flex items-center space-x-1 min-w-0">
                                  <img
                                    src={img.senderAvatar}
                                    alt={img.senderName}
                                    className="w-3.5 h-3.5 rounded-full object-cover shrink-0 ring-1 ring-white"
                                  />
                                  <span className="font-bold truncate">{img.senderName}</span>
                                </div>
                                <span className="text-[9px] opacity-80 shrink-0">{img.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-[#CED0D4] flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setShowPdfExportModal(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#050505] rounded-full text-xs font-bold cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onShowToast("✅ Facebook 动态流 PDF 归档文档已成功导出下载！");
                  setShowPdfExportModal(false);
                }}
                className="flex-1 py-2.5 bg-[#1877F2] hover:bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md cursor-pointer transition-all active:scale-98"
              >
                <Download size={15} />
                <span>确认下载 PDF 归档文件</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
