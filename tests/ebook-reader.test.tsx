import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import React, { act } from 'react';

const dom = new Window({ url: 'http://localhost:4174' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'SVGElement', 'Element', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent', 'localStorage', 'getComputedStyle']) {
  Object.defineProperty(globalThis, key, { value: key === 'getComputedStyle' ? dom.getComputedStyle.bind(dom) : dom[key], configurable: true });
}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(globalThis, 'ResizeObserver', { value: class { observe() {} disconnect() {} }, configurable: true });

// IndexedDB is absent in happy-dom. This asynchronous store exercises the reader's
// read/patch/write contract, including commits that finish after a back click.
const stored = new Map<string, any>();
const openings: { name: string; version: number }[] = [];
let failNextCommit = false;
let heldCommits: (() => void)[] | null = null;
Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: {
  open(name: string, version: number) {
    openings.push({ name, version });
    const request: any = {};
    request.result = {
      close() {}, createObjectStore() {},
      transaction() {
        const tx: any = {}; let pending: any; let timer: ReturnType<typeof setTimeout>;
        const finish = () => { clearTimeout(timer); timer = setTimeout(() => {
          const commit = () => { if (pending && failNextCommit) { failNextCommit = false; tx.error = new Error('test storage failure'); tx.onerror?.(); return; } if (pending) stored.set(pending.id, structuredClone(pending)); tx.oncomplete?.(); };
          if (pending && heldCommits) heldCommits.push(commit); else commit();
        }, 18); };
        tx.objectStore = () => ({
          get(id: string) { const req: any = {}; setTimeout(() => { req.result = structuredClone(stored.get(id)); req.onsuccess?.(); finish(); }, 1); return req; },
          getAll() { const req: any = {}; setTimeout(() => { req.result = structuredClone([...stored.values()]); req.onsuccess?.(); finish(); }, 1); return req; },
          put(book: any) { pending = book; finish(); }
        });
        tx.abort = () => { clearTimeout(timer); tx.onabort?.(); };
        return tx;
      }
    };
    queueMicrotask(() => request.onsuccess?.()); return request;
  }
} });

