export interface FriendProfileDetail {
  chineseName?: string;
  coverImage?: string;
  friendsCount?: string;
  postsCount?: string;
  bio?: string;
  hometown?: string;
  currentCity?: string;
  education?: string;
  educationYear?: string;
  birthday?: string;
  gender?: string;
  highlights?: { id: string; title: string; image: string }[];
  timelinePosts?: {
    id: string;
    authorName: string;
    authorAvatar: string;
    targetName?: string;
    time: string;
    content?: string;
    image?: string;
  }[];
}

export type FriendRelationship = 'lover' | 'friend' | 'close' | 'family' | 'muted' | 'hidden';
export type FriendActivityState = 'online' | 'moving' | 'arrived' | 'departed' | 'idle' | 'sleeping';
export type FriendNavStatus = 'friend_moving_to_me' | 'me_moving_to_friend' | 'arrived' | 'departed' | 'paused' | 'stealth';

export type TransportMode =
  | 'stationary'
  | 'walking'
  | 'bicycle'
  | 'car'
  | 'moving'
  | 'unknown';

export interface LocationSample {
  latitude: number;
  longitude: number;
  timestamp: number;
  speedMps?: number;
  accuracyMeters?: number;
  heading?: number;
  accelerationMps2?: number;
  source: 'gps' | 'mock';
  roadType?: 'motorway' | 'primary_road' | 'secondary_road' | 'bike_path' | 'pedestrian_path' | 'park' | 'unknown';
}

export interface TransportScore {
  mode: TransportMode;
  score: number;
  reasons: string[];
}

export interface TransportModeEvaluation {
  currentMode: TransportMode;
  displayMode: TransportMode;
  modeLabel: string;
  confidence: number; // 0 - 100
  smoothedSpeedKmh: number;
  medianSpeedKmh: number;
  p90SpeedKmh: number;
  speedVariance: number;
  stopRatio: number;
  headingStability: number;
  gpsQuality: number;
  scores: Record<TransportMode, number>;
  topScoreReasons: string[];
  sampleCount: number;
  validSamplesWindowSec: number;
  isDebouncing: boolean;
  debounceCountdownSec: number;
  lastUpdated: number;
  source: 'gps' | 'mock';
  isSimulated: boolean;
  userOverride?: {
    mode: TransportMode;
    expiresAt: number;
  };
  ghostModeEnabled?: boolean;
}

export interface TransportUserSettings {
  autoRecognitionEnabled: boolean;
  showTransportMode: boolean;
  forceMovingOnly: boolean;
  manualOverrideMode?: TransportMode;
  manualOverrideExpiresAt?: number;
}

export interface FriendInMapNavState {
  friendId: string;
  friend: Friend;
  status: FriendNavStatus;
  progress: number; // 0 (start) to 1 (arrived)
  initialDistanceMeters?: number;
  currentDistanceMeters: number;
  currentEtaSeconds: number;
  speedKmh: number;
  isReducedMotion?: boolean;
  lastUpdated: number;
  /** 真实道路路线的点序列（[lat, lng]）；缺省时地图回退为模拟折线 */
  routePoints?: [number, number][];
  /** 该路线是否为距离估算（true 时地图用虚线表示） */
  routeEstimated?: boolean;
}

export interface VisitedPlaceItem {
  id: string;
  name: string;
  address?: string;
  time: string;
  stayDuration?: string;
  category?: string;
  icon?: string;
  lat?: number;
  lng?: number;
  city?: string;
  summary?: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: string;
  locationName: string;
  address?: string;
  lat: number;
  lng: number;
  x: number; // percentage fallback (0-100)
  y: number; // percentage fallback (0-100)
  distance: string;
  battery: number;
  lastUpdated: string;
  isOnline: boolean;
  mood?: string;
  relationship?: FriendRelationship;
  relationshipLabel?: string;
  isCloseFriend?: boolean;
  isLover?: boolean;
  isFamily?: boolean;
  isMuted?: boolean;
  isHidden?: boolean;
  activityState?: FriendActivityState;
  speed?: string;
  stayDuration?: string;
  eta?: string;
  transportMode?: TransportMode;
  transportConfidence?: number;
  profileDetail?: FriendProfileDetail;
  remark?: string;
  stickers?: LabelSticker[];
  hideStickers?: boolean;
  isGroupMember?: boolean;
  groupId?: string;
  groupName?: string;
  teamRole?: string;
  isMe?: boolean;
  speechExpectation?: string;
  expectationEmoji?: string;
  expectationTag?: string;
  statusNote?: string;
  noteTheme?: string;
  recentVisitedPlaces?: VisitedPlaceItem[];
}

