import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Calendar, Heart, MapPin, MessageSquare, X } from 'lucide-react';
import type { DiscoverPost } from '../types';
import { starCardCreationDate } from '../utils/starCardPresentation';
import './star-card.css';

interface StarCardDetailModalProps {
  card:DiscoverPost;
  onClose:()=>void;
  onLike:()=>void;
  commentValue:string;
  onCommentChange:(value:string)=>void;
  onSubmitComment:()=>void;
}

export const StarCardDetailModal:React.FC<StarCardDetailModalProps> = ({card,onClose,onLike,commentValue,onCommentChange,onSubmitComment}) => {
  const reducedMotion=useReducedMotion();
  const date=starCardCreationDate(card);
  const image=card.image || card.images?.[0];
  const comments=card.commentsList || [];
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/45 backdrop-blur-sm" onClick={onClose}>
    <motion.div role="dialog" aria-label="星片详情" initial={reducedMotion ? {opacity:0} : {scale:0.96,y:14,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{opacity:0}} transition={{duration:reducedMotion ? 0 : 0.24}} onClick={event => event.stopPropagation()} className="star-card-detail relative w-full max-w-[430px] bg-white border border-[#E4E6EB] rounded-md overflow-hidden flex flex-col max-h-full text-[#1C1E21]">
      <div className="relative h-[min(43vh,340px)] min-h-[230px] shrink-0 bg-white">
        {card.videoUrl ? <video src={card.videoUrl} controls autoPlay loop playsInline poster={image} className="w-full h-full object-cover"/> : image ? <img src={image} alt={card.location} className="w-full h-full object-cover"/> : <div className="h-full flex flex-col justify-center items-center px-7 text-center gap-3 text-[#1C1E21]"><span className="text-4xl">✨</span><p className="text-base font-semibold line-clamp-4">{card.content}</p>{card.mediaType === 'video' && <span className="text-xs text-[#65676B]">视频文件未提供</span>}</div>}
        <div className="absolute top-3 left-3 max-w-[calc(100%-146px)] flex items-center gap-2"><img src={card.authorAvatar} alt={card.authorName} className="w-10 h-10 shrink-0 rounded-full object-cover shadow-[0_3px_8px_#142a4d35]"/><span className="min-w-0 truncate bg-white/90 px-2 py-1 rounded-md text-xs font-bold text-[#1C1E21] shadow-xs">{card.authorName}</span></div>
        <div title={date.full} className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1.5 rounded-md bg-white/95 text-[10px] font-bold text-[#1877F2] shadow-[0_3px_8px_#142a4d25]"><Calendar size={13}/><span>{date.full.replace('创建于 ','')}</span></div>
        <button type="button" aria-label="关闭星片详情" onClick={onClose} className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/95 text-[#1C1E21] shadow-md hover:text-[#1877F2]"><X size={17}/></button>
      </div>
      <div className="px-4 pt-4 pb-3 min-h-0 overflow-y-auto space-y-3 text-sm leading-relaxed">
        <p className="flex items-center gap-1 text-xs font-bold text-[#1877F2]"><MapPin size={13}/>{card.location}</p>
        <p className="whitespace-pre-wrap break-words">{card.content}</p>
        <div className="flex items-center justify-between pt-2 border-t border-[#E4E6EB] text-xs"><button type="button" onClick={onLike} aria-pressed={Boolean(card.likedByMe)} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border ${card.likedByMe ? 'border-rose-200 text-rose-500 bg-rose-50' : 'border-[#E4E6EB] text-[#65676B]'}`}><Heart size={15} className={card.likedByMe ? 'fill-rose-500' : ''}/>{card.likes} 点赞</button><span className="flex items-center gap-1 text-[#65676B]"><MessageSquare size={14}/>{comments.length || card.comments || 0} 评论</span></div>
        <div className="space-y-2"><h4 className="text-xs font-bold">评论</h4>{comments.length ? comments.map((comment,index) => <div key={`${comment.id}-${index}`} className="flex items-start gap-2 text-xs"><img src={comment.userAvatar} alt={comment.userName} className="w-6 h-6 rounded-full object-cover"/><div className="flex-1 min-w-0"><div className="flex justify-between gap-2"><strong>{comment.userName}</strong><span className="text-[10px] text-[#65676B]">{comment.time}</span></div><p className="break-words">{comment.content}</p></div></div>) : <p className="text-xs text-[#65676B] py-2">暂无评论，留下这段记忆的第一句回应。</p>}</div>
      </div>
      <form onSubmit={event => {event.preventDefault();if (commentValue.trim()) onSubmitComment();}} className="p-3 bg-white border-t border-[#E4E6EB] flex items-center gap-2 shrink-0"><input aria-label="星片评论" value={commentValue} onChange={event => onCommentChange(event.target.value)} placeholder="说点什么吧…" className="flex-1 min-w-0 bg-white border border-[#E4E6EB] rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#1877F2]"/><button type="submit" disabled={!commentValue.trim()} className="px-3 py-2 rounded-md bg-[#1877F2] text-white font-bold text-xs disabled:opacity-45">发送</button></form>
    </motion.div>
  </motion.div>;
};
