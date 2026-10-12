import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, BookOpen, ChevronRight, Folder, MoreHorizontal, Plus, Search, SlidersHorizontal, Upload, X } from 'lucide-react';
import {
  LocalEBookReader, type LocalBook, type BookFolder, listLocalBooks, importLocalBook,
  patchLocalBook, getLocalFolders, saveLocalFolders, getLocalTags, saveLocalTags
} from './LocalEBookReader';
import { FriendsReadingShelf } from '../FriendsReadingShelf';
import { ComicReader } from './ComicReader';
import { ensureSampleBooks, importComicBook } from './ebook-content';
import { useDialogFocus } from '../../utils/useDialogFocus';
import './ebook-library.css';

export interface EBookReaderAppProps {
  onClose: () => void;
  showToast?: (message: string) => void;
  isDarkMode?: boolean;
}
type ShelfState = 'all' | 'reading' | 'want' | 'finished';
const states = [['reading', '在读'], ['want', '待读'], ['finished', '已读']] as const;
const bookState = (book: LocalBook): ShelfState => book.readingState || (book.progress >= 100 ? 'finished' : book.lastRead ? 'reading' : 'want');
const progress = (book: LocalBook) => Math.max(0, Math.min(100, Math.round(book.progress || 0)));

function Cover({ book }: { book: LocalBook }) {
  return <div className={`ebook-cover ${book.format === 'comic' ? 'ebook-cover-comic' : ''}`}>
    {book.cover ? <img src={book.cover} alt="" loading="lazy" /> : <div className="ebook-cover-fallback"><BookOpen aria-hidden="true" size={24} /><strong>{book.title}</strong><span>{book.author}</span></div>}
  </div>;
}

