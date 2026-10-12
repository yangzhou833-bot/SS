import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isActivityExpired, getActivityStatusInfo, formatCountdownReminder } from '../src/utils/countdownHelper';

test('full activity timestamps use their actual future date instead of today or tomorrow', context => {
  context.mock.timers.enable({apis:['Date'],now:new Date('2026-10-06T12:00:00+08:00')});
  assert.equal(isActivityExpired(undefined,'2026-10-13 09:00','2026-10-13 11:00'),false);
  assert.equal(formatCountdownReminder(undefined,'2026-10-13 09:00'),'倒计时 6天21时');
  assert.equal(getActivityStatusInfo({startTime:'2026-10-13 09:00',endTime:'2026-10-13 11:00'}).statusLabel,'即将开始');
});

test('cross-midnight activities expire at their actual end date and stay active until then', context => {
  context.mock.timers.enable({apis:['Date'],now:new Date('2026-10-07T00:10:00+08:00')});
  assert.equal(isActivityExpired('2026-10-06','2026-10-06 23:30','2026-10-07 00:30'),false);
  assert.equal(isActivityExpired('2026-10-06','23:30','00:30'),false);
  assert.equal(getActivityStatusInfo({startTime:'2026-10-06 23:30',endTime:'2026-10-07 00:30'}).statusLabel,'进行中');
});

test('legacy Chinese dates, explicit years and relative dates retain their meaning', context => {
  context.mock.timers.enable({apis:['Date'],now:new Date('2026-10-06T12:00:00+08:00')});
  assert.equal(isActivityExpired('10月7日 周三','09:00','11:00'),false);
  assert.equal(isActivityExpired('昨天','15:00','18:00'),true);
  assert.equal(isActivityExpired('2025年10月7日','09:00','11:00'),true);
  assert.equal(formatCountdownReminder('明天','15:00'),'倒计时 1天3时');
  assert.equal(getActivityStatusInfo({dateStr:'2026-10-13',startTime:'09:00',endTime:'11:00',status:'completed'}).isArchived,true);
});

test('UTC timestamps and invalid inputs never get silently shifted to another date', context => {
  context.mock.timers.enable({apis:['Date'],now:new Date('2026-10-06T12:00:00+08:00')});
  assert.equal(formatCountdownReminder(undefined,'2026-10-06T06:00:00Z'),'倒计时 02:00:00');
  assert.equal(formatCountdownReminder('2026-02-30','09:00'),'时间待确认');
});
