import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ActivityCreationUiState } from '../src/components/ActivityCreationModal';
import { activityDraft, convertPublishedActivity, elapsedActivitySeconds, summarizeActivity } from '../src/utils/activityPlanning';
import { CURRENT_USER_PROFILE, INITIAL_FRIENDS } from '../src/data/mockData';
import { scheduleTime } from '../src/utils/lifePlanning';

const form = {
  id: 'activity-regression', majorType: 'SPORTS', subType: 'CYCLING', title: '跨日骑行', coverImageUrl: 'cover.jpg',
  startTime: '2026-10-11 23:30', endTime: '2026-10-12 01:00', deadlineTime: '2026-10-11 22:30',
  originLocation: { name: '集合点', lat: 0, lng: 0 }, venueLocation: { name: '目的地', lat: 0, lng: 1 },
  startPoint: '集合点', endPoint: '目的地', itineraryNodes: [{ id: 'stop', day: 2, time: '00:10', title: '补给', nodeType: 'REST_STOP', latLng: { lat: 0, lng: 0.5 } }],
  minParticipants: 1, maxParticipants: 6, fixedFee: 0, feeType: 'AA制', equipmentTips: '水和头盔', description: '沿河骑行',
  invitedFriendIds: [INITIAL_FRIENDS[0].id], participantRoles: { [INITIAL_FRIENDS[0].id]: '摄影' },
  visibility: '仅参与者', trackingWindowBeforeMinutes: 0, showParticipantLocationAndDistance: false,
  showParticipantNavigationRoute: true, enableArrivalAggregationAnimation: false, enableFloatingActivityVibes: true,
} as ActivityCreationUiState;

test('published activity preserves zero coordinates, route, cover and actual invited members without simulated motion', () => {
  const activity = convertPublishedActivity(form, [CURRENT_USER_PROFILE, INITIAL_FRIENDS[0]], { lat: 0, lng: 0 });
  assert.equal(activity.id, form.id);
  assert.equal(activity.coverImageUrl, 'cover.jpg');
  assert.deepEqual(activity.routeNodes?.map(node => [node.lat, node.lng]), [[0, 0], [0, 0.5], [0, 1]]);
  assert.equal(activity.participants.length, 2);
  assert.equal(activity.participants[0].id, 'me');
  assert.equal(activity.participants[0].status, 'preparing');
  assert.equal(activity.participants[1].invitationStatus, 'invited');
  assert.equal(activity.participants[1].activityRole, '摄影');
  assert.equal(activity.participants[1].speedKmh, undefined);
  assert.equal(activity.participants[1].currentLat, undefined);
  assert.equal(activity.trackingWindowMinutes, 0);
  assert.equal(activity.privacyLevel, 'selected');
  const draft = activityDraft(activity);
  assert.equal(draft.startTime, form.startTime); assert.equal(draft.endTime, form.endTime);
  assert.equal(draft.itineraryNodes.length, 1);
  assert.equal(draft.itineraryNodes[0].day, 2); assert.equal(draft.itineraryNodes[0].time, '00:10');
  const edited = activityDraft(activity, { ...form, isElectronicFenceEnabled: false, isApprovalRequired: true });
  assert.equal(edited.itineraryNodes[0].nodeType, 'REST_STOP');
  assert.equal(edited.isElectronicFenceEnabled, false); assert.equal(edited.isApprovalRequired, true);
  assert.equal(activityDraft({ ...activity, privacyLevel: 'private' }).visibility, '仅自己');
  assert.equal(convertPublishedActivity({ ...form, visibility: '仅自己' }).privacyLevel, 'private');
});

test('automatic end clamps elapsed time while pause/resume/manual end use stored lifecycle timestamps', () => {
  const activity = convertPublishedActivity(form);
  assert.equal(elapsedActivitySeconds(activity, scheduleTime('2026-10-12 10:00')), 5400);
  const start = scheduleTime(form.startTime);
  const manual = { ...activity, startedAt: start, pausedAt: start + 120000, pausedDurationMs: 30000 };
  assert.equal(elapsedActivitySeconds(manual, start + 300000), 90);
  assert.equal(elapsedActivitySeconds({ ...manual, pausedAt: undefined, endedAt: start + 300000, pausedDurationMs: 60000 }, start + 900000), 240);
  const old = activityDraft({ ...activity, startTime: '23:30', endTime: '01:00', dateStr: '2026-10-11' });
  assert.equal(old.startTime, form.startTime); assert.equal(old.endTime, form.endTime);
});

test('activity memory summary counts confirmed membership and resolved help from recorded data', () => {
  const activity = convertPublishedActivity(form, [CURRENT_USER_PROFILE, INITIAL_FRIENDS[0]]);
  activity.needs = [{ id: 'need', title: '补水', description: '', authorId: 'me', authorName: '我', lat: 0, lng: 0, createdAt: 1, status: 'resolved', helperName: '好友' }];
  activity.endedAt = Date.now();
  activity.startedAt = activity.endedAt - 5400000;
  const summary = summarizeActivity(activity);
  assert.match(summary, /1位伙伴参与/); assert.match(summary, /完成1次互助/); assert.match(summary, /90分钟/);
});
