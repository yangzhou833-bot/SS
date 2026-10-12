import type { DiscoverPost } from '../types';
import { dateKey, scheduleTime } from './lifePlanning';
import { validDate } from './creationValidation';
import { escapeMarkerText } from './friendMarker';

export function starCardCreationDate(card:Pick<DiscoverPost,'createdAt'|'time'>) {
  const raw:unknown=card.createdAt;
  const absolute=typeof raw === 'string' ? raw : typeof card.time === 'string' && /^\d{4}-\d{2}-\d{2}(?:$|[ T])/.test(card.time) ? card.time : '';
  const timestamp=typeof raw === 'number' && Number.isFinite(raw) ? raw : absolute && validDate(absolute.slice(0,10)) ? scheduleTime(absolute) : Number.NaN;
  const date=new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return {short:'未记录',full:'创建日期未记录'};
  const full=dateKey(date);
  return {short:full.slice(5).replace('-','/'),full:`创建于 ${full}`};
}

export const STAR_CARD_MAP_SIZE = { width: 76, height: 160 };

export function renderStarCardMarker(card:DiscoverPost,scale:number,opacity:number,delay=0) {
  const text=(value:unknown) => escapeMarkerText(String(value ?? ''));
  const date=starCardCreationDate(card);
  const [month,day]=date.short === '未记录' ? ['—','—'] : date.short.split('/');
  const image=card.image || card.images?.[0];
  const video=card.mediaType === 'video' || Boolean(card.videoUrl);
  return `<div data-star-id="${text(card.id)}" class="star-card-marker" style="transform:scale(${scale});opacity:${opacity};transition-delay:${delay}s">
    <div class="star-card-surface">
      ${image ? `<img class="star-card-photo" src="${text(image)}" alt="${text(card.location)}"/>` : `<div class="star-card-text"><span>✨</span><p>${text(card.content)}</p></div>`}
      ${video ? '<span class="star-card-play" aria-label="视频星片">▶</span>' : ''}
      <img class="star-card-author" src="${text(card.authorAvatar)}" alt="${text(card.authorName)}"/>
      <span class="star-card-date" title="${text(date.full)}"><span class="star-card-month">${text(month)}${month === '—' ? '' : '月'}</span><span class="star-card-day">${text(day)}</span></span>
    </div>
    <span class="star-card-tip"></span>
    <span class="star-card-location">${video ? '🎬' : image ? '📍' : '📝'} ${text(card.location || '星片')}</span>
  </div>`;
}
