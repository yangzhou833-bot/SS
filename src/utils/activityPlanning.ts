import type { ActivityCreationUiState } from '../components/ActivityCreationModal';
import type { ActivityRouteNode, Friend, SimulatedMapActivity } from '../types';
import { CURRENT_USER_PROFILE, USER_LOCATION } from '../data/mockData';
import { activityTimeWindow } from './countdownHelper';
import { dateKey, clockTime } from './lifePlanning';
import { validCoordinates } from './creationValidation';

export function activityRouteNodes(form: ActivityCreationUiState): ActivityRouteNode[] {
  const nodes: ActivityRouteNode[] = [];
  if (form.originLocation && validCoordinates(form.originLocation)) {
    nodes.push({ ...form.originLocation, status: 'current', label: '集合点' });
  }
  for (const node of form.itineraryNodes || []) {
    if (node.latLng && validCoordinates(node.latLng)) {
      nodes.push({ name: node.title, ...node.latLng, status: 'planned', label: `第${node.day}天 ${node.time}` });
    }
  }
  if (form.venueLocation && validCoordinates(form.venueLocation)) {
    const last = nodes[nodes.length - 1];
    if (!last || last.lat !== form.venueLocation.lat || last.lng !== form.venueLocation.lng) {
      nodes.push({ ...form.venueLocation, status: 'next', label: '活动地点' });
    }
  }
  return nodes;
}

export function convertPublishedActivity(form: ActivityCreationUiState, friends: Friend[] = [], userLocation = USER_LOCATION): SimulatedMapActivity {
  const me = friends.find(friend => friend.isMe || friend.id === 'me') || CURRENT_USER_PROFILE;
  const venue = form.venueLocation || { name: form.endPoint || form.startPoint || '活动地点', lat: form.lat ?? userLocation.lat, lng: form.lng ?? userLocation.lng };
  const icon = ({ CYCLING: '🚴', RUNNING: '🏃', HIKING: '🥾', FAMILY_HIKE: '🥾', RV_CAMPING: '⛺', SELF_DRIVING: '🚗', READING: '📚', PHOTOGRAPHY: '📷', FOODIE: '🍽️' } as Record<string, string>)[form.subType || ''] || '✨';
  const invited = new Set(form.invitedFriendIds || []);
  return {
    id: form.id || `user-pub-act-${form.title}-${form.startTime}`, title: form.title,
    category: ({ SPORTS: '体育与户外', TRAVEL: '旅行度假', SOCIAL: '同城兴趣', FAMILY: '亲子家庭', CULTURE: '文化生活' } as Record<string, string>)[form.majorType || ''] || '活动',
    icon, startTime: form.startTime, endTime: form.endTime, date: form.startTime.split(/[ T]/)[0], dateStr: form.startTime.split(/[ T]/)[0],
    timeRange: `${form.startTime} — ${form.endTime}`, locationName: venue.name, address: venue.address || venue.name, lat: venue.lat, lng: venue.lng,
    originLocation: form.originLocation, venueLocation: venue, routeNodes: activityRouteNodes(form),
    color: '#1877F2', bgGradient: 'from-blue-600 to-indigo-700', status: 'upcoming', statusText: '准备中', activityState: '即将开始',
    isUserPublished: true, isUserAdmin: true, authorName: me.name, authorAvatar: me.avatar,
    coverImageUrl: form.coverImageUrl || undefined, description: form.description, equipmentTips: form.equipmentTips,
    feeType: form.feeType, fixedFee: form.fixedFee, minParticipants: form.minParticipants, maxParticipants: form.maxParticipants, deadlineTime: form.deadlineTime,
    privacyLevel: form.visibility === '公开' ? 'public' : form.visibility === '仅好友可见' ? 'friends' : form.visibility === '仅自己' ? 'private' : 'selected', visibleFriendIds: [...invited],
    radiusMeters: form.arrivalDistanceThresholdMeters || 100, trackingWindowMinutes: form.trackingWindowBeforeMinutes,
    showLocationAndDistance: form.showParticipantLocationAndDistance, showNavRoutesAndSpeed: form.showParticipantNavigationRoute,
    enableArrivalAggregationAnimation: form.enableArrivalAggregationAnimation, enableFloatingVibes: form.enableFloatingActivityVibes,
    isReminderSet: true, reminderMinutes: form.trackingWindowBeforeMinutes,
    participants: [{ id: 'me', name: me.name, avatar: me.avatar, status: 'preparing', statusText: '发起人 · 准备中', groupRole: 'admin', activityRole: '组织者', invitationStatus: 'confirmed', currentLat: userLocation.lat, currentLng: userLocation.lng, batteryLevel: me.battery, isLocationAuthorized: true },
      ...friends.filter(friend => !friend.isMe && friend.id !== 'me' && invited.has(friend.id)).map(friend => ({ id: friend.id, name: friend.name, avatar: friend.avatar, status: 'preparing' as const, statusText: '等待确认邀请', invitationStatus: 'invited' as const, activityRole: form.participantRoles?.[friend.id] || '成员', isLocationAuthorized: false }))],
    needs: [], moments: [], updates: [],
  };
}

