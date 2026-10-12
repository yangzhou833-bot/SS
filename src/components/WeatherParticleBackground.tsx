import React, { useMemo } from 'react';

interface WeatherParticleBackgroundProps {
  condition: string; // e.g. "小雨", "大雪", "多云", "晴"
}

export const WeatherParticleBackground: React.FC<WeatherParticleBackgroundProps> = ({ condition }) => {
  const isRain = condition.includes('雨') || condition.includes('雷') || condition.includes('水');
  const isSnow = condition.includes('雪') || condition.includes('冰');
  const isCloud = condition.includes('云') || condition.includes('阴') || condition.includes('雾') || condition.includes('霾');

  // Generate particles based on condition
  const particles = useMemo(() => {
    if (isRain) {
      return Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${0.6 + Math.random() * 0.8}s`,
        delay: `${Math.random() * 2}s`,
        opacity: 0.3 + Math.random() * 0.5,
        height: `${18 + Math.random() * 20}px`,
      }));
    } else if (isSnow) {
      return Array.from({ length: 35 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${3 + Math.random() * 4}s`,
        delay: `${Math.random() * 3}s`,
        size: `${6 + Math.random() * 8}px`,
        opacity: 0.4 + Math.random() * 0.5,
      }));
    } else if (isCloud) {
      return Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        top: `${10 + i * 15}%`,
        duration: `${15 + Math.random() * 15}s`,
        delay: `${i * 2}s`,
        width: `${120 + Math.random() * 180}px`,
        opacity: 0.2 + Math.random() * 0.25,
      }));
    }
    return [];
  }, [condition, isRain, isSnow, isCloud]);

  if (!isRain && !isSnow && !isCloud) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
      {isRain && particles.map((p: any) => (
        <div
          key={`rain-p-${p.id}`}
          className="absolute bg-gradient-to-b from-blue-300/40 via-blue-400/80 to-blue-500 w-[1.5px] rounded-full animate-rain-drop"
          style={{
            left: p.left,
            top: '-30px',
            height: p.height,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
          }}
        />
      ))}

      {isSnow && particles.map((p: any) => (
        <div
          key={`snow-p-${p.id}`}
          className="absolute bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-snow-flake"
          style={{
            left: p.left,
            top: '-20px',
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      ))}

      {isCloud && particles.map((p: any) => (
        <div
          key={`cloud-p-${p.id}`}
          className="absolute bg-white/40 blur-xl rounded-full animate-drift-cloud"
          style={{
            top: p.top,
            left: '-200px',
            width: p.width,
            height: '60px',
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
          }}
        />
      ))}
    </div>
  );
};
