import React from 'react';
import type { Schedule, ScheduleFlightInfo } from '../types';
import { getFlightSnapshotInfo } from '../utils/flightTracking';
import { clockTime, dateKey, scheduleTime } from '../utils/lifePlanning';
import { escapeMarkerText } from '../utils/friendMarker';
import { formatMinutesToDuration } from '../utils/flightAdapter';

type Snapshot = ReturnType<typeof getFlightSnapshotInfo>;
interface FlightPictureCardProps { flight:ScheduleFlightInfo; snapshot?:Snapshot; className?:string; avatarUrl?:string; variant?:'light'|'dark' }

export function getFlightStatusConfig(flight:ScheduleFlightInfo, snapshot?:Snapshot) {
  const status=snapshot?.status || flight.status;
  const label=status === 'cancelled' ? '已取消' : status === 'delayed' ? '延误' : ['landed','completed'].includes(status) ? '已到达' : status === 'in_flight' ? '飞行中' : ['boarding','at_airport'].includes(status) ? '登机中' : status === 'on_time' ? '准点' : '计划起飞';
  const color=status === 'cancelled' ? '#65676B' : status === 'delayed' ? '#E02D3C' : status === 'in_flight' ? '#1877F2' : '#1877F2';
  return {statusKey:status,label,badgeText:color,badgeBg:'#F0F2F5',badgeBorder:'#E4E6EB',dotColor:color,tailwindBadge:'bg-[#F0F2F5] text-[#1877F2] border-[#E4E6EB]'};
}

function cardData(flight:ScheduleFlightInfo, snapshot?:Snapshot) {
  const info=snapshot || getFlightSnapshotInfo({flight,startAt:'',endAt:'',location:{name:flight.departureAirport,latitude:Number.NaN,longitude:Number.NaN}} as Schedule);
  const observed=scheduleTime(info.observedAt);
  const time=(value?:string) => {const parsed=scheduleTime(value);return Number.isFinite(parsed) ? clockTime(parsed) : /^\d{1,2}:\d{2}$/.test(value || '') ? value! : '—';};
  return {info,status:getFlightStatusConfig(flight,info),departure:flight.departureAirport || '出发机场待确认',arrival:flight.arrivalAirport || '到达机场待确认',departureTime:time(flight.departureTime),arrivalTime:time(info.estimatedArrivalAt || flight.arrivalTime),arrivalLabel:info.mode === 'live' && flight.live?.estimatedArrivalAt ? '预计落地' : info.mode === 'stale' && flight.live?.estimatedArrivalAt ? '上次预计落地' : '计划到达',observedLabel:Number.isFinite(observed) ? `${dateKey(new Date(observed))} ${clockTime(observed)}` : '—',progressLabel:info.mode === 'demo' ? '演示进度' : ['landed','completed'].includes(info.status) ? '已观测到达' : '观测位置的航线估计'};
}

export const FlightPictureCard:React.FC<FlightPictureCardProps> = ({flight,snapshot,className='',variant='light'}) => {
  const data=cardData(flight,snapshot);
  const {info}=data;
  return <div className={`rounded-md border border-[#E4E6EB] p-2.5 w-full max-w-[240px] font-sans text-xs ${variant === 'dark' ? 'bg-[#18191A] text-white' : 'bg-white text-[#050505]'} ${className}`}>
    <div className="flex justify-between gap-2 font-bold border-b border-[#E4E6EB] pb-1.5"><span>✈️ {flight.flightNumber || '航班号待填写'}</span><span style={{color:data.status.badgeText}}>{data.status.label}</span></div>
    <div className="grid grid-cols-2 gap-2 py-2"><div><strong className="block text-base text-[#1877F2]">{data.departureTime}</strong><span className="block text-[10px]">{data.departure}</span><small>{flight.departureTerminal || '航站楼待确认'}</small></div><div className="text-right"><strong className="block text-base text-[#1877F2]">{data.arrivalTime}</strong><span className="block text-[10px]">{data.arrival}</span><small>{data.arrivalLabel}</small></div></div>
    {info.progressPercent !== null && <div><div className="h-1 bg-[#F0F2F5] overflow-hidden rounded-md"><div className="h-full bg-[#1877F2]" style={{width:`${info.progressPercent}%`}}/></div><p className="text-[9px] text-[#65676B] pt-1">{data.progressLabel} {info.progressPercent}%</p></div>}
    <p className="text-[10px] py-1">{info.durationMinutes !== null ? `计划航程 ${formatMinutesToDuration(info.durationMinutes)}` : '计划航程待确认'}{info.remainingMinutes !== null ? ` · ${data.arrivalLabel}剩余 ${formatMinutesToDuration(info.remainingMinutes)}` : ''}</p>
    <p className="text-[9px] text-[#65676B]">{flight.gate ? `登机口 ${flight.gate}` : '登机口待确认'}{flight.seat ? ` · 座位 ${flight.seat}` : ''}</p>
    <div className="mt-1.5 pt-1.5 border-t border-[#E4E6EB] text-[9px] text-[#65676B]"><p>{info.dataLabel}</p>{info.source && <p>{info.source} · 观测 {data.observedLabel}</p>}</div>
  </div>;
};

// The second argument also accepts the legacy avatar string; snapshots provide verified schedule context.
export function renderFlightPictureCardHTML(flight:ScheduleFlightInfo,snapshotOrAvatar?:Snapshot|string):string {
  const data=cardData(flight,typeof snapshotOrAvatar === 'object' ? snapshotOrAvatar : undefined);
  const {info}=data;
  const text=(value:unknown) => escapeMarkerText(String(value ?? ''));
  return `<div style="background:#fff;border:1px solid #E4E6EB;border-radius:6px;padding:8px 10px;color:#050505;width:224px;font:11px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;box-sizing:border-box">
    <div style="display:flex;justify-content:space-between;gap:5px;border-bottom:1px solid #E4E6EB;padding-bottom:5px;font-weight:800"><span>✈️ ${text(flight.flightNumber || '航班号待填写')}</span><span style="color:${data.status.badgeText}">${text(data.status.label)}</span></div>
    <div style="display:flex;justify-content:space-between;gap:8px;padding:7px 0"><div><strong style="font-size:16px;color:#1877F2">${text(data.departureTime)}</strong><div style="font-size:9px">${text(data.departure)}</div></div><div style="text-align:right"><strong style="font-size:16px;color:#1877F2">${text(data.arrivalTime)}</strong><div style="font-size:9px">${text(data.arrival)}</div><small>${text(data.arrivalLabel)}</small></div></div>
    ${info.progressPercent !== null ? `<div style="height:4px;background:#F0F2F5;overflow:hidden"><div style="height:100%;background:#1877F2;width:${info.progressPercent}%"></div></div><small>${text(data.progressLabel)} ${info.progressPercent}%</small>` : ''}
    <div style="font-size:9px;margin-top:4px">${text(info.durationMinutes !== null ? `计划航程 ${formatMinutesToDuration(info.durationMinutes)}` : '计划航程待确认')}</div>
    <div style="font-size:9px;color:#65676B;border-top:1px solid #E4E6EB;padding-top:4px;margin-top:5px">${text(info.dataLabel)}${info.source ? `<br/>${text(info.source)} · 观测 ${text(data.observedLabel)}` : ''}</div>
  </div>`;
}
