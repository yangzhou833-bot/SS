/**
 * Stellar 地图架构 · 瓦片健康监测与自动降级
 *
 * 解决的问题：
 *   1. 底图服务偶发失败（限流/被墙/证书问题）时，界面出现大片空白瓦片；
 *   2. 用户在"某张地图上永远加载不出来"，但代码里没有任何兜底。
 *
 * 做法：监听 tileerror 计数 → 超阈值则沿 fallbackChain 降级 → 切换前先探测新源是否可用。
 * 这个模块不依赖 React，也不依赖 Leaflet 之外的东西，可单独测试。
 */

import type { LeafletEvent, Map as LeafletMap, TileLayer } from "leaflet";
import { fallbackChain, getBasemap } from "./basemaps";
import type { BasemapHealth, BasemapId } from "./types";

export interface TileHealthOptions {
  /** 滚动统计窗口（毫秒），默认 8000 */
  windowMs?: number;
  /** 窗口内失败数达到该值即降级，默认 6 */
  failureThreshold?: number;
  /** 两次降级之间的最小间隔（毫秒），默认 15000，避免网络抖动导致反复切换 */
  cooldownMs?: number;
  /** 连续成功多少次才考虑恢复，默认 20 */
  successThresholdForRecovery?: number;
  /** 恢复冷却（毫秒），默认 60000 */
  recoveryCooldownMs?: number;
  onHealthChange?: (health: BasemapHealth) => void;
}

export interface TileHealthMonitor {
  attach(layer: TileLayer): void;
  detach(): void;
  markLoaded(): void;
  markFailed(message?: string): void;
  /** 主动降级（例如瓦片长时间未返回的超时信号） */
  degrade(reason?: string): BasemapId | null;
  snapshot(): BasemapHealth;
  dispose(): void;
}

/** 纯函数：给定失败时间戳，判断是否应当降级。便于单测。 */
export function shouldDegrade(
  failures: number[],
  now: number,
  windowMs: number,
  threshold: number,
): boolean {
  const recent = failures.filter((t) => now - t <= windowMs);
  return recent.length >= threshold;
}

/** 把 Leaflet 的瓦片模板变成一张真实可请求的瓦片地址 */
export function sampleTileUrl(
  template: string,
  z: number,
  x: number,
  y: number,
  subdomains?: string,
): string {
  const s = subdomains && subdomains.length > 0 ? subdomains[0] : "a";
  return template
    .replace("{s}", s)
    .replace("{z}", String(z))
    .replace("{x}", String(x))
    .replace("{y}", String(y))
    .replace("{r}", "");
}

/**
 * 探测一张瓦片是否真的可取回。用于"切换前先验证"，避免从一个坏源切到另一个坏源。
 * 浏览器环境用 Image()，非浏览器环境（SSR/测试）直接返回 true。
 */
export function probeTile(url: string, timeoutMs = 4000): Promise<boolean> {
  if (typeof Image === "undefined") return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const img = new Image();
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      finish(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      finish(false);
    };
    // 不要设 no-referrer：OSM 等源要求带 Referer 才允许访问
    img.src = url;
  });
}