export interface StickerBorder {
  color: string; // e.g. '#FFFFFF'
  widthPx: number; // 1-8px
  style: 'solid' | 'dashed' | 'glow';
}

export interface StickerOrbit {
  angleDeg: number; // 0 - 360
  radiusPx: number; // e.g. 70-110px
  phase: number; // 0.0 - 1.0 (staggered animation phase)
}

export interface StickerLiker {
  userId: string;
  userName?: string;
  avatarUrl: string;
  time?: string;
}

export interface LabelSticker {
  id: string;
  cutoutUrl: string;
  sourcePhotoUrl?: string;
  label: string;
  border: StickerBorder;
  sizePx: number; // 36 - 56px
  likes: number;
  likedByMe?: boolean;
  recentLikers: StickerLiker[];
  orbit: StickerOrbit;
  hidden?: boolean;
  createdAt?: string;
}

export interface UserStickerConfig {
  maxStickers: number; // default 6
  stickers: LabelSticker[];
  hideStickers?: boolean;
  mapInteraction?: {
    enlargeScale: number; // 1.8
    enlargeDurationMs: number; // 400
    zoomHoldMs: number; // 600
  };
}

export interface ContactCardData {
  userId?: string;
  name: string;
  avatar: string;
  handle?: string;
  bio?: string;
  role?: string;
  locationName?: string;
  address?: string;
  distance?: string;
  lat?: number;
  lng?: number;
  mutualFriendsCount?: number;
  isOnline?: boolean;
  statusText?: string;
  battery?: number;
  education?: string;
  tags?: string[];
  isFriend?: boolean;
}

export interface ChatMessage {
  povExpiresAt?: number;
  textStyle?: { id: string; alignment: 'left' | 'center' | 'right' };
  reactions?: { emoji: string; count: number; hasReacted?: boolean }[];
  id: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  text?: string;
  timestamp: string;
  isMe: boolean;
  type?: 'text' | 'audio' | 'image' | 'file' | 'location' | 'emoji' | 'recalled' | 'activity' | 'contact' | 'life_place' | 'handwriting';
  isHandwriting?: boolean;
  doodleLayout?: {x:number;y:number;w:number;h:number;canvasWidth:number};
  handwritingStrokes?: Array<{ points: Array<{ x: number; y: number }>; color: string; width: number; isEraser?: boolean }>;
  activityId?: string;
  activityData?: SimulatedMapActivity;
  contactData?: ContactCardData;
  lifePlaceId?: string;
  lifePlaceData?: LifePlace;
  isBurnAfterReading?: boolean;
  isBurned?: boolean;
  audioDuration?: number; // duration in seconds
  audioUrl?: string;
  imageUrl?: string;
  showDateDivider?: boolean;
  dateLabel?: string;
  fullTimestamp?: string;
  dateDivider?: string;
  createdAt?: number;
  fileData?: {
    name: string;
    size: string;
    type?: string;
    url?: string;
  };
  locationData?: {
    name: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  liveLocation?: {
    isActive: boolean;
    expiresAt: number;
    durationMinutes: number;
    lat: number;
    lng: number;
    locationName: string;
    address?: string;
    userAvatar?: string;
    userName?: string;
  };
  emojiData?: {
    emoji: string;
    animation?: string;
    isMega?: boolean;
  };
  isRecalled?: boolean;
  mention?: {
    name: string;
    avatar: string;
  };
  status?: 'sending' | 'delivered' | 'read';
  quotedMessage?: {
    id: string;
    senderName?: string;
    text?: string;
  };
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role?: '群主' | '管理员' | '成员';
  status?: string;
  isOnline?: boolean;
}

export interface GroupDetails {
  id?: string;
  name?: string;
  description?: string;
  announcement: string;
  tags: string[];
  createdAt: string;
  location?: string;
  adminName: string;
  memberCount: number;
  members: GroupMember[];
}

export interface ChatConversation {
  doodlePeerRoleId?: string;
  id: string;
  friendId: string;
  friendName: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: ChatMessage[];
  isGroup?: boolean;
  isTeam?: boolean;
  groupAvatars?: string[];
  groupDetails?: GroupDetails;
  isCloseFriend?: boolean;
  isLover?: boolean;
  isFamily?: boolean;
  relationship?: FriendRelationship | string;
  relationshipLabel?: string;
  isPinned?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  type: 'message' | 'like' | 'system' | 'radar';
  read: boolean;
}

export interface DiscoverPostComment {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  time: string;
}

export interface DiscoverPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  location: string;
  weather?: string;
  lat?: number;
  lng?: number;
  time: string;
  content: string;
  image?: string;
  images?: string[];
  videoUrl?: string;
  mediaType?: 'photo' | 'video' | 'text';
  likes: number;
  comments: number;
  postType?: 'moment' | 'star';
  isStarCard?: boolean;
  likedByMe?: boolean;
  commentsList?: DiscoverPostComment[];
  createdAt?: number;
}

