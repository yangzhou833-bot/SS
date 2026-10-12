import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlignLeft, AlignCenter, AlignRight, Check, X, Minus, Plus, Scan } from 'lucide-react';
import { MESSAGE_STYLES, MESSAGE_STYLE_PREVIEWS, MessageAppearance } from './messageStyles';

export function MessageStylePicker({ appearance, onChange, onClose }: {
  appearance: MessageAppearance; onChange: (value: MessageAppearance) => void; onClose: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const stopPanRef = useRef<(() => void) | null>(null);
  const suppressClickRef = useRef(false);
  const [view, setView] = useState({ x: 12, y: 12, zoom: .76 });
  const field = { width: 760, height: Math.ceil(MESSAGE_STYLES.length / 5) * 140 - 8 };
  const size = () => ({ width: viewportRef.current?.clientWidth || 360, height: viewportRef.current?.clientHeight || 440 });
  const bound = (x: number, y: number, zoom: number) => {
    const box = size();
    const axis = (value: number, available: number, full: number) => full * zoom < available - 24 ? (available - full * zoom) / 2 : Math.max(available - full * zoom - 12, Math.min(12, value));
    return { x: axis(x, box.width, field.width), y: axis(y, box.height, field.height), zoom };
  };
  const zoomTo = (zoom: number) => setView(previous => {
    const next = Math.max(.4, Math.min(1.25, zoom));
    const box = size(), ratio = next / previous.zoom;
    return bound(box.width / 2 - (box.width / 2 - previous.x) * ratio, box.height / 2 - (box.height / 2 - previous.y) * ratio, next);
  });
  const fitAll = () => { const box = size(); const zoom = Math.max(.4, Math.min(.95, (box.width - 24) / field.width, (box.height - 24) / field.height)); setView(bound(0, 0, zoom)); };
  const pan = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    stopPanRef.current?.();
    suppressClickRef.current = false;
    const start = { x: event.clientX, y: event.clientY }, before = view, pointerId = event.pointerId;
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.hypot(dx, dy) < 6 && !suppressClickRef.current) return;
      suppressClickRef.current = true;
      setView(bound(before.x + dx, before.y + dy, before.zoom));
    };
    const cleanup = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', cancel); window.removeEventListener('blur', cancel);
      stopPanRef.current = null;
    };
    const end = (e: PointerEvent) => { if (e.pointerId === pointerId) cleanup(); };
    const cancel = () => { cleanup(); setView(before); suppressClickRef.current = true; };
    stopPanRef.current = cancel;
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', cancel); window.addEventListener('blur', cancel);
  };
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const buttons = [...(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button') || [])];
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if ((!e.shiftKey && current === buttons.length - 1) || (e.shiftKey && current === 0)) { e.preventDefault(); buttons[e.shiftKey ? buttons.length - 1 : 0]?.focus(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); stopPanRef.current?.(); previousFocus?.focus(); };
  }, [onClose]);
  const phone = document.getElementById("stellar-phone-content");
  return createPortal(
    <div ref={dialogRef} className={`bump-style-overlay bump-style-canvas-picker ${phone ? "in-phone" : ""}`} role="dialog" aria-modal="true" aria-label="消息样式">
      <div className="bump-style-header"><div><span>随你表达</span><small>拖动画布比较气泡与字型，点击选择</small></div><button onClick={onClose} aria-label="完成样式选择"><X size={20} /></button></div>
      <div className="bump-style-zoom"><button aria-label="缩小样式画布" onClick={() => zoomTo(view.zoom - .12)}><Minus size={16}/></button><span>{Math.round(view.zoom * 100)}%</span><button aria-label="放大样式画布" onClick={() => zoomTo(view.zoom + .12)}><Plus size={16}/></button><button aria-label="查看全部样式" onClick={fitAll}><Scan size={16}/>全部</button></div>
      <div ref={viewportRef} className="bump-style-viewport" aria-label="平移消息样式画布" tabIndex={0} onPointerDown={pan} onKeyDown={event => {
        const delta = ({ArrowLeft:[30,0],ArrowRight:[-30,0],ArrowUp:[0,30],ArrowDown:[0,-30]} as Record<string, number[]>)[event.key];
        if (delta && event.target === event.currentTarget) { event.preventDefault(); setView(previous => bound(previous.x + delta[0], previous.y + delta[1], previous.zoom)); }
      }}>
      <div className="bump-style-field" role="radiogroup" aria-label="选择字体样式" style={{width:field.width,height:field.height,transform:`translate(${view.x}px,${view.y}px) scale(${view.zoom})`}}>
        {MESSAGE_STYLES.map(([id, name], index) => <button key={id} role="radio" aria-checked={appearance.id === id}
          aria-label={name} onClick={() => { if (suppressClickRef.current) { suppressClickRef.current = false; return; } onChange({ ...appearance, id }); }} className={`bump-style-option ${appearance.id === id ? 'is-chosen' : ''}`} style={{left:index % 5 * 152,top:Math.floor(index / 5) * 140}}>
          <span className={`bump-message-style style-${id}`} style={{ transform: `rotate(${index % 3 === 0 ? -3 : index % 3 === 1 ? 3 : 0}deg)` }}>{MESSAGE_STYLE_PREVIEWS[id].text}</span>
          <small>{name} {appearance.id === id && <Check size={12} />}</small>
          <small className="bump-style-font">{MESSAGE_STYLE_PREVIEWS[id].font}</small>
        </button>)}
      </div>
      </div>
      <div className="bump-style-footer"><div role="radiogroup" aria-label="文字对齐">
        {([['left', AlignLeft, '左对齐'], ['center', AlignCenter, '居中'], ['right', AlignRight, '右对齐']] as const).map(([alignment, Icon, label]) =>
          <button key={alignment} role="radio" aria-label={label} aria-checked={appearance.alignment === alignment} onClick={() => onChange({ ...appearance, alignment })}><Icon size={23} /></button>)}
      </div><button className="bump-style-done" onClick={onClose}>完成</button><p>自由聊天保留样式，经典聊天显示统一气泡</p></div>
    </div>, phone || document.body,
  );
}
