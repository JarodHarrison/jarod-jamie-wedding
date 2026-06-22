import { NextResponse } from "next/server";
import { fetchHashtagPhotos, WEDDING_HASHTAG } from "@/lib/photos";

export async function GET() {
  const photos = await fetchHashtagPhotos();
  const configured = Boolean(
    process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID,
  );

  return NextResponse.json({
    hashtag: WEDDING_HASHTAG,
    photos,
    configured,
  });
}
