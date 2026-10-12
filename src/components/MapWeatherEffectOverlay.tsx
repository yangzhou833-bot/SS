import React, { useEffect, useRef } from "react";

interface MapWeatherEffectOverlayProps {
  condition: string;
  enabled?: boolean;
  manualWeatherOverride?: string | null;
  mapStyle?: string;
  isDarkMode?: boolean;
}

export const MapWeatherEffectOverlay: React.FC<MapWeatherEffectOverlayProps> = ({
  condition,
  enabled = true,
  manualWeatherOverride,
  mapStyle,
  isDarkMode = false,
}) => {
  const isDark = isDarkMode || mapStyle === "dark";
  const activeCondition = manualWeatherOverride || condition || "晴朗";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isRain =
    activeCondition.includes("雨") ||
    activeCondition.includes("水") ||
    activeCondition.includes("湿");
  const isThunder = activeCondition.includes("雷");
  const isSnow =
    activeCondition.includes("雪") ||
    activeCondition.includes("冰") ||
    activeCondition.includes("❄️");
  const isFog =
    activeCondition.includes("雾") ||
    activeCondition.includes("霾") ||
    activeCondition.includes("阴");
  const isSunny =
    !isDark &&
    !isRain &&
    !isSnow &&
    !isFog &&
    (activeCondition.includes("晴") ||
      activeCondition.includes("阳") ||
      activeCondition.includes("☀️") ||
      activeCondition.includes("🌤️"));

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle setups
    let particles: Array<{
      x: number;
      y: number;
      length?: number;
      speed: number;
      opacity: number;
      radius?: number;
      drift?: number;
    }> = [];

    if (isRain || isThunder) {
      const count = isThunder ? 110 : 70;
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 12 + Math.random() * 18,
        speed: 14 + Math.random() * 12,
        opacity: 0.3 + Math.random() * 0.5,
      }));
    } else if (isSnow) {
      const count = 60;
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 2 + Math.random() * 3.5,
        speed: 1 + Math.random() * 2,
        opacity: 0.5 + Math.random() * 0.4,
        drift: Math.random() * Math.PI * 2,
      }));
    } else if (isSunny) {
      // Dust motes in sunlight
      const count = 25;
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 2,
        speed: 0.3 + Math.random() * 0.5,
        opacity: 0.2 + Math.random() * 0.4,
        drift: Math.random() * Math.PI * 2,
      }));
    }

    let lightningTimer = 0;
    let isFlashing = false;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Rain / Thunderstorm Animation
      if (isRain || isThunder) {
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = isThunder ? "rgba(220, 240, 255, 0.75)" : "rgba(180, 220, 255, 0.55)";

        particles.forEach((p) => {
          ctx.beginPath();
          ctx.globalAlpha = p.opacity;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 3, p.y + (p.length || 15));
          ctx.stroke();

          p.y += p.speed;
          p.x -= 0.6;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        });

        // Lightning flash effect for Thunderstorm
        if (isThunder) {
          lightningTimer++;
          if (lightningTimer % 160 === 0 && Math.random() > 0.3) {
            isFlashing = true;
            setTimeout(() => {
              isFlashing = false;
            }, 100);
          }
          if (isFlashing) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.fillRect(0, 0, width, height);
          }
        }
      } else if (isSnow) {
        // Snow animation
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.globalAlpha = p.opacity;
          if (p.drift !== undefined) p.drift += 0.02;
          const xOffset = Math.sin(p.drift || 0) * 1.5;
          ctx.arc(p.x + xOffset, p.y, p.radius || 2, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speed;
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        });
      } else if (isSunny) {
        // Sunlight dust motes
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.fillStyle = "rgba(255, 230, 150, 0.8)";
          ctx.globalAlpha = p.opacity;
          if (p.drift !== undefined) p.drift += 0.01;
          p.y -= p.speed * 0.3;
          p.x += Math.cos(p.drift || 0) * 0.5;

          ctx.arc(p.x, p.y, p.radius || 2, 0, Math.PI * 2);
          ctx.fill();

          if (p.y < 0) p.y = height + 10;
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [enabled, activeCondition, isRain, isThunder, isSnow, isFog, isSunny]);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-20">
      {/* Canvas for dynamic particles (Rain/Snow/Motes/Lightning) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 1. RAIN / THUNDER ATMOSPHERIC TINT & MIST */}
      {(isRain || isThunder) && (
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-cyan-900/5 to-transparent pointer-events-none transition-opacity duration-700">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-sky-400/10 to-transparent backdrop-blur-[0.5px]" />
        </div>
      )}

      {/* 2. SNOW FROST VIGNETTE */}
      {isSnow && (
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-700">
          <div className="absolute inset-0 ring-12 ring-inset ring-white/25 blur-md" />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/30 to-transparent backdrop-blur-[0.5px]" />
        </div>
      )}

      {/* 3. SUNNY SUNBEAM LIGHT RAYS */}
      {isSunny && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-700">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-amber-300/30 via-yellow-200/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/25 rounded-full blur-xl animate-pulse" />
          <div className="absolute -top-20 right-0 w-[500px] h-[800px] bg-gradient-to-b from-amber-200/15 via-amber-100/5 to-transparent origin-top-right rotate-[-25deg] pointer-events-none" />
        </div>
      )}

      {/* 4. FOG / MIST ROLLING CLOUDS */}
      {isFog && (
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-700">
          <div className="absolute inset-0 bg-slate-200/15 backdrop-blur-[1px]" />
          <div className="absolute top-1/4 -left-20 w-[120%] h-32 bg-white/25 rounded-full blur-2xl animate-[driftCloud_20s_linear_infinite]" />
          <div className="absolute top-2/3 -right-20 w-[120%] h-40 bg-white/20 rounded-full blur-2xl animate-[driftCloud_28s_linear_infinite_reverse]" />
        </div>
      )}
    </div>
  );
};
