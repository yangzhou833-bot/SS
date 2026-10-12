/**
 * Stellar 地图架构 · 底图注册表
 *
 * 全应用只在这里出现瓦片地址。组件只说"我要 standard/dark"，不再拼 URL。
 * 每个底图必须带 attribution（合规）与 fallback（稳定性）。
 */

import type { BasemapId, BasemapSpec, MapStyleMode } from "./types";

const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const CARTO_ATTR = `${OSM_ATTR} &copy; <a href="https://carto.com/attributions">CARTO</a>`;
const ESRI_ATTR =
  'Imagery &copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics';

const tileEnv = (import.meta as {env?:Record<string,string|undefined>}).env;

/** 纯色占位瓦片（data URI，不走网络）—— 所有降级链的最后一环。 */
const BLANK_TILE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export const BASEMAPS: Record<BasemapId, BasemapSpec> = {
  osm: {
    id: "osm",
    label: "OpenStreetMap 标准",
    kind: "raster",
    url: tileEnv?.VITE_TILE_URL_OVERRIDE || "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: tileEnv?.VITE_TILE_ATTRIBUTION || OSM_ATTR,
    maxZoom: 19,
    fallback: ["carto-voyager", "blank"],
    suits: ["standard"],
  },

  "carto-voyager": {
    id: "carto-voyager",
    label: "CARTO Voyager",
    kind: "raster",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: CARTO_ATTR,
    subdomains: "abcd",
    maxZoom: 20,
    maxNativeZoom: 19,
    fallback: ["osm", "blank"],
    suits: ["standard", "minimal"],
  },

  "carto-dark": {
    id: "carto-dark",
    label: "CARTO Dark Matter",
    kind: "raster",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: CARTO_ATTR,
    subdomains: "abcd",
    maxZoom: 20,
    maxNativeZoom: 19,
    dark: true,
    fallback: ["carto-voyager", "osm", "blank"],
    suits: ["dark"],
  },

  "esri-satellite": {
    id: "esri-satellite",
    label: "Esri 卫星影像",
    kind: "raster",
    // 注意 y/x 顺序与常规相反，这是 ArcGIS REST 的约定
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: ESRI_ATTR,
    maxZoom: 19,
    dark: true,
    fallback: ["carto-voyager", "osm", "blank"],
    suits: ["satellite"],
  },

  "openfreemap-vector": {
    id: "openfreemap-vector",
    label: "OpenFreeMap（矢量，需 MapLibre）",
    kind: "vector",
    url: "https://tiles.openfreemap.org/styles/liberty",
    attribution: OSM_ATTR,
    maxZoom: 20,
    fallback: ["carto-voyager", "osm", "blank"],
    suits: ["standard"],
  },

  blank: {
    id: "blank",
    label: "离线占位（不联网）",
    kind: "raster",
    url: BLANK_TILE,
    attribution: OSM_ATTR,
    maxZoom: 20,
    fallback: [],
  },
};

/** 界面风格 → 首选底图 */
export const STYLE_TO_BASEMAP: Record<MapStyleMode, BasemapId> = {
  standard: "osm",
  dark: "carto-dark",
  minimal: "carto-voyager",
  satellite: "esri-satellite",
};

export { BLANK_TILE };

export function getBasemap(id: BasemapId): BasemapSpec {
  const spec = BASEMAPS[id];
  if (!spec) throw new Error(`[map] 未注册的底图: ${id}`);
  return spec;
}

/** 该底图是否可用（需要 key 但环境没有 key 时跳过） */
export function isBasemapAvailable(id: BasemapId): boolean {
  const spec = BASEMAPS[id];
  if (!spec) return false;
  if (spec.kind === "vector") return false; // 需要 MapLibre 渲染器，Leaflet 原生不支持
  if (spec.requiresKey && spec.envKey) {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return Boolean(env?.[spec.envKey]);
  }
  return true;
}

/**
 * 降级链：自身 → 依次 fallback → blank，去重且过滤不可用项。
 * 这是"地图永远有东西显示"的保证。
 */
export function fallbackChain(id: BasemapId): BasemapId[] {
  const out: BasemapId[] = [];
  const visit = (cur: BasemapId, guard: number) => {
    if (guard > 8 || out.includes(cur)) return;
    if (isBasemapAvailable(cur)) out.push(cur);
    const spec = BASEMAPS[cur];
    if (!spec) return;
    for (const next of spec.fallback ?? []) visit(next, guard + 1);
  };
  visit(id, 0);
  if (!out.includes("blank")) out.push("blank");
  return out;
}

/** 风格 → 可用底图（不可用则沿降级链顺延） */
export function resolveStyle(style: MapStyleMode): BasemapId {
  const chain = fallbackChain(STYLE_TO_BASEMAP[style]);
  return chain[0] ?? "blank";
}
