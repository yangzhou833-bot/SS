import React, { useEffect, useRef, useState } from 'react';
import { X, LockKeyhole, Footprints, DoorOpen, User, Hand, Camera, Plus, Send } from 'lucide-react';
import { Friend } from '../types';
import { BUMP_STICKERS, STELLAR_STICKERS, BumpSticker } from './chat/BumpSticker';
import { MessageAppearance, useMessageAppearance } from './chat/messageStyles';
import { MessageStylePicker } from './chat/MessageStylePicker';
import { StickerCharge, StickerChargeEffect } from './chat/StickerChargeEffect';
import { USER_LOCATION } from '../data/mockData';
import { friendDistanceKm, southPointerRotation } from '../utils/friendCompass';

type Sticker = typeof BUMP_STICKERS[number] | typeof STELLAR_STICKERS[number];
export type IntercomStatus = 'idle' | 'requesting' | 'recording' | 'preview' | 'error';
type DockRelationship = 'normal' | 'close' | 'family' | 'muted' | 'hidden';
interface Props {
  friend: Friend; friendCount: number;
  userLocation?: {lat:number;lng:number};
  onLaunch: (emoji: string, clientX: number, clientY: number) => void;
  onOpenChat: () => void; onCamera: () => void; onTrajectory: () => void;
  onOpenCanvasChat?: (appearance:MessageAppearance) => void;
  onNavigate?: () => void; onAddFriend?: () => void; onGhost?: () => void; onProfile?: () => void;
  onClose?: () => void; onKnock?: () => void; onGreet?: () => void; onBump?: () => void;
  relationship?: DockRelationship; onRelationshipChange?: (relationship: DockRelationship) => void;
  onIntercom?: () => void; intercomStatus?: string; intercomSeconds?: number; voicePreviewUrl?: string | null; intercomError?: string;
  onSendText?: (text: string) => void; onShowToast: (text: string) => void;
}
export function BumpFriendDock({ friend, friendCount, userLocation = USER_LOCATION, onLaunch, onOpenChat, onOpenCanvasChat, onCamera, onTrajectory, onNavigate, onAddFriend, onProfile, onClose, onKnock, onGreet, onBump, relationship = 'normal', onRelationshipChange, onShowToast }: Props) {
  const [savedAppearance, setAppearance] = useMessageAppearance();
  let appearance: MessageAppearance = savedAppearance;
  try { if (!localStorage.getItem('stellar_message_appearance')) appearance = { id: 'stellar', alignment: 'left' }; } catch {}
  const [picker, setPicker] = useState(false);
  const [charge,setCharge] = useState<StickerCharge|null>(null);
  const [knock,setKnock] = useState(0);
  const dockRef = useRef<HTMLDivElement>(null);
  const knockTimer = useRef<number|undefined>(undefined);
  const [locked, setLocked] = useState<Sticker | null>(null);
  const [addingSticker, setAddingSticker] = useState(false);
  const [extraIds, setExtraIds] = useState<string[]>(() => { try { const value = JSON.parse(localStorage.getItem('stellar_map_stickers_v2') || '[]'); return Array.isArray(value) ? value.filter(id => STELLAR_STICKERS.some(s => s.id === id)) : []; } catch { return []; } });
  const [heading, setHeading] = useState(0);
  const suppressClick = useRef(false);
  const stopRef = useRef<(() => void) | null>(null);
  const sleeping = friend.activityState === 'sleeping';
  useEffect(() => { setPicker(false); setLocked(null); setAddingSticker(false); setCharge(null); setKnock(0); return () => {stopRef.current?.();window.clearTimeout(knockTimer.current);}; }, [friend.id]);
  useEffect(() => {
    const update = (event: DeviceOrientationEvent) => {
      const compass = (event as DeviceOrientationEvent & {webkitCompassHeading?:number}).webkitCompassHeading;
      if (Number.isFinite(compass)) setHeading(compass!);
      else if (event.absolute && event.alpha !== null) setHeading(360 - event.alpha);
    };
    window.addEventListener('deviceorientation', update);
    window.addEventListener('deviceorientationabsolute', update as EventListener);
    return () => {window.removeEventListener('deviceorientation', update);window.removeEventListener('deviceorientationabsolute', update as EventListener);};
  }, []);
  const distance = friendDistanceKm(userLocation, friend);
  const unlockCount = (item: Sticker) => 'friends' in item ? item.friends : 0;
  const openCanvas = () => onOpenCanvasChat ? onOpenCanvasChat(appearance) : onOpenChat();
  const knockNow = () => {window.clearTimeout(knockTimer.current);setKnock(previous=>previous+1);knockTimer.current=window.setTimeout(()=>setKnock(0),900);onKnock?.();};
  const press = (item: Sticker, e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    stopRef.current?.();
    suppressClick.current = false;
    const isLocked = friendCount < unlockCount(item);
    const source = e.currentTarget.getBoundingClientRect();
    const x = source.left + source.width / 2, y = source.top + 42;
    suppressClick.current = false;
    const pointerId = e.pointerId;
    let timer: number | undefined, chargeTimer:number|undefined;
    const delay = window.setTimeout(() => {
      if (isLocked) return;
      suppressClick.current = true;
      const started = Date.now();
      setCharge({...item,progress:0,phase:'charging'});onLaunch(item.emoji,x,y);
      timer = window.setInterval(() => onLaunch(item.emoji,x,y),140);
      chargeTimer = window.setInterval(() => {
        const elapsed=Date.now()-started;
        if (elapsed>=3520) {window.clearInterval(chargeTimer);setCharge(null);return;}
        setCharge({...item,progress:Math.min(1,elapsed/2400),phase:elapsed<2400?'charging':elapsed<2720?'full':'burst'});
      },50);
    }, 320);
    const move = (event:PointerEvent) => { if (event.pointerId === pointerId && Math.hypot(event.clientX-e.clientX,event.clientY-e.clientY)>10) stop(true); };
    const stop = (cancelled=false) => {
      if (cancelled) suppressClick.current=true;
      window.clearTimeout(delay); window.clearInterval(timer);window.clearInterval(chargeTimer);setCharge(null);
      window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', cancel); window.removeEventListener('blur', blur);
      window.removeEventListener('pointermove', move);
      stopRef.current = null;
    };
    const end = (event: PointerEvent) => { if (event.pointerId === pointerId) stop(); };
    const cancel = (event:PointerEvent) => {if(event.pointerId===pointerId)stop(true);};
    const blur = () => stop(true);
    stopRef.current = stop;
    window.addEventListener('pointerup', end); window.addEventListener('pointercancel', cancel); window.addEventListener('blur', blur);
    window.addEventListener('pointermove', move);
  };
  const ordered: Sticker[] = [...BUMP_STICKERS, ...STELLAR_STICKERS.filter(item => extraIds.includes(item.id))];
  const addSticker = (item:typeof STELLAR_STICKERS[number]) => { const next = [...new Set([...extraIds,item.id])]; setExtraIds(next); try { localStorage.setItem('stellar_map_stickers_v2',JSON.stringify(next)); } catch {} onShowToast(`已添加 ${item.label}`); };
  return <>
    <div className="bump-friend-header">
      <h2>{friend.locationName?.split(/[·,，]/)[0] || '附近'}</h2>
      <div className="bump-friend-kicker"><span>{sleeping ? '休息中' : friend.isOnline === false ? '最近更新' : '好友此刻'} · {friend.lastUpdated || '刚刚'}</span>
        {onRelationshipChange && <select aria-label="好友关系" value={relationship} onChange={e => onRelationshipChange(e.target.value as DockRelationship)}><option value="normal">普通好友</option><option value="close">密友</option><option value="family">家人</option><option value="muted">静音</option><option value="hidden">隐藏</option></select>}
      </div>
      <button className="bump-dock-close" aria-label="关闭好友互动" onClick={onClose}><X size={22}/></button>
    </div>
    <div ref={dockRef} className="bump-friend-dock is-floating" role="region" aria-label="好友互动卡片">
      <button className="floating-friend-compass" aria-label={`导航至好友，相距 ${distance === null ? '待更新' : distance.toFixed(2)+' km'}，指针指向南方`} title="选择前往好友的导航路线" onClick={onNavigate || (()=>onShowToast('导航暂时不可用'))}>
        <span className="floating-compass-dial">
          <svg className="floating-compass-ticks" viewBox="0 0 100 100" aria-hidden="true">{Array.from({length:12},(_,i)=><line key={i} x1="50" y1="7" x2="50" y2={i%3===0 ? '15' : '12'} transform={`rotate(${i*30} 50 50)`} stroke={i%3===0 ? '#151719' : '#bfc0c1'} strokeWidth={i%3===0 ? '4' : '3'} strokeLinecap="round"/>)}</svg>
          <span className="floating-compass-orbit" style={{transform:`rotate(${southPointerRotation(heading)}deg)`}} aria-hidden="true"><svg viewBox="0 0 28 28"><path d="m14 3 9 22-9-6-9 6Z" fill="#1685f8" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/><path d="m14 3 0 16-9 6Z" fill="#39c7ff"/></svg></span>
          <strong>{distance === null ? '—' : distance < 10 ? distance.toFixed(1) : Math.round(distance)}</strong><small>km</small>
        </span>
      </button>
      <div className="bump-dock-actions" aria-label="好友快捷操作">
        <button aria-label="打招呼" onClick={onGreet || (()=>onShowToast('挥手打招呼 👋'))}><Hand size={23}/><span>打招呼</span></button>
        <button aria-label="敲门" onClick={knockNow}><DoorOpen size={23}/><span>敲门</span></button>
        <button aria-label="碰一碰" onClick={onBump || (()=>onShowToast('碰一碰 ✨'))}><svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10" cy="14" r="8"/><circle cx="18" cy="14" r="8"/></svg><span>碰一碰</span></button>
        <button aria-label="好友轨迹" onClick={onTrajectory}><Footprints size={23}/><span>轨迹</span></button>
        <button aria-label="拍摄 POV" onClick={onCamera}><Camera size={23}/><span>拍照</span></button>
        <button aria-label="好友资料" onClick={onProfile || onOpenChat}><User size={23}/><span>资料</span></button>
      </div>
      <div className="bump-friend-action-strip">
        <button className="floating-message-style" aria-label="选择地图消息样式" onClick={()=>setPicker(true)}><b>Aa</b></button>
        <button className={`bump-map-composer bump-message-style floating-message-entry style-${appearance.id}`} aria-label="进入自由聊天画布" style={{textAlign:appearance.alignment}} onClick={openCanvas}><span>消息</span><Send size={20} aria-hidden="true"/></button>
      </div>
      <div className="bump-sticker-grid" aria-label="地图互动贴纸" style={{gridTemplateColumns:`repeat(${Math.ceil((ordered.length+1)/2)}, var(--sticker-column))`}}>
        {ordered.map(item => { const isLocked = friendCount < unlockCount(item); return <button key={item.id} className="bump-sticker-cell" aria-label={`${isLocked ? '解锁' : '发送'} ${item.label}`}
          onPointerDown={e => press(item, e)} onContextMenu={e => e.preventDefault()} onClick={e => { if (suppressClick.current) { suppressClick.current=false; return; } if (isLocked) setLocked(item); else { const r = e.currentTarget.getBoundingClientRect(); onLaunch(item.emoji, r.left + r.width / 2, r.top + 42); } }}>
          <BumpSticker emoji={item.emoji} size={64} /><small>{item.label}</small>{isLocked && <span className="bump-lock"><LockKeyhole size={9} className="inline mr-1" />{unlockCount(item)} 个好友</span>}
        </button>; })}
        <button className="bump-sticker-cell floating-sticker-add" aria-label="添加互动表情" onClick={() => setAddingSticker(true)}><Plus size={30}/><small>添加表情</small></button>
      </div>
    </div>
    <StickerChargeEffect charge={charge} knock={knock} scope={document.getElementById('stellar-phone-content') || dockRef.current?.parentElement || null}/>
    {picker && <MessageStylePicker appearance={appearance} onChange={setAppearance} onClose={() => setPicker(false)} />}
    {addingSticker && <div className="floating-sticker-library" role="dialog" aria-label="添加互动表情"><header><strong>你的表情小宇宙</strong><button aria-label="关闭表情库" onClick={() => setAddingSticker(false)}><X size={20}/></button></header><p>添加后，在两排表情中左右滑动使用</p><div>{STELLAR_STICKERS.map(item => <button key={item.id} disabled={extraIds.includes(item.id)} aria-label={`添加 ${item.label}`} onClick={() => addSticker(item)}><BumpSticker emoji={item.emoji} size={72}/><span>{item.label}</span><small>{extraIds.includes(item.id) ? '已添加' : '+'}</small></button>)}</div></div>}
    {locked && <div className="bump-lock-overlay" onClick={() => setLocked(null)}><div className="bump-lock-card" role="dialog" aria-modal="true" aria-label="解锁贴纸" onClick={e => e.stopPropagation()}>
      <button aria-label="关闭贴纸预览" onClick={() => setLocked(null)}><X size={23} /></button><BumpSticker emoji={locked.emoji} size={170} /><h3>和更多好友一起玩</h3><p>添加 {unlockCount(locked)} 个好友即可解锁 {locked.label}</p><p>当前 {friendCount} 个好友</p><button className="bump-add-friends" onClick={() => { setLocked(null); onAddFriend?.(); }}>添加好友</button>
    </div></div>}
  </>;
}
