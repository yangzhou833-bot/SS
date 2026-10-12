import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { unlink, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import React, { act } from 'react';
import { Window } from 'happy-dom';

const books = new Map<string, any>();
let failSave = false;
let saveBlocker: Promise<void> | undefined;
let patchHook: ((id: string, patch: any) => Promise<void>) | undefined;
(globalThis as any).__ebookStorage = { books, shouldFail: () => failSave, blocked: () => saveBlocker, beforePatch: (id: string, patch: any) => patchHook?.(id, patch) };
Object.defineProperty(globalThis, 'FileReader', { configurable: true, value: class {
  result = ''; onload?: () => void; onerror?: () => void;
  async readAsDataURL(blob: Blob) {
    try { this.result = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`; this.onload?.(); }
    catch { this.onerror?.(); }
  }
} });
Object.defineProperty(globalThis, 'Image', { configurable: true, value: class {
  naturalWidth = 1; naturalHeight = 1; onload?: () => void; onerror?: () => void;
  set src(value: string) { queueMicrotask(() => Buffer.from(value.split(',')[1], 'base64').includes(Buffer.from('broken')) ? this.onerror?.() : this.onload?.()); }
} });
const bundle = new URL('../.ebook-content-test.mjs', import.meta.url);
await build({ stdin: { contents: `export * from ${JSON.stringify(fileURLToPath(new URL('../src/components/skills/ebook-content.ts', import.meta.url)))}; export * from ${JSON.stringify(fileURLToPath(new URL('../src/components/skills/ComicReader.tsx', import.meta.url)))};`, resolveDir: fileURLToPath(new URL('../', import.meta.url)), loader: 'ts' }, outfile: fileURLToPath(bundle), bundle: true, format: 'esm', platform: 'node', packages: 'external', loader: { '.css': 'empty' }, logLevel: 'silent', plugins: [{ name: 'browser-storage', setup(builder) {
  builder.onResolve({ filter: /\/LocalEBookReader$/ }, () => ({ path: 'storage', namespace: 'test-storage' }));
  builder.onLoad({ filter: /.*/, namespace: 'test-storage' }, () => ({ contents: `
    export async function listLocalBooks() { return [...globalThis.__ebookStorage.books.values()].map(v => structuredClone(v)); }
    export async function storeLocalBook(book) { if (globalThis.__ebookStorage.shouldFail()) throw new Error('storage quota exceeded'); globalThis.__ebookStorage.books.set(book.id, structuredClone(book)); }
    export async function patchLocalBook(id, patch) { await globalThis.__ebookStorage.blocked(); await globalThis.__ebookStorage.beforePatch(id, patch); if (globalThis.__ebookStorage.shouldFail()) throw new Error('storage quota exceeded'); const book = globalThis.__ebookStorage.books.get(id); if (!book) throw new Error('book unavailable'); globalThis.__ebookStorage.books.set(id, { ...book, ...structuredClone(patch), id }); }
  `, loader: 'js' }));
} }] });
const { ensureSampleBooks, importComicBook, ComicReader } = await import(bundle.href);
await unlink(bundle);
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a8ioAAAAASUVORK5CYII=', 'base64');
const image = (name: string, type = 'image/png', bytes: Uint8Array = png) => new File([bytes], name, { type });

test('original sample books are unread real chapters and a distinct three-page comic', async () => {
  books.clear();
  const samples = await ensureSampleBooks();
  assert.equal(samples.length, 3);
  assert.deepEqual(samples.map((item: any) => item.title), ['月光旅行', '城市观察', '夜航邮局']);
  for (const item of samples) { assert.equal(item.sample, true); assert.equal(item.progress, 0); assert.equal(item.lastRead, ''); assert.deepEqual(item.notes, []); }
  const moon = samples[0];
  assert.equal(moon.paragraphs.length, 5);
  assert.deepEqual(moon.toc.map((item: any) => item.href), ['0', '1', '2', '3', '4']);
  assert.ok(moon.paragraphs.every((text: string) => text.length > 200 && text.includes('\n\n')));
  assert.match(new TextDecoder().decode(moon.bytes), /下一盏绿灯也会亮起来/);
  const comic = samples[2];
  assert.equal(new Set(comic.comicPages.map((item: any) => item.data)).size, 3);
  for (const item of comic.comicPages) assert.ok((await readFile(new URL(`../public${item.data}`, import.meta.url))).length > 100);
});

test('seeding only adds missing sample IDs and never resets user progress or notes', async () => {
  const moon = books.get('stellar-original-moonlight-v1');
  const changed = { ...moon, progress: 67, location: '3', lastRead: '2026-10-12', notes: [{ id: 'note', text: '我的笔记' }] };
  books.set(moon.id, changed);
  books.delete('stellar-original-city-v1');
  books.set('personal', { id: 'personal', title: '私人书籍' });
  await Promise.all([ensureSampleBooks(), ensureSampleBooks()]);
  assert.equal(books.size, 4);
  assert.deepEqual(books.get(moon.id), changed);
  assert.equal(books.get('stellar-original-city-v1').progress, 0);
  assert.equal(books.get('personal').title, '私人书籍');
});

test('image import sorts pages naturally, persists data URLs, and repeat import preserves progress', async () => {
  const files = [image('story-10.png'), image('story-2.png'), image('story-1.png')];
  const comic = await importComicBook(files);
  assert.deepEqual(comic.comicPages.map((item: any) => item.name), ['story-1.png', 'story-2.png', 'story-10.png']);
  assert.ok(comic.comicPages.every((item: any) => item.data.startsWith('data:image/png;base64,')));
  assert.equal(comic.format, 'comic');
  assert.equal(comic.title, 'story');
  assert.equal(books.get(comic.id).comicPages.length, 3);
  books.set(comic.id, { ...comic, progress: 66, location: '1', notes: [{ text: '保留' }] });
  const repeated = await importComicBook(files.slice().reverse());
  assert.equal(repeated.id, comic.id);
  assert.equal(repeated.progress, 66);
  assert.deepEqual(repeated.notes, [{ text: '保留' }]);
});

test('rejects empty, oversized, unsupported, MIME-mismatched, corrupt, and undecodable images', async () => {
  await assert.rejects(importComicBook([]), /非空/);
  await assert.rejects(importComicBook([new File([], 'empty.png', { type: 'image/png' })]), /非空/);
  await assert.rejects(importComicBook([{ size: 100 * 1024 * 1024 + 1, name: 'huge.png' } as File]), /100 MB/);
  await assert.rejects(importComicBook([new File(['<svg/>'], 'unsafe.svg', { type: 'image/svg+xml' })]), /有效的 PNG/);
  await assert.rejects(importComicBook([image('wrong.png', 'application/pdf')]), /类型与扩展名不符/);
  await assert.rejects(importComicBook([image('bad.png', 'image/png', new Uint8Array([1, 2, 3]))]), /有效的 PNG/);
  await assert.rejects(importComicBook([image('decode.png', 'image/png', Buffer.concat([png, Buffer.from('broken')]))]), /已损坏/);
});

test('CBZ import uses existing ZIP dependency, ignores non-images, and sorts nested pages naturally', async () => {
  const zip = new JSZip();
  zip.file('pages/10.png', png); zip.file('pages/2.png', png); zip.file('metadata.txt', 'local only'); zip.file('unsafe.svg', '<svg/>');
  const bytes = await zip.generateAsync({ type: 'uint8array' });
  const comic = await importComicBook([new File([bytes], 'river.cbz', { type: 'application/zip' })]);
  assert.equal(comic.title, 'river');
  assert.deepEqual(comic.comicPages.map((item: any) => item.name), ['pages/2.png', 'pages/10.png']);
  await assert.rejects(importComicBook([new File(['broken'], 'bad.cbz')]), /CBZ 已损坏/);
  const noImages = new JSZip(); noImages.file('readme.txt', 'hello');
  await assert.rejects(importComicBook([new File([await noImages.generateAsync({ type: 'uint8array' })], 'empty.cbz')]), /没有 PNG/);
});

test('CBZ rejects declared expanded image data over 100 MB before attempting image decode', async () => {
  const zip = new JSZip(); zip.file('large.png', png);
  const bytes = await zip.generateAsync({ type: 'uint8array' });
  for (let index = 0; index < bytes.length - 46; index++) {
    if (bytes[index] === 0x50 && bytes[index + 1] === 0x4b && bytes[index + 2] === 0x01 && bytes[index + 3] === 0x02) {
      new DataView(bytes.buffer).setUint32(index + 24, 100 * 1024 * 1024 + 1, true);
    }
  }
  await assert.rejects(importComicBook([new File([bytes], 'oversized.cbz')]), /解压后的图片总大小超过 100 MB/);
});

test('storage errors remain failures instead of reporting a successfully imported book', async () => {
  failSave = true;
  try { await assert.rejects(importComicBook([image('save-failure-unique.png')]), /storage quota exceeded/); }
  finally { failSave = false; }
});

const dom = new Window({ url: 'http://localhost:3000' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent']) {
  Object.defineProperty(globalThis, key, { value: (dom as any)[key], configurable: true });
}
Object.defineProperty(dom.HTMLElement.prototype, 'scrollIntoView', { value() {}, configurable: true });
Object.defineProperty(dom.HTMLElement.prototype, 'scrollTo', { value() {}, configurable: true });
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import('react-dom/client');
async function mountReader(entry: any, onBack: () => void = () => {}) {
  books.set(entry.id, structuredClone(entry));
  const host = document.createElement('div'); document.body.append(host);
  const root = createRoot(host);
  const render = async (dark = false) => { await act(async () => root.render(React.createElement(ComicReader, { entry, onBack, isDarkMode: dark }))); };
  await render();
  return { host, render, close: async () => { await act(async () => root.unmount()); host.remove(); } };
}
async function click(host: HTMLElement, label: string) {
  const button = host.querySelector(`button[aria-label="${label}"]`) || [...host.querySelectorAll('button')].find(item => item.textContent === label);
  assert.ok(button, `button ${label} exists`);
  await act(async () => button.dispatchEvent(new dom.MouseEvent('click', { bubbles: true }) as unknown as Event));
}

test('comic reader restores page/mode/zoom, keeps them across theme changes, and supports visible/keyboard paging', async t => {
  const source = books.get('stellar-original-night-post-v1');
  const entry = { ...source, id: 'comic-runtime', location: '1', comicMode: 'strip', comicZoom: 125, notes: [{ text: 'existing' }] };
  const app = await mountReader(entry); t.after(app.close);
  assert.equal(app.host.querySelector('input')?.getAttribute('aria-valuetext'), '第 2 页，共 3 页');
  assert.equal(app.host.querySelectorAll('img').length, 3);
  assert.match((app.host.querySelector('.stellar-comic-artwork') as HTMLElement).style.width, /125%/);
  await click(app.host, '单页');
  await click(app.host, '放大画面');
  await app.render(true);
  assert.ok(app.host.querySelector('.stellar-comic-reader.is-dark'));
  assert.equal(app.host.querySelectorAll('img').length, 1);
  assert.equal(app.host.querySelector('img')?.getAttribute('src'), source.comicPages[1].data);
  assert.equal(books.get(entry.id).comicMode, 'single');
  assert.equal(books.get(entry.id).comicZoom, 150);
  await click(app.host, '下一页');
  assert.equal(books.get(entry.id).progress, 100);
  await act(async () => window.dispatchEvent(new dom.KeyboardEvent('keydown', { key: 'ArrowLeft' }) as unknown as Event));
  assert.equal(books.get(entry.id).location, '1');
  assert.deepEqual(books.get(entry.id).notes, [{ text: 'existing' }]);
});

test('comic reader awaits pending progress saves before returning and exposes failures with retry', async t => {
  let release!: () => void;
  saveBlocker = new Promise<void>(resolve => { release = resolve; });
  let returned = false;
  const entry = { ...books.get('stellar-original-night-post-v1'), id: 'comic-wait' };
  const app = await mountReader(entry, () => { returned = true; }); t.after(app.close);
  await click(app.host, '下一页');
  await click(app.host, '返回书架');
  assert.equal(returned, false);
  await act(async () => { release(); saveBlocker = undefined; });
  assert.equal(returned, true);
  assert.equal(books.get(entry.id).location, '1');
  await app.close();
  failSave = true;
  const failed = await mountReader({ ...entry, id: 'comic-failed' }); t.after(failed.close);
  assert.match(failed.host.querySelector('[role="alert"]')?.textContent || '', /保存失败/);
  await click(failed.host, '返回书架');
  assert.match(failed.host.querySelector('[role="alert"]')?.textContent || '', /阅读位置未保存/);
  failSave = false;
  await click(failed.host, '重试保存');
  assert.equal(failed.host.querySelector('[role="alert"]'), null);
  assert.equal(books.get('comic-failed').location, '0');
});

test('comic reader only marks the newest queued save as saved and exposes its failure', async t => {
  await ensureSampleBooks();
  const releases: (() => void)[] = [];
  patchHook = () => new Promise<void>(resolve => { releases.push(resolve); });
  t.after(() => { patchHook = undefined; failSave = false; releases.forEach(release => release()); });
  const entry = { ...books.get('stellar-original-night-post-v1'), id: 'comic-save-status' };
  const app = await mountReader(entry); t.after(app.close);
  assert.equal(releases.length, 1);
  await click(app.host, '下一页');
  await act(async () => releases[0]());
  assert.equal(releases.length, 2, 'latest save has started but remains pending');
  assert.equal(books.get(entry.id).location, '0', 'database only contains the older page');
  assert.equal(app.host.querySelector('input')?.getAttribute('aria-valuetext'), '第 2 页，共 3 页');
  assert.equal(app.host.querySelector('[role="status"]')?.textContent, '保存中…');
  failSave = true;
  await act(async () => releases[1]());
  assert.equal(app.host.querySelector('[role="status"]')?.textContent, '保存失败');
  assert.match(app.host.querySelector('[role="alert"]')?.textContent || '', /保存失败/);
  failSave = false; patchHook = undefined;
  await click(app.host, '重试保存');
  assert.equal(books.get(entry.id).location, '1');
  assert.equal(app.host.querySelector('[role="status"]')?.textContent, '已保存到本设备');
});

test('cold strip restore waits for preceding images and keeps page two anchored after late loads and zoom', async t => {
  await ensureSampleBooks();
  const loaded = new Set<HTMLImageElement>();
  const imagePrototype = dom.HTMLImageElement.prototype;
  const completeDescriptor = Object.getOwnPropertyDescriptor(imagePrototype, 'complete');
  const previousScrollIntoView = dom.HTMLElement.prototype.scrollIntoView;
  const previousRect = dom.HTMLElement.prototype.getBoundingClientRect;
  const scrolls: number[] = [];
  const frameHeight = (frame: HTMLElement) => {
    const zoom = parseFloat(frame.parentElement!.style.width) / 100;
    const image = frame.querySelector('img')!;
    return (loaded.has(image) ? 600 * zoom : 0) + 40;
  };
  const frameOffset = (frame: HTMLElement) => {
    let offset = 0;
    for (const sibling of frame.parentElement!.children) {
      if (sibling === frame) break;
      offset += frameHeight(sibling as HTMLElement);
    }
    return offset;
  };
  Object.defineProperty(imagePrototype, 'complete', { configurable: true, get() { return loaded.has(this); } });
  Object.defineProperty(dom.HTMLElement.prototype, 'scrollIntoView', { configurable: true, value(this: HTMLElement) {
    if (!this.matches('.stellar-comic-frame')) return;
    const view = this.closest('.stellar-comic-viewport')!;
    view.scrollTop = frameOffset(this); scrolls.push(view.scrollTop);
  } });
  Object.defineProperty(dom.HTMLElement.prototype, 'getBoundingClientRect', { configurable: true, value(this: HTMLElement) {
    if (this.matches('.stellar-comic-viewport')) return new dom.DOMRect(0, 0, 400, 640);
    if (this.matches('.stellar-comic-frame')) return new dom.DOMRect(0, frameOffset(this) - this.closest('.stellar-comic-viewport')!.scrollTop, 400, frameHeight(this));
    return previousRect.call(this);
  } });
  t.after(() => {
    if (completeDescriptor) Object.defineProperty(imagePrototype, 'complete', completeDescriptor);
    else Reflect.deleteProperty(imagePrototype, 'complete');
    Object.defineProperty(dom.HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: previousScrollIntoView });
    Object.defineProperty(dom.HTMLElement.prototype, 'getBoundingClientRect', { configurable: true, value: previousRect });
  });
  const entry = { ...books.get('stellar-original-night-post-v1'), id: 'comic-cold-strip', location: '1', comicMode: 'strip', comicZoom: 150 };
  const app = await mountReader(entry); t.after(app.close);
  const view = app.host.querySelector('.stellar-comic-viewport') as HTMLElement;
  Object.defineProperty(view, 'clientHeight', { configurable: true, value: 640 });
  const pictures = [...app.host.querySelectorAll('img')];
  assert.equal(pictures[0].getAttribute('loading'), 'eager', 'preceding page loads even while saved page is later');
  assert.equal(scrolls.length, 0, 'restoration cannot use zero-height image layout');
  const load = async (index: number) => { await act(async () => { loaded.add(pictures[index]); pictures[index].dispatchEvent(new dom.Event('load') as unknown as Event); }); };
  const scroll = async () => { await act(async () => view.dispatchEvent(new dom.Event('scroll') as unknown as Event)); };
  await load(1);
  await scroll();
  assert.equal(scrolls.length, 0, 'target alone is insufficient before its predecessor finishes');
  assert.equal(books.get(entry.id).location, '1', 'transient scroll cannot overwrite the saved page');
  await load(0);
  assert.equal(view.scrollTop, 940, 'page two is placed after the complete 150% first page');
  await scroll();
  assert.equal(books.get(entry.id).location, '1');
  const restoredScrolls = scrolls.length;
  await load(2);
  assert.equal(scrolls.length, restoredScrolls, 'a later image does not snap the reader elsewhere');
  assert.equal(view.scrollTop, 940);
  await click(app.host, '放大画面');
  assert.equal(view.scrollTop, 1090, '175% zoom aligns the current page using updated image height');
  await app.render(true);
  await scroll();
  assert.equal(view.scrollTop, 1090);
  assert.equal(books.get(entry.id).location, '1');
  assert.equal(books.get(entry.id).comicZoom, 175);
});
