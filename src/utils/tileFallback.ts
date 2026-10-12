import type { Map as LeafletMap, TileLayer } from 'leaflet';

/** 不联网的占位瓦片（1×1 透明 PNG 的 data URI），保证"单张瓦片失败不留破图" */
export const BLANK_TILE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

interface FallbackSource {
  id: string;
  url: string;
  attribution: string;
  subdomains?: string;
  maxZoom: number;
}

/** 降级链：先探测、再切换；最后一环是不联网的占位瓦片 */
const FALLBACK_CHAIN: FallbackSource[] = [
  {
    id: 'carto-voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  },
  { id: 'blank', url: BLANK_TILE, attribution: '', maxZoom: 20 },
];

export interface TileFallbackBinding {
  current(): string;
  dispose(): void;
}

/**
 * 把组件自己管理的瓦片图层接到降级链上。
 * 用 layer.setUrl() 就地换源：不重建图层、不闪白、不丢事件、不改外观。
 */
export function bindTileFallback(
  map: LeafletMap,
  layer: TileLayer,
  sourceId = 'primary',
  options: { windowMs?: number; failureThreshold?: number; cooldownMs?: number } = {},
): TileFallbackBinding {
  const windowMs = options.windowMs ?? 8000;
  const failureThreshold = options.failureThreshold ?? 6;
  const cooldownMs = options.cooldownMs ?? 15000;

  let chainIndex = -1;
  let activeId = sourceId;
  let failures: number[] = [];
  let lastSwitchAt = 0;
  let attribution: string | null = layer.options.attribution ?? null;

  const applySource = (src: FallbackSource) => {
    layer.setUrl(src.url, false);
    layer.options.maxZoom = src.maxZoom;
    const control = map.attributionControl;
    if (control) {
      if (attribution) control.removeAttribution(attribution);
      if (src.attribution) control.addAttribution(src.attribution);
    }
    attribution = src.attribution || null;
    activeId = src.id;
  };

  const probe = (url: string): Promise<boolean> => {
    if (typeof Image === 'undefined') return Promise.resolve(true);
    const sample = url
      .replace('{s}', 'a')
      .replace('{z}', '12')
      .replace('{x}', '3372')
      .replace('{y}', '1546')
      .replace('{r}', '');
    if (sample.startsWith('data:')) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      let settled = false;
      const img = new Image();
      const done = (ok: boolean) => {
        if (settled) return;
        settled = true;
        img.onload = null;
        img.onerror = null;
        resolve(ok);
      };
      const timer = setTimeout(() => done(false), 4000);
      img.onload = () => { clearTimeout(timer); done(true); };
      img.onerror = () => { clearTimeout(timer); done(false); };
      img.src = sample; // 不要设 no-referrer：OSM 等源要求带 Referer
    });
  };

  const onError = () => {
    const now = Date.now();
    failures.push(now);
    failures = failures.filter((t) => now - t <= windowMs);
    if (failures.length < failureThreshold) return;
    if (now - lastSwitchAt < cooldownMs) return;
    if (chainIndex >= FALLBACK_CHAIN.length - 1) return;
    chainIndex += 1;
    const next = FALLBACK_CHAIN[chainIndex];
    failures = [];
    lastSwitchAt = now;
    void probe(next.url).then((ok) => { if (ok) applySource(next); });
  };

  const onLoad = () => { if (failures.length) failures = []; };

  layer.on('tileerror', onError);
  layer.on('tileload', onLoad);

  return {
    current: () => activeId,
    dispose: () => {
      layer.off('tileerror', onError);
      layer.off('tileload', onLoad);
      failures = [];
    },
  };
}
