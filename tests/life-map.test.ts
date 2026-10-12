import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Schedule } from '../src/types';

async function planning() {
  const module = await import('../src/utils/lifePlanning').catch(() => null);
  assert.ok(module, 'lifePlanning must implement the shared schedule time rules');
  return module;
}
const schedule = {
  id: 'life-test', type: 'general', title: '咖啡约见', icon: '☕', color: '#1877F2',
  startAt: '2026-10-06T18:00:00+08:00', endAt: '2026-10-06T19:00:00+08:00',
  allDay: false, timezone: 'Asia/Shanghai', location: {name:'咖啡馆',latitude:36.065,longitude:103.832},
  reminders: [30], mapVisibleAt:'起飞/开始前 2 小时', keepAsHistory:false,
  visibilityRule:{scope:'private'}, createdAt:'2026-10-06T08:00:00+08:00', updatedAt:'2026-10-06T08:00:00+08:00',
} as Schedule;

test('dates use Shanghai time and schedule startAt works without legacy date fields', async () => {
  const p = await planning();
  assert.equal(p.dateKey(new Date('2026-10-05T17:00:00Z')), '2026-10-06');
  assert.deepEqual(p.scheduleDateParts(schedule), {date:'2026-10-06',start:'18:00',end:'19:00'});
});
test('map pins respect visibility windows, ending and cancellation', async () => {
  const p = await planning();
  assert.equal(p.isScheduleOnMap(schedule, Date.parse('2026-10-06T15:59:59+08:00')), false);
  assert.equal(p.isScheduleOnMap(schedule, Date.parse('2026-10-06T16:00:00+08:00')), true);
  assert.equal(p.isScheduleOnMap(schedule, Date.parse('2026-10-06T19:00:00+08:00')), false);
  assert.equal(p.isScheduleOnMap({...schedule,mapVisibleAt:'120'}, Date.parse('2026-10-06T16:00:00+08:00')), true);
  assert.equal(p.isScheduleOnMap({...schedule,mapVisibleAt:'起飞/开始前 12 小时'}, Date.parse('2026-10-06T05:59:00+08:00')), false);
  assert.equal(p.isScheduleOnMap({...schedule,mapVisibleAt:'起飞/开始前 12 小时'}, Date.parse('2026-10-06T06:00:00+08:00')), true);
  assert.equal(p.isScheduleOnMap({...schedule,status:'cancelled'}, Date.parse('2026-10-06T18:00:00+08:00')), false);
});
test('travel time and arrival buffer move departure across midnight', async () => {
  const p = await planning();
  const early = {...schedule,startAt:'2026-10-06T00:10:00+08:00'};
  assert.equal(p.departureAt(early, 25, 10), Date.parse('2026-10-05T23:35:00+08:00'));
  const origin = {lat:36.061,lng:103.832};
  const walk = p.estimateRoute(origin, {lat:36.071,lng:103.832}, 'walking');
  const drive = p.estimateRoute(origin, {lat:36.071,lng:103.832}, 'driving');
  assert.ok(walk.minutes > drive.minutes);
  assert.ok(walk.distanceKm > 1);
});
test('reminders do not repeat and cancelled/disabled items produce none', async () => {
  const p = await planning();
  const now = Date.parse('2026-10-06T17:30:00+08:00');
  const first = p.dueReminders([schedule], now, new Set());
  assert.equal(first.length, 1);
  assert.equal(p.dueReminders([schedule], now, new Set(first.map(item => item.key))).length, 0);
  assert.equal(p.dueReminders([{...schedule,status:'cancelled'}], now, new Set()).length, 0);
  assert.equal(p.dueReminders([{...schedule,reminder:{enabled:false,advanceMinutes:30}}], now, new Set()).length, 0);
  assert.equal(p.dueReminders([{...schedule,reminder:{enabled:false,advanceMinutes:30},travelPlan:{mode:'walking',minutes:20,bufferMinutes:10,remindDeparture:true}}], now, new Set())[0].kind, '出发');
});
test('legacy life layer aliases resolve to the same place layer', async () => {
  const p = await planning();
  assert.deepEqual(p.normalizeMapFilters(['life_layer','life','friends']), ['places','friends']);
});
