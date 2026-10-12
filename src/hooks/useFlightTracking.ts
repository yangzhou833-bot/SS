import { useCallback, useEffect, useRef } from 'react';
import type { Schedule } from '../types';
import { dateKey, scheduleTime } from '../utils/lifePlanning';
import { fetchFlightSnapshot, flightTrackingEndpoint, getFlightSnapshotInfo } from '../utils/flightTracking';

export function useFlightTracking(schedules:Schedule[],onUpdateSchedule:(schedule:Schedule)=>void) {
  const schedulesRef=useRef(schedules);schedulesRef.current=schedules;
  const updateRef=useRef(onUpdateSchedule);updateRef.current=onUpdateSchedule;
  const controllers=useRef(new Map<string,AbortController>());
  const configured=Boolean(flightTrackingEndpoint());
  const flightKeys=schedules.filter(item => item.type === 'flight' && item.flight).map(item => `${item.id}:${item.flight!.flightNumber}:${item.startAt}`).join('|');
  const refreshFlight=useCallback(async (schedule:Schedule) => {
    if (!flightTrackingEndpoint() || !schedule.flight || controllers.current.has(schedule.id)) return false;
    const controller=new AbortController();controllers.current.set(schedule.id,controller);
    let timedOut=false;
    const timeout=window.setTimeout(() => {timedOut=true;controller.abort();},12000);
    try {
      const live=await fetchFlightSnapshot(schedule,controller.signal);
      if (live && !controller.signal.aborted) {
        const current=schedulesRef.current.find(item => item.id === schedule.id);
        if (current?.flight) updateRef.current({...current,flight:{...current.flight,live,lookupError:undefined},updatedAt:new Date().toISOString()});
        return true;
      }
    } catch (error) {
      if (!controller.signal.aborted || timedOut) {
        const current=schedulesRef.current.find(item => item.id === schedule.id);
        if (current?.flight) updateRef.current({...current,flight:{...current.flight,lookupError:timedOut ? '航班服务响应超时，保留已确认的计划行程' : error instanceof Error ? error.message : '航班数据暂时不可用，保留已确认的计划行程'},updatedAt:new Date().toISOString()});
      }
    } finally {clearTimeout(timeout);if (controllers.current.get(schedule.id) === controller) controllers.current.delete(schedule.id);}
    return false;
  },[]);
  useEffect(() => {
    if (!configured) return;
    const check=() => {
      if (document.visibilityState === 'hidden') return;
      schedulesRef.current.filter(item => {
        const start=scheduleTime(item.startAt);
        return item.type === 'flight' && item.flight && item.status !== 'cancelled' && item.status !== 'completed' && Number.isFinite(start) && (dateKey(new Date(start)) === dateKey() || getFlightSnapshotInfo(item).status === 'in_flight');
      }).forEach(item => {void refreshFlight(item);});
    };
    check();const timer=window.setInterval(check,60000);document.addEventListener('visibilitychange',check);
    return () => {clearInterval(timer);document.removeEventListener('visibilitychange',check);controllers.current.forEach(controller => controller.abort());controllers.current.clear();};
  },[configured,flightKeys,refreshFlight]);
  return {configured,refreshFlight};
}
