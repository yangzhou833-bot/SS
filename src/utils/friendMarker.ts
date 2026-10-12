import type { Friend } from '../types';
import { getFriendSpeechNoteDetail } from './friendSpeechNotes';
import { getWeatherByLocationName } from './weatherEngine';

export const escapeMarkerText = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));

export function parseStayDurationSeconds(value?: string) {
  if (!value || /km\s*\/?\s*h|车速/i.test(value)) return null;
  const clock = value.match(/(?:停留\s*)?(\d+):(\d{2})(?:\s*分)?/);
  if (clock && Number(clock[2]) < 60) return Number(clock[1])*60+Number(clock[2]);
  let seconds = 0, found = false;
  for (const match of value.matchAll(/(\d+(?:\.\d+)?)\s*(小时|分钟|秒钟?|h(?:ours?)?|min(?:utes?)?|m|s(?:ec(?:onds?)?)?)(?![a-z])/gi)) {
    const unit = match[2].toLowerCase();
    seconds += Number(match[1]) * (/小时|^h/.test(unit) ? 3600 : /分钟|^m/.test(unit) ? 60 : 1);
    found = true;
  }
  return found ? Math.floor(seconds) : null;
}

export function elapsedStaySeconds(friend: Friend, observedAt: number, now: number) {
  const seconds = parseStayDurationSeconds(friend.stayDuration);
  if (seconds === null) return null;
  return seconds + (friend.isOnline === false ? 0 : Math.max(0,Math.floor((now-observedAt)/1000)));
}

export type FriendStayObservation = { friend: Friend; signature: string; observedAt: number };

// Keep a supplied duration as the baseline until its location/status observation changes.
export function observedStaySeconds(friend: Friend, observations: Map<string, FriendStayObservation>, now = Date.now()) {
  const signature = [friend.stayDuration, friend.lat, friend.lng, friend.activityState, friend.isOnline, friend.lastUpdated].join('|');
  let observation = observations.get(friend.id);
  if (!observation || observation.signature !== signature) {
    const providedTime = /(?:Z|[+-]\d{2}:?\d{2})$/.test(friend.lastUpdated || '') ? Date.parse(friend.lastUpdated) : NaN;
    observation = { friend, signature, observedAt: Number.isFinite(providedTime) && providedTime <= now ? providedTime : now };
    observations.set(friend.id, observation);
  }
  return elapsedStaySeconds(observation.friend, observation.observedAt, now);
}

