import { Lato, Pinyon_Script, Playfair_Display } from "next/font/google";

/** Primary body font — general text and UI elements (.font-sans) */
export const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

/** Primary heading font (.font-serif) */
export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

/** Cursive accent font — wedding date, decorative touches (.font-script) */
export const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: ["400"],
});

export const fontVariables = `${lato.variable} ${playfair.variable} ${pinyon.variable}`;
