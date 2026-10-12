import { Schedule, FlightSchedule, FlightScheduleStage } from '../types';
import { getFlightSnapshotInfo } from './flightTracking';
import { clockTime, dateKey, scheduleTime } from './lifePlanning';
import { formatCountdownReminder } from './countdownHelper';

export const DEFAULT_DEMO_FLIGHT_SCHEDULE: FlightSchedule = {
  id: 'demo-flight-ca1502',
  type: 'flight',
  title: 'CA1502 兰州中川 -> 北京大兴',
  flightNumber: 'CA1502',
  airline: '中国国际航空',
  departureDate: '9月4日',
  departureTime: '14:20',
  arrivalDate: '9月4日',
  arrivalTime: '17:20',
  departureAirport: {
    code: 'LHW',
    name: '中川机场 T3',
    terminal: '中川机场 T3',
    latitude: 36.514,
    longitude: 103.621,
  },
  arrivalAirport: {
    code: 'PKX',
    name: '大兴机场 T2',
    terminal: '大兴机场 T2',
    latitude: 39.509,
    longitude: 116.410,
  },
  currentStage: 'in-flight',
  progressPercent: 0,
  hasProgress: false,
  hasElapsed: false,
  hasRemaining: false,
  dataMode: 'demo',
  dataLabel: '演示航班 · 非实时数据',
  elapsedMinutes: 0,
  remainingMinutes: 0,
  estimatedArrivalTime: '17:20',
  userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  mapVisibleAt: '2026-09-04T00:00:00.000Z',
  keepAsHistory: true,
  isSimulated: true,
};

/**
 * Converts a generic Schedule object to standardized FlightSchedule
 */
export function scheduleToFlightSchedule(schedule?: Schedule | null): FlightSchedule {
  if (!schedule || schedule.type !== 'flight' || !schedule.flight) return DEFAULT_DEMO_FLIGHT_SCHEDULE;
  const fl = schedule.flight;
  const info = getFlightSnapshotInfo(schedule);
  const start = scheduleTime(schedule.startAt);
  const end = scheduleTime(info.estimatedArrivalAt || schedule.endAt);
  const stage: FlightScheduleStage = ['landed','completed'].includes(info.status) ? 'landed' : info.status === 'in_flight' ? 'in-flight' : 'preflight';
  const airportCode = (name:string) => name?.match(/\(([A-Z]{3})\)/)?.[1];
  return {
    id:schedule.id,type:'flight',title:schedule.title,flightNumber:fl.flightNumber,airline:fl.airline,
    departureDate:Number.isFinite(start) ? dateKey(new Date(start)) : '',
    departureTime:Number.isFinite(start) ? clockTime(start) : fl.departureTime || schedule.startTime || '—',
    arrivalDate:Number.isFinite(end) ? dateKey(new Date(end)) : '',
    arrivalTime:Number.isFinite(end) ? clockTime(end) : fl.arrivalTime || schedule.endTime || '—',
    departureAirport:{code:fl.departureCode || airportCode(fl.departureAirport),name:fl.departureAirport || schedule.location.name,terminal:fl.departureTerminal,latitude:schedule.location.latitude,longitude:schedule.location.longitude},
    arrivalAirport:{code:fl.arrivalCode || airportCode(fl.arrivalAirport),name:fl.arrivalAirport || schedule.destination?.name || '到达机场待确认',terminal:fl.arrivalTerminal,latitude:schedule.destination?.latitude ?? Number.NaN,longitude:schedule.destination?.longitude ?? Number.NaN},
    currentStage:stage,status:info.status,
    progressPercent:info.progressPercent ?? 0,hasProgress:info.progressPercent !== null,
    elapsedMinutes:info.elapsedMinutes ?? 0,hasElapsed:info.elapsedMinutes !== null,
    remainingMinutes:info.remainingMinutes ?? 0,hasRemaining:info.remainingMinutes !== null,
    durationMinutes:info.durationMinutes ?? undefined,
    estimatedArrivalTime:Number.isFinite(end) ? clockTime(end) : '—',
    arrivalTimeLabel:info.mode === 'live' && fl.live?.estimatedArrivalAt ? '预计落地' : info.mode === 'stale' && fl.live?.estimatedArrivalAt ? '上次预计落地' : '计划到达',
    dataMode:info.mode,dataLabel:info.dataLabel,dataSource:info.source,observedAt:info.observedAt,
    planePosition:info.position || undefined,actualDepartureAt:info.actualDepartureAt,actualArrivalAt:info.actualArrivalAt,
    seat:fl.seat,
    userAvatar:DEFAULT_DEMO_FLIGHT_SCHEDULE.userAvatar,
    departureCountdown:formatCountdownReminder(schedule.startAt,undefined,schedule.endAt),
    mapVisibleAt:schedule.mapVisibleAt,mapHideAt:schedule.mapHideAt,keepAsHistory:schedule.keepAsHistory,
    isSimulated:info.mode === 'demo',
  };
}

export function formatMinutesToDuration(mins: number): string {
  if (mins <= 0) return '0分钟';
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hours > 0) {
    return `${hours} 小时 ${remainingMins} 分钟`;
  }
  return `${remainingMins} 分钟`;
}
