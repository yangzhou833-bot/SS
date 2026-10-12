import { createPortal } from 'react-dom';
import { CanvasVoiceMessage } from './CanvasVoiceMessage';
import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { Undo2, Redo2, RotateCcw, RotateCw, Maximize2, Trash2, Copy, CornerDownLeft, FlipHorizontal, Share2, X, CheckCheck, MapPin, Paperclip, Pencil, MoreHorizontal, CopyPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatMessage, ChatConversation, Friend, ContactCardData, SimulatedMapActivity, LifePlace } from '../../types';
import { BumpSticker } from './BumpSticker';
import { LocationChatCard } from '../LocationChatCard';
import { ActivityChatCard } from '../ActivityChatCard';
import { ContactChatCard } from '../ContactChatCard';
import { LifePlaceChatCard } from '../LifePlaceChatCard';
import { HandwritingReplayModal } from './HandwritingReplayModal';
import { SIMULATED_ACTIVITIES } from '../../data/mockData';

export interface BubbleLayout {
  x: number; y: number; w: number; h: number; z?: number;
  rotation?: number; scale?: number; flipX?: boolean;
  widthVersion?: 2;
}
type Layouts = Record<string, BubbleLayout>;
interface FreeFormChatCanvasProps {
  conversation: ChatConversation;
  messages: ChatMessage[];
  friends?: Friend[];
  onSendMessage?: (text: string) => void;
  onDuplicateMessage?: (msg: ChatMessage) => string | void;
  onDeleteMessage?: (id: string) => void;
  onQuotedReply?: (msg: ChatMessage) => void;
  onShareMessage?: (msg: ChatMessage) => void;
  onAddReaction?: (id: string, emoji: string) => void;
  onEditMessage?: (msg: ChatMessage) => void;
  onShowToast: (msg: string) => void;
  onOpenFriendProfile?: (friendId: string) => void;
  onNavigateToLocation?: (loc: { lat: number; lng: number; name: string }) => void;
  onOpenActivity?: (act: SimulatedMapActivity) => void;
  onOpenContactBrief?: (contact: ContactCardData) => void;
  onOpenLifePlace?: (place: LifePlace) => void;
  onAddFriend?: (contact: ContactCardData) => void;
  onRecallMessage?: (id: string) => void;
}
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
function loadLayouts(key: string): Layouts {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return Object.fromEntries(Object.entries(value).filter(([, item]: [string, any]) => item && ['x', 'y', 'w', 'h'].every(key => Number.isFinite(item[key])))) as Layouts;
  } catch { return {}; }
}
export function getMessageGap(currentMsg: ChatMessage, nextMsg?: ChatMessage): number {
  const isCard = currentMsg.type === 'location' || currentMsg.type === 'activity' || currentMsg.type === 'contact' || currentMsg.type === 'life_place';
  const isPhoto = Boolean(currentMsg.imageUrl);
  const isHandwriting = Boolean(currentMsg.isHandwriting || currentMsg.type === 'handwriting');
  const isSticker = currentMsg.type === 'emoji';

  const nextIsCard = nextMsg ? (nextMsg.type === 'location' || nextMsg.type === 'activity' || nextMsg.type === 'contact' || nextMsg.type === 'life_place') : false;
  const nextIsPhoto = nextMsg ? Boolean(nextMsg.imageUrl) : false;
  const nextIsHandwriting = nextMsg ? Boolean(nextMsg.isHandwriting || nextMsg.type === 'handwriting') : false;

  // Photo / Handwriting frames: generous 24px spacing around frames so borders/shadows/timestamps never collide
  if (isPhoto || nextIsPhoto || isHandwriting || nextIsHandwriting) {
    return 24;
  }
  // Rich cards (Location, Activity, Contact, Life Place): 22px
  if (isCard || nextIsCard) {
    return 22;
  }
  if (isSticker) {
    return 18;
  }
  // Consecutive text bubbles:
  // Same sender: 16px (increased from 10px, +60% comfortable breathing space)
  // Different senders: 20px (clear alternating conversational turns)
  const isCurrentMe = currentMsg.isMe || currentMsg.senderId === 'me';
  const isNextMe = nextMsg ? (nextMsg.isMe || nextMsg.senderId === 'me') : isCurrentMe;
  return isCurrentMe === isNextMe ? 16 : 20;
}

export function estimateMessageHeight(msg: ChatMessage, width: number): number {
  if (msg.povExpiresAt && msg.povExpiresAt <= Date.now()) return 48;
  if (msg.isBurned || msg.isRecalled || msg.type === 'recalled') return 48;
  if (msg.type === 'emoji') return 88;
  if (msg.doodleLayout) return msg.doodleLayout.h;

  const reactionsH = msg.reactions?.length ? 28 : 0;

  if (msg.isHandwriting || msg.type === 'handwriting') {
    return 208 + reactionsH;
  }

  if (msg.imageUrl) {
    // Photo frame:
    // Image height: 180px
    // Frame padding: 4px top + 4px bottom = 8px
    // Frame border: 2.5px top + 2.5px bottom = 5px
    // -> Frame base = 193px
    let captionH = 0;
    if (msg.text && msg.text.trim()) {
      const captionLines = Math.max(1, Math.ceil(msg.text.trim().length / 16));
      captionH = 8 + captionLines * 18;
    }
    const timeH = 18; // time row with font: 9px + margin-top: 4px
    const safetyBuffer = 6;
    return 193 + captionH + timeH + reactionsH + safetyBuffer;
  }

  if (msg.type === 'location') {
    return 128 + reactionsH;
  }
  if (msg.type === 'activity') {
    return 124 + reactionsH;
  }
  if (msg.type === 'contact' || msg.type === 'life_place') {
    return 134 + reactionsH;
  }
  if (msg.type === 'audio') {
    return 66 + reactionsH;
  }
  if (msg.type === 'file') {
    return 70 + reactionsH;
  }

  // Regular text message
  const baseW = clamp((msg.text?.length || 8) * 10 + 34, 116, 220) * (4 / 3);
  const w = Math.min(width - 28, baseW);
  const lines = (msg.text || '').split('\n').reduce((count, line) => {
    const chars = Array.from(line);
    const px = chars.reduce((acc, c) => acc + (/[\x00-\x7F]/.test(c) ? 8 : 15), 0);
    return count + Math.max(1, Math.ceil(px / Math.max(60, w - 24)));
  }, 0);

  return Math.max(56, lines * 20 + 34 + (msg.quotedMessage ? 26 : 0) + reactionsH);
}

