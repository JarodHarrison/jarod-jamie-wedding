import { NextResponse } from "next/server";
import { getBucksPartyConfig } from "@/lib/bucks-party-config-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const event = await getBucksPartyConfig();
    return NextResponse.json(
      { event },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Bucks config GET error:", error);
    return NextResponse.json({ error: "Failed to load bucks party details." }, { status: 500 });
  }
}
