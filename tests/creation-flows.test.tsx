import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import React, { act } from 'react';

const dom = new Window({url:'http://localhost:4173'});
// Use Motion's animation fallback; happy-dom rejects canceled native animations on unmount.
Object.defineProperty(dom.Element.prototype, 'animate', { value: undefined, configurable: true });
for (const key of ['window','document','navigator','HTMLElement','Element','Node','MouseEvent','Event','CustomEvent','localStorage','getComputedStyle','requestAnimationFrame','cancelAnimationFrame']) {
  Object.defineProperty(globalThis,key,{value:typeof dom[key] === 'function' && ['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key) ? dom[key].bind(dom) : dom[key], configurable:true});
}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import('react-dom/client');
const { CoordinatePicker } = await import('../src/components/CoordinatePicker');
const { ScheduleCreationModal } = await import('../src/components/ScheduleCreationModal');
const { ActivityDetailShortCard } = await import('../src/components/ActivityDetailShortCard');
const click = async (element: Element) => act(async () => { element.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event); });
const button = (host: Element, text: string) => [...host.querySelectorAll('button')].find(element => element.textContent?.trim() === text)!;

test('picker cannot confirm invalid coordinates and changing a saved place clears prior confirmation', async () => {
  const host = document.createElement('div');document.body.appendChild(host);
  const root=createRoot(host);
  let selected: any;
  await act(async () => root.render(<CoordinatePicker label="测试地点" value={{name:'错误坐标',lat:91,lng:0}} confirmed={false} onChange={(location,confirmed) => {selected={location,confirmed};}}/>));
  assert.equal((button(host,'确认测试地点') as HTMLButtonElement).disabled,true);
  await act(async () => root.render(<CoordinatePicker label="测试地点" value={{name:'已确认地点',lat:0,lng:0}} confirmed onChange={(location,confirmed) => {selected={location,confirmed};}}/>));
  const savedPlace = [...host.querySelectorAll('button')].find(element => element.textContent?.includes('Leonie Bakery'))!;
  await click(savedPlace);
  assert.equal(selected.confirmed,false);
  assert.equal(selected.location.lat,36.0612);
  await act(async () => root.unmount());host.remove();
});

test('choosing a schedule template retains the life-place anchor supplied by the map', async () => {
  const host=document.createElement('div');document.body.appendChild(host);
  const root=createRoot(host);
  await act(async () => root.render(<ScheduleCreationModal isOpen onClose={() => {}} onSuccessCreate={() => {}} showToast={() => {}} initialLocation={{name:'生活坐标咖啡店',lat:36.123,lng:103.456}}/>));
  await click([...host.querySelectorAll('button')].find(element => element.textContent?.includes('普通日程'))!);
  await click(button(host,'下一步'));
  await click(button(host,'下一步'));
  assert.equal((host.querySelector('[aria-label="日程位置名称"]') as HTMLInputElement).value,'生活坐标咖啡店');
  assert.equal((host.querySelector('[aria-label="日程位置纬度"]') as HTMLInputElement).value,'36.123');
  await act(async () => root.unmount());host.remove();
});

test('activity details show the real selected date and cross-day time instead of a fixed demo date', async () => {
  const host=document.createElement('div');document.body.appendChild(host);
  const root=createRoot(host);
  const activity={id:'date-card',title:'跨日阅读',category:'文化',icon:'📚',startTime:'2026-10-13 20:00',endTime:'2026-10-14 00:30',timeRange:'',locationName:'咖啡馆',address:'',lat:36,lng:103,color:'#1877F2',bgGradient:'',status:'active_countdown' as const,statusText:'',participants:[]};
  await act(async () => root.render(<ActivityDetailShortCard activity={activity} userLocation={{lat:36,lng:103}} onClose={() => {}}/>));
  await click([...host.querySelectorAll('button')].find(element => element.textContent?.includes('日历排期'))!);
  assert.ok(host.textContent?.includes('2026年10月13日'));
  assert.ok(host.textContent?.includes('20:00 – 2026-10-14 00:30'));
  assert.equal(host.textContent?.includes('2026年9月5日'),false);
  await act(async () => root.unmount());host.remove();
});
