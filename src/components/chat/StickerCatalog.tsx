import React from 'react';

export interface CustomStickerItem {
  id: string;
  name: string;
  label: string;
  category: string;
  render: (size?: number, className?: string) => React.ReactNode;
}

// 1. 融化爱心 (Melting Heart)
export const MeltHeartSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <defs>
      <radialGradient id="meltHeartBase" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FF4D6D" />
        <stop offset="35%" stopColor="#E0115F" />
        <stop offset="75%" stopColor="#B3003B" />
        <stop offset="100%" stopColor="#700020" />
      </radialGradient>
      <linearGradient id="meltHeartGloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
      </linearGradient>
      <linearGradient id="dripGrad1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D81159" />
        <stop offset="100%" stopColor="#960032" />
      </linearGradient>
      <filter id="heartShadow" x="-10%" y="-10%" width="125%" height="130%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#8B0000" floodOpacity="0.35" />
      </filter>
    </defs>

    <g filter="url(#heartShadow)">
      {/* Main Jelly Heart with melting drip extensions */}
      <path
        d="M60 36 C50 18, 22 16, 12 34 C2 52, 14 74, 30 88 C36 93, 40 98, 41 106 C41.5 110, 45 110, 46 105 C48 95, 52 90, 56 89 C59 88, 62 94, 63 103 C64 112, 69 113, 70 102 C72 90, 77 88, 82 86 C94 80, 116 58, 110 36 C105 18, 76 18, 60 36 Z"
        fill="url(#meltHeartBase)"
      />

      {/* Side Drips */}
      <path
        d="M26 70 C24 82, 22 92, 25 96 C27 98, 29 95, 29 90 C30 80, 31 75, 33 72 Z"
        fill="url(#dripGrad1)"
      />
      <path
        d="M88 68 C92 78, 95 86, 94 92 C93 95, 90 94, 89 88 C88 80, 86 74, 85 69 Z"
        fill="url(#dripGrad1)"
      />

      {/* Detached Falling Droplet */}
      <circle cx="58" cy="114" r="3.5" fill="#C2185B" />
      <ellipse cx="57" cy="113" rx="1.2" ry="0.8" fill="#FFFFFF" opacity="0.8" />

      {/* 3D Specular Lobe Highlights */}
      <ellipse cx="36" cy="30" rx="14" ry="7" transform="rotate(-30 36 30)" fill="url(#meltHeartGloss)" />
      <ellipse cx="84" cy="30" rx="14" ry="7" transform="rotate(30 84 30)" fill="url(#meltHeartGloss)" />

      {/* Small Gloss Dots */}
      <circle cx="28" cy="45" r="2.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="92" cy="45" r="2.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="63" cy="98" r="1.5" fill="#FFFFFF" opacity="0.75" />
    </g>
  </svg>
);

// 2. 爆哭紫脸 (Purple Crying Face)
export const PurpleCrySticker: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <defs>
      <radialGradient id="purpleFaceGrad" cx="45%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#D8B4FE" />
        <stop offset="45%" stopColor="#A855F7" />
        <stop offset="85%" stopColor="#7E22CE" />
        <stop offset="100%" stopColor="#581C87" />
      </radialGradient>
      <linearGradient id="tearRiverGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7DD3FC" />
        <stop offset="40%" stopColor="#38BDF8" />
        <stop offset="80%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
      <filter id="faceShadow" x="-10%" y="-10%" width="125%" height="130%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#4A044E" floodOpacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#faceShadow)">
      {/* Purple Face Sphere */}
      <circle cx="60" cy="54" r="42" fill="url(#purpleFaceGrad)" />

      {/* Rosy Cheeks */}
      <ellipse cx="32" cy="62" rx="7" ry="4" fill="#F43F5E" opacity="0.45" />
      <ellipse cx="88" cy="62" rx="7" ry="4" fill="#F43F5E" opacity="0.45" />

      {/* Closed Crying Eyes / Brows */}
      <path d="M30 40 Q38 34 46 41" stroke="#3B0764" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M32 46 Q38 43 45 47" stroke="#3B0764" strokeWidth="3.5" strokeLinecap="round" />

      <path d="M90 40 Q82 34 74 41" stroke="#3B0764" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M88 46 Q82 43 75 47" stroke="#3B0764" strokeWidth="3.5" strokeLinecap="round" />

      {/* Wailing Mouth */}
      <path
        d="M45 68 C45 60, 75 60, 75 68 C75 80, 45 80, 45 68 Z"
        fill="#2E1065"
      />
      <ellipse cx="60" cy="74" rx="8" ry="4.5" fill="#FB7185" />
      <path d="M50 63 Q60 66 70 63" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />

      {/* Left Gushing Tear Waterfall & Puddle */}
      <path
        d="M37 47 C34 58, 24 75, 23 88 C21 99, 14 104, 25 106 C35 107, 44 104, 42 94 C40 84, 43 62, 42 47 Z"
        fill="url(#tearRiverGrad)"
      />
      {/* Right Gushing Tear Waterfall & Puddle */}
      <path
        d="M83 47 C86 58, 96 75, 97 88 C99 99, 106 104, 95 106 C85 107, 76 104, 78 94 C80 84, 77 62, 78 47 Z"
        fill="url(#tearRiverGrad)"
      />

      {/* Splash Droplets */}
      <circle cx="16" cy="92" r="3" fill="#38BDF8" />
      <circle cx="104" cy="92" r="3" fill="#38BDF8" />
      <circle cx="20" cy="76" r="2.2" fill="#7DD3FC" />
      <circle cx="100" cy="76" r="2.2" fill="#7DD3FC" />

      {/* Tear Highlights */}
      <path d="M30 62 Q27 80 25 94" stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      <path d="M90 62 Q93 80 95 94" stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />

      {/* Forehead Gloss */}
      <ellipse cx="60" cy="24" rx="20" ry="7" fill="#FFFFFF" opacity="0.35" />
    </g>
  </svg>
);

