import React from 'react';

export interface ClayCarAvatarWithHeartsProps {
  avatarUrl?: string;
  avatarAlt?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  speedText?: string;
  isDriving?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * 1:1 Exact Replicating Component of the Clay Car & Love Heart Bubbles from the user prototype image
 */
export const ClayCarAvatarWithHearts: React.FC<ClayCarAvatarWithHeartsProps> = ({
  avatarUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
  avatarAlt = 'Sarah Chen',
  size = 'md',
  speedText = '42 km/h',
  isDriving = true,
  className = '',
  onClick,
}) => {
  // Scale mapping
  const scaleClass = {
    sm: 'scale-75 origin-center',
    md: 'scale-100 origin-center',
    lg: 'scale-125 origin-center',
    hero: 'scale-150 origin-center sm:scale-[1.8]',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-300 ${scaleClass} ${className}`}
      style={{ width: '220px', height: '140px' }}
    >
      {/* ---------------- 14 Clay Hearts Exhaust Stream (1:1 Layout & Dynamic Billowing) ---------------- */}
      <div className="absolute left-1 top-4 w-28 h-28 pointer-events-none z-10 overflow-visible">
        {/* Heart 1: Large Deep Crimson Heart (Left middle) */}
        <div
          className="absolute left-2 top-11 animate-clay-heart-1"
          style={{ width: '28px', height: '28px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_4px_6px_rgba(183,28,28,0.5)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartRed1)"
            />
            <path
              d="M7 6c-1.5 0-2.5 1-2.5 2.5 0 1.5 1.5 3 3 4"
              stroke="#FFA4A2"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Heart 2: Large Soft Pink Heart (Upper left) */}
        <div
          className="absolute left-6 top-5 animate-clay-heart-2"
          style={{ width: '26px', height: '26px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_4px_6px_rgba(244,143,177,0.5)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartPink1)"
            />
            <path
              d="M7 6c-1.5 0-2.5 1-2.5 2.5 0 1.5 1.5 3 3 4"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.75"
            />
          </svg>
        </div>

        {/* Heart 3: Top-left Tiny Crimson Heart */}
        <div
          className="absolute left-3 top-2 animate-clay-heart-3"
          style={{ width: '15px', height: '15px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(183,28,28,0.5)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartRed2)"
            />
          </svg>
        </div>

        {/* Heart 4: Top Center Light Pink Heart */}
        <div
          className="absolute left-14 top-0 animate-clay-heart-4"
          style={{ width: '16px', height: '16px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(244,143,177,0.5)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartPink2)"
            />
          </svg>
        </div>

        {/* Heart 5: Big Center Red Heart (Slightly tilted) */}
        <div
          className="absolute left-13 top-6 animate-clay-heart-5"
          style={{ width: '30px', height: '30px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_5px_8px_rgba(211,47,47,0.55)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartRed1)"
            />
            <path
              d="M7 6c-1.5 0-2.5 1-2.5 2.5 0 1.5 1.5 3 3 4"
              stroke="#FFA4A2"
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* Heart 6: Tiny Pink Heart between Big Hearts */}
        <div
          className="absolute left-11 top-12 animate-clay-heart-1"
          style={{ width: '14px', height: '14px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(244,143,177,0.4)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartPink1)"
            />
          </svg>
        </div>

        {/* Heart 7: Medium Vivid Red Heart */}
        <div
          className="absolute left-10 top-15 animate-clay-heart-2"
          style={{ width: '16px', height: '16px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(229,57,53,0.5)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartRed2)"
            />
          </svg>
        </div>

        {/* Heart 8: Medium Pink Heart (Middle right) */}
        <div
          className="absolute left-17 top-13 animate-clay-heart-3"
          style={{ width: '22px', height: '22px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_3px_6px_rgba(244,143,177,0.55)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartPink1)"
            />
            <path
              d="M7 6c-1.5 0-2.5 1-2.5 2.5 0 1.5 1.5 3 3 4"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>
        </div>

        {/* Heart 9: Tiny Red Heart (Near upper car roof) */}
        <div
          className="absolute left-23 top-9 animate-clay-heart-4"
          style={{ width: '15px', height: '15px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(211,47,47,0.5)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartRed2)"
            />
          </svg>
        </div>

        {/* Heart 10: Soft Rose Heart (Lower right) */}
        <div
          className="absolute left-23 top-18 animate-clay-heart-5"
          style={{ width: '16px', height: '16px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(244,143,177,0.45)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartPink2)"
            />
          </svg>
        </div>

        {/* Heart 11: Bottom Red Heart */}
        <div
          className="absolute left-19 top-20 animate-clay-heart-1"
          style={{ width: '22px', height: '22px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_3px_5px_rgba(211,47,47,0.55)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartRed1)"
            />
          </svg>
        </div>

        {/* Heart 12: Bottom-left Tiny Red Heart */}
        <div
          className="absolute left-6 top-21 animate-clay-heart-2"
          style={{ width: '13px', height: '13px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(183,28,28,0.5)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartRed2)"
            />
          </svg>
        </div>

        {/* Heart 13: Bottom-most Soft Pink Heart */}
        <div
          className="absolute left-10 top-25 animate-clay-heart-3"
          style={{ width: '17px', height: '17px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(244,143,177,0.45)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartPink1)"
            />
          </svg>
        </div>

        {/* Heart 14: Tiny Near-pipe Rose Red Heart */}
        <div
          className="absolute left-23 top-25 animate-clay-heart-4"
          style={{ width: '14px', height: '14px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_2px_4px_rgba(229,57,53,0.5)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#clayHeartRed2)"
            />
          </svg>
        </div>
      </div>

      {/* ---------------- 1:1 3D Red Clay Car Body & Avatar Center ---------------- */}
      <div
        className={`relative z-20 ${
          isDriving ? 'animate-clay-car-bob animate-clay-car-glow' : ''
        }`}
        style={{ width: '150px', height: '110px' }}
      >
        {/* Soft Contact Shadow beneath the car */}
        <div className="absolute -bottom-2 left-6 right-2 h-4 bg-black/25 rounded-full blur-sm pointer-events-none transform scale-y-50"></div>

        {/* SVG Clay Car Vector Architecture */}
        <svg
          viewBox="0 0 170 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Clay Red Gradient */}
            <radialGradient id="clayRedMain" cx="45%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#FF6659" />
              <stop offset="35%" stopColor="#E53935" />
              <stop offset="70%" stopColor="#C62828" />
              <stop offset="100%" stopColor="#8E0000" />
            </radialGradient>

            {/* Front Window Pastel Pink Clay Gradient */}
            <linearGradient id="clayFrontWindow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCE4EC" />
              <stop offset="40%" stopColor="#F8BBD0" />
              <stop offset="100%" stopColor="#F48FB1" />
            </linearGradient>

            {/* Clay Yellow Headlights Gradient */}
            <radialGradient id="clayYellowLight" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFF59D" />
              <stop offset="50%" stopColor="#FDD835" />
              <stop offset="90%" stopColor="#F57F17" />
              <stop offset="100%" stopColor="#E65100" />
            </radialGradient>

            {/* Clay Charcoal Matte Wheels Gradient */}
            <radialGradient id="clayWheelMatte" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#757575" />
              <stop offset="45%" stopColor="#424242" />
              <stop offset="85%" stopColor="#212121" />
              <stop offset="100%" stopColor="#141414" />
            </radialGradient>

            {/* Heart Color Gradients */}
            <radialGradient id="clayHeartRed1" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FF5252" />
              <stop offset="50%" stopColor="#D32F2F" />
              <stop offset="100%" stopColor="#8E0000" />
            </radialGradient>
            <radialGradient id="clayHeartRed2" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FF7961" />
              <stop offset="60%" stopColor="#E53935" />
              <stop offset="100%" stopColor="#B71C1C" />
            </radialGradient>
            <radialGradient id="clayHeartPink1" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FF80AB" />
              <stop offset="60%" stopColor="#F48FB1" />
              <stop offset="100%" stopColor="#C2185B" />
            </radialGradient>
            <radialGradient id="clayHeartPink2" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FCE4EC" />
              <stop offset="60%" stopColor="#F8BBD0" />
              <stop offset="100%" stopColor="#E91E63" />
            </radialGradient>

            {/* Clay Drop Shadows */}
            <filter id="clayCarDropShadow" x="-10%" y="-10%" width="125%" height="130%">
              <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#5f0909" floodOpacity="0.45" />
            </filter>
            <filter id="clayWheelShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Rear Exhaust Pipe (Red Clay Nipple) */}
          <ellipse cx="9" cy="80" rx="4.5" ry="6" fill="#8E0000" />
          <ellipse cx="7.5" cy="80" rx="3" ry="4.5" fill="#5c0000" />

          {/* Main Organic 3D Clay Car Body Outline */}
          <path
            d="M 18 72 
               C 18 45, 36 20, 72 16 
               C 98 13, 126 28, 138 48 
               C 147 54, 156 62, 156 75 
               C 156 86, 146 91, 134 91 
               C 125 91, 122 79, 105 79 
               C 88 79, 85 91, 62 91 
               C 44 91, 41 79, 25 79 
               C 19 79, 15 85, 11 85 
               C 8 85, 7 79, 8 74 
               C 10 70, 13 72, 18 72 Z"
            fill="url(#clayRedMain)"
            filter="url(#clayCarDropShadow)"
          />

          {/* Top Clay Highlights / Organic Molded Sheen */}
          <path
            d="M 42 25 C 60 19, 84 19, 102 26 C 96 23, 66 21, 42 25 Z"
            fill="#FFFFFF"
            opacity="0.45"
          />

          {/* Front Curved Windshield (Pink Clay Solid Shape) */}
          <path
            d="M 116 30 
               C 128 36, 136 46, 139 58 
               C 133 57, 124 53, 118 43 
               C 114 36, 115 32, 116 30 Z"
            fill="url(#clayFrontWindow)"
            stroke="#F06292"
            strokeWidth="1.5"
          />

          {/* Front Clay Yellow Headlight 1 (Side) */}
          <ellipse
            cx="153"
            cy="69"
            rx="6.5"
            ry="9.5"
            fill="url(#clayYellowLight)"
            transform="rotate(-10 153 69)"
            filter="url(#clayWheelShadow)"
          />
          {/* Front Clay Yellow Headlight 2 (Front tip) */}
          <ellipse
            cx="160"
            cy="70"
            rx="4"
            ry="7.5"
            fill="url(#clayYellowLight)"
            transform="rotate(-5 160 70)"
            opacity="0.85"
          />

          {/* Rear Clay Wheel (Chubby charcoal cylinder) */}
          <ellipse
            cx="44"
            cy="87"
            rx="18"
            ry="18"
            fill="url(#clayWheelMatte)"
            filter="url(#clayWheelShadow)"
          />
          {/* Rear Wheel Rim Depth */}
          <ellipse cx="44" cy="87" rx="8" ry="8" fill="#1C1C1C" opacity="0.8" />

          {/* Front Clay Wheel (Chubby charcoal cylinder) */}
          <ellipse
            cx="119"
            cy="87"
            rx="18"
            ry="18"
            fill="url(#clayWheelMatte)"
            filter="url(#clayWheelShadow)"
          />
          {/* Front Wheel Rim Depth */}
          <ellipse cx="119" cy="87" rx="8" ry="8" fill="#1C1C1C" opacity="0.8" />

          {/* Center Round Window Red Clay Outer Ring */}
          <circle
            cx="78"
            cy="52"
            r="29"
            fill="#8E0000"
            stroke="#B71C1C"
            strokeWidth="4"
          />
        </svg>

        {/* ---------------- Center Female Avatar in Round Window ---------------- */}
        <div
          className="absolute rounded-full overflow-hidden border-3 border-[#C62828] shadow-inner bg-white z-30"
          style={{
            left: '46px',
            top: '20px',
            width: '58px',
            height: '58px',
          }}
        >
          <img
            src={avatarUrl}
            alt={avatarAlt}
            className="w-full h-full object-cover"
          />
          {/* Glass / Window reflection glaze */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none"></div>
        </div>

        {/* Speed / Driving Indicator pill */}
        {speedText && (
          <div className="absolute -top-1 right-2 z-40 pointer-events-none select-none">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-full px-2.5 py-0.5 flex items-center space-x-1 border-2 border-white shadow-md">
              <span className="text-[10px] font-black leading-none">{speedText}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
