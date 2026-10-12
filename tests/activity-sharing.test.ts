import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activityChatSnapshot, canShareActivityWithFriend, syncActivityConversations } from '../src/utils/activityPlanning';
import type { ChatConversation, SimulatedMapActivity } from '../src/types';

const activity: SimulatedMapActivity = {
  id: 'ride', title: '日落骑行', category: '骑行', icon: '🚴', startTime: '2026-10-11 18:00', endTime: '2026-10-11 20:00',
  timeRange: '18:00 — 20:00', locationName: '森林公园', address: '公园南门', lat: 36.1, lng: 103.8,
  color: '#1877F2', bgGradient: '', status: 'upcoming', statusText: '准备中', privacyLevel: 'selected', visibleFriendIds: ['f-visible'],
  coverImageUrl: 'new-cover.jpg', authorName: 'Alex', equipmentTips: '带水',
  routeNodes: [{ name: '公园南门', lat: 36.1, lng: 103.8, status: 'current' }],
  participants: [{ id: 'f-member', name: 'Ava', avatar: 'ava.jpg', status: 'on_the_way', statusText: '正在滨江路，距集合点 1.2km',
    invitationStatus: 'confirmed', groupRole: 'admin', currentLat: 36.2, currentLng: 103.9, isLocationAuthorized: true,
    trajectoryHistory: [{ lat: 36.15, lng: 103.85, time: '17:50' }], distanceMeters: 1200, distanceText: '1.2km',
    etaMinutes: 8, estimatedArrivalTime: '18:02', speedKmh: 16, isInGeofence: false },
    { id: 'f-invited', name: 'Kimi', avatar: 'kimi.jpg', status: 'preparing', statusText: '等待确认邀请', invitationStatus: 'invited' }],
};

test('shared activity snapshots keep member identity and activity destinations without individual tracking data', () => {
  const snapshot = activityChatSnapshot(activity);
  const member = snapshot.participants[0];
  assert.equal(member.name, 'Ava');
  assert.equal(member.avatar, 'ava.jpg');
  for (const key of ['currentLat', 'currentLng', 'trajectoryHistory', 'distanceMeters', 'distanceText', 'etaMinutes', 'estimatedArrivalTime', 'speedKmh', 'isInGeofence']) {
    assert.equal(Object.hasOwn(member, key), false, `${key} must not be sent with a chat card`);
  }
  assert.equal(member.isLocationAuthorized, false);
  assert.equal(member.statusText, '前往中');
  assert.deepEqual(snapshot.routeNodes, activity.routeNodes);
  assert.equal(activity.participants[0].currentLat, 36.2);
  assert.equal(activity.participants[0].trajectoryHistory?.length, 1);
});

test('activity sharing enforces private and selected audiences including invited members', () => {
  assert.equal(canShareActivityWithFriend({ ...activity, privacyLevel: 'private' }, 'f-member'), false);
  assert.equal(canShareActivityWithFriend(activity, 'f-visible'), true);
  assert.equal(canShareActivityWithFriend(activity, 'f-member'), true);
  assert.equal(canShareActivityWithFriend(activity, 'f-invited'), true);
  assert.equal(canShareActivityWithFriend(activity, 'f-outsider'), false);
  assert.equal(canShareActivityWithFriend({ ...activity, privacyLevel: 'public' }, 'f-outsider'), true);
  assert.equal(canShareActivityWithFriend({ ...activity, privacyLevel: 'friends' }, 'f-outsider'), true);
});

test('activity updates refresh existing group metadata and shared cards while preserving ordinary chats', () => {
  const normalMessage = { id: 'normal', senderId: 'me', isMe: true, text: '带水了吗？', timestamp: '17:50' };
  const oldCard = { id: 'invite', senderId: 'me', isMe: true, text: '旧活动名称', timestamp: '17:00', type: 'activity' as const, activityId: activity.id, activityData: { ...activity, title: '旧活动名称' } };
  const group: ChatConversation = { id: 'activity-chat-ride', friendId: 'activity-chat-ride', friendName: '旧活动名称', avatar: 'old.jpg', lastMessage: normalMessage.text, time: '17:50', unreadCount: 2, isGroup: true,
    groupDetails: { announcement: '', tags: ['活动'], createdAt: '2026-10-10', adminName: '旧发起人', memberCount: 0, members: [] }, messages: [oldCard, normalMessage] };
  const direct: ChatConversation = { id: 'direct', friendId: 'f-visible', friendName: 'Tom', avatar: 'tom.jpg', lastMessage: oldCard.text, time: '17:00', unreadCount: 0, messages: [oldCard] };
  const ordinary: ChatConversation = { ...direct, id: 'ordinary', messages: [normalMessage] };
  const updated = syncActivityConversations([group, direct, ordinary], activity);
  assert.equal(updated[0].friendName, activity.title);
  assert.equal(updated[0].avatar, 'new-cover.jpg');
  assert.deepEqual(updated[0].groupAvatars, ['ava.jpg']);
  assert.equal(updated[0].groupDetails?.memberCount, 1);
  assert.deepEqual(updated[0].groupDetails?.members, [{ id: 'f-member', name: 'Ava', avatar: 'ava.jpg', role: '群主' }]);
  assert.equal(updated[0].groupDetails?.createdAt, '2026-10-10');
  assert.equal(updated[0].lastMessage, normalMessage.text);
  assert.equal(updated[0].messages[1], normalMessage);
  assert.equal(updated[1].messages[0].activityData?.participants[0].currentLat, undefined);
  assert.equal(updated[2], ordinary);
  const unchanged = [ordinary];
  assert.equal(syncActivityConversations(unchanged, activity), unchanged);
});
