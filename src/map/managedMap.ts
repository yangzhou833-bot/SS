/**
 * Stellar 地图架构 · 全应用唯一的「容器 → 地图实例」登记表
 *
 * 为什么需要它：Leaflet 对同一个 DOM 容器重复初始化会直接抛
 * "Map container is already initialized" —— 这是地图白屏最常见的原因。
 * 把登记表放在这里，任何组件（不论是否使用 useLeafletMap）都能共享同一份守卫。
 */

import * as L from "leaflet";

const registry = new WeakMap<HTMLElement, L.Map>();

export function getManagedMap(container: HTMLElement): L.Map | undefined {
  return registry.get(container);
}

/**
 * 创建地图前先回收同一容器上的旧实例。返回的实例已登记在册。
 * 与 useLeafletMap 共用同一份登记表，因此两者混用也不会重复初始化。
 */
export function createManagedMap(container: HTMLElement, options: L.MapOptions): L.Map {
  const existing = registry.get(container);
  if (existing) {
    try {
      existing.off();
      existing.remove();
    } catch {
      /* 已经被销毁 */
    }
    registry.delete(container);
  }
  const map = L.map(container, options);
  registry.set(container, map);
  return map;
}

/** 统一的销毁入口：解绑事件 + 移除实例 + 注销登记。 */
export function destroyManagedMap(container: HTMLElement | null, map: L.Map | null): void {
  if (!map) return;
  try {
    map.off();
    map.remove();
  } catch {
    /* 已经被销毁 */
  }
  if (container && registry.get(container) === map) {
    registry.delete(container);
  }
}

export function registerManagedMap(container: HTMLElement, map: L.Map): void {
  registry.set(container, map);
}

export function unregisterManagedMap(container: HTMLElement, map?: L.Map): void {
  if (!map || registry.get(container) === map) registry.delete(container);
}
