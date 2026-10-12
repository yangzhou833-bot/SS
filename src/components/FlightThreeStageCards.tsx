import React, { useState, useEffect } from 'react';
import { FlightSchedule } from '../types';
import { FlightStageCard } from './FlightStageCard';

type Stage = 'preflight' | 'in-flight' | 'landed';
export interface FlightThreeStageCardsProps {
  flight: FlightSchedule;
  onStageChange?: (stage: Stage, flightData: FlightSchedule) => void;
  onLocateStage?: (stage: Stage) => void;
  className?: string;
  showControls?: boolean;
}
const simpleStage = (flight: FlightSchedule):Stage => flight.currentStage === 'landed' || flight.currentStage === 'completed' ? 'landed' : flight.currentStage === 'in-flight' ? 'in-flight' : 'preflight';

export const FlightThreeStageCards: React.FC<FlightThreeStageCardsProps> = ({ flight, onStageChange, onLocateStage, className = '', showControls = true }) => {
  const [demoStage, setDemoStage] = useState<Stage>(simpleStage(flight));
  const [progress, setProgress] = useState(flight.hasProgress ? flight.progressPercent : 0);
  const [running, setRunning] = useState(false);
  const demo = flight.isSimulated && flight.dataMode !== 'live' && flight.dataMode !== 'stale';
  useEffect(() => { setDemoStage(simpleStage(flight));setProgress(flight.hasProgress ? flight.progressPercent : 0);setRunning(false); },[flight.id]);
  const activeStage = demo ? demoStage : simpleStage(flight);
  const currentFlight:FlightSchedule = demo ? {...flight,currentStage:demoStage,progressPercent:progress,hasProgress:demoStage !== 'preflight',dataMode:'demo',dataLabel:'演示航班 · 非实时数据',hasElapsed:false,hasRemaining:false} : flight;
  const changeDemo = (stage:Stage, value:number) => {
    setDemoStage(stage);setProgress(value);
    onStageChange?.(stage,{...currentFlight,currentStage:stage,progressPercent:value,hasProgress:stage !== 'preflight'});
  };
  useEffect(() => {
    if (!demo || !running || demoStage !== 'in-flight') return;
    const timer = window.setInterval(() => setProgress(previous => Math.min(100,previous+1)),4000);
    return () => clearInterval(timer);
  },[demo,running,demoStage]);
  useEffect(() => { if (demo && progress === 100 && demoStage === 'in-flight') {setRunning(false);changeDemo('landed',100);} },[demo,progress,demoStage]);
  return <div className={`w-full mx-auto flex flex-col gap-3 ${className}`}>
    {demo && showControls && <div className="flex justify-between flex-wrap gap-2 bg-white border border-[#E4E6EB] rounded-md p-3 text-xs"><strong className="text-[#1877F2]">演示控制 · 非实时航班</strong><div className="flex flex-wrap gap-2"><button type="button" onClick={() => changeDemo(activeStage === 'preflight' ? 'in-flight' : activeStage === 'in-flight' ? 'landed' : 'preflight',activeStage === 'in-flight' ? 100 : 0)}>下一演示阶段</button><button type="button" onClick={() => setRunning(previous => !previous)}>{running ? '暂停演示' : '播放演示进度'}</button><button type="button" onClick={() => {setRunning(false);changeDemo('preflight',0);}}>重置演示</button></div></div>}
    {(['preflight','in-flight','landed'] as Stage[]).map(stage => <FlightStageCard key={stage} stage={stage} flight={currentFlight} isActive={activeStage === stage} onClick={() => {if (demo) changeDemo(stage,stage === 'landed' ? 100 : 0);onLocateStage?.(stage);}}/>)}
  </div>;
};