export function elapsedActivitySeconds(activity: SimulatedMapActivity, now = Date.now()): number {
  const window = activityTimeWindow(activity);
  const start = activity.startedAt ?? window.start;
  if (!Number.isFinite(start) || start > now) return 0;
  const finish = activity.endedAt ?? activity.pausedAt ?? (!activity.startedAt && Number.isFinite(window.end) ? Math.min(now, window.end) : now);
  return Math.max(0, Math.floor((finish - start - (activity.pausedDurationMs || 0)) / 1000));
}

export function summarizeActivity(activity: SimulatedMapActivity): string {
  const participants = activity.participants.filter(member => member.invitationStatus !== 'invited').length;
  const solved = (activity.needs || []).filter(need => need.status === 'resolved').length;
  const minutes = Math.floor(elapsedActivitySeconds(activity) / 60);
  return `「${activity.title}」在${activity.locationName}留下了共同的记忆。${participants}位伙伴参与，记录时长${minutes}分钟，收集了${activity.moments?.length || 0}张照片，完成${solved}次互助。${activity.routeNodes?.length ? `计划包含${activity.routeNodes.length}个地点。` : ''}`;
}

export function activityDraft(activity: SimulatedMapActivity, original?: ActivityCreationUiState): ActivityCreationUiState {
  const window = activityTimeWindow(activity);
  const fullTime = (value: number, fallback: string) => Number.isFinite(value) ? `${dateKey(new Date(value))} ${clockTime(new Date(value))}` : fallback;
  return {
    ...original,
    id: activity.id, majorType: original?.majorType || 'SPORTS' as ActivityCreationUiState['majorType'], subType: original?.subType || 'CYCLING' as ActivityCreationUiState['subType'],
    title: activity.title, coverImageUrl: activity.coverImageUrl || null, startTime: fullTime(window.start, activity.startTime), endTime: fullTime(window.end, activity.endTime), deadlineTime: activity.deadlineTime || '',
    minParticipants: activity.minParticipants || 1, maxParticipants: activity.maxParticipants || 10, feeType: activity.feeType || '免费', fixedFee: activity.fixedFee || 0,
    originLocation: activity.originLocation || { name: activity.locationName, address: activity.address, lat: activity.lat, lng: activity.lng },
    venueLocation: activity.venueLocation || { name: activity.locationName, address: activity.address, lat: activity.lat, lng: activity.lng },
    startPoint: activity.originLocation?.name || activity.locationName, endPoint: activity.venueLocation?.name || activity.locationName,
    itineraryNodes: (activity.routeNodes || []).filter(node => node.label !== '集合点' && node.label !== '活动地点').map((node, index) => {
      const stored = original?.itineraryNodes.find(item => item.title === node.name && item.latLng?.lat === node.lat && item.latLng?.lng === node.lng);
      const timing = node.label?.match(/^第(\d+)天\s+(\d{2}:\d{2})$/);
      return { id: stored?.id || `node-${index}`, day: timing ? Number(timing[1]) : stored?.day || 1, time: timing?.[2] || stored?.time || activity.startTime.slice(-5), title: node.name, nodeType: stored?.nodeType || 'SCENIC_SPOT' as ActivityCreationUiState['itineraryNodes'][number]['nodeType'], latLng: { lat: node.lat, lng: node.lng } };
    }),
    invitedFriendIds: activity.participants.filter(member => member.id !== 'me' && member.id !== 'p-me').map(member => member.id),
    participantRoles: Object.fromEntries(activity.participants.map(member => [member.id, member.activityRole || '成员'])),
    description: activity.description || '', equipmentTips: activity.equipmentTips || '', visibility: activity.privacyLevel === 'public' ? '公开' : activity.privacyLevel === 'friends' ? '仅好友可见' : activity.privacyLevel === 'private' ? '仅自己' : '仅参与者',
    isApprovalRequired: original?.isApprovalRequired ?? false, isElectronicFenceEnabled: original?.isElectronicFenceEnabled ?? true, trackingWindowBeforeMinutes: activity.trackingWindowMinutes ?? 30,
    showParticipantLocationAndDistance: activity.showLocationAndDistance !== false, showParticipantNavigationRoute: activity.showNavRoutesAndSpeed !== false,
    enableArrivalAggregationAnimation: activity.enableArrivalAggregationAnimation !== false, enableFloatingActivityVibes: activity.enableFloatingVibes !== false,
    arrivalDistanceThresholdMeters: activity.radiusMeters || 100, isFormValid: false, errorMessages: {},
  };
}

