import React, { useState, useEffect } from 'react';
import './iphone-frame.css';
import {
  Wifi,
  Signal,
  Sparkles,
  Music,
  Palette,
  Compass,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react';

export type IPhoneColor =
  | 'titanium-black'
  | 'titanium-natural'
  | 'titanium-desert'
  | 'titanium-blue'
  | 'titanium-white';

interface IPhone17ProFrameProps {
  children: React.ReactNode;
  userNote?: string;
  attachedEmoji?: string;
  currentTab?: string;
  immersive?: boolean;
  desktopCanvasContent?: React.ReactNode;
}

const COLOR_CONFIGS: Record<
  IPhoneColor,
  {
    name: string;
    bezelClass: string;
    edgeClass: string;
    buttonClass: string;
    accentColor: string;
    bgAccent: string;
  }
> = {
  'titanium-black': {
    name: '深空黑钛',
    bezelClass: 'bg-[#18181b] border-[#27272a]',
    edgeClass: 'border-[#3f3f46]',
    buttonClass: 'bg-[#27272a] hover:bg-[#3f3f46]',
    accentColor: '#38bdf8',
    bgAccent: 'from-zinc-900 to-black',
  },
  'titanium-natural': {
    name: '原色钛金属',
    bezelClass: 'bg-[#52525b] border-[#71717a]',
    edgeClass: 'border-[#a1a1aa]',
    buttonClass: 'bg-[#71717a] hover:bg-[#a1a1aa]',
    accentColor: '#fbbf24',
    bgAccent: 'from-zinc-800 to-zinc-950',
  },
  'titanium-desert': {
    name: '沙漠钛金',
    bezelClass: 'bg-[#78614e] border-[#967d67]',
    edgeClass: 'border-[#b59b84]',
    buttonClass: 'bg-[#967d67] hover:bg-[#b59b84]',
    accentColor: '#f59e0b',
    bgAccent: 'from-amber-950/80 to-zinc-950',
  },
  'titanium-blue': {
    name: '深海钛蓝',
    bezelClass: 'bg-[#1e293b] border-[#334155]',
    edgeClass: 'border-[#475569]',
    buttonClass: 'bg-[#334155] hover:bg-[#475569]',
    accentColor: '#60a5fa',
    bgAccent: 'from-slate-900 to-sky-950',
  },
  'titanium-white': {
    name: '极光白钛',
    bezelClass: 'bg-[#e4e4e7] border-[#d4d4d8]',
    edgeClass: 'border-[#ffffff]',
    buttonClass: 'bg-[#d4d4d8] hover:bg-[#e4e4e7]',
    accentColor: '#0ea5e9',
    bgAccent: 'from-zinc-800 to-zinc-900',
  },
};

export const IPhone17ProFrame: React.FC<IPhone17ProFrameProps> = ({
  children,
  userNote = '音乐不停，分享不止...',
  attachedEmoji = '😜',
  currentTab,
  immersive = false,
  desktopCanvasContent,
}) => {
  const [phoneColor, setPhoneColor] = useState<IPhoneColor>('titanium-black');
  const [isDynamicIslandExpanded, setIsDynamicIslandExpanded] = useState(false);
  const [islandMode, setIslandMode] = useState<'radar' | 'music'>('radar');
  const [currentTime, setCurrentTime] = useState('09:41');
  const [isFitToScreen, setIsFitToScreen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [studioTheme, setStudioTheme] = useState<'dark' | 'light'>('dark');

  // Live time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const currentColor = COLOR_CONFIGS[phoneColor];

  return (
    <div
      className={`relative w-full h-full min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden select-none font-sans transition-colors duration-300 p-0 sm:p-3 md:p-6 ${
        studioTheme === 'dark'
          ? 'bg-[#090a0f] text-white'
          : 'bg-[#F0F2F5] text-gray-800'
      }`}
    >
      {/* Subtle Studio Glow in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] opacity-30 transition-all ${
            phoneColor === 'titanium-black'
              ? 'bg-blue-600/30'
              : phoneColor === 'titanium-desert'
              ? 'bg-amber-600/30'
              : phoneColor === 'titanium-blue'
              ? 'bg-sky-500/30'
              : phoneColor === 'titanium-natural'
              ? 'bg-zinc-400/20'
              : 'bg-indigo-400/20'
          }`}
        />
      </div>

      {/* Top Floating Pro Toolbar */}
      <header
        className={`hidden sm:flex items-center justify-between w-full max-w-[480px] px-4 py-1.5 mb-2 z-40 text-xs backdrop-blur-xl rounded-full border shadow-lg transition-all ${
          studioTheme === 'dark'
            ? 'bg-black/60 border-white/10 text-white/80'
            : 'bg-white/80 border-gray-200 text-gray-700'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Smartphone size={15} className="text-[#1877F2]" />
          <span className="font-bold tracking-tight text-xs">
            iPhone 17 Pro Plus
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-[10px] text-blue-400 font-mono font-bold">
            6.9" 视网膜
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Color Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                studioTheme === 'dark'
                  ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-800'
              }`}
              title="切换 iPhone 钛金属机身配色"
            >
              <Palette size={12} className="text-amber-400" />
              <span>{currentColor.name}</span>
            </button>

            {showColorPicker && (
              <div className="absolute right-0 top-8 z-50 bg-zinc-900/95 border border-white/15 rounded-2xl p-2 shadow-2xl backdrop-blur-xl flex flex-col space-y-1 min-w-[125px] animate-in fade-in zoom-in-95">
                {(Object.keys(COLOR_CONFIGS) as IPhoneColor[]).map((key) => {
                  const cfg = COLOR_CONFIGS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setPhoneColor(key);
                        setShowColorPicker(false);
                      }}
                      className={`flex items-center space-x-2 px-2 py-1.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                        phoneColor === key
                          ? 'bg-[#1877F2] text-white font-bold'
                          : 'text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full border border-white/30 ${
                          key === 'titanium-black'
                            ? 'bg-zinc-900'
                            : key === 'titanium-natural'
                            ? 'bg-zinc-500'
                            : key === 'titanium-desert'
                            ? 'bg-[#b59b84]'
                            : key === 'titanium-blue'
                            ? 'bg-slate-700'
                            : 'bg-zinc-200'
                        }`}
                      />
                      <span>{cfg.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dynamic Island Trigger */}
          <button
            onClick={() => {
              setIsDynamicIslandExpanded(!isDynamicIslandExpanded);
              setIslandMode(islandMode === 'radar' ? 'music' : 'radar');
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              isDynamicIslandExpanded
                ? 'bg-sky-500/20 text-sky-400 border-sky-400/40'
                : studioTheme === 'dark'
                ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-800'
            }`}
            title="测试灵动岛展开"
          >
            <Sparkles size={12} className="text-sky-400" />
            <span>灵动岛</span>
          </button>

          {/* Studio Theme Toggle */}
          <button
            onClick={() => setStudioTheme(studioTheme === 'dark' ? 'light' : 'dark')}
            className={`p-1.5 rounded-full transition-all cursor-pointer border ${
              studioTheme === 'dark'
                ? 'bg-white/10 hover:bg-white/20 border-white/10 text-amber-300'
                : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
            }`}
            title="切换背景影棚明暗"
          >
            {studioTheme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </header>

      {/* Main iPhone 17 Pro Plus Chassis Assembly */}
      <main
        className={`relative transition-all duration-300 flex items-center justify-center ${
          isFitToScreen
            ? 'w-full h-full'
            : 'w-full max-w-[430px] h-[100dvh] sm:h-[860px] md:h-[890px]'
        }`}
      >
        {/* Hardware Action Button on Left Bezel */}
        <div
          className="hidden sm:block absolute -left-[5px] top-[110px] w-[5px] h-[30px] rounded-l-md bg-gradient-to-r from-orange-500 to-amber-600 shadow-md cursor-pointer hover:brightness-125 z-10"
          title="Action Button (操作按钮)"
        />
        {/* Volume Up */}
        <div
          className="hidden sm:block absolute -left-[5px] top-[155px] w-[5px] h-[52px] rounded-l-md bg-zinc-700 shadow-md cursor-pointer hover:brightness-125 z-10"
          title="音量增加"
        />
        {/* Volume Down */}
        <div
          className="hidden sm:block absolute -left-[5px] top-[218px] w-[5px] h-[52px] rounded-l-md bg-zinc-700 shadow-md cursor-pointer hover:brightness-125 z-10"
          title="音量减少"
        />

        {/* Power / Siri Button on Right Bezel */}
        <div
          className="hidden sm:block absolute -right-[5px] top-[165px] w-[5px] h-[72px] rounded-r-md bg-zinc-700 shadow-md cursor-pointer hover:brightness-125 z-10"
          title="电源 / Siri 按钮"
        />
        {/* Camera Control Button (iPhone 16/17 Series) */}
        <div
          className="hidden sm:block absolute -right-[4px] top-[280px] w-[4px] h-[46px] rounded-r-md bg-zinc-800 border-l border-zinc-600 shadow-inner cursor-pointer hover:brightness-125 z-10"
          title="相机控制电容按键 (Camera Control)"
        />

        {/* Outer Titanium Chassis Frame */}
        <div
          className={`relative w-full h-full sm:rounded-[56px] p-0 sm:p-[10px] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-white/20 overflow-hidden flex flex-col transition-all duration-300 ${currentColor.bezelClass}`}
        >
          {/* Subtle Metallic Bezel Chamfer Highlight */}
          <div className="hidden sm:block absolute inset-0 rounded-[56px] pointer-events-none border-[1.5px] border-white/25 shadow-inner" />

          {/* Inner Screen Display Bezel with CSS Transform isolation for modals */}
          <div
            className={`phone-screen ${immersive ? "is-immersive" : ""} relative w-full h-full sm:rounded-[46px] bg-white dark:bg-black overflow-hidden flex flex-col border sm:border-black/80 [transform:translateZ(0)] isolate`}
          >
            {/* iOS 19/20 Top Status Bar & Dynamic Island Layer */}
            <div
              aria-label="手机悬浮状态栏"
              className="phone-status-floating h-[44px] shrink-0 relative z-40 flex items-center justify-between px-6 select-none text-[#050505] dark:text-white transition-colors duration-300"
            >
              {/* Left: Clock */}
              <div className="phone-status-clock flex items-center space-x-1.5 cursor-default z-10">
                <span className="text-[13px] font-bold tracking-tight font-sans text-[#050505] dark:text-white">
                  {currentTime}
                </span>
                <div
                  className="w-1.5 h-1.5 rounded-full bg-[#1877F2] animate-pulse"
                  title="定位使用中"
                />
              </div>

              {/* Center: Interactive Dynamic Island (灵动岛) */}
              <div
                onClick={() => {
                  setIsDynamicIslandExpanded(!isDynamicIslandExpanded);
                  setIslandMode(islandMode === 'radar' ? 'music' : 'radar');
                }}
                className={`cursor-pointer absolute left-1/2 -translate-x-1/2 top-2 bg-black rounded-full transition-all duration-300 ease-spring flex items-center justify-between px-3 shadow-xl z-50 border border-white/10 ${
                  isDynamicIslandExpanded
                    ? 'w-[270px] h-[46px] rounded-[23px] px-3.5 bg-black/95 ring-1 ring-white/25 shadow-2xl'
                    : 'w-[120px] h-[28px] hover:w-[130px]'
                }`}
                title="点击展开 / 切换灵动岛状态"
              >
                {!isDynamicIslandExpanded ? (
                  <>
                    {/* Compact Mode: Front Camera & Sensor Dot */}
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 ring-1 ring-zinc-800 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-blue-500/80" />
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 flex items-center">
                        5G+
                      </span>
                    </div>

                    {/* Right: Audio Wavelet or Radar Ping */}
                    <div className="flex items-center space-x-0.5 h-3">
                      <span className="w-[2px] h-2 bg-pink-500 rounded-full animate-pulse" />
                      <span className="w-[2px] h-3.5 bg-purple-400 rounded-full animate-pulse delay-75" />
                      <span className="w-[2px] h-1.5 bg-sky-400 rounded-full animate-pulse delay-150" />
                    </div>
                  </>
                ) : (
                  /* Expanded Mode: Rich Island Widget */
                  <div className="w-full flex items-center justify-between animate-in fade-in duration-200">
                    {islandMode === 'radar' ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md">
                            <Compass size={14} className="text-white animate-spin-slow" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-[11px] font-bold text-white leading-tight">
                              Stellar 灵动雷达
                            </span>
                            <span className="text-[9px] text-zinc-400">
                              实时扫描 8位 好友在线
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            已就绪
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                            <Music size={14} className="text-white" />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-[11px] font-bold text-white leading-tight truncate max-w-[110px]">
                              周杰伦 - 晴天
                            </span>
                            <span className="text-[9px] text-zinc-400">
                              便签音乐播放中
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-pink-400 text-xs">
                          <span className="text-base">{attachedEmoji}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Status Icons (Cellular, WiFi, Battery) */}
              <div aria-label="信号、无线网络与电量" className="phone-status-icons flex items-center cursor-default z-10 transition-colors text-[#050505] dark:text-white">
                <Signal size={12} className="stroke-[2.5]" />
                <Wifi size={13} className="stroke-[2.5]" />
                {/* Floating battery icon */}
                <div className="flex items-center gap-1 transition-colors">
                  <span className="text-[10px] font-bold">98%</span>
                  <div className="w-3.5 h-2 rounded-[2px] border p-[1px] flex items-center border-[#050505] dark:border-white">
                    <div className="w-full h-full bg-emerald-400 rounded-[1px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Application Screen Core Viewport */}
            <div id="stellar-phone-content" className="flex-1 relative w-full overflow-hidden flex flex-col transition-colors duration-300 bg-white dark:bg-black">
              {children}
            </div>

            {/* iOS Bottom Home Indicator Bar */}
            <div className="phone-home-indicator h-[18px] shrink-0 relative z-40 flex items-center justify-center pointer-events-none border-t bg-white dark:bg-black border-transparent dark:border-zinc-900 transition-colors duration-300">
              <div className="w-32 h-1 rounded-full transition-all shadow-2xs bg-[#050505]/50 dark:bg-white/50 hover:bg-[#050505]/70" />
            </div>
          </div>
        </div>
      </main>

      {/* Desktop Prototype Canvas Layer (outside mobile phone chassis) */}
      {desktopCanvasContent}
    </div>
  );
};