// 3. 巧克力便便 (Cute Swirl Poop)
export const PoopCuteSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <defs>
      <radialGradient id="poopGrad" cx="45%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#9C6644" />
        <stop offset="45%" stopColor="#7F4F24" />
        <stop offset="85%" stopColor="#582F0E" />
        <stop offset="100%" stopColor="#3A1C04" />
      </radialGradient>
      <linearGradient id="poopHighlight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#DDB892" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <filter id="poopShadow" x="-10%" y="-10%" width="125%" height="130%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#271300" floodOpacity="0.35" />
      </filter>
    </defs>

    <g filter="url(#poopShadow)">
      {/* Bottom Swirl Tier */}
      <path
        d="M20 95 C18 85, 28 78, 45 76 C56 74, 64 74, 75 76 C92 78, 102 85, 100 95 C98 104, 78 107, 60 107 C42 107, 22 104, 20 95 Z"
        fill="url(#poopGrad)"
      />
      {/* Middle Swirl Tier */}
      <path
        d="M28 75 C26 66, 36 58, 50 56 C57 55, 63 55, 70 56 C84 58, 94 66, 92 75 C90 82, 75 85, 60 85 C45 85, 30 82, 28 75 Z"
        fill="url(#poopGrad)"
      />
      {/* Top Swirl Tip */}
      <path
        d="M42 56 C38 48, 44 38, 55 32 C62 28, 68 22, 65 15 C75 22, 78 35, 74 44 C72 50, 68 54, 58 56 Z"
        fill="url(#poopGrad)"
      />

      {/* Swirl Gloss Highlights */}
      <path d="M26 92 Q60 88 94 92" stroke="url(#poopHighlight)" strokeWidth="4" strokeLinecap="round" />
      <path d="M34 72 Q60 67 86 72" stroke="url(#poopHighlight)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M50 48 Q62 42 70 48" stroke="url(#poopHighlight)" strokeWidth="3" strokeLinecap="round" />

      {/* Big Anime Eyes */}
      <ellipse cx="44" cy="74" rx="8" ry="11" fill="#1C1917" />
      <ellipse cx="76" cy="74" rx="8" ry="11" fill="#1C1917" />

      {/* Eye Highlights */}
      <circle cx="42" cy="71" r="3.8" fill="#FFFFFF" />
      <circle cx="46" cy="77" r="1.8" fill="#FFFFFF" />
      <circle cx="74" cy="71" r="3.8" fill="#FFFFFF" />
      <circle cx="78" cy="77" r="1.8" fill="#FFFFFF" />

      {/* Pink Rosy Cheeks */}
      <circle cx="34" cy="82" r="4.5" fill="#F472B6" opacity="0.65" />
      <circle cx="86" cy="82" r="4.5" fill="#F472B6" opacity="0.65" />

      {/* Smiling Mouth with Tongue */}
      <path
        d="M52 82 Q60 89 68 82"
        stroke="#1C1917"
        strokeWidth="3"
        strokeLinecap="round"
        fill="#991B1B"
      />
      <path d="M56 84 Q60 88 64 84" fill="#FB7185" />
    </g>
  </svg>
);

