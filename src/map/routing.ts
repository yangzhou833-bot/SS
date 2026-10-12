/**
 * Stellar 地图架构 · 路由抽象
 *
 * 解决的问题：
 *   1. 路线计算直接绑死在一个演示服务器上（FOSSGIS OSRM demo），不可控；
 *   2. 路由失败时界面什么都不显示（"去找她没路线"）；
 *   3. 同一个起终点被反复请求。
 *
 * 做法：独立可取消请求 + 超时 + 结果缓存 + 公共服务全局限速。
 * 真实道路请求失败时抛错；直线估算只能由界面明确选择并标记。
 */

import { distanceMeters } from "./coordinates";
import type { LatLng, RouteRequest, RouteResult, TravelMode } from "./types";

export interface RouteProvider {
  id: string;
  getRoute(req: RouteRequest, signal?: AbortSignal): Promise<RouteResult>;
}

export interface OsrmProviderOptions {
  /**
   * 自建 OSRM 基地址，例如 `https://osrm.your-domain.com`
   * 或 FOSSGIS 的分模式地址 `https://routing.openstreetmap.de/routed-foot`
   */
  baseUrl: string;
  /** 路径中的 profile 段；FOSSGIS 系列固定为 driving，自建按实际填 */
  profileSegment?: string;
  timeoutMs?: number;
  retries?: number;
  cacheTtlMs?: number;
  /** 是否属于演示服务器（会在结果里标注，提醒不要用于生产） */
  demo?: boolean;
  /** Valhalla can return the same GeoJSON route shape while honoring walking/cycling costs. */
  protocol?: "osrm" | "valhalla";
}

/** 各出行方式的平均速度（m/s），仅用于降级时的耗时估算 */
const FALLBACK_SPEED: Record<TravelMode, number> = {
  walk: 1.35,
  bike: 4.2,
  drive: 8.3,
  transit: 6.0,
};

/** 直线兜底：路由不可用时也要给用户一条线和一个距离 */
export function fallbackRoute(req: RouteRequest, error?: string): RouteResult {
  const meters = distanceMeters(req.from, req.to);
  return {
    points: [req.from, req.to],
    distanceMeters: meters,
    durationSeconds: Math.round(meters / FALLBACK_SPEED[req.mode]),
    provider: "straight-line",
    degraded: true,
    cached: false,
    error,
  };
}

interface CacheEntry {
  at: number;
  value: RouteResult;
}

const cacheKey = (req: RouteRequest): string =>
  [req.from.lat, req.from.lng, req.to.lat, req.to.lng, req.mode].join("|");

const validPoint = (point: LatLng): boolean =>
  !!point && Number.isFinite(point.lat) && Number.isFinite(point.lng) &&
  Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180;

const abortError = () => new DOMException("已取消路线请求", "AbortError");
const assertNotAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) throw abortError();
};
const copyRoute = (route: RouteResult, cached = route.cached): RouteResult =>
  ({ ...route, cached, points: route.points.map(point => ({ ...point })) });

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  assertNotAborted(signal);
  return new Promise((resolve, reject) => {
    const finish = () => { signal?.removeEventListener("abort", cancel); resolve(); };
    const timer = setTimeout(finish, ms);
    const cancel = () => { clearTimeout(timer); signal?.removeEventListener("abort", cancel); reject(abortError()); };
    signal?.addEventListener("abort", cancel, { once: true });
  });
}

// 全部出行方式和 provider 实例共享发起时间，遵守 FOSSGIS 每秒最多一次请求。
let lastFossgisRequestAt = 0;
async function waitForFossgisSlot(signal: AbortSignal): Promise<void> {
  while (true) {
    assertNotAborted(signal);
    const remaining = 1000 - (Date.now() - lastFossgisRequestAt);
    if (remaining <= 0) { lastFossgisRequestAt = Date.now(); return; }
    await wait(remaining, signal);
  }
}