export function arrangeMessages(
  messages: ChatMessage[],
  saved: Layouts,
  width: number,
  measuredHeights: Record<string, number> = {}
): Layouts {
  const result: Layouts = {};
  let bottom = 20;

  // Pass 1: Reserve every persisted/dragged footprint before placing new messages
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.doodleLayout && saved[msg.id]) {
      result[msg.id]=saved[msg.id];
      bottom=Math.max(bottom,result[msg.id].y+result[msg.id].h*(result[msg.id].scale||1)+24);
      continue;
    }
    if (saved[msg.id]) {
      const layout = saved[msg.id];
      const isSticker = msg.type === 'emoji';
      const isHandwriting = Boolean(msg.isHandwriting || msg.type === 'handwriting');
      const isCard = msg.type === 'location' || msg.type === 'activity' || msg.type === 'contact' || msg.type === 'life_place' || isHandwriting;
      const isPhoto = Boolean(msg.imageUrl && !isHandwriting);
      const nextMsg = messages[i + 1];
      const gap = getMessageGap(msg, nextMsg);

      const estimatedH = estimateMessageHeight(msg, width);
      const measuredH = measuredHeights[msg.id] || 0;
      const effectiveH = Math.max(layout.h, estimatedH, measuredH);

      if (isCard) {
        const cardW = Math.min(326, width - 28);
        const w = Math.max(layout.w, cardW);
        result[msg.id] = { ...layout, w, h: effectiveH, x: clamp(layout.x, 14, Math.max(14, width - w - 14)), widthVersion: 2 };
      } else if (isPhoto) {
        const photoW = Math.min(268, width - 28);
        const w = Math.max(layout.w, photoW);
        result[msg.id] = { ...layout, w, h: effectiveH, x: clamp(layout.x, 14, Math.max(14, width - w - 14)), widthVersion: 2 };
      } else if (!isSticker && layout.widthVersion !== 2) {
        const w = Math.min(layout.w * 4 / 3, (width - 28) / (layout.scale || 1));
        result[msg.id] = { ...layout, w, h: effectiveH, x: clamp(layout.x, 14, Math.max(14, width - w - 14)), widthVersion: 2 };
      } else {
        result[msg.id] = { ...layout, h: effectiveH };
      }

      const totalFootprint = (result[msg.id]?.y ?? layout.y) + effectiveH * (layout.scale || 1) + gap;
      bottom = Math.max(bottom, totalFootprint);
    }
  }

  // Pass 2: Place unpositioned messages sequentially downwards
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!result[msg.id]) {
      if (msg.doodleLayout) {
        const ink=msg.doodleLayout,ratio=width/ink.canvasWidth;
        result[msg.id]={x:ink.x*ratio,y:ink.y*ratio,w:ink.w*ratio,h:ink.h*ratio,z:10,widthVersion:2};
        bottom=Math.max(bottom,result[msg.id].y+result[msg.id].h+24);
        continue;
      }
      const isSticker = msg.type === 'emoji';
      const isHandwriting = Boolean(msg.isHandwriting || msg.type === 'handwriting');
      const isCard = msg.type === 'location' || msg.type === 'activity' || msg.type === 'contact' || msg.type === 'life_place' || isHandwriting;
      const isPhoto = Boolean(msg.imageUrl && !isHandwriting);
      const nextMsg = messages[i + 1];
      const gap = getMessageGap(msg, nextMsg);

      let w: number;
      if (isSticker) {
        w = 88;
      } else if (isCard) {
        w = Math.min(326, width - 28);
      } else if (isPhoto) {
        w = Math.min(268, width - 28);
      } else {
        const baseW = clamp((msg.text?.length || 8) * 10 + 34, 116, 220) * (4 / 3);
        w = Math.min(width - 28, baseW);
      }

      const estimatedH = estimateMessageHeight(msg, width);
      const measuredH = measuredHeights[msg.id] || 0;
      const h = Math.max(estimatedH, measuredH);

      const isMe = msg.isMe || msg.senderId === 'me';
      result[msg.id] = {
        x: isMe ? Math.max(14, width - w - 14) : 14,
        y: bottom,
        w,
        h,
        scale: 1,
        rotation: 0,
        ...(!isSticker ? { widthVersion: 2 as const } : {})
      };

      bottom += h + gap;
    }
  }

  return result;
}