// 4. 充血大眼球 (Bloodshot Eyeballs)
export const BlueEyesSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <defs>
      <radialGradient id="eyeballBase" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="65%" stopColor="#F1F5F9" />
        <stop offset="85%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#FDA4AF" />
      </radialGradient>
      <radialGradient id="irisGrad" cx="45%" cy="40%" r="55%">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#0284C7" />
        <stop offset="85%" stopColor="#0369A1" />
        <stop offset="100%" stopColor="#082F49" />
      </radialGradient>
      <filter id="eyesShadow" x="-10%" y="-10%" width="125%" height="130%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#991B1B" floodOpacity="0.25" />
      </filter>
    </defs>

    <g filter="url(#eyesShadow)">
      {/* Pink fleshy surround connection */}
      <path d="M36 60 Q60 52 84 60 Q60 68 36 60 Z" fill="#F43F5E" opacity="0.75" />

      {/* Left Eyeball */}
      <circle cx="38" cy="60" r="30" fill="url(#eyeballBase)" stroke="#FB7185" strokeWidth="2.5" />
      {/* Right Eyeball */}
      <circle cx="82" cy="60" r="30" fill="url(#eyeballBase)" stroke="#FB7185" strokeWidth="2.5" />

      {/* Bloodshot Red Capillaries (Left) */}
      <path d="M12 55 Q20 58 24 54 M16 66 Q22 62 26 65 M34 34 Q36 42 32 46 M42 32 Q40 40 44 45" stroke="#E11D48" strokeWidth="1.2" opacity="0.65" strokeLinecap="round" />
      {/* Bloodshot Red Capillaries (Right) */}
      <path d="M108 55 Q100 58 96 54 M104 66 Q98 62 94 65 M86 34 Q84 42 88 46 M78 32 Q80 40 76 45" stroke="#E11D48" strokeWidth="1.2" opacity="0.65" strokeLinecap="round" />

      {/* Left Iris & Pupil */}
      <circle cx="42" cy="59" r="14" fill="url(#irisGrad)" />
      <circle cx="42" cy="59" r="7.5" fill="#0F172A" />
      {/* Right Iris & Pupil */}
      <circle cx="78" cy="59" r="14" fill="url(#irisGrad)" />
      <circle cx="78" cy="59" r="7.5" fill="#0F172A" />

      {/* Realistic Specular Highlights */}
      <circle cx="38" cy="54" r="4" fill="#FFFFFF" />
      <circle cx="45" cy="63" r="1.6" fill="#FFFFFF" />
      <circle cx="74" cy="54" r="4" fill="#FFFFFF" />
      <circle cx="81" cy="63" r="1.6" fill="#FFFFFF" />
    </g>
  </svg>
);

