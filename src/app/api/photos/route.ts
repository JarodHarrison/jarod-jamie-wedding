import { NextResponse } from "next/server";
import { fetchWeddingWallPhotos } from "@/lib/wedding-photo-wall";
import { WEDDING_HASHTAG } from "@/lib/photos";

export async function GET() {
  const photos = await fetchWeddingWallPhotos({ uploadsOnlyApproved: true });
  const configured = Boolean(
    process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID,
  );

  return NextResponse.json({
    hashtag: WEDDING_HASHTAG,
    photos,
    configured,
  });
}