export const FreeFormChatCanvas: React.FC<FreeFormChatCanvasProps> = ({ conversation, messages, friends, onDuplicateMessage, onDeleteMessage, onRecallMessage, onQuotedReply, onShareMessage, onAddReaction, onEditMessage, onShowToast, onOpenFriendProfile, onNavigateToLocation, onOpenActivity, onOpenContactBrief, onOpenLifePlace, onAddFriend }) => {
  const [now, setNow] = useState(Date.now);
  const currentFriend = useMemo(() => friends?.find(f => f.id === conversation.friendId), [friends, conversation.friendId]);
  useEffect(() => { if (!messages.some(msg => msg.povExpiresAt)) return; const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, [messages]);
  const storageKey = `stellar_chat_layout_${conversation.id}`;
  const [layouts, setLayouts] = useState<Layouts>(() => loadLayouts(storageKey));
  const [width, setWidth] = useState(370);
  const [selected, setSelected] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const photos = messages.filter(msg => msg.imageUrl && !msg.isRecalled && !msg.isBurned && (!msg.povExpiresAt || msg.povExpiresAt > now));
  const previewIndex = photos.findIndex(msg => msg.id === previewId);
  const preview = photos[previewIndex];
  const previewCloseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!previewId) return;
    const previous = document.activeElement as HTMLElement | null;
    previewCloseRef.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setPreviewId(null); };
    window.addEventListener('keydown', close);
    return () => { window.removeEventListener('keydown', close); previous?.focus(); };
  }, [previewId]);
  const [gesture, setGesture] = useState<'drag' | 'scale' | 'rotate' | null>(null);
  const [snap, setSnap] = useState(false);
  const [overTrash, setOverTrash] = useState(false);
  const [replySwipe, setReplySwipe] = useState<{id:string;offset:number} | null>(null);
  const [emojiPulse, setEmojiPulse] = useState<{id:string;emoji:string;key:number} | null>(null);
  const [undo, setUndo] = useState<Layouts[]>([]);
  const [redo, setRedo] = useState<Layouts[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLButtonElement>(null);
  const lastDragEnd = useRef(0);
  const cancelGestureRef = useRef<(() => void) | null>(null);
  const lastTapRef = useRef<{id:string;time:number} | null>(null);
  const lastLikeRef = useRef<{id:string;time:number} | null>(null);
  const [measuredHeights, setMeasuredHeights] = useState<Record<string, number>>({});
  const [replayMessage, setReplayMessage] = useState<ChatMessage | null>(null);

  useLayoutEffect(() => {
    let hasChanges = false;
    const newHeights = { ...measuredHeights };
    messages.forEach(msg => {
      const el = document.getElementById(`msg-bubble-${msg.id}`);
      if (el) {
        const h = Math.ceil(el.offsetHeight);
        if (h > 0 && Math.abs(h - (measuredHeights[msg.id] || 0)) > 2) {
          newHeights[msg.id] = h;
          hasChanges = true;
        }
      }
    });
    if (hasChanges) {
      setMeasuredHeights(newHeights);
    }
  }, [messages, width]);

  const effective: Layouts = useMemo(() => arrangeMessages(messages, layouts, width, measuredHeights), [messages, layouts, width, measuredHeights]);
  const height = Math.max(640, ...Object.values(effective).map((l: BubbleLayout) => l.y + l.h * (l.scale || 1) + 64));
  const selectedMessage = messages.find(msg => msg.id === selected);
  const selectedLayout = selectedMessage ? effective[selectedMessage.id] : undefined;
  const own = (msg: ChatMessage) => msg.isMe || msg.senderId === 'me';
  const lastMessageRef = useRef<string | undefined>(undefined);
  useEffect(() => { if (!emojiPulse) return; const timer = window.setTimeout(() => setEmojiPulse(null), 700); return () => window.clearTimeout(timer); }, [emojiPulse]);
  useEffect(() => setShowMore(false), [selected]);

  useLayoutEffect(() => {
    cancelGestureRef.current?.();
    setLayouts(loadLayouts(storageKey)); setSelected(null); setUndo([]); setRedo([]);
  }, [storageKey]);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => { if (el.clientWidth) setWidth(Math.max(240, el.clientWidth - 24)); };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => { observer.disconnect(); cancelGestureRef.current?.(); };
  }, []);
  useEffect(() => {
    const id = messages.at(-1)?.id;
    if (id && !lastMessageRef.current) scrollRef.current?.scrollTo({top:height,behavior:'instant'});
    else if (id && id !== lastMessageRef.current && own(messages.at(-1)!) && !messages.some(msg=>msg.doodleLayout)) scrollRef.current?.scrollTo({ top: height, behavior: 'smooth' });
    lastMessageRef.current = id;
  }, [messages, height]);
  const save = (next: Layouts) => {
    setLayouts(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { onShowToast('浏览器未允许保存画布位置'); }
  };
  const commit = (next: Layouts, before = effective) => { setUndo(prev => [...prev.slice(-19), before]); setRedo([]); save(next); };
  const undoChange = () => { if (!undo.length) return; setRedo(prev => [...prev, effective]); save(undo.at(-1)!); setUndo(prev => prev.slice(0, -1)); };
  const redoChange = () => { if (!redo.length) return; setUndo(prev => [...prev, effective]); save(redo.at(-1)!); setRedo(prev => prev.slice(0, -1)); };
  const pulseEmoji = (msg: ChatMessage, emoji: string) => setEmojiPulse({id:msg.id,emoji,key:Date.now()});
  const quickLike = (msg: ChatMessage) => {
    const time = Date.now();
    if (lastLikeRef.current?.id === msg.id && time - lastLikeRef.current.time < 350) return;
    lastLikeRef.current = {id:msg.id,time};
    lastTapRef.current = null;
    onAddReaction?.(msg.id, '👍'); pulseEmoji(msg, '👍'); setSelected(null);
  };

  const beginInteraction = (msg: ChatMessage, event: React.PointerEvent) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('a,audio,button')) return;
    if (selected === msg.id && own(msg)) { beginGesture(msg, 'drag', event); return; }
    event.stopPropagation();
    cancelGestureRef.current?.();
    const start = {x:event.clientX,y:event.clientY}, pointerId = event.pointerId;
    const captureTarget = event.currentTarget as HTMLElement;
    const initialScroll = scrollRef.current?.scrollTop || 0;
    let moved = false, longPressed = false;
    const timer = window.setTimeout(() => {
      longPressed = true; setSelected(msg.id); lastDragEnd.current = Date.now();
      if (own(msg)) { cleanup(); beginGesture(msg, 'drag', event, false, captureTarget); }
    }, 450);
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.hypot(dx,dy) > 8) { moved = true; window.clearTimeout(timer); }
      if (!longPressed && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx) * 1.2 && scrollRef.current) scrollRef.current.scrollTop = initialScroll - dy;
      if (dx > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) setReplySwipe({id:msg.id,offset:Math.min(55,dx * .55)});
    };
    const cleanup = () => {
      window.clearTimeout(timer); setReplySwipe(null);
      window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',end); window.removeEventListener('pointercancel',cancel); window.removeEventListener('blur',cancel);
      cancelGestureRef.current = null;
    };
    const end = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      cleanup();
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (moved || longPressed) lastDragEnd.current = Date.now();
      if (!longPressed && dx >= 45 && dx > Math.abs(dy) * 1.2) { onQuotedReply?.(msg); setSelected(null); }
      else if (!moved && !msg.imageUrl) setSelected(msg.id);
    };
    const cancel = () => { cleanup(); lastDragEnd.current = Date.now(); };
    cancelGestureRef.current = cancel;
    window.addEventListener('pointermove',move); window.addEventListener('pointerup',end); window.addEventListener('pointercancel',cancel); window.addEventListener('blur',cancel);
  };

  const beginGesture = (msg: ChatMessage, kind: 'drag' | 'scale' | 'rotate', event: React.PointerEvent, precision = false, captureTarget?: HTMLElement) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('a,audio,button:not([data-transform-handle])')) return;
    event.stopPropagation();
    setSelected(msg.id);
    if (!own(msg)) return;
    event.preventDefault();
    cancelGestureRef.current?.();
    const initial = effective[msg.id];
    const before = effective;
    let latest = initial;
    let moved = false;
    const start = { x: event.clientX, y: event.clientY };
    const surface = scrollRef.current?.getBoundingClientRect();
    const bubbleRect = document.getElementById(`msg-bubble-${msg.id}`)?.getBoundingClientRect();
    const center = bubbleRect?.width ? {x:bubbleRect.left + bubbleRect.width/2, y:bubbleRect.top + bubbleRect.height/2} : { x: (surface?.left || 0) + 12 + initial.x + initial.w / 2, y: (surface?.top || 0) + initial.y + initial.h / 2 - (scrollRef.current?.clientHeight ? scrollRef.current.scrollTop : 0) };
    const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
    const startRadius = Math.max(20, Math.hypot(start.x - center.x, start.y - center.y));
    const pointerId = event.pointerId;
    const target = captureTarget || event.currentTarget as HTMLElement;
    target.setPointerCapture?.(pointerId);
    const isOverTrash = (e: PointerEvent) => {
      const trash = trashRef.current?.getBoundingClientRect();
      return Boolean(trash && e.clientX >= trash.left && e.clientX <= trash.right && e.clientY >= trash.top && e.clientY <= trash.bottom);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.abs(dx) + Math.abs(dy) < 3 && !moved) return;
      moved = true; setGesture(kind);
      if (kind === 'drag') {
        let x = clamp(initial.x + dx, -initial.w / 2 + 24, width - initial.w / 2 - 24);
        const centered = Math.abs(x + initial.w / 2 - width / 2) < 8;
        if (centered) x = (width - initial.w) / 2;
        setSnap(centered);
        latest = { ...initial, x, y: Math.max(8, initial.y + dy) };
        setOverTrash(isOverTrash(e));
      } else if (kind === 'scale') {
        latest = { ...initial, scale: clamp(precision ? (initial.scale || 1) - dy / 120 : (initial.scale || 1) * Math.hypot(e.clientX - center.x, e.clientY - center.y) / startRadius, 0.45, Math.min(2.8, (width - 24) / initial.w)) };
      } else {
        const delta = precision ? -dy : (Math.atan2(e.clientY - center.y, e.clientX - center.x) - startAngle) * 180 / Math.PI;
        latest = { ...initial, rotation: Math.round(((initial.rotation || 0) + delta + 540) % 360 - 180) };
      }
      setLayouts({ ...before, [msg.id]: latest });
    };
    const cleanup = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', cancel); window.removeEventListener('keydown', escape); window.removeEventListener('blur', cancel);
      if (target.hasPointerCapture?.(pointerId)) target.releasePointerCapture(pointerId);
      cancelGestureRef.current = null;
      setGesture(null); setSnap(false); setOverTrash(false);
    };
    const cancel = () => { cleanup(); setLayouts(before); };
    const end = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const deleting = kind === 'drag' && isOverTrash(e);
      cleanup();
      if (moved) lastDragEnd.current = Date.now();
      if (moved && deleting && onDeleteMessage) { onDeleteMessage(msg.id); setSelected(null); setLayouts(before); }
      else if (moved) commit({ ...before, [msg.id]: latest }, before);
    };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel(); };
    cancelGestureRef.current = cancel;
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', cancel);
    window.addEventListener('keydown', escape); window.addEventListener('blur', cancel);
  };

  const duplicateMessage = (msg: ChatMessage) => {
    const id = onDuplicateMessage?.(msg);
    if (!id) return;
    const layout = effective[msg.id];
    commit({ ...effective, [id]: { ...layout, x: clamp(layout.x + 16, -layout.w / 2 + 24, width - layout.w / 2 - 24), y: layout.y + 16, z: (layout.z || 1) + 1 } });
    setSelected(id);
  };
  const precisionKey = (event: React.KeyboardEvent, kind: 'scale' | 'rotate') => {
    if (!selectedMessage || !selectedLayout) return;
    const direction = event.key === 'ArrowUp' || event.key === 'ArrowRight' ? 1 : event.key === 'ArrowDown' || event.key === 'ArrowLeft' ? -1 : 0;
    if (!direction && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault(); event.stopPropagation();
    const min = kind === 'scale' ? .45 : -180, max = kind === 'scale' ? Math.min(2.8, (width - 24) / selectedLayout.w) : 180;
    const value = kind === 'scale' ? selectedLayout.scale || 1 : selectedLayout.rotation || 0;
    const next = event.key === 'Home' ? min : event.key === 'End' ? max : clamp(value + direction * (kind === 'scale' ? .01 : 1) * (event.shiftKey ? 10 : 1), min, max);
    commit({ ...effective, [selectedMessage.id]: { ...selectedLayout, [kind === 'scale' ? 'scale' : 'rotation']: next } });
  };

  const renderContent = (msg: ChatMessage, layout: BubbleLayout) => {
    if (msg.povExpiresAt && msg.povExpiresAt <= now) return <span className="bump-expired">◷ POV 已过期</span>;
    if (msg.isBurned) return <span className="bump-expired">◷ 内容已过期</span>;
    if (msg.isRecalled || msg.type === 'recalled') {
      const recallText = (msg.isMe || own(msg)) ? '你撤回了一条消息' : (msg.text || `${msg.senderName || '对方'}撤回了一条消息`);
      return (
        <span className="bump-recalled-bubble">
          <RotateCcw size={12} className="opacity-70" />
          <span>{recallText}</span>
        </span>
      );
    }
    if (msg.type === 'emoji') return <>{msg.quotedMessage && <small className="bump-quote">↳ {msg.quotedMessage.text}</small>}<BumpSticker emoji={msg.emojiData?.emoji || msg.text || ''} size={Math.min(layout.w, layout.h)} /></>;
    if (msg.doodleLayout) return <img className="canvas-doodle-image" src={msg.imageUrl} alt="涂鸦消息" draggable={false} style={{height:layout.h}}/>;
    if (msg.isHandwriting || msg.type === 'handwriting') {
      return (
        <div className="bump-canvas-handwriting-card bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-zinc-700 rounded-md shadow-2xs overflow-hidden w-full text-left" draggable={false}>
          <div className="px-2.5 py-1.5 bg-[#F0F2F5]/70 dark:bg-zinc-800/70 border-b border-[#E4E6EB] dark:border-zinc-700/80 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs">✍️</span>
              <span className="text-[11px] font-bold text-[#1877F2]">全屏手写内容</span>
            </div>
            {Boolean(msg.handwritingStrokes?.length) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReplayMessage(msg);
                }}
                className="text-[10px] font-bold text-[#1877F2] hover:text-[#166fe5] hover:underline flex items-center space-x-0.5 cursor-pointer"
                title="重新播放书写动画"
              >
                <span>▶️ 笔迹回放</span>
              </button>
            )}
          </div>
          <div className="p-2 bg-white dark:bg-zinc-900 flex items-center justify-center min-h-[110px]">
            <img
              src={msg.imageUrl}
              alt="全屏手写"
              className="max-h-[220px] w-full object-contain rounded-xs"
              draggable={false}
            />
          </div>
        </div>
      );
    }
    if (msg.imageUrl) {
      const themeId = msg.textStyle?.id || (own(msg) ? 'lime' : 'cloud');
      return (
        <div className={`bump-canvas-photo-frame style-${themeId}`} draggable={false}>
          <img
            src={msg.imageUrl}
            alt={msg.text || '照片'}
            className="bump-canvas-photo"
            draggable={false}
          />
          {msg.text && (
            <div className="bump-photo-caption">
              {msg.text}
            </div>
          )}
        </div>
      );
    }
    if (msg.type === 'audio') return <CanvasVoiceMessage url={msg.audioUrl} duration={msg.audioDuration} onError={onShowToast} />;
    if (msg.type === 'file') return <a href={msg.fileData?.url} download={msg.fileData?.name} onClick={e => e.stopPropagation()}><Paperclip size={18} />{msg.fileData?.name || '文件'}<small>{msg.fileData?.size}</small></a>;
    if (msg.type === 'location') {
      const locData = msg.liveLocation || msg.locationData;
      const lat = locData?.lat ?? (own(msg) ? 36.0611 : currentFriend?.lat ?? 36.0611);
      const lng = locData?.lng ?? (own(msg) ? 103.8343 : currentFriend?.lng ?? 103.8343);
      const name = (locData ? ('name' in locData ? locData.name : 'locationName' in locData ? locData.locationName : '') : '') || msg.text || '位置信息';
      return (
        <LocationChatCard
          message={msg}
          senderAvatar={msg.senderAvatar || (own(msg) ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' : conversation.avatar)}
          senderName={msg.senderName || (own(msg) ? '我' : conversation.friendName)}
          friendName={conversation.friendName}
          friendAvatar={conversation.avatar}
          friend={currentFriend}
          isMe={own(msg)}
          onClick={() => {
            if (onNavigateToLocation) {
              onNavigateToLocation({ lat, lng, name });
            } else {
              onShowToast(`📍 正在地图上定位：${name}`);
            }
          }}
        />
      );
    }
    if (msg.type === 'activity') {
      const act = msg.activityData || SIMULATED_ACTIVITIES.find(a => a.id === msg.activityId);
      return (
        <ActivityChatCard
          activityId={msg.activityId || msg.activityData?.id}
          activityData={act || msg.activityData}
          liveActivity={act}
          friends={friends}
          isMe={own(msg)}
          onClick={() => {
            if (act && onOpenActivity) {
              onOpenActivity(act);
            } else if (act && onNavigateToLocation) {
              onNavigateToLocation({ lat: act.lat, lng: act.lng, name: act.title });
            } else {
              onShowToast(`🎯 查看活动：${act?.title || msg.text || '活动'}`);
            }
          }}
        />
      );
    }
    if (msg.type === 'contact') {
      return (
        <ContactChatCard
          message={msg}
          contactData={msg.contactData}
          senderAvatar={msg.senderAvatar || (own(msg) ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' : conversation.avatar)}
          senderName={msg.senderName || (own(msg) ? '我' : conversation.friendName)}
          onOpenProfile={(uid) => {
            if (uid && onOpenFriendProfile) onOpenFriendProfile(uid);
            else if (msg.contactData && onOpenContactBrief) onOpenContactBrief(msg.contactData);
          }}
          onOpenBriefModal={(c) => {
            if (onOpenContactBrief) onOpenContactBrief(c);
            else if (c.userId && onOpenFriendProfile) onOpenFriendProfile(c.userId);
          }}
          onAddFriend={(c) => {
            if (onAddFriend) onAddFriend(c);
            else onShowToast(`已向 ${c.name} 发送好友申请 📩`);
          }}
          onNavigateToLocation={(loc) => {
            if (onNavigateToLocation) onNavigateToLocation(loc);
            else onShowToast(`正在查看 ${loc.name} 📍`);
          }}
          isMe={own(msg)}
        />
      );
    }
    if (msg.type === 'life_place') {
      return (
        <LifePlaceChatCard
          message={msg}
          senderAvatar={msg.senderAvatar || (own(msg) ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' : conversation.avatar)}
          senderName={msg.senderName || (own(msg) ? '我' : conversation.friendName)}
          friendName={conversation.friendName}
          friendAvatar={conversation.avatar}
          friend={currentFriend}
          isMe={own(msg)}
          onClick={() => {
            if (msg.lifePlaceData && onOpenLifePlace) {
              onOpenLifePlace(msg.lifePlaceData);
            } else if (onNavigateToLocation) {
              const loc = msg.locationData || { lat: 36.0611, lng: 103.8343, name: msg.lifePlaceData?.name || '生活坐标' };
              onNavigateToLocation({ lat: loc.lat || 36.0611, lng: loc.lng || 103.8343, name: loc.name || '生活坐标' });
            }
          }}
          showToast={onShowToast}
        />
      );
    }
    return <>{msg.quotedMessage && <small className="bump-quote">↳ {msg.quotedMessage.text}</small>}<span className="bump-canvas-text" style={{ textAlign: msg.textStyle?.alignment || 'center' }}>{msg.text}</span></>;
  };

  return <div className="bump-canvas-shell" onClick={() => { if (Date.now() - lastDragEnd.current > 100) setSelected(null); }}>
    <div ref={scrollRef} className="bump-canvas-scroll" data-testid="free-canvas">
      <div className="bump-canvas-surface" style={{ height, width }}>
        {!messages.length && <div className="bump-canvas-welcome"><span>🌈 ☁️</span><img src={conversation.avatar} alt="" /><h3>嘿，{conversation.friendName}！</h3><p>第一句话，想放在哪里？</p><button onClick={e => { e.stopPropagation(); onOpenFriendProfile?.(conversation.friendId); }}>查看好友</button></div>}
        {snap && <div className="bump-center-guide" style={{ left: width / 2 }} />}
        {messages.map((msg, msgIdx) => {
          const layout = effective[msg.id];
          const isSelected = selected === msg.id;
          const isHandwriting = Boolean(msg.isHandwriting || msg.type === 'handwriting');
          const isCard = msg.type === 'location' || msg.type === 'activity' || msg.type === 'contact' || msg.type === 'life_place' || isHandwriting;
          const isPhoto = Boolean(msg.imageUrl && !isHandwriting);
          const textStyle = !isCard && !isPhoto && (!msg.type || msg.type === 'text' || msg.type === 'audio');
          return <div key={`${msg.id || 'msg'}-${msgIdx}`} data-message-id={msg.id} id={`msg-bubble-${msg.id}`} tabIndex={0} role="group" aria-label={`${own(msg) ? '我的' : '好友的'}消息：${msg.text || msg.type}`}
            onPointerDown={e => beginInteraction(msg, e)} onDoubleClick={e => { e.stopPropagation(); quickLike(msg); }} onContextMenu={e => { e.preventDefault(); e.stopPropagation(); cancelGestureRef.current?.(); setSelected(msg.id); }} onClick={e => {
              e.stopPropagation();
              if (Date.now() - lastDragEnd.current < 150) return;
              const time = Date.now();
              if (lastTapRef.current?.id === msg.id && time - lastTapRef.current.time < 330) { lastTapRef.current = null; quickLike(msg); return; }
              lastTapRef.current = {id:msg.id,time};
              if (isHandwriting && !msg.doodleLayout && !isSelected) { setReplayMessage(msg); setSelected(null); return; }
              if (msg.imageUrl && !msg.doodleLayout && !isSelected && !msg.isRecalled && !msg.isBurned && (!msg.povExpiresAt || msg.povExpiresAt > now)) { setPreviewId(msg.id); setSelected(null); return; }
              if (msg.type === 'emoji') pulseEmoji(msg,msg.emojiData?.emoji || msg.text || '✨');
              setSelected(msg.id);
              const scroll = scrollRef.current;
              if (scroll?.clientHeight && !cancelGestureRef.current) {
                const messageRect = e.currentTarget.getBoundingClientRect();
                const bottom = scroll.getBoundingClientRect().bottom - 150;
                if (messageRect.bottom > bottom) scroll.scrollTop += messageRect.bottom - bottom;
              }
            }}
            onKeyDown={e => {
              if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
                if ((e.target as HTMLElement).closest('input,textarea,[contenteditable]:not([contenteditable="false"])')) return;
                e.preventDefault(); e.stopPropagation();
                if (e.shiftKey) redoChange(); else undoChange();
                return;
              }
              if (e.key === 'Escape') setSelected(null);
              if (e.key === 'Enter' || e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { e.preventDefault(); setSelected(msg.id); }
              if (!own(msg)) return;
              if (e.key === 'Delete' && onDeleteMessage) { e.preventDefault(); onDeleteMessage(msg.id); setSelected(null); return; }
              const step = e.shiftKey ? 10 : 2;
              const delta = ({ ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] } as Record<string, number[]>)[e.key];
              if (delta) { e.preventDefault(); commit({ ...effective, [msg.id]: { ...layout, x: layout.x + delta[0], y: Math.max(8, layout.y + delta[1]) } }); }
            }}
            className={`bump-canvas-message ${isSelected ? 'is-selected' : ''} ${isSelected && own(msg) ? 'can-drag' : ''} ${msg.type === 'emoji' ? 'is-sticker' : ''} ${isCard ? 'is-card-message' : ''} ${msg.doodleLayout ? 'is-doodle-message' : ''} ${isPhoto ? 'is-photo-message' : ''}`}
            style={{ left: layout.x, top: layout.y, width: layout.w, minHeight: layout.h, zIndex: isSelected ? 30 : layout.z || 1,
              opacity: selected && !isSelected ? 0.72 : 1, transform: `translateX(${replySwipe?.id === msg.id ? replySwipe.offset : 0}px) rotate(${layout.rotation || 0}deg) scale(${layout.scale || 1})` }}>
            {replySwipe?.id === msg.id && <span className="bump-canvas-reply-indicator"><CornerDownLeft size={18}/></span>}
            {emojiPulse?.id === msg.id && <span key={emojiPulse.key} className="bump-chat-emoji-pulse" aria-hidden="true">{emojiPulse.emoji}</span>}
            <div className={`bump-message-body ${(msg.isRecalled || msg.type === 'recalled') ? 'bump-recalled-body' : textStyle ? `bump-message-style style-${msg.textStyle?.id || (own(msg) ? 'lime' : 'cloud')}` : isCard ? 'bump-card-bubble' : isPhoto ? 'bump-photo-bubble' : 'bump-rich-message'}`}
              style={{ minHeight: (msg.isRecalled || msg.type === 'recalled') ? 32 : layout.h, transform: layout.flipX ? 'scaleX(-1)' : undefined }}>
              {renderContent(msg, layout)}
              {msg.type !== 'emoji' && !msg.isRecalled && msg.type !== 'recalled' && <small className="bump-message-time" style={isPhoto ? { marginTop: 5, paddingRight: 4, color: '#65676B', fontWeight: 600 } : undefined}>{msg.timestamp} {own(msg) && <CheckCheck size={10} />}</small>}
            </div>
            {!!msg.reactions?.length && !msg.isRecalled && msg.type !== 'recalled' && <div className="bump-attached-reactions">{msg.reactions.map((r, rIdx) => <button key={`${msg.id}-react-${r.emoji}-${rIdx}`} aria-label={r.hasReacted ? `取消 ${r.emoji} 反应` : `回应 ${r.emoji}`} aria-pressed={!!r.hasReacted} onClick={e => { e.stopPropagation(); onAddReaction?.(msg.id, r.emoji); pulseEmoji(msg,r.emoji); }}><BumpSticker emoji={r.emoji} size={24} /><small>{r.count}</small></button>)}</div>}
            {isSelected && own(msg) && !msg.isRecalled && msg.type !== 'recalled' && <>
              <button data-transform-handle aria-label="旋转消息" className="bump-transform-handle bump-rotate-handle" onPointerDown={e => beginGesture(msg, 'rotate', e)} onClick={e => e.stopPropagation()}><RotateCw size={14} /></button>
              <button data-transform-handle aria-label="缩放消息" className="bump-transform-handle bump-scale-handle" onPointerDown={e => beginGesture(msg, 'scale', e)} onClick={e => e.stopPropagation()} onDoubleClick={e => { e.stopPropagation(); commit({ ...effective, [msg.id]: { ...layout, scale: 1, rotation: 0 } }); }}><Maximize2 size={14} /></button>
              {gesture && <span className="bump-transform-readout">{gesture === 'rotate' ? `${layout.rotation || 0}°` : `${Math.round((layout.scale || 1) * 100)}%`}</span>}
            </>}
          </div>;
        })}
      </div>
    </div>
    {selectedMessage && selectedLayout && own(selectedMessage) && gesture !== 'drag' && <div className="bump-canvas-precision" aria-label="消息变换刻度" onClick={e => e.stopPropagation()}>
      {(['scale','rotate'] as const).map(kind => {
        const value = kind === 'scale' ? selectedLayout.scale || 1 : selectedLayout.rotation || 0;
        const min = kind === 'scale' ? .45 : -180, max = kind === 'scale' ? Math.min(2.8, (width - 24) / selectedLayout.w) : 180;
        return <div key={kind} className="bump-precision-control">
          {kind === 'scale' ? <Maximize2 size={16} /> : <RotateCw size={16} />}
          <div role="slider" tabIndex={0} aria-label={kind === 'scale' ? '精细缩放' : '精细旋转'} aria-orientation="vertical" aria-valuemin={min} aria-valuemax={max} aria-valuenow={Number(value.toFixed(2))} aria-valuetext={kind === 'scale' ? `${Math.round(value * 100)}%` : `${Math.round(value)}°`} className="bump-precision-track" onPointerDown={e => beginGesture(selectedMessage,kind,e,true)} onKeyDown={e => precisionKey(e,kind)}>
            <span className="bump-precision-knob" style={{ bottom:`${(value - min) / (max - min) * 100}%` }} />
          </div>
          <output>{kind === 'scale' ? `${Math.round(value * 100)}%` : `${Math.round(value)}°`}</output>
        </div>;
      })}
    </div>}
    {gesture === 'drag' && <button ref={trashRef} aria-label="拖到这里删除消息" className={`bump-canvas-trash ${overTrash ? 'is-over' : ''}`}><Trash2 size={25} /><span>松手删除</span></button>}
    {selectedMessage && !gesture && <div className="bump-canvas-menu" onClick={e => { e.stopPropagation(); lastTapRef.current = null; }}>
      <div className="bump-canvas-primary-actions">
        <button aria-label="复制消息" onClick={async () => { try { await navigator.clipboard.writeText(selectedMessage.text || selectedMessage.emojiData?.emoji || ''); onShowToast('已复制'); } catch { onShowToast('浏览器未允许访问剪贴板'); } }}><Copy size={18} />复制</button>
        {own(selectedMessage) && onRecallMessage && !selectedMessage.isRecalled && selectedMessage.type !== 'recalled' && (
          <button aria-label="撤回消息" title="撤回消息" onClick={() => { onRecallMessage(selectedMessage.id); setSelected(null); }}>
            <RotateCcw size={18} />撤回消息
          </button>
        )}
        {onDuplicateMessage && <button aria-label="重复消息" onClick={() => duplicateMessage(selectedMessage)}><CopyPlus size={18} />重复</button>}
        {own(selectedMessage) && <button aria-label="翻转消息" onClick={() => commit({ ...effective, [selectedMessage.id]: { ...effective[selectedMessage.id], flipX: !effective[selectedMessage.id].flipX } })}><FlipHorizontal size={18} />翻转</button>}
        {selectedMessage.imageUrl && <button aria-label="查看大图" onClick={() => setPreviewId(selectedMessage.id)}><Maximize2 size={18} />查看</button>}
        <button aria-label="更多消息操作" aria-expanded={showMore} onClick={() => setShowMore(value => !value)}><MoreHorizontal size={18} /><span>更多</span></button>
        <button aria-label="关闭消息操作" className="bump-canvas-close-actions" onClick={() => setSelected(null)}><X size={16} /></button>
      </div>
      <div className="bump-reaction-picker">{['👍','❤️','😂','🎉','🔥','😮'].map((emoji, idx) => <button key={`msg-react-opt-${emoji}-${idx}`} aria-label={`回应 ${emoji}`} onClick={() => { onAddReaction?.(selectedMessage.id, emoji); pulseEmoji(selectedMessage,emoji); setSelected(null); }}><BumpSticker emoji={emoji} size={36} /></button>)}</div>
      {showMore && <>
        <div className="bump-message-actions">
          <button onClick={() => { onQuotedReply?.(selectedMessage); setSelected(null); }}><CornerDownLeft size={16} />回复</button>
          {own(selectedMessage) && onRecallMessage && !selectedMessage.isRecalled && selectedMessage.type !== 'recalled' && (
            <button aria-label="撤回消息" title="撤回消息" onClick={() => { onRecallMessage(selectedMessage.id); setSelected(null); }}>
              <RotateCcw size={16}/>撤回消息
            </button>
          )}
          {own(selectedMessage) && (!selectedMessage.type || selectedMessage.type === 'text') && onEditMessage && <button aria-label="编辑消息" onClick={() => { onEditMessage(selectedMessage); setSelected(null); }}><Pencil size={16}/>编辑</button>}
          {own(selectedMessage) && onDeleteMessage && <button aria-label="删除消息" onClick={() => { onDeleteMessage(selectedMessage.id); setSelected(null); }}><Trash2 size={16}/>删除</button>}
          {onShareMessage && <button onClick={() => { onShareMessage(selectedMessage); setSelected(null); }}><Share2 size={16} />分享</button>}
        </div>
      </>}
    </div>}
    {preview && createPortal(<div className="canvas-photo-viewer" role="dialog" aria-modal="true" aria-label="聊天图片预览" onClick={e => e.stopPropagation()} onKeyDown={e => {
      if (e.key === 'ArrowLeft' && previewIndex > 0) setPreviewId(photos[previewIndex-1].id);
      if (e.key === 'ArrowRight' && previewIndex < photos.length-1) setPreviewId(photos[previewIndex+1].id);
      if (e.key === 'Tab') { const buttons = [...(e.currentTarget as HTMLDivElement).querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]; const index = buttons.indexOf(document.activeElement as HTMLButtonElement); if (e.shiftKey && index === 0 || !e.shiftKey && index === buttons.length-1) { e.preventDefault(); buttons[e.shiftKey ? buttons.length-1 : 0]?.focus(); } }
    }}>
      <header><span>{previewIndex + 1} / {photos.length}</span><button ref={previewCloseRef} aria-label="关闭图片预览" onClick={() => setPreviewId(null)}><X size={22}/></button></header>
      <img src={preview.imageUrl} alt={preview.text || '聊天图片'} />
      <footer><button aria-label="上一张图片" disabled={previewIndex === 0} onClick={() => setPreviewId(photos[previewIndex-1].id)}><ChevronLeft size={24}/></button><span>{preview.timestamp}</span><button aria-label="下一张图片" disabled={previewIndex === photos.length-1} onClick={() => setPreviewId(photos[previewIndex+1].id)}><ChevronRight size={24}/></button></footer>
      <div className="bump-reaction-picker">{['❤️','👍','😂','🔥','🎉'].map((emoji, idx) => <button key={`preview-react-opt-${emoji}-${idx}`} aria-label={`图片回应 ${emoji}`} onClick={() => { onAddReaction?.(preview.id,emoji); setPreviewId(null); pulseEmoji(preview,emoji); }}><BumpSticker emoji={emoji} size={40}/></button>)}</div>
    </div>,document.getElementById('stellar-phone-content') || document.body)}
    {replayMessage && (
      <HandwritingReplayModal
        isOpen={Boolean(replayMessage)}
        onClose={() => setReplayMessage(null)}
        strokes={replayMessage.handwritingStrokes}
        imageUrl={replayMessage.imageUrl}
        senderName={replayMessage.senderName || (own(replayMessage) ? '我' : conversation.friendName)}
      />
    )}
  </div>;
};
