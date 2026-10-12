// ADD: Lover and Relationship Overlay System (Batch 1-6)
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Friend, BeaconPoint, CustomMapMarker } from "../types";
import { ClayCarAvatarWithHearts } from "./ClayCarAvatarWithHearts";
import {
  Heart,
  Sparkles,
  Footprints,
  Navigation,
  ShieldCheck,
  Flame,
  Users,
  X,
  Send,
  MessageCircle,
  Calendar,
  AlertCircle,
  Radio,
  EyeOff,
  PhoneCall,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ADD: Helper distance calculator
function getDistMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ADD: Interface for Lover & Relationship Overlay Props
export interface LoverAndRelationshipOverlayProps {
  friends: Friend[];
  userLat?: number;
  userLng?: number;
  isStealthMode?: boolean;
  beacons?: BeaconPoint[];
  customMarkers?: CustomMapMarker[];
  showToast?: (message: string) => void;
  onSelectFriend?: (friend: Friend) => void;
}

// ADD: Ground secret message interface
interface SecretGroundNote {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  lat: number;
  lng: number;
  time: string;
}

export const LoverAndRelationshipOverlay: React.FC<LoverAndRelationshipOverlayProps> = ({
  friends,
  userLat = 36.0610,
  userLng = 103.8320,
  isStealthMode = false,
  beacons = [],
  customMarkers = [],
  showToast,
  onSelectFriend,
}) => {
  // ADD: State for lover selection and interactions
  const [loverHeartCount, setLoverHeartCount] = useState<number>(12);
  const [flyingHearts, setFlyingHearts] = useState<{ id: number; startX: number; startY: number }[]>([]);
  const [isTogetherWalkActive, setIsTogetherWalkActive] = useState<boolean>(false);
  const [isAnniversaryMode, setIsAnniversaryMode] = useState<boolean>(true); // Anniversary day line
  const [hasEncounterCelebrated, setHasEncounterCelebrated] = useState<boolean>(false);
  const [showMeetingCard, setShowMeetingCard] = useState<boolean>(false);
  const [familyAlert, setFamilyAlert] = useState<string | null>(null);
  const [selectedGroundNote, setSelectedGroundNote] = useState<SecretGroundNote | null>(null);
  const [isCardDismissed, setIsCardDismissed] = useState<boolean>(true);

  // ADD: Auto-dismiss card on map slide, drag, or clicking outside
  useEffect(() => {
    if (isCardDismissed) return;

    const handleOutsideInteraction = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const container = document.getElementById("lover-overlay-card-container");
      if (container && container.contains(target)) {
        return;
      }

      setIsCardDismissed(true);
    };

    const timer = setTimeout(() => {
      window.addEventListener("pointerdown", handleOutsideInteraction);
      window.addEventListener("touchmove", handleOutsideInteraction);
    }, 250);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", handleOutsideInteraction);
      window.removeEventListener("touchmove", handleOutsideInteraction);
    };
  }, [isCardDismissed]);

  // ADD: Find Lover in friends list (defaults to Sarah Chen / f1 or relationship === 'lover')
  const loverFriend = useMemo(() => {
    return (
      friends.find((f) => f.relationship === ("lover" as any) || f.name.includes("薛梦") || f.id === "f1") ||
      friends[0]
    );
  }, [friends]);

  // ADD: Real-time Distance between Me and Lover (in meters)
  const loverDistanceMeters = useMemo(() => {
    if (!loverFriend) return 1800; // fallback 1.8km
    return Math.round(getDistMeters(userLat, userLng, loverFriend.lat, loverFriend.lng));
  }, [userLat, userLng, loverFriend]);

  // ADD: Secret Ground Notes placed around downtown Lanzhou
  const groundNotes: SecretGroundNote[] = useMemo(
    () => [
      {
        id: "note-1",
        authorName: loverFriend?.name || "薛梦",
        authorAvatar: loverFriend?.avatar || "",
        text: "💌 这里的正宗牛肉面超好吃！特别多加了一份辣子~",
        lat: 36.0605,
        lng: 103.8335,
        time: "10分钟前留",
      },
      {
        id: "note-2",
        authorName: "周杰伦",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300",
        text: "☕ 发现黄河边这间宝藏咖啡馆，晚风非常舒服！",
        lat: 36.0655,
        lng: 103.8160,
        time: "半小时前留",
      },
    ],
    [loverFriend]
  );

  // ADD: Filter family low battery members (<20%)
  const lowBatteryFamilyMembers = useMemo(() => {
    return friends.filter((f) => f.isFamily && f.battery < 20);
  }, [friends]);

  // ADD: Filter close friends near user (<200m)
  const nearbyCloseFriends = useMemo(() => {
    return friends.filter(
      (f) =>
        f.isCloseFriend &&
        !f.isFamily &&
        getDistMeters(userLat, userLng, f.lat, f.lng) <= 250
    );
  }, [friends, userLat, userLng]);

  // ADD: Detect multi-person cluster (≥3 friends within 300m of each other)
  const multiPersonSpot = useMemo(() => {
    if (friends.length < 3) return null;
    const centerLat = 36.0595;
    const centerLng = 103.8340;
    const count = friends.filter(
      (f) => getDistMeters(centerLat, centerLng, f.lat, f.lng) <= 400
    ).length;
    return count >= 3 ? { lat: centerLat, lng: centerLng, count, name: "东方红广场商圈" } : null;
  }, [friends]);

  // ADD: Detect shared destination (e.g., both user & lover targeting same location)
  const sharedDestination = useMemo(() => {
    return {
      name: "东方红广场星巴克 💕",
      lat: 36.0595,
      lng: 103.8340,
      userDist: Math.round(getDistMeters(userLat, userLng, 36.0595, 103.8340)),
      loverDist: Math.round(getDistMeters(userLat, userLng, 36.0595, 103.8340)),
    };
  }, [userLat, userLng]);

  // ADD: Trigger lover "送爱心" parabolic animation & dismiss reminder card on completion
  const handleSendHeart = () => {
    const newId = Date.now();
    setFlyingHearts((prev) => [...prev, { id: newId, startX: window.innerWidth / 2, startY: window.innerHeight - 100 }]);
    setLoverHeartCount((prev) => prev + 1);

    if (showToast) {
      showToast(`已完成提醒：向 ${loverFriend?.name || "恋人"} 发送爱心 💕 (+1)`);
    }

    setTimeout(() => {
      setFlyingHearts((prev) => prev.filter((h) => h.id !== newId));
    }, 1000);

    // 提醒完成后卡片自动消失
    setTimeout(() => {
      setIsCardDismissed(true);
    }, 500);
  };

  // ADD: Trigger "想你了" heart projectile & dismiss reminder card on completion
  const handleSendMissYou = () => {
    const newId = Date.now();
    setFlyingHearts((prev) => [...prev, { id: newId, startX: window.innerWidth / 2, startY: window.innerHeight - 100 }]);
    setLoverHeartCount((prev) => prev + 1);

    if (showToast) {
      showToast(`已完成提醒：向 ${loverFriend?.name || "恋人"} 发送「想你了」提醒 💖`);
    }

    setTimeout(() => {
      setFlyingHearts((prev) => prev.filter((h) => h.id !== newId));
    }, 1000);

    // 提醒完成后卡片自动消失
    setTimeout(() => {
      setIsCardDismissed(true);
    }, 500);
  };

  // ADD: Batch 2: Encounter celebration trigger (<20m proximity check)
  const hasCelebratedSessionRef = useRef(false);
  useEffect(() => {
    if (isStealthMode) return;
    if (loverDistanceMeters <= 20 && !hasCelebratedSessionRef.current) {
      hasCelebratedSessionRef.current = true;
      setHasEncounterCelebrated(true);
      setShowMeetingCard(true);
      if (showToast) {
        showToast("🎉 你们相聚在此！开启今日浪漫相遇记录");
      }
    } else if (loverDistanceMeters > 50) {
      // Reset only when user actually moves away and comes back
      hasCelebratedSessionRef.current = false;
      setHasEncounterCelebrated(false);
    }
  }, [loverDistanceMeters, isStealthMode, showToast]);

  // ADD: Family geofence safety alert simulate (停留 2 秒后自动消失)
  useEffect(() => {
    let dismissTimer: NodeJS.Timeout | null = null;
    const timer = setTimeout(() => {
      setFamilyAlert("🛡️ [爸爸] 已进入 华中温泉花园 安全区域");
      dismissTimer = setTimeout(() => {
        setFamilyAlert(null);
      }, 2000);
    }, 8000);
    return () => {
      clearTimeout(timer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, []);

  const [isLoverModalOpen, setIsLoverModalOpen] = useState<boolean>(false);

  return (
    <>
      {/* 1:1 Prototype Dedicated Fullscreen Interactive Modal (一比一还原产品原型大弹窗) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isLoverModalOpen && loverFriend && (
          <div className="fixed inset-0 z-[850] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-white border border-[#E4E6EB] rounded-md shadow-2xl max-w-sm w-full overflow-hidden relative flex flex-col"
            >
              {/* Header Title Bar */}
              <div className="px-4 py-3 border-b border-[#E4E6EB] flex items-center justify-between bg-gray-50/70">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🚗</span>
                  <h3 className="text-sm font-bold text-gray-900">恋人行驶状态 · 1:1 原型展示</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLoverModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-sm cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Main 1:1 Clay Car & Love Heart Exhaust Hero Canvas */}
              <div className="relative w-full bg-gradient-to-b from-rose-50/40 to-white py-6 px-4 flex flex-col items-center justify-center border-b border-[#E4E6EB] overflow-hidden">
                <div className="relative py-2 flex items-center justify-center">
                  <ClayCarAvatarWithHearts
                    avatarUrl={loverFriend.avatar}
                    avatarAlt={loverFriend.name}
                    size="lg"
                    speedText={loverFriend.speed || '42 km/h 🚗'}
                    isDriving={true}
                    onClick={handleSendHeart}
                  />
                </div>

                <p className="text-[11px] text-gray-500 mt-2 text-center">
                  ✨ 点击粘土汽车可向 <span className="font-bold text-pink-600">{loverFriend.name}</span> 发送互动爱心
                </p>
              </div>

              {/* Real-time Telemetry & Lover Details */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 border border-[#E4E6EB] rounded-md p-2">
                    <span className="text-[10px] text-gray-500 block">实时车速</span>
                    <span className="text-xs font-black text-rose-600">{loverFriend.speed || '42 km/h'}</span>
                  </div>
                  <div className="bg-gray-50 border border-[#E4E6EB] rounded-md p-2">
                    <span className="text-[10px] text-gray-500 block">相距距离</span>
                    <span className="text-xs font-black text-gray-900">{loverFriend.distance || '1.8km'}</span>
                  </div>
                  <div className="bg-gray-50 border border-[#E4E6EB] rounded-md p-2">
                    <span className="text-[10px] text-gray-500 block">今日爱心</span>
                    <span className="text-xs font-black text-pink-600">{loverHeartCount} 颗</span>
                  </div>
                </div>

                {/* Status Message */}
                <div className="bg-rose-50/60 border border-rose-100 rounded-md p-2.5 flex items-start space-x-2">
                  <Sparkles size={14} className="text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-gray-700 leading-relaxed">
                    <span className="font-bold text-gray-900">{loverFriend.name}</span> 正在黄河风情线主干道向你行驶中，电量保持充沛（92%）。
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSendMissYou}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-3 rounded-md text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer active:scale-98 shadow-xs"
                  >
                    <Heart size={14} className="fill-white" />
                    <span>发送「想你了」</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectFriend) onSelectFriend(loverFriend);
                      setIsLoverModalOpen(false);
                      if (showToast) showToast(`已在地图上对焦 ${loverFriend.name} 的粘土红车行驶轨迹 🗺️`);
                    }}
                    className="bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold py-2 px-3 rounded-md text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer active:scale-98 shadow-xs"
                  >
                    <Compass size={14} />
                    <span>地图对焦跟随</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* ADD: BATCH 1 & 2 - Screen Edge Ambient Pink Glow for Lover Proximity */}
      {/* ========================================================= */}
      {!isStealthMode && loverDistanceMeters <= 500 && loverDistanceMeters > 10 && (
        <div
          className="fixed inset-0 pointer-events-none z-20 transition-opacity duration-1000"
          style={{
            boxShadow: `inset 0 0 ${Math.max(15, 60 - loverDistanceMeters / 10)}px rgba(236, 72, 153, ${
              0.15 + (500 - loverDistanceMeters) / 1000
            })`,
          }}
        />
      )}

      {/* ========================================================= */}
      {/* ADD: BATCH 2 - Flying Parabolic Hearts Layer (z-60) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {flyingHearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 1, scale: 0.6, x: 0, y: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0.6, 1.4, 0.9],
              x: [0, -40, 60],
              y: [0, -250, -450],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-60 text-2xl drop-shadow-md"
          >
            💖
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* ADD: BATCH 5 - Family Safe Zone Banner Alert (z-60) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {familyAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-60 bg-white border border-[#E4E6EB] shadow-md rounded-full px-3 py-1 flex items-center space-x-2 text-[10.5px] font-bold text-gray-800"
          >
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
            <span>{familyAlert}</span>
            <button
              type="button"
              onClick={() => setFamilyAlert(null)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full cursor-pointer ml-1"
            >
              <X size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* ADD: BATCH 2 - Fullscreen Encounter Celebration Popup (z-[800]) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showMeetingCard && (
          <div className="fixed inset-0 z-[800] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-300">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white border border-[#E4E6EB] rounded-2xl shadow-2xl p-5 max-w-xs w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500" />

              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Heart size={24} className="fill-pink-500 stroke-pink-500 animate-bounce" />
              </div>

              <h3 className="text-base font-black text-gray-900 mb-1">
                🎉 今日浪漫相聚达成！
              </h3>
              <p className="text-[11px] text-gray-600 mb-4">
                你与 <span className="font-bold text-pink-600">{loverFriend?.name || "恋人"}</span> 在【东方红广场】顺利相遇！实时距离 0m
              </p>

              <div className="bg-pink-50/80 border border-pink-200/80 rounded-xl p-2.5 mb-4 text-left flex items-center space-x-2">
                <span className="text-xl">📸</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-pink-900">相聚卡片已自动打卡</span>
                  <span className="text-[8.5px] text-pink-700">记录于 {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowMeetingCard(false)}
                  className="flex-1 bg-[#1877F2] hover:bg-blue-600 text-white font-bold py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                >
                  太棒啦！收下卡片
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
