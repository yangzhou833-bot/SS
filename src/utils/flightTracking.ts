import type { FlightLiveSnapshot, FlightStatus, Schedule } from '../types';
import { dateKey, scheduleTime } from './lifePlanning';
import { validCoordinates, validDate } from './creationValidation';
import { calculateLatLngDistanceMeters } from './geoUtils';

const FRESH_MS = 5 * 60000;
const statuses: FlightStatus[] = ['upcoming','departing','to_airport','at_airport','boarding','in_flight','landed','completed','delayed','cancelled','on_time'];
const observedTime = (value?:string) => typeof value === 'string' && /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) && validDate(value.slice(0,10)) ? scheduleTime(value) : Number.NaN;
export const flightTrackingEndpoint = () => ((import.meta as any).env?.VITE_FLIGHT_API_URL || '').trim();

export function getFlightSnapshotInfo(schedule:Schedule, now=Date.now()) {
  const flight = schedule.flight;
  const live = flight?.live;
  const observed = observedTime(live?.observedAt);
  const verified = Boolean(live?.source?.trim() && Number.isFinite(observed) && Number.isFinite(observedTime(live.fetchedAt)) && statuses.includes(live.status));
  const fresh = verified && observed <= now + 60000 && now-observed <= FRESH_MS;
  const mode:'live'|'stale'|'scheduled'|'demo' = verified ? fresh ? 'live' : 'stale' : flight?.isSimulated ? 'demo' : 'scheduled';
  const position = fresh && validCoordinates(live?.position) ? live!.position! : null;
  const status = verified ? live!.status : flight?.status || 'upcoming';
  const start = scheduleTime(schedule.startAt);
  const end = scheduleTime(schedule.endAt);
  const durationMinutes = Number.isFinite(start) && Number.isFinite(end) && end > start ? Math.round((end-start)/60000) : null;
  const estimatedArrivalAt = verified ? live?.estimatedArrivalAt || schedule.endAt : schedule.endAt;
  const arrival = scheduleTime(estimatedArrivalAt);
  const actualDeparture = verified ? observedTime(live?.actualDepartureAt) : Number.NaN;
  const elapsedMinutes = fresh && Number.isFinite(actualDeparture) && observed >= actualDeparture ? Math.round((observed-actualDeparture)/60000) : null;
  const remainingMinutes = fresh && ['landed','completed'].includes(status) ? 0 : Number.isFinite(arrival) ? Math.max(0,Math.ceil((arrival-now)/60000)) : null;
  let progressPercent:number|null = null;
  if (fresh && ['landed','completed'].includes(status)) progressPercent = 100;
  else if (position && validCoordinates({lat:schedule.location.latitude,lng:schedule.location.longitude}) && schedule.destination && validCoordinates({lat:schedule.destination.latitude,lng:schedule.destination.longitude})) {
    const elapsedDistance = calculateLatLngDistanceMeters(schedule.location.latitude,schedule.location.longitude,position.lat,position.lng);
    const remainingDistance = calculateLatLngDistanceMeters(position.lat,position.lng,schedule.destination.latitude,schedule.destination.longitude);
    if (elapsedDistance+remainingDistance > 0) progressPercent = Math.round(elapsedDistance/(elapsedDistance+remainingDistance)*100);
  } else if (mode === 'demo' && Number.isFinite(flight?.flightProgress)) progressPercent = Math.round(Math.max(0,Math.min(1,flight!.flightProgress!))*100);
  const dataLabel = mode === 'live' ? position ? '实时观测' : '航班状态已更新 · 暂无位置观测' : mode === 'stale' ? '数据已过期 · 暂无实时位置' : mode === 'demo' ? '演示航班 · 非实时数据' : '未接通实时数据 · 计划行程';
  return {mode,position,status,source:verified ? live!.source : undefined,observedAt:verified ? live!.observedAt : undefined,dataLabel,durationMinutes,progressPercent,elapsedMinutes,remainingMinutes,estimatedArrivalAt,actualDepartureAt:verified ? live?.actualDepartureAt : undefined,actualArrivalAt:verified ? live?.actualArrivalAt : undefined};
}

export async function fetchFlightSnapshot(schedule:Schedule, signal?:AbortSignal, endpoint=flightTrackingEndpoint()):Promise<FlightLiveSnapshot|null> {
  if (!endpoint || !schedule.flight) return null;
  const url = new URL(endpoint,typeof window === 'undefined' ? 'http://localhost' : window.location.origin);
  url.searchParams.set('flightNumber',schedule.flight.flightNumber.trim().toUpperCase());
  const start = scheduleTime(schedule.startAt);
  if (!Number.isFinite(start)) throw new Error('请先确认航班日期');
  url.searchParams.set('date',dateKey(new Date(start)));
  const response = await fetch(url.toString(),{signal,headers:{Accept:'application/json'}});
  if (response.status === 404) throw new Error('未找到该日期的航班，计划行程仍保留');
  if (!response.ok) throw new Error('航班服务暂时不可用，请稍后重试');
  const data = await response.json();
  if (typeof data?.source !== 'string' || !data.source.trim() || !Number.isFinite(observedTime(data.observedAt)) || !statuses.includes(data.status)) throw new Error('航班数据缺少可验证的来源或观测时间');
  if (data.flightNumber && (typeof data.flightNumber !== 'string' || data.flightNumber.toUpperCase() !== schedule.flight.flightNumber.trim().toUpperCase())) throw new Error('返回航班与当前行程不匹配');
  return {
    source:data.source.trim(),observedAt:data.observedAt,fetchedAt:new Date().toISOString(),status:data.status,
    position:validCoordinates(data.position) ? {lat:data.position.lat,lng:data.position.lng,altitudeMeters:Number.isFinite(data.position.altitudeMeters) ? data.position.altitudeMeters : undefined,speedKmh:Number.isFinite(data.position.speedKmh) ? data.position.speedKmh : undefined} : undefined,
    estimatedArrivalAt:Number.isFinite(observedTime(data.estimatedArrivalAt)) ? data.estimatedArrivalAt : undefined,
    actualDepartureAt:Number.isFinite(observedTime(data.actualDepartureAt)) ? data.actualDepartureAt : undefined,
    actualArrivalAt:Number.isFinite(observedTime(data.actualArrivalAt)) ? data.actualArrivalAt : undefined,
    registration:typeof data.registration === 'string' ? data.registration : undefined,
  };
}
