"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  spin: number;
  gold: boolean;
};

const PRIDE_HUES = [0, 30, 55, 120, 220, 280];
const GOLD_HUES = [42, 48, 38];

type BucksGlitterTrailProps = {
  /** Multiplier for sparkle size (1 = default). */
  sizeScale?: number;
  /** Mix gold glitter into the pride trail. */
  includeGold?: boolean;
  className?: string;
};

export function BucksGlitterTrail({
  sizeScale = 1,
  includeGold = false,
  className = "bucks-glitter-canvas",
}: BucksGlitterTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let particles: Particle[] = [];
    let raf = 0;
    let lastSpawn = 0;
    let hueIndex = 0;
    let width = 0;
    let height = 0;

    const palette = includeGold
      ? [...PRIDE_HUES, ...GOLD_HUES, ...GOLD_HUES]
      : PRIDE_HUES;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    const spawn = (x: number, y: number, burst = 1) => {
      const now = performance.now();
      if (now - lastSpawn < 16 && burst === 1) return;
      lastSpawn = now;

      const count = burst;
      for (let i = 0; i < count; i++) {
        if (particles.length > 90) particles.shift();
        const hue = palette[hueIndex % palette.length];
        hueIndex += 1;
        const gold = includeGold && GOLD_HUES.includes(hue);
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.4 + Math.random() * 1.6;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed * 0.35,
          vy: Math.sin(angle) * speed * 0.35 - 0.4,
          life: 0,
          maxLife: 420 + Math.random() * 380,
          size: (1.2 + Math.random() * 2.8) * sizeScale,
          hue,
          spin: (Math.random() - 0.5) * 0.2,
          gold,
        });
      }
    };

    const onPointer = (event: PointerEvent) => {
      spawn(event.clientX, event.clientY, event.pointerType === "touch" ? 2 : 1);
    };

    const tick = (time: number) => {
      if (document.body.classList.contains("party-burst-active")) {
        ctx.clearRect(0, 0, width, height);
        raf = requestAnimationFrame(tick);
        return;
      }

      if (particles.length === 0) {
        ctx.clearRect(0, 0, width, height);
        raf = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      particles = particles.filter((p) => p.life < p.maxLife);

      for (const p of particles) {
        p.life += 16;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.015;
        p.vx += p.spin * 0.02;

        const t = p.life / p.maxLife;
        const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
        const sparkle = 0.55 + 0.45 * Math.sin(time * 0.02 + p.x);
        const s = p.size * (1 - t * 0.3);

        ctx.fillStyle = p.gold
          ? `hsla(${p.hue}, 90%, ${62 + sparkle * 22}%, ${alpha * 0.98})`
          : `hsla(${p.hue}, 95%, ${55 + sparkle * 25}%, ${alpha * 0.95})`;
        // No shadowBlur: was fighting the confetti canvas for GPU time
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - s);
        ctx.lineTo(p.x + s * 0.45, p.y);
        ctx.lineTo(p.x, p.y + s);
        ctx.lineTo(p.x - s * 0.45, p.y);
        ctx.closePath();
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [sizeScale, includeGold]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
