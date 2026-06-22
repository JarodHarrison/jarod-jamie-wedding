"use client";

import { useState } from "react";
import { HERO_FALLBACK, HERO_IMAGE } from "@/lib/theme";

type HeroImageProps = {
  alt: string;
  className?: string;
};

export function HeroImage({ alt, className = "h-full w-full object-cover" }: HeroImageProps) {
  const [src, setSrc] = useState(HERO_IMAGE);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (src !== HERO_FALLBACK) setSrc(HERO_FALLBACK);
      }}
    />
  );
}
