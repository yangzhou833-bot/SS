import React, {useRef,useState,useEffect,useCallback} from 'react';
import {Check,Undo2,Redo2,X} from 'lucide-react';
import {soundEffects} from '../../utils/soundEffects';
import {haptics} from '../../utils/haptics';
import type {ChatMessage} from '../../types';
import './doodle.css';

export interface HandwritingStroke {points:Array<{x:number;y:number}>;color:string;width:number;}
interface Props {
  onSend?:(imageUrl:string,strokes:HandwritingStroke[],layout:NonNullable<ChatMessage['doodleLayout']>)=>void;
  showToast:(message:string)=>void;isActive?:boolean;onActiveChange?:(active:boolean)=>void;
}
const COLOURS=[['赤','#FF3B30'],['橙','#FF9500'],['黄','#FFD60A'],['绿','#34C759'],['青','#00C7BE'],['蓝','#2453FF'],['紫','#AF52DE']];

function paint(ctx:CanvasRenderingContext2D,strokes:HandwritingStroke[]) {
  for(const stroke of strokes) {
    if(!stroke.points.length) continue;
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=stroke.width;
    ctx.strokeStyle=stroke.color;ctx.fillStyle=stroke.color;
    ctx.shadowColor=stroke.color;ctx.shadowBlur=1.2;ctx.shadowOffsetY=1;
    const path=()=>{
      ctx.beginPath();const first=stroke.points[0];ctx.moveTo(first.x,first.y);
      for(let i=1;i<stroke.points.length;i++){const prev=stroke.points[i-1],point=stroke.points[i];ctx.quadraticCurveTo(prev.x,prev.y,(prev.x+point.x)/2,(prev.y+point.y)/2);}
      const last=stroke.points[stroke.points.length-1];ctx.lineTo(last.x,last.y);
    };
    if(stroke.points.length===1){ctx.beginPath();ctx.arc(stroke.points[0].x,stroke.points[0].y,stroke.width/2,0,Math.PI*2);ctx.fill();}
    else {path();ctx.stroke();ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.translate(0,-stroke.width*.14);ctx.lineWidth=stroke.width*.2;ctx.strokeStyle='#ffffff45';path();ctx.stroke();}
    ctx.restore();
  }
}