const epubCalls: any = { options: null, highlights: [], displays: [], listeners: new Map() };
(globalThis as any).__ebookTestEpub = () => {
  const r: any = {
    location: { start: { href: 'chapter.xhtml' } },
    themes: { default(styles: any) { epubCalls.styles = styles; } },
    annotations: { highlight(cfi: string) { epubCalls.highlights.push(cfi); }, remove() {} },
    on(event: string, handler: (...args: any[]) => void) { epubCalls.listeners.set(event, handler); },
    off(event: string) { epubCalls.listeners.delete(event); },
    async display(location: string) { epubCalls.displays.push(location); },
    async reportLocation() { epubCalls.listeners.get('relocated')?.({ start: { cfi: 'epubcfi(/6/2!/4/2/1:0)', href: 'chapter.xhtml', index: 0, displayed: { page: 1, total: 2 } } }); },
    getContents() { return []; }, resize() {}, async prev() {}, async next() {}
  };
  return {
    async open() {}, destroy() {}, spine: { length: 1 },
    renderTo(_holder: any, options: any) { epubCalls.options = options; return r; }
  };
};
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.css')) return { url: 'data:text/javascript,export default {};', shortCircuit: true };
  if (specifier === 'epubjs') return { url: 'data:text/javascript,export default globalThis.__ebookTestEpub;', shortCircuit: true };
  return nextResolve(specifier, context);
} });
const { createRoot } = await import('react-dom/client');
const { LocalEBookReader, listLocalBooks, storeLocalBook, patchLocalBook, importLocalBook } = await import('../src/components/skills/LocalEBookReader');
import type { LocalBook } from '../src/components/skills/LocalEBookReader';
const style = document.createElement('style');
style.textContent = await readFile(new URL('../src/components/skills/ebook-reader.css', import.meta.url), 'utf8');
document.head.append(style);
const book = (extra: Partial<LocalBook> = {}): LocalBook => ({ id: crypto.randomUUID(), title: '原有书籍', author: '原作者', format: 'txt', bytes: new TextEncoder().encode('傍晚，河边的灯像给归途标出了温柔的坐标。').buffer, toc: [{ id: 'first', label: '第三章 · 河岸的灯', href: '0' }], paragraphs: ['傍晚，河边的灯像给归途标出了温柔的坐标。', '她把今天遇见的风景写进笔记。'], location: '0', progress: 42, lastRead: '2026-10-10', bookmarks: [], notes: [], folderId: 'old-folder', tags: ['原标签'], ...extra });
const flush = async (ms = 70) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });
async function mount(entry: LocalBook, dark = false, onBack = () => {}) {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  await act(async () => root.render(<LocalEBookReader entry={entry} isDarkMode={dark} onBack={onBack}/>));
  return { host, render: async (nextDark: boolean) => act(async () => root.render(<LocalEBookReader entry={entry} isDarkMode={nextDark} onBack={onBack}/>)), cleanup: async () => { await act(async () => root.unmount()); host.remove(); window.getSelection()?.removeAllRanges(); } };
}
async function click(host: Element, label: string) {
  const button = [...host.querySelectorAll<HTMLButtonElement>('button')].find(b => b.getAttribute('aria-label') === label || b.textContent === label);
  assert.ok(button, `button ${label} exists`);
  await act(async () => button.dispatchEvent(new dom.MouseEvent('click', { bubbles: true }) as unknown as Event));
}
async function selectText(host: Element, start: number, end: number) {
  const p = host.querySelector('.ebook-reader-text p')!; const range = document.createRange();
  range.setStart(p.firstChild!, start); range.setEnd(p.firstChild!, end);
  const selection = window.getSelection()!;
  await act(async () => { selection.removeAllRanges(); selection.addRange(range); p.dispatchEvent(new dom.MouseEvent('mouseup', { bubbles: true }) as unknown as Event); });
}

test('UTF-8 import retains all text and duplicate import preserves the original reading data in schema v1', async () => {
  const file = new File(['第一段\n第二段\n'], '真实导入.txt');
  const imported = await importLocalBook(file);
  assert.deepEqual(imported.paragraphs, ['第一段', '第二段', '']);
  await patchLocalBook(imported.id, { location: '1', progress: 67, notes: [{ id: 'legacy', text: '原有笔记', location: '1', chapter: '正文', date: '2026-10-10' }] });
  const again = await importLocalBook(file);
  assert.equal(again.location, '1'); assert.equal(again.notes[0].text, '原有笔记');
  assert.ok(openings.every(o => o.name === 'stellar-ebook-library-v1' && o.version === 1));
  await assert.rejects(importLocalBook(new File(['x'], 'book.pdf')), /支持 EPUB/);
});

test('TXT selected character range survives a progress update and back waits for both commits', async () => {
  localStorage.removeItem('stellar-ebook-preferences');
  const entry = book({ notes: [{ id: 'old-note', text: '不要覆盖', location: '0', chapter: '正文', date: '2026-10-10' }] }); await storeLocalBook(entry);
  let exits = 0; const view = await mount(entry, false, () => { exits++; });
  try {
    assert.equal(view.host.querySelector<HTMLElement>('article')!.style.fontSize, '18px');
    assert.equal(view.host.querySelector<HTMLElement>('article')!.style.lineHeight, '1.8');
    await selectText(view.host, 8, 20);
    assert.ok(view.host.querySelector('[role="toolbar"]'));
    await click(view.host, '划线');
    assert.equal(view.host.querySelector('mark')?.textContent, entry.paragraphs![0].slice(8, 20));
    await click(view.host, '下一页');
    await click(view.host, '返回书架');
    assert.equal(exits, 0, 'navigation waits for queued IndexedDB commits');
    await flush(100);
    assert.equal(exits, 1);
    const saved = (await listLocalBooks()).find(b => b.id === entry.id)!;
    assert.equal(saved.location, '1'); assert.equal(saved.progress, 100); assert.equal(saved.readingState, 'finished');
    assert.equal(saved.notes.length, 2); assert.equal(saved.notes[0].text, '不要覆盖');
    assert.deepEqual(saved.notes[1].range, { paragraph: 0, start: 8, end: 20 });
    assert.equal(saved.notes[1].quote, entry.paragraphs![0].slice(8, 20));
    assert.equal(saved.folderId, 'old-folder'); assert.deepEqual(saved.tags, ['原标签']);
    const reopened = await mount({ ...saved, location: '0' });
    try { assert.equal(reopened.host.querySelector('mark')?.textContent, saved.notes[1].quote); } finally { await reopened.cleanup(); }
  } finally { await view.cleanup(); }
});

