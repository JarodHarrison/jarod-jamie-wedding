"use client";

import { useState } from "react";
import Image from "next/image";
import { HERO_FALLBACK, HERO_IMAGE } from "@/lib/theme";

type HeroImageProps = {
  alt: string;
  className?: string;
};

export function HeroImage({ alt, className = "object-cover" }: HeroImageProps) {
  const [src, setSrc] = useState(HERO_IMAGE);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority
      sizes="(max-width: 420px) 100vw, 420px"
      className={className}
      unoptimized={src === HERO_FALLBACK}
      onError={() => {
        if (src !== HERO_FALLBACK) setSrc(HERO_FALLBACK);
      }}
    />
  );
}
