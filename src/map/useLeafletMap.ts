/**
 * Stellar 地图架构 · 地图实例生命周期 hook
 *
 * 解决的问题：
 *   1. 每个页面各写一遍 L.map()，重复初始化 → "Map container is already initialized" 崩溃；
 *   2. 忘记 map.remove() → 内存泄漏 + 事件重复绑定（FamilyCareMonitorPage 现在就缺这一步）；
 *   3. 切底图用"删图层再新建"，会闪白、丢事件；
 *   4. 容器尺寸变化后 Leaflet 算错视口，出现灰块/半屏。
 *
 * 一个容器 = 一个实例，创建与销毁都收在这里。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import * as L from "leaflet";
import { BLANK_TILE, getBasemap, resolveStyle } from "./basemaps";
import { createManagedMap, destroyManagedMap } from "./managedMap";
import { createTileHealthMonitor, probeBasemap } from "./tileHealth";
import type { TileHealthMonitor } from "./tileHealth";
import type { BasemapHealth, BasemapId, LatLng, MapStyleMode } from "./types";

export interface UseLeafletMapOptions {
  center: LatLng;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  /** 初始风格（受控）；也可用返回值里的 setStyle 命令式切换 */
  style?: MapStyleMode;
  /** 传入则把用户最后一次视野记到 localStorage，下次回来不再跳回默认中心 */
  persistKey?: string;
  zoomControl?: boolean;
  onHealthChange?: (health: BasemapHealth) => void;
  onViewportChanged?: (viewport: { center: LatLng; zoom: number }) => void;
}

export interface UseLeafletMapResult {
  containerRef: RefObject<HTMLDivElement | null>;
  map: L.Map | null;
  ready: boolean;
  health: BasemapHealth | null;
  activeBasemap: BasemapId | null;
  style: MapStyleMode;
  setStyle: (style: MapStyleMode) => void;
  setView: (center: LatLng, zoom?: number) => void;
  invalidate: () => void;
  error: string | null;
}

function readPersisted(key?: string): { center: LatLng; zoom: number } | null {
  if (!key || typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { center?: LatLng; zoom?: number };
    if (parsed?.center && typeof parsed.center.lat === "number") {
      return { center: parsed.center, zoom: typeof parsed.zoom === "number" ? parsed.zoom : 15 };
    }
  } catch {
    /* 忽略损坏数据 */
  }
  return null;
}

function writePersisted(key: string | undefined, value: { center: LatLng; zoom: number }): void {
  if (!key || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 配额满等情况忽略 */
  }
}

