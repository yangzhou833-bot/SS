import React, { useEffect, useRef, useState, useMemo, memo, useCallback } from "react";
import L from "leaflet";
import { getBasemap } from "../map/basemaps";
import { scheduleDateParts, type LifeRoute } from "../utils/lifePlanning";
import { getFlightSnapshotInfo } from "../utils/flightTracking";
import { validCoordinates } from "../utils/creationValidation";
import "leaflet/dist/leaflet.css";
import "./map-marker.css";
import "./star-card.css";
import "./floating-friend.css";
import { southPointerRotation, friendDistanceKm } from "../utils/friendCompass";
import { nearbyLovers, renderCoupleGathering, COUPLE_GATHERING_LAYOUT, activityArrivalMembers, activityGatheringLocation, addActivityGathering, gatheringTargetId } from "../utils/mapGathering";
import { renderStarCardMarker, STAR_CARD_MAP_SIZE } from "../utils/starCardPresentation";
import { renderPlaceMarker, PLACE_MARKER_MAP_SIZE } from "../utils/placeMarkerPresentation";
import { friendMarkerLayout, friendFocusCenterOffset, renderFriendMarker, renderLifeEventMarker, isDuplicateActivitySchedule, escapeMarkerText, observedStaySeconds, updateStayRing, friendMatchesMapFilters, type FriendStayObservation } from "../utils/friendMarker";
import { Friend, ChatConversation, LiveLocationShare, SimulatedMapActivity, DiscoverPost, CustomMapMarker, FriendInMapNavState, BeaconPoint, ActivityParticipantStatus, Schedule, TrajectoryPoint, FriendTrajectory, MapLayerId, LifePlace } from "../types";
import { SIMULATED_ACTIVITIES, CURRENT_USER_PROFILE } from "../data/mockData";
import { renderFlightPictureCardHTML } from "./FlightPictureCard";
import { FlightThreeStageCards } from "./FlightThreeStageCards";
import { scheduleToFlightSchedule } from "../utils/flightAdapter";
import { TRANSPORT_MODE_LABELS, TRANSPORT_MODE_ICONS } from "../utils/transportModeEngine";
import { getMapDetailLevel, MAP_DETAIL_CONFIG, getMapDetailLevelName } from "../utils/mapDetailConfig";
import { MapScaleBar } from "./MapScaleBar";
import {
  Users,
  X,
  Navigation,
  Car,
  Moon,
  Sun,
  Compass,
  Calendar,
  Clock,
  MapPin,
  Flame,
  Ghost,
  Maximize2,
  Sparkles,
  ShieldCheck,
  Target,
  Layers,
} from "lucide-react";
import { calculateLatLngDistanceMeters, MapStyleMode } from "../utils/geoUtils";
import { soundEffects } from "../utils/soundEffects";
import { haptics } from "../utils/haptics";
import { interpolateFriendTrajectory, formatTimeHour } from "../utils/trajectoryData";

export { calculateLatLngDistanceMeters, type MapStyleMode };

// Interpolate point along route for progress (0 to 1)
export const getInterpolatedRoutePoint = (
  points: [number, number][],
  progress: number
): { lat: number; lng: number; bearing: number } => {
  if (!points || points.length === 0) return { lat: 0, lng: 0, bearing: 0 };
  if (points.length === 1 || progress <= 0) return { lat: points[0][0], lng: points[0][1], bearing: 0 };
  if (progress >= 1) {
    const last = points[points.length - 1];
    const prev = points[points.length - 2] || last;
    const dy = last[0] - prev[0];
    const dx = last[1] - prev[1];
    const bearing = (Math.atan2(dy, dx) * 180) / Math.PI;
    return { lat: last[0], lng: last[1], bearing };
  }

  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const d = calculateLatLngDistanceMeters(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
    segmentLengths.push(d);
    totalLength += d;
  }

  if (totalLength === 0) return { lat: points[0][0], lng: points[0][1], bearing: 0 };

  const targetDist = totalLength * progress;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (accumulated + segLen >= targetDist || i === segmentLengths.length - 1) {
      const segProgress = segLen > 0 ? (targetDist - accumulated) / segLen : 0;
      const lat = points[i][0] + (points[i + 1][0] - points[i][0]) * segProgress;
      const lng = points[i][1] + (points[i + 1][1] - points[i][1]) * segProgress;
      const dy = points[i + 1][0] - points[i][0];
      const dx = points[i + 1][1] - points[i][1];
      const bearing = (Math.atan2(dy, dx) * 180) / Math.PI;
      return { lat, lng, bearing };
    }
    accumulated += segLen;
  }

  const last = points[points.length - 1];
  return { lat: last[0], lng: last[1], bearing: 0 };
};

interface SlippyLeafletMapProps {
  lifeRoute?: LifeRoute | null;
  userLocation?: { lat: number; lng: number };
  friends?: Friend[];
  conversations?: ChatConversation[];
  liveLocationShares?: LiveLocationShare[];
  onRemoveLiveLocationShare?: (shareId: string) => void;
  simulatedActivities?: SimulatedMapActivity[];
  selectedActivityId?: string | null;
  starCards?: DiscoverPost[];
  customMarkers?: CustomMapMarker[];
  selectedCustomMarkerId?: string | null;
  navState?: FriendInMapNavState | null;
  onSelectCustomMarker?: (marker: CustomMapMarker) => void;
  onLongPressCustomMarker?: (marker: CustomMapMarker, eventPos?: { x: number; y: number }) => void;
  onMapLongPress?: (coord: { lat: number; lng: number }, screenPos?: { x: number; y: number }) => void;
  droppedPinCoord?: { lat: number; lng: number } | null;
  droppedPinAddress?: string;
  onSelectActivity?: (activity: SimulatedMapActivity) => void;
  onSelectActivityParticipant?: (activity: SimulatedMapActivity, participant: ActivityParticipantStatus) => void;
  onTriggerActivityArrival?: (activity: SimulatedMapActivity, participant?: ActivityParticipantStatus) => void;
  onSelectStarCard?: (card: DiscoverPost) => void;
  activeMapFilter?: string | string[];
  mapStyle?: MapStyleMode;
  onSelectFriend?: (friend: Friend) => void;
  onMapInteraction?: () => void;
  onViewportChanged?: (center: { lat: number; lng: number; zoom?: number }) => void;
  trafficEnabled?: boolean;
  userNote?: string;
  attachedEmoji?: string;
  noteTheme?: string;
  userAvatar?: string;
  isStealthMode?: boolean;
  selectedFriendId?: string | null;
  hideAllFriendMarkers?: boolean;
  bouncingFriendId?: string | null;
  activeFriendBubbles?: { id: string; friendId: string; emoji: string; text?: string }[];
  beaconPoints?: BeaconPoint[];
  onSelectBeacon?: (beacon: BeaconPoint) => void;
  flyToLocation?: { lat: number; lng: number; zoom?: number; timestamp: number } | null;
  isFabOpen?: boolean;
  activeLayer?: MapLayerId;
  isQuickFriendsBarVisible?: boolean;
  onToggleQuickFriendsBar?: () => void;
  schedules?: Schedule[];
  onSelectSchedule?: (schedule: Schedule) => void;
  onOpenUserTransportCard?: () => void;
  userTransportEvaluation?: any;
  isHistoryReplayActive?: boolean;
  historyTrajectoryPoints?: TrajectoryPoint[];
  historyFriendTrajectories?: FriendTrajectory[];
  historySelectedTimeHour?: number;
  showFriendTrajectories?: boolean;
  onMapReady?: () => void;
  lifePlaces?: LifePlace[];
  selectedLifePlaceId?: string | null;
  onSelectLifePlace?: (place: LifePlace, screenPos?: { x: number; y: number }) => void;
  isLifeLayerActive?: boolean;
  selectedTargetCoord?: { lat: number; lng: number } | null;
  selectedTargetName?: string | null;
  activeFriendTrajectoryPoints?: TrajectoryPoint[];
  activeFriendTrajectoryTimeHour?: number;
  activeFriendTrajectoryFriend?: Friend | null;
}

// OpenStreetMap & CartoDB Tile Layers
const TILE_CONFIGS: Record<
  MapStyleMode,
  { url: string; attribution: string; subdomains?: string }
> = {
  standard: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: "abc",
  },
  dark: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: "abcd",
  },
  minimal: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: "abc",
  },
};

// Module-level persistent map center & zoom memory to prevent map refresh/zoom reset when returning from any tab
// User location (Dongfanghong Square, Lanzhou, Gansu) as default initial center
const getInitialStoredZoom = (): number => {
  try {
    const saved = localStorage.getItem("stellar_preset_map_zoom");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 3 && parsed <= 19) {
        return parsed;
      }
    }
  } catch (e) {}
  return 15.0;
};

const getInitialStoredCenter = (defaultLoc: { lat: number; lng: number }): [number, number] => {
  try {
    const saved = localStorage.getItem("stellar_preset_map_center");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
        return [parsed[0], parsed[1]];
      }
    }
  } catch (e) {}
  return [defaultLoc.lat, defaultLoc.lng];
};

let globalLastMapCenter: [number, number] = getInitialStoredCenter({ lat: 36.0592, lng: 103.8343 });
let globalLastMapZoom: number = getInitialStoredZoom();

