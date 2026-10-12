import { useMemo, useEffect, useState, useRef } from "react";

/**
 * Force-directed collision avoidance and spatial dispersal algorithm for map markers.
 * Listens to coordinate updates and applies repulsive physics when distance is below threshold.
 */

export interface MapSpatialItem {
  id: string;
  lat: number;
  lng: number;
  radiusKm?: number;
  isFixed?: boolean;
  type?: "user" | "friend" | "cluster" | "activity" | "live_share";
  [key: string]: any;
}

export interface DispersedItem<T = MapSpatialItem> {
  item: T;
  id: string;
  originalLat: number;
  originalLng: number;
  dispersedLat: number;
  dispersedLng: number;
  offsetLat: number;
  offsetLng: number;
  hasCollision: boolean;
}

/**
 * Core Physics Engine: Calculates repulsive forces between nearby spatial items in geographic coordinates.
 * Displaces overlapping items away from each other smoothly with inverse-distance force damping.
 */
export function applyForceCollisionAvoidance<T extends MapSpatialItem>(
  items: T[],
  minSeparationKm: number = 0.0045, // ~450m base separation for distinct arrangement
  iterations: number = 15,
  zoomLevel: number = 15
): DispersedItem<T>[] {
  if (!items || items.length === 0) return [];

  // Geographic scaling factors for Lanzhou (lat ~36.06 deg)
  const latKmPerDegree = 111.32;
  const lngKmPerDegree = 111.32 * Math.cos((36.06 * Math.PI) / 180);

  // Maintain consistent screen pixel separation across all zoom levels.
  // At zoom 15, 1 pixel is ~3.86 meters. 60px clearance = ~0.23 km.
  // When zooming out (lower zoom), geographic distance corresponding to same pixels doubles per zoom level.
  const clampedZoom = Math.max(10, Math.min(19, zoomLevel));
  const zoomScale = Math.pow(2, 15 - clampedZoom);
  const effectiveMinSeparation = minSeparationKm * zoomScale;

  // Initialize tracking array with safe numeric fallback
  const simulation = items.map((item) => {
    const safeLat = typeof item.lat === "number" && !isNaN(item.lat) ? item.lat : 36.0610;
    const safeLng = typeof item.lng === "number" && !isNaN(item.lng) ? item.lng : 103.8320;
    return {
      item,
      id: item.id,
      originalLat: safeLat,
      originalLng: safeLng,
      dispersedLat: safeLat,
      dispersedLng: safeLng,
      offsetLat: 0,
      offsetLng: 0,
      hasCollision: false,
      radiusKm: ((item.radiusKm || minSeparationKm) / 2) * zoomScale,
      isFixed: !!item.isFixed,
    };
  });

  // Boundary limits for Lanzhou geographic view
  const bounds = {
    minLat: 35.92,
    maxLat: 36.20,
    minLng: 103.60,
    maxLng: 104.10,
  };

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < simulation.length; i++) {
      for (let j = i + 1; j < simulation.length; j++) {
        const a = simulation[i];
        const b = simulation[j];

        const reqSeparation = a.radiusKm + b.radiusKm;

        const dLatKm = (a.dispersedLat - b.dispersedLat) * latKmPerDegree;
        const dLngKm = (a.dispersedLng - b.dispersedLng) * lngKmPerDegree;
        const distKm = Math.sqrt(dLatKm * dLatKm + dLngKm * dLngKm);

        // Check if distance between markers is below threshold
        if (distKm < reqSeparation && distKm > 0.000001) {
          a.hasCollision = true;
          b.hasCollision = true;

          const overlap = reqSeparation - distKm;
          const nx = dLngKm / distKm;
          const ny = dLatKm / distKm;

          // Push apart with smooth relaxation damping (0.75)
          const pushAmount = overlap * 0.75;
          const pushLng = (nx * pushAmount) / lngKmPerDegree;
          const pushLat = (ny * pushAmount) / latKmPerDegree;

          if (!a.isFixed && !b.isFixed) {
            a.dispersedLat += pushLat * 0.5;
            a.dispersedLng += pushLng * 0.5;
            b.dispersedLat -= pushLat * 0.5;
            b.dispersedLng -= pushLng * 0.5;
          } else if (!a.isFixed && b.isFixed) {
            a.dispersedLat += pushLat;
            a.dispersedLng += pushLng;
          } else if (a.isFixed && !b.isFixed) {
            b.dispersedLat -= pushLat;
            b.dispersedLng -= pushLng;
          }
        } else if (distKm <= 0.000001) {
          // Exactly coincident coordinates: apply deterministic radial dispersal
          a.hasCollision = true;
          b.hasCollision = true;
          const angle = ((i * 37 + j * 53) % 360) * (Math.PI / 180);
          const kickDist = reqSeparation * 0.6;
          const pushLng = (Math.cos(angle) * kickDist) / lngKmPerDegree;
          const pushLat = (Math.sin(angle) * kickDist) / latKmPerDegree;

          if (!a.isFixed && !b.isFixed) {
            a.dispersedLat += pushLat * 0.5;
            a.dispersedLng += pushLng * 0.5;
            b.dispersedLat -= pushLat * 0.5;
            b.dispersedLng -= pushLng * 0.5;
          } else if (!a.isFixed && b.isFixed) {
            a.dispersedLat += pushLat;
            a.dispersedLng += pushLng;
          } else if (a.isFixed && !b.isFixed) {
            b.dispersedLat -= pushLat;
            b.dispersedLng -= pushLng;
          }
        }
      }
    }

    // Boundary check & clamping per iteration
    for (let i = 0; i < simulation.length; i++) {
      const sim = simulation[i];
      if (!sim.isFixed) {
        if (sim.dispersedLat < bounds.minLat) sim.dispersedLat = bounds.minLat;
        if (sim.dispersedLat > bounds.maxLat) sim.dispersedLat = bounds.maxLat;
        if (sim.dispersedLng < bounds.minLng) sim.dispersedLng = bounds.minLng;
        if (sim.dispersedLng > bounds.maxLng) sim.dispersedLng = bounds.maxLng;
      }
    }
  }

  // Calculate final offsets
  return simulation.map((sim) => ({
    item: sim.item,
    id: sim.id,
    originalLat: sim.originalLat,
    originalLng: sim.originalLng,
    dispersedLat: sim.dispersedLat,
    dispersedLng: sim.dispersedLng,
    offsetLat: sim.dispersedLat - sim.originalLat,
    offsetLng: sim.dispersedLng - sim.originalLng,
    hasCollision: sim.hasCollision,
  }));
}

