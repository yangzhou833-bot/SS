import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import React, { act } from 'react';
import type { Friend } from '../src/types';

const dom = new Window({ url: 'http://localhost:4174' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'MouseEvent', 'Event', 'CustomEvent', 'localStorage', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  Object.defineProperty(globalThis, key, { value: ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(key) ? dom[key].bind(dom) : dom[key], configurable: true });
}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const { ActivityCreationModal } = await import('../src/components/ActivityCreationModal');
const { createRoot } = await import('react-dom/client');
const { getSharedState } = await import('../src/data/dualRoleStore');
const friend: Friend = { id: 'friend-sarah', name: 'Sarah', avatar: '/avatar.png', status: '在线', locationName: '咖啡店', lat: 36, lng: 103, x: 50, y: 50, distance: '1 km', battery: 80, lastUpdated: '刚刚', isOnline: true };
const button = (host: Element, text: string) => {
  const found = [...host.querySelectorAll('button')].find(element => element.textContent?.trim() === text);
  assert.ok(found, `button ${text} exists`);
  return found;
};
const click = async (element: Element) => act(async () => { element.dispatchEvent(new dom.MouseEvent('click', { bubbles: true }) as unknown as Event); });
const fill = async (input: Element | null, value: string) => {
  assert.ok(input);
  await act(async () => {
    const prototype = input.tagName === 'SELECT' ? dom.HTMLSelectElement.prototype : dom.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new dom.Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }) as unknown as Event);
  });
};

