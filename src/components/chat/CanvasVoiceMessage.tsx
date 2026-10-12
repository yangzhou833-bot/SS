import React, { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

export function CanvasVoiceMessage({url, duration = 0, onError}: {url?: string; duration?: number; onError: (text:string) => void}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing,setPlaying] = useState(false);
  const [elapsed,setElapsed] = useState(0);
  const [length,setLength] = useState(duration);
  const [rate,setRate] = useState(1);
  const clock = (seconds:number) => `${Math.floor(seconds/60)}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;
  const toggle = async () => {
    if (!audio.current || !url) { onError('这条语音没有可播放的录音'); return; }
    if (playing) audio.current.pause();
    else try { await audio.current.play(); } catch { onError('录音暂时无法播放，请检查音频文件'); }
  };
  return <div className="canvas-voice" onClick={e=>e.stopPropagation()}>
    <audio ref={audio} src={url} preload="metadata" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onTimeUpdate={e=>setElapsed(e.currentTarget.currentTime)} onLoadedMetadata={e=>{if(Number.isFinite(e.currentTarget.duration))setLength(e.currentTarget.duration);}} onError={()=>{setPlaying(false);}}/>
    <button aria-label={playing?'暂停语音':'播放语音'} onClick={toggle}>{playing?<Pause size={17}/>:<Play size={17} fill="currentColor"/>}</button>
    <div className="canvas-voice-track"><div className="canvas-voice-wave" aria-hidden="true">{Array.from({length:24},(_,i)=><i key={i} style={{height:6+(i*17%23),opacity:i/24 <= elapsed/(length||1) ? 1:.35}}/>)}</div><input aria-label="语音播放进度" type="range" min="0" max={length || 1} step="0.1" value={elapsed} disabled={!url || !length} onChange={e=>{const value=Number(e.target.value);if(audio.current)audio.current.currentTime=value;setElapsed(value);}}/></div>
    <button className="canvas-voice-rate" aria-label={`语音速度 ${rate} 倍`} onClick={()=>{const next=rate===2?1:rate+.5;setRate(next);if(audio.current)audio.current.playbackRate=next;}}>{rate}×</button><time>{clock(playing ? elapsed : length)}</time>
  </div>;
}
