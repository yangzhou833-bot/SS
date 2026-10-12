import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MapPin, CalendarDays, Navigation, Plus, X, Search, ChevronLeft, ChevronRight, ArrowLeft, Bell, Check, Heart, Pencil, Clock } from 'lucide-react';
import type { LifePlace, Schedule } from '../types';
import { lifeLayerStore } from '../data/lifeLayerStore';
import { dateKey, clockTime, scheduleTime, scheduleDateParts, schedulePhase, placeIntent, PLACE_INTENTS, TRAVEL_MODES, departureAt, type LifeRoute, type PlaceIntent, type TravelMode } from '../utils/lifePlanning';

interface Props {
  owner?: { name:string; avatar?:string; note?:string; emoji?:string };
  onEditStatus?: () => void; onOpenHistory?: () => void; onClearRoute?: () => void;
  schedules: Schedule[]; places: LifePlace[]; navigationTarget?:RouteTarget|null; navigationMode?:TravelMode;
  onPlaceFilter?: (intent:PlaceIntent | 'all') => void; onTabChange?: (tab:'today'|'places'|'plans') => void; onClose: () => void; onLocate: (lat:number,lng:number,name:string,scheduleId?:string) => void;
  onCreatePlace: () => void; onEditPlace: (place:LifePlace) => void;
  onCreateSchedule: (place?:LifePlace,date?:string) => void; onCreateActivity: (place:LifePlace) => void;
  onSelectSchedule: (schedule:Schedule) => void; onUpdateSchedule: (schedule:Schedule) => void;
  route?:LifeRoute|null; routing?:boolean; routeError?:string;
  onStartRoute?: (target:RouteTarget,mode:TravelMode) => void;
  onTravelModeChange?: (mode:TravelMode) => void; onRetryRoute?: () => void; onShowRoute?: () => void;
  onRouteChange?: (route:LifeRoute | null) => void; onToast: (text:string) => void;
}
type RouteTarget = {name:string;lat:number;lng:number;schedule?:Schedule};
export function LifeMapPanel({owner,onEditStatus,onOpenHistory,onClearRoute,schedules,places,navigationTarget=null,navigationMode='walking',onPlaceFilter,onTabChange,onClose,onLocate,onCreatePlace,onEditPlace,onCreateSchedule,onCreateActivity,onSelectSchedule,onUpdateSchedule,route=null,routing=false,routeError='',onStartRoute,onTravelModeChange,onRetryRoute,onShowRoute,onRouteChange,onToast}:Props) {
  const reduceMotion = useReducedMotion();
  const [tab,setTab] = useState<'today'|'places'|'plans'>('today');
  const [day,setDay] = useState(dateKey());
  const [query,setQuery] = useState('');
  const [intent,setIntent] = useState<PlaceIntent | 'all'>('all');
  const [showRouteView,setShowRouteView] = useState(true);
  const target=showRouteView ? navigationTarget : null;
  const mode=navigationMode;
  const [buffer,setBuffer] = useState(10);
  const [remind,setRemind] = useState(true);
  const [now,setNow] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()),30000); return () => clearInterval(timer); },[]);
  useEffect(() => { const closeOnEscape = (event:KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown',closeOnEscape); return () => window.removeEventListener('keydown',closeOnEscape); },[onClose]);
  const startRoute = (next:RouteTarget) => {
    const nextMode=next.schedule?.travelPlan?.mode || 'walking';
    setShowRouteView(true); onStartRoute?.(next,nextMode);
    setBuffer(next.schedule?.travelPlan?.bufferMinutes ?? 10);
    setRemind(next.schedule?.travelPlan?.remindDeparture ?? true);
  };
  useEffect(()=>{setBuffer(navigationTarget?.schedule?.travelPlan?.bufferMinutes ?? 10);setRemind(navigationTarget?.schedule?.travelPlan?.remindDeparture ?? true);},[navigationTarget]);
  const shiftDay = (offset:number) => { const date = new Date(`${day}T12:00:00+08:00`); date.setDate(date.getDate()+offset); setDay(dateKey(date)); };
  const upcoming = schedules.filter(s => s.status !== 'cancelled').sort((a,b) => scheduleTime(a.startAt || `${a.startDate}T${a.startTime}`)-scheduleTime(b.startAt || `${b.startDate}T${b.startTime}`));
  const shown = upcoming.filter(s => tab === 'today' ? scheduleDateParts(s).date === day : schedulePhase(s,now) !== 'ended');
  const visiblePlaces = places.filter(p => (intent === 'all' || placeIntent(p) === intent) && `${p.name} ${p.note || ''} ${p.tags?.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const departure = target?.schedule && route ? departureAt(target.schedule,route.minutes,buffer) : null;
  return <motion.section className={`life-map-panel ${owner ? 'self-map-card' : ''}`} role="dialog" aria-label={owner ? '我的地图卡片' : '生活地图'} aria-modal="false" initial={{opacity:0,y:reduceMotion ? 0 : 18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduceMotion ? 0 : 10}} transition={{type:'spring',stiffness:390,damping:34}}>
    <header className="life-map-heading">
      <div>{owner ? <img className="self-map-avatar" src={owner.avatar} alt=""/> : <span className="life-map-icon"><MapPin size={18}/></span>}<div><h2>{owner ? `${owner.name} · 我的地图` : '生活地图'}</h2><p>{owner ? `${owner.emoji || '✨'} ${owner.note || '把想去的地方安排进生活'}` : '让喜欢的地方，成为生活的安排'}</p></div></div>
      <button type="button" aria-label={owner ? '关闭我的地图卡片' : '关闭生活地图'} onClick={onClose}><X size={19}/></button>
    </header>
    {owner && <div className="self-map-actions">{onEditStatus && <button onClick={onEditStatus}><Pencil size={13}/>编辑状态</button>}{onOpenHistory && <button onClick={onOpenHistory}><Clock size={13}/>足迹与历史</button>}{onClearRoute && <button onClick={() => { setShowRouteView(false); onRouteChange?.(null); onClearRoute(); }}><X size={13}/>清除路线</button>}</div>}
    {target ? <>
      <div className="life-route-title"><button aria-label="返回生活地图" onClick={() => setShowRouteView(false)}><ArrowLeft size={17}/></button><div><h3>前往 {target.name}</h3><p>从我的地图位置出发</p></div></div>
      <div className="life-panel-scroll">
        <div className="life-segments" aria-label="交通方式">{TRAVEL_MODES.map(item => <button key={item.id} aria-pressed={mode===item.id} onClick={() => {onTravelModeChange?.(item.id);}}>{item.icon} {item.label}</button>)}</div>
        <div className="life-route-metrics"><div><strong>{route?.minutes || '—'}<small>分钟</small></strong><span>{routing ? '道路路线计算中' : route?.estimated ? '预计路程耗时' : '道路预计耗时'}</span></div><div><strong>{route?.distanceKm ?? '—'}<small>公里</small></strong><span>{route?.estimated ? '距离估算' : '道路里程'}</span></div></div>
        {target.schedule && <div className="life-departure">
          <div><Clock size={16}/><span>{scheduleDateParts(target.schedule).date} {scheduleDateParts(target.schedule).start} 开始</span></div>
          <label>提前到达<select aria-label="提前到达时间" value={buffer} onChange={e => setBuffer(Number(e.target.value))}>{[0,5,10,15,30,60,90].map(value => <option key={value} value={value}>{value} 分钟</option>)}</select></label>
          <div className="life-leave-time"><span>建议出发</span><strong>{departure && Number.isFinite(departure) ? `${dateKey(new Date(departure)) !== scheduleDateParts(target.schedule).date ? `${dateKey(new Date(departure))} ` : ''}${clockTime(departure)}` : '—'}</strong><small>{departure && now > departure ? (schedulePhase(target.schedule,now)==='ended' ? '日程已结束' : '已到建议出发时间') : '路程耗时 + 提前到达时间'}</small></div>
          <label className="life-reminder-toggle"><span><Bell size={15}/>出发时提醒我</span><input type="checkbox" aria-label="出发提醒" checked={remind} onChange={e => setRemind(e.target.checked)}/></label>
        </div>}
        {routeError && <p className="life-route-note" role="alert">{routeError} <button onClick={onRetryRoute}>重新计算</button></p>}
        <p className="life-route-note">{!route ? (routing ? '正在计算可通行的道路路线。' : '暂未获得道路路线，请重试或使用地图上的外部导航。') : route.estimated ? '当前为距离估算，地图虚线不代表可通行道路。' : '道路路线已绘制在地图上，预计耗时不包含实时路况。'} 提醒在页面打开时生效。</p>
        <div className="life-route-attribution">路线 © <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noreferrer">FOSSGIS</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a></div>
        {target.schedule && <button className="life-primary" disabled={!route || routing} onClick={() => { if (!route || !target.schedule) return; onUpdateSchedule({...schedules.find(item => item.id === target.schedule!.id) || target.schedule,travelPlan:{mode,minutes:route.minutes,bufferMinutes:buffer,remindDeparture:remind,estimated:route.estimated},updatedAt:new Date().toISOString()}); onToast(remind ? '路线与出发提醒已保存' : '路线已保存，出发提醒已关闭'); }}><Check size={16}/>保存路线与提醒</button>}
        <button className="life-secondary" onClick={() => { onShowRoute?.(); onToast(routing ? '正在计算，完成后路线将自动显示' : route ? '路线已显示在地图上' : '请在地图上重试路线'); onClose(); }}><Navigation size={15}/>查看地图路线</button>
      </div>
    </> : <>
      <nav className="life-main-tabs" aria-label="生活地图栏目">{[{id:'today',label:'今日',icon:CalendarDays},{id:'places',label:'我的坐标',icon:Heart},{id:'plans',label:'计划',icon:Clock}].map(item => <button key={item.id} aria-pressed={tab===item.id} onClick={() => { setTab(item.id as typeof tab); onTabChange?.(item.id as typeof tab); }}><item.icon size={15}/>{item.label}</button>)}</nav>
      <div className="life-panel-scroll">
        {tab === 'places' ? <>
          <div className="life-place-search"><Search size={16}/><input aria-label="搜索生活坐标" placeholder="搜索地点、标签或备注" value={query} onChange={e => setQuery(e.target.value)}/></div>
          <div className="life-segments" aria-label="坐标分类"><button aria-pressed={intent==='all'} onClick={() => { setIntent('all'); onPlaceFilter?.('all'); }}>全部</button>{PLACE_INTENTS.map(item => <button key={item.id} aria-pressed={intent===item.id} onClick={() => { setIntent(item.id); onPlaceFilter?.(item.id); }}>{item.label}</button>)}</div>
          <div className="life-list-caption"><span>{visiblePlaces.length} 个生活坐标</span><button onClick={onCreatePlace}><Plus size={14}/>添加坐标</button></div>
          {visiblePlaces.map(place => <article key={place.id} className="life-place-card">
            <div className="life-place-main"><button className="life-place-photo" aria-label={`定位 ${place.name}`} onClick={() => onLocate(place.lat,place.lng,place.name)}>{place.photos?.[0] ? <img src={place.photos[0]} alt="" loading="lazy"/> : <span>{place.icon}</span>}</button><div><button className="life-place-name" onClick={() => onLocate(place.lat,place.lng,place.name)}>{place.name}</button><p>{place.note || `${place.memory.visitCount} 次到访 · ${place.distanceKm ?? '—'} 公里`}</p><select aria-label={`${place.name}的坐标类型`} value={placeIntent(place)} onChange={e => lifeLayerStore.updatePlace(place.id,{intent:e.target.value as PlaceIntent})}>{PLACE_INTENTS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div><button className="life-place-edit" aria-label={`编辑 ${place.name}`} onClick={() => onEditPlace(place)}><Pencil size={14}/></button></div>
            <div className="life-place-actions"><button onClick={() => onCreateSchedule(place,day)}><CalendarDays size={13}/>安排日程</button><button onClick={() => onCreateActivity(place)}><Plus size={13}/>发起活动</button><button onClick={() => startRoute({name:place.name,lat:place.lat,lng:place.lng})}><Navigation size={13}/>路线</button></div>
          </article>)}
          {!visiblePlaces.length && <div className="life-empty"><MapPin size={28}/><h3>把喜欢的地方留在地图上</h3><p>{query ? '换个关键词，或清除筛选再试试。' : '在地图上长按选点，设成常去、喜欢或想去的坐标。'}</p><button onClick={onCreatePlace}>添加一个生活坐标</button></div>}
        </> : <>
          {tab==='today' && <div className="life-day-switch"><button aria-label="前一天日程" onClick={() => shiftDay(-1)}><ChevronLeft size={17}/></button><button onClick={() => setDay(dateKey())}>{day === dateKey() ? '今天' : day.slice(5).replace('-','月')+'日'}<small>{new Date(`${day}T12:00:00+08:00`).toLocaleDateString('zh-CN',{weekday:'long'})}</small></button><button aria-label="后一天日程" onClick={() => shiftDay(1)}><ChevronRight size={17}/></button></div>}
          <div className="life-list-caption"><span>{tab==='today' ? `${shown.length} 项安排 · 地点与时间一起看` : '接下来的活动与日程'}</span><button onClick={() => onCreateSchedule(undefined,day)}><Plus size={14}/>新建</button></div>
          {shown.map(schedule => { const parts = scheduleDateParts(schedule); const phase = schedulePhase(schedule,now); return <article key={schedule.id} className={`life-schedule-card is-${phase}`}>
            <div className="life-schedule-time"><strong>{schedule.allDay ? '全天' : parts.start}</strong><small>{tab==='plans' ? parts.date.slice(5) : parts.end}</small></div>
            <div className="life-schedule-content"><button className="life-schedule-title" onClick={() => onSelectSchedule(schedule)}>{schedule.icon} {schedule.title}</button><button className="life-schedule-location" onClick={() => onLocate(schedule.location.latitude,schedule.location.longitude,schedule.location.name,schedule.id)}><MapPin size={12}/>{schedule.location.name}</button><div className="life-schedule-meta"><span>{phase==='active' ? '进行中' : phase==='ended' ? '已结束' : '即将开始'}</span>{schedule.travelPlan && <span><Bell size={11}/>{clockTime(departureAt(schedule,schedule.travelPlan.minutes,schedule.travelPlan.bufferMinutes))} 出发</span>}</div><div className="life-schedule-actions"><button onClick={() => onLocate(schedule.location.latitude,schedule.location.longitude,schedule.location.name,schedule.id)}>在地图查看</button>{phase!=='ended' && <button onClick={() => startRoute({name:schedule.location.name,lat:schedule.location.latitude,lng:schedule.location.longitude,schedule})}><Navigation size={12}/>规划出发</button>}</div></div>
          </article>; })}
          {!shown.length && <div className="life-empty"><CalendarDays size={28}/><h3>{tab==='today' ? '把今天安排在喜欢的地方' : '下一次相遇，从一个计划开始'}</h3><p>选择生活坐标，创建日程或活动。到显示时间后，日程会出现在地图上。</p><button onClick={() => onCreateSchedule(undefined,day)}>安排一个日程</button></div>}
          <div className="life-bottom-tip"><MapPin size={14}/><span>地点可保存，安排可提前，出发时间自动计算。</span></div>
        </>}
      </div>
    </>}
  </motion.section>;
}
