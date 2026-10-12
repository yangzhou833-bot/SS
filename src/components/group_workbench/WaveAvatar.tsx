import React from 'react';
import { SquadBorderConfig } from './types';

interface WaveAvatarProps {
  src: string;
  name: string;
  size?: number;
  isCaptain?: boolean;
  badgeIcon?: string;
  borderConfig?: SquadBorderConfig;
  className?: string;
}

export const WaveAvatar: React.FC<WaveAvatarProps> = ({
  src,
  name,
  size = 40,
  isCaptain = false,
  badgeIcon = '⚡',
  borderConfig,
  className = '',
}) => {
  const color = borderConfig?.color || '#1877F2';
  const badge = borderConfig?.badge || badgeIcon;
  const styleType = borderConfig?.style || 'wavy';

  // Svg dynamic wave path calculation for distinctive squad wave border
  const half = size / 2;
  const radius = half - 2;

  // Wave ripple and rotation keyframes rendered inline for smooth CSS animation
  const waveAnimationClass = 'animate-[spin_10s_linear_infinite]';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
      style={{ width: size, height: size }}
      title={`${name} ${isCaptain ? '(小队长)' : '(小队成员)'}`}
    >
      {/* Outer CSS Wave Glow Layer */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none opacity-40 animate-ping"
        style={{
          backgroundColor: color,
          animationDuration: '3s',
        }}
      />

      {/* Wave border SVG container with CSS smooth rotation animation */}
      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none ${waveAnimationClass}`}
        viewBox={`0 0 ${size} ${size}`}
      >
        {styleType === 'wavy' ? (
          <path
            d={`
              M ${half} 2
              C ${half + radius * 0.55} -0.5, ${half + radius * 0.95} 3.5, ${size - 2} ${half * 0.55}
              C ${size + 0.5} ${half}, ${size - 3.5} ${half + radius * 0.65}, ${half + radius * 0.75} ${size - 2}
              C ${half} ${size + 0.5}, ${half - radius * 0.65} ${size - 2.5}, 2 ${half + radius * 0.55}
              C -0.5 ${half}, 2.5 ${half - radius * 0.65}, ${half - radius * 0.75} 2
              Z
            `}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : styleType === 'pulse' ? (
          <circle
            cx={half}
            cy={half}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />
        ) : styleType === 'neon' ? (
          <circle
            cx={half}
            cy={half}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        ) : (
          <path
            d={`
              M ${half} 2
              C ${half + radius * 0.55} -0.5, ${half + radius * 0.95} 3.5, ${size - 2} ${half * 0.55}
              C ${size + 0.5} ${half}, ${size - 3.5} ${half + radius * 0.65}, ${half + radius * 0.75} ${size - 2}
              C ${half} ${size + 0.5}, ${half - radius * 0.65} ${size - 2.5}, 2 ${half + radius * 0.55}
              C -0.5 ${half}, 2.5 ${half - radius * 0.65}, ${half - radius * 0.75} 2
              Z
            `}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* Inner Avatar Image */}
      <div
        className="rounded-full overflow-hidden flex items-center justify-center bg-gray-100 z-10"
        style={{
          width: size - 8,
          height: size - 8,
        }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
          />
        ) : (
          <span className="font-bold text-gray-700 text-xs">
            {name.slice(0, 1)}
          </span>
        )}
      </div>

      {/* Badge in top-right or bottom-right corner */}
      {isCaptain ? (
        // Captain 'C' Badge with Blue Circle and High Contrast Typography
        <div
          className="absolute -top-1 -right-1 z-20 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-black border-2 border-white shadow-xs select-none"
          style={{
            width: Math.max(16, Math.round(size * 0.4)),
            height: Math.max(16, Math.round(size * 0.4)),
            fontSize: Math.max(9, Math.round(size * 0.24)),
          }}
          title="小队长 (Captain)"
        >
          C
        </div>
      ) : (
        // Regular squad member emblem
        <div
          className="absolute -bottom-0.5 -right-0.5 z-20 rounded-full bg-white text-gray-800 flex items-center justify-center border border-[#E4E6EB] shadow-xs select-none"
          style={{
            width: Math.max(14, Math.round(size * 0.35)),
            height: Math.max(14, Math.round(size * 0.35)),
            fontSize: Math.max(8, Math.round(size * 0.22)),
          }}
          title="小队成员"
        >
          {badge}
        </div>
      )}
    </div>
  );
};
