"use client";

import { useWeddingTheme } from "@/components/wedding/hooks/use-wedding-theme";

type ThemeEmojiToggleProps = {
  className?: string;
};

export function ThemeEmojiToggle({ className }: ThemeEmojiToggleProps) {
  const { isRainbow, toggleTheme } = useWeddingTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`rounded-full p-2 text-lg leading-none transition-transform hover:bg-black/5 active:scale-95 ${className ?? ""}`}
      aria-pressed={isRainbow}
      aria-label={isRainbow ? "Switch back to classic theme" : "Enable pride sparkle theme"}
      title={isRainbow ? "Back to classic" : "Pride sparkle mode"}
    >
      <span aria-hidden="true">{isRainbow ? "🥂" : "🌈"}</span>
    </button>
  );
}
