import React, { useState, useMemo } from 'react';
import { Search, X, UserCheck, Send, Check, MapPin, MessageSquare, ChevronDown } from 'lucide-react';
import { Friend, ContactCardData, ChatConversation } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import { CURRENT_USER_PROFILE, USER_LOCATION } from '../data/mockData';
import { calculateLatLngDistanceMeters } from '../utils/geoUtils';

interface ShareContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  currentUser?: Friend;
  conversations?: ChatConversation[];
  activeChatId?: string | null;
  onSendContactCard: (contact: ContactCardData, targetChatId?: string) => void;
}

export const ShareContactModal: React.FC<ShareContactModalProps> = ({
  isOpen,
  onClose,
  friends,
  currentUser = CURRENT_USER_PROFILE,
  conversations = [],
  activeChatId,
  onSendContactCard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string>('me');
  const [customTargetChatId, setCustomTargetChatId] = useState<string>(activeChatId || (conversations[0]?.id || ''));

  // Sync activeChatId when it changes
  React.useEffect(() => {
    if (activeChatId) {
      setCustomTargetChatId(activeChatId);
    } else if (conversations.length > 0 && !customTargetChatId) {
      setCustomTargetChatId(conversations[0].id);
    }
  }, [activeChatId, conversations]);

  // Current selected destination conversation
  const targetConv = useMemo(() => {
    return conversations.find((c) => c.id === customTargetChatId || c.id === activeChatId) || conversations[0];
  }, [conversations, customTargetChatId, activeChatId]);

  // Build full list of contacts including current user at top
  const allContacts = useMemo<ContactCardData[]>(() => {
    // 1. My Profile option (本人名片)
    const myData: ContactCardData = {
      userId: currentUser.id || 'me',
      name: `${currentUser.name.replace(/\s*\(.*\)/, '')} (我)`,
      avatar: currentUser.avatar,
      bio: currentUser.status || '在线 · 随时在线守护中 🟢',
      role: '本人名片',
      locationName: '甘肃省 · 兰州市城关区 东方红广场',
      address: '甘肃省兰州市城关区广场南路',
      lat: currentUser.lat ?? USER_LOCATION.lat,
      lng: currentUser.lng ?? USER_LOCATION.lng,
      distance: '0m (当前位置)',
      isOnline: true,
      mutualFriendsCount: friends.length,
      statusText: currentUser.status,
      battery: 98,
      education: '兰州大学 · 信息科学与工程学院',
      tags: ['本人名片', '原点守护', '同城探索', '星空漫步'],
    };

    // 2. Friends list (好友名片)
    const friendCards: ContactCardData[] = friends.map((f) => {
      let distText = f.distance || '1.2km';
      if (f.lat && f.lng) {
        const dMeters = calculateLatLngDistanceMeters(USER_LOCATION.lat, USER_LOCATION.lng, f.lat, f.lng);
        distText = dMeters < 1000 ? `${Math.round(dMeters)}m` : `${(dMeters / 1000).toFixed(1)}km`;
      }
      return {
        userId: f.id,
        name: f.name,
        avatar: f.avatar,
        bio: f.status || f.profileDetail?.bio || '同城探索达人 · 随时分享精彩生活',
        role: f.role || '推荐好友',
        locationName: f.locationName || '兰州市城关区',
        address: f.address || `${f.locationName || '兰州市'}附近`,
        lat: f.lat,
        lng: f.lng,
        distance: distText,
        isOnline: f.isOnline,
        mutualFriendsCount: Math.floor(Math.random() * 8) + 2,
        statusText: f.status,
        battery: f.battery ?? Math.floor(Math.random() * 40) + 60,
        education: f.education || '兰州大学 · 软件学院',
        tags: f.tags || ['同城探索', '户外运动', '星轨密友', '摄影达人'],
        isFriend: true,
      };
    });

    return [myData, ...friendCards];
  }, [currentUser, friends]);

  // Filter contacts by search term
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return allContacts;
    const term = searchTerm.toLowerCase();
    return allContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.bio && c.bio.toLowerCase().includes(term)) ||
        (c.locationName && c.locationName.toLowerCase().includes(term)) ||
        (c.role && c.role.toLowerCase().includes(term))
    );
  }, [allContacts, searchTerm]);

  // Derive active selection
  const activeSelection = useMemo(() => {
    return (
      allContacts.find((c) => c.userId === selectedContactId) ||
      allContacts[0]
    );
  }, [allContacts, selectedContactId]);

  if (!isOpen) return null;

  const handleSelect = (contact: ContactCardData) => {
    soundEffects.playTapSound();
    haptics.trigger('light');
    if (contact.userId) {
      setSelectedContactId(contact.userId);
    }
  };

  const handleConfirmSend = (target?: ContactCardData) => {
    const toSend = target || activeSelection;
    if (!toSend) return;
    soundEffects.playSuccessSound();
    haptics.trigger('success');
    const finalTargetChatId = activeChatId || customTargetChatId || (conversations[0]?.id || '');
    onSendContactCard(toSend, finalTargetChatId);
    onClose();
  };

  const modalNode = (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200 font-sans select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-2xl flex flex-col max-h-[85%] overflow-hidden animate-in zoom-in-95 duration-200 text-left my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header matching Facebook straight-edge style */}
        <div className="px-4 py-3 border-b border-[#E4E6EB] dark:border-zinc-700 flex items-center justify-between shrink-0 bg-white dark:bg-[#242526]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] border border-[#E4E6EB] dark:border-zinc-700 flex items-center justify-center shadow-2xs">
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#050505] dark:text-[#E4E6EB] flex items-center space-x-1.5">
                <span>选择名片分享</span>
                <span className="text-[10px] text-[#1877F2] font-bold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-100 dark:border-blue-900/40">
                  单选联系人
                </span>
              </h3>
              <p className="text-[11px] text-[#65676B] dark:text-zinc-400">
                向好友或群聊发送包含头像与基本信息的个人名片卡片
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

        {/* Target Recipient Banner if opened without activeChatId or to allow switching target */}
        {conversations.length > 0 && (
          <div className="px-4 py-2 bg-blue-50/50 dark:bg-blue-950/20 border-b border-[#E4E6EB] dark:border-zinc-700 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-[#65676B] dark:text-zinc-300 font-medium">
              <MessageSquare size={13} className="text-[#1877F2] shrink-0" />
              <span>发送至：</span>
              <span className="font-extrabold text-[#050505] dark:text-[#E4E6EB]">
                {targetConv ? targetConv.friendName : '当前会话'}
              </span>
            </div>

            {!activeChatId && conversations.length > 1 && (
              <div className="relative">
                <select
                  value={customTargetChatId}
                  onChange={(e) => setCustomTargetChatId(e.target.value)}
                  className="text-xs bg-white dark:bg-zinc-800 border border-[#CED0D4] dark:border-zinc-700 rounded px-2 py-1 font-bold text-[#1877F2] focus:outline-none cursor-pointer"
                >
                  {conversations.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.friendName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Search Input Bar */}
        <div className="px-4 py-2.5 bg-white dark:bg-[#242526] border-b border-[#E4E6EB] dark:border-zinc-700 shrink-0">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-[#65676B] dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索联系人、昵称、签名或定位地点..."
              className="w-full h-9 bg-white dark:bg-[#18191A] pl-9 pr-8 rounded-md text-xs font-medium text-[#050505] dark:text-[#E4E6EB] placeholder-[#65676B] dark:placeholder-zinc-400 border border-[#CED0D4] dark:border-zinc-700 focus:outline-none focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] shadow-2xs leading-normal"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 w-4 h-4 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center text-gray-700 dark:text-zinc-200 hover:bg-gray-400"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
          <div className="text-[11.5px] font-bold text-[#65676B] dark:text-zinc-400 px-0.5 flex items-center justify-between">
            <span>选择要分享的名片联系人</span>
            <span className="text-[11px] text-[#1877F2] font-bold">共 {filteredContacts.length} 位联系人</span>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#65676B] dark:text-zinc-400">
              未找到符合条件的联系人
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {filteredContacts.map((contact) => {
                const isSelected = (contact.userId === selectedContactId) || (!selectedContactId && contact.userId === 'me');
                return (
                  <div
                    key={contact.userId || contact.name}
                    onClick={() => handleSelect(contact)}
                    onDoubleClick={() => handleConfirmSend(contact)}
                    className={`p-2.5 rounded-md border transition-all cursor-pointer flex items-center justify-between select-none group ${
                      isSelected
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-[#1877F2] ring-1 ring-[#1877F2]/40 shadow-2xs'
                        : 'bg-white dark:bg-[#242526] border-[#E4E6EB] dark:border-zinc-700 hover:border-[#1877F2]/50 hover:bg-gray-50/70 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {/* Avatar with Facebook Straight-Edge Line Frame */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-md overflow-hidden border border-[#E4E6EB] dark:border-zinc-700 shadow-2xs bg-gray-100 dark:bg-zinc-800">
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';
                            }}
                          />
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-800 shadow-2xs ${
                            contact.isOnline !== false ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>

                      {/* Contact Details matching Facebook style */}
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-[13px] font-extrabold text-[#050505] dark:text-[#E4E6EB] truncate">
                            {contact.name}
                          </h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-xs bg-[#F0F2F5] dark:bg-zinc-800 text-[#65676B] dark:text-zinc-400 border border-[#E4E6EB] dark:border-zinc-700 shrink-0">
                            {contact.role || '推荐好友'}
                          </span>
                        </div>

                        {/* Status / Activity */}
                        <p className="text-[11px] text-[#65676B] dark:text-zinc-400 truncate mt-0.5 font-medium">
                          {contact.bio}
                        </p>

                        {/* Location & Distance Line */}
                        <div className="flex items-center space-x-1 text-[10.5px] text-[#1877F2] truncate mt-0.5 font-semibold">
                          <MapPin size={11} className="shrink-0 text-[#1877F2]" />
                          <span className="truncate">{contact.locationName}</span>
                          <span className="text-gray-300 dark:text-zinc-600 shrink-0">·</span>
                          <span className="font-bold shrink-0">{contact.distance}</span>
                        </div>
                      </div>
                    </div>

                    {/* Radio Select Checkbox + Quick Send Action */}
                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmSend(contact);
                        }}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity px-2 py-1 bg-[#1877F2] hover:bg-blue-600 text-white rounded text-[11px] font-bold shadow-2xs cursor-pointer flex items-center space-x-1"
                        title="立即发送此名片"
                      >
                        <Send size={11} />
                        <span>发送</span>
                      </button>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#1877F2] border-[#1877F2] text-white shadow-2xs'
                            : 'border-[#CED0D4] dark:border-zinc-600 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t border-[#E4E6EB] dark:border-zinc-700 bg-white dark:bg-[#242526] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-bold text-[#050505] dark:text-zinc-300 hover:bg-[#F0F2F5] dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-[#CED0D4] dark:border-zinc-700 shadow-2xs"
          >
            取消
          </button>

          <button
            type="button"
            onClick={() => handleConfirmSend()}
            disabled={!activeSelection}
            className="px-4 py-2 rounded-md text-xs font-bold bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={13} />
            <span>发送名片卡片</span>
          </button>
        </div>
      </div>
    </div>
  );

  return modalNode;
};