export interface LiveLocationShare {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  createdAt: number;
  expiresAt: number; // timestamp, e.g. 1 hour later
  durationMinutes: number; // 60
}

export interface ActivityParticipantStatus {
  id: string;
  name: string;
  avatar: string;
  status: 'arrived' | 'on_the_way' | 'departed' | 'preparing';
  statusText: string;
  transport?: 'car' | 'walk' | 'bike' | 'subway';
  etaMinutes?: number;
  currentLat?: number;
  currentLng?: number;
  speedKmh?: number;
  distanceMeters?: number;
  distanceText?: string;
  relationship?: FriendRelationship;
  relationshipLabel?: string;
  estimatedArrivalTime?: string;
  // 小组管理员查阅专属字段
  groupRole?: 'admin' | 'core' | 'member';
  batteryLevel?: number;
  isInGeofence?: boolean;
  trajectoryHistory?: { lat: number; lng: number; time: string; speedKmh?: number; checkpointName?: string }[];
  isLocationAuthorized?: boolean; // 定位授权状态 (false 则显示未授权定位，不可显示精确位置)
  invitationStatus?: 'invited' | 'confirmed';
  activityRole?: string;
}

export type MapLayerId =
  | 'all'
  | 'friends'
  | 'family'
  | 'groups'
  | 'squads'
  | 'activities'
  | 'schedules'
  | 'places'
  | 'life_layer'
  | 'cost_of_living'
  | 'life'
  | 'stars';

export interface GroupActivityAuthorizedScope {
  timeWindow: string; // e.g. "活动开始前30分钟 至 活动结束 (14:30 - 18:30)"
  geofenceRadiusKm: number; // e.g. 2.5
  rulesSummary: string;
  isScopeActive: boolean;
  authorizedRoles: string[];
}

export interface ActivityRouteNode {
  name: string;
  lat: number;
  lng: number;
  status: 'current' | 'next' | 'planned';
  label?: string;
}

