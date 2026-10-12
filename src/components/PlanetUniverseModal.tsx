import React, { useState } from 'react';
import {
  X,
  Search,
  Sparkles,
  Compass,
  Plus,
  Orbit,
  Layers,
  Zap,
  Globe,
  Radio,
  Share2,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { PlanetItem } from '../types';
import { PlanetDetailPage } from './PlanetDetailPage';

interface PlanetUniverseModalProps {
  isOpen: boolean;
  onClose: () => void;
  planets: PlanetItem[];
  onUpdatePlanet: (updated: PlanetItem) => void;
  showToast: (msg: string) => void;
  onNavigateToMapLocation?: (location: { lat: number; lng: number; name?: string }) => void;
}

export const PlanetUniverseModal: React.FC<PlanetUniverseModalProps> = ({
  isOpen,
  onClose,
  planets,
  onUpdatePlanet,
  showToast,
  onNavigateToMapLocation,
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cosmic' | 'grid'>('cosmic');
  const [isCreatingPlanet, setIsCreatingPlanet] = useState(false);
  const [newPlanetName, setNewPlanetName] = useState('');
  const [newPlanetCategory, setNewPlanetCategory] = useState('科技 · 赛博');
  const [newPlanetTheme, setNewPlanetTheme] = useState('#06B6D4');

  if (!isOpen) return null;

  const categories = ['全部', '科技 · 赛博', '浪漫 · 治愈', '自然 · 秘境', '户外 · 探险', '自然 · 慢调', '生活 · 慢调'];

  const filteredPlanets = planets.filter((p) => {
    const matchesCat = activeCategory === '全部' || p.category.includes(activeCategory);
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateCustomPlanet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanetName.trim()) return;

    const newCustomPlanet: PlanetItem = {
      id: `planet-custom-${Date.now()}`,
      name: newPlanetName.trim(),
      englishName: `Nova ${newPlanetName.trim()}`,
      themeColor: newPlanetTheme,
      gradient: 'from-cyan-400 via-indigo-600 to-purple-950',
      glowColor: `${newPlanetTheme}B3`,
      icon: '🪐',
      description: '个人专属定制的引力波私密时空，记录属于你的星际轨迹与好友共鸣。',
      category: newPlanetCategory,
      citizensCount: 1,
      isJoined: true,
      gravityLevel: '1.00 G',
      atmosphere: '引力波共鸣层',
      temperature: '22°C',
      coordinates: 'RA 12h 00m / Dec +00°00′',
      hasRing: true,
      ringColor: `${newPlanetTheme}88`,
      satellitesCount: 1,
      size: 96,
      orbitRadius: 180,
      orbitSpeed: 25,
      starLord: {
        name: '我 (Alexia)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        title: '创世引力星主',
        motto: '创造属于我们自己的星系。',
      },
      topTags: ['#个人空间', '#引力波共鸣', '#私密记录'],
      moments: [
        {
          id: `pm-custom-${Date.now()}`,
          title: '创世第一篇星际日志',
          authorName: '我 (Alexia)',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          likes: 1,
          time: '刚刚',
          text: `欢迎来到【${newPlanetName.trim()}】！引力核心初始化完毕 ✨`,
          isLiked: true,
        },
      ],
      events: [],
      landmarks: [
        { id: `pl-c1`, name: '引力创生中心', icon: '🌌', checkIns: 1, desc: '星球诞生的引力原点' },
      ],
      citizens: [
        { id: 'c-me', name: '我 (Alexia)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250', role: '星主', motto: '创世引力星主', online: true },
      ],
    };

    onUpdatePlanet(newCustomPlanet);
    setNewPlanetName('');
    setIsCreatingPlanet(false);
    showToast(`🌟 恭喜！新星球【${newCustomPlanet.name}】已在宇宙中诞生！`);
    setSelectedPlanet(newCustomPlanet);
  };

  // If a planet is clicked, render the Planet Homepage (PlanetDetailPage)
  if (selectedPlanet) {
    return (
      <PlanetDetailPage
        planet={selectedPlanet}
        onBack={() => setSelectedPlanet(null)}
        onUpdatePlanet={(updated) => {
          onUpdatePlanet(updated);
          setSelectedPlanet(updated);
        }}
        showToast={showToast}
        onNavigateToMapLocation={onNavigateToMapLocation}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#07080C] text-white flex flex-col overflow-hidden font-sans select-none animate-in fade-in duration-300 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      <style>{`
        @keyframes floatOrbitSlow {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(0, -8px, 0) rotate(180deg); }
          100% { transform: translate3d(0, 0, 0) rotate(360deg); }
        }
        @keyframes cosmicBreathing {
          0%, 100% { transform: scale3d(1, 1, 1); opacity: 0.85; }
          50% { transform: scale3d(1.06, 1.06, 1); opacity: 1; }
        }
        @keyframes starlightTwinkle {
          0%, 100% { opacity: 0.3; transform: scale3d(0.8, 0.8, 1); }
          50% { opacity: 1; transform: scale3d(1.3, 1.3, 1); }
        }
        .animate-cosmic-float {
          animation: floatOrbitSlow 18s ease-in-out infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        .animate-planet-breathing {
          animation: cosmicBreathing 4s ease-in-out infinite;
          will-change: transform, opacity;
          transform: translateZ(0);
        }
        .animate-starlight {
          animation: starlightTwinkle 3s ease-in-out infinite;
          will-change: transform, opacity;
          transform: translateZ(0);
        }
      `}</style>

      {/* Deep Space Background with Dynamic Stars & Nebulae */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src="https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=1600"
          alt="Space Galaxy"
          className="absolute inset-0 w-full h-full object-cover opacity-25 scale-110 filter brightness-90 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07080C]/90 via-[#07080C]/75 to-[#07080C]/95"></div>

        {/* Ambient Glowing Cosmic Dust Clouds */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-600/15 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-1/3 right-8 w-96 h-96 bg-purple-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute top-2/3 left-1/3 w-80 h-80 bg-rose-600/15 rounded-full blur-[130px]"></div>

        {/* Twinkling Starlight Points */}
        <div className="absolute top-14 left-12 w-2 h-2 bg-white rounded-full animate-starlight shadow-[0_0_8px_#fff]"></div>
        <div className="absolute top-32 right-16 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-starlight shadow-[0_0_10px_#22D3EE]" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-8 w-2 h-2 bg-pink-300 rounded-full animate-starlight shadow-[0_0_8px_#F472B6]" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-28 right-24 w-2 h-2 bg-amber-200 rounded-full animate-starlight shadow-[0_0_8px_#FDE68A]" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-16 left-28 w-1.5 h-1.5 bg-purple-300 rounded-full animate-starlight" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Top Space Station Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#07080C]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            <Orbit size={18} className="animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black text-white tracking-wide">宇宙空间 · 探索星球</h2>
              <span className="text-[9.5px] bg-[#1877F2]/30 text-cyan-300 px-1.5 py-0.2 rounded-full border border-cyan-500/30">
                {planets.length} 颗主星运转中
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono">STELLAR COSMIC UNIVERSE</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <button
            onClick={() => setViewMode(viewMode === 'cosmic' ? 'grid' : 'cosmic')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 transition-all cursor-pointer"
            title={viewMode === 'cosmic' ? '切换为矩阵视图' : '切换为宇宙空间视图'}
          >
            {viewMode === 'cosmic' ? <Layers size={16} /> : <Globe size={16} />}
          </button>

          {/* Create Planet Button */}
          <button
            onClick={() => setIsCreatingPlanet(true)}
            className="p-2 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] active:scale-95 transition-all cursor-pointer"
            title="定制新星球"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="px-4 py-2.5 bg-[#07080C]/60 backdrop-blur-sm border-b border-white/10 flex flex-col gap-2 z-20 shrink-0">
        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索星球名称、引力波特征或主题..."
            className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat, idx) => (
            <button
              key={`${cat}-${idx}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Cosmic Space Container */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden z-10 scrollbar-none">
        {viewMode === 'cosmic' ? (
          /* Cosmic 3D Floating Planets Space Canvas */
          <div className="min-h-full p-4 relative flex flex-col items-center justify-center pb-20">
            {/* Central Cosmic Sun / Galaxy Core Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

            {/* Hint Notice */}
            <div className="mb-4 bg-white/5 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-center">
              <span className="text-[11px] text-cyan-300 font-medium flex items-center justify-center gap-1.5">
                <Sparkles size={12} className="animate-spin text-cyan-400" />
                点击任意星球，即刻进入星球主页探索引力波
              </span>
            </div>

            {/* Planets Celestial Cluster */}
            <div className="w-full max-w-lg flex flex-wrap items-center justify-around gap-6 py-4">
              {filteredPlanets.map((planet, index) => {
                // Different sizing & float delays for rich organic cosmic depth
                const isEven = index % 2 === 0;
                const delaySec = (index * 0.75).toFixed(1);

                return (
                  <div
                    key={`cosmic-planet-${planet.id}`}
                    className="flex flex-col items-center group cursor-pointer animate-planet-breathing"
                    style={{ animationDelay: `${delaySec}s` }}
                    onClick={() => {
                      showToast(`🚀 跃迁引擎启动！正在进入【${planet.name}】...`);
                      setSelectedPlanet(planet);
                    }}
                  >
                    {/* Planet Sphere with 3D Gradients, Glow & Ring */}
                    <div className="relative flex items-center justify-center transition-all duration-300 group-hover:scale-115 group-active:scale-95">
                      {/* Atmospheric Glow Corona */}
                      <div
                        className="absolute inset-0 rounded-full blur-xl opacity-65 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ backgroundColor: planet.glowColor }}
                      ></div>

                      {/* Planetary Ring */}
                      {planet.hasRing && (
                        <div
                          className="absolute w-28 h-7 rounded-full border-2 border-dashed pointer-events-none -rotate-12 transition-transform group-hover:rotate-0 duration-500"
                          style={{
                            borderColor: planet.ringColor || planet.themeColor,
                            boxShadow: `0 0 15px ${planet.ringColor || planet.themeColor}`,
                          }}
                        ></div>
                      )}

                      {/* 3D Planet Core */}
                      <div
                        className={`relative w-20 h-20 rounded-full shadow-2xl overflow-hidden flex items-center justify-center bg-gradient-to-tr ${planet.gradient}`}
                        style={{
                          boxShadow: `inset -10px -10px 18px rgba(0,0,0,0.85), 0 0 25px ${planet.glowColor}`,
                        }}
                      >
                        {/* Radial Light Reflection */}
                        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.7),transparent)] pointer-events-none"></div>

                        {/* Planet Theme Emoji/Icon */}
                        <span className="text-2xl filter drop-shadow-md select-none group-hover:scale-125 transition-transform duration-300">
                          {planet.icon}
                        </span>
                      </div>

                      {/* Orbiting Satellite Indicator */}
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-[10px] text-cyan-300 shadow">
                        <Zap size={10} className="text-amber-400 animate-pulse" />
                      </div>
                    </div>

                    {/* Planet Label Info */}
                    <div className="mt-2.5 flex flex-col items-center">
                      <span className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors drop-shadow-md">
                        {planet.name}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9.5px] text-gray-400 font-mono">
                          {planet.citizensCount.toLocaleString()} 居民
                        </span>
                        {planet.isJoined && (
                          <span className="text-[8.5px] bg-emerald-500/20 text-emerald-300 px-1 rounded border border-emerald-500/40">
                            已入籍
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Matrix Grid List View */
          <div className="p-4 space-y-3 max-w-md mx-auto pb-20">
            {filteredPlanets.map((planet) => (
              <div
                key={`list-planet-${planet.id}`}
                onClick={() => {
                  showToast(`🚀 跃迁引擎启动！正在进入【${planet.name}】...`);
                  setSelectedPlanet(planet);
                }}
                className="p-3.5 bg-white/5 border border-white/10 hover:border-cyan-400/50 rounded-2xl backdrop-blur-md transition-all active:scale-98 cursor-pointer flex items-center justify-between shadow-lg group"
              >
                <div className="flex items-center gap-3">
                  {/* Planet Icon Orb */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gradient-to-tr ${planet.gradient} shadow-md shrink-0 relative`}
                    style={{
                      boxShadow: `0 0 15px ${planet.glowColor}`,
                    }}
                  >
                    <span>{planet.icon}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors">
                        {planet.name}
                      </h4>
                      <span className="text-[9px] bg-white/10 text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                        {planet.category}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-gray-400 line-clamp-1 mt-0.5">{planet.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[9.5px] text-gray-400 font-mono">
                      <span>👥 {planet.citizensCount.toLocaleString()} 居民</span>
                      <span>⚡ 重力 {planet.gravityLevel}</span>
                      <span>🛰️ {planet.satellitesCount} 空间站</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-gray-400 group-hover:text-white transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Status / Fast Entry Bar */}
      <div className="px-4 py-3 bg-[#07080C]/90 border-t border-white/10 shrink-0 backdrop-blur-md z-20 flex items-center justify-between text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-[#1877F2] animate-pulse" />
          <span className="text-[11px]">全宇宙引力波网络已连接 · 实时同步中</span>
        </div>

        <button
          onClick={() => setIsCreatingPlanet(true)}
          className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-full text-[11px] font-bold text-white shadow active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus size={12} strokeWidth={2.5} />
          <span>定制新星球</span>
        </button>
      </div>

      {/* Create Custom Planet Modal */}
      {isCreatingPlanet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#16181F] border border-white/20 rounded-[28px] p-5 text-white shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Orbit size={18} className="text-cyan-400" />
                <h3 className="text-sm font-extrabold">创生定制新星球</h3>
              </div>
              <button
                onClick={() => setIsCreatingPlanet(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomPlanet} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] text-gray-400 font-bold mb-1">星球名称</label>
                <input
                  type="text"
                  value={newPlanetName}
                  onChange={(e) => setNewPlanetName(e.target.value)}
                  placeholder="例如：时光纪元·音乐星"
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 font-bold mb-1">星球主题分类</label>
                <select
                  value={newPlanetCategory}
                  onChange={(e) => setNewPlanetCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="科技 · 赛博" className="bg-[#16181F]">科技 · 赛博</option>
                  <option value="浪漫 · 治愈" className="bg-[#16181F]">浪漫 · 治愈</option>
                  <option value="自然 · 秘境" className="bg-[#16181F]">自然 · 秘境</option>
                  <option value="户外 · 探险" className="bg-[#16181F]">户外 · 探险</option>
                  <option value="生活 · 慢调" className="bg-[#16181F]">生活 · 慢调</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 font-bold mb-1">星体主色调</label>
                <div className="flex items-center gap-2">
                  {['#06B6D4', '#EC4899', '#1877F2', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B'].map((color, cIdx) => (
                    <button
                      key={`${color}-${cIdx}`}
                      type="button"
                      onClick={() => setNewPlanetTheme(color)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        newPlanetTheme === color ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPlanet(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!newPlanetName.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 disabled:opacity-40 text-white rounded-full text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.6)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>立即创生</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
