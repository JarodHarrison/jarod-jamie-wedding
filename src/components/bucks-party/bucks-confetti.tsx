"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  life: number;
  maxLife: number;
  kind: 0 | 1 | 2 | 3; // rect | spark | streak | emoji
  color: string;
  emojiIdx: number;
};

const PRIDE = ["#e40303", "#ff8c00", "#ffed00", "#008026", "#24408e", "#732982", "#e4037f"];
const GOLD = ["#fffef5", "#ffe8fb", "#ffd700", "#fff1a8"];

type BucksConfettiProps = {
  fire: boolean;
  burstKey?: number;
  originX?: number;
  originY?: number;
  className?: string;
  pieceCount?: number;
  mode?: "fountain" | "burst";
  bannerText?: string;
  bannerStyle?: "pride" | "flame";
  emojis?: string[];
};

function pausePageFx(on: boolean) {
  document.body.classList.toggle("party-burst-active", on);
}

export function BucksConfetti({
  fire,
  burstKey = 0,
  originX,
  originY,
  className = "bucks-confetti-canvas",
  pieceCount = 90,
  mode = "fountain",
  bannerText,
  bannerStyle = "pride",
  emojis,
}: BucksConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originRef = useRef({ x: originX ?? 0, y: originY ?? 0 });
  originRef.current = { x: originX ?? 0, y: originY ?? 0 };
  const emojisKey = emojis?.join("|") ?? "";
  const [banner, setBanner] = useState<{
    text: string;
    style: "pride" | "flame";
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!fire || burstKey <= 0) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let raf = 0;
    let w = 0;
    let h = 0;
    let flash = 1;
    let ctx: CanvasRenderingContext2D | null = null;
    let canvas: HTMLCanvasElement | null = null;

    const emojiPool = emojisKey ? emojisKey.split("|").filter(Boolean) : [];
    // Hard cap: density comes from size/speed, not particle spam
    const n = Math.min(Math.max(pieceCount, 60), 100);
    const pieces: Piece[] = new Array(n);
    let alive = 0;

    // Pre-render emoji sprites once (fillText every frame was a major cost)
    const emojiSprites: HTMLCanvasElement[] = [];
    for (const emoji of emojiPool) {
      const s = document.createElement("canvas");
      s.width = 64;
      s.height = 64;
      const sctx = s.getContext("2d");
      if (sctx) {
        sctx.font = '48px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
        sctx.textAlign = "center";
        sctx.textBaseline = "middle";
        sctx.fillText(emoji, 32, 34);
      }
      emojiSprites.push(s);
    }

    const ox0 = () => originRef.current.x || w * 0.5;
    const oy0 = () => originRef.current.y || h * 0.4;

    const spawn = () => {
      const ox = ox0();
      const oy = oy0();
      alive = 0;

      const emojiCount = Math.min(emojiSprites.length ? 18 : 0, n >> 2);
      const sparkCount = Math.round(n * 0.28);
      const confettiCount = n - emojiCount - sparkCount;

      for (let i = 0; i < confettiCount; i++) {
        const angle = (i / confettiCount) * Math.PI * 2 + Math.random() * 0.4;
        const speed = 10 + Math.random() * 18;
        const streak = Math.random() > 0.55;
        pieces[alive++] = {
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.5,
          w: streak ? 3 + Math.random() * 4 : 5 + Math.random() * 9,
          h: streak ? 14 + Math.random() * 18 : 7 + Math.random() * 11,
          life: 0,
          maxLife: 42 + Math.random() * 28,
          kind: streak ? 2 : 0,
          color: PRIDE[i % PRIDE.length],
          emojiIdx: -1,
        };
      }

      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 8 + Math.random() * 20;
        pieces[alive++] = {
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          rot: 0,
          vr: 0,
          w: 3 + Math.random() * 5,
          h: 3 + Math.random() * 5,
          life: 0,
          maxLife: 36 + Math.random() * 24,
          kind: 1,
          color: GOLD[i % GOLD.length],
          emojiIdx: -1,
        };
      }

      for (let i = 0; i < emojiCount; i++) {
        const angle = (i / emojiCount) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 9 + Math.random() * 14;
        const size = 26 + Math.random() * 14;
        pieces[alive++] = {
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          rot: (Math.random() - 0.5) * 0.8,
          vr: (Math.random() - 0.5) * 0.2,
          w: size,
          h: size,
          life: 0,
          maxLife: 48 + Math.random() * 22,
          kind: 3,
          color: "#fff",
          emojiIdx: i % emojiSprites.length,
        };
      }

      if (bannerText) {
        setBanner({
          text: bannerText,
          style: bannerStyle,
          x: ox,
          y: oy - 36,
        });
        window.setTimeout(() => {
          if (!cancelled) setBanner(null);
        }, 1600);
      }
    };

    const resize = () => {
      if (!canvas || !ctx) return;
      w = window.innerWidth;
      h = window.innerHeight;
      // 1x pixels: biggest FPS win on retina
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    const tick = () => {
      if (cancelled || !ctx) return;
      ctx.clearRect(0, 0, w, h);

      const ox = ox0();
      const oy = oy0();

      if (flash > 0.03) {
        ctx.globalAlpha = flash * 0.45;
        ctx.fillStyle = bannerStyle === "flame" ? "#ff6a00" : "#ff9ad5";
        ctx.beginPath();
        ctx.arc(ox, oy, 100, 0, Math.PI * 2);
        ctx.fill();
        flash *= 0.82;
      }

      let write = 0;
      for (let i = 0; i < alive; i++) {
        const p = pieces[i];
        p.life += 1;
        if (p.life >= p.maxLife || p.y > h + 40 || p.y < -60) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28;
        p.vx *= 0.985;
        p.rot += p.vr;

        const t = p.life / p.maxLife;
        const alpha = t < 0.1 ? t / 0.1 : Math.max(0, 1 - (t - 0.1) / 0.9);
        ctx.globalAlpha = alpha;

        if (p.kind === 1) {
          const s = p.w * (1.2 - t * 0.4);
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - s * 0.18, p.y - s, s * 0.36, s * 2);
          ctx.fillRect(p.x - s, p.y - s * 0.18, s * 2, s * 0.36);
        } else if (p.kind === 3 && p.emojiIdx >= 0) {
          const spr = emojiSprites[p.emojiIdx];
          const size = p.w * (1 - t * 0.15);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.drawImage(spr, -size / 2, -size / 2, size, size);
          ctx.restore();
        } else {
          // Axis-aligned rects: skip rotate for speed; still reads as confetti
          ctx.fillStyle = p.color;
          if (p.kind === 2) {
            ctx.fillRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h);
          } else {
            const rw = p.w * (0.85 + 0.15 * Math.cos(p.rot));
            ctx.fillRect(p.x - rw / 2, p.y - p.h / 2, rw, p.h);
          }
        }

        pieces[write++] = p;
      }
      alive = write;
      ctx.globalAlpha = 1;

      if (alive > 0 || flash > 0.03) {
        raf = requestAnimationFrame(tick);
      } else {
        pausePageFx(false);
        if (ctx) ctx.clearRect(0, 0, w, h);
      }
    };

    const start = () => {
      if (cancelled) return;
      canvas = canvasRef.current;
      if (!canvas) {
        raf = requestAnimationFrame(start);
        return;
      }
      ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
      if (!ctx) return;

      pausePageFx(true);
      resize();
      spawn();
      window.addEventListener("resize", resize);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(start);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      pausePageFx(false);
      setBanner(null);
    };
  }, [fire, burstKey, pieceCount, mode, bannerText, bannerStyle, emojisKey]);

  if (!fire || typeof document === "undefined") return null;

  return createPortal(
    <>
      <canvas ref={canvasRef} className={className} aria-hidden />
      {banner ? (
        <div
          className={`party-burst-banner party-burst-banner--${banner.style}`}
          style={{ left: banner.x, top: banner.y }}
          aria-hidden
        >
          {banner.text}
        </div>
      ) : null}
    </>,
    document.body,
  );
}
