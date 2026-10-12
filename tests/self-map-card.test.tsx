import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import React, { act } from 'react';

const dom = new Window({url:'http://localhost:4173'});
for (const key of ['window','document','navigator','HTMLElement','Element','Node','Event','MouseEvent','KeyboardEvent','localStorage','getComputedStyle','requestAnimationFrame','cancelAnimationFrame']) {
  const value = dom[key];
  Object.defineProperty(globalThis,key,{value:['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key) ? value.bind(dom) : value,configurable:true});
}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
// Happy DOM cannot complete native animation promises before unmount.
Object.defineProperty(dom.Element.prototype,'animate',{value:undefined,configurable:true});
const { createRoot } = await import('react-dom/client');
const { LifeMapPanel } = await import('../src/components/LifeMapPanel');

test('self avatar card keeps life sections, status editing and history in one card', async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  const calls:string[] = [];
  const routes:unknown[] = [];
  await act(async () => root.render(<LifeMapPanel owner={{name:'我',note:'咖啡时间',emoji:'☕'}} schedules={[]} places={[]}
    onClose={() => calls.push('close')} onEditStatus={() => calls.push('status')} onOpenHistory={() => calls.push('history')}
    onClearRoute={() => calls.push('clear')}
    onTabChange={tab => calls.push(tab)} onLocate={() => {}} onCreatePlace={() => calls.push('place')}
    onEditPlace={() => {}} onCreateSchedule={() => calls.push('schedule')} onCreateActivity={() => {}}
    onSelectSchedule={() => {}} onUpdateSchedule={() => {}} onRouteChange={route => routes.push(route)} onToast={() => {}}/>));
  assert.ok(host.querySelector('[aria-label="我的地图卡片"]'));
  assert.deepEqual(routes,[], 'opening the self card must preserve the map route');
  const click = async (label:string) => {
    const button = [...host.querySelectorAll('button')].find(item => item.textContent?.trim()===label);
    assert.ok(button, `missing ${label}`);
    await act(async () => button.dispatchEvent(new dom.MouseEvent('click',{bubbles:true}) as unknown as Event));
  };
  await click('我的坐标');
  await click('添加坐标');
  await click('计划');
  await click('新建');
  await click('编辑状态');
  await click('足迹与历史');
  assert.deepEqual(calls,['places','place','plans','schedule','status','history']);
  await click('清除路线');
  assert.equal(calls.at(-1),'clear');
  assert.deepEqual(routes,[null]);
  await act(async () => window.dispatchEvent(new dom.KeyboardEvent('keydown',{key:'Escape'}) as unknown as Event));
  assert.equal(calls.at(-1),'close');
  await act(async () => root.unmount());
  host.remove();
});
