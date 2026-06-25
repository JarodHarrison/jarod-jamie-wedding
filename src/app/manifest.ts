import type { MetadataRoute } from "next";
import { APP_TITLE } from "@/lib/jj-branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: APP_TITLE,
    short_name: "J&J Wedding",
    description: "Jarod & Jamie — 26 September 2026",
    start_url: "/",
    scope: "/",
    display: "fullscreen",
    orientation: "portrait-primary",
    background_color: "#f7f4ee",
    theme_color: "#f7f4ee",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