test('four-step creation preserves cross-day times, confirmed route coordinates, invitations and one published id', async () => {
  localStorage.clear();
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  let published: any;
  try {
    await act(async () => root.render(<ActivityCreationModal isOpen onClose={() => {}} friends={[friend]} initialLocation={{ name: '零点集合', lat: 0, lng: 0 }} onSuccessPublish={value => { published = value; }}/>));
    assert.equal(host.textContent?.includes('自驾露营'), false, 'test presets stay out of the production form');
    await fill(host.querySelector('#activity-title'), '和朋友一起骑行看日落并记录城市中最美好的生活片段');
    await click([...host.querySelectorAll('button')].find(item => item.getAttribute('aria-pressed') === 'false' && item.textContent?.includes('骑行'))!);
    await fill(host.querySelector('#activity-start'), '2026-10-13T23:00');
    await fill(host.querySelector('#activity-end'), '2026-10-14T01:30');
    await click(button(host, '下一步'));
    assert.ok(host.querySelector('[aria-label="活动路线设置"]'));
    await click(button(host, '确认活动举办位置'));
    await click(button(host, '添加途经点'));
    await fill(host.querySelector('[aria-label="途经点位置名称"]'), '江边补给点');
    await fill(host.querySelector('[aria-label="途经点位置经度"]'), '0.01');
    await fill(host.querySelector('#activity-node-time'), '23:30');
    await click(button(host, '保存途经点'));
    assert.ok(host.querySelector('[aria-label="途经点设置"]'), 'an unconfirmed coordinate cannot be saved');
    await click(button(host, '确认途经点位置'));
    await click(button(host, '保存途经点'));
    assert.equal(host.querySelector('[aria-label="途经点设置"]'), null);
    await fill(host.querySelector('[aria-label="活动举办位置经度"]'), '0.02');
    await click(button(host, '下一步'));
    assert.ok(host.querySelector('[aria-label="活动路线设置"]'), 'moving a shared venue invalidates both confirmations');
    assert.ok(host.textContent?.includes('请确认集合位置'));
    await click(button(host, '确认活动举办位置'));
    await click(button(host, '下一步'));
    await click(host.querySelector('[aria-label="邀请 Sarah"]')!);
    await fill(host.querySelector('[aria-label="Sarah的活动分工"]'), '补给');
    await click(button(host, '下一步'));
    assert.ok(host.querySelector('[aria-label="活动发布确认"]'));
    const publishButton = button(host, '确认并发布');
    await click(publishButton);
    assert.ok(published);
    assert.equal(published.startTime, '2026-10-13 23:00');
    assert.equal(published.endTime, '2026-10-14 01:30');
    assert.equal(published.lat, 0);
    assert.equal(published.lng, 0.02);
    assert.equal(published.originLocation.lng, published.venueLocation.lng);
    assert.deepEqual(published.itineraryNodes[0].latLng, { lat: 0, lng: 0.01 });
    assert.deepEqual(published.invitedFriendIds, [friend.id]);
    assert.equal(published.participantRoles[friend.id], '补给');
    assert.equal(published.participantRoles.me, '组织者');
    assert.equal(getSharedState().activities[0].id, published.id);
    assert.equal(localStorage.getItem('stellar_activity_draft'), null);
    assert.equal((publishButton as HTMLButtonElement).disabled, true);
    await click(publishButton);
    assert.equal(getSharedState().activities.length, 1, 'repeated clicks do not publish twice');
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('separate origin keeps the selected venue and requires its own confirmation; drafts survive closing', async () => {
  localStorage.clear();
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  let closed = 0;
  const render = (isOpen: boolean) => <ActivityCreationModal isOpen={isOpen} onClose={() => { closed++; }} initialLocation={{ name: '举办场地', lat: 36.1, lng: 103.2 }}/>;
  try {
    await act(async () => root.render(render(true)));
    await fill(host.querySelector('#activity-title'), '保存中的日落骑行');
    await click(button(host, '2路线'));
    await click(button(host, '确认活动举办位置'));
    await click(host.querySelector('input[type="checkbox"]')!);
    await fill(host.querySelector('[aria-label="发起 / 集合位置名称"]'), '单独集合点');
    await fill(host.querySelector('[aria-label="发起 / 集合位置经度"]'), '103.3');
    assert.equal((host.querySelector('[aria-label="活动举办位置经度"]') as HTMLInputElement).value, '103.2');
    await click(button(host, '下一步'));
    assert.ok(host.textContent?.includes('请确认集合位置'));
    await click(button(host, '确认发起 / 集合位置'));
    await click(button(host, '下一步'));
    assert.ok(host.querySelector('[aria-label="活动成员设置"]'));
    await click(host.querySelector('[aria-label="保存草稿并关闭"]')!);
    assert.equal(closed, 1);
    const draft = JSON.parse(localStorage.getItem('stellar_activity_draft')!);
    assert.equal(draft.title, '保存中的日落骑行');
    assert.equal(draft.originLocation.lng, 103.3);
    await act(async () => root.render(render(false)));
    await act(async () => root.render(render(true)));
    assert.equal((host.querySelector('#activity-title') as HTMLInputElement).value, draft.title);
    await click(button(host, '2路线'));
    assert.equal((host.querySelector('[aria-label="发起 / 集合位置经度"]') as HTMLInputElement).value, '103.3');
    assert.ok(button(host, '确认发起 / 集合位置'), 'restored coordinates require a fresh confirmation');
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('explicit templates replace stale drafts and editing keeps the activity id', async () => {
  localStorage.clear();
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  let published: any;
  try {
    await act(async () => root.render(<ActivityCreationModal isOpen onClose={() => {}}/>));
    const base = JSON.parse(localStorage.getItem('stellar_activity_draft')!);
    const editing = { ...base, id: 'activity-existing', title: '已有活动新安排', majorType: 'SPORTS', subType: 'CYCLING', startTime: '2026-10-13 18:00', endTime: '2026-10-13 20:00', originLocation: { name: '集合点', lat: 0, lng: 0 }, venueLocation: { name: '集合点', lat: 0, lng: 0 } };
    await act(async () => root.render(<ActivityCreationModal isOpen initialActivity={editing} onClose={() => {}} onSuccessPublish={value => { published = value; }}/>));
    assert.equal((host.querySelector('#activity-title') as HTMLInputElement).value, '已有活动新安排');
    assert.ok(host.textContent?.includes('编辑活动'));
    await click(button(host, '2路线'));
    await click(button(host, '确认活动举办位置'));
    await click(button(host, '4确认'));
    await click(button(host, '确认并更新'));
    assert.equal(published.id, 'activity-existing');
    assert.equal(getSharedState().activities[0].id, 'activity-existing');
    assert.equal(getSharedState().activities[0].lat, 0);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