/** 自建 OSRM 可显式设置重试；公共演示端点不自动重试。 */
export function createOsrmProvider(options: OsrmProviderOptions): RouteProvider {
  const {
    baseUrl, profileSegment = "driving", timeoutMs = 8000,
    retries = 0, cacheTtlMs = 5 * 60 * 1000, demo = false, protocol = "osrm",
  } = options;
  const publicService = /(^|\.)openstreetmap\.de$/.test(new URL(baseUrl).hostname);
  const attempts = publicService ? 0 : Math.max(0, Math.floor(retries));
  const cache = new Map<string, CacheEntry>();

  const fetchOnce = async (req: RouteRequest, signal?: AbortSignal): Promise<RouteResult> => {
    assertNotAborted(signal);
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    const onAbort = () => controller.abort();
    signal?.addEventListener("abort", onAbort, { once: true });
    let rejectAborted!: () => void;
    const aborted = new Promise<never>((_resolve, reject) => {
      rejectAborted = () => reject(timedOut ? new Error("路线请求超时，请重试或使用外部地图") : abortError());
      controller.signal.addEventListener("abort", rejectAborted, { once: true });
    });
    try {
      const work = (async (): Promise<RouteResult> => {
        if (publicService) await waitForFossgisSlot(controller.signal);
        assertNotAborted(controller.signal);
        const coords = `${req.from.lng},${req.from.lat};${req.to.lng},${req.to.lat}`;
        const costing = req.mode === "walk" ? "pedestrian" : req.mode === "bike" ? "bicycle" : "auto";
        const payload = { locations: [{ lat: req.from.lat, lon: req.from.lng }, { lat: req.to.lat, lon: req.to.lng }], costing, format: "osrm", shape_format: "geojson", units: "kilometers" };
        const url = protocol === "valhalla"
          ? `${baseUrl.replace(/\/$/, "")}/route?json=${encodeURIComponent(JSON.stringify(payload))}`
          : `${baseUrl.replace(/\/$/, "")}/route/v1/${profileSegment}/${coords}?overview=full&geometries=geojson&steps=false`;
        if (publicService) lastFossgisRequestAt = Date.now();
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`路线服务暂时不可用（HTTP ${res.status}），请重试或使用外部地图`);
        const data = await res.json() as { code?: string; routes?: Array<{ distance?: number; duration?: number; geometry?: { type?: string; coordinates?: unknown[] } }> };
        assertNotAborted(controller.signal);
        if (data?.code === "NoRoute" || data?.code === "NoSegment") throw new Error("没有找到可通行道路，请切换出行方式或使用外部地图");
        const route = Array.isArray(data?.routes) ? data.routes[0] : null;
        const coordinates = route?.geometry?.coordinates;
        const distance = route?.distance;
        const duration = route?.duration;
        if (data?.code !== "Ok" || !Array.isArray(coordinates) || coordinates.length < 2 ||
            (route?.geometry?.type && route.geometry.type !== "LineString") ||
            !Number.isFinite(distance) || distance < 0 ||
            !Number.isFinite(duration) || duration < 0) throw new Error("路线数据无效，请重试或使用外部地图");
        const points = coordinates.map(value => {
          if (!Array.isArray(value) || value.length < 2) throw new Error("路线数据无效，请重试或使用外部地图");
          const point = { lat: value[1], lng: value[0] };
          if (!validPoint(point)) throw new Error("路线数据无效，请重试或使用外部地图");
          return point;
        });
        return {
          points, distanceMeters: distance, durationSeconds: duration,
          provider: demo ? `${protocol}-demo` : protocol, degraded: false, cached: false,
        };
      })();
      return await Promise.race([work, aborted]);
    } catch (err) {
      if (timedOut) throw new Error("路线请求超时，请重试或使用外部地图");
      assertNotAborted(signal);
      if (err instanceof TypeError || err instanceof SyntaxError) throw new Error("路线服务暂时不可用，请检查网络后重试或使用外部地图");
      throw err;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      controller.signal.removeEventListener("abort", rejectAborted);
    }
  };

  return {
    id: demo ? `${protocol}-demo` : protocol,
    async getRoute(req, signal) {
      assertNotAborted(signal);
      if (!validPoint(req?.from) || !validPoint(req?.to)) throw new Error("起点或终点坐标无效，请重新选择位置");
      if (!["walk", "bike", "drive", "transit"].includes(req.mode)) throw new Error("不支持此出行方式");
      const stableRequest = { from: { ...req.from }, to: { ...req.to }, mode: req.mode };
      const key = cacheKey(stableRequest);
      for (const [oldKey, entry] of cache) if (Date.now() - entry.at >= cacheTtlMs) cache.delete(oldKey);
      const hit = cache.get(key);
      if (hit) return copyRoute(hit.value, true);
      for (let attempt = 0; ; attempt += 1) {
        try {
          const result = await fetchOnce(stableRequest, signal);
          assertNotAborted(signal);
          if (cache.size >= 256) cache.delete(cache.keys().next().value!);
          cache.set(key, { at: Date.now(), value: copyRoute(result) });
          return result;
        } catch (err) {
          assertNotAborted(signal);
          if (attempt >= attempts) throw err;
          await wait(400 * (attempt + 1), signal);
        }
      }
    },
  };
}