export const OnScreenHandwritingLayer:React.FC<Props>=({onSend,showToast,isActive=false,onActiveChange})=>{
  const [colour,setColour]=useState('#2453FF');
  const [palette,setPalette]=useState(false);
  const [active,setActive]=useState(isActive);
  const [strokes,setStrokes]=useState<HandwritingStroke[]>([]);
  const [redo,setRedo]=useState<HandwritingStroke[]>([]);
  const canvasRef=useRef<HTMLCanvasElement>(null),containerRef=useRef<HTMLDivElement>(null);
  const draft=useRef<{id:number;stroke:HandwritingStroke}|null>(null);
  const strokesRef=useRef(strokes);strokesRef.current=strokes;
  const changeActive=(value:boolean)=>{setActive(value);onActiveChange?.(value);};
  useEffect(()=>{setActive(isActive);if(isActive)setPalette(true);},[isActive]);
  const redraw=useCallback((value:HandwritingStroke[])=>{
    const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
    const dpr=window.devicePixelRatio||1;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.setTransform(dpr,0,0,dpr,0,0);paint(ctx,value);
  },[]);
  useEffect(()=>{
    const resize=()=>{const canvas=canvasRef.current,container=containerRef.current;if(!canvas||!container)return;const rect=container.getBoundingClientRect(),dpr=window.devicePixelRatio||1;canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);redraw(strokesRef.current);};
    const observer=new ResizeObserver(resize);if(containerRef.current)observer.observe(containerRef.current);resize();
    return()=>observer.disconnect();
  },[redraw]);
  useEffect(()=>{redraw(strokes);},[strokes,redraw]);
  const point=(event:React.PointerEvent<HTMLCanvasElement>)=>{const rect=event.currentTarget.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top};};
  const down=(event:React.PointerEvent<HTMLCanvasElement>)=>{
    if(!active||event.button!==0||draft.current)return;event.preventDefault();event.stopPropagation();setPalette(false);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    draft.current={id:event.pointerId,stroke:{points:[point(event)],color:colour,width:8}};
    redraw([...strokesRef.current,draft.current.stroke]);
  };
  const move=(event:React.PointerEvent<HTMLCanvasElement>)=>{
    const current=draft.current;if(!current||current.id!==event.pointerId)return;event.preventDefault();event.stopPropagation();
    current.stroke.points.push(point(event));redraw([...strokesRef.current,current.stroke]);
  };
  const end=(event:React.PointerEvent<HTMLCanvasElement>,cancelled=false)=>{
    const current=draft.current;if(!current||current.id!==event.pointerId)return;event.preventDefault();event.stopPropagation();draft.current=null;
    if(event.currentTarget.hasPointerCapture?.(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
    if(cancelled)redraw(strokesRef.current);else {const next=[...strokesRef.current,current.stroke];strokesRef.current=next;setStrokes(next);setRedo([]);}
  };
  const cancel=()=>{draft.current=null;setStrokes([]);strokesRef.current=[];setRedo([]);setPalette(false);changeActive(false);};
  const confirm=()=>{
    if(!strokesRef.current.length||draft.current||!onSend)return;
    const source=canvasRef.current!,rect=source.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
    const points=strokesRef.current.flatMap(s=>s.points),pad=10;
    const left=Math.max(0,Math.min(...points.map(p=>p.x))-pad),top=Math.max(0,Math.min(...points.map(p=>p.y))-pad);
    const right=Math.max(left+1,Math.min(rect.width||Infinity,Math.max(...points.map(p=>p.x))+pad));
    const bottom=Math.max(top+1,Math.min(rect.height||Infinity,Math.max(...points.map(p=>p.y))+pad));
    const width=right-left,height=bottom-top;
    const output=document.createElement('canvas');output.width=Math.ceil(width*dpr);output.height=Math.ceil(height*dpr);
    const ctx=output.getContext('2d');if(!ctx){showToast('画布暂时不可用，请重试');return;}
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const normalized=strokesRef.current.map(s=>({...s,points:s.points.map(p=>({x:p.x-left,y:p.y-top}))}));paint(ctx,normalized);
    const scroll=containerRef.current?.closest('[data-chat-screen]')?.querySelector<HTMLElement>('[data-testid="free-canvas"]');
    const surface=scroll?.querySelector<HTMLElement>('.bump-canvas-surface');
    const surfaceRect=surface?.getBoundingClientRect();const scrollRect=scroll?.getBoundingClientRect();const padding=scroll ? parseFloat(getComputedStyle(scroll).paddingTop)||0 : 0;
    onSend(output.toDataURL('image/png'),normalized,{x:left+rect.left-(surfaceRect?.left??scrollRect?.left??rect.left),y:top+rect.top-(surfaceRect?.top??((scrollRect?.top??rect.top)-(scroll?.scrollTop||0)+padding)),w:width,h:height,canvasWidth:surface?.clientWidth||rect.width||370});
    cancel();soundEffects.playWhooshSound();haptics.trigger('success');
  };
  return <div ref={containerRef} className={`screen-doodle-layer ${active?'is-writing':''}`}>
    <canvas ref={canvasRef} aria-label="屏幕涂鸦画布" onPointerDown={down} onPointerMove={move} onPointerUp={e=>end(e)} onPointerCancel={e=>end(e,true)}/>
    {palette&&<div className="doodle-palette" aria-label="七色画笔">{COLOURS.map(([name,value])=><button key={name} data-ink-colour aria-label={`${name}色`} aria-pressed={colour===value} style={{background:value}} onClick={()=>{setColour(value);setPalette(false);changeActive(true);haptics.trigger('light');}}/>)}</div>}
    <button id="docked-pen-nib" className="doodle-pen" aria-label="选择画笔颜色" aria-expanded={palette} onClick={()=>{changeActive(true);setPalette(value=>!value);soundEffects.playTapSound();}}>
      <img src="/bump/doodle-pen-v9.png" alt="" draggable={false}/>
      <span className="doodle-ink-dot" style={{background:colour,boxShadow:`0 0 7px ${colour}`}} aria-hidden="true"/>
    </button>
    {active&&<div className="doodle-controls" aria-label="涂鸦操作">
      <button aria-label="撤销笔迹" disabled={!strokes.length} onClick={()=>{setRedo(v=>[...v,strokes[strokes.length-1]]);setStrokes(v=>v.slice(0,-1));}}><Undo2 size={19}/></button>
      <button aria-label="重做笔迹" disabled={!redo.length} onClick={()=>{setStrokes(v=>[...v,redo[redo.length-1]]);setRedo(v=>v.slice(0,-1));}}><Redo2 size={19}/></button>
      <button aria-label="取消涂鸦" onClick={cancel}><X size={20}/></button>
      <button className="doodle-confirm" aria-label="确认涂鸦" disabled={!strokes.length||!onSend} onClick={confirm}><Check size={22} strokeWidth={3}/></button>
    </div>}
  </div>;
};
