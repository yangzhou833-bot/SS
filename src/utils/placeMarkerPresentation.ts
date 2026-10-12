import { escapeMarkerText } from './friendMarker';

export const PLACE_MARKER_MAP_SIZE = { width: 44, height: 44 };

export function renderPlaceMarker({ id, name, icon, selected, delay = 0, scale = 1, opacity = 1 }: {
  id: string; name: string; icon: string;
  selected: boolean; delay?: number; scale?: number; opacity?: number;
}) {
  const text=(value:unknown) => escapeMarkerText(String(value ?? ''));
  return `<div data-place-id="${text(id)}" aria-label="${text(name)}" title="${text(name)}" class="place-theme-marker${selected ? ' is-selected' : ''}" style="transform:scale(${scale});opacity:${opacity};transition-delay:${delay}s">
    <span class="place-theme-emoji" aria-hidden="true">${text(icon || '📍')}</span>
  </div>`;
}
