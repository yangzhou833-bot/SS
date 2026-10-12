import React, { useState, useMemo } from 'react';
import {
  X,
  UserPlus,
  UserCheck,
  MessageSquare,
  MapPin,
  Navigation,
  BatteryCharging,
  Sparkles,
  ExternalLink,
  GraduationCap,
  Tag,
  Check,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { ContactCardData, Friend } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import { USER_LOCATION } from '../data/mockData';
import { calculateLatLngDistanceMeters } from '../utils/geoUtils';

interface ContactBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactData: ContactCardData | null;
  currentFriends: Friend[];
  onOpenProfile?: (userId?: string) => void;
  onStartChat?: (userId: string, userName: string, userAvatar: string) => void;
  onNavigateToMap?: (location: { lat: number; lng: number; name: string }) => void;
  showToast?: (message: string) => void;
  onAddNotification?: (title: string, content: string, type: 'message' | 'like' | 'system' | 'radar') => void;
}

/**
 * Converts lat/lng coordinates to a CartoCDN Voyager tile coordinate at zoom level 14
 */
function getTileUrl(lat: number, lng: number, zoom: number = 14): string {
  try {
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lng + 180) / 360) * n);
    const latRad = (lat * Math.PI) / 180;
    const y = Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
    );
    const subdomains = ['a', 'b', 'c', 'd'];
    const s = subdomains[Math.abs(x + y) % subdomains.length];
    return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${x}/${y}.png`;
  } catch {
    return '';
  }
}

export const ContactBriefModal: React.FC<ContactBriefModalProps> = ({
  isOpen,
  onClose,
  contactData,
  currentFriends,
  onOpenProfile,
  onStartChat,
  onNavigateToMap,
  showToast,
  onAddNotification,
}) => {
  const [requestSent, setRequestSent] = useState(false);

  // Check if this contact is already an existing friend
  const isAlreadyFriend = useMemo(() => {
    if (!contactData) return false;
    if (contactData.userId === 'me' || contactData.role === '本人名片') return true;
    return currentFriends.some(
      (f) =>
        f.id === contactData.userId ||
        f.name.trim() === contactData.name.trim()
    );
  }, [contactData, currentFriends]);

  const isMe = contactData?.userId === 'me' || contactData?.role === '本人名片';

  const lat = contactData?.lat ?? 36.0615;
  const lng = contactData?.lng ?? 103.8085;
  const locationName = contactData?.locationName || '兰州 · 东方红广场';
  const address = contactData?.address || '甘肃省兰州市城关区广场南路';

  // Tile URL
  const tileUrl = useMemo(() => {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return '';
    }
    return getTileUrl(lat, lng, 14);
  }, [lat, lng]);

  // Distance computation
  const distanceText = useMemo(() => {
    if (contactData?.distance) return contactData.distance.replace(/\s*\(.*\)/, '').trim();
    if (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng)
    ) {
      const distM = calculateLatLngDistanceMeters(
        USER_LOCATION.lat,
        USER_LOCATION.lng,
        lat,
        lng
      );
      if (distM < 1000) {
        return `${Math.max(60, Math.round(distM))} m`;
      }
      return `${(distM / 1000).toFixed(1)} km`;
    }
    return '850 m';
  }, [lat, lng, contactData]);

  if (!isOpen || !contactData) return null;

  const handleAddFriend = () => {
    if (isAlreadyFriend || requestSent) return;
    soundEffects.playSuccessSound();
    haptics.trigger('success');
    setRequestSent(true);

    if (showToast) {
      showToast(`已向 ${contactData.name} 发送好友申请 📩`);
    }
    if (onAddNotification) {
      onAddNotification(
        '好友申请已发出',
        `您向 ${contactData.name} 发送了名片好友申请，等待对方通过`,
        'system'
      );
    }
  };

  const handleSendMessage = () => {
    onClose();
    if (onStartChat && contactData.userId) {
      onStartChat(contactData.userId, contactData.name, contactData.avatar);
    } else if (onOpenProfile && contactData.userId) {
      onOpenProfile(contactData.userId);
    }
  };

  const handleViewOnMap = () => {
    onClose();
    if (onNavigateToMap) {
      onNavigateToMap({ lat, lng, name: `${contactData.name} 的位置` });
    }
  };

  const handleOpenFullProfile = () => {
    onClose();
    if (onOpenProfile && contactData.userId) {
      onOpenProfile(contactData.userId);
    }
  };

  const defaultTags = contactData.tags || ['同城探索', '户外运动', '摄影爱好者', '星轨密友'];

  const modalNode = (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200 font-sans select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-2xl flex flex-col max-h-[85%] overflow-hidden animate-in zoom-in-95 duration-200 text-left my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-[#E4E6EB] dark:border-zinc-700 flex items-center justify-between shrink-0 bg-white dark:bg-[#242526]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] border border-[#E4E6EB] dark:border-zinc-700 flex items-center justify-center shadow-2xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#050505] dark:text-[#E4E6EB] flex items-center space-x-1.5">
                <span>好友名片简要信息</span>
                <span className="text-[10px] text-[#1877F2] font-bold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-100 dark:border-blue-900/40">
                  {contactData.role || '名片分享'}
                </span>
              </h3>
              <p className="text-[11px] text-[#65676B] dark:text-zinc-400">
                查看联系人简要概况并可即时添加好友
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-[#F0F2F5] dark:bg-zinc-800 hover:bg-[#E4E6EB] dark:hover:bg-zinc-700 flex items-center justify-center text-[#65676B] dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0">
          {/* User Profile Card Header */}
          <div className="p-3 bg-[#F0F2F5]/60 dark:bg-zinc-800/40 rounded-md border border-[#E4E6EB] dark:border-zinc-700 flex items-start space-x-3.5">
            {/* Avatar Frame with Facebook straight-edge style */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-md overflow-hidden border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs bg-gray-100 dark:bg-zinc-800">
                <img
                  src={contactData.avatar}
                  alt={contactData.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
                  }}
                />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-800 shadow-2xs ${
                  contactData.isOnline !== false ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
                title={contactData.isOnline !== false ? '实时在线' : '离线'}
              />
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <h4 className="text-base font-extrabold text-[#050505] dark:text-[#E4E6EB] truncate">
                  {contactData.name}
                </h4>
                {contactData.handle && (
                  <span className="text-xs text-[#65676B] dark:text-zinc-400 font-medium">
                    {contactData.handle.startsWith('@') ? contactData.handle : `@${contactData.handle}`}
                  </span>
                )}
              </div>

              {/* Status / Tag Line */}
              <div className="mt-1 flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] border border-blue-100 dark:border-blue-900/40 flex items-center space-x-1">
                  <ShieldCheck size={11} />
                  <span>{isAlreadyFriend ? '已是好友' : '推荐名片'}</span>
                </span>
                {contactData.mutualFriendsCount && contactData.mutualFriendsCount > 0 ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F0F2F5] dark:bg-zinc-800 text-[#65676B] dark:text-zinc-300 border border-[#E4E6EB] dark:border-zinc-700">
                    {contactData.mutualFriendsCount}位共同好友
                  </span>
                ) : null}
              </div>

              {/* Signature / Bio */}
              <p className="mt-1.5 text-xs text-[#65676B] dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {contactData.bio || '同城探索达人 · 随时分享精彩生活'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Location block */}
            <div
              onClick={handleViewOnMap}
              className="p-2.5 rounded-md bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2] transition-colors cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center space-x-1 text-[#1877F2] font-bold text-[11px] mb-1">
                <MapPin size={13} className="shrink-0" />
                <span>当前常驻定位</span>
              </div>
              <p className="font-extrabold text-[#050505] dark:text-[#E4E6EB] truncate group-hover:text-[#1877F2] transition-colors text-[12px]">
                {locationName}
              </p>
              <p className="text-[10.5px] text-[#65676B] dark:text-zinc-400 truncate mt-0.5">
                {address}
              </p>
              <div className="mt-1.5 flex items-center space-x-1 text-[10px] text-[#1877F2] font-black">
                <Navigation size={10} className="fill-[#1877F2]" />
                <span>相距 {distanceText}</span>
              </div>
            </div>

            {/* Device & Status block */}
            <div className="p-2.5 rounded-md bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs">
              <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] mb-1">
                <BatteryCharging size={13} className="shrink-0" />
                <span>设备与状态</span>
              </div>
              <p className="font-extrabold text-[#050505] dark:text-[#E4E6EB] truncate text-[12px]">
                电量 {contactData.battery ?? 88}% · 状态正常
              </p>
              <p className="text-[10.5px] text-[#65676B] dark:text-zinc-400 truncate mt-0.5">
                {contactData.isOnline !== false ? '实时在线 · 信号满格' : '5分钟前活跃'}
              </p>
              <div className="mt-1.5 flex items-center space-x-1 text-[10px] text-[#65676B] dark:text-zinc-400 font-medium">
                <GraduationCap size={11} className="text-[#1877F2] shrink-0" />
                <span className="truncate">{contactData.education || '兰州大学 · 软件学院'}</span>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="p-2.5 rounded-md bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs">
            <div className="flex items-center space-x-1 text-[#65676B] dark:text-zinc-400 font-bold text-[11px] mb-1.5">
              <Tag size={12} className="text-[#1877F2]" />
              <span>兴趣与圈子标签</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {defaultTags.map((tag, tIdx) => (
                <span
                  key={`contact-tag-${tag}-${tIdx}`}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F0F2F5] dark:bg-zinc-800 text-[#050505] dark:text-[#E4E6EB] border border-[#E4E6EB] dark:border-zinc-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Map Location Preview matching Map Location Card */}
          {tileUrl && (
            <div
              onClick={handleViewOnMap}
              className="rounded-md overflow-hidden border border-[#E4E6EB] dark:border-zinc-700 relative h-28 cursor-pointer group shadow-2xs"
            >
              <img
                src={tileUrl}
                alt="Location Map Preview"
                className="w-full h-full object-cover filter saturate-[1.1] group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

              {/* Centered Map Pin Anchor Marker with Friend Avatar */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center drop-shadow-md">
                  <div className="w-8 h-8 rounded-full p-0.5 bg-[#1877F2] shadow-md ring-2 ring-white overflow-hidden flex items-center justify-center">
                    <img
                      src={contactData.avatar}
                      alt={contactData.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#1877F2] -mt-[0.5px]" />
                </div>
              </div>

              {/* Bottom location badge */}
              <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded bg-white/95 dark:bg-[#242526]/95 backdrop-blur-xs border border-[#E4E6EB] dark:border-zinc-700 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-1.5 text-[11px] font-extrabold text-[#050505] dark:text-[#E4E6EB] truncate">
                  <MapPin size={12} className="text-[#1877F2] shrink-0" />
                  <span className="truncate">{locationName}</span>
                </div>
                <span className="text-[10px] text-[#1877F2] font-black shrink-0">
                  相距 {distanceText}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-3 border-t border-[#E4E6EB] dark:border-zinc-700 bg-white dark:bg-[#242526] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleOpenFullProfile}
              className="px-2.5 py-1.5 rounded-md text-xs font-bold text-[#65676B] dark:text-zinc-300 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-[#E4E6EB] dark:border-zinc-700 flex items-center space-x-1"
            >
              <span>主页</span>
              <ExternalLink size={11} />
            </button>

            <button
              type="button"
              onClick={handleViewOnMap}
              className="px-2.5 py-1.5 rounded-md text-xs font-bold text-[#1877F2] bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200 dark:border-blue-900/40 flex items-center space-x-1"
            >
              <MapPin size={11} />
              <span>地图定位</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {!isMe && (
              <>
                {isAlreadyFriend ? (
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="px-3.5 py-1.5 rounded-md text-xs font-bold bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white transition-all cursor-pointer flex items-center space-x-1 shadow-2xs"
                  >
                    <MessageSquare size={13} />
                    <span>发消息</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddFriend}
                    disabled={requestSent}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs ${
                      requestSent
                        ? 'bg-emerald-500 text-white cursor-default'
                        : 'bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white'
                    }`}
                  >
                    {requestSent ? (
                      <>
                        <Check size={13} />
                        <span>已发送申请</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={13} />
                        <span>添加好友</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {isMe && (
              <button
                type="button"
                onClick={handleOpenFullProfile}
                className="px-4 py-1.5 rounded-md text-xs font-bold bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white transition-all cursor-pointer flex items-center space-x-1 shadow-2xs"
              >
                <span>编辑我的资料</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return modalNode;
};
