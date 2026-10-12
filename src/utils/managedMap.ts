import * as L from 'leaflet';

/** 全应用唯一的「容器 → 地图实例」登记表 */
const registry = new WeakMap<HTMLElement, L.Map>();

export function getManagedMap(container: HTMLElement): L.Map | undefined {
  return registry.get(container);
}

/** 创建地图前先回收同一容器上的旧实例；返回的实例已登记在册 */
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

/** 统一的销毁入口：解绑事件 + 移除实例 + 注销登记 */
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
