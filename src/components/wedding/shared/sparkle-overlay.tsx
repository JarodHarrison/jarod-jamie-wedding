"use client";

import { useMemo } from "react";
import { useWeddingTheme } from "@/components/wedding/hooks/use-wedding-theme";

const SPARKLE_COUNT = 36;

export function SparkleOverlay() {
  const { isRainbow } = useWeddingTheme();

  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }, (_, index) => ({
        id: index,
        left: `${(index * 37 + 13) % 97}%`,
        top: `${(index * 53 + 9) % 94}%`,
        delay: `${(index % 6) * 0.35}s`,
        duration: `${1.6 + (index % 4) * 0.45}s`,
        size: 3 + (index % 5),
        hue: (index * 47) % 360,
      })),
    [],
  );

  if (!isRainbow) return null;

  return (
    <div className="sparkle-field" aria-hidden>
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="sparkle-dot"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: sparkle.delay,
            animationDuration: sparkle.duration,
            backgroundColor: `hsl(${sparkle.hue} 92% 68%)`,
            boxShadow: `0 0 ${sparkle.size * 3}px hsl(${sparkle.hue} 95% 62%)`,
          }}
        />
      ))}
    </div>
  );
}