// 5. 粉红嘟嘟唇 HELLO (Pink Lips HELLO)
export const PinkLipsSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <defs>
      <linearGradient id="lipGloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="35%" stopColor="#F43F5E" />
        <stop offset="70%" stopColor="#E11D48" />
        <stop offset="100%" stopColor="#9F1239" />
      </linearGradient>
      <linearGradient id="candyHello" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDBA74" />
        <stop offset="35%" stopColor="#FB923C" />
        <stop offset="80%" stopColor="#EA580C" />
        <stop offset="100%" stopColor="#9A3412" />
      </linearGradient>
      <filter id="lipsShadow" x="-10%" y="-10%" width="125%" height="130%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#881337" floodOpacity="0.35" />
      </filter>
    </defs>

    <g filter="url(#lipsShadow)">
      {/* Outer Lip Frame (Plump Cartoon Lips) */}
      <path
        d="M12 58 C16 38, 44 26, 60 38 C76 26, 104 38, 108 58 C112 85, 78 98, 60 98 C42 98, 8 85, 12 58 Z"
        fill="url(#lipGloss)"
      />

      {/* Inside Mouth Cavity */}
      <path
        d="M26 58 C32 46, 88 46, 94 58 C88 74, 32 74, 26 58 Z"
        fill="#881337"
      />

      {/* Clean White Teeth Row */}
      <path
        d="M28 58 C32 47, 88 47, 92 58 L90 68 C80 72, 40 72, 30 68 Z"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="1.5"
      />
      {/* Teeth Divvy Lines */}
      <line x1="41" y1="50" x2="41" y2="69" stroke="#E2E8F0" strokeWidth="1.5" />
      <line x1="53" y1="49" x2="53" y2="70" stroke="#E2E8F0" strokeWidth="1.5" />
      <line x1="67" y1="49" x2="67" y2="70" stroke="#E2E8F0" strokeWidth="1.5" />
      <line x1="79" y1="50" x2="79" y2="69" stroke="#E2E8F0" strokeWidth="1.5" />

      {/* Glossy Candy "HELLO" Text in Orange across teeth */}
      {/* H */}
      <path d="M33 53 V65 M39 53 V65 M33 59 H39" stroke="url(#candyHello)" strokeWidth="3" strokeLinecap="round" />
      {/* E */}
      <path d="M49 53 H44 V65 H49 M44 59 H48" stroke="url(#candyHello)" strokeWidth="3" strokeLinecap="round" />
      {/* L */}
      <path d="M57 53 V65 H62" stroke="url(#candyHello)" strokeWidth="3" strokeLinecap="round" />
      {/* L */}
      <path d="M70 53 V65 H75" stroke="url(#candyHello)" strokeWidth="3" strokeLinecap="round" />
      {/* O */}
      <ellipse cx="84" cy="59" rx="4.5" ry="6" stroke="url(#candyHello)" strokeWidth="3" fill="none" />

      {/* Lip Gloss Specular Highlights */}
      <path d="M30 42 Q45 35 55 42" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
      <path d="M65 42 Q75 35 90 42" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
      <path d="M38 88 Q60 94 82 88" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
    </g>
  </svg>
);

// 6. 活力小火人 (Dancing Flame Creature)
export const FlameBuddySticker: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <defs>
      <radialGradient id="flameBody" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="35%" stopColor="#FBBF24" />
        <stop offset="70%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EA580C" />
      </radialGradient>
      <filter id="flameShadow" x="-10%" y="-10%" width="125%" height="130%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#C2410C" floodOpacity="0.35" />
      </filter>
    </defs>

    <g filter="url(#flameShadow)">
      {/* Dancing Legs */}
      <path d="M48 88 C46 98, 38 102, 34 104 C30 106, 36 108, 42 106 C48 104, 52 96, 52 88 Z" fill="#EA580C" />
      <path d="M72 88 C76 96, 82 102, 88 106 C92 108, 86 109, 80 105 C75 101, 70 96, 68 88 Z" fill="#EA580C" />

      {/* Dancing Arms */}
      <path d="M32 62 C22 58, 16 52, 18 46 C20 42, 24 48, 30 54 Z" fill="#F97316" />
      <path d="M88 62 C98 58, 104 52, 102 46 C100 42, 96 48, 90 54 Z" fill="#F97316" />

      {/* Flame Head & Body with Multiple Tips */}
      <path
        d="M60 12 C64 26, 75 30, 80 24 C85 36, 96 38, 94 48 C102 54, 106 68, 98 80 C90 92, 75 92, 60 92 C45 92, 30 92, 22 80 C14 68, 18 54, 26 48 C24 38, 35 36, 40 24 C45 30, 56 26, 60 12 Z"
        fill="url(#flameBody)"
      />

      {/* Inner Fiery Core */}
      <ellipse cx="60" cy="62" rx="22" ry="20" fill="#FEF08A" opacity="0.65" />

      {/* Cute Laughing Face */}
      {/* Cheerful squinting eyes ^ ^ */}
      <path d="M44 54 Q49 48 54 54" stroke="#7C2D12" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M66 54 Q71 48 76 54" stroke="#7C2D12" strokeWidth="3.5" strokeLinecap="round" />

      {/* Happy Open Smile */}
      <path
        d="M50 63 C50 74, 70 74, 70 63 Z"
        fill="#7C2D12"
      />
      <path d="M54 68 C56 72, 64 72, 66 68 Z" fill="#FB7185" />

      {/* Gloss Sparkles */}
      <circle cx="60" cy="36" r="3" fill="#FFFFFF" opacity="0.85" />
      <circle cx="34" cy="52" r="2" fill="#FFFFFF" opacity="0.8" />
      <circle cx="86" cy="52" r="2" fill="#FFFFFF" opacity="0.8" />
    </g>
  </svg>
);

