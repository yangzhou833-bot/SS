import type { ActivityParticipantStatus, Friend, SimulatedMapActivity } from '../types';
import { validCoordinates } from './creationValidation';
import { calculateLatLngDistanceMeters } from './geoUtils';
import { escapeMarkerText, friendMatchesMapFilters } from './friendMarker';

export const COUPLE_GATHERING_DISTANCE_METERS = 25;
export const COUPLE_GATHERING_LAYOUT = { size: [136, 112] as [number, number], anchor: [68, 84] as [number, number] };

export function nearbyLovers(me: Friend, friends: readonly Friend[], filters: readonly string[], expanded = false, stealth = false) {
  if (expanded || stealth || !validCoordinates(me) || me.isOnline === false) return [];
  return friends.filter(friend => friend.id !== me.id && !friend.isMe &&
    (friend.relationship === 'lover' || friend.isLover === true) &&
    friend.isOnline !== false && friendMatchesMapFilters(friend, filters) && validCoordinates(friend) &&
    calculateLatLngDistanceMeters(me.lat, me.lng, friend.lat, friend.lng) <= COUPLE_GATHERING_DISTANCE_METERS);
}

export function activityArrivalMembers(activity: SimulatedMapActivity) {
  if (activity.status === 'completed' || activity.endedAt || activity.activityState === '已结束' ||
    activity.showLocationAndDistance === false || activity.authorizedScope?.isScopeActive === false) return [];
  const venue = activity.venueLocation && validCoordinates(activity.venueLocation) ? activity.venueLocation : activity;
  if (!validCoordinates(venue)) return [];
  const radius = Number.isFinite(activity.radiusMeters) && activity.radiusMeters! > 0 ? activity.radiusMeters! : 100;
  return activity.participants.filter(member => member.status === 'arrived' && member.invitationStatus === 'confirmed' &&
    member.isLocationAuthorized === true && validCoordinates({ lat: member.currentLat!, lng: member.currentLng! }) &&
    calculateLatLngDistanceMeters(venue.lat, venue.lng, member.currentLat!, member.currentLng!) <= radius);
}

export function activityGatheringLocation(activity: SimulatedMapActivity, members: readonly ActivityParticipantStatus[]) {
  return members.length && activity.venueLocation && validCoordinates(activity.venueLocation) ? activity.venueLocation : activity;
}

function floatingBubbles(emoji: string) {
  return `<div class="stellar-gathering-bubbles" aria-hidden="true">${Array.from({ length: 7 }, (_, index) =>
    `<span style="--bubble-x:${14 + index * 12}%;--bubble-size:${12 + index % 4 * 4}px;--bubble-opacity:${.34 + index % 3 * .19};--bubble-delay:${-index * .63}s;--bubble-drift:${index % 2 ? 12 : -10}px">${escapeMarkerText(emoji)}</span>`
  ).join('')}</div>`;
}

function avatarButton(person: Pick<Friend, 'id' | 'name' | 'avatar'>, extra = '') {
  return `<button type="button" class="stellar-gathering-person${extra ? ' ' + extra : ''}" data-gathering-member="${escapeMarkerText(person.id)}" aria-label="查看${escapeMarkerText(person.name)}" title="${escapeMarkerText(person.name)}"><img src="${escapeMarkerText(person.avatar)}" alt=""/></button>`;
}

export function renderCoupleGathering(me: Friend, lovers: readonly Friend[]) {
  const people = [me, ...lovers];
  return `<div class="stellar-couple-gathering" aria-label="${escapeMarkerText(people.map(person => person.name).join('、'))}正在相聚">
    ${floatingBubbles('♥')}
    <div class="stellar-couple-frame">${people.slice(0, 3).map(person => avatarButton(person)).join('')}${people.length > 3 ? `<span class="stellar-couple-more">+${people.length - 3}</span>` : ''}</div>
    <i class="stellar-couple-needle" aria-hidden="true"></i><strong class="stellar-couple-label">相聚中</strong>
  </div>`;
}

export function addActivityGathering(html: string, activity: SimulatedMapActivity, members: readonly ActivityParticipantStatus[]) {
  if (!members.length) return html;
  const shown = members.slice(0, 6);
  const slotCount = shown.length + (members.length > shown.length ? 1 : 0);
  const position = (index: number) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / slotCount;
    return `--person-x:${Math.cos(angle) * (slotCount > 6 ? 78 : 64)}px;--person-y:${Math.sin(angle) * (slotCount > 6 ? 62 : 52)}px`;
  };
  const avatars = shown.map((member, index) => `<div class="stellar-activity-person-slot" style="${position(index)}">${avatarButton(member)}</div>`).join('');
  const more = members.length > shown.length ? `<button type="button" class="stellar-activity-more" style="${position(shown.length)}" aria-label="查看全部${members.length}位已到场成员">+${members.length - shown.length}</button>` : '';
  const atmosphere = activity.enableArrivalAggregationAnimation !== false && activity.enableFloatingVibes !== false ? floatingBubbles(activity.icon || '✨') : '';
  return html.replace('class="stellar-event-marker', 'class="stellar-event-marker has-gathering').replace(/<\/div>$/, `${atmosphere}<div class="stellar-activity-gathering" aria-label="${members.length}位伙伴已到场">${avatars}${more}</div></div>`);
}

export function gatheringTargetId(target: EventTarget | null) {
  const element = target as Element | null;
  return typeof element?.closest === 'function' ? element.closest('[data-gathering-member]')?.getAttribute('data-gathering-member') || null : null;
}
