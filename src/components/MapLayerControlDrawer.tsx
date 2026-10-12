import React, { useEffect, useRef, useState } from "react";
import {
  Layers,
  Users,
  ShieldCheck,
  Compass,
  Flame,
  Calendar,
  MapPin,
  X,
  Check,
  ChevronRight,
  Grid,
  ListFilter,
  Sparkles,
  CircleDollarSign,
} from "lucide-react";
import { MapLayerId } from "../types";
import { UnifiedSheetShell } from "./common/UnifiedSheetShell";

export interface MapLayerItemClassification {
  name: string;
  type: string;
  description: string;
  count?: number | string;
}

export interface MapLayerConfig {
  id: MapLayerId;
  label: string;
  subLabel: string;
  icon: React.ElementType;
  badge?: string | number;
  count?: number;
  description: string;
  categoryTag: string;
  accentColor: string;
  classifiedItems: MapLayerItemClassification[];
}

export const MAP_LAYERS_CONFIG: MapLayerConfig[] = [
  {
    id: "all",
    label: "全部",
    subLabel: "全部地图对象汇总",
    icon: Layers,
    badge: "24",
    categoryTag: "全局汇总",
    accentColor: "#1877F2",
    description: "综合呈现 7 大业务分类的所有好友、小组、活动、日程与标记点",
    classifiedItems: [
      {
        name: "7 大图层全景分类",
        type: "图层总览",
        description: "好友、家人、小组、小队、活动、日程、地点等全部激活",
        count: "7大类",
      },
      {
        name: "全局在线好友与家庭成员",
        type: "人员定位",
        description: "包含薛梦、林澈等 5 位好友及 3 位家庭守护成员",
        count: "8人",
      },
      {
        name: "同城活动、航线与日程标记",
        type: "活动日程",
        description: "包含黄河探索活动路线、CA1286航班航线及今日待办",
        count: "5项",
      },
      {
        name: "生活常去地与发现星片",
        type: "标记打卡",
        description: "包含自定义常去地点标记及白塔山、中山桥图文星片",
        count: "6处",
      },
    ],
  },
  {
    id: "friends",
    label: "好友",
    subLabel: "附近与在线好友",
    icon: Users,
    badge: "5",
    categoryTag: "社交关系",
    accentColor: "#1877F2",
    description: "实时好友定位、密友亲密度圈、实时位置共享与足迹",
    classifiedItems: [
      {
        name: "在线好友定位与状态",
        type: "实时定位",
        description: "薛梦、林澈、陈予涵、陆景深、苏微的实时坐标与活动状态",
        count: "5位",
      },
      {
        name: "密友亲密度与个性气泡",
        type: "亲密光晕",
        description: "密友呼吸光晕特效、专属个性说说气泡与快速私聊弹窗",
        count: "高频",
      },
      {
        name: "实时位置共享 (Live Share)",
        type: "高精共享",
        description: "好友主动发起的限时高精度位置互享与剩余时间提示",
        count: "1个",
      },
      {
        name: "24小时行动足迹 (Trajectories)",
        type: "行动轨迹",
        description: "好友过去 24 小时移动巡航轨迹折线连线与停留点",
        count: "24h",
      },
    ],
  },
  {
    id: "family",
    label: "家人",
    subLabel: "家庭成员安全守护",
    icon: ShieldCheck,
    badge: "3",
    categoryTag: "家庭守护",
    accentColor: "#10B981",
    description: "家庭成员定位、1.2km 智能安全守护围栏与电量预警",
    classifiedItems: [
      {
        name: "家庭成员实时坐标",
        type: "亲情守护",
        description: "妈妈 (林惠芳)、爸爸 (陈建国)、家姐实时位置",
        count: "3位",
      },
      {
        name: "家庭电子安全守护围栏 (Geofence)",
        type: "安全围栏",
        description: "1.2km 智能家庭守护安全半径范围圈与离开/到达提醒",
        count: "1.2km",
      },
      {
        name: "家人电量与安全报备",
        type: "状态监控",
        description: "低电量红色预警标签、移动速度检测与到家停留时长统计",
        count: "实时",
      },
    ],
  },
  {
    id: "groups",
    label: "小组",
    subLabel: "兴趣与课题研发小组",
    icon: Users,
    badge: "4",
    categoryTag: "团队空间",
    accentColor: "#06B6D4",
    description: "极客开发营等课题小组、组员聚合标记与协作空间",
    classifiedItems: [
      {
        name: "极客开发营协同圈",
        type: "课题协作",
        description: "移动端研发课题小组组员聚集态势与组内活跃成员",
        count: "4人",
      },
      {
        name: "摄影与徒步同好小组",
        type: "兴趣圈子",
        description: "户外摄影采风小组成员聚集点与小组共同标记",
        count: "同好",
      },
      {
        name: "小组固定协作地标",
        type: "地标空间",
        description: "课题研讨室、共享自习空间与团队文档协同中心",
        count: "2处",
      },
    ],
  },
  {
    id: "squads",
    label: "小队",
    subLabel: "战术协同与任务探索",
    icon: Compass,
    badge: "1",
    categoryTag: "战术执行",
    accentColor: "#6366F1",
    description: "先锋探索小队、战术集结标定点、实时坐标与指挥台",
    classifiedItems: [
      {
        name: "先锋探索小队队员",
        type: "战术队员",
        description: "Alex、Sarah 等队员高频实时战术坐标与移动朝向",
        count: "2队员",
      },
      {
        name: "1号战术集结标定点 (Rally Point)",
        type: "集结范围",
        description: "先锋小队专用集结点光圈 (400m) 与任务阶段检查点",
        count: "400m",
      },
      {
        name: "小队协同指令台与任务标示",
        type: "指挥指令",
        description: "紧急集合指令、任务目标位置与阶段打卡清单",
        count: "指令",
      },
    ],
  },
  {
    id: "activities",
    label: "活动",
    subLabel: "同城探索与集结活动",
    icon: Flame,
    badge: "3",
    categoryTag: "活动集结",
    accentColor: "#F97316",
    description: "黄河沿线探索活动、集结路线、500m签到光圈与考勤信标",
    classifiedItems: [
      {
        name: "同城探索与文体活动",
        type: "同城活动",
        description: "黄河沿线城市探索、兰州秋季草地音乐会等活动标记与倒计时",
        count: "3场",
      },
      {
        name: "活动徒步路线折线 (Route Polylines)",
        type: "路线规划",
        description: "活动沿河徒步推荐规划路线与关键途经检查点",
        count: "路线",
      },
      {
        name: "活动集合签到光圈",
        type: "签到范围",
        description: "活动主会场 500m 半径签到打卡触发光圈",
        count: "500m",
      },
    ],
  },
  {
    id: "schedules",
    label: "日程",
    subLabel: "今日行程与航班动态",
    icon: Calendar,
    badge: "2",
    categoryTag: "行程规划",
    accentColor: "#8B5CF6",
    description: "今日日程安排、CA1286 航班轨迹、起飞到达倒计时",
    classifiedItems: [
      {
        name: "今日日程待办打卡标记",
        type: "日程事项",
        description: "跨学科团队周会、羽毛球约球等地点与时间标记",
        count: "2项",
      },
      {
        name: "CA1286 航班航线轨迹弧线",
        type: "航空客运",
        description: "中川机场至首都机场动态航线弧线与飞机实时巡航状态",
        count: "航线",
      },
      {
        name: "行程到达倒计时与接送卡片",
        type: "智能卡片",
        description: "预计到达时间、倒计时及值机/接送机快捷入口",
        count: "倒计时",
      },
    ],
  },
  {
    id: "places",
    label: "生活",
    subLabel: "地图坐标与日程安排",
    icon: MapPin,
    badge: "10项",
    categoryTag: "生活坐标",
    accentColor: "#1877F2",
    description: "生活图层归类管理：地图坐标 (常去地点、自定据点、地点记忆卡) 与 日程安排 (CA1286航班航线、今日待办打卡)",
    classifiedItems: [
      {
        name: "地图坐标 (Life Pins & Memory)",
        type: "生活坐标",
        description: "常去咖啡馆、秘密据点、观景点、黑胶音乐馆等带分类色与记忆卡标记",
        count: "8处",
      },
      {
        name: "日程待办 (Schedules & Flights)",
        type: "日程安排",
        description: "跨学科团队周会、羽毛球约球及 CA1286 航班动态航线",
        count: "2项",
      },
      {
        name: "地点记忆卡 (Place-Memory Card)",
        type: "生命印记",
        description: "到访次数统计、累计驻留时间、8周频次趋势线与心绪随笔备忘",
        count: "全量",
      },
      {
        name: "地点转发与分享 (Forward to Friends)",
        type: "社交分享",
        description: "一键将常去生活地点发送给好友并同步导入对方生活图层",
        count: "多选",
      },
    ],
  },
  {
    id: "stars",
    label: "星片",
    subLabel: "打卡回忆与瞬间发现",
    icon: Sparkles,
    badge: "6片",
    categoryTag: "星片发现",
    accentColor: "#F59E0B",
    description: "精选图文星片、足迹打卡、瞬间灵感与城市探索发现卡片",
    classifiedItems: [
      {
        name: "精选图文星片 (Photo Star Cards)",
        type: "瞬间打卡",
        description: "白塔山秋色、中山桥夜景等带日期日历与作者头像的立式图文卡",
        count: "6片",
      },
      {
        name: "足迹打卡点 (Footprint Pins)",
        type: "探索打卡",
        description: "城市地标打卡足迹、瞬间灵感记事与好友闪耀点赞",
        count: "足迹",
      },
    ],
  },
  {
    id: "cost_of_living",
    label: "生活成本",
    subLabel: "定居与跨城决策工具",
    icon: CircleDollarSign,
    badge: "6区",
    categoryTag: "迁居决策",
    accentColor: "#1877F2",
    description: "全国/省/市/县四级生活成本对比、16大开支维度、预算测算与定居搬迁规划",
    classifiedItems: [
      {
        name: "四级行政层级下沉",
        type: "区县下钻",
        description: "支持至县级行政区，含甘肃兰州榆中、四川成都都江堰等",
        count: "省市县",
      },
      {
        name: "16大生活成本收支维度",
        type: "全维明细",
        description: "住房房租、餐饮食品、水电燃气、医疗教育、托育养老、搬迁过渡等",
        count: "16项",
      },
      {
        name: "多地同台横向对比 (2-4地)",
        type: "决策对比",
        description: "同等生活标准与本地生活惯例双模式，含对比表、雷达图与收支差",
        count: "多维",
      },
      {
        name: "我的预算模拟器 & 定居规划",
        type: "量身预算",
        description: "输入家庭规模与收入，评估可支配盈余、备用金与安家启动金",
        count: "定制",
      },
    ],
  },
];