// 7. 紫色充气大拇指 (Purple Thumbs Up)
export const PurpleThumbSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <defs>
      <radialGradient id="purpleGlove" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="35%" stopColor="#A855F7" />
        <stop offset="75%" stopColor="#7E22CE" />
        <stop offset="100%" stopColor="#581C87" />
      </radialGradient>
      <linearGradient id="gloveHighlight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
      </linearGradient>
      <filter id="thumbShadow" x="-10%" y="-10%" width="125%" height="130%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#3B0764" floodOpacity="0.35" />
      </filter>
    </defs>

    <g filter="url(#thumbShadow)">
      {/* Wrist Base Cuff */}
      <path d="M24 78 C20 85, 20 98, 28 104 C36 110, 48 108, 52 98 Z" fill="#6B21A8" />

      {/* Palm / Hand Body */}
      <path
        d="M32 72 C32 60, 44 54, 56 56 C68 58, 76 66, 76 76 C76 86, 68 96, 54 96 C42 96, 32 86, 32 72 Z"
        fill="url(#purpleGlove)"
      />

      {/* Upright Inflated Thumb */}
      <path
        d="M48 60 C42 50, 44 26, 52 18 C60 10, 70 16, 70 28 C70 40, 68 56, 68 62 Z"
        fill="url(#purpleGlove)"
      />

      {/* 4 Plump Folded Fingers */}
      {/* Finger 1 (Top) */}
      <rect x="62" y="52" width="34" height="13" rx="6.5" fill="url(#purpleGlove)" stroke="#581C87" strokeWidth="1" />
      {/* Finger 2 */}
      <rect x="64" y="65" width="36" height="13" rx="6.5" fill="url(#purpleGlove)" stroke="#581C87" strokeWidth="1" />
      {/* Finger 3 */}
      <rect x="62" y="78" width="34" height="13" rx="6.5" fill="url(#purpleGlove)" stroke="#581C87" strokeWidth="1" />
      {/* Finger 4 (Bottom) */}
      <rect x="58" y="90" width="30" height="12" rx="6" fill="url(#purpleGlove)" stroke="#581C87" strokeWidth="1" />

      {/* Specular Highlights across Thumb & Fingers */}
      <path d="M54 22 Q58 16 64 22" stroke="url(#gloveHighlight)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M52 28 V46" stroke="url(#gloveHighlight)" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="80" cy="56" rx="8" ry="2.5" fill="#FFFFFF" opacity="0.65" />
      <ellipse cx="82" cy="69" rx="8" ry="2.5" fill="#FFFFFF" opacity="0.65" />
      <ellipse cx="80" cy="82" rx="8" ry="2.5" fill="#FFFFFF" opacity="0.65" />
    </g>
  </svg>
);

