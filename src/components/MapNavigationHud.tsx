import {Navigation,X,RotateCcw,Route} from 'lucide-react';
import {TRAVEL_MODES} from '../utils/lifePlanning';
import type {useMapNavigation} from '../map/useMapNavigation';
import {buildNavigationUrl,detectNavEnvironment,pickNavigationTarget} from '../map/deepLinks';
import type {LatLng} from '../map/types';

export function MapNavigationHud({navigation,origin,onClose,onLocate,locationPending,usingDeviceLocation}:{navigation:ReturnType<typeof useMapNavigation>;origin:LatLng;onClose:()=>void;onLocate:()=>void;locationPending:boolean;usingDeviceLocation:boolean}) {
  const {target,route,status,error,mode}=navigation;
  if(!target) return null;
  const external=buildNavigationUrl(pickNavigationTarget(detectNavEnvironment()),{from:origin,to:target,label:target.name,mode:mode==='cycling' ? 'bike' : mode==='driving' ? 'drive' : 'walk'});
  return <section aria-label="地图路线导航" className="map-navigation-hud">
    <header><Navigation size={17}/><strong>前往 {target.name}</strong><button onClick={onClose} aria-label="结束导航"><X size={18}/></button></header>
    <div className="map-navigation-modes" aria-label="导航出行方式">{TRAVEL_MODES.map(item=><button key={item.id} aria-pressed={mode===item.id} onClick={()=>navigation.setMode(item.id)}>{item.icon} {item.label}</button>)}</div>
    <p aria-live="polite">{status==='loading' ? '正在计算道路路线…' : status==='error' ? <span role="alert">{error}</span> : route ? <><b>{route.distanceKm} km</b><span>约 {route.minutes} 分钟 · 道路路线</span></> : '选择目的地开始规划'}</p>
    <div className="map-navigation-actions">{status==='error' ? <button onClick={navigation.retry}><RotateCcw size={14}/>重试路线</button> : <button disabled={!route} onClick={navigation.showOverview}><Route size={14}/>路线全貌</button>}<a href={external} target="_blank" rel="noopener noreferrer"><Navigation size={14}/>外部导航</a></div>
    <small>{usingDeviceLocation ? '从设备当前位置出发' : '从原型当前位置出发'} · <button disabled={locationPending} onClick={onLocate} title="授权定位后，用当前位置重新规划道路路线">{locationPending ? '正在定位…' : '使用当前位置'}</button></small>
    {route && <small>路线 © <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noreferrer">FOSSGIS</a> / OpenStreetMap · 不含实时路况</small>}
  </section>;
}
