import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import React, { act } from 'react';
import type { LocalBook } from '../src/components/skills/LocalEBookReader';

const dom = new Window({ url: 'http://localhost:4174' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent', 'localStorage', 'ResizeObserver', 'getComputedStyle']) {
  Object.defineProperty(globalThis, key, { value: key === 'getComputedStyle' ? dom.getComputedStyle.bind(dom) : dom[key], configurable: true });
}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
registerHooks({ resolve(specifier, context, nextResolve) { return specifier.endsWith('.css') ? { url: 'data:text/javascript,export default {};', shortCircuit: true } : nextResolve(specifier, context); } });

// Exercise the production DB API; the in-memory IDB transport only replaces browser storage.
const records = new Map<string, LocalBook>();
Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: { open() {
  const request: any = {};
  setTimeout(() => {
    request.result = { close() {}, transaction() {
      const tx: any = {};
      const complete = () => setTimeout(() => tx.oncomplete?.(), 0);
      tx.objectStore = () => ({
        getAll() { const result: any = {}; setTimeout(() => { result.result = structuredClone([...records.values()]); result.onsuccess?.(); complete(); }, 0); return result; },
        get(id: string) { const result: any = {}; setTimeout(() => { result.result = structuredClone(records.get(id)); result.onsuccess?.(); complete(); }, 0); return result; },
        put(book: LocalBook) { records.set(book.id, structuredClone(book)); complete(); },
      });
      tx.abort = () => tx.onabort?.(); return tx;
    } };
    request.onsuccess?.();
  }, 0);
  return request;
} } });
const { createRoot } = await import('react-dom/client');
const { EBookReaderApp } = await import('../src/components/skills/EBookReaderApp');
const tick = () => new Promise(resolve => setTimeout(resolve, 45));
const userBook = (): LocalBook => ({ id: 'existing-user-book', title: '我的旅行手记', author: '小林', format: 'txt', bytes: new TextEncoder().encode('第一段\n第二段\n笔记所在原文').buffer,
  paragraphs: ['第一段', '第二段', '笔记所在原文'], toc: [{ id: 'one', label: '正文', href: '0' }], location: '1', progress: 66, lastRead: '2026-10-12T08:30:00.000Z', folderId: 'folder-hobby', tags: ['通识拓展'],
  bookmarks: [{ location: '1', label: '旧书签' }], notes: [{ id: 'saved-note', text: '留意身边的灯', quote: '笔记所在原文', location: '2', chapter: '正文', date: '2026-10-12' }] });
async function mount() {
  records.clear(); localStorage.clear(); records.set('existing-user-book', userBook());
  const host = document.createElement('div'); document.body.append(host);
  const root = createRoot(host); let closes = 0;
  const content = (isDarkMode = false) => <EBookReaderApp isDarkMode={isDarkMode} onClose={() => closes++} />;
  await act(async () => root.render(content()));
  await act(tick);
  return { host, root, closes: () => closes, render: async (dark: boolean) => { await act(async () => root.render(content(dark))); }, cleanup: async () => { await act(async () => root.unmount()); host.remove(); } };
}
async function click(target: Element | null) { assert.ok(target); await act(async () => { target.dispatchEvent(new dom.MouseEvent('click', { bubbles: true }) as unknown as Event); await tick(); }); }
async function input(target: Element | null, value: string) {
  assert.ok(target);
  const control = target as HTMLInputElement;
  const prototype = control.tagName === 'SELECT' ? dom.HTMLSelectElement.prototype : dom.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(control, value);
  await act(async () => control.dispatchEvent(new dom.Event(control.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }) as unknown as Event));
}

test('day/night share real imports, search, status filters and notes without fake commercial catalog', async () => {
  const view = await mount();
  try {
    assert.equal(view.host.querySelector('.ebook-library')?.getAttribute('data-theme'), 'light');
    assert.equal(view.host.querySelectorAll('.ebook-book-card').length, 3, 'two text samples join the existing import');
    assert.equal(view.host.querySelector('.ebook-continue-body h3')?.textContent, '我的旅行手记');
    assert.ok(view.host.textContent?.includes('原创样本'));
    assert.ok(!view.host.textContent?.includes('三体'));
    await click(view.host.querySelector('[aria-label="搜索书库"]'));
    await input(view.host.querySelector('#ebook-search'), '小林');
    assert.equal(view.host.querySelectorAll('.ebook-book-card').length, 1);
    await view.render(true);
    assert.equal(view.host.querySelector('.ebook-library')?.getAttribute('data-theme'), 'dark');
    assert.equal((view.host.querySelector('#ebook-search') as HTMLInputElement).value, '小林');
    assert.equal(view.host.querySelectorAll('.ebook-book-card').length, 1);
    await click([...view.host.querySelectorAll('.ebook-state-tabs button')].find(button => button.textContent === '在读')!);
    assert.equal(view.host.querySelectorAll('.ebook-book-card').length, 1);
    assert.deepEqual(records.get('existing-user-book'), userBook(), 'theme/search/filter must never rewrite imported bytes or notes');
    await click(view.host.querySelector('[aria-label="返回技能组件库"]'));
    assert.equal(view.closes(), 1);
  } finally { await view.cleanup(); }
});

