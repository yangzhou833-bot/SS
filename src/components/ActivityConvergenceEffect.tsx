import React, { useEffect, useState } from 'react';
import { SimulatedMapActivity, ActivityParticipantStatus } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import { CheckCircle2, Sparkles, Flame, Users, X } from 'lucide-react';

export interface ActivityConvergenceEffectProps {
  activity: SimulatedMapActivity;
  arrivedParticipant?: ActivityParticipantStatus | null;
  onClose: () => void;
}

export const ActivityConvergenceEffect: React.FC<ActivityConvergenceEffectProps> = ({
  activity,
  arrivedParticipant,
  onClose,
}) => {
  const [stage, setStage] = useState<'converging' | 'fused' | 'celebrating'>('converging');

  useEffect(() => {
    // Trigger fanfare audio & haptics
    soundEffects.playConvergenceSound();
    haptics.trigger('heavy');

    const timer1 = setTimeout(() => {
      setStage('fused');
      haptics.trigger('medium');
    }, 900);

    const timer2 = setTimeout(() => {
      setStage('celebrating');
    }, 1800);

    const timer3 = setTimeout(() => {
      onClose();
    }, 4200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onClose]);

  const arrivedFriends = activity?.participants?.filter((p) => p.status === 'arrived') || [];
  const activeUser = arrivedParticipant || arrivedFriends[0] || {
    id: 'user',
    name: '我 (Alexia)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    status: 'arrived',
    statusText: '已到达场地',
  };

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center bg-black/45 backdrop-blur-[3px] animate-in fade-in duration-300 select-none"
      onClick={onClose}
    >
      {/* 顶部聚合成功状态横幅 (Facebook 直角线框风格) */}
      <div
        className="absolute top-12 left-4 right-4 max-w-sm mx-auto bg-white rounded-md border border-[#E4E6EB] shadow-lg p-3 z-30 animate-in slide-in-from-top-4 duration-300 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black text-[#050505]">{activeUser.name.split(' ')[0]} 已到场</span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-500 text-white font-bold">
                加入成功
              </span>
            </div>
            <div className="text-[10px] text-[#65676B] mt-0.5 flex items-center space-x-1">
              <span>已与 {arrivedFriends.length} 位好友顺利汇聚</span>
              <span>·</span>
              <span className="text-[#1877F2] font-bold">热度升温</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-md bg-[#F0F2F5] hover:bg-[#E4E6EB] flex items-center justify-center text-gray-500 cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* 中心聚合动画能量场与头像合体动效 */}
      <div
        className="relative flex items-center justify-center w-72 h-72"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. 多层扩散同心光圈涟漪 (Multi-Ring Shockwaves) */}
        <div className="absolute inset-0 rounded-full border-4 border-[#1877F2]/50 animate-ping" />
        <div className="absolute inset-8 rounded-full border-2 border-emerald-400/60 animate-ping [animation-delay:200ms]" />
        <div className="absolute inset-16 rounded-full border-2 border-amber-400/70 animate-ping [animation-delay:400ms]" />

        {/* 2. 背景能量光晕 (Glowing Core) */}
        <div
          className="absolute w-44 h-44 rounded-full filter blur-xl opacity-75 animate-pulse"
          style={{ backgroundColor: activity.color || '#1877F2' }}
        />

        {/* 3. 散落彩带粒子与金色火花 (Confetti & Sparkles) */}
        <div className="absolute -top-6 -left-4 text-2xl animate-bounce">✨</div>
        <div className="absolute -top-8 right-6 text-2xl animate-bounce [animation-delay:150ms]">🎉</div>
        <div className="absolute -bottom-6 -left-2 text-2xl animate-bounce [animation-delay:300ms]">🎈</div>
        <div className="absolute -bottom-8 right-8 text-2xl animate-bounce [animation-delay:250ms]">🔥</div>
        <div className="absolute top-1/2 -right-8 text-2xl animate-spin-slow">⭐</div>
        <div className="absolute top-1/2 -left-8 text-2xl animate-spin-slow">🌟</div>

        {/* 4. 聚会中心活动大徽章 (Facebook Straight-Edge UI) */}
        <div
          className={`relative z-20 w-28 h-28 bg-white rounded-2xl border-3 border-[#1877F2] shadow-2xl p-2 flex flex-col items-center justify-center text-center transition-all duration-500 ${
            stage === 'converging'
              ? 'scale-90 opacity-90'
              : stage === 'fused'
              ? 'scale-110 shadow-[0_0_40px_rgba(24,119,242,0.8)] ring-4 ring-white'
              : 'scale-100'
          }`}
        >
          <span className="text-4xl filter drop-shadow-md">{activity.icon}</span>
          <span className="text-[10px] font-black text-[#050505] truncate max-w-[88px] mt-1">
            {activity.title.split('·')[0]}
          </span>
          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-0.5">
            {arrivedFriends.length}人已汇合
          </span>
        </div>

        {/* 5. 参与好友头像四周向中心吸附飞入合体动画 (Avatar Suction Fusion Animation) */}
        {activity.participants.slice(0, 5).map((p, idx) => {
          // Calculate radial positions
          const angle = (idx / 5) * 2 * Math.PI - Math.PI / 2;
          const radius = stage === 'converging' ? 110 : 64; // Collapses inward into the center
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={p.id}
              className={`absolute z-30 transition-all duration-700 ease-out flex flex-col items-center ${
                stage === 'converging' ? 'scale-100' : 'scale-95'
              }`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              <div className="relative w-11 h-11 rounded-full bg-white border-2 border-[#1877F2] shadow-lg overflow-hidden flex items-center justify-center">
                <img src={p.avatar} alt={p.name} className="w-full h-full object-cover block" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border border-white" />
              </div>
              <span className="bg-white/95 px-1.5 py-0.2 rounded text-[8px] font-bold text-gray-800 border border-gray-200 mt-0.5 shadow-xs whitespace-nowrap">
                {p.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* 底部确认完成按钮 */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center px-6 pointer-events-auto">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white font-bold rounded-md text-xs flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
        >
          <Flame size={16} className="text-amber-300" />
          <span>进入活动互动现场</span>
        </button>
      </div>
    </div>
  );
};
