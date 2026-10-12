import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import type { Friend } from '../src/types';
import { friendMarkerStatus, friendMarkerLayout, friendFocusCenterOffset, renderFriendMarker, renderLifeEventMarker, isDuplicateActivitySchedule, parseStayDurationSeconds, elapsedStaySeconds, formatStayRingLabel, observedStaySeconds, updateStayRing, friendMatchesMapFilters, type FriendStayObservation } from '../src/utils/friendMarker';

const friend = { id:'friend-marker',name:'Alex',avatar:'avatar.png',status:'咖啡时间',locationName:'咖啡厅',lat:36.061,lng:103.834,battery:75,isOnline:true,activityState:'idle',speed:'0 km/h',stayDuration:'商圈停留 45分钟' } as Friend;

test('stationary zero speed shows existing stay duration and coffee context', () => {
  const result = friendMarkerStatus(friend);
  assert.equal(result.moving, false);
  assert.equal(result.movementText, '45分钟');
  assert.equal(result.activityEmoji, '☕️');
  assert.equal(result.battery, 75);
});
test('movement uses supplied speed and never invents missing movement or stay values', () => {
  assert.equal(friendMarkerStatus({...friend,activityState:'moving',speed:'4.2 km/h 🚶'}).movementText, '4.2 km/h');
  assert.equal(friendMarkerStatus({...friend,activityState:'moving',speed:undefined}).movementText, '移动中');
  assert.equal(friendMarkerStatus({...friend,stayDuration:undefined}).movementText, '停留中');
  assert.equal(friendMarkerStatus({...friend,activityState:'sleeping'}).activityEmoji, '💤');
});
test('camera offset places both avatar sizes at 34 percent while the needle stays at its coordinate', () => {
  for (const selected of [false,true]) {
    const layout = friendMarkerLayout(selected);
    for (const height of [500,850]) {
      const coordinateScreenY = height / 2 - friendFocusCenterOffset(height, selected);
      const avatarScreenY = coordinateScreenY - (layout.anchor[1] - layout.avatarCenterY);
      assert.ok(Math.abs(avatarScreenY - height * .34) < .001);
    }
  }
});
test('marker text is escaped and speech, status corners, stay ring and needle are retained for selection', () => {
  const html = renderFriendMarker({...friend,name:'<img onerror="alert(1)">',statusNote:'hello <script>',mood:'😊'}, {selected:true,distant:false,bouncing:false,hasUnread:false,showBubble:true,reactions:[]});
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('onerror="alert(1)"'));
  for (const className of ['stellar-friend-note','corner-activity','corner-mood','corner-battery','stellar-stay-ring','stellar-friend-needle','is-selected']) assert.ok(html.includes(className));
  assert.ok(renderLifeEventMarker('📅','<Schedule>','阅读计划','20:30').includes('&lt;Schedule&gt;'));
});
test('the upper-left sticker shows the supplied mood and never substitutes location weather for a missing mood', () => {
  const window = new Window();
  const options = {selected:false,distant:false,bouncing:false,hasUnread:false,showBubble:true,reactions:[]};
  window.document.body.innerHTML = renderFriendMarker({...friend,mood:'😍'}, options);
  assert.equal(window.document.querySelector('.corner-mood')?.textContent, '😍');
  assert.equal(window.document.querySelector('.corner-weather'), null);
  window.document.body.innerHTML = renderFriendMarker(friend, options);
  assert.equal(window.document.querySelector('.corner-mood'), null);
  window.document.body.innerHTML = renderFriendMarker({...friend,mood:'😍'}, {...options,note:{text:'我的便签',emoji:'😎',gradient:'#1877f2',tail:'#1877f2',color:'#fff'}});
  assert.equal(window.document.querySelector('.corner-mood')?.textContent, '😎', 'the current user retains the explicitly selected mood');
});
test('derived activity schedules hide only while their actual activity pin is visible', () => {
  assert.equal(isDuplicateActivitySchedule('sched-act-act-1', new Set(['act-1'])), true);
  assert.equal(isDuplicateActivitySchedule('sched-act-act-1', new Set()), false, 'the schedules-only layer keeps derived schedule pins');
  assert.equal(isDuplicateActivitySchedule('sched-act-act-1', new Set(['act-2'])), false, 'another visible activity does not hide this schedule');
  assert.equal(isDuplicateActivitySchedule('schedule-1', new Set(['act-1'])), false, 'ordinary schedules remain visible');
});
test('reading retains turning pages and its battery while a fixed clock ring leaves the portrait unobstructed', () => {
  const readingFriend = {...friend,status:'咖啡厅读书中',statusNote:'阅读新小说'};
  assert.equal(friendMarkerStatus(readingFriend).reading, true);
  const window = new Window();
  window.document.body.innerHTML = renderFriendMarker(readingFriend, {selected:true,distant:false,bouncing:false,hasUnread:false,showBubble:true,reactions:[]});
  const battery = window.document.querySelector('.corner-battery')!;
  assert.equal(battery.querySelector('svg text')?.textContent, '75');
  assert.equal(battery.children.length, 1, 'battery text remains inside the icon');
  const ring = window.document.querySelector('.stellar-stay-ring')!;
  assert.equal(ring.querySelector('textPath'), null, 'duration text never follows or rotates around the portrait');
  assert.equal(ring.querySelector('[data-stay-label]')?.textContent, '45:00');
  assert.equal(ring.querySelectorAll('.stellar-stay-ticks line').length, 60);
  const needle = ring.querySelector('[data-stay-hand] line')!;
  assert.ok(Number(needle.getAttribute('y1')) <= 9 && Number(needle.getAttribute('y2')) <= 9, 'the short radial hand stays outside the photograph');
  assert.equal(window.document.querySelector('.stellar-timer-colon'), null);
  assert.equal(window.document.querySelector('.corner-movement'), null);
  assert.equal(battery.querySelector('svg rect')?.getAttribute('fill'),'currentColor');
  assert.ok(window.document.querySelector('.stellar-reading-book .page-turn'));
});

