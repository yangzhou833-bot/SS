import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import React, { act } from 'react';
import type { Schedule } from '../src/types';

const dom = new Window({url:'http://localhost:4173'});
Object.defineProperty(dom.Element.prototype,'animate',{value:undefined,configurable:true});
for (const key of ['window','document','navigator','HTMLElement','Element','Node','MouseEvent','Event','CustomEvent','localStorage','getComputedStyle','requestAnimationFrame','cancelAnimationFrame']) Object.defineProperty(globalThis,key,{value:typeof dom[key] === 'function' && ['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key) ? dom[key].bind(dom) : dom[key],configurable:true});
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
const {createRoot}=await import('react-dom/client');
const {scheduleToFlightSchedule}=await import('../src/utils/flightAdapter');
const {getFlightSnapshotInfo}=await import('../src/utils/flightTracking');
const {FlightThreeStageCards}=await import('../src/components/FlightThreeStageCards');
const {renderFlightPictureCardHTML}=await import('../src/components/FlightPictureCard');
const {ScheduleDetailModal}=await import('../src/components/ScheduleDetailModal');
const {CoordinatePicker}=await import('../src/components/CoordinatePicker');
const flight:Schedule={id:'planned-flight',type:'flight',title:'旅行计划',icon:'✈️',color:'#1877F2',startAt:'2026-10-06 23:30',endAt:'2026-10-07 02:15',allDay:false,timezone:'Asia/Shanghai',location:{name:'已确认起飞机场',latitude:0,longitude:0},destination:{name:'已确认落地机场',latitude:0,longitude:10},reminders:[15],mapVisibleAt:'always',keepAsHistory:true,visibilityRule:{scope:'private'},createdAt:'',updatedAt:'',flight:{flightNumber:'TEST123',departureAirport:'已确认起飞机场',arrivalAirport:'已确认落地机场',departureTime:'23:30',arrivalTime:'02:15',status:'upcoming',isSimulated:false}};
const button=(host:Element,text:string) => [...host.querySelectorAll('button')].find(item => item.textContent?.trim() === text)!;
const click=async (element:Element) => act(async () => {element.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event);});

test('planned-flight cards cannot be overwritten by old global simulation state or stage navigation',async () => {
  localStorage.setItem('stellar_flight_sim_stage','landed');localStorage.setItem('stellar_flight_sim_progress','65');
  const adapted=scheduleToFlightSchedule(flight);
  assert.equal(adapted.departureAirport.latitude,0);assert.equal(adapted.currentStage,'preflight');assert.equal(adapted.hasProgress,false);assert.equal(adapted.durationMinutes,165);
  const host=document.createElement('div');document.body.appendChild(host);const root=createRoot(host);let statusChanges=0;let located='';
  await act(async () => root.render(<FlightThreeStageCards flight={adapted} onStageChange={() => {statusChanges++;}} onLocateStage={stage => {located=stage;}}/>));
  assert.equal(statusChanges,0);assert.ok(host.textContent?.includes('未接通实时数据'));assert.equal(host.textContent?.includes('65%'),false);assert.equal(host.textContent?.includes('演示控制'),false);assert.equal(host.textContent?.includes('座位 12A'),false);
  await click([...host.querySelectorAll('button')].find(item => item.textContent?.includes('到达后'))!);
  assert.equal(statusChanges,0);assert.equal(located,'landed');
  const html=renderFlightPictureCardHTML(flight.flight!,getFlightSnapshotInfo(flight));
  assert.ok(html.includes('已确认起飞机场'));assert.ok(html.includes('23:30'));assert.equal(html.includes('45%'),false);assert.equal(html.includes('兰州'),false);
  await act(async () => root.unmount());host.remove();
});

test('schedule details save the chosen reminder and use the confirmed route rather than a toast-only action',async () => {
  const schedule={...flight,travelPlan:{mode:'driving' as const,minutes:40,bufferMinutes:60,remindDeparture:true,estimated:true}};
  const host=document.createElement('div');document.body.appendChild(host);const root=createRoot(host);let saved:Schedule|undefined;let routed:Schedule|undefined;
  await act(async () => root.render(<ScheduleDetailModal isOpen schedule={schedule} onClose={() => {}} onViewOnMap={() => {}} onDeleteSchedule={() => {}} showToast={() => {}} onUpdateSchedule={value => {saved=value;}} onPlanRoute={value => {routed=value;}}/>));
  assert.ok(host.textContent?.includes('1 个开始提醒'));assert.ok(host.textContent?.includes('仅自己可见'));assert.ok(host.textContent?.includes('距离估算'));assert.ok(host.textContent?.includes('21:50'));
  assert.equal((button(host,'未接通实时数据服务') as HTMLButtonElement).disabled,true);
  await click(button(host,'提醒'));await click(button(host,'提前 30 分钟'));await click(button(host,'保存提醒'));
  assert.deepEqual(saved?.reminders,[15,30]);assert.equal(saved?.travelPlan?.remindDeparture,true);
  await click(button(host,'规划路线与出发时间'));assert.equal(routed?.location.latitude,0);assert.equal(routed?.id,schedule.id);
  await act(async () => root.unmount());host.remove();
});

test('the expanded center-pin map writes its actual center on moveend and invalidates confirmation',async () => {
  const L=(await import('leaflet')).default;
  let map:import('leaflet').Map|undefined;
  L.Map.addInitHook(function () {map=this;});
  const host=document.createElement('div');document.body.appendChild(host);const root=createRoot(host);let selected:any;
  function Picker() {const [value,setValue]=React.useState({name:'中心针尖',lat:0,lng:0});const [confirmed,setConfirmed]=React.useState(true);return <CoordinatePicker label="中心选点" value={value} confirmed={confirmed} onChange={(location,confirmed) => {selected={location,confirmed};setValue(location);setConfirmed(confirmed);}}/>;}
  await act(async () => {root.render(<Picker/>);});
  await act(async () => {await new Promise(resolve => setTimeout(resolve,20));});
  assert.ok(map);assert.ok(button(host,'收起地图'));
  await act(async () => {map!.setView([0,4],15,{animate:false});});
  assert.equal(selected.confirmed,false);assert.equal(selected.location.lat,0);assert.equal(selected.location.lng,4);
  await click(button(host,'确认中心选点'));assert.equal(selected.confirmed,true);
  await act(async () => {map!.setView([0,5],15,{animate:false});});
  assert.equal(selected.confirmed,false);assert.equal(selected.location.lng,5);
  await act(async () => root.unmount());host.remove();
});
