import './life-map.css';
import './map-marker.css';
import { convertPublishedActivity } from '../utils/activityPlanning';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/ebookService';
import { friendMatchesMapFilters } from '../utils/friendMarker';
import type { MessageAppearance } from './chat/messageStyles';
import { friendDistanceKm } from '../utils/friendCompass';
import { StarCardDetailModal } from './StarCardDetailModal';
import { getFlightSnapshotInfo } from '../utils/flightTracking';
import { validCoordinates } from '../utils/creationValidation';
import { LifeMapPanel } from './LifeMapPanel';
import { isScheduleOnMap, schedulePhase, normalizeMapFilters, placeIntent, type PlaceIntent, type LifeMapTarget, type LifeRoute } from '../utils/lifePlanning';
import {useMapNavigation, type NavigationDestination} from '../map/useMapNavigation';
import {MapNavigationHud} from './MapNavigationHud';
import {requestCurrentLocation} from '../map/location';
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Friend, ChatConversation, LiveLocationShare, SimulatedMapActivity, ActivityParticipantStatus, DiscoverPost, InstagramVideoData, CustomMapMarker, FriendRelationship, FriendInMapNavState, BeaconPoint, Schedule, MapLayerId, LifePlace, LifePlaceCategory, TrajectoryPoint } from "../types";
import { buildNavigationUrl, detectNavEnvironment, pickNavigationTarget } from "../map/deepLinks";
import { lifeLayerStore } from "../data/lifeLayerStore";
import { FloatingPlaceNameplate } from "./FloatingPlaceNameplate";
import { PlaceMemoryCard } from "./PlaceMemoryCard";
import { PlaceForwardModal } from "./PlaceForwardModal";
import { CreateLifePlaceModal } from "./CreateLifePlaceModal";
import { LifeLayerMapFilterBar, LifeLayerFilterState } from "./LifeLayerMapFilterBar";
import { ActivityCreationUiState } from "./ActivityCreationModal";
import { SIMULATED_ACTIVITIES, INITIAL_CUSTOM_MARKERS, CURRENT_USER_PROFILE } from "../data/mockData";
import { Suspense, lazy } from "react";
import { MapStyleMode, calculateLatLngDistanceMeters } from "../utils/geoUtils";
import { MapLoadingMask } from "./MapLoadingMask";
import { MapSkeletonPlaceholder } from "./MapSkeletonPlaceholder";
import { MapLayerControlDrawer } from "./MapLayerControlDrawer";
import { ActivityCommandDrawer } from "./ActivityCommandDrawer";
import { SquadCommandDrawer } from "./SquadCommandDrawer";

const LazySlippyLeafletMap = lazy(() => import("./SlippyLeafletMap"));
import { User24hHistoryModal } from "./User24hHistoryModal";
import { FriendTrajectoryModal, generateFriend24hTrajectory } from "./FriendTrajectoryModal";
import { MOCK_24H_TRAJECTORY_POINTS, MOCK_FRIEND_TRAJECTORIES } from "../utils/trajectoryData";
import { MapDetailLevel, MAP_DETAIL_CONFIG, getMapDetailLevel, getMapDetailLevelName, identifyAdministrativeRegion } from "../utils/mapDetailConfig";
import { MapUserCalloutPopover } from "./MapUserCalloutPopover";
import { WeatherParticleBackground } from "./WeatherParticleBackground";
import { WeatherGlassEffectOverlay } from "./WeatherGlassEffectOverlay";
import { MapWeatherEffectOverlay } from "./MapWeatherEffectOverlay";
import { getWeatherByCoords, fetchRealtimeWeatherApi, WeatherInfo } from "../utils/weatherEngine";
import { ClothingAdviceIllustration } from "./ClothingAdviceIllustration";
import { CustomMarkerCreationModal } from "./CustomMarkerCreationModal";
import { PinActionRadialMenu, PinActionType } from "./PinActionRadialMenu";
import { CustomMarkerDetailCard } from "./CustomMarkerDetailCard";
import { CustomMarkerContextMenu } from "./CustomMarkerContextMenu";
import { FriendInMapNavBottomBar } from "./FriendInMapNavBottomBar";
import { MapAvatarEnlargeOverlay } from "./MapAvatarEnlargeOverlay";
import { FriendPrivacySettingModal } from "./FriendPrivacySettingModal";
import { MapScaleBar } from "./MapScaleBar";
import { GlobalEmergencyButton } from "./GlobalEmergencyButton";
import {
  ZoomIn,
  ZoomOut,
  MapPin,
  Battery,
  MessageSquare,
  Navigation,
  Sparkles,
  X,
  Heart,
  Key,
  ExternalLink,
  Footprints,
  Users,
  ChevronRight,
  ChevronDown,
  Layers,
  Car,
  Activity,
  Moon,
  Sun,
  Palette,
  Eye,
  Plus,
  ShieldCheck,
  Flame,
  Camera,
  MoreHorizontal,
  Radio,
  Sliders,
  Check,
  Ghost,
  UserPlus,
  Shield,
  Clock,
  EyeOff,
  RotateCcw,
  Calendar,
  Bell,
  Target,
  CircleDollarSign,
  List,
  Map as LucideMap,
} from "lucide-react";
import { formatCountdownReminder } from "../utils/countdownHelper";
import { motion, AnimatePresence } from "motion/react";
import { applyForceCollisionAvoidance } from "../utils/forceDispersal";
import { FriendInteractiveModal } from "./FriendInteractiveModal";
import { FriendsListView } from "./FriendsListView";
import { ZenlyBumpOverlay } from "./ZenlyBumpOverlay";
import { ActivityDetailShortCard } from "./ActivityDetailShortCard";
// ADD: Import relationship overlay
import { LoverAndRelationshipOverlay } from "./LoverAndRelationshipOverlay";
import { QuickFriendsLocationBar } from "./QuickFriendsLocationBar";
import { DynamicLayerQuickBar } from "./DynamicLayerQuickBar";
import { CreateTeamGroupModal, NewGroupData } from "./CreateTeamGroupModal";
import { TeamsHubModal } from "./TeamsHubModal";
import { CostOfLivingMapOverlay } from "./CostOfLivingMapOverlay";
import { RegionalCostDetailDrawer } from "./RegionalCostDetailDrawer";
import { CostComparisonModal } from "./CostComparisonModal";
import { BudgetSimulatorModal } from "./BudgetSimulatorModal";
import { RelocationPlannerModal } from "./RelocationPlannerModal";
import { costOfLivingStore } from "../data/costOfLivingStore";
import { REGIONAL_COST_DATABASE } from "../data/costOfLivingData";
import { soundEffects } from "../utils/soundEffects";
import { haptics } from "../utils/haptics";
import { getActiveRoleId, joinSharedActivityInStore } from "../data/dualRoleStore";

