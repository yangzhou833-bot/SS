/**
 * Stellar 地图架构 · 坐标系
 *
 * 中国大陆存在三套坐标系，混用会产生 50–500 米偏移：
 *   WGS-84  GPS / OSM / Leaflet / Google 国际版   ← 本架构内部统一用它
 *   GCJ-02  高德 / 腾讯（"火星坐标"）
 *    BD-09   百度
 *
 * 规则：**内部一律 WGS-84，只在调用外部地图（高德/百度）的那一刻转换。**
 */

import type { LatLng } from "./types";

const PI = Math.PI;
const A = 6378245.0; // 克拉索夫斯基椭球长半轴
const EE = 0.00669342162296594323; // 偏心率平方
const X_PI = (PI * 3000.0) / 180.0;

/** 中国大陆粗略范围之外不做偏移（港澳台与境外本身就用 WGS-84）。 */
export function outOfChina(lat: number, lng: number): boolean {
  return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
}

function transformLat(x: number, y: number): number {
  let ret =
    -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}

/** WGS-84 → GCJ-02 */
export function wgs84ToGcj02(lat: number, lng: number): LatLng {
  if (outOfChina(lat, lng)) return { lat, lng };
  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return { lat: lat + dLat, lng: lng + dLng };
}

/**
 * GCJ-02 → WGS-84
 * 用迭代逼近（普通的一次性相减会有米级误差，累积到路线/导航上会明显）。
 */
export function gcj02ToWgs84(lat: number, lng: number): LatLng {
  if (outOfChina(lat, lng)) return { lat, lng };
  let wLat = lat;
  let wLng = lng;
  for (let i = 0; i < 6; i += 1) {
    const guess = wgs84ToGcj02(wLat, wLng);
    wLat += lat - guess.lat;
    wLng += lng - guess.lng;
  }
  return { lat: wLat, lng: wLng };
}

/** GCJ-02 → BD-09 */
export function gcj02ToBd09(lat: number, lng: number): LatLng {
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI);
  return { lat: z * Math.sin(theta) + 0.006, lng: z * Math.cos(theta) + 0.0065 };
}

/** BD-09 → GCJ-02 */
export function bd09ToGcj02(lat: number, lng: number): LatLng {
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
  return { lat: z * Math.sin(theta), lng: z * Math.cos(theta) };
}

export function wgs84ToBd09(lat: number, lng: number): LatLng {
  const g = wgs84ToGcj02(lat, lng);
  return gcj02ToBd09(g.lat, g.lng);
}

export function bd09ToWgs84(lat: number, lng: number): LatLng {
  const g = bd09ToGcj02(lat, lng);
  return gcj02ToWgs84(g.lat, g.lng);
}

/** 便捷对象版 */
export const toGcj02 = (p: LatLng): LatLng => wgs84ToGcj02(p.lat, p.lng);
export const toBd09 = (p: LatLng): LatLng => wgs84ToBd09(p.lat, p.lng);
export const fromGcj02 = (p: LatLng): LatLng => gcj02ToWgs84(p.lat, p.lng);

/** Haversine 距离（米） */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371008.8;
  const dLat = ((b.lat - a.lat) * PI) / 180;
  const dLng = ((b.lng - a.lng) * PI) / 180;
  const lat1 = (a.lat * PI) / 180;
  const lat2 = (b.lat * PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * 自检：WGS-84 → GCJ-02 → WGS-84 的往返误差。
 * 正常应小于 1 米（迭代 6 次）。可在开发环境启动时调用，误差异常说明算法被改坏。
 */
export function coordinateRoundTripError(p: LatLng): number {
  const g = wgs84ToGcj02(p.lat, p.lng);
  const back = gcj02ToWgs84(g.lat, g.lng);
  return distanceMeters(p, back);
}