export function useLeafletMap(options: UseLeafletMapOptions): UseLeafletMapResult {
  const {
    center,
    zoom = 15,
    minZoom = 3,
    maxZoom = 20,
    style: styleProp = "standard",
    persistKey,
    zoomControl = false,
    onHealthChange,
    onViewportChanged,
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.TileLayer | null>(null);
  const monitorRef = useRef<TileHealthMonitor | null>(null);
  const attributionRef = useRef<string | null>(null);
  const activeIdRef = useRef<BasemapId | null>(null);
  const callbacksRef = useRef({ onHealthChange, onViewportChanged });
  callbacksRef.current = { onHealthChange, onViewportChanged };

  const [ready, setReady] = useState(false);
  const [styleState, setStyleState] = useState<MapStyleMode>(styleProp);
  const [health, setHealth] = useState<BasemapHealth | null>(null);
  const [activeBasemap, setActiveBasemap] = useState<BasemapId | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 外部（受控 props）变化时同步内部状态
  useEffect(() => {
    setStyleState(styleProp);
  }, [styleProp]);

  /** 切换/应用底图：只改 URL 与署名，不重建图层（避免闪白与事件丢失） */
  const applyBasemap = useCallback((id: BasemapId) => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    const spec = getBasemap(id);
    layer.setUrl(spec.url, false);
    layer.options.maxZoom = spec.maxZoom;
    if (spec.maxNativeZoom) layer.options.maxNativeZoom = spec.maxNativeZoom;

    const control = map.attributionControl;
    if (control) {
      if (attributionRef.current) control.removeAttribution(attributionRef.current);
      control.addAttribution(spec.attribution);
    }
    attributionRef.current = spec.attribution;
    activeIdRef.current = id;
    setActiveBasemap(id);
  }, []);

  /** 健康监测：连续失败 → 沿降级链切换（切换前先探测新源，避免越换越坏） */
  const bindHealthMonitor = useCallback(
    (requested: BasemapId, layer: L.TileLayer) => {
      monitorRef.current?.dispose();
      const monitor = createTileHealthMonitor(requested, {
        onHealthChange: (h) => {
          setHealth(h);
          callbacksRef.current.onHealthChange?.(h);
          if (h.active !== activeIdRef.current) {
            void probeBasemap(h.active).then((ok) => {
              if (ok) applyBasemap(h.active);
            });
          }
        },
      });
      monitor.attach(layer);
      monitorRef.current = monitor;
    },
    [applyBasemap],
  );

  // ---- 创建与销毁：一个容器只初始化一次 ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const persisted = readPersisted(persistKey);
    const initialCenter = persisted?.center ?? center;
    const initialZoom = persisted?.zoom ?? zoom;

    let map: L.Map;
    try {
      map = createManagedMap(el, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom: initialZoom,
        minZoom,
        maxZoom,
        zoomControl,
        attributionControl: true, // 合规：永远保留署名
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "地图初始化失败");
      return undefined;
    }

    mapRef.current = map;

    const resolved = resolveStyle(styleProp);
    const spec = getBasemap(resolved);
    const layer = L.tileLayer(spec.url, {
      attribution: spec.attribution,
      subdomains: spec.subdomains ?? "abc",
      maxZoom: spec.maxZoom,
      maxNativeZoom: spec.maxNativeZoom,
      errorTileUrl: BLANK_TILE, // 单张瓦片失败不留破图
      crossOrigin: true,
    });
    layer.addTo(map);
    layerRef.current = layer;
    attributionRef.current = spec.attribution;
    activeIdRef.current = resolved;
    setActiveBasemap(resolved);
    bindHealthMonitor(resolved, layer);

    const persistViewport = () => {
      const c = map.getCenter();
      const value = { center: { lat: c.lat, lng: c.lng }, zoom: map.getZoom() };
      writePersisted(persistKey, value);
      callbacksRef.current.onViewportChanged?.(value);
    };
    map.on("moveend", persistViewport);

    // 容器尺寸变化（抽屉展开、旋转、分屏）后必须让 Leaflet 重新计算
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => map.invalidateSize(false), 120);
          })
        : null;
    observer?.observe(el);

    setReady(true);
    setError(null);

    return () => {
      observer?.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      map.off("moveend", persistViewport);
      monitorRef.current?.dispose();
      monitorRef.current = null;
      layerRef.current = null;
      attributionRef.current = null;
      activeIdRef.current = null;
      destroyManagedMap(el, map);
      mapRef.current = null;
      setReady(false);
    };
    // 只创建一次；center/zoom/style 的后续变化由下面的 effect 处理
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 风格切换（含降级后的重新绑定）----
  useEffect(() => {
    if (!ready) return;
    const layer = layerRef.current;
    if (!layer) return;
    const next = resolveStyle(styleState);
    if (next === activeIdRef.current) return;
    applyBasemap(next);
    bindHealthMonitor(next, layer);
  }, [styleState, ready, applyBasemap, bindHealthMonitor]);

  const setStyle = useCallback((next: MapStyleMode) => {
    setStyleState(next);
  }, []);

  const setView = useCallback((next: LatLng, nextZoom?: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([next.lat, next.lng], nextZoom ?? map.getZoom(), { animate: true });
  }, []);

  const invalidate = useCallback(() => {
    mapRef.current?.invalidateSize(false);
  }, []);

  return {
    containerRef,
    map: mapRef.current,
    ready,
    health,
    activeBasemap,
    style: styleState,
    setStyle,
    setView,
    invalidate,
    error,
  };
}
