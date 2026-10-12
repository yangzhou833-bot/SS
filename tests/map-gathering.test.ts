import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import type { Friend, ActivityParticipantStatus, SimulatedMapActivity } from '../src/types';
import { nearbyLovers, activityArrivalMembers, activityGatheringLocation, renderCoupleGathering, addActivityGathering, gatheringTargetId } from '../src/utils/mapGathering';
import { renderLifeEventMarker } from '../src/utils/friendMarker';

const me = { id: 'me', name: '我', avatar: 'me.png', lat: 36, lng: 103, isOnline: true, isMe: true } as Friend;
const lover = { ...me, id: 'lover', name: '恋人', isMe: false, relationship: 'lover' } as Friend;
const participant = { id: 'member', name: '伙伴', avatar: 'member.png', status: 'arrived', currentLat: 36, currentLng: 103, isLocationAuthorized: true, invitationStatus: 'confirmed' } as ActivityParticipantStatus;
const activity = { id: 'a', icon: '🚴', title: '骑行', lat: 36, lng: 103, status: 'active_countdown', radiusMeters: 100, participants: [participant] } as SimulatedMapActivity;

test('only explicit lovers near the current user gather and source coordinates stay unchanged', () => {
  const friends = [lover, { ...lover, id: 'close', relationship: 'close' } as Friend, { ...lover, id: 'ordinary', relationship: 'friend' } as Friend];
  const before = JSON.stringify(friends);
  assert.deepEqual(nearbyLovers(me, friends, ['all']).map(friend => friend.id), ['lover']);
  assert.equal(JSON.stringify(friends), before);
  assert.equal(nearbyLovers(me, [{ ...lover, lat: 36.0002 }], ['all']).length, 1);
  assert.equal(nearbyLovers(me, [{ ...lover, lat: 36.0003 }], ['all']).length, 0);
  assert.equal(nearbyLovers(me, [{ ...lover, relationship: 'friend', isLover: true }], ['all']).length, 1);
  assert.equal(nearbyLovers({ ...me, lat: 37 }, [lover, { ...lover, id: 'lover-2' }], ['all']).length, 0);
});

test('privacy, per-person filters, selection and navigation expansion prevent unwanted gathering', () => {
  for (const friend of [{ ...lover, isHidden: true }, { ...lover, relationship: 'hidden' } as Friend, { ...lover, isOnline: false }, { ...lover, lat: NaN }]) {
    assert.equal(nearbyLovers(me, [friend], ['all']).length, 0);
  }
  assert.equal(nearbyLovers(me, [lover], ['family']).length, 0);
  assert.equal(nearbyLovers(me, [lover], ['all'], true).length, 0);
  assert.equal(nearbyLovers(me, [lover], ['all'], false, true).length, 0);
  assert.equal(nearbyLovers({ ...me, isOnline: false }, [lover], ['all']).length, 0);
});

test('activity arrival requires membership, confirmed arrival, authorized actual coordinates at the venue', () => {
  const rejected = [
    { ...participant, id: 'invited', invitationStatus: 'invited' as const },
    { ...participant, id: 'unconfirmed-legacy', invitationStatus: undefined },
    { ...participant, id: 'unauthorized', isLocationAuthorized: false },
    { ...participant, id: 'unknown-authorization', isLocationAuthorized: undefined },
    { ...participant, id: 'in-transit', status: 'on_the_way' as const },
    { ...participant, id: 'far-checkin', currentLat: 37, isInGeofence: true },
    { ...participant, id: 'missing', currentLat: undefined },
  ];
  assert.deepEqual(activityArrivalMembers({ ...activity, participants: [participant, ...rejected] }).map(member => member.id), ['member']);
  assert.equal(activityArrivalMembers({ ...activity, venueLocation: { name: '终点', lat: 37, lng: 103 } }).length, 0);
  assert.equal(activityArrivalMembers({ ...activity, radiusMeters: 25, participants: [{ ...participant, currentLat: 36.0003 }] }).length, 0);
  assert.equal(activityArrivalMembers({ ...activity, radiusMeters: undefined, participants: [{ ...participant, currentLat: 36.0005 }] }).length, 1);
});

