import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  X,
  Check,
  Radio,
  Navigation,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  School,
  Building,
  RotateCcw,
  Compass,
} from 'lucide-react';
import L from 'leaflet';
import { createManagedMap, destroyManagedMap } from '../../map/managedMap';
import 'leaflet/dist/leaflet.css';

export interface CampusLocationPreset {
  id: string;
  name: string;
  room: string;
  lat: number;
  lng: number;
  desc: string;
  tag: string;
}

export const DEFAULT_CAMPUS_PRESETS: CampusLocationPreset[] = [
  {
    id: 'p1',
    name: '计算机科学实验大楼',
    room: '3-101 计算机实验室',
    lat: 36.0592,
    lng: 103.8343,
    desc: '计算机软硬件教学与GPU微集群实训中心 (3楼南侧)',
    tag: '实验室',
  },
  {
    id: 'p2',
    name: '第二教学楼报告厅',
    room: '2-405 大报告厅',
    lat: 36.0615,
    lng: 103.8315,
    desc: '多功能阶梯学术报告厅，支持合班大课与学术讲座',
    tag: '大报告厅',
  },
  {
    id: 'p3',
    name: '工科实训中心',
    room: '5-203 嵌入式中心',
    lat: 36.0581,
    lng: 103.8368,
    desc: '嵌入式系统与物联网联合实验室',
    tag: '实训室',
  },
  {
    id: 'p4',
    name: '理科学术研讨楼',
    room: '理科楼 1-208 研讨室',
    lat: 36.0632,
    lng: 103.8385,
    desc: '数学与基础科学小组讨论及教授答疑室',
    tag: '研讨室',
  },
  {
    id: 'p5',
    name: '第四教学楼智慧空间',
    room: '工科楼 4-302 智慧教室',
    lat: 36.0568,
    lng: 103.8322,
    desc: '智慧交互一体化多屏录播教室',
    tag: '智慧教室',
  },
  {
    id: 'p6',
    name: '校园图书馆学术中心',
    room: '图文信息中心 B108 研讨室',
    lat: 36.0605,
    lng: 103.8355,
    desc: '图书馆数字化学习空间与协同研修室',
    tag: '图书馆',
  },
  {
    id: 'p7',
    name: '综合体育中心主馆',
    room: '体育馆 101 室内篮球场',
    lat: 36.0645,
    lng: 103.8295,
    desc: '室内体育教学与体能健康达标测验馆',
    tag: '体育馆',
  },
];

export interface BeaconMapPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  initialRadius?: number;
  initialRoomName?: string;
  courseName?: string;
  teacherName?: string;
  onConfirm: (lat: number, lng: number, radius: number, roomName?: string) => void;
  showToast?: (msg: string) => void;
}