export function formatStayRingLabel(seconds: number | null) {
  if (seconds === null) return '停留待更新';
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}小时${m}分${String(s).padStart(2, '0')}秒`;
  }
  return `${m}分${String(s).padStart(2, '0')}秒`;
}

function formatStayClock(seconds: number | null) {
  if (seconds === null) return '—:—';
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

// The fixed dial is retained; only the short outer hand follows the observed seconds.
export function updateStayRing(element: Element, seconds: number | null) {
  const label = formatStayRingLabel(seconds);
  const clock = element.querySelector('[data-stay-label]');
  if (clock) clock.textContent = formatStayClock(seconds);
  const hand = element.querySelector('[data-stay-hand]');
  const transform = `rotate(${(Math.max(0, Math.floor(seconds ?? 0)) % 60) * 6} 50 50)`;
  if (hand && hand.getAttribute('transform') !== transform) hand.setAttribute('transform', transform);
  element.classList.toggle('is-unobserved', seconds === null);
  element.setAttribute('aria-label', `停留时长 ${label}`);
  const title = element.querySelector('[data-stay-title]');
  if (title && title.textContent !== label) title.textContent = label;
}

const stayRingTicks = Array.from({ length: 60 }, (_, index) => `<line x1="50" y1="${index % 5 === 0 ? 4 : 4.5}" x2="50" y2="${index % 5 === 0 ? 9 : 6.5}" transform="rotate(${index * 6} 50 50)"${index % 5 === 0 ? ' class="is-major"' : ''}/>`).join('');

export function friendMatchesMapFilters(friend: Friend, filters: readonly string[]) {
  if (friend.isHidden || friend.relationship === 'hidden') return false;
  if (filters.includes('all')) return true;
  const family = friend.isFamily || friend.relationship === 'family' || /^fam-/.test(friend.id) || /家人|妈妈|爸爸/.test(friend.name);
  return (filters.includes('friends') && !family)
    || (filters.includes('family') && family)
    || (filters.includes('groups') && Boolean(friend.isGroupMember || friend.groupId || friend.groupName || /^team-/.test(friend.id) || /陈晨|林峰|赵敏|王珂|小组/.test(friend.name)))
    || (filters.includes('squads') && Boolean(friend.teamRole || /先锋/.test(friend.name) || ['user-alex', 'user-sarah'].includes(friend.id)));
}

export function friendMarkerStatus(friend: Friend) {
  const speedMatch = friend.speed?.match(/(\d+(?:\.\d+)?)\s*(?:km\s*\/?\s*h|公里\/?小时)/i);
  const speedKmh = speedMatch ? Number(speedMatch[1]) : null;
  const moving = friend.activityState !== 'sleeping' && (friend.activityState === 'moving' || (speedKmh !== null && speedKmh > 0));
  const context = `${friend.statusNote || ''} ${friend.status || ''} ${friend.locationName || ''}`;
  const sleeping = friend.activityState === 'sleeping';
  const reading = !moving && !sleeping && /读|书|学习|图书馆|reading/i.test(context);
  const activityEmoji = sleeping ? '💤'
    : moving ? (friend.transportMode === 'bicycle' || /🚴|骑行/.test(context + friend.speed) ? '🚴'
      : friend.transportMode === 'car' || /🚗|车/.test(context + friend.speed) ? '🚗' : '🚶')
    : reading ? '📖'
    : /咖啡|coffee|café|cafe|拿铁/i.test(context) ? '☕️'
    : /吃|餐|面包|烘焙|bakery/i.test(context) ? '🍽️'
    : /工作|办公|公司/.test(context) ? '💻'
    : friend.mood || '✨';
  const duration = friend.stayDuration?.match(/\d+(?:\.\d+)?\s*(?:小时|分钟|秒钟?|[hm](?:in)?)/i)?.[0];
  const movementText = moving ? (speedKmh !== null ? `${speedKmh} km/h` : '移动中')
    : duration || '停留中';
  const battery = Number.isFinite(friend.battery) ? Math.round(Math.max(0, Math.min(100, friend.battery))) : null;
  const weather = getWeatherByLocationName(friend.locationName, friend.lat, friend.lng);
  const weatherEmoji = /雨/.test(weather.condition) ? '🌧️' : /雪/.test(weather.condition) ? '❄️'
    : /云|阴/.test(weather.condition) ? '☁️' : /风/.test(weather.condition) ? '🍃' : weather.emoji;
  return { moving, sleeping, reading, activityEmoji, movementText, battery, weather, weatherEmoji };
}

export function friendMarkerLayout(selected: boolean) {
  return selected
    ? { size: [110, 144] as [number, number], anchor: [55, 109] as [number, number], avatarCenterY: 55 }
    : { size: [84, 110] as [number, number], anchor: [42, 78] as [number, number], avatarCenterY: 39 };
}

// The coordinate remains at the needle tip; only the camera moves the avatar into the upper screen.
export function friendFocusCenterOffset(height: number, selected = true) {
  const layout = friendMarkerLayout(selected);
  return height * (0.5 - 0.34) - (layout.anchor[1] - layout.avatarCenterY);
}

export function renderFriendMarker(friend: Friend, options: {
  selected: boolean; distant: boolean; bouncing: boolean; hasUnread: boolean;
  unreadMsg?: string | null; showBubble: boolean;
  reactions: { emoji: string; text?: string }[];
  staySeconds?: number | null;
  note?: { text: string; emoji: string; gradient: string; tail: string; color: string };
}) {
  const state = friendMarkerStatus(friend);
  const staySeconds = options.staySeconds === undefined ? parseStayDurationSeconds(friend.stayDuration) : options.staySeconds;
  const stayLabel = formatStayRingLabel(staySeconds);
  const note = getFriendSpeechNoteDetail(friend);
  const moodEmoji = options.note?.emoji || friend.mood;
  const batteryColor = state.battery !== null && state.battery < 20 ? '#c93643' : state.battery !== null && state.battery < 50 ? '#b45309' : '#188446';
  const speechText = options.note?.text || options.unreadMsg || friend.statusNote || note.cleanText;
  const classes = ['stellar-friend-marker', options.selected ? 'is-selected' : '', options.distant ? 'is-distant' : '', options.bouncing ? 'is-bouncing' : '', friend.isOnline === false ? 'is-offline' : ''].filter(Boolean).join(' ');
  return `<div class="${classes}" data-friend-id="${escapeMarkerText(friend.id)}">
    ${options.showBubble ? `<div class="stellar-friend-note" data-friend-speech-id="${escapeMarkerText(friend.id)}" style="--note-gradient:${options.note?.gradient || note.theme.cssGradient};--note-tail:${options.note?.tail || note.theme.pointerColor};color:${options.note?.color || '#fff'}"><span class="stellar-note-emoji">${escapeMarkerText(options.note?.emoji || note.emoji)}</span><strong>${escapeMarkerText(speechText)}</strong>${options.hasUnread ? '<i class="stellar-note-unread"></i>' : ''}</div>` : ''}
    <div class="stellar-friend-avatar"><img src="${escapeMarkerText(friend.avatar)}" alt="${escapeMarkerText(friend.name)}"/>${options.hasUnread ? '<i class="stellar-avatar-unread"></i>' : ''}</div>
    <span class="stellar-friend-corner corner-activity ${state.sleeping ? 'is-sleeping' : state.reading ? 'is-reading' : 'is-awake'}" title="${escapeMarkerText(state.sleeping ? '睡觉中' : friend.statusNote || friend.status || friend.locationName)}">${state.reading ? '<span class="stellar-reading-book" aria-hidden="true"><i class="book-page page-left"></i><i class="book-page page-right"></i><i class="book-page page-turn"></i><i class="book-spine"></i></span>' : escapeMarkerText(state.activityEmoji)}</span>
    ${moodEmoji ? `<span class="stellar-friend-corner corner-mood" role="img" aria-label="今日心情 ${escapeMarkerText(moodEmoji)}" title="今日心情 ${escapeMarkerText(moodEmoji)}">${escapeMarkerText(moodEmoji)}</span>` : ''}
    <span class="stellar-friend-corner corner-battery" style="color:${batteryColor}" title="电量 ${state.battery === null ? '未知' : state.battery + '%'}"><svg viewBox="0 0 31 19" width="26" height="16" aria-hidden="true"><rect x="1" y="2" width="25" height="15" rx="3" fill="currentColor"/><path d="M29 7v5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><text x="13.5" y="12.8" text-anchor="middle" font-size="8.5" font-weight="900" fill="#fff">${state.battery === null ? '—' : state.battery}</text></svg></span>
    ${state.moving ? `<span class="stellar-friend-corner corner-movement is-moving" aria-label="${escapeMarkerText(state.movementText)}" title="${escapeMarkerText(friend.speed || '移动中')}"><span class="stellar-moving-icon" aria-hidden="true">💨</span></span>` : `<span class="stellar-friend-corner corner-stay-badge" title="停留时长 ${stayLabel}" aria-label="停留时长 ${stayLabel}"><span class="stellar-stay-badge-text">停留</span></span><svg class="stellar-stay-ring${staySeconds === null ? ' is-unobserved' : ''}" data-stay-ring="${escapeMarkerText(friend.id)}" viewBox="0 0 100 100" role="img" aria-label="停留时长 ${stayLabel}"><title data-stay-title>${stayLabel}</title><circle class="stellar-stay-track" cx="50" cy="50" r="43"/><g class="stellar-stay-ticks">${stayRingTicks}</g><g class="stellar-stay-hand" data-stay-hand transform="rotate(${(Math.max(0, Math.floor(staySeconds ?? 0)) % 60) * 6} 50 50)"><line x1="50" y1="9" x2="50" y2="3"/><circle cx="50" cy="3" r="2.6"/></g><text class="stellar-stay-duration" x="50" y="107" text-anchor="middle" data-stay-label>${formatStayClock(staySeconds)}</text></svg>`}
    <i class="stellar-friend-needle" aria-hidden="true"></i>
    <strong class="stellar-friend-name">${escapeMarkerText(friend.name)}</strong>
    ${options.reactions.map(reaction => `<div class="stellar-friend-reaction"><span>${escapeMarkerText(reaction.emoji)}</span>${reaction.text ? `<b>${escapeMarkerText(reaction.text)}</b>` : ''}</div>`).join('')}
  </div>`;
}

export function renderLifeEventMarker(icon: string, title: string, description: string, detail: string, arrived = false) {
  return `<div class="stellar-event-marker ${arrived ? 'is-arrived' : ''}"><div class="stellar-event-note"><strong>${escapeMarkerText(title)}</strong><span>${escapeMarkerText(description || detail)}</span>${description ? `<small>${escapeMarkerText(detail)}</small>` : ''}</div><span class="stellar-event-emoji">${escapeMarkerText(icon)}</span><i class="stellar-event-needle" aria-hidden="true"></i>${arrived ? '<span class="stellar-event-arrived">✓</span>' : ''}</div>`;
}

export function isDuplicateActivitySchedule(scheduleId: string, renderedActivityIds: ReadonlySet<string>) {
  return scheduleId.startsWith('sched-act-') && renderedActivityIds.has(scheduleId.slice('sched-act-'.length));
}