export interface MapLocation {
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

export interface SimulatedMapActivity {
  id: string;
  title: string;
  category: string;
  icon: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  originLocation?: MapLocation;
  venueLocation?: MapLocation;
  color: string;
  bgGradient: string;
  status: 'active_countdown' | 'upcoming' | 'completed';
  statusText: string;
  activityState?: '进行中' | '集合中' | '路线中' | '即将开始' | '已结束';
  radiusMeters?: number; // 活动范围半径 (米)
  nextNode?: string; // 下一节点名称 (例如: 白塔山集合点)
  routeNodes?: ActivityRouteNode[];
  participants: ActivityParticipantStatus[];
  isReminderSet?: boolean;
  trackingWindowMinutes?: number; // 默认活动前半小时 (30分钟)
  showLocationAndDistance?: boolean;
  showNavRoutesAndSpeed?: boolean;
  enableArrivalAggregationAnimation?: boolean;
  enableFloatingVibes?: boolean;
  isArrived?: boolean;
  // 小组创建活动及管理员权限相关
  groupId?: string;
  groupName?: string;
  groupAvatar?: string;
  isGroupActivity?: boolean;
  groupAdminName?: string;
  groupAdminAvatar?: string;
  isUserAdmin?: boolean; // 当前登录用户是否为该小组管理员
  authorizedScope?: GroupActivityAuthorizedScope;
  isUserPublished?: boolean;
  authorName?: string;
  authorAvatar?: string;
  description?: string;
  date?: string; // 活动日期，如 '9月5日 周六' 或 '9月5日'
  dateStr?: string; // '2026-09-05'
  agenda?: { time: string; title: string; desc?: string }[];
  feeType?: '免费' | 'AA制' | '固定费用';
  maxParticipants?: number;
  equipmentTips?: string;
  privacyLevel?: 'public' | 'friends' | 'selected' | 'private';
  visibleFriendIds?: string[];
  coverImageUrl?: string;
  fixedFee?: number;
  minParticipants?: number;
  deadlineTime?: string;
  startedAt?: number;
  endedAt?: number;
  pausedAt?: number;
  pausedDurationMs?: number;
  needs?: { id: string; title: string; description: string; authorId: string; authorName: string; lat: number; lng: number; createdAt: number; status: 'open' | 'claimed' | 'resolved'; helperId?: string; helperName?: string }[];
  moments?: { id: string; url: string; caption: string; createdAt: number; authorName: string; lat: number; lng: number }[];
  updates?: { id: string; text: string; createdAt: number }[];
  templateSaved?: boolean;
  assistantSummary?: string;
  reminderMinutes?: number;
}

export interface InstagramVideoData {
  id: string;
  videoUrl: string;
  authorName: string;
  authorAvatar: string;
  caption: string;
  location: string;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
}

export interface CustomMarkerPhoto {
  id: string;
  url: string;
  timestamp: number;
  timeString: string;
  caption?: string;
  authorName?: string;
  authorAvatar?: string;
  isVideo?: boolean;
}

export interface CustomMapMarker {
  id: string;
  lat: number;
  lng: number;
  icon: string;
  category: 'building' | 'food' | 'life';
  categoryLabel?: string;
  title: string;
  address?: string;
  createdAt: number;
  timeString?: string;
  note?: string;
  authorName?: string;
  authorAvatar?: string;
  photos?: CustomMarkerPhoto[];
  isBeacon?: boolean;
  color?: string;
  isHome?: boolean;
}

export interface PlanetMoment {
  id: string;
  title: string;
  image?: string;
  authorName: string;
  authorAvatar: string;
  likes: number;
  time: string;
  text: string;
  isLiked?: boolean;
}

export interface PlanetEvent {
  id: string;
  title: string;
  time: string;
  participants: number;
  location: string;
  icon: string;
  status: 'active' | 'upcoming' | 'recruiting';
}

export interface PlanetLandmark {
  id: string;
  name: string;
  icon: string;
  checkIns: number;
  desc: string;
}

export interface PlanetCitizen {
  id: string;
  name: string;
  avatar: string;
  role: '星主' | '守望者' | '先行者' | '星际居民' | '学务主管' | '课代表' | '学习委员' | string;
  motto: string;
  online: boolean;
}

export interface PlanetItem {
  id: string;
  name: string;
  englishName: string;
  themeColor: string;
  gradient: string;
  glowColor: string;
  icon: string;
  description: string;
  category: string;
  citizensCount: number;
  isJoined: boolean;
  gravityLevel: string;
  atmosphere: string;
  temperature: string;
  coordinates: string;
  hasRing: boolean;
  ringColor?: string;
  satellitesCount: number;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  // Blind Box & Unknown Planet Attributes
  isExplored?: boolean; // false for unexplored blind box
  blindBoxCode?: string; // e.g. "BOX-α7", "NOVA-Ω9"
  blindBoxRarity?: 'SSR' | 'SR' | 'UR' | 'MYTHIC' | 'RARE';
  blindBoxEnergy?: number; // 0-100%
  unexploredTitle?: string; // e.g. "未知星系 · 待解构盲盒星"
  unexploredDesc?: string; // e.g. "深空探测器捕获到高频未知引力脉冲，尚未破译..."
  unexploredCategory?: string; // e.g. "未知能量源"
  starLord: {
    name: string;
    avatar: string;
    title: string;
    motto: string;
  };
  topTags: string[];
  moments: PlanetMoment[];
  events: PlanetEvent[];
  landmarks: PlanetLandmark[];
  citizens: PlanetCitizen[];
}

export interface ProfileData {
  avatar?: string;
  operatorName: string;
  operatorId: string;
  operatorBio: string;
  moodStatus: string;
  signature: string;
  aboutYou: string;
  pinnedDetail: string;
  category: string;
  isAICreator: boolean;
  currentCity: string;
  hometown: string;
  birthday: string;
  relationshipStatus: string;
  familyStatus: string;
  gender: string;
  languages: string;
  websiteLink: string;
  workExperience: string;
  educationHistory: string;
  hobbies: string;
  interestsMusic: string;
  interestsTV: string;
  interestsMovie: string;
  interestsGame: string;
  interestsSports: string;
  travelPlaces: string;
  socialMedia: string;
  phoneNumber: string;
  emailAddress: string;
  promoMaterials: string;
  stickers?: LabelSticker[];
  hideStickers?: boolean;
}

export interface BeaconCheckInUser {
  id: string;
  name: string;
  avatar: string;
  time: string;
}

export interface BeaconPoint {
  id: string;
  code: string;
  classroomName: string;
  building: string;
  checkedInCount: number;
  capacity: number;
  lat: number;
  lng: number;
  status: 'active' | 'idle' | 'warning';
  signalStrength: string;
  lastCheckInUser?: string;
  checkInUsers?: BeaconCheckInUser[];
}

export interface StealthCustomSchedule {
  enabled: boolean;
  startHour: number; // 0 - 23 (e.g. 9 for 09:00)
  startMinute?: number;
  endHour: number;   // 0 - 23 (e.g. 18 for 18:00)
  endMinute?: number;
  allowAllFriends: boolean;
  selectedFriendIds: string[]; // List of friend IDs visible during open window
}

export type ScheduleType = 'general' | 'flight' | 'meeting' | 'gathering' | 'travel' | 'medical' | 'custom';

export type FlightStatus =
  | 'upcoming'
  | 'departing'
  | 'to_airport'
  | 'at_airport'
  | 'boarding'
  | 'in_flight'
  | 'landed'
  | 'completed'
  | 'delayed'
  | 'cancelled'
  | 'on_time';

export type FlightScheduleStage =
  | 'preflight'
  | 'to-airport'
  | 'at-airport'
  | 'boarding'
  | 'in-flight'
  | 'landed'
  | 'completed';

export interface FlightScheduleAirport {
  code?: string;
  name: string;
  terminal?: string;
  latitude: number;
  longitude: number;
}

export interface FlightScheduleWeather {
  icon: string;
  description: string;
  temperature: string;
}

export interface FlightSchedule {
  id: string;
  type: 'flight';
  title: string;
  flightNumber: string;
  airline?: string;

  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;

