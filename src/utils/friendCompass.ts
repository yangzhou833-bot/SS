import { calculateLatLngDistanceMeters } from './geoUtils';

export function southPointerRotation(heading: number) {
  return 180 - ((heading % 360 + 360) % 360);
}

export function friendDistanceKm(origin: {lat:number;lng:number}, friend: {lat?:number;lng?:number}) {
  if (![origin.lat,origin.lng,friend.lat,friend.lng].every(Number.isFinite)) return null;
  return calculateLatLngDistanceMeters(origin.lat,origin.lng,friend.lat!,friend.lng!) / 1000;
}
