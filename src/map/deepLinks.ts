/**
 * Stellar 地图架构 · 跳转外部地图的深链
 *
 * 解决的问题（现有代码的真实缺陷）：
 *   内部地图用 WGS-84（OSM），但跳高德/百度时把同一组坐标直接拼进 URL，
 *   而高德要 GCJ-02、百度要 BD-09 —— 起点终点都会偏移 50~500 米。
 *
 * 规则：这里统一做转换，调用方永远只传 WGS-84。
 */

import { toBd09, toGcj02 } from "./coordinates";
import type { ExternalNavTarget, LatLng, TravelMode } from "./types";

export interface NavigationLinkOptions {
  /** 起点（WGS-84）；缺省时用"我的位置" */
  from?: LatLng;
  /** 终点（WGS-84），必填 */
  to: LatLng;
  /** 终点名称，用于外部地图展示 */
  label?: string;
  mode?: TravelMode;
}

const AMAP_MODE: Record<TravelMode, string> = {
  walk: "walk",
  drive: "car",
  bike: "ride",
  transit: "bus",
};
const BAIDU_MODE: Record<TravelMode, string> = {
  walk: "walking",
  drive: "driving",
  bike: "riding",
  transit: "transit",
};
const GOOGLE_MODE: Record<TravelMode, string> = {
  walk: "walking",
  drive: "driving",
  bike: "bicycling",
  transit: "transit",
};

/** 各目标平台使用的坐标系，导出出来便于测试与文档说明 */
export const NAV_DATUM: Record<ExternalNavTarget, "WGS-84" | "GCJ-02" | "BD-09"> = {
  amap: "GCJ-02",
  baidu: "BD-09",
  google: "WGS-84",
  apple: "WGS-84",
};

const fixed = (n: number, digits = 6): string => n.toFixed(digits);

/**
 * 生成跳转外部地图的 URL。内部一律传 WGS-84，本函数负责按目标平台转换。
 */
export function buildNavigationUrl(
  target: ExternalNavTarget,
  options: NavigationLinkOptions,
): string {
  const { from, to, label = "目的地", mode = "walk" } = options;

  switch (target) {
    case "amap": {
      // 高德：GCJ-02，顺序为 lng,lat
      const gTo = toGcj02(to);
      const gFrom = from ? toGcj02(from) : null;
      const fromPart = gFrom
        ? `${fixed(gFrom.lng)},${fixed(gFrom.lat)},我的位置`
        : "我的位置";
      return (
        `https://uri.amap.com/navigation?from=${fromPart}` +
        `&to=${fixed(gTo.lng)},${fixed(gTo.lat)},${encodeURIComponent(label)}` +
        `&mode=${AMAP_MODE[mode]}&callnative=1`
      );
    }
    case "baidu": {
      // 百度：BD-09，顺序为 lat,lng
      const bTo = toBd09(to);
      const bFrom = from ? toBd09(from) : null;
      const originPart = bFrom
        ? `latlng:${fixed(bFrom.lat)},${fixed(bFrom.lng)}|name:我的位置`
        : "name:我的位置";
      return (
        `https://api.map.baidu.com/direction?origin=${originPart}` +
        `&destination=latlng:${fixed(bTo.lat)},${fixed(bTo.lng)}|name:${encodeURIComponent(label)}` +
        `&mode=${BAIDU_MODE[mode]}&output=html&src=stellar`
      );
    }
    case "apple": {
      // Legacy Apple links have no cycling flag; preserve cycling through Google Maps.
      if (mode === "bike") return buildNavigationUrl("google", options);
      // Apple Maps：WGS-84
      const saddr = from ? `${fixed(from.lat)},${fixed(from.lng)}` : "";
      return (
        `https://maps.apple.com/?saddr=${saddr}` +
        `&daddr=${fixed(to.lat)},${fixed(to.lng)}&dirflg=${mode === "drive" ? "d" : "w"}`
      );
    }
    case "google":
    default: {
      // Google Maps：WGS-84
      const origin = from ? `${fixed(from.lat)},${fixed(from.lng)}` : "";
      return (
        `https://www.google.com/maps/dir/?api=1&origin=${origin}` +
        `&destination=${fixed(to.lat)},${fixed(to.lng)}&travelmode=${GOOGLE_MODE[mode]}`
      );
    }
  }
}

export interface NavEnvironment {
  isIOS?: boolean;
  isAndroid?: boolean;
  /** 用户/设备是否在中国大陆 */
  isChina?: boolean;
}

/**
 * 按运行环境挑选最合适的外部地图。
 * 逻辑：iOS → Apple；Android 或中国区 → 高德；其余 → Google。
 */
export function pickNavigationTarget(env: NavEnvironment): ExternalNavTarget {
  if (env.isAndroid) return "amap";
  if (env.isIOS) return env.isChina ? "amap" : "apple";
  return env.isChina ? "amap" : "google";
}

/** 浏览器环境探测（供 UI 层直接调用） */
export function detectNavEnvironment(): NavEnvironment {
  if (typeof navigator === "undefined") return {};
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  let isChina = false;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    const lang = navigator.language ?? "";
    isChina = tz === "Asia/Shanghai" || tz === "Asia/Urumqi" || /^zh-CN/i.test(lang);
  } catch {
    isChina = false;
  }
  return { isIOS, isAndroid, isChina };
}