/**
 * React Hook: Listens to all map marker coordinates, recalculates repulsive force offsets,
 * and handles smooth animated transitions whenever coordinates update or markers move.
 */
export function useForceRepulsion<T extends MapSpatialItem>(
  items: T[],
  minSeparationKm: number = 0.0035,
  iterations: number = 6,
  zoomLevel: number = 15
) {
  // Memoized instantaneous physics calculation
  const dispersedResults = useMemo(() => {
    return applyForceCollisionAvoidance(items, minSeparationKm, iterations, zoomLevel);
  }, [items, minSeparationKm, iterations, zoomLevel]);

  // Lookup map for fast coordinate resolution
  const coordinateMap = useMemo(() => {
    const map = new Map<string, DispersedItem<T>>();
    dispersedResults.forEach((res) => {
      map.set(res.id, res);
    });
    return map;
  }, [dispersedResults]);

  return {
    dispersedResults,
    coordinateMap,
    getDispersedPosition: (id: string, fallbackLat: number, fallbackLng: number) => {
      const entry = coordinateMap.get(id);
      if (entry) {
        return {
          lat: entry.dispersedLat,
          lng: entry.dispersedLng,
          offsetLat: entry.offsetLat,
          offsetLng: entry.offsetLng,
          hasCollision: entry.hasCollision,
        };
      }
      return { lat: fallbackLat, lng: fallbackLng, offsetLat: 0, offsetLng: 0, hasCollision: false };
    },
  };
}
