"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type ImageLightboxProps = {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
};

export function ImageLightbox({ open, src, alt, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <div
        className="flex shrink-0 items-center justify-between px-4 py-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <p className="truncate pr-4 text-xs font-bold uppercase tracking-widest text-white/70">{alt}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white/80 hover:bg-white/10"
          aria-label="Close full screen image"
        >
          <X size={20} />
        </button>
      </div>
      <div
        className="relative min-h-0 flex-1 p-4"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="mx-auto h-full max-h-full w-full object-contain" />
      </div>
    </div>
  );
}