test('theme changes preserve the reading page and all settings, notes and selection surfaces use night colors', async () => {
  const entry = book({ location: '1' }); await storeLocalBook(entry); const view = await mount(entry);
  try {
    const originalText = view.host.querySelector('article p')?.textContent;
    await view.render(true);
    assert.equal(view.host.querySelector('.ebook-reader')?.getAttribute('data-theme'), 'night');
    assert.equal(view.host.querySelector('article p')?.textContent, originalText);
    const back = view.host.querySelector<HTMLElement>('[aria-label="返回书架"]')!;
    assert.equal(getComputedStyle(back).minHeight, '44px'); assert.equal(getComputedStyle(back).minWidth, '44px');
    await click(view.host, '更多阅读工具'); await click(view.host, '阅读设置');
    const sheet = view.host.querySelector<HTMLElement>('[role="dialog"]')!;
    assert.equal(getComputedStyle(sheet).backgroundColor, '#202938');
    assert.match(sheet.textContent || '', /黑夜/);
    await click(view.host, '关闭面板');
    await act(async () => view.host.querySelector('main')!.dispatchEvent(new dom.MouseEvent('click', { bubbles: true }) as unknown as Event));
    assert.ok(view.host.querySelector('.ebook-reader-title.is-hidden'));
    assert.equal(back.closest('.is-hidden'), null, 'exit remains visible in immersive mode');
  } finally { await view.cleanup(); }
});

test('selected note stores its exact quote, AI discloses an unconfigured service and share requires an explicit copy action', async () => {
  const entry = book(); await storeLocalBook(entry); const view = await mount(entry, true);
  const copies: string[] = []; Object.defineProperty(navigator, 'clipboard', { value: { async writeText(text: string) { copies.push(text); } }, configurable: true });
  try {
    await selectText(view.host, 0, 8); await click(view.host, '问 AI');
    assert.match(view.host.querySelector('[role="dialog"]')?.textContent || '', /AI 服务未配置/);
    assert.equal(view.host.querySelector('[role="dialog"] blockquote')?.textContent, entry.paragraphs![0].slice(0, 8));
    await click(view.host, '为选段写笔记');
    const textarea = view.host.querySelector<HTMLTextAreaElement>('textarea')!;
    const setter = Object.getOwnPropertyDescriptor(dom.HTMLTextAreaElement.prototype, 'value')!.set!;
    await act(async () => { setter.call(textarea, '这是我的想法'); textarea.dispatchEvent(new dom.Event('input', { bubbles: true }) as unknown as Event); });
    await click(view.host, '保存笔记'); await flush();
    const saved = stored.get(entry.id); assert.equal(saved.notes[0].text, '这是我的想法'); assert.equal(saved.notes[0].quote, entry.paragraphs![0].slice(0, 8));
    await click(view.host, '关闭面板');
    await click(view.host, '下一页'); await selectText(view.host, 0, 4); await click(view.host, '分享');
    assert.equal(copies.length, 0, 'opening share does not send or copy anything');
    await click(view.host, '复制选段');
    assert.match(copies[0], /她把今天/); assert.match(copies[0], /原有书籍/);
    assert.match(view.host.querySelector('[role="dialog"]')?.textContent || '', /选段已复制/);
  } finally { await view.cleanup(); }
});

