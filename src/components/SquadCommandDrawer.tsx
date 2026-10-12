import React, { useEffect, useRef } from "react";
import {
  Compass,
  X,
  Target,
  Radio,
  Users,
  CheckSquare,
  Shield,
  MapPin,
  ChevronRight,
  Share2,
} from "lucide-react";

interface SquadCommandDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string) => void;
  reducedMotion?: boolean;
}

export const SquadCommandDrawer: React.FC<SquadCommandDrawerProps> = ({
  isOpen,
  onClose,
  showToast,
  reducedMotion = false,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="squad-drawer-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px] transition-opacity"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:max-w-md bg-white dark:bg-zinc-900 border border-[#E4E6EB] dark:border-zinc-700 rounded-t-xl sm:rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh] ${
          reducedMotion ? "" : "animate-in fade-in-50 slide-in-from-bottom-4 duration-200"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E6EB] dark:border-zinc-800 bg-[#F0F2F5]/50 dark:bg-zinc-800/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-[#1877F2]/10 dark:bg-blue-900/30 flex items-center justify-center text-[#1877F2]">
              <Compass size={18} className="stroke-[2.2]" />
            </div>
            <div>
              <h2
                id="squad-drawer-title"
                className="text-sm font-bold text-[#050505] dark:text-[#E4E6EB] leading-tight"
              >
                先锋探索小队 · 指挥台
              </h2>
              <p className="text-[11px] text-[#65676B] dark:text-zinc-400">
                4 名队员实时在线 · 黄河两岸信标协同任务中
              </p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="关闭小队面板"
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#65676B] hover:text-[#050505] hover:bg-[#E4E6EB]/60 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Mission Card */}
          <div className="p-3 bg-[#E7F3FF]/40 dark:bg-blue-950/20 border border-[#1877F2]/30 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold bg-[#1877F2] text-white px-2 py-0.5 rounded-full uppercase">
                当前战术任务
              </span>
              <span className="text-xs font-bold text-[#1877F2]">完成度 75%</span>
            </div>
            <h3 className="text-sm font-bold text-[#050505] dark:text-[#E4E6EB]">
              兰州黄河风情线信标打卡与全域测绘
            </h3>
            <p className="text-xs text-[#65676B] dark:text-zinc-400">
              全队协同巡查白塔山、中山桥与水车博览园 3 处核心信标节点
            </p>
            <div className="w-full bg-[#E4E6EB] dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
              <div className="bg-[#1877F2] h-full rounded-full w-3/4"></div>
            </div>
          </div>

          {/* Squad Members */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#050505] dark:text-[#E4E6EB] flex items-center gap-1.5">
              <Users size={14} className="text-[#1877F2]" />
              <span>小队成员位置与状态</span>
            </h4>

            <div className="space-y-1.5">
              {[
                {
                  name: "Alex Mercer",
                  role: "队长 (我)",
                  loc: "中山桥北广场",
                  status: "巡查中",
                  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
                },
                {
                  name: "Sarah Chen",
                  role: "侦察员",
                  loc: "白塔山公园索道口",
                  status: "就位",
                  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
                },
                {
                  name: "David Miller",
                  role: "通信员",
                  loc: "金城关广场",
                  status: "信号中继",
                  avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120",
                },
                {
                  name: "Sophie Taylor",
                  role: "突击员",
                  loc: "水车博览园南门",
                  status: "就位",
                  avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120",
                },
              ].map((m) => (
                <div
                  key={m.name}
                  className="p-2 bg-white dark:bg-zinc-800 border border-[#E4E6EB] dark:border-zinc-700 rounded-md flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#E4E6EB]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#050505] dark:text-[#E4E6EB] flex items-center space-x-1.5">
                        <span>{m.name}</span>
                        <span className="text-[10px] text-[#1877F2] font-medium">({m.role})</span>
                      </div>
                      <div className="text-[10px] text-[#65676B] dark:text-zinc-400 flex items-center space-x-1">
                        <MapPin size={10} />
                        <span>{m.loc}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-sm font-semibold">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E4E6EB] dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                showToast?.("📡 已发起全队集结信号，坐标已广播至全员设备");
                onClose();
              }}
              className="py-2 px-3 rounded-md bg-[#1877F2] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#166fe5] cursor-pointer"
            >
              <Radio size={14} />
              <span>发起全员集结</span>
            </button>
            <button
              type="button"
              onClick={() => {
                showToast?.("📍 已同步小队最新战术标记");
                onClose();
              }}
              className="py-2 px-3 rounded-md border border-[#E4E6EB] dark:border-zinc-700 text-[#050505] dark:text-[#E4E6EB] font-bold text-xs flex items-center justify-center gap-1.5 hover:border-[#1877F2] cursor-pointer"
            >
              <Share2 size={14} />
              <span>同步战术标记</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
