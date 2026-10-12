import React from "react";
import {
  Layers,
  Users,
  ShieldCheck,
  Compass,
  Flame,
  Calendar,
  MapPin,
  ChevronRight,
  Eye,
  RotateCcw,
  Search,
  Radar,
  Navigation,
  Share2,
  UserCheck,
  HeartPulse,
  Shield,
  Settings,
  LayoutDashboard,
  FileText,
  Sliders,
  Target,
  Radio,
  CheckSquare,
  Plus,
  Route,
  Clock,
  Hourglass,
  CalendarDays,
  Bookmark,
  Star,
  History,
  Globe,
  Building2,
  Building,
  Calculator,
  CircleDollarSign,
} from "lucide-react";
import { MapLayerId } from "../types";
import { MAP_LAYERS_CONFIG } from "./MapLayerControlDrawer";

export interface ShortcutActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isPrimaryAction?: boolean;
  active?: boolean;
  onClick: () => void;
}

interface MapTopLinkedShortcutBarProps {
  activeLayer: MapLayerId;
  onOpenLayerPanel: () => void;
  // Sub-filter selection state (e.g. for activities: 'all_activities' | 'active_now' | 'upcoming' | 'my_activities')
  activeSubFilter?: string;
  onSelectSubFilter?: (subFilter: string) => void;
  // External action handlers
  onSearchClick?: () => void;
  onClearFilters?: () => void;
  onViewAllObjects?: () => void;
  onLocateNearbyFriends?: () => void;
  onFitAllFriends?: () => void;
  onShareMyLocation?: () => void;
  onToggleFriendsList?: () => void;
  onOpenFamilyCare?: () => void;
  onOpenFamilyMembers?: () => void;
  onOpenFamilySettings?: () => void;
  onOpenGroupsWorkspace?: () => void;
  onOpenGroupRules?: () => void;
  onOpenGroupDocs?: () => void;
  onOpenSquadCommand?: () => void;
  onOpenSquadTasks?: () => void;
  onOpenActivityList?: (filter?: string) => void;
  onOpenActiveActivity?: () => void;
  onOpenUpcomingActivity?: () => void;
  onOpenMyActivity?: () => void;
  onOpenCreateActivity?: () => void;
  onFocusActivityRoute?: () => void;
  onOpenParticipantsList?: () => void;
  onTriggerCheckIn?: () => void;
  onOpenCalendarView?: () => void;
  onOpenCreateSchedule?: () => void;
  onOpenCustomPlaces?: () => void;
  onOpenCreatePlace?: () => void;
  onOpenCostComparison?: (level?: 'national' | 'province' | 'city' | 'county') => void;
  onOpenCostBudget?: () => void;
  onOpenCostRelocation?: () => void;
  activeCostAction?: string;
  activitiesCount?: number;
  reducedMotion?: boolean;
}