test('folder/tag assignment persists without losing user progress, notes or bookmarks; modal traps keyboard focus', async () => {
  const view = await mount();
  try {
    const opener = view.host.querySelector('[aria-label="管理《我的旅行手记》"]') as HTMLButtonElement;
    opener.focus(); await click(opener);
    const sheet = view.host.querySelector('[role="dialog"]')!;
    assert.ok(sheet); assert.ok(sheet.contains(document.activeElement));
    const save = [...sheet.querySelectorAll('button')].find(button => button.textContent === '保存归类')!;
    save.focus();
    await act(async () => save.dispatchEvent(new dom.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }) as unknown as Event));
    assert.equal(document.activeElement, sheet.querySelector('[aria-label="关闭面板"]'));
    await input(sheet.querySelector('#ebook-edit-folder'), 'folder-course');
    await input(sheet.querySelector('#ebook-edit-state'), 'finished');
    await click(save);
    const saved = records.get('existing-user-book')!;
    assert.equal(saved.folderId, 'folder-course'); assert.equal(saved.readingState, 'finished');
    assert.equal(saved.progress, 66); assert.deepEqual(saved.notes, userBook().notes); assert.deepEqual(saved.bookmarks, userBook().bookmarks); assert.deepEqual(saved.bytes, userBook().bytes);
    assert.equal(view.host.querySelector('.ebook-app-status')?.textContent, '书籍归类已保存到本设备');
    assert.equal(view.host.querySelector('[role="dialog"]'), null); assert.equal(document.activeElement, opener);
    await click([...view.host.querySelectorAll('.ebook-state-tabs button')].find(button => button.textContent === '已读')!);
    assert.equal(view.host.querySelectorAll('.ebook-book-card').length, 1);
  } finally { await view.cleanup(); }
});

test('saved library notes reopen their original paragraph and return to the same themed library', async () => {
  const view = await mount();
  try {
    await view.render(true);
    await click([...view.host.querySelectorAll('.ebook-library-tabs button')].find(button => button.textContent === '笔记')!);
    assert.equal(view.host.querySelectorAll('.ebook-note').length, 1);
    await click(view.host.querySelector('.ebook-note'));
    assert.equal(view.host.querySelector('.ebook-reader-text p')?.textContent, '笔记所在原文');
    assert.equal(view.host.querySelector('.ebook-reader')?.getAttribute('data-theme'), 'night');
    await view.render(false);
    assert.equal(view.host.querySelector('.ebook-reader-text p')?.textContent, '笔记所在原文');
    await click(view.host.querySelector('[aria-label="返回书架"]'));
    assert.equal(view.host.querySelector('.ebook-library')?.getAttribute('data-theme'), 'light');
    assert.equal(view.host.querySelector('.ebook-library-tabs [aria-current]')?.textContent, '笔记');
    assert.equal(view.host.querySelectorAll('.ebook-note').length, 1);
    assert.equal(records.get('existing-user-book')?.notes.length, 1);
  } finally { await view.cleanup(); }
});

test('TXT import opens the real reader; invalid file keeps existing data and shows an actionable error', async () => {
  const view = await mount();
  try {
    await click(view.host.querySelector('[aria-label="导入书籍或漫画"]'));
    let fileInput = view.host.querySelector('input[accept=".epub,.txt"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', { configurable: true, value: [new File(['bad'], 'wrong.pdf')] });
    await act(async () => { fileInput.dispatchEvent(new dom.Event('change', { bubbles: true }) as unknown as Event); await tick(); });
    assert.ok(view.host.querySelector('[role="alert"]')?.textContent?.includes('EPUB'));
    assert.equal(view.host.querySelector('.ebook-app-status'), null, 'a failed import must never announce success');
    assert.deepEqual(records.get('existing-user-book'), userBook());
    fileInput = view.host.querySelector('input[accept=".epub,.txt"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', { configurable: true, value: [new File(['一段自己的文字\n第二段'], 'new-story.txt')] });
    await act(async () => { fileInput.dispatchEvent(new dom.Event('change', { bubbles: true }) as unknown as Event); await tick(); });
    assert.equal(view.host.querySelector('.ebook-reader-text p')?.textContent, '一段自己的文字');
    assert.equal(view.host.querySelector('.ebook-app-status')?.textContent, '《new-story》已保存到本设备', 'import success remains visible above the active reader');
    assert.ok([...records.values()].some(book => book.title === 'new-story'));
    assert.equal(records.get('existing-user-book')?.notes.length, 1);
    await click(view.host.querySelector('[aria-label="返回书架"]'));
    await click([...view.host.querySelectorAll('.ebook-library-tabs button')].find(button => button.textContent === '漫画')!);
    await click(view.host.querySelector('.ebook-book-open'));
    assert.ok(view.host.querySelector('.stellar-comic-reader'), 'comic tab must enter the actual comic reader');
  } finally { await view.cleanup(); }
});

