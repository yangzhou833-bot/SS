import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { isCustomSticker, renderCustomSticker } from './chat/StickerCatalog';

export interface FlyParticle {
  id: string;
  emoji: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size?: number;
  rotation?: number;
  duration?: number;
}

export interface FountainParticle {
  id: string;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  rotate: number;
}

export interface EmissionRing {
  id: string;
  x: number;
  y: number;
}

export interface EmojiFlyEffectHandle {
  spawnFly: (params: {
    emoji: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    size?: number;
  }) => void;
  spawnHeartFountain: (x: number, y: number, emoji?: string) => void;
  spawnBurstAt: (x: number, y: number, emoji: string, count?: number) => void;
  spawnEmissionBurst: (x: number, y: number, emoji: string) => void;
}

export const EmojiFlyEffect = forwardRef<EmojiFlyEffectHandle, {}>((_, ref) => {
  const [flyParticles, setFlyParticles] = useState<FlyParticle[]>([]);
  const [fountainParticles, setFountainParticles] = useState<FountainParticle[]>([]);
  const [emissionRings, setEmissionRings] = useState<EmissionRing[]>([]);

  // 1. Arc fly from Point A to Point B with cubic-bezier elastic curve
  const spawnFly = useCallback(
    ({
      emoji,
      fromX,
      fromY,
      toX,
      toY,
      size = 34,
    }: {
      emoji: string;
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      size?: number;
    }) => {
      const id = `fly-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newParticle: FlyParticle = {
        id,
        emoji,
        startX: fromX,
        startY: fromY,
        targetX: toX,
        targetY: toY,
        size,
        rotation: (Math.random() - 0.5) * 40,
        duration: 0.58,
      };

      setFlyParticles((prev) => [...prev, newParticle]);

      // Remove after animation finishes
      setTimeout(() => {
        setFlyParticles((prev) => prev.filter((p) => p.id !== id));
      }, 700);
    },
    [],
  );

  // 2. Double-tap heart/emoji fountain at coordinate
  const spawnHeartFountain = useCallback((x: number, y: number, emoji: string = '❤️') => {
    const count = 7;
    const now = Date.now();
    const newItems: FountainParticle[] = Array.from({ length: count }, (_, i) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2; // upwards spread
      const speed = 65 + Math.random() * 85;
      return {
        id: `fountain-${now}-${i}-${Math.random()}`,
        emoji,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        scale: 0.8 + Math.random() * 0.6,
        rotate: (Math.random() - 0.5) * 60,
      };
    });

    setFountainParticles((prev) => [...prev, ...newItems]);

    setTimeout(() => {
      const idsToRemove = new Set(newItems.map((item) => item.id));
      setFountainParticles((prev) => prev.filter((p) => !idsToRemove.has(p.id)));
    }, 900);
  }, []);

  // 3. Radial burst at coordinate (e.g. when reaction hits) with spring cubic-bezier trajectory
  const spawnBurstAt = useCallback((x: number, y: number, emoji: string, count: number = 8) => {
    const now = Date.now();
    const newItems: FountainParticle[] = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 45 + Math.random() * 55;
      return {
        id: `burst-${now}-${i}-${Math.random()}`,
        emoji: i % 2 === 0 ? emoji : '✨',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        scale: 0.7 + Math.random() * 0.5,
        rotate: (Math.random() - 0.5) * 90,
      };
    });

    setFountainParticles((prev) => [...prev, ...newItems]);

    setTimeout(() => {
      const idsToRemove = new Set(newItems.map((item) => item.id));
      setFountainParticles((prev) => prev.filter((p) => !idsToRemove.has(p.id)));
    }, 800);
  }, []);

  // 4. Instant emission burst at source button when tapping or releasing emojis
  const spawnEmissionBurst = useCallback((x: number, y: number, emoji: string) => {
    const now = Date.now();
    const ringId = `ring-${now}-${Math.random()}`;
    setEmissionRings((prev) => [...prev, { id: ringId, x, y }]);
    setTimeout(() => {
      setEmissionRings((prev) => prev.filter((r) => r.id !== ringId));
    }, 500);

    const microCount = 5;
    const microParticles: FountainParticle[] = Array.from({ length: microCount }, (_, i) => {
      const angle = (i / microCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = 25 + Math.random() * 35;
      return {
        id: `micro-${now}-${i}-${Math.random()}`,
        emoji: i % 2 === 0 ? '✨' : emoji,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        scale: 0.5 + Math.random() * 0.4,
        rotate: (Math.random() - 0.5) * 45,
      };
    });

    setFountainParticles((prev) => [...prev, ...microParticles]);
    setTimeout(() => {
      const idsToRemove = new Set(microParticles.map((item) => item.id));
      setFountainParticles((prev) => prev.filter((p) => !idsToRemove.has(p.id)));
    }, 650);
  }, []);

  useImperativeHandle(ref, () => ({
    spawnFly,
    spawnHeartFountain,
    spawnBurstAt,
    spawnEmissionBurst,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none">
      {/* 0. Expanding Emission Shockwave Rings */}
      <AnimatePresence>
        {emissionRings.map((r) => (
          <motion.div
            key={r.id}
            initial={{
              x: r.x - 24,
              y: r.y - 24,
              scale: 0.2,
              opacity: 0.8,
            }}
            animate={{
              scale: 2.2,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            style={{
              position: 'absolute',
              width: '48px',
              height: '48px',
              borderRadius: '9999px',
              border: '2px solid rgba(24, 119, 242, 0.65)',
              boxShadow: '0 0 16px rgba(24, 119, 242, 0.35)',
            }}
          />
        ))}
      </AnimatePresence>

      {/* 1. Arc Flying Particles */}
      <AnimatePresence>
        {flyParticles.map((p) => {
          // Calculate midpoint for parabolic arc curve
          const midX = (p.startX + p.targetX) / 2 + (p.targetX > p.startX ? 28 : -28);
          const midY = Math.min(p.startY, p.targetY) - 60;

          return (
            <motion.div
              key={p.id}
              initial={{
                x: p.startX,
                y: p.startY,
                scale: 0.3,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                x: [p.startX, midX, p.targetX],
                y: [p.startY, midY, p.targetY],
                scale: [0.35, 1.62, 0.92, 1.1, 1],
                opacity: [0, 1, 1, 1, 0.92],
                rotate: [0, p.rotation || 20, -6, 0],
              }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{
                duration: p.duration || 0.58,
                times: [0, 0.32, 0.68, 0.88, 1],
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{
                position: 'absolute',
                fontSize: `${p.size || 34}px`,
                lineHeight: 1,
                willChange: 'transform, opacity',
                filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.22))',
              }}
            >
              {isCustomSticker(p.emoji) ? (
                <div className="flex items-center justify-center">
                  {renderCustomSticker(p.emoji, p.size || 34)}
                </div>
              ) : (
                <span>{p.emoji}</span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* 2. Fountain & Burst Particles */}
      <AnimatePresence>
        {fountainParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.x,
              y: p.y,
              scale: 0.2,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              x: p.x + p.vx,
              y: p.y + p.vy,
              scale: [0.2, p.scale * 1.2, p.scale],
              opacity: [0, 1, 0.85, 0],
              rotate: p.rotate,
            }}
            transition={{
              duration: 0.7,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            style={{
              position: 'absolute',
              fontSize: '20px',
              lineHeight: 1,
              willChange: 'transform, opacity',
              filter: 'drop-shadow(0 2px 8px rgba(24, 119, 242, 0.3))',
            }}
          >
            {isCustomSticker(p.emoji) ? (
              <span className="inline-flex items-center justify-center">
                {renderCustomSticker(p.emoji, 24)}
              </span>
            ) : (
              <span>{p.emoji}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

EmojiFlyEffect.displayName = 'EmojiFlyEffect';