test('arrival halo and its click focus use the destination while an ungrouped activity keeps its original coordinate', () => {
  const changed = { ...activity, venueLocation: { name: '终点', lat: 37, lng: 104 }, participants: [{ ...participant, currentLat: 37, currentLng: 104 }] };
  const arrived = activityArrivalMembers(changed);
  assert.equal(arrived.length, 1);
  assert.deepEqual(activityGatheringLocation(changed, arrived), changed.venueLocation);
  assert.equal(activityGatheringLocation(changed, []), changed);
  assert.equal(activityGatheringLocation({ ...activity, venueLocation: { name: '无效', lat: NaN, lng: 104 } }, [participant]).lat, activity.lat);
  assert.equal(changed.lat, 36);
  assert.equal(changed.lng, 103);
});

test('ended activities and disabled position sharing do not disclose venue grouping', () => {
  for (const changed of [{ status: 'completed' as const }, { endedAt: 1 }, { activityState: '已结束' as const }, { showLocationAndDistance: false }, { authorizedScope: { isScopeActive: false } as SimulatedMapActivity['authorizedScope'] }]) {
    assert.equal(activityArrivalMembers({ ...activity, ...changed }).length, 0);
  }
});

test('couple avatars preserve individual targets and escape user input; bubbles vary in size and opacity', () => {
  const window = new Window();
  window.document.body.innerHTML = renderCoupleGathering(me, [{ ...lover, name: '<script>坏内容</script>', avatar: 'a.png" onerror="bad' }]);
  assert.equal(window.document.querySelectorAll('button[data-gathering-member]').length, 2);
  assert.equal(window.document.querySelector('script'), null);
  assert.equal(window.document.querySelector('img[onerror]'), null);
  const particles = [...window.document.querySelectorAll('.stellar-gathering-bubbles span')];
  assert.equal(particles.length, 7);
  assert.ok(new Set(particles.map(item => (item as unknown as HTMLElement).style.getPropertyValue('--bubble-size'))).size > 1);
  assert.ok(new Set(particles.map(item => (item as unknown as HTMLElement).style.getPropertyValue('--bubble-opacity'))).size > 1);
  assert.equal(gatheringTargetId(window.document.querySelector('[data-gathering-member="lover"] img') as unknown as EventTarget), 'lover');
  assert.equal(gatheringTargetId(null), null);
});

test('activity halo is limited to six member targets and a count disclosure with independent atmosphere switches', () => {
  const members = Array.from({ length: 9 }, (_, index) => ({ ...participant, id: `p-${index}` }));
  const base = renderLifeEventMarker('🚴', '活动', '地图位置', '时间');
  const window = new Window();
  window.document.body.innerHTML = addActivityGathering(base, activity, members);
  assert.equal(window.document.querySelectorAll('[data-gathering-member]').length, 6);
  assert.equal(window.document.querySelector('.stellar-activity-more')?.textContent, '+3');
  assert.equal(window.document.querySelectorAll('.stellar-event-emoji').length, 1);
  assert.equal(window.document.querySelector('.stellar-gathering-bubbles span')?.textContent, '🚴');
  const slots = [...window.document.querySelectorAll('.stellar-activity-person-slot,.stellar-activity-more')].map(slot => {
    const style = (slot as unknown as HTMLElement).style;
    return [parseFloat(style.getPropertyValue('--person-x')), parseFloat(style.getPropertyValue('--person-y'))];
  });
  for (let a = 0; a < slots.length; a++) for (let b = a + 1; b < slots.length; b++) {
    assert.ok(Math.hypot(slots[a][0] - slots[b][0], slots[a][1] - slots[b][1]) >= 52, 'member touch targets do not overlap');
  }
  for (const switched of [{ enableArrivalAggregationAnimation: false }, { enableFloatingVibes: false }]) {
    window.document.body.innerHTML = addActivityGathering(base, { ...activity, ...switched }, members);
    assert.equal(window.document.querySelector('.stellar-gathering-bubbles'), null);
    assert.equal(window.document.querySelectorAll('[data-gathering-member]').length, 6);
  }
  assert.equal(addActivityGathering(base, activity, []), base);
});