interface MapViewProps {
  friends: Friend[];
  conversations?: ChatConversation[];
  liveLocationShares?: LiveLocationShare[];
  onRemoveLiveLocationShare?: (shareId: string) => void;
  discoverPosts?: DiscoverPost[];
  publishedActivities?: ActivityCreationUiState[];
  activityChanges?: Record<string, SimulatedMapActivity>;
  onUpdateActivity?: (activity: SimulatedMapActivity) => void;
  onEditActivity?: (activity: SimulatedMapActivity) => void;
  onRepeatActivity?: (activity: SimulatedMapActivity) => void;
  onOpenActivityChat?: (activity: SimulatedMapActivity) => void;
  onLikePost?: (postId: string) => void;
  onAddCommentToPost?: (postId: string, commentText: string) => void;
  onOpenChatWith: (friendId: string, appearance?: MessageAppearance) => void;
  userNote?: string;
  attachedEmoji?: string;
  noteTheme?: string;
  userAvatar?: string;
  onEditUserStatus?: () => void;
  onOpenFamilyCare?: () => void;
  onOpenTeams?: () => void;
  onOpenDiscover?: () => void;
  onOpenSettings?: () => void;
  explorationTrigger?: number;
  onAddFriend?: () => void;
  onOpenFriendProfile?: (friendId: string) => void;
  showToast?: (message: string) => void;
  trafficEnabled?: boolean;
  onToggleTraffic?: () => void;
  mapStyle?: MapStyleMode;
  onChangeMapStyle?: (style: MapStyleMode) => void;
  showConfigModal?: boolean;
  onOpenConfigModal?: () => void;
  activeMapFilter?: string | string[];
  onChangeMapFilter?: (filter: string) => void;
  isStealthMode?: boolean;
  onToggleStealth?: () => void;
  onAddNotification?: (title: string, content: string, type: 'message' | 'like' | 'system' | 'radar') => void;
  videoStories?: InstagramVideoData[];
  onSelectVideoStory?: (story: InstagramVideoData) => void;
  triggerPlaceMarker?: boolean;
  onResetTriggerPlaceMarker?: () => void;
  onUpdateFriendRelationship?: (friendId: string, relationship: FriendRelationship) => void;
  onQuickChatWith?: (friendId: string, text: string, options?: { type: 'image'; imageUrl: string; povExpiresAt?: number }) => void;
  schedules?: Schedule[];
  onSelectSchedule?: (schedule: Schedule) => void;
  focusLocation?: LifeMapTarget | null;
  onLifePanelToggle?: (open:boolean) => void;
  onUpdateSchedule?: (schedule: Schedule) => void;
  onOpenScheduleCreation?: (initialLocation?: { name?: string; address?: string; lat?: number; lng?: number }, date?: string) => void;
  onOpenActivityCreation?: (initialLocation?: { name?: string; address?: string; lat?: number; lng?: number }) => void;
  onOpenCreateStory?: (initialLocation?: { name?: string; address?: string; lat?: number; lng?: number }) => void;
  onPinRadialMenuToggle?: (isOpen: boolean) => void;
  onOpenCalendar?: () => void;
  selectedFriend?: Friend | null;
  onSelectedFriendChange?: (friend: Friend | null) => void;
  selectedActivity?: SimulatedMapActivity | null;
  onSelectedActivityChange?: (activity: SimulatedMapActivity | null) => void;
  onShareActivity?: (activity: SimulatedMapActivity) => void;
  onShareLocation?: (locationData: any) => void;
  onShareLifePlace?: (place: LifePlace) => void;
  isIntercomTransmitting?: boolean;
  onIntercomTransmittingChange?: (isTransmitting: boolean) => void;
  viewPerspective?: 'map' | 'friends_list';
  onViewPerspectiveChange?: (perspective: 'map' | 'friends_list') => void;
  onAddLiveLocationShare?: (share: LiveLocationShare) => void;
  onSendMessage?: (conversationId: string, text: string, options?: any) => void;
  currentUserName?: string;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// User current location (Dongfanghong Square, Lanzhou, Gansu)
const USER_LOCATION = { lat: 36.0592, lng: 103.8343 };

function getClothingEmoji(temp: number): string {
  if (temp >= 28) return "👕";
  if (temp >= 24) return "👚";
  if (temp >= 18) return "🧥";
  return "🧣";
}

export const MapView: React.FC<MapViewProps> = ({
  friends,
  conversations,
  liveLocationShares,
  onRemoveLiveLocationShare,
  discoverPosts,
  publishedActivities = [],
  activityChanges = {}, onUpdateActivity, onEditActivity, onRepeatActivity, onOpenActivityChat,
  onLikePost,
  onAddCommentToPost,
  onOpenChatWith,
  userNote,
  attachedEmoji,
  noteTheme,
  userAvatar,
  onEditUserStatus,
  onOpenFamilyCare,
  onOpenTeams,
  onOpenDiscover,
  onOpenSettings,
  explorationTrigger = 0,
  onAddFriend, onOpenFriendProfile,
  showToast,
  trafficEnabled: propTrafficEnabled,
  onToggleTraffic: propOnToggleTraffic,
  mapStyle: propMapStyle,
  onChangeMapStyle: propOnChangeMapStyle,
  showConfigModal: propShowConfigModal,
  onOpenConfigModal: propOnOpenConfigModal,
  activeMapFilter: propActiveMapFilter,
  onChangeMapFilter: propOnChangeMapFilter,
  isStealthMode = false,
  onToggleStealth,
  onAddNotification,
  videoStories = [],
  onSelectVideoStory,
  triggerPlaceMarker,
  onResetTriggerPlaceMarker,
  onUpdateFriendRelationship,
  onQuickChatWith,
  schedules = [],
  onSelectSchedule,
  focusLocation,
  onLifePanelToggle,
  onUpdateSchedule,
  onOpenScheduleCreation,
  onOpenActivityCreation,
  onOpenCreateStory,
  onPinRadialMenuToggle,
  onOpenCalendar,
  selectedFriend: propSelectedFriend,
  onSelectedFriendChange,
  selectedActivity: propSelectedActivity,
  onSelectedActivityChange,
  onShareActivity,
  onShareLocation,
  onShareLifePlace,
  isIntercomTransmitting,
  onIntercomTransmittingChange,
  viewPerspective: propViewPerspective,
  onViewPerspectiveChange,
  onAddLiveLocationShare,
  onSendMessage,
  currentUserName,
}) => {
  const [internalViewPerspective, setInternalViewPerspective] = useState<'map' | 'friends_list'>('map');
  const viewPerspective = propViewPerspective !== undefined ? propViewPerspective : internalViewPerspective;

  const setViewPerspective = useCallback((perspective: 'map' | 'friends_list') => {
    if (propViewPerspective === undefined) {
      setInternalViewPerspective(perspective);
    }
    onViewPerspectiveChange?.(perspective);
  }, [propViewPerspective, onViewPerspectiveChange]);

  const [internalSelectedFriend, setInternalSelectedFriend] = useState<Friend | null>(null);
  const selectedFriend = propSelectedFriend !== undefined ? propSelectedFriend : internalSelectedFriend;

  const setSelectedFriend = useCallback((friendOrUpdater: Friend | null | ((prev: Friend | null) => Friend | null)) => {
    const next = typeof friendOrUpdater === 'function' ? friendOrUpdater(selectedFriend) : friendOrUpdater;
    if (propSelectedFriend === undefined) {
      setInternalSelectedFriend(next);
    }
    onSelectedFriendChange?.(next);
  }, [selectedFriend, propSelectedFriend, onSelectedFriendChange]);

  const [enlargedFriend, setEnlargedFriend] = useState<Friend | null>(null);
  const [selectedFriendSourceRect, setSelectedFriendSourceRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedParticipantActivityContext, setSelectedParticipantActivityContext] = useState<{
    activity: SimulatedMapActivity;
    participant: ActivityParticipantStatus;
  } | null>(null);

  // Active friend 24-hour activity trajectory replay states
  const [activeFriendForTrajectory, setActiveFriendForTrajectory] = useState<Friend | null>(null);
  const [friendTrajectoryTimeHour, setFriendTrajectoryTimeHour] = useState<number>(24.0);
  const [friendTrajectoryCurrentPoint, setFriendTrajectoryCurrentPoint] = useState<TrajectoryPoint | null>(null);

  const activeFriendTrajectoryPoints = useMemo(() => {
    if (!activeFriendForTrajectory) return [];
    return generateFriend24hTrajectory(activeFriendForTrajectory);
  }, [activeFriendForTrajectory]);

  const handleFriendTrajectoryTimeChange = useCallback((timeHour: number, point: TrajectoryPoint) => {
    setFriendTrajectoryTimeHour((prev) => (prev === timeHour ? prev : timeHour));
    setFriendTrajectoryCurrentPoint((prev) => {
      if (prev && prev.lat === point.lat && prev.lng === point.lng && prev.timeHour === point.timeHour) {
        return prev;
      }
      return point;
    });
  }, []);

  // When friend trajectory is active, smoothly override that friend's coordinate to the interpolated point so their avatar glides along the trajectory on the map
  const effectiveFriends = useMemo(() => {
    if (!activeFriendForTrajectory || !friendTrajectoryCurrentPoint) {
      return friends;
    }
    return friends.map((f) => {
      if (f.id === activeFriendForTrajectory.id) {
        return {
          ...f,
          lat: friendTrajectoryCurrentPoint.lat,
          lng: friendTrajectoryCurrentPoint.lng,
          locationName: friendTrajectoryCurrentPoint.locationName,
          status: friendTrajectoryCurrentPoint.note || f.status,
          speed: friendTrajectoryCurrentPoint.speedKmh ? `${friendTrajectoryCurrentPoint.speedKmh}km/h` : f.speed,
        };
      }
      return f;
    });
  }, [friends, activeFriendForTrajectory, friendTrajectoryCurrentPoint]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const handleCloseEnlargedFriend = useCallback(() => {
    setEnlargedFriend(null);
  }, []);

  const handleCloseZenlyBump = useCallback(() => {
    setZenlyBumpFriend(null);
  }, []);

  const handleViewportChanged = useCallback((viewport: { lat: number; lng: number; zoom?: number }) => {
    // Leaflet 的真实缩放。此前 mapZoom 只能由永不执行的 Google 分支驱动，
    // 长期冻结在默认值，导致 detailLevel / 远距标记 / 反应门控等 12 处逻辑失真。
    if (typeof viewport.zoom === 'number') {
      setMapZoom(viewport.zoom);
    }
    if (activeFriendForTrajectory) return;
    setMapCenter((prev) => {
      if (Math.abs(prev.lat - viewport.lat) < 0.0005 && Math.abs(prev.lng - viewport.lng) < 0.0005) {
        return prev;
      }
      return { lat: viewport.lat, lng: viewport.lng };
    });
  }, [activeFriendForTrajectory]);

  const [mapCenter, setMapCenter] = useState(USER_LOCATION);
  const [mapZoom, setMapZoom] = useState<number>(15);
  const zoomTier = Math.round(mapZoom * 2) / 2;
  const detailLevel = getMapDetailLevel(mapZoom);
  const detailConfig = MAP_DETAIL_CONFIG[detailLevel];

  // Life Layer (生活图层) State & Synchronization
  const [lifeIntentFilter,setLifeIntentFilter] = useState<PlaceIntent | 'all'>('all');
  const [lifePlaces, setLifePlaces] = useState<LifePlace[]>(() => lifeLayerStore.getPlaces());
  useEffect(() => {
    return lifeLayerStore.subscribe(() => {
      setLifePlaces([...lifeLayerStore.getPlaces()]);
    });
  }, []);

  const [lifeFilterState, setLifeFilterState] = useState<LifeLayerFilterState>({
    category: 'all',
    creator: 'all',
    onlyTogether: false,
  });

  const [selectedLifePlaceForNameplate, setSelectedLifePlaceForNameplate] = useState<LifePlace | null>(null);
  const [nameplatePosition, setNameplatePosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [selectedLifePlaceForMemoryCard, setSelectedLifePlaceForMemoryCard] = useState<LifePlace | null>(null);
  const [forwardModalPlace, setForwardModalPlace] = useState<LifePlace | null>(null);
  const [createLifePlaceState, setCreateLifePlaceState] = useState<{
    isOpen: boolean;
    initialLocation?: { lat: number; lng: number; name?: string };
    editPlace?: LifePlace | null;
  }>({ isOpen: false });

  // Filtered Life Layer Places
  const filteredLifePlaces = useMemo(() => {
    return lifePlaces.filter((p) => {
      if (lifeFilterState.category !== 'all' && p.category !== lifeFilterState.category) {
        return false;
      }
      if (lifeFilterState.creator === 'mine' && !p.createdByMe) {
        return false;
      }
      if (lifeFilterState.creator === 'friends' && p.createdByMe) {
        return false;
      }
      if (lifeFilterState.onlyTogether && (!p.encounters || p.encounters.totalEncounters === 0)) {
        return false;
      }
      return true;
    });
  }, [lifePlaces, lifeFilterState]);

  // Handle select life place on map (Directly open the Place-Memory Card upon tapping life icon)
  const handleSelectLifePlaceFromMap = useCallback((place: LifePlace, _screenPos?: { x: number; y: number }) => {
    setSelectedLifePlaceForNameplate(null);
    setSelectedLifePlaceForMemoryCard(place);
    setSelectedFriend(null);
    setSelectedActivity(null);
    setSelectedCustomMarker(null);
    setSelectedStarCard(null);
    // Smooth pan center map so that marker is positioned nicely above the memory card
    setMapCenter({ lat: place.lat - 0.0035, lng: place.lng });
    setQuickFlyToLocation({ lat: place.lat - 0.0035, lng: place.lng, zoom: Math.max(mapZoom, 16), timestamp: Date.now() });
  }, [mapZoom]);
  const adminRegion = useMemo(() => {
    const qLat = Math.round(mapCenter.lat * 100) / 100;
    const qLng = Math.round(mapCenter.lng * 100) / 100;
    return identifyAdministrativeRegion(qLat, qLng, zoomTier);
  }, [mapCenter.lat, mapCenter.lng, zoomTier]);
  const [isPhoneInactive, setIsPhoneInactive] = useState(false);
  const lastInteractionRef = useRef(Date.now());

  // Leaflet 地图懒加载及首屏加载蒙层状态 (提升弱网首次启动体验)
  const [isLeafletMapLoading, setIsLeafletMapLoading] = useState(true);
  useEffect(() => {
    // 弱网安全兜底：最多4秒后自动平滑淡出蒙层
    const timer = setTimeout(() => {
      setIsLeafletMapLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      lastInteractionRef.current = Date.now();
      setIsPhoneInactive(false);
    };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);

    const interval = setInterval(() => {
      const idleDuration = Date.now() - lastInteractionRef.current;
      if (idleDuration > 15000) {
        setIsPhoneInactive(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(interval);
    };
  }, []);
  
  // Real-time location-based weather tracking states
  const [isWeatherExpanded, setIsWeatherExpanded] = useState(false);
  const [weatherHost, setWeatherHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const updateHost = () => {
      const el = document.getElementById('stellar-home-weather-slot');
      if (el) setWeatherHost(el);
    };
    updateHost();
    const timer = setTimeout(updateHost, 80);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!explorationTrigger) return;
    setIsWeatherExpanded(false);
    setIsZenlyExplorationOpen(true);
  }, [explorationTrigger]);
  const [activeWeather, setActiveWeather] = useState<WeatherInfo>(() => getWeatherByCoords(mapCenter.lat, mapCenter.lng));
  const [isLiveApiLoading, setIsLiveApiLoading] = useState(false);
  const [manualWeatherEffect, setManualWeatherEffect] = useState<string | null>(null);
  const [isWeatherEffectEnabled, setIsWeatherEffectEnabled] = useState(true);

  // Fetch real-time weather from Open-Meteo API when map center coordinates change
  useEffect(() => {
    let isMounted = true;
    setIsLiveApiLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await fetchRealtimeWeatherApi(mapCenter.lat, mapCenter.lng);
        if (isMounted) {
          setActiveWeather(data);
          setIsLiveApiLoading(false);
        }
      } catch (err) {
        if (isMounted) setIsLiveApiLoading(false);
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [mapCenter.lat, mapCenter.lng]);

  const formattedDateString = useMemo(() => {
    const date = new Date();
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}`;
  }, []);
  const [internalSelectedActivity, setInternalSelectedActivity] = useState<SimulatedMapActivity | null>(null);
  const selectedActivityBase = propSelectedActivity !== undefined ? propSelectedActivity : internalSelectedActivity;
  const selectedActivity = selectedActivityBase ? activityChanges[selectedActivityBase.id] || selectedActivityBase : null;

  const setSelectedActivity = useCallback((actOrUpdater: SimulatedMapActivity | null | ((prev: SimulatedMapActivity | null) => SimulatedMapActivity | null)) => {
    const next = typeof actOrUpdater === 'function' ? actOrUpdater(selectedActivity) : actOrUpdater;
    if (propSelectedActivity === undefined) {
      setInternalSelectedActivity(next);
    }
    onSelectedActivityChange?.(next);
  }, [selectedActivity, propSelectedActivity, onSelectedActivityChange]);

  const [selectedStarCard, setSelectedStarCard] = useState<DiscoverPost | null>(null);
  const [starCardCommentInput, setStarCardCommentInput] = useState('');

  // Group Activity & Admin Viewing State
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isTeamsHubModalOpen, setIsTeamsHubModalOpen] = useState(false);
  const [isAdminViewMode, setIsAdminViewMode] = useState(true);
  const [expandedMemberTrajectoryId, setExpandedMemberTrajectoryId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedActivity?.isGroupActivity) {
      setIsAdminViewMode(selectedActivity.isUserAdmin !== false);
    }
    setExpandedMemberTrajectoryId(null);
  }, [selectedActivity?.id]);

  // 24-Hour Location History Replay & Trajectory States
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historySelectedTimeHour, setHistorySelectedTimeHour] = useState(24.0);
  const [isHistoryPlaying, setIsHistoryPlaying] = useState(false);
  const [historyPlaybackSpeed, setHistoryPlaybackSpeed] = useState(1);
  const [showFriendTrajectoriesInMap, setShowFriendTrajectoriesInMap] = useState(true);

  // Playback timer loop
  useEffect(() => {
    let timer: any = null;
    if (isHistoryModalOpen && isHistoryPlaying) {
      timer = setInterval(() => {
        setHistorySelectedTimeHour((prev) => {
          if (prev >= 24) return 0;
          return Math.min(24, Math.round((prev + 0.1 * historyPlaybackSpeed) * 10) / 10);
        });
      }, 150);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isHistoryModalOpen, isHistoryPlaying, historyPlaybackSpeed]);

  const starCards = useMemo(() => {
    return discoverPosts?.filter((p) => p.lat !== undefined && p.lng !== undefined) || [];
  }, [discoverPosts]);
  const [simulatedActivities, setSimulatedActivities] = useState<SimulatedMapActivity[]>(SIMULATED_ACTIVITIES);

  const handleCreateTeamSuccess = (newTeam: NewGroupData) => {
    setIsCreateTeamModalOpen(false);
    const newGroupAct: SimulatedMapActivity = {
      id: `act-grp-${newTeam.id}-${Date.now()}`,
      title: `【${newTeam.name.replace('小组 · ', '')}】全员线下集结研讨`,
      category: `小组活动 · ${newTeam.name}`,
      icon: '👥',
      startTime: '16:00',
      endTime: '19:30',
      timeRange: '16:00 - 19:30',
      locationName: '东方红广场中心草坪',
      address: '城关区东方红广场南侧 · 小组专属集结区',
      lat: USER_LOCATION.lat + 0.003,
      lng: USER_LOCATION.lng + 0.004,
      color: '#1877F2',
      bgGradient: 'from-blue-600 to-indigo-700',
      status: 'active_countdown',
      statusText: '实时进行中 · 全员集结',
      trackingWindowMinutes: 30,
      showLocationAndDistance: true,
      showNavRoutesAndSpeed: true,
      enableArrivalAggregationAnimation: true,
      enableFloatingVibes: true,
      isReminderSet: true,
      isGroupActivity: true,
      groupId: newTeam.id,
      groupName: newTeam.name,
      groupAvatar: newTeam.thumbnail || newTeam.adminAvatar,
      groupAdminName: newTeam.adminName || 'Alex Mercer (我)',
      groupAdminAvatar: newTeam.adminAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      isUserAdmin: true,
      authorizedScope: {
        timeWindow: '活动有效时段 (15:30 - 20:00 · 含前后30分钟)',
        geofenceRadiusKm: 2.5,
        rulesSummary: `依据《${newTeam.name}位置隐私协议》，小组管理员享有在活动有效时段与2.5km电子围栏范围内查阅全员实时定位坐标、速度、电量与行进轨迹权限。`,
        isScopeActive: true,
        authorizedRoles: ['Admin'],
      },
      participants: [
        {
          id: `p-grp-admin-${Date.now()}`,
          name: 'Alex Mercer (我 - 小组管理员)',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          status: 'arrived',
          statusText: '已在集合点主持',
          currentLat: USER_LOCATION.lat + 0.003,
          currentLng: USER_LOCATION.lng + 0.004,
          speedKmh: 0,
          distanceMeters: 0,
          distanceText: '已到场',
          relationship: 'close',
          relationshipLabel: '👑 管理员',
          estimatedArrivalTime: '已就位',
          groupRole: 'admin',
          batteryLevel: 98,
          isInGeofence: true,
          trajectoryHistory: [
            { lat: USER_LOCATION.lat + 0.001, lng: USER_LOCATION.lng + 0.001, time: '15:40', speedKmh: 18, checkpointName: '天水南路' },
            { lat: USER_LOCATION.lat + 0.003, lng: USER_LOCATION.lng + 0.004, time: '15:55', speedKmh: 0, checkpointName: '东方红集结点' },
          ],
        },
        {
          id: `p-grp-sarah-${Date.now()}`,
          name: 'Sarah Chen (薛梦)',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
          status: 'on_the_way',
          statusText: '骑行赶往中',
          transport: 'bike',
          etaMinutes: 5,
          currentLat: USER_LOCATION.lat + 0.006,
          currentLng: USER_LOCATION.lng + 0.001,
          speedKmh: 16,
          distanceMeters: 750,
          distanceText: '距离 750 m',
          relationship: 'close',
          relationshipLabel: '⭐ 核心成员',
          estimatedArrivalTime: '16:05 到达',
          groupRole: 'core',
          batteryLevel: 85,
          isInGeofence: true,
          trajectoryHistory: [
            { lat: USER_LOCATION.lat + 0.010, lng: USER_LOCATION.lng - 0.002, time: '15:45', speedKmh: 18, checkpointName: '正宁路口' },
            { lat: USER_LOCATION.lat + 0.006, lng: USER_LOCATION.lng + 0.001, time: '15:58', speedKmh: 16, checkpointName: '广场西口' },
          ],
        },
        {
          id: `p-grp-lucas-${Date.now()}`,
          name: 'Lucas Zhao (赵卢卡斯)',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
          status: 'on_the_way',
          statusText: '驾车赶往中',
          transport: 'car',
          etaMinutes: 8,
          currentLat: USER_LOCATION.lat - 0.004,
          currentLng: USER_LOCATION.lng + 0.008,
          speedKmh: 36,
          distanceMeters: 1300,
          distanceText: '距离 1.3 km',
          relationship: 'friend',
          relationshipLabel: '⭐ 核心成员',
          estimatedArrivalTime: '16:08 到达',
          groupRole: 'core',
          batteryLevel: 74,
          isInGeofence: true,
          trajectoryHistory: [
            { lat: USER_LOCATION.lat - 0.010, lng: USER_LOCATION.lng + 0.012, time: '15:42', speedKmh: 42, checkpointName: '南环路' },
            { lat: USER_LOCATION.lat - 0.004, lng: USER_LOCATION.lng + 0.008, time: '15:56', speedKmh: 36, checkpointName: '平凉路' },
          ],
        },
      ],
    };
    setSimulatedActivities((prev) => [newGroupAct, ...prev]);
    setSelectedActivity(newGroupAct);
    setIsAdminViewMode(true);
    setMapCenter({ lat: newGroupAct.lat, lng: newGroupAct.lng });
    showToast?.(`🎉 小组「${newTeam.name}」创建成功！已在首页地图生成小组专属活动，管理员全员定位与轨迹授权已就绪 📍`);
  };

  const handleToggleAllParticipantsArrived = (activityId: string) => {
    setSimulatedActivities((prev) =>
      prev.map((act) => {
        if (act.id !== activityId) return act;
        const isCurrentlyAllArrived =
          (act.participants || []).length > 0 &&
          (act.participants || []).every((p) => p.status === "arrived");

        if (isCurrentlyAllArrived) {
          // Toggle 1 member back to in-transit
          const updatedParticipants = (act.participants || []).map((p, idx) => {
            if (idx === 1) {
              return {
                ...p,
                status: "on_the_way" as const,
                statusText: "赶往集合点中",
                distanceRemainingMeters: 480,
                estimatedArrivalMinutes: 3,
                currentLat: act.lat - 0.003,
                currentLng: act.lng + 0.004,
              };
            }
            return p;
          });
          showToast?.(`已切换【${act.title}】状态：模拟 1 位成员赶往集合点 🚶‍♂️`);
          return {
            ...act,
            statusText: "进行中 · 1人赶往中",
            participants: updatedParticipants,
          };
        } else {
          // Mark all participants as arrived
          const updatedParticipants = (act.participants || []).map((p) => ({
            ...p,
            status: "arrived" as const,
            statusText: "已到达集合点",
            distanceRemainingMeters: 0,
            estimatedArrivalMinutes: 0,
            currentLat: act.lat,
            currentLng: act.lng,
          }));
          soundEffects.playConvergenceSound();
          haptics.trigger("success");
          showToast?.(`🎉【${act.title}】全体人员已全部到齐！成员头像已向心聚合生效！`);
          return {
            ...act,
            statusText: "全员到齐 · 头像已聚合",
            participants: updatedParticipants,
          };
        }
      })
    );
  };

  const allActivities = useMemo(() => {
    const userConverted = publishedActivities.map(activity => convertPublishedActivity(activity, [
      ...friends.filter(friend => !friend.isMe && friend.id !== 'me'),
      { ...CURRENT_USER_PROFILE, name: currentUserName || CURRENT_USER_PROFILE.name, avatar: userAvatar || CURRENT_USER_PROFILE.avatar },
    ]));
    return [...userConverted, ...simulatedActivities].map(activity => activityChanges[activity.id] || activity);
  }, [publishedActivities, simulatedActivities, activityChanges, friends, currentUserName, userAvatar]);

  useEffect(() => {
    if (selectedActivity) setQuickFlyToLocation({ lat: selectedActivity.lat, lng: selectedActivity.lng, zoom: 16, timestamp: Date.now() });
  }, [selectedActivity?.id]);

  // Ensure activities layer is enabled when user publishes activities
  useEffect(() => {
    if (publishedActivities && publishedActivities.length > 0) {
      setLocalActiveMapFilters((prev) => (prev.includes('activities') ? prev : [...prev, 'activities']));
    }
  }, [publishedActivities]);
  const [beacons, setBeacons] = useState<BeaconPoint[]>([]);
  const [selectedBeacon, setSelectedBeacon] = useState<BeaconPoint | null>(null);
  const [isFriendPrivacyOpen, setIsFriendPrivacyOpen] = useState(false);

  const handleGhostButtonClick = () => {
    if (selectedFriend) {
      setIsFriendPrivacyOpen(true);
    } else {
      if (onToggleStealth) onToggleStealth();
    }
  };

  const handleCheckInBeacon = (beaconId: string) => {
    setBeacons((prev) =>
      prev.map((b) =>
        b.id === beaconId
          ? {
              ...b,
              checkedInCount: b.checkedInCount + 1,
              lastCheckInUser: 'Alexia (我) (刚刚)',
            }
          : b
      )
    );
  };
  const [bouncingFriendId, setBouncingFriendId] = useState<string | null>(null);
  const [activeFriendBubbles, setActiveFriendBubbles] = useState<{ id: string; friendId: string; emoji: string; text?: string }[]>([]);
  const [navigatingFriend, setNavigatingFriend] = useState<Friend | null>(null);
  const [navigationOrigin,setNavigationOrigin]=useState(USER_LOCATION);
  const [locationPending,setLocationPending]=useState(false);
  const [usingDeviceLocation,setUsingDeviceLocation]=useState(false);
  const navigation = useMapNavigation(navigationOrigin);
  useEffect(()=>{
    if(!usingDeviceLocation||!navigator.geolocation)return;
    const watch=navigator.geolocation.watchPosition(position=>{
      const {latitude:lat,longitude:lng}=position.coords;
      if(Number.isFinite(lat)&&Number.isFinite(lng))setNavigationOrigin({lat,lng});
    },()=>{}, {enableHighAccuracy:true,maximumAge:15000});
    return()=>navigator.geolocation.clearWatch(watch);
  },[usingDeviceLocation]);
  useEffect(()=>{
    if(!selectedFriend)return;
    const updated=friends.find(f=>f.id===selectedFriend.id);
    if(updated&&(updated.lat!==selectedFriend.lat||updated.lng!==selectedFriend.lng))setSelectedFriend(updated);
  },[friends,selectedFriend,setSelectedFriend]);
  useEffect(()=>{
    const target=navigation.target;
    if(!target?.friend)return;
    const updated=friends.find(f=>f.id===target.friend!.id);
    if(updated&&(updated.lat!==target.lat||updated.lng!==target.lng))navigation.start({...target,lat:updated.lat,lng:updated.lng,friend:updated},navigation.mode);
  },[friends,navigation.target,navigation.mode,navigation.start]);
  const lifeRoute = navigation.route;
  const navFriend = navigation.target?.friend;
  const inMapNavState: FriendInMapNavState | null = navFriend ? {
    friendId:navFriend.id, friend:navFriend, status:'paused', progress:0,
    currentDistanceMeters:(lifeRoute?.distanceKm || 0)*1000,
    currentEtaSeconds:(lifeRoute?.minutes || 0)*60, speedKmh:0, lastUpdated:0,
  } : null;
  const [isQuickFriendsBarVisible, setIsQuickFriendsBarVisible] = useState<boolean>(true);
  const [isSosVisible, setIsSosVisible] = useState<boolean>(true);
  const [activeQuickFriendId, setActiveQuickFriendId] = useState<string | null>(null);
  const [quickFlyToLocation, setQuickFlyToLocation] = useState<{ lat: number; lng: number; zoom?: number; timestamp: number } | null>(null);

  const [isLifePanelOpen,setIsLifePanelOpen] = useState(false);
  useEffect(() => { onLifePanelToggle?.(isLifePanelOpen || isHistoryModalOpen); return () => onLifePanelToggle?.(false); },[isLifePanelOpen,isHistoryModalOpen,onLifePanelToggle]);
  const [focusedScheduleId,setFocusedScheduleId] = useState<string | null>(null);
  const [lifeNow,setLifeNow] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setLifeNow(Date.now()),30000); return () => clearInterval(timer); },[]);
  useEffect(() => {
    if (!focusLocation) return;
    setSelectedFriend(null); setSelectedActivity(null);
    setMapCenter({lat:focusLocation.lat,lng:focusLocation.lng});
    setQuickFlyToLocation({lat:focusLocation.lat,lng:focusLocation.lng,zoom:16,timestamp:focusLocation.timestamp});
    setFocusedScheduleId(focusLocation.scheduleId || null);
    if (focusLocation.planRoute) {
      const schedule=schedules.find(item => item.id === focusLocation.scheduleId);
      navigation.start({...focusLocation,schedule},schedule?.travelPlan?.mode || 'walking');
      setIsLifePanelOpen(true);
    }
  },[focusLocation]);
  const isCancelledSchedule = (item: Schedule) => item.status === 'cancelled' || (item.type === 'flight' && getFlightSnapshotInfo(item,lifeNow).status === 'cancelled');
  const hasActiveFlight = (item: Schedule) => {const snapshot = item.type === 'flight' ? getFlightSnapshotInfo(item,lifeNow) : null;return snapshot?.mode === 'live' && ['in_flight','delayed','boarding','departing'].includes(snapshot.status);};
  const [recentlyCreatedScheduleIds,setRecentlyCreatedScheduleIds] = useState<string[]>([]);
  const seenScheduleIdsRef = useRef<Set<string>|null>(null);
  const visibleSchedules = schedules.filter(item => !isCancelledSchedule(item) && (item.id === focusedScheduleId || recentlyCreatedScheduleIds.includes(item.id) || hasActiveFlight(item) || (isScheduleOnMap(item,lifeNow) && schedulePhase(item,lifeNow) !== 'ended')));
  useEffect(()=>{
    const ids=schedules.map(item=>item.id);
    const previous=seenScheduleIdsRef.current;
    seenScheduleIdsRef.current=new Set(ids);
    if(!previous)return;
    const created=ids.filter(id=>!previous.has(id));
    if(created.length)setRecentlyCreatedScheduleIds(items=>[...items.filter(id=>!created.includes(id)),...created].slice(-10));
  },[schedules]);

  const handleToggleQuickFriendsBar = useCallback(() => {
    haptics.trigger('light');
    soundEffects.playTapSound();
    setIsQuickFriendsBarVisible((prev) => !prev);
  }, []);

  // Zenly Interaction States
  const [zenlyBumpFriend, setZenlyBumpFriend] = useState<Friend | null>(null);
  const [isZenlyExplorationOpen, setIsZenlyExplorationOpen] = useState<boolean>(false);
  const [isCityExplorationActive, setIsCityExplorationActive] = useState<boolean>(true);
  const [localShowConfigModal, setLocalShowConfigModal] = useState(false);
  const showConfigModal = propShowConfigModal !== undefined ? propShowConfigModal : localShowConfigModal;
  const setShowConfigModal = propOnOpenConfigModal ? (val: boolean) => { if (val) propOnOpenConfigModal(); setLocalShowConfigModal(val); } : setLocalShowConfigModal;

  const [localTrafficEnabled, setLocalTrafficEnabled] = useState<boolean>(true);
  const trafficEnabled = propTrafficEnabled !== undefined ? propTrafficEnabled : localTrafficEnabled;
  const setTrafficEnabled = propOnToggleTraffic ? () => propOnToggleTraffic() : setLocalTrafficEnabled;

  const [localMapStyle, setLocalMapStyle] = useState<MapStyleMode>("standard");
  const mapStyle = propMapStyle !== undefined ? propMapStyle : localMapStyle;
  const setMapStyle = propOnChangeMapStyle ? (style: MapStyleMode) => propOnChangeMapStyle(style) : setLocalMapStyle;

  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);
  const [expandedSpeechId, setExpandedSpeechId] = useState<string | null>(null);
  const [showCalloutDemo, setShowCalloutDemo] = useState<boolean>(false);
  const [isFabOpen, setIsFabOpen] = useState<boolean>(false);

  // Active single open speech bubble ID for left sidebar avatars ("点击头像时候，显示气泡，其他人则关闭气泡")


  // Map Layer Single-Choice and Linked State
  const [activeLayer, setActiveLayer] = useState<MapLayerId>(() => {
    if (propActiveMapFilter) {
      const arr = Array.isArray(propActiveMapFilter) ? propActiveMapFilter : [propActiveMapFilter];
      if (arr.includes("activities")) return "activities";
      if (arr.includes("squads")) return "squads";
      if (arr.includes("groups")) return "groups";
      if (arr.includes("family")) return "family";
      if (arr.includes("friends")) return "friends";
      if (arr.includes("schedules")) return "schedules";
      if (arr.includes("places")) return "places";
    }
    return "friends";
  });

  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState<boolean>(false);
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState<boolean>(false);
  const [selectedActivityTab, setSelectedActivityTab] = useState<"all" | "active" | "upcoming" | "my">("all");
  const [selectedActivityDetailId, setSelectedActivityDetailId] = useState<string | null>("act-yellow-river-explore");
  const [isSquadDrawerOpen, setIsSquadDrawerOpen] = useState<boolean>(false);
  const [activeSubFilter, setActiveSubFilter] = useState<string>("all");

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [localActiveMapFilters, setLocalActiveMapFilters] = useState<string[]>(["friends"]);
  const activeMapFilterProp = propActiveMapFilter !== undefined ? propActiveMapFilter : localActiveMapFilters;

  const activeFilters = useMemo(() => {
    const raw = Array.isArray(activeMapFilterProp) ? activeMapFilterProp : [activeMapFilterProp];
    return raw.length > 0 ? normalizeMapFilters(raw) : ["all"];
  }, [activeMapFilterProp]);

  useEffect(() => { if (!activeFilters.includes('schedules')) setFocusedScheduleId(null); },[activeFilters]);

  // Sync activeLayer with activeFilters
  useEffect(() => {
    if (activeFilters.includes("all") || activeFilters.length >= 4) {
      setActiveLayer("all");
    } else if (activeFilters.length === 1) {
      const single = activeFilters[0];
      if (["friends", "family", "groups", "squads", "activities", "schedules", "places", "cost_of_living"].includes(single)) {
        setActiveLayer(single as MapLayerId);
      } else if (single === "stars") {
        setActiveLayer("places");
      }
    }
  }, [activeFilters]);

  const [focusedQuickItemId, setFocusedQuickItemId] = useState<string | null>(null);
  const starsOnly = activeFilters.includes('stars') && !activeFilters.includes('places');
  useEffect(() => { setFocusedQuickItemId(null); }, [activeLayer, starsOnly]);

  // Cost of Living local store state subscription
  const [costOfLivingState, setCostOfLivingState] = useState(costOfLivingStore.getState());
  useEffect(() => {
    return costOfLivingStore.subscribe(setCostOfLivingState);
  }, []);

  const handleSelectLayer = useCallback((layer: MapLayerId) => {
    setActiveLayer(layer);
    setActiveSubFilter("all");
    const filters = (() => {
      switch (layer) {
        case "all":
          return ["all", "friends", "family", "groups", "squads", "activities", "schedules", "places", "life", "stars"];
        case "friends":
          return ["friends"];
        case "family":
          return ["family"];
        case "groups":
          return ["groups"];
        case "squads":
          return ["squads"];
        case "activities":
          return ["activities"];
        case "schedules":
          return ["schedules"];
        case "stars":
          return ["stars"];
        case "life":
        case "places":
        case "life_layer":
          return ["life", "places", "life_layer", "schedules"];
        case "cost_of_living":
          return ["cost_of_living"];
        default:
          return ["all"];
      }
    })();
    setLocalActiveMapFilters(filters);
    propOnChangeMapFilter?.(filters as any);
    setIsQuickFriendsBarVisible(true);

    if (layer === "groups") {
      setMapCenter({ lat: 36.0540, lng: 103.8560 });
      setQuickFlyToLocation({
        lat: 36.0540,
        lng: 103.8560,
        zoom: 15.6,
        timestamp: Date.now(),
      });
    } else if (layer === "cost_of_living") {
      // 聚焦至兰州榆中县标杆样本区
      setMapCenter({ lat: 35.8458, lng: 104.1136 });
      setQuickFlyToLocation({
        lat: 35.8458,
        lng: 104.1136,
        zoom: 11,
        timestamp: Date.now(),
      });
    }

    if (showToast) {
      const layerLabels: Record<MapLayerId, string> = {
        all: "全部图层",
        friends: "好友",
        family: "家人",
        groups: "小组活动成员",
        squads: "小队",
        activities: "活动（同城 · 集结）",
        schedules: "日程安排",
        places: "生活（地图坐标 · 日程）",
        life: "生活（地图坐标 · 日程）",
        stars: "星片（打卡 · 发现）",
        life_layer: "生活图层",
        cost_of_living: "生活成本",
      };
      showToast(`🗺️ 已切换至「${layerLabels[layer] || '生活图层'}」`);
    }
  }, [propOnChangeMapFilter, showToast]);

  // 浮动按钮子菜单：支持多选、单选，点击不关闭，进行其他操作时视为确定
  const handleToggleFabLayer = useCallback((layerKey: string) => {
    haptics.trigger("selection");
    soundEffects.playTapSound();

    const specificLayers = ["groups", "friends", "family", "activities", "stars", "life"];
    const current = Array.isArray(activeFilters) ? activeFilters : [activeFilters];
    const isCurrentlyAll = current.includes("all") || specificLayers.every((l) => current.includes(l));

    let nextFilters: string[];

    if (layerKey === "all") {
      if (isCurrentlyAll) {
        // 如果当前已是全部，切换为单选好友
        nextFilters = ["friends"];
      } else {
        // 切换为全选
        nextFilters = ["all", "groups", "friends", "family", "activities", "stars", "life", "places", "squads", "schedules"];
      }
    } else if (layerKey === "life") {
      // 生活图层：统筹地图坐标 (places, life) 与日程安排 (schedules)
      const lifeKeys = ["life", "places", "life_layer", "schedules"];
      const isLifeActive = lifeKeys.some((k) => current.includes(k));
      if (isCurrentlyAll) {
        nextFilters = ["life", "places", "life_layer", "schedules"];
      } else if (isLifeActive) {
        const filtered = current.filter((item) => !lifeKeys.includes(item) && item !== "all");
        nextFilters = filtered.length === 0 ? ["all", "groups", "friends", "family", "activities", "stars", "life", "places", "squads", "schedules"] : filtered;
      } else {
        nextFilters = [...current.filter((item) => item !== "all"), ...lifeKeys];
      }
    } else {
      if (isCurrentlyAll) {
        // 当前为全部开启时，点击某单项即实现“单选”
        nextFilters = [layerKey];
      } else {
        if (current.includes(layerKey)) {
          // 当前已包含该项，取消勾选
          const filtered = current.filter((item) => item !== layerKey && item !== "all");
          if (filtered.length === 0) {
            nextFilters = ["all", "groups", "friends", "family", "activities", "stars", "life", "places", "squads", "schedules"];
          } else {
            nextFilters = filtered;
          }
        } else {
          // 当前未包含该项，累加勾选（多选）
          const combined = [...current.filter((item) => item !== "all"), layerKey];
          if (specificLayers.every((l) => combined.includes(l))) {
            nextFilters = ["all", "groups", "friends", "family", "activities", "stars", "life", "places", "squads", "schedules"];
          } else {
            nextFilters = combined;
          }
        }
      }
    }

    // 同步 activeLayer 保持合理的底图模式
    if (nextFilters.includes("all") || nextFilters.length >= 6) {
      setActiveLayer("all");
    } else if (nextFilters.includes("life") || nextFilters.includes("places") || nextFilters.includes("schedules")) {
      setActiveLayer("life");
    } else if (nextFilters.includes("stars")) {
      setActiveLayer("stars");
    } else if (nextFilters.includes("activities")) {
      setActiveLayer("activities");
    } else if (nextFilters.includes("groups")) {
      setActiveLayer("groups");
    } else if (nextFilters.includes("family")) {
      setActiveLayer("family");
    } else if (nextFilters.includes("friends")) {
      setActiveLayer("friends");
    } else {
      setActiveLayer((nextFilters[0] as MapLayerId) || "all");
    }

    setLocalActiveMapFilters(nextFilters);
    propOnChangeMapFilter?.(nextFilters as any);

    if (layerKey === "groups" && nextFilters.includes("groups")) {
      setMapCenter({ lat: 36.0540, lng: 103.8560 });
      setQuickFlyToLocation({
        lat: 36.0540,
        lng: 103.8560,
        zoom: 15.6,
        timestamp: Date.now(),
      });
    }

    // 关键：不调用 setIsFabOpen(false)，保持子菜单持续展开供多选或单选！进行其他操作时自然收起视为确定。
  }, [activeFilters, propOnChangeMapFilter]);

  const isAllLayersClosed = useMemo(() => {
    return activeFilters.length === 0;
  }, [activeFilters]);

  // Custom Map Markers ("我的标记") states
  const [customMarkers, setCustomMarkers] = useState<CustomMapMarker[]>(() => {
    try {
      const saved = localStorage.getItem("stellar_custom_markers");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CUSTOM_MARKERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("stellar_custom_markers", JSON.stringify(customMarkers));
    } catch (e) {
      console.error(e);
    }
  }, [customMarkers]);

  // Collect all critical points across user, friends, activities, custom markers for optimal viewport framing (filtered to local 15km city radius)
  const allKeyMapPoints = useMemo(() => {
    const pts: { lat: number; lng: number }[] = [USER_LOCATION];
    const maxRadiusMeters = 15000;
    friends.forEach((f) => {
      if (typeof f.lat === 'number' && typeof f.lng === 'number') {
        const dist = calculateLatLngDistanceMeters(USER_LOCATION.lat, USER_LOCATION.lng, f.lat, f.lng);
        if (dist <= maxRadiusMeters) {
          pts.push({ lat: f.lat, lng: f.lng });
        }
      }
    });
    (allActivities || []).forEach((a) => {
      if (typeof a.lat === 'number' && typeof a.lng === 'number') {
        const dist = calculateLatLngDistanceMeters(USER_LOCATION.lat, USER_LOCATION.lng, a.lat, a.lng);
        if (dist <= maxRadiusMeters) {
          pts.push({ lat: a.lat, lng: a.lng });
        }
      }
    });
    (customMarkers || []).forEach((cm) => {
      if (typeof cm.lat === 'number' && typeof cm.lng === 'number') {
        const dist = calculateLatLngDistanceMeters(USER_LOCATION.lat, USER_LOCATION.lng, cm.lat, cm.lng);
        if (dist <= maxRadiusMeters) {
          pts.push({ lat: cm.lat, lng: cm.lng });
        }
      }
    });
    return pts;
  }, [friends, simulatedActivities, customMarkers]);

  // Listen for dynamic beacon / custom marker creation events across the app
  useEffect(() => {
    const handleMarkerUpdate = (e: Event) => {
      try {
        const saved = localStorage.getItem("stellar_custom_markers");
        if (saved) {
          const parsed = JSON.parse(saved);
          setCustomMarkers(parsed);
        }
        const customEvent = e as CustomEvent;
        if (customEvent.detail && customEvent.detail.lat && customEvent.detail.lng) {
          setMapCenter({ lat: customEvent.detail.lat, lng: customEvent.detail.lng });
          setMapZoom(16);
        }
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener("stellar_custom_markers_updated", handleMarkerUpdate);
    return () => {
      window.removeEventListener("stellar_custom_markers_updated", handleMarkerUpdate);
    };
  }, []);

  const [isPlacingPinMode, setIsPlacingPinMode] = useState<boolean>(false);
  const [longPressPinCoord, setLongPressPinCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [isPinRadialMenuOpen, setIsPinRadialMenuOpen] = useState<boolean>(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState<boolean>(false);
  const [selectedCustomMarker, setSelectedCustomMarker] = useState<CustomMapMarker | null>(null);
  const [contextMenuMarker, setContextMenuMarker] = useState<CustomMapMarker | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const prevPinMenuStateRef = useRef<boolean>(false);
  useEffect(() => {
    const nextState = isPinRadialMenuOpen || isIconPickerOpen;
    if (prevPinMenuStateRef.current !== nextState) {
      prevPinMenuStateRef.current = nextState;
      onPinRadialMenuToggle?.(nextState);
    }
  }, [isPinRadialMenuOpen, isIconPickerOpen, onPinRadialMenuToggle]);

  const getApproxAddressForCoord = (lat: number, lng: number) => {
    if (Math.abs(lat - 36.0592) < 0.005 && Math.abs(lng - 103.8343) < 0.005) {
      return "城关区 · 东方红广场核心商圈";
    }
    if (Math.abs(lat - 36.0664) < 0.006 && Math.abs(lng - 103.8153) < 0.006) {
      return "城关区 · 黄河中山铁桥 / 南滨河东路";
    }
    if (Math.abs(lat - 36.0660) < 0.008 && Math.abs(lng - 103.7780) < 0.008) {
      return "七里河区 · 兰州中心商圈";
    }
    if (Math.abs(lat - 36.0745) < 0.008 && Math.abs(lng - 103.8240) < 0.008) {
      return "城关区 · 白塔山公园景区附近";
    }
    if (Math.abs(lat - 36.0610) < 0.008 && Math.abs(lng - 103.8110) < 0.008) {
      return "城关区 · 西关十字商业步行街";
    }
    return `城关区 · 坐标 (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  const handleOpenMyMarkerPlacer = () => {
    setIsFabOpen(false);
    setLongPressPinCoord(null);
    setIsPlacingPinMode(true);
    setSelectedCustomMarker(null);
    setSelectedFriend(null);
    setSelectedActivity(null);
    setSelectedStarCard(null);
    if (showToast) showToast("已进入标记放置模式 · 请移动地图瞄准目标位置 📍");
  };

  const handleMapLongPress = (coord: { lat: number; lng: number }, _screenPos?: { x: number; y: number }) => {
    haptics.trigger('medium');
    soundEffects.playTapSound();
    setLongPressPinCoord(coord);
    // 屏幕自动平滑锚定到手机屏幕中间位置
    setMapCenter(coord);
    setQuickFlyToLocation({ lat: coord.lat, lng: coord.lng, zoom: Math.max(mapZoom, 16), timestamp: Date.now() });
    setIsPlacingPinMode(false);
    setSelectedCustomMarker(null);
    setSelectedFriend(null);
    setSelectedActivity(null);
    setSelectedStarCard(null);
    setIsIconPickerOpen(false);
    setIsPinRadialMenuOpen(true);
    if (showToast) {
      showToast("📍 已选定目标位置 · 地图已平滑锚定至屏幕中央");
    }
  };

  const handleSelectPinAction = (action: PinActionType) => {
    setIsPinRadialMenuOpen(false);
    if (!longPressPinCoord) return;

    const approxAddr = getApproxAddressForCoord(longPressPinCoord.lat, longPressPinCoord.lng);
    const locObj = {
      name: approxAddr,
      address: approxAddr,
      lat: longPressPinCoord.lat,
      lng: longPressPinCoord.lng,
    };

    if (action === 'schedule') {
      if (onOpenScheduleCreation) {
        onOpenScheduleCreation(locObj);
      } else if (showToast) {
        showToast(`📅 已选定地点「${approxAddr}」· 开启日程创建`);
      }
    } else if (action === 'activity') {
      if (onOpenActivityCreation) {
        onOpenActivityCreation(locObj);
      } else if (showToast) {
        showToast(`🚀 已选定地点「${approxAddr}」· 开启活动招募`);
      }
    } else if (action === 'snap') {
      if (onOpenCreateStory) {
        onOpenCreateStory(locObj);
      } else if (showToast) {
        showToast(`📸 已选定地点「${approxAddr}」· 开启快拍拍摄`);
      }
    } else if (action === 'base') {
      setIsIconPickerOpen(true);
      if (showToast) {
        showToast("📍 请设置据点/标记名称与图标分类");
      }
    }
  };

  useEffect(() => {
    if (triggerPlaceMarker) {
      handleOpenMyMarkerPlacer();
      onResetTriggerPlaceMarker?.();
    }
  }, [triggerPlaceMarker]);

  const handleConfirmPinPlacement = () => {
    setIsPlacingPinMode(false);
    setIsIconPickerOpen(true);
  };

  const handleConfirmCreateMarker = (markerData: Omit<CustomMapMarker, "id" | "createdAt">) => {
    const newMarker: CustomMapMarker = {
      ...markerData,
      id: `cm-${Date.now()}`,
      createdAt: Date.now(),
      timeString: "刚刚",
    };
    setCustomMarkers((prev) => [newMarker, ...prev]);
    setIsIconPickerOpen(false);

    // Automatically enable 'life' layer if disabled so user sees their new marker immediately
    setLocalActiveMapFilters((prev) => {
      const current = Array.isArray(prev) ? prev : [prev];
      if (current.includes("all") || current.includes("life")) return current;
      return [...current, "life"];
    });

    setSelectedCustomMarker(newMarker);
    if (showToast) showToast(`✨ 已成功在【生活】图层创建「${newMarker.title}」标记！`);
  };

  const handleDeleteCustomMarker = (id: string) => {
    setCustomMarkers((prev) => prev.filter((m) => m.id !== id));
    setSelectedCustomMarker(null);
    if (showToast) showToast("已删除该自定义标记 🗑️");
  };

  const handleUpdateCustomMarker = (updated: CustomMapMarker) => {
    setCustomMarkers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSelectedCustomMarker(updated);
    if (showToast) showToast("已更新标记信息 ✨");
  };

  const handleFilterClick = (id: string) => {
    if (propOnChangeMapFilter) {
      propOnChangeMapFilter(id);
    } else {
      setLocalActiveMapFilters((prev) => {
        const current = Array.isArray(prev) ? prev : [prev];
        let base = current.includes('all') ? ['friends', 'activities', 'stars', 'family', 'life', 'groups', 'squads', 'schedules', 'places'] : current;
        
        if (id === "all") {
          const isAllOn = base.includes('friends') && base.includes('activities') && base.includes('stars') && base.includes('family') && base.includes('life') && base.includes('groups') && base.includes('squads') && base.includes('schedules') && base.includes('places');
          if (isAllOn) {
            return [];
          } else {
            return ['all', 'friends', 'activities', 'stars', 'family', 'life', 'groups', 'squads', 'schedules', 'places'];
          }
        }
        
        let next: string[];
        if (base.includes(id)) {
          next = base.filter((f) => f !== id);
        } else {
          next = [...base, id];
        }
        return next;
      });
    }
  };

  // DM sync on user avatar state
  const [incomingDm, setIncomingDm] = useState<{
    friendId: string;
    friendName: string;
    text: string;
  } | null>({
    friendId: "f1",
    friendName: "Sarah Chen (薛梦)",
    text: "咖啡买好了在广场等你，快来呀！☕",
  });
  const [isQuickReplyOpen, setIsQuickReplyOpen] = useState(false);
  const [quickReplyText, setQuickReplyText] = useState("");

  // Auto dismiss menus upon map slide / pan / click / interaction
  const handleMapInteraction = () => {
    setShowStyleMenu(false);
    setIsFabOpen(false);
    setIsWeatherExpanded(false);
    setIsZenlyExplorationOpen(false);
    setIsSosVisible(false);
  };

  // ADD: Bezier physical parabolic flying emojis state
  const [bezierFlyingEmojis, setBezierFlyingEmojis] = useState<{
    id: string;
    emoji: string;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    friendId: string;
  }[]>([]);

  const triggerBezierFlyingEmoji = (friendId: string, emoji: string = "💖") => {
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight - 90;
    const targetX = window.innerWidth / 2 + (Math.random() * 80 - 40);
    const targetY = window.innerHeight / 2 - 80 + (Math.random() * 40 - 20);

    const newId = `bezier-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setBezierFlyingEmojis((prev) => [
      ...prev,
      { id: newId, emoji, startX, startY, targetX, targetY, friendId },
    ]);
  };

  // ADD: Listen to custom events dispatched by the interactive enlarged map avatar buttons
  useEffect(() => {
    const handleChat = (e: any) => {
      const friendId = e.detail?.friendId;
      if (friendId && onOpenChatWith) {
        onOpenChatWith(friendId);
      }
    };
    const handleHeart = (e: any) => {
      const friendId = e.detail?.friendId;
      if (friendId) {
        triggerBezierFlyingEmoji(friendId, "💖");
        setTimeout(() => triggerBezierFlyingEmoji(friendId, "✨"), 120);
        setTimeout(() => triggerBezierFlyingEmoji(friendId, "💕"), 240);
        triggerFriendBubble(friendId, "💖", "给好友送上了一颗爱心~");
        if (showToast) showToast("已发射弧线爱心！物理 Bounce 降落在好友头像 💖");
      }
    };
    const handleNav = (e: any) => {
      const friend = e.detail?.friend;
      if (friend) {
        handleStartInMapNav(friend);
      }
    };
    const handleProfile = (e: any) => {
      const friend = e.detail?.friend;
      if (friend) {
        handleFriendMarkerClick(friend);
      }
    };

    window.addEventListener("stellar_open_chat", handleChat);
    window.addEventListener("stellar_send_heart", handleHeart);
    window.addEventListener("stellar_start_nav", handleNav);
    window.addEventListener("stellar_open_profile", handleProfile);

    return () => {
      window.removeEventListener("stellar_open_chat", handleChat);
      window.removeEventListener("stellar_send_heart", handleHeart);
      window.removeEventListener("stellar_start_nav", handleNav);
      window.removeEventListener("stellar_open_profile", handleProfile);
    };
  }, [friends, onOpenChatWith, showToast]);

  // Close weather & exploration cards on clicking outside or touching elsewhere
  useEffect(() => {
    if (!isWeatherExpanded && !isZenlyExplorationOpen) return;

    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const weatherBtn = document.getElementById("mini-weather-bar-btn");
      const zenlyBtn = document.getElementById("mini-exploration-bar-btn");

      const weatherContainer = weatherBtn?.closest(".relative");
      const zenlyContainer = zenlyBtn?.closest(".relative");

      if (weatherContainer && weatherContainer.contains(target)) return;
      if (zenlyContainer && zenlyContainer.contains(target)) return;

      setIsWeatherExpanded(false);
      setIsZenlyExplorationOpen(false);
    };

    const timer = setTimeout(() => {
      window.addEventListener("pointerdown", handlePointerDownOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", handlePointerDownOutside);
    };
  }, [isWeatherExpanded, isZenlyExplorationOpen]);

  const isAllActive = useMemo(() => {
    return activeFilters.includes("all") || (
      activeFilters.includes("groups") &&
      activeFilters.includes("friends") &&
      activeFilters.includes("family") &&
      activeFilters.includes("activities") &&
      activeFilters.includes("stars") &&
      activeFilters.includes("life")
    );
  }, [activeFilters]);

  // 浮动操作按钮子菜单：小组、朋友、家人、全部图层；生活、星片、活动
  // 支持多选、单选，点击时不关闭，进行其他操作时视为确定
  const upFabItems = useMemo(() => [
    {
      id: "groups",
      label: "小组",
      icon: Users,
      color: "bg-[#1877F2] hover:bg-[#166FE5]",
      shadow: "shadow-blue-500/30",
      active: isAllActive ? true : activeFilters.includes("groups"),
      onClick: () => {
        handleToggleFabLayer("groups");
      },
    },
    {
      id: "friends",
      label: "朋友",
      icon: Users,
      color: "bg-[#1877F2] hover:bg-[#166FE5]",
      shadow: "shadow-blue-500/30",
      active: isAllActive ? true : activeFilters.includes("friends"),
      onClick: () => {
        handleToggleFabLayer("friends");
      },
    },
    {
      id: "family",
      label: "家人",
      icon: ShieldCheck,
      color: "bg-[#10B981] hover:bg-[#059669]",
      shadow: "shadow-emerald-500/30",
      active: isAllActive ? true : activeFilters.includes("family"),
      onClick: () => {
        handleToggleFabLayer("family");
      },
    },
    {
      id: "all",
      label: "全部图层",
      icon: Layers,
      color: "bg-[#475569] hover:bg-[#334155]",
      shadow: "shadow-slate-500/30",
      active: isAllActive,
      onClick: () => {
        handleToggleFabLayer("all");
      },
    },
  ], [isAllActive, activeFilters, handleToggleFabLayer]);

  const leftFabItems = useMemo(() => [
    {
      id: "life",
      label: "生活",
      subLabel: "地图坐标 · 日程",
      icon: MapPin,
      color: "bg-[#1877F2] hover:bg-[#166FE5]",
      shadow: "shadow-blue-500/30",
      active: isAllActive ? true : (activeFilters.includes("life") || activeFilters.includes("places") || activeFilters.includes("schedules")),
      onClick: () => {
        handleToggleFabLayer("life");
      },
    },
    {
      id: "stars",
      label: "星片",
      subLabel: "打卡 · 发现",
      icon: Sparkles,
      color: "bg-[#F59E0B] hover:bg-[#D97706]",
      shadow: "shadow-amber-500/30",
      active: isAllActive ? true : activeFilters.includes("stars"),
      onClick: () => {
        handleToggleFabLayer("stars");
      },
    },
    {
      id: "activities",
      label: "活动",
      subLabel: "同城 · 集结",
      icon: Flame,
      color: "bg-[#F97316] hover:bg-[#EA580C]",
      shadow: "shadow-orange-500/30",
      active: isAllActive ? true : activeFilters.includes("activities"),
      onClick: () => {
        handleToggleFabLayer("activities");
        setIsActivityDrawerOpen(true);
      },
    },
  ], [isAllActive, activeFilters, handleToggleFabLayer]);

  // Spatial collision avoidance algorithm for MapView markers
  const dispersedData = useMemo(() => {
    const friendSpatial = effectiveFriends.filter(validCoordinates).map((friend) => ({
      id: `friend:${friend.id}`,
      lat: friend.lat,
      lng: friend.lng,
      radiusKm: 0.0028,
      isFixed: true,
      data: friend,
      isFriendItem: true,
    }));

    const activitySpatial = simulatedActivities.map((act) => ({
      id: act.id,
      lat: act.lat,
      lng: act.lng,
      radiusKm: 0.0035,
      data: act,
      isActivityItem: true,
    }));

    const starCardSpatial = (starCards || []).map((card) => ({
      id: card.id,
      lat: card.lat || 36.0610,
      lng: card.lng || 103.8340,
      radiusKm: 0.0035,
      data: card,
      isStarCardItem: true,
    }));

    const customMarkerSpatial = (customMarkers || []).map((m) => ({
      id: m.id,
      lat: m.lat,
      lng: m.lng,
      radiusKm: 0.0035,
      data: m,
      isCustomMarkerItem: true,
    }));

    const userSpatial = [
      {
        id: "user-me",
        lat: USER_LOCATION.lat,
        lng: USER_LOCATION.lng,
        radiusKm: 0.0028,
        isFixed: true,
      },
    ];

    const allDispersed = applyForceCollisionAvoidance(
      [...userSpatial, ...friendSpatial, ...activitySpatial, ...starCardSpatial, ...customMarkerSpatial],
      0.0028,
      12,
      zoomTier
    );

    const dispersedFriends = allDispersed
      .filter((d) => (d.item as any).isFriendItem)
      .map((d) => (d.item as any).data as Friend);

    const dispersedActivities = allDispersed
      .filter((d) => (d.item as any).isActivityItem)
      .map((d) => ({
        ...((d.item as any).data as SimulatedMapActivity),
        lat: d.dispersedLat,
        lng: d.dispersedLng,
      }));

    return { dispersedFriends, dispersedActivities };
  }, [effectiveFriends, simulatedActivities, starCards, customMarkers, USER_LOCATION.lat, USER_LOCATION.lng, detailLevel, zoomTier]);

  // Trigger temporary overhead emoji bubble animation on a friend's map marker
  const triggerFriendBubble = (friendId: string, emoji: string, text?: string) => {
    const newBubble = {
      id: `bubble-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      friendId,
      emoji,
      text,
    };
    setActiveFriendBubbles((prev) => [...prev, newBubble]);
    setBouncingFriendId(friendId);
    setTimeout(() => {
      setBouncingFriendId(null);
    }, 700);
    setTimeout(() => {
      setActiveFriendBubbles((prev) => prev.filter((b) => b.id !== newBubble.id));
    }, 2000);
  };

  // Handle single friend click with smooth map pan and directly open interactive card
  const handleFriendMarkerClick = (friend: Friend) => {
    setIsLifePanelOpen(false);
    setIsSosVisible(false);
    requestAnimationFrame(() => {
      setBouncingFriendId(friend.id);

      // Measure exact DOM location of friend marker on map
      const container = mapContainerRef.current;
      let rect: { x: number; y: number; width: number; height: number } | null = null;
      if (container) {
        const markerEl = container.querySelector(`[data-friend-id="${friend.id}"]`) || document.querySelector(`[data-friend-id="${friend.id}"]`);
        if (markerEl) {
          const elRect = markerEl.getBoundingClientRect();
          const cRect = container.getBoundingClientRect();
          rect = {
            x: elRect.left - cRect.left,
            y: elRect.top - cRect.top,
            width: elRect.width || 48,
            height: elRect.height || 48,
          };
        }
      }
      setSelectedFriendSourceRect(rect);
      setSelectedParticipantActivityContext(null);
      setSelectedFriend(friend);

      if (typeof friend.lat === 'number' && typeof friend.lng === 'number') {
        // Smoothly center the map view directly on friend's exact geographic location (dead center of map)
        setMapCenter({ lat: friend.lat, lng: friend.lng });
        setQuickFlyToLocation({ lat: friend.lat, lng: friend.lng, zoom: 16.2, timestamp: Date.now() });
      }
      setTimeout(() => {
        setBouncingFriendId(null);
      }, 700);
    });
  };

  // Handle clicking a participant from an activity (on map or inside activity card)
  const handleSelectActivityParticipant = useCallback((activity: SimulatedMapActivity, participant: ActivityParticipantStatus) => {
    if (participant.isLocationAuthorized === false) {
      showToast?.('这位伙伴尚未开启本次活动的位置共享');
      return;
    }
    // Look up matching friend by ID or name
    const matchingFriend = friends.find((f) => f.id === participant.id || f.name === participant.name);

    const participantAsFriend: Friend = {
      id: participant.id,
      name: participant.name,
      avatar: participant.avatar,
      status: participant.statusText || '参与活动中',
      locationName: matchingFriend?.locationName || activity.locationName || '赶往活动集合点',
      lat: participant.currentLat ?? matchingFriend?.lat ?? activity.lat,
      lng: participant.currentLng ?? matchingFriend?.lng ?? activity.lng,
      x: matchingFriend?.x || 50,
      y: matchingFriend?.y || 50,
      distance: participant.distanceText || matchingFriend?.distance || '1.2km',
      battery: participant.batteryLevel ?? matchingFriend?.battery ?? 88,
      lastUpdated: '刚刚',
      isOnline: true,
      relationship: participant.relationship || matchingFriend?.relationship || 'normal',
      speed: participant.speedKmh ? `${participant.speedKmh} km/h` : matchingFriend?.speed || '40 km/h',
      transportMode: participant.transport || (matchingFriend?.transportMode as any) || 'car',
      teamRole: participant.groupRole === 'admin' ? '活动管理员' : participant.groupRole === 'core' ? '核心成员' : '活动成员',
    };

    setSelectedParticipantActivityContext({ activity, participant });
    setSelectedFriend(participantAsFriend);
    setSelectedFriendSourceRect(null);
    setSelectedActivity(null);
    if (showToast) {
      showToast(`已开启「${participant.name}」在【${activity.title.split('·')[0]}】中的活动管理控制台 🎯`);
    }
  }, [friends, setSelectedFriend, setSelectedActivity, showToast]);

  // Open system navigation
  const handleLaunchNavigation = (
    friend: Friend,
    appType: "google" | "apple" | "amap" | "baidu" = "google",
  ) => {
    // buildNavigationUrl 内部按目标平台转换坐标系：
    // 高德需要 GCJ-02、百度需要 BD-09；直接传 WGS-84 会偏移 200~550 米。
    const url = buildNavigationUrl(appType, {
      from: { lat: USER_LOCATION.lat, lng: USER_LOCATION.lng },
      to: { lat: friend.lat, lng: friend.lng },
      label: friend.locationName || friend.name,
      mode: "walk",
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const startNavigation = (target:NavigationDestination, mode:'walking'|'cycling'|'driving'='walking') => {
    setSelectedFriend(null); setSelectedActivity(null); setSelectedCustomMarker(null);
    setSelectedLifePlaceForMemoryCard(null); setSelectedLifePlaceForNameplate(null);
    setQuickFlyToLocation(null); setIncomingDm(null); setIsLifePanelOpen(false);
    navigation.start(target,mode);
  };
  const handleStartInMapNav = (friend: Friend) => {
    startNavigation({lat:friend.lat,lng:friend.lng,name:friend.name,friend});
  };
  const clearNavigation = () => {
    navigation.clear(); 
  };

  const isLifeLayer = activeLayer === 'life' || activeLayer === 'places';
  const isStarsLayer = activeLayer === 'stars' || starsOnly;
  const isActivitiesLayer = activeLayer === 'activities';

  const objectLayer = isActivitiesLayer || activeLayer === 'schedules' || isLifeLayer || isStarsLayer;
  const showObjectQuickBar = objectLayer && !selectedFriend && !selectedActivity && !selectedCustomMarker && !selectedStarCard && !selectedLifePlaceForMemoryCard && !navigation.target && !isPlacingPinMode && isQuickFriendsBarVisible && !isFabOpen && !isPinRadialMenuOpen && !isIconPickerOpen && !activeFilters.includes('all');
  const quickSchedules = schedules.filter(item => !isCancelledSchedule(item) && (hasActiveFlight(item) || schedulePhase(item, lifeNow) !== 'ended'));
  const quickItemCount = isActivitiesLayer
    ? allActivities.length
    : activeLayer === 'schedules'
    ? quickSchedules.length
    : isStarsLayer
    ? starCards.length
    : isLifeLayer
    ? (customMarkers.length + filteredLifePlaces.filter(place => lifeIntentFilter === 'all' || placeIntent(place) === lifeIntentFilter).length) + quickSchedules.length
    : customMarkers.length + filteredLifePlaces.length;

  const quickLayerLabel = isActivitiesLayer
    ? '活动'
    : activeLayer === 'schedules'
    ? '日程'
    : isStarsLayer
    ? '星片'
    : isLifeLayer
    ? '生活（坐标·日程）'
    : '地点';
  const quickActivityIcon = allActivities.find(item => item.id === focusedQuickItemId)?.icon || allActivities[0]?.icon;

  return (
    <div
      ref={mapContainerRef}
      className={`stellar-layer-map relative w-full h-full bg-[#E5E7EB] overflow-hidden select-none ${selectedFriend ? "bump-map-focused" : ""}`}
      data-object-quickbar={showObjectQuickBar ? (activeLayer === 'places' ? 'compact' : 'photo') : undefined}
      onWheel={() => handleMapInteraction()}
    >
      {isLifePanelOpen && !selectedFriend && <LifeMapPanel
        owner={{name:currentUserName || '我',avatar:userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',note:userNote,emoji:attachedEmoji}}
        onEditStatus={() => { setIsLifePanelOpen(false); onEditUserStatus?.(); }}
        onOpenHistory={() => { setIsLifePanelOpen(false); setIsHistoryModalOpen(true); }}
        onClearRoute={navigation.target ? clearNavigation : undefined}
        schedules={schedules} places={lifePlaces} navigationTarget={navigation.target} navigationMode={navigation.mode}
        onClose={() => setIsLifePanelOpen(false)}
        onPlaceFilter={setLifeIntentFilter}
        onTabChange={(tab) => handleSelectLayer(tab === 'places' ? 'places' : 'schedules')}
        onLocate={(lat,lng,name,scheduleId) => { setSelectedFriend(null); setSelectedActivity(null); setSelectedLifePlaceForMemoryCard(null); setSelectedLifePlaceForNameplate(null); setFocusedScheduleId(scheduleId || null); handleSelectLayer(scheduleId ? 'schedules' : 'places'); setMapCenter({lat,lng}); setQuickFlyToLocation({lat,lng,zoom:16,timestamp:Date.now()}); }}
        onCreatePlace={() => { setIsLifePanelOpen(false); setCreateLifePlaceState({isOpen:true,initialLocation:{...mapCenter}}); }}
        onEditPlace={(place) => { setIsLifePanelOpen(false); setCreateLifePlaceState({isOpen:true,editPlace:place}); }}
        onCreateSchedule={(place,date) => { setIsLifePanelOpen(false); onOpenScheduleCreation?.(place ? {name:place.name,lat:place.lat,lng:place.lng,address:place.note} : undefined,date); }}
        onCreateActivity={(place) => { setIsLifePanelOpen(false); onOpenActivityCreation?.({name:place.name,lat:place.lat,lng:place.lng,address:place.note}); }}
        onSelectSchedule={(schedule) => { setIsLifePanelOpen(false); onSelectSchedule?.(schedule); }}
        onUpdateSchedule={(schedule) => onUpdateSchedule?.(schedule)}
        route={lifeRoute} routing={navigation.status === 'loading'} routeError={navigation.error}
        onStartRoute={(target,mode) => {setQuickFlyToLocation(null);setFocusedScheduleId(target.schedule?.id || null);navigation.start(target,mode);}}
        onTravelModeChange={navigation.setMode} onRetryRoute={navigation.retry}
        onShowRoute={() => {setQuickFlyToLocation(null);navigation.showOverview();}}
        onToast={(text) => showToast?.(text)}
      />}
      {(
        /* Real Slippy Map Layer (Interactive Pan/Zoom, Dark Mode, Minimal Lines & Standard) */
        <div className="relative w-full h-full bg-[#E5E9EE] dark:bg-[#18191A] overflow-hidden">
          <WeatherParticleBackground condition={activeWeather.condition} />

          {/* 地图初始化全景骨架屏与信标网格占位符 (改善初次加载与切换视觉突兀感) */}
          <MapSkeletonPlaceholder isLoading={isLeafletMapLoading} mapStyle={mapStyle} />

          <Suspense fallback={<MapSkeletonPlaceholder isLoading={true} mapStyle={mapStyle} />}>
            <LazySlippyLeafletMap
              userLocation={navigationOrigin}
              friends={effectiveFriends}
              conversations={conversations}
              liveLocationShares={liveLocationShares}
              onRemoveLiveLocationShare={onRemoveLiveLocationShare}
              simulatedActivities={allActivities}
              selectedActivityId={selectedActivity?.id ?? (activeLayer === 'activities' ? focusedQuickItemId : null)}
              starCards={starCards}
              customMarkers={customMarkers}
              selectedCustomMarkerId={selectedCustomMarker?.id || null}
              onMapLongPress={handleMapLongPress}
              droppedPinCoord={(isIconPickerOpen || isPinRadialMenuOpen) ? longPressPinCoord : null}
              droppedPinAddress={longPressPinCoord ? getApproxAddressForCoord(longPressPinCoord.lat, longPressPinCoord.lng) : undefined}
              onSelectCustomMarker={(marker) => {
                setSelectedCustomMarker(marker);
                setSelectedFriend(null);
                setSelectedActivity(null);
                setSelectedStarCard(null);
              }}
              onLongPressCustomMarker={(marker, pos) => {
                setContextMenuMarker(marker);
                setContextMenuPos(pos || null);
              }}
              onSelectActivity={(act) => {
                setSelectedActivity(act);
                setSelectedFriend(null);
                setSelectedStarCard(null);
                setSelectedCustomMarker(null);
              }}
              onSelectActivityParticipant={handleSelectActivityParticipant}
              onSelectStarCard={(card) => {
                setSelectedStarCard(card);
                setSelectedFriend(null);
                setSelectedActivity(null);
                setSelectedCustomMarker(null);
              }}
              activeMapFilter={activeFilters}
              mapStyle={mapStyle}
              onSelectFriend={(f) => {
                handleFriendMarkerClick(f);
                setSelectedCustomMarker(null);
              }}
              onMapInteraction={handleMapInteraction}
              onViewportChanged={handleViewportChanged}
              trafficEnabled={trafficEnabled}
              userNote={userNote}
              attachedEmoji={attachedEmoji}
              noteTheme={noteTheme}
              userAvatar={userAvatar}
              isStealthMode={isStealthMode}
              navState={inMapNavState}
              selectedFriendId={selectedFriend?.id || null}
              hideAllFriendMarkers={false}
              bouncingFriendId={bouncingFriendId}
              activeFriendBubbles={activeFriendBubbles}
              beaconPoints={beacons}
              onSelectBeacon={(beacon) => setSelectedBeacon(beacon)}
              flyToLocation={quickFlyToLocation}
              isFabOpen={isFabOpen}
              activeLayer={activeLayer}
              isQuickFriendsBarVisible={isQuickFriendsBarVisible && !selectedFriend}
              onToggleQuickFriendsBar={handleToggleQuickFriendsBar}
              schedules={visibleSchedules}
              lifeRoute={lifeRoute}
              onSelectSchedule={onSelectSchedule}
              onOpenUserTransportCard={() => {
                setSelectedFriend(null); setSelectedActivity(null);
                 setIsLifePanelOpen(true);
              }}
              isHistoryReplayActive={isHistoryModalOpen}
              historyTrajectoryPoints={MOCK_24H_TRAJECTORY_POINTS}
              historyFriendTrajectories={MOCK_FRIEND_TRAJECTORIES}
              historySelectedTimeHour={historySelectedTimeHour}
              showFriendTrajectories={showFriendTrajectoriesInMap}
              activeFriendTrajectoryPoints={activeFriendTrajectoryPoints}
              activeFriendTrajectoryTimeHour={friendTrajectoryTimeHour}
              activeFriendTrajectoryFriend={activeFriendForTrajectory}
              onMapReady={() => {
                setTimeout(() => {
                  setIsLeafletMapLoading(false);
                }, 200);
              }}
              lifePlaces={filteredLifePlaces.filter(place => lifeIntentFilter === 'all' || placeIntent(place) === lifeIntentFilter)}
              selectedLifePlaceId={selectedLifePlaceForNameplate?.id || selectedLifePlaceForMemoryCard?.id || null}
              onSelectLifePlace={handleSelectLifePlaceFromMap}
              isLifeLayerActive={activeFilters.includes('life_layer') || activeFilters.includes('places') || activeFilters.includes('all')}
              selectedTargetCoord={
                (selectedLifePlaceForNameplate ? { lat: selectedLifePlaceForNameplate.lat, lng: selectedLifePlaceForNameplate.lng } : null) ||
                (selectedLifePlaceForMemoryCard ? { lat: selectedLifePlaceForMemoryCard.lat, lng: selectedLifePlaceForMemoryCard.lng } : null) ||
                (selectedActivity ? { lat: selectedActivity.lat, lng: selectedActivity.lng } : null) ||
                (selectedCustomMarker ? { lat: selectedCustomMarker.lat, lng: selectedCustomMarker.lng } : null) ||
                (selectedBeacon ? { lat: selectedBeacon.lat, lng: selectedBeacon.lng } : null) ||
                (selectedStarCard && typeof selectedStarCard.lat === 'number' && typeof selectedStarCard.lng === 'number' ? { lat: selectedStarCard.lat, lng: selectedStarCard.lng } : null) ||
                ((isIconPickerOpen || isPinRadialMenuOpen) && longPressPinCoord ? longPressPinCoord : null)
              }
              selectedTargetName={
                selectedLifePlaceForNameplate?.name ||
                selectedLifePlaceForMemoryCard?.name ||
                selectedActivity?.title ||
                selectedCustomMarker?.title ||
                selectedBeacon?.classroomName ||
                selectedStarCard?.title ||
                null
              }
            />
          </Suspense>

          {/* Floating Place Nameplate (Directly Above Selected Life Layer Pin) */}
          {selectedLifePlaceForNameplate && (
            <FloatingPlaceNameplate
              place={selectedLifePlaceForNameplate}
              position={nameplatePosition}
              onOpenCard={(place) => {
                setSelectedLifePlaceForNameplate(null);
                setSelectedLifePlaceForMemoryCard(place);
              }}
              onClose={() => setSelectedLifePlaceForNameplate(null)}
            />
          )}

          {/* Place-Memory Card Bottom Sheet Drawer */}
          {selectedLifePlaceForMemoryCard && (
            <PlaceMemoryCard
              place={selectedLifePlaceForMemoryCard}
              onClose={() => setSelectedLifePlaceForMemoryCard(null)}
              onNavigate={(place) => {
                startNavigation({lat:place.lat,lng:place.lng,name:place.name});
              }}
              onForward={(place) => {
                if (onShareLifePlace) {
                  onShareLifePlace(place);
                } else {
                  setForwardModalPlace(place);
                }
              }}
              onShareLifePlace={(place) => {
                if (onShareLifePlace) {
                  onShareLifePlace(place);
                } else {
                  setForwardModalPlace(place);
                }
              }}
              onPlanMeetup={(place) => {
                setSelectedLifePlaceForMemoryCard(null);
                onOpenActivityCreation?.({
                  name: place.name,
                  address: place.direction || '兰州市',
                  lat: place.lat,
                  lng: place.lng,
                });
              }}
              onEditPlace={(place) => {
                setCreateLifePlaceState({
                  isOpen: true,
                  editPlace: place,
                });
              }}
              showToast={showToast}
            />
          )}

          {/* Place Forward / Share Sheet Modal */}
          {forwardModalPlace && (
            <PlaceForwardModal
              place={forwardModalPlace}
              friends={friends}
              onClose={() => setForwardModalPlace(null)}
              onForwardComplete={(targets) => {
                if (onSendMessage) {
                  targets.forEach((t) => {
                    onSendMessage(t.userId, `[生活坐标 📍] ${forwardModalPlace.name}`, {
                      type: 'life_place',
                      lifePlaceData: forwardModalPlace,
                      locationData: {
                        name: forwardModalPlace.name,
                        address: forwardModalPlace.direction || '兰州市城关区',
                        lat: forwardModalPlace.lat,
                        lng: forwardModalPlace.lng,
                      },
                    });
                  });
                }
              }}
              showToast={showToast}
            />
          )}

          {/* Create & Edit Life Place Modal */}
          {createLifePlaceState.isOpen && (
            <CreateLifePlaceModal
              initialLocation={createLifePlaceState.initialLocation}
              editPlace={createLifePlaceState.editPlace}
              onClose={() => setCreateLifePlaceState({ isOpen: false })}
              onCreated={(newPlace) => {
                setSelectedLifePlaceForNameplate(newPlace);
                setMapCenter({ lat: newPlace.lat, lng: newPlace.lng });
                setQuickFlyToLocation({ lat: newPlace.lat, lng: newPlace.lng, zoom: 16, timestamp: Date.now() });
              }}
              showToast={showToast}
            />
          )}

          {/* 24-Hour Location History & Trajectory Replay & User Profile Modal */}
          <User24hHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            userName="Alexia"
            userAvatar={userAvatar}
            userNote={userNote}
            userBattery={98}
            isBatteryCharging={true}
            isStealthMode={isStealthMode}
            onToggleStealth={onToggleStealth}
            trajectoryPoints={MOCK_24H_TRAJECTORY_POINTS}
            friendTrajectories={MOCK_FRIEND_TRAJECTORIES}
            selectedTimeHour={historySelectedTimeHour}
            onTimeHourChange={(hour) => setHistorySelectedTimeHour(hour)}
            isPlaying={isHistoryPlaying}
            onTogglePlay={() => setIsHistoryPlaying((prev) => !prev)}
            playbackSpeed={historyPlaybackSpeed}
            onChangePlaybackSpeed={(speed) => setHistoryPlaybackSpeed(speed)}
            showFriendTrajectories={showFriendTrajectoriesInMap}
            onToggleShowFriends={() => setShowFriendTrajectoriesInMap((prev) => !prev)}
            onShareInstantLocation={(loc) => {
              if (onShareLocation) {
                onShareLocation(loc);
              }
            }}
            onShareFrequentPlace={(place) => {
              if (onShareLocation) {
                onShareLocation({
                  name: place.name,
                  address: place.address,
                  lat: place.lat,
                  lng: place.lng,
                  isLive: false,
                  frequencyTag: place.frequencyTag,
                });
              }
            }}
            onFlyToLocation={(loc) => {
              setMapCenter({
                lat: loc.lat - 0.0075,
                lng: loc.lng,
              });
              if (showToast) {
                showToast(`已在地图上锁定【${loc.name || '目标地点'}】📍`);
              }
            }}
          />

          {/* ADD: Lover and Relationship Features Overlay (Batch 1-6) */}
          <LoverAndRelationshipOverlay
            friends={friends}
            userLat={mapCenter.lat}
            userLng={mapCenter.lng}
            isStealthMode={isStealthMode}
            beacons={beacons}
            customMarkers={customMarkers}
            showToast={showToast}
            onSelectFriend={(f) => handleFriendMarkerClick(f)}
          />

          {/* Real-time Weather Map Visual Effect Overlay */}
          <MapWeatherEffectOverlay
            condition={activeWeather.condition}
            enabled={isWeatherEffectEnabled}
            manualWeatherOverride={manualWeatherEffect}
            mapStyle={mapStyle}
            isDarkMode={mapStyle === 'dark'}
          />
        </div>
      )}

      {/* Header weather portal and the original Settings exploration panel. */}
      <div className={`stellar-map-info absolute z-40 flex items-start justify-between select-none pointer-events-none gap-2 ${selectedFriend ? 'hidden' : ''}`}>
        {/* Weather moves into the header; its existing detail actions remain. */}
        {weatherHost && createPortal(<div className="stellar-home-weather relative pointer-events-auto w-full" hidden={Boolean(selectedFriend)}>
          <div className="stellar-map-info-surface w-full bg-white border border-[#E4E6EB] shadow-2xs hover:border-[#1877F2] rounded-full overflow-hidden flex flex-col transition-all duration-200 relative">
            {/* Bar Header Button: 固定范围更详细的天气日历展示 */}
            <button
              id="mini-weather-bar-btn"
              aria-expanded={isWeatherExpanded}
              aria-controls="stellar-weather-details"
              onClick={() => {
                setIsWeatherExpanded((prev) => !prev);
                if (!isWeatherExpanded) setIsZenlyExplorationOpen(false);
              }}
              className="h-11 w-full px-3.5 flex items-center justify-between text-[#050505] bg-white transition-all hover:bg-[#F0F2F5]/60 active:scale-98 cursor-pointer relative z-10 group rounded-full"
              aria-label={`查看${activeWeather.locationName}天气，${activeWeather.temp}，${activeWeather.condition}，空气质量${activeWeather.aqi}`}
              title="查看详细天气"
            >
              <div className="stellar-weather-summary">
                <span className="stellar-weather-icon" aria-hidden="true">{activeWeather.emoji}</span>
                <span className="stellar-weather-copy">
                  <strong>{activeWeather.temp}</strong>
                  <span>{activeWeather.locationName.split('市')[0].split('·')[0]}</span>
                </span>
              </div>
              <span className="stellar-weather-date">
                <strong>{new Date(lifeNow).getMonth() + 1}/{new Date(lifeNow).getDate()}</strong>
                <span>{new Date(lifeNow).toLocaleDateString('zh-CN', { weekday: 'short' })}</span>
              </span>
            </button>

            {/* 展开后从竖向卡片变为横向卡片 */}
            {isWeatherExpanded && (
              <div id="stellar-weather-details" className="stellar-map-info-details relative z-20 p-3.5 bg-white dark:bg-[#18191a] border border-[#E4E6EB] dark:border-zinc-800 rounded-2xl shadow-2xl text-xs text-[#050505] dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
                {/* 动态玻璃气象微光效 */}
                <WeatherGlassEffectOverlay condition={activeWeather.condition} isDarkMode={mapStyle === 'dark'} />

                {/* 顶部元数据栏：地点定位、日期、API实时状态与收起按钮 */}
                <div className="stellar-weather-detail-heading relative z-10 flex items-center justify-between border-b border-[#E4E6EB] dark:border-zinc-800 pb-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#1877F2] flex items-center space-x-1 font-bold text-[12px]">
                      <MapPin size={13} />
                      <span>{activeWeather.locationName}</span>
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-200/80 dark:border-emerald-800 font-bold">
                      {activeWeather.condition}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium hidden sm:inline">
                      📅 {new Date().getMonth() + 1}月{new Date().getDate()}日 {['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][new Date().getDay()]}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-950/40 text-[#1877F2] border border-blue-200/60 dark:border-blue-900/40 rounded px-1.5 py-0.5 font-bold text-[9.5px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span>{isLiveApiLoading ? "获取最新API..." : "Open-Meteo 实时气象"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsWeatherExpanded(false);
                      }}
                      className="w-11 h-11 shrink-0 flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
                      aria-label="收起天气详情"
                      title="收起天气详情"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* 主体横向三栏布局 (从竖向变为横向卡片) */}
                <div className="stellar-weather-detail-grid relative z-10 grid gap-3">
                  
                  {/* 第 1 栏 (左)：实时温度与空气质量概览 */}
                  <div className="flex flex-col justify-between space-y-2.5 p-3 bg-[#F0F2F5]/60 dark:bg-zinc-800/40 rounded-md border border-[#E4E6EB] dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                          {activeWeather.temp}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                          体感温 {activeWeather.temp} · 温差 14°C ~ 24°C
                        </div>
                      </div>
                      <span className="text-4xl select-none drop-shadow-xs">{activeWeather.emoji}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#E4E6EB] dark:border-zinc-700/60">
                      <span className="text-gray-600 dark:text-zinc-300 font-semibold">空气质量 (AQI)</span>
                      <span className="font-bold text-emerald-600 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
                        {activeWeather.aqi} · {activeWeather.aqiText}
                      </span>
                    </div>

                    <div className="text-[9.5px] text-gray-500 leading-relaxed bg-white/80 dark:bg-zinc-900/80 p-2 rounded border border-[#E4E6EB] dark:border-zinc-700/50">
                      💡 今日整体体感舒适，空气优良，适宜户外出行与同城活动集结。
                    </div>
                  </div>

                  {/* 第 2 栏 (中)：多维气象指标与穿衣生活指南 */}
                  <div className="flex flex-col space-y-2">
                    {/* 4格气象网格 */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className="bg-[#F0F2F5]/70 dark:bg-zinc-800/40 p-2 rounded-md border border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-gray-500">💨 风向风力</span>
                        <span className="font-bold text-gray-900 dark:text-zinc-100 truncate">{activeWeather.wind}</span>
                      </div>
                      <div className="bg-[#F0F2F5]/70 dark:bg-zinc-800/40 p-2 rounded-md border border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-gray-500">💧 空气湿度</span>
                        <span className="font-bold text-blue-600">{activeWeather.humidity}</span>
                      </div>
                      <div className="bg-[#F0F2F5]/70 dark:bg-zinc-800/40 p-2 rounded-md border border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-gray-500">☀️ 紫外线</span>
                        <span className="font-bold text-amber-600">{activeWeather.uvIndex}</span>
                      </div>
                      <div className="bg-[#F0F2F5]/70 dark:bg-zinc-800/40 p-2 rounded-md border border-[#E4E6EB] dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-gray-500">🌧️ 降水概率</span>
                        <span className="font-bold text-indigo-600">5% 无雨</span>
                      </div>
                    </div>

                    {/* 穿衣建议组件 */}
                    <div className="flex-1">
                      <ClothingAdviceIllustration
                        tempStr={activeWeather.temp}
                        adviceText={activeWeather.dressingStyle || activeWeather.tips}
                      />
                    </div>
                  </div>

                  {/* 第 3 栏 (右)：未来分时走势横向预报 */}
                  <div className="flex flex-col justify-between p-2.5 bg-[#F0F2F5]/40 dark:bg-zinc-800/30 rounded-md border border-[#E4E6EB] dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-600 dark:text-zinc-300 flex items-center space-x-1">
                        <Clock size={11} className="text-[#1877F2]" />
                        <span>分时微气象预报</span>
                      </span>
                      <span className="text-[9px] text-gray-400">未来12小时走势</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="bg-white dark:bg-zinc-800/80 p-1.5 rounded-md border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs">
                        <span className="text-[8.5px] text-gray-400 block font-medium">现在</span>
                        <span className="text-sm block my-0.5">{activeWeather.emoji}</span>
                        <span className="text-[9.5px] font-bold text-gray-900 dark:text-white block">{activeWeather.temp}</span>
                        <span className="text-[8px] text-emerald-600 block">适宜</span>
                      </div>
                      <div className="bg-white dark:bg-zinc-800/80 p-1.5 rounded-md border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs">
                        <span className="text-[8.5px] text-gray-400 block font-medium">14:00</span>
                        <span className="text-sm block my-0.5">🌤️</span>
                        <span className="text-[9.5px] font-bold text-gray-900 dark:text-white block">{parseInt(activeWeather.temp) + 1}°C</span>
                        <span className="text-[8px] text-amber-600 block">转暖</span>
                      </div>
                      <div className="bg-white dark:bg-zinc-800/80 p-1.5 rounded-md border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs">
                        <span className="text-[8.5px] text-gray-400 block font-medium">17:00</span>
                        <span className="text-sm block my-0.5">⛅</span>
                        <span className="text-[9.5px] font-bold text-gray-900 dark:text-white block">{activeWeather.temp}</span>
                        <span className="text-[8px] text-blue-600 block">微风</span>
                      </div>
                      <div className="bg-white dark:bg-zinc-800/80 p-1.5 rounded-md border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs">
                        <span className="text-[8.5px] text-gray-400 block font-medium">20:00</span>
                        <span className="text-sm block my-0.5">🌙</span>
                        <span className="text-[9.5px] font-bold text-gray-900 dark:text-white block">{parseInt(activeWeather.temp) - 3}°C</span>
                        <span className="text-[8px] text-indigo-600 block">转凉</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#E4E6EB] dark:border-zinc-700/60 flex items-center justify-between text-[9px] text-gray-500">
                      <span>降水强度：微量</span>
                      <span className="text-[#1877F2] font-semibold">日落 19:42 🌅</span>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>, weatherHost)}

        {/* Exploration remains available from Settings instead of a home capsule. */}
        {isZenlyExplorationOpen && <div className="stellar-home-exploration relative flex flex-col items-end pointer-events-auto shrink-0">
          <div className={`stellar-map-info-surface ${isZenlyExplorationOpen ? 'w-[240px] sm:w-[270px] bg-white/95 border border-[#E4E6EB] shadow-2xl rounded-2xl' : isWeatherExpanded ? 'w-[52px] sm:w-[58px] h-[22px] bg-white/40 border border-white/60 shadow-xs rounded-full' : 'w-auto max-w-fit h-[22px] bg-white/40 hover:bg-white/60 border border-white/60 shadow-xs rounded-full'} backdrop-blur-md overflow-hidden flex flex-col transition-all duration-300 z-50`}>
            {/* Bar Header Button */}
            <button
              id="mini-exploration-bar-btn"
              aria-expanded={isZenlyExplorationOpen}
              aria-controls="stellar-exploration-details"
              onClick={() => {
                setIsZenlyExplorationOpen((prev) => !prev);
                if (!isZenlyExplorationOpen) setIsWeatherExpanded(false);
              }}
              className="h-[22px] w-full px-2 flex items-center justify-between text-[#050505] transition-all hover:bg-white/30 active:scale-98 cursor-pointer relative z-10"
              title="点击展开世界探索度与足迹点亮"
            >
              {isWeatherExpanded ? (
                /* Compact Icon State when Weather is Expanded */
                <div className="flex items-center justify-center space-x-1 w-full h-full">
                  <Footprints size={9.5} className="text-[#050505] shrink-0" />
                  <span className="text-[8.5px] font-black text-[#050505] leading-none">22.4%</span>
                </div>
              ) : (
                /* Collapsed Normal State matching Weather Bar with identical height and layout */
                <>
                  <div className="flex items-center space-x-1 flex-1 min-w-0 justify-center h-full">
                    <Footprints size={9.5} className="text-[#050505] shrink-0" />
                    <span className="text-[8.5px] font-bold text-[#050505] shrink-0 whitespace-nowrap">
                      探索
                    </span>
                    <span className="text-[8.5px] font-black text-[#050505] shrink-0 leading-none">
                      22.4%
                    </span>
                  </div>
                  <span
                    className="text-[6.5px] text-gray-500 transform transition-transform duration-200 shrink-0 ml-1 leading-none"
                    style={{ transform: isZenlyExplorationOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    ▶
                  </span>
                </>
              )}
            </button>

            {/* Expanded White Card with Thin Line Borders & Translucent Sections */}
            {isZenlyExplorationOpen && (
              <div id="stellar-exploration-details" className="stellar-map-info-details px-3 py-2.5 bg-white border-t border-[#E4E6EB] flex flex-col space-y-2 text-xs text-gray-900 animate-in fade-in zoom-in-95 duration-200 max-h-[calc(100vh-140px)] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between text-[10px] font-bold border-b border-[#E4E6EB] pb-1.5">
                  <span className="text-[#1877F2] flex items-center space-x-1 font-black">
                    <Footprints size={11} />
                    <span>兰州城市足迹探索</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {/* 城市探索开关 Toggle Switch */}
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold text-gray-500">
                        {isCityExplorationActive ? '已开启' : '已暂停'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCityExplorationActive((prev) => {
                            const next = !prev;
                            showToast?.(next ? '🗺️ 城市足迹探索记录已开启' : '⏸️ 城市足迹探索记录已暂停');
                            return next;
                          });
                        }}
                        className={`w-7 h-4 rounded-full transition-colors relative p-0.5 cursor-pointer flex items-center ${
                          isCityExplorationActive ? 'bg-[#1877F2]' : 'bg-gray-300'
                        }`}
                        title="城市探索开关"
                        aria-label="城市探索开关"
                      >
                        <span
                          className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform duration-200 block ${
                            isCityExplorationActive ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsZenlyExplorationOpen(false);
                      }}
                      className="text-gray-400 hover:text-gray-700 p-0.5 rounded cursor-pointer transition-colors ml-0.5"
                      title="收起"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                {/* Enlarged Progress & Highlight */}
                <div className="flex flex-col space-y-1.5 bg-[#F0F2F5]/90 p-2 rounded-xl border border-[#E4E6EB]">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-2xl font-black text-gray-900 tracking-tighter">22.4%</span>
                      <span className="text-[10px] text-gray-600 font-bold">38 / 170 街区</span>
                    </div>
                    <span className="text-2xl select-none">🗺️</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200/80 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1877F2] to-cyan-500 rounded-full" style={{ width: '22.4%' }}></div>
                  </div>
                </div>

                {/* Compact Stats Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[9.5px]">
                  <div className="bg-[#F0F2F5]/80 p-1.5 rounded-lg border border-[#E4E6EB] flex items-center justify-between">
                    <span className="text-gray-500">今日点亮</span>
                    <span className="font-bold text-emerald-700">+2 处地块</span>
                  </div>
                  <div className="bg-[#F0F2F5]/80 p-1.5 rounded-lg border border-[#E4E6EB] flex items-center justify-between">
                    <span className="text-gray-500">累计打卡</span>
                    <span className="font-bold text-blue-700">128 次</span>
                  </div>
                  <div className="bg-[#F0F2F5]/80 p-1.5 rounded-lg border border-[#E4E6EB] flex items-center justify-between">
                    <span className="text-gray-500">常驻地块</span>
                    <span className="font-bold text-gray-900 truncate max-w-[65px]">东方红广场</span>
                  </div>
                  <div className="bg-[#F0F2F5]/80 p-1.5 rounded-lg border border-[#E4E6EB] flex items-center justify-between">
                    <span className="text-gray-500">探索勋章</span>
                    <span className="font-bold text-amber-700">漫步达人 ⭐</span>
                  </div>
                </div>

                {/* Unlocked Zones Micro Grid */}
                <div className="flex flex-col pt-0.5">
                  <span className="text-[9.5px] font-bold text-gray-500 mb-1">热门点亮地标</span>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div className="bg-[#F0F2F5]/80 p-1 rounded border border-[#E4E6EB]">
                      <span className="text-[8px] text-gray-400 block">打卡14次</span>
                      <span className="text-[11px] block">🌉</span>
                      <span className="text-[9px] font-bold text-gray-900 truncate block">中山铁桥</span>
                    </div>
                    <div className="bg-[#F0F2F5]/80 p-1 rounded border border-[#E4E6EB]">
                      <span className="text-[8px] text-gray-400 block">打卡8次</span>
                      <span className="text-[11px] block">🍜</span>
                      <span className="text-[9px] font-bold text-gray-900 truncate block">大众巷</span>
                    </div>
                    <div className="bg-[#F0F2F5]/80 p-1 rounded border border-[#E4E6EB]">
                      <span className="text-[8px] text-gray-400 block">打卡6次</span>
                      <span className="text-[11px] block">⛰️</span>
                      <span className="text-[9px] font-bold text-gray-900 truncate block">白塔山</span>
                    </div>
                  </div>
                </div>

                {/* Action button inside card */}
                <button
                  type="button"
                  onClick={() => {
                    if (showToast) {
                      showToast("已成功生成并复制城市足迹打卡海报 ✨");
                    }
                  }}
                  className="w-full bg-[#1877F2] hover:bg-blue-600 active:scale-98 text-white font-bold py-1.5 rounded-xl text-[10px] transition-all cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Footprints size={12} />
                  <span>分享城市足迹打卡成就</span>
                </button>
              </div>
            )}
          </div>
        </div>}
      </div>

      {/* 生活成本专属地图覆盖层 (7大子图层切换、区县/城市指标卡片、数据源与样本提示) */}
      {activeLayer === "cost_of_living" && (
        <CostOfLivingMapOverlay
          activeSubLayer={costOfLivingState.activeSubLayer}
          onSelectSubLayer={(sub) => costOfLivingStore.setActiveSubLayer(sub)}
          selectedRegionId={costOfLivingState.selectedRegionId}
          onSelectRegion={(regId) => {
            costOfLivingStore.setSelectedRegionId(regId);
            costOfLivingStore.openDetailDrawer(regId);
            const target = REGIONAL_COST_DATABASE[regId];
            if (target) {
              setMapCenter({ lat: target.lat, lng: target.lng });
              setQuickFlyToLocation({
                lat: target.lat,
                lng: target.lng,
                zoom: target.level === 'county' ? 12 : target.level === 'city' ? 10 : 7,
                timestamp: Date.now(),
              });
              if (showToast) {
                showToast(`📍 已定位至「${target.name}」生活成本档案`);
              }
            }
          }}
          onOpenComparison={() => costOfLivingStore.openComparisonModal()}
          onOpenBudget={() => costOfLivingStore.openBudgetSimulator()}
          onOpenRelocation={() => costOfLivingStore.openRelocationPlanner()}
          reducedMotion={prefersReducedMotion}
        />
      )}

      {/* Stealth Mode Indicator Banner */}
      {isStealthMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 bg-purple-900/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-purple-400 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Ghost size={14} className="text-purple-200 animate-pulse" />
          <span>隐身模式已生效 · 真实坐标已向密友屏蔽</span>
        </div>
      )}

      {/* Floating Map User Callout Popover (Meta / Messenger Style) */}
      {showCalloutDemo && !isPinRadialMenuOpen && !isIconPickerOpen && mapZoom >= 10 && (
        <div className="absolute bottom-20 right-4 z-30 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative group">
            {/* Quick Dismiss Button */}
            <button
              onClick={() => setShowCalloutDemo(false)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-xs z-40 transition-transform hover:scale-110 border border-white/30 cursor-pointer"
              title="关闭状态气泡"
            >
              ✕
            </button>

            <MapUserCalloutPopover
              avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300"
              userName="Sarah Jenkins"
              messageText="我们能再聊聊吗？"
              emojis="😔 💕"
              batteryLevel={92}
              onClickAvatar={() => {
                const f = friends.find((fr) => fr.name.includes("Sarah") || fr.id === "f1") || friends[0];
                handleFriendMarkerClick(f);
              }}
              onClickCallout={() => {
                if (showToast) showToast("已开启 Sarah 的看护对话通道 💬");
              }}
            />
          </div>
        </div>
      )}

      {/* Activity Detail Short Card (短卡片分类显示 & 防止被底部导航栏遮挡) */}
      {selectedActivity && (
        <ActivityDetailShortCard
          activity={selectedActivity}
          userLocation={navigationOrigin}
          friends={friends}
          currentUser={{ id: 'me', name: currentUserName || CURRENT_USER_PROFILE.name, avatar: userAvatar || CURRENT_USER_PROFILE.avatar }}
          onClose={() => setSelectedActivity(null)}
          onNavigate={(act) => {
            const target = act.startedAt ? act.routeNodes?.find(node => node.status === 'next') || act.venueLocation : act.originLocation || act.venueLocation;
            startNavigation({ lat: target?.lat ?? act.lat, lng: target?.lng ?? act.lng, name: target?.name || act.title }, act.icon.includes('🚴') ? 'cycling' : act.icon.includes('🚗') ? 'driving' : 'walking');
          }}
          onUpdateActivity={(activity) => { onUpdateActivity?.(activity); setSelectedActivity(activity); }}
          onEditActivity={onEditActivity}
          onRepeatActivity={onRepeatActivity}
          onOpenChat={onOpenActivityChat}
          onOpenCalendar={onOpenCalendar}
          onShowToast={showToast}
          onFocusOnMap={(lat, lng) => { setMapCenter({ lat, lng }); setQuickFlyToLocation({ lat, lng, zoom: 16, timestamp: Date.now() }); }}
          onSelectParticipant={handleSelectActivityParticipant}
          onShareActivity={onShareActivity}
        />
      )}

      {/* Navigation App Selector / Route Modal */}
      {navigatingFriend && (
        <div
          id="navigation-selector-overlay"
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:p-6 pb-[calc(16px+var(--sab,0px))]"
        >
          {/* Backdrop */}
          <div
            id="navigation-selector-backdrop"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setNavigatingFriend(null)}
          />

          {/* Navigation Action Sheet */}
          <div
            id="navigation-action-sheet"
            className="relative w-full max-w-sm bg-white rounded-3xl p-5 z-10 border border-gray-200 transition-all transform animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Navigation size={16} className="fill-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1c1e21]">
                    路线导航规划
                  </h3>
                  <p className="text-[11px] text-[#65676B]">
                    前往 {navigatingFriend.name} 所在位置
                  </p>
                </div>
              </div>
              <button
                id="close-navigation-btn"
                onClick={() => setNavigatingFriend(null)}
                className="w-7 h-7 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-95 flex items-center justify-center text-[#65676B] transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Destination Info Box */}
            <div className="my-3.5 bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-100 space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-semibold text-[#65676B]">
                    目的地
                  </div>
                  <div className="text-xs font-bold text-[#1c1e21] flex items-center space-x-1">
                    <MapPin size={13} className="text-rose-500 shrink-0" />
                    <span>{navigatingFriend.locationName}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {navigatingFriend.distance}
                </span>
              </div>

              <div className="flex items-center space-x-3 pt-2 border-t border-gray-200/60 text-xs text-[#050505]">
                <div className="flex items-center space-x-1 font-medium text-emerald-700">
                  <Footprints size={14} />
                  <span>步行规划模式</span>
                </div>
                <div className="text-[#65676B]">
                  • 预计约{" "}
                  {Math.max(
                    Math.round(parseInt(navigatingFriend.distance) / 80) || 3,
                    2,
                  )}{" "}
                  分钟
                </div>
              </div>
            </div>

            {/* Navigation App Options List */}
            <div className="space-y-2">
              <button
                id="nav-in-app-btn"
                onClick={() => {
                  handleStartInMapNav(navigatingFriend);
                  setNavigatingFriend(null);
                }}
                className="w-full py-2.5 px-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold rounded-2xl text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 bg-white/20 text-white rounded-lg flex items-center justify-center font-bold text-xs backdrop-blur-xs">
                    ✨
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">
                      应用内置寻友互动导航
                    </div>
                    <div className="text-[10px] text-blue-100">
                      实时动态路线流光、距离追踪与互动
                    </div>
                  </div>
                </div>
                <Navigation size={14} className="text-white fill-white" />
              </button>

              <button
                id="nav-google-maps-btn"
                onClick={() => {
                  handleLaunchNavigation(navigatingFriend, "google");
                  setNavigatingFriend(null);
                }}
                className="w-full py-2.5 px-3.5 bg-blue-50 hover:bg-blue-100 active:scale-[0.99] border border-blue-200 text-[#1877F2] font-semibold rounded-2xl text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 bg-[#1877F2] text-white rounded-lg flex items-center justify-center font-bold text-[10px]">
                    G
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[#1c1e21]">
                      Google 地图 (推荐)
                    </div>
                    <div className="text-[10px] text-[#65676B]">
                      使用 Google Maps 实时步行导航
                    </div>
                  </div>
                </div>
                <ExternalLink size={14} />
              </button>

              <button
                id="nav-apple-maps-btn"
                onClick={() => {
                  handleLaunchNavigation(navigatingFriend, "apple");
                  setNavigatingFriend(null);
                }}
                className="w-full py-2.5 px-3.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-[0.99] border border-gray-200 text-[#1c1e21] font-semibold rounded-2xl text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 bg-black text-white rounded-lg flex items-center justify-center font-bold text-[10px]">
                    
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[#1c1e21]">
                      Apple 地图 / 系统原生地图
                    </div>
                    <div className="text-[10px] text-[#65676B]">
                      调用 iOS / 系统内置地图导航
                    </div>
                  </div>
                </div>
                <ExternalLink size={14} />
              </button>

              <button
                id="nav-amap-btn"
                onClick={() => {
                  handleLaunchNavigation(navigatingFriend, "amap");
                  setNavigatingFriend(null);
                }}
                className="w-full py-2.5 px-3.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] active:scale-[0.99] border border-gray-200 text-[#1c1e21] font-semibold rounded-2xl text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-[10px]">
                    高
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[#1c1e21]">高德地图</div>
                    <div className="text-[10px] text-[#65676B]">
                      打开高德地图步行路线
                    </div>
                  </div>
                </div>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps Setup Modal (when user clicks configure key) */}
      {showConfigModal && (
        <div className="absolute inset-0 z-55 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-gray-200 text-center animate-in zoom-in-95 duration-200">
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="w-14 h-14 bg-blue-50 text-[#1877F2] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Key size={26} />
            </div>
            <h2 className="text-base font-bold text-[#1c1e21] mb-1">
              配置 Google Maps API 密钥
            </h2>
            <p className="text-xs text-[#65676B] mb-4 leading-relaxed">
              配置 Google Maps Platform 密钥即可体验卫星与高精度真实道路图层。
            </p>

            <div className="bg-[#F8F9FA] border border-gray-100 rounded-2xl p-3.5 text-left text-xs text-[#050505] space-y-2 mb-4">
              <div className="font-semibold text-[#1c1e21]">配置步骤：</div>
              <div className="flex items-start space-x-2">
                <span className="w-4.5 h-4.5 bg-[#1877F2] text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                  1
                </span>
                <span>
                  获取 API Key：
                  <a
                    href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1877F2] underline ml-1 font-medium"
                  >
                    前往 Google Cloud 控制台
                  </a>
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-4.5 h-4.5 bg-[#1877F2] text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                  2
                </span>
                <span>
                  点击应用右上角 <strong>Settings (⚙️ 设置)</strong> →{" "}
                  <strong>Secrets (密钥)</strong>
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-4.5 h-4.5 bg-[#1877F2] text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                  3
                </span>
                <span>
                  添加变量名{" "}
                  <code className="bg-gray-200 px-1 py-0.5 rounded text-[10px] font-mono font-semibold">
                    GOOGLE_MAPS_PLATFORM_KEY
                  </code>{" "}
                  并填入您的密钥值
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowConfigModal(false)}
              className="w-full py-2.5 bg-[#1877F2] text-white font-bold rounded-2xl text-xs hover:bg-[#166fe5] transition-all cursor-pointer"
            >
              我知道了，继续体验
            </button>
          </div>
        </div>
      )}



      {/* Backdrop when FAB popover is open */}
      <AnimatePresence>
        {isFabOpen && (
          <motion.div
            key="fab-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="fixed inset-0 z-25 bg-black/25 backdrop-blur-[1px]"
            onClick={() => setIsFabOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) & Multi-directional Child Buttons (位于弹窗卡片下层，在自定义地图弹出时自动隐藏) */}
      {!selectedFriend && !isPinRadialMenuOpen && !isIconPickerOpen && (
        <div className="stellar-map-layer-controls absolute z-30 flex flex-col items-end">
        {/* Upward Sliding Child Buttons */}
        <AnimatePresence>
          {isFabOpen && (
            <motion.div
              key="fab-menu-container-up"
              className="flex flex-col items-end space-y-2.5 mb-3"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } }}
              exit={{ opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.25, ease: "easeIn", when: "afterChildren" } }}
            >
              {/* 微提示：可多选、可单选 */}
              <div className="px-2 py-0.5 mb-0.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-[9.5px] font-medium text-white/90 shadow-xs pointer-events-none select-none">
                可单选 / 多选 · 其它操作确定
              </div>

              {upFabItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={`up-fab-${item.id}-${index}`}
                    initial={{ opacity: 0, y: 20, scale: 0.75 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1, 
                      transition: { type: "spring", stiffness: 450, damping: 24, delay: (upFabItems.length - 1 - index) * 0.03 }
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: 25, 
                      scale: 0.8,
                      transition: { duration: 0.2, ease: "easeIn", delay: (index + 1) * 0.02 }
                    }}
                    className="flex items-center space-x-2.5 group cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onClick();
                    }}
                  >
                    {/* Text Label without bubble, thin font */}
                    <span className={`text-[12px] font-medium tracking-wide mr-2 select-none whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-colors ${item.active ? 'text-emerald-400 font-bold' : 'text-white/80'}`}>
                      {item.label}
                    </span>

                    {/* Circular Icon Button with check status */}
                    <div className="relative">
                      <button
                        id={`fab-item-${item.id}`}
                        type="button"
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${item.color} ${
                          item.active 
                            ? 'ring-2 ring-emerald-400 shadow-md shadow-emerald-500/30 scale-105 opacity-100' 
                            : 'grayscale opacity-40 hover:opacity-80 hover:grayscale-0'
                        } group-hover:scale-110 active:scale-95 transition-all border-2 border-white cursor-pointer select-none`}
                        title={`${item.label} (${item.active ? '已选择' : '未选择'})`}
                      >
                        <Icon size={18} />
                      </button>
                      {item.active && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white shadow-xs">
                          <Check size={9} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-row items-center justify-end">
          {/* Leftward Sliding Child Buttons */}
          <AnimatePresence>
            {isFabOpen && (
              <motion.div
                key="fab-menu-container-left"
                className="flex flex-row-reverse items-center mr-3"
                initial={{ opacity: 0, x: 15, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } }}
                exit={{ opacity: 0, x: 30, scale: 0.95, transition: { duration: 0.25, ease: "easeIn", when: "afterChildren" } }}
              >
                {leftFabItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={`left-fab-${item.id}-${index}`}
                      initial={{ opacity: 0, x: 20, scale: 0.75 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0, 
                        scale: 1, 
                        transition: { type: "spring", stiffness: 450, damping: 24, delay: index * 0.03 }
                      }}
                      exit={{ 
                        opacity: 0, 
                        x: 25, 
                        scale: 0.8,
                        transition: { duration: 0.2, ease: "easeIn", delay: (leftFabItems.length - 1 - index) * 0.02 }
                      }}
                      className="flex flex-col items-center group cursor-pointer mr-2.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onClick();
                      }}
                    >
                      {/* Text Label Above */}
                      <span className={`text-[11px] font-medium tracking-wide mb-1.5 select-none whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-colors ${item.active ? 'text-emerald-400 font-bold' : 'text-white/80'}`}>
                        {item.label}
                      </span>

                      {/* Circular Icon Button with check status */}
                      <div className="relative">
                        <button
                          id={`fab-item-${item.id}`}
                          type="button"
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${item.color} ${
                            item.active 
                              ? 'ring-2 ring-emerald-400 shadow-md shadow-emerald-500/30 scale-105 opacity-100' 
                              : 'grayscale opacity-40 hover:opacity-80 hover:grayscale-0'
                          } group-hover:scale-110 active:scale-95 transition-all border-2 border-white cursor-pointer select-none`}
                          title={`${item.label} (${item.active ? '已选择' : '未选择'})`}
                        >
                          <Icon size={18} />
                        </button>
                        {item.active && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white shadow-xs">
                            <Check size={9} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Floating Circular Trigger Button */}
          <button
            id="map-main-fab-btn"
            onClick={() => setIsFabOpen((prev) => !prev)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 border-2 border-white cursor-pointer select-none shadow-md ${
              isFabOpen
                ? "bg-[#050505] text-white rotate-45 ring-2 ring-white/50"
                : isAllLayersClosed
                ? "bg-gradient-to-tr from-[#1877F2] via-[#EC4899] to-[#F59E0B] text-white animate-pulse ring-4 ring-pink-400/60 scale-105"
                : "bg-gradient-to-tr from-[#1877F2] via-purple-600 to-[#EC4899] text-white hover:opacity-95 ring-2 ring-blue-500/20"
            }`}
            title={isFabOpen ? "收起快捷功能" : isAllLayersClosed ? "图层已关闭，点击开启图层" : "展开快捷功能"}
            aria-label="地图图层"
            aria-expanded={isFabOpen}
          >
            <Layers size={20} className="transition-transform duration-300" />
          </button>
        </div>
      </div>
      )}

      {/* Star Card Detail Modal (星片详情弹窗) */}
      <AnimatePresence>
        {selectedStarCard && <StarCardDetailModal
          card={selectedStarCard}
          onClose={() => setSelectedStarCard(null)}
          onLike={() => {
            onLikePost?.(selectedStarCard.id);
            setSelectedStarCard(prev => prev ? { ...prev, likes: prev.likedByMe ? prev.likes - 1 : prev.likes + 1, likedByMe: !prev.likedByMe } : null);
            showToast?.(selectedStarCard.likedByMe ? '已取消点赞' : '闪耀点赞！✨');
          }}
          commentValue={starCardCommentInput}
          onCommentChange={setStarCardCommentInput}
          onSubmitComment={() => {
            const text = starCardCommentInput.trim();
            if (!text) return;
            onAddCommentToPost?.(selectedStarCard.id, text);
            setSelectedStarCard(prev => prev ? {
              ...prev,
              comments: (prev.comments || 0) + 1,
              commentsList: [...(prev.commentsList || []), {
                id: `c-${Date.now()}`, userName: '我 (Alexia)',
                userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
                content: text, time: '刚刚',
              }],
            } : null);
            setStarCardCommentInput('');
            showToast?.('评论发布成功！💬');
          }}
        />}
      </AnimatePresence>

      {/* Pin Placement Mode Overlay (图钉放置模式) */}
      <AnimatePresence>
        {isPlacingPinMode && (
          <div className="pointer-events-none absolute inset-0 z-45 flex flex-col items-center justify-center">
            {/* Top instruction banner with live location info */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pointer-events-auto absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-gray-200/90 flex items-center space-x-3 select-none max-w-[90%]"
            >
              <div className="w-6 h-6 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shrink-0">
                <MapPin size={14} strokeWidth={2.2} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#050505] tracking-tight">
                  移动地图使中心对准目标地点
                </span>
                <span className="text-[10px] text-[#1877F2] font-semibold truncate max-w-[200px]">
                  📍 {getApproxAddressForCoord(mapCenter.lat, mapCenter.lng)}
                </span>
              </div>
              <button
                onClick={() => setIsPlacingPinMode(false)}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer shrink-0"
              >
                取消
              </button>
            </motion.div>

            {/* Center dynamic floating pin (固定在屏幕中心，悬浮动态效果) */}
            <div className="relative flex flex-col items-center select-none">
              {/* Pin Head & Needle with floating dynamic bounce */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                className="flex flex-col items-center -translate-y-8"
              >
                <div className="w-13 h-13 rounded-full bg-[#1877F2] text-white border-3 border-white flex items-center justify-center ring-4 ring-blue-500/25">
                  <MapPin size={24} strokeWidth={2.2} className="text-white" />
                </div>
                {/* Needle Tip Pointing directly to map coordinate center */}
                <div className="w-0 h-0 border-x-6 border-x-transparent border-t-10 border-t-[#1877F2] -mt-0.5"></div>
              </motion.div>

              {/* Ground Pulsing Target Ring (锚定精确坐标点) */}
              <div className="absolute -bottom-2 flex items-center justify-center pointer-events-none">
                <div className="absolute w-9 h-9 rounded-full border-2 border-[#1877F2] animate-ping opacity-75"></div>
                <div className="absolute w-3.5 h-3.5 rounded-full bg-[#1877F2] ring-2 ring-white"></div>
              </div>
            </div>

            {/* Bottom Floating Action Button: 确认定位 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="pointer-events-auto absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center"
            >
              <button
                id="confirm-place-marker-btn"
                onClick={handleConfirmPinPlacement}
                className="bg-[#1877F2] hover:bg-[#166FE5] active:scale-95 text-white font-extrabold text-sm px-7 py-3.5 rounded-full border-2 border-white/70 flex items-center space-x-2 transition-all cursor-pointer select-none"
              >
                <Check size={18} strokeWidth={2.8} />
                <span>确认定位</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pin Action Choice Radial Menu (长按选定地点4个圆形选择按钮: 日程、活动、快拍、据点) */}
      <PinActionRadialMenu
        isOpen={isPinRadialMenuOpen}
        coord={longPressPinCoord}
        address={longPressPinCoord ? getApproxAddressForCoord(longPressPinCoord.lat, longPressPinCoord.lng) : undefined}
        onClose={() => {
          setIsPinRadialMenuOpen(false);
          setLongPressPinCoord(null);
        }}
        onSelectAction={handleSelectPinAction}
      />

      {/* Custom Marker Creation Modal (据点图标与信息填写弹窗) */}
      <CustomMarkerCreationModal
        isOpen={isIconPickerOpen}
        lat={longPressPinCoord ? longPressPinCoord.lat : mapCenter.lat}
        lng={longPressPinCoord ? longPressPinCoord.lng : mapCenter.lng}
        approxAddress={getApproxAddressForCoord(
          longPressPinCoord ? longPressPinCoord.lat : mapCenter.lat,
          longPressPinCoord ? longPressPinCoord.lng : mapCenter.lng
        )}
        existingMarkers={customMarkers}
        onClose={() => {
          setIsIconPickerOpen(false);
          setLongPressPinCoord(null);
        }}
        onConfirm={(data) => {
          handleConfirmCreateMarker(data);
          setLongPressPinCoord(null);
        }}
      />

      {/* Custom Marker Detail Card (自定义标记信息卡片) */}
      <CustomMarkerDetailCard
        marker={selectedCustomMarker}
        onClose={() => setSelectedCustomMarker(null)}
        onDelete={handleDeleteCustomMarker}
        onUpdate={handleUpdateCustomMarker}
        onNavigate={(marker) => {
          startNavigation({lat:marker.lat,lng:marker.lng,name:marker.title},'driving');
        }}
        onShare={(marker) => {
          if (showToast) showToast(`已将标记「${marker.title}」的时光相册分享给好友 📨`);
        }}
      />

      {/* Long-press Context Menu for Custom Markers (长按自定义标记上下文菜单) */}
      <CustomMarkerContextMenu
        isOpen={!!contextMenuMarker}
        marker={contextMenuMarker}
        position={contextMenuPos}
        onClose={() => {
          setContextMenuMarker(null);
          setContextMenuPos(null);
        }}
        onEdit={(marker) => {
          setSelectedCustomMarker(marker);
        }}
        onAddPhotos={(marker) => {
          setSelectedCustomMarker(marker);
        }}
        onNavigate={(marker) => {
          setContextMenuMarker(null);
          startNavigation({lat:marker.lat,lng:marker.lng,name:marker.title},'driving');
        }}
        onShare={(marker) => {
          if (showToast) showToast(`已将标记「${marker.title}」分享给在线好友 📨`);
        }}
        onDelete={(id) => {
          handleDeleteCustomMarker(id);
        }}
      />

      {navigation.target && !isLifePanelOpen && !selectedFriend && !selectedActivity && <MapNavigationHud navigation={navigation} origin={navigationOrigin} onClose={clearNavigation}
        usingDeviceLocation={usingDeviceLocation} locationPending={locationPending}
        onLocate={async()=>{setLocationPending(true);try{const position=await requestCurrentLocation();setNavigationOrigin(position);setUsingDeviceLocation(true);setQuickFlyToLocation(null);}catch(error){showToast?.(error instanceof Error ? error.message : '定位暂时不可用');}finally{setLocationPending(false);}}}/>}

      {/* Map Tap-to-Enlarge 1.8x Friend Avatar with Photo Cutout Orbiting Label Stickers */}
      {enlargedFriend && (
        <MapAvatarEnlargeOverlay
          friend={enlargedFriend}
          isOpen={Boolean(enlargedFriend)}
          onClose={handleCloseEnlargedFriend}
          onProceedToProfile={(f) => {
            setSelectedFriend(f);
            setEnlargedFriend(null);
          }}
          onShowToast={(msg) => {
            if (showToast) showToast(msg);
          }}
        />
      )}

      {onToggleStealth && selectedFriend && (
        <button
          className={`map-privacy-button ${selectedFriend ? 'is-friend-context' : ''}`}
          aria-label={selectedFriend ? `针对【${selectedFriend.name}】的隐身设置` : "我的隐身设置"}
          aria-pressed={isStealthMode}
          title={selectedFriend ? `针对【${selectedFriend.name}】的位置隐私设置` : (isStealthMode ? '隐身模式已开启' : '隐私与隐身')}
          onClick={handleGhostButtonClick}
        >
          <Ghost size={20} />
        </button>
      )}

      {/* Friend Interactive Modal (Refactored Console with Smooth FLIP avatar animation) */}
      <AnimatePresence>
        {selectedFriend && (
          <FriendInteractiveModal
            key={`friend-interactive-${selectedFriend.id}`}
            friend={selectedFriend}
            userLocation={navigationOrigin}
            friendCount={friends.length}
            onAddFriend={onAddFriend}
            onGhost={() => setIsFriendPrivacyOpen(true)}
            onProfile={() => onOpenFriendProfile?.(selectedFriend.id)}
            onSendText={(text) => onQuickChatWith?.(selectedFriend.id, text)}
            onSendSnap={(url, caption) => onQuickChatWith?.(selectedFriend.id, caption || 'POV', { type: 'image', imageUrl: url, povExpiresAt: Date.now() + 24 * 60 * 60 * 1000 })}
            sourceRect={selectedFriendSourceRect}
            isOpen={Boolean(selectedFriend)}
            activityContext={selectedParticipantActivityContext ? {
              activity: selectedParticipantActivityContext.activity,
              participant: selectedParticipantActivityContext.participant,
              onUpdateParticipantRole: (activityId, participantId, role) => {
                setSimulatedActivities((prev) =>
                  prev.map((act) => {
                    if (act.id === activityId) {
                      return {
                        ...act,
                        participants: act.participants.map((p) =>
                          p.id === participantId ? { ...p, groupRole: role } : p
                        ),
                      };
                    }
                    return act;
                  })
                );
                setSelectedParticipantActivityContext((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    participant: { ...prev.participant, groupRole: role },
                  };
                });
              },
              onToggleParticipantArrival: (activityId, participantId) => {
                setSimulatedActivities((prev) =>
                  prev.map((act) => {
                    if (act.id === activityId) {
                      return {
                        ...act,
                        participants: act.participants.map((p) => {
                          if (p.id === participantId) {
                            const isArrived = p.status === 'arrived';
                            return {
                              ...p,
                              status: isArrived ? 'on_the_way' : 'arrived',
                              statusText: isArrived ? '在途中' : '已就位',
                            };
                          }
                          return p;
                        }),
                      };
                    }
                    return act;
                  })
                );
                setSelectedParticipantActivityContext((prev) => {
                  if (!prev) return null;
                  const isArrived = prev.participant.status === 'arrived';
                  return {
                    ...prev,
                    participant: {
                      ...prev.participant,
                      status: isArrived ? 'on_the_way' : 'arrived',
                      statusText: isArrived ? '在途中' : '已就位',
                    },
                  };
                });
              },
              onAssignTask: (activityId, participantId, task) => {
                if (showToast) {
                  showToast(`已为活动成员指派任务：${task} 📋`);
                }
              },
            } : null}
            onClose={() => {
              setSelectedFriend(null);
              setSelectedFriendSourceRect(null);
              setSelectedParticipantActivityContext(null);
            }}
            onOpenChat={(fid) => {
              if (onOpenChatWith) onOpenChatWith(fid);
            }}
            onOpenCanvasChat={(fid, appearance) => onOpenChatWith(fid, appearance)}
            onNavigate={(lat, lng, name) => {
              if (selectedFriend) handleStartInMapNav(selectedFriend);
            }}
            onShowToast={(msg) => {
              if (showToast) showToast(msg);
            }}
            onAddNotification={onAddNotification}
            onUpdateFriendRelationship={onUpdateFriendRelationship}
            onBump={(f) => {
              setZenlyBumpFriend(f);
            }}
            isIntercomTransmitting={isIntercomTransmitting}
            onIntercomTransmittingChange={onIntercomTransmittingChange}
            activities={simulatedActivities}
            onOpenTrajectory={(f) => {
              setSelectedFriend(null);
              setSelectedFriendSourceRect(null);
              setSelectedParticipantActivityContext(null);
              setActiveFriendForTrajectory(f);
              setFriendTrajectoryTimeHour(24.0);
              setMapCenter({ lat: f.lat, lng: f.lng });
              setQuickFlyToLocation({
                lat: f.lat,
                lng: f.lng,
                zoom: 15.6,
                timestamp: Date.now(),
              });
              if (showToast) {
                showToast(`🗺️ 已打开「${f.name}」24小时活动轨迹回放`);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Friend-Specific Privacy Settings Modal (针对单个好友的独立隐私与隐身设置) */}
      <FriendPrivacySettingModal
        friend={selectedFriend}
        isOpen={isFriendPrivacyOpen}
        onClose={() => setIsFriendPrivacyOpen(false)}
        showToast={showToast}
      />

      {/* 24-Hour Friend Activity Trajectory Replay & Scrubbable Timeline */}
      {activeFriendForTrajectory && (
        <FriendTrajectoryModal
          friend={activeFriendForTrajectory}
          isOpen={Boolean(activeFriendForTrajectory)}
          onClose={() => {
            setActiveFriendForTrajectory(null);
            setFriendTrajectoryCurrentPoint(null);
            if (showToast) {
              showToast('已退出轨迹回放，返回主页地图');
            }
          }}
          onTimeChange={handleFriendTrajectoryTimeChange}
        />
      )}

      {/* Zenly Bump Impact Fullscreen Particle Overlay */}
      <ZenlyBumpOverlay
        friend={zenlyBumpFriend}
        isOpen={Boolean(zenlyBumpFriend)}
        onClose={handleCloseZenlyBump}
      />

      {/* 底部动态图层快捷滑动栏 (卡片下移且高度严格不超过地图放大按钮上沿；头像图层与右侧按钮精确对齐) */}
      {!selectedFriend && !selectedActivity && !selectedCustomMarker && !selectedStarCard && !selectedLifePlaceForMemoryCard && !navigation.target && !isPlacingPinMode && isQuickFriendsBarVisible && !isFabOpen && !isPinRadialMenuOpen && !isIconPickerOpen && activeLayer !== 'all' && !activeFilters.includes('all') && (
        <div className={`stellar-map-quickbar absolute z-25 pointer-events-none flex items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-300 ${
          activeLayer === 'activities' || activeLayer === 'schedules' || activeLayer === 'places' ? 'is-object-layer' : ''
        }`}>
          {objectLayer && <div className="stellar-layer-summary">
            <button type="button" onClick={() => setIsLayerDrawerOpen(true)} aria-label={`${quickLayerLabel}图层，共${quickItemCount}项`} className="stellar-layer-summary-label">
              {activeLayer === 'activities' && quickActivityIcon ? <span aria-hidden="true">{quickActivityIcon}</span> : activeLayer === 'schedules' ? <Calendar size={18} aria-hidden="true"/> : starsOnly ? <Sparkles size={18} aria-hidden="true"/> : <MapPin size={18} aria-hidden="true"/>}
              <span>{quickLayerLabel} · {quickItemCount}</span>
            </button>
            <button type="button" className="stellar-layer-summary-close" aria-label={`收起${quickLayerLabel}快捷卡片`} onClick={() => setIsQuickFriendsBarVisible(false)}><X size={20}/></button>
          </div>}
          <div className="pointer-events-auto w-full max-w-full overflow-hidden flex justify-center">
            <DynamicLayerQuickBar
              activeLayer={activeLayer}
              friends={friends}
              activities={allActivities}
              schedules={quickSchedules}
              customMarkers={customMarkers}
              lifePlaces={filteredLifePlaces.filter(place => lifeIntentFilter === 'all' || placeIntent(place) === lifeIntentFilter)}
              onSelectLifePlace={handleSelectLifePlaceFromMap}
              starCards={starCards}
              showPlaces={!starsOnly}
              showStars={activeFilters.includes('stars') || activeFilters.includes('places')}
              onFocusItem={(item) => {
                setFocusedQuickItemId(item.id);
                setMapCenter({ lat: item.lat, lng: item.lng });
                setQuickFlyToLocation({ lat: item.lat, lng: item.lng, zoom: Math.max(mapZoom, 15.8), timestamp: Date.now() });
              }}
              selectedItemId={focusedQuickItemId || activeQuickFriendId || selectedCustomMarker?.id || selectedActivity?.id || selectedStarCard?.id}
              onOpenFriendsList={() => {
                haptics.trigger('light');
                soundEffects.playTapSound();
                setViewPerspective('friends_list');
              }}
              onSelectFriend={(f) => {
                if (typeof f.lat === 'number' && typeof f.lng === 'number') {
                  haptics.trigger('light');
                  soundEffects.playTapSound();
                  setActiveQuickFriendId(f.id);

                  // 满足需求：点击快速查找好友/家人头像，不跳出额外覆盖层，保持纯地图状态
                  setSelectedFriend(null);
                  setSelectedActivity(null);
                  setSelectedCustomMarker(null);
                  setSelectedStarCard(null);

                  // 快速平移到所在精确地图位置
                  setMapCenter({ lat: f.lat, lng: f.lng });
                  setQuickFlyToLocation({
                    lat: f.lat,
                    lng: f.lng,
                    zoom: Math.max(mapZoom, 15.8),
                    timestamp: Date.now(),
                  });

                  // 地图上对应的头像给予轻微果冻跳动反馈，便于用户直观识别
                  setBouncingFriendId(f.id);
                  setTimeout(() => {
                    setBouncingFriendId((curr) => (curr === f.id ? null : curr));
                  }, 900);

                  if (showToast) {
                    const distance = friendDistanceKm(USER_LOCATION, f);
                    showToast(`📍 已快速定位至「${f.name}」${distance === null ? '' : ` · 相距 ${distance.toFixed(2)} km`}`);
                  }
                }
              }}
              onSelectActivity={(act) => {
                if (typeof act.lat === 'number' && typeof act.lng === 'number') {
                  haptics.trigger('light');
                  soundEffects.playTapSound();
                  setSelectedFriend(null);
                  setSelectedActivity(act);
                  setSelectedCustomMarker(null);
                  setSelectedStarCard(null);

                  setMapCenter({ lat: act.lat, lng: act.lng });
                  setQuickFlyToLocation({
                    lat: act.lat,
                    lng: act.lng,
                    zoom: Math.max(mapZoom, 16.0),
                    timestamp: Date.now(),
                  });

                  if (showToast) {
                    showToast(`📍 已快速定位至活动「${act.title}」· 签到集结点`);
                  }
                }
              }}
              onSelectSchedule={(sched) => {
                haptics.trigger('light');
                soundEffects.playTapSound();
                if (validCoordinates({lat: sched.location?.latitude, lng: sched.location?.longitude})) {
                  setMapCenter({ lat: sched.location.latitude, lng: sched.location.longitude });
                  setQuickFlyToLocation({
                    lat: sched.location.latitude,
                    lng: sched.location.longitude,
                    zoom: 15.8,
                    timestamp: Date.now(),
                  });
                }
                if (onSelectSchedule) onSelectSchedule(sched);
                if (showToast) {
                  showToast(`✈️ 已定位至日程「${sched.title}」`);
                }
              }}
              onSelectCustomMarker={(m) => {
                if (typeof m.lat === 'number' && typeof m.lng === 'number') {
                  haptics.trigger('light');
                  soundEffects.playTapSound();
                  setSelectedFriend(null);
                  setSelectedActivity(null);
                  setSelectedCustomMarker(m);
                  setSelectedStarCard(null);

                  setMapCenter({ lat: m.lat, lng: m.lng });
                  setQuickFlyToLocation({
                    lat: m.lat,
                    lng: m.lng,
                    zoom: 16.2,
                    timestamp: Date.now(),
                  });

                  if (showToast) {
                    showToast(`📍 已定位至地点「${m.name}」`);
                  }
                }
              }}
              onSelectStarCard={(card) => {
                if (typeof card.lat === 'number' && typeof card.lng === 'number') {
                  haptics.trigger('light');
                  soundEffects.playTapSound();
                  setSelectedFriend(null);
                  setSelectedActivity(null);
                  setSelectedCustomMarker(null);
                  setSelectedStarCard(card);

                  setMapCenter({ lat: card.lat, lng: card.lng });
                  setQuickFlyToLocation({
                    lat: card.lat,
                    lng: card.lng,
                    zoom: 16.2,
                    timestamp: Date.now(),
                  });

                  if (showToast) {
                    showToast(`✨ 已定位至精选星片「${card.title || card.content}」`);
                  }
                }
              }}
              onSelectLayer={handleSelectLayer}
              onClose={() => {
                setIsQuickFriendsBarVisible(false);
                setActiveQuickFriendId(null);
                if (showToast) showToast('已收起快捷要素栏 · 点击地图右侧快捷按钮可重新展开');
              }}
            />
          </div>
        </div>
      )}

      {/* Add / Create Team Group Modal */}
      <CreateTeamGroupModal
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        onCreateTeam={handleCreateTeamSuccess}
        showToast={showToast}
      />

      {/* Teams & Groups Hub Modal (triggered from FAB '小组' button) */}
      <TeamsHubModal
        isOpen={isTeamsHubModalOpen}
        onClose={() => setIsTeamsHubModalOpen(false)}
        onOpenCreateTeam={() => {
          setIsTeamsHubModalOpen(false);
          setIsCreateTeamModalOpen(true);
        }}
        onSelectTeamActivityOnMap={(actId) => {
          setIsTeamsHubModalOpen(false);
          if (actId) {
            const act = simulatedActivities.find((a) => a.id === actId);
            if (act) {
              setSelectedActivity(act);
              setMapCenter({ lat: act.lat, lng: act.lng });
              setQuickFlyToLocation({ lat: act.lat, lng: act.lng, zoom: 15, timestamp: Date.now() });
            }
          }
        }}
        onOpenTeamsPage={onOpenTeams}
        activities={simulatedActivities}
        showToast={showToast}
      />

      {/* Bezier Parabolic Flying Emoji Trajectory & Bounce Landing Layer */}
      <AnimatePresence>
        {bezierFlyingEmojis.map((item, idx) => (
          <motion.div
            key={`bezier-emoji-${item.id}-${idx}`}
            initial={{
              x: item.startX,
              y: item.startY,
              scale: 0.5,
              opacity: 0,
              rotate: -20,
            }}
            animate={{
              x: [item.startX, (item.startX + item.targetX) / 2 + 70, item.targetX],
              y: [item.startY, Math.min(item.startY, item.targetY) - 190, item.targetY],
              scale: [0.6, 2.4, 1.15],
              opacity: [0, 1, 1],
              rotate: [-20, 15, 0],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={() => {
              setBouncingFriendId(item.friendId);
              triggerFriendBubble(item.friendId, item.emoji, "物理 Bounce 落地 💕");
              setTimeout(() => setBouncingFriendId(null), 700);
              setBezierFlyingEmojis((prev) => prev.filter((e) => e.id !== item.id));
            }}
            className="fixed z-[9999] pointer-events-none select-none text-4xl"
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 1. Map Layer Control Drawer (右下角图层选择抽屉) */}
      <MapLayerControlDrawer
        isOpen={isLayerDrawerOpen}
        onClose={() => setIsLayerDrawerOpen(false)}
        activeLayer={activeLayer}
        onSelectLayer={handleSelectLayer}
        reducedMotion={prefersReducedMotion}
      />

      {/* 2. Activity Command & Detail Drawer (活动快捷入口与全流程管理) */}
      <ActivityCommandDrawer
        isOpen={isActivityDrawerOpen}
        onClose={() => setIsActivityDrawerOpen(false)}
        activities={allActivities}
        selectedActivityId={selectedActivityDetailId}
        initialTab={selectedActivityTab}
        onShareActivity={onShareActivity}
        onSelectActivity={(act) => {
          setSelectedActivity(act);
          setSelectedActivityDetailId(act.id);
          setIsActivityDrawerOpen(false);
        }}
        onOpenCreateActivity={() => {
          setIsActivityDrawerOpen(false);
          if (onOpenActivityCreation) {
            onOpenActivityCreation({
              name: "兰州黄河风情线",
              address: "甘肃省兰州市城关区南滨河东路",
              lat: 36.0618,
              lng: 103.8322,
            });
          }
        }}
        onFocusOnMap={(act) => {
          setIsActivityDrawerOpen(false);
          setSelectedActivity(act);
          setMapCenter({ lat: act.lat, lng: act.lng });
          setQuickFlyToLocation({ lat: act.lat, lng: act.lng, zoom: 15.5, timestamp: Date.now() });
        }}
        onToggleAllParticipantsArrived={handleToggleAllParticipantsArrived}
        showToast={showToast}
        reducedMotion={prefersReducedMotion}
      />

      {/* 3. Squad Command Drawer (小队指挥抽屉) */}
      <SquadCommandDrawer
        isOpen={isSquadDrawerOpen}
        onClose={() => setIsSquadDrawerOpen(false)}
        showToast={showToast}
        reducedMotion={prefersReducedMotion}
      />

      {/* 4. Regional Cost Detail Drawer (区域生活成本详情抽屉，下沉至县级) */}
      <RegionalCostDetailDrawer
        isOpen={costOfLivingState.isDetailDrawerOpen}
        onClose={() => costOfLivingStore.closeDetailDrawer()}
        regionId={costOfLivingState.selectedRegionId}
        onOpenComparison={() => costOfLivingStore.openComparisonModal()}
        onOpenBudget={(regId) => costOfLivingStore.openBudgetSimulator(regId)}
        onOpenRelocation={(regId) => costOfLivingStore.openRelocationPlanner(regId)}
        reducedMotion={prefersReducedMotion}
      />

      {/* 5. Cost Comparison Modal (多地横向对比，2-4地同台) */}
      <CostComparisonModal
        isOpen={costOfLivingState.isComparisonModalOpen}
        onClose={() => costOfLivingStore.closeComparisonModal()}
        onOpenBudget={(regId) => costOfLivingStore.openBudgetSimulator(regId)}
        onOpenRelocation={(regId) => costOfLivingStore.openRelocationPlanner(regId)}
        reducedMotion={prefersReducedMotion}
      />

      {/* 6. Budget Simulator Modal (生活成本预算测算器) */}
      <BudgetSimulatorModal
        isOpen={costOfLivingState.isBudgetSimulatorOpen}
        onClose={() => costOfLivingStore.closeBudgetSimulator()}
        targetRegionId={costOfLivingState.selectedRegionId}
        onOpenRelocation={(regId) => costOfLivingStore.openRelocationPlanner(regId)}
        reducedMotion={prefersReducedMotion}
      />

      {/* 7. Relocation Planner Modal (定居与搬迁规划器) */}
      <RelocationPlannerModal
        isOpen={costOfLivingState.isRelocationPlannerOpen}
        onClose={() => costOfLivingStore.closeRelocationPlanner()}
        targetRegionId={costOfLivingState.selectedRegionId}
        reducedMotion={prefersReducedMotion}
      />

      {/* 8. Friends List Full-Screen View Perspective (好友列表「地图视角」外全景浏览模式) */}
      {viewPerspective === 'friends_list' && (
        <div className="absolute inset-0 z-50 animate-in fade-in zoom-in-98 duration-200">
          <FriendsListView
            friends={friends}
            onBackToMap={() => {
              setViewPerspective('map');
            }}
            onLocateFriendOnMap={(friend) => {
              setViewPerspective('map');
              if (typeof friend.lat === 'number' && typeof friend.lng === 'number') {
                setMapCenter({ lat: friend.lat, lng: friend.lng });
                setQuickFlyToLocation({
                  lat: friend.lat,
                  lng: friend.lng,
                  zoom: 16.5,
                  timestamp: Date.now(),
                });
                setBouncingFriendId(friend.id);
                setTimeout(() => {
                  setBouncingFriendId((curr) => (curr === friend.id ? null : curr));
                }, 1200);
              }
              setSelectedFriend(friend);
              if (showToast) {
                showToast(`已在地图中精准定位【${friend.name}】📍`);
              }
            }}
            onOpenChatWith={(friendId) => {
              onOpenChatWith(friendId);
            }}
            onStartIntercomWith={(friend) => {
              setViewPerspective('map');
              setSelectedFriend(friend);
              onIntercomTransmittingChange?.(true);
              if (showToast) {
                showToast(`正在与【${friend.name}】发起一键实时对讲 🎙️`);
              }
            }}
            onViewTrajectory={(friend) => {
              setViewPerspective('map');
              setSelectedFriend(friend);
              setIsHistoryModalOpen(true);
              if (showToast) {
                showToast(`已开启【${friend.name}】的24小时轨迹回放 👣`);
              }
            }}
            showToast={showToast}
          />
        </div>
      )}

      {/* Global Emergency SOS Circular Button (圆形 SOS 按钮，位于蓝色快捷按钮上方，点击地图其他交互自动隐藏) */}
      {!isPinRadialMenuOpen && !isIconPickerOpen && (
        <GlobalEmergencyButton
          userLocation={navigationOrigin}
          userAddress="甘肃省兰州市城关区天水南路222号 (兰州大学校本部 · 高精定位)"
          liveLocationShares={liveLocationShares || []}
          onAddLiveLocationShare={onAddLiveLocationShare}
          friends={friends}
          conversations={conversations || []}
          onSendMessage={onSendMessage}
          onAddNotification={onAddNotification ? (notif) => onAddNotification(notif.title, notif.content, notif.type as any) : undefined}
          showToast={showToast || ((m) => console.log(m))}
          currentUserName={currentUserName || 'Alexia Vance'}
          currentUserAvatar={userAvatar}
          isVisible={isSosVisible}
          onNavigateToMap={(lat, lng) => {
            setMapCenter({ lat, lng });
            setQuickFlyToLocation({
              lat,
              lng,
              zoom: 16.5,
              timestamp: Date.now(),
            });
          }}
        />
      )}
    </div>
  );
};