  departureAirport: FlightScheduleAirport;
  arrivalAirport: FlightScheduleAirport;

  currentStage: FlightScheduleStage;

  progressPercent: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  estimatedArrivalTime: string;
  arrivalTimeLabel?: string;
  status?: FlightStatus;
  dataMode?: 'live' | 'stale' | 'scheduled' | 'demo';
  dataLabel?: string;
  dataSource?: string;
  observedAt?: string;
  hasProgress?: boolean;
  hasElapsed?: boolean;
  hasRemaining?: boolean;
  durationMinutes?: number;
  planePosition?: FlightPosition;
  actualDepartureAt?: string;
  actualArrivalAt?: string;
  seat?: string;
  baggageClaim?: string;

  departureWeather?: FlightScheduleWeather;
  arrivalWeather?: FlightScheduleWeather;

  userAvatar: string;
  distanceToDepartureAirport?: string;
  distanceToArrivalCity?: string;
  distanceToDestination?: string;
  departureCountdown?: string;

  mapVisibleAt: string;
  mapHideAt?: string;
  keepAsHistory: boolean;
  isSimulated: boolean;
}

export interface ScheduleLocation {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
}

export interface FlightPosition {
  lat: number;
  lng: number;
  altitudeMeters?: number;
  speedKmh?: number;
}

export interface FlightLiveSnapshot {
  source: string;
  observedAt: string;
  fetchedAt: string;
  status: FlightStatus;
  position?: FlightPosition;
  estimatedArrivalAt?: string;
  actualDepartureAt?: string;
  actualArrivalAt?: string;
  registration?: string;
}

export interface ScheduleFlightInfo {
  flightNumber: string;
  airline?: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  departureTime?: string;
  arrivalTime?: string;
  gate?: string;
  seat?: string;
  luggageInfo?: string;
  remarks?: string;
  status: FlightStatus;
  isSimulated: boolean;
  flightProgress?: number; // 0 to 1 for flight animation along path
  departureCode?: string;
  arrivalCode?: string;
  live?: FlightLiveSnapshot;
  lookupError?: string;
}

export interface VisibilityRule {
  scope: 'private' | 'close' | 'lover' | 'family' | 'specified' | 'group' | 'excluded';
  specifiedIds?: string[];
  groupId?: string;
  excludedIds?: string[];
  showFlightNumber?: boolean;
  showExactAirport?: boolean;
  showDepartureTime?: boolean;
  showCurrentLocation?: boolean;
  showStage?: boolean;
  allowEtaView?: boolean;
}

export interface Schedule {
  id: string;
  type: ScheduleType;
  title: string;
  description?: string;
  note?: string;
  icon: string;
  color: string;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  startAt: string; // ISO string or YYYY-MM-DD HH:mm
  endAt?: string;
  allDay: boolean;
  timezone: string;
  location: ScheduleLocation;
  destination?: ScheduleLocation;
  reminders: number[]; // In minutes before start, e.g. [0, 15, 30, 60, 120, 720, 1440]
  travelPlan?: { mode: 'walking' | 'cycling' | 'driving'; minutes: number; bufferMinutes: number; remindDeparture: boolean; estimated?: boolean };
  reminder?: { enabled: boolean; advanceMinutes: number };
  mapVisibleAt: string; // ISO string or relative time rule
  mapHideAt?: string;
  keepAsHistory: boolean;
  visibilityRule: VisibilityRule;
  flight?: ScheduleFlightInfo;
  createdAt: string;
  updatedAt: string;
  image?: string;
  status?: 'active' | 'completed' | 'cancelled';
}

export interface TrajectoryPoint {
  id: string;
  lat: number;
  lng: number;
  timeHour: number; // 0 to 24 (e.g. 14.5 = 14:30)
  timeLabel: string; // e.g. "14:30"
  locationName: string;
  speedKmh: number;
  transportMode: 'walking' | 'car' | 'bicycle' | 'stationary';
  stayDurationMinutes?: number;
  note?: string;
  isStayPoint?: boolean;
  intersectingFriendId?: string;
  intersectingFriendName?: string;
}

export interface FriendTrajectory {
  friendId: string;
  friendName: string;
  avatar: string;
  color: string;
  points: { lat: number; lng: number; timeHour: number; locationName: string }[];
}

// ==========================================
// 生活成本地图 (Cost of Living Map) 类型定义
// ==========================================

export type AdminLevel = 'country' | 'province' | 'city' | 'county';
export type ConfidenceLevel = 'A' | 'B' | 'C' | 'D';

export interface CostRange {
  low: number;
  typical: number;
  high: number;
  unit?: string;
  period?: 'month' | 'year' | 'sqm' | 'once';
}

export type CostDimensionKey =
  | 'housing'
  | 'food'
  | 'utilities'
  | 'transportation'
  | 'communications'
  | 'healthcare'
  | 'education'
  | 'childcare'
  | 'elder_care'
  | 'daily_services'
  | 'clothing_home'
  | 'leisure_social'
  | 'employment_income'
  | 'taxes_social_security'
  | 'environment_safety'
  | 'relocation_overhead';

export interface CostDimensionItem {
  name: string;
  range: CostRange;
  note?: string;
  confidence: ConfidenceLevel;
}

export interface CostDimensionDetail {
  key: CostDimensionKey;
  name: string;
  icon: string;
  monthlyRange: CostRange;
  summary: string;
  confidence: ConfidenceLevel;
  updateDate: string;
  source: string;
  items: CostDimensionItem[];
}

export interface CountySpecialIndicators {
  rentAndHousePriceSummary: string;
  localJobAvailability: string;
  industryConcentration: string[];
  deliveryAndHousekeepingCoverage: string;
  heatingAndCoolingCosts: string;
  travelTimeToHigherHospitals: string; // e.g. "到省会三甲医院 42 分钟"
  highSchoolAndVocationalAccess: string;
  crossCityShoppingCosts: string;
  returnHomeTransportCosts: string;
  retirementSuitabilityScore: number; // 0-100
  retirementSuitabilityNote: string;
  remoteWorkSuitabilityScore: number; // 0-100
  remoteWorkSuitabilityNote: string;
  outOfCountyMedicalForSevere: string;
  accessToSpecialistHealthcare: string;
  accessToHigherEducation: string;
  costOfTravelingToCityCenter: string;
}

export interface RegionalCostData {
  id: string;
  name: string;
  shortName: string;
  level: AdminLevel;
  parentPath: string; // e.g. "中国 · 甘肃省 · 兰州市"
  provinceName: string;
  cityName?: string;
  countyName?: string;
  lat: number;
  lng: number;
  hasData: boolean; // false for empty state testing regions
  emptyStateReason?: string;

