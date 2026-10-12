import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Battery, Users, Compass, RefreshCw } from 'lucide-react';
import { RoleId, INITIAL_NEW_USER_SNAPSHOT, INITIAL_VETERAN_USER_SNAPSHOT } from '../data/roleSnapshotData';

interface LoginRoleScreenProps {
  onSelectRoleAndLogin: (roleId: RoleId) => void;
  onQuickLogin?: () => void;
}

export const LoginRoleScreen: React.FC<LoginRoleScreenProps> = ({
  onSelectRoleAndLogin,
}) => {
  return (
    <div className="relative w-full h-full min-h-screen bg-[#F0F2F5] text-[#050505] flex flex-col justify-between p-4 sm:p-6 select-none overflow-y-auto font-sans">
      {/* Top Header & Brand */}
      <div className="w-full max-w-xl mx-auto pt-6 sm:pt-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-[#1877F2] rounded-2xl flex items-center justify-center text-white shadow-md mb-3">
          <Compass size={32} className="animate-spin-slow stroke-[2.2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#050505]">
          Stellar <span className="text-[#1877F2]">星图</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#65676B] mt-1 max-w-md font-medium">
          基于地理位置的实时状态与照片抠图贴纸社交平台 · 角色切换体验原型
        </p>

        {/* Prototype Announcement Banner */}
        <div className="mt-4 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-[#1877F2] rounded-md text-xs font-semibold flex items-center space-x-1.5 shadow-2xs">
          <Sparkles size={14} className="shrink-0 animate-pulse" />
          <span>原型模式：点击任意账户卡片即可一键免密登录体验</span>
        </div>
      </div>

      {/* Center: Two Account Cards */}
      <div className="w-full max-w-xl mx-auto my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Account A: New User (Empty Data) */}
        <motion.div
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRoleAndLogin('new_user')}
          className="bg-white border-2 border-[#E4E6EB] hover:border-[#1877F2] rounded-lg p-5 flex flex-col justify-between shadow-xs transition-all cursor-pointer group relative overflow-hidden"
        >
          {/* Top Tag */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black rounded-md flex items-center space-x-1">
              <span>🌱</span>
              <span>Account A · 新用户</span>
            </span>
            <span className="text-[10px] text-[#65676B] font-bold">空数据旅程</span>
          </div>

          {/* Avatar Preview */}
          <div className="flex flex-col items-center my-3">
            <div className="relative w-20 h-20 rounded-full border-3 border-emerald-400 p-0.5 bg-white shadow-sm">
              <img
                src={INITIAL_NEW_USER_SNAPSHOT.avatar}
                alt="New User"
                className="w-full h-full rounded-full object-cover grayscale-25"
              />
              {/* Corner Badge: 🙂 */}
              <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-white border border-gray-200 text-sm flex items-center justify-center shadow-xs">
                🙂
              </div>
              {/* Corner Badge: 100% Battery */}
              <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-black/80 text-white text-[9px] font-black flex items-center space-x-0.5">
                <Battery size={9} className="text-emerald-400" />
                <span>100%</span>
              </div>
            </div>

            {/* Bubble preview */}
            <div className="mt-2 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-full text-[11px] text-[#65676B] font-semibold">
              💬 开始你的 Stellar 之旅吧
            </div>
          </div>

          {/* Feature highlights */}
          <div className="space-y-1.5 text-[11px] text-[#65676B] my-3 border-t border-b border-gray-100 py-2.5">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span>地图状态：仅自己在线 · 新手引导卡片</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span>贴纸与互动：空贴纸环 · 引导创建首个抠图</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span>足迹记录：空白时间轴与设计好的空状态</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="w-full py-2.5 bg-gray-100 group-hover:bg-[#1877F2] text-[#050505] group-hover:text-white rounded-md text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <span>以「新用户」登入</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Account B: Veteran User (Full Data) */}
        <motion.div
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRoleAndLogin('veteran_user')}
          className="bg-white border-2 border-[#1877F2]/40 hover:border-[#1877F2] rounded-lg p-5 flex flex-col justify-between shadow-xs transition-all cursor-pointer group relative overflow-hidden ring-1 ring-[#1877F2]/20"
        >
          {/* Top Tag */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-2 py-0.5 bg-blue-50 border border-blue-300 text-[#1877F2] text-[11px] font-black rounded-md flex items-center space-x-1">
              <span>🌟</span>
              <span>Account B · 老用户 (探索官)</span>
            </span>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">满载数据</span>
          </div>

          {/* Avatar Preview with Orbit Cutout Stickers */}
          <div className="flex flex-col items-center my-3 relative">
            <div className="relative w-20 h-20 rounded-full border-3 border-[#1877F2] p-0.5 bg-white shadow-md">
              <img
                src={INITIAL_VETERAN_USER_SNAPSHOT.avatar}
                alt="Veteran User"
                className="w-full h-full rounded-full object-cover"
              />
              {/* Corner Badge: 😄 */}
              <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-white border border-blue-200 text-sm flex items-center justify-center shadow-xs">
                😄
              </div>
              {/* Corner Badge: 78% Battery */}
              <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-black/80 text-white text-[9px] font-black flex items-center space-x-0.5">
                <Battery size={9} className="text-emerald-400" />
                <span>78%</span>
              </div>
              {/* Corner Badge: +2 Friend Interaction */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                +2
              </div>

              {/* Orbit Mini Stickers Indicators */}
              <div className="absolute -top-2.5 -right-3 px-1 py-0.5 bg-white border border-amber-300 rounded-full shadow-xs text-[10px] font-black flex items-center space-x-0.5 text-amber-600 animate-bounce">
                <span>🍔</span>
                <span className="text-[8px]">❤️18</span>
              </div>
              <div className="absolute -bottom-2 -left-3 px-1 py-0.5 bg-white border border-blue-300 rounded-full shadow-xs text-[10px] font-black flex items-center space-x-0.5 text-[#1877F2]">
                <span>🚴</span>
                <span className="text-[8px]">❤️24</span>
              </div>
            </div>

            {/* Bubble preview */}
            <div className="mt-2 px-2.5 py-1 bg-blue-50 border border-blue-200 text-[#1877F2] rounded-full text-[11px] font-black">
              💬 今天也要元气满满！
            </div>
          </div>

          {/* Feature highlights */}
          <div className="space-y-1.5 text-[11px] text-[#65676B] my-3 border-t border-b border-gray-100 py-2.5">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2]" />
              <span>地图好友：8位好友在线 · 骑行与停留实时状态</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>照片贴纸：4款精选抠图贴纸 · ❤️ 12+点赞与点赞列表</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>足迹与活动：今日4段足迹 · 7天历史 · 3条未读通知</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="w-full py-2.5 bg-[#1877F2] hover:bg-blue-600 text-white rounded-md text-xs font-black flex items-center justify-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <span>以「老用户」登入 (体验全量互动)</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Bottom Information & Prototype Switcher Hint */}
      <div className="w-full max-w-xl mx-auto pb-6 text-center space-y-2">
        <p className="text-xs text-[#65676B] flex items-center justify-center space-x-1">
          <RefreshCw size={13} className="text-[#1877F2]" />
          <span>登录后可在任何界面通过<strong>右侧胶囊角色栏</strong>随时秒切身份与重置快照。</span>
        </p>
        <p className="text-[11px] text-gray-400">
          Stellar Location-Based Social Ecosystem · Meta / Facebook Straight Line Design System
        </p>
      </div>
    </div>
  );
};
