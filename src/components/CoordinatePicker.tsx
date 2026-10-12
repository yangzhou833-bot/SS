import React, { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import { MapPin, Check } from 'lucide-react';
import { lifeLayerStore } from '../data/lifeLayerStore';
import { createManagedMap, destroyManagedMap } from '../map/managedMap';
import { USER_LOCATION } from '../data/mockData';
import { coordinateNumber, validCoordinates } from '../utils/creationValidation';
import type { MapLocation } from '../types';

interface CoordinatePickerProps {
  label: string;
  description?: string;
  value?: MapLocation;
  confirmed: boolean;
  onChange: (location: MapLocation, confirmed: boolean) => void;
}

export const CoordinatePicker: React.FC<CoordinatePickerProps> = ({ label, description, value, confirmed, onChange }) => {
  const [query, setQuery] = useState('');
  const [showMap, setShowMap] = useState(true);
  const [mapError, setMapError] = useState(false);
  const mapHost = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const programmaticMove = useRef(false);
  const changeRef = useRef(onChange);
  const valueRef = useRef(value);
  changeRef.current = onChange;
  valueRef.current = value;
  const valid = validCoordinates(value) && Boolean(value?.name.trim());
  const places = lifeLayerStore.getPlaces().filter(place => place.name.toLowerCase().includes(query.toLowerCase()));
  const inputClass = 'w-full p-2 border border-[#E4E6EB] rounded-md text-xs text-[#1C1E21] focus:border-[#1877F2] outline-none bg-white';

  useEffect(() => {
    if (!showMap || !mapHost.current) return;
    let disposed = false;
    const host = mapHost.current;
    setMapError(false);
    import('leaflet').then(module => {
      if (disposed) return;
      const L = module.default;
      const point = validCoordinates(valueRef.current) ? valueRef.current! : USER_LOCATION;
      const map = createManagedMap(host, { zoomControl: true, attributionControl: true }).setView([point.lat, point.lng], 15);
      mapRef.current = map;
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
      map.on('moveend', () => {
        if (programmaticMove.current) return;
        const center = map.getCenter().wrap();
        changeRef.current({name:valueRef.current?.name || '地图选点',address:valueRef.current?.address,lat:center.lat,lng:center.lng},false);
      });
      requestAnimationFrame(() => { if (!disposed) map.invalidateSize(); });
    }).catch(() => { if (!disposed) setMapError(true); });
    return () => { disposed = true; destroyManagedMap(host, mapRef.current); mapRef.current = null; };
  }, [showMap]);

  useEffect(() => {
    if (!validCoordinates(value) || !mapRef.current) return;
    const center = mapRef.current.getCenter();
    if (Math.abs(center.lat-value!.lat) < 0.0000001 && Math.abs(center.lng-value!.lng) < 0.0000001) return;
    programmaticMove.current = true;
    try { mapRef.current.panTo([value!.lat,value!.lng],{animate:false}); }
    finally { programmaticMove.current = false; }
  }, [value?.lat, value?.lng]);

  const update = (patch: Partial<MapLocation>) => onChange({ name: '', lat: Number.NaN, lng: Number.NaN, ...value, ...patch }, false);

  return <section className="bg-white text-[#1C1E21] border border-[#E4E6EB] rounded-md p-3 space-y-2" aria-label={`${label}选择`}>
    <div className="flex items-center justify-between gap-2"><h4 className="text-xs font-bold flex items-center gap-1 text-[#1C1E21]"><MapPin size={14}/>{label}</h4><span className={`text-[10px] font-bold ${confirmed ? 'text-[#1877F2]' : 'text-[#65676B]'}`}>{confirmed ? '✓ 位置已确认' : '选择后请确认'}</span></div>
    {description && <p className="text-[10px] text-[#65676B]">{description}</p>}
    <input aria-label={`${label}名称`} className={inputClass} placeholder="地点名称" value={value?.name || ''} onChange={event => update({name:event.target.value})}/>
    <input aria-label={`搜索${label}已有地点`} className={inputClass} placeholder="搜索已保存的生活坐标" value={query} onChange={event => setQuery(event.target.value)}/>
    <div className="flex gap-1.5 overflow-x-auto pb-1">{places.slice(0, 8).map(place => <button type="button" key={place.id} className="shrink-0 px-2 py-1.5 border border-[#E4E6EB] rounded-md text-[10px] hover:border-[#1877F2]" onClick={() => onChange({name:place.name,lat:place.lat,lng:place.lng},false)}>{place.icon} {place.name}</button>)}{places.length === 0 && <p className="text-[10px] text-[#65676B]">未找到已保存地点，请在地图选点或填写坐标。</p>}</div>
    <div className="grid grid-cols-2 gap-2"><label className="text-[10px] text-[#65676B]">纬度<input aria-label={`${label}纬度`} className={inputClass} type="number" step="0.00001" min="-90" max="90" value={Number.isFinite(value?.lat) ? value!.lat : ''} onChange={event => update({lat:coordinateNumber(event.target.value)})}/></label><label className="text-[10px] text-[#65676B]">经度<input aria-label={`${label}经度`} className={inputClass} type="number" step="0.00001" min="-180" max="180" value={Number.isFinite(value?.lng) ? value!.lng : ''} onChange={event => update({lng:coordinateNumber(event.target.value)})}/></label></div>
    {showMap && <div><div className="relative h-44 w-full rounded-md border border-[#E4E6EB] overflow-hidden"><div ref={mapHost} className="absolute inset-0"/><svg aria-hidden="true" width="32" height="40" viewBox="0 0 32 40" className="absolute left-1/2 top-1/2 pointer-events-none z-[500] -translate-x-1/2 -translate-y-full drop-shadow-md"><path d="M16 40C16 40 2 25 2 15a14 14 0 1 1 28 0c0 10-14 25-14 25Z" fill="#1877F2"/><circle cx="16" cy="15" r="5" fill="white"/></svg></div>{mapError && <p className="text-[10px] text-[#65676B] py-2">地图暂时无法加载，仍可选择已有地点或手动填写坐标。</p>}<p className="text-[10px] text-[#65676B] pt-1">拖动地图，让固定图钉的针尖对准位置，再点击确认。</p></div>}
    <div className="flex items-center justify-between gap-2"><button type="button" className="px-2.5 py-1.5 border border-[#E4E6EB] rounded-md text-xs text-[#1877F2] font-bold" onClick={() => setShowMap(previous => !previous)}>{showMap ? '收起地图' : '在地图选点'}</button><button type="button" disabled={!valid || confirmed} className="px-3 py-1.5 bg-[#1877F2] text-white rounded-md text-xs font-bold flex items-center gap-1 disabled:opacity-45" onClick={() => onChange(value!,true)}><Check size={13}/>{confirmed ? '已确认' : `确认${label}`}</button></div>
  </section>;
};
