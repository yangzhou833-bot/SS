import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BumpSticker } from './BumpSticker';
import { haptics } from '../../utils/haptics';

export interface StickerCharge {
  id:string; emoji:string; label:string; progress:number; phase:'charging'|'full'|'burst';
}
const themes:Record<string,{color:string;symbol:string;hint:string}> = {
  heart:{color:'#ff6d9f',symbol:'♥',hint:'气球在充气'},cry:{color:'#64caff',symbol:'💧',hint:'眼泪快要满了'},
  poop:{color:'#bc7450',symbol:'●',hint:'惊喜在膨胀'},beer:{color:'#f8bd42',symbol:'●',hint:'啤酒正在灌满'},
  eyes:{color:'#b89fff',symbol:'✦',hint:'目光正在聚焦'},hello:{color:'#ffc877',symbol:'HELLO',hint:'问候字浪来了'},
  fire:{color:'#ff854c',symbol:'🔥',hint:'热浪正在升温'},squirrel:{color:'#d7a669',symbol:'🌰',hint:'松果正在集合'},yes:{color:'#e8a2ff',symbol:'YES',hint:'点赞正在加倍'},
  'stellar-planet':{color:'#acafff',symbol:'✦',hint:'小宇宙正在展开'},'stellar-hug':{color:'#ffb4d6',symbol:'♥',hint:'拥抱正在靠近'},
  'stellar-coffee':{color:'#e7c4a7',symbol:'☁',hint:'咖啡香气正在升起'},'stellar-book':{color:'#c9baff',symbol:'📖',hint:'翻开新的一页'},
  'stellar-sleep':{color:'#c8d9ff',symbol:'Z',hint:'云朵正在入梦'},'stellar-star':{color:'#ffe69d',symbol:'✦',hint:'星光正在汇聚'},
};
export function StickerChargeEffect({charge,knock,scope}:{charge:StickerCharge|null;knock:number;scope:HTMLElement|null}) {
  const [reduced,setReduced]=useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false);
  useEffect(() => {const query=window.matchMedia?.('(prefers-reduced-motion: reduce)'); if (!query) return; const update=()=>setReduced(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
  const shake=!!knock || charge?.phase === 'full';
  useEffect(() => {
    if (!shake || reduced || !scope) return;
    scope.classList.add('stellar-screen-jolt');haptics.trigger('medium');
    return()=>scope.classList.remove('stellar-screen-jolt');
  },[shake,reduced,scope,knock]);
  if ((!charge && !knock) || !scope) return null;
  if (knock) return createPortal(<div key={knock} className={`sticker-screen-effect sticker-knock-effect ${reduced?'is-reduced':''}`} data-knock-effect={knock} aria-hidden="true"><div className="sticker-knock-target"><i/><i/><i/><b>👊</b><strong>咚，咚！</strong></div></div>,scope);
  const theme=themes[charge!.id] || themes.yes;
  const {id,emoji,label,progress,phase}=charge!;
  if (reduced) return createPortal(<div className="sticker-screen-effect sticker-charge-reduced" data-sticker-effect={id} data-sticker-phase={phase} aria-hidden="true"><div><BumpSticker emoji={emoji} size={40}/><strong>{label} · {phase==='burst'?'蓄力完成':`${Math.round(progress*100)}%`}</strong></div></div>,scope);
  const liquid=id==='beer'||id==='cry';
  const inflate=id==='heart'||id==='poop'||id==='stellar-hug';
  return createPortal(<div className={`sticker-screen-effect sticker-charge-${id} phase-${phase}`} data-sticker-effect={id} data-sticker-phase={phase} style={{'--effect-color':theme.color,'--charge':progress} as React.CSSProperties} aria-hidden="true">
    {phase!=='burst' && <>
      {liquid && <div className="sticker-charge-liquid" style={{height:`${progress*100}%`}}><div className="sticker-charge-liquid-top"/>{Array.from({length:14},(_,i)=><i key={i} style={{left:`${(i*23+7)%98}%`,animationDelay:`${-i*.31}s`,width:6+i%4*4,height:6+i%4*4}}/>)}</div>}
      {id==='eyes' && <div className="sticker-charge-focus"><i/><i/><i/><span>＋</span></div>}
      {id==='hello' && <div className="sticker-charge-wordwave">{['HELLO!','你好呀!','HELLO!'].map((text,i)=><strong key={`wordwave-${text}-${i}`} style={{animationDelay:`${i*.15}s`}}>{text}</strong>)}</div>}
      {id==='fire' && <div className="sticker-charge-heat" style={{height:`${35+progress*65}%`}}><i/><i/><i/></div>}
      <div className={`sticker-charge-core ${inflate?'is-balloon':''} ${liquid?'is-liquid-core':''}`} style={{transform:`translate(-50%,-50%) scale(${inflate ? .7+progress*2.5 : liquid ? .75+progress*.3 : .85+progress*.65})`}}>
        <BumpSticker emoji={emoji} size={inflate?125:115}/>
        {id==='stellar-coffee' && <div className="sticker-charge-steam"><i/><i/><i/></div>}
        {id==='stellar-book' && <div className="sticker-charge-pages"><i/><i/><i/></div>}
      </div>
      {['squirrel','yes','stellar-planet','stellar-sleep','stellar-star','stellar-hug'].includes(id) && <div className="sticker-charge-orbit" style={{width:120+progress*190,height:120+progress*190}}>{Array.from({length:8},(_,i)=><span key={i} style={{transform:`rotate(${i*45}deg) translateY(-${60+progress*95}px) rotate(-${i*45}deg)`}}>{theme.symbol}</span>)}</div>}
      <div className="sticker-charge-caption"><strong>{theme.hint}</strong><span>{phase==='full'?'准备爆开！':'按住继续，松手结束'}</span><i><b style={{width:`${progress*100}%`}}/></i></div>
    </>}
    {phase==='burst' && <div className={`sticker-charge-burst ${liquid?'is-splash':''} ${id==='heart'?'is-confetti':''}`}>{Array.from({length:28},(_,i)=>{const angle=i*Math.PI*2/28;return <span key={i} style={{'--dx':`${Math.cos(angle)*(110+i%4*38)}px`,'--dy':`${Math.sin(angle)*(160+i%5*32)}px`,'--spin':`${i*37}deg`,color:id==='heart'?['#ff739e','#8a9fff','#ffe178','#78ded3'][i%4]:theme.color,animationDelay:`${i%3*15}ms`} as React.CSSProperties}>{id==='heart'||liquid?'':theme.symbol}</span>;})}<div className="sticker-charge-pop-ring"/></div>}
  </div>,scope);
}