test('library CSS preserves three columns, 44px controls and approved theme tokens', async () => {
  const css = await readFile(new URL('../src/components/skills/ebook-library.css', import.meta.url), 'utf8');
  assert.match(css, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /min-width: 44px; min-height: 44px/);
  for (const color of ['#FAFAF7', '#18202B', '#0969FF', '#111827', '#1D2639', '#F4F7FC']) assert.ok(css.includes(color));
  assert.match(css, /prefers-reduced-motion/);
});

test('the phone portal isolates parent gestures and leaves the skill page untouched on exit', async () => {
  records.clear(); localStorage.clear(); records.set('existing-user-book', userBook());
  const phone = document.createElement('div'); phone.className = 'phone-screen';
  phone.innerHTML = '<div class="phone-status-floating">系统状态栏</div><div id="stellar-phone-content"><header>Stellar 标题</header><div class="skill-content"></div><nav>原导航</nav></div><div class="phone-home-indicator"></div>';
  document.body.append(phone);
  const host = phone.querySelector('.skill-content') as HTMLElement;
  const background = phone.querySelector('#stellar-phone-content') as HTMLElement;
  const root = createRoot(host);
  let ancestorGestures = 0;
  const ancestorGesture = () => { ancestorGestures++; };
  const render = async (dark: boolean) => { await act(async () => root.render(<div onPointerDown={ancestorGesture} onPointerMove={ancestorGesture} onPointerUp={ancestorGesture} onPointerCancel={ancestorGesture}><EBookReaderApp isDarkMode={dark} onClose={() => {}} /></div>)); };
  try {
    await render(false); await act(tick);
    const overlay = phone.querySelector('.ebook-app-overlay')!;
    assert.equal(overlay.parentElement, phone, 'overlay must escape the clipped skill-content container');
    assert.equal(host.querySelector('.ebook-library'), null);
    assert.ok(overlay.querySelector('.ebook-library'));
    assert.equal(background.inert, true, 'underlying navigation cannot receive keyboard focus');
    await click(overlay.querySelector('[aria-label="阅读《我的旅行手记》"]'));
    assert.ok(overlay.querySelector('.ebook-reader-text'));
    const text = overlay.querySelector('.ebook-reader-text p')!;
    let childEvents = 0;
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) {
      text.addEventListener(type, () => childEvents++);
      const event = new dom.PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, clientX: 100, clientY: 120 });
      await act(async () => text.dispatchEvent(event as unknown as Event));
      assert.equal(event.defaultPrevented, false, `${type} must preserve native selection and scrolling`);
    }
    assert.equal(childEvents, 4, 'bubble isolation must keep events available to reader children');
    assert.equal(ancestorGestures, 0, 'React portal events must not activate the source parent swipe gesture');
    await render(true);
    assert.equal(overlay.querySelector('.ebook-reader')?.getAttribute('data-theme'), 'night');
    assert.equal(overlay.querySelector('.ebook-reader-text p')?.textContent, '第二段');
    await click(overlay.querySelector('[aria-label="返回书架"]'));
    assert.equal(overlay.querySelector('.ebook-library')?.getAttribute('data-theme'), 'dark');
    await click([...overlay.querySelectorAll('.ebook-library-tabs button')].find(button => button.textContent === '漫画')!);
    await click(overlay.querySelector('.ebook-book-open'));
    assert.ok(overlay.querySelector('.stellar-comic-reader'));
    await act(async () => root.unmount());
    assert.equal(phone.querySelector('.ebook-app-overlay'), null);
    assert.equal(background.inert, false);
    assert.equal(background.querySelector('header')?.textContent, 'Stellar 标题');
    assert.equal(background.querySelector('nav')?.textContent, '原导航');
  } finally { await act(async () => root.unmount()); phone.remove(); }
});
