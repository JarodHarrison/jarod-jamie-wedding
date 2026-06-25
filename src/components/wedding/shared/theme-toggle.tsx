"use client";

import { Sparkles } from "lucide-react";
import { useWeddingTheme } from "@/components/wedding/hooks/use-wedding-theme";
import { theme } from "@/lib/theme";

export function ThemeToggle() {
  const { isRainbow, toggleTheme } = useWeddingTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-transform active:scale-[0.99] ${
        isRainbow ? "rainbow-theme-toggle-on" : "bg-white/60"
      }`}
      style={{ borderColor: theme.border }}
      aria-pressed={isRainbow}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${isRainbow ? "rainbow-icon-chip" : ""}`}
          style={isRainbow ? undefined : { backgroundColor: theme.btnDark, color: theme.gold }}
        >
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: theme.textDark }}>
            Rainbow mode
          </p>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">
            {isRainbow ? "Sparkles on — fabulous" : "Optional pride sparkle"}
          </p>
        </div>
      </div>
      <span
        className={`relative h-7 w-12 rounded-full transition-colors ${isRainbow ? "rainbow-toggle-track" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            isRainbow ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