test('EPUB uses selected CFI annotations, keeps scripts disabled and theme updates do not recreate the engine', async () => {
  epubCalls.highlights = []; epubCalls.displays = [];
  const entry = book({ format: 'epub', paragraphs: undefined, location: '', toc: [{ id: 'chapter', label: '第三章', href: 'chapter.xhtml' }] }); await storeLocalBook(entry);
  const view = await mount(entry);
  try {
    await flush(); assert.equal(epubCalls.options.allowScriptedContent, false);
    const displayCount = epubCalls.displays.length;
    const cfi = 'epubcfi(/6/2!/4/2,/1:2,/1:8)';
    await act(async () => epubCalls.listeners.get('selected')(cfi, { window: { getSelection: () => ({ toString: () => '真正所选的原文' }) } }));
    await click(view.host, '划线'); await flush();
    assert.ok(epubCalls.highlights.includes(cfi));
    assert.equal(stored.get(entry.id).notes[0].location, cfi); assert.equal(stored.get(entry.id).notes[0].quote, '真正所选的原文');
    await view.render(true);
    assert.equal(epubCalls.displays.length, displayCount, 'global theme does not reopen the EPUB or reset its location');
    assert.equal(epubCalls.styles.body.background, '#18202B !important');
    await click(view.host, '更多阅读工具'); await click(view.host, '笔记与摘录');
    await act(async () => view.host.querySelector<HTMLButtonElement>('.ebook-reader-note')!.click());
    assert.equal(epubCalls.displays.at(-1), cfi, 'clicking the saved note displays its selected source');
  } finally { await view.cleanup(); }
});


test('failed storage blocks exit and a later write retries unsaved notes together with progress', async () => {
  const entry = book(); await storeLocalBook(entry); let exits = 0; const view = await mount(entry, false, () => { exits++; });
  try {
    await flush(); failNextCommit = true;
    await selectText(view.host, 0, 4); await click(view.host, '划线');
    await click(view.host, '返回书架'); await flush();
    assert.equal(exits, 0); assert.match(view.host.querySelector('[role="alert"]')?.textContent || '', /保存失败/);
    assert.equal(stored.get(entry.id).notes.length, 0);
    await click(view.host, '下一页'); await flush(); await click(view.host, '返回书架');
    assert.equal(exits, 1); assert.equal(stored.get(entry.id).location, '1');
    assert.equal(stored.get(entry.id).notes[0].quote, entry.paragraphs![0].slice(0, 4), 'a recovered progress write includes the previously failed highlight');
  } finally { await view.cleanup(); }
});

test('return locks writing controls until the queued transaction completes', async () => {
  const entry = book(); await storeLocalBook(entry); let exits = 0; const view = await mount(entry, false, () => { exits++; });
  try {
    await flush();
    await selectText(view.host, 0, 4);
    await click(view.host, '添加当前书签');
    await click(view.host, '返回书架');
    assert.equal(exits, 0);
    assert.equal(view.host.querySelector<HTMLButtonElement>('[aria-label="下一页"]')!.disabled, true);
    assert.equal(view.host.querySelector<HTMLButtonElement>('[aria-label="移除当前书签"]')!.disabled, true);
    const highlight = [...view.host.querySelectorAll<HTMLButtonElement>('[role="toolbar"] button')].find(b => b.textContent === '划线')!;
    assert.equal(highlight.disabled, true);
    await click(view.host, '下一页'); await click(view.host, '划线');
    await flush();
    assert.equal(exits, 1);
    assert.equal(stored.get(entry.id).location, '0');
    assert.equal(stored.get(entry.id).notes.length, 0, 'no new write is accepted after return starts');
    assert.equal(stored.get(entry.id).bookmarks.length, 1, 'the original queued bookmark is committed before exit');
  } finally { await view.cleanup(); }
});

