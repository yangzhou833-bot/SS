import { test } from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { Window } from 'happy-dom';

const dom = new Window({ url: 'http://localhost:4173' });
Object.defineProperty(dom.Element.prototype, 'animate', { value: undefined, configurable: true });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent', 'localStorage', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  Object.defineProperty(globalThis, key, { value: ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(key) ? dom[key].bind(dom) : dom[key], configurable: true });
}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import('react-dom/client');
const { ActivityDetailShortCard } = await import('../src/components/ActivityDetailShortCard');
const { ActivityCommandDrawer } = await import('../src/components/ActivityCommandDrawer');
const click = async (host: Element, label: string) => {
  const button = [...host.querySelectorAll('button')].find(element => element.textContent?.trim() === label);
  assert.ok(button, `missing ${label}`);
  await act(async () => button.click());
};
const base = () => ({ id: 'test-activity', title: '城市阅读', category: '文化', icon: '📚', startTime: '2099-10-13 20:00', endTime: '2099-10-14 00:30', timeRange: '', locationName: '阅读咖啡馆', address: '公园东门', lat: 36, lng: 103, color: '#1877F2', bgGradient: '', status: 'upcoming', statusText: '', participants: [], isUserAdmin: true });

test('activity summary keeps its category separate from stale lifecycle labels after expiration, ending or pausing', async () => {
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  const cases = [
    { patch: { category: '同城探索 · 进行中', startTime: '2000-01-01 10:00', endTime: '2000-01-01 12:00' }, category: '同城探索', phase: '已结束' },
    { patch: { category: '同城探索 · 即将开始', endedAt: Date.now() }, category: '同城探索', phase: '已结束' },
    { patch: { category: '同城探索 · 进行中', startedAt: Date.now() - 60000, pausedAt: Date.now() }, category: '同城探索', phase: '已暂停' },
    { patch: { category: '小组活动 · 极客开发营' }, category: '小组活动 · 极客开发营', phase: '准备中' },
  ];
  try {
    for (const [index, item] of cases.entries()) {
      const activity: any = { ...base(), id: 'category-phase-' + index, ...item.patch };
      await act(async () => root.render(<ActivityDetailShortCard activity={activity} userLocation={{ lat: 36, lng: 103 }} onClose={() => {}} />));
      assert.equal(host.querySelector('.activity-tags span')?.textContent, item.category);
      assert.equal(host.querySelector('.activity-sheet-header .activity-phase')?.textContent, item.phase);
      assert.equal(activity.category, item.patch.category, 'display normalization must not mutate the activity entity');
    }
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('joining and privacy changes update the activity entity and survive opening another activity', async () => {
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  let activity: any = base(); const changes: any[] = [];
  const render = () => root.render(<ActivityDetailShortCard activity={activity} userLocation={{ lat: 36, lng: 103 }} onClose={() => {}} onUpdateActivity={next => { activity = next; changes.push(next); render(); }} />);
  try {
    await act(async () => render());
    await click(host, '报名参与');
    assert.equal(activity.participants.length, 1);
    assert.equal(activity.participants[0].invitationStatus, 'confirmed');
    assert.equal(activity.participants[0].id, 'me');
    await click(host, '设置');
    await click(host, '仅自己');
    assert.equal(activity.privacyLevel, 'private');
    const saved = activity;
    activity = { ...base(), id: 'other', title: '另一场活动' };
    await act(async () => render());
    assert.equal(host.querySelector('#act-short-card-join-btn')?.textContent?.trim(), '报名参与');
    activity = saved; await act(async () => render());
    assert.match(host.textContent!, /已报名/);
    assert.equal(changes.length, 2);
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('requests progress from open to claimed to resolved and achievements come from resolved records', async () => {
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  let activity: any = { ...base(), activityState: '进行中', startedAt: Date.now() - 120000 };
  const render = () => root.render(<ActivityDetailShortCard activity={activity} userLocation={{ lat: 36, lng: 103 }} onClose={() => {}} onUpdateActivity={next => { activity = next; render(); }} />);
  try {
    await act(async () => render());
    await click(host, '发需求');
    const input = host.querySelector<HTMLInputElement>('[aria-label="需求名称"]')!;
    await act(async () => { Object.getOwnPropertyDescriptor(dom.HTMLInputElement.prototype, 'value')!.set!.call(input, '需要补给水'); input.dispatchEvent(new dom.Event('input', { bubbles: true }) as unknown as Event); });
    await click(host, '发布需求');
    assert.equal(activity.needs.length, 1); assert.equal(activity.needs[0].status, 'open');
    await click(host, '我来帮忙');
    assert.equal(activity.needs[0].status, 'claimed'); assert.equal(activity.needs[0].helperId, 'me');
    await click(host, '确认解决');
    assert.equal(activity.needs[0].status, 'resolved');
    assert.match(host.textContent!, /已解决 1/);
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('lifecycle actions persist pause, end, template and local assistant summary without fabricated completion', async () => {
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  let activity: any = base(); let repeat: any;
  const render = () => root.render(<ActivityDetailShortCard activity={activity} userLocation={{ lat: 36, lng: 103 }} onClose={() => {}} onUpdateActivity={next => { activity = next; render(); }} onRepeatActivity={next => { repeat = next; }} />);
  try {
    await act(async () => render()); await click(host, '开始活动');
    assert.equal(activity.activityState, '进行中'); assert.ok(activity.startedAt);
    await click(host, '暂停活动'); assert.ok(activity.pausedAt);
    await click(host, '继续活动'); assert.equal(activity.pausedAt, undefined);
    await click(host, 'AI 助手');
    assert.match(host.textContent!, /本地整理/);
    await click(host, '结束活动'); await click(host, '确认结束');
    assert.equal(activity.activityState, '已结束'); assert.ok(activity.endedAt);
    assert.match(host.textContent!, /活动记忆/);
    await click(host, '保存模板'); assert.equal(activity.templateSaved, true);
    await click(host, '再次发起'); assert.equal(repeat.id, activity.id);
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('activity list derives current status and selects one sheet without opening its own detail', async () => {
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  const active: any = { ...base(), id: 'active', startTime: '2000-01-01 10:00', endTime: '2099-01-01 10:00', status: 'active_countdown', activityState: undefined };
  const calls: string[] = [];
  try {
    await act(async () => root.render(<ActivityCommandDrawer isOpen onClose={() => calls.push('close')} activities={[active]} initialTab="active" onSelectActivity={activity => calls.push(activity.id)} onOpenCreateActivity={() => {}} />));
    assert.ok(host.querySelector('#activity-card-active'));
    await act(async () => host.querySelector<HTMLButtonElement>('#activity-card-active')!.click());
    assert.deepEqual(calls, ['active', 'close']);
    assert.equal(host.textContent?.includes('一键全员到齐'), false);
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('activity photos are compressed before saving and the twelve-photo limit preserves existing records', async () => {
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  let activity: any = { ...base(), endedAt: Date.now(), moments: Array.from({ length: 11 }, (_, index) => ({ id: 'old-' + index, url: 'data:image/jpeg;base64,a', caption: '已有照片', authorName: '我', createdAt: Date.now(), lat: 36, lng: 103 })) };
  const sizes: number[][] = [], quality: number[] = [];
  const originalImage = globalThis.Image, originalReader = globalThis.FileReader;
  const originalContext = dom.HTMLCanvasElement.prototype.getContext, originalURL = dom.HTMLCanvasElement.prototype.toDataURL;
  Object.defineProperty(globalThis, 'FileReader', { configurable: true, value: class { result = 'data:image/png;base64,original'; onload: () => void; readAsDataURL() { queueMicrotask(() => this.onload()); } } });
  Object.defineProperty(globalThis, 'Image', { configurable: true, value: class { naturalWidth = 2400; naturalHeight = 1600; onload: () => void; set src(value: string) { queueMicrotask(() => this.onload()); } } });
  dom.HTMLCanvasElement.prototype.getContext = function () { return { fillRect() {}, drawImage() {} } as any; };
  dom.HTMLCanvasElement.prototype.toDataURL = function (type, q) { sizes.push([this.width, this.height]); quality.push(q!); return 'data:image/jpeg;base64,compressed'; };
  const render = () => root.render(<ActivityDetailShortCard activity={activity} userLocation={{ lat: 36, lng: 103 }} onClose={() => {}} onUpdateActivity={next => { activity = next; render(); }} />);
  try {
    await act(async () => render());
    const input = host.querySelector<HTMLInputElement>('[aria-label="添加活动记忆照片"]')!;
    Object.defineProperty(input, 'files', { configurable: true, value: [new dom.File(['original'], '原图.png', { type: 'image/png' }), new dom.File(['more'], '第二张.png', { type: 'image/png' })] });
    await act(async () => { input.dispatchEvent(new dom.Event('change', { bubbles: true }) as unknown as Event); await new Promise(resolve => setTimeout(resolve, 0)); });
    assert.equal(activity.moments.length, 12); assert.equal(activity.moments[11].url, 'data:image/jpeg;base64,compressed');
    assert.deepEqual(sizes, [[960, 640]]); assert.deepEqual(quality, [0.75]);
    await act(async () => input.dispatchEvent(new dom.Event('change', { bubbles: true }) as unknown as Event));
    assert.equal(activity.moments.length, 12); assert.deepEqual(sizes, [[960, 640]]);
    assert.match(host.querySelector('[role="alert"]')!.textContent!, /最多保留 12 张/);
  } finally {
    await act(async () => root.unmount()); host.remove();
    Object.defineProperty(globalThis, 'Image', { value: originalImage, configurable: true }); Object.defineProperty(globalThis, 'FileReader', { value: originalReader, configurable: true });
    dom.HTMLCanvasElement.prototype.getContext = originalContext; dom.HTMLCanvasElement.prototype.toDataURL = originalURL;
  }
});

test('read-only cards cannot enroll or manage roles and Escape closes a local editor before the sheet', async () => {
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  let closed = 0;
  const matchMedia = window.matchMedia;
  window.matchMedia = (() => ({ matches: true })) as unknown as typeof window.matchMedia;
  try {
    await act(async () => root.render(<ActivityDetailShortCard activity={{ ...base(), isUserAdmin: false } as any} userLocation={{ lat: 36, lng: 103 }} onClose={() => closed++} />));
    assert.equal((host.querySelector('#act-short-card-join-btn') as HTMLButtonElement).disabled, true);
    assert.equal(host.querySelector('[aria-label="管理活动"]'), null);
    assert.equal(host.querySelector('.stellar-activity-layer')?.getAttribute('data-reduced-motion'), 'true');
    await click(host, 'AI 助手');
    await act(async () => window.dispatchEvent(new dom.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }) as unknown as Event));
    assert.equal(host.querySelector('.activity-assistant'), null); assert.equal(closed, 0);
    await act(async () => window.dispatchEvent(new dom.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }) as unknown as Event));
    assert.equal(closed, 1);
  } finally { window.matchMedia = matchMedia; await act(async () => root.unmount()); host.remove(); }
});

test('an activity-start reminder retains zero minutes when disabled and enabled again', async () => {
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  let activity: any = { ...base(), isReminderSet: true, reminderMinutes: 0 };
  const render = () => root.render(<ActivityDetailShortCard activity={activity} userLocation={{ lat: 36, lng: 103 }} onClose={() => {}} onUpdateActivity={next => { activity = next; render(); }} />);
  try {
    await act(async () => render());
    await click(host, '日历排期1 个环节');
    const reminderButton = () => host.querySelector<HTMLButtonElement>('#act-short-card-remind-btn')!;
    assert.match(reminderButton().textContent!, /开始时提醒/);
    await act(async () => reminderButton().click());
    assert.equal(activity.isReminderSet, false); assert.equal(activity.reminderMinutes, 0);
    assert.match(reminderButton().textContent!, /开始时提醒/);
    await act(async () => reminderButton().click());
    assert.equal(activity.isReminderSet, true); assert.equal(activity.reminderMinutes, 0);
    assert.match(reminderButton().textContent!, /开始时提醒/);
  } finally { await act(async () => root.unmount()); host.remove(); }
});

test('finishing an asynchronous photo upload preserves activity changes made during image reading', async () => {
  const host = document.createElement('div'); document.body.appendChild(host); const root = createRoot(host);
  let activity: any = { ...base(), startedAt: Date.now() - 120000, updates: [] };
  const readers: { onload: () => void }[] = [];
  const originalImage = globalThis.Image, originalReader = globalThis.FileReader;
  const originalContext = dom.HTMLCanvasElement.prototype.getContext, originalURL = dom.HTMLCanvasElement.prototype.toDataURL;
  Object.defineProperty(globalThis, 'FileReader', { configurable: true, value: class { result = 'data:image/png;base64,original'; onload: () => void; readAsDataURL() { readers.push(this); } } });
  Object.defineProperty(globalThis, 'Image', { configurable: true, value: class { naturalWidth = 800; naturalHeight = 600; onload: () => void; set src(value: string) { queueMicrotask(() => this.onload()); } } });
  dom.HTMLCanvasElement.prototype.getContext = function () { return { fillRect() {}, drawImage() {} } as any; };
  dom.HTMLCanvasElement.prototype.toDataURL = function () { return 'data:image/jpeg;base64,compressed'; };
  const render = () => root.render(<ActivityDetailShortCard activity={activity} userLocation={{ lat: 36, lng: 103 }} onClose={() => {}} onUpdateActivity={next => { activity = next; render(); }} />);
  try {
    await act(async () => render());
    const input = host.querySelector<HTMLInputElement>('[aria-label="添加活动记忆照片"]')!;
    Object.defineProperty(input, 'files', { configurable: true, value: [new dom.File(['original'], '合照.png', { type: 'image/png' })] });
    await act(async () => input.dispatchEvent(new dom.Event('change', { bubbles: true }) as unknown as Event));
    assert.equal(readers.length, 1); assert.equal(activity.moments, undefined);
    const endedAt = Date.now();
    activity = { ...activity, title: '结束后的新标题', endedAt, updates: [{ id: 'new-update', text: '图片读取时已结束活动', createdAt: endedAt }] };
    await act(async () => render());
    await act(async () => { readers[0].onload(); await new Promise(resolve => setTimeout(resolve, 0)); });
    assert.equal(activity.title, '结束后的新标题'); assert.equal(activity.endedAt, endedAt);
    assert.equal(activity.moments.length, 1);
    assert.equal(activity.moments[0].caption, '合照');
    assert.ok(activity.updates.some((update: any) => update.id === 'new-update'));
    assert.ok(activity.updates.some((update: any) => /添加了.*活动照片/.test(update.text)));
  } finally {
    await act(async () => root.unmount()); host.remove();
    Object.defineProperty(globalThis, 'Image', { value: originalImage, configurable: true }); Object.defineProperty(globalThis, 'FileReader', { value: originalReader, configurable: true });
    dom.HTMLCanvasElement.prototype.getContext = originalContext; dom.HTMLCanvasElement.prototype.toDataURL = originalURL;
  }
});
