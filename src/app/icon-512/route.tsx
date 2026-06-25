import { ImageResponse } from "next/og";
import { JJIconImage } from "@/lib/jj-icon-image";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(<JJIconImage fontSize={256} ampFontSize={180} borderRadius={64} />, {
    width: 512,
    height: 512,
  });
}