test('note success appears after commit and is cleared when a later note commit fails', async () => {
  const entry = book(); await storeLocalBook(entry); const view = await mount(entry);
  try {
    await flush();
    await selectText(view.host, 0, 4); await click(view.host, '划线');
    assert.equal(stored.get(entry.id).notes.length, 0);
    assert.match(view.host.querySelector('.ebook-reader-toast')?.textContent || '', /保存中/);
    assert.doesNotMatch(view.host.querySelector('.ebook-reader-toast')?.textContent || '', /已.*保存/);
    await flush();
    assert.equal(stored.get(entry.id).notes.length, 1);
    assert.match(view.host.querySelector('.ebook-reader-toast')?.textContent || '', /已.*保存/);
    await click(view.host, '下一页'); await flush();
    failNextCommit = true;
    await selectText(view.host, 0, 4); await click(view.host, '划线');
    assert.doesNotMatch(view.host.querySelector('.ebook-reader-toast')?.textContent || '', /已.*保存/);
    await flush();
    assert.match(view.host.querySelector('[role="alert"]')?.textContent || '', /保存失败/);
    assert.equal(view.host.querySelector('.ebook-reader-toast'), null, 'a rejected transaction leaves no success toast');
    assert.equal(stored.get(entry.id).notes.length, 1);
  } finally { await view.cleanup(); }
});

test('return retries a failed note transaction without requiring a new reading action', async () => {
  const entry = book(); await storeLocalBook(entry); let exits = 0; const view = await mount(entry, false, () => { exits++; });
  try {
    await flush(); failNextCommit = true;
    await selectText(view.host, 0, 4); await click(view.host, '划线');
    await click(view.host, '返回书架'); await flush();
    assert.equal(exits, 0); assert.equal(stored.get(entry.id).notes.length, 0);
    await click(view.host, '返回书架'); await flush();
    assert.equal(exits, 1);
    assert.equal(stored.get(entry.id).notes[0].quote, entry.paragraphs![0].slice(0, 4));
  } finally { await view.cleanup(); }
});

test('note toast completes even when a later progress write becomes the latest queue item', async () => {
  const entry = book(); await storeLocalBook(entry); const view = await mount(entry);
  try {
    await flush();
    await selectText(view.host, 0, 4); await click(view.host, '划线');
    await click(view.host, '下一页'); await flush();
    assert.equal(stored.get(entry.id).notes.length, 1);
    assert.equal(stored.get(entry.id).location, '1');
    assert.match(view.host.querySelector('.ebook-reader-toast')?.textContent || '', /已.*保存/);
    assert.doesNotMatch(view.host.querySelector('.ebook-reader-toast')?.textContent || '', /保存中/);
  } finally { await view.cleanup(); }
});

test('an earlier note commit cannot replace the pending toast of a newer note operation', async () => {
  const entry = book(); await storeLocalBook(entry); const view = await mount(entry);
  try {
    await flush(); heldCommits = [];
    await selectText(view.host, 0, 4); await click(view.host, '划线');
    await click(view.host, '下一页');
    await selectText(view.host, 0, 4); await click(view.host, '划线');
    await flush();
    assert.equal(heldCommits.length, 1);
    await act(async () => heldCommits!.shift()!());
    await flush();
    assert.equal(stored.get(entry.id).notes.length, 1);
    assert.match(view.host.querySelector('.ebook-reader-toast')?.textContent || '', /保存中/);
    assert.equal(heldCommits.length, 1);
    await act(async () => heldCommits!.shift()!());
    assert.equal(stored.get(entry.id).notes.length, 2);
    assert.match(view.host.querySelector('.ebook-reader-toast')?.textContent || '', /已.*保存/);
  } finally {
    const remaining = heldCommits; heldCommits = null;
    await act(async () => remaining?.forEach(commit => commit()));
    await view.cleanup();
  }
});
