import {useCallback,useEffect,useState} from 'react';
import {loadLifeRoute,type LifeRoute,type TravelMode} from '../utils/lifePlanning';
import type {Friend,Schedule} from '../types';
import type {LatLng} from './types';

export interface NavigationDestination extends LatLng {
  name:string;
  friend?:Friend;
  schedule?:Schedule;
}

// A map-level session: closing a detail card does not cancel the request.
export function useMapNavigation(origin:LatLng) {
  const [request,setRequest]=useState<{target:NavigationDestination;mode:TravelMode;attempt:number}|null>(null);
  const [result,setResult]=useState<{route:LifeRoute|null;status:'idle'|'loading'|'ready'|'error';error:string}>({route:null,status:'idle',error:''});
  useEffect(()=>{
    if(!request) return;
    const controller=new AbortController();
    setResult({route:null,status:'loading',error:''});
    loadLifeRoute(origin,request.target,request.mode,controller.signal).then(route=>{
      if(!controller.signal.aborted) setResult({route,status:'ready',error:''});
    }).catch(error=>{
      if(!controller.signal.aborted) setResult({route:null,status:'error',error:error instanceof Error ? error.message : '道路路线暂时不可用'});
    });
    return ()=>controller.abort();
  },[request,origin.lat,origin.lng]);
  const start=useCallback((target:NavigationDestination,mode:TravelMode='walking')=>{
    setResult({route:null,status:'loading',error:''});
    setRequest({target,mode,attempt:0});
  },[]);
  const setMode=useCallback((mode:TravelMode)=>setRequest(previous=>previous ? {...previous,mode} : null),[]);
  const retry=useCallback(()=>setRequest(previous=>previous ? {...previous,attempt:previous.attempt+1} : null),[]);
  const clear=useCallback(()=>{
    setRequest(null);setResult({route:null,status:'idle',error:''});
  },[]);
  const showOverview=useCallback(()=>setResult(previous=>previous.route ? {...previous,route:{...previous.route}} : previous),[]);
  return {...result,target:request?.target || null,mode:request?.mode || 'walking',start,setMode,retry,clear,showOverview};
}
