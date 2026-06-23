import { ImageResponse } from "next/og";
import { JJIconImage } from "@/lib/jj-icon-image";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<JJIconImage fontSize={18} ampFontSize={13} />, {
    ...size,
  });
}
