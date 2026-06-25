import { ImageResponse } from "next/og";
import { JJIconImage } from "@/lib/jj-icon-image";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(<JJIconImage fontSize={96} ampFontSize={68} borderRadius={24} />, {
    width: 192,
    height: 192,
  });
}