/** FOSSGIS 仅用于原型；没有公交路由，不将其伪装成驾车路线。 */
export function createFossgisDemoProvider(mode: TravelMode = "walk"): RouteProvider {
  if (mode === "transit") throw new Error("当前路线服务不支持公交导航，请使用外部地图");
  const prefix = mode === "bike" ? "routed-bike" : mode === "walk" ? "routed-foot" : "routed-car";
  const provider = createOsrmProvider({
    baseUrl: `https://routing.openstreetmap.de/${prefix}`, profileSegment: "driving",
    demo: true, timeoutMs: 8000, retries: 0,
  });
  return {
    id: provider.id,
    async getRoute(req, signal) {
      assertNotAborted(signal);
      if (req.mode !== mode) throw new Error("出行方式与路线服务不匹配，请重新选择");
      return provider.getRoute(req, signal);
    },
  };
}

/** A second real-road service, retaining the requested walk/bike/drive mode. */
export function createValhallaDemoProvider(mode: TravelMode = "walk"): RouteProvider {
  if (mode === "transit") throw new Error("当前路线服务不支持公交导航，请使用外部地图");
  const provider = createOsrmProvider({
    baseUrl: "https://valhalla1.openstreetmap.de", protocol: "valhalla",
    demo: true, timeoutMs: 16000,
  });
  return {
    id: provider.id,
    async getRoute(req, signal) {
      if (req.mode !== mode) throw new Error("出行方式与路线服务不匹配，请重新选择");
      return provider.getRoute(req, signal);
    },
  };
}

const roadProviders = new Map<TravelMode, RouteProvider>();
const backupRoadProviders = new Map<TravelMode, RouteProvider>();
/** 所有业务入口共享按出行方式分开的缓存与公共服务限速。 */
export async function loadRoadRoute(req: RouteRequest, signal?: AbortSignal): Promise<RouteResult> {
  let provider = roadProviders.get(req.mode);
  if (!provider) { provider = createValhallaDemoProvider(req.mode); roadProviders.set(req.mode, provider); }
  try {
    return await provider.getRoute(req, signal);
  } catch (error) {
    assertNotAborted(signal);
    let backup = backupRoadProviders.get(req.mode);
    if (!backup) { backup = createFossgisDemoProvider(req.mode); backupRoadProviders.set(req.mode, backup); }
    return backup.getRoute(req, signal);
  }
}

/** 手动指定 GeoJSON 起终点算直线（用于离线/无网络时的地图展示） */
export function createStaticProvider(): RouteProvider {
  return {
    id: "straight-line",
    async getRoute(req, signal) {
      assertNotAborted(signal);
      if (!validPoint(req?.from) || !validPoint(req?.to)) throw new Error("起点或终点坐标无效，请重新选择位置");
      return fallbackRoute(req);
    },
  };
}
