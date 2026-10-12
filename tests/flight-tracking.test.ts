import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Schedule } from '../src/types';

const flight = {
  id:'flight-test',type:'flight',title:'航班',icon:'✈️',color:'#1877F2',startAt:'2026-10-06 23:30',endAt:'2026-10-07 02:15',allDay:false,timezone:'Asia/Shanghai',
  location:{name:'出发机场',latitude:0,longitude:0},destination:{name:'到达机场',latitude:0,longitude:10},reminders:[120,30],mapVisibleAt:'always',keepAsHistory:true,visibilityRule:{scope:'private'},createdAt:'',updatedAt:'',
  flight:{flightNumber:'CA1502',departureAirport:'出发机场',arrivalAirport:'到达机场',status:'upcoming',isSimulated:false},
} as Schedule;
const now = Date.parse('2026-10-07T00:10:00+08:00');
const tracking = () => import('../src/utils/flightTracking');

test('a planned flight retains confirmed airports and duration but has no invented live position or progress',async () => {
  const {getFlightSnapshotInfo} = await tracking();
  const info = getFlightSnapshotInfo(flight,now);
  assert.equal(info.mode,'scheduled');assert.equal(info.position,null);assert.equal(info.progressPercent,null);assert.equal(info.elapsedMinutes,null);
  assert.equal(info.durationMinutes,165);assert.equal(info.status,'upcoming');
});
test('fresh source-stamped coordinates include zero; stale or unverified coordinates never become live',async () => {
  const {getFlightSnapshotInfo} = await tracking();
  const fresh={...flight,flight:{...flight.flight!,live:{source:'test provider',observedAt:'2026-10-07T00:09:00+08:00',fetchedAt:'2026-10-07T00:09:05+08:00',status:'in_flight' as const,position:{lat:0,lng:4},estimatedArrivalAt:'2026-10-07T02:30:00+08:00',actualDepartureAt:'2026-10-06T23:40:00+08:00'}}};
  const live = getFlightSnapshotInfo(fresh,now);assert.equal(live.mode,'live');assert.equal(live.position?.lat,0);assert.equal(live.position?.lng,4);assert.equal(live.elapsedMinutes,29);assert.equal(live.remainingMinutes,140);
  assert.equal(getFlightSnapshotInfo(fresh,now+360000).mode,'stale');assert.equal(getFlightSnapshotInfo(fresh,now+360000).position,null);
  assert.equal(getFlightSnapshotInfo({...fresh,flight:{...fresh.flight,live:{...fresh.flight.live,source:''}}},now).position,null);
  assert.equal(getFlightSnapshotInfo({...fresh,flight:{...fresh.flight,live:{...fresh.flight.live,position:{lat:100,lng:4}}}},now).position,null);
});
test('an unconfigured lookup performs no network request and a proxy response must identify source and observation time',async () => {
  const {fetchFlightSnapshot} = await tracking();
  const prior=globalThis.fetch;let calls=0;
  globalThis.fetch=async () => {calls++;return new Response(JSON.stringify({status:'in_flight',position:{lat:0,lng:4}}),{status:200});};
  try { assert.equal(await fetchFlightSnapshot(flight,undefined,''),null);assert.equal(calls,0);await assert.rejects(fetchFlightSnapshot(flight,undefined,'https://example.com/flights'),/来源.*观测时间/);assert.equal(calls,1); }
  finally {globalThis.fetch=prior;}
});

test('verified proxy responses preserve actual observation metadata and use the Shanghai flight date',async () => {
  const {fetchFlightSnapshot,getFlightSnapshotInfo}=await tracking();
  const prior=globalThis.fetch;let requested='';
  globalThis.fetch=async input => {requested=String(input);return new Response(JSON.stringify({flightNumber:'CA1502',source:'Verified provider',observedAt:'2026-10-07T00:09:00+08:00',status:'in_flight',position:{lat:0,lng:4,altitudeMeters:8900,speedKmh:720},estimatedArrivalAt:'2026-10-07T02:30:00+08:00'}),{status:200});};
  try {
    const live=await fetchFlightSnapshot(flight,undefined,'https://example.com/api/flight');
    const url=new URL(requested);assert.equal(url.searchParams.get('date'),'2026-10-06');assert.equal(url.searchParams.get('flightNumber'),'CA1502');
    assert.equal(live?.source,'Verified provider');assert.ok(Number.isFinite(Date.parse(live!.fetchedAt)));assert.equal(live?.position?.altitudeMeters,8900);
    const info=getFlightSnapshotInfo({...flight,flight:{...flight.flight!,live:live!}},now);assert.equal(info.position?.speedKmh,720);assert.equal(info.progressPercent,40);assert.equal(info.mode,'live');
  } finally {globalThis.fetch=prior;}
});

test('live status without a position and future or landed observations are presented without invented coordinates',async () => {
  const {getFlightSnapshotInfo}=await tracking();
  const live={source:'Provider',observedAt:'2026-10-07T00:09:00+08:00',fetchedAt:'2026-10-07T00:09:05+08:00',status:'in_flight' as const};
  const schedule={...flight,flight:{...flight.flight!,live}};
  const missing=getFlightSnapshotInfo(schedule,now);assert.equal(missing.mode,'live');assert.equal(missing.position,null);assert.ok(missing.dataLabel.includes('暂无位置观测'));assert.equal(missing.progressPercent,null);
  const future=getFlightSnapshotInfo({...schedule,flight:{...schedule.flight,live:{...live,observedAt:'2026-10-07T00:30:00+08:00'}}},now);assert.equal(future.mode,'stale');assert.equal(future.position,null);
  const landed=getFlightSnapshotInfo({...schedule,flight:{...schedule.flight,live:{...live,status:'landed' as const}}},now);assert.equal(landed.progressPercent,100);assert.equal(landed.remainingMinutes,0);assert.equal(landed.position,null);
});