export const MapTopLinkedShortcutBar: React.FC<MapTopLinkedShortcutBarProps> = ({
  activeLayer,
  onOpenLayerPanel,
  activeSubFilter = "all",
  onSelectSubFilter,
  onOpenCostComparison,
  onOpenCostBudget,
  onOpenCostRelocation,
  activeCostAction,
  onSearchClick,
  onClearFilters,
  onViewAllObjects,
  onLocateNearbyFriends,
  onFitAllFriends,
  onShareMyLocation,
  onToggleFriendsList,
  onOpenFamilyCare,
  onOpenFamilyMembers,
  onOpenFamilySettings,
  onOpenGroupsWorkspace,
  onOpenGroupRules,
  onOpenGroupDocs,
  onOpenSquadCommand,
  onOpenSquadTasks,
  onOpenActivityList,
  onOpenActiveActivity,
  onOpenUpcomingActivity,
  onOpenMyActivity,
  onOpenCreateActivity,
  onFocusActivityRoute,
  onOpenParticipantsList,
  onTriggerCheckIn,
  onOpenCalendarView,
  onOpenCreateSchedule,
  onOpenCustomPlaces,
  onOpenCreatePlace,
  activitiesCount = 3,
  reducedMotion = false,
}) => {
  const currentConfig =
    MAP_LAYERS_CONFIG.find((l) => l.id === activeLayer) || MAP_LAYERS_CONFIG[0];
  const LayerIcon = currentConfig.icon;

  // Derive dynamic shortcuts for the current active layer according to Section III
  const getShortcutItems = (): ShortcutActionItem[] => {
    switch (activeLayer) {
      case "all":
        return [
          {
            id: "view_all",
            label: "查看全部对象",
            icon: Eye,
            onClick: () => onViewAllObjects?.(),
          },
          {
            id: "clear_filters",
            label: "清除地图筛选",
            icon: RotateCcw,
            onClick: () => onClearFilters?.(),
          },
          {
            id: "search_map",
            label: "搜索地图内容",
            icon: Search,
            onClick: () => onSearchClick?.(),
          },
          {
            id: "open_layers",
            label: "打开图层选择",
            icon: Layers,
            onClick: onOpenLayerPanel,
          },
        ];

      case "friends":
        return [
          {
            id: "nearby_friends",
            label: "附近好友",
            icon: Radar,
            active: activeSubFilter === "nearby",
            onClick: () => {
              onSelectSubFilter?.("nearby");
              onLocateNearbyFriends?.();
            },
          },
          {
            id: "view_friends_loc",
            label: "查看好友位置",
            icon: Navigation,
            onClick: () => onFitAllFriends?.(),
          },
          {
            id: "share_location",
            label: "共享我的位置",
            icon: Share2,
            onClick: () => onShareMyLocation?.(),
          },
          {
            id: "friends_list",
            label: "打开好友列表",
            icon: UserCheck,
            onClick: () => onToggleFriendsList?.(),
          },
        ];

      case "family":
        return [
          {
            id: "family_status",
            label: "家庭成员状态",
            icon: HeartPulse,
            onClick: () => onOpenFamilyMembers?.(),
          },
          {
            id: "family_care",
            label: "家庭守护",
            icon: Shield,
            onClick: () => onOpenFamilyCare?.(),
          },
          {
            id: "family_location",
            label: "查看授权位置",
            icon: MapPin,
            onClick: () => onOpenFamilyCare?.(),
          },
          {
            id: "family_settings",
            label: "打开家庭设置",
            icon: Settings,
            onClick: () => onOpenFamilySettings?.(),
          },
        ];

      case "groups":
        return [
          {
            id: "group_workspace",
            label: "小组工作台",
            icon: LayoutDashboard,
            onClick: () => onOpenGroupsWorkspace?.(),
          },
          {
            id: "group_members",
            label: "成员状态",
            icon: Users,
            onClick: () => onOpenGroupsWorkspace?.(),
          },
          {
            id: "group_rules",
            label: "定位规则",
            icon: Sliders,
            onClick: () => onOpenGroupRules?.(),
          },
          {
            id: "group_docs",
            label: "小组文件/文档",
            icon: FileText,
            onClick: () => onOpenGroupDocs?.(),
          },
        ];

      case "squads":
        return [
          {
            id: "current_squad",
            label: "当前小队",
            icon: Target,
            active: activeSubFilter === "squad_overview",
            onClick: () => {
              onSelectSubFilter?.("squad_overview");
              onOpenSquadCommand?.();
            },
          },
          {
            id: "squad_command",
            label: "行动指挥台",
            icon: Radio,
            onClick: () => onOpenSquadCommand?.(),
          },
          {
            id: "squad_locations",
            label: "队员位置",
            icon: MapPin,
            onClick: () => onOpenSquadCommand?.(),
          },
          {
            id: "squad_tasks",
            label: "当前任务",
            icon: CheckSquare,
            onClick: () => onOpenSquadTasks?.(),
          },
        ];

      case "activities":
        return [
          {
            id: "all_activities",
            label: "全部活动",
            icon: Flame,
            active: activeSubFilter === "all_activities",
            onClick: () => {
              onSelectSubFilter?.("all_activities");
              onOpenActivityList?.("all");
            },
          },
          {
            id: "active_now",
            label: "进行中的活动",
            icon: Flame,
            active: activeSubFilter === "active_now",
            onClick: () => {
              onSelectSubFilter?.("active_now");
              onOpenActiveActivity?.();
            },
          },
          {
            id: "upcoming",
            label: "即将开始",
            icon: Clock,
            active: activeSubFilter === "upcoming",
            onClick: () => {
              onSelectSubFilter?.("upcoming");
              onOpenUpcomingActivity?.();
            },
          },
          {
            id: "my_activities",
            label: "我的活动",
            icon: UserCheck,
            active: activeSubFilter === "my_activities",
            onClick: () => {
              onSelectSubFilter?.("my_activities");
              onOpenMyActivity?.();
            },
          },
          {
            id: "create_activity",
            label: "创建活动",
            icon: Plus,
            isPrimaryAction: true,
            onClick: () => onOpenCreateActivity?.(),
          },
          {
            id: "activity_routes",
            label: "活动路线",
            icon: Route,
            onClick: () => onFocusActivityRoute?.(),
          },
          {
            id: "participants_status",
            label: "参与人状态",
            icon: Users,
            onClick: () => onOpenParticipantsList?.(),
          },
          {
            id: "check_in",
            label: "集合与签到",
            icon: CheckSquare,
            onClick: () => onTriggerCheckIn?.(),
          },
        ];

      case "schedules":
        return [
          {
            id: "today_schedules",
            label: "今日安排",
            icon: Clock,
            onClick: () => onOpenCalendarView?.(),
          },
          {
            id: "upcoming_schedules",
            label: "即将开始",
            icon: Hourglass,
            onClick: () => onOpenCalendarView?.(),
          },
          {
            id: "create_schedule",
            label: "创建日程",
            icon: Plus,
            onClick: () => onOpenCreateSchedule?.(),
          },
          {
            id: "calendar_view",
            label: "日历视图",
            icon: CalendarDays,
            onClick: () => onOpenCalendarView?.(),
          },
        ];

      case "places":
        return [
          {
            id: "frequent_places",
            label: "常去地点",
            icon: Bookmark,
            onClick: () => onOpenCustomPlaces?.(),
          },
          {
            id: "starred_places",
            label: "收藏地点",
            icon: Star,
            onClick: () => onOpenCustomPlaces?.(),
          },
          {
            id: "add_place",
            label: "添加地点",
            icon: Plus,
            onClick: () => onOpenCreatePlace?.(),
          },
          {
            id: "places_history",
            label: "查看地点记录",
            icon: History,
            onClick: () => onOpenCustomPlaces?.(),
          },
        ];

      case "cost_of_living":
        return [
          {
            id: "national_comparison",
            label: "全国对比",
            icon: Globe,
            active: activeCostAction === "national",
            onClick: () => onOpenCostComparison?.("national"),
          },
          {
            id: "province_comparison",
            label: "省份对比",
            icon: Building2,
            active: activeCostAction === "province",
            onClick: () => onOpenCostComparison?.("province"),
          },
          {
            id: "city_comparison",
            label: "城市对比",
            icon: Building,
            active: activeCostAction === "city",
            onClick: () => onOpenCostComparison?.("city"),
          },
          {
            id: "county_comparison",
            label: "区县对比",
            icon: MapPin,
            active: activeCostAction === "county",
            onClick: () => onOpenCostComparison?.("county"),
          },
          {
            id: "my_budget",
            label: "我的预算",
            icon: Calculator,
            active: activeCostAction === "budget",
            onClick: () => onOpenCostBudget?.(),
          },
          {
            id: "relocation_plan",
            label: "定居规划",
            icon: Compass,
            isPrimaryAction: true,
            active: activeCostAction === "relocation",
            onClick: () => onOpenCostRelocation?.(),
          },
        ];

      default:
        return [];
    }
  };

  const shortcuts = getShortcutItems();

  return (
    <div
      id="map-top-linked-shortcut-bar"
      className="w-full flex items-center gap-1.5 pointer-events-auto select-none overflow-hidden"
    >
      {/* 1. Main Primary Blue Button (#1877F2) - Tied directly to activeLayer */}
      <button
        id="map-top-primary-layer-btn"
        type="button"
        onClick={onOpenLayerPanel}
        aria-label={`当前激活图层：${currentConfig.label}，点击打开图层面板`}
        className={`bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white font-bold text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md shadow-2xs border border-[#1877F2] flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
          reducedMotion ? "" : "transition-transform"
        }`}
      >
        <LayerIcon size={15} className="stroke-[2.5]" />
        <span className="whitespace-nowrap tracking-tight">{currentConfig.label}</span>

        {/* Badge: Special badge count (e.g. 3 for activities) */}
        {activeLayer === "activities" && (
          <span
            id="activity-layer-count-badge"
            className="bg-white text-[#1877F2] text-[10px] font-black px-1.5 py-0.2 rounded-full leading-none shadow-xs"
          >
            {activitiesCount}
          </span>
        )}

        {currentConfig.badge && activeLayer !== "activities" && (
          <span className="bg-white/20 text-white text-[9.5px] font-bold px-1 py-0.2 rounded-full leading-none">
            {currentConfig.badge}
          </span>
        )}

        <ChevronRight size={13} className="opacity-75 -mr-0.5" />
      </button>

      {/* 2. Horizontally scrollable shortcut pills - Facebook straight-edge frame style */}
      <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 pl-0.5">
        {shortcuts.map((action) => {
          const ActionIcon = action.icon;
          const isSelected = action.active;

          return (
            <button
              key={action.id}
              id={`shortcut-${action.id}`}
              type="button"
              onClick={action.onClick}
              aria-label={action.label}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-2xs flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer transition-colors border ${
                action.isPrimaryAction
                  ? "bg-[#1877F2]/10 dark:bg-blue-900/30 text-[#1877F2] border-[#1877F2] hover:bg-[#1877F2] hover:text-white"
                  : isSelected
                  ? "bg-[#E7F3FF] dark:bg-blue-950/40 text-[#1877F2] border-[#1877F2]"
                  : "bg-white dark:bg-zinc-900 border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] text-[#050505] dark:text-[#E4E6EB] hover:bg-[#F0F2F5] dark:hover:bg-zinc-800"
              }`}
            >
              <ActionIcon
                size={13}
                className={`stroke-[2.2] ${
                  isSelected ? "text-[#1877F2]" : "text-[#65676B] dark:text-zinc-400"
                }`}
              />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
