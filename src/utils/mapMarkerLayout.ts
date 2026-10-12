export interface ScreenMapMarker {
  id: string;
  x: number;
  y: number;
  left: number;
  top: number;
  width: number;
  height: number;
  priority?: number;
  locked?: boolean;
}

// Offsets are display pixels; geographic coordinates never enter this layout.
export function layoutMapMarkers(items: ScreenMapMarker[], padding = 10, viewport?: {width:number;height:number}) {
  const result = new Map<string, {dx:number;dy:number}>();
  const occupied: {left:number;top:number;right:number;bottom:number}[] = [];
  const sorted = [...items].sort((a,b) => Number(!!b.locked)-Number(!!a.locked) || (b.priority || 0)-(a.priority || 0) || a.id.localeCompare(b.id));
  sorted.forEach(item => {
    const box = (dx:number,dy:number) => ({left:item.x+item.left+dx,top:item.y+item.top+dy,right:item.x+item.left+dx+item.width,bottom:item.y+item.top+dy+item.height});
    const free = (dx:number,dy:number) => {
      const next = box(dx,dy);
      return !occupied.some(prev => next.left < prev.right+padding && next.right+padding > prev.left && next.top < prev.bottom+padding && next.bottom+padding > prev.top);
    };
    const inside = (dx:number,dy:number) => {
      if (!viewport) return true;
      const next = box(dx,dy);
      return next.left >= 0 && next.top >= 0 && next.right <= viewport.width && next.bottom <= viewport.height;
    };
    let dx = 0, dy = 0;
    if (!item.locked && (!free(0,0) || !inside(0,0))) {
      const origin = box(0,0);
      const xs = new Set([0]), ys = new Set([0]);
      // Obstacle edges give the nearest available gaps without a long spiral search.
      occupied.forEach(prev => {
        xs.add(prev.right+padding-origin.left);xs.add(prev.left-padding-origin.right);
        ys.add(prev.bottom+padding-origin.top);ys.add(prev.top-padding-origin.bottom);
      });
      if (viewport) {
        xs.add(-origin.left);xs.add(viewport.width-origin.right);
        ys.add(-origin.top);ys.add(viewport.height-origin.bottom);
      }
      const candidates = [...xs].flatMap(x => [...ys].map(y => ({dx:x,dy:y})));
      candidates.sort((a,b) => a.dx*a.dx+a.dy*a.dy-b.dx*b.dx-b.dy*b.dy || a.dx-b.dx || a.dy-b.dy);
      const visible = candidates.find(candidate => inside(candidate.dx,candidate.dy) && free(candidate.dx,candidate.dy));
      const nearest = visible || candidates.find(candidate => free(candidate.dx,candidate.dy));
      if (nearest) {dx=nearest.dx;dy=nearest.dy;}
    }
    result.set(item.id,{dx,dy});
    occupied.push(box(dx,dy));
  });
  return result;
}

// Google retains its exact AdvancedMarker position; only the inner visual is translated.
export function layoutGoogleFriendMarkers(container: HTMLElement, lines: SVGSVGElement, selectedFriendId: string | null) {
  const viewport = container.getBoundingClientRect();
  const entries = Array.from(container.querySelectorAll<HTMLElement>('[data-google-friend-marker]')).flatMap(wrapper => {
    const visual = wrapper.querySelector<HTMLElement>('[data-google-friend-visual]');
    if (!visual) return [];
    visual.style.transform = '';
    const source = wrapper.getBoundingClientRect();
    const x = source.left - viewport.left + Number(wrapper.dataset.anchorX);
    const y = source.top - viewport.top + Number(wrapper.dataset.anchorY);
    if (x < -200 || y < -250 || x > viewport.width + 200 || y > viewport.height + 250) return [];
    const rects = [visual, ...Array.from(visual.querySelectorAll<HTMLElement>('.stellar-friend-note,.stellar-friend-corner,.stellar-friend-name,.stellar-stay-ring'))]
      .map(element => element.getBoundingClientRect()).filter(rect => rect.width && rect.height);
    if (!rects.length) return [];
    const id = wrapper.dataset.googleFriendMarker!;
    const left = Math.min(...rects.map(rect => rect.left)) - viewport.left - x;
    const top = Math.min(...rects.map(rect => rect.top)) - viewport.top - y;
    const right = Math.max(...rects.map(rect => rect.right)) - viewport.left - x;
    const bottom = Math.max(...rects.map(rect => rect.bottom)) - viewport.top - y;
    return [{visual,item:{id,x,y,left,top,width:right-left,height:bottom-top,locked:id === selectedFriendId}}];
  });
  const offsets = layoutMapMarkers(entries.map(entry => entry.item), 10, {width:viewport.width,height:viewport.height});
  lines.innerHTML = entries.map(({visual,item}) => {
    const {dx,dy} = offsets.get(item.id)!;
    visual.style.transform = `translate(${dx}px, ${dy}px)`;
    return dx || dy ? `<line x1="${item.x}" y1="${item.y}" x2="${item.x+dx}" y2="${item.y+dy}" stroke="#64748b" stroke-width="1.4" stroke-dasharray="3 4" opacity=".65"/><circle cx="${item.x}" cy="${item.y}" r="2.2" fill="#64748b" stroke="#fff" stroke-width="1"/>` : '';
  }).join('');
  return offsets;
}
