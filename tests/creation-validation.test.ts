import { test } from 'node:test';
import assert from 'node:assert/strict';

const validation = () => import('../src/utils/creationValidation');

test('location confirmation rejects missing, empty and out-of-range coordinates while preserving zero', async () => {
  const { validCoordinates, coordinateNumber } = await validation();
  assert.equal(validCoordinates(undefined), false);
  assert.equal(validCoordinates({ lat: 91, lng: 100 }), false);
  assert.equal(validCoordinates({ lat: 30, lng: 181 }), false);
  assert.equal(validCoordinates({ lat: Number.NaN, lng: 100 }), false);
  assert.equal(validCoordinates({ lat: 0, lng: 0 }), true);
  assert.equal(Number.isNaN(coordinateNumber('')), true);
  assert.equal(coordinateNumber('0'), 0);
});

test('date inputs cannot silently roll into another month and equal non-all-day times are invalid', async () => {
  const { validDate, validClock, validScheduleTime } = await validation();
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2028-02-29'), true);
  assert.equal(validDate(''), false);
  assert.equal(validClock('25:00'), false);
  assert.equal(validClock('00:00'), true);
  assert.equal(validScheduleTime('2026-10-06', '23:30', '00:15', false), true);
  assert.equal(validScheduleTime('2026-10-06', '14:00', '14:00', false), false);
  assert.equal(validScheduleTime('2026-10-06', '', '', true), true);
});

test('activity timestamps require valid Shanghai date/time and chronological start/end/deadline', async () => {
  const { activityTimeError, shanghaiTimestamp } = await validation();
  assert.equal(Number.isNaN(shanghaiTimestamp('2026-02-30 09:00')), true);
  assert.equal(activityTimeError('', '2026-10-06 21:00', ''), '请选择有效的活动开始时间');
  assert.equal(activityTimeError('2026-10-06 20:00', '2026-10-06 19:00', ''), '结束时间必须晚于开始时间');
  assert.equal(activityTimeError('2026-10-06 20:00', '2026-10-06 21:00', '2026-10-06 20:30'), '报名截止时间不能晚于活动开始时间');
  assert.equal(activityTimeError('2026-10-06T20:00', '2026-10-07T00:30', '2026-10-06T19:00'), null);
});
