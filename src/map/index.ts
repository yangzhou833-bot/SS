/**
 * Stellar 地图架构 · 出口（barrel）
 *
 * 业务只从这里 import：`import { useLeafletMap, createMarkerLayer } from "@/map";`
 * 这样以后换底图/换路由/换渲染引擎，都不用改业务代码。
 */

export type {
  BasemapHealth,
  BasemapId,
  BasemapKind,
  BasemapSpec,
  ExternalNavTarget,
  LatLng,
  MapMarkerModel,
  MapStyleMode,
  MapViewState,
  RouteRequest,
  RouteResult,
  TravelMode,
} from "./types";

export {
  BASEMAPS,
  BLANK_TILE,
  STYLE_TO_BASEMAP,
  fallbackChain,
  getBasemap,
  isBasemapAvailable,
  resolveStyle,
} from "./basemaps";

export {
  bd09ToGcj02,
  bd09ToWgs84,
  coordinateRoundTripError,
  distanceMeters,
  fromGcj02,
  gcj02ToBd09,
  gcj02ToWgs84,
  outOfChina,
  toBd09,
  toGcj02,
  wgs84ToBd09,
  wgs84ToGcj02,
} from "./coordinates";

export {
  bindTileFallback,
  createTileHealthMonitor,
  probeBasemap,
  probeTile,
  sampleTileUrl,
  shouldDegrade,
} from "./tileHealth";
export type { TileFallbackBinding, TileHealthMonitor, TileHealthOptions } from "./tileHealth";

export {
  createFossgisDemoProvider,
  createOsrmProvider,
  createStaticProvider,
  fallbackRoute,
} from "./routing";
export type { OsrmProviderOptions, RouteProvider } from "./routing";

export {
  NAV_DATUM,
  buildNavigationUrl,
  detectNavEnvironment,
  pickNavigationTarget,
} from "./deepLinks";
export type { NavEnvironment, NavigationLinkOptions } from "./deepLinks";

export {
  createManagedMap,
  destroyManagedMap,
  getManagedMap,
  registerManagedMap,
  unregisterManagedMap,
} from "./managedMap";

export { useLeafletMap } from "./useLeafletMap";
export type { UseLeafletMapOptions, UseLeafletMapResult } from "./useLeafletMap";

export { boundsOf, createMarkerLayer, createRouteLayer } from "./layers";
export type { MarkerLayer, MarkerLayerOptions, RouteLayer } from "./layers";