  // 综合指数 (0-100)
  overallCostIndex: number;
  incomeOpportunityIndex: number;
  healthcareIndex: number;
  educationIndex: number;
  transportIndex: number;
  livabilityIndex: number;
  environmentIndex: number;

  // 基础收支区间 (元)
  monthlyBasicRange: CostRange;
  annualBasicRange: CostRange;
  afterTaxIncomeRange: CostRange;
  disposableIncomeRange: CostRange;
  housingBurdenRatio: number; // 住房负担比 e.g. 0.28 = 28%

  // 定性与画像
  suitableProfiles: string[];
  mainAdvantages: string[];
  mainCostPressures: string[];

  // 16项成本维度明细
  dimensions: Record<CostDimensionKey, CostDimensionDetail>;

  // 县级特殊评估要素 (若为县级则具备)
  countyIndicators?: CountySpecialIndicators;

  // 数据权威与元信息
  updateDate: string;
  source: string;
  confidenceLevel: ConfidenceLevel;
  sampleSize: string;
  statisticalPeriod: string;
  seasonalVariationWarning?: string;
  isPrototypeDemo: boolean;
}

export type ComparisonMode = 'same_standard' | 'local_lifestyle';

export type LifestylePresetKey =
  | 'single_basic'
  | 'single_comfortable'
  | 'couple'
  | 'family_three'
  | 'family_four'
  | 'student'
  | 'retired'
  | 'custom';

export interface LifestylePreset {
  key: LifestylePresetKey;
  name: string;
  description: string;
  targetHouseholdSize: number;
  householdSize: number;
  housingType: string;
  commuteType: string;
  diningType: string;
  hasChildEducation: boolean;
  educationType: string;
  hasElderCare: boolean;
  defaultIncome: number;
  monthlyNetIncome?: number;
  baseMultiplier: number;
}

export interface BudgetSimulatorInput {
  regionId: string;
  householdSize: number;
  housingType: string;
  commuteType: string;
  diningType: string;
  monthlyNetIncome: number;
  hasChildEducation: boolean;
  educationType: string;
  hasElderCare: boolean;
  preset: LifestylePresetKey;
  monthlyIncome?: number;
  housingPreference?: 'rent' | 'mortgage' | 'owned';
  childrenCount?: number;
  needsChildcare?: boolean;
  hasChronicIllness?: boolean;
  hasCar?: boolean;
  lifestyleStandard?: 'basic' | 'moderate' | 'comfortable';
  annualHomeVisits?: number;
  acceptsCrossCityServices?: boolean;
}

export interface BudgetSimulatorBreakdown {
  housing: number;
  food: number;
  utilities: number;
  transportation: number;
  dailyAndComms: number;
  childEducation: number;
  healthAndCare: number;
  leisureAndMisc: number;
}

export interface BudgetSimulatorOutput {
  regionId: string;
  regionName: string;
  estimatedMonthlyExpense: CostRange;
  estimatedAnnualExpense: CostRange;
  disposableIncome: CostRange;
  recommendedMinIncome: number;
  recommendedEmergencyFund: CostRange; // 6-12 months
  pressures: {
    housing: 'low' | 'moderate' | 'high';
    healthcare: 'low' | 'moderate' | 'high';
    education: 'low' | 'moderate' | 'high';
    transport: 'low' | 'moderate' | 'high';
  };
  initialRelocationCashNeeded: CostRange;
  savingsPotentialMonthly: number;
  estimatedMonthlyBudget: number;
  surplusOrDeficit: number;
  breakdown: BudgetSimulatorBreakdown;
  emergencyBufferRecommended: number;
}

export interface RelocationPlan {
  id: string;
  title: string;
  destinationRegionId: string;
  destinationRegionName: string;
  originRegionName: string;
  targetLevel: AdminLevel;
  householdSize: number;
  monthlyIncome: number;
  breakdown: {
    movingAndTransport: number;
    rentalDepositAndAdvance: number;
    furnitureAndAppliances: number;
    initialSchoolOrRegistration: number;
    firstThreeMonthsBuffer: number;
    totalInitialCashNeeded: number;
  };
  monthlyLocalIncomeVsExpense: {
    estimatedIncome: number;
    estimatedExpense: number;
    netMonthlySurplus: number;
  };
  conclusionTag: '适合立即搬迁' | '建议先尝试短住' | '建议先提升收入储备' | '医疗条件可能不匹配';
  conclusionNote: string;
  createdAt: string;
}

export type CostSubLayerKey =
  | 'cost_index'
  | 'income'
  | 'rent'
  | 'healthcare'
  | 'education'
  | 'transport'
  | 'livability';

export type CostQuickActionKey =
  | 'national'
  | 'province'
  | 'city'
  | 'county'
  | 'budget'
  | 'relocation';

// ==========================================
// 生活图层与地点记忆卡 (Life Layer & Place-Memory)
// ==========================================

export type LifePlaceCategory =
  | 'cafe'
  | 'food'
  | 'nature'
  | 'viewpoint'
  | 'home'
  | 'music'
  | 'fitness'
  | 'study'
  | 'bar'
  | 'secret'
  | 'shopping'
  | 'other';

export interface LifePlaceCreatedBy {
  id: string;
  name: string;
  avatar: string;
  isMe?: boolean;
}

export interface LifePlaceVisit {
  id: string;
  date: string; // "2025-06-01"
  arrival: string; // "12:17"
  departure?: string | null; // "13:02" or null if ongoing
  minutes: number;
  mood: string; // "😄"
  metFriends?: string[]; // friend IDs met in this visit
  note?: string;
  photos?: string[];
  trackSnippet?: [number, number][];
}

export interface LifePlaceEncounterDetail {
  date: string;
  from: string;
  to: string;
  myStayMinutes: number;
  theirStayMinutes: number;
  overlapMinutes: number;
  myLocation?: { lat: number; lng: number };
  theirLocation?: { lat: number; lng: number };
}

export interface LifePlaceEncounterFriend {
  id: string;
  name: string;
  avatar: string;
  closeness: 'bff' | 'close' | 'friend' | 'lover' | 'family';
  encounterCount: number;
  lastEncounterAt: string;
  overlapWindowMinutes: number;
  encounters: LifePlaceEncounterDetail[];
}

export interface LifePlaceVisitorFriend {
  id: string;
  name: string;
  avatar: string;
  visitCount: number;
  visible: boolean;
}

export interface LifePlaceShareTarget {
  userId: string;
  userName?: string;
  avatar?: string;
  mode: 'send_once' | 'added_to_map';
  shareVisitCount: boolean;
  sharePhotos: boolean;
  shareEncounters: boolean;
  shareNotes: boolean;
  at: string;
}

export interface LifePlaceMemory {
  visitCount: number;
  totalDwellMinutes: number;
  avgStayMinutes: number;
  firstVisitAt: string;
  lastVisitAt: string;
  currentlyHere?: boolean;
  currentDwellMinutes?: number;
  visitSparklineWeeks: number[]; // 8-week counts
  dominantMood: string;
  visits: LifePlaceVisit[];
}

export interface LifePlaceEncounters {
  friendCount: number;
  totalEncounters: number;
  friends: LifePlaceEncounterFriend[];
}

export interface LifePlaceVisitors {
  friendsWhoVisit: LifePlaceVisitorFriend[];
  popularByWeekdayHour: number[][]; // 7 days (Mon-Sun) x heat levels or hours
}

export interface LifePlaceSharing {
  forwardedTo: LifePlaceShareTarget[];
  revocable: boolean;
}

export interface LifePlace {
  intent?: 'frequent' | 'favorite' | 'want_to_go';
  id: string;
  name: string;
  category: LifePlaceCategory;
  icon: string;
  color: string;
  lat: number;
  lng: number;
  createdBy: LifePlaceCreatedBy;
  createdAt: string;
  createdByMe: boolean;
  source: 'self' | 'forwarded' | 'imported';
  tags: string[];
  privacy: 'public' | 'friends_only' | 'private';
  note?: string;
  photos?: string[];
  distanceKm?: number;
  direction?: string;
  isSaved?: boolean;
  memory: LifePlaceMemory;
  encounters: LifePlaceEncounters;
  visitors: LifePlaceVisitors;
  sharing: LifePlaceSharing;
}


