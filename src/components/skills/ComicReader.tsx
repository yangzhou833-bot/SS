import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, RotateCcw } from 'lucide-react';
import { patchLocalBook, type LocalBook } from './LocalEBookReader';
import './ebook-comic.css';

export function ComicReader({ entry, onBack, isDarkMode = false }: { entry: LocalBook; onBack: () => void; isDarkMode?: boolean }) {
  const pages = entry.comicPages || [];
  const initialPage = Math.min(Math.max(0, Math.floor(Number(entry.location) || 0)), Math.max(0, pages.length - 1));
  const [page, setPage] = useState(initialPage);
  const [mode, setMode] = useState<'single' | 'strip'>(entry.comicMode || 'single');
  const [zoom, setZoom] = useState(Math.max(100, Math.min(200, entry.comicZoom || 100)));
  const [saveError, setSaveError] = useState('');
  const [imageError, setImageError] = useState('');
  const error = saveError || imageError;
  const [saveStatus, setSaveStatus] = useState('已保存到本设备');
  const [leaving, setLeaving] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const frames = useRef<(HTMLElement | null)[]>([]);
  const activePage = useRef(initialPage);
  const stripAnchor = useRef<number | null>(entry.comicMode === 'strip' ? initialPage : null);
  const mounted = useRef(true);
  const writes = useRef(Promise.resolve());
  const current = useRef(entry);

  const persist = (patch: Partial<LocalBook>) => {
    current.current = { ...current.current, ...patch };
    setSaveStatus('保存中…');
    const latest = current.current;
    const write = writes.current = writes.current.catch(() => {}).then(() => patchLocalBook(entry.id, {
      location: latest.location, progress: latest.progress, lastRead: latest.lastRead,
      readingState: latest.readingState, comicMode: latest.comicMode, comicZoom: latest.comicZoom,
    }));
    write.then(() => { if (mounted.current && writes.current === write) { setSaveStatus('已保存到本设备'); setSaveError(''); } }, reason => {
      if (mounted.current && writes.current === write) { setSaveStatus('保存失败'); setSaveError(`保存失败：${reason.message || '本地存储不可用'}。请重试保存后返回。`); }
    });
  };
  const recordPage = (next: number) => {
    activePage.current = next; setPage(next);
    persist({ location: String(next), progress: Math.round(((next + 1) / pages.length) * 100),
      lastRead: new Date().toISOString(), readingState: next === pages.length - 1 ? 'finished' : 'reading' });
  };
  const restoreStripAnchor = () => {
    const target = stripAnchor.current;
    if (mode !== 'strip' || target === null) return;
    for (let index = 0; index <= target; index++) {
      if (!frames.current[index]?.querySelector('img')?.complete) return;
    }
    frames.current[target]?.scrollIntoView({ block: 'start', behavior: 'auto' });
    stripAnchor.current = null;
  };
  const go = (next: number) => {
    const bounded = Math.max(0, Math.min(pages.length - 1, next));
    if (!pages.length || leaving) return;
    if (mode === 'strip') stripAnchor.current = bounded;
    if (bounded !== activePage.current) recordPage(bounded);
    if (mode === 'strip') restoreStripAnchor();
    else viewport.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };
  useEffect(() => {
    mounted.current = true;
    if (pages.length) recordPage(initialPage);
    return () => { mounted.current = false; };
  }, [entry.id]);
  useEffect(() => {
    if (mode === 'strip') { stripAnchor.current = activePage.current; restoreStripAnchor(); }
    else stripAnchor.current = null;
  }, [mode, zoom]);
  useEffect(() => { if (mode === 'single') viewport.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }, [mode]);
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]'))) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); go(activePage.current + 1); }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); go(activePage.current - 1); }
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [mode, leaving]);
  const changeMode = (next: 'single' | 'strip') => { stripAnchor.current = next === 'strip' ? activePage.current : null; setMode(next); persist({ comicMode: next }); };
  const changeZoom = (next: number) => { if (mode === 'strip') stripAnchor.current = activePage.current; setZoom(next); persist({ comicZoom: next }); };
  const back = async () => {
    setLeaving(true);
    try { await writes.current; onBack(); }
    catch { setLeaving(false); setSaveError('阅读位置未保存。请点击“重试保存”，成功后返回。'); }
  };
  const trackScroll = () => {
    if (mode !== 'strip' || !viewport.current || leaving || stripAnchor.current !== null) return;
    const top = viewport.current.getBoundingClientRect().top + viewport.current.clientHeight * 0.3;
    let next = 0;
    for (let index = 0; index < frames.current.length; index++) {
      const frame = frames.current[index];
      if (frame && frame.getBoundingClientRect().top <= top) next = index;
    }
    if (next !== activePage.current) recordPage(next);
  };
  const artwork = (index: number) => <figure key={index} ref={node => { frames.current[index] = node; }} className="stellar-comic-frame" data-page={index}>
    <img src={pages[index].data} alt={`${entry.title} · 第 ${index + 1} 页：${pages[index].name}`} loading={mode === 'single' || index <= page ? 'eager' : 'lazy'}
      onLoad={restoreStripAnchor} onError={() => { setImageError(`第 ${index + 1} 页图片无法显示，请检查导入文件。`); restoreStripAnchor(); }} />
    {mode === 'strip' && <figcaption>第 {index + 1} 页 · {pages[index].name}</figcaption>}
  </figure>;

  return <div className={`stellar-comic-reader${isDarkMode ? ' is-dark' : ''}`}>
    <header className="stellar-comic-header">
      <button className="stellar-comic-icon" onClick={back} disabled={leaving} aria-label="返回书架"><ArrowLeft size={21} aria-hidden="true" /></button>
      <div className="stellar-comic-heading"><h1>{entry.title}</h1><span>{entry.sample ? '原创示例漫画' : '本地漫画'} · {pages.length} 页</span></div>
      <div className="stellar-comic-modes" aria-label="漫画阅读模式">
        <button aria-pressed={mode === 'single'} onClick={() => changeMode('single')} disabled={leaving}>单页</button>
        <button aria-pressed={mode === 'strip'} onClick={() => changeMode('strip')} disabled={leaving}>条漫</button>
      </div>
    </header>
    {error && <div className="stellar-comic-error" role="alert"><span>{error}</span>{saveStatus === '保存失败' && <button onClick={() => persist({})}>重试保存</button>}</div>}
    <main className={`stellar-comic-viewport is-${mode}`} ref={viewport} onScroll={trackScroll} aria-label="漫画正文" tabIndex={0}>
      {pages.length ? <div className="stellar-comic-artwork" style={{ width: `${zoom}%`, maxWidth: `${720 * zoom / 100}px` }}>
        {mode === 'single' ? artwork(page) : pages.map((_, index) => artwork(index))}
      </div> : <p className="stellar-comic-empty">这本漫画没有可阅读的图片。</p>}
    </main>
    <footer className="stellar-comic-footer">
      <div className="stellar-comic-pagebar">
        <button className="stellar-comic-icon" aria-label="上一页" onClick={() => go(page - 1)} disabled={!pages.length || page === 0 || leaving}><ChevronLeft size={22} aria-hidden="true" /></button>
        <label className="stellar-comic-slider"><span className="stellar-comic-sr-only">跳转漫画页码</span><input type="range" min={1} max={Math.max(1, pages.length)} value={page + 1} aria-valuetext={`第 ${page + 1} 页，共 ${pages.length} 页`} disabled={!pages.length || leaving} onChange={event => go(Number(event.target.value) - 1)} /></label>
        <span className="stellar-comic-count" aria-live="polite">{pages.length ? page + 1 : 0} / {pages.length}</span>
        <button className="stellar-comic-icon" aria-label="下一页" onClick={() => go(page + 1)} disabled={!pages.length || page === pages.length - 1 || leaving}><ChevronRight size={22} aria-hidden="true" /></button>
      </div>
      <div className="stellar-comic-tools">
        <span role="status">{leaving ? '正在保存…' : saveStatus}</span>
        <div className="stellar-comic-zoom" aria-label="画面缩放">
          <button className="stellar-comic-icon" aria-label="缩小画面" onClick={() => changeZoom(Math.max(100, zoom - 25))} disabled={zoom === 100 || leaving}><Minus size={17} aria-hidden="true" /></button>
          <button className="stellar-comic-reset" aria-label="恢复完整宽度" onClick={() => changeZoom(100)} disabled={leaving}><RotateCcw size={14} aria-hidden="true" />{zoom}%</button>
          <button className="stellar-comic-icon" aria-label="放大画面" onClick={() => changeZoom(Math.min(200, zoom + 25))} disabled={zoom === 200 || leaving}><Plus size={17} aria-hidden="true" /></button>
        </div>
      </div>
    </footer>
  </div>;
}
