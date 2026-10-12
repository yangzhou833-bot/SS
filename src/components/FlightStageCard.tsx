import React from 'react';
import { FlightSchedule } from '../types';
import { formatMinutesToDuration } from '../utils/flightAdapter';
import { clockTime, dateKey, scheduleTime } from '../utils/lifePlanning';

export interface FlightStageCardProps {
  stage: 'preflight' | 'in-flight' | 'landed';
  flight: FlightSchedule;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const FlightStageCard: React.FC<FlightStageCardProps> = ({ stage, flight, isActive = false, onClick, className = '' }) => {
  const stageLabel = stage === 'preflight' ? '起飞前' : stage === 'in-flight' ? '飞行中' : '到达后';
  const observed = scheduleTime(flight.observedAt);
  const actualArrival = scheduleTime(flight.actualArrivalAt);
  const arrivalLabel = flight.arrivalTimeLabel || '计划到达';
  return <button type="button" onClick={onClick} className={`w-full text-left bg-white rounded-md border p-3.5 transition-colors ${isActive ? 'border-[#1877F2] ring-2 ring-[#1877F2]/10' : 'border-[#E4E6EB] hover:border-[#1877F2]'} ${className}`}>
    <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E4E6EB]">
      <span className="text-xs font-extrabold text-[#1877F2]">✈️ {stageLabel} · {flight.flightNumber || '航班号待填写'}</span>
      <span className="text-[10px] text-[#65676B]">{isActive ? '当前阶段' : '阶段信息'}</span>
    </div>
    <div className="flex justify-between gap-3 py-2.5 text-xs"><div><strong className="block text-base text-[#1877F2]">{flight.departureTime || '—'}</strong><span className="block">{flight.departureAirport?.name || '出发机场待确认'}</span><small className="text-[#65676B]">计划起飞 {flight.departureDate}</small></div><div className="text-right"><strong className="block text-base text-[#1877F2]">{flight.arrivalTime || '—'}</strong><span className="block">{flight.arrivalAirport?.name || '到达机场待确认'}</span><small className="text-[#65676B]">{arrivalLabel} {flight.arrivalDate}</small></div></div>
    {stage === 'preflight' && <p className="text-[11px] text-[#65676B]">{flight.departureCountdown || '请核对起飞日期与时间'}{flight.durationMinutes !== undefined ? ` · 计划航程 ${formatMinutesToDuration(flight.durationMinutes)}` : ''}</p>}
    {stage === 'in-flight' && <div className="space-y-1.5">
      {flight.hasProgress ? <><div className="h-1.5 rounded-md bg-[#F0F2F5] overflow-hidden"><div className="h-full bg-[#1877F2]" style={{width:`${flight.progressPercent}%`}}/></div><p className="text-[11px] text-[#1877F2]">{flight.dataMode === 'demo' ? '演示进度' : ['landed','completed'].includes(flight.status) ? '已观测到达' : '观测位置的航线估计'} {flight.progressPercent}%</p></> : <p className="text-[11px] text-[#65676B]">暂无可验证的飞行进度</p>}
      <p className="text-[11px] text-[#65676B]">{flight.hasElapsed ? `观测时已飞行 ${formatMinutesToDuration(flight.elapsedMinutes)}` : '实际起飞时间待提供'}{flight.hasRemaining ? ` · ${arrivalLabel}剩余 ${formatMinutesToDuration(flight.remainingMinutes)}` : ''}</p>
    </div>}
    {stage === 'landed' && <p className="text-[11px] text-[#65676B]">{Number.isFinite(actualArrival) ? `实际到达 ${dateKey(new Date(actualArrival))} ${clockTime(actualArrival)}` : '尚无实际到达观测'}{flight.baggageClaim ? ` · 行李转盘 ${flight.baggageClaim}` : ''}</p>}
    <div className="pt-2 mt-2 border-t border-[#E4E6EB] text-[10px] text-[#65676B]"><p>{flight.airline || '航空公司待确认'}{flight.seat ? ` · 座位 ${flight.seat}` : ''}</p><p>{flight.dataLabel || '未接通实时数据 · 计划行程'}</p>{flight.dataSource && <p>{flight.dataSource} · 观测 {Number.isFinite(observed) ? `${dateKey(new Date(observed))} ${clockTime(observed)}` : '—'}</p>}</div>
  </button>;
};
