/**
 * Stellar 地图架构 · 图层工厂
 *
 * 解决的问题：
 *   1. 现有实现每次数据变化都 clearLayers() 再全部重建 —— 造成闪烁、动画中断、长按/点击事件丢失；
 *   2. 点位很多时（好友 + 贴纸 + 标记 + 活动）重建成本高，交互卡顿。
 *
 * 做法：差量更新（只增/改/删真正变化的标记），并统一处理点按与长按。
 */

import * as L from "leaflet";
import type { LatLng, MapMarkerModel, RouteResult } from "./types";

type DivIconFactory<T> = (item: T) => L.DivIcon;

export interface MarkerLayerOptions<T extends MapMarkerModel> {
  createIcon: DivIconFactory<T>;
  /** 判断是否需要更新图标（默认只看坐标） */
  signature?: (item: T) => string;
  onClick?: (item: T) => void;
  onLongPress?: (item: T, screenPos: { x: number; y: number }) => void;
  /** 长按判定时长，默认 480ms */
  longPressMs?: number;
  zIndexOffset?: number;
  pane?: string;
}

export interface MarkerLayer<T extends MapMarkerModel> {
  update(items: T[]): void;
  clear(): void;
  getMarker(id: string): L.Marker | undefined;
  dispose(): void;
  readonly size: number;
}

const round = (n: number): number => Math.round(n * 1e5) / 1e5;

export function createMarkerLayer<T extends MapMarkerModel>(
  map: L.Map,
  options: MarkerLayerOptions<T>,
): MarkerLayer<T> {
  const {
    createIcon,
    signature = (item) => `${round(item.position.lat)},${round(item.position.lng)}`,
    onClick,
    onLongPress,
    longPressMs = 480,
    zIndexOffset = 0,
    pane,
  } = options;

  const entries = new Map<string, { marker: L.Marker; sig: string; item: T }>();

  const attachHandlers = (marker: L.Marker, item: T) => {
    if (onClick) {
      marker.on("click", () => onClick(item));
    }
    if (onLongPress) {
      let timer: ReturnType<typeof setTimeout> | null = null;
      let fired = false;
      let origin = { x: 0, y: 0 };

      const cancel = () => {
        if (timer) clearTimeout(timer);
        timer = null;
      };
      const start = (e: L.LeafletMouseEvent | L.LeafletEvent) => {
        const src = e as L.LeafletMouseEvent;
        const oe = (src.originalEvent ?? {}) as MouseEvent & TouchEvent;
        const point =
          "clientX" in oe && typeof oe.clientX === "number"
            ? { x: oe.clientX, y: oe.clientY }
            : map.latLngToContainerPoint(src.latlng ?? L.latLng(item.position.lat, item.position.lng));
        origin = point;
        fired = false;
        cancel();
        timer = setTimeout(() => {
          fired = true;
          onLongPress(item, origin);
        }, longPressMs);
      };
      const move = (e: L.LeafletEvent) => {
        const src = e as L.LeafletMouseEvent;
        const oe = (src.originalEvent ?? {}) as MouseEvent;
        if (typeof oe.clientX === "number") {
          const dx = oe.clientX - origin.x;
          const dy = oe.clientY - origin.y;
          if (dx * dx + dy * dy > 100) cancel(); // 移动超过 10px 视为拖拽，取消长按
        }
      };

      marker.on("mousedown touchstart", start);
      marker.on("mousemove touchmove", move);
      marker.on("mouseup touchend mouseout touchcancel", cancel);
      marker.on("click", () => {
        if (fired) {
          fired = false;
        }
      });
    }
  };

  return {
    update(items: T[]) {
      const seen = new Set<string>();

      for (const item of items) {
        seen.add(item.id);
        const sig = signature(item);
        const existing = entries.get(item.id);

        if (!existing) {
          const marker = L.marker([item.position.lat, item.position.lng], {
            icon: createIcon(item),
            zIndexOffset,
            pane,
          });
          marker.addTo(map);
          attachHandlers(marker, item);
          entries.set(item.id, { marker, sig, item });
          continue;
        }

        if (existing.sig !== sig) {
          existing.marker.setLatLng([item.position.lat, item.position.lng]);
          existing.marker.setIcon(createIcon(item));
          existing.sig = sig;
        }
        existing.item = item;
      }

      for (const [id, entry] of Array.from(entries.entries())) {
        if (!seen.has(id)) {
          entry.marker.remove();
          entries.delete(id);
        }
      }
    },

    clear() {
      for (const entry of entries.values()) entry.marker.remove();
      entries.clear();
    },

    getMarker(id: string) {
      return entries.get(id)?.marker;
    },

    dispose() {
      for (const entry of entries.values()) {
        entry.marker.off();
        entry.marker.remove();
      }
      entries.clear();
    },

    get size() {
      return entries.size;
    },
  };
}

export interface RouteLayer {
  setRoute(route: RouteResult | null): void;
  fitBounds(padding?: number): void;
  clear(): void;
  dispose(): void;
}

/** 路线图层：描边 + 主线双层，保证在任何底图上都看得清 */
export function createRouteLayer(map: L.Map): RouteLayer {
  let halo: L.Polyline | null = null;
  let line: L.Polyline | null = null;
  let last: RouteResult | null = null;

  const latlngs = (route: RouteResult): L.LatLngExpression[] =>
    route.points.map((p) => [p.lat, p.lng] as [number, number]);

  return {
    setRoute(route) {
      last = route;
      if (!route || route.points.length < 2) {
        this.clear();
        return;
      }
      const points = latlngs(route);
      const dashed = route.degraded; // 直线兜底用虚线，明确告诉用户这不是真实路线

      if (!halo) {
        halo = L.polyline(points, {
          color: "#FFFFFF",
          weight: 9,
          opacity: 0.9,
          lineJoin: "round",
        }).addTo(map);
      } else {
        halo.setLatLngs(points);
      }

      if (!line) {
        line = L.polyline(points, {
          color: "#1877F2",
          weight: 4.5,
          opacity: 1,
          dashArray: dashed ? "8 8" : undefined,
          lineJoin: "round",
        }).addTo(map);
      } else {
        line.setLatLngs(points);
        line.setStyle({ dashArray: dashed ? "8 8" : undefined });
      }
    },

    fitBounds(padding = 48) {
      if (!last || last.points.length < 2) return;
      const bounds = L.latLngBounds(latlngs(last));
      map.fitBounds(bounds, { padding: [padding, padding], animate: true });
    },

    clear() {
      halo?.remove();
      line?.remove();
      halo = null;
      line = null;
      last = null;
    },

    dispose() {
      this.clear();
    },
  };
}

/** 便捷：批量计算点集的边界（用于自动缩放） */
export function boundsOf(points: LatLng[]): L.LatLngBounds | null {
  if (points.length === 0) return null;
  return L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
}