// 8. 抱橡果小松鼠 (Chipmunk with Acorn)
export const SquirrelAcornSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <defs>
      <radialGradient id="squirrelFur" cx="45%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#D97706" />
        <stop offset="45%" stopColor="#B45309" />
        <stop offset="85%" stopColor="#78350F" />
        <stop offset="100%" stopColor="#451A03" />
      </radialGradient>
      <radialGradient id="acornBody" cx="45%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </radialGradient>
      <filter id="squirrelShadow" x="-10%" y="-10%" width="125%" height="130%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#451A03" floodOpacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#squirrelShadow)">
      {/* Big Fluffy Tail behind */}
      <path
        d="M42 90 C18 84, 12 55, 24 38 C32 26, 46 22, 50 32 C54 42, 40 54, 44 68 C46 76, 48 84, 42 90 Z"
        fill="url(#squirrelFur)"
      />
      <path d="M28 42 Q36 34 44 42" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" opacity="0.75" />

      {/* Feet */}
      <ellipse cx="44" cy="104" rx="7" ry="4" fill="#92400E" />
      <ellipse cx="76" cy="104" rx="7" ry="4" fill="#92400E" />

      {/* Body */}
      <ellipse cx="60" cy="85" rx="22" ry="22" fill="url(#squirrelFur)" />
      <ellipse cx="60" cy="88" rx="14" ry="15" fill="#FEF3C7" />

      {/* Head */}
      <circle cx="60" cy="52" r="22" fill="url(#squirrelFur)" />
      {/* White/Cream Cheeks */}
      <ellipse cx="46" cy="58" rx="10" ry="8" fill="#FFFBEB" />
      <ellipse cx="74" cy="58" rx="10" ry="8" fill="#FFFBEB" />

      {/* Cute Ears */}
      <ellipse cx="45" cy="33" rx="5" ry="9" transform="rotate(-15 45 33)" fill="url(#squirrelFur)" />
      <ellipse cx="45" cy="33" rx="3" ry="6" transform="rotate(-15 45 33)" fill="#FBCFE8" />
      <ellipse cx="75" cy="33" rx="5" ry="9" transform="rotate(15 75 33)" fill="url(#squirrelFur)" />
      <ellipse cx="75" cy="33" rx="3" ry="6" transform="rotate(15 75 33)" fill="#FBCFE8" />

      {/* Shiny Anime Eyes */}
      <ellipse cx="50" cy="50" rx="5.5" ry="7" fill="#1C1917" />
      <circle cx="48.5" cy="48" r="2.5" fill="#FFFFFF" />
      <circle cx="51.5" cy="52" r="1.2" fill="#FFFFFF" />

      <ellipse cx="70" cy="50" rx="5.5" ry="7" fill="#1C1917" />
      <circle cx="68.5" cy="48" r="2.5" fill="#FFFFFF" />
      <circle cx="71.5" cy="52" r="1.2" fill="#FFFFFF" />

      {/* Nose & Smile with tiny tooth */}
      <ellipse cx="60" cy="56" rx="2" ry="1.5" fill="#78350F" />
      <path d="M57 60 Q60 63 63 60" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="58.5" y="60.5" width="3" height="2.5" rx="0.5" fill="#FFFFFF" />

      {/* Big 3D Acorn Hugged in Paws */}
      {/* Acorn Nut Body */}
      <path
        d="M48 80 C44 88, 54 102, 60 102 C66 102, 76 88, 72 80 Z"
        fill="url(#acornBody)"
      />
      {/* Acorn Textured Cap */}
      <ellipse cx="60" cy="78" rx="13" ry="6" fill="#78350F" />
      <rect x="58.5" y="70" width="3" height="4" rx="1.5" fill="#542409" />
      {/* Acorn Highlight */}
      <path d="M54 84 Q58 94 60 98" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

      {/* Squirrel Paws hugging the acorn */}
      <ellipse cx="48" cy="80" rx="4.5" ry="4" fill="#B45309" />
      <ellipse cx="72" cy="80" rx="4.5" ry="4" fill="#B45309" />
    </g>
  </svg>
);

// 9. 满沫冰啤酒杯 (Frothy Beer Mug)
export const FrothyBeerSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <defs>
      <linearGradient id="beerLiquid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="40%" stopColor="#F59E0B" />
        <stop offset="85%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="glassShine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
        <stop offset="10%" stopColor="#FFFFFF" stopOpacity="0.1" />
        <stop offset="90%" stopColor="#FFFFFF" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.75" />
      </linearGradient>
      <filter id="beerShadow" x="-10%" y="-10%" width="125%" height="130%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#B45309" floodOpacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#beerShadow)">
      {/* Glass Handle on Right */}
      <path
        d="M84 46 C98 46, 104 56, 104 68 C104 80, 98 90, 84 90"
        stroke="#E2E8F0"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M84 46 C96 46, 102 56, 102 68 C102 80, 96 90, 84 90"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Mug Body (Golden Beer Inside) */}
      <rect x="28" y="38" width="58" height="66" rx="5" fill="url(#beerLiquid)" />

      {/* Vertical Faceted Glass Ribs */}
      <rect x="36" y="42" width="10" height="58" fill="#FBBF24" opacity="0.45" />
      <rect x="52" y="42" width="10" height="58" fill="#FDE047" opacity="0.3" />
      <rect x="68" y="42" width="10" height="58" fill="#F59E0B" opacity="0.45" />

      {/* Sparkling Carbonation Bubbles */}
      <circle cx="38" cy="85" r="1.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="46" cy="72" r="2" fill="#FFFFFF" opacity="0.8" />
      <circle cx="62" cy="80" r="1.8" fill="#FFFFFF" opacity="0.8" />
      <circle cx="70" cy="65" r="1.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="56" cy="54" r="2.2" fill="#FFFFFF" opacity="0.8" />

      {/* Heavy Glass Base */}
      <rect x="25" y="102" width="64" height="7" rx="3.5" fill="#E2E8F0" opacity="0.9" />
      <rect x="27" y="103" width="60" height="3" rx="1.5" fill="#FFFFFF" />

      {/* Glass Surface Reflections */}
      <rect x="28" y="38" width="58" height="66" rx="5" fill="url(#glassShine)" />

      {/* Overflowing Foamy Head on Top */}
      {/* Cloud-like Creamy Foam */}
      <path
        d="M24 38 C20 28, 30 18, 42 22 C48 14, 62 14, 68 20 C76 16, 88 22, 88 32 C92 34, 94 42, 88 46 C84 48, 80 46, 76 42 C72 44, 66 42, 64 38 C60 42, 52 42, 48 38 C44 42, 38 44, 34 40 C30 46, 22 46, 24 38 Z"
        fill="#FFFFFF"
      />
      {/* Foam Drips down the glass */}
      <path d="M30 38 Q32 52 35 46 Q38 40 40 38" fill="#FFFFFF" />
      <path d="M46 38 Q48 56 51 50 Q54 42 56 38" fill="#FFFFFF" />
      <path d="M72 38 Q74 48 76 44" fill="#FFFFFF" />

      {/* Droplet falling */}
      <circle cx="34" cy="58" r="1.5" fill="#FFFFFF" opacity="0.9" />

      {/* Foam Shading / 3D Highlights */}
      <circle cx="44" cy="24" r="4" fill="#FEF3C7" opacity="0.5" />
      <circle cx="64" cy="22" r="5" fill="#FEF3C7" opacity="0.5" />
      <circle cx="80" cy="28" r="3.5" fill="#FEF3C7" opacity="0.5" />
    </g>
  </svg>
);

