"use client";

import { useWeddingTheme } from "@/components/wedding/hooks/use-wedding-theme";

/** Classic pride flag letter colours: cycles per character (skipping spaces). */
export const PRIDE_LETTER_COLORS = [
  "#e40303",
  "#ff8c00",
  "#ffed00",
  "#008026",
  "#004dff",
  "#732982",
] as const;

/** Darker pride palette for legibility on light / pastel backgrounds. */
export const PRIDE_LETTER_COLORS_READABLE = [
  "#9b0000",
  "#a04a00",
  "#6d5800",
  "#005024",
  "#002f8a",
  "#4a1255",
] as const;

const READABLE_LETTER_SHADOW =
  "0 1px 0 rgba(255, 255, 255, 1), 0 1px 2px rgba(26, 15, 46, 0.14), 0 0 10px rgba(255, 255, 255, 0.55)";

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4"]);

type RainbowTextProps = {
  children: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p";
  /** Render pride colours even when rainbow mode is off */
  force?: boolean;
  /** Keep className colours (for titles on coloured gradient cards) */
  preserveColor?: boolean;
};

export function RainbowText({
  children,
  className = "",
  as: Tag = "span",
  force = false,
  preserveColor = false,
}: RainbowTextProps) {
  const { isRainbow } = useWeddingTheme();

  if (preserveColor || (!force && !isRainbow)) {
    return <Tag className={className}>{children}</Tag>;
  }

  let letterIndex = 0;
  const palette = PRIDE_LETTER_COLORS_READABLE;
  const headingClass = HEADING_TAGS.has(Tag) ? " font-semibold" : "";

  return (
    <Tag className={`${className}${headingClass}`} aria-label={children}>
      {children.split("").map((char, index) => {
        if (char === " ") {
          return <span key={`space-${index}`}> </span>;
        }

        const color = palette[letterIndex % palette.length];
        letterIndex += 1;

        return (
          <span
            key={`${char}-${index}`}
            style={{ color, textShadow: READABLE_LETTER_SHADOW }}
          >
            {char}
          </span>
        );
      })}
    </Tag>
  );
}