export const BeaconMapPreviewModal: React.FC<BeaconMapPreviewModalProps> = ({
  isOpen,
  onClose,
  initialLat = 36.0592,
  initialLng = 103.8343,
  initialRadius = 50,
  initialRoomName = '3-101 计算机实验室',
  courseName = '新课程',
  teacherName = '张立华 教授',
  onConfirm,
  showToast,
}) => {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [radius, setRadius] = useState<number>(initialRadius);
  const [roomName, setRoomName] = useState<string>(initialRoomName);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('p1');
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const pulseCircleRef = useRef<L.Circle | null>(null);

  // Sync state when initial props change or modal opens
  useEffect(() => {
    if (isOpen) {
      setLat(initialLat);
      setLng(initialLng);
      setRadius(initialRadius);
      setRoomName(initialRoomName);
      const match = DEFAULT_CAMPUS_PRESETS.find(
        (p) => Math.abs(p.lat - initialLat) < 0.0001 && Math.abs(p.lng - initialLng) < 0.0001
      );
      if (match) {
        setSelectedPresetId(match.id);
      }
    }
  }, [isOpen, initialLat, initialLng, initialRadius, initialRoomName]);

  // Initialize and manage Leaflet map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Small delay to ensure modal DOM is mounted and has layout dimensions
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // 回收上一实例（createManagedMap 也会兜底，这里保留显式清理）
      const previous = mapInstanceRef.current;
      mapInstanceRef.current = null;
      destroyManagedMap(mapContainerRef.current, previous);

      const map = createManagedMap(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 18,
        zoomControl: false,
        attributionControl: true, // 合规：OSM / Esri 瓦片必须保留署名
      });

      // Tile layer
      const tileUrl =
        mapStyle === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileAttribution =
        mapStyle === 'satellite'
          ? 'Imagery &copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: tileAttribution,
      }).addTo(map);

      // Custom pulsing Beacon HTML Marker
      const beaconIcon = L.divIcon({
        className: 'custom-beacon-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing">
            <!-- Center beacon pin -->
            <div class="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-[#1877F2]/30 animate-bounce">
              <span class="text-base leading-none">🗼</span>
            </div>
            <!-- Pin pointer bottom -->
            <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#1877F2]"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([lat, lng], {
        icon: beaconIcon,
        draggable: true,
      }).addTo(map);

      // 50-meter Virtual Geofence Circle
      const circle = L.circle([lat, lng], {
        radius: radius,
        color: '#1877F2',
        weight: 2.5,
        opacity: 0.9,
        fillColor: '#1877F2',
        fillOpacity: 0.18,
        dashArray: '6, 6',
        className: 'beacon-fence-aperture-breathing',
      }).addTo(map);

      // Outer breathing ring
      const pulseCircle = L.circle([lat, lng], {
        radius: radius + 8,
        color: '#1877F2',
        weight: 1.5,
        opacity: 0.45,
        fillColor: '#1877F2',
        fillOpacity: 0.08,
        className: 'beacon-fence-aperture-breathing',
      }).addTo(map);

      // Marker drag event
      marker.on('drag', (e: any) => {
        const newPos = e.target.getLatLng();
        circle.setLatLng(newPos);
        pulseCircle.setLatLng(newPos);
        setLat(Number(newPos.lat.toFixed(5)));
        setLng(Number(newPos.lng.toFixed(5)));
      });

      marker.on('dragend', (e: any) => {
        const newPos = e.target.getLatLng();
        const nLat = Number(newPos.lat.toFixed(5));
        const nLng = Number(newPos.lng.toFixed(5));
        setLat(nLat);
        setLng(nLng);
        circle.setLatLng([nLat, nLng]);
        pulseCircle.setLatLng([nLat, nLng]);
        if (showToast) {
          showToast(`📍 信标已移至新坐标: (${nLat}, ${nLng})`);
        }
      });

      // Map click to place beacon
      map.on('click', (e: L.LeafletMouseEvent) => {
        const clickLat = Number(e.latlng.lat.toFixed(5));
        const clickLng = Number(e.latlng.lng.toFixed(5));
        setLat(clickLat);
        setLng(clickLng);
        marker.setLatLng([clickLat, clickLng]);
        circle.setLatLng([clickLat, clickLng]);
        pulseCircle.setLatLng([clickLat, clickLng]);
        map.panTo([clickLat, clickLng], { animate: true });
        if (showToast) {
          showToast(`📍 已在点击位置重设信标与 50m 围栏: (${clickLat}, ${clickLng})`);
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
      pulseCircleRef.current = pulseCircle;

      // Invalidate size to ensure crisp rendering
      map.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(timer);
      const instance = mapInstanceRef.current;
      mapInstanceRef.current = null;
      destroyManagedMap(mapContainerRef.current, instance);
    };
  }, [isOpen, mapStyle]);

  // Update circle radius or position when state changes
  useEffect(() => {
    if (circleRef.current && pulseCircleRef.current && markerRef.current && mapInstanceRef.current) {
      circleRef.current.setRadius(radius);
      pulseCircleRef.current.setRadius(radius + 8);
      circleRef.current.setLatLng([lat, lng]);
      pulseCircleRef.current.setLatLng([lat, lng]);
      markerRef.current.setLatLng([lat, lng]);
    }
  }, [lat, lng, radius]);

  // Handle Preset Click
  const handleSelectPreset = (preset: CampusLocationPreset) => {
    setSelectedPresetId(preset.id);
    setLat(preset.lat);
    setLng(preset.lng);
    setRoomName(preset.room);

    if (mapInstanceRef.current && markerRef.current && circleRef.current && pulseCircleRef.current) {
      mapInstanceRef.current.setView([preset.lat, preset.lng], 18, { animate: true });
      markerRef.current.setLatLng([preset.lat, preset.lng]);
      circleRef.current.setLatLng([preset.lat, preset.lng]);
      pulseCircleRef.current.setLatLng([preset.lat, preset.lng]);
    }

    if (showToast) {
      showToast(`🎯 已切换定位至【${preset.name}】(${preset.room})`);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 18, { animate: true });
    }
  };

  const handleConfirmAction = () => {
    onConfirm(lat, lng, radius, roomName);
    if (showToast) {
      showToast(`✅ 50m 虚拟信标围栏选点确认！坐标 (${lat}, ${lng}) 已绑定至课程`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white border border-[#E4E6EB] rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#1C1E21] animate-in zoom-in-95 duration-150"
      >
        {/* Modal Top Header (Facebook Straight-Edge Style) */}
        <div className="bg-white border-b border-[#E4E6EB] px-4 py-3 flex items-center justify-between shadow-2xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1877F2] text-white rounded-md flex items-center justify-center shadow-2xs shrink-0">
              <Radio size={16} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-[#1C1E21]">
                  信标选点与 50 米虚拟围栏预览
                </h3>
                <span className="px-1.5 py-0.2 bg-[#E7F3FF] text-[#1877F2] font-mono text-[9.5px] rounded-xs border border-[#1877F2]/30 font-bold">
                  50m 微围栏
                </span>
              </div>
              <p className="text-[10px] text-[#65676B]">
                《{courseName}》· 主讲: {teacherName} · 点击或拖拽地图确认选点
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] hover:text-[#1C1E21] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0 divide-y divide-[#E4E6EB]">
          
          {/* Map Section */}
          <div className="relative w-full h-72 sm:h-80 bg-[#E4E6EB] shrink-0 overflow-hidden">
            {/* Real Leaflet Map Container */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Top-Left Floating Info Badge */}
            <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-xs border border-[#E4E6EB] rounded-md px-2.5 py-1.5 shadow-md flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1877F2] animate-ping" />
              <div className="text-[10px]">
                <span className="font-bold text-[#1C1E21]">{roomName || '选定教学点'}</span>
                <span className="text-[#65676B] font-mono ml-1.5">
                  ({lat.toFixed(4)}, {lng.toFixed(4)})
                </span>
              </div>
            </div>

            {/* Top-Right Map Controls */}
            <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 shadow-md">
              <button
                type="button"
                onClick={handleZoomIn}
                title="放大"
                className="w-8 h-8 bg-white/95 hover:bg-white text-[#1C1E21] border border-[#E4E6EB] rounded-md flex items-center justify-center cursor-pointer shadow-2xs hover:text-[#1877F2] transition-colors"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                title="缩小"
                className="w-8 h-8 bg-white/95 hover:bg-white text-[#1C1E21] border border-[#E4E6EB] rounded-md flex items-center justify-center cursor-pointer shadow-2xs hover:text-[#1877F2] transition-colors"
              >
                <ZoomOut size={14} />
              </button>
              <button
                type="button"
                onClick={handleRecenter}
                title="复位至信标中心"
                className="w-8 h-8 bg-white/95 hover:bg-white text-[#1C1E21] border border-[#E4E6EB] rounded-md flex items-center justify-center cursor-pointer shadow-2xs hover:text-[#1877F2] transition-colors"
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                onClick={() => setMapStyle(mapStyle === 'standard' ? 'satellite' : 'standard')}
                title="切换图层 (标准/卫星)"
                className={`w-8 h-8 text-[#1C1E21] border border-[#E4E6EB] rounded-md flex items-center justify-center cursor-pointer shadow-2xs transition-colors ${
                  mapStyle === 'satellite' ? 'bg-[#1877F2] text-white border-[#1877F2]' : 'bg-white/95 hover:bg-white'
                }`}
              >
                <Layers size={13} />
              </button>
            </div>

            {/* Center 50m Fence Overlay Badge (Bottom Floating) */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-xs border border-[#1877F2] rounded-md px-3 py-1 shadow-md flex items-center gap-2 pointer-events-none">
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#1877F2]">
                <div className="w-2 h-2 rounded-full bg-[#1877F2]" />
                <span>50 米圆形虚拟围栏 (有效打卡覆盖圈)</span>
              </div>
              <span className="text-[9px] text-[#65676B] font-mono">
                R = {radius}m
              </span>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="p-3 bg-[#FAFBFD] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#1C1E21] flex items-center gap-1.5">
                <School size={12} className="text-[#1877F2]" />
                <span>常用校园教学楼与实验中心（点击快速对准并定位）：</span>
              </label>
              <span className="text-[9.5px] text-[#65676B]">
                共 {DEFAULT_CAMPUS_PRESETS.length} 处预设
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
              {DEFAULT_CAMPUS_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-md border text-left cursor-pointer transition-all flex flex-col justify-between gap-1 ${
                      isSelected
                        ? 'bg-[#E7F3FF] border-2 border-[#1877F2] text-[#1877F2] shadow-xs'
                        : 'bg-white border-[#E4E6EB] hover:border-[#1877F2]/50 text-[#1C1E21]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-[10.5px] leading-tight truncate">
                        {preset.room}
                      </span>
                      <span
                        className={`text-[8px] px-1 py-0.2 rounded-2xs font-bold shrink-0 ${
                          isSelected
                            ? 'bg-[#1877F2] text-white'
                            : 'bg-[#F0F2F5] text-[#65676B]'
                        }`}
                      >
                        {preset.tag}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#65676B] truncate font-medium">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Radius & Coordinate Confirmation Bar */}
          <div className="p-3 bg-white space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#65676B] flex items-center gap-1">
                  <MapPin size={10} className="text-[#1877F2]" />
                  <span>中心点经纬度 (Lat, Lng)</span>
                </label>
                <div className="flex items-center gap-1 font-mono text-[11px] font-bold bg-[#FAFBFD] px-2 py-1.5 border border-[#E4E6EB] rounded-md text-[#1877F2]">
                  <span>{lat.toFixed(5)}</span>
                  <span className="text-gray-400">,</span>
                  <span>{lng.toFixed(5)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#65676B] flex items-center gap-1">
                  <Building size={10} className="text-[#1877F2]" />
                  <span>教室与选点名称</span>
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="如：3-101 计算机实验室"
                  className="w-full px-2 py-1 bg-[#FAFBFD] border border-[#E4E6EB] rounded-md text-[11px] font-bold text-[#1C1E21] focus:border-[#1877F2] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#65676B] flex items-center gap-1">
                  <Radio size={10} className="text-[#1877F2]" />
                  <span>虚拟围栏半径</span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[30, 50, 100].map((r) => {
                    const isSel = radius === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRadius(r)}
                        className={`py-1 text-center rounded-md border text-[10px] font-bold cursor-pointer transition-all ${
                          isSel
                            ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-2xs'
                            : 'bg-white border-[#E4E6EB] text-[#65676B] hover:border-[#1877F2]'
                        }`}
                      >
                        {r}m{r === 50 ? ' (标准)' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Instruction Tip */}
            <div className="bg-[#E7F3FF]/70 border border-[#1877F2]/30 p-2 rounded-md flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 text-[#1877F2]">
                <Sparkles size={12} className="shrink-0" />
                <span className="font-bold">
                  选点直观确认：中心点已建立半径 {radius} 米的地理空间微围栏，学生进入此圆圈内自动触发签到打卡。
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer (Facebook Straight-Edge Action Buttons) */}
        <div className="bg-[#FAFBFD] border-t border-[#E4E6EB] px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#F0F2F5] text-[#65676B] font-bold rounded-md border border-[#E4E6EB] cursor-pointer text-xs transition-colors"
          >
            取消
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRecenter}
              className="px-3 py-2 bg-white hover:bg-[#F0F2F5] text-[#1877F2] font-bold rounded-md border border-[#1877F2]/40 cursor-pointer text-xs flex items-center gap-1 shadow-2xs transition-colors"
            >
              <RotateCcw size={12} />
              <span>复位居中</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmAction}
              className="px-5 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-md cursor-pointer text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Check size={14} className="stroke-[3]" />
              <span>确认选点并绑定 50m 围栏</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