// 9 Custom Stickers Catalog Definition
export const USER_IMAGE_STICKERS: CustomStickerItem[] = [
  {
    id: 'sticker_melt_heart',
    name: '融化心心',
    label: '融化心心',
    category: '3d_glossy',
    render: (size = 56, className = '') => <MeltHeartSticker size={size} className={className} />,
  },
  {
    id: 'sticker_purple_cry',
    name: '爆哭紫脸',
    label: '爆哭紫脸',
    category: '3d_glossy',
    render: (size = 56, className = '') => <PurpleCrySticker size={size} className={className} />,
  },
  {
    id: 'sticker_poop_cute',
    name: '可爱便便',
    label: '可爱便便',
    category: '3d_glossy',
    render: (size = 56, className = '') => <PoopCuteSticker size={size} className={className} />,
  },
  {
    id: 'sticker_blue_eyes',
    name: '灵动大眼',
    label: '灵动大眼',
    category: '3d_glossy',
    render: (size = 56, className = '') => <BlueEyesSticker size={size} className={className} />,
  },
  {
    id: 'sticker_pink_lips',
    name: '唇齿HELLO',
    label: '唇齿HELLO',
    category: '3d_glossy',
    render: (size = 56, className = '') => <PinkLipsSticker size={size} className={className} />,
  },
  {
    id: 'sticker_flame_buddy',
    name: '活力小火',
    label: '活力小火',
    category: '3d_glossy',
    render: (size = 56, className = '') => <FlameBuddySticker size={size} className={className} />,
  },
  {
    id: 'sticker_purple_thumb',
    name: '紫色点赞',
    label: '紫色点赞',
    category: '3d_glossy',
    render: (size = 56, className = '') => <PurpleThumbSticker size={size} className={className} />,
  },
  {
    id: 'sticker_squirrel_acorn',
    name: '抱橡果松鼠',
    label: '抱果松鼠',
    category: '3d_glossy',
    render: (size = 56, className = '') => <SquirrelAcornSticker size={size} className={className} />,
  },
  {
    id: 'sticker_frothy_beer',
    name: '泡沫啤酒',
    label: '泡沫啤酒',
    category: '3d_glossy',
    render: (size = 56, className = '') => <FrothyBeerSticker size={size} className={className} />,
  },
];

export const STICKER_MAP: Record<string, CustomStickerItem> = Object.fromEntries(
  USER_IMAGE_STICKERS.map((st) => [st.id, st]),
);

export function isCustomSticker(val: string): boolean {
  return Boolean(STICKER_MAP[val]);
}

export function renderCustomSticker(id: string, size = 56, className = ''): React.ReactNode | null {
  const item = STICKER_MAP[id];
  if (!item) return null;
  return item.render(size, className);
}
