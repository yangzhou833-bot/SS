/**
 * Stellar 地图架构 · 统一类型
 *
 * 设计原则：这一层不依赖任何业务组件，业务通过适配器接入。
 * 好处：地图逻辑可独立测试、可替换底图/路由而不用改业务代码。
 */

/** 全架构内部统一使用 WGS-84 经纬度（与 Leaflet / OSM 一致）。 */
export interface LatLng {
  lat: number;
  lng: number;
}

export type TravelMode = "walk" | "drive" | "bike" | "transit";

/** 界面风格 → 由 basemaps.ts 映射到具体底图，组件不再认识瓦片地址。 */
export type MapStyleMode = "standard" | "dark" | "minimal" | "satellite";

/** 底图标识。新增底图只需在 basemaps.ts 注册，不需要改任何组件。 */
export type BasemapId =
  | "osm"
  | "carto-voyager"
  | "carto-dark"
  | "esri-satellite"
  | "openfreemap-vector"
  | "blank";

export type BasemapKind = "raster" | "vector";

export interface BasemapSpec {
  id: BasemapId;
  label: string;
  kind: BasemapKind;
  /** raster: 瓦片模板（含 {z}/{x}/{y}）；vector: style.json 地址 */
  url: string;
  /** 合规要求：任何底图都必须带署名，禁止置空。 */
  attribution: string;
  subdomains?: string;
  minZoom?: number;
  maxZoom: number;
  /** 超过该层级改用上级瓦片放大，避免出现空白瓦片 */
  maxNativeZoom?: number;
  /** 深色底图：用于自动切换控件与文字配色 */
  dark?: boolean;
  /** 需要 API key；运行时缺失则自动跳过该源 */
  requiresKey?: boolean;
  envKey?: string;
  /** 失败降级链：按顺序尝试下一个 */
  fallback?: BasemapId[];
  /** 适合的界面风格 */
  suits?: MapStyleMode[];
}

export interface MapViewState {
  center: LatLng;
  zoom: number;
  /** 用户选择的风格（可能因降级而实际使用了别的底图） */
  style: MapStyleMode;
}

export interface BasemapHealth {
  /** 用户期望的风格与底图 */
  requested: BasemapId;
  /** 当前真正生效的底图 */
  active: BasemapId;
  /** 是否处于降级状态（active !== requested） */
  degraded: boolean;
  consecutiveFailures: number;
  lastErrorAt?: number;
  lastErrorMessage?: string;
}

export interface RouteRequest {
  from: LatLng;
  to: LatLng;
  mode: TravelMode;
}

export interface RouteResult {
  points: LatLng[];
  distanceMeters: number;
  durationSeconds: number;
  provider: string;
  /** true = 路由服务不可用时的直线兜底，UI 应给出"暂无路线"提示 */
  degraded: boolean;
  cached: boolean;
  /** 降级为直线兜底时记录失败原因，便于排查与 UI 提示 */
  error?: string;
}

export type ExternalNavTarget = "amap" | "baidu" | "google" | "apple";

/** 图层的通用标记模型：position 永远是 WGS-84，业务负载由调用方解释。 */
export interface MapMarkerModel {
  id: string;
  position: LatLng;
  payload?: unknown;
}