test('stay duration parses actual hour/minute/second data and advances only online observations', () => {
  assert.equal(parseStayDurationSeconds('停留 1.5h'),5400);
  assert.equal(parseStayDurationSeconds('停留 2小时14分钟5秒'),8045);
  assert.equal(parseStayDurationSeconds('停留 2:14分'),134);
  assert.equal(parseStayDurationSeconds('车速 38km/h'),null);
  assert.equal(parseStayDurationSeconds(undefined),null);
  assert.equal(elapsedStaySeconds({...friend,stayDuration:'停留 2:14分'},10000,13000),137);
  assert.equal(elapsedStaySeconds({...friend,isOnline:false,stayDuration:'停留 2:14分'},10000,13000),134);
  assert.equal(elapsedStaySeconds({...friend,stayDuration:undefined},10000,13000),null);
});

test('friends sharing coordinates retain independent clocks and never share an avatar frame', () => {
  const window = new Window();
  const options = {selected:false,distant:false,bouncing:false,hasUnread:false,showBubble:true,reactions:[]};
  window.document.body.innerHTML = [friend, {...friend,id:'lover',relationship:'lover'} as Friend]
    .map(item => renderFriendMarker(item,options)).join('');
  assert.equal(window.document.querySelectorAll('[data-friend-id]').length,2);
  assert.equal(window.document.querySelectorAll('.stellar-friend-avatar').length,2);
  const rings = window.document.querySelectorAll('[data-stay-ring]');
  assert.deepEqual(Array.from(rings, ring => ring.getAttribute('data-stay-ring')), ['friend-marker', 'lover']);
  updateStayRing(rings[0] as unknown as Element, 2715);
  assert.equal(rings[0].querySelector('[data-stay-hand]')?.getAttribute('transform'), 'rotate(90 50 50)');
  assert.equal(rings[1].querySelector('[data-stay-hand]')?.getAttribute('transform'), 'rotate(0 50 50)');
  assert.equal(window.document.querySelector('.stellar-friend-cluster'),null);
});

test('the clock hand advances six degrees per real second and completes a minute without rebuilding fixed ticks', () => {
  assert.equal(formatStayRingLabel(4920),'1小时22分00秒');
  assert.equal(formatStayRingLabel(7199),'1小时59分59秒');
  assert.equal(formatStayRingLabel(7200),'2小时0分00秒');
  assert.equal(formatStayRingLabel(null),'停留待更新');
  const window = new Window();
  window.document.body.innerHTML = renderFriendMarker({...friend,stayDuration:undefined}, {selected:false,distant:false,bouncing:false,hasUnread:false,showBubble:true,reactions:[]});
  const ring = window.document.querySelector('.stellar-stay-ring')!;
  const hand = ring.querySelector('[data-stay-hand]');
  const ticks = ring.querySelector('.stellar-stay-ticks');
  const circle = ring.querySelector('circle');
  for (const [seconds, angle, label] of [[4920,0,'1:22:00'],[4921,6,'1:22:01'],[4935,90,'1:22:15'],[4950,180,'1:22:30'],[4979,354,'1:22:59'],[4980,0,'1:23:00']] as const) {
    updateStayRing(ring as unknown as Element,seconds);
    assert.equal(ring.querySelector('[data-stay-hand]')?.getAttribute('transform'),`rotate(${angle} 50 50)`);
    assert.equal(ring.querySelector('[data-stay-label]')?.textContent,label);
    assert.equal(ring.querySelector('[data-stay-hand]'),hand);
    assert.equal(ring.querySelector('.stellar-stay-ticks'),ticks);
    assert.equal(ring.querySelector('circle'),circle);
  }
  assert.equal(ring.querySelector('[data-stay-title]')?.textContent,'1小时23分00秒');
  updateStayRing(ring as unknown as Element,null);
  assert.equal(ring.querySelector('[data-stay-label]')?.textContent,'—:—');
  assert.ok(ring.classList.contains('is-unobserved'), 'unknown duration has no invented ticking progress');
});