export function activityChatSnapshot(activity: SimulatedMapActivity): SimulatedMapActivity {
  return {
    ...activity,
    participants: activity.participants.map(member => {
      const { currentLat, currentLng, trajectoryHistory, distanceMeters, distanceText, etaMinutes, estimatedArrivalTime, speedKmh, isInGeofence, ...identity } = member;
      return { ...identity, isLocationAuthorized: false, statusText: member.invitationStatus === 'invited' ? '等待确认邀请' : ({ arrived: '已到场', on_the_way: '前往中', departed: '已出发', preparing: '准备中' } as const)[member.status] };
    }),
  };
}

export function canShareActivityWithFriend(activity: SimulatedMapActivity, friendId: string): boolean {
  if (activity.privacyLevel === 'private') return false;
  return activity.privacyLevel !== 'selected' || !!activity.visibleFriendIds?.includes(friendId) || activity.participants.some(member => member.id === friendId);
}

export function syncActivityConversations(conversations: import('../types').ChatConversation[], activity: SimulatedMapActivity): import('../types').ChatConversation[] {
  const snapshot = activityChatSnapshot(activity);
  const members = activity.participants.filter(member => member.invitationStatus !== 'invited');
  const matchesActivity = (message: import('../types').ChatMessage) => message.activityId === activity.id || message.activityData?.id === activity.id;
  let changed = false;
  const updated = conversations.map(conversation => {
    const isActivityGroup = conversation.id === `activity-chat-${activity.id}`;
    if (!isActivityGroup && !conversation.messages.some(matchesActivity)) return conversation;
    changed = true;
    const messages = conversation.messages.map(message => matchesActivity(message) ? {
      ...message, activityData: snapshot, ...(message.type === 'activity' ? { text: message.text.startsWith('[活动') ? `[活动] ${activity.title}` : activity.title } : {}),
    } : message);
    return {
      ...conversation, messages,
      ...(conversation.messages.length && matchesActivity(conversation.messages[conversation.messages.length - 1]) ? { lastMessage: messages[messages.length - 1].text } : {}),
      ...(isActivityGroup ? {
        friendName: activity.title, avatar: activity.coverImageUrl || activity.authorAvatar || conversation.avatar, isGroup: true,
        groupAvatars: members.map(member => member.avatar),
        groupDetails: {
          ...conversation.groupDetails, announcement: activity.equipmentTips || '', tags: conversation.groupDetails?.tags || ['活动'],
          createdAt: conversation.groupDetails?.createdAt || dateKey(), location: activity.locationName, adminName: activity.authorName || '我', memberCount: members.length,
          members: members.map(member => ({ id: member.id, name: member.name, avatar: member.avatar, role: member.groupRole === 'admin' ? '群主' as const : '成员' as const })),
        },
      } : {}),
    };
  });
  return changed ? updated : conversations;
}
