import type { Schedule, LifePlace } from '../types';
import { calculateLatLngDistanceMeters } from './geoUtils';

export type TravelMode = 'walking' | 'cycling' | 'driving';
export type PlaceIntent = 'frequent' | 'favorite' | 'want_to_go';
export interface LifeMapTarget { lat: number; lng: number; name: string; scheduleId?: string; planRoute?: boolean; timestamp: number }
export interface LifeRoute { points: [number, number][]; distanceKm: number; minutes: number; estimated: boolean }
export const TRAVEL_MODES: {id:TravelMode;label:string;icon:string}[] = [
  {id:'walking',label:'步行',icon:'🚶'}, {id:'cycling',label:'骑行',icon:'🚲'}, {id:'driving',label:'驾车',icon:'🚗'},
];
export const PLACE_INTENTS: {id:PlaceIntent;label:string}[] = [
  {id:'frequent',label:'常去'}, {id:'favorite',label:'喜欢'}, {id:'want_to_go',label:'想去'},
];
export function dateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
export function clockTime(time: number | Date) {
  return new Intl.DateTimeFormat('zh-CN', {timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(time);
}
export function scheduleTime(value?: string) {
  if (!value) return NaN;
  const iso = value.trim().replace(' ', 'T');
  return Date.parse(/(Z|[+-]\d{2}:?\d{2})$/i.test(iso) ? iso : `${iso.length === 10 ? `${iso}T00:00:00` : iso}+08:00`);
}
export function scheduleDateParts(schedule: Schedule) {
  const start = scheduleTime(schedule.startAt);
  const end = scheduleTime(schedule.endAt);
  return {date:Number.isFinite(start) ? dateKey(new Date(start)) : schedule.startDate || '', start:Number.isFinite(start) ? clockTime(start) : schedule.startTime || '', end:Number.isFinite(end) ? clockTime(end) : schedule.endTime || ''};
}
export function schedulePhase(schedule: Schedule, now = Date.now()) {
  if (schedule.status === 'cancelled') return 'cancelled';
  const start = scheduleTime(schedule.startAt);
  const end = scheduleTime(schedule.endAt) || start + (schedule.allDay ? 86400000 : 3600000);
  if (schedule.status === 'completed' || now >= end) return 'ended';
  return now >= start ? 'active' : 'upcoming';
}
export function isScheduleOnMap(schedule: Schedule, now = Date.now()) {
  if (schedule.status === 'cancelled') return false;
  const start = scheduleTime(schedule.startAt);
  if (!Number.isFinite(start)) return false;
  const end = scheduleTime(schedule.mapHideAt) || scheduleTime(schedule.endAt) || start + (schedule.allDay ? 86400000 : 3600000);
  if ((schedule.status === 'completed' || now >= end) && (!schedule.keepAsHistory || !!schedule.mapHideAt)) return false;
  const rule = schedule.mapVisibleAt || '日程当天';
  if (rule === 'always' || /立即|immediately/.test(rule)) return true;
  const explicit = scheduleTime(rule);
  const hours = rule.match(/(\d+)h_before|(?:前\s*)(\d+)\s*小时/);
  const visible = Number.isFinite(explicit) ? explicit : /^\d+$/.test(rule) ? start - Number(rule) * 60000 : hours ? start - Number(hours[1] || hours[2]) * 3600000 : /1d_before|提前 1 天/.test(rule) ? start - 86400000 : scheduleTime(scheduleDateParts(schedule).date);
  return now >= visible;
}
export function normalizeMapFilters(filters: string[]) {
  return [...new Set(filters.map(value => ['life','life_layer'].includes(value) ? 'places' : value))];
}
export function placeIntent(place: LifePlace): PlaceIntent {
  return place.intent || (place.tags?.includes('想去') ? 'want_to_go' : place.isSaved ? 'favorite' : 'frequent');
}
export function estimateRoute(origin: {lat:number;lng:number}, target: {lat:number;lng:number}, mode: TravelMode): LifeRoute {
  const distanceKm = calculateLatLngDistanceMeters(origin.lat, origin.lng, target.lat, target.lng) / 1000 * 1.25;
  const speed = mode === 'walking' ? 4.8 : mode === 'cycling' ? 15 : 30;
  return {points:[[origin.lat,origin.lng],[target.lat,target.lng]],distanceKm:Math.round(distanceKm * 10) / 10,minutes:Math.max(1,Math.ceil(distanceKm / speed * 60)),estimated:true};
}
export function withEstimatedTravelPlan(schedule: Schedule, origin: {lat:number;lng:number}): Schedule {
  if (schedule.travelPlan || !Number.isFinite(schedule.location.latitude) || !Number.isFinite(schedule.location.longitude)) return schedule;
  const mode = schedule.type === 'flight' ? 'driving' : 'walking';
  const route = estimateRoute(origin,{lat:schedule.location.latitude,lng:schedule.location.longitude},mode);
  return {...schedule,travelPlan:{mode,minutes:route.minutes,bufferMinutes:schedule.type === 'flight' ? 60 : 10,remindDeparture:true,estimated:true}};
}
export function departureAt(schedule: Schedule, minutes: number, bufferMinutes = 10) {
  return scheduleTime(schedule.startAt) - (minutes + bufferMinutes) * 60000;
}
export function dueReminders(schedules: Schedule[], now: number, seen: Set<string>) {
  return schedules.flatMap(schedule => {
    if (['ended','cancelled'].includes(schedulePhase(schedule, now))) return [];
    const start = scheduleTime(schedule.startAt);
    const reminders = (schedule.reminder?.enabled === false ? [] : schedule.reminders?.length ? schedule.reminders : schedule.reminder?.enabled ? [schedule.reminder.advanceMinutes] : []).map(minutes => ({kind:'开始',at:start - minutes * 60000}));
    if (schedule.travelPlan?.remindDeparture) reminders.push({kind:'出发',at:departureAt(schedule,schedule.travelPlan.minutes,schedule.travelPlan.bufferMinutes)});
    return reminders.filter(item => {
      const key = `${schedule.id}:${item.kind}:${item.at}`;
      return !seen.has(key) && now >= item.at && now - item.at <= 300000;
    }).map(item => ({key:`${schedule.id}:${item.kind}:${item.at}`,schedule,kind:item.kind}));
  });
}
export async function loadLifeRoute(origin: {lat:number;lng:number}, target: {lat:number;lng:number}, mode: TravelMode, signal: AbortSignal): Promise<LifeRoute> {
  const { loadRoadRoute } = await import('../map/routing');
  const routeMode = mode === 'walking' ? 'walk' : mode === 'cycling' ? 'bike' : mode === 'driving' ? 'drive' : null;
  if (!routeMode) throw new Error('不支持此出行方式，请选择步行、骑行或驾车');
  const route = await loadRoadRoute({from:origin,to:target,mode:routeMode},signal);
  return {points:route.points.map(point => [point.lat,point.lng]),distanceKm:Math.round(route.distanceMeters / 100) / 10,minutes:Math.max(1,Math.ceil(route.durationSeconds / 60)),estimated:false};
}
