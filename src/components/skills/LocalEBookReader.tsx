import React, { useEffect, useRef, useState } from 'react';
import type { Book, Contents, Rendition } from 'epubjs';
import { ArrowLeft, Bookmark, ChevronLeft, ChevronRight, Copy, Download, Heart, Highlighter, List, MessageSquare, MoreHorizontal, Send, Settings, Share2, Sparkles, StickyNote, Users, X } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase';
import './ebook-reader.css';

export type TocItem = { id: string; label: string; href: string; subitems?: TocItem[] };
export type TextRange = { paragraph: number; start: number; end: number };
export type ReadingNote = { id: string; text: string; location: string; chapter: string; date: string; quote?: string; range?: TextRange; kind?: 'highlight' | 'note' };
export type BookFolder = {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
};

export type FriendReadingNote = {
  id: string;
  bookId: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  quote: string;
  location: string;
  paragraphIndex?: number;
  text: string;
  date: string;
  likesCount: number;
  isLiked?: boolean;
  replies?: {
    id: string;
    userName: string;
    userAvatar: string;
    text: string;
    date: string;
  }[];
};

export type LocalBook = {
  id: string; title: string; author: string; format: 'epub' | 'txt' | 'comic'; bytes: ArrayBuffer;
  toc: TocItem[]; paragraphs?: string[]; location: string; progress: number; lastRead: string;
  bookmarks: { location: string; label: string }[]; notes: ReadingNote[];
  folderId?: string;
  tags?: string[];
  cover?: string;
  sample?: boolean;
  comicPages?: { name: string; data: string }[];
  readingState?: 'reading' | 'want' | 'finished';
  comicMode?: 'single' | 'strip';
  comicZoom?: number;
};

export const DEFAULT_BOOK_FOLDERS: BookFolder[] = [
  { id: 'folder-course', name: '高校课程必读', color: '#1877F2', description: '课程培养方案大纲与实验课参考书', createdAt: '2026-09-01' },
  { id: 'folder-research', name: '学术研读与论文', color: '#8B5CF6', description: '前沿研究方向文献与理论专著', createdAt: '2026-09-01' },
  { id: 'folder-hobby', name: '兴趣与通识拓展', color: '#10B981', description: '通识素养、历史人文与周末读物', createdAt: '2026-09-01' },
  { id: 'folder-exam', name: '考研与等级考试', color: '#F59E0B', description: '考纲重点梳理与核心参考资料', createdAt: '2026-09-01' },
];

export const DEFAULT_BOOK_TAGS: string[] = [
  '课程大纲', '期末必读', '计算机系统', '人工智能', '数据结构', '经典名著', '通识拓展', '论文参考', '实验实训'
];

export const DEFAULT_FRIEND_READING_NOTES: Record<string, FriendReadingNote[]> = {
  'stellar-original-moonlight-v1': [
    {
      id: 'fn-moon-1',
      bookId: 'stellar-original-moonlight-v1',
      friendId: 'f-sarah',
      friendName: 'Sarah Chen',
      friendAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      quote: '今晚，先不赶路。',
      location: '0',
      paragraphIndex: 0,
      text: '看到这里心里一震！经常在周五被死线催促，这句话真的很治愈❤️',
      date: '10分钟前',
      likesCount: 12,
      isLiked: false,
      replies: [
        {
          id: 'r-1',
          userName: 'Alex Mercer',
          userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          text: '我也划了这一句！慢下来反而是最快的休息。',
          date: '5分钟前'
        }
      ]
    },
    {
      id: 'fn-moon-2',
      bookId: 'stellar-original-moonlight-v1',
      friendId: 'f-hui',
      friendName: 'Hui Zhang',
      friendAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      quote: '这样的出发很轻，轻到不需要向任何人解释。',
      location: '1',
      paragraphIndex: 1,
      text: '向往这种不被定义的自由时刻，散步是给心灵最好的充电。',
      date: '25分钟前',
      likesCount: 8,
      isLiked: true,
      replies: []
    },
    {
      id: 'fn-moon-3',
      bookId: 'stellar-original-moonlight-v1',
      friendId: 'f-alex',
      friendName: 'Alex Mercer',
      friendAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      quote: '今晚她愿意等。',
      location: '2',
      paragraphIndex: 2,
      text: '愿意停下来等红灯的人，才是真正掌握生活节奏的人。',
      date: '1小时前',
      likesCount: 15,
      isLiked: false,
      replies: []
    },
    {
      id: 'fn-moon-4',
      bookId: 'stellar-original-moonlight-v1',
      friendId: 'f-david',
      friendName: 'David Kim',
      friendAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      quote: '像一条给声音搭的桥。',
      location: '6',
      paragraphIndex: 6,
      text: '绝妙的隐喻，破旧铜丝把无线电和远方的人连在了同一频段。',
      date: '2小时前',
      likesCount: 6,
      isLiked: false,
      replies: []
    }
  ],
  'stellar-original-city-v1': [
    {
      id: 'fn-city-1',
      bookId: 'stellar-original-city-v1',
      friendId: 'f-sarah',
      friendName: 'Sarah Chen',
      friendAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      quote: '城市每天都发生许多这样的配合，安静得像呼吸。',
      location: '0',
      paragraphIndex: 0,
      text: '这种温暖而无声的社会默契，构成了日常生活的毛细血管。',
      date: '15分钟前',
      likesCount: 10,
      isLiked: false,
      replies: []
    },
    {
      id: 'fn-city-2',
      bookId: 'stellar-original-city-v1',
      friendId: 'f-hui',
      friendName: 'Hui Zhang',
      friendAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      quote: '长椅是一种很朴素的公共邀请',
      location: '5',
      paragraphIndex: 5,
      text: '好绝的观察！公共长椅是城市给所有人留下的温柔拥抱。',
      date: '30分钟前',
      likesCount: 14,
      isLiked: true,
      replies: []
    }
  ]
};

