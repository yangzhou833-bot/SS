import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  Sliders,
  Image as ImageIcon,
  Link2,
  Layers,
  Flame,
  Zap,
  Star,
  Trophy,
  Check,
  Tv,
  Gamepad2,
  ChevronRight,
  Send,
  Plus,
  Compass,
  Smile,
  Clock,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface QuickEditsStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (message: string) => void;
  showToast: (msg: string) => void;
}

type MaterialTheme = 'clay' | 'wool' | 'crt' | 'pixel';

export const QuickEditsStudioModal: React.FC<QuickEditsStudioModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  showToast,
}) => {
  // State management
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [materialTheme, setMaterialTheme] = useState<MaterialTheme>('clay');
  const [activeTab, setActiveTab] = useState<'editor' | 'play' | 'assets' | 'cheats'>('editor');
  
  // Game & Timer State
  const [gameTimer, setGameTimer] = useState<number>(151); // 2:31 = 151 seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [starsCount, setStarsCount] = useState<number>(3);
  const [score, setScore] = useState<number>(180);
  const [isWinCelebration, setIsWinCelebration] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [activeCheats, setActiveCheats] = useState<{ [key: string]: boolean }>({
    infiniteTime: false,
    superJump: false,
    autoScore: false,
    zeroGravity: false,
  });

  // Prompt & Chips State
  const [promptText, setPromptText] = useState<string>(
    'make a 🏞️ 8-bit game . I use ↗️ ↖️ to navigate and 👆 to jump. looks like CLAY. Show a timer ↗️ . oh and lots of 🎉 when I win'
  );
  const [activeQuickChips, setActiveQuickChips] = useState<string[]>([
    '🔥 粘土拟物',
    '🏀 投篮物理',
    '📺 CRT滤镜',
    '🧶 羊毛织物',
    '⚡ 超级跳跃',
    '🎉 满天彩带',
    '⏱️ 倒计时',
    '👾 像素复古',
  ]);

  // Interactive Mini-game (Clay Basketball / Jump) state
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 70 });
  const [isDraggingBall, setIsDraggingBall] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aimVector, setAimVector] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('Alexia · 粘土骑士');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const playCanvasRef = useRef<HTMLDivElement>(null);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && !activeCheats.infiniteTime && isOpen) {
      interval = setInterval(() => {
        setGameTimer((prev) => {
          if (prev <= 1) {
            return 151; // loop back or restart
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeCheats.infiniteTime, isOpen]);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Trigger win celebration
  const triggerWin = () => {
    setIsWinCelebration(true);
    setShowConfetti(true);
    setStarsCount(5);
    setScore((prev) => prev + 100);
    showToast('🏆 胜利达成！WIN! 满星通关与华丽彩带已发射 🎉');
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  // Restart game
  const handleRestartGame = () => {
    setGameTimer(151);
    setStarsCount(3);
    setScore(0);
    setIsWinCelebration(false);
    setShowConfetti(false);
    setBallPos({ x: 50, y: 70 });
    showToast('🔄 游戏状态已重置 (Restart Game)');
  };

  // Insert chip tag into prompt text
  const handleInsertTag = (tag: string) => {
    setPromptText((prev) => `${prev} ${tag}`);
    showToast(`已插入指令标签: ${tag}`);
  };

  // Handle Make action
  const handleMakeBuild = () => {
    showToast('🚀 Quick Edits 指令已编译！正在生成粘土物理与渲染管线...');
    setActiveTab('play');
    triggerWin();
  };

  // Basketball shooting simulation
  const handleShootBall = () => {
    // Animate ball moving towards basket (80%, 25%)
    setBallPos({ x: 80, y: 25 });
    setTimeout(() => {
      setScore((prev) => prev + 30);
      setStarsCount((prev) => Math.min(5, prev + 1));
      showToast('🏀 空心入网！SWISH! +30分 🌟');
      if (starsCount >= 4) {
        triggerWin();
      }
      setTimeout(() => {
        setBallPos({ x: 50, y: 70 });
      }, 900);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md select-none font-sans overflow-hidden animate-in fade-in duration-200">
      {/* 3D Confetti Particle Explosion */}
      {showConfetti && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="absolute w-full h-full animate-bounce">
            {Array.from({ length: 42 }).map((_, i) => {
              const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
              const randomColor = colors[i % colors.length];
              const randomLeft = `${(i * 2.3) % 100}%`;
              const randomDelay = `${(i * 0.08) % 1.5}s`;
              const randomDuration = `${1.2 + (i % 5) * 0.3}s`;
              const randomSize = `${8 + (i % 8) * 3}px`;
              return (
                <div
                  key={i}
                  className="absolute top-0 rounded-sm animate-pulse"
                  style={{
                    left: randomLeft,
                    width: randomSize,
                    height: randomSize,
                    backgroundColor: randomColor,
                    transform: `rotate(${i * 24}deg)`,
                    animation: `rainDrop ${randomDuration} ease-out ${randomDelay} infinite`,
                    boxShadow: `0 0 10px ${randomColor}`,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Main Studio Card Container */}
      <div
        className={`relative w-full ${
          isFullScreen ? 'h-full max-w-none rounded-none' : 'max-w-[490px] h-full sm:h-[92vh] max-h-[860px] rounded-[36px]'
        } bg-[#0b0e14] border border-[#2e3645] shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-[#d6deee] transition-all duration-300`}
        style={{
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 20px 50px rgba(0,0,0,0.9)',
        }}
      >
        {/* ================= 2.1 顶部状态栏 ================= */}
        <div className="relative px-4 py-2.5 bg-[#141b26]/90 border-b border-[#2e3645] flex items-center justify-between z-30 shrink-0">
          {/* Left: Quick Edits Brand Badge */}
          <div className="flex items-center space-x-2">
            <div className="bg-[#10b981] hover:bg-[#059669] text-black px-2.5 py-1 rounded-full font-black text-[10.5px] tracking-wider flex items-center space-x-1.5 shadow-[0_2px_8px_rgba(16,185,129,0.4)] cursor-pointer active:scale-95 transition-transform">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span className="font-extrabold uppercase">QUICK EDITS</span>
            </div>
            <span className="text-[10px] text-[#99aac9] font-mono hidden sm:inline-block">
              Google Studio v1.0
            </span>
          </div>

          {/* Center: System Header title */}
          <div className="text-xs font-bold text-white/90 tracking-wide flex items-center space-x-1">
            <span>Create Game</span>
          </div>

          {/* Right: Time & Modal Window Actions */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-[11px] font-mono text-[#99aac9] bg-[#0b0e14]/60 px-2 py-0.5 rounded-md border border-[#2e3645]/60">
              <Clock size={11} className="text-[#10b981]" />
              <span>09:01</span>
            </div>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1 rounded-full text-[#99aac9] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isFullScreen ? '还原' : '全屏'}
              aria-label="切换全屏"
            >
              {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#d6deee] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="关闭"
              aria-label="关闭窗口"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ================= STICKERS LAYER (3D 触感贴纸背景装饰) ================= */}
        {/* Top-Left: WOOL 3D Pink Knitted Sticker */}
        <div
          onClick={() => {
            setMaterialTheme('wool');
            showToast('🧶 材质已切换为：WOOL 羊毛织物');
          }}
          className="absolute top-12 -left-2 z-20 cursor-pointer group hover:scale-105 active:scale-95 transition-transform"
          title="点击应用 WOOL 羊毛织物材质"
        >
          <div className="relative px-3 py-1 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 text-white font-black text-[13px] tracking-widest rounded-2xl shadow-[0_8px_20px_rgba(244,63,94,0.45)] border-2 border-white/80 rotate-[-8deg] flex items-center space-x-1">
            <span>🧶</span>
            <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">WOOL</span>
          </div>
        </div>

        {/* Mid-Left: CRT Retro TV Sticker */}
        <div
          onClick={() => {
            setMaterialTheme('crt');
            showToast('📺 滤镜已切换为：CRT 复古显像管');
          }}
          className="absolute top-48 -left-3 z-20 cursor-pointer group hover:scale-105 active:scale-95 transition-transform"
          title="点击应用 CRT 复古滤镜"
        >
          <div className="relative w-14 h-12 bg-gradient-to-b from-gray-800 to-black rounded-xl p-1 shadow-[0_8px_20px_rgba(0,0,0,0.7)] border-2 border-gray-600 rotate-[6deg] flex flex-col items-center justify-center">
            <div className="w-full h-full bg-gradient-to-r from-red-500 via-green-500 via-yellow-400 to-blue-500 rounded-md flex items-center justify-center font-black text-[10px] text-white tracking-tighter shadow-inner">
              <span className="bg-black/70 px-1 py-0.5 rounded text-[8px] font-mono">CRT</span>
            </div>
          </div>
        </div>

        {/* Top-Right: Racing Car with Hand Pressed Sticker */}
        <div
          onClick={() => handleInsertTag('🚗 极速赛道')}
          className="absolute top-11 -right-2 z-20 cursor-pointer group hover:scale-105 active:scale-95 transition-transform"
          title="点击插入 赛车与绿荫贴纸"
        >
          <div className="relative px-2.5 py-1 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl shadow-[0_8px_22px_rgba(16,185,129,0.35)] border-2 border-white/85 rotate-[12deg] flex items-center space-x-1">
            <span className="text-lg">🏎️</span>
            <span className="text-[10px] font-bold text-emerald-100">SPEED</span>
          </div>
        </div>

        {/* Mid-Right: Pixel Dinosaur / Fossil Sticker */}
        <div
          onClick={() => handleInsertTag('🦖 翼龙飞跃')}
          className="absolute top-44 -right-2 z-20 cursor-pointer group hover:scale-105 active:scale-95 transition-transform"
          title="点击插入 翼龙贴纸"
        >
          <div className="relative px-2 py-1 bg-[#452718] text-amber-200 font-mono text-[10px] font-bold rounded-lg border border-amber-500/50 shadow-lg rotate-[-6deg] flex items-center space-x-1">
            <span className="text-base">🦖</span>
            <span className="text-[8px] tracking-tight">DINO-8BIT</span>
          </div>
        </div>

        {/* Bottom-Left: GAME BREAKS / RESTART Yellow Hazard Tape Sticker */}
        <div
          onClick={handleRestartGame}
          className="absolute bottom-28 -left-2 z-20 cursor-pointer group hover:scale-105 active:scale-95 transition-transform"
          title="点击重置游戏 (Restart Game)"
        >
          <div className="relative px-3 py-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-[10px] uppercase tracking-wider rounded-xl shadow-[0_8px_24px_rgba(245,158,11,0.5)] border-2 border-black rotate-[-10deg] flex flex-col leading-tight">
            <div className="flex items-center space-x-1">
              <span>⚠️</span>
              <span>GAME BREAKS</span>
            </div>
            <span className="text-[8px] tracking-widest text-black/80">RESTART ↺</span>
          </div>
        </div>

        {/* Bottom-Right: Golden Maple Leaf Pixel Sticker */}
        <div
          onClick={() => handleInsertTag('🍁 枫叶金币')}
          className="absolute bottom-32 -right-1 z-20 cursor-pointer group hover:scale-105 active:scale-95 transition-transform"
          title="点击插入 金色枫叶"
        >
          <div className="relative p-1.5 bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl shadow-lg border border-amber-300/60 rotate-[15deg]">
            <span className="text-xl">🍁</span>
          </div>
        </div>

        {/* Main Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 flex flex-col gap-3.5 z-10 custom-scrollbar">
          
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between bg-[#141b26] p-1 rounded-2xl border border-[#2e3645] shrink-0">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'editor'
                    ? 'bg-[#2b3860] text-white shadow-md'
                    : 'text-[#99aac9] hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles size={13} className="text-[#38bdf8]" />
                <span>指令编辑 (Studio)</span>
              </button>

              <button
                onClick={() => setActiveTab('play')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'play'
                    ? 'bg-[#1877F2] text-white shadow-md'
                    : 'text-[#99aac9] hover:text-white hover:bg-white/5'
                }`}
              >
                <Gamepad2 size={13} className="text-amber-300" />
                <span>实时试玩 (Play)</span>
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('cheats')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                  activeTab === 'cheats'
                    ? 'bg-purple-900/80 text-purple-200 border border-purple-400'
                    : 'text-[#99aac9] hover:text-white'
                }`}
              >
                <Zap size={12} className="text-yellow-400" />
                <span>Cheats</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-xl text-[#99aac9] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title={soundEnabled ? '音效已开' : '静音'}
                aria-label="音效开关"
              >
                {soundEnabled ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} />}
              </button>
            </div>
          </div>

          {/* ================= 2.2 游戏预览卡片 (Game Preview Card) ================= */}
          <div
            className={`relative rounded-[28px] p-3.5 bg-gradient-to-b from-[#1a1f2a] to-[#121620] border-2 ${
              materialTheme === 'crt'
                ? 'border-green-500/50 shadow-[0_0_25px_rgba(34,197,94,0.2)]'
                : materialTheme === 'wool'
                ? 'border-pink-500/50 shadow-[0_0_25px_rgba(244,63,94,0.2)]'
                : 'border-[#2e3645] shadow-[0_12px_32px_rgba(0,0,0,0.6)]'
            } transition-all duration-300 overflow-hidden shrink-0`}
          >
            {/* CRT Screen Scanline Overlay if CRT theme active */}
            {materialTheme === 'crt' && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20 z-10"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,0,0.15) 0px, transparent 2px, transparent 4px)',
                }}
              />
            )}

            {/* Game Card Header: Game Status & Timer & Stars */}
            <div className="flex items-center justify-between mb-3 relative z-10">
              {/* Left: Material & Badge */}
              <div className="flex items-center space-x-2">
                <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[11px] font-extrabold flex items-center space-x-1.5 shadow-md border border-amber-400/40">
                  <span className="text-sm">🏀</span>
                  <span className="tracking-wider">
                    {materialTheme === 'clay'
                      ? 'CLAY 粘土篮球'
                      : materialTheme === 'wool'
                      ? 'WOOL 羊毛篮球'
                      : materialTheme === 'crt'
                      ? 'CRT 街机投篮'
                      : '8-BIT 像素跳跃'}
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-[#99aac9] border border-white/5">
                  LV.3
                </span>
              </div>

              {/* Center: Realtime Countdown Timer ⏱️ */}
              <div className="flex items-center space-x-1.5 bg-[#0b0e14] px-3 py-1 rounded-full border border-[#2e3645] shadow-inner">
                <Clock size={12} className="text-amber-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-amber-300">
                  {formatTime(gameTimer)}
                </span>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="ml-1 text-[#99aac9] hover:text-white cursor-pointer"
                  title={isTimerRunning ? '暂停计时' : '继续计时'}
                >
                  {isTimerRunning ? <Pause size={10} /> : <Play size={10} />}
                </button>
              </div>

              {/* Right: Stars (🌟) and Score */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={14}
                    className={`transition-transform duration-300 ${
                      idx < starsCount
                        ? 'text-[#fadf8a] fill-[#fadf8a] scale-110 drop-shadow-[0_0_6px_rgba(250,223,138,0.8)]'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
                {isWinCelebration && (
                  <span className="ml-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-[10px] uppercase shadow-lg animate-bounce">
                    WIN!
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Game Stage / Canvas Simulation Area */}
            <div
              ref={playCanvasRef}
              className="relative w-full h-44 rounded-2xl bg-gradient-to-b from-[#090d16] via-[#101726] to-[#0d121c] border border-[#2e3645] overflow-hidden flex flex-col justify-between p-3 select-none"
            >
              {/* Backboard & Basketball Hoop (Top-Right) */}
              <div className="absolute top-4 right-5 flex flex-col items-center">
                {/* Backboard */}
                <div className="w-14 h-11 bg-white/90 rounded-md border-2 border-red-500 shadow-md flex items-center justify-center p-1">
                  <div className="w-6 h-5 border border-red-500 rounded-xs"></div>
                </div>
                {/* Rim */}
                <div className="w-8 h-2 bg-amber-500 rounded-full shadow-md border-t-2 border-amber-600 -mt-1"></div>
                {/* Net */}
                <div className="w-6 h-5 border-x-2 border-b-2 border-white/60 border-dashed rounded-b-md"></div>
              </div>

              {/* Player Avatar / Knight on the court */}
              <div className="absolute bottom-3 left-6 flex flex-col items-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 p-0.5 shadow-lg border-2 border-white flex items-center justify-center text-lg">
                    {materialTheme === 'clay' ? '🧑‍🎨' : materialTheme === 'wool' ? '🧶' : '👾'}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border border-white"></div>
                </div>
                <span className="text-[9px] font-bold text-white/90 mt-1 bg-black/60 px-1.5 py-0.2 rounded">
                  {selectedPlayer.split('·')[0]}
                </span>
              </div>

              {/* Interactive Basketball with Ball Physics */}
              <div
                onClick={handleShootBall}
                className="absolute cursor-pointer transition-all duration-500 ease-out hover:scale-125 active:scale-95"
                style={{
                  left: `${ballPos.x}%`,
                  top: `${ballPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                title="点击投篮！(Shoot Ball)"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d48c5c] to-amber-400 border-2 border-white shadow-[0_4px_12px_rgba(212,140,92,0.8)] flex items-center justify-center text-sm animate-spin-slow">
                    🏀
                  </div>
                  <span className="absolute -bottom-4 whitespace-nowrap text-[8.5px] font-bold text-amber-200 bg-black/70 px-1.5 py-0.5 rounded-full border border-amber-400/40">
                    点我投篮 🎯
                  </span>
                </div>
              </div>

              {/* Court Floor Markings */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-amber-950/40 to-transparent border-t border-amber-500/20"></div>

              {/* In-game Floating Controls */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex items-center space-x-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10.5px]">
                  <Trophy size={12} className="text-amber-400" />
                  <span className="text-gray-300">得分:</span>
                  <span className="font-mono font-bold text-white text-xs">{score}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleShootBall}
                    className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-[11px] shadow-lg hover:brightness-110 active:scale-95 transition-transform cursor-pointer"
                  >
                    🏀 完美出手
                  </button>
                  <button
                    onClick={triggerWin}
                    className="px-2.5 py-1 rounded-full bg-[#10b981] text-black font-black text-[11px] shadow-lg hover:brightness-110 active:scale-95 transition-transform cursor-pointer"
                  >
                    🌟 WIN!
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 2.3 聊天输入与快捷回复区 (Core Interactive Prompt Box) ================= */}
          <div className="relative flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#d6deee] flex items-center space-x-1.5">
                <Sliders size={13} className="text-[#1877F2]" />
                <span>指令与逻辑编排 (Prompt Logic)</span>
              </span>
              <span className="text-[10.5px] text-[#99aac9]">
                {isInputFocused ? '⚡ 正在编辑指令...' : '点击输入框展开'}
              </span>
            </div>

            {/* Main Interactive Input Box with Focus Expand / Quick-chips collapse */}
            <div
              className={`relative rounded-2xl bg-[#141b26] border-2 transition-all duration-200 ${
                isInputFocused
                  ? 'border-[#1877F2] shadow-[0_0_20px_rgba(24,119,242,0.35)] ring-2 ring-[#1877F2]/20'
                  : 'border-[#2e3645] hover:border-[#3e485c]'
              } p-3 flex flex-col justify-between`}
            >
              {/* Rich Prompt Text Editor */}
              <textarea
                id="chatInput"
                ref={inputRef}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                rows={isInputFocused ? 4 : 3}
                placeholder="例如: make a 8-bit basketball game. looks like CLAY. Show a timer and lots of confetti..."
                className="w-full bg-transparent text-[#d6deee] text-xs sm:text-[13px] leading-relaxed font-sans focus:outline-none resize-none placeholder-[#99aac9]/50"
              />

              {/* 3D Inflated Token Badges in the Editor Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2e3645]/60 mt-2">
                <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 custom-scrollbar">
                  {/* CLAY 3D Blue Token */}
                  <span
                    onClick={() => {
                      setMaterialTheme('clay');
                      showToast('🎨 已锁定材质: CLAY 粘土');
                    }}
                    className="cursor-pointer px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10.5px] tracking-wider shadow-[0_4px_10px_rgba(37,99,235,0.5)] border border-blue-300 hover:scale-105 active:scale-95 transition-transform"
                  >
                    CLAY
                  </span>

                  {/* 8-bit Token */}
                  <span
                    onClick={() => handleInsertTag('👾 8-BIT')}
                    className="cursor-pointer px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 hover:scale-105 transition-transform"
                  >
                    [🏞️ 8-bit]
                  </span>

                  {/* Timer Token */}
                  <span
                    onClick={() => handleInsertTag('⏱️ 计时器')}
                    className="cursor-pointer px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40 hover:scale-105 transition-transform"
                  >
                    [⏱️ 2:31]
                  </span>

                  {/* Win Particle Token */}
                  <span
                    onClick={triggerWin}
                    className="cursor-pointer px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-500/40 hover:scale-105 transition-transform"
                  >
                    [🎉 WIN!]
                  </span>
                </div>

                {/* Floating Blue Check Circular Action Button (✓) */}
                <button
                  onClick={handleMakeBuild}
                  className="w-8 h-8 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(24,119,242,0.6)] cursor-pointer active:scale-90 transition-transform shrink-0"
                  title="编译与构建 (Make Game)"
                  aria-label="构建游戏"
                >
                  <Check size={16} className="stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Quick-chips (快捷回复标签 - 联动显示/隐藏规范) */}
            <div
              className={`quick-chips transition-all duration-300 ease-out flex items-center gap-1.5 flex-wrap ${
                isInputFocused
                  ? 'opacity-0 max-h-0 pointer-events-none -translate-y-2 overflow-hidden'
                  : 'opacity-100 max-h-24 translate-y-0'
              }`}
            >
              <span className="text-[11px] text-[#99aac9] font-medium mr-1">快捷指令:</span>
              {activeQuickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInsertTag(chip)}
                  className="px-2.5 py-1 rounded-full bg-[#141b26] hover:bg-[#2b3860] active:bg-[#1877F2] text-[#99aac9] hover:text-white text-[11px] font-medium border border-[#2e3645] hover:border-[#1877F2]/50 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* ================= 2.4 媒体插入栏 (Media Insertion Bar) ================= */}
          <div className="flex items-center justify-between bg-[#141b26] px-3 py-2 rounded-2xl border border-[#2e3645] shrink-0">
            <span className="text-[11px] font-bold text-[#99aac9] flex items-center space-x-1">
              <Layers size={12} className="text-[#10b981]" />
              <span>插入素材 (Insert Assets):</span>
            </span>

            <div className="flex items-center space-x-1.5">
              {/* 图贴 */}
              <button
                onClick={() => {
                  handleInsertTag('🎨 [3D图贴·篮球]');
                  showToast('已插入 3D 图贴素材');
                }}
                className="px-2.5 py-1 rounded-full bg-[#0b0e14] hover:bg-[#2b3860] text-xs font-semibold text-[#d6deee] border border-[#2e3645] flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <ImageIcon size={12} className="text-pink-400" />
                <span>图贴</span>
                <span className="px-1.5 py-0.2 bg-pink-900/60 text-pink-300 text-[9px] rounded-full font-mono">
                  12
                </span>
              </button>

              {/* 卡片 */}
              <button
                onClick={() => {
                  handleInsertTag('🃏 [卡片·三分挑战]');
                  showToast('已插入 挑战卡片组件');
                }}
                className="px-2.5 py-1 rounded-full bg-[#0b0e14] hover:bg-[#2b3860] text-xs font-semibold text-[#d6deee] border border-[#2e3645] flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Layers size={12} className="text-amber-400" />
                <span>卡片</span>
                <span className="px-1.5 py-0.2 bg-amber-900/60 text-amber-300 text-[9px] rounded-full font-mono">
                  8
                </span>
              </button>

              {/* 链接 */}
              <button
                onClick={() => {
                  handleInsertTag('🔗 [链接·Stellar音效库]');
                  showToast('已插入 外部音效链接');
                }}
                className="px-2.5 py-1 rounded-full bg-[#0b0e14] hover:bg-[#2b3860] text-xs font-semibold text-[#d6deee] border border-[#2e3645] flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Link2 size={12} className="text-cyan-400" />
                <span>链接</span>
                <span className="px-1.5 py-0.2 bg-cyan-900/60 text-cyan-300 text-[9px] rounded-full font-mono">
                  3
                </span>
              </button>
            </div>
          </div>

          {/* ================= 2.5 操作按钮组 (Action Buttons Group) ================= */}
          <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
            {/* Left Group: Cheats, Assets, Make */}
            <div className="flex items-center space-x-1.5">
              {/* Cheats Button */}
              <button
                onClick={() => setActiveTab(activeTab === 'cheats' ? 'editor' : 'cheats')}
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                  activeTab === 'cheats'
                    ? 'bg-purple-800 text-white border-purple-400 shadow-md'
                    : 'bg-[#141b26] text-[#99aac9] hover:text-white border-[#2e3645]'
                }`}
              >
                <Zap size={13} className="text-yellow-400" />
                <span>Cheats</span>
              </button>

              {/* Assets Button */}
              <button
                onClick={() => {
                  const nextTheme: MaterialTheme =
                    materialTheme === 'clay'
                      ? 'wool'
                      : materialTheme === 'wool'
                      ? 'crt'
                      : materialTheme === 'crt'
                      ? 'pixel'
                      : 'clay';
                  setMaterialTheme(nextTheme);
                  showToast(`材质库已切换: ${nextTheme.toUpperCase()}`);
                }}
                className="px-3 py-2 rounded-2xl bg-[#141b26] hover:bg-[#1a2332] text-[#99aac9] hover:text-white text-xs font-bold border border-[#2e3645] transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <ImageIcon size={13} className="text-pink-400" />
                <span>Assets ({materialTheme.toUpperCase()})</span>
              </button>

              {/* Make Button (Highlit / Glowing Primary Button) */}
              <button
                onClick={handleMakeBuild}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#1877F2] to-blue-600 hover:from-blue-500 hover:to-indigo-600 text-white text-xs font-black tracking-wide shadow-[0_0_16px_rgba(24,119,242,0.6)] border border-blue-400 flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles size={13} className="text-yellow-300 animate-spin-slow" />
                <span>Make 制作</span>
              </button>
            </div>

            {/* Right Group: PLAYER EXPLORER & Level / Stage */}
            <div className="flex items-center space-x-1.5">
              {/* PLAYER EXPLORER Capsule */}
              <button
                onClick={() => {
                  const players = [
                    'Alexia · 粘土骑士',
                    '8-Bit 像素恐龙',
                    '羊毛绒球小熊',
                    '街机赛车手',
                  ];
                  const currentIdx = players.indexOf(selectedPlayer);
                  const nextPlayer = players[(currentIdx + 1) % players.length];
                  setSelectedPlayer(nextPlayer);
                  showToast(`已切换玩家角色: ${nextPlayer}`);
                }}
                className="px-3 py-1.5 rounded-full bg-[#10b981] hover:bg-[#059669] text-black font-extrabold text-[11px] shadow-[0_4px_12px_rgba(16,185,129,0.35)] flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-transform"
              >
                <span className="text-sm">👾</span>
                <span className="tracking-tight">PLAYER EXPLORER</span>
                <Plus size={12} className="stroke-[3] text-black" />
              </button>

              {/* Level Gate Pill */}
              <button
                onClick={() => {
                  if (onSendToChat) {
                    onSendToChat(`🎮 我在 Quick Edits 制作了粘土篮球小游戏！当前得分: ${score}分 🌟 快来挑战！`);
                    showToast('已将创游作品卡片分享至密友聊天 💬');
                  } else {
                    showToast('创游卡片已准备就绪，可随时分享');
                  }
                }}
                className="p-2 rounded-2xl bg-[#141b26] hover:bg-[#2b3860] text-[#99aac9] hover:text-white border border-[#2e3645] transition-colors cursor-pointer"
                title="分享创游卡片到聊天"
                aria-label="分享卡片"
              >
                <Send size={13} className="text-[#1877F2]" />
              </button>
            </div>
          </div>

          {/* Cheats Panel Expansion (if open) */}
          {activeTab === 'cheats' && (
            <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-2xl flex flex-col gap-2 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-purple-200 flex items-center space-x-1">
                <Zap size={12} className="text-yellow-400" />
                <span>Cheat Codes (作弊码控制台):</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveCheats((prev) => ({ ...prev, infiniteTime: !prev.infiniteTime }));
                    showToast(activeCheats.infiniteTime ? '已关闭无限时间' : '⚡ 已激活: 无限时间 (Infinite Time)');
                  }}
                  className={`p-2 rounded-xl text-left text-[11px] font-bold border transition-all ${
                    activeCheats.infiniteTime
                      ? 'bg-purple-700 text-white border-purple-300 shadow-md'
                      : 'bg-[#141b26] text-purple-200 border-purple-900/60 hover:border-purple-500'
                  }`}
                >
                  ⏱️ 无限倒计时: {activeCheats.infiniteTime ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => {
                    setActiveCheats((prev) => ({ ...prev, superJump: !prev.superJump }));
                    showToast(activeCheats.superJump ? '已关闭超级跳跃' : '⚡ 已激活: 超级跳跃 (Super Jump)');
                  }}
                  className={`p-2 rounded-xl text-left text-[11px] font-bold border transition-all ${
                    activeCheats.superJump
                      ? 'bg-purple-700 text-white border-purple-300 shadow-md'
                      : 'bg-[#141b26] text-purple-200 border-purple-900/60 hover:border-purple-500'
                  }`}
                >
                  🦘 超级跳跃: {activeCheats.superJump ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => {
                    triggerWin();
                  }}
                  className="p-2 rounded-xl text-left text-[11px] font-bold bg-[#141b26] text-amber-300 border border-amber-500/40 hover:bg-amber-950/60 transition-all cursor-pointer"
                >
                  🌟 立即满星通关 (Auto Win)
                </button>

                <button
                  onClick={() => {
                    setScore((prev) => prev + 500);
                    showToast('🪙 金币 +500 分！');
                  }}
                  className="p-2 rounded-xl text-left text-[11px] font-bold bg-[#141b26] text-emerald-300 border border-emerald-500/40 hover:bg-emerald-950/60 transition-all cursor-pointer"
                >
                  🪙 注入 500 游戏金币
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= 2.6 底部状态与指令 (Footer Status Bar) ================= */}
        <div className="px-4 py-2.5 bg-[#141b26]/95 border-t border-[#2e3645] flex items-center justify-between text-[10.5px] text-[#99aac9] z-20 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span>Studio 指令就绪</span>
            <span className="text-[#2e3645]">|</span>
            <span className="text-white/80">增强交互模式</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="bg-[#0b0e14] px-2 py-0.5 rounded text-[9.5px] font-mono border border-[#2e3645]">
              Clay Physics v2.4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
