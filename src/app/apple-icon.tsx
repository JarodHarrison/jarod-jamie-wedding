import { ImageResponse } from "next/og";
import { JJIconImage } from "@/lib/jj-icon-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<JJIconImage fontSize={92} ampFontSize={64} borderRadius={36} />, {
    ...size,
  });
}