function generateDefaultFriendNotesForBook(bookId: string): FriendReadingNote[] {
  return [
    {
      id: `fn-${bookId}-1`,
      bookId,
      friendId: 'f-sarah',
      friendName: 'Sarah Chen',
      friendAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      quote: '第一章',
      location: '0',
      paragraphIndex: 0,
      text: '推荐大家细读这一段！写得很有感染力～',
      date: '10分钟前',
      likesCount: 5,
      isLiked: false,
      replies: []
    },
    {
      id: `fn-${bookId}-2`,
      bookId,
      friendId: 'f-hui',
      friendName: 'Hui Zhang',
      friendAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      quote: '准备',
      location: '1',
      paragraphIndex: 1,
      text: '这句话很有洞察，读完受益匪浅。',
      date: '30分钟前',
      likesCount: 3,
      isLiked: true,
      replies: []
    }
  ];
}

export function getLocalFriendNotes(bookId: string): FriendReadingNote[] {
  try {
    const raw = localStorage.getItem(`stellar-ebook-friend-notes-${bookId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_FRIEND_READING_NOTES[bookId] || generateDefaultFriendNotesForBook(bookId);
}

export function saveLocalFriendNotes(bookId: string, notes: FriendReadingNote[]) {
  try {
    localStorage.setItem(`stellar-ebook-friend-notes-${bookId}`, JSON.stringify(notes));
  } catch {}
}

export function getLocalFolders(): BookFolder[] {
  try {
    const raw = localStorage.getItem('stellar-ebook-folders-v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_BOOK_FOLDERS;
}

export function saveLocalFolders(folders: BookFolder[]) {
  try {
    localStorage.setItem('stellar-ebook-folders-v1', JSON.stringify(folders));
  } catch {}
}

export function getLocalTags(): string[] {
  try {
    const raw = localStorage.getItem('stellar-ebook-tags-v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_BOOK_TAGS;
}

export function saveLocalTags(tags: string[]) {
  try {
    localStorage.setItem('stellar-ebook-tags-v1', JSON.stringify(tags));
  } catch {}
}
const DB_NAME = 'stellar-ebook-library-v1';
export async function bookDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('books', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function listLocalBooks(): Promise<LocalBook[]> {
  const db = await bookDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('books');
    const request = tx.objectStore('books').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}
export async function storeLocalBook(book: LocalBook) {
  const db = await bookDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('books', 'readwrite');
    tx.objectStore('books').put(book);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error('本地保存失败')); };
  });
}
// Read and patch in one transaction so progress writes never discard newer notes.
export async function patchLocalBook(id: string, patch: Partial<LocalBook>) {
  const db = await bookDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('books', 'readwrite');
    const store = tx.objectStore('books');
    const request = store.get(id);
    request.onsuccess = () => { if (request.result) store.put({ ...request.result, ...patch, id }); else tx.abort(); };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = tx.onerror = () => { db.close(); reject(tx.error || new Error('书籍已不可用')); };
  });
}
async function openEpub(bytes: ArrayBuffer) {
  const { default: ePub } = await import('epubjs');
  const book = ePub();
  let timer: ReturnType<typeof setTimeout>;
  try {
    await Promise.race([
      book.open(bytes.slice(0), 'binary'),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('EPUB 解析超时，请检查文件')), 15000); })
    ]);
    return book;
  } catch (error) { book.destroy(); throw error; }
  finally { clearTimeout(timer!); }
}
export async function importLocalBook(file: File): Promise<LocalBook> {
  const format = file.name.split('.').pop()?.toLowerCase();
  if (format !== 'epub' && format !== 'txt') throw new Error('当前支持 EPUB 和 UTF-8 TXT，暂不支持 PDF / MOBI。');
  if (!file.size || file.size > 100 * 1024 * 1024) throw new Error('请选择非空且小于 100 MB 的文件。');
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const id = Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join('');
  const existing = (await listLocalBooks()).find(b => b.id === id);
  if (existing) return existing;
  const item: LocalBook = { id, title: file.name.replace(/\.[^.]+$/, ''), author: '作者未提供', format, bytes,
    toc: [], location: '', progress: 0, lastRead: '', bookmarks: [], notes: [] };
  if (format === 'txt') {
    const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (!content.trim()) throw new Error('TXT 文件没有可阅读的正文。');
    item.paragraphs = content.replace(/\r\n?/g, '\n').split('\n');
    item.toc = [{ id: 'text', label: '正文', href: '0' }];
  } else {
    if (new Uint8Array(bytes)[0] !== 80 || new Uint8Array(bytes)[1] !== 75) throw new Error('EPUB 文件已损坏或不是有效的 EPUB。');
    const book = await openEpub(bytes);
    try {
      const [metadata, navigation] = await Promise.all([book.loaded.metadata, book.loaded.navigation]);
      item.title = metadata.title || item.title;
      item.author = metadata.creator || item.author;
      item.toc = navigation.toc as TocItem[];
      if (!book.spine || !(book.spine as any).length) throw new Error('EPUB 中没有正文。');
    } finally { book.destroy(); }
  }
  await storeLocalBook(item);
  return item;
}
export async function importExampleEpub() {
  const response = await fetch('/stellar-reader-test.epub');
  if (!response.ok) throw new Error('无法载入示例文件');
  return importLocalBook(new File([await response.arrayBuffer()], 'stellar-reader-test.epub', { type: 'application/epub+zip' }));
}
export function downloadReadingNotes(title: string, notes: { text: string; quote?: string; chapter?: string; chapterTitle?: string; date: string }[]) {
  const text = `# ${title}\n\n` + notes.map(n => `## ${n.chapter || n.chapterTitle || '读书笔记'}\n${n.date}\n\n${n.quote ? '> ' + n.quote.replace(/\n/g, '\n> ') + '\n\n' : ''}${n.text || '划线摘录'}`).join('\n\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = `${title.replace(/[\\/:*?"<>|]/g, '-')}-笔记.md`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const readerColors = { day: ['#F7F2E8', '#2D2A26'], night: ['#18202B', '#EEE9DF'] };
const readerFont = '"Noto Serif SC", "Source Han Serif SC", "Songti SC", SimSun, serif';
type Preferences = { fontSize: number; lineHeight: number };
type SelectedText = { text: string; location: string; chapter: string; range?: TextRange };
type ReaderPanel = 'more' | 'toc' | 'settings' | 'notes' | 'bookmarks' | 'ai' | 'share';
const panelLabels: Record<ReaderPanel, string> = { more: '阅读工具', toc: '章节目录', settings: '阅读设置', notes: '笔记与摘录', bookmarks: '我的书签', ai: '解释选段', share: '分享选段' };
function readPreferences(): Preferences {
  try {
    const p = JSON.parse(localStorage.getItem('stellar-ebook-preferences') || '{}');
    return { fontSize: Math.max(14, Math.min(28, Number(p.fontSize) || 18)), lineHeight: Math.max(1.3, Math.min(2.4, Number(p.lineHeight) || 1.8)) };
  } catch { return { fontSize: 18, lineHeight: 1.8 }; }
}
const flattenToc = (items: TocItem[]): TocItem[] => items.flatMap(i => [i, ...flattenToc(i.subitems || [])]);
function textChapter(entry: LocalBook, index: number) {
  return flattenToc(entry.toc).filter(i => Number.isFinite(Number(i.href)) && Number(i.href) <= index).at(-1)?.label || '正文';
}

export function LocalEBookReader({ entry, onBack, isDarkMode = false }: { entry: LocalBook; onBack: () => void | Promise<void>; isDarkMode?: boolean }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [panel, setPanel] = useState<ReaderPanel | null>(null);
  const [record, setRecord] = useState(entry);
  const current = useRef(entry);
  const [ready, setReady] = useState(entry.format === 'txt');
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('本设备保存');
  const [note, setNote] = useState('');
  const [textIndex, setTextIndex] = useState(Math.max(0, Math.min((entry.paragraphs?.length || 1) - 1, Number(entry.location) || 0)));
  const [chapter, setChapter] = useState(entry.format === 'txt' ? textChapter(entry, Number(entry.location) || 0) : '正文');
  const [pageInfo, setPageInfo] = useState({ page: 1, total: 1 });
  const [controlsVisible, setControlsVisible] = useState(true);
  const [selection, setSelection] = useState<SelectedText | null>(null);
  const [noteSource, setNoteSource] = useState<SelectedText | null>(null);
  const [actionStatus, setActionStatus] = useState('');
  const noteAction = useRef(0);
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);

  // Friend Reading Notes States
  const [friendNotes, setFriendNotes] = useState<FriendReadingNote[]>(() => getLocalFriendNotes(entry.id));
  const [selectedFriendNote, setSelectedFriendNote] = useState<FriendReadingNote | null>(null);
  const [showFriendUnderlines, setShowFriendUnderlines] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [notesTab, setNotesTab] = useState<'my' | 'friends'>('my');

  const holder = useRef<HTMLDivElement>(null);
  const textHolder = useRef<HTMLParagraphElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const rendition = useRef<Rendition | null>(null);
  const prefsRef = useRef(preferences);
  const darkRef = useRef(isDarkMode);
  const writes = useRef(Promise.resolve());
  const pendingPatch = useRef<Partial<LocalBook>>({});
  const mounted = useRef(true);
  const appliedHighlights = useRef(new Set<string>());
  const [background, foreground] = readerColors[isDarkMode ? 'night' : 'day'];

  const handleLikeFriendNote = (noteId: string) => {
    setFriendNotes(prev => {
      const next = prev.map(n => {
        if (n.id === noteId) {
          const isLiked = !n.isLiked;
          const likesCount = isLiked ? n.likesCount + 1 : Math.max(0, n.likesCount - 1);
          if (isLiked) soundEffects.playHeartPopTone();
          else soundEffects.playTapSound();
          return { ...n, isLiked, likesCount };
        }
        return n;
      });
      saveLocalFriendNotes(entry.id, next);
      return next;
    });
    if (selectedFriendNote && selectedFriendNote.id === noteId) {
      setSelectedFriendNote(prev => prev ? {
        ...prev,
        isLiked: !prev.isLiked,
        likesCount: !prev.isLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1)
      } : null);
    }
  };

  const handleSendReplyToFriendNote = (noteId: string) => {
    if (!replyText.trim()) return;
    const newReply = {
      id: `reply-${Date.now()}`,
      userName: '我',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      text: replyText.trim(),
      date: '刚刚'
    };
    soundEffects.playSuccessSound();
    setFriendNotes(prev => {
      const next = prev.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            replies: [...(n.replies || []), newReply]
          };
        }
        return n;
      });
      saveLocalFriendNotes(entry.id, next);
      return next;
    });
    if (selectedFriendNote && selectedFriendNote.id === noteId) {
      setSelectedFriendNote(prev => prev ? {
        ...prev,
        replies: [...(prev.replies || []), newReply]
      } : null);
    }
    setReplyText('');
  };

  const persist = (patch: Partial<LocalBook>) => {
    if (patch.progress !== undefined) patch = { ...patch, readingState: patch.progress >= 100 ? 'finished' : 'reading' };
    current.current = { ...current.current, ...patch };
    setRecord(current.current); setSaveStatus('保存中…');
    pendingPatch.current = { ...pendingPatch.current, ...patch };
    writes.current = writes.current.catch(() => {}).then(async () => {
      const saving = pendingPatch.current; pendingPatch.current = {};
      if (!Object.keys(saving).length) return;
      try { await patchLocalBook(entry.id, saving); }
      catch (error) { pendingPatch.current = { ...saving, ...pendingPatch.current }; throw error; }
    });
    const write = writes.current;
    write.then(() => { if (mounted.current && writes.current === write) setSaveStatus('已保存到本设备'); }, e => {
      if (mounted.current) { setError(`保存失败：${e.message}`); setSaveStatus('保存失败'); }
    });
    return write;
  };
  const applyPreferences = () => {
    const r = rendition.current; if (!r) return;
    const p = prefsRef.current; const [bg, fg] = readerColors[darkRef.current ? 'night' : 'day'];
    r.themes.default({
      body: { background: `${bg} !important`, color: `${fg} !important`, 'font-family': `${readerFont} !important`, 'font-size': `${p.fontSize}px !important`, 'line-height': `${p.lineHeight} !important` },
      'p, li, div': { 'font-size': 'inherit !important', 'line-height': 'inherit !important', color: 'inherit !important' },
      'h1, h2, h3': { color: 'inherit !important', 'font-family': 'inherit !important', 'line-height': '1.5 !important' },
      a: { color: `${darkRef.current ? '#B8ACFF' : '#1765D9'} !important` },
      '::selection': { background: darkRef.current ? '#6754AD' : '#BCD8FF' },
      img: { 'max-width': '100% !important' }
    });
  };
  const clearSelection = () => {
    window.getSelection()?.removeAllRanges();
    rendition.current?.getContents().forEach(contents => contents.window.getSelection()?.removeAllRanges());
    setSelection(null);
  };
  const toggleControls = (target: EventTarget | null, hasSelection: boolean) => {
    if (hasSelection || (target as Element | null)?.closest?.('a, button, input, textarea, mark, svg')) return;
    setControlsVisible(visible => !visible);
  };
  useEffect(() => {
    prefsRef.current = preferences; darkRef.current = isDarkMode; applyPreferences();
    try {
      const previous = JSON.parse(localStorage.getItem('stellar-ebook-preferences') || '{}');
      localStorage.setItem('stellar-ebook-preferences', JSON.stringify({ ...previous, ...preferences }));
    } catch { setError('阅读设置未能保存到本设备。'); }
  }, [preferences, isDarkMode]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!entry.id) return;
    const annotationsRef = collection(db, 'books', entry.id, 'annotations');
    const q = query(annotationsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReadingNote));
      setRecord(prev => ({ ...prev, notes }));
    });
    return unsubscribe;
  }, [entry.id]);
  useEffect(() => {
    if (!panel) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusables = () => [...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, textarea, summary, [tabindex="0"]') || [])];
    focusables()[0]?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setPanel(null); event.preventDefault(); }
      if (event.key === 'Tab') {
        const items = focusables(); const first = items[0]; const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { last?.focus(); event.preventDefault(); }
        else if (!event.shiftKey && document.activeElement === last) { first?.focus(); event.preventDefault(); }
      }
    };
    window.addEventListener('keydown', keys);
    return () => { window.removeEventListener('keydown', keys); previous?.focus(); };
  }, [panel]);
  useEffect(() => {
    if (entry.format === 'txt') persist({ lastRead: new Date().toISOString(), readingState: entry.readingState === 'finished' ? 'finished' : 'reading' });
  }, [entry.id]);
  useEffect(() => {
    if (entry.format !== 'epub' || !holder.current) return;
    let disposed = false; let book: Book | undefined; let r: Rendition | undefined; let canSave = false;
    const relocated = (location: any) => {
      if (!canSave || disposed || !location?.start?.cfi) return;
      const start = location.start;
      const found = flattenToc(entry.toc).find(i => i.href.split('#')[0].endsWith((start.href || '').split('#')[0]));
      setChapter(found?.label || '正文');
      setPageInfo({ page: start.displayed?.page || 1, total: start.displayed?.total || 1 });
      const count = (book?.spine as any)?.length || 1;
      const fraction = ((start.displayed?.page || 1) - 1) / Math.max(1, start.displayed?.total || 1);
      persist({ location: start.cfi, progress: location.atEnd ? 100 : Math.min(99, Math.round(((start.index + fraction) / count) * 100)), lastRead: new Date().toISOString() });
    };
    const selected = (cfi: string, contents: Contents) => {
      if (disposed) return;
      const text = contents.window.getSelection()?.toString() || contents.range(cfi).toString();
      if (!text.trim()) return;
      const found = flattenToc(entry.toc).find(i => i.href.split('#')[0].endsWith((r?.location?.start?.href || '').split('#')[0]));
      setSelection({ text, location: cfi, chapter: found?.label || '正文' });
      setActionStatus(''); setControlsVisible(true);
    };
    const clicked = (event: MouseEvent, contents: Contents) => toggleControls(event.target, !!contents.window.getSelection()?.toString());
    (async () => {
      book = await openEpub(entry.bytes); if (disposed) { book.destroy(); return; }
      r = book.renderTo(holder.current!, { width: '100%', height: '100%', flow: 'paginated', spread: 'none', allowScriptedContent: false });
      rendition.current = r; applyPreferences();
      r.on('relocated', relocated); r.on('selected', selected); r.on('click', clicked);
      try { await r.display(entry.location || undefined); }
      catch { if (!entry.location) throw new Error('无法显示 EPUB 正文'); setError('原阅读位置已失效，已回到书籍开头。'); await r.display(); }
      if (disposed) return;
      canSave = true; setReady(true); await r.reportLocation();
    })().catch(e => { if (!disposed) setError(`无法打开 EPUB：${e.message}`); });
    const resize = new ResizeObserver(() => { if (r && holder.current) r.resize(holder.current.clientWidth, holder.current.clientHeight); });
    resize.observe(holder.current);
    return () => {
      disposed = true; resize.disconnect(); r?.off('relocated', relocated); r?.off('selected', selected); r?.off('click', clicked);
      book?.destroy(); rendition.current = null; appliedHighlights.current.clear();
    };
  }, [entry.id]);
  useEffect(() => {
    const r = rendition.current; if (!r || !ready) return;
    appliedHighlights.current.forEach(cfi => r.annotations.remove(cfi, 'highlight'));
    appliedHighlights.current.clear();
    record.notes.forEach(n => {
      if (!n.quote || !n.location.startsWith('epubcfi(') || appliedHighlights.current.has(n.location)) return;
      r.annotations.highlight(n.location, { id: n.id }, () => { setNoteSource(null); setPanel('notes'); }, 'stellar-reader-highlight', { fill: isDarkMode ? '#9985FF' : '#77B5FF', 'fill-opacity': '0.35', 'mix-blend-mode': isDarkMode ? 'screen' : 'multiply' });
      appliedHighlights.current.add(n.location);
    });
  }, [record.notes, ready, isDarkMode]);
  const captureTextSelection = () => {
    const selected = window.getSelection(); const element = textHolder.current;
    if (!selected?.rangeCount || !element) return;
    const range = selected.getRangeAt(0);
    if (range.collapsed || !element.contains(range.startContainer) || !element.contains(range.endContainer)) return;
    const before = range.cloneRange(); before.selectNodeContents(element); before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length; const text = range.toString();
    if (!text.trim()) return;
    setSelection({ text, location: String(textIndex), chapter, range: { paragraph: textIndex, start, end: start + text.length } });
    setActionStatus(''); setControlsVisible(true);
  };
  useEffect(() => {
    if (entry.format !== 'txt') return;
    document.addEventListener('selectionchange', captureTextSelection);
    return () => document.removeEventListener('selectionchange', captureTextSelection);
  }, [entry.id, textIndex, chapter]);
  const go = async (location: string) => {
    if (leavingRef.current) return;
    setError(''); clearSelection();
    if (entry.format === 'epub') {
      try { await rendition.current?.display(location); } catch { setError('无法跳转到该位置。'); }
    } else {
      const index = Math.max(0, Math.min((entry.paragraphs?.length || 1) - 1, Number(location) || 0));
      setTextIndex(index); setChapter(textChapter(entry, index));
      persist({ location: String(index), progress: Math.round(((index + 1) / (entry.paragraphs?.length || 1)) * 100), lastRead: new Date().toISOString() });
    }
    setPanel(null);
  };
  const page = async (direction: number) => {
    if (leavingRef.current) return;
    if (entry.format === 'txt') return go(String(textIndex + direction));
    clearSelection();
    try { await (direction > 0 ? rendition.current?.next() : rendition.current?.prev()); } catch { setError('翻页失败，请重试。'); }
  };
  const bookmark = () => {
    if (leavingRef.current) return;
    const location = entry.format === 'txt' ? String(textIndex) : current.current.location;
    if (!location) return;
    const exists = current.current.bookmarks.some(b => b.location === location);
    persist({ bookmarks: exists ? current.current.bookmarks.filter(b => b.location !== location) : [...current.current.bookmarks, { location, label: `${chapter} · ${current.current.progress}%` }] });
  };
  const addNote = (kind: 'highlight' | 'note', source: SelectedText | null, text = '') => {
    if (leavingRef.current) return;
    const operation = ++noteAction.current;
    const item: ReadingNote = { id: crypto.randomUUID(), text, location: source?.location || (entry.format === 'txt' ? String(textIndex) : current.current.location), chapter: source?.chapter || chapter, date: new Date().toLocaleDateString('zh-CN'), kind, ...(source ? { quote: source.text, range: source.range } : {}) };
    const existing = source && current.current.notes.find(n => n.quote === source.text && n.location === source.location && n.range?.start === source.range?.start && n.range?.end === source.range?.end);
    const write = persist({ notes: existing ? current.current.notes.map(n => n.id === existing.id ? { ...item, id: n.id, text: text || n.text, kind: text || n.text ? 'note' : 'highlight' } : n) : [...current.current.notes, item] });
    clearSelection(); setNote(''); setNoteSource(null); setActionStatus('保存中…');
    write.then(() => { if (mounted.current && noteAction.current === operation) setActionStatus(kind === 'highlight' ? '选段已划线并保存到本设备' : '笔记已保存到本设备'); }, () => { if (mounted.current && noteAction.current === operation) setActionStatus(''); });
  };
  const leave = async () => {
    if (leavingRef.current) return;
    if (saveStatus === '保存失败') persist({});
    leavingRef.current = true; setLeaving(true);
    try {
      let write: Promise<void>;
      do { write = writes.current; await write; } while (writes.current !== write);
      await onBack();
    }
    catch { setError('保存失败，笔记仍在此页。请重试返回，或先导出笔记。'); leavingRef.current = false; setLeaving(false); }
  };
  const shareText = selection ? `「${selection.text}」\n——《${entry.title}》 · ${selection.chapter}` : '';
  const share = async () => {
    try { await navigator.share({ title: entry.title, text: shareText }); setActionStatus('已打开系统分享'); }
    catch (e) { if ((e as Error).name !== 'AbortError') setActionStatus('系统分享不可用，请使用复制选段。'); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareText); setActionStatus('选段已复制'); }
    catch { setActionStatus('复制失败，请在下方文本框中手动复制。'); }
  };
  const tocTree = (items: TocItem[], depth = 0): React.ReactNode => items.map(item => <React.Fragment key={item.id || item.href}>
    <button className="ebook-reader-list-row" style={{ paddingLeft: 12 + depth * 16 }} disabled={leaving} onClick={() => go(item.href)}>{item.label}<ChevronRight size={16} aria-hidden="true"/></button>
    {tocTree(item.subitems || [], depth + 1)}
  </React.Fragment>);
  const text = entry.paragraphs?.[textIndex] || '（空行）';

  const highlightedText = () => {
    const userRanges = record.notes
      .filter(n => n.range?.paragraph === textIndex)
      .map(n => n.range!)
      .sort((a, b) => a.start - b.start);

    const pFriendNotes = showFriendUnderlines
      ? friendNotes.filter(fn => fn.paragraphIndex === textIndex || fn.location === String(textIndex) || text.includes(fn.quote))
      : [];

    if (!userRanges.length && !pFriendNotes.length) {
      return text;
    }

    type Marker =
      | { type: 'user'; start: number; end: number }
      | { type: 'friend'; start: number; end: number; note: FriendReadingNote };

    const markers: Marker[] = [];

    userRanges.forEach(r => {
      const start = Math.max(0, Math.min(text.length, r.start));
      const end = Math.max(start, Math.min(text.length, r.end));
      if (start < end) markers.push({ type: 'user', start, end });
    });

    pFriendNotes.forEach(fn => {
      const idx = text.indexOf(fn.quote);
      if (idx !== -1) {
        markers.push({ type: 'friend', start: idx, end: idx + fn.quote.length, note: fn });
      }
    });

    markers.sort((a, b) => a.start - b.start);

    const chunks: React.ReactNode[] = [];
    let offset = 0;

    markers.forEach((m, i) => {
      if (m.start > offset) {
        chunks.push(text.slice(offset, m.start));
      }
      if (m.start < offset) {
        offset = Math.max(offset, m.end);
        return;
      }

      if (m.type === 'user') {
        chunks.push(
          <mark key={`user-${m.start}-${i}`} title="已保存的个人划线">
            {text.slice(m.start, m.end)}
          </mark>
        );
      } else {
        chunks.push(
          <span key={`fn-wrapper-${m.note.id}-${i}`} className="inline">
            <mark
              className="friend-underline cursor-pointer"
              title={`${m.note.friendName} 划线批注：「${m.note.quote}」`}
              onClick={(e) => {
                e.stopPropagation();
                soundEffects.playTapSound();
                setSelectedFriendNote(m.note);
              }}
            >
              {text.slice(m.start, m.end)}
            </mark>
            <span
              className="friend-avatar-badge-inline group"
              onClick={(e) => {
                e.stopPropagation();
                soundEffects.playTapSound();
                setSelectedFriendNote(m.note);
              }}
              title={`${m.note.friendName} 划线与批注`}
            >
              <img
                src={m.note.friendAvatar}
                alt={m.note.friendName}
                className="w-5 h-5 rounded-full object-cover border-2 border-white dark:border-[#202938] shadow-xs group-hover:scale-110 group-hover:border-[#1877F2] transition-transform inline-block"
              />
              <span className="text-[10px] font-bold text-[#1877F2] dark:text-[#77B5FF] bg-[#1877F2]/10 dark:bg-[#1877F2]/25 px-1.5 py-0.2 rounded-full ml-1 border border-[#1877F2]/20 inline-flex items-center gap-1 group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                <span>{m.note.friendName.split(' ')[0]}</span>
                {m.note.text && <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] animate-pulse" />}
              </span>
            </span>
          </span>
        );
      }
      offset = m.end;
    });

    if (offset < text.length) {
      chunks.push(text.slice(offset));
    }

    return chunks;
  };

  const isBookmarked = record.bookmarks.some(b => b.location === (entry.format === 'txt' ? String(textIndex) : record.location));
  const sampleExplanation = !!entry.sample && !!selection?.text.includes('温柔的坐标');
  return <div className={`ebook-reader ${isDarkMode ? 'ebook-reader-night' : ''}`} style={{ background, color: foreground }} data-theme={isDarkMode ? 'night' : 'day'}>
    <header className="ebook-reader-top">
      <button className="ebook-reader-icon ebook-reader-back" aria-label="返回书架" disabled={leaving} onClick={leave}><ArrowLeft size={22} aria-hidden="true"/></button>
      <div className={`ebook-reader-title ebook-reader-chrome ${controlsVisible ? '' : 'is-hidden'}`}><h1>{entry.title}</h1><span>{entry.sample ? '原创样本 · ' : ''}{chapter}</span></div>
      <div className={`ebook-reader-top-actions ebook-reader-chrome ${controlsVisible ? '' : 'is-hidden'}`}>
        <button
          className={`ebook-reader-icon ${showFriendUnderlines ? 'is-active' : ''}`}
          disabled={leaving}
          title={showFriendUnderlines ? '隐藏好友划线' : '显示好友划线'}
          onClick={() => {
            soundEffects.playTapSound();
            setShowFriendUnderlines(v => !v);
          }}
        >
          <Users size={20} aria-hidden="true"/>
        </button>
        <button className={`ebook-reader-icon ${isBookmarked ? 'is-active' : ''}`} disabled={!ready || leaving} aria-pressed={isBookmarked} aria-label={isBookmarked ? '移除当前书签' : '添加当前书签'} onClick={bookmark}><Bookmark size={21} aria-hidden="true"/></button>
        <button className="ebook-reader-icon" disabled={leaving} aria-label="更多阅读工具" aria-expanded={panel === 'more'} onClick={() => setPanel('more')}><MoreHorizontal size={22} aria-hidden="true"/></button>
      </div>
    </header>
    {error && <p role="alert" className="ebook-reader-error">{error}</p>}
    <main className="ebook-reader-body" aria-label="书籍正文" onClick={e => toggleControls(e.target, !!window.getSelection()?.toString())}>
      {entry.format === 'epub' ? <div ref={holder} className="ebook-reader-epub"/> : <article className="ebook-reader-text" style={{ fontSize: preferences.fontSize, lineHeight: preferences.lineHeight }} onMouseUp={captureTextSelection} onTouchEnd={captureTextSelection} onKeyUp={captureTextSelection}>
        <h2>{chapter === '正文' ? entry.title : chapter}</h2><p ref={textHolder}>{highlightedText()}</p>
      </article>}
      {!ready && !error && <p role="status" className="ebook-reader-loading">正在打开 EPUB…</p>}
    </main>

    {/* Friend Note Interactive Modal Card */}
    {selectedFriendNote && (
      <div className="friend-note-popover select-none" onClick={() => setSelectedFriendNote(null)}>
        <div className="friend-note-card" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB] dark:border-gray-700">
            <div className="flex items-center gap-2.5">
              <img
                src={selectedFriendNote.friendAvatar}
                alt={selectedFriendNote.friendName}
                className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[14px] text-[#050505] dark:text-white">
                    {selectedFriendNote.friendName}
                  </span>
                  <span className="text-[10px] font-semibold text-[#1877F2] bg-[#1877F2]/10 px-2 py-0.5 rounded-md">
                    好友同读划线
                  </span>
                </div>
                <span className="text-[11px] text-[#65676B] dark:text-gray-400">
                  {selectedFriendNote.date}
                </span>
              </div>
            </div>
            <button
              className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-[#65676B] cursor-pointer"
              onClick={() => setSelectedFriendNote(null)}
              aria-label="关闭好友批注"
            >
              <X size={18} />
            </button>
          </div>

          {/* Underlined Excerpt Quote */}
          <div className="my-3 p-3 bg-[#F0F2F5] dark:bg-[#202938] border-l-3 border-[#1877F2] rounded-r-md">
            <small className="text-[11px] font-bold text-[#1877F2] block mb-1">
              划线原文：
            </small>
            <blockquote className="text-[14px] font-serif text-[#050505] dark:text-gray-200 leading-relaxed italic m-0">
              「{selectedFriendNote.quote}」
            </blockquote>
          </div>

          {/* Friend Note Text */}
          {selectedFriendNote.text && (
            <div className="mb-4">
              <small className="text-[11px] font-bold text-[#65676B] dark:text-gray-400 block mb-1">
                好友批注与感悟：
              </small>
              <p className="text-[14px] text-[#050505] dark:text-gray-100 leading-relaxed m-0 font-normal">
                {selectedFriendNote.text}
              </p>
            </div>
          )}

          {/* Interactive Actions */}
          <div className="flex items-center justify-between py-2 border-t border-b border-[#E4E6EB] dark:border-gray-700 my-3">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer ${
                selectedFriendNote.isLiked
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30 font-bold'
                  : 'text-[#65676B] hover:bg-[#F0F2F5] dark:hover:bg-gray-800'
              }`}
              onClick={() => handleLikeFriendNote(selectedFriendNote.id)}
            >
              <Heart size={16} className={selectedFriendNote.isLiked ? 'fill-rose-500' : ''} />
              <span>{selectedFriendNote.isLiked ? '已点赞' : '点赞'} ({selectedFriendNote.likesCount})</span>
            </button>

            <div className="flex items-center gap-1 text-[12px] text-[#65676B]">
              <MessageSquare size={15} />
              <span>{selectedFriendNote.replies?.length || 0} 条互动回复</span>
            </div>
          </div>

          {/* Replies Thread */}
          {selectedFriendNote.replies && selectedFriendNote.replies.length > 0 && (
            <div className="space-y-2.5 mb-3 max-h-40 overflow-y-auto pr-1">
              {selectedFriendNote.replies.map(reply => (
                <div key={reply.id} className="flex gap-2 bg-[#F0F2F5]/60 dark:bg-[#202938] p-2.5 rounded-md text-[12.5px]">
                  <img src={reply.userAvatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[#050505] dark:text-white">{reply.userName}</span>
                      <span className="text-[10px] text-[#65676B]">{reply.date}</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 m-0 leading-normal">{reply.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply Input Box */}
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSendReplyToFriendNote(selectedFriendNote.id);
              }}
              placeholder={`回复 ${selectedFriendNote.friendName} 的想法...`}
              className="flex-1 px-3 py-2 text-[13px] border border-[#E4E6EB] dark:border-gray-700 rounded-md bg-white dark:bg-[#202938] text-[#050505] dark:text-white focus:border-[#1877F2] outline-none"
            />
            <button
              disabled={!replyText.trim()}
              onClick={() => handleSendReplyToFriendNote(selectedFriendNote.id)}
              className="px-3.5 py-2 bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-40 text-white font-bold text-[13px] rounded-md flex items-center gap-1 cursor-pointer transition-colors shrink-0"
            >
              <Send size={14} />
              <span>发送</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {selection && !panel && <div className="ebook-reader-selection" role="toolbar" aria-label="选段操作">
      <button disabled={leaving} onClick={() => addNote('highlight', selection)}><Highlighter size={20} aria-hidden="true"/><span>划线</span></button>
      <button disabled={leaving} onClick={() => { setNoteSource(selection); setNote(''); setPanel('notes'); }}><StickyNote size={20} aria-hidden="true"/><span>笔记</span></button>
      <button disabled={leaving} className="ebook-reader-ai-action" onClick={() => setPanel('ai')}><Sparkles size={21} aria-hidden="true"/><span>问 AI</span></button>
      <button disabled={leaving} onClick={() => { setActionStatus(''); setPanel('share'); }}><Share2 size={20} aria-hidden="true"/><span>分享</span></button>
      <button className="ebook-reader-selection-close" aria-label="取消选段" onClick={clearSelection}><X size={17} aria-hidden="true"/></button>
    </div>}
    <footer className={`ebook-reader-bottom ebook-reader-chrome ${controlsVisible ? '' : 'is-hidden'}`}>
      <div className="ebook-reader-progress"><span style={{ width: `${record.progress}%` }}/></div>
      <div className="ebook-reader-pagination">
        <button className="ebook-reader-icon" disabled={!ready || leaving || (entry.format === 'txt' && textIndex === 0)} aria-label="上一页" onClick={() => page(-1)}><ChevronLeft size={19} aria-hidden="true"/></button>
        <div><span>{entry.format === 'txt' ? `${textIndex + 1} / ${entry.paragraphs?.length || 1} 段` : `${pageInfo.page} / ${pageInfo.total} 页 · 本章`}</span><small>{record.progress}%{entry.format === 'epub' ? ' · 按章节估算' : ''}</small></div>
        <button className="ebook-reader-icon" disabled={!ready || leaving || (entry.format === 'txt' && textIndex >= (entry.paragraphs?.length || 1) - 1)} aria-label="下一页" onClick={() => page(1)}><ChevronRight size={19} aria-hidden="true"/></button>
      </div>
      <p role="status" className="ebook-reader-save">{saveStatus}</p>
    </footer>
    {actionStatus && !panel && <p className="ebook-reader-toast" role="status">{actionStatus}</p>}
    {panel && <div className="ebook-reader-scrim" onClick={() => setPanel(null)}>
      <section ref={dialog} role="dialog" aria-modal="true" aria-label={panelLabels[panel]} className={`ebook-reader-sheet ${panel === 'ai' ? 'ebook-reader-ai-sheet' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="ebook-reader-sheet-handle"/>
        <header><h2>{panel === 'ai' && <Sparkles size={22} aria-hidden="true"/>}{panelLabels[panel]}</h2><button className="ebook-reader-icon" aria-label="关闭面板" onClick={() => setPanel(null)}><X size={21} aria-hidden="true"/></button></header>
        {panel === 'more' && <div className="ebook-reader-tools">{([
          ['toc', List, '章节目录', entry.toc.length], ['bookmarks', Bookmark, '我的书签', record.bookmarks.length], ['notes', StickyNote, '笔记与摘录', record.notes.length + friendNotes.length], ['settings', Settings, '阅读设置', '']
        ] as const).map(([key, Icon, label, count]) => <button key={key} className="ebook-reader-list-row" aria-label={label} onClick={() => { if (key === 'notes') setNoteSource(null); setPanel(key); }}><span><Icon size={21} aria-hidden="true"/>{label}</span><span>{count}<ChevronRight size={17} aria-hidden="true"/></span></button>)}</div>}
        {panel === 'toc' && (entry.toc.length ? tocTree(entry.toc) : <p className="ebook-reader-muted">此书未提供目录，请使用翻页。</p>)}
        {panel === 'settings' && <div className="ebook-reader-settings">
          <label>字号 <span>{preferences.fontSize}px</span><input aria-label="字号" type="range" min="14" max="28" value={preferences.fontSize} onChange={e => setPreferences(p => ({ ...p, fontSize: Number(e.target.value) }))}/></label>
          <label>行距 <span>{preferences.lineHeight.toFixed(1)}</span><input aria-label="行距" type="range" min="1.3" max="2.4" step="0.1" value={preferences.lineHeight} onChange={e => setPreferences(p => ({ ...p, lineHeight: Number(e.target.value) }))}/></label>
          <p className="ebook-reader-muted">{isDarkMode ? '黑夜 · 深空纸页' : '白昼 · 暖色纸页'}，跟随星阅主题。文件、位置与笔记保存在此浏览器。</p>
          <details><summary>开源说明</summary><p>阅读引擎：EPUB.js © 2013 FuturePress。书架功能参考 Koodo Reader；此模块不是完整 Koodo 应用。</p><pre>{EPUB_LICENSE}</pre></details>
        </div>}
        {panel === 'bookmarks' && <div>{record.bookmarks.length === 0 && <p className="ebook-reader-muted">还没有书签。点击顶部书签图标收藏当前位置。</p>}{record.bookmarks.map(b => <button key={b.location} className="ebook-reader-list-row" disabled={leaving} onClick={() => go(b.location)}>{b.label}<ChevronRight size={16} aria-hidden="true"/></button>)}</div>}
        {panel === 'notes' && <div className="ebook-reader-notes">
          <div className="flex border-b border-[#E4E6EB] dark:border-gray-700 mb-3">
            <button
              className={`flex-1 py-2 text-[13px] font-bold border-b-2 cursor-pointer transition-colors ${
                notesTab === 'my' ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent text-[#65676B] hover:text-[#050505]'
              }`}
              onClick={() => setNotesTab('my')}
            >
              我的笔记 ({record.notes.length})
            </button>
            <button
              className={`flex-1 py-2 text-[13px] font-bold border-b-2 cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                notesTab === 'friends' ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent text-[#65676B] hover:text-[#050505]'
              }`}
              onClick={() => setNotesTab('friends')}
            >
              <Users size={15} />
              <span>好友划线 & 标注 ({friendNotes.length})</span>
            </button>
          </div>

          {notesTab === 'my' ? (
            <>
              <p className="ebook-reader-muted">{noteSource ? '笔记关联所选原文，保存后保留划线。' : '记录当前位置的想法；点击摘录可定位正文。'}</p>
              {noteSource && <blockquote>{noteSource.text}</blockquote>}
              <textarea aria-label="笔记内容" disabled={leaving} value={note} onChange={e => setNote(e.target.value)} placeholder="记录阅读想法…"/>
              <div className="ebook-reader-note-actions">
                <button className="ebook-reader-button ebook-reader-primary" disabled={!note.trim() || !ready || leaving} onClick={() => addNote('note', noteSource, note.trim())}>保存笔记</button>
                <button className="ebook-reader-button" onClick={() => downloadReadingNotes(entry.title, record.notes)}><Download size={17} aria-hidden="true"/>导出 Markdown</button>
              </div>
              {record.notes.map(n => <button key={n.id} className="ebook-reader-note" disabled={leaving} onClick={() => go(n.location)}><small>{n.chapter} · {n.date} · {n.text ? '笔记' : '划线'}</small>{n.quote && <blockquote>{n.quote}</blockquote>}{n.text && <p>{n.text}</p>}</button>)}
              {!record.notes.length && <p className="ebook-reader-muted">长按正文选择文字，保存第一条摘录。</p>}
            </>
          ) : (
            <div className="space-y-3">
              {friendNotes.map(fn => (
                <button
                  key={fn.id}
                  className="ebook-reader-note w-full text-left transition-all hover:border-[#1877F2] cursor-pointer relative"
                  onClick={() => {
                    if (entry.format === 'txt' && fn.paragraphIndex !== undefined) {
                      go(String(fn.paragraphIndex));
                    }
                    setSelectedFriendNote(fn);
                    setPanel(null);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img src={fn.friendAvatar} alt="" className="w-6 h-6 rounded-full object-cover border" />
                      <span className="font-bold text-[13px] text-[#050505] dark:text-white">{fn.friendName}</span>
                    </div>
                    <span className="text-[11px] text-[#65676B]">{fn.date}</span>
                  </div>
                  <blockquote>「{fn.quote}」</blockquote>
                  {fn.text && <p className="mt-1 text-[13px] text-[#050505] dark:text-gray-100 font-normal">{fn.text}</p>}
                  <div className="flex items-center gap-4 mt-2.5 text-[11px] text-[#65676B]">
                    <span className="flex items-center gap-1"><Heart size={12} className={fn.isLiked ? 'fill-rose-500 text-rose-500' : ''} /> {fn.likesCount} 点赞</span>
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {fn.replies?.length || 0} 条回复</span>
                  </div>
                </button>
              ))}
              {!friendNotes.length && <p className="ebook-reader-muted">暂无好友划线，快邀请好友一起阅读吧！</p>}
            </div>
          )}
        </div>}
        {panel === 'ai' && selection && <div className="ebook-reader-explanation">
          <blockquote>{selection.text}</blockquote>
          <p className="ebook-reader-source">来源：《{entry.title}》 · {selection.chapter} · 所选原文</p>
          <strong>{sampleExplanation ? '原创样本 · 解释演示' : 'AI 服务未配置'}</strong>
          <p>{sampleExplanation ? '这里把河岸灯光比作“坐标”，让归途有了方向，也传达出安心与陪伴。这是原创样本预置的演示说明。' : '当前阅读器尚未连接 AI 服务。选段已保留，你可以先划线、写笔记或复制原文。'}</p>
          <p className="ebook-reader-muted">{sampleExplanation ? '演示说明由本地样本提供，未请求 AI。' : '没有发送原文，也没有生成联网回答。'}</p>
          <button className="ebook-reader-button" onClick={() => { setNoteSource(selection); setPanel('notes'); }}>为选段写笔记</button>
        </div>}
        {panel === 'share' && selection && <div className="ebook-reader-share">
          <blockquote>{selection.text}</blockquote><p className="ebook-reader-source">《{entry.title}》 · {selection.chapter}</p>
          <div className="ebook-reader-note-actions">{typeof navigator.share === 'function' && <button className="ebook-reader-button ebook-reader-primary" onClick={share}><Share2 size={18} aria-hidden="true"/>系统分享</button>}<button className="ebook-reader-button" onClick={copy}><Copy size={18} aria-hidden="true"/>复制选段</button></div>
          {actionStatus && <p role="status">{actionStatus}</p>}
          <details><summary>手动复制原文</summary><textarea aria-label="分享原文" readOnly value={shareText}/></details>
        </div>}
      </section>
    </div>}
  </div>;
}
const EPUB_LICENSE = `Copyright (c) 2013, FuturePress

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met: 

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer. 
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution. 

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies, 
either expressed or implied, of the FreeBSD Project.
`;

