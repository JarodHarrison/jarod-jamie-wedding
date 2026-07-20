"use client";

import { useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { BucksConfetti } from "@/components/bucks-party/bucks-confetti";
import { glowUpPartyShareUrl } from "@/lib/glow-up-party";

export function GlowUpShareButton() {
  const [copied, setCopied] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  function explodeFromButton() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setBurstKey((k) => k + 1);
  }

  async function share() {
    explodeFromButton();

    const url =
      typeof window !== "undefined"
        ? glowUpPartyShareUrl(window.location.origin)
        : glowUpPartyShareUrl();
    const text = `✨ Pre-Wedding Glow-Up with J-rod & Jamo: snatch, glow, celebrate love.\n${url}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "J-rod & Jamo: Pre-Wedding Glow-Up",
          text,
          url,
        });
        return;
      }
    } catch {
      // fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <BucksConfetti
        fire={burstKey > 0}
        burstKey={burstKey}
        originX={origin.x}
        originY={origin.y}
        pieceCount={80}
        mode="burst"
        emojis={["✨", "💅", "💉", "🫦"]}
        className="glowup-confetti-canvas"
      />
      <button
        ref={buttonRef}
        type="button"
        onClick={() => void share()}
        className="glowup-share inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-transform active:scale-[0.98]"
      >
        <Share2 size={14} />
        {copied ? "Copied!" : "Share the glow"}
      </button>
    </>
  );
}