interface MapLayerControlDrawerProps {
  isOpen: boolean;
  activeLayer: MapLayerId;
  onSelectLayer: (layerId: MapLayerId) => void;
  onClose: () => void;
  reducedMotion?: boolean;
}

export const MapLayerControlDrawer: React.FC<MapLayerControlDrawerProps> = ({
  isOpen,
  activeLayer,
  onSelectLayer,
  onClose,
  reducedMotion = false,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState<"quick_switch" | "classified_inventory">("quick_switch");
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<MapLayerId | null>(activeLayer);

  // Sync selected category detail when activeLayer changes
  useEffect(() => {
    setSelectedCategoryDetail(activeLayer);
  }, [activeLayer]);

  // Keyboard accessibility: Escape to close & focus management
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentActiveConfig = MAP_LAYERS_CONFIG.find((l) => l.id === activeLayer) || MAP_LAYERS_CONFIG[0];

  return (
    <UnifiedSheetShell
      isOpen={isOpen}
      onClose={onClose}
      title="地图图层与内容分类"
      subtitle="地图全部要素已按图层选择菜单归类划分与精准联动"
      height="full"
    >
        {/* View Tabs Switcher (Facebook straight-edge tab style) */}
        <div className="flex items-center border-b border-[#E4E6EB] dark:border-zinc-800 px-3 bg-[#F0F2F5]/30 dark:bg-zinc-800/20">
          <button
            type="button"
            onClick={() => setActiveTab("quick_switch")}
            className={`flex items-center space-x-1.5 py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === "quick_switch"
                ? "border-[#1877F2] text-[#1877F2]"
                : "border-transparent text-[#65676B] hover:text-[#050505] dark:text-zinc-400"
            }`}
          >
            <Grid size={14} />
            <span>图层快捷切换</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E4E6EB] text-[#65676B] dark:bg-zinc-700 dark:text-zinc-300">
              8
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("classified_inventory")}
            className={`flex items-center space-x-1.5 py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === "classified_inventory"
                ? "border-[#1877F2] text-[#1877F2]"
                : "border-transparent text-[#65676B] hover:text-[#050505] dark:text-zinc-400"
            }`}
          >
            <ListFilter size={14} />
            <span>图层归类总表</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1877F2]/10 text-[#1877F2] font-semibold">
              全要素
            </span>
          </button>
        </div>

        {/* Main Body */}
        <div className="p-3 overflow-y-auto space-y-3 flex-1">
          {activeTab === "quick_switch" ? (
            /* TAB 1: Quick Layer Switch Cards */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {MAP_LAYERS_CONFIG.map((layer) => {
                  const isSelected = activeLayer === layer.id;
                  const Icon = layer.icon;

                  return (
                    <button
                      key={layer.id}
                      id={`layer-option-${layer.id}`}
                      type="button"
                      onClick={() => {
                        onSelectLayer(layer.id);
                        onClose();
                      }}
                      aria-pressed={isSelected}
                      aria-label={`切换至${layer.label}图层`}
                      className={`relative p-2.5 rounded-md border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#E7F3FF] dark:bg-blue-950/40 border-2 border-[#1877F2] text-[#1877F2] shadow-2xs"
                          : "bg-white dark:bg-zinc-800 border-[#E4E6EB] dark:border-zinc-700 text-[#050505] dark:text-[#E4E6EB] hover:border-[#1877F2] hover:bg-[#F0F2F5]/60 shadow-2xs"
                      }`}
                    >
                      {/* Top row: Icon + Badge + Check */}
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center ${
                            isSelected
                              ? "bg-[#1877F2] text-white"
                              : "bg-[#F0F2F5] dark:bg-zinc-700 text-[#65676B] dark:text-zinc-300"
                          }`}
                        >
                          <Icon size={16} className="stroke-[2.2]" />
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {layer.badge && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                isSelected
                                  ? "bg-[#1877F2] text-white"
                                  : "bg-[#E4E6EB] dark:bg-zinc-700 text-[#65676B] dark:text-zinc-300"
                              }`}
                            >
                              {layer.badge}
                            </span>
                          )}
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center">
                              <Check size={11} className="stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Label & Description */}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold leading-tight">
                            {layer.label}
                          </span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded-xs font-medium ${
                              isSelected
                                ? "bg-[#1877F2]/20 text-[#1877F2]"
                                : "bg-[#F0F2F5] dark:bg-zinc-700 text-[#65676B] dark:text-zinc-400"
                            }`}
                          >
                            {layer.categoryTag}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] mt-0.5 leading-snug line-clamp-1 ${
                            isSelected
                              ? "text-[#1877F2]/90"
                              : "text-[#65676B] dark:text-zinc-400"
                          }`}
                        >
                          {layer.subLabel}
                        </p>

                        {/* Classified Items Pill Preview */}
                        <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-dashed border-[#E4E6EB] dark:border-zinc-700/60">
                          {layer.classifiedItems.slice(0, 2).map((item, idx) => (
                            <span
                              key={idx}
                              className={`text-[9px] px-1 py-0.2 rounded-xs whitespace-nowrap ${
                                isSelected
                                  ? "bg-white/80 dark:bg-blue-900/60 text-[#1877F2]"
                                  : "bg-[#F0F2F5] dark:bg-zinc-700/80 text-[#65676B] dark:text-zinc-400"
                              }`}
                            >
                              {item.type}
                            </span>
                          ))}
                          {layer.classifiedItems.length > 2 && (
                            <span className="text-[9px] opacity-70">+{layer.classifiedItems.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Layer Quick Info Banner */}
              <div className="p-3 bg-[#E7F3FF]/60 dark:bg-blue-950/20 border border-[#1877F2]/30 rounded-md text-xs">
                <div className="flex items-center justify-between font-bold text-[#1877F2] mb-1">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>当前展示：「{currentActiveConfig.label}」图层内容</span>
                  </span>
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#1877F2] text-white">
                    {currentActiveConfig.badge} 个要素
                  </span>
                </div>
                <p className="text-[11px] text-[#65676B] dark:text-zinc-400 leading-relaxed">
                  {currentActiveConfig.description}。已包含：
                  {currentActiveConfig.classifiedItems.map((c) => c.name).join("、")}。
                </p>
              </div>
            </div>
          ) : (
            /* TAB 2: Categorized Map Contents Inventory (图层归类总表) */
            <div className="space-y-2.5">
              <div className="text-[11px] text-[#65676B] dark:text-zinc-400 px-1">
                全部地图元素严格依照下方 8 大图层分类呈现，点击任意图层可直接激活并过滤底图：
              </div>

              {MAP_LAYERS_CONFIG.map((layer) => {
                const isSelected = activeLayer === layer.id;
                const Icon = layer.icon;

                return (
                  <div
                    key={layer.id}
                    className={`rounded-md border p-3 transition-all ${
                      isSelected
                        ? "bg-white dark:bg-zinc-800 border-[#1877F2] shadow-xs"
                        : "bg-white dark:bg-zinc-800 border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/60"
                    }`}
                  >
                    {/* Layer Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E4E6EB] dark:border-zinc-700">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center ${
                            isSelected
                              ? "bg-[#1877F2] text-white"
                              : "bg-[#F0F2F5] dark:bg-zinc-700 text-[#1877F2]"
                          }`}
                        >
                          <Icon size={16} className="stroke-[2.2]" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xs font-bold text-[#050505] dark:text-[#E4E6EB]">
                              {layer.label}
                            </h3>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-xs bg-[#F0F2F5] dark:bg-zinc-700 text-[#65676B] dark:text-zinc-300">
                              {layer.categoryTag}
                            </span>
                            {layer.badge && (
                              <span className="text-[10px] font-bold text-[#1877F2]">
                                {layer.badge} 项
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#65676B] dark:text-zinc-400">
                            {layer.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectLayer(layer.id);
                          onClose();
                        }}
                        className={`text-xs px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors flex items-center space-x-1 ${
                          isSelected
                            ? "bg-[#1877F2] text-white shadow-2xs"
                            : "bg-[#F0F2F5] hover:bg-[#1877F2] hover:text-white text-[#1877F2] dark:bg-zinc-700 dark:text-zinc-200"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check size={12} className="stroke-[3]" />
                            <span>正在呈现</span>
                          </>
                        ) : (
                          <>
                            <span>切换至此</span>
                            <ChevronRight size={12} />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Classified Items List */}
                    <div className="grid grid-cols-1 gap-1.5">
                      {layer.classifiedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between p-1.5 rounded-sm bg-[#F0F2F5]/60 dark:bg-zinc-750 text-[11px]"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[9px] font-bold px-1 py-0.2 rounded-xs bg-white dark:bg-zinc-700 text-[#1877F2] border border-[#E4E6EB] dark:border-zinc-600">
                                {item.type}
                              </span>
                              <span className="font-semibold text-[#050505] dark:text-zinc-200">
                                {item.name}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#65676B] dark:text-zinc-400 pl-0.5">
                              {item.description}
                            </p>
                          </div>
                          {item.count && (
                            <span className="text-[9px] font-bold text-[#65676B] dark:text-zinc-400 bg-white dark:bg-zinc-700 px-1.5 py-0.5 rounded-xs shrink-0 border border-[#E4E6EB] dark:border-zinc-600">
                              {item.count}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & Reset (Facebook straight-line frame styling) */}
        <div className="px-4 py-2.5 border-t border-[#E4E6EB] dark:border-zinc-800 bg-[#F0F2F5]/50 dark:bg-zinc-800/50 flex items-center justify-between text-[11px] text-[#65676B] dark:text-zinc-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1877F2]"></span>
            <span>当前底图：<strong className="text-[#050505] dark:text-zinc-200">{currentActiveConfig.label}</strong> ({currentActiveConfig.categoryTag})</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectLayer("all");
              onClose();
            }}
            className="text-[11px] font-bold text-[#1877F2] hover:underline cursor-pointer"
          >
            显示全部图层
          </button>
        </div>
    </UnifiedSheetShell>
  );
};