export const EBookReaderApp: React.FC<EBookReaderAppProps> = ({ onClose, showToast, isDarkMode = false }) => {
  const anchor = useRef<HTMLSpanElement>(null);
  const [screen, setScreen] = useState<HTMLElement | null>(null);
  const [books, setBooks] = useState<LocalBook[]>([]);
  const [active, setActive] = useState<LocalBook | null>(null);
  const [tab, setTab] = useState<'books' | 'comics' | 'notes'>('books');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [state, setState] = useState<ShelfState>('all');
  const [folder, setFolder] = useState('all');
  const [tag, setTag] = useState('all');
  const [folders, setFolders] = useState<BookFolder[]>(getLocalFolders);
  const [tags, setTags] = useState<string[]>(getLocalTags);
  const [modal, setModal] = useState<'import' | 'filter' | 'organize' | null>(null);
  const [editing, setEditing] = useState<LocalBook | null>(null);
  const [editFolder, setEditFolder] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editState, setEditState] = useState<ShelfState>('want');
  const [newFolder, setNewFolder] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const dialog = useDialogFocus(Boolean(modal), () => { if (!busy) setModal(null); });
  const search = useRef<HTMLInputElement>(null);
  const textFiles = useRef<HTMLInputElement>(null);
  const comicFiles = useRef<HTMLInputElement>(null);

  const reload = async () => setBooks(await listLocalBooks());
  useLayoutEffect(() => { setScreen(anchor.current?.closest<HTMLElement>('.phone-screen') || null); }, []);
  useEffect(() => {
    const background = screen?.querySelector<HTMLElement>(':scope > #stellar-phone-content');
    if (!background) return;
    const previous = document.activeElement as HTMLElement | null;
    const wasInert = background.inert;
    background.inert = true;
    screen.querySelector<HTMLButtonElement>('.ebook-app-overlay button')?.focus();
    return () => { background.inert = wasInert; if (previous?.isConnected) previous.focus(); };
  }, [screen]);
  const fullscreen = (content: React.ReactNode) => {
    const stopGesture = (event: React.PointerEvent) => event.stopPropagation();
    const overlay = <div className="ebook-app-overlay" data-theme={isDarkMode ? 'dark' : 'light'} onPointerDown={stopGesture} onPointerMove={stopGesture} onPointerUp={stopGesture} onPointerCancel={stopGesture}>{content}{notice && <p className="ebook-app-status" role="status">{notice}</p>}</div>;
    return <><span ref={anchor} hidden />{screen ? createPortal(overlay, screen) : overlay}</>;
  };
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Read existing imports first; a sample error must never hide the user's library.
        const existing = await listLocalBooks();
        if (!cancelled) setBooks(existing);
        await ensureSampleBooks();
        const all = await listLocalBooks();
        if (!cancelled) setBooks(all);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : '无法读取本地书库，请检查浏览器存储权限。');
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => { if (searchOpen) search.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const closeReader = async () => {
    try { await reload(); } catch { setError('阅读记录已退出，但书库刷新失败，请重新打开星阅。'); }
    setActive(null);
  };
  const importFiles = async (files: File[], comic: boolean) => {
    if (busy || !files.length) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const book = comic ? await importComicBook(files) : await importLocalBook(files[0]);
      await reload(); setModal(null); setActive(book);
      setNotice(`《${book.title}》已保存到本设备`);
      showToast?.(`《${book.title}》已保存到本设备`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '导入失败，请检查文件格式。');
    } finally {
      setBusy(false);
      if (textFiles.current) textFiles.current.value = '';
      if (comicFiles.current) comicFiles.current.value = '';
    }
  };
  const organize = (book: LocalBook) => {
    setEditing(book); setEditFolder(book.folderId || ''); setEditTags(book.tags || []);
    setEditState(bookState(book)); setModal('organize'); setError('');
  };
  const saveOrganization = async () => {
    if (!editing || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await patchLocalBook(editing.id, { folderId: editFolder || undefined, tags: editTags, readingState: editState as LocalBook['readingState'] });
      await reload(); setModal(null); setNotice('书籍归类已保存到本设备'); showToast?.('书籍归类已保存');
    } catch { setError('归类保存失败，请重试。'); }
    finally { setBusy(false); }
  };
  const addFolder = () => {
    const name = newFolder.trim();
    if (!name || folders.some(item => item.name === name)) return;
    const updated = [...folders, { id: `folder-${crypto.randomUUID()}`, name, color: '#0969FF', createdAt: new Date().toISOString() }];
    saveLocalFolders(updated); setFolders(updated); setNewFolder('');
  };
  const addTag = () => {
    const name = newTag.trim().replace(/^#+/, '');
    if (!name || tags.includes(name)) return;
    const updated = [...tags, name]; saveLocalTags(updated); setTags(updated); setNewTag('');
  };

  if (active) return fullscreen(active.format === 'comic'
    ? <ComicReader entry={active} onBack={closeReader} isDarkMode={isDarkMode} />
    : <LocalEBookReader entry={active} onBack={closeReader} isDarkMode={isDarkMode} />);

  const matching = books.filter(book => {
    const folderName = folders.find(item => item.id === book.folderId)?.name || '';
    const matchesQuery = `${book.title} ${book.author} ${folderName} ${(book.tags || []).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (folder === 'all' || (folder === 'none' ? !book.folderId : folder === book.folderId)) && (tag === 'all' || book.tags?.includes(tag)) && (state === 'all' || bookState(book) === state);
  });
  const shelf = matching.filter(book => tab === 'comics' ? book.format === 'comic' : book.format !== 'comic');
  const continueBook = books.filter(book => tab === 'comics' ? book.format === 'comic' : book.format !== 'comic').sort((a, b) => (b.lastRead || '').localeCompare(a.lastRead || ''))[0];
  const notes = matching.flatMap(book => book.notes.map(note => ({ book, note })));
  const noteCount = books.reduce((count, book) => count + book.notes.length, 0);
  const filterCount = Number(folder !== 'all') + Number(tag !== 'all');
  const closeModal = () => { if (!busy) setModal(null); };

  return fullscreen(<div className="ebook-library" data-theme={isDarkMode ? 'dark' : 'light'}>
    <header className="ebook-library-header">
      <span className="ebook-eyebrow">STELLAR · 电子书</span>
      <div className="ebook-header-row">
        <button className="ebook-icon-button" aria-label="返回技能组件库" onClick={onClose}><ArrowLeft aria-hidden="true" size={23} /></button>
        <h1>星阅</h1>
        <div className="ebook-header-actions">
          <button className="ebook-icon-button" aria-label="搜索书库" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Search aria-hidden="true" size={23} /></button>
          <button className="ebook-icon-button ebook-primary" aria-label="导入书籍或漫画" onClick={() => { setError(''); setModal('import'); }}><Plus aria-hidden="true" size={26} /></button>
        </div>
      </div>
      {searchOpen && <div className="ebook-search-field"><label htmlFor="ebook-search">搜索书名、作者或标签</label><div><Search aria-hidden="true" size={18} /><input id="ebook-search" ref={search} type="search" value={query} onChange={event => setQuery(event.target.value)} /><button className="ebook-icon-button" aria-label="清除搜索并关闭" onClick={() => { setQuery(''); setSearchOpen(false); }}><X aria-hidden="true" size={18} /></button></div></div>}
      <nav className="ebook-library-tabs" aria-label="书库内容">
        {([['books', '书籍'], ['comics', '漫画'], ['notes', '笔记']] as const).map(([id, label]) => <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>{label}</button>)}
      </nav>
    </header>
    <main className="ebook-library-main">
      {error && !modal && <p className="ebook-error" role="alert">{error}</p>}
      {loading && <p className="ebook-empty" role="status">正在打开本设备书库…</p>}
      {tab !== 'notes' && continueBook && <section className="ebook-continue-section" aria-labelledby="ebook-continue-title">
        <h2 id="ebook-continue-title">{continueBook.lastRead ? '继续阅读' : '从这里开始'}</h2>
        <div className="ebook-continue-card"><Cover book={continueBook} /><div className="ebook-continue-body"><span className="ebook-source-label">{continueBook.sample ? '原创样本' : '本设备书库'}</span><h3>{continueBook.title}</h3><p>{continueBook.lastRead ? `已读 ${progress(continueBook)}%` : continueBook.format === 'comic' ? `${continueBook.comicPages?.length || 0} 页 · 未开始` : '未开始阅读'}</p><button className="ebook-primary ebook-continue-button" onClick={() => setActive(continueBook)}>{continueBook.lastRead ? '继续阅读' : '开始阅读'}<ChevronRight aria-hidden="true" size={18} /></button><div className="ebook-progress" aria-label={`阅读进度 ${progress(continueBook)}%`}><span style={{ width: `${progress(continueBook)}%` }} /></div></div></div>
      </section>}
      
      {/* FriendsReadingShelf component */}
      <FriendsReadingShelf />
      <section aria-labelledby="ebook-shelf-title">
        <div className="ebook-section-heading"><h2 id="ebook-shelf-title">{tab === 'notes' ? '笔记与摘录' : '我的书架'}<span>{tab === 'notes' ? notes.length : shelf.length}</span></h2><button className="ebook-icon-button" aria-label={filterCount ? `筛选书库，已启用 ${filterCount} 项` : '筛选书库'} onClick={() => { setError(''); setModal('filter'); }}><SlidersHorizontal aria-hidden="true" size={20} />{filterCount > 0 && <span className="ebook-filter-dot" />}</button></div>
        <div className="ebook-state-tabs" aria-label="阅读状态筛选">{states.map(([id, label]) => <button key={id} aria-pressed={state === id} onClick={() => setState(state === id ? 'all' : id)}>{label}</button>)}</div>
        {state !== 'all' && <button className="ebook-reset-filter" onClick={() => setState('all')}>显示全部阅读状态</button>}
        {tab === 'notes' ? <div className="ebook-notes-list">
          {notes.map(({ book, note }) => <button key={`${book.id}-${note.id}`} className="ebook-note" onClick={() => setActive({ ...book, location: note.location })}><span>{book.title} · {note.chapter}</span>{note.quote && <blockquote>{note.quote}</blockquote>}<p>{note.text}</p><small>{note.date} · 返回原文<ChevronRight aria-hidden="true" size={16} /></small></button>)}
          {!loading && !notes.length && <p className="ebook-empty">{noteCount ? '没有符合当前筛选的笔记。' : '阅读时选择文字，保存划线或笔记。它们会留在本设备，点击可返回原文。'}</p>}
        </div> : <div className="ebook-cover-grid">
          {shelf.map(book => <article key={book.id} className="ebook-book-card"><button className="ebook-book-open" aria-label={`阅读《${book.title}》`} onClick={() => setActive(book)}><Cover book={book} /><h3>{book.title}</h3><span className="ebook-book-source">{book.sample ? '原创样本' : book.author}</span><div className="ebook-book-progress"><div className="ebook-progress"><span style={{ width: `${progress(book)}%` }} /></div><span>{book.lastRead ? `${progress(book)}%` : '未读'}</span></div></button><button className="ebook-book-more ebook-icon-button" aria-label={`管理《${book.title}》`} onClick={() => organize(book)}><MoreHorizontal aria-hidden="true" size={20} /></button></article>)}
        </div>}
        {tab !== 'notes' && !loading && !shelf.length && <p className="ebook-empty">没有符合当前筛选的{tab === 'comics' ? '漫画' : '书籍'}。可清除筛选或导入自己的文件。</p>}
      </section>
      {tab !== 'notes' && <button className="ebook-notes-shortcut" onClick={() => setTab('notes')}><BookOpen aria-hidden="true" size={22} /><strong>笔记与摘录</strong><span>{noteCount}</span><ChevronRight aria-hidden="true" size={19} /></button>}
      <footer className="ebook-library-footer"><span><Folder aria-hidden="true" size={18} />本设备书库</span><button onClick={() => { setError(''); setModal('import'); }}><Upload aria-hidden="true" size={19} />导入 EPUB / TXT / 漫画</button></footer>
    </main>
    {modal && <div className="ebook-library-overlay" onClick={closeModal}><div ref={dialog} role="dialog" aria-modal="true" aria-label={modal === 'import' ? '导入到本设备' : modal === 'filter' ? '筛选与归类' : `管理《${editing?.title}》`} tabIndex={-1} className="ebook-library-dialog" onClick={event => event.stopPropagation()}>
      <header><h2>{modal === 'import' ? '导入到本设备' : modal === 'filter' ? '筛选与归类' : `管理《${editing?.title}》`}</h2><button className="ebook-icon-button" aria-label="关闭面板" disabled={busy} onClick={closeModal}><X aria-hidden="true" size={22} /></button></header>
      {modal === 'import' && <div className="ebook-dialog-content"><p>导入自己的文件，阅读进度和笔记保存在当前浏览器。</p><input ref={textFiles} type="file" accept=".epub,.txt" hidden onChange={event => void importFiles(Array.from(event.target.files || []), false)} /><input ref={comicFiles} type="file" accept=".cbz,.png,.jpg,.jpeg,.webp" multiple hidden onChange={event => void importFiles(Array.from(event.target.files || []), true)} /><button className="ebook-import-option" disabled={busy} onClick={() => textFiles.current?.click()}><BookOpen aria-hidden="true" /><strong>EPUB / TXT</strong><span>文字书籍 · UTF-8 TXT</span></button><button className="ebook-import-option" disabled={busy} onClick={() => comicFiles.current?.click()}><Upload aria-hidden="true" /><strong>图片序列 / CBZ</strong><span>PNG / JPEG / WebP 图片或一本 CBZ 漫画</span></button>{busy && <p role="status">正在解析并保存，请稍候…</p>}</div>}
      {modal === 'filter' && <div className="ebook-dialog-content"><label htmlFor="ebook-folder-filter">文件夹</label><select id="ebook-folder-filter" value={folder} onChange={event => setFolder(event.target.value)}><option value="all">全部文件夹</option><option value="none">未分类</option>{folders.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><label htmlFor="ebook-tag-filter">标签</label><select id="ebook-tag-filter" value={tag} onChange={event => setTag(event.target.value)}><option value="all">全部标签</option>{tags.map(item => <option key={item} value={item}>{item}</option>)}</select><div className="ebook-inline-create"><label htmlFor="ebook-new-folder">新建文件夹</label><div><input id="ebook-new-folder" value={newFolder} maxLength={40} onChange={event => setNewFolder(event.target.value)} /><button disabled={!newFolder.trim() || folders.some(item => item.name === newFolder.trim())} onClick={addFolder}>添加</button></div><label htmlFor="ebook-new-tag">新建标签</label><div><input id="ebook-new-tag" value={newTag} maxLength={24} onChange={event => setNewTag(event.target.value)} /><button disabled={!newTag.trim().replace(/^#+/, '') || tags.includes(newTag.trim().replace(/^#+/, ''))} onClick={addTag}>添加</button></div></div><p>在书封右上角的菜单中，为书籍设置文件夹、标签和阅读状态。</p><div className="ebook-dialog-actions"><button onClick={() => { setFolder('all'); setTag('all'); setState('all'); setQuery(''); }}>清除筛选</button><button className="ebook-primary" onClick={closeModal}>查看结果</button></div></div>}
      {modal === 'organize' && <div className="ebook-dialog-content"><label htmlFor="ebook-edit-state">阅读状态</label><select id="ebook-edit-state" value={editState} onChange={event => setEditState(event.target.value as ShelfState)}>{states.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><label htmlFor="ebook-edit-folder">文件夹</label><select id="ebook-edit-folder" value={editFolder} onChange={event => setEditFolder(event.target.value)}><option value="">未分类</option>{folders.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><fieldset><legend>标签</legend><div className="ebook-edit-tags">{tags.map(item => <label key={item}><input type="checkbox" checked={editTags.includes(item)} onChange={event => setEditTags(event.target.checked ? [...editTags, item] : editTags.filter(value => value !== item))} />{item}</label>)}</div></fieldset><button className="ebook-primary ebook-save-button" disabled={busy} onClick={() => void saveOrganization()}>{busy ? '保存中…' : '保存归类'}</button></div>}
      {error && <p className="ebook-error" role="alert">{error}</p>}
    </div></div>}
  </div>);
};