export const SlippyLeafletMap: React.FC<SlippyLeafletMapProps> = memo(({
  userLocation = { lat: 36.0610, lng: 103.8320 },
  friends = [],
  conversations,
  liveLocationShares,
  onRemoveLiveLocationShare,
  simulatedActivities = SIMULATED_ACTIVITIES,
  selectedActivityId = null,
  starCards = [],
  customMarkers = [],
  selectedCustomMarkerId = null,
  navState = null,
  onSelectCustomMarker,
  onLongPressCustomMarker,
  onMapLongPress,
  droppedPinCoord = null,
  droppedPinAddress = "已放置图钉",
  onSelectActivity,
  onSelectActivityParticipant,
  onSelectStarCard,
  activeMapFilter = "all",
  mapStyle = "standard",
  onSelectFriend = (_friend?: any) => {},
  onMapInteraction,
  onViewportChanged,
  trafficEnabled = false,
  userNote,
  attachedEmoji,
  noteTheme,
  userAvatar,
  isStealthMode = false,
  selectedFriendId = null,
  hideAllFriendMarkers = false,
  bouncingFriendId = null,
  activeFriendBubbles = [],
  beaconPoints = [],
  onSelectBeacon,
  flyToLocation,
  isFabOpen = false,
  activeLayer = 'all',
  isQuickFriendsBarVisible = true,
  onToggleQuickFriendsBar,
  lifeRoute,
  schedules = [],
  onSelectSchedule,
  onOpenUserTransportCard,
  userTransportEvaluation,
  isHistoryReplayActive = false,
  historyTrajectoryPoints = [],
  historyFriendTrajectories = [],
  historySelectedTimeHour = 24.0,
  showFriendTrajectories = true,
  onMapReady,
  lifePlaces = [],
  selectedLifePlaceId = null,
  onSelectLifePlace,
  isLifeLayerActive = true,
  selectedTargetCoord = null,
  selectedTargetName = null,
  activeFriendTrajectoryPoints = [],
  activeFriendTrajectoryTimeHour = 24.0,
  activeFriendTrajectoryFriend = null,
}) => {
  // ADD: Interactive avatar window action dispatchers
  useEffect(() => {
    (window as any).stellarInteractClose = (e?: Event) => {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      onSelectFriend(null as any);
    };
    (window as any).stellarInteractFriendMsg = (friendId: string, e?: Event) => {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      window.dispatchEvent(new CustomEvent('stellar_open_chat', { detail: { friendId } }));
    };
    (window as any).stellarInteractFriendHeart = (friendId: string, e?: Event) => {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      window.dispatchEvent(new CustomEvent('stellar_send_heart', { detail: { friendId } }));
    };
    (window as any).stellarInteractFriendNav = (friendId: string, e?: Event) => {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      const friend = friends.find((f) => f.id === friendId);
      if (friend) {
        window.dispatchEvent(new CustomEvent('stellar_start_nav', { detail: { friend } }));
      }
    };
    (window as any).stellarInteractFriendProfile = (friendId: string, e?: Event) => {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      const friend = friends.find((f) => f.id === friendId);
      if (friend) {
        window.dispatchEvent(new CustomEvent('stellar_open_profile', { detail: { friend } }));
      }
    };
  }, [friends, onSelectFriend]);
  const activeFilters = useMemo(() => {
    const raw = activeMapFilter !== undefined ? activeMapFilter : [];
    return Array.isArray(raw) ? raw : [raw];
  }, [activeMapFilter]);
  const showAll = activeFilters.includes("all");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [basemapIssue, setBasemapIssue] = useState<'fallback' | 'unavailable' | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const trafficLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const navRouteLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const friendsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const stayObservationsRef = useRef(new Map<string, FriendStayObservation>());
  const getStaySeconds = useCallback((friend: Friend, now = Date.now()) => observedStaySeconds(friend, stayObservationsRef.current, now), []);
  useEffect(() => {
    const tick = () => {
      mapContainerRef.current?.querySelectorAll<SVGElement>('[data-stay-ring]').forEach(element => {
        const observation = stayObservationsRef.current.get(element.dataset.stayRing || '');
        if (observation) updateStayRing(element, observedStaySeconds(observation.friend, stayObservationsRef.current));
      });
    };
    const timer = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, []);
  const stableFriendMarkersRef = useRef(new Map<string, { marker: L.Marker; html: string }>());
  const starsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const activitiesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const lifeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const droppedPinLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const historyRouteLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const prevLivePositionsRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());
  const onMapInteractionRef = useRef(onMapInteraction);
  const onViewportChangedRef = useRef(onViewportChanged);
  const onMapLongPressRef = useRef(onMapLongPress);
  const onMapReadyRef = useRef(onMapReady);
  const onSelectFriendRef = useRef(onSelectFriend);
  const longPressJustTriggeredRef = useRef(false);

  useEffect(() => {
    onSelectFriendRef.current = onSelectFriend;
  }, [onSelectFriend]);

  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);
  const [showFlightThreeStagePanel, setShowFlightThreeStagePanel] = useState<boolean>(false);

  const [isPhoneInactive, setIsPhoneInactive] = useState(false);
  const lastInteractionRef = useRef(Date.now());

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

  const handleLocateStageOnMap = useCallback((stage: 'preflight' | 'in-flight' | 'landed') => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const schedule = schedules?.find(item => item.type === 'flight' && item.flight);
    if (!schedule) return;
    const departure: [number, number] = [schedule.location.latitude, schedule.location.longitude];
    if (!validCoordinates({lat:departure[0],lng:departure[1]})) return;
    const arrival: [number, number] | null = schedule.destination && validCoordinates({lat:schedule.destination.latitude,lng:schedule.destination.longitude}) ? [schedule.destination.latitude, schedule.destination.longitude] : null;
    const snapshot = getFlightSnapshotInfo(schedule);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (stage === 'preflight') {
      map.flyTo(departure, 13, { animate: !reducedMotion, duration: .65 });
    } else if (stage === 'in-flight') {
      const points: [number, number][] = [departure];
      if (arrival) points.push(arrival);
      if (snapshot.position) points.push([snapshot.position.lat, snapshot.position.lng]);
      map.fitBounds(L.latLngBounds(points), { paddingTopLeft: [40, 90], paddingBottomRight: [40, 90], animate: !reducedMotion });
    } else if (stage === 'landed' && arrival) {
      map.flyTo(arrival, 13, { animate: !reducedMotion, duration: .65 });
    }
  }, [schedules]);
  const [flightClock, setFlightClock] = useState(Date.now);
  const hasObservedFlight = schedules?.some(schedule => schedule.flight?.live);
  useEffect(() => {
    if (!hasObservedFlight) return;
    const updateClock = () => setFlightClock(Date.now());
    const timer = window.setInterval(updateClock, 30000);
    document.addEventListener('visibilitychange', updateClock);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', updateClock);
    };
  }, [hasObservedFlight]);
  const [mapZoom, setMapZoom] = useState(15.0);
  const [deviceHeading, setDeviceHeading] = useState<number>(180); // Default pointing south (180 deg)
  const [compassMode, setCompassMode] = useState<'north' | 'heading'>('north');

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setDeviceHeading(360 - e.alpha);
      } else if ((e as any).webkitCompassHeading !== undefined) {
        setDeviceHeading((e as any).webkitCompassHeading);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  // Calculate distance for 1:1 compass button:
  // 在好友快捷栏中选择好友时，显示好友和用户的距离；选择活动按钮时，显示活动和好友距离；默认显示最近好友或目标距离
  const selectedLifePlace = selectedLifePlaceId && lifePlaces ? lifePlaces.find(p => p.id === selectedLifePlaceId) : null;
  const selectedFriend = selectedFriendId ? friends.find(f => f.id === selectedFriendId) : null;
  const selectedActivity = selectedActivityId && simulatedActivities ? simulatedActivities.find(a => a.id === selectedActivityId) : null;
  const isActivityActive = Boolean(selectedActivity || activeLayer === 'activities');

  const compassDistanceDisplay = useMemo(() => {
    // 1. 选择活动按钮时，显示活动和好友距离
    if (isActivityActive) {
      const act = selectedActivity || (simulatedActivities && simulatedActivities.length > 0 ? simulatedActivities[0] : null);
      if (act && typeof act.lat === 'number' && typeof act.lng === 'number') {
        const friendForActivity = selectedFriend || (friends && friends.length > 0 ? friends[0] : null);
        if (friendForActivity && typeof friendForActivity.lat === 'number' && typeof friendForActivity.lng === 'number') {
          const meters = calculateLatLngDistanceMeters(act.lat, act.lng, friendForActivity.lat, friendForActivity.lng);
          const km = meters / 1000;
          return km < 1 ? km.toFixed(2) : km < 10 ? km.toFixed(1) : Math.round(km).toString();
        }
      }
    }

    // 2. 在好友快捷栏中选择好友时，显示好友和用户的距离
    if (selectedFriend && typeof selectedFriend.lat === 'number' && typeof selectedFriend.lng === 'number') {
      const meters = calculateLatLngDistanceMeters(userLocation.lat, userLocation.lng, selectedFriend.lat, selectedFriend.lng);
      const km = meters / 1000;
      return km < 1 ? km.toFixed(2) : km < 10 ? km.toFixed(1) : Math.round(km).toString();
    }

    // 3. 选中的生活地点、导航目标或图钉位置
    const otherTarget = selectedLifePlace || selectedTargetCoord || (navState?.friend ? navState.friend : null) || droppedPinCoord;
    if (otherTarget && typeof otherTarget.lat === 'number' && typeof otherTarget.lng === 'number') {
      const meters = calculateLatLngDistanceMeters(userLocation.lat, userLocation.lng, otherTarget.lat, otherTarget.lng);
      const km = meters / 1000;
      return km < 1 ? km.toFixed(2) : km < 10 ? km.toFixed(1) : Math.round(km).toString();
    }

    // 4. 默认显示与最近好友的距离
    if (friends && friends.length > 0) {
      let minD: number | null = null;
      for (const f of friends) {
        const d = friendDistanceKm(userLocation, f);
        if (d !== null && (minD === null || d < minD)) {
          minD = d;
        }
      }
      if (minD !== null) {
        return minD < 1 ? minD.toFixed(2) : minD < 10 ? minD.toFixed(1) : Math.round(minD).toString();
      }
    }

    return "0.0";
  }, [isActivityActive, selectedActivity, simulatedActivities, selectedFriend, friends, userLocation, selectedLifePlace, selectedTargetCoord, navState, droppedPinCoord]);
  const [selectedProvinceCluster, setSelectedProvinceCluster] = useState<{
    name: string;
    totalCount: number;
    onlineCount: number;
    activeCount: number;
  } | null>(null);
  const rafPanRef = useRef<number | null>(null);
  const zoomRafRef = useRef<number | null>(null);
  const zoomTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper for computing layer reveal status and visual scale/opacity
  const getLayerRevealConfig = useCallback((layer: 'friends' | 'stars' | 'activities' | 'life', zoom: number) => {
    if (layer === 'friends') {
      // Priority 1: Friends & Family (always visible if active, z >= 8)
      // Small icon: z >= 8, Full size: z >= 10
      if (zoom >= 10.0) return { mode: 'full' as const, scale: 1.0, opacity: 1.0 };
      if (zoom >= 8.0) return { mode: 'small' as const, scale: 0.60, opacity: 1.0 };
      return { mode: 'small' as const, scale: 0.60, opacity: 1.0 };
    }

    if (layer === 'stars') {
      // Priority 2: Starred Places (★)
      // Small icon: z < 14, Full size: z >= 14
      if (zoom >= 14.0) return { mode: 'full' as const, scale: 1.0, opacity: 1.0 };
      if (zoom >= 12.0) return { mode: 'small' as const, scale: 0.60, opacity: 0.95 };
      return { mode: 'small' as const, scale: 0.50, opacity: 0.85 };
    }

    if (layer === 'activities') {
      // Activities (🎯) - Compact Facebook Straight-Edge Bubble showing Name & Date
      if (zoom >= 12.0) return { mode: 'full' as const, scale: 1.0, opacity: 1.0 };
      if (zoom >= 10.5) return { mode: 'small' as const, scale: 0.85, opacity: 0.95 };
      return { mode: 'small' as const, scale: 0.70, opacity: 0.85 };
    }

    if (layer === 'life') {
      // Priority 4: Custom Life Markers
      if (zoom >= 15.0) return { mode: 'full' as const, scale: 1.0, opacity: 1.0 };
      if (zoom >= 13.0) return { mode: 'small' as const, scale: 0.60, opacity: 0.95 };
      return { mode: 'small' as const, scale: 0.50, opacity: 0.85 };
    }

    return { mode: 'full' as const, scale: 1.0, opacity: 1.0 };
  }, []);

  // Keep the coordinate needle fixed while framing the selected avatar in the upper map.
  const centerAvatarOnMap = useCallback((lat: number, lng: number, selected = true) => {
    if (rafPanRef.current !== null) {
      cancelAnimationFrame(rafPanRef.current);
      rafPanRef.current = null;
    }

    rafPanRef.current = requestAnimationFrame(() => {
      if (!mapInstanceRef.current) return;
      const map = mapInstanceRef.current;
      const zoom = Math.max(map.getZoom(), 16.2);
      const pt = map.project([lat, lng], zoom);
      const size = map.getSize();
      const landscape = selected && size.x > 500 && size.y < 500;
      const offsetY = friendFocusCenterOffset(size.y, selected) - (landscape ? size.y * 0.11 : 0);
      const avatarCenterLatLng = map.unproject(L.point(pt.x + (landscape ? size.x * 0.25 : 0), pt.y + offsetY), zoom);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      map.flyTo(avatarCenterLatLng, zoom, {
        animate: !reducedMotion,
        duration: reducedMotion ? 0 : 0.65,
        easeLinearity: 0.25,
      });
      rafPanRef.current = null;
    });
  }, []);

  // Dynamic smooth camera flyTo triggered by external controls (e.g. quick friend location avatar click)
  const lastFlyToTimestampRef = useRef<number | null>(null);
  useEffect(() => {
    if (!flyToLocation || !mapInstanceRef.current) return;
    if (lastFlyToTimestampRef.current === flyToLocation.timestamp) return;
    lastFlyToTimestampRef.current = flyToLocation.timestamp;

    // 当有选中的好友且坐标一致时，使用统一的头像精准居中平滑过渡
    if (selectedFriendId) {
      centerAvatarOnMap(flyToLocation.lat, flyToLocation.lng);
      return;
    }

    const zoom = flyToLocation.zoom || Math.max(mapInstanceRef.current.getZoom(), 15.6);
    mapInstanceRef.current.flyTo([flyToLocation.lat, flyToLocation.lng], zoom, {
      animate: true,
      duration: 0.65,
      easeLinearity: 0.25,
    });
  }, [flyToLocation, selectedFriendId, centerAvatarOnMap]);

  // Keep source coordinates intact; visual separation happens in screen pixels below.
  const dispersedData = useMemo(() => ({
    dispersedActivities: (simulatedActivities || []).filter(activity => validCoordinates(activity)),
    dispersedStarCards: (starCards || []).filter(card => validCoordinates({lat:card.lat ?? NaN,lng:card.lng ?? NaN})),
    dispersedCustomMarkers: (customMarkers || []).filter(marker => validCoordinates(marker)),
  }),[simulatedActivities,starCards,customMarkers]);

  useEffect(() => {
    onMapInteractionRef.current = onMapInteraction;
  }, [onMapInteraction]);

  useEffect(() => {
    onViewportChangedRef.current = onViewportChanged;
  }, [onViewportChanged]);

  useEffect(() => {
    onMapLongPressRef.current = onMapLongPress;
  }, [onMapLongPress]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const lifecycleTimers = new Set<ReturnType<typeof setTimeout>>();
    const later = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => { lifecycleTimers.delete(timer); callback(); }, delay);
      lifecycleTimers.add(timer);
      return timer;
    };

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = globalLastMapCenter || [userLocation.lat, userLocation.lng];
      const initialZoom: number = globalLastMapZoom || 15.6;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: false, // We use our polished custom controls
        attributionControl: true,
      });

      // Map interaction listeners to auto-dismiss aggregation card / cluster overlay
      map.on("dragstart", () => onMapInteractionRef.current?.());
      map.on("zoomstart", () => onMapInteractionRef.current?.());
      map.on("click", (e: any) => {
        // Only trigger on background click if not right after a long-press gesture
        if (longPressJustTriggeredRef.current) {
          return;
        }
        onMapInteractionRef.current?.();
      });

      // Context menu on map (Right-click or mobile long-press natively triggered by Leaflet)
      map.on("contextmenu", (e: any) => {
        if (e?.originalEvent) {
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
        }
        longPressJustTriggeredRef.current = true;
        later(() => {
          longPressJustTriggeredRef.current = false;
        }, 600);
        const lat = e.latlng?.lat;
        const lng = e.latlng?.lng;
        if (typeof lat === "number" && typeof lng === "number") {
          const clientX = e.originalEvent?.clientX || e.containerPoint?.x || 0;
          const clientY = e.originalEvent?.clientY || e.containerPoint?.y || 0;
          onMapLongPressRef.current?.({ lat, lng }, { x: clientX, y: clientY });
        }
      });

      map.on("move", () => {
        const center = map.getCenter();
        globalLastMapCenter = [center.lat, center.lng];
        onViewportChangedRef.current?.({ lat: center.lat, lng: center.lng, zoom: map.getZoom() });
      });

      map.on("moveend", () => {
        const center = map.getCenter();
        globalLastMapCenter = [center.lat, center.lng];
        try {
          localStorage.setItem("stellar_preset_map_center", JSON.stringify([center.lat, center.lng]));
          const z = map.getZoom();
          globalLastMapZoom = z;
          localStorage.setItem("stellar_preset_map_zoom", z.toString());
        } catch (e) {}
        onViewportChangedRef.current?.({ lat: center.lat, lng: center.lng, zoom: map.getZoom() });
      });

      // Optimized map zoom handler with requestAnimationFrame and debouncing to prevent redundant redraws
      const handleDebouncedZoom = () => {
        if (!mapInstanceRef.current) return;
        const z = mapInstanceRef.current.getZoom();
        if (zoomRafRef.current !== null) {
          cancelAnimationFrame(zoomRafRef.current);
        }
        zoomRafRef.current = requestAnimationFrame(() => {
          if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
          zoomTimerRef.current = setTimeout(() => {
            globalLastMapZoom = z;
            setMapZoom(z);
            try {
              localStorage.setItem("stellar_preset_map_zoom", z.toString());
            } catch (e) {}
          }, 16);
        });
      };

      map.on("zoom", handleDebouncedZoom);
      map.on("zoomend", () => {
        handleDebouncedZoom();
        const center = map.getCenter();
        onViewportChangedRef.current?.({ lat: center.lat, lng: center.lng, zoom: map.getZoom() });
      });

      // Trigger initial viewport center
      later(() => {
        if (mapInstanceRef.current) {
          const center = mapInstanceRef.current.getCenter();
          onViewportChangedRef.current?.({ lat: center.lat, lng: center.lng, zoom: mapInstanceRef.current.getZoom() });
        }
      }, 300);

      // Add Base Tile Layer
      const config = TILE_CONFIGS[mapStyle];
      const tileLayer = L.tileLayer(config.url, {
        className: mapStyle === 'dark' ? 'stellar-tiles-dark' : mapStyle === 'minimal' ? 'stellar-tiles-minimal' : '',
        attribution: config.attribution,
        subdomains: config.subdomains || "abc",
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = tileLayer;
      let failures: number[] = [];
      let usingFallback = false;
      tileLayer.on('tileload', () => {
        failures = [];
        if (usingFallback) setBasemapIssue('fallback');
      });
      tileLayer.on('tileerror', () => {
        const now = Date.now();
        failures = [...failures.filter(time => now - time < 8000), now];
        if (failures.length < 6) return;
        failures = [];
        if (usingFallback) {
          setBasemapIssue('unavailable');
          return;
        }
        usingFallback = true;
        const fallback = getBasemap('carto-voyager');
        map.attributionControl?.removeAttribution(config.attribution);
        tileLayer.options.attribution = fallback.attribution;
        tileLayer.options.subdomains = (fallback.subdomains || 'abcd').split('');
        map.attributionControl?.addAttribution(fallback.attribution);
        tileLayer.setUrl(fallback.url);
        setBasemapIssue('fallback');
      });

      // Add Layer Groups for organized rendering & layer priority management
      const navRouteGroup = L.layerGroup().addTo(map);
      navRouteLayerGroupRef.current = navRouteGroup;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = markersGroup;

      const friendsGroup = L.layerGroup().addTo(map);
      friendsLayerGroupRef.current = friendsGroup;

      const starsGroup = L.layerGroup().addTo(map);
      starsLayerGroupRef.current = starsGroup;

      const activitiesGroup = L.layerGroup().addTo(map);
      activitiesLayerGroupRef.current = activitiesGroup;

      const lifeGroup = L.layerGroup().addTo(map);
      lifeLayerGroupRef.current = lifeGroup;

      const droppedPinGroup = L.layerGroup().addTo(map);
      droppedPinLayerGroupRef.current = droppedPinGroup;

      const historyRouteGroup = L.layerGroup().addTo(map);
      historyRouteLayerGroupRef.current = historyRouteGroup;

      const trafficGroup = L.layerGroup().addTo(map);
      trafficLayerGroupRef.current = trafficGroup;

      mapInstanceRef.current = map;
      map.whenReady(() => {
        onMapReadyRef.current?.();
      });
    } else {
      onMapReadyRef.current?.();
    }

    // Touch & Pointer Long-press gesture listener on the container (500ms hold to drop pin)
    let pointerStartPos: { x: number; y: number } | null = null;
    let longPressTimer: any = null;

    const handlePointerDown = (e: TouchEvent | MouseEvent) => {
      const pt = 'touches' in e ? e.touches[0] : e;
      if (!pt) return;
      pointerStartPos = { x: pt.clientX, y: pt.clientY };
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        if (!pointerStartPos || !mapInstanceRef.current || !mapContainerRef.current) return;
        const rect = mapContainerRef.current.getBoundingClientRect();
        const containerPt = L.point(pointerStartPos.x - rect.left, pointerStartPos.y - rect.top);
        const latlng = mapInstanceRef.current.containerPointToLatLng(containerPt);
        if (latlng && typeof latlng.lat === "number" && typeof latlng.lng === "number") {
          longPressJustTriggeredRef.current = true;
          later(() => {
            longPressJustTriggeredRef.current = false;
          }, 600);
          onMapLongPressRef.current?.({ lat: latlng.lat, lng: latlng.lng }, { x: pointerStartPos.x, y: pointerStartPos.y });
        }
        pointerStartPos = null;
      }, 520);
    };

    const handlePointerMove = (e: TouchEvent | MouseEvent) => {
      if (!pointerStartPos) return;
      const pt = 'touches' in e ? e.touches[0] : e;
      if (!pt) return;
      const dist = Math.hypot(pt.clientX - pointerStartPos.x, pt.clientY - pointerStartPos.y);
      if (dist > 14) {
        if (longPressTimer) clearTimeout(longPressTimer);
        pointerStartPos = null;
      }
    };

    const handlePointerUp = () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      pointerStartPos = null;
    };

    const containerEl = mapContainerRef.current;
    if (containerEl) {
      containerEl.addEventListener("touchstart", handlePointerDown, { passive: true });
      containerEl.addEventListener("touchmove", handlePointerMove, { passive: true });
      containerEl.addEventListener("touchend", handlePointerUp, { passive: true });
      containerEl.addEventListener("touchcancel", handlePointerUp, { passive: true });
      containerEl.addEventListener("mousedown", handlePointerDown);
      containerEl.addEventListener("mousemove", handlePointerMove);
      containerEl.addEventListener("mouseup", handlePointerUp);
    }

    // ResizeObserver to ensure tiles render crisp when toggled from hidden to block
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      lifecycleTimers.forEach(timer => clearTimeout(timer));
      if (rafPanRef.current !== null) cancelAnimationFrame(rafPanRef.current);
      if (zoomRafRef.current !== null) cancelAnimationFrame(zoomRafRef.current);
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
      if (containerEl) {
        containerEl.removeEventListener("touchstart", handlePointerDown);
        containerEl.removeEventListener("touchmove", handlePointerMove);
        containerEl.removeEventListener("touchend", handlePointerUp);
        containerEl.removeEventListener("touchcancel", handlePointerUp);
        containerEl.removeEventListener("mousedown", handlePointerDown);
        containerEl.removeEventListener("mousemove", handlePointerMove);
        containerEl.removeEventListener("mouseup", handlePointerUp);
      }
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        tileLayerRef.current?.off();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      tileLayerRef.current = null;
      navRouteLayerGroupRef.current = null;
      stableFriendMarkersRef.current.clear();
      stayObservationsRef.current.clear();
    };
  }, []);

  // Keep Leaflet-owned container classes intact when React switches themes.
  useEffect(() => {
    mapInstanceRef.current?.getContainer().classList.toggle('dark-map', mapStyle === 'dark');
    const container = tileLayerRef.current?.getContainer();
    if (!container) return;
    container.classList.remove('stellar-tiles-dark','stellar-tiles-minimal');
    if (mapStyle === 'dark') container.classList.add('stellar-tiles-dark');
    if (mapStyle === 'minimal') container.classList.add('stellar-tiles-minimal');
  }, [mapStyle]);

  // Render Traffic Lines / Simulator
  useEffect(() => {
    const group = trafficLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (trafficEnabled) {
      // Lanzhou core main arteries simulated traffic line overlay
      const lines = [
        // Donggang W Rd / Qingyang Rd (Green - Smooth)
        {
          coords: [
            [36.059, 103.81],
            [36.0592, 103.8343],
            [36.0588, 103.865],
          ] as [number, number][],
          color: "#10b981",
          weight: 6,
          opacity: 0.85,
        },
        // Nanbinhe Middle Rd along Yellow River (Green - Smooth)
        {
          coords: [
            [36.068, 103.805],
            [36.0665, 103.818],
            [36.062, 103.84],
          ] as [number, number][],
          color: "#10b981",
          weight: 6,
          opacity: 0.85,
        },
        // Jingtai Rd / Guangchang E Rd (Yellow - Moderate)
        {
          coords: [
            [36.072, 103.834],
            [36.0592, 103.8343],
            [36.048, 103.8345],
          ] as [number, number][],
          color: "#f59e0b",
          weight: 6,
          opacity: 0.85,
        },
        // Zhongshan Bridge intersection (Red - Congested)
        {
          coords: [
            [36.066, 103.816],
            [36.0675, 103.82],
          ] as [number, number][],
          color: "#ef4444",
          weight: 7,
          opacity: 0.9,
        },
      ];

      lines.forEach((line) => {
        const polyline = L.polyline(line.coords, {
          color: line.color,
          weight: line.weight,
          opacity: line.opacity,
          lineCap: "round",
          lineJoin: "round",
        });
        polyline.addTo(group);
      });
    }
  }, [trafficEnabled]);

  // Navigation geometry belongs to its own persistent layer, separate from social markers.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = navRouteLayerGroupRef.current;
    if (!map || !group) return;
    group.clearLayers();
    if (!lifeRoute || lifeRoute.points.length < 2 || lifeRoute.points.some(([lat,lng]) => !validCoordinates({lat,lng}))) return;
    L.polyline(lifeRoute.points,{color:'#fff',weight:8,opacity:0.95,interactive:false}).addTo(group);
    L.polyline(lifeRoute.points,{color:'#1877F2',weight:4,opacity:0.95,dashArray:lifeRoute.estimated ? '7 8' : undefined,interactive:false}).addTo(group);
    [lifeRoute.points[0],lifeRoute.points[lifeRoute.points.length-1]].forEach(point => L.circleMarker(point,{radius:6,color:'#fff',weight:3,fillColor:'#1877F2',fillOpacity:1,interactive:false}).addTo(group));
    if (selectedFriendId) return;
    if (rafPanRef.current !== null) { cancelAnimationFrame(rafPanRef.current); rafPanRef.current = null; }
    map.stop();
    map.fitBounds(L.latLngBounds(lifeRoute.points),{paddingTopLeft:[48,100],paddingBottomRight:[48,180],maxZoom:16,animate:false});
  }, [lifeRoute]);

  // Render 24-Hour Location History Replay Polylines & Markers (Supports user 24h history and active friend 24h trajectory)
  useEffect(() => {
    const group = historyRouteLayerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    const isFriendReplay = Boolean(activeFriendTrajectoryPoints && activeFriendTrajectoryPoints.length > 0);
    const pointsToRender = isFriendReplay
      ? activeFriendTrajectoryPoints
      : (isHistoryReplayActive && historyTrajectoryPoints ? historyTrajectoryPoints : null);

    if (!pointsToRender || pointsToRender.length === 0) return;

    const selectedHour = isFriendReplay
      ? (activeFriendTrajectoryTimeHour ?? 24.0)
      : historySelectedTimeHour;

    // 1. Full 24h trajectory coordinates
    const fullCoords: [number, number][] = pointsToRender.map((pt) => [pt.lat, pt.lng]);

    // Trajectory Background Glow Line
    const fullPolyline = L.polyline(fullCoords, {
      color: isFriendReplay ? '#818CF8' : '#93C5FD',
      weight: 3.5,
      dashArray: '5, 6',
      opacity: 0.65,
    });
    fullPolyline.addTo(group);

    if (isFriendReplay) {
      // Calculate smooth interpolated position along trajectory for activeFriendTrajectoryTimeHour
      const interpolatedPos = interpolateFriendTrajectory(activeFriendTrajectoryPoints, selectedHour);

      // Traversed route coordinates up to interpolated position
      const traversedPoints = pointsToRender.filter((pt) => pt.timeHour <= selectedHour);
      
      // Use requestAnimationFrame to optimize rendering
      requestAnimationFrame(() => {
        for (let i = 0; i < traversedPoints.length; i++) {
          const p1 = traversedPoints[i];
          const p2 = (i === traversedPoints.length - 1) ? interpolatedPos : traversedPoints[i + 1];
          
          if (p1 && p2) {
            // Calculate gradient color
            const ratio = p1.timeHour / 24;
            const color = `hsl(217, 91%, ${60 - ratio * 30}%)`; // Gradient from light to dark blue
            
            L.polyline([ [p1.lat, p1.lng], [p2.lat, p2.lng] ], {
              color,
              weight: 6,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(group);
          }
        }
      });


      // Render Milestone / Stay Points along trajectory
      pointsToRender.forEach((pt, pIdx) => {
        const isReached = pt.timeHour <= selectedHour;
        const html = `
          <div class="relative cursor-pointer group -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto select-none">
            <div class="px-2 py-0.5 rounded-md text-[9px] font-black ${
              isReached ? 'bg-[#1877F2] text-white ring-1.5 ring-white shadow-xs' : 'bg-white text-gray-700 border border-[#E4E6EB] shadow-2xs'
            } whitespace-nowrap flex items-center space-x-1">
              <span>📍 ${pt.timeLabel.split(' ')[0]}</span>
              <span>${pt.locationName.split(' ')[0]?.slice(0, 4) || `节点${pIdx + 1}`}</span>
            </div>
          </div>
        `;
        const icon = L.divIcon({ html, className: 'custom-history-stay-icon', iconSize: [30, 20], iconAnchor: [15, 10] });
        L.marker([pt.lat, pt.lng], { icon, zIndexOffset: 850 }).addTo(group);
      });

      // Render Dynamic Moving Friend Avatar Marker at interpolated coordinates
      const friendAvatar = activeFriendTrajectoryFriend?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150';
      const friendName = activeFriendTrajectoryFriend?.name || '好友';

      const avatarHtml = `
        <div class="relative cursor-pointer group flex flex-col items-center select-none -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <!-- Top Floating Status Bubble in Facebook Straight-Edge Line Style -->
          <div class="mb-1 bg-white border border-[#E4E6EB] px-2.5 py-1 rounded-md shadow-md text-[#050505] whitespace-nowrap flex flex-col items-center leading-none">
            <div class="flex items-center space-x-1 font-bold text-[10.5px]">
              <span class="text-[#1877F2] font-black font-mono">${interpolatedPos.timeLabel}</span>
              <span>·</span>
              <span class="truncate max-w-[130px]">${interpolatedPos.locationName.split(' ')[0]}</span>
            </div>
            <div class="text-[9px] text-[#65676B] font-semibold mt-0.5 flex items-center space-x-1">
              <span>${interpolatedPos.speedKmh > 0 ? `${interpolatedPos.speedKmh} km/h` : '停留中'}</span>
              <span>${interpolatedPos.transportMode === 'car' ? '🚗' : interpolatedPos.transportMode === 'walking' ? '🚶' : interpolatedPos.transportMode === 'bicycle' ? '🚲' : '📍'}</span>
            </div>
          </div>

          <!-- Connecting Arrow Caret -->
          <div class="w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-white -mt-1 shadow-xs"></div>

          <!-- Pulsing Wave & High-Definition Avatar Frame -->
          <div class="relative flex items-center justify-center mt-0.5">
            <div class="absolute -inset-2.5 rounded-full bg-[#1877F2]/30 animate-ping pointer-events-none"></div>
            <div class="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white ring-2 ring-[#1877F2] shadow-xl bg-white">
              <img src="${friendAvatar}" alt="${friendName}" class="w-full h-full object-cover" />
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] border border-white shadow-2xs font-bold">
              ${interpolatedPos.transportMode === 'car' ? '🚗' : interpolatedPos.transportMode === 'walking' ? '🚶' : interpolatedPos.transportMode === 'bicycle' ? '🚲' : '📍'}
            </div>
          </div>
        </div>
      `;

      const avatarIcon = L.divIcon({
        html: avatarHtml,
        className: 'custom-trajectory-moving-avatar-marker',
        iconSize: [60, 60],
        iconAnchor: [30, 30],
      });

      L.marker([interpolatedPos.lat, interpolatedPos.lng], {
        icon: avatarIcon,
        zIndexOffset: 3500,
      }).addTo(group);

      // Pan map smoothly to track moving avatar (offset slightly downward in latitude to keep avatar in upper-middle viewport)
      const currentMapCenter = mapInstanceRef.current?.getCenter();
      const targetLat = interpolatedPos.lat - 0.0035;
      const targetLng = interpolatedPos.lng;
      if (
        !currentMapCenter ||
        Math.abs(currentMapCenter.lat - targetLat) > 0.0003 ||
        Math.abs(currentMapCenter.lng - targetLng) > 0.0003
      ) {
        mapInstanceRef.current?.panTo([targetLat, targetLng], {
          animate: true,
          duration: 0.2,
        });
      }

    } else {
      // User 24h History Replay
      const activePoints = pointsToRender.filter((pt) => pt.timeHour <= selectedHour);
      const activeCoords: [number, number][] = activePoints.map((pt) => [pt.lat, pt.lng]);

      if (activeCoords.length > 1) {
        const activePolyline = L.polyline(activeCoords, {
          color: '#1877F2',
          weight: 6,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        });
        activePolyline.addTo(group);

        const activeDashLine = L.polyline(activeCoords, {
          color: '#FFFFFF',
          weight: 2,
          dashArray: '6, 8',
          opacity: 0.9,
        });
        activeDashLine.addTo(group);
      }

      // Render Stay Points along trajectory
      pointsToRender.forEach((pt) => {
        if (pt.isStayPoint) {
          const isReached = pt.timeHour <= selectedHour;
          const html = `
            <div class="relative cursor-pointer group -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto">
              <div class="px-2 py-0.5 rounded-md text-[9.5px] font-black ${
                isReached ? 'bg-[#1877F2] text-white ring-1.5 ring-white shadow-2xs' : 'bg-white text-gray-700 border border-[#E4E6EB]'
              } whitespace-nowrap flex items-center space-x-1">
                <span>📍 ${pt.timeLabel}</span>
                <span>${pt.locationName.split(' ')[1] || pt.locationName.slice(0, 5)}</span>
              </div>
            </div>
          `;
          const icon = L.divIcon({ html, className: 'custom-history-stay-icon', iconSize: [30, 20], iconAnchor: [15, 10] });
          L.marker([pt.lat, pt.lng], { icon, zIndexOffset: 800 }).addTo(group);
        }
      });

      // Render Friend Trajectories if enabled
      if (showFriendTrajectories && historyFriendTrajectories) {
        historyFriendTrajectories.forEach((ft) => {
          const fCoords: [number, number][] = ft.points.map((p) => [p.lat, p.lng]);
          if (fCoords.length > 1) {
            const fPoly = L.polyline(fCoords, {
              color: ft.color || '#EC4899',
              weight: 4,
              dashArray: '6, 6',
              opacity: 0.85,
            });
            fPoly.addTo(group);

            ft.points.forEach((p) => {
              const fHtml = `
                <div class="relative cursor-pointer group -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div class="w-6 h-6 rounded-full ring-2 ring-white overflow-hidden shadow-xs border" style="border-color:${ft.color}">
                    <img src="${ft.avatar}" class="w-full h-full object-cover" />
                  </div>
                </div>
              `;
              const fIcon = L.divIcon({ html: fHtml, className: 'custom-friend-history-icon', iconSize: [24, 24], iconAnchor: [12, 12] });
              L.marker([p.lat, p.lng], { icon: fIcon, zIndexOffset: 750 }).addTo(group);
            });
          }
        });
      }

      // Pan map smoothly to active replay position (offset slightly downward in latitude to keep avatar in upper-middle viewport)
      if (activePoints.length > 0) {
        const currentPt = activePoints[activePoints.length - 1];
        mapInstanceRef.current?.panTo([currentPt.lat - 0.0075, currentPt.lng], { animate: true, duration: 0.3 });
      }
    }
  }, [
    isHistoryReplayActive,
    historyTrajectoryPoints,
    historySelectedTimeHour,
    showFriendTrajectories,
    historyFriendTrajectories,
    activeFriendTrajectoryPoints,
    activeFriendTrajectoryTimeHour,
    activeFriendTrajectoryFriend,
  ]);

  // Speed-based dynamic viewport adjustment (基于用户移动速度动态调整视野范围 15级 -> 14.2级)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (selectedFriendId || lifeRoute || navState) return;

    const currentSpeed = userTransportEvaluation?.smoothedSpeedKmh || 0;

    let targetZoom = 15.0; // 默认 15 级家庭守护舱视角
    if (currentSpeed > 5) {
      if (currentSpeed <= 15) {
        targetZoom = 14.7; // 低速步行/骑行
      } else if (currentSpeed <= 40) {
        targetZoom = 14.3; // 中速驾车
      } else {
        targetZoom = 13.8; // 高速行驶
      }
    }

    const currentZ = map.getZoom();
    if (Math.abs(currentZ - targetZoom) > 0.25) {
      map.setZoom(targetZoom, { animate: true });
    }
  }, [userTransportEvaluation?.smoothedSpeedKmh]);

  // Render User Marker & Individual Friend Custom HTML Markers
  useEffect(() => {
    const group = markersLayerGroupRef.current;
    if (!group) return;

    markersLayerGroupRef.current?.clearLayers();
    starsLayerGroupRef.current?.clearLayers();
    activitiesLayerGroupRef.current?.clearLayers();
    lifeLayerGroupRef.current?.clearLayers();
    trafficLayerGroupRef.current?.clearLayers();

    // Preserve avatar DOM while locations move so breathing and corner animations keep their phase.
    const visibleFriendIds = new Set<string>();
    const upsertFriendMarker = (id: string, lat: number, lng: number, icon: L.DivIcon, zIndex: number, title: string, onClick: (event: L.LeafletMouseEvent) => void) => {
      const friendGroup = friendsLayerGroupRef.current;
      if (!friendGroup) return;
      visibleFriendIds.add(id);
      const html = String(icon.options.html || '');
      const structuralHtml = html.replace(/(<(?:textPath|title)[^>]*data-stay-(?:copy|title)[^>]*>)[^<]*/g, '$1');
      let cached = stableFriendMarkersRef.current.get(id);
      if (!cached) {
        const marker = L.marker([lat, lng], { icon, title, zIndexOffset: zIndex }).addTo(friendGroup);
        cached = { marker, html:structuralHtml };
        stableFriendMarkersRef.current.set(id, cached);
      } else {
        if (cached.html !== structuralHtml) {
          cached.marker.setIcon(icon);
          cached.html = structuralHtml;
        }
        const previous = cached.marker.getLatLng();
        if (previous.lat !== lat || previous.lng !== lng) cached.marker.setLatLng([lat, lng]);
        cached.marker.setZIndexOffset(zIndex);
      }
      (cached.marker as any).stellarLayoutId = `friend:${id}`;
      cached.marker.off('click').on('click', (event: any) => {
        if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
        onClick(event);
      });
      const element = cached.marker.getElement();
      if (element && !(element as any).stellarGatheringKeyboardBound) {
        const preserveButtonKeyboard = (event: KeyboardEvent) => {
          if ((event.target as Element).closest(".stellar-gathering-person,.stellar-activity-more")) event.stopPropagation();
        };
        element.addEventListener("keydown", preserveButtonKeyboard);
        element.addEventListener("keypress", preserveButtonKeyboard);
        (element as any).stellarGatheringKeyboardBound = true;
      }
    };

    // Color contrast and bubble styling logic
    const mapTheme = noteTheme || 'pink';
    let bubbleBg = '';
    let bubbleText = '#ffffff';
    let isGrad = true;

    if (mapTheme.startsWith('#')) {
      bubbleBg = mapTheme;
      isGrad = false;
      const hex = mapTheme.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      if (yiq >= 180) {
        bubbleText = '#111827';
      } else {
        bubbleText = '#ffffff';
      }
    } else {
      if (mapTheme === 'white') {
        bubbleBg = 'white';
        bubbleText = '#111827';
        isGrad = false;
      } else if (mapTheme === 'pink') {
        bubbleBg = 'linear-gradient(to right, #ec4899, #d946ef, #f43f5e)';
      } else if (mapTheme === 'blue') {
        bubbleBg = 'linear-gradient(to right, #3b82f6, #4f46e5)';
      } else if (mapTheme === 'sunset') {
        bubbleBg = 'linear-gradient(to right, #f59e0b, #f97316)';
      } else {
        bubbleBg = 'linear-gradient(to right, #ec4899, #d946ef, #f43f5e)';
      }
    }

    const finalAvatar = userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';

    const isUserAtHome = (customMarkers || []).some(m => (m.isHome || m.icon === '🏠' || m.icon === '🏡') && calculateLatLngDistanceMeters(userLocation.lat, userLocation.lng, m.lat, m.lng) <= 25);
    const showSleep = isUserAtHome && isPhoneInactive;
    const currentMode = userTransportEvaluation?.displayMode;
    const currentSpeed = userTransportEvaluation?.smoothedSpeedKmh;
    const ownFriend: Friend = {
      ...CURRENT_USER_PROFILE,
      avatar: finalAvatar, lat: userLocation.lat, lng: userLocation.lng,
      statusNote: userNote || CURRENT_USER_PROFILE.status,
      activityState: showSleep ? 'sleeping' : currentMode && currentMode !== 'stationary' && currentMode !== 'unknown' ? 'moving' : 'idle',
      speed: typeof currentSpeed === 'number' ? `${currentSpeed} km/h` : '0 km/h',
      transportMode: currentMode || 'stationary',
    };
    const userIconHtml = renderFriendMarker(ownFriend, {
      selected: false, distant: false, bouncing: false, hasUnread: false,
      showBubble: true, reactions: [], staySeconds:getStaySeconds(ownFriend),
      note: {
        text: isStealthMode ? '幽灵模式已开启' : userNote || '随时在线守护中',
        emoji: isStealthMode ? '👻' : attachedEmoji || '😜',
        gradient: isStealthMode ? '#581c87' : bubbleBg,
        tail: isStealthMode ? '#581c87' : isGrad ? '#d946ef' : bubbleBg,
        color: isStealthMode ? '#f3e8ff' : bubbleText,
      },
    }).replace('class="stellar-friend-marker', `class="stellar-friend-marker is-me ${isStealthMode ? 'is-stealth' : ''}`);
    const userLayout = friendMarkerLayout(false);
    const userIcon = L.divIcon({
      html: userIconHtml,
      className: "custom-leaflet-marker",
      iconSize: userLayout.size,
      iconAnchor: userLayout.anchor,
    });

    // Route progress never changes the source location; live coordinates own avatar positions.
    const userMarkerLat = userLocation.lat;
    const userMarkerLng = userLocation.lng;
    const gatheredLovers = nearbyLovers(ownFriend, friends, activeFilters,
      Boolean(selectedFriendId || navState || lifeRoute || isHistoryReplayActive || activeFriendTrajectoryPoints?.length),
      isStealthMode || hideAllFriendMarkers);
    const gatheredLoverIds = new Set(gatheredLovers.map(friend => friend.id));
    const openOwnMarker = () => {
      centerAvatarOnMap(userMarkerLat, userMarkerLng, false);
      if (onOpenUserTransportCard) {
        onOpenUserTransportCard();
      } else {
        alert(isStealthMode ? "当前已开启隐身模式：您的实时位置已向好友与密友屏蔽" : "这是您当前的位置：兰州市城关区 东方红广场");
      }
    };
    if (gatheredLovers.length) {
      const icon = L.divIcon({ html: renderCoupleGathering(ownFriend, gatheredLovers), className: 'custom-leaflet-marker',
        iconSize: COUPLE_GATHERING_LAYOUT.size, iconAnchor: COUPLE_GATHERING_LAYOUT.anchor });
      upsertFriendMarker('me', userMarkerLat, userMarkerLng, icon, 1250, '与恋人相聚', event => {
        const id = gatheringTargetId(event.originalEvent?.target || null);
        if (id === ownFriend.id) openOwnMarker();
        else onSelectFriendRef.current(gatheredLovers.find(friend => friend.id === id) || gatheredLovers[0]);
      });
    } else if (!selectedFriendId || lifeRoute || navState) {
      upsertFriendMarker('me', userMarkerLat, userMarkerLng, userIcon, 1200, ownFriend.name, openOwnMarker);
    }

    // 1.5 Render Family Guardian Geofence Circle when Family Layer is active
    const isFamilyLayerActive = showAll || activeFilters.includes('family');
    if (isFamilyLayerActive) {
      const familyCenter: [number, number] = [36.0592, 103.8420];
      const familyCircle = L.circle(familyCenter, {
        radius: 1200,
        color: '#10B981',
        weight: 1.5,
        dashArray: '6, 6',
        fillColor: '#10B981',
        fillOpacity: 0.08,
        interactive: false,
      });
      familyCircle.addTo(group);

      const fenceDivIcon = L.divIcon({
        html: `
          <div class="px-2.5 py-1 bg-white dark:bg-zinc-800 text-[#10B981] border border-[#10B981]/40 rounded-md shadow-2xs text-[10px] font-bold flex items-center gap-1 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
            <span>🛡️</span>
            <span>家庭安全守护范围 (1.2km)</span>
          </div>
        `,
        className: 'custom-leaflet-marker',
        iconSize: [160, 24],
        iconAnchor: [80, 12],
      });
      L.marker([36.0592 + 0.010, 103.8420], { icon: fenceDivIcon, zIndexOffset: 400 }).addTo(group);
    }

    // 1.6 Render Squad Tactical Rally Point when Squads Layer is active
    const isSquadLayerActive = showAll || activeFilters.includes('squads');
    if (isSquadLayerActive) {
      const squadCenter: [number, number] = [36.0665, 103.8285];
      const squadCircle = L.circle(squadCenter, {
        radius: 400,
        color: '#6366F1',
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: '#6366F1',
        fillOpacity: 0.1,
        interactive: false,
      });
      squadCircle.addTo(group);

      const squadDivIcon = L.divIcon({
        html: `
          <div class="px-2.5 py-1 bg-white dark:bg-zinc-800 text-[#6366F1] border border-[#6366F1]/40 rounded-md shadow-2xs text-[10px] font-bold flex items-center gap-1 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
            <span>🚩</span>
            <span>先锋探索小队 · 1号集结点</span>
          </div>
        `,
        className: 'custom-leaflet-marker',
        iconSize: [170, 24],
        iconAnchor: [85, 12],
      });
      L.marker(squadCenter, { icon: squadDivIcon, zIndexOffset: 420 }).addTo(group);
    }

    // Every friend keeps its own coordinate; any separation is a screen-space offset below.
    friends.forEach((friend) => {
      if (!validCoordinates(friend) || hideAllFriendMarkers || gatheredLoverIds.has(friend.id)) return;
      const isNavigatingThis = Boolean(navState && (navState.friend?.id === friend.id || navState.friendId === friend.id));
      if (selectedFriendId && friend.id !== selectedFriendId && !isNavigatingThis) return;
      if (!friendMatchesMapFilters(friend, friend.id === selectedFriendId || isNavigatingThis ? ['all'] : activeFilters)) return;
      const isLover = friend.relationship === 'lover' || friend.isLover === true;
      const isClose = (friend.relationship === 'close' || friend.isCloseFriend) && !isLover;
      const isFamily = (friend.relationship === 'family' || friend.isFamily || friend.id.startsWith('fam-')) && !isLover;
      const conv = conversations?.find((c) => c.friendId === friend.id);
      const hasUnread = Boolean(conv && conv.unreadCount > 0);
      const markerLat = friend.lat;
      const markerLng = friend.lng;
      const isSelected = selectedFriendId === friend.id;
      const isDistant = mapZoom < 11 && !isSelected;
      const layout = friendMarkerLayout(isSelected);
      const icon = L.divIcon({
        html: renderFriendMarker(friend, {
          selected: isSelected, distant: isDistant, bouncing: bouncingFriendId === friend.id,
          hasUnread, unreadMsg: hasUnread ? conv?.lastMessage : null, showBubble: !isDistant,
          reactions: mapZoom >= 10 ? activeFriendBubbles.filter(item => item.friendId === friend.id) : [],
          staySeconds: getStaySeconds(friend),
        }),
        className: 'custom-leaflet-marker', iconSize: layout.size, iconAnchor: layout.anchor,
      });
      upsertFriendMarker(friend.id, markerLat, markerLng, icon,
        isSelected ? 3500 : isNavigatingThis ? 3000 : isClose ? 850 : isFamily ? 650 : 500,
        friend.name, () => onSelectFriendRef.current(friend));
    });

    // 3. Render Real-Time Live Location Sharing Markers with Smooth requestAnimationFrame Interpolation (Friends Layer)
    const isLiveShareEnabled = showAll || activeFilters.includes('friends');
    if (isLiveShareEnabled && liveLocationShares && liveLocationShares.length > 0) {
      liveLocationShares.forEach((share) => {
        const shareId = share.id || share.userId || "live-share";
        const prevPos = prevLivePositionsRef.current.get(shareId);

        const remainingMinutes = Math.max(
          1,
          Math.round((share.expiresAt - Date.now()) / (60 * 1000)),
        );

        const liveIconHtml = `
          <div class="relative cursor-pointer group -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <!-- Live Info Speech Bubble -->
            <div class="absolute -top-10 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap px-3 py-1 rounded-2xl text-[11px] font-extrabold bg-emerald-600 text-white border border-emerald-300 flex items-center space-x-1.5 animate-bounce-in">
              <span class="w-2 h-2 rounded-full bg-white"></span>
              <span>${share.userName || "用户"} · 实时共享</span>
              <span class="bg-black/25 px-1.5 py-0.5 rounded-full text-[9.5px]">剩 ${remainingMinutes} 分钟</span>
            </div>

            <!-- Avatar Container with emerald ring -->
            <div class="relative z-20">
              <div class="w-13 h-13 rounded-full bg-white ring-4 ring-emerald-500 overflow-hidden flex items-center justify-center">
                <img
                  src="${share.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}"
                  alt="${share.userName || "Live User"}"
                  class="w-full h-full object-cover block"
                  style="width: 100%; height: 100%; object-fit: cover; display: block;"
                />
              </div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
                📍
              </div>
              <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-emerald-600"></div>
            </div>

            <!-- Location Name Tag -->
            <div class="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-800 border border-emerald-200 whitespace-nowrap">
              ${share.locationName || "实时位置"}
            </div>
          </div>
        `;

        const liveIcon = L.divIcon({
          html: liveIconHtml,
          className: "custom-leaflet-live-marker",
          iconSize: [52, 52],
          iconAnchor: [26, 26],
        });

        // Determine starting position for smooth interpolation
        let startLat = share.lat;
        let startLng = share.lng;
        const needsInterpolation = Boolean(
          prevPos && (prevPos.lat !== share.lat || prevPos.lng !== share.lng)
        );

        if (needsInterpolation && prevPos) {
          startLat = prevPos.lat;
          startLng = prevPos.lng;
        }

        const liveMarker = L.marker([startLat, startLng], {
          icon: liveIcon,
          zIndexOffset: 1200,
        });

        const livePopupEl = document.createElement("div");
        livePopupEl.className = "p-2 min-w-[170px] text-center font-sans select-none";
        livePopupEl.innerHTML = `
          <div class="font-bold text-xs text-[#050505] mb-0.5">${share.userName || "用户"} · 实时共享</div>
          <div class="text-[10.5px] text-gray-500 mb-2">${share.locationName || "实时位置"}</div>
          <button class="remove-live-share-btn w-full py-1.5 px-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 border border-rose-200 rounded text-[11px] font-bold cursor-pointer transition-all shadow-2xs">
            结束并去除共享位置
          </button>
        `;
        livePopupEl.querySelector(".remove-live-share-btn")?.addEventListener("click", () => {
          if (onRemoveLiveLocationShare) {
            onRemoveLiveLocationShare(share.id || share.userId);
          }
          mapInstanceRef.current?.closePopup();
        });
        liveMarker.bindPopup(livePopupEl, { offset: [0, -24] });

        liveMarker.on("click", (e: any) => {
          if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
          mapInstanceRef.current?.flyTo([share.lat, share.lng], 16, {
            duration: 0.8,
          });
        });

        liveMarker.addTo(group);

        // Perform requestAnimationFrame position interpolation when target changes
        if (needsInterpolation && prevPos) {
          const endLat = share.lat;
          const endLng = share.lng;
          const startTime = performance.now();
          const duration = 1200; // 1.2s smooth glide animation

          const animatePosition = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic curve
            const ease = 1 - Math.pow(1 - progress, 3);

            const currentLat = startLat + (endLat - startLat) * ease;
            const currentLng = startLng + (endLng - startLng) * ease;

            liveMarker.setLatLng([currentLat, currentLng]);

            if (progress < 1) {
              requestAnimationFrame(animatePosition);
            }
          };

          requestAnimationFrame(animatePosition);
        }

        // Cache position for next frame comparison
        prevLivePositionsRef.current.set(shareId, { lat: share.lat, lng: share.lng });
      });
    }

    // 4. Activity markers and the selected activity's places and participants.
    const renderedActivityIds = new Set<string>();
    const hasUserPublishedActivity = dispersedData.dispersedActivities && dispersedData.dispersedActivities.some(a => a.isUserPublished);
    const isActLayerEnabled = Boolean(selectedActivityId) || showAll || activeFilters.includes('activities');
    const actReveal = getLayerRevealConfig('activities', mapZoom);
    if (isActLayerEnabled && (selectedActivityId || actReveal.mode !== 'hidden')) {
      const activitiesTargetGroup = activitiesLayerGroupRef.current || group;
      if (dispersedData.dispersedActivities && dispersedData.dispersedActivities.length > 0) {
        dispersedData.dispersedActivities.forEach((activity) => {
            const isAlexiaActivity = activity.isUserPublished || (activity as any).authorName?.includes('Alexia') || activity.participants?.some(p => p.relationshipLabel?.includes('发起人'));
            const cleanTitle = activity.title.replace(/^【[^】]+】\s*/, '').trim();
            const activityTime = [activity.dateStr || activity.date, activity.timeRange || [activity.startTime, activity.endTime].filter(Boolean).join('–')].filter(Boolean).join(' ');
            const arrivedMembers = activityArrivalMembers(activity);
            const gatheringLocation = activityGatheringLocation(activity, arrivedMembers);
            const arrivedMemberIds = new Set(arrivedMembers.map(member => member.id));
            const confirmedMembers = activity.participants.filter(member => member.invitationStatus === 'confirmed');
            const allParticipantsArrived = confirmedMembers.length > 0 && arrivedMembers.length === confirmedMembers.length;
            const detail = allParticipantsArrived ? `已到齐 · ${activity.participants?.length || 0} 人` : activityTime;
            const activityPinHtml = addActivityGathering(renderLifeEventMarker(
              activity.icon || '🎯', cleanTitle,
              activity.description || activity.locationName, detail, allParticipantsArrived
            ), activity, arrivedMembers);
            const markerSize: [number, number] = [150, 155];
            const markerAnchor: [number, number] = [75, 149];

            const activityDivIcon = L.divIcon({
              html: activityPinHtml,
              className: allParticipantsArrived ? "custom-leaflet-activity-aggregation-marker" : "custom-leaflet-activity-marker",
              iconSize: markerSize,
              iconAnchor: markerAnchor,
            });

            // Reuse the persistent social-marker layer so activity atmosphere does not restart on data refresh.
            upsertFriendMarker(`activity:${activity.id}`, gatheringLocation.lat, gatheringLocation.lng, activityDivIcon,
              isAlexiaActivity || allParticipantsArrived ? 2300 : 1500, activity.title, event => {
                const memberId = gatheringTargetId(event.originalEvent?.target || null);
                const member = arrivedMembers.find(person => person.id === memberId);
                if (member && onSelectActivityParticipant) {
                  onSelectActivityParticipant(activity, member);
                  return;
                }
                mapInstanceRef.current?.flyTo([gatheringLocation.lat, gatheringLocation.lng], 15.5, {
                  animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
                  duration: 0.65,
                });
                if (allParticipantsArrived) soundEffects.playConvergenceSound();
                else soundEffects.playTapSound();
                onSelectActivity?.(activity);
              });
            renderedActivityIds.add(activity.id);

            // Render Activity Scope Radius Circle (e.g. 500m radius for Yellow River Explore)
            if (activity.radiusMeters) {
              const radiusCircle = L.circle([activity.lat, activity.lng], {
                radius: activity.radiusMeters,
                color: activity.color || '#1877F2',
                weight: 2,
                dashArray: '6, 6',
                fillColor: activity.color || '#1877F2',
                fillOpacity: 0.08,
                interactive: false,
              });
              radiusCircle.addTo(activitiesTargetGroup);
            }

            if (activity.id === selectedActivityId) {
              const routeNodes = (activity.routeNodes || []).filter(validCoordinates);
              const venue = activity.venueLocation && validCoordinates(activity.venueLocation)
                ? activity.venueLocation : { name: activity.locationName || activity.title, lat: activity.lat, lng: activity.lng };
              const places = [
                ...(activity.originLocation && validCoordinates(activity.originLocation) ? [{...activity.originLocation, label:'集合点', icon:'📍'}] : []),
                ...routeNodes.map((node, index) => ({...node, label:node.status === 'next' || node.name === activity.nextNode ? '下一站' : `途经 ${index + 1}`, icon:node.status === 'next' ? '🚩' : '•'})),
                {...venue, label:'终点', icon:'🏁'},
              ].filter((place, index, points) => index === 0 || place.lat !== points[index - 1].lat || place.lng !== points[index - 1].lng);
              places[places.length - 1] = {...venue, label:places.length === 1 && activity.originLocation && validCoordinates(activity.originLocation) ? '集合 / 终点' : '终点', icon:'🏁'};
              if (places.length > 1) {
                L.polyline(places.map(place => [place.lat,place.lng] as [number,number]), {
                  color: activity.color || '#1877F2', weight:3, opacity:.75, dashArray:'7, 9', lineCap:'round',
                }).bindTooltip('计划路线示意 · 点击活动卡查看真实道路导航', {permanent:true, direction:'center', opacity:.9}).addTo(activitiesTargetGroup);
              }
              places.forEach(place => {
                L.circleMarker([place.lat,place.lng], {radius:5,color:'#fff',weight:2,fillColor:activity.color || '#1877F2',fillOpacity:1,interactive:false}).addTo(activitiesTargetGroup);
                const icon = L.divIcon({
                  html:`<div style="display:flex;align-items:center;gap:5px;width:max-content;max-width:150px;padding:6px 9px;background:${mapStyle === 'dark' ? '#202838' : '#fff'};color:${mapStyle === 'dark' ? '#f8fafc' : '#172033'};border:1px solid ${mapStyle === 'dark' ? '#536078' : '#dce5ef'};border-radius:12px;box-shadow:0 3px 10px #10203a24;font:700 11px system-ui"><span>${place.icon}</span><span>${place.label} · ${escapeMarkerText(place.name)}</span></div>`,
                  className:'custom-leaflet-activity-waypoint', iconSize:[150,30], iconAnchor:[75,-5],
                });
                L.marker([place.lat,place.lng], {icon, title:`活动地点：${place.label} · ${place.name}`, zIndexOffset:2400})
                  .on('click', (event: any) => { if(event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent); onSelectActivity?.(activity); })
                  .addTo(activitiesTargetGroup);
              });
              (activity.needs || []).filter(validCoordinates).forEach(need => {
                const appearance = need.status === 'resolved' ? {icon:'✅',label:'已解决',color:'#16a36b'}
                  : need.status === 'claimed' ? {icon:'🤝',label:'协助中',color:'#9361e8'} : {icon:'💬',label:'需要帮助',color:'#ed8a28'};
                const icon = L.divIcon({
                  html:`<div data-activity-need="${escapeMarkerText(need.id)}" style="display:flex;align-items:center;gap:7px;height:48px;padding:6px 9px;background:${mapStyle === 'dark' ? '#202838' : '#fff'};color:${mapStyle === 'dark' ? '#f8fafc' : '#172033'};border:2px solid ${appearance.color};border-radius:14px;box-shadow:0 4px 12px #10203a26;font:700 11px system-ui"><span style="font-size:25px">${appearance.icon}</span><div style="min-width:0"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeMarkerText(need.title)}</div><span style="font-size:9px;color:${appearance.color}">${appearance.label}${need.helperName ? ` · ${escapeMarkerText(need.helperName)}` : ''}</span></div></div><div style="width:0;height:0;margin:auto;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${appearance.color}"></div>`,
                  className:'custom-leaflet-activity-need', iconSize:[156,54], iconAnchor:[78,54],
                });
                L.marker([need.lat,need.lng], {icon, title:`活动需求：${need.title}`, zIndexOffset:2600})
                  .on('click', (event: any) => { if(event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent); onSelectActivity?.(activity); })
                  .addTo(activitiesTargetGroup);
              });
              (activity.moments || []).filter(moment => validCoordinates(moment) && Boolean(moment.url)).forEach(moment => {
                const icon = L.divIcon({
                  html:`<div data-activity-moment="${escapeMarkerText(moment.id)}" style="height:54px;width:58px;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px #10203a40;background:${mapStyle === 'dark' ? '#202838' : '#fff'}"><img src="${escapeMarkerText(moment.url)}" alt="${escapeMarkerText(moment.caption || '活动照片')}" style="width:100%;height:100%;object-fit:cover"/></div><div style="width:0;height:0;margin:auto;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${mapStyle === 'dark' ? '#202838' : '#fff'}"></div>`,
                  className:'custom-leaflet-activity-moment', iconSize:[58,60], iconAnchor:[29,60],
                });
                L.marker([moment.lat,moment.lng], {icon, title:moment.caption || '活动照片', zIndexOffset:2500})
                  .bindTooltip(escapeMarkerText(moment.caption || '活动照片'))
                  .on('click', (event: any) => { if(event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent); onSelectActivity?.(activity); })
                  .addTo(activitiesTargetGroup);
              });
            }

            // Render Group Authorized Geofence Circle
            if (activity.isGroupActivity && activity.authorizedScope?.geofenceRadiusKm) {
              const geofenceCircle = L.circle([activity.lat, activity.lng], {
                radius: (activity.authorizedScope.geofenceRadiusKm || 2.5) * 1000,
                color: '#1877F2',
                weight: 1.5,
                dashArray: '6, 6',
                fillColor: '#1877F2',
                fillOpacity: 0.05,
                interactive: false,
              });
              geofenceCircle.addTo(activitiesTargetGroup);
            }

            // Render In-Transit Friends & Trajectory Polylines towards venue
            // Note: If activity is completed, do not render real-time trajectories or in-transit avatars (Requirement 12)
            if (activity.id === selectedActivityId && activity.status !== 'completed') {
              activity.participants.forEach((p) => {
                // Privacy check: If location is not authorized, do not display exact position or routes (Requirement 11)
                if (p.isLocationAuthorized === false || arrivedMemberIds.has(p.id)) return;

                const showRoute = activity.showNavRoutesAndSpeed !== false;
                const isGroupMemberVisible = activity.isGroupActivity;

                if (
                  ((p.status === "on_the_way" || p.status === "departed" || p.status === "arrived") || isGroupMemberVisible) &&
                  activity.showLocationAndDistance !== false &&
                  validCoordinates({lat:p.currentLat,lng:p.currentLng}) &&
                  (p.currentLat !== activity.lat || p.currentLng !== activity.lng)
                ) {
                // 1. Draw multi-point historical trajectory if available
                if (p.trajectoryHistory && p.trajectoryHistory.length > 1) {
                  const histPoints: [number, number][] = p.trajectoryHistory.filter(validCoordinates).map(th => [th.lat, th.lng]);
                  // Connect to current location
                  histPoints.push([p.currentLat, p.currentLng]);
                  const histPolyline = L.polyline(
                    histPoints,
                    {
                      color: '#1877F2',
                      weight: 3.5,
                      opacity: 0.9,
                      dashArray: '4, 4',
                      lineCap: 'round',
                    }
                  );
                  histPolyline.bindTooltip('已记录的位置轨迹 · 非实时路况').addTo(activitiesTargetGroup);
                }

                // A direction guide only; actual road navigation is handled by useMapNavigation.
                if (showRoute) {
                  const polyline = L.polyline(
                    [[p.currentLat!, p.currentLng!], [activity.lat, activity.lng]],
                    {
                      color: activity.color || "#1877F2",
                      weight: 3.5,
                      opacity: 0.85,
                      dashArray: "8, 8",
                      lineCap: "round",
                    }
                  );
                  polyline.bindTooltip('前往方向示意 · 非道路路线').addTo(activitiesTargetGroup);
                }

                const relationBadge = p.relationship ? `
                  <span class="px-1 py-0.2 rounded text-[7.5px] font-black ${
                    p.relationship.includes('密友')
                      ? 'bg-rose-500 text-white'
                      : p.relationship.includes('家人')
                      ? 'bg-amber-500 text-white'
                      : 'bg-[#1877F2] text-white'
                  }">
                    ${p.relationship}
                  </span>
                ` : '';

                const groupRoleBadge = p.groupRole ? `
                  <span class="px-1.5 py-0.5 rounded-xs text-[8px] font-bold ${
                    p.groupRole === 'admin'
                      ? 'bg-amber-500 text-white'
                      : p.groupRole === 'core'
                      ? 'bg-[#1877F2] text-white'
                      : 'bg-gray-600 text-white'
                  }">
                    ${p.groupRole === 'admin' ? '👑 管理员' : p.groupRole === 'core' ? '⭐ 核心' : '组员'}
                  </span>
                ` : '';

                const batteryBadge = p.batteryLevel ? `
                  <span class="text-[8px] opacity-90 text-white">🔋${p.batteryLevel}%</span>
                ` : '';

                const speedText = Number.isFinite(p.speedKmh) ? `${p.speedKmh} km/h` : '';
                const distText = Number.isFinite(p.distanceMeters) ? `${(p.distanceMeters! / 1000).toFixed(1)} km` : (p.distanceText || '');
                const etaText = p.estimatedArrivalTime || p.statusText || '赶往中';

                const transitIconHtml = `
                  <div class="relative cursor-pointer group w-[70px] h-[64px] flex flex-col items-center justify-center select-none"
                       style="transform: scale(${actReveal.scale}); opacity: ${actReveal.opacity}; transition: transform 0.3s ease, opacity 0.3s ease;">
                    <div class="mb-1 whitespace-nowrap px-2 py-0.5 rounded-md text-[9px] font-extrabold text-white shadow-md flex items-center space-x-1.5 border border-white/40"
                         style="background-color: ${activity.color || '#1877F2'};">
                      ${groupRoleBadge}
                      <span>${p.transport === "car" ? "🚗" : p.transport === "bike" ? "🚴" : "🚶"}</span>
                      ${speedText ? `<span>${speedText}</span>` : ''}
                      ${speedText && distText ? '<span class="opacity-70">|</span>' : ''}
                      ${distText ? `<span>${escapeMarkerText(distText)}</span>` : ''}
                      ${batteryBadge}
                    </div>

                    <div class="relative">
                      ${p.transport === "car" ? `
                        <div class="relative flex items-center justify-center p-1 hover:scale-110 transition-transform">
                          <span class="text-4xl">🚗</span>
                          <div class="absolute -top-1 -right-1 w-6 h-6 rounded-full overflow-hidden border border-white shadow-md bg-white">
                            <img src="${p.avatar}" alt="${p.name}" class="w-full h-full object-cover rounded-full" />
                          </div>
                        </div>
                      ` : p.transport === "bike" ? `
                        <div class="relative flex items-center justify-center p-1 hover:scale-110 transition-transform">
                          <span class="text-3xl">🚴</span>
                          <div class="absolute -top-1 -right-1 w-6 h-6 rounded-full overflow-hidden border border-white shadow-md bg-white">
                            <img src="${p.avatar}" alt="${p.name}" class="w-full h-full object-cover rounded-full" />
                          </div>
                        </div>
                      ` : `
                        <div class="relative">
                          <div class="w-10 h-10 rounded-full p-0.5 bg-white shadow-xl ring-2 overflow-hidden"
                               style="ring-color: ${activity.color || '#1877F2'};">
                            <img src="${p.avatar}" alt="${p.name}" class="w-full h-full rounded-full object-cover" />
                          </div>
                          <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[9px]">
                            🚶
                          </div>
                        </div>
                      `}
                    </div>

                    <div class="mt-0.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white shadow-sm border-0 whitespace-nowrap flex items-center space-x-1">
                      <span>${p.name.split(" ")[0]}</span>
                      <span class="text-emerald-400 text-[7.5px] font-medium ml-0.5">${p.statusText || '靠近中'}</span>
                      ${relationBadge}
                    </div>
                  </div>
                `;

                const transitDivIcon = L.divIcon({
                  html: transitIconHtml,
                  className: "custom-leaflet-transit-marker",
                  iconSize: [70, 64],
                  iconAnchor: [35, 32],
                });

                const transitMarker = L.marker([p.currentLat, p.currentLng], {
                  icon: transitDivIcon,
                  zIndexOffset: 1100,
                });

                transitMarker.on("click", (e: any) => {
                  if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
                  if (onSelectActivityParticipant) {
                    onSelectActivityParticipant(activity, p);
                  } else {
                    onSelectActivity?.(activity);
                  }
                });

              }
            });
          }
        });
      }
    }

    // 5. Render Star Cards (星片 - 归属于 'stars' 星片专属图层)
    const starReveal = getLayerRevealConfig('stars', mapZoom);
    const { dispersedStarCards } = dispersedData;
    const isStarCardsEnabled = (showAll || activeFilters.includes('stars')) && starReveal.mode !== 'hidden';
    if (isStarCardsEnabled) {
      const starsTargetGroup = starsLayerGroupRef.current || group;
      if (dispersedStarCards && dispersedStarCards.length > 0) {
        dispersedStarCards.forEach((card, idx) => {
            const cLat = card.lat;
            const cLng = card.lng;
            const staggerDelay = idx * 0.05;

            if (starReveal.mode === 'small') {
              // Small Icon stage for Starred Places
              const smallStarHtml = `
                <div class="star-small-pin cursor-pointer group w-[80px] h-[32px] flex items-center justify-center select-none"
                     style="transform: scale(${starReveal.scale}); opacity: ${starReveal.opacity}; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease; transition-delay: ${staggerDelay}s;">
                  <div class="px-2 py-1 bg-white text-[#1877F2] font-black text-[9.5px] rounded-md border border-[#E4E6EB] flex items-center space-x-1 hover:scale-110 transition-transform shadow-xs">
                    <span class="text-xs">★</span>
                    <span class="truncate max-w-[65px]">${escapeMarkerText(card.location || '星片')}</span>
                  </div>
                </div>
              `;
              const smallStarDivIcon = L.divIcon({
                html: smallStarHtml,
                className: 'custom-leaflet-star-small-marker',
                iconSize: [80, 32],
                iconAnchor: [40, 16],
              });
              const smallStarMarker = L.marker([cLat, cLng], { icon: smallStarDivIcon, zIndexOffset: 1350 });
              (smallStarMarker as any).stellarLayoutId = `star:${card.id}`;
              smallStarMarker.on('click', (e: any) => {
                if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
                mapInstanceRef.current?.flyTo([cLat, cLng], 14.5, { duration: 0.8 });
                onSelectStarCard?.(card);
              });
              smallStarMarker.addTo(starsTargetGroup);
            } else {
              // Frameless standing photo card; the tip stays anchored to the actual coordinate.
              const starCardHtml = renderStarCardMarker(card, starReveal.scale, starReveal.opacity, staggerDelay);
              const starIcon = L.divIcon({
                html: starCardHtml,
                className: "custom-leaflet-star-card-marker",
                iconSize: [STAR_CARD_MAP_SIZE.width, STAR_CARD_MAP_SIZE.height],
                iconAnchor: [STAR_CARD_MAP_SIZE.width / 2, STAR_CARD_MAP_SIZE.height],
              });

              const starMarker = L.marker([cLat, cLng], {
                icon: starIcon,
                zIndexOffset: 1150,
              });

              (starMarker as any).stellarLayoutId = `star:${card.id}`;
              starMarker.on("click", (e: any) => {
                if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
                onSelectStarCard?.(card);
              });

              starMarker.addTo(starsTargetGroup);
            }
          });
        }
      }

    // 6. Render Custom User Markers ("我的标记", 归属于 'life' 生活图层地图坐标)
    const lifeReveal = getLayerRevealConfig('life', mapZoom);
    const isCustomMarkersEnabled = (showAll || activeFilters.includes('places') || activeFilters.includes('life') || activeFilters.includes('life_layer')) && lifeReveal.mode !== 'hidden';
    if (isCustomMarkersEnabled) {
      const lifeTargetGroup = lifeLayerGroupRef.current || group;
      if (dispersedData.dispersedCustomMarkers && dispersedData.dispersedCustomMarkers.length > 0) {
        dispersedData.dispersedCustomMarkers.forEach((marker, idx) => {
          const isSelected = selectedCustomMarkerId === marker.id;
          const markerHtml = renderPlaceMarker({
            id: marker.id, name: marker.title, icon: marker.icon,
            selected: isSelected,
            delay: idx * 0.05, scale: lifeReveal.scale, opacity: lifeReveal.opacity,
          });
          const customDivIcon = L.divIcon({
            html: markerHtml,
            className: "custom-leaflet-my-marker",
            iconSize: [PLACE_MARKER_MAP_SIZE.width, PLACE_MARKER_MAP_SIZE.height],
            iconAnchor: [PLACE_MARKER_MAP_SIZE.width / 2, PLACE_MARKER_MAP_SIZE.height / 2],
          });

          const customLMarker = L.marker([marker.lat, marker.lng], {
            icon: customDivIcon,
            title: marker.title,
            zIndexOffset: isSelected ? 1500 : 950,
          });

          customLMarker.on("click", (e: any) => {
            if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            onSelectCustomMarker?.(marker);
          });

          customLMarker.on("contextmenu", (e: any) => {
            if (e.originalEvent) {
              e.originalEvent.preventDefault();
              e.originalEvent.stopPropagation();
            }
            onLongPressCustomMarker?.(marker, {
              x: e.originalEvent?.clientX || window.innerWidth / 2,
              y: e.originalEvent?.clientY || window.innerHeight / 2,
            });
          });

          // Touch long-press support
          let touchTimer: any = null;
          customLMarker.on("add", () => {
            const el = customLMarker.getElement();
            if (el) {
              const handleTouchStart = (e: TouchEvent) => {
                const touch = e.touches[0];
                const clientX = touch.clientX;
                const clientY = touch.clientY;
                touchTimer = setTimeout(() => {
                  onLongPressCustomMarker?.(marker, { x: clientX, y: clientY });
                }, 400);
              };

              const handleTouchEnd = () => {
                if (touchTimer) clearTimeout(touchTimer);
              };

              el.addEventListener("touchstart", handleTouchStart, { passive: true });
              el.addEventListener("touchend", handleTouchEnd, { passive: true });
              el.addEventListener("touchmove", handleTouchEnd, { passive: true });
            }
          });

          customLMarker.addTo(lifeTargetGroup);
        });
      }
    }

    // 6.5 Render Life Layer Place Markers (生活图层地点坐标 - 归属于 'life', 'life_layer' 与 'places' 图层)
    const isLifePlacesEnabled = isLifeLayerActive || showAll || activeFilters.includes('life_layer') || activeFilters.includes('places') || activeFilters.includes('life');
    if (isLifePlacesEnabled && lifePlaces && lifePlaces.length > 0) {
      const lifeTargetGroup = lifeLayerGroupRef.current || group;
      lifePlaces.forEach((place) => {
        const isSelected = selectedLifePlaceId === place.id;
        const placePinHtml = renderPlaceMarker({
          id: place.id, name: place.name.split('·')[0].trim(), icon: place.icon,
          selected: isSelected,
        });
        const placeDivIcon = L.divIcon({
          html: placePinHtml,
          className: "custom-leaflet-life-place-marker",
          iconSize: [PLACE_MARKER_MAP_SIZE.width, PLACE_MARKER_MAP_SIZE.height],
          iconAnchor: [PLACE_MARKER_MAP_SIZE.width / 2, PLACE_MARKER_MAP_SIZE.height / 2],
        });

        const placeMarker = L.marker([place.lat, place.lng], {
          icon: placeDivIcon,
          title: place.name,
          zIndexOffset: isSelected ? 2200 : 1300,
        });

        placeMarker.on("click", (e: any) => {
          if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
          
          // Tap-to-center: smooth pan to center the tapped icon (~350ms, gentle zoom)
          mapInstanceRef.current?.panTo([place.lat, place.lng], {
            animate: true,
            duration: 0.35,
            easeLinearity: 0.25,
          });

          // Calculate screen position for floating nameplate
          let screenPos: { x: number; y: number } | undefined;
          const container = mapContainerRef.current;
          if (container && mapInstanceRef.current) {
            const latLng = L.latLng(place.lat, place.lng);
            const containerPt = mapInstanceRef.current.latLngToContainerPoint(latLng);
            screenPos = { x: containerPt.x, y: containerPt.y };
          }

          soundEffects.playTapSound();
          haptics.trigger('light');
          onSelectLifePlace?.(place, screenPos);
        });

        placeMarker.addTo(lifeTargetGroup);
      });
    }

    // 7. Campus Beacon Markers (教学打卡地) 已依照需求从地图图层彻底移除

    // 8. Render Schedules & Flights Layer (日程与航班信息 - 归属于 'schedules' 与 'life' 生活图层)
    const isScheduleLayerEnabled = showAll || activeFilters.includes('schedules') || activeFilters.includes('life');
    if (isScheduleLayerEnabled && schedules && schedules.length > 0) {
      const schedulesTargetGroup = activitiesLayerGroupRef.current || group;
      schedules.forEach((sched) => {
        if (isDuplicateActivitySchedule(sched.id, renderedActivityIds)) return;
        if (sched.type === 'flight' && sched.flight) {
          const fl = sched.flight;
          const snapshot = getFlightSnapshotInfo(sched);
          const depLat = sched.location?.latitude;
          const depLng = sched.location?.longitude;
          const arrLat = sched.destination?.latitude;
          const arrLng = sched.destination?.longitude;
          if (!validCoordinates({lat:depLat,lng:depLng})) return;
          const hasArrival = validCoordinates({lat:arrLat ?? NaN,lng:arrLng ?? NaN});
          const isLanded = snapshot.status === 'landed' || snapshot.status === 'completed';
          const position = snapshot.position || (isLanded && hasArrival ? {lat:arrLat!,lng:arrLng!} : {lat:depLat,lng:depLng});
          const positionLabel = snapshot.position ? '实时飞机位置' : isLanded && hasArrival ? '显示到达机场位置' : '显示出发机场位置';
          const selectFlight = (event: any) => {
            if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
            onSelectSchedule?.(sched);
          };

          // This connects the planned airports; it is never presented as a live aircraft track.
          if (hasArrival && snapshot.status !== 'cancelled') {
            const points: [number, number][] = [[depLat,depLng],[arrLat!,arrLng!]];
            const line = L.polyline(points,{color:'#9959ff',weight:2,opacity:.65,dashArray:'5 8',lineCap:'round'});
            line.bindTooltip('计划航线示意 · 不代表实时航迹');
            line.on('click',selectFlight).addTo(schedulesTargetGroup);
          }

          const addAirportMarker = (lat:number,lng:number,icon:string,name:string) => {
            const html = `<div class="stellar-airport-marker"><strong>${icon} ${escapeMarkerText(name)}</strong><i></i></div>`;
            const marker = L.marker([lat,lng],{icon:L.divIcon({html,className:'custom-leaflet-flight-airport',iconSize:[170,48],iconAnchor:[85,47]}),title:name,zIndexOffset:1600});
            marker.on('click',selectFlight).addTo(schedulesTargetGroup);
          };
          if (snapshot.position || isLanded) addAirportMarker(depLat,depLng,'🛫',fl.departureAirport || sched.location.name);
          if (hasArrival && (!isLanded || snapshot.position)) addAirportMarker(arrLat!,arrLng!,'🛬',fl.arrivalAirport || sched.destination!.name);

          const planeHtml = `<div class="stellar-flight-map-pin">
            <div class="stellar-flight-card">${renderFlightPictureCardHTML(fl,snapshot)}</div>
            <div class="stellar-flight-position-label"><strong>${escapeMarkerText(positionLabel)}</strong></div>
            <span class="stellar-flight-plane">${snapshot.position ? '✈️' : isLanded ? '🛬' : '🛫'}</span><i class="stellar-flight-needle"></i>
          </div>`;
          const planeMarker = L.marker([position.lat,position.lng],{
            icon:L.divIcon({html:planeHtml,className:'custom-leaflet-airplane',iconSize:[228,208],iconAnchor:[114,206]}),
            title:`${fl.flightNumber} · ${snapshot.dataLabel} · ${positionLabel}`,zIndexOffset:2800,
          });
          planeMarker.on('click',selectFlight).addTo(schedulesTargetGroup);
        } else {
          // Normal schedule pin
          const sLat = sched.location?.latitude ?? (sched.location as any)?.lat ?? 36.0610;
          const sLng = sched.location?.longitude ?? (sched.location as any)?.lng ?? 103.8320;

          const scheduleIcon = sched.icon || (sched.type === 'flight' ? '✈️' : '📅');
          const scheduleTime = scheduleDateParts(sched);
          const schedTimeLabel = `${scheduleTime.date} ${sched.allDay ? '全天' : scheduleTime.start}`;
          const schedHtml = renderLifeEventMarker(
            scheduleIcon, sched.title.replace(/^【[^】]+】\s*/, '').trim(),
            sched.description || sched.note || sched.location?.name || '', schedTimeLabel
          );
          const sMarker = L.marker([sLat, sLng], {
            icon: L.divIcon({
              html: schedHtml,
              className: 'custom-leaflet-schedule-normal',
              iconSize: [150, 155],
              iconAnchor: [75, 149],
            }),
            zIndexOffset: 1550,
          });
          sMarker.on('click', (e: any) => {
            if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
            onSelectSchedule?.(sched);
          });
          sMarker.addTo(schedulesTargetGroup);
        }
      });
    }
    stableFriendMarkersRef.current.forEach((cached, id) => {
      if (!visibleFriendIds.has(id)) {
        friendsLayerGroupRef.current?.removeLayer(cached.marker);
        stableFriendMarkersRef.current.delete(id);
      }
    });
  }, [userLocation, mapStyle, liveLocationShares, simulatedActivities, selectedActivityId, activeFilters, onSelectActivity, dispersedData, onSelectStarCard, customMarkers, selectedCustomMarkerId, onSelectCustomMarker, onLongPressCustomMarker, beaconPoints, onSelectBeacon, selectedFriendId, hideAllFriendMarkers, bouncingFriendId, navState, lifeRoute, activeFriendBubbles, mapZoom, getLayerRevealConfig, schedules, onSelectSchedule, friends, conversations, userNote, attachedEmoji, noteTheme, userAvatar, isStealthMode, userTransportEvaluation, isPhoneInactive, lifePlaces, selectedLifePlaceId, onSelectLifePlace, onSelectFriend, onSelectActivityParticipant, centerAvatarOnMap, onOpenUserTransportCard, flightClock, isHistoryReplayActive, activeFriendTrajectoryPoints]);

  // Render temporary dropped pin marker when user long-presses to place a pin
  useEffect(() => {
    if (!mapInstanceRef.current || !droppedPinLayerGroupRef.current) return;
    const group = droppedPinLayerGroupRef.current;
    group.clearLayers();

    if (droppedPinCoord && typeof droppedPinCoord.lat === 'number' && typeof droppedPinCoord.lng === 'number') {
      const pinHtml = `
        <div class="relative cursor-default select-none pointer-events-none w-full h-full flex flex-col items-center">
          <!-- Pin Label Badge / Unified Bubble (Facebook Straight-Edge UI) -->
          <div class="px-3.5 py-1.5 bg-white border border-[#E4E6EB] text-[#050505] text-[11px] font-black rounded-md shadow-md whitespace-nowrap flex items-center space-x-1.5">
            <span class="text-[#1877F2]">📍</span>
            <span class="font-black tracking-tight">${droppedPinAddress}</span>
            <span class="text-[9.5px] text-[#65676B] font-mono font-bold">
              (${droppedPinCoord.lat.toFixed(4)}, ${droppedPinCoord.lng.toFixed(4)})
            </span>
          </div>
          <!-- Pin Needle Tip (Overlapping white & gray border triangles) -->
          <div class="w-0 h-0 border-x-[5px] border-x-transparent border-t-[8px] border-t-white -mt-0.5 z-10"></div>
          <div class="w-0 h-0 border-x-[6px] border-x-transparent border-t-[9px] border-t-[#E4E6EB] -mt-[8.5px] z-0"></div>
          <!-- Ground Pulsing Target -->
          <div class="absolute -bottom-1.5 w-6 h-6 rounded-full border-2 border-[#1877F2] animate-ping opacity-60"></div>
          <div class="absolute -bottom-1.5 w-2.5 h-2.5 rounded-full bg-[#1877F2] ring-2 ring-white"></div>
        </div>
      `;
      const pinMarker = L.marker([droppedPinCoord.lat, droppedPinCoord.lng], {
        draggable: true,
        icon: L.divIcon({
          html: pinHtml,
          className: 'custom-leaflet-dropped-pin-marker cursor-grab active:cursor-grabbing',
          iconSize: [280, 80],
          iconAnchor: [140, 80],
        }),
        zIndexOffset: 3000,
      });
      pinMarker.on('dragend', (e: any) => {
        const newLatLng = e.target.getLatLng();
        if (onMapLongPress) {
          onMapLongPress({ lat: newLatLng.lat, lng: newLatLng.lng });
        }
      });
      pinMarker.addTo(group);
    }
  }, [droppedPinCoord, droppedPinAddress]);

  // Auto-fit map viewport bounds with adaptive padding tailored for shaped screens (dynamic island, notch, bottom nav)
  const calculateAdaptivePadding = useCallback(() => {
    const w = mapContainerRef.current?.clientWidth || window.innerWidth || 400;
    const h = mapContainerRef.current?.clientHeight || window.innerHeight || 800;
    const isNarrow = w < 440;
    const isShort = h < 720;

    return {
      paddingTopLeft: [
        isNarrow ? 40 : 60,  // Left safe margin
        isShort ? 80 : 100,  // Top safe margin
      ] as [number, number],
      paddingBottomRight: [
        isNarrow ? 40 : 60,  // Right safe margin
        isShort ? 70 : 90,   // Bottom safe margin
      ] as [number, number],
      maxZoom: isNarrow ? 15.8 : 16.0,
    };
  }, []);

  const collectKeyMapPoints = useCallback((onlyNearby: boolean = true): [number, number][] => {
    const uLat = typeof userLocation?.lat === 'number' && !isNaN(userLocation.lat) ? userLocation.lat : 36.0610;
    const uLng = typeof userLocation?.lng === 'number' && !isNaN(userLocation.lng) ? userLocation.lng : 103.8320;
    const points: [number, number][] = [[uLat, uLng]];
    const maxRadiusMeters = onlyNearby ? 15000 : Infinity; // 15km local city radius for optimal social map framing

    // Core friend points (focusing on local nearby city area)
    friends.forEach((f) => {
      if (typeof f.lat === 'number' && typeof f.lng === 'number' && !isNaN(f.lat) && !isNaN(f.lng)) {
        const dist = calculateLatLngDistanceMeters(uLat, uLng, f.lat, f.lng);
        if (dist <= maxRadiusMeters) {
          points.push([f.lat, f.lng]);
        }
      }
    });

    // Simulated activities nearby
    (simulatedActivities || []).forEach((a) => {
      if (typeof a.lat === 'number' && typeof a.lng === 'number' && !isNaN(a.lat) && !isNaN(a.lng)) {
        const dist = calculateLatLngDistanceMeters(uLat, uLng, a.lat, a.lng);
        if (dist <= maxRadiusMeters) {
          points.push([a.lat, a.lng]);
        }
      }
    });

    // Custom map markers nearby
    (customMarkers || []).forEach((cm) => {
      if (typeof cm.lat === 'number' && typeof cm.lng === 'number' && !isNaN(cm.lat) && !isNaN(cm.lng)) {
        const dist = calculateLatLngDistanceMeters(uLat, uLng, cm.lat, cm.lng);
        if (dist <= maxRadiusMeters) {
          points.push([cm.lat, cm.lng]);
        }
      }
    });

    // Star cards nearby
    (starCards || []).forEach((sc) => {
      if (typeof sc.lat === 'number' && typeof sc.lng === 'number' && !isNaN(sc.lat) && !isNaN(sc.lng)) {
        const dist = calculateLatLngDistanceMeters(uLat, uLng, sc.lat, sc.lng);
        if (dist <= maxRadiusMeters) {
          points.push([sc.lat, sc.lng]);
        }
      }
    });

    // Live location shares nearby
    (liveLocationShares || []).forEach((lls) => {
      if (typeof lls.lat === 'number' && typeof lls.lng === 'number' && !isNaN(lls.lat) && !isNaN(lls.lng)) {
        const dist = calculateLatLngDistanceMeters(uLat, uLng, lls.lat, lls.lng);
        if (dist <= maxRadiusMeters) {
          points.push([lls.lat, lls.lng]);
        }
      }
    });

    return points;
  }, [userLocation, friends, simulatedActivities, customMarkers, starCards, liveLocationShares]);

  // Initial adaptive bounds fit & auto-centering across irregular screens (skipped if user already has a saved preset zoom)
  const hasFittedBoundsRef = useRef(
    Boolean(
      (() => {
        try {
          return localStorage.getItem("stellar_preset_map_zoom");
        } catch {
          return null;
        }
      })()
    )
  );
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || hasFittedBoundsRef.current) return;

    const points = collectKeyMapPoints(true);
    const validPoints = points.filter(p => p && typeof p[0] === 'number' && typeof p[1] === 'number' && !isNaN(p[0]) && !isNaN(p[1]));

    if (validPoints.length > 1) {
      const bounds = L.latLngBounds(validPoints);
      const { paddingTopLeft, paddingBottomRight, maxZoom } = calculateAdaptivePadding();
      map.fitBounds(bounds, {
        paddingTopLeft,
        paddingBottomRight,
        maxZoom,
        animate: false,
      });
      hasFittedBoundsRef.current = true;
    } else {
      const uLat = typeof userLocation?.lat === 'number' && !isNaN(userLocation.lat) ? userLocation.lat : 36.0610;
      const uLng = typeof userLocation?.lng === 'number' && !isNaN(userLocation.lng) ? userLocation.lng : 103.8320;
      map.setView([uLat, uLng], globalLastMapZoom || 15.6);
      hasFittedBoundsRef.current = true;
    }
  }, [collectKeyMapPoints, calculateAdaptivePadding, userLocation]);

  // Automatically zoom & center map to frame selected friend and 500-meter radius when friend dialog/avatar modal is activated
  const lastSelectedFriendFocusIdRef = useRef<string | null>(null);
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedFriendId) {
      lastSelectedFriendFocusIdRef.current = null;
      return;
    }

    if (lastSelectedFriendFocusIdRef.current !== selectedFriendId) {
      lastSelectedFriendFocusIdRef.current = selectedFriendId;
      const targetFriend = friends.find((f) => f.id === selectedFriendId);
      if (targetFriend && typeof targetFriend.lat === 'number' && typeof targetFriend.lng === 'number') {
        centerAvatarOnMap(targetFriend.lat, targetFriend.lng);
      }
    }
  }, [selectedFriendId, friends, centerAvatarOnMap]);

  // Controller Handlers
  const handleZoomIn = () => {
    onMapInteractionRef.current?.();
    const map = mapInstanceRef.current;
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    onMapInteractionRef.current?.();
    const map = mapInstanceRef.current;
    if (map) {
      map.zoomOut();
    }
  };

  const handleLocateMe = () => {
    onMapInteractionRef.current?.();
    const currentZ = mapInstanceRef.current?.getZoom() || globalLastMapZoom || 15.6;
    mapInstanceRef.current?.flyTo([userLocation.lat, userLocation.lng], currentZ, {
      duration: 0.8,
    });
  };

  const handleFitAll = () => {
    onMapInteractionRef.current?.();
    const map = mapInstanceRef.current;
    if (!map) return;
    const points = collectKeyMapPoints(true);
    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      const { paddingTopLeft, paddingBottomRight, maxZoom } = calculateAdaptivePadding();
      map.fitBounds(bounds, {
        paddingTopLeft,
        paddingBottomRight,
        maxZoom,
        animate: true,
      });
    } else {
      map.flyTo([userLocation.lat, userLocation.lng], 15.6, { duration: 0.8 });
    }
  };

  return (
    <div className="stellar-slippy-map relative w-full h-full">
      {/* Real Slippy Map Canvas */}
      <div
        ref={mapContainerRef}
        className="stellar-leaflet-host w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />
      {basemapIssue && <div role="status" className="absolute top-24 left-3 right-3 z-20 border border-[#E4E6EB] bg-white/95 px-3 py-2 text-[11px] font-bold text-[#65676B] shadow-sm pointer-events-none">
        {basemapIssue === 'fallback' ? '已切换备用底图，位置与路线正常显示' : '底图暂时加载失败，位置与路线仍可查看'}
      </div>}

      {/* Top-Right Micro Transparent Map Zoom Scale Display (极小字体·数字透明) */}
      <div
        id="map-top-right-scale-indicator"
        className="absolute top-2.5 right-3 z-30 pointer-events-none select-none flex items-center space-x-1 font-mono text-[9px] font-semibold text-gray-500/40 dark:text-gray-400/40 backdrop-blur-[1px] px-1.5 py-0.5 rounded transition-opacity duration-300"
      >
        <span className="tracking-tighter opacity-70">比例</span>
        <span className="tabular-nums font-bold tracking-tight">
          {Number(mapZoom).toFixed(1)}
        </span>
      </div>

      {/* Floating Locate & Compass - 放置在地图左侧（1:1设计UI复刻好友交互界面指南针） */}
      {!selectedFriendId && <div className="stellar-map-compass absolute z-25 will-change-transform items-start flex flex-col">
        {/* Locate Me & 1:1 Design Compass Button from Friend Interaction View */}
        <div className="w-9 h-9 relative flex items-center justify-center shrink-0">
          <button
            id="leaflet-locate-btn"
            type="button"
            onClick={handleLocateMe}
            className="stellar-map-compass-button floating-friend-compass !static w-9 h-9 flex items-center justify-center cursor-pointer select-none shrink-0"
            title={`点击定位至我的位置 · 罗盘实时指向南方 · 相距 ${compassDistanceDisplay} km`}
            aria-label={`定位至我的位置，相距 ${compassDistanceDisplay} km`}
          >
            <span className="floating-compass-dial">
              <svg className="floating-compass-ticks" viewBox="0 0 100 100" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="7"
                    x2="50"
                    y2={i % 3 === 0 ? "15" : "12"}
                    transform={`rotate(${i * 30} 50 50)`}
                    stroke={i % 3 === 0 ? "#151719" : "#bfc0c1"}
                    strokeWidth={i % 3 === 0 ? "4" : "3"}
                    strokeLinecap="round"
                  />
                ))}
              </svg>
              <span
                className="floating-compass-orbit"
                style={{ transform: `rotate(${southPointerRotation(deviceHeading)}deg)` }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 28 28">
                  <path
                    d="m14 3 9 22-9-6-9 6Z"
                    fill="#1685f8"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m14 3 0 16-9 6Z"
                    fill="#39c7ff"
                  />
                </svg>
              </span>
              <strong>{compassDistanceDisplay}</strong>
              <small>km</small>
            </span>
          </button>
        </div>
      </div>}

      {/* Locate Me & Pure Line Scale Ruler - 放置在地图左下角（缩放按钮上下排列） */}
      {!selectedFriendId && <div className="stellar-map-zoom-controls absolute z-25 flex flex-col items-start space-y-1 will-change-transform select-none">
        {/* Zoom In & Zoom Out Buttons Group (Stacked vertically: Zoom in on top, Zoom out on bottom) */}
        <div className="flex flex-col space-y-1">
          <button
            id="leaflet-zoomin-btn"
            onClick={handleZoomIn}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-all cursor-pointer border will-change-transform ${
              mapStyle === "dark"
                ? "bg-gray-900/90 hover:bg-gray-800 text-white border-gray-700 active:scale-95"
                : "bg-white hover:bg-[#F0F2F5] text-[#050505] border-[#E4E6EB] active:scale-95"
            }`}
            title="放大"
            aria-label="放大"
          >
            <span aria-hidden="true">+</span>
          </button>
          <button
            id="leaflet-zoomout-btn"
            onClick={handleZoomOut}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-all cursor-pointer border will-change-transform ${
              mapStyle === "dark"
                ? "bg-gray-900/90 hover:bg-gray-800 text-white border-gray-700 active:scale-95"
                : "bg-white hover:bg-[#F0F2F5] text-[#050505] border-[#E4E6EB] active:scale-95"
            }`}
            title="缩小"
            aria-label="缩小"
          >
            <span aria-hidden="true">−</span>
          </button>
        </div>

        {/* 极简地图比例尺 (纯线段+数字刻度，以5公里为计量单位，无背景无气泡) */}
        <MapScaleBar
          zoom={mapZoom}
          centerLat={userLocation?.lat || 36.0592}
          mapStyle={mapStyle}
          className="pl-0.5"
        />
      </div>}

      {/* Dynamic Layer Quick Toggle Button - 随当前激活图层动态变化图标与主题颜色 */}
      {!selectedFriendId && !isFabOpen && onToggleQuickFriendsBar && (() => {
        const config = (() => {
          switch (activeLayer) {
            case 'family':
              return {
                icon: ShieldCheck,
                iconColor: isQuickFriendsBarVisible ? 'text-white' : 'text-[#10B981]',
                bgActive: 'bg-[#10B981] text-white border-[#10B981] ring-2 ring-[#10B981]/30',
                hoverBorder: 'hover:border-[#10B981]',
                title: isQuickFriendsBarVisible ? '收起家人守护快捷栏' : '展开家人守护快捷栏',
              };
            case 'activities':
              return {
                icon: Flame,
                iconColor: isQuickFriendsBarVisible ? 'text-white' : 'text-[#F97316]',
                bgActive: 'bg-[#F97316] text-white border-[#F97316] ring-2 ring-[#F97316]/30',
                hoverBorder: 'hover:border-[#F97316]',
                title: isQuickFriendsBarVisible ? '收起活动快捷栏' : '展开活动快捷栏',
              };
            case 'groups':
              return {
                icon: Users,
                iconColor: isQuickFriendsBarVisible ? 'text-white' : 'text-[#06B6D4]',
                bgActive: 'bg-[#06B6D4] text-white border-[#06B6D4] ring-2 ring-[#06B6D4]/30',
                hoverBorder: 'hover:border-[#06B6D4]',
                title: isQuickFriendsBarVisible ? '收起小组快捷栏' : '展开小组协同快捷栏',
              };
            case 'squads':
              return {
                icon: Target,
                iconColor: isQuickFriendsBarVisible ? 'text-white' : 'text-[#6366F1]',
                bgActive: 'bg-[#6366F1] text-white border-[#6366F1] ring-2 ring-[#6366F1]/30',
                hoverBorder: 'hover:border-[#6366F1]',
                title: isQuickFriendsBarVisible ? '收起小队快捷栏' : '展开小队战术快捷栏',
              };
            case 'schedules':
              return {
                icon: Calendar,
                iconColor: isQuickFriendsBarVisible ? 'text-white' : 'text-[#8B5CF6]',
                bgActive: 'bg-[#8B5CF6] text-white border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30',
                hoverBorder: 'hover:border-[#8B5CF6]',
                title: isQuickFriendsBarVisible ? '收起日程航班栏' : '展开日程航班快捷栏',
              };
            case 'places':
              return {
                icon: (Array.isArray(activeMapFilter) ? activeMapFilter : [activeMapFilter]).includes('stars') && !(Array.isArray(activeMapFilter) ? activeMapFilter : [activeMapFilter]).includes('places') ? Sparkles : MapPin,
                iconColor: isQuickFriendsBarVisible ? 'text-white' : 'text-[#EC4899]',
                bgActive: 'bg-[#EC4899] text-white border-[#EC4899] ring-2 ring-[#EC4899]/30',
                hoverBorder: 'hover:border-[#EC4899]',
                title: isQuickFriendsBarVisible ? '收起地点星片栏' : '展开地点星片快捷栏',
              };
            case 'friends':
              return {
                icon: Users,
                iconColor: isQuickFriendsBarVisible ? 'text-white' : 'text-[#1877F2]',
                bgActive: 'bg-[#1877F2] text-white border-[#1877F2] ring-2 ring-[#1877F2]/30',
                hoverBorder: 'hover:border-[#1877F2]',
                title: isQuickFriendsBarVisible ? '收起好友快捷栏' : '展开好友快捷栏',
              };
            case 'all':
            default:
              return {
                icon: Layers,
                iconColor: isQuickFriendsBarVisible ? 'text-white' : 'text-[#1877F2]',
                bgActive: 'bg-[#1877F2] text-white border-[#1877F2] ring-2 ring-[#1877F2]/30',
                hoverBorder: 'hover:border-[#1877F2]',
                title: isQuickFriendsBarVisible ? '收起全景快捷栏' : '展开全景要素快捷栏',
              };
          }
        })();

        const DynamicIcon = config.icon;

        return (
          <div className="stellar-map-quick-toggle absolute z-25 will-change-transform">
            <button
              id="quick-friends-toggle-btn"
              type="button"
              onClick={onToggleQuickFriendsBar}
              aria-pressed={isQuickFriendsBarVisible}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer border select-none animate-in fade-in zoom-in-95 duration-200 active:scale-90 ${
                isQuickFriendsBarVisible
                  ? config.bgActive
                  : mapStyle === 'dark'
                  ? `bg-gray-900/90 text-gray-100 border-gray-700 hover:bg-gray-800 ${config.hoverBorder}`
                  : `bg-white text-gray-900 border-[#E4E6EB] hover:bg-[#F0F2F5] ${config.hoverBorder}`
              }`}
              title={config.title}
              aria-label={config.title}
            >
              <DynamicIcon size={16} className={`${config.iconColor} shrink-0 transition-transform`} />
            </button>
          </div>
        );
      })()}

      {/* Flight Three Stage Floating Overlay */}
      {showFlightThreeStagePanel && (
        <div className="absolute inset-0 z-50 bg-black/65 backdrop-blur-md flex flex-col items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-[1100px] relative pt-6">
            <button
              type="button"
              onClick={() => setShowFlightThreeStagePanel(false)}
              className="absolute top-0 right-0 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 border border-gray-600 transition-all cursor-pointer z-50"
              title="关闭"
            >
              <X size={18} />
            </button>
            <FlightThreeStageCards
              flight={scheduleToFlightSchedule(schedules?.find(s => s.type === 'flight') || null)}
              onLocateStage={(stage) => {
                handleLocateStageOnMap(stage);
                setShowFlightThreeStagePanel(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default SlippyLeafletMap;
