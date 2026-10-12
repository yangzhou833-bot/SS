import React, { useEffect, useState } from 'react';
import { useDialogFocus } from '../utils/useDialogFocus';
import { ArrowLeft, MapPin, Clock, Bell, Trash2, Navigation, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { Schedule, FlightStatus } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import { formatCountdownReminder } from '../utils/countdownHelper';
import { getFlightSnapshotInfo } from '../utils/flightTracking';
import { clockTime, dateKey, departureAt, scheduleTime } from '../utils/lifePlanning';
import { FlightPictureCard } from './FlightPictureCard';

interface ScheduleDetailModalProps {
  isOpen: boolean;
  schedule: Schedule | null;
  onClose: () => void;
  onViewOnMap: (schedule: Schedule) => void;
  onViewOnCalendar?: (schedule: Schedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onUpdateScheduleStatus?: (scheduleId: string, newFlightStatus?: FlightStatus) => void;
  onUpdateSchedule?: (schedule: Schedule) => void;
  onPlanRoute?: (schedule: Schedule) => void;
  onRefreshFlight?: (schedule: Schedule) => void;
  flightServiceConfigured?: boolean;
  showToast: (msg: string) => void;
}
const FLIGHT_STAGES: Array<{ id: FlightStatus; label: string }> = [
  { id: 'upcoming', label: '准备出发' }, { id: 'boarding', label: '登机中' },
  { id: 'in_flight', label: '飞行中' }, { id: 'landed', label: '已降落' },
];
const REMINDERS = [0,15,30,60,120,1440];
const timeText = (value?:string) => {const time=scheduleTime(value);return Number.isFinite(time) ? `${dateKey(new Date(time))} ${clockTime(time)}` : value || '待设置';};
const visibilityLabels = {private:'仅自己',close:'密友',lover:'伴侣',family:'家人',specified:'指定好友',group:'群组',excluded:'排除部分好友'};
const scheduleReminders = (schedule?:Schedule|null) => schedule?.reminder?.enabled === false ? [] : schedule?.reminders?.length ? schedule.reminders : schedule?.reminder?.enabled ? [schedule.reminder.advanceMinutes] : [];

export const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({isOpen,schedule,onClose,onViewOnMap,onViewOnCalendar,onDeleteSchedule,onUpdateScheduleStatus,onUpdateSchedule,onPlanRoute,onRefreshFlight,flightServiceConfigured=false,showToast}) => {
  const [editingReminders,setEditingReminders]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState(false);
  const dialog = useDialogFocus(isOpen && Boolean(schedule), () => confirmDelete ? setConfirmDelete(false) : onClose());
  const [reminders,setReminders]=useState<number[]>([]);
  const [remindDeparture,setRemindDeparture]=useState(false);
  useEffect(() => {setEditingReminders(false);setConfirmDelete(false);setReminders(scheduleReminders(schedule));setRemindDeparture(Boolean(schedule?.travelPlan?.remindDeparture));},[isOpen,schedule?.id]);
  if (!isOpen || !schedule) return null;
  const fl=schedule.flight;
  const info=fl ? getFlightSnapshotInfo(schedule) : null;
  const travel=schedule.travelPlan;
  const departure=travel ? departureAt(schedule,travel.minutes,travel.bufferMinutes) : Number.NaN;
  const activeReminders=scheduleReminders(schedule);
  const saveReminders=() => {
    if (!onUpdateSchedule) return;
    onUpdateSchedule({...schedule,reminders:reminders.slice().sort((a,b) => a-b),reminder:undefined,travelPlan:travel ? {...travel,remindDeparture} : undefined,updatedAt:new Date().toISOString()});
    setEditingReminders(false);haptics.trigger('light');showToast('提前提醒已保存');
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs font-sans">
    <motion.div ref={dialog} role="dialog" aria-modal="true" tabIndex={-1} aria-label="行程详情" initial={{opacity:0,scale:0.95,y:15}} animate={{opacity:1,scale:1,y:0}} transition={{duration:0.2,ease:'easeOut'}} className="w-full max-w-[390px] bg-white rounded-md border border-[#E4E6EB] p-4 flex flex-col gap-3 max-h-[calc(100dvh-24px)] min-h-0 overflow-y-auto [&_button]:min-h-11">
      <div className="flex items-center justify-between"><button aria-label="关闭行程详情" onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-[#F0F2F5]"><ArrowLeft size={20}/></button><h2 className="text-base font-extrabold">行程详情</h2><span className="w-8"/></div>
      {fl && info ? <section className="space-y-2">
        <FlightPictureCard flight={{...fl,departureTime:timeText(schedule.startAt),arrivalTime:timeText(schedule.endAt)}} snapshot={info} className="!max-w-none"/>
        {info.position && <div className="rounded-md border border-[#E4E6EB] p-2.5 text-[11px] text-[#65676B]"><p>观测位置：{info.position.lat.toFixed(5)}, {info.position.lng.toFixed(5)}</p>{info.position.altitudeMeters !== undefined && <p>高度：{Math.round(info.position.altitudeMeters)} 米</p>}{info.position.speedKmh !== undefined && <p>速度：{Math.round(info.position.speedKmh)} km/h</p>}{fl.live?.registration && <p>机身编号：{fl.live.registration}</p>}</div>}
        <div className="rounded-md border border-[#E4E6EB] p-2.5 text-[11px] text-[#65676B] space-y-1"><p>{info.dataLabel}</p>{info.source && <p>来源：{info.source} · 观测：{timeText(info.observedAt)}（上海时间）</p>}{fl.lookupError && <p className="text-[#E02D3C]">{fl.lookupError}</p>}<p>虚线连接已确认机场，仅表示计划航线。</p><button type="button" disabled={!flightServiceConfigured || !onRefreshFlight} onClick={() => onRefreshFlight?.(schedule)} className="text-[#1877F2] font-bold disabled:text-[#65676B]">{flightServiceConfigured ? '刷新航班观测' : '未接通实时数据服务'}</button></div>
        {info.mode === 'demo' && onUpdateScheduleStatus && <div className="rounded-md border border-[#E4E6EB] p-2 space-y-2"><p className="text-[10px] text-[#65676B]">仅切换演示阶段，不代表实际航班状态</p><div className="grid grid-cols-4 gap-1">{FLIGHT_STAGES.map(stage => <button key={stage.id} type="button" onClick={() => {onUpdateScheduleStatus(schedule.id,stage.id);haptics.trigger('light');}} className={`text-[10px] p-1.5 rounded-md border ${info.status === stage.id ? 'border-[#1877F2] text-[#1877F2]' : 'border-[#E4E6EB]'}`}>{stage.label}</button>)}</div></div>}
      </section> : <section className="p-3 rounded-md border border-[#1877F2]/30 bg-[var(--stellar-surface-soft)] space-y-2"><h3 className="font-extrabold text-sm">{schedule.icon || '📅'} {schedule.title}</h3>{schedule.description && <p className="text-xs leading-relaxed">{schedule.description}</p>}{schedule.note && <p className="text-[11px] text-[#65676B]">备忘：{schedule.note}</p>}<p className="text-xs font-bold text-[#1877F2]">{formatCountdownReminder(schedule.startAt,undefined,schedule.endAt)}</p></section>}
      <section className="rounded-md border border-[#E4E6EB] p-3 space-y-2 text-xs">
        <p className="flex gap-2 items-start"><Clock size={14} className="shrink-0 text-[#1877F2]"/><span>{timeText(schedule.startAt)}{schedule.endAt ? ` → ${timeText(schedule.endAt)}` : ''}</span></p>
        <p className="flex gap-2 items-start"><MapPin size={14} className="shrink-0 text-[#1877F2]"/><span>{schedule.location.name}{schedule.destination ? ` → ${schedule.destination.name}` : ''}</span></p>
        {schedule.location.address && <p className="text-[11px] text-[#65676B]">{schedule.location.address}</p>}
        {travel && <div className="pt-2 border-t border-[#E4E6EB] space-y-1"><p>{travel.estimated === true ? '距离估算' : '预计路程'}：{travel.mode === 'driving' ? '驾车' : travel.mode === 'cycling' ? '骑行' : '步行'}约 {travel.minutes} 分钟 · 预留 {travel.bufferMinutes} 分钟</p><p className="text-[#1877F2] font-bold">建议出发：{Number.isFinite(departure) ? timeText(new Date(departure).toISOString()) : '待确认时间'}</p><p className="text-[10px] text-[#65676B]">路线页可调整交通方式与预留时间。</p></div>}
        <button type="button" onClick={() => {haptics.trigger('light');soundEffects.playTapSound();onClose();if (onPlanRoute) onPlanRoute(schedule);else onViewOnMap(schedule);}} className="w-full py-2 rounded-md border border-[#1877F2] text-[#1877F2] font-bold">规划路线与出发时间</button>
      </section>
      <div className="grid grid-cols-2 gap-2 text-xs"><div className="border border-[#E4E6EB] rounded-md p-2.5"><p className="text-[#65676B] text-[10px]">提前提醒</p><p className="font-bold mt-1">{activeReminders.length ? `${activeReminders.length} 个开始提醒` : '未设置开始提醒'}{travel?.remindDeparture ? ' · 出发提醒已开' : ''}</p></div><div className="border border-[#E4E6EB] rounded-md p-2.5"><p className="text-[#65676B] text-[10px]">共享范围</p><p className="font-bold mt-1">{visibilityLabels[schedule.visibilityRule.scope] || '仅自己'}可见</p></div></div>
      {editingReminders && <section className="border border-[#E4E6EB] rounded-md p-3 space-y-2 text-xs"><p className="font-bold">开始前提醒</p><div className="flex flex-wrap gap-1.5">{[...new Set([...REMINDERS,...reminders])].sort((a,b) => a-b).map(minutes => <button key={minutes} type="button" aria-pressed={reminders.includes(minutes)} onClick={() => setReminders(previous => previous.includes(minutes) ? previous.filter(item => item !== minutes) : [...previous,minutes])} className={`rounded-md border px-2 py-1.5 ${reminders.includes(minutes) ? 'border-[#1877F2] text-[#1877F2] bg-[#E7F3FF]' : 'border-[#E4E6EB]'}`}>{minutes === 0 ? '准时' : minutes === 1440 ? '提前 1 天' : `提前 ${minutes} 分钟`}</button>)}</div>{travel && <label className="flex gap-2 items-center"><input type="checkbox" checked={remindDeparture} onChange={event => setRemindDeparture(event.target.checked)}/>到建议出发时间提醒</label>}<p className="text-[10px] text-[#65676B]">提醒在页面打开且可见时触发。</p><button type="button" onClick={saveReminders} className="w-full bg-[#1877F2] text-white rounded-md py-2 font-bold">保存提醒</button></section>}
      {onViewOnCalendar && <button type="button" onClick={() => {onClose();onViewOnCalendar(schedule);}} className="py-2 text-[#1877F2] border border-[#E4E6EB] rounded-md text-xs font-bold flex justify-center gap-1"><Calendar size={14}/>在日历中查看</button>}
      {confirmDelete && <section data-dialog-focus-scope role="alertdialog" aria-label="确认删除日程" className="border border-[#FECACA] rounded-md p-3 space-y-3"><p className="text-sm">删除日程“{schedule.title}”？</p><p className="text-xs text-[var(--stellar-muted)]">删除后将从日历和地图中移除。</p><div className="flex gap-2"><button autoFocus type="button" className="flex-1 border border-[#E4E6EB] rounded-md text-sm" onClick={() => setConfirmDelete(false)}>保留日程</button><button type="button" className="flex-1 bg-[#B42335] text-white rounded-md text-sm" onClick={() => {onDeleteSchedule(schedule.id);setConfirmDelete(false);onClose();showToast(`日程“${schedule.title}”已删除`);}}>确认删除</button></div></section>}
      <div className="flex gap-2"><button aria-label="删除日程" onClick={() => setConfirmDelete(true)} className="w-11 h-11 flex items-center justify-center rounded-md bg-[#FEECEB] text-[#E02D3C] border border-[#FECACA]"><Trash2 size={16}/></button><button disabled={!onUpdateSchedule} onClick={() => setEditingReminders(previous => !previous)} className="flex-1 flex items-center justify-center gap-1 rounded-md border border-[#E4E6EB] text-xs font-bold disabled:opacity-45"><Bell size={14}/>提醒</button><button onClick={() => {onClose();onViewOnMap(schedule);}} className="flex-1 flex items-center justify-center gap-1 rounded-md border border-[#1877F2] bg-[#1877F2] text-white text-xs font-bold"><Navigation size={14}/>在地图中查看</button></div>
    </motion.div>
  </div>;
};