export function createTileHealthMonitor(
  requested: BasemapId,
  options: TileHealthOptions = {},
): TileHealthMonitor {
  const {
    windowMs = 8000,
    failureThreshold = 6,
    cooldownMs = 15000,
    successThresholdForRecovery = 20,
    recoveryCooldownMs = 60000,
    onHealthChange,
  } = options;

  const chain = fallbackChain(requested);
  let index = 0;
  let failures: number[] = [];
  let successes = 0;
  let lastDegradeAt = 0;
  let lastErrorAt: number | undefined;
  let lastErrorMessage: string | undefined;
  let attached: TileLayer | null = null;

  const active = (): BasemapId => chain[Math.min(index, chain.length - 1)] ?? "blank";

  const snapshot = (): BasemapHealth => ({
    requested,
    active: active(),
    degraded: active() !== requested,
    consecutiveFailures: failures.length,
    lastErrorAt,
    lastErrorMessage,
  });

  const notify = () => {
    onHealthChange?.(snapshot());
  };

  const degrade = (reason?: string): BasemapId | null => {
    const now = Date.now();
    if (now - lastDegradeAt < cooldownMs) return null;
    if (index >= chain.length - 1) return null; // 已经在最后一环（blank）
    index += 1;
    lastDegradeAt = now;
    failures = [];
    successes = 0;
    if (reason) lastErrorMessage = reason;
    lastErrorAt = now;
    notify();
    return active();
  };

  const markFailed = (message?: string) => {
    const now = Date.now();
    failures.push(now);
    failures = failures.filter((t) => now - t <= windowMs);
    lastErrorAt = now;
    if (message) lastErrorMessage = message;
    if (shouldDegrade(failures, now, windowMs, failureThreshold)) degrade("瓦片连续加载失败");
  };

  const markLoaded = () => {
    successes += 1;
    // 保守恢复：只有在长时间稳定后才回到首选源，避免来回跳
    if (index > 0 && successes >= successThresholdForRecovery) {
      const now = Date.now();
      if (now - lastDegradeAt > recoveryCooldownMs) {
        index -= 1;
        successes = 0;
        lastDegradeAt = now;
        notify();
      }
    }
  };

  return {
    attach(layer: TileLayer) {
      attached = layer;
      layer.on("tileerror", (e: LeafletEvent) => {
        const err = (e as unknown as { error?: Error }).error;
        markFailed(err?.message ?? "tileerror");
      });
      layer.on("tileload", () => markLoaded());
    },
    detach() {
      if (!attached) return;
      attached.off("tileerror");
      attached.off("tileload");
      attached = null;
    },
    markLoaded,
    markFailed,
    degrade,
    snapshot,
    dispose() {
      if (attached) {
        attached.off("tileerror");
        attached.off("tileload");
        attached = null;
      }
      failures = [];
      onHealthChange?.(snapshot());
    },
  };
}

/** 便捷：主动探测某个底图是否可用（配合 monitor.degrade 使用） */
export async function probeBasemap(
  id: BasemapId,
  z = 12,
  x = 3372,
  y = 1546,
): Promise<boolean> {
  const spec = getBasemap(id);
  if (spec.kind === "vector") return false;
  const url = sampleTileUrl(spec.url, z, x, y, spec.subdomains);
  return probeTile(url);
}


export interface TileFallbackBinding {
  /** 当前实际生效的底图 */
  current(): BasemapId;
  dispose(): void;
}

/**
 * 把「组件已经创建好的那张瓦片图层」接到降级链上。
 *
 * 与 useLeafletMap 的区别：这里不接管图层创建与外观（例如组件靠 CSS class 实现深色/简洁风格），
 * 只在瓦片连续失败时就地换 URL —— 不重建图层、不闪白、不丢事件、不改外观。
 */
export function bindTileFallback(
  map: LeafletMap,
  layer: TileLayer,
  requested: BasemapId,
  options: { onFallback?: (info: { from: BasemapId; to: BasemapId; reason?: string }) => void } = {},
): TileFallbackBinding {
  let activeId: BasemapId = requested;

  const monitor = createTileHealthMonitor(requested, {
    onHealthChange: (health) => {
      if (health.active === activeId) return;
      const from = activeId;
      // 切换前先探测目标源，避免从一个坏源换到另一个坏源
      void probeBasemap(health.active).then((ok) => {
        if (!ok) return;
        const spec = getBasemap(health.active);
        layer.setUrl(spec.url, false);
        layer.options.maxZoom = spec.maxZoom;
        if (spec.maxNativeZoom) layer.options.maxNativeZoom = spec.maxNativeZoom;

        const control = map.attributionControl;
        if (control) {
          control.removeAttribution(getBasemap(from).attribution);
          control.addAttribution(spec.attribution);
        }
        activeId = health.active;
        options.onFallback?.({ from, to: health.active, reason: health.lastErrorMessage });
      });
    },
  });

  monitor.attach(layer);
  return {
    current: () => activeId,
    dispose: () => monitor.dispose(),
  };
}
