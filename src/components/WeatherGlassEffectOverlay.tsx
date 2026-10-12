import React, { useMemo } from "react";

interface WeatherGlassEffectOverlayProps {
  condition: string;
  isDarkMode?: boolean;
}

export const WeatherGlassEffectOverlay: React.FC<WeatherGlassEffectOverlayProps> = ({
  condition,
  isDarkMode = false,
}) => {
  const isRain =
    condition.includes("雨") ||
    condition.includes("雷") ||
    condition.includes("水") ||
    condition.includes("湿");
  const isSunny =
    !isDarkMode &&
    (condition.includes("晴") ||
      condition.includes("阳") ||
      condition.includes("☀️") ||
      condition.includes("🌤️"));
  const isSnow =
    condition.includes("雪") ||
    condition.includes("冰") ||
    condition.includes("❄️");
  const isCloudy =
    !isRain &&
    !isSunny &&
    !isSnow &&
    (condition.includes("云") ||
      condition.includes("阴") ||
      condition.includes("雾") ||
      condition.includes("风"));

  // Static condensation water drops for rain effect
  const rainDrops = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      left: `${8 + (i * 13) % 84}%`,
      top: `${10 + ((i * 23) % 75)}%`,
      width: `${4 + (i % 3) * 2}px`,
      height: `${5 + (i % 4) * 3}px`,
      opacity: 0.5 + (i % 5) * 0.1,
      isSliding: i % 3 === 0,
      slideDelay: `${(i * 0.4) % 3}s`,
      slideDuration: `${2.8 + (i % 3) * 0.8}s`,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0 select-none">
      {/* 1. RAIN WATER DROPS ON GLASS EFFECT */}
      {isRain && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent">
          {/* Glass moisture / condensation haze */}
          <div className="absolute inset-0 bg-sky-200/20 dark:bg-sky-900/20 backdrop-blur-[1px]" />

          {/* Static Glass Condensation Beads */}
          {rainDrops.map((drop) =>
            drop.isSliding ? (
              /* Sliding Water Drop */
              <div
                key={`sliding-drop-${drop.id}`}
                className="absolute bg-white/80 dark:bg-sky-200/70 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.2)] border border-white/60 animate-glass-rain-slide"
                style={{
                  left: drop.left,
                  top: drop.top,
                  width: drop.width,
                  height: drop.height,
                  animationDelay: drop.slideDelay,
                  animationDuration: drop.slideDuration,
                }}
              />
            ) : (
              /* Static Water Bead on Glass */
              <div
                key={`static-drop-${drop.id}`}
                className="absolute bg-white/70 dark:bg-sky-200/60 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1.5px_3px_rgba(0,0,0,0.15)] border border-white/70"
                style={{
                  left: drop.left,
                  top: drop.top,
                  width: drop.width,
                  height: drop.height,
                  opacity: drop.opacity,
                }}
              />
            )
          )}

          {/* Rain streak accents */}
          <div className="absolute top-2 right-4 text-[10px] font-bold text-blue-600/60 dark:text-blue-300/60 flex items-center space-x-1">
            <span>💧 玻璃水珠凝结</span>
          </div>
        </div>
      )}

      {/* 2. SUNNY SUNLIGHT & LENS FLARE EFFECT */}
      {!isDarkMode && (isSunny || (!isRain && !isSnow && !isCloudy)) && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-300/15 via-yellow-100/10 to-transparent">
          {/* Solar flare glow at top-right corner */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/30 rounded-full blur-2xl animate-glass-sun-shimmer" />
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-200/40 rounded-full blur-lg animate-pulse" />

          {/* Sunlight Beam Sweep across the glass */}
          <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-amber-200/25 dark:via-amber-400/15 to-transparent -skew-x-12 animate-glass-sun-sweep" />

          {/* Golden warmth badge */}
          <div className="absolute top-2 right-3 text-[10px] font-extrabold text-amber-600/70 dark:text-amber-300/80 flex items-center space-x-0.5">
            <span>☀️ 暖阳漫射</span>
          </div>
        </div>
      )}

      {/* 3. SNOW FROST EFFECT */}
      {isSnow && (
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/25 via-white/10 to-transparent">
          {/* Frosted ice corner texture */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/60 to-transparent backdrop-blur-xs" />
          <div className="absolute bottom-2 right-3 text-[10px] font-bold text-indigo-400/70">
            ❄️ 霜花结晶
          </div>
        </div>
      )}

      {/* 4. CLOUDY / OVERCAST MIST EFFECT */}
      {isCloudy && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/20 via-sky-100/10 to-transparent">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
          <div className="absolute -top-4 -left-10 w-48 h-16 bg-white/40 blur-xl animate-drift-cloud" />
        </div>
      )}
    </div>
  );
};