test('baseline observations advance online and reset only when the actual stay observation changes', () => {
  const observations = new Map<string,FriendStayObservation>();
  const snapshot = {...friend,stayDuration:'1小时22分钟',lastUpdated:'刚刚'};
  assert.equal(observedStaySeconds(snapshot,observations,10000),4920);
  assert.equal(observedStaySeconds({...snapshot,name:'New name'},observations,71000),4981);
  assert.equal(observedStaySeconds({...snapshot,lat:37,stayDuration:'1分钟'},observations,71000),60);
  assert.equal(observedStaySeconds({...snapshot,isOnline:false},observations,90000),4920);
  assert.equal(observedStaySeconds({...snapshot,isOnline:false},observations,150000),4920);
  assert.equal(observedStaySeconds({...snapshot,stayDuration:undefined},observations,180000),null);
});

test('friend layer membership is per person and does not depend on a proximity group', () => {
  assert.equal(friendMatchesMapFilters(friend,['friends']),true);
  assert.equal(friendMatchesMapFilters({...friend,isFamily:true},['friends']),false);
  assert.equal(friendMatchesMapFilters({...friend,isFamily:true},['family']),true);
  assert.equal(friendMatchesMapFilters({...friend,isGroupMember:true},['groups']),true);
  assert.equal(friendMatchesMapFilters(friend,['groups']),false);
  assert.equal(friendMatchesMapFilters({...friend,isHidden:true},['friends']),false);
  assert.equal(friendMatchesMapFilters({...friend,isHidden:true},['all']),false);
  assert.equal(friendMatchesMapFilters({...friend,relationship:'hidden'},['all']),false);
});

test('movement shows only its icon and sleeping does not retain a reading or moving state', () => {
  const window = new Window();
  window.document.body.innerHTML = renderFriendMarker({...friend,activityState:'moving',speed:'4.2 km/h'}, {selected:false,distant:false,bouncing:false,hasUnread:false,showBubble:true,reactions:[]});
  const movement = window.document.querySelector('.corner-movement')!;
  assert.equal(movement.textContent, '💨');
  assert.equal(window.document.querySelector('.stellar-stay-ring'), null);
  assert.equal(movement.getAttribute('aria-label'), '4.2 km/h');
  const sleeping = friendMarkerStatus({...friend,status:'图书馆读书',activityState:'sleeping',speed:'4.2 km/h'});
  assert.equal(sleeping.activityEmoji, '💤');
  assert.equal(sleeping.reading, false);
  assert.equal(sleeping.moving, false);
  assert.equal(friendMarkerStatus({...friend,battery:150}).battery, 100);
  assert.equal(friendMarkerStatus({...friend,battery:-5}).battery, 0);
  assert.equal(friendMarkerStatus({...friend,battery:NaN}).battery, null);
});

test('a rebuilt marker receives the current observed stay instead of flashing its original baseline',()=>{
  const observations=new Map<string,FriendStayObservation>();
  const snapshot={...friend,stayDuration:'1小时22分钟'};
  observedStaySeconds(snapshot,observations,10000);
  const staySeconds=observedStaySeconds(snapshot,observations,71000);
  const window=new Window();
  window.document.body.innerHTML=renderFriendMarker(snapshot,{selected:true,distant:false,bouncing:false,hasUnread:false,showBubble:true,reactions:[],staySeconds});
  assert.equal(window.document.querySelector('[data-stay-label]')?.textContent,'1:23:01');
  assert.equal(window.document.querySelector('[data-stay-hand]')?.getAttribute('transform'),'rotate(6 50 50)');
});

test('an offline observation keeps the hand at its real phase instead of inventing movement',()=>{
  const observations=new Map<string,FriendStayObservation>();
  const snapshot={...friend,isOnline:false,stayDuration:'停留 2:14分'};
  const window=new Window();
  window.document.body.innerHTML=renderFriendMarker(snapshot,{selected:true,distant:false,bouncing:false,hasUnread:false,showBubble:true,reactions:[],staySeconds:observedStaySeconds(snapshot,observations,10000)});
  const ring=window.document.querySelector('.stellar-stay-ring')!;
  updateStayRing(ring as unknown as Element,observedStaySeconds(snapshot,observations,13000));
  assert.equal(ring.querySelector('[data-stay-hand]')?.getAttribute('transform'),'rotate(84 50 50)');
  assert.equal(ring.querySelector('[data-stay-label]')?.textContent,'2:14');
});
