export type RouteTravelMode = 'walking' | 'cycling' | 'driving';

export interface RouteResult {
  points: [number, number][]; // [lat, lng]
  distanceKm: number;
  minutes: number;
  estimated: boolean;
}

const routeCache = new Map<string, { at: number; value: RouteResult }>();
const routeInflight = new Map<string, Promise<RouteResult>>();

const FOSSGIS_SERVICE: Record<RouteTravelMode, string> = {
  walking: 'routed-foot', cycling: 'routed-bike', driving: 'routed-car',
};
const SPEED_KMH: Record<RouteTravelMode, number> = { walking: 4.8, cycling: 15, driving: 30 };

/** 直线兜底：服务不可用时也要给出距离与耗时，绝不让 UI 空着 */
function estimateRoute(origin: {lat:number;lng:number}, target: {lat:number;lng:number}, mode: RouteTravelMode): RouteResult {
  const R = 6371008.8;
  const dLat = ((target.lat - origin.lat) * Math.PI) / 180;
  const dLng = ((target.lng - origin.lng) * Math.PI) / 180;
  const lat1 = (origin.lat * Math.PI) / 180;
  const lat2 = (target.lat * Math.PI) / 180;
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  const straightKm = (2 * R * Math.asin(Math.min(1, Math.sqrt(h)))) / 1000;
  const distanceKm = Math.round(straightKm * 1.25 * 10) / 10; // 1.25 为绕行系数
  return {
    points: [[origin.lat, origin.lng], [target.lat, target.lng]],
    distanceKm,
    minutes: Math.max(1, Math.ceil((distanceKm / SPEED_KMH[mode]) * 60)),
    estimated: true,
  };
}

/**
 * 取真实道路路线。自带 8 秒超时、2 次重试、相同请求合并与 5 分钟缓存；
 * 任何失败都不抛错，而是返回 estimated=true 的直线估算。
 * 上线前把自建 OSRM 地址填进 VITE_OSRM_BASE_URL 即可，无需改动调用方。
 */
export async function loadRoadRoute(
  origin: {lat:number;lng:number},
  target: {lat:number;lng:number},
  mode: RouteTravelMode,
  signal?: AbortSignal,
): Promise<RouteResult> {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const base = env?.VITE_OSRM_BASE_URL
    ? env.VITE_OSRM_BASE_URL.replace(/\/$/, '')
    : `https://routing.openstreetmap.de/${FOSSGIS_SERVICE[mode]}`;
  const url = `${base}/route/v1/driving/${origin.lng},${origin.lat};${target.lng},${target.lat}?overview=full&geometries=geojson`;

  const cacheKey = `${origin.lat.toFixed(5)},${origin.lng.toFixed(5)};${target.lat.toFixed(5)},${target.lng.toFixed(5)};${mode}`;
  const cached = routeCache.get(cacheKey);
  if (cached && Date.now() - cached.at < 5 * 60 * 1000) return cached.value;
  const inflight = routeInflight.get(cacheKey);
  if (inflight) return inflight;

  const task = (async (): Promise<RouteResult> => {
    for (let attempt = 0; attempt <= 2; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const onAbort = () => controller.abort();
      signal?.addEventListener('abort', onAbort, { once: true });
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const route = data?.routes?.[0];
        const coords: [number, number][] = (route?.geometry?.coordinates ?? []).map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
        );
        if (!coords || coords.length < 2) throw new Error('no geometry');
        const value: RouteResult = {
          points: coords,
          distanceKm: Math.round((route.distance ?? 0) / 100) / 10,
          minutes: Math.max(1, Math.ceil((route.duration ?? 0) / 60)),
          estimated: false,
        };
        routeCache.set(cacheKey, { at: Date.now(), value });
        return value;
      } catch {
        if (signal?.aborted) break; // 用户取消：不再重试
        if (attempt < 2) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
      }
    }
    return estimateRoute(origin, target, mode);
  })();

  routeInflight.set(cacheKey, task);
  try { return await task; } finally { routeInflight.delete(cacheKey); }
}
