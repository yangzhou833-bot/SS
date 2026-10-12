export function validCoordinates(point?: { lat: number; lng: number } | null) {
  return Boolean(point && Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180);
}

export function coordinateNumber(value: string) {
  return value.trim() ? Number(value) : Number.NaN;
}

export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validClock(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function validScheduleTime(date: string, start: string, end: string, allDay: boolean) {
  return validDate(date) && (allDay || (validClock(start) && validClock(end) && start !== end));
}

export function shanghaiTimestamp(value: string) {
  const parts = value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})$/);
  if (!parts || !validDate(parts[1]) || !validClock(parts[2])) return Number.NaN;
  return Date.parse(`${parts[1]}T${parts[2]}:00+08:00`);
}

export function activityTimeError(start: string, end: string, deadline: string) {
  const startAt = shanghaiTimestamp(start);
  const endAt = shanghaiTimestamp(end);
  if (!Number.isFinite(startAt)) return '请选择有效的活动开始时间';
  if (!Number.isFinite(endAt)) return '请选择有效的活动结束时间';
  if (endAt <= startAt) return '结束时间必须晚于开始时间';
  if (deadline && !Number.isFinite(shanghaiTimestamp(deadline))) return '请选择有效的报名截止时间';
  if (deadline && shanghaiTimestamp(deadline) > startAt) return '报名截止时间不能晚于活动开始时间';
  return null;
}
