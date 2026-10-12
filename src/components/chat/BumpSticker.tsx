import React from 'react';

export const BUMP_STICKERS = [
  { id: 'heart', emoji: '♥️', label: '爱心', cell: 0 },
  { id: 'cry', emoji: '😭', label: 'Cry cry cry', cell: 1 },
  { id: 'poop', emoji: '💩', label: 'Poop Gift', cell: 2 },
  { id: 'fire', emoji: '🔥', label: 'Fire', cell: 5 },
  { id: 'beer', emoji: '🍺', label: 'Cheers!', cell: 8, friends: 8 },
  { id: 'eyes', emoji: '👀', label: '眼睛', cell: 3 },
  { id: 'hello', emoji: '👋', label: 'Hello!', cell: 4 },
  { id: 'squirrel', emoji: '🐿️', label: 'Acorn lover', cell: 7, friends: 6 },
  { id: 'yes', emoji: '👍', label: 'Yessssss', cell: 6 },
] as const;

export const STELLAR_STICKERS = [
  { id: 'stellar-planet', emoji: '🪐', label: '小宇宙', cell: 0 },
  { id: 'stellar-hug', emoji: '🫶', label: '抱抱你', cell: 1 },
  { id: 'stellar-coffee', emoji: '☕️', label: '咖啡时间', cell: 2 },
  { id: 'stellar-book', emoji: '📖', label: '一起读书', cell: 3 },
  { id: 'stellar-sleep', emoji: '💤', label: '晚安云朵', cell: 4 },
  { id: 'stellar-star', emoji: '🌟', label: '闪亮点赞', cell: 5 },
] as const;

export function BumpSticker({ emoji, size = 80 }: { emoji: string; size?: number }) {
  const stellar = STELLAR_STICKERS.find(item => item.emoji === emoji);
  if (stellar) {
    const crop = [{x:8,y:135,w:448},{x:462,y:200,w:390},{x:840,y:105,w:480},{x:0,y:690,w:440},{x:440,y:700,w:420},{x:861,y:700,w:420}][stellar.cell];
    const zoom = 1280/crop.w*100;
    return <span aria-hidden="true" className="bump-sticker-art stellar-sticker-art" style={{width:size,height:size,backgroundImage:"url('/bump/stellar-reactions.png')",backgroundSize:`${zoom}% ${zoom}%`,backgroundPosition:`${crop.x/(1280-crop.w)*100}% ${crop.y/(1280-crop.w)*100}%`}}/>;
  }
  const sticker = BUMP_STICKERS.find(item => item.emoji === emoji);
  return sticker ? <span aria-hidden="true" className="bump-sticker-art" style={{ width: size, height: size,
    backgroundPosition: `${(sticker.cell % 3) * 50}% ${Math.floor(sticker.cell / 3) * 50}%` }} /> : <span aria-hidden="true" style={{ fontSize: size * 0.72 }}>{emoji}</span>;
}
